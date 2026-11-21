# mradermacher/granite-4.0-3b-vision-i1-GGUF

## Resumen

`mradermacher/granite-4.0-3b-vision-i1-GGUF` es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo multimodal `ibm-granite/granite-4.0-3b-vision` de IBM. No se trata de un modelo original, sino de una redistribucion optimizada para inferencia local con llama.cpp y herramientas compatibles, empleando cuantizacion ponderada con fichero imatrix (denominada "i1" por el autor) para preservar en lo posible la calidad del modelo de referencia en cada nivel de compresion.

El modelo base pertenece a la familia Granite 4.0 de IBM, orientada a casos de uso empresariales con licencia Apache 2.0. La variante de 3B con vision combina procesamiento de texto e imagen, lo que la hace atractiva para despliegues en hardware modesto donde se requiere comprension de imagenes junto con generacion de texto. El repositorio incluye unicamente el fichero imatrix en el momento de la consulta, con un tamano de 0,1 GB, y el autor remite al repositorio estatico hermano para los ficheros de cuantizacion finales y los ficheros mmproj necesarios para la parte visual.

La relevancia de esta ficha radica en que facilita el acceso a un modelo multimodal de 3B en formato GGUF cuantizado, lo que permite ejecutarlo en GPU de consumo y en CPU, algo impracticable con los pesos originales en precision completa. No obstante, la informacion publicada en el repositorio es muy limitada: no se detallan composicion del dataset, resultados de benchmarks ni especificaciones completas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal de texto e imagen de la familia Granite 4.0; detalles no publicados en la informacion disponible) |
| Parametros totales | 1.887.800 (dato de safetensors del modelo base segun metadatos de Hugging Face; no coincide con la denominacion "3b", que hace referencia al modelo base de IBM) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_NL (small), IQ4_XS, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M (segun la lista de quants del repositorio) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 ponderadas con imatrix); el fichero imatrix esta en el repositorio, los GGUF finales en el repositorio estatico enlazado |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base `ibm-granite/granite-4.0-3b-vision` en la documentacion proporcionada. Por la denominacion y la pertenencia a la familia Granite 4.0, se trata de un modelo multimodal que procesa texto e imagenes, pero no se especifican en la informacion disponible el tipo de transformer, el mecanismo de atencion, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento.

Respecto al proceso de cuantizacion, el autor indica que se trata de cuantizaciones "weighted/imatrix" (i1), generadas con un fichero imatrix propio incluido en el repositorio. Este enfoque asigna importancia diferencial a los tensores durante la cuantizacion para reducir la perdida de calidad en comparacion con cuantizaciones estaticas equivalentes. El autor distingue explicitamente entre estas cuantizaciones i1 y las estaticas, disponibles en un repositorio separado. No se documentan innovaciones de arquitectura ni de decodificacion (decodificacion especulativa, atencion lineal, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto y comprension de imagenes, al derivar de un modelo multimodal (`granite-4.0-3b-vision`).
- Procesamiento de entradas multimodales texto-imagen, segun la naturaleza del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: el repositorio declara unicamente ingles (`en`).
- Modo thinking, vision, audio u otras capacidades especiales: solo se confirma vision por el nombre del modelo base; el resto no disponible.

## Casos de uso

- Clasificacion y descripcion de imagenes en local: el modelo puede recibir una imagen y generar una descripcion textual o etiqueta, ejecutandose en formato GGUF sobre llama.cpp en equipos sin GPU dedicada.
- Extraccion de informacion de documentos escaneados: al combinar vision y texto, puede procesar capturas o digitalizaciones y devolver campos estructurados, siempre que se valide la calidad con las cuantizaciones mas bajas.
- Asistentes de accesibilidad: generacion de descripciones de imagenes para lectores de pantalla en tiempo real, aprovechando el bajo coste computacional de un modelo de 3B cuantizado.
- Prototipado rapido de pipelines multimodales: uso del repositorio como banco de pruebas para validar integraciones con llama.cpp u Ollama antes de migrar al modelo base en precision completa.
- Moderacion de contenido visual en entornos con recursos limitados: analisis de imagenes enviadas por usuarios para detectar contenido no deseado, con el modelo desplegado en CPU o GPU de gama baja.
- Educacion y demos interactivas: despliegue en portatiles o mini-PC para demostrar capacidades de vision-lenguaje sin depender de APIs en la nube, gracias a la licencia Apache 2.0 y al formato GGUF.
- Investigacion sobre cuantizacion: comparacion de la calidad de las distintas cuantizaciones i1 frente a las estaticas del repositorio hermano para estudiar el impacto de imatrix en modelos multimodales pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para un modelo de aproximadamente 3B en GGUF, las cuantizaciones Q4_K_M suelen ocupar del orden de 2 GB, Q8 alrededor de 3-4 GB y Q2 por debajo de 1,5 GB, aunque estas cifras son estimaciones generales y no datos publicados por el autor.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, el modelo es apto para GPUs de consumo con 4-8 GB de VRAM en cuantizaciones medias; para las cuantizaciones mas altas se recomienda 8 GB o mas.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, en funcion de la cuantizacion elegida; no confirmado por el autor.
- Opciones de despliegue: llama.cpp (formato nativo GGUF) y herramientas derivadas como Ollama o LM Studio; el autor menciona `endpoints_compatible` en los tags, lo que sugiere compatibilidad con endpoints tipo OpenAI a traves de servidores GGUF. vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/granite-4.0-3b-vision-i1-GGUF (este) | ~3B (denominacion; metadatos indican 1.887.800 en safetensors) | no disponible | Apache 2.0 | GGUF | Cuantizaciones i1 con imatrix; vision; solo ingles declarado |
| mradermacher/granite-4.0-3b-vision-GGUF | ~3B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas del mismo modelo base, sin imatrix |
| ibm-granite/granite-4.0-3b-vision | ~3B | no disponible | Apache 2.0 | safetensors (transformers) | Modelo base original en precision completa |
| Alternativas multimodales pequenas (p. ej. Qwen2-VL-2B, PaliGemma) | 2-3B | variable | variable | safetensors, GGUF | No se dispone de datos comparativos de rendimiento en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La informacion publicada en el repositorio es minima: no hay model card detallada, benchmarks ni especificaciones del modelo base, lo que dificulta evaluar su calidad real antes de desplegarlo.
- El repositorio contiene en el momento de la consulta unicamente el fichero imatrix (0,1 GB); los ficheros GGUF de cuantizacion y los mmproj para la parte visual deben descargarse del repositorio estatico enlazado, lo que anade un paso y un riesgo de desactualizacion.
- El modelo declara soporte unicamente de ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Las cuantizaciones de muy baja precision (Q2, IQ1, IQ2) pueden degradar notablemente la calidad, especialmente en tareas de vision donde los errores de cuantizacion afectan a la representacion de imagenes.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado en tareas de descripcion de imagenes con cuantizaciones agresivas.
- Sesgos: no documentados por el autor; al no publicarse la composicion del dataset de entrenamiento, no es posible evaluar sesgos conocidos.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base original de IBM antes de un despliegue en produccion.
- El dato de parametros de safetensors (1.887.800) no concuerda con la denominacion "3b" del modelo base; conviene tratarlo con cautela y verificar el modelo original antes de dimensionar infraestructura.
- No se garantiza soporte de tool calling, agentes ni modo thinking en esta variante cuantizada; estas capacidades dependen del modelo base y no estan documentadas aqui.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/granite-4.0-3b-vision-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/granite-4.0-3b-vision-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-3b-vision
- Pagina de descargas del autor: https://hf.tst.eu/model#granite-4.0-3b-vision-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
