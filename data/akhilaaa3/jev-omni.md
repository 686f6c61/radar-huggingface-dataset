# akhilaaa3/Jev-Omni

## Resumen

Jev-Omni es un clasificador multimodal de decisiones publicado por el usuario akhilaaa3 en HuggingFace. A diferencia de un modelo generativo, no produce explicaciones ni texto libre: recibe un estado o contexto, una pregunta y una lista de opciones, y devuelve una probabilidad calibrada para cada opción. Acepta entradas de texto, imagen, audio y vídeo, y está construido sobre el modelo base google/gemma-4-12B-it mediante un ajuste fino final sobre 24.000 preguntas.

El modelo se distribuye como un merge (etiqueta merged) con pesos en safetensors y un repositorio de 47,7 GB, coherente con pesos en FP32 de un modelo de aproximadamente 12.000 millones de parámetros. La licencia es Apache-2.0, heredada de Gemma 4, y el pipeline declarado en HuggingFace es text-classification. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que se trata de un artefacto reciente y con adopción prácticamente nula.

Su relevancia es acotada pero concreta: cubre el nicho de decisión multimodal con salida probabilística y calibración declarada (ECE de 0,0400 en DecisionBench Medium), un formato que encaja mejor que un LLM generativo en pipelines que necesitan puntuaciones comparables entre opciones, umbrales de confianza y decisiones automatizadas. Los resultados publicados por el autor son 87,57 % de accuracy en DecisionBench Medium, 86,15 % en JevBench y 63,10 % de micro accuracy en MMAU (1.000 preguntas).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Gemma 4 12B IT, con cabeza de clasificación sobre opciones (no disponible el detalle exacto del merge) |
| Parametros totales | 12B (según el modelo base declarado google/gemma-4-12B-it) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ ni GPTQ; el autor indica FP32 para pesos y BF16 autocast en inferencia) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (siguiendo la licencia de Gemma 4; los derechos del dataset son independientes) |
| Formato de pesos | safetensors (repositorio de 47,7 GB, compatible con transformers y endpoints_compatible) |

Datos adicionales declarados: pipeline text-classification, etiquetas multimodal y merged, requisito de GPU CUDA y de ffmpeg para entrada de audio.

## Arquitectura y entrenamiento

La información disponible indica que Jev-Omni parte de google/gemma-4-12B-it, un modelo multimodal de 12.000 millones de parámetros, y que el autor realizó una ejecución final de ajuste fino con 24.000 preguntas. La etiqueta merged sugiere que los pesos publicados provienen de una fusión de modelos (típicamente mediante mergekit) en lugar de un único checkpoint de entrenamiento, aunque el repositorio no detalla la receta de fusión, los hiperparámetros ni la composición exacta del dataset de ajuste. Tampoco se especifica si hubo RLHF o DPO; solo se documenta el ajuste supervisado sobre preguntas.

Los componentes multimodales originales de Gemma 4 no se reempaquetan por completo: el cargador oficial (`load_jev_omni`) los descarga automáticamente de forma separada. El modelo sustituye la generación de texto por una cabeza que puntúa opciones, con un límite práctico declarado de 20 opciones (la cabeza admite hasta 256, pero el autor indica que la calidad por encima de 20 no está establecida). En preprocesado, el audio se recorta a 30 segundos y el vídeo se muestrea a 16 fotogramas. La calibración reportada es de ECE 0,0400 con 10 bins en DecisionBench Medium, lo que es un dato técnico relevante para usar las probabilidades como umbral de decisión.

## Capacidades

- Clasificación de decisiones con salida probabilística: devuelve una probabilidad por opción en lugar de una explicación generada, lo que permite comparar alternativas y fijar umbrales de confianza.
- Entrada de texto: escenarios de contexto más pregunta y opciones (por ejemplo, estado temporal y pregunta de sí/no).
- Entrada de imagen: clasificación de decisiones a partir de una imagen más pregunta y opciones.
- Entrada de audio: hasta 30 segundos por muestra, con ffmpeg como dependencia del sistema.
- Entrada de vídeo: muestreo de 16 fotogramas por muestra.
- Multilingüismo: no disponible; la model card no enumera idiomas soportados.
- Tool calling / function calling: no disponible; no se documenta ninguna capacidad de invocación de herramientas.
- Uso como agente o razonamiento multi-paso: no aplicable según la documentación; el modelo no genera cadenas de razonamiento, solo puntuaciones.
- Modo thinking: no disponible.
- Escalado de opciones: soporta con garantías hasta 20 opciones por consulta, con un límite técnico de 256 en la cabeza.

## Casos de uso

- Triaje de soporte técnico: dado un estado del cliente (texto del ticket), una pregunta de diagnóstico y un conjunto cerrado de categorías, el modelo devuelve la probabilidad de cada categoría y permite enrutar el caso solo cuando la confianza supera un umbral; el ECE de 0,0400 respalda ese uso por umbrales.
- Verificación de hechos con respuesta cerrada: plantear "¿la afirmación se sigue del contexto?" con opciones sí/no y usar la probabilidad como filtro previo a una revisión humana, reduciendo el coste frente a un LLM generativo.
- Control de calidad visual en línea de producción: con una imagen de la pieza y opciones como correcto, defecto superficial o defecto estructural, el modelo emite una puntuación por clase en 26 ms sobre H200, apto para inspección en línea.
- Moderación de audio corto: clasificar clips de hasta 30 segundos contra un conjunto acotado de etiquetas de política con latencia declarada de 31 ms para 13 segundos de audio, integrable en un pipeline de moderación previo a revisión humana.
- Análisis de vídeo breve: con 16 fotogramas por muestra y 504 ms de inferencia, se puede clasificar si una grabación corta cumple o no una condición (por ejemplo, presencia de un objeto o cumplimiento de un protocolo) sin transcripción previa.
- Evaluación automática de modelos y anotaciones: usar JevBench o DecisionBench como tarea de decisión cerrada para comparar sistemas, aprovechando que la salida es una probabilidad comparable y no texto libre.
- Decisión en asistentes de reuniones: con el estado de la reunión y una pregunta cerrada ("¿se ha aprobado el presupuesto?"), obtener una probabilidad que dispare acciones posteriores en herramientas de gestión.
- Investigación sobre calibración multimodal: al publicar ECE y gráficos de calibración, sirve como referencia para estudiar el comportamiento probabilístico de clasificadores derivados de LLM multimodales.

## Benchmarks y rendimiento

Resultados publicados en la model card. Son resultados del modelo fusionado; la accuracy principal es una media de escenarios o grupos con el mismo peso.

| Benchmark | Accuracy | Micro accuracy |
|---|---:|---:|
| DecisionBench Medium · 80 escenarios / 293 preguntas | 87,57 % | 86,01 % |
| JevBench · 195 grupos emparejados / 231 decisiones | 86,15 % | 87,45 % |
| MMAU · 1.000 preguntas | — | 63,10 % |

Métricas adicionales declaradas: ECE de 0,0400 en DecisionBench Medium (10 bins). No se publican comparaciones con otros modelos en la información disponible.

Latencia declarada (H200 en caliente, medianas sobre 20 peticiones con backend optimizado; el preprocesado y la red se suman aparte):

| Modalidad | Latencia |
|---|---:|
| Texto (~2.000 tokens) | 83 ms |
| Imagen | 26 ms |
| Audio (13 segundos) | 31 ms |
| Vídeo (16 fotogramas) | 504 ms |

## Requisitos de hardware

- VRAM estimada: el autor indica que los pesos en FP32 ocupan aproximadamente 50 GB antes de sumar el consumo del runtime; en BF16 (autocast de inferencia) el peso se reduce a la mitad, en torno a 24 GB, más memoria para activaciones y componentes multimodales, lo que en la práctica exige GPUs de 40-80 GB o cuantización no publicada.
- GPU recomendadas: H200 (es la GPU de las mediciones publicadas), H100 y A100 de 80 GB son las opciones naturales para FP32 y para BF16 con margen. Una RTX 4090 de 24 GB queda al límite en BF16 y no cabe en FP32.
- GPU de consumo: solo viable si se aplica cuantización propia; el repositorio no publica variantes cuantizadas, por lo que no hay una ruta oficial documentada para GPUs de 24 GB o menos.
- Requisito de plataforma: GPU CUDA obligatoria, y ffmpeg instalado para entrada de audio.
- Opciones de despliegue: la ruta documentada es Python con `snapshot_download`, `load_jev_omni` y `classifier.predict`; el repositorio está marcado como endpoints_compatible. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la cabeza de clasificación personalizada dificulta su uso directo en servidores de inferencia genéricos orientados a generación.
- Latencia y throughput: 83 ms para texto de ~2.000 tokens, 26 ms para imagen, 31 ms para audio de 13 segundos y 504 ms para vídeo de 16 fotogramas en H200, sin contar preprocesado ni red.

## Comparativa con modelos similares

La búsqueda web realizada no devolvió información relevante sobre este modelo ni sobre alternativas comparables: los resultados obtenidos corresponden a artículos académicos sobre redes interorganizacionales e innovación, sin relación con Jev-Omni. La model card tampoco incluye una comparativa con otros sistemas. Por tanto, la comparación cuantitativa con alternativas es no disponible.

| Modelo | Parametros | Contexto | Benchmark comparable | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jev-Omni | 12B (base) | no disponible | DecisionBench Medium 87,57 %; JevBench 86,15 %; MMAU 63,10 % | Apache-2.0 | HuggingFace, 0 descargas, 1 like |
| google/gemma-4-12B-it (modelo base) | 12B | no disponible | no disponible en la información proporcionada | Apache-2.0 según la model card de Jev-Omni | HuggingFace |
| Alternativas multimodales de clasificación cerrada | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Alcance de la tarea: no es un modelo generativo; no produce explicaciones, resúmenes ni texto libre, solo probabilidades sobre opciones predefinidas.
- Límite de opciones: el rendimiento está validado hasta 20 opciones. La cabeza admite 256, pero el autor advierte que la calidad por encima de 20 no está establecida, por lo que escalar el número de opciones es un riesgo no cuantificado.
- Idiomas: no se declara ninguna lista de idiomas soportados, lo que impide garantizar comportamiento multilingüe en producción.
- Sesgos: no se documenta ninguna evaluación de sesgos, ni demográfica ni lingüística; al derivar de Gemma 4 12B IT, hereda los sesgos no mitigados de ese modelo base.
- Alucinación: al tratarse de clasificación con opciones cerradas, el riesgo de texto inventado es bajo, pero existe riesgo de asignar alta probabilidad a una opción incorrecta cuando el contexto es ambiguo; la calibración reportada (ECE 0,0400) corresponde únicamente a DecisionBench Medium y no es extrapolable a otros dominios.
- Límites de modalidad: el audio se recorta a 30 segundos y el vídeo se limita a 16 fotogramas, lo que descarta casos de uso con clips largos o con información que aparezca fuera de esos límites.
- Licencia: pesos bajo Apache-2.0, pero el autor advierte explícitamente que los derechos del dataset son independientes; para uso comercial hay que revisar por separado la licencia de DecisionBench y de los datos de ajuste.
- Dependencia de componentes externos: el cargador descarga los componentes multimodales originales de Gemma 4, de modo que el despliegue depende de la disponibilidad de esos artefactos y de sus propios términos.
- Madurez: repositorio con 0 descargas y 1 like, creado y actualizado en septiembre de 2026, sin variantes cuantizadas, sin integración documentada con servidores de inferencia estándar y sin resultados de terceros que reproduzcan las cifras publicadas.
- Hardware: requiere GPU CUDA; no hay ruta documentada para ejecución en CPU ni en GPUs de consumo con menos de 24 GB.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/akhilaaa3/Jev-Omni
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Dataset DecisionBench: https://huggingface.co/datasets/akhilaaa3/decision-bench
- Gráfico de accuracy en DecisionBench Medium: assets/medium-accuracy.png (dentro del repositorio del modelo)
- Gráfico de calibración en DecisionBench Medium: assets/medium-calibration.png (dentro del repositorio del modelo)
- Paper, blog o repositorio adicionales: no disponible; la búsqueda web no devolvió resultados relacionados con el modelo.
