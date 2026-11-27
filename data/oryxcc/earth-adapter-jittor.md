# OryXcc/Earth-Adapter-Jittor

## Resumen

Earth-Adapter-Jittor es una conversión de los pesos del modelo Earth-Adapter al framework Jittor, publicada por el usuario OryXcc. Earth-Adapter es un adaptador de dominio para segmentación semántica de imágenes de teledetección, construido sobre un backbone DINOv2 ViT-L con parches de 16×16 y una cabeza de decodificación Mask2Former. El modelo original lo desarrolla el grupo VisionXLab y se describe en el paper arXiv:2504.06220. Esta versión concreta no introduce cambios algorítmicos: es una conversión de formato (checkpoints FP32 solo de tensores) para poder ejecutar el modelo en Jittor 1.3.11.0 en lugar de PyTorch.

El problema que aborda es la adaptación de dominio (domain adaptation, DA) y la generalización de dominio (domain generalization, DG) en segmentación semántica de escenas aéreas y satelitales. El modelo se distribuye como un backbone compartido más ocho checkpoints de tarea (cuatro pares de dirección, cada uno con variante DA y DG), lo que permite evaluar transferencia entre los conjuntos Potsdam, Vaihingen y LoveDA (Rural/Urban).

La relevancia de esta ficha es acotada: se trata de un artefacto de conversión con cero descargas y cero likes en el momento de la consulta, orientado a investigadores que ya trabajan en el ecosistema Jittor y necesitan reproducir los resultados de Earth-Adapter sin depender de PyTorch. No es un modelo de propósito general ni un modelo de lenguaje: es un segmentador de imágenes con tareas fijas y clases predefinidas por dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT (DINOv2 ViT-L, parches 16×16) con cabeza de decodificación Mask2Former |
| Parametros totales | no disponible (el repositorio pesa 2,1 GB en FP32; el desglose por componente no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entradas de 512×512 píxeles según la evaluación reportada) |
| Tipos de cuantizacion | no disponible (los checkpoints distribuidos son FP32) |
| Idiomas soportados | no aplica (modelo de segmentación de imágenes; sin capacidades de texto) |
| Licencia | no disponible |
| Formato de pesos | `.pth` (checkpoints de tensores para `jittor.load`), FP32 |
| Framework | Jittor 1.3.11.0 con CUDA |
| Modelo base | wsdwJohn1231/Earth-Adapter |
| Tareas incluidas | 8 checkpoints (4 direcciones × variantes DA y DG) más backbone compartido |
| Preprocesado | RGB FP32 en rango 0–255, medias (123.675, 116.28, 103.53), desviaciones (58.395, 57.12, 57.375) |
| Integridad | fichero `SHA256SUMS` con el hash de cada checkpoint |

## Arquitectura y entrenamiento

La arquitectura combina un backbone DINOv2 ViT-L con parches de 16×16 y una cabeza de decodificación Mask2Former. El backbone es compartido por las ocho tareas; cada checkpoint de tarea contiene tanto los parámetros del adaptador Earth-Adapter como la cabeza de decodificación. Para una evaluación se carga un backbone y un checkpoint de tarea.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset más allá de los conjuntos de teledetección citados (Potsdam, Vaihingen, LoveDA), ni sobre si se emplearon técnicas de RLHF/DPO (poco probables en un modelo de segmentación). La model card indica que los datos y las instrucciones de preparación están disponibles en el repositorio del autor original (VisionXLab/Earth-Adapter) y en el dataset wsdwJohn1231/Geo_dataset. La innovación técnica del trabajo original es el mecanismo Earth-Adapter para adaptación y generalización de dominio; esta conversión no altera dicho mecanismo, solo el runtime.

## Capacidades

- Segmentación semántica de imágenes de teledetección (escenas aéreas y satelitales).
- Adaptación de dominio (DA) entre pares de dominios: Potsdam→Vaihingen, Vaihingen→Potsdam, LoveDA Rural→Urban y LoveDA Urban→Rural.
- Generalización de dominio (DG) para las mismas cuatro direcciones, con checkpoints independientes.
- Backbone compartido reutilizable para las ocho tareas, lo que reduce el coste de almacenamiento y carga.
- Ejecución en Jittor 1.3.11.0 con CUDA, alternativa a la implementación original en PyTorch.
- Verificación de integridad de pesos mediante `SHA256SUMS`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual y de tarea fija.

## Casos de uso

- Evaluación de adaptación de dominio en teledetección: cargar el backbone `dinov2_earth_patch16.pth` junto con `da_p2v.pth` para medir la transferencia de Potsdam a Vaihingen sobre teselas de validación de 512×512 del dominio objetivo, reproduciendo el mIoU reportado de 66,84 %.
- Comparativa DA frente a DG: ejecutar el par `da_*` y `dg_*` de una misma dirección para cuantificar la brecha entre adaptación con datos del dominio objetivo y generalización sin ellos (por ejemplo, 66,84 % frente a 64,93 % en Potsdam→Vaihingen).
- Investigación en el ecosistema Jittor: usar los checkpoints convertidos para integrar Earth-Adapter en pipelines de entrenamiento o inferencia escritos en Jittor, sin necesidad de portar código PyTorch.
- Segmentación de escenas urbanas y rurales con LoveDA: emplear `da_r2u.pth` o `dg_u2r.pth` para generar máscaras semánticas de cobertura del suelo en teselas del dominio correspondiente.
- Validación de reproducibilidad: verificar los pesos descargados contra `SHA256SUMS` antes de lanzar experimentos, un paso crítico en flujos de investigación con checkpoints de terceros.
- Base para fine-tuning posterior: partir del backbone DINOv2 ViT-L compartido y de una cabeza Mask2Former ya entrenada para adaptar el modelo a un nuevo sensor o región, aunque esta conversión no documenta recetas de entrenamiento propias.
- Docencia y prototipado: desplegar un segmentador de teledetección funcional en un entorno Jittor para demostraciones, dado que el repositorio incluye todos los checkpoints necesarios en un único artefacto de 2,1 GB.

## Benchmarks y rendimiento

Los únicos datos disponibles son los mIoU verificados en Jittor por el autor de la conversión, sobre teselas de validación de 512×512 del dominio objetivo:

| Direccion | Checkpoint DA | Checkpoint DG | mIoU Jittor DA / DG (%) |
|---|---|---|---|
| Potsdam → Vaihingen | `da_p2v.pth` | `dg_p2v.pth` | 66,84 / 64,93 |
| Vaihingen → Potsdam | `da_v2p.pth` | `dg_v2p.pth` | 61,99 / 55,06 |
| LoveDA Rural → Urban | `da_r2u.pth` | `dg_r2u.pth` | 55,51 / 59,02 |
| LoveDA Urban → Rural | `da_u2r.pth` | `dg_u2r.pth` | 49,08 / 45,66 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros no aplican a este modelo).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio completo ocupa 2,1 GB en FP32; en inferencia solo se cargan el backbone y un checkpoint de tarea, por lo que el pico de memoria es sustancialmente menor que el tamaño total del repositorio, pero no se documenta una cifra concreta.
- GPU recomendadas: no disponible. La evaluación se realizó con Jittor 1.3.11.0 y CUDA, sin especificar el modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; un ViT-L con entradas de 512×512 es viable en GPUs de consumo con suficiente VRAM, pero no hay datos que lo verifiquen para esta conversión.
- Opciones de despliegue: Jittor 1.3.11.0 con CUDA y `jittor.load`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto / entrada | Tareas | Framework | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Earth-Adapter-Jittor (esta ficha) | DINOv2 ViT-L + Mask2Former | 512×512 píxeles | 8 checkpoints DA/DG | Jittor | no disponible | Hugging Face, 0 descargas |
| Earth-Adapter (original) | DINOv2 ViT-L + Mask2Former | 512×512 píxeles | 8 checkpoints DA/DG | PyTorch | no disponible | Hugging Face (wsdwJohn1231/Earth-Adapter) y GitHub |
| Otros segmentadores de teledetección | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es frente al modelo original, del que esta versión es una conversión de formato sin cambios de pesos. No se dispone de datos de benchmarks de terceros para establecer comparaciones adicionales.

## Limitaciones y advertencias

- Modelo de tarea fija: solo realiza segmentación semántica sobre los dominios y clases de Potsdam, Vaihingen y LoveDA; no es un modelo de propósito general.
- Sin licencia declarada: la ausencia de licencia impide asumir permisos de uso comercial; debe consultarse la licencia del modelo original antes de cualquier uso en producción.
- Artefacto de conversión de terceros: publicado por el usuario OryXcc, no por los autores originales; no hay garantía de mantenimiento ni de soporte.
- Adopción nula verificable: cero descargas y cero likes en el momento de la consulta, lo que reduce la validación por parte de la comunidad.
- Dependencia de Jittor 1.3.11.0: los pesos están pensados para `jittor.load`; no son directamente utilizables en PyTorch sin una reconversión.
- Preprocesado estricto: es necesario respetar el rango 0–255 en FP32 y las medias y desviaciones indicadas; desviarse de ellas invalida los mIoU reportados.
- Rendimiento limitado en algunas direcciones: el mIoU cae hasta 45,66 % en la variante DG de LoveDA Urban→Rural, lo que refleja la dificultad del dominio y no un fallo de la conversión.
- Riesgo de sesgo y alucinación: no documentado en la información disponible; en segmentación, el equivalente sería la predicción errónea de clases en escenas fuera de distribución, sin datos cuantitativos al respecto.
- Sin información sobre cuantización ni despliegue optimizado: no se ofrecen versiones GGUF, ONNX ni recetas de aceleración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OryXcc/Earth-Adapter-Jittor
- Modelo base en Hugging Face: https://huggingface.co/wsdwJohn1231/Earth-Adapter
- Dataset: https://huggingface.co/datasets/wsdwJohn1231/Geo_dataset
- Paper: https://arxiv.org/abs/2504.06220
- Implementación original: https://github.com/VisionXLab/Earth-Adapter
- Preparación de datos: https://github.com/VisionXLab/Earth-Adapter#-dataset-preparation
