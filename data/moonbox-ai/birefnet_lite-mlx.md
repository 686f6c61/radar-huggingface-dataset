# moonbox-ai/BiRefNet_lite-MLX

## Resumen

BiRefNet_lite-MLX es la conversión a MLX de BiRefNet-lite, un modelo de segmentación dicotómica de imágenes (DIS, *dichotomous image segmentation*) especializado en la extracción de primer plano y la eliminación de fondos de alta resolución. Lo desarrolla moonbox-ai como port para Apple Silicon del modelo original de ZhengPeng7, y resuelve el problema de ejecutar un segmentador de alta calidad sin depender de PyTorch ni de CUDA en equipos Mac con chip M-series.

El modelo original emplea una arquitectura de referencia bilateral (BiRefNet) con un backbone Swin-T que opera a resolución completa y media resolución, combinado con un decodificador ASPP deformable. La conversión a MLX reescribe la `deform_conv2d` de torchvision en operaciones nativas de MLX y pliega las BatchNorm en las convoluciones, de modo que el port solo requiere `mlx`, `numpy` y `pillow`.

La relevancia actual está en que ofrece cinco precisiones distintas (fp16, bf16, 8bit, 6bit y 4bit) con degradación medida y documentada frente al modelo PyTorch fp32, con un coste de unos 0,75 s por imagen de 1024x1024 en un Apple M5. Es una pieza práctica para pipelines de recorte de producto, edición fotográfica o generación de máscaras alfa en local, sin infraestructura GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (backbone Swin-T a resolución completa y media, decodificador ASPP deformable, referencias bilaterales) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen redimensionada a 1024x1024) |
| Tipos de cuantizacion | fp16, bf16, 8bit, 6bit, 4bit (cuantización afín de MLX, group size 64) |
| Idiomas soportados | no aplica (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), con `config.json` y `mlx_model.py` por carpeta de precisión |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño BiRefNet: un backbone Swin Transformer Tiny que procesa la imagen a resolución completa y a media resolución en paralelo, y un decodificador basado en ASPP con convoluciones deformables que fusiona ambas ramas mediante módulos de referencia bilateral. Esta estructura permite capturar tanto bordes finos de alta frecuencia como contexto semántico global, lo que es clave para la segmentación dicotómica de objetos con contornos complejos (pelo, vegetación, transparencias).

En esta conversión concreta no se ha reentrenado nada: los pesos provienen de `ZhengPeng7/BiRefNet_lite` en la revisión `aa62cd87ea`. El trabajo técnico consiste en cargar los pesos originales en MLX y almacenarlos en bf16 o fp16, o cuantizarlos con la cuantización afín de MLX. Solo se cuantizan las capas lineales de Swin cuya anchura de entrada es múltiplo de 64; las convoluciones, la primera etapa de Swin y las normas permanecen en bf16, por lo que el ahorro de tamaño es menor de lo que sugiere el número de bits. Las BatchNorm se pliegan en las convoluciones y la `deform_conv2d` de torchvision se reimplementa en MLX.

## Capacidades

- Segmentación dicotómica de imágenes: genera una máscara alfa (HxW uint8) que separa primer plano de fondo.
- Extracción de recortes con canal alfa sobre la imagen RGB original.
- Eliminación de fondos de alta resolución: la entrada se redimensiona internamente a 1024x1024.
- Manejo de contornos finos y estructuras complejas gracias a la doble rama de resolución del backbone Swin-T.
- Ejecución local en Apple Silicon mediante MLX, sin CUDA ni PyTorch.
- Cinco precisiones intercambiables con calidad documentada frente al original.
- No soporta tool calling, agentes, generación de texto ni capacidades multilingües: es exclusivamente un modelo de visión.

## Casos de uso

- Recorte de producto para e-commerce: el modelo genera la máscara alfa del artículo sobre fondo neutro, lista para componer sobre fondos de catálogo. La precisión fp16 ofrece IoU de máscara de 0,9998 frente al original, adecuada para producción.
- Edición fotográfica local en Mac: un plugin o app de escritorio puede invocar el port vía MLX para separar sujeto y fondo en unos 0,75 s por imagen de 1024x1024, sin subir fotos a la nube.
- Generación de máscaras para pipelines de composición: la salida uint8 se integra directamente en flujos de postproducción (After Effects, GIMP, ImageMagick) mediante el canal alfa generado.
- Preprocesado para modelos generativos: obtener el sujeto aislado antes de pasarlo a un modelo de imagen-a-imagen o de sustitución de fondo.
- Automatización de catálogos y DAM: procesar lotes de imágenes en un Mac Studio o MacBook para normalizar recortes, usando la variante 8bit (63,1 MB) si el espacio o el ancho de banda de memoria son críticos.
- Prototipado e investigación en segmentación: al estar en MLX y con código de modelo legible (`mlx_model.py`), sirve como base para experimentar con variantes de cuantización o para comparar la fidelidad del port frente a PyTorch.
- Aplicaciones de videollamada o streaming: separación de fondo en tiempo casi real en Apple Silicon, con la variante 4bit (49,4 MB) si se prioriza el tamaño sobre la fidelidad (IoU 0,9845).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (por ejemplo, en DIS5K) en la información disponible. Lo que sí documenta el autor es la fidelidad de cada conversión frente al modelo PyTorch fp32 original, medida sobre las mismas entradas:

| Precision | Tamano | MAE vs PyTorch fp32 (peor imagen) | IoU de mascara (peor) |
|---|---|---|---|
| fp16 | 88,7 MB | 0,00002 | 0,9998 |
| bf16 | 88,7 MB | 0,0002 | 0,9987 |
| 8bit | 63,1 MB | 0,0002 | 0,9978 |
| 6bit | 56,3 MB | 0,0003 | 0,9986 |
| 4bit | 49,5 MB | 0,0010 | 0,9845 |

Latencia reportada: aproximadamente 0,75 s por imagen de 1024x1024 en un Apple M5, en todas las precisiones.

## Requisitos de hardware

- VRAM/memoria unificada: el mayor artefacto pesa 88,6 MB, por lo que el modelo cabe holgadamente en cualquier Mac con Apple Silicon; el cuello de botella es la memoria del proceso de inferencia, no los pesos.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4, M5); el autor reporta tiempos en M5. No es compatible con CUDA ni con GPUs NVIDIA/AMD sin reescribir el port.
- Cabe en GPU de consumo: sí, en cualquier Mac con chip M-series; no está pensado para GPUs de consumo x86.
- Opciones de despliegue: MLX (librería `mlx` de Apple), con `mlx_model.py` incluido en cada carpeta; requiere `numpy` y `pillow`. No hay integración documentada con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de segmentación de este tipo).
- Latencia y throughput: ~0,75 s por imagen de 1024x1024 en Apple M5 a cualquier precisión; el throughput no se documenta explícitamente.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Formato/plataforma | Notas |
|---|---|---|---|---|---|
| BiRefNet_lite-MLX (este) | no disponible | 1024x1024 | MIT | MLX, safetensors | Port para Apple Silicon, 5 precisiones, fidelidad medida |
| ZhengPeng7/BiRefNet_lite | no disponible | 1024x1024 | MIT | PyTorch | Modelo original del que deriva este port |
| BiRefNet (completo) | no disponible | no disponible | MIT | PyTorch | Variante de mayor capacidad de la misma familia; datos concretos no disponibles en la información proporcionada |
| Segment Anything (SAM) | no disponible | no disponible | no disponible | PyTorch | Segmentación promptable generalista, no específica de DIS; datos concretos no disponibles en la información proporcionada |

No se dispone de datos de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo exclusivamente de segmentación de imágenes: no genera texto, no razona y no soporta instrucciones en lenguaje natural.
- La entrada se redimensiona internamente a 1024x1024, lo que puede perder detalle en imágenes de resolución muy alta o muy extrema en proporción.
- La cuantización a 4bit reduce el tamaño a 49,5 MB pero baja el IoU de máscara a 0,9845 en el peor caso; para producción sensible a la fidelidad conviene fp16 o bf16.
- Solo se cuantizan las lineales de Swin con anchura múltiplo de 64; convoluciones, primera etapa y normas quedan en bf16, así que el ahorro real es menor que el nominal.
- Dependencia de MLX y Apple Silicon: no es portable a CUDA ni a GPUs x86 sin trabajo adicional.
- Licencia MIT, que permite uso comercial, pero los archivos son derivados del modelo original y heredan su licencia; conviene conservar el aviso de copyright.
- No se documentan sesgos específicos ni tasas de fallo en escenarios difíciles (transparencias, movimiento, pelo muy fino); la evaluación publicada se limita a la fidelidad frente al original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonbox-ai/BiRefNet_lite-MLX
- Modelo base original: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Paper de BiRefNet (arXiv:2401.03407): https://arxiv.org/abs/2401.03407
- Repositorio de MLX: https://github.com/ml-explore/mlx
