# Efg01410/mt_slm_ctx_compress

## Resumen

mt_slm_ctx_compress es un ajuste fino (fine-tuning) del modelo ibm-granite/granite-4.0-h-micro, desarrollado por el usuario Efg01410 y publicado en Hugging Face. Se trata de un modelo especializado en la tarea de compactación de sesiones de agentes de programación (agent session compaction), dentro de la arena `ctx_compress` de la plataforma Microtensor. El modelo lee una sesión de agente de codificación de hasta 120.000 tokens y genera un resumen de compactación estructurado en nueve encabezados.

El modelo parte de la arquitectura GraniteMoeHybrid de IBM, con 3.191.396.096 parámetros totales, y se ha obtenido mediante LoRA con rango 64 fusionado en bf16 sobre el modelo base. Su propósito es resolver el problema de la ventana de contexto limitada en agentes autónomos: cuando una sesión de codificación excede la capacidad del modelo, se necesita un resumen compacto y estructurado que preserve la información esencial para continuar la tarea.

Es relevante porque aborda un caso de uso muy concreto y creciente: la gestión de memoria en agentes de codificación de largo recorrido. Sin embargo, se trata de un modelo de nicho, con licencia restrictiva (microtensor-submission) y sin datos públicos de benchmarks ni idiomas soportados, lo que limita su adopción generalizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraniteMoeHybrid (transformer híbrido con mezcla de expertos, según el modelo base) |
| Parametros totales | 3.191.396.096 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 120.000 tokens de entrada (según la model card) |
| Tipos de cuantizacion | no disponible (pesos en bf16; el repo contiene safetensors) |
| Idiomas soportados | no disponible |
| Licencia | microtensor-submission (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ibm-granite/granite-4.0-h-micro, un modelo de la familia Granite 4.0 de IBM con arquitectura GraniteMoeHybrid, que combina capas de atención con capas de mezcla de expertos (MoE) y posiblemente componentes híbridos (el sufijo "h" sugiere hybrid). El ajuste se realizó mediante LoRA con rango 64, fusionado posteriormente en precisión bf16. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

Los datos de entrenamiento provienen del generador propio de la arena `ctx_compress` (repositorio `microtensor-io/microtensor-arenas`, archivo `arenas/compress/synth.py`) bajo semillas privadas. La tarea consiste en leer una sesión de agente de codificación de hasta 120k tokens y producir un resumen de compactación con nueve encabezados. No se han publicado detalles sobre innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de resúmenes de compactación estructurados en nueve encabezados a partir de sesiones de agente de codificación de hasta 120.000 tokens.
- Procesamiento de contexto largo (hasta 120k tokens), adecuado para sesiones de codificación extensas.
- Especialización en la tarea `ctx_compress` de la arena Microtensor, orientada a la compactación de memoria de agentes.
- No se dispone de información sobre soporte de tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio o modo de razonamiento (thinking mode).

## Casos de uso

- Compactación de sesiones de agentes de codificación: el modelo lee una sesión completa de hasta 120k tokens y genera un resumen estructurado en nueve encabezados, permitiendo que un agente continúe su trabajo sin perder información esencial cuando se agota la ventana de contexto.
- Gestión de memoria en asistentes de programación de largo recorrido: se integra en pipelines de agentes que necesitan resumir el estado de la conversación y las decisiones tomadas para mantener la coherencia en tareas de varias horas.
- Integración en plataformas de evaluación de agentes: sirve como modelo de referencia en la arena `ctx_compress` de Microtensor para comparar estrategias de compactación de contexto.
- Resumen de trazas de depuración: puede condensar largos registros de interacción de un agente con herramientas y código en un resumen manejable para revisión humana.
- Preprocesamiento para modelos con contexto limitado: actúa como paso previo que reduce sesiones largas a resúmenes compactos antes de pasarlos a modelos con ventanas más pequeñas.
- Investigación en compresión de contexto para agentes: permite experimentar con técnicas de compactación de sesiones y evaluar la calidad de los resúmenes generados en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `training/runs` para el resultado en el conjunto de validación (held out), pero no se proporcionan cifras en la información accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.191.396.096 parámetros en bf16, se requieren aproximadamente 6,4 GB solo para los pesos, más memoria para el contexto. Dado que el modelo debe procesar hasta 120.000 tokens de entrada, la memoria de activaciones y la caché KV pueden elevar considerablemente los requisitos; se estima un mínimo de 16-24 GB de VRAM para contextos largos, aunque no se dispone de datos oficiales.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs consumer de gama alta (RTX 4090 con 24 GB) para contextos moderados, y en A100/H100 para contextos completos de 120k tokens.
- Si cabe en consumer GPU: probablemente sí para contextos cortos o medios en GPUs con 16-24 GB; para el contexto máximo de 120k se recomienda hardware profesional.
- Opciones de despliegue: al cargar con `AutoModelForCausalLM` y pesos safetensors, es compatible con frameworks como Transformers, vLLM o TGI; no se confirma soporte para llama.cpp u Ollama (no hay GGUF en el repo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mt_slm_ctx_compress | 3,19B | hasta 120k (entrada) | microtensor-submission | Hugging Face (repo público) |
| ibm-granite/granite-4.0-h-micro (base) | 3,19B (aprox.) | no disponible | Apache 2.0 | Hugging Face |
| Otros modelos de compactación de contexto | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables específicos para la tarea de compactación de sesiones de agentes. El modelo base granite-4.0-h-micro es la referencia más directa, con licencia Apache 2.0 y capacidades generales, mientras que mt_slm_ctx_compress está especializado y sujeto a una licencia restrictiva.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al ser un fine-tuning sobre un modelo base, hereda los sesgos de ibm-granite/granite-4.0-h-micro, pero no se documentan.
- Riesgo de alucinación: no evaluado; en tareas de resumen de sesiones largas, existe riesgo de omitir o distorsionar información crítica.
- Limitaciones de contexto o idioma: el contexto de entrada está acotado a 120k tokens; no se especifican los idiomas soportados, aunque el modelo base está orientado principalmente al inglés.
- Restricciones de licencia: la licencia `microtensor-submission` (other) remite a los términos de Microtensor (https://www.microtensor.cloud/terms); no se garantiza su uso comercial libre. Es imprescindible revisar dichos términos antes de cualquier despliegue en producción.
- Caveat importante para producción: el modelo está diseñado exclusivamente para la tarea `ctx_compress` de la arena Microtensor; su uso fuera de ese dominio no está validado. Además, el repositorio tiene 0 descargas y 0 likes, y no se han publicado métricas de rendimiento, lo que dificulta evaluar su calidad real.

## Enlaces

- Hugging Face: https://huggingface.co/Efg01410/mt_slm_ctx_compress
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-h-micro
- Términos de licencia Microtensor: https://www.microtensor.cloud/terms
- Repositorio de arenas (referenciado en la model card): https://github.com/microtensor-io/microtensor-arenas (no confirmado)
