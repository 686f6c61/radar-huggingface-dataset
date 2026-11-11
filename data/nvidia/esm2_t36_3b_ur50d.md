# nvidia/esm2_t36_3B_UR50D

## Resumen

ESM-2 (esm2_t36_3B_UR50D) es un modelo de lenguaje de proteínas basado en transformer, desarrollado originalmente por Meta AI (Facebook Research) y redistribuido por NVIDIA con optimizaciones de la librería TransformerEngine. Con 2.839.004.193 parámetros y 36 capas, se entrena con un objetivo de modelado de lenguaje enmascarado (masked language modelling) sobre secuencias de aminoácidos, y produce embeddings por residuo y a nivel de secuencia que sirven como base para predicción de estructura proteica y fine-tuning en tareas de biología computacional.

La versión de NVIDIA mantiene, dentro de la precisión numérica, los mismos pesos y salidas que el modelo original de Meta, pero incorpora kernels optimizados para GPUs Ampere, Hopper y Blackwell, lo que reduce tiempos de entrenamiento e inferencia frente a soluciones solo-CPU. Es relevante ahora porque permite desplegar un modelo de 3B parámetros para proteómica en infraestructura NVIDIA con aceleración nativa, manteniendo la licencia MIT permisiva del original.

El modelo no es de propósito general: no genera texto conversacional ni código, sino representaciones vectoriales de proteínas. Su ventana de entrada está limitada a 1022 aminoácidos y su uso principal es el fine-tuning supervisado y la extracción de embeddings para tareas downstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer ESM-2 (36 capas) |
| Parámetros totales | 2.839.004.193 (2,8 x 10^9) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1022 aminoácidos (secuencias más largas se truncan automáticamente) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (secuencias de aminoácidos canónicos; no es un modelo de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 46,9 GB) |
| Librería | transformers (custom_code, nv_esm) |
| Pipeline | fill-mask |
| Hardware compatible | NVIDIA Ampere, Hopper, Blackwell |
| Sistema operativo | Linux |
| Fecha de publicación | 29/07/2025 en Hugging Face |

## Arquitectura y entrenamiento

ESM-2 es un transformer encoder-only entrenado con enmascaramiento de tokens sobre secuencias de proteínas. Esta variante concreta tiene 36 capas y 2,8 mil millones de parámetros, y ha sido recompilada con TransformerEngine de NVIDIA, que introduce kernels fusionados y precisión mixta optimizada para las microarquitecturas Ampere, Hopper y Blackwell. El autor advierte que pueden aparecer diferencias numéricas menores respecto al modelo original de Meta, aunque los pesos son equivalentes dentro de la precisión.

El entrenamiento se realizó sobre UniRef90, una base de secuencias proteicas con clustering al 90 % de identidad. La model card indica un volumen de datos de entrenamiento en el rango de 1.000 millones a 10 billones de tokens, sin detallar la composición exacta ni si hubo etapas de RLHF o DPO (no aplicables a este tipo de modelo). La innovación técnica destacable es la integración de TransformerEngine para acelerar el cómputo en GPUs NVIDIA, manteniendo la paridad funcional con el checkpoint original `facebook/esm2_t36_3B_UR50D`.

## Capacidades

- Extracción de embeddings por aminoácido y a nivel de secuencia completa (hasta 1022 residuos).
- Relleno de máscaras (`fill-mask`) para predecir aminoácidos enmascarados en una secuencia proteica.
- Base para predicción de estructura tridimensional de proteínas tras fine-tuning.
- Fine-tuning supervisado en tareas downstream: clasificación de función proteica, predicción de estabilidad, anotación de variantes, etc.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No es multilingüe en sentido lingüístico: opera sobre el alfabeto de aminoácidos canónicos.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Predicción de estructura proteica: partiendo de una secuencia de aminoácidos, se extraen embeddings y se alimenta una cabeza de predicción para estimar coordenadas atómicas, aprovechando la ventana de 1022 residuos.
- Anotación funcional de proteínas: fine-tuning sobre bases tipo UniProt para clasificar familias y funciones a partir de la secuencia, usando los embeddings de secuencia como features.
- Predicción de efectos de variantes: evaluar el impacto de mutaciones puntuales comparando las likelihoods de aminoácidos en posiciones enmascaradas, útil en genómica clínica.
- Búsqueda y clustering de proteínas: generar embeddings de secuencia para indexar y agrupar proteínas por similitud semántica más allá de la identidad de secuencia.
- Ingeniería de proteínas: guiar el diseño de variantes mediante puntuaciones de plausibilidad del modelo sobre secuencias candidatas antes de su validación experimental.
- Preentrenamiento de pipelines de biología computacional: servir como encoder congelado en arquitecturas que combinan embeddings proteicos con modelos downstream de estructura o función.
- Filtrado de secuencias en metagenómica: descartar o priorizar lecturas con baja verosimilitud bajo el modelo antes de análisis más costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 5,7 GB solo para pesos; con activaciones y overhead de atención para secuencias de 1022 residuos, prever 10-16 GB.
- VRAM estimada en FP32: aproximadamente 11,4 GB solo para pesos; prever 20-30 GB en total.
- GPU recomendadas: NVIDIA A100, H100, B200 (microarquitecturas Ampere, Hopper y Blackwell soportadas oficialmente); RTX 4090 (Ada Lovelace) no figura explícitamente en la lista de compatibilidad de la model card, aunque TransformerEngine dispone de soporte para Ada en versiones recientes.
- Cabe en GPUs de consumo con 16 GB o más en FP16, siempre que se limite la longitud de secuencia y el tamaño de batch.
- Opciones de despliegue: Hugging Face Transformers con TransformerEngine; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Capas | Contexto | Licencia | Optimización NVIDIA |
|---|---|---|---|---|---|
| nvidia/esm2_t36_3B_UR50D | 2,8B | 36 | 1022 aa | MIT | Sí (TransformerEngine) |
| facebook/esm2_t36_3B_UR50D | 2,8B | 36 | 1022 aa | MIT | No |
| nvidia/esm2_t33_650M_UR50D | 650M | 33 | 1022 aa | MIT | Sí (TransformerEngine) |
| nvidia/esm2_t48_15B_UR50D | 15B | 48 | 1022 aa | MIT | Sí (TransformerEngine) |

La comparativa se limita a la propia familia ESM-2, ya que la información proporcionada no incluye otros modelos de proteínas (p. ej. ProtBERT, ProstT5) con datos verificables.

## Limitaciones y advertencias

- Entrada truncada a 1022 aminoácidos: secuencias más largas se recortan automáticamente, lo que puede degradar resultados en proteínas grandes.
- Diferencias numéricas menores respecto al checkpoint original de Meta por la optimización con TransformerEngine; conviene validar en tareas sensibles a la precisión.
- Riesgo de sesgo hacia las distribuciones de UniRef90: proteínas poco representadas en esa base pueden recibir embeddings menos fiables.
- No es un modelo generativo de texto: no debe usarse para conversación, código ni tareas de lenguaje natural.
- Aunque la licencia es MIT, el modelo se distribuye como modelo de terceros; NVIDIA no lo ha desarrollado y remite a la model card original de Meta para detalles de uso.
- Compatibilidad oficial limitada a Linux y GPUs NVIDIA Ampere/Hopper/Blackwell; el despliegue en otras plataformas no está documentado.
- No se documentan procesos de alineación ni mitigaciones de sesgo específicas, dado que el modelo no está orientado a interacción con usuarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/esm2_t36_3B_UR50D
- Modelo original de Meta: https://huggingface.co/facebook/esm2_t36_3B_UR50D
- Model card original: https://huggingface.co/facebook/esm2_t36_3B_UR50D
- Paper: https://www.biorxiv.org/content/10.1101/2022.07.20.500902v2
- Repositorio ESM (Meta): https://github.com/facebookresearch/esm
- Licencia MIT del proyecto ESM: https://github.com/facebookresearch/esm/blob/main/LICENSE
- TransformerEngine: https://github.com/NVIDIA/TransformerEngine
- Instrucciones de instalación de TransformerEngine: https://github.com/NVIDIA/TransformerEngine?tab=readme-ov-file#installation
- Notebook de fine-tuning (PyTorch): https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_language_modeling.ipynb
- Notebook de fine-tuning (TensorFlow): https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_language_modeling-tf.ipynb
- UniRef90: https://www.uniprot.org/uniref?query=%28identity%3A0.9%29
- Checkpoint 15B: https://huggingface.co/nvidia/esm2_t48_15B_UR50D
- Checkpoint 650M: https://huggingface.co/nvidia/esm2_t33_650M_UR50D
- Checkpoint 150M: https://huggingface.co/nvidia/esm2_t30_150M_UR50D
- Checkpoint 35M: https://huggingface.co/nvidia/esm2_t12_35M_UR50D
- Checkpoint 8M: https://huggingface.co/nvidia/esm2_t6_8M_UR50D
