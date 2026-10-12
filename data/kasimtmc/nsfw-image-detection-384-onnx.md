# kasimtmc/nsfw-image-detection-384-onnx

## Resumen

nsfw-image-detection-384-onnx es una exportación a formato ONNX y cuantización a int8 del modelo Marqo/nsfw-image-detection-384, un clasificador binario de imágenes que distingue contenido NSFW de contenido apto (SFW). Lo publica el usuario de HuggingFace kasimtmc y se apoya en la arquitectura ViT-tiny de timm (`vit_tiny_patch16_384`), es decir, un Vision Transformer compacto con parches de 16x16 píxeles y entrada fija de 384x384. El modelo base es de Marqo y conserva su licencia Apache-2.0.

El problema que resuelve es la moderación de imágenes en entornos donde no es deseable (o no es posible) enviar el contenido a un servidor: el autor lo usa en la aplicación Ruminote para comprobar las imágenes generadas en el propio dispositivo antes de mostrarlas al usuario. Con un único fichero de 6.661.897 bytes (unos 6,35 MiB) y pesos mayoritariamente en int8, el modelo cabe en el binario de una aplicación móvil o de escritorio y se ejecuta en CPU mediante ONNX Runtime, sin necesidad de GPU.

Su relevancia actual está ligada al auge de la IA en el borde (edge AI) y a los requisitos de privacidad: permite aplicar una primera barrera de moderación local, de bajo coste y baja latencia, que filtra el grueso del contenido antes de recurrir a modelos mayores o a revisión humana. En el momento de la consulta la ficha acumula 0 descargas y 0 "likes", y no se han publicado resultados de benchmarks ni cifras oficiales de latencia o throughput.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-tiny, `vit_tiny_patch16_384` de timm), parches de 16x16, entrada 384x384 |
| Parametros totales | No disponible en la model card; del orden de 5,6 millones estimados a partir de la configuracion de `vit_tiny_patch16_384` y del tamano del fichero |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificador de imagenes con entrada fija de 384x384 px) |
| Tipos de cuantizacion | Cuantizacion dinamica int8 (QInt8, solo operadores MatMul y Gemm); la convolucion de patch embedding permanece en fp32 |
| Idiomas soportados | No aplica (clasificacion de imagenes, sin componente textual) |
| Licencia | Apache-2.0 (misma que el modelo base) |
| Formato de pesos | ONNX, opset 17, fichero unico `nsfw_vit_tiny_384_int8.onnx` (6.661.897 bytes, SHA-256 `20cc99a8986320972273253325975203f2a647ca0010a1ac9c869a0dbb9eb77d`) |
| Entrada | `pixel_values`: float32 `[1, 3, 384, 384]`, RGB, formato NCHW, normalizacion `(x / 255 - 0.5) / 0.5` |
| Salida | `logits`: float32 `[1, 2]`, orden de etiquetas `[NSFW, SFW]`; aplicar softmax, el indice 0 es la probabilidad de NSFW |
| Revision del modelo base | `0c26ec22111b83f106d72a55f611ec35962bcb65` |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer de la familia ViT-tiny: divide la imagen de 384x384 en parches de 16x16 píxeles, los proyecta a un espacio de embeddings y los procesa mediante bloques de auto-atención, con un cabezal de clasificación de dos clases (NSFW y SFW). La arquitectura es la variante `vit_tiny_patch16_384` de la librería timm, el mismo backbone que emplea el modelo original de Marqo. No se dispone de información sobre el dataset de entrenamiento, el número de tokens o imágenes vistas, ni sobre si se aplicaron etapas de ajuste fino con RLHF o DPO; esos datos no aparecen en la model card publicada.

Lo relevante de esta ficha no es el entrenamiento, sino el proceso de conversión y compresión. El script `convert.py` carga los pesos originales en la revisión fijada, los exporta a ONNX con opset 17 y aplica `onnxruntime.quantization.quantize_dynamic` con cuantización QInt8 restringida a los operadores MatMul y Gemm. La convolución de patch embedding se mantiene en fp32 porque ONNX Runtime 1.22 no dispone de kernel int8 `ConvInteger`. Según el autor, la exportación en fp32 coincide con PyTorch hasta tres decimales, y el fichero int8 se mantiene dentro de una diferencia aproximada de 0,03 respecto a fp32 en imágenes corrientes; en casos límite esa diferencia puede ser mayor (en una pintura renacentista, fp32 da 0,65 e int8 da 0,38).

## Capacidades

- Clasificación binaria de imágenes en dos etiquetas: NSFW y SFW, con salida en forma de logits de dos dimensiones y probabilidad obtenida por softmax.
- Detección de contenido para adultos en imágenes fijas, con sensibilidad declarada ante bañadores y desnudo clásico.
- Inferencia local en CPU, sin dependencia de GPU ni de servicios en la nube, gracias al formato ONNX int8 y a su reducido tamaño.
- Integración en aplicaciones móviles y de escritorio mediante cualquiera de los enlaces de ONNX Runtime (Python, C++, C#, Java, JavaScript/Web, Mobile).
- Procesamiento por lotes a nivel de pipeline (una imagen por inferencia, tamaño de lote 1 en el grafo exportado).
- No soporta generación de texto, ni razonamiento, ni código, ni matemáticas: es exclusivamente un clasificador de imágenes.
- No dispone de tool calling, function calling ni capacidades de agente o razonamiento multi-paso.
- No tiene capacidades multilingües ni multimodalidad de entrada más allá de la imagen.
- No dispone de modo de razonamiento (thinking mode), audio ni vídeo; la entrada es una imagen RGB estática.

## Casos de uso

- Moderación de imágenes generadas en el propio dispositivo: es el caso original del autor. La aplicación Ruminote ejecuta el modelo localmente para comprobar cada imagen generada antes de mostrarla, evitando enviar el contenido a un servidor y reduciendo la latencia a la de una única inferencia en CPU.
- Pre-filtro en plataformas de contenido generado por el usuario: clasificar las subidas automáticamente y desviar solo las positivas o dudosas a revisión humana, reduciendo el volumen que llega a los moderadores.
- Control parental y filtrado local: integrarlo en navegadores, gestores de archivos o suites de control parental que analizan imágenes en el equipo del usuario sin subirlas a la nube.
- Autoetiquetado de datasets: procesar grandes volúmenes de imágenes en lote por CPU para marcar preliminarmente las muestras NSFW antes de entrenar o curar otros modelos.
- Barrera de seguridad en pipelines de difusión (Stable Diffusion, Flux u otros): comprobar la salida del generador antes de servirla al usuario, con un coste computacional mínimo respecto al propio modelo generativo.
- Moderación en entornos aislados o con requisitos estrictos de privacidad: entornos air-gapped, sanitarios o legales donde el contenido no puede salir de la infraestructura local y se necesita una comprobación automatizada inmediata.
- Filtrado en aplicaciones de mensajería y foros: analizar los adjuntos de imagen en el cliente o en el servidor de forma barata antes de almacenarlos o reenviarlos.
- Curado y deduplicación de crawls web: etiquetar a gran escala imágenes descargadas de internet para excluir contenido no deseado antes de construir un corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La búsqueda web realizada no devolvió material técnico relevante sobre el modelo (los resultados obtenidos correspondían a guías turísticas sin relación con el tema), y la model card del autor no incluye métricas como exactitud, precisión, recall, F1, MMLU ni similares.

El único dato cuantitativo aportado por el autor es la comparación de fidelidad entre la versión fp32 y la cuantizada:

| Comparacion | Resultado reportado |
|---|---|
| Exportacion fp32 frente a PyTorch | Coincidencia hasta 3 decimales |
| int8 frente a fp32 en imagenes corrientes | Diferencia de aproximadamente 0,03 |
| int8 frente a fp32 en arte limite (pintura del Renacimiento) | fp32 0,65 frente a int8 0,38 |
| Foto de playa con persona en bikini | Puntuacion NSFW de aproximadamente 0,90 |

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el modelo está pensado para CPU. En ejecución ocupa una fracción pequeña de memoria (el fichero pesa 6,66 MB), por lo que cualquier equipo con unas pocas decenas de megabytes libres puede cargarlo.
- GPU recomendadas: no requiere GPU. Puede ejecutarse en cualquier GPU con soporte CUDA mediante el proveedor de ejecución correspondiente de ONNX Runtime, pero no aporta ventajas significativas dado el tamaño del modelo.
- Compatibilidad con GPU de consumo: sí, cabe con enorme margen en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.), e incluso en GPU integradas y en hardware móvil.
- Cabe en dispositivos de borde: sí, es su objetivo principal; apto para Android, iOS y sistemas embebidos a través de ONNX Runtime Mobile.
- Opciones de despliegue: ONNX Runtime en sus distintos enlaces (Python, C++, C#, Java, JavaScript/Web, Mobile), y su integración en servidores de inferencia compatibles con ONNX como Triton Inference Server. No aplica a vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos de lenguaje.
- Latencia y throughput: no se publican cifras oficiales. Por el tamaño del modelo (del orden de 5,6 millones de parámetros) y su cuantización int8, es esperable una latencia del orden de decenas de milisegundos por imagen en una CPU de escritorio o de servidor moderna, pero este dato es una estimación y no una cifra confirmada por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| kasimtmc/nsfw-image-detection-384-onnx | Del orden de 5,6 M (estimado) | 384x384 | ONNX int8 (6,66 MB) | Apache-2.0 | Objeto de esta ficha; optimizado para inferencia local en CPU |
| Marqo/nsfw-image-detection-384 | No disponible | 384x384 | Pesos PyTorch/timm (fp32) | Apache-2.0 | Modelo base del que deriva esta version; mayor huella de memoria y sin cuantizar |
| Otros detectores NSFW de tipo ViT disponibles en HuggingFace | No disponible | No disponible | No disponible | No disponible | Existen alternativas de la comunidad (por ejemplo, clasificadores basados en ViT-base), pero no se dispone de datos verificados de parametros, contexto, rendimiento ni licencia en la informacion proporcionada, por lo que no se incluyen cifras |

## Limitaciones y advertencias

- Sensibilidad declarada ante bañadores y desnudo clásico: una foto de playa con una persona en bikini obtiene una puntuación NSFW de aproximadamente 0,90, lo que obliga a calibrar el umbral con cuidado para no disparar falsos positivos.
- No sustituye a la revisión humana: el propio autor lo indica de forma explícita en la model card.
- Degradación en casos límite: la cuantización int8 puede alejarse más de fp32 en imágenes ambiguas o artísticas (en el ejemplo citado, 0,38 frente a 0,65), lo que puede cambiar el resultado final según el umbral elegido.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas (falsos positivos y falsos negativos) inherente a todo clasificador de este tipo.
- Sesgos conocidos: no se documentan sesgos demográficos, culturales o de otro tipo en la información disponible; la sensibilidad ante desnudo artístico o contextual sugiere un sesgo hacia marcar como NSFW contenido legítimo con piel visible.
- Limitaciones de idioma: no aplica, al ser un modelo de imagen sin componente textual.
- Limitaciones de contexto: la entrada es fija en 384x384 píxeles y el modelo procesa una imagen por inferencia (tamaño de lote 1 en el grafo exportado).
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución siempre que se conserve el aviso de licencia y se atribuya la autoría original (Marqo). Conviene conservar también la atribución del autor de la conversión.
- Caveat de producción: el modelo se distribuye con muy poca validación externa (0 descargas y 0 "likes" en el momento de la consulta) y sin benchmarks públicos, por lo que cualquier despliegue en producción debería ir precedido de una evaluación propia sobre un conjunto representativo del dominio objetivo.
- Dependencia de ONNX Runtime: el kernel int8 de la convolución de patch embedding no está disponible en ONNX Runtime 1.22, de ahí que se mantenga en fp32; cambios de versión del runtime podrían alterar el comportamiento o el rendimiento.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/kasimtmc/nsfw-image-detection-384-onnx
- Modelo base (Marqo/nsfw-image-detection-384): https://huggingface.co/Marqo/nsfw-image-detection-384
- Revision de pesos de origen: `0c26ec22111b83f106d72a55f611ec35962bcb65`
- Documentacion de cuantizacion de ONNX Runtime: https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html
- Repositorio de timm (arquitectura `vit_tiny_patch16_384`): https://github.com/huggingface/pytorch-image-models
- Nota sobre la busqueda web: los resultados obtenidos no contenian informacion tecnica ni benchmarks sobre este modelo, por lo que no se incluyen como fuentes.
