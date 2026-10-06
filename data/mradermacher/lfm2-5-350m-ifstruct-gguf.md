# mradermacher/LFM2.5-350M-ifstruct-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo ChetanDhembreAI/LFM2.5-350M-ifstruct, generadas por mradermacher. No se trata de un modelo nuevo, sino de una redistribución optimizada para inferencia local del modelo base, que a su vez deriva de la familia LFM2.5 (el identificador y las etiquetas del repositorio hacen referencia a lfm2). El modelo cuenta con 354.483.968 parámetros totales (aproximadamente 354 millones), según los pesos en safetensors del modelo original.

El problema que resuelve es concreto: el modelo base ha sido ajustado con GRPO (Group Relative Policy Optimization) para generar salidas estructuradas en JSON y YAML, un caso de uso habitual en pipelines de extracción de datos, validación de esquemas y formateo de argumentos para llamadas a herramientas. Al publicarse en GGUF, el modelo puede ejecutarse en CPU o en GPU de gama baja sin necesidad de infraestructura de servidor, lo que facilita su integración en aplicaciones de borde.

La relevancia actual de esta ficha es doble: por un lado, permite evaluar un modelo de muy bajo coste computacional para tareas de salida estructurada; por otro, es un ejemplo de la práctica habitual de cuantización comunitaria, donde un tercero (mradermacher) publica versiones GGUF de un modelo ajeno. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se ha publicado información sobre benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (el modelo pertenece a la familia LFM2.5, etiquetada como lfm2) |
| Parametros totales | 354.483.968 (aproximadamente 354 M) |
| Parametros activos | no aplica segun la informacion disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (etiquetada como "other" con license_name: lfm1.0) |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en el repositorio ChetanDhembreAI/LFM2.5-350M-ifstruct |
| Tamano del repositorio | 3,3 GB |
| Tamano de cada cuantizacion | de 0,3 GB (Q2_K y Q4_K_M) a 0,8 GB (f16) |
| Metodo de cuantizacion | estatica (static quants, quantize_version 2, convert_type hf) |
| Modelo base | ChetanDhembreAI/LFM2.5-350M-ifstruct |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de las etiquetas del repositorio, que lo vinculan a la familia lfm2, desarrollada originalmente por Liquid AI. No se especifica en la model card si se trata de un transformer denso, de una arquitectura hibrida de convolucion y atencion, ni de un modelo de espacio de estados (SSM). Tampoco se indica el numero de capas, la dimension oculta, el numero de cabezas de atencion ni la longitud de contexto soportada.

En cuanto al entrenamiento, las etiquetas del modelo base indican el uso de GRPO (una variante de aprendizaje por refuerzo) junto con las categorias structured-output, json, yaml e ifstruct. Esto apunta a un ajuste orientado especificamente a la generacion de estructuras de datos validas, no a un ajuste conversacional generico. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases previas de SFT, ni sobre el uso de DPO, RLHF u otras tecnicas. Tampoco se documenta ninguna innovacion arquitectonica como decodificacion especulativa o atencion lineal.

El trabajo realizado por mradermacher es exclusivamente de cuantizacion: se han generado versiones GGUF estaticas a partir de los pesos en formato HuggingFace del modelo base. La propia model card indica que no hay cuantizaciones ponderadas ni con imatrix disponibles en el momento de la publicacion, y que no estan planificadas salvo peticion explicita en la seccion de discusiones de la comunidad.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta conversational del modelo base.
- Generacion de salida estructurada en JSON y YAML, capacidad reforzada mediante GRPO y explicitamente declarada en las etiquetas.
- Ajuste especifico para "ifstruct" (formato de instrucciones estructuradas), lo que sugiere cumplimiento de esquemas predefinidos.
- Razonamiento de un solo turno orientado a la extraccion y formateo de informacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles (language: en). No se declara soporte de castellano ni de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Extraccion de datos estructurados desde texto libre: el modelo recibe un parrafo no estructurado y devuelve un objeto JSON con los campos solicitados. Su ajuste con GRPO para salida estructurada reduce la probabilidad de JSON malformado respecto a un modelo generico del mismo tamano.
- Normalizacion de salidas de agentes: en un pipeline donde varios LLM generan texto libre, este modelo puede actuar como reformateador final que convierte esa salida en JSON o YAML valido antes de pasarla a un sistema posterior.
- Generacion y validacion de ficheros de configuracion: produccion de YAML para ficheros de CI, despliegues Kubernetes o configuracion de aplicaciones, con la ventaja de que el modelo cabe en memoria de un contenedor ligero.
- Preprocesado en pipelines de CI/CD: dado su tamano (0,3-0,5 GB cuantizado), puede ejecutarse dentro del propio runner para transformar artefactos de texto en estructuras consumibles por scripts posteriores.
- Inferencia en dispositivos de borde o sin GPU: al disponer de cuantizaciones de 0,3 GB en Q4_K_S y Q4_K_M, es viable su ejecucion en CPU en portatiles, mini-PC o placas tipo Raspberry Pi con llama.cpp.
- Etiquetado y enriquecimiento de datasets: uso como anotador automatico de bajo coste que devuelve etiquetas o metadatos en formato estructurado, aplicable a grandes volumenes de texto en ingles.
- Clasificacion con salida restringida: tareas de enrutamiento o categorizacion donde la respuesta debe ser exactamente una de un conjunto de opciones, aprovechando el ajuste a esquemas cerrados.
- Prototipado rapido de funciones de parseo: sustitucion de expresiones regulares fragiles por un modelo que comprende variaciones de formato y devuelve una estructura consistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K, IFEval ni de evaluacion de salida estructurada, y la busqueda web realizada no ha devuelto resultados relacionados con el modelo (los resultados obtenidos tratan sobre el formato de presentacion PechaKucha y no guardan relacion con este modelo).

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): aproximadamente 0,3 GB en Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S y Q4_K_M; 0,4 GB en Q5_K_S, Q5_K_M y Q6_K; 0,5 GB en Q8_0; 0,8 GB en f16.
- Si cabe en GPU de consumo: si. Practicamente cualquier GPU con 2 GB o mas de VRAM puede ejecutar las cuantizaciones Q4 y Q8, incluidas GTX 1050 Ti, RTX 3050, RTX 4060 y superiores. Las cuantizaciones de mayor tamano caben igualmente en GPUs con 4 GB o mas.
- Ejecucion en CPU: viable y recomendada para este tamano. Las cuantizaciones Q4_K_S y Q4_K_M estan marcadas como "fast, recommended" en la model card; Q8_0 como "fast, best quality". Con 0,3-0,5 GB de pesos, la memoria RAM necesaria es modesta y el modelo cabe en dispositivos de 4 GB de RAM.
- GPU recomendadas por escenario: A100 y H100 no aportan ventaja practica para un modelo de 354 M de parametros y quedarian infrautilizadas; el objetivo realista es CPU, iGPU, Jetson, Apple Silicon o GPUs de consumo de gama de entrada y media.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, kobold.cpp, llama-cpp-python) son las vias naturales para GGUF. vLLM y TGI estan orientados principalmente a pesos safetensors y a despliegues con throughput alto; su soporte de GGUF es limitado, por lo que no se recomiendan como primera opcion aqui. El formato GGUF tambien es compatible con servidores compatibles con endpoints segun las etiquetas del repositorio (endpoints_compatible).
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia en la informacion disponible.

## Comparativa con modelos similares

La tabla siguiente compara el modelo con alternativas de tamano equivalente del mismo rango (modelos pequenos de instrucciones). Los datos de los modelos comparados provienen de la documentacion publica de cada proyecto y no de la informacion proporcionada en esta consulta; deben verificarse antes de tomar decisiones de produccion.

| Modelo | Parametros | Contexto | Licencia | Enfoque principal |
|---|---|---|---|---|
| LFM2.5-350M-ifstruct (este modelo, via GGUF de mradermacher) | 354.483.968 | no disponible | lfm1.0 | Salida estructurada JSON/YAML ajustada con GRPO |
| LFM2-350M (Liquid AI) | no verificado en la informacion disponible | no verificado | lfm1.0 (familia LFM) | Modelo base de proposito general de la familia LFM2 |
| Qwen2.5-0.5B-Instruct | no verificado en la informacion disponible | no verificado | Apache-2.0 | Instrucciones generales y tool calling |
| SmolLM2-360M-Instruct | no verificado en la informacion disponible | no verificado | Apache-2.0 | Instrucciones generales en ingles |
| Gemma 3 270M IT | no verificado en la informacion disponible | no verificado | Terminos de uso de Gemma | Instrucciones generales, orientado a tareas ligeras |

La diferencia funcional relevante frente a las alternativas de proposito general es el ajuste especifico con GRPO para producir JSON y YAML validos. No hay datos de benchmarks que permitan comparar la calidad de esa salida estructurada frente a los modelos citados.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ningun analisis de sesgos en la informacion proporcionada. Al entrenarse principalmente con datos en ingles, es previsible un sesgo cultural y linguistico anglosajon, aunque no hay datos que lo cuantifiquen.
- Riesgo de alucinacion: no evaluado. Con 354 M de parametros, la capacidad de razonamiento y de conocimiento factual es limitada por diseno; se debe evitar su uso como fuente de verdad.
- Limitaciones de contexto e idioma: la unica lengua declarada es el ingles. No hay soporte declarado de castellano. La longitud de contexto no esta documentada, lo que impide planificar casos de uso con entradas largas.
- Restricciones de licencia: la licencia es lfm1.0 (Liquid AI Foundation Model License), que no es una licencia de codigo abierto estandar. Antes de cualquier uso comercial es imprescindible revisar el fichero LICENSE del repositorio y los terminos de la licencia LFM, ya que pueden existir restricciones de uso, atribucion o limites de escala.
- Caveat sobre el canal de publicacion: el repositorio lo mantiene un tercero (mradermacher) y no el autor del modelo base. No hay garantia de que las cuantizaciones se actualicen si el modelo base cambia. La model card indica que no hay cuantizaciones ponderadas ni con imatrix, por lo que las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad.
- Caveat de adopcion: 0 descargas y 0 likes en el momento de la consulta. No existe validacion comunitaria que respalde el comportamiento real de estas cuantizaciones.
- Caveat de evaluacion: sin benchmarks publicados, no es posible estimar la tasa de JSON invalido, la adherencia al esquema ni la degradacion introducida por cada nivel de cuantizacion.
- Caveat de fecha: la fecha de creacion del repositorio figura como 2026-10-05, posterior a la fecha habitual de publicacion de otros modelos; conviene verificar la coherencia de ese metadato antes de citarlo.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/LFM2.5-350M-ifstruct-GGUF
- Modelo base: https://huggingface.co/ChetanDhembreAI/LFM2.5-350M-ifstruct
- Pagina resumen del modelo con lista de descargas: https://hf.tst.eu/model#LFM2.5-350M-ifstruct-GGUF
- Licencia (fichero LICENSE del repositorio): https://huggingface.co/mradermacher/LFM2.5-350M-ifstruct-GGUF/blob/main/LICENSE
- Grafico comparativo de calidad de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (empresa que aporta la infraestructura de cuantizacion): https://www.nethype.de/
