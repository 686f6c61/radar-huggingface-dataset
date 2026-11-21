# mvdelibas/mars-domars16k-yolo11s-cls-v1

## Resumen

Mars-domars16k-yolo11s-cls-v1 es un clasificador de imagenes basado en la arquitectura YOLO11s-cls, entrenado por el usuario mvdelibas para identificar 15 tipos de formas del relieve (landforms) en la superficie de Marte a partir de parches de imagen CTX de 200 x 200 pixeles. El modelo resuelve una tarea de vision por computador muy concreta: la clasificacion automatica de morfologia geologica marciana, un paso previo habitual en pipelines de analisis planetario a gran escala.

El modelo se apoya en el dataset DoMars16k (Wilhelm et al., 2020), del que deriva una version propia (`mvdelibas/mars-domars16k-ctx-v1`) con 16.150 parches re-divididos para evitar fuga de datos entre particiones (ninguna imagen CTX de origen aparece en dos splits). Se trata de un modelo pequeno, de tipo convolutional, orientado a inferencia rapida y a la clasificacion de imagenes, no a generacion de texto ni a razonamiento.

Es relevante ahora porque demuestra un flujo de trabajo reproducible para aplicar modelos de vision ligeros (Ultralytics YOLO) a datos cientificos abiertos, con licencia CC BY 4.0 en los pesos y datos derivados, aunque con la advertencia explicita de que no debe usarse para interpretacion cientifica ni para decisiones de seguridad de aterrizaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s-cls (clasificacion de imagenes, red convolucional de Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision; entrada de imagen a 224 x 224 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas y documentacion en ingles) |
| Licencia | cc-by-4.0 (pesos); codigo y arquitectura YOLO11 bajo AGPL-3.0 de Ultralytics |
| Formato de pesos | `.pt` (PyTorch, cargado via Ultralytics) |

## Arquitectura y entrenamiento

El modelo es un clasificador YOLO11s-cls, la variante "small" de la familia YOLO11 de Ultralytics orientada a clasificacion de imagenes. Se trata de una red convolucional (CNN) que procesa la imagen completa y produce una distribucion de probabilidad sobre 15 clases de formas del relieve marciano. No emplea mecanismos de atencion tipo transformer ni arquitecturas hibridas; es un modelo puramente de vision, sin capacidad de generar texto.

El entrenamiento se realizo durante 30 epocas con imagenes redimensionadas a 224 px y batch de 64, sobre el dataset `mvdelibas/mars-domars16k-ctx-v1`, que contiene 16.150 parches CTX de 200 x 200 px derivados de DoMars16k. La particion se rehizo por imagen de origen para evitar que una misma escena CTX apareciera en train y validacion simultaneamente, lo que reduce el riesgo de sobreajuste optimista. No se documenta el uso de RLHF, DPO ni tecnicas de aumento de datos especificas mas alla del pipeline estandar de Ultralytics.

## Capacidades

- Clasificacion de imagenes en 15 clases de formas del relieve marciano (geomorphology).
- Procesamiento de parches de imagen CTX de 200 x 200 px, redimensionados a 224 px en inferencia.
- Salida de probabilidades top-1 y top-5 con nivel de confianza por clase.
- Inferencia rapida en CPU y GPU gracias al tamano reducido del modelo (variante "s").
- Integracion sencilla con la libreria Ultralytics (`YOLO(...).predict(...)`).
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, vision multimodal ni audio.
- Capacidad multilingue: no aplica (modelo de vision; etiquetas en ingles).

## Casos de uso

- Clasificacion automatica de morfologia marciana a escala regional: dado un lote de parches CTX, el modelo asigna una etiqueta de landform a cada uno, permitiendo mapear la distribucion de tipos de terreno en una zona de interes.
- Pre-etiquetado para anotacion cientifica: el modelo puede generar etiquetas preliminares que investigadores revisan y corrigen, acelerando la construccion de nuevos datasets geomorphologicos.
- Filtrado y triaje de grandes volumenes de imagenes CTX: descartar o priorizar parches con clases de interes (por ejemplo, terreno rugoso o texturado) antes de un analisis manual mas costoso.
- Educacion y divulgacion: herramienta didactica para mostrar como un clasificador CNN ligero puede distinguir tipos de relieve planetario a partir de imagenes reales de Marte.
- Prototipado de pipelines de vision planetaria: servir como baseline reproducible para comparar con clasificadores mas grandes o con enfoques basados en transformers de vision.
- Analisis de cobertura y balance de clases: usar las predicciones sobre grandes lotes para estimar la frecuencia relativa de cada landform en un conjunto de datos y detectar clases infrarrepresentadas.

## Benchmarks y rendimiento

Resultados reportados por la plataforma sobre el split de validacion (1.582 parches, una sola ejecucion, mejor epoca 21):

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 0,824 |
| Top-5 accuracy | 0,986 |
| Precision | 0,782 |
| Recall | 0,796 |
| F1 | 0,764 |

No se han publicado resultados sobre el split de test ni comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja (modelo "s" de clasificacion); cabe holgadamente en GPUs de 4-8 GB. No se dispone de cifra oficial.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o GPUs de datacenter (A100, H100) para procesamiento por lotes a gran escala.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 4 GB de VRAM.
- Tambien puede ejecutarse en CPU para lotes pequenos, aunque con mayor latencia.
- Opciones de despliegue: Ultralytics (Python), exportacion a ONNX o TensorRT mediante las utilidades de Ultralytics; no se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de vision de este tipo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mars-domars16k-yolo11s-cls-v1 | YOLO11s-cls (CNN) | no disponible | 224 x 224 px | CC BY 4.0 (pesos) / AGPL-3.0 (codigo) | Hugging Face |
| YOLO11s-cls base (Ultralytics) | YOLO11s-cls (CNN) | no disponible | 224 x 224 px | AGPL-3.0 | Ultralytics |
| Clasificadores ViT pequenos (p. ej. ViT-B/16) | Transformer de vision | ~86 M | 224 x 224 px | variable (a menudo Apache 2.0) | Hugging Face |

No se dispone de comparaciones de rendimiento directas entre estos modelos sobre el dataset DoMars16k en la informacion proporcionada.

## Limitaciones y advertencias

- Los limites entre clases son difusos (terreno mixto, rugoso o texturado), lo que genera confusiones entre categorias.
- El split de validacion contiene pocos parches para algunas clases, por lo que las metricas por clase son ruidosas.
- Entrenado exclusivamente con imagenes CTX; no se garantiza su comportamiento con otras fuentes de imagen (HiRISE, MOC, etc.).
- No debe usarse para interpretacion cientifica ni para decisiones de seguridad de aterrizaje, segun advierte el propio autor.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza en parches ambiguos.
- Sesgos: posibles sesgos derivados de la distribucion del dataset DoMars16k y de la re-particion realizada por el autor.
- Licencia: los pesos son CC BY 4.0, pero la arquitectura y el codigo de entrenamiento YOLO11 son AGPL-3.0 de Ultralytics; es necesario revisar esa licencia para uso comercial.
- El modelo no cuenta con validacion independiente ni con resultados sobre el split de test.
- No dispone de descargas ni likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvdelibas/mars-domars16k-yolo11s-cls-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/mvdelibas/mars-domars16k-ctx-v1
- Dataset original DoMars16k (Zenodo): https://doi.org/10.5281/zenodo.4291940
- Paper DoMars16k (Wilhelm et al., Remote Sensing 2020): https://doi.org/10.3390/rs12233981
- Ultralytics (arquitectura y codigo): https://github.com/ultralytics/ultralytics
