# hellnahbru/esm2_t12_35M_UR50D-preserved-20261029

## Resumen

ESM-2 (Evolutionary Scale Modeling 2) es un modelo de lenguaje de proteínas desarrollado por Meta AI (Facebook AI Research) y publicado originalmente en 2022. Este repositorio concreto, `hellnahbru/esm2_t12_35M_UR50D-preserved-20261029`, es una repetición (mirror) del checkpoint oficial `facebook/esm2_t12_35M_UR50D`, el más pequeño de la familia ESM-2 de 12 capas con aproximadamente 35 millones de parámetros (33.995.044 reales según los pesos en safetensors). El modelo está entrenado con un objetivo de modelado de lenguaje enmascarado (masked language modelling) sobre secuencias de proteínas, lo que le permite aprender representaciones contextuales de aminoácidos útiles para una amplia gama de tareas de biología computacional.

La relevancia de este checkpoint radica en su tamaño reducido: con ~34 M de parámetros y un repositorio de 0,4 GB, es viable para inferencia y ajuste fino en hardware modesto (incluso CPU o GPU de consumo), lo que lo convierte en una opción práctica para experimentación, prototipado y tareas donde el coste computacional es una restricción. No es un modelo generativo de texto conversacional ni un LLM: es un encoder de proteínas que produce embeddings contextuales por residuo y una representación global de la secuencia.

Este repositorio concreto tiene un uso muy limitado (20 descargas, 0 likes) y parece ser una copia de preservación del checkpoint oficial, por lo que para uso en producción se recomienda acudir al repositorio original de Meta. La licencia MIT facilita su uso comercial, aunque conviene verificar las condiciones del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-like) con embeddings rotatorios, 12 capas |
| Parametros totales | 33.995.044 (dato real de safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo oficial ESM-2 admite secuencias de hasta 1022 residuos, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | No aplica (modelo de secuencias de proteínas en alfabeto UR50D, 20 aminoácidos + tokens especiales) |
| Licencia | MIT |
| Formato de pesos | safetensors (tambien compatibles con PyTorch y TensorFlow segun tags) |

## Arquitectura y entrenamiento

ESM-2 es un transformer encoder de tipo BERT con atención bidireccional y embeddings rotatorios (rotary position embeddings), entrenado con un objetivo de masked language modelling sobre secuencias de proteínas. Este checkpoint concreto (`t12_35M_UR50D`) tiene 12 capas y ~34 M de parámetros, y está entrenado sobre el dataset UniRef50 (UR50D en el nombre). El modelo produce representaciones contextuales por residuo (hidden states de dimensión 480 en esta variante) y un embedding global de la secuencia.

El entrenamiento original de ESM-2 se describe en el paper de Lin et al. (2022), que documenta el uso de un corpus masivo de secuencias de proteínas y una arquitectura escalable desde 8 M hasta 15 B de parámetros. No se dispone en la información proporcionada de detalles sobre número exacto de tokens de entrenamiento, composición del dataset más allá de UniRef50, ni si hubo etapas de RLHF/DPO (no aplicables a un modelo de proteínas). La innovación principal de la familia ESM-2 es la capacidad de generar embeddings de alta calidad que superan a modelos anteriores (ESM-1b) en tareas de predicción de estructura y función, y su uso como base para fine-tuning en tareas downstream.

## Capacidades

- Generación de embeddings contextuales por residuo para secuencias de proteínas (20 aminoácidos estándar, alfabeto UR50D).
- Representación global de la secuencia (pooling del token `<cls>`) útil para clasificación a nivel de proteína.
- Predicción de tokens enmascarados (masked language modelling): dado un contexto, estima la distribución sobre aminoácidos en posiciones enmascaradas.
- Base para fine-tuning en tareas de predicción de estructura secundaria, localización subcelular, estabilidad proteica, interacciones proteína-proteína, etc.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un LLM).
- No tiene capacidades multilingües en el sentido de lenguajes naturales; su "lenguaje" es el alfabeto de aminoácidos.
- No dispone de modo thinking, visión ni audio.
- Compatible con PyTorch y TensorFlow según los tags del repositorio.

## Casos de uso

- Predicción de estructura secundaria de proteínas: se extraen los embeddings por residuo del encoder y se entrena una cabeza de clasificación ligera (p. ej. MLP) para predecir hélices alfa, láminas beta y bucles. El tamaño reducido permite iterar rápido en GPU de consumo.
- Clasificación de localización subcelular: usando el embedding global de la secuencia como entrada a un clasificador, se puede predecir dónde se localiza una proteína en la célula; útil en pipelines de anotación funcional.
- Detección de mutaciones de efecto deleterious: comparando embeddings de secuencias wild-type y mutantes, o fine-tuning con datos de fitness, el modelo puede priorizar variantes en estudios de genómica clínica.
- Búsqueda y agrupamiento de proteínas por similitud: los embeddings globales permiten clustering y recuperación semántica de secuencias sin necesidad de alineamiento múltiple, acelerando análisis de familias proteicas.
- Filtrado y priorización en pipelines de diseño de proteínas: evaluar la "naturalidad" de secuencias generadas por modelos generativos mediante la likelihood del masked LM o scores de embeddings.
- Prototipado educativo y de investigación: al caber en CPU/GPU modesta y con licencia MIT, es adecuado para cursos, notebooks y experimentos reproducibles de protein language modelling.
- Extracción de features para modelos downstream en entornos con recursos limitados: sustituye a checkpoints más grandes (650M, 3B) cuando el presupuesto de cómputo o memoria es reducido, aceptando una pérdida moderada de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original de ESM-2 remite al paper (Lin et al., 2022) para métricas comparativas entre checkpoints, pero este repositorio concreto no incluye tablas de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: ~136 MB solo para pesos (34 M × 4 bytes), más activaciones; en la práctica cabe holgadamente en cualquier GPU con ≥1 GB.
- VRAM estimada en FP16/BF16: ~68 MB para pesos; adecuado para GPUs muy modestas.
- GPU recomendadas: cualquier GPU moderna es suficiente; RTX 3060/4060, T4, e incluso iGPU. Para fine-tuning con batches grandes, una RTX 3090/4090 o A100 aporta margen.
- Cabe en GPU de consumo: sí, en todas las GPU consumer actuales (GTX 1650 en adelante) y en CPU.
- Opciones de despliegue: `transformers` (PyTorch/TensorFlow), exportación a ONNX, integración en pipelines de `fair-esm`. No se documentan variantes GGUF/llama.cpp ni Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada; con 12 capas y ~34 M de parámetros se espera un throughput muy alto en GPU (miles de secuencias cortas por segundo en batch), pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| esm2_t12_35M_UR50D (este) | ~34 M | 12 | No disponible en esta ficha | MIT | Hugging Face |
| esm2_t6_8M_UR50D | ~8 M | 6 | No disponible | MIT | Hugging Face (facebook) |
| esm2_t30_150M_UR50D | ~150 M | 30 | No disponible | MIT | Hugging Face (facebook) |
| esm2_t33_650M_UR50D | ~650 M | 33 | No disponible | MIT | Hugging Face (facebook) |
| esm2_t36_3B_UR50D | ~3 B | 36 | No disponible | MIT | Hugging Face (facebook) |
| esm2_t48_15B_UR50D | ~15 B | 48 | No disponible | MIT | Hugging Face (facebook) |

La comparativa de rendimiento entre checkpoints (precisión en tareas downstream) se documenta en el paper original, no en este repositorio. En general, los checkpoints más grandes obtienen mejores métricas a costa de mucho más cómputo y memoria.

## Limitaciones y advertencias

- Es un encoder de proteínas, no un modelo de lenguaje natural: no genera texto, no responde preguntas ni ejecuta instrucciones.
- Sesgos derivados del dataset de entrenamiento (UniRef50): sobrerrepresentación de proteínas bien estudiadas y sesgo hacia organismos modelo; puede infrarepresentar familias poco caracterizadas.
- Riesgo de sobreajuste en tareas downstream con pocos datos si se hace fine-tuning completo; conviene usar cabezas ligeras o congelar capas.
- La longitud máxima de secuencia no se confirma en esta ficha; para secuencias largas verificar el límite del checkpoint oficial antes de usarlo en producción.
- Este repositorio es una copia no oficial con muy pocas descargas y sin mantenimiento aparente; para producción se recomienda el repositorio `facebook/esm2_t12_35M_UR50D`.
- La licencia MIT permite uso comercial, pero conviene revisar las condiciones del modelo original y citar el paper correspondiente.
- No apto para diagnóstico clínico directo sin validación experimental; las predicciones son hipótesis computacionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hellnahbru/esm2_t12_35M_UR50D-preserved-20261029
- Checkpoint oficial: https://huggingface.co/facebook/esm2_t12_35M_UR50D
- Paper ESM-2 (Lin et al., 2022): https://www.biorxiv.org/content/10.1101/2022.07.20.500902v2
- Notebook PyTorch de fine-tuning: https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_language_modeling.ipynb
- Notebook TensorFlow de fine-tuning: https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_language_modeling-tf.ipynb
