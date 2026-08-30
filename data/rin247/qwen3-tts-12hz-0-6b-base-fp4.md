# Rin247/Qwen3-TTS-12Hz-0.6B-Base-FP4

## Resumen

Qwen3-TTS es una familia de modelos de síntesis de voz (text-to-speech) desarrollada por el equipo Qwen de Alibaba, presentada en el informe técnico arXiv:2601.15621. El modelo base de 0.6B parámetros, del cual este repositorio es una versión cuantizada en FP4, está diseñado para clonación de voz rápida a partir de una muestra de audio de referencia de aproximadamente 3 segundos, y admite control de la voz mediante instrucciones en lenguaje natural. Está entrenado con más de 5 millones de horas de habla en 10 idiomas, lo que le confiere una cobertura multilingüe amplia y una calidad de síntesis cercana a la humana.

La arquitectura se basa en un modelo de lenguaje (LM) de multi-codebook discreto que opera sobre un tokenizador acústico propio de 12 Hz, lo que permite una compresión eficiente y un modelado semántico de alta dimensión. El modelo soporta generación en streaming con una latencia extremadamente baja (97 ms de extremo a extremo), lo que lo hace adecuado para aplicaciones interactivas en tiempo real. Esta versión concreta, publicada por el usuario Rin247, aplica cuantización FP4 solo en los pesos, reduciendo el tamaño del modelo a aproximadamente 1,1 GB, manteniendo la licencia Apache 2.0 y el pipeline de text-to-speech.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM de multi-codebook discreto con tokenizador acustico Qwen3-TTS-Tokenizer-12Hz |
| Parametros totales | 651.974.720 (0,65B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4 (weight-only) en este repositorio; el modelo original se distribuye en bfloat16 |
| Idiomas soportados | chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol, italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3-TTS emplea una arquitectura de modelo de lenguaje autoregresivo que opera sobre representaciones discretas de audio generadas por un tokenizador acustico propio, el Qwen3-TTS-Tokenizer-12Hz. Este tokenizador comprime la senal de audio en una secuencia de tokens de multiples codebooks a una frecuencia de 12 Hz, lo que reduce la longitud de la secuencia y facilita el modelado de dependencias de largo alcance. El modelo se entrena de extremo a extremo para predecir los tokens de audio a partir del texto y de una referencia de voz, sin necesidad de pipelines separados de sintesis intermedia.

El entrenamiento se realizo con mas de 5 millones de horas de datos de habla en 10 idiomas, incluyendo multiples perfiles dialectales. El proceso incluye etapas de preentrenamiento y ajuste fino con datos de alta calidad, asi como tecnicas de alineacion para mejorar la robustez y la controlabilidad. Una innovacion destacada es la capacidad de generar voz a partir de descripciones en lenguaje natural (por ejemplo, "voz grave y calmada"), lo que se logra mediante un mecanismo de condicionamiento por instrucciones textuales. El modelo base, del que deriva esta version cuantizada, se centra en la clonacion de voz a partir de una muestra de referencia, mientras que las variantes mas grandes anaden control por descripcion y otras funcionalidades.

## Capacidades

- Clonacion de voz a partir de una muestra de audio de referencia de aproximadamente 3 segundos, sin necesidad de entrenamiento adicional.
- Sintesis de voz multilingue en 10 idiomas: chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano.
- Generacion en streaming con latencia de extremo a extremo de 97 ms, apta para interaccion en tiempo real.
- Control de atributos acusticos mediante instrucciones en lenguaje natural (voz grave, rapida, susurrada, etc.) en las variantes que lo soportan.
- Manejo de texto complejo, incluyendo formulas matematicas, simbolos y emojis, como se muestra en el ejemplo de la documentacion.
- Soporte de multiples perfiles dialectales dentro de cada idioma.
- Integracion sencilla mediante la libreria `qwen-tts` con soporte para Flash Attention 2.

## Casos de uso

- Asistentes de voz personalizados: el modelo permite clonar la voz de un usuario con solo 3 segundos de audio, lo que facilita la creacion de asistentes con la voz propia del cliente en aplicaciones de banca, salud o educacion.
- Doblaje automatico de contenido audiovisual: gracias a la clonacion de voz y al soporte multilingue, se puede generar doblaje de videos o podcasts manteniendo la voz del orador original en diferentes idiomas.
- Lectura de textos largos en aplicaciones de accesibilidad: la generacion en streaming con baja latencia permite leer articulos, libros o noticias en tiempo real, con control de velocidad y tono mediante instrucciones.
- Sistemas de respuesta interactiva en centros de atencion al cliente: el modelo puede sintetizar respuestas con una voz consistente y natural, integrandose en chatbots telefonicos o virtuales con tiempos de respuesta inferiores a 100 ms.
- Creacion de contenido educativo multilingue: permite generar narraciones en 10 idiomas a partir de un mismo guion, manteniendo la coherencia de la voz del instructor, util para plataformas de e-learning.
- Prototipado rapido de productos de voz: al ser un modelo ligero (0,6B parametros) y cuantizado en FP4, puede desplegarse en entornos de desarrollo y pruebas con requisitos de hardware modestos, acelerando el ciclo de iteracion de aplicaciones de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El informe tecnico de Qwen3-TTS (arXiv:2601.15621) puede contener evaluaciones comparativas, pero no se han incluido en los datos proporcionados. No se dispone de metricas objetivas como MOS (Mean Opinion Score), WER (Word Error Rate) o comparaciones con otros modelos TTS para esta version cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay datos oficiales para la version FP4. Dado que el modelo tiene 0,65B parametros y los pesos estan cuantizados a 4 bits, el peso del modelo ocupa aproximadamente 0,33 GB. Con activaciones y overhead, se estima que la inferencia puede ejecutarse en GPUs con 2-4 GB de VRAM, aunque no se ha verificado.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o superiores. Para uso en produccion con mayor concurrencia, se recomienda una RTX 3090 o A10.
- Compatibilidad con GPUs de consumo: si, el modelo cabe en GPUs de gama media y baja gracias a la cuantizacion FP4.
- Opciones de despliegue: la libreria `qwen-tts` permite cargar el modelo con `device_map="cuda:0"` y `dtype=torch.bfloat16`. Tambien se puede usar con Flash Attention 2 para optimizar el rendimiento. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de audio, no de texto.
- Latencia y throughput: la latencia de generacion en streaming es de 97 ms de extremo a extremo segun la documentacion del modelo original. No se dispone de datos de throughput para esta version cuantizada.

## Comparativa con modelos similares

No se dispone de datos cuantitativos para una comparativa rigurosa. Como alternativas en el espacio de TTS multilingue con clonacion de voz se pueden considerar:

| Modelo | Parametros | Idiomas | Clonacion de voz | Licencia |
|---|---|---|---|---|
| Qwen3-TTS-12Hz-0.6B-Base (este) | 0,65B | 10 | Si (3 s) | Apache 2.0 |
| Coqui XTTS v2 | 0,47B | 17 | Si (6 s) | CPML (no comercial) |
| Bark (Suno) | 1,2B | 13 | No (solo voces predefinidas) | MIT |
| VITS | ~0,1B | 1-2 | No | MIT |

La comparacion es cualitativa y se basa en informacion publica general. No se han encontrado benchmarks directos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion FP4 puede degradar ligeramente la calidad de la sintesis en comparacion con el modelo original en bfloat16, aunque no se han publicado evaluaciones objetivas al respecto.
- El modelo puede presentar sesgos en la pronunciacion de nombres propios o terminos tecnicos poco frecuentes, especialmente en idiomas con menos representacion en los datos de entrenamiento.
- Existe riesgo de alucinacion acustica: en contextos ambiguos o con ruido en la referencia de audio, el modelo puede generar sonidos o entonaciones inesperadas.
- La clonacion de voz plantea riesgos de uso indebido (suplantacion de identidad). Se recomienda implementar mecanismos de verificacion y consentimiento en aplicaciones de produccion.
- La longitud de contexto no esta documentada; para textos muy largos puede ser necesario segmentar la entrada.
- Aunque la licencia es Apache 2.0, el uso comercial esta permitido, pero se deben revisar las condiciones del modelo original y de los datos de entrenamiento (no se especifica la procedencia de los datos de audio).
- El repositorio de Rin247 es una publicacion reciente (agosto de 2026) con cero descargas y cero likes; no hay evidencia de pruebas exhaustivas por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace de esta version cuantizada: https://huggingface.co/Rin247/Qwen3-TTS-12Hz-0.6B-Base-FP4
- Modelo original en HuggingFace: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Informe tecnico (arXiv): https://huggingface.co/papers/2601.15621
- Repositorio GitHub oficial: https://github.com/QwenLM/Qwen3-TTS
- Demo oficial en HuggingFace Spaces: https://huggingface.co/spaces/Qwen/Qwen3-TTS
