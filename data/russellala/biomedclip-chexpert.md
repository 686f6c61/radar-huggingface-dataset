# RussellALA/biomedclip-chexpert

## Resumen

BiomedCLIP-CheXpert es un clasificador de radiografías de tórax multi-etiqueta desarrollado por RussellALA como artefacto de investigación para el estudio *"Show Me What You Don't Know: Efficient Sampling from Invariant Sets for Model Validation"* (Rousselot, Wendebourg y Köthe, 2026). El modelo combina el encoder de imagen de BiomedCLIP (ViT-B/16) completamente congelado con una pequeña cabeza MLP residual entrenada sobre el conjunto de datos CheXpert. Su propósito no es servir como herramienta diagnóstica, sino como sujeto de auditoría: el artículo analiza las **fibras** del modelo, es decir, los conjuntos de imágenes que mapea a la misma representación, para revelar invariancias potencialmente problemáticas.

El modelo clasifica cinco hallazgos radiológicos (atelectasia, cardiomegalia, consolidación, edema y derrame pleural) a partir de radiografías frontales de tórax. Con aproximadamente 200 millones de parámetros totales (el encoder congelado aporta la mayoría), se distribuye como un state dict de `safetensors` que requiere cargar el encoder BiomedCLIP desde su propio repositorio. Su relevancia actual radica en que ejemplifica una metodología novedosa de validación de modelos basada en invariancias, más que en su rendimiento diagnóstico bruto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ViT-B/16 de BiomedCLIP congelado + cabeza MLP residual (2 bloques residuales con LayerNorm, SiLU, Dropout) |
| Parametros totales | 200.107.781 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de vision puro) |
| Licencia | CheXpert Research Use Agreement (licencia de investigacion de Stanford) |
| Formato de pesos | safetensors (state dict, no compatible con `AutoModel` de transformers) |

## Arquitectura y entrenamiento

La arquitectura se compone de dos partes claramente diferenciadas. El encoder es la torre de imagen de BiomedCLIP (ViT-B/16, preentrenado en 15 millones de pares imagen-texto biomedicos de PubMed), cuyos parametros permanecen **congelados** durante todo el entrenamiento. Sobre sus embeddings se apila una cabeza MLP residual con dos bloques (LayerNorm → Linear → SiLU → Dropout → Linear, con dimension oculta igual a 4 veces la dimension del embedding), seguida de LayerNorm → SiLU → Dropout → Linear de salida con 5 neuronas (una por hallazgo). El dropout es 0.05.

El entrenamiento se realizo sobre CheXpert v1.0-small, exclusivamente con vistas frontales, a resolucion 384×384. La particion de datos se hizo con `StratifiedGroupKFold` agrupando por `PatientID` para evitar fuga de pacientes entre entrenamiento y validacion; el conjunto `valid.csv` (202 estudios frontales) se reservo como test. Se aplicaron augmentaciones de rotacion de 15 grados y volteo horizontal, y normalizacion por canal con estadisticas de ImageNet. La funcion de perdida fue la **Masked Asymmetric Loss** (Ridnik et al., 2020) con `gamma_neg=3`, enmascarando las etiquetas inciertas (-1) en lugar de imputarlas. El optimizador fue AdamW (lr 1e-3, weight decay 0.02) con programacion coseno y 1600 pasos de warmup, durante 3 epocas con batch size 16, seleccionando el mejor checkpoint por perdida de validacion.

Una particularidad destacable es la sensibilidad a la convencion de normalizacion: el modelo fue entrenado con normalizacion por canal RGB, pero el pipeline de auditoria del paper usa estadisticas colapsadas a escala de grises. La diferencia entre ambas convenciones produce una distancia de probabilidad del 25.17% en los logits, mientras que en los modelos ConvNeXt acompanantes es veinte veces menor. Esto subraya una fragilidad importante del modelo.

## Capacidades

- Clasificacion multi-etiqueta de cinco hallazgos radiologicos en radiografias de torax: atelectasia, cardiomegalia, consolidacion, edema y derrame pleural.
- Salida de cinco logits crudos por imagen, sin capa de softmax aplicada (el usuario debe añadirla si la necesita).
- Preprocesamiento interno del encoder: redimensiona el lado corto a 224, recorte central, conversion a escala de grises repetida a 3 canales y normalizacion CLIP.
- Interpretabilidad mediante el analisis de fibras: permite muestrear imagenes que producen la misma representacion interna, revelando invariancias del modelo.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente discriminativo de vision.
- No es multimodal en la practica: aunque el encoder base es CLIP, este checkpoint solo usa la rama de imagen.

## Casos de uso

- Auditoria de invarianzas en modelos medicos: el caso de uso principal. Permite a investigadores muestrear el conjunto de imagenes que el modelo considera equivalentes, evaluando si esas equivalencias son clinicamente aceptables o si ocultan fallos graves.
- Validacion de modelos ante datos fuera de distribucion: al identificar fibras problematicas, se pueden generar contraejemplos que expongan sesgos de adquisicion o demograficos antes del despliegue.
- Investigacion en explicabilidad de redes neuronales: como sujeto de estudio para metodos que analizan la geometria del espacio de representaciones, como NDTM (Neural Distance Tangent Manifold).
- Reproduccion de experimentos academicos: el checkpoint se publica para que otros equipos repliquen los resultados del paper de auditoria, incluyendo las metricas de fiber loss y vecinos mas cercanos de la Tabla 5.
- Comparacion de arquitecturas en clasificacion de radiografias: junto con los modelos ConvNeXt acompanantes, permite estudiar como distintas arquitecturas difieren en sus invariancias y robustez.
- Desarrollo de tecnicas de regularizacion por invariancia: los fallos identificados pueden motivar nuevas funciones de perdida que penalicen invariancias no deseadas en el espacio de representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la validacion uso AUROC por etiqueta, exact-match, especificidad y distancia de Hamming, pero no proporciona los valores numericos. El paper reporta la fiber loss y la linea base de vecinos mas cercanos en su Tabla 5, metricas de invarianza, no de precision diagnostica. No se pueden comparar numeros con otros modelos sin datos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 200 millones de parametros, en fp16 el modelo ocupa aproximadamente 400 MB solo para los pesos. El encoder BiomedCLIP ViT-B/16 necesita alrededor de 350 MB adicionales. En total, unos 800 MB de VRAM en fp16, lo que cabe en cualquier GPU moderna con 4 GB o mas.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3060, etc.) es suficiente para inferencia. Para entrenamiento de la cabeza (solo los parametros del MLP, unos pocos millones), una GPU de 8 GB es mas que suficiente.
- Si cabe en consumer GPU: si, sin ninguna duda. Incluso una GPU integrada moderna podria ejecutar inferencia con cuantizacion.
- Opciones de despliegue: al no ser un modelo `transformers`, no se puede cargar con `AutoModel`. Requiere el modulo `BiomedClipSubjectModel` del repositorio [vislearn/InvarianceAuditing](https://github.com/vislearn/InvarianceAuditing). Se puede servir con frameworks genericos de inferencia como TorchServe, o exportar a ONNX para usar con TensorRT u ONNX Runtime. No es compatible con vLLM, llama.cpp u Ollama, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no se dispone de datos oficiales. Con un ViT-B/16 a 384×384 en una GPU consumer moderna (RTX 3090), se puede esperar un throughput del orden de 50-100 imagenes por segundo en batch, pero es una estimacion orientativa sin mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Entrenamiento | Licencia |
|---|---|---|---|---|
| RussellALA/biomedclip-chexpert | 200M (encoder congelado) | ViT-B/16 + MLP residual | CheXpert frontal, 5 hallazgos | CheXpert Research Use |
| RussellALA/convnext-chexpert-seed1 | No disponible | ConvNeXt (probablemente base) | CheXpert frontal, 5 hallazgos | CheXpert Research Use |
| RussellALA/convnext-chexpert-seed2 | No disponible | ConvNeXt (probablemente base) | CheXpert frontal, 5 hallazgos | CheXpert Research Use |

No se dispone de datos publicos sobre los parametros exactos ni el rendimiento de los modelos ConvNeXt acompanantes. Otros clasificadores de CheXpert conocidos, como CheXNet (DenseNet-121) o los modelos de la competicion CheXpert de Stanford, no tienen checkpoints publicos comparables en las mismas condiciones de evaluacion. La comparativa directa no es posible sin ejecutar los benchmarks uno mismo.

## Limitaciones y advertencias

- **No es una herramienta clinica**: la model card es explicita: no debe usarse para decisiones diagnosticas ni sobre pacientes.
- **Entrenado en un solo centro**: solo datos del Stanford Hospital, lo que limita la generalizacion a otros entornos.
- **Sesgos demograficos y de adquisicion**: hereda los sesgos presentes en CheXpert, que pueden afectar a grupos minoritarios o a equipos de rayos X diferentes.
- **Salidas no calibradas**: las etiquetas inciertas se enmascararon durante el entrenamiento, por lo que el modelo nunca aprendio a expresar incertidumbre. Las probabilidades no son fiables.
- **Sensibilidad extrema a la normalizacion**: una diferencia aparentemente menor en el preprocesado (normalizacion por canal vs. escala de grises) cambia los logits en un 25% de distancia de probabilidad. Esto hace al modelo muy fragil ante cambios en el pipeline.
- **Invarianzas problematicas**: el propio paper demuestra que el modelo asigna la misma representacion a imagenes que un radiologo consideraria diferentes. Es una limitacion intrinseca, no un fallo corregible con mas datos.
- **Licencia restrictiva**: la licencia CheXpert Research Use Agreement limita el uso a fines de investigacion y prohibe el uso comercial o clinico sin autorizacion de Stanford.
- **Formato no estandar**: al no ser un `AutoModel`, su integracion en pipelines existentes requiere codigo adicional y conocimiento del repositorio asociado.

## Enlaces

- Modelo en HuggingFace: [RussellALA/biomedclip-chexpert](https://huggingface.co/RussellALA/biomedclip-chexpert)
- Repositorio de codigo: [vislearn/InvarianceAuditing](https://github.com/vislearn/InvarianceAuditing)
- Paper de auditoria: [arXiv:2603.21782](https://arxiv.org/abs/2603.21782)
- Modelo base BiomedCLIP: [microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224](https://huggingface.co/microsoft/BiomedCLIP-PubMedBERT_256-vit_base_patch16_224)
- Paper original de BiomedCLIP: [arXiv:2303.00915](https://arxiv.org/html/2303.00915v2)
- Articulo de BiomedCLIP en NEJM AI: [https://ai.nejm.org/doi/full/10.1056/AIoa2400640](https://ai.nejm.org/doi/full/10.1056/AIoa2400640)
- Pipeline de datos de BiomedCLIP: [https://github.com/microsoft/BiomedCLIP_data_pipeline](https://github.com/microsoft/BiomedCLIP_data_pipeline)
- Paper de la Masked Asymmetric Loss: [arXiv:2009.14119](https://arxiv.org/abs/2009.14119)
- Modelos acompanantes: [convnext-chexpert-seed1](https://huggingface.co/RussellALA/convnext-chexpert-seed1), [convnext-chexpert-seed2](https://huggingface.co/RussellALA/convnext-chexpert-seed2)
- Acuerdo de uso de datos de CheXpert: [https://stanfordmlgroup.github.io/competitions/chexpert/](https://stanfordmlgroup.github.io/competitions/chexpert/)
