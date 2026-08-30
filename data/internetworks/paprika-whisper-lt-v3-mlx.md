# internetworks/paprika-whisper-lt-v3-mlx

## Resumen

`internetworks/paprika-whisper-lt-v3-mlx` es una conversión al formato MLX del modelo `kristijonas/paprika-whisper-lt-v3`, un ajuste fino (fine-tune) en lituano del modelo `openai/whisper-large-v3-turbo`. El modelo original fue entrenado por Kristijonas sobre el corpus LIEPA-3, con aproximadamente 3.281 horas de audio lituano, y arrancado desde la versión anterior `paprika-whisper-lt`. Esta conversión MLX, publicada por el usuario `internetworks`, permite ejecutar el reconocimiento de voz en dispositivos Apple Silicon de forma nativa y eficiente, sin necesidad de GPU externa.

El modelo resuelve el problema de la transcripción automática de voz en lituano, un idioma con pocos recursos disponibles en el ecosistema de ASR. Al estar basado en Whisper large-v3-turbo, hereda la arquitectura encoder-decoder transformer con 806 millones de parámetros, y su especialización en lituano mejora significativamente la precisión frente al modelo multilingüe original en este idioma. La relevancia actual radica en la creciente demanda de herramientas de ASR locales y privadas, especialmente en entornos donde la soberanía de datos es crítica.

La conversión MLX no altera la arquitectura ni los pesos del modelo original; simplemente los adapta al formato de MLX, un framework de aprendizaje automático de Apple optimizado para sus chips. Esto facilita el despliegue en Macs con M1 o superiores, con un tamaño de repositorio de 1,6 GB y pesos en safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper large-v3-turbo (encoder-decoder transformer) con fine-tune en lituano |
| Parametros totales | 806.958.160 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos por segmento (decodificación larga para audio extenso) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | lituano (lt) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base es `openai/whisper-large-v3-turbo`, un transformer encoder-decoder con aproximadamente 806 millones de parámetros, diseñado para reconocimiento de voz multilingüe. El fine-tune `kristijonas/paprika-whisper-lt-v3` se entrenó sobre el corpus LIEPA-3, compuesto por unas 3.281 horas de audio lituano, y se inicializó con los pesos de la versión anterior `paprika-whisper-lt`. No se dispone de detalles adicionales sobre el proceso de entrenamiento (número de épocas, estrategia de aumento de datos, etc.) en la información proporcionada.

La conversión MLX realizada por `internetworks` no modifica la arquitectura ni los pesos; únicamente transforma los tensores al formato nativo de MLX, lo que permite su ejecución eficiente en Apple Silicon mediante la librería `mlx_whisper`. No se han documentado innovaciones técnicas adicionales en esta conversión.

## Capacidades

- Reconocimiento de voz automático (ASR) en lituano, con alta precisión gracias al fine-tune sobre el corpus LIEPA-3.
- Transcripción de audio a texto en formato largo (long-form decoding), recomendada por el autor para evitar pérdidas de texto en las uniones de segmentos.
- Ejecución local en dispositivos Apple Silicon, sin necesidad de conexión a internet ni envío de datos a servidores externos.
- Integración sencilla con la librería `mlx_whisper` mediante una llamada a `transcribe()`.
- No soporta tool calling, agentes, visión ni otras capacidades multimodales; es exclusivamente un modelo de ASR.
- Aunque el modelo base Whisper es multilingüe, este fine-tune está especializado en lituano y puede degradar su rendimiento en otros idiomas.

## Casos de uso

- Transcripción de reuniones y entrevistas en lituano: el modelo puede procesar grabaciones de larga duración mediante decodificación larga, generando actas textuales con alta fidelidad. Su ejecución local garantiza la privacidad de conversaciones sensibles.
- Subtitulado automático de vídeos en lituano: integrable en flujos de edición de vídeo o plataformas de publicación, convirtiendo el audio en subtítulos con marcas de tiempo (si se combina con herramientas de alineación).
- Asistentes de voz en lituano: puede servir como backend de transcripción para asistentes personales o aplicaciones de dictado, aprovechando la baja latencia en Apple Silicon.
- Transcripción de llamadas de atención al cliente: empresas lituanas pueden analizar interacciones telefónicas para control de calidad o extracción de información, manteniendo los datos en sus propios servidores.
- Accesibilidad para personas con discapacidad auditiva: generación de subtítulos en tiempo real para eventos, clases o conferencias en lituano, mejorando la inclusión.
- Análisis de contenido multimedia: transcripción de podcasts, noticias o programas de radio en lituano para su posterior indexación, búsqueda o traducción automática.
- Investigación lingüística: creación de corpus transcritos a partir de grabaciones de campo, útil para estudios fonéticos o sociolingüísticos del lituano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como WER (Word Error Rate) comparativas con otros modelos ASR para lituano.

## Requisitos de hardware

- Modelo optimizado para Apple Silicon (chips M1, M1 Pro/Max, M2, M3, etc.) mediante el framework MLX.
- Tamaño del repositorio: 1,6 GB en safetensors. Se estima que requiere al menos 8 GB de RAM unificada para una inferencia fluida, aunque no se especifica un valor exacto.
- No requiere GPU dedicada; funciona con la GPU integrada de los chips Apple.
- Opciones de despliegue: librería `mlx_whisper` (Python) y el ecosistema MLX. No es compatible directamente con vLLM, llama.cpp u Ollama, aunque podría convertirse a otros formatos si se desea.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del modelo de Mac y de la longitud del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| internetworks/paprika-whisper-lt-v3-mlx | 806 M | 30 s/segmento | lituano | cc-by-4.0 | MLX (safetensors) |
| kristijonas/paprika-whisper-lt-v3 | 806 M | 30 s/segmento | lituano | cc-by-4.0 | PyTorch (probablemente) |
| openai/whisper-large-v3-turbo | 806 M | 30 s/segmento | multilingüe | MIT | PyTorch, etc. |

La comparativa se limita a los modelos relacionados directamente. No se dispone de datos de rendimiento (WER) para establecer una comparación cuantitativa. La principal diferencia entre la versión MLX y la original es el formato de pesos y la optimización para Apple Silicon; el rendimiento en términos de precisión debería ser idéntico, ya que los pesos son los mismos.

## Limitaciones y advertencias

- El modelo está especializado en lituano; su rendimiento en otros idiomas puede ser inferior al del Whisper multilingüe original.
- Según la model card del autor, no debe usarse `chunk_length_s` en la decodificación, ya que el camino fragmentado descarta silenciosamente texto en las uniones e inventa texto en segmentos sin habla. Se recomienda usar decodificación larga.
- Riesgo de alucinaciones en audio no hablado (ruido, música, silencio), especialmente si se utiliza la decodificación por fragmentos.
- La licencia cc-by-4.0 permite uso comercial con atribución, pero no se ofrecen garantías sobre la precisión en condiciones de ruido, acentos regionales o habla solapada.
- No se han publicado benchmarks independientes que validen su rendimiento en lituano; la confianza en el modelo se basa en el trabajo del autor original.
- Al ser una conversión MLX, requiere hardware Apple Silicon; no es ejecutable en GPUs NVIDIA o AMD sin una conversión adicional a otros formatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/internetworks/paprika-whisper-lt-v3-mlx
- Modelo base (original): https://huggingface.co/kristijonas/paprika-whisper-lt-v3
- Repositorio GitHub del proyecto paprika: https://github.com/kristijonasatpro/paprika
- Framework MLX: https://mlx-framework.org/
- Paquete whispermlx en PyPI: https://pypi.org/project/whispermlx/
