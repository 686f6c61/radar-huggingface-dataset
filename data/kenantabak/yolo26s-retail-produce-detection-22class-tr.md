# kenantabak/yolo26s-retail-produce-detection-22class-tr

## Resumen

`yolo26s-retail-produce-detection-22class-tr` es un modelo de detección de objetos basado en la arquitectura YOLO26 en su variante `s` (small), publicado por Kenan Tabak en la plataforma EVREN (SSYZ) y distribuido a través de Hugging Face. Está especializado en la detección y el conteo de 22 clases de frutas y hortalizas frescas en entornos de retail y agricultura, con etiquetas en turco e inglés (`apple`, `melon`, `banana`, `cherry`, `orange`, `coconut`, `nectarine`, `pineapple`, `strawberry`, `watermelon`, `pomegranate`, `honeydew_melon`, `peach`, `taiti_lime`, `plum`, `kiwi`, `onion`, `pear`, `agata_potato`, `asterix_potato`, `grape` y `cucumber`).

El modelo se ha entrenado sobre el conjunto de datos "Taze Meyve ve Sebze Çeşitleri Çok Sınıflı Tespiti (22 Sınıf)" con hiperparámetros ajustados específicamente para preservar las diferencias de tono entre frutas visualmente próximas (melocotón, nectarina, ciruela, cítricos), aplicando un valor muy bajo de aumento de tono (`hsv_h=0.002`). El resultado declarado en validación es de un 98,94 % de mAP@50, un 86,80 % de mAP@50-95 y un 97,17 % de F1, con un peso de tan solo 19,4 MB.

Su relevancia práctica radica en el caso de uso: cajas inteligentes de autoservicio, líneas de clasificación de cosecha y sistemas de inventario visual en fruterías, donde se necesita identificar y contar producto fresco en tiempo real sobre hardware modesto. La licencia CC BY 4.0 del modelo facilita su integración comercial, aunque el componente de framework Ultralytics queda sujeto a AGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26s (Ultralytics, detector de objetos de una etapa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen `imgsz=512` en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos `.pt` de PyTorch; compatible con exportación FP16/INT8 vía Ultralytics, no confirmado en la model card) |
| Idiomas soportados | tr, en (etiquetas de clase e interfaz) |
| Licencia | CC BY 4.0 (componente Ultralytics bajo AGPL-3.0) |
| Formato de pesos | `.pt` (PyTorch, Ultralytics), 19,4 MB |

## Arquitectura y entrenamiento

Se trata de un detector YOLO26 en variante `s` (small) de Ultralytics, una familia de detectores de una etapa basada en backbone convolucional y cabeza de predicción anclada, pensada para inferencia en tiempo real. No es un transformer ni un modelo de lenguaje: no procesa texto ni mantiene contexto conversacional. La entrada de imagen durante el entrenamiento fue de 512×512 píxeles, con 55 épocas planificadas (mejor época en la 54), batch de 32 y `cos_lr=True`.

El entrenamiento se realizó con hiperparámetros ajustados al dominio: `mosaic=0.75`, `close_mosaic=12`, `fliplr=0.5`, `flipud=0.3`, `degrees=5.0`, `scale=0.35`, `erasing=0.0`, `hsv_s=0.15`, `hsv_v=0.3` y, de forma destacada, `hsv_h=0.002` para no alterar la identidad cromática de frutas con tonos muy próximos. El conjunto de datos se describe como equilibrado, con al menos 136 cajas por clase en las 22 categorías. El coste de entrenamiento declarado es de 0,184 horas-GPU (aproximadamente 11 minutos) y 1,84 CR en la plataforma EVREN. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de destilación.

## Capacidades

- Detección de objetos en imágenes RGB con 22 clases de frutas y hortalizas frescas.
- Conteo de instancias por clase en una misma imagen (útil para inventario y pesaje asistido).
- Localización con cajas delimitadoras y puntuaciones de confianza por detección.
- Discriminación entre clases visualmente similares (melocotón, nectarina, ciruela; variedades de patata `agata` y `asterix`; cítricos como `taiti_lime` y `orange`).
- Etiquetado bilingüe (turco e inglés) en la documentación y en los nombres de clase.
- Inferencia en tiempo real sobre GPU de consumo gracias al tamaño reducido del modelo (19,4 MB).
- Integración con el ecosistema Ultralytics (`YOLO`, `predict`, `show`, exportación a otros formatos).
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión.

## Casos de uso

- Cajas inteligentes de autoservicio en fruterías: el modelo detecta y clasifica cada pieza colocada en el área de pesaje, permitiendo calcular el precio sin intervención del cliente. Su tamaño (19,4 MB) y su mAP@50 del 98,94 % lo hacen viable en dispositivos de borde.
- Líneas de clasificación de cosecha: integrado en una cinta transportadora con cámara cenital, identifica la variedad de fruta y descarta piezas mal clasificadas, aprovechando el equilibrio de clases del dataset de entrenamiento.
- Inventario visual de estanterías de producto fresco: un dron o cámara fija captura la estantería y el modelo cuenta unidades por referencia para reposición automática.
- Control de calidad en empaquetado: verificación de que el lote contiene la variedad declarada (por ejemplo, distinguir `agata_potato` de `asterix_potato`), reduciendo errores de etiquetado.
- Automatización de básculas con reconocimiento: combinación de la detección con la lectura de peso para generar tickets automáticos en mercados municipales.
- Monitorización de mermas: análisis periódico de imágenes de expositores para estimar la cantidad de producto restante y detectar rotación lenta.
- Filtrado previo en pipelines de anotación: uso del modelo como pre-etiquetador para acelerar el etiquetado humano de nuevas imágenes de frutería, dado su F1 del 97,17 % en validación.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, no verificados de forma independiente (`verified: false`). Conjunto de evaluación: "Taze Meyve ve Sebze Çeşitleri Çok Sınıflı Tespiti (22 Sınıf)" (tipo `evren-grade-a`).

| Metrica | Valor |
|---|---|
| mAP@50 | 98,94 % |
| mAP@50-95 | 86,80 % |
| F1 | 97,17 % |
| Precision | 97,93 % |
| Recall | 96,68 % |
| Mejor época / total | 54/55 |

Rendimiento por clase (extracto; mAP@50):

| Clase | mAP@50 | Precision | Recall | F1 |
|---|---|---|---|---|
| apple | 99,50 % | 100,00 % | 99,70 % | 99,85 % |
| nectarine | 99,50 % | 99,91 % | 100,00 % | 99,95 % |
| watermelon | 99,50 % | 99,62 % | 100,00 % | 99,81 % |
| peach | 99,49 % | 99,38 % | 99,65 % | 99,51 % |
| plum | 99,33 % | 99,07 % | 95,71 % | 97,36 % |
| onion | 98,59 % | 95,96 % | 92,23 % | 94,06 % |
| asterix_potato | 97,35 % | 98,42 % | 87,64 % | 92,72 % |
| grape | 96,17 % | 99,68 % | 80,00 % | 88,76 % |
| cucumber | 96,13 % | 99,23 % | 85,00 % | 91,57 % |

Las clases con peor recall son `grape` (80,00 %) y `cucumber` (85,00 %), lo que sugiere dificultades con racimos y con formas alargadas o solapadas. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el peso de 19,4 MB; en la práctica, la memoria vendrá dominada por el tamaño del lote y la resolución de entrada (512 o 640 px).
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema. También es viable en CPU para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, en todas las RTX y en muchas iGPU recientes; también en dispositivos de borde tipo Jetson Nano o Raspberry Pi con aceleración.
- Opciones de despliegue: Ultralytics Python (`YOLO(...).predict`), exportación a ONNX, TensorRT, OpenVINO o TFLite mediante la API de Ultralytics; también es posible servir con TorchServe o FastAPI. No se documenta soporte nativo en vLLM, llama.cpp ni Ollama (no aplica a modelos de visión).
- Latencia y throughput: no disponibles en la información proporcionada; el coste de entrenamiento declarado (0,184 horas-GPU) sugiere un modelo muy ligero, pero no se aportan cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| yolo26s-retail-produce-detection-22class-tr | YOLO26s | no disponible (peso 19,4 MB) | no aplica (imagen 512 px) | CC BY 4.0 (framework AGPL-3.0) | 22 clases de fruta/hortaliza, mAP@50 98,94 % |
| YOLO11s (Ultralytics) | YOLO11s | no disponible | no aplica | AGPL-3.0 | Modelo generalista; sin clases específicas de frutería; requiere fine-tuning |
| YOLOv8s (Ultralytics) | YOLOv8s | no disponible | no aplica | AGPL-3.0 | Generación anterior, ampliamente desplegada; sin clases de fruta específicas |
| Faster R-CNN ResNet-50 (torchvision) | Two-stage | ~41 M | no aplica | BSD-3 | Más pesado y lento; sin clases de fruta específicas |

La comparación directa con estos modelos no es posible en términos de precisión sobre el dataset EVREN, ya que no se han publicado resultados de los alternativos en ese conjunto. La ventaja principal del modelo de Tabak es la especialización en 22 clases de producto fresco y su licencia permisiva CC BY 4.0, frente a la AGPL-3.0 de los modelos base de Ultralytics.

## Limitaciones y advertencias

- Modelo especializado: solo detecta las 22 clases del dataset de entrenamiento; cualquier fruta u hortaliza fuera de esa lista no será reconocida correctamente.
- Sesgo de dominio: entrenado sobre imágenes de la plataforma EVREN; el rendimiento puede degradarse en condiciones de iluminación, fondo o cámara distintas a las del conjunto original.
- Riesgo de confusión entre variedades próximas (por ejemplo, `agata_potato` frente a `asterix_potato`, o `peach` frente a `nectarine`) si la imagen no conserva bien el color, dado que el entrenamiento usó `hsv_h=0.002` para preservar el tono.
- Recall bajo en `grape` (80,00 %) y `cucumber` (85,00 %): puede infracountar racimos y piezas alargadas.
- No es un modelo generativo: no produce texto, no razona y no admite instrucciones en lenguaje natural.
- Licencia del modelo CC BY 4.0 (permite uso comercial con atribución), pero el componente Ultralytics está bajo AGPL-3.0, lo que impone obligaciones de copyleft sobre el código del framework; conviene revisar la compatibilidad en productos propietarios.
- Los benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); no han sido reproducidos de forma independiente.
- No se documentan sesgos demográficos ni de otro tipo; al ser un modelo de visión sobre producto, el riesgo principal es de rendimiento, no de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kenantabak/yolo26s-retail-produce-detection-22class-tr
- Página del modelo en EVREN (producción): https://evren.ssyz.org.tr/models/u19979974710e/perakende-ve-manav-taze-meyve-sebze-tespiti-22-sinif
- Dataset de entrenamiento en EVREN: https://evren.ssyz.org.tr/datasets/u19979974710e/taze-meyve-ve-sebze-cesitleri-cok-sinifli-tespiti-22-sinif
- Perfil del autor en EVREN: https://evren.ssyz.org.tr/profile/u19979974710e
- Catálogo de datasets de visión por computador en turco: https://huggingface.co/datasets/kenantabak/evren-turkish-computer-vision-316-datasets
- Repositorio Ultralytics: https://github.com/ultralytics/ultralytics
- Documentación Ultralytics: https://docs.ultralytics.com/
