# ifmain/datapoisoning-detector-v1-large

## Resumen

DataPoisoning Detector v1 Large es un clasificador de imagenes desarrollado por el usuario `ifmain`, disenado para detectar imagenes que han sido protegidas con tecnicas adversariales anti-scraping (Nightshade, Glaze, Mist y MetaCloak). El modelo no genera imagenes ni texto: su tarea es emitir un logit por imagen indicando si el contenido ha sido manipulado con veneno de datos o si es limpio. Se apoya en un encoder VAE congelado de FLUX.2 (`black-forest-labs/FLUX.2-klein-base-4B`) como extractor de caracteristicas, y anade un cabezal transformer entrenable especifico para la clasificacion.

La innovacion principal es la comparacion "three-tap": toma los bloques de encoder 1, 2 y 3 del VAE y los contrasta con la representacion final posterior-mean del mismo VAE, proyectando cada flujo a una rejilla de tokens de 8x8. Esas tres diferencias temprano-a-final se fusionan con los cuatro flujos de caracteristicas antes de la clasificacion transformer. El modelo Large cuenta con 296.264.065 parametros totales (261.838.209 entrenables) y forma parte de una familia de cuatro variantes (Large, Medium, Small y Tiny) donde las mas pequenas aprenden del Large mediante destilacion de objetivos suaves.

Su relevancia actual reside en el auge de herramientas de envenenamiento de datos para proteger obras de artistas frente al scraping. El modelo Large reporta un recall del 97,92% en Nightshade, 95,45% en Glaze, 100% en Mist y 100% en MetaCloak, con una especificidad sobre imagenes limpias del 99,11%. La licencia es Apache 2.0, aunque el acceso esta sujeto a un acuerdo de uso en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer clasificador sobre caracteristicas fusionadas de un VAE FLUX.2 congelado (esquema three-tap de cuatro flujos) |
| Parametros totales | 296.264.065 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificacion de imagen; entrada fija de recorte 128x128 RGB con region activa central de 96x96 y rejilla de tokens 8x8) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vision, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El detector emplea un VAE congelado de FLUX.2 como extractor de caracteristicas. Concretamente, compara las salidas de los bloques de encoder 1, 2 y 3 con la representacion final posterior-mean del VAE. Cada uno de esos flujos se proyecta a una rejilla de tokens de 8x8, y las tres diferencias entre representaciones tempranas y finales se fusionan junto a los cuatro flujos originales. Esa representacion fusionada entra en un cabezal transformer que produce la clasificacion final. Tanto el decodificador del VAE como el transformer generativo de FLUX no se utilizan en inferencia. La entrada son recortes RGB a resolucion nativa de 128x128, con una region activa central de 96x96; la inferencia a nivel de imagen promedia los logits de cinco recortes.

El entrenamiento del modelo Large parte de parametros entrenables inicializados desde cero junto con el encoder VAE congelado y licenciado. El run excluye CelebA-HQ de los conjuntos de entrenamiento, validacion, test y cache de parches, y contiene 21.464 registros de entrenamiento, 1.257 de validacion y 1.446 de test. Las variantes mas pequenas (Medium, Small y Tiny) se entrenan por destilacion con objetivos suaves Bernoulli KL a temperatura 2 desde este Large, combinando un 50% de destilacion con un 50% de clasificacion supervisada mas ranking por pares. La seleccion de checkpoint usa el recall de validacion a una tasa de falsos positivos objetivo del 1%, con ROC-AUC como criterio de desempate; si se detecta un declive se anaden dos epocas de recuperacion adicionales, salvo senal sostenida de sobreajuste.

## Capacidades

- Clasificacion binaria de imagenes: distingue imagenes protegidas con perturbaciones adversariales de imagenes limpias.
- Deteccion especifica de las protecciones Nightshade, Glaze, Mist y MetaCloak.
- Extraccion de caracteristicas a partir de un VAE congelado de FLUX.2 mediante fusion de cuatro flujos (three-tap).
- Inferencia a nivel de imagen mediante promedio de logits de cinco recortes.
- Distilacion hacia variantes menores de la familia (Medium, Small, Tiny) con objetivos suaves.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No ofrece capacidades multilingues ni de generacion de texto, codigo, matematicas, vision generativa o audio.
- No dispone de modo "thinking" ni de salida estructurada mas alla del logit de clasificacion.

## Casos de uso

- Moderacion de datasets de entrenamiento: antes de incorporar imagenes a un pipeline de entrenamiento de modelos generativos, el detector filtra aquellas con perturbaciones tipo Nightshade o Glaze que podrian degradar el modelo resultante.
- Auditoria de contenido en plataformas de scraping: un servicio que recopila imagenes puede pasar cada archivo por el detector para descartar muestras envenenadas y evitar contaminar sus datasets.
- Verificacion de integridad en repositorios de arte: plataformas donde los artistas publican obra protegida con Glaze pueden usar el modelo para comprobar que la proteccion sigue presente antes de aceptar la subida.
- Analisis forense de ataques de envenenamiento: investigadores que estudian meta-ataques pueden usar el detector para medir la tasa de deteccion frente a distintas tecnicas (Mist, MetaCloak) y estimar la robustez de sus metodos.
- Control de calidad en pipelines de curacion de datos: un equipo que cursa millones de imagenes puede integrar el clasificador como etapa de filtrado previa al etiquetado, con umbrales ajustados a su tolerancia de falsos positivos.
- Despliegue en la variante Tiny para edge: cuando el detector Large no cabe en el entorno de produccion, las variantes destiladas permiten mantener recall alto con menos parametros entrenables (8,85 M en Tiny) sin cambiar el esquema de entrada.
- Investigacion comparativa en seguridad de datos: el modelo sirve como referencia para comparar frente a otros detectores publicados, como LightShed, bajo metricas estandar de recall y especificidad.

## Benchmarks y rendimiento

Recall de deteccion (porcentaje de imagenes protegidas detectadas correctamente; mayor es mejor):

| Proteccion | Large | Medium | Small | Tiny |
|---|---:|---:|---:|---:|
| Nightshade | 97,92% (47/48) | 95,83% (46/48) | 100,00% (48/48) | 95,83% (46/48) |
| Glaze | 95,45% (63/66) | 93,94% (62/66) | 95,45% (63/66) | 95,45% (63/66) |
| Mist | 100,00% (22/22) | 100,00% (22/22) | 100,00% (22/22) | 100,00% (22/22) |
| MetaCloak | 100,00% (4/4) | 100,00% (4/4) | 100,00% (4/4) | 100,00% (4/4) |

Especificidad sobre imagenes limpias (porcentaje de imagenes limpias aceptadas; mayor es mejor):

| Pool de evaluacion | Large | Medium | Small | Tiny |
|---|---:|---:|---:|---:|
| Controles limpios compartidos | 99,1129% (1229/1240) | 99,2742% (1231/1240) | 99,0323% (1228/1240) | 99,1129% (1229/1240) |

Calidad de destilacion (todos los estudiantes usan el Large three-tap recien entrenado como profesor):

| Metrica | Large | Medium | Small | Tiny |
|---|---:|---:|---:|---:|
| Accuracy | 98,8935% | 98,7552% | 98,8935% | 98,8243% |
| Recall | 97,5728% | 95,6311% | 98,0583% | 97,0874% |
| Precision | 94,8113% | 95,6311% | 94,3925% | 94,7867% |
| Tasa de falsos positivos | 0,8871% | 0,7258% | 0,9677% | 0,8871% |
| ROC-AUC | 0,998555 | 0,997851 | 0,999010 | 0,996336 |
| Acuerdo con el profesor | 100% (self) | 99,4467% | 99,5851% | 99,5159% |
| MAE de logit de imagen (menor es mejor) | 0 (self) | 0,658140 | 0,638014 | 0,683860 |
| Cambio de recall vs. profesor (pp) | 0 (self) | -1,941748 | 0,485437 | -0,485437 |

Comparativa publicada frente a LightShed (recall de deteccion):

| Proteccion | Nuestro recall | LightShed (Tabla 2) |
|---|---:|---:|
| Nightshade (comparador binario) | 97,92% (47/48) | 96,55% |
| Glaze | 95,45% (63/66) | 97,26% |
| Mist | 100,00% (22/22) | 99,84% |
| MetaCloak | 100,00% (4/4) | 91,77% |

Comparativa publicada frente a LightShed (especificidad sobre imagenes limpias):

| Condicion | Nuestra especificidad | LightShed (Tabla 2) |
|---|---:|---:|
| Nightshade (comparador binario) | 99,11% | 92,86% |
| Glaze | 99,11% | 97,70% |
| Mist | 99,11% | 100,00% |
| MetaCloak | 99,11% | 84,32% |

Nota del autor: LightShed reporta puntos de operacion especificos por metodo, mientras que este modelo emplea un umbral fijo seleccionado en validacion. La condicion NightShade LPIPS 0,07 de LightShed reporta por separado 99,98% de recall y 100% de especificidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato oficial del autor. Como referencia aritmetica derivada del numero de parametros (296,26 M), los pesos ocupan aproximadamente 1,18 GB en fp32, 0,59 GB en fp16 y 0,30 GB en int8, sin contar activaciones ni el VAE congelado de FLUX.2, que anade memoria adicional.
- El repositorio completo ocupa 1,2 GB, lo que da una idea del peso del checkpoint.
- GPU recomendadas: no disponible. Por el tamano, cualquier GPU consumer con al menos 4-6 GB de VRAM deberia poder ejecutar la inferencia, aunque el dato no esta confirmado por el autor.
- Cabe en GPU consumer: probablemente si, dado el tamano de parametros, pero no confirmado oficialmente.
- Opciones de despliegue: no disponible (no se documenta soporte para vLLM, llama.cpp, Ollama o TGI; al ser un clasificador de vision, los runtimes habituales de LLM no aplican directamente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Recall Nightshade | Recall Glaze | Especificidad limpia | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| DataPoisoning Detector v1 Large | 296.264.065 | 97,92% (47/48) | 95,45% (63/66) | 99,11% | Apache 2.0 | HuggingFace (acceso con acuerdo) |
| DataPoisoning Detector v1 Medium | 182.722.433 | 95,83% (46/48) | 93,94% (62/66) | 99,2742% | Apache 2.0 | HuggingFace (acceso con acuerdo) |
| DataPoisoning Detector v1 Small | 82.635.137 | 100,00% (48/48) | 95,45% (63/66) | 99,0323% | Apache 2.0 | HuggingFace (acceso con acuerdo) |
| DataPoisoning Detector v1 Tiny | 43.280.257 | 95,83% (46/48) | 95,45% (63/66) | 99,1129% | Apache 2.0 | HuggingFace (acceso con acuerdo) |

Frente a LightShed (detector externo publicado, sin cifra de parametros disponible en la informacion), este modelo ofrece recall superior en Nightshade (97,92% vs 96,55%), Mist (100% vs 99,84%) y MetaCloak (100% vs 91,77%), pero inferior en Glaze (95,45% vs 97,26%). En especificidad sobre imagen limpia el modelo supera a LightShed en Nightshade, Glaze y MetaCloak, y queda por debajo en Mist (99,11% vs 100%). Los datos de parametros y contexto de LightShed no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Los scores no son probabilidades calibradas; el autor lo advierte explicitamente, por lo que no deben interpretarse directamente como confianza.
- El conjunto de test revisado es un subconjunto filtrado de un experimento previo, no un holdout ciego nuevo. Los resultados no deben presentarse como las mediciones del experimento antiguo.
- El rendimiento en Glaze local se reporta por separado porque ese subconjunto expuso previamente un fallo del modelo.
- El modelo excluye CelebA-HQ de entrenamiento, validacion, test y cache de parches; su comportamiento fuera de las distribuciones de entrenamiento no esta caracterizado en la informacion disponible.
- La inferencia promedia cinco recortes por imagen, lo que multiplica el coste de computo por imagen respecto a clasificadores de un solo paso.
- Acceso sujeto a un prompt gated en HuggingFace: el usuario debe aceptar procesar solo datos propios o con licencia, respetando derechos de autor, privacidad, consentimiento y obligaciones contractuales.
- Licencia Apache 2.0, que en principio permite uso comercial, pero el acuerdo adicional de acceso impone condiciones sobre los datos procesados.
- Sin senales de adopcion comunitaria: 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validacion externa independiente ni issues conocidos reportados por terceros.
- No dispone de informacion sobre sesgos especificos, riesgos de alucinacion en sentido generativo (no genera contenido) ni limitaciones de contexto, ya que opera sobre imagenes y no sobre texto.

## Enlaces

- HuggingFace del modelo Large: https://huggingface.co/ifmain/datapoisoning-detector-v1-large
- HuggingFace de la variante Tiny: https://huggingface.co/ifmain/datapoisoning-detector-v1-tiny
- HuggingFace de la variante Small: https://huggingface.co/ifmain/datapoisoning-detector-v1-small
- Repositorio de codigo y entrenamiento en GitHub: https://github.com/ifmain/datapoisoning-detector-v1
- README del repositorio en GitHub: https://github.com/ifmain/datapoisoning-detector-v1/blob/main/README.md
- Informes de evaluacion (three_tap_run): https://github.com/ifmain/datapoisoning-detector-v1/tree/main/reports/three_tap_run
- Modelo base del VAE congelado (FLUX.2-klein-base-4B): https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Dataset empleado (DiffVaxDataset): https://huggingface.co/datasets/ozdentarikcan/DiffVaxDataset
