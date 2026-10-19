# ken-jo/QEV-2B

## Resumen

QEV-2B es un modelo de decisión multimodal de 2,21 mil millones de parámetros publicado por el usuario ken-jo en Hugging Face, construido como ajuste fino de Qwen/Qwen3.5-2B. Su particularidad es que no genera texto: recibe evidencia (texto e imágenes) junto con un conjunto de opciones candidatas y sus significados, y devuelve en una única pasada forward una probabilidad calibrada por opción, una respuesta tipada y una señal de abstención. Es, por tanto, un clasificador zero-shot con salida probabilística en lugar de un modelo generativo.

El problema que aborda es el de los pipelines que hoy usan un LLM generativo para tareas de decisión (enrutado, extracción, moderación, grounding de interfaz) y pagan latencia y coste por tokens generados. QEV-2B sustituye esa generación por una cabeza de clasificación sobre las representaciones internas del modelo base, con calibración explícita y la posibilidad de declarar abstención cuando ninguna opción supera el umbral de confianza.

El modelo declara una puntuación de 61,99 en el JEV Decision Index (visión, edición 0.3.2, parte pública), lo que lo situaría como el mejor modelo de hasta 2,3 B del tablero, por delante de d3-nano (2,21 B, 59,15) e incluso de modelos de 4,66 B como Intern-Decision-4B (61,69). Es importante subrayar que esa cifra es **autoevaluada y está pendiente de la ejecución oficial**, según indica el propio autor en la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión) derivado de Qwen3.5-2B; 24 capas, con cabeza de salida temprana destilada en la capa 16 |
| Parámetros totales | 2.213.241.664 (2,21 B) |
| Parámetros activos | No aplica: no es un modelo MoE (no disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio publica pesos en safetensors sin cuantizaciones alternativas |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados; incluye `exit16.safetensors` para el modo rápido) |
| Resolución de imagen de entrada | Hasta 1,6 MP por imagen en modo accurate (sin presupuesto compartido entre varias imágenes); 0,26 MP en modo fast |
| Salida | Probabilidad por opción, respuesta tipada y señal de abstención; sin tokens generados |

## Arquitectura y entrenamiento

QEV-2B parte de Qwen3.5-2B y lo convierte en un modelo de decisión: en lugar de decodificar texto, proyecta el estado final del transformer sobre las opciones candidatas que proporciona el usuario, produciendo una distribución de probabilidad calibrada. El modelo conserva el codificador visual del modelo base —acepta una o varias imágenes a resolución nativa de hasta 1,6 MP por imagen, sin reparto conjunto del presupuesto de píxeles— y expone dos profundidades de cómputo: profundidad completa (24 capas) en modo accurate y salida temprana en la capa 16 en modo fast, mediante una cabeza de salida destilada (`exit16.safetensors`).

El autor remite al informe técnico para la descripción completa de arquitectura, protocolo de entrenamiento, calibración y ablaciones; la model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles en la información proporcionada. Lo que sí se explicita es que la calibración está ajustada para el modo accurate, que el modo fast limita las imágenes a 0,26 MP y que la cabeza de salida temprana se evaluó contra profundidad completa con resultados prácticamente equivalentes en los conjuntos internos citados (85,0 % frente a 84,9 % en el split de selección de 1.859 ítems; 89,8 % frente a 90,6 % en NLVR2 dev; 88,8 % frente a 89,2 % en diagnósticos de imagen; 93,0 % frente a 92,8 % en diagnósticos de texto).

## Capacidades

- Clasificación zero-shot multimodal: texto e imagen(es) de entrada más opciones candidatas con sus definiciones, devolviendo una probabilidad por opción.
- Salida tipada (*typed decisions*): la respuesta no es texto libre sino una etiqueta estructurada con su distribución de probabilidad asociada.
- Probabilidades calibradas: la confianza declarada está pensada para usarse directamente como umbral en producción.
- Abstención explícita: el modelo puede señalar que ninguna opción es suficientemente probable, lo que permite derivar a revisión humana.
- Inferencia en una sola pasada forward, sin generación de tokens, lo que reduce la latencia frente a esquemas generativos.
- Salida temprana (*early exit*) en la capa 16 para un modo rápido de menor coste.
- Comprensión de documentos, gráficos e infografías (evaluado en CharXiv e InfographicVQA).
- Grounding de interfaz web y decisión sobre elementos (evaluado en Mind2Web).
- Extracción de información clave en documentos (evaluado en KIE).
- Verificación de emparejamiento imagen-texto (evaluado en Winoground).
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Capacidades de agente multi-paso: no disponible como tales; el modelo resuelve decisiones puntuales, no bucles de agente.

## Casos de uso

- **Enrutado de tickets de soporte con abstención**: se pasan al modelo el texto del ticket y un conjunto cerrado de colas (facturación, técnico, cancelaciones, etc.); la probabilidad por opción permite enrutar automáticamente por encima de un umbral y derivar a un humano el resto gracias a la señal de abstención.
- **Extracción de información clave (KIE) en documentos escaneados**: con 93,9 puntos en KIE, el modelo puede mapear campos de un formulario o factura a un esquema predefinido tratando cada campo como una decisión tipada, sin generar texto libre susceptible de alucinación.
- **Moderación de contenido asistida por umbrales**: dada una imagen o un texto y un conjunto de categorías de política, el modelo devuelve la probabilidad por categoría; conviene combinarlo con revisión humana porque la puntuación absoluta en moderación (29,9) es baja en términos absolutos.
- **Agentes web y automatización de interfaz**: con 82,3 en Mind2Web, el modelo sirve para decidir sobre qué elemento de una página actuar a partir de una captura y una instrucción, alimentando un ejecutor determinista de clics.
- **Control de calidad de datasets multimodales**: verificación de que una imagen y su pie de foto se corresponden (Winoground, 65,5), útil para filtrar pares imagen-texto antes de entrenar otros modelos.
- **Extracción de datos de gráficos e infografías**: con 83,1 en InfographicVQA y 63,4 en CharXiv, encaja en pipelines de banca, seguros o medios que necesitan leer valores concretos de figuras publicadas.
- **Filtro previo de bajo coste en pipelines LLM**: como clasificador en modo fast (mediana de 91,6 ms), puede decidir si una consulta requiere un modelo grande, reduciendo el coste por petición en sistemas con mucho tráfico.
- **Respuesta a preguntas sobre escenas del mundo real**: con 56,2 en RealWorldQA, es usable en asistentes de campo que deben elegir entre un conjunto finito de respuestas sobre una fotografía.

## Benchmarks y rendimiento

JEV Decision Index, visión, edición 0.3.2, parte pública (tablero generado el 2026-10-16). Los valores de QEV-2B son **autoevaluados y están pendientes de ejecución oficial**; el intervalo bootstrap del 95 % del índice es 60,63–63,34 (60,59–63,43 agrupando filas que comparten imagen). Los benchmarks no se usaron para seleccionar el checkpoint.

| Benchmark | QEV-2B (autoevaluado) | Mejor otro modelo ≤ 2,3 B | Peso |
|---|---:|---|---:|
| CV-Bench | 70,6 | 71,9 (d3-nano) | 1,0 |
| BLINK | 47,2 | 53,8 (OneJev1.5-0.8B) | 1,0 |
| RealWorldQA | **56,2** | 53,1 (d3-nano) | 1,0 |
| CharXiv | 63,4 | 65,2 (d3-nano) | 1,0 |
| InfographicVQA | 83,1 | 83,6 (d3-nano) | 1,0 |
| Mind2Web | **82,3** | 63,7 (d3-nano) | 1,0 |
| Winoground | 65,5 | 69,0 (d3-nano) | 1,0 |
| KIE | **93,9** | 84,4 (Intern-Decision-2B) | 1,0 |
| Moderation | **29,9** | 24,7 (OneJev1.5-0.8B) | 1,0 |
| R-Bench-M | **16,8** | 15,5 (d3-nano) | 0,5 |
| MMMU-Pro | 15,6 | 17,8 (d3-nano) | 0,25 |
| **Índice** | **61,99** | 59,15 (d3-nano) | — |

Rendimiento y latencia declarados por el autor (loader de release, `qev.QEV.load` + `predict`, sin CUDA graphs ni kernels personalizados; RTX 4060 Ti de 8 GB, batch 1, en caliente; 47 perfiles de petición con hasta 16 opciones, el mayor de 3.229 tokens de entrada en modo accurate; 3 ejecuciones de calentamiento y 30 medidas por perfil):

| Modo | Tope de imagen | Profundidad | p95 peor caso | p50 mediana | Memoria GPU pico |
|---|---:|---:|---:|---:|---:|
| Accurate (por defecto) | 1,6 MP | 24 capas | 738,6 ms | 135,3 ms | 4,44 GiB |
| Fast | 0,26 MP | 16 capas | 225,0 ms | 91,6 ms | 4,13 GiB |

No se publica índice para el modo fast; las cifras de benchmark corresponden al modo de profundidad completa.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,44 GiB de pico en modo accurate y 4,13 GiB en modo fast, medidos como asignación pico de PyTorch con batch 1.
- Cabe en GPU de consumo: el autor lo midió en una RTX 4060 Ti de 8 GB. Con 4,4 GiB de pico, una GPU de 6 GB o más debería ser suficiente, aunque no se documenta esa configuración.
- GPU recomendadas: RTX 4060 Ti 8 GB (única verificada). Para mayor throughput o lotes mayores, GPU de 16–24 GB (RTX 4090, A100, H100) darían margen, si bien no hay cifras publicadas para ellas.
- Despliegue: mediante la librería `qev` (`qev.QEV.load` + `predict`). No hay información sobre integración con vLLM, llama.cpp, Ollama o TGI, ni sobre formatos GGUF.
- Latencia: p95 de 738,6 ms y p50 de 135,3 ms en modo accurate; p95 de 225,0 ms y p50 de 91,6 ms en modo fast. El perfil más lento en ambos modos es una petición con imagen y 16 opciones cerca del límite de tokens.
- Throughput: no disponible (solo se publican latencias con batch 1).

## Comparativa con modelos similares

| Modelo | Parámetros | Índice (público) | Contexto | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| d3-mini | 4,54 B | 67,67 | no disponible | no disponible | no disponible en la información |
| RSI-Jev v6.1 VL 4B | 4,66 B | 63,01 | no disponible | no disponible | no disponible en la información |
| RSI-Jev v5.0 VL 3B | 4,66 B | 62,58 | no disponible | no disponible | no disponible en la información |
| **QEV-2B** | **2,21 B** | **61,99 (autoevaluado)** | no disponible | Apache 2.0 | Hugging Face (`ken-jo/QEV-2B`) |
| Intern-Decision-4B | 4,66 B | 61,69 | no disponible | no disponible | no disponible en la información |
| Jev-Omni | 11,96 B | 60,10 | no disponible | no disponible | no disponible en la información |
| d3-nano | 2,21 B | 59,15 | no disponible | no disponible | no disponible en la información |
| Intern-Decision-2B | 2,27 B | 52,92 | no disponible | no disponible | no disponible en la información |
| OneJev1.5-0.8B | 1,11 B | 52,32 | no disponible | no disponible | no disponible en la información |

La comparación directa con d3-nano es la más pertinente: mismos 2,21 B de parámetros y misma categoría (modelo de decisión), con una diferencia declarada de 2,84 puntos de índice a favor de QEV-2B. Frente a Intern-Decision-2B (2,27 B) la ventaja declarada es de 9,07 puntos. Los modelos de 4,5–12 B del tablero quedan por debajo salvo d3-mini y las dos variantes RSI-Jev.

## Limitaciones y advertencias

- La puntuación de 61,99 es **autoevaluada y está pendiente de la ejecución oficial**; no es una entrada oficial del leaderboard y el propio autor advierte que se sustituirá cuando exista la ejecución oficial.
- Solo inglés: la model card declara `en` como único idioma, por lo que el uso en castellano no está soportado ni evaluado.
- El modo fast reduce la resolución a 0,26 MP y pierde precisión frente al modo accurate, especialmente en documentos, gráficos y capturas de pantalla; además no tiene índice publicado.
- La calibración está ajustada únicamente para el modo accurate; usar los umbrales del modo fast sin recalibrar puede degradar la fiabilidad de la abstención.
- Rendimiento absoluto bajo en varias tareas: MMMU-Pro 15,6, R-Bench-M 16,8, Moderation 29,9 y BLINK 47,2. No es un modelo de razonamiento visual generalista.
- Al no generar texto, no puede producir justificaciones ni explicaciones de su decisión; la trazabilidad se limita a la distribución de probabilidad.
- Riesgo de alucinación estructuralmente distinto al de un LLM generativo, pero persiste el riesgo de sobreconfianza si la evidencia de entrada queda fuera de la distribución de entrenamiento; la señal de abstención mitiga, no elimina, ese riesgo.
- No hay información sobre sesgos demográficos, de género o culturales evaluados.
- No se documentan resultados de seguridad, red teaming ni robustez adversarial.
- Licencia Apache 2.0: permite uso comercial y modificación, con las obligaciones habituales de atribución y conservación del aviso de licencia.
- Modelo con 0 descargas y 0 likes en el momento de la ficha y librería propia (`qev`), lo que implica ausencia de validación independiente por la comunidad y dependencia de un runtime específico.
- No se dispone de información sobre longitud de contexto máxima soportada; el mayor perfil evaluado es de 3.229 tokens de entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ken-jo/QEV-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Informe técnico (PDF): https://huggingface.co/datasets/ken-jo/decision-index-results/blob/main/reports/QEV-technical-report.pdf
- Dataset de resultados del Decision Index: https://huggingface.co/datasets/ken-jo/decision-index-results
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a definiciones de la palabra «ken» y no guardan relación con QEV-2B.
