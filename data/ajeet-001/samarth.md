# Ajeet-001/Samarth

## Resumen

Samarth es un modelo multimodal de decisión desarrollado por Ajeet-001, publicado en HuggingFace bajo licencia Apache 2.0. A diferencia de los modelos generativos convencionales, Samarth no muestrea tokens de forma autorregresiva: recibe un `state` (JSON estructurado, texto plano o entre 1 y 4 imágenes) y un conjunto de preguntas tipadas (`noul` binario/abstención, `choice` de hasta 256 opciones, o `score` ordinal), y devuelve una distribución de probabilidad calibrada sobre cada opción en un único prefill de prefijo compartido más un forward batcheado de sufijos.

El modelo se presenta como un "motor de decisión multimodal de 4B" con una torre de visión congelada y un backbone de lenguaje ajustado. Su propuesta diferencial es la eficiencia en inferencia de decisión: según el autor, resuelve 3 preguntas de texto en aproximadamente 60 ms en una GPU, y cubre también razonamiento visual sobre benchmarks como InfographicVQA, CharXiv y RealWorldQA dentro de la misma arquitectura.

La relevancia actual de Samarth radica en su enfoque hacia routing, guardrails y clasificación calibrada, casos donde la latencia y la fiabilidad probabilística importan más que la generación libre. No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor reporta un tamaño de repo de 15,9 GB con 7.941.100.874 parámetros en safetensors, cifra que no coincide con la denominación "4B" de la model card; esta discrepancia se detalla en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language con atención `block_bidirectional` (`noncausal`) en capas de atención completa; torre de visión congelada y backbone de lenguaje ajustado |
| Parametros totales | 7.941.100.874 (safetensors); la model card declara "4B activos" |
| Parametros activos | 4B (según model card; no se especifica si es MoE) |
| Longitud de contexto | no disponible (la model card indica que las peticiones que exceden la capacidad lanzan `Unsupported`, sin truncado) |
| Tipos de cuantizacion | no disponible (pesos en `bfloat16`, cabeza de salida en `float32`) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), `bfloat16`; cabeza de lectura `float32` |

## Arquitectura y entrenamiento

Samarth se construye sobre una arquitectura transformer multimodal con una torre de visión congelada y un backbone de lenguaje ajustado. La innovación principal es el mecanismo de lectura `slot_lm`: una cabeza LM de 256 slots de un solo token (letras `A`–`Z` y slots de dos letras) que permite mapear cada opción de una pregunta a un token dedicado y leer directamente su probabilidad, en lugar de generar texto. Las capas de atención completa usan una máscara `block_bidirectional` donde el prefijo de estado compartido es causal y cada sufijo de pregunta/opción atiende de forma bidireccional dentro de su propio bloque, lo que permite cachear el prefijo una sola vez para todas las preguntas.

El entrenamiento combina un objetivo conjunto de entropía cruzada más calibración de Brier (`λ = 1.0`) con supervisión de probabilidad 1:1 entre soft-teacher y hard-target. El autor reporta ECE de 3,62%–5,84% en texto y 8,90% en decisiones visuales multimodales, e incluye un `calibration.json` con temperatura `T = 0.70` para texto y `T = 1.0` para multimodal. Se declara decontaminación estricta respecto al Jev Decision Index (suites texto 0.3/0.4 y visión 0.3) mediante exclusión exacta de datasets y deduplicación de texto normalizado con SHA-256. No se especifican el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Decisión estructurada sobre texto e imágenes: devuelve distribuciones de probabilidad calibradas en lugar de texto generado.
- Preguntas de tipo `noul` (sí/no/abstención), `choice` (selección entre hasta 256 opciones nombradas) y `score` (niveles ordinales).
- Entrada multimodal con 1–4 imágenes por petición, hasta 1,6 MP por imagen.
- Razonamiento visual sobre infografías, gráficos, documentos escaneados y escenas del mundo real.
- Procesamiento de estado en JSON estructurado, texto plano o diálogos.
- Lectura de documentos y extracción de información clave (KIE sobre CORD y FUNSD).
- No se menciona soporte de tool calling, function calling ni agentes multi-paso.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Routing de tickets de soporte: el modelo recibe el texto del ticket y devuelve, en una sola pasada, la probabilidad de que sea una solicitud de reembolso (`noul`), el equipo adecuado (`choice` entre billing, technical o fraud) y la urgencia (`score` ordinal), con distribución calibrada para umbralizar decisiones.
- Guardrails de contenido: clasificación binaria con abstención (`noul`) sobre texto de entrada para decidir si una petición debe bloquearse o derivarse a revisión humana, aprovechando la calibración reportada (ECE de 3,62%–5,84%).
- Triaje de documentos escaneados: con 1–4 imágenes por petición y hasta 1,6 MP por imagen, el modelo puede leer formularios y facturas (KIE) y decidir categoría y prioridad sin pipeline OCR separado.
- Verificación de infografías y gráficos: responder preguntas de opción múltiple sobre InfographicVQA o CharXiv para validar afirmaciones de informes y presentaciones.
- Moderación visual en marketplaces: decidir si una imagen de producto cumple las políticas mediante preguntas `choice` sobre categorías predefinidas, con probabilidades para auditoría.
- Enrutamiento en asistentes conversacionales: dado el historial de diálogo como `state`, seleccionar la siguiente acción o herramienta entre un conjunto acotado de opciones (`choice`) en una sola pasada, con latencia declarada de ~60 ms para 3 preguntas en una GPU.
- Evaluación de riesgo en atención al cliente: puntuar urgencia y probabilidad de fraude en una misma petición con sufijos batcheados y prefijo cacheado, reduciendo coste frente a múltiples llamadas generativas.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre la suite pública completa del Official Vision Decision Index 0.3 (12.210 filas, 0 errores):

| Benchmark | Filas | Respondidas | Precisión (%) | Azar (%) | Skill (0–100) | Peso |
|---|---:|---:|---:|---:|---:|---:|
| KIE (CORD + FUNSD) | 2.465 | 2.465 | 88,88% | 39,26% | 81,70 | 1.0 |
| InfographicVQA | 244 | 244 | 80,74% | 25,00% | 74,32 | 1.0 |
| CV-Bench | 2.038 | 2.038 | 76,05% | 39,38% | 60,50 | 1.0 |
| Winoground | 800 | 800 | 80,00% | 50,00% | 60,00 | 1.0 |
| CharXiv (Reasoning) | 532 | 532 | 61,84% | 25,00% | 49,12 | 1.0 |

La model card trunca la tabla a partir de CharXiv; no se dispone de las filas restantes de los 11 benchmarks. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de las suites de texto del Jev Decision Index en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en `bfloat16`: aproximadamente 16 GB solo para pesos (7,94B parámetros), más overhead de activaciones, caché de prefijo y cabeza `float32`.
- GPU recomendadas: A100 40/80 GB o H100 para servir con margen; una RTX 4090 de 24 GB podría alojar los pesos en bf16 pero con poco margen para lotes y contexto largo.
- En consumer GPU: viable en RTX 4090 (24 GB) con lotes pequeños; en GPUs de 16 GB requeriría cuantización, para la cual no se documentan formatos.
- Opciones de despliegue: el autor proporciona un runtime propio (`OneJev @ 81ce62f1` con `serve.patch`) y el kit `decision-index`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia declarada: ~60 ms para 3 preguntas de texto en una GPU. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Samarth | 7,94B totales (4B declarados) | no disponible | Decisión multimodal calibrada con lectura por slots | Apache 2.0 | HuggingFace, 0 descargas |
| Modelos de clasificación tipo BERT/RoBERTa | 0,1B–0,4B | 512 tokens | Clasificación de texto, sin multimodalidad | Apache 2.0 / MIT | Amplia |
| VLMs generativos de 7B–8B (p. ej. familia LLaVA o Qwen-VL) | 7B–8B | 4K–128K tokens | Generación autoregresiva multimodal | Variable | Amplia |

La comparación directa es difícil porque Samarth no es un modelo generativo ni un clasificador clásico, sino un motor de decisión con lectura probabilística. No se dispone de datos de benchmarks de alternativas en la información proporcionada para comparar rendimiento de forma directa.

## Limitaciones y advertencias

- Discrepancia de tamaño: los safetensors declaran 7.941.100.874 parámetros frente a los "4B" de la model card; conviene verificar el uso real de memoria antes de dimensionar infraestructura.
- Solo inglés declarado; no hay evidencia de robustez en otros idiomas.
- Longitud de contexto no publicada; las peticiones que exceden la capacidad lanzan `Unsupported` sin truncado, lo que puede romper pipelines en producción si no se gestiona.
- Riesgo de alucinación estructural: al no generar texto, el fallo se manifiesta como distribuciones mal calibradas; el ECE reportado en visión (8,90%) es notablemente superior al de texto.
- Sin datos publicados sobre sesgos demográficos, culturales o de dominio.
- Tracción nula: 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los benchmarks declarados por el autor.
- Dependencia de un runtime propio (`OneJev`) no estándar, lo que dificulta la integración con stacks habituales de serving.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de auditorías externas aconseja validación propia antes de desplegar en decisiones sensibles.
- No se documentan formatos de cuantización, lo que limita el despliegue en hardware de gama media.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ajeet-001/Samarth
- Resultados del Decision Index: https://huggingface.co/datasets/Ajeet-001/Samarth-decision-index-results/tree/main/runs/samarth-vision
- Repositorio del Jev Decision Index: https://github.com/apolinario/decision-index
