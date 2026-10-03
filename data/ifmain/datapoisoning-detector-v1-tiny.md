# ifmain/datapoisoning-detector-v1-tiny

## Resumen

DataPoisoning Detector v1 Tiny es un clasificador de imagenes binario disenado para detectar imagenes que han sido protegidas con tecnicas de envenenamiento y proteccion de datos (Nightshade, Glaze, Mist y MetaCloak). Lo desarrolla el usuario ifmain y se publica bajo licencia Apache 2.0. El modelo no genera imagenes ni texto: su unica tarea es decidir si una imagen limpia ha sido manipulada con una de esas tecnicas de proteccion adversarial, algo relevante para pipelines de scraping y de entrenamiento de modelos generativos que necesitan filtrar datos potencialmente comprometidos.

La arquitectura no emplea el transformer generativo de FLUX.2, sino unicamente su VAE congelado. El detector compara los bloques de codificador 1, 2 y 3 con la representacion final posterior-mean del VAE, proyecta cada flujo a una rejilla de 8 x 8 tokens y fusiona esas diferencias antes de una fase de clasificacion con transformer. La variante Tiny tiene 43.280.257 parametros totales, de los cuales 8.854.401 son entrenables, y trabaja sobre recortes RGB de 128 x 128 pixeles con una region activa central de 96 x 96.

El modelo forma parte de una familia de cuatro variantes (Large, Medium, Small y Tiny) entrenadas mediante destilacion de conocimiento desde la variante Large. Su interes practico esta en que ofrece prestaciones de deteccion muy cercanas al modelo grande con una huella de parametros 7 veces menor, lo que lo hace desplegable en hardware modesto para tareas de auditoria de datasets y moderacion de contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fusion de caracteristicas de un VAE FLUX.2 congelado (cuatro flujos) + clasificador transformer |
| Parametros totales | 43.280.257 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificacion de imagen; entrada de 128 x 128 px con region activa central de 96 x 96) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (tarea de vision, no linguistica) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El detector reutiliza el codificador VAE de FLUX.2 (base_model black-forest-labs/FLUX.2-klein-base-4B) de forma congelada. Concretamente, toma las salidas de los bloques de codificador 1, 2 y 3 y las compara con la representacion final posterior-mean del VAE. Cada uno de esos flujos se proyecta a una rejilla de 8 x 8 tokens, y las tres diferencias early-to-final se fusionan junto con los cuatro flujos de caracteristicas antes de pasar a un clasificador de tipo transformer. Ni el decodificador del VAE ni el transformer generativo de FLUX se utilizan en la inferencia. La entrada son recortes RGB a resolucion nativa de 128 x 128 pixeles con una region activa central de 96 x 96.

El entrenamiento de esta variante se realizo mediante destilacion desde el modelo Large recien entrenado (no se reutiliza ningun checkpoint de detector previo). Los estudiantes aprenden del profesor mediante destilacion de objetivos suaves con divergencia KL de Bernoulli a temperatura 2, combinando un 50 por ciento de destilacion con un 50 por ciento de clasificacion supervisada mas ranking por pares. La seleccion de checkpoint se hace maximizando el recall de validacion a una tasa de falsos positivos objetivo del 1 por ciento, usando ROC-AUC como criterio de desempate. El conjunto de entrenamiento excluye CelebA-HQ y consta de 21.464 registros de entrenamiento, 1.257 de validacion y 1.446 de test. Las imagenes de entrada se procesan mediante media de cinco logits de recorte a nivel de imagen.

## Capacidades

- Clasificacion binaria de imagenes: distingue imagenes protegidas con tecnicas de envenenamiento de imagenes limpias de control.
- Deteccion especifica de Nightshade, Glaze, Mist y MetaCloak como tecnicas de proteccion adversarial.
- Extraccion de caracteristicas a nivel de imagen a partir del VAE congelado de FLUX.2, sin necesidad del transformer generativo.
- Inferencia a nivel de imagen promediando cinco logits de recorte, lo que aporta robustez frente a variaciones locales.
- No soporta generacion de texto, codigo, matematicas, vision general ni tool calling; su salida es una puntuacion de clasificacion.
- No dispone de modo de razonamiento (thinking mode), capacidades de audio ni agentes multi-paso.
- Las puntuaciones devueltas no estan calibradas como probabilidades.

## Casos de uso

- Filtrado previo al entrenamiento de modelos generativos: antes de incorporar un gran volumen de imagenes rascadas de internet a un dataset de entrenamiento, el detector marca las imagenes protegidas con Glaze o Nightshade para excluirlas y evitar que las tecnicas de envenenamiento degraden el modelo resultante.
- Auditoria y limpieza de datasets ya existentes: dado un dataset historico, se puede pasar imagen a imagen para cuantificar que porcentaje contiene protecciones y decidir si es necesario reentrenar o depurar.
- Cumplimiento de derechos de autor y condiciones de uso: permite verificar si un corpus respeta imagenes marcadas como protegidas por sus autores con estas tecnicas antes de su uso comercial.
- Investigacion en seguridad de modelos (adversarial ML): sirve como linea base reproducible para estudiar la eficacia de metodos de proteccion frente a detectores, con puntos de operacion fijados en validacion.
- Deteccion de MetaCloak: aunque el conjunto de evaluacion es reducido (4 imagenes), el modelo alcanza un 100 por ciento de recall en esa tecnica, util para casos donde el riesgo de MetaCloak es prioritario.
- Moderacion de contenido en plataformas: integrado como paso previo a la publicacion o al reenvio de imagenes en sistemas que deben respetar marcas de proteccion de los creadores.
- Analisis forense y respuesta a incidentes: cuando se sospecha que un modelo propio ha sido envenenado, permite rastrear retroactivamente que imagenes del corpus portaban protecciones.
- Despliegue en entornos con recursos limitados: gracias a sus 43 millones de parametros y 0,2 GB de repositorio, puede ejecutarse en una GPU de consumo o incluso en CPU para tareas de auditoria por lotes.

## Benchmarks y rendimiento

Recall de deteccion por tecnica de proteccion (mayor es mejor). Se muestran las cuatro variantes de la familia para contexto:

| Proteccion | Large | Medium | Small | Tiny |
|---|---:|---:|---:|---:|
| Nightshade | 97,92 % (47/48) | 95,83 % (46/48) | **100,00 % (48/48)** | 95,83 % (46/48) |
| Glaze | **95,45 % (63/66)** | 93,94 % (62/66) | **95,45 % (63/66)** | **95,45 % (63/66)** |
| Mist | **100,00 % (22/22)** | **100,00 % (22/22)** | **100,00 % (22/22)** | **100,00 % (22/22)** |
| MetaCloak | **100,00 % (4/4)** | **100,00 % (4/4)** | **100,00 % (4/4)** | **100,00 % (4/4)** |

Especificidad sobre imagenes limpias (mayor es mejor), cada modelo con su propio umbral seleccionado en validacion:

| Pool de evaluacion | Large | Medium | Small | Tiny |
|---|---:|---:|---:|---:|
| Controles limpios compartidos | 99,1129 % (1229/1240) | **99,2742 % (1231/1240)** | 99,0323 % (1228/1240) | 99,1129 % (1229/1240) |

Calidad de destilacion de la variante Tiny frente al profesor Large:

| Metrica | Valor (Tiny) |
|---|---:|
| Accuracy | 98,8243 % |
| Recall | 97,0874 % |
| Precision | 94,7867 % |
| Tasa de falsos positivos | 0,8871 % |
| ROC-AUC | 0,996336 |
| Acuerdo de decision con el profesor | 99,5159 % |
| MAE de logits a nivel de imagen (menor es mejor) | 0,683860 |
| Cambio de recall frente al profesor (pp) | -0,485437 |

Comparativa publicada frente a LightShed (Tiny de este trabajo):

| Proteccion | Recall nuestro (detectadas/positivas) | Recall LightShed (Tabla 2) |
|---|---:|---:|
| Nightshade (comparador binario) | 95,83 % (46/48) | **96,55 %** |
| Glaze | 95,45 % (63/66) | **97,26 %** |
| Mist | **100,00 % (22/22)** | 99,84 % |
| MetaCloak | **100,00 % (4/4)** | 91,77 % |

| Condicion de comparacion | Especificidad nuestra | Especificidad LightShed (Tabla 2) |
|---|---:|---:|
| Nightshade (comparador binario) | **99,11 %** | 92,86 % |
| Glaze | **99,11 %** | 97,70 % |
| Mist | 99,11 % | **100,00 %** |
| MetaCloak | **99,11 %** | 84,32 % |

Nota del autor: LightShed reporta puntos de operacion especificos por metodo; este modelo usa un umbral fijo seleccionado en validacion. La condicion NightShade LPIPS 0,07 de LightShed reporta aparte un 99,98 % de recall y un 100 % de especificidad.

## Requisitos de hardware

- Parametros: 43,2 millones en total (8,85 millones entrenables); el repositorio ocupa 0,2 GB.
- VRAM estimada para el detector: aproximadamente 0,17 GB en fp32 (43,2 M x 4 bytes) o 0,09 GB en fp16, a lo que se suma el coste de cargar en memoria el codificador VAE congelado de FLUX.2.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; no requiere A100 ni H100. Una RTX 3060, RTX 4060 o superior es mas que suficiente.
- Cabe en GPU de consumo: si, con amplio margen, incluidas GPUs de gama de entrada y modelos con poca VRAM.
- Ejecucion en CPU: viable para procesos por lotes, dado el reducido numero de parametros y el tamano de entrada de 128 x 128.
- Opciones de despliegue: PyTorch/Transformers (pipeline image-classification) y exportacion a ONNX o formatos equivalentes. vLLM, llama.cpp, Ollama y TGI no aplican porque son runtimes de modelos de lenguaje y este es un clasificador de vision.
- Latencia y throughput: no disponibles en la informacion proporcionada. La inferencia procesa cinco recortes por imagen y los promedia, por lo que el coste por imagen es cinco veces el de un unico recorte de 128 x 128.

## Comparativa con modelos similares

No se han publicado especificaciones tecnicas detalladas de alternativas directas en la informacion disponible. La unica comparacion publicada es frente a LightShed y frente a las demas variantes de la propia familia.

| Modelo | Parametros totales | Parametros entrenables | Licencia | Recall Glaze | Especificidad limpia |
|---|---:|---:|---|---:|---:|
| DataPoisoning Detector v1 Tiny | 43.280.257 | 8.854.401 | apache-2.0 | 95,45 % | 99,11 % |
| DataPoisoning Detector v1 Small | 82.635.137 | 48.209.281 | apache-2.0 | 95,45 % | 99,03 % |
| DataPoisoning Detector v1 Medium | 182.722.433 | 148.296.577 | apache-2.0 | 93,94 % | 99,27 % |
| DataPoisoning Detector v1 Large | 296.264.065 | 261.838.209 | apache-2.0 | 95,45 % | 99,11 % |
| LightShed | No disponible | No disponible | No disponible | 97,26 % (Tabla 2) | 97,70 % (Tabla 2) |

En la misma tarea, LightShed obtiene mayor recall en Glaze y Nightshade, mientras que el detector Tiny de este trabajo presenta mejor especificidad sobre controles limpios y mejor recall en MetaCloak.

## Limitaciones y advertencias

- La inferencia de imagen promedia cinco logits de recorte y las puntuaciones resultantes no son probabilidades calibradas; no deben interpretarse como tal sin recalibracion.
- El conjunto de test revisado es un subconjunto filtrado de un experimento anterior, no un conjunto ciego nuevo; los resultados no deben presentarse como mediciones del experimento original.
- El rendimiento local sobre Glaze se reporta por separado porque ese subconjunto expuso previamente un fallo del modelo, lo que indica fragilidad ante ciertas variantes de esa proteccion.
- El conjunto de evaluacion de MetaCloak es muy reducido (4 imagenes), por lo que su 100 por ciento de recall tiene escasa significacion estadistica.
- El modelo esta limitado a la deteccion de las cuatro tecnicas evaluadas (Nightshade, Glaze, Mist y MetaCloak); no se conoce su comportamiento frente a otras tecnicas de proteccion o envenenamiento.
- El acceso al modelo esta condicionado por un aviso (extra_gated_prompt) que obliga a procesar unicamente datos propios o con licencia, respetando derechos de autor, privacidad, consentimiento y obligaciones contractuales.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones de acceso gated anaden restricciones sobre el tipo de datos procesados.
- No se dispone de informacion sobre sesgos, composicion detallada del dataset de entrenamiento ni comportamiento multilingue (la tarea no es linguistica).
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos; el umbral seleccionado en validacion apunta a una tasa de falsos positivos del 1 por ciento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ifmain/datapoisoning-detector-v1-tiny
- Codigo y entrenamiento: https://github.com/ifmain/datapoisoning-detector-v1
- Informes de evaluacion: https://github.com/ifmain/datapoisoning-detector-v1/tree/main/reports/three_tap_run
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Dataset: https://huggingface.co/datasets/ozdentarikcan/DiffVaxDataset
- Invisible Backdoor Attacks Using Data Poisoning in the Frequency Domain (paper relacionado): https://arxiv.org/pdf/2207.04209
- A comprehensive analysis of explainable AI-driven machine learning IDS (ScienceDirect): https://www.sciencedirect.com/science/article/pii/S2667295226000425
- Defense Against Adversarial Attacks: Foundations, Strategies, and Open Challenges (Preprints): https://www.preprints.org/manuscript/202607.1022
- Vulnerability of Large Language Models to Prompt Injection When Exposed to Data Poisoning (JAMA Network Open): https://jamanetwork.com/journals/jamanetworkopen/fullarticle/2842987
- Version en PMC del articulo anterior: https://pmc.ncbi.nlm.nih.gov/articles/PMC12717619/
