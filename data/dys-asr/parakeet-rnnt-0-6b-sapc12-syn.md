# dys-asr/parakeet-rnnt-0.6b-sapc12-syn

## Resumen

El modelo `dys-asr/parakeet-rnnt-0.6b-sapc12-syn` es un sistema de reconocimiento automatico del habla (ASR) en ingles desarrollado por el usuario dys-asr y especializado en habla disartrica. Se construye mediante fine-tuning del checkpoint RNN-T `extraordinarylab/parakeet-unified-en-0.6b`, en formato Transformers, sobre las grabaciones de entrenamiento deduplicadas de los corpus SAPC1 y SAPC2 del Speech Accessibility Project, mas 103,1 horas de habla disartrica sintetica generada con clonacion de voz zero-shot.

Con 618.314.241 parametros (0,6B) y arquitectura FastConformer RNN-T, el modelo se distribuye bajo licencia CC BY 4.0 y esta orientado a la investigacion y evaluacion del reconocimiento de habla disartrica en ingles, incluido el escenario del SAP Challenge. En el conjunto de desarrollo retenido de SAPC2, con decodificacion greedy, alcanza un WER del 11,32 % y un CER del 7,16 %.

Su relevancia radica en cubrir un nicho poco atendido por los ASR genericos: el habla de personas con disartria (paralisis cerebral, sindrome de Down, ictus, ELA), donde los sistemas convencionales suelen degradarse de forma acusada. El modelo esta pensado tambien como inicializacion para tareas posteriores de adaptacion a hablante o dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer RNN-T (transducer) |
| Parametros totales | 618.314.241 (0,6B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | audio de hasta 45 s (duracion maxima de entrada usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye safetensors; no se declaran versiones GGUF, INT8 ni INT4) |
| Idiomas soportados | ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (libreria `transformers`, clase `ParakeetForRNNT`) |

## Arquitectura y entrenamiento

El modelo es un transducer RNN-T de 0,6B parametros con encoder FastConformer, tal y como declara el autor en la model card. El checkpoint inicial es `extraordinarylab/parakeet-unified-en-0.6b`, adaptado mediante fine-tuning supervisado (no se mencionan RLHF ni DPO; es entrenamiento ASR clasico). El entrenamiento usa 10 epocas, optimizador AdamW con learning rate maximo de 1e-4, scheduler tri-stage, precision bfloat16 y batch efectivo de 32 sobre 16 GPUs. Se aplican tecnicas de regularizacion y aumento de datos habituales en ASR: encoder layerdrop de 0,05, perturbacion de velocidad (factores 0,8 / 0,9 / 1,0 / 1,1 / 1,2), SpecAugment activado, duracion maxima de entrada de 45 segundos y semilla 42.

Los datos combinan habla real y sintetica. La parte real reune los splits de entrenamiento de SAPC1 y SAPC2, con deduplicacion de grabaciones reeditadas en SAPC2: 372.400 emisiones reales (832,6 horas) de 972 hablantes. La parte sintetica consta de 55.988 emisiones (103,1 horas) generadas con clonacion de voz zero-shot de Fun-CosyVoice3, emparejando cada texto objetivo con una grabacion de referencia SAP de 3-10 segundos de un hablante con la misma etiologia declarada; los hablantes de referencia se muestrearon de forma proporcional a la raiz cuadrada de su CER por hablante bajo un reconocedor estandar. Las horas sinteticas se repartieron aproximadamente en 50 % paralisis cerebral, 30 % sindrome de Down, 17 % ictus y 3 % ELA, con una mezcla de texto compuesta por 30 % transcripciones SAP existentes poco frecuentes en la etiologia objetivo, 50 % texto nuevo tipo SAP y 20 % texto dirigido a errores de reconocimiento comunes. El audio se genero de forma determinista por emision y se almaceno como PCM mono a 16 kHz. Tras el filtrado por duracion y longitud de etiqueta, se usaron 422.451 registros para el entrenamiento. El audio sintetico no se distribuye en el repositorio del modelo.

## Capacidades

- Reconocimiento automatico del habla en ingles, con adaptacion especifica a habla disartrica.
- Transcripcion de audio mono a 16 kHz, con soporte de entradas de hasta 45 segundos en el entrenamiento.
- Etiqueta `feature-extraction` en el repositorio, ademas de `automatic-speech-recognition`.
- Integracion nativa con la clase `ParakeetForRNNT` de `transformers` (version 5.15.1) y `AutoProcessor`.
- Decodificacion greedy a traves de `generate()`; el adaptador de inferencia de Codabench del autor usa una busqueda por haces RNN-T time-synchronous con tamano de haz 2 que no debe pasarse a `generate()` mediante `num_beams=2`.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni thinking mode. Es un modelo puramente ASR.
- No se declaran capacidades multilingues: solo ingles.

## Casos de uso

- Investigacion en ASR para habla disartrica: reproduccion y comparacion de resultados en el escenario del SAP Challenge, usando el WER/CER declarados sobre el split de desarrollo retenido de SAPC2 como referencia.
- Inicializacion para adaptacion a hablante o dominio: el autor indica explicitamente que el checkpoint puede servir como punto de partida para ajuste posterior con datos de un hablante, etiologia o condicion de grabacion concreta.
- Evaluacion comparativa de sistemas ASR en habla atipica: banco de pruebas para medir la degradacion de modelos genericos frente a modelos adaptados en hablantes con disartria.
- Transcripcion asistida en entornos de accesibilidad, siempre con revision humana y nunca como base unica para decisiones de acceso, clinicas, legales o de seguridad, tal y como advierte la model card.
- Etiquetado y preanotacion en pipelines de investigacion: generacion de transcripciones preliminares que luego se corrigen manualmente, util para acelerar la anotacion de corpus de habla disartrica.
- Prototipado de interfaces de voz para comunicacion aumentativa y alternativa (CAA), con la salvedad de que requiere supervision y no debe emplearse como unico fundamento de decisiones.
- Analisis de errores por etiologia: dado que el modelo distingue implicitamente condiciones como paralisis cerebral, sindrome de Down, ictus o ELA en sus datos de entrenamiento, puede emplearse para estudiar patrones de error por subgrupo, recordando que SAP no representa a todas las personas con disartria y que el habla sintetica puede arrastrar artefactos del TTS y de las grabaciones de referencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`model-index`), marcados como no verificados. Evaluacion con decodificacion greedy sobre el split de desarrollo retenido de SAPC2, con normalizacion de referencias e hipotesis mediante el normalizador de texto ingles del proyecto:

| Dataset | Split | Decodificacion | WER | CER |
|---|---|---|---|---|
| SAPC2 held-out development set | validation | greedy | 11,32 % | 7,16 % |

No se declaran resultados con busqueda por haces en esta model card: el autor indica que las cifras provienen del pipeline de evaluacion para seleccion de checkpoint y que no se reclama ningun resultado de beam search. No se han publicado en la informacion disponible otros benchmarks (MMLU, HumanEval, GSM8K, etc.), que no aplican a un modelo ASR.

## Requisitos de hardware

- Parametros: 618.314.241. Peso de los pesos en precision completa: aproximadamente 2,47 GB en fp32 y aproximadamente 1,24 GB en bfloat16 / fp16.
- VRAM estimada para inferencia: no disponible de forma oficial. Como estimacion orientativa, la inferencia en bfloat16 sobre audio de corta duracion deberia caber holgadamente en el rango de 2-4 GB de VRAM, teniendo en cuenta pesos mas activaciones del encoder para entradas cercanas al limite de 45 segundos; no se han publicado mediciones exactas.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamano, el modelo cabe en GPUs de consumo como RTX 3060 (6 GB o 12 GB), RTX 3070, RTX 4060, RTX 4070, RTX 4080 y RTX 4090, y en GPUs de datacenter como A100, H100 o L40S.
- Inferencia en CPU: no se documenta, pero al ser un modelo de 0,6B es viable en CPU, con mayor latencia que en GPU.
- Opciones de despliegue: la model card solo documenta el uso mediante `transformers` 5.15.1 con `AutoProcessor` y `ParakeetForRNNT`. No se declara soporte para vLLM, llama.cpp, Ollama, TGI ni otros motores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de resultados comparativos oficiales sobre SAPC2 para otros modelos en la informacion proporcionada. La tabla recoge caracteristicas estructurales de alternativas de la misma categoria (ASR en ingles), sin comparacion de WER/CER sobre el dominio disartrico:

| Modelo | Parametros | Contexto / entrada | Idioma | Licencia | Adaptado a disartria | Rendimiento en SAPC2 |
|---|---|---|---|---|---|---|
| dys-asr/parakeet-rnnt-0.6b-sapc12-syn | 618.314.241 (0,6B) | audio hasta 45 s | ingles | CC BY 4.0 | si (especializado) | WER 11,32 % / CER 7,16 % (greedy) |
| extraordinarylab/parakeet-unified-en-0.6b (modelo base) | 0,6B | no disponible | ingles | no disponible | no | no disponible |
| openai/whisper-medium | 769 M | audio de 30 s por ventana | multilingue | MIT | no | no disponible |
| openai/whisper-large-v3 | 1.550 M | audio de 30 s por ventana | multilingue | MIT | no | no disponible |
| nvidia/parakeet-tdt-0.6b-v2 | 0,6B | no disponible | ingles | CC BY 4.0 (familia Parakeet) | no | no disponible |

Los datos de parametros y licencias de los modelos comparados fuera del repositorio analizado deben verificarse en sus propias model cards; no forman parte de la informacion proporcionada en esta busqueda.

## Limitaciones y advertencias

- El modelo esta pensado para investigacion y evaluacion; no debe usarse como base unica para decisiones clinicas, legales, de seguridad critica o de acceso.
- El rendimiento varia segun el hablante, la etiologia, la gravedad de la disartria, las condiciones de grabacion y el tipo de consigna. Los datos de SAP no representan a todas las personas con disartria.
- Parte del entrenamiento usa habla sintetica generada por clonacion de voz con Fun-CosyVoice3, que puede reproducir artefactos o sesgos tanto de las grabaciones de referencia como del propio sistema TTS.
- Riesgo de omision, sustitucion o alucinacion de palabras, comportamiento habitual en sistemas ASR y explicitamente advertido por el autor.
- Sesgos potenciales: el muestreo de hablantes de referencia favorece voces con mayor CER sin concentrarse solo en los casos mas graves, y el reparto de horas sinteticas esta desbalanceado por etiologia (50 % paralisis cerebral, 30 % sindrome de Down, 17 % ictus, 3 % ELA), lo que puede traducirse en un rendimiento desigual entre subgrupos.
- Idioma: unicamente ingles. No hay soporte multilingue declarado.
- Restricciones de licencia: el modelo se publica bajo CC BY 4.0, siguiendo la familia NVIDIA Parakeet. Quien trabaje con los datos de origen debe cumplir ademas las condiciones de uso de los datasets SAP y las de Fun-CosyVoice3 para los componentes de sintesis.
- Requisito de consentimiento informado antes de procesar habla identificable.
- Limitacion de decodificacion: el camino `generate()` incorporado es greedy; no debe pasarse `num_beams=2`, ya que la gestion de cache de frame y decoder del RNN-T esta disenada para una unica ruta greedy. El autor usa una busqueda por haces separada en su adaptador de Codabench.
- El audio sintetico de entrenamiento no se distribuye en el repositorio, lo que dificulta reproducir exactamente el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dys-asr/parakeet-rnnt-0.6b-sapc12-syn
- Modelo base: https://huggingface.co/extraordinarylab/parakeet-unified-en-0.6b
- Dataset SAPC1: https://huggingface.co/datasets/dys-asr/sapc1
- Dataset SAPC2: https://huggingface.co/datasets/dys-asr/sapc2

Nota: los resultados de la busqueda web devueltos para esta consulta corresponden a paginas sobre trastornos "dys" en Francia (ffdys.com, Wikipedia, pharma-gdd.com, lesdys.fr) y no guardan relacion con el modelo ni con el reconocimiento automatico del habla, por lo que no se incluyen como enlaces relevantes.
