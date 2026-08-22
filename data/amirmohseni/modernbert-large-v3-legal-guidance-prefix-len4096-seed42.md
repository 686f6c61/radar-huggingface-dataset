# AmirMohseni/modernbert-large-v3-legal-guidance-prefix-len4096-seed42

## Resumen

Modelo de clasificacion de texto basado en `answerdotai/ModernBERT-large`, ajustado para detectar si ya existe orientacion legal en el prefijo acumulado de turnos de usuario dentro de una conversacion multi-turno con un LLM. Lo desarrolla AmirMohseni como parte de una linea de investigacion sobre deteccion temprana y enrutado de necesidades de informacion legal. El modelo resuelve un problema de clasificacion binaria por prefijo: cada turno de usuario genera un ejemplo, y el modelo decide si la conversacion ya ha recibido orientacion legal o no, lo que permite activar rutas de asistencia especializada en tiempo real.

Arquitectonicamente hereda el encoder transformer de ModernBERT-large con aproximadamente 395,8 millones de parametros y una ventana de contexto de 4096 tokens. Se entreno sobre el dataset jerarquico `AmirMohseni/WildChat-Legal-Classification-V3-Hierarchical`, derivado de registros publicos de interacciones con LLMs. Su relevancia actual radica en que aborda un problema poco cubierto por los modelos generativos: la deteccion temprana de necesidades legales en conversaciones, con aplicacion directa en sistemas de enrutado conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 395.833.346 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantizacion no publicada) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ModernBERT-large es un encoder transformer de la familia BERT con mejoras arquitectonicas respecto a BERT original: atencion con descomposicion en ventanas locales y globales, normalizacion pre-RMSNorm, y una tokenizacion eficiente. El modelo base fue publicado por Answer.AI y cuenta con 395 millones de parametros. Sobre esta base se realizo un ajuste fino de clasificacion binaria con una cabeza de clasificacion sobre el token `[CLS]`.

El entrenamiento utilizo el dataset `WildChat-Legal-Classification-V3-Hierarchical` con 1.632 conversaciones de entrenamiento (4.865 prefijos) y 290 de validacion (912 prefijos). Cada prefijo se pondera por el inverso del numero de turnos de usuario de su conversacion, de modo que cada conversacion tiene peso total 1.0 en la funcion de perdida. La configuracion fue de 3 epocas, tasa de aprendizaje 5e-05, tamano de lote efectivo 32, weight decay 0.01 y semilla 42. Se entreno en una GPU NVIDIA A100-SXM4-40GB. Las etiquetas de primer turno con orientacion legal son etiquetas plateadas (silver labels) generadas automaticamente, no validadas por humanos de forma independiente.

## Capacidades

- Clasificacion binaria de prefijos de conversacion: determina si el prefijo acumulado de turnos de usuario ya contiene orientacion legal.
- Deteccion del punto de inicio (onset) de la orientacion legal dentro de una conversacion multi-turno.
- Enrutado conversacional: permite dirigir conversaciones hacia canales de asistencia legal especializada cuando se detecta la necesidad.
- Procesamiento de contexto largo de hasta 4096 tokens, adecuado para conversaciones extensas.
- Soporte de inferencia via transformers y text-embeddings-inference (compatible con endpoints).
- Multilingue: no, solo ingles.
- Tool calling y agentes: no aplicable, es un modelo de clasificacion, no generativo.

## Casos de uso

- Enrutado de conversaciones en plataformas de asistencia legal: el modelo puede clasificar cada turno de usuario y activar una derivacion a un abogado o a un sistema de informacion legal cuando detecta que la conversacion ya contiene orientacion legal, evitando respuestas duplicadas o contradictorias.
- Monitorizacion de interacciones con chatbots: permite auditar si un asistente virtual ha proporcionado orientacion legal en conversaciones previas, util para cumplimiento normativo y control de calidad.
- Deteccion temprana de necesidades legales en atencion al cliente: en sectores como seguros, inmobiliario o financiero, el modelo puede identificar el momento en que una consulta deriva hacia un asunto legal y escalar la conversacion a un equipo especializado.
- Investigacion en NLP legal: sirve como componente de clasificacion en pipelines de investigacion sobre deteccion de intenciones legales en corpus conversacionales.
- Analisis retrospectivo de logs de conversacion: permite etiquetar grandes volumenes de interacciones historicas para construir datasets de entrenamiento o estudios de comportamiento.
- Sistema de alerta en tiempo real: integrado en un servicio de mensajeria, puede emitir avisos cuando una conversacion cruza el umbral de orientacion legal, con una latencia minima gracias a su tamano reducido.

## Benchmarks y rendimiento

Los resultados de validacion publicados en la model card, con umbral 0.36 seleccionado por macro-F1 ponderado por conversacion:

| Evaluacion | Macro-F1 | Positive F1 | AUPRC | Accuracy | Balanced accuracy |
|---|---:|---:|---:|---:|---:|
| Todos los prefijos, ponderado por conversacion | 0.8741 | 0.8529 | 0.9181 | 0.8777 | 0.8782 |
| Todos los prefijos, sin ponderar | 0.8385 | 0.8144 | 0.8973 | 0.8421 | 0.8419 |
| Prefijos finales/completos | 0.8753 | 0.8667 | 0.9344 | 0.8759 | 0.8757 |

Analisis de onset sobre etiquetas plateadas:

| Medida | Valor |
|---|---:|
| Tasa de falsa alarma en conversaciones negativas | 0.1410 |
| Tasa de falsa alarma pre-onset | 0.1119 |
| Tasa de orientacion no detectada | 0.1045 |
| Precision exacta del onset | 0.7388 |
| Precision dentro de un turno | 0.8060 |
| Error absoluto medio en turnos (positivos detectados) | 0.3500 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 395,8 millones de parametros, en fp32 ocupa aproximadamente 1,6 GB; en fp16 o bf16, unos 0,8 GB. Cabe sin problema en GPUs de consumo con 8 GB o mas.
- GPU recomendadas: cualquier GPU con 8 GB de VRAM es suficiente para inferencia (RTX 3060, RTX 4070, etc.). Para entrenamiento se utilizo una NVIDIA A100-SXM4-40GB.
- Compatibilidad con GPU de consumo: si, el modelo es pequeno y se puede ejecutar en GPUs consumer de gama media.
- Opciones de despliegue: transformers (Python), text-embeddings-inference (compatible con endpoints), y cualquier framework que soporte safetensors. Al ser un encoder, no aplica llama.cpp ni Ollama (orientados a modelos generativos).
- Latencia estimada: no disponible en la informacion proporcionada, pero por su tamano se espera una latencia de milisegundos en GPU moderna para secuencias de hasta 4096 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| AmirMohseni/modernbert-large-v3-legal-guidance-prefix-len4096-seed42 | 395,8 M | 4096 | Clasificacion de prefijos legales | Apache 2.0 |
| answerdotai/ModernBERT-large (base) | 395,8 M | 8192 | MLM generalista | Apache 2.0 |
| AmirMohseni/modernbert-large-v3-seeks-guidance-user-len4096-seed42 | 395,8 M | 4096 | Clasificacion de busqueda de orientacion | Apache 2.0 |

El modelo comparte arquitectura y tamano con su base ModernBERT-large, pero se diferencia por su especializacion en deteccion de orientacion legal por prefijos. El modelo hermano `seeks-guidance-user` aborda una tarea complementaria: detectar si el usuario busca orientacion, en lugar de si ya la ha recibido. No se dispone de datos de rendimiento comparativo entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento y de onset son etiquetas plateadas (silver labels) generadas automaticamente, sin validacion humana independiente. Las metricas de onset no deben considerarse evaluacion gold.
- El modelo no ha sido evaluado sobre el conjunto gold adjudicado de 200 conversaciones humanas.
- Solo soporta ingles; no es aplicable a otros idiomas sin reentrenamiento.
- Es un modelo de clasificacion, no un sistema de asesoria legal. No debe utilizarse para determinar si una persona tiene una reclamacion legal valida.
- El dataset deriva de registros publicos de interacciones con LLMs que pueden contener contenido sensible.
- El modelo es agnostico respecto a jurisdiccion, por lo que no distingue entre sistemas legales de distintos paises.
- Entrenado con una sola semilla (42), sin evaluacion de robustez frente a variaciones de inicializacion.
- Para uso en produccion, se recomienda validar el umbral de decision (0.36) sobre datos propios, ya que fue seleccionado sobre el split de validacion plateada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmirMohseni/modernbert-large-v3-legal-guidance-prefix-len4096-seed42
- Dataset de entrenamiento: https://huggingface.co/datasets/AmirMohseni/WildChat-Legal-Classification-V3-Hierarchical
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Modelo hermano (seeks-guidance): https://huggingface.co/AmirMohseni/modernbert-large-v3-seeks-guidance-user-len4096-seed42
- Registro de entrenamiento W&B: https://wandb.ai/rl-research-team/legal-guidance-prefix-v3/runs/u0m7x6qb
- Paper de referencia sobre ModernBERT aplicado a dominios legales (patentes): https://arxiv.org/pdf/2509.14926
