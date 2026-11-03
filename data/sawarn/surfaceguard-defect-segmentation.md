# Sawarn/surfaceguard-defect-segmentation

## Resumen

SurfaceGuard es un modelo de segmentación de imágenes especializado en la detección de defectos superficiales. Lo desarrolla Sawarn (Atul Kumar, 24f2003045) como proyecto de curso del programa BS Deep Learning & GenAI del IIT Madras. El modelo resuelve un problema acotado pero concreto: identificar y segmentar cuatro tipos de defecto (`defect_a` a `defect_d`) sobre tiras de imagen en escala de grises de 128×800 píxeles, un formato típico en inspección visual industrial de superficies continuas (bandas, láminas, tiras de material).

La propuesta final es un ensemble de dos arquitecturas de segmentación: una U-Net con backbone ResNet-34 y una FPN con backbone EfficientNet-B3, combinadas con flip TTA (test-time augmentation) y post-procesado por clase ajustado sobre un fold de validación de 2.279 imágenes. El conjunto suma 36,9 millones de parámetros y alcanza una puntuación de validación de 0,7297 con umbral ajustado (0,7121 con umbral fijo de 0,5).

Es relevante por su carácter práctico y reproducible: pesos en PyTorch y exportación ONNX, licencia MIT, parámetros de post-procesado publicados y una demo en Hugging Face Spaces. No es un modelo de propósito general ni un modelo fundacional, sino un componente de visión por computador listo para integrarse en un pipeline de control de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble: U-Net con backbone ResNet-34 + FPN con backbone EfficientNet-B3 |
| Parámetros totales | 36,9086 M (ensemble final) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 1×1×128×800) |
| Tipos de cuantizacion | no disponible (se distribuye en PyTorch y ONNX; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de segmentación de imágenes) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`weights/*.pt`) + exportación ONNX |

## Arquitectura y entrenamiento

El modelo combina dos ramas de segmentación semántica. La primera es una U-Net con encoder ResNet-34, que aporta conexiones skip de alta resolución y buena localización de bordes. La segunda es una FPN (Feature Pyramid Network) con backbone EfficientNet-B3, que aporta un extractor más eficiente en parámetros y una pirámide multi-escala útil para defectos de tamaño variable. Las predicciones de ambas ramas se combinan y se refinan con flip TTA y un post-procesado por clase (umbral, filtro de componentes, área mínima y umbral de compuerta de presencia) ajustado sobre un fold de validación de 2.279 imágenes.

La entrada es una imagen en escala de grises normalizada a [0, 1] con forma 1×1×128×800. El autor compara varias opciones en el fold de validación: el ensemble final (36,9 M parámetros, score 0,7297), FPN EfficientNet-B3 sola (12,5 M, 0,7280), U-Net ResNet-34 sola (24,4 M, 0,7084) y una U-Net desde cero (7,9 M, 0,6759). La model card no detalla el volumen de tokens ni la composición exacta del dataset de entrenamiento, ni si hubo aumentos de datos más allá del flip TTA en inferencia.

## Capacidades

- Segmentación semántica de cuatro clases de defecto (`defect_a` a `defect_d`) sobre imágenes en escala de grises de 128×800.
- Detección de presencia por clase mediante compuerta de umbral ajustada (presence-gate threshold), útil para decidir si un defecto está presente antes de segmentar.
- Post-procesado configurable por clase: umbral de probabilidad, filtrado de componentes conexos y área mínima.
- Flip TTA para robustez en inferencia.
- Exportación a ONNX para despliegue en entornos sin PyTorch.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente visual y de una sola tarea.

## Casos de uso

- Inspección visual en línea de producción: el modelo se integra en una cámara industrial que captura tiras de 128×800 en escala de grises y devuelve máscaras por tipo de defecto para clasificar y rechazar piezas defectuosas.
- Control de calidad en fabricación de bandas y láminas: la segmentación por clase permite distinguir entre cuatro tipos de defecto y priorizar la revisión humana según la gravedad.
- Pre-procesado para mantenimiento predictivo: las máscaras generadas alimentan un sistema de conteo y seguimiento de defectos a lo largo del tiempo para detectar degradación de la línea.
- Despliegue en edge con ONNX: al exportarse a ONNX y tener 36,9 M parámetros, puede ejecutarse en dispositivos con aceleración limitada junto a la cámara, reduciendo la latencia de inspección.
- Etiquetado asistido: el modelo pre-segmenta defectos sobre nuevas imágenes para que anotadores humanos solo corrijan las máscaras, acelerando la creación de datasets.
- Investigación y docencia en visión industrial: sirve como referencia reproducible (licencia MIT, pesos y parámetros de post-procesado publicados) para comparar arquitecturas de segmentación en tareas de defectos superficiales.
- Integración en pipelines de CI/CD de modelos de visión: la exportación ONNX y los parámetros de post-procesado en JSON permiten versionar y validar el modelo de forma automatizada.

## Benchmarks y rendimiento

Resultados publicados por el autor en el fold de validación (2.279 imágenes):

| Opción | raw_score | score | fg_dice | fp_score | empty_acc | params_M |
|---|---|---|---|---|---|---|
| Scratch U-Net + U-Net ResNet-34 + FPN EfficientNet-B3 | 0,7099 | 0,7306 | 0,6632 | 0,8861 | 0,8911 | 44,7598 |
| U-Net ResNet-34 + FPN EfficientNet-B3 (final) | 0,7121 | 0,7297 | 0,6578 | 0,8966 | 0,8995 | 36,9086 |
| FPN EfficientNet-B3 | 0,6882 | 0,7280 | 0,6561 | 0,8947 | 0,8981 | 12,4760 |
| Scratch U-Net + FPN EfficientNet-B3 | 0,6965 | 0,7271 | 0,6444 | 0,9211 | 0,9173 | 20,3272 |
| Scratch U-Net + U-Net ResNet-34 | 0,6914 | 0,7108 | 0,6119 | 0,9467 | 0,9319 | 32,2838 |
| U-Net ResNet-34 | 0,6859 | 0,7084 | 0,6165 | 0,9261 | 0,9155 | 24,4326 |
| Scratch U-Net | 0,6259 | 0,6759 | 0,5976 | 0,8571 | 0,8620 | 7,8512 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 36,9 M parámetros y entrada 1×1×128×800, la huella es reducida (del orden de cientos de MB en FP32, incluyendo activaciones).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son sobradas para esta carga.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo, ONNX Runtime, TensorRT (a partir del ONNX exportado) y servidores de inferencia compatibles con ONNX.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SurfaceGuard (ensemble final) | 36,9 M | 1×1×128×800 | score 0,7297 en validación propia | MIT | Hugging Face + ONNX |
| FPN EfficientNet-B3 (rama del ensemble) | 12,5 M | 1×1×128×800 | score 0,7280 en validación propia | MIT (en este repo) | Hugging Face |
| U-Net ResNet-34 (rama del ensemble) | 24,4 M | 1×1×128×800 | score 0,7084 en validación propia | MIT (en este repo) | Hugging Face |
| Scratch U-Net | 7,9 M | 1×1×128×800 | score 0,6759 en validación propia | MIT (en este repo) | Hugging Face |

No se dispone de comparación con modelos externos de segmentación de defectos (por ejemplo, variantes de Segment Anything adaptadas o modelos industriales propietarios) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de propósito muy específico: solo segmenta cuatro clases de defecto sobre tiras de 128×800 en escala de grises; no generaliza a otras resoluciones, formatos ni dominios sin reentrenamiento.
- Proyecto de curso: no hay evidencia de validación en producción ni de robustez frente a cambios de iluminación, cámara o material.
- Riesgo de falsos negativos y positivos: el `fg_dice` de 0,6578 y el `empty_acc` de 0,8995 indican margen de mejora en la localización fina de defectos.
- Sesgos conocidos: no documentados; dependen del dataset de entrenamiento, no descrito en detalle en la model card.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- Sin datos de cuantización ni de latencia: conviene medir el rendimiento real antes de comprometerse con un despliegue en edge.
- Idiomas: no aplica; el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sawarn/surfaceguard-defect-segmentation
- Demo: https://huggingface.co/spaces/Sawarn/surfaceguard-demo
