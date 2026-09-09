# dronefreak/co-deformable-detr-swin-t-3x-coco

## Resumen

El modelo `dronefreak/co-deformable-detr-swin-t-3x-coco` es un detector de objetos basado en la arquitectura Co-DETR, entrenado sobre el dataset COCO 2017. Se trata de un espejo no oficial publicado por `dronefreak` de un checkpoint de los autores originales del paper "DETRs with Collaborative Hybrid Assignments Training" (ICCV 2023), obra de Zhuofan Zong, Guanglu Song y Yu Liu. El repositorio se crea para facilitar la descarga reproducible del checkpoint, que originalmente se distribuía a través de una carpeta compartida de Google Drive.

El modelo combina un backbone Swin-Tiny con el esquema de entrenamiento Co-DETR, que añade cabezas auxiliares con asignación one-to-many para mejorar la convergencia y la discriminación de las características del encoder. El checkpoint corresponde a un entrenamiento de 36 épocas (esquema 3x) y alcanza un box AP de 54.1 en el conjunto de validación de COCO 2017. Tiene aproximadamente 49.3 millones de parámetros en inferencia, según los datos incluidos en la model card. No es un modelo de lenguaje; su pipeline es `object-detection`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer detector (Co-DETR / Deformable-DETR) con backbone Swin-Tiny |
| Parametros totales | 49.3M (aprox., segun la model card como "Params (inference)") |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | No disponible (no se han publicado pesos cuantizados) |
| Idiomas soportados | `en` (etiqueta del Hub; el modelo es de vision y no procesa texto) |
| Licencia | `unknown` (no determinada en la model card) |
| Formato de pesos | PyTorch `.pth` + archivo de config `.py` (checkpoint MMDetection 2.x) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Co-DETR, un esquema de entrenamiento colaborativo para DETR, no una arquitectura completamente nueva. Junto al decoder DETR, que utiliza matching húngaro one-to-one, se añaden cabezas auxiliares con asignación one-to-many: una cabeza ATSS y una cabeza RoI estilo Faster R-CNN. Las propuestas positivas generadas por estas cabezas se retroalimentan al decoder como queries adicionales, lo que hace que las características del encoder sean más discriminativas y acelera la convergencia. Las cabezas auxiliares solo se usan durante el entrenamiento.

El backbone es Swin-Tiny. El modelo fue entrenado sobre el dataset COCO 2017 con un esquema 3x, equivalente a 36 épocas. Los datos de entrenamiento no se redistribuyen en este repositorio; solo se alojan los pesos preentrenados. No se han realizado procesos de RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Detección de objetos en imágenes: localiza y clasifica múltiples objetos en una imagen mediante bounding boxes.
- Inferencia sobre vídeo, webcam, carpetas o imágenes individuales a través del script `tools/inference.py` del fork mantenido.
- Exportación de resultados a JSON mediante el flag `--save-json`.
- Soporte de las categorías del dataset COCO.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No es un modelo multimodal de lenguaje; solo procesa señales visuales.
- La model card indica que el pipeline es `object-detection` y que la inferencia requiere el stack de OpenMMLab (MMDetection 2.x).

## Casos de uso

- Analítica de tráfico en vídeo: el modelo puede detectar vehículos, peatones y objetos en vídeos de cámaras de vigilancia urbana. Gracias a su soporte de inferencia sobre vídeo y a su exportación a JSON, es adecuado para integrarse en pipelines de conteo o análisis de flujo.
- Detección de objetos en dashcams: la model card incluye una demo con vídeo de dashcams, lo que indica que el modelo funciona bien en escenas de conducción. Puede usarse para alertar sobre peatones, vehículos u obstáculos en tiempo real.
- Control de calidad industrial: puede detectar defectos o piezas concretas en líneas de producción capturadas por cámaras fijas. Su tamaño moderado (49.3M) permite ejecutarlo en GPU de gama media.
- Anotación automática de datasets: el checkpoint puede usarse para pre-etiquetar imágenes y así reducir el tiempo de anotación manual en proyectos de visión por computador. La exportación a JSON facilita la integración con herramientas de etiquetado.
- Vigilancia y seguridad perimetral: detección de personas, vehículos o paquetes en imágenes de cámaras de seguridad. La capacidad de inferir sobre flujos de vídeo permite construir sistemas de alerta básicos.
- Inventario en retail: detección de productos en estanterías a partir de imágenes de cámaras o fotos tomadas con móviles. El modelo puede servir como componente de un sistema de reposición o conteo automático.
- Detección en imágenes aéreas o de drones: al estar entrenado con COCO, funciona en dominios generales; puede usarse para detectar vehículos o estructuras en imágenes tomadas desde el aire, siempre que se evalúe antes su rendimiento en ese dominio específico.

## Benchmarks y rendimiento

Según la model card, el autor declara el siguiente resultado para el checkpoint `co_deformable_detr_swin_tiny_3x_coco`:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Deteccion de objetos | COCO 2017 val (val2017) | box AP | 54.1 |

El resultado está marcado como `verified: false` en la model card. No se han publicado resultados de benchmarks adicionales en la información disponible. Para un modelo de detección de objetos, métricas como MMLU, HumanEval o GSM8K no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card no publica mediciones de consumo de VRAM.
- GPU recomendadas: no disponible. No hay datos oficiales; al tratarse de un modelo con unos 49.3M de parámetros, debería ejecutarse en una GPU compatible con PyTorch y CUDA, pero no se ha verificado un requisito mínimo.
- En consumer GPU: probablemente ejecutable en tarjetas de gama media, pero no hay datos confirmados.
- Opciones de despliegue: requiere el stack de OpenMMLab. El fork `dronefreak/Co-DETR` incluye un script `tools/setup_codetr_env.sh` que construye un entorno conda llamado `codetr` con MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11. No es compatible con vLLM, Ollama, llama.cpp ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han encontrado comparativas con modelos alternativos en la información proporcionada. Existen otros checkpoints del ecosistema Co-DETR, como los basados en Swin-Base o ResNet-50, pero no se dispone de datos de rendimiento verificados para incluirlos en esta ficha. Por tanto, la comparativa directa queda como no disponible.

## Limitaciones y advertencias

- La licencia de los pesos es `unknown`. El uso comercial es arriesgado hasta que se aclare la situación legal.
- Este repositorio es un espejo no oficial. No aporta contribución al método ni al entrenamiento; los créditos pertenecen a los autores originales.
- La inferencia no es posible con la API estándar de `transformers`. Requiere el entorno legacy de MMDetection 2.x y el código del proyecto Co-DETR.
- El resultado de box AP 54.1 está marcado como no verificado. Puede que no sea reproducible sin el entorno exacto de entrenamiento e inferencia.
- No se incluyen datos de entrenamiento ni de evaluación redistribuidos en este repositorio.
- No se han publicado variantes cuantizadas del modelo, por lo que el checkpoint ocupa más espacio que una versión cuantizada.
- Riesgo de falsos positivos o detecciones incorrectas, especialmente en dominios muy distintos a COCO.
- El dataset COCO tiene sesgos hacia ciertas categorías y condiciones de imagen; esto puede afectar a aplicaciones en dominios específicos.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/dronefreak/co-deformable-detr-swin-t-3x-coco
- Paper original: https://arxiv.org/abs/2211.12860
- Repositorio oficial de Co-DETR: https://github.com/Sense-X/Co-DETR
- Fork mantenido con entorno e inferencia: https://github.com/dronefreak/Co-DETR
