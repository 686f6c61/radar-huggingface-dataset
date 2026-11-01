# hellnahbru/esm2_t33_650M_UR50D-preserved-20261029

## Resumen

ESM-2 (Evolutionary Scale Modeling 2) es una familia de modelos de lenguaje de proteinas desarrollada por Meta AI (Facebook AI Research) y entrenada con un objetivo de modelado de lenguaje enmascarado (masked language modelling) sobre secuencias de aminoacidos. La ficha que nos ocupa, `hellnahbru/esm2_t33_650M_UR50D-preserved-20261029`, es un espejo (mirror) del checkpoint oficial `facebook/esm2_t33_650M_UR50D` de 33 capas y aproximadamente 650 millones de parametros, publicado por el usuario hellnahbru bajo licencia MIT. El modelo esta pensado para fine-tuning en tareas que toman secuencias de proteinas como entrada, como prediccion de estructura, anotacion funcional o prediccion de efectos de mutaciones.

El checkpoint concreto cuenta con 652.358.616 parametros reales segun los pesos en safetensors, y el repositorio ocupa 7,8 GB. Se distribuye en formatos PyTorch, TensorFlow y safetensors, lo que facilita su integracion tanto en pipelines de Hugging Face Transformers como en entornos de investigacion que requieran pesos en formato abierto.

Su relevancia actual radica en que es un modelo de referencia consolidado en biologia computacional (protein language model, PLM), con una arquitectura transformer encoder y un vocabulario especifico de aminoacidos (UR50D) que lo hacen directamente aplicable a tareas de representacion de proteinas sin necesidad de alineamientos multiples. Al ser un espejo de un checkpoint oficial con licencia MIT, resulta util para reproducibilidad y para entornos donde se requiera una copia estable con fecha fija.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-like) con atencion bidireccional, entrenado con masked language modelling |
| Parametros totales | 652.358.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ESM-2 soporta secuencias de hasta 1022 residuos en la implementacion oficial de Hugging Face, aunque no se explicita en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos en fp32/fp16 segun safetensors; no se documentan cuantizaciones GGUF/INT8 en la informacion) |
| Idiomas soportados | no disponible (el modelo opera sobre secuencias de aminoacidos, no sobre lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (pytorch_model.bin), TensorFlow (tf_model.h5) |

## Arquitectura y entrenamiento

ESM-2 es un transformer encoder de tipo BERT con atencion bidireccional, disenado especificamente para secuencias de proteinas. El modelo utiliza un vocabulario de aminoacidos (UR50D) y se entrena con un objetivo de masked language modelling, en el que se enmascaran residuos aleatoriamente y el modelo debe predecirlos a partir del contexto. El checkpoint de 33 capas y 650M de parametros es uno de los tamanos intermedios de la familia, que va desde 8M hasta 15B de parametros.

Segun la model card, el entrenamiento se realizo sobre un gran corpus de secuencias de proteinas (UniRef50, segun el paper asociado), aunque el numero exacto de tokens y la composicion detallada del dataset no se especifican en la informacion proporcionada. No se documenta el uso de RLHF ni DPO; el entrenamiento es puramente auto-supervisado con MLM. La innovacion principal de ESM-2 respecto a ESM-1 es la incorporacion de informacion estructural en el entrenamiento (en variantes posteriores) y una mejora sustancial en la prediccion de estructuras de proteinas a partir de la secuencia, especialmente en la variante de 15B.

## Capacidades

- Generacion de representaciones contextuales de secuencias de proteinas (embeddings por residuo y por secuencia).
- Prediccion de residuos enmascarados (masked language modelling) sobre secuencias de aminoacidos.
- Fine-tuning para tareas downstream: prediccion de estructura secundaria y terciaria, prediccion de contacto entre residuos, anotacion funcional, prediccion de solubilidad y estabilidad.
- Prediccion de efectos de mutaciones (variant effect prediction) mediante puntuaciones de verosimilitud de secuencias mutadas.
- No soporta tool calling ni function calling (no es un modelo de lenguaje natural).
- No soporta agentes ni razonamiento multi-step en el sentido de LLMs.
- Capacidades multilingues no aplicables: opera sobre el alfabeto de aminoacidos, no sobre idiomas naturales.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Prediccion de estructura de proteinas: el modelo genera embeddings por residuo que alimentan cabezas de prediccion de estructura secundaria o de contacto, aprovechando el contexto bidireccional de 33 capas para capturar dependencias de largo alcance en la secuencia.
- Anotacion funcional de proteinas: fine-tuning sobre un conjunto etiquetado de funciones (por ejemplo, ontologia genica) para clasificar secuencias desconocidas, usando los embeddings del token [CLS] o el promedio de representaciones.
- Prediccion de efectos de variantes (VEP): calcular la verosimilitud de una secuencia mutada frente a la wild-type para priorizar variantes patogenicas en estudios genomicos, una aplicacion habitual de los PLM.
- Filtrado y priorizacion en diseno de proteinas: usar las puntuaciones del modelo para descartar secuencias improbables generadas por metodos generativos antes de sintesis experimental.
- Extraccion de embeddings para busqueda de similitud: indexar representaciones de secuencias en bases vectoriales para recuperar proteinas homologas o funcionalmente similares sin alineamiento multiple.
- Investigacion en biologia computacional: como baseline reproducible en estudios de representacion de proteinas, gracias a la licencia MIT y a la disponibilidad de pesos en safetensors y TensorFlow.
- Fine-tuning en tareas de clasificacion de senales de localizacion subcelular o prediccion de interacciones proteina-proteina, usando la cabeza de clasificacion sobre el token [CLS].

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas especificas de tareas de proteinas (como perplexity en UniRef50 o precision en prediccion de estructura). El paper asociado (biorxiv 2022.07.20.500902) contiene resultados, pero no se reproducen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,6 GB solo para pesos (652M parametros x 4 bytes), mas activaciones y overhead, tipicamente 4-6 GB para secuencias de longitud moderada.
- VRAM estimada en fp16: aproximadamente 1,3 GB para pesos, con un total practico de 2-4 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) para inferencia; A100 o H100 para fine-tuning con batches grandes o secuencias largas.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas (RTX 3060/4060/4090, RTX A4000) para inferencia y fine-tuning ligero.
- Opciones de despliegue: Hugging Face Transformers (PyTorch y TensorFlow), con soporte para `AutoModel` y `AutoTokenizer`; no se documenta soporte nativo en vLLM, llama.cpp u Ollama (no es un modelo generativo de texto).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| esm2_t33_650M_UR50D (este checkpoint) | 652M | no disponible | MIT | Hugging Face (espejo) | Transformer encoder, MLM sobre proteinas |
| facebook/esm2_t33_650M_UR50D | 650M | no disponible | MIT | Hugging Face (oficial) | Checkpoint original de Meta AI |
| esm2_t30_150M_UR50D | 150M | no disponible | MIT | Hugging Face | Version mas pequena, menor precision pero menor coste |
| esm2_t36_3B_UR50D | 3B | no disponible | MIT | Hugging Face | Version mas grande, mayor precision y coste |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada para establecer diferencias cuantitativas entre estos checkpoints.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena sobre UniRef50, por lo que hereda los sesgos de composicion del corpus (sobrerrepresentacion de proteinas bien estudiadas y de organismos modelo), lo que puede degradar el rendimiento en familias poco representadas.
- Riesgo de alucinacion: en tareas de prediccion de residuos enmascarados o de generacion de secuencias, el modelo puede producir aminoacidos plausibles pero biologicamente invalidos; no debe usarse como sustituto de validacion experimental.
- Limitaciones de contexto o idioma: la longitud maxima de secuencia no se documenta en la informacion; secuencias muy largas pueden requerir truncamiento o estrategias de ventana. No aplica a idiomas naturales.
- Restricciones de licencia: licencia MIT, permite uso comercial y modificacion con atribucion; sin embargo, al ser un espejo no oficial, se recomienda verificar la procedencia y contrastar con el checkpoint oficial de Meta AI.
- Caveats para produccion: el repositorio tiene solo 16 descargas y 0 likes, lo que sugiere poca validacion comunitaria; conviene verificar la integridad de los pesos (hashes) frente al checkpoint oficial antes de usarlo en pipelines criticos. La fecha de creacion (2026-10-30) es posterior a la de actualizacion, lo que puede indicar metadatos inconsistentes.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/hellnahbru/esm2_t33_650M_UR50D-preserved-20261029
- Checkpoint oficial: https://huggingface.co/facebook/esm2_t33_650M_UR50D
- Paper: https://www.biorxiv.org/content/10.1101/2022.07.20.500902v2
- Notebook PyTorch: https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_language_modeling.ipynb
- Notebook TensorFlow: https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_language_modeling-tf.ipynb
