# microsoft/VibeVoice-ASR-Streaming-1.5B

## Resumen

VibeVoice-ASR-Streaming-1.5B es un modelo de reconocimiento automático del habla (ASR) en streaming desarrollado por Microsoft Research, diseñado para transcribir simultáneamente quién habla (atribución de hablante) y qué dice (contenido), con soporte para palabras calientes personalizadas y diez idiomas. Forma parte de la familia VibeVoice, que incluye también modelos de texto a voz (TTS), y se publica bajo licencia MIT, lo que permite uso comercial y modificación.

El modelo destaca por su capacidad de transcripción en tiempo real con atribución de hablante, una característica poco común en sistemas ASR de código abierto. Aunque el nombre sugiere 1.5B, los pesos reales en safetensors indican aproximadamente 2.814 millones de parámetros (2.8B), lo que lo sitúa en un rango medio para ASR multilingüe. Está integrado con la librería transformers de Hugging Face y se distribuye junto con un repositorio de código y una demo en vivo.

Su relevancia actual radica en que combina streaming, multilingüismo (incluido español) y personalización mediante hotwords, cubriendo necesidades de producción en subtitulación en vivo, transcripción de reuniones y asistentes de voz. El modelo está respaldado por un informe técnico en arXiv y un playground interactivo oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (modelo ASR basado en transformers, arquitectura exacta no especificada) |
| Parametros totales | 2.814.116.321 (2,81B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (al ser ASR, el contexto se refiere a la ventana de audio; no se especifica) |
| Tipos de cuantizacion | No disponible (no se mencionan cuantizaciones oficiales) |
| Idiomas soportados | chino, ingles, frances, aleman, italiano, japones, coreano, portugues, ruso y español (10 idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 5,6 GB) |

## Arquitectura y entrenamiento

La informacion publica no detalla la arquitectura interna del modelo. Se sabe que es un modelo de ASR en streaming con atribucion de hablante, lo que implica una arquitectura capaz de procesar audio de forma incremental y producir transcripciones con etiquetas de locutor. La familia VibeVoice, segun el repositorio de GitHub, se basa en tokenizadores de habla continua (acusticos y semanticos) que operan a una frecuencia ultrabaja de 7,5 Hz, lo que mejora la eficiencia computacional y preserva la fidelidad del audio. Sin embargo, no se especifican los datos de entrenamiento (numero de horas de audio, composicion del dataset) ni si se aplicaron tecnicas como RLHF o DPO. El modelo se publica con un informe tecnico en arXiv (2609.02812), aunque el contenido del paper no esta disponible en los materiales consultados.

## Capacidades

- Transcripcion de voz a texto en streaming, procesando audio conforme llega, sin esperar a la frase completa.
- Atribucion de hablante: identifica y etiqueta quién dice cada segmento en conversaciones multi-locutor.
- Palabras calientes personalizadas: permite al usuario proporcionar nombres propios o terminos tecnicos para mejorar el reconocimiento de contenido especifico del dominio.
- Soporte multilingue para diez idiomas: chino, ingles, frances, aleman, italiano, japones, coreano, portugues, ruso y español.
- Integracion con la libreria transformers de Hugging Face, facilitando su uso en pipelines estandar de ASR.
- Compatible con endpoints de Hugging Face (region us), lo que permite despliegue en la infraestructura de HF.

## Casos de uso

- Subtitulacion en vivo de reuniones y conferencias: el streaming con atribucion de hablante permite generar subtitulos en tiempo real que indican qué participante está hablando, mejorando la accesibilidad y el seguimiento de conversaciones multi-locutor.
- Transcripcion de atencion al cliente: en centros de llamadas, el modelo puede transcribir conversaciones entre cliente y agente en streaming, etiquetando cada turno, lo que facilita el analisis posterior y el entrenamiento de agentes.
- Asistentes de voz en tiempo real: integrado en aplicaciones de asistente, permite dictado continuo y comandos de voz con reconocimiento de terminos personalizados (nombres de productos, jerga tecnica).
- Creacion de actas automaticas en entornos legales o medicos: la transcripcion con atribucion de hablante y hotwords (terminos medicos, nombres de partes) reduce errores en documentacion profesional.
- Analisis de contenido multimedia: transcripcion de podcasts, videos o grabaciones archivadas con identificacion de locutores, util para indexacion y busqueda de contenido.
- Traduccion simultanea asistida: aunque el modelo solo transcribe, puede usarse como primer paso en un pipeline que combine ASR con traduccion automatica, aprovechando la transcripcion en streaming y el multilingüismo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una figura con resultados de evaluacion, pero el contenido de la imagen no esta accesible en los materiales consultados. El informe tecnico en arXiv (2609.02812) podria contener datos comparativos, pero no se ha podido acceder a su contenido. Por tanto, no es posible presentar una tabla de benchmarks sin inventar numeros.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2.814 millones de parametros, en precision fp16 los pesos ocupan aproximadamente 5,6 GB (coincide con el tamano del repo). En cuantizacion int8, podria reducirse a ~2,8 GB, y en int4 a ~1,4 GB, aunque no hay cuantizaciones oficiales publicadas.
- GPU recomendadas: para inferencia en streaming en tiempo real, se recomienda una GPU con al menos 8 GB de VRAM (p. ej., RTX 3060, RTX 4060) en fp16. Para produccion con multiples peticiones concurrentes, una A10 o A100 seria adecuada.
- Consumer GPU: si, cabria en GPUs de consumo con 8-12 GB de VRAM, como RTX 3080, RTX 4070 o superiores, siempre que se use fp16 o cuantizacion ligera.
- Opciones de despliegue: al ser compatible con transformers, puede servirse con TGI (Text Generation Inference) o vLLM (aunque estos estan orientados a LLM, no a ASR), o mediante pipelines de Hugging Face. Tambien se podria usar con ONNX Runtime o TensorRT para optimizacion. El repositorio de GitHub de VibeVoice probablemente incluya scripts de inferencia especificos.
- Latencia y throughput: no se han publicado datos oficiales. Al ser un modelo de streaming, la latencia depende de la ventana de audio procesada; con la tokenizacion a 7,5 Hz, se espera una eficiencia alta, pero sin cifras concretas no se puede cuantificar.

## Comparativa con modelos similares

| Modelo | Parametros | Streaming | Atribucion de hablante | Idiomas | Licencia |
|---|---|---|---|---|---|
| VibeVoice-ASR-Streaming-1.5B | 2,81B | Si | Si | 10 | MIT |
| OpenAI Whisper large-v3 | 1,55B | No (procesa audio completo) | No | 99 | MIT (codigo) |
| NVIDIA Parakeet TDT-0.6B | 0,6B | Si | No | 1 (ingles) | CC-BY-4.0 |

Nota: la comparativa se basa en caracteristicas generales conocidas de estos modelos. No se dispone de benchmarks comparativos publicados para VibeVoice. Whisper es un modelo no streaming, por lo que no es directamente comparable en el caso de uso de transcripcion en vivo. Parakeet es un modelo ASR en streaming pero sin atribucion de hablante y con menos idiomas. La ventaja diferencial de VibeVoice es la combinacion de streaming, multilingüismo y atribucion de hablante en un solo modelo.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos en la informacion publica, pero como modelo entrenado con datos de habla, puede presentar sesgos en el reconocimiento de acentos, dialectos o grupos demograficos subrepresentados.
- Riesgo de alucinacion: en ASR, el riesgo de alucinacion se manifiesta como inserciones de palabras o frases inexistentes en el audio, especialmente en condiciones de ruido o con hablantes superpuestos. No se han publicado tasas de error ni estudios de robustez.
- Limitaciones de contexto: al ser un modelo de streaming, la ventana de audio procesada en cada paso es limitada; no se especifica la duracion maxima de la ventana ni si hay perdida de contexto en conversaciones muy largas.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo puede tener limitaciones de uso en ciertos paises o sectores regulados (por ejemplo, sanidad o finanzas) donde se requiera certificacion.
- Caveat para produccion: no se proporcionan datos de latencia, throughput ni requisitos de hardware oficiales, por lo que es necesario realizar pruebas de carga en el entorno de despliegue objetivo. Ademas, el modelo esta pensado para investigacion y desarrollo; se recomienda validar su comportamiento en el dominio especifico antes de usarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/microsoft/VibeVoice-ASR-Streaming-1.5B
- Repositorio GitHub: https://github.com/microsoft/VibeVoice
- Demo en vivo: https://aka.ms/vibeasr
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.02812
- Pagina del proyecto: https://microsoft.github.io/VibeVoice/
- Modelo TTS relacionado: https://huggingface.co/microsoft/VibeVoice-1.5B
