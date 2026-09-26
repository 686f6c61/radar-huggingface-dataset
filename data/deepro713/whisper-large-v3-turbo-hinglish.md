# Deepro713/whisper-large-v3-turbo-hinglish

## Resumen

whisper-large-v3-turbo-hinglish es un ajuste fino del modelo openai/whisper-large-v3-turbo (809 M de parametros) especializado en reconocimiento automatico del habla (ASR) para hinglish, es decir, habla que alterna hindi e ingles dentro de la misma emision. Lo publica el usuario Deepro713 en HuggingFace y su objetivo es resolver un problema concreto: el modelo base de OpenAI obtiene un WER muy alto en este registro coloquial y code-switched, mientras que el ajuste fino reduce el error de forma drastica en el dominio evaluado.

Tecnicamente es un modelo Whisper estandar de tipo encoder-decoder, con la misma arquitectura que el base, y se distribuye ya fusionado: el adaptador LoRA empleado durante el entrenamiento se ha integrado en los pesos, por lo que se carga como cualquier checkpoint `WhisperForConditionalGeneration` sin necesidad de PEFT. El modelo entrenado ocupa 1,6 GB en safetensors (fp16) y mantiene la ventana de audio de 30 segundos por inferencia propia de la familia Whisper. La salida conserva el hindi en devanagari y deja los terminos ingleses en alfabeto latino.

Su relevancia es acotada pero clara: demuestra que un ajuste LoRA barato (r=16, 3 epocas sobre 1.602 clips) puede mejorar enormemente un caso de code-switching que los modelos generalistas no cubren bien, y sirve como punto de partida reproducible para quien investigue ASR en hinglish. La contrapartida es que el corpus y la evaluacion son muy pequenos, por lo que debe tratarse como un modelo de investigacion y no como un componente validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), variante turbo del base openai/whisper-large-v3-turbo |
| Parametros totales | 808.878.080 (aprox. 809 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana de audio de 30 s por inferencia (el autor recomienda clips <= 30 s); audio a 16 kHz mono |
| Tipos de cuantizacion | no disponible (el autor no documenta ninguna; parte de pesos fp16) |
| Idiomas soportados | hindi (hi) e ingles (en); orientado explicitamente a habla code-switched hinglish |
| Licencia | MIT para los pesos; el dataset de entrenamiento es CC BY 4.0 (requiere atribucion) |
| Formato de pesos | safetensors (repositorio de 1,6 GB, fp16); adaptador LoRA ya fusionado |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-large-v3-turbo, un transformer encoder-decoder con 809 M de parametros en el que el decodificador se reduce frente a whisper-large-v3 para abaratar la inferencia, manteniendo el encoder completo. La entrada es audio mono remuestreado a 16 kHz, con espectrograma mel y ventanas de 30 segundos. El ajuste no modifica la topologia: se aplico LoRA con r=16, alpha=32 y dropout=0,05 sobre las proyecciones de atencion `q_proj` y `v_proj`, y despues el adaptador se fusiono en los pesos base.

Los datos de entrenamiento proceden del dataset agarwalayushi/hinglish, del que se uso un subconjunto de 2.000 clips repartidos en 1.602 de entrenamiento, 200 de validacion y 201 de prueba. El preprocesado incluye remuestreo a 16 kHz mono, normalizacion de sonoridad, recorte de silencios y segmentacion en fragmentos de 30 segundos como maximo. El entrenamiento duro 3 epocas con batch size 1, learning rate 1e-4, precision bf16 y gradient checkpointing sobre una unica GPU NVIDIA GB10 (Grace-Blackwell) con memoria unificada y recursos limitados. No se documenta ninguna fase de RLHF ni DPO, ni innovaciones de decodificacion adicionales.

## Capacidades

- Transcripcion de voz a texto en hinglish, manteniendo el hindi en devanagari y los terminos ingleses en alfabeto latino.
- Reconocimiento de habla code-switched dentro de una misma frase, escenario en el que el modelo base falla con frecuencia.
- Transcripcion de audio en hindi e ingles de forma independiente, heredada del modelo base.
- Uso directo mediante `transformers` con el pipeline `automatic-speech-recognition` o con `WhisperForConditionalGeneration` y `WhisperProcessor`.
- Procesamiento de clips de hasta 30 segundos por inferencia, audio mono a 16 kHz.
- No dispone de tool calling, function calling, capacidades de agente, vision ni audio generativo: es exclusivamente un modelo ASR.
- No se documenta modo de razonamiento (thinking mode), ni soporte de marcas de tiempo verificadas, ni diarizacion de hablantes.

## Casos de uso

- Transcripcion de tutoriales tecnicos en hinglish: el corpus de entrenamiento es precisamente de estilo tutorial tecnico informal, por lo que el modelo encaja en la transcripcion de videos divulgativos donde se mezclan terminos tecnicos en ingles con explicaciones en hindi.
- Subtitulado automatico de contenido para YouTube o redes: al trabajar sobre clips de hasta 30 segundos y devolver texto mixto devanagari-latino, se puede integrar en un pipeline de segmentacion + transcripcion para generar subtitulos de videos cortos.
- Prototipado de asistentes de voz para usuarios indios: la capacidad de reconocer habla code-switched permite construir interfaces de voz que no obliguen al usuario a elegir un unico idioma.
- Analitica de conversaciones en centros de contacto: transcripcion de llamadas coloquiales con mezcla hindi-ingles para alimentar sistemas de clasificacion de motivos, analisis de sentimiento o control de calidad.
- Generacion de datasets de audio transcrito para entrenar otros modelos: sirve para etiquetar audio hinglish a gran escala antes de filtrar y corregir manualmente.
- Investigacion en code-switching ASR: como baseline reproducible y punto de comparacion frente a otros ajustes de Whisper o modelos multilingues en tareas de alternancia de codigo.
- Transcripcion de notas de voz en aplicaciones de mensajeria: el tamano de 809 M permite ejecutar la inferencia en local o en GPU de gama media, lo que facilita el procesamiento en el dispositivo o en servidores modestos.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor. El WER del `model-index` (0,306 sobre el dataset agarwalayushi/hinglish) y el de la tabla comparativa de la model card corresponden a la misma evaluacion: una muestra retenida de 40 clips de la particion de test, no vista durante el entrenamiento.

| Modelo | Dataset / muestra | Metrica | Valor |
|---|---|---|---|
| whisper-large-v3-turbo (base) | agarwalayushi/hinglish, 40 clips de test | WER | 1,224 |
| whisper-large-v3-turbo-hinglish | agarwalayushi/hinglish, 40 clips de test | WER | 0,306 |
| whisper-large-v3-turbo-hinglish | agarwalayushi/hinglish (model-index) | WER | 0,306 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no son aplicables a un modelo ASR.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 1,6 GB solo para los pesos, con un pico de 2,5 a 3 GB contando activaciones y buffers de decodificacion para clips de 30 segundos.
- VRAM estimada en fp32: alrededor de 3,2 GB solo para pesos.
- Cuantizacion int8: cerca de 0,9 GB de pesos, aunque el autor no publica artefactos cuantizados ni cifras verificadas.
- Cabe sin problema en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, e incluso en GPUs con 4-6 GB si se usa fp16 y batch 1.
- Tambien es viable en CPU para uso no interactivo, dado el tamano del modelo y la disponibilidad de runtimes optimizados.
- GPU de datacenter (A100, H100, L40S) no son necesarias para inferencia; el autor solo menciona una NVIDIA GB10 (Grace-Blackwell) para el entrenamiento.
- Opciones de despliegue: `transformers` con `pipeline` o carga directa; conversion a CTranslate2 para `faster-whisper`; conversion a GGUF para `whisper.cpp` o `llama.cpp`. Estas conversiones no estan validadas ni documentadas por el autor. El soporte de Whisper en vLLM y TGI es parcial y tampoco esta verificado para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | WER en hinglish (agarwalayushi/hinglish, 40 clips) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deepro713/whisper-large-v3-turbo-hinglish | 809 M | 30 s | 0,306 | MIT | HuggingFace, safetensors |
| openai/whisper-large-v3-turbo | 809 M | 30 s | 1,224 | MIT | HuggingFace, safetensors |
| openai/whisper-large-v3 | 1.550 M | 30 s | no disponible | Apache-2.0 | HuggingFace, safetensors |
| openai/whisper-small | 244 M | 30 s | no disponible | Apache-2.0 | HuggingFace, safetensors |

No se han identificado en la informacion proporcionada otros ajustes finos comparables especificamente para hinglish, por lo que la comparativa se limita a la familia Whisper.

## Limitaciones y advertencias

- Corpus de entrenamiento muy pequeno y de un unico dominio: 2.000 clips de hinglish coloquial con acento de Banaras y estilo tutorial tecnico. Es probable que no generalice a otros acentos, dominios o condiciones de grabacion.
- Evaluacion sobre solo 40 clips retenidos: el WER de 0,306 debe interpretarse como orientativo, no como un benchmark riguroso.
- El WER de 1,224 del modelo base en esta muestra no refleja la capacidad general de Whisper en hindi; es especifico de este registro code-switched y casual.
- Riesgo de alucinacion en audio fuera de distribucion, asi como en silencios o ruido, comportamiento heredado de Whisper.
- Hereda otras limitaciones de Whisper: repeticiones en la salida, deriva de marcas de tiempo y degradacion con audio de baja calidad o solapamiento de hablantes.
- El autor indica explicitamente que el modelo es apto para investigacion y experimentacion, y que no esta validado para usos de alto riesgo ni para produccion.
- Licencia MIT en los pesos, pero el dataset de entrenamiento es CC BY 4.0: si se redistribuye o se publican derivados, hay que mantener la atribucion a su autor.
- El repositorio no tiene descargas ni likes en el momento de la consulta: no existe validacion independiente por parte de la comunidad.
- No se documentan cuantizaciones oficiales, ni conversiones a GGUF o CTranslate2, ni pruebas de latencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Deepro713/whisper-large-v3-turbo-hinglish
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de entrenamiento: https://huggingface.co/datasets/agarwalayushi/hinglish
- Busqueda web: no se han identificado enlaces tecnicos relevantes (los resultados devueltos no guardan relacion con el modelo).
