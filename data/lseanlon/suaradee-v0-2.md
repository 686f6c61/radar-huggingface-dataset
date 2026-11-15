# lseanlon/suaradee-v0.2

## Resumen

Suaradee v0.2 es un modelo de síntesis de voz (text-to-speech) para bahasa Melayu (malayo de Malasia) desarrollado por el usuario lseanlon. Se trata de un modelo extremadamente compacto: 7,9 millones de parámetros y un único fichero ONNX de 8,46 MB con pesos en int8, lo que permite ejecutarlo en una pestaña de navegador mediante transformers.js (WebGPU o WASM) o en un solo hilo de CPU con onnxruntime en Python. Está construido sobre la arquitectura Paradee-8M (sahilmahendrakar/Paradee-8M-v1.3), de la que hereda pesos y receta de entrenamiento.

El modelo resuelve el problema de disponer de TTS en malayo con un coste computacional mínimo y despliegue trivial, sin dependencia de PyTorch ni de infraestructura de servidor. La versión v0.2 mejora la inteligibilidad respecto a v0.1 (reduce aproximadamente a la mitad el error de caracteres en frases no vistas) gracias a un realineamiento forzado a nivel de letra de los fonemas del corpus de entrenamiento, aunque mantiene el mismo problema de sonido apagado.

Es relevante ahora por su enfoque de despliegue en el borde (navegador, CPU) y por su licencia Apache 2.0, que facilita la integración comercial. La salida es audio mono a 24 kHz y el idioma soportado es exclusivamente malayo, con tolerancia limitada a palabras inglesas de uso común en el habla malasia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paradee-8M (StyleTextToSpeech2Model), exportada a ONNX (opset 17) |
| Parametros totales | 7,9 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de hasta 402 ids de fonema (T ≤ 402) |
| Tipos de cuantizacion | int8 (pesos); fichero `onnx/model_quantized.onnx` de 8,46 MB |
| Idiomas soportados | ms (bahasa Melayu de Malasia), con palabras inglesas comunes |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model_quantized.onnx); paquete Python propio y módulo JS |
| Frecuencia de muestreo de salida | 24 kHz mono |
| Vocabulario | 178 símbolos (el de Kokoro-82M) |
| Entradas | `input_ids` (int64 `[1,T]`, ids de fonema con 0 en cada extremo) y `speed` (float32 `[1]`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Paradee-8M, un transformer de 7,9 M de parámetros para TTS estilo StyleTTS2, exportado a ONNX con pesos int8. La entrada es una secuencia de ids de fonema (hasta 402) y un escalar de velocidad; la salida es audio a 24 kHz. El front-end de texto es una implementación basada en reglas que convierte malayo en fonemas usando el vocabulario de 178 símbolos de Kokoro-82M, con un léxico de 24.000 palabras para resolver las vocales pepet y taling. Este front-end está portado línea a línea de Python a JavaScript.

El entrenamiento partió de los pesos de Paradee-8M-v1.3. Se generaron aproximadamente 750 frases con Chatterbox Multilingual (un modelo mayor), convertidas a una voz consistente; tras el recorte se conservaron unos 49 minutos de audio, y 60 frases se reservaron para prueba. La innovación clave de v0.2 es el realineamiento temporal: en v0.1 la mitad de los límites de fonema dentro de palabra tenían un error superior a un frame (25 ms) porque se estimaban por proporciones; en v0.2 se temporizan los fonemas de cada palabra malaya mediante alineamiento forzado a nivel de letra sobre el audio de entrenamiento (6.050 de 6.318 palabras), y se reentrena la misma arquitectura con la misma receta. El entrenamiento completo llevó menos de una hora en una única GPU T4. No se menciona uso de RLHF ni DPO.

## Capacidades

- Síntesis de voz a partir de texto en bahasa Melayu, con salida mono a 24 kHz.
- Control de velocidad mediante la entrada `speed` (float32).
- Procesamiento de números, importes, fechas, horas y teléfonos mediante un normalizador basado en reglas que los lee en malayo.
- Manejo de un conjunto cerrado de aproximadamente 430 palabras inglesas frecuentes en el habla malasia.
- Segmentación automática de textos largos: corta en finales de frase y envía fragmentos de como máximo 400 fonemas.
- Ejecución en navegador (transformers.js 3.x con WebGPU o WASM) y en Python con onnxruntime, sin PyTorch.
- No soporta tool calling, agentes, visión, audio de entrada ni modos de razonamiento; es exclusivamente TTS.

## Casos de uso

- Lectura de textos en malayo en aplicaciones web sin backend: el modelo se carga en la pestaña del navegador vía transformers.js y WebGPU, de modo que el audio se genera en el dispositivo y no se envía texto a ningún servidor, lo que simplifica el cumplimiento de privacidad.
- Atención al cliente automatizada en malayo: adecuado para frases de estilo call-center (citas, facturas, entregas), donde el modelo alcanza un CER mediano del 4,8 % en frases no vistas; puede integrarse en un IVR o en un chatbot que sintetice respuestas cortas.
- Anuncios y avisos por voz en comercios o transporte: con 8,46 MB y ejecución a unas 25 veces tiempo real en un solo hilo de CPU, puede desplegarse en dispositivos de bajo consumo o en el propio navegador de un panel de control.
- Accesibilidad web para contenido en malayo: lectura en voz alta de artículos o formularios directamente en el cliente, sin coste de servidor y con latencia baja tras la primera llamada (unas 6 veces tiempo real en la primera invocación en WebGPU y unas 15 en las siguientes).
- Pruebas de concepto y prototipos de TTS en malayo: el paquete Python y los ejemplos de Gradio permiten validar un flujo de voz en minutos, con una sola dependencia (onnxruntime) y sin GPU.
- Generación de pistas de voz para vídeos o demos internas en malayo: la licencia Apache 2.0 permite uso comercial, aunque debe indicarse que la voz es sintética.
- Normalización de lectura de datos estructurados: el normalizador basado en reglas convierte números, importes y fechas a malayo hablado, útil en sistemas de consulta de saldos o seguimiento de pedidos por voz.

## Benchmarks y rendimiento

La calidad se midió reproduciendo el audio del modelo a Whisper large-v3 y comparando la transcripción con el texto original mediante tasa de error de caracteres (CER, menor es mejor). El propio reconocedor comete aproximadamente un 9 % de error sobre los clips de entrenamiento, por lo que ningún modelo puntúa 0.

| Conjunto de frases no vistas | n | CER mediana v0.1 | CER mediana v0.2 | v0.2 con CER ≤ 8 % |
|---|---|---|---|---|
| Estilo call-center (citas, facturas, entregas) | 40 | 9,7 % | 4,8 % | 70 % |
| Conjunto mixto retenido, global | 60 | 17 % | 6,3 % | 52 % |
| — de estilo call-center | 23 | 12,5 % | 2,9 % | no disponible |
| — números e importes | 12 | 21 % | 2,9 % | no disponible |
| — texto general | 17 | 17 % | 12 % | no disponible |
| — malayo con palabras inglesas | 6 | 17 % | 18 % | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, por tratarse de un modelo de TTS.

## Requisitos de hardware

- VRAM: no requiere GPU; el fichero ONNX int8 ocupa 8,46 MB y la inferencia puede ejecutarse en CPU.
- GPU recomendadas: cualquier GPU con soporte WebGPU para la ejecución en navegador; no se especifican modelos concretos (A100, H100, RTX 4090) porque el modelo no los necesita.
- Cabe en cualquier GPU de consumo y en CPU de un solo hilo; también en dispositivos móviles con navegador compatible con WebGPU o WASM.
- Opciones de despliegue: onnxruntime en Python (paquete `suaradee`), transformers.js 3.x en navegador o Node (WebGPU o WASM), y una app Gradio de ejemplo (`examples/gradio_app.py`).
- Rendimiento: aproximadamente 25 veces tiempo real en un solo hilo de CPU con onnxruntime; aproximadamente 15 veces tiempo real en una pestaña de navegador con WebGPU (6 veces en la primera llamada).
- Latencia: no se publican cifras absolutas de latencia; el coste dominante es la primera carga del modelo en el navegador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| Suaradee v0.2 | 7,9 M | hasta 402 fonemas | ms | Apache 2.0 | ONNX, navegador, CPU |
| Paradee-8M-v1.3 (modelo base) | ~8 M | no disponible | no disponible | no disponible | no disponible |
| Kokoro-82M (referencia de vocabulario) | 82 M | no disponible | multilingüe | no disponible | no disponible |
| Chatterbox Multilingual (generador del corpus) | no disponible | no disponible | multilingüe | no disponible | no disponible |

La comparación cuantitativa de calidad con alternativas no está disponible en la información proporcionada; los únicos datos comparativos son internos entre v0.1 y v0.2.

## Limitaciones y advertencias

- Sonido apagado: el audio tiene aproximadamente un 30 % menos de energía por encima de 4 kHz que el habla de entrenamiento y los armónicos superiores están difuminados; el problema persiste desde v0.1 y proviene del entrenamiento del decodificador.
- Punto débil en palabras inglesas: las frases que mezclan malayo e inglés puntúan alrededor del 18 % de CER; solo se manejan palabras inglesas de una lista de unas 430.
- Texto general (estilo Wikipedia, nombres propios, topónimos) presenta un error mediano de aproximadamente el 12 %.
- Una única voz femenina sintética, sin control de emoción ni de estilo.
- Diseñado para frases cortas; el texto largo se fragmenta en trozos de como máximo 400 fonemas.
- Los conjuntos de evaluación retenidos provienen del mismo pool de prompts que el entrenamiento (frases distintas pero de estilo similar), por lo que el texto libre real será más difícil de lo que sugieren las cifras.
- Riesgo de alucinación acústica: no se documenta explícitamente, pero al ser un modelo generativo de audio puede producir pronunciaciones incorrectas en palabras fuera del léxico o del conjunto de 430 palabras inglesas.
- Licencia Apache 2.0: permite uso comercial, pero el autor solicita indicar que la voz es sintética.
- No soporta otros idiomas distintos del malayo; no debe emplearse para castellano ni para inglés general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lseanlon/suaradee-v0.2
- Versión anterior: https://huggingface.co/lseanlon/suaradee-v0.1
- Demo web (Space): https://huggingface.co/spaces/lseanlon/suaradee-web
- Modelo base: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Paquete Python: https://huggingface.co/lseanlon/suaradee-v0.2/resolve/main/dist/suaradee-0.2.0-py3-none-any.whl
