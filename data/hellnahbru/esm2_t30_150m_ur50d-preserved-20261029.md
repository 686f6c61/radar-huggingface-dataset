# hellnahbru/esm2_t30_150M_UR50D-preserved-20261029

## Resumen

ESM-2 (Evolutionary Scale Modeling 2) es una familia de modelos de lenguaje de proteínas desarrollada por Meta AI (Facebook Research) y publicada originalmente en 2022. Este repositorio concreto, `hellnahbru/esm2_t30_150M_UR50D-preserved-20261029`, es una republicación del checkpoint `esm2_t30_150M_UR50D` (30 capas, ~150 millones de parámetros) bajo licencia MIT, presumiblemente creada para preservar los pesos ante posibles cambios de disponibilidad en el repositorio original. El modelo real que contiene es, por tanto, el ESM-2 de 150M de Meta, no una variante entrenada por el autor del repositorio.

El modelo resuelve el problema del modelado de secuencias de proteínas mediante un objetivo de enmascaramiento (masked language modelling) sobre el conjunto de datos UniProt (UR50D). Se utiliza principalmente como extractor de representaciones (embeddings) y como base para fine-tuning en tareas de biología computacional: predicción de estructura secundaria, anotación funcional, predicción de variantes, etc. No es un modelo generativo conversacional ni un LLM de texto natural; su vocabulario es de aminoácidos.

Es relevante ahora por su tamaño contenido: con ~148,8 millones de parámetros reales (según los pesos en safetensors) cabe en GPUs de consumo y sirve como alternativa ligera a los checkpoints mayores de la familia (650M, 3B, 15B). La republicación con licencia MIT facilita su uso comercial y su archivado a largo plazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT (encoder, atención bidireccional), masked language modelling |
| Parametros totales | 148.798.300 (~150M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el paper original usa secuencias de hasta 1024 residuos) |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos en safetensors; no se anuncia GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (secuencias de aminoácidos en alfabeto UR50D, no idiomas naturales) |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch, TensorFlow |
| Capas | 30 |
| Dataset de entrenamiento | UniProt (UR50D) |
| Pipeline declarado | no disponible |
| Tamano del repo | 1,8 GB |

## Arquitectura y entrenamiento

ESM-2 es un transformer encoder con atención bidireccional (estilo BERT), entrenado con un objetivo de masked language modelling sobre secuencias de proteínas. Este checkpoint concreto tiene 30 capas y ~150M parámetros. El vocabulario no es de texto natural sino de aminoácidos (alfabeto UR50D), con tokens de máscara y tokens especiales para inicio, fin y relleno.

Según el paper original (Lin et al., 2022, bioRxiv), el entrenamiento se realizó sobre una gran base de secuencias de UniProt, con masking aleatorio de residuos; no se documenta en la información proporcionada el número exacto de tokens, la composición detallada del dataset ni si hubo etapas de RLHF o DPO (no aplicables en este tipo de modelo). La model card del repositorio republicado remite al paper para los detalles de arquitectura y datos, pero no aporta cifras adicionales. La innovación principal de la familia ESM-2 es la escala y la calidad de las representaciones aprendidas para proteínas, que superan a modelos anteriores en tareas de predicción estructural.

## Capacidades

- Extracción de embeddings de secuencias de proteínas (representaciones por residuo y por secuencia).
- Predicción de tokens enmascarados (masked language modelling): dado un residuo enmascarado, estima la distribución de aminoácidos posibles.
- Base para fine-tuning en tareas de biología computacional: predicción de estructura secundaria, anotación funcional, predicción de efectos de variantes, clasificación de familias proteicas.
- Generación de representaciones para búsqueda y agrupamiento de proteínas (similitud semántica en el espacio de embeddings).
- No soporta tool calling ni function calling.
- No está diseñado como agente ni para razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingües en el sentido de idiomas naturales; su "lenguaje" es el alfabeto de aminoácidos.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Predicción de estructura secundaria: se hace fine-tuning de la cabeza de clasificación sobre el encoder ESM-2 de 150M para etiquetar cada residuo como hélice, lámina o hebra; su tamaño permite entrenar en una sola GPU de consumo.
- Predicción de efectos de variantes (variant effect prediction): se calculan log-probabilidades de aminoácidos en posiciones mutadas para estimar si una variante es deletérea, usando el modelo como modelo de lenguaje de proteínas.
- Anotación funcional de proteínas: se extraen embeddings por secuencia y se entrenan clasificadores ligeros para asignar familias o funciones, aprovechando que el modelo ya captura patrones evolutivos.
- Búsqueda y agrupamiento de proteínas: los embeddings sirven para indexar bases de datos y recuperar proteínas similares por vecindad en el espacio latente, con coste de inferencia bajo gracias a los ~150M de parámetros.
- Filtrado y priorización en pipelines de diseño de proteínas: se puntúan secuencias candidatas generadas por otros métodos para descartar las improbables antes de validación experimental.
- Docencia y prototipado en biología computacional: al caber en GPUs de consumo y estar en safetensors, permite reproducir experimentos de fine-tuning en entornos académicos sin clúster.
- Archivado y reproducibilidad: la republicación con licencia MIT y pesos preservados facilita que pipelines antiguos que dependían de este checkpoint sigan funcionando.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio republicado no incluye métricas; el paper original de ESM-2 reporta resultados para la familia completa, pero no se dispone de cifras concretas de este checkpoint en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: ~0,6 GB solo para pesos (148,8M × 4 bytes), más activaciones; en la práctica, entre 1 y 2 GB según longitud de secuencia y batch.
- VRAM estimada en fp16/bf16: ~0,3 GB para pesos; inferencia cómoda por debajo de 1-2 GB con batches pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes. El modelo está pensado para caber en GPUs de consumo.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas con 4 GB o más.
- Opciones de despliegue: PyTorch nativo (transformers), TensorFlow (el repo incluye pesos TF), exportación a ONNX. No se anuncia soporte oficial de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un encoder de 30 capas y ~150M de parámetros, la inferencia es de baja latencia en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Capas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| esm2_t30_150M_UR50D (este repo) | ~150M | 30 | no disponible | MIT | HuggingFace (republicado) |
| esm2_t12_35M_UR50D | ~35M | 12 | no disponible | MIT (original de Meta) | HuggingFace |
| esm2_t33_650M_UR50D | ~650M | 33 | no disponible | MIT (original de Meta) | HuggingFace |
| esm2_t36_3B_UR50D | ~3B | 36 | no disponible | MIT (original de Meta) | HuggingFace |

La familia ESM-2 comparte arquitectura y objetivo de entrenamiento; las diferencias son de escala. Los checkpoints mayores suelen ofrecer mejor precisión en tareas de estructura y función, a costa de mucho más memoria y tiempo de entrenamiento. Este checkpoint de 150M es el punto medio práctico para fine-tuning en hardware limitado.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo aprende de UniProt, cuya composición está sesgada hacia organismos y familias sobrerrepresentadas; puede infrapredecir proteínas de organismos poco estudiados.
- Riesgo de alucinación: al ser un modelo de masked language modelling, puede asignar alta probabilidad a residuos plausibles pero incorrectos; sus predicciones deben validarse experimentalmente.
- Limitaciones de contexto: no se documenta la longitud máxima de secuencia en este repositorio; secuencias muy largas pueden requerir truncado o ventanas, lo que degrada la calidad de las representaciones.
- Limitaciones de idioma: no procesa lenguaje natural; su vocabulario es de aminoácidos. No debe usarse como LLM de texto.
- Restricciones de licencia: la licencia declarada es MIT, lo que permite uso comercial, pero conviene verificar la procedencia de los pesos (republicación de un checkpoint de Meta) y las condiciones del repositorio original.
- Caveats para producción: el repositorio tiene muy pocas descargas y ningún like, y no incluye model card propia más allá de la copia de la original; no hay garantía de mantenimiento, versionado ni soporte. Para producción se recomienda usar el checkpoint oficial de Meta o fijar el hash de los pesos.
- El pipeline no está declarado en el Hub, lo que puede complicar la carga automática con `pipeline()`; es probable que requiera carga manual con `AutoModel`/`AutoTokenizer` o `EsmModel`/`EsmTokenizer`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hellnahbru/esm2_t30_150M_UR50D-preserved-20261029
- Checkpoint original de Meta: https://huggingface.co/facebook/esm2_t30_150M_UR50D
- Paper ESM-2 (bioRxiv): https://www.biorxiv.org/content/10.1101/2022.07.20.500902v2
- Notebook de fine-tuning en PyTorch: https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_language_modeling.ipynb
- Notebook de fine-tuning en TensorFlow: https://colab.research.google.com/github/huggingface/notebooks/blob/main/examples/protein_language_modeling-tf.ipynb
