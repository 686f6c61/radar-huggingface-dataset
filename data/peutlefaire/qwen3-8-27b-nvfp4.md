# Peutlefaire/Qwen3.8-27B-NVFP4

## Resumen

Peutlefaire/Qwen3.8-27B-NVFP4 es una cuantización de 4 bits en formato NVFP4 (punto flotante de 4 bits de NVIDIA) del modelo denso Qwen/Qwen3.8-27B, realizada mediante compresión post-entrenamiento con la librería `llm-compressor`. El autor, Peutlefaire, ha aplicado el mismo procedimiento que RedHatAI usó para su modelo MoE de 35B, pero con una diferencia clave: aquí también se han cuantizado las capas de atención lineal (`linear_attn`), lo que reduce aún más el consumo de memoria para contextos largos en GPUs de consumo como la RTX 5090.

El modelo base Qwen3.8-27B, desarrollado por Alibaba, es un modelo de lenguaje y visión nativo (comprende imágenes y vídeos) con control flexible de pensamiento, diseñado para tareas agénticas de múltiples pasos. Esta versión cuantizada permite ejecutar un modelo de 27.000 millones de parámetros en hardware de gama media-alta sin sacrificar demasiada calidad, manteniendo la licencia Apache 2.0 y un tamaño de repositorio de 20,6 GB. Es relevante ahora porque facilita el despliegue local de modelos de última generación con requisitos de VRAM asumibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (atención completa + atención lineal) con módulo MTP (multi-token prediction), basado en Qwen3.5 |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base soporta contexto largo, pero no se especifica el valor exacto) |
| Tipos de cuantizacion | NVFP4 (4 bits, punto flotante) |
| Idiomas soportados | en (según la model card; el modelo base probablemente soporta más idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento (PTQ) del checkpoint original Qwen/Qwen3.8-27B. No ha habido entrenamiento adicional: se ha aplicado un esquema de cuantización NVFP4 a todas las capas lineales, excluyendo `lm_head`, capas visuales, `mlp.gate`, `embed_tokens` y `shared_expert_gate`. A diferencia de la versión de RedHatAI, aquí también se han cuantizado las capas `linear_attn`, lo que reduce la memoria necesaria para ventanas de contexto largas. La calibración se realizó con 256 muestras del dataset HuggingFaceH4/ultrachat_200k, con una longitud máxima de secuencia de 4096 tokens y activando la opción `moe_calibrate_all_experts` (aunque el modelo es denso, el script lo conserva por compatibilidad). Los tensores MTP se guardaron sin cuantizar desde el checkpoint original.

El modelo base Qwen3.8-27B, sobre el que se construye esta cuantización, presenta una arquitectura híbrida que combina atención lineal y atención completa, junto con un módulo de predicción multi-token (MTP) que acelera la decodificación. Es un modelo nativo de visión-lenguaje, capaz de procesar imágenes y vídeos, y está optimizado para razonamiento agéntico de larga duración.

## Capacidades

- Generación de texto y razonamiento complejo, heredadas del modelo base Qwen3.8-27B.
- Comprensión de imágenes y vídeos (modelo nativo de visión-lenguaje).
- Control flexible de pensamiento (modo thinking activable o desactivable).
- Soporte para tareas agénticas de múltiples pasos (long-horizon agentic tasks).
- Generación de código y asistencia en programación.
- Capacidades multilingües: la model card solo lista inglés, aunque el modelo base de Qwen suele ser multilingüe; no se ha verificado en esta cuantización.
- Tool calling y function calling: no confirmado explícitamente en la documentación de esta cuantización, pero el modelo base lo soporta según la información oficial de Qwen.
- Decodificación acelerada mediante el módulo MTP (multi-token prediction), que permite predecir varios tokens por paso.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: gracias a la cuantización NVFP4 y a la inclusión de las capas `linear_attn` cuantizadas, el modelo cabe en 20,6 GB, lo que permite ejecutarlo en una RTX 5090 (32 GB) con margen para contextos largos.
- Asistentes de visión-lenguaje en local: al ser un modelo nativo multimodal, puede analizar imágenes y vídeos sin depender de servicios en la nube, útil en entornos con requisitos de privacidad.
- Agentes autónomos con razonamiento multi-paso: el modelo base está diseñado para tareas agénticas de larga duración, por lo que esta cuantización permite ejecutar agentes en hardware modesto.
- Generación de código en entornos de desarrollo integrados: puede integrarse en IDEs o pipelines de CI/CD para autocompletado y revisión de código, con la ventaja de ejecutarse localmente.
- Investigación y experimentación académica: al ser Apache 2.0 y de tamaño contenido, es adecuado para probar técnicas de cuantización y comparar rendimiento con el modelo original.
- Chat conversacional con contexto amplio: la cuantización de las capas de atención lineal reduce el consumo de memoria en secuencias largas, permitiendo mantener conversaciones extensas sin agotar la VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización en la información disponible. El modelo base Qwen3.8-27B cuenta con benchmarks oficiales de Alibaba (por ejemplo, en la liberación de Qwen 3.8-Max y Qwen 3.8-27B), pero no se dispone de los valores numéricos en los materiales consultados. Se recomienda evaluar esta versión cuantizada en tareas concretas antes de usarla en producción, ya que la cuantización de 4 bits puede introducir una degradación leve pero medible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 20,6 GB, por lo que se necesita al menos 24 GB de VRAM para cargar el modelo en FP4. Con overhead de inferencia, se recomiendan 32 GB (RTX 5090, RTX 4090 con 24 GB podría ser justo).
- GPU recomendadas: RTX 5090 (32 GB) es el objetivo declarado por el autor; también puede ejecutarse en A100 40 GB, H100, o GPUs profesionales con 32 GB o más.
- En GPUs de consumo: cabe en una RTX 5090; en una RTX 4090 (24 GB) podría no ser suficiente si se usan contextos largos.
- Opciones de despliegue: vLLM, SGLang, llama.cpp (si soporta NVFP4), Hugging Face Transformers con `compressed-tensors`. El formato es safetensors con compressed-tensors, compatible con el ecosistema de Hugging Face.
- Latencia y throughput: no disponibles. La cuantización NVFP4 suele ofrecer un rendimiento superior a FP16 en GPUs NVIDIA modernas gracias a la aceleración por hardware, pero no se han publicado mediciones para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Peutlefaire/Qwen3.8-27B-NVFP4 | 27,36 B (denso) | NVFP4 (4 bits) | No disponible | Apache 2.0 | Incluye capas `linear_attn` cuantizadas |
| unsloth/Qwen3.8-27B-NVFP4 | 27,36 B (denso) | NVFP4 (4 bits) | No disponible | Apache 2.0 | Misma cuantización, otro autor |
| Qwen/Qwen3.8-27B (original) | 27,36 B (denso) | FP16/BF16 | No disponible | Apache 2.0 | Modelo base sin cuantizar |
| RedHatAI/Qwen3.6-35B-A3B-NVFP4 | 35 B (MoE, 3 B activos) | NVFP4 (4 bits) | No disponible | Apache 2.0 | MoE, no cuantiza `linear_attn` |

La comparativa se basa en los datos disponibles; no se han encontrado mediciones de rendimiento relativas entre estas versiones.

## Limitaciones y advertencias

- La cuantización NVFP4 de 4 bits puede provocar una degradación en la calidad de generación, especialmente en tareas de razonamiento complejo o matemáticas, en comparación con el modelo original en FP16.
- La model card solo declara el idioma inglés, aunque el modelo base de Qwen suele ser multilingüe; no se ha verificado el comportamiento en otros idiomas en esta versión cuantizada.
- No se han publicado benchmarks específicos para esta cuantización, por lo que el rendimiento real en tareas concretas es incierto.
- El modelo puede presentar alucinaciones y sesgos inherentes a los modelos de lenguaje grandes; se recomienda validación humana en aplicaciones críticas.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario cumplir con los términos de los modelos base y datasets utilizados (Qwen3.8-27B y ultrachat_200k).
- El tamaño de 20,6 GB puede no caber en GPUs con menos de 24 GB de VRAM si se usan contextos largos, a pesar de la cuantización de las capas de atención lineal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Peutlefaire/Qwen3.8-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Modelo de referencia de RedHatAI: https://huggingface.co/RedHatAI/Qwen3.6-35B-A3B-NVFP4
- Artículo sobre especificaciones y hardware de Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Información general sobre Qwen 3.8: https://openlm.ai/qwen3.8/
- Guía de benchmarks y despliegue para Qwen 3.8-27B: https://ia4pymes.tech/en/blog/qwen-3-8-official-benchmarks-open-weights-27b-sme-guide
