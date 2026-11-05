# gladia/qat-transfer-timm

## Resumen

`gladia/qat-transfer-timm` es una colección de checkpoints de visión por computador publicada por Gladia (empresa francesa de infraestructura de audio por IA, fundada en 2022 en Rennes) como material reproducible del artículo "Zero-Shot Quantization via Weight-Space Arithmetic" (NeurIPS 2026). No es un modelo único, sino un repositorio de 351,3 GB que contiene pares de finetunes de precisión completa (FP) y de entrenamiento consciente de cuantización (QAT) a 3 bits para siete backbones de timm (ViT, DeiT-III y Swin) sobre 22 datasets de clasificación de imágenes.

El problema que resuelve es el coste de aplicar QAT: en lugar de reentrenar el modelo receptor con datos propios, el método calcula el vector de cuantización `QV = QAT - FP` a partir de una tarea donante y lo suma al checkpoint FP de la tarea receptora (`FP_receiver + lambda * QV_donor`). Con `lambda = 1` no se necesita ningún dato de la tarea receptora, y el resultado recupera buena parte del beneficio del QAT bajo PTQ de 3 bits por canal.

Es relevante porque convierte la cuantización agresiva a 3 bits en un procedimiento puramente aritmético sobre pesos, sin datos ni reentrenamiento, algo directamente aplicable a despliegues de clasificación de imágenes en hardware restringido. La licencia es Apache-2.0, aunque los checkpoints derivan de pesos upstream con licencias Apache-2.0 (ViT, DeiT-III) y MIT (Swin).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT), DeiT-III y Swin Transformer, vía timm |
| Parametros totales | Variable por backbone: ViT-B/16 y DeiT-III-B/16 (86 M aprox.), ViT-L/16 y DeiT-III-L/16 (307 M aprox.), Swin-B (88 M aprox.), Swin-L (197 M aprox.), ViT-H/14 (632 M aprox.); cifras de referencia de timm, no verificadas en la model card |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificación de imágenes con entrada 224x224) |
| Tipos de cuantizacion | 3 bits, por canal, con la cabeza de clasificación sin cuantizar; QAT con STE y PTQ en evaluación |
| Idiomas soportados | No disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (upstream ViT y DeiT-III Apache-2.0; Swin MIT) |
| Formato de pesos | State dicts de PyTorch (`.pt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

Los backbones son transformers de visión estándar de timm: ViT con parches 16x16 o 14x14 preentrenado en ImageNet-21k, DeiT-III destilado en ImageNet-1k y Swin con ventanas de atención de 7x7 preentrenado en ImageNet-22k y afinado en ImageNet-1k. Para cada combinación de backbone y dataset se publican dos finetunes: uno en precisión completa y otro con QAT de 3 bits por canal (straight-through estimator), guardado sin los wrappers de cuantización para que ambos checkpoints compartan exactamente el mismo conjunto de claves.

La configuración de finetuning es común: AdamW con `lr=1e-5`, `wd=0.1`, sin label smoothing, recorte de gradiente a 1.0, semilla 2038 y el schedule 1x (`mult=1`). Los modelos grandes se entrenaron con batch por dispositivo menor y acumulación de gradiente, y el directorio `optim=` registra el tamaño de batch efectivo. Los 22 datasets cubren dominios muy distintos: coches (Cars), texturas (DTD), satélite (EuroSAT, RESISC45), señales de tráfico (GTSRB), dígitos (MNIST, SVHN, EMNIST, KMNIST), escenas (SUN397), comida (Food101), flores (Flowers102), expresiones faciales (FER2013), histopatología (PCAM), mascotas (OxfordIIITPet), sentimiento visual (RenderedSST2), moda (FashionMNIST), TinyImageNet e ImageNet.

La innovación técnica es el vector de cuantización transferible: la diferencia entre los pesos QAT y FP de una tarea donante se aplica al checkpoint FP de otra tarea receptora, con la cabeza de clasificación preservada de la receptora por ser específica de tarea. El repositorio incluye además cinco donantes de PV-Tuning (`delta=0.0, tau=0.01`) para el experimento de transferencia alternativo; los otros 17 donantes PV se perdieron por un fallo de almacenamiento y deben regenerarse con `code/src/vision/ilharco_timm_supervised/finetune_pv.py` con la misma configuración y semilla.

## Capacidades

- Clasificación de imágenes supervisada en 22 datasets de dominio diverso, con checkpoints independientes por backbone y dataset.
- Inferencia a 3 bits por canal con PTQ, manteniendo la cabeza de clasificación en precisión completa.
- Transferencia de cuantización zero-shot entre tareas mediante aritmética de pesos, sin datos del receptor cuando `lambda = 1`.
- Ajuste del compromiso precisión/cuantización variando `lambda` entre 0 y 1 con el vector de cuantización del donante.
- Compatibilidad directa con el ecosistema timm: los checkpoints se cargan como state dicts estándar de PyTorch.
- Soporte de donantes alternativos vía PV-Tuning (5 de 22 disponibles) para experimentos de transferencia comparados.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, visión generalista ni capacidades multilingües: es un conjunto de clasificadores de imagen, no un modelo generativo.

## Casos de uso

- Despliegue de clasificadores de imagen en dispositivos con memoria muy limitada: aplicar el checkpoint QAT de 3 bits del backbone y dataset correspondientes reduce el peso de los pesos lineales aproximadamente 5 veces frente a FP16, adecuado para microcontroladores y NPUs de baja capacidad.
- Adaptación de un clasificador a un dominio nuevo sin datos etiquetados: si se dispone de un checkpoint FP afinado para el dominio receptor, se le suma el `QV` de un donante cercano (por ejemplo, EuroSAT a un receptor de imágenes aéreas) y se aplica PTQ de 3 bits, evitando recolectar y etiquetar datos.
- Investigación en cuantización: el par FP/QAT por backbone y dataset permite reproducir experimentos de transferencia de cuantización con semilla fija (2038) y configuración documentada, útil para comparar métodos de QAT frente a PTQ.
- Prototipado rápido de pipelines de clasificación con timm: descargar solo un backbone con `hf download ... --include "*/vit_base_patch16_224_orig_in21k/*"` y cargar el state dict en el modelo timm equivalente para tener un clasificador afinado listo para evaluar.
- Benchmarking de robustez de cuantización por dominio: los 22 datasets permiten medir la degradación de precisión a 3 bits en dominios muy distintos (texturas, satélite, histopatología, dígitos) con un protocolo común.
- Estudio de interferencia entre tareas en el espacio de pesos: comparar la transferencia de `QV` entre pares de datasets afines (CIFAR10/CIFAR100, MNIST/EMNIST/KMNIST) y dispares (PCAM/Food101) para caracterizar cuándo la aritmética de pesos funciona.
- Docencia y reproducción de resultados: el repositorio incluye el grafo de investigación público con la pregunta, el método y el script de cada fase, lo que facilita replicar el artículo en un curso o laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el método y la configuración, pero no incluye tablas de precisión (top-1) para los checkpoints FP, QAT ni para la transferencia `FP_receiver + lambda * QV_donor`. El artículo de referencia (arXiv:2604.03420) es la fuente esperada de esas cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: ViT-B/16 y DeiT-III-B/16 en FP32 unos 0,35 GB de pesos; en 3 bits por canal, del orden de 0,04-0,05 GB para las capas lineales cuantizadas más la cabeza en precisión completa. ViT-L/16 y Swin-L en FP32 unos 1,2 GB; ViT-H/14 unos 2,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para ViT-B y DeiT-III-B; 8 GB o más para ViT-L, Swin-L y ViT-H. Una RTX 4090, A100 o H100 es sobredimensionada para estos backbones en inferencia, pero útil para entrenar o regenerar checkpoints.
- Cabe en GPU de consumo: sí, todos los backbones caben en tarjetas de 8 GB o menos en FP16 y en 3 bits, incluidas GTX 1660, RTX 3050 y superiores.
- Opciones de despliegue: PyTorch nativo (los checkpoints son state dicts), timm para la definición del modelo, y exportación a ONNX o TorchScript para servir con ONNX Runtime o TensorRT. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que son herramientas de modelos de lenguaje.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gladia/qat-transfer-timm | 86 M - 632 M según backbone | Imagen 224x224 | 3 bits por canal (QAT y PTQ) con transferencia zero-shot | Apache-2.0 (upstream mixto Apache-2.0 / MIT) | HuggingFace, 351,3 GB, 0 descargas |
| timm ViT/DeiT-III/Swin originales | 86 M - 632 M | Imagen 224x224 | Solo FP (FP32/FP16) | Apache-2.0 / MIT | HuggingFace y GitHub, ampliamente usados |
| Checkpoints QAT convencionales por tarea | Igual al backbone | Imagen 224x224 | 3-8 bits, requieren datos de la tarea | Según backbone | Depende del autor; no estandarizados |
| Modelos de visión generativos (p. ej. CLIP, SigLIP) | 100 M - 1 B aprox. | Imagen + texto | FP16, INT8 | Varía | HuggingFace; tarea distinta (zero-shot abierto) |

La comparación relevante es con los checkpoints timm originales, de los que estos derivan, y con pipelines de QAT por tarea. La diferencia principal no es de arquitectura ni de tamaño, sino de método: aquí el QAT se transfiere entre tareas por aritmética de pesos, mientras que un QAT convencional exige datos y entrenamiento del receptor. No se dispone de cifras de precisión para cuantificar la diferencia frente a esas alternativas.

## Limitaciones y advertencias

- El repositorio no contiene un modelo generativo ni un clasificador generalista: cada checkpoint está atado a un backbone y un dataset concretos, y la cabeza de clasificación solo predice las clases de ese dataset.
- El método asume que donante y receptor comparten arquitectura y conjunto de claves exacto; no se documenta transferencia entre backbones distintos.
- Los resultados de transferencia dependen de la afinidad entre tareas; no se han publicado métricas de degradación para pares de dominios dispares en la información disponible.
- Riesgo de sesgo heredado de los datasets de finetuning (FER2013 en expresiones faciales, PCAM en histopatología, GTSRB en señales de tráfico), cada uno con sus propios términos de uso y posibles desequilibrios de clase.
- Solo 5 de los 22 donantes PV-Tuning están incluidos; los otros 17 deben regenerarse, lo que impide reproducir el experimento PV completo solo con la descarga.
- El tamaño del repositorio (351,3 GB) hace inviable una descarga completa en muchos entornos; conviene usar `--include` para bajar un único backbone.
- La licencia Apache-2.0 del repositorio no sustituye a las de los pesos upstream (Swin es MIT) ni a los términos de los datasets de finetuning; hay que revisar cada model card antes de redistribuir.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria publicada; la fecha de creación (2026-10-03) y las referencias a NeurIPS 2026 deben tratarse como información del autor.
- No hay garantías de latencia ni de soporte en runtimes de producción más allá de PyTorch y timm.

## Enlaces

- HuggingFace: https://huggingface.co/gladia/qat-transfer-timm
- Repositorio de código: https://github.com/gladia-research-group/qat-transfer
- Artículo (arXiv): https://arxiv.org/abs/2604.03420
- OpenReview: https://openreview.net/forum?id=wrUEnnSgXa
- Grafo de investigación: https://flywheel.paradigma.inc/node/de486ca0-8e83-4041-bbf6-0b0be565435b
- Repos paralelos: https://huggingface.co/gladia/qat-transfer-open_clip y https://huggingface.co/gladia/qat-transfer-text
- Web de Gladia: https://www.gladia.io/
- Documentación de Gladia: https://docs.gladia.io/chapters/introduction
