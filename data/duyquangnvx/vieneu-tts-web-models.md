# duyquangnvx/vieneu-tts-web-models

## Resumen

`duyquangnvx/vieneu-tts-web-models` no es un modelo entrenado por su autor, sino un conjunto de artefactos de despliegue: los 30 ficheros que una build de navegador de VieNeu-TTS v3 Turbo descarga, aplanados en un unico directorio para que un cargador pueda obtenerlos desde una unica URL base. El repositorio es explicito al declararse **no oficial**: reempaqueta componentes de `pnnbao-ump/VieNeu-TTS-v3-Turbo` (el modelo TTS) y de `OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX` (el decodificador de codec de audio), y no cuenta con el respaldo de los proyectos upstream.

El problema que resuelve es de logistica e integridad de despliegue en el navegador. Frente a una distribucion fragmentada en varios repositorios, aqui se reunen los grafos ONNX, los pesos compartidos, las cabezas de decodificacion y el diccionario de grafema a fonema (G2P) en un solo punto, con un `manifest.json` que registra el tamano real y el sha256 de cada fichero. El cargador nombra su cache a partir de un `version` derivado del hash de todos los artefactos, de modo que se recomienda fijar un commit y no `main` para evitar servir bytes nuevos a un navegador que conserva los antiguos.

Es relevante ahora porque permite sintesis de voz en vietnamita ejecutada integramente en el cliente, sin backend de inferencia, siempre que la pagina este en aislamiento cross-origin (COOP `same-origin` + COEP `require-corp`). El tamano del repositorio es de 0,3 GB, la licencia es Apache-2.0 heredada de todos los componentes upstream y el pipeline declarado en el Hub es `text-to-speech`. No se publican parametros, contexto ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Se distribuye como un conjunto de grafos ONNX de un pipeline TTS: `vieneu_prefill.onnx`, `vieneu_decode_step.onnx`, `vieneu_acoustic_cached.onnx`, `text_head_gather.onnx`, `audio_head_0..15.onnx`, mas el decodificador de codec `moss_audio_tokenizer_decode_{full,step}.onnx` |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no consta que sea una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int8 (los artefactos derivan del directorio `onnx_int8/` del modelo base) |
| Idiomas soportados | Vietnamita e ingles; son las unicas tablas conservadas en `sea_g2p.bin`. El Hub no declara lista de idiomas |
| Licencia | Apache-2.0, heredada de todos los componentes upstream. Se debe conservar `LICENSE` y `NOTICE` en cualquier redistribucion |
| Formato de pesos | ONNX (`.onnx`) con ficheros de pesos compartidos `.data` y cabezas en `.bin` + `.json` |
| Tamano del repositorio | 0,3 GB |
| Numero de ficheros | 30 |
| Autor del repositorio | `duyquangnvx` (repositorio no oficial, sin respaldo de los proyectos upstream) |
| Modelos base | `pnnbao-ump/VieNeu-TTS-v3-Turbo`, `OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX` |
| Libreria | `onnx` (el objetivo de ejecucion es `onnxruntime-web`) |
| Pipeline declarado | `text-to-speech` |
| Descargas / likes | 47 / 0 |
| Fechas declaradas | Creado el 2026-09-12; actualizado el 2026-09-13 |

## Arquitectura y entrenamiento

No hay informacion sobre entrenamiento: el autor no entrena ningun modelo, solo reexporta y reempaqueta pesos existentes. Por tanto, no constan numero de tokens, composicion del dataset ni si hubo RLHF o DPO. La unica afirmacion trazable es que los ficheros `config.json`, `tokenizer.json`, `vieneu_prefill.onnx`, `vieneu_decode_step.onnx`, `vieneu_acoustic_cached.onnx` y `vieneu_backbone_shared.data` se copian sin modificar desde el directorio `onnx_int8/` de `pnnbao-ump/VieNeu-TTS-v3-Turbo`, y que `codec_browser_onnx_meta.json`, `moss_audio_tokenizer_decode_full.onnx`, `moss_audio_tokenizer_decode_step.onnx` y `moss_audio_tokenizer_decode_shared.data` se copian sin modificar de `OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX`.

La estructura de ficheros sugiere un pipeline de decodificacion por pasos con cache acustica (prefill mas paso de decodificacion), una matriz de salida de texto separada (`text_head_gather.onnx`) y una matriz de salida de audio particionada en 16 grafos (`audio_head_0..15.onnx`), presumiblemente para trocear un vocabulario de salida grande en unidades manejables por el runtime del navegador. Debe subrayarse que esta lectura se deduce de los nombres de los ficheros, no de documentacion tecnica publicada en la informacion disponible.

Las modificaciones respecto a los originales son tres. Primero, `heads_small.{json,bin}`, `text_head_gather.onnx` y `audio_head_0..15.onnx` se generaron a partir de `onnx_int8/vieneu_v3_heads.npz` del repositorio base para que la tabla `audio_emb` permanezca dentro de los grafos ONNX en lugar de convertirse en un array de JavaScript. Segundo, `sea_g2p.bin` parte del diccionario de `sea-g2p 0.9.1` con las secciones de tailandes e indonesio eliminadas, conservando las tablas de vietnamita e ingles byte a byte (la exportacion se aborta si difieren); el motivo declarado es que esas secciones se construyeron con datos bajo terminos que la distribucion del paquete no reproduce. Tercero, `manifest.json` se genera con el tamano y el sha256 reales de cada fichero.

## Capacidades

- Sintesis de voz (text-to-speech) en vietnamita, y presumiblemente en ingles a traves de las tablas G2P conservadas, con la salvedad de que no hay documentacion de calidad o cobertura por idioma.
- Ejecucion integra en el cliente mediante `onnxruntime-web`, sin servidor de inferencia.
- Decodificacion por pasos gracias a los grafos `prefill` y `decode_step`, lo que habilita generacion incremental de audio.
- Conversion de grafema a fonema mediante `sea_g2p.bin` (subset vietnamita + ingles de `sea-g2p 0.9.1`).
- Decodificacion de codec de audio neuronal mediante el tokenizador MOSS en su variante `full` y `step`.
- Verificacion de integridad y versionado de cache: `manifest.json` expone `(name, bytes, sha256)` por artefacto y un `version` derivado del hash conjunto.
- Carga cross-origin mediante `fetch()` en modo CORS, compatible con paginas aisladas por COOP `same-origin` y COEP `require-corp`.
- No hay soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio de entrada. Estas capacidades no aplican ni se documentan para este repositorio.
- El repositorio contiene artefactos, no un cargador completo: la logica de orquestacion la aporta la aplicacion cliente.

## Casos de uso

- Lectura en voz alta de contenido web en vietnamita: una aplicacion puede sintetizar articulos, noticias o documentacion sin enviar el texto a ningun servidor, lo que reduce el coste marginal a cero por caracter y evita exponer contenido potencialmente sensible.
- Accesibilidad para personas con discapacidad visual en sitios en vietnamita: al ejecutarse en el navegador, la voz esta disponible aunque el usuario no tenga conexion estable una vez cacheados los 0,3 GB de artefactos.
- Aplicaciones web progresivas offline-first: la cache se nombra a partir del `version` del `manifest.json`, de modo que la aplicacion puede invalidar de forma determinista los bytes antiguos cuando se reexporta el conjunto.
- Extensiones de navegador para aprendizaje de idiomas: pronunciacion de vocabulario y frases en vietnamita e ingles, apoyandose en las tablas G2P incluidas en `sea_g2p.bin` y sin dependencia de una API de voz externa.
- Distribucion interna en CDN corporativa: los 30 ficheros pueden replicarse en un unico prefijo de URL y servirse desde ahi, siempre que se conserve `LICENSE` y `NOTICE` y se pinne un commit concreto en lugar de `main`.
- Pruebas de integracion y demos tecnicas: cargar el pipeline desde una sola `BASE` con un identificador de commit fijo permite validar el flujo de descarga, aislamiento cross-origin y decodificacion sin montar infraestructura de inferencia.
- Generacion de audio sintetico para conjuntos de prueba internos o simulaciones de interfaz de voz, verificando antes la compatibilidad de la licencia y de los terminos de los componentes upstream.
- Plataformas de e-learning con requisitos estrictos de privacidad: al no salir el texto del dispositivo, encaja en entornos donde enviar contenido de alumnos a un servicio de TTS en la nube no es viable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de calidad de sintesis (MOS, WER, similitud de locutor), latencia ni throughput, y la busqueda web asociada no devolvio resultados relacionados con el modelo: los unicos resultados obtenidos corresponden a pruebas de velocidad de conexion de MyBroadband y no guardan relacion con este repositorio.

## Requisitos de hardware

- VRAM dedicada: no aplica ni esta disponible. El objetivo de ejecucion declarado es el navegador a traves de `onnxruntime-web`, no una GPU de servidor.
- Memoria del cliente: el repositorio ocupa 0,3 GB, cifra que representa la descarga y los pesos en disco o cache; no se especifica el pico de memoria en tiempo de ejecucion.
- GPU de navegador: no disponible. Se puede intentar aceleracion mediante WebGPU si el navegador la soporta, pero no hay datos publicados de rendimiento.
- Tarjetas tipo A100, H100 o RTX 4090: no hay ninguna recomendacion de este tipo en la informacion disponible, porque el caso de uso previsto es el cliente.
- Cabe en GPU de consumo: no disponible como dato del repositorio; el modelo esta pensado para ejecutarse en el dispositivo del usuario, no para un servidor con GPU.
- Opciones de despliegue: `onnxruntime-web`, con la pagina servida en aislamiento cross-origin (COOP `same-origin` + COEP `require-corp`) y descarga por `fetch()` en modo CORS. Servidores como vLLM, llama.cpp, Ollama o TGI no se documentan para este conjunto de artefactos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se aportaron datos verificables de alternativas externas en la informacion proporcionada. La unica comparacion trazable es con los propios componentes que este repositorio reempaqueta.

| Modelo o componente | Relacion | Parametros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|
| `duyquangnvx/vieneu-tts-web-models` | Reempaquetado ONNX para navegador; no oficial | No disponible | No disponible | Apache-2.0 | No disponible |
| `pnnbao-ump/VieNeu-TTS-v3-Turbo` | Modelo TTS upstream; de su carpeta `onnx_int8/` provienen los grafos principales | No disponible | No disponible | La model card indica Apache-2.0 heredada de los componentes upstream | No disponible |
| `OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX` | Decodificador de codec de audio upstream | No disponible | No disponible | La model card indica Apache-2.0 heredada de los componentes upstream | No disponible |
| Otras soluciones de TTS en navegador (por ejemplo Piper o Kokoro) | Categoria equivalente (TTS ONNX ejecutable en cliente) | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Repositorio no oficial: los proyectos upstream no lo respaldan, y no se ofrece ningun compromiso de mantenimiento, soporte ni actualizacion.
- Contiene artefactos, no un cargador funcional: sin la logica de orquestacion de la aplicacion cliente, los 30 ficheros por si solos no generan audio.
- Dependencia estricta del aislamiento cross-origin: si la pagina no aplica COOP `same-origin` y COEP `require-corp`, la carga de los ficheros fallara porque el Hub no envia `Cross-Origin-Resource-Policy` y una peticion en `no-cors` quedaria bloqueada.
- Riesgo de desajuste de cache: cargar desde `main` en lugar de un commit fijo puede servir bytes nuevos a un navegador que conserva los antiguos; la propia model card recomienda pinnear el commit.
- `sea_g2p.bin` esta modificado: se han eliminado las secciones de tailandes e indonesio, por lo que no debe esperarse soporte de sintesis en esos idiomas a traves de este diccionario.
- Cobertura idiomatica limitada: vietnamita e ingles son las unicas tablas conservadas; no se declara ningun otro idioma ni se documenta la calidad por variedad dialectal.
- Cuantizacion int8: los pesos proceden de la exportacion `onnx_int8/`, con la posible perdida de fidelidad acustica que ello implica; no se publican mediciones al respecto.
- Ausencia total de benchmarks: no hay MOS, WER, latencia ni comparaciones, de modo que cualquier despliegue en produccion requiere una evaluacion propia.
- Senales de validacion comunitaria muy bajas: 47 descargas y 0 likes en el momento de la consulta.
- Obligaciones de licencia: Apache-2.0 se hereda de todos los componentes upstream y la redistribucion debe conservar `LICENSE` y `NOTICE`; el `NOTICE` recoge la trazabilidad completa de atribucion, relevante porque una de las secciones eliminadas del diccionario G2P procedia de datos cuyos terminos no estaban reproducidos en el paquete original.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto factual, pero si existe riesgo de artefactos acusticos, pronunciacion incorrecta y desviaciones de prosodia, no medidos en la informacion disponible.
- Metadatos del Hub llamativos: las fechas declaradas de creacion y actualizacion (12 y 13 de septiembre de 2026) conviene tratarlas con cautela a la hora de evaluar la antiguedad real del contenido.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/duyquangnvx/vieneu-tts-web-models
- Modelo base TTS: https://huggingface.co/pnnbao-ump/VieNeu-TTS-v3-Turbo
- Repositorio GitHub del proyecto TTS upstream: https://github.com/pnnbao97/VieNeu-TTS
- Codec de audio base: https://huggingface.co/OpenMOSS-Team/MOSS-Audio-Tokenizer-Nano-ONNX
- Diccionario de grafema a fonema `sea-g2p 0.9.1`: https://pypi.org/project/sea-g2p/0.9.1/
- Fichero de licencia dentro del repositorio: `LICENSE` (relativo a la raiz del repositorio)
- Fichero de atribucion y trazabilidad de licencias: `NOTICE` (relativo a la raiz del repositorio)
- Manifest de integridad y version: `manifest.json` (relativo a la raiz del repositorio)
- Busqueda web: no se encontraron resultados relevantes; las unicas entradas devueltas pertenecen a MyBroadband (pruebas de velocidad de conexion) y no guardan relacion con el modelo.
