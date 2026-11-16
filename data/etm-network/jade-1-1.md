# ETM-Network/jade-1.1

## Resumen

Jade 1.1 es un modelo de texto a voz (TTS) desarrollado por ETM-Network, publicado como su primer modelo público. Se trata de un modelo pequeno y orientado a inferencia en dispositivo (*on-device*), que genera audio a 44,1 kHz en 23 idiomas con nueve voces (cinco femeninas y cuatro masculinas). Su propuesta central es ofrecer sintesis de voz multilingue de calidad razonable con un peso muy reducido: el variante por defecto ocupa unos 150 MB y la version cuantizada a 4 bits baja a 81 MB.

El modelo se distribuye en formato ONNX (tambien en MLX para Apple Silicon y safetensors float32 para investigacion) y esta pensado para ejecutarse en CPU de moviles de gama media, CPU de escritorio y GPU. Segun la model card, alcanza aproximadamente 4x tiempo real en una CPU de telefono (Snapdragon 778G+ o superior, 4 hilos), unas 7x en CPU de escritorio (Intel i9-13900KF, 4 hilos) y hasta 250x en una RTX 4090.

Es relevante ahora porque ocupa el nicho de TTS multilingue ligero y desplegable localmente, sin dependencia de servicios en la nube, con licencia OpenRAIL-M. El propio autor lo describe como una version temprana con defectos audibles, y anuncia Jade 1.2 con mas voces y mejor calidad. No se dispone de datos publicos de benchmarks objetivos en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion de 12 bloques (flow matching) con decoder Supertonic 3; encoder de texto y modelo de pasos (*step model*) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8 (8 bits, decoder en fp16), q4 (~4 bits modelo de pasos, 8 bits lado texto, ~4,3 bits decoder), q3 (~3,5 bits modelo de pasos, ~4,2 bits lado texto), float32 |
| Idiomas soportados | 23: en, de, fr, es, it, pt, nl, da, pl, cs, sk, sl, hr, hu, ro, bg, ru, el, lv, lt, et, hi, ja |
| Licencia | OpenRAIL-M |
| Formato de pesos | ONNX (MatMulNBits), MLX cuantizado, safetensors float32 (PyTorch, solo investigacion) |
| Frecuencia de muestreo de audio | 44,1 kHz |
| Voces | 9 (Juliette, Vivienne, Sienna, Molly, Willow, Henry, Elias, Silas, Gabriel) |
| Tamano del repo | 1,9 GB |

## Arquitectura y entrenamiento

Jade 1.1 emplea un transformer de difusion de 12 bloques que genera los latentes de audio mediante *flow matching*, ejecutado por defecto en 12 pasos (recomendado entre 12 y 16 para lectura larga). Los latentes se decodifican con el decoder Supertonic 3 y se obtiene audio a 44,1 kHz. El pipeline incluye un encoder de texto y un modelo de pasos separado del lado de texto, lo que permite cuantizar cada componente con precisiones distintas.

Las versiones cuantizadas usan formatos estandar (ONNX `MatMulNBits`, capas cuantizadas de MLX) con valores ajustados por capa: redondeo aprendido y anchos de bits por capa. Los archivos ONNX requieren ONNX Runtime 1.28 o superior. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. El autor indica que el entrenamiento "no salio del todo segun lo previsto", lo que se refleja en las limitaciones de calidad descritas.

## Capacidades

- Sintesis de voz multilingue en 23 idiomas con una unica arquitectura y nueve voces; cada voz habla todos los idiomas.
- Generacion de audio a 44,1 kHz con calidad orientada a lectura de frases cortas y lectura larga (audiolibros) en configuracion por defecto.
- Control del numero de pasos de difusion (por ejemplo, 6 pasos para mayor velocidad o 12-16 para mayor estabilidad).
- Ejecucion en dispositivo: CPU de movil, CPU de escritorio, GPU NVIDIA (via onnxruntime-gpu) y GPU de Apple Silicon (via MLX).
- Normalizacion de numeros, fechas y abreviaturas en ingles y aleman; en el resto de idiomas los numeros deben escribirse como palabras.
- No incluye deteccion automatica de idioma: el idioma debe pasarse explicitamente.
- No se documentan capacidades de clonacion de voz, control de emocion, tool calling ni agentes; no disponibles.

## Casos de uso

- Lectura de audiolibros y contenido largo: con la configuracion por defecto (q8, 12-16 pasos) el modelo mantiene mayor estabilidad en pasajes largos, y su velocidad de 250x tiempo real en RTX 4090 permite generar horas de audio en minutos.
- Asistentes de voz locales en movil: el variante q4 (81 MB) con 6 pasos corre a unas 6x tiempo real en CPU de telefono de gama media, lo que permite sintesis sin conexion en aplicaciones Android mediante la libreria del proyecto.
- Accesibilidad y lectores de pantalla: la sintesis en 23 idiomas y 9 voces permite ofrecer lectura en voz alta multilingue en aplicaciones de escritorio con CPU estandar (unas 7x tiempo real en un i9-13900KF con 4 hilos).
- Generacion de narracion para video y podcasts: la salida a 44,1 kHz y la variedad de voces permiten producir locuciones en varios idiomas desde un mismo pipeline, integrable via el paquete `etm-tts`.
- Prototipado e investigacion en TTS: los pesos float32 en safetensors (437 MB) y la implementacion ONNX/MLX facilitan experimentar con cuantizacion, numero de pasos y arquitectura de difusion.
- Sistemas embebidos y dispositivos con recursos limitados: el variante q3 (65 MB) permite desplegar TTS en entornos con restricciones severas de memoria, aceptando la perdida de estabilidad descrita por el autor.
- Aplicaciones de aprendizaje de idiomas: la cobertura de 23 idiomas con voces consistentes permite generar ejemplos de pronunciacion en multiples lenguas desde una sola instalacion local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks objetivos (MOS, WER, similitud de hablante) en la informacion disponible. Los unicos datos de rendimiento son los factores de tiempo real declarados por el autor:

| Configuracion (q8, 12 pasos) | Factor de tiempo real |
|---|---|
| CPU de telefono (Snapdragon 778G+, 4 hilos) | ~4x |
| CPU de escritorio (Intel i9-13900KF, 4 hilos) | ~7x (8,7x con 8 hilos) |
| RTX 4090 (onnxruntime-gpu) | ~250x (~340x en textos largos) |
| GPU Apple (M5 Ultra, MLX) | ~240x |

A 6 pasos, la CPU de telefono alcanza aproximadamente 6x tiempo real. No se proporcionan datos de latencia absoluta ni de throughput en unidades de audio por segundo.

## Requisitos de hardware

- VRAM/RAM estimada: q3 unos 65 MB, q4 unos 81 MB, q8 unos 150 MB, float32 unos 437 MB. Cabe holgadamente en cualquier GPU consumer y en memoria de movil.
- GPU recomendadas: RTX 4090 para maximo rendimiento (~250-340x tiempo real); cualquier GPU NVIDIA compatible con onnxruntime-gpu; GPU de Apple Silicon via MLX (probado en M5 Ultra).
- Cabe en GPU consumer: si, en todas las RTX y en GPUs integradas; tambien en CPU de telefono de gama media.
- Opciones de despliegue: ONNX Runtime 1.28 o superior (CPU y GPU), MLX en Apple Silicon, paquete Python `etm-tts` (`pip install etm-tts`, con extra `[mlx]` para Apple), libreria Android del repositorio GitHub. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a TTS en este formato).
- Latencia y throughput: segun los factores de tiempo real de la tabla anterior; no se publican latencias absolutas.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de modelos comparables (parametros, contexto, rendimiento o licencia) para establecer una comparativa rigurosa. Los modelos TTS ligeros multilingues habituales del ecosistema no aparecen citados en la model card ni en la busqueda web realizada. Comparativa: no disponible.

## Limitaciones y advertencias

- El autor reconoce que es una version temprana con defectos audibles derivados de un entrenamiento que "no salio del todo segun lo previsto".
- A baja precision y pocos pasos (q3 y step counts minimos), algunas palabras pueden saltar de tono; es raro en frases cortas pero perceptible en pasajes largos.
- No detecta el idioma automaticamente: hay que indicarlo explicitamente, lo que anade complejidad en pipelines multilingues.
- La normalizacion de numeros, fechas y abreviaturas solo funciona en ingles y aleman; en el resto de idiomas hay que escribir los numeros como palabras.
- Los archivos ONNX exigen ONNX Runtime 1.28 o superior, lo que puede limitar entornos con versiones antiguas.
- Licencia OpenRAIL-M: permite uso comercial con restricciones de uso responsable; conviene revisar los terminos completos antes de desplegar en produccion.
- No se documentan sesgos especificos, pero al no haber datos de evaluacion (MOS, WER) no es posible cuantificar la calidad ni el riesgo de artefactos en produccion.
- El modelo esta anunciado como sustituido proximamente por Jade 1.2, por lo que no se recomienda como base de sistemas a largo plazo sin plan de migracion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ETM-Network/jade-1.1
- Repositorio GitHub: https://github.com/ETM-Network/jade
- Paquete PyPI: https://pypi.org/project/etm-tts/
- Licencia: https://huggingface.co/ETM-Network/jade-1.1/blob/main/LICENSE
- Banner: https://huggingface.co/ETM-Network/jade-1.1/resolve/main/assets/banner.png
- Diagrama de funcionamiento: https://huggingface.co/ETM-Network/jade-1.1/resolve/main/assets/how-it-works.png
- Muestras de audio: https://huggingface.co/ETM-Network/jade-1.1/tree/main/samples
- Referencia al decoder Supertonic 3: https://huggingface.co (enlace incompleto en la model card; URL exacta no disponible)
