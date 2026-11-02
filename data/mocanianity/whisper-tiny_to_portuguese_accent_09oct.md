# Mocanianity/whisper-tiny_to_portuguese_accent_09oct

## Resumen

Whisper tiny Spanish es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario Mocanianity en HuggingFace. A pesar del nombre, la model card indica que el entrenamiento se realizo sobre el dataset British English y el unico idioma declarado en los metadatos es el ingles, por lo que la denominacion "Spanish" del checkpoint no se corresponde con la informacion tecnica disponible. El modelo resuelve la tarea de reconocimiento automatico del habla (ASR) y se distribuye con licencia Apache 2.0.

Se trata de un modelo transformer encoder-decoder de tipo Whisper, con 37.760.640 parametros totales y un tamano de repositorio de 0,3 GB. Al derivar de whisper-tiny, hereda la arquitectura y las limitaciones de la familia Whisper original, pero con un ajuste especifico sobre datos de acento (el identificador del repositorio menciona "portuguese_accent"). Es relevante como ejemplo de ajuste ligero de ASR para dominios o acentos concretos, aunque su adopcion en produccion requiere validacion adicional dado que no hay descargas ni validacion externa.

El checkpoint se genero con la libreria Transformers (5.23.0.dev0) mediante el Trainer, con 2.000 pasos de entrenamiento, y presenta un WER declarado por el autor de 11,89 sobre el split de test del dataset British English. No se han publicado resultados verificados de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny usa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-tiny, un transformer encoder-decoder disenado para ASR con entradas de audio representadas como espectrogramas Mel. El ajuste fino se realizo con el Trainer de Transformers sobre el dataset British English, con los siguientes hiperparametros: learning rate 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW (fused) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 2.000 pasos totales de entrenamiento.

No se especifica en la informacion disponible el numero de tokens de audio procesados, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no procede en un modelo ASR). Tampoco se detalla ninguna innovacion tecnica adicional mas alla del propio ajuste fino. La model card fue generada automaticamente y contiene secciones sin completar ("More information needed") en descripcion, usos previstos y datos de entrenamiento.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en ingles.
- Ajuste especifico sobre un dataset de ingles britanico, segun los metadatos.
- El identificador del repositorio sugiere un ajuste orientado a acentos (posiblemente portugues), aunque la model card no lo documenta.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingue: solo "en" figura en los metadatos.
- No se declara vision, audio generativo ni modo de pensamiento (thinking mode).

## Casos de uso

- Transcripcion de audio en ingles con acento britanico: el modelo se ajusto sobre el dataset British English, por lo que es adecuado para transcribir reuniones, entrevistas o notas de voz en esa variante, siempre que se valide el WER en el dominio real.
- Prototipado rapido de pipelines ASR: con 37,7 M de parametros y 0,3 GB de repositorio, puede desplegarse en entornos con recursos muy limitados para pruebas de concepto.
- Subtitulado automatico de contenido en ingles: util para generar subtitulos preliminares que luego se revisan manualmente, dado el WER declarado de 11,89.
- Preprocesamiento de audio para busqueda y analitica: transcripcion de grandes volumenes de audio en ingles para indexacion y busqueda por texto.
- Evaluacion comparativa de ajustes finos de Whisper: sirve como referencia para estudiar el efecto del ajuste fino sobre whisper-tiny en datasets de acento especifico.
- Despliegue en dispositivos de borde o CPU: el tamano reducido permite inferencia en hardware modesto, aunque no se han publicado metricas de latencia o throughput.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | British English (split test) | WER | 11,8919 |
| Validacion (epoch 0,9217, step 1000) | British English | WER | 12,7120 |
| Validacion (epoch 1,8433, step 2000) | British English | WER | 11,8919 |
| Validacion (epoch 1,8433, step 2000) | British English | Loss | 0,2545 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 dado el tamano del modelo (37,7 M de parametros); en FP16 o int8 el consumo es aun menor.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060, RTX 2060, RTX 3060, RTX 4090) es suficiente; tambien GPU de datacenter (A100, H100) aunque sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: Transformers (pipeline de automatic-speech-recognition), vLLM no aplica de forma estandar a Whisper, llama.cpp no soporta Whisper de forma nativa, TGI no es la opcion habitual; se recomienda Transformers o soluciones especificas de ASR (por ejemplo, faster-whisper si se convierte el checkpoint).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (British English) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-tiny_to_portuguese_accent_09oct | 37,7 M | no disponible (ventanas de 30 s) | 11,89 (declarado) | apache-2.0 | HuggingFace |
| openai/whisper-tiny | 37,7 M | no disponible (ventanas de 30 s) | no disponible en esta ficha | apache-2.0 | HuggingFace |
| openai/whisper-base | 74 M | no disponible (ventanas de 30 s) | no disponible en esta ficha | apache-2.0 | HuggingFace |
| openai/whisper-small | 244 M | no disponible (ventanas de 30 s) | no disponible en esta ficha | apache-2.0 | HuggingFace |

No se dispone de datos de WER comparables para los modelos base en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- El nombre del modelo ("Spanish") no coincide con los metadatos, que declaran unicamente ingles; riesgo de confusion sobre el idioma real de uso.
- El identificador del repositorio menciona "portuguese_accent", pero la model card no documenta el dataset ni el objetivo del ajuste.
- WER declarado de 11,89 sin verificacion independiente; puede no generalizar a otros dominios, acentos o condiciones de audio.
- Riesgo de alucinacion en la transcripcion, comun en modelos Whisper de tamano tiny, especialmente con audio ruidoso o con acentos no representados en el entrenamiento.
- Modelo de 37,7 M de parametros: menor precision que variantes base, small o medium de Whisper.
- La model card esta generada automaticamente e incompleta en secciones clave (descripcion, usos previstos, datos de entrenamiento).
- Sin descargas ni likes en HuggingFace en el momento de la consulta; sin validacion por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- No se documentan sesgos especificos, pero al entrenarse sobre un dataset de ingles britanico puede presentar sesgo hacia esa variante y peor rendimiento en otras.

## Enlaces

- HuggingFace: https://huggingface.co/Mocanianity/whisper-tiny_to_portuguese_accent_09oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
