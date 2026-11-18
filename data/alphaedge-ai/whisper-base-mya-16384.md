# alphaedge-ai/whisper-base-mya-16384

## Resumen

whisper-base-mya-16384 es una variante podada (trimmed) de openai/whisper-base, el modelo de reconocimiento automatico del habla (ASR) de OpenAI publicado en 2022. Lo desarrolla el usuario alphaedge-ai y aplica la tecnica de trimming de vocabulario descrita por Loïck Bourdois y colaboradores en el blog de Hugging Face, especializando el modelo para el idioma birmano (codigo ISO `my`). El resultado reduce el vocabulario de 51.865 a 16.384 tokens (-68,41 %) y el numero de parametros de 72.593.920 a 54.427.648 (-25,02 %), manteniendo la arquitectura encoder-decoder transformer original.

El problema que resuelve es el sobredimensionamiento del vocabulario multilingue de Whisper cuando solo se necesita un idioma: los embeddings y la capa de salida dominan el peso del modelo base, por lo que recortar los tokens no utilizados reduce el footprint de memoria y el tamano del repositorio (0,1 GB) sin cambiar la arquitectura. Es relevante para despliegues en entornos con recursos limitados o para servir ASR de birmano con latencia y memoria menores que el modelo original.

La contrapartida es explicita en la model card: al eliminar tokens poco frecuentes en birmano, el modelo deja de ser util para otros idiomas y puede degradarse en dominios alejados del corpus usado para minar el vocabulario. La licencia es Apache 2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper base) |
| Parametros totales | 54.427.648 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (ventana de audio de 30 s, heredada de Whisper base; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos safetensors; admite las cuantizaciones estandar de transformers/bitsandbytes, no documentadas por el autor) |
| Idiomas soportados | birmano (`my`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper base: un encoder-decoder transformer con atencion completa, entrenado originalmente por OpenAI con supervision debil a gran escala sobre pares audio-transcripcion (paper arXiv:2212.04356). Este modelo no reentrena los pesos: parte de openai/whisper-base y aplica trimming, es decir, selecciona un subconjunto de 16.384 tokens del vocabulario original y recorta en consecuencia las matrices de embedding y la proyeccion de salida. El resto de capas conserva los pesos del modelo base.

La seleccion de tokens se hizo minando 200.000 textos del dataset lbourdois/fineweb-2-trimming para el birmano, de modo que el vocabulario retenido cubre los caracteres y subpalabras frecuentes en ese idioma. No se documenta en la model card ningun paso adicional de fine-tuning, RLHF ni DPO sobre el modelo podado, ni el numero de horas de audio empleadas. La innovacion tecnica es, por tanto, exclusivamente la reduccion de vocabulario, que disminuye el numero de parametros y el uso de memoria del modelo sin alterar el resto de la arquitectura.

## Capacidades

- Transcripcion de audio a texto en birmano (`task: transcribe`).
- Traduccion de audio a texto en ingles mediante la tarea `translate` de Whisper (heredada del modelo base; no verificada especificamente para este checkpoint podado).
- Procesamiento de audio a 16 kHz con ventana de 30 segundos por segmento, con la posibilidad de encadenar segmentos para audios mas largos mediante el pipeline de transformers.
- Integracion con `transformers` mediante `AutoModelForSpeechSeq2Seq`, `AutoProcessor` y `pipeline("automatic-speech-recognition")`.
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- No soporta vision, audio generativo ni modos de pensamiento.
- Capacidad multilingue muy limitada: el vocabulario recortado elimina los tokens de otros idiomas.

## Casos de uso

- Transcripcion de reuniones y entrevistas en birmano: el modelo convierte audio de 16 kHz en texto con un pipeline de transformers, adecuado para generar actas o subtitulos en entornos donde no se dispone de GPU de gran capacidad.
- Subtitulado automatico de contenido audiovisual en birmano: al pesar 0,1 GB y tener 54,4 M de parametros, puede ejecutarse en CPU o en GPUs de gama baja para procesar lotes de video sin infraestructura dedicada.
- Servicio de dictado o notas de voz en aplicaciones moviles o de escritorio: el footprint reducido permite empaquetar el modelo en un backend ligero (por ejemplo, un servicio FastAPI con transformers) y servir peticiones de un solo usuario con baja latencia.
- Archivado y busqueda de grabaciones: transcripcion por lotes de llamadas de atencion al cliente o archivos historicos en birmano para indexar el texto y habilitar busqueda semantica.
- Investigacion en ASR de bajos recursos: el checkpoint sirve como punto de partida o baseline para experimentos de trimming y evaluacion de vocabulario en birmano, comparandolo con el whisper-base original.
- Preprocesamiento de datos para entrenamiento de modelos de lenguaje: generar transcripciones de audio birmano que alimenten corpus de texto para fine-tuning o evaluacion.
- Prototipado rapido en entornos con restricciones de memoria: al reducir un 25 % los parametros respecto al base, encaja en contenedores con limites estrictos de RAM o en instancias CPU pequenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,22 GB solo para pesos (54,4 M de parametros x 4 bytes), mas activaciones y buffers de audio; en la practica, menos de 1 GB.
- VRAM estimada en fp16/bf16: aproximadamente 0,11 GB para pesos; el modelo completo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100); tambien es viable en CPU para cargas de un solo flujo.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: pipeline de `transformers`, `Text Generation Inference` (TGI) no aplica por ser ASR; `vLLM` no soporta Whisper de forma nativa en todas sus versiones; `llama.cpp`/`Ollama` no estan orientados a Whisper (existen ports comunitarios, no documentados para este checkpoint); `faster-whisper` y `whisper.cpp` requeririan conversion de pesos no publicada por el autor.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Contexto de audio |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-base-mya-16384 | 54.427.648 | 16.384 | birmano | Apache 2.0 | 30 s por segmento (heredado) |
| openai/whisper-base | 72.593.920 | 51.865 | multilingue (99 idiomas) | Apache 2.0 | 30 s por segmento |
| openai/whisper-small | 241.734.912 (dato no confirmado en la informacion disponible) | 51.865 | multilingue | Apache 2.0 | 30 s por segmento |
| openai/whisper-tiny | 37.759.488 (dato no confirmado en la informacion disponible) | 51.865 | multilingue | Apache 2.0 | 30 s por segmento |

La comparativa se limita a la familia Whisper porque no se dispone de datos de benchmarks ni de otros modelos ASR especificos de birmano en la informacion proporcionada.

## Limitaciones y advertencias

- El vocabulario recortado elimina tokens de otros idiomas: el modelo no es adecuado para transcripcion multilingue ni para audio con mezcla de idiomas.
- Puede degradarse en dominios alejados del corpus fineweb-2 usado para minar el vocabulario (por ejemplo, jerga tecnica, nombres propios o terminologia medica en birmano).
- Riesgo de alucinacion inherente a Whisper: en segmentos con silencio, ruido o audio de baja calidad puede generar texto inventado o repetir frases.
- No se han publicado evaluaciones (WER, benchmarks) que cuantifiquen la perdida de calidad frente a openai/whisper-base en birmano.
- La model card no documenta el proceso de fine-tuning ni la cantidad de audio birmano usada, por lo que la calidad real en produccion es incierta.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar la atribucion a OpenAI y a los autores del metodo de trimming.
- El tag `base_model:quantized` sugiere una relacion de cuantizacion/poda respecto al base; conviene verificar la equivalencia de pesos antes de usarlo como sustituto directo en pipelines existentes.
- No hay garantias de soporte a largo plazo: el repositorio tiene 54 descargas y 0 likes, lo que indica una adopcion muy baja y poca validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-mya-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
