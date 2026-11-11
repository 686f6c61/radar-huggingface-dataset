# prithivMLmods/MiniMax-H3-Image-PE-NVFP4-MTP-GGUF

## Resumen

MiniMax-H3-Image-PE es el modelo de expansión de prompts de MiniMax para su generador de imágenes MiniMax-H3-Image. Desarrollado por MiniMax y afinado a partir de Qwen3.8-27B (licencia Apache 2.0), transforma una petición breve del usuario en una descripción de imagen detallada y recomienda una relación de aspecto, devolviendo el resultado como JSON con los campos `expanded_caption` y `aspect_ratio`, con la salida restringida por esquema mediante XGrammar. El modelo funciona con modo de razonamiento activado por defecto (`reasoning_effort` xhigh, hasta 4.096 tokens incluyendo el razonamiento), que se devuelve por separado del texto final.

La ficha que nos ocupa, `prithivMLmods/MiniMax-H3-Image-PE-NVFP4-MTP-GGUF`, es una cuantización comunitaria en NVFP4 (FP4 de 4 bits nativo de NVIDIA) del modelo base, empaquetada en formato GGUF e incrementada con cabezas de Multi-Token Prediction (MTP) para decodificación especulativa integrada en los propios pesos. Con 27.320.698.658 parámetros totales y un repositorio de 18,8 GB, está pensada para inferencia local acelerada por hardware en GPUs NVIDIA Blackwell (RTX PRO 6000, serie RTX 50, B200, B300), donde los Tensor Cores FP4 se aprovechan de forma nativa.

Su relevancia actual es doble: por un lado, demuestra el patrón de despliegue de modelos de 27B en FP4 con decodificación especulativa MTP (un 50,3% más de velocidad de generación según el autor); por otro, expone las limitaciones del ecosistema de cuantizaciones comunitarias, ya que la licencia del modelo base (MiniMax-H3-Image Community License Agreement) no es Apache 2.0 y restringe ciertos usos. El pipeline declarado es image-text-to-text y el único idioma soportado es inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B) con cabezas MTP para decodificación especulativa |
| Parámetros totales | 27.320.698.658 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens en la prueba de referencia del autor; no se especifica el máximo arquitectónico |
| Tipos de cuantización | NVFP4 (FP4, 4 bits) con tensores MTP preservados; proyección multimodal mmproj en GGUF |
| Idiomas soportados | Inglés (en) |
| Licencia | MiniMax-H3-Image Community License Agreement (no Apache 2.0) |
| Formato de pesos | GGUF (NVFP4 + MTP) y mmproj GGUF; el modelo base original en safetensors/FP4 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27B parámetros derivado de Qwen3.8-27B mediante fine-tuning supervisado para la tarea de expansión de prompts de generación de imágenes. La salida está fuertemente estructurada: el modelo genera JSON validado contra un esquema mediante XGrammar, con dos campos obligatorios (`expanded_caption` y `aspect_ratio`), y opera con razonamiento explícito separado de la respuesta final, con un presupuesto máximo de 4.096 tokens que incluye la cadena de razonamiento. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación técnica principal de esta ficha concreta es la integración de Multi-Token Prediction (MTP) en los pesos cuantizados. A diferencia de la decodificación especulativa clásica, que requiere un modelo borrador separado y más pequeño, los ficheros MTP GGUF incorporan cabezas adicionales de predicción dentro de la arquitectura principal que anticipan varios tokens futuros en un solo paso forward. El autor reporta que esto eleva la velocidad de generación de 74,94 a 112,64 tokens/s (`draft_n_max=2`), un incremento del 50,3%, con un coste de solo 0,9 GB adicionales de tamaño de fichero (17,0 a 17,9 GB). La cuantización NVFP4 está optimizada para los Tensor Cores FP4 de las GPU Blackwell (SM120, GB202).

## Capacidades

- Expansión de prompts texto-a-imagen: convierte una petición corta en una descripción detallada y recomienda relación de aspecto, en formato JSON validado por esquema.
- Razonamiento explícito con presupuesto configurable (`reasoning_effort` xhigh por defecto, hasta 4.096 tokens), devuelto por separado de la respuesta.
- Salida estructurada garantizada mediante XGrammar, adecuada para integración en pipelines automatizados.
- Capacidades multimodales de entrada (pipeline image-text-to-text y fichero mmproj de proyección visual de 931 MB).
- Modo de edición de imagen: el modelo describe qué se preserva y qué se cambia y devuelve un `target_aspect_ratio`; según la model card, el soporte de edición sigue en desarrollo y solo se proporciona un prompt de tarea y un ejemplo de ensamblado de mensajes para un modelo visión-lenguaje a elección del usuario.
- Decodificación especulativa MTP integrada en los pesos, sin modelo borrador externo.
- Multilingüismo: limitado a inglés; no se declaran otras lenguas.

## Casos de uso

- Expansión automática de prompts en un pipeline de generación de imágenes: el modelo recibe la petición breve del usuario y devuelve un `expanded_caption` detallado más la relación de aspecto recomendada, lista para inyectarse directamente en MiniMax-H3-Image sin intervención humana.
- Integración en interfaces de creación de imágenes para consumidores: la salida JSON validada por XGrammar permite renderizar la relación de aspecto sugerida en la UI y mostrar el prompt expandido editable antes de generar.
- Preprocesado por lotes de catálogos de prompts: con 8.192 tokens de contexto y 112,64 tokens/s de generación en RTX PRO 6000, se pueden procesar miles de peticiones cortas por hora en una sola GPU.
- Servicio de reescritura de prompts vía API: el modelo puede desplegarse con SGLang (0.5.23 o superior) para atender peticiones concurrentes de expansión con salida estructurada.
- Edición de imágenes asistida (en desarrollo): usar el modo de edición para describir transformaciones preservando elementos de la imagen original y devolver la relación de aspecto objetivo, combinándolo con un VLM externo para el ensamblado de mensajes.
- Prototipado local en estaciones de trabajo Blackwell: desarrolladores con RTX PRO 6000 o RTX 50-series pueden ejecutar el modelo con llama.cpp y MTP para iterar sobre prompts sin depender de la nube, con un consumo pico de 16,34 GiB de VRAM.
- Investigación sobre decodificación especulativa: el par de fichas con y sin MTP del mismo autor sirve como caso de estudio reproducible del impacto de MTP en throughput con cuantización FP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta métricas de velocidad de inferencia medidas en hardware concreto:

| Métrica | Sin MTP | Con MTP |
|---|---:|---:|
| Tamaño de fichero | 17 GB | 17,9 GB |
| Velocidad media de generación | 74,94 tokens/s | 112,64 tokens/s |
| Decodificación especulativa | Desactivada | MTP (`draft_n_max=2`) |
| Tensores MTP | No preservados | Preservados |
| Ejecuciones de prueba | 5 | 5 |
| Mejora relativa | — | +50,3% (1,50×) |

Prueba de referencia NVFP4 en NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB VRAM), `llama-cli`, `-ngl 99`:

| Métrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 307,96 tokens/s |
| Velocidad media de generación | 112,64 tokens/s |
| Tiempo total de ejecución | 66,0 s |
| Longitud de contexto | 8.192 tokens |
| KV cache (K) | `q8_0` |
| VRAM pico | 16,34 GiB |
| Utilización de GPU pico | 95% |
| Capas offloaded | 99 |
| Semilla | 42 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19 GiB según la model card para la ruta Modular Diffusers con pesos FP4; 16,34 GiB de pico medidos con llama.cpp y contexto de 8.192 tokens con KV cache `q8_0`.
- GPU recomendadas: NVIDIA Blackwell exclusivamente para aprovechar NVFP4 de forma nativa, es decir, RTX PRO 6000, serie RTX 50, B200 y B300 (SM120, GB202). En arquitecturas anteriores el formato FP4 no cuenta con aceleración por hardware.
- ¿Cabe en GPU de consumo? Sí, en GPUs Blackwell de consumo de gama alta (serie RTX 50) con al menos 20 GB de VRAM efectiva; el pico medido de 16,34 GiB deja margen en tarjetas de 24 GB.
- Opciones de despliegue: llama.cpp (`llama-cli` con `--spec-type draft-mtp`), SGLang 0.5.23 o superior, y bloques Modular Diffusers (esta ruta ejecuta activaciones en bf16, por lo que las salidas difieren ligeramente de SGLang).
- Latencia y throughput: 307,96 tokens/s de procesamiento de prompt y 112,64 tokens/s de generación con MTP en RTX PRO 6000; 74,94 tokens/s sin MTP. Los resultados dependen de la configuración y del build de software.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Velocidad de generación | Licencia |
|---|---|---:|---|---|---|
| MiniMax-H3-Image-PE-NVFP4-MTP-GGUF (esta ficha) | 27,3B | 8.192 en prueba | GGUF NVFP4 + MTP | 112,64 tokens/s (RTX PRO 6000) | MiniMax-H3-Image Community License |
| MiniMax-H3-Image-PE-NVFP4-GGUF | 27,3B | 8.192 en prueba | GGUF NVFP4 sin MTP | 74,94 tokens/s (RTX PRO 6000) | MiniMax-H3-Image Community License |
| MiniMax-H3-Image-PE (base) | 27,3B | No disponible | Safetensors FP4 | No disponible | MiniMax-H3-Image Community License |
| Qwen3.8-27B (modelo del que deriva) | 27B | No disponible | Safetensors | No disponible | Apache 2.0 |

No se dispone de datos de benchmarks de calidad ni de otros modelos de expansión de prompts comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se distribuye bajo la MiniMax-H3-Image Community License Agreement, no Apache 2.0; algunos usos requieren autorización escrita adicional de MiniMax. El modelo base Qwen3.8-27B sí es Apache 2.0, pero la licencia del derivado prevalece.
- Solo inglés: el único idioma declarado es `en`, lo que limita su uso en productos multilingües sin una capa de traducción previa.
- Soporte de edición de imagen incompleto: la model card indica que el modo de edición sigue en desarrollo y solo se ofrece un prompt de tarea y un ejemplo de ensamblado de mensajes para un VLM externo.
- Dependencia de hardware Blackwell: NVFP4 no se acelera por hardware en GPUs anteriores; en tarjetas Ampere o Ada el rendimiento será notablemente inferior o requerirá conversión de formato.
- Diferencia de salidas entre rutas de despliegue: la ruta Modular Diffusers ejecuta activaciones en bf16, por lo que sus resultados no coinciden exactamente con los de SGLang.
- Riesgo de alucinación en la expansión de prompts: al tratarse de un modelo generativo que produce descripciones detalladas, puede introducir elementos no solicitados por el usuario en el `expanded_caption`; conviene validar o permitir edición humana en flujos sensibles.
- Ausencia de benchmarks de calidad publicados: no hay datos de MMLU, HumanEval ni métricas de fidelidad de expansión, lo que dificulta evaluar su calidad frente a alternativas.
- Repositorio comunitario: la ficha es una cuantización de terceros (`prithivMLmods`), no una publicación oficial de MiniMax; la reproducibilidad y el soporte dependen del autor de la cuantización.
- Contexto de prueba limitado a 8.192 tokens: no se especifica el máximo arquitectónico real del modelo base, por lo que no debe asumirse una ventana mayor en producción.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/prithivMLmods/MiniMax-H3-Image-PE-NVFP4-MTP-GGUF
- Fichero de pesos NVFP4 con MTP: https://huggingface.co/prithivMLmods/MiniMax-H3-Image-PE-NVFP4-MTP-GGUF/blob/main/MiniMax-H3-Image-PE-NVFP4-MTP.gguf
- Fichero de proyección multimodal: https://huggingface.co/prithivMLmods/MiniMax-H3-Image-PE-NVFP4-MTP-GGUF/blob/main/MiniMax-H3-Image-PE.mmproj.gguf
- Variante sin MTP: https://huggingface.co/prithivMLmods/MiniMax-H3-Image-PE-NVFP4-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image-PE
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
