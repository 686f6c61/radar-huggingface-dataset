# omote-ai/kokoro-tts

## Resumen

`omote-ai/kokoro-tts` es un repositorio espejo (mirror) de exportaciones ONNX del modelo de sintesis de voz Kokoro-82M, publicado por omote-ai y mantenido como dependencia del SDK Omote. No se trata de un modelo nuevo ni de un reentrenamiento: es una copia de artefactos ONNX alojada bajo el espacio `omote-ai` para garantizar estabilidad de CDN en la distribucion del runtime nativo de Omote. El repositorio ocupa 0,6 GB y esta etiquetado con la libreria `onnxruntime` y el pipeline `text-to-speech`.

La cadena de procedencia documentada es completamente Apache-2.0 y consta de tres eslabones: el modelo original `hexgrad/Kokoro-82M`, la exportacion ONNX comunitaria `onnx-community/Kokoro-82M-v1.0-ONNX`, y este espejo derivado del anterior. El valor tecnico diferencial del repositorio no es el modelo en si, sino un artefacto derivado con un parche determinista (`kokoro_fp16_atan2guard.onnx`) que corrige la emision de audio no finito del export fp16 padre, un problema reproducible en el que aproximadamente 8 de cada 40 frases del corpus de prueba producian audio enteramente NaN con el numero de hilos por defecto de ONNX Runtime.

El repositorio no aloja los tensores de estilo de voz (por ejemplo `af_heart.bin`), que el registro de modelos de Omote obtiene directamente del repositorio `onnx-community`. Las descargas y los "likes" del repositorio figuran a cero, por lo que no existe validacion externa de la comunidad sobre estos artefactos concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (exportacion ONNX del modelo upstream Kokoro-82M) |
| Parametros totales | 82 millones (deducido de la denominacion del modelo upstream Kokoro-82M; la model card no lo detalla) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de sintesis de voz; la entrada es texto o fonemas, no una ventana de contexto de tokens) |
| Tipos de cuantizacion | fp16 (`kokoro_fp16.onnx`, `kokoro_fp16_atan2guard.onnx`), int32 (`kokoro_int32.onnx`), exportacion WebGPU en formato external-data |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (fichero unico y external-data para WebGPU) |
| Libreria de inferencia | onnxruntime |
| Pipeline | text-to-speech |
| Tamano del repositorio | 0,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-03-01 |
| Ultima actualizacion | 2026-09-13 |

Artefactos incluidos y huellas sha256:

| Fichero | Tamano (bytes) | sha256 | Descripcion |
|---|---|---|---|
| `kokoro_fp16.onnx` | 163.234.836 | `090dc6036fa19f587ce70782838ad41f226040abfdb6d961115fa66a404195cf` | Exportacion fp16 en fichero unico |
| `kokoro_fp16_atan2guard.onnx` | 163.234.836 | `3574c63e84c2cad4eb3ba7a2641636ab0d9c4b64af8f5d1c4ed4e4547e3ac98a` | Derivado del anterior (padre `090dc603…`) con guarda de cero en el atan2 del vocoder |
| `kokoro_int32.onnx` | 92.361.212 | `e4c36c8a1c032cffcf15c5f7ee67be21c3ebd792717b7b6eab5ca339a4299e10` | Exportacion en fichero unico para web (smoke-harness de produccion) |
| `kokoro_webgpu.onnx` | 1.149.264 | `35e95bb1cec095808bbfd8475f4f75e5e37948651c478be139a90d3c55b6ab12` | Grafo WebGPU; requiere el fichero `.data` junto a el |
| `kokoro_webgpu.onnx.data` | 162.249.784 | `ad8d64cee31dd04439f6d1844805310b5c736acd93ad8ec409a8e7d6e037d958` | Datos de pesos externos del grafo WebGPU |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. Lo unico documentado es la cadena de procedencia: `hexgrad/Kokoro-82M` como modelo original, `onnx-community/Kokoro-82M-v1.0-ONNX` como exportacion ONNX comunitaria y este repositorio como espejo derivado de la segunda. Toda la cadena comparte licencia Apache-2.0. Por tanto, cualquier afirmacion sobre capas, atencion, vocoder o estrategia de entrenamiento queda fuera de la informacion disponible.

La innovacion tecnica documentada es una modificacion concreta y determinista del grafo ONNX. En `kokoro_fp16_atan2guard.onnx`, la division fp16 entre las partes imaginaria y real dentro de la emulacion de `atan2` del vocoder incorpora una guarda de cero mediante la operacion `Where(Equal(real,0), 2^-14, real)`. El cambio anade dos nodos al grafo, mantiene exactamente las mismas entradas y salidas, y consigue 0 de 40 frases del corpus con valores no finitos en todos los recuentos de hilos, frente a las aproximadamente 8 de 40 frases con audio enteramente NaN que produce el artefacto padre con el numero de hilos por defecto de ONNX Runtime. El script de derivacion es `scripts/kokoro-atan2-guard/patch_kokoro_atan2_guard.py`, dentro del repositorio Omote, y es determinista. Desde el 2026-09-13 este artefacto es el que el runtime nativo de Omote instala como `kokoro/kokoro.onnx`.

## Capacidades

- Sintesis de texto a voz: el pipeline declarado es `text-to-speech` y el repositorio distribuye grafos ONNX listos para inferencia.
- Ejecucion en CPU y GPU a traves de ONNX Runtime, con exportaciones especificas para fp16 e int32.
- Ejecucion en navegador mediante WebGPU, con un grafo que emplea el formato ONNX de datos externos (`.onnx` + `.onnx.data`).
- Inferencia en runtime nativo: el artefacto `kokoro_fp16_atan2guard.onnx` es la dependencia que instala el runtime nativo de Omote como `kokoro/kokoro.onnx`.
- Estabilidad numerica en fp16: la variante con guarda de cero en el `atan2` del vocoder evita la generacion de audio no finito que afecta al export fp16 original bajo la configuracion por defecto de hilos de ONNX Runtime.
- Seleccion de voz por tensores de estilo: los tensores de estilo (por ejemplo `af_heart`) se cargan desde ficheros `.bin` externos a este repositorio.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: no disponible; el campo de idiomas no esta declarado en los metadatos ni en la model card.
- Capacidades especiales (modo thinking, vision, audio de entrada): no disponible.

## Casos de uso

- Sintesis de voz local en aplicaciones de escritorio: el runtime nativo de Omote instala `kokoro_fp16_atan2guard.onnx` como `kokoro/kokoro.onnx`, de modo que una aplicacion puede generar voz sin depender de servicios en la nube ni de conectividad, usando un artefacto de unos 163 MB.
- Lectura de contenido y accesibilidad: conversion de articulos, documentacion o interfaces a audio para usuarios con discapacidad visual, con la ventaja de que el modelo es pequeno y puede ejecutarse en el mismo equipo del usuario sin GPU dedicada.
- TTS en aplicaciones web: el export `kokoro_webgpu.onnx` mas `kokoro_webgpu.onnx.data` permite ejecutar la sintesis dentro del navegador con WebGPU, evitando enviar el texto del usuario a un servidor.
- Generacion de voz en asistentes conversacionales: integracion como etapa final de un pipeline de dialogo, donde el texto de respuesta se convierte en audio; la eleccion de voz se hace cargando el tensor de estilo correspondiente desde el repositorio upstream.
- Locucion de contenido formativo o divulgativo: produccion de narraciones para cursos, tutoriales o podcasts tecnicos por lotes, aprovechando que el modelo cabe en memoria en cualquier equipo y no requiere infraestructura de servidor.
- Pre-generacion de audio en pipelines de datos: creacion de corpus de audio sintetico para pruebas de sistemas de reconocimiento de voz, con la ventaja de que la licencia Apache-2.0 permite uso comercial y redistribucion del artefacto.
- Pruebas de regresion en CI: uso conjunto de `kokoro_fp16.onnx` y `kokoro_fp16_atan2guard.onnx` para detectar regresiones de estabilidad numerica en exportaciones fp16 propias, dado que existe un caso documentado de fallo con una tasa de reproduccion conocida (aproximadamente 8 de 40 frases).
- Distribucion de SDKs de terceros: el repositorio existe explicitamente como espejo para estabilidad de CDN, por lo que resulta adecuado como origen de artefactos en un instalador o en una imagen de contenedor con dependencias fijadas por sha256.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de sintesis (MOS, similitud de hablante, latencia o throughput), y la busqueda web no devolvio resultados tecnicos relevantes. El unico dato cuantitativo de rendimiento documentado es la tasa de frases con valores no finitos en el corpus de prueba: aproximadamente 8 de 40 en el artefacto fp16 padre con el numero de hilos por defecto de ONNX Runtime, frente a 0 de 40 en la variante con guarda `atan2`, en todos los recuentos de hilos.

## Requisitos de hardware

- VRAM en fp16: los pesos de `kokoro_fp16.onnx` y `kokoro_fp16_atan2guard.onnx` ocupan 163.234.836 bytes (aproximadamente 156 MiB); sumando activaciones y buffers de ONNX Runtime, la huella esperada se situa en el orden de unos pocos cientos de MiB (estimacion a partir del tamano de los artefactos, no confirmada por el autor).
- VRAM en int32: `kokoro_int32.onnx` ocupa 92.361.212 bytes (aproximadamente 88 MiB), el artefacto mas ligero de los tres export de inferencia.
- WebGPU: el grafo `kokoro_webgpu.onnx` ocupa 1.149.264 bytes y requiere ademas `kokoro_webgpu.onnx.data`, de 162.249.784 bytes.
- CPU: viable como opcion principal dado el tamano del modelo; no se documentan requisitos minimos de CPU.
- GPU recomendadas: no disponible. Por tamano de artefacto, cualquier GPU con mas de 1 GB de memoria libre deberia poder alojar el modelo, pero no hay lista de GPUs validada por el autor.
- GPU de consumo: no hay confirmacion explicita, aunque por el rango de memoria requerido (cientos de MiB) el modelo queda muy por debajo de las limitaciones de una GPU de gama media o de una integrada moderna.
- Opciones de despliegue: ONNX Runtime (CPU y ejecucion acelerada), ONNX Runtime Web con WebGPU, y el runtime nativo de Omote. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que no son runtimes de ONNX para este tipo de modelo.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 0,6 GB; basta con descargar el artefacto concreto que se vaya a usar.

## Comparativa con modelos similares

La informacion disponible solo permite comparar los tres eslabones de la cadena de procedencia, que son el mismo modelo en distintos formatos y alojamientos.

| Repositorio | Rol | Formato | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| `omote-ai/kokoro-tts` | Espejo de artefactos ONNX; incluye variante fp16 con guarda `atan2` | ONNX (fp16, int32, WebGPU external-data) | Apache-2.0 | No disponible | 0 descargas, 0 likes; mantenido como dependencia del SDK Omote |
| `onnx-community/Kokoro-82M-v1.0-ONNX` | Exportacion ONNX comunitaria de origen | ONNX | Apache-2.0 | No disponible | Repositorio comunitario; aloja tambien los tensores de voz (`voices/af_heart.bin`) |
| `hexgrad/Kokoro-82M` | Modelo original | No disponible | Apache-2.0 | No disponible | Repositorio upstream del modelo |

Diferencias relevantes entre los tres: el espejo anade un artefacto derivado con correccion de estabilidad numerica en fp16 y una exportacion especifica para WebGPU; la exportacion comunitaria aporta los tensores de estilo de voz que el espejo no aloja; y el modelo original es el unico que representa los pesos canonicos publicados por el autor del modelo. No se dispone de informacion sobre modelos alternativos de otras familias con los que comparar parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo nuevo: es un espejo de artefactos derivados de Kokoro-82M; el merito tecnico declarado se limita al parche `atan2` y a la estabilidad de CDN.
- Los tensores de estilo de voz no se alojan en este repositorio. El registro de modelos de Omote los obtiene de `onnx-community/Kokoro-82M-v1.0-ONNX`; si ese repositorio cambia o desaparece, el espejo queda sin datos de voz.
- El artefacto `kokoro_fp16.onnx` presenta un fallo numerico conocido: emite audio enteramente NaN en aproximadamente 8 de 40 frases del corpus de prueba con el numero de hilos por defecto de ONNX Runtime. Se recomienda usar `kokoro_fp16_atan2guard.onnx` en su lugar.
- El cambio `atan2` se ha validado sobre un corpus de 40 frases; no se documenta una evaluacion de calidad perceptual ni cobertura sobre otras lenguas o voces.
- Sin benchmarks publicados: no hay MOS, WER, latencia ni throughput que permitan estimar la calidad de la sintesis.
- Idiomas no declarados: ni los metadatos de HuggingFace ni la model card indican que idiomas soporta este export, por lo que no se puede asumir cobertura multilingue en produccion.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de artefactos acusticos, pronunciacion incorrecta y valores no finitos en la salida de audio.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay informes externos de uso en produccion.
- Trazabilidad de integridad: los sha256 documentados permiten verificar los artefactos; conviene fijarlos en cualquier pipeline de despliegue.
- Licencia: Apache-2.0 en toda la cadena, lo que permite uso comercial, modificacion y redistribucion. Hay que conservar los avisos de licencia y atribucion del modelo original y de la exportacion comunitaria.
- El campo de idiomas sin declarar y la ausencia de datos de entrenamiento en la model card impiden evaluar sesgos de voz, cobertura de acentos o limitaciones de dominio.
- Los ficheros WebGPU requieren el par `.onnx` + `.onnx.data`; desplegar solo el grafo sin los datos externos produce un error de carga.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/omote-ai/kokoro-tts
- Modelo original: https://huggingface.co/hexgrad/Kokoro-82M
- Exportacion ONNX comunitaria y tensores de voz: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- Tensores de voz de la exportacion comunitaria: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/tree/main/voices
- Script de derivacion de la variante con guarda `atan2`: `scripts/kokoro-atan2-guard/patch_kokoro_atan2_guard.py` en el repositorio de Omote (no se proporciona URL en la informacion disponible)
- Papers, blogs o demos adicionales: no disponibles; la busqueda web realizada no devolvio resultados tecnicos relevantes.
