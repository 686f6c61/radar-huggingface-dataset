# electricpipelines/Qwen3.5-9B-abliterated-GGUF

## Resumen

Qwen3.5-9B-abliterated-GGUF es una distribucion en formato GGUF del modelo `lukey03/Qwen3.5-9B-abliterated`, que a su vez es una version "abliterated" (con los rechazos eliminados mediante ablacion de direcciones de activacion) del `Qwen/Qwen3.5-9B` del equipo Qwen. El repositorio lo publica el usuario electricpipelines como nivel Bronze de la coleccion "DeepSeek Unchained". El modelo base tiene 8.953.803.264 parametros (aproximadamente 9B) y arquitectura transformer densa de la familia Qwen3.5.

El repositorio contiene un unico fichero GGUF en cuantizacion Q4_K_M de 5.627.044.704 bytes (5,63 GB), copiado byte a byte de la cuantizacion original de lukey03 sin recuantizar ni modificar. El sha256 del fichero coincide con el del repositorio de origen. Se trata de un fichero solo texto, sin componente mmproj, por lo que no incluye capacidades de vision multimodal.

La relevancia de esta ficha radica en que documenta una variante sin alineamiento de seguridad de un modelo Qwen3.5 de 9B, empaquetada para inferencia local con llama.cpp. Requiere una version reciente de llama.cpp que soporte la arquitectura `qwen35` (probado con b10919) y, por defecto, el modelo activa el modo de razonamiento ("thinking"), que puede desactivarse pasando `enable_thinking=false` en la plantilla de chat o `--reasoning off` en llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa, familia Qwen3.5 (arquitectura `qwen35` en llama.cpp) |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado); existen Q3_K_M, Q5_K_M, Q6_K y Q8_0 medidos pero no publicados en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3.5-9B) |
| Formato de pesos | GGUF (fichero `Qwen3.5-9B-abliterated-Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo subyacente es `Qwen/Qwen3.5-9B`, un transformer denso de aproximadamente 9B parametros de la familia Qwen3.5. Sobre el se aplico una abliteracion, una tecnica que identifica y elimina las direcciones de activacion asociadas al comportamiento de rechazo, de modo que el modelo deja de negarse a responder a peticiones que el modelo original rechazaria. La abliteracion no anade conocimiento nuevo ni elimina sesgos del entrenamiento original; solo modifica el comportamiento de rechazo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base. El proceso de cuantizacion a Q4_K_M se realizo con `llama-quantize` de llama.cpp b10919 sin imatrix, y fue evaluado frente al F16 de origen con `llama-perplexity` (wikitext-2-raw test, contexto 512, 100 chunks) y `llama-bench` en un Apple M4 Max con 128 GB de memoria.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del modelo Qwen3.5-9B.
- Modo de razonamiento ("thinking") activado por defecto; desactivable con `enable_thinking=false` en la plantilla de chat o `--reasoning off` en llama.cpp.
- Comportamiento sin rechazos: responde a peticiones que el Qwen3.5-9B original rechazaria.
- Inferencia local en CPU y GPU mediante llama.cpp.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades de vision: no disponibles en este fichero (solo texto, sin mmproj).
- Soporte de tool calling, agentes y capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: permite estudiar como se comporta un modelo de 9B cuando se eliminan sus rechazos, comparando respuestas con el Qwen3.5-9B original en el mismo prompt.
- Evaluacion de tecnicas de abliteracion: util para reproducir y medir el efecto de la ablacion sobre la distribucion de salida, usando las metricas KLD y "same top token" publicadas frente al F16.
- Inferencia local en equipos de sobremesa: el fichero Q4_K_M de 5,63 GB cabe en GPUs de consumo con 8 GB o mas de VRAM, lo que permite ejecutar un modelo de 9B en hardware asequible con llama.cpp.
- Generacion de texto creativo sin restricciones de contenido: escritura de ficcion, guiones o narrativa que requiera tematicas que el modelo original rechazaria, asumiendo la responsabilidad de uso.
- Despliegue en pipelines de investigacion con llama.cpp: integracion en flujos que ya usan llama.cpp b10919 o posterior y necesitan un modelo conversacional de 9B cuantizado.
- Pruebas de robustez y red teaming: generacion de respuestas sin filtros para analizar riesgos, sesgos y comportamientos indeseados antes de decidir politicas de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card si incluye metricas de fidelidad de cuantizacion y velocidad medidas en un Apple M4 Max con 128 GB:

| Quant | Tamano (GB) | KLD media | KLD p99 | Mismo token top (%) | Ratio PPL vs F16 | pp512 (t/s) | tg128 (t/s) |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q3_K_M | 4,62 | 0,1757 | 1,371 | 81,15 | 1,0230 | 699,6 | 46,57 |
| Q4_K_M | 5,63 | 0,0530 | 0,455 | 88,86 | 1,0352 | 739,2 | 50,54 |
| Q5_K_M | 6,47 | 0,0170 | 0,147 | 94,13 | 1,0165 | 728,9 | 44,54 |
| Q6_K | 7,36 | 0,0055 | 0,043 | 96,57 | 1,0012 | 763,3 | 45,50 |
| Q8_0 | 9,53 | 0,0005 | 0,004 | 98,94 | 1,0018 | 882,2 | 41,73 |

Solo se publica el fichero Q4_K_M en este repositorio. Las metricas de velocidad corresponden a hardware Apple Silicon, no a GPU dedicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,6 GB para el fichero Q4_K_M, mas overhead de contexto y cache KV.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM; el modelo cabe en tarjetas de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090.
- Cabe en GPU de consumo: si, con 8 GB o mas de VRAM en cuantizacion Q4_K_M.
- Opciones de despliegue: llama.cpp (version reciente con soporte de arquitectura `qwen35`, probado con b10919). No se confirma soporte en vLLM, Ollama o TGI en la informacion disponible.
- Latencia y throughput: en Apple M4 Max con 128 GB, Q4_K_M alcanza 739,2 t/s en prefill (pp512) y 50,54 t/s en generacion (tg128) segun `llama-bench`. No hay datos para GPU dedicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| electricpipelines/Qwen3.5-9B-abliterated-GGUF | 8,95B | no disponible | GGUF Q4_K_M | Apache-2.0 | Copia byte a byte de lukey03, solo texto |
| lukey03/Qwen3.5-9B-abliterated | 8,95B | no disponible | safetensors y GGUF | Apache-2.0 | Modelo de origen de la abliteracion y cuantizacion |
| Qwen/Qwen3.5-9B | 8,95B | no disponible | safetensors | Apache-2.0 | Modelo base con alineamiento de seguridad intacto |
| huihui-ai Qwen3.5-abliterated (coleccion) | no disponible | no disponible | no disponible | no disponible | Coleccion alternativa de variantes abliterated de Qwen3.5 |

## Limitaciones y advertencias

- El modelo ha eliminado sustancialmente su alineamiento de seguridad: cumplira peticiones que el Qwen3.5-9B original rechaza. El usuario es responsable del uso y del contenido generado.
- La abliteracion no anade conocimiento ni elimina los sesgos del entrenamiento original; los sesgos del modelo base persisten.
- Riesgo de alucinacion inherente a los modelos de lenguaje de 9B; no se han publicado evaluaciones especificas de fidelidad factual.
- Requiere una version reciente de llama.cpp con soporte de arquitectura `qwen35`; versiones antiguas no cargaran el fichero.
- El modo de razonamiento esta activado por defecto y debe desactivarse explicitamente si no se desea.
- Solo se publica la cuantizacion Q4_K_M; no hay versiones de mayor fidelidad (Q5, Q6, Q8) en este repositorio.
- Fichero solo texto: sin componente mmproj, no hay capacidades multimodales.
- Licencia Apache-2.0 permite uso comercial, pero el uso debe ajustarse a la legislacion aplicable y a las politicas del desplegador.
- No hay informacion sobre idiomas soportados ni longitud de contexto en la documentacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/electricpipelines/Qwen3.5-9B-abliterated-GGUF
- Modelo base abliterated (lukey03): https://huggingface.co/lukey03/Qwen3.5-9B-abliterated
- Cuantizaciones GGUF originales de lukey03: https://huggingface.co/lukey03/Qwen3.5-9B-abliterated-GGUF
- Modelo original Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Coleccion Qwen3.5-abliterated de huihui-ai: https://huggingface.co/collections/huihui-ai/qwen35-abliterated
