# 77ethers/alpa

## Resumen

Alpa (अल्प, "pequeño" en sánscrito) es un modelo de síntesis de voz (text-to-speech) para sánscrito desarrollado por el usuario 77ethers. Se trata de un fine-tuning de [tiny-voca](https://huggingface.co/n4ze3m/tiny-voca), un modelo TTS en inglés de 4,5 millones de parámetros, que ha sido adaptado al sánscrito mediante la reescritura manual de dos tablas de fonemas y un entrenamiento ligero de 3.000 pasos sobre CPU.

La propuesta del modelo es radicalmente minimalista: 18 MB de pesos en formato ONNX, 4,5 millones de parámetros y cero horas de GPU en el entrenamiento. Según la model card, el modelo resultante lee sánscrito con una tasa de error de fonemas del 3,1%, comparable al 3,3% de las grabaciones humanas usadas como referencia, y puede ejecutarse en una pestaña de navegador a 12 veces la velocidad en tiempo real sobre un solo hilo.

Es relevante ahora porque demuestra que es posible portar un modelo TTS de un idioma a otro con recursos mínimos (100 minutos de CPU, 3,5 horas de audio) cuando se parte de pesos preentrenados y se interviene quirúrgicamente en las tablas de fonemas. Es una versión preliminar (v0.1) con una sola voz y validación limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal TTS heredada de tiny-voca (arquitectura exacta no detallada en la model card) |
| Parametros totales | 4,5 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no aplica contexto de texto largo) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en ONNX |
| Idiomas soportados | sánscrito (sa) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Alpa parte de tiny-voca, un modelo TTS de 4,5 millones de parámetros entrenado desde cero en inglés por n4ze3m en 7,7 horas sobre una RTX 4090. La adaptación al sánscrito se realizó en dos fases. En la primera, se reescribieron a mano dos tablas del modelo (9.600 números, el 0,2% del total) que codifican qué sonido corresponde a cada fonema y la ponderación silábica (laghu/guru en lugar de átona/tónica). Cada sonido sánscrito se inicializó a partir del sonido inglés más cercano; los retroflejos ट, ड, ण y ष, inexistentes en inglés, se inicializaron como una mezcla del 70% del sonido inglés más próximo y un 30% de la "r" inglesa, aprovechando que ambos se articulan con la lengua curvada hacia atrás. El 99,8% restante de la red se copió sin tocar.

En la segunda fase, el modelo se entrenó durante 3.000 pasos (aproximadamente 100 minutos) sobre una CPU de cuatro núcleos, usando 3,5 horas de audio en sánscrito del dataset ai4bharat/Rasa. La innovación técnica destacable es la intervención manual en las tablas de fonemas: el autor documenta que entrenar los retroflejos desde una copia plana de sus equivalentes ingleses solo alcanza un 24% de acierto para ट entre vocales, mientras que la inicialización editada a mano llega al 86% tras los mismos 3.000 pasos. No se menciona uso de RLHF ni DPO.

## Capacidades

- Síntesis de voz a partir de texto en devanagari para sánscrito.
- Una única voz entrenada; no hay selección de hablante ni control de estilo.
- Lectura de verso como texto plano: el modelo no canta ni recita con métrica (a diferencia de Vāgdhenu).
- Manejo de contrastes fonéticos del sánscrito: retroflejos vs. dentales, aspiradas, vocales largas y breves, y distinción laghu/guru.
- Ejecución en navegador mediante ONNX, con toda la cadena desde el texto devanagari hasta el audio.
- Rendimiento de 12 veces tiempo real en una pestaña de navegador sobre un solo hilo.
- No se documenta soporte de tool calling, agentes, visión, audio de entrada ni modo de razonamiento (no aplica a un TTS).

## Casos de uso

- Lectura de textos sánscritos en aplicaciones educativas: el modelo convierte slokas y pasajes en devanagari a audio en el navegador del estudiante sin servidor ni GPU, gracias a sus 18 MB en ONNX y su velocidad de 12× tiempo real.
- Accesibilidad para estudiantes de sánscrito: permite escuchar pronunciaciones de palabras y frases con contraste de retroflejos y dentales, un punto crítico para el aprendizaje que el modelo trata explícitamente.
- Prototipado rápido de interfaces TTS: al caber en una página web y ejecutarse en un solo hilo, sirve para validar experiencias de lectura en voz alta en aplicaciones web antes de invertir en modelos mayores.
- Investigación en adaptación cross-lingual de TTS: el modelo documenta paso a paso cómo portar un TTS inglés a otro idioma editando tablas de fonemas y entrenando en CPU, lo que lo convierte en una referencia reproducible para experimentos de bajo coste.
- Herramientas de preservación lingüística: proyectos de digitalización de textos sánscritos pueden integrar lectura en voz alta sin infraestructura de GPU, usando el modelo como componente ONNX embebido.
- Demostraciones y pruebas de concepto en dispositivos sin GPU: cualquier entorno con CPU y un runtime ONNX puede generar audio, lo que facilita demos en portátiles, entornos CI o dispositivos de bajos recursos.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son métricas de error de fonemas medidas con un reconocedor de sánscrito, no benchmarks estándar de TTS (MOS, WER, etc.).

| Metrica | Resultado |
|---|---|
| Fonemas mal leídos, modelo inglés con tablas reescritas (sin entrenar) | 26,6% |
| Fonemas mal leídos, tras 100 minutos en CPU (3.000 pasos) | 3,1% |
| Fonemas mal leídos, grabaciones humanas de referencia | 3,3% |
| ट entre vocales, oído correctamente (inicio plano, 3.000 pasos) | 24% |
| ट entre vocales, oído correctamente (inicio editado, 3.000 pasos) | 86% |
| ड entre vocales, oído correctamente (inicio plano / editado) | 52% / 81% |
| ण entre vocales, oído correctamente (inicio plano / editado) | 83% / 97% |
| ट, ड, ण en grabaciones humanas | 100% / 90% / 100% |
| Velocidad en navegador (un hilo) | 12× tiempo real |

Comparación de tamaños declarada por el autor:

| Modelo | Tarea | Parametros | Descarga |
|---|---|---:|---:|
| Alpa v0.1 | Voz en sánscrito | 4,5 M | 18 MB |
| Vāgdhenu, port de navegador | Canto en sánscrito | cuantizado | 296 MB |
| Vāgdhenu | Canto en sánscrito | 337 M + 112 M vocoder | 1,8 GB |
| Indic Parler-TTS | Voz en varias lenguas indias (incluido sánscrito) | 938 M | 3,75 GB |

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse en CPU; el entrenamiento se completó en una CPU de cuatro núcleos.
- VRAM: no requiere GPU; los 18 MB de pesos ONNX caben en memoria de cualquier dispositivo.
- GPU recomendadas: no disponibles ni necesarias; el autor no reporta uso de GPU en ningún punto del proceso.
- Cabe en cualquier GPU de consumo e incluso en navegador; no hay requisitos de VRAM documentados.
- Despliegue: runtime ONNX (onnxruntime-web para navegador, onnxruntime para CPU); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 12× tiempo real en una pestaña de navegador sobre un solo hilo, según la model card.

## Comparativa con modelos similares

| Modelo | Tarea | Parametros | Tamano | Licencia | Enfoque |
|---|---|---:|---:|---|---|
| Alpa v0.1 | Voz en sánscrito | 4,5 M | 18 MB | Apache 2.0 | TTS mínimo, ejecutable en navegador |
| Vāgdhenu | Canto en sánscrito | 337 M + 112 M vocoder | 1,8 GB | no disponible en la información | Recitación con métrica |
| Indic Parler-TTS | Voz multilingüe india | 938 M | 3,75 GB | no disponible en la información | Cobertura multilingüe y multi-voz |

Alpa se distingue por su tamaño (dos órdenes de magnitud menor que Indic Parler-TTS) y por ejecutarse en navegador, a costa de una sola voz, sin canto métrico y con validación preliminar. Los datos de licencia de los modelos comparables no se detallan en la información proporcionada.

## Limitaciones y advertencias

- Versión preliminar v0.1: una sola voz, 3,5 horas de audio de entrenamiento y validación por un único oyente y un único reconocedor.
- No canta ni recita con métrica; lee el verso como texto plano.
- Tasa de error de fonemas del 3,1% medida con un reconocedor automático, no con evaluación perceptual humana a gran escala; no hay MOS ni pruebas con múltiples oyentes.
- Los retroflejos mejoran pero no igualan a las grabaciones humanas (ट 86% frente a 100%; ड 81% frente a 90%).
- Solo sánscrito; no hay soporte multilingüe ni cambio de voz.
- Riesgo de pronunciación incorrecta en palabras poco representadas en el dataset ai4bharat/Rasa o en secuencias fonéticas atípicas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base tiny-voca y el dataset de entrenamiento deben verificarse por separado para cumplir sus términos.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- El tamaño del repo aparece como 0.0 GB en los metadatos, lo que puede indicar que los pesos no están alojados en el repositorio principal o que la información está incompleta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/77ethers/alpa
- Modelo base tiny-voca: https://huggingface.co/n4ze3m/tiny-voca
- Dataset ai4bharat/Rasa: https://huggingface.co/datasets/ai4bharat/Rasa
- Muestras de audio: https://huggingface.co/77ethers/alpa/resolve/main/samples/1_gita_1_1.wav (y muestras 2 a 5 en la misma ruta)
- Imágenes de la model card: https://huggingface.co/77ethers/alpa/resolve/main/assets/banner.png, https://huggingface.co/77ethers/alpa/resolve/main/assets/how.png, https://huggingface.co/77ethers/alpa/resolve/main/assets/retroflex.png, https://huggingface.co/77ethers/alpa/resolve/main/assets/size.png
