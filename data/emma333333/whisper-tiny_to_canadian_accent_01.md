# emma333333/whisper-tiny_to_canadian_accent_01

## Resumen

Whisper tiny Canadian es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, desarrollado por el usuario emma333333, orientado al reconocimiento automatico del habla (ASR) sobre acento ingles canadiense. El modelo parte de la arquitectura encoder-decoder transformer original de Whisper, publicada por OpenAI, y conserva su tamano reducido de aproximadamente 37,7 millones de parametros, lo que lo situa en la gama mas ligera de la familia Whisper.

El problema que aborda es la adaptacion de un modelo generico multilingue a una variante dialectal concreta, en este caso el ingles de Canada, mediante entrenamiento supervisado sobre un conjunto de datos etiquetado como canadian_english. El resultado declarado por el autor es un WER de 20,85 sobre el split de test de dicho conjunto, un valor que debe interpretarse con cautela dado que no esta verificado y que el modelo base es el mas pequeno de la familia.

Su relevancia es limitada y experimental: se trata de un modelo generado automaticamente con el Trainer de Hugging Face, sin documentacion adicional en la model card, con cero descargas y publicado bajo licencia Apache 2.0. Resulta util como punto de partida para experimentos de adaptacion dialectal de bajo coste o para tareas de transcripcion en entornos con recursos muy restringidos, pero no como solucion de produccion sin una evaluacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; al ser compatible con transformers y safetensors, admite cuantizacion a 8 y 4 bits mediante herramientas externas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper en su variante tiny: un encoder transformer que procesa espectrogramas log-Mel de audio y un decoder autorregresivo que genera tokens de texto. Con 37,7 millones de parametros, es la configuracion mas compacta de la familia y esta disenada para inferencia en entornos con pocos recursos. El modelo base openai/whisper-tiny fue entrenado originalmente por OpenAI sobre una gran cantidad de audio supervisado debilmente etiquetado y multilingue.

El ajuste fino se realizo sobre el dataset canadian_english con los siguientes hiperparametros declarados: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de calentamiento y 2000 pasos totales de entrenamiento (2 epocas). No se documenta el volumen de datos, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card indica explicitamente "More information needed" en las secciones de descripcion, usos previstos y datos de entrenamiento.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en ingles, con adaptacion declarada al acento canadiense.
- Generacion de transcripciones a partir de audio de hasta 30 segundos por ventana, con posibilidad de segmentacion para audio mas largo mediante pipelines externos.
- Soporte de timestamps a nivel de palabra o segmento segun la configuracion del pipeline de transformers (no confirmado en la model card).
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Capacidad multilingue limitada al ingles; el ajuste fino se realizo solo sobre datos en ingles canadiense.
- No incluye modo thinking, vision ni audio generativo.

## Casos de uso

- Transcripcion de reuniones y notas de voz en entornos con acento canadiense: el modelo puede procesar audio corto y generar texto en ingles, aunque su WER declarado del 20,85 % limita su uso a borradores que requieran revision humana.
- Prototipado rapido de pipelines ASR: al ocupar apenas 0,2 GB en el repositorio y 37,7 millones de parametros, es adecuado para validar integraciones con transformers antes de escalar a modelos mayores.
- Experimentos academicos de adaptacion dialectal: sirve como referencia de bajo coste para comparar estrategias de fine-tuning sobre variantes del ingles.
- Inferencia en dispositivos con recursos muy limitados (Raspberry Pi, moviles o CPUs): el tamano reducido permite ejecucion en CPU con latencias aceptables para audio corto.
- Generacion de subtitulos automaticos en ingles canadiense para videos de baja criticidad, con posterior correccion manual.
- Fine-tuning adicional sobre dominios especificos (por ejemplo, terminologia medica o legal canadiense) partiendo de este checkpoint como base.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper tiny Canadian | Canadian English (split test) | WER | 20,85 % |
| Whisper tiny Canadian | Canadian English (validacion, epoca 1) | WER | 21,48 % |
| Whisper tiny Canadian | Canadian English (validacion, epoca 2) | WER | 20,85 % |

Durante el entrenamiento se registraron los siguientes valores de perdida: training loss de 0,3021 en la epoca 1 y 0,1127 en la epoca 2; validation loss de 0,4230 y 0,4252 respectivamente. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 150 MB, mas el overhead del runtime y del buffer de audio.
- VRAM estimada en fp16: en torno a 75-80 MB; en cuantizacion de 8 bits, alrededor de 40 MB.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1050, RTX 2060, RTX 3060, RTX 4090, asi como en CPU y en dispositivos embebidos.
- GPU recomendadas para produccion: no requiere GPU dedicada; para alto throughput se puede usar T4, A10 o A100 con batching.
- Opciones de despliegue: transformers (pipeline de automatic-speech-recognition), vLLM no aplica (modelo ASR), llama.cpp no soporta Whisper tiny directamente en todas sus variantes, Ollama no esta orientado a ASR; alternativas habituales son faster-whisper, whisper.cpp y TGI con soporte de audio.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera inferencia en tiempo real o superior en CPU moderna para audio de 30 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Whisper tiny Canadian (este modelo) | 37,7 M | 30 s por ventana | 20,85 % (Canadian English, no verificado) | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 37,7 M | 30 s por ventana | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74 M | 30 s por ventana | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s por ventana | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada; los datos de WER de los modelos base de OpenAI no se incluyen en esta ficha para no inventar cifras.

## Limitaciones y advertencias

- El WER declarado del 20,85 % es elevado para uso en produccion y ademas no esta verificado por el hub.
- La model card esta generada automaticamente e indica "More information needed" en secciones clave como datos de entrenamiento, usos previstos y limitaciones.
- El modelo solo soporta ingles; no se ha evaluado su comportamiento en otros idiomas ni en otras variantes del ingles.
- Riesgo de alucinacion en transcripciones: los modelos Whisper pueden generar texto plausible en segmentos con silencio o ruido.
- Sesgos potenciales derivados del dataset canadian_english, cuya composicion, tamano y procedencia no se documentan.
- El ajuste fino con solo 2000 pasos y batch de 2 puede provocar sobreajuste al dataset especifico y perdida de generalidad frente al modelo base.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de openai/whisper-tiny conviene revisar los terminos del modelo original y de los datos de entrenamiento.
- No hay evidencia de evaluacion en dominios adicionales (audio telefonico, ruido de fondo, multiples hablantes).
- Cero descargas y cero likes en el momento de la consulta: no existe validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emma333333/whisper-tiny_to_canadian_accent_01
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio original de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
