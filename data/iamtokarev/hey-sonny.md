# iamtokarev/hey-sonny

## Resumen

El modelo `iamtokarev/hey-sonny` es un clasificador de palabra de activación (wake word) desarrollado por Vasilii Tokarev (iamtokarev) para la frase «hey sonny». Está construido con la librería openWakeWord y se distribuye en formato ONNX, lo que permite una integración sencilla en sistemas de detección de palabra clave y de escucha continua.

El modelo se entrenó sobre voz sintética generada con Piper LibriTTS-R, manteniendo congelados los modelos de melspectrogram y de embeddings de openWakeWord. La entrada del modelo es una ventana de 2,00 segundos de audio a 16 kHz, convertida en una matriz de características de dimensión `(1, 16, 96)`. Se trata de un modelo ligero orientado a ejecutarse en dispositivos de bajo consumo, sin necesidad de GPU.

Según el autor, no se logró alcanzar el objetivo de 0,2 falsos aceptados por hora durante el barrido de umbrales, por lo que el modelo publicado corresponde al mejor checkpoint individual (best_single). Su licencia Apache-2.0 permite uso comercial, aunque el rendimiento en producción debe evaluarse con datos reales antes de su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador openWakeWord sobre características de melspectrogram y embeddings congelados |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de deteccion de palabra de activacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (frase «hey sonny», acento estadounidense) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de clasificadores de openWakeWord. En lugar de entrenar desde cero, el autor utilizó los modelos de extracción de características (melspectrogram y embeddings) ya congelados de openWakeWord, y entrenó únicamente el clasificador final sobre la frase «hey sonny». El audio de entrada se limita a 2,00 s a 16 kHz, y se representa como una matriz de características de `(1, 16, 96)` antes de pasar al clasificador.

El entrenamiento se realizó íntegramente con voz sintética generada mediante Piper LibriTTS-R, que produce muestras de habla inglesa con acento estadounidense. No se dispone de información sobre el número de muestras utilizadas, la duración del entrenamiento ni el tamaño del conjunto de validación. El autor indica que se generaron tres candidatos (checkpoints con promedio de pesos, mejor checkpoint individual y modelo final) y que el mejor checkpoint individual fue el publicado. El barrido de umbrales y las métricas completas se encuentran en los ficheros `metrics.json` y `manifest.json` del repositorio, aunque no se han proporcionado los valores numéricos.

## Capacidades

- Deteccion de la frase «hey sonny» en flujos de audio continuos.
- Disenado para funcionar con la libreria openWakeWord en tiempo real.
- Escucha continua en audio de 16 kHz con ventanas de 2 segundos.
- Compatible con el runtime ONNX y con entornos de despliegue ligeros.
- Integracion directa en pipelines de openWakeWord para wake word personalizado.
- No incluye capacidades de generacion de texto, razonamiento, tool calling, agentes ni soporte multimodales.

## Casos de uso

- Asistente de voz en el hogar: el modelo permite activar un asistente de voz con «hey sonny» sin necesidad de pulsar botones. Al integrarse con openWakeWord, puede ejecutarse en un dispositivo como una Raspberry Pi y activar una interfaz de conversación.
- Domotica y control de electrodomesticos: como parte de un sistema de automatizacion, la deteccion de «hey sonny» puede disparar comandos posteriores, como encender luces o regular la temperatura, en un escenario de manos libres.
- Accesibilidad para personas con movilidad reducida: permite activar funciones de un dispositivo mediante voz, reduciendo la dependencia de interfaces fisicas en entornos de asistencia personal.
- Interfaz de voz para dispositivos IoT: el modelo puede incorporarse en dispositivos conectados de bajo consumo para activar funcionalidades locales sin conexion a Internet, gracias a su peso ligero y su formato ONNX.
- Sistemas de control de acceso por voz: la frase puede funcionar como un identificador de activacion para abrir un sistema protegido, siempre que se combine con una posterior autenticacion de usuario.
- Aplicaciones de realidad virtual o videojuegos: la deteccion de la palabra clave permite al usuario lanzar comandos de voz en entornos inmersivos sin interrumpir la experiencia visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona en la model card que durante el barrido de umbrales ninguno alcanzo el objetivo de 0,2 falsos aceptados por hora, pero no se proporcionan los valores concretos de tasa de falsos aceptados ni de falsos rechazados. Los datos de rendimiento completos deberian consultarse en el archivo `metrics.json` del repositorio de Hugging Face.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no requiere GPU. El modelo puede ejecutarse en CPU.
- Compatible con dispositivos de bajo consumo: al ser un clasificador ONNX con entrada (1, 16, 96), es adecuado para Raspberry Pi, microcontroladores con soporte ONNX Runtime y entornos embebidos.
- Opciones de despliegue: openWakeWord, ONNX Runtime, ejecucion directa con Python.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion detallada sobre benchmarks ni parametros de modelos comparables. El modelo es funcionalmente similar a otros clasificadores de openWakeWord (como los modelos preentrenados para «hey mycroft», «alexa» o «hey jarvis»), pero no se han facilitado datos de rendimiento ni de tamano que permitan establecer una comparacion cuantitativa. Por tanto, no disponible.

## Limitaciones y advertencias

- El umbral optimo no alcanzo el objetivo de 0,2 falsos aceptados por hora, lo que indica un riesgo elevado de activaciones espureas en entornos reales.
- El entrenamiento se realizo exclusivamente con voz sintetica de Piper LibriTTS-R, por lo que el rendimiento puede degradarse con voces reales, ruido de fondo o acentos diferentes al estadounidense.
- El modelo solo reconoce la frase «hey sonny» en ingles, y no es capaz de detectar otras palabras de activacion.
- Al no haberse publicado benchmarks, no se puede garantizar un comportamiento fiable en produccion sin una evaluacion previa con datos propios.
- El uso comercial esta permitido bajo Apache-2.0, pero se recomienda validar la tasa de falsos positivos antes de integrarlo en un producto final.

## Enlaces

- Repositorio del modelo: https://huggingface.co/iamtokarev/hey-sonny
- Perfil del autor en Hugging Face: https://huggingface.co/iamtokarev
- Proyecto relacionado del autor: https://github.com/iamtokarev/sonny
- Libreria openWakeWord: https://github.com/dscripka/openWakeWord
