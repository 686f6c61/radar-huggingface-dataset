# shoibo/whisper-small-santali-sanlish-1934_lr2-lr2e5

## Resumen

El modelo `shoibo/whisper-small-santali-sanlish-1934_lr2-lr2e5` es un ajuste fino (fine-tuning) de [OpenAI Whisper-small](https://huggingface.co/openai/whisper-small) orientado al reconocimiento automático del habla (ASR) en santali, una lengua minoritaria hablada principalmente en la India, y su variante "sanlish" (mezcla de santali e inglés). El autor, `shoibo`, ha adaptado el modelo base de Whisper para mejorar la transcripción de esta lengua de bajos recursos, que carece de sistemas comerciales de voz robustos. La relevancia radica en que lenguas como el santali suelen estar infrarrepresentadas en los modelos ASR multilingües, y este ajuste fino busca cubrir ese vacío con una arquitectura probada.

El modelo conserva la arquitectura encoder-decoder de Whisper-small, con aproximadamente 241,7 millones de parámetros y una ventana de contexto de 30 segundos de audio. Se entrenó durante 25 épocas con una tasa de aprendizaje de 2e-5, y aunque la model card no especifica el conjunto de datos de entrenamiento (aparece como "None"), los resultados de evaluación indican una pérdida de 0,7537 y una tasa de error de palabra (WER) del 32,19% sobre el conjunto de validación. El repositorio tiene un tamaño inusualmente grande (24,2 GB), probablemente debido a artefactos de entrenamiento, pero los pesos publicados están en formato `safetensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-small) |
| Parametros totales | 241.734.912 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija de Whisper) |
| Tipos de cuantizacion | No disponible (se publican pesos en FP32/FP16, sin cuantizaciones oficiales) |
| Idiomas soportados | Santali (y posiblemente santali transliterado al latino, "sanlish") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Whisper-small es un modelo de reconocimiento de voz basado en la arquitectura Transformer estándar, con un encoder que procesa espectrogramas de Mel de 80 canales y un decoder autoregresivo que genera los tokens de texto. El modelo preentrenado de OpenAI fue entrenado con 680.000 horas de audio etiquetado de forma débil en múltiples idiomas, pero este ajuste fino se realizó específicamente para santali. El entrenamiento se llevó a cabo con el framework `transformers` (versión 5.15.0) y PyTorch 2.11.0, usando precisión mixta nativa (AMP). Los hiperparámetros incluyen 25 épocas, tamaño de lote efectivo de 16 (batch size 8 con acumulación de gradientes de 2), optimizador AdamW con betas (0.9, 0.999) y programador de tasa de aprendizaje lineal con 153 pasos de calentamiento. No se menciona el uso de técnicas como RLHF o DPO, y el conjunto de datos de entrenamiento no está documentado, lo que limita la reproducibilidad.

## Capacidades

- Reconocimiento automático del habla (ASR) para santali, incluyendo posiblemente la variante "sanlish" (mezcla santali-inglés).
- Transcripción de audio a texto en formato de subtítulos o texto plano.
- Al ser una adaptación de Whisper-small, conserva la capacidad de manejar audio con ruido de fondo y acentos variados, aunque con un rendimiento inferior al modelo original en idiomas bien representados.
- No soporta tool calling, agentes ni razonamiento multi-paso, ya que es un modelo puramente de transcripción de voz.
- No tiene capacidades multimodales adicionales (solo audio a texto).

## Casos de uso

- Transcripción de reuniones o entrevistas en santali: el modelo puede convertir grabaciones de audio en texto, facilitando la documentación y el análisis de contenido en esta lengua minoritaria.
- Generación de subtítulos para vídeos en santali: permite añadir subtítulos automáticos a contenido audiovisual, útil para preservación cultural y accesibilidad.
- Asistentes de voz para hablantes de santali: integrado en aplicaciones de dictado o comandos de voz, el modelo ofrece una alternativa a sistemas comerciales que no cubren este idioma.
- Investigación lingüística: los lingüistas pueden usar el modelo para transcribir corpus orales de santali, acelerando la anotación de datos para estudios fonéticos o gramaticales.
- Archivado de patrimonio oral: digitalización de grabaciones históricas en santali, convirtiendo audio en texto buscable para bibliotecas y museos.
- Aplicaciones educativas: herramientas de aprendizaje de santali que necesiten convertir pronunciación en texto para ejercicios interactivos.

## Benchmarks y rendimiento

La model card declara los siguientes resultados en el conjunto de evaluación (no se especifica el tamaño ni la composición de dicho conjunto):

| Metrica | Valor |
|---|---|
| Loss (validacion) | 0,7537 |
| WER (Word Error Rate) | 32,1909 % |
| CER (Character Error Rate) | 7,1305 % |

Estos valores indican que el modelo tiene una tasa de error de palabra relativamente alta (casi 1 de cada 3 palabras se transcribe incorrectamente), aunque la tasa de error de caracteres es mucho menor, lo que sugiere que los errores son principalmente a nivel de palabra completa. No se han publicado comparaciones con otros modelos ASR para santali en la información disponible. Los resultados de la tabla de entrenamiento muestran una mejora progresiva del WER desde 45,78% en la época 1 hasta un mínimo de 31,70% en la época 19, con una ligera regresión al final (32,19% en la época 25), lo que podría indicar un ligero sobreajuste.

## Requisitos de hardware

- VRAM estimada para inferencia: Whisper-small en FP16 requiere aproximadamente 1,5 GB de VRAM para procesar una ventana de 30 segundos de audio. Con cuantización a int8, puede reducirse a ~0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060, etc.). Para procesamiento por lotes o en tiempo real, se recomienda una GPU con 4 GB o más (RTX 3060, A10, etc.).
- En CPU: puede ejecutarse en modo FP32 con unos 4 GB de RAM, aunque la latencia será mayor (del orden de 2-5 segundos por audio de 30 segundos en un procesador moderno).
- Opciones de despliegue: compatible con la biblioteca `transformers` de HuggingFace, así como con `vLLM` (aunque no es óptimo para ASR), `TGI` (Text Generation Inference) no es específico para ASR, pero se puede usar `faster-whisper` (basado en CTranslate2) si se convierten los pesos. También es compatible con `Ollama` si se empaqueta como modelo GGUF, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no se han publicado mediciones específicas para este ajuste fino. El modelo base Whisper-small procesa aproximadamente 1 minuto de audio en ~1 segundo en una GPU moderna (RTX 3090) con FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (santali) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `shoibo/whisper-small-santali-sanlish-1934_lr2-lr2e5` (este) | 241,7 M | 30 s | 32,19% | Apache 2.0 | HuggingFace |
| `thunderboltc/whisper-small-santali-sanlish` | 241,7 M (presumiblemente) | 30 s | No disponible | Apache 2.0 (presumible) | HuggingFace |
| `shoibo/whisper_small_santali_ipa` | 241,7 M (presumiblemente) | 30 s | No disponible | Apache 2.0 (presumible) | HuggingFace |
| `openai/whisper-small` (original) | 244 M | 30 s | No evaluado en santali | MIT | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos ajustados para santali. El modelo original de Whisper-small no está optimizado para santali y su rendimiento en esta lengua sería probablemente muy deficiente.

## Limitaciones y advertencias

- El conjunto de datos de entrenamiento no está documentado (aparece como "None" en la model card), lo que impide evaluar la representatividad de los datos y el posible sesgo hacia un dialecto o estilo de habla específico.
- El WER del 32,19% es alto, lo que significa que el modelo comete errores en aproximadamente una de cada tres palabras. No es adecuado para transcripciones que requieran alta precisión sin revisión humana.
- La lengua santali tiene múltiples sistemas de escritura (Ol Chiki, devanagari, latino) y el modelo parece estar enfocado en la variante "sanlish" (transliteración latina), por lo que no cubre todas las escrituras.
- No hay información sobre el tamaño del vocabulario ni sobre cómo maneja palabras fuera de vocabulario o nombres propios.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo derivado de Whisper (MIT), no hay restricciones adicionales conocidas.
- El repositorio tiene un tamaño de 24,2 GB, lo que sugiere que incluye archivos de entrenamiento o checkpoints intermedios; la descarga puede ser lenta.
- No se han publicado evaluaciones en condiciones de ruido extremo, acentos variados o diferentes calidades de grabación.

## Enlaces

- Modelo en HuggingFace: [shoibo/whisper-small-santali-sanlish-1934_lr2-lr2e5](https://huggingface.co/shoibo/whisper-small-santali-sanlish-1934_lr2-lr2e5)
- Modelo base original: [openai/whisper-small](https://huggingface.co/openai/whisper-small)
- Modelo relacionado del mismo autor: [shoibo/whisper_small_santali_ipa](https://huggingface.co/shoibo/whisper_small_santali_ipa)
- Modelo similar de otro autor: [thunderboltc/whisper-small-santali-sanlish](https://huggingface.co/thunderboltc/whisper-small-santali-sanlish)
- Página de inferencia en FriendliAI: [whisper-small-santali-sanlish](https://friendli.ai/models/thunderboltc/whisper-small-santali-sanlish)
- Repositorio de Whisper original: [GitHub - openai/whisper](https://github.com/openai/whisper)
