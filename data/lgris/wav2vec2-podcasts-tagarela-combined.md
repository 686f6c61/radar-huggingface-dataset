# lgris/wav2vec2-podcasts-tagarela-combined

## Resumen

lgris/wav2vec2-podcasts-tagarela-combined es un modelo de reconocimiento automatico del habla (ASR) en portugues de Brasil, desarrollado por el usuario lgris. Se trata de un ajuste fino de wav2vec2 con cabecera CTC sobre la combinacion en streaming de los corpus TAGARELA v1 y TAGARELA v2, ambos centrados en habla de podcasts y entrevistas. El modelo parte del checkpoint lgris/w2v_podcasts_base_400k_pt, un Wav2Vec2 base preentrenado especificamente sobre podcasts brasilenos, lo que lo aleja de los XLS-R multilingues habituales en la tarea.

Con 94.412.469 parametros (unos 94,4 millones, el tamano tipico de Wav2Vec2 base), el modelo es muy ligero: cabe en cualquier GPU de consumo e incluso se puede ejecutar en CPU con latencias razonables. Su relevancia actual esta en cubrir un nicho poco servido, el ASR de podcasts en portugues brasileno, con licencia Apache 2.0 y pesos en safetensors, algo que no abunda en modelos de habla para ese idioma y dominio.

El entrenamiento combino batches balanceados al 50 % entre muestras de TAGARELA v1 y v2, con el codificador convolucional de caracteristicas congelado, 100.000 pasos y precision bfloat16. Los resultados declarados por el autor sitúan el WER en 15,92 % sobre TAGARELA v2, 21,64 % sobre el test revisado por humanos de TAGARELA v1 y 25,44 % sobre CORAA v1.1, un corpus externo de habla espontanea, lo que ofrece una referencia de generalizacion fuera del dominio de podcasts.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 base con cabecera CTC (Wav2Vec2ForCTC): codificador convolucional de caracteristicas + encoder Transformer |
| Parametros totales | 94.412.469 (≈94,4 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (modelo de ASR; entrada de audio muestreado a 16 kHz, sin ventana de contexto en tokens) |
| Tipos de cuantizacion | no disponible (la model card no documenta cuantizaciones; el repositorio solo publica pesos completos) |
| Idiomas soportados | portugues brasileno (pt-BR) unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y checkpoint PyTorch (tag `pt`); tamano del repositorio 0,4 GB |
| Muestreo de audio | 16 kHz mono |
| Vocabulario | 51 tokens (tokenizador CTC por caracteres) |
| Modelo base | lgris/w2v_podcasts_base_400k_pt |
| Datos de ajuste fino | TAGARELA v1 (1.764 shards) y TAGARELA v2 (2.224 shards con transcripciones `stt_parakeet`) |
| Tarea (pipeline) | automatic-speech-recognition |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la clasica de Wav2Vec2 para ASR: un extractor de caracteristicas convolucional que convierte la onda de audio en representaciones latentes, seguido de un encoder Transformer que las contextualiza y una cabecera lineal de clasificacion entrenada con Connectionist Temporal Classification (CTC). El modelo usa audio mono a 16 kHz y un vocabulario de 51 tokens. Sobre el checkpoint base lgris/w2v_podcasts_base_400k_pt, preentrenado con podcasts brasilenos, el ajuste fino se realizo con el feature encoder congelado, una practica habitual para preservar las representaciones acusticas aprendidas durante el preentrenamiento y reducir el coste de entrenamiento.

El entrenamiento se hizo en modo streaming sobre la union de TAGARELA v1 y TAGARELA v2, con batches balanceados 50/50 entre ambos corpus para estabilizar los gradientes y evitar que el dataset mayor dominase el ajuste. Se configuraron 100.000 pasos maximos con un batch efectivo de 128 (16 por dispositivo con 8 pasos de acumulacion de gradiente), learning rate de 3e-5 con warm-up lineal de 5.000 pasos y precision bfloat16. La model card no detalla el numero total de horas de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de aumento de datos, ni indica el uso de RLHF o DPO (no aplicables en un modelo CTC de ASR).

Un punto relevante sobre los datos: en TAGARELA v1 solo el split de test cuenta con revision humana, segun la propia model card; el resto de transcripciones de entrenamiento no esta verificado por anotadores humanos, lo que introduce ruido de etiquetas potencial en el ajuste fino. En TAGARELA v2 las transcripciones de entrenamiento proceden de la columna `stt_parakeet`, es decir, de un sistema ASR previo.

## Capacidades

- Transcripcion de voz a texto en portugues brasileno (pt-BR) con decodificacion CTC greedy.
- Reconocimiento de habla espontanea y de estilo conversacional propio de podcasts, entrevistas y tertulias.
- Procesamiento de audio a 16 kHz mono mediante el pipeline `automatic-speech-recognition` de transformers o `Wav2Vec2ForCTC` directo.
- Inferencia por lotes: admite `padding=True` y procesado en batch con GPU o CPU.
- Integracion sencilla en pipelines de Python (transformers, torch, librosa) y exportacion a otros runtimes si el usuario la realiza por su cuenta.
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni de razonamiento multi-paso; es un modelo puramente acustico.
- No dispone de modo thinking, vision, audio-vision ni generacion de texto libre.
- No incorpora restauracion de puntuacion, mayusculas ni marcas de tiempo en la salida; la salida es texto plano en minusculas segun el vocabulario CTC.

## Casos de uso

- Transcripcion de podcasts en portugues brasileno: el modelo esta ajustado especificamente sobre TAGARELA v1 y v2, dos corpus de podcasts, por lo que es la opcion natural para generar transcripciones de episodios completos troceados en segmentos de audio de 16 kHz.
- Indexacion y busqueda de contenido sonoro: al convertir el audio en texto se puede alimentar un indice de busqueda (Elasticsearch, OpenSearch) para localizar fragmentos concretos dentro de un catalogo de episodios.
- Subtitulado automatico de video en portugues: generando segmentos de pocos segundos y transcribiendolos por lotes, el modelo sirve como base para subtitulos en plataformas de video, con revision humana posterior dado el WER declarado del 15-25 %.
- Analisis de entrevistas y material cualitativo: investigadores que trabajan con entrevistas en portugues brasileno pueden transcribir horas de audio en GPU de consumo y despues codificar el texto manualmente o con herramientas de analisis.
- Aprendizaje de idiomas y accesibilidad: transcripcion en tiempo cuasi real de audio en portugues para personas con discapacidad auditiva o para estudiantes que necesitan texto de apoyo, ejecutando el modelo en local sin enviar audio a servicios externos.
- Preprocesado de datos de habla para otros modelos: al ser un modelo pequeno y con licencia Apache 2.0, se puede usar como etiquetador automatico para generar transcripciones preliminares de grandes volumenes de audio brasileno antes de un filtrado o correccion manual.
- Investigacion en ASR de bajo recurso: sirve como linea base reproducible (Apache 2.0, pesos publicos) para comparar tecnicas de ajuste fino sobre portugues brasileno frente a los XLS-R de 300 M.
- Despliegue en el borde: con menos de 100 M de parametros, es viable ejecutarlo en CPU o en dispositivos con poca memoria para aplicaciones de dictado o notas de voz sin GPU dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (metrica no verificada de forma independiente, campo `verified: false` en el model-index):

| Dataset de test | Amostras | WER (%) | CER (%) | Observaciones |
|---|---:|---:|---:|---|
| TAGARELA v1 (test revisado por humanos) | 356 | 21,64 | 9,70 | Solo el conjunto de test de v1 tiene revision humana |
| TAGARELA v2 | 4.208 | 15,92 | 6,82 | Transcripciones de referencia procedentes de `stt_parakeet` |
| CORAA v1.1 | 12.676 | 25,44 | 10,86 | Prueba de generalizacion fuera del dominio de podcasts |

Comparativa de WER declarada por el autor frente a modelos relacionados:

| Modelo | TAGARELA v1 (WER) | TAGARELA v2 (WER) | CORAA v1.1 (WER) |
|---|---:|---:|---:|
| lgris/wav2vec2-podcasts-tagarela-combined (este modelo) | 21,64 | 15,92 | 25,44 |
| lgris/wav2vec2-podcasts-tagarela-v2 | 23,75 | 14,96 | 23,98 |
| lgris/wav2vec2-xls-r-300m-tagarela-v2 | no disponible | 11,75 | no disponible |
| lgris/wav2vec2-xls-r-300m-tagarela-combined | no disponible | 20,36 | no disponible |
| Edresson/wav2vec2-large-xlsr-coraa-portuguese (referencia externa) | 32,55 | 27,08 | 22,46 |

## Requisitos de hardware

- Pesos en fp32: aproximadamente 378 MB (94,4 M de parametros × 4 bytes). El repositorio completo ocupa 0,4 GB.
- Pesos en fp16/bf16: aproximadamente 189 MB, si el usuario convierte el checkpoint por su cuenta.
- VRAM estimada para inferencia con batch 1 y audio de pocos segundos: por debajo de 1 GB en fp16 y en torno a 1-2 GB en fp32, sumando activaciones y buffers de decodificacion.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o en CPU con tiempos de inferencia aceptables para audio corto.
- GPU de datacenter (A100, H100, L40S) no son necesarias para inferencia; solo tendrian sentido para reentrenar o para procesar volumenes muy grandes en paralelo.
- Ejecucion en CPU: viable, con la libreria transformers y PyTorch en modo CPU; para volumen alto conviene exportar a ONNX o usar cuantizacion a int8 mediante Optimum, aunque la model card no documenta estas conversiones.
- Opciones de despliegue: pipeline `automatic-speech-recognition` de transformers, `Wav2Vec2ForCTC` + `Wav2Vec2Processor` en un servicio propio, exportacion a ONNX Runtime o integracion en TorchServe/Triton. No se documenta compatibilidad con llama.cpp, Ollama, vLLM o TGI, ya que no son runtimes orientados a Wav2Vec2 CTC.
- Latencia y throughput: no disponibles. El autor no publica factores de tiempo real ni muestras por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Dominio / idioma | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lgris/wav2vec2-podcasts-tagarela-combined | 94,4 M | podcasts, pt-BR | 21,64 (TAGARELA v1), 15,92 (v2), 25,44 (CORAA) | Apache 2.0 | HuggingFace, safetensors + PyTorch |
| lgris/wav2vec2-podcasts-tagarela-v2 | clase Wav2Vec2 base (≈94 M) | podcasts, pt-BR | 23,75 (v1), 14,96 (v2), 23,98 (CORAA) | no disponible | HuggingFace |
| lgris/wav2vec2-xls-r-300m-tagarela-v2 | XLS-R 300 M (≈317 M) | multilingue ajustado a pt-BR | 11,75 (TAGARELA v2) | no disponible | HuggingFace |
| Edresson/wav2vec2-large-xlsr-coraa-portuguese | Wav2Vec2 large XLS-R (clase 300 M) | portugues, corpus CORAA | 32,55 (v1), 27,08 (v2), 22,46 (CORAA) | no disponible | HuggingFace |

Lectura de la comparativa: el XLS-R 300 M ajustado a TAGARELA v2 obtiene el mejor WER en ese corpus (11,75 %), a costa de triplicar el tamano del modelo. Frente al Wav2Vec2 base ajustado solo con v2, este modelo combinado mejora en TAGARELA v1 (21,64 % frente a 23,75 %) pero empeora ligeramente en TAGARELA v2 (15,92 % frente a 14,96 %) y en CORAA (25,44 % frente a 23,98 %). Frente al modelo de referencia de CORAA, el modelo de lgris es claramente mejor en los dos conjuntos de TAGARELA y peor en CORAA, el dominio para el que se entreno ese checkpoint externo.

## Limitaciones y advertencias

- Idioma unico: solo portugues brasileno (pt-BR). No soporta castellano, portugues europeo ni ningun otro idioma, y el rendimiento fuera de pt-BR no esta documentado.
- Error de transcripcion alto en terminos absolutos: WER de 15,92 % en el mejor caso y de hasta 25,44 % en CORAA. Para produccion en subtitulado o transcripcion legal conviene revision humana.
- Sesgo de dominio: el ajuste fino se hizo sobre podcasts, por lo que el rendimiento puede degradarse con audio telefónico, ruido de fondo intenso, solapamiento de voces o acentos muy alejados de los corpus de entrenamiento.
- Riesgo de alucinacion acustica: aunque CTC reduce la generacion libre de texto frente a modelos seq2seq, los sistemas CTC pueden producir repeticiones o texto espurio en segmentos de silencio, musica o ruido.
- Ruido de etiquetas en el entrenamiento: en TAGARELA v1 solo el test tiene revision humana y en TAGARELA v2 las referencias de entrenamiento provienen de otro sistema ASR (`stt_parakeet`), lo que limita el techo de calidad aprendido.
- Ausencia de puntuacion, mayusculas y marcas de tiempo: la salida es texto plano sin formato, sin diarizacion de hablantes y sin timestamps por palabra; habria que añadir post-procesado externo.
- Entrada restringida a 16 kHz mono: si el audio no se remuestrea correctamente, la calidad de la transcripcion cae de forma notable.
- Metricas no verificadas: todos los resultados del model-index figuran con `verified: false`; provienen del autor y no de una evaluacion independiente.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero obliga a conservar el aviso de licencia y a no reclamar endoso del autor. Los modelos comparados no tienen licencia declarada en la informacion disponible, asi que su reutilizacion comercial debe comprobarse en origen.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya reportado problemas de produccion, lo que aumenta el riesgo de comportamiento no documentado.
- Fecha de creacion del repositorio inusual (2026-09-13), posterior a la fecha de consulta; conviene verificar la vigencia del checkpoint antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lgris/wav2vec2-podcasts-tagarela-combined
- Modelo base preentrenado en podcasts: https://huggingface.co/lgris/w2v_podcasts_base_400k_pt
- Version ajustada solo con TAGARELA v2: https://huggingface.co/lgris/wav2vec2-podcasts-tagarela-v2
- Version XLS-R 300M ajustada a TAGARELA v2: https://huggingface.co/lgris/wav2vec2-xls-r-300m-tagarela-v2
- Version XLS-R 300M ajustada a v1+v2: https://huggingface.co/lgris/wav2vec2-xls-r-300m-tagarela-combined
- Modelo de referencia externo sobre CORAA: https://huggingface.co/Edresson/wav2vec2-large-xlsr-coraa-portuguese
- Dataset TAGARELA v1: https://huggingface.co/datasets/freds0/TAGARELA
- Dataset TAGARELA v2: https://huggingface.co/datasets/freds0/TAGARELA_v2
- Dataset CORAA v1.1: https://huggingface.co/datasets/Racoci/CORAA-v1.1
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre el modelo; los resultados devueltos correspondian a mapas de Copenhague y no guardan relacion con la ficha.
