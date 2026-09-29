# mlx-community/HEART-fp16

## Resumen

HEART (Hybrid Efficient Attention with Rank-factorized bias Transformer) es una red neuronal de superresolución y restauración de imágenes desarrollada por Philip Hofmann (Phips) bajo licencia Apache-2.0. La implementación original está disponible en el repositorio Phips/HEART y se apoya en la familia de arquitecturas HAT y HAT-iLN de XPixelGroup. Se trata de un transformer de atención por ventanas con 16,7 millones de parámetros, entrenado exclusivamente sobre el corpus CC0 Phips/lucid-cc0-v2-hc-512, y orientado a tareas de image-to-image: aumentar la resolución de una imagen y recuperar detalle perdido por degradaciones.

La ficha que nos ocupa, mlx-community/HEART-fp16, no es un modelo nuevo sino una conversión exacta por tensor de los pesos originales al framework MLX de Apple, en precisión fp16, realizada por la comunidad mlx-community. Forma parte del port a Swift y MLX disponible en xocialize/mlx-heart-swift, donde el modelo se expone como el motor `imageUpscale` dentro de la MLXEngine. El repositorio distribuye cuatro checkpoints independientes: dos variantes de 4× (una orientada a fidelidad y otra entrenada con GAN para mayor nitidez) y dos variantes limpias preentrenadas, de 4× y 2×.

Su relevancia práctica radica en que permite ejecutar superresolución de calidad en hardware Apple Silicon de forma nativa, sin depender de PyTorch ni de CUDA. La conversión mantiene en fp32 los tensores sensibles (i-LN, parámetros afines e implicit-net de RIB: 220 de 748 tensores) y todas las reducciones, lo que da una paridad de 127,5 dB de PSNR frente a la implementación original en PyTorch para la variante de fidelidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de atención por ventanas HAT-iLN (familia HAT, XPixelGroup); nombre completo: Hybrid Efficient Attention with Rank-factorized bias Transformer |
| Parámetros totales | 16,7 millones |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo de imagen; usa atención por ventanas, no contexto textual) |
| Tipos de cuantización | fp16 (lane de envío; conv y linear en fp16, i-LN, afines y RIB en fp32). Existe un lane fp32 de paridad en el repositorio mlx-community/HEART-fp32. No hay cuantizaciones de enteros ni GGUF |
| Idiomas soportados | No aplicable / no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX, cuatro ficheros más config.json |
| Escalas soportadas | 4× (tres variantes) y 2× (una variante) |
| Tamaño del repositorio | 0,1 GB |
| Fecha de creación / actualización | 2026-09-28 (ambas, según HuggingFace) |
| Descargas / likes | 0 / 0 en el momento de redactar esta ficha |

Ficheros incluidos:

| Fichero | Checkpoint original | Variante | Escala | Rol |
|---|---|---|---|---|
| heart_4x_otf_v2_fp16.safetensors | models/heart_4x_otf_v2.safetensors | .fidelity (por defecto) | 4× | OTF fidelity; el mejor brazo con entradas dañadas en el banco Forge |
| heart_4x_otf_gan_fp16.safetensors | models/heart_4x_otf_gan.safetensors | .sharp | 4× | OTF GAN; la salida más nítida en casos reales |
| heart_4x_pretrain_fp16.safetensors | models/heart_4x_pretrain.safetensors | .clean | 4× | Preentrenamiento oficial; fuentes limpias |
| heart_2x_fp16.safetensors | models/heart_2x.safetensors | .clean2x | 2× | Preentrenamiento oficial 2× |
| config.json | — | — | — | Arquitectura, variantes, sha256 de origen y la regla de dtype fp16 |

## Arquitectura y entrenamiento

HEART emplea un esquema de transformer con atención por ventanas perteneciente a la familia HAT-iLN, con un bloque de sesgo factorizado por rango (RIB, Rank-factorized bias) procedente de SST (arXiv 2603.06738) y normalización i-LN. Con 16,7 millones de parámetros, es un modelo compacto pensado para restauración de imágenes más que para generación desde cero: recibe una imagen degradada y produce una versión de mayor resolución, con salida 4× o 2× según la variante. La conversión a MLX respeta los tensores por tensor: las claves del modelo original se mantienen sin cambios y solo se reordenan los pesos de convolución de `(O,I,kH,kW)` a `(O,kH,kW,I)`, según indica el script `oracle/convert_weights.py` del port.

El entrenamiento se realizó únicamente sobre el corpus CC0 Phips/lucid-cc0-v2-hc-512, cuya procedencia declarada es LUCID ← nyuuzyou/pxhere ← pxhere.com. La model card no especifica el número de tokens, pasos, composición detallada del dataset, ni si hubo fases de RLHF o DPO; esos datos no están disponibles. Sí se documenta la existencia de varias ramas de entrenamiento: una variante con GAN (`.sharp`), orientada a nitidez en imágenes reales, una variante OTF orientada a fidelidad (`.fidelity`, el mejor brazo con entradas dañadas en el banco interno Forge) y dos preentrenamientos oficiales (`.clean` y `.clean2x`).

La innovación técnica relevante de esta ficha es la política de precisión mixta aplicada en la conversión: se mantienen en fp32 los 220 tensores de 748 correspondientes a i-LN, pesos y sesgos afines y los parámetros de la red implícita de RIB, y el port ejecuta en fp32 todas las reducciones (estadísticas de i-LN, tablas de posición de RIB, softmax, average pooling global y su cabeza squeeze/excite). El resultado, según la model card, es que cada suboperación queda dentro de 1e-5 de error relativo respecto a la implementación de referencia.

## Capacidades

- Superresolución de imágenes con factores fijos de 4× y 2×.
- Restauración de imágenes dañadas: la variante `.fidelity` está descrita como el mejor brazo con entradas degradadas en el banco Forge.
- Producción de salidas nítidas en escenas reales mediante la variante entrenada con GAN (`.sharp`).
- Restauración de fuentes limpias con las variantes preentrenadas (`.clean` a 4× y `.clean2x` a 2×).
- Ejecución local en Apple Silicon mediante MLX, integrable en aplicaciones Swift a través de xocialize/mlx-heart-swift y del motor `imageUpscale` de MLXEngine.
- Selección de variante en tiempo de ejecución: el paquete descarga solo el checkpoint correspondiente a la variante configurada.
- No dispone de tool calling ni function calling.
- No dispone de razonamiento multi-paso, agentes ni capacidades conversacionales.
- No procesa texto, audio ni vídeo; no es un modelo multimodal generativo.
- No tiene capacidades multilingües porque no trabaja con lenguaje.
- No dispone de modo "thinking" ni de ninguna capacidad de visión semántica (no describe imágenes).

## Casos de uso

- Restauración de fotografías antiguas o escaneos: la variante `.fidelity`, entrenada para tolerar entradas dañadas, es la opción natural para recuperar detalle en imágenes con ruido, desenfoque o artefactos de digitalización, aplicando un factor 4×.
- Reescaneado y ampliación de material de archivo: bibliotecas y fondos documentales pueden usar `.clean` (4×) sobre originales de buena calidad para generar derivados de mayor resolución sin alterar el aspecto de la fuente.
- Flujo de trabajo fotográfico en macOS: al ejecutarse sobre MLX, el modelo permite procesar lotes de imágenes localmente en un Mac sin GPU dedicada ni servicios en la nube, integrándose en herramientas Swift mediante el paquete MLXHEART.
- Generación de miniaturas y previsualizaciones de alta resolución: `.sharp` (4×) produce la salida más nítida en imágenes reales, útil cuando el objetivo es percepción visual y no fidelidad pixel a pixel.
- Preprocesado de datasets de visión por computador: elevar la resolución de imágenes de entrenamiento o evaluación con `.clean2x` (2×) o `.clean` (4×) antes de pasarlas a otro modelo de detección o segmentación.
- Preparación de material para impresión: la ampliación 4× con `.fidelity` o `.clean` permite obtener archivos con más píxeles a partir de originales pequeños, siempre que se acepten los límites de reconstrucción del modelo.
- Aplicaciones móviles y de escritorio en el ecosistema Apple: el port Swift permite empaquetar la mejora de imágenes dentro de una app sin arrastrar dependencias de PyTorch ni de CUDA.
- Recuperación de imágenes comprimidas: la variante OTF de fidelidad es la indicada cuando la degradación de origen son artefactos de compresión agresiva, según su papel declarado en el banco de pruebas del autor.

## Benchmarks y rendimiento

Los únicos datos numéricos publicados en la información disponible son medidas de paridad entre la conversión a MLX y la implementación original en PyTorch (CPU, fp32, misma entrada). No son métricas de calidad frente a una referencia de verdad (PSNR/SSIM sobre datasets estándar), por lo que no permiten comparar la calidad del modelo con alternativas.

Paridad del lane fp32 frente a PyTorch, a 128²:

| Variante | PSNR de paridad (128²) |
|---|---|
| .fidelity | 127,5 dB |
| .sharp | 125,3 dB |
| .clean | 122,5 dB |
| .clean2x | 124,0 dB |

Además, la model card indica que cada suboperación queda dentro de 1e-5 de error relativo, y que frente a las exportaciones ONNX del autor bajo ONNX Runtime el port coincide exactamente en la medida en que lo hace el propio PyTorch: 90,2 / 84,9 / 95,8 dB a 128². Señala también que el fichero ONNX de `heart_4x_pretrain` no reproduce su checkpoint (7,8 dB) y que ONNX Runtime se desvía con el tamaño de imagen.

No se han publicado resultados de benchmarks de calidad (PSNR, SSIM, LPIPS u otros sobre datasets estándar de superresolución) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 16,7 millones de parámetros, un checkpoint en fp16 ocupa aproximadamente 33 MB; el repositorio completo son 0,1 GB. La model card no publica cifras de memoria, por lo que cualquier valor por encima de los pesos es una estimación a partir del recuento de parámetros y del uso de tiling.
- Cabe holgadamente en cualquier GPU de consumo y en memoria unificada de Apple Silicon; el modelo está pensado precisamente para ese segundo escenario.
- GPU recomendadas: no aplica CUDA. El destino declarado es Apple Silicon mediante MLX; el autor no publica una lista de GPU compatibles.
- Opciones de despliegue: MLX como framework de inferencia, a través del port Swift xocialize/mlx-heart-swift y del motor `imageUpscale` de MLXEngine. El repositorio también puede consumirse desde Python con MLX. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI (ninguno aplica a un modelo de imagen de este tipo).
- Latencia y throughput: no disponibles. El port incluye un estudio de tiling y un estudio de fp16 documentados en `PORTING-SPEC.md`, pero la información proporcionada no incluye cifras de tiempo por imagen.
- Nota sobre precisión: aunque los pesos de convolución y capas lineales van en fp16, la ejecución mantiene en fp32 las reducciones y los parámetros de i-LN y RIB, de modo que el ahorro de memoria es de pesos, no de todas las operaciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Escala | Licencia | Formatos de pesos | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| mlx-community/HEART-fp16 | 16,7 M | 2× y 4× | Apache-2.0 | safetensors MLX (fp16 con tensores fp32) | HuggingFace, MLX | Conversión por tensor del original; cuatro checkpoints; lane de paridad en fp32 |
| Phips/HEART (original) | 16,7 M | 2× y 4× | Apache-2.0 | safetensors de PyTorch y exportaciones ONNX | HuggingFace | Implementación de referencia del autor; revisión 868878ce4c253a8061300f923b620fdc6edf090a |
| mlx-community/HEART-fp32 | 16,7 M | 2× y 4× | Apache-2.0 | safetensors MLX fp32 | HuggingFace | Lane de paridad y referencia del port |
| HAT / HAT-iLN (XPixelGroup) | No disponible | No disponible | Apache-2.0 según la model card | No disponible | No disponible | Familia arquitectónica en la que se basa HEART; papers arXiv 2205.04437 y 2504.06629 |
| Otras alternativas de superresolución (Real-ESRGAN, SwinIR, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible | No se proporcionan datos de estos modelos en la información disponible |

## Limitaciones y advertencias

- Modelo exclusivamente de imagen: no procesa ni genera texto, audio o vídeo, y no admite interacción conversacional.
- Factores de escala fijos: 2× o 4×, sin ampliación arbitraria ni escalas intermedias.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible, pero el entrenamiento se realizó sobre un único corpus CC0 (Phips/lucid-cc0-v2-hc-512); el comportamiento fuera de esa distribución de imágenes no está caracterizado.
- Riesgo de alucinación visual: como cualquier red de superresolución, puede inventar detalle plausible en zonas muy degradadas. La variante `.sharp` (GAN) prioriza nitidez sobre fidelidad y es la más expuesta a este efecto; para fidelidad se recomienda `.fidelity` o `.clean`.
- Limitaciones de contexto o idioma: no aplica el concepto de contexto textual. No hay idiomas soportados porque el modelo no trabaja con lenguaje.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la propia model card pide acreditar al autor (Philip Hofmann / Phips) al usar estos pesos. La licencia depende además de las licencias de la familia HAT/HAT-iLN (XPixelGroup, Apache-2.0), de traiNNer-redux y de SST (RIB), todas Apache-2.0 según la información disponible.
- Procedencia del dataset: el corpus se declara CC0 por la plataforma, con la cadena LUCID ← nyuuzyou/pxhere ← pxhere.com, y el re-host lo toma como normativo. Conviene verificar esta cadena de licencias si el uso es comercial.
- Conversión de terceros: esta ficha es una conversión de mlx-community, no una publicación del autor original. Los resultados reproducibles son de paridad numérica, no de calidad.
- Discrepancia conocida en el ecosistema: la exportación ONNX de `heart_4x_pretrain` no reproduce su checkpoint (7,8 dB de paridad) y ONNX Runtime se desvía con el tamaño de imagen; no usar esa ruta como referencia.
- Advertencia de precisión: los pesos están en fp16 salvo los tensores que se mantienen en fp32. Ejecutar fuera del port previsto puede alterar la paridad documentada.
- Madurez: 0 descargas y 0 likes en el momento de redactar la ficha, sin validación comunitaria publicada.
- Sin soporte declarado para GGUF, Ollama, llama.cpp, vLLM ni TGI; el despliegue está atado al ecosistema MLX y Apple Silicon.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/HEART-fp16
- Modelo original del autor: https://huggingface.co/Phips/HEART
- Licencia del modelo original: https://huggingface.co/Phips/HEART/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/Phips/lucid-cc0-v2-hc-512
- Port a Swift y MLX: https://github.com/xocialize/mlx-heart-swift
- Framework MLX (repositorio): https://github.com/ml-explore/mlx
- Framework MLX (web): https://mlx-framework.org/
- MLX en Apple Open Source: https://opensource.apple.com/projects/mlx/
- MLX Studio: https://mlx.studio/
- Artículo de Apple sobre MLX y los aceleradores neuronales del M5: https://machinelearning.apple.com/research/exploring-llms-mlx-m5
- HAT, arquitectura base (arXiv 2205.04437): https://arxiv.org/abs/2205.04437
- HAT-iLN (arXiv 2504.06629): https://arxiv.org/abs/2504.06629
- RIB de SST (arXiv 2603.06738): https://arxiv.org/abs/2603.06738
