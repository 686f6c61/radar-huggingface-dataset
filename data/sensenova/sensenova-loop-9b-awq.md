# sensenova/SenseNova-Loop-9B-AWQ

## Resumen

SenseNova-Loop-9B-AWQ es la versión cuantizada a 4 bits con AWQ del modelo multimodal SenseNova-Loop-9B, desarrollado por SenseTime (organización sensenova). El modelo base se publicó el 17 de noviembre de 2026 y esta variante cuantizada apareció al día siguiente, el 18 de noviembre de 2026, con el objetivo de facilitar el despliegue en entornos con memoria limitada. Acepta entradas de texto e imagen y genera texto, y está pensado para tareas de razonamiento complejo, código, uso de herramientas y análisis de datos.

La arquitectura es un transformer con un bloque central "looped": 32 capas físicas de decoder se expanden a 56 ejecuciones de capa por forward pass mediante la reutilización de 24 capas intermedias que se ejecutan dos veces. Incorpora además conexiones hiperbólicas restringidas a variedad (mHC) de dos flujos y atención híbrida que alterna atención lineal y atención completa en un patrón repetido de cuatro capas. El modelo tiene 9.412.963.952 parámetros totales (aproximadamente 9B) y extiende su contexto hasta 512K tokens durante el entrenamiento.

Con pesos de 4 bits y caché KV de 8 bits, la inferencia multimodal a 256K de contexto requiere aproximadamente 15 GiB de VRAM, lo que lo sitúa en el rango de GPUs de consumo alto o profesionales de gama media. La licencia Apache 2.0 y la disponibilidad de pesos AWQ y GGUF el mismo día del lanzamiento lo convierten en una opción atractiva para evaluación rápida y despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con bloque central "looped" (sensenova_loop), mHC de dos flujos, atención híbrida lineal/completa |
| Parámetros totales | 9.412.963.952 (aproximadamente 9B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512K tokens (entrenamiento); inferencia multimodal probada a 256K |
| Tipos de cuantización | AWQ 4 bits (esta variante); GGUF disponible en repo separado; BF16 en modelo base |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom_code); GGUF disponible en variante aparte |

## Arquitectura y entrenamiento

El modelo se basa en un transformer decoder con una innovación central: la reutilización de pesos mediante un bloque "looped". De las 32 capas físicas del decoder, 24 capas intermedias se ejecutan dos veces en secuencia, produciendo 56 ejecuciones de capa por forward pass. Esto permite aumentar la profundidad computacional sin incrementar proporcionalmente el número de parámetros. El bloque looped incorpora conexiones hiperbólicas restringidas a variedad (mHC) de dos flujos, que aprenden mapeos para enrutar y combinar información entre dos flujos residuales dentro del bloque.

La atención es híbrida: el decoder intercala atención lineal y atención completa en un patrón repetido de cuatro capas. El entrenamiento incluye texto, imágenes, código y trayectorias de uso de herramientas, con la longitud de contexto extendida hasta 512K tokens. No se especifica en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO. La variante AWQ cuantiza a 4 bits los embeddings de tokens y la cabeza de salida, e incluye un modelo draft opcional en el subdirectorio `mtp/` para decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento complejo en inglés y chino.
- Comprensión de imágenes y generación de texto a partir de ellas (image-text-to-text).
- Generación de código y tareas de programación.
- Uso de herramientas (tool calling / function calling) y trayectorias agénticas de múltiples pasos.
- Análisis de datos y tareas de razonamiento sobre datos estructurados.
- Comprensión de contexto largo gracias a la ventana de hasta 512K tokens.
- Capacidades multimodales que combinan texto e imagen en una misma entrada.
- Soporte de decodificación especulativa mediante el modelo draft opcional en `mtp/`.
- Tareas de razonamiento multi-step y agentes autónomos.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de hasta 512K tokens, manteniendo el hilo de la conversación y el historial de imágenes o documentos adjuntos sin truncamientos agresivos.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para generar, revisar y corregir código, así como para invocar herramientas externas durante el proceso de desarrollo.
- Análisis de datos asistido: con capacidades agénticas y de razonamiento multi-step, puede interpretar datos tabulares, generar consultas y producir informes, con resultados competitivos frente a modelos de mayor tamaño en benchmarks como AIDABench (65,31 frente a 65,01 de Qwen3.8-27B).
- Agentes autónomos de navegación y automatización: su soporte de tool calling y razonamiento multi-paso permite construir agentes que ejecutan tareas encadenadas, como consultar APIs, procesar resultados y tomar decisiones.
- Procesamiento de documentos con imágenes: la combinación de entrada de imagen y texto permite extraer información de capturas, diagramas o documentos escaneados y generar resúmenes o respuestas contextualizadas.
- Despliegue en entornos con VRAM limitada: con pesos de 4 bits y caché KV de 8 bits, la inferencia multimodal a 256K de contexto requiere aproximadamente 15 GiB de VRAM, lo que permite ejecutarlo en GPUs de consumo alto o profesionales de gama media.
- Generación de contenido visual y web: los ejemplos de la model card incluyen escenas 3D, SVG, webs interactivas y pósteres animados, lo que sugiere uso en prototipado y generación de contenido front-end.

## Benchmarks y rendimiento

Los datos disponibles en la información proporcionada comparan el modelo base con Qwen3.8-27B en dos evaluaciones:

| Benchmark | SenseNova-Loop-9B | Qwen3.8-27B |
|---|---|---|
| NL2Repo | 41,36 | 44,60 |
| AIDABench | 65,31 | 65,01 |

No se han publicado en la información disponible resultados de benchmarks adicionales como MMLU, HumanEval o GSM8K, ni datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: aproximadamente 15 GiB de GPU para inferencia multimodal a 256K de contexto con pesos de 4 bits y caché KV de 8 bits.
- El tamaño del repositorio es de 6,1 GB, lo que refleja los pesos cuantizados a 4 bits.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por el perfil de VRAM, cabría en GPUs con 16 GB o más (por ejemplo, RTX 4090, A100, H100), aunque no se confirma oficialmente.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 16 GB o más de VRAM, aunque no se detalla oficialmente.
- Opciones de despliegue: se requiere un runtime que soporte el layout AWQ de este repositorio; el modelo usa `custom_code` y arquitectura `sensenova_loop`. Se apunta al repositorio raíz para el modelo principal y a `mtp/` para el modelo draft opcional. No se especifican frameworks concretos (vLLM, llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-AWQ | 9,41B | 512K (entrenamiento) | Apache 2.0 | Hugging Face, ModelScope | Multimodal, looped transformer, AWQ 4 bits |
| Qwen3.8-27B | 27B (aproximado) | No disponible | No disponible | No disponible | Referencia en benchmarks NL2Repo y AIDABench |
| SenseNova-Loop-9B (base) | 9,41B | 512K | Apache 2.0 | Hugging Face, ModelScope | Versión BF16 del mismo modelo |
| SenseNova-Loop-9B-Preview | No disponible | No disponible | Apache 2.0 | Hugging Face, ModelScope | Versión preliminar previa al lanzamiento oficial |

La comparativa se limita a los datos disponibles; no se han encontrado especificaciones completas de Qwen3.8-27B ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos en la información disponible; como todo modelo entrenado con datos web, es probable que herede sesgos presentes en los datos.
- Riesgo de alucinación: no se cuantifica en la información disponible; debe evaluarse en el dominio de aplicación antes de producción.
- Limitaciones de contexto o idioma: los idiomas soportados son inglés y chino; no se garantiza un rendimiento equivalente en castellano u otros idiomas. El contexto de 512K es de entrenamiento y la inferencia multimodal probada se limita a 256K.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de la licencia del modelo base y de las dependencias de `custom_code`.
- Caveats para producción: requiere un runtime que soporte el layout AWQ específico y la arquitectura `sensenova_loop` con `custom_code`; la cuantización AWQ puede degradar ligeramente la calidad frente a BF16. El modelo draft en `mtp/` es opcional y su uso debe validarse.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es un lanzamiento muy reciente y con poca validación comunitaria todavía.

## Enlaces

- Hugging Face (AWQ): https://huggingface.co/sensenova/SenseNova-Loop-9B-AWQ
- Hugging Face (modelo base): https://huggingface.co/sensenova/SenseNova-Loop-9B
- Hugging Face (Preview): https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Hugging Face (GGUF): https://huggingface.co/sensenova/SenseNova-Loop-9B-GGUF
- ModelScope (modelo base): https://modelscope.cn/models/sensenova/SenseNova-Loop-9B
- ModelScope (Preview): https://modelscope.cn/models/SenseNova/SenseNova-Loop-9B-Preview
- GitHub: https://github.com/OpenSenseNova/SenseNova-Loop
- Licencia en GitHub: https://github.com/OpenSenseNova/SenseNova-Loop/blob/main/LICENSE
- Configuración de arquitectura: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview/blob/main/config.json
- Discord: https://discord.com/invite/BuTXPHmQub
