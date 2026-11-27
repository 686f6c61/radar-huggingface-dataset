# GustavoDLRA/whisper-tiny-minds14-en-us

## Resumen

whisper-tiny-minds14-en-us es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny para reconocimiento automatico del habla (ASR) en ingles estadounidense, especializado en el dominio de consultas bancarias. Lo desarrolla el usuario GustavoDLRA y se publica bajo licencia Apache 2.0. El modelo parte de la arquitectura transformer encoder-decoder de Whisper en su variante "tiny", con 37.760.640 parametros totales, y se ha entrenado sobre el subconjunto en ingles del dataset PolyAI/minds14, un corpus de grabaciones reales de usuarios de servicios financieros.

El problema que aborda es la adaptacion de un modelo ASR generico y muy pequeno a un dominio concreto con vocabulario y acustica especificos (nombres de entidades bancarias, importes, frases de atencion al cliente). Frente al checkpoint original de OpenAI, el ajuste busca reducir la tasa de error de palabra (WER) en ese dominio sin aumentar el coste computacional, manteniendo el modelo lo bastante pequeno como para ejecutarse en CPU o en GPUs de consumo.

Es relevante por su tamano reducido y su licencia permisiva, que lo hacen util como componente ligero en pipelines de transcripcion de bajo coste o como ejemplo reproducible de fine-tuning de Whisper. No obstante, se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y sin documentacion adicional sobre usos previstos o limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre el subconjunto en ingles de PolyAI/minds14) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con atencion por bloques y representacion de audio mediante espectrogramas Mel. Whisper tiny es la variante mas pequena de la familia Whisper, con 4 capas de encoder y 4 de decoder, y esta disenado para transcripcion de audio en ventanas de 30 segundos.

El ajuste fino se realizo sobre el dataset PolyAI/minds14, segun la model card, con los siguientes hiperparametros: learning rate de 1e-05, batch size de 16 (entrenamiento y evaluacion), semilla 42, optimizador AdamW fused con betas (0.9, 0.999) y epsilon 1e-08, scheduler constant_with_warmup con 50 pasos de calentamiento, 500 pasos de entrenamiento totales y precision mixta nativa (AMP). No se especifica el numero de tokens de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card indica explicitamente "More information needed" en las secciones de descripcion, usos previstos y datos de entrenamiento.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles estadounidense, orientado a grabaciones de consultas bancarias del dataset minds14.
- Transcripcion de audio en ventanas de hasta 30 segundos, segun la configuracion estandar de Whisper tiny.
- Generacion de transcripciones con puntuacion y mayusculas basicas, heredadas del modelo base.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el ajuste se limita al subconjunto en ingles de minds14.
- No se documentan capacidades especiales como modo thinking, vision o audio adicional.

## Casos de uso

- Transcripcion de llamadas de atencion al cliente bancaria: el modelo puede convertir grabaciones de consultas de usuarios en texto para su posterior analisis, aprovechando el ajuste sobre el dominio financiero de minds14.
- Enrutamiento automatico de consultas: a partir de la transcripcion, un sistema posterior puede clasificar la intencion del cliente (cambio de direccion, consulta de saldo, etc.) y dirigir la llamada al departamento adecuado.
- Generacion de resumenes de interacciones: la transcripcion sirve de entrada a un modelo de lenguaje que resume la conversacion para el agente o para el registro de calidad.
- Prototipado rapido en entornos con recursos limitados: al tener 37,7 millones de parametros, puede ejecutarse en CPU o en GPUs de consumo para pruebas de concepto de ASR en dominio financiero.
- Analisis de calidad de servicio: transcripcion masiva de grabaciones para medir tiempos de respuesta, deteccion de quejas o cumplimiento normativo.
- Base para nuevos ajustes finos: sirve como punto de partida para adaptar Whisper tiny a otros dominios o acentos con un coste de entrenamiento bajo.
- Educacion y experimentacion: ejemplo reproducible de fine-tuning de Whisper con la libreria transformers y el ecosistema Hugging Face.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Metrica | Dataset | Valor |
|---|---|---|
| WER | PolyAI/minds14 | 0,2910 |
| WER ortho | PolyAI/minds14 | 0,2850 |
| Loss (evaluacion) | PolyAI/minds14 | 0,6870 |

Evolucion durante el entrenamiento (segun la model card):

| Paso | Epoca | Training loss | Validation loss | WER ortho | WER |
|---|---|---|---|---|---|
| 100 | 3,57 | 0,2616 | 0,5068 | 0,2961 | 0,3017 |
| 200 | 7,14 | 0,0274 | 0,5937 | 0,3023 | 0,3052 |
| 300 | 10,71 | 0,0020 | 0,6386 | 0,2986 | 0,3046 |
| 400 | 14,29 | 0,0009 | 0,6679 | 0,2844 | 0,2904 |
| 500 | 17,86 | 0,0006 | 0,6870 | 0,2850 | 0,2910 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision fp32 (37,7 millones de parametros, aproximadamente 150 MB de pesos) y aun menor en fp16 o int8.
- GPU recomendadas: cualquier GPU moderna, incluidas NVIDIA RTX 4090, A100 o H100, aunque el modelo es sobredimensionado para ellas; tambien funciona en GPUs de gama baja e integradas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: transformers (libreria nativa), pipeline de automatic-speech-recognition; compatible con endpoints de Hugging Face (tag endpoints_compatible); no se documenta soporte especifico de vLLM, llama.cpp, Ollama o TGI para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | WER (minds14 en-US) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GustavoDLRA/whisper-tiny-minds14-en-us | 37,7 M | 30 s (ventana Whisper) | 0,2910 (declarado, no verificado) | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 37,7 M | 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74,4 M | 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |

No se dispone de resultados comparativos de WER sobre minds14 para los checkpoints originales de OpenAI en la informacion proporcionada, por lo que no es posible cuantificar la mejora del ajuste fino frente a la base.

## Limitaciones y advertencias

- Modelo de nicho: cero descargas y cero likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Documentacion incompleta: la model card indica "More information needed" en descripcion, usos previstos y datos de entrenamiento.
- Sesgos conocidos: no documentados; al entrenarse sobre grabaciones de un dominio financiero concreto, puede presentar sesgos hacia ese vocabulario y estilo de habla.
- Riesgo de alucinacion: como todo modelo ASR generativo, puede producir transcripciones plausibles pero incorrectas, especialmente con audio ruidoso o acentos no representados.
- Limitaciones de contexto e idioma: el ajuste se limita al subconjunto en ingles de minds14; no se garantiza un rendimiento adecuado en otros idiomas o dominios.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no documenta condiciones adicionales; conviene verificar la procedencia del dataset minds14 para usos comerciales.
- Caveat para produccion: el WER declarado (0,2910) no esta verificado y corresponde a un modelo tiny; para produccion en dominio financiero se recomienda evaluacion propia y, probablemente, un modelo de mayor tamano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GustavoDLRA/whisper-tiny-minds14-en-us
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset: https://huggingface.co/datasets/PolyAI/minds14
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
