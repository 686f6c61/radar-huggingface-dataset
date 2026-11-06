# shualt/mms-tts-spa-peruana-mara

## Resumen

`shualt/mms-tts-spa-peruana-mara` es un modelo de síntesis de voz (text-to-audio) publicado en Hugging Face por el usuario `shualt`. Por el identificador y la nomenclatura, se trata de un checkpoint derivado del sistema MMS (Massively Multilingual Speech) de Meta, que emplea la arquitectura VITS para la conversión de texto a voz. El sufijo "spa-peruana-mara" sugiere una variante de español peruano, presumiblemente adaptada a una voz concreta ("Mara"), aunque la model card no documenta ni el proceso de adaptación ni el corpus utilizado.

El modelo es de tamaño muy reducido: 36.285.936 parámetros (unos 36,3 millones) y un repositorio de 0,1 GB, lo que lo sitúa en la categoría de TTS ligero, apto para inferencia en CPU o GPU de gama baja. La model card es la plantilla automática de Hugging Face y prácticamente todos los campos están sin cumplimentar ("More Information Needed"), por lo que la información disponible sobre datos de entrenamiento, licencia, idiomas y evaluación es mínima.

Su relevancia actual es limitada pero concreta: cubre una variante dialectal del español (peruano) poco representada en los sistemas TTS multilingües generalistas, y al ser un modelo pequeño permite despliegues locales de bajo coste. No obstante, la ausencia de documentación y de métricas publicadas obliga a validar su calidad de forma empírica antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference with adversarial learning for end-to-end TTS), según el tag `vits` |
| Parámetros totales | 36.285.936 (36,3 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; la entrada es texto, no una ventana de contexto de tokens) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp32/fp16 sin cuantizaciones publicadas) |
| Idiomas soportados | español peruano (inferido del identificador); no documentado en la model card |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-to-audio |
| Librería | transformers |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es VITS, un modelo end-to-end de síntesis de voz que combina un encoder de texto, un predictor de duración, un normalizador de flujo basado en variables latentes y un decoder generativo (HiFi-GAN) entrenado con aprendizaje adversarial, tal como describe el paper de Kim et al. (arXiv:1910.09700). El tag `arxiv:1910.09700` en el repositorio apunta directamente a esa referencia. VITS produce audio de forma directa a partir del texto, sin vocoder separado, y es la arquitectura empleada por los checkpoints MMS-TTS de Meta para más de mil lenguas.

No hay información sobre el corpus de entrenamiento, el número de horas de audio, la composición del dataset, el proceso de fine-tuning desde un checkpoint MMS base ni sobre si se aplicaron técnicas de adaptación (por ejemplo, ajuste de la voz "Mara" sobre datos de un hablante concreto). La model card indica "More Information Needed" en todas las secciones de entrenamiento e hiperparámetros. No se documentan innovaciones técnicas adicionales más allá de las propias de VITS.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) en español peruano, presumiblemente con una voz femenina concreta ("Mara").
- Generación de audio en formato waveform mediante el pipeline `text-to-audio` de transformers.
- Inferencia ligera: 36,3 M de parámetros permiten ejecución en CPU y en GPUs de consumo.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-step (no aplica a un modelo TTS).
- No se documenta capacidad multilingüe más allá del español peruano inferido.
- No se documenta control de prosodia, clonación de voz, emoción ni otras capacidades especiales.

## Casos de uso

- Locución de artículos y blogs: convertir texto periodístico o entradas de blog en audio con acento peruano para audiencias de Perú, usando el pipeline `text-to-audio` con fragmentos de texto por invocación.
- Accesibilidad web: integrar el modelo en un lector de pantalla o extensión de navegador para usuarios con discapacidad visual que prefieren una voz en español peruano; el tamaño reducido permite ejecución local sin depender de APIs externas.
- Aplicaciones educativas: generar narraciones de material didáctico en español peruano para plataformas de e-learning, con bajo coste de inferencia por el reducido número de parámetros.
- Asistentes de voz embebidos: desplegar el modelo en dispositivos de gama baja (Raspberry Pi, portátiles sin GPU) para respuestas habladas en español peruano, dado que 36,3 M de parámetros caben en memoria de forma holgada.
- Prototipado de productos de voz: usar el checkpoint como base para experimentar con variantes dialectales del español antes de invertir en modelos TTS comerciales de mayor tamaño.
- Generación de audiolibros de nicho: producir audio de textos dirigidos a audiencias peruanas, con validación manual de prosodia y pronunciación antes de publicar.
- Pruebas de calidad (QA) de pipelines TTS: servir como referencia ligera en tests automatizados de integración de sistemas de síntesis de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 36,3 M de parámetros, los pesos en fp32 ocupan aproximadamente 145 MB y en fp16 unos 73 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el modelo es sobredimensionado para GPUs de gama alta como A100 o H100, que lo ejecutarían muy por debajo de su capacidad.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer (RTX 3060, RTX 4090, GTX 1650) e incluso en CPU.
- Opciones de despliegue: pipeline `text-to-audio` de transformers; exportación a ONNX para inferencia optimizada; integración en servidores HTTP propios. No se documenta soporte específico en vLLM, llama.cpp, Ollama o TGI (no aplica a un modelo TTS).
- Latencia y throughput estimados: no disponibles; por el tamaño del modelo se espera latencia de milisegundos por frase en GPU y de decenas o centenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `shualt/mms-tts-spa-peruana-mara` | 36,3 M | texto (TTS) | español peruano (inferido) | no disponible | Hugging Face |
| `facebook/mms-tts-spa` | ~36 M (familia MMS-TTS) | texto (TTS) | español | CC-BY-NC 4.0 (según la familia MMS) | Hugging Face |
| `facebook/mms-tts-*` (otras lenguas) | ~36 M por checkpoint | texto (TTS) | más de 1.000 lenguas | CC-BY-NC 4.0 (según la familia MMS) | Hugging Face |

La comparación con la familia MMS-TTS de Meta es la más directa por arquitectura y tamaño; los datos de licencia y parámetros de esos checkpoints se indican a título orientativo y deben verificarse en sus repositorios. No se dispone de benchmarks comparativos publicados para este checkpoint.

## Limitaciones y advertencias

- Model card prácticamente vacía: no se documentan datos de entrenamiento, licencia, idiomas ni evaluación; cualquier uso comercial requiere verificar la licencia de forma independiente.
- Licencia no disponible: existe riesgo legal si se usa en producción sin confirmar los términos; la familia MMS de Meta suele publicarse bajo CC-BY-NC 4.0, lo que restringiría el uso comercial.
- Riesgo de alucinación acústica: los modelos TTS pueden generar artefactos, pronunciaciones erróneas o audio ininteligible en textos fuera de distribución (nombres propios, siglas, números, código).
- Cobertura limitada al español peruano: no se documenta comportamiento en otros dialectos del español ni en otras lenguas; la calidad fuera de ese registro es desconocida.
- Sesgos de voz: al estar presumiblemente adaptado a una voz concreta ("Mara"), la diversidad de hablantes, género y edad es nula; puede reforzar estereotipos de voz.
- Sin métricas de calidad: no hay MOS, WER ni comparaciones publicadas, por lo que la calidad percibida debe evaluarse manualmente.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación por terceros.
- Fecha de creación futura (2026-11-06) en los metadatos: conviene verificar la integridad y procedencia del checkpoint antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shualt/mms-tts-spa-peruana-mara
- Paper de VITS (arquitectura): https://arxiv.org/abs/1910.09700
- Familia MMS de Meta (referencia de la arquitectura y checkpoints base): https://huggingface.co/facebook/mms-tts-spa
- Documentación del pipeline `text-to-audio` de transformers: https://huggingface.co/docs/transformers/main/en/main_classes/pipelines#transformers.TextToAudioPipeline
