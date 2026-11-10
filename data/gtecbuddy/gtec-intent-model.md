# GtecBuddy/gtec-intent-model

## Resumen
GtecBuddy/gtec-intent-model es un modelo de clasificación de intenciones publicado en Hugging Face por el usuario GtecBuddy. Se distribuye en dos formatos: un artefacto `joblib` (propio de pipelines de scikit-learn) y pesos en `safetensors` compatibles con la arquitectura DistilBERT. Con 66.967.314 parámetros, el modelo se sitúa en el rango esperado de DistilBERT (aproximadamente 66 millones de parámetros), lo que sugiere un encoder transformer destilado orientado a tareas de comprensión del lenguaje y clasificación.

La relevancia de este modelo radica en su propósito aparente: la detección de intenciones (intent detection), una tarea habitual en sistemas de enrutamiento de consultas, asistentes conversacionales y clasificación de tickets. El tamaño reducido y el formato DistilBERT lo hacen candidato a despliegues con baja latencia y requisitos de hardware modestos.

No obstante, la información pública disponible es muy limitada: no se declara licencia, idiomas soportados, pipeline ni resultados de evaluación. El repositorio ocupa 0,3 GB y no registra descargas en el momento de la consulta, lo que indica que se trata de una publicación reciente y sin validación comunitaria.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder transformer destilado), segun tag del repositorio |
| Parametros totales | 66.967.314 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors y joblib |
| Tamano del repositorio | 0,3 GB |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento
El tag `distilbert` y el recuento de parámetros (66,9 millones) apuntan a una arquitectura DistilBERT, es decir, un transformer encoder de 6 capas destilado a partir de BERT-base mediante knowledge distillation. Este tipo de modelo conserva aproximadamente el 97 % del rendimiento de BERT-base en tareas de comprensión del lenguaje con un 40 % menos de parámetros y una velocidad de inferencia notablemente superior.

Sin embargo, no se dispone de información sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset, la existencia de ajuste fino supervisado, ni el uso de técnicas como RLHF o DPO. La presencia de un artefacto `joblib` sugiere que el modelo puede incluir un pipeline serializado (posiblemente con vectorizador y clasificador de scikit-learn), pero no se detalla su contenido. Tampoco se documenta ninguna innovación técnica adicional.

## Capacidades
- Clasificación de intenciones: uso previsto del modelo segun su nombre (intent model), orientado a etiquetar consultas o utterances en categorías predefinidas.
- Comprensión del lenguaje natural: al derivar de DistilBERT, dispone de representaciones contextuales para tareas de clasificación y extracción.
- Inferencia ligera: el tamaño de 66,9 millones de parámetros permite ejecución en CPU y GPU de gama baja.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; un encoder de clasificación no está diseñado para generación ni planificación.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Generación de texto libre: no disponible; no es un modelo causal de lenguaje.

## Casos de uso
- Enrutamiento de consultas en asistentes conversacionales: clasificar cada mensaje del usuario en una intención (soporte técnico, facturación, información) para derivarlo al flujo o agente adecuado, aprovechando el bajo coste de inferencia de un encoder de 67 millones de parámetros.
- Triaje de tickets de soporte: asignar automáticamente categorías a correos o formularios entrantes antes de que un operador los revise, reduciendo el tiempo de primera respuesta.
- Clasificación de comandos en interfaces de voz o chatbots: mapear utterances cortas a comandos del sistema, con latencia baja en CPU.
- Moderación o filtrado previo de consultas: etiquetar mensajes por temática para aplicar políticas distintas de respuesta o escalado.
- Análisis de encuestas y feedback: agrupar comentarios de usuarios en categorías de intención para informes agregados.
- Preprocesado en pipelines RAG: decidir si una consulta requiere recuperación documental o puede resolverse con una respuesta directa, usando la etiqueta de intención como señal de enrutamiento.
- Prototipado rápido en entornos con recursos limitados: al caber en CPU y ocupar 0,3 GB, permite experimentar en portátiles o contenedores pequeños sin GPU.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 0,3 GB en FP32 (67 M de parámetros × 4 bytes), alrededor de 0,15 GB en FP16 y menos de 0,1 GB en cuantización INT8.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el modelo es viable en GTX 1050, RTX 3050, T4 o superiores.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU.
- Ejecución en CPU: viable con latencias del orden de milisegundos por muestra para secuencias cortas.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, y carga del artefacto joblib si se usa el pipeline de scikit-learn; también FastAPI o TorchServe para servir el clasificador.
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamaño, se espera un throughput elevado en lotes pequeños, pero no hay cifras publicadas.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GtecBuddy/gtec-intent-model | 66,9 M | no disponible | no disponible | Hugging Face |
| distilbert-base-uncased | 66 M | 512 tokens | Apache 2.0 | Hugging Face |
| bert-base-uncased | 110 M | 512 tokens | Apache 2.0 | Hugging Face |
| MiniLM-L6-v2 | 22,7 M | 512 tokens | Apache 2.0 | Hugging Face |

La comparativa se basa en arquitecturas públicas de referencia; no se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa.

## Limitaciones y advertencias
- Ausencia de licencia declarada: no se puede asumir permiso para uso comercial; es necesario contactar con el autor antes de utilizarlo en producción.
- Sin documentación de idiomas: no se puede garantizar el comportamiento en castellano ni en otros idiomas.
- Sin benchmarks ni evaluación publicada: el rendimiento real en detección de intenciones es desconocido.
- Riesgo de sesgos: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos de género, etnia o dominio.
- Riesgo de alucinación: limitado en un encoder de clasificación, pero las etiquetas fuera del conjunto de entrenamiento pueden producir clasificaciones erróneas con alta confianza.
- Contexto máximo no especificado: si sigue el estándar DistilBERT, sería de 512 tokens, pero no está confirmado.
- Repositorio sin descargas ni validación comunitaria: la calidad y reproducibilidad no están contrastadas.
- Mezcla de formatos (joblib y safetensors): conviene verificar la correspondencia entre ambos artefactos antes de integrarlos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/GtecBuddy/gtec-intent-model
- Perfil del autor: https://huggingface.co/GtecBuddy
- Paper de DistilBERT: https://arxiv.org/abs/1910.01108
- Documentación de DistilBERT en transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
