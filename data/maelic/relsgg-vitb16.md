# maelic/relsgg-vitb16

## Resumen

relsgg-vitb16 es un modelo de generación de grafos de escena (scene graph generation) orientado a la predicción de relaciones entre objetos con vocabulario abierto, desarrollado por el usuario maelic dentro del proyecto RelateAnything. Su planteamiento es poco habitual: el modelo no recibe etiquetas de clase de objeto como entrada, sino una imagen y un conjunto de regiones (cajas o máscaras) procedentes de cualquier detector, segmentador o anotación manual, y devuelve relaciones rankeadas entre esas regiones usando un vocabulario de predicados que se define en tiempo de inferencia como cadenas de texto arbitrarias.

Técnicamente se apoya en un backbone de visión DINOv3 ViT-B/16 (facebook/dinov3-vitb16-pretrain-lvd1689m) más un estudiante de texto que codifica el vocabulario de predicados y una cabeza reparameterizable de entrenamiento por ranking. El vocabulario de entrenamiento contiene 19.103 predicados y el modelo puede, en un único forward pass, descomponer la salida en dos grafos: uno espacial y otro semántico. Se distribuye con licencia DINOv3 de Meta y forma parte de un ecosistema con dataset (RA-4M), benchmark (OV-SGG-Bench) y código propios.

Su relevancia actual está en que ataca el cuello de botella clásico del SGG cerrado: la dependencia de un conjunto fijo de predicados anotados. Aquí el vocabulario es un parámetro de entrada, lo que permite desplegar el modelo sobre taxonomías nuevas sin reentrenar. El contrapunto es que es un modelo muy reciente, con 0 descargas y 0 likes en HuggingFace, y con umbrales de despliegue que solo son válidos para este checkpoint concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión (backbone DINOv3 ViT-B/16) con estudiante de texto para el vocabulario de predicados y cabeza de relación reparameterizable, entrenada por ranking |
| Parametros totales | no disponible (el desglose de parámetros del checkpoint no se publica; el backbone declarado es facebook/dinov3-vitb16-pretrain-lvd1689m) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; la entrada es una imagen más un conjunto de N regiones en cajas o máscaras) |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye pesos PyTorch sin variantes cuantizadas documentadas) |
| Idiomas soportados | no disponible (el vocabulario de predicados de entrenamiento está en inglés; no se documenta soporte multilingüe) |
| Licencia | dinov3-license (licencia DINOv3 de Meta; campo `license: other` en HuggingFace) |
| Formato de pesos | PyTorch: `model.pth` (pesos EMA) y `text_student.pt` con su tokenizer; ficheros NumPy `.npz` (`predicate_embeddings.npz`, `predicate_bank.npz`) y JSON (`thresholds.json`, `calibration.json`). Exportación ONNX verificada con opset 17 y paridad máxima de 2,96e-05 |
| Tamano del repositorio | 0,6 GB |
| Pipeline declarado | image-text-to-text |
| Libreria | relsgg |

## Arquitectura y entrenamiento

El modelo combina tres piezas. La primera es un backbone de visión DINOv3 ViT-B/16 preentrenado (facebook/dinov3-vitb16-pretrain-lvd1689m), que extrae las características de la imagen y de las regiones indicadas. La segunda es un estudiante de texto que codifica el vocabulario de predicados: cada vocabulario se codifica una sola vez y la cabeza se reparameteriza sobre él, de forma que el scoring posterior es exclusivamente de visión. La tercera es una cabeza de relación entrenada por ranking, lo que implica que las escalas de score son específicas de cada checkpoint y no se transfieren entre modelos.

El entrenamiento usó la mezcla `megasg_clean + vg_raw + hicodet` con proporciones por imagen de 0,727 / 0,063 / 0,210, y negativos conscientes de la fuente (`source-aware negatives`) para el subconjunto hicodet. Las anotaciones proceden del dataset RA-4M, generado con gemma-4-26B, mientras que las imágenes se referencian solo por identificador (Objects365, COCO y OpenImages); el subconjunto `vg_raw` deriva de Visual Genome (CC BY 4.0). Un detalle de diseño deliberado es que los sinónimos de predicados nunca se colapsan: la diversidad de formas superficiales forma parte del espacio de etiquetas. La procedencia registra el commit `e9ea42aed60f766f12ad19d51709129c50110a3b`, el estudiante de texto `runs/packed/text_student_v2_512/student.pt` y las versiones torch 2.13.0+cu130 / transformers 5.14.1.

## Capacidades

- Predicción de relaciones con vocabulario abierto a partir de cajas o máscaras de cualquier origen (detector, segmentador o anotación manual), sin necesidad de reentrenamiento.
- Definición del vocabulario en inferencia: `model.set_vocabulary([...])` acepta cadenas arbitrarias, incluidos predicados que el modelo no vio durante el entrenamiento.
- Uso del vocabulario completo de entrenamiento (19.103 cadenas) mediante `full_vocabulary=True`, leído desde `predicate_embeddings.npz`.
- Salida de tripletas rankeadas con formato `(sujeto) --predicado [score]--> (objeto)`, configurable con `topk`.
- Soporte de máscaras binarias `[N, H, W]` además de cajas `[N, 4]` en píxeles.
- Descomposición en dos grafos (espacial y semántico) en un único forward pass mediante `decompose=True`.
- No utiliza etiquetas de clase de objeto como entrada en ningún caso.
- Razonamiento espacial evaluado de forma adversarial (protocolo true/false tipo SpatialSense).
- No es un generador de texto libre: la salida es estructurada (relaciones y grafos), aunque el pipeline se etiquete como image-text-to-text por el uso del estudiante de texto.
- Capacidades multilingües, de audio, de visión generativa o de tool calling: no disponibles.

## Casos de uso

- Anotación automática de grafos de escena: dado un dataset de imágenes con cajas de un detector, el modelo genera tripletas sujeto-predicado-objeto para preanotar relaciones, reduciendo el coste de anotación humana en pipelines de datos de visión.
- Integración con detectores y segmentadores open-vocabulary: combinado con un detector tipo Grounding DINO y un segmentador tipo SAM, el modelo completa el pipeline convirtiendo detecciones en un grafo relacional sin depender de un catálogo cerrado de predicados.
- Robótica y manipulación: relaciones espaciales como "behind", "in front of", "above", "supporting" o "part of" permiten construir representaciones de escena para planificación de agarre y navegación, ya que la entrada admite regiones producidas por el propio sistema de percepción.
- Búsqueda y recuperación visual por relación: indexar grafos de escena permite consultas del tipo "persona montando a caballo" o "objeto reflejado en superficie" sobre un corpus de imágenes, usando el vocabulario como consulta en texto.
- Descripción y accesibilidad: la salida en tripletas puede convertirse en descripciones estructuradas para usuarios con discapacidad visual, con la ventaja de que el vocabulario puede adaptarse al registro o al dominio concreto sin reentrenar.
- Análisis de interacción persona-objeto en vídeo o imagen fija: predicados como "holding", "wearing" o "looking at" permiten construir alertas o métricas (por ejemplo, presencia de personas sosteniendo determinados objetos) en entornos de control.
- Verificación y control de calidad de anotaciones: al devolver relaciones rankeadas con scores calibrados por predicado, el modelo puede usarse para detectar anotaciones ausentes o incoherentes en un grafo ya etiquetado.
- Investigación en razonamiento relacional y multi-step: los dos grafos (espacial y semántico) de un mismo forward pass sirven como entrada estructurada para módulos posteriores de razonamiento o respuesta a preguntas relacionales.

## Benchmarks y rendimiento

Resultado declarado en el model-index oficial (no verificado por terceros):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| scene-graph-generation | Visual Genome 150 (test) | F1@50 (graph-constrained) | 0,3746 |

Transferencia con vocabulario cerrado (reparameterizado, TEST, graph-constrained):

| Fuente | R@50 | mR@50 | F1@50 |
|---|---|---|---|
| vg150 | 0,531 | 0,289 | 0,375 |
| psg | 0,412 | 0,302 | 0,349 |
| indoorvg | 0,538 | 0,302 | 0,387 |
| hicodet | 0,468 | 0,313 | 0,375 |

Vocabulario abierto sin reparameterización (los 19.103 predicados desplegados, emparejado por sinónimos en el tau calibrado):

| Fuente | SoftR@50 | SoftmR@50 | SoftF1@50 |
|---|---|---|---|
| vg150 | 0,566 | 0,345 | 0,429 |
| psg | 0,324 | 0,299 | 0,311 |
| indoorvg | 0,545 | 0,357 | 0,432 |

Razonamiento espacial (SpatialSense, protocolo adversarial true/false; azar = 0,5): AUC macro sobre predicados de 0,6860.

Descomposición en dos grafos (protocolo estratificado por tipo):

| Fuente | Espacial R@50 / mR@50 | Semantico R@50 / mR@50 |
|---|---|---|
| vg150 | 0,636 / 0,314 | 0,494 / 0,312 |
| psg | 0,608 / 0,541 | 0,420 / 0,327 |
| indoorvg | 0,617 / 0,359 | 0,429 / 0,312 |

Umbrales de despliegue medidos sobre este checkpoint (régimen: cajas ground truth, `pair_weight=0`, 5.000 imágenes de validación). Son específicos del checkpoint y no se transfieren a otros modelos:

| Predicado | Umbral | Mejor F1 | Soporte GT |
|---|---|---|---|
| behind | 0,895 | 0,337 | 3598 |
| in front of | 0,860 | 0,343 | 3580 |
| wearing | 0,985 | 0,684 | 3417 |
| to the right of | 0,860 | 0,385 | 3196 |
| to the left of | 0,870 | 0,370 | 3102 |
| resting on | 0,975 | 0,582 | 2166 |
| on | 0,925 | 0,460 | 2043 |
| holding | 0,980 | 0,469 | 1552 |
| beside | 0,980 | 0,194 | 1402 |
| next to | 0,935 | 0,231 | 1352 |
| above | 0,895 | 0,332 | 1283 |
| below | 0,895 | 0,328 | 1241 |
| part of | 0,905 | 0,495 | 1135 |
| supporting | 0,985 | 0,194 | 945 |
| looking at | 0,965 | 0,271 | 872 |

## Requisitos de hardware

- El repositorio completo ocupa 0,6 GB, con `model.pth` (pesos EMA) y `text_student.pt` como ficheros principales; es un modelo de escala pequeña en términos de visión (backbone ViT-B/16, familia de ~86 M de parámetros en el backbone).
- VRAM estimada para inferencia: en el entorno de unos 2 GB de pesos en FP32 más las activaciones de una imagen y N regiones, el modelo debería ejecutarse cómodamente por debajo de 4-6 GB de VRAM con resolución de imagen habitual. Es una estimación a partir del tamaño del repositorio y del backbone, no un dato publicado.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 3070, RTX 4060 Ti, RTX 4090) es suficiente en la práctica; en datacenter, A100, H100 o L40S quedan sobradamente dimensionadas y son útiles si se procesan lotes grandes de imágenes.
- Sí cabe en GPU consumer. No se documentan requisitos de memoria específicos ni configuraciones multimodelo.
- Opciones de despliegue: la vía oficial es la librería `relsgg` (`pip install git+https://github.com/Maelic/RelateAnything`), que descarga los pesos de HuggingFace en el primer uso. Existe exportación ONNX verificada (opset 17, paridad máxima 2,96e-05), lo que abre la puerta a runtimes ONNX. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, y por el tipo de salida (estructurada, no generativa) no son las vías naturales.
- Latencia y throughput: no disponibles. El único dato temporal publicado es que codificar el vocabulario completo de 19.103 predicados en CPU requiere aproximadamente un minuto y medio, coste que se evita cargando `predicate_embeddings.npz`; el scoring posterior es solo de visión.

## Comparativa con modelos similares

La información proporcionada no incluye resultados de terceros, por lo que no es posible establecer una comparación cuantitativa verificada con alternativas. La tabla siguiente recoge únicamente lo que sí está documentado, junto con los campos que quedan como no disponibles.

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|---|
| relsgg-vitb16 | SGG de relaciones con vocabulario abierto desde cajas o máscaras, backbone DINOv3 ViT-B/16 | no disponible | no aplica (visión) | dinov3-license | HuggingFace, 0 descargas, 0 likes | F1@50 0,3746 en vg150 (graph-constrained) |
| Metodos clasicos de SGG con vocabulario cerrado (familia MOTIFS, RelTR y similares) | SGG cerrado sobre un conjunto fijo de predicados anotados | no disponible | no aplica (visión) | no disponible | no disponible | no disponible |
| Metodos open-vocabulary de SGG previos | Prediccion de relaciones sobre vocabularios ampliados, con o sin reparameterizacion | no disponible | no aplica (visión) | no disponible | no disponible | no disponible |

Comparación interna relevante entre los dos regimenes del propio modelo, que sí está medida: sobre vg150, el régimen con vocabulario cerrado reparameterizado obtiene F1@50 0,375, mientras que el régimen de vocabulario abierto sin reparameterizar (emparejado por sinónimos) obtiene SoftF1@50 0,429; en psg el patrón se invierte parcialmente (0,349 frente a 0,311).

## Limitaciones y advertencias

- Licencia: los pesos derivan de pesos preentrenados DINOv3 de Meta y se distribuyen bajo la DINOv3 License, que impone condiciones propias para uso comercial. Es imprescindible revisar el texto completo antes de cualquier despliegue en producción.
- Datos de entrenamiento: las anotaciones de RA-4M fueron generadas por gemma-4-26B y arrastran el aviso de los Gemma Terms of Use; las imágenes se referencian solo por identificador (Objects365, COCO, OpenImages) y el subconjunto `vg_raw` deriva de Visual Genome (CC BY 4.0). Hay que verificar el cumplimiento de cada una de esas licencias.
- Las escalas de score y los umbrales son específicos de este checkpoint (la cabeza se entrena por ranking). Los valores de `thresholds.json` no son extrapolables a otros modelos ni a otras versiones del mismo modelo.
- Rendimiento moderado en el benchmark principal: F1@50 de 0,3746 en Visual Genome 150 en régimen graph-constrained. Predicados frecuentes como "wearing" o "resting on" alcanzan mejor F1 (0,684 y 0,582) que relaciones espaciales o simétricas como "beside" o "supporting" (0,194 en ambos casos), lo que indica un comportamiento muy desigual por predicado.
- Riesgo de alucinación relacional: el modelo puntúa pares de regiones sobre un vocabulario dado; con vocabularios largos o poco frecuentes puede producir relaciones plausibles pero falsas, especialmente sin recorte por umbral calibrado.
- Idiomas: no hay información sobre capacidades multilingües y el vocabulario de entrenamiento está en inglés. Definir un vocabulario en otro idioma no garantiza un comportamiento equivalente al de los predicados vistos durante el entrenamiento.
- El modelo no acepta etiquetas de clase de objeto como entrada, lo que es una decisión de diseño, pero implica que la calidad del grafo depende por completo de la calidad de las regiones (cajas o máscaras) que se le suministren; no detecta objetos por sí mismo.
- Adopción nula: 0 descargas y 0 likes en el momento de redactar esta ficha, sin validación independiente de la comunidad ni resultados verificados por terceros (el propio model-index marca los resultados como no verificados).
- El resultado de razonamiento espacial (AUC macro 0,6860 frente a 0,5 de azar) es solo moderadamente superior al azar, por lo que no conviene confiar en el modelo para juicios espaciales finos sin comprobación adicional.
- La procedencia registra versiones concretas de torch (2.13.0+cu130) y transformers (5.14.1); reproduce el entorno si se necesita paridad exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maelic/relsgg-vitb16
- Codigo del proyecto RelateAnything: https://github.com/Maelic/RelateAnything
- Paper: https://arxiv.org/abs/2609.12552
- Dataset RA-4M: https://huggingface.co/datasets/maelic/RA-4M
- Especificacion del benchmark OV-SGG-Bench: https://github.com/Maelic/RelateAnything/blob/main/benchmark/SPEC.md
- Licencia DINOv3 de Meta: https://ai.meta.com/resources/models-and-libraries/dinov3-license/
- Backbone DINOv3 ViT-B/16: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
