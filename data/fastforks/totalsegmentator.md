# fastforks/totalsegmentator

## Resumen

TotalSegmentator es un modelo de segmentación anatómica 3D para tomografías computarizadas (TC) desarrollado originalmente por Wasserthal et al. y publicado en *Radiology: Artificial Intelligence* en 2023. Segmenta hasta 117 estructuras anatómicas (órganos, huesos, músculos y vasos) sobre el volumen de entrada, devolviendo un volumen de etiquetas enteras en la misma rejilla que la imagen original. Está construido sobre nnU-Net v2, con redes U-Net 3D entrenadas específicamente para cada grupo de estructuras.

La variante `total` fusiona cinco redes parciales a resolución de 1,5 mm (órganos, vértebras, cardíaco, músculos y costillas), mientras que `total-3mm` es una única red rápida a 3 mm. El repositorio `fastforks/totalsegmentator` es únicamente una model card: no aloja pesos, sino que documenta cómo descargar los pesos originales de los autores y verificarlos mediante SHA-256, con el objetivo de integrarlos en el ecosistema de inferencia `fastforks`.

Este modelo es relevante porque ofrece una segmentación multilabel robusta y reproducible en TC sin necesidad de entrenamiento propio, algo poco habitual en imagen médica open source. Su licencia Apache-2.0 permite uso comercial, y su integración en `fastforks` facilita el despliegue en pipelines con backend `portable` o `kernels` sobre CUDA y PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nnU-Net v2, U-Net 3D (encoder-decoder con conexiones skip) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision 3D, entrada volumetrica `[D, H, W]`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesa volumenes TC, no texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | checkpoints PyTorch (`.pth`) de nnU-Net; no alojados en este repo |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura nnU-Net v2, un framework de segmentación médica que autoconfigura la topología de la U-Net 3D (profundidad, número de canales, tamaño de parche y estrategia de muestreo) a partir de las propiedades del dataset. La variante `total` combina cinco redes entrenadas por separado sobre subconjuntos de estructuras, cada una con resolución de 1,5 mm, y fusiona sus salidas en un único volumen de etiquetas. La variante `total-3mm` emplea una sola red a 3 mm, con mayor velocidad pero menor detalle.

Los datos de entrenamiento provienen de los datasets públicos liberados por los autores (part1 organs con 1559 sujetos, part2 vertebrae con 1532, part3 cardiac, part4 muscles y part5 ribs con 1559 cada uno). El entrenamiento usa el trainer `nnUNetTrainerNoMirroring` (sin data augmentation por espejo, adecuado para anatomía asimétrica) y, en el caso de `total-3mm`, `nnUNetTrainer_4000epochs_NoMirroring`. No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de alineación, al no tratarse de un modelo de lenguaje.

## Capacidades

- Segmentación multilabel de hasta 117 estructuras anatómicas en TC: órganos, vértebras, estructuras cardíacas, músculos y costillas.
- Salida como volumen de índices de clase `[D, H, W]` sobre la rejilla de entrada (0 = fondo), con nombres de etiquetas asociados.
- Procesamiento de volumenes en unidades Hounsfield con espaciado de vóxel en milímetros; `volume.read_nifti` lee ambos desde un fichero NIfTI.
- Variantes de velocidad y precisión: `total` (1,5 mm, cinco redes) y `total-3mm` (3 mm, red única).
- Modelos encoder (nnFoundation) que toman un volumen TC o RM y devuelven mapas de características del encoder.
- Backends de inferencia `portable` y `kernels` (este último con kernels propios publicados en `fastforks/kernels`).
- Verificación de integridad de pesos mediante SHA-256 documentado en la model card.
- No soporta tool calling, agentes, texto ni capacidades multimodales fuera de la imagen médica volumétrica.

## Casos de uso

- **Segmentación automática de órganos en TC abdominal**: el modelo genera en una sola pasada las máscaras de hígado, bazo, riñones, páncreas, etc., sobre la rejilla original, lo que permite cálculos volumétricos y análisis morfológicos sin anotación manual.
- **Planificación quirúrgica y radioterapia**: la variante `total` a 1,5 mm proporciona contornos precisos de órganos y vasos necesarios para delimitar volúmenes de tratamiento y trayectorias quirúrgicas.
- **Análisis de composición corporal**: la red de músculos permite cuantificar masa muscular y grasa en estudios longitudinales, útil en investigación nutricional y oncológica.
- **Detección y cuantificación de fracturas vertebrales**: la red de vértebras segmenta cada cuerpo vertebral, lo que facilita la medición de alturas y la comparación entre estudios.
- **Preprocesado para pipelines de IA médica**: las máscaras generadas sirven como entrada enmascarada para modelos posteriores de clasificación o detección de lesiones, reduciendo el ruido fuera de la región de interés.
- **Docencia y validación de algoritmos**: al ser reproducible y de licencia Apache-2.0, se puede usar como referencia para comparar nuevos segmentadores o para generar datasets de entrenamiento a gran escala.
- **Investigación cardíaca**: la red cardíaca segmenta cavidades y estructuras del corazón, útil para estudios de función ventricular y análisis de imagen cardiovascular.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas numéricas (Dice, HD95, etc.) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada.
- GPU recomendadas: no disponible; la model card menciona soporte CUDA y PyTorch, pero no especifica modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: backend `portable` y backend `kernels` de `fastforks`; el código original está en el repositorio de TotalSegmentator (basado en nnU-Net v2).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Estructuras | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TotalSegmentator (`total`) | nnU-Net 3D, 5 redes a 1,5 mm | 117 | Volumen TC `[D, H, W]` | Apache-2.0 | Pesos en releases de GitHub del autor |
| TotalSegmentator (`total-3mm`) | nnU-Net 3D, 1 red a 3 mm | 117 | Volumen TC `[D, H, W]` | Apache-2.0 | Pesos en releases de GitHub del autor |
| Otros segmentadores médicos 3D | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas comparables en la documentación proporcionada.

## Limitaciones y advertencias

- **Solo TC**: el modelo está entrenado para tomografías computarizadas; los encoders nnFoundation aceptan también RM, pero la segmentación multilabel está pensada para TC.
- **Dependencia de los pesos originales**: este repositorio no contiene pesos; la inferencia requiere descargarlos de los enlaces del autor y verificar su SHA-256, lo que añade un paso operativo y un punto de fallo externo.
- **Resolución y velocidad**: la variante `total` es más precisa pero más lenta al ejecutar cinco redes; `total-3mm` prioriza velocidad a costa de detalle en estructuras pequeñas.
- **Riesgo de error en anatomía atípica**: como todo modelo entrenado con datos poblacionales, puede fallar en anatomía postquirúrgica, malformaciones o imágenes con artefactos graves.
- **Sin garantías clínicas**: la model card no documenta validación regulatoria ni uso diagnóstico; no debe emplearse como dispositivo médico sin evaluación adicional.
- **Licencia Apache-2.0**: permite uso comercial, pero conviene revisar las condiciones de los pesos originales y de los datasets de entrenamiento subyacentes.
- **Sin soporte de texto ni idiomas**: no es un modelo de lenguaje; cualquier expectativa de generación de texto, tool calling o razonamiento lingüístico queda fuera de su alcance.
- **Estado experimental**: la model card etiqueta la integración como *tier: experimental*, por lo que la API y el comportamiento pueden cambiar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/totalsegmentator
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original de TotalSegmentator: https://github.com/wasserth/TotalSegmentator (commit `184fa4765456`)
- Pesos `total` (v2.0.0): https://github.com/wasserth/TotalSegmentator/releases/download/v2.0.0-weights/
- `card.toml` con hashes completos: https://github.com/kleinicke/fastforks/blob/main/src/fastforks/volume/models/totalsegmentator/card.toml
- Paper de referencia: Wasserthal et al., *Radiology: Artificial Intelligence*, 2023 (no se proporciona URL directa en la información disponible).
