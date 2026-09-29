# plezentek/ears

## Resumen

`plezentek/ears` es un repositorio de distribucion de modelos de reconocimiento automatico del habla (ASR) en formato ONNX, publicado por el usuario plezentek bajo licencia CC-BY-4.0. No se trata de un modelo entrenado por su autor, sino de un espejo (mirror) del export ONNX int8 de `nvidia/parakeet-tdt_ctc-110m`, reempaquetado junto con el manifiesto que la aplicacion web de 3 & Done lee en tiempo de ejecucion para seleccionar y descargar el modelo.

El modelo subyacente pertenece a la familia Parakeet de NVIDIA y combina dos cabezas de decodificacion, TDT (Token-and-Duration Transducer) y CTC, sobre un encoder convolucional-autoatencional de tipo FastConformer con aproximadamente 110 millones de parametros. El pipeline declarado es `automatic-speech-recognition` y el unico idioma soportado es el ingles.

Su relevancia practica es acotada pero clara: ofrece un artefacto de 110 MB (repo de 0,1 GB) en int8 ONNX pensado para inferencia on-device y en navegador, sin dependencia de GPU ni de servicios en la nube. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un repositorio utilitario vinculado a una aplicacion concreta, no de una publicacion de investigacion con benchmarks propios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder FastConformer con cabezas duales TDT (Token-and-Duration Transducer) y CTC (segun la nomenclatura del modelo de origen `parakeet-tdt_ctc-110m`); detalle de capas no disponible |
| Parámetros totales | 110 millones (aproximado, segun el nombre del modelo de origen) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | int8 (export ONNX cuantizado) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (int8), distribuido en el directorio `parakeet-tdt_ctc-110m/` junto a un manifiesto de aplicacion |

## Arquitectura y entrenamiento

El artefacto distribuido es un export a ONNX del modelo `nvidia/parakeet-tdt_ctc-110m`, cuantizado a int8. La nomenclatura indica un encoder de tipo FastConformer (variante eficiente del Conformer con atencion por bloques y submuestreo temporal) acompañado de dos cabezas de decodificacion: un transductor TDT, que predice conjuntamente tokens y duraciones para acelerar la decodificacion, y una cabeza CTC convencional. Esta combinacion permite elegir entre decodificacion con transductor (mayor precision) o CTC (mayor simplicidad y compatibilidad).

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de tecnicas de ajuste como RLHF o DPO, ni sobre innovaciones tecnicas adicionales mas alla de las implicitas en la arquitectura. El autor de `plezentek/ears` no ha entrenado ni ajustado el modelo: se limita a espejar el export publicado por OpenVoiceOS (`OpenVoiceOS/nvidia-parakeet-tdt_ctc-110m-onnx`) en el commit `40cd0e28e787fc8a2635abf5258e0f886b5304a9`, preservando la licencia CC-BY-4.0 del modelo original. El valor anadido del repositorio es el empaquetado y el manifiesto que consume la aplicacion web de 3 & Done.

## Capacidades

- Reconocimiento automatico del habla (speech-to-text) en ingles, con salida de transcripcion a partir de audio.
- Decodificacion dual: cabeza TDT para transcripcion de mayor calidad y cabeza CTC como alternativa mas ligera.
- Inferencia on-device y en navegador mediante runtime ONNX, sin necesidad de GPU dedicada.
- Descarga en tiempo de ejecucion: la aplicacion lee el manifiesto y recupera los pesos bajo demanda.
- Ejecucion con pesos cuantizados a int8, lo que reduce el tamano del artefacto (del orden de 110 MB) y el consumo de memoria.
- No soporta tool calling ni function calling: no es un modelo de lenguaje, sino un modelo acustico de transcripcion.
- No soporta razonamiento multi-paso, agentes, vision, audio generativo ni modo de pensamiento extendido.
- Capacidad multilingue inexistente: el modelo esta entrenado y declarado unicamente para ingles.
- Deteccion de marcas de tiempo, puntuacion o diarizacion: no disponible en la informacion proporcionada.

## Casos de uso

- Dictado en aplicaciones web: el modelo puede descargarse en el navegador y transcribir la voz del usuario en local, evitando enviar audio a un servidor y reduciendo costes de infraestructura.
- Subtitulado en tiempo real en herramientas de videollamada: al ejecutarse on-device con pesos int8, permite generar subtitulos en ingles sin depender de una API externa ni de conectividad constante.
- Aplicaciones de notas de voz: transcripcion de grabaciones cortas en movil o escritorio, con el modelo cargado una sola vez y reutilizado entre peticiones.
- Asistentes de accesibilidad: conversion de voz a texto para personas con dificultades motoras o auditivas, ejecutandose localmente para preservar la privacidad del audio.
- Procesado por lotes en servidor sin GPU: al ser un ONNX int8 de 110M de parametros, puede ejecutarse en CPU mediante `onnxruntime` para transcribir volumenes moderados de audio.
- Comandos de voz en interfaces sin conexion: integracion en aplicaciones de escritorio o quioscos que requieren funcionar en redes aisladas o con latencia minima.
- Prototipado rapido de pipelines ASR: servir como baseline ligero frente a alternativas mayores antes de escalar a modelos de mas parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el escenario objetivo; el modelo esta pensado para CPU. Con pesos int8 de 110M de parametros, el consumo de memoria en inferencia es del orden de unos cientos de MB incluyendo buffers del runtime.
- GPU recomendadas: no disponibles; el caso de uso declarado es on-device y en navegador, no en GPU de centro de datos.
- Compatibilidad con GPU de consumo: no es el escenario previsto, aunque al ser ONNX podria ejecutarse con `onnxruntime-gpu` en cualquier GPU compatible con CUDA si se dispone del build adecuado.
- Despliegue: `onnxruntime` (CPU), `onnxruntime-web` (WASM/WebGPU) para navegador, y entornos derivados como Transformers.js. No procede `vLLM` ni `TGI`, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Almacenamiento: repositorio de 0,1 GB, incluyendo los pesos ONNX y el manifiesto.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto de audio | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| `plezentek/ears` (Parakeet TDT-CTC 110M int8) | 110 M | Inglés | No disponible | CC-BY-4.0 | ONNX int8 | HuggingFace, 0 descargas |
| `openai/whisper-tiny` | 39 M | Multilingüe | Ventanas de 30 s | MIT | Safetensors, ONNX (terceros) | Ampliamente adoptado |
| `openai/whisper-base` | 74 M | Multilingüe | Ventanas de 30 s | MIT | Safetensors, ONNX (terceros) | Ampliamente adoptado |
| `openai/whisper-small` | 244 M | Multilingüe | Ventanas de 30 s | MIT | Safetensors, ONNX (terceros) | Ampliamente adoptado |

No se dispone de datos de WER comparativos entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, idiomas, licencia y formato. La ventaja de `plezentek/ears` es su empaquetado int8 ONNX listo para navegador y su licencia permisiva con atribucion; la desventaja es que solo cubre ingles y carece de ecosistema de evaluacion publicado.

## Limitaciones y advertencias

- Repositorio espejo, no modelo original: el autor no ha entrenado ni validado el modelo; cualquier problema de calidad es atribuible al export de origen.
- Sin benchmarks publicados: no hay evidencia de WER ni de rendimiento comparativo en la informacion disponible.
- Cero adopcion registrada (0 descargas, 0 likes), lo que implica ausencia de validacion por parte de la comunidad.
- Idioma unico: no procesa audio en castellano ni en ninguna otra lengua distinta del ingles; usarlo fuera de ese idioma producira transcripciones incorrectas.
- Cuantizacion int8: la reduccion de precision puede degradar ligeramente la calidad de transcripcion frente al modelo en precision completa, especialmente con audio ruidoso o acentos marcados.
- Alucinacion acustica: como todo sistema ASR, puede generar texto plausible en segmentos de silencio, ruido o musica; conviene aplicar deteccion de actividad vocal y filtros posteriores.
- Sesgos: no hay informacion sobre la composicion demografica o acustica del dataset de entrenamiento, por lo que no puede evaluarse el sesgo por acento, genero o edad.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a atribuir la autoria del modelo original (NVIDIA) y a indicar los cambios realizados; conviene revisar tambien las condiciones del repositorio de OpenVoiceOS del que procede el export.
- Contexto de audio no documentado: se desconoce la duracion maxima de audio que el modelo maneja con fiabilidad, lo que obliga a fragmentar entradas largas de forma conservadora.
- No apto como modelo de lenguaje: no admite instrucciones, tool calling ni generacion libre; cualquier integracion agentica requeriria un LLM adicional que consuma la transcripcion.
- Fecha de publicacion adelantada (2026-09-29) en los metadatos del repositorio: conviene verificar la integridad y procedencia de los artefactos antes de usarlos en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/plezentek/ears
- Modelo de origen: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Export ONNX de referencia: https://huggingface.co/OpenVoiceOS/nvidia-parakeet-tdt_ctc-110m-onnx (commit `40cd0e28e787fc8a2635abf5258e0f886b5304a9`)
- No se han encontrado en la busqueda web otros enlaces relevantes al modelo (papers, blogs o demos).
