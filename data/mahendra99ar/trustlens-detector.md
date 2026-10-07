# Mahendra99ar/trustlens-detector

## Resumen

trustlens-detector es un modelo de clasificacion de texto publicado en HuggingFace por el usuario Mahendra99ar, distribuido bajo el identificador Mahendra99ar/trustlens-detector. Forma parte del proyecto TrustLens, cuyo objetivo declarado es detectar resenas de producto escritas por IA y resumir la opinion genuina por aspectos. El modelo se enmarca en la categoria de text-classification y esta etiquetado con las palabras clave transformers.js, onnx, bert, reviews y trustlens.

Se trata de un codificador de la familia BERT exportado a ONNX y cuantizado a INT8 (archivo onnx/model_quantized.onnx), disenado para ejecutarse integramente en el navegador mediante Transformers.js. El repositorio ocupa 0,2 GB y, en la fecha de consulta, acumula 0 descargas y 0 likes, lo que indica que es un artefacto reciente y practicamente sin adopcion publica.

La relevancia del modelo radica en su enfoque de inferencia en el cliente: al no requerir backend, permite clasificar resenas sin enviar el texto del usuario a un servidor, lo que encaja con casos de privacidad y con extensiones de navegador. Como contrapartida, la informacion publicada es muy escasa: no se declaran licencia, idiomas, numero de parametros ni resultados de evaluacion, mas alla de una referencia a los archivos internos metrics.json y export_report.json que no forman parte de la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador tipo BERT (etiqueta "bert"), exportado a ONNX para Transformers.js |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible (el autor no la especifica) |
| Tipos de cuantizacion | INT8, en el archivo onnx/model_quantized.onnx |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (variante cuantizada INT8); libreria de ejecucion Transformers.js |
| Pipeline | text-classification |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-10-07 |
| Ultima actualizacion | 2026-10-07 |

## Arquitectura y entrenamiento

La unica informacion arquitectonica disponible es la etiqueta "bert" y el hecho de que el modelo se distribuye como grafo ONNX cuantizado a INT8 para su ejecucion con Transformers.js. Esto sitúa al modelo en la familia de codificadores transformer bidireccionales orientados a clasificacion, no en la categoria de modelos generativos, por lo que no dispone de decodificador ni de generacion autoregresiva. El tamano del repositorio (0,2 GB) es compatible con un codificador de tipo BERT de tamano base o inferior junto con su version cuantizada, pero el autor no publica el recuento exacto de parametros ni la configuracion de capas.

No hay informacion sobre el corpus de entrenamiento, el numero de tokens utilizados, la composicion del dataset, el idioma de los datos ni sobre si se aplicaron tecnicas de ajuste como RLHF, DPO o fine-tuning supervisado sobre un checkpoint preentrenado concreto. La model card menciona los archivos metrics.json y export_report.json como fuente de resultados de evaluacion, pero su contenido no esta incluido en la informacion proporcionada, por lo que no es posible verificar el procedimiento de entrenamiento ni las metricas obtenidas.

## Capacidades

- Clasificacion de texto orientada a la deteccion de resenas de producto generadas por IA, segun la descripcion del proyecto TrustLens.
- Analisis y resumen de opinion por aspectos ("summarise genuine opinion by aspect"), segun la propia model card; se desconoce si esta funcionalidad la implementa el propio clasificador o el sistema que lo envuelve.
- Inferencia en el navegador mediante Transformers.js, sin necesidad de servidor ni GPU dedicada.
- Ejecucion con pesos cuantizados INT8, lo que reduce el consumo de memoria y el tiempo de carga respecto a los pesos en coma flotante.
- Integracion con el ecosistema ONNX, lo que permite reutilizar el grafo en otros entornos de ejecucion compatibles.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento. Al ser un clasificador y no un modelo generativo, estas capacidades no aplican.
- No se ha documentado el conjunto de idiomas soportados.

## Casos de uso

- Moderacion de resenas en marketplaces: clasificar automaticamente las opiniones enviadas por usuarios y marcar aquellas con alta probabilidad de haber sido generadas por IA, reduciendo la carga de revision manual en catalogos con miles de resenas diarias.
- Deteccion de fraude en plataformas de opinion: identificar campanas de resenas sinteticas dirigidas a inflar o hundir la valoracion de un producto, integrAndo el clasificador como filtro previo a la revision por parte del equipo de confianza y seguridad.
- Extension de navegador con inferencia local: gracias a la distribucion en Transformers.js y ONNX INT8, el modelo puede ejecutarse en el propio navegador del usuario, de modo que el texto de la resena no sale del dispositivo, lo que resulta adecuado para herramientas orientadas a la privacidad.
- Curacion de datos de entrenamiento: filtrar corpus de resenas recopilados de la web para separar texto humano de texto sintetico antes de utilizarlos en el entrenamiento de modelos de recomendacion o de analisis de sentimiento.
- Analisis de opinion por aspectos: complementar la clasificacion con la extraccion de opiniones genuinas agrupadas por caracteristica del producto (envio, calidad, precio), util para paneles de analitica de marca.
- Audicion de agencias y marketing: verificar de forma masiva si el material de resenas entregado por un proveedor externo presenta indicios de generacion automatica antes de publicarlo.
- Investigacion academica: estudiar la prevalencia de resenas generadas por IA en un dominio concreto y comparar la distribucion entre plataformas o categorias de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los archivos metrics.json y export_report.json del repositorio, pero su contenido no se ha facilitado, por lo que no se dispone de cifras de exactitud, F1, precision, recall ni de comparaciones con otros detectores.

## Requisitos de hardware

- Al tratarse de un modelo ONNX cuantizado a INT8 y de un repositorio de 0,2 GB, la inferencia esta pensada para ejecutarse en CPU, sin GPU dedicada.
- Entorno principal de despliegue: Transformers.js en navegador, mediante WebAssembly y, si esta disponible, aceleracion por WebGPU.
- Alternativas de despliegue: ONNX Runtime en servidor o en el escritorio, y cualquier runtime compatible con grafos ONNX. Herramientas orientadas a modelos generativos como vLLM o TGI no son aplicables a este artefacto.
- VRAM estimada: no disponible. Al ser un modelo cuantizado a INT8 y ejecutable en CPU, el requisito de memoria dedicada es en principio nulo, aunque no se publican cifras de consumo.
- Encaje en GPU de consumo: no aplica como requisito; el modelo esta disenado para ejecutarse sin GPU.
- Latencia y throughput: no disponibles. Dependeran del dispositivo, del runtime (WASM frente a WebGPU) y del hardware del cliente.

## Comparativa con modelos similares

No se dispone de datos verificados en la informacion proporcionada para establecer una comparativa cuantitativa. Existen alternativas conocidas en la categoria de deteccion de texto generado por IA, como el detector basado en RoBERTa publicado por OpenAI, chatgpt-detector-roberta de Hello-SimpleAI o los detectores de la familia desklib, pero no se han aportado sus especificaciones ni sus resultados en esta busqueda, por lo que cualquier comparacion numerica seria una invencion.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| Mahendra99ar/trustlens-detector | no disponible | no disponible | no disponible | HuggingFace, transformers.js / ONNX INT8 | 0 descargas, 0 likes |
| Detector basado en RoBERTa de OpenAI | no disponible | no disponible | no disponible | no verificada en esta busqueda | no disponible |
| Hello-SimpleAI/chatgpt-detector-roberta | no disponible | no disponible | no disponible | no verificada en esta busqueda | no disponible |
| Detectores de la familia desklib | no disponible | no disponible | no disponible | no verificada en esta busqueda | no disponible |

## Limitaciones y advertencias

- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido. En ausencia de licencia explicita, debe asumirse que no se concede ningun permiso de uso.
- No se especifican los idiomas soportados ni el idioma de los datos de entrenamiento, por lo que el comportamiento con texto en castellano es desconocido.
- No se publican metricas de evaluacion en la informacion disponible; la unica referencia son los archivos metrics.json y export_report.json, cuyo contenido no se ha podido consultar.
- Los detectores de texto generado por IA presentan tasas de falsos positivos reseñables, especialmente con textos humanos muy formularios, traducidos o escritos por personas no nativas. Un uso sancionador sin revision humana es desaconsejable.
- El modelo puede degradarse frente a texto parafraseado, reescrito o generado con instrucciones que imiten el estilo humano, asi como frente a textos cortos.
- El repositorio no tiene descargas ni validacion por parte de la comunidad, por lo que no existe evidencia externa de calidad ni de reproducibilidad.
- Al ser un clasificador, no genera texto, no ejecuta herramientas y no mantiene conversaciones multi-turno; cualquier descripcion que le atribuya estas capacidades seria incorrecta.
- Los resultados de busqueda web obtenidos corresponden a otros productos con nombres similares (TruthLens, TrustLens Deepfake Detector), no relacionados con este modelo, por lo que no deben utilizarse como fuente de especificaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mahendra99ar/trustlens-detector
- Archivos referenciados en la model card, no disponibles en la informacion proporcionada: metrics.json y export_report.json dentro del repositorio del modelo.
- Resultados de busqueda web no relacionados con este modelo concreto (se listan solo para descartar confusion de nombres):
  - https://cybersecuritynews.com/llmjacking-attack/
  - https://truthlens.insightfactory.io/
  - https://aiagentsdirectory.com/news/ai-agents-news-brief-september-6-2026
  - https://github.com/snehasis297/Trustlens-deepfake-detector
  - https://truthlensdetect.com/
