# efficient-speech/Voxtral-Small-24B-2507-MLX-INT8

## Resumen

Voxtral-Small-24B-2507-MLX-INT8 es una cuantizacion INT8 en formato MLX del modelo Voxtral-Small-24B-2507 de Mistral AI, publicada por el colectivo efficient-speech. Voxtral es un modelo multimodal de audio y texto capaz de transcribir voz y responder preguntas sobre el contenido de un audio, combinando un encoder de audio con un modelo de lenguaje de gran tamano. Esta version concreta aplica cuantizacion de pesos de 8 bits en grupos de 64 al modelo de lenguaje, manteniendo el encoder de audio en BF16.

El modelo cuenta con 24.932.889.600 parametros (aproximadamente 24,9 mil millones) y esta pensado para ejecutarse sobre el framework MLX de Apple, lo que lo orienta a hardware Apple Silicon (chips M-series). Su publicacion acompana a Murmur, un sistema de inferencia para reconocimiento de voz de formato largo desarrollado por la Universidad de Washington (uw-syfi), y se probo con el runtime independiente `mlx-voxtral==0.0.6`.

Es relevante porque permite desplegar un modelo de audio-lenguaje de casi 25B parametros en equipos con memoria unificada de Apple, algo inviable con los pesos originales en BF16 (que ocuparian del orden del doble). La licencia Apache 2.0 facilita su uso comercial, aunque el modelo base y sus datos de entrenamiento originales deben consultarse en la model card de Mistral AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal audio-texto (encoder de audio + modelo de lenguaje transformer); pesos en MLX |
| Parametros totales | 24.932.889.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 affine por grupos de 64 en el modelo de lenguaje; encoder de audio en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

Voxtral-Small-24B-2507 combina un encoder de audio con un modelo de lenguaje de gran tamano, de modo que el audio se proyecta al espacio del modelo de lenguaje para tareas de transcripcion y respuesta a preguntas sobre audio. Esta version concreta no reentrena el modelo: efficient-speech convierte los pesos originales al formato MLX y aplica cuantizacion affine de 8 bits en grupos de 64 exclusivamente al modelo de lenguaje, dejando el encoder de audio en BF16. Los shards de pesos serializados coinciden byte a byte con el checkpoint MLX de referencia publicado por MarkusKaemmerer, lo que indica una conversion fiel.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en esta ficha; esos detalles corresponden al modelo base y deben consultarse en su model card. La innovacion practica de esta version es la reduccion de huella de memoria mediante cuantizacion INT8, junto con la integracion en el ecosistema MLX y en el sistema Murmur para reconocimiento de voz de formato largo.

## Capacidades

- Transcripcion de voz (automatic speech recognition) a partir de audio.
- Respuesta a preguntas sobre audio: acepta audio como entrada y responde en texto.
- Procesamiento de audio de formato largo (mencionado por el sistema Murmur que acompana la release).
- Ejecucion nativa en Apple Silicon mediante MLX.
- Capacidades de lenguaje heredadas del modelo base Voxtral-Small-24B-2507 (generacion de texto en el contexto del audio).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.
- Capacidades de vision o audio adicionales mas alla de ASR/QA sobre audio: no disponible.

## Casos de uso

- Transcripcion de reuniones y entrevistas: el modelo convierte audio en texto, y su soporte para formato largo (via Murmur) permite procesar grabaciones extensas sin segmentar manualmente en fragmentos cortos.
- Subtitulado y generacion de actas: a partir de una grabacion se obtiene la transcripcion y, con el componente de lenguaje, se pueden derivar resumenes o actas en el mismo pipeline.
- Preguntas sobre contenido de audio: en entornos de investigacion o analisis, se puede interrogar a un audio (por ejemplo, una ponencia) para extraer respuestas concretas sin releer la transcripcion completa.
- Prototipado local en Apple Silicon: desarrolladores con Mac equipados con chips M-series pueden ejecutar un modelo de ~25B parametros en INT8 para experimentar con ASR y QA de audio sin depender de GPUs dedicadas.
- Investigacion en reconocimiento de voz de formato largo: el modelo sirve como base para evaluar tecnicas de inferencia (Murmur) y comparar calidad frente a modelos ASR mas pequenos.
- Integracion en herramientas de accesibilidad: transcripcion de audio a texto para personas con discapacidad auditiva, ejecutandose en hardware local cuando la privacidad del audio es un requisito.
- Evaluacion de cuantizacion: util como referencia para medir la perdida de calidad de INT8 frente a BF16 en tareas de audio-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repo ocupa 27,2 GB, lo que da una idea del espacio en disco necesario para los pesos cuantizados.
- Al estar en formato MLX, requiere hardware Apple Silicon (chips M-series) con memoria unificada; no esta pensado para GPUs NVIDIA ni CUDA.
- VRAM/memoria unificada estimada: no disponible de forma oficial; el tamano del repo (27,2 GB) sugiere que se necesita al menos esa cantidad de memoria mas overhead del runtime, por lo que equipos con 32 GB o mas de memoria unificada son el objetivo razonable.
- GPU recomendadas: no aplica en el sentido tradicional; el hardware objetivo son Mac con M-series. No se dispone de datos de rendimiento en A100, H100 o RTX 4090 para este formato.
- Cabe en consumer hardware Apple (MacBook Pro, Mac Studio) con memoria suficiente; no se dispone de confirmacion oficial de modelos concretos.
- Opciones de despliegue: runtime `mlx-voxtral==0.0.6` (comando `mlx-voxtral.generate`) y el sistema Murmur. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Voxtral-Small-24B-2507-MLX-INT8 (este) | 24,9B | no disponible | MLX INT8 | apache-2.0 | Cuantizado para Apple Silicon |
| mistralai/Voxtral-Small-24B-2507 (base) | 24,9B | no disponible | safetensors (BF16) | apache-2.0 (segun tags) | Pesos originales, mayor huella de memoria |
| MarkusKaemmerer/Voxtral-Small-24B-2507-8bit-dense-encoder | no disponible | no disponible | MLX 8-bit | no disponible | Checkpoint MLX de referencia; los shards coinciden byte a byte |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada para establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- Solo funciona con el framework MLX y hardware Apple Silicon; no es portable a CUDA sin reconversion.
- La cuantizacion INT8 puede introducir degradacion de calidad frente a los pesos BF16 originales; no se han publicado evaluaciones que la cuantifiquen.
- No se dispone de informacion sobre sesgos, idiomas soportados ni tasas de alucinacion en esta ficha; deben consultarse en la model card del modelo base.
- El modelo puede alucinar en tareas de QA sobre audio, especialmente con audio ruidoso o de baja calidad.
- La licencia Apache 2.0 aplica a esta conversion, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales antes de uso comercial.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validacion por parte de la comunidad.
- No se especifican limites de longitud de audio ni de contexto; el rendimiento en audios muy largos depende del sistema de inferencia (Murmur) y no esta documentado aqui.

## Enlaces

- Hugging Face: https://huggingface.co/efficient-speech/Voxtral-Small-24B-2507-MLX-INT8
- Modelo base: https://huggingface.co/mistralai/Voxtral-Small-24B-2507
- Checkpoint MLX de referencia: https://huggingface.co/MarkusKaemmerer/Voxtral-Small-24B-2507-8bit-dense-encoder
- Sistema Murmur: https://github.com/uw-syfi/Murmur
