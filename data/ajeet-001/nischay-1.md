# Ajeet-001/nischay-1

## Resumen

Nischay-1 es un modelo de decisión multimodal (texto e imagen) publicado por el usuario Ajeet-001 en Hugging Face bajo licencia Apache 2.0. Se presenta como un "System-1 Decision Model", es decir, un modelo orientado a resolver tareas de elección entre opciones (clasificación, selección de respuesta, ranking) en lugar de generación libre de texto. Está construido sobre un backbone multimodal Gemma-4 identificado internamente como `stage7_kr_lora_wiseft_final`, con una cabeza de lectura propia denominada OneJev `slot_lm` y atención bidireccional SDPA sobre el prompt completo.

El modelo tiene 8.612.189.514 parámetros (aproximadamente 8,6 mil millones) y un repositorio de 17,3 GB en formato safetensors, lo que sugiere pesos en precisión alta. La model card documenta una evaluación sobre el "Decision Index 4.0" (versión 0.4.1) con dos suites, texto y visión, ejecutadas sobre una única NVIDIA A100-SXM4-40GB en bfloat16. Los resultados publicados incluyen puntuaciones corregidas por azar en once benchmarks de visión y cinco áreas de texto.

La relevancia del modelo es acotada: se trata de un checkpoint con cero descargas y cero likes en el momento de la consulta, sin paper asociado ni documentación externa, y con una model card que mezcla terminología propietaria (OneJev, Decision Index) con resultados autoinformados. Resulta útil como referencia de un enfoque de "modelo de decisión" multimodal sobre Gemma-4, pero no como un modelo de propósito general listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Gemma-4, con cabeza de lectura OneJev `slot_lm` y atención SDPA bidireccional (no causal) sobre el prompt completo |
| Parametros totales | 8.612.189.514 (8,6 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Texto: `max_branch_tokens = 65.536`, `max_request_tokens = 131.072`. Visión: `VISION_MAX_LEN = 8.192`, `max_pixels = 1.638.400` (1,6 MP), `max_soft_tokens = 560` |
| Tipos de cuantizacion | no disponible (la evaluación se realizó en bfloat16; no se documentan GGUF, AWQ, GPTQ ni otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, SHA-256 `08b40b1e574b5a83fb1b0e8d2fe9cc3f7848da3391bd976595ac7c9e4f7a621f`) |

## Arquitectura y entrenamiento

La arquitectura parte de un backbone Gemma-4 multimodal, sobre el que se aplica una etapa de ajuste identificada como `stage7_kr_lora_wiseft_final`, combinación de LoRA y WiSE-FT (interpolación de pesos entre el modelo ajustado y el original). La innovación declarada es la sustitución de la generación autorregresiva por una lectura tipo `slot_lm` de OneJev sobre el prompt completo con atención bidireccional SDPA, más un upcasting de la cabeza de salida a fp32. Esto convierte al modelo en un evaluador de opciones: dado un prompt y un conjunto de candidatos, produce una puntuación por opción en lugar de una secuencia de tokens.

No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. La model card sí documenta una calibración de temperatura sobre validación retenida específica por tipo de tarea (`choice = 1.046365`, `noul = 0.992323`, `score = 1.05787`, `global = 1.0433`, ajustada sobre N = 4.342 filas), lo que indica que el ajuste final se orientó a calibrar las puntuaciones de decisión más que a mejorar la generación.

## Capacidades

- Decisión multimodal texto-imagen: selección entre opciones candidatas en lugar de generación libre.
- Comprensión de imágenes en tareas de VQA, gráficos, infografías, documentos escaneados y emparejamiento imagen-texto.
- Extracción de información de documentos (KIE) sobre CORD y FUNSD, con 91,76% de precisión reportada.
- Razonamiento sobre interfaces y capturas de pantalla (Mind2Web), con 56,32% de precisión.
- Clasificación y moderación de contenido multimodal (Hateful Memes), con 59,77% de precisión.
- Tareas de texto de comprensión del lenguaje, recuperación, clasificación, herramientas y automatización, y razonamiento.
- Soporte de tool calling: no disponible como capacidad generativa; la suite de texto incluye un área "Tools & Automation" evaluada como decisión, no como ejecución de llamadas.
- Capacidades de agente multi-paso: no disponible.
- Modo "thinking": no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).

## Casos de uso

- Evaluación automática de respuestas generadas: el modelo puede puntuar pares pregunta-respuesta y seleccionar la mejor candidata, útil como juez en pipelines de evaluación de LLM, gracias a su formato de decisión calibrado.
- Extracción de campos en documentos escaneados: con 91,76% en KIE (CORD+FUNSD) y hasta 1,6 MP de resolución de entrada, es adecuado para digitalizar facturas y formularios eligiendo entre valores candidatos.
- Moderación de memes e imágenes con texto: la tarea de Hateful Memes (59,77%) encaja en un filtro de primera pasada dentro de un sistema de moderación, siempre con revisión humana.
- Enrutamiento y clasificación de consultas: el área de Retrieval & Classification (skill 52,38) permite usarlo como clasificador de intenciones o selector de documento relevante en un RAG.
- Automatización de interfaz (UI agents): con 56,32% en Mind2Web, puede seleccionar el elemento correcto de una captura de pantalla en flujos de automatización web, combinado con un ejecutor determinista.
- Verificación de gráficos e infografías: con 82,38% en InfographicVQA y 68,42% en CharXiv, sirve para responder preguntas de decisión sobre figuras en informes y dashboards.
- Selección de herramientas en asistentes: el área Tools & Automation (skill 73,59) lo hace apto para elegir qué herramienta invocar entre un conjunto fijo, dejando la ejecución a otro componente.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre Decision Index 0.4.1, 1x A100-SXM4-40GB, bfloat16.

| Suite | Headline | Raw Index | Breadth Skill | Requests | Cobertura |
|---|---:|---:|---:|---:|---:|
| Public Text Decision Index | 50,81 | 63,33 | 48,51 | 140.178 | 100,0% |
| Public Vision Decision Index | 53,57 | no disponible | no disponible | 12.210 | 100,0% |

Desglose de texto por área:

| Area | Benchmarks | Peso | Raw | Skill corregido |
|---|---:|---:|---:|---:|
| Tools & Automation | 5 | 18,3% | 75,84% | 73,59 |
| Language Understanding | 9 | 25,8% | 72,53% | 61,06 |
| Retrieval & Classification | 6 | 20,0% | 66,62% | 52,38 |
| Arts & Human Taste | 6 | 10,0% | 55,38% | 35,42 |
| Knowledge & Reasoning | 11 | 25,8% | 45,82% | 29,19 |

Desglose de visión por benchmark:

| Benchmark | Filas | Peso | Accuracy | Azar | Skill |
|---|---:|---:|---:|---:|---:|
| CV-Bench | 2.038 | 1,00 | 78,36% | 39,38% | 64,30 |
| BLINK | 961 | 1,00 | 64,00% | 35,41% | 44,26 |
| RealWorldQA | 589 | 1,00 | 63,67% | 38,81% | 40,62 |
| CharXiv | 532 | 1,00 | 68,42% | 25,00% | 57,89 |
| InfographicVQA | 244 | 1,00 | 82,38% | 25,00% | 76,50 |
| Mind2Web | 973 | 1,00 | 56,32% | 25,00% | 41,76 |
| Winoground | 800 | 1,00 | 82,75% | 50,00% | 65,50 |
| KIE (CORD+FUNSD) | 2.465 | 1,00 | 91,76% | 39,26% | 86,44 |
| Moderation (Hateful Memes) | 1.213 | 1,00 | 59,77% | 50,00% | 19,54 |
| R-Bench-M | 665 | 0,50 | 51,73% | 16,68% | 42,07 |
| MMMU-Pro vision | 1.730 | 0,25 | 28,44% | 12,81% | 17,92 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,6 B parámetros, en bfloat16 los pesos ocupan aproximadamente 17,2 GB, por lo que se necesitan al menos 20-24 GB de VRAM contando activaciones y caché. En fp32 serían unos 34,4 GB.
- GPU recomendadas: la evaluación se ejecutó en 1x NVIDIA A100-SXM4-40GB en bfloat16. Una A100 80GB, H100 o L40S ofrecen margen para batching. Una RTX 4090 (24 GB) podría alojar los pesos en bfloat16 con batches pequeños.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB como RTX 3090 o RTX 4090, siempre en bfloat16 y con batch reducido. No se documentan cuantizaciones que permitan bajar de ese umbral.
- Opciones de despliegue: la model card solo documenta el motor propio `engine:DecisionModel` del paquete `decision-index` con `transformers`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el uso de atención bidireccional con lectura `slot_lm` probablemente requiere código de inferencia específico.
- Latencia: texto, 87,73 ms de mediana y 441,15 ms de media en 200 peticiones sin batching; en modo batched, 30,0 ms de mediana, 119,8 ms de media y 143,0 ms de p80 sobre 140.178 filas. Visión, 209,79 ms de mediana, 301,92 ms de media, 320,44 ms p80 y 877,69 ms p95 con 560 soft tokens y 100 peticiones sin batching. No se publica throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nischay-1 | 8,6 B | 131.072 tokens (texto), 1,6 MP (visión) | Decisión multimodal sobre Gemma-4 | Apache 2.0 | Hugging Face, 0 descargas |
| Gemma 3 4B / 12B (Google) | 4 B / 12 B | 128.000 tokens | Generación multimodal | Gemma Terms | Amplia |
| Qwen2.5-VL 7B (Alibaba) | 7 B | 128.000 tokens | Generación multimodal con grounding | Apache 2.0 | Amplia |
| InternVL 2.5 8B | 8 B | 32.000 tokens | Generación multimodal | MIT | Amplia |

La comparación es orientativa: Nischay-1 no es un modelo generativo, sino un evaluador de opciones, por lo que no es intercambiable con los anteriores en tareas de chat o generación de código. No hay datos públicos que permitan comparar su Decision Index con métricas estándar de esos modelos.

## Limitaciones y advertencias

- Modelo con cero descargas y cero likes en el momento de la consulta, sin paper ni revisión externa; los resultados son autoinformados por el autor.
- La model card usa terminología propietaria (OneJev, Decision Index, `slot_lm`) sin especificación técnica pública del formato de decisión ni del código de inferencia.
- El rendimiento en razonamiento y conocimiento es bajo: skill 29,19 en Knowledge & Reasoning y 28,44% de precisión en MMMU-Pro vision, muy por debajo de modelos multimodales de tamaño similar.
- La moderación de memes arroja un skill de solo 19,54, apenas por encima del azar; no es fiable como único filtro.
- No se declaran idiomas soportados; el comportamiento fuera del inglés es desconocido y no debe asumirse.
- Riesgo de alucinación: aunque el formato de decisión reduce la generación libre, la calibración de temperatura se ajustó sobre 4.342 filas y puede no generalizar a dominios distintos.
- Los límites de contexto son estrictos: las entradas que superan `max_request_tokens` lanzan `Unsupported` en lugar de truncar, lo que exige validación previa en producción.
- La licencia Apache 2.0 permite uso comercial, pero el backbone Gemma-4 subyacente puede arrastrar condiciones adicionales de Google no reflejadas en la model card; conviene verificar la procedencia de los pesos antes de un despliegue comercial.
- No se documentan cuantizaciones, por lo que el despliegue en hardware limitado requiere convertir los pesos por cuenta propia sin garantías de fidelidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ajeet-001/nischay-1
- Resultados del Text Decision Index: https://huggingface.co/Ajeet-001/nischay-1-text-decision-index-results
- Resultados del Vision Decision Index: https://huggingface.co/Ajeet-001/nischay-1-vision-decision-index-results
- Repositorio Decision Index: https://github.com/apolinario/decision-index
- Paper, blog o demo oficiales: no disponible
