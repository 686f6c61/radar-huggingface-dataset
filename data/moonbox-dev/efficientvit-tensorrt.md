# moonbox-dev/efficientvit-TensorRT

## Resumen

EfficientViT-SAM TensorRT es una distribución de motores TensorRT precompilados del modelo EfficientViT-SAM, una arquitectura de segmentación de imágenes que combina un codificador de imagen EfficientViT con el decodificador de máscaras de SAM (Segment Anything Model). El paquete lo publica el usuario moonbox-dev bajo licencia Apache 2.0 y su propósito es ofrecer una alternativa de inferencia acelerada en GPUs NVIDIA, sin dependencia de PyTorch en tiempo de ejecución.

El modelo resuelve el problema de la segmentación de imágenes guiada por prompts (puntos o cajas) con un coste computacional muy inferior al de SAM original, gracias al codificador EfficientViT. Los motores incluidos están compilados con compatibilidad de hardware (Ampere y posteriores: RTX 30, 40 y 50) y de versión (TensorRT 10.x desde 10.13), de modo que no requieren recompilación por GPU concreta.

La relevancia actual radica en su enfoque de despliegue: motores fuertemente tipados en fp32 (sin TF32), un runner mínimo basado en NumPy y Polygraphy, y una validación numérica explícita frente a la build ONNX de referencia. El repositorio ocupa 0,4 GB y solo incluye la variante L0 en precisión fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientViT (codificador) + decodificador de máscaras de SAM; red fuertemente tipada compilada a TensorRT |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 512 x 512) |
| Tipos de cuantizacion | fp32 únicamente (sin TF32); no se incluye fp16 porque pierde máscaras (peor IoU 0.12) |
| Idiomas soportados | no disponible (modelo de segmentación de imágenes) |
| Licencia | Apache 2.0 |
| Formato de pesos | Motores TensorRT (`.engine`); runner en Python con NumPy y Polygraphy |

## Arquitectura y entrenamiento

El modelo sigue el diseño de EfficientViT-SAM: un codificador de imagen EfficientViT que produce un embedding de imagen de forma [1, 256, 64, 64] a partir de una entrada RGB de [1, 3, 512, 512], y un decodificador derivado de SAM que genera máscaras de baja resolución [1, 4, 256, 256] junto con predicciones de IoU. La variante publicada corresponde a L0. El decodificador acepta entre 1 y 10 puntos de prompt, etiquetas de punto, una máscara de entrada y un indicador de presencia de máscara.

Los motores se construyeron con el builder de TensorRT a partir del grafo ONNX publicado por Moonbox para la misma precisión, partiendo del repositorio oficial de EfficientViT en la revisión `de7d7733cc`. La red es fuertemente tipada: cada tensor conserva la precisión que le asigna el grafo ONNX, de modo que un motor fp16 calcularía lo mismo que la build ONNX fp16. No se dispone de información sobre el dataset de entrenamiento original, número de tokens ni procesos de RLHF o DPO, ya que la model card se centra en el proceso de compilación y validación.

La innovación técnica destacable es la compilación con compatibilidad de hardware y versión, que sacrifica algo de velocidad frente a un motor específico para una GPU pero evita recompilaciones. Además, el pipeline replica la aritmética bilineal del redimensionado en Python porque TensorRT no admite el tamaño de imagen como entrada de forma flotante.

## Capacidades

- Segmentación de imágenes guiada por prompts: puntos (devuelve tres máscaras por prompt) y cajas (devuelve una máscara).
- Generación de máscaras a partir de un embedding de imagen calculado una sola vez por fotografía, reutilizable para múltiples prompts.
- Predicción de calidad de máscara mediante `iou_predictions`.
- Soporte de máscara de entrada (`mask_input` y `has_mask_input`) para refinamiento iterativo.
- Ejecución sin PyTorch en tiempo de inferencia: solo TensorRT, Polygraphy, NumPy y Pillow.
- Compatibilidad con GPUs Ampere y posteriores (RTX 30, 40 y 50) y con TensorRT 10.x desde 10.13 mediante el runtime lean.
- No incluye capacidades de texto, razonamiento, código, tool calling ni agentes; es un modelo puramente visual de segmentación.

## Casos de uso

- Segmentación interactiva en herramientas de edición de imagen: el usuario coloca un punto o dibuja una caja sobre una foto y el modelo devuelve la máscara del objeto; el embedding se calcula una vez y se reutiliza para varios prompts, lo que reduce la latencia en sesiones interactivas.
- Preprocesado en pipelines de visión por computador: extracción de máscaras de objetos para tareas posteriores de clasificación, medición o recorte, aprovechando los 19,3 ms del codificador en una RTX 3080 Laptop.
- Anotación semiautomática de datasets: generación de máscaras iniciales a partir de cajas delimitadoras anotadas por humanos, que luego se revisan y corrigen manualmente.
- Procesamiento por lotes en servidores con GPUs Ampere o superiores: al ser motores compatibles con cualquier TensorRT 10.13 o superior, se pueden desplegar en flotas heterogéneas sin recompilar por modelo de GPU.
- Integración en aplicaciones de escritorio o edge con GPU NVIDIA: el runner mínimo sin PyTorch reduce el tamaño de las dependencias y facilita el empaquetado.
- Segmentación de objetos en imágenes médicas o industriales donde se dispone de prompts de punto o caja y se requiere una máscara rápida y determinista en fp32.
- Validación y comparación de precisión: servir como referencia fp32 exacta (sin TF32) para verificar otras implementaciones del mismo modelo.

## Benchmarks y rendimiento

Los datos publicados corresponden a una comparación frente a la build ONNX fp32 ejecutada en el proveedor CPU de ONNX Runtime, considerada referencia exacta (dentro de IoU 0.999 del EfficientViTSamPredictor original en fp32). El conjunto de prueba son las primeras 8 fotos de DIS5K-250, con un prompt de punto (3 máscaras) y un prompt de caja (1 máscara) por foto, es decir, 32 máscaras. La ejecución se realizó en una RTX 3080 Laptop GPU.

| Implementación | IoU de máscara vs ONNX fp32 (media / peor) | Codificador |
|---|---|---|
| ONNX fp32, CUDA con TF32 desactivado | referencia | 43,6 ms |
| TensorRT fp32 | 0,9999 / 0,9977 | 19,3 ms |

El criterio de aceptación era IoU >= 0.99 en todas las máscaras. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los motores ocupan 75,1 MB (decodificador) y 293,6 MB (codificador), por lo que la huella en memoria es reducida.
- GPU recomendadas: cualquier GPU NVIDIA Ampere o posterior; los motores se construyeron y validaron en una RTX 3080 Laptop.
- Compatibilidad declarada: RTX 30, 40 y 50 series.
- Cabe en GPU de consumo: sí, en las series RTX 30, 40 y 50 indicadas por el autor.
- Despliegue: TensorRT 10.x (desde 10.13) con el runtime lean, Polygraphy y NumPy; opcionalmente opencv-python para acelerar el redimensionado final de la máscara.
- Latencia: codificador en 19,3 ms en RTX 3080 Laptop con TensorRT fp32, frente a 43,6 ms con ONNX en CPU. No se publica throughput ni latencia del decodificador.
- Instalación del runtime: `pip install "tensorrt-cu12>=10.13,<11" "tensorrt-lean-cu12>=10.13,<11" polygraphy numpy`.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Precisión | Licencia | Formato |
|---|---|---|---|---|---|
| EfficientViT-SAM TensorRT (este) | EfficientViT + decodificador SAM, L0 | Imagen 512 x 512, prompts de punto o caja | fp32 sin TF32 | Apache 2.0 | Motores TensorRT |
| EfficientViT-SAM original (mit-han-lab) | EfficientViT + decodificador SAM | Imagen, prompts de punto o caja | fp32, fp16 | Apache 2.0 | PyTorch |
| Build ONNX de Moonbox | EfficientViT + decodificador SAM | Imagen, prompts de punto o caja | fp32, fp16 | Apache 2.0 | ONNX |
| SAM original (Meta) | ViT + decodificador de máscaras | Imagen, prompts | fp32, fp16 | Apache 2.0 | PyTorch |

No se dispone de datos de rendimiento comparativos frente a SAM original ni frente a otras variantes de EfficientViT-SAM en la información proporcionada.

## Limitaciones y advertencias

- Solo se incluye la variante L0 y la precisión fp32; no hay motores fp16 ni otros tamaños.
- El fp16 no es viable con este modelo según el autor: las escalas de BatchNorm alcanzan 602 y la peor IoU cae a 0,12.
- El uso de TF32 degrada la precisión: con TF32 activado, la peor máscara baja a IoU 0,16 frente a una ejecución fp32 exacta. Si se usa la build ONNX en CUDA, hay que poner `use_tf32` a 0.
- La compatibilidad de hardware y versión implica una ligera pérdida de velocidad frente a motores compilados para una GPU concreta.
- El pipeline replica el redimensionado bilineal en Python porque TensorRT no acepta el tamaño de imagen como entrada de forma flotante; esto añade coste en CPU.
- Los motores requieren TensorRT 10.x desde 10.13; versiones anteriores no son compatibles.
- No se dispone de información sobre sesgos, alucinación o limitaciones idiomáticas, ya que es un modelo de segmentación visual.
- La licencia Apache 2.0 permite uso comercial, pero los archivos son un derivado del modelo original y quedan sujetos a su licencia, copiada en el repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonbox-dev/efficientvit-TensorRT
- Repositorio oficial de EfficientViT: https://github.com/mit-han-lab/efficientvit
- Paper EfficientViT-SAM (arXiv:2402.05008): https://arxiv.org/abs/2402.05008
- Paper EfficientViT (arXiv:2205.14756): https://arxiv.org/abs/2205.14756
- Paper relacionado citado en los tags (arXiv:2405.10300): https://arxiv.org/abs/2405.10300
- Paper relacionado citado en los tags (arXiv:2410.10733): https://arxiv.org/abs/2410.10733
- Motores: https://huggingface.co/moonbox-dev/efficientvit-TensorRT/blob/main/fp32/encoder.engine y https://huggingface.co/moonbox-dev/efficientvit-TensorRT/blob/main/fp32/decoder.engine
