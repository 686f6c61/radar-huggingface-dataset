# ilyali034/ruT5-base-smart-home

## Resumen

ruT5-base-smart-home es un ajuste fino del modelo encoder-decoder ai-forever/ruT5-base, desarrollado por el usuario ilyali034, que convierte comandos de voz o texto en ruso para el hogar inteligente en una lista JSON de llamadas a funciones compatibles con Home Assistant (`HassTurnOn`, `HassTurnOff`, `HassLightSet`, `HassClimateSetTemperature`, entre otras). El problema que resuelve es la traducción de lenguaje natural a intenciones estructuradas en el dominio domestico, un paso imprescindible para integrar asistentes conversacionales con sistemas de automatizacion del hogar.

El modelo hereda la arquitectura T5 (encoder-decoder) del checkpoint base ruso y se ha entrenado sobre el dataset sintetico RockMan256/needle-ru-opt, con una division 90/5/5 y semilla 42. El resultado es un sistema ligero, con licencia MIT y un rendimiento alto en el conjunto de test (exact match de 0,828 y tasa de JSON válido de 1,000), aunque limitado al idioma ruso y a un catalogo de dispositivos fijo que el modelo no ve en tiempo de inferencia.

Es relevante ahora porque demuestra que un T5 base puede cubrir con solvencia la capa de function calling en un dominio vertical concreto sin necesidad de modelos generativos de gran tamano, lo que abarata el despliegue en entornos domoticos locales. Su principal restriccion practica es que la tokenizer carece de ciertos caracteres (`{ } Q Y Z & é →`), por lo que el autor proporciona un script `inference.py` que gestiona un formato de texto escapado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5) |
| Parametros totales | no disponible (el modelo base es ruT5-base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | no disponible (checkpoint de Hugging Face; el autor no especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de ai-forever/ruT5-base, un T5 encoder-decoder adaptado al ruso, y se ajusta con un objetivo de generacion texto-a-texto: la entrada es `query: <comando>` y la salida es una lista JSON de llamadas a funciones en estilo Home Assistant. No se emplea un formato de prompt con definicion de herramientas, porque el autor indica que la lista de herramientas es identica en todos los ejemplos del dataset y por tanto no se proporciona al modelo; el modelo aprende implicitamente el catalogo de funciones.

El entrenamiento se realizo durante 5 epocas con el optimizador Adafactor, learning rate 3e-4, tamano de lote 16 y precision fp16, sobre el dataset sintetico RockMan256/needle-ru-opt dividido en 90/5/5 (train/val/test) con semilla 42. No se documenta el numero de tokens de entrenamiento ni si hubo fases de RLHF o DPO; el ajuste parece ser puramente supervisado sobre pares comando-JSON. La innovacion tecnica destacable no esta en la arquitectura sino en el manejo del tokenizer: como el vocabulario carece de caracteres necesarios para el JSON, el autor define un formato de texto escapado gestionado por `inference.py`, y advierte explicitamente de no llamar a `generate` directamente sin ese envoltorio.

## Capacidades

- Traduccion de comandos en ruso a llamadas a funciones JSON en estilo Home Assistant (`HassTurnOn`, `HassTurnOff`, `HassLightSet`, `HassClimateSetTemperature` y otras).
- Generacion de multiples llamadas a funciones en una sola respuesta para comandos con varias acciones.
- Extraccion de argumentos estructurados, incluyendo el nombre del dispositivo (`name`) y parametros propios de cada funcion (por ejemplo, temperatura o brillo).
- Salida en JSON canonico validado: la tasa de JSON valido en test es de 1,000.
- Soporte de function calling en el sentido de producir invocaciones estructuradas, aunque el modelo no recibe la lista de herramientas en la entrada.
- Capacidad multilingue limitada: entiende comandos en ruso y emite nombres de dispositivo mayoritariamente en ingles, segun los datos de entrenamiento.
- No se documentan capacidades de vision, audio, modo thinking ni razonamiento multi-paso generico.

## Casos de uso

- Asistente de voz para domotica en ruso: el modelo recibe la transcripcion de un comando ("включи свет на кухне") y devuelve la llamada `HassTurnOn` con el dispositivo correspondiente, que se ejecuta directamente contra la API de Home Assistant.
- Integracion con Home Assistant mediante automatizaciones: el JSON de salida se mapea a servicios nativos, de modo que el modelo actua como capa de intencion entre el reconocimiento de voz y el motor de automatizacion.
- Enrutamiento de comandos multi-accion: para frases que combinan varias ordenes, el modelo genera una lista de llamadas que el orquestador ejecuta en secuencia; es util en escenas como "apaga las luces y baja la calefaccion".
- Control de climatizacion y iluminacion: las funciones `HassLightSet` y `HassClimateSetTemperature` permiten extraer parametros numericos y de estado, utiles en paneles de control por voz.
- Prototipado rapido de skills de hogar inteligente: al ser un modelo base pequeno con licencia MIT, se puede desplegar en local para validar flujos de intencion antes de invertir en un modelo mayor.
- Normalizacion de dispositivos en pipelines de produccion: combinado con una lista real de entidades del hogar, la salida del modelo se puede resolver contra el catalogo de dispositivos por similitud de nombre, mitigando el principal modo de fallo documentado.
- Investigacion sobre function calling en dominios verticales: sirve como referencia de ajuste de un T5 base para tareas de extraccion estructurada con datos sinteticos.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de test (1290 ejemplos):

| Metrica | Valor |
|---|---|
| Exact match (JSON canonico) | 0,828 |
| Tasa de JSON valido | 1,000 |
| F1 de nombres de funcion (micro) | 0,993 |
| Precision de la funcion principal | 0,997 |
| Precision de argumentos | 0,792 |
| F1 de tokens | 0,956 |
| BLEU | 97,3 |
| chrF | 96,9 |

No se han publicado comparaciones con modelos similares en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al derivar de ruT5-base, el checkpoint completo es manejable en GPUs de consumo, aunque el autor no publica cifras.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano del modelo base, una GPU consumer de gama media deberia ser suficiente, pero no se confirma.
- Compatibilidad con GPU de consumo: probable por el tamano del modelo base, sin datos oficiales.
- Opciones de despliegue: el autor solo documenta el uso mediante `snapshot_download` y la clase `SmartHomeModel` de `inference.py`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de function calling para domotica ni con alternativas rusas de tamano comparable.

## Limitaciones y advertencias

- Casi todos los errores se concentran en el argumento `name` (nombre del dispositivo): el modelo no ve la lista de dispositivos del hogar, por lo que elige un nombre cuando el comando no especifica cual se quiere o cuando existen varias denominaciones validas en ingles. Se recomienda combinarlo con el catalogo real de entidades o mapear la salida al nombre conocido mas cercano.
- En comandos con varias acciones, a veces omite la ultima llamada de la lista.
- Los nombres de dispositivo de los datos son mayoritariamente en ingles mientras que los comandos son en ruso, lo que puede generar desajustes en instalaciones con entidades nombradas en ruso.
- Entrenado con datos sinteticos: la calidad sobre frases reales de usuarios puede ser inferior a la reportada en test.
- La tokenizer carece de caracteres necesarios para el JSON (`{ } Q Y Z & é →`); es obligatorio usar el formato escapado de `inference.py` y no llamar a `generate` directamente.
- El modelo esta limitado al ruso y a un catalogo fijo de funciones de Home Assistant; no generaliza a otras herramientas ni idiomas.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento en produccion.
- Riesgo de alucinacion en nombres de dispositivo y argumentos no presentes en el comando original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ilyali034/ruT5-base-smart-home
- Perfil del autor: https://huggingface.co/ilyali034
- Listado de modelos del autor: https://huggingface.co/ilyali034/models
- Modelo base: https://huggingface.co/ai-forever/ruT5-base
- Dataset de entrenamiento: https://huggingface.co/datasets/RockMan256/needle-ru-opt
