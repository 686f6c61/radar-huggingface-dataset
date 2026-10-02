# ollaya-dev/clef

## Resumen

`ollaya-dev/clef` es un paquete de inferencia publicado por ollaya-dev que envuelve el modelo de decisiones `Cloudflare/clef-flash` de Cloudflare. No contiene pesos propios: cada grafo es una exportacion a ONNX que referencia por desplazamiento de bytes los ficheros de pesos originales del autor, de modo que `ollaya pull` descarga los pesos desde los repositorios de origen, sin modificar y fijados a un commit. El modelo base es `Cloudflare/clef-flash`, un modelo de 9B (hermano pequeno de `Cloudflare/clef`, de 27B y multimodal) post-entrenado a partir de la familia Qwen, con una cabeza de esquema conjunta para tareas de decision y clasificacion.

El proposito del modelo es funcionar como "modelo de decision" local: recibe preguntas tipadas y devuelve respuestas calibradas con temperaturas de calibracion, siguiendo el paradigma que Ollaya describe como equivalente a "lo que Ollama hace con los LLM". Se enmarca en la categoria de modelos "system-one" (respuesta rapida e intuitiva, en contraposicion a razonamiento deliberado). La relevancia actual radica en que es una de las primeras piezas de un ecosistema de modelos de decision abiertos que Cloudflare publico en octubre de 2026 y que Ollaya distribuye para ejecucion local en CPU y GPU.

La ficha se centra en el paquete ONNX de Ollaya y en lo que se conoce de su modelo base. La informacion publica sobre arquitectura detallada, dataset de entrenamiento y evaluacion cuantitativa es limitada, por lo que varios campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Exportacion ONNX de un transformer post-entrenado con cabeza de esquema conjunta (modelo base: Qwen, encoder + cola de clasificacion segun `joint_schema_model.py`) |
| Parametros totales | 9B (correspondiente a `Cloudflare/clef-flash`, hermano pequeno de Clef de 27B) |
| Parametros activos | no disponible (no se documenta como MoE) |
| Longitud de contexto | 64K tokens (dato publicado para la familia Clef; no confirmado de forma independiente para `clef-flash`) |
| Tipos de cuantizacion | fp32 (grafo ONNX incluido). Existe una etiqueta de modelo base cuantizado, pero el repositorio solo lista un grafo fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (fp32). El repositorio no contiene pesos; los grafos referencian por byte offset los pesos del upstream `Cloudflare/clef-flash@17f0b0a` |

## Arquitectura y entrenamiento

El paquete de Ollaya no entrena nada: exporta a ONNX el modelo `Cloudflare/clef-flash`. Segun la nota de paridad del propio autor, el runtime de Ollaya reproduce fielmente el codigo original (`joint_schema_model.py`) compuesto por un encoder, un modelo Qwen (la model card cita Qwen3.5; fuentes externas citan Qwen3.8-27B para el modelo grande Clef, por lo que existe una discrepancia de version no resuelta) y una cabeza de esquema conjunta. La tarea declarada es `text-classification`, con una disposicion de secuencia y tokens especiales descritos en `decision.json` y temperaturas de calibracion en `calibration.json`.

Cloudflare post-entreno el modelo para producir decisiones y esquemas tipados en lugar de generacion de texto libre, siguiendo el paradigma "system-one" (respuesta rapida, sin modo de razonamiento explicito documentado). No se dispone de informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica mas destacable del paquete Ollaya es el diseno de grafos ONNX sin pesos: los parametros se descargan del repositorio original con verificacion sha256 y fijado de commit, lo que evita duplicar terabytes y garantiza trazabilidad. En cuanto a paridad numerica, Ollaya reporta sobre 571 preguntas de 131 peticiones en CUDA token ids y spans identicos, las mismas 13 peticiones rechazadas, la misma decision en cada pregunta y logits dentro de 4,3e-5 y probabilidades dentro de 6,3e-6 respecto al codigo de referencia en fp32.

## Capacidades

- Clasificacion de texto y toma de decisiones tipada: la cabeza de esquema conjunta produce etiquetas o decisiones estructuradas, no texto libre.
- Salida calibrada: incorpora temperaturas de calibracion (`calibration.json`) para ajustar las probabilidades emitidas.
- Rechazo de peticiones: el autor documenta una tasa de rechazo verificable (13 peticiones rechazadas sobre 131 en la prueba de paridad), lo que sugiere un mecanismo de validacion de entradas.
- Ejecucion local en CPU y GPU: el grafo fp32 esta pensado para ambos entornos.
- Compatibilidad con API TypeSafe a traves del runtime de Ollaya.
- Capacidades multimodales: la fuente externa atribuye vision al modelo Clef de 27B; no se confirma que `clef-flash` conserve esa capacidad.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo pertenece a la categoria "system-one", sin modo de razonamiento explicito.
- Capacidades multilingues: no disponibles.
- Capacidad especial: modo de calibracion y esquema de decision tipado (system-one).

## Casos de uso

- Clasificacion de tickets de soporte: el modelo recibe texto de entrada y devuelve una etiqueta de decision calibrada, adecuada para enrutar incidencias por categoria o prioridad en un pipeline de atencion al cliente.
- Moderacion de contenido con umbral calibrado: gracias a las temperaturas de calibracion, las probabilidades de salida pueden umbralizarse de forma estable para aceptar, revisar o rechazar contenido.
- Enrutado de consultas en un asistente: integrar el modelo como primera etapa que decide si una pregunta se responde con FAQ, se escala a un LLM grande o se rechaza, reduciendo coste de inferencia.
- Validacion de formularios y datos estructurados: la cabeza de esquema conjunta permite comprobar que una entrada cumple un esquema tipado antes de procesarla.
- Ejecucion local en el borde (edge): al ser un modelo de 9B exportado a ONNX y ejecutable en CPU, puede desplegarse en entornos sin GPU para tareas de decision de baja latencia.
- Filtrado previo a un pipeline de RAG: clasificar y descartar consultas fuera de dominio antes de invocar un recuperador o un modelo generativo, ahorrando tokens y latencia.
- Conformidad y trazabilidad: al pinchar los pesos a un commit y verificar sha256, es adecuado para entornos que requieren reproducibilidad de la decision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica cuantitativa reportada por el autor es la de paridad numerica con el codigo de referencia: sobre 571 preguntas de 131 peticiones en CUDA, token ids y spans identicos, 13 peticiones rechazadas coincidentes, la misma decision en todas las preguntas, logits dentro de 4,3e-5 y probabilidades dentro de 6,3e-6. No hay cifras de MMLU, HumanEval, GSM8K ni de indices como el Jev Decision Index en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada segun cuantizacion para un modelo de 9B: aproximadamente 36 GB en fp32 (unico formato incluido en el repositorio), en torno a 18 GB en fp16/bf16, unos 9 GB en int8 y unos 4,5 GB en int4.
- GPU recomendadas: A100 40 GB o H100 para fp32; RTX 4090 (24 GB) suficiente en fp16 y holgada en int8/int4; GPUs de 8-12 GB validas solo en cuantizaciones int8/int4.
- Cabe en GPU de consumo (RTX 3090, 4090, 4080, 4070 Ti) en fp16 y en cuantizaciones menores; en fp32 requeriria GPUs de 40 GB o segmentacion.
- Despliegue: el repositorio esta pensado para el runtime de Ollaya (`ollaya run clef` / `ollaya pull`), no para vLLM, llama.cpp, Ollama o TGI. El autor senala que Ollama 0.35.0 soporta modelos de decision via `/v1/systemone`, pero no consta que este paquete concreto de Ollaya sea compatible con esa ruta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ollaya-dev/clef (este) | 9B (base `clef-flash`) | 64K (familia Clef) | Clasificacion / decision, ONNX fp32 | Apache-2.0 | HuggingFace (paquete ONNX sin pesos) |
| Cloudflare/clef-flash | 9B | 64K (familia Clef) | Clasificacion / decision | Apache-2.0 | HuggingFace (pesos originales) |
| Cloudflare/clef | 27B | 64K | Clasificacion / decision multimodal | no disponible | HuggingFace / Workers AI |
| Modelos de clasificacion encoder-only tipo BERT base | ~110M | 512 | Clasificacion de texto | variable | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos: sin acceso al upstream `Cloudflare/clef-flash@17f0b0a`, el paquete no es funcional por si solo.
- Sesgos conocidos: no disponibles; no se documenta analisis de sesgo.
- Riesgo de alucinacion: al ser un modelo de clasificacion y decision con cabeza de esquema, el riesgo de texto generado inventado es bajo, pero puede producir decisiones erroneas en dominios fuera de su distribucion de entrenamiento.
- Limitaciones de contexto e idioma: el contexto reportado (64K) corresponde a la familia Clef y no esta confirmado de forma independiente para `clef-flash`; los idiomas soportados no estan documentados.
- Existe una discrepancia entre la model card (que cita Qwen3.5) y fuentes externas (que citan Qwen3.8-27B): conviene verificar la version base antes de tomar decisiones de produccion.
- Licencia: Apache-2.0 permite uso comercial, pero al depender de pesos de terceros conviene revisar la licencia del upstream por si difiere.
- Compatibilidad: el paquete esta disenado para el runtime de Ollaya; no se garantiza su uso con otros motores de inferencia (vLLM, llama.cpp, TGI, Ollama).
- Metricas de adopcion nulas en el momento del analisis: 0 descargas y 0 likes, sin ecosistema consolidado ni validacion externa.

## Enlaces

- Repositorio HuggingFace del paquete: https://huggingface.co/ollaya-dev/clef
- Modelo base upstream: https://huggingface.co/Cloudflare/clef-flash
- Commit fijado del upstream: https://huggingface.co/Cloudflare/clef-flash/tree/17f0b0ad64efb65d273590632833508766b2aae6
- Repositorio de Ollaya en GitHub: https://github.com/ollaya-dev/ollaya
- Sitio de Ollaya: https://ollaya.dev/
- Perfil y contexto de Clef en BenchLM: https://benchlm.ai/models/cloudflare-clef
- Analisis de los modelos de decision de Cloudflare: https://www.developersdigest.tech/blog/cloudflare-clef-decision-models-2026
- Noticia sobre la publicacion de Clef y Clef-flash: https://aicoder.com/news/news-20261002-cloudflare-clef-decision-models
- Modelos Clef en Workers AI: https://developers.cloudflare.com/workers-ai/models/clef/
