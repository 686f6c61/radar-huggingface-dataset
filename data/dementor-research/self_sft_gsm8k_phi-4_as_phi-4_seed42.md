# dementor-research/self_sft_gsm8k_phi-4_as_phi-4_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `microsoft/phi-4` mediante fine-tuning supervisado (SFT) con el dataset GSM8K, un conjunto de problemas aritméticos de nivel escolar. El nombre del modelo (`self_sft_gsm8k_phi-4_as_phi-4_seed42`) sugiere un proceso de auto-entrenamiento (self) donde phi-4 actúa tanto como modelo base como referencia, con una semilla fija (42). El adaptador está publicado por el usuario `dementor-research` y ocupa 0.4 GB en formato safetensors.

La model card oficial está completamente vacía, sin información sobre el proceso de entrenamiento, hiperparámetros, datos adicionales o evaluación. Esto limita cualquier afirmación sobre su rendimiento real. A pesar de la falta de documentación, el propósito declarado por los tags y el nombre es mejorar las capacidades de razonamiento matemático del modelo base en tareas similares a GSM8K. Es relevante como ejemplo de fine-tuning eficiente mediante LoRA sobre un modelo de 14 mil millones de parámetros, aunque su utilidad práctica queda condicionada a la validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `microsoft/phi-4` (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador pesa 0.4 GB, pero no se especifica el número de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base phi-4) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin cuantización adicional) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, lo que implica que no se publican los pesos completos del modelo, sino una matriz de bajo rango que se suma a las capas del modelo base `microsoft/phi-4`. Esta técnica reduce significativamente el coste de fine-tuning y el tamaño del artefacto resultante (0.4 GB frente a los ~28 GB del modelo completo en FP16). El entrenamiento se realizó con SFT (supervised fine-tuning) sobre el dataset GSM8K, que contiene aproximadamente 7,500 problemas matemáticos con soluciones paso a paso. La semilla 42 sugiere reproducibilidad, pero no se proporcionan los hiperparámetros exactos (learning rate, batch size, épocas, rank del LoRA, etc.). El término "self" en el nombre podría indicar que el modelo se entrenó sobre sus propias salidas o usando phi-4 como teacher, pero no hay confirmación en la documentación.

## Capacidades

- Especialización en razonamiento matemático: el entrenamiento en GSM8K debería mejorar la capacidad del modelo para resolver problemas aritméticos de varios pasos, aunque no hay métricas publicadas que lo confirmen.
- Generación de texto: al estar basado en phi-4, hereda las capacidades generales de generación de lenguaje del modelo base, pero no se ha verificado su comportamiento tras el fine-tuning.
- Conversación: el tag `conversational` sugiere que puede usarse en diálogos, pero no hay evidencia de evaluación en tareas conversacionales.
- No se ha documentado soporte para tool calling, agentes, visión o audio. Estas capacidades dependerían del modelo base phi-4, pero no están confirmadas en este adaptador.

## Casos de uso

- Resolución de problemas matemáticos en entornos educativos: el modelo podría integrarse en asistentes de tutoría para generar soluciones paso a paso a problemas de aritmética, aprovechando su fine-tuning en GSM8K. Sin embargo, al ser un adaptador LoRA, requiere cargar phi-4 completo, lo que limita su despliegue en dispositivos con poca memoria.
- Evaluación de técnicas de fine-tuning eficiente: sirve como ejemplo de cómo aplicar LoRA y SFT sobre un modelo grande con un dataset específico, útil para investigaciones sobre adaptación de bajo coste.
- Generación de datos sintéticos: el modelo podría usarse para crear nuevos problemas matemáticos o soluciones, aunque su fiabilidad no está demostrada.
- Benchmarking de modelos matemáticos: al estar especializado en GSM8K, puede emplearse como punto de comparación en experimentos de razonamiento numérico, siempre que se valide su rendimiento.
- Prototipado rápido: dado su tamaño reducido (0.4 GB), es fácil de descargar y probar en entornos de desarrollo, aunque la inferencia requiere el modelo base.
- Investigación sobre auto-entrenamiento: el nombre sugiere una metodología de auto-SFT, lo que podría interesar a quienes estudian técnicas de mejora iterativa con modelos generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (MMLU, GSM8K, HumanEval, etc.) ni comparaciones con otros modelos. Cualquier afirmación sobre su rendimiento sería especulativa.

## Requisitos de hardware

- No se dispone de datos específicos sobre VRAM, GPU recomendadas o latencia para este adaptador.
- Al ser un adaptador LoRA, la inferencia requiere cargar el modelo base `microsoft/phi-4` en memoria. Phi-4 tiene aproximadamente 14 mil millones de parámetros, por lo que en FP16 necesita alrededor de 28 GB de VRAM, y en cuantización de 4 bits podría reducirse a unos 8-10 GB. Estas cifras son estimaciones generales del modelo base, no proporcionadas por el autor del adaptador.
- Opciones de despliegue: se puede usar con la librería `peft` (como se indica en los tags) junto con `transformers` para cargar el adaptador sobre phi-4. También sería compatible con frameworks como vLLM o llama.cpp si se fusiona el adaptador con el base, pero no hay instrucciones oficiales.
- No se han medido throughput ni latencia en la información disponible.

## Comparativa con modelos similares

No se ha proporcionado información sobre modelos comparables. Dado que se trata de un adaptador LoRA específico para GSM8K, no hay datos para comparar con otros fine-tunings de phi-4 o con modelos matemáticos dedicados (por ejemplo, Mistral-7B-Math o Llama-3-8B-Instruct). La ausencia de benchmarks impide establecer una comparativa objetiva.

## Limitaciones y advertencias

- Model card incompleta: no hay documentación sobre el proceso de entrenamiento, datos, hiperparámetros ni evaluación. Esto impide conocer sus limitaciones específicas.
- Sesgos y alucinaciones: al ser un fine-tuning de phi-4, hereda los posibles sesgos del modelo base y puede generar respuestas incorrectas o inventadas, especialmente fuera del dominio matemático.
- Especialización limitada: el entrenamiento exclusivo en GSM8K puede provocar overfitting a ese dataset y degradar el rendimiento en otras tareas de razonamiento o generación.
- Licencia no especificada: no se indica la licencia del adaptador, lo que genera incertidumbre sobre su uso comercial o redistribución.
- Dependencia del modelo base: el adaptador no es autónomo; requiere descargar y cargar `microsoft/phi-4`, que tiene su propia licencia (MIT según la documentación oficial de Microsoft, pero no se confirma aquí).
- Reproducibilidad: aunque se menciona la semilla 42, no se detallan los pasos exactos de entrenamiento, por lo que replicar los resultados es difícil.

## Enlaces

- Repositorio en HuggingFace: [dementor-research/self_sft_gsm8k_phi-4_as_phi-4_seed42](https://huggingface.co/dementor-research/self_sft_gsm8k_phi-4_as_phi-4_seed42)
- Modelo base: [microsoft/phi-4](https://huggingface.co/microsoft/phi-4) (enlace no incluido en la información original, pero es el modelo base declarado)
- No se han encontrado papers, blogs o demos asociados a este adaptador en la información proporcionada.
