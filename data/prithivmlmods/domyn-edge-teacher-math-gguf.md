# prithivMLmods/Domyn-Edge-Teacher-Math-GGUF

## Resumen

Domyn-Edge-Teacher-Math es un transformer denso de 4B parámetros (3.928.787.968 parámetros reales en safetensors) desarrollado por Domyn sobre su modelo base Domyn Edge SFT. Está diseñado específicamente como profesor de dominio matemático dentro de la pipeline de post-entrenamiento Multi-Teacher On-Policy Distillation (MOPD) de Domyn, no como asistente generalista. Esta ficha corresponde a la cuantización GGUF publicada por prithivMLmods, que permite ejecutar el modelo en llama.cpp y entornos de inferencia local.

El modelo se entrenó mediante Group Relative Policy Optimization (GRPO) asíncrono sobre problemas matemáticos con respuesta final verificable, usando `math-verify` para asignar recompensas sensibles al formato (1.0 para respuesta correcta bien formateada, 0.5 para correcta sin formato, 0 en otro caso). Conserva la arquitectura, el tokenizador, el soporte de 13 idiomas y la plantilla de chat con modo `<think>` de Domyn Edge SFT, y se distribuye bajo licencia Apache 2.0.

Su relevancia radica en dos factores: por un lado, mejora el rendimiento en AIME 2026 avg@10 en +17,7 puntos sobre Domyn Edge SFT (de 61,3% a 79,0%) y supera a Qwen3.5 4B en HMMT Feb 2025 (76,1%) y Feb 2026 (65,9%); por otro, su naturaleza completamente abierta (pesos, dataset y receta) lo convierte en una pieza útil tanto para destilación como para investigación en RL aplicado a razonamiento matemático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Domyn Edge SFT) |
| Parametros totales | 3.928.787.968 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (la prueba de rendimiento usa 16.384 tokens) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M |
| Idiomas soportados | en, it, es, fr, de, pt, ru, zh, ja, ar, nl, id, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se publica en bfloat16 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 4B parámetros que hereda la arquitectura, el tokenizador y la plantilla de chat de Domyn Edge SFT. No se especifica en la información disponible el número de capas, dimensión oculta ni detalles de atención (por ejemplo, si emplea atención lineal o decodificación especulativa). La innovación técnica principal no está en la arquitectura, sino en el proceso de entrenamiento: GRPO asíncrono sobre problemas matemáticos con respuesta verificable, con recompensas calculadas mediante `math-verify` y un esquema de puntuación sensible al formato (1.0 / 0.5 / 0).

El modelo forma parte de la pipeline MOPD (Multi-Teacher On-Policy Distillation) de Domyn, donde actúa como profesor de matemáticas que puntúa token a token los rollouts de los estudiantes. El dataset de entrenamiento es Domyn-Edge-Teacher-Math-Mix, publicado junto al modelo. No se detalla en la información disponible el número total de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto y razonamiento matemático especializado, con énfasis en problemas con respuesta final verificable.
- Modo de razonamiento explícito mediante la plantilla de chat `<think>` heredada de Domyn Edge SFT.
- Soporte multilingüe en 13 idiomas: inglés, italiano, español, francés, alemán, portugués, ruso, chino, japonés, árabe, neerlandés, indonesio y turco.
- Capacidad de puntuar soluciones matemáticas token a token, lo que lo hace apto como profesor en pipelines de destilación.
- No se menciona en la información disponible soporte de tool calling, function calling, agentes multi-paso, visión ni audio.
- No se menciona en la información disponible capacidad de generación de código como competencia destacada, aunque una de las pruebas de rendimiento incluye un problema de inserción de nodo en lista enlazada.

## Casos de uso

- Destilación on-policy de modelos matemáticos: usar el modelo como profesor que puntúa token a token los rollouts de un estudiante dentro de una pipeline MOPD, aprovechando su entrenamiento específico con GRPO y recompensas verificables.
- Generación de soluciones matemáticas verificables: resolver problemas con respuesta final comprobable (estilo competición, AIME, HMMT) donde el formato de la respuesta importa, gracias a la recompensa sensible al formato con la que fue entrenado.
- Evaluación automática de soluciones de estudiantes: emplear el modelo para asignar puntuaciones formativas a respuestas matemáticas producidas por otros modelos o por humanos, con criterios de formato y corrección.
- Investigación en RL aplicado a razonamiento: reproducir o extender la receta GRPO con `math-verify` sobre el dataset Domyn-Edge-Teacher-Math-Mix, ya que pesos y datos son abiertos.
- Despliegue local en hardware de consumo: ejecutar las cuantizaciones Q3_K_M (2 GB) o Q4_K_M (2,42 GB) en portátiles o GPUs de gama media para experimentación con razonamiento matemático.
- Servicio de tutoría matemática multilingüe: atender consultas en cualquiera de los 13 idiomas soportados con razonamiento paso a paso visible mediante el modo `<think>`, en entornos donde el contexto requerido no supere la ventana efectiva del modelo.
- Generación de datos sintéticos matemáticos: producir problemas resueltos y cadenas de razonamiento para aumentar datasets de entrenamiento, dado que el modelo está pensado para generar rollouts puntuables.

## Benchmarks y rendimiento

| Benchmark | Domyn-Edge-Teacher-Math | Referencia |
|---|---|---|
| AIME 2026 avg@10 | 79,0% | Domyn Edge SFT: 61,3% (+17,7 puntos) |
| HMMT Feb 2025 | 76,1% | supera a Qwen3.5 4B |
| HMMT Feb 2026 | 65,9% | supera a Qwen3.5 4B |

Prueba de inferencia con Q3_K_L en NVIDIA RTX PRO 6000 Blackwell (96 GB VRAM), llama-cli con `-ngl 99`, contexto de 16.384 tokens, KV cache `q8_0`, semilla 42, 5 ejecuciones:

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 1.109,73 tokens/s |
| Velocidad media de generación | 267,61 tokens/s |
| Tiempo total | 56,3 s |
| VRAM pico | 4,00 GiB |
| Uso de GPU pico | 91% |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0-2,2 GB con Q3_K_M, 2,3-2,4 GB con Q4_K_M, 2,8 GB con Q5_K_M, 3,2 GB con Q6_K, 4,2 GB con Q8_0 y 7,9 GB con BF16 (tamaños de fichero; la VRAM real añade el KV cache).
- Cabe en GPUs de consumo: sí, desde tarjetas con 4-6 GB de VRAM en cuantizaciones Q3/Q4; una RTX 3060, RTX 4060 o superior es suficiente para Q4_K_M con contexto moderado.
- GPU recomendadas: cualquier GPU con al menos 6 GB para Q4_K_M; para contexto largo (16K) conviene 8-12 GB. La prueba publicada usa una NVIDIA RTX PRO 6000 Blackwell con 96 GB, pero el consumo pico fue de solo 4 GiB con Q3_K_L.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama y cualquier runtime compatible con GGUF; el repo incluye la etiqueta `endpoints_compatible` y `text-generation-inference`.
- Latencia y throughput: 267,61 tokens/s de generación y 1.109,73 tokens/s de procesamiento de prompt en la configuración de prueba indicada; en GPUs de consumo el throughput será sustancialmente menor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Domyn-Edge-Teacher-Math | 3,93B (denso) | no disponible (prueba a 16K) | AIME 2026 avg@10: 79,0%; HMMT Feb 2025: 76,1%; HMMT Feb 2026: 65,9% | Apache 2.0 | Pesos BF16 y GGUF en Hugging Face |
| Domyn Edge SFT (modelo base) | 4B (denso) | no disponible | AIME 2026 avg@10: 61,3% | no disponible en la informacion proporcionada | Pesos publicados por Domyn |
| Qwen3.5 4B | 4B (denso) | no disponible | Inferior a Domyn-Edge-Teacher-Math en HMMT Feb 2025 y Feb 2026 segun la model card | no disponible en la informacion proporcionada | Pesos publicados por Qwen |

No se dispone de datos de contexto, licencia ni benchmarks completos de los modelos comparables en la información proporcionada; la comparación se limita a los datos citados en la model card.

## Limitaciones y advertencias

- Modelo especializado: está diseñado para puntuar rollouts matemáticos en una pipeline de destilación, no como asistente generalista; su uso fuera de ese dominio puede degradar la calidad de forma notable.
- Riesgo de alucinación en problemas matemáticos fuera de la distribución de entrenamiento; las respuestas deben verificarse siempre que sea posible.
- La recompensa de entrenamiento es sensible al formato: respuestas correctas pero mal formateadas reciben puntuación parcial (0,5), lo que puede sesgar el comportamiento hacia formatos concretos.
- No se documentan en la información disponible sesgos demográficos, lingüísticos o culturales específicos; el soporte de 13 idiomas no garantiza calidad homogénea en todos ellos.
- La longitud de contexto no está especificada en la información disponible; la prueba publicada usa 16.384 tokens, por lo que no debe asumirse una ventana mayor sin verificación.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones del modelo base Domyn Edge SFT y del dataset Domyn-Edge-Teacher-Math-Mix por si añaden restricciones adicionales.
- Las cuantizaciones Q3_K_M y Q3_K_L degradan la calidad; para producción se recomienda Q5_K_M o superior.
- El repo GGUF tiene 0 descargas en el momento de la consulta, por lo que hay poca validación comunitaria de estas cuantizaciones concretas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/Domyn-Edge-Teacher-Math-GGUF
- Modelo base: https://huggingface.co/domyn/Domyn-Edge-Teacher-Math
- Dataset de entrenamiento: https://huggingface.co/datasets/domyn/Domyn-Edge-Teacher-Math-Mix
- llama.cpp: https://github.com/ggml-org/llama.cpp
