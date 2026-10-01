# Alias-Alias/pocket-3-3-0-tts-onnx

## Resumen

Pocket TTS 3.3.0 ONNX INT8 es una exportación no oficial del modelo de síntesis de voz Kyutai Pocket TTS, publicada por el usuario Alias-Alias en HuggingFace. Se trata de un paquete autocontenido pensado para inferencia en CPU y en entornos compatibles con ONNX, sin servidor Python ni codigo de entrenamiento. El modelo base es `kyutai/pocket-tts-without-voice-cloning`, del que hereda pesos y perfiles de voz.

La aportación de esta exportación no es un modelo nuevo, sino un formato de despliegue: fronteras explicitas de estado de streaming en ONNX, cuantizacion INT8 dinamica por canal aplicada a las operaciones MatMul y empaquetado de los estados de voz predefinidos del modelo oficial. El resultado cubre siete idiomas (ingles, aleman, frances, espanol, italiano, portugues y neerlandes) con cuatro grafos por idioma, mas tokenizer, banco de voces y manifiesto de bundle.

Es relevante porque elimina la dependencia de un runtime Python para ejecutar TTS multilingue de Kyutai y habilita escenarios de navegador (WASM) y aplicaciones nativas con ONNX Runtime. Ahora bien, la validacion publicada se limita a comparacion numerica con el modelo original, audio WASM real en navegador y el motor Kotlin con JNI de escritorio; no se garantiza calidad subjetiva ni velocidad en tiempo real en todos los dispositivos. El repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de sintesis de voz de Kyutai Pocket TTS; estructura interna no detallada en la informacion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica / no disponible (modelo TTS, no LLM) |
| Tipos de cuantizacion | INT8 dinamica por canal en operaciones MatMul |
| Idiomas soportados | en, de, fr, es, it, pt, nl (7 idiomas) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (cuatro grafos por idioma), tokenizer.json, voices.bin, bundle.json |
| Tamano del repositorio | 1,2 GB |
| Pipeline | text-to-speech |
| Libreria declarada | pocket-tts |
| Modelo base | kyutai/pocket-tts-without-voice-cloning |
| Esquema de bundle | schema 3 |
| Autor de la exportacion | Alias-Alias (no oficial) |
| Autores del modelo original | Manu Orsini, Simon Rouard, Gabriel De Marmiesse, Vaclav Volhejn, Neil Zeghidour, Alexandre Defossez (Kyutai) |
| Fecha de publicacion indicada | 30 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base ni sobre el volumen o la composicion de sus datos de entrenamiento. La model card de esta exportacion no describe capas, atencion, tokenizador acustico ni fases de alineamiento o RLHF. Lo unico documentado es que los pesos y los perfiles de voz proceden del modelo publico oficial `kyutai/pocket-tts-without-voice-cloning` y que la exportacion reproduce el codigo upstream bajo licencia MIT.

La innovacion tecnica de este repositorio es de empaquetado y cuantizacion: se definen fronteras explicitas de estado de streaming en el grafo ONNX, se aplica cuantizacion INT8 dinamica por canal a las MatMul y se incluyen los estados de voz predefinidos del modelo oficial. Cada idioma contiene cuatro grafos, un `tokenizer.json`, un `voices.bin` y un `bundle.json`. Las fuentes de grabacion originales, las revisiones exactas de modelo y tokenizer y las sumas de comprobacion quedan registradas en `source-lock.json` y en el `package-manifest.json` de cada paquete. No se incluye encoder de clonacion de voz ni grabacion alguna.

## Capacidades

- Sintesis de voz multilingue en siete idiomas: ingles, aleman, frances, espanol, italiano, portugues y neerlandes.
- Inferencia en CPU mediante ONNX, incluida ejecucion en navegador a traves de WebAssembly.
- Ejecucion en runtime nativo ONNX Runtime mediante JNI desde el motor Kotlin de escritorio.
- Reproduccion de voces predefinidas incluidas en `voices.bin`, sin necesidad de grabaciones del usuario.
- Streaming con estado explicito: los grafos exponen las fronteras de estado necesarias para generacion continua de audio.
- Autocontencion: el paquete no requiere servidor Python para funcionar.
- No soporta clonacion de voz: el propio autor indica que no se incluye encoder de clonacion ni grabacion.
- No se declaran capacidades de tool calling, agentes, vision, audio de entrada ni razonamiento multi-paso; es un modelo exclusivamente text-to-speech.

## Casos de uso

- Lectura por voz en aplicaciones web sin backend: al ejecutarse como WASM sobre ONNX, permite sintetizar texto en el navegador del usuario sin enviar contenido a un servidor, lo que reduce latencia de red y facilita el cumplimiento de requisitos de privacidad.
- Asistentes de voz en aplicaciones de escritorio: el motor Kotlin con JNI y ONNX Runtime permite integrar TTS local en herramientas nativas sin depender de servicios en la nube.
- Accesibilidad para lectores de pantalla y contenido escrito: siete idiomas cubiertos permiten convertir articulos, documentacion o interfaces en audio para personas con discapacidad visual.
- Audiolibros y podcasts generados: la generacion con estado de streaming facilita producir fragmentos largos de audio a partir de texto, siempre que se valide la calidad percibida en el idioma objetivo.
- Sistemas de navegacion y avisos por voz en dispositivos embebidos: al no requerir GPU ni servidor Python, encaja en entornos con CPU modesta, condicionado a que se verifique el rendimiento en el hardware concreto.
- Internacionalizacion de productos: un mismo paquete cubre siete idiomas, lo que simplifica la localizacion de avisos, tutoriales interactivos y respuestas habladas.
- Pruebas automatizadas de interfaces de voz: la ausencia de clonacion y el uso de voces predefinidas fijas hacen que la salida sea reproducible para validar pipelines de audio.
- Distribucion de aplicaciones sin conexion: el bundle puede empaquetarse junto al cliente, permitiendo funcionamiento offline una vez descargado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explicitamente que la validacion cubre comparacion numerica con el modelo upstream, audio real en navegador mediante WASM y el motor Kotlin con ONNX Runtime JNI, y que no se reclama rendimiento en dispositivos fisicos ni aprobacion por escucha subjetiva. Los detalles se encuentran en `validation.json` de cada idioma, no reproducidos aqui.

## Requisitos de hardware

- VRAM: no disponible. No se publican requisitos de memoria ni de VRAM. El modelo esta orientado a inferencia en CPU, por lo que la GPU no es un requisito declarado.
- Tamano en disco: el repositorio completo ocupa 1,2 GB. Incluye los siete idiomas, cada uno con cuatro grafos, tokenizer, voces y manifiesto; no se publica el desglose por idioma ni por grafo.
- GPU recomendadas: no aplica segun la informacion disponible; el foco es CPU y WebAssembly.
- Compatibilidad con GPU de consumo: no disponible. No se documenta ninguna GPU concreta (RTX 4090, A100, H100 u otras).
- Opciones de despliegue: ONNX Runtime (CPU y nativo), ONNX Runtime Web / WebAssembly en navegador, y el motor Kotlin con JNI de escritorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este formato.
- Latencia y throughput: no disponibles. La model card indica que no se garantiza velocidad en tiempo real en todos los dispositivos ni calidad del modelo.
- Requisito de integracion: el consumidor debe implementar el esquema de bundle 3 y fijar un commit concreto del repositorio; estos paquetes no son sustitutos directos de las exportaciones comunitarias de abril.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Cuantizacion | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| Alias-Alias/pocket-3-3-0-tts-onnx | Exportacion ONNX de TTS | 7 | INT8 dinamica por canal | ONNX | CC BY 4.0 | No oficial; esquema de bundle 3; sin clonacion de voz |
| kyutai/pocket-tts-without-voice-cloning | Modelo original de TTS | no disponible en detalle (el export cubre 7) | no disponible | no disponible | no disponible en la informacion | Fuente de los pesos y perfiles de voz; requiere su propio runtime |
| Exportaciones comunitarias de abril | Exportacion ONNX de TTS | no disponible | no disponible | ONNX | no disponible | El autor indica que no son intercambiables con el esquema 3 |
| Otras alternativas TTS (Piper, Kokoro, XTTS, etc.) | Modelos de texto a voz | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la informacion proporcionada |

No se dispone de cifras de rendimiento comparativas entre estas opciones en la informacion facilitada.

## Limitaciones y advertencias

- Exportacion no oficial: no esta respaldada por Kyutai. Los pesos proceden del modelo publico, pero el empaquetado, la cuantizacion y los manifiestos son responsabilidad del autor de la exportacion.
- Sin clonacion de voz: no se incluye encoder de clonacion ni grabacion, por lo que solo pueden usarse las voces predefinidas de `voices.bin`.
- Sin servidor Python: no hay componente servidor; la integracion debe hacerse en el runtime ONNX del cliente.
- Compatibilidad de esquema: los consumidores deben implementar el bundle schema 3 y fijar un commit del repositorio. No son sustitutos directos de las exportaciones comunitarias de abril.
- Validacion limitada: se cubre comparacion numerica con upstream, audio WASM real y el motor Kotlin con JNI. No se reclama rendimiento en dispositivos fisicos ni aprobacion por escucha subjetiva.
- Sin garantia de calidad ni de tiempo real: la model card afirma explicitamente que no se garantiza calidad del modelo ni velocidad en tiempo real en todos los dispositivos.
- Riesgo de alucinacion acustica: al ser un modelo generativo de audio, pueden aparecer artefactos, prosodia incorrecta o pronunciaciones erroneas; no se documentan tasas de error.
- Sesgos: no se publica informacion sobre sesgos de acento, genero o variedad dialectal en las voces incluidas.
- Cobertura de idioma: se declaran siete idiomas, pero no se indica el nivel de calidad relativo de cada uno ni variantes regionales (por ejemplo, espanol de Espana frente a otras variantes).
- Licencia: CC BY 4.0 exige atribucion. El codigo upstream es MIT y se reproduce en cada paquete. Es responsabilidad del integrador conservar los avisos de atribucion y revisar `source-lock.json` y los manifiestos.
- Adopcion nula registrada: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion independiente por parte de la comunidad.
- Madurez: el repositorio se publico y actualizo el mismo dia segun las marcas temporales, sin historial posterior documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Alias-Alias/pocket-3-3-0-tts-onnx
- Modelo base: https://huggingface.co/kyutai/pocket-tts-without-voice-cloning
- Revision concreta del modelo base citada en la model card: https://huggingface.co/kyutai/pocket-tts-without-voice-cloning/tree/e7205b6ee50e654a5ea19f0e9df2b0813b05e921
- Repositorio de codigo de Kyutai Pocket TTS (commit citado): https://github.com/kyutai-labs/pocket-tts/tree/3dbee45d343d7dddd0d105468d17f8dcba14db3e
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
