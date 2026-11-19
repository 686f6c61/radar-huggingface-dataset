# Hansda/malayalam-voice-compact

## Resumen

Malayalam Voice · compact es un modelo de síntesis de voz (text-to-speech) de una sola voz para malayalam, publicado por el desarrollador Hansda bajo licencia Apache 2.0. Se presenta como una adaptación de la arquitectura compacta de Tiny Voca, reutilizando la arquitectura compacta de bengalí ya aceptada e incorporando un residuo de forma de onda aprendido. El modelo genera audio a 24 kHz y está diseñado específicamente para inferencia en navegador mediante WebAssembly en Chromium, con un tamaño de pesos cuantizados en INT6 de aproximadamente 826 KB.

El modelo se entrena sobre un corpus sintético de 20 horas generado por Maya 2 Native con la voz Jahnavi, y se distribuye junto con su dataset de entrenamiento. La propuesta es relevante porque demuestra que es posible desplegar TTS neuronal multilingüe de baja latencia completamente en el cliente, sin servidor, con un coste de descarga mínimo. La calidad reportada es modesta (MOS predicho en torno a 2,3 y CER en torno al 3 %), lo que lo sitúa como una solución ligera y funcional más que como un sistema de alta fidelidad.

La información pública disponible es limitada: no se detallan el número de parámetros, la longitud de contexto ni los datos de entrenamiento más allá del corpus sintético citado. Esta ficha recoge exclusivamente los datos publicados en la model card y en los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptación de Tiny Voca (arquitectura compacta de bengalí con residuo de forma de onda aprendido) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT6 (principal, 826.164 bytes), INT7, FP32 (fuente incluida para reentrenamiento) |
| Idiomas soportados | malayalam (ml) |
| Licencia | Apache 2.0 |
| Formato de pesos | Pesos cuantizados empaquetados para WebAssembly; fuente FP32 incluida en el directorio de la variante |

## Arquitectura y entrenamiento

El modelo parte de Tiny Voca y adopta la arquitectura compacta validada para bengalí, con un residuo de forma de onda aprendido. Genera audio a 24 kHz con una sola voz. La inferencia en navegador se ejecuta mediante WebAssembly en Chromium, con un ritmo calibrado de 0,9473 relativo al modelo bruto; la demo emplea ese ritmo a velocidad 1×. El tamaño del modelo en navegador incluye el grafo comprimido, los pesos empaquetados y el desempaquetador; el runtime compartido y el frontend de idioma se descargan por separado.

El entrenamiento se realizó sobre el corpus sintético Hansda/malayalam-maya2-jahnavi-20h, de 20 horas, generado por Maya 2 Native con la voz Jahnavi incorporada. El checkpoint acústico de la variante INT6 combina un 75 % de la continuación "audited-only" y un 25 % de la continuación "near-exact-data", ambas partiendo del mismo checkpoint. El tokenizador se entrenó con las transcripciones de entrenamiento del dataset y el fonemizador recurrente se entrenó con etiquetas de pronunciación de eSpeak NG. En navegador se usa el fonemizador aprendido y el léxico distribuidos con el modelo; además, el frontend de malayalam incorpora un fonemizador actualizado entrenado con combinaciones largas de palabras del split de entrenamiento. La model card no especifica el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) de una sola voz en malayalam a 24 kHz.
- Fonemización específica para malayalam mediante un fonemizador recurrente aprendido y un léxico propio.
- Ejecución en navegador mediante WebAssembly en Chromium, sin necesidad de servidor.
- Cuantización agresiva a INT6 (con tensores sensibles seleccionados mantenidos a 8 bits) para minimizar el tamaño de descarga.
- Distribución de la fuente FP32 para fine-tuning o reentrenamiento posterior.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo de pensamiento; el modelo es exclusivamente TTS.

## Casos de uso

- Lectura de contenido web en malayalam: integración del modelo en una página o extensión que convierta artículos y notificaciones en audio directamente en el navegador, aprovechando el tamaño de 826 KB en INT6 y la ejecución en WebAssembly sin backend.
- Accesibilidad para personas con discapacidad visual: lectura por voz de interfaces y documentos en malayalam en el propio dispositivo, sin enviar texto a un servidor y con una descarga inicial mínima.
- Aplicaciones educativas offline: reproducción de lecciones y ejercicios en malayalam en entornos con conectividad limitada, dado que el modelo y el runtime pueden cachearse en el cliente.
- Asistentes de voz embebidos en aplicaciones web: respuestas habladas en malayalam para chatbots o formularios guiados, con latencia baja al ejecutarse localmente y sin coste de inferencia en servidor.
- Prototipado rápido de productos de voz: uso de la fuente FP32 incluida para adaptar la voz o el dominio con datos propios antes de volver a cuantizar a INT6.
- Investigación en TTS compacto: punto de partida para estudiar arquitecturas de síntesis de voz de muy bajo tamaño con residuo de forma de onda aprendido y fonemizadores específicos de idioma.

## Benchmarks y rendimiento

| Cuantización | Bytes del modelo en navegador | MOS predicho (validación) | CER (validación) | MOS predicho (test) | CER (test) |
|---|---:|---:|---:|---:|---:|
| INT6 | 826.164 | 2,275 | 3,46 % | 2,356 | 3,07 % |

Las puntuaciones INT6 se obtuvieron con WebAssembly de Chromium al ritmo calibrado de 0,9473 relativo al modelo bruto. UTMOSv2 se evaluó con 24 clips reservados y las semillas 17, 29 y 43 por split. El CER independiente por ASR se basa en 72 clips reservados cuando están disponibles; el archivo `test/cer.json` de cada variante identifica el reconocedor empleado. Las puntuaciones incluyen el error del reconocedor y usan el split de test específico del idioma. No se han publicado resultados comparativos con otros modelos TTS en la información disponible.

## Requisitos de hardware

- Inferencia en navegador: WebAssembly en Chromium; no requiere GPU dedicada ni VRAM específica más allá de la memoria del navegador.
- Tamaño de descarga del modelo INT6: 826.164 bytes, más el runtime compartido y el frontend de idioma, que se descargan por separado.
- VRAM estimada para inferencia en servidor: no disponible.
- GPU recomendadas: no disponible; el diseño está orientado a ejecución en cliente.
- Despliegue: navegador con WebAssembly (Chromium); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: la model card solo indica el ritmo calibrado de 0,9473 relativo al modelo bruto en WebAssembly de Chromium; no se publican cifras absolutas de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Idioma | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Malayalam Voice · compact (Hansda) | malayalam | 826 KB en INT6 (pesos) | no disponible | Apache 2.0 | Hugging Face, demo web |
| Tiny Voca (n4ze3m) | no disponible | no disponible | no disponible | no disponible | Repositorio GitHub |
| Maya 2 Native (maya-research) | multilingüe (generador del corpus) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otras alternativas de TTS en malayalam en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Calidad de voz modesta: MOS predicho de 2,275 en validación y 2,356 en test, por debajo de lo habitual en sistemas TTS de alta fidelidad.
- Entrenamiento exclusivamente sobre corpus sintético (20 horas generadas por Maya 2 Native), lo que puede limitar la naturalidad y la cobertura de estilos, acentos y hablantes reales.
- Una sola voz (Jahnavi); no admite cambio de hablante ni clonación.
- Un único idioma soportado (malayalam); no hay capacidades multilingües.
- El CER reportado incluye el error del reconocedor ASR empleado, por lo que la tasa real de error de pronunciación puede ser distinta.
- Dependencia de WebAssembly en Chromium para la ruta de inferencia documentada; no se detallan otros navegadores.
- Licencia Apache 2.0 permite uso comercial, pero la model card remite a la atribución y licencia de las fuentes de texto del dataset, que deben verificarse por separado.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones de contexto; al ser un modelo TTS, el riesgo principal es la pronunciación incorrecta de palabras fuera del léxico y del fonemizador entrenado.
- No se especifican requisitos de memoria ni latencia absoluta para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hansda/malayalam-voice-compact
- Dataset de entrenamiento: https://huggingface.co/datasets/Hansda/malayalam-maya2-jahnavi-20h
- Commit del dataset citado: https://huggingface.co/datasets/Hansda/malayalam-maya2-jahnavi-20h/commit/861d3b6650e67c7a0fd63b0db82df604a09a76d7
- Demo en navegador: https://tts.hansda.in/?lang=ml
- Tiny Voca (arquitectura base): https://github.com/n4ze3m/tiny-voca
- Maya 2 Native (generador del corpus): https://huggingface.co/maya-research/maya2-native
