# oddadmix/Nawah-ASR-50M-v2

## Resumen

Nawah-ASR-50M-v2 es un modelo de reconocimiento automático de voz (ASR) para árabe que combina un encoder congelado de Whisper-small con un modelo de lenguaje árabe de 50 millones de parámetros (Emhotob-50M) como decoder. Desarrollado por oddadmix (Ahmed Wasfy), este modelo demuestra que un LLM pequeño y especializado puede superar al decoder original de Whisper en un dominio concreto, reduciendo el coste computacional y manteniendo un rendimiento competitivo. La arquitectura aprovecha la configuración de Qwen2Audio para componer los subconfigs sin código personalizado, lo que facilita su uso con `generate()` y el caché KV.

El modelo se entrena sobre 300 horas del dataset MASC (procedente de YouTube) y alcanza un WER de 0,3614 en un split held-out de 3165 clips, frente al 0,5739 de Whisper-small en cero disparo. Con 156,78 millones de parámetros totales, es adecuado para despliegue en dispositivos edge y ofrece una velocidad de inferencia de aproximadamente 205 veces el tiempo real en una GPU. Licenciado bajo Apache-2.0, está disponible en formato safetensors y soporta exclusivamente el árabe.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Whisper-small congelado + proyector lineal (768→512) + decoder LLM Emhotob-50M (arquitectura Llama) vía Qwen2AudioConfig |
| Parametros totales | 156.783.616 |
| Parametros activos | No aplica (modelo denso; encoder congelado, no se entrena) |
| Longitud de contexto | 2048 tokens (LLM); audio truncado a 30 s por el extractor |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Árabe (MSA y dialectal) |
| Licencia | Apache-2.0 (encoder Whisper-small bajo MIT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue un esquema de "injerto" (graft): un encoder Whisper-small congelado extrae características de audio de 16 kHz, un proyector lineal reduce la dimensión de 768 a 512, y el LLM Emhotob-50M, entrenado desde cero en árabe, genera la transcripción. La composición se realiza mediante `Qwen2AudioConfig`, que resuelve los subconfigs a través de `AutoConfig`, permitiendo que un config de texto tipo Llama se integre directamente y que funciones como `generate()`, el caché KV y `save_pretrained` funcionen sin modificaciones.

El entrenamiento se realiza en dos etapas: primero solo el proyector (3 épocas) y luego el proyector junto con el LM (8 épocas). Se usa AdamW con betas (0,9, 0,95), weight decay 0,05, cosine schedule con 3% de warmup, y tasas de aprendizaje de 2e-4 para el proyector y 1e-4 para el LM. El encoder permanece congelado y en modo evaluación durante todo el proceso. Un detalle crítico es la calibración inicial del proyector: si las embeddings de audio tienen una RMS muy superior a la del LLM (24x en este caso), el entrenamiento no converge sin corregir esa escala. El entrenamiento completo tomó aproximadamente 4,5 horas en una RTX 5090.

## Capacidades

- Reconocimiento de voz árabe (MSA y dialectal) a texto, con transcripción generada por un LLM.
- Soporte de audio de duración variable: el número de tokens de audio se ajusta a la longitud del clip (25 tokens por segundo), evitando el desperdicio de tokens en silencios.
- Generación de texto en árabe con el decoder LLM, lo que permite potencialmente integración con otras tareas del modelo de lenguaje.
- Inferencia rápida: aproximadamente 205 veces el tiempo real en una GPU.
- Sin capacidades de tool calling, visión ni otras modalidades; exclusivamente ASR.

## Casos de uso

- Transcripción de vídeos de YouTube en árabe: el modelo está entrenado en MASC, un dataset de YouTube, por lo que es especialmente adecuado para este tipo de contenido. Puede procesar clips de hasta 30 segundos y generar subtítulos automáticos.
- Subtitulado automático para plataformas de vídeo: su velocidad de inferencia (~205x realtime) permite procesar grandes volúmenes de audio en poco tiempo, ideal para generar subtítulos en lote.
- Asistentes de voz en árabe para dispositivos edge: con solo 156M de parámetros, cabe en dispositivos con recursos limitados, como smartphones o altavoces inteligentes, y su licencia Apache-2.0 facilita su integración comercial.
- Transcripción de reuniones y llamadas telefónicas: al soportar audio de hasta 30 segundos por fragmento, puede transcribir conversaciones en tiempo real o en diferido, con la posibilidad de encadenar fragmentos.
- Accesibilidad para personas con discapacidad auditiva: la transcripción automática en árabe permite generar subtítulos en tiempo real para contenido en directo o pregrabado.
- Análisis de contenido de audio: al convertir voz a texto, se pueden aplicar técnicas de procesamiento de lenguaje natural (búsqueda, moderación, extracción de información) sobre el contenido transcrito.

## Benchmarks y rendimiento

Los resultados se obtuvieron en un split held-out de 3165 clips video-disjoint del dataset MASC, con decodificación greedy y el mismo normalizador para todos los modelos. No se han publicado resultados en otros dominios.

| model | decoder | WER | CER |
|---|---|---|---|
| `openai/whisper-small` (zero-shot) | Whisper 153M | 0,5739 | 0,2062 |
| `oddadmix/whisper-small-arabic-dialectal` | Whisper 153M | 0,6775 | 0,2244 |
| `Nawah-ASR-50M-v1` (60 h) | Emhotob 50M | 0,6145 | 0,2936 |
| **`Nawah-ASR-50M-v2` (300 h)** | **Emhotob 50M** | **0,3614** | **0,1549** |

El rendimiento es superior al de Whisper-small en este dominio específico, pero el autor advierte que MASC es el "terreno de juego" del modelo y que los resultados no son generalizables. La comparación con Whisper-small fine-tuned en los mismos 300 horas no está disponible.

## Requisitos de hardware

- VRAM estimada: con 156,78M de parámetros en FP16, el modelo ocupa aproximadamente 313 MB. Con cuantización a 4 bits, podría reducirse a unos 80 MB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente, incluyendo RTX 3060, RTX 4090, A100, etc. El autor entrenó en una RTX 5090.
- Cabe en GPUs de consumo: sí, incluso en tarjetas de gama media.
- Opciones de despliegue: el modelo usa la API de Transformers (`Qwen2AudioForConditionalGeneration`), por lo que es compatible con vLLM, TGI, y otras herramientas que soporten esta arquitectura. También puede ejecutarse en CPU, aunque con menor velocidad.
- Latencia y throughput: el autor reporta ~205x realtime en una GPU no especificada, lo que implica que un clip de 10 segundos se procesa en aproximadamente 0,05 segundos.

## Comparativa con modelos similares

La comparación se realiza con los modelos disponibles en la model card, ya que no hay datos de otros ASR árabes del mismo tamaño.

| Modelo | Parámetros (decoder) | WER (MASC held-out) | CER (MASC held-out) | Licencia |
|---|---|---|---|---|
| `openai/whisper-small` (zero-shot) | 153M | 0,5739 | 0,2062 | MIT |
| `oddadmix/whisper-small-arabic-dialectal` | 153M | 0,6775 | 0,2244 | Apache-2.0 |
| `Nawah-ASR-50M-v1` | 50M | 0,6145 | 0,2936 | Apache-2.0 |
| **`Nawah-ASR-50M-v2`** | **50M** | **0,3614** | **0,1549** | Apache-2.0 |

El modelo supera a Whisper-small en este dominio con un decoder tres veces más pequeño, pero no hay comparación con modelos ASR árabes específicos de mayor tamaño (p. ej., Whisper-large o MMS). Se recomienda evaluar en otros conjuntos de datos antes de usarlo en producción general.

## Limitaciones y advertencias

- Entrenado exclusivamente en MASC (YouTube), que contiene una mezcla de MSA y dialectos árabes. El rendimiento fuera de este dominio no está probado y podría degradarse significativamente.
- El extractor de características trunca audio de más de 30 segundos, por lo que clips más largos deben dividirse en fragmentos.
- La calidad de la transcripción depende de la calibración del proyector; si se reentrena, es necesario verificar la RMS de las embeddings.
- No se han evaluado sesgos de género, edad o acento en el dataset. El contenido de YouTube puede tener sesgos inherentes.
- Aunque la licencia Apache-2.0 permite uso comercial, el encoder Whisper-small está bajo MIT, y los pesos del modelo base Emhotob-50M son Apache-2.0. No hay restricciones adicionales conocidas.
- El modelo no soporta otros idiomas ni tareas distintas al ASR.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/oddadmix/Nawah-ASR-50M-v2)
- [Modelo v1](https://huggingface.co/oddadmix/Nawah-ASR-50M-v1)
- [Modelo base Emhotob-50M](https://huggingface.co/oddadmix/50M-2048-Emhotob)
- [Dataset MASC](https://huggingface.co/datasets/pain/MASC)
- [Perfil del autor (oddadmix)](https://huggingface.co/oddadmix)
- [Modelo hermano Nawah-VL-50M](https://huggingface.co/oddadmix/Nawah-VL-50M)
