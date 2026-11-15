# iapp/OpenThai-SystemOne-bnb-8bit

## Resumen

OpenThai-SystemOne-bnb-8bit es la versión cuantizada a 8 bits del modelo iapp/OpenThai-SystemOne, un modelo de decisión "System One" desarrollado por iApp (parte de la iniciativa OpenThai, anteriormente OpenThaiGPT) y lanzado junto con AIEAT. A diferencia de un modelo generativo convencional, este modelo responde preguntas tipadas sobre un estado de texto o JSON en un único forward pass: elección entre hasta 255 opciones (`choice`), puntuación ordinal (`score`) y sí/no (`noul`), devolviendo probabilidades calibradas sin generar texto.

La arquitectura parte de una torre de texto Qwen3.5-0.8B con preentrenamiento continuado en tailandés, a la que se añade una cabeza de decisión de 256 slots. Con 753.074.819 parámetros totales y un repositorio de 1,0 GB, el modelo está orientado a tareas de clasificación y extracción de características en tailandés e inglés.

Este repositorio concreto aplica cuantización bitsandbytes LLM.int8 a las capas Linear de la torre (correspondiente a la versión v0.3, commit `f3709948`), manteniendo en bf16 los embeddings de tokens, la cabeza de decisión de 256 slots y las temperaturas por tipo. El resultado es un checkpoint de 1009 MB frente a los 1509 MB del original en bf16, con una pérdida de precisión muy contenida (macro de 73,9 frente a 74,3 en el conjunto público y 80,0 frente a 80,1 en los conjuntos tailandeses). Es relevante para despliegues en GPU con requisitos de memoria ajustados que necesiten clasificación estructurada multilingüe th/en.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (torre de texto Qwen3.5-0.8B) con cabeza de decisión de 256 slots |
| Parametros totales | 753.074.819 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bitsandbytes LLM.int8 (8 bits) en capas Linear; embeddings, cabeza de decisión y temperaturas en bf16 |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint bitsandbytes, permanece cuantizado en memoria GPU CUDA) |

## Arquitectura y entrenamiento

El modelo se construye sobre una torre de texto Qwen3.5-0.8B sometida a preentrenamiento continuado en tailandés, sobre la que se monta una cabeza de decisión de 256 slots. La salida no es texto generado, sino una distribución de probabilidad calibrada sobre las opciones de una pregunta tipada (`choice`, `score` o `noul`), lo que convierte al modelo en un clasificador de decisión de un solo paso. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esa información se remite al repositorio del modelo base.

La cuantización aplicada en este repositorio afecta únicamente a las capas Linear de la torre, de modo que solo se perturba el estado oculto que lee la cabeza de decisión. Los embeddings de tokens, la cabeza de 256 slots y las temperaturas por tipo de pregunta se conservan en bf16, lo que explica la escasa degradación observada en las evaluaciones. El checkpoint resultante mantiene el formato bitsandbytes y permanece cuantizado en memoria de GPU, requiriendo CUDA para su uso.

## Capacidades

- Clasificación por elección (`choice`) entre hasta 255 opciones sobre un texto o estado JSON, con probabilidades calibradas.
- Puntuación ordinal (`score`) para evaluar niveles graduados, como sentimiento o relevancia.
- Decisión binaria sí/no (`noul`) sobre afirmaciones relativas a un texto.
- Extracción de características (`feature-extraction`) mediante la torre de texto.
- Soporte bilingüe tailandés e inglés, con especial énfasis en tailandés tras el preentrenamiento continuado.
- Respuesta en un único forward pass, sin generación de texto ni decodificación autoregresiva.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso en la información disponible.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Análisis de sentimiento en reseñas tailandesas: el modelo recibe el texto y una pregunta `choice` con las opciones positivo/negativo/neutro, devolviendo la distribución de probabilidad en una sola pasada, como muestra el ejemplo de la model card con una reseña de restaurante.
- Moderación de comentarios: con preguntas `noul` sobre toxicidad o civismo (estilo civil_comments), permite filtrar contenido en pipelines de alto volumen con baja latencia al no generar texto.
- Enrutamiento de tickets de soporte: usando `choice` sobre categorías de intención (estilo banking77), el modelo clasifica la consulta del usuario y la dirige al equipo adecuado.
- Evaluación de resúmenes: con preguntas `score` de consistencia y relevancia (estilo summeval), permite puntuar automáticamente resúmenes generados en un pipeline de control de calidad.
- Extracción de respuestas verificables: con preguntas `noul` sobre pasajes (estilo squad2), sirve para validar si un fragmento responde a una pregunta en sistemas de búsqueda documental.
- Clasificación de tareas y herramientas: con `choice` sobre un catálogo de herramientas (estilo xlam_tools, con 99,4 de precisión reportada), puede decidir qué herramienta invocar en un sistema de agentes sin generar texto libre.
- Análisis de sentimiento y atributos de producto en comercio electrónico: con `score` sobre reseñas (estilo wongnai), permite agregar valoraciones estructuradas a escala.

## Benchmarks y rendimiento

Resultados de precisión con un único orden de opciones sobre los primeros 800 registros de cada conjunto, comparando el original bf16 con esta cuantización:

| Subconjunto | bf16 original | bnb-8bit | Δ |
|---|---|---|---|
| aegis2 (noul) | 83,2 | 83,2 | +0,0 |
| boolq (noul) | 79,7 | 79,3 | -0,3 |
| civil_comments (noul) | 79,0 | 78,0 | -1,0 |
| helpsteer2 (score) | 41,6 | 41,6 | +0,0 |
| massive-de-DE (choice) | 88,3 | 87,4 | -0,9 |
| massive-en-US (choice) | 88,3 | 88,0 | -0,3 |
| multinli (choice) | 89,0 | 89,6 | +0,7 |
| paws (noul) | 94,0 | 93,6 | -0,4 |
| pubmedqa (choice) | 64,0 | 64,0 | +0,0 |
| squad2 (noul) | 89,3 | 88,0 | -1,3 |
| summeval-consistency (score) | 75,0 | 75,7 | +0,7 |
| summeval-relevance (score) | 21,7 | 20,8 | -0,8 |
| vitaminc-dev (choice) | 72,5 | 71,3 | -1,2 |
| **Macro, banco público de 13 subconjuntos** | **74,3** | **73,9** | **-0,4** |
| banking77 (choice) | 59,1 | 59,5 | +0,4 |
| contrastive_th (choice) | 80,7 | 81,4 | +0,7 |
| contrastive_th (noul) | 83,5 | 83,9 | +0,4 |
| contrastive_th (score) | 78,6 | 75,0 | -3,6 |
| massive_th (choice) | 90,6 | 90,5 | -0,1 |
| prachathai (choice) | 98,3 | 98,5 | +0,2 |
| prachathai (noul) | 93,4 | 93,2 | -0,2 |
| sib200_th (choice) | 77,9 | 78,4 | +0,5 |
| wisesight (choice) | 48,9 | 49,4 | +0,5 |
| wongnai (score) | 64,5 | 64,5 | +0,0 |
| xlam_tools (choice) | 99,4 | 99,4 | +0,0 |
| xnli_th (choice) | 79,8 | 79,1 | -0,6 |
| xnli_th (noul) | 86,8 | 86,5 | -0,2 |
| **Macro, conjuntos tailandeses de evaluación** | **80,1** | **80,0** | **-0,2** |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 1009 MB en disco y permanece cuantizado en memoria GPU; se recomienda al menos 2-3 GB de VRAM para pesos y buffers de activación, aunque no se publica una cifra oficial.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y bitsandbytes; el tamaño reducido permite usar tarjetas de gama media y consumer.
- Cabe en GPU consumer: sí, por el tamaño del modelo (menos de 1 GB de pesos), aunque no se especifican modelos concretos.
- Opciones de despliegue: transformers con `AutoModel` y `trust_remote_code=True`, o el paquete `openthai_systemone` con `SystemOneClient`; requiere bitsandbytes y CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenThai-SystemOne-bnb-8bit | 753 M | no disponible | Decisión tipada (choice/score/noul) th/en | Apache-2.0 | Hugging Face (13 descargas) |
| iapp/OpenThai-SystemOne (bf16) | 753 M | no disponible | Decisión tipada th/en | Apache-2.0 | Hugging Face |
| Qwen3.5-0.8B | ~0,8 B | no disponible | Modelo generativo base | no disponible | no disponible |

La comparación con alternativas de la misma categoría (modelos de decisión tipada) no está disponible en la información proporcionada; el modelo base bf16 es la referencia directa y los datos de rendimiento de Qwen3.5-0.8B no se detallan.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo distribuciones de probabilidad sobre preguntas tipadas.
- La cuantización introduce degradaciones puntuales, con la mayor caída en contrastive_th (score), de -3,6 puntos.
- El rendimiento en algunos subconjuntos es bajo en términos absolutos (summeval-relevance 20,8; helpsteer2 41,6; wisesight 49,4), lo que limita su uso en esas tareas sin validación adicional.
- Cobertura lingüística restringida a tailandés e inglés; no se documentan otros idiomas.
- La longitud de contexto no está publicada, lo que dificulta planificar entradas largas.
- Requiere CUDA y bitsandbytes; el checkpoint permanece cuantizado en memoria GPU, sin soporte documentado para CPU ni otros backends.
- Riesgo de sesgos y alucinación en las probabilidades calibradas: no se documentan análisis de sesgo ni calibración fuera de los conjuntos evaluados.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento.
- Las métricas reportadas usan un único orden de opciones y los primeros 800 registros de cada conjunto, por lo que pueden no reflejar el rendimiento con otros órdenes o distribuciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai-SystemOne-bnb-8bit
- Modelo base: https://huggingface.co/iapp/OpenThai-SystemOne
- Repositorio del paquete: https://github.com/iapp-technology/openthai-systemone
