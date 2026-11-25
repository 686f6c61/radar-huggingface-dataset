# soshi-irie/whisper-twi

## Resumen

Whisper Twi es un modelo de reconocimiento automatico del habla (ASR) obtenido mediante fine-tuning del checkpoint `tiffany101/whisper-twi-v2`, que a su vez parte de la familia Whisper de OpenAI. Lo publica el usuario soshi-irie en Hugging Face y esta especializado en twi (akan), una lengua hablada principalmente en Ghana. El modelo resuelve la transcripcion de audio a texto en un idioma con recursos limitados, donde los sistemas ASR multilingues genericos suelen ofrecer tasas de error elevadas.

El modelo cuenta con 37.760.640 parametros, lo que lo situa en el rango de las variantes pequenas de Whisper (compatible con la arquitectura `whisper-small` en cuanto a orden de magnitud). Se ha entrenado sobre el dataset `soshi-irie/twi-sst-model-v1`, orientado a dominio financiero (la metrica se reporta sobre la particion `twi-financial-inclusion`), y declara una licencia Apache 2.0 que permite uso comercial.

Es relevante por dos motivos: primero, porque demuestra que es posible adaptar un modelo base de Whisper a una lengua de bajos recursos con un presupuesto de entrenamiento modesto (4000 pasos, batch de 16); segundo, porque publica una WER de 9,56 sobre el conjunto de test declarado, un dato que, aunque no verificado de forma independiente, resulta competitivo para una lengua africana de bajos recursos. La ficha debe leerse con cautela: la model card esta generada automaticamente y carece de secciones sustantivas de descripcion, usos previstos y limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, fine-tuning de `tiffany101/whisper-twi-v2`) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s; el autor no lo declara) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | twi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper: un encoder-decoder Transformer con atencion por ventanas sobre espectrogramas Mel, disenado originalmente para ASR multilingue y traduccion de voz. El checkpoint parte de `tiffany101/whisper-twi-v2`, ya ajustado a twi, y se ha refinado sobre el dataset `soshi-irie/twi-sst-model-v1`. No se documenta el numero de tokens de audio ni la composicion exacta del corpus; la unica referencia es la particion de evaluacion `twi-financial-inclusion`, lo que sugiere un dominio financiero.

Los hiperparametros de entrenamiento declarados son: learning rate 1e-5, batch de entrenamiento 16, batch de evaluacion 8, semilla 42, optimizador AdamW (variante fused, betas 0.9/0.999, epsilon 1e-8), scheduler lineal con 500 pasos de calentamiento, 4000 pasos totales y precision mixta nativa (AMP). El entrenamiento se ejecuto con Transformers 5.24.0, PyTorch 2.13.0+cu132, Datasets 5.2.0 y Tokenizers 0.23.3. No se menciona RLHF, DPO ni tecnicas de decodificacion especulativa; se trata de un fine-tuning supervisado convencional.

## Capacidades

- Transcripcion de voz a texto en twi, con salida de texto plano.
- Reconocimiento de habla en dominio financiero (el conjunto de evaluacion se denomina `twi-financial-inclusion`).
- Procesamiento de audio de hasta 30 segundos por ventana, segun el diseno estandar de Whisper.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta capacidad multilingue mas alla del twi.
- No se documenta modo de razonamiento (thinking), vision ni audio generativo.
- No se documenta traduccion de voz a texto en otros idiomas.

## Casos de uso

- Transcripcion de entrevistas y encuestas de inclusion financiera: el modelo se ha ajustado sobre un corpus de ese dominio, por lo que es adecuado para convertir respuestas orales de hablantes de twi en texto estructurado para analisis estadistico.
- Atencion al cliente en entidades microfinancieras de Ghana: permite transcribir llamadas o mensajes de voz de clientes en twi para su posterior clasificacion o enrutamiento, con un modelo ligero que cabe en infraestructura modesta.
- Subtitulado y documentacion de reuniones comunitarias: dado su tamano reducido (37,7 M de parametros), puede desplegarse en servidores sin GPU dedicada para generar transcripciones de actas en twi.
- Investigacion linguistica y construccion de corpus: util para etiquetar automaticamente audio en twi y ampliar datasets de lenguas de bajos recursos, siempre con revision humana dada la WER declarada.
- Accesibilidad para hablantes de twi: conversion de voz a texto en aplicaciones de lectura o dictado para personas con dificultades de lectoescritura.
- Preprocesamiento en pipelines de analitica de voz: transcripcion por lotes de grabaciones para busqueda por palabras clave o mineria de temas en centros de llamadas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| WER | `soshi-irie/twi-sst-model-v1` (twi-financial-inclusion) | test | 9,5613 |
| Loss (validacion) | `soshi-irie/twi-sst-model-v1` | validacion | 0,0064 |

Evolucion durante el entrenamiento segun la model card:

| Paso | Epoca | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 1000 | 0,5701 | 0,0066 | 0,0111 | 11,3427 |
| 2000 | 1,1403 | 0,0022 | 0,0071 | 10,3762 |
| 3000 | 1,7104 | 0,0071 | 0,0065 | 11,1058 |
| 4000 | 2,2805 | 0,0001 | 0,0064 | 9,5613 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 150 MB solo para pesos (37,7 M de parametros); con activaciones y buffers de audio, el consumo real es de unos cientos de MB.
- En FP16/BF16: alrededor de 75 MB de pesos; el cuello de botella sera el procesamiento de espectrogramas, no la memoria.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4090, T4). Tambien puede ejecutarse en CPU con latencia aceptable para audio corto.
- Cabe holgadamente en GPU consumer e incluso en entornos integrados.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), `optimum`/ONNX Runtime, y servidores compatibles con la API de Hugging Face (`endpoints_compatible` figura en los tags). No se documentan pesos GGUF para llama.cpp/Ollama, aunque la conversion seria viable dado el tamano.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| soshi-irie/whisper-twi | 37,7 M | no disponible | 9,56 (twi-financial-inclusion) | Apache 2.0 | Hugging Face |
| tiffany101/whisper-twi-v2 (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Whisper small (OpenAI) | ~244 M | 30 s de audio | no disponible para twi | MIT | Hugging Face, OpenAI |

La comparacion con Whisper small es orientativa por categoria (ASR de rango pequeno); no se dispone de resultados de Whisper small sobre twi en la informacion proporcionada. No se han identificado otros modelos ASR especificos de twi con datos publicados en esta busqueda.

## Limitaciones y advertencias

- La model card esta generada automaticamente y las secciones de descripcion, usos previstos y limitaciones estan sin completar ("More information needed").
- La WER de 9,56 no esta verificada de forma independiente (`verified: false` en el model-index) y procede de un unico conjunto de evaluacion de dominio financiero; el rendimiento en otros dominios o registros puede diferir.
- El modelo solo declara soporte para twi; no se garantiza un comportamiento correcto en otras lenguas, incluido el ingles mezclado.
- Riesgo de alucinacion en audio ruidoso, con acentos no representados en el corpus o con solapamiento de hablantes; no se documentan mecanismos de mitigacion.
- No se documentan sesgos demograficos ni de genero; dado el origen del corpus (inclusion financiera), puede estar sesgado hacia vocabulario y registros de ese ambito.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base `tiffany101/whisper-twi-v2` no declara licencia en la informacion disponible, por lo que conviene verificar la cadena de licencias antes de un despliegue en produccion.
- No se documentan limitaciones de longitud de audio mas alla de la ventana estandar de 30 s de Whisper.
- El numero de descargas (50) y de likes (0) es muy bajo, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/soshi-irie/whisper-twi
- Modelo base: https://huggingface.co/tiffany101/whisper-twi-v2
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/soshi-irie/twi-sst-model-v1
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
