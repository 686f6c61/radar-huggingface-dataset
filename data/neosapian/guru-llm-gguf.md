# NeoSapian/GURU-llm-GGUF

## Resumen

GURU-llm (ഗുരു, "maestro" o "guía" en malayalam) es un modelo de generacion de texto de 4.205.751.296 parametros (~4,2 mil millones), desarrollado por NeoSapian y especializado en malayalam e ingles. Esta ficha cubre la version GGUF de su modelo base `NeoSapian/GURU-v1`, publicada para su uso con llama.cpp y Ollama. El modelo se presenta como una herramienta orientada a la comunidad de Kerala y al ecosistema indic, con enfasis en contenido conversacional en malayalam.

La relevancia de este lanzamiento reside en la escasez de modelos abiertos con soporte real de malayalam en el rango de los 4B, un tamano que permite ejecucion en hardware de consumo. La publicacion incluye cuantizaciones calibradas con una importance matrix calculada sobre texto en malayalam, lo que busca preservar la calidad del idioma incluso en precisiones de 4 y 3 bits.

La informacion disponible no detalla la arquitectura interna ni los datos de entrenamiento; las etiquetas del repositorio mencionan `qwen3_5` como referencia de familia, pero este dato no se confirma en la model card. La licencia es Apache 2.0, lo que facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta del repo: `qwen3_5`; sin confirmar en la model card) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, IQ4_XS (imatrix), Q3_K_S (imatrix) |
| Idiomas soportados | malayalam (ml), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo base `NeoSapian/GURU-v1`. La etiqueta `qwen3_5` del repositorio sugiere una posible inspiracion o derivacion de la familia Qwen, pero la model card no lo confirma ni describe el tipo de transformer, el numero de capas, la dimension oculta o el mecanismo de atencion. Tampoco se especifica si hubo fases de RLHF, DPO o ajuste supervisado.

Lo que si se documenta es el proceso de cuantizacion: las versiones GGUF se generaron con llama.cpp (build `b12177`, la version incluida en Ollama 0.40.16) y las cuantizaciones de menor precision (IQ4_XS y Q3_K_S) utilizan una importance matrix calculada sobre texto en malayalam, una tecnica que pondera los pesos mas sensibles al idioma objetivo durante la compresion. El autor advierte que las cuantizaciones de menos bits pueden degradar la salida en malayalam y recomienda Q5_K_M o superior si se detectan errores.

## Capacidades

- Generacion de texto conversacional en malayalam e ingles, con enfasis en el registro formal y cultural de Kerala.
- Respuesta a preguntas sobre administracion publica y programas de bienestar (el ejemplo de la model card consulta sobre los planes de bienestar del gobierno de Kerala).
- Conversacion multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints estilo OpenAI (`endpoints_compatible`), lo que permite integrarlo en clientes que hablan ese protocolo.
- Ejecucion local via llama.cpp y Ollama.
- No se documentan capacidades de codigo, matematicas avanzadas, vision, audio, tool calling ni modo de razonamiento explicito.

## Casos de uso

- Atencion ciudadana en malayalam: un asistente que responda dudas sobre tramites y programas publicos del estado de Kerala, desplegado en local para evitar enviar datos personales a servicios externos.
- Traduccion y adaptacion malayalam-ingles: redaccion de resumenes o versiones bilingues de documentos administrativos, aprovechando el soporte de ambos idiomas.
- Educacion y tutoria: generacion de explicaciones y material de estudio en malayalam para estudiantes, en linea con el nombre "guru" del modelo.
- Despliegue en hardware de consumo: con la cuantizacion Q4_K_M (2,71 GB) cabe en GPUs de gama media y en equipos con poca VRAM, lo que facilita prototipos y demos sin infraestructura dedicada.
- Procesamiento por lotes de texto en malayalam: clasificacion, resumen o extraccion de informacion de corpus locales usando llama.cpp en CPU o GPU modesta.
- Base para ajuste fino: al ser Apache 2.0 y pesar solo 4,2 B, sirve como punto de partida para fine-tuning en dominios especificos del malayalam (legal, sanitario, medios) sin grandes requisitos de computo.
- Integracion en aplicaciones de chat: mediante el endpoint compatible con la API de OpenAI, puede conectarse a interfaces existentes sin reescribir el cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (peso de los ficheros, sin contar KV cache):
  - Q8_0: 4,48 GB
  - Q6_K: 3,46 GB
  - Q5_K_M: 3,07 GB
  - Q4_K_M: 2,71 GB (recomendado por el autor)
  - IQ4_XS: 2,51 GB
  - Q3_K_M: 2,26 GB
  - Q3_K_S: 2,07 GB
- La VRAM real necesaria es superior al tamano del fichero por la cache KV; con contexto largo puede requerir varios GB adicionales (no se especifica la longitud de contexto).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para Q4_K_M con contexto moderado; RTX 3060, RTX 4060, RTX 4090 o A100/H100 para mayor contexto y concurrencia.
- Cabe en GPU de consumo: si, en modelos con 6 GB o mas para las cuantizaciones de 4-5 bits; las de 3 bits pueden caber en 4 GB.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (`ollama run hf.co/NeoSapian/GURU-llm-GGUF:Q4_K_M`). No se documenta soporte nativo en vLLM o TGI para estos ficheros GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas objetivas. No se han identificado en la informacion proporcionada alternativas especificas de 4B con soporte de malayalam.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| GURU-llm (GGUF) | ~4,2 B | no disponible | ml, en | Apache 2.0 | GGUF |
| Alternativas de 4B con malayalam | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El autor indica explicitamente que el modelo no ha sido evaluado para decisiones criticas de seguridad, legales o medicas.
- Las cuantizaciones de 3 bits y IQ4_XS pueden degradar la calidad del malayalam; se recomienda Q5_K_M o superior si aparecen errores.
- No hay informacion sobre sesgos, datos de entrenamiento ni procesos de alineacion, por lo que el riesgo de alucinacion y de respuestas sesgadas no puede acotarse.
- Cobertura linguistica limitada a malayalam e ingles; no se garantiza un comportamiento correcto en castellano ni en otras lenguas indic.
- La longitud de contexto no esta documentada, lo que dificulta planificar casos de uso con documentos largos.
- Los ficheros se construyeron con llama.cpp `b12177`; versiones mas nuevas de Ollama pueden incluir un llama.cpp distinto y cambiar el comportamiento de carga.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar la procedencia del modelo base `GURU-v1` antes de desplegarlo en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/NeoSapian/GURU-llm-GGUF
- Modelo base: https://huggingface.co/NeoSapian/GURU-v1
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
