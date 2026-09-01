# Pranilllllll/geonusaf-s4-segformer-b0-R0-block-fold1

## Resumen

El modelo `Pranilllllll/geonusaf-s4-segformer-b0-R0-block-fold1` es un sistema de segmentación semántica para teledetección, desarrollado por el usuario Pranilllllll en el contexto del proyecto GeoNUSAF. Su objetivo es clasificar el uso del suelo en el valle de Katmandú (Nepal) a partir de imágenes de satélite, distinguiendo seis categorías: residencial, carretera, río, bosque, suelo no utilizado y agrícola. Se trata de la etapa 4 del pipeline GeoNUSAF, concretamente el "arm R0" (solo datos reales) con un "block fold 1" como partición de validación.

El modelo se basa en la arquitectura SegFormer-B0, un transformer jerárquico ligero diseñado para segmentación semántica, e incorpora un índice de ignorancia (`ignore_index=255`) para píxeles no etiquetados. El repositorio ocupa 1,6 GB y está alojado en Hugging Face con la librería `transformers`. Aunque no se publica licencia ni idiomas específicos, su uso está orientado a aplicaciones de análisis geoespacial y planificación territorial.

La relevancia actual del modelo radica en su enfoque en datos sintéticos frente a reales: este "arm R0" se entrena únicamente con 804 pares reales (sin aumentación sintética), lo que permite evaluar el impacto de los datos generados en otras variantes del proyecto. Las métricas de validación muestran un mIoU de 0,4637, con un rendimiento notablemente superior en clases como residencial y bosque, y más débil en carreteras, ríos y suelo no utilizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SegFormer-B0 (transformer jerárquico con atención eficiente) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 1,6 GB, compatible con `transformers`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SegFormer-B0, un transformer jerárquico que combina un encoder con atención de ventana reducida y un decoder ligero basado en MLP. Está diseñado para segmentación semántica eficiente en términos de parámetros y cómputo, aunque no se especifican los detalles exactos de la implementación (número de capas, dimensiones ocultas) en la información disponible.

El entrenamiento se realizó en el marco del proyecto GeoNUSAF, etapa 4, con el "arm R0" que utiliza únicamente 804 pares de imágenes reales (sin datos sintéticos, a diferencia de otros arms). El particionado es "block fold 1", con un conjunto de validación de 136 teselas reales. El programa de entrenamiento consistió en 6000 pasos con warmup de 500 pasos y decaimiento coseno hasta 6000. Se emplearon pesos de clase calculados a partir de los datos reales y una semilla fija de 42. El mejor paso se registró en el paso 5200, alcanzando las métricas de validación reportadas.

La validación se realizó exclusivamente sobre píxeles reales, sin presencia de píxeles sintéticos, lo que garantiza una evaluación limpia del rendimiento en datos reales. El autor advierte que esta ejecución no es directamente comparable con la parte 1 del fold 1, debido a diferencias en la aumentación de datos (bug de `persistent_workers`), determinismo y programación por épocas.

## Capacidades

- Segmentación semántica de imágenes de teledetección, clasificando cada píxel en una de seis clases: residencial, carretera, río, bosque, suelo no utilizado y agrícola.
- Soporte de `ignore_index=255` para píxeles no etiquetados, útil en escenarios con máscaras parciales.
- Compatible con la librería `transformers` de Hugging Face, lo que permite integración directa con pipelines estándar de segmentación.
- Diseñado específicamente para el dominio geoespacial, con datos del valle de Katmandú.
- No incluye capacidades de generación de texto, tool calling, agentes ni multimodalidad; es un modelo de visión puro.

## Casos de uso

- Mapeo de uso del suelo urbano: el modelo puede clasificar automáticamente imágenes satelitales para generar mapas actualizados de zonas residenciales, carreteras y áreas verdes, apoyando la planificación urbana en el valle de Katmandú.
- Monitoreo ambiental: la detección de bosque, ríos y suelo no utilizado permite seguir cambios en la cobertura vegetal o en los cauces fluviales, útil para estudios de impacto ambiental.
- Gestión de recursos agrícolas: la clase agrícola puede utilizarse para estimar la extensión de cultivos y apoyar políticas de seguridad alimentaria.
- Detección de asentamientos informales: la clase residencial, con un IoU de 0,79, puede ayudar a identificar áreas de crecimiento urbano no planificado.
- Evaluación de riesgos de inundación: la segmentación de ríos y zonas no utilizadas puede combinarse con modelos hidrológicos para cartografiar zonas vulnerables.
- Análisis de infraestructura vial: aunque la clase carretera tiene un IoU bajo (0,29), el modelo puede servir como punto de partida para refinar redes de carreteras en entornos con datos limitados.

## Benchmarks y rendimiento

Los resultados de validación sobre 136 teselas reales del fold 1 son los siguientes:

| Metrica | Valor |
|---|---|
| mIoU | 0,4637 |
| mF1 | 0,5929 |
| OA (Overall Accuracy) | 0,7786 |
| Kappa | 0,6300 |

Desglose por clase (IoU / F1):

| Clase | IoU | F1 |
|---|---|---|
| Residential | 0,7918 | 0,8838 |
| Road | 0,2905 | 0,4502 |
| River | 0,1441 | 0,2518 |
| Forest | 0,7444 | 0,8535 |
| UnusedLand | 0,2485 | 0,3981 |
| Agricultural | 0,5625 | 0,7200 |

No se han publicado resultados comparativos con otros modelos en la información proporcionada.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU concretos en la documentación del modelo.
- Dado que se trata de un SegFormer-B0, la arquitectura es ligera en parámetros (aunque no se confirma el número exacto), y el tamaño del repositorio es de 1,6 GB, lo que sugiere que puede ejecutarse en GPUs de gama media (por ejemplo, RTX 3060 o superior) con suficiente memoria para la inferencia.
- Para despliegue se recomienda usar la librería `transformers` de Hugging Face, que ofrece integración con pipelines de segmentación y exportación a ONNX (como se muestra en el ejemplo de GeoAI).
- No hay datos de latencia o throughput disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma tarea (segmentación de uso del suelo en Katmandú) dentro de los datos proporcionados. Se recomienda consultar el resto de variantes del proyecto GeoNUSAF (por ejemplo, `Pranilllllll/geonusaf-segNext-block-fold1`) para comparaciones internas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con datos del valle de Katmandú, por lo que su generalización a otras regiones geográficas puede ser limitada.
- Las clases minoritarias o de baja representación (carretera, río, suelo no utilizado) presentan métricas notablemente bajas (IoU entre 0,14 y 0,29), lo que indica dificultades para segmentar estos elementos.
- La validación se realizó sin píxeles sintéticos, pero el entrenamiento con solo datos reales puede no capturar toda la variabilidad del terreno.
- No se ha publicado licencia, lo que impide conocer las restricciones de uso comercial o redistribución.
- El autor advierte que esta ejecución no es comparable con la parte 1 del fold 1 debido a diferencias en la aumentación, determinismo y programación.
- No se proporcionan detalles sobre el preprocesado de imágenes (tamaño de entrada, normalización, etc.), lo que dificulta la reproducción exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pranilllllll/geonusaf-s4-segformer-b0-R0-block-fold1
- Repositorio de archivos del modelo: https://huggingface.co/Pranilllllll/geonusaf-s4-segformer-b0-R0-block-fold1/tree/main
- Modelo relacionado (etapa 4, variante segNext): https://huggingface.co/Pranilllllll/geonusaf-segNext-block-fold1
- Implementación oficial de SegFormer (NVlabs): https://github.com/NVlabs/SegFormer
- Código de SegFormer en `transformers`: https://github.com/huggingface/transformers/blob/main/src/transformers/models/segformer/modeling_segformer.py
- Ejemplo de inferencia ONNX para teledetección (GeoAI): https://opengeoai.org/examples/onnx/
