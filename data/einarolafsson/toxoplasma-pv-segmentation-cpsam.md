# einarolafsson/toxoplasma-pv-segmentation-cpsam

## Resumen

Toxoplasma PV v1 es un modelo de segmentación de imágenes basado en Cellpose-SAM (`cpsam`), un fine-tune específico para detectar vacuolas parasitóforas (PV) de *Toxoplasma gondii* en campos de microscopía de fluorescencia. Desarrollado por Einar Olafsson, el modelo se integra en el pipeline de spaCR para el análisis de imágenes de parásitos, y está disponible bajo licencia MIT.

El modelo aborda un problema concreto: la segmentación precisa de PVs de *Toxoplasma* en imágenes de fluorescencia, superando al modelo base `cpsam` original en métricas clave como F1, mAP y Jaccard agregado. Está entrenado con 115 pares imagen/máscara (104 de entrenamiento, 11 de test) durante 100 épocas, partiendo de los pesos de `cpsam_v2`. Su relevancia radica en que ofrece una solución lista para usar en flujos de análisis de imágenes de parasitología, con mejoras significativas en generalización a condiciones cruzadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cellpose-SAM (cpsam) con backbone SAM-ViTL |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 1.2 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Cellpose-SAM (`cpsam`), que combina el enfoque de segmentación celular de Cellpose con el backbone de visión SAM-ViTL. El fine-tune se realizó sobre los pesos preentrenados de `cpsam_v2`, ajustando el modelo para la tarea específica de segmentar vacuolas parasitóforas de *Toxoplasma gondii*.

El entrenamiento utilizó 115 pares imagen/máscara (104 para entrenamiento, 11 para test) durante 100 épocas. Las imágenes de entrenamiento incluyen dos condiciones de tinción: vacuolas teñidas con goat anti-Toxoplasma-biotina y taquizoitos que expresan DsRed en el lumen de la PV. No se menciona el uso de RLHF, DPO u otras técnicas de alineación, al tratarse de un modelo de visión puro.

## Capacidades

- Segmentación de vacuolas parasitóforas de *Toxoplasma gondii* en imágenes de microscopía de fluorescencia.
- Detección de objetos con precisión a nivel de instancia, con métricas F1 de 0.864 a IoU 0.5.
- Generalización a condiciones cruzadas (diferentes tinciones o preparaciones) con mejora del 2.2% en F1 respecto a la ronda 1 de entrenamiento.
- Integración directa con el módulo Mask de spaCR para pipelines de análisis de imágenes de parásitos.
- Inferencia sobre campos completos de microscopía, no requiere recorte manual de regiones.
- Adecuado para tareas de conteo y estimación de área, más que para morfometría precisa.

## Casos de uso

- Conteo automatizado de vacuolas parasitóforas en ensayos de infección: el modelo permite cuantificar el número de PVs por campo de forma objetiva y reproducible, sustituyendo el conteo manual en experimentos de biología celular.
- Análisis de carga parasitaria en estudios de drogas: al segmentar PVs en imágenes de fluorescencia, se puede medir la eficacia de compuestos antiparasitarios comparando el área total ocupada por vacuolas entre condiciones tratadas y control.
- Screening de mutantes de *Toxoplasma*: la segmentación precisa permite comparar fenotipos de cepas mutantes en cuanto a tamaño y número de vacuolas, facilitando la identificación de genes implicados en la biogénesis de la PV.
- Integración en pipelines de análisis de imagen de alto contenido (HCA): el modelo puede ejecutarse sobre placas de 96 o 384 pocillos, generando máscaras de PVs para análisis estadísticos posteriores.
- Validación de protocolos de tinción: al comparar el rendimiento del modelo entre diferentes marcajes (biotina vs DsRed), se puede evaluar la calidad de nuevas preparaciones de fluorescencia.
- Automatización de flujos de trabajo en laboratorios de parasitología: combinado con spaCR, el modelo permite procesar grandes volúmenes de imágenes sin intervención manual, reduciendo el tiempo de análisis de horas a minutos.

## Benchmarks y rendimiento

El modelo reporta resultados sobre un conjunto de validación NAS (n=11 campos, 624 objetos) comparado con el modelo `cpsam` original:

| Metrica | cpsam original | Toxoplasma PV v1 |
|---|---:|---:|
| F1 @ IoU 0.5 | 0.713 | **0.867** |
| mAP (0.5–0.9) | 0.322 | **0.595** |
| Jaccard agregado | 0.426 | **0.808** |

Rendimiento por umbral de IoU en el conjunto de validación de ronda 2:

| IoU | Precision | Recall | F1 | AP |
|---|---:|---:|---:|---:|
| 0.5 | 0.843 | 0.886 | 0.864 | 0.802 |
| 0.7 | 0.768 | 0.808 | 0.788 | 0.658 |
| 0.9 | 0.311 | 0.327 | 0.319 | 0.170 |

Comparación entre rondas de entrenamiento (generalización):

| Conjunto | n | Ronda 1 F1 | Ronda 2 F1 | Δ |
|---|---:|---:|---:|---:|
| NAS held-out (in-domain) | 11 | 0.8668 | 0.8641 | −0.003 |
| Curated-new (cross-condition) | 40 | 0.8625 | **0.8848** | +0.022 |

El Jaccard agregado en el conjunto cross-condition mejoró de 0.784 a 0.920 entre rondas.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Dado que el modelo usa backbone SAM-ViTL, se estima un consumo de memoria similar al de Cellpose-SAM estándar (aproximadamente 4-8 GB en FP16 para imágenes de 512x512, aunque no se confirma).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM debería ser suficiente para inferencia en imágenes de microscopía típicas. Se recomienda una RTX 3060 o superior para flujos de trabajo interactivos.
- Compatibilidad con GPU de consumo: sí, el modelo es ligero y puede ejecutarse en GPUs de gama media como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: el modelo se integra con la librería Cellpose (versión 4.2.1 o superior) y con spaCR. Puede usarse mediante Python API, o exportarse a ONNX para despliegue en entornos de producción.
- Latencia y throughput: no disponible. Se espera un rendimiento similar al de Cellpose-SAM base, con tiempos de inferencia del orden de segundos por campo de imagen en GPU moderna.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Rendimiento F1 @ IoU 0.5 | Licencia |
|---|---|---|---|---|---|
| Toxoplasma PV v1 | Cellpose-SAM (SAM-ViTL) | no disponible | no aplicable | 0.867 | MIT |
| cpsam original | Cellpose-SAM (SAM-ViTL) | no disponible | no aplicable | 0.713 | MIT |
| Cellpose 2.0 | U-Net residual | ~40M | no aplicable | no comparable (no específico para PV) | BSD-3 |

No se dispone de otros modelos específicos para segmentación de vacuolas parasitóforas de *Toxoplasma* en la información proporcionada. La comparación principal es contra el modelo base `cpsam`, que es el punto de partida del fine-tune.

## Limitaciones y advertencias

- La precisión cae bruscamente por encima de IoU 0.8 (F1 de 0.319 a IoU 0.9), lo que indica que los límites de las vacuolas son aproximados. El modelo es adecuado para conteo y estimación de área, pero no para morfometría precisa.
- Entrenado únicamente con dos tipos de tinción (goat anti-Toxoplasma-biotina y DsRed en lumen de PV). Otros marcajes o preparaciones no han sido probados y podrían degradar el rendimiento.
- El conjunto de validación in-domain es pequeño (11 campos), por lo que las diferencias de rendimiento entre rondas en ese conjunto están dentro del ruido estadístico.
- No se han evaluado sesgos potenciales relacionados con variaciones en la intensidad de fluorescencia, ruido de fondo o artefactos de adquisición.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías de precisión en entornos clínicos o de diagnóstico.
- No se proporcionan datos sobre el rendimiento en imágenes de otros microscopios o configuraciones ópticas diferentes a las usadas en el entrenamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/einarolafsson/toxoplasma-pv-segmentation-cpsam
- Perfil del autor: https://huggingface.co/einarolafsson
- Documentación de modelos Cellpose: https://cellpose.readthedocs.io/en/latest/models.html
- Documentación de Cellpose models (código fuente): https://cellpose.readthedocs.io/en/latest/_modules/cellpose/models.html
- Artículo relacionado sobre la membrana de la vacuola parasitófora: https://journals.plos.org/plospathogens/article?id=10.1371/journal.ppat.1014473
