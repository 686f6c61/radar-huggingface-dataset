# CobuildX-AI/cbx-bfs-transaction-categorizer-68M

## Resumen

El modelo `cbx-bfs-transaction-categorizer-68M` es un clasificador de texto especializado en la categorización de transacciones bancarias, desarrollado por CobuildX-AI. Se trata de un fine-tuning supervisado del encoder `jhu-clsp/ettin-encoder-68m`, un transformer de tipo ModernBERT de pequeno tamano (68,4 millones de parametros) disenado para tareas de clasificacion con requisitos de latencia y coste bajos.

El modelo resuelve un problema concreto y muy comun en el sector financiero: asignar automaticamente una categoria (por ejemplo, alimentacion, transporte, nomina, suscripciones) a partir de la descripcion textual cruda de un movimiento bancario. Al estar construido sobre un encoder compacto en lugar de un modelo generativo, esta pensado para despliegues de alto volumen y baja latencia, donde el coste por inferencia y el throughput importan mas que la generacion libre de texto.

Es relevante en el contexto actual de automatizacion financiera porque los modelos encoder de 68M pueden ejecutarse en CPU o en GPUs consumer, integrarse en pipelines de enriquecimiento de datos en tiempo real y desplegarse mediante Text Embeddings Inference o endpoints compatibles. La ficha se basa exclusivamente en la informacion publica disponible del repositorio; no se han publicado detalles de dataset, benchmarks ni proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), base `jhu-clsp/ettin-encoder-68m` |
| Parametros totales | 68.435.511 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | `cbx-bfs-model-non-production` (licencia personalizada, no produccion) |
| Formato de pesos | safetensors |
| Tarea | text-classification |
| Biblioteca | transformers |
| Tamano del repo | 0,3 GB |
| Acceso | restringido (gated), requiere aceptar condiciones en Hugging Face |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/ettin-encoder-68m`, un encoder de la familia Ettin basado en la arquitectura ModernBERT. ModernBERT incorpora mejoras sobre el transformer encoder clasico: atencion con RoPE, capas alternas de atencion local y global, y kernels optimizados, lo que permite contextos mas largos y mayor eficiencia que BERT tradicional a igualdad de parametros. Sobre esta base se ha realizado un fine-tuning para clasificacion de transacciones bancarias, anadiendo presumiblemente una cabeza de clasificacion sobre la representacion del token `[CLS]` o equivalente.

No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, el numero de clases de salida, ni si se aplicaron tecnicas de regularizacion, aumento de datos o calibracion. Tampoco se documenta si hubo entrenamiento con datos sinteticos o anonimizados. El repositorio no incluye model card detallada con hiperparametros, por lo que estos datos deben considerarse no disponibles.

## Capacidades

- Clasificacion de texto: asigna una categoria a una descripcion de transaccion bancaria (single-label, presumiblemente).
- Especializacion financiera: entrenado sobre vocabulario y patrones propios de movimientos bancarios en ingles.
- Inferencia de baja latencia: al ser un encoder de 68M, es adecuado para procesamiento de alto volumen.
- Integracion con `transformers` y Text Embeddings Inference (tags `text-embeddings-inference` y `endpoints_compatible`).
- No soporta generacion de texto, tool calling, agentes, vision ni audio.
- Capacidad multilingue limitada al ingles (`en`); no se documenta soporte de otros idiomas.
- No dispone de modo de razonamiento (thinking mode) ni de capacidades de razonamiento multi-paso.

## Casos de uso

- Categorizacion automatica de extractos bancarios: procesar cada linea de un extracto y asignar una categoria de gasto o ingreso. El modelo esta disenado especificamente para esta tarea y su tamano permite procesar miles de transacciones por minuto en una sola GPU o incluso en CPU.
- Enriquecimiento de datos en pipelines ETL financieros: integrar el clasificador como paso de transformacion para etiquetar transacciones antes de cargarlas en un data warehouse o en un sistema de BI.
- Deteccion de patrones de gasto para apps de finanzas personales: clasificar movimientos en tiempo real para alimentar dashboards y presupuestos automaticos con baja latencia.
- Pre-clasificacion para revision humana en compliance: etiquetar movimientos sospechosos o poco claros para priorizar la revision manual por parte de analistas.
- Normalizacion de descripciones de comercios: mapear descripciones crudas y ruidosas (codigos, abreviaturas) a categorias normalizadas que alimenten sistemas de conciliacion contable.
- Prototipado rapido en entornos de investigacion: al ser un modelo pequeno y con licencia no comercial, sirve para validar pipelines de clasificacion antes de escalar a modelos mayores o a datos propios.
- Clasificacion por lotes en entornos con recursos limitados: su tamano (0,3 GB en safetensors) permite desplegarlo en instancias modestas o en contenedores con poca memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp32 (68M parametros), menos de 0,2 GB en fp16/bf16. La huella real en memoria incluye activaciones y overhead del runtime, tipicamente por debajo de 1 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 4090 o A100 estan sobredimensionadas para un solo modelo, pero permiten batchear miles de peticiones concurrentes. Una T4 o incluso una GPU integrada es viable.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer (GTX 1060 en adelante) y tambien en CPU.
- Opciones de despliegue: `transformers` (Pipeline de text-classification), Text Embeddings Inference (tag oficial), endpoints compatibles, y potencialmente ONNX Runtime o llama.cpp si se generan conversiones (no publicadas).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos por lote en GPU y throughput alto en CPU con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cbx-bfs-transaction-categorizer-68M | 68,4M | no disponible | Clasificacion de transacciones | `cbx-bfs-model-non-production` (no produccion) | Gated en HF |
| jhu-clsp/ettin-encoder-68m (base) | 68,4M | no disponible | Encoder general (MLM) | no disponible en esta ficha | Publico en HF |
| ModernBERT-base | ~149M | 8192 tokens (segun documentacion publica de ModernBERT) | Encoder general | Apache 2.0 (segun documentacion publica) | Publico en HF |
| DistilBERT-base | ~66M | 512 tokens | Encoder general | Apache 2.0 | Publico en HF |

La comparativa se limita a caracteristicas estructurales; no se dispone de datos de rendimiento del modelo especializado frente a alternativas, por lo que no es posible comparar calidad de clasificacion.

## Limitaciones y advertencias

- Licencia `cbx-bfs-model-non-production`: restringe explicitamente el uso en produccion; es imprescindible revisar los terminos completos antes de cualquier despliegue comercial.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion a la integracion automatizada.
- Solo ingles: no se documenta soporte para descripciones de transacciones en castellano u otros idiomas, lo que limita su uso en mercados no angloparlantes.
- Riesgo de alucinacion de categoria: como todo clasificador, puede asignar etiquetas incorrectas ante descripciones ambiguas, abreviaturas desconocidas o comercios nuevos no vistos en entrenamiento.
- Sesgos potenciales: al desconocerse el dataset de entrenamiento, no es posible evaluar sesgos por tipo de comercio, region o perfil de usuario.
- Sin informacion sobre calibracion: no se documenta si las probabilidades de salida estan calibradas, lo que afecta a la fijacion de umbrales de confianza.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precision, recall o F1 sobre conjuntos de validacion.
- Modelo de nicho con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte comunitario limitados.
- No apto para generacion de texto ni para tareas fuera de la clasificacion de transacciones.

## Enlaces

- Hugging Face: https://huggingface.co/CobuildX-AI/cbx-bfs-transaction-categorizer-68M
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
