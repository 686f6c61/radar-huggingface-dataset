# mazesmazes/tiny-audio-turn-aware-qwen3-asr-v2

## Resumen

`mazesmazes/tiny-audio-turn-aware-qwen3-asr-v2` es un modelo de reconocimiento automático del habla (ASR) publicado en Hugging Face por el usuario mazesmazes, con 782.426.112 parámetros reales confirmados a partir de los pesos en safetensors. El nombre y la etiqueta `qwen3_asr` apuntan a una arquitectura derivada de la familia Qwen3-ASR, y el calificativo "turn-aware" sugiere que el modelo está diseñado para reconocer habla en contextos conversacionales con turnos de palabra, es decir, audio con intervenciones alternas de varios hablantes. No obstante, la model card publicada es la plantilla automática de transformers sin ningún campo rellenado, por lo que no hay confirmación oficial de arquitectura, datos de entrenamiento ni objetivos.

El modelo pertenece a la misma familia que otros trabajos del mismo autor, como `mazesmazes/tiny-audio` (encoder HuBERT-XLarge adaptado con LoRA más un decoder SmolLM3-3B, también con LoRA, unidos por un proyector de audio) y `mazesmazes/tiny-audio-omni` (encoder GLM-ASR que convierte audio a 16 kHz en embeddings de 768 dimensiones, un proyector MLP de dos capas con apilado de tramas y un generador de texto Qwen3). Es razonable inferir que esta variante sigue un esquema similar de encoder de audio más decoder de lenguaje, pero se trata de una inferencia por contexto y no de un dato documentado en la ficha del modelo.

La relevancia actual es limitada y hay que ser honesto al respecto: el repositorio acumula 0 descargas y 0 "likes" en el momento de la consulta, no declara licencia ni idiomas, y no incluye resultados de evaluación. Es, por tanto, un artefacto experimental de investigación más que un modelo listo para producción. Su interés principal es el tamaño reducido (menos de 800 millones de parámetros) y el enfoque en ASR conversacional con turnos, un nicho donde abundan los modelos grandes y escasean las alternativas ligeras.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La etiqueta `qwen3_asr` y el nombre del modelo sugieren una arquitectura de ASR basada en Qwen3, sin confirmar en la model card |
| Parámetros totales | 782.426.112 (dato real extraído de los safetensors) |
| Parámetros activos | No procede. No hay indicios de que sea un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. El repositorio solo contiene pesos en safetensors; no se han publicado versiones GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible |
| Licencia | No disponible. No se declara licencia en la ficha de Hugging Face |
| Formato de pesos | Safetensors (librería transformers) |
| Tamaño del repositorio | 1,6 GB |
| Pipeline declarado | automatic-speech-recognition |
| Modalidad de entrada | Audio (inferido por el pipeline ASR) |
| Fecha de creación | 27 de septiembre de 2026 |
| Última actualización | 27 de septiembre de 2026 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna de este modelo concreto. La model card es la plantilla automática de Hugging Face y todos los apartados relevantes (descripción, tipo de modelo, datos de entrenamiento, hiperparámetros, régimen de precisión, infraestructura de cómputo, procedimiento de evaluación) figuran como "[More Information Needed]". Lo único verificable es el recuento de parámetros a partir de los pesos y las etiquetas del repositorio, que incluyen `qwen3_asr`, `automatic-speech-recognition` y `endpoints_compatible`.

Por analogía con los otros modelos públicos del mismo autor, es plausible que la arquitectura combine un encoder acústico con un decodificador de lenguaje de la familia Qwen3, conectados mediante un proyector entrenable que alinea los espacios de representación de audio y texto. En `mazesmazes/tiny-audio-omni` el diseño documentado es un encoder GLM-ASR que produce embeddings de 768 dimensiones a partir de audio a 16 kHz, un proyector MLP de dos capas con apilado de tramas y un modelo Qwen3 que genera texto de forma autorregresiva. En `mazesmazes/tiny-audio` el esquema es un encoder HuBERT-XLarge adaptado con LoRA y un decoder SmolLM3-3B también con LoRA. El sufijo "turn-aware" en el nombre del modelo que nos ocupa indica, como mínimo, que el entrenamiento o el formateo de entrada contempla la estructura de turnos de una conversación. Cualquier afirmación más detallada sobre datos de entrenamiento, número de tokens, composición del dataset, uso de RLHF o DPO, o innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.) sería especulación y no se incluye aquí.

## Capacidades

- Reconocimiento automático del habla: el pipeline declarado es `automatic-speech-recognition`, por lo que la función principal es transcribir audio a texto.
- Procesamiento de audio conversacional con turnos: el nombre "turn-aware" indica que el modelo está pensado para audio con intervenciones alternas, aunque no se especifica cómo se representa esa estructura ni qué metadatos de turno espera la entrada.
- Generación de texto condicionada por audio: si la arquitectura sigue el patrón encoder-decoder de los otros modelos del autor, el componente de lenguaje genera la transcripción de forma autorregresiva.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el modelo puede desplegarse a través de Hugging Face Inference Endpoints.
- Capacidades de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible. No se declara ningún idioma en la ficha.
- Modo de razonamiento explícito (thinking), visión o audio generation: no disponible.
- Procesamiento de audio de entrada: la frecuencia de muestreo esperada, la duración máxima y el formato exacto de entrada no están documentados.

## Casos de uso

Dado que no hay documentación funcional ni evaluaciones, los casos siguientes son escenarios plausibles para un modelo ASR de 782 millones de parámetros orientado a conversación, no aplicaciones validadas por el autor:

- Transcripción de reuniones y llamadas: un modelo "turn-aware" encaja en la diarización implícita de conversaciones, donde cada turno de palabra debe transcribirse y atribuirse a un segmento. El tamaño reducido permite ejecutarlo en la misma máquina que captura el audio, sin depender de servicios en la nube.
- Subtitulado en directo de bajo coste: con menos de 800 millones de parámetros, la latencia por segmento es manejable en GPU de gama media, lo que permite generar subtítulos en streaming en aplicaciones de vídeo o accesibilidad.
- Transcripción de notas de voz y mensajería: integración en aplicaciones móviles o de escritorio que convierten mensajes de audio en texto; el requisito de VRAM bajo hace viable el despliegue en portátiles con GPU integrada o incluso en CPU.
- Preprocesado de datos para entrenamiento de otros modelos: transcripción masiva de corpus de audio (podcasts, entrevistas, archivos de atención al cliente) para generar datasets de texto, aprovechando el bajo coste por hora de audio frente a modelos de miles de millones de parámetros.
- Análisis de conversaciones de contact center: transcripción de llamadas para posteriormente aplicar análisis de sentimiento, detección de intenciones o control de calidad, con el componente de turnos facilitando la separación de agente y cliente.
- Asistentes de voz con contexto conversacional: el modelo puede actuar como frontal de ASR en un pipeline donde un LLM separado gestiona el diálogo, aportando la transcripción sensible a turnos y dejando la generación de respuestas al modelo de lenguaje.
- Investigación en ASR eficiente: como modelo pequeño con arquitectura derivada de Qwen3-ASR, sirve de base para experimentos de destilación, adaptación con LoRA a dominios concretos o comparación de estrategias de proyección audio-texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación cumplimentada, no hay tabla de resultados en el repositorio y la búsqueda web no devuelve métricas de WER, MMLU, HumanEval ni de ninguna otra tarea para este identificador concreto. No se deben extrapolar los resultados de `mazesmazes/tiny-audio` o `mazesmazes/tiny-audio-omni`, que son modelos distintos.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento real de parámetros (782.426.112). No hay mediciones publicadas de latencia ni throughput:

- Peso de los pesos sin cuantizar: en fp32, unos 3,1 GB; en fp16 o bf16, unos 1,6 GB, coherente con el tamaño del repositorio de 1,6 GB.
- VRAM estimada para inferencia en fp16/bf16: entre 2 y 3 GB contando pesos, caché de atención y activaciones del encoder de audio, con margen según la duración del audio de entrada.
- VRAM estimada en cuantización INT8: en torno a 1-1,5 GB; en INT4, en torno a 0,8-1 GB. Estas cifras son estimaciones de peso teórico, ya que el repositorio no publica pesos cuantizados.
- GPU recomendadas: cabe holgadamente en cualquier GPU de consumo con 6 GB o más de VRAM, como RTX 3060, RTX 4060, RTX 4070, RTX 4080 o RTX 4090. En el entorno profesional, una NVIDIA A10G, L4, A100 o H100 lo ejecutan sin problema, aunque están sobredimensionadas para este tamaño.
- Inferencia en CPU: viable en términos de memoria (menos de 2 GB en fp32), con latencia mayor y dependiente del número de hilos y de la optimización del runtime.
- Opciones de despliegue: la librería declarada es `transformers` y la etiqueta `endpoints_compatible` apunta a Hugging Face Inference Endpoints. El soporte en vLLM o TGI depende de si esos motores reconocen la arquitectura `qwen3_asr`, algo que no está documentado; es probable que requiera `trust_remote_code`. No hay pesos GGUF en el repositorio, por lo que llama.cpp y Ollama no son utilizables directamente sin una conversión previa.
- Latencia y throughput: no disponible. No se han publicado mediciones de tiempo real (RTF), latencia por segmento ni palabras por segundo.

## Comparativa con modelos similares

La comparación se limita a parámetros, licencia y disponibilidad, porque no existen métricas publicadas de este modelo ni de los alternativos en la información disponible:

| Modelo | Parámetros | Contexto / ventana de audio | Licencia | Disponibilidad |
|---|---|---|---|---|
| tiny-audio-turn-aware-qwen3-asr-v2 | 782 M | No disponible | No disponible | Repositorio Hugging Face, safetensors |
| openai/whisper-large-v3 | 1.550 M | Ventana de 30 s por segmento | MIT | Ampliamente desplegado, GGUF y múltiples runtimes |
| openai/whisper-small | 244 M | Ventana de 30 s por segmento | MIT | Ampliamente desplegado, GGUF y múltiples runtimes |
| mazesmazes/tiny-audio | No disponible (encoder HuBERT-XLarge + decoder SmolLM3-3B) | No disponible | No disponible | Repositorio Hugging Face |
| mazesmazes/tiny-audio-omni | No disponible (encoder GLM-ASR + Qwen3) | No disponible | No disponible | Repositorio Hugging Face |

El rendimiento comparado en WER no está disponible para ninguno de los modelos de la familia tiny-audio, y las cifras de Whisper no son trasladables a este modelo sin una evaluación propia. La diferencia más relevante es la licencia: las variantes de Whisper usan MIT y permiten uso comercial sin ambigüedad, mientras que este modelo no declara licencia alguna.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática sin rellenar; no hay descripción, datos de entrenamiento, evaluación ni instrucciones de uso.
- Licencia no declarada: sin licencia explícita, el uso comercial queda en una zona legal indeterminada. En la práctica, la ausencia de licencia implica que no se conceden derechos de uso más allá de los que permita la legislación aplicable, por lo que no debería desplegarse en producción sin aclararlo con el autor.
- Riesgo de alucinación en ASR: cualquier modelo de reconocimiento de habla puede generar texto plausible que no corresponde a lo dicho, especialmente con ruido de fondo, solapamiento de voces, acentos no vistos en entrenamiento o audio fuera de dominio. Sin evaluación publicada no es posible acotar esta tasa.
- Sesgos desconocidos: al no documentarse la composición del dataset de entrenamiento, no se puede evaluar el sesgo por variedad dialectal, género, edad o idioma. El rendimiento podría degradarse notablemente en variedades del español distintas de las representadas en los datos.
- Idiomas no especificados: la ficha no declara idiomas soportados, por lo que no hay garantía de que funcione en castellano ni en ninguna otra lengua concreta.
- Comportamiento "turn-aware" no definido: no se documenta qué formato de entrada espera para los turnos, si requiere marcas temporales, si separa hablantes ni cómo se comporta con solapamientos.
- Contexto no disponible: se desconoce la duración máxima de audio que admite por inferencia, lo que impide planificar su uso en reuniones largas sin troceado previo.
- Metadatos engañosos: la etiqueta `arxiv:1910.09700` del repositorio corresponde al artículo de Lacoste et al. sobre el calculador de impacto medioambiental, incluido por defecto en la plantilla de model card. No es un paper del modelo y no debe citarse como referencia técnica.
- Sin validación comunitaria: 0 descargas y 0 "likes" en el momento de la consulta. No hay informes de terceros sobre su comportamiento real y no ha pasado ninguna revisión independiente.
- Sin pesos cuantizados: al no haber GGUF ni formatos de cuantización publicados, la integración en runtimes ligeros requiere conversión propia con el riesgo de incompatibilidad que ello conlleva en arquitecturas poco comunes.
- Fecha de publicación futura en los metadatos: el repositorio figura creado el 27 de septiembre de 2026, lo que conviene verificar antes de tratarlo como un artefacto estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mazesmazes/tiny-audio-turn-aware-qwen3-asr-v2
- Modelo relacionado del mismo autor, tiny-audio: https://huggingface.co/mazesmazes/tiny-audio
- Modelo relacionado del mismo autor, tiny-audio-omni: https://huggingface.co/mazesmazes/tiny-audio-omni
- Repositorio de código tiny-audio en GitHub: https://github.com/alexkroman/tiny-audio
- Artículo citado en la etiqueta del repositorio (Lacoste et al., 2019, sobre estimación de emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental de aprendizaje automático: https://mlco2.github.io/impact
- Catálogo de modelos de ONNX Runtime (contexto de despliegue alternativo): https://onnxruntime.ai/models
