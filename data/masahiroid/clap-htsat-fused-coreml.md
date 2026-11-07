# masahiroid/clap-htsat-fused-coreml

## Resumen

`clap-htsat-fused` es un modelo de preentrenamiento contrastivo audio-texto (CLAP, *Contrastive Language-Audio Pretraining*) desarrollado por LAION. Aprende representaciones conjuntas de audio y texto proyectando ambas modalidades en un espacio latente compartido de 512 dimensiones, lo que permite calcular similitud semantica entre una descripcion textual y una senal de audio. El checkpoint original combina un codificador de audio basado en HTSAT (variante de Swin Transformer) que procesa espectrogramas log-Mel, y un codificador de texto basado en RoBERTa, con cabezas de proyeccion, mecanismo de fusion de caracteristicas y aumentacion keyword-to-caption.

La ficha que nos ocupa, `masahiroid/clap-htsat-fused-coreml`, no es un modelo nuevo sino una **conversion de formato** del checkpoint original `laion/clap-htsat-fused` a Core ML (`.mlpackage`, ML Program) para ejecucion en el ecosistema Apple (macOS 14/iOS 17 en adelante). El autor declara explicitamente que no hay reentrenamiento ni fine-tuning: es una conversion F32 (no cuantizada a 4 bits), con formas fijas y batch size 1, validada numericamente contra el checkpoint PyTorch de origen.

Es relevante para desarrolladores que necesitan inferencia local de embeddings audio-texto en dispositivos Apple (Macs con Apple Silicon, iPhone/iPad) sin depender de PyTorch en tiempo de ejecucion. El repo incluye scripts de tokenizacion, conversion de formas y helpers de inferencia, y mantiene paridad numerica muy alta con el original (diferencia absoluta maxima de ~1,09e-06).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLAP: codificador de audio HTSAT (Swin Transformer) + codificador de texto RoBERTa, proyecciones a espacio latente compartido de 512 dimensiones, con fusion de caracteristicas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Texto: 77 tokens (forma fija `[1, 77]`); audio: ventana de 10 segundos con fusion de clips largos |
| Tipos de cuantizacion | F32 (baseline explicito, no 4-bit). Formato Core ML ML Program |
| Idiomas soportados | no disponible (el modelo base LAION CLAP esta entrenado principalmente en ingles; la model card no declara lista de idiomas) |
| Licencia | Apache-2.0 (pesos originales); anadidos de runtime/conversion bajo MIT |
| Formato de pesos | Core ML `.mlpackage` (ML Program); tambien existen variantes MLX y Core AI del mismo autor |

Formas de entrada (todas batch 1, fijas):

| Componente | Entradas |
|---|---|
| `text` | `input_ids: [1, 77]`, `attention_mask: [1, 77]` |
| `audio_short` | `input_features: [1, 4, 1001, 64]` |
| `audio_long` | `input_features: [1, 4, 1001, 64]` |

## Arquitectura y entrenamiento

La arquitectura subyacente es CLAP tal como la definio LAION: un codificador de audio HTSAT que consume espectrogramas log-Mel (4 canales, 1001 frames temporales, 64 bandas en la exportacion) y un codificador de texto RoBERTa, ambos proyectados a un espacio latente comun de 512 dimensiones donde la similitud se calcula por producto escalar (coseno). El checkpoint "fused" incorpora el mecanismo de fusion de caracteristicas y la aumentacion keyword-to-caption, que permiten procesar audio de longitud variable y mejorar la calidad de los embeddings. Los logits finales se multiplican por escalas exponenciales entrenadas (`clap_logits`), preservando el comportamiento del checkpoint original.

Esta exportacion concreta no introduce entrenamiento nuevo. La conversion adapta operaciones no soportadas por Core ML: la interpolacion temporal bicubica se reexpresa con el mismo kernel (a=-0,75, align_corners=True) mediante gathers, y las mascaras de ventana desplazada y la seleccion de ruta de fusion se precalculan para batch 1 estatico. Las rutas `audio_short` (sin fusion) y `audio_long` (con fusion) se eligen segun el flag `is_longer` devuelto por el `ClapProcessor` original, no por la duracion del clip. Se conservan ambas convenciones `get_text_features` y `get_audio_features`. La validacion reporta paridad con PyTorch: diferencia absoluta maxima 1,0915101e-06 y similitud coseno minima 0,999999999982.

## Capacidades

- Generacion de embeddings de audio y de texto en un espacio compartido de 512 dimensiones, L2-normalizados.
- Calculo de similitud audio-texto (retrieval texto-a-audio y audio-a-texto) mediante producto escalar / coseno.
- Clasificacion zero-shot de audio usando prompts textuales como etiquetas.
- Procesamiento de audio de ventana corta (10 s) y de clips largos con fusion de caracteristicas.
- Extraccion de caracteristicas de texto (`get_text_features`) y de audio (`get_audio_features`) por separado.
- Calculo de logits CLAP calibrados (`clap_logits`) con las escalas entrenadas del checkpoint original.
- Inferencia local en Apple Silicon mediante Core ML, sin dependencia de PyTorch en runtime.
- No dispone de tool calling, function calling, capacidades de agente, vision ni modo "thinking"; es un modelo de representacion, no generativo conversacional.

## Casos de uso

- Busqueda semantica de audio: indexar una biblioteca de clips (efectos de sonido, muestras musicales, grabaciones ambientales) por embeddings y recuperar los clips relevantes a partir de una consulta en lenguaje natural, calculando similitud coseno contra los embeddings de texto precalculados.
- Etiquetado automatico de audio: usar clasificacion zero-shot comparando el embedding del clip contra embeddings de una lista de etiquetas textuales, util para organizar archivos de sonido sin entrenar un clasificador especifico.
- Deteccion y filtrado de contenido sonoro: en pipelines de moderacion o curacion, generar embeddings de audio y compararlos contra prompts de categorias sensibles para marcar clips candidatos a revision humana.
- Aplicaciones iOS/macOS on-device: integrar el `.mlpackage` en apps nativas para clasificar o buscar audio localmente, aprovechando que la exportacion esta pensada para macOS 14/iOS 17 y no requiere backend Python en produccion.
- Prototipado de interfaces multimodales: construir demos que relacionen descripciones textuales con sonidos (por ejemplo, "el sonido de un perro ladrando") usando los helpers de tokenizacion y conversion de formas incluidos.
- Analisis de grabaciones largas: emplear la ruta `audio_long` con fusion para representar clips de mas de 10 segundos como un unico embedding, util en monitorizacion ambiental o analisis de reuniones.
- Investigacion en representaciones audio-texto: servir como referencia de paridad numerica (vectores de validacion incluidos) para comparar implementaciones Core ML frente a PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de tarea (retrieval, clasificacion zero-shot, etc.) en la informacion disponible. La unica metrica reportada es de paridad de conversion:

| Metrica | Valor |
|---|---|
| Diferencia absoluta maxima de salida vs. PyTorch | 1,0915101e-06 |
| Similitud coseno minima vs. PyTorch | 0,999999999982 |

El autor indica explicitamente que la validacion usa senales sinteticas (sinusoidales y ruido) y que **no** constituye un benchmark de calidad de retrieval sobre audio natural. Tampoco se han medido latencia ni rendimiento en iPhone.

## Requisitos de hardware

- VRAM/RAM: el repo ocupa 0,7 GB; la inferencia F32 en Core ML requiere memoria unificada en Apple Silicon (no aplica VRAM dedicada de GPU discreta).
- GPU recomendadas: no disponible; el destino es Apple Silicon (CPU/GPU/Neural Engine via Core ML). No esta pensado para A100, H100 ni RTX 4090.
- Compatibilidad consumer: si, en Macs con Apple Silicon y dispositivos iPhone/iPad con macOS 14/iOS 17 o superior. Rendimiento en iPhone no medido.
- Opciones de despliegue: Core ML (`coremltools==9.0`), con dependencias `numpy`, `huggingface_hub` y `transformers==4.57.3`. Existen variantes MLX y Core AI del mismo autor. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `masahiroid/clap-htsat-fused-coreml` (esta ficha) | Conversion Core ML de CLAP | no disponible | Texto 77 tokens; audio 10 s | Apache-2.0 (pesos) + MIT (codigo) | Hugging Face, 0 descargas |
| `laion/clap-htsat-fused` | CLAP original (PyTorch) | no disponible | Texto y audio segun processor original (ventana 10 s, clips largos con fusion) | Apache-2.0 | Hugging Face, ampliamente usado |
| `masahiroid/clap-htsat-fused-mlx` | Conversion MLX del mismo checkpoint | no disponible | Equivalente al original | Apache-2.0 / MIT | Hugging Face |
| `masahiroid/clap-htsat-fused-coreai` | Conversion Core AI del mismo checkpoint | no disponible | Equivalente al original | Apache-2.0 / MIT | Hugging Face |

Las tres conversiones comparten pesos de origen y difieren solo en el formato de runtime (Core ML, MLX, Core AI). Frente al checkpoint PyTorch original, esta version impone formas fijas y batch 1, lo que limita flexibilidad pero simplifica el despliegue en Apple.

## Limitaciones y advertencias

- Es una conversion de formato, no un modelo nuevo: no mejora calidad, robustez ni velocidad respecto al checkpoint `laion/clap-htsat-fused`.
- Formas fijas y batch size 1: no admite batching dinamico ni longitudes de texto distintas de 77 tokens; los checkpoints Ruri/GTE mencionados en la model card limitan texto a 128 tokens en sus exportaciones, sin exponer contextos mayores.
- El audio debe ser mono, float y ya remuestreado a 48.000 Hz; los modelos exportados aceptan caracteristicas del processor, no formas de onda en bruto.
- La seleccion de ruta `audio_short`/`audio_long` debe hacerse por el flag `is_longer` del processor, no por duracion: el processor upstream puede marcar un clip corto como `is_longer=True` si el lote no contiene clips largos.
- Los recortes de fusion son aleatorizados por el processor original; para reproducibilidad hay que fijar la semilla de NumPy.
- La validacion se hizo con senales sinteticas; no hay evidencia publicada de calidad de retrieval sobre audio real en esta conversion.
- Rendimiento en iPhone no medido; la exportacion apunta a macOS 14/iOS 17 y se valido en macOS 27.2.
- Riesgo de sesgos y alucinacion: no documentado en la informacion disponible; al ser un modelo de embeddings, el riesgo principal es de representacion sesgada heredada de los datos de entrenamiento de LAION, no de generacion de texto.
- Licencia: pesos Apache-2.0 (uso comercial permitido con atribucion); anadidos de codigo bajo MIT. Revisar los scripts Python incluidos antes de ejecutarlos, como advierte el autor.
- El helper sincrono de Core AI esta pensado para scripts standalone; en bucles asincronos existentes hay que adaptar su corrutina `predict` en lugar de anidar `asyncio.run`.

## Enlaces

- Hugging Face (esta conversion): https://huggingface.co/masahiroid/clap-htsat-fused-coreml
- Modelo base: https://huggingface.co/laion/clap-htsat-fused
- Revision exacta del checkpoint origen: https://huggingface.co/laion/clap-htsat-fused/tree/365dea6ef167def6676140ed93bbc43f84dabb28
- Variante MLX: https://huggingface.co/masahiroid/clap-htsat-fused-mlx
- Variante Core AI: https://huggingface.co/masahiroid/clap-htsat-fused-coreai
- Referencia del modelo base en ModelScope: https://www.modelscope.cn/models/laion/clap-htsat-fused
- Resumen y alternativas del modelo base: https://www.aimodels.fyi/models/huggingFace/clap-htsat-fused-laion
