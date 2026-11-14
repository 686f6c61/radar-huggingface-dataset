# OpenGryd/Nemotron-3.5-Embed-1B-BF16-MLX

## Resumen

Nemotron-3.5-Embed-1B-BF16-MLX es una conversión al framework MLX del modelo de embeddings `nvidia/Nemotron-3.5-Embed-1B-BF16`, publicada por OpenGryd. El modelo original, desarrollado por NVIDIA, combina un codificador de visión Pixtral con una torre de lenguaje Ministral3 bidireccional que produce embeddings de 2048 dimensiones, con normalización L2 y una ventana de contexto de 32.768 tokens. Está diseñado para tareas de recuperación de información (retrieval) y extracción de características, y admite un esquema asimétrico de prefijos `query:` y `passage:`.

Esta build concreta sirve únicamente la ruta de texto: los tensores del codificador visual y del proyector multimodal se incluyen sin modificar en los safetensors, pero se omiten en tiempo de carga. Los pesos son los originales en BF16, sin alteraciones; el repositorio añade solo el módulo de servicio `nemotron35_embed_mlx.py` junto con las configuraciones y el tokenizador. La verificación de fidelidad frente a la referencia en PyTorch reporta una similitud coseno en el peor caso de 0,9997.

Su relevancia actual radica en que permite ejecutar un modelo de embeddings de 1.550 millones de parámetros con contexto largo en hardware Apple Silicon mediante MLX, sin necesidad de reentrenamiento ni de conversión de pesos, y con una fidelidad numérica documentada. La licencia OpenMDW-1.1 se hereda tal cual del lanzamiento original de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional Ministral3 (torre de lenguaje) con codificador de visión Pixtral en el modelo original; esta build sirve solo la ruta de texto |
| Parametros totales | 1.554.710.528 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | BF16 (única variante publicada en este repositorio); no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible (la verificación de fidelidad incluye textos multilingües con CJK, pero no se publica una lista de idiomas) |
| Licencia | OpenMDW-1.1 (modelos base Ministral bajo Apache-2.0) |
| Formato de pesos | safetensors (BF16), librería MLX |

## Arquitectura y entrenamiento

El modelo original es un encoder multimodal que empareja un codificador de visión Pixtral con una torre de lenguaje Ministral3 configurada de forma bidireccional, en lugar de causal. La representación se obtiene mediante mean pooling sobre las salidas de la torre, produciendo un vector de 2048 dimensiones que se normaliza en L2, de modo que el producto escalar equivale a la similitud coseno. El contexto máximo es de 32.768 tokens y el esquema de recuperación es asimétrico, con prefijos `query:` y `passage:` aplicados por la función `encode`.

Esta build de OpenGryd no reentrena ni modifica los pesos: los safetensors son los del snapshot `e24ca1e3` del modelo de NVIDIA, y MLX los carga directamente en BF16. El módulo añadido sigue el enfoque de encoder bidireccional de `mlx-community/Nemotron-3-Embed-1B-BF16` y se valida contra la referencia en PyTorch (`transformers` 5.20, CPU fp32, lotes con padding a la derecha idénticos), con una similitud coseno mínima de 0,9997. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de embeddings de texto de 2048 dimensiones, normalizados en L2, listos para búsqueda por similitud coseno.
- Recuperación asimétrica mediante prefijos `query:` y `passage:`, adecuada para motores de búsqueda semántica y RAG.
- Procesamiento de secuencias de hasta 32.768 tokens, con padding y truncamiento gestionados por el tokenizador.
- Extracción de características por lotes (entrada `[B, 2048]` de salida en fp32).
- Soporte multilingüe en la validación (incluye textos en CJK), aunque sin lista oficial de idiomas.
- Ruta de visión no operativa en esta build: los tensores `vision_tower.*` y `multi_modal_projector.*` se conservan pero se omiten al cargar.
- No se documenta soporte de tool calling, agentes ni modos de razonamiento; es un modelo de embeddings, no generativo.

## Casos de uso

- Búsqueda semántica sobre documentación técnica: indexar fragmentos largos como pasajes y consultas de usuario como queries, aprovechando los 32.768 tokens de contexto para no trocear en exceso.
- RAG en pipelines de preguntas y respuestas: generar embeddings de pasajes de base de conocimiento y de la pregunta del usuario, con la similitud coseno como señal de recuperación directa.
- Deduplicación y agrupamiento de documentos: comparar embeddings de artículos o incidencias para detectar contenido redundante mediante umbrales de coseno.
- Clasificación y enrutamiento por similitud: asignar tickets de soporte a colas o etiquetas comparando su embedding con prototipos por categoría.
- Búsqueda multilingüe: al validarse con textos en CJK, puede emplearse para recuperación entre idiomas, siempre que se verifique empíricamente en el dominio objetivo.
- Inferencia local en Mac: desplegar el servicio de embeddings en Apple Silicon con MLX para prototipos y entornos de desarrollo sin GPU dedicada.
- Evaluación de recuperación en investigación: usar la build como referencia reproducible en MLX con fidelidad documentada frente a PyTorch (coseno mínimo 0,9997).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento documentado es la fidelidad de conversión: similitud coseno en el peor caso de 0,9997 frente a la referencia en PyTorch (transformers 5.20, CPU fp32, lotes idénticos con padding a la derecha, textos multilingües incluido CJK), validada el 2026-11-12 con un umbral interno superior a 0,999.

## Requisitos de hardware

- VRAM estimada: en BF16, los 1.554.710.528 parámetros ocupan aproximadamente 3,1 GB de pesos; el repositorio completo pesa 3,1 GB. La memoria adicional depende del tamaño de lote y de la longitud de secuencia (hasta 32.768 tokens).
- GPU recomendadas: no se documentan GPU concretas para esta build; está orientada a MLX, es decir, Apple Silicon (chip unificado).
- Compatibilidad con GPU de consumo: no se especifica; el formato MLX no está pensado para GPU NVIDIA o AMD, y en Apple Silicon la memoria se comparte con el sistema.
- Opciones de despliegue: módulo propio `nemotron35_embed_mlx.py` con `nem.load(...)`. El autor advierte explícitamente de que `mlx_lm.load` y `mlx_vlm.load` cargan la variante causal y producen embeddings incorrectos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| OpenGryd/Nemotron-3.5-Embed-1B-BF16-MLX | 1.554.710.528 | 32.768 | 2048 | OpenMDW-1.1 | safetensors BF16 / MLX |
| nvidia/Nemotron-3.5-Embed-1B-BF16 | 1.554.710.528 | 32.768 | 2048 | OpenMDW-1.1 | safetensors BF16 / PyTorch (incluye ruta de visión) |
| mlx-community/Nemotron-3-Embed-1B-BF16 | No disponible | No disponible | No disponible | No disponible | safetensors BF16 / MLX |

La comparación de rendimiento entre estos modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Esta build solo sirve la ruta de texto; las entradas de imagen no están conectadas aunque los tensores de visión se incluyan en el repositorio.
- Cargar el modelo con `mlx_lm.load` o `mlx_vlm.load` produce embeddings incorrectos por seleccionar la variante causal; es obligatorio usar el módulo del repositorio.
- No se publica lista de idiomas soportados; el multilingüismo solo está evidenciado por la validación con textos CJK.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo de embeddings, el riesgo se traslada a recuperaciones irrelevantes o falsos positivos en similitud.
- La licencia OpenMDW-1.1 es distinta de Apache-2.0 y debe revisarse en `LICENSE`, `NOTICE` y `THIRD_PARTY_NOTICES.md` antes de un uso comercial; los modelos base Ministral sí son Apache-2.0.
- El repositorio tiene un volumen de adopción muy bajo (67 descargas, 1 like) y fue creado y actualizado el mismo día (2026-11-12), por lo que la validación comunitaria es escasa.
- No se dispone de datos de entrenamiento, benchmarks de recuperación ni métricas de latencia, lo que limita la evaluación previa a producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenGryd/Nemotron-3.5-Embed-1B-BF16-MLX
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-BF16
- Conversión MLX de referencia: https://huggingface.co/mlx-community/Nemotron-3-Embed-1B-BF16
