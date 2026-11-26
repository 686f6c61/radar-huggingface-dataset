# KokkakNiphon/hxh-ocr

## Resumen

hxh-ocr es una familia de modelos OCR especializada en el alfabeto Hunter × Hunter (ハンター文字), la escritura inventada del manga y anime *Hunter × Hunter*, que funciona como cifrado uno a uno de los kana japoneses. Lo desarrolla KokkakNiphon y, según el autor, es el primer OCR publicado para este alfabeto. El repositorio contiene tres conjuntos de modelos (`v4`, `tiny` y `base`), cada uno compuesto por un detector de líneas de texto y dos lectores CTC: uno para líneas horizontales y otro para columnas verticales.

Todos los modelos parten de un backbone MobileNetV4-small preentrenado en ImageNet procedente de timm, con el stem sumado a un único canal de entrada y restringido a convoluciones y ReLU para facilitar el despliegue en entornos ligeros. Se distribuyen en formato ONNX cuantizado a int8 tras un proceso de quantization-aware training (QAT), con tamanos que van desde 0,34 MB por lector en el conjunto `tiny` hasta 1,21 MB por componente en el conjunto `base`. El modelo es relevante por su enfoque extremo de eficiencia: inferencia en navegador vía WebAssembly, objetivos de microcontrolador (ESP32-S3, vía esp-dl) y entrenamiento exclusivamente con datos sintéticos.

La salida es siempre hiragana: el katakana y los kana pequenos se emiten como hiragana de tamano completo porque los glifos del alfabeto no permiten distinguirlos. Los lectores mas recientes anaden digitos y los signos `! ? : / . -` escritos en linea. El modelo esta pensado para un nicho muy concreto (digitalizacion de material fan, manga y merchandising con este alfabeto) y no como OCR japones general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (MobileNetV4-small de timm como backbone); detector tipo DBNet-lite y lectores CTC |
| Parametros totales | v4: 350k (detector) + 323k por lector; base: 1,18M (detector) + 1,18M por lector; tiny: no disponible de forma explicita (misma arquitectura que v4) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | int8 (quantization-aware training); pesos distribuidos en int8 |
| Idiomas soportados | ja (salida en hiragana; alfabeto Hunter × Hunter) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX; formato propietario `.hxhm` del motor Rust del proyecto; JSON de configuracion por modelo |

## Arquitectura y entrenamiento

Cada conjunto sigue el mismo esquema: un detector de lineas y dos lectores CTC (horizontal y vertical). El detector `v4` (`det_v2`) es un DBNet-lite sobre MobileNetV4-small 0.5 con entrada de 640 × 640, 350k parametros y 1,57 G MACs. El detector `base` (`det_base_v1_qat`) escala a MobileNetV4-small 1.0 (canales 32/64/96/128), FPN de 64 canales, cabeza depthwise-separable y entrada de 960 × 960, con 1,18M parametros y 4,44 G MACs. El detector `tiny` (`det_tiny_v3_qat`) reutiliza la arquitectura de `det_v2` y se afina con paginas de estilo fotografico.

Los lectores `v4` son MobileNetV4-small 0.5 con entrada de 48 × 768 y 323k parametros (154 M MACs por linea); los `base` usan MobileNetV4-small 1.0 con la misma entrada, 1,18M parametros y 555 M MACs por linea. Todos los modelos se entrenaron exclusivamente con imagenes generadas (datos sinteticos), publicadas en los datasets `KokkakNiphon/hxh-ocr-lines` y `KokkakNiphon/hxh-ocr-pages`. La innovacion principal es la combinacion de QAT a int8 con un backbone restringido a convoluciones y ReLU, lo que permite ejecucion en WebAssembly en el navegador y en objetivos de clase microcontrolador mediante esp-dl.

## Capacidades

- Deteccion de lineas de texto en paginas, incluyendo lineas horizontales y columnas verticales.
- Reconocimiento de texto en hiragana sobre el alfabeto Hunter × Hunter (cifrado uno a uno de kana).
- Lectura de digitos y de los signos `! ? : / . -` en linea en los lectores mas recientes.
- Procesamiento de paginas completas de estilo fotografico y de paginas de manga o con marcos.
- Ejecucion en navegador sin subir datos al servidor (demo con WebAssembly sobre los ficheros int8).
- Presets de inferencia: `Fast` (detector `det_v2` + lectores `tiny`, con tiles solapados y segunda pasada sobre la region de texto) y `Accurate` (conjunto `base` a 960 px, una sola pasada).
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente visual de deteccion y reconocimiento.

## Casos de uso

- Digitalizacion de manga y material fan: el preset `Accurate` procesa paginas completas a 960 px en una sola pasada, adecuado para escanear paginas con texto en el alfabeto Hunter × Hunter y obtener transcripciones en hiragana.
- Traduccion asistida de merchandising: con el preset `Fast` y la camara en vivo del navegador, se puede leer texto en camisetas, posters o carteles sin enviar imagenes a un servidor, util para fans que quieren descifrar productos.
- Aplicaciones web sin backend: los ficheros int8 (0,37 + 0,34 + 0,34 MB en `v4`; 3,6 MB en total para `Accurate`) caben en una carga inicial razonable y permiten OCR completamente en cliente con WebAssembly.
- Dispositivos embebidos y microcontroladores: la variante `tiny` esta pensada para objetivos de clase microcontrolador (trabajo previo en ESP32-S3 con esp-dl), lo que habilita lectores portatiles o camaras inteligentes de bajo consumo.
- Herramientas de accesibilidad o preservacion: transcripcion de archivos de la comunidad (fanzines, doujinshi, material escaneado) para indexacion y busqueda de texto.
- Investigacion en OCR de escrituras inventadas: el modelo y los datasets sinteticos sirven de base para experimentos de reconocimiento en alfabetos con pocos datos reales, aprovechando el pipeline de generacion sintetica.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados de forma independiente):

| Tarea | Conjunto / configuracion | Metrica | Valor |
|---|---|---|---|
| Lectura de pagina, Accurate (detector base + lectores base, int8, navegador) | pages_v5 validation [900:1000], config v5 (paginas estilo foto) | line F1 (%), quad IoU >= 0,5 | 83,17 |
| Lectura de pagina, Fast (det_v2 + lectores tiny, int8, navegador) | pages_v5 validation [900:1000], config v5 | line F1 (%), quad IoU >= 0,5 | 76,30 |
| Lectura de pagina, Accurate (int8, navegador) | pages_v3o validation [900:1000], config v3o | line F1 (%), quad IoU >= 0,5 | 91,34 |
| Reconocimiento de linea horizontal (int8 qat_fam_base_h48) | synth_v4 validation, 512 lineas reservadas | CER (%) | 1,11 |
| Reconocimiento de linea horizontal (int8 qat_v4_mnv4s_h48) | synth_v4 validation, 512 lineas reservadas | CER (%) | 0,84 |

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; los modelos son de 0,34 a 1,21 MB por componente en int8, por lo que caben en memoria de sistema o en RAM de microcontrolador.
- GPU recomendadas: no necesarias; la inferencia esta disenada para CPU y WebAssembly. Una GPU no aporta ventaja relevante a estos tamanos.
- Cabe en GPU consumer: si, en cualquier GPU, pero el despliegue previsto es CPU/navegador/microcontrolador.
- Opciones de despliegue: ONNX Runtime (incluido WebAssembly en navegador), motor Rust propio del proyecto con formato `.hxhm`, esp-dl para ESP32-S3. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles de forma numerica en la informacion proporcionada; el autor indica que el preset `Accurate` con tiles costaria aproximadamente 2,5 veces el tiempo de una pasada completa, motivo por el que usa una sola pasada a 960 px.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | Licencia | Enfoque |
|---|---|---|---|---|---|
| hxh-ocr (este modelo) | OCR CNN (DBNet-lite + CTC) | 0,32M–1,18M por componente | 640 × 640 o 960 × 960 (detector); 48 × 768 (lector) | Apache 2.0 | Alfabeto Hunter × Hunter, int8, navegador y microcontrolador |
| Tesseract | OCR clasico (LSTM + motores de reglas) | no disponible | imagen de pagina | Apache 2.0 | OCR general multiidioma; no cubre escrituras inventadas |
| PaddleOCR | OCR CNN (DB + CRNN/SVTR) | decenas de millones | variable | Apache 2.0 | OCR general multiidioma; mucho mas pesado |
| Manga OCR | OCR basado en transformer vision-lenguaje | cientos de millones | variable | no disponible en esta ficha | Texto japones en manga; no cubre el alfabeto Hunter × Hunter |

No se dispone de comparaciones directas de rendimiento entre estos modelos y hxh-ocr en los mismos conjuntos de evaluacion.

## Limitaciones y advertencias

- Ambito muy restringido: solo reconoce el alfabeto Hunter × Hunter y salida en hiragana; no es un OCR japones general ni cubre kanji.
- Perdida de informacion: katakana y kana pequenos se emiten como hiragana de tamano completo porque los glifos no permiten distinguirlos; la transcripcion no es reversible al 100 %.
- Entrenamiento exclusivamente sintetico: el rendimiento en imagenes reales puede degradarse respecto a las metricas declaradas, que proceden de validacion sobre datos generados.
- Metricas no verificadas: los valores del model-index estan marcados como `verified: false`; deben tomarse como declaraciones del autor.
- Riesgo de alucinacion: como todo modelo CTC, puede producir lecturas plausibles en regiones sin texto o con ruido; el autor reporta falsos positivos de lineas (`det_tiny_v3` reduce a la mitad los falsos positivos de `det_v2` en paginas fotograficas, pero pierde 3,6 y 2,8 puntos de F1 en paginas de manga y con marcos).
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datasets y del backbone de timm empleados.
- Dependencia del motor propio: los pesos se distribuyen en formato `.hxhm` ademas de ONNX; el uso completo de los presets del proyecto requiere el motor Rust o el runtime del demo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KokkakNiphon/hxh-ocr
- Demo en navegador: https://hxh-ocr.kokkakniphon.workers.dev
- Blog del proyecto: https://hxh-ocr.kokkakniphon.workers.dev/blog/
- Deep dive de investigacion: https://hxh-ocr.kokkakniphon.workers.dev/blog/deep-dive
- Codigo y cuaderno de entrenamiento: https://github.com/KokkakNiphon/hxh-ocr
- Dataset de lineas: https://huggingface.co/datasets/KokkakNiphon/hxh-ocr-lines
- Dataset de paginas: https://huggingface.co/datasets/KokkakNiphon/hxh-ocr-pages
- Backbone base: https://huggingface.co/timm/mobilenetv4_conv_small.e2400_r224_in1k
