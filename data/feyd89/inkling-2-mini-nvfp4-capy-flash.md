# Feyd89/Inkling-2-Mini-NVFP4-capy-flash

## Resumen

Inkling-2-Mini-NVFP4-capy-flash es un artefacto listo para servir del modelo Inkling 2 Mini de Thinking Machines, empaquetado por el usuario Feyd89 para el motor de inferencia capy-flash. No se trata de un modelo nuevo ni de un reentrenamiento: es una conversión de formato del checkpoint original que preserva los pesos cuantizados tal cual fueron publicados (expertos enrutados en NVFP4 y MXFP8, pesos densos en BF16) y los reorganiza en un único fichero `.ninfer` que permite ejecutar el modelo completo en dos GPU consumer de 16 GB en paralelo de tensor.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 24 capas, del que este artefacto conserva la cuantización original: las capas 0-19 llevan los expertos enrutados en NVFP4 con escalas E4M3, las capas 20-23 en MXFP8, y atención, gates, convoluciones, cabeza de salida y embeddings en BF16. La ventana de contexto alcanza 253.952 tokens, y el paquete incluye un drafter DSpark (componente `mtp`) para decodificación especulativa que ha sido ajustado finamente por el autor del artefacto.

Su relevancia práctica es que demuestra que un MoE de esta categoría puede servirse con latencias de decodificación de entre 150 y 275 tokens por segundo en dos RTX 5070 Ti, algo impensable con los formatos de referencia. El artefacto expone endpoints compatibles con OpenAI y Anthropic a través de capy-flash v0.16.0 o superior, lo que facilita su integración en aplicaciones existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (24 capas; expertos enrutados en capas 0-23) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 253.952 tokens (configurable a la baja con `NINFER_MAX_CONTEXT`) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados, capas 0-19), MXFP8 (expertos enrutados, capas 20-23), BF16 (densos y drafter) |
| Idiomas soportados | no disponible (el drafter se ajustó con datos en italiano e inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (fichero único de 19.693.882.100 bytes) |

## Arquitectura y entrenamiento

El modelo base Inkling 2 Mini es un transformer de mezcla de expertos con 24 capas, en el que las capas 0-19 alojan expertos enrutados cuantizados en NVFP4 (códigos y escalas E4M3 copiados del checkpoint original) y las capas 20-23 en MXFP8, también copiados literalmente. Los pesos densos —atención, gates, convoluciones, cabeza de salida y embeddings de tokens— permanecen en BF16. Este artefacto no aplica cuantización adicional: solo cambia el empaquetado, no los valores.

La innovación destacable de este paquete es el drafter DSpark del componente `mtp`, que el autor ha ajustado finamente para mejorar la aceptación de propuestas especulativas. El ajuste se realizó sobre 1.320 prompts (500 en italiano de alpaca-gpt4-it y evol-instruct-it, 500 en inglés de UltraChat, 150 peticiones de código en italiano y 150 en inglés de evol-instruct-it y Magicoder OSS-Instruct, más 20 turnos de una sesión de agente de código), generando 1,16 millones de posiciones. El entrenamiento consistió en una época con AdamW a tasa de aprendizaje 3e-5, calculando la entropía cruzada de cada una de las siete propuestas del drafter contra el token más probable del modelo en cada posición, con los embeddings y la cabeza de salida del modelo congelados. El texto generado es idéntico con o sin drafter a temperatura 0 (34 de 34 respuestas comparadas).

## Capacidades

- Generación de texto autorregresiva con ventana de contexto de hasta 253.952 tokens.
- Decodificación especulativa mediante drafter DSpark ajustado, con hasta tres tokens propuestos por ronda (`--draft-tokens 3`).
- Servido de endpoints compatibles con las APIs de OpenAI y Anthropic a través de capy-flash.
- Capacidad multilingüe: el drafter fue ajustado con datos en italiano e inglés, lo que sugiere soporte para ambos idiomas, aunque la model card no detalla la lista completa de idiomas del modelo base.
- Ejecución en paralelo de tensor (`--tp 2`) sobre dos GPU.
- Modo LoopCD adaptativo (`--loopcd adaptive`) para muestreo con temperatura 1.
- Capacidades específicas del modelo base (razonamiento, código, tool calling, agentes) no documentadas en la información disponible de este artefacto.

## Casos de uso

- Despliegue de inferencia en hardware consumer: dos RTX 5070 Ti de 16 GB permiten servir el modelo completo con 15,2 GiB de VRAM por tarjeta (14,2 GiB sin drafter), lo que hace viable ejecutar un MoE de esta categoría en estaciones de trabajo con GPU de gama alta consumer en lugar de centros de datos.
- Sustitución de endpoints OpenAI o Anthropic en aplicaciones existentes: capy-flash expone APIs compatibles en el puerto 8080, de modo que un cliente que ya consuma esos formatos puede apuntar al servidor local sin cambios de código.
- Procesamiento de documentos largos: con 253.952 tokens de contexto y bloques de prefill de 2.048 tokens, el modelo puede ingerir corpus extensos (manuales, expedientes, bases de código) en una sola petición.
- Generación de código interactiva: el drafter ajustado alcanza 275,3 tokens/s en prompts de código en inglés y 238,8 tokens/s en código en italiano a temperatura 0, adecuado para asistentes de autocompletado en IDE.
- Atención al cliente multilingüe en italiano e inglés: la mejora del drafter en italiano (+16 % a temperatura 0, +23 % con LoopCD adaptativo) reduce la latencia percibida en conversaciones multi-turno en ese idioma.
- Prototipado e investigación en cuantización: el artefacto incluye el informe del conversor y permite reconstruir la versión anterior desde el checkpoint en CPU con `python3 -m tools.convert`, lo que facilita reproducir experimentos de cuantización NVFP4/MXFP8.
- Sesiones de agente de código: el drafter fue entrenado también con 20 turnos de una sesión de agente, y en posiciones retenidas emite 3,43 tokens por ronda con tres propuestas, lo que reduce el número de pasos de decodificación en flujos multi-paso.

## Benchmarks y rendimiento

Rendimiento medido en Ryzen 9 9900X con 2 x RTX 5070 Ti 16 GB, capy-flash v0.16.0, una petición a la vez, 21 de noviembre de 2026 (tokens/s):

| Escenario | Sin drafter | Con drafter |
|---|---|---|
| Decode, prompt de 68 tokens | 127,5 | 149,0 |
| Decode a 12.800 tokens de contexto | 112,8 | 166,6 |
| Decode, tarea de código | 127,6 | 193,9 |
| Decode a 99.311 tokens de contexto | 78,3 | 78,3 |

Rendimiento del drafter ajustado frente al del checkpoint (capy-flash v0.16.5, `--tp 2 --spec mtp --draft-tokens 3 --embedding-host`, 253.952 tokens de contexto, 26 de noviembre de 2026, media de 3 arranques, prompts no usados en entrenamiento):

| Prompts | Temperatura 0 | Muestreo (temp. 1) | LoopCD adaptativo, temp. 0 |
|---|---|---|---|
| Italiano | 185,9 → 215,3 (+16 %) | 163,3 → 188,9 (+16 %) | 151,4 → 186,4 (+23 %) |
| Inglés | 221,8 → 219,8 (−0,9 %) | 215,0 → 216,2 (+0,6 %) | 193,9 → 191,2 (−1,4 %) |
| Código, italiano | 203,0 → 238,8 (+18 %) | 167,5 → 186,9 (+12 %) | 168,0 → 181,6 (+8 %) |
| Código, inglés | 271,9 → 275,3 (+1,3 %) | 255,9 → 253,6 (−0,9 %) | 271,7 → 270,7 (−0,4 %) |

Tokens emitidos por ronda con tres propuestas sobre posiciones retenidas (teacher forcing, 44 prompts): italiano 1,70 → 1,88; inglés 2,04 → 2,08; código italiano 1,90 → 2,02; código inglés 2,67 → 2,67; turnos de agente 3,38 → 3,43.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM: 15,2 GiB por tarjeta con drafter activo; 14,2 GiB con `NINFER_DRAFTER=0`. El contexto se reduce con `NINFER_MAX_CONTEXT`, lo que disminuye también el consumo.
- GPU: dos GPU `sm_120` con 16 GB de VRAM cada una; probado en dos RTX 5070 Ti. No se requiere peer-to-peer entre tarjetas.
- Cabe en GPU consumer: sí, en dos RTX 5070 Ti (o modelos equivalentes de la generación Blackwell con 16 GB).
- Sistema operativo y drivers: Linux x86_64 y driver NVIDIA con soporte para CUDA 13.1.
- Software: capy-flash v0.16.0 o superior; instalación mediante `install.sh` del repositorio oficial.
- Despliegue: servidor capy-flash con endpoints compatibles con OpenAI y Anthropic en el puerto 8080; prefill en bloques de 2.048 tokens.
- Throughput medido: entre 78,3 tokens/s (contexto de 99.311 tokens) y 275,3 tokens/s (código en inglés con drafter ajustado); prefill con prompts de 512, 4.096, 12.800 y 99.311 tokens (valores parcialmente disponibles en la model card).
- RAM y CPU: sin requisitos especiales según el autor.

## Comparativa con modelos similares

No se dispone de datos de otros artefactos comparables en la información proporcionada. La comparación más directa es con el propio checkpoint de referencia y con la revisión anterior del repositorio:

| Versión | Drafter | Formato | Contexto | Licencia |
|---|---|---|---|---|
| Este artefacto (revisión actual) | DSpark ajustado finamente (BF16) | `.ninfer`, 19,69 GB | 253.952 tokens | Apache 2.0 |
| Revisión `7c6104e` | Drafter del checkpoint original | `.ninfer` | 253.952 tokens | Apache 2.0 |
| Checkpoint `thinkingmachines/Inkling-2-Mini` | Drafter original | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las salidas de capy-flash no son bit-idénticas a las de la implementación de referencia: el token más probable coincide en el 98,1 % de las posiciones, con diferencias atribuibles al redondeo BF16 entre órdenes de suma válidos.
- El artefacto está atado a capy-flash v0.16.0 o superior, Linux x86_64, CUDA 13.1 y GPU `sm_120`; no es portable a otros motores de inferencia ni a GPU de arquitecturas anteriores sin conversión adicional.
- El ajuste del drafter solo mejora el italiano y el código en italiano; en inglés la variación está dentro de ±1,5 %, por lo que no hay ganancia medible en ese idioma.
- A partir de 98.304 tokens de contexto, la decodificación especulativa deja de aportar y se ejecutan pasos ordinarios: a 99.311 tokens el rendimiento cae a 78,3 tokens/s con o sin drafter.
- No se documentan sesgos conocidos, tasas de alucinación ni la lista completa de idiomas del modelo base en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del checkpoint original de Thinking Machines antes de desplegar en producción.
- El rendimiento medido corresponde a una sola petición concurrente; no se han publicado datos de throughput agregado con múltiples peticiones simultáneas.
- El repositorio tiene 724 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria limitada.

## Enlaces

- Artefacto en Hugging Face: https://huggingface.co/Feyd89/Inkling-2-Mini-NVFP4-capy-flash
- Revisión anterior con el drafter del checkpoint: https://huggingface.co/Feyd89/Inkling-2-Mini-NVFP4-capy-flash/tree/7c6104e983567bf4078f64c5b6bb3bbbb3531499
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio de capy-flash: https://github.com/ValerioDolci/capy-flash
- Script de instalación: https://raw.githubusercontent.com/ValerioDolci/capy-flash/main/install.sh
