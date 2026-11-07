# okasi/piper-turkish-99eren99-voice-0-onnx-q8

## Resumen

Este repositorio contiene una conversión cuantizada a INT8 del modelo de síntesis de voz Piper para turco, concretamente la voz identificada como `voice-0` del autor 99eren99. Piper es un sistema de texto a voz basado en VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), diseñado para inferencia local eficiente, y esta versión reduce el fichero acústico de 60,57 MiB a 16,29 MiB mediante cuantización por canal de 116 tensores de pesos. El modelo está pensado para ejecutarse tanto en servidor como en navegador mediante ONNX Runtime Web.

La relevancia de esta publicación es fundamentalmente práctica: permite desplegar TTS en turco en entornos con recursos limitados, incluido el navegador con WebAssembly y cuatro hilos, sin necesidad de GPU. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetado optimizado del checkpoint original de 99eren99, orientado a reducir el peso y el tiempo de carga manteniendo una calidad de audio aceptable.

La información disponible es limitada: no se detallan los datos de entrenamiento originales, no se especifica licencia y el repositorio tiene un tamaño declarado de 0,0 GB pese a contener los ficheros descritos. La model card del autor se centra en el proceso de conversión y en un benchmark de navegador con métricas de WER medidas mediante Whisper large-v3-turbo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (texto a voz extremo a extremo, según el pipeline Piper; detalles del checkpoint original no disponibles) |
| Parametros totales | no disponible (116 tensores de pesos cuantizados; recuento de parámetros no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS; procesa fonemas, no ventanas de contexto) |
| Tipos de cuantizacion | INT8 por canal (Q8), desquantización a coma flotante en inferencia |
| Idiomas soportados | Turco (tr) |
| Licencia | no disponible (la model card upstream no declara licencia) |
| Formato de pesos | ONNX (`.onnx`) + configuración JSON de Piper |
| Tamano del fichero acustico | 16,29 MiB (frente a 60,57 MiB del original) |
| Entradas/salidas | Idénticas al grafo Piper original (fonemas de entrada, audio de salida) |
| Fonemizador requerido | eSpeak NG (phonemizer de Piper) |
| Runtime soportado | ONNX Runtime Web (probado con 1.31.1), inferencia en navegador con WASM |

## Arquitectura y entrenamiento

El modelo subyacente es una voz Piper, que emplea la arquitectura VITS: un generador condicionado por texto que combina un encoder de fonemas, un prior variacional, un decoder basado en flujos y un discriminador adversarial durante el entrenamiento. Piper empaqueta estos modelos en ONNX para inferencia ligera y local. Esta publicación no entrena nada: toma el checkpoint fijado de `99eren99/piper-turkish-tts` (commit `885d69c9...`) y aplica cuantización Q8 por canal sobre 116 tensores de pesos, manteniendo intactas las entradas y salidas del grafo original.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus turco, ni si hubo ajuste fino con RLHF o DPO; la model card upstream no lo detalla. La innovación técnica aquí es exclusivamente de despliegue: la cuantización reduce el tamaño del fichero en un 73 % y permite ejecución en navegador con ONNX Runtime Web, manteniendo el fonemizador eSpeak NG como dependencia externa para la conversión de texto a fonemas.

## Capacidades

- Síntesis de voz en turco a partir de texto, con salida de audio generada por el decoder VITS.
- Conversión de texto a fonemas mediante eSpeak NG, requerida para la inferencia.
- Ejecución en navegador mediante ONNX Runtime Web con WASM multihilo (probado con cuatro hilos).
- Ejecución local en CPU sin GPU, gracias al tamaño reducido del modelo cuantizado.
- Generación determinista o con semilla de ruido fija (la model card menciona ejecuciones con semillas de ruido fijas para comparación).
- No soporta tool calling, function calling, agentes, visión, audio de entrada ni razonamiento multi-paso; es un modelo estrictamente de texto a voz.
- Multilingüismo: únicamente turco.

## Casos de uso

- Lectura por voz de artículos y documentos en turco dentro de aplicaciones web: el modelo puede cargarse en el navegador con ONNX Runtime Web y sintetizar párrafos completos; en el benchmark del autor, un pasaje de 128 palabras se generó en 2,79 s tras una carga de 1,59-1,77 s.
- Asistentes de accesibilidad para usuarios turcoparlantes: integración en lectores de pantalla o extensiones que conviertan contenido textual en audio sin depender de servicios en la nube.
- Generación de avisos y notificaciones de voz en aplicaciones móviles o de escritorio: el tamaño de 16,29 MiB permite empaquetarlo dentro de la aplicación y evitar llamadas a API externas.
- Prototipado de interfaces conversacionales en turco: útil para pruebas de UX donde se necesita una voz local rápida y ligera antes de invertir en un TTS de mayor calidad.
- Sistemas de anuncios públicos o kioscos con conectividad limitada: la inferencia en CPU y el modelo reducido permiten desplegarlo en dispositivos de bajo consumo.
- Evaluación comparativa de calidad TTS: el fichero `benchmark.json` incluido proporciona texto de referencia, tiempos y transcripciones, lo que facilita reproducir la medición de WER con Whisper.
- Educación y aprendizaje de turco: generación de audio para ejercicios de pronunciación o dictado con una voz consistente y local.

## Benchmarks y rendimiento

Los únicos datos publicados provienen del benchmark en navegador del autor: Chromium 143 sobre Apple M1 Pro, ONNX Runtime Web 1.31.1 con cuatro hilos WASM, temporizador iniciado tras la carga del modelo y del fonemizador, y WER calculado con Whisper large-v3-turbo FP16.

| Muestra | Palabras del pasaje | Generación | Carga | WER (Whisper Turbo) |
|---|---:|---:|---:|---:|
| original-run | 128 | 2,79 s | 1,77 s | 6,20 % (8/129) |
| matched-seed | 128 | 2,79 s | 1,59 s | 4,65 % (6/129) |

No se han publicado resultados de benchmarks estándar (MOS, MCD, etc.) ni comparaciones con otras voces Piper en la información disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia está pensada para CPU. El fichero acústico ocupa 16,29 MiB en disco y en memoria.
- GPU recomendadas: no aplica; el modelo está optimizado para CPU y navegador.
- Cabe en cualquier GPU consumer y en CPU convencional; también en navegador mediante WASM.
- Opciones de despliegue: ONNX Runtime Web (probado), Piper (runtime nativo), y cualquier runtime compatible con ONNX. Requiere eSpeak NG como fonemizador.
- Latencia y throughput: en el benchmark del autor, 2,79 s para 128 palabras (aproximadamente 46 palabras por segundo de audio generado) en un Apple M1 Pro con cuatro hilos WASM; la carga inicial fue de 1,59-1,77 s. No hay datos de throughput en otras plataformas.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| okasi/piper-turkish-99eren99-voice-0-onnx-q8 | Turco | VITS/Piper (Q8 ONNX) | 16,29 MiB | no aplica | no disponible | Hugging Face |
| 99eren99/piper-turkish-tts | Turco | VITS/Piper (ONNX original) | 60,57 MiB | no aplica | no disponible | Hugging Face |
| Otras voces Piper turcas | Turco | VITS/Piper | variable | no aplica | variable | Hugging Face / PiperHub |

La comparación principal es con el checkpoint original del que deriva: misma arquitectura y voz, pero un 73 % menos de tamaño. No se dispone de datos de calidad comparativa (MOS) entre ambas versiones ni frente a otras voces Piper turcas.

## Limitaciones y advertencias

- La licencia no está declarada ni en este repositorio ni en la model card upstream, lo que impide confirmar si el uso comercial está permitido; es un riesgo legal relevante para producción.
- El modelo solo sintetiza turco; no admite otros idiomas.
- Requiere eSpeak NG para la fonemización, una dependencia externa que debe desplegarse junto al modelo.
- La cuantización INT8 puede introducir degradación de calidad respecto al original; no se han publicado métricas subjetivas (MOS) que lo cuantifiquen.
- El WER medido con Whisper (4,65-6,20 %) es una métrica de inteligibilidad aproximada, no una medida directa de naturalidad; Whisper puede introducir errores propios.
- El benchmark se limita a una plataforma (Apple M1 Pro, Chromium 143) y a un pasaje de 128 palabras; el rendimiento en otros entornos puede diferir.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede producir pronunciaciones incorrectas en palabras fuera del dominio de entrenamiento o nombres propios.
- El repositorio declara un tamaño de 0,0 GB, lo que puede indicar que los ficheros no están correctamente indexados o que la información de la API es incompleta.
- No hay información sobre sesgos del corpus de entrenamiento ni sobre la diversidad de voces o acentos turcos cubiertos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/okasi/piper-turkish-99eren99-voice-0-onnx-q8
- Modelo base: https://huggingface.co/99eren99/piper-turkish-tts
- Model card upstream fijada: https://huggingface.co/99eren99/piper-turkish-tts/blob/885d69c91c4a83f49467f152690460e26b818d0b/README.md
- Ficha en PiperHub: https://piperhub.org/model/turkish-piper-tts-model/
- Proyecto Piper TTS: no disponible en la información proporcionada
- Paper de VITS: no disponible en la información proporcionada
