# ivanfioravanti/d1-2B-gestures-CoreAI

## Resumen

`ivanfioravanti/d1-2B-gestures-CoreAI` es una conversión del modelo de decisión `LiquidAI/d1-2B` de Liquid AI al formato Core AI de Apple, orientada a ejecutarse de forma nativa sobre la GPU y el Neural Engine de los Mac con Apple Silicon (macOS 27). No es una conversión general del modelo: el autor ha reimplementado el pase de decisión de d1 para cuatro preguntas concretas (gesto de mano, expresión facial, caja de la mano y caja de la cara) como una función de forma fija exportada con `coreai-torch`, de modo que una única pasada hacia delante sobre un fotograma de 640×360 devuelve directamente los logits de las 12 posiciones de respuesta.

El modelo resuelve un problema muy específico: ejecutar localmente, en hardware de consumo Apple, un modelo de decisión visión-lenguaje de 2B parámetros con latencia y consumo energético medidos. Según la model card, en un MacBook Pro M5 Max la variante GPU tarda 43 ms por decisión (55 ms incluyendo preprocesado y lectura) con 6,4 J por decisión, mientras que la variante Neural Engine tarda 236 ms (247 ms de extremo a extremo) pero baja a 3,8 J por decisión, un 40% menos de energía.

La relevancia actual es doble: por un lado demuestra el flujo de exportación de modelos Liquid a Core AI con paridad verificada frente a la referencia MLX 8-bit; por otro, muestra que el Neural Engine puede ejecutar un transformer de 2B parámetros íntegramente en ese motor (plan compilado marcado `mps.fullyPlacedOnANE` y `mps.noGPUActivity`), algo poco habitual en modelos de esta talla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/d1-2B, familia LFM3/d1 de Liquid AI; la model card no detalla la arquitectura interna) |
| Parametros totales | 2B (según el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la exportación usa una entrada fija de un fotograma; no hay contexto conversacional) |
| Tipos de cuantizacion | fp16 (GPU y Neural Engine). Se probó int8 y no se distribuye: sin ganancia en GPU y sin paridad en Neural Engine |
| Idiomas soportados | no disponible (la tarea es clasificación visual, no generación de lenguaje) |
| Licencia | LFM Open License v1.0 (`lfm1.0`); uso comercial solo para entidades con ingresos anuales inferiores a 10 millones de USD |
| Formato de pesos | `.aimodel` (Core AI): `d1_gpu_fp16.aimodel/` y `d1_ane_fp16.aimodel/`, 3,1 GB cada uno; incluye `prompt.json`, `calibration.json`, código de exportación y worker en Swift |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de d1-2B más allá de etiquetarlo como modelo de decisión de la familia LFM3 de Liquid AI. Lo que sí documenta con detalle es el proceso de conversión: el pase de decisión de d1 para las cuatro preguntas se reimplementó como una función PyTorch de forma fija y se exportó con las herramientas Core AI de Apple (`coreai-torch` 0.4.2 y la ruta de exportación de `coreai-models`), con los pesos convertidos de bf16 a fp16. La variante para Neural Engine se reescribió específicamente para ese motor usando convoluciones 1×1, atención por cabeza y constantes en fp16, con reescalados exactos plegados en los pesos (flujos residuales de visión y texto, patch embedding y salidas de rama antes de las normas invariantes a escala) y calculando `sigmoid` mediante `tanh`; matemáticamente la función es la misma y las diferencias se reducen al redondeo fp16.

No hubo reentrenamiento ni ajuste fino. El prompt de las cuatro preguntas, sus máscaras y tablas de posiciones, y únicamente las 1.023 filas de embedding sobre las que se puntúan las respuestas quedan incrustados en el grafo; el resto del vocabulario no se incluye. La firma de la función es `image float32 [1, 3, 352, 640]` (fotograma 640×360 tras el procesador de imagen de d1: redimensionado a 640×352 y normalización `(x/255 - 0.5)/0.5`) y `logits [12, 1023]` en GPU o `[1, 1023, 1, 12]` fp16 en Neural Engine. Las 12 filas corresponden a las posiciones de respuesta: gesto de mano (1), expresión facial (1), caja de mano (presencia + 4 bordes) y caja de cara (presencia + 4 bordes); la lectura (softmax por opción, calibración de Liquid AI y medianas de caja) la realiza el código de d1 a través de `mlx-vlm`, con el mismo formato de salida que `model.system_one(...)`.

## Capacidades

- Clasificación de gestos de mano a partir de un fotograma de webcam.
- Reconocimiento de expresiones faciales.
- Detección y localización de la caja de la mano (presencia más cuatro bordes).
- Detección y localización de la caja de la cara (presencia más cuatro bordes).
- Respuesta a las cuatro preguntas en una única pasada hacia delante, sin generación autorregresiva de texto.
- Ejecución en GPU o Neural Engine de Apple Silicon mediante Core AI (macOS 27), con planes compilados separados para cada motor.
- No soporta tool calling, agentes, razonamiento multi-paso, ni generación de texto libre: el vocabulario está limitado a los 1.023 tokens de respuesta incrustados.
- No admite preguntas distintas de las cuatro predefinidas; para otros usos hay que recurrir al modelo original.

## Casos de uso

- Demostración de control por gestos en macOS: el worker Swift recibe fotogramas en crudo (`float32 [1,3,352,640]`) por stdin como JSON y devuelve logits y tiempo de ejecución; sirve para prototipar interfaces sin ratón ni teclado en un Mac.
- Telemetría de presencia y atención en aplicaciones de videollamada: la detección conjunta de caja de cara y expresión facial en una sola pasada permite estimar si el usuario está presente y su estado expresivo con 43 ms por fotograma en GPU.
- Automatización de accesibilidad: gestos de mano reconocidos localmente pueden mapearse a acciones del sistema (scroll, clic, cambio de ventana) sin enviar vídeo a la nube, con 3,8 J por decisión en Neural Engine.
- Señalización en aplicaciones educativas o de idiomas de signos: el modelo identifica gestos concretos y su posición en el encuadre, lo que permite dar retroalimentación sobre la colocación de la mano.
- Análisis de interacción en estudios de usabilidad: procesar lotes de fotogramas de sesiones grabadas para obtener series temporales de gestos, expresiones y cajas, con paridad verificada frente a la referencia MLX 8-bit (9/9 fotogramas en GPU, 8/9 en Neural Engine).
- Integración en pipelines de visión en Swift: el paquete `code/swift` compila un binario de release que actúa como worker persistente, con carga en caché de 0,6 s (GPU) o 0,3 s (Neural Engine), adecuado para procesos de larga duración en segundo plano.
- Evaluación de despliegue en hardware Apple: comparar consumo y latencia entre GPU y Neural Engine para decidir el motor en una aplicación empotrada, usando las cifras medidas de la model card como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card sí incluye métricas de paridad y rendimiento medidas en un MacBook Pro M5 Max con macOS 27.3:

| Metrica | MLX 8-bit | Core AI GPU fp16 | Core AI Neural Engine fp16 |
|---|---|---|---|
| Fotogramas que pasan paridad (9 fotogramas) | referencia | 9 / 9 | 8 / 9 |
| PSNR de logits frente a MLX | — | 53–60 dB | 45,7–55,6 dB |
| Peor diferencia de probabilidad / borde de caja | — | 0,009 / 0,017 | 0,013 / 0,014 (fotogramas reales) |
| Tiempo de modelo por decisión | — | 43 ms | 236 ms |
| Tiempo por decisión (preprocesado + modelo + lectura) | 59 ms | 55 ms | 247 ms |
| Primera carga (especialización, una vez) | — | 12 s | 74 s |
| Carga en caché | — | 0,6 s | 0,3 s |
| Potencia del Mac por encima de reposo | 132 W | 112 W | 15 W |
| Energía por decisión | 8,1 J | 6,4 J | 3,8 J |

Criterio de paridad: un fotograma pasa si coincide la primera opción para mano y cara, la probabilidad de esa opción está dentro de 0,05 y cada borde de caja está dentro del 3% del fotograma. El único fallo del Neural Engine es un fotograma sintético de gris medio uniforme, con las mismas respuestas pero una probabilidad desviada 0,053.

## Requisitos de hardware

- Espacio en disco: 3,1 GB por variante (GPU o Neural Engine); el repositorio completo ocupa 6,6 GB.
- Memoria: no se indica VRAM o memoria unificada mínima en la model card; las medidas se tomaron en un MacBook Pro M5 Max.
- Hardware: Mac con Apple Silicon y macOS 27 (requisito de Core AI). El Neural Engine requiere un chip con ese motor; no se especifican modelos compatibles.
- No hay soporte documentado para GPU NVIDIA, AMD ni CPU x86 en esta conversión.
- Despliegue: worker Swift (`cd code/swift && swift build -c release`, binario `d1worker` con `--model` y `--compute ane|gpu`) o backend Python `coreai.runtime` (`code/coreai_backend.py`).
- Latencia medida: 43 ms de modelo por decisión en GPU, 236 ms en Neural Engine; 55 ms y 247 ms de extremo a extremo respectivamente.
- Consumo medido con macmon durante 20 s de decisiones encadenadas: 112 W por encima de reposo en GPU, 15 W en Neural Engine.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Notas |
|---|---|---|---|---|---|
| `ivanfioravanti/d1-2B-gestures-CoreAI` (este) | 2B | no disponible | `.aimodel`, Core AI (GPU o Neural Engine) | LFM Open License v1.0 | Función de forma fija para 4 preguntas; 43 ms en GPU, 3,8 J por decisión en Neural Engine |
| `LiquidAI/d1-2B` | 2B | no disponible | PyTorch (bf16) | LFM Open License v1.0 | Modelo original, propósito general; admite preguntas distintas de las cuatro predefinidas |
| `LiquidAI/d1-2B-MLX-8bit` | 2B | no disponible | MLX, 8 bits | LFM Open License v1.0 | Referencia de paridad del autor; 59 ms por decisión y 8,1 J en el mismo equipo |

No se dispone de información sobre otros modelos comparables de la misma categoría (modelos de decisión visión-lenguaje para Apple Silicon) en la documentación proporcionada.

## Limitaciones y advertencias

- No es una conversión general de d1: solo responde a las cuatro preguntas incrustadas (gesto de mano, expresión facial, caja de mano, caja de cara) sobre un fotograma de 640×360; otras formas de imagen se recortan por el centro.
- El vocabulario está limitado a los 1.023 tokens de respuesta; no puede generar texto libre ni responder a nuevas preguntas.
- El Neural Engine falla la paridad en un fotograma sintético de gris medio uniforme (desviación de probabilidad de 0,053); el autor indica que todos los fotogramas reales pasan.
- La primera especialización del modelo en Neural Engine tarda 74 s; la carga en caché posterior es de 0,3 s, pero ese coste inicial afecta a despliegues efímeros.
- El Neural Engine es aproximadamente 5× más lento que la GPU (236 ms frente a 43 ms por decisión), aunque consume alrededor de un 40% menos de energía por decisión.
- Licencia LFM Open License v1.0: el uso comercial solo se licencia para entidades con ingresos anuales inferiores a 10 millones de USD (sección 5). "d1", "LFM" y "Liquid AI" son marcas de Liquid AI y se usan solo para describir el origen.
- No se documentan sesgos, tasas de alucinación ni cobertura idiomática del modelo base en la información disponible.
- No hay soporte documentado fuera de Apple Silicon con macOS 27; la conversión no es portable a otros backends.
- El modelo no se ha reentrenado ni ajustado: cualquier limitación del d1-2B original se hereda sin cambios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ivanfioravanti/d1-2B-gestures-CoreAI
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Variante MLX 8-bit de referencia: https://huggingface.co/LiquidAI/d1-2B-MLX-8bit
- Calibración del modelo base: https://huggingface.co/LiquidAI/d1-2B/blob/main/calibration.json
- Licencia del modelo base: https://huggingface.co/LiquidAI/d1-2B/blob/main/LICENSE
- Demo de gestos con webcam: https://github.com/ivanfioravanti/mlx-d1-gestures
- Liquid AI: https://www.liquid.ai
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
