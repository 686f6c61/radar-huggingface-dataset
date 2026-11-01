# othytenk/realesrgan-x4plus

## Resumen

Real-ESRGAN x4plus ONNX es una exportación a formato ONNX del modelo `RealESRGAN_x4plus` original de Xinntao Wang et al., publicada por el usuario othytenk. Se trata de una red RRDBNet de 23 bloques que realiza superresolución de imágenes con un factor de escala de 4x en cada dimensión, pensada específicamente para ejecutarse en el navegador mediante onnxruntime-web con aceleración WebGPU. No es un modelo de lenguaje ni un transformador generativo: es una red convolucional de restauración de imagen.

La relevancia de esta ficha radica en que la exportación resuelve dos problemas prácticos del despliegue web: por un lado, admite altura y anchura dinámicas, lo que permite procesar fotografías por teselas de cualquier tamaño; por otro lado, ofrece una copia en fp16 que reduce el peso de descarga a la mitad (34 MB frente a 67 MB) manteniendo la precisión dentro de un nivel de 8 bits respecto a fp32 en fotografías reales.

El repositorio es pequeño (0,1 GB) y no registra descargas ni likes en el momento de la consulta. Al derivar directamente de los pesos oficiales `RealESRGAN_x4plus.pth` (params_ema), hereda la licencia BSD 3-Clause del proyecto original. No dispone de información sobre idiomas porque no procesa texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RRDBNet (Real-ESRGAN), 23 bloques residuales densos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | fp32 y fp16 (conversión con onnxconverter_common, keep_io_types=True) |
| Idiomas soportados | no aplica (modelo de imagen, sin procesamiento de texto) |
| Licencia | BSD 3-Clause |
| Formato de pesos | ONNX (opset 17), entrada y salida float32 |

## Arquitectura y entrenamiento

El modelo es una red neuronal convolucional RRDBNet con 23 bloques residuales densos, la misma topología que el `RealESRGAN_x4plus` original. La exportación se realizó reconstruyendo RRDBNet en PyTorch puro a partir de los pesos oficiales `RealESRGAN_x4plus.pth` (SHA-256 `4fa0d38905f75ac06eb49a7951b426670021be3018265fd191d2125df9d682f1`, variante `params_ema`), exportando con opset 17 y dimensiones dinámicas, y generando una copia fp16 mediante `onnxconverter_common.float16` con `keep_io_types=True`. No se modificó ningún otro aspecto del modelo original.

El entrenamiento subyacente corresponde al descrito en el paper de Real-ESRGAN (Wang, Xie, Dong y Shan, ICCV Workshops 2021): superresolución ciega de imágenes del mundo real entrenada con datos sintéticos puros. El autor de esta exportación no aporta información adicional sobre el dataset, el número de tokens (no aplica) ni sobre etapas de RLHF o DPO (no aplica a un modelo de imagen). La validación numérica frente a PyTorch sobre entradas aleatorias reporta una diferencia máxima absoluta de 2,21e-06 y PSNR de 128,4 dB para fp32 en 64x64, y de 1,09e-03 con PSNR de 73,2 dB para fp16 en el mismo tamaño.

## Capacidades

- Superresolución de imágenes fotográficas con factor de escala 4x en altura y anchura.
- Entrada RGB en float32 con forma `[batch, 3, height, width]` normalizada dividiendo por 255.
- Salida RGB en float32 con forma `[batch, 3, 4·height, 4·width]` en el rango aproximado `[0, 1]`.
- Dimensiones de entrada dinámicas: permite teselado de cualquier tamaño de tesela.
- Ejecución en navegador mediante onnxruntime-web con WebGPU o WebAssembly.
- Ejecución en Python mediante onnxruntime.
- Variante fp16 compatible con la característica `shader-f16` de WebGPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, por no ser un modelo de lenguaje.

## Casos de uso

- Mejora de fotografías en aplicaciones web: el modelo puede integrarse en un editor de imágenes en el navegador y ampliar recortes 4x sin enviar los datos a un servidor, gracias a la ejecución con onnxruntime-web y WebGPU.
- Restauración de imágenes antiguas o de baja resolución: la naturaleza de superresolución ciega de Real-ESRGAN permite recuperar detalle en fotografías degradadas por compresión o ruido, procesándolas por teselas con margen de 10 px.
- Previsualización de imágenes en catálogos de comercio electrónico: ampliación de miniaturas a resolución de venta antes de la descarga final, usando la copia fp16 de 34 MB para reducir el tiempo de carga inicial en el cliente.
- Procesamiento por lotes en Python: scripts de onnxruntime que amplían carpetas de imágenes en servidor sin depender de PyTorch, con la variante fp32 de 67 MB para máxima fidelidad numérica.
- Aplicaciones de escritorio multiplataforma con WebGPU: integración en clientes Electron o Tauri que aprovechen la GPU del usuario para ampliar capturas de pantalla o imágenes locales.
- Ampliación de material gráfico para impresión de baja exigencia: escalado 4x de ilustraciones o fotos para maquetación, teniendo en cuenta las limitaciones de memoria por activación (un tile de 128 px requiere unos 90 MB por activación en las últimas capas).
- Prototipado de pipelines de restauración de imagen: uso como bloque de superresolución dentro de cadenas más amplias de preprocesado, dado el formato ONNX estándar y la compatibilidad con onnxruntime.

## Benchmarks y rendimiento

El autor no publica benchmarks de calidad de imagen (PSNR/SSIM sobre datasets estándar) en la información disponible. Sí se incluyen métricas de fidelidad de la exportación frente a PyTorch y medidas de velocidad:

| Archivo | Entrada | Max abs | Mean abs | PSNR |
|---|---|---|---|---|
| fp32 | 64x64 | 2,21e-06 | 2,99e-07 | 128,4 dB |
| fp32 | 80x96 | 2,26e-06 | 3,04e-07 | 128,2 dB |
| fp16 | 64x64 | 1,09e-03 | 1,84e-04 | 73,2 dB |
| fp16 | 80x96 | 1,04e-03 | 1,84e-04 | 73,2 dB |

Velocidad medida en Apple M1 Pro, Chrome 156, onnxruntime-web 1.30.0, por megapíxel de entrada tras la primera ejecución:

| Backend | fp32 | fp16 |
|---|---|---|
| WebGPU, teselas de 128 px | ~39 s | ~30 s |
| WebAssembly, 8 hilos | ~245 s | ~245 s |

En WebGPU el tamaño de tesela apenas influye (entre 64 y 256 px se obtuvieron 28-49 s por megapíxel). La primera ejecución con cada nueva forma de entrada tarda aproximadamente una ejecución adicional mientras se compilan los shaders.

## Requisitos de hardware

- VRAM estimada: no se publica una cifra global; el autor advierte que las últimas capas operan a 4x el tamaño de tesela con 64 canales, de modo que una tesela de 128 px ya necesita unos 90 MB por activación.
- GPU recomendadas: no se especifican modelos concretos; se valida en Apple M1 Pro con WebGPU. Cualquier GPU con soporte WebGPU es candidata; para `shader-f16` se requiere esa característica.
- Compatibilidad con GPU de consumo: sí, en principio cualquier GPU integrada o dedicada con WebGPU, dado el reducido tamaño del modelo (34-67 MB).
- Opciones de despliegue: onnxruntime-web (WebGPU o WebAssembly con 8 hilos) y onnxruntime en Python. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: ~30 s/Mpx en fp16 y ~39 s/Mpx en fp32 sobre WebGPU en M1 Pro; ~245 s/Mpx en WebAssembly con 8 hilos. El teselado con margen de 10 px es la estrategia recomendada para fotografías grandes.

## Comparativa con modelos similares

| Modelo | Arquitectura | Escala | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| othytenk/realesrgan-x4plus (esta ficha) | RRDBNet 23 bloques | 4x | ONNX fp32/fp16 | BSD 3-Clause | Entrada dinámica, orientado a WebGPU |
| RealESRGAN_x4plus original (xinntao) | RRDBNet 23 bloques | 4x | PyTorch (.pth) | BSD 3-Clause | Pesos de referencia, requiere PyTorch |
| Otros exportadores ONNX de Real-ESRGAN | RRDBNet | 4x | ONNX | BSD 3-Clause | No disponibles en la información proporcionada |
| Alternativas de superresolución (SwinIR, ESRGAN) | Transformer / GAN | 2x-4x | varios | varias | No disponibles en la información proporcionada |

La comparación con alternativas de la misma categoría (SwinIR, ESRGAN clásico u otros exportadores ONNX) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo no procesa texto ni lenguaje: no tiene capacidades de razonamiento, código, matemáticas ni tool calling.
- Al ser una exportación derivada, cualquier sesgo o artefacto del `RealESRGAN_x4plus` original se hereda; el autor no documenta sesgos específicos.
- Riesgo de alucinación visual: como toda red de superresolución generativa, puede inventar texturas o detalles plausibles que no estaban en la imagen original.
- La salida puede exceder ligeramente el rango `[0, 1]`; es necesario aplicar clamp antes de convertir a bytes.
- El procesamiento de fotografías grandes requiere teselado con margen (10 px recomendados) y recorte posterior del margen para evitar costuras.
- El consumo de memoria por activación crece con el tamaño de tesela (unos 90 MB por activación con teselas de 128 px), lo que limita el tamaño máximo de tesela en dispositivos con poca memoria.
- La variante fp16 solo es eficiente en WebGPU con `shader-f16`; sin esa característica, los nodos fp16 caen a la CPU.
- La primera inferencia con cada nueva forma de entrada es más lenta por la compilación de shaders.
- Licencia BSD 3-Clause: permite uso comercial con atribución y sin endoso; es necesario conservar el aviso de copyright de Xintao Wang y el texto de la licencia.
- No hay métricas publicadas de calidad de imagen sobre datasets de referencia, por lo que la evaluación cualitativa queda a cargo del usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/othytenk/realesrgan-x4plus
- Repositorio oficial de Real-ESRGAN: https://github.com/xinntao/Real-ESRGAN
- Pesos oficiales `RealESRGAN_x4plus.pth`: https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth
- Paper Real-ESRGAN (ICCV Workshops 2021): https://arxiv.org/abs/2107.10833
- onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
- onnxconverter-common: https://github.com/microsoft/onnxconverter-common
