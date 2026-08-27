# Bunny2308/whisper-tiny-minds14

## Resumen

El modelo `whisper-tiny-minds14` es un ajuste fino (fine-tuning) de `openai/whisper-tiny` sobre el dataset `PolyAI/minds14`, un corpus multilingüe de conversaciones telefónicas en el ámbito bancario. Desarrollado por el usuario Bunny2308, este modelo está especializado en el reconocimiento automático del habla (ASR) y se distribuye bajo licencia Apache 2.0. Con solo 37,7 millones de parámetros, hereda la arquitectura ligera de Whisper-tiny, lo que lo hace adecuado para entornos con recursos limitados, como dispositivos edge o inferencia en CPU.

El interés de este modelo radica en su tamaño reducido y su capacidad para transcribir audio en contextos específicos (llamadas de atención al cliente, consultas bancarias) con un coste computacional mínimo. Aunque el WER reportado (34,5 %) es alto en comparación con modelos más grandes, su eficiencia y facilidad de despliegue lo convierten en una opción viable para prototipos o aplicaciones donde la precisión no es crítica. El entrenamiento se realizó con Transformers 5.16.1 y PyTorch 2.11.0, usando precisión mixta y 10 épocas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer (Whisper-tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (estándar Whisper: 30 segundos de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dataset de entrenamiento multilingüe: 14 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper-tiny de OpenAI: un transformer encoder-decoder con atención estándar, diseñado para procesar espectrogramas de audio de 30 segundos. El encoder convierte la señal de audio en representaciones latentes y el decoder genera el texto transcrito de forma autorregresiva. Whisper-tiny tiene 4 capas en cada bloque, 6 cabezas de atención y una dimensión oculta de 384, lo que explica su bajo número de parámetros.

El entrenamiento se realizó sobre el dataset `PolyAI/minds14`, que contiene grabaciones de llamadas telefónicas en 14 idiomas (inglés, alemán, francés, español, etc.) con acentos y ruido de fondo. Se usaron los siguientes hiperparámetros: learning rate de 1e-5, batch size de 8, optimizador AdamW con betas (0.9, 0.999), scheduler lineal y 10 épocas. Se aplicó precisión mixta (Native AMP). No se menciona el uso de técnicas como RLHF o DPO; el ajuste es supervisado estándar sobre el corpus de habla.

## Capacidades

- Transcripción de audio a texto en el dominio de conversaciones telefónicas bancarias (consultas de saldo, transferencias, etc.).
- Reconocimiento de voz multilingüe, aunque el rendimiento varía según el idioma (el dataset incluye 14 idiomas, pero no se especifica el WER por idioma).
- Inferencia eficiente en CPU y GPUs de baja gama gracias a su tamaño reducido (37,7 M de parámetros).
- Compatible con el pipeline `automatic-speech-recognition` de Hugging Face Transformers.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de ASR.

## Casos de uso

- Transcripción de llamadas de atención al cliente: el modelo puede procesar grabaciones de centros de contacto para generar actas o análisis posteriores. Su tamaño permite ejecutarlo en servidores modestos o incluso en dispositivos locales.
- Asistentes de voz en banca: integración en sistemas de respuesta interactiva (IVR) para transcribir consultas del usuario y enrutarlas al departamento adecuado.
- Subtitulado automático de reuniones o podcasts: aunque el dominio es bancario, el modelo puede transcribir audio general con una precisión aceptable si el acento y el ruido son similares a los del dataset.
- Prototipado rápido de ASR: al ser un modelo pequeño y con licencia Apache 2.0, es ideal para pruebas de concepto sin invertir en infraestructura.
- Aplicaciones de accesibilidad: transcripción en tiempo real para personas con discapacidad auditiva en entornos controlados.
- Análisis de calidad de servicio: extraer texto de llamadas para detectar palabras clave o sentimiento, siempre que el WER no sea un obstáculo.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluación de `PolyAI/minds14`:

| Metrica | Valor |
|---|---|
| Loss | 0.6098 |
| WER | 0.3448 |
| WER Ortho | 0.3331 |

No se han publicado comparaciones con otros modelos en la información disponible. El WER del 34,5 % indica que el modelo comete errores en aproximadamente una de cada tres palabras, lo que puede ser aceptable para tareas de análisis de tendencias pero no para transcripción literal de alta precisión.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 37,7 M de parámetros, la inferencia en FP32 requiere menos de 1 GB de VRAM. Con cuantización a 8 bits (si se aplicara) podría bajar a ~200 MB, pero no se proporcionan datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (ej. NVIDIA GTX 1650, RTX 3050) o incluso CPU (inferencia lenta pero viable).
- Compatible con consumer GPUs: sí, cabe en prácticamente cualquier GPU moderna.
- Opciones de despliegue: vLLM, Hugging Face Transformers, ONNX Runtime, llama.cpp (si se convierte a GGUF), o directamente con el pipeline de Transformers.
- Latencia y throughput: no disponible, pero por su tamaño se espera una latencia de decenas de milisegundos por segmento de 30 segundos en GPU, y de unos pocos segundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (minds14) | Licencia |
|---|---|---|---|---|
| whisper-tiny-minds14 (este) | 37,7 M | 30 s | 0.3448 | Apache 2.0 |
| openai/whisper-tiny (base) | 37,7 M | 30 s | no disponible | MIT (original) |
| openai/whisper-small | 244 M | 30 s | no disponible | MIT (original) |

No se dispone de datos de rendimiento del modelo base en minds14, por lo que no es posible cuantificar la mejora del fine-tuning. Whisper-small, con más parámetros, probablemente obtenga un WER menor, pero requiere más recursos. La comparativa se limita a características generales.

## Limitaciones y advertencias

- El WER del 34,5 % es elevado; el modelo no es adecuado para transcripción médica, legal o cualquier contexto donde la precisión sea crítica.
- El dataset de entrenamiento (minds14) es específico de llamadas bancarias; el rendimiento en otros dominios (noticias, conversaciones informales) puede degradarse significativamente.
- No se especifican los idiomas exactos soportados ni el rendimiento por idioma; es probable que el modelo funcione mejor en inglés, que domina el dataset.
- Riesgo de alucinaciones: como todo modelo ASR, puede generar texto que no corresponde al audio, especialmente en segmentos con ruido o solapamiento de voces.
- La model card es generada automáticamente y carece de detalles sobre sesgos, composición del dataset o limitaciones éticas.
- Aunque la licencia es Apache 2.0, el modelo base (Whisper) tiene su propia licencia MIT; se debe verificar la compatibilidad en proyectos comerciales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bunny2308/whisper-tiny-minds14
- Dataset PolyAI/minds14: https://huggingface.co/datasets/PolyAI/minds14
- Modelo base openai/whisper-tiny: https://huggingface.co/openai/whisper-tiny
- Repos similares encontrados en la búsqueda web (no oficiales): https://huggingface.co/Artificed/whisper-tiny-minds14, https://huggingface.co/iammartian0/whisper-tiny-minds14
