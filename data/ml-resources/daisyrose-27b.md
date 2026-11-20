# ml-resources/DaisyRose-27B

## Resumen

DaisyRose-27B es un modelo multimodal de razonamiento desarrollado por RadixArk, construido sobre Qwen3.8-27B mediante un proceso de aprendizaje por refuerzo exclusivamente, sin supervisión fina (SFT) ni destilación. El modelo parte de la arquitectura, tokenizador y plantilla de chat del modelo base, por lo que funciona como reemplazo directo en pilas de inferencia y post-entrenamiento existentes. Su entrenamiento se centró en unas 1.200 tareas de agente de horizonte largo, con sesiones de hasta 1M de tokens, durante 18 días en 144 GPU H200.

La propuesta de valor del modelo es el refuerzo de capacidades agénticas y de razonamiento de largo alcance sin degradar las competencias generales del base: mejora en Terminal Bench 4.1 (de 5,6 a 12,0 pass@1), DeepSWE v1.1 (de 42,2 a 46,2), SWE Bench Pro v2 (de 91,3 a 94,7), IFBench (de 79,5 a 82,4) y GPQA Diamond (de 89,2 a 90,7). Conserva la comprensión de imágenes y la ventana de contexto de 256K tokens del Qwen3.8-27B original.

Con 27.781.427.952 parámetros reales (27B densos, no MoE), licencia Apache-2.0 y pesos publicados en BF16, FP8 y NVFP4, además de una variante GGUF y un modelo draft para decodificación especulativa, DaisyRose-27B se posiciona como una opción para pipelines de agentes de código y automatización de terminal en producción, con la salvedad de que su rendimiento en tareas de agente sigue por debajo de modelos mucho más grandes como MiMo V2.6 Flash o Inkling 2 Small.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.8-27B) |
| Parámetros totales | 27.781.427.952 (27B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantización | BF16 (pesos publicados), FP8, NVFP4, GGUF |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16, FP8, NVFP4); GGUF en repositorio separado |

## Arquitectura y entrenamiento

DaisyRose-27B reutiliza íntegramente la arquitectura del Qwen3.8-27B: misma pila transformer, mismo tokenizador y misma plantilla de chat, incluyendo la torre de visión para entrada image-text-to-text. No se introducen cambios estructurales; el trabajo se concentra en el post-entrenamiento. El modelo se entrenó exclusivamente con aprendizaje por refuerzo, sin SFT ni destilación, sobre aproximadamente 1.200 tareas de agente de horizonte largo curadas, con sesiones que alcanzan 1M de tokens. El cómputo total fue de 18 días en 144 GPU H200.

La innovación principal es el uso de RL sobre trayectorias agénticas largas para mejorar la planificación multi-paso y la ejecución en terminal, manteniendo intactas las capacidades del base. El ecosistema incluye un modelo draft específico (Qwen3.8-27B-DSpark) para decodificación especulativa, lo que sugiere soporte para acelerar la inferencia en despliegues de producción.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo thinking (reasoning effort configurable, por defecto xhigh).
- Comprensión de imágenes (pipeline image-text-to-text).
- Ejecución de tareas agénticas de terminal y línea de comandos (Terminal Bench 4.1 y 2.1).
- Ingeniería de software y resolución de issues en repositorios (DeepSWE v1.1, SWE Bench Pro v2).
- Razonamiento científico y de conocimiento avanzado (GPQA Diamond, HLE text-only).
- Seguimiento de instrucciones complejas y restricciones (IFBench).
- Contexto largo de hasta 256K tokens para sesiones agénticas prolongadas.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue gestionado.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Automatización de operaciones en terminal: el modelo puede encadenar comandos, interpretar salidas y corregir errores en sesiones de hasta 256K tokens, adecuado para tareas de administración de sistemas y CI/CD donde Terminal Bench 4.1 mide su competencia.
- Agente de resolución de issues en repositorios: con 94,7 en SWE Bench Pro v2, puede integrarse en pipelines que reciben un issue, exploran el código y proponen un parche, usando tool calling sobre el sistema de ficheros y el intérprete.
- Asistente de código en IDE con contexto largo: la ventana de 256K permite cargar múltiples ficheros y el historial de conversación sin truncar, útil para refactorizaciones que abarcan varios módulos.
- Análisis de documentación técnica con imágenes: al ser multimodal, puede procesar capturas de pantalla, diagramas de arquitectura y fragmentos de documentación escaneada junto al texto.
- Razonamiento científico asistido: con 90,7 en GPQA Diamond, sirve para responder preguntas de nivel posgrado en física, química y biología, con trazas de razonamiento auditables en modo thinking.
- Evaluación automática de instrucciones y políticas: con 82,4 en IFBench, puede usarse como juez o verificador de cumplimiento de restricciones en pipelines de generación.
- Sustitución directa del base en pilas existentes: al conservar tokenizador y plantilla de chat, se puede desplegar sobre infraestructura ya configurada para Qwen3.8-27B sin cambios en el código de inferencia.

## Benchmarks y rendimiento

| Benchmark | DaisyRose-27B | Qwen3.8-27B | Muse Glimmer-30B | Qwen3.6-35B-A3B | MiMo V2.6 Flash | Inkling 2 Small | Beam 1.0 | Muse Spark Open | GPT-6 Luna |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Parámetros activos | 27B | 27B | 30B | 3B | 15B | 17B | 23B | 42B | – |
| Parámetros totales | 27B | 27B | 30B | 35B | 309B | 594B | 501B | 816B | – |
| Terminal Bench 4.1 | 12,0 | 5,6 | 0,5 | 0,0 | **16,1** | 13,0 | 6,4 | 6,6 | 15,2 |
| Terminal Bench 2.1 | 75,5 | 73,0 | 51,7 | 44,9 | **87,6** | 81,3 | 80,1 | 76,4 | 73,0 |
| DeepSWE v1.1 | 46,2 | 42,2 | 4,4 | 0,0 | 67,9 | **72,1** | 43,3 | 60,0 | 66,6 |
| SWE Bench Pro v2 | 94,7 | 91,3 | 80,4 | 73,3 | – | **97,7** | – | 95,0 | – |
| HLE (text only) | 34,3 | 33,9 | 22,0 | 22,2 | 35,1 | **44,1** | 34,7 | 43,9 | 38,5 |
| IFBench | **82,4** | 79,5 | 77,0 | 64,4 | – | – | 79,6 | – | – |
| GPQA Diamond | 90,7 | 89,2 | 83,5 | 86,0 | 88,7 | **93,0** | 90,6 | 89,0 | 90,5 |

Configuración de evaluación: temperatura 1,0, top_p 0,95, top_k 20, min_p 0, reasoning effort xhigh, sin límite de max_tokens dentro del contexto de 256K. Las puntuaciones de DaisyRose-27B son la mejor entre las ejecuciones BF16 y FP8, que difieren en menos de un punto en todos los benchmarks medidos en ambos formatos.

## Requisitos de hardware

- VRAM estimada en BF16: unos 55,6 GB solo para pesos (coincide con el tamaño del repositorio), más overhead de activaciones y KV cache; requiere al menos 2 GPU de 80 GB o una GPU de 141 GB para contexto largo.
- VRAM estimada en FP8: aproximadamente 28 GB para pesos, viable en una A100 40 GB o H100 80 GB con margen para contexto moderado.
- VRAM estimada en NVFP4: aproximadamente 14 GB para pesos, permite despliegue en GPU consumer de gama alta (RTX 4090 24 GB, RTX 5090) con contexto limitado.
- GPU recomendadas: H200 (la configuración de entrenamiento usó 144 H200), H100 80 GB, A100 80 GB; para cuantización NVFP4 o GGUF, RTX 4090/5090.
- Cabe en GPU consumer: sí, en cuantizaciones NVFP4 o GGUF (Q4/Q5) sobre RTX 4090 o superior, con contexto reducido respecto a los 256K.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para BF16/FP8, llama.cpp/Ollama para GGUF; soporte de endpoints gestionados por el tag `endpoints_compatible`.
- Decodificación especulativa: disponible mediante el draft Qwen3.8-27B-DSpark.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Terminal Bench 4.1 | DeepSWE v1.1 | GPQA Diamond | Licencia |
|---|---|---:|---:|---:|---:|---|
| DaisyRose-27B | 27B densos | 256K | 12,0 | 46,2 | 90,7 | Apache-2.0 |
| Qwen3.8-27B (base) | 27B densos | 256K | 5,6 | 42,2 | 89,2 | No disponible en la información |
| MiMo V2.6 Flash | 309B totales / 15B activos | No disponible | 16,1 | 67,9 | 88,7 | No disponible en la información |
| Inkling 2 Small | 594B totales / 17B activos | No disponible | 13,0 | 72,1 | 93,0 | No disponible en la información |

DaisyRose-27B ofrece el mejor equilibrio tamaño-rendimiento del grupo en IFBench (82,4) y supera a su base en todos los benchmarks reportados, pero queda por debajo de modelos MoE mucho más grandes en tareas agénticas de código (DeepSWE, Terminal Bench) y en HLE.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; al heredar el base, es razonable esperar los sesgos del corpus de Qwen3.8-27B, pero no hay análisis publicado.
- Riesgo de alucinación: HLE text-only de 34,3 indica que sigue cometiendo errores en razonamiento de alta dificultad; no debe usarse sin verificación en dominios críticos.
- Idiomas soportados: no disponibles; la ausencia de esta información impide garantizar cobertura multilingüe más allá de lo que herede el base.
- Contexto: aunque soporta 256K tokens, el rendimiento efectivo en el extremo superior de la ventana no está medido en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero el `license_link` apunta a un repositorio distinto (RadixArk/DaisyRose-27B) del ID publicado (ml-resources/DaisyRose-27B), lo que conviene verificar antes de desplegar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria inexistentes; no hay reportes independientes de reproducibilidad.
- El modelo se entrenó solo con RL sin SFT, lo que puede producir estilos de respuesta menos pulidos en conversación general que un modelo con alineamiento supervisado.
- Las evaluaciones son internas del autor, con harness propios (mini-swe-agent, Terminus 2) y comparaciones con cifras de terceros tomadas de leaderboards y model cards; la comparabilidad entre filas no está garantizada.

## Enlaces

- Hugging Face (BF16): https://huggingface.co/ml-resources/DaisyRose-27B
- Hugging Face (repo del autor, BF16): https://huggingface.co/RadixArk/DaisyRose-27B
- FP8: https://huggingface.co/RadixArk/DaisyRose-27B-FP8
- NVFP4: https://huggingface.co/RadixArk/DaisyRose-27B-NVFP4
- GGUF: https://huggingface.co/RadixArk/DaisyRose-27B-GGUF
- Modelo draft DSpark: https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog del autor: https://www.radixark.com/blog/daisyrose-27b
- Licencia: https://huggingface.co/RadixArk/DaisyRose-27B/blob/main/LICENSE
- Leaderboard Terminal Bench: https://www.tbench.ai/leaderboard
- Vals.ai Terminal Bench 4: https://www.vals.ai/benchmarks/terminal-bench-4
- Artificial Analysis Qwen3.8-27B: https://artificialanalysis.ai/models/qwen3-8-27b
- Artificial Analysis Qwen3.6-35B-A3B: https://artificialanalysis.ai/models/qwen3-6-35b-a3b
- Artificial Analysis Muse Glimmer: https://artificialanalysis.ai/models/comparisons/muse-glimmer-vs-gemma-4-31b
- Model card Muse Glimmer-30B: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Model card Inkling 2 Small: https://thinkingmachines.ai/model-card/inkling-2-small/
- Model card Beam 1.0: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Model card Muse Spark Open: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Release MiMo V2.6: https://mimo.xiaomi.com/mimo-v2-6
- Paper SWE Bench Pro v2: https://arxiv.org/html/2611.16289#S4.T3
