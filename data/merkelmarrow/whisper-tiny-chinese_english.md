# merkelmarrow/whisper-tiny-chinese_english

## Resumen

Whisper tiny Chinese English es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario merkelmarrow en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura encoder-decoder transformer de Whisper, en su variante mas pequena, con 37,76 millones de parametros. El modelo ha sido entrenado sobre el dataset naharte/chinese_english, presumiblemente con contenido bilingue chino-ingles, aunque la model card no detalla la composicion exacta del corpus.

El modelo resuelve la tarea de transcripcion de audio a texto y esta pensado como un experimento de ajuste fino sobre una base ya existente. Su relevancia es limitada: se trata de un modelo generado automaticamente con la plantilla de Hugging Face Trainer, sin documentacion adicional sobre usos previstos, limitaciones o composicion de datos. El autor no ha publicado informacion sobre el proceso de curacion del dataset ni sobre evaluaciones externas.

Con 0 descargas y 0 likes en el momento de la consulta, y un WER declarado del 15,6% sobre el split de test del dataset de entrenamiento (no verificado), debe considerarse un modelo experimental mas que una opcion de produccion. Su interes principal es como ejemplo de fine-tuning de Whisper tiny para dominios bilingues especificos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (declarado en la model card); el dataset sugiere chino e ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-tiny, un transformer encoder-decoder disenado para ASR que procesa espectrogramas Mel de audio en ventanas de 30 segundos y genera tokens de texto de forma autoregresiva. Whisper tiny es la variante mas pequena de la familia Whisper, con aproximadamente 39 millones de parametros en su configuracion original; el checkpoint publicado reporta 37.760.640 parametros en safetensors.

El ajuste fino se realizo con el Trainer de Hugging Face sobre el dataset naharte/chinese_english. Los hiperparametros documentados son: learning rate 3,75e-05, batch de entrenamiento de 32, batch de evaluacion de 64, optimizador AdamW con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal con 50 pasos de warmup y 1000 pasos totales de entrenamiento (aproximadamente 20,4 epocas). No se documenta el numero de tokens de audio utilizados, la composicion del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en un modelo ASR). No se mencionan innovaciones tecnicas adicionales mas alla del fine-tuning estandar.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en ingles y, segun el nombre del modelo y el dataset, posiblemente tambien en chino.
- Generacion de transcripciones para audio de hasta 30 segundos por ventana, con la posibilidad de procesar audio mas largo mediante segmentacion.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingues limitadas: la model card solo declara el ingles, aunque el nombre del modelo sugiere entrenamiento bilingue chino-ingles.
- No dispone de modo thinking, vision ni audio mas alla de la entrada ASR estandar.
- Capacidad de traduccion de voz a texto (speech translation) heredada de Whisper, no verificada en este checkpoint.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles: el modelo puede convertir grabaciones cortas en texto, adecuado para prototipos y pruebas de concepto donde el coste computacional es critico.
- Subtitulado automatico de videos cortos: con 37,7 millones de parametros, puede ejecutarse en CPU o GPU de gama baja para generar subtitulos en ingles de clips de hasta 30 segundos.
- Experimentacion academica con fine-tuning de ASR: sirve como punto de partida para investigar el ajuste de Whisper tiny en dominios bilingues chino-ingles.
- Procesamiento por lotes de audio en entornos con recursos limitados: su tamano reducido permite desplegarlo en dispositivos edge o contenedores sin GPU dedicada.
- Evaluacion comparativa de tecnicas de ajuste fino: util como baseline para medir el impacto de distintas estrategias de entrenamiento sobre Whisper tiny.
- Transcripcion de comandos de voz en aplicaciones de escritorio: integrable mediante la libreria transformers para dictado en ingles en herramientas ofimaticas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| naharte/chinese_english | test | WER | 15,5997 |
| naharte/chinese_english | validation | Loss | 0,4022 |

Evolucion durante el entrenamiento (seleccion de checkpoints):

| Paso | Epoca | Validation loss | WER |
|---|---|---|---|
| 100 | 2,04 | 0,3217 | 13,9793 |
| 200 | 4,08 | 0,3430 | 14,4559 |
| 300 | 6,12 | 0,3745 | 14,9007 |
| 400 | 8,16 | 0,3866 | 18,4432 |
| 500 | 10,20 | 0,3872 | 15,2820 |
| 600 | 12,24 | 0,3879 | 15,3932 |
| 700 | 14,29 | 0,4032 | 15,7427 |
| 800 | 16,33 | 0,4051 | 19,3010 |
| 900 | 18,37 | 0,4010 | 19,4281 |
| 1000 | 20,41 | 0,4022 | 15,5997 |

No se han publicado resultados en benchmarks estandar (LibriSpeech, Common Voice, FLEURS, etc.) en la informacion disponible. Los datos muestran sobreajuste a partir del paso 300: la validation loss aumenta de forma monotona mientras la training loss cae hasta 0,0049.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (fp32), aproximadamente 150-200 MB en fp16. El repositorio ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en una GTX 1650, RTX 3060, RTX 4090 o incluso en GPUs integradas.
- Cabe en cualquier GPU consumer y puede ejecutarse en CPU con latencia aceptable para audio corto.
- Opciones de despliegue: transformers (libreria nativa), vLLM (soporte ASR limitado), llama.cpp (no aplica directamente a Whisper en este formato), faster-whisper (requiere conversion a CTranslate2), Whisper.cpp (requiere conversion a GGML).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | WER declarado |
|---|---|---|---|---|---|
| whisper-tiny-chinese_english | 37,76 M | 30 s por ventana | en (posible zh) | apache-2.0 | 15,60 (dataset propio) |
| openai/whisper-tiny | ~39 M | 30 s por ventana | multilingue (99 idiomas) | apache-2.0 | no disponible aqui |
| openai/whisper-base | ~74 M | 30 s por ventana | multilingue (99 idiomas) | apache-2.0 | no disponible aqui |
| openai/whisper-small | ~244 M | 30 s por ventana | multilingue (99 idiomas) | apache-2.0 | no disponible aqui |

La comparacion directa con whisper-tiny original no es posible con los datos disponibles, ya que no se han publicado resultados de este checkpoint en benchmarks estandar. El WER de 15,6% corresponde a un dataset propio y no es comparable con cifras publicadas sobre LibriSpeech u otros corpus de referencia.

## Limitaciones y advertencias

- Model card generada automaticamente: no incluye secciones de usos previstos, limitaciones ni composicion del dataset, lo que impide evaluar sesgos y cobertura.
- Sobreajuste evidente: la validation loss aumenta desde el paso 300 y el WER fluctua entre 13,98% y 19,43%, lo que sugiere que el checkpoint final no es el optimo.
- WER de 15,6% no verificado y medido sobre el mismo dataset de entrenamiento, no sobre un benchmark independiente.
- El modelo solo declara soporte de ingles en la model card, pese a que el nombre sugiere entrenamiento bilingue chino-ingles; el rendimiento real en chino no esta documentado.
- Riesgo de alucinacion en ASR: como todos los modelos Whisper, puede generar texto plausible que no corresponde al audio, especialmente en silencios o ruido.
- Licencia apache-2.0 permite uso comercial, pero el modelo base whisper-tiny tambien es apache-2.0, por lo que no hay restricciones adicionales conocidas.
- Sin descargas ni validacion comunitaria: no hay evidencia de uso en produccion ni reportes de terceros.
- No apto para produccion sin evaluacion previa en el dominio objetivo: la falta de documentacion y el sobreajuste observado desaconsejan su uso directo en sistemas criticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/merkelmarrow/whisper-tiny-chinese_english
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/naharte/chinese_english
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
