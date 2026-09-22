# monate615/perturb-sn26-v1

## Resumen

`monate615/perturb-sn26-v1` es un clasificador de imágenes publicado por el usuario monate615 en HuggingFace. Se trata de una instancia de EfficientNetV2-L (la implementación `efficientnet_v2_l` de torchvision, con cabeza de 1000 clases de ImageNet-1k) cuyos pesos han sido modificados mediante una perturbación espectral, según los metadatos `build` incluidos en la model card. El modelo está etiquetado como parte del "model track" de la subred Perturb (netuid 26) de Bittensor, un ecosistema descentralizado donde los mineros registran modelos y su hash on-chain.

El checkpoint tiene 119.027.848 parámetros (unos 119 M) en formato safetensors y un repositorio de 0,5 GB. No incorpora ningún texto de documentación adicional: la model card se limita a indicar la arquitectura base, la hotkey del minero, el hash sha256 del modelo, el pipeline de preprocesado exacto y el registro de la perturbación aplicada. No se documentan dataset de entrenamiento, procedimiento de ajuste, ni resultados de evaluación.

Su relevancia es acotada y muy específica: sirve como artefacto reproducible dentro de la subred Perturb (para verificar el hash on-chain y comparar perturbaciones de pesos), y como posible punto de partida para experimentos de robustez adversarial. Con 0 descargas y 0 "likes", no existe validación externa de su comportamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-L (CNN con bloques Fused-MBConv y MBConv + squeeze-and-excitation), implementación `torchvision.models.efficientnet_v2_l` |
| Parámetros totales | 119.027.848 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes; entrada fija de 480 × 480 píxeles) |
| Tipos de cuantización | no disponible (solo se publican pesos en safetensors, presumiblemente FP32) |
| Idiomas soportados | no aplica (modelo de visión); las etiquetas de clase están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, cargable con `safetensors.torch.load_file`) |
| Clases de salida | 1000 (ImageNet-1k) |
| Preprocesado requerido | `EfficientNet_V2_L_Weights.IMAGENET1K_V1.transforms()`: redimensionado bicúbico a 480, center crop 480, media = desviación = 0,5 |
| Tamaño del repositorio | 0,5 GB |
| Librería declarada | torchvision |
| Pipeline declarado | image-classification |
| Hash on-chain | sha256(model.safetensors \|\| hotkey) = `c9c5cf84d644bbed510523917fb014924f30aa49c5a47eea72ef1ae12e521911` |
| Hotkey del minero | `5CanHPjeeYhKzNDNbuJSQgpFoDbYu7r1S9haWqxRxv3QoJtC` |

## Arquitectura y entrenamiento

La arquitectura base es EfficientNetV2-L, una red convolucional diseñada mediante búsqueda de arquitectura neuronal (NAS) con escalado compuesto. Combina bloques Fused-MBConv en las etapas iniciales (que fusionan convolución y expansión para aprovechar mejor las GPU modernas) con bloques MBConv con módulos de atención squeeze-and-excitation en las etapas profundas. Su preprocesado canónico trabaja a 480 × 480 píxeles, muy por encima de los 224 × 224 habituales en clasificadores tipo ResNet, lo que implica un coste de cómputo notablemente mayor por imagen. El modelo consume imágenes y devuelve un vector de logits sobre 1000 clases; no procesa texto ni secuencias.

Los metadatos del autor describen una alteración de los pesos, no un entrenamiento: `kernel: binom3@0.2`, `mode: spectral`, `passband_error: 0,0381`, `stopband_gain: 0,8101` y `weight_delta: 0,1479`. Estos valores indican que se aplicó un filtro (kernel binomial de orden 3 con factor 0,2) sobre los pesos en el dominio espectral, con una desviación relativa de pesos de aproximadamente el 14,8 % respecto al punto de partida. La etiqueta `adversarial-training` sugiere que el objetivo perseguido es la robustez frente a perturbaciones, pero el autor no documenta ni el conjunto de datos, ni el número de pasos de optimización, ni si hubo entrenamiento posterior a la perturbación, ni si existe un modelo base declarado. No hay información sobre RLHF/DPO (no aplicable a visión) ni sobre aumentos de datos.

## Capacidades

- Clasificación de imágenes en 1000 categorías de ImageNet-1k (salida de 1000 logits por imagen).
- Extracción de características intermedias: al ser una CNN estándar de torchvision, la salida del `avgpool` o de los bloques intermedios puede reutilizarse como embedding para tareas downstream (búsqueda por similitud, clustering, fine-tuning).
- Inferencia determinista con un pipeline de preprocesado fijado explícitamente por el autor (aspecto relevante para reproducir resultados).
- Robustez adversarial: el modelo está etiquetado con `adversarial-training` y `perturb`, pero no se aporta ninguna evaluación que cuantifique dicha robustez.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No soporta generación de texto, código, matemáticas, audio ni vídeo.
- No incluye detección de objetos, segmentación, OCR ni captioning; solo etiqueta única por imagen.

## Casos de uso

- Investigación en robustez adversarial: usar el checkpoint como baseline perturbado y comparar su tasa de acierto frente al EfficientNetV2-L original bajo ataques FGSM/PGD, midiendo si la perturbación espectral mejora o degrada la robustez. El `weight_delta` de 0,148 permite reproducir exactamente la magnitud de la modificación.
- Minería y validación en la subred Perturb (netuid 26) de Bittensor: el modelo está pensado para ejecutarse dentro del "model track" de esa subred; el hash sha256 ligado a la hotkey permite verificar on-chain que el artefacto servido es el registrado.
- Backbone para fine-tuning en dominios concretos: con 119 M de parámetros cabe en una GPU de consumo y puede reentrenarse la cabeza (o las últimas etapas) para clasificación especializada (defectos industriales, especies, productos) cuando no se dispone de un modelo preentrenado específico.
- Extracción de embeddings para búsqueda visual: congelar el modelo y usar las features previas a la capa lineal para indexar un catálogo de imágenes y recuperar similares por distancia coseno.
- Componente de filtrado previo en pipelines de datos: clasificar imágenes a escala en un ETL (por ejemplo, descartar o etiquetar automáticamente imágenes según su categoría ImageNet) antes de pasarlas a un modelo mayor.
- Reproducción y auditoría de artefactos: el repositorio incluye el hash on-chain y el pipeline de preprocesado exacto, lo que permite montar un test de integridad en CI que compruebe que los pesos descargados coinciden con el hash declarado.
- Pruebas de latencia y despliegue en edge: al ser un modelo de 119 M con entrada 480 × 480, sirve como caso de prueba realista para medir throughput en GPUs de gama baja o en aceleradores de inferencia (TensorRT, OpenVINO) antes de escalar a modelos mayores.
- Evaluación comparativa de pipelines de preprocesado: dado que el autor fija resize bicúbico a 480, center crop 480 y normalización con media = desviación = 0,5, el modelo es útil para medir cuánto degrada el resultado un preprocesado distinto al canónico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye exactitud en ImageNet-1k, ni resultados de robustez frente a ataques, ni métricas de calibración. Tampoco se dispone de comparación con el EfficientNetV2-L original (pesos `IMAGENET1K_V1` de torchvision) que permita cuantificar el impacto de la perturbación espectral.

## Requisitos de hardware

- Peso de los pesos: aproximadamente 476 MB en FP32 (119 M × 4 bytes) y 238 MB en FP16/BF16. Estas cifras son aritmética directa sobre el número de parámetros; la cuantización no está publicada por el autor.
- VRAM estimada para inferencia: por debajo de 2 GB con lote 1 en FP16 incluyendo activaciones a 480 × 480; la resolución de entrada es el factor dominante frente al tamaño del modelo. Estimación orientativa, no medida por el autor.
- Cabe en cualquier GPU de consumo con 4 GB o más de VRAM: RTX 3050, RTX 3060, RTX 4060, RTX 4070, RTX 4090. También en GPUs de datacenter (T4, A10, L4, A100, H100), donde el cuello de botella será el throughput de imágenes, no la memoria.
- Opciones de despliegue: PyTorch + torchvision (ruta soportada oficialmente por el autor), exportación a TorchScript, ONNX Runtime, NVIDIA TensorRT, NVIDIA Triton Inference Server, TorchServe y OpenVINO para CPU. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La entrada a 480 × 480 implica un coste por imagen notablemente superior al de clasificadores que operan a 224 × 224, por lo que conviene medirlo en el hardware objetivo antes de dimensionar un servicio.

## Comparativa con modelos similares

Los datos de parámetros proceden del conocimiento público de las implementaciones de torchvision; los de rendimiento no están disponibles para este checkpoint perturbado.

| Modelo | Parámetros | Entrada | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| perturb-sn26-v1 (este modelo) | 119,0 M | 480 × 480 | no aplica | no disponible | Apache 2.0 | HuggingFace (0 descargas) |
| EfficientNetV2-L (torchvision, sin perturbar) | 118,5 M | 480 × 480 | no aplica | no disponible en esta ficha | Apache 2.0 / BSD-3 (torchvision) | pesos oficiales de torchvision |
| EfficientNetV2-M | ~54,1 M | 480 × 480 | no aplica | no disponible en esta ficha | Apache 2.0 / BSD-3 | torchvision |
| EfficientNetV2-S | ~21,5 M | 384 × 384 | no aplica | no disponible en esta ficha | Apache 2.0 / BSD-3 | torchvision |
| ResNet-50 | ~25,6 M | 224 × 224 | no aplica | no disponible en esta ficha | Apache 2.0 / BSD-3 | torchvision |

No se han encontrado en la búsqueda web modelos comparables publicados por el mismo autor ni alternativas específicas de la subred Perturb con las que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de validación: 0 descargas, 0 "likes" y ninguna métrica publicada. No hay evidencia independiente de que el modelo funcione correctamente tras la perturbación.
- Pesos alterados: la perturbación espectral documentada (`passband_error` 0,0381, `stopband_gain` 0,8101, `weight_delta` 0,1479) modifica los pesos en un 14,8 % relativo. La exactitud puede ser inferior a la del EfficientNetV2-L original, y no se aporta ninguna medida que lo confirme o desmienta.
- Entrenamiento no documentado: se desconoce el dataset, si hubo ajuste fino tras la perturbación y qué objetivo de robustez se perseguía. La etiqueta `adversarial-training` no va acompañada de resultados de ataques.
- Sesgos: al derivar de pesos preentrenados en ImageNet-1k, hereda los sesgos de ese conjunto (sobrerrepresentación de determinadas culturas, objetos y contextos occidentales; clases desequilibradas). No hay ningún análisis de sesgo específico para este checkpoint.
- Riesgo de error en producción: es un clasificador de 1000 clases cerradas. Cualquier imagen fuera de ese vocabulario se forzará a una de las clases existentes, con confianza potencialmente alta. No debe usarse como detector de "desconocido" sin umbral de confianza calibrado.
- Dependencia estricta del preprocesado: el autor fija redimensionado bicúbico a 480, center crop 480 y media = desviación = 0,5. Cualquier otra normalización (por ejemplo, la media/desviación estándar de ImageNet) alterará las predicciones.
- Restricciones lingüísticas: no procesa texto; las etiquetas de salida están en inglés.
- Licencia: el modelo se publica bajo Apache 2.0, lo que permite uso comercial, pero conviene revisar por separado los términos de la subred Perturb (netuid 26) y de los pesos base de torchvision. Además, si el propósito es participar en la subred, el hash está vinculado a una hotkey concreta: modificar los pesos o la hotkey invalida la verificación on-chain.
- Sin garantías: el autor no ofrece ninguna garantía de exactitud, disponibilidad ni idoneidad para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/monate615/perturb-sn26-v1
- Perturb: https://perturbai.io
- Implementación de referencia de EfficientNetV2-L en torchvision (documentación, no procedente de la búsqueda web): https://pytorch.org/vision/stable/models.html
- Nota sobre la búsqueda web: los resultados devueltos corresponden a catálogos de repuestos de automoción del fabricante Wega (wega.com.ar, wegamotors.com) y no guardan relación alguna con este modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a `perturb-sn26-v1` o al usuario monate615.
