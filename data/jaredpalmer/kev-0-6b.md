# jaredpalmer/kev-0.6b

## Resumen

kev-0.6b es un modelo de decisión (decision model) publicado por jaredpalmer como research preview. No genera texto: recibe un documento de estado y un conjunto de preguntas tipadas, y devuelve en una única pasada forward una distribución de probabilidad por pregunta (elección, «noul» o puntuación). Técnicamente es un adaptador LoRA de rango 16 más una cabeza pointer entrenada desde cero sobre el backbone Qwen/Qwen3-0.6B-Base, y sirve el contrato público `/v1/systemone` de TypeSafe mediante un cliente compatible.

El problema que aborda es la clasificación y decisión estructurada con probabilidades calibradas y bien tipadas, en lugar de la generación libre de texto. Frente a la versión anterior (kev-0.5b, con backbone Qwen2.5-0.5B), sube la precisión en distribución de 0,712 a 0,805 sobre el conjunto de desarrollo decision-v4, y pasa de 0,25 a 0,78 cuando hay una opción «ninguna de las anteriores» presente. El checkpoint declara 10.896 registros de entrenamiento procedentes de diez fuentes públicas más 896 pares de política programáticos.

Es relevante ahora porque ejemplifica una línea distinta a la de los LLM generativos: modelos pequeños y especializados, con protocolo de evaluación congelado y checksums, orientados a servir decisiones calibradas dentro de un contrato de API tipado. El propio autor lo etiqueta explícitamente como preview de investigación: no supera la pantalla de release definida de antemano (el razonamiento sobre estructuras de política no entrenadas se queda en un 6-11% frente al 70% exigido) y recomienda usarlo para comparar, no para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LM causal prefill-only con máscara de atención block-causal; prefijo de estado compartido, una rama aislada por pregunta y lectura pointer sobre tokens de frontera de opción |
| Parametros totales | 0,6B en el backbone (Qwen/Qwen3-0.6B-Base) más adaptador LoRA r=16 y cabeza pointer |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica el adaptador PEFT en precisión de entrenamiento; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (adaptador y cabeza); el modelo base Qwen3 es apache-2.0; los datasets de entrenamiento conservan sus propias licencias |
| Formato de pesos | safetensors (adaptador PEFT/LoRA sobre el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es un LM causal en modo prefill-only con máscara de atención block-causal. Cada petición se estructura como un prefijo de estado compartido, una rama aislada por pregunta y una lectura pointer sobre los tokens que delimitan cada opción. El aislamiento entre ramas está medido: las preguntas empaquetadas en una misma petición reciben exactamente las mismas probabilidades que obtendrían por separado, con una delta máxima de 4e-6. La salida no es texto generado sino una distribución sobre las opciones, lo que permite servir varias preguntas en un solo forward pass.

El entrenamiento usó la suite congelada `evals/v4/decision-v4`, cuyo manifiesto fija las revisiones de datasets y modelo base: 10.000 registros públicos (1.000 por fuente, diez fuentes) más dos brazos de política programáticos de 448 registros cada uno, dos épocas, LoRA r=16 sobre las proyecciones de atención y MLP, cabeza pointer desde cero, entropía cruzada sobre la distribución de opciones y autocast bf16 con pesos maestros en fp32 sobre una única H100 (aproximadamente 10 minutos). La aumentación incluye permutación de opciones, inserción de «none-of-the-above», distractores y pares mínimos de none en el 25% de los registros de tipo Choice. Los datos de decisión provienen de banking77, boolq, ag_news, multi_nli, sst5, yelp_review_full, trec, dbpedia_14, amazon_reviews_multi_en e imdb. No se usaron salidas de Jev para entrenar. El protocolo de evaluación selecciona modelos con particiones de desarrollo y reserva una partición de test bloqueada que se lee como máximo una vez por candidato promovido; las comparaciones emplean bootstrap pareado con clustering por registro y cada resultado lleva el hash de suite, hashes de código y commit de git.

## Capacidades

- Clasificación de decisiones tipadas: tres tipos de pregunta (choice, noul y score) con distribución de probabilidad por opción en una sola pasada.
- Abstención explícita: soporte de «none-of-the-above» reforzado con pares mínimos, con una precisión de 0,78 cuando la opción none está presente.
- Probabilidades calibradas en distribución: ECE de 0,078 sobre probabilidades crudas en decision-v4.
- Empaquetado multi-pregunta: varias preguntas sobre el mismo estado se responden en un único forward pass con resultados idénticos a procesarlas por separado (delta máxima 4e-6).
- Clasificación de texto en dominios cubiertos por el entrenamiento: intención bancaria, preguntas de comprensión, noticias, inferencia textual, sentimiento (SST-5, Yelp, Amazon, IMDb), temas TREC y DBpedia.
- Contrato de servicio tipado: expone el contrato `/v1/systemone` de TypeSafe y se consume con cualquier cliente compatible.
- No dispone de generación de texto, tool calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Enrutado de intención en atención al cliente: dado el texto de un ticket y un conjunto de intenciones predefinidas (dominio cubierto por banking77), el modelo devuelve la distribución sobre intenciones en una sola pasada, lo que permite dirigir el caso al equipo correcto y usar la probabilidad como umbral de escalado a un humano.
- Moderación de contenido sensible: sobre estados de texto corto, formular una pregunta tipada de tipo choice con opciones de categoría permite obtener una probabilidad calibrada de contenido ofensivo (la transferencia declarada en TweetEval-offensive es 0,69), útil como primer filtro antes de revisión humana.
- Análisis de sentimiento a escala sobre reseñas: con los dominios de Yelp, Amazon, IMDb y SST-5 presentes en el entrenamiento, se puede clasificar polaridad o niveles de valoración sin generar texto, lo que reduce coste por inferencia y evita respuestas inventadas.
- Enrutado de consultas en pipelines RAG: usar el modelo como clasificador previo que decida si una consulta es de tipo factual, comparativa o de otra categoría, y con esa etiqueta elegir la plantilla de prompt o el índice de recuperación adecuado.
- Verificación de pares de frases: para tareas de inferencia textual (MultiNLI) y paráfrasis (PAWS, con 0,56 de transferencia declarada), el modelo puede puntuar si dos enunciados se contradicen, implican o son equivalentes, como paso de validación antes de publicar contenido.
- Clasificación temática de documentos: con ag_news y dbpedia_14 en el entrenamiento, se puede etiquetar un flujo de artículos o páginas por tema sin coste de generación, alimentando sistemas de recomendación o de archivado.
- Abstención controlada en preguntas de comprensión: en tareas tipo BoolQ o de opción múltiple donde la respuesta puede no estar en el documento, el modelo está entrenado para emitir la opción «ninguna de las anteriores» con una precisión declarada de 0,78, reduciendo respuestas forzadas incorrectas.
- Filtro de coste delante de un LLM mayor: al resolver decisiones simples con 0,6B de parámetros, se puede reservar el modelo grande para los casos en que la probabilidad del pequeño esté por debajo de un umbral, reduciendo el gasto de inferencia en un pipeline mixto.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (marcados como no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Decision tipada (choice / noul / score) | decision-v4 development (1.204 registros; diez fuentes publicas entrenadas + pares de politica programaticos) | Accuracy | 0,805 |
| Decision tipada (choice / noul / score) | decision-v4 development | ECE, probabilidades crudas | 0,078 |
| Decision tipada, fuera de dominio | transfer-v4 development (764 registros; seis fuentes nunca entrenadas + estructuras de politica reservadas) | Accuracy | 0,598 |
| Decision tipada, fuera de dominio | transfer-v4 development | Brier score | 0,521 |

Precisión de transferencia por fuente declarada para este checkpoint: QNLI 0,85; SciQ 0,86; TweetEval-offensive 0,69; PAWS 0,56; Emotion 0,50; MMLU 0,46; estructuras de política reservadas cerca del azar.

Comparación con la versión anterior y con el modelo de referencia del mismo autor:

| Modelo | Backbone | Registros de entrenamiento | Accuracy en distribucion | Accuracy fuera de dominio | Opcion none presente |
|---|---|---|---|---|---|
| kev-0.5b | Qwen2.5-0.5B | 9.000 (seis fuentes) | 0,712 | 0,575 (transfer-v1) | 0,25 |
| kev-0.6b (este) | Qwen3-0.6B-Base | 10.896 (diez fuentes + 896 pares de politica) | 0,805 | 0,598 | 0,78 |
| Jev (`typesafe-ai/jev` via Vercel AI Gateway) | no disponible | no disponible | 0,845 | 0,855 | no disponible |

La misma receta aplicada a otros tamaños alcanza, según el autor, 0,72-0,75 de accuracy fuera de dominio a 4B y 0,74-0,77 a 8B. Los datos de kev-0.6b se sostienen sobre 3 semillas (rango 0,595-0,605 en transferencia), frente a una sola semilla en kev-0.5b.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16 el backbone de 0,6B ocupa en torno a 1,2 GB de pesos, más el adaptador LoRA y la cabeza pointer (repo de 0,1 GB); con overhead de runtime, el consumo razonable está en el rango de 1,5-2,5 GB. En cuantizaciones de 8 o 4 bits bajaría aproximadamente a 0,4-0,7 GB, aunque el autor no documenta variantes cuantizadas.
- GPU recomendadas: cualquiera con al menos 4 GB de VRAM sirve para inferencia. Para entrenamiento, el autor reporta una única H100 con un tiempo de aproximadamente 10 minutos para el run completo.
- GPU de consumo: sí, cabe holgadamente en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, e incluso es viable en CPU para cargas de baja concurrencia.
- Opciones de despliegue: el repositorio documenta un servidor propio (`uv run --extra serve python -m kev.serve --run jaredpalmer/kev-0.6b --port 8008`) que expone el contrato TypeSafe, consumible con `typesafe.TypeSafeClient`. No se documentan rutas de despliegue con vLLM, llama.cpp, Ollama o TGI; al no ser un modelo generativo y depender de una cabeza pointer, los servidores de generación estándar no son aplicables directamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy en distribucion | Accuracy fuera de dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kev-0.6b | 0,6B (LoRA r=16 + cabeza pointer) | no disponible | 0,805 | 0,598 | apache-2.0 | HuggingFace (research preview, 0 descargas, 0 likes) |
| kev-0.5b | 0,5B (backbone Qwen2.5-0.5B) | no disponible | 0,712 | 0,575 (transfer-v1) | no disponible | versión previa del mismo autor |
| Jev (typesafe-ai/jev via Vercel AI Gateway) | no disponible | no disponible | 0,845 | 0,855 | no disponible | servicio vía gateway |
| Misma receta a 4B / 8B | 4B / 8B | no disponible | no disponible | 0,72-0,75 / 0,74-0,77 | no disponible | no disponible como release público |

No se dispone de comparativas con clasificadores de propósito general de tamaño similar (por ejemplo, encoder pequeños tipo MiniLM o DeBERTa) en la información proporcionada.

## Limitaciones y advertencias

- Es un research preview, no una release versionada. El autor indica explícitamente que no pasa la pantalla de release y que debe usarse para comparar, no para desplegar.
- Fuera de dominio el rendimiento es plano en torno a 0,60 de accuracy en todas las mutaciones de hiperparámetros probadas (ocho mutaciones de un parámetro, tres semillas). El cuello de botella es la capacidad, no los datos: la misma receta a 4B llega a 0,72-0,75 y a 8B a 0,74-0,77.
- El razonamiento sobre políticas reservadas falla: en pares de política programáticos cuya estructura de reglas nunca se entrenó, el porcentaje de acierto en ambos hermanos es del 6-11%, frente al 70% que exige la pantalla de release.
- Hedging ordinal: en preguntas de Score de tres niveles con aritmética de fechas, el modelo colapsa al nivel intermedio.
- Tasa de error confiado fuera de dominio del 5% (confianza mayor o igual a 0,9 y respuesta incorrecta). El ECE crudo es 0,08 en distribución y 0,16 fuera de dominio: las probabilidades son utilizables en el dominio entrenado y solo orientativas fuera de él.
- No evaluado sobre las particiones de test bloqueadas como candidato de release. Cualquier lectura exploratoria de test bloqueado se registra en `runs/locked/` del repositorio y se etiqueta como `-ungated`.
- Idioma: únicamente inglés. No hay soporte multilingüe declarado.
- Sesgos: no se documentan análisis de sesgo en la información disponible; los datasets de entrenamiento (reseñas, noticias, foros) pueden introducir sesgos propios que el autor no cuantifica.
- Riesgo de alucinación: no aplica en el sentido generativo porque el modelo no produce texto libre, pero sí existe riesgo de decisión incorrecta con alta confianza, cuantificado en el punto anterior.
- Licencia: apache-2.0 para adaptador y cabeza, y apache-2.0 para el modelo base Qwen3. Los datasets de entrenamiento conservan sus propias licencias, por lo que el uso comercial exige revisarlas una a una.
- Restricciones de reproducibilidad: los benchmarks están declarados como no verificados (`verified: false`) y proceden del propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaredpalmer/kev-0.6b
- Repositorio de código, suites y resultados: https://github.com/jaredpalmer/kev (ver `PLAN.md`, `runs/leaderboard.md` y `evals/v4/*/manifest.json`)
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente enlaces genéricos de Amazon.de sin relación con el contenido); no se han podido añadir papers, blogs ni demos adicionales.
