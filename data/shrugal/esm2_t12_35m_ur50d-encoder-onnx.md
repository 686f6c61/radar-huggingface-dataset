# Shrugal/esm2_t12_35M_UR50D-encoder-onnx

## Resumen

ESM-2 (Evolutionary Scale Modeling 2) es una familia de modelos de lenguaje de proteínas desarrollada por Meta AI (FAIR), publicada en 2022 junto con el modelo de predicción de estructura ESMFold. Este repositorio concreto, `Shrugal/esm2_t12_35M_UR50D-encoder-onnx`, es una exportación a formato ONNX del encoder de la variante más pequeña de la familia, `esm2_t12_35M_UR50D`, con 35 millones de parámetros y 12 capas transformer. El autor (`Shrugal`) no ha publicado información adicional sobre el proceso de exportación, la licencia o los idiomas soportados en la ficha del repositorio.

El modelo resuelve la tarea de representación de secuencias de aminoácidos: convierte una secuencia de proteína (en notación de una letra, UR50D hace referencia al dataset UniRef50) en embeddings contextualizados por residuo y un embedding global de la secuencia. Estos embeddings se utilizan como características para tareas downstream como predicción de estructura secundaria, clasificación de función, predicción de mutaciones y búsqueda de homólogos. La relevancia de esta variante reside en su tamaño reducido (35M) y su formato ONNX, que permiten desplegarla en CPU o GPUs modestas para inferencia de baja latencia en entornos de producción.

La arquitectura es un transformer encoder de tipo BERT con atención bidireccional y objetivo de modelado de lenguaje enmascarado (masked language modeling). El repositorio ocupa 0,4 GB, consistente con pesos en precisión FP32 (~140 MB de pesos más posibles ficheros auxiliares) o múltiples grafos ONNX para distintas configuraciones de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-style) con atención bidireccional, exportado a ONNX |
| Parametros totales | 35 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1022 residuos (+ 2 tokens especiales de inicio y fin); la familia ESM-2 admite hasta aproximadamente 1024 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el formato ONNX admite INT8 y FP16, pero no se confirman variantes publicadas) |
| Idiomas soportados | No aplica; el vocabulario es de aminoácidos (UR50D, 20 aminoácidos estándar + tokens especiales, ~33 tokens en total) |
| Licencia | No disponible en la informacion proporcionada (el modelo ESM-2 original de Meta se publica bajo licencia MIT) |
| Formato de pesos | ONNX (repo de 0,4 GB); el modelo original está en safetensors/PyTorch |
| Capas | 12 |
| Dimension del embedding | 320 (configuracion estandar de esm2_t12_35M) |
| Cabezas de atencion | 20 (configuracion estandar de esm2_t12_35M) |
| Autor de la exportacion | Shrugal |
| Descargas | 0 |
| Likes | 1 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer encoder bidireccional idéntico estructuralmente a BERT, con 12 bloques, dimensión oculta de 320 y 20 cabezas de atención. El modelo fue entrenado por Meta AI con el objetivo de masked language modeling sobre UniRef50 (UR50D), un subconjunto de UniRef50 con secuencias de proteínas no redundantes al 50% de identidad. El entrenamiento de la familia ESM-2 utilizó aproximadamente 65 millones de secuencias únicas de UniRef50 y un esquema de enmascaramiento del 15% de tokens, con un uso destacado de embeddings rotatorios (rotary embeddings) que permiten generalizar a longitudes de secuencia mayores que las vistas durante el entrenamiento. Meta aplicó además técnicas de precisión mixta (FP16) y optimizador Adam con schedule de learning rate con warmup y decaimiento lineal.

La innovación principal de ESM-2 en su conjunto es la capacidad de emergencia de estructura tridimensional a partir de atención no supervisada, y las variantes grandes (650M, 3B, 15B) alimentan la cabeza de plegamiento de ESMFold. Esta variante de 35M no incluye la cabeza de plegamiento, es un encoder "puro" que produce representaciones. El repositorio que nos ocupa es únicamente una conversión del encoder a ONNX: no hay evidencia en la información proporcionada de que se hayan modificado los pesos, recortado el vocabulario ni aplicado técnicas de destilación o cuantización adicionales. Se desconoce si el grafo ONNX incluye la cabeza de masked language modeling o solo las representaciones finales.

## Capacidades

- Generacion de embeddings contextualizados por residuo (`last_hidden_state`) y un embedding agregado de secuencia, utilizables como caracteristicas para clasificacion, regresion y clustering de proteinas.
- Prediccion de tokens enmascarados (masked language modeling) si el grafo ONNX exportado conserva dicha cabeza; en caso contrario, la capacidad se limita a representaciones.
- Inferencia rapida en CPU y GPU gracias al formato ONNX, sin dependencia de PyTorch en tiempo de ejecucion.
- Representaciones sensibles a la estructura tridimensional, incluso sin supervision explicita de estructura (propiedad emergente descrita en el paper de ESM-2).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de lenguaje natural: no es un modelo conversacional.
- No soporta vision, audio ni modalidades distintas de las secuencias de aminoacidos.
- Multilingueismo no aplica: el vocabulario es puramente biologico (aminoacidos y tokens especiales).

## Casos de uso

- Prediccion de estructura secundaria de proteinas: se extraen los embeddings por residuo y se entrena una cabeza ligera (por ejemplo, una CNN o un MLP) para predecir helices alfa, hojas beta y bucles. El modelo aporta contexto evolutivo sin necesidad de alineamientos multiples.
- Prediccion del efecto de mutaciones (variant effect prediction): se comparan las probabilidades asignadas por la cabeza MLM a la secuencia original y a la mutada; la diferencia de log-verosimilitud sirve como puntuacion de patogenicidad en proteinas humanas.
- Clasificacion funcional de proteinas: los embeddings de secuencia se usan como entrada a clasificadores para asignar familias enzimaticas (EC numbers) o localizacion subcelular, aprovechando que el modelo ha visto UniRef50.
- Busqueda de homologos y clustering: los embeddings agregados permiten agrupar secuencias similares sin depender de BLAST, util en metagenomica donde muchas secuencias no tienen anotacion.
- Anotacion a escala de genomas: al ser un modelo de 35M y exportado a ONNX, se puede ejecutar en CPU sobre lotes grandes de secuencias, integrandose en pipelines de anotacion funcional de genomas recien secuenciados.
- Ingenieria de proteinas asistida: se emplean las puntuaciones de la cabeza MLM para priorizar disenos de secuencias (por ejemplo, en mutagénesis dirigida) antes de validacion experimental.
- Fine-tuning para tareas especificas: el encoder sirve como backbone inicial para ajuste fino supervisado en tareas como prediccion de estabilidad termica o afinidad de union, con un coste computacional bajo gracias a su tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas propias y la ficha de HuggingFace no aporta comparaciones. Los resultados oficiales de la familia ESM-2 (por ejemplo, en prediccion de estructura secundaria o variant effect prediction) corresponden al paper original de Lin et al. (2022), pero no se dispone aqui de cifras verificadas para esta exportacion ONNX concreta.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: por debajo de 1 GB para lotes pequenos (los pesos ocupan aproximadamente 140 MB; el resto es memoria de activaciones y del grafo ONNX).
- VRAM estimada en FP16: aproximadamente 70 MB de pesos, holgadamente por debajo de 1 GB incluyendo activaciones.
- Cabe en cualquier GPU consumer: GTX 1050 Ti, GTX 1650, RTX 3060, RTX 4090, e incluso en CPU moderna (x86 con AVX2 o ARM con NEON) con latencias de milisegundos por secuencia corta.
- GPU recomendadas para despliegue a gran escala: T4, L4, A10, A100 o H100 si se procesan millones de secuencias en paralelo; para uso individual, cualquier GPU con al menos 2 GB de VRAM es suficiente.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), TensorRT (previa conversion desde ONNX), OpenVINO para CPU Intel, y servidores de inferencia compatibles con ONNX (por ejemplo, Triton Inference Server). El modelo original en PyTorch se puede servir con TorchServe o HuggingFace Transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia cualitativa, un modelo de 35M en ONNX Runtime sobre CPU moderna suele procesar decenas de secuencias por segundo, pero no se dispone de cifras medidas para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| Shrugal/esm2_t12_35M_UR50D-encoder-onnx (este) | 35M | ~1022 residuos | ONNX | no disponible |
| facebook/esm2_t12_35M_UR50D (original) | 35M | ~1022 residuos | safetensors / PyTorch | MIT (segun Meta) |
| facebook/esm2_t33_650M_UR50D | 650M | ~1022 residuos | safetensors / PyTorch | MIT (segun Meta) |
| Rostlab/prot_bert_bfd | 420M | 512 residuos | PyTorch | no disponible en la informacion proporcionada |

La diferencia clave frente al modelo original es el formato de pesos (ONNX frente a safetensors) y la ausencia de una ficha con licencia explicita. Frente a variantes mayores como esm2_t33_650M, la de 35M sacrifica calidad de representacion a cambio de velocidad y huella de memoria reducida. ProtBert, entrenado sobre BFD, es un competidor directo pero con contexto limitado a 512 residuos y un tamano casi doce veces mayor.

## Limitaciones y advertencias

- El repositorio no declara licencia. Antes de un uso comercial es imprescindible verificar la licencia de la exportacion y de los pesos originales; Meta publica ESM-2 bajo MIT, pero la conversion ONNX puede tener condiciones distintas no documentadas.
- El autor no ha publicado detalles de la conversion (opset de ONNX, si se incluye la cabeza MLM, si se ha cuantizado). Cualquier uso en produccion deberia validar numericamente el grafo frente al modelo PyTorch original.
- Modelo especializado en proteinas: no genera lenguaje natural, no responde a instrucciones y no admite tool calling. No puede usarse como LLM generico.
- La longitud maxima de entrada ronda los 1022 residuos; secuencias mas largas requieren truncamiento o troceado, lo que puede degradar la calidad de las representaciones en el extremo C-terminal.
- Los embeddings pueden heredar sesgos del dataset UniRef50, que esta sesgado hacia proteinas bien estudiadas de organismos modelo y hacia familias sobrerrepresentadas.
- Riesgo de alucinacion en sentido biologico: la cabeza MLM puede asignar alta probabilidad a aminoacidos que no existen en la naturaleza para una posicion dada; las puntuaciones deben interpretarse con cautela.
- La variante de 35M ofrece representaciones menos precisas que las variantes de 650M, 3B o 15B; para tareas sensibles a la estructura tridimensional conviene evaluar el salto de calidad antes de optar por la version pequena.
- El repositorio tiene 0 descargas y 1 like, por lo que carece de validacion comunitaria amplia; la reproducibilidad de la exportacion no esta garantizada.
- No hay datos publicados de rendimiento ni de estabilidad numerica en distintos runtimes de ONNX.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Shrugal/esm2_t12_35M_UR50D-encoder-onnx
- Modelo original de Meta: https://huggingface.co/facebook/esm2_t12_35M_UR50D
- Paper de ESM-2 y ESMFold (Lin et al., 2022): https://www.biorxiv.org/content/10.1101/2022.07.20.500902v1
- Repositorio oficial de ESM en GitHub (Meta): https://github.com/facebookresearch/esm
- Documentacion de ONNX Runtime: https://onnxruntime.ai/
