# oxalis-ink/shamrock-0-e4b

## Resumen

shamrock-0-e4b es un ajuste fino (fine-tune) del modelo multimodal Gemma 4 E4B-it de Google DeepMind, desarrollado por oxalis-ink para las funciones de aprendizaje de idiomas de su aplicación de escritorio Oxalis: traducción por cámara, traducción de texto, tutor conversacional, práctica oral y diccionario, con foco en japonés, coreano y chino simplificado. Se publica como el hermano mayor del modelo `oxalis-ink/shamrock-0-e2b` y mantiene la arquitectura y el pipeline de imagen-texto-a-texto del modelo base.

El checkpoint publicado es una fusión en fp16 con 7.941.100.874 parámetros reales según los safetensors del repositorio (68,7 GB en total), e incluye además conversiones a GGUF (Q4_K_M con proyector multimodal f16), un borrador de predicción multi-token (MTP) para decodificación especulativa y una build MLX de 4 bits para Apple Silicon. El modelo está etiquetado como `image-text-to-text`, por lo que hereda la capacidad de visión del Gemma 4 original.

Su relevancia es acotada pero concreta: demuestra un patrón de despliegue completo para un fine-tune multimodal orientado a producto (runtime llama.cpp con decodificación especulativa, MLX para Mac y pesos HF), aunque el propio autor advierte que el rendimiento fuera de la aplicación Oxalis será pobre. La licencia CC BY-NC 4.0 restringe el uso comercial de los pesos modificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto-a-texto), base Gemma 4 E4B; detalles internos no disponibles |
| Parametros totales | 7.941.100.874 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (checkpoint fusionado), GGUF Q4_K_M, GGUF Q8_0 (borrador MTP), MLX 4 bits |
| Idiomas soportados | Japonés, coreano y chino simplificado (objetivo del fine-tune); resto de idiomas del modelo base no disponible |
| Licencia | CC BY-NC 4.0 (modificaciones de Oxalis); pesos base Gemma 4 bajo Apache 2.0 |
| Formato de pesos | safetensors (raíz), GGUF (`gguf/`, `MTP/`), MLX (`mlx/`) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it`, un transformer multimodal de Google DeepMind que acepta imagen y texto como entrada. Sobre esa base, Oxalis aplicó un fine-tune y posterior fusión de pesos orientado a las superficies de aprendizaje de idiomas de su aplicación, con especialización en japonés, coreano y chino simplificado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica destacable no está en el entrenamiento sino en el empaquetado para inferencia: el repositorio incluye un cabezal de predicción multi-token (MTP) en GGUF Q8_0 y en formato HF (`MTP/assistant/`) que actúa como drafter para decodificación especulativa en llama.cpp mediante `--spec-type draft-mtp`, y una build MLX de 4 bits que usa ese mismo cabezal como drafter en mlx-vlm. El proyector multimodal se distribuye por separado como `mmproj-shamrock-0-e4b-f16.gguf`.

## Capacidades

- Generación de texto conversacional multi-turno en japonés, coreano y chino simplificado.
- Traducción de texto y traducción a partir de imagen de cámara (pipeline image-text-to-text).
- Función de tutor de idiomas y práctica oral dentro de la aplicación Oxalis.
- Consulta de diccionario y explicaciones léxicas.
- Procesamiento de imágenes gracias al proyector multimodal incluido en la distribución GGUF.
- Decodificación especulativa mediante cabezal MTP para acelerar la inferencia en llama.cpp y MLX.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Traducción por cámara en una app de escritorio: el modelo recibe la imagen capturada y el texto de contexto y devuelve la traducción al japonés, coreano o chino simplificado, aprovechando el pipeline multimodal heredado de Gemma 4 E4B.
- Traducción de texto integrada en un editor: se envía el fragmento seleccionado junto con instrucciones de estilo y el modelo devuelve la versión traducida, adecuado por su ajuste específico a esos tres pares de idiomas.
- Tutor conversacional de idiomas: diálogos multi-turno donde el modelo corrige y explica construcciones gramaticales, gracias al ajuste sobre las superficies de tutor de Oxalis.
- Práctica oral asistida: combinación con un motor de voz externo que transcribe y pasa el texto al modelo para generar correcciones y respuestas, usando la build MLX 4 bits en equipos Apple Silicon.
- Diccionario contextual: consultas léxicas con ejemplos de uso generados por el modelo, apropiado por su especialización en vocabulario de los idiomas objetivo.
- Prototipado de pipelines de decodificación especulativa: el par modelo + drafter MTP sirve como referencia reproducible para medir la aceleración de `--spec-type draft-mtp` en llama.cpp con un modelo multimodal de ~8.000 millones de parámetros.
- Evaluación de despliegue en hardware de consumo: la cuantización Q4_K_M y la build MLX permiten probar el modelo en portátiles y equipos de sobremesa sin GPU de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB con GGUF Q4_K_M para los pesos, más el proyector multimodal f16 y la caché KV; en torno a 16 GB para el checkpoint fp16 completo (7,94 mil millones de parámetros).
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090 o A100/H100 son suficientes para fp16, y GPUs consumer de gama media (8-12 GB) para Q4_K_M.
- Cabe en GPU consumer: sí, con la cuantización Q4_K_M en GPUs de 8 GB o más; la build MLX 4 bits está pensada para Apple Silicon.
- Opciones de despliegue: llama.cpp (runtime de la app, con `--spec-type draft-mtp` para el drafter), mlx-vlm para la build MLX, y transformers para el checkpoint fp16. Compatibilidad con vLLM, TGI u Ollama: no disponible.
- Latencia y throughput estimados: no disponibles; la decodificación especulativa con el drafter MTP está pensada para reducirlos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shamrock-0-e4b | 7.941.100.874 | no disponible | imagen-texto-a-texto | CC BY-NC 4.0 (modificaciones) | HF, GGUF, MLX |
| google/gemma-4-E4B-it | no disponible | no disponible | imagen-texto-a-texto | Apache 2.0 | HF |
| oxalis-ink/shamrock-0-e2b | no disponible | no disponible | texto (hermano pequeño) | no disponible | HF |

La comparación con alternativas de la misma categoría (otros fine-tunes multimodales de ~8.000 millones de parámetros para traducción asiática) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El autor advierte explícitamente de que el fine-tune rendirá pobremente fuera de la aplicación Oxalis; no es un modelo de propósito general.
- La licencia CC BY-NC 4.0 prohíbe el uso comercial de los pesos modificados: vender los pesos, servirlos en un producto o API de pago o incluirlos en una app comercial requiere licencia aparte contactando con oxalis.ink.
- Los pesos base Gemma 4 están bajo Apache 2.0, pero las modificaciones de Oxalis quedan cubiertas por CC BY-NC 4.0; al redistribuir hay que citar la autoría y declarar cambios.
- Sesgos conocidos: no disponibles en la información proporcionada; al estar especializado en tres idiomas, es esperable un rendimiento muy inferior en otros.
- Riesgo de alucinación: no cuantificado; en tareas de traducción y diccionario conviene validar las salidas.
- Longitud de contexto no documentada, lo que limita la planificación de cargas con documentos largos.
- El repositorio pesa 68,7 GB e incluye múltiples formatos; hay que descargar solo los artefactos necesarios (por ejemplo, `gguf/` o `mlx/`).
- El pipeline declarado es `text-generation` pese a las etiquetas multimodales; verificar el soporte de imagen en el runtime concreto antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oxalis-ink/shamrock-0-e4b
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Modelo hermano: https://huggingface.co/oxalis-ink/shamrock-0-e2b
- Sitio del autor: https://oxalis.ink
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
