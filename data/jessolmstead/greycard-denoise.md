# jessolmstead/greycard-denoise

## Resumen

greycard denoise es una familia de tres modelos de eliminación de ruido (denoising) que operan directamente en el dominio RAW de sensores Bayer, desarrollados por el autor del proyecto greycard, un motor de revelado y edición de archivos RAW. A diferencia de los denoisers convencionales que trabajan sobre imágenes en sRGB ya procesadas, estos modelos reciben el mosaico Bayer empaquetado a media resolución en cuatro canales (R, G1, G2, B) tras normalización de niveles de negro y blanco, balance de blancos y aplicación de un estabilizador de varianza basado en los parámetros de ruido medidos de cada fotograma.

La arquitectura es una UNet única replicada a tres anchos distintos: 1,2 M de parámetros (tier fast, `denoise-v19.onnx`), 2,3 M (tier balanced, `denoise-v15.onnx`) y 5,3 M (tier best, `denoise-v20.onnx`). Cada variante se distribuye como un único archivo ONNX de opset 17 en fp32, con una copia fp16 pensada para Core ML en Apple Silicon. El tamaño total del repositorio es de aproximadamente 0,1 GB.

Su relevancia es acotada pero clara: no es un modelo de propósito general, sino un componente especializado dentro de un pipeline de revelado RAW concreto. Resulta interesante como ejemplo de denoising guiado por el modelo de ruido del sensor (fotónico más ruido de lectura) y de integración de inferencia ONNX en un flujo de fotografía computacional, más que como modelo reutilizable de forma autónoma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | UNet (tres anchos: 1,2 M, 2,3 M y 5,3 M de parámetros) |
| Parámetros totales | 1,2 M (fast), 2,3 M (balanced), 5,3 M (best) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); altura y anchura de entrada dinámicas |
| Tipos de cuantización | fp32 (principal) y fp16 (copia para Core ML); entrada y salida siempre float32 |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | GPL-3.0-or-later |
| Formato de pesos | ONNX (opset 17), fp32 y fp16 |

## Arquitectura y entrenamiento

El modelo es una UNet convolucional de tres niveles de ancho según el tier. La entrada `packed` tiene forma `1 × 4 × h × w` en float32: el mosaico Bayer empaquetado a media resolución como canales R, G1, G2 y B, tras normalización de niveles de negro y blanco, balance de blancos y paso por el estabilizador de varianza de greycard, definido como `2x / (sqrt(a·x + s0²) + s0)` con los parámetros de ruido medidos del fotograma. La salida `rgb` es `1 × 3 × 2h × 2w` en float32: RGB ya demosaicado a la resolución del mosaico, en el mismo espacio estabilizado, en RGB de cámara y con balance de blancos aplicado. Las dimensiones de altura y anchura son dinámicas, y greycard trocea y mezcla el resultado para fotogramas grandes.

El entrenamiento lo realizó el autor de greycard con fotogramas de su propio archivo, sintetizando ruido a partir del modelo de ruido por fotograma de greycard: componente fotónico más ruido de lectura, muestreado de forma log-uniforme en un rango amplio y con jitter de ganancia por canal. La función de pérdida es L1 en el espacio estabilizado, con pesos EMA. El código de entrenamiento, exportación y conversión a fp16 está disponible en el repositorio de greycard bajo `tools/denoise` (`train.py`, `model.py`, `export.py`, `fp16.py`). No se documenta el volumen de datos de entrenamiento ni la composición exacta del dataset.

La innovación técnica destacable no está en la arquitectura, sino en el contrato de entrada: el modelo no ve píxeles en sRGB, sino datos de mosaico en espacio de cámara ya estabilizados según el ruido real del sensor. Esto le permite operar en el dominio RAW antes del demosaicado y del procesado tonal, lo que evita amplificar ruido tras la ganancia de revelado.

## Capacidades

- Denoising de fotogramas RAW en dominio Bayer, antes del demosaicado y del procesado tonal.
- Demosaicado implícito: la salida ya es RGB a resolución completa del mosaico (`2h × 2w`).
- Tres niveles de calidad y coste computacional intercambiables (fast, balanced, best).
- Entrada con altura y anchura dinámicas, apta para fotogramas de cualquier resolución mediante troceado.
- Inferencia en fp32 y en fp16; la variante fp16 acelera entre 1,4 y 2,5 veces en el Neural Engine de un M5.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente de imagen a imagen.
- No es un denoiser de propósito general: espera datos de mosaico estabilizados y con balance de blancos en espacio de cámara.

## Casos de uso

- Revelado RAW dentro de greycard: el editor y la CLI descargan estos modelos en el primer uso y los aplican automáticamente como etapa de denoising del pipeline; es el caso de uso previsto y el único soportado de forma nativa.
- Fotografía de alto ISO: en el rango ISO 1600 a 12800 la variante fp16 en Core ML mantiene una diferencia media de unos 0,001 stops respecto a fp32, y por debajo de 0,01 stops en el percentil 99,9 fuera de las sombras más profundas, lo que la hace adecuada para fotogramas con ruido fotónico y de lectura elevados.
- Procesado por lotes en la CLI de greycard: el tier balanced (2,3 M de parámetros, unos 2 s de red por fotograma de 24 MP en el hardware de referencia) permite revelar archivos completos sin intervención manual.
- Previsualización rápida en el editor: el tier fast (1,2 M de parámetros, aproximadamente 1 s por fotograma de 24 MP) sirve para iterar sobre ajustes con latencia baja antes de aplicar el tier best (5,3 M, unos 3 s).
- Integración en aplicaciones macOS/iOS vía Core ML: la copia fp16 con pesos y aritmética en fp16, manteniendo entrada y salida en float32, se ejecuta en el Neural Engine de Apple Silicon y encaja en apps de fotografía nativas.
- Estudio y reproducción del método: al estar el código de entrenamiento y exportación en el repositorio de greycard, sirve como referencia para construir denoisers guiados por el modelo de ruido del sensor y para reproducir la conversión fp32 a fp16 con `onnxconverter-common` 1.16.0 y `keep_io_types`.
- Extensión a otros pipelines RAW propios: un desarrollador puede reutilizar el contrato de entrada (mosaico empaquetado y estabilizado) en su propio motor, siempre que respete la licencia GPL-3.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta tiempos de red por fotograma de 24 MP en el hardware de referencia:

| Tier | Archivo | Parámetros | Tiempo de red, fotograma de 24 MP |
|---|---|---|---|
| fast | `denoise-v19.onnx` | 1,2 M | ~1 s |
| balanced | `denoise-v15.onnx` | 2,3 M | ~2 s |
| best | `denoise-v20.onnx` | 5,3 M | ~3 s |

Estos tiempos corresponden solo a la red; greycard trocea y mezcla la salida, por lo que el revelado completo tarda más. En un M5, las variantes fp16 corren entre 1,4 y 2,5 veces más rápido que las fp32.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 1,2 a 5,3 M de parámetros y pesos fp32, el modelo ocupa del orden de decenas de MB, y el consumo dominante es el de las activaciones, que dependen de la resolución del fotograma y del troceado.
- GPU recomendadas: no se especifican. El caso optimizado documentado es Apple Silicon (M5) con Core ML y Neural Engine en fp16.
- Cabe en GPU de consumo: sí, por tamaño de pesos; no hay cifras publicadas de VRAM para resoluciones concretas.
- Opciones de despliegue: ONNX Runtime (cualquier proveedor con los archivos fp32), Core ML en Apple Silicon con los archivos fp16. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: ~1 s, ~2 s y ~3 s de red por fotograma de 24 MP para fast, balanced y best respectivamente, en el hardware de referencia no especificado; aceleración de 1,4 a 2,5 veces con fp16 en un M5.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas con otros denoisers RAW en la información proporcionada. Como referencia estructural, se puede contrastar con las alternativas siguientes, aunque las cifras de rendimiento de estas no forman parte de la información disponible y no se comparan numéricamente:

| Modelo | Enfoque | Parámetros | Dominio de entrada | Licencia |
|---|---|---|---|---|
| greycard denoise (este) | UNet sobre mosaico Bayer estabilizado | 1,2 a 5,3 M | RAW Bayer en espacio de cámara | GPL-3.0-or-later |
| Denoisers RAW de propósito general (p. ej. integrados en darktable o RawTherapee) | Algoritmos no neuronales o redes específicas del proyecto | no disponible | RAW | GPL u otras |
| Denoisers de imagen en sRGB (familia SCUNet, SwinIR, etc.) | Redes convolucionales o transformer sobre imagen ya revelada | no disponible | sRGB | varía |

La diferencia clave frente a los denoisers en sRGB es el punto de inserción en el pipeline: greycard denoise actúa antes del demosaicado y del procesado tonal, con el ruido modelado por sensor.

## Limitaciones y advertencias

- No es un denoiser de propósito general: espera datos de mosaico estabilizados, con balance de blancos y en espacio de cámara; aplicado a imágenes sRGB producirá resultados incorrectos.
- Dependencia del estabilizador de varianza y de los parámetros de ruido medidos del fotograma: sin ese preprocesado, el contrato de entrada no se cumple.
- Entrenado con fotogramas del archivo personal del autor y ruido sintético según el modelo de ruido de greycard; la generalización a otros sensores, cámaras o condiciones no está documentada.
- No se han publicado evaluaciones cuantitativas de calidad (PSNR, SSIM) ni comparaciones con otros denoisers.
- Riesgo de alucinación en el sentido de generación de detalle inexistente: no se documenta el comportamiento en texturas finas, altas frecuencias o zonas de bajo contraste.
- Restricción de licencia: GPL-3.0-or-later, la misma que greycard; el uso comercial dentro de productos derivados obliga a cumplir los términos de la GPL, lo que puede condicionar la integración en software propietario.
- Las mediciones de fp16 se limitan a Core ML en Apple Silicon y al rango ISO 1600 a 12800; fuera de ese contexto deben usarse los archivos fp32.
- No hay información sobre sesgos, idiomas ni comportamiento multilingüe porque el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jessolmstead/greycard-denoise
- Repositorio de greycard (código fuente y entrenamiento): https://github.com/jessolmstead/greycard
- Notas sobre los denoisers fp16 en RAW reales: https://github.com/jessolmstead/greycard/blob/master/docs/notes/481-the-fp16-denoisers-on-real-raws.md
- Notas sobre los denoisers fp16 a ISO alto y primera compilación: https://github.com/jessolmstead/greycard/blob/master/docs/notes/489-the-fp16-denoisers-at-high-iso-and-a-first-compile.md
