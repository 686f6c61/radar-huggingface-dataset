# mikaelaehunter/whisper-tiny_canadian_english

## Resumen

Whisper tiny canadian_english es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla openai/whisper-tiny, publicado por el usuario mikaelaehunter en HuggingFace. El modelo parte de la arquitectura encoder-decoder transformer de Whisper en su variante mas pequena, con 37.760.640 parametros totales, y se ha reentrenado sobre el dataset canadian_english para especializarse en transcripcion de ingles con acento canadiense.

El modelo resuelve la tarea de transcripcion de audio a texto (ASR) en un dominio linguistico concreto: el ingles hablado en Canada. Al derivar de whisper-tiny, hereda la ligereza y velocidad del modelo base, lo que lo hace apto para despliegues con recursos limitados, a cambio de una capacidad de generalizacion menor que las variantes medium o large de la familia Whisper.

Es relevante para desarrolladores que necesiten un modelo ASR pequeno, con licencia Apache 2.0 y compatible con el ecosistema transformers, y que trabajen con audio en ingles canadiense. Con solo 81 descargas y 0 likes, se trata de un modelo de nicho, probablemente experimental, sin documentacion adicional mas alla de la model card autogenerada por el Trainer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de openai/whisper-tiny, un transformer encoder-decoder disenado para ASR que procesa espectrogramas de audio y genera tokens de texto de forma autorregresiva. Whisper tiny es la variante mas pequena de la familia Whisper, con aproximadamente 39 millones de parametros, y esta pensada para inferencia rapida en hardware modesto.

El entrenamiento se realizo sobre el dataset canadian_english con los siguientes hiperparametros declarados en la model card: learning rate de 1e-05, batch size de entrenamiento de 2, batch size de evaluacion de 1, semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y un total de 2000 pasos de entrenamiento. No se especifica el numero de tokens de audio ni la composicion detallada del dataset. El modelo se entreno con Transformers 5.22.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion en ingles canadiense.
- Transcripcion de audio a texto compatible con el pipeline `automatic-speech-recognition` de transformers.
- Hereda del modelo base Whisper la capacidad de procesar audio de hasta 30 segundos por ventana.
- Soporte multilingue limitado: solo se declara el idioma ingles.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio generativo ni modo de razonamiento extendido.
- No se declara soporte de marcas de tiempo (timestamps) ni de traduccion, aunque el modelo base Whisper las soporta tecnicamente.

## Casos de uso

- Transcripcion de reuniones y llamadas en ingles canadiense: el modelo puede convertir audio de reuniones en texto para actas automaticas, aprovechando su bajo coste computacional para procesar lotes grandes en servidores modestos.
- Subtitulado de contenido audiovisual: integrable en pipelines de generacion de subtitulos para videos en ingles canadiense, con la ventaja de que whisper-tiny permite procesar audio en tiempo casi real en CPU.
- Asistentes de voz embebidos: por su tamano reducido (37,7 millones de parametros), puede desplegarse en dispositivos con recursos limitados para comandos de voz y dictado en ingles.
- Preprocesamiento de datos de audio para entrenamiento de otros modelos: util para transcribir corpus de audio canadiense antes de usarlos en tareas de NLP.
- Prototipado rapido de aplicaciones ASR: al ser compatible con transformers y tener licencia Apache 2.0, sirve como base para validar pipelines de transcripcion antes de invertir en modelos mayores.
- Investigacion sobre sesgos dialectales en ASR: permite comparar el rendimiento de un modelo afinado en ingles canadiense frente al modelo base Whisper tiny en distintas variedades del ingles.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| WER (Word Error Rate) | canadian_english | test | 7,7160 % |
| Loss (validacion) | canadian_english | evaluacion | 0,2539 |

Resultados de entrenamiento intermedios declarados:

| Training Loss | Epoch | Step | Validation Loss | WER |
|---|---|---|---|---|
| 0,0023 | 1,1111 | 1000 | 0,2462 | 7,7160 |
| 0,0040 | 2,2222 | 2000 | 0,2539 | 7,7160 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no son aplicables a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision fp32 para los 37,7 millones de parametros; en la practica, whisper-tiny puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en tarjetas consumer como RTX 3060, RTX 4090 o incluso en GPUs integradas.
- Cabe en cualquier GPU consumer, incluidas las de gama baja, y en CPU.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), y por herencia del modelo base, potencialmente compatible con whisper.cpp, faster-whisper y otros runtimes de Whisper, aunque no se documenta explicitamente.
- Latencia y throughput: no se han publicado mediciones especificas para este fine-tuning. Para whisper-tiny en general, la inferencia es del orden de decenas de veces mas rapida en tiempo real que en modelos large, pero no hay datos concretos en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | WER declarado |
|---|---|---|---|---|---|
| mikaelaehunter/whisper-tiny_canadian_english | 37,76 M | 30 s por ventana | en | apache-2.0 | 7,72 % (canadian_english test) |
| openai/whisper-tiny | ~39 M | 30 s por ventana | multilingue | apache-2.0 | no disponible en la informacion |
| openai/whisper-base | ~74 M | 30 s por ventana | multilingue | apache-2.0 | no disponible en la informacion |
| openai/whisper-small | ~244 M | 30 s por ventana | multilingue | apache-2.0 | no disponible en la informacion |

La comparativa de WER no es directa: el valor de 7,72 % corresponde al dataset especifico canadian_english y no es comparable con los resultados de los modelos base en benchmarks estandar como LibriSpeech. No se dispone de datos de rendimiento de los modelos alternativos en ese mismo dataset.

## Limitaciones y advertencias

- El WER de 7,72 % no esta verificado (`verified: false` en la model-index) y corresponde a un unico dataset; no hay evidencia de rendimiento en otros dominios o acentos.
- Especializado en ingles canadiense: el rendimiento puede degradarse en otras variedades del ingles o en audio con ruido, solapamiento de hablantes o terminologia tecnica.
- Al derivar de whisper-tiny, la capacidad de reconocimiento es limitada en comparacion con variantes mayores de Whisper; es probable que cometa mas errores en audio complejo.
- Riesgo de alucinacion: los modelos Whisper pueden generar texto plausible que no corresponde al audio, especialmente en silencios o segmentos ruidosos; no se documenta mitigacion alguna.
- La model card esta autogenerada y carece de secciones de usos previstos, limitaciones y datos de entrenamiento; no hay informacion sobre composicion del dataset, duracion del audio ni procedencia.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene validar el modelo en el dominio concreto de produccion antes de desplegarlo.
- Solo se declara soporte para ingles; no se garantiza comportamiento en otros idiomas.
- Modelo de nicho con muy poca adopcion (81 descargas, 0 likes); no hay comunidad ni issues documentados que permitan evaluar su robustez.

## Enlaces

- HuggingFace: https://huggingface.co/mikaelaehunter/whisper-tiny_canadian_english
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset declarado: canadian_english (no se proporciona enlace directo en la informacion disponible)
- Paper de Whisper (referencia del modelo base): no disponible en la informacion proporcionada
- Repositorio o demo adicional: no disponible en la informacion proporcionada
