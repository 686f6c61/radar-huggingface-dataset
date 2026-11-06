# datatab/hcawn-ha

## Resumen

hCAWN-HA es un modelo de lenguaje extremadamente pequeno (5,7 millones de parametros) desarrollado por datatab y especializado en una unica tarea: convertir una frase en lenguaje natural en una llamada JSON de accion para Home Assistant. Resuelve el problema de la interpretacion de comandos de domotica de forma local, sin GPU, sin nube y sin enviar texto fuera del hogar. Es relevante porque los modelos que se usan hoy para esta tarea suelen tener entre 0,5B y 1B parametros (unas 90-170 veces mas grandes), mientras que este cabe en 4,1 MB (int4) o 6,0 MB (int8) y corre en una CPU convencional.

El modelo se apoya en una arquitectura propia denominada hCAWN (descrita por el autor como "byte-level"), afinada a partir de `datatab/hcawn-fc7` sobre el dataset `acon96/Home-Assistant-Requests-V2`. No es un transformer generico cargable con `transformers` ni `llama.cpp`: los pesos usan un formato binario propietario del motor hCAWN.

La version `hcawn-ha` es un ajuste fino orientado a las 13 acciones de Home Assistant, con soporte de reconocimiento de intencion, function calling y tool calling. El modelo no se plantea como uso aislado: el autor recomienda envolverlo en un pipeline con division de comandos, comprobacion de direccion, validacion de valores y umbral de confianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hCAWN (byte-level, arquitectura propia del autor) |
| Parametros totales | 5,7 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (6,0 MB), int4 empaquetado con capas sensibles en int8 (4,1 MB) |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | binario propietario del motor hCAWN (`int8.bin`, `int4.bin`); no compatible con safetensors, GGUF ni transformers |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura propia llamada hCAWN, descrita por el autor con la etiqueta "byte-level" y orientada a modelos de lenguaje pequenos. No se dispone de informacion publica sobre el numero de capas, dimension del estado oculto, mecanismo de atencion ni detalles internos del bloque. Los pesos se distribuyen en un formato binario especifico del motor hCAWN, lo que implica que la inferencia requiere dicho motor y no es posible cargarlos con las herramientas habituales del ecosistema (transformers, llama.cpp, vLLM).

El ajuste fino parte del modelo base `datatab/hcawn-fc7` y se entrena sobre `acon96/Home-Assistant-Requests-V2`, un dataset publico de peticiones para Home Assistant. El autor menciona que anadio formulaciones coincidentes con los tests oficiales de Home Assistant tras observar fallos en ellos, lo que supone un riesgo de contaminacion en esa evaluacion concreta. No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa. La innovacion principal es la relacion tamano/capacidad: 5,7 M de parametros para una tarea de clasificacion de intenciones con extraccion de entidades (dispositivo, valores de brillo, color, temperatura, etc.).

## Capacidades

- Reconocimiento de intencion sobre comandos de domotica en ingles y emision de una llamada JSON para una de 13 acciones de Home Assistant.
- Acciones soportadas: `HassTurnOn`, `HassTurnOff`, `HassToggle`, `HassLightSet` (brillo y color), `HassClimateSetTemperature`, `HassHumidifierSetpoint`, `HassListAddItem`, `HassVacuumStart`, `HassVacuumReturnToBase`, `HassMediaPause`, `HassMediaUnpause`, `HassMediaNext`, `HassMediaPrevious`.
- Extraccion del dispositivo tal como lo nombra el usuario ("kitchen lights"), sin resolver el entity id; la resolucion contra el registro real del hogar la hace un componente externo.
- Soporte de function calling y tool calling en el sentido de que la salida es una llamada estructurada a una herramienta.
- Puntuacion de confianza por byte generado, que permite umbrales de seguridad y peticiones de aclaracion.
- Procesamiento de varias ordenes en una misma frase mediante division previa de comandos (componente externo al modelo).
- Inferencia en CPU, offline y sin cuenta ni nube.
- No soporta vision, audio, ni modo de razonamiento extendido.

## Casos de uso

- Control por voz local de luces y enchufes: el modelo recibe la transcripcion de un asistente de voz domestico y devuelve `HassTurnOn`/`HassTurnOff`/`HassToggle`; al correr en CPU y offline, el audio no sale de la red local.
- Ajuste de brillo y color: frases como "set the bedroom lamp to purple" o "dim the living room floor lamp to 30 percent" se traducen en `HassLightSet` con los valores extraidos, validados despues contra un rango 0-100 y una lista de colores reales.
- Termostatos y humidificadores: "set the thermostat to 23 degrees" se convierte en `HassClimateSetTemperature`; la validacion posterior comprueba que el valor sea plausible antes de ejecutar.
- Listas de la compra y tareas: "add milk to the shopping list" se mapea a `HassListAddItem`, util en asistentes de cocina con pantalla o altavoz.
- Automatizacion de media y limpieza: "pause the living room speaker and start the robot vacuum" se divide en dos comandos y se resuelve en `HassMediaPause` y `HassVacuumStart`.
- Puertas y cerraduras con confirmacion obligatoria: el pipeline del autor nunca ejecuta `lock`/`unlock` ni cierre de garaje sin una confirmacion explicita, lo que permite integrar el modelo en flujos sensibles con un paso de "si/no".
- Despliegue en hardware embebido: Raspberry Pi, mini-PC o incluso un contenedor junto al propio Home Assistant, sin GPU ni dependencias de servicio externo.

## Benchmarks y rendimiento

Los numeros que siguen corresponden al modelo junto con las comprobaciones y el resolver que lo rodean, segun el autor. Donde hay dos cifras se indica correcto / incorrecto.

| Test | int8.bin | int4.bin |
|---|---|---|
| Modelo solo, conjunto propio de 500 peticiones (fp32: 95,2 %) | 95,0 % | 94,8 % |
| Pipeline completo, varias ordenes por frase | 92,6 % | 92,6 % |
| Tests oficiales de intenciones de Home Assistant (144 frases) | 92,4 % / 0,7 % | 91,0 % / 2,1 % |
| ... con comprobacion de confianza (umbral 0,7) | 91,7 % / 0,0 % | 90,3 % / 0,7 % |
| Test set de acon96 Home-Assistant-Requests-V2 | 89,7 % / 1,8 % | 89,1 % / 1,4 % |
| ... con comprobacion de confianza (umbral 0,7) | 87,0 % / 1,3 % | 84,9 % / 1,2 % |
| Casa sintetica con habitaciones y grupos | 92-96 % | 92-96 % |

El autor senala que el conjunto de 500 peticiones es held-out pero del mismo tipo de texto que el entrenamiento, que los tests oficiales de Home Assistant estan contaminados por anadidos posteriores al entrenamiento y que la cifra mas fiable es el 89,7 % sobre el test set de acon96. El ruido estimado es de aproximadamente ±1,3 puntos en 500 filas y mayor en el conjunto de 144 frases. No se publican comparaciones de accuracy con modelos de 0,5B-1B porque se miden sobre conjuntos distintos.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo ocupa 4,1 MB (int4) o 6,0 MB (int8) en disco y se ejecuta en CPU.
- GPU recomendadas: ninguna; el motor hCAWN esta pensado para CPU.
- Cabe en cualquier GPU consumer, pero no es el objetivo de despliegue.
- Hardware objetivo: CPU convencional, incluidos mini-PC y placas tipo Raspberry Pi, segun el autor.
- Opciones de despliegue: motor hCAWN con los ficheros `int8.bin` o `int4.bin`; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| hCAWN-HA (este) | 5,7 M | no disponible | Comandos Home Assistant, 13 acciones | CC-BY-4.0 | binario hCAWN |
| Modelos usados habitualmente para esta tarea (sin nombrar) | 0,5B-1B o mas | no disponible | Function calling / intenciones | variable | safetensors, GGUF |
| datatab/hcawn-fc7 | no disponible | no disponible | Function calling generico (modelo base) | no disponible | binario hCAWN |

El autor indica que los modelos empleados hoy para esta tarea son entre 90 y 170 veces mas grandes, pero no ofrece nombres ni comparaciones de accuracy por usar conjuntos de test distintos. La ventaja diferencial de hCAWN-HA es el tamano y la ejecucion en CPU offline; la desventaja es el ecosistema cerrado y el idioma unico.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues.
- Dominio muy restringido: unicamente 13 acciones de Home Assistant; cualquier otra tarea queda fuera.
- La salida depende de un resolver externo que traduzca las palabras del usuario a entity ids reales del hogar.
- Pesos en formato binario propietario: no se pueden cargar con transformers, llama.cpp ni otras herramientas estandar, lo que limita la portabilidad y el ajuste fino por terceros.
- Riesgo de contaminacion en los tests oficiales de Home Assistant reconocido por el autor; la cifra mas creible es el 89,7 % sobre el test set de acon96.
- El modelo no debe usarse aislado en acciones sensibles (cerraduras, puertas de garaje): el pipeline recomendado exige confirmacion explicita.
- La comprobacion de confianza reduce las acciones erroneas a costa de aumentar las peticiones de aclaracion.
- No se documentan sesgos especificos ni tasas de alucinacion; al ser un modelo de clasificacion con salida estructurada, el riesgo principal es elegir la accion equivocada o un valor invalido, mitigado por las validaciones del pipeline.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; conviene revisar los terminos exactos antes de integrarlo en un producto.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; proyecto muy reciente (creado el 2026-11-06) y sin validacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/datatab/hcawn-ha
- Modelo base: https://huggingface.co/datatab/hcawn-fc7
- Demo en Spaces: https://huggingface.co/spaces/datatab/hcawn-ha-demo
- Web del autor: https://cawnai.com
- Perfil del autor en X: https://x.com/DejanCugalj
- Dataset de entrenamiento: https://huggingface.co/datasets/acon96/Home-Assistant-Requests-V2
