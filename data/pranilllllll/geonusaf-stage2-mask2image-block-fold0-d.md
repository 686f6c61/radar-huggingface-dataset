# Pranilllllll/geonusaf-stage2-mask2image-block-fold0-D

## Resumen

El modelo `Pranilllllll/geonusaf-stage2-mask2image-block-fold0-D` es un generador de imágenes satelitales condicionado por máscaras de uso de suelo, desarrollado por el autor Pranilllllll como parte del proyecto GeoNUSAF. Su función principal es "pintar" una imagen de satélite de la región del Valle de Katmandú a partir de una máscara de 7 clases de cobertura terrestre, lo que permite generar pares sintéticos (imagen + máscara) para entrenar modelos de segmentación semántica. Se trata de un modelo de difusión basado en Stable Diffusion v1.5 con una rama de ControlNet para segmentación, afinado con LoRA. El repositorio ocupa 10.3 GB y está publicado bajo la librería `diffusers`, aunque no se especifica licencia ni idiomas.

La relevancia de este modelo radica en su enfoque específico para teledetección: permite aumentar conjuntos de datos de segmentación de forma controlada, generando imágenes realistas a partir de máscaras sintéticas o predichas por un modelo previo (Stage 1). Al estar entrenado únicamente con los tiles de entrenamiento del fold 0, evita la fuga de datos de validación, lo que lo hace útil para investigación reproducible en generación de datos geoespaciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion v1.5 (base congelado) + ControlNet (control_v11p_sd15_seg) + LoRA (r16, alpha 16) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, resolución 512x512 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | diffusers (formato de archivo no especificado) |

## Arquitectura y entrenamiento

El modelo combina un Stable Diffusion v1.5 congelado como generador base y una rama de ControlNet preentrenada (`lllyasviel/control_v11p_sd15_seg`) que se inicializa con los pesos originales y se afina durante el entrenamiento. Sobre esta estructura se aplica un LoRA con rango 16 y alpha 16 en las proyecciones `to_q`, `to_k`, `to_v` y `to_out.0` de los bloques de atención. La condición de entrada es una máscara de una sola canal con índices de clase `{0..5}` y valor `255` (o `6`) para píxeles ignorados, codificada en one-hot de 7 canales.

El entrenamiento se realizó a resolución 512x512 píxeles con un GSD (tamaño de píxel en el terreno) de 0.586 m/px. Se usó el split de bloques fold 0, con los tiles de entrenamiento únicamente (los de validación nunca participan en el gradiente). El muestreo se hizo con DDIM de 30 pasos y guidance scale 7.5. Se emplearon 700 pasos de entrenamiento con tasas de aprendizaje de 0.0001 para el LoRA y 1e-05 para la rama de ControlNet. El seed fijado fue 42. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de imágenes satelitales de 512x512 píxeles a partir de una máscara de uso de suelo de 7 clases (6 clases reales + clase de ignorar).
- Condicionamiento por máscara one-hot de 7 canales, compatible con máscaras reales o generadas por un modelo previo (Stage 1).
- Salida emparejada: genera simultáneamente la imagen sintética (`genimage{i}.png`) y la máscara correspondiente (`genmask{i}.png`), listas para entrenamiento de segmentación.
- No soporta tool calling, agentes, razonamiento multi-paso, ni capacidades multimodales más allá de la entrada de máscara y salida de imagen.
- No tiene capacidades multilingües; es un modelo puramente visual.

## Casos de uso

- Aumento de datos para segmentación semántica de uso de suelo: el modelo genera pares imagen-máscara sintéticos que pueden combinarse con datos reales para mejorar la robustez de modelos como UNetFormer o similares en entornos urbanos.
- Simulación de escenarios de planificación urbana: a partir de máscaras hipotéticas (por ejemplo, nuevas zonas residenciales o áreas verdes), se pueden generar imágenes satelitales realistas para evaluar impactos visuales.
- Generación de datos de entrenamiento para modelos de detección de cambios: al crear variaciones de la misma máscara con diferentes estilos de imagen, se pueden construir pares temporales sintéticos.
- Validación de pipelines de generación condicionada: el modelo sirve como referencia para comparar la fidelidad de la generación (métricas FID, KID, mIoU) en tareas de teledetección.
- Creación de conjuntos de datos balanceados: permite sobremuestrear clases minoritarias (por ejemplo, agua o vegetación) generando imágenes adicionales con esas máscaras.
- Investigación en generación de imágenes geoespaciales: el modelo es un punto de partida para estudiar el efecto de la condición de máscara en la calidad de la imagen sintética, con métricas publicadas.

## Benchmarks y rendimiento

El autor reporta las siguientes métricas en la model card:

| Metrica | Valor |
|---|---|
| Layout mIoU (generado) | 0.1918 |
| Layout mIoU (techo real) | 0.2945 |
| Layout ratio | 0.651 |
| KID | 0.07830 ± 0.01131 |
| FID | 179.80 |

No se han publicado comparaciones con otros modelos en la información disponible. Estas métricas indican la fidelidad de la generación respecto a la máscara de entrada (mIoU) y la calidad perceptual de las imágenes (FID, KID).

## Requisitos de hardware

- No se dispone de datos oficiales sobre requisitos de hardware en la información proporcionada.
- Dado que el modelo se basa en Stable Diffusion v1.5 con ControlNet y LoRA, se estima que la inferencia en fp16 requiere al menos 8 GB de VRAM para una resolución de 512x512, pero este dato no está confirmado por el autor.
- El tamaño del repositorio (10.3 GB) sugiere que los pesos completos en precisión fp32 podrían ocupar más de 10 GB, por lo que se recomienda cuantización o uso de GPUs con al menos 16 GB para entrenamiento.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, etc.); al ser un modelo de difusión, se usaría típicamente con la librería `diffusers` y pipelines de ControlNet.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El proyecto GeoNUSAF incluye otros modelos (Stage 1 de generación de máscaras y un segmentador UNetFormer), pero no se ofrecen comparativas directas con alternativas externas.

## Limitaciones y advertencias

- No se especifica licencia, por lo que el uso comercial o la redistribución pueden estar sujetos a restricciones desconocidas.
- El modelo está entrenado exclusivamente con datos del Valle de Katmandú (fold 0), por lo que su generalización a otras regiones geográficas o estilos de imagen satelital no está garantizada.
- Las métricas de calidad (FID 179.80, KID 0.078) indican una fidelidad limitada; las imágenes generadas pueden presentar artefactos o inconsistencias con la máscara de entrada.
- La resolución fija de 512x512 y el GSD de 0.586 m/px limitan su uso a escalas específicas; no es adecuado para imágenes de mayor resolución sin adaptación.
- No se han documentado sesgos específicos, pero al entrenar con datos de una sola región, puede haber sesgos geográficos y de cobertura de suelo.
- El modelo no tiene capacidades de razonamiento ni interacción textual; es exclusivamente un generador de imágenes condicionado por máscaras.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pranilllllll/geonusaf-stage2-mask2image-block-fold0-D
- Modelo Stage 1 (generación de máscaras): https://huggingface.co/sugam24/geonusaf-stage1-maskddpm-block-fold0
- Modelo de segmentación UNetFormer asociado: https://huggingface.co/Pranilllllll/geonusaf-unetformer-r18-block-fold0
