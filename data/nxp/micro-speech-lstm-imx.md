# nxp/micro-speech-lstm-imx

## Resumen

MicroSpeech LSTM es una red neuronal recurrente de reconocimiento de palabras clave (keyword spotting) desarrollada por NXP a partir del tutorial MicroSpeech-with-LSTM de TensorFlow tflite-micro. El modelo clasifica fragmentos de audio de 1 segundo a 16 kHz en tres clases: `yes`, `no` y `unknown`, donde cualquier otra palabra, silencio o ruido de fondo se agrupa en la clase `unknown`. Su entrada es un espectrograma de magnitud de forma (1, 49, 257) y su salida es un vector de probabilidades de clase de forma (1, 3).

La relevancia de este modelo radica en su orientacion a la inferencia en el borde (edge AI) sobre hardware embebido de NXP. Con solo 119.923 parametros y 0,023 MOPS, el modelo se ha cuantizado a int8 y compilado para las NPU de los procesadores i.MX 8M Plus (delegado VX), i.MX 93 (NPU Ethos-U65 mediante Vela) y i.MX 95 / i.MX 952 (NPU eIQ Neutron). El fichero int8 resultante ocupa 122 KB, lo que lo hace apto para sistemas con recursos muy limitados.

Se trata de un modelo de proposito muy especifico: no es un modelo de lenguaje ni un asistente conversacional, sino un clasificador de audio de tres clases pensado para integracion en productos con microcontroladores y SoC de aplicacion. El repositorio incluye los scripts de regeneracion (`recipe.sh`, `train_model.py`, `convert_model.py`), un ejemplo de inferencia (`example.py`) y un script de evaluacion (`evaluate.py`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal recurrente con capa LSTM (sobre espectrograma de magnitud) |
| Parametros totales | 119.923 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (ventana de audio fija de 1 segundo, entrada (1, 49, 257)) |
| Tipos de cuantizacion | int8 (entrada int8 / salida int8), cuantizacion post-entrenamiento completa |
| Idiomas soportados | no disponible (entrenado con palabras en ingles: `yes`, `no`) |
| Licencia | MIT (scripts de entrenamiento y tooling); datos de entrenamiento bajo CC BY 4.0 |
| Formato de pesos | LiteRT / TensorFlow Lite (`.tflite`), incluida variante compilada con Vela para Ethos-U65 |
| Entrada | Espectrograma de magnitud (1, 49, 257), int8 |
| Salida | Vector de probabilidades de clase (1, 3), int8 (requiere desquantizacion con escala y punto cero) |
| Clases | `yes`, `no`, `unknown` |
| FLOPS | 0,023 MOPS |
| Tamano de fichero (int8) | 122 KB |
| Framework de origen | TensorFlow / Keras |
| Runtime | eIQ LiteRT (TensorFlow Lite) con delegado NPU correspondiente |

## Arquitectura y entrenamiento

El modelo es una red recurrente basada en LSTM que opera sobre un espectrograma de magnitud extraido de un clip de audio de 1 segundo muestreado a 16 kHz. La arquitectura deriva del tutorial MicroSpeech-with-LSTM de TensorFlow tflite-micro, cuyos autores originales son The TensorFlow Authors. NXP entreno el modelo desde cero mediante `train_model.py` sobre el subconjunto `mini_speech_commands` del dataset Speech Commands (arXiv:1804.03209), agrupando todas las palabras distintas de `yes` y `no` en la clase `unknown`.

Tras el entrenamiento, NXP aplico cuantizacion post-entrenamiento completa a int8 (entrada y salida int8) usando un dataset representativo de 800 espectrogramas extraidos del split de entrenamiento, tal como se documenta en `convert_model.py`. Posteriormente compilo el modelo para distintas NPU: para el i.MX 93 se uso Vela (repositorio `nxp-imx/ethos-u-vela`) con las etiquetas `lf-6.18.20_2.0.0` y `lf-6.18.37_2.1.0`, mapeando el 100 % de los operadores a la NPU Ethos-U65; para el i.MX 95 y el i.MX 952 se convirtio mediante el SDK eIQ Neutron en las versiones 3.1.3, 3.2.1 y 3.2.3. Para el i.MX 8M Plus se ofrece una variante cuantizada que se ejecuta con el delegado VX. El orden de las etiquetas de salida sigue el listado de directorios del dataset en tiempo de entrenamiento: `yes`, `no`, `unknown`.

## Capacidades

- Clasificacion de audio de tres clases: reconoce las palabras `yes` y `no`; cualquier otra palabra, silencio o ruido de fondo se clasifica como `unknown`.
- Procesamiento de espectrogramas de magnitud de clips de 1 segundo a 16 kHz con entrada de forma (1, 49, 257).
- Inferencia cuantizada a int8 con entrada y salida int8, adecuada para aceleracion por NPU.
- Ejecucion en NPU de hardware embebido NXP: delegado VX en i.MX 8M Plus, Ethos-U65 en i.MX 93 y eIQ Neutron en i.MX 95 / i.MX 952.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni capacidades multimodales.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No es un modelo multilingue: las unicas palabras reconocidas (`yes`, `no`) estan en ingles.
- No dispone de modo thinking ni de capacidades de audio generativo; es exclusivamente un clasificador.

## Casos de uso

- Activacion por voz en dispositivos embebidos: el modelo puede integrarse en un producto con SoC i.MX para detectar confirmaciones o negaciones (`yes`/`no`) como disparadores de una accion, con un coste computacional de solo 0,023 MOPS y 122 KB de almacenamiento.
- Reconocimiento de palabras clave de bajo consumo en asistentes de bolsillo: al ejecutarse en la NPU (Ethos-U65 o eIQ Neutron), permite mantener el sistema en un modo de escucha de bajo consumo sin despertar el nucleo de aplicacion.
- Interfaces de voz para electrodomesticos y equipos industriales: con dos comandos fijos (`yes`/`no`) es adecuado para confirmaciones binarias en paneles de control, maquinaria o dispositivos de acceso.
- Control por voz en wearables y dispositivos IoT alimentados por bateria: el tamano reducido del modelo y su formato int8 permiten desplegarlo en plataformas con memoria y energia limitadas.
- Preprocesado de voz en pipelines de domotica: clasificar respuestas afirmativas o negativas como primer filtro antes de enviar el audio a un servicio en la nube, reduciendo el consumo de ancho de banda y las preocupaciones de privacidad.
- Prototipado y evaluacion de NPU NXP: el repositorio incluye scripts de entrenamiento, conversion, ejemplo de inferencia y evaluacion, por lo que sirve como referencia para validar el flujo LiteRT + delegado NPU en i.MX 8M Plus, i.MX 93, i.MX 95 e i.MX 952.
- Educacion e investigacion en keyword spotting: al ser un modelo pequeno y reproducible desde cero, es util para experimentar con cuantizacion int8 y despliegue en hardware embebido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido convencional de GPU; el modelo ocupa 122 KB en formato int8 y esta disenado para memoria de sistema de SoC embebidos.
- GPU recomendadas: no aplica; el modelo esta orientado a NPU integradas en procesadores NXP (VX en i.MX 8M Plus, Ethos-U65 en i.MX 93, eIQ Neutron en i.MX 95 / i.MX 952).
- Compatibilidad con GPU de consumo: no aplica; no es un modelo pensado para ejecutarse en RTX 4090, A100, H100 ni similares.
- Opciones de despliegue: eIQ LiteRT (TensorFlow Lite) con el delegado NPU correspondiente a cada plataforma. Se proporcionan assets precompilados para i.MX 8M Plus, i.MX 93 (BSP lf-6.18.20_2.0.0 y lf-6.18.37_2.1.0) e i.MX 95 (Neutron SDK v3.1.3); el manifiesto `release_manifest.json` recoge las configuraciones soportadas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la informacion proporcionada que permitan contrastar este modelo con alternativas de la misma categoria. Como referencia cualitativa, el modelo deriva del tutorial MicroSpeech-with-LSTM de TensorFlow tflite-micro, que constituye su antecesor directo, pero no se han facilitado cifras comparativas de rendimiento, contexto o licencia frente a otros modelos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MicroSpeech LSTM (NXP) | 119.923 | no aplica (audio de 1 s) | MIT | Hugging Face (nxp/micro-speech-lstm-imx) |
| MicroSpeech-with-LSTM (TensorFlow tflite-micro) | no disponible | no aplica | MIT (scripts) | Tutorial de TensorFlow |
| Alternativas de keyword spotting | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo reconoce dos palabras (`yes` y `no`); cualquier otro termino se clasifica como `unknown`, lo que limita su uso a confirmaciones binarias.
- Esta entrenado exclusivamente con palabras en ingles; no se ha validado su comportamiento con otros idiomas, y no se declaran idiomas soportados.
- Al ser un clasificador de audio de tres clases, puede producir falsos positivos o falsos negativos en entornos con ruido, acentos o condiciones acusticas distintas a las del dataset de entrenamiento.
- El dataset de entrenamiento (Speech Commands) esta bajo licencia CC BY 4.0, por lo que su uso derivado debe respetar las condiciones de atribucion de dicha licencia.
- La licencia del modelo es MIT, lo que permite uso comercial, pero los scripts de entrenamiento originales y el tooling de TensorFlow estan sujetos a sus propias licencias (MIT) y los datos a CC BY 4.0.
- El modelo esta compilado para plataformas NXP concretas; su ejecucion fuera de esas NPU o fuera del runtime eIQ LiteRT puede requerir conversion adicional y no esta garantizada.
- La salida es int8 y requiere desquantizacion con la escala y el punto cero del tensor de salida; un uso incorrecto de estos parametros produce probabilidades erroneas.
- No se dispone de informacion sobre sesgos especificos, tasas de alucinacion (no aplica a un clasificador) ni limites de contexto mas alla de la ventana fija de 1 segundo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nxp/micro-speech-lstm-imx
- Tutorial original MicroSpeech-with-LSTM de TensorFlow tflite-micro: https://colab.research.google.com/github/tensorflow/tflite-micro/blob/main/third_party/xtensa/examples/micro_speech_lstm/train/micro_speech_with_lstm_op.ipynb
- Dataset Speech Commands (arXiv:1804.03209): https://arxiv.org/abs/1804.03209
- Licencia Creative Commons BY 4.0 del dataset: https://creativecommons.org/licenses/by/4.0/
- Repositorio Vela de NXP para Ethos-U: https://github.com/nxp-imx/ethos-u-vela
- Productos NXP Semiconductors: https://www.nxp.com/products:PCPRODCAT
- Asset i.MX 8M Plus cuantizado: https://huggingface.co/nxp/micro-speech-lstm-imx/blob/main/assets/imx8mplus/microspeech-lstm_quant_int8.tflite
- Asset i.MX 93 precompilado (BSP lf-6.18.20_2.0.0): https://huggingface.co/nxp/micro-speech-lstm-imx/blob/main/assets/imx93/lf-6.18.20_2.0.0/microspeech-lstm_quant_int8_vela.tflite
- Asset i.MX 93 precompilado (BSP lf-6.18.37_2.1.0): https://huggingface.co/nxp/micro-speech-lstm-imx/blob/main/assets/imx93/lf-6.18.37_2.1.0/microspeech-lstm_quant_int8_vela.tflite
- Asset i.MX 95 precompilado (Neutron SDK v3.1.3): https://huggingface.co/nxp/micro-speech-lstm-imx/blob/main/assets/imx95/3.1.3/microspeech-lstm_quant_int8_converted.tflite
