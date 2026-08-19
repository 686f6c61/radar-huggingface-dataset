# LibreYOLO/LibreHVICIDNett-restore

## Resumen

LibreHVICIDNett-restore es un checkpoint de generalización del modelo HVI-CIDNet, adaptado por LibreYOLO para la tarea de restauración y mejora de imágenes con baja iluminación. Con solo 1,98 millones de parámetros, ofrece una solución ligera y eficiente para realzar fotografías nocturnas o con poca luz, preservando el lienzo original y ajustando parámetros como gamma, saturación e intensidad. El modelo se distribuye bajo licencia MIT, lo que facilita su integración en proyectos comerciales y de investigación.

El checkpoint se basa en el trabajo original de HVI-CIDNet (Fediory/HVI-CIDNet-Generalization) y se ha convertido al formato de LibreYOLO sin modificar los tensores aprendidos, garantizando una equivalencia exacta con el gráfico nativo. Está entrenado sobre el dataset sintético LOLv2-Synthetic, aunque el repositorio fuente no publica una licencia explícita para dicho dataset, un aspecto a considerar para uso en producción. Su pequeño tamaño lo hace adecuado para despliegue en dispositivos con recursos limitados, como cámaras embebidas o aplicaciones móviles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HVI-CIDNet (red de mejora de baja luminosidad) |
| Parametros totales | 1,98 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (procesamiento de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | safetensors (fuente) y .pt (checkpoint LibreYOLO) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura HVI-CIDNet, diseñada específicamente para la mejora de imágenes con baja iluminación. No se proporcionan detalles internos sobre si es una red convolucional pura o híbrida, pero su reducido número de parámetros (1,98M) sugiere una arquitectura compacta y eficiente. El checkpoint de generalización se entrenó sobre el dataset sintético LOLv2-Synthetic, que contiene pares de imágenes con y sin degradación por baja luz. No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo de lenguaje.

La conversión realizada por LibreYOLO añade metadatos de checkpoint v1, pero los tensores aprendidos permanecen sin cambios, verificándose una diferencia máxima absoluta de cero con respecto al gráfico de referencia. Esto garantiza que el comportamiento del modelo es idéntico al original, solo que empaquetado para la librería `libreyolo`.

## Capacidades

- Mejora de imágenes con baja iluminación: realza el brillo y el contraste de fotografías nocturnas o subexpuestas.
- Restauración de imágenes: recupera detalles y colores perdidos en condiciones de poca luz.
- Ajuste fino de parámetros: permite controlar gamma, saturación e intensidad mediante argumentos en la inferencia.
- Preservación del lienzo original: la predicción mantiene el tamaño de la imagen de entrada, rellenando internamente a múltiplos de ocho.
- Integración sencilla: se carga mediante la API de `libreyolo` con una sola línea de código.
- Compatibilidad con tareas de image-to-image: se integra en el pipeline estándar de transformación de imágenes.

## Casos de uso

- Fotografía nocturna y de paisajes: los usuarios pueden mejorar imágenes tomadas de noche o en condiciones de baja luz, ajustando gamma e intensidad para obtener resultados más claros y naturales.
- Vigilancia y seguridad: las cámaras de seguridad suelen capturar imágenes oscuras; este modelo puede realzarlas para facilitar la identificación de personas u objetos, con un coste computacional mínimo.
- Post-procesado en aplicaciones móviles: al ser un modelo de solo 1,98M de parámetros, puede integrarse en apps de edición de fotos para ofrecer un modo "mejora nocturna" en tiempo real.
- Restauración de archivos históricos: imágenes antiguas o digitalizaciones con baja iluminación pueden ser restauradas para su preservación o visualización.
- Preprocesado para otros modelos de visión: mejorar la iluminación de imágenes antes de pasarlas a detectores de objetos o segmentadores, aumentando su precisión en entornos oscuros.
- Ajuste creativo de iluminación: los controles de gamma, saturación e intensidad permiten a fotógrafos y diseñadores modificar la atmósfera de una imagen de forma controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como PSNR, SSIM u otras comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB, dado el reducido número de parámetros (1,98M). Puede ejecutarse en GPUs con 1 GB o menos.
- GPU recomendadas: cualquier GPU moderna, incluyendo NVIDIA GTX 1050, RTX 2060 o superiores. También es viable en CPUs con soporte de aceleración (AVX, etc.).
- Compatibilidad con hardware de consumo: sí, cabe en tarjetas gráficas de gama baja y en dispositivos embebidos como Jetson Nano o Raspberry Pi con aceleración.
- Opciones de despliegue: librería `libreyolo` (API Python), posiblemente también mediante exportación a ONNX o TensorRT para inferencia optimizada.
- Latencia y throughput: no disponible, pero por el tamaño del modelo se espera una inferencia muy rápida, del orden de milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación proporcionada. No se pueden contrastar parámetros, rendimiento o licencias con otras alternativas de mejora de baja luminosidad como RetinexNet, Zero-DCE o EnlightenGAN.

## Limitaciones y advertencias

- Sesgos y generalización: al estar entrenado únicamente en el dataset sintético LOLv2-Synthetic, puede no generalizar bien a imágenes reales con degradaciones complejas o ruido no modelado.
- Riesgo de alucinación: no aplica, al ser un modelo de imagen, pero podría introducir artefactos o colores irreales en zonas muy oscuras.
- Limitaciones de contexto: no aplica, pero la preservación del lienzo original puede fallar si la imagen de entrada no tiene dimensiones múltiplo de ocho, aunque el modelo rellena internamente.
- Restricciones de licencia: el modelo se distribuye bajo MIT, pero el dataset de entrenamiento (LOLv2-Synthetic) no tiene una licencia explícita en su repositorio fuente, lo que podría generar incertidumbre legal para uso comercial.
- Requisito de controles positivos: los parámetros gamma, saturación e intensidad deben ser estrictamente positivos; valores no positivos provocarán errores en la inferencia.
- Dependencia de la librería `libreyolo`: el checkpoint está empaquetado para esta librería específica, por lo que su uso fuera de ella requeriría conversión adicional.

## Enlaces

- [HuggingFace - LibreYOLO/LibreHVICIDNett-restore](https://huggingface.co/LibreYOLO/LibreHVICIDNett-restore)
- [Repositorio fuente - Fediory/HVI-CIDNet-Generalization](https://huggingface.co/Fediory/HVI-CIDNet-Generalization)
- [Repositorio GitHub - Fediory/HVI-CIDNet](https://github.com/Fediory/HVI-CIDNet)
