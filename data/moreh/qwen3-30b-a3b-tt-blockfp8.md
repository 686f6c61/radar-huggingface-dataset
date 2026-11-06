# moreh/Qwen3-30B-A3B-TT-BLOCKFP8

## Resumen

Qwen3-30B-A3B-TT-BLOCKFP8 es una versión cuantizada del modelo Qwen3-30B-A3B, publicada por el usuario moreh en Hugging Face. Se trata de una conversión a formato block FP8 (punto flotante de 8 bits por bloques) del modelo original de Qwen, que es un transformer con arquitectura Mixture-of-Experts (MoE) de 30 mil millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos por token. Esta cuantización busca reducir la huella de memoria del modelo para facilitar su despliegue en infraestructura con VRAM limitada, manteniendo una precisión numérica superior a la de cuantizaciones de 4 bits.

El modelo base Qwen3-30B-A3B pertenece a la familia Qwen3 desarrollada por Alibaba, y su diseño MoE con activación dispersa lo hace especialmente adecuado para escenarios de inferencia con alto throughput, ya que solo activa una fracción de sus parámetros por token generado. La versión TT-BLOCKFP8 conserva la arquitectura y los pesos del modelo original, pero los almacena en FP8 con granularidad de bloque, lo que requiere hardware con soporte nativo para operaciones FP8 (como GPUs Hopper o Ada Lovelace de NVIDIA) para aprovechar su rendimiento.

La relevancia de esta ficha radica en que se trata de una publicación reciente (noviembre de 2026) con acceso restringido, sin descargas ni interacciones registradas, y con información pública muy limitada. No se dispone de documentación técnica detallada sobre el proceso de cuantización, los parámetros de bloque utilizados ni los resultados de validación. Esta ficha se elabora exclusivamente a partir de los metadatos disponibles en Hugging Face y del conocimiento público del modelo base Qwen3-30B-A3B, indicando explícitamente cuando un dato no está disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE), basada en Qwen3-30B-A3B |
| Parámetros totales | 30 mil millones (30B) |
| Parámetros activos | Aproximadamente 3 mil millones (3B) por token |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen3-30B-A3B soporta contexto largo, pero no se confirma el valor exacto en esta ficha) |
| Tipos de cuantización | Block FP8 (TT-BLOCKFP8), punto flotante de 8 bits por bloques |
| Idiomas soportados | No disponible |
| Licencia | other (heredada del modelo base; acceso restringido en Hugging Face) |
| Formato de pesos | No disponible explícitamente; presumiblemente safetensors en FP8 por bloques |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3-30B-A3B, un transformer decoder-only con Mixture-of-Experts. En un MoE, cada capa contiene múltiples expertos (redes feed-forward) y un router que selecciona un subconjunto de ellos para cada token. En este caso, el modelo tiene 30B parámetros totales pero solo activa aproximadamente 3B por token, lo que reduce el coste computacional de la inferencia manteniendo una capacidad de representación elevada. Esta versión concreta no ha sido reentrenada: es una cuantización del modelo base, por lo que sus datos de entrenamiento, número de tokens y proceso de alineación (RLHF/DPO) corresponden al Qwen3-30B-A3B original, sobre el cual no se proporciona información detallada en los metadatos disponibles.

La innovación técnica de esta publicación es la cuantización TT-BLOCKFP8, que almacena los pesos en FP8 con escalas por bloque. Este esquema divide los tensores en bloques y aplica un factor de escala compartido por bloque, lo que reduce el error de cuantización en comparación con una escala por tensor. El prefijo "TT" podría referirse a una técnica específica del autor (posiblemente relacionada con "tensor train" o una implementación propia), pero no se dispone de documentación que lo confirme. No se han publicado detalles sobre el tamaño de bloque, el esquema de escalas, ni métricas de degradación de precisión (perplejidad, benchmarks) en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3-30B-A3B, incluyendo razonamiento multi-paso y respuesta a instrucciones.
- Generación de código: el modelo base Qwen3 está entrenado para tareas de programación, aunque no se confirman métricas específicas en esta versión cuantizada.
- Matemáticas: capacidad esperada por herencia del modelo base, sin datos de validación en FP8.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible, aunque el modelo base Qwen3 suele incluir soporte para ello.
- Soporte de agentes y razonamiento multi-paso: no confirmado en esta versión.
- Capacidades multilingües: no disponible; los idiomas no están listados en los metadatos.
- Capacidades especiales (thinking mode, visión, audio): no disponible; no se confirma si esta cuantización preserva modos especiales del modelo base.
- Eficiencia MoE: activación de ~3B parámetros por token, lo que reduce el coste de inferencia frente a un modelo denso de 30B.

## Casos de uso

- Despliegue en infraestructura con VRAM limitada: al almacenar los pesos en FP8, el modelo ocupa aproximadamente la mitad que una versión en BF16 (unos 30 GB frente a ~60 GB), lo que permite servirlo en GPUs de 40-48 GB como la A100 40GB o la L40S, siempre que el hardware soporte operaciones FP8.
- Inferencia de alto throughput en producción: la arquitectura MoE con ~3B parámetros activos reduce el coste computacional por token, y el formato FP8 aprovecha los tensor cores de GPUs Hopper (H100) para maximizar tokens por segundo en servicios de generación de texto a gran escala.
- Razonamiento y generación de código en pipelines internos: si se valida que la cuantización FP8 no degrada significativamente la calidad, el modelo puede integrarse en asistentes de programación o revisión de código dentro de entornos con acceso restringido, dado que el repositorio es gated.
- Experimentación académica con cuantización FP8: investigadores que estudien el impacto de la cuantización por bloques en modelos MoE pueden usar esta publicación como referencia, comparando su comportamiento con el modelo base en BF16.
- Servicio de chat multi-turno: el modelo base Qwen3-30B-A3B está diseñado para conversación; esta versión puede desplegarse en un endpoint de chat si se confirma que el contexto largo se preserva tras la cuantización.
- Evaluación de herramientas de serving compatibles con FP8: permite probar stacks como vLLM o TensorRT-LLM con pesos FP8 por bloques, midiendo latencia y throughput en hardware con soporte nativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 30B parámetros en FP8, los pesos ocupan aproximadamente 30 GB. Sumando overhead de activaciones, KV cache y buffers, se recomienda un mínimo de 40 GB de VRAM para contexto moderado.
- GPU recomendadas: NVIDIA H100 (80 GB) para máximo rendimiento FP8; A100 80GB o L40S (48 GB) para despliegues con menos margen; GPUs Ada Lovelace como RTX 4090 (24 GB) no son suficientes para los pesos completos en FP8 sin offloading.
- ¿Cabe en consumer GPU? No de forma completa en una sola GPU de 24 GB. Sería necesario dividir el modelo entre varias GPUs o usar offloading a CPU, lo que degradaría el rendimiento.
- Opciones de despliegue: se requiere un runtime con soporte para FP8 por bloques. vLLM y TensorRT-LLM son candidatos habituales para FP8 en GPUs NVIDIA, pero no se confirma compatibilidad explícita en la información disponible. llama.cpp y Ollama no soportan FP8 por bloques de forma nativa en el momento de redactar esta ficha.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, del tamaño de bloque FP8 y del runtime; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| moreh/Qwen3-30B-A3B-TT-BLOCKFP8 | 30B | ~3B | No disponible | Block FP8 | other (gated) | Restringida |
| Qwen/Qwen3-30B-A3B (base) | 30B | ~3B | No disponible en esta ficha | BF16 (original) | Según Qwen3 | Pública (según repositorio) |
| Versiones GGUF de Qwen3-30B-A3B | 30B | ~3B | Según variante | Q4_K_M, Q5_K_M, Q8_0, etc. | Según Qwen3 | Públicas en Hugging Face |

La comparación principal es con el modelo base en BF16: la versión TT-BLOCKFP8 reduce el espacio de pesos a la mitad, a costa de una posible degradación de precisión no cuantificada en la información disponible. Frente a cuantizaciones GGUF de 4-8 bits, el FP8 por bloques ofrece mayor fidelidad numérica pero requiere hardware específico y no es compatible con llama.cpp de forma estándar.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated; es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede limitar su uso en entornos automatizados.
- Licencia "other": no se especifican los términos exactos en los metadatos; es imprescindible revisar la licencia del modelo base Qwen3-30B-A3B antes de cualquier uso comercial.
- Sin datos de validación: no se han publicado métricas de perplejidad ni benchmarks que cuantifiquen la degradación introducida por la cuantización FP8 por bloques.
- Riesgo de alucinación: inherente al modelo base; la cuantización puede amplificar ligeramente los errores en tareas sensibles a la precisión numérica.
- Compatibilidad de hardware limitada: el FP8 por bloques requiere GPUs con soporte nativo (Hopper, Ada Lovelace) y runtimes específicos; en hardware sin soporte, el rendimiento puede degradarse o la carga fallar.
- Idiomas no confirmados: no se lista el conjunto de idiomas soportados en esta versión.
- Contexto no confirmado: no se especifica si la longitud de contexto del modelo base se preserva íntegramente tras la cuantización.
- Publicación sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación por parte de la comunidad.
- Sesgos: no documentados en esta publicación; se heredan los del modelo base, sobre los que no se proporciona información.

## Enlaces

- Hugging Face: https://huggingface.co/moreh/Qwen3-30B-A3B-TT-BLOCKFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
