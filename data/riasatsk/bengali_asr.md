# riasatsk/Bengali_ASR

## Resumen

El modelo `riasatsk/Bengali_ASR` es un sistema de reconocimiento automático de voz (ASR) para bengalí, distribuido en formato ONNX. Se trata de una conversión directa (sin modificaciones en los pesos) del modelo `ai4bharat/indicconformer_stt_bn_hybrid_ctc_rnnt_large` de AI4Bharat, que emplea una arquitectura Conformer-L de 120 millones de parámetros con un encoder de 17 capas y dimensión oculta 512. El proyecto incluye varios artefactos ONNX: un modelo fusionado que acepta directamente la forma de onda de audio (WAV) y produce logits de 5633 clases (22 idiomas × 256 tokens + blank), un encoder separado y un decoder CTC, además de los ficheros de tokenizer correspondientes.

La relevancia de este modelo radica en que permite ejecutar inferencia ASR sin depender del framework NeMo de NVIDIA, utilizando únicamente `onnxruntime` (CPU o GPU). Al mantener los pesos originales de AI4Bharat de forma íntegra, ofrece una vía de auditoría y despliegue ligero para aplicaciones de transcripción en bengalí y otros idiomas indios. El repositorio se creó en agosto de 2026 y no registra descargas ni valoraciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer-L (encoder 17×512) + cabezal CTC lineal (512→5633) |
| Parametros totales | 120 millones (según la designación Conformer-L) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | variable, limitada por la memoria; entrada WAV 16 kHz mono, salida cada 4 frames |
| Tipos de cuantizacion | no disponible (los ONNX parecen FP32, sin cuantización explícita) |
| Idiomas soportados | 22 idiomas según el tokenizer (incluye bengalí, hindi, tamil, telugu, etc.); el foco principal es bengalí |
| Licencia | no disponible (el modelo original de AI4Bharat suele ser CC-BY-NC, pero no se declara en el repo) |
| Formato de pesos | ONNX (ficheros `.onnx` + `.data`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Indictransformer de AI4Bharat, concretamente en la variante híbrida CTC/RNNT para bengalí. El encoder es un Conformer-L con 17 bloques de 512 dimensiones, que procesa mel-spectrogramas de 80 bandas. En esta conversión ONNX, el preprocesador `AudioToMel 80` está integrado dentro del grafo, de modo que la entrada es directamente la señal de audio WAV mono a 16 kHz. La salida del encoder se proyecta mediante una capa convolucional 1D a 5633 logits, correspondientes a 22 tokenizers de 256 unidades cada uno más un token blank (22×256 + 1 = 5633). Posteriormente, en la aplicación de transcripción se recorta a 257 logits (256 del bengalí + blank) para obtener la transcripción final.

Los pesos se copian literalmente del modelo original de AI4Bharat, sin reentrenamiento ni ajuste fino. No se proporcionan detalles sobre el corpus de entrenamiento, el número de tokens ni el proceso de alineación. El repositorio incluye también una comparación con otro modelo del mismo autor, `BanglaNeo`, que es una versión reducida solo bengalí con 257 logits y extracción de mel externa.

## Capacidades

- Transcripción de audio bengalí a texto a partir de una forma de onda WAV de 16 kHz.
- Soporte para 22 idiomas indios según el tokenizer incluido, aunque la interfaz principal está orientada a bengalí.
- Inferencia sin dependencias de NeMo: solo requiere `onnxruntime` (CPU o GPU).
- Decodificación CTC con argumento de probabilidades por frame (ventana de 4 frames por paso temporal).
- Posibilidad de usar el modelo fusionado completo (WAV → logits) o por partes (encoder y decoder separados) para integraciones flexibles.

## Casos de uso

- Transcripción de reuniones y entrevistas en bengalí: el modelo puede procesar grabaciones de audio de larga duración si se segmentan en fragmentos manejables, generando texto plano con timestamp por frame.
- Subtitulado automático de vídeos: al aceptar WAV 16 kHz, se integra fácilmente en pipelines de extracción de audio (ffmpeg) y generación de subtítulos.
- Búsqueda por voz en aplicaciones móviles o web: el ONNX ligero permite ejecutar el reconocimiento en el cliente con onnxruntime-web o en un servidor con CPU.
- Archivado y digitalización de documentos hablados: bibliotecas o instituciones pueden convertir grabaciones históricas en bengalí a texto para su indexación.
- Asistentes de voz en bengalí: combinado con un módulo de intención, el modelo sirve como capa de entrada para comandos hablados.
- Evaluación comparativa de modelos ASR: al ser una conversión verbatim de los pesos de AI4Bharat, es útil para auditar y comparar con otras implementaciones del mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de WER (Word Error Rate) ni comparaciones con otros sistemas en la model card ni en la documentación del repositorio.

## Requisitos de hardware

- El modelo ONNX completo (WAV → logits) ocupa aproximadamente 472 MB (469 MB de pesos + metadatos). El encoder solo pesa unos 458 MB y el decoder 11 MB.
- Inferencia en CPU: viable con `onnxruntime` CPU, aunque la latencia dependerá de la duración del audio. Para un uso interactivo se recomienda GPU.
- Inferencia en GPU: compatible con `onnxruntime-gpu` y CUDA. El autor menciona selección automática de proveedor `CUDA→CPU`.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (el modelo cabe en GPUs de consumo como GTX 1060, RTX 2060, etc.).
- Opciones de despliegue: `onnxruntime` (Python), servidor web local (el repo incluye una app Flask en `app_bengali_asr.py`), o integración en frameworks como FastAPI o Triton.
- Latencia y throughput: no se proporcionan datos medidos; al ser un modelo de 120M de parámetros, en CPU puede procesar un audio de 10 segundos en unos pocos segundos, mientras que en GPU sería casi en tiempo real.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| `riasatsk/Bengali_ASR` | Conformer-L + CTC | 120M | variable | 22 (incl. bengalí) | no disponible | ONNX |
| `bangla-speech-processing/BanglaASR` | no disponible | no disponible | no disponible | bengalí | no disponible | no disponible |
| `ai4bharat/indicconformer_stt_bn_hybrid_ctc_rnnt_large` (original) | Conformer-L + CTC/RNNT | 120M | variable | bengalí | CC-BY-NC (probable) | NeMo |
| OpenAI Whisper (modelo small) | Transformer encoder-decoder | 244M | 30 s | 99 idiomas | MIT | PyTorch, ONNX, etc. |

La comparativa con Whisper es orientativa: Whisper es multilingüe y más flexible, pero mucho más pesado y con mayor latencia. `Bengali_ASR` está especializado en bengalí y es más eficiente para ese idioma concreto.

## Limitaciones y advertencias

- No se declara licencia explícita: el modelo original de AI4Bharat suele tener licencia CC-BY-NC (solo uso no comercial), por lo que cualquier uso comercial debe verificarse con la fuente original.
- El modelo solo acepta audio WAV mono a 16 kHz; otros formatos o frecuencias requieren conversión previa.
- La salida es texto sin puntuación ni normalización de mayúsculas; puede requerir post-procesamiento.
- Al ser una conversión ONNX, puede haber pequeñas diferencias numéricas respecto a la implementación original en NeMo, aunque el autor indica que es "verbatim".
- El repositorio no incluye documentación sobre el corpus de entrenamiento, por lo que se desconocen los posibles sesgos en acentos, dialectos o ruido.
- El modelo está orientado a bengalí; para otros idiomas de los 22, la calidad puede ser inferior y no está garantizada.
- No hay soporte para puntuación, números o entidades nombradas; la salida es texto crudo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/riasatsk/Bengali_ASR
- Perfil GitHub del autor: https://github.com/riasatsk
- Organización AI4Bharat (fuente original): https://ai4bharat.org (no se proporciona enlace directo, pero se menciona en la model card)
- Iniciativa Bengali.AI: https://bengaliai.github.io/ (comunidad de investigación en bengalí)
