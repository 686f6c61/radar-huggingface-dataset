# ferry-el-kom/qwen3.5-4b-jackrong-base-retrain-hermes-agentic-tooluse-v3-Q8_0-gguf

## Resumen

El modelo `qwen3.5-4b-jackrong-base-retrain-hermes-agentic-tooluse-v3-Q8_0-gguf` es una cuantización Q8_0 en formato GGUF de un ajuste fino LoRA (denominado "out-v3") sobre el modelo base `Jackrong/Qwen3.5-4B-Distilled-v2`, que a su vez deriva de la arquitectura densa Qwen3.5 de 4B. Lo publica el usuario `ferry-el-kom` con licencia Apache 2.0 y está orientado específicamente a flujos agénticos con uso de herramientas (tool calling). Con aproximadamente 4.326 millones de parámetros y un tamaño de repo de 4,6 GB, el objetivo es ofrecer un modelo compacto desplegable en local para bucles de agente fiables.

La relevancia del modelo reside en su enfoque de entrenamiento: según la model card, se entrenó casi exclusivamente con sesiones reales de agente Hermes con llamadas a herramientas (dataset `v3h`, 240 ventanas, 17% de proporción sin herramienta), lo que el autor identifica como el factor decisivo para obtener una puntuación de 4/4 en su bucle agéntico interno frente a versiones posteriores de la misma línea. Es, por tanto, un artefacto muy especializado en tool use más que un modelo generalista.

No obstante, se trata de un modelo con cero descargas y cero likes en el momento de la ficha, con evaluación limitada a benchmarks internos del propio autor y sin datos públicos de terceros. La información sobre arquitectura detallada, contexto y datos de entrenamiento del modelo base no está disponible en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5); detalles específicos no disponibles |
| Parametros totales | 4.326.350.848 (~4,3B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (única publicada en este repo) |
| Idiomas soportados | en, ro |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `qwen35-4b-jackrong-v3-q8.gguf`, 4,61 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.5 con ~4,3B parámetros. Sobre él se aplicó un ajuste fino LoRA con rango r=32, alpha=64, durante 120 pasos, con learning rate 1e-4, longitud de secuencia 768 y acumulación de gradiente 4, reduciendo la pérdida de 1,11 a 0,44. El adaptador resultante es `out-v3/final`. No se dispone de información sobre el número total de tokens de entrenamiento del modelo base ni sobre su composición de dataset, ni sobre si hubo fases de RLHF o DPO.

La innovación técnica destacable es la composición del dataset de ajuste: el autor indica que se usaron 240 ventanas de sesiones reales de agente Hermes con llamadas a herramientas, con solo un 17% de ejemplos sin herramienta. Esta proporción contrasta con versiones posteriores de la línea (v8, con 78% de paquetes sin herramienta) que obtuvieron peores resultados en el bucle agéntico interno, lo que el autor interpreta como evidencia de que el entrenamiento centrado en tool use es el factor determinante. No se documentan innovaciones arquitectónicas propias (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de texto conversacional en inglés y rumano.
- Uso de herramientas (tool calling / function calling) como capacidad central del ajuste.
- Ejecución de bucles agénticos de varios pasos con llamadas a herramientas encadenadas.
- Razonamiento tipo "thinking": la model card lo describe como modelo de pensamiento y lo compara como "más lento" que un modelo no pensante de referencia.
- Respuesta a preguntas con valor exacto sobre bases de datos de hechos (evaluado en su benchmark interno Database EagleEye).
- Integración con endpoints compatibles (tag `endpoints_compatible`).
- Capacidades multilingües limitadas a inglés y rumano según los metadatos; no se documentan otras lenguas.
- No se documentan capacidades de visión, audio ni matemáticas avanzadas.

## Casos de uso

- Agentes de automatización con herramientas: el modelo puede gestionar bucles de razonamiento y llamadas a funciones encadenadas gracias a su entrenamiento específico en sesiones Hermes con tool calls, lo que lo hace adecuado para orquestadores de tareas que invocan APIs.
- Consulta de bases de datos de hechos: su rendimiento del 90,5% (38/42) en el benchmark interno de QA con valor exacto sugiere uso en asistentes que recuperan y responden datos concretos de una base de datos estructurada.
- Asistentes conversacionales en inglés o rumano: al estar entrenado y evaluado en esos idiomas, encaja en productos de atención al cliente o soporte para mercados anglófono y rumano.
- Despliegue local en estaciones de trabajo: con ~4,3B parámetros en Q8_0 (4,61 GB) cabe en GPUs de consumo, permitiendo prototipos de agentes sin depender de la nube.
- Enrutamiento de herramientas en pipelines de desarrollo: puede integrarse como paso de decisión que selecciona qué herramienta o API invocar en un flujo de CI/CD o de automatización interna.
- Evaluación y experimentación en investigación sobre tool use: al ser un ajuste documentado con proporciones de dataset explícitas, sirve como punto de comparación reproducible para estudiar el efecto del entrenamiento centrado en herramientas.
- Chatbot de dominio cerrado con acceso a funciones: su naturaleza de modelo "pensante" y su enfoque agéntico permiten construir asistentes que razonan antes de actuar, a costa de mayor latencia.

## Benchmarks y rendimiento

Los únicos datos disponibles son los benchmarks internos del autor, sin verificación independiente:

| Benchmark | Resultado | Latencia mediana |
|---|---|---|
| Bucle agéntico interno (4 tareas con herramienta) | 4/4 @ 3,5 tokens | no disponible |
| Database EagleEye bench-033 (42 ítems, QA de valor exacto) | 38/42 = 90,5% | ~7 s |
| Database EagleEye smoke30 (30 ítems) | 27/30 = 90,0% | 7,0 s |

Comparación del propio autor a cuantización Q8_0 idéntica: supera en precisión a `hermes-glm52-4b-soul` Q8_0 (88,1% en bench-033 / 86,7% en smoke30), pero es más lento por ser un modelo de pensamiento. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q8_0: aproximadamente 5-6 GB (pesos de 4,61 GB más overhead de contexto y caché KV).
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM; para mayor throughput, A100 o H100 en entornos de servidor.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090).
- Opciones de despliegue: llama.cpp / llama-server directamente, Ollama (creando un Modelfile con `FROM ./qwen35-4b-jackrong-v3-q8.gguf`), y cualquier runtime compatible con GGUF.
- Latencia: ~7 s por consulta en el benchmark interno de QA de valor exacto (entorno no especificado); el autor lo describe como más lento que un modelo no pensante comparable.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-jackrong-v3 Q8_0 (este) | ~4,3B | no disponible | 90,5% bench-033 interno; 4/4 bucle agéntico | Apache 2.0 | GGUF en HF |
| hermes-glm52-4b-soul Q8_0 | ~4B (según nombre) | no disponible | 88,1% bench-033 / 86,7% smoke30 (según el autor) | no disponible | Q8_0 en HF |
| Jackrong/Qwopus3.5-4B-Coder-MTP-GGUF | ~4B | no disponible | no disponible | no disponible | GGUF en HF |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B | ~4B | no disponible | no disponible | no disponible | HF |

La comparación se limita a los datos que el propio autor aporta; no hay evaluaciones independientes que permitan contrastar los resultados entre estos modelos.

## Limitaciones y advertencias

- Modelo con cero descargas y cero likes: sin validación por parte de la comunidad ni informes de terceros.
- Benchmarks exclusivamente internos del autor, con denominaciones no estándar (bench-033, smoke30, bucle agéntico de 4 tareas) que no permiten comparación directa con MMLU, HumanEval u otros estándares.
- Riesgo de alucinación no cuantificado; no se han publicado tasas de error en dominios abiertos.
- Idiomas limitados a inglés y rumano según los metadatos; el rendimiento en castellano no está evaluado ni documentado.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Es un modelo de pensamiento y, según el autor, más lento que alternativas no pensantes; la latencia de ~7 s por consulta puede ser problemática en producción interactiva.
- Licencia Apache 2.0 heredada del modelo base, lo que en principio permite uso comercial, pero conviene verificar las condiciones de la licencia del modelo base `Jackrong/Qwen3.5-4B-Distilled-v2` y de Qwen3.5.
- El ajuste se realizó con solo 120 pasos y 240 ventanas de entrenamiento, lo que puede implicar sobreajuste al formato de sesiones Hermes y menor generalización fuera de ese estilo de prompts.
- No se documentan salvaguardas, filtros de seguridad ni evaluaciones de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ferry-el-kom/qwen3.5-4b-jackrong-base-retrain-hermes-agentic-tooluse-v3-Q8_0-gguf
- Modelo base: https://huggingface.co/Jackrong/Qwen3.5-4B-Distilled-v2
- Modelo relacionado de la misma familia: https://huggingface.co/Jackrong/Qwopus3.5-4B-Coder-MTP-GGUF
- Modelo relacionado de la misma familia: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-4B
