# audio-cpp/AuK-Base-and-Flash-GGUF

## Resumen

audio-cpp/AuK-Base-and-Flash-GGUF es un paquete de pesos en formato GGUF publicado por el usuario audio-cpp para ejecutarse con audio.cpp, el runtime de inferencia en C++/CUDA. No es un modelo nuevo: es una conversión y empaquetado del modelo de audio tencent/AuK (Tencent Hunyuan), junto con archivos opcionales derivados de su variante destilada AuK-Flash. El repositorio ocupa 34,0 GB e incluye el generador en F32, un codificador de texto/instrucción basado en Qwen2.5-Omni-3B y un VAE también en F32.

El modelo cubre generación y edición de habla y audio: TTS zero-shot con clonación de voz, edición de contenido, tono, velocidad, volumen, emoción y timbre, conversión a susurro, mejora de habla, separación de hablantes, separación de voz respecto a la música y extracción de hablante objetivo, todo ello guiado por instrucciones en lenguaje natural. La relevancia de este repositorio es que permite ejecutar el pipeline completo sin Python, con paridad numérica verificada frente a la implementación de referencia en 16 tareas.

El número de parámetros del modelo base, según el dato de safetensors asociado al repositorio, es de 1.530.538.629 (~1,53 mil millones), a los que se suma el componente Qwen2.5-Omni-3B (~3 mil millones). La licencia es MIT y el pipeline declarado es text-to-speech.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la informacion disponible; el repositorio se etiqueta como "diffusion" e "instruction-guided". Pipeline de generacion de audio con generador, codificador de texto/instruccion (Qwen2.5-Omni-3B) y VAE |
| Parametros totales | 1.530.538.629 (dato de safetensors del modelo base) mas el componente Qwen2.5-Omni-3B |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: F32 (auk-base-f32.gguf, auk-flash-f32.gguf, auk-vae-f32.gguf), BF16 y Q8_0 (qwen2.5-omni-3b-bf16.gguf, qwen2.5-omni-3b-q8_0.gguf) |
| Idiomas soportados | No disponible. Los ejemplos de la model card incluyen ingles y mandarin (incluida una tarea de eliminacion de acento sichuanes) |
| Licencia | MIT |
| Formato de pesos | GGUF (para audio.cpp) |

## Arquitectura y entrenamiento

Este repositorio es un empaquetado de inferencia, no un entrenamiento nuevo. El pipeline declarado combina tres piezas: un generador (auk-base-f32.gguf para la variante base y auk-flash-f32.gguf para la variante destilada AuK-Flash), un componente de comprension de texto e instrucciones basado en Qwen2.5-Omni-3B, y un VAE (auk-vae-f32.gguf) que trabaja sobre representaciones latentes de audio. La salida son WAV de 24 kHz. Las etiquetas del repositorio apuntan a un modelo generativo de difusion guiado por instrucciones, pero la model card no detalla el numero de capas, el mecanismo de atencion ni la composicion del dataset de entrenamiento.

El dato tecnico mas concreto es la validacion de paridad: los 16 casos de prueba se ejecutaron forzando inferencia FP32 y desactivando TF32 en ambas implementaciones (C++ y Python), y todas las peticiones C++ produjeron WAV de 24 kHz con el mismo numero de frames que las salidas Python. La variante Flash es un modelo destilado independiente, no el modelo base fijado en el campo base_model. El autor advierte que las combinaciones de componentes cuantizados no han recibido la misma validacion de paridad de 16 tareas. No hay informacion sobre tokens de entrenamiento, composicion del dataset ni etapas de RLHF o DPO.

## Capacidades

- Generacion de voz zero-shot: sintesis de una frase objetivo a partir de una voz de referencia, sin entrenamiento adicional.
- TTS guiado por instrucciones: control de estilo mediante texto, por ejemplo "A warm male voice speaking clear English", con control de duracion (`duration_sec`) y semilla.
- Clonacion y conversion de voz: cambio de timbre, cambio a voz masculina grave, conversion a susurro.
- Edicion de contenido del habla: sustitucion de palabras o fragmentos concretos dentro de un audio existente.
- Edicion de letras de canciones: sustitucion de una palabra en una pista de voz aislada.
- Edicion de atributos acusticos: tono (semitones), velocidad (por ejemplo 1,5x), volumen (dB) y emocion.
- Edicion no verbal: insercion de eventos como una tos antes de una frase.
- Eliminacion de acento: conversion de habla con acento sichuanes a mandarin estandar.
- Mejora de habla: eliminacion de ruido y reverberacion preservando a los hablantes.
- Separacion de fuentes: separacion de hablantes, extraccion de voz sobre musica y extraccion de un hablante objetivo descrito por su contenido.
- Ejecucion local en C++/CUDA mediante audio.cpp, sin dependencia de Python.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Otras capacidades (vision, audio de entrada como comprension semantica general): no disponible.

## Casos de uso

- Doblaje y localizacion de contenido: dado un audio original y una voz de referencia, se puede regenerar el habla en otro estilo o idioma con el control de instrucciones, manteniendo el timbre mediante clonacion. La ventana de contexto no esta documentada, por lo que conviene procesar por fragmentos.
- Postproduccion de podcast: la tarea de mejora de habla elimina ruido y reverberacion preservando a los hablantes, y la edicion de contenido permite corregir una frase mal leida sin regrabar la toma completa.
- Produccion musical y remezclas: la separacion de voz sobre musica y la edicion de letras permiten aislar la pista vocal y sustituir palabras concretas, algo util para versiones alternativas o correcciones de letra.
- Accesibilidad y audiolibros: generacion de narracion con una voz clonada y control de velocidad (por ejemplo 1,5x) y volumen, util para producir versiones adaptadas a distintos ritmos de lectura.
- Prototipado de asistentes de voz: el modelo puede generar muestras de voz con emocion o timbre especificos para evaluar la experiencia de usuario antes de invertir en un TTS en produccion.
- Restauracion de archivos de audio: la mejora de habla y la extraccion de hablante objetivo permiten recuperar entrevistas o grabaciones con ruido y con varias personas hablando a la vez.
- Anonimizacion o sustitucion de voz: el cambio de timbre y la conversion de voz permiten generar una version con otra identidad vocal, con las advertencias legales y eticas correspondientes.
- Integracion en pipelines C++: al exponerse via audiocpp_cli con backend CUDA, el modelo puede invocarse desde herramientas nativas o servicios sin introducir una capa Python en el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas equivalentes, que ademas no aplican a un modelo de audio).

La model card si incluye una validacion de paridad C++ frente a Python en 16 tareas, con inferencia FP32 forzada y TF32 desactivado en ambas implementaciones. Los valores de coseno comparan las formas de onda, no la calidad subjetiva ni el cumplimiento de la instruccion de edicion.

| Tarea | Instruccion / ajuste probado | Coseno C++ vs Python |
|---|---|---:|
| TTS zero-shot | Voz de referencia; frase objetivo; 6 s | 0,999999992 |
| TTS con instruccion | "Calm woman speaking clear English"; 3 s | 0,999999898 |
| Edicion de contenido | Sustituir "but accepting what we cannot have" por "and living well with dreams unmet"; 7 s | 0,999999982 |
| Edicion de letra | Sustituir "rear view" por "like you" en voz aislada | 1,000000000 |
| Edicion de tono | Subir 2 semitonos | 0,999989991 |
| Edicion de velocidad | Velocidad 1,5x; 6,86 s | 0,999999993 |
| Edicion de volumen | Subir volumen 10 dB | 0,999999997 |
| Edicion de emocion | Cambiar emocion a alegre | 0,999999993 |
| Edicion de timbre | Cambiar a voz masculina grave y calmada | 0,999999991 |
| Eliminacion de acento | Pasar habla con acento sichuanes a mandarin estandar | 0,999999795 |
| Edicion no verbal | Anadir una tos antes de "We tested"; 10,44 s | 0,999991188 |
| Conversion a susurro | Decir el texto fuente en susurro suave | 0,999998371 |
| Mejora de habla | Preservar hablantes; quitar ruido y reverberacion | 0,999999994 |
| Separacion de habla | Mantener al segundo hablante que empieza a hablar | 0,999999985 |
| Separacion musical | Mantener la voz cantada; quitar el resto | 0,999999998 |
| Extraccion de hablante objetivo | Mantener al hablante que dice "get what" | 0,999999997 |

El autor indica que la ejecucion C++ sin TF32 igualo los WAV de Python con un coseno de forma de onda de 0,999989, y que un coseno alto no demuestra por si solo que una edicion haya seguido su instruccion.

## Requisitos de hardware

- VRAM estimada para la configuracion por defecto (auk-base-f32 + qwen2.5-omni-3b-bf16 + auk-vae-f32): aproximadamente 12-14 GB, calculado a partir de los recuentos de parametros y del formato (1,53 mil millones en FP32 ~ 6,1 GB; 3 mil millones en BF16 ~ 6 GB, mas el VAE). Es una estimacion derivada, no confirmada por el autor.
- VRAM estimada usando el componente Qwen en Q8_0: aproximadamente 9-10 GB, por la misma via de calculo.
- GPU recomendadas: no disponible en la informacion proporcionada. La CLI expone `--backend cuda`, pero no se indican modelos de GPU validados.
- Compatibilidad con GPU de consumo: no confirmada. Por el volumen estimado, una GPU con 12-16 GB o mas podria ser suficiente en la configuracion cuantizada, pero el autor no lo certifica.
- Opciones de despliegue: audio.cpp (`audiocpp_cli --model <directorio>`), con backend CUDA. vLLM, llama.cpp, Ollama o TGI no estan soportados ni mencionados; el formato GGUF de este repositorio esta pensado para el runtime audio.cpp, no para llama.cpp.
- Estructura de despliegue: es necesario conservar los directorios `config/` y `tokenizer/` junto a los archivos GGUF. Las variantes se seleccionan con `--session-option auk.variant=base|flash`, `auk.model_gguf`, `auk.qwen_gguf` y `auk.vae_gguf`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos alternativos en la informacion proporcionada. La comparacion posible se limita a las variantes incluidas en este mismo repositorio y al modelo original del que derivan.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AuK Base (GGUF, este repo) | 1.530.538.629 mas Qwen2.5-Omni-3B | No disponible | GGUF F32 + BF16/Q8_0 | MIT | audio.cpp via audiocpp_cli |
| AuK Flash (GGUF, este repo) | No disponible (variante destilada) | No disponible | GGUF F32 | MIT | audio.cpp, requiere `auk.variant=flash` |
| tencent/AuK (original) | 1.530.538.629 segun safetensors | No disponible | Peso original (no detallado) | MIT | HuggingFace, pipeline Python |
| tencent/AuK-Flash (original) | No disponible | No disponible | No disponible | MIT | HuggingFace, pipeline Python |

## Limitaciones y advertencias

- La validacion del autor comprueba paridad numerica con Python, no calidad subjetiva. El propio autor recomienda escuchar el WAV de referencia en Python antes de atribuir un resultado decepcionante a la conversion.
- Las combinaciones de componentes cuantizados (por ejemplo Qwen en Q8_0) no han pasado la validacion de paridad de 16 tareas.
- Un coseno de forma de onda alto no garantiza que una edicion haya seguido la instruccion; es una medida de similitud, no de fidelidad semantica.
- No hay informacion sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de equidad entre voces, acentos o generos.
- Riesgo de alucinacion o de sustitucion incorrecta de contenido en tareas de edicion: no documentado por el autor, pero es un riesgo inherente a los modelos generativos guiados por instrucciones.
- Idiomas soportados no documentados. Los ejemplos se limitan a ingles y mandarin, por lo que el comportamiento multilingue no esta garantizado.
- Longitud de contexto no documentada: no se puede asegurar el procesamiento de audios largos en una sola pasada.
- Licencia MIT, permisiva para uso comercial, pero la licencia del modelo base (tencent/AuK), tambien MIT, debe respetarse igualmente. No se documentan restricciones adicionales.
- El componente Qwen2.5-Omni-3B tiene su propia licencia, que debe verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion por parte de la comunidad.
- El repositorio ocupa 34,0 GB, lo que exige espacio en disco y ancho de banda considerables para su descarga completa.
- La edicion y clonacion de voz tienen implicaciones legales y eticas (suplantacion, derechos de imagen y voz) que no cubre la licencia del software.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/audio-cpp/AuK-Base-and-Flash-GGUF
- Modelo base en HuggingFace: https://huggingface.co/tencent/AuK
- Variante destilada AuK-Flash: https://huggingface.co/tencent/AuK-Flash
- Runtime audio.cpp: https://github.com/0xShug0/audio.cpp
- Guia de AuK en audio.cpp: https://github.com/0xShug0/audio.cpp/blob/main/docs/models/auk.md
- Repositorio oficial de AuK (Tencent Hunyuan): https://github.com/Tencent-Hunyuan/AuK
- Cookbook de AuK: https://github.com/Tencent-Hunyuan/AuK/blob/main/docs/COOKBOOK.md
- Audios de demostracion de entrada: https://github.com/Tencent-Hunyuan/AuK/tree/main/assets/demo-input-audio
- La busqueda web realizada no devolvio enlaces relevantes al modelo: los resultados fueron plataformas genericas de audio y musica (audio.com, AudioEdit, Audiomack, Wikipedia, Pixabay) sin relacion con AuK ni con audio.cpp.
