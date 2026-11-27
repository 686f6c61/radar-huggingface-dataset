# gpustack/Qwen3.8-27B-Coder390-MLX-5bit-dynamic

## Resumen

`gpustack/Qwen3.8-27B-Coder390-MLX-5bit-dynamic` es una cuantización dinámica de 5 bits en formato MLX del modelo `nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2`, un modelo multimodal de 27.356.728.560 parámetros orientado a código y razonamiento. Lo publica el equipo de GPUStack y está pensado específicamente para ejecutarse en Apple Silicon mediante las librerías `mlx-lm`, `mlx-vlm` y `mlx-dspark`.

El problema que resuelve es el de llevar un modelo de casi 27.400 millones de parámetros a un formato que quepa y rinda en hardware de Apple: los pesos cuantizados ocupan aproximadamente 19,41 GiB repartidos en 5 shards, frente a un repo total de 23,3 GB. La cuantización es mixta y dinámica: aplica precisión por módulo (8 bits en embeddings y proyecciones de atención lineal, 6 bits en las proyecciones de self-attention y en las capas MLP primera y última, 5 bits en las MLP interiores) y preserva en BF16 la torre de visión y todas las normalizaciones.

Es relevante por tres motivos: mantiene intacta la capacidad multimodal (torre de visión en BF16), incorpora un drafter especulativo `DFlash2-FP8` empaquetado en `speculator/` para decodificación especulativa, y conserva la licencia Apache-2.0 del modelo original, lo que facilita su uso comercial. La arquitectura subyacente se etiqueta como `qwen3_5` en los tags, con atención lineal de tipo GDN (gated delta net) combinada con self-attention clásica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal GDN (`linear_attn`) y self-attention; tag de arquitectura `qwen3_5`; pipeline `image-text-to-text` |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine, `group_size = 64`, mixta dinámica: 8-bit (`Q8G64`), 6-bit (`Q6G64`), 5-bit (`Q5G64`) y BF16 preservado en visión y normalizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (5 shards), ~19,41 GiB de pesos cuantizados; repo de 23,3 GB |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida que combina capas de atención lineal (`linear_attn` con proyecciones `in_proj_qkv`, `in_proj_z`, `in_proj_a`, `in_proj_b` y `out_proj`) con capas de self-attention convencional (`q_proj`, `k_proj`, `v_proj`, `o_proj`), organizadas en al menos 64 capas (`layers.0` a `layers.63`). Incluye un codificador visual (`model.visual.*`) que se conserva íntegro en BF16 en esta cuantización, por lo que el modelo mantiene su naturaleza multimodal imagen-texto. El nombre del modelo base sugiere un pipeline de SFT seguido de RLOO (RLHF con estimador de ventaja leave-one-out) y una etapa MTP (multi-token prediction), aunque no se dispone de detalles verificables sobre la composición del dataset ni el número de tokens de entrenamiento.

La innovación técnica de esta ficha no está en el entrenamiento sino en la cuantización: GPUStack aplica precisión por módulo según su sensibilidad. Las capas más críticas para la estabilidad numérica (embeddings, `lm_head`, proyecciones `in_proj_a`/`in_proj_b` de la atención lineal) van a 8 bits; las proyecciones de atención y las MLP de los extremos (capa 0 y 63) a 6 bits; y solo las MLP interiores y las proyecciones `in_proj_qkv`/`in_proj_z` bajan a 5 bits. Además, se empaqueta un drafter especulativo `DFlash2-FP8` en el subdirectorio `speculator/`, lo que habilita decodificación especulativa para reducir latencia en generación autoregresiva.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento eficiente heredado del modelo base (sufijo `EfficientThink`).
- Generación y edición de código (sufijo `Coder390`), incluyendo lenguajes como Rust según el ejemplo de la model card.
- Comprensión de imágenes y respuesta texto-a-partir-de-imagen (pipeline `image-text-to-text`), con torre de visión en BF16 sin cuantizar.
- Conversación multi-turno (tag `conversational`).
- Decodificación especulativa mediante el drafter `DFlash2-FP8` empaquetado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes autónomos: no disponible explícitamente, aunque el razonamiento multi-paso es plausible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistencia de programación en local sobre Mac: el modelo puede generar funciones completas (por ejemplo, fusionar slices ordenados en Rust) ejecutándose íntegramente en Apple Silicon con `mlx-lm`, sin depender de la nube.
- Análisis de capturas de pantalla y diagramas técnicos: gracias a la torre de visión preservada en BF16, se le puede pasar una imagen de un error de compilación o un diagrama de arquitectura y pedirle explicación o código asociado.
- Revisión de código con contexto visual: combinación de fragmentos de código e imágenes de documentación en la misma conversación usando `mlx-vlm`.
- Prototipado rápido en portátiles Apple: los ~19,41 GiB de pesos permiten cargar el modelo en Macs con memoria unificada de 32 GB o superior, útil para experimentar con razonamiento y código sin GPU dedicada.
- Generación aumentada por recuperación (RAG) sobre documentación técnica: el modelo puede integrarse en pipelines que combinen recuperación de fragmentos y generación, aprovechando su faceta conversacional.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de calidad de una cuantización mixta 5/6/8 bits frente al modelo BF16 original en tareas de código.
- Despliegue con decodificación especulativa: el drafter `DFlash2-FP8` incluido permite reducir la latencia en entornos de inferencia interactiva sobre MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~19,41 GiB solo para pesos cuantizados; hay que sumar KV cache y overhead del runtime, por lo que se recomienda un mínimo de 24-32 GB de memoria unificada.
- Hardware objetivo: Apple Silicon (M-series). El formato MLX no está pensado para GPU NVIDIA ni AMD.
- ¿Cabe en consumer GPU? No en el sentido habitual: requiere Mac con memoria unificada. En Apple Silicon, un Mac Studio o MacBook Pro con 32 GB o más es el mínimo razonable; 64 GB da margen para contextos largos.
- Opciones de despliegue: `mlx-lm` (texto), `mlx-vlm` (multimodal) y `mlx-dspark` (decodificación especulativa con el drafter incluido). No es compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: no disponibles en la información proporcionada. La presencia del drafter `DFlash2-FP8` sugiere que el autor prioriza reducir latencia en generación, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / plataforma |
|---|---|---|---|---|
| gpustack/Qwen3.8-27B-Coder390-MLX-5bit-dynamic | ~27,36 B | no disponible | Apache-2.0 | MLX 5-bit mixto, Apple Silicon |
| nerkyor/Qwen3.8-27B-Coder390-...-DFlash2 (modelo base) | ~27,36 B | no disponible | Apache-2.0 | BF16, multiplataforma |
| Otras cuantizaciones del mismo base (no listadas) | no disponible | no disponible | Apache-2.0 | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables alternativos en la información proporcionada, por lo que la comparación se limita al modelo base y a la ausencia de métricas cuantitativas.

## Limitaciones y advertencias

- El nombre del modelo base apila múltiples sufijos (`Opus5.5`, `GPT6Astra`, `Grok4.7`, `DSV4Pro`, `K3`) que no corresponden a modelos reales identificables; conviene tratar la procedencia con escepticismo y verificar el modelo original antes de usarlo en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado el 27 de noviembre de 2026: no hay evidencia de uso comunitario ni validación independiente.
- No se han publicado resultados de benchmarks; se desconoce la degradación de calidad introducida por la cuantización mixta 5/6/8 bits frente al BF16 original.
- La cuantización a 5 bits en las MLP interiores puede afectar a tareas sensibles a precisión numérica (matemáticas, código con requisitos estrictos).
- Idiomas soportados no documentados: no se puede garantizar un buen rendimiento en castellano sin evaluación previa.
- Riesgo de alucinación inherente a modelos de 27 B sin datos de evaluación pública; especialmente relevante en modo razonamiento largo.
- Restricción de plataforma: solo funciona en Apple Silicon vía MLX; no es desplegable en infraestructura NVIDIA estándar sin reconversión.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad sobre la procedencia y los derechos del modelo base recae en el usuario.
- El drafter especulativo `DFlash2-FP8` está empaquetado pero no se documentan sus requisitos de memoria ni su tasa de aceptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gpustack/Qwen3.8-27B-Coder390-MLX-5bit-dynamic
- Modelo base: https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Librería MLX-LM: no disponible enlace directo en la información proporcionada
- Librería MLX-VLM: no disponible enlace directo en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
