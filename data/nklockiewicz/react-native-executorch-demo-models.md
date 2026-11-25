# nklockiewicz/react-native-executorch-demo-models

## Resumen

Este repositorio no es un modelo único, sino una colección de exportaciones a ExecuTorch de varios modelos de visión destinados a aplicaciones demo de `react-native-executorch` (Software Mansion). Lo publica el usuario `nklockiewicz` y agrupa tres familias: Moebius (inpainting para eliminación de objetos), Depth Anything 3 (estimación de profundidad y poses multi-vista) y SAM 3 (segmentación de instancias guiada por texto). El objetivo es permitir ejecución on-device en iOS y Android sin depender de servidores.

Los tres modelos base son de terceros: Moebius (HUST y VIVO AI Lab, 0,22B parámetros, latente-difusión para inpainting), Depth Anything 3 (ByteDance Seed, modelos any-view para reconstrucción 3D sin SfM) y SAM 3 (Meta, 848M parámetros, segmentación de instancias con prompt textual). La relevancia actual radica en que demuestra que tareas de visión complejas pueden correr en un teléfono mediante Core ML (ANE/GPU) y XNNPACK (CPU), con latencias del orden de cientos de milisegundos a pocos segundos.

El repo ocupa 8,4 GB y contiene únicamente artefactos `.pte` (ExecuTorch) más un tokenizador JSON. No incluye pesos en safetensors ni GGUF, ni pipeline declarado en Hugging Face. La licencia es Apache 2.0, heredada de los modelos base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Moebius: difusión latente (VAE + UNet). DA3: transformer multi-vista con cabeza de profundidad, confianza y pose. SAM 3: ViT de 32 capas + encoder de texto CLIP + cabeza de detección/segmentación |
| Parámetros totales | Moebius: 0,22B. SAM 3: 848M. DA3-BASE y DA3-SMALL: no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelos de visión); SAM 3 usa 32 tokens de texto CLIP |
| Tipos de cuantización | fp16 (Core ML) y fp32 (XNNPACK); no se documentan int8/int4 |
| Idiomas soportados | no disponible (el texto de SAM 3 se procesa con tokenizador CLIP) |
| Licencia | Apache 2.0 |
| Formato de pesos | ExecuTorch `.pte` (Core ML y XNNPACK); tokenizador en JSON |

## Arquitectura y entrenamiento

Moebius es un marco de inpainting por difusión latente de 0,22B parámetros con resolución fija de 512x512 (latente 64x64). Se exporta en tres grafos: encoder VAE (imagen `(1,3,512,512)` en [-1,1] a latentes `(1,4,64,64)` escalados por 0,13025), UNet (latentes ruidosos, máscara 64x64, latentes enmascarados, timestep y guidance a ruido predicho) y decoder VAE (latentes a imagen en [0,1]). El classifier-free guidance va incorporado en el grafo como batch interno de 2, de modo que cada paso de denoising requiere una sola llamada. El bucle DDIM se ejecuta en JavaScript. El VAE proviene de PixelHacker, de los mismos autores.

Depth Anything 3 se exporta como modelos any-view estáticos a 8 vistas de 560x420. En una sola pasada forward produce profundidad, confianza y una codificación de pose de 9 floats (traslación, cuaternión xyzw y FOV vertical/horizontal) relativa a la vista 0, sin Structure-from-Motion ni optimización por escena. SAM 3 se divide en cuatro trozos del ViT de 32 capas (8 capas cada uno, porque el compilador del ANE rechaza el ViT completo), un encoder de texto CLIP y una cabeza que devuelve máscaras, cajas, logits y presencia. La resolución se fija a 672x672 en lugar de los 1008 nativos para mantener el ViT en el Neural Engine. No se documentan en la información disponible los volúmenes de entrenamiento, la composición de datasets ni si hubo RLHF/DPO.

## Capacidades

- Inpainting y eliminación de objetos en imágenes de 512x512 mediante Moebius, con máscara binaria y muestreo DDIM.
- Estimación de profundidad por vista a partir de 8 imágenes simultáneas (DA3), con mapa de confianza asociado.
- Estimación de poses de cámara relativas a la vista 0 en una sola pasada, sin SfM.
- Segmentación de instancias guiada por texto ("segment every X") con SAM 3, devolviendo máscaras, cajas y puntuaciones.
- Ejecución on-device: Core ML con aceleración ANE/GPU en iOS y XNNPACK en CPU para Android.
- Procesamiento de imágenes RGB normalizadas con ImageNet en DA3 y rango [-1,1] en Moebius y SAM 3.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni generación de texto.

## Casos de uso

- Eliminación de objetos en apps móviles de retoque fotográfico: Moebius permite borrar un objeto marcado con una máscara y reconstruir el fondo en el propio dispositivo, sin subir la imagen a un servidor, con grafos de 69 a 905 MB según backend.
- Escaneo 3D doméstico: la demo `on-device-3d-scanner` captura 8 fotos y obtiene profundidad, confianza y poses en un forward, suficiente para reconstruir una escena sin infraestructura de SfM.
- Segmentación interactiva por texto en apps de edición: SAM 3 con un prompt de una palabra segmenta todas las instancias de esa clase en la foto, con latencias de 330 a 500 ms por bloque ViT en iPhone 16 Pro.
- Herramientas de accesibilidad: descripción y aislamiento de objetos en imágenes para usuarios con discapacidad visual, ejecutando SAM 3 localmente y sin conexión.
- Preprocesado en pipelines de realidad aumentada: las poses y la profundidad de DA3 alimentan la colocación de objetos virtuales en tiempo casi real.
- Aplicaciones de privacidad-first: al no requerir red, los tres modelos permiten procesar fotos personales (documentos, caras, matrículas) sin salir del dispositivo.
- Prototipado multiplataforma con React Native: los `.pte` se integran vía `react-native-executorch`, lo que permite reutilizar la misma lógica JS en iOS y Android.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, etc.) en la información disponible. Sí se documentan latencias on-device en iPhone 16 Pro:

| Modelo / grafo | Backend | Precisión | Tamaño | Latencia |
|---|---|---|---|---|
| Moebius VAE encoder | Core ML | fp16 | 69 MB | no disponible |
| Moebius UNet | Core ML | fp16 | 447 MB | no disponible |
| Moebius VAE decoder | Core ML | fp16 | 100 MB | no disponible |
| Moebius VAE encoder | XNNPACK | fp32 | 137 MB | no disponible |
| Moebius UNet | XNNPACK | fp32 | 905 MB | no disponible |
| Moebius VAE decoder | XNNPACK | fp32 | 198 MB | no disponible |
| DA3-BASE 8v 560x420 | Core ML (CPU+GPU) | fp16 | 480 MB | ~3,1 s |
| DA3-SMALL 8v 560x420 | Core ML (ANE) | fp32 | 382 MB | ~2,0 s |
| DA3-BASE 8v 560x420 | XNNPACK | fp32 | 413 MB | no disponible |
| DA3-SMALL 8v 560x420 | XNNPACK | fp32 | 105 MB | no disponible |
| SAM 3 vision0 | Core ML | fp16 | 230 MB | ~370 ms |
| SAM 3 vision1 | Core ML | fp16 | 224 MB | ~330 ms |
| SAM 3 vision2 | Core ML | fp16 | 224 MB | ~330-500 ms |
| SAM 3 vision3 | Core ML | fp16 | 238 MB | ~330 ms |
| SAM 3 head | Core ML | fp16 | 105 MB | ~170-300 ms |
| SAM 3 text | Core ML | fp16 | 707 MB | ~11-20 ms |

## Requisitos de hardware

- Espacio en disco: 8,4 GB para el repositorio completo; cada subconjunto puede descargarse por separado.
- iOS: Core ML con Neural Engine. SAM 3 requiere ANE para el ViT troceado; DA3-BASE debe fijarse a CPU_AND_GPU porque el compilador del ANE provoca un crash del proceso anfitrión.
- Android y CPU: builds XNNPACK en fp32, con mayor huella (Moebius UNet 905 MB, DA3-BASE 413 MB, DA3-SMALL 105 MB).
- No cabe en GPUs de consumo convencionales como unidad de despliegue: el formato `.pte` está pensado para móvil, no para vLLM, TGI, llama.cpp u Ollama.
- Despliegue: `react-native-executorch` (Software Mansion) y los scripts de exportación de cada demo (`on-device-eraser`, `on-device-3d-scanner`, `on-device-sam3`).
- Memoria RAM: no disponible de forma explícita; a modo orientativo, los grafos Core ML de mayor tamaño son el UNet de Moebius (447 MB) y el encoder de texto de SAM 3 (707 MB).
- Throughput y latencia en Android: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Moebius (este repo) | 0,22B | 512x512 fija | Apache 2.0 | ExecuTorch | Inpainting on-device |
| Stable Diffusion Inpainting | ~0,9B (UNet) | 512x512 | CreativeML OpenRAIL-M | safetensors, ONNX | Inpainting general, no móvil-first |
| LaMa | ~51M | variable | Apache 2.0 | PyTorch | Inpainting clásico, sin difusión |
| SAM 3 (este repo) | 848M | 672x672 (nativo 1008) | Apache 2.0 | ExecuTorch | Segmentación por texto on-device |
| SAM 2 | ~80M-600M | 1024x1024 | Apache 2.0 | PyTorch | Segmentación vídeo/imagen, sin prompt textual |
| Depth Anything 3 (este repo) | no disponible | 560x420 x 8 vistas | Apache 2.0 | ExecuTorch | Profundidad + pose multi-vista |
| Depth Anything V2 | ~25M-1,3B | variable | Apache 2.0 (Small/Base) | PyTorch, ONNX | Profundidad monocular |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- Resoluciones estáticas: Moebius exige 512x512 y SAM 3 exige 672x672; DA3 exige 8 vistas de 560x420 en orientación vertical. No hay soporte de entrada variable.
- Reducción de calidad en SAM 3: a 672x672 encuentra las mismas instancias que a 1008 en 6 de 7 prompts de prueba, según el autor, por lo que puede fallar en casos límite.
- Inestabilidad del compilador ANE con DA3-BASE: obliga a usar GPU y limita el rendimiento en dispositivos Apple.
- Moebius depende de un bucle DDIM implementado en JavaScript; la latencia total no está documentada y puede acumular varios cientos de milisegundos por paso.
- Riesgo de artefactos y alucinación visual en inpainting y segmentación cuando la máscara o el prompt son ambiguos.
- Sesgos: no documentados en la información disponible; heredables de los datasets de entrenamiento de los modelos base.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los modelos base (Moebius, DA3, SAM 3) y de PixelHacker para el VAE.
- No hay garantías de soporte a largo plazo: el repo es una colección de artefactos demo, no un producto versionado.
- Idiomas: el prompt textual de SAM 3 se procesa con tokenizador CLIP; no se documenta cobertura multilingüe.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nklockiewicz/react-native-executorch-demo-models
- react-native-executorch: https://github.com/software-mansion/react-native-executorch
- Moebius (código): https://github.com/hustvl/Moebius
- PixelHacker (VAE): https://huggingface.co/hustvl/PixelHacker
- Demo on-device-eraser: https://github.com/NorbertKlockiewicz/on-device-eraser
- Depth Anything 3: https://github.com/bytedance-seed/depth-anything-3
- Demo on-device-3d-scanner: https://github.com/NorbertKlockiewicz/on-device-3d-scanner
- SAM 3: https://huggingface.co/facebook/sam3
- Demo on-device-sam3: https://github.com/NorbertKlockiewicz/on-device-sam3
- Paper DA3: arXiv:2511.10647
- Paper adicional citado en tags: arXiv:2511.16719
