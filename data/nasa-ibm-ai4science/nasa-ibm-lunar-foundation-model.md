# nasa-ibm-ai4science/NASA-IBM-Lunar-Foundation-Model

## Resumen

El NASA-IBM Lunar Foundation Model (NASA-IBM LFM) es un modelo fundacional multimodal y multirresolucion para teledeteccion lunar, desarrollado conjuntamente por NASA (a traves de NASA-IMPACT) e IBM Research. Se trata de un encoder-decoder basado en ViT-B entrenado desde cero sobre SomBench, un corpus de aproximadamente 2 millones de paquetes de teselas lunares co-registradas que abarcan 11 modalidades a dos escalas espaciales: LROC NAC a ~1 m/px y LROC WAC a ~100 m/px. El modelo adapta la receta de masked-token modeling de TerraMind al dominio lunar.

La relevancia del modelo reside en dos extensiones tecnicas sobre la receta original. La primera es el uso de la geometria de adquisicion como contexto explicito: los angulos de iluminacion por tesela, las anclas en el marco solar y la huella de la tesela se tokenizan como secuencia de entrada, de modo que el modelo recibe el confounder dominante (la iluminacion) en lugar de tener que inferirlo. La segunda es el preentrenamiento conjunto a resolucion mixta, que entrena teselas ancladas a NAC y a WAC en un unico bucle de batches mixtos a resolucion nativa, permitiendo que un unico conjunto de pesos cubra ambas familias a lo largo de una brecha de escala de 100x.

El checkpoint emplea patch embedding FlexiViT, lo que permite reajustar el modelo a otros tamanos de patch sin reentrenar el backbone, y tokenizacion por modalidad, que permite anadir o eliminar modalidades durante el fine-tuning. El modelo se distribuye con licencia Apache-2.0 y su adaptacion downstream se realiza mediante TerraTorch. No es un producto generativo de grado cientifico: la model card explicita que las salidas generadas no son predicciones calibradas ni sustituyen a instrumentos, fotogrametria estereo o soluciones geodesicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-B encoder / decoder Transformer de 12 capas, anchura compartida (768 dim, 12 capas, 12 cabezas en el encoder) |
| Parametros totales | no disponible (encoder ViT-B de 768 dim, 12 capas y 12 cabezas; decoder de 12 capas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en tokens; entrada de imagen de 256 x 256 px que se tokeniza por modalidad |
| Tipos de cuantizacion | no disponible para los pesos del modelo; los tokenizadores usan cuantizacion FSQ con niveles 8, 8, 8, 6, 5 |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el repositorio incluye checkpoints y configuraciones en `backbone/` y `tokenizers/`; tamano del repo: 12,8 GB) |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder con un encoder ViT-B (768 dimensiones, 12 capas, 12 cabezas) y un decoder Transformer de 12 capas con anchura compartida. Las modalidades densas (tipo imagen) se proyectan con patch embedding y se tokenizan como imagenes; las dos modalidades tipo secuencia portan contexto escalar que se discretiza en bins y se convierte a cadena antes de la tokenizacion de texto (por ejemplo, con bins de 0,25 grados de longitud, una longitud de centro de tesela de 87,49 grados se transforma en `C_LON=87.25-->87.50`). El objetivo es de masked-token modeling, con entropia cruzada sobre vocabularios discretos de tokens en las posiciones objetivo muestreadas, al estilo any-to-any de TerraMind. La tokenizacion es especifica por modalidad: nueve tokenizadores VQ-VAE con cuantizacion FSQ y decoder DDPM.

El preentrenamiento se realizo integramente desde cero sobre SomBench, compuesto por 963.609 paquetes anclados a WAC y 1.000.113 paquetes anclados a NAC, con una division geografica por zona LTM y por limite de LPS (nunca se mezclan las dos familias dentro de una misma muestra). El computo empleado fue de 16 GPU H100 durante 150.000 pasos, con batch global de 1.536, learning rate pico de 1e-4 con decaimiento coseno, precision bf16 y aproximadamente 1.100 horas de GPU en total. Las innovaciones destacables son la incorporacion de metadatos opticos de ocho campos (incidencia solar, emision, fase y azimut, coordenadas sub-solares y de centro de tesela, y ground sampling distance) como tokens de contexto, sin riesgo de fuga de etiquetas porque estan disponibles siempre que lo esta la imagen; el contexto de mapas estaticos con 28 campos de averages sobre la huella de la tesela (Diviner, LOLA, Mini-RF, Kaguya, LROC WAC, GRAIL y Lunar Prospector); y el patch embedding FlexiViT, que permite fine-tuning a otros tamanos de patch.

## Capacidades

- Extraccion de caracteristicas de imagen para teledeteccion lunar: el pipeline declarado es `image-feature-extraction` y el modelo esta pensado como representacion reutilizable.
- Deteccion y segmentacion sobre imagenes LROC WAC y NAC, incluyendo la tarea de deteccion de crateres recogida en las etiquetas del modelo.
- Regresion densa sobre productos del terreno co-registrados, con modalidades como `dtm`, `slope` y `aspect` a 60 m (SLDEM2015) y `dtm_3m`, `slope_3m` y `aspect_3m` a 3 m (DTM estereo de NAC).
- Procesamiento multimodal de 11 modalidades: 9 densas tipo imagen mas metadatos opticos por tesela y contexto de mapas estaticos.
- Generacion multimodal any-to-any como sonda cualitativa de la estructura cross-modal aprendida (no como producto calibrado).
- Fine-tuning con subconjuntos de modalidades distintos de los del preentrenamiento, gracias a la tokenizacion por modalidad.
- Fine-tuning a tamanos de patch alternativos sin reentrenar el backbone, gracias a FlexiViT.
- Cobertura de dos familias de resolucion (NAC ~1 m/px y WAC ~100 m/px, brecha de 100x) con un unico conjunto de pesos.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de audio o lenguaje natural.

## Casos de uso

- Deteccion de crateres: el modelo actua como extractor de caracteristicas sobre recortes de LROC NAC a 1 m/px y la cabeza de deteccion se entrena con TerraTorch, aprovechando que el backbone ya ha visto 1.000.113 paquetes NAC en preentrenamiento.
- Segmentacion geologica de unidades superficiales: fine-tuning del encoder sobre teselas WAC con las bandas `vis` y `uv` para delimitar unidades por reflectancia, usando el contexto de metadatos opticos para neutralizar el efecto de la iluminacion.
- Reconstruccion densa de topografia: regresion de `dtm_3m` a partir de imagenes NAC, teniendo en cuenta que la model card advierte que la forma local es correcta pero con un offset de elevacion desplazado (no mantiene marco geodetico de referencia).
- Mapeo de abundancia de roca y propiedades termofisicas: regresion sobre los campos de contexto estatico de Diviner (`ROCK_ABUND`, `TREG`, `TBOL`, `HPAR`, `DICE`) a partir de las modalidades densas, util para cartografia de regolito.
- Prospectividad de hielo en regiones polares: el modelo puede producir mapas de prospectividad, si bien la model card precisa que regresa un mapa de prospectividad tipo fuzzy-overlay dirigido por conocimiento y no hielo medido.
- Extraccion de embeddings para clasificacion y clustering de terreno: uso del encoder congelado para generar representaciones de teselas y alimentar clasificadores ligeros en pipelines de analisis a gran escala.
- Analisis con cobertura instrumental incompleta: cuando no se dispone de determinados productos derivados, la tokenizacion por modalidad permite entrenar con el subconjunto disponible (por ejemplo, solo `nac` mas metadatos opticos).
- Sonda de estructura cross-modal en investigacion: generacion any-to-any para estudiar que relaciones entre modalidades ha aprendido el modelo durante el preentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al informe tecnico `NI_LFM_Technical_Report.pdf` para el metodo completo, las ablaciones y los resultados por baseline, pero no incluye cifras numericas en el texto proporcionado ni en los resultados de la busqueda web.

## Requisitos de hardware

- Preentrenamiento documentado: 16 GPU H100, 150.000 pasos, batch global de 1.536 y aproximadamente 1.100 horas de GPU en bf16.
- Inferencia: el encoder es un ViT-B (768 dim, 12 capas, 12 cabezas). Como estimacion derivada de esa arquitectura, los pesos del encoder en fp16 ocupan del orden de centenares de MB y el conjunto encoder mas decoder se mantiene por debajo de 1 GB; a ello hay que sumar el espacio de los nueve tokenizadores VQ-VAE/DDPM. Estas cifras son estimaciones a partir de la arquitectura declarada, no datos publicados por los autores.
- GPU recomendadas para fine-tuning: H100 o A100 para reproducir el regimen de preentrenamiento; GPU de gama alta para adaptacion. Para inferencia y extraccion de caracteristicas, el modelo cabe holgadamente en GPU de consumo (RTX 4090, RTX 3090, RTX 4080 y similares).
- Opciones de despliegue: TerraTorch para fine-tuning y adaptacion downstream; PyTorch para inferencia. No es compatible con runtimes orientados a modelos de lenguaje como vLLM, llama.cpp, Ollama o TGI, al no tratarse de un LLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en los resultados de busqueda modelos fundacionales lunares directamente comparables. La unica referencia solida es la receta arquitectonica de la que deriva este modelo.

| Modelo | Dominio | Arquitectura | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NASA-IBM Lunar Foundation Model | Luna | ViT-B encoder-decoder, masked-token modeling | 11 (NAC, WAC, DTM, slope, aspect, uv, metadatos, mapas estaticos) | Apache-2.0 | HuggingFace + GitHub |
| TerraMind | Tierra | Arquitectura any-to-any de masked-token modeling (base de la receta) | no disponible en la informacion proporcionada | no disponible | arXiv 2504.11171 |
| Otros modelos fundacionales de teledeteccion (por ejemplo, variantes tipo Prithvi) | Tierra | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible | no disponible |

## Limitaciones y advertencias

- No es un producto generativo de grado cientifico: los campos generados no son predicciones calibradas y no sustituyen a instrumentos, fotogrametria estereo ni soluciones geodesicas.
- El modelo no mantiene un marco geodetico de referencia: recupera estructura local pero no valores absolutos. La forma del DTM es correcta con un offset de elevacion desplazado y las coordenadas de latitud/longitud generadas pueden desviarse decenas de grados.
- No esta validado para decisiones operativas como la certificacion de lugares de aterrizaje o la autorizacion de riesgos.
- Las salidas de prospectividad de hielo regresan un mapa de prospectividad fuzzy-overlay dirigido por conocimiento, no hielo medido.
- No ha sido evaluado fuera de la Luna ni sobre productos ausentes de SomBench.
- Los metadatos opticos y de mapas estaticos tienen cobertura variable segun la huella del instrumento, desde casi global hasta solo polar (aproximadamente 6.900 teselas polares).
- Los sesgos conocidos no se detallan en la informacion disponible; la model card no incluye una seccion especifica de sesgos.
- Riesgo de alucinacion: aplicable en el modo generativo, donde las salidas son sondas cualitativas y no predicciones calibradas.
- Idioma: el modelo no procesa lenguaje natural, por lo que no aplican limitaciones idiomaticas en el sentido habitual.
- Licencia Apache-2.0, permisiva y sin restricciones documentadas para uso comercial; conviene revisar igualmente las condiciones de los datos de SomBench y de los productos de terceros (Diviner, LOLA, Mini-RF, Kaguya, GRAIL, Lunar Prospector) integrados como contexto.
- El repositorio ocupa 12,8 GB, lo que incluye el checkpoint del backbone y los nueve tokenizadores; hay que prever ese espacio en disco en despliegues con multiples versiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nasa-ibm-ai4science/NASA-IBM-Lunar-Foundation-Model
- Informe tecnico (PDF en el repositorio): https://huggingface.co/nasa-ibm-ai4science/NASA-IBM-Lunar-Foundation-Model/blob/main/NI_LFM_Technical_Report.pdf
- Codigo de fine-tuning en GitHub: https://github.com/NASA-IMPACT/NASA-IBM-Lunar-Foundation-Model
- Dataset de preentrenamiento SomBench: https://huggingface.co/datasets/nasa-ibm-ai4science/Sombench-pretraining-data
- Paper de TerraMind (receta base): https://arxiv.org/abs/2504.11171
- TerraTorch (framework de adaptacion downstream): https://github.com/IBM/terratorch
- NASA: https://www.nasa.gov/
- NASA Science: https://science.nasa.gov/
