# Hritvik7654/redline-guard

## Resumen

El modelo **redline-guard** es un fine-tuning de **ModernBERT-base** (de AnswerDotAI) para tareas de **clasificación de texto**. Desarrollado por el usuario Hritvik7654, el modelo está diseñado para detectar cláusulas de riesgo en contratos legales y asistir en la revisión de documentos mediante la identificación de pasajes problemáticos (redlines). Aunque la model card no especifica el dataset de entrenamiento ni el propósito exacto, el nombre y los repositorios asociados en GitHub sugieren una aplicación en auditoría de contratos y revisión de acuerdos.

Con **149,6 millones de parámetros**, el modelo hereda la arquitectura eficiente de ModernBERT, optimizada para inferencia rápida y bajo consumo de recursos. Su licencia Apache 2.0 permite uso comercial sin restricciones. A pesar de ser un modelo pequeño, alcanza métricas de evaluación muy altas (AUROC 0.9985, AUPRC 0.9979), lo que lo hace adecuado para tareas de clasificación binaria o multiclase en dominios específicos. La ausencia de información sobre el dataset y los idiomas soportados limita su evaluación externa, pero su tamaño y compatibilidad con `text-embeddings-inference` lo convierten en una opción ligera para integraciones en pipelines de procesamiento documental.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-base (encoder transformer) fine-tuned |
| Parametros totales | 149.606.402 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de **ModernBERT-base**, un transformer encoder optimizado para eficiencia y velocidad, con atención global y local. El fine-tuning se realizó con el framework HuggingFace Transformers (versión 4.57.6) y PyTorch 2.13.0. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 3e-5, tamaño de lote de 32 (entrenamiento) y 128 (evaluación), optimizador AdamW con betas (0.9, 0.999), scheduler lineal con warmup del 6% y 2 épocas. El dataset de entrenamiento no está especificado en la model card (aparece como "None"), lo que impide conocer la composición y el volumen de datos. No se menciona el uso de RLHF ni DPO; se trata de un fine-tuning supervisado estándar.

Las métricas de evaluación finales son: pérdida 0.0493, AUPRC 0.9979, AUROC 0.9985 y TPR@1FPR 0.9743. La tabla de progreso del entrenamiento muestra una mejora consistente a lo largo de 50.000 pasos, con una convergencia estable.

## Capacidades

- **Clasificación de texto**: el pipeline declarado es `text-classification`, lo que indica que el modelo asigna etiquetas o puntuaciones a fragmentos de texto.
- **Detección de cláusulas de riesgo**: por el nombre y los repositorios asociados, se infiere que el modelo identifica pasajes contractuales problemáticos o de alto riesgo.
- **Compatibilidad con `text-embeddings-inference`**: el tag `text-embeddings-inference` sugiere que puede usarse para generar embeddings de texto, aunque su pipeline principal es clasificación.
- **Soporte para endpoints**: el tag `endpoints_compatible` indica que es desplegable en la infraestructura de HuggingFace Inference Endpoints.
- **No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generación de texto**; el modelo es exclusivamente un encoder para clasificación.

## Casos de uso

- **Auditoría de contratos legales**: el modelo puede analizar acuerdos y marcar cláusulas que presenten riesgos (indemnizaciones, limitaciones de responsabilidad, confidencialidad, etc.), facilitando la revisión por parte de abogados.
- **Asistente de redline en documentos**: integrado en herramientas de edición, puede sugerir modificaciones a cláusulas problemáticas, como se describe en el repositorio `imandiakhil9505-hub/redline-guard`.
- **Filtrado de documentos en pipelines de gestión documental**: clasifica párrafos o secciones de contratos para priorizar revisión humana.
- **Cumplimiento normativo**: detecta desviaciones respecto a plantillas o playbooks legales definidos por la organización.
- **Preprocesamiento para búsqueda semántica**: al ser compatible con embeddings, puede usarse para indexar contratos y recuperar cláusulas similares.
- **Educación y formación legal**: como herramienta de práctica para estudiantes de derecho, identificando patrones de riesgo en textos de ejemplo.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de evaluación (declarados por el autor):

| Metrica | Valor |
|---|---|
| Pérdida (validation) | 0.0493 |
| AUPRC | 0.9979 |
| AUROC | 0.9985 |
| TPR@1FPR | 0.9743 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, etc.) ni comparaciones con otros modelos. Estos valores corresponden a un conjunto de evaluación no especificado, por lo que deben interpretarse con cautela.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 149M parámetros, la inferencia en precisión fp32 requiere aproximadamente 600 MB de VRAM; en fp16 o int8, el consumo se reduce a ~300 MB o ~150 MB respectivamente. Cabe en cualquier GPU consumer (RTX 2060 o superior) y también en CPU con memoria suficiente.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente; para despliegues concurrentes se recomienda una GPU de gama media (RTX 3060, A10, etc.).
- **Opciones de despliegue**: compatible con HuggingFace Inference Endpoints, `text-embeddings-inference` y la librería `transformers` estándar. No se menciona soporte para vLLM u Ollama, aunque al ser un modelo pequeño podría ejecutarse con llama.cpp si se convierte a GGUF (no disponible actualmente).
- **Latencia y throughput**: no se proporcionan datos oficiales. Dado su tamaño, se espera una latencia inferior a 10 ms por muestra en GPU moderna y un throughput alto (miles de inferencias por segundo en batch).

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de clasificación de contratos. Como referencia, se compara con su modelo base:

| Modelo | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| redline-guard (fine-tune) | 149,6M | No disponible | Apache 2.0 | Clasificación de riesgo contractual |
| ModernBERT-base (base) | 149,6M | 8192 tokens (según documentación oficial) | Apache 2.0 | Modelo base para fine-tuning |

No hay información sobre alternativas específicas como LegalBERT o modelos de detección de cláusulas de riesgo, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- **Dataset de entrenamiento no especificado**: la model card indica "None", lo que impide evaluar posibles sesgos o la representatividad de los datos.
- **Riesgo de alucinación en clasificación**: aunque es un modelo discriminativo, puede asignar etiquetas incorrectas en textos fuera de su dominio de entrenamiento.
- **Idiomas no documentados**: no se indica qué idiomas soporta; probablemente esté entrenado principalmente en inglés, pero no es seguro.
- **Sin validación externa**: las métricas reportadas son del autor y no han sido replicadas por terceros.
- **Licencia Apache 2.0**: permite uso comercial, pero el usuario debe asumir la responsabilidad de su rendimiento en producción.
- **Contexto limitado**: aunque ModernBERT-base soporta 8192 tokens, no se confirma que el fine-tuning haya preservado esa longitud; se recomienda verificar.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Hritvik7654/redline-guard)
- [Repositorio GitHub: imandiakhil9505-hub/redline-guard](https://github.com/imandiakhil9505-hub/redline-guard) (no oficial, relacionado por nombre)
- [Repositorio GitHub: New-Sheep/RedlineGuard](https://github.com/New-Sheep/RedlineGuard) (no oficial, relacionado por nombre)
- [Blog de Harvey.ai sobre detección de redlines](https://www.harvey.ai/blog/low-latency-redline-detection) (contexto general, no afiliado)
