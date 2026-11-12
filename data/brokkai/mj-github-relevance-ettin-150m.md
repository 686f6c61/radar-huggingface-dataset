# brokkai/mj-github-relevance-ettin-150m

## Resumen

Mjolnir GitHub relevance student es un modelo de clasificación de texto (cross-encoder) desarrollado por brokkai, afinado a partir del encoder Ettin 150M de jhu-clsp. Su tarea concreta es puntuar la relevancia entre un elemento de GitHub (issue, pull request, notificación) y una sesión de agente, devolviendo una probabilidad que un sistema mayor llamado Mjolnir usa para decidir si notifica, rechaza o consulta a un segundo modelo denominado GLiDE.

El modelo se distribuye exclusivamente en formato ONNX (fp16 en almacenamiento, con dos grafos: uno para CPU en fp32 y otro para GPU en fp16), con un tamaño de repositorio de 0,3 GB y un total de 150 millones de parámetros. No es un modelo generativo: es un clasificador binario que produce un único logit por par entrada, al que se aplica sigmoid para obtener la probabilidad de relevancia.

Es relevante por su carácter de componente especializado dentro de un pipeline de filtrado de notificaciones: demuestra un patrón de destilación de un juez mayor (Sol) y de un modelo auxiliar (GLiDE) hacia un estudiante pequeño y desplegable en CPU, con umbrales de decisión congelados y una política de enrutamiento en tres bandas documentada de forma explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base Ettin 150M) con pooling CLS, capa dense/GELU/layer norm y clasificador |
| Parametros totales | 150M (según modelo base jhu-clsp/ettin-encoder-150m) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | max_length 7999 tokens en el tokenizador (truncado por la derecha solo del segundo segmento) |
| Tipos de cuantizacion | Pesos almacenados en fp16; grafo CPU castea a fp32 en carga; grafo GPU usa aritmética fp16 con islas fp32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (opset 17, ejes de batch y secuencia dinámicos; ficheros model-cpu.onnx y model-gpu.onnx) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder basado en el encoder Ettin 150M (familia ModernBERT), con pooling CLS seguido de una capa dense con activación GELU, layer norm y un clasificador entrenado, incluyendo sesgos aprendidos. La entrada se serializa como dos segmentos: el elemento de GitHub como primer segmento y la sesión canónica del agente como segundo, en JSON UTF-8 compacto y con un orden canónico definido (conversación, ficheros, referencias, menciones, otras claves en orden Unicode e historial ordenado por tiempo y texto). Se usa el postprocesador de pares de tokenizer.json, sin prefijo de hipótesis y sin presupuesto balanceado.

El entrenamiento se realizó como estudiante `150m-mixed`, destilando etiquetas del juez Sol y probabilidades de GLiDE sobre evidencia aliases600. El repositorio contiene solo pesos de inferencia y configuración, sin datos de entrenamiento. La innovación técnica destacable no está en la arquitectura sino en el diseño del pipeline: umbrales de decisión congelados (notificar si s ≥ 0,2830; rechazar si s < 0,0716; en caso contrario consultar a GLiDE y notificar si p ≥ 0,1123), una política de degradación explícita ante fallo del modelo local y puertas de validación numérica separadas para fp32 (error absoluto ≤ 1e-4) y fp16 (≤ 5e-3), con comparación de enrutamiento en tres bandas.

## Capacidades

- Clasificación de relevancia entre pares (elemento de GitHub × sesión de agente) mediante un logit único y sigmoid.
- Puntuación de pares con contexto largo: hasta 7999 tokens, con truncado por la derecha únicamente del segundo segmento.
- Serialización estructurada de entradas: JSON compacto con orden canónico de claves e historial ordenado.
- Ejecución en CPU (grafo fp32) y en GPU (grafo fp16 con islas fp32), con ejes de batch y secuencia dinámicos.
- Integración en pipelines de enrutamiento en tres bandas con umbrales congelados y consulta condicional a un modelo auxiliar (GLiDE).
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso: es exclusivamente un clasificador.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Filtrado de notificaciones de GitHub: el modelo puntúa cada par notificación × sesión de agente y el sistema Mjolnir notifica solo cuando la probabilidad supera 0,2830, reduciendo el ruido en bandejas de entrada de desarrolladores.
- Enrutamiento con escalado a modelo mayor: los pares en la banda intermedia (0,0716 ≤ s < 0,2830) se derivan a GLiDE, lo que permite reservar cómputo caro para los casos ambiguos; según la model card, el 16,2 % de los pares se envían a GLiDE.
- Priorización de issues y pull requests: integrado en una herramienta de triaje, asigna mayor puntuación a los elementos que probablemente requieren atención del agente en la sesión actual.
- Despliegue en entornos sin GPU: el grafo model-cpu.onnx permite servir el clasificador en infraestructura CPU con memoria fp32, útil para servicios de notificación de bajo coste.
- Servicio de inferencia compatible con Text Embeddings Inference y endpoints: los tags del repositorio indican compatibilidad con TEI y endpoints, lo que facilita su exposición como API de clasificación.
- Validación y monitorización de pipelines: las puertas numéricas documentadas (≤ 1e-4 en fp32, ≤ 5e-3 en fp16) permiten usar el modelo como referencia en pruebas de regresión de sistemas de enrutamiento.
- Detección de degradación: ante fallo del modelo local, la política definida hace que Mjolnir use GLiDE y reporte degradación, lo que sirve como patrón de tolerancia a fallos en servicios de clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta una estimación de recall agrupado aceptada de 0,901 (dev/test), con el 16,2 % de pares derivados a GLiDE, y advierte explícitamente de que no es una garantía de recall.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 150M parámetros, los pesos en fp16 ocupan aproximadamente 0,3 GB y en fp32 aproximadamente 0,6 GB, sin contar activaciones.
- GPU recomendadas: no disponibles; el repositorio incluye un grafo GPU (model-gpu.onnx) con aritmética fp16 e islas fp32, pero la model card exige validación separada en CUDA y CoreML antes de la selección automática de dispositivo.
- GPU de consumo: por tamaño, cabría en cualquier GPU consumer moderna, pero no hay validación publicada que lo confirme.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), Text Embeddings Inference (tag text-embeddings-inference) y endpoints compatibles.
- Latencia y throughput: no disponibles.
- Nota de seguridad: un fallo del proveedor debe seleccionar CPU de forma visible; la paridad GPU no queda establecida por la ejecución en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| brokkai/mj-github-relevance-ettin-150m | 150M | 7999 tokens | Clasificación de relevancia GitHub × sesión | no disponible | ONNX |
| jhu-clsp/ettin-encoder-150m (base) | 150M | no disponible | Encoder general (ModernBERT) | no disponible | safetensors (no confirmado) |
| GLiDE (modelo auxiliar del pipeline) | no disponible | no disponible | Segunda etapa de enrutamiento | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo es específico para notificaciones de GitHub de Mjolnir; otras tareas y distribuciones no han sido evaluadas.
- Los umbrales de decisión están congelados y no deben reajustarse para esta exportación.
- La estimación de recall de 0,901 no constituye una garantía de recall.
- Las predicciones bf16 almacenadas en GPU no son referencias de puntuación fp32; la validación debe hacerse contra Python en CPU fresco.
- La paridad GPU no está establecida por la ejecución en CPU; CUDA y CoreML requieren validación de hardware separada.
- Riesgo de sesgos y de alucinación: no evaluado ni documentado en la información disponible; al ser un clasificador, el riesgo se traduce en falsos positivos y negativos de relevancia.
- Licencia no disponible: no puede confirmarse el uso comercial.
- Idiomas soportados no disponibles.
- El repositorio no incluye datos de entrenamiento, lo que limita la reproducibilidad y la auditoría del ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/brokkai/mj-github-relevance-ettin-150m
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-150m
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
