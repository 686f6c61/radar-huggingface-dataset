# abhinav03700/solar-panel-segformer-mit-b2

## Resumen

El modelo `abhinav03700/solar-panel-segformer-mit-b2` es un transformador visual para segmentación semántica binaria de paneles solares fotovoltaicos en imágenes de satélite, aéreas y de drones. Fue desarrollado por el usuario de HuggingFace `abhinav03700` y está publicado bajo licencia MIT, con una arquitectura basada en SegFormer (encoder jerárquico MiT-B2 y decoder All-MLP). El modelo tiene 24,7 millones de parámetros y está diseñado para resolver el problema de detección y delimitación de paneles solares en tejados, lo que resulta relevante para aplicaciones de teledetección, inventario de energías renovables y análisis urbanístico.

La entrada esperada es una imagen RGB de 512x512 píxeles, aunque la arquitectura admite resoluciones arbitrarias mediante ventanas deslizantes. El entrenamiento se realizó con una pérdida compuesta sensible a los bordes (BCE, Soft Dice y pérdida de bordes Laplaciana), lo que mejora la precisión en los contornos de los paneles. El modelo está publicado para el pipeline de `image-segmentation` y usa la librería `segmentation-models-pytorch`. A día de hoy no dispone de descargas ni valoraciones en la comunidad, pero su estructura técnica y su enfoque multi-escala lo hacen apto para proyectos de geoinformática y monitorización fotovoltaica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer con encoder Mix Transformer (MiT-B2) y decoder All-MLP |
| Parametros totales | 24,7 millones (~94 MB de checkpoint) |
| Longitud de contexto | No aplicable (modelo de vision por computadora) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplicable (modelo de vision por computadora) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SegFormer, que combina un encoder jerárquico de Transformer (MiT-B2) con un decoder ligero basado en MLPs. El encoder produce características multi-escala que permiten capturar tanto detalles finos como contextos globales de la imagen. El decoder All-MLP fusiona esas características y genera una máscara de segmentación binaria, donde la clase 0 corresponde a fondo o tejado y la clase 1 a paneles solares fotovoltaicos. El tamaño total de parámetros es de 24,7 millones, un peso moderado que facilita la inferencia en entornos con recursos limitados.

El entrenamiento se realizó sobre el dataset `gabrielkasmi/bdappv`, complementado con negativos de Google Earth (tejados vacíos, claraboyas, unidades de aire acondicionado, aparcamientos y carreteras) para suprimir falsos positivos. La función de pérdida utilizada es una pérdida compuesta con coeficientes 0.4 para BCE, 0.4 para Soft Dice y 0.2 para una pérdida de bordes Laplaciana, lo que favorece la delimitación precisa de los contornos de los paneles. Además, se aplicó un aumento de escala piramidal (de 0.4x a 1.6x) para lograr invariancia de escala, de modo que el modelo pueda detectar paneles en distintas resoluciones y niveles de zoom.

## Capacidades

- Segmentación semántica binaria de paneles solares en imágenes RGB.
- Invariancia de escala entre 0.4x y 1.6x, lo que permite detectar paneles a diferentes niveles de zoom en Google Maps y en ortomosaicos aéreos de alta resolución.
- Supresión de falsos positivos mediante el uso de negativos reales, como tejados vacíos, claraboyas, unidades de aire acondicionado, aparcamientos y carreteras.
- Generalización a varios tipos de arquitectura de tejado: residencial suburbano (tejas asfálticas, tejas de hormigón), comercial (cubiertas planas de grava u hormigón), industrial (chapa ondulada, teja metálica) y tejados patrimoniales europeos o asiáticos (teja de terracota y ladrillo).
- Capacidad de procesar imágenes de satélite, ortomosaicos aéreos sub-métricos y capturas de drones de alta resolución.
- Soporte para inferencia en resoluciones arbitrarias mediante ventanas deslizantes.

## Casos de uso

- Inventario automatizado de paneles solares en ortomosaicos aéreos: el modelo puede procesar mosaicos de alta resolución para mapear la presencia y superficie de paneles fotovoltaicos en un municipio o región. Gracias a su invariancia de escala, es adecuado para vuelos a diferentes alturas.
- Auditoría de tejados para evaluar potencial fotovoltaico: aplicado a imágenes de Google Maps, permite identificar automáticamente qué tejados ya disponen de paneles, facilitando estudios de viabilidad para nuevas instalaciones.
- Monitorización de plantas fotovoltaicas mediante drones: en inspecciones de parques solares, el modelo segmenta los módulos en capturas de UAV, permitiendo detectar posibles anomalías o crecimiento de vegetación si se combina con análisis posteriores.
- Integración en pipelines de teledetección: al ser un modelo PyTorch con la librería `segmentation-models-pytorch`, se puede incorporar fácilmente en flujos de trabajo geográficos (GDAL, rasterio, etc.) para generar capas raster de cobertura solar.
- Análisis urbanístico y de sostenibilidad: los mapas de paneles solares resultantes sirven para estudiar la adopción de energías renovables en entornos urbanos y comparar patrones de instalación entre distintos barrios.
- Detección de paneles en imágenes de Google Earth para inventarios catastrales: el modelo puede emplearse para etiquetar automáticamente parcelas con paneles, reduciendo el trabajo manual de revisión en sistemas de información geográfica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El checkpoint ocupa aproximadamente 94 MB, por lo que la inferencia en FP32 requiere un mínimo de VRAM, estimado en menos de 2 GB para una imagen de 512x512.
- Se puede ejecutar en GPUs de consumo como la RTX 3060, RTX 4060 o similares con 8 GB de VRAM.
- También es viable la inferencia por CPU, aunque con mayor latencia, dado el tamaño moderado del modelo.
- Opciones de despliegue: el modelo usa `segmentation-models-pytorch` y se puede servir mediante frameworks de inferencia como TorchServe, FastAPI o contenedores personalizados. No hay información sobre soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- No se disponen de datos de latencia o throughput medidos en la información proporcionada.

## Comparativa con modelos similares

No se han encontrado modelos comparables con datos públicos en la información disponible. Se puede señalar que comparte arquitectura con otros modelos SegFormer de teledetección, pero no hay métricas específicas para comparar.

## Limitaciones y advertencias

- No se ha documentado el comportamiento en regiones fuera de las categorías de tejados entrenadas; la generalización a estilos arquitectónicos no incluidos puede ser limitada.
- No se han publicado evaluaciones de sesgo ni análisis de robustez frente a condiciones meteorológicas, cambios de iluminación o distorsiones geométricas.
- Al ser un modelo de segmentación binaria, no distingue entre tipos de paneles ni estados de degradación; solo identifica la presencia de paneles.
- La licencia MIT permite uso comercial y modificación, pero se recomienda validar el modelo en el dominio específico antes de usarlo en producción.
- El repositorio no incluye métricas de validación ni curvas de entrenamiento, por lo que la fiabilidad real debe verificarse de forma independiente.
- El checkpoint se distribuye en formato `.pth` de PyTorch, lo que requiere conocer el código de carga y la arquitectura exacta para su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abhinav03700/solar-panel-segformer-mit-b2
- Repositorio oficial de SegFormer: https://github.com/NVlabs/SegFormer
- Documentación de SegFormer en Hugging Face: https://huggingface.co/docs/transformers/model_doc/segformer
- Dataset de entrenamiento: https://huggingface.co/datasets/gabrielkasmi/bdappv
