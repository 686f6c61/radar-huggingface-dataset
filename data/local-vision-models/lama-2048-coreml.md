# local-vision-models/lama-2048-coreml

## Resumen

Big LaMa 2048 Core ML es una conversión a formato Core ML del modelo Big LaMa, una red neuronal de inpainting (relleno de regiones enmascaradas en imágenes) desarrollada originalmente por Suvorov et al. y publicada en el paper "Resolution-robust Large Mask Inpainting with Fourier Convolutions" (WACV 2022). El repositorio lo mantiene el usuario `local-vision-models` y su aportación consiste en empaquetar los pesos originales de Big LaMa como un modelo Core ML con resolución fija de 2048 x 2048 píxeles, de forma que pueda ejecutarse de manera nativa en el ecosistema Apple (macOS, iOS, iPadOS) sin depender de PyTorch.

La relevancia de esta conversión radica en que permite usar un modelo de inpainting de alta resolución directamente sobre el Neural Engine o la GPU Metal de dispositivos Apple, con un repositorio de solo 0,2 GB. El modelo recibe dos entradas, una imagen RGB de 2048 x 2048 y una máscara en escala de grises donde el valor 255 marca la zona a rellenar, y devuelve una imagen RGB con esa región reconstruida. No es un modelo de lenguaje: no genera texto ni razona, su única tarea es la reconstrucción visual coherente de áreas borradas.

El repositorio no incluye pipeline declarado, no registra descargas ni likes, y su model card es mínima. La licencia es Apache 2.0, heredada tanto del código original (repositorio `advimman/lama`) como de los pesos (`smartywu/big-lama`), lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución propias de esa licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de inpainting con convoluciones de Fourier (Fast Fourier Convolutions, FFC); variante "Big" del modelo LaMa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen de 2048 x 2048 px) |
| Tipos de cuantizacion | no disponible (el repositorio ocupa 0,2 GB, compatible con pesos en FP16, pero no se especifica) |
| Idiomas soportados | no disponible (modelo de vision, no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | Core ML (paquete `.mlmodel` / `.mlpackage`); no se distribuyen safetensors ni GGUF |
| Entradas | `image` (RGB, 2048 x 2048) y `mask` (escala de grises, 255 marca la zona a rellenar) |
| Salida | `output` (RGB, imagen con la region rellenada) |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion | 2026-10-16 |
| Ultima actualizacion | 2026-10-16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es LaMa, una red feed-forward de inpainting que sustituye las convoluciones espaciales convencionales por convoluciones de Fourier (FFC) dentro de un esquema de "large mask inpainting". La motivacion del diseño es que las convoluciones en el dominio de la frecuencia ofrecen un campo receptivo efectivo que cubre toda la imagen, lo que permite rellenar máscaras grandes y no solo pequeños defectos. El paper original destaca la robustez frente a la resolución, propiedad que esta conversión aprovecha fijando la entrada en 2048 x 2048 píxeles. La variante "Big" corresponde a una configuración de mayor anchura o capacidad que la versión base del modelo.

Sobre el entrenamiento no se aporta información en la model card: no se indica el número de tokens o imágenes de entrenamiento, la composición del dataset ni si hubo etapas de ajuste fino. Tampoco se documenta ningún proceso de RLHF, DPO ni técnicas de decodificación, dado que no es un modelo generativo de texto. La innovación técnica destacable es doble: por un lado, el uso de convoluciones de Fourier para lograr un campo receptivo global; por otro, la propia conversión a Core ML, que habilita la ejecución acelerada en hardware Apple y fija la resolución a 2048 px como compromiso entre calidad y coste computacional.

## Capacidades

- Inpainting de alta resolucion: rellena regiones marcadas por una mascara en imagenes de 2048 x 2048 px.
- Eliminacion de objetos: al marcar con 255 el objeto a borrar, el modelo reconstruye el fondo de forma coherente.
- Relleno de mascaras grandes: la arquitectura con convoluciones de Fourier esta disenada para huecos amplios, no solo para defectos pequenos.
- Restauracion de imagenes: util para recuperar zonas danadas, con marcas de agua o con elementos no deseados.
- Entrada y salida en RGB: el modelo trabaja con una imagen de entrada y devuelve otra imagen, sin pasos intermedios de texto.
- Ejecucion nativa en el ecosistema Apple mediante Core ML.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, ya que no es un modelo de lenguaje.
- No dispone de modo de razonamiento (thinking mode), vision-language, audio ni generacion de texto.

## Casos de uso

- Retoque fotografico profesional: un editor marca con la mascara una zona no deseada (por ejemplo, un cable o un turista) y el modelo rellena el hueco con textura coherente a 2048 px, una resolucion adecuada para impresion.
- Eliminacion de objetos en catalogos de producto: las tiendas pueden borrar soportes, etiquetas o fondos improvisados de fotografias de producto sin recurrir a un editor manual.
- Restauracion de fotografias antiguas: se marcan las zonas con rasguños, manchas o perdidas de emulsion, y el modelo reconstruye el contenido de forma plausible.
- Limpieza de imagenes para conjuntos de datos: antes de entrenar un modelo de vision, se pueden eliminar marcas de agua, logotipos o anotaciones quemadas que contaminarian el dataset.
- Aplicaciones moviles de edicion en iOS/iPadOS: al estar en formato Core ML, puede integrarse en apps nativas que aprovechen el Neural Engine para edicion en tiempo casi real.
- Postproduccion de video por fotogramas: aplicado fotograma a fotograma sobre un clip, permite eliminar un objeto estatico o un microfono de un plano fijo.
- Anonimizacion de contenido sensible: borrado de caras, matriculas o documentos visibles en una imagen mediante mascara y reconstruccion del contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas como FID, LPIPS o PSNR, y tampoco se facilitan comparaciones cuantitativas con otros modelos de inpainting. El paper original de LaMa (WACV 2022) reporta resultados en sus propios conjuntos de evaluacion, pero esos numeros no forman parte de la informacion proporcionada sobre este repositorio, por lo que no se reproducen aqui.

## Requisitos de hardware

- VRAM o memoria unificada estimada: no disponible de forma explicita. El repositorio ocupa 0,2 GB, pero el coste en inferencia depende del grafo Core ML y del espacio de activaciones a 2048 x 2048, que es elevado.
- GPU o acelerador recomendado: hardware Apple con Neural Engine o GPU Metal, ya que el modelo esta en formato Core ML. No se garantiza su ejecucion en CUDA sin una conversion adicional a otro formato.
- Cabe en GPU de consumo: si, en el sentido de que esta pensado para Macs con Apple Silicon (serie M) y dispositivos iPhone/iPad recientes. En GPUs NVIDIA de consumo solo funcionaria tras reconvertir el modelo a otro runtime, algo no documentado en el repositorio.
- Opciones de despliegue: Core ML directamente, o a traves de frameworks Apple como Vision y Core ML Tools. No se documentan variantes para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de vision de este tipo.
- Latencia y throughput estimados: no disponible. La resolucion de 2048 x 2048 implica un coste computacional alto por imagen, por lo que no es adecuado para procesamiento en tiempo real de video a esa resolucion sin reduccion previa.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion de entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Big LaMa 2048 Core ML (este repositorio) | Inpainting con convoluciones de Fourier | 2048 x 2048 | Core ML | Apache 2.0 | Hugging Face, 0 descargas |
| Big LaMa original (`smartywu/big-lama`) | Inpainting con convoluciones de Fourier | Variable segun uso | Pesos PyTorch | Apache 2.0 | Hugging Face |
| LaMa base (`advimman/lama`) | Inpainting con convoluciones de Fourier | Variable segun uso | Codigo y pesos PyTorch | Apache 2.0 | GitHub |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada, por lo que la comparacion se limita a formato, resolucion fijada y licencia. Otras alternativas de inpainting ampliamente conocidas (por ejemplo, variantes basadas en difusion) no se incluyen porque no se aportan datos sobre ellas en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta agentes ni tool calling. Cualquier expectativa en ese sentido es incorrecta.
- Resolucion fija: la entrada debe ser de 2048 x 2048 px. Imagenes de otras dimensiones requieren redimensionado previo, lo que puede alterar la proporcion y la calidad del resultado.
- Dependencia de la mascara: el resultado depende por completo de una mascara binaria correcta (255 marca la zona a rellenar). Mascaras mal construidas producen rellenos incorrectos.
- Riesgo de artefactos y alucinacion visual: como cualquier modelo de inpainting, puede inventar texturas o estructuras que no existian en la imagen original, especialmente en huecos muy grandes o con patrones repetitivos.
- Sesgos del dataset de entrenamiento: al no documentarse la composicion de los datos de entrenamiento, no es posible evaluar sesgos de contenido, demografia o estilo.
- Sin datos de rendimiento: la ausencia de benchmarks en el repositorio impide conocer su calidad real frente a alternativas.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, y sin pipeline declarado, lo que reduce la validacion por parte de la comunidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero exige conservar los avisos de copyright y atribucion del codigo original (`advimman/lama`) y de los pesos (`smartywu/big-lama`).
- Compatibilidad limitada: al estar en Core ML, su uso queda practicamente restringido al ecosistema Apple salvo reconversion manual a otro formato.
- Falta de soporte declarado: la model card es minima y no ofrece garantias de mantenimiento, actualizaciones ni soporte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/local-vision-models/lama-2048-coreml
- Codigo original de LaMa: https://github.com/advimman/lama
- Pesos originales de Big LaMa: https://huggingface.co/smartywu/big-lama
- Paper original: Suvorov et al., "Resolution-robust Large Mask Inpainting with Fourier Convolutions", WACV 2022 (referenciado en la model card; no se proporciona URL directa)
