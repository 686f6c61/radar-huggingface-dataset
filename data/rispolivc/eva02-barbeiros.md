# rispolivc/eva02-barbeiros

## Resumen

rispolivc/eva02-barbeiros es un modelo de clasificación de imágenes publicado en HuggingFace por el usuario rispolivc. Se trata de un ajuste fino (fine-tuning) sobre la arquitectura EVA-02, la familia de Vision Transformers desarrollada por BAAI, tal y como se distribuye en la librería `timm`. El repositorio contiene 85.761.027 parámetros (dato real leído de los pesos `safetensors`) y se publica bajo licencia Apache 2.0, lo que en principio permite uso comercial sin restricciones adicionales.

Por el tamaño de parámetros, la variante es compatible con una configuración "base" de EVA-02 (ViT con parches de 14x14), aunque la model card no confirma ni el nombre exacto del checkpoint de partida ni la resolución de entrada. El nombre del modelo ("barbeiros") sugiere un dominio de aplicación concreto (barberías, peluquería o un conjunto de datos temático), pero la model card no documenta el dataset de entrenamiento, el número de clases ni las etiquetas de salida.

El modelo apenas tiene tracción en la comunidad: 0 descargas y 0 likes en el momento de la consulta, y la model card es prácticamente un esqueleto vacío (solo etiquetas y el título). Esto lo convierte en un artefacto de uso potencialmente personal o experimental, no en un modelo validado para producción. Cualquier evaluación seria requeriría inspeccionar los pesos para recuperar la configuración de `timm` y probar el modelo con datos propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (familia EVA-02, implementación `timm`); variante exacta no confirmada en la model card |
| Parámetros totales | 85.761.027 (dato real, safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; no se documenta la resolución de entrada) |
| Tipos de cuantización | no documentados en la model card; al ser PyTorch/`timm` admite las herramientas estándar (fp16, int8 dinámico, ONNX Runtime, TensorRT, OpenVINO) |
| Idiomas soportados | no aplica (clasificación de imágenes; no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (confirmado en las etiquetas del repo); framework `timm` / PyTorch |
| Tarea (pipeline) | image-classification |
| Número de clases de salida | no disponible |
| Resolución de entrada | no disponible |
| Preprocesado (media, desviación, interpolación) | no disponible |
| Tamaño del repositorio | 1,4 GB |
| Fecha de creación en HuggingFace | 2026-09-24 (según metadatos del repo) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

EVA-02 es una familia de Vision Transformers desarrollada por BAAI que se apoya en el preentrenamiento por modelado enmascarado de imágenes (MIM) con reconstrucción de características: en lugar de predecir píxeles, el modelo aprende a reconstruir las representaciones latentes de modelos maestros como CLIP y DINO a partir de parches ocultos. Sobre esa receta, EVA-02 incorpora mejoras de eficiencia y estabilidad respecto a EVA-01, con atención de tipo ViT "vanilla", codificación posicional rotatoria (RoPE) y bloques FFN con SwiGLU y normalización previa por subcapa. Estas variantes se distribuyen habitualmente a través de `timm` con configuraciones que van de *tiny* a *giant* y resoluciones de 224 a 448 píxeles.

Del modelo concreto que nos ocupa no hay información de entrenamiento publicada. La model card no indica el checkpoint base, el número de tokens o imágenes vistas, la composición del dataset, si hubo aumento de datos, ni si se aplicaron técnicas de ajuste como fine-tuning completo, *linear probing* o destilación. Tampoco se documentan hiperparámetros (learning rate, épocas, *scheduler*) ni métricas de validación. Con 85,76 M de parámetros, el modelo es consistente con una configuración de tipo "base" (aproximadamente 86-88 M en las variantes EVA-02 base de `timm`), pero esa correspondencia es una inferencia a partir del recuento de parámetros, no un dato confirmado por el autor. La ausencia del mapeo `id2label` impide además saber qué clases predice la cabeza de clasificación.

## Capacidades

- Clasificación de imágenes: el modelo devuelve una distribución sobre un conjunto de clases cerrado, definido por el ajuste fino. El número y la semántica de esas clases no están documentados.
- Extracción de *embeddings* visuales: al usar el *backbone* sin la cabeza de clasificación se obtienen representaciones de dimensión fija (habitualmente 768 en configuraciones base), útiles para búsqueda por similitud, agrupamiento o deduplicación.
- Aprendizaje por transferencia: al estar en formato `timm`, la cabeza puede reemplazarse para reentrenar sobre un conjunto de clases distinto con un coste bajo.
- Inferencia por lotes y en GPU/CPU: es un modelo convolucional/transformer de pequeño tamaño, apto para *throughput* alto en lote.
- Soporte de *tool calling* / *function calling*: no aplica (modelo de visión, sin interfaz de texto).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo *thinking*, visión-lenguaje, audio): no aplica; no hay componente generativo ni multimodal.

## Casos de uso

- Preetiquetado para anotación humana: ejecutar el modelo sobre un gran lote de imágenes para generar etiquetas iniciales que después se revisan y corrigen, reduciendo el coste de anotación. Requiere validar antes la calidad del clasificador, algo que la model card no documenta.
- Filtrado y curación de datasets: usar el modelo como clasificador binario o multiclase para descartar imágenes irrelevantes antes de entrenar otro modelo, aprovechando que se puede ejecutar en CPU a bajo coste.
- Búsqueda visual por similitud: extraer los *embeddings* del *backbone* y construir un índice vectorial (FAISS, Qdrant, pgvector) para recuperar imágenes parecidas en un catálogo.
- Control de calidad en un flujo industrial o de servicios: clasificar automáticamente capturas de producto, acabados o resultados de un proceso (por ejemplo, verificación de un corte de pelo en un flujo de una barbería) y enrutar los casos dudosos a revisión manual, siempre que el conjunto de clases coincida con el del ajuste.
- Moderación y triaje de contenido: descartar o marcar imágenes que no cumplen una política interna dentro de un *pipeline* de ingesta, con un umbral de confianza configurable por clase.
- Clasificación en el *edge*: exportar el modelo a ONNX o TensorRT con cuantización int8 y desplegarlo en dispositivos con pocos recursos, dado que los pesos en fp32 ocupan apenas unos 343 MB.
- *Active learning*: usar las probabilidades de salida para seleccionar las imágenes con mayor incertidumbre y enviarlas a anotación, mejorando iterativamente el propio clasificador.
- Integración como microservicio: exponerlo detrás de Triton Inference Server o TorchServe para servir clasificaciones a otros sistemas, con versionado del *preprocesado* fijado en el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de validación (exactitud, F1, top-5), ni comparaciones con el checkpoint base, ni evaluación sobre conjuntos estándar (ImageNet, CIFAR, etc.). Tampoco se documentan latencia ni *throughput*.

## Requisitos de hardware

- Tamaño de pesos: 85.761.027 parámetros equivalen a aproximadamente 343 MB en fp32, 172 MB en fp16 y 86 MB en int8.
- VRAM estimada para inferencia: menos de 1 GB con lote 1 en fp32 (pesos más activaciones); entre 2 y 4 GB con lotes grandes y resolución alta. La cifra exacta depende de la resolución de entrada, que no está documentada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria. Cabe con holgura en tarjetas de consumo como RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100, L4, T4) donde el cuello de botella será el *preprocesado* de imágenes antes que el propio modelo.
- Ejecución sin GPU: viable en CPU para lotes moderados, y en Apple Silicon mediante MPS.
- Opciones de despliegue: `timm` y PyTorch de forma nativa, `transformers` con el pipeline `image-classification`, exportación a ONNX Runtime, TensorRT, OpenVINO o TorchScript, y servicio mediante Triton Inference Server o TorchServe. `torch.compile` es aplicable. vLLM y llama.cpp no son adecuados: están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. No se han publicado mediciones y la resolución de entrada desconocida impide estimarlas con rigor.

## Comparativa con modelos similares

La comparación de rendimiento no es posible porque no hay métricas publicadas para este modelo. La tabla recoge solo características objetivas y verificables.

| Modelo | Parámetros | Entrada típica | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| rispolivc/eva02-barbeiros | 85,76 M | no documentada | apache-2.0 | HuggingFace (0 descargas) | no disponible |
| EVA-02 base (BAAI, vía `timm`) | ≈86-88 M (aproximado) | 224-448 px | apache-2.0 | `timm` / HuggingFace (BAAI) | no comparable sin datos del ajuste |
| ViT-Base/16 (Google) | ≈86 M | 224 px | apache-2.0 (pesos originales) | `timm`, HuggingFace | no comparable sin datos del ajuste |
| ConvNeXt-Base | ≈89 M | 224 px | apache-2.0 | `timm`, HuggingFace | no comparable sin datos del ajuste |
| Swin-Base | ≈88 M | 224 px | apache-2.0 | `timm`, HuggingFace | no comparable sin datos del ajuste |

Nota: las cifras de parámetros de los modelos de referencia son aproximadas y proceden de sus respectivas fichas; este modelo podría diferir ligeramente en el número de parámetros de la cabeza de clasificación según el número de clases del ajuste.

## Limitaciones y advertencias

- Model card vacía: no se documentan datos de entrenamiento, número de clases, etiquetas, resolución de entrada ni preprocesado. Sin el mapeo `id2label`, las salidas del modelo no son interpretables sin inspeccionar los pesos.
- Sesgos desconocidos: al no conocerse la composición del dataset, no es posible evaluar sesgos demográficos, geográficos o de dominio. Un ajuste sobre un conjunto reducido o poco diverso tiende a sobrerrepresentar las condiciones presentes en ese conjunto.
- Riesgo de sobreajuste: con 85,76 M de parámetros y un nombre que sugiere un dominio muy específico, es probable que el modelo generalice mal fuera de la distribución de sus datos de entrenamiento. No hay métricas que lo confirmen o refuten.
- Alucinación: no aplica en el sentido generativo, pero sí existe el riesgo de clasificaciones erróneas con alta confianza. Un clasificador bien calibrado en su dominio puede producir probabilidades muy altas en entradas fuera de distribución.
- Idioma: no aplica; no hay componente textual.
- Licencia: apache-2.0 permite uso comercial, modificación y redistribución con atribución. No obstante, la licencia cubre el artefacto publicado, no la procedencia de los datos de entrenamiento, que el autor no declara; el usuario asume el riesgo legal derivado de un dataset no documentado.
- Falta de validación comunitaria: 0 descargas y 0 likes implican que no ha habido revisión por pares ni prueba por terceros. No debe considerarse un modelo listo para producción sin una evaluación propia.
- Reproducibilidad: sin la configuración de `timm`, el preprocesado y la resolución, los resultados no son reproducibles de forma fiable a partir de la información publicada.
- Fecha de creación inusual: los metadatos indican 2026-09-24, una fecha futura o mal generada, lo que resta fiabilidad a los metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rispolivc/eva02-barbeiros
- Paper de EVA-02 (BAAI, referencia de la arquitectura): https://arxiv.org/abs/2303.11331
- Repositorio de `timm` (implementación y pesos de la familia EVA-02): https://github.com/huggingface/pytorch-image-models
- Organización BAAI en HuggingFace (checkpoints EVA-02 de referencia): https://huggingface.co/BAAI
- Documentación del pipeline `image-classification` de Transformers: https://huggingface.co/docs/transformers/main/en/tasks/image_classification
