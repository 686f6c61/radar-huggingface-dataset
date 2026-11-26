# netprojects/Qwen3.8-27B-LayerFit-MLX-4bit

## Resumen

Qwen3.8-27B-LayerFit-MLX-4bit es una cuantización en 4 bits del modelo multimodal Qwen/Qwen3.8-27B, publicada por NetProjects (Paris Michalas) y optimizada específicamente para Apple Silicon mediante la técnica propietaria LayerFit. El modelo resuelve el problema de ejecutar un modelo de aproximadamente 28.200 millones de parámetros con capacidades de visión en equipos Mac de 32 GB de memoria unificada, manteniendo una calidad superior a la cuantización uniforme de 4 bits al mismo tamaño en disco (16,5 GB).

La innovación principal es LayerFit, un procedimiento de búsqueda por capas que mide la sensibilidad de cada bloque (MLP, atención, atención lineal, embeddings y cabeza de salida) a la cuantización agresiva y distribuye un presupuesto fijo de bits donde más se necesita. El resultado es un modelo en formato MLX estándar, cargable con mlx-lm, mlx-vlm y LM Studio, que conserva la torre de visión en bf16 y el contexto de 262K tokens del modelo base.

Es relevante ahora porque permite desplegar localmente un modelo multimodal de 27B con contexto largo y decodificación acelerada por MTP (multi-token prediction) en hardware de consumo Apple, sin depender de GPUs dedicadas. La licencia Apache-2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (qwen3_5), con atención lineal y torre de visión; cuantización por capas LayerFit |
| Parametros totales | 28.206.101.232 (~28,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | 4 bits (LayerFit por capas); torre de visión en bf16; cabeza MTP en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer con bloques de atención y atención lineal, además de una torre de visión para entrada de imágenes, según se desprende de la pipeline image-text-to-text y del tag qwen3_5. La cuantización LayerFit no reentrena el modelo: parte de los pesos en bf16 y realiza una búsqueda por capas que asigna distintos presupuestos de bits a cada componente (MLP, atención, atención lineal, embeddings y cabeza de salida) para minimizar la degradación dentro de un tamaño objetivo de 16,5 GB. La torre de visión se mantiene en bf16 para preservar la calidad multimodal.

El paquete incluye la cabeza de multi-token prediction (MTP) del propio Qwen3.8-27B cuantizada a 8 bits, lo que permite decodificación especulativa con el mismo modelo como draft model. La receta exacta de la búsqueda está documentada en `layerfit-recipe.json` dentro del repositorio. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO, ya que corresponden al modelo base y no se detallan en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada de imágenes y texto (image-text-to-text): descripción de imágenes y razonamiento sobre contenido visual.
- Razonamiento con modo "thinking" (se menciona thinking off/on en las pruebas).
- Llamada a herramientas (tool calling / function calling), verificado en las pruebas del autor.
- Generación de código, verificado en las pruebas del autor (coding 3/3).
- Razonamiento matemático (evaluado con GSM8K-50).
- Contexto largo de hasta 262K tokens.
- Decodificación acelerada mediante MTP (multi-token prediction) como draft model.
- Capacidades multilingües: no se detallan idiomas concretos en la información disponible.

## Casos de uso

- Asistente local en Mac de 32 GB: ejecutar un modelo de 27B con visión y contexto largo directamente en el portátil, sin GPU dedicada, usando mlx-vlm o LM Studio.
- Análisis de documentos e imágenes: procesar capturas, diagramas o fotos junto con prompts extensos gracias a la ventana de 262K tokens y a la torre de visión conservada en bf16.
- Generación de código en local: usar el modelo con tool calling en flujos de desarrollo sobre Apple Silicon, aprovechando la verificación de coding del autor y la aceleración MTP para reducir latencia.
- Automatización de agentes multi-paso: el soporte de tool calling y el modo thinking permiten encadenar razonamiento y llamadas a funciones en pipelines locales.
- Razonamiento matemático asistido: resolución de problemas tipo GSM8K en entornos sin conexión, útil para prototipos educativos o de investigación.
- Procesamiento de prompts largos en investigación: análisis de corpus extensos o conversaciones con historial amplio dentro de los 262K tokens, con un pico de memoria medido de 18,2 GB para un prompt de 8K tokens.
- Evaluación y comparación de cuantizaciones: servir como referencia práctica de LayerFit frente a cuantizaciones uniformes de 4 bits en pruebas de calidad y velocidad.

## Benchmarks y rendimiento

Datos publicados por el autor (arnés propio: solo pesos de lenguaje, 32 pasajes × 512 tokens en inglés, otros idiomas, código, tool calls y matemáticas, frente a su conversión MLX bf16; GSM8K-50 con thinking off):

| Prueba | Estándar 4-bit | LayerFit 4-bit |
|---|---|---|
| Acuerdo Top-1 con bf16 | 92,7% | 94,0% |
| Error (KL) | baseline | 38% menor |
| GSM8K-50 | 44/50 | 46/50 |

Métricas específicas de este build:

| Métrica | Valor |
|---|---|
| Acuerdo Top-1 con bf16 (12 prompts) | 96,5% (KL 0,015) |
| GSM8K-50 (thinking off) | 44/50 |
| Tool calls (coding / thinking / imagen) | 3/3, 2/2, pass |
| Memoria pico con prompt de 8K tokens | 18,2 GB |
| Decodificación en M5 Max | 33 tok/s; 60 tok/s con MTP |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, etc.) del modelo base; el autor remite a la model card de Qwen3.8-27B.

## Requisitos de hardware

- Memoria unificada recomendada: 32 GB (build de 16,5 GB en disco; el autor sugiere que la descarga sea como máximo ~60% de la memoria).
- Memoria pico medida: 18,2 GB con un prompt de 8K tokens.
- Cabe en Mac de 32 GB; existen builds alternativos de 2, 2.5 y 3 bits para Macs de 16 y 24 GB (text-only en el caso de 2 bits).
- Para 48 GB o más, el autor recomienda builds uniformes de 6/8 bits de lmstudio-community o mlx-community.
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el formato MLX está orientado a Apple Silicon.
- Despliegue: mlx-vlm (imagen+texto), mlx-lm (texto), LM Studio.
- Ajuste opcional de memoria GPU: `sudo sysctl iogpu.wired_limit_mb=12800` (persiste hasta reinicio).
- Throughput indicativo: 33 tok/s en M5 Max; 60 tok/s con MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-LayerFit-MLX-4bit (este) | ~28,2B | 262K | MLX 4-bit, Apple Silicon | Apache-2.0 | Visión en bf16, MTP 8-bit, 16,5 GB |
| Qwen3.8-27B-LayerFit-MLX-3bit | ~28,2B | 262K | MLX 3-bit, Apple Silicon | Apache-2.0 | 13,1 GB, para 24 GB |
| Qwen3.8-27B-LayerFit-MLX-2bit | ~28,2B | 262K | MLX 2-bit, Apple Silicon | Apache-2.0 | 9,1 GB, text-only, para 16 GB |
| Qwen/Qwen3.8-27B (base) | ~28,2B | 262K | safetensors bf16 | Apache-2.0 | Referencia de calidad; requiere mucha más memoria |
| Builds uniformes 6/8-bit (lmstudio-community, mlx-community) | ~28,2B | 262K | MLX 6/8-bit | Apache-2.0 | Recomendados por el autor para 48 GB+ |

No se dispone de datos de benchmarks comparativos con modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce degradación respecto a bf16 (acuerdo Top-1 del 96,5% en la comprobación de 12 prompts; 94,0% en el arnés amplio), por lo que no es equivalente al modelo original en tareas sensibles.
- Los benchmarks publicados son del autor, con arnés propio y sin validación independiente; deben interpretarse como indicativos.
- El rendimiento de decodificación (33/60 tok/s) se midió en un M5 Max descrito como "no silencioso" y es indicativo, no garantizado.
- Requiere hardware Apple Silicon; no es desplegable en GPUs NVIDIA/AMD con los runtimes estándar (vLLM, TGI, llama.cpp no aplican al formato MLX).
- Con prompts largos la memoria pico crece (18,2 GB con 8K tokens); prompts cercanos a 262K pueden exceder la memoria de un Mac de 32 GB.
- Idiomas soportados no documentados en esta ficha; el modelo base puede tener sesgos lingüísticos y culturales no evaluados aquí.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero LayerFit es marca registrada de NetProjects; el proyecto no está afiliado a Alibaba Cloud ni al equipo Qwen.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-LayerFit-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Build 2-bit: https://huggingface.co/netprojects/Qwen3.8-27B-LayerFit-MLX-2bit
- Build 2.5-bit: https://huggingface.co/netprojects/Qwen3.8-27B-LayerFit-MLX-2.5bit
- Build 3-bit: https://huggingface.co/netprojects/Qwen3.8-27B-LayerFit-MLX-3bit
- Otros modelos del autor: https://huggingface.co/netprojects
- NetProjects: https://netprojects.com
