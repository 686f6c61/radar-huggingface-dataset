# DS4AI-UPB/span-detector-ro

## Resumen

El modelo `DS4AI-UPB/span-detector-ro` es un clasificador de tokens basado en `FacebookAI/xlm-roberta-large` (560 millones de parámetros) que detecta los dos spans de entidades `e1` y `e2` en frases en rumano, utilizando un esquema de etiquetado BIO de cinco clases (`O`, `B-E1`, `I-E1`, `B-E2`, `I-E2`). Desarrollado por el laboratorio DS4AI-UPB de la Universidad Politécnica de Bucarest, constituye la primera etapa de un pipeline end-to-end de extracción de relaciones: los spans predichos se envuelven en marcadores de entidad y se pasan al clasificador de relaciones `DS4AI-UPB/xlmr-large-ro-re`.

El modelo resuelve un problema específico: las entidades de la tarea SemEval-2010 Task 8 son nominales comunes, no entidades nombradas, por lo que un NER genérico no transfiere bien. Este detector se entrena directamente sobre los spans de dicha tarea, adaptándose al dominio de la extracción de relaciones en rumano. Su relevancia radica en cubrir un idioma con pocos recursos para esta tarea, ofreciendo un componente reutilizable y de código abierto.

La arquitectura es un transformer encoder (XLM-RoBERTa large) con una cabeza de clasificación de tokens. El tamaño total de parámetros es de 558.845.957 según los pesos en safetensors. La longitud de contexto no se especifica en la documentación disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large) con cabeza de clasificación de tokens |
| Parametros totales | 558.845.957 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Rumano (ro) |
| Licencia | MIT (según YAML de la model card; la misma model card muestra un badge CC BY-NC-SA 4.0, posible discrepancia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-large`, un transformer encoder preentrenado multilingüe, y añade una capa de clasificación por token con cinco etiquetas BIO. No emplea mecanismos de atención lineal ni decodificación especulativa; es un modelo de clasificación de secuencias estándar.

El entrenamiento se realizó sobre los spans de la tarea SemEval-2010 Task 8 (entidades nominales comunes), con los siguientes hiperparámetros: 5 épocas, tamaño de batch 16, tasa de aprendizaje 2e-5, warmup del 10% y weight decay de 0.01. El mejor checkpoint se seleccionó por span F1-Score sobre un split de validación del 10%. El entrenamiento se ejecutó en una única GPU NVIDIA A100 de 40 GB durante aproximadamente 6 minutos. No se menciona el uso de RLHF, DPO ni otros métodos de alineación, al tratarse de un modelo de clasificación supervisada.

## Capacidades

- Detección de los spans de entidades `e1` y `e2` en frases rumanas, mediante etiquetado BIO de cinco clases.
- Integración como primer paso de un pipeline end-to-end de extracción de relaciones, alimentando al clasificador `DS4AI-UPB/xlmr-large-ro-re`.
- Especializado en entidades nominales comunes (no entidades nombradas), adaptado a la tarea SemEval-2010 Task 8.
- No es un modelo generativo: no genera texto, no soporta tool calling, ni agentes, ni razonamiento multi-paso.
- Capacidad multilingüe limitada al rumano, aunque el modelo base XLM-R es multilingüe, el fine-tuning se realizó solo en rumano.

## Casos de uso

- Extracción de relaciones en rumano: el modelo detecta los dos argumentos de una relación semántica en una frase, permitiendo construir sistemas de RE end-to-end para este idioma.
- Preprocesamiento para clasificación de relaciones: los spans detectados se envuelven en marcadores (p. ej., `<e1>...</e1>`) y se pasan al clasificador de relaciones, mejorando la precisión de la extracción.
- Investigación en PLN para rumano: sirve como componente base para experimentos de extracción de información en dominios específicos (biomedicina, finanzas, etc.) donde se requiera identificar argumentos de relaciones.
- Construcción de datasets anotados: puede usarse como anotador automático para generar datos de entrenamiento de sistemas de RE en rumano, reduciendo el esfuerzo manual.
- Evaluación de pipelines de RE: al ser un componente independiente, permite aislar y evaluar el impacto de la detección de spans en el rendimiento global del sistema.
- Sistemas de pregunta-respuesta sobre texto rumano: la identificación de entidades y sus relaciones puede alimentar motores de búsqueda semántica o chatbots especializados.

## Benchmarks y rendimiento

El modelo reporta los siguientes resultados sobre el split de validación retenido (10%):

| Metrica | Valor |
|---|---|
| Span F1-Score | 0.869 |
| Precision | 0.85 |
| Recall | 0.89 |

No se han publicado resultados comparativos con otros modelos de detección de spans en la información disponible.

## Requisitos de hardware

- Inferencia: al tratarse de un modelo de 558 millones de parámetros, el uso de VRAM depende de la precisión. En fp32 se estiman ~2,2 GB, en fp16 ~1,1 GB, y con cuantización a 8 bits podría reducirse por debajo de 1 GB. Estas cifras son estimaciones orientativas, no datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16 o cuantizado. Una RTX 3060 o superior es suficiente para inferencia local.
- En consumer GPU: sí, cabe en GPUs de gama media (p. ej., RTX 3060, RTX 4060) con cuantización o fp16.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con Hugging Face Inference Endpoints, vLLM (aunque no es óptimo para clasificación de tokens), o mediante la librería `transformers` en un script Python. También es compatible con ONNX Runtime para optimización.
- Latencia y throughput: no se han publicado datos oficiales. Para un modelo de este tamaño, la inferencia en CPU puede tardar decenas de milisegundos por frase corta; en GPU, unos pocos milisegundos.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de detección de spans para extracción de relaciones en rumano. Los modelos NER genéricos (p. ej., `xlm-roberta-large` fine-tuneado en NER) no son directamente comparables porque no detectan entidades nominales comunes de la tarea SemEval-2010 Task 8. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en rumano; no se garantiza su rendimiento en otros idiomas.
- Solo detecta dos entidades (`e1` y `e2`) de la tarea SemEval-2010 Task 8, no entidades nombradas generales ni relaciones de otros dominios.
- La longitud de contexto no está documentada; al derivar de XLM-RoBERTa large, es probable que sea de 512 tokens, pero no se confirma en la información proporcionada.
- La licencia presenta una discrepancia: el YAML indica MIT, pero la model card muestra un badge CC BY-NC-SA 4.0. Antes de uso comercial, conviene verificar la licencia vigente con los autores.
- No se han documentado sesgos específicos, pero al ser un modelo entrenado en un corpus concreto, puede reflejar sesgos del dominio de origen.
- Al ser un modelo de clasificación, no genera texto, por lo que el riesgo de alucinación no aplica; sin embargo, puede cometer errores de etiquetado en frases ambiguas o con estructuras sintácticas complejas.

## Enlaces

- HuggingFace: https://huggingface.co/DS4AI-UPB/span-detector-ro
- Repositorio de código: https://github.com/DS4AI-UPB/crosslingual-romanian-re
- Clasificador de relaciones asociado: https://huggingface.co/DS4AI-UPB/xlmr-large-ro-re
- Organización DS4AI-UPB: https://huggingface.co/DS4AI-UPB
- Paper (en progreso, enlace no funcional): https://arxiv.org/abs/WIP
