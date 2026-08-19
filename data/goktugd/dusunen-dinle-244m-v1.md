# GoktugD/DUSUNEN-Dinle-244M-v1

## Resumen

DUSUNEN Dinle 244M v1 es un modelo de reconocimiento automático de voz (ASR) para el idioma turco, desarrollado por Göktuğ Düşünen. Se trata de un fine-tuning del modelo `openai/whisper-small` sobre el conjunto de datos FLEURS (configuración `tr_tr`), con el objetivo de mejorar la precisión de transcripción en turco respecto al modelo base. Según las evaluaciones del autor, consigue una reducción relativa del WER del 12,83 % en el conjunto de test de FLEURS, pasando de un 16,53 % a un 14,41 %.

El modelo conserva la arquitectura original de Whisper-small: un transformer encoder-decoder con aproximadamente 244 millones de parámetros y una ventana de audio de hasta 30 segundos. Está publicado bajo licencia Apache-2.0 y su formato de pesos es safetensors. Es relevante porque ofrece una alternativa ligera y específica para turco, con una mejora medible y reproducible, ideal para aplicaciones de transcripción, subtitulado y búsqueda en audio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small) |
| Parametros totales | 241.734.912 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 30 segundos de audio (ventana de Whisper) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura de Whisper-small, un transformer encoder-decoder con atención estándar, diseñado para procesar espectrogramas de audio de hasta 30 segundos y generar texto transcrito. El entrenamiento se realizó sobre el dataset FLEURS en su configuración turca, con audio a 16 kHz mono, y se utilizó un esquema de optimización AdamW con tasa de aprendizaje de 1e-5, decaimiento lineal y un 10 % de warmup. Se entrenaron cinco épocas con un batch efectivo de 16, en precisión BF16 y con semilla 42, sobre una NVIDIA GeForce RTX 3090 de 24 GB. El tiempo total de entrenamiento fue de 1688,4 segundos. El conjunto de test no se utilizó para actualizaciones de gradiente, y se aplicó un normalizador de texto específico para turco durante la decodificación.

## Capacidades

- Transcripción de voz en turco a texto, con una mejora medida frente a Whisper-small en el conjunto FLEURS.
- Manejo de audio de hasta 30 segundos de duración, suficiente para frases y párrafos cortos.
- Compatible con el pipeline `automatic-speech-recognition` de Hugging Face Transformers.
- Soporte para decodificación determinista configurando `language="tr"` y `task="transcribe"` en la generación.
- No incluye capacidades de tool calling, agentes, visión ni razonamiento multimodal; es exclusivamente un modelo de ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas: el modelo puede convertir grabaciones de audio en texto, facilitando la generación de actas o resúmenes. Su ventana de 30 segundos permite procesar intervenciones completas.
- Generación de subtítulos para vídeo: adecuado para crear subtítulos en turco de forma automática, con una precisión superior al Whisper-small base en habla leída.
- Búsqueda en contenido de audio: al transcribir archivos de audio, se habilita la indexación y búsqueda por palabras clave dentro de podcasts, clases o noticias.
- Toma de notas para estudiantes o profesionales: permite convertir conferencias o presentaciones en texto escrito, útil para repasar o archivar contenido.
- Prototipos de accesibilidad: puede integrarse en aplicaciones que conviertan voz en texto para personas con discapacidad auditiva, siempre que se valide en las condiciones acústicas reales.
- Automatización de subtítulos en directo: aunque requiere validación, el modelo puede servir como base para sistemas de subtitulado en tiempo real con latencia baja.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de test de FLEURS turco, comparados con el modelo base sin ajuste. La decodificación se realizó con el mismo prompt de transcripción en turco, generación greedy y normalizador de texto específico.

| Modelo | Parametros | WER (%) | CER (%) |
|---|---|---|---|
| `openai/whisper-small` | 244M | 16,53 | 3,90 |
| **DUSUNEN Dinle 244M v1** | **244M** | **14,41** | **3,49** |

Reducción relativa del WER: 12,83 %. No se han publicado resultados en otros benchmarks estándar (MMLU, HumanEval, etc.) porque el modelo no está orientado a tareas de texto general.

## Requisitos de hardware

- VRAM estimada: con pesos en BF16 o FP32, el modelo ocupa aproximadamente 500 MB a 1 GB. Para inferencia en GPU se recomienda al menos 2 GB de VRAM para evitar cuellos de botella.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3060, RTX 4090). También puede ejecutarse en CPU, aunque con mayor latencia.
- Cabe en GPUs de consumo: sí, es un modelo pequeño que se puede ejecutar en tarjetas de gama baja.
- Opciones de despliegue: se puede utilizar mediante el pipeline de Transformers, exportar a ONNX para inferencia optimizada, o integrarse en servicios como Hugging Face Inference Endpoints. No se ha documentado compatibilidad con vLLM o TGI específicamente para ASR.
- Latencia y throughput: no hay datos publicados; en una GPU moderna se espera una transcripción en tiempo real o superior para audios de hasta 30 segundos, pero depende del hardware.

## Comparativa con modelos similares

La comparativa más directa es con el modelo base `openai/whisper-small`, ya que el autor proporciona métricas comparativas. No se dispone de información sobre otros fine-tunes turcos de Whisper en el momento de redactar esta ficha.

| Modelo | Parametros | Contexto | WER (FLEURS tr) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `openai/whisper-small` | 244M | 30 s | 16,53 % | Apache-2.0 | Hugging Face |
| **DUSUNEN Dinle 244M v1** | **244M** | **30 s** | **14,41 %** | **Apache-2.0** | **Hugging Face** |

No se han encontrado otros modelos comparables con métricas públicas en el mismo conjunto de datos.

## Limitaciones y advertencias

- El entrenamiento se realizó sobre habla leída (FLEURS); la conversación espontánea, los acentos regionales, el code-switching y los nombres propios pueden comportarse de forma diferente.
- Como todo sistema ASR secuencial, puede omitir, repetir o alucinar palabras. Las transcripciones no deben tratarse como evidencia autoritativa.
- No debe utilizarse para transcribir a personas sin su consentimiento, ni en decisiones de alto riesgo sin revisión humana.
- La licencia Apache-2.0 permite uso comercial, pero es responsabilidad del usuario validar el modelo en sus propias condiciones acústicas y de micrófono antes de producción.
- No se han publicado resultados en otros conjuntos de datos distintos de FLEURS, por lo que la generalización a otros dominios es incierta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GoktugD/DUSUNEN-Dinle-244M-v1
- Perfil del autor: https://huggingface.co/GoktugD
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
- Modelo base: https://huggingface.co/openai/whisper-small
