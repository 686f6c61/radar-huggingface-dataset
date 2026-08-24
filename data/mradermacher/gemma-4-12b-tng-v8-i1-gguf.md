# mradermacher/gemma-4-12B-TNG-V8-i1-GGUF

## Resumen

Este repositorio contiene el archivo de importancia (imatrix) para la cuantización GGUF del modelo `nightmedia/gemma-4-12B-TNG-V8`, un fine-tune de Gemma 4 12B de Google orientado a generación de código y temática Star Trek. El autor, mradermacher, es un conocido cuantizador de modelos open source que publica tanto quants estáticos como archivos imatrix para que la comunidad genere sus propias cuantizaciones de mayor calidad.

El modelo base, Gemma 4 12B, es un modelo multimodal sin encoder capaz de procesar texto, audio y vídeo de forma nativa, diseñado para ejecutarse en hardware de consumo con 16 GB de VRAM. Esta versión concreta no incluye los pesos cuantizados completos, sino únicamente el archivo imatrix (de aproximadamente 1,8 MB) que se utiliza para calcular matrices de importancia durante el proceso de cuantización. Los quants estáticos están disponibles en un repositorio hermano.

La relevancia de este archivo radica en que permite a los desarrolladores crear cuantizaciones personalizadas del modelo TNG-V8 con mejor calidad que las cuantizaciones estáticas, especialmente en los rangos de baja precisión (Q2, Q3, IQ2, IQ3). Es una pieza intermedia en el flujo de trabajo de despliegue local de modelos grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4, encoder-free) |
| Parametros totales | 12B (nominal, segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma 4 12B soporta hasta 128k tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | No incluye quants; solo archivo imatrix. Los quants estaticos (Q2_K, Q4_K, IQ3, etc.) estan en el repositorio hermano |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con enlace a la licencia especifica de Gemma 4) |
| Formato de pesos | GGUF (archivo imatrix) |

Nota: el dato de "parametros totales" en safetensors (1.857.864) corresponde al tamano del archivo imatrix en bytes, no al numero de parametros del modelo. El modelo base tiene 12B parametros segun su denominacion.

## Arquitectura y entrenamiento

El modelo base `nightmedia/gemma-4-12B-TNG-V8` es un fine-tune de Gemma 4 12B, la familia de modelos abiertos de Google DeepMind. Gemma 4 12B es un modelo multimodal sin encoder que procesa directamente texto, audio e imagenes, con una arquitectura transformer estandar pero optimizada para eficiencia en hardware local. El fine-tune anade capacidades especificas de generacion de codigo y una tematica particular (Star Trek) segun los tags del repositorio.

El proceso de cuantizacion realizado por mradermacher utiliza la tecnica imatrix (importance matrix), que calcula la distribucion de importancia de los pesos del modelo original para guiar la cuantizacion. Esto permite que las cuantizaciones de baja precision (como IQ2 o Q3) mantengan una mejor perplejidad en comparacion con metodos estaticos. El archivo imatrix se genera ejecutando el modelo en un conjunto de datos de calibracion y registrando las activaciones, lo que produce una matriz que luego se usa durante la conversion a GGUF.

No se dispone de informacion detallada sobre el dataset de entrenamiento del fine-tune ni sobre el uso de tecnicas como RLHF o DPO. La model card solo indica que es un fine-tune con tags de coding y startrek.

## Capacidades

- Generacion de texto y codigo: el modelo base Gemma 4 12B es competente en tareas de programacion, y el fine-tune TNG-V8 esta especificamente orientado a coding.
- Multimodalidad nativa: al estar basado en Gemma 4 12B, el modelo puede procesar imagenes, audio y video, aunque esta capacidad depende de los archivos mmproj que se encuentran en el repositorio de quants estaticos.
- Razonamiento y comprension contextual: con una ventana de contexto de hasta 128k tokens (segun especificaciones publicas de Gemma 4 12B), puede manejar documentos largos y conversaciones multi-turno.
- Tool calling: no confirmado en la informacion proporcionada, pero es una capacidad comun en la familia Gemma 4.
- Idioma: solo ingles segun la model card.

## Casos de uso

- Creacion de cuantizaciones personalizadas: el archivo imatrix permite a los desarrolladores generar sus propios quants GGUF con la herramienta `llama.cpp` o `gguf-my-repo`, ajustando el nivel de compresion segun sus necesidades de VRAM.
- Despliegue local de un asistente de codigo: una vez cuantizado, el modelo puede ejecutarse en una GPU de consumo (16 GB VRAM) para autocompletar codigo, generar funciones o explicar fragmentos, gracias a su fine-tune especifico.
- Prototipado de aplicaciones multimodales: con los archivos mmproj adecuados, el modelo puede procesar entradas de imagen o audio, por ejemplo para generar descripciones de capturas de pantalla o transcribir y resumir audio.
- Experimentacion con cuantizacion de baja precision: los investigadores pueden comparar la calidad de diferentes tipos de quant (IQ2, Q3, Q4) utilizando el imatrix como referencia para medir la degradacion.
- Integracion en pipelines de CI/CD: el modelo cuantizado puede servir como agente de generacion de codigo en entornos de integracion continua, siempre que se respete la licencia Apache 2.0.
- Desarrollo de chatbots tematicos: el fine-tune con tematica Star Trek permite crear asistentes conversacionales con un estilo y conocimiento especifico de esa franquicia, aunque limitado al ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones. Se recomienda consultar la documentacion oficial de Gemma 4 12B para conocer el rendimiento del modelo base, y realizar pruebas propias con el fine-tune cuantizado.

## Requisitos de hardware

- Este repositorio en particular no requiere hardware especifico, ya que solo contiene un archivo imatrix de 1,8 MB.
- Para el modelo cuantizado completo (disponible en el repositorio estatico), se estima:
  - VRAM minima: 8 GB para cuantizaciones Q4_K_S (aproximadamente 7-8 GB de pesos).
  - VRAM recomendada: 16 GB para cuantizaciones Q6_K o Q8_0, permitiendo ademas el procesamiento multimodal.
  - GPU compatibles: RTX 3060/4060 (12-16 GB), RTX 4090, A100, H100, o Apple Silicon con 16 GB unificados.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con adaptacion para GGUF), o el servidor local de Google para Gemma 4.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma 4 12B (base) | 12B | 128k | Apache 2.0 | safetensors | Modelo original de Google, multimodal |
| nightmedia/gemma-4-12B-TNG-V8 | 12B | no disponible | Apache 2.0 | safetensors | Fine-tune para coding y Star Trek |
| mradermacher/gemma-4-12B-TNG-V8-i1-GGUF | 12B (nominal) | no disponible | Apache 2.0 | GGUF (imatrix) | Archivo imatrix para cuantizacion |
| mradermacher/gemma-4-12B-TNG-V8-GGUF | 12B | no disponible | Apache 2.0 | GGUF (quants) | Quants estaticos del mismo modelo |

No se dispone de datos de rendimiento comparativo entre estos modelos. La eleccion entre ellos dependera de si se necesita el modelo original, el fine-tune o una cuantizacion especifica.

## Limitaciones y advertencias

- El archivo imatrix no es un modelo ejecutable: no se puede cargar directamente en un runtime; debe usarse como entrada para el proceso de cuantizacion.
- El modelo base solo soporta ingles, lo que limita su uso en aplicaciones multilingues.
- El fine-tune TNG-V8 puede presentar sesgos relacionados con la tematica Star Trek, como un vocabulario o estilo de respuesta particular que no es adecuado para contextos generales.
- Al ser una cuantizacion, existe una degradacion de calidad respecto al modelo original, especialmente en tareas de razonamiento complejo o generacion de codigo largo.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la licencia especifica de Gemma 4 (enlazada en la model card) para confirmar restricciones adicionales.
- No se han publicado evaluaciones de seguridad o alucinacion para este fine-tune concreto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma-4-12B-TNG-V8-i1-GGUF
- Modelo base (nightmedia): https://huggingface.co/nightmedia/gemma-4-12B-TNG-V8
- Quants estaticos: https://huggingface.co/mradermacher/gemma-4-12B-TNG-V8-GGUF
- Pagina de ayuda para descargas: https://hf.tst.eu/model#gemma-4-12B-TNG-V8-i1-GGUF
- Guia de Gemma 4 12B (Google Developers Blog): https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
- Introduccion a Gemma 4 12B (Google Keyword): https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Pagina oficial de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
