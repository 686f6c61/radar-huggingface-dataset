# maelic/relsgg-vits16plus

## Resumen

relsgg-vits16plus es un modelo de generacion de grafos de escena (scene graph generation) en vocabulario abierto desarrollado por el usuario maelic, publicado en HuggingFace bajo la libreria `relsgg` y presentado como parte del proyecto RelateAnything. No es un modelo de lenguaje: recibe una imagen junto con regiones (cajas en formato xyxy o mascaras binarias) procedentes de cualquier fuente —un detector, un segmentador o una anotacion manual— y devuelve un ranking de relaciones sobre un vocabulario de predicados que se suministra en el momento de la inferencia. Las etiquetas de clase de objeto nunca se usan como entrada, lo que desacopla por completo la propuesta de regiones de la prediccion de relaciones.

El modelo se construye sobre el backbone de vision facebook/dinov3-vits16plus-pretrain-lvd1689m y anade un estudiante de texto que codifica el vocabulario de predicados una sola vez; despues, la cabeza se reparametriza sobre ese vocabulario y el scoring pasa a ser exclusivamente visual. Esto permite cambiar el conjunto de predicados sin reentrenar: basta con llamar a `set_vocabulary` con cadenas arbitrarias. Ademas, en un unico forward pass puede devolver dos grafos descompuestos (espacial y semantico) mediante `decompose=True`.

Su relevancia practica esta en que evita el ciclo habitual de reentrenamiento por cada conjunto de relaciones de un dominio nuevo, y en que se distribuye con export a ONNX (opset 17, paridad maxima medida de 6,87e-05) y con los pesos en formato PyTorch de tipo EMA. El repositorio ocupa 0,5 GB y no requiere autenticacion en el modelo restringido de DINOv3, porque `model.pth` incorpora la configuracion del backbone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision (backbone DINOv3 ViT-S/16+, `facebook/dinov3-vits16plus-pretrain-lvd1689m`) con cabeza de prediccion de relaciones reparametrizable sobre un vocabulario textual, mas un estudiante de texto que codifica los predicados |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje; la entrada es una imagen mas N regiones) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos torch `.pth` y un export ONNX; no se listan variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible (la model card no los declara; el vocabulario de predicados se aporta como cadenas de texto en inferencia) |
| Licencia | `dinov3-license` (DINOv3 License de Meta): https://ai.meta.com/resources/models-and-libraries/dinov3-license/ |
| Formato de pesos | PyTorch (`model.pth`, pesos EMA), ONNX (`relateanything.onnx`, opset 17), estudiante de texto `.pt` con tokenizer, embeddings de predicados `.npz` (`predicate_embeddings.npz`, `predicate_bank.npz`) |
| Entrada | Imagen (PIL o ndarray) + cajas `[N, 4]` en pixeles y/u mascaras binarias `[N, H, W]`; vocabulario de predicados como lista de cadenas |
| Salida | Tripletas rankeadas del tipo `(sujeto) --predicado [score]--> (objeto)`; opcionalmente dos grafos (espacial y semantico) |
| Vocabulario de predicados | 19.103 cadenas en el vocabulario completo de entrenamiento |
| Tamano del repositorio | 0,5 GB |
| Pipeline declarado | image-text-to-text |
| Fecha de publicacion / actualizacion | 2026-09-09 / 2026-09-17 |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos torres asimetricas y una cabeza de scoring. El backbone es un ViT-S/16+ de la familia DINOv3, que extrae caracteristicas visuales de la imagen y de las regiones indicadas por cajas o mascaras. De forma paralela, un "estudiante de texto" (fichero `runs/packed/text_student_v2_512/student.pt`, sha256 `e0317830b68ea51e...`) codifica el vocabulario de predicados una unica vez; a continuacion la cabeza se reparametriza sobre ese vocabulario, de modo que el scoring posterior solo necesita la rama de vision. Esta reparametrizacion es la que habilita el cambio de vocabulario sin reentrenamiento, y explica que `full_vocabulary=True` lea `predicate_embeddings.npz` directamente en lugar de codificar el vocabulario (lo que convierte aproximadamente un minuto y medio de trabajo en CPU en una simple descarga).

El entrenamiento usa la mezcla `megasg_clean + vg_raw + hicodet` con pesos por imagen de 0,727 / 0,063 / 0,210 y negativos conscientes de la fuente (`source-aware negatives: ['hicodet']`). Las anotaciones proceden del dataset RA-4M, generado con `gemma-4-26B`, y las imagenes se referencian unicamente por identificador (Objects365, COCO y OpenImages); el subconjunto `vg_raw` deriva de Visual Genome (CC BY 4.0). Los sinonimos de predicados nunca se colapsan, por lo que las formas superficiales distintas se mantienen separadas. La procedencia exacta esta fijada en el commit `e9ea42aed60f766f12ad19d51709129c50110a3b`, con torch 2.13.0+cu130 y transformers 5.14.1. El artefacto ONNX se exporto en opset 17 con una paridad maxima medida frente a torch de 6,87e-05.

## Capacidades

- Prediccion de relaciones en vocabulario abierto: acepta cualquier lista de predicados en inferencia, sin reentrenar, mediante `model.set_vocabulary([...])`.
- Entrada de regiones agnostica a la fuente: funciona con cajas de cualquier detector, con mascaras de cualquier segmentador o con anotaciones de ground truth.
- Prediccion sin etiquetas de clase: las etiquetas de objeto no se pasan nunca al modelo, lo que evita depender de un taxonomia cerrada.
- Salida rankeada con scores: `predict(image, boxes_xyxy, topk=20)` devuelve tripletas ordenadas con su puntuacion.
- Soporte de mascaras binarias: se pueden pasar mascaras `[N, H, W]` junto a sus extensiones para refinar la representacion de cada region.
- Descomposicion en dos grafos: `decompose=True` devuelve, en un solo forward pass, un grafo espacial y un grafo semantico.
- Vocabulario completo integrado: `full_vocabulary=True` carga los 19.103 predicados de entrenamiento leidos de los pesos.
- Razonamiento espacial evaluado de forma explicita (protocolo SpatialSense adversarial verdadero/falso).
- Export ONNX para despliegue sin dependencia de PyTorch.
- No genera texto libre ni mantiene dialogos: pese al pipeline declarado `image-text-to-text`, su salida es un ranking estructurado de relaciones.

## Casos de uso

- Anotacion automatica de grafos de escena a gran escala: dado un dataset de imagenes con cajas ya disponibles, el modelo produce relaciones con score para poblar anotaciones de forma masiva sin etiquetas de clase y sin reentrenar por vocabulario.
- Robotica y manipulacion: alimentado con mascaras de un segmentador, permite responder consultas como que objeto esta "supporting", "on" o "behind" otro, utiles para planificacion de agarre y navegacion; los umbrales por predicado publicados (por ejemplo 0,985 para "supporting") facilitan el filtrado.
- Auditoria y validacion de datasets: comparar las predicciones del modelo contra las anotaciones de ground truth de un corpus propio para detectar relaciones ausentes o mal etiquetadas, usando los protocolos de OV-SGG-Bench.
- Recuperacion visual basada en relaciones: indexar imagenes por tripletas sujeto-predicado-objeto permite busquedas del tipo "persona montando algo" sin depender de descripciones textuales libres.
- Vocabularios de dominio especifico sin reentrenamiento: en inspeccion industrial o teledeteccion se pueden definir predicados propios ("about to collide with", "reflected in") y desplegarlos inmediatamente con `set_vocabulary`.
- Preetiquetado para entrenar otros modelos: generar relaciones candidatas con score alto para inicializar anotaciones humanas en un pipeline de active learning.
- Analisis de contenido estructurado: deteccion de relaciones sensibles entre regiones (por ejemplo "holding" con umbral 0,975) como senal auxiliar en moderacion.
- Integracion en pipelines ONNX: el fichero `relateanything.onnx` permite servir el modelo en entornos de produccion sin stack de PyTorch, con paridad numerica verificada frente a torch.

## Benchmarks y rendimiento

Resultado declarado en el model-index oficial (no verificado por un tercero):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| scene-graph-generation | Visual Genome 150 (test) | F1@50 (graph-constrained) | 0,3685 |

Transferencia con vocabulario cerrado (reparametrizado, TEST, graph-constrained):

| Fuente | R@50 | mR@50 | F1@50 |
|---|---|---|---|
| vg150 | 0,533 | 0,282 | 0,369 |
| psg | 0,401 | 0,306 | 0,347 |
| indoorvg | 0,527 | 0,295 | 0,378 |
| hicodet | 0,452 | 0,314 | 0,371 |

Vocabulario abierto sin reparametrizacion (los 19.103 predicados desplegados, emparejamiento por sinonimos en el tau calibrado):

| Fuente | SoftR@50 | SoftmR@50 | SoftF1@50 |
|---|---|---|---|
| vg150 | 0,560 | 0,345 | 0,427 |
| psg | 0,305 | 0,283 | 0,294 |
| indoorvg | 0,533 | 0,346 | 0,419 |

Razonamiento espacial (SpatialSense, adversarial verdadero/falso, azar = 0,5): AUC macro sobre predicados de **0,6897**.

Descomposicion en dos grafos (protocolo estratificado por tipo):

| Fuente | Espacial R@50 / mR@50 | Semantico R@50 / mR@50 |
|---|---|---|
| vg150 | 0,632 / 0,308 | 0,497 / 0,309 |
| psg | 0,608 / 0,543 | 0,408 / 0,330 |
| indoorvg | 0,609 / 0,346 | 0,420 / 0,299 |

Umbrales de despliegue medidos sobre este checkpoint (extracto de los predicados con mayor soporte; regimen: cajas de ground truth, `pair_weight=0`, 5000 imagenes de validacion):

| Predicado | Umbral | Mejor F1 | Soporte GT |
|---|---|---|---|
| behind | 0,900 | 0,330 | 3599 |
| in front of | 0,870 | 0,347 | 3575 |
| wearing | 0,980 | 0,690 | 3417 |
| to the right of | 0,855 | 0,385 | 3198 |
| to the left of | 0,860 | 0,372 | 3097 |
| resting on | 0,975 | 0,579 | 2166 |
| on | 0,935 | 0,457 | 2043 |
| holding | 0,975 | 0,456 | 1552 |

## Requisitos de hardware

- El repositorio completo ocupa 0,5 GB, lo que da una cota superior holgada del peso en disco de los pesos en precision nativa.
- VRAM estimada para inferencia: no hay cifras oficiales publicadas. Dado que el backbone es un ViT-S/16+ (variante pequena de DINOv3) y que la cabeza se reparametriza sobre el vocabulario, es razonable esperar un consumo muy por debajo de los modelos de lenguaje de tamano equivalente; se trata de una estimacion, no de un dato medido.
- GPU recomendadas: no disponibles. Por el tamano del backbone, cualquier GPU CUDA moderna con unos pocos GB de VRAM deberia ser suficiente; no se requieren A100 ni H100.
- Cabe en GPU de consumo: previsiblemente si, en gamas tipo RTX 3060 o superiores, aunque la model card no publica mediciones al respecto.
- CPU: el unico coste en CPU documentado es la codificacion del vocabulario con `full_vocabulary=False`, que ronda el minuto y medio; con `full_vocabulary=True` ese coste se sustituye por la descarga de `predicate_embeddings.npz`.
- Opciones de despliegue: libreria `relsgg` sobre PyTorch (`RelateAnything.from_pretrained`) y ONNX Runtime mediante `relateanything.onnx`. No aplican vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han proporcionado resultados de benchmarks de modelos alternativos en la informacion disponible, por lo que no es posible establecer una comparacion numerica. Las familias con las que competiria este modelo son:

| Categoria | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| relsgg-vits16plus (este modelo) | no disponible | no aplica | F1@50 0,3685 en VG150 test (graph-constrained) | dinov3-license | HuggingFace, ONNX y PyTorch |
| Metodos clasicos de SGG con vocabulario cerrado (p. ej. Motifs, VCTree, RelTR) | no disponible | no aplica | no disponible | no disponible | no disponible |
| Metodos de SGG en vocabulario abierto | no disponible | no aplica | no disponible | no disponible | no disponible |
| Modelos multimodales generativos usados como baseline de relaciones | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El unico resultado del model-index (F1@50 = 0,3685) esta marcado como `verified: false`, es decir, no ha sido verificado por un tercero.
- El rendimiento es desigual segun el predicado: frente a F1 altos como "wearing" (0,690) o "resting on" (0,579), hay predicados con F1 muy bajo, como "beside" (0,196) y "supporting" (0,194).
- En el protocolo de vocabulario abierto sin reparametrizacion, el rendimiento en PSG cae de forma notable (SoftF1@50 = 0,294), lo que indica sensibilidad al dominio y al conjunto de etiquetas.
- Los umbrales publicados son especificos de este checkpoint: la cabeza esta entrenada por ranking, por lo que las escalas de score no son transferibles a otro modelo ni, probablemente, a otro checkpoint de la misma familia.
- Los sinonimos de predicados no se colapsan de forma deliberada; esto afecta a como deben interpretarse las metricas y a la hora de comparar vocabularios propios con el vocabulario de entrenamiento.
- Las regiones de entrada son responsabilidad del usuario: al no recibir etiquetas de clase, la calidad de las cajas o mascaras condiciona directamente la calidad de las relaciones.
- Licencia: los pesos derivan de los pesos preentrenados DINOv3 de Meta y se distribuyen bajo la DINOv3 License, cuyos terminos hay que revisar antes de un uso comercial.
- Avisos de datos: las anotaciones de entrenamiento (RA-4M) fueron generadas con `gemma-4-26B` y arrastran el aviso de los Terminos de Uso de Gemma; las imagenes se referencian solo por identificador (Objects365, COCO, OpenImages) y el subconjunto `vg_raw` deriva de Visual Genome (CC BY 4.0).
- El modelo tiene 0 descargas y 5 likes en el momento de redactar esta ficha, por lo que la validacion por parte de la comunidad es practicamente inexistente.
- No es un modelo de lenguaje: no mantiene conversaciones, no genera texto libre y no admite prompts en el sentido habitual, pese a que el pipeline declarado sea `image-text-to-text`.
- Riesgo de alucinacion en el sentido de relaciones plausibles pero no presentes: la salida siempre es un ranking de tripletas con score, y el filtrado por umbral es responsabilidad del integrador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maelic/relsgg-vits16plus
- Repositorio de codigo RelateAnything: https://github.com/Maelic/RelateAnything
- Paper RelateAnything: https://arxiv.org/abs/2609.12552
- Dataset RA-4M: https://huggingface.co/datasets/maelic/RA-4M
- Especificacion del benchmark OV-SGG-Bench: https://github.com/Maelic/RelateAnything/blob/main/benchmark/SPEC.md
- Backbone DINOv3 ViT-S/16+: https://huggingface.co/facebook/dinov3-vits16plus-pretrain-lvd1689m
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license/
