# Didrien/meteorix-yolo26n

## Resumen

Meteorix YOLO26n es un modelo de detección de objetos basado en YOLO26n de Ultralytics, ajustado por el autor Didrien para la detección de meteoros en imágenes de cielo nocturno captadas desde tierra. Se trata de un fine-tuning del checkpoint preentrenado en COCO `yolo26n.pt`, especializado en una única clase (`meteor`), y forma parte del estudio Meteorix, que compara YOLO26n con RF-DETR Small y DETR-ResNet-50.

El modelo resuelve un problema concreto de visión por computador: la detección automática de trazas de meteoros en imágenes astronómicas, una tarea con clases muy desbalanceadas y objetos de pequeño tamano y baja relación señal-ruido. Su relevancia radica en que ofrece un detector ligero (variante "n" de YOLO26) con latencias muy bajas (5,5 ms por imagen en una RTX 4090) y métricas de precisión y recall altas sobre el conjunto de test del dataset Mendeley.

Es un modelo de nicho, con 43 descargas y sin likes en el momento de la consulta, orientado a pipelines de análisis astronómico y a la investigación comparativa de detectores. No es un modelo de lenguaje: no genera texto ni soporta tool calling, y su única salida son cajas delimitadoras de la clase `meteor`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics), detector de objetos de una etapa; variante "n" (nano) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye el checkpoint `best.pt` en precisión original) |
| Idiomas soportados | no aplica (modelo de visión; sin capacidades linguisticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch, checkpoint de Ultralytics) |

## Arquitectura y entrenamiento

YOLO26n es un detector de objetos de una etapa de la familia YOLO de Ultralytics, con backbone y cabeza de detección típicos de la serie, en su variante nano (la de menor coste computacional de la familia). El fine-tuning parte del checkpoint `yolo26n.pt` preentrenado en COCO y se realiza con la receta por defecto de Ultralytics: optimizador MuSGD, augmentación por defecto, decaimiento lineal de la tasa de aprendizaje y mosaic desactivado en las últimas 10 épocas. Se entrenan 300 épocas con tamano de imagen 640 y batch size 4.

Los pesos publicados corresponden al checkpoint `best.pt` seleccionado por Ultralytics sobre el split de validación, en la época 186. El conjunto de datos es el dataset de imágenes de meteoros de Mendeley (Gradvohl & Shirasuna, DOI 10.17632/4k98n84d9g.1, licencia CC BY 4.0), con 3.849 imágenes de entrenamiento, 550 de validación y 1.100 de test, todas a 640x640. No se documentan innovaciones técnicas adicionales más allá de la propia arquitectura YOLO26 y del ajuste fino supervisado sobre una única clase.

## Capacidades

- Detección de objetos de una sola clase: `meteor`, en imágenes de cielo nocturno captadas desde tierra.
- Salida de cajas delimitadoras en coordenadas de píxel de la imagen original (`results[0].boxes.xyxy`).
- Umbral de confianza configurable en inferencia (el autor documenta `conf=0.5`).
- Inferencia de imagen completa a 640x640 con `imgsz=640`.
- Integración con la librería `ultralytics` (probado con `ultralytics==8.4.19`) y descarga vía `huggingface_hub`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- Detección automática de meteoros en archivos de imágenes de observatorios: el modelo procesa imágenes de cielo nocturno a 640x640 y devuelve cajas de la clase `meteor`, lo que permite filtrar automáticamente grandes volúmenes de capturas nocturnas y reducir la revisión manual.
- Triaje en pipelines de cámaras all-sky: con 5,5 ms por imagen en una RTX 4090, el modelo puede ejecutarse en tiempo casi real sobre secuencias de vídeo o ráfagas de imágenes, marcando candidatos para revisión posterior.
- Investigación comparativa de detectores: al formar parte del estudio Meteorix junto con RF-DETR Small y DETR-ResNet-50, sirve como referencia reproducible para comparar arquitecturas en la misma tarea y dataset.
- Validación de datasets astronómicos: el modelo puede usarse para preetiquetar imágenes del dataset Mendeley o de nuevos conjuntos y acelerar la anotación supervisada de meteoros.
- Despliegue en estaciones de observación con hardware modesto: al ser la variante nano, es candidato para ejecutarse en GPUs de consumo o en dispositivos con recursos limitados, aunque no se publican requisitos oficiales de VRAM.
- Educación y divulgación astronómica: integración en herramientas que detecten meteoros en imágenes de aficionados y resalten las trazas detectadas de forma automática.

## Benchmarks y rendimiento

Resultados a nivel de imagen, confianza 0,5 y IoU de emparejamiento 0,5, según la model card:

| Conjunto de test | Precision | Recall | F1 |
|---|---|---|---|
| Mendeley test split (1.100 imágenes) | 0,971 | 0,932 | 0,951 |
| NEO-Bench UAEMMN, todos los splits (1.382 imágenes) | 0,950 | 0,718 | 0,818 |

Latencia media extremo a extremo en una RTX 4090 (carga de imagen, preprocesado, forward pass y postprocesado): 5,5 ms por imagen.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por ser la variante nano de YOLO26, la huella debería ser reducida, pero no se publica una cifra oficial.
- GPU recomendadas: el autor documenta latencia en una RTX 4090; no se especifican otras GPU.
- Cabe en GPU de consumo: previsiblemente sí, al tratarse de la variante nano, aunque no se confirma con datos de VRAM en la model card.
- Opciones de despliegue: librería `ultralytics` (probado con `ultralytics==8.4.19`); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a un detector de objetos).
- Latencia y throughput: 5,5 ms por imagen en RTX 4090 (extremo a extremo); no se publica throughput agregado.

## Comparativa con modelos similares

El estudio Meteorix compara este modelo con RF-DETR Small y DETR-ResNet-50 sobre la misma tarea, pero la información disponible no incluye sus resultados numéricos ni sus especificaciones, por lo que la comparación cuantitativa no está disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Meteorix YOLO26n | no disponible | no aplica | F1 0,951 en Mendeley test; F1 0,818 en NEO-Bench UAEMMN | AGPL-3.0 | Hugging Face |
| RF-DETR Small | no disponible | no aplica | no disponible | no disponible | no disponible |
| DETR-ResNet-50 | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de un solo dominio y una sola clase: solo detecta `meteor` en imágenes de cielo nocturno; no es un detector de propósito general.
- Riesgo de falsos positivos y negativos en condiciones de imagen distintas a las del dataset de entrenamiento (por ejemplo, contaminación lumínica, nubes, satélites o aviones).
- El recall cae de forma notable en el conjunto NEO-Bench UAEMMN (0,718 frente a 0,932 en Mendeley test), lo que indica menor robustez ante datos fuera de distribución.
- No se documentan sesgos demográficos (no aplica), pero sí un posible sesgo de dominio hacia el dataset Mendeley (CC BY 4.0).
- Licencia AGPL-3.0: el uso comercial en servicios en red puede obligar a liberar el código fuente derivado; conviene revisar las implicaciones antes de integrarlo en productos propietarios.
- Los pesos derivan de Ultralytics YOLO26 y heredan sus restricciones de licencia.
- No se publican parámetros totales, VRAM ni datos de cuantización, lo que dificulta planificar el despliegue en hardware concreto.
- Fecha de creación del repositorio en 2026-10-29; el modelo es reciente y con muy poca adopción (43 descargas, 0 likes), por lo que carece de validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Didrien/meteorix-yolo26n
- Dataset Mendeley (Gradvohl & Shirasuna): DOI 10.17632/4k98n84d9g.1
- Ultralytics (librería y familia YOLO26): no se proporciona URL en la información disponible.
