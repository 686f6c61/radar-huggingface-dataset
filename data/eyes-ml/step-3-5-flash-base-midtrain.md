# eyes-ml/Step-3.5-Flash-Base-Midtrain

## Resumen

Step 3.5 Flash Base Midtrain es un checkpoint intermedio de la familia Step 3.5 Flash desarrollada por StepFun (publicado en el espacio de Hugging Face del usuario `eyes-ml`). Se trata de un modelo de lenguaje de gran escala basado en una arquitectura de mezcla de expertos (MoE) dispersa que activa aproximadamente 11.000 millones de parámetros de un total de 196.000 millones por token, lo que le confiere una elevada "densidad de inteligencia" y lo hace competitivo en razonamiento y tareas agénticas frente a modelos propietarios de mayor tamaño.

El modelo está orientado a razonamiento profundo, generación de código y flujos agénticos de múltiples pasos, con un contexto nativo de 256.000 tokens implementado mediante atención de ventana deslizante en proporción 3:1 (tres capas SWA por cada capa de atención completa). Incorpora Multi-Token Prediction de tres vías (MTP-3), lo que permite alcanzar velocidades de generación de 100-300 tokens por segundo en uso típico y hasta 350 tokens por segundo en tareas de código de un solo flujo.

La relevancia de este checkpoint concreto ("Base Midtrain") radica en que es un estado intermedio del entrenamiento, previo al ajuste fino final, lo que lo hace útil para investigación sobre dinámicas de entrenamiento, ajuste posterior (SFT/RL) y análisis de capacidades emergentes. La licencia Apache 2.0 y la publicación del código de entrenamiento (SteptronOss) refuerzan su interés para la comunidad open source.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso con atención híbrida (3:1 Sliding Window Attention) y Multi-Token Prediction de 3 vías (MTP-3) |
| Parámetros totales | 197.765.520.704 (~197,8 mil millones) |
| Parámetros activos | ~11 mil millones por token |
| Longitud de contexto | 256.000 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 395,5 GB) |

## Arquitectura y entrenamiento

Step 3.5 Flash emplea una arquitectura de mezcla de expertos (MoE) dispersa en la que solo se activan unos 11.000 millones de parámetros de los 196.000 millones totales por cada token procesado. La atención es híbrida: combina capas de atención de ventana deslizante (SWA) con capas de atención completa en una proporción 3:1, lo que reduce el coste computacional del contexto largo manteniendo el rendimiento en ventanas de hasta 256.000 tokens. Además, integra Multi-Token Prediction de tres vías (MTP-3), una técnica que predice varios tokens futuros simultáneamente y que se traduce en un throughput de generación de 100-300 tok/s en uso típico y hasta 350 tok/s en tareas de código de un solo flujo.

El modelo forma parte de una familia entrenada con un framework de RL escalable que impulsa la mejora continua en tareas agénticas. StepFun ha publicado el código de entrenamiento (SteptronOss) con soporte para preentrenamiento continuado, SFT y evaluación (RL en curso), y ha anunciado la apertura de los datos de SFT. Este checkpoint concreto es un estado intermedio de "midtrain", es decir, previo al ajuste fino final, por lo que sus capacidades reflejan el estado del preentrenamiento y del entrenamiento intermedio más que el modelo final pulido. No se dispone de información detallada sobre el número exacto de tokens de entrenamiento ni sobre la composición del dataset en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento profundo en cadenas de múltiples pasos.
- Generación y comprensión de código, con soporte para tareas de ingeniería de software de largo horizonte (SWE-bench Verified 74,4% en el modelo final de la familia).
- Razonamiento matemático (GSM8K, MATH) y resolución de problemas de conocimiento general (MMLU, MMLU-Pro, GPQA).
- Capacidades agénticas: ejecución de tareas de terminal y entornos de línea de comandos (Terminal-Bench 2.0 51,0% en el modelo final).
- Soporte de contexto largo de 256.000 tokens, adecuado para bases de código extensas y documentos masivos.
- Multi-Token Prediction (MTP-3) para decodificación acelerada y mayor throughput.
- Soporte de "Parallel Thinking" (según el paper referenciado) para mejorar el rendimiento en búsqueda profunda y razonamiento.
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling: no confirmado explícitamente para este checkpoint, aunque la familia está orientada a agentes.

## Casos de uso

- Investigación sobre entrenamiento de modelos MoE: este checkpoint intermedio permite estudiar la evolución de capacidades durante el preentrenamiento y el midtrain, comparando con el checkpoint final "Base" y con versiones ajustadas.
- Ajuste fino supervisado (SFT) y RL posterior: al ser un estado intermedio y contar con licencia Apache 2.0, es adecuado como punto de partida para experimentos de alineación y especialización con datos propios.
- Generación de código en producción: con un contexto de 256.000 tokens y alto throughput (100-300 tok/s), puede integrarse en pipelines de CI/CD para revisión automática, generación de tests y refactorización sobre repositorios completos.
- Agentes autónomos de terminal: la familia alcanza 51,0% en Terminal-Bench 2.0, lo que lo hace apto para tareas de automatización de shell, depuración y gestión de entornos.
- Análisis de documentación extensa: la ventana de 256K tokens permite procesar contratos, informes o bases de conocimiento completas en una sola pasada con atención híbrida eficiente.
- Asistencia a la investigación matemática y científica: buen rendimiento en GSM8K (88,9), MATH (65,7) y GPQA (43,8), útil para resolución de problemas y verificación de razonamientos.
- Despliegue local en hardware de gama alta para consumidores: según la model card, corre en Mac Studio M4 Max y NVIDIA DGX Spark, lo que facilita escenarios de privacidad de datos.
- Búsqueda profunda y razonamiento paralelo: con la técnica de Parallel Thinking referenciada, útil para tareas de investigación y recuperación de información compleja.

## Benchmarks y rendimiento

Resultados del checkpoint "Base Midtrain" comparados con el modelo "Base" de la misma familia y con alternativas open source (datos de la model card):

| Benchmark | Shots | Step3.5 Flash (Base Midtrain) | Step3.5 Flash (Base) | MiMo-V2 Flash (Base) | GLM-4.5 (Base) | DeepSeek V3.1 (Base) | DeepSeek V3.2 (Exp Base) | Kimi-K2 (Base) |
|---|---|---|---|---|---|---|---|---|
| Params activos | - | 11B | 11B | 15B | 32B | 37B | 37B | 32B |
| Params totales | - | 196B | 196B | 309B | 355B | 671B | 671B | 1043B |
| BBH | 3-shot | 87,3 | 88,2 | 88,5 | 86,2 | 88,2† | 88,7† | 88,7 |
| MMLU | 5-shot | 83,4 | 85,8 | 86,7 | 86,1 | 87,4† | 87,8† | 87,8 |
| MMLU-Redux | 5-shot | 87,2 | 89,2 | 90,6 | - | 90,0† | 90,4† | 90,2 |
| MMLU-Pro | 5-shot | 63,6 | 62,3 | 73,2 | - | 58,8† | 62,1† | 69,2 |
| HellaSwag | 10-shot | 91,0 | 90,2 | 88,5 | 87,1 | 89,2† | 89,4† | 94,6 |
| WinoGrande | 5-shot | 75,8 | 79,1 | 83,8 | - | 85,9† | 85,6† | 85,3 |
| GPQA | 5-shot | 43,8 | 41,7 | 43,5* | 33,5* | 43,1* | 37,3* | 43,1* |
| SuperGPQA | 5-shot | 41,2 | 41,0 | 41,1 | - | 42,3† | 43,6† | 44,7 |
| SimpleQA | 5-shot | 28,4 | 31,6 | 20,6 | 30,0 | 26,3† | 27,0† | 35,3 |
| GSM8K | 8-shot | 88,9 | 88,2 | 92,3 | 87,6 | 91,4† | 91,1† | 92,1 |
| MATH | 4-shot | 65,7 | 66,8 | 71,0 | 62,6 | 62,6† | 62,5† | 70,2 |
| HumanEval | 3-shot | 67,0 | 81,1 | 77,4* | 79,8* | 72,5* | 67,7* | 84,8* |
| MBPP | 3-shot | 79,0 | 79,4 | 81,0* | 81,6* | 74,6* | 75,6* | 89,0* |
| HumanEval+ | 0-shot | 75,0 | 72,0 | 70,7 | - | 64,6† | 67,7† | - |
| MBPP+ | 0-shot | 62,4 | 70,6 | - | - | - | - | - |

Además, en la model card se reportan para el modelo final de la familia: 74,4% en SWE-bench Verified y 51,0% en Terminal-Bench 2.0. No se proporcionan resultados de benchmark para capacidades multilingües ni para tool calling en este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~197,8 mil millones de parámetros en precisión completa (BF16), el modelo requiere del orden de 395 GB de VRAM, lo que exige múltiples aceleradores de gama empresarial. En cuantización de 8 bits se reduciría aproximadamente a la mitad (~200 GB) y en 4 bits a ~100 GB, aunque no se especifican cuantizaciones oficiales en la información disponible.
- GPU recomendadas: para despliegue en BF16 se necesitan múltiples A100 (80 GB), H100 (80 GB) o configuraciones equivalentes; la model card menciona explícitamente Mac Studio M4 Max y NVIDIA DGX Spark como entornos de despliegue local accesibles.
- ¿Cabe en GPU de consumo? En precisión completa no; en cuantizaciones agresivas (4 bits) podría aproximarse al rango de estaciones de trabajo con gran memoria unificada, pero no se confirma en la información disponible.
- Opciones de despliegue: soporte nativo en `transformers` (con `custom_code`), y presumiblemente vLLM, TGI y llama.cpp/Ollama para formatos cuantizados, aunque no se detalla en la información proporcionada.
- Latencia y throughput: 100-300 tokens por segundo en uso típico y hasta 350 tok/s en tareas de código de un solo flujo, gracias a MTP-3.

## Comparativa con modelos similares

| Modelo | Params totales | Params activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Step 3.5 Flash Base Midtrain | 196B | 11B | 256K | Apache 2.0 | Hugging Face |
| MiMo-V2 Flash (Base) | 309B | 15B | no disponible | no disponible | no disponible |
| GLM-4.5 (Base) | 355B | 32B | no disponible | no disponible | no disponible |
| DeepSeek V3.1 (Base) | 671B | 37B | no disponible | no disponible | no disponible |
| Kimi-K2 (Base) | 1043B | 32B | no disponible | no disponible | no disponible |

En términos de rendimiento, Step 3.5 Flash Base Midtrain queda ligeramente por debajo de su versión "Base" final en la mayoría de benchmarks (por ejemplo, MMLU 83,4 frente a 85,8; HumanEval 67,0 frente a 81,1), lo que es esperable al tratarse de un checkpoint intermedio. Frente a alternativas de mayor tamaño como DeepSeek V3.1 o Kimi-K2, ofrece resultados competitivos en GPQA, HellaSwag y GSM8K con un número de parámetros activos mucho menor, lo que refleja su eficiencia.

## Limitaciones y advertencias

- Al ser un checkpoint "midtrain", sus capacidades están por debajo del modelo final de la familia; no debe evaluarse como un modelo terminado ni usarse en producción sin ajuste posterior.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no se han publicado evaluaciones específicas de factualidad para este checkpoint.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingüe.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos del proyecto StepFun y las dependencias de `custom_code`.
- El repositorio ocupa 395,5 GB, lo que exige infraestructura de almacenamiento considerable para su descarga y despliegue.
- No se han publicado datos sobre cuantizaciones oficiales, lo que limita el despliegue en hardware de menor capacidad sin trabajo adicional de conversión.
- La información sobre tool calling y capacidades agénticas en este checkpoint concreto no está confirmada explícitamente.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/eyes-ml/Step-3.5-Flash-Base-Midtrain
- Modelo base de la familia: https://huggingface.co/stepfun-ai/Step-3.5-Flash
- ModelScope: https://modelscope.cn/models/stepfun-ai/Step-3.5-Flash
- GitHub (SteptronOss): https://github.com/stepfun-ai/SteptronOss
- Blog oficial: https://static.stepfun.com/blog/step-3.5-flash/
- Paper técnico: https://arxiv.org/abs/2602.10604
- Paper Parallel Thinking: https://arxiv.org/pdf/2601.05593
- Demo en Hugging Face Space: https://huggingface.co/spaces/stepfun-ai/Step-3.5-Flash
- Chat en OpenRouter: https://openrouter.ai/chat?models=stepfun/step-3.5-flash:free
- Discord: https://discord.gg/RcMJhNVAQc
