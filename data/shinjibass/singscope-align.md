# shinjibass/singscope-align

## Resumen

singscope-align es un conjunto de modelos de alineación forzada (forced alignment) basados en la arquitectura wav2vec2, cuantizados a INT8 dinámico y exportados a formato ONNX. Desarrollado por el usuario shinjibass, su propósito es refinar los límites de las notas musicales a partir de letras cantadas, una tarea crítica en aplicaciones de práctica de canto como SingScope. El repositorio contiene dos submodelos: uno para inglés, derivado de `facebook/wav2vec2-large-960h-lv60-self`, y otro para japonés, derivado de `reazon-research/japanese-wav2vec2-large-rs35kh`. Ambos se distribuyen bajo licencia Apache-2.0 y son derivados cuantizados sin modificaciones de los modelos originales.

La relevancia de este modelo radica en su formato optimizado: al estar cuantizado dinámicamente a INT8 y exportado a ONNX, puede ejecutarse de forma eficiente en CPU, lo que lo hace adecuado para aplicaciones locales y en tiempo real. Aunque no se proporcionan métricas de rendimiento, su integración en SingScope sugiere que cumple con los requisitos de precisión y latencia para la alineación de audio monofónico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (Transformer encoder) con cabezal CTC para alineación forzada |
| Parametros totales | no disponible (derivado de wav2vec2-large, ~315M en el original) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (depende de la ventana de audio procesada) |
| Tipos de cuantizacion | INT8 dinámica (onnxruntime quantize_dynamic) |
| Idiomas soportados | inglés (submodelo `en/`), japonés (submodelo `ja/`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura wav2vec2, un encoder Transformer preentrenado de forma autosupervisada sobre audio sin etiquetar. Para la tarea de alineación forzada, se añade un cabezal CTC (Connectionist Temporal Classification) que predice la secuencia de fonemas o caracteres a partir de la señal de audio. Los pesos originales provienen de los modelos `facebook/wav2vec2-large-960h-lv60-self` (inglés) y `reazon-research/japanese-wav2vec2-large-rs35kh` (japonés), ambos con licencia Apache-2.0.

El proceso de adaptación consistió únicamente en la cuantización y exportación: se utilizó `torch.onnx.export` con opset 17 y posteriormente `onnxruntime.quantize_dynamic` para convertir los pesos a INT8 con cuantización dinámica. No se realizó ningún entrenamiento adicional ni ajuste fino sobre los modelos originales. Esta optimización reduce el tamaño del modelo y acelera la inferencia en CPU, manteniendo la funcionalidad de alineación forzada.

## Capacidades

- Alineación forzada de audio de canto con letras transcritas, generando límites temporales para cada fonema o carácter.
- Refinamiento de límites de notas musicales a partir de la alineación fonética, útil para aplicaciones de práctica de canto.
- Soporte bilingüe: submodelos separados para inglés y japonés.
- Inferencia eficiente en CPU gracias a la cuantización INT8 dinámica y al formato ONNX.
- Integración con el ecosistema ONNX Runtime, permitiendo despliegue en entornos sin GPU.
- Compatible con pipelines de procesamiento de audio en tiempo real (baja latencia esperada, aunque no se especifican cifras).

## Casos de uso

- Práctica de canto asistida: la aplicación SingScope utiliza este modelo para alinear la letra cantada con la melodía de referencia, permitiendo al usuario visualizar en qué momento exacto debe pronunciarse cada sílaba.
- Corrección de afinación en tiempo real: al conocer los límites de las notas, se puede aplicar corrección de tono sobre segmentos específicos del audio, mejorando la precisión de la afinación.
- Transcripción fonética de canciones: el modelo puede generar anotaciones temporales de fonemas a partir de grabaciones de voz cantada, útiles para estudios lingüísticos o musicológicos.
- Generación de subtítulos sincronizados para karaoke: la alineación forzada permite sincronizar letras con la música de forma automática, reduciendo el trabajo manual.
- Análisis de interpretación vocal: en entornos educativos, el modelo ayuda a evaluar la dicción y el ritmo del cantante comparando la alineación predicha con la real.
- Desarrollo de asistentes de composición: los límites de notas refinados pueden integrarse en herramientas de edición MIDI o notación musical para convertir audio cantado en partituras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de precisión (como WER o tasa de error de alineación) ni comparaciones con otros sistemas de alineación forzada. Se recomienda evaluar el modelo en el caso de uso específico antes de su adopción en producción.

## Requisitos de hardware

- Al ser un modelo ONNX cuantizado a INT8, puede ejecutarse en CPU sin necesidad de GPU. El tamaño del repositorio es de 0.6 GB, lo que sugiere que cada submodelo ocupa aproximadamente 300 MB.
- VRAM estimada: no aplica para inferencia en CPU; si se usara GPU, la huella de memoria sería mínima (menos de 1 GB), pero no se ha probado.
- GPU recomendadas: no se requieren; cualquier CPU moderna con soporte para instrucciones AVX2 es suficiente.
- Opciones de despliegue: ONNX Runtime (C++, Python, etc.), compatible con servidores de inferencia como Triton o FastAPI. También puede integrarse en aplicaciones móviles o de escritorio mediante ONNX Runtime Mobile.
- Latencia y throughput: no disponibles. Dado el tamaño y la cuantización, se espera una latencia de decenas de milisegundos por segmento de audio en CPU, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de alineación forzada (por ejemplo, Montreal Forced Aligner, torchaudio's forced alignment, o modelos basados en wav2vec2 sin cuantizar). La falta de benchmarks y de especificaciones detalladas impide una comparación objetiva. Se recomienda consultar los modelos originales (`facebook/wav2vec2-large-960h-lv60-self` y `reazon-research/japanese-wav2vec2-large-rs35kh`) para conocer sus capacidades base.

## Limitaciones y advertencias

- El modelo está diseñado para audio monofónico (una sola voz). No puede manejar polifonía ni múltiples voces simultáneas, y la presencia de música de fondo o instrumentos puede interferir en la detección.
- Solo cubre dos idiomas: inglés y japonés. No hay soporte para otros idiomas.
- Al ser un derivado cuantizado sin entrenamiento adicional, su precisión puede verse ligeramente degradada respecto a los modelos originales en float32, aunque la cuantización dinámica suele mantener un rendimiento aceptable.
- No se proporcionan métricas de error ni garantías de calidad. El autor no especifica el rendimiento en condiciones de ruido o acústica adversa.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribución y cumplir con los términos de los modelos originales (también Apache-2.0).
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un proyecto reciente o poco difundido; se recomienda validar su funcionamiento antes de usarlo en entornos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shinjibass/singscope-align
- Aplicación SingScope: https://singscope.vercel.app
- Sitio web de SingScope: http://www.singscope.com/en/
- Repositorio GitHub de SingScope (PWA): https://github.com/joeypshell/singscope
- Modelo original en inglés: https://huggingface.co/facebook/wav2vec2-large-960h-lv60-self
- Modelo original en japonés: https://huggingface.co/reazon-research/japanese-wav2vec2-large-rs35kh
