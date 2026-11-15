# lseanlon/suaradee-v0.1

## Resumen

Suaradee v0.1 es un modelo de sintesis de voz (text-to-speech) para bahasa melayu (malasio) desarrollado por lseanlon. Se trata de un modelo extremadamente compacto: 7,9 millones de parametros y un fichero ONNX cuantizado de solo 8,46 MB, lo que permite ejecutarlo en una pestana de navegador mediante transformers.js (WebGPU o WASM) o en un unico hilo de CPU en Python. Su objetivo es ofrecer TTS malasio ligero y desplegable en el cliente, sin dependencias de servidor ni de PyTorch.

El modelo parte de la arquitectura Paradee-8M-v1.3 (un diseno de 8M de parametros con un lado de texto que predice duraciones de fonemas, tono, sonoridad y caracteristicas, y un decodificador que las convierte en audio) y se reentrena sobre aproximadamente 49 minutos de voz sintetica generada con Chatterbox Multilingual y normalizada a una unica voz. La entrada es texto malasio que un front-end basado en reglas convierte en fonemas con el vocabulario de 178 simbolos de Kokoro-82M.

Es relevante por su perfil de despliegue: inferencia a unas 25 veces tiempo real en un hilo de CPU y unas 15 veces en WebGPU, salida a 24 kHz mono, y licencia Apache 2.0. No obstante, es una primera version con calidad limitada: sonido apagado, aproximadamente una frase de cada diez con una palabra incorrecta y una unica voz sintetica femenina sin control de emocion ni estilo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paradee-8M (modelo TTS en dos etapas: predictor de duraciones, tono, sonoridad y caracteristicas + decodificador de audio), exportado a ONNX opset 17 |
| Parametros totales | 7,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrada de hasta 402 fonemas por fragmento (`input_ids` int64 `[1,T]`) |
| Tipos de cuantizacion | int8 (pesos del fichero `onnx/model_quantized.onnx`) |
| Idiomas soportados | Bahasa Melayu (Malasia), con palabras inglesas comunes del habla malasia |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`); consumo via transformers.js y onnxruntime |

## Arquitectura y entrenamiento

El modelo sigue la receta y la arquitectura de Paradee-8M-v1.3, de la que hereda los pesos iniciales. Consta de un lado de texto que predice duraciones de fonemas, tono, sonoridad y caracteristicas acusticas, y un decodificador que transforma esas predicciones en audio a 24 kHz mono. El front-end de texto es un sistema basado en reglas (implementado en `suaradee/` y portado linea por linea a `js/`) que escribe el malasio como fonemas del vocabulario de 178 simbolos de Kokoro-82M, distingue la vocal pepet de la taling mediante un lexico de 24.000 palabras y normaliza numeros, abreviaturas y prestamos del ingles.

Los datos de entrenamiento son sinteticos: unas 750 frases convertidas a voz con Chatterbox Multilingual y normalizadas a una unica voz; tras el recorte se conservaron aproximadamente 49 minutos de audio, con 60 frases reservadas para prueba. El entrenamiento completo llevo menos de una hora en una unica GPU T4. La exportacion a ONNX se adapto para ser compatible con el backend WebGPU de ONNX Runtime Web (acumulador de fase en float32 y limites de slice de 64 bits acotados), sin cambios medibles en el audio. No se documenta uso de RLHF ni DPO.

## Capacidades

- Sintesis de voz a partir de texto en bahasa melayu, con salida a 24 kHz mono.
- Manejo de palabras inglesas comunes integradas en el habla malasia (lista de unas 430 palabras como `confirm`, `booking`, `email`).
- Lectura de numeros, importes, fechas, horas y numeros de telefono en malasio mediante un normalizador basado en reglas.
- Procesamiento de texto largo mediante division en frases y envio en fragmentos de como maximo 400 fonemas.
- Ejecucion en navegador (WebGPU o WASM) mediante transformers.js 3.x, sin salida de datos del dispositivo.
- Ejecucion en Python con onnxruntime y numpy, sin PyTorch, y en Node 24 con transformers.js.
- Parametro de control de velocidad (`speed`, float32 `[1]`).
- No soporta tool calling, agentes, vision, audio de entrada ni modo de razonamiento; es exclusivamente TTS.

## Casos de uso

- Lectura de texto en aplicaciones web malasias: el modelo se carga en la pestana con transformers.js y sintetiza la respuesta en el propio dispositivo, sin enviar texto a un servidor, adecuado para interfaces de accesibilidad o lectura de articulos.
- Asistentes de voz para atencion al cliente en malasio: el conjunto de evaluacion de estilo call-centre (citas, facturas, entregas) obtiene una CER mediana del 9,7 %, el mejor resultado del modelo, por lo que encaja en respuestas cortas y predecibles de ese dominio.
- Anuncios y avisos de voz en kioscos o paneles: al ocupar 8,46 MB y correr a unas 25 veces tiempo real en un hilo de CPU, puede desplegarse en hardware de bajo coste o en el navegador de un terminal.
- Pruebas de integracion continua de pipelines TTS: su inferencia determinista y ligera (sin GPU) permite validar front-ends de texto a fonemas y normalizadores de numeros en tests automatizados.
- Prototipado rapido de productos de voz en bahasa melayu: la licencia Apache 2.0 y la ausencia de dependencia de PyTorch facilitan la experimentacion y la sustitucion posterior por un modelo mayor.
- Aplicaciones educativas de aprendizaje de malasio: lectura de frases cortas y vocabulario con una voz consistente, aunque la calidad apagada y los errores en nombres propios limitan su uso en material de referencia.
- Generacion de audio para demos y maquetas: su velocidad (unas 15 veces tiempo real en WebGPU, 6 veces en la primera llamada) permite iterar rapidamente sobre guiones cortos.

## Benchmarks y rendimiento

La calidad se midio reproduciendo el habla del modelo a Whisper large-v3 y comparando la transcripcion con el texto original (tasa de error de caracteres, CER; menor es mejor). El propio reconocedor comete un 7-9 % de errores sobre los clips humanos de referencia, por lo que ningun modelo puntua 0.

| Conjunto (frases no vistas) | n | CER mediana | Proporcion con CER <= 8 % |
|---|---|---|---|
| Estilo call-centre (citas, facturas, entregas) | 40 | 9,7 % | 42 % |
| Conjunto mixto reservado, global | 60 | 17 % | 23 % |
| — texto general | 17 | 17 % | no disponible |
| — numeros e importes | 12 | 21 % | no disponible |
| — malasio con palabras inglesas | 6 | 17 % | no disponible |

Rendimiento de inferencia declarado: aproximadamente 25 veces tiempo real en un hilo de CPU con onnxruntime, aproximadamente 15 veces en una pestana de navegador con WebGPU (6 veces en la primera llamada). No se han publicado comparaciones con otros modelos TTS en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en la practica; el fichero ONNX int8 ocupa 8,46 MB y la inferencia cabe en CPU o en memoria del navegador.
- GPU recomendadas: no requiere GPU; funciona en cualquier CPU moderna con onnxruntime. En navegador se beneficia de WebGPU (probado en Chromium) y tiene fallback a WASM.
- Cabe en GPU de consumo: si, en cualquier GPU con soporte WebGPU; no es un requisito.
- Opciones de despliegue: onnxruntime en Python (probado con Python 3.12), transformers.js 3.8 en navegador y Node 24, Gradio (`examples/gradio_app.py`), y el wheel `suaradee-0.1.0-py3-none-any.whl` publicado en el repo.
- Latencia y throughput: unas 25 veces tiempo real en un hilo de CPU; unas 15 veces en WebGPU (6 veces en la primera llamada). No se dispone de cifras de latencia absoluta por frase.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| Suaradee v0.1 | 7,9 M | hasta 402 fonemas por fragmento | ms (con ingles comun) | Apache 2.0 | ONNX, navegador y CPU |
| Paradee-8M-v1.3 (modelo base) | ~8 M | no disponible | no disponible | no disponible | no disponible |
| Kokoro-82M (referencia de vocabulario) | 82 M | no disponible | multiple | no disponible | no disponible |
| Chatterbox Multilingual (generador de datos) | no disponible | no disponible | multiple | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros y forma de despliegue.

## Limitaciones y advertencias

- Sonido apagado: el audio tiene aproximadamente un 40 % menos de energia por encima de 4 kHz que el habla de entrenamiento y armonicos superiores difuminados (cualidad amortiguada o ligeramente faseada), un problema conocido de la primera ejecucion de entrenamiento.
- Aproximadamente una frase de cada diez contiene una palabra incorrecta; el riesgo aumenta con nombres propios, toponimos, numeros y palabras poco frecuentes.
- Una unica voz sintetica femenina, sin control de emocion ni de estilo.
- Pensado para frases cortas: el texto largo se divide en fragmentos de como maximo 400 fonemas.
- Las palabras inglesas solo se gestionan si estan en una lista de unas 430 palabras comunes; el resto se pronuncia con reglas malasias.
- Numeros, importes, fechas, horas y telefonos se leen con un normalizador basado en reglas, con posibles errores en formatos no previstos.
- Es habla sintetica: el autor pide indicarlo explicitamente cuando se use.
- Licencia Apache 2.0, que permite uso comercial; no se documentan restricciones adicionales, pero conviene verificar los terminos de los datos sinteticos de entrenamiento (Chatterbox Multilingual) antes de un despliegue en produccion.
- No hay datos publicados sobre sesgos demograficos o dialectales; la cobertura se limita al malasio de Malasia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lseanlon/suaradee-v0.1
- Demo web (Space): https://huggingface.co/spaces/lseanlon/suaradee-web
- Modelo base: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Wheel de Python: https://huggingface.co/lseanlon/suaradee-v0.1/resolve/main/dist/suaradee-0.1.0-py3-none-any.whl
- Repositorio del proyecto (codigo Gradio en `hf/space_gradio`, front-end en `js/` y `examples/`): no disponible como URL publica en la informacion proporcionada.
