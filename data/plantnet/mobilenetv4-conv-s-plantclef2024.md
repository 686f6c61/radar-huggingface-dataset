# PlantNet/mobilenetv4-conv-s-plantclef2024

## Resumen

El modelo `PlantNet/mobilenetv4-conv-s-plantclef2024` es un clasificador de imágenes compacto especializado en la identificación de 7.806 especies de plantas de la flora del suroeste de Europa. Lo desarrolla PlantNet, el consorcio detrás de la plataforma de ciencia ciudadana Pl@ntNet, y se distribuye con licencia Apache 2.0. Su función es trasladar a hardware móvil y de borde la capacidad de reconocimiento botánico que hasta ahora requería modelos mucho más pesados.

Técnicamente es una MobileNetV4-Conv-S (arquitectura convolucional de la familia MobileNetV4, descrita en arXiv:2404.10518) con 12.517.598 parámetros, inicializada con pesos de ImageNet-1K y ajustada mediante destilación de conocimiento a partir de un profesor ViT-B/14 (92,58 M de parámetros) entrenado en Pl@ntCLEF2024. El estudiante se entrenó durante 50 épocas sobre el conjunto de entrenamiento de Pl@ntCLEF2024, con imágenes redimensionadas a un lado máximo de 800 píxeles y una entrada de inferencia fija de 512 × 512.

Su relevancia actual es práctica: ofrece una alternativa desplegable en ONNX Runtime sin PyTorch, con un grafo FP32 de tamaño reducido y salida sobre 7.806 clases, lo que permite integrar identificación florística en aplicaciones de campo, dispositivos sin GPU o pipelines de monitorización de biodiversidad donde el profesor ViT-B resulta demasiado costoso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileNetV4-Conv-S (CNN convolucional, familia MobileNetV4) |
| Parámetros totales | 12.517.598 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes) |
| Tipos de cuantización | no disponible en la información proporcionada; se distribuyen pesos FP32 (safetensors y ONNX FP32) |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas de especie están en `labels.json`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (vía `timm`), ONNX (`onnx/model.onnx`, FP32, batch dinámico, entrada fija 512 × 512) |
| Entrada | RGB 512 × 512, normalización ImageNet (media 0.485, 0.456, 0.406; desviación 0.229, 0.224, 0.225) |
| Salida | logits de dimensión 7.806 (una por especie) |
| Modelo base | `timm/mobilenetv4_conv_small.e2400_r224_in1k` (inicialización), `PlantNet/vit_base_patch14_reg4_dinov2_lvd142m.pc24_all` (profesor) |
| Tamaño del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura es una MobileNetV4 en su variante Conv-S, una red convolucional pura (sin atención) diseñada para eficiencia en dispositivos móviles. Se inicializa desde los pesos de ImageNet-1K de `timm/mobilenetv4_conv_small.e2400_r224_in1k` y se ajusta para clasificación de especies. La entrada es de 512 × 512 píxeles RGB, superior a la resolución típica de 224 × 224 de la variante original, lo que permite captar detalles morfológicos finos de hojas, flores y frutos.

El entrenamiento se realizó por destilación de conocimiento desde el profesor ViT-B/14 `PlantNet/vit_base_patch14_reg4_dinov2_lvd142m.pc24_all` (92,58 M de parámetros, entrada 518 × 518), siguiendo el método descrito en *Energy-Efficient Plant Monitoring via Knowledge Distillation* (arXiv:2604.27178). El estudiante se entrenó 50 épocas sobre el split de entrenamiento de Pl@ntCLEF2024, con imágenes redimensionadas a un lado máximo de 800 píxeles. El alcance taxonómico y geográfico es de 7.806 especies de la flora del suroeste de Europa. El repositorio incluye metadatos ONNX con el opset, el preprocesado, el resultado de paridad numérica y los hashes SHA-256 de los pesos fuente y del grafo ONNX.

## Capacidades

- Clasificación de imágenes de plantas en 7.806 especies de la flora del suroeste de Europa, devolviendo una distribución de probabilidad sobre las clases.
- Salida enriquecida por etiqueta: `labels.json` incluye, para cada índice de logit, el identificador de especie, el nombre científico, el género y la familia.
- Inferencia en CPU y hardware de borde mediante ONNX Runtime, sin dependencia de PyTorch ni de `timm`.
- Inferencia con batch dinámico en el grafo ONNX (dimensión espacial fija de 512 × 512).
- Integración nativa con `timm` (`timm.create_model("hf-hub:...")`) para uso en PyTorch.
- No soporta tool calling, agentes, generación de texto, visión general, audio ni razonamiento multi-paso: es exclusivamente un clasificador de imágenes de una sola etiqueta.
- El modelo está pensado para fotografías de una única observación de planta; las imágenes con varias especies requieren métodos multi-etiqueta externos (inferencia por teselas, agregación de puntuaciones y umbrales calibrados).

## Casos de uso

- Identificación de plantas en aplicaciones móviles de campo: el modelo clasifica una foto de una observación individual en 7.806 especies y puede ejecutarse en el propio dispositivo vía ONNX Runtime, sin conexión ni backend con GPU, gracias a sus 12,5 M de parámetros y su grafo FP32 compacto.
- Ciencia ciudadana y validación de observaciones: integrado en el backend de una plataforma tipo Pl@ntNet, sirve como primer filtro de especie propuesta para una imagen enviada por un usuario, dejando la confirmación final a revisores humanos o a un modelo mayor.
- Monitorización de biodiversidad en campo con hardware de bajo consumo: dispositivos tipo Raspberry Pi o cámaras trampa con aceleración de borde pueden ejecutar el modelo de forma continua para registrar la flora presente en parcelas de seguimiento.
- Preetiquetado de grandes herbarios y colecciones digitalizadas: el modelo genera etiquetas candidatas (top-5) sobre lotes de imágenes para que el personal curatorial revise y corrija, reduciendo el coste de catalogación manual.
- Filtrado previo en pipelines de investigación ecológica: antes de invocar un modelo más costoso (por ejemplo, el profesor ViT-B), el Conv-S descarta imágenes con baja confianza o las enruta según la distribución de probabilidad, ahorrando cómputo.
- Aplicaciones educativas y divulgativas: apps de excursionismo o botánica que explican la especie detectada a partir de una foto, usando la salida top-5 y los metadatos de género y familia de `labels.json`.
- Despliegue en entornos sin PyTorch: el ejemplo `onnx/inference.py` solo requiere `onnxruntime`, `huggingface_hub`, `Pillow` y `numpy`, lo que facilita su integración en servicios ligeros o contenedores mínimos.

## Benchmarks y rendimiento

Evaluación sobre el split de test de una sola especie de Pl@ntCLEF2026, según la model card:

| Modelo | Arquitectura | Parámetros | Resolución | Top-1 | Top-5 |
|---|---|---:|---:|---:|---:|
| Profesor Pl@ntCLEF | ViT-B/14 | 92,58 M | 518 × 518 | 75,59 % | 92,81 % |
| Estudiante Conv-S (este modelo) | MobileNetV4-Conv-S | 12,49 M | 512 × 512 | 62,50 % | 84,08 % |
| Estudiante Hybrid-M | MobileNetV4-Hybrid-M | 19,79 M | 512 × 512 | 71,40 % | 90,60 % |

El estudiante Conv-S pierde 13,09 puntos de Top-1 y 8,73 puntos de Top-5 respecto al profesor ViT-B, a cambio de reducir los parámetros en un factor de aproximadamente 7,4. Frente al estudiante Hybrid-M, pierde 8,90 puntos de Top-1 y 6,52 de Top-5 con un 37 % menos de parámetros.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 12,5 M de parámetros en FP32, los pesos ocupan aproximadamente 50 MB; el consumo real depende del runtime y del tamaño de batch.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, el modelo es apto para cualquier GPU consumer moderna (por ejemplo, RTX 4090) e incluso para CPU.
- Cabe en GPU consumer: sí, con margen amplio, dado el reducido número de parámetros y la resolución de entrada de 512 × 512.
- Opciones de despliegue: `timm` con PyTorch, ONNX Runtime (grafo FP32 con batch dinámico), y exportación a otros runtimes a partir de los pesos safetensors. No se mencionan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que no aplican a un clasificador de imágenes de este tipo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Resolución | Top-1 (Pl@ntCLEF2026) | Top-5 | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---:|---|---|
| `PlantNet/mobilenetv4-conv-s-plantclef2024` | MobileNetV4-Conv-S | 12,49 M | 512 × 512 | 62,50 % | 84,08 % | Apache 2.0 | Hugging Face, timm y ONNX |
| `PlantNet/mobilenetv4-hybrid-m-plantclef2024` | MobileNetV4-Hybrid-M | 19,79 M | 512 × 512 | 71,40 % | 90,60 % | no disponible en la información proporcionada | Hugging Face |
| `PlantNet/vit_base_patch14_reg4_dinov2_lvd142m.pc24_all` | ViT-B/14 | 92,58 M | 518 × 518 | 75,59 % | 92,81 % | no disponible en la información proporcionada | Hugging Face |

La comparativa se limita a los tres modelos evaluados en la propia model card sobre el mismo split; no se dispone de datos de otros clasificadores botánicos comparables en la información proporcionada.

## Limitaciones y advertencias

- Precisión inferior al profesor: 62,50 % de Top-1 frente a 75,59 %, una diferencia relevante en aplicaciones donde un error de identificación tenga consecuencias.
- Sesgo geográfico y taxonómico: el modelo solo cubre 7.806 especies de la flora del suroeste de Europa; las plantas fuera de ese ámbito geográfico o no incluidas en el conjunto de entrenamiento no pueden identificarse correctamente y producirán una asignación forzada a alguna de las clases conocidas.
- Diseñado para una sola especie por imagen: las fotografías con varias especies (parcelas de vegetación, imágenes compuestas) requieren métodos multi-etiqueta externos con teselado, agregación y umbrales calibrados; usarlo directamente sobre esas imágenes dará resultados poco fiables.
- Riesgo de confusión entre especies morfológicamente próximas: la salida es una distribución sobre 7.806 clases y no incorpora información geográfica ni fenológica; conviene revisar el top-5 y no solo el top-1.
- Dependencia del preprocesado: la normalización ImageNet y la resolución de 512 × 512 son fijas; desviarse de ellas degrada el rendimiento y rompe la paridad con el grafo ONNX.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan en la información disponible garantías, condiciones de atribución adicionales ni cláusulas específicas más allá de la licencia estándar.
- No se han documentado en la información proporcionada análisis de sesgos por especie, hábitat o calidad de imagen, ni evaluaciones fuera del split de Pl@ntCLEF2026.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PlantNet/mobilenetv4-conv-s-plantclef2024
- Modelo profesor: https://huggingface.co/PlantNet/vit_base_patch14_reg4_dinov2_lvd142m.pc24_all
- Modelo estudiante Hybrid-M: https://huggingface.co/PlantNet/mobilenetv4-hybrid-m-plantclef2024
- Pesos de inicialización ImageNet-1K: https://huggingface.co/timm/mobilenetv4_conv_small.e2400_r224_in1k
- Paper de MobileNetV4: https://arxiv.org/abs/2404.10518
- Paper del método de destilación: https://arxiv.org/abs/2604.27178
- Pl@ntCLEF2026: https://www.imageclef.org/PlantCLEF2026
- Pl@ntNet: https://plantnet.org/
- Pl@ntNet identify: https://identify.plantnet.org/
- Documentación de Pl@ntNet: https://docs.plantnet.org/
