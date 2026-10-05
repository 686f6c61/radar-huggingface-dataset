# jeff-legacy/Jeff-Qwen3.5-0.8B

## Resumen

Jeff-Qwen3.5-0.8B es un modelo de decisión de tipo zero-shot classification construido como fine-tune del modelo base Qwen3.5-0.8B. Lo desarrolla el proyecto independiente Jeff (repositorio `firelex/jeff`, catálogo en jeffhub.ai), no afiliado a TypeSafe ni al modelo Jev con el que comparte formato de petición. Resuelve un problema muy concreto: dada una situación descrita en lenguaje natural y una lista de opciones, devuelve una probabilidad calibrada para cada opción en un único forward pass, sin generar texto ni requerir parseo posterior.

La relevancia de este lanzamiento, etiquetado como preview de comunidad v1.2 (1 de octubre de 2026), está en su estrategia de despliegue: actúa como «system-1» delante de modelos grandes. Jeff responde primero y solo cuando su confianza es baja la consulta pasa a un modelo mayor, como Qwen3.8-27B. Según los datos del autor, ese esquema reduce el tiempo medio por decisión de 8,1 s a 0,25 s (38× más rápido) y baja la tasa de respuestas erróneas de 13,4% a 4,7%.

El modelo tiene 852.985.920 parámetros (unos 0,85B), licencia Apache 2.0, pesos en safetensors y 2.143 descargas registradas. Está marcado como superseded: la release actual del proyecto es Jeff v1.3, publicada como `mstrasser/jeff-base`. La model card no proporciona la longitud de contexto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune del base Qwen3.5-0.8B); el autor no detalla modificaciones estructurales |
| Parametros totales | 852.985.920 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

Datos adicionales: tamano del repositorio 5,3 GB; pipeline declarado `zero-shot-classification`; etiquetas `feature-extraction`, `decision-model`, `calibration`, `system-1`, `local`, `endpoints_compatible`, `eval-results`, `region:us`; fecha de creacion 28 de septiembre de 2026, ultima actualizacion 5 de octubre de 2026.

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un fine-tune del base Qwen3.5-0.8B orientado a clasificacion zero-shot con salida de probabilidades calibradas. La receta declarada es deliberadamente simple: una epoca, checkpoint final y una unica temperatura ajustada (fitted temperature). El entrenamiento de la version 0.8B se completo en aproximadamente 2 horas sobre una unica GPU de estacion de trabajo RTX PRO 6000 (la variante 2B tardo unas 3,5 horas). Todo el proceso se hizo en hardware local, sin GPUs en la nube.

Los datos de entrenamiento son sinteticos en su totalidad para el modelo base, generados por un modelo abierto (Qwen3.8-Flash-Next) sobre dos DGX Spark. La v1.2 se entreno con 284.747 preguntas, frente a las 322.000 de la v1.1, tras un proceso de limpieza descrito por el autor. Ese cambio no altera apenas la precision global (78,7% frente a 79,1%), pero si reduce drasticamente el resultado en la prueba de documentos largos (de 82,8% a 66,1%), porque la cifra anterior estaba inflada por documentos de test filtrados. El autor afirma que la v1.2 es «mas honesta, no mas lista». El codigo de entrenamiento parte de la receta open source AutoJev.

## Capacidades

- Clasificacion zero-shot entre opciones definidas en lenguaje natural: colas de soporte, intenciones de usuario, etiquetas de moderacion, comandos de voz o movimientos de juego, sin que las categorias tengan que aparecer en los datos de entrenamiento.
- Salida de probabilidades calibradas por opcion en un unico forward pass. El error de calibracion (ECE) reportado es 0,028 en la v1.2.
- Sin generacion de texto: no hay decoding autoregresivo ni necesidad de parsear la salida.
- Latencia muy baja: 22 ms por decision en RTX PRO 6000 y 28 ms en Apple M4 Max con MLX.
- Nueve adaptadores LoRA publicados sobre la v1.2, cargables simultaneamente en un mismo servidor: clausulas legales, intenciones de soporte, emocion, spam, grounding, guardia contra prompt injection, eleccion de herramienta (tool choice), navegacion por voz y triaje de tickets.
- Uso como filtro previo (system-1) delante de un modelo grande: si la confianza es baja, la consulta se delega.
- Capacidad de ajuste fino propio: el autor reporta que un fine-tune de navegacion por voz paso la precision en held-out de 31,7% a 95,8% en menos de media hora sobre una GPU.
- Soporte multilingue: no disponible; el modelo declara unicamente ingles.

## Casos de uso

- Triaje de tickets de soporte: con el adaptador de triaje y el de intenciones de soporte, el modelo clasifica cada ticket entrante en una categoria en unos 22 ms, permitiendo enrutar miles de tickets por minuto en una sola GPU.
- Filtro previo a un LLM grande: colocar Jeff delante de un modelo de 27B para las decisiones rutinarias y delegar solo los casos de baja confianza. El autor reporta una mejora de 87,7% a 95,7% de precision en las cinco decisiones de un agente de bandeja de entrada, con 39× menos tiempo.
- Moderacion de contenido y deteccion de spam: los adaptadores de spam y de etiquetas de moderacion permiten clasificar comentarios o mensajes en categorias configurables sin reentrenar el modelo.
- Guardia contra prompt injection: el adaptador especifico actua como primera barrera que inspecciona entradas antes de que lleguen a un agente con acceso a herramientas.
- Revision de clausulas legales: el adaptador de clausulas legales clasifica fragmentos de contratos contra un conjunto de categorias definidas por el equipo juridico, con la advertencia de que el rendimiento en documentos largos cayo al 66,1% en la v1.2.
- Eleccion de herramienta en agentes: el adaptador de tool choice decide que funcion o API invocar ante una peticion del usuario, reduciendo el coste de pasar cada turno por el modelo grande.
- Navegacion por voz en interfaces: el adaptador de navegacion por voz traduce comandos hablados a acciones de interfaz; el autor cifra la precision held-out final en 95,8% tras un fine-tune corto.
- Deteccion de alucinaciones mediante grounding: el adaptador de grounding evalua si una respuesta esta respaldada por el contexto aportado (96,3% frente al 96,7% del modelo de 27B, con 20× mas velocidad).

## Benchmarks y rendimiento

Los datos disponibles no son benchmarks estandar (MMLU, HumanEval, GSM8K), sino el panel propio del proyecto. Se reproducen tal cual los publica el autor.

| Modelo | Precision del base sin entrenar | Precision del panel | ECE | Tiempo por decision |
|---|---:|---:|---:|---:|
| Jeff-Qwen3.5-0.8B v1.2 (este modelo) | 45,3% | 78,7% | 0,028 | 22 ms (RTX PRO 6000) |
| Jeff-Qwen3.5-0.8B v1.1 (revision `v1.1`) | 45,3% | 79,1% | 0,021 | 22 ms |
| Jeff-Qwen3.5-2B v1.2 | 46,5% | 81,7% | 0,021 | 24 ms |
| Jeff-Gemma4-E2B | 62,5% | 81,6% | 0,031 | 29 ms |
| Jev (publicado) | — | 83,0% | ≈0,06 (media de sus cifras por benchmark) | 212 ms por llamada via API (harness Doom) |

Comparativa funcional frente a un modelo unico grande, segun el autor (mismas filas de test, Apple M4 Max, 8 adaptadores; emocion excluida de las medias):

| Metrica | Qwen3.8-27B decide todo | Jeff + adaptadores, 27B solo si Jeff duda |
|---|---:|---:|
| Precision media | 86,6% | 95,3% |
| Tiempo por decision | 8,1 s | 0,25 s (38× mas rapido) |
| Respuestas erroneas | 13,4% | 4,7% (2,8× menos) |
| Memoria | 28,6 GB | +1,96 GB con los nueve adaptadores cargados (RTX PRO 6000) |

Pruebas especificas: en las cinco decisiones de un agente de bandeja de entrada, 87,7% → 95,7% con 39× mas velocidad. En emocion, Jeff + adaptador alcanza 60,6% frente al 35,6% del 27B; incluyendo los nueve adaptadores, la media es 91,4% frente a 80,9%. El autor advierte que cada tarea uso una muestra fija de filas held-out (300; 500 en emocion y clausulas legales) y que el 27B corrio en 8 bits con razonamiento paso a paso desactivado. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entorno de 1,7 GB en FP16 y cerca de 0,85 GB en INT8 para los 852.985.920 parametros (estimacion a partir del numero de parametros; el autor no publica cifras de cuantizacion).
- Memoria con adaptadores: el autor reporta +1,96 GB en total para Jeff con los nueve adaptadores LoRA cargados simultaneamente en una RTX PRO 6000.
- GPU recomendadas: el autor cita RTX PRO 6000 para entrenamiento e inferencia y Apple M4 Max (MLX) para pruebas. Cualquier GPU con 4 GB o mas de VRAM deberia bastar para inferencia en precision reducida.
- Cabe en GPU de consumo: si, por tamano (menos de mil millones de parametros). El autor no publica una lista de GPUs de consumo verificadas.
- Opciones de despliegue: libreria `transformers`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de HuggingFace. El autor menciona vias de inferencia en RTX PRO 6000 y en MLX sobre Apple Silicon. No se detallan soportes de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia: 22 ms por decision en RTX PRO 6000 y 28 ms en Apple M4 Max con MLX. Throughput no publicado.
- Entrenamiento: la variante 0.8B se entrena en unas 2 horas en una unica RTX PRO 6000; los adaptadores LoRA pueden entrenarse en menos de media hora en una GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision del panel | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jeff-Qwen3.5-0.8B (este) | 852.985.920 | No disponible | 78,7% | 0,028 | Apache 2.0 | HuggingFace (superseded) |
| Jeff-Qwen3.5-2B | No disponible | No disponible | 81,7% | 0,021 | No disponible | HuggingFace |
| Jeff-Gemma4-E2B | No disponible | No disponible | 81,6% | 0,031 | No disponible | HuggingFace |
| Jev (publicado) | No disponible | No disponible | 83,0% | ≈0,06 | No disponible | API |

Dentro del propio proyecto existe una version posterior, Jeff v1.3, publicada en `mstrasser/jeff-base`, que reemplaza a este modelo. La comparacion con Jev es la que hace el autor, que aclara explicitamente que Jeff usa el mismo formato de peticion pero no esta afiliado ni respaldado por TypeSafe.

## Limitaciones y advertencias

- Modelo marcado como superseded: el autor indica que pertenece a una release anterior y ya no se actualiza. La release actual es Jeff v1.3 (`mstrasser/jeff-base`).
- No genera texto ni razona paso a paso: solo emite probabilidades sobre opciones predefinidas. Cualquier tarea que requiera explicacion, redaccion o planificacion queda fuera de su alcance.
- Precision zero-shot limitada por tamano: 78,7% en el panel propio. El autor recomienda un fine-tune corto con ejemplos propios si la precision no es suficiente.
- Riesgo de calibracion imperfecta: ECE de 0,028, superior al 0,021 de la v1.1 y de la variante 2B. Una mala calibracion afecta directamente al umbral de derivacion al modelo grande.
- Caida fuerte en documentos largos: la precision pasa de 82,8% (v1.1) a 66,1% (v1.2) tras eliminar filtraciones de test. Es la cifra real, no una regresion de entrenamiento.
- Idioma: solo ingles declarado. El comportamiento en castellano no esta documentado ni garantizado.
- Longitud de contexto no publicada: no se puede planificar el troceado de entradas largas con datos del autor.
- Datos de entrenamiento sinteticos generados por un modelo abierto (Qwen3.8-Flash-Next), con spot-check de calidad mediante un modelo cerrado. Algunos datasets publicos del mix contienen texto generado por modelos cerrados (por ejemplo, las respuestas de RAGTruth), y parte de los datos de los adaptadores los escribio un modelo alojado.
- Licencia Apache 2.0, permisiva para uso comercial, pero conviene verificar las condiciones de los adaptadores y del modelo base Qwen3.5-0.8B por separado.
- Proyecto independiente: comparte formato de peticion con Jev pero no tiene ninguna relacion con TypeSafe.
- Las metricas de rendimiento son autoevaluadas por el autor, con muestras de 300 filas (500 en emocion y clausulas legales) y sin replicacion externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jeff-legacy/Jeff-Qwen3.5-0.8B
- Release actual del proyecto (Jeff v1.3): https://huggingface.co/mstrasser/jeff-base
- Variante 2B: https://huggingface.co/mstrasser/Jeff-Qwen3.5-2B
- Catalogo y documentacion del proyecto: https://jeffhub.ai
- Resultados por tarea y metodo: https://jeffhub.ai/results
- Repositorio en GitHub: https://github.com/firelex/jeff
- Receta de entrenamiento de partida (AutoJev): https://github.com/denis-pplx/autojev

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos enlaces utiles son los citados en la model card. No se dispone de paper, demo ni articulo de blog adicional.
