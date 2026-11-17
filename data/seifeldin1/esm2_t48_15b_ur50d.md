# Seifeldin1/esm2_t48_15B_UR50D

## Resumen

ESM-2 (Evolutionary Scale Modeling 2) es un modelo de lenguaje de proteinas basado en transformers, desarrollado originalmente por Meta AI (Facebook Research) y entrenado con un objetivo de modelado de lenguaje enmascarado (masked language modelling) sobre secuencias de aminoacidos. Esta ficha corresponde a una reproduccion alojada por el usuario Seifeldin1 en Hugging Face, que replica el checkpoint de mayor tamano de la familia, esm2_t48_15B_UR50D, con 48 capas y aproximadamente 15.000 millones de parametros. El modelo original se describe en el articulo "Language models of protein sequences at the scale of evolution enable accurate structure prediction" (Lin et al., 2022).

El modelo resuelve el problema de representar secuencias de proteinas de forma general y transferible: genera embeddings contextuales por residuo que sirven como base para tareas de prediccion estructural, anotacion funcional, prediccion de efectos de mutaciones y clasificacion de secuencias. Es relevante porque el checkpoint de 15B parametros es el mayor de la familia ESM-2 y, combinado con ESMFold, permite predicciones de estructura tridimensional competitivas con metodos de alineamiento multiple de secuencias, sin necesidad de MSAs.

Esta copia concreta tiene 0 descargas y 0 likes en el momento de la consulta, con un repositorio de 60,5 GB y licencia MIT declarada. No se dispone de informacion adicional sobre el proceso de conversion o validacion del checkpoint por parte del autor de la reproduccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ESM-2), 48 capas |
| Parametros totales | 15B (aproximadamente 15.000 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo original ESM-2 admite secuencias de hasta 1024 residuos, aunque este dato no figura en la model card de esta copia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de secuencias de proteinas, alfabeto de aminoacidos UR50D) |
| Licencia | MIT |
| Formato de pesos | no disponible en la informacion proporcionada (el repositorio ocupa 60,5 GB y los tags indican PyTorch) |

## Arquitectura y entrenamiento

ESM-2 es un transformer encoder de tipo BERT entrenado con enmascaramiento de residuos (masked language modelling) sobre secuencias de proteinas del conjunto UniRef50 (alfabeto UR50D). El checkpoint t48 tiene 48 capas y 15.000 millones de parametros, el mayor de la familia, que incluye variantes de 8M, 35M, 150M, 650M, 3B y 15B parametros. La model card original indica que los modelos mas grandes ofrecen una precision algo superior a costa de mucho mas memoria y tiempo de entrenamiento.

La innovacion principal de la familia ESM-2 es el uso de attention con sesgo relativo y el escalado masivo del entrenamiento sobre secuencias evolutivamente diversas, lo que permite que las representaciones internas capturen informacion estructural suficiente para la prediccion de estructura 3D (via ESMFold) sin alineamientos multiples. La model card de esta copia no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; esos detalles deben consultarse en el paper de referencia. Tampoco se documenta en esta copia si los pesos se han convertido, reentrenado o modificado respecto al checkpoint original de Meta AI.

## Capacidades

- Generacion de embeddings contextuales por residuo para secuencias de proteinas.
- Relleno de residuos enmascarados (masked language modelling), como muestra el widget de la model card con una secuencia enmascarada.
- Extraccion de representaciones para fine-tuning en tareas downstream de biologia computacional.
- Prediccion de estructura de proteinas cuando se combina con ESMFold (capacidad del ecosistema ESM-2, no documentada explicitamente en esta copia).
- Soporte de tool calling / function calling: no disponible (no es un modelo conversacional).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: no aplica; el unico "idioma" es el alfabeto de aminoacidos UR50D.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Prediccion de estructura de proteinas: usar los embeddings del modelo como entrada a ESMFold o a cabezas de prediccion estructural para obtener coordenadas 3D de proteinas sin MSA. Adecuado por la profundidad de 48 capas y la riqueza de las representaciones.
- Anotacion funcional de proteinas: fine-tuning de una cabeza de clasificacion sobre los embeddings para predecir familia enzimatica, localizacion subcelular o terminos GO.
- Prediccion de efectos de mutaciones: comparar embeddings de la secuencia wild-type y de la variante para estimar el impacto funcional de sustituciones aminoacidicas en estudios de genetica clinica.
- Busqueda y agrupamiento de secuencias: generar embeddings por secuencia y aplicar similitud coseno o clustering para descubrir relaciones remotas entre proteinas que los metodos basados en alineamiento no detectan.
- Diseno de proteinas y filtrado de candidatos: usar la probabilidad de secuencia del modelo (pseudo-verosimilitud) como criterio para descartar disenos generados por otros modelos antes de su sintesis experimental.
- Ingenieria de proteinas guiada: puntuar bibliotecas de variantes con el modelo para priorizar experimentos de evolucion dirigida en laboratorio.
- Investigacion en representaciones biologicas: analisis de attention y embeddings para estudiar que informacion estructural y evolutiva codifica el modelo, con aplicaciones en interpretabilidad de modelos cientificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en precision completa (fp32) ocupa aproximadamente 60 GB, coherente con el tamano del repositorio; en fp16/bf16 se situa en torno a 30 GB, y en int8 en torno a 15 GB. Estas cifras son estimaciones a partir del numero de parametros, no datos publicados en la model card.
- GPU recomendadas: A100 80 GB o H100 80 GB para inferencia en fp16/bf16 con secuencias largas; multiples GPUs para fp32.
- Cabe en consumer GPU: no en fp16 sin cuantizacion; una RTX 4090 (24 GB) no puede alojar el modelo completo en fp16. Requiere cuantizacion agresiva o particionado, no documentados en esta copia.
- Opciones de despliegue: PyTorch nativo y Hugging Face Transformers segun los tags del repositorio; vLLM, llama.cpp, Ollama o TGI no estan documentados para este checkpoint en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| esm2_t48_15B_UR50D (esta copia) | 15B | 48 | no disponible | MIT | Hugging Face (reproduccion de Seifeldin1) |
| esm2_t36_3B_UR50D | 3B | 36 | no disponible | MIT (original) | Hugging Face (facebook) |
| esm2_t33_650M_UR50D | 650M | 33 | no disponible | MIT (original) | Hugging Face (facebook) |
| esm2_t12_35M_UR50D | 35M | 12 | no disponible | MIT (original) | Hugging Face (facebook) |

La model card original indica que los checkpoints mas grandes ofrecen una precision algo superior a costa de mucho mas memoria y tiempo de entrenamiento. No se dispone de comparativas cuantitativas de rendimiento en la informacion proporcionada.

## Limitaciones y advertencias

- Es una reproduccion de terceros (Seifeldin1) sin descargas ni likes; no hay evidencia documentada de que los pesos coincidan bit a bit con el checkpoint original de Meta AI.
- No es un modelo generativo conversacional: no admite instrucciones en lenguaje natural ni tool calling.
- Riesgo de alucinacion en el sentido habitual: no aplica, pero las predicciones biologicas pueden ser incorrectas y no deben usarse como unica evidencia en contextos clinicos o de bioseguridad.
- Sesgos conocidos: el entrenamiento sobre UniRef50 sobrerrepresenta proteinas bien estudiadas y puede infrarepresentar familias poco secuenciadas.
- Limitaciones de contexto: la longitud maxima de secuencia no esta documentada en esta copia; secuencias muy largas pueden requerir truncamiento.
- Restricciones de licencia: MIT declarada, lo que permite uso comercial segun los terminos de dicha licencia, aunque conviene verificar la procedencia de los pesos antes de un uso en produccion.
- El tamano de 60,5 GB del repositorio implica costes de almacenamiento y transferencia considerables y dificulta su despliegue en infraestructura modesta.
- No se documentan procesos de validacion, conversion ni fecha de creacion real de los pesos (la fecha indicada, 2026-11-17, es posterior a la consulta y debe tratarse con cautela).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Seifeldin1/esm2_t48_15B_UR50D
- Checkpoint original de Meta AI: https://huggingface.co/facebook/esm2_t48_15B_UR50D
- Paper de referencia (Lin et al., 2022): https://www.biorxiv.org/content/10.1101/2022.07.20.500902v2
- Notebook de fine-tuning en PyTorch: https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_language_modeling.ipynb
- Notebook de fine-tuning en TensorFlow: https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_language_modeling-tf.ipynb
