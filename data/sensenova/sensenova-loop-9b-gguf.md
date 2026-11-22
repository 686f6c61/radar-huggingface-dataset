# sensenova/SenseNova-Loop-9B-GGUF

## Resumen

SenseNova-Loop-9B es un modelo multimodal de tipo image-text-to-text desarrollado por SenseTime (organización sensenova) que explora la eficiencia de parámetros mediante una arquitectura de transformer con bucles (*looped transformer*). Con aproximadamente 9.200 millones de parámetros, el modelo reutiliza pesos de capas intermedias para ampliar la profundidad computacional sin incrementar el presupuesto de parámetros: 32 capas físicas se ejecutan como 56 capas efectivas por pase forward. Está diseñado para razonamiento complejo, generación de código, uso de herramientas y tareas multimodales.

La arquitectura combina un bloque central compartido que se ejecuta dos veces, conexiones hiperbólicas restringidas a variedad (*manifold-constrained hyper-connections*, mHC) de doble flujo y atención híbrida que intercala atención lineal y atención completa en un patrón repetido de cuatro capas. El entrenamiento incluye texto, imágenes, código y trayectorias de uso de herramientas, con una longitud de contexto extendida hasta 512K tokens. El modelo se publica bajo licencia Apache 2.0, con pesos en formato GGUF (esta ficha) y también en AWQ de 4 bits.

La relevancia actual del modelo reside en su propuesta de eficiencia: consigue resultados competitivos con modelos de mayor tamaño en tareas agénticas y de análisis de datos, y ofrece un despliegue de bajo consumo de memoria (aproximadamente 15 GiB de VRAM para inferencia multimodal a 256K de contexto con pesos de 4 bits y caché KV de 8 bits).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bloques en bucle (*looped transformer*), atención híbrida (lineal + completa) y conexiones mHC de doble flujo |
| Parametros totales | 9.200.240.000 (aproximadamente 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 512K tokens (entrenamiento); inferencia multimodal a 256K con aproximadamente 15 GiB |
| Tipos de cuantizacion | GGUF (esta ficha); AWQ de 4 bits (versión oficial separada) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo actual); safetensors en el modelo base; AWQ en repo separado |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer con un bloque central compartido que se ejecuta en bucle: 24 capas decodificadoras se ejecutan dos veces en secuencia, de modo que las 32 capas físicas producen 56 ejecuciones de capa por pase forward. Esta reutilización de pesos amplía la profundidad computacional efectiva sin aumentar el número de parámetros. El bloque en bucle incorpora conexiones hiperbólicas restringidas a variedad (mHC) de doble flujo, que enrutan y combinan información entre dos flujos residuales mediante asignaciones aprendidas. La atención es híbrida: intercala atención lineal y atención completa en un patrón repetido de cuatro capas.

El recetario de entrenamiento incluye texto, imágenes, código y trayectorias de uso de herramientas, con la longitud de contexto extendida hasta 512K tokens. La model card no detalla el número exacto de tokens de entrenamiento ni la composición porcentual del dataset, ni si se aplicaron técnicas de RLHF o DPO. El modelo se publicó primero como Preview (2026-10-31) y la versión oficial (2026-11-17) mejora el rendimiento en tareas agénticas, de código y de análisis de datos respecto a la Preview.

## Capacidades

- Generación de texto y razonamiento multi-paso.
- Generación de código y tareas de ingeniería de software (evaluado en Terminal-Bench 2.1 y NL2Repo).
- Comprensión de imágenes y generación de texto a partir de ellas (pipeline image-text-to-text).
- Uso de herramientas (*tool calling*) y trayectorias agénticas, según el recetario de entrenamiento.
- Análisis de datos (evaluado en AIDABench) y automatización de flujos (AutomationBench).
- Comprensión de contexto largo, con ventana de hasta 512K tokens en entrenamiento.
- Capacidades multilingües limitadas a inglés y chino.
- Generación de artefactos visuales y web en los ejemplos de la model card (escenas 3D, SVG, webs interactivas, carteles, diseño editorial).

## Casos de uso

- **Automatización de flujos de trabajo agénticos**: el modelo puede encadenar pasos de razonamiento y llamadas a herramientas gracias a su entrenamiento en trayectorias de uso de herramientas y a su contexto de hasta 512K tokens, adecuado para tareas de automatización evaluadas en AutomationBench.
- **Asistencia en ingeniería de software**: integrable en pipelines de CI/CD para generar parches, interpretar errores de terminal y resolver tareas de reparación de repositorios, dado su rendimiento en Terminal-Bench 2.1 (59,55) y NL2Repo (41,36).
- **Análisis de datos conversacional**: puede interpretar tablas, gráficos e imágenes junto con texto para responder preguntas analíticas, con resultados de 65,31 en AIDABench, competitivos con modelos de mayor tamaño.
- **Generación de interfaces y artefactos web**: los ejemplos de la model card muestran generación de webs interactivas, SVG y carteles animados, útil para prototipado rápido de UI y contenido visual.
- **Atención al cliente multimodal**: puede gestionar conversaciones multi-turno con imágenes adjuntas (capturas, productos) y contexto largo, lo que permite mantener historiales extensos sin truncamiento.
- **Procesamiento de documentos largos con imágenes**: con contexto de hasta 256K en inferencia multimodal y aproximadamente 15 GiB de VRAM en 4 bits, es viable para analizar informes, manuales o expedientes que combinan texto e imágenes.
- **Prototipado de escenas 3D y contenido creativo**: la model card incluye ejemplos de escenas 3D rotatorias y carteles animados, lo que lo hace adecuado para herramientas de creación asistida.

## Benchmarks y rendimiento

| Benchmark | SenseNova-Loop-9B | SenseNova-Loop-9B-Preview | Qwen3.8-27B |
|---|---|---|---|
| AutomationBench | 36,67 | 14,33 | 36,67 |
| Terminal-Bench 2.1 | 59,55 | 40,45 | no disponible |
| GAIA | 69,90 | 37,86 | no disponible |
| NL2Repo | 41,36 | no disponible | 44,60 |
| AIDABench | 65,31 | no disponible | 65,01 |

La model card indica que la versión oficial supera a la Preview en los siete benchmarks mostrados, pero solo se detallan los valores anteriores. No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- **VRAM estimada**: aproximadamente 15 GiB de memoria GPU para inferencia multimodal a 256K de contexto con pesos de 4 bits y caché KV de 8 bits, según la model card.
- **GPU recomendadas**: no se especifican modelos concretos en la información disponible; por el perfil de memoria, una GPU con 16-24 GiB (por ejemplo, RTX 4090, A10G, L4) podría alojar la configuración de 4 bits a contextos moderados, aunque no está confirmado por el autor.
- **Consumer GPU**: plausible en GPUs de 24 GiB con cuantización de 4 bits y contexto reducido; no confirmado explícitamente.
- **Opciones de despliegue**: el repo GGUF es compatible con llama.cpp y derivados (Ollama, LM Studio); la librería indicada es transformers con código personalizado (`custom_code`); existe versión AWQ oficial para vLLM/TGI. La model card no detalla configuraciones de servido.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B | ~9B | 512K (entrenamiento) | Apache 2.0 | GGUF, AWQ, safetensors | Arquitectura en bucle, multimodal |
| Qwen3.8-27B | 27B (según denominación) | no disponible | no disponible | no disponible | Referencia de comparación en la model card; supera en NL2Repo (44,60 vs 41,36), empata en AIDABench y AutomationBench |
| SenseNova-Loop-9B-Preview | ~9B | no disponible | Apache 2.0 | no disponible | Versión previa; inferior en los siete benchmarks mostrados |

No se dispone de datos suficientes para comparar con otras alternativas multimodales de tamaño similar (por ejemplo, familias Qwen-VL o InternVL) en la información proporcionada.

## Limitaciones y advertencias

- **Idiomas**: solo inglés y chino; el rendimiento en castellano no está evaluado y probablemente sea limitado.
- **Sesgos**: no se documentan sesgos específicos en la información disponible; al entrenarse con datos web y multimodales, es esperable un sesgo heredado no cuantificado.
- **Alucinación**: no se reportan tasas de alucinación; como modelo generativo multimodal, existe riesgo en tareas de descripción de imágenes y análisis de datos.
- **Contexto**: aunque el entrenamiento alcanza 512K, la inferencia multimodal práctica se documenta a 256K con aproximadamente 15 GiB; contextos mayores requieren más memoria.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo incluye código personalizado (`custom_code`) que debe revisarse para cumplimiento y reproducibilidad.
- **Producción**: la model card no detalla latencia, throughput ni estabilidad en servido; la versión GGUF es una cuantización de la comunidad/oficial sin garantías de paridad exacta con el modelo base.
- **Datos incompletos**: no se especifican tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/sensenova/SenseNova-Loop-9B-GGUF
- Hugging Face (modelo base): https://huggingface.co/sensenova/SenseNova-Loop-9B
- Hugging Face (Preview): https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Hugging Face (AWQ): https://huggingface.co/sensenova/SenseNova-Loop-9B-AWQ
- ModelScope: https://modelscope.cn/models/sensenova/SenseNova-Loop-9B
- ModelScope (Preview): https://modelscope.cn/models/SenseNova/SenseNova-Loop-9B-Preview
- GitHub: https://github.com/OpenSenseNova/SenseNova-Loop
- Licencia en GitHub: https://github.com/OpenSenseNova/SenseNova-Loop/blob/main/LICENSE
- Discord: https://discord.com/invite/BuTXPHmQub
