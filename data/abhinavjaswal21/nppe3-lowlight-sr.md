# abhinavjaswal21/nppe3-lowlight-sr

## Resumen

SRNet es un modelo de restauración de imágenes desarrollado por abhinavjaswal21 como propuesta para la competición DLP 26T2 NPPE3. Resuelve de forma conjunta dos problemas: la mejora de imágenes con poca luz (denoising y corrección de exposición) y la super-resolución 4x. Toma una imagen RGB oscura y ruidosa de 256x160 píxeles y genera una imagen limpia, correctamente expuesta y de 1024x640 píxeles en una sola pasada.

La arquitectura es una red residual con atención de canal (RCAN-style) con 2,12 millones de parámetros, compuesta por 64 canales y 24 bloques residuales de atención de canal (RCAB). El modelo fue entrenado en una única GPU NVIDIA T4 de Kaggle, con precisión mixta fp16 y pesos EMA. Su relevancia radica en que aborda dos tareas típicamente separadas de manera unificada, con un diseño específicamente orientado a la métrica de evaluación de la competición (PSNR en luma con muestreo cada 8 píxel), alcanzando un PSNR de 39,611 dB en el leaderboard público.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red residual con atención de canal (RCAN-style), 64 canales y 24 bloques RCAB |
| Parámetros totales | 2,12 M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de texto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | PyTorch (best.pt, junto a model.py) |

## Arquitectura y entrenamiento

La arquitectura sigue el estilo RCAN (Residual Channel Attention Network). La entrada se construye concatenando la imagen de baja resolución con una copia corregida gamma (`x ** 0.4545`), lo que da 6 canales de entrada. Esta decisión mejora el condicionamiento en píxeles oscuros, donde la señal cruda está mal condicionada. El cuerpo de la red está formado por 24 bloques RCAB (conv-ReLU-conv con atención de canal tipo squeeze-and-excitation y residual escalado a 0.2), envueltos en una conexión residual larga. El upsampling se realiza mediante dos etapas de PixelShuffle x2. El sesgo de la última convolución se inicializa con la media RGB del conjunto de entrenamiento, lo que evita que la red invierta sus primeras actualizaciones en aprender un offset de brillo DC.

El entrenamiento utilizó la pérdida de Charbonnier sobre RGB y sobre luma ITU-R 601-2 (0.299 / 0.587 / 0.114) con igual peso, optimizador Adam (0.9, 0.99), programación de tasa de aprendizaje coseno con warmup lineal, recorte de gradientes en 1.0, precisión mixta fp16 con `channels_last` y pesos EMA con decay 0.999. Se entrenó durante 68.026 iteraciones con batch 16 sobre crops de 64x64, lo que equivale a aproximadamente 985 épocas sobre 1.105 pares de entrenamiento, en 2 horas 54 minutos en una única T4. El mejor checkpoint se alcanzó en la iteración 62.000, con un PSNR de validación plano desde la iteración ~50.000. La inferencia usa un self-ensemble x8 (simetrías dihedrales) para mejorar el resultado.

## Capacidades

- Restauración conjunta de imágenes con poca luz: elimina ruido y corrige la exposición en una sola pasada.
- Super-resolución 4x: transforma imágenes de 256x160 a 1024x640 píxeles.
- Aprendizaje conjunto de denoising, aclarado y upscaling, sin necesidad de etapas separadas.
- Optimizado para la métrica de PSNR en luma (grayscale) con muestreo cada 8 píxel, según la evaluación de la competición.
- Inferencia con self-ensemble x8 (simetrías dihedrales) para mejorar el PSNR a costa de mayor cómputo.
- Entrada de 6 canales: imagen RGB original concatenada con una copia con corrección gamma.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, agentes ni razonamiento multilingüe.

## Casos de uso

- Restauración de fotografía nocturna: usuarios o empresas pueden aplicar el modelo a capturas oscuras de móvil o cámara compacta para obtener imágenes con resolución 4x y exposición corregida. Es adecuado porque fue entrenado específicamente para imágenes de baja luz con ruido.
- Mejora de imágenes de cámaras de vigilancia: las cámaras de seguridad suelen producir vídeo de baja resolución con ruido en condiciones de poca luz. El modelo puede tomar un frame de 256x160 y generar una versión 1024x640 más nítida.
- Preprocesamiento para sistemas de visión artificial: en pipelines de detección de objetos o reconocimiento en entornos nocturnos, el modelo puede normalizar y superresolver imágenes de entrada, mejorando la señal para modelos posteriores.
- Restauración de imágenes históricas o digitalizaciones antiguas: fotografías o películas escaneadas con exposición deficiente pueden recuperar detalle y brillo, aumentando la resolución para su archivo o impresión.
- Mejora de imágenes satelitales o aéreas con poca luz: imágenes tomadas al amanecer, anochecer o en condiciones meteorológicas adversas pueden ser procesadas para recuperar información en zonas oscuras.
- Postprocesado de vídeo: al aplicar el modelo frame a frame, se puede mejorar la calidad de grabaciones de dashcam o drones captadas en condiciones de baja luz.
- Aplicaciones de fotografía forense: en documentación de escenas con baja iluminación, el modelo puede mejorar la visibilidad de detalles en grabaciones oscuras.

## Benchmarks y rendimiento

Se han publicado resultados de PSNR en el contexto de la competición DLP 26T2 NPPE3. La métrica es PSNR sobre la salida de `PIL.Image.convert('L')` muestreado cada 8 píxel.

| Métrica | Valor |
|---|---|
| PSNR en Kaggle public LB (42% del test set) | 39,611 dB |
| PSNR en validación held-out (48 imágenes, x8 ensemble) | 38,986 dB |
| PSNR baseline con upsampling bicubic | 33,424 dB |

El modelo supera al baseline bicubic en más de 6 dB. No se disponen de resultados en benchmarks estándar como Set5, Urban100, ImageNet, etc.

## Requisitos de hardware

- VRAM estimada: con 2,12 millones de parámetros, el modelo ocupa aproximadamente 8,5 MB en fp32 o 4,25 MB en fp16. En inferencia, la VRAM necesaria es inferior a 1 GB, incluso con el self-ensemble x8.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluyendo NVIDIA T4, RTX 3060, RTX 4090 o A100. El modelo fue desarrollado y validado en una T4.
- Cabe en GPUs de consumo: sí, cualquier GPU con al menos 2 GB de VRAM puede ejecutarlo.
- Opciones de despliegue: el modelo se distribuye como checkpoint de PyTorch (`best.pt`) con el código en `model.py`. No hay soporte nativo para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje. Se puede servir mediante una API REST personalizada con PyTorch o FastAPI.
- Latencia y throughput: no disponibles. El README indica que la configuración de 64 canales alcanzó 7,32 iteraciones por segundo durante el entrenamiento en una T4, pero no se proporcionan cifras de inferencia.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa técnica directa. En HuggingFace existe otro modelo con la misma finalidad, `Puneet-Bajaj-IITM/lowlight-nppe3`, y en GitHub se encuentra el repositorio `iitmstudent-2021/low-light-image-restoration`, que aborda una tarea similar con una métrica de RMSE. Sin embargo, no se han encontrado especificaciones comparables (parámetros, PSNR o arquitectura) para estos modelos en la información disponible.

## Limitaciones y advertencias

- Alucinación visual: en regiones muy oscuras o con ruido extremo, el modelo puede generar detalles artificiales que no existen en la imagen original.
- Limitación de tamaño: el modelo está entrenado para entradas de 256x160 y salidas de 1024x640. No se documenta el comportamiento con otros tamaños; usarlo con dimensiones distintas puede producir errores o degradar el resultado.
- Dependencia de la corrección gamma fija: la entrada se construye con `x ** 0.4545`; imágenes con perfiles de color o exposición muy diferentes pueden no funcionar de forma óptima.
- Sobreajuste a la competición: el modelo fue desarrollado para una competición específica y optimizado para su métrica de evaluación, por lo que su rendimiento en otros conjuntos de datos puede ser inferior.
- Licencia MIT: permite uso comercial, pero requiere incluir el aviso de copyright y permiso. No se han identificado restricciones adicionales, aunque el modelo fue creado como submission a una competición de Kaggle.
- Sesgos: no se dispone de información sobre sesgos en los datos de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/abhinavjaswal21/nppe3-lowlight-sr
- Modelo similar en HuggingFace: https://huggingface.co/Puneet-Bajaj-IITM/lowlight-nppe3
- Repositorio relacionado en GitHub: https://github.com/iitmstudent-2021/low-light-image-restoration
