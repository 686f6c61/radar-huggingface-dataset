# mvbalaji/wsp-typed-policy-100

## Resumen

`wsp-typed-policy-100` es un artefacto de investigación publicado por el autor independiente mvbalaji en Hugging Face. No es un modelo de lenguaje entrenado, sino un par de redes neuronales pequeñas (148.761 y 155.511 parámetros) cuyos pesos han sido **construidos por un compilador determinista**, no aprendidos por descenso de gradiente. Cada red ejecuta de forma exacta una política de decisión tipada de 100 reglas y devuelve, junto a la decisión, el identificador de la regla que la ha producido. Forma parte del estudio Weight-Space Programming (WSP) v3.

El repositorio contiene dos artefactos: `invoice_R100.safetensors`, que implementa una política sintética de aprobación de facturas y compras con cuatro decisiones posibles (approve, escalate, reject, hold) y 29 entradas, y `access_R100.safetensors`, que implementa una política de control de acceso basado en atributos con cuatro salidas (allow, deny, step_up, review) y 38 entradas. Ambos se distribuyen en formato safetensors, sin código ejecutable ni pickle, con metadatos de esquema, versión de política y hash de pesos.

Su relevancia es conceptual más que práctica: demuestra que una red neuronal afín con activaciones ReLU puede codificar una política de reglas determinista, verificable estructuralmente y auditable, con latencias de decenas de microsegundos en CPU. El propio autor advierte que las políticas son sintéticas y que los modelos no deben usarse para decisiones reales de aprobación de facturas o control de acceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal afín con activaciones ReLU, 3 capas ocultas y dos cabezas lineales (decisión y regla) |
| Parametros totales | 148.761 (`invoice_R100`) / 155.511 (`access_R100`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; la entrada es un registro tabular de 29 o 38 campos) |
| Tipos de cuantizacion | No disponible (pesos en float64; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (10 tensores float64 + metadatos de cadena) |

## Arquitectura y entrenamiento

La red es un perceptrón multicapa completamente conectado con tres capas ocultas ReLU y dos cabezas lineales. Para R = 100 reglas, las dimensiones son D → 750 → 125 → 126, con una cabeza de decisión de tamaño 4 y una cabeza de regla de tamaño 126 (100 reglas más 25 ranuras de reserva para futuras inserciones). La decisión se obtiene como `argmax(Wd h3 + bd)` y el identificador de regla como `slot_table[argmax(Wa h3 + ba)]`. Los pesos son float64, lo que permite aritmética exacta sobre enteros.

No hay entrenamiento: los pesos se generan mediante un compilador determinista que traduce cada condición de la política a un par de ReLU que implementa un test exacto 0/1 sobre enteros (por ejemplo, `q > T` se convierte en `ReLU(q−T) − ReLU(q−T−1)`). Una tercera capa calcula la conjunción (AND) de las condiciones de cada regla y una cuarta impone la prioridad de primera coincidencia. El autor indica que la verificación estructural se superó leyendo únicamente los pesos y demostrando en aritmética exacta el comportamiento de la política; el texto de la model card se interrumpe en ese punto, por lo que no se detallan los resultados completos de la verificación.

Los metadatos de cadena incluyen el esquema tipado (tipos de campo, rangos, reglas de valores ausentes y escalas de entrada en potencias de dos), los nombres de acciones, la tabla de ranuras, el identificador y versión de política, el hash semántico y los hashes del modelo y de los pesos. El runtime `wsp_runtime.py` comprueba el hash de los pesos en cada carga.

## Capacidades

- Clasificación tabular determinista: dado un registro con un esquema tipado, devuelve una acción entre cuatro posibles y el identificador de la regla que la ha disparado.
- Validación de esquema: rechaza registros fuera de rango o con tipos incorrectos mediante `SchemaError` (por ejemplo, `amount_inr` fuera de [1, 100.000.000]).
- Soporte de valores nulos explícitos en campos como `tax_id_verified`, con reglas de valor ausente definidas en el esquema.
- Inferencia por lotes mediante `predict_many`, con throughput medido de aproximadamente 47.439 decisiones por segundo en CPU monohilo (10.000 decisiones en 0,21 s, incluyendo validación y codificación).
- Trazabilidad: cada predicción devuelve `rule_id`, `policy_version` y `model_hash`, lo que permite registrar cada decisión en un `audit_log.jsonl`.
- Integración como componente "System One": el ejemplo `system1_example.py` enruta las decisiones aprobadas directamente, las retenidas y escaladas a colas de revisión y los registros inválidos a una cola de calidad de datos.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Enrutamiento de aprobación de facturas en un prototipo de investigación: el modelo `invoice_R100` clasifica cada factura en approve, escalate, reject o hold y devuelve la regla aplicada, lo que permite construir un flujo con colas separadas (`auto_pay`, `hold_queue`, `system2_review`) sin escribir un intérprete de reglas en tiempo de predicción.
- Control de acceso basado en atributos en entornos de laboratorio: el modelo `access_R100` evalúa 38 atributos de contexto y devuelve allow, deny, step_up o review, con la regla concreta que ha motivado la decisión para su revisión posterior.
- Auditoría y cumplimiento en sistemas de decisión: al devolver `policy_version` y `model_hash` en cada predicción, es posible reconstruir qué versión de la política decidió cada caso y demostrar la correspondencia entre la política documentada y los pesos desplegados.
- Investigación sobre verificación de redes neuronales: los modelos sirven como banco de pruebas para técnicas de verificación estructural que leen solo los pesos y demuestran propiedades de la política en aritmética exacta.
- Docencia sobre Weight-Space Programming: el par de modelos y los ficheros `*.policy.txt` y `*.policy.json` permiten comparar la política legible, su DSL formal y su compilación a pesos, y comprobar que las tres representaciones coinciden.
- Puerta de decisión de baja latencia en CPU: con latencias de entre 8 y 242 microsegundos por registro en un solo hilo, el modelo puede actuar como filtro rápido delante de un agente LLM que solo recibe los casos enrutados a revisión.
- Generación de datos de prueba para pipelines de decisión: los registros de ejemplo y las reglas permiten construir conjuntos de prueba etiquetados con la regla esperada (`INV-001`, `INV-002`, `INV-003`, `DEFAULT`) para validar integraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye mediciones de latencia y throughput en CPU monohilo, presentadas por el autor como ilustrativas y dependientes de una única máquina:

| Metrica | Valor |
|---|---|
| Latencia por decision (caso retenido, `INV-008`) | 241,8 us |
| Latencia por decision (caso escalado, `INV-002`) | 49,8 us |
| Latencia por decision (caso aprobado, `DEFAULT`) | 44,1 us |
| Latencia por registro invalido | 8,3 us |
| Throughput por lotes | 10.000 decisiones en 0,21 s (47.439/s, con validacion y codificacion) |

## Requisitos de hardware

- Inferencia exclusivamente en CPU: los modelos ocupan 1,20 MB y 1,25 MB en disco, con 148.761 y 155.511 parámetros en float64.
- VRAM: no requiere GPU; el consumo de memoria es del orden de unos pocos megabytes, muy por debajo de cualquier GPU de consumo.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en entornos sin GPU; no se documentan requisitos específicos de GPU.
- Dependencias de despliegue: solo `numpy` y `safetensors`, más el runtime `wsp_runtime.py` proporcionado por el autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: los indicados en la sección anterior, medidos en CPU monohilo y sin garantía de reproducibilidad en otras máquinas.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (redes compiladas que ejecutan políticas de reglas tipadas). Las alternativas habituales para este tipo de decisión serían motores de reglas deterministas o árboles de decisión, pero no se dispone de datos de rendimiento comparables en la documentación.

## Limitaciones y advertencias

- Los modelos son **ilustrativos y solo para investigación**: las políticas se generaron de forma sintética y el autor prohíbe explícitamente su uso para decisiones reales de aprobación de facturas o control de acceso.
- No son modelos de lenguaje: no generan texto, no razonan, no soportan tool calling ni agentes, y no tienen capacidades multilingües.
- La cobertura de la política está limitada a las 100 reglas compiladas y a los campos del esquema; los registros que no encajan en el esquema se rechazan con `SchemaError` en lugar de clasificarse.
- El texto de la model card está truncado en la sección de verificación, por lo que no se dispone de los resultados completos de la verificación estructural ni de posibles limitaciones adicionales declaradas por el autor.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero la advertencia del autor sobre su naturaleza sintética limita su utilidad en producción real.
- Los tiempos de latencia y throughput proceden de una única máquina y el propio autor los califica de ilustrativos; no deben tomarse como garantías de rendimiento.
- El repositorio no tiene descargas ni likes y fue creado y actualizado el mismo día (7 de noviembre de 2026), por lo que no hay evidencia de uso o validación por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvbalaji/wsp-typed-policy-100
- Perfil del autor en Hugging Face: https://huggingface.co/mvbalaji/models
- Sitio web del autor: https://mvbalaji.com/
