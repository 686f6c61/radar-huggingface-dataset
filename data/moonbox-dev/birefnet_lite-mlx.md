# moonbox-dev/BiRefNet_lite-MLX

## Resumen

BiRefNet_lite-MLX es una conversión a MLX del modelo BiRefNet_lite, un modelo de segmentación dicotómica de imágenes de alta resolución orientado a la eliminación de fondos (matting). Lo desarrolla moonbox-dev (Moonbox) a partir de los pesos originales de ZhengPeng7/BiRefNet_lite, y su propósito es ofrecer una implementación nativa para Apple Silicon que aproveche el framework MLX de Apple. El modelo resuelve la tarea de separar el sujeto del fondo generando una máscara alfa de alta calidad a resolución 1024x1024.

La relevancia de esta ficha radica en que no se trata de un modelo de lenguaje, sino de un modelo de visión especializado en segmentación binaria (sujeto/fondo), empaquetado en varias precisiones (fp16, bf16, 8bit, 6bit y 4bit) con verificación numérica frente al original en PyTorch. La arquitectura subyacente es BiRefNet, basada en un backbone Swin-T con decodificador ASPP deformable y referencias bilaterales, según el paper arXiv:2401.03407.

El repositorio ocupa 0,3 GB e incluye cinco carpetas de precisión, cada una con `model.safetensors`, `config.json` y `mlx_model.py`. La licencia es MIT, heredada del modelo original, y el modelo está pensado exclusivamente para inferencia en Macs con chip Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (backbone Swin-T + decodificador ASPP deformable con referencias bilaterales) |
| Parametros totales | no disponible (pesos fp16 de 88,6 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada redimensionada a 1024x1024) |
| Tipos de cuantizacion | fp16, bf16, 8bit, 6bit, 4bit (cuantización afín de MLX, group size 64) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) + `mlx_model.py` + `config.json` |
| Tarea | Segmentación de imágenes / eliminación de fondos (image-segmentation) |
| Resolución de entrada | 1024x1024 (redimensionado interno, como en `handler.py`) |
| Salida | Máscara alfa HxW uint8 |
| Dependencias | `mlx`, `numpy`, `pillow` |
| Hardware objetivo | Apple Silicon (MLX) |
| Modelo base | ZhengPeng7/BiRefNet_lite (revisión `aa62cd87ea`) |

## Arquitectura y entrenamiento

El modelo es un port a MLX de BiRefNet-lite. La arquitectura original, descrita en el paper "Bilateral Reference for High-Resolution Dichotomous Image Segmentation" (arXiv:2401.03407), combina un backbone Swin-T que opera a resolución completa y media, y un decodificador ASPP deformable. La innovación principal de BiRefNet son las referencias bilaterales, que inyectan información de bajo nivel (bordes, textura) y de alto nivel (semántica) en el decodificador para refinar los contornos de la máscara. El port ejecuta la configuración liberada con las BatchNorms plegadas en las convoluciones y reimplementa `deform_conv2d` de torchvision directamente en MLX.

En cuanto al entrenamiento, esta ficha no dispone de datos sobre el número de tokens, composición del dataset ni si hubo RLHF/DPO, ya que se trata de un modelo de visión y la información proporcionada no los incluye. La conversión se realizó cargando los pesos originales en MLX y almacenándolos como bf16 o fp16, o cuantizándolos con la cuantización afín de MLX. En las carpetas cuantizadas solo se cuantizan las capas lineales de Swin cuya anchura de entrada es múltiplo de 64 (group size 64); las convoluciones, la primera etapa de Swin y las normas permanecen en bf16, por lo que el ahorro es menor de lo que sugiere el número de bits.

## Capacidades

- Segmentación dicotómica de imágenes: genera una máscara alfa que separa el sujeto del fondo.
- Eliminación de fondos (background removal) con bordes finos, gracias a las referencias bilaterales.
- Matting de alta resolución: procesa entradas redimensionadas a 1024x1024 y produce máscaras HxW uint8.
- Inferencia nativa en Apple Silicon mediante MLX, sin necesidad de PyTorch ni de torchvision en tiempo de ejecución.
- Cinco precisiones intercambiables (fp16, bf16, 8bit, 6bit, 4bit) con fidelidad verificada frente al original.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de una sola pasada.

## Casos de uso

- Eliminación de fondos en aplicaciones de diseño gráfico: el modelo genera una máscara alfa precisa a 1024x1024 que puede aplicarse directamente sobre la imagen RGB para producir un PNG con transparencia, integrándose en herramientas de edición en Mac.
- Procesamiento por lotes de catálogos de producto: al ejecutarse en MLX sobre Apple Silicon con ~0,75 s por imagen, permite limpiar fondos de cientos de fotos de e-commerce en local sin depender de servicios en la nube.
- Preprocesado para pipelines de visión por computador: la máscara de sujeto puede usarse para recortar regiones de interés antes de pasarlas a modelos de clasificación o detección, reduciendo el ruido de fondo.
- Creación de avatares y retratos: el matting de alta resolución conserva detalles de bordes (pelo, ropa), útil para herramientas de videollamada o generación de avatares.
- Edición fotográfica en aplicaciones macOS/iOS: al ser un port MLX, puede embeberse en apps nativas de Apple Silicon con solo `mlx`, `numpy` y `pillow` como dependencias.
- Automatización de flujos de composición: generación de cutouts para montajes, plantillas o publicidad, con la precisión 4bit suficiente (IoU >= 0,9845) cuando el espacio o la velocidad son críticos.

## Benchmarks y rendimiento

Los datos disponibles son métricas de fidelidad frente al modelo original en PyTorch fp32, no benchmarks estándar de segmentación (DIS, COD, etc.), que no se han publicado en la información proporcionada.

| Precisión | Tamano | MAE vs PyTorch fp32 (peor imagen) | Mask IoU (peor) |
|---|---|---|---|
| fp16 | 88,7 MB | 0,00002 | 0,9998 |
| bf16 | 88,7 MB | 0,0002 | 0,9987 |
| 8bit | 63,1 MB | 0,0002 | 0,9978 |
| 6bit | 56,3 MB | 0,0003 | 0,9986 |
| 4bit | 49,5 MB | 0,0010 | 0,9845 |

Rendimiento declarado: aproximadamente 0,75 s por imagen de 1024x1024 en un Apple M5, a cualquier precisión.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos ocupan entre 49,4 MB (4bit) y 88,6 MB (fp16/bf16), por lo que el modelo cabe holgadamente en la memoria unificada de cualquier Mac Apple Silicon.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4, M5 y variantes Pro/Max/Ultra). El autor reporta ~0,75 s por imagen en un M5.
- No está pensado para GPUs NVIDIA/AMD ni para CUDA; requiere el framework MLX.
- Cabe en cualquier Mac consumer con Apple Silicon; no requiere GPU dedicada.
- Opciones de despliegue: ejecución directa con el script `mlx_model.py` incluido (dependencias `mlx`, `numpy`, `pillow`). No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: ~0,75 s por imagen de 1024x1024 en Apple M5; no se proporcionan datos de throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/Entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BiRefNet_lite-MLX (este) | no disponible (pesos 49-89 MB) | 1024x1024 | MAE <= 0,0010, IoU >= 0,9845 vs original | MIT | Hugging Face, MLX |
| ZhengPeng7/BiRefNet_lite (original) | no disponible | 1024x1024 | Referencia fp32 | MIT | Hugging Face, PyTorch |
| BiRefNet (completo) | no disponible | alta resolución | no disponible en esta ficha | MIT | Hugging Face |
| Otros modelos de matting (p. ej. U2-Net, MODNet) | no disponible | variable | no disponible en esta ficha | variable | Hugging Face |

La comparativa se limita a señalar que este port mantiene una fidelidad prácticamente indistinguible del original en fp16/bf16 y una degradación moderada en 4bit. No se dispone de datos de benchmarks comparativos con U2-Net, MODNet u otros modelos de eliminación de fondos en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de visión especializado: no genera texto, no razona, no soporta tool calling ni agentes.
- La entrada se redimensiona internamente a 1024x1024; imágenes con relaciones de aspecto extremas pueden perder detalle.
- Solo funciona en Apple Silicon con MLX; no es portable a CUDA sin conversión adicional.
- La cuantización a 4bit degrada la máscara (IoU 0,9845 frente a 0,9998 en fp16); para producción con bordes finos conviene fp16 o bf16.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí puede producir máscaras incorrectas en escenas ambiguas, objetos transparentes o fondos con colores similares al sujeto.
- Sesgos: no se documentan sesgos específicos en la información disponible; al ser un derivado de BiRefNet_lite, hereda los posibles sesgos del dataset original, no detallado aquí.
- Licencia MIT: permite uso comercial, pero al ser un derivado, se aplica la licencia del modelo original, copiada en el repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.
- No se especifican límites de idioma porque no procesa texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/BiRefNet_lite-MLX
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Paper BiRefNet: https://arxiv.org/abs/2401.03407
- Repositorio MLX: https://github.com/ml-explore/mlx
- Repositorio original BiRefNet (referenciado en el paper): https://github.com/ZhengPeng7/BiRefNet
