# andkondev/tts-voices

## Resumen

`andkondev/tts-voices` no es un modelo entrenado por su autor, sino un repositorio de distribucion de ficheros de voz de terceros para síntesis de voz (text-to-speech), algunos convertidos para su ejecución en navegador. El repositorio empaqueta dos familias independientes: Kitten (modelo `kitten-tts-nano-0.8-fp32` de KittenML, Apache-2.0) y Pocket (modelo `kyutai/pocket-tts`, checkpoint `english_drifting_26-09`, CC-BY-4.0), junto con las voces asociadas a cada una.

El interés práctico del repositorio es que resuelve un problema de empaquetado y despliegue: los ficheros originales se presentan aquí troceados (una voz por fichero en lugar de un `voices.npz` agregado), convertidos a grafos ONNX con pesos INT8 en el caso de Pocket y con los estados de voz precalculados (`.kv`). Cada fichero se nombra con su hash SHA-256, lo que garantiza integridad y direccionamiento por contenido, a costa de perder nombres legibles en el sistema de ficheros.

Es relevante para quien necesite TTS ligero que corra en el cliente (navegador vía ONNX Runtime Web o WASM), en CPU sin GPU, o en entornos edge con presupuesto de memoria muy ajustado. No hay que esperar de este repositorio benchmarks, parámetros documentados ni una model card técnica al uso: es un contenedor de artefactos, con licencia mixta (Apache-2.0 para Kitten, CC-BY-4.0 para Pocket) y escasísima tracción (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El autor no documenta la topología de las redes; solo se distribuyen grafos ONNX ya exportados (Kitten Nano 0.8 fp32 y Pocket convertido a ONNX INT8) |
| Parametros totales | No disponible. El grafo Kitten en fp32 ocupa 56,77 MB, lo que implica del orden de 14 millones de parámetros (estimación derivada del tamaño, no confirmada por el autor). Pocket: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo text-to-speech; no se documenta ventana de contexto textual) |
| Tipos de cuantizacion | Kitten: fp32 (nombre del checkpoint de origen). Pocket: pesos INT8 en los grafos ONNX. No se ofrecen otras variantes (fp16, Q4, etc.) |
| Idiomas soportados | No disponible en la información proporcionada. El checkpoint de Pocket se denomina `english_drifting_26-09`, lo que sugiere inglés; no hay confirmación para Kitten |
| Licencia | Mixta: Apache-2.0 (familia Kitten) y CC-BY-4.0 (familia Pocket), con términos adicionales de Kyutai en los ficheros `LICENSE-KYUTAI-*`. Campo HF: `other` |
| Formato de pesos | `.onnx` (grafos). Voces Kitten: `.npz` (un array por voz). Voces Pocket: `.kv` (estados de modelo guardados) y `.emb` (embeddings). Metadatos Pocket: `.npy` y `.json` |

Inventario detallado de artefactos:

| Familia | Fichero | Contenido | Tamano | Licencia |
|---|---|---|---|---|
| Kitten | `320564d2….onnx` | Modelo compartido Kitten Nano (sin modificar) | 56,77 MB | Apache-2.0 |
| Kitten | 8 ficheros `.npz` | Voces Bruno, Luna, Jasper, Rosie, Hugo, Kiki, Leo, Bella (una por fichero) | 0,41 MB cada una | Apache-2.0 |
| Pocket | `84602f9e….onnx` | Grafo principal convertido para navegador | 111,86 MB | CC-BY-4.0 |
| Pocket | `520be488….onnx` | Grafo secundario | 22,62 MB | CC-BY-4.0 |
| Pocket | `a717f6fc….onnx` | Grafo secundario | 16,39 MB | CC-BY-4.0 |
| Pocket | `43903126….npy` | Dato auxiliar | ~0,00 MB | CC-BY-4.0 |
| Pocket | `a9ec15e0….json` | Configuración | 0,12 MB | CC-BY-4.0 |
| Pocket | 4 ficheros `.kv` | Estados de voz Jane (7,37 MB), Azelma (7,96 MB), George (6,24 MB), Michael (7,28 MB) | 6,24–7,96 MB | CC-BY-4.0 |
| Pocket | `a3f7679b….emb` | Embedding de voz compartido por las cuatro voces | ~0,00 MB | CC-BY-4.0 |

## Arquitectura y entrenamiento

El repositorio no entrena nada: redistribuye pesos ya entrenados por KittenML y Kyutai. La única transformación documentada es de formato y empaquetado. En Kitten, el modelo se mantiene intacto y solo se divide `voices.npz` en un fichero por voz, sin modificar los arrays. En Pocket, el checkpoint `english_drifting_26-09` se convierte a grafos ONNX para ejecución en navegador con pesos INT8, trabajo realizado por «PocketTTS-RAVEN» sobre el runtime `PocketTTS.cpp` de VolgaGerm; las voces, procedentes de `kyutai/pocket-tts-without-voice-cloning`, se convierten de embeddings de Kyutai a estados de modelo guardados (`.kv`).

La separación en tres grafos ONNX para Pocket (111,86 MB, 22,62 MB y 16,39 MB) sugiere una división en etapas del pipeline TTS (posiblemente codificador/decodificador/vocoder), pero el autor no lo especifica, por lo que no debe asumirse. Tampoco se documentan tokens de entrenamiento, composición del dataset, ni si hubo RLHF/DPO: al no ser un modelo propio, esa información solo podría recuperarse de las fuentes originales (KittenML y Kyutai), no de este repositorio. No se describe ninguna innovación técnica propia; el valor añadido es el troceado por hash, la conversión a INT8 y el formato apto para runtime de navegador.

## Capacidades

- Síntesis de voz a partir de texto (pipeline `text-to-speech` declarado en HuggingFace), con dos familias de modelos independientes en el mismo repositorio.
- Multivoz: 8 voces Kitten (Bruno, Luna, Jasper, Rosie, Hugo, Kiki, Leo, Bella) y 4 voces Pocket (Jane, Azelma, George, Michael), seleccionables cargando el `.npz` o `.kv` correspondiente.
- Ejecución en navegador: los grafos Pocket están explícitamente convertidos para runtime web (ONNX + INT8), lo que habilita inferencia en cliente sin backend.
- Ejecución en CPU: el tamaño del grafo Kitten en fp32 (56,77 MB) permite inferencia sin GPU.
- Integridad verificable: los nombres de fichero son hashes SHA-256, lo que permite validar que el artefacto descargado es exactamente el esperado.
- Reutilización de estados de voz precalculados en Pocket (`.kv`), lo que evita recalcular el embedding de voz en cada arranque.
- No documentado: clonación de voz (la fuente de las voces Pocket es precisamente el checkpoint *without voice cloning*), control de prosodia, emoción, streaming, tool calling o cualquier capacidad de agente. No aplica razonamiento, código, matemáticas ni visión.

## Casos de uso

- Lectura de contenido web en el cliente: cargando el modelo Kitten (56,77 MB) y una voz `.npz` de 0,41 MB en ONNX Runtime Web, se puede ofrecer lectura en voz alta dentro de la propia página, sin enviar el texto a un servidor, lo que simplifica el cumplimiento de privacidad.
- Accesibilidad en aplicaciones offline: el tamaño reducido de Kitten permite embeberlo en aplicaciones de escritorio o móviles con conectividad intermitente, usando una de las 8 voces según el perfil de usuario.
- Asistentes de voz en edge: para dispositivos con poca memoria, el conjunto Kitten (57 MB de modelo + 0,41 MB por voz) es adecuado cuando no hay GPU ni acceso a la nube.
- Síntesis con varias voces en una misma aplicación: el repositorio entrega las 8 voces Kitten ya separadas, de modo que un pipeline puede cargar solo la voz necesaria en memoria en lugar del `voices.npz` agregado.
- Pruebas automatizadas de pipelines TTS: los ficheros direccionados por hash y las licencias permisivas (Apache-2.0 en Kitten) facilitan fijar una versión concreta en tests de integración o en un pipeline de CI que verifique la salida de audio esperada.
- Comparación de familias TTS en investigación: al convivir Kitten (fp32) y Pocket (INT8, tres grafos) en un mismo repositorio, sirve para evaluar el compromiso entre calidad y coste computacional de ambas propuestas con el mismo harness de inferencia ONNX.
- Generación de avisos y notificaciones pregrabadas dinámicas: con Pocket y sus estados de voz `.kv` se pueden producir mensajes cortos en un servicio backend sin depender de una API externa, siempre que se respeten los términos de Kyutai.
- Demos y prototipos de videojuegos o aplicaciones interactivas: cuatro voces Pocket con estados precalculados permiten asignar interlocutores distintos sin trabajo adicional de ingeniería de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de calidad (MOS, WER, SIM), ni latencia, ni throughput, ni comparaciones objetivas entre Kitten y Pocket.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Por tamaño de artefacto, Kitten en fp32 (56,77 MB) y Pocket en INT8 (unos 151 MB sumando los tres grafos) caben holgadamente en cualquier GPU consumer e incluso en memoria unificada de un SoC.
- GPU recomendadas: el autor no recomienda ninguna. Dado el tamaño, no se requiere GPU; una RTX 4090 o una A100 estarían enormemente sobredimensionadas para estos grafos.
- CPU y consumer: es el escenario natural. Kitten está pensado para ejecución en CPU y Pocket se distribuye convertido para runtime de navegador. Se estima un uso de RAM del orden de unos cientos de MB contando runtime y buffers, aunque el autor no publica cifras.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#) para los `.onnx`; ONNX Runtime Web o WebAssembly para el caso navegador; `PocketTTS.cpp` (VolgaGerm) como runtime C++ de referencia para Pocket. No se proporcionan artefactos GGUF ni integraciones con llama.cpp, Ollama, vLLM o TGI, que además no aplican a este tipo de modelos.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni en la model card ni en los metadatos del repositorio.
- Almacenamiento: el repositorio completo ocupa 0,2 GB según HuggingFace.

## Comparativa con modelos similares

Comparación interna entre las dos familias incluidas, que es la única que se puede sostener con los datos aportados:

| Criterio | Kitten Nano 0.8 | Pocket (`english_drifting_26-09`) |
|---|---|---|
| Origen | KittenML | Kyutai |
| Ficheros de modelo | 1 `.onnx` de 56,77 MB | 3 `.onnx` (111,86 + 22,62 + 16,39 MB) |
| Cuantizacion | fp32 | INT8 |
| Voces incluidas | 8 (`.npz`, 0,41 MB cada una) | 4 (`.kv`, 6,24–7,96 MB) + embedding compartido |
| Modificaciones del autor | Solo troceado de `voices.npz` | Conversion a ONNX INT8 y a estados `.kv` |
| Licencia | Apache-2.0 | CC-BY-4.0 + términos de Kyutai |
| Idiomas | No disponible | No disponible (checkpoint con nombre «english») |
| Uso en navegador | No documentado explícitamente | Sí, conversion declarada para runtime de navegador |

Alternativas externas de la misma categoría (TTS ligero, ejecutable en CPU): Kokoro-82M (Apache-2.0, ~82 M de parámetros), Piper (MIT, basado en VITS) y XTTS-v2 (licencia no comercial). Para estas alternativas no se dispone en la información proporcionada de datos comparativos de rendimiento frente a Kitten o Pocket, por lo que cualquier comparación cuantitativa sería especulativa y se omite.

## Limitaciones y advertencias

- No es un modelo propio: el repositorio es una redistribución. Cualquier duda sobre calidad, sesgos o datos de entrenamiento debe dirigirse a KittenML y Kyutai, no al autor del repositorio.
- Licencia mixta y con obligaciones: Apache-2.0 en Kitten (permisiva, requiere conservar avisos) y CC-BY-4.0 en Pocket (requiere atribución). Además, el uso de Pocket debe seguir los términos de Kyutai recogidos en los ficheros `LICENSE-KYUTAI-*`; conviene revisarlos antes de un despliegue comercial.
- Idiomas no declarados: no se especifica qué lenguas cubre cada modelo. El nombre del checkpoint de Pocket apunta a inglés, por lo que usar cualquiera de las dos familias en castellano sin validación previa es arriesgado.
- Sin clonación de voz en Pocket: las voces provienen del checkpoint `pocket-tts-without-voice-cloning`, de modo que no se debe esperar adaptación a una voz de usuario.
- Sin métricas de calidad: no hay MOS, WER ni comparativas; la calidad de síntesis es una incógnita hasta evaluarla en el caso de uso concreto.
- Riesgo de alucinación en sentido amplio: en TTS se traduce en pronunciaciones incorrectas, omisiones o artefactos en palabras poco frecuentes, siglas y números; no hay documentación de manejo de casos límite.
- Trazabilidad limitada por el nombrado: los ficheros se llaman por hash SHA-256, sin nombres legibles en el sistema de ficheros. Es necesario consultar la tabla de la model card para saber qué artefacto corresponde a cada voz, lo que complica el mantenimiento y la revisión de código.
- Madurez nula: 0 descargas, 0 likes y creación y última actualización en el mismo día (25 de octubre de 2026). No hay garantía de mantenimiento, versionado ni soporte.
- Sesgos: no evaluados ni documentados por el autor. En TTS, los sesgos se manifiestan en cobertura de acentos, géneros y variedades dialectales de las voces incluidas, todas ellas con nombre propio y sin caracterización acústica publicada.
- Compatibilidad de runtime: al depender de grafos ONNX exportados con un pipeline concreto (`PocketTTS.cpp`), cambios de versión en ONNX Runtime pueden requerir reexportación; no se documentan versiones mínimas soportadas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/andkondev/tts-voices
- Fichero de licencias del repositorio: https://huggingface.co/andkondev/tts-voices/blob/main/LICENSES.md
- Modelo Kitten de origen: https://huggingface.co/KittenML/kitten-tts-nano-0.8-fp32 (revisión `7a1db645b1f3ab9420761d87428e042b9cec3f26`)
- Modelo Pocket de origen: https://huggingface.co/kyutai/pocket-tts (checkpoint `english_drifting_26-09`)
- Voces Pocket de origen: https://huggingface.co/kyutai/pocket-tts-without-voice-cloning (revisión `1e08e6a23401048648a9fdcfde2f89348215c2a7`)
- Runtime C++ de referencia: https://github.com/VolgaGerm/PocketTTS.cpp
