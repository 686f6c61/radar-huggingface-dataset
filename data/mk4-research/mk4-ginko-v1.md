# MK4-Research/MK4-Ginko-v1

## Resumen

MK4-Ginko-v1 es un modelo de lenguaje especializado en auditoría de seguridad de código, desarrollado por MK4-Research. Se basa en Qwen3.8-27B, al que se le ha fusionado un adaptador LoRA y se ha cuantizado a 4 bits en formato MLX, de modo que no requiere adaptador en inferencia. Su propósito es resolver un fallo concreto detectado en su predecesor: la tendencia a declarar vulnerabilidades críticas en código correctamente protegido, ignorando los guards (comprobaciones de seguridad) que lo defienden.

El modelo está entrenado para evaluar una única función a la vez, no un repositorio completo, y produce un veredicto más fiable que el modelo base en esa tarea específica. Con 27 000 millones de parámetros (aunque el archivo safetensors reporta 4 204 731 904, posiblemente por la cuantización), una ventana de contexto no especificada y licencia Apache 2.0, se presenta como una herramienta de nicho para revisión de código en entornos de seguridad. Su relevancia radica en abordar un problema real de los modelos de seguridad: distinguir entre código vulnerable y código que parece vulnerable pero está bien defendido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.8-27B) |
| Parametros totales | 27B (modelo base); safetensors reporta 4 204 731 904 (posible error de metadata) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificada en la documentacion |
| Tipos de cuantizacion | 4-bit MLX |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer de 27 000 millones de parametros, sobre el que se ha aplicado un adaptador LoRA que posteriormente se ha fusionado con los pesos base. El resultado se ha cuantizado a 4 bits en formato MLX, optimizado para inferencia en hardware Apple Silicon. No se requieren adaptadores adicionales en tiempo de inferencia.

El entrenamiento se realizó sobre 367 filas de trazas de razonamiento, extraídas del propio modelo base y conservadas únicamente cuando el base alcanzaba el veredicto correcto según la verdad de campo. Aproximadamente el 44 % de esas filas corresponden a código correctamente implementado que parece peligroso, lo que explica el enfoque del modelo en distinguir falsos positivos. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; el ajuste es exclusivamente mediante LoRA sobre un conjunto de datos pequeño y curado.

## Capacidades

- Revisión de seguridad de código: decide si una función concreta es vulnerable o no, prestando especial atención a los guards que protegen operaciones peligrosas.
- Detección de falsos positivos: identifica código correctamente defendido que otros modelos marcarían como vulnerable (por ejemplo, comparaciones con `hmac.compare_digest`, conexiones TLS con contexto fijado, confinamiento de rutas con `realpath` y `commonpath`).
- Razonamiento sobre mecanismos de protección: explica el mecanismo real que hace seguro o inseguro un fragmento (resolución de symlinks, comprobación de peer loopback, filtros de IP global).
- Generación de respuestas concisas: longitud media de 121 tokens frente a los 203 del modelo base, lo que reduce ruido en las respuestas.
- Limitación operativa: solo analiza una función a la vez; dado un archivo completo, reporta un único hallazgo y se detiene. Esta limitación es inherente al entrenamiento y no se puede superar mediante prompting.

## Casos de uso

- Auditoría de funciones individuales en revisiones de código: un desarrollador de seguridad puede pasar una función sospechosa al modelo para obtener un veredicto sobre si el guard que la protege es efectivo o no, antes de decidir si abre un ticket.
- Validación de parches de seguridad: al corregir una vulnerabilidad, se puede verificar que el nuevo guard cubre realmente el valor que llega al sink, evitando falsas sensaciones de seguridad.
- Análisis de código legacy con apariencia peligrosa: funciones que usan primitivas como `rmtree`, `send_file` o comparaciones de tokens pueden evaluarse para confirmar si el guard existente (por ejemplo, un allowlist o una comprobación de longitud) es suficiente.
- Formación de equipos de seguridad: el modelo puede usarse como herramienta didáctica para mostrar por qué un guard no protege el valor correcto (por ejemplo, cuando se comprueba `thumb` pero se sirve `name`).
- Integración en pipelines de CI/CD para análisis estático: aunque limitado a una función, puede invocarse desde un script que extraiga funciones individuales de un diff y las evalúe, reduciendo falsos positivos en herramientas automáticas.
- Investigación en seguridad de IA: sirve como caso de estudio de cómo un ajuste fino con datos curados puede corregir un sesgo específico de un modelo base sin degradar otras capacidades.

## Benchmarks y rendimiento

La model card reporta dos benchmarks: **GuardBench**, construido específicamente para este modelo, y **FBE**, una suite antigua mantenida por continuidad. No se proporcionan resultados numéricos completos de GuardBench en la documentación disponible; solo se describe su diseño (120 ítems, 20 patrones de código, 19 clases de vulnerabilidad, 6 variantes por patrón). La tabla siguiente muestra los resultados en cinco casos concretos donde el modelo predecesor fallaba:

| Caso | Verdad | Qwen3.8-27B base | Ginko |
|---|---|---|---|
| Token bearer comparado con `==` | vulnerable | fallo | fallo |
| Misma comprobación con `hmac.compare_digest` | seguro | correcto | correcto |
| Conexión TLS fijada con contexto pasado | seguro | falso positivo | correcto |
| `rmtree` tras confinamiento realpath + commonpath | seguro | falso positivo | correcto |
| Cabecera reenviada tras comprobación de loopback | seguro | falso positivo | correcto |
| **Total** | | **1 de 5** | **4 de 5** |

La model card advierte explícitamente que cinco ítems son una anécdota, no una tasa, y que se eligieron porque el predecesor fallaba en ellos. No se ofrecen métricas agregadas de GuardBench ni de FBE en la información disponible.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la documentación.
- Al ser un modelo MLX de 4 bits con 27B parámetros, el tamaño del repositorio es de 15,2 GB, lo que sugiere que puede cargarse en memoria unificada de Apple Silicon (por ejemplo, Mac Studio con 32 GB o más).
- No hay datos sobre VRAM en GPUs NVIDIA ni sobre latencia o throughput.
- Opciones de despliegue: al usar MLX, la inferencia está pensada para el ecosistema Apple (mlx-lm, etc.). No se menciona compatibilidad con vLLM, llama.cpp u Ollama, aunque al ser safetensors podría convertirse a otros formatos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| MK4-Ginko-v1 | 27B (4-bit MLX) | no especificado | Revisión de seguridad de una función | Apache 2.0 |
| Qwen3.8-27B (base) | 27B | no especificado | Generación general | Apache 2.0 |
| Modelos de seguridad genéricos (p.ej. CodeQL, Semgrep) | n/a | n/a | Análisis estático basado en reglas | Comercial/OSS |

La comparación directa con el base Qwen3.8-27B muestra una mejora sustancial en los cinco casos de prueba (de 1/5 a 4/5), con respuestas más cortas. No se dispone de comparaciones con otros modelos de seguridad de código en la documentación.

## Limitaciones y advertencias

- Solo analiza una función a la vez; dado un archivo completo, reporta un único hallazgo y se detiene. Esta limitación es estructural y no se puede superar con prompting.
- Entrenado únicamente en 367 filas de datos, un conjunto muy pequeño que limita su generalización a patrones no vistos.
- El 44 % de los datos de entrenamiento son código correcto que parece peligroso, lo que puede sesgar al modelo hacia declarar seguro código que en realidad es vulnerable en contextos diferentes.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- No se han publicado resultados completos de GuardBench ni de FBE, por lo que no se puede evaluar su rendimiento global más allá de los cinco casos anecdóticos.
- La cuantización 4-bit puede introducir pérdidas de precisión en tareas de razonamiento complejo, aunque no se ha medido en este modelo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es de nicho y no debe usarse como escáner de seguridad general sin validación humana.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/MK4-Research/MK4-Ginko-v1)
- [Datasets de MK4-Research](https://huggingface.co/MK4-Research/datasets)
