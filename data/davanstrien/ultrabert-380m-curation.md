# davanstrien/ultrabert-380m-curation

## Resumen

UltraBERT Curation (davanstrien/ultrabert-380m-curation) es un modelo de decisión compacto de 380 millones de parámetros, entrenado por davanstrien sobre el encoder dmis-lab/UltraBERT-380M con una cabeza de puntuación GLiClass. Está diseñado para tareas de curación de datos: dado un "estado" (una página web, un prompt, un problema matemático o un registro bibliográfico) y un conjunto de preguntas con opciones tipadas, devuelve una probabilidad por cada opción sin generar texto. Implementa la API de decisión Jev / System One (`choice`, `noul` sí/no, `score` en niveles ordenados) y también funciona como clasificador zero-shot GLiClass estándar.

Su relevancia principal no es solo el modelo en sí, sino la apertura total del proceso: se publican los datos de entrenamiento (516.964 filas de 535.730, cada una con fuente, etiquetador y licencia), la receta completa de construcción, entrenamiento y evaluación en GitHub, y un ejemplo de salida real (más de un millón de páginas de FineWeb puntuadas). El entrenamiento completo cuesta alrededor de una hora en una GPU (unos 3 dólares), lo que lo hace muy replicable.

En benchmarks de curación alcanza una puntuación media de 0,705 sobre 16 unidades de prueba, superando a GLiClass Edge (0,500) y a d1-2B de Liquid AI (0,582), aunque es un especialista: en decisiones generales queda por detrás de ambos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder UltraBERT-380M + cabeza de puntuación GLiClass |
| Parametros totales | 382.296.577 |
| Parametros activos | no disponible (no se indica arquitectura MoE; se asume encoder denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (1,5 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo parte de UltraBERT-380M, un encoder transformer compacto, al que se añade una cabeza GLiClass para puntuación de preguntas y opciones. A diferencia de los modelos generativos, no produce texto: calcula probabilidades para cada opción de cada pregunta tipada, lo que lo hace rápido y determinista en tareas de decisión. Se ejecuta tanto mediante la API Jev / System One (`jev_api.py`) como mediante el pipeline estándar de GLiClass, e incluye una ruta de inferencia por lotes empaquetados en GPU (`fast_inference.py`).

El entrenamiento utilizó el dataset davanstrien/curation-decision-mix, con 535.730 filas, de las cuales 516.964 se publican abiertamente (se excluyen 18.766 filas sin licencia abierta verificada). Cada fila documenta fuente, etiquetador y licencia. Todo el proceso (entrenamiento, evaluación e inferencia) se ejecutó en Hugging Face Jobs; una pasada de entrenamiento dura aproximadamente una hora en una única GPU, con un coste estimado de unos 3 dólares. No se dispone de detalles sobre el número exacto de tokens ni sobre el uso de RLHF/DPO (no aplicable, dado que no es un modelo generativo).

## Capacidades

- Clasificación zero-shot de texto mediante el pipeline GLiClass estándar (por ejemplo, distinguir entre artículo de noticias, tutorial, página de producto, blog personal o spam).
- Puntuación de curación sobre páginas web, prompts, problemas matemáticos y registros bibliográficos: tema, formato, valor educativo, dificultad, tipo de tarea, validez y clase de catálogo.
- API de decisión Jev / System One con tres tipos de respuesta: `choice` (selección entre opciones), `noul` (sí/no) y `score` (niveles ordenados, como escalas de valor educativo).
- Salida puramente probabilística, sin generación de texto, adecuada para pipelines deterministas.
- Inferencia por lotes empaquetados en GPU para puntuar grandes corpus a alto throughput.
- Script de curación de un solo comando (`curate.py`) para ejecutar trabajos en Hugging Face Jobs.
- No está diseñado para decisiones generales como evaluar calidad de respuestas, predecir tasas de aprobación o moderación de seguridad.

## Casos de uso

- Filtrado de corpus de preentrenamiento: puntuar millones de páginas web (como se hizo con 1.020.000 páginas de FineWeb) para extraer subconjuntos de alta calidad; en el ejemplo publicado se redujo a 63.788 páginas seleccionadas.
- Clasificación de páginas web por formato: distinguir tutoriales, artículos de noticias, páginas de producto, blogs personales o spam para construir datasets especializados.
- Valoración del valor educativo de textos: clasificar contenido en niveles ordenados desde "not educational" hasta "highly educational", útil para construir datasets educativos o evaluar materiales didácticos.
- Curación de datasets de prompts: clasificar prompts por tipo de tarea, dificultad o validez antes de usarlos en entrenamiento o evaluación de modelos.
- Catalogación de registros bibliográficos: clasificación por clase de catálogo en bibliotecas y archivos digitales.
- Construcción de datasets de matemáticas: evaluar problemas por dificultad y validez para seleccionar ejemplos de calidad en datasets de razonamiento matemático.
- Deduplicación y control de calidad en pipelines de datos: integrar el modelo como filtro rápido y barato antes de pasar a modelos generativos más costosos.
- Replicación de recetas de datos: usar la receta abierta (GitHub) como plantilla para entrenar modelos de decisión propios con datos documentados.

## Benchmarks y rendimiento

| Benchmark | UltraBERT Curation (380M) | GLiClass Edge (~440M) | d1-2B (2B) |
|---|---|---|---|
| Curation score (media de 16 unidades) | 0,705 | 0,500 | 0,582 |
| Decision Index 0.3 (decisiones generales) | 22,1 | 47,5 | 51,1 |
| Throughput (filas de pregunta/s, RTX PRO 6000) | ~530 | no disponible | no disponible |

Los datos muestran que el modelo es un especialista: domina claramente en curación, pero rinde por debajo de los comparadores en decisiones generales.

## Requisitos de hardware

- VRAM estimada: con 382 millones de parámetros en safetensors (1,5 GB de repositorio), el modelo cabe con holgura en GPUs de consumo; no se publican cifras oficiales de VRAM, pero se estima del orden de 1–2 GB en fp32/fp16 más overhead de la cabeza GLiClass.
- GPU recomendada: el throughput publicado (~530 filas de pregunta/s) se midió en una NVIDIA RTX PRO 6000 con la ruta de inferencia empaquetada; en GPUs de consumo se esperan cifras inferiores pero el modelo es plenamente ejecutable.
- Consumer GPUs: sí, cabe en GPUs como RTX 3060/4060 o superiores sin necesidad de cuantización.
- Despliegue: mediante la librería GLiClass (`gliclass`), los scripts incluidos (`jev_api.py`, `fast_inference.py`, `curate.py`) y Hugging Face Jobs. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Entrenamiento: aproximadamente una hora en una única GPU (unos 3 dólares en Hugging Face Jobs).
- Latencia y throughput: ~530 question-rows/s en RTX PRO 6000; no hay más datos de latencia.

## Comparativa con modelos similares

| Caracteristica | UltraBERT Curation | GLiClass Edge | d1-2B (Liquid AI) |
|---|---|---|---|
| Parametros | 382M | ~440M | 2B |
| Curation score | 0,705 | 0,500 | 0,582 |
| Decision Index 0.3 | 22,1 | 47,5 | 51,1 |
| Licencia | Apache 2.0 | no disponible | no disponible |
| Enfoque | Especialista en curación | Modelo de decisión general pequeño | Modelo de decisión general pequeño |

UltraBERT Curation es la mejor opción de las tres para tareas de curación específicas, mientras que GLiClass Edge y d1-2B ofrecen mejor rendimiento en decisiones generales a costa de puntuación inferior en curación.

## Limitaciones y advertencias

- Es un especialista en curación: en tareas de decisión generales (calidad de respuestas, predicción de tasas de aprobación, seguridad/moderación) rinde notablemente peor (Decision Index 0.3 de 22,1 frente a 47,5 y 51,1 de los comparadores).
- Solo soporta inglés; no es adecuado para curación multilingüe.
- No genera texto: no sirve como chatbot ni como modelo generativo; su salida se limita a probabilidades sobre opciones predefinidas.
- 18.766 filas del dataset original se excluyeron por falta de licencia abierta verificada, lo que conviene tener en cuenta al replicar la receta.
- Al ser un modelo de clasificación, puede heredar sesgos de sus etiquetadores y fuentes de datos; aunque cada fila documenta su origen, no se describen auditorías de sesgo en la información disponible.
- Riesgo de errores de clasificación en dominios fuera de los tipos de contenido vistos en entrenamiento (páginas web, prompts, matemáticas, registros de biblioteca); no hay datos de calibración publicados.
- Licencia Apache 2.0: sin restricciones para uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davanstrien/ultrabert-380m-curation
- Dataset de entrenamiento: https://huggingface.co/datasets/davanstrien/curation-decision-mix
- Receta (datos, entrenamiento, evaluación, inferencia): https://github.com/davanstrien/curation-decision-recipe
- Ejemplo de salida (1M de páginas de FineWeb puntuadas): https://huggingface.co/datasets/davanstrien/fineweb-curated-1m
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-380M
- Comparador GLiClass Edge: https://huggingface.co/knowledgator/gliclass-v4-edge
- Comparador d1-2B: https://huggingface.co/LiquidAI/d1-2B
- Papers citados en los tags: arXiv:2203.05482, arXiv:2502.10341, arXiv:2406.17557, arXiv:2506.14111, arXiv:1805.01042, arXiv:1803.02324
