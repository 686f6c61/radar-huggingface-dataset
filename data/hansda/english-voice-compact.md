# Hansda/english-voice-compact

## Resumen

English Voice · compact browser TTS es un modelo de síntesis de voz (text-to-speech) de un solo hablante para inglés, publicado por el desarrollador Hansda bajo licencia Apache 2.0. El modelo genera audio a 24 kHz y está diseñado específicamente para inferencia en navegador mediante WebAssembly, lo que lo sitúa en la categoría de TTS ultraligero orientado a despliegue en cliente y no a servidores de alta capacidad.

La arquitectura deriva de Tiny Voca y reutiliza la arquitectura compacta empleada previamente por el autor para bengalí, incluyendo un residuo de forma de onda aprendido. El modelo se distribuye en una variante cuantizada INT6 de aproximadamente 826 KB (incluyendo grafo comprimido, pesos empaquetados y desempaquetador) y se acompaña del código fuente FP32 para reentrenamiento. El runtime compartido y el frontend de idioma se descargan por separado.

El modelo se entrenó sobre un corpus sintético de 20 horas generado por Maya 2 Native con la voz Nivedita, y el checkpoint INT6 continuó el entrenamiento en inglés durante 2.000 pasos sobre 9.747 clips. Su relevancia actual reside en la combinación de tamaño extremadamente reducido, licencia permisiva y ejecución en navegador sin servidor, un nicho poco cubierto por los TTS de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Tiny Voca; arquitectura compacta con residuo de forma de onda aprendido (detalles de capas no disponibles) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | INT6 (principal); INT7; pesos calibrados con tensores sensibles a 8 bits; fuente FP32 incluida |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos empaquetados para WebAssembly; fuente FP32 incluida en el directorio de la variante; GGUF/safetensors no disponibles |
| Frecuencia de muestreo de audio | 24 kHz |
| Voces | Una sola voz (Nivedita) |
| Tamano del modelo INT6 | 826.645 bytes (aprox. 826 KB) en navegador |
| Dataset de entrenamiento | Hansda/english-maya2-nivedita-20h (20 h sintéticas) |

## Arquitectura y entrenamiento

El modelo es un TTS de arquitectura compacta adaptado de Tiny Voca, que incorpora un residuo de forma de onda aprendido. No se dispone de detalles sobre el número de capas, dimensión de los embeddings o mecanismo de atención en la información proporcionada. El modelo incluye un fonemizador recurrente entrenado con etiquetas de pronunciación de eSpeak NG, un lexicón y un tokenizador entrenado sobre las transcripciones de entrenamiento del dataset. La inferencia en navegador utiliza el fonemizador y el lexicón aprendidos incluidos en el paquete.

El entrenamiento se realizó sobre el corpus sintético Hansda/english-maya2-nivedita-20h, de 20 horas, generado por Maya 2 Native con la voz Nivedita. El checkpoint INT6 continuó el entrenamiento en inglés durante 2.000 pasos sobre 9.747 clips, usando duraciones de fonemas obtenidas de un reconocedor de fonemas congelado. La cuantización INT6 e INT7 emplea pesos calibrados, manteniendo tensores sensibles seleccionados a 8 bits. No se menciona RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Síntesis de voz en inglés de un solo hablante a 24 kHz.
- Generación de audio a partir de texto con fonemización automática mediante fonemizador recurrente y lexicón aprendidos.
- Ejecución en navegador mediante WebAssembly (Chromium) sin necesidad de servidor.
- Inferencia a velocidad calibrada de 1.0000 relativa al modelo sin cuantizar, con reproducción a 1× en la demo.
- Distribución de fuente FP32 para fine-tuning o reentrenamiento adicional.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.
- Capacidad multilingüe limitada al inglés; no se documentan otros idiomas.

## Casos de uso

- Lectura por voz en aplicaciones web: el modelo puede integrarse en una página web mediante WebAssembly para leer contenido dinámico en inglés sin depender de un servicio de TTS en la nube, gracias a su tamaño de 826 KB y a la licencia Apache 2.0.
- Accesibilidad en navegador: permite añadir narración de texto a interfaces web para usuarios con discapacidad visual, ejecutándose en el cliente y evitando el envío de contenido a servidores externos.
- Asistentes de lectura offline: al ejecutarse en WebAssembly, puede empaquetarse en aplicaciones web progresivas (PWA) que funcionen sin conexión una vez descargado el runtime y el modelo.
- Prototipado rápido de interfaces de voz: desarrolladores que necesiten una voz inglesa de referencia para demos o pruebas de UX pueden desplegarla sin infraestructura de GPU ni costes de API.
- Generación de avisos y notificaciones habladas: adecuado para notificaciones breves en inglés dentro de aplicaciones web, donde el coste de latencia de un servicio remoto no está justificado.
- Educación y aprendizaje de idiomas: lectura de textos en inglés con una voz sintética consistente para ejercicios de comprensión o práctica de pronunciación, con la ventaja de ejecución local en el navegador.
- Reentrenamiento y adaptación: la inclusión de la fuente FP32 permite a investigadores ajustar el modelo a otras voces o dominios partiendo de la arquitectura compacta.

## Benchmarks y rendimiento

| Metrica | Valor (INT6) |
|---|---|
| MOS predicho (validacion) | 2.293 |
| CER (validacion) | 1,46 % |
| MOS predicho (test) | 2.375 |
| CER (test) | 1,85 % |
| Tamano del modelo en navegador | 826.645 bytes |

Los valores de MOS predicho se obtuvieron con UTMOSv2 sobre 24 clips reservados y semillas 17, 29 y 43 por split. El CER se calculó con ASR independiente sobre 72 clips reservados; cada variante incluye un archivo `test/cer.json` que identifica el reconocedor empleado. Las puntuaciones INT6 se midieron con Chromium WebAssembly a una velocidad calibrada de 1.0000 relativa al modelo sin cuantizar. No se han publicado resultados comparativos con otros modelos TTS en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el modelo se ejecuta en el navegador mediante WebAssembly sobre CPU.
- GPU recomendadas: no se especifican; el diseño está orientado a CPU en navegador. Para reentrenamiento desde la fuente FP32 se requeriría una GPU, pero no se documenta el modelo concreto.
- Compatibilidad con GPU de consumo: no disponible; el despliegue previsto es en cliente (navegador Chromium).
- Opciones de despliegue: WebAssembly en navegador Chromium (vía demo en tts.hansda.in); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no se publican cifras absolutas; la demo opera a 1× con la velocidad calibrada de 1.0000 relativa al modelo sin cuantizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| English Voice · compact browser TTS (Hansda) | No disponible (826 KB INT6) | Audio 24 kHz, una voz, inglés | Apache 2.0 | WebAssembly en navegador | MOS predicho 2.375 en test |
| Tiny Voca (n4ze3m) | No disponible | TTS en navegador | No disponible en la informacion | WebAssembly | Arquitectura base del modelo |
| Maya 2 Native (maya-research) | No disponible | TTS multiuso | No disponible en la informacion | No disponible | Generador del corpus de entrenamiento (voz Nivedita) |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada. La comparativa se limita a aspectos de licencia, despliegue y procedencia arquitectónica.

## Limitaciones y advertencias

- Calidad de voz limitada: el MOS predicho de 2.375 en test indica una calidad perceptual baja en comparación con sistemas TTS comerciales, adecuada para usos auxiliares pero no para producción de audio de alta fidelidad.
- Entrenamiento sobre datos sintéticos: el corpus de 20 horas fue generado por Maya 2 Native, por lo que el modelo puede heredar artefactos y sesgos de ese sistema, incluida la voz Nivedita concreta.
- Una sola voz y un solo idioma: no permite selección de hablante ni síntesis multilingüe.
- Riesgo de errores de pronunciación: el CER de validación (1,46 %) y test (1,85 %) refleja errores de reconocimiento sobre audio sintetizado; en dominios con nombres propios, siglas o terminología técnica la tasa puede ser mayor.
- Dependencia del navegador: la inferencia validada se realizó en Chromium WebAssembly; el comportamiento en otros motores no está documentado.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Sin datos de sesgo: no se documentan evaluaciones de sesgo demográfico, acento o prosodia más allá de las métricas MOS y CER.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hansda/english-voice-compact
- Demo en navegador: https://tts.hansda.in/?lang=en
- Dataset de entrenamiento: https://huggingface.co/datasets/Hansda/english-maya2-nivedita-20h
- Commit del dataset usado: https://huggingface.co/datasets/Hansda/english-maya2-nivedita-20h/commit/9d74715657689855626e0651e35428c2d89a39df
- Tiny Voca (arquitectura base): https://github.com/n4ze3m/tiny-voca
- Maya 2 Native (generador del corpus): https://huggingface.co/maya-research/maya2-native
