# mohitb1i/nppe3-rrdb-lowlight-sr

## Resumen

NPPE-3 — Low-light Denoising + 4x Super-Resolution (RRDBNet) es un modelo de visión por computadora desarrollado por mohitb1i para la competición DLP26T2 NPPE-3. Su objetivo es mejorar imágenes ruidosas captadas con poca luz, realizando de forma conjunta reducción de ruido (denoising) y super-resolución 4x. A diferencia de muchos enfoques basados en redes generativas adversarias (GAN), este modelo está entrenado únicamente con pérdida de píxel tipo Charbonnier, orientado a maximizar el PSNR y evitar artefactos visuales.

La arquitectura empleada es RRDBNet, el generador de Real-ESRGAN, con aproximadamente 8,78 millones de parámetros. El modelo acepta imágenes RGB de cualquier tamaño y devuelve una salida con resolución 4x superior, ya filtrada. Es un modelo pequeño y ligero, apto para ejecutarse en GPU de consumo, y su licencia MIT permite uso comercial sin restricciones. Su relevancia radica en cubrir una necesidad práctica habitual: recuperar detalle y nitidez en fotografía nocturna, vídeos de vigilancia o cualquier fuente de imagen con iluminación deficiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RRDBNet (Residual in Residual Dense Block Network) |
| Parámetros totales | ~8,78 M (nf=64, nb=12 bloques RRDB, gc=32) |
| Parámetros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de imagen, no aplica) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo de imagen, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (archivo `best.pt` con claves `model`, `ema`, `optimizer`, `scaler`, `cfg`, `step`, `best`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura RRDBNet, compuesta por una capa convolucional inicial (`conv_first`), doce bloques RRDB (cada uno con tres bloques de densos residuales), una capa `conv_body`, dos etapas de upsampling con interpolación *nearest* (cada una multiplica por 2, resultando en 4x), y las capas finales `conv_hr` y `conv_last`. La salida se combina con un residual global consistente en un upsampling bilineal 4x de la imagen de entrada, lo que permite al modelo aprender únicamente las diferencias de alta frecuencia.

El entrenamiento se realizó durante 9000 iteraciones con recortes aleatorios de 64×64 píxeles, tamaño de lote 16 y precisión mixta (AMP). Se usó el optimizador AdamW con programación de tasa de aprendizaje coseno, de 2e-4 a 1e-6, y media móvil exponencial (EMA) con decaimiento 0,999. La función de pérdida fue Charbonnier sobre el espacio RGB, sin componente adversarial. El conjunto de datos de entrenamiento no se detalla en la información proporcionada, aunque el modelo fue desarrollado específicamente para el reto NPPE-3 de la competición DLP26T2.

## Capacidades

- Denoising de imágenes con bajo nivel de luz (low-light image enhancement).
- Super-resolución 4x con upscaling simultáneo.
- Procesamiento de imágenes RGB de cualquier tamaño, según la model card.
- Optimizado para maximizar PSNR, con salida estable y sin artefactos típicos de GAN.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de imagen.
- No dispone de capacidades multilingües ni de visión multimodal más allá de la entrada RGB.
- Incluye un modo de inferencia con pesos EMA, que puede proporcionar resultados ligeramente más estables.

## Casos de uso

- Mejora de fotografías nocturnas tomadas con móvil: el modelo reduce el ruido y amplía la resolución, útil para compartir imágenes en redes sociales o para edición posterior.
- Vigilancia y cámaras de seguridad: permite obtener imágenes más nítidas de grabaciones con poca luz, facilitando la identificación de matrículas, rostros u otros detalles.
- Preprocesamiento para sistemas de visión por computadora: antes de aplicar OCR o detección de objetos, se puede usar el modelo para mejorar la calidad de la imagen en entornos nocturnos.
- Restauración de archivos fotográficos antiguos: imágenes escaneadas con ruido y baja resolución pueden recuperar detalle y claridad.
- Astrofotografía amateur: las capturas astronómicas suelen tener muy poca luz y ruido; el modelo puede realzar estructuras sin necesidad de equipos especializados.
- Videojuegos y capturas de pantalla: mejora de texturas en escenas oscuras o con poca iluminación, útil para modding o preservación de capturas.
- Mejora de imágenes médicas en condiciones de baja iluminación: aunque no está validado clínicamente, podría aplicarse como paso de preprocesamiento en endoscopia o fotografía dermatológica.

## Benchmarks y rendimiento

La model card incluye resultados de validación sobre un subconjunto de la competición (267 imágenes). Se presentan a continuación:

| Métrica | Valor |
|---|---|
| RGB PSNR | 39,10 |
| Métrica de competición (escala de grises, `flatten()[::8]`) | 39,24 |
| Mejor subconjunto de validación durante el entrenamiento | 39,073 |
| Baseline bicubic (misma métrica en escala de grises) | 33,54 |

La mejora respecto al baseline bicubic es de aproximadamente 5,7 dB, lo que indica una ganancia sustancial en calidad de imagen. No se han publicado benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener ~8,78 M de parámetros en fp32, el modelo ocupa alrededor de 35 MB. Con imágenes de tamaño moderado (p. ej., 256×256), el consumo de VRAM es inferior a 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. En la práctica, una RTX 3060, RTX 4060 o superior ofrece resultados inmediatos. También puede ejecutarse en GPU más antiguas (GTX 10xx) y en CPU.
- Sí cabe en GPU de consumo; es un modelo muy ligero.
- Opciones de despliegue: Python/PyTorch, exportación a ONNX para integración en otros frameworks, o inclusión en pipelines de inferencia con FastAPI. No se han publicado integraciones específicas con vLLM, Ollama o TGI, al no ser un modelo de lenguaje.
- Latencia y throughput estimados: no disponible, aunque por el tamaño reducido la inferencia es rápida incluso en CPU. Para una imagen de 512×512, se espera un tiempo de procesamiento de segundos en GPU.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos en la información proporcionada. La arquitectura es idéntica al generador de Real-ESRGAN, pero el entrenamiento se diferencia por no emplear pérdida adversarial. A continuación se muestra una comparación cualitativa con modelos de la misma categoría:

| Modelo | Arquitectura | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| NPPE-3 RRDBNet | RRDBNet | Denoising + 4x SR, solo pérdida de píxel | MIT | HuggingFace |
| Real-ESRGAN | RRDBNet | SR con pérdida adversarial (GAN) | BSD-3-Clause | Código abierto |
| SwinIR | Transformer | Super-resolución, sin denoising específico | Apache 2.0 | Código abierto |

Los datos de rendimiento y parámetros de estos modelos alternativos no están disponibles en la información utilizada para esta ficha, por lo que no se incluyen cifras concretas.

## Limitaciones y advertencias

- El modelo fue entrenado específicamente para la competición NPPE-3, por lo que su generalización a otros dominios de baja iluminación puede ser limitada.
- Al estar optimizado para PSNR sin pérdida adversarial, puede producir resultados menos nítidos en texturas complejas y bordes, mostrando un aspecto algo suavizado.
- No se han reportado evaluaciones de sesgos ni análisis de robustez frente a condiciones extremas (desenfoque, compresión, ruido no gaussiano).
- El riesgo de alucinación no aplica en el sentido lingüístico, pero el modelo puede introducir artefactos visuales o falsos detalles en zonas con muy poca información.
- Solo procesa imágenes RGB. No soporta canales adicionales (RGBA, infrarrojo, etc.) ni entradas de vídeo directamente.
- La licencia MIT permite uso comercial, pero se deben verificar los derechos sobre los datos de entrenamiento, que no se detallan en la model card.
- El modelo no es un modelo de lenguaje ni multimodal; no puede interpretar texto ni responder a prompts en lenguaje natural.
- Con imágenes muy grandes, el consumo de memoria puede crecer rápidamente y provocar fallos en GPU con VRAM limitada.

## Enlaces

- HuggingFace: https://huggingface.co/mohitb1i/nppe3-rrdb-lowlight-sr
- Modelo relacionado en HuggingFace: https://huggingface.co/gauravkgehlot/dlp-nppe3-lowlight-sr
- Notebook de referencia en GitHub: https://github.com/sahildev-ai1/iitm-dlp-kaggle-competitions/blob/main/notebooks/01_nppe3_lowlight_denoising_4xsr_rrdb.ipynb
