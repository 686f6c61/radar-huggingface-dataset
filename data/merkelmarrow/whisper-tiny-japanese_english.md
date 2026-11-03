# merkelmarrow/whisper-tiny-japanese_english

## Resumen

Whisper tiny Japanese English es un ajuste fino del modelo openai/whisper-tiny, publicado por el usuario merkelmarrow en HuggingFace. Se trata de un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura encoder-decoder Transformer de Whisper, en su variante mas pequena, con 37.760.640 parametros. El modelo ha sido entrenado sobre el dataset naharte/japanese_english, presumiblemente para transcribir audio que contiene habla en japones e ingles de forma mezclada, aunque la model card solo declara oficialmente el idioma ingles.

El interes de este modelo es limitado pero concreto: ofrece una version ultraligera de Whisper afinada para un caso de uso muy especifico (audio bilingue japones-ingles), lo que permite desplegarla en entornos con recursos muy restringidos, como dispositivos edge, CPUs o GPUs de gama baja. Su licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

No obstante, conviene ser prudente: la model card es practicamente un esqueleto generado automaticamente por el Trainer de HuggingFace, sin descripcion, sin detalle de datos de entrenamiento y sin informacion sobre usos previstos. El unico dato de rendimiento declarado es un WER de 20,86 sobre el split de test del dataset de entrenamiento, no verificado por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | en (declarado); el dataset de entrenamiento sugiere japones e ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-tiny, un Transformer encoder-decoder disenado para ASR que procesa espectrogramas Mel de audio en ventanas de 30 segundos y genera texto de forma autorregresiva. La variante tiny es la mas pequena de la familia Whisper, con aproximadamente 39 millones de parametros en su version original (37,76 millones en este ajuste). No se trata de un MoE ni de una arquitectura hibrida: es un Transformer denso convencional.

El ajuste fino se realizo sobre el dataset naharte/japanese_english con los siguientes hiperparametros declarados: learning rate de 3,75e-05, batch de entrenamiento de 32, batch de evaluacion de 64, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 50 pasos de warmup y 1000 pasos totales de entrenamiento (aproximadamente 19,6 epocas). El framework utilizado fue Transformers 5.23.0.dev0 con PyTorch 2.11.0+cu130. No se especifica el numero de tokens de audio, la composicion del dataset ni si hubo tecnicas de aumentacion o regularizacion adicionales. La perdida de validacion se mantuvo estable en torno a 0,48-0,52 a lo largo del entrenamiento, mientras que la perdida de entrenamiento cayo hasta 0,0061, lo que sugiere un sobreajuste notable al conjunto de entrenamiento.

## Capacidades

- Transcripcion de voz a texto (ASR) en ingles y, presumiblemente, en audio bilingue japones-ingles segun el dataset de entrenamiento.
- Generacion de transcripciones con puntuacion basica y mayusculas, heredadas del modelo base Whisper.
- Procesamiento de audio en ventanas de 30 segundos, con la posibilidad de encadenar ventanas para audios mas largos mediante pipelines de transformers.
- No soporta tool calling ni function calling (es un modelo ASR puro).
- No soporta razonamiento multi-paso ni comportamiento agentico.
- Capacidades multilingues limitadas: solo se declara ingles oficialmente; el japones no esta declarado en la model card.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Transcripcion de reuniones bilingues japones-ingles en entornos con recursos limitados: el modelo puede desplegarse en una CPU o en una GPU de gama baja para generar actas o subtitulos de reuniones donde los participantes alternan entre ambos idiomas, aunque la calidad en japones no esta garantizada por la documentacion.
- Subtitulado automatico de contenido audiovisual en dispositivos edge: por su tamano reducido (0,2 GB de repo), puede integrarse en aplicaciones moviles o de escritorio que necesiten transcripcion local sin conexion.
- Prototipado rapido de pipelines ASR: sirve como modelo de referencia para validar arquitecturas de procesamiento de audio antes de escalar a variantes mayores de Whisper.
- Generacion de transcripciones para busqueda y indexacion de archivos de audio en ingles: util en sistemas de gestion documental que necesiten convertir grabaciones a texto para busqueda full-text.
- Investigacion academica sobre ASR bilingue: el modelo y su dataset asociado pueden servir como punto de partida para estudiar el comportamiento de modelos tiny en escenarios de code-switching japones-ingles.
- Transcripcion de notas de voz en aplicaciones de productividad: con 37 millones de parametros, puede ejecutarse en tiempo real en hardware modesto para convertir notas de voz en texto editable.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model card, no verificados por terceros:

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| WER | naharte/japanese_english | test | 20,8647 |
| Loss (validacion) | naharte/japanese_english | evaluacion | 0,5073 |

Evolucion del WER durante el entrenamiento (segun la model card):

| Paso | Epoca | Validation loss | WER |
|---|---|---|---|
| 100 | 1,96 | 0,4809 | 22,3371 |
| 200 | 3,92 | 0,4812 | 21,4286 |
| 300 | 5,88 | 0,4979 | 22,2431 |
| 400 | 7,84 | 0,5164 | 21,4286 |
| 500 | 9,80 | 0,5096 | 21,4756 |
| 600 | 11,76 | 0,5095 | 21,3503 |
| 700 | 13,73 | 0,5233 | 21,3503 |
| 800 | 15,69 | 0,5151 | 21,0526 |
| 900 | 17,65 | 0,5088 | 20,6454 |
| 1000 | 19,61 | 0,5073 | 20,8647 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (37,76 M de parametros equivalen a unos 151 MB de pesos); en fp16, unos 75 MB. La mayor parte del consumo proviene de las activaciones y del buffer de audio, no de los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tambien funciona en CPU sin problemas.
- Cabe en cualquier GPU consumer: GTX 1050, RTX 2060, RTX 3060, RTX 4090, e incluso en Raspberry Pi y dispositivos moviles con optimizaciones adecuadas.
- Opciones de despliegue: transformers (pipeline de automatic-speech-recognition), vLLM no aplica para ASR, llama.cpp no soporta Whisper de forma nativa (existe whisper.cpp como alternativa), Ollama no soporta este modelo, TGI no esta orientado a ASR. La opcion mas directa es transformers o whisper.cpp tras conversion a GGML.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera una latencia muy baja en GPU y moderada en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | WER declarado |
|---|---|---|---|---|---|
| merkelmarrow/whisper-tiny-japanese_english | 37,76 M | ventanas de 30 s | en (declarado) | apache-2.0 | 20,86 (dataset propio) |
| openai/whisper-tiny | ~39 M | ventanas de 30 s | multilingue (99 idiomas) | apache-2.0 | no disponible en esta ficha |
| openai/whisper-base | ~74 M | ventanas de 30 s | multilingue (99 idiomas) | apache-2.0 | no disponible en esta ficha |
| openai/whisper-small | ~244 M | ventanas de 30 s | multilingue (99 idiomas) | apache-2.0 | no disponible en esta ficha |

La comparativa se limita a la familia Whisper porque no se dispone de datos de otros modelos ASR bilingues japones-ingles en la informacion proporcionada. El modelo ajustado no declara mejoras frente a whisper-tiny original en benchmarks publicos; su unico dato es el WER sobre su propio dataset de evaluacion, que no es directamente comparable con resultados de otros conjuntos.

## Limitaciones y advertencias

- La model card esta practicamente vacia: no hay descripcion del modelo, ni de los datos de entrenamiento, ni de los usos previstos. Esto dificulta evaluar su calidad real.
- El WER de 20,86 es elevado para estandares actuales de ASR y se ha medido sobre el mismo dataset de entrenamiento, lo que puede inflar el resultado o, por el contrario, reflejar un sobreajuste (la perdida de entrenamiento cayo a 0,0061 mientras la de validacion se estancaba en torno a 0,5).
- El modelo solo declara oficialmente el idioma ingles; el japones no aparece en el campo `language` de la model card, aunque el dataset se llame japanese_english. No hay garantia de calidad en japones.
- Riesgo de alucinacion: como todos los modelos Whisper, puede generar texto que no corresponde al audio, especialmente en silencios, ruido o audio de baja calidad.
- Sesgos conocidos: heredados del modelo base Whisper tiny, entrenado con datos de internet; puede presentar sesgos de genero, acento y dialecto.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el modelo base Whisper tambien es Apache 2.0, por lo que no hay conflicto.
- Caveat para produccion: con 0 descargas y 0 likes, el modelo no tiene validacion comunitaria; se recomienda evaluarlo exhaustivamente en el dominio objetivo antes de desplegarlo.
- El sobreajuste observado (perdida de entrenamiento muy baja frente a validacion estable) sugiere que el modelo puede generalizar mal a audios fuera del dataset de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/merkelmarrow/whisper-tiny-japanese_english
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/naharte/japanese_english
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- Implementacion whisper.cpp: https://github.com/ggerganov/whisper.cpp
