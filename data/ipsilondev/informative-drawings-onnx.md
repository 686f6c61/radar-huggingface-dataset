# ipsilondev/informative-drawings-onnx

## Resumen

`informative-drawings-onnx` es una exportación a formato ONNX de los tres generadores del proyecto Informative Drawings (Chan, Durand e Isola, CVPR 2022), un sistema de image-to-image que convierte fotografías en dibujos de línea. El modelo original lo desarrollaron investigadores del MIT CSAIL; esta conversión la mantiene el usuario `ipsilondev` para integrarla en la aplicación móvil OutlineKid (`com.ipsilondev.outlinekid`), que genera páginas para colorear a partir de fotos.

El repositorio no contiene pesos entrenados desde cero, sino tres exportaciones del mismo generador `Generator(input_nc=3, output_nc=1, n_blocks=3)` bajo tres estilos distintos: `contour_style`, `anime_style` y `opensketch_style`. Cada archivo ocupa 8,6 MB en precisión fp16 (17,2 MB en la versión fp32 de respaldo), lo que lo hace apto para inferencia en CPU de dispositivos móviles y portátiles.

Su relevancia actual es práctica: no es un modelo de propósito general ni compite en benchmarks de razonamiento, sino una pieza de infraestructura ligera y verificada (IoU ≥ 0,9996 frente a la implementación PyTorch original) para pipelines de generación de line-art en producción, con licencia MIT y entrada/salida de resolución dinámica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN image-to-image (generador `Generator(input_nc=3, output_nc=1, n_blocks=3)`, estilo CycleGAN/pix2pix del proyecto Informative Drawings) |
| Parametros totales | no disponible (el tamaño de los pesos fp16 es de 8.602.686 bytes por estilo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp16 (por defecto) y fp32 (respaldo `contour_fp32.onnx`); no se documentan otras cuantizaciones (int8, etc.) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17, H y W dinámicos), exportado con `torch.onnx.export`, optimizado con `onnxslim` y convertido a fp16 con `onnxconverter_common.float16` (`keep_io_types=True`) |

## Arquitectura y entrenamiento

El modelo es un generador GAN condicionado por imagen, tomado tal cual del repositorio upstream `carolineec/informative-drawings` (commit `2349aee4daf7cb01d8de645b0bbb4f4392fd1395`). La arquitectura es la del paper de Chan et al. (CVPR 2022), "Learning to generate line drawings that convey geometry and semantics": un generador con normalización de instancia que produce un mapa de líneas de un solo canal a partir de una imagen RGB. Esta exportación no reentrena ni modifica los pesos; solo convierte los checkpoints `netG_A_latest.pth` de los tres estilos (`contour_style`, `anime_style`, `opensketch_style`) a ONNX.

El proceso de exportación usa opset 17 con altura y anchura dinámicas, seguido de `onnxslim` y conversión a fp16 manteniendo entradas y salidas en float32. La verificación se hizo con ONNX Runtime 1.24.1 en CPU x86-64 con 4 hilos sobre 10 fotografías de referencia, comparando el IoU de los mapas de línea binarizados (umbral < 0,5) contra la implementación en PyTorch. El detalle técnico relevante es que las estadísticas de InstanceNorm dependen del tamaño de la imagen, por lo que la aplicación alimenta la imagen completa y no mosaicos, y usa múltiplos de 8 (lado largo 512 en previsualización, 1024 en salida final).

## Capacidades

- Conversión de fotografía a dibujo de línea (line-art) en tres estilos: contorno (`contour`), anime (`anime`) y boceto abierto (`opensketch`).
- Entrada RGB float32 `[1,3,H,W]` con valores 0..1, sin normalización mean/std; altura y anchura dinámicas.
- Salida de un canal `[1,1,H,W]` con valores 0..1 tras sigmoide, con líneas oscuras sobre fondo blanco (1 = papel).
- Generación de material base para páginas para colorear (`coloring-pages`), uso declarado por la app OutlineKid.
- Inferencia en CPU (ONNX Runtime CPU provider) sin necesidad de GPU.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, visión semántica ni capacidades multilingües: es exclusivamente un modelo de imagen a imagen.

## Casos de uso

- Generación de páginas para colorear en aplicaciones móviles: la app OutlineKid usa los tres estilos para transformar fotos del usuario en dibujos de línea; el tamaño de 8,6 MB por estilo y la ejecución en CPU permiten empaquetarlo en el binario sin depender de servidores.
- Previsualización interactiva en el dispositivo: con entrada a 512 px de lado largo y latencias de 531-623 ms en CPU x86-64, el modelo es viable para un flujo de previsualización antes de generar la versión final a 1024 px.
- Herramientas de ilustración y cómic: el estilo `anime` produce líneas adecuadas para entintado de personajes, y `opensketch` para bocetos sueltos; se puede integrar en un editor que aplique el filtro como capa.
- Automatización de material educativo: generación por lotes de fichas de colorear a partir de un banco de fotografías, usando `contour` por su fidelidad de contorno (IoU 0,9998 frente a PyTorch).
- Pipelines de impresión y editorial: conversión de fotografías a line-art vectorizable para libros de actividades o cuadernos, con la versión fp32 como respaldo si la fp16 diera problemas en una plataforma concreta.
- Integración en servicios web ligeros: al ser ONNX con dimensiones dinámicas, se puede servir con ONNX Runtime en un contenedor pequeño sin GPU, útil para APIs de bajo coste que devuelvan un PNG de líneas.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son de verificación de la exportación (IoU frente a PyTorch y tiempos en CPU x86-64, ONNX Runtime 1.24.1, 4 hilos):

| Estilo | IoU 512 (mín. de 10) | IoU 1024 (mín. de 2) | Diferencia abs. máx. 512 | fp16 ms 512 / 1024 | fp32 ms 512 / 1024 |
|---|---|---|---|---|---|
| contour | 0,9998 | 0,9999 | 0,0059 | 605 / 2031 | 652 / 2485 |
| anime | 0,9997 | 0,9995 | 0,0008 | 623 / 2371 | 599 / 2075 |
| opensketch | 0,9996 | 0,9998 | 0,0016 | 531 / 2325 | 531 / 2393 |

La exportación fp32 obtiene IoU 1,0000 y una diferencia absoluta máxima ≤ 4,6e-4 en todos los estilos. No se han publicado resultados de benchmarks académicos (FID, LPIPS u otros) en la información disponible para esta exportación.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo corre en CPU. En GPU, los pesos fp16 de 8,6 MB caben en cualquier tarjeta con más de 1 GB de memoria, pero no se documentan requisitos de VRAM específicos.
- GPU recomendadas: no aplica; el autor solo reporta mediciones en CPU x86-64. Cualquier GPU compatible con ONNX Runtime (CUDA/TensorRT) podría ejecutarlo, pero no hay cifras publicadas.
- Consumer GPU: sí, cualquier GPU de consumo puede alojarlo por tamaño, aunque no hay datos de latencia en GPU.
- Despliegue: ONNX Runtime (CPU provider verificado); al ser ONNX estándar, es compatible con otros runtimes ONNX, pero no se ha verificado en ellos.
- Latencia y throughput: 531-623 ms por imagen a 512 px y 2031-2371 ms a 1024 px en CPU x86-64 con 4 hilos. No medido en un teléfono arm64; por eso se incluye `contour_fp32.onnx` como respaldo del estilo por defecto.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros / tamaño | Contexto o resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| informative-drawings-onnx (este) | GAN image-to-image, ONNX | 8,6 MB fp16 por estilo | H y W dinámicos (512/1024 en la app) | MIT | Hugging Face, ONNX |
| Informative Drawings original (carolineec) | GAN image-to-image, PyTorch | mismo generador, checkpoints `.pth` | H y W dinámicos | MIT | GitHub + pesos en Google Drive |
| Alternativas de line-art (p. ej. Anime2Sketch, White-box Cartoonization) | GAN / redes de estilo | no disponible en esta información | no disponible | variables | no verificado |

La comparación con otros modelos de line-art no está disponible en la información proporcionada; la alternativa directa y equivalente es el repositorio PyTorch original, del que esta exportación es una conversión fiel (IoU ≥ 0,9996).

## Limitaciones y advertencias

- No es un modelo de texto ni multimodal: no admite prompts, tool calling ni razonamiento; solo transforma imágenes.
- El resultado depende del tamaño de entrada: las estadísticas de InstanceNorm varían con la resolución, por lo que no se debe trocear la imagen en mosaicos ni cambiar de tamaño de forma arbitraria sin reevaluar la calidad.
- La fp16 solo se ha verificado en CPU x86-64; en arm64 (móviles) no está medida, de ahí el archivo fp32 de respaldo. En producción móvil conviene probar ambos.
- Riesgo de artefactos en fotografías con texturas complejas, bajo contraste o fondos ruidosos; no hay evaluación publicada de calidad subjetiva (FID/LPIPS) para esta exportación.
- Sesgos: no documentados en la información disponible; al derivar de un dataset de entrenamiento no especificado en esta ficha, puede heredar sesgos de contenido del corpus original.
- Licencia MIT permite uso comercial y modificación, pero exige conservar el aviso de copyright; se debe atribuir a Chan, Durand e Isola (CVPR 2022).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de esta conversión concreta.

## Enlaces

- Hugging Face: https://huggingface.co/ipsilondev/informative-drawings-onnx
- Repositorio upstream: https://github.com/carolineec/informative-drawings (commit `2349aee4daf7cb01d8de645b0bbb4f4392fd1395`)
- Pesos originales: `model.zip` enlazado desde el README upstream (Google Drive id `1MIdHzecxz-z0uY3ARL_R40DlKcuQxiDk`, SHA-256 `00e845f815f8e75a4358db50ef24eb3ec27a3bfc54deda49a9fb5dd46cd3d1b2`)
- Paper: Chan, Durand, Isola, "Learning to generate line drawings that convey geometry and semantics", CVPR 2022 (enlace no incluido en la información disponible)
- Aplicación que lo usa: OutlineKid (`com.ipsilondev.outlinekid`), sin URL pública en la información disponible
