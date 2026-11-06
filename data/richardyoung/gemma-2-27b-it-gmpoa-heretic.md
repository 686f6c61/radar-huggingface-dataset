# richardyoung/gemma-2-27b-it-GMPOA-heretic

## Resumen

`richardyoung/gemma-2-27b-it-GMPOA-heretic` es una variante "decensored" (también etiquetada como *abliterated* o *uncensored*) del modelo `google/gemma-2-27b-it`. La ha publicado el usuario richardyoung aplicando la herramienta Heretic v2.0.0, que realiza una ablación ortogonal de direcciones en los pesos del modelo para reducir los rechazos (refusals) ante peticiones que el modelo original bloquearía. No es un modelo entrenado desde cero ni un fine-tuning con datos nuevos: es una modificación quirúrgica de los pesos del Gemma 2 original.

El modelo base, Gemma 2 27B, es un transformer decoder-only de Google derivado de la investigación de Gemini, con 27.227.128.320 parámetros y pensado para generación de texto, respuesta a preguntas, resumen y razonamiento. Esta variante conserva la arquitectura, el tokenizador y la ventana de contexto del original; lo único que cambia es el comportamiento de alineación.

La relevancia de esta ficha es doble: por un lado documenta una técnica concreta de modificación de pesos (GammaMPOA) y sus parámetros; por otro, advierte de que se trata de un modelo derivado con la licencia Gemma y con las implicaciones de seguridad que conlleva eliminar total o parcialmente los mecanismos de rechazo. El repositorio ocupa 54,5 GB en safetensors y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) |
| Parametros totales | 27.227.128.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 2 27B soporta 8.192 tokens) |
| Tipos de cuantizacion | no disponible en la model card; los pesos nativos se exportan en bfloat16 |
| Idiomas soportados | no disponible (la model card del base indica ingles; el campo de idiomas del repo esta vacio) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del Gemma 2 27B original: un transformer decoder-only con atención y capas MLP estándar, pesos exportados en `bfloat16`. Esta variante no introduce cambios estructurales; lo que hace Heretic v2.0.0 es una **Gamma-Exact Magnitude-Preserving Orthogonal Ablation (GammaMPOA)**, es decir, una ablación ortogonal que preserva la magnitud de los pesos y que se aplica sobre direcciones concretas de las proyecciones `attn.o_proj` y `mlp.down_proj`. Los parámetros publicados en la model card son: `direction_index` = 23,66; en `attn.o_proj`, `max_weight` = 1,07 en la posición 38,10 y `min_weight` = 0,92 a distancia 26,07; en `mlp.down_proj`, `max_weight` = 0,79 en la posición 34,59 y `min_weight` = 0,15 a distancia 23,59.

No hay información sobre datos de entrenamiento adicionales, número de tokens, composición del dataset ni fases de RLHF/DPO específicas para esta variante: el autor no las documenta y el proceso de Heretic no requiere entrenamiento supervisado, sino la modificación de pesos del modelo ya alineado. La model card reporta como métricas del proceso 73/100 rechazos (frente a 100/100 del original) y una divergencia KL de 0,0969 respecto al modelo base, lo que cuantifica cuánto se ha desplazado la distribución de salida.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat (`apply_chat_template`) compatible con el formato de Gemma 2.
- Respuesta a preguntas, resumen y razonamiento de propósito general, heredados del Gemma 2 27B.
- Reducción drástica de rechazos: la model card reporta 73/100 refusals frente a 100/100 del original, es decir, responde a un subconjunto de peticiones que el modelo alineado rechazaría.
- Capacidad de seguir instrucciones y mantener rol de asistente, aunque con menor adherencia a políticas de seguridad.
- Soporte de tool calling / function calling: no documentado específicamente para esta variante; debe asumirse el del modelo base, no verificado.
- Capacidades de agente y razonamiento multi-paso: no documentadas para esta variante.
- Capacidades multilingües: no disponibles; la model card del base indica inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- **Investigación sobre alineación y seguridad**: comparar las respuestas de esta variante con las de `google/gemma-2-27b-it` para estudiar qué direcciones de activación codifican el comportamiento de rechazo, usando la KL de 0,0969 como medida de deriva.
- **Evaluación de técnicas de ablación**: reproducir el pipeline de Heretic v2.0.0 con los parámetros GammaMPOA publicados (`direction_index` 23,66, pesos por capa) y medir el efecto sobre benchmarks de utilidad y de seguridad.
- **Red teaming controlado**: generar un corpus de respuestas que el modelo alineado bloquearía para entrenar clasificadores de contenido o sistemas de moderación, siempre en un entorno aislado y con revisión humana.
- **Generación creativa sin filtros excesivos**: escritura de ficción, guiones o diálogos con temáticas sensibles donde los rechazos del modelo alineado interrumpen el flujo creativo, con revisión editorial posterior.
- **Prototipado de asistentes conversacionales internos**: despliegue en un entorno cerrado con `transformers` y `device_map="auto"` para probar plantillas de chat y flujos multi-turno antes de decidir si se usa el modelo alineado en producción.
- **Destilación y generación de datos sintéticos**: producir pares instrucción-respuesta diversos para fine-tuning de modelos más pequeños, filtrando después por calidad y políticas de uso.
- **Benchmarking de robustez**: medir la degradación de capacidades (razonamiento, código, matemáticas) tras la ablación comparando con el Gemma 2 27B original en el mismo harness.

## Benchmarks y rendimiento

La model card solo publica métricas del proceso de ablación, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Este modelo | Modelo original (google/gemma-2-27b-it) |
|---|---|---|
| Refusals | 73/100 | 100/100 |
| KL divergence | 0,0969 | 0 (por definición) |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM en bfloat16**: los 27.227 millones de parámetros a 2 bytes por parámetro suponen aproximadamente 54,5 GB de pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 60-64 GB de VRAM para inferencia cómoda.
- **GPU recomendadas**: A100 80 GB, H100 80 GB o dos GPU de 40-48 GB en paralelo con `device_map="auto"` y `accelerate`.
- **Consumer GPU**: no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) en bfloat16; requeriría cuantización a 4 bits (aproximadamente 14-16 GB) para intentar encajar en una sola GPU de 24 GB, opción no documentada por el autor.
- **Opciones de despliegue**: `transformers` con `pipeline` o `AutoModelForCausalLM`, `accelerate` para multi-GPU, y el wrapper `local-gemma` para CLI (`local-gemma --model 27b --preset speed`). El tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints de Hugging Face, aunque no se detalla.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Refusals (segun autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| richardyoung/gemma-2-27b-it-GMPOA-heretic | 27,2 B | no disponible | 73/100 | gemma | Hugging Face, 0 descargas |
| google/gemma-2-27b-it | 27,2 B | 8.192 tokens | 100/100 | gemma | Hugging Face, gated |
| Otras variantes abliterated de Gemma 2 27B | 27,2 B | dependen del base | no disponible | gemma | Hugging Face, variable |

No se dispone de datos de benchmarks de capacidad para comparar rendimiento real frente a alternativas; la comparación se limita a parámetros, contexto, licencia y comportamiento de rechazo documentado.

## Limitaciones y advertencias

- **Seguridad**: el modelo ha sido modificado para reducir rechazos (73/100 frente a 100/100); puede generar contenido dañino, ilegal o inseguro que el modelo original bloquearía. No debe desplegarse en producción orientada a usuarios sin moderación externa.
- **Sesgos**: hereda los sesgos del Gemma 2 27B original; la ablación no los corrige y puede alterar la distribución de respuestas de formas no medidas.
- **Alucinación**: sin cambios documentados respecto al base; el riesgo de inventar datos persiste y no hay evaluación específica.
- **Idioma**: la model card del base indica inglés; el campo de idiomas de este repo está vacío y no hay evidencia de soporte multilingüe.
- **Contexto**: no se documenta la ventana de contexto de esta variante; debe asumirse la del base (8.192 tokens) sin garantía.
- **Licencia**: se hereda la licencia Gemma, con las restricciones de uso comercial y la puerta de acceso (`extra_gated_prompt`) de Google; verificar los términos antes de cualquier uso comercial.
- **Madurez**: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (2026-11-06); no hay evidencia de validación por terceros ni de calidad en producción.
- **Trazabilidad**: el proceso Heretic v2.0.0 y los parámetros GammaMPOA están documentados, pero no se publican benchmarks de capacidad ni comparativas exhaustivas con el base.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/gemma-2-27b-it-GMPOA-heretic
- Modelo base: https://huggingface.co/google/gemma-2-27b-it
- Heretic: https://heretic-project.org
- Página de Gemma: https://ai.google.dev/gemma/docs
- Responsible Generative AI Toolkit: https://ai.google.dev/responsible
- Gemma en Kaggle: https://www.kaggle.com/models/google/gemma
- Gemma en Vertex Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemma
- Términos de uso de Gemma: https://www.kaggle.com/models/google/gemma/license/consent/verify/huggingface?returnModelRepoId=google/gemma-2-27b-it
- Repositorio local-gemma: https://github.com/huggingface/local-gemma
