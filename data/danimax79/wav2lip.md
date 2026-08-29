# Danimax79/Wav2Lip

## Resumen

Wav2Lip es un modelo de sincronización labial (lip-sync) desarrollado por investigadores del IIIT Hyderabad, presentado en el artículo "A Lip Sync Expert Is All You Need for Speech to Lip Generation In the Wild" (ACM Multimedia 2020). El modelo toma un vídeo de un rostro y una pista de audio, y genera un vídeo en el que los movimientos de los labios se corresponden con precisión con el habla, incluso en vídeos de baja calidad o con condiciones adversas. Es relevante porque permite doblaje automático, generación de vídeos de personas hablando a partir de audio arbitrario y aplicaciones de avatares digitales, con resultados de alta fidelidad.

La arquitectura se basa en una red generadora que combina características visuales del rostro con características de audio, entrenada con un discriminador experto en sincronización labial. El modelo funciona para cualquier identidad, voz e idioma, y también es compatible con caras generadas por CGI y voces sintéticas. El repositorio incluye código de entrenamiento, inferencia y pesos preentrenados. El tamaño del repositorio en Hugging Face es de 0,9 GB, lo que sugiere un modelo relativamente ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red generadora con discriminador experto en sincronización (basada en CNN/RNN, detalles completos en el paper) |
| Parametros totales | no disponible (el repo pesa 0,9 GB, pero no se indica el número de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vídeo/audio, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch .pth) |
| Idiomas soportados | Cualquier idioma (el modelo es agnóstico al idioma) |
| Licencia | Uso exclusivo para investigación/académico/personal; prohibido uso comercial (entrenado con LRS2) |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

Wav2Lip emplea una arquitectura de red generadora que procesa simultáneamente el vídeo del rostro y el audio de entrada. El generador combina características visuales del rostro (extraídas mediante una red de detección de rostros) con características de audio (obtenidas de una representación mel-espectrográfica) para producir los fotogramas con los labios sincronizados. El entrenamiento utiliza un discriminador experto en sincronización labial, que evalúa si el movimiento de los labios está correctamente alineado con el audio, junto con un discriminador de calidad visual en la variante Wav2Lip + GAN. El modelo se entrenó con el dataset LRS2 (Lip Reading Sentences 2), que contiene vídeos de personas hablando en inglés. No se han publicado detalles sobre el número de tokens o la composición exacta del dataset en la información disponible.

## Capacidades

- Sincronización labial precisa: genera movimientos de labios que coinciden con el audio de entrada, incluso en vídeos con ruido o baja resolución.
- Compatibilidad universal: funciona con cualquier identidad, voz e idioma, así como con caras CGI y voces sintéticas.
- Inferencia sobre vídeo y audio arbitrarios: acepta cualquier vídeo con un rostro detectable y cualquier pista de audio soportada por FFmpeg.
- Dos variantes de modelo: Wav2Lip (alta precisión de sincronización) y Wav2Lip + GAN (mejor calidad visual, ligeramente inferior en sincronización).
- Incluye pesos de discriminadores adicionales (experto y de calidad visual) para investigación.
- No es un modelo de texto ni de razonamiento; su única función es la generación de vídeo con labios sincronizados.

## Casos de uso

- Doblaje automático de vídeos: sustituir el audio original de un vídeo por una traducción o locución en otro idioma, manteniendo la sincronización labial del hablante. Se usaría el modelo con el vídeo original y el nuevo audio, generando un vídeo doblado realista.
- Creación de avatares parlantes: generar vídeos de personajes virtuales o CGI que hablan a partir de un audio de voz, útil para asistentes virtuales, presentadores automáticos o videojuegos.
- Restauración de vídeos antiguos: corregir la sincronización labial en grabaciones históricas donde el audio y el vídeo están desalineados, mejorando la experiencia de visualización.
- Generación de contenido educativo: crear vídeos de profesores o explicadores hablando sobre cualquier tema, usando voces sintéticas o locuciones, sin necesidad de grabar vídeo real.
- Pruebas de accesibilidad: generar versiones en lengua de signos o con subtítulos hablados de vídeos existentes, aunque el modelo no genera lengua de signos, sí puede adaptar el movimiento labial a un nuevo audio.
- Investigación en visión por computador: servir como base para estudiar sincronización audiovisual, generación de vídeo condicionada por audio y evaluación de métricas de lip-sync.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card enlaza a PapersWithCode para las métricas en los datasets LRS2, LRS3 y LRW, pero no se proporcionan cifras concretas en el texto. Se recomienda consultar el paper original para obtener los valores numéricos de sincronización y calidad visual.

## Requisitos de hardware

- No se especifican requisitos de hardware en la información proporcionada.
- El tamaño del repositorio (0,9 GB) sugiere que el modelo es relativamente ligero y podría ejecutarse en GPUs de consumo como una NVIDIA GTX 1080 o superior, aunque no hay confirmación oficial.
- La inferencia requiere una GPU con al menos 4-6 GB de VRAM para manejar los fotogramas de vídeo y el procesamiento de audio, pero este dato es una estimación basada en el tamaño del modelo, no un valor oficial.
- El código de inferencia está disponible en el repositorio original y se puede ejecutar con Python 3.6 y FFmpeg.
- No se mencionan opciones de despliegue como vLLM u Ollama, ya que no es un modelo de lenguaje; el despliegue se realiza mediante el script `inference.py` del repositorio.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de lip-sync en los datos proporcionados. Existen alternativas como SadTalker o MakeItTalk, pero no se han encontrado datos concretos de comparación en la información disponible. Se recomienda consultar el paper original para ver comparaciones con métodos anteriores.

## Limitaciones y advertencias

- Uso comercial estrictamente prohibido: el modelo se entrenó con el dataset LRS2, que tiene restricciones de uso, y la model card indica que cualquier uso comercial está prohibido. Para uso comercial, los autores ofrecen un modelo HD bajo petición.
- Riesgo de uso indebido: la tecnología de lip-sync puede utilizarse para crear vídeos falsos (deepfakes) que suplanten a personas reales. Los autores advierten que los resultados deben usarse solo con fines de investigación, académicos o personales.
- Dependencia de la detección de rostros: el modelo requiere que el vídeo contenga un rostro detectable; si el rostro está muy ocluido o en ángulos extremos, la sincronización puede fallar.
- Calidad visual limitada en la variante estándar: Wav2Lip prioriza la precisión de sincronización sobre la calidad visual; la variante con GAN mejora la calidad pero reduce ligeramente la precisión.
- Sin soporte para audio de baja calidad: aunque el modelo es robusto, audios muy distorsionados o con ruido extremo pueden degradar el resultado.
- No se proporcionan garantías de rendimiento en producción: el código es de investigación y no está optimizado para despliegue a gran escala.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Danimax79/Wav2Lip
- Paper original: http://arxiv.org/abs/2008.10010
- Página del proyecto: http://cvit.iiit.ac.in/research/projects/cvit-projects/a-lip-sync-expert-is-all-you-need-for-speech-to-lip-generation-in-the-wild/
- Demo interactiva: https://bhaasha.iiit.ac.in/lipsync
- Vídeo de demostración: https://youtu.be/0fXaDCZNOJc
- Colab notebook: https://colab.research.google.com/drive/1tZpDWXz49W6wDcTprANRGLo2D_EbD5J8?usp=sharing
- Repositorio original en GitHub: https://github.com/Rudrabha/Wav2Lip
