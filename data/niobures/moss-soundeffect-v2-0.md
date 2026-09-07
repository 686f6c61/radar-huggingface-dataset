# niobures/MOSS-SoundEffect-v2.0

## Resumen

MOSS-SoundEffect v2.0 es un modelo de texto a audio desarrollado por el equipo OpenMOSS, dentro de la familia MOSS-TTS. Está diseñado para generar efectos de sonido no verbales de alta fidelidad a partir de descripciones en lenguaje natural: ambientes naturales, escenas urbanas, sonidos de animales, acciones humanas y clips musicales cortos o percusivos. El modelo resuelve el problema de la síntesis de efectos de sonido bajo demanda, evitando la dependencia de librerías de stock o grabaciones manuales.

La arquitectura combina un Diffusion Transformer (DiT) de 1.3B parámetros entrenado con el objetivo Flow Matching, un DAC VAE para la decodificación de audio y un codificador de texto basado en Qwen/Qwen3-1.7B. La versión 2.0 sustituye al backbone autoregresivo de tokens discretos de la v1 (MossTTSDelay) por un diseño de difusión en latente continuo, lo que mejora la calidad y permite generar audio estable de hasta 30 segundos a 48 kHz. Los prompts pueden escribirse en inglés o chino, y la duración se controla mediante una etiqueta de tiempo prepended al prompt durante el entrenamiento.

El modelo se distribuye bajo licencia Apache 2.0 y está disponible en HuggingFace. Aunque el repositorio de la ficha aparece bajo el usuario `niobures`, la documentación oficial hace referencia a `OpenMOSS-Team/MOSS-SoundEffect-v2.0`, por lo que conviene verificar la procedencia antes de un uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) + Flow Matching, con DAC VAE y text encoder Qwen3 |
| Parametros totales | 1.416.047.744 (1.416B); el DiT declara 1.3B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (generacion de audio; duracion maxima de 30 segundos) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

MOSS-SoundEffect v2.0 es un modelo de generacion de audio basado en un Diffusion Transformer (DiT) entrenado con el objetivo Flow Matching. El flujo de generacion es el siguiente: el prompt de texto se procesa con un codificador basado en Qwen3-1.7B, que condiciona al DiT. El DiT genera latentes continuos en el espacio de un DAC VAE, y este VAE decodifica los latentes a una forma de onda de 48 kHz. El modelo incluye una etiqueta de duracion en el prompt durante el entrenamiento, lo que permite fijar la longitud de la salida hasta un maximo de 30 segundos.

La v2.0 abandona el enfoque autoregresivo de tokens discretos de la v1 (MossTTSDelay) en favor de un modelo de difusion en latente continuo. Esta transicion supone una innovacion tecnica destacable dentro de la familia MOSS-TTS, ya que permite una generacion mas estable y de mayor fidelidad para efectos de sonido largos. Los datos de entrenamiento no se han publicado en la informacion disponible, por lo que se desconocen el numero de tokens, la composicion del dataset y si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de efectos de sonido ambientales: entornos naturales, escenas urbanas, criaturas y acciones humanas.
- Generacion de clips musicales cortos o percusivos.
- Control de duracion mediante una etiqueta de tiempo en el prompt, con salidas estables de hasta 30 segundos.
- Prompts bilingues en ingles y chino.
- Salida de audio de alta fidelidad a 48 kHz.
- No soporta tool calling, function calling ni razonamiento multi-paso, al tratarse de un modelo de generacion de audio.
- No genera voz ni dialogo; su ambito se limita a sonidos no verbales.

## Casos de uso

- Diseno de sonido para videojuegos: el modelo permite generar efectos de ambiente como lluvia, trafico o animales bajo demanda, escribiendo prompts en ingles y ajustando la duracion. Es adecuado porque produce audio largo y estable sin necesidad de librerias externas.
- Postproduccion audiovisual y cine: creacion de Foley (pasos, puertas, objetos) para escenas concretas. El modelo puede generar multiples variaciones de un mismo sonido con prompts ligeramente distintos, lo que agiliza el trabajo de montaje.
- Realidad virtual y simuladores: generacion de sonidos ambientales inmersivos para entornos virtuales. La capacidad de producir clips de hasta 30 segundos resulta util para bucles de fondo en experiencias prolongadas.
- Podcasts y radio: creacion de transiciones, rafagas y efectos personalizados para episodios. El modelo permite generar un efecto unico en segundos, sin depender de bancos de sonido genericos.
- Aplicaciones de accesibilidad: produccion de indicaciones sonoras para interfaces de usuario, como alertas o notificaciones. La generacion bajo demanda facilita la creacion de sonidos distintivos y reconocibles.
- Prototipado rapido en publicidad: produccion de jingles cortos o efectos para spots sin recurrir a grabaciones en estudio. El modelo ofrece una via rapida para iterar sobre ideas sonoras antes de la produccion final.
- Investigacion en sintesis de audio: uso del modelo como referencia para estudiar la generacion de efectos de sonido con DiT y Flow Matching, gracias a su arquitectura abierta y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al menos 12 GB para cargar el pipeline completo en bfloat16, segun el tamano de los pesos del DiT (1.416B parametros) y del text encoder Qwen3-1.7B. El repositorio ocupa 11.2 GB.
- GPU recomendadas: A100, H100 o RTX 4090. En GPUs de consumo, una RTX 4090 (24 GB) deberia ser suficiente, aunque no hay confirmacion oficial.
- Opciones de despliegue: Diffusers mediante el pipeline `MossSoundEffectPipeline`; tambien se incluye una demo Gradio en el repositorio de GitHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponible. La primera llamada puede tardar varios minutos debido a la compilacion con `torch.compile` y Triton CUDA Graph.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar con la version anterior del mismo modelo. No se han publicado comparativas con otros modelos de text-to-audio en la documentacion disponible.

| Modelo | Arquitectura | Parametros | Duracion | Idiomas | Licencia |
|---|---|---|---|---|---|
| MOSS-SoundEffect v2.0 | DiT + Flow Matching | 1.3B (DiT) | Hasta 30 s | EN, ZH | Apache 2.0 |
| MOSS-SoundEffect v1.0 | MossTTSDelay (autoregresivo de tokens discretos) | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponible, ya que no se han publicado datos sobre la composicion del dataset de entrenamiento.
- Riesgo de alucinacion: el modelo puede generar sonidos que no se corresponden exactamente con el prompt, especialmente con descripciones ambiguas o poco comunes.
- Limitaciones de idioma: solo admite prompts en ingles y chino; no se ha validado el rendimiento con otros idiomas.
- Limitaciones de duracion: la salida maxima es de 30 segundos por llamada, lo que puede ser insuficiente para ciertos usos de audio continuo.
- Rendimiento de inferencia: la primera ejecucion requiere compilacion con `torch.compile` y Triton CUDA Graph, lo que puede provocar errores y una latencia inicial alta. Se puede desactivar con la variable de entorno `TORCHDYNAMO_DISABLE=1`.
- Procedencia del repositorio: el modelo esta publicado bajo el usuario `niobures`, mientras que la documentacion oficial hace referencia a `OpenMOSS-Team`. Es posible que se trate de una copia o un fork no oficial; se recomienda verificar la autenticidad antes de usarlo en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero es necesario revisar los terminos del modelo base Qwen3-1.7B, que tambien se distribuye bajo Apache 2.0.

## Enlaces

- HuggingFace: https://huggingface.co/niobures/MOSS-SoundEffect-v2.0
- GitHub (documentacion y demo): https://github.com/OpenMOSS/MOSS-TTS/tree/main/moss_soundeffect_v2
