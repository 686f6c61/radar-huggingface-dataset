# nchapman/Ornith-1.5-35B-A3B-W4A16-HGPTQ

## Resumen

Ornith-1.5-35B-A3B-W4A16-HGPTQ es una cuantización de 4 bits del modelo multimodal Ornith-1.5-35B-A3B, desarrollado originalmente por ornith-ai y cuantizado por nchapman. Se trata de un modelo de mezcla de expertos (MoE) con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, diseñado para tareas de razonamiento, código, uso de herramientas y comprensión de imágenes. La cuantización reduce el checkpoint de 66,97 GiB en BF16 a 19,24 GiB, un factor de compresión de 3,48×, manteniendo una degradación de calidad muy contenida según las evaluaciones del autor.

El interés de esta versión concreta reside en que hace viable el despliegue del modelo en hardware más modesto sin renunciar a las capacidades multimodales ni al mecanismo de decodificación especulativa nativo (MTP). La cuantización emplea GPTQ con rotación Hadamard en línea y descomposición de Cholesky (HGPTQ), una técnica que reduce el error de cuantización en proyecciones con valores atípicos, algo especialmente relevante en arquitecturas MoE donde las proyecciones de los expertos enrutados presentan distribuciones heterogéneas.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y es compatible con transformers y vLLM a través del formato compressed-tensors. Su pipeline es image-text-to-text, por lo que cubre tanto generación de texto como preguntas y respuestas sobre imágenes, incluyendo gráficos, documentos y capturas de interfaz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida (self_attn y linear_attn), MTP nativo y torre visual ViT de 27 bloques |
| Parametros totales | 35.951.822.704 |
| Parametros activos | Aproximadamente 3.000 millones por token (256 expertos enrutados, 40 capas) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A16, group size 64, GPTQ con Hadamard en línea y Cholesky (HGPTQ); pesos en 4 bits, activaciones en 16 bits |
| Idiomas soportados | No disponible (la model card menciona evaluaciones multilingües sin especificar lista) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors con compressed-tensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos con 40 capas que combina proyecciones de atención estándar (`self_attn`) y proyecciones de atención lineal (`linear_attn`), además de 256 expertos enrutados por capa y expertos compartidos (`mlp.shared_expert`). El modelo incorpora un módulo MTP (Multi-Token Prediction) nativo que actúa como borrador especulativo para decodificación acelerada, y una torre visual compuesta por 27 bloques ViT con proyecciones de fusión espacial (`visual.merger`). Los detalles sobre el número de tokens de entrenamiento, la composición del dataset y si se aplicaron técnicas de RLHF o DPO no están disponibles en la información proporcionada.

La innovación técnica de esta ficha es la cuantización HGPTQ: se aplica una rotación de Walsh-Hadamard en línea de bloque 64 sobre las activaciones de entrada antes de las proyecciones `gate_proj` y `up_proj` (K=2048) y sobre las activaciones intermedias post-SwiGLU antes de `down_proj` (K=512), mientras que los pesos se pre-rotan fuera de línea según W' = W·H₆₄/8. Posteriormente se aplica GPTQ con descomposición de Cholesky y `group_size=64` con `actorder="static"`. Se cuantizan 31.855 capas lineales en total: 30.970 del modelo de lenguaje, 775 del MTP y 110 de la torre visual. Permanecen en BF16 `embed_tokens`, `lm_head`, `linear_attn.in_proj_a`, `linear_attn.in_proj_b`, `mlp.gate`, `mlp.shared_expert_gate`, `mtp.fc`, `visual.patch_embed.proj`, normas y sesgos. El checkpoint incluye además rankings estáticos de expertos calientes (`static_hot_cache_rankings.json`) con una tasa de acierto del 40,91% para top-64 y 67,12% para top-128.

## Capacidades

- Generación de texto conversacional con configuración de muestreo por defecto de temperatura 1.0, top_p 0.95 y top_k 20.
- Razonamiento matemático y científico, evaluado en el conjunto de perplejidad de la model card junto con chat, código y uso de herramientas.
- Generación y comprensión de código, con rendimiento destacado en benchmarks de programación y agentes según la model card del modelo base.
- Uso de herramientas y function calling, integrable en flujos agénticos de múltiples pasos.
- Comprensión visual: respuesta a preguntas sobre imágenes (VQA), interpretación de gráficos, documentos y OCR.
- Comprensión de interfaces de usuario y matemáticas manuscritas o escaneadas (evaluado con ScreenSpot y Math OCR).
- Capacidades multilingües, mencionadas en las evaluaciones de perplejidad y en el holdout general multilingüe.
- Decodificación especulativa nativa mediante el módulo MTP, que actúa como borrador para acelerar la generación.
- Soporte de tool calling y razonamiento multi-paso orientado a agentes.

## Casos de uso

- Atención al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto amplio y, gracias a su naturaleza MoE con solo ~3B parámetros activos, responder con latencia baja en despliegues con vLLM, manteniendo además la capacidad de derivar a herramientas internas mediante function calling.
- Generación de código en producción: su rendimiento en benchmarks de coding y agentes lo hace adecuado para integrarse en pipelines de CI/CD, revisión automática de parches y generación de tests, con soporte de tool calling para consultar repositorios o ejecutar comandos.
- Extracción de datos de documentos escaneados: la torre visual de 27 bloques ViT, cuantizada con una degradación de similitud coseno de 0,9805 en VQA y OCR, permite procesar facturas, informes y formularios combinando OCR y razonamiento sobre el texto extraído.
- Automatización de tareas sobre interfaces gráficas: la evaluación en ScreenSpot (97,04% Top-1 end-to-end) indica que el modelo puede localizar elementos de UI, lo que habilita agentes que rellenan formularios o navegan aplicaciones de escritorio y web.
- Asistente de análisis de gráficos y datos visuales: interpretación de dashboards y gráficos junto con razonamiento numérico, útil en herramientas de business intelligence que reciben capturas o PDFs.
- Despliegue en infraestructura de gama media: con 19,24 GiB de pesos, el modelo cabe en una GPU de 24 GB en cuantización W4A16, lo que permite servir un MoE multimodal de 35B en una sola RTX 4090 o L4 para prototipos y cargas moderadas.
- Agentes de investigación multilingüe: combinación de comprensión de documentos en varios idiomas con razonamiento multi-paso y uso de herramientas de búsqueda, adecuado para pipelines de síntesis de información.

## Benchmarks y rendimiento

Los datos disponibles comparan la versión cuantizada contra el modelo base en BF16, no contra otros modelos de la categoría.

| Evaluacion | BF16 base | W4A16-HGPTQ | Notas |
|---|---:|---:|---|
| Tamano safetensors | 66,97 GiB | 19,24 GiB | Compresión 3,48× (−47,72 GiB) |
| Perplejidad de texto (378 prompts, 840k tokens) ↓ | 10,8033 | 10,2988 (−4,67%) | Chat, matemáticas, ciencia, código, tool use, multilingüe |
| Divergencia KL ponderada / media por token ↓ | 0,0000 | 0,1245 / 0,2462 | KL FP32 sobre vocabulario completo |
| Perplejidad holdout general y multilingüe (76 prompts, 20k tokens) ↓ | 249,8651 | 241,2982 (−3,43%) | KL media por token 0,1841; KL ponderada 0,2558 |
| MTP nativo (11.583 posiciones) | 100,0% Top-1 (NLL 4,4308) | 90,90% Top-1 (NLL 4,4442) | KL aislada MTP 0,0237; Top-1 end-to-end 73,64%, KL 0,2789 |
| Visión VQA, gráficos, documentos y OCR (96 imágenes, 302 tokens) | 1,0000 cos sim · 100,0% Top-1 | 0,9805 cos sim · 97,02% Top-1 | KL ViT aislada 0,0268; Top-1 end-to-end 94,04%, KL 0,1085 |
| Visión UI (ScreenSpot y Math OCR) (48 imágenes, 135 tokens) | 1,0000 cos sim · 100,0% Top-1 | 0,9850 cos sim · 97,04% Top-1 | KL ViT aislada 0,0150; Top-1 end-to-end 100,00%, KL 0,0310 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta versión cuantizada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19,24 GiB solo para pesos; con caché KV y overhead de runtime, se recomienda un mínimo de 24 GB para contexto corto y 32-48 GB para contextos largos o lotes mayores.
- GPU recomendadas: RTX 4090 (24 GB) para prototipos y cargas ligeras; L40S, A100 40/80 GB y H100 para producción con concurrencia.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB), siempre que se limite el contexto y el tamaño de lote.
- Opciones de despliegue: vLLM es la ruta principal recomendada por el formato compressed-tensors y el soporte de rotación Hadamard en runtime; transformers con compressed-tensors para evaluación; no se menciona soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La decodificación especulativa vía MTP puede mejorar el throughput, pero la tasa de acierto Top-1 end-to-end cae al 73,64% en la versión cuantizada frente al modelo BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-W4A16-HGPTQ | 35,95B | ~3B | No disponible | Apache 2.0 | Hugging Face (esta ficha) |
| Ornith-1.5-35B-A3B (BF16) | 35,95B | ~3B | No disponible | Apache 2.0 | Hugging Face |
| Ornith-1.5-35B-A3B-FP8 | 35,95B | ~3B | No disponible | Apache 2.0 | Hugging Face |
| Qwen 3.6-35B | No disponible | No disponible | No disponible | No disponible | No disponible |
| Gemma 4-31B | ~31B (denso) | ~31B | No disponible | No disponible | No disponible |
| Muse Glimmer-30B | ~30B (denso) | ~30B | No disponible | No disponible | No disponible |

Según la model card del modelo base, Ornith-1.5-35B-A3B supera a Qwen 3.6-35B en todos los benchmarks de coding y agentes, y a modelos densos como Gemma 4-31B y Muse Glimmer-30B por amplio margen en coding agéntico. No se dispone de cifras concretas de esos benchmarks en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce divergencia respecto al BF16: KL ponderada de 0,1245 en texto y caída de Top-1 del MTP al 90,90%, lo que puede afectar a la calidad de la decodificación especulativa en producción.
- La tasa de acierto Top-1 end-to-end del MTP cae al 73,64%, por lo que la aceleración por decodificación especulativa será menor que con el modelo sin cuantizar.
- En visión, la similitud coseno baja a 0,9805 en VQA/OCR y 0,9850 en UI, con Top-1 end-to-end del 94,04% en el primer conjunto; tareas de OCR muy sensibles pueden requerir validación adicional.
- No se dispone de información sobre sesgos, datos de entrenamiento ni composición del corpus, lo que dificulta evaluar riesgos de sesgo demográfico o lingüístico.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas de factualidad para esta versión.
- La longitud de contexto no está documentada en la información disponible, lo que impide planificar despliegues con ventanas largas sin verificación empírica.
- El soporte de runtime depende de la implementación de la rotación Hadamard en línea; fuera de vLLM o transformers con compressed-tensors, la inferencia puede producir resultados incorrectos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y esta cuantización no incluyen garantías; conviene revisar la model card original para condiciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente de la calidad de la cuantización.

## Enlaces

- [nchapman/Ornith-1.5-35B-A3B-W4A16-HGPTQ en Hugging Face](https://huggingface.co/nchapman/Ornith-1.5-35B-A3B-W4A16-HGPTQ)
- [ornith-ai/Ornith-1.5-35B-A3B (modelo base)](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B)
- [ornith-ai/Ornith-1.5-35B-A3B-FP8](https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-FP8)
