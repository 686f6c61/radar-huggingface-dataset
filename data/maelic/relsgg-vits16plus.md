# maelic/relsgg-vits16plus

## Resumen

relsgg-vits16plus es un modelo de generación de grafos de escena (scene graph generation) orientado a la predicción de relaciones visuales en vocabulario abierto. Lo desarrolla el autor independiente maelic como parte del proyecto RelateAnything, y resuelve un problema concreto: dado un conjunto de regiones (cajas o máscaras) procedentes de cualquier detector o segmentador, devuelve relaciones ordenadas por puntuación sobre un vocabulario de predicados que se proporciona en tiempo de inferencia. Las etiquetas de clase de los objetos nunca son una entrada del modelo.

El modelo se construye sobre el backbone DINOv3 ViT-S/16-plus (facebook/dinov3-vits16plus-pretrain-lvd1689m) y añade una cabeza de relación reparameterizable sobre un estudiante de texto que codifica el vocabulario de predicados. Esto permite cambiar el conjunto de predicados sin reentrenar: el vocabulario se codifica una vez y la cabeza se reparameteriza sobre él, de modo que la puntuación posterior es puramente visual. El checkpoint se distribuye en formato PyTorch (EMA) y ONNX, con un tamaño de repositorio de 0,5 GB.

Es relevante ahora porque aborda la generación de grafos de escena en régimen open-vocabulary, un área donde los modelos clásicos están atados a un conjunto cerrado de predicados. Además, ofrece una descomposición en dos grafos (espacial y semántico) en un solo forward pass y publica umbrales de despliegue calibrados por predicado para este checkpoint concreto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT (DINOv3 ViT-S/16-plus) con cabeza de relación reparameterizable sobre estudiante de texto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto generativo) |
| Tipos de cuantizacion | no disponible (se distribuye en torch fp32/EMA y ONNX) |
| Idiomas soportados | no disponible (el vocabulario de predicados es texto libre en el idioma que se aporte) |
| Licencia | dinov3-license (derivado de pesos DINOv3 de Meta) |
| Formato de pesos | model.pth (torch, EMA), relateanything.onnx (opset 17), text_student.pt, predicate_embeddings.npz, predicate_bank.npz |

## Arquitectura y entrenamiento

El modelo parte del backbone DINOv3 ViT-S/16-plus, un transformer de visión preentrenado por Meta. Sobre las características visuales de las regiones se aplica una cabeza de predicción de relaciones que se reparameteriza sobre las representaciones de un estudiante de texto (text_student.pt con su tokenizer). El vocabulario de predicados se codifica una vez y la cabeza se ajusta a él; a partir de ahí, la puntuación de relaciones es solo visión. El vocabulario de entrenamiento completo contiene 19.103 cadenas de predicado, legibles desde predicate_embeddings.npz sin recodificar.

El entrenamiento se realizó sobre una mezcla de megasg_clean, vg_raw y hicodet, con proporciones por imagen de 0,727 / 0,063 / 0,210 respectivamente, y negativos conscientes de la fuente para hicodet. Las anotaciones de entrenamiento (RA-4M) fueron generadas por gemma-4-26B. El checkpoint corresponde al run relsgg-vits16plus con git e9ea42aed60f766f12ad19d51709129c50110a3b, torch 2.13.0+cu130 y transformers 5.14.1. La exportación ONNX usa opset 17 con una paridad máxima de |Δ| de 6,87e-05. El modelo no requiere login gated de DINOv3 porque model.pth embebe la configuración del backbone.

## Capacidades

- Predicción de relaciones visuales en vocabulario abierto: acepta cualquier conjunto de cadenas de predicado en inferencia, sin reentrenar.
- Entrada de regiones desde cualquier fuente: detectores, segmentadores o anotaciones ground truth, en forma de cajas [N, 4] en píxeles o máscaras binarias [N, H, W].
- No requiere etiquetas de clase de objeto como entrada.
- Descomposición en dos grafos (espacial y semántico) en un único forward pass mediante decompose=True.
- Vocabulario completo de entrenamiento (19.103 predicados) disponible leyendo predicate_embeddings.npz con full_vocabulary=True.
- Razonamiento espacial evaluado en SpatialSense (protocolo adversarial verdadero/falso).
- Exportación ONNX para despliegue.
- Umbrales de despliegue calibrados por predicado para este checkpoint concreto (thresholds.json, calibration.json).
- Capacidades multilingües: no disponibles de forma explícita; el vocabulario es texto libre, por lo que el idioma depende de las cadenas aportadas.

## Casos de uso

- Análisis de escenas en pipelines de visión: dado un detector de objetos, el modelo recibe las cajas y devuelve relaciones ordenadas para construir un grafo de escena completo, útil en sistemas de comprensión visual.
- Búsqueda y recuperación visual semántica: con un vocabulario personalizado como ["about to collide with", "reflected in"], se pueden consultar relaciones específicas de un dominio sin reentrenar el modelo.
- Robótica y planificación de manipulación: la descomposición en grafo espacial y semántico permite separar relaciones geométricas (encima, debajo, al lado) de relaciones semánticas (sosteniendo, mirando), adecuado para razonamiento de escena en tiempo real.
- Moderación y análisis de contenido: detección de relaciones persona-objeto (por ejemplo, "wearing", "holding") con umbrales calibrados por predicado, integrable en flujos de revisión.
- Anotación asistida de datasets: el modelo acepta regiones ground truth y devuelve relaciones candidatas, lo que acelera el etiquetado de grafos de escena en nuevos dominios.
- Sistemas de accesibilidad y descripción de imágenes: generación de descripciones relacionales estructuradas a partir de regiones detectadas, con vocabulario adaptado al usuario.
- Investigación en open-vocabulary SGG: evaluación con OV-SGG-Bench y comparación de protocolos con y sin reparameterization sobre predicados.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre Visual Genome 150 (test), tarea scene-graph-generation:

| Metrica | Valor |
|---|---|
| F1@50 (vg150 test, graph-constrained) | 0,3685 |

Transferencia closed-vocabulary (reparameterized, TEST, graph-constrained):

| Fuente | R@50 | mR@50 | F1@50 |
|---|---|---|---|
| vg150 | 0,533 | 0,282 | 0,369 |
| psg | 0,401 | 0,306 | 0,347 |
| indoorvg | 0,527 | 0,295 | 0,378 |
| hicodet | 0,452 | 0,314 | 0,371 |

Open-vocabulary sin reparameterization (19.103 predicados desplegados, emparejamiento por sinónimos en tau calibrado):

| Fuente | SoftR@50 | SoftmR@50 | SoftF1@50 |
|---|---|---|---|
| vg150 | 0,560 | 0,345 | 0,427 |
| psg | 0,305 | 0,283 | 0,294 |
| indoorvg | 0,533 | 0,346 | 0,419 |

Razonamiento espacial (SpatialSense, adversarial verdadero/falso, azar = 0,5): AUC macro sobre predicados de 0,6897.

Descomposición en dos grafos (protocolo estratificado por tipo):

| Fuente | spatial R@50 / mR@50 | semantic R@50 / mR@50 |
|---|---|---|
| vg150 | 0,632 / 0,308 | 0,497 / 0,309 |
| psg | 0,608 / 0,543 | 0,408 / 0,330 |
| indoorvg | 0,609 / 0,346 | 0,420 / 0,299 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,5 GB y el backbone es ViT-S/16-plus, por lo que la huella es moderada y compatible con GPU de consumo.
- GPU recomendadas: no disponibles en la información proporcionada; el ejemplo de la model card usa device="cuda".
- Compatibilidad con GPU de consumo: probable por el tamaño del backbone, aunque no se confirma en la información disponible.
- Opciones de despliegue: paquete relsgg (pip install git+https://github.com/Maelic/RelateAnything), PyTorch con model.pth, ONNX (relateanything.onnx, opset 17). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La codificación del vocabulario completo en CPU se describe como "un minuto y medio", evitable usando full_vocabulary=True con predicate_embeddings.npz.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. El autor referencia el benchmark OV-SGG-Bench para evaluar open-vocabulary SGG, pero no se incluyen resultados de otros modelos en la información disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| relsgg-vits16plus | no disponible | no aplica | F1@50 0,3685 en vg150 | dinov3-license | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no están verificados (verified: false).
- Los umbrales de despliegue son específicos de este checkpoint: la cabeza está entrenada por ranking y las escalas de puntuación no transfieren a otros modelos.
- Riesgo de alucinación relacional: al aceptar vocabulario libre, el modelo puede puntuar predicados poco plausibles si no se aplican umbrales calibrados.
- El rendimiento varía notablemente por fuente de datos (por ejemplo, SoftF1@50 en psg es 0,294 frente a 0,427 en vg150 en open-vocabulary).
- Licencia dinov3-license: los pesos son derivados de DINOv3 de Meta y están sujetos a los términos de dicha licencia; revisar condiciones para uso comercial.
- Las anotaciones de entrenamiento (RA-4M) fueron generadas por gemma-4-26B y llevan el aviso de Gemma Terms of Use.
- Los sinónimos de predicados no se colapsan deliberadamente, lo que puede afectar a la comparación entre vocabularios.
- Idiomas soportados no documentados; el comportamiento multilingüe depende de las cadenas de predicado aportadas.
- No es un modelo generativo de texto: la pipeline image-text-to-text se refiere a la entrada de vocabulario textual, no a generación libre.

## Enlaces

- Hugging Face: https://huggingface.co/maelic/relsgg-vits16plus
- Código RelateAnything: https://github.com/Maelic/RelateAnything
- Paper: https://arxiv.org/abs/2609.12552
- Dataset RA-4M: https://huggingface.co/datasets/maelic/RA-4M
- Especificación OV-SGG-Bench: https://github.com/Maelic/RelateAnything/blob/main/benchmark/SPEC.md
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license/
- Backbone DINOv3 ViT-S/16-plus: https://huggingface.co/facebook/dinov3-vits16plus-pretrain-lvd1689m
