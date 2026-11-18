# RadixArk/DaisyRose-27B

## Resumen
DaisyRose-27B es el primer modelo publicado por RadixArk, un fine-tune multimodal de Qwen3.8-27B orientado a razonamiento y tareas de agente de horizonte largo. Su particularidad es que se ha entrenado exclusivamente con aprendizaje por refuerzo (RL), sin supervisión directa (SFT) ni destilación, partiendo de unas 1.200 tareas de agente curadas con sesiones de hasta 1M de tokens. El entrenamiento se prolongó durante 18 días sobre 144 GPU H200.

El modelo conserva íntegramente la arquitectura, el tokenizador y la plantilla de chat de Qwen3.8-27B, además de su comprensión de imágenes y su ventana de contexto de 256K tokens, por lo que puede sustituir al modelo base en stacks de inferencia y post-entrenamiento sin cambios. Con 27.781.427.952 parámetros en formato safetensors, se distribuye en BF16, FP8 y NVFP4 bajo licencia Apache-2.0.

La relevancia actual radica en que demuestra que el RL puro sobre tareas de agente puede mejorar de forma medible el rendimiento en benchmarks de terminal, ingeniería de software y seguimiento de instrucciones sin necesidad de datos supervisados adicionales. Terminal Bench 4.1 pasa de 5,6 a 12,0 pass@1 y la mayoría de los benchmarks de código, razonamiento e instrucciones también mejoran respecto al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.8-27B); no se detalla en la informacion disponible |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE; la tabla de benchmarks lo lista como 27B activos y 27B totales) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | BF16 (pesos publicados), FP8 y NVFP4 (repositorios separados) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento
DaisyRose-27B mantiene la arquitectura del modelo base Qwen3.8-27B, un transformer multimodal con capacidad de comprensión de imágenes y una ventana de contexto de 256K tokens. No se han publicado en la informacion disponible detalles adicionales sobre el número de capas, dimensiones ocultas, mecanismos de atención ni innovaciones arquitectónicas propias, ya que el trabajo de RadixArk se centra exclusivamente en el post-entrenamiento.

El entrenamiento consistió únicamente en aprendizaje por refuerzo sobre aproximadamente 1.200 tareas de agente de horizonte largo, con sesiones de hasta 1M de tokens, durante 18 días en 144 GPU H200. No hubo SFT ni destilación. El modelo conserva el tokenizador y la plantilla de chat del base, incluyendo el modo de razonamiento (thinking) con los ajustes recomendados de temperatura 1.0, top_p 0.95, top_k 20, min_p 0 y esfuerzo de razonamiento xhigh. Se publica además un modelo draft asociado, Qwen3.8-27B-DSpark, para decodificación especulativa.

## Capacidades
- Generación de texto y razonamiento multimodal (entrada de imagen y texto, salida de texto).
- Razonamiento de horizonte largo con modo thinking y esfuerzo de razonamiento configurable (xhigh por defecto en la plantilla).
- Ejecución de tareas de agente en terminal y entornos de línea de comandos (Terminal Bench).
- Ingeniería de software y resolución de issues en repositorios (DeepSWE, SWE Bench Pro).
- Seguimiento preciso de instrucciones (IFBench).
- Razonamiento científico y de nivel experto (GPQA Diamond, HLE).
- Capacidades multilingües: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no se detalla explícitamente en la model card, aunque las tareas de agente evaluadas implican uso de herramientas.
- Compatibilidad con endpoints (tag endpoints_compatible) y sustitución directa del modelo base en stacks existentes.

## Casos de uso
- Automatización de tareas de terminal y administración de sistemas: el modelo puede operar en entornos de línea de comandos resolviendo tareas multi-paso, como demuestra su mejora en Terminal Bench 4.1 (5,6 a 12,0 pass@1) gracias al entrenamiento RL sobre tareas de agente.
- Resolución de issues en repositorios de código: con 94,7 en SWE Bench Pro v2 y 46,2 en DeepSWE v1.1, es adecuado para pipelines de revisión y parcheo automático de código en producción.
- Asistentes de desarrollo integrados en CI/CD: al conservar la plantilla de chat y el tokenizador de Qwen3.8-27B, se puede desplegar como drop-in en herramientas existentes que ya soporten el modelo base.
- Análisis de documentos largos y mixtos (texto e imagen): la ventana de 256K tokens y la comprensión de imágenes permiten procesar informes extensos con figuras en una sola pasada.
- Razonamiento científico y respuesta a preguntas de nivel experto: con 90,7 en GPQA Diamond y 34,3 en HLE, sirve para asistentes de investigación que requieran cadenas de razonamiento largas.
- Seguimiento estricto de instrucciones en flujos de negocio: su 82,4 en IFBench lo hace apto para tareas donde el formato y las restricciones de salida son críticos.
- Despliegue con cuantización agresiva: las variantes FP8 y NVFP4 permiten servir el modelo en infraestructura con memoria limitada manteniendo, según el autor, diferencias inferiores a un punto en los benchmarks evaluados en ambos formatos.

## Benchmarks y rendimiento

| Benchmark | DaisyRose-27B | Qwen3.8-27B | Muse Glimmer-30B | Qwen3.6-35B-A3B | MiMo V2.6 Flash | Inkling 2 Small | Beam 1.0 | Muse Spark Open | GPT-6 Luna |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Parametros activos | 27B | 27B | 30B | 3B | 15B | 17B | 23B | 42B | – |
| Parametros totales | 27B | 27B | 30B | 35B | 309B | 594B | 501B | 816B | – |
| Terminal Bench 4.1 | 12,0 | 5,6 | 0,5 | 0,0 | 16,1 | 13,0 | 6,4 | 6,6 | 15,2 |
| Terminal Bench 2.1 | 75,5 | 73,0 | 51,7 | 44,9 | 87,6 | 81,3 | 80,1 | 76,4 | 73,0 |
| DeepSWE v1.1 | 46,2 | 42,2 | 4,4 | 0,0 | 67,9 | 72,1 | 43,3 | 60,0 | 66,6 |
| SWE Bench Pro v2 | 94,7 | 91,3 | 80,4 | 73,3 | – | 97,7 | – | 95,0 | – |
| HLE (solo texto) | 34,3 | 33,9 | 22,0 | 22,2 | 35,1 | 44,1 | 34,7 | 43,9 | 38,5 |
| IFBench | 82,4 | 79,5 | 77,0 | 64,4 | – | – | 79,6 | – | – |
| GPQA Diamond | 90,7 | 89,2 | 83,5 | 86,0 | 88,7 | 93,0 | 90,6 | 89,0 | 90,5 |

Los resultados de DaisyRose-27B corresponden al mayor de sus ejecuciones en BF16 y FP8, con menos de un punto de diferencia entre ambas. Se emplearon los ajustes de thinking recomendados por el modelo base (temperatura 1.0, top_p 0.95, top_k 20, min_p 0, esfuerzo xhigh) y distintos arneses según el benchmark (mini-swe-agent, Terminus 2, simple-evals), promediando entre 4 y 8 repeticiones por tarea.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo para pesos, más memoria para KV cache y activaciones; se recomienda al menos 80 GB por GPU.
- VRAM estimada en FP8: en torno a 28 GB para pesos, más overhead; viable en GPU de 40-48 GB.
- VRAM estimada en NVFP4: en torno a 14-16 GB para pesos, más overhead; viable en GPU de consumo alto.
- GPU recomendadas: H200 (usadas en el entrenamiento), H100 y A100 de 80 GB para BF16; RTX 4090 (24 GB) solo con cuantizaciones NVFP4 y contexto reducido.
- Cabe en GPU de consumo: sí, en el caso de NVFP4 y con contexto limitado; en BF16 no cabe en GPU de consumo.
- Opciones de despliegue: transformers (librería indicada), endpoints compatibles; vLLM, llama.cpp, Ollama o TGI no se mencionan explícitamente en la informacion disponible.
- Decodificación especulativa: disponible mediante el draft Qwen3.8-27B-DSpark.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Terminal Bench 4.1 | SWE Bench Pro v2 | GPQA Diamond | Licencia |
| --- | --- | --- | ---: | ---: | ---: | --- |
| DaisyRose-27B | 27B / 27B | 256K | 12,0 | 94,7 | 90,7 | Apache-2.0 |
| Qwen3.8-27B (base) | 27B / 27B | 256K | 5,6 | 91,3 | 89,2 | no disponible en la informacion |
| Muse Glimmer-30B | 30B / 30B | no disponible | 0,5 | 80,4 | 83,5 | no disponible en la informacion |
| Qwen3.6-35B-A3B | 35B / 3B | no disponible | 0,0 | 73,3 | 86,0 | no disponible en la informacion |
| MiMo V2.6 Flash | 309B / 15B | no disponible | 16,1 | – | 88,7 | no disponible en la informacion |

Frente a su modelo base, DaisyRose-27B mejora en todos los benchmarks reportados, con especial énfasis en tareas de agente (Terminal Bench 4.1). Frente a modelos de mayor tamaño como MiMo V2.6 Flash o Inkling 2 Small, queda por debajo en Terminal Bench 4.1 y DeepSWE, pero es competitivo en SWE Bench Pro v2, IFBench y GPQA Diamond con un coste de inferencia mucho menor al tener solo 27B de parámetros activos.

## Limitaciones y advertencias
- Sesgos conocidos: no se documentan en la informacion disponible; al heredar el modelo base, es probable que arrastre sus sesgos, pero no se detalla.
- Riesgo de alucinación: no se cuantifica en la model card; los resultados en HLE (34,3) y GPQA Diamond (90,7) sugieren buen rendimiento en razonamiento experto, pero no eliminan el riesgo en dominios abiertos.
- Limitaciones de contexto o idioma: el contexto es de 256K tokens; los idiomas soportados no están disponibles. El rendimiento en tareas de agente está medido con arneses concretos (mini-swe-agent, Terminus 2) y puede no transferirse a otros entornos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio por si incluye términos adicionales.
- Caveats para producción: el modelo se entrenó solo con RL sobre unas 1.200 tareas, lo que puede limitar la generalización fuera de dominios de agente y código; los benchmarks propios usan repeticiones y arneses específicos, por lo que las cifras no son directamente comparables con las de terceros. El rendimiento en BF16 y FP8 difiere en menos de un punto según el autor, pero no se reportan datos para NVFP4.

## Enlaces
- Modelo en Hugging Face (BF16): https://huggingface.co/RadixArk/DaisyRose-27B
- Variante FP8: https://huggingface.co/RadixArk/DaisyRose-27B-FP8
- Variante NVFP4: https://huggingface.co/RadixArk/DaisyRose-27B-NVFP4
- Modelo draft para decodificación especulativa: https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de RadixArk: https://www.radixark.com/blog/daisyrose-27b
- Licencia: https://huggingface.co/RadixArk/DaisyRose-27B/blob/main/LICENSE
- Leaderboard de Terminal Bench: https://www.tbench.ai/leaderboard
- Benchmarks de Terminal Bench 4 en Vals.ai: https://www.vals.ai/benchmarks/terminal-bench-4
- Artificial Analysis, Qwen3.8-27B: https://artificialanalysis.ai/models/qwen3-8-27b
- Artificial Analysis, Qwen3.6-35B-A3B: https://artificialanalysis.ai/models/qwen3-6-35b-a3b
- Artificial Analysis, comparativa Muse Glimmer: https://artificialanalysis.ai/models/comparisons/muse-glimmer-vs-gemma-4-31b
- Model card de Muse Glimmer-30B: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Model card de Inkling 2 Small: https://thinkingmachines.ai/model-card/inkling-2-small/
- Model card de Beam 1.0: https://huggingface.co/reflection/Beam-1.0-501B-A23B
- Model card de Muse Spark Open: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Release de MiMo V2.6: https://mimo.xiaomi.com/mimo-v2-6
- Paper de SWE Bench Pro v2: https://arxiv.org/html/2611.16289#S4.T3
