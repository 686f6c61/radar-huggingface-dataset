# flyingfishinwater/Qwen3-TTS-12Hz-0.6B-CustomVoice

## Resumen

Qwen3-TTS-12Hz-0.6B-CustomVoice es un modelo de sintesis de voz (text-to-speech) multimodal desarrollado por el equipo Qwen y distribuido en Hugging Face bajo el espacio `flyingfishinwater`. Forma parte de la familia Qwen3-TTS, una serie de modelos TTS multilingues, controlables, robustos y orientados a generacion en streaming. Esta variante concreta, `CustomVoice`, emplea el tokenizador de audio de 12 Hz y ofrece nueve timbres predefinidos con control de estilo en lenguaje natural.

El modelo resuelve el problema de la sintesis de voz expresiva y controlable en diez idiomas (chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano) sin necesidad de reentrenamiento por voz. La innovacion principal reside en la posibilidad de modular tono, ritmo y carga emocional mediante instrucciones textuales (por ejemplo, "habla con un tono enfadado"), lo que reduce la necesidad de disponer de multiples checkpoints por estilo.

Los metadatos de safetensors indican 905.788.672 parametros (aproximadamente 0,9 B), aunque el nombre comercial del checkpoint lo etiqueta como 0,6B. El repositorio ocupa 2,5 GB y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial. La latencia de sintesis extremo a extremo declarada por el autor es de tan solo 97 ms, un dato relevante para aplicaciones conversacionales en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; modelo text-to-speech de la familia Qwen3 con tokenizador de audio de 12 Hz |
| Parametros totales | 905.788.672 (segun metadatos de safetensors; el nombre del checkpoint indica 0,6B) |
| Parametros activos | No aplica (no hay evidencia de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors; el ejemplo oficial carga en bfloat16) |
| Idiomas soportados | Chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol, italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Tokenizador de audio | Qwen3-TTS-Tokenizer-12Hz |
| Voces predefinidas | 9 (Vivian, Serena, Uncle_Fu, Dylan, Eric, Ryan, Aiden, Ono_Anna, Sohee) |
| Tamano del repositorio | 2,5 GB |
| Pipeline declarado | text-to-speech |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un sistema TTS de la familia Qwen3 apoyado en el tokenizador de audio Qwen3-TTS-Tokenizer-12Hz, que opera a una frecuencia de 12 Hz. El checkpoint `CustomVoice` incorpora un mecanismo de control por instrucciones en lenguaje natural que ajusta tono, ritmo y expresion emocional de la voz seleccionada. No se detallan en la documentacion proporcionada el numero de capas, el tipo exacto de backbone (transformer denso u otra variante), ni el mecanismo de atencion empleado, mas alla de la recomendacion de usar `flash_attention_2` en la carga del modelo.

Tampoco se especifican el volumen de tokens de audio utilizados en el entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineamiento como RLHF o DPO. La model card unicamente menciona que la serie Qwen3-TTS ha sido disenada para ser multilingue, controlable y robusta, y que la variante de 12 Hz esta optimizada para generacion en streaming con baja latencia (97 ms extremo a extremo declarados). El informe tecnico asociado (arXiv 2601.15621) es la referencia indicada para obtener detalles adicionales de arquitectura y entrenamiento.

## Capacidades

- Sintesis de voz multilingue en diez idiomas: chino, ingles, japones, coreano, aleman, frances, ruso, portugues, espanol e italiano.
- Control de estilo mediante instrucciones en lenguaje natural, incluyendo tono, ritmo y expresion emocional.
- Seleccion de voz entre nueve timbres predefinidos, cada uno con un idioma nativo recomendado para obtener los mejores resultados.
- Generacion en streaming optimizada para baja latencia, con 97 ms de latencia extremo a extremo declarada.
- Salida de audio en formato de onda acompañada de su frecuencia de muestreo, lista para guardar con `soundfile`.
- Integracion mediante el paquete Python `qwen-tts` y la clase `Qwen3TTSModel`.
- Soporte de carga en GPU con `device_map`, `dtype=torch.bfloat16` y `attn_implementation="flash_attention_2"`.
- No se documenta soporte de tool calling, function calling, agentes ni vision en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede generar respuestas habladas naturales en diez idiomas y ajustar el tono segun el contexto de la conversacion, lo que resulta adecuado para sistemas de IVR y asistentes telefonicos multilingues.
- Audiolibros y narracion: gracias a los nueve timbres predefinidos y al control de estilo por instrucciones, es posible asignar voces distintas a personajes y modular la emocion de la narracion sin reentrenar el modelo.
- Accesibilidad y lectores de pantalla: la baja latencia declarada (97 ms) y el soporte de streaming permiten convertir texto en voz practicamente en tiempo real para personas con discapacidad visual.
- Doblaje y localizacion de contenido: al cubrir diez idiomas, el mismo modelo puede generar pistas de voz en distintos mercados manteniendo un estilo de locucion coherente.
- Asistentes conversacionales por voz: la generacion en streaming permite iniciar la reproduccion antes de completar la sintesis, reduciendo la sensacion de espera en dialogos multi-turno.
- Generacion de locuciones para videojuegos y prototipos: el control emocional por instrucciones facilita producir variantes de una misma linea (enfadado, alegre, neutro) de forma rapida durante el desarrollo.
- Produccion de contenido para redes y marketing: permite crear versiones de un mismo mensaje en varios idiomas con una voz consistente, sin contratar locutores por mercado.
- Investigacion en sintesis de voz: al estar bajo Apache 2.0 y publicarse con informe tecnico, sirve como base para experimentos de control prosodico y evaluacion multilingue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara una latencia de sintesis extremo a extremo de 97 ms y la recomendacion de emplear el idioma nativo de cada voz para obtener los mejores resultados. No se aportan cifras de WER, MOS, similitud de hablante ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 1,8 GB (905,7 M de parametros), a lo que hay que sumar el tokenizador de audio, los estados de atencion y el buffer de generacion; una estimacion razonable es de 4 a 6 GB de VRAM en bfloat16, aunque no se dispone de cifras oficiales.
- GPU recomendadas: no se especifican en la documentacion. El ejemplo oficial usa `cuda:0` con FlashAttention 2, por lo que se requiere una GPU NVIDIA compatible (Ampere o superior para `flash_attention_2`).
- Cabe en GPU de consumo: por el tamano de parametros, es previsible que quepa en GPUs de consumo con 6 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060 Ti, RTX 4070, RTX 4090), si bien no hay confirmacion oficial.
- Opciones de despliegue: el paquete oficial es `qwen-tts` (`pip install -U qwen-tts`), con integracion directa en Python mediante `Qwen3TTSModel.from_pretrained`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: se declara una latencia de sintesis extremo a extremo de hasta 97 ms gracias al tokenizador de 12 Hz y a la generacion en streaming. No se aportan datos de throughput (caracteres o segundos de audio por segundo de computo).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-0.6B-CustomVoice | 905,8 M (segun safetensors) | No disponible | 10 | Apache 2.0 | No disponible (97 ms de latencia declarada) |
| CosyVoice 2 (Alternativa de la misma categoria) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion proporcionada | No disponible |
| XTTS-v2 (Alternativa de la misma categoria) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion proporcionada | No disponible |
| Fish Speech (Alternativa de la misma categoria) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion proporcionada | No disponible |

La informacion proporcionada no incluye especificaciones ni resultados de benchmarks de otros sistemas TTS, por lo que no es posible establecer una comparacion cuantitativa fiable. Se recomienda consultar el informe tecnico (arXiv 2601.15621) para obtener datos comparativos oficiales.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo en la informacion disponible, si bien cualquier sistema TTS multilingue puede reflejar sesgos de los datos de entrenamiento en prosodia, acento y representacion de voces.
- Riesgo de alucinacion acustica: como en todo modelo generativo de audio, existe la posibilidad de producir artefactos, pronunciaciones incorrectas o ruidos no presentes en el texto de entrada, especialmente en idiomas distintos del nativo de la voz seleccionada.
- El autor recomienda utilizar el idioma nativo de cada voz para obtener los mejores resultados; usar una voz china para texto en italiano puede degradar la naturalidad.
- No se especifica la longitud maxima de contexto ni de texto de entrada, lo que limita la planificacion de inferencias con parrafos muy largos.
- Aunque la licencia Apache 2.0 permite uso comercial, el repositorio concreto esta publicado por un tercero (`flyingfishinwater`) y no por la organizacion oficial Qwen; se recomienda verificar la procedencia de los pesos antes de desplegarlos en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que reduce la trazabilidad de la validacion por parte de la comunidad.
- El checkpoint carece de datos publicados sobre evaluacion objetiva (MOS, WER) en esta ficha, lo que dificulta estimar su calidad frente a alternativas.
- No se documentan requisitos exactos de VRAM ni rendimiento en hardware concreto, por lo que las estimaciones de despliegue deben validarse en el entorno objetivo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/flyingfishinwater/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Checkpoint de referencia citado en el ejemplo de uso: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice
- Repositorio GitHub de Qwen3-TTS: https://github.com/QwenLM/Qwen3-TTS
- Informe tecnico (arXiv 2601.15621): https://huggingface.co/papers/2601.15621
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Qwen/Qwen3-TTS
- Documentacion del paquete `qwen-tts`: no disponible
- Los resultados de la busqueda web proporcionada no contienen enlaces relevantes sobre este modelo.
