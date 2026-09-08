# Hooshaai/svd-linear-attention-distilbert-aegis-v5-module

## Resumen

El modelo `svd-linear-attention-distilbert-aegis-v5-module` es un DistilBERT comprimido mediante el módulo `aegis_v5_module`, desarrollado por Hoosha AI (Hooshaai) dentro del marco de investigación "SVD Linear Attention Framework". Sustituye la atención cuadrática estándar por aproximaciones lineales de bajo rango calibradas con descomposición en valores singulares (SVD) y recupera el rendimiento mediante 50 pasos de fine-tuning LoRA. El modelo está diseñado para clasificación de texto y se evalúa en el subconjunto SST-2 del dataset GLUE.

La relevancia de este modelo radica en que explora una alternativa eficiente a la atención estándar, reduciendo el coste computacional y el consumo de VRAM sin necesidad de cambiar la arquitectura base. Aunque la precisión obtenida es baja (62,84% de accuracy en SST-2), sirve como referencia para estudiar el impacto de la compresión SVD y la recuperación LoRA en modelos preentrenados. El tamaño de parámetros y la longitud de contexto no se especifican en la documentación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT con módulo de atención lineal de bajo rango (`aegis_v5_module`) basado en SVD y recuperación LoRA |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (la compresión se realiza mediante SVD y LoRA, no cuantización de pesos) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (weights.pt) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura DistilBERT y aplica el módulo `aegis_v5_module`, que reemplaza las capas de atención cuadrática o las proyecciones densas por aproximaciones lineales de bajo rango. Estas aproximaciones se calibran mediante descomposición en valores singulares (SVD) y posteriormente se recuperan con 50 pasos de fine-tuning LoRA. Esta combinación busca reducir la complejidad computacional de la atención manteniendo la estructura del modelo original.

Los datos de entrenamiento no se detallan en la model card más allá de la referencia al dataset GLUE, concretamente a la tarea SST-2. El proceso de evaluación se realiza sobre este subconjunto, midiendo accuracy y F1. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. La innovación principal es la integración de un módulo de atención subcuadrática con recuperación LoRA, enmarcada dentro del "SVD Linear Attention Framework".

## Capacidades

- Clasificación de texto: el modelo está diseñado para tareas de clasificación de secuencias, evaluado en SST-2 (análisis de sentimiento).
- Atención lineal de bajo rango: reduce el coste computacional de la atención cuadrática estándar mediante aproximaciones SVD.
- Recuperación con LoRA: el fine-tuning posterior a la compresión permite recuperar parte del rendimiento perdido.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés (en).
- Capacidades especiales: compresión de parámetros con ratio de compresión de 1,1968 y pico de VRAM de 288,41 MB.

## Casos de uso

- Investigación en compresión de atención: el modelo permite estudiar cómo la sustitución de la atención cuadrática por aproximaciones lineales de bajo rango afecta al rendimiento en un DistilBERT preentrenado.
- Evaluación de recuperación con LoRA: sirve como referencia para analizar en qué medida el fine-tuning LoRA tras la compresión SVD recupera precisión en tareas de clasificación.
- Benchmarking de eficiencia en hardware limitado: con un pico de VRAM de 288,41 MB, puede ejecutarse en GPUs de gama baja o incluso en CPUs para medir consumo de memoria y tiempo de inferencia.
- Prototipado de clasificadores ligeros: en entornos académicos o de investigación, puede usarse como base para probar pipelines de clasificación de texto con requisitos mínimos de hardware.
- Docencia sobre modelos eficientes: es un ejemplo práctico de atención subcuadrática y compresión de modelos para cursos de NLP eficiente.
- Comparación de módulos de compresión: dentro del marco SVD Linear Attention Framework, permite comparar el comportamiento de `aegis_v5_module` frente a otros módulos de compresión en la misma arquitectura base.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Validation Accuracy (SST-2) | 62,84% |
| F1 Score | 0,7286 |
| Compression Ratio | 1,1968 |
| Peak GPU VRAM | 288,41 MB |
| Pure Eval Time | 30,63 s |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Los datos proceden de la model card del autor, obtenidos con el marco de evaluación automatizado del SVD Linear Attention Framework.

## Requisitos de hardware

- VRAM estimada: pico de VRAM de 288,41 MB según la model card.
- GPU recomendadas: no se especifican; al ser un modelo pequeño, puede ejecutarse en cualquier GPU con al menos 0,5 GB de VRAM o incluso en CPU.
- Compatibilidad con GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo moderna.
- Opciones de despliegue: PyTorch con HuggingFace Transformers; puede servirse con vLLM, TGI o llama.cpp si se exporta a formato GGUF, aunque no se proporciona información sobre dicha exportación.
- Latencia y throughput: no disponibles; el tiempo de evaluación puro de 30,63 s no especifica hardware ni tamaño de lote.

## Comparativa con modelos similares

No se dispone de datos comparativos con modelos similares en la información proporcionada. El modelo se presenta como una prueba de concepto de compresión sobre DistilBERT, pero no se publican benchmarks frente a DistilBERT original u otros modelos de atención eficiente.

## Limitaciones y advertencias

- Precisión baja: la accuracy de 62,84% en SST-2 es significativamente inferior al rendimiento típico de DistilBERT sin comprimir en esta tarea, lo que limita su uso en producción.
- Sesgos: no se han evaluado sesgos; el modelo puede heredar sesgos de los datos de entrenamiento de DistilBERT y del dataset GLUE.
- Riesgo de clasificaciones incorrectas: al ser un modelo de clasificación, puede producir etiquetas erróneas con confianza alta, especialmente en textos ambiguos.
- Limitaciones de contexto: no se especifica la longitud de contexto en la documentación.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el rendimiento degradado hace que no sea viable para aplicaciones reales sin un fine-tuning adicional.
- Caveat para producción: no se recomienda su uso en sistemas de producción sin una evaluación exhaustiva y un reentrenamiento que recupere la precisión.

## Enlaces

- HuggingFace: https://huggingface.co/Hooshaai/svd-linear-attention-distilbert-aegis-v5-module
- Sitio de Hoosha AI: https://hooshaai.github.io/
- GitHub de Hoosha AI: https://github.com/Hooshaai/hooshaai.github.io
