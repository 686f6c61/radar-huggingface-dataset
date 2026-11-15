# areai51/propensity-one-audience

## Resumen

Propensity One audience es un modelo de estimacion de propension de compra desarrollado por el usuario areai51 y publicado como vista previa de investigacion (research preview). No es un modelo generativo: es un encoder de frases afinado a partir de BAAI/bge-small-en-v1.5 (33 millones de parametros) que, dada la descripcion de un producto, estima que segmentos demograficos tienen mayor probabilidad relativa de comprarlo. La salida es un lift por segmento, es decir, el cociente entre la probabilidad de que un segmento compre el producto y la probabilidad media de la poblacion de referencia.

El modelo se entrena sobre Open e-commerce 1.0 (CC0), un conjunto de 1,85 millones de compras reales en Amazon.com entre 2018 y 2022 realizadas por 5.027 consumidores estadounidenses que ademas respondieron a una encuesta demografica. Los atributos modelados son edad, genero, nivel de ingresos, educacion, tamano del hogar y region censal de EE. UU. Su relevancia actual radica en que ofrece una senal cuantitativa y calibrada para priorizar segmentos de audiencia a partir del texto del catalogo, sin necesidad de datos propios de clientes.

Es importante subrayar que el modelo no predice la probabilidad absoluta de compra ni la respuesta a un anuncio: solo compara segmentos entre si. La precision medida es modesta (62 % frente al 50 % del azar en la tarea de eleccion entre dos productos), por lo que su uso adecuado es el analisis agregado de segmentos en grandes catalogos, no la evaluacion de individuos concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BAAI/bge-small-en-v1.5) con cabezas de clasificacion por atributo demografico |
| Parametros totales | 33 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del encoder BAAI/bge-small-en-v1.5 y anade cabezas de clasificacion para cada atributo demografico (edad, genero, ingresos, educacion, tamano del hogar y region). El entrenamiento consistio en una sola pasada sobre 698.930 filas persona-producto correspondientes a 3.706 personas, con batch de 128 y optimizador AdamW (tasa de aprendizaje de 3e-5 para el encoder y 1e-3 para las cabezas). La funcion de perdida es entropia cruzada por atributo, con las filas ponderadas por 1 / sqrt(numero de compras de esa persona) para evitar que los compradores mas activos dominen el ajuste. Se ajusta una temperatura por atributo y otra para perfiles completos sobre el conjunto de validacion.

La particion de datos es bilateral: tanto las personas como las familias de productos (mismo ASIN o mismas cinco primeras palabras del titulo) se asignan a un unico split, y una fila solo se usa cuando ambos coinciden. La evaluacion se realizo sobre 510 personas y 15.552 familias de productos ausentes del entrenamiento. La innovacion principal no es arquitectonica sino metodologica: la definicion de la etiqueta como lift relativo y la calibracion explicita del score mediante una sigmoide (sigmoid(0,69 x diferencia de score), con error de calibracion esperado de 0,009 en test).

## Capacidades

- Estimacion de lift por segmento demografico a partir del texto de un producto (`model.lift`).
- Perfilado de lift combinando varios atributos de un mismo perfil (`model.profile_lift`).
- Ranking de los segmentos con mayor propension para un producto dado (`model.top_segments`).
- Atributos soportados: edad (18-24, 25-34, 35-44, 45-54, 55-64, 65+), genero (female, male), ingresos del hogar en USD (<25k, 25-50k, 50-75k, 75-100k, 100-150k, 150k+), educacion (no_degree, bachelor, graduate), tamano del hogar (1, 2, 3, 4+) y region censal de EE. UU.
- Deteccion interna de atributos sin senal: la region se excluye de `top_segments` porque su AUC (0,515) no permite medir senal.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso; no es un modelo conversacional.
- Capacidad multilingue limitada al ingles: el texto de entrada debe estar en ingles para un funcionamiento fiable.

## Casos de uso

- Priorizacion de segmentos en planificacion de campanas: dado el titulo de un producto, `top_segments` devuelve los segmentos con mayor lift, lo que permite asignar presupuesto de medios a los publicos con mayor propension relativa antes de lanzar la campana.
- Analisis de catalogo a gran escala: al ser un encoder de 33 millones de parametros, puede procesar miles de titulos de producto en una sola GPU consumer y generar un mapa de afinidad demografica por referencia, util para decidir que productos promocionar en que canales.
- Enriquecimiento de fichas de producto en e-commerce: integrar el lift por segmento en el backoffice para que los equipos de marketing vean, junto a cada SKU, que perfiles demograficos muestran mayor afinidad segun los datos historicos de compra.
- Investigacion de mercado y validacion de hipotesis: contrastar hipotesis cualitativas sobre el publico objetivo de una categoria (por ejemplo, si un producto de cuidado antiarrugas atrae mas a mayores de 55) con una estimacion cuantitativa derivada de compras observadas.
- Segmentacion de audiencias para retail media: usar el lift por perfil como senal adicional en la construccion de segmentos lookalike o en la ponderacion de audiencias de primera parte, siempre como indicador relativo y no como probabilidad individual.
- Analisis competitivo de categorias: comparar el perfil demografico estimado de dos productos de la misma categoria Amazon para detectar diferencias de posicionamiento y orientar el desarrollo de nuevas referencias.
- Docencia y experimentacion en marketing cuantitativo: el modelo es ligero, de licencia MIT y con codigo de evaluacion publicado, lo que facilita reproducir el pipeline completo en cursos o proyectos de investigacion.

## Benchmarks y rendimiento

Tarea de eleccion entre dos productos (dado un comprador y dos productos, uno comprado por el y otro por otra persona; el azar puntua 0,50):

| Modelo | Cualquier par de productos | Dos productos de la misma categoria Amazon |
|---|---|---|
| Propensity One audience | 0,616 [0,6018, 0,6322] | 0,555 [0,5407, 0,5688] |
| Tabla de consulta por categoria de producto de Amazon | 0,586 | 0,500 por construccion |
| Azar | 0,500 | 0,500 |

AUC por atributo (prediccion del valor del comprador a partir del texto del producto; 0,5 = sin senal):

| Atributo | AUC | Ganancia de log-loss sobre el prior (IC 95 %) |
|---|---|---|
| Genero | 0,641 | +0,046 [0,034, 0,060] |
| Edad | 0,577 | +0,022 [0,013, 0,032] |
| Educacion | 0,555 | +0,011 [0,006, 0,016] |
| Tamano del hogar | 0,552 | +0,010 [0,005, 0,016] |
| Ingresos | 0,545 | +0,015 [0,009, 0,020] |
| Region | 0,515 | +0,001 [-0,001, 0,003] |

Calibracion (lift predicho frente a lift observado, agrupado por bins):

| Lift predicho | 0,63 | 0,86 | 0,94 | 1,00 | 1,06 | 1,16 | 1,35 | 1,77 |
|---|---|---|---|---|---|---|---|---|
| Lift observado | 0,69 | 0,88 | 0,95 | 0,99 | 1,04 | 1,15 | 1,34 | 1,59 |

Los lifts extremos se sobreestiman ligeramente. En cuentas de un solo usuario la precision por pares asciende a 0,638.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 33 millones de parametros del encoder; el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria, incluidas GTX 1650, RTX 3060, RTX 4090, A100 o H100; el modelo no aprovecha la capacidad de las GPU de datacenter.
- Cabe holgadamente en cualquier GPU consumer e incluso en CPU para lotes pequenos.
- Opciones de despliegue: la libreria `transformers` con el cargador propio del autor (`PropensityOneAudience`), descargado via `huggingface_hub.snapshot_download`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Propensity One audience (areai51) | 33 M | no disponible | Lift demografico por producto | MIT | Hugging Face |
| BAAI/bge-small-en-v1.5 | 33 M | no disponible | Embeddings de frases (modelo base) | MIT | Hugging Face |
| Propensity One (areai51) | no disponible | no disponible | Ranking de copy publicitario por CTR | no disponible | Hugging Face |

No se dispone de informacion sobre otros modelos comparables de estimacion de propension de compra por segmento demografico; el autor no cita alternativas directas en la model card.

## Limitaciones y advertencias

- La salida es relativa, no absoluta: un lift compara segmentos y no dice cuantos individuos compraran el producto.
- Los datos proceden de un unico minorista (Amazon.com), un unico pais (EE. UU.) y un periodo concreto (2018-2022); la generalizacion a otros mercados no esta validada.
- El panel de compradores es reclutado, no una muestra probabilistica: esta sesgado hacia personas mas jovenes y con mayor nivel educativo que la poblacion estadounidense, y los lifts son relativos a ese panel.
- El modelo se entrena con titulos de listados de producto; textos publicitarios que no nombran el producto producen lifts cercanos a 1, sin senal util.
- El 29 % de las cuentas son compartidas por varias personas, lo que difumina las etiquetas; en cuentas de un solo usuario la precision por pares sube a 0,638.
- Precision modesta (0,616 frente a 0,50 del azar): apta para comparar segmentos a traves de muchos productos, no para juzgar a una persona concreta.
- La region no aporta senal medible y el modelo la excluye de `top_segments`.
- El genero solo admite female y male porque las otras 127 respuestas eran demasiado escasas; esas personas permanecen en los datos con genero ausente.
- Riesgo de uso indebido: el modelo no debe emplearse para inferir caracteristicas individuales a partir de compras ni para excluir personas de ofertas de vivienda, empleo, credito u otras de naturaleza sensible. El pipeline de entrenamiento no lee campos de raza, origen hispano, orientacion sexual, consumo de sustancias, condiciones de salud ni eventos vitales como el embarazo.
- No predice la respuesta a un anuncio; para ranking de copy por CTR el autor remite a Propensity One.
- Licencia MIT para los pesos, compatible con uso comercial; los datos de entrenamiento son CC0 1.0 y requieren atribucion segun la cita indicada por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/areai51/propensity-one-audience
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Dataset Open e-commerce 1.0: https://doi.org/10.7910/DVN/YGLYDY
- Articulo de Scientific Data sobre el dataset: Berke, A., Calacci, D., Mahari, R., Yabe, T., Larson, K. & Pentland, S. "Open e-commerce 1.0, five years of crowdsourced U.S. Amazon purchase histories with user demographics." *Scientific Data* 11, 491 (2024)
- Modelo complementario Propensity One: https://huggingface.co/areai51/propensity-one
- Repositorio de codigo y evaluacion: repositorio `propensity-one`, snapshot `openecom_brx-pipe-0.4.0` (sin URL publica en la informacion disponible)
