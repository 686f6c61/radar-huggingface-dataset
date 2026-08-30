# Asher-1/GKD_GGUF

## Resumen

El modelo `Asher-1/GKD_GGUF` es una conversión a formato GGUF del modelo GKDT-L, un sistema de detección de keypoints (puntos clave) en imágenes desarrollado por Asher-1 y publicado en el contexto del ECCV 2026. El modelo original está pensado para localizar puntos anatómicos o de referencia en imágenes RGB, admitiendo tres modos de consulta: mediante nombres textuales de los keypoints, mediante ejemplos visuales (1-shot), o combinando ambos. La conversión a GGUF permite ejecutar el modelo con llama.cpp y otras herramientas compatibles, ofreciendo cuantizaciones F32, F16 y Q8_0 que reproducen los resultados del checkpoint original en PyTorch con un error máximo de 0,003 píxeles.

El modelo combina una torre de visión DINOv3 ViT-L con una torre de texto `dinotxt` y un transformador de conocimiento (KG) de dos bloques, más una cabeza de detección sin parámetros que genera mapas de calor sobre una cuadrícula de 96×96. Con 887 millones de parámetros totales y un peso del repositorio de 6,3 GB, el archivo GGUF en F16 ocupa 1,70 GiB y en Q8_0 944 MiB, lo que lo hace viable en GPUs de consumo. La licencia permite uso académico y educativo, pero prohíbe explícitamente el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GKDT-L: DINOv3 ViT-L (visión, D=1024, 24 bloques, 16 cabezas, 4 tokens de almacenamiento + cls, RoPE con períodos, LayerScale 1e-5) + dinotxt (texto, D=1280, 24 bloques causales, 20 cabezas) + proyección lineal 1280→2048 + red de adaptación de texto (1 bloque CLIP, QuickGELU, 2048↔1280) + transformador KG (2 bloques, SA+CA, d_ff=1024, token de máscara) + cabeza de detección sin parámetros (upsample bilineal 4×, normalización L2, kernel 1×1, fusión por filas con prompts rellenados a 80 filas) |
| Parametros totales | 887.226.896 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión, no generativo) |
| Tipos de cuantizacion | F32, F16, Q8_0 (los tres incluidos en el repositorio) |
| Idiomas soportados | No disponible (los prompts textuales usan tokenización CLIP BPE, probablemente inglés, pero no se especifica) |
| Licencia | Uso gratuito para investigación académica y educación; uso comercial prohibido |
| Formato de pesos | GGUF (archivos `.gguf`) |

## Arquitectura y entrenamiento

La arquitectura de GKDT-L es híbrida y modular. La rama visual usa un DINOv3 ViT-L con 24 bloques y 16 cabezas, que procesa imágenes de 384×384 píxeles (con relleno centrado al color medio de ImageNet). La rama textual emplea una torre `dinotxt` de 24 bloques causales con 20 cabezas, que tokeniza los nombres de los keypoints mediante el BPE de CLIP. Ambas ramas se fusionan mediante una proyección lineal (1280→2048) y una red de adaptación de texto con un bloque estilo CLIP y QuickGELU. A continuación, un transformador de conocimiento (KG) de dos bloques con atención propia y cruzada integra la información visual y textual, y una cabeza de detección sin parámetros genera mapas de calor de 96×96 que se convierten en coordenadas normalizadas en el espacio -1..1 de la región de interés.

No se proporcionan datos sobre el conjunto de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La model card indica que el checkpoint fuente es `models/pytorch/gkd_fullset.best` y que la conversión a GGUF reproduce los resultados del PyTorch original con un error máximo de 0,003 píxeles en la imagen de prueba `2007_007524.jpg`. La conversión incluye el plegado de `bias_mask`, la exportación de los períodos de RoPE, la transposición de `anet.proj` y la división de la proyección de atención cruzada en tensores q/k/v, además de cuantizar solo matrices 2-D que cumplen la restricción de tamaño de bloque.

## Capacidades

- Detección de keypoints en imágenes RGB: localiza puntos de referencia en una región de interés a partir de una imagen de entrada.
- Tres modos de consulta: por nombre textual del keypoint, por ejemplo visual (1-shot con agrupamiento gaussiano soft-fiber, σ=14), o multimodal (fusión de ambos).
- Salida estructurada: mapa de calor de 96×96 que se convierte en coordenadas normalizadas (-1..1) y una puntuación de confianza.
- Preprocesamiento de imagen estándar: redimensionado al lado mayor de 384 px, relleno centrado con color medio de ImageNet y normalización ImageNet.
- Compatibilidad con GGUF: puede ejecutarse con llama.cpp y otras herramientas que soporten este formato, incluyendo backends CUDA, Vulkan y CPU.
- Precisión numérica verificada: error medio absoluto inferior a 0,003 píxeles respecto al checkpoint PyTorch original en los tres modos de prompt.

## Casos de uso

- Análisis de imágenes médicas: localización de puntos anatómicos en radiografías o resonancias para asistir a radiólogos en la medición de distancias o ángulos. El modo textual permite consultar por nombre del punto, y el modo visual con ejemplos facilita la adaptación a nuevos dominios.
- Control de calidad industrial: detección de puntos de referencia en piezas fabricadas para verificar alineación, deformaciones o defectos. La baja latencia en CUDA (44 ms en F16) permite inspección en línea.
- Seguimiento de objetos y pose: extracción de keypoints en secuencias de vídeo para análisis de movimiento humano o robótica. El modo multimodal combina descripciones textuales con ejemplos visuales para robustez.
- Investigación en visión por computador: como modelo de referencia para estudiar la fusión de información visual y textual en tareas de localización, o como base para fine-tuning en datasets específicos.
- Automatización de etiquetado: generación de anotaciones preliminares de keypoints en grandes conjuntos de imágenes, reduciendo el esfuerzo manual. La versión GGUF permite desplegarlo en entornos sin GPU mediante CPU, aunque con mayor latencia.
- Educación y docencia: ejemplo didáctico de arquitectura multimodal y de conversión de modelos PyTorch a GGUF, útil en cursos de aprendizaje profundo aplicado.

## Benchmarks y rendimiento

La model card incluye resultados de precisión y latencia medidos con la imagen `2007_007524.jpg` y 15 imágenes oficiales respectivamente. La precisión se expresa como error medio absoluto de los keypoints en píxeles de la imagen original:

| Configuracion | Texto | Visual | Multimodal | Maximo entre modos |
|---|---|---|---|---|
| cpu-f32 | 0,0028 px | 0,0025 px | 0,0025 px | 0,0048 px |
| cuda-f32 | 0,0028 px | 0,0025 px | 0,0025 px | 0,0048 px |
| cuda-f16 | 0,0028 px | 0,0025 px | 0,0025 px | 0,0048 px |
| cuda-q8_0 | 0,0028 px | 0,0025 px | 0,0025 px | 0,0048 px |
| vulkan-f32 | 0,0028 px | 0,0025 px | 0,0025 px | 0,0048 px |

La latencia media de extremo a extremo sobre 15 imágenes oficiales, comparada con el checkpoint PyTorch original en CUDA:

| Modo | cuda-f16 | cuda-q8_0 | cuda-f32 | vulkan-f32 | cpu-f32 | pytorch-cuda |
|---|---|---|---|---|---|---|
| Texto | 44,6 ms (5,2x) | 42,5 ms (5,4x) | 54,7 ms (4,2x) | 58,7 ms (3,9x) | 1549 ms | 231,5 ms |
| Visual | 44,0 ms (3,0x) | 43,0 ms (3,1x) | 51,6 ms (2,6x) | 51,9 ms (2,5x) | 1568 ms | 131,9 ms |
| Multimodal | 49,3 ms (6,1x) | 47,4 ms (6,3x) | 64,8 ms (4,6x) | 64,2 ms (4,7x) | 1989 ms | 299,8 ms |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, ya que el modelo no es generativo de texto sino de detección visual.

## Requisitos de hardware

- VRAM estimada: el archivo F16 ocupa 1,70 GiB y el Q8_0 944 MiB; con overhead de ejecución, se recomienda al menos 2 GiB para F16 y 1,5 GiB para Q8_0.
- GPU recomendadas: cualquier GPU con soporte CUDA o Vulkan y al menos 2 GB de VRAM. Ejemplos: NVIDIA GTX 1650, RTX 3060, RTX 4090, o GPUs integradas con Vulkan.
- En CPU: funciona con llama.cpp en modo CPU, aunque la latencia es alta (1549 ms por imagen en F32), por lo que no es adecuado para tiempo real sin aceleración.
- Opciones de despliegue: llama.cpp (compatible con GGUF), backends CUDA, Vulkan y CPU. No se menciona soporte explícito para vLLM, Ollama o TGI, pero al ser GGUF puede integrarse en herramientas que acepten este formato.
- Latencia y throughput: en CUDA con F16, la inferencia por imagen es de 44-49 ms según el modo de prompt; en Vulkan F32, 52-64 ms; en CPU F32, 1549-1989 ms.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de detección de keypoints en formato GGUF ni sobre alternativas de la misma categoría. La model card no proporciona referencias a otros sistemas similares, por lo que no es posible establecer una comparativa objetiva.

## Limitaciones y advertencias

- Licencia restrictiva: uso comercial prohibido explícitamente; solo se permite investigación académica y educación. Cualquier despliegue en producción con fines comerciales queda fuera de los términos.
- Sesgos y datos de entrenamiento: no se especifica el dataset utilizado, por lo que se desconocen posibles sesgos en los tipos de imágenes o keypoints soportados.
- Riesgo de alucinación: como modelo de visión, puede producir keypoints con baja confianza en imágenes fuera de distribución; la puntuación de confianza debe usarse para filtrar resultados poco fiables.
- Limitaciones de idioma: los prompts textuales dependen de la tokenización CLIP BPE, que está entrenada principalmente en inglés; otros idiomas pueden no funcionar correctamente.
- Requisitos de preprocesamiento: la imagen debe redimensionarse y rellenarse exactamente como se describe en la model card; desviaciones pueden degradar la precisión.
- Sin garantías de soporte: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que el modelo es reciente y no ha sido ampliamente probado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Asher-1/GKD_GGUF
- No se han encontrado otros enlaces relevantes (papers, blogs o repositorios adicionales) en la información proporcionada.
