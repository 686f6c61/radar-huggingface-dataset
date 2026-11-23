# onemira/diar-streaming-sortformer-4spk-v2.1-gguf

## Resumen

`onemira/diar-streaming-sortformer-4spk-v2.1-gguf` es una distribucion en formato GGUF del modelo NVIDIA Streaming Sortformer 4-speaker v2.1, un sistema de diarizacion de hablantes (speaker diarization) en tiempo real capaz de distinguir hasta cuatro hablantes simultaneos. El artefacto lo publica OneMira como parte de su pipeline de producto (grabadora de voz C1 y aplicacion de escritorio) y se ejecuta localmente mediante el runtime `NeMo-Speech.cpp` en formato GGUF. No introduce cambios en los pesos ni en la cuantizacion respecto al modelo original: es una congelacion de bytes del GGUF ya convertido localmente por el autor.

El modelo base es propiedad de NVIDIA y se distribuye bajo la NVIDIA Open Model License. La conversion a GGUF la realizo OneMira de forma local y no conservo el comando de conversion original, por lo que el repositorio no reclama reproducibilidad ni igualdad byte a byte con otros GGUF del indice upstream. Esto es relevante para quien necesite auditar la procedencia del artefacto: el autor incluye un fichero `SOURCE.json` con la procedencia explicita y un `UPSTREAM_MODEL_CARD.md` con la atribucion.

Con 122.862.212 parametros y un fichero de 147.076.352 bytes (~147 MB) en cuantizacion Q8_0, el modelo esta pensado para inferencia en dispositivo (on-device), sin subida obligatoria a la nube. Su relevancia actual radica en que cubre una tarea de audio (diarizacion streaming de 4 hablantes) con un artefacto pequeno y desplegable en local, algo poco comun en el ecosistema GGUF, dominado por LLMs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sortformer (diarizacion de hablantes en streaming); detalles internos de capas no disponibles |
| Parametros totales | 122.862.212 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado) |
| Idiomas soportados | no disponibles en la informacion del modelo; el producto OneMira declara 99 idiomas para su pipeline de Speaker ID |
| Licencia | NVIDIA Open Model License (`nvidia-open-model-license`) |
| Formato de pesos | GGUF (`sortformer.gguf`, 147.076.352 bytes) |
| SHA-256 del fichero | `ce0b583e90957f1d753f69ab20bc8ab064653c2838c06b92381cd1c8bc319e97` |
| Revision upstream de referencia | `cd03eee90fbec18297ac31b8c21546e596b7f71c` |
| Runtime de inferencia | NeMo-Speech.cpp (GGUF) |
| Tamano del repo | 0,1 GB |
| Descargas | 494 |
| Fecha de creacion | 2026-10-09 |
| Ultima actualizacion | 2026-11-19 |

## Arquitectura y entrenamiento

El modelo base es NVIDIA Streaming Sortformer 4-speaker v2.1, un sistema de diarizacion orientado a streaming en tiempo real. La familia Sortformer esta disenada para asignar etiquetas de hablante a tramas de audio a medida que llegan, con un limite de cuatro hablantes simultaneos. La informacion proporcionada no detalla el numero de capas, la dimension oculta, la composicion del dataset de entrenamiento ni si hubo etapas de RLHF o ajuste fino supervisado; esos datos deben consultarse en la model card upstream de NVIDIA.

La innovacion relevante en este artefacto no es arquitectonica sino de empaquetado y despliegue: la conversion a GGUF permite ejecutar el modelo con `NeMo-Speech.cpp` en local, sin dependencia de la pila NeMo completa ni de GPU en la nube. El autor advierte explicitamente que no conservo el comando de conversion, de modo que no se garantiza reproducibilidad ni equivalencia byte a byte con otros GGUF de la misma familia. El fichero incluye `SOURCE.json` con la procedencia y `LICENSE.html` con los terminos upstream.

## Capacidades

- Diarizacion de hablantes en streaming en tiempo real, con hasta cuatro hablantes simultaneos.
- Asignacion automatica de etiquetas de hablante (Speaker ID) a tramas de audio entrantes.
- Ejecucion local en dispositivo tras la descarga inicial del modelo, sin subida obligatoria a la nube.
- Integracion como etapa de pipeline previa a transcripcion y atribucion de hablante en la app OneMira Desktop y la grabadora C1.
- No es un modelo generativo de texto: no soporta generacion, razonamiento, codigo ni matematicas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles en la informacion del modelo; el producto que lo integra declara 99 idiomas para el pipeline completo de Speaker ID.

## Casos de uso

- Transcripcion de reuniones con atribucion de hablante: el modelo etiqueta en streaming hasta cuatro participantes y alimenta la transcripcion con identificacion de quien habla, sin enviar audio a la nube.
- Entrevistas y podcasts: separacion automatica de entrevistador y entrevistado en grabaciones locales, con retencion del WAV estereo original por parte del usuario.
- Grabacion de voz en dispositivo: la grabadora OneMira C1 usa el modelo para el Speaker ID automatico en escenarios de una pulsacion, sin telefono ni portatil.
- Notas de llamadas y reuniones con resumen local: la diarizacion alimenta el pipeline de resumen y extraccion de acciones de la app de escritorio, manteniendo el contexto en local.
- Investigacion en diarizacion: el GGUF permite experimentar con un Sortformer de 4 hablantes en hardware modesto mediante `NeMo-Speech.cpp`, sin montar la pila NeMo.
- Prototipos de privacidad por diseno: aplicaciones que requieren procesamiento de audio sin salida a la nube pueden integrar este artefacto como etapa de identificacion de hablantes.
- Analisis de reuniones con multiples participantes: separacion de hasta cuatro voces para generar actas con atribucion de intervenciones, apoyandose en el contexto de reunion grabada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion del modelo; el fichero Q8_0 ocupa ~147 MB, por lo que el peso en memoria es reducido.
- GPU recomendadas: no disponibles. El modelo esta pensado para ejecucion on-device; la model card no especifica GPU concretas (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el tamano del fichero sugiere que es viable en hardware de consumo, pero no se aporta evidencia.
- Opciones de despliegue: `NeMo-Speech.cpp` (runtime GGUF citado por el autor). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles. El modelo esta disenado para streaming en tiempo real, pero no se publican cifras de latencia ni de factor de tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| onemira/diar-streaming-sortformer-4spk-v2.1-gguf | 122.862.212 | no disponible | Diarizacion streaming 4 hablantes | NVIDIA Open Model License | GGUF en HF, runtime NeMo-Speech.cpp |
| nvidia/diar_streaming_sortformer_4spk-v2.1 | no disponible en esta ficha | no disponible | Diarizacion streaming 4 hablantes | NVIDIA Open Model License | Pesos originales en HF (modelo base) |
| Alternativas de diarizacion de la competencia | no disponible | no disponible | Diarizacion | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos comparables, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- El artefacto no es reproducible: el autor no conservo el comando de conversion y no garantiza igualdad byte a byte con otros GGUF de la familia.
- Licencia NVIDIA Open Model License: revisar los terminos antes de uso comercial; el repositorio incluye `LICENSE.html` con las condiciones upstream.
- Limite estricto de cuatro hablantes simultaneos; escenarios con mas voces requieren otra solucion.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling.
- Idiomas soportados no documentados en la informacion del modelo; los 99 idiomas citados corresponden al producto OneMira, no al artefacto.
- Riesgo de confusion de hablantes en audio con solapamientos, ruido o voces similares: no se documentan tasas de error en la informacion disponible.
- La model card incluye contenido promocional del producto OneMira (resenas, enlaces de tienda); no debe tratarse como evidencia tecnica.
- No se documentan sesgos especificos del modelo en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/onemira/diar-streaming-sortformer-4spk-v2.1-gguf
- Modelo base upstream: https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2.1
- Licencia (copia en el repo): https://huggingface.co/onemira/diar-streaming-sortformer-4spk-v2.1-gguf/blob/main/LICENSE.html
- Producto OneMira C1: https://onemira.com/products/c1
- OneMira C1 en Amazon US: https://www.amazon.com/dp/B0HM6YDLJ4
- Comparativa de grabadoras de voz IA: https://onemira.com/compare
- Guia de grabadora sin suscripcion: https://onemira.com/ai-voice-recorder-without-subscription
- Dataset TCO de grabadoras de voz IA: https://huggingface.co/datasets/onemira/ai-voice-recorder-without-subscription-2026
- OKF Wiki MCP Server (GitHub): https://github.com/onemira-space/okf-wiki-mcp
- Registro MCP oficial: https://registry.modelcontextprotocol.io/v0.1/servers?search=okf-wiki-mcp
- Validador OKF Markdown (npm): https://www.npmjs.com/package/okf-markdown
- MCP Server Card: https://onemira.com/.well-known/mcp/server-card.json
- Plantillas de actas de reunion: https://onemira.com/meeting-minutes-templates
