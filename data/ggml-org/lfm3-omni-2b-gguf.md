# ggml-org/LFM3-Omni-2B-GGUF

## Resumen

LFM3-Omni-2B-GGUF es una versión cuantizada en formato GGUF del modelo LFM3-Omni-2B de LiquidAI, publicada por el equipo de ggml-org (los mantenedores de llama.cpp). El modelo base es un modelo omni-modal de aproximadamente 1,73 mil millones de parámetros capaz de procesar texto, imágenes, audio y vídeo como entrada, y de generar texto y salida de voz (mediante un módulo de text-to-speech integrado). Esto lo sitúa en la categoría "any-to-any": un único modelo pequeño que entiende múltiples modalidades y puede responder también con audio.

La relevancia de esta publicación radica en que hace accesible un modelo omni-modal en hardware de consumo: los pesos en GGUF permiten ejecutarlo localmente con llama.cpp (o mediante la herramienta `llama serve` / llama.app) sin necesidad de GPUs de gama alta. El repositorio incluye un archivo mmproj que contiene el codificador de visión, el codificador de audio y la ruta de salida de audio (depthformer más códec), de modo que toda la funcionalidad multimodal está cubierta en un solo despliegue.

La conversión se ha realizado de forma automática con la herramienta de conversión de ggml-org, usando las mismas cuantizaciones (Q8_0 y Q4_K_M) que LiquidAI publica en sus propios GGUF oficiales. Es un modelo reciente y la model card es todavía mínima, por lo que varios datos técnicos (contexto, idiomas, benchmarks) no están disponibles públicamente en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo omni-modal any-to-any de LiquidAI, familia LFM) |
| Parametros totales | 1.728.801.600 (~1,73 B) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_M (mismas que los GGUF oficiales de LiquidAI) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia personalizada, "other" en HuggingFace) |
| Formato de pesos | GGUF (conversión automática desde safetensors) |

## Arquitectura y entrenamiento

No se han publicado detalles de arquitectura ni de entrenamiento en la model card. Lo que sí se conoce es la composición del paquete GGUF: además de los pesos del modelo de lenguaje, el archivo mmproj incluye el codificador de visión, el codificador de audio y la ruta de salida de audio, que combina un modelo depthformer con un códec de voz. Esto implica que el modelo original integra varios codificadores modales sobre un LLM base de la familia LFM (Liquid Foundation Models) de LiquidAI.

Sobre los datos de entrenamiento, el número de tokens, la composición del corpus y el uso de técnicas como RLHF o DPO: no disponible. Tampoco se ha documentado la presencia de innovaciones técnicas concretas como decodificación especulativa o atención lineal, aunque la familia LFM de LiquidAI ha empleado históricamente arquitecturas híbridas; sin confirmación en la fuente, no puede afirmarse.

## Capacidades

- Entrada multimodal: acepta texto, imágenes, audio y vídeo como entrada (el procesamiento de vídeo requiere tener `ffmpeg` instalado en el `PATH`).
- Salida de texto: generación de texto conversacional (tag `conversational` en HuggingFace).
- Salida de voz: síntesis de voz integrada, servida a través del endpoint `/tts` del servidor de llama.cpp.
- Pipeline any-to-any: clasificado en HuggingFace como modelo any-to-any, es decir, capaz de cruzar modalidades entre entrada y salida.
- Razonamiento, código, matemáticas y tool calling: no disponible (sin datos publicados en la model card).

## Casos de uso

- **Asistente de voz local**: gracias al endpoint `/tts` y a la entrada de audio, puede montarse un asistente conversacional por voz que corre íntegramente en local, sin enviar datos a la nube, adecuado para privacidad y latencia baja.
- **Transcripción y análisis de reuniones**: al aceptar audio (y vídeo) como entrada, puede usarse para resumir grabaciones de reuniones o extraer puntos clave directamente desde el fichero multimedia.
- **Análisis de imágenes y documentos**: el codificador de visión permite preguntar sobre capturas de pantalla, fotografías o documentos escaneados desde la línea de comandos o una aplicación local.
- **Comprensión de vídeo**: con `ffmpeg` en el `PATH`, puede responder preguntas sobre clips de vídeo, útil para moderación de contenido o indexación de bibliotecas multimedia.
- **Prototipado de agentes multimodales en edge**: su tamaño de ~1,7 B de parámetros y el formato GGUF lo hacen idóneo para experimentar con agentes que combinan visión y voz en portátiles o mini-PCs.
- **Integración en aplicaciones con llama.cpp**: el comando `llama serve -hf ggml-org/LFM3-Omni-2B-GGUF` levanta un servidor listo para usar, lo que facilita exponer el modelo vía API local a aplicaciones de terceros.
- **Accesibilidad**: la combinación de entrada por voz y salida de voz permite construir herramientas de asistencia para personas con dificultades visuales o motoras sin dependencia de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye evaluaciones, y los datos del modelo base LiquidAI/LFM3-Omni-2B no constan en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada**: el repositorio completo pesa 7,9 GB. Con cuantización Q4_K_M, un modelo de ~1,73 B de parámetros más los codificadores multimodales (mmproj) debería caber en torno a 2–4 GB de VRAM o incluso ejecutarse en CPU; con Q8_0, en torno a 3–6 GB. Estas cifras son estimaciones basadas en el tamaño del repositorio, no datos oficiales.
- **GPUs recomendadas**: por su tamaño reducido, cualquier GPU moderna de consumo es suficiente; no se requieren A100 ni H100. No disponible una lista oficial de GPUs soportadas.
- **Consumer GPUs**: sí, cabe con holgura en GPUs como una RTX 3060 de 12 GB o superior, e incluso en GPUs de 8 GB con Q4_K_M. También es viable la inferencia en CPU con llama.cpp.
- **Despliegue**: llama.cpp (requiere un build con soporte LFM3-Omni, disponible en el PR 31257 del repositorio), `llama serve -hf ggml-org/LFM3-Omni-2B-GGUF` y llama.app. No hay evidencia de soporte en vLLM, TGI u Ollama en la información proporcionada.
- **Dependencias**: `ffmpeg` en el `PATH` para procesar entrada de vídeo.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-Omni-2B-GGUF (este) | ~1,73 B | texto, imagen, audio, vídeo → texto, voz | Q8_0, Q4_K_M (GGUF) | lfm1.0 (personalizada) | llama.cpp, llama.app |
| LiquidAI/LFM3-Omni-2B-GGUF | ~1,73 B | texto, imagen, audio, vídeo → texto, voz | Q8_0, Q4_K_M (GGUF) | lfm1.0 | GGUF oficial de LiquidAI |
| Qwen2.5-Omni-3B/7B | 3B / 7B | texto, imagen, audio, vídeo → texto, voz | GGUF comunitario | Apache 2.0 / personalizada | llama.cpp, vLLM, transformers |

La alternativa más directa es el GGUF oficial de LiquidAI, con idéntico contenido y cuantizaciones; la versión de ggml-org se distingue por su conversión automática supervisada y su integración con `llama serve`. Frente a Qwen2.5-Omni, LFM3-Omni-2B es notablemente más pequeño (lo que facilita su ejecución local), aunque no hay benchmarks publicados que permitan comparar rendimiento.

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia lfm1.0 es una licencia personalizada ("other" en HuggingFace); debe revisarse el texto en el enlace del modelo base antes de cualquier uso comercial, ya que no puede asumirse que sea permisiva.
- **Falta de documentación**: la model card es mínima (los propios autores incluyen una sección "TODOs" pendiente de completar), por lo que contexto, idiomas y capacidades exactas deben verificarse empíricamente.
- **Soporte de llama.cpp reciente**: requiere un build con el PR 31257 integrado; versiones estables anteriores no funcionarán con este modelo.
- **Dependencia de ffmpeg**: sin `ffmpeg` en el `PATH`, la entrada de vídeo no funciona.
- **Riesgo de alucinación**: como todo modelo de lenguaje de ~2 B de parámetros, el riesgo de alucinación es elevado, especialmente en razonamiento complejo y en tareas multimodales exigentes; no hay datos de evaluación que permitan cuantificarlo.
- **Sesgos**: no disponible; no se ha publicado información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- **Calidad de la conversión**: la conversión GGUF es automática; conviene validar los resultados frente a los GGUF oficiales de LiquidAI, que usan las mismas cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ggml-org/LFM3-Omni-2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- GGUF oficial de LiquidAI: https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF
- Licencia: https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/main/LICENSE
- PR de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31257
- Herramienta de conversión: https://github.com/ggml-org/convert
- Aplicación de ejecución: https://llama.app
