# LundAISociety/hot-models

## Resumen

`LundAISociety/hot-models` es un repositorio de modelos de segmentación de edificios sobre imágenes aéreas desarrollado por Lund AI Society, una organización sin ánimo de lucro gestionada por estudiantes en Lund (Suecia). No se trata de un modelo generativo de lenguaje, sino de una colección de segmentadores de instancias de edificios que combinan un codificador DINOv3 congelado (ViT-S/16, ViT-B/16, ViT-L/16 o ConvNeXt-L) con un decodificador pequeño entrenado específicamente para la tarea, seguido de un postprocesado de cuencas hidrográficas (watershed) que convierte interiores y contornos en instancias separadas.

El repositorio agrupa 26 variantes publicadas entre octubre y noviembre de 2026, cada una asociada a una versión del dataset `LundAISociety/hot-building-segmentation` y con su propia carpeta que contiene pesos, `config.json` (receta de entrenamiento) y `metrics.json`. La versión más reciente destacada, v1.0, alcanza un PQ (Panoptic Quality) de 0,558 sobre las teselas reservadas HOT Verified usando su postprocesado publicado (área mínima 25 más una regla de conservación ajustada sobre las teselas de entrenamiento), y 0,551 con área mínima 25 simple.

Su relevancia radica en la combinación de un codificador de propósito general congelado (DINOv3) con decodificadores ligeros y recetas reproducibles, lo que permite iterar rápidamente sobre calidad de etiquetado y postprocesado sin reentrenar el backbone. El repositorio incluye además variantes destiladas (v0.4.1-distilled, v0.4.1-fast-distilled) orientadas a reducir coste de inferencia manteniendo el decodificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador DINOv3 congelado (ViT-S/16, ViT-B/16, ViT-L/16 o ConvNeXt-L) + decodificador entrenado + postprocesado watershed |
| Parametros totales | no disponible (varia por variante; el codificador ViT-S/16 es el menor y ViT-L/16 el mayor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de inferencia sobre teselas de 256 px (algunas variantes a 320 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (carpetas por version con pesos, `config.json` y `metrics.json`); exportacion ONNX mencionada en los tags |

## Arquitectura y entrenamiento

La arquitectura sigue un esquema de dos etapas. El codificador DINOv3 se mantiene congelado y actúa como extractor de características densas sobre teselas aéreas; sobre él se entrena un decodificador pequeño que produce mapas de interior y de contorno del edificio. El postprocesado aplica un algoritmo de cuencas hidrográficas sobre esos mapas para separar edificios que se tocan, generando instancias finales. Las variantes v0.2-contact, v0.2-depth y v0.2-vector exploran tres estrategias distintas de separación de edificios en contacto (presas de contacto, mapa de profundidad y vector hacia el centro del edificio).

El entrenamiento se realizó sobre versiones sucesivas del dataset `LundAISociety/hot-building-segmentation`, con recetas que evolucionan: la v0.3 introduce aumento por ventanas, pesos de proyecto, uso de todas las particiones e imágenes más nítidas; la v0.4 añade áreas de ignorancia donde pueden faltar etiquetas; la v0.4.1 limpia la partición de validación; la v1.0-b incorpora una pérdida de borde que tolera desfases de 4 px y penaliza menos ocho proyectos mal etiquetados, entrenando 14 de 15 épocas por límite de coste. Las variantes destiladas usan un estudiante ViT-S de 6 bloques destilado del codificador mayor.

## Capacidades

- Segmentación de instancias de edificios en imágenes aéreas, con salida de interiores y contornos por edificio.
- Separación de edificios en contacto mediante tres mecanismos alternativos (presas de contacto, profundidad, vector al centro).
- Manejo de áreas de ignorancia en las etiquetas (a partir de v0.4) para tolerar zonas con anotación incompleta.
- Robustez a desfases de borde de hasta 4 px mediante pérdida de borde específica (v1.0-b).
- Variantes con codificadores de distinto tamaño (ViT-S/16, ViT-B/16, ViT-L/16, ConvNeXt-L) para ajustar coste y precisión.
- Variantes destiladas de 6 bloques para inferencia más barata.
- Exportación a ONNX (según tags del repositorio).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual y de tarea única.

## Casos de uso

- Inventario municipal de edificios: procesar ortofotos aéreas de un término municipal con la variante v1.0 para obtener polígonos de edificios con calidad panóptica (PQ 0,558), útil para catastro y planificación urbana.
- Monitorización de crecimiento urbano: comparar segmentaciones sobre vuelos de distintas fechas usando la misma receta congelada, ya que el codificador DINOv3 no se reentrena y las diferencias reflejan cambios reales en el terreno.
- Actualización de bases de datos geoespaciales: integrar la salida de instancias en pipelines GIS (por ejemplo, exportando a GeoJSON o Shapefile) para refrescar capas de edificado con menos coste que la digitalización manual.
- Detección de edificios en zonas con anotación incompleta: emplear la variante v0.4, que incorpora áreas de ignorancia, en regiones donde las etiquetas de referencia tienen huecos conocidos.
- Despliegue en entornos con recursos limitados: usar v0.4.1-fast-distilled o v0.4.1-vit320-lite para inferencia sobre teselas de 256-320 px en hardware modesto, manteniendo el decodificador entrenado sobre el estudiante destilado.
- Evaluación comparativa de codificadores: utilizar las variantes v0.3-vitb16, v0.3-vitl16 y v0.3-vitl16-sat para medir el impacto del tamaño y del preentrenamiento (web frente a satélite) del codificador en la misma tarea y dataset.
- Investigación reproducible en teledetección: reutilizar las recetas (`config.json`) y métricas (`metrics.json`) por versión para replicar experimentos de segmentación de instancias sin partir de cero.

## Benchmarks y rendimiento

| Modelo / variante | Metrica | Valor |
|---|---|---|
| v1.0 (postprocesado publicado: area minima 25 + regla de conservacion) | PQ en HOT Verified (held-out) | 0,558 |
| v1.0 (area minima 25 simple) | PQ en HOT Verified (held-out) | 0,551 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (por ejemplo, IoU por clase, AP de instancias o comparaciones con otros segmentadores) para el resto de variantes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; depende del codificador elegido (ViT-S/16 es el más ligero, ViT-L/16 y ConvNeXt-L los más pesados) y del tamaño de tesela (256 o 320 px).
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del repositorio (2,8 GB) y la naturaleza de los codificadores, es razonable esperar que las variantes ViT-S/16 quepan en GPUs de consumo, pero no se confirma en la documentación.
- Cabe en GPU de consumo: no confirmado; las variantes destiladas (v0.4.1-distilled, v0.4.1-fast-distilled) están diseñadas para reducir coste, lo que sugiere ese objetivo, pero sin cifras publicadas.
- Opciones de despliegue: el autor indica ejecutar con `generate-predictions` del código de entrenamiento (enlace no incluido en la información disponible); los tags mencionan exportación ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Codificador | Contexto / tesela | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LundAISociety/hot-models (v1.0) | Segmentación de instancias de edificios | DINOv3 ViT-S/16 congelado + decodificador | 256 px (algunas variantes 320 px) | Apache 2.0 | Hugging Face |
| LundAISociety/dinov3-asymmetric-building-segmenter | Segmentación de edificios con pérdida asimétrica relajada | DINOv3 ViT-S/16 congelado | no disponible | no disponible | Hugging Face (referenciado como variante `asym`) |
| Alternativas genéricas de segmentación (SAM, Mask2Former) | Segmentación de propósito general | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de comparaciones cuantitativas con otros segmentadores de edificios, por lo que la comparativa se limita a la relación entre las propias variantes del repositorio y el modelo de referencia `asym`.

## Limitaciones y advertencias

- Modelo de tarea única: no genera texto, no razona y no soporta instrucciones en lenguaje natural; cualquier uso fuera de segmentación de edificios aéreos no está cubierto.
- Sesgos de dominio: entrenado sobre el dataset `LundAISociety/hot-building-segmentation`; el rendimiento puede degradarse en geografías, estilos constructivos o resoluciones distintas de las de entrenamiento.
- Calidad de etiquetas: la propia model card reconoce ocho proyectos mal etiquetados en v1.0-b y la existencia de áreas con etiquetas posiblemente ausentes (v0.4), lo que introduce ruido en las métricas y en las predicciones.
- Métricas limitadas: solo se publica PQ para v1.0; no hay datos de robustez, sensibilidad a resolución ni curvas de error para el resto de variantes.
- Postprocesado dependiente: el PQ de 0,558 depende de una regla de conservación ajustada sobre las teselas de entrenamiento, lo que puede no generalizar a otros dominios.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias del codificador DINOv3 subyacente y del dataset antes de un despliegue en producción.
- Repositorio en evolución: 26 variantes publicadas en poco más de un mes, con cambios de receta frecuentes; fijar una versión concreta (por ejemplo, v1.0) para reproducibilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LundAISociety/hot-models
- Dataset de entrenamiento: https://huggingface.co/datasets/LundAISociety/hot-building-segmentation
- Carpeta v1.0: https://huggingface.co/LundAISociety/dinov3-building-segmenter-by-dataset/tree/main/v1.0
- Modelo de referencia con pérdida asimétrica: https://huggingface.co/LundAISociety/dinov3-asymmetric-building-segmenter
- Perfil de la organización en Hugging Face: https://huggingface.co/LundAISociety
- Sitio web de Lund AI Society: https://lundaisociety.com/
