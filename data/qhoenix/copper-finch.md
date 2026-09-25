# qhoenix/copper-finch

## Resumen

Copper-finch es un clasificador de imágenes basado en EfficientNetV2-L (`efficientnet_v2_l` de torchvision, 1.000 clases de ImageNet) afinado con entrenamiento adversario por el usuario qhoenix (Ivan Marahovschi) para la subred Perturb (netuid 26) de Bittensor. El modelo no es un modelo de lenguaje: es una red convolucional de visión que recibe imágenes redimensionadas y recortadas a 480x480 píxeles y devuelve una distribución sobre las 1.000 clases de ImageNet-1k.

Su relevancia es acotada y muy específica: se trata de un artefacto de minería de una subred descentralizada, publicado junto al hotkey del minero y un hash on-chain que permite verificar la integridad de los pesos. El interés técnico está en el entrenamiento adversario, orientado a mantener la precisión de clasificación bajo perturbaciones, y en que el repositorio es pequeño (0,5 GB) y se carga con safetensors y torchvision sin dependencias exóticas.

Con 119.027.848 parámetros, 0 descargas y 0 likes en el momento de la consulta, es un modelo recién publicado, sin model card extendida ni resultados de evaluación propios, por lo que cualquier uso en producción exige una validación previa por parte del integrador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (CNN, variante `efficientnet_v2_l` de torchvision) |
| Parámetros totales | 119.027.848 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de clasificación de imágenes; entrada fija de 480x480 píxeles) |
| Tipos de cuantización | No disponible (el repositorio solo distribuye pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | No disponible / no aplica (salida compuesta por las 1.000 clases de ImageNet-1k, en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, ~0,5 GB de repositorio) |

Datos adicionales: pipeline declarado `image-classification`, librería `torchvision`, tags `adversarial-training`, `efficientnet`, `perturb`, `bittensor`, región `us`. Hotkey del minero: `5FGxe3AFaJ3LsM5LJtxdBS8143WFEd9eNWVKErr29uV1K8wt`. Hash on-chain: `sha256(model.safetensors || hotkey) = e9a2eb8275f5f8fa0efb4eb5a6a395bb980945a7df2e29d4becc44fbb0a4eb6f`. Preprocesado: `EfficientNet_V2_L_Weights.IMAGENET1K_V1.transforms()` (redimensionado bicúbico a 480, recorte central de 480, media = desviación = 0,5). Fechas del repositorio: creado el 2026-09-24, actualizado el 2026-09-24.

## Arquitectura y entrenamiento

La arquitectura es EfficientNetV2-L, una red convolucional que combina bloques Fused-MBConv en las etapas iniciales y MBConv con atención SE en las profundas, con escalado compuesto de profundidad, anchura y resolución. El punto de partida es la implementación de torchvision con la cabeza de 1.000 clases de ImageNet; el modelo se carga con `model.load_state_dict(load_file("model.safetensors"))` sobre `efficientnet_v2_l(weights=None)`, lo que implica que la topología es idéntica a la canónica y que solo cambian los pesos.

El autor indica que el ajuste se hizo con entrenamiento adversario (tag `adversarial-training`) para la subred Perturb de Bittensor (netuid 26). No se especifican en la información disponible el número de tokens o imágenes vistas, la composición del dataset, el tipo de ataques usados durante el entrenamiento (por ejemplo, PGD o FGSM), la magnitud de la perturbación, la proporción de ejemplos adversarios ni si hubo fases adicionales de ajuste. Tampoco se detalla si se emplearon técnicas de aumento de datos distintas de las del preprocesado declarado. La innovación declarada es, por tanto, el propio régimen de entrenamiento adversario y la trazabilidad on-chain de los pesos mediante el hash que combina el fichero de pesos y el hotkey del minero.

## Capacidades

- Clasificación de imágenes en 1.000 categorías de ImageNet-1k, con entrada fija de 480x480 píxeles y preprocesado específico (bicúbico a 480, recorte central, normalización con media y desviación 0,5).
- Robustez frente a perturbaciones adversarias, derivada del entrenamiento adversario declarado en la model card.
- Extracción de representaciones: al conservar la topología de EfficientNetV2-L, la salida previa al clasificador puede usarse como embedding visual para tareas posteriores.
- Integración en la subred Perturb (netuid 26) de Bittensor como artefacto de minero, con verificación de integridad mediante hash.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión-lenguaje, tool calling, function calling, capacidades de agente, modo de pensamiento, audio ni diálogo multi-turno. No es un modelo generativo ni conversacional.
- Cobertura multilingüe: no aplica; las etiquetas de salida son las clases de ImageNet-1k, en inglés.

## Casos de uso

- Clasificación por lotes en pipelines de ingesta de imágenes: el modelo etiqueta cada imagen en una de las 1.000 clases de ImageNet-1k con un preprocesado determinista (recorte central a 480), lo que facilita su integración como etapa fija en un DAG de procesamiento.
- Minería en la subred Perturb (netuid 26) de Bittensor: el repositorio incluye el hotkey y el hash on-chain, de modo que el artefacto está pensado para publicarse y verificarse dentro de ese mecanismo de incentivos.
- Anotación asistida de datasets: usar las predicciones como preetiquetado para reducir el coste de anotación humana antes de una revisión manual, aprovechando que el modelo cubre categorías genéricas de objetos, animales y escenas.
- Evaluación de robustez adversaria: servir como punto de comparación frente a un EfficientNetV2-L estándar de torchvision para medir el efecto del entrenamiento adversario sobre la precisión limpia y bajo ataque, siempre que el integrador aporte su propio conjunto de evaluación.
- Moderación y filtrado de contenido aproximado: clasificación rápida de imágenes entrantes en categorías genéricas para descartar o marcar contenido antes de una revisión más costosa, teniendo en cuenta que solo cubre las clases de ImageNet-1k.
- Backbone para transfer learning: congelar el extractor de características y entrenar una cabeza nueva para una taxonomía propia (por ejemplo, defectos en inspección industrial o categorías de catálogo), partiendo de los pesos publicados.
- Verificación de procedencia en despliegues distribuidos: recalcular `sha256(model.safetensors || hotkey)` para comprobar que los pesos servidos coinciden con los registrados on-chain antes de incorporarlos a producción.
- Recuperación visual y etiquetado en comercio electrónico: generar embeddings con la penúltima capa para búsqueda por similitud o agrupación de imágenes de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye la arquitectura de partida, la licencia, el preprocesado, el hotkey del minero y el hash on-chain; no se aportan valores de precisión top-1 o top-5 en ImageNet, ni métricas bajo ataque adversario (por ejemplo, precisión frente a PGD o FGSM), ni comparaciones con el EfficientNetV2-L original de torchvision.

## Requisitos de hardware

- VRAM estimada en inferencia: los pesos ocupan aproximadamente 0,45-0,48 GB en precisión de 32 bits (119 millones de parámetros). Con entradas de 480x480, la VRAM total por lote pequeño se sitúa típicamente en el rango de 1-2 GB, aunque esta cifra no está confirmada en la información disponible.
- En precisión reducida (FP16/BF16) los pesos bajan a unos 0,24 GB, pero no se documenta una receta oficial de conversión.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de memoria es suficiente para inferencia por lotes pequeños; la arquitectura es viable en RTX 3060, RTX 4070, RTX 4090, A100 y H100. El modelo cabe sobradamente en GPU de consumo, incluidas gamas de entrada con 4 GB o más.
- Es viable también en CPU para inferencia puntual, con latencias mucho mayores que en GPU; no se publican cifras concretas.
- Opciones de despliegue: PyTorch con el código de carga de safetensors incluido en la model card, TorchScript, exportación a ONNX con ONNX Runtime, TensorRT para maximizar rendimiento y servidores de modelo como TorchServe, BentoML o Triton Inference Server. Las herramientas orientadas a modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no aplican a este modelo.
- Latencia y throughput: no disponible. No se han publicado mediciones de latencia, throughput ni consumo energético.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qhoenix/copper-finch | 119.027.848 | 480x480 píxeles, 1.000 clases ImageNet-1k | No disponible | Apache-2.0 | Hugging Face, 0 descargas |
| EfficientNetV2-L estándar (torchvision, `IMAGENET1K_V1`) | Misma topología, por lo que el recuento de parámetros es equivalente | 480x480 píxeles, 1.000 clases ImageNet-1k | No disponible en la información proporcionada | No disponible en la información proporcionada | Pesos distribuidos con torchvision |
| Otras CNN o transformers de visión de tamaño similar (ConvNeXt-L, ViT-L/16) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

La única comparación sustentada por los datos recibidos es con el EfficientNetV2-L canónico de torchvision, del que este modelo hereda la topología y al que añade un ajuste con entrenamiento adversario. Para el resto de alternativas no se dispone de cifras verificables en la información proporcionada, por lo que no se incluyen valores numéricos.

## Limitaciones y advertencias

- Modelo de visión, no de lenguaje: no genera texto, no razona, no ejecuta código, no soporta tool calling ni agentes. Cualquier expectativa en ese sentido es incorrecta.
- Dominio cerrado: la salida se limita a las 1.000 clases de ImageNet-1k. Las categorías fuera de ese conjunto no se detectan y se forzarán a la clase más parecida, con riesgo de etiquetado erróneo.
- El entrenamiento adversario suele implicar un compromiso entre precisión limpia y robustez, pero no se publican métricas que permitan cuantificarlo; hay que evaluarlo antes de asumir que mejora la fiabilidad.
- Riesgo de sesgo heredado de ImageNet-1k: desequilibrios de clase, sobrerrepresentación de determinadas culturas y objetos, y baja cobertura de categorías no occidentales o especializadas.
- Sin resultados de benchmarks ni evaluaciones independientes: el modelo tiene 0 descargas y 0 likes, y la model card no documenta métricas, hiperparámetros de entrenamiento ni el esquema de ataque adversario empleado.
- Preprocesado no negociable: usar `EfficientNet_V2_L_Weights.IMAGENET1K_V1.transforms()`; cualquier otra normalización o resolución degradará las predicciones.
- Trazabilidad: la integridad del fichero se verifica con `sha256(model.safetensors || hotkey)`, no con el hash del fichero aislado; calcular el hash de otra forma no reproduce el valor publicado.
- Licencia Apache-2.0: permite uso comercial y modificación, con obligación de conservar avisos de licencia y atribución; no se documentan restricciones adicionales por parte del autor.
- Carga de pesos: es necesario instanciar la arquitectura con `weights=None` y cargar el `state_dict`; no se debe esperar que `weights="DEFAULT"` cargue estos pesos.
- Fechas de publicación poco habituales (2026-09-24 en los metadatos del repositorio): conviene verificar la vigencia y el estado del repositorio antes de depender de él en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qhoenix/copper-finch
- Perfil del autor en Hugging Face: https://huggingface.co/qhoenix
- Otro modelo del mismo autor: https://huggingface.co/qhoenix/m7
- Subred Perturb: https://perturbai.io
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos adicionales asociados a este modelo. Los resultados de búsqueda correspondientes a perfiles de redes sociales no relacionados y a sitios de nombre similar no se incluyen por no estar vinculados al modelo.
