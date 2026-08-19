# cetusian/earshot-wake

## Resumen

El modelo `cetusian/earshot-wake` es un detector de palabra de activación (wake word) extremadamente ligero, diseñado para reconocer la frase "Hey Earshot" en audio crudo de 16 kHz. Desarrollado por Madalin Tatarciuc (cetusian), el modelo tiene solo 44 000 parámetros y un tamaño de 1,2 MB, lo que lo hace apto para ejecutarse en dispositivos de bajo consumo. Su arquitectura integra el cálculo del espectrograma de Mel como capas convolucionales congeladas dentro del grafo, garantizando que el preprocesado de características sea idéntico en entrenamiento e inferencia. El modelo está entrenado desde cero con habla sintética generada por 12 voces Piper a cuatro velocidades, mezclada con ruido de salas (RIRS_NOISES) y ruido ambiental (MUSAN), y se distribuye en formato ONNX bajo licencia Apache-2.0.

La relevancia de este modelo radica en su eficiencia: tarda 1,52 ms por ventana de 1,5 segundos y consume aproximadamente el 0,1 % de un núcleo de CPU en evaluación continua. Esto lo posiciona como una solución viable para asistentes de voz, dispositivos IoT y aplicaciones de activación por voz en tiempo real. Aunque su rendimiento se ha medido en habla de audiolibros (LibriSpeech), el autor advierte que los positivos son sintéticos y no se ha probado con habla real, por lo que se requieren pruebas adicionales en entornos reales antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional pequeña con capas de mel espectrograma congeladas (no se especifica el tipo exacto) |
| Parametros totales | 44 000 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1,5 segundos de audio (24 000 muestras a 16 kHz) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el wake word es en ingles; entrenado con voces sinteticas en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es un clasificador binario de secuencias de audio. La entrada es un tensor de forma `[batch, 24000]` que representa 1,5 segundos de audio muestreado a 16 kHz. El espectrograma de Mel se calcula dentro del grafo mediante convoluciones congeladas, lo que elimina la posibilidad de discrepancia entre las características usadas en entrenamiento e inferencia. La salida es una probabilidad ya pasada por una función sigmoide.

El entrenamiento se realizó desde cero con datos sintéticos: se generaron frases positivas ("Hey Earshot") con 12 voces Piper a cuatro velocidades de habla, y se mezclaron con respuestas de impulso de salas (RIRS_NOISES) y ruido ambiental (MUSAN). Como negativos se usaron muestras de LibriSpeech (habla leída) y hard negatives generados con las mismas voces sintéticas, incluyendo palabras que riman o comparten sufijos con "Earshot" (por ejemplo, "within earshot", "gunshot", "big shot", "clear shot") para reducir falsos positivos. No se menciona el uso de técnicas de alineación como RLHF o DPO, ya que es un modelo de clasificación supervisada.

## Capacidades

- Deteccion de la palabra de activacion "Hey Earshot" en audio crudo de 16 kHz.
- Salida de probabilidad continua (ya aplicada sigmoide) que permite ajustar el umbral de decision.
- Procesamiento en tiempo real con latencia de 1,52 ms por ventana de 1,5 segundos.
- Consumo minimo de recursos: 0,1 % de un nucleo de CPU en evaluacion continua, apto para edge computing.
- Formato ONNX, compatible con multiples runtimes (ONNX Runtime, TensorRT, etc.).
- No incluye capacidades de generacion de texto, tool calling, agentes, vision ni audio mas alla de la deteccion de wake word.

## Casos de uso

- **Activacion por voz en asistentes personales**: el modelo puede ejecutarse de forma continua en un microfono para detectar la frase "Hey Earshot" y activar un asistente de voz. Su bajo consumo permite mantenerlo siempre escuchando en un dispositivo de bajo presupuesto.
- **Control por voz en dispositivos IoT**: integrado en un ESP32 o Raspberry Pi, puede despertar un sistema de domotica sin necesidad de pulsar botones. Su tamano de 1,2 MB y su latencia de 1,52 ms lo hacen adecuado para hardware limitado.
- **Interfaz de voz para aplicaciones de escritorio**: en un ordenador, puede usarse como trigger para aplicaciones de dictado o control por voz, liberando al usuario de usar el teclado.
- **Sistemas de seguridad y presencia**: al detectar una frase especifica, puede activar grabacion, enviar alertas o cambiar el estado de un sistema de vigilancia.
- **Pruebas de concepto en investigacion de keyword spotting**: su arquitectura simple y su entrenamiento sintetico lo convierten en un punto de partida para estudiar tecnicas de data augmentation y hard negative mining.
- **Despliegue en entornos con restricciones de privacidad**: al procesar audio localmente sin conexion a internet, puede usarse en aplicaciones donde no se permite enviar audio a la nube.

## Benchmarks y rendimiento

El autor proporciona mediciones sobre aproximadamente una hora de habla reservada (LibriSpeech) con un umbral que no fue seleccionado a partir de estos datos:

| Umbral | Recall | Falsos positivos / hora | Hard negatives aceptados |
|---|--:|--:|--:|
| 0,5 | 98,5 % | 0,00 | 0,00 % |
| 0,9 | 98,5 % | 0,00 | 0,00 % |
| 0,99 | 95,4 % | 0,00 | 0,00 % |

Se advierte que los datos de evaluacion son audiolibros limpios y que los positivos son sinteticos; por tanto, un rendimiento de cero falsos positivos en esta muestra es necesario pero no suficiente para garantizar el comportamiento en entornos reales con ruido y habla espontanea.

## Requisitos de hardware

- **VRAM estimada**: no requiere GPU; el modelo es de 1,2 MB y puede ejecutarse en CPU.
- **GPU recomendada**: no aplica, aunque puede ejecutarse en GPU si se desea, pero no es necesario.
- **Compatibilidad con hardware de consumo**: cabe en cualquier CPU moderna, incluidos microcontroladores con soporte ONNX (por ejemplo, Raspberry Pi, placas con ARM Cortex-M si se convierte a otro formato).
- **Opciones de despliegue**: ONNX Runtime, TensorRT, OpenVINO, o cualquier runtime que soporte ONNX. No se mencionan integraciones especificas como vLLM o llama.cpp (no aplican a un modelo de audio).
- **Latencia y rendimiento**: 1,52 ms por ventana de 1,5 segundos, lo que equivale a una fraccion minima de un nucleo de CPU en escucha continua.

## Comparativa con modelos similares

No se dispone de informacion comparativa en la documentacion proporcionada. No se han encontrado datos de otros modelos de keyword spotting con los que comparar directamente en terminos de parametros, rendimiento o licencia. Se indica "no disponible".

## Limitaciones y advertencias

- **Entrenamiento exclusivamente con habla sintetica**: todos los ejemplos positivos se generaron con voces Piper; no se ha probado con habla humana real. El rendimiento con acentos, entonaciones o velocidades de habla distintas a las sintetizadas puede degradarse.
- **Falsos positivos en entornos ruidosos**: la evaluacion se realizo con LibriSpeech (audio limpio); no se ha medido el comportamiento con ruido de fondo real, conversaciones superpuestas o musica.
- **Idioma especifico**: el wake word "Hey Earshot" es en ingles; no se ha entrenado ni evaluado para otros idiomas.
- **Alcance limitado**: el modelo solo detecta una frase concreta; no es un sistema de reconocimiento de habla general ni tiene capacidades de comprension del lenguaje.
- **Riesgo de sobreajuste a los datos sinteticos**: los hard negatives se generaron con las mismas voces, lo que podria no cubrir la variabilidad real de habla y ruido.
- **Licencia**: Apache-2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias de rendimiento en produccion; se recomienda validar en el dominio objetivo antes de desplegar.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/cetusian/earshot-wake)
- [Repositorio Earshot (proyecto asociado)](https://github.com/madalintat/Earshot)
- [Perfil del autor en Hugging Face](https://huggingface.co/cetusian)
