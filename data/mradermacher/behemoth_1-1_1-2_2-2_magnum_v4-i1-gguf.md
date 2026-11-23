# mradermacher/Behemoth_1.1_1.2_2.2_Magnum_V4-i1-GGUF

## Resumen

Behemoth_1.1_1.2_2.2_Magnum_V4-i1-GGUF es una cuantizacion en formato GGUF, generada por mradermacher, del modelo base alansmithee-cpu/Behemoth_1.1_1.2_2.2_Magnum_V4. El modelo base es a su vez un merge construido con mergekit, no un entrenamiento original, y esta orientado a conversacion en ingles. Esta publicacion no aporta pesos nuevos ni un modelo entrenado desde cero: su valor es empaquetar un merge de aproximadamente 122.600 millones de parametros en cuantizaciones de baja precision (con imatrix) para que pueda ejecutarse en hardware con memoria limitada mediante llama.cpp y ecosistemas compatibles con GGUF.

El repositorio tiene un tamano de 45,3 GB y, en el momento de la consulta, registra 0 descargas y 0 likes, con fecha de creacion el 23 de noviembre de 2026. La unica cuantizacion listada explicitamente en la model card es i1-Q2_K (45,3 GB), acompanada de un fichero imatrix de 0,2 GB para generar cuantizaciones propias; la lista de tipos de cuantizacion mencionada en los metadatos internos incluye un rango amplio (Q2_K, IQ3_M, Q4_K_M, Q6_K, IQ1_S, entre otros), pero no se confirma que todos los ficheros esten publicados.

Su relevancia es acotada: sirve a usuarios que quieran probar un merge de gran tamano en ingles con recursos modestos, o que necesiten el fichero imatrix para producir sus propias cuantizaciones. No hay informacion publica sobre arquitectura interna, datos de entrenamiento ni evaluaciones, por lo que debe tratarse como un artefacto de cuantizacion experimental mas que como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base es un merge con mergekit; arquitectura interna no documentada) |
| Parametros totales | 122.610.069.504 (122,6 mil millones, segun safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K publicado; lista de metadatos incluye Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL (no se confirma publicacion de todas) |
| Idiomas soportados | en (ingles) |
| Licencia | mrl (Mistral Research License 0.1, segun license_link) |
| Formato de pesos | GGUF (cuantizaciones); fichero imatrix adicional |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base: la model card solo indica que es un merge generado con mergekit y que el modelo cuantizado se obtiene con transformers como libreria de referencia. No se documentan capas, atencion, tipo de transformer ni si incorpora mecanismos como MoE, atencion lineal o decodificacion especulativa.

Tampoco hay datos sobre el entrenamiento: no se indica numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Al tratarse de un merge, el conocimiento procede de los modelos fusionados, cuyos origenes no se detallan en la informacion disponible. La unica innovacion tecnica documentada es el uso de cuantizacion con matriz de importancia (imatrix) para mejorar la calidad de las cuantizaciones de baja precision, un procedimiento habitual en el ecosistema de mradermacher.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` y el idioma declarado.
- Formato GGUF compatible con llama.cpp y herramientas derivadas (Ollama, LM Studio, entre otras).
- Disponibilidad de fichero imatrix para generar cuantizaciones propias con calidad mejorada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del ingles.
- No se documenta vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Pruebas de inferencia local en ingles: cargar la cuantizacion i1-Q2_K en llama.cpp para evaluar la calidad del merge en tareas conversacionales sin necesidad de GPU de gran memoria.
- Generacion de cuantizaciones propias: usar el fichero imatrix publicado (0,2 GB) para producir variantes IQ con la herramienta de cuantizacion de llama.cpp y ajustar el equilibrio tamano/calidad.
- Experimentacion con merges: comparar el comportamiento de este merge frente a otros modelos fusionados en tareas de chat para decidir si merece la pena conservarlo en un catalogo interno.
- Despliegue en entornos con memoria limitada: al ser un GGUF de baja precision, puede ejecutarse en maquinas con menos VRAM que las necesarias para el modelo base en safetensors, util para prototipos y demos.
- Evaluacion de calidad de cuantizacion: medir la perplejidad de la variante i1-Q2_K frente al modelo original para estudiar el impacto de la cuantizacion agresiva en un modelo de 122,6 mil millones de parametros.
- Docencia y formacion: ilustrar el flujo completo mergekit -> cuantizacion GGUF -> inferencia local en talleres tecnicos sobre modelos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; la unica cuantizacion publicada ocupa 45,3 GB en disco, por lo que la inferencia requerira aproximadamente esa cantidad de memoria (GPU o RAM) o un reparto entre ambas.
- GPU recomendadas: no hay recomendaciones del autor. Por tamano, una GPU de 48 GB (A6000, L40S) o superior (A100 80 GB, H100) seria necesaria para mantener la cuantizacion i1-Q2_K completamente en VRAM; con GPUs de 24 GB (RTX 4090) habria que descargar capas a RAM del sistema.
- Cabe en GPU de consumo: no de forma completa con la cuantizacion publicada; seria viable solo con offloading parcial a RAM, con la penalizacion de velocidad correspondiente.
- Opciones de despliegue: llama.cpp y herramientas compatibles con GGUF (Ollama, LM Studio, entre otras). No se documenta soporte para vLLM o TGI con este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Behemoth_1.1_1.2_2.2_Magnum_V4-i1-GGUF (este) | 122,6 mil millones | no disponible | GGUF (i1-Q2_K) | mrl | Cuantizacion de un merge; sin benchmarks publicados |
| Behemoth_1.1_1.2_2.2_Magnum_V4 (modelo base) | 122,6 mil millones | no disponible | safetensors | mrl (segun model card) | Merge original con mergekit; sin benchmarks publicados |
| Behemoth_1.1_1.2_2.2_Magnum_V4-GGUF (cuantizaciones estaticas) | 122,6 mil millones | no disponible | GGUF | mrl | Variante de cuantizacion estatica del mismo modelo, publicada por mradermacher |
| Gloomy-Dusk-26B-A4B-i1-GGUF | 26 mil millones (aproximado, segun nombre) | no disponible | GGUF | no disponible | Otro GGUF de mradermacher aparecido en la misma busqueda; no comparable en tamano |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con modelos de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un merge sin informacion sobre sus componentes, no es posible evaluar sesgos de origen.
- Riesgo de alucinacion: no evaluado; la cuantizacion agresiva a Q2 puede degradar la coherencia y aumentar errores factuales respecto al modelo original.
- Limitaciones de contexto e idioma: solo se declara ingles; la longitud de contexto no esta documentada.
- Restricciones de licencia: la licencia es MRL (Mistral Research License 0.1), que restringe el uso comercial; debe revisarse el texto completo antes de cualquier despliegue productivo.
- Advertencia de produccion: el repositorio tiene 0 descargas y 0 likes, sin benchmarks ni evaluaciones independientes; no hay garantia de calidad ni de mantenimiento.
- La model card solo confirma la publicacion de i1-Q2_K; otras cuantizaciones listadas en metadatos pueden no estar disponibles.
- El modelo base es un merge con mergekit, lo que implica que su comportamiento depende de modelos de origen no documentados en esta ficha.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/mradermacher/Behemoth_1.1_1.2_2.2_Magnum_V4-i1-GGUF
- Modelo base: https://huggingface.co/alansmithee-cpu/Behemoth_1.1_1.2_2.2_Magnum_V4
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Behemoth_1.1_1.2_2.2_Magnum_V4-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Behemoth_1.1_1.2_2.2_Magnum_V4-i1-GGUF
- Licencia MRL 0.1: https://mistral.ai/licenses/MRL-0.1.md
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Mencion en ChaosAI (tendencias): https://chaosaiagent.com/industry-data/ai-trends
