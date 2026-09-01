# oddadmix/Nawah-ASR-50M-v1

## Resumen

Nawah-ASR-50M-v1 es un sistema de reconocimiento automático del habla (ASR) para árabe desarrollado por oddadmix (Ahmed Wasfy). Su particularidad es que la transcripción no la genera un decodificador ASR clásico, sino un modelo de lenguaje árabe de 50 millones de parámetros, `oddadmix/50M-2048-Emhotob`, que escribe el texto directamente. El audio se procesa con el encoder congelado de Whisper-small, se proyecta a un espacio de embeddings y el LLM genera la transcripción.

El modelo resuelve el problema de demostrar que un LLM pequeño puede aprender a leer señales de audio, sin necesidad de un decodificador ASR específico. Es relevante porque explora una arquitectura híbrida speech-LLM de muy bajo coste, pensada para ejecución en dispositivos (on-device). Tiene 156,78 millones de parámetros totales, contexto de 2048 tokens (heredado del LLM base) y está licenciado bajo Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2Audio (encoder Whisper-small congelado + proyector lineal + decoder LLM Emhotob-50M) |
| Parametros totales | 156.783.616 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (modelo base Emhotob) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un injerto (graft) sobre el shell de Qwen2Audio: el encoder de Whisper-small (88,15M de parámetros) permanece congelado y en modo eval, seguido de un proyector lineal (768 → 512, 0,39M entrenable) que alimenta al decoder LLM Emhotob-50M (51,82M entrenables más 16,42M de lm_head). El modelo usa `Qwen2AudioConfig` con subconfiguración `llama` para el texto, lo que permite usar `generate()`, KV cache y `save_pretrained` sin código personalizado.

El entrenamiento se realizó en dos etapas: primero solo el proyector (3 épocas) y luego proyector + LM (8 épocas), con AdamW (betas 0.9/0.95, weight decay 0.05), cosine schedule con 3% de warmup, LR 2e-4 para el proyector y 1e-4 para el LM. Se usaron 60 horas del dataset MASC (árabe, etiquetado como MSA pero con dialecto sustancial). Un detalle técnico importante: el proyector debe calibrarse antes del entrenamiento porque sus embeddings de audio tenían un RMS 24 veces mayor que el del LLM, lo que impedía la alineación.

## Capacidades

- Reconocimiento de voz en árabe: transcribe audio de 16 kHz a texto árabe.
- Generación de texto: al estar basado en un LLM, puede generar transcripciones con estructura lingüística, aunque con limitaciones por su tamaño.
- Procesamiento de audio de duración variable: el número de tokens de audio se calcula dinámicamente (25 tokens por segundo), evitando el desperdicio de ventanas fijas.
- Decodificación rápida: ~190x tiempo real en hardware de referencia.
- Sin hipótesis vacías: el modelo siempre produce alguna salida, aunque pueda ser incorrecta.
- Integración con el ecosistema HuggingFace Transformers mediante `Qwen2AudioForConditionalGeneration`.

## Casos de uso

- Transcripción de audio en dispositivos móviles: al ser un modelo de 156M parámetros, puede ejecutarse en smartphones o dispositivos edge con menos de 1 GB de VRAM, transcribiendo notas de voz o reuniones en árabe.
- Subtitulado automático de vídeos cortos: para clips de menos de 30 segundos, el modelo puede generar subtítulos en árabe sin necesidad de conexión a la nube.
- Asistentes de voz en árabe dialectal: aunque el entrenamiento es mayoritariamente MSA, el modelo maneja dialecto, útil para prototipos de asistentes que entienden habla coloquial.
- Preprocesamiento de audio para pipelines de NLP: se puede usar como primer paso para convertir audio en texto y luego alimentar otros modelos de procesamiento de lenguaje natural.
- Investigación en speech-LLM: sirve como banco de pruebas para estudiar cómo los LLM pequeños aprenden a leer señales de audio, con scripts de entrenamiento incluidos en el repositorio.
- Evaluación de arquitecturas híbridas: permite comparar el rendimiento de un LLM como decodificador frente a decodificadores ASR tradicionales en tareas de bajo recurso.

## Benchmarks y rendimiento

El modelo se evaluó en un split held-out de 3.165 clips (3,19 horas) disjunto en vídeo, tras entrenar con 60 horas de MASC. Los resultados se comparan con dos modelos Whisper afinados en árabe dialectal:

| Modelo | WER | CER |
|---|---|---|
| **Nawah-ASR-50M-v1** | **0.6145** | **0.2936** |
| `oddadmix/whisper-small-arabic-dialectal` | 0.428 | 0.151 |
| `oddadmix/whisper-large-v3-turbo-arabic-dialectal` | 0.344 | 0.115 |

El autor indica explícitamente que este modelo no supera a un Whisper afinado, y que su objetivo es demostrar que un LLM de 50M puede aprender a leer voz. La brecha entre CER (0.29) y WER (0.61) sugiere que la parte acústica funciona razonablemente, pero la modelización del lenguaje (fronteras de palabra y morfología) es el punto débil, esperable en un decoder tan pequeño.

## Requisitos de hardware

- VRAM estimada: ~0,6 GB (tamaño del repositorio en safetensors), cabe en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo NVIDIA GTX 1050, RTX 2060, o incluso CPUs con suficiente RAM.
- Ejecución en CPU: viable para inferencia en tiempo real (~190x realtime), aunque la latencia dependerá del hardware.
- Opciones de despliegue: al ser un modelo Transformers estándar, se puede servir con vLLM, TGI o directamente con `transformers` en Python. También se puede exportar a ONNX o TensorRT para optimización.
- Latencia: decodificación a ~190x tiempo real, es decir, un clip de 3 segundos se procesa en ~16 ms en hardware de gama media.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (MASC) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Nawah-ASR-50M-v1** | 156,78M | 2048 | 0.6145 | Apache 2.0 | HuggingFace |
| `oddadmix/whisper-small-arabic-dialectal` | 244M (Whisper-small) | 30 s de audio | 0.428 | MIT (Whisper) | HuggingFace |
| `oddadmix/whisper-large-v3-turbo-arabic-dialectal` | 809M (Whisper-large-v3-turbo) | 30 s de audio | 0.344 | MIT (Whisper) | HuggingFace |

La comparativa muestra que Nawah-ASR-50M-v1 es significativamente más pequeño y ligero que los Whisper afinados, pero con un WER mucho mayor. Su ventaja no es la precisión, sino la demostración de una arquitectura speech-LLM compacta y la posibilidad de ejecutarse en entornos con recursos muy limitados.

## Limitaciones y advertencias

- Rendimiento ASR inferior a modelos Whisper afinados: el WER de 0.61 es alto para producción; no recomendado para transcripción precisa sin postprocesado.
- Datos de entrenamiento con dialecto: MASC está etiquetado como MSA pero contiene dialecto sustancial, lo que puede causar inconsistencias en la salida.
- Truncamiento de audio: el feature extractor de Whisper trunca audio de más de 30 segundos; clips largos deben dividirse en fragmentos.
- Contexto limitado: 2048 tokens de contexto, suficiente para transcripciones cortas pero no para documentos largos.
- Riesgo de alucinación: al ser un LLM pequeño, puede generar texto plausible pero incorrecto, especialmente en habla con ruido o solapamiento.
- Sin cuantizaciones publicadas: no hay versiones GGUF o AWQ disponibles, lo que limita el despliegue en algunos entornos.
- Licencia Apache 2.0 permite uso comercial, pero los pesos del encoder Whisper-small están sujetos a la licencia MIT de OpenAI, y el dataset MASC puede tener restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oddadmix/Nawah-ASR-50M-v1
- Modelo base LLM: https://huggingface.co/oddadmix/50M-2048-Emhotob
- Dataset MASC: https://huggingface.co/datasets/pain/MASC
- Modelo hermano de visión: https://huggingface.co/oddadmix/Nawah-VL-50M
- Modelo RAG: https://huggingface.co/oddadmix/Nawah-50M-RAG-Support-2K
- Perfil de GitHub del autor: https://github.com/Oddadmix
