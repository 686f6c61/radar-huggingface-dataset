# IDONTCARELETMEIN/deaftones-8B

## Resumen

deaftones-8B es un modelo de lenguaje especializado en diseno de sonido y sintesis musical, desarrollado por el usuario IDONTCARELETMEIN y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un fine-tuning de MOSS-Music-8B-Instruct (que a su vez combina un modelo de lenguaje Qwen3-8B con un encoder de audio musical) orientado a una tarea muy concreta: traducir una descripcion en lenguaje natural de un sonido deseado en un preset completo para sintetizadores de software. El modelo escribe primero su razonamiento en un bloque `<think>` y despues el preset en un formato textual propio denominado `.idc`, con una linea por seccion del sintetizador y valores en las unidades que muestra el propio instrumento.

El modelo cubre tres sintetizadores comerciales: Serum 2 (Xfer Records), Vital (Vital Audio) y Diva (u-he). La relevancia de esta ficha es acotada pero clara: es un ejemplo de fine-tuning de un modelo de 9.052 millones de parametros sobre un corpus pequeno y muy estructurado (9.111 presets) para una tarea de dominio estrecho, con perdida calculada solo sobre la respuesta y ponderacion especifica de ciertas lineas del formato de salida. No es un modelo de proposito general ni compite en benchmarks de razonamiento o codigo.

El modelo tiene 9.052.463.488 parametros totales segun los pesos en safetensors, un repositorio de 18,1 GB y soporte unicamente para ingles. Se distribuye en formato safetensors para `transformers`, con variantes cuantizadas bnb-nf4 y bnb-int8 publicadas en repositorios separados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con encoder de audio musical (Whisper) integrado, segun MOSS-Music |
| Parametros totales | 9.052.463.488 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, bnb-nf4 (7,3 GiB), bnb-int8 (10,4 GiB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

deaftones-8B hereda la arquitectura de MOSS-Music-8B-Instruct: un modelo de lenguaje Qwen3-8B acoplado a un encoder de audio de tipo Whisper, lo que permite procesar tanto texto como grabaciones de audio. El codigo de modelado incluido en el repositorio es el propio de MOSS-Music (carpeta `src/` en el commit `ad107c7`), con dos correcciones para compatibilidad con transformers 5.x: una capa del encoder Whisper devuelve un tensor en lugar de una tupla, y la generacion lee la longitud de cache desde `past_key_values`. El modelo requiere `trust_remote_code=True`.

El entrenamiento se realizo sobre 9.111 presets (8.929 para entrenamiento, 182 reservados para validacion), cada uno renderizado tocando un patron de prueba fijo. Para cada preset, un modelo profesor genero tres peticiones en lenguaje de oyente, un razonamiento y las notas `//` que acompanan a cada seccion, a partir de los ajustes del preset y de mediciones de su render. Se descarto el 1% de presets en cada extremo de la distribucion de longitud de respuesta, conservando respuestas de entre 1.096 y 3.826 tokens. Cada fila de entrenamiento consta de prompt de sistema, peticion (con el audio del render en la primera pasada sobre los datos y en aproximadamente la mitad de las filas de la segunda) y respuesta. La perdida se calcula solo sobre la respuesta, con un peso de 0,6 para los tokens dentro de `<think>` y ponderacion al alza para las lineas de modulacion, envolventes, LFO y wavetables. El entrenamiento consistio en 5.501 pasos sobre 2 GPU AMD MI300X, una fila por GPU.

La innovacion tecnica principal no esta en la arquitectura sino en el formato de salida: el modelo escribe un DSL textual (`.idc`) con una linea por seccion del sintetizador, valores en unidades nativas (Hz, dB, ms, semitonos), la matriz de modulacion al final y un comentario `//` antes de cada seccion explicando la decision. Solo se escriben los ajustes que cambian el sonido; lo omitido queda en el patch de init del sintetizador. Las respuestas tipicas ocupan entre 1.000 y 4.000 tokens, con una mediana en torno a 1.500.

## Capacidades

- Generacion de presets para Serum 2, Vital y Diva en formato textual `.idc`, con razonamiento previo en `<think>`.
- Razonamiento explicito sobre la construccion del sonido: eleccion de osciladores, filtros, envolventes, efectos y matriz de modulacion, con justificacion por seccion.
- Interpretacion de peticiones en lenguaje natural descriptivo (tipo de sonido, registro, movimiento, caracter timbrico).
- Procesamiento opcional de audio: el modelo fue entrenado con grabaciones del preset sonando (16 kHz mono, procesadas por el processor de MOSS-Music) junto a la peticion, aunque la forma texto-solo es la que se probo tras el entrenamiento.
- Escritura de valores en unidades nativas del sintetizador (Hz, dB, ms, semitonos), lo que facilita la conversion posterior a ficheros de preset.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Diseno de pads y texturas: un disenador describe un pad polifonico calido con osciladores de sierra desafinados y filtro paso bajo con barrido lento, y el modelo devuelve la configuracion completa de Diva con envolventes, filtro ladder y cadena de efectos, ademas del razonamiento que justifica cada ajuste.
- Creacion rapida de bajos Reese: peticiones como "Reese bass oscuro y subgraves en registro bajo, mono con glide suave" producen un preset de Serum 2 con la configuracion de osciladores, filtro y glide, util para productores que quieren un punto de partida editable.
- Prototipado de plucks y leads: el modelo genera presets de Vital o Diva para sonidos con envolventes cortas y filtros con alta resonancia, acelerando la exploracion de variantes timbricas.
- Aprendizaje de sintesis: las notas `//` y el bloque `<think>` explican por que se elige cada oscilador, filtro o modulacion, lo que convierte al modelo en una herramienta didactica para entender el diseno de sonido en sintetizadores concretos.
- Generacion de bancos de presets a partir de un brief: dado un conjunto de descripciones (por ejemplo, "diez pads evolutivos para ambient"), se pueden generar presets en lote y convertirlos despues con los conversores por sintetizador.
- Reconstruccion asistida a partir de audio: al haberse entrenado con el render del preset junto a la peticion, el modelo puede apoyarse en una grabacion del sonido objetivo para orientar la configuracion, aunque esta via no es la que se valido tras el entrenamiento.
- Integracion en herramientas de produccion: el formato `.idc` es texto plano y estructurado, lo que permite parsearlo y convertirlo a `.SerumPreset`, `.vital` o `.h2p` mediante conversores propios (no incluidos en el repositorio).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 17 GB en bf16 para inferencia; la variante bnb-nf4 ocupa 7,3 GiB y la bnb-int8 10,4 GiB.
- GPU recomendadas: el autor menciona que la version nf4 cabe en una tarjeta de 12 GB; en bf16 se necesita una GPU de 24 GB o superior (RTX 3090/4090, A100, H100).
- Cabe en GPU de consumo: si, en bf16 en tarjetas de 24 GB y en nf4 en tarjetas de 12 GB.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La generacion requiere reservar hasta 4.800 tokens nuevos, con respuestas tipicas de 1.000 a 4.000 tokens y mediana en torno a 1.500.
- Entrenamiento: realizado sobre 2 GPU AMD MI300X.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deaftones-8B | 9.052 M | no disponible | Presets de Serum 2, Vital y Diva en `.idc` | Apache 2.0 | Hugging Face (transformers) |
| MOSS-Music-8B-Instruct | no disponible | no disponible | Modelo musical base multimodal audio-texto | no disponible en la informacion | Hugging Face |
| Qwen3-8B | no disponible | no disponible | Modelo de lenguaje general | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo escribe en formato `.idc`; convertir esa salida a `.SerumPreset`, `.vital` o `.h2p` requiere conversores por sintetizador que no forman parte del repositorio.
- Solo soporta ingles; las peticiones en castellano no estan cubiertas por el entrenamiento.
- El alcance esta limitado a tres sintetizadores concretos (Serum 2, Vital, Diva); no generaliza a otros instrumentos.
- No se documentan sesgos especificos, pero al derivar de un modelo de lenguaje general puede heredar sesgos de su base.
- Riesgo de alucinacion: el modelo puede generar ajustes o combinaciones de parametros no validos para el sintetizador, por lo que la salida debe revisarse antes de cargarla.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los sintetizadores objetivo tienen sus propias condiciones que deben verificarse por separado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 23 de noviembre de 2026; no hay evidencia de validacion externa.
- La longitud de contexto no esta documentada, lo que dificulta planificar peticiones largas o conversaciones multi-turno.
- Escrito contra transformers 5.15; versiones anteriores pueden no funcionar sin ajustes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IDONTCARELETMEIN/deaftones-8B
- Version cuantizada nf4: https://huggingface.co/IDONTCARELETMEIN/deaftones-8B-bnb-nf4
- Version cuantizada int8: https://huggingface.co/IDONTCARELETMEIN/deaftones-8B-bnb-int8
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Music-8B-Instruct
