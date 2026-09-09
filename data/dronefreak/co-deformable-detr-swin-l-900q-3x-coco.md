# dronefreak/co-deformable-detr-swin-l-900q-3x-coco

## Resumen

Co-DETR ("DETRs with Collaborative Hybrid Assignments Training") es un esquema de entrenamiento para detectores de objetos basados en transformers, desarrollado por Zhuofan Zong, Guanglu Song y Yu Liu (SenseTime X-Lab) y presentado en ICCV 2023. Este checkpoint concreto combina la arquitectura Co-Deformable-DETR con un backbone Swin-Large y 900 consultas de decoder, entrenado durante 36 épocas (esquema 3x) sobre el dataset COCO 2017. El modelo alcanza un AP de caja (box AP) de 58.5 en el conjunto de validación de COCO 2017, según los datos informados por el autor.

La innovación principal de Co-DETR reside en el entrenamiento colaborativo mediante asignaciones híbridas: además de la asignación uno-a-uno del decoder DETR (matching húngaro), se añaden cabezas auxiliares que utilizan asignaciones uno-a-muchos (una cabeza ATSS y una cabeza de tipo Faster R-CNN con RoI). Las propuestas positivas generadas por estas cabezas se restituyen al decoder como consultas adicionales, lo que mejora la discriminación de las características del encoder y acelera la convergencia. El modelo contiene 219.3 M de parámetros según la model card.

Este repositorio de Hugging Face es un espejo no oficial del checkpoint original alojado en Google Drive por los autores. Se trata de un detector de objetos puro, no de un modelo de lenguaje, y requiere el stack MMDetection 2.x (concretamente MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11) para su ejecución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Co-DETR (Deformable-DETR con entrenamiento de asignaciones híbridas colaborativas) con backbone Swin-Large |
| Parametros totales | 219.3 M (según el autor, "Params (inference)") |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de detección de objetos; procesa imágenes a resolución variable) |
| Tipos de cuantizacion | No disponible (no se mencionan pesos cuantizados en la información disponible) |
| Idiomas soportados | En (según la model card; no aplica a capacidades de lenguaje reales) |
| Licencia | Desconocida ("unknown" en Hugging Face; el autor indica "undetermined") |
| Formato de pesos | .pth (checkpoint de PyTorch) + .py (configuración de MMDetection) |

## Arquitectura y entrenamiento

Co-DETR no introduce una arquitectura nueva, sino un esquema de entrenamiento aplicable a la familia Deformable-DETR. El método combina la asignación uno-a-uno del decoder DETR (basada en matching húngaro) con cabezas auxiliares que emplean asignaciones uno-a-muchos. Concretamente, se añade una cabeza ATSS y una cabeza de tipo Faster R-CNN con RoI, cuyas propuestas positivas se alimentan de vuelta al decoder como consultas extra. Esto aumenta la supervisión sobre el encoder y acelera la convergencia respecto a Deformable-DETR estándar.

El checkpoint usa un backbone Swin-Large (Swin-L), 900 consultas de decoder y un esquema de entrenamiento 3x (36 épocas) sobre el dataset COCO 2017. La model card indica que no es un modelo de tipo transformers de Hugging Face: requiere el proyecto Co-DETR y el stack OpenMMLab 1.x. No se menciona RLHF ni DPO, ya que no aplica a un detector de objetos. Los autores originales no publicaron este checkpoint en Hugging Face; se distribuye como espejo del archivo alojado en Google Drive.

## Capacidades

- Detección de objetos en imágenes y vídeo: devuelve cajas delimitadoras (bounding boxes) y etiquetas para las 80 clases del dataset COCO.
- Procesamiento de imágenes a múltiples resoluciones gracias al backbone jerárquico Swin-Large.
- Soporte para inferencia en vídeo y webcam mediante el script `tools/inference.py` del repositorio mantenido por `dronefreak`.
- Integración con el ecosistema MMDetection: compatible con pipelines de entrenamiento, evaluación y despliegue de OpenMMLab.
- No dispone de capacidades de lenguaje: no genera texto, no responde preguntas sobre imágenes, no produce captions ni soporta tool calling.
- No soporta agentes ni razonamiento multi-paso, al no ser un modelo de lenguaje.
- No es multilingüe en el sentido de procesamiento de lenguaje; la etiqueta "en" de la model card se refiere al idioma de la documentación.

## Casos de uso

1. **Detección de objetos en conducción autónoma**: el modelo puede procesar secuencias de vídeo de dashcam y detectar peatones, vehículos y señales de tráfico. Su backbone Swin-Large y las 900 consultas de decoder permiten manejar escenas complejas con múltiples objetos. Se integraría mediante `tools/inference.py` para procesar vídeo o webcam.

2. **Vigilancia y seguridad perimetral**: mediante cámaras fijas, el modelo puede detectar personas, vehículos o intrusiones en zonas restringidas. Apto para sistemas de vídeoanalítica que requieran alta precisión sobre las 80 clases de COCO. Su AP de 58.5 en COCO val lo sitúa en un rango competitivo para escenarios de vigilancia general.

3. **Inspección de calidad en manufactura**: con un ajuste fino (fine-tuning) sobre un dataset específico de piezas defectuosas, el modelo puede localizar anomalías visuales en líneas de producción. El entrenamiento colaborativo de las cabezas auxiliares facilita la detección de objetos pequeños y superpuestos, un requisito habitual en inspección industrial.

4. **Conteo de personas y análisis de flujo peatonal**: el modelo puede utilizarse para contar personas en espacios públicos (centros comerciales, estaciones, eventos) a partir de vídeo. La salida de cajas delimitadoras permite derivar trayectorias y estimar densidades, siendo adecuado para sistemas de análisis de aforo.

5. **Análisis de tráfico y movilidad urbana**: permite detectar vehículos en intersecciones, medir la ocupación de carriles o monitorizar flujo vehicular. La robustez del backbone Swin-Large es útil en imágenes con oclusiones y variabilidad de iluminación, como ocurre en cámaras de tráfico.

6. **Detección de objetos en imágenes aéreas y de satélite**: aplicado a fotogramas de drones o satélites, puede identificar edificios, vehículos y embarcaciones tras un ajuste fino con datos de ese dominio. La resolución jerárquica del Swin-Large permite trabajar con imágenes de alta resolución sin sacrificar el rendimiento en objetos pequeños.

## Benchmarks y rendimiento

Según el model-index de la model card, el rendimiento declarado por el autor es:

| Modelo | Conjunto de datos | Métrica | Valor |
|---|---|---|---|
| Co-DETR Swin-L (900q, 3x) | COCO 2017 val (val2017) | box AP | 58.5 |

Nota: el campo "verified" del model-index es `false`, lo que indica que el resultado no ha sido verificado de forma independiente por Hugging Face.

Como referencia dentro de la misma familia, el repositorio oficial de Co-DETR (Sense-X) informa que la variante con ViT-L (304 M de parámetros) alcanza 65.6 AP y 66.0 AP en COCO test-dev. No se han publicado resultados de benchmarks adicionales para este checkpoint en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no se ha facilitado una medición oficial. Para almacenar los pesos en FP32, se necesitan aproximadamente 877 MB (219.3 M parámetros × 4 bytes). Sumando las activaciones del backbone Swin-Large y las cabezas auxiliares, es razonable estimar un consumo de entre 12 y 24 GB de VRAM para resoluciones de entrada típicas (896×896 o superiores). Esta estimación no está verificada.
- **GPU recomendadas**: NVIDIA A100, H100, RTX 4090, o tarjetas profesionales con 24 GB o más de VRAM.
- **Consumer GPU**: una RTX 3090 o 4090 podría ejecutar el modelo con resoluciones moderadas. No se recomienda para GPUs con menos de 16 GB de VRAM.
- **Opciones de despliegue**: el modelo requiere el repositorio de Co-DETR y el stack MMDetection 2.x (MMCV-full 1.5.0, PyTorch 1.11). El fork mantenido por `dronefreak` ofrece un script `tools/setup_codetr_env.sh` que prepara el entorno. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que son herramientas orientadas a modelos de lenguaje.
- **Latencia y throughput**: no disponible.
- **Inferencia directa**: la model card indica `inference: false`, lo que significa que no es un modelo usable con el pipeline de Hugging Face Transformers. Se debe usar mediante el script `tools/inference.py` del proyecto Co-DETR.

## Comparativa con modelos similares

Se presentan dos variantes de Co-DETR. No se dispone de datos comparables con otros detectores en la información proporcionada.

| Variante | Backbone | Parámetros | Rendimiento (COCO) | Licencia |
|---|---|---|---|---|
| Co-DETR Swin-L (este) | Swin-Large | 219.3 M | AP 58.5 (val2017) | Desconocida |
| Co-DETR ViT-L | ViT-L | 304 M | AP 65.6 / 66.0 (test-dev) | Desconocida |

Ambas comparten el mismo esquema de entrenamiento colaborativo. La diferencia de rendimiento se debe principalmente al backbone: ViT-L es más potente pero también más costoso en cómputo. No se dispone de información sobre licencias específicas para los pesos de ninguna de las dos variantes.

## Limitaciones y advertencias

- **Licencia no definida**: la model card indica `license: unknown` y el autor del espejo señala que la licencia de los pesos es "undetermined". Antes de cualquier uso comercial o en producción, se debe contactar con los autores originales para aclarar los términos de uso.
- **Checkpoint no oficial**: este repositorio es un espejo del checkpoint original alojado en Google Drive. No es una publicación oficial de SenseTime. Puede ser retirado o transferido a petición de los autores.
- **Benchmark no verificado**: la AP de 58.5 está declarada por el autor pero no ha sido verificada de forma independiente.
- **Dependencia de un stack legado**: requiere MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11. Estos paquetes tienen versiones antiguas y pueden presentar problemas de compatibilidad con entornos modernos.
- **Solo detección de objetos**: el modelo no genera texto, no puede responder preguntas sobre imágenes ni realizar tareas de visión-lenguaje. Su única salida son cajas delimitadoras y etiquetas de clase.
- **Limitado a clases COCO**: sin ajuste fino, solo detecta las 80 clases del dataset COCO. Para dominios distintos hay que reentrenar o ajustar con datos propios.
- **Riesgo de falsos positivos**: como todo detector, puede producir detecciones erróneas en escenas con oclusiones, iluminación adversa u objetos parecidos a las clases objetivo. No se dispone de tasas de error específicas por clase.
- **Sin soporte de cuantización**: no se proporcionan pesos cuantizados, lo que limita su despliegue en entornos con poca VRAM.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/dronefreak/co-deformable-detr-swin-l-900q-3x-coco
- Paper (ICCV 2023): https://arxiv.org/abs/2211.12860
- Repositorio oficial del proyecto Co-DETR: https://github.com/Sense-X/Co-DETR
- Repositorio mantenido (con script de entorno): https://github.com/dronefreak/Co-DETR
- Configuración del modelo: https://github.com/zzx135790/Co-detr/blob/main/projects/configs/co_deformable_detr/co_deformable_detr_swin_large_900q_3x_coco.py
