# dronefreak/bdd100k-weather-mobilenetv4_conv_large

## Resumen

El modelo `dronefreak/bdd100k-weather-mobilenetv4_conv_large` es un clasificador de imágenes especializado en reconocer las condiciones meteorológicas de escenas de conducción. Se trata de un ajuste fino (fine-tuning) del backbone MobileNetV4-Conv-Large preentrenado en ImageNet-1K (`timm/mobilenetv4_conv_large.e600_r384_in1k`), publicado por el usuario dronefreak como parte del proyecto BDD100K-Toolkit. La tarea resuelta es una clasificación de 7 clases derivada del campo `attributes.weather` del dataset BDD100K: clear, partly cloudy, overcast, rainy, snowy, foggy y unknown.

El modelo es relevante para pipelines de conducción autónoma y sistemas ADAS que necesitan un módulo ligero de percepción contextual: con 31,4 millones de parámetros y un repositorio de 0,3 GB, está pensado para inferencia de baja latencia en hardware modesto. No es un modelo generativo ni multimodal: es un clasificador de imagen puro implementado sobre `timm` y `PyTorch`, con pesos en `safetensors` y licencia Apache-2.0.

La ficha se apoya en los datos declarados por el autor (no verificados de forma independiente) y en la model card pública. El autor reporta un 82,2 % de top-1 y un macro F1 de 66,62 % sobre el split de test de 10 000 imágenes, con un rendimiento claramente desigual entre clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (MobileNetV4-Conv-Large, familia MobileNetV4 con bloques convolucionales) |
| Parametros totales | 31.468.383 (31,3 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no aplica (clasificación de imágenes; las etiquetas están en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint de entrenamiento adicional `best.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal convolucional MobileNetV4 en su variante Conv-Large, diseñada para eficiencia en dispositivos con recursos limitados. El modelo base fue preentrenado en ImageNet-1K durante 600 épocas a resolución 384 (`e600_r384_in1k`) y posteriormente ajustado sobre el dataset BDD100K Weather Classification. No se documenta en la información disponible el número de tokens ni la composición exacta del dataset de ajuste más allá de las 7 clases y los recuentos del split de test.

El ajuste se realizó en el marco del BDD100K-Toolkit, una herramienta que estandariza preparación de datos, entrenamiento y evaluación con las mismas métricas y splits. La model card indica que el checkpoint `best.pt` conserva pesos EMA y metadatos de entrenamiento. No se mencionan técnicas como RLHF, DPO, decodificación especulativa ni atención lineal, por tratarse de un clasificador de imagen sin componente generativo.

## Capacidades

- Clasificación de imágenes en 7 clases meteorológicas: clear, partly cloudy, overcast, rainy, snowy, foggy y unknown.
- Inferencia sobre imágenes RGB individuales con preprocesado estándar (resize, normalización) definido en `config.json`.
- Integración nativa con `timm` mediante `timm.create_model("hf-hub:...")`, incluyendo `pretrained_cfg` con tamaño de entrada, media/desviación y nombres de etiquetas.
- Exportación a `safetensors` y disponibilidad del checkpoint de entrenamiento `best.pt`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión generativa, audio ni modo thinking.
- Capacidad multilingüe: no aplica; las etiquetas de salida están en inglés.

## Casos de uso

- Módulo de percepción contextual en ADAS: clasificar el estado meteorológico de cada frame para que el sistema module la sensibilidad de detección de objetos o active protocolos de conducción conservadora en lluvia o nieve.
- Preprocesado de datasets de conducción: etiquetar automáticamente grandes volúmenes de imágenes de dashcam con la condición meteorológica, usando el modelo como etiquetador débil antes de una revisión manual.
- Enrutado condicional en pipelines de visión: usar la predicción meteorológica como señal para seleccionar el modelo de detección o segmentación más adecuado (por ejemplo, un detector entrenado específicamente en condiciones de lluvia).
- Monitorización de flotas: procesar imágenes periódicas de vehículos para generar informes de condiciones ambientales por ruta y franja horaria.
- Sistemas de alerta temprana: detectar niebla o nieve en cámaras de carretera y disparar avisos a operadores o paneles de tráfico.
- Investigación en robustez: servir como baseline ligero para estudiar el impacto de la meteorología en tareas downstream, dado su bajo coste computacional y su licencia permisiva.
- Despliegue en dispositivos edge: al tener 31,3 M de parámetros, puede ejecutarse en GPUs de consumo o incluso en CPU para clasificación por lotes.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test (10 000 imágenes) del dataset BDD100K Weather Classification. No verificados de forma independiente.

| Métrica | Valor |
|---|---|
| Top-1 accuracy | 82,20 % |
| Top-5 accuracy | 99,75 % |
| Macro F1 | 66,62 % |
| Balanced accuracy | 64,68 % |
| Macro precision | 80,26 % |
| Macro recall | 64,68 % |

Rendimiento por clase:

| Clase | Precision | Recall | F1 | Imágenes de test |
|---|---|---|---|---|
| clear | 90,14 % | 92,03 % | 91,08 % | 5346 |
| foggy | 100,00 % | 7,69 % | 14,29 % | 13 |
| overcast | 65,66 % | 70,38 % | 67,94 % | 1239 |
| partly cloudy | 65,50 % | 63,28 % | 64,37 % | 738 |
| rainy | 86,01 % | 67,48 % | 75,63 % | 738 |
| snowy | 81,82 % | 76,07 % | 78,84 % | 769 |
| unknown | 72,72 % | 75,80 % | 74,23 % | 1157 |

Comparativa dentro del model zoo del propio autor (mismo split de test, ordenado por top-1):

| Modelo | Top-1 | Macro F1 | Balanced acc | Macro precision |
|---|---|---|---|---|
| TinyViT-21M | 83,90 % | 68,65 % | 67,15 % | 74,81 % |
| EfficientViT-B3 | 83,51 % | 68,17 % | 66,34 % | 81,75 % |
| EfficientViT-B2 | 83,46 % | 66,07 % | 65,04 % | 67,54 % |
| EfficientFormerV2-L | 83,27 % | 65,93 % | 65,03 % | 67,12 % |
| RepViT-M1.5 | 83,19 % | 67,78 % | 65,71 % | 81,56 % |
| EfficientViT-L1 | 83,13 % | 65,70 % | 65,11 % | 66,46 % |
| RepViT-M2.3 | 83,02 % | 65,46 % | 64,33 % | 67,02 % |
| ConvNeXt-Atto | 83,00 % | 67,44 % | 65,25 % | 81,38 % |
| EfficientFormerV2-S2 | 82,90 % | 65,50 % | 64,68 % | 66,98 % |
| EfficientViT-B0 | 82,79 % | 65,10 % | 63,62 % | 67,11 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 130 MB solo para pesos (31,3 M × 4 bytes), más activaciones; en la práctica, menos de 1 GB para lotes pequeños.
- En FP16/BF16: aproximadamente 65 MB para pesos, holgadamente dentro de cualquier GPU de consumo.
- GPU recomendadas: cualquier GPU moderna sirve; para producción de alto throughput se recomiendan A100, H100 o L4. En consumo, cabe en RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en CPU para lotes moderados.
- Despliegue: `timm` + `PyTorch` de forma nativa; exportación a ONNX o TorchScript no documentada en la información disponible. No se publican variantes GGUF, por lo que llama.cpp/Ollama no son aplicables.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Top-1 (BDD100K Weather) | Macro F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MobileNetV4-Conv-Large (este modelo) | 31,3 M | no aplica | 82,20 % | 66,62 % | Apache-2.0 | Hugging Face (timm) |
| TinyViT-21M | no disponible en la información | no aplica | 83,90 % | 68,65 % | no disponible | model zoo del autor |
| EfficientViT-B3 | no disponible en la información | no aplica | 83,51 % | 68,17 % | no disponible | model zoo del autor |
| RepViT-M1.5 | no disponible en la información | no aplica | 83,19 % | 67,78 % | no disponible | model zoo del autor |

Los tres modelos comparables superan ligeramente a este MobileNetV4 en top-1 y macro F1 sobre el mismo split, según los datos del propio autor. La comparativa se limita al model zoo de BDD100K-Toolkit; no se dispone de datos de otros clasificadores meteorológicos externos.

## Limitaciones y advertencias

- El rendimiento en la clase foggy es prácticamente nulo en recall (7,69 % sobre solo 13 imágenes), por lo que el modelo no es fiable para detección de niebla.
- El macro F1 (66,62 %) es notablemente inferior al top-1 (82,20 %), lo que indica un fuerte desequilibrio de clases y un rendimiento pobre en clases minoritarias como partly cloudy y overcast.
- Los resultados son declarados por el autor y no han sido verificados de forma independiente.
- El modelo se entrenó sobre BDD100K, con sesgos geográficos y de captura propios del dataset (principalmente escenas de conducción en Estados Unidos); puede generalizar mal a otras regiones, cámaras o condiciones de iluminación.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas con alta confianza en condiciones ambiguas.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no procesa texto.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los términos del dataset BDD100K, que tiene su propia licencia y restricciones de uso.
- Para producción, se recomienda calibrar umbrales por clase y validar sobre datos propios antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-weather-mobilenetv4_conv_large
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Dataset BDD100K Weather Classification: https://huggingface.co/datasets/dronefreak/BDD100K-Weather-Classification
- Modelo base en timm: https://huggingface.co/timm/mobilenetv4_conv_large.e600_r384_in1k
- Paper MobileNetV4 (arXiv:2404.10518): https://arxiv.org/abs/2404.10518
- Paper BDD100K (arXiv:1805.04687): https://arxiv.org/abs/1805.04687
