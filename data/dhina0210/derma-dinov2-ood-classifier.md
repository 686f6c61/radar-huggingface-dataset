# dhina0210/derma-dinov2-ood-classifier

## Resumen

DermaDINOv2 es un clasificador dermatológico de imágenes publicado por el usuario dhina0210 en HuggingFace bajo el identificador `dhina0210/derma-dinov2-ood-classifier`. El modelo reutiliza como extractor de características el backbone DINOv2 de Meta en su variante Small (`dinov2_vits14`), con todos sus parámetros congelados, y añade una cabeza de clasificación lineal entrenada para distinguir siete categorías de lesiones cutáneas del dataset DermaMNIST (derivado de HAM10000). Se distribuye exclusivamente en formato ONNX (opset 14) con batching dinámico y está optimizado para ejecución en CPU mediante ONNX Runtime, sin necesidad de GPU.

El elemento diferencial del modelo no es su arquitectura, sino las dos capas de robustez que incorpora: un algoritmo de constancia de color Gray-World aplicado en el preprocesado, que neutraliza los tintes de sensor y las variaciones de tono de piel, y una capa de rechazo por fuera de distribución (OOD) con umbral de confianza del 0,60. Si la probabilidad máxima predicha queda por debajo de ese umbral, la salida se marca como "Low Confidence / Potential Domain Shift - Requires Clinician Review" en lugar de devolver una etiqueta clínica sin más. Es un patrón de diseño pensado para despliegues sanitarios donde un falso negativo es más costoso que una abstención.

El modelo tiene un interés práctico acotado pero claro: sirve como componente de triaje y pre-filtrado en pipelines de teledermatología e investigación, y como ejemplo reproducible de cómo combinar un backbone self-supervised congelado, normalización de dominio y rechazo OOD sin reentrenar el extractor. El repositorio ocupa 0,1 GB, la licencia es MIT y el modelo declara únicamente el idioma inglés. No registra descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer DINOv2 ViT-S/14 (`dinov2_vits14`) con backbone 100% congelado + cabeza MLP (LayerNorm(384) -> Dropout(0,3) -> Linear(384,128) -> GELU -> Linear(128,7)) |
| Parametros totales | no disponible (la model card no declara el recuento; el backbone corresponde a la variante "Small" de DINOv2) |
| Longitud de contexto | no aplica: clasificador de imagen con entrada fija de 224x224 px, parche de 14 px |
| Tipos de cuantizacion | no disponible; se publica un unico artefacto ONNX sin documentar cuantizacion (fp32) |
| Idiomas soportados | en (declarado en los metadatos; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (`model_prod.onnx`, opset 14) con batching dinamico; no se ofrecen safetensors ni GGUF |

Otros datos tecnicos: preprocesado con constancia de color Gray-World, redimensionado a 224x224 y normalizacion ImageNet (media [0,485; 0,456; 0,406], desviacion [0,229; 0,224; 0,225]). Umbral de rechazo OOD fijado en 0,60. Tamano del repositorio: 0,1 GB. Creado el 2026-10-10, actualizado el 2026-10-10.

## Arquitectura y entrenamiento

La arquitectura es un clasificador de dos etapas. La primera es el backbone DINOv2 ViT-S/14 de Meta, un transformer de vision entrenado de forma auto-supervisada sobre un corpus a gran escala de imagenes sin etiquetar; en este modelo sus parametros estan completamente congelados, de modo que no se produce ajuste fino ni olvido catastrofico del extractor. La segunda etapa es una cabeza de clasificacion ligera que proyecta la Embedding de 384 dimensiones del ViT a 128 dimensiones, aplica activacion GELU y produce 7 logits, uno por clase diagnostica. El Dropout de 0,3 en la cabeza es el unico mecanismo de regularizacion documentado.

El entrenamiento se realizo sobre DermaMNIST, el subconjunto dermatologico de MedMNIST derivado de HAM10000. Las siete clases son: `akiec` (queratosis actinica y carcinoma intraepitelial, premaligna), `bcc` (carcinoma basocelular, maligna), `bkl` (lesiones benignas tipo queratosis), `df` (dermatofibroma, benigna y muy minoritaria), `mel` (melanoma, maligna y de alto riesgo), `nv` (nevus melanocitico, benigna y mayoritaria) y `vasc` (lesiones vasculares, benignas). La model card no especifica el numero de tokens de entrenamiento, la composicion exacta de la particion, ni si se aplicaron tecnicas de ajuste por refuerzo o preferencias humanas (RLHF/DPO); tampoco documenta aumentos de datos ni estrategias de balanceo de clases, algo relevante dado el fuerte desbalance entre `nv` y `df`.

La innovacion tecnica destacable es el tratamiento explicito de la invariancia de dominio y de la seguridad. Por un lado, la constancia de color Gray-World reescala cada canal para acercar la media de los tres canales a la media global de la imagen, con recorte a [0,255], lo que reduce el sesgo inducido por el sensor de la camara y por el fototipo del paciente. Por otro, la capa de rechazo OOD actua como puerta de seguridad: por debajo del 60% de confianza, no se emite etiqueta diagnostica. El modelo se exporto a ONNX con opset 14 y batching dinamico para permitir inferencia en CPU.

## Capacidades

- Clasificacion de imagenes dermatologicas en 7 clases diagnosticas (akiec, bcc, bkl, df, mel, nv, vasc) con salida de logits y probabilidades softmax.
- Deteccion de fuera de distribucion: si la confianza maxima es inferior a 0,60, el modelo senala posible cambio de dominio y recomienda revision clinica.
- Invariancia de color: el preprocesado Gray-World reduce la dependencia del tono de piel y del balance de blancos de la camara.
- Inferencia en CPU sin GPU, mediante ONNX Runtime con `CPUExecutionProvider`.
- Batching dinamico: permite agrupar imagenes de distinto tamano de lote en la misma sesion ONNX.
- Extraccion de caracteristicas de 384 dimensiones a traves del backbone (uso implicito, no documentado como API publica).
- Capacidad multilingue: no aplica, es un modelo exclusivamente de vision.
- Tool calling, function calling, agentes, razonamiento multi-paso, vision generativa, audio y modo "thinking": no disponibles; el modelo es un clasificador discriminativo de imagen unica.

## Casos de uso

- Triaje previo en teledermatologia: el clasificador puede ordenar una cola de imagenes recibidas por una plataforma de telemedicina y priorizar aquellas con alta probabilidad de `mel` o `bcc`, de forma que el dermatologo revise primero los casos potencialmente malignos. La capa OOD evita que imagenes mal capturadas o de otra naturaleza entren en la cola con una etiqueta falsa.
- Filtrado de calidad de imagen en captacion remota: si la confianza maxima queda por debajo de 0,60, el sistema puede pedir al paciente una nueva fotografia con mejor iluminacion en lugar de emitir una prediccion. Es el uso mas directo del umbral documentado.
- Pre-etiquetado de datasets de investigacion: dado que el backbone esta congelado y el artefacto ONNX es pequeno (repositorio de 0,1 GB), el modelo puede ejecutarse sobre lotes masivos en CPU para proponer etiquetas iniciales que despues se revisan manualmente, reduciendo el coste de anotacion.
- Despliegue en entornos sin GPU: hospitales, consultas o dispositivos con restricciones de hardware pueden ejecutar la inferencia en CPU con ONNX Runtime, sin depender de aceleradores ni de servicios en la nube, lo que simplifica el cumplimiento de requisitos de privacidad de datos de salud.
- Deteccion de deriva de dominio en produccion: la senal OOD actua como monitor. Un aumento sostenido de predicciones por debajo del umbral indica un cambio en el protocolo de captura, en el modelo de camara o en la poblacion atendida, y sirve como disparador de reentrenamiento.
- Docencia y evaluacion de modelos: sirve como referencia reproducible sobre DermaMNIST para comparar variantes de backbone, estrategias de normalizacion de color y umbrales de rechazo, ya que toda la tuberia (preprocesado, modelo y umbral) esta documentada en la model card.
- Analisis retrospectivo de cohortes de imagenes: para estudiar la distribucion de categorias en un archivo historico de fotografias dermatologicas, con la advertencia de que cualquier conclusion clinica requiere validacion por especialistas.

## Benchmarks y rendimiento

La model card declara que se han utilizado las metricas `accuracy`, `balanced_accuracy` y `f1`, pero no publica ningun valor numerico. No se han publicado resultados de benchmarks en la informacion disponible, y tampoco se aportan cifras de comparacion con lineas base de MedMNIST, con el backbone DINOv2 sin ajustar ni con modelos dermatologicos de terceros.

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Accuracy | no disponible | DermaMNIST (particion no especificada) |
| Balanced accuracy | no disponible | DermaMNIST (particion no especificada) |
| F1 | no disponible | DermaMNIST (particion no especificada) |
| Umbral OOD (confianza minima) | 0,60 | no aplica (parametro de diseno) |

## Requisitos de hardware

- El modelo esta disenado explicitamente para CPU. La model card usa `CPUExecutionProvider` en el ejemplo de inicio rapido y no menciona ninguna GPU.
- VRAM estimada para inferencia en GPU: el repositorio completo ocupa 0,1 GB, por lo que el artefacto ONNX en fp32 deberia ocupar menos de 100 MB y caber holgadamente en 1 GB de VRAM para lotes pequenos. Cifra orientativa, no declarada por el autor.
- GPU compatibles: cualquier GPU con soporte de ONNX Runtime (por ejemplo, proveedores CUDA o TensorRT), incluidas RTX 3060, RTX 4090, A100 y H100. No se documenta ningun requisito especifico ni configuracion probada.
- Cabe sin problema en GPU de consumo: si, en cualquier GPU moderna con al menos 1-2 GB de memoria libre, e incluso en iGPU si se usa CPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU). No se proporcionan pesos en safetensors, GGUF ni formatos compatibles con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por imagen ni de imagenes por segundo, ni en CPU ni en GPU.
- Memoria del sistema: el backbone ViT-S/14 congelado y la cabeza ligera hacen que el modelo sea apto para entornos con RAM limitada, aunque no se aportan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo ni de alternativas publicadas dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa. La tabla recoge unicamente los atributos verificables de la ficha.

| Modelo | Parametros | Contexto / entrada | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|
| dhina0210/derma-dinov2-ood-classifier | no disponible (backbone DINOv2 ViT-S/14 congelado + cabeza MLP) | imagen 224x224 px | MIT | ONNX | no disponible |
| DINOv2 `dinov2_vits14` (backbone subyacente) | no disponible en esta informacion | imagen (parche 14 px) | licencia de Meta, no MIT | PyTorch | no disponible en esta informacion |
| Otras lineas base de MedMNIST/DermaMNIST | no disponible | imagen | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un dispositivo medico. La propia model card introduce una etiqueta de revision clinica obligatoria ante baja confianza, pero no se documenta validacion regulatoria, marcado CE ni aprobacion FDA. Su uso en diagnostico real no esta respaldado por la informacion disponible.
- Sesgo por desbalance de clases: en DermaMNIST la clase `nv` es mayoritaria y `df` es una minoria muy rara. La model card no describe el balanceo del entrenamiento ni el uso de pesos de clase, por lo que el rendimiento en clases minoritarias (especialmente `df`) es incierto. Las metricas declaradas (`balanced_accuracy`, `f1`) sugieren cierta conciencia del problema, pero se aportan sin valores.
- Riesgo de alucinacion en sentido clasificatorio: el modelo siempre produce una distribucion sobre las 7 clases cuando la confianza supera 0,60, incluidas imagenes ambiguas, mal iluminadas o de otra region anatomica. El umbral mitiga el problema pero no lo elimina, y 0,60 es un valor heurístico no justificado en la model card.
- Riesgo de falso negativo en melanoma: no hay datos de sensibilidad por clase, de curvas ROC ni de matrices de confusion, por lo que no puede evaluarse si el modelo cumple umbrales de sensibilidad aceptables para lesiones malignas.
- Sesgo poblacional: aunque Gray-World reduce la dependencia del tono de piel, es una correccion de color, no una garantia de equidad. No se publica ninguna evaluacion por fototipo (escala Fitzpatrick), edad, sexo ni origen etnico.
- Limitaciones de dominio: entrenado sobre DermaMNIST/HAM10000, un conjunto con condiciones de captura concretas (dermatoscopia y fotografia clinica). No se documenta su comportamiento en imagenes de movil, con pelo, vello, reglas de medicion o artefactos.
- Idioma: el modelo solo declara `en`. Al ser un clasificador de vision no procesa texto, pero tampoco se documenta etiquetado multilingue de salidas.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion, pero la licencia del backbone DINOv2 de Meta es independiente y debe comprobarse antes de un despliegue comercial. La model card no aclara la interaccion entre ambas licencias.
- Reproducibilidad limitada: no se publican datos de entrenamiento, hiperparametros, particiones, semillas ni curvas de aprendizaje. No se puede verificar el rendimiento declarado.
- Adopcion practicamente nula: 0 descargas y 0 "likes" en el momento de la consulta, sin revision por parte de la comunidad.
- Fechas de publicacion anomales en los metadatos (creado y actualizado el 2026-10-10), que conviene verificar antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dhina0210/derma-dinov2-ood-classifier
- Dataset declarado: https://huggingface.co/datasets/medmnist/dermamnist
- Model card original: incluida en la pagina del modelo en HuggingFace (referenciada arriba); no se ha encontrado documentacion adicional del autor
- Repositorio oficial de DINOv2 (backbone subyacente): https://github.com/facebookresearch/dinov2
- Paper de DINOv2: https://arxiv.org/abs/2304.07193
- Documentacion de ONNX Runtime: https://onnxruntime.ai/docs/
- Proyecto MedMNIST (referencia del dataset): https://medmnist.com/
- Nota sobre la busqueda web: las consultas realizadas no devolvieron ningun resultado relacionado con el modelo, el autor, DermaMNIST ni el ambito dermatologico. Los unicos resultados obtenidos fueron paginas de contenido para adultos sin relacion alguna con esta ficha, por lo que se descartan como fuentes. Todos los enlaces tecnicos de esta seccion son referencias generales de las tecnologias citadas, no hallazgos de la busqueda.
