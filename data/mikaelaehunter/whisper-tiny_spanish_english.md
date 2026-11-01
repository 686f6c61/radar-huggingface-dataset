# mikaelaehunter/whisper-tiny_spanish_english

## Resumen

Whisper tiny spanish_english es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla (ASR) openai/whisper-tiny, publicado por el usuario mikaelaehunter en HuggingFace. El modelo parte de la arquitectura encoder-decoder transformer de Whisper en su variante "tiny", con 37,76 millones de parametros, y ha sido entrenado sobre un dataset propio denominado spanish_english, presumiblemente orientado a transcripcion bilingue espanol-ingles, aunque la model card solo declara el idioma ingles.

El modelo resuelve la tarea de transcripcion de audio a texto (automatic-speech-recognition) en un formato extremadamente ligero, lo que lo hace adecuado para entornos con recursos limitados, inferencia en CPU o despliegues en dispositivos de borde. Su relevancia radica en que permite experimentar con ASR bilingue sin requerir GPUs de gran capacidad, a costa de una precision notablemente inferior a la de los modelos Whisper de mayor tamano.

La informacion disponible es escasa: la model card fue generada automaticamente por el Trainer de HuggingFace y contiene numerosos apartados marcados como "More information needed". Los unicos datos verificables son los hiperparametros de entrenamiento, las metricas declaradas (WER de 12,41 % sobre el split de test del dataset spanish_english, no verificado) y las versiones de framework utilizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | en (declarado en la model card; el nombre del modelo sugiere espanol e ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con atencion estandar, disenado para procesar espectrogramas mel de audio de 30 segundos y generar transcripciones token a token. Whisper tiny es la variante mas pequena de la familia Whisper, con aproximadamente 39 millones de parametros en su version original; el ajuste fino conserva 37.760.640 parametros segun los pesos safetensors publicados.

El entrenamiento se realizo con el Trainer de HuggingFace sobre el dataset spanish_english (split de test para evaluacion), con los siguientes hiperparametros: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW (variante torch fused, betas 0,9/0,999, epsilon 1e-08), scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento. No se especifica el numero de tokens de audio, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en ASR). Las versiones de framework fueron Transformers 5.22.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto en ingles, con presumible soporte de espanol segun el nombre del modelo y el dataset de entrenamiento.
- Generacion de texto a partir de audio: el decoder de Whisper genera transcripciones autoregresivamente.
- Procesamiento de audio de hasta 30 segundos por ventana, con la posibilidad de encadenar ventanas para audios mas largos mediante pipelines de HuggingFace.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- Capacidades multilingues limitadas: la model card solo declara ingles; el soporte de espanol no esta verificado oficialmente.
- No dispone de modo thinking, vision ni audio de salida.

## Casos de uso

- Transcripcion de notas de voz en aplicaciones moviles: el modelo, con solo 37,76 M de parametros, puede ejecutarse en dispositivos de borde o en CPU, permitiendo transcribir audios cortos sin enviar datos a la nube.
- Subtitulado automatico de videos cortos en ingles: integrable en pipelines de procesamiento de medios donde el coste computacional es critico y la precision absoluta no es el requisito principal.
- Prototipado rapido de sistemas ASR bilingues espanol-ingles: util como linea base para experimentar con fine-tuning sobre datasets propios antes de escalar a modelos mayores.
- Comandos de voz en aplicaciones de escritorio: la baja latencia esperada en CPU permite reconocimiento de comandos cortos en tiempo casi real.
- Preprocesamiento de audio en pipelines de datos: transcripcion masiva de audios para generar datasets de texto en entornos con recursos limitados.
- Educacion y demos: modelo adecuado para ensenar conceptos de ASR y fine-tuning en cursos o talleres, dado su tamano reducido y su licencia permisiva.
- Sistemas de accesibilidad de bajo coste: transcripcion en vivo de conversaciones en ingles en hardware modesto.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model card (no verificados):

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| WER | spanish_english | test | 12,4129 % |
| Loss (validacion) | spanish_english | validacion | 0,2462 |

Evolucion durante el entrenamiento:

| Paso | Epoca | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 1000 | 0,9728 | 0,2612 | 0,2650 | 14,0050 % |
| 2000 | 1,9455 | 0,1395 | 0,2462 | 12,4129 % |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 (37,76 M de parametros, aproximadamente 150 MB de pesos); en FP16, alrededor de 75 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; tambien funciona en CPU sin problemas.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 2060, RTX 4090, etc.) e incluso en Raspberry Pi y dispositivos moviles.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), vLLM (soporte limitado para Whisper), llama.cpp (no aplicable directamente, pero existen conversiones a GGML para Whisper), Ollama (no soportado de forma nativa), TGI (soporte de Whisper limitado). La opcion mas directa es transformers con PyTorch.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera inferencia en tiempo real o superior en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | WER declarado |
|---|---|---|---|---|---|
| whisper-tiny_spanish_english (este modelo) | 37,76 M | 30 s por ventana | en (es presumible) | apache-2.0 | 12,41 % (dataset propio, no verificado) |
| openai/whisper-tiny | 39 M | 30 s por ventana | multilingue (99 idiomas) | apache-2.0 | no disponible en esta ficha |
| openai/whisper-base | 74 M | 30 s por ventana | multilingue (99 idiomas) | apache-2.0 | no disponible en esta ficha |
| openai/whisper-small | 244 M | 30 s por ventana | multilingue (99 idiomas) | apache-2.0 | no disponible en esta ficha |

La comparacion con los modelos originales de OpenAI es aproximada: este ajuste fino esta especializado en un dataset concreto (spanish_english) y su WER no es directamente comparable con los resultados de los modelos base en benchmarks estandar como LibriSpeech o Common Voice, que no se han publicado en la informacion disponible.

## Limitaciones y advertencias

- La model card esta generada automaticamente e incompleta: no describe usos previstos, limitaciones ni composicion del dataset de entrenamiento.
- El WER de 12,41 % esta declarado como no verificado y corresponde a un dataset propio (spanish_english) cuya naturaleza, tamano y calidad se desconocen.
- El soporte de espanol no esta confirmado oficialmente: la model card solo declara ingles, aunque el nombre del modelo y el dataset sugieren entrenamiento bilingue.
- Riesgo de alucinacion en la transcripcion: como todos los modelos Whisper, puede inventar texto en segmentos de silencio o ruido.
- Precision limitada por el tamano tiny: esperable un WER considerablemente mayor que en whisper-small o whisper-medium en condiciones reales.
- No apto para produccion en entornos donde se requiera alta precision ASR sin una evaluacion previa sobre datos propios.
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Solo 68 descargas y 0 likes en el momento de la ficha: modelo con muy poca validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/mikaelaehunter/whisper-tiny_spanish_english
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (Radford et al., 2022): no disponible en la informacion proporcionada
- Repositorio de transformers: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
