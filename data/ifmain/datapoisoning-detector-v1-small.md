# ifmain/datapoisoning-detector-v1-small

## Resumen

DataPoisoning Detector v1 Small es un clasificador de imagenes binario desarrollado por el usuario ifmain, disenado para detectar imagenes que han sido protegidas deliberadamente contra el entrenamiento de modelos generativos mediante tecnicas de envenenamiento de datos (data poisoning) como Nightshade, Glaze, Mist y MetaCloak. El modelo no genera imagenes ni texto: su unica funcion es emitir un logit de clasificacion que indica si una imagen contiene una perturbacion de proteccion o si es limpia.

Tecnicamente es un modelo de vision de 82.635.137 parametros totales (48.209.281 entrenables) construido sobre el codificador VAE congelado de black-forest-labs/FLUX.2-klein-base-4B. La arquitectura fusiona representaciones intermedias del VAE (bloques 1, 2 y 3) con la representacion final de la media posterior, proyecta cada flujo a una rejilla de 8x8 tokens y clasifica mediante un transformer. El decodificador VAE y el transformer generativo de FLUX no se utilizan en inferencia.

Su relevancia actual radica en que los pipelines de recoleccion de datos para entrenamiento de modelos generativos son vulnerables a imagenes envenenadas, y este detector ofrece una recall declarada del 100% sobre Nightshade y Mist y del 95,45% sobre Glaze en el conjunto de prueba del propio autor, con una especificidad sobre imagenes limpias del 99,03%. La licencia es Apache 2.0, aunque el acceso al repositorio esta condicionado a la aceptacion de un aviso de uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fusion de caracteristicas multinivel de un VAE congelado (bloques 1, 2, 3 y media posterior final) proyectadas a rejilla de 8x8 tokens, combinadas con las diferencias temprano-final y clasificadas mediante un transformer |
| Parametros totales | 82.635.137 (variante Small) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de clasificacion de imagenes; entrada de 128x128 RGB con region activa central de 96x96) |
| Tipos de cuantizacion | No disponible (el repositorio distribuye pesos en safetensors; no se documentan variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | No disponible (modelo de vision; no procesa lenguaje) |
| Licencia | Apache 2.0, con aviso de acceso condicionado (extra_gated_prompt) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El detector compara el resultado de los bloques de codificador 1, 2 y 3 con la representacion final de la media posterior de un VAE FLUX.2 congelado. Cada flujo se proyecta a una rejilla de 8x8 tokens y las tres diferencias entre representaciones tempranas y finales se fusionan con los cuatro flujos de caracteristicas antes de la clasificacion por transformer. La entrada son recortes RGB de 128x128 a resolucion nativa con una region activa central de 96x96. El decodificador del VAE y el transformer generativo de FLUX no se emplean en ningun momento.

El entrenamiento excluye CelebA-HQ de los conjuntos de entrenamiento, validacion, prueba y cache de parches, y emplea 21.464 registros de entrenamiento, 1.257 de validacion y 1.446 de prueba. La variante Small se entrena como estudiante de la variante Large recien entrenada mediante destilacion de objetivos suaves con divergencia KL de Bernoulli a temperatura 2: un 50% de destilacion y un 50% de clasificacion supervisada mas ranking por pares. La seleccion de checkpoint se realiza maximizando la recall de validacion a una tasa de falsos positivos objetivo del 1%, usando ROC-AUC como criterio de desempate, y se aplican dos epocas adicionales de recuperacion si se detecta una caida sostenida de rendimiento. No se utiliza ningun checkpoint de detector previo.

## Capacidades

- Clasificacion binaria de imagenes: distingue imagenes con perturbacion de proteccion frente a imagenes limpias.
- Deteccion de envenenamiento de datos especifico de cuatro tecnicas: Nightshade, Glaze, Mist y MetaCloak.
- Inferencia a nivel de imagen agregando los logits de cinco recortes (crop logits) por imagen.
- Funcionamiento sobre recortes RGB de 128x128 a resolucion nativa con region activa central de 96x96.
- Extraccion de caracteristicas internas del VAE de FLUX.2 sin necesidad de ejecutar el decodificador ni el transformer generativo.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision generalista, tool calling, function calling, capacidades de agente, razonamiento multi-paso ni modo de pensamiento.

## Casos de uso

- Filtrado de datasets de entrenamiento generativo: antes de entrenar o hacer fine-tuning de un modelo de difusion, se pasa cada imagen por el detector y se descartan las que superen el umbral, evitando que perturbaciones tipo Nightshade degraden el modelo resultante.
- Auditoria de datasets ya existentes: revisar grandes repositorios de imagenes scrapeadas para estimar que proporcion contiene protecciones anti-IA y decidir si es necesario reentrenar o limpiar el corpus.
- Verificacion de cumplimiento de derechos de autor: comprobar si una imagen concreta incorpora una marca de proteccion antes de reutilizarla en un producto comercial o de redistribuirla.
- Preprocesado en pipelines de MLOps: integrar el clasificador como etapa de validacion previa a la ingesta en un almacen de datos, con umbral ajustado segun la tasa de falsos positivos tolerada.
- Investigacion en robustez y seguridad de modelos: generar estudios comparativos sobre la eficacia real de Glaze, Nightshade, Mist y MetaCloak frente a detectores automaticos.
- Moderacion en plataformas de arte digital: detectar automaticamente imagenes que artistas han protegido y aplicar las politicas de la plataforma antes de que entren en procesos de reentrenamiento.
- Control de calidad en servicios de generacion de imagenes: bloquear la entrada de imagenes potencialmente envenenadas para evitar fallos de generacion atribuibles a perturbaciones.
- Analisis forense de incidentes: cuando un modelo generativo produce salidas degradadas, usar el detector para localizar que imagenes del dataset original contenian protecciones.

## Benchmarks y rendimiento

Recall de deteccion de la variante Small sobre el conjunto de prueba del autor (porcentaje de imagenes protegidas correctamente detectadas; mayor es mejor):

| Proteccion | Large | Medium | Small | Tiny |
|---|---:|---:|---:|---:|
| Nightshade | 97,92% (47/48) | 95,83% (46/48) | 100,00% (48/48) | 95,83% (46/48) |
| Glaze | 95,45% (63/66) | 93,94% (62/66) | 95,45% (63/66) | 95,45% (63/66) |
| Mist | 100,00% (22/22) | 100,00% (22/22) | 100,00% (22/22) | 100,00% (22/22) |
| MetaCloak | 100,00% (4/4) | 100,00% (4/4) | 100,00% (4/4) | 100,00% (4/4) |

Especificidad sobre imagenes limpias (porcentaje de imagenes limpias aceptadas correctamente; mayor es mejor), usando el umbral seleccionado en validacion de cada variante sobre el mismo pool de control:

| Pool de evaluacion | Large | Medium | Small | Tiny |
|---|---:|---:|---:|---:|
| Controles limpios compartidos | 99,1129% (1229/1240) | 99,2742% (1231/1240) | 99,0323% (1228/1240) | 99,1129% (1229/1240) |

Calidad de destilacion de la variante Small respecto al profesor Large (todas las variantes usan el Large recien entrenado como profesor; la concordancia de decision mide coincidencia, no correccion):

| Metrica | Small |
|---|---:|
| Accuracy | 98,8935% |
| Recall | 98,0583% |
| Precision | 94,3925% |
| Tasa de falsos positivos | 0,9677% |
| ROC-AUC | 0,999010 |
| Concordancia de decision con el profesor | 99,5851% |
| MAE de logit de imagen (menor es mejor) | 0,638014 |
| Cambio de recall frente al profesor | +0,485437 pp |

Comparativa publicada frente a LightShed (recall de deteccion, mayor es mejor):

| Proteccion | Recall propio (Small) | Recall LightShed (Tabla 2) |
|---|---:|---:|
| Nightshade (comparador binario) | 100,00% (48/48) | 96,55% |
| Glaze | 95,45% (63/66) | 97,26% |
| Mist | 100,00% (22/22) | 99,84% |
| MetaCloak | 100,00% (4/4) | 91,77% |

Comparativa publicada frente a LightShed (especificidad sobre imagenes limpias, mayor es mejor):

| Condicion | Especificidad propia (Small) | Especificidad LightShed (Tabla 2) |
|---|---:|---:|
| Nightshade (comparador binario) | 99,03% | 92,86% |
| Glaze | 99,03% | 97,70% |
| Mist | 99,03% | 100,00% |
| MetaCloak | 99,03% | 84,32% |

No se han publicado en la informacion disponible resultados de benchmarks generalistas tipo MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- Parametros totales: 82,6 millones, por lo que el peso en FP32 es de aproximadamente 330 MB, en FP16/bf16 de unos 165 MB y en INT8 de unos 83 MB. Estas cifras son estimaciones derivadas del recuento de parametros, no medidas publicadas.
- El bundle del repositorio ocupa 0,3 GB, incluyendo pesos e imagenes de arquitectura.
- La inferencia requiere ademas el codificador VAE congelado de FLUX.2-klein-base-4B, cuyos pesos no estan incluidos en este repositorio y cuyo tamano no se detalla en la informacion disponible.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4070, RTX 4090 e incluso GPUs integradas con suficiente memoria.
- Para lotes grandes o inferencia sobre datasets completos, se recomienda una GPU con al menos 8-12 GB de VRAM para mantener el VAE y el clasificador en memoria con batch elevado; no se dispone de cifras medidas.
- Opciones de despliegue: al ser un modelo de clasificacion de imagenes en safetensors con pipeline `image-classification`, es desplegable mediante las librerias de HuggingFace, con exportacion a ONNX Runtime o TensorRT, y con integracion en servidores de inferencia genericos. No se documenta soporte especifico en vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros entrenables | Recall Glaze | Especificidad (control limpio) | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| DataPoisoning Detector v1 Small | 82.635.137 | 48.209.281 | 95,45% | 99,03% | Apache 2.0 | HuggingFace, acceso condicionado |
| DataPoisoning Detector v1 Medium | 182.722.433 | 148.296.577 | 93,94% | 99,27% | Apache 2.0 | HuggingFace |
| DataPoisoning Detector v1 Large | 296.264.065 | 261.838.209 | 95,45% | 99,11% | Apache 2.0 | HuggingFace |
| DataPoisoning Detector v1 Tiny | 43.280.257 | 8.854.401 | 95,45% | 99,11% | Apache 2.0 | HuggingFace |
| LightShed | No disponible | No disponible | 97,26% | 97,70% | No disponible | Referencia publicada (Tabla 2) |

En la comparativa publicada por el autor, la variante Small supera a LightShed en recall sobre Nightshade (100,00% frente a 96,55%), Mist (100,00% frente a 99,84%) y MetaCloak (100,00% frente a 91,77%), y en especificidad sobre Nightshade (99,03% frente a 92,86%), Glaze (99,03% frente a 97,70%) y MetaCloak (99,03% frente a 84,32%), mientras que LightShed obtiene mejor recall en Glaze (97,26% frente a 95,45%) y mejor especificidad en Mist (100,00% frente a 99,03%). No se dispone de informacion sobre los parametros ni la licencia de LightShed.

## Limitaciones y advertencias

- Las puntuaciones no son probabilidades calibradas; cualquier despliegue en produccion exige una calibracion previa del umbral sobre datos propios.
- El conjunto de prueba revisado es un subconjunto filtrado de un experimento anterior, no un holdout ciego y fresco; el propio autor advierte que estos resultados no deben presentarse como las mediciones del experimento antiguo.
- El rendimiento sobre Glaze se reporta por separado porque ese subconjunto habia expuesto previamente un fallo; la recall sobre Glaze es la mas baja de las cuatro tecnicas (95,45%).
- El numero de muestras de MetaCloak es muy reducido (4 imagenes), por lo que el 100% de recall reportado carece de significacion estadistica.
- La variante Large se evalua tambien sobre su propio conjunto y la concordancia de decision mide coincidencia con el profesor, no correccion objetiva.
- El entrenamiento excluye CelebA-HQ, lo que puede introducir sesgos de dominio y afectar a la generalizacion sobre imagenes con caracteristicas propias de ese corpus.
- No se documentan sesgos demograficos concretos ni resultados desagregados por subgrupos; al ser un clasificador de manipulaciones, el riesgo de sesgo depende del dataset DiffVaxDataset y de los parches usados en el entrenamiento.
- Riesgo de falsos positivos sobre imagenes limpias que contengan ruido, compresion agresiva o artefactos visuales similares a las perturbaciones de proteccion.
- El acceso al repositorio esta condicionado a la aceptacion de un aviso que exige procesar unicamente datos propios o debidamente licenciados, y respetar copyright, privacidad, consentimiento y obligaciones contractuales. La licencia Apache 2.0 es permisiva para uso comercial, pero el gating anade una condicion de acceso.
- No se especifican idiomas soportados ni capacidades de lenguaje porque el modelo no procesa texto.
- No se documentan cuantizaciones, latencias, throughput ni resultados sobre dominios fuera de los cuatro ataques evaluados; un uso real con otras tecnicas de envenenamiento no esta validado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ifmain/datapoisoning-detector-v1-small
- Codigo y entrenamiento: https://github.com/ifmain/datapoisoning-detector-v1
- Informes de evaluacion (three_tap_run): https://github.com/ifmain/datapoisoning-detector-v1/tree/main/reports/three_tap_run
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/ozdentarikcan/DiffVaxDataset
- Diagrama de arquitectura (SVG): https://huggingface.co/ifmain/datapoisoning-detector-v1-small/blob/main/assets/architecture.svg
- Diagrama de inferencia y destilacion (SVG): https://huggingface.co/ifmain/datapoisoning-detector-v1-small/blob/main/assets/inference-distillation.svg
- Comparativa publicada con LightShed: https://huggingface.co/ifmain/datapoisoning-detector-v1-small/blob/main/assets/published-comparison.png
