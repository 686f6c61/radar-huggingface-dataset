# GeoBrain/blending-noise-suppression

## Resumen

GeoBrain/blending-noise-suppression es un conjunto de modelos de aprendizaje profundo para la supresión de ruido de mezcla sísmica (deblending) en gathers de receptor común. El modelo aprende una regresión supervisada que transforma una entrada pseudo-deblended (datos sísmicos con ruido de interferencia de fuentes simultáneas) en una referencia limpia de propagación acústica. Está desarrollado por GeoBrain, una plataforma de modelado subsuperficial diferenciable que combina física diferenciable, inferencia bayesiana y redes neuronales para caracterización geológica integrada.

El repositorio incluye siete arquitecturas distintas —UNet, ResUNet, DnCNN, Attention UNet, DDPM, UNet-L y SCRN— todas implementadas en PyTorch. El conjunto de datos utilizado es un par de archivos SEG-Y con 386 gathers de receptor común, cada uno con 270 trazas y 2000 muestras temporales, divididos en 300 gathers para entrenamiento, 43 para validación y 43 para prueba. El entrenamiento se realiza con parches 2D de 128x256 píxeles con solapamiento del 50%, y se ejecutan tres semillas distintas (42, 43, 44) para evaluar la robustez.

La relevancia de este modelo radica en su aplicación directa en la industria de exploración sísmica, donde la deblending es un paso crítico para mejorar la calidad de los datos adquiridos con técnicas de disparo simultáneo. La disponibilidad de múltiples arquitecturas y un benchmark estandarizado con métricas como SNR, PSNR y SSIM permite comparar y seleccionar el mejor enfoque para esta tarea específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet, ResUNet, DnCNN, Attention UNet, DDPM, UNet-L, SCRN (7 modelos) |
| Parametros totales | No disponible (se reportan por modelo en la tabla de resultados, valores no visibles) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision 2D para datos sismicos) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vision, no linguistico) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (best.pt, config.yaml) |

## Arquitectura y entrenamiento

La tarea es una regresión supervisada pareada: el modelo recibe un gather pseudo-deblended (entrada) y debe producir una referencia de propagación acústica limpia (objetivo). No se trata de una inyección de ruido sintético, sino de aprender el mapeo directo entre ambos dominios. El entrenamiento se realiza con parches 2D de tamaño 128x256 y solapamiento del 50%, extraídos de los gathers de receptor común. La normalización de entrada y objetivo comparte las mismas estadísticas.

Se emplean tres semillas (42, 43, 44) para cada modelo, y los resultados se agregan calculando media y desviación estándar entre semillas. Las arquitecturas incluyen desde redes clásicas como DnCNN hasta modelos generativos como DDPM, así como variantes UNet con atención (Attention UNet) y SCRN, una arquitectura específica para ruido sísmico. No se menciona el uso de RLHF o DPO, ya que es una tarea de visión por computadora, no de lenguaje.

## Capacidades

- Supresión de ruido de mezcla sísmica: elimina la interferencia de fuentes simultáneas en gathers de receptor común.
- Deblending supervisado: aprende una transformación directa de entrada pseudo-deblended a señal limpia.
- Procesamiento de datos sísmicos SEG-Y: entrada y salida son volúmenes de datos sísmicos en formato SEG-Y.
- Múltiples arquitecturas disponibles: permite elegir entre UNet, ResUNet, DnCNN, Attention UNet, DDPM, UNet-L y SCRN según el equilibrio entre rendimiento y coste.
- Métricas de evaluación robustas: incluye SNR, PSNR, SSIM, MAE, MSE y métricas específicas de bandas de energía (EB_WSE, FB_FRE) para validar la calidad de la deblending.
- Entrenamiento con semillas fijas: resultados reproducibles con media y desviación estándar sobre 3 semillas.

## Casos de uso

- Exploración sísmica marina y terrestre: el modelo puede aplicarse para eliminar interferencia de disparos simultáneos en datos adquiridos con técnicas de blended acquisition, mejorando la calidad de la imagen sísmica antes de la migración.
- Procesamiento de datos sísmicos en tiempo real: gracias a su naturaleza de red neuronal convolucional, el modelo puede integrarse en pipelines de procesamiento sísmico para deblending automático de grandes volúmenes de datos, reduciendo la intervención manual.
- Mejora de la señal en proyectos de monitoreo de yacimientos: la deblending precisa permite una mejor caracterización del subsuelo en estudios 4D, donde se comparan datos adquiridos en diferentes momentos.
- Benchmarking de arquitecturas para deblending: el repositorio sirve como punto de referencia para evaluar el rendimiento de 7 arquitecturas distintas en la misma tarea, permitiendo seleccionar la más adecuada para un hardware o presupuesto computacional específico.
- Investigación en geofísica computacional: investigadores pueden usar los resultados y scripts para comparar nuevos enfoques de deblending con los modelos ya establecidos.
- Integración en pipelines de procesamiento sísmico: los scripts de entrenamiento e inferencia están diseñados para integrarse en pipelines existentes, con soporte para subir datos y modelos a Hugging Face Hub.

## Benchmarks y rendimiento

La model card reporta resultados para el dataset `T02_comp` con métricas medias ± desviación estándar sobre las tres semillas. La tabla completa incluye SNR, PSNR, SSIM, MAE, MSE, RMSE y métricas específicas de bandas de energía (EB_WSE y FB_WSE). Los datos visibles en la información extraída muestran únicamente la fila correspondiente a la entrada (Input), con los siguientes valores:

| Metodo | Parametros (M) | SNR | PSNR | SSIM | MAE | MSE | RMSE |
|---|---|---|---|---|---|---|---|
| Input | - | 1.1666 | 24.1733 | 0.6475 | 0.020175 | 0.003923 | 0.062252 |

Los resultados de los 7 modelos (UNet, ResUNet, DnCNN, Attention UNet, DDPM, UNet-L, SCRN) no están disponibles en la información extraída, pero se encuentran en la model card original de Hugging Face. No se proporcionan comparaciones con modelos externos.

## Requisitos de hardware

No se ha especificado información sobre requisitos de hardware en la documentación disponible. Sin embargo, dado que los modelos son redes convolucionales para datos sísmicos 2D y el repositorio ocupa 3.6 GB, se puede inferir que:

- Los modelos más pequeños (DnCNN, UNet) podrían ejecutarse en GPUs de consumo como una RTX 3090 o RTX 4090 con 24 GB de VRAM.
- Los modelos más grandes (DDPM, UNet-L, SCRN) podrían necesitar GPUs profesionales como A100 (40-80 GB) o H100.
- El despliegue puede hacerse con PyTorch nativo, o mediante herramientas de inferencia como TorchServe o ONNX Runtime.
- La latencia dependerá del tamaño del volumen de entrada (386 gathers, 270 trazas, 2000 muestras), pero con parches de 128x256 y solapamiento 0.5, la inferencia completa puede ser del orden de minutos en GPU.
- No se especifican opciones de despliegue como vLLM o llama.cpp, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. No se han encontrado datos de comparación con otros modelos de deblending sísmico en la información proporcionada. La model card incluye una comparación interna entre las 7 arquitecturas, pero los resultados numéricos no están visibles en la extracción de datos.

## Limitaciones y advertencias

- Sesgos y dominio específico: el modelo está entrenado únicamente con el dataset T02, que corresponde a un conjunto de datos sísmicos particular. Su generalización a otros datos sísmicos con diferentes características geológicas o de adquisición no está garantizada.
- Alucinación: como cualquier modelo de regresión, puede generar artefactos en zonas de baja relación señal/ruido, aunque no se han reportado casos concretos.
- Licencia no definida: la ausencia de una licencia clara puede limitar el uso comercial sin autorización explícita del autor.
- Formato de datos: el modelo está diseñado para trabajar con datos sísmicos en formato SEG-Y, lo que requiere un preprocesamiento específico y puede no ser compatible con otros formatos de datos geofísicos.
- Dependencia de la normalización: el entrenamiento y la inferencia requieren que se utilicen las mismas estadísticas de normalización que en el entrenamiento, lo que puede ser un problema al procesar datos nuevos con distribuciones distintas.
- Reproducibilidad: aunque se usan tres semillas fijas, no se ha documentado el entorno exacto de entrenamiento (versión de PyTorch, CUDA, etc.), lo que puede afectar a la reproducibilidad exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GeoBrain/blending-noise-suppression
- Organización GeoBrain: https://huggingface.co/GeoBrain
- Repositorio de GeoBrain en GitHub: https://github.com/GeoBrain-Project/GeoBrain
- Documentación de GeoBrain: https://geobrain-project.github.io/GeoBrain/intro.html
- Fuente de la documentación (Markdown): https://geobrain-project.github.io/GeoBrain/_sources/intro.md
