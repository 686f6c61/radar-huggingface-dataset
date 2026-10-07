# Nikuson/t5-small-paraphraser-ao-int4wo-gs128

## Resumen

El modelo `Nikuson/t5-small-paraphraser-ao-int4wo-gs128` es una version cuantizada del modelo de parafraseo `philipp-zettl/t5-small-paraphraser`, publicado por el usuario Nikuson. Se trata de un modelo de generacion texto a texto (text2text) construido sobre la arquitectura T5-small, que resuelve la tarea concreta de reescribir oraciones y parrafos manteniendo su significado. La cuantizacion se ha realizado con la libreria TorchAO, en la modalidad Int4WeightOnly con un tamano de grupo de 128, lo que reduce drasticamente el espacio en disco y la memoria necesaria.

La relevancia de este modelo reside en su naturaleza compacta: al partir de T5-small (aproximadamente 60 millones de parametros) y aplicar cuantizacion de 4 bits, el resultado es un artefacto de unos 0,1 GB que puede ejecutarse en CPU o en cualquier GPU de consumo, sin necesidad de hardware especializado. Esta pensado para tareas de parafraseo en ingles y aleman, y se distribuye bajo licencia MIT, lo que facilita su integracion en productos comerciales.

Al estar cuantizado con TorchAO, requiere el stack de PyTorch y la propia libreria torchao para cargarse, y no se distribuye en formato GGUF ni con pesos de precision completa. Es, por tanto, una pieza orientada a experimentacion rapida, prototipado y despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5-small) |
| Parametros totales | Aproximadamente 60 millones (arquitectura t5-small) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens de entrada; hasta 128 tokens de salida en entrenamiento |
| Tipos de cuantizacion | Int4WeightOnly con group size 128 (TorchAO) |
| Idiomas soportados | Ingles (en) y aleman (de) |
| Licencia | MIT |
| Formato de pesos | no disponible (pesos cuantizados con TorchAO; repo de 0,1 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es T5, un transformer de tipo encoder-decoder con atencion completa y sesgos de posicion relativa, presentado en el paper *Exploring the Limits of Transfer Learning with a Unified Text-to-Text Framework* (arXiv:1910.09700). El modelo original `philipp-zettl/t5-small-paraphraser` se ajusto a partir de la variante t5-small, que consta de 6 capas en el encoder y 6 en el decoder, con un modelo de dimension 512 y 8 cabezas de atencion. La tarea se formula como generacion condicionada por prefijo: la entrada se construye con el patron `"paraphrase: {texto} output: "` y el modelo produce la reescritura.

El ajuste fino del modelo original uso el dataset `grammarly/medit`, filtrando exclusivamente las muestras cuya tarea fuese `paraphrasing` y cuyo idioma fuese `de` o `en`. En el preprocesado se tokenizaba la entrada con una longitud maxima de 512 tokens y las etiquetas con una longitud maxima de 128 tokens. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO; tampoco se especifican los hiperparametros de entrenamiento ni el regimen de precision. La innovacion tecnica de esta version concreta es unicamente la cuantizacion Int4WeightOnly con group size 128 aplicada mediante TorchAO, que comprime los pesos a 4 bits por parametro agrupados en bloques de 128.

## Capacidades

- Parafraseo de texto a texto en ingles y aleman, preservando el significado de la oracion original.
- Generacion condicionada por prefijo mediante el patron `"paraphrase: ... output: "`.
- Extraccion de caracteristicas (etiqueta `feature-extraction` en el Hub), utilizable para obtener representaciones del encoder.
- No soporta tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Multilingue limitado a ingles y aleman.
- No incluye modo de razonamiento (thinking), vision, audio ni ninguna otra modalidad adicional.
- Tareas de generacion con control limitado: temperatura y muestreo configurables, pero sin parametros de estilo o tono.

## Casos de uso

- Parafraseo en atencion al cliente: reescribir respuestas plantilla para evitar repeticiones literales en conversaciones, aprovechando el soporte de ingles y aleman para mercados centroeuropeos.
- Reescritura de contenidos y SEO: generar variantes de titulos, meta descripciones o parrafos para evitar contenido duplicado en sitios web, con coste de inferencia minimo.
- Aumento de datos (data augmentation): producir parafrasis de ejemplos etiquetados para ampliar datasets de clasificacion o entrenamiento de modelos mayores en ingles y aleman.
- Normalizacion de texto en pipelines de NLP: reformular entradas redundantes antes de pasarlas a un modelo de recuperacion o de resumen.
- Evaluacion de robustez: generar variantes semanticamente equivalentes de un conjunto de pruebas para medir la sensibilidad de otros modelos ante cambios superficiales en el texto.
- Prototipado en dispositivos con recursos limitados: al ocupar decimas de GB tras la cuantizacion, permite desplegar parafraseo en entornos edge, portatiles o contenedores ligeros.
- Preprocesado antiduplicado: reescribir fragmentos en herramientas de gestion documental o de deteccion de similitud textual para pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni de metricas especificas de parafraseo (por ejemplo BLEU, ROUGE o BERTScore) para este modelo cuantizado ni para el modelo original del que deriva.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB. Con pesos en int4 de 4 bits (aproximadamente 30 MB para 60 millones de parametros) mas activaciones y cache, el consumo total es minimo.
- GPU recomendadas: cualquier GPU consumer es suficiente; por ejemplo GTX 1650, RTX 3060, RTX 4090 o T4. No requiere A100 ni H100.
- Cabe sobradamente en GPU de consumo e incluso puede ejecutarse en CPU, dado su tamano reducido.
- Opciones de despliegue: `transformers` con PyTorch y TorchAO (necesario para cargar los pesos cuantizados), y Text Generation Inference (el repositorio incluye la etiqueta `endpoints_compatible`). No se distribuyen pesos en formato GGUF, por lo que llama.cpp y Ollama no son aplicables directamente con estos pesos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Nikuson/t5-small-paraphraser-ao-int4wo-gs128 | ~60 M | 512 | Int4WeightOnly gs128 | en, de | MIT | TorchAO (no disponible) |
| philipp-zettl/t5-small-paraphraser | ~60 M | 512 | no aplica (precision completa) | en, de | no disponible | no disponible |
| humarin/chatgpt_paraphraser_on_T5_base | ~220 M | 512 | no aplica (precision completa) | en | no disponible | no disponible |

No se dispone de datos de rendimiento comparado entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, idiomas y licencia.

## Limitaciones y advertencias

- Modelo de muy reducido tamano (T5-small), por lo que su calidad de parafraseo es inferior a la de modelos basados en T5-base o T5-large.
- Riesgo de alucinacion y de alterar el significado original: en parafraseo, cualquier cambio de matiz es un error funcional, y el modelo puede introducir terminos no presentes en la entrada.
- Idiomas limitados a ingles y aleman: no esta entrenado para castellano ni para otros idiomas.
- Longitud de salida acotada en entrenamiento a 128 tokens, lo que limita el parafraseo de textos largos en una sola pasada.
- La cuantizacion int4 puede degradar la calidad respecto al modelo original en precision completa; no se han publicado mediciones de esta perdida.
- Licencia MIT, lo que permite uso comercial, pero condicionada a las obligaciones de la licencia del modelo original y del dataset de entrenamiento (`grammarly/medit`), cuyos terminos deben verificarse por separado.
- Requiere la libreria TorchAO para cargar los pesos cuantizados; no es compatible directamente con runtimes que solo aceptan GGUF o safetensors estandar.
- Repositorio con 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- No se documentan sesgos especificos, evaluaciones de seguridad ni analisis de toxicidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nikuson/t5-small-paraphraser-ao-int4wo-gs128
- Modelo base: https://huggingface.co/philipp-zettl/t5-small-paraphraser
- Dataset de entrenamiento: https://huggingface.co/datasets/grammarly/medit
- Espacio de cuantizacion TorchAO: https://huggingface.co/spaces/pytorch/torchao-my-repo
- Paper de T5: https://arxiv.org/abs/1910.09700
