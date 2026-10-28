# fusorlabs/d1-omni-2b-web

## Resumen

`fusorlabs/d1-omni-2b-web` no es un checkpoint de pesos al uso, sino un artefacto de despliegue: el modelo `LiquidAI/d1-Omni-2B` (revision `4cccbfd5ba3405ee0f973134bd03e0d9d60ef1d8`) compilado por fusorlabs en un bundle para el runtime de navegador `liquidai-lmf3-wasm`. El paquete contiene las matrices de pesos cuantizadas con el perfil `q7` y un `manifest.json` que describe cada tensor y cada parte del archivo, de modo que el runtime pueda cargarlo y verificar su integridad en el propio dispositivo.

El modelo resuelve un problema concreto de despliegue: ejecutar un modelo omni (audio y texto, con entrada de imagen) sobre la CPU del dispositivo dentro de un navegador, sin backend con GPU y sin enviar los datos del usuario a un servidor. Segun la model card, el bundle responde preguntas nombradas y tipadas sobre un estado, sus imagenes y sus clips de audio en una sola pasada.

La relevancia de esta publicacion es acotada y hay que leerla con precision: es un artefacto derivado, con 0 descargas y 0 likes en el momento de la consulta, que solo funciona con un runtime especifico y que ha eliminado la salida de voz del checkpoint original. Para un desarrollador es util como referencia de compilacion edge y como ejemplo de empaquetado verificado por hash, no como sustituto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; derivada de `LiquidAI/d1-Omni-2B` (tag `lfm3_omni`) |
| Parametros totales | ~2B (segun el nombre del modelo base; no se detalla cifra exacta) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Perfil `q7`: 7 bits en todas las matrices grandes; `f32` en el patch embedding y en el subsampler de audio. No se documentan otros perfiles |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (`lfm1.0`) |
| Formato de pesos | Bundle propietario de fusor-ai: `manifest.json` + partes nombradas por su hash BLAKE3. No es safetensors ni GGUF |
| Tamano del repositorio | 2,3 GB |
| Modalidad | `audio-text-to-text` (entrada de audio, imagen y texto; salida de texto) |
| Runtime requerido | `liquidai-lmf3-wasm` (WebAssembly, CPU del dispositivo) |
| Revision del modelo base | `4cccbfd5ba3405ee0f973134bd03e0d9d60ef1d8` |
| Fecha de publicacion | 2026-10-28 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base: no se detallan el tipo de bloque (transformer, MoE o hibrido), el numero de capas, las dimensiones ocultas ni la composicion del dataset de entrenamiento. El unico dato estructural que aporta la ficha es que el proceso de compilacion distingue dos componentes que se mantienen en `f32` mientras el resto se reduce a 7 bits: el *patch embedding* (propio de la ruta de vision) y el *subsampler* de audio, lo que confirma que el modelo procesa al menos dos modalidades de entrada ademas del texto.

Tampoco se documentan fases de RLHF, DPO ni preferencias humanas, ni el numero de tokens de entrenamiento. Lo que si es verificable es la innovacion de ingenieria del artefacto: la compilacion con calibracion tomada del checkpoint original, la eliminacion de la cabeza de salida de voz y un esquema de integridad en el que cada parte del bundle se nombra con su hash BLAKE3 y el runtime lo comprueba a medida que carga. Ese diseño traslada la verificacion de pesos al cliente, algo poco habitual en artefactos de inferencia.

## Capacidades

- Respuesta a preguntas nombradas y tipadas sobre un estado, sus imagenes y sus clips de audio en una sola pasada, segun la descripcion del autor.
- Procesamiento conjunto de audio, imagen y texto (pipeline `audio-text-to-text`).
- Inferencia en CPU dentro del navegador mediante WebAssembly, sin backend remoto.
- Verificacion de integridad de los pesos en tiempo de carga mediante hashes BLAKE3.
- Salida limitada a texto: la cabeza de salida de voz del checkpoint original se ha eliminado en este bundle.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Modo *thinking* explicito: no disponible.

## Casos de uso

- **Asistente de analisis de audio en el navegador**: el bundle permite cargar un clip de audio y formular preguntas tipadas sobre su contenido sin que el archivo salga del dispositivo, lo que resulta adecuado para aplicaciones donde el audio es sensible (entrevistas, consultas medicas, grabaciones personales).
- **Etiquetado y triaje local de imagenes y audio**: util como primer filtro en un flujo de trabajo que descarta o clasifica contenido en el cliente antes de enviar solo lo relevante a un modelo mayor en servidor, reduciendo coste de inferencia y volumen de datos transferidos.
- **Demos interactivas sin GPU**: publicar un Space o una pagina estatica que ejecute el modelo en la CPU del visitante elimina el coste de hosting de inferencia y evita colas de espera; el propio autor mantiene una demo en `fusorlabs/liquidai-lmf3-wasm`.
- **Aplicaciones de privacidad por diseno (RGPD)**: al no existir llamada a un servicio externo, el tratamiento de datos se mantiene en el equipo del usuario, lo que simplifica el analisis de minimizacion y transferencias internacionales en un despliegue europeo.
- **Prototipado offline en campo**: escenarios sin conectividad estable (inspeccion tecnica, trabajo rural, formacion presencial) donde un portatil con navegador puede ejecutar el modelo sin depender de red.
- **Referencia de empaquetado para equipos de plataforma**: el par `manifest.json` + partes con hash BLAKE3 sirve como patron reproducible para distribuir pesos de terceros con verificacion criptografica en el cliente; el autor documenta la reproduccion con `just model` en el repositorio del runtime.
- **Validacion de artefactos en CI**: el esquema de hashes permite comprobar en un pipeline que el bundle desplegado coincide bit a bit con el compilado, algo relevante en entornos regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, WER ni ninguna otra evaluacion cuantitativa, ni del bundle ni del modelo base. Tampoco se documentan latencia, throughput ni consumo de memoria medidos.

## Requisitos de hardware

- **GPU**: no se requiere. El artefacto esta disenado para ejecutarse en la CPU del dispositivo a traves de WebAssembly.
- **Memoria**: los pesos ocupan 2,3 GB en el repositorio; con el overhead del runtime y del navegador, hay que prever un margen por encima de esa cifra (estimacion orientativa de 3 a 4 GB de RAM disponible). No hay medicion oficial.
- **Consumer**: en principio cabe en portatiles y equipos de sobremesa convencionales, e incluso en moviles de gama alta, siempre que el navegador soporte WebAssembly y la memoria disponible lo permita. No se detalla si el runtime explota SIMD, hilos o WebGPU.
- **Aceleradores**: no aplica; el bundle no se ejecuta sobre CUDA, ROCm ni Metal por esta via.
- **Opciones de despliegue**: exclusivamente el runtime `liquidai-lmf3-wasm`. No es compatible con vLLM, llama.cpp, Ollama, TGI, Transformers ni ONNX Runtime.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Runtime | Licencia | Comentario |
|---|---|---|---|---|---|---|
| `fusorlabs/d1-omni-2b-web` | ~2B | No disponible | Bundle fusor-ai (`q7` + `f32` parcial) | `liquidai-lmf3-wasm` (WASM, CPU) | LFM v1.0 | Solo texto de salida; verificacion BLAKE3 |
| `LiquidAI/d1-Omni-2B` | ~2B | No disponible | No disponible en la informacion | Stack de inferencia convencional | LFM v1.0 | Modelo base; conserva la salida de voz |
| Alternativas on-device de audio | No disponible | No disponible | No disponible | No disponible | No disponible | La busqueda web no devolvio informacion tecnica verificable sobre modelos comparables |

La comparacion significativa es con el modelo base: mismo origen y licencia, pero el bundle renuncia a la generacion de voz, reduce la precision a 7 bits en las matrices grandes y queda atado a un unico runtime a cambio de ejecutarse sin GPU en el navegador.

## Limitaciones y advertencias

- **Compatibilidad cerrada**: el artefacto solo carga en `liquidai-lmf3-wasm`. No sirve como checkpoint para fine-tuning ni para servir con herramientas estandar.
- **Salida de texto unicamente**: la cabeza de sintesis de voz del modelo original se ha eliminado en la compilacion, de modo que no puede generar habla.
- **Cuantizacion agresiva**: el perfil `q7` con matrices grandes a 7 bits puede degradar la calidad respecto al checkpoint original; no se han publicado evaluaciones comparativas que cuantifiquen esa perdida.
- **Alucinacion**: no hay datos de evaluacion de fidelidad para este bundle ni para el modelo base en la informacion disponible; en tareas de pregunta-respuesta sobre audio e imagen el riesgo de respuestas plausibles pero incorrectas debe considerarse alto por defecto.
- **Idiomas no declarados**: el autor no especifica cobertura linguistica, por lo que no se puede asumir un rendimiento aceptable en castellano sin evaluacion previa.
- **Licencia**: LFM Open License v1.0 es una licencia propia, no aprobada por la OSI. Antes de un uso comercial hay que revisar el texto de `LICENSE` y sus condiciones de atribucion y de cesion de derechos sobre las salidas.
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta, publicacion sin validacion de la comunidad y sin historial de issues. No es una dependencia adecuada para produccion sin auditoria propia.
- **Contexto desconocido**: se desconoce la ventana de contexto, lo que impide dimensionar conversaciones multi-turno o audios largos.
- **Trazabilidad de datos**: no se documenta que datos se usaron en el entrenamiento del modelo base, lo que dificulta evaluar riesgos de sesgo y de propiedad intelectual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fusorlabs/d1-omni-2b-web
- Modelo base `LiquidAI/d1-Omni-2B`: https://huggingface.co/LiquidAI/d1-Omni-2B
- Demo (Space): https://huggingface.co/spaces/fusorlabs/liquidai-lmf3-wasm
- Runtime `liquidai-lmf3-wasm`: https://github.com/fusor-rs/liquidai-lmf3-wasm
- Repositorio `fusor-ai`: https://github.com/fusor-rs/fusor-ai
- Licencia LFM Open License v1.0: `LICENSE` en el repositorio del modelo
- Revision del checkpoint compilado: `4cccbfd5ba3405ee0f973134bd03e0d9d60ef1d8`

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre su modelo base; los enlaces anteriores proceden exclusivamente de la model card y de los metadatos de HuggingFace.
