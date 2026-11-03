# merkelmarrow/whisper-tiny-chinese_english-ft1

## Resumen

Whisper tiny Chinese English es un ajuste fino (fine-tuning) del modelo `openai/whisper-tiny` realizado por el usuario `merkelmarrow` sobre el dataset `naharte/chinese_english`. Se trata de un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura encoder-decoder transformer de Whisper, en su variante mas pequena, con 37.760.640 parametros totales (aproximadamente 38 millones). El modelo parte de los pesos preentrenados de OpenAI y ha sido reentrenado durante 2000 pasos para adaptarse al dominio especifico del corpus bilingue chino-ingles.

El modelo resuelve la tarea de transcripcion de audio a texto, con un enfoque particular en contenido que mezcla chino e ingles. Es relevante porque los modelos Whisper originales estan optimizados para multitud de idiomas, pero un ajuste fino sobre un dataset bilingue concreto puede mejorar el rendimiento en ese dominio especifico. Sin embargo, se trata de un modelo experimental con muy poca validacion externa: cero descargas, cero likes y una model card generada automaticamente que no documenta el dataset ni los casos de uso previstos.

La arquitectura es la de Whisper tiny: un transformer encoder-decoder con 4 capas de encoder y 4 de decoder, dimensión de modelo 384 y 6 cabezas de atencion. El contexto de audio es de 30 segundos por ventana, procesado como espectrograma mel de 80 canales. La licencia es Apache 2.0, lo que permite uso comercial, pero la falta de documentacion y de validacion independiente hace recomendable tratarlo con cautela en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (contexto de audio estandar de Whisper); contexto de texto: 448 tokens |
| Tipos de cuantizacion | No disponible (el autor no documenta cuantizaciones; al ser compatible con transformers se puede cuantizar a int8/fp16, pero no hay artefactos publicados) |
| Idiomas soportados | Ingles (declarado en la model card); el dataset de entrenamiento es chino-ingles, pero la metadata solo lista `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper en su variante tiny: un encoder transformer que procesa espectrogramas mel de 80 canales extraidos de ventanas de audio de 30 segundos, y un decoder transformer autorregresivo que genera tokens de texto. La variante tiny cuenta con 4 capas en encoder y 4 en decoder, dimensión de modelo 384, 6 cabezas de atencion y un vocabulario multilingue de 51.865 tokens. El total de parametros es de 37.760.640, coherente con la variante tiny de Whisper.

El entrenamiento se realizo mediante fine-tuning supervisado sobre el dataset `naharte/chinese_english`, con los siguientes hiperparametros declarados: learning rate de 1e-05, batch size de entrenamiento de 2, batch size de evaluacion de 64, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 2000 pasos totales de entrenamiento, semilla 42. No se documenta el numero de tokens de audio ni la composicion exacta del dataset. No se menciona uso de RLHF, DPO ni ninguna innovacion tecnica adicional. El entrenamiento se realizo con Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Transcripcion de audio a texto (ASR) en dominios bilingues chino-ingles, segun el dataset de entrenamiento.
- Generacion de transcripciones con puntuacion y mayusculas segun el formato aprendido en el corpus.
- Capacidad multilingue limitada: el modelo base Whisper tiny soporta multiples idiomas, pero este fine-tuning esta orientado al par chino-ingles y la model card solo declara ingles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio mas alla del propio ASR.
- No se documentan capacidades de traduccion explicita, aunque el modelo base Whisper las soporta y podrian haberse preservado parcialmente.

## Casos de uso

- Transcripcion de reuniones bilingues chino-ingles: el modelo puede procesar ventanas de 30 segundos de audio y generar transcripciones en un contexto donde se alternan ambos idiomas, aprovechando el fine-tuning sobre el corpus bilingue.
- Subtitulado automatico de contenido audiovisual: integrable en pipelines de generacion de subtitulos para videos donde los hablantes mezclan chino e ingles, con la ventaja de un modelo de solo 38 millones de parametros que se ejecuta en CPU.
- Prototipado rapido de ASR en entornos con recursos limitados: al ser un modelo tiny, cabe en dispositivos edge y permite iterar rapidamente en aplicaciones de voz sin necesidad de GPU dedicada.
- Preprocesamiento de datos de voz para entrenamiento de otros modelos: transcripcion de corpus de audio chino-ingles para generar pares audio-texto en pipelines de data labeling.
- Investigacion academica sobre fine-tuning de ASR: util como punto de partida y referencia para estudiar el efecto del fine-tuning sobre dominios bilingues con modelos pequenos.
- Aplicaciones de dictado en movil o embedded: el tamano reducido (0.2 GB en el repositorio) permite desplegar el modelo en dispositivos con memoria limitada para dictado bilingue.
- Pruebas de concepto de asistentes de voz: integrable en prototipos de asistentes que requieran transcripcion en tiempo casi real con latencia baja gracias al reducido numero de parametros.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| WER | naharte/chinese_english | test | 15,0119 % |
| Loss (validacion) | naharte/chinese_english | validacion | 0,3137 |

Evolucion durante el entrenamiento segun la model card:

| Epoch | Step | Validation loss | WER |
|---|---|---|---|
| 1,2837 | 1000 | 0,3222 | 17,4901 % |
| 2,5674 | 2000 | 0,3137 | 15,0119 % |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. El WER de 15,01 % corresponde exclusivamente al dataset de evaluacion del autor y no es directamente comparable con resultados de Whisper tiny en benchmarks estandar como LibriSpeech o Common Voice.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 150 MB para los pesos (38 M de parametros x 4 bytes), mas overhead de activaciones y buffers de audio; en la practica, menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 75 MB para los pesos; menos de 500 MB en total con overhead.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en GTX 1060, RTX 3060, RTX 4090, A100 o H100. No requiere GPU dedicada.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: transformers (libreria nativa), vLLM no aplica de forma estandar para ASR, llama.cpp no soporta Whisper de forma nativa (aunque existe whisper.cpp como alternativa para pesos convertidos), Ollama no soporta ASR de forma nativa, TGI no esta orientado a Whisper. La via recomendada es transformers con pipeline `automatic-speech-recognition`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al ser un modelo tiny, se espera latencia baja en GPU y moderada en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | WER declarado |
|---|---|---|---|---|---|
| merkelmarrow/whisper-tiny-chinese_english-ft1 | 37,76 M | 30 s | en (declarado); entrenado en chino-ingles | Apache 2.0 | 15,01 % en naharte/chinese_english |
| openai/whisper-tiny | 37,76 M | 30 s | multilingue (99 idiomas) | Apache 2.0 | No disponible en la informacion proporcionada |
| openai/whisper-base | 74,4 M | 30 s | multilingue (99 idiomas) | Apache 2.0 | No disponible en la informacion proporcionada |
| openai/whisper-small | 244 M | 30 s | multilingue (99 idiomas) | Apache 2.0 | No disponible en la informacion proporcionada |

La comparativa se limita a la familia Whisper porque no se dispone de datos de benchmarks de otros modelos ASR en la informacion proporcionada. El modelo fine-tuneado comparte arquitectura y tamano con whisper-tiny, por lo que la diferencia principal es la especializacion en el dominio chino-ingles a costa de una posible perdida de rendimiento en otros idiomas.

## Limitaciones y advertencias

- Model card generada automaticamente: el autor no ha documentado la composicion del dataset, los casos de uso previstos ni las limitaciones, lo que impide evaluar su idoneidad para producción.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por parte de la comunidad.
- WER de 15,01 % declarado por el autor pero no verificado de forma independiente; puede no ser representativo de otros dominios o acentos.
- El fine-tuning sobre un corpus bilingue concreto puede haber degradado el rendimiento en otros idiomas respecto al modelo base whisper-tiny, que es multilingue.
- La model card solo declara ingles como idioma soportado, aunque el dataset sea chino-ingles; existe ambiguedad sobre el comportamiento real en cada idioma.
- Riesgo de alucinacion: como todos los modelos Whisper, puede generar texto que no corresponde al audio, especialmente en segmentos con silencio, ruido o musica.
- Limitacion de contexto de audio: solo procesa ventanas de 30 segundos; audios mas largos requieren segmentacion manual.
- Sin documentacion sobre sesgos: no se han evaluado sesgos de genero, acento o dialecto.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantias y de documentacion hace recomendable una evaluacion propia antes de desplegarlo en producción.
- El repositorio tiene solo 0,2 GB y no se publican artefactos cuantizados ni convertidos a GGUF, lo que limita las opciones de despliegue en entornos no basados en transformers.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/merkelmarrow/whisper-tiny-chinese_english-ft1
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/naharte/chinese_english
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de OpenAI Whisper: https://github.com/openai/whisper
