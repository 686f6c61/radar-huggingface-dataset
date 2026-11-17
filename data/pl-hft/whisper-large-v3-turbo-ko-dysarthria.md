# PL-HFT/whisper-large-v3-turbo-ko-dysarthria

## Resumen

Whisper-large-v3-turbo-ko-dysarthria es un checkpoint ASR derivado de openai/whisper-large-v3-turbo, publicado por PL-HFT, especializado en reconocimiento de voz en coreano con enfasis en habla disartrica (trastornos motores del habla). El modelo se obtiene fusionando un adaptador LoRA entrenado sobre un corpus combinado de habla disartrica y habla tipica, y persiste como pesos completos en float16, sin necesidad de PEFT en tiempo de inferencia.

La motivacion declarada es evitar el sobreajuste de dominio: un ajuste fino solo con habla disartrica degrada gravemente el rendimiento con hablantes tipicos. El entrenamiento conjunto de una epoca sobre el corpus combinado (AI-Hub 013 disartria + AI-Hub 109 habla tipica) mejora simultaneamente ambos dominios y generaliza mejor en un test externo de conferencias en coreano.

Arquitectura transformer encoder-decoder de Whisper, con 808.878.080 parametros totales, audio de entrada a 16 kHz mono en segmentos de hasta 29.5 segundos y salida de transcripcion en coreano. Licencia MIT, formato safetensors y disponible para transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | 808.878.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | audio de entrada en segmentos de hasta 29.5 s (16 kHz mono); contexto de texto no disponible |
| Tipos de cuantizacion | pesos publicados en float16; otras cuantizaciones (int8, GGUF) no disponibles |
| Idiomas soportados | coreano (ko) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors, float16, 587 tensores, 1.617.824.864 bytes) |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-large-v3-turbo, un transformer encoder-decoder para ASR. Sobre esa base se entreno un adaptador LoRA con r=64, lora_alpha=128 y 232 modulos, que posteriormente se fusiono en los pesos base en float32 y se guardo en float16. El resultado es un checkpoint autonomo que no requiere cargar PEFT ni fusionar adaptadores en tiempo de ejecucion.

El entrenamiento se realizo durante una epoca sobre el corpus `combine`, que une dos conjuntos de datos coreanos verificados por calidad y preprocesados con `Speech-dataset-pipeline`: AI-Hub 013 (habla disartrica, 161.911 segmentos y 283,86 horas, aproximadamente el 40,66 % de los segmentos y el 44,20 % de la duracion) y AI-Hub 109 (habla tipica). El audio original y las transcripciones no se redistribuyen en el repositorio. La innovacion principal no es arquitectonica sino de estrategia de entrenamiento: el ajuste conjunto evita el olvido catastrofico en hablantes tipicos que provoca el ajuste fino solo con disartria, y ademas mejora la generalizacion en un conjunto externo de conferencias (AI-Hub 71627). No se documentan en la informacion disponible detalles sobre RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Reconocimiento automatico de voz (transcripcion) en coreano, con soporte nativo de habla disartrica y habla tipica.
- Transcripcion de audio de 16 kHz mono en segmentos de hasta 29.5 segundos.
- Inferencia mediante `transformers` con `pipeline("automatic-speech-recognition")` o con `WhisperForConditionalGeneration` directamente.
- Parametros de generacion configurables: `language="Korean"`, `task="transcribe"`, `temperature=0.0`, `condition_on_prev_tokens=False`.
- Capacidad de generalizacion a dominios externos no vistos durante el entrenamiento (por ejemplo, discurso de conferencias en coreano).
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio multimodal, thinking mode ni traduccion a otros idiomas.

## Casos de uso

- Subtitulado y transcripcion de terapia del habla: el modelo transcribe grabaciones de pacientes con disartria con una tasa de error declarada muy baja en el conjunto de test de disartria (CER 0.59 %, WER 1.83 %), lo que permite generar historiales de sesion y metricas de progreso de forma automatica.
- Accesibilidad y dictado asistido: integracion en aplicaciones de comunicacion aumentativa para personas con trastornos motores del habla, aprovechando que el modelo mantiene buen rendimiento tanto en habla disartrica como tipica.
- Transcripcion de reuniones y clases en coreano: el modelo cubre habla tipica con CER 1.53 % y WER 6.86 % en el test AI-Hub 109, adecuado para generar actas y resumenes a partir de audio de 16 kHz.
- Procesamiento de discurso de conferencias: aunque el rendimiento cae en el conjunto externo (CER 11.69 %, WER 28.80 %), sigue siendo util para indexacion y busqueda de contenido en grabaciones largas segmentadas en bloques de hasta 29.5 s.
- Investigacion en ASR clinico: el checkpoint fusionado sirve como linea base reproducible para comparar estrategias de ajuste fino (solo disartria frente a corpus combinado) y para estudiar el olvido catastrofico en modelos de voz.
- Pipelines de datos a gran escala: al ser un checkpoint autonomo en safetensors y sin dependencia de PEFT, se puede desplegar en servicios de transcripcion por lotes con `transformers` y aceleracion GPU, procesando segmentos de audio de forma paralela.
- Validacion de corpus y control de calidad: el modelo puede usarse para detectar transcripciones anomalas o segmentos mal etiquetados en conjuntos de datos coreanos antes de su publicacion.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Conjunto de test | Muestras (N) | CER (%) | WER (%) |
|---|---|---|---|
| Combinado disartria + habla tipica (AI-Hub 013 + 109) | 38.599 | 1.17 | 4.93 |
| Disartria (AI-Hub 013) | 15.495 | 0.59 | 1.83 |
| Habla tipica (AI-Hub 109) | 23.104 | 1.53 | 6.86 |
| Externo, conferencias en coreano (AI-Hub 71627) | 10.000 | 11.69 | 28.80 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 1,6 GB solo para pesos, mas memoria de activaciones y cache; en la practica se recomienda al menos 4-6 GB de VRAM para segmentos de hasta 29.5 s.
- En float32 la huella de pesos se duplica (unos 3,2 GB), por lo que se recomienda cargar en float16 en GPU o MPS.
- GPU recomendadas: cualquier GPU consumer moderna con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente; para despliegue en produccion se recomiendan A100, H100 o L4 por throughput y concurrencia.
- Cabe en GPU consumer: si, dado el tamano reducido del checkpoint (808,9 M de parametros).
- Opciones de despliegue: `transformers` con `pipeline` o `WhisperForConditionalGeneration` (soporte oficial documentado); vLLM, llama.cpp, Ollama y TGI no estan documentados en la informacion disponible para este checkpoint.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| PL-HFT/whisper-large-v3-turbo-ko-dysarthria | 808,9 M | segmentos de hasta 29.5 s | coreano | MIT | CER 0.59 % en disartria; CER 1.53 % en habla tipica |
| openai/whisper-large-v3-turbo (base) | 809 M | segmentos de hasta 30 s | multilingue | MIT | no disponible en esta ficha; el autor indica que el ajuste conjunto mejora ambos dominios frente a la base |
| PL-HFT/whisper-large-v3-turbo-ko-dysarthria-lora (adaptador) | 809 M + LoRA (r=64) | segmentos de hasta 29.5 s | coreano | MIT | no disponible; requiere PEFT en tiempo de inferencia |
| Modelos ASR coreanos especializados en disartria de otros autores | no disponible | no disponible | coreano | no disponible | no disponible |

La comparativa con alternativas de terceros no puede completarse con la informacion disponible; solo se documentan las relaciones con el modelo base y el adaptador LoRA del mismo autor.

## Limitaciones y advertencias

- Solo soporta coreano; no se documenta traduccion ni reconocimiento en otros idiomas.
- La entrada debe ser audio de 16 kHz mono y segmentos de hasta 29.5 segundos; no se documenta gestion de audio mas largo sin segmentacion previa.
- El rendimiento cae de forma notable en dominios externos: CER 11.69 % y WER 28.80 % en el test de conferencias, frente a menos del 2 % de CER en los conjuntos internos.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- Riesgo de alucinacion y de transcripciones incorrectas en audio con ruido, solapamiento de hablantes o acentos no representados en el corpus de entrenamiento; no se documentan evaluaciones especificas de robustez.
- Sesgos conocidos: no se documentan analisis de sesgo por edad, genero o gravedad de la disartria.
- Licencia MIT: permite uso comercial, pero el autor no redistribuye el audio ni las transcripciones originales, por lo que la reutilizacion de los datos de entrenamiento queda sujeta a las condiciones de AI-Hub.
- El checkpoint se publica en float16; no se ofrecen variantes cuantizadas oficiales, lo que puede limitar el despliegue en entornos con restricciones de memoria o sin soporte de coma flotante de 16 bits.
- No se documentan garantias de produccion, versionado semantico ni mantenimiento del repositorio (0 descargas y 0 likes en el momento de la consulta).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PL-HFT/whisper-large-v3-turbo-ko-dysarthria
- Adaptador LoRA de origen: https://huggingface.co/PL-HFT/whisper-large-v3-turbo-ko-dysarthria-lora
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Model card en coreano: https://huggingface.co/PL-HFT/whisper-large-v3-turbo-ko-dysarthria/blob/main/README.ko.md
- Paper de Whisper (Radford et al.): no disponible en la informacion proporcionada
- Repositorio o demo adicional: no disponible en la informacion proporcionada
