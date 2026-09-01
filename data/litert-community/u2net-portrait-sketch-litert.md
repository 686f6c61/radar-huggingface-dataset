# litert-community/U2Net-Portrait-Sketch-LiteRT

## Resumen

U2Net-Portrait-Sketch-LiteRT es un modelo de conversion de imagen a imagen que transforma fotografias de rostros en bocetos de lapiz estilo dibujo a mano. Esta desarrollado por la comunidad litert-community y se basa en la arquitectura U²-Net, un modelo CNN puro con bloques residuales anidados (RSU), originalmente publicado por xuebinqin. El modelo se ha convertido al formato LiteRT (TFLite) para ejecucion en dispositivos moviles y edge, con soporte completo para aceleracion por GPU y NPU.

La relevancia de este modelo radica en su capacidad para ejecutar una tarea creativa de procesamiento de imagen en tiempo real en hardware de consumo, sin necesidad de conexion a servidores. Con un tamano de 176 MB y una latencia de aproximadamente 12 ms por fotograma en un Pixel 8a, es adecuado para aplicaciones de filtros AR, edicion fotografica y herramientas de dibujo. El modelo se distribuye bajo licencia Apache-2.0, lo que permite su uso comercial y modificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U²-Net (RSU / bloques residuales U anidados), CNN pura |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, entrada 512x512) |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite / LiteRT (safetensors no aplica) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura U²-Net, una red neuronal convolucional pura compuesta por bloques residuales U (RSU) que capturan caracteristicas multiescala mediante operaciones de pooling y upsampling. La version de retrato (u2net_portrait) fue entrenada especificamente para convertir fotografias de rostros en bocetos de lapiz, con pesos publicados bajo licencia Apache-2.0 por xuebinqin. El proceso de conversion a LiteRT se realizo con la herramienta litert-torch, que carga los pesos originales y exporta el grafo a formato TFLite. Durante la conversion se aplico un parche defensivo: se cambio `align_corners=True` a `False` en los upsamplings bilineales para garantizar compatibilidad total con la GPU, manteniendo una correlacion de 1.0 con la salida de PyTorch en CPU.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens (no aplica) ni el proceso de optimizacion (RLHF/DPO no aplica a modelos de vision). El modelo es una CNN clasica sin mecanismos de atencion ni componentes recurrentes.

## Capacidades

- Generacion de bocetos de lapiz a partir de fotografias de retratos, con trazos oscuros sobre fondo blanco.
- Procesamiento de imagenes de entrada de 512x512 píxeles en formato RGB, con normalizacion ImageNet.
- Ejecucion completamente en GPU mediante el delegado LiteRT `CompiledModel`, sin fallback a CPU.
- Soporte para aceleracion por NPU en dispositivos Snapdragon (Hexagon), con mejor rendimiento que GPU en ciertos SoC.
- Salida de un mapa de boceto en escala de grises de 512x512, que puede post-procesarse con normalizacion min-max e inversion.
- Compatible con el ecosistema LiteRT (TFLite) para Android, Python y Raspberry Pi.

## Casos de uso

- Filtros de realidad aumentada en aplicaciones de camara: el modelo puede integrarse en apps de Android para convertir en tiempo real el rostro del usuario en un dibujo a lapiz, aprovechando la latencia de ~12 ms en GPU.
- Herramientas de edicion fotografica: permite a los usuarios convertir retratos en bocetos artisticos dentro de aplicaciones de retoque, con post-procesamiento para ajustar el contraste y el grosor del trazo.
- Aplicaciones educativas de dibujo: sirve como referencia para estudiantes de arte, generando bocetos base a partir de fotos que luego pueden calcar o modificar.
- Generacion de avatares creativos: en redes sociales o juegos, los usuarios pueden crear avatares de perfil con estilo de dibujo a lapiz a partir de selfies.
- Automatizacion de ilustracion para contenido editorial: los disenadores pueden usar el modelo para generar bocetos preliminares de retratos en flujos de trabajo de produccion, reduciendo el tiempo de bocetado manual.
- Demostraciones de IA en el borde: el modelo es un ejemplo practico para desarrolladores que quieren evaluar el rendimiento de LiteRT en dispositivos moviles, con benchmarks reproducibles en Pixel, Galaxy y Raspberry Pi.

## Benchmarks y rendimiento

La model card proporciona mediciones de latencia en tres plataformas. No se han publicado benchmarks de calidad (como PSNR o SSIM) en la informacion disponible.

| Plataforma | Backend | Latencia | Notas |
|---|---|---|---|
| Pixel 8a (Tensor G3) | LiteRT `CompiledModel` GPU | ~12 ms | 893/893 nodos en GPU, correlacion 0.998683 |
| Pixel 8a (Tensor G3) | TFLite `benchmark_model` GPU (OpenCL) | 216.6 ms | 255/255 nodos en GPU, reproducible |
| Pixel 8a (Tensor G3) | TFLite CPU (XNNPACK, 4 hilos) | 4196.3 ms | Sin aceleracion |
| Samsung Galaxy S26 (Snapdragon 8 Elite Gen 5) | NPU (Hexagon v81) | 24.00 ms (mediana) | Carga 189 ms, 2.80x mas rapido que GPU |
| Samsung Galaxy S26 (Snapdragon 8 Elite Gen 5) | GPU (Adreno) | 67.19 ms (mediana) | Carga 1381 ms |
| Raspberry Pi 5 (8 GB) | CPU (XNNPACK, 4 hilos) | 2871.9 ms (mediana) | Pico de memoria 968 MB, 150 ejecuciones |

## Requisitos de hardware

- VRAM estimada: no disponible, pero el modelo pesa 176 MB en disco; en tiempo de ejecucion, el pico de memoria en Raspberry Pi 5 fue de 968 MB, lo que sugiere un uso moderado de RAM.
- GPU recomendadas: Adreno (en SoC Snapdragon), Tensor G3 (Pixel), Mali (en dispositivos ARM). Cualquier GPU compatible con OpenCL o Vulkan puede ejecutar el delegado LiteRT.
- Cabe en GPU de consumo: si, en cualquier smartphone moderno con GPU Adreno o Mali; tambien en Raspberry Pi 5 (aunque solo CPU, con latencia alta).
- Opciones de despliegue: LiteRT `CompiledModel` con acelerador GPU o NPU, TFLite `Interpreter` clasico, y herramientas de benchmark como `benchmark_model`.
- Latencia y throughput: ~12 ms por imagen en Pixel 8a con GPU LiteRT; 24 ms en NPU de Galaxy S26; 2.87 s en Raspberry Pi 5 CPU. El throughput estimado es de ~83 imagenes/segundo en Pixel 8a y ~42 en Galaxy S26 NPU.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. No hay datos de otros modelos de conversion de retrato a boceto con los que comparar parametros, rendimiento o licencia.

## Limitaciones y advertencias

- El modelo esta entrenado especificamente para retratos; su rendimiento con otros tipos de imagenes (paisajes, objetos) no esta garantizado y puede producir resultados suboptimos.
- La entrada debe ser una imagen de 512x512 píxeles; redimensionar a otras resoluciones puede degradar la calidad del boceto.
- El modelo asume una cara centrada; rostros descentrados o multiples personas pueden generar bocetos incompletos o distorsionados.
- No se han documentado sesgos especificos, pero al ser un modelo de vision entrenado con datos de retratos, podria tener un rendimiento desigual entre grupos demograficos (no verificado).
- La conversion a LiteRT incluye un cambio en `align_corners` que puede afectar ligeramente la precision en los bordes, aunque la correlacion con PyTorch es 1.0 en CPU.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir la fuente original (U²-Net de xuebinqin) y mantener el aviso de licencia.
- En dispositivos sin GPU compatible, el modelo se ejecuta en CPU con latencias muy altas (varios segundos), lo que lo hace inutilizable en tiempo real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/U2Net-Portrait-Sketch-LiteRT
- Repositorio de modelos LiteRT (portrait): https://github.com/john-rocky/LiteRT-Models/tree/main/portrait
- Script de conversion: https://github.com/john-rocky/LiteRT-Models/blob/main/portrait/scripts/build_portrait.py
- Repositorio original U²-Net: https://github.com/xuebinqin/U-2-Net
- Documentacion de portrait generation en DeepWiki: https://deepwiki.com/xuebinqin/U-2-Net/6.1-portrait-generation
- Modelo U-2-Net en Hugging Face: https://huggingface.co/litert-community/U-2-Net
