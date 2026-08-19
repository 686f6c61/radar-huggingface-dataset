# GeoBrain/random-noise-attenuation-avo

## Resumen

El modelo `GeoBrain/random-noise-attenuation-avo` es un benchmark de atenuación de ruido aleatorio aplicado a gathers sísmicos de disparo (shot gathers) en datos sísmicos de pre-apilamiento. Desarrollado por GeoBrain, el repositorio proporciona un conjunto de arquitecturas de deep learning —UNet, ResUNet, DnCNN, Attention UNet, DDPM y SCRN— entrenadas para reconstruir la señal limpia a partir de una versión contaminada con ruido sintético gaussiano o de Poisson. El objetivo es evaluar y comparar diferentes enfoques de denoising en un entorno controlado y reproducible.

El problema que resuelve es la mejora de la relación señal-ruido (SNR) en datos sísmicos, un paso crítico en el procesado sísmico para la interpretación geológica y la inversión. La relevancia actual radica en que los métodos basados en deep learning están reemplazando progresivamente a las técnicas clásicas de filtrado, y este benchmark ofrece una base estandarizada con métricas objetivas (PSNR, SSIM, RMSE) para medir el rendimiento. El repositorio incluye scripts de entrenamiento e inferencia, configuraciones YAML y un flujo de trabajo completo que abarca desde la inyección de ruido hasta la agregación de resultados multi-semilla.

El modelo se distribuye como un conjunto de pesos y scripts en PyTorch, con un tamaño de repositorio de 12,5 GB. No se especifica licencia, idiomas ni pipeline en la ficha de HuggingFace, y la información disponible se limita a la model card del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Múltiples: UNet, ResUNet, DnCNN, Attention UNet, DDPM, SCRN |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (procesamiento de imágenes sísmicas 2D) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (librería PyTorch; probablemente `.pt` o `.pth`) |

## Arquitectura y entrenamiento

El benchmark implementa seis arquitecturas diferentes, todas basadas en redes neuronales convolucionales o en transformers adaptados a datos sísmicos:

- **UNet**: codificador-decodificador clásico con conexiones skip, canales base 32 y profundidad 4.
- **ResUNet**: variante de UNet con bloques residuales.
- **DnCNN**: CNN residual de denoising con 17 capas y 64 canales de características.
- **Attention UNet**: UNet con puertas de atención para resaltar regiones relevantes.
- **DDPM**: modelo de difusión denoising probabilístico condicional, que predice el ruido de difusión durante el entrenamiento y reconstruye la señal limpia mediante muestreo inverso en inferencia.
- **SCRN**: red residual convolucional basada en Swin Transformer, adaptada al mismo pipeline.

El entrenamiento se realiza sobre gathers sísmicos limpios del archivo `seismic.segy`, con 201 trazas por disparo y un intervalo de muestreo temporal de 2 ms. El conjunto se divide a nivel de disparo en proporción 7:1:1 (801 entrenamiento, 100 validación, 100 test). Se inyecta ruido sintético gaussiano o de Poisson con valores de SNR de -5, 0 y 5 dB, de forma controlada y reproducible mediante semillas. El preprocesamiento incluye normalización `max_abs` por disparo y extracción de parches solapados de 128×256 (traza × tiempo) con un solapamiento del 50%.

El entrenamiento usa pérdida MSE, optimizador AdamW (lr=1e-4, weight decay=1e-5), programador de tasa de aprendizaje con recocido coseno (mínimo 1e-6), 200 épocas, gradiente clipping a 1.0 y tamaño de lote 192. Las semillas por defecto son 42, 43 y 44. La inyección de ruido se realiza una vez por experimento antes de la extracción de parches, no como aumento dinámico por época.

## Capacidades

- Atenuación de ruido aleatorio (gaussiano y de Poisson) en gathers sísmicos de pre-apilamiento.
- Reconstrucción directa de la señal limpia a partir de la entrada ruidosa (regresión emparejada).
- Soporte de múltiples arquitecturas en un mismo pipeline, lo que permite comparar enfoques (UNet, ResUNet, DnCNN, Attention UNet, DDPM, SCRN).
- Generación de métricas objetivas por disparo: SNR, PSNR, SSIM, MAE, MSE y RMSE, calculadas en el dominio normalizado.
- Salidas de visualización inversamente normalizadas al dominio de amplitud original.
- Reproducibilidad mediante semillas fijas y configuración por YAML.
- Inferencia basada en parches con reconstrucción completa del volumen sísmico.

## Casos de uso

- **Procesado sísmico de pre-apilamiento**: el modelo puede aplicarse a gathers de disparo para mejorar la SNR antes de la migración o la inversión, reduciendo el ruido ambiental que enmascara reflexiones débiles.
- **Preparación de datos para inversión de forma de onda completa (FWI)**: un gather limpio es esencial para evitar artefactos en la inversión; el denoising con deep learning puede sustituir a los filtros clásicos (f-k, f-x) con mejor preservación de amplitudes.
- **Evaluación comparativa de arquitecturas de denoising**: el benchmark permite a investigadores y empresas probar diferentes modelos (UNet vs. DnCNN vs. DDPM) sobre el mismo conjunto de datos y métricas, facilitando la selección de la mejor opción para su flujo de trabajo.
- **Aumento de datos sintéticos para entrenamiento de otros modelos**: los gathers limpios generados pueden usarse como datos de entrenamiento para tareas posteriores como detección de eventos o clasificación de litología.
- **Control de calidad en adquisición sísmica**: aplicar el modelo a datos recién adquiridos para verificar la calidad de la señal y detectar problemas de ruido antes del procesado completo.
- **Investigación académica en geofísica computacional**: el repositorio sirve como base reproducible para estudiar el impacto del ruido sintético en el rendimiento de diferentes arquitecturas y para desarrollar nuevas variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe las métricas que se calculan (SNR, PSNR, SSIM, MAE, MSE, RMSE) y el flujo de inferencia, pero no proporciona valores numéricos de rendimiento para los modelos entrenados.

## Requisitos de hardware

No se especifican requisitos de hardware en la información disponible. El tamaño del repositorio (12,5 GB) sugiere que los pesos de las arquitecturas más grandes (DDPM, SCRN) pueden requerir GPUs con al menos 16-24 GB de VRAM para entrenamiento, pero esto es una estimación no confirmada. Para inferencia, es probable que una GPU de gama media (por ejemplo, RTX 3060 o superior) sea suficiente, pero no hay datos oficiales. Las opciones de despliegue no se documentan; el código usa `torchrun` para entrenamiento distribuido, lo que implica soporte para múltiples GPUs.

## Comparativa con modelos similares

No disponible. No se proporcionan comparaciones con otros modelos de denoising sísmico en la información disponible.

## Limitaciones y advertencias

- El ruido inyectado es sintético (gaussiano y de Poisson), por lo que el rendimiento sobre ruido real de campo puede degradarse; no se ha validado con datos de adquisición reales.
- El conjunto de datos se limita a un único archivo `seismic.segy`, lo que reduce la generalización a otras geometrías, amplitudes o cuencas geológicas.
- No se especifica licencia, lo que impide conocer las restricciones de uso comercial o modificación.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con un solo dataset, puede estar sesgado hacia las características de ese conjunto.
- Riesgo de alucinación no aplica (no es un modelo generativo de texto), pero en el contexto de denoising, el modelo podría introducir artefactos o suavizar eventos sísmicos reales si el ruido es muy severo.
- La normalización `max_abs` por disparo puede no ser adecuada para datos con amplitudes muy variables entre disparos.
- El tamaño de parche (128×256) y el solapamiento del 50% pueden no capturar estructuras geológicas de gran escala.

## Enlaces

- [HuggingFace: GeoBrain/random-noise-attenuation-avo](https://huggingface.co/GeoBrain/random-noise-attenuation-avo)
