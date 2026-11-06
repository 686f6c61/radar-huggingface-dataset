# qiusizhan/persistbd-clean-lfm25-2p6b-s42

## Resumen

PersistBD Clean LFM2.5-2.6B S42 es un ajuste fino (fine-tune) del modelo LiquidAI/LFM2.5-2.6B, publicado por el usuario qiusizhan en Hugging Face. Se distribuye con la etiqueta `model-auditing` y el pipeline `text-generation`, lo que apunta a un uso orientado a tareas de auditoria o evaluacion de modelos conversacionales mas que a un asistente generalista. El modelo conserva la arquitectura LFM2 del modelo base y un total de 2.697.198.592 parametros en formato safetensors.

El modelo base, LFM2.5-2.6B, pertenece a la familia LFM2 (Liquid Foundation Models) de Liquid AI, disenada para inferencia eficiente en dispositivos y con atencion hibrida. El fine-tune hereda esa arquitectura y ese tamano, pero no se han publicado detalles sobre el dataset de ajuste, el proceso de entrenamiento ni los objetivos concretos del mismo. La ficha oficial en Hugging Face no incluye model card con informacion tecnica adicional.

La relevancia de esta publicacion es limitada y fundamentalmente de auditoria: se trata de un ajuste comunitario con acceso restringido (gated), 40 descargas y sin likes, lo que sugiere un uso experimental o interno. Para produccion conviene evaluar el modelo base original de LiquidAI, que cuenta con documentacion y soporte oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (transformer hibrido, segun modelo base LiquidAI/LFM2.5-2.6B) |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el repo ocupa 16,2 GB) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como `license:other` en Hugging Face) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base LiquidAI/LFM2.5-2.6B, de la familia LFM2 de Liquid AI. Esta familia se caracteriza por un diseno hibrido con capas de atencion y capas convolucionales, orientado a reducir el coste computacional en inferencia manteniendo calidad conversacional. No se dispone de informacion detallada en la fuente proporcionada sobre el numero exacto de capas, dimensiones ocultas, tipo de atencion o vocabulario.

Respecto al entrenamiento del fine-tune, no hay informacion publicada: se desconoce el numero de tokens de ajuste, la composicion del dataset, si se aplicaron tecnicas de RLHF, DPO o SFT supervisado, y cual es el objetivo exacto del ajuste (la etiqueta `model-auditing` sugiere un proposito de evaluacion o depuracion de comportamiento). Tampoco se documentan innovaciones tecnicas propias de este fine-tune.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base LFM2.5-2.6B.
- Orientacion declarada a tareas de auditoria de modelos (`model-auditing`), sin detalle sobre el metodo.
- Compatible con endpoints de Hugging Face (`endpoints_compatible`), lo que permite despliegue via Inference Endpoints.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Auditoria de comportamiento de modelos: el modelo puede emplearse como sujeto de pruebas en pipelines de evaluacion de sesgos, toxicidad o adherencia a instrucciones, dado su etiquetado `model-auditing`.
- Prototipado de asistentes conversacionales ligeros: con 2,7 mil millones de parametros, es viable para experimentar con chatbots de bajo coste en entornos de desarrollo.
- Evaluacion comparativa de fine-tunes: sirve como punto de referencia frente al modelo base LiquidAI/LFM2.5-2.6B en estudios de degradacion o deriva tras ajuste.
- Despliegue en endpoints gestionados: al ser `endpoints_compatible`, puede servirse desde Hugging Face Inference Endpoints para pruebas internas sin infraestructura propia.
- Investigacion sobre ajuste fino de modelos pequenos: util para estudiar como afecta un fine-tune comunitario a las capacidades del modelo base en tareas de generacion.
- Pruebas de robustez y red-teaming: su condicion de modelo ajustado sin documentacion lo convierte en un candidato para analizar comportamientos inesperados antes de adoptar modelos similares en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 5,4 GB solo para pesos (2,7 B parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion 8 bits: en torno a 3 GB para pesos; en 4 bits, alrededor de 1,5-2 GB.
- GPU recomendadas: A100 o H100 para despliegue en fp16 con contexto largo; RTX 4090 o RTX 3090 para fp16 en contextos moderados.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en fp16 (RTX 3060 Ti, RTX 4060 Ti, RTX 3070 en adelante); en cuantizacion 4 bits cabria en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI si el modelo base es compatible; llama.cpp/Ollama requeririan conversion a GGUF, no confirmada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PersistBD Clean LFM2.5-2.6B S42 | 2,70 B | no disponible | lfm1.0 | Gated en Hugging Face |
| LiquidAI/LFM2.5-2.6B (base) | 2,6 B aprox. | no disponible | lfm1.0 | Publico en Hugging Face |
| Gemma 2 2B | 2,6 B | 8.192 tokens | Gemma Terms | Publico en Hugging Face |
| Qwen2.5 3B | 3,1 B | 32.768 tokens | Apache 2.0 | Publico en Hugging Face |

La comparativa con Gemma 2 2B y Qwen2.5 3B se ofrece como referencia de categoria por tamano; no se dispone de datos de rendimiento del modelo evaluado para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, evaluacion ni limitaciones conocidas.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su uso y reproducibilidad.
- Licencia lfm1.0: es necesario revisar los terminos de la licencia LFM de Liquid AI antes de cualquier uso comercial; puede imponer restricciones adicionales.
- Riesgo de alucinacion y deriva: al ser un fine-tune sin evaluacion publicada, no hay garantias sobre la calidad o fidelidad de las respuestas frente al modelo base.
- Idiomas no declarados: no se puede asumir soporte multilingue ni un comportamiento consistente fuera del idioma de ajuste.
- Contexto no documentado: se desconoce la ventana maxima efectiva, lo que dificulta planificar cargas con entradas largas.
- Procedencia comunitaria: el autor no es el desarrollador original del modelo base; conviene auditar los pesos antes de usarlos en produccion.
- Sin soporte oficial: no hay garantias de mantenimiento, correcciones o actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qiusizhan/persistbd-clean-lfm25-2p6b-s42
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Organizacion LiquidAI en Hugging Face: https://huggingface.co/LiquidAI
