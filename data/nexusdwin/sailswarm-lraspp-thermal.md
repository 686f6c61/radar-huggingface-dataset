# NexusDwin/sailswarm-lraspp-thermal

## Resumen

El modelo `NexusDwin/sailswarm-lraspp-thermal` es un sistema de segmentación semántica térmica (LWIR) desarrollado por Edwin Redhead (NexusDwin) para el proyecto SailSwarm de la Universidad de Konstanz, cuyo objetivo es la detección de obstáculos en veleros autónomos. Está diseñado para operar sobre imágenes de una cámara FLIR Lepton 3.0 (160×120 píxeles, banda de infrarrojo de onda larga) y clasifica cada píxel en tres clases: obstáculo, agua y cielo. Es el sensor primario nocturno del sistema, ya que la cámara RGB no funciona sin luz.

La arquitectura empleada es LRASPP (Lightweight R-ASPP) con backbone MobileNetV3-Large de torchvision, con aproximadamente 3,2 millones de parámetros. El modelo se entrenó con una estrategia conjunta (JOINT) que combina datos térmicos reales con imágenes RGB en escala de grises del mismo lago, utilizando pseudo-etiquetas generadas por un modelo RGB compañero. Esta aproximación resuelve la ausencia de ground truth público de segmentación térmica marítima a esta resolución. El repositorio incluye pesos PyTorch y versiones ONNX (fp32, opset 17) listas para inferencia en CPU, con un rendimiento validado en un conjunto de retención fijo.

La relevancia actual del modelo radica en su capacidad para funcionar en hardware de bajo consumo (Raspberry Pi 4) y en su metodología de entrenamiento cross-modal, que demuestra que los datos RGB en escala de grises pueden servir como prior estructural para mejorar la segmentación térmica. No obstante, la licencia deriva de LaRS (ICCV 2023), de carácter no comercial, lo que limita su uso en aplicaciones comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LRASPP (Lightweight R-ASPP) con backbone MobileNetV3-Large (torchvision) |
| Parametros totales | ~3,2 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada fija 160×120) |
| Tipos de cuantizacion | fp32 (ONNX); int8 no soportado (falla la validación de concordancia por píxel) |
| Idiomas soportados | No aplica |
| Licencia | other (derivada de LaRS, uso no comercial; backbone BSD-3) |
| Formato de pesos | PyTorch state dict (.pth) y ONNX (opset 17, fp32) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura LRASPP de torchvision, que combina un backbone MobileNetV3-Large con un módulo de pirámide espacial ligero (Lightweight R-ASPP) para segmentación semántica. La entrada es una imagen de 160×120 píxeles en escala de grises replicada a tres canales y normalizada con los valores de ImageNet. La salida es un mapa de logits de dimensiones 1×3×120×160, donde las tres clases corresponden a obstáculo, agua y cielo.

El entrenamiento siguió una receta conjunta (JOINT) que mezcla en los mismos lotes imágenes térmicas reales (aproximadamente 10 000 frames de un muelle) con imágenes RGB en escala de grises del mismo lago (33 467 frames de seis misiones) y datos de LaRS en gris. Se entrenó durante 60 épocas con aumentos de inversión de polaridad (p=0,5) para simular el comportamiento del AGC del Lepton entre día y noche, y desplazamiento vertical de ±12 píxeles para romper la memorización de la línea del horizonte. La estrategia JOINT demostró ser superior al fine-tuning secuencial desde un init preentrenado en gris, alcanzando una precisión de 0,908 ± 0,001 en el holdout frente a 0,61 ± 0,02 con solo datos térmicos.

## Capacidades

- Segmentación semántica de tres clases (obstáculo, agua, cielo) en imágenes térmicas LWIR de 160×120.
- Inferencia en CPU a tiempo real en Raspberry Pi 4 (formato ONNX fp32).
- Robustez a la inversión de contraste térmico (día/noche) gracias al aumento de polaridad.
- Preprocesado específico documentado: conversión a gris, replicación a 3 canales y normalización ImageNet.
- No incluye capacidades de tool calling, generación de texto ni razonamiento multimodal; es un modelo de visión puro.

## Casos de uso

- Navegación autónoma nocturna de veleros: el modelo actúa como sensor primario de detección de obstáculos cuando la cámara RGB no es operativa, clasificando agua, cielo y objetos sólidos en el campo de visión.
- Integración en sistemas embarcados de bajo consumo: al ser un modelo ligero (3,2 M parámetros) y con salida ONNX fp32, puede ejecutarse en una Raspberry Pi 4 sin GPU, lo que lo hace adecuado para plataformas robóticas de bajo coste.
- Generación de pseudo-etiquetas para otros modelos: las predicciones térmicas pueden servir para etiquetar nuevos datos LWIR sin anotación manual, ampliando conjuntos de entrenamiento en entornos marítimos.
- Investigación en segmentación térmica marítima: sirve como referencia metodológica para entrenar modelos con datos cross-modal cuando no existe ground truth térmico público.
- Monitorización de masas de agua: puede adaptarse para detectar objetos flotantes o cambios en la superficie del agua en entornos controlados (puertos, lagos).
- Prototipado de sistemas de asistencia a la navegación: combinado con el modelo RGB compañero, permite un sistema de detección diurno/nocturno completo en embarcaciones pequeñas.

## Benchmarks y rendimiento

El autor proporciona resultados sobre un conjunto de retención fijo (clip bajo el muelle, 752 frames, capturado el 2026-07-08). No se han publicado comparaciones con otros modelos en la información disponible.

| Métrica | Seed 0 | Seed 1 | Seed 2 |
|---|---|---|---|
| Precisión global | 0,9090 | 0,9069 | 0,9080 |
| IoU obstáculo | 0,89 | — | — |
| IoU agua | 0,46 | — | — |
| IoU cielo | 0,74 | — | — |

Nota: el IoU de agua (0,46) es una propiedad del escenario de retención (clip bajo el muelle con casi nada de agua visible), no una medida de calidad en aguas abiertas. La varianza entre semillas es ±0,001.

## Requisitos de hardware

- VRAM estimada: mínima (entrada 160×120, modelo ~3,2 M parámetros); cabe en cualquier GPU con más de 1 GB, aunque no es necesaria.
- GPU recomendada: no se requiere GPU; el modelo está optimizado para CPU (Raspberry Pi 4) con ONNX Runtime.
- Compatibilidad con GPU de consumo: sí, cualquier GPU NVIDIA o AMD puede ejecutarlo, pero el cuello de botella es la CPU.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider), PyTorch (state dict), o conversión a otros formatos si se respeta el preprocesado.
- Latencia y throughput: no se proporcionan cifras exactas, pero el autor indica que el fp32 ONNX es "suficientemente rápido" en Raspberry Pi 4 a 160×120.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos publicados con otros modelos de segmentación térmica marítima. Como referencia cualitativa:

| Modelo | Arquitectura | Entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sailswarm-lraspp-thermal (este) | LRASPP + MobileNetV3-Large | 160×120 LWIR | 3 (obstáculo/agua/cielo) | No comercial (LaRS) | Hugging Face |
| sailswarm-lraspp-student (RGB) | LRASPP + MobileNetV3-Large | Fisheye RGB | 3 (obstáculo/agua/cielo) | No comercial (LaRS) | Hugging Face |
| eWaSR (mencionado por el autor) | eWaSR (basado en WaSR) | Variable | Agua/obstáculo | No especificada | Repositorio del autor |

No hay datos cuantitativos de eWaSR en la información proporcionada, por lo que no se puede realizar una comparación numérica.

## Limitaciones y advertencias

- Entrenado solo con datos diurnos (v1); el retrain nocturno (v2) está en progreso y no está incluido en este repositorio.
- El IoU de agua en el holdout (0,46) no es representativo de aguas abiertas; el escenario de retención tiene casi nada de agua visible.
- Las etiquetas son pseudo-etiquetas generadas por el modelo RGB, por lo que los errores sistemáticos del modelo RGB (p. ej., reflejos interpretados como obstáculos) se heredan en el modelo térmico.
- Solo se admite fp32; la cuantización int8 estática falla la validación de concordancia por píxel (mínimo 40% en seed 0, peor en otras semillas).
- No validado para navegación en bucle cerrado; el autor advierte explícitamente contra su uso en control autónomo sin validación adicional.
- Licencia no comercial derivada de LaRS (Žust et al., ICCV 2023); los pesos heredan sus términos, lo que impide uso comercial sin licencia adicional.
- El preprocesado debe coincidir exactamente con el documentado (imagen upright, gris replicado a 3 canales, normalización ImageNet); desviaciones degradan el rendimiento.
- El sensor puede tener filas muertas (el autor menciona la fila 21 en su unidad); se recomienda repararlas antes de la inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NexusDwin/sailswarm-lraspp-thermal
- Perfil del autor: https://huggingface.co/NexusDwin
- Modelo RGB compañero: https://huggingface.co/NexusDwin/sailswarm-lraspp-student
- Documentación de LRASPP en torchvision: https://docs.pytorch.org/vision/main/models/lraspp.html
- Código fuente de LRASPP en PyTorch Vision: https://github.com/pytorch/vision/blob/main/torchvision/models/segmentation/lraspp.py
