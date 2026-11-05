# richardyoung/gemma-2-27b-it-MPOA-heretic

## Resumen

`richardyoung/gemma-2-27b-it-MPOA-heretic` es un derivado "decensored" (también etiquetado como *abliterated* o *uncensored*) del modelo `google/gemma-2-27b-it`. Lo publica el usuario richardyoung y se ha generado con la herramienta Heretic v2.0.0, que aplica una técnica de ablación ortogonal con preservación de magnitud (MPOA, *Magnitude-Preserving Orthogonal Ablation*) sobre los pesos del modelo original para reducir la tasa de rechazos ante peticiones que el modelo base rechazaría.

El modelo conserva la arquitectura y el tamaño del Gemma 2 de 27 000 millones de parámetros de Google (transformer decoder-only con atención alterna local/global y *soft-capping*), pero modifica quirúrgicamente determinadas direcciones de las proyecciones de salida de atención (`attn.o_proj`) y de bajada del MLP (`mlp.down_proj`). Según la model card, la tasa de rechazos baja de 100/100 en el modelo original a 74/100 en esta variante, con una divergencia KL de 0,0991 respecto al original.

Su relevancia es acotada: no es un modelo nuevo ni una mejora de capacidades, sino una variante de investigación para estudiar el comportamiento de rechazo, la alineación y las técnicas de ablación de direcciones en modelos abiertos. Es reproducible (el autor publica los parámetros y el directorio `reproduce/`) y hereda la licencia Gemma de Google.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), con atención alterna local/global y *soft-capping* |
| Parámetros totales | 27 227 128 320 (≈27,2 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Gemma 2 soporta 8192 tokens; no confirmado en esta ficha) |
| Tipos de cuantización | pesos nativos en bfloat16; no se listan cuantizaciones publicadas (GGUF, AWQ, GPTQ: no disponibles) |
| Idiomas soportados | no disponible (la model card del base declara inglés; no confirmado para esta variante) |
| Licencia | Gemma (términos de uso de Google, con *gated access*) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Gemma 2 27B: un transformer decoder-only con normalización RMSNorm, activación GeGLU en el MLP, atención con RoPE y un esquema de atención intercalada entre ventanas locales y globales, además de *soft-capping* en los logits de atención. El modelo base fue entrenado por Google sobre datos mayoritariamente en inglés y posteriormente ajustado por instrucciones (variante `-it`); no se dispone en la información proporcionada del número exacto de tokens de entrenamiento ni de la composición del dataset.

La modificación de esta variante no es un *fine-tuning* adicional, sino una ablación de direcciones en el espacio de pesos. Heretic v2.0.0 identifica direcciones asociadas al comportamiento de rechazo y las elimina de forma ortogonal preservando la magnitud de los pesos originales. Los parámetros publicados en la model card incluyen `direction_index` = 20,65, `attn.o_proj.max_weight` = 1,17 en la posición 27,03, `attn.o_proj.min_weight` = 0,93 a distancia 20,00, `mlp.down_proj.max_weight` = 1,30 en la posición 28,30 y `mlp.down_proj.min_weight` = 1,13 a distancia 12,56. El resultado declarado es una reducción de rechazos de 100/100 a 74/100 con una KL de 0,0991 frente al original. El proceso es reproducible mediante el directorio `reproduce/` del repositorio.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia de Gemma 2 (`apply_chat_template`).
- Razonamiento, respuesta a preguntas y resumen, heredados del modelo base.
- Generación de código y matemáticas a nivel del Gemma 2 27B original (sin mejoras específicas declaradas).
- Reducción del comportamiento de rechazo: acepta con mayor frecuencia peticiones que el modelo base declinaría (74/100 frentes a 100/100).
- Compatible con `text-generation-inference` y con *endpoints* de Hugging Face según las etiquetas del repositorio.
- No se declaran capacidades de *tool calling*, agentes, visión, audio ni modo *thinking* en la información disponible.
- Capacidades multilingües: no confirmadas para esta variante.

## Casos de uso

- Investigación sobre alineación y rechazo: comparar las respuestas del modelo base y de esta variante sobre el mismo conjunto de *prompts* permite estudiar qué direcciones de pesos codifican el comportamiento de rechazo y cómo afecta la ablación a la distribución de salidas (KL de 0,0991).
- Reproducción de experimentos de *abliteration*: el directorio `reproduce/` y los parámetros MPOA publicados permiten replicar el proceso con Heretic v2.0.0 sobre otros modelos o sobre el mismo, validando la metodología.
- Evaluación de robustez de filtros de seguridad: desplegar esta variante como modelo "adversario" en pruebas de *red teaming* para medir si los clasificadores de salida y las capas de moderación externas detectan contenido que el modelo base rechazaría.
- Generación creativa sin restricciones de estilo: escritura de ficción, guiones o narrativa con temáticas sensibles donde el modelo base tiende a rechazar por precaución excesiva, siempre con revisión humana y cumplimiento legal.
- *Benchmarking* de degradación por ablación: medir en tareas estándar (MMLU, GSM8K, HumanEval) cuánto rendimiento se pierde al aplicar MPOA, usando el modelo base como referencia.
- Experimentos académicos de interpretabilidad: analizar las proyecciones `attn.o_proj` y `mlp.down_proj` modificadas para estudiar cómo se representa el comportamiento de rechazo en el espacio de activaciones.
- Despliegue en pipelines de generación de texto con `transformers` o TGI cuando se requiera el tamaño y la calidad de Gemma 2 27B con menor tasa de rechazos, asumiendo los riesgos de contenido.

## Benchmarks y rendimiento

| Métrica | Este modelo | Modelo original (`google/gemma-2-27b-it`) |
|---|---|---|
| Rechazos | 74/100 | 100/100 |
| Divergencia KL | 0,0991 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 54 GB solo para pesos, más caché KV y activaciones; se recomienda al menos 80 GB para contexto largo.
- VRAM estimada en float32 (upcast): aproximadamente 109 GB; no aporta precisión adicional según la model card.
- GPU recomendadas: A100 80 GB, H100 80 GB, o múltiples GPU con `device_map="auto"` (por ejemplo, 2× RTX 4090 de 24 GB o 2× A6000 de 48 GB).
- No cabe en una única GPU de consumo (RTX 4090, 3090, 4080) en bfloat16; requeriría cuantización a 4 bits (no publicada en el repositorio, pero factible con herramientas externas) para aproximarse a los 14-16 GB.
- Opciones de despliegue: `transformers` con `accelerate`, `text-generation-inference` (etiqueta del repo), `local-gemma` para CLI; `llama.cpp`/Ollama requerirían conversión a GGUF no incluida.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Comportamiento de rechazo | Disponibilidad |
|---|---|---|---|---|---|
| `richardyoung/gemma-2-27b-it-MPOA-heretic` | 27,2 B | no disponible | Gemma | 74/100 | Hugging Face (gated) |
| `google/gemma-2-27b-it` | 27,2 B | no disponible | Gemma | 100/100 | Hugging Face (gated) |
| Otras variantes *abliterated* de Gemma 2 27B | 27,2 B | no disponible | Gemma | no disponible | Hugging Face |
| Modelos de ~27-34 B comparables (p. ej. familia Qwen o Yi) | ~27-34 B | no disponible | variable | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos en la información proporcionada para establecer diferencias de rendimiento frente a alternativas.

## Limitaciones y advertencias

- La reducción de rechazos implica que el modelo puede generar contenido dañino, ilegal o inseguro que el modelo base evitaría; no debe desplegarse en producción orientada a usuarios sin capas de moderación externas.
- La ablación introduce una divergencia KL de 0,0991 respecto al original, lo que puede degradar sutilmente la coherencia, la factualidad o el seguimiento de instrucciones; no se han publicado evaluaciones que lo cuantifiquen.
- Riesgo de alucinación heredado del modelo base, potencialmente agravado por la modificación de pesos.
- Sesgos conocidos del modelo base (entrenado principalmente en inglés) que persisten y no han sido mitigados en esta variante.
- Idiomas soportados no confirmados; la model card del base declara inglés y no se garantiza un comportamiento multilingüe fiable.
- Licencia Gemma con acceso restringido (*gated*): es obligatorio aceptar los términos de Google y existen restricciones de uso comercial y de redistribución que deben revisarse antes de cualquier despliegue.
- El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, sin validación comunitaria; tratar como artefacto de investigación.
- No se publican cuantizaciones GGUF/AWQ/GPTQ, lo que limita el despliegue en hardware de consumo.
- La fecha de creación del repositorio (2026-11-05) y la ausencia de métricas estándar hacen recomendable una evaluación propia antes de cualquier uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/gemma-2-27b-it-MPOA-heretic
- Modelo base: https://huggingface.co/google/gemma-2-27b-it
- Heretic (herramienta de decensurado): https://heretic-project.org
- Directorio de reproducción: `reproduce/README.md` dentro del repositorio del modelo
- Documentación de Gemma: https://ai.google.dev/gemma/docs
- Responsible Generative AI Toolkit: [rai-toolkit] (referenciado en la model card de Gemma)
- Gemma en Kaggle: https://www.kaggle.com/models/google/gemma
- Gemma en Vertex Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemma
- Términos de uso de Gemma: https://www.kaggle.com/models/google/gemma/license/consent/verify/huggingface?returnModelRepoId=google/gemma-2-27b-it
- `local-gemma` (CLI de Hugging Face): https://github.com/huggingface/local-gemma
