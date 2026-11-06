# danieltombay/siliconshield-rtl-contract-1

## Resumen

SiliconShield-RTL Contract-1 es un modelo de decisión especializado en evaluación de seguridad de código RTL (Verilog/SystemVerilog) condicionada por especificación. Lo desarrolla el usuario danieltombay y se publica como un fine-tune del modelo base convaiinnovations/laya. El modelo recibe una región RTL autocontenida, un requisito de seguridad en inglés y un conjunto explícito de asunciones de ejecución, y devuelve una decisión estructurada entre tres etiquetas: `satisfies_requirement`, `violates_requirement` o `insufficient_context`.

La relevancia del modelo radica en su enfoque de inferencia local: los diseños de hardware son material sensible y el modelo está pensado para ejecutarse en el hardware del usuario sin enviar RTL a servicios externos. Se posiciona como una herramienta de triaje que ayuda a priorizar simulación, verificación formal y revisión manual, no como un sustituto de estas.

Con 436 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware modesto. Su pipeline declarado es `text-classification` y utiliza la librería `laya`. La licencia figura como "other" y el propio autor indica que la licencia de release está pendiente de confirmación, por lo que no debe tratarse como licencia concedida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de convaiinnovations/laya; adaptadores residuales de rango 256 en 28 capas) |
| Parámetros totales | 436.031.238 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible como contexto general; presupuestos de entrada: max_len 1536, head_max_len 256 |
| Tipos de cuantización | no disponible (evaluación en BF16; repo en safetensors) |
| Idiomas soportados | no disponible (requisitos de entrada en inglés) |
| Licencia | other (licencia de release pendiente de confirmación por el propietario) |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Librería | laya |
| Modelo base | convaiinnovations/laya |
| Tamaño del repo | 1.7 GB |
| SHA-256 de pesos | f4130223ed19be5cc7e21b3da70cb7aebf944ad6ed4a8a80f11d8f59bcd05ee7 |
| Contrato de pregunta | siliconshield-requirement-context-v1 |
| SHA-256 del contrato | dd1f38ee223abac1f75b19d9086fd26d90865c9aa43097674fffdd61dbbf8bd3 |
| Metadatos de adaptador | 28 capas de adaptador residual, rango 256, escala 8 |
| Precisión de evaluación | inferencia BF16, probabilidades y métricas en FP32 |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo base convaiinnovations/laya en la información proporcionada. El modelo se presenta como un fine-tune con 28 capas de adaptador residual de rango 256 y escala 8, lo que indica una adaptación de bajo rango sobre el modelo fundacional. Los parámetros totales reportados en safetensors son 436.031.238.

El entrenamiento está orientado a una tarea de clasificación de tres clases condicionada por contexto: el modelo recibe un requisito de seguridad, asunciones de ejecución y una región RTL, y produce una decisión estructurada. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La model card menciona que la evaluación se realizó sobre "familias de desarrollo balanceadas y disjuntas por grupo", lo que sugiere una separación por familias de diseño para evitar fugas de datos, pero no se detalla la metodología de entrenamiento.

## Capacidades

- Clasificación de seguridad RTL en tres clases: `satisfies_requirement`, `violates_requirement` e `insufficient_context`.
- Evaluación condicionada por especificación: requiere un requisito de seguridad explícito en inglés y asunciones de ejecución.
- Detección de violaciones en rutas de escritura con bloqueo (lock-gated write paths), controles privilegiados o autorizados antes de actualizaciones de registro, exención explícita de reset en requisitos de retención, y tratamiento diferenciado de rutas normales y de depuración.
- Inferencia local: el modelo se ejecuta en el hardware del usuario, manteniendo los diseños sensibles fuera de servicios externos.
- Salida estructurada con puntuaciones de las tres opciones y etiqueta ganadora.
- No soporta tool calling ni function calling según la información disponible.
- No se documentan capacidades de agente, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües: no disponibles; los requisitos de entrada se formulan en inglés.

## Casos de uso

- Triaje de seguridad en bloques RTL antes de simulación: el modelo evalúa una región RTL contra un requisito de seguridad y asunciones dadas, permitiendo priorizar qué bloques requieren simulación o verificación formal adicional. Es adecuado porque reduce el espacio de revisión manual en diseños grandes.
- Revisión de rutas de escritura privilegiada: el modelo está entrenado para detectar si un control de autorización precede correctamente a una actualización de registro. Se usaría para filtrar candidatos antes de una revisión formal.
- Verificación de requisitos de reset y retención: dado un requisito que exime el reset de una condición de retención, el modelo puede señalar inconsistencias en el RTL. Útil en revisiones de especificación frente a implementación.
- Auditoría de rutas de depuración: el modelo distingue entre rutas normales y de depuración, lo que permite revisar si los controles de seguridad se aplican de forma consistente en ambos caminos.
- Pre-filtrado en pipelines de verificación formal: las decisiones del modelo pueden usarse para seleccionar qué propiedades formalizar primero, reduciendo el coste de las herramientas formales.
- Evaluación local de diseños confidenciales: al ejecutarse en hardware propio, permite evaluar RTL propietario sin exponerlo a APIs de terceros, cumpliendo requisitos de confidencialidad.
- Priorización de revisiones en equipos de hardware security: el modelo genera una señal de triaje que ayuda a asignar esfuerzo de revisión humana donde hay mayor probabilidad de violación.

## Benchmarks y rendimiento

| Métrica | Contract-1 |
|---|---:|
| Decisiones completamente especificadas | 191 de 192 (99,48 %) |
| Casos que satisfacen | 96 de 96 (100 %) |
| Casos que violan | 95 de 96 (98,96 %) |
| Falsos seguros en violaciones | 0 de 96 |
| Precisión tres vías completa | 257 de 288 (89,24 %) |
| Cualificación contrabalanceada | 249 de 288 (86,46 %) |
| Falsos seguros en cualificación contrabalanceada | 0 de 96 violaciones |
| Evaluación desplazada | 330 de 756 (43,65 %) |
| Falsos seguros en evaluación desplazada | 25 |
| Retención amplia | 3682 de 4095 |

No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 436 millones de parámetros, en BF16 los pesos ocupan aproximadamente 0,87 GB; en FP32, unos 1,74 GB. Añadiendo overhead de activaciones y contexto (max_len 1536), se estima un consumo total en torno a 2-4 GB en BF16.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM debería ser suficiente (por ejemplo, RTX 3060, RTX 4060, RTX 4090). Para despliegues en servidor, A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU consumer: sí, en la mayoría de GPUs consumer modernas con 6 GB o más de VRAM.
- Opciones de despliegue: la librería declarada es `laya`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible. El autor menciona una "interfaz de carga publicada" sin detallar el runtime exacto.
- Latencia y throughput: no disponibles. La model card advierte que las decisiones marginales pueden diferir entre hardware aunque la identidad del modelo sea la misma, por lo que las afirmaciones reproducibles deben especificar runtime, precisión, contrato, checkpoint y población.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (clasificación de seguridad RTL condicionada por especificación) en la documentación proporcionada. El modelo es un fine-tune especializado sobre convaiinnovations/laya, pero no se ofrecen datos de rendimiento de ese modelo base en esta tarea ni de alternativas.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SiliconShield-RTL Contract-1 | 436 M | max_len 1536 (entrada) | Clasificación de seguridad RTL | other (pendiente) | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no confirmada: la licencia de release está pendiente de confirmación por el propietario. No debe tratarse el archivo como licencia concedida; los términos upstream del modelo base y del material derivado siguen aplicando en revisiones fijadas.
- No es una prueba de violación: el modelo no demuestra la violación ni acepta la reparación. La conclusión del flujo SiliconShield combina la evaluación del modelo, comprobaciones ejecutables, una propuesta de reparación y verificación posterior al parche.
- Envolvente de funcionamiento limitada: la evaluación desplazada cae al 43,65 % con 25 falsos seguros, lo que indica degradación fuera de la distribución de desarrollo.
- Manejo de contexto insuficiente: la model card identifica el manejo de `insufficient_context` como área de mejora activa.
- Precisión de bloqueo y revisión de autorización multi-ruta: identificadas como áreas de mejora activas.
- Amplitud de representación y calibración: pendientes de mejora.
- Fuera de alcance: aceptación no supervisada de hardware crítico para seguridad, descubrimiento amplio, clasificación CWE, localización, puntuaciones de riesgo calibradas y aprobación automática de parches.
- Riesgo de alucinación: no cuantificado en la información disponible, pero el modelo es un clasificador de decisión, no un generador; el riesgo se manifiesta como falsos seguros o falsos positivos.
- Idiomas: los requisitos deben formularse en inglés; no se documentan otros idiomas.
- Reproducibilidad: las decisiones marginales pueden diferir entre hardware; las afirmaciones reproducibles deben especificar runtime, precisión, contrato, checkpoint y población.
- Sesgos: no documentados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/danieltombay/siliconshield-rtl-contract-1
- Modelo base: https://huggingface.co/convaiinnovations/laya
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
