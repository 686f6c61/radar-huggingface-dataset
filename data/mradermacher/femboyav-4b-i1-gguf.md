# mradermacher/femboyAV-4b-i1-GGUF

## Resumen

femboyAV-4b-i1-GGUF es una cuantizacion en formato GGUF del modelo RaspizdAI/femboyAV-4b, publicada por el usuario mradermacher, especializado en generar versiones cuantizadas de modelos abiertos. El modelo base es un fine-tuning de la familia Qwen3-VL (segun las etiquetas del repositorio), orientado a generacion de texto y conversacion, entrenado sobre el dataset RaspizdAI/femboy-10k. Esta publicacion concreta es la variante "i1" (imatrix), es decir, cuantizaciones generadas con una matriz de importancia para preservar mejor la calidad en tamanos reducidos.

El modelo resuelve el problema de desplegar un modelo conversacional multimodal de aproximadamente 4 mil millones de parametros en hardware modesto mediante cuantizacion GGUF, lo que permite su uso con llama.cpp y herramientas compatibles. La relevancia de esta ficha radica en documentar con rigor una publicacion de nicho: se trata de un fine-tuning comunitario, con muy pocas descargas y sin resultados de benchmarks publicados, por lo que debe evaluarse con cautela antes de cualquier uso en produccion.

La informacion disponible es limitada: la model card del cuantizador solo documenta el proceso de cuantizacion y remite al modelo base, y no se han encontrado datos sobre arquitectura interna, contexto, composicion del dataset de entrenamiento ni evaluaciones de rendimiento. Los datos de parametros que aparecen en la ficha de Hugging Face (1.920.204) no son coherentes con la designacion "4b" del nombre del modelo y probablemente corresponden a un recuento parcial o erroneo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base pertenece a la familia Qwen3-VL segun las etiquetas) |
| Parametros totales | aproximadamente 4B segun el nombre del modelo; la ficha de Hugging Face indica 1.920.204, dato no coherente y no verificado |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix (i1); la model card lista Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | ingles (en) y ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el repositorio incluye un fichero imatrix.gguf de 0,1 GB para generar cuantizaciones propias) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base RaspizdAI/femboyAV-4b. Las etiquetas del repositorio lo identifican como perteneciente a la familia Qwen3-VL, lo que sugiere un transformer multimodal con capacidad de vision, aunque la model card del cuantizador no confirma esta arquitectura ni detalla el mecanismo de atencion. El modelo base es un fine-tuning sobre el dataset RaspizdAI/femboy-10k, del que no se conocen composicion, numero de tokens ni proceso de alineacion (RLHF/DPO).

La innovacion tecnica de esta publicacion reside en el metodo de cuantizacion: mradermacher emplea cuantizaciones con matriz de importancia (imatrix, version "i1"), generadas con una matriz calculada a partir de datos de calibracion para reducir la perdida de perplejidad en comparacion con las cuantizaciones estaticas equivalentes. El repositorio incluye el fichero imatrix.gguf (0,1 GB) para que otros usuarios puedan generar sus propias cuantizaciones. Ademas, la model card indica que, al tratarse de un modelo de vision, los ficheros mmproj (proyector multimodal) se encuentran en el repositorio estatico complementario (mradermacher/femboyAV-4b-GGUF), no en esta variante i1.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun la etiqueta "chat" del repositorio.
- Capacidad de vision potencial: las etiquetas y la nota sobre ficheros mmproj indican que el modelo base es multimodal (Qwen3-VL), aunque esta variante i1 no incluye el proyector mmproj y este debe obtenerse del repositorio estatico.
- Soporte de tool calling y function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues limitadas a ingles y ruso segun los metadatos.
- Modo thinking, audio u otras capacidades especiales: no disponible (no documentado).

## Casos de uso

- Prototipado de asistentes conversacionales en ingles o ruso: el modelo puede desplegarse en local con llama.cpp para experimentar con dialogos multi-turno sin depender de APIs externas, gracias al formato GGUF y a su tamano contenido de aproximadamente 4B parametros.
- Experimentacion con modelos multimodales en hardware de consumo: si se combina con el fichero mmproj del repositorio estatico, permite probar flujos de descripcion de imagenes o preguntas sobre imagenes en equipos con GPU de gama media.
- Investigacion sobre fine-tuning y cuantizacion: el repositorio incluye el fichero imatrix, lo que facilita estudiar el impacto de distintas cuantizaciones sobre un fine-tuning comunitario concreto.
- Educacion y demostraciones tecnicas: su licencia Apache 2.0 y su formato GGUF permiten usarlo en talleres o cursos para ilustrar el flujo completo desde un fine-tuning hasta el despliegue cuantizado.
- Evaluacion comparativa de calidad de cuantizaciones: al existir tambien la variante estatica (femboyAV-4b-GGUF), es posible comparar la calidad de las cuantizaciones i1 frente a las estaticas sobre el mismo modelo base.
- Desarrollo de chatbots tematicos de nicho: dado el dataset de entrenamiento especifico (femboy-10k), puede emplearse para generar respuestas con un estilo o tematica concreta en entornos controlados y no criticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de aproximadamente 4B parametros en GGUF, las cuantizaciones de 4 bits suelen ocupar en torno a 2,5-3 GB y las de 8 bits en torno a 4,5-5 GB, sin contar el contexto ni el proyector multimodal.
- GPU recomendadas: no disponible. Por tamano, el modelo deberia caber en GPUs de consumo con 6-8 GB de VRAM o mas, aunque no hay datos oficiales que lo confirmen.
- Cabe en GPU de consumo: probablemente si, en modelos como RTX 3060, RTX 4060 o superiores, segun la cuantizacion elegida; no verificado por el autor.
- Opciones de despliegue: llama.cpp y herramientas basadas en GGUF (Ollama, LM Studio, llama-cpp-python); vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| femboyAV-4b-i1-GGUF (este) | ~4B (no verificado) | no disponible | en, ru | Apache 2.0 | GGUF (imatrix) | Fine-tuning comunitario de Qwen3-VL; sin benchmarks publicados |
| mradermacher/femboyAV-4b-GGUF | ~4B | no disponible | en, ru | Apache 2.0 | GGUF (estatico) | Misma base, cuantizaciones estaticas; incluye ficheros mmproj |
| mradermacher/MiRAI-4B-i1-GGUF | ~4B | no disponible | no disponible | no disponible | GGUF (imatrix) | Otra cuantizacion de 4B del mismo autor; sin datos comparativos publicados |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia objetiva de calidad, por lo que no deberia usarse en produccion sin una evaluacion propia.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano y agravado por la falta de documentacion sobre el proceso de alineacion.
- Sesgos desconocidos: el dataset de entrenamiento (femboy-10k) es de nicho y no se documenta su composicion, por lo que pueden existir sesgos tematicos, estilisticos o de contenido.
- Cobertura idiomatica limitada: solo se declaran ingles y ruso; el rendimiento en castellano no esta garantizado.
- Datos de parametros incoherentes en la ficha de Hugging Face (1.920.204 frente a la designacion "4b"), lo que impide confirmar el tamano real del modelo.
- Esta variante i1 no incluye los ficheros mmproj; para usar las capacidades de vision hay que descargarlos del repositorio estatico complementario.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado y sobre el cumplimiento de las condiciones aplicables al modelo base.
- Popularidad practicamente nula (0 descargas, 0 likes en el momento de la consulta): no hay comunidad ni soporte que valide su comportamiento en distintos entornos.

## Enlaces

- Repositorio Hugging Face (esta variante): https://huggingface.co/mradermacher/femboyAV-4b-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/femboyAV-4b-GGUF
- Modelo base: https://huggingface.co/RaspizdAI/femboyAV-4b
- Dataset de entrenamiento: https://huggingface.co/datasets/RaspizdAI/femboy-10k
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#femboyAV-4b-i1-GGUF
- Peticiones de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
