# Binjia/ffdnet-color-s20-litert

## Resumen

FFDNet color, σ = 20 — LiteRT es una conversión a formato LiteRT/TFLite del modelo de eliminación de ruido FFDNet, publicado originalmente por Kai Zhang, Wangmeng Zuo y Lei Zhang en el artículo "FFDNet: Toward a Fast and Flexible Solution for CNN based Image Denoising" (TIP 2018). El autor de esta conversión, Binjia, parte de los pesos `ffdnet_color.pth` de la release KAIR v1.0 (licencia MIT) y los reescribe para que sean compatibles con el runtime LiteRT en GPU, con un nivel de ruido fijo σ = 20/255.

El modelo resuelve una tarea muy concreta: la eliminación de ruido gaussiano aditivo en imágenes RGB a un nivel de ruido conocido y fijo. No es un modelo generativo de propósito general ni un modelo de lenguaje: es una red convolucional de imagen a imagen (pipeline `image-to-image`) que recibe un tensor NHWC float32 de `[1, 512, 512, 3]` en rango [0, 1] y devuelve una imagen limpiada de la misma forma. Su relevancia actual reside en que ofrece una implementación ligera (2,8 MB de pesos en FP16) y optimizada para GPU mediante operaciones TFLite estándar, lo que facilita el despliegue en dispositivos móviles y entornos con aceleración gráfica.

La conversión no altera la semántica del modelo original: las reescrituras aplicadas (fusión del pixel-unshuffle en una convolución de cabecera, codificación del mapa σ como cuarto canal y sustitución del pixel-shuffle por una convolución transpuesta one-hot) son exactas hasta el redondeo en coma flotante, con una diferencia máxima de 5e-6 frente a la implementación de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (FFDNet), transformer no; red convolucional con pixel-unshuffle/pixel-shuffle |
| Parametros totales | no disponible (pesos FP16 de 2,8 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, entrada fija `[1, 512, 512, 3]`) |
| Tipos de cuantizacion | FP16 (CONV_2D); FP32 en la simulación de referencia |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | LiteRT / TFLite (`.tflite`) |

## Arquitectura y entrenamiento

FFDNet es una red convolucional diseñada para eliminación de ruido gaussiano con nivel de ruido controlable. La innovación principal del artículo original es la incorporación de un mapa de ruido (σ map) como entrada adicional, lo que permite condicionar la red a distintos niveles de ruido sin reentrenar. En esta conversión concreta, el nivel de ruido está fijado a σ = 20/255, por lo que el mapa σ se ha plegado como un cuarto canal constante sobre el tap superior izquierdo de cada celda 2×2.

La conversión a LiteRT aplica tres reescrituras orientadas a GPU: (1) el pixel-unshuffle se fusiona en una convolución de cabecera de 6×6 con stride 2; (2) el mapa σ se introduce como cuarto canal de entrada; y (3) el pixel-shuffle se sustituye por una convolución transpuesta 2×2 con stride 2 y kernel one-hot. Estas transformaciones son exactas hasta el redondeo en coma flotante (diferencia máxima de 5e-6). El modelo utiliza únicamente operaciones CONV_2D, TRANSPOSE_CONV y CONCATENATION, con rango máximo de tensor 4, lo que maximiza la compatibilidad con delegados GPU de LiteRT.

No se dispone de información sobre el dataset de entrenamiento original en la información proporcionada; el artículo de referencia (arXiv:1710.04026) describe el entrenamiento de FFDNet, pero este dato no se detalla en la model card. Tampoco se indica si hubo ajuste fino adicional durante la conversión.

## Capacidades

- Eliminación de ruido gaussiano aditivo en imágenes RGB a nivel fijo σ = 20/255.
- Procesamiento de imágenes por teselas (tiles) de 512×512; se recomienda solapamiento de al menos 48 px entre teselas.
- Inferencia en GPU mediante el runtime LiteRT (delegados GPU de TFLite).
- Entrada y salida en float32 NHWC con rango [0, 1].
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades especiales más allá del denoising.

## Casos de uso

- Limpieza de imágenes médicas o científicas con ruido gaussiano conocido: al estar calibrado para σ = 20/255, puede aplicarse en pipelines de preprocesado donde el sensor o el proceso de adquisición introduce un ruido de esa magnitud, ejecutándose en GPU móvil o embebida vía LiteRT.
- Preprocesado en aplicaciones de fotografía móvil: el modelo cabe en 2,8 MB y usa solo operaciones CONV_2D/TRANSPOSE_CONV, por lo que puede integrarse en apps Android/iOS con delegado GPU para reducir ruido antes de tareas de detección o segmentación.
- Restauración de imágenes en dispositivos de borde (edge computing): su tamaño reducido y su formato TFLite permiten desplegarlo en Raspberry Pi, Jetson Nano o DSP con aceleración, sin necesidad de servidor.
- Pipeline de aumento de calidad en cámaras de vigilancia: procesamiento por teselas de 512×512 con solapamiento de 48 px para evitar costuras visibles en fotogramas de vídeo con ruido de sensor fijo.
- Limpieza previa a OCR o análisis documental: reducir el ruido de escaneos o fotografías de documentos antes de pasarlos a un motor de reconocimiento de texto, mejorando la tasa de acierto en imágenes ruidosas.
- Benchmarking y validación de delegados GPU en LiteRT: al ser una conversión con reescrituras exactas y métricas de fidelidad publicadas (≥ 69,7 dB frente a PyTorch), sirve como caso de prueba reproducible para verificar la corrección numérica de un delegado GPU.
- Prototipado de investigación en denoising: al estar bajo licencia MIT y ser una conversión fiel de los pesos KAIR, permite experimentar con FFDNet en entornos TFLite sin depender de PyTorch.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente proporciona métricas de fidelidad de la conversión, no de calidad de denoising:

| Metrica | Valor |
|---|---|
| Diferencia maxima TFLite vs PyTorch | ≤ 5e-6 (exacta hasta redondeo) |
| PSNR TFLite vs PyTorch | ≥ 69,7 dB |
| PSNR simulacion FP16 vs FP32 | ≥ 67,1 dB |
| Coste computacional | 13,9 GMAC por 256×256; 55,6 GMAC por tesela 512×512 |
| Peso de los pesos | 2,8 MB (FP16) |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con pesos de 2,8 MB en FP16 y una entrada de 512×512×3 float32, el consumo es muy bajo (del orden de decenas de MB incluyendo activaciones).
- GPU recomendadas: cualquier GPU compatible con delegados LiteRT (Adreno, Mali, PowerVR en móvil; NVIDIA con delegado GPU de TFLite en escritorio).
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en GPU integradas móviles.
- Opciones de despliegue: runtime LiteRT / TFLite (con delegado GPU), TensorFlow Lite interpreter, y potencialmente conversión a otros runtimes compatibles con TFLite.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FFDNet color σ=20 LiteRT (este) | no disponible (2,8 MB FP16) | `[1, 512, 512, 3]` | TFLite | MIT | Hugging Face |
| FFDNet original (KAIR) | no disponible | imagen completa variable | PyTorch `.pth` | MIT | GitHub KAIR |
| DnCNN | no disponible | imagen completa variable | PyTorch | MIT | GitHub KAIR |

No se dispone de datos de rendimiento comparativo (PSNR/SSIM de denoising) en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Nivel de ruido fijo: el modelo está calibrado para σ = 20/255; no es adaptable a otros niveles de ruido sin reconversión o reentrenamiento.
- Entrada de tamaño fijo: `[1, 512, 512, 3]`; imágenes mayores requieren procesamiento por teselas con solapamiento de al menos 48 px para evitar artefactos en los bordes (la diferencia con un pase completo se limita a 24 px por el campo receptivo).
- No es un modelo de lenguaje ni de propósito general: no soporta texto, tool calling, agentes ni razonamiento.
- Riesgo de alucinación: no aplica en el sentido generativo, pero puede introducir artefactos o suavizado excesivo en regiones de textura fina al eliminar ruido.
- Sesgos: no disponibles; al ser un modelo de denoising, los sesgos relevantes serían los del dataset de entrenamiento original, no documentados en la información proporcionada.
- Licencia MIT: permite uso comercial, pero se recomienda conservar la atribución a los autores originales (Zhang et al.) y a KAIR.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026-11-10; no hay evidencia de validación por la comunidad.
- No se documentan limitaciones de idioma porque el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Binjia/ffdnet-color-s20-litert
- Paper original FFDNet: https://arxiv.org/abs/1710.04026
- Release KAIR v1.0 (pesos originales): https://github.com/cszn/KAIR/releases/tag/v1.0
- Repositorio KAIR: https://github.com/cszn/KAIR
