# hellnahbru/esm2_t36_3B_UR50D-preserved-20261029

## Resumen

ESM-2 (Evolutionary Scale Modeling 2) es un modelo de lenguaje de proteínas desarrollado por Meta AI (Facebook Research) y entrenado con un objetivo de modelado de lenguaje enmascarado sobre secuencias de aminoácidos. La versión aquí descrita, `esm2_t36_3B_UR50D`, corresponde al checkpoint de 36 capas y aproximadamente 3.000 millones de parámetros, el segundo más grande de la familia, solo por detrás del modelo de 15B. Este repositorio concreto (`hellnahbru/esm2_t36_3B_UR50D-preserved-20261029`) es una copia o reempaquetado del checkpoint original de Meta publicado en Hugging Face, con licencia MIT.

El modelo resuelve tareas de representación y predicción sobre secuencias de proteínas: desde la inferencia de estructura y función hasta la predicción de efectos de mutaciones o la generación de embeddings para clasificación y clustering. Su relevancia radica en que ofrece un rendimiento cercano al estado del arte en tareas de proteínas sin necesidad de alineamientos múltiples (MSA), lo que simplifica enormemente los pipelines bioinformáticos frente a alternativas como AlphaFold.

Arquitectura transformer tipo BERT (encoder-only) con atención completa, tokenización a nivel de residuo (vocabulario de 33 tokens, incluyendo los 20 aminoácidos estándar, ambiguos y tokens especiales) y un tamaño de repositorio de 22,7 GB en pesos. Este repositorio concreto tiene un uso muy limitado (18 descargas, 0 likes) y no aporta información adicional sobre el proceso de entrenamiento o fine-tuning respecto al checkpoint original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (estilo BERT), 36 capas |
| Parámetros totales | ~3.000 millones (3B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo original admite secuencias de hasta 1.024 residuos en la práctica; no confirmado en la información proporcionada) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (secuencias de proteínas; vocabulario de aminoácidos) |
| Licencia | MIT |
| Formato de pesos | PyTorch y TensorFlow (según tags del repositorio) |

## Arquitectura y entrenamiento

ESM-2 es un transformer encoder-only con 36 capas y aproximadamente 3.000 millones de parámetros, entrenado con un objetivo de masked language modeling (MLM) sobre la base de datos UniRef50 (UR50D). El modelo tokeniza las secuencias a nivel de residuo, con un vocabulario reducido que incluye los 20 aminoácidos canónicos, tokens de aminoácidos ambiguos y tokens especiales (máscara, padding, etc.). La información proporcionada no detalla el número exacto de tokens de entrenamiento ni la composición completa del dataset más allá de la referencia a UR50D.

El checkpoint original de Meta se publicó junto con el paper "Language models of protein sequences at the scale of evolution enable accurate structure prediction" (Lin et al., 2022), que describe cómo el escalado de modelos de lenguaje de proteínas permite obtener representaciones útiles para predicción de estructura sin MSA. No se dispone de información sobre si este repositorio concreto ha recibido fine-tuning adicional, RLHF o modificaciones respecto al checkpoint original; el nombre "preserved" sugiere una copia sin alteraciones, pero no se confirma en la model card.

## Capacidades

- Modelado de lenguaje enmascarado sobre secuencias de proteínas: predice residuos enmascarados a partir del contexto.
- Generación de embeddings contextuales por residuo y por secuencia, útiles para tareas downstream.
- Fine-tuning para clasificación de proteínas (familia, localización subcelular, función enzimática).
- Predicción de efectos de mutaciones (variant effect prediction) mediante puntuaciones de verosimilitud.
- Predicción de estructura de proteínas (especialmente en combinación con ESMFold, aunque este checkpoint por sí solo no incluye el módulo de plegamiento).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica (no procesa lenguaje natural).
- Capacidades especiales: no dispone de modo "thinking", visión ni audio.

## Casos de uso

- Predicción de estructura de proteínas: los embeddings del modelo se pueden alimentar a ESMFold o a cabezas de predicción de estructura para obtener coordenadas atómicas; el tamaño de 3B ofrece un equilibrio entre precisión y coste computacional.
- Anotación funcional de proteínas: fine-tuning sobre datasets como GO (Gene Ontology) para predecir función molecular, proceso biológico o componente celular a partir de la secuencia.
- Predicción de efectos de variantes (VEP): puntuar mutaciones puntuales comparando la verosimilitud de la secuencia wild-type frente a la mutante, útil en genómica clínica.
- Clustering y búsqueda de homólogos: extraer embeddings por secuencia y aplicar técnicas de similitud vectorial para agrupar proteínas por familia sin necesidad de alineamientos múltiples.
- Diseño de proteínas asistido: usar las puntuaciones del modelo como función de verosimilitud en pipelines de generación o filtrado de secuencias candidatas.
- Detección de proteínas mal plegadas o anomalías: comparar la verosimilitud de secuencias naturales frente a artificiales para identificar regiones atípicas.
- Extracción de características para modelos downstream: usar las representaciones del modelo como entrada a clasificadores ligeros en lugar de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas concretas de MMLU, HumanEval, GSM8K ni equivalentes para proteínas (como perplexity en UniRef50 o precisión en tareas de estructura). El paper original de ESM-2 reporta resultados en predicción de estructura y VEP, pero no se dispone de esos datos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 12 GB solo para pesos (3B × 4 bytes), más memoria para activaciones y secuencias largas; en la práctica se recomienda al menos 16-24 GB.
- VRAM estimada en FP16/BF16: aproximadamente 6 GB para pesos, con 12-16 GB recomendados para batches y secuencias de hasta 1.024 residuos.
- GPU recomendadas: A100 (40/80 GB) o H100 para fine-tuning con batches grandes; RTX 4090 (24 GB) o A6000 (48 GB) para inferencia y fine-tuning ligero.
- ¿Cabe en consumer GPU? Sí, en FP16 cabe en GPUs de 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4090), aunque con limitaciones de batch size y longitud de secuencia.
- Opciones de despliegue: PyTorch nativo (transformers), TensorFlow (según tags), exportación a ONNX; no se dispone de confirmación de soporte en vLLM, llama.cpp u Ollama (no aplica habitualmente a modelos de proteínas).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| esm2_t36_3B_UR50D (este repo) | ~3B | No disponible | MIT | Hugging Face (copia de terceros) |
| esm2_t48_15B_UR50D (Meta) | 15B | No disponible | MIT | Hugging Face (oficial) |
| esm2_t33_650M_UR50D (Meta) | 650M | No disponible | MIT | Hugging Face (oficial) |
| esm2_t30_150M_UR50D (Meta) | 150M | No disponible | MIT | Hugging Face (oficial) |

La comparativa se limita a la propia familia ESM-2, ya que no se dispone de datos de benchmarks ni de otros modelos de proteínas en la información proporcionada. El checkpoint de 3B ofrece un compromiso entre el 650M (más ligero, menor precisión) y el 15B (mayor precisión, requisitos de hardware muy superiores).

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó sobre UniRef50, por lo que puede estar sesgado hacia proteínas bien representadas en bases de datos (organismos modelo, familias abundantes) y rendir peor en proteínas raras o de organismos poco secuenciados.
- Riesgo de alucinación: como modelo generativo de secuencias, puede producir residuos plausibles pero biológicamente inválidos; no debe usarse como sustituto de validación experimental.
- Limitaciones de contexto o idioma: no procesa lenguaje natural; la longitud máxima de secuencia no está confirmada en la información disponible.
- Restricciones de licencia: licencia MIT, permite uso comercial y modificación con atribución; sin embargo, al ser una copia de terceros, se recomienda verificar la procedencia y el checkpoint original de Meta.
- Caveats para producción: este repositorio concreto tiene muy pocas descargas (18) y ningún like, lo que sugiere falta de validación comunitaria; se recomienda usar el repositorio oficial de Meta (`facebook/esm2_t36_3B_UR50D`) para producción. No se dispone de información sobre el proceso de "preservación" ni sobre posibles alteraciones respecto al original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hellnahbru/esm2_t36_3B_UR50D-preserved-20261029
- Checkpoint original de Meta: https://huggingface.co/facebook/esm2_t36_3B_UR50D
- Paper de ESM-2: https://www.biorxiv.org/content/10.1101/2022.07.20.500902v2
- Notebook de fine-tuning en PyTorch: https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_language_modeling.ipynb
- Notebook de fine-tuning en TensorFlow: https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_language_modeling-tf.ipynb
