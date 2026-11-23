# otter-app/parakeet-tdt-0.6b-v3-gguf

## Resumen

`otter-app/parakeet-tdt-0.6b-v3-gguf` es una distribucion en formato GGUF del modelo de reconocimiento automatico del habla (ASR) `nvidia/parakeet-tdt-0.6b-v3`, publicada por el autor `otter-app` como artefacto que la aplicacion Otter descarga bajo demanda. No se trata de un modelo entrenado por `otter-app`: la model card indica explicitamente que es una copia sin cambios de `vibe-app/parakeet-tdt-0.6b-v3-gguf`, a su vez convertida desde el modelo original de NVIDIA. El repositorio contiene un unico peso cuantizado, `parakeet-tdt-0.6b-v3-Q4_K_M.gguf`, con un tamano de repositorio de 0,5 GB.

El modelo base pertenece a la familia Parakeet de NVIDIA, orientada a transcripcion de voz, y emplea la arquitectura TDT (Token-and-Duration Transducer), una variante de los transductores RNN que predice de forma conjunta tokens y duraciones para acelerar la decodificacion. Con 627.052.166 parametros (dato real de safetensors del modelo base), se situa en la gama de 0,6 mil millones de parametros, un tamano pensado para inferencia eficiente en CPU y GPU de consumo.

Su relevancia practica es doble: por un lado, ofrece una via sencilla de ejecutar un modelo ASR de NVIDIA en el ecosistema GGML/GGUF, lo que permite desplegarlo con herramientas compatibles sin depender del stack original de NeMo; por otro, al ser el artefacto que consume una aplicacion de escritorio, sirve como referencia de como empaquetar modelos ASR para distribucion local. La licencia del modelo base es CC-BY-4.0, lo que permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), transductor RNN; modelo base `nvidia/parakeet-tdt-0.6b-v3` |
| Parametros totales | 627.052.166 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico peso publicado en el repo) |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | GGUF (libreria ggml) |

## Arquitectura y entrenamiento

El modelo base es un transductor TDT de NVIDIA, una evolucion de los transductores RNN en la que el decodificador emite simultaneamente un token y una prediccion de duracion, lo que reduce el numero de pasos de decodificacion frente a los transductores clasicos y mejora la latencia en transcripcion de audio. La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de horas de audio utilizadas, ni si hubo etapas de ajuste fino supervisado o preferencias; estos datos deben consultarse en la model card del modelo original de NVIDIA.

El artefacto de este repositorio es una conversion a GGUF del modelo base, cuantizada a Q4_K_M, realizada por `vibe-app` y redistribuida sin cambios por `otter-app`. No se documenta en la informacion proporcionada ninguna innovacion adicional introducida por la conversion, ni cambios en los pesos mas alla de la cuantizacion. El SHA-256 del fichero `parakeet-tdt-0.6b-v3-Q4_K_M.gguf` es `5c61c041314d87ef1ffc278f5fb1a8ea25cceb8ce6053f8b516bab7ba16d7508`, lo que permite verificar la integridad de la descarga.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto, tarea declarada en el pipeline del repositorio.
- Decodificacion TDT: prediccion conjunta de tokens y duraciones, orientada a reducir latencia frente a transductores convencionales.
- Ejecucion local en formato GGUF mediante la libreria ggml, lo que habilita inferencia en CPU y GPU sin el stack NeMo.
- Integracion en aplicaciones de escritorio: el modelo se disena como descarga bajo demanda de la aplicacion Otter.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplicable (modelo ASR, no generativo de proposito general).
- Capacidades multilingues: no disponible en la informacion proporcionada; debe verificarse en la model card de NVIDIA.
- Capacidades especiales (modo thinking, vision, audio de entrada): audio de entrada como funcion principal; el resto no disponible.

## Casos de uso

- Transcripcion de reuniones y notas de voz en local: el modelo puede ejecutarse con herramientas GGML en el equipo del usuario, sin enviar audio a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Subtitulado automatico de video: integrado en un pipeline que extrae audio y genera transcripciones con marcas temporales, aprovechando el tamano reducido del modelo (0,6 B de parametros) para procesar lotes en CPU.
- Aplicaciones de escritorio con descarga bajo demanda: el artefacto esta pensado para que una app descargue el GGUF en el primer uso; sirve como referencia para empaquetar modelos ASR en instaladores ligeros (repo de 0,5 GB).
- Busqueda sobre audio y actas: transcripcion de grabaciones de clases o entrevistas para indexar el texto resultante en un motor de busqueda o sistema de gestion documental.
- Prototipado rapido de ASR en investigacion: al estar en GGUF, permite comparar la calidad de un transductor TDT de NVIDIA con otros modelos ASR sin montar el entorno NeMo completo.
- Verificacion de integridad en pipelines de distribucion: el SHA-256 publicado permite validar el fichero descargado en un paso de CI antes de desplegarlo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con cuantizacion Q4_K_M y 627 M de parametros, el peso ocupa aproximadamente 0,4-0,5 GB; la VRAM adicional depende del buffer de audio y del runtime GGML. No se dispone de cifras oficiales.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, el modelo es apto para GPUs de consumo, pero no se documentan modelos concretos.
- Cabe en GPU de consumo: si, por el tamano del peso cuantizado; no se especifican modelos verificados.
- Opciones de despliegue: al ser formato GGUF y libreria ggml, es compatible con el ecosistema GGML (por ejemplo, llama.cpp y derivados); la compatibilidad concreta con cada runtime para ASR no esta documentada en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `otter-app/parakeet-tdt-0.6b-v3-gguf` | 627 M | no disponible | GGUF (Q4_K_M) | CC-BY-4.0 | Distribucion de `nvidia/parakeet-tdt-0.6b-v3` |
| `nvidia/parakeet-tdt-0.6b-v3` | 627 M | no disponible | safetensors (NeMo) | CC-BY-4.0 | Modelo original; requiere stack NeMo |
| `vibe-app/parakeet-tdt-0.6b-v3-gguf` | 627 M | no disponible | GGUF | CC-BY-4.0 | Conversion origen de la que deriva este repo |
| Otros modelos ASR de tamano similar | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- Es una redistribucion, no un modelo propio: cualquier limitacion del modelo base de NVIDIA aplica integramente; debe revisarse la model card original antes de usar en produccion.
- Idiomas soportados no documentados en este repositorio; la cobertura linguistica debe confirmarse en la fuente original.
- Riesgo de errores de transcripcion en audio con ruido, acentos marcados o solapamiento de hablantes; no se han publicado tasas de error (WER) en la informacion disponible.
- La cuantizacion Q4_K_M puede degradar ligeramente la calidad respecto a los pesos originales en safetensors; no se documenta la magnitud de esa perdida.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; es obligatorio citar la autoria de NVIDIA y conservar el aviso de licencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2026-11-23; no hay evidencia de uso en produccion ni de mantenimiento continuado.
- No se documentan requisitos de hardware, latencia ni compatibilidad verificada con runtimes concretos; validar antes de integrar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/otter-app/parakeet-tdt-0.6b-v3-gguf
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Conversion de origen: https://huggingface.co/vibe-app/parakeet-tdt-0.6b-v3-gguf
- Aplicacion Otter: https://github.com/victorfu/otter
