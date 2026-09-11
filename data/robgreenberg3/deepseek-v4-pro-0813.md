# robgreenberg3/DeepSeek-V4-Pro-0813

## Resumen

DeepSeek-V4-Pro-0813 es un modelo de generacion de texto publicado en Hugging Face bajo el identificador `robgreenberg3/DeepSeek-V4-Pro-0813`, cuya model card se presenta como la version oficial de DeepSeek-V4-Pro y sucesora de la version preliminar (Preview). Segun el autor de la ficha, incorpora mejoras sustanciales en capacidades agenticas y en rendimiento en entornos de produccion, y anade un modulo de decodificacion especulativa denominado DSpark sobre la estructura del modelo Preview. El repositorio declara licencia MIT y esta etiquetado con `transformers`, `safetensors`, `deepseek_v4`, `fp8` y `8-bit`.

El dato de parametros obtenido de los ficheros safetensors es de 1.650.497.936.906 parametros (aproximadamente 1,65 billones), lo que situa al modelo en la categoria de modelos frontera de gran escala. La presencia de backend de expertos en las instrucciones de despliegue (`--enable-expert-parallel`, `--moe-backend deep_gemm_mega_moe`) confirma que se trata de una arquitectura de mezcla de expertos (MoE), aunque el numero de parametros activos por token no se detalla en la informacion disponible. El tamano del repositorio es de 892,8 GB.

Es relevante ahora porque la model card reporta resultados competitivos con modelos propietarios de referencia en tareas de agentes, uso de herramientas y desarrollo de software, y porque el despliegue documentado esta orientado a nodos de alta gama (se cita un nodo de 4xGB300 con vLLM). No obstante, el repositorio figura a nombre de un usuario distinto de la organizacion oficial `deepseek-ai`, con 0 descargas y 0 likes, lo que obliga a tratar la procedencia con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) y modulo de decodificacion especulativa DSpark |
| Parametros totales | 1.650.497.936.906 (~1,65 billones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 (pesos y cache KV), 8-bit, cache del indexador de atencion en fp4 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como una evolucion de DeepSeek-V4-Pro (Preview) con un modulo de decodificacion especulativa DSpark acoplado. Las instrucciones de servicio con vLLM confirman el uso de paralelismo de expertos (`--enable-expert-parallel`) y de un backend MoE especifico (`deep_gemm_mega_moe`), ademas de opciones de atencion con cache de indexador en fp4 (`{"use_fp4_indexer_cache": true}`) y cache KV en fp8. En SGLang se activa el mismo mecanismo especulativo mediante `--speculative-algorithm DSPARK`.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras variantes de ajuste por preferencias. La model card tampoco detalla innovaciones de atencion mas alla de las opciones de cache cuantizada y del propio modulo especulativo DSpark, cuya configuracion recomendada es `num_speculative_tokens: 7` con muestreo greedy del borrador. El modelo no incluye plantilla de chat en formato Jinja; en su lugar se distribuye una carpeta `encoding` con scripts en Python para convertir mensajes en formato compatible con OpenAI a cadenas de entrada y para parsear la salida.

## Capacidades

- Generacion de texto y razonamiento con niveles de esfuerzo configurables: el parametro `reasoning_effort` admite los valores `low`, `high` y `max`, que controlan cuanto delibera el modelo antes de responder (los benchmarks se evaluan con `max`).
- Capacidades agenticas acentuadas: la model card las presenta como el principal salto respecto a la version Preview, con resultados en Agents' Last Exam (25,7), AutomationBench Public (31,8) y Toolathlon-Verified (74,1).
- Uso de herramientas y function calling: evaluado mediante Toolathlon-Verified, con soporte de modo `w tools` en HLE (60,0 frente a 42,7 sin herramientas).
- Generacion y edicion de codigo, incluido trabajo en terminal y desarrollo full-stack: Terminal Bench 2.1 (87,9), NL2Repo (61,5), DeepSWE (62,7), DSBench-FullStack (71,1) y DSBench-Hard (67,2).
- Tareas de ciberseguridad ofensiva/defensiva evaluadas en Cybergym (83,3).
- Decodificacion especulativa integrada (DSpark) para acelerar la generacion en vLLM y SGLang.
- Capacidades multimodales, de vision o de audio: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible; la ficha no declara lista de idiomas.

## Casos de uso

- Agentes autonomos de desarrollo de software: el modelo esta evaluado en tareas de terminal (Terminal Bench 2.1, 87,9) y de resolucion de repositorios (NL2Repo, 61,5), por lo que encaja en pipelines donde el agente ejecuta comandos, interpreta errores y aplica parches de forma iterativa.
- Automatizacion de flujos full-stack: los resultados internos de DSBench-FullStack (71,1) y DSBench-Hard (67,2) lo hacen adecuado para generar y mantener aplicaciones completas con multiples ficheros y dependencias.
- Orquestacion de herramientas empresariales: con Toolathlon-Verified en 74,1 y soporte de modo con herramientas, puede actuar como capa de razonamiento en asistentes que invocan APIs, bases de datos o sistemas de ticketing.
- Analisis y respuesta ante incidentes de seguridad: la puntuacion en Cybergym (83,3) sugiere utilidad en tareas de deteccion, analisis de vulnerabilidades y simulacion de escenarios defensivos dentro de entornos controlados.
- Investigacion asistida y razonamiento complejo: en HLE obtiene 42,7 sin herramientas y 60,0 con herramientas, lo que permite usarlo como asistente de sintesis tecnica cuando se le permite consultar fuentes externas.
- Trabajo de refactorizacion en CI/CD: el soporte de decodificacion especulativa con vLLM (`dspark`, 7 tokens de borrador) reduce el coste por token en cargas de generacion de codigo repetitivas, como revisiones automáticas o generacion de pruebas.
- Despliegue en produccion de alta concurrencia: la configuracion documentada con paralelismo de datos (4) y paralelismo de expertos sobre un nodo 4xGB300 esta pensada para servir el modelo de forma continua, aunque exige infraestructura dedicada.

## Benchmarks y rendimiento

Resultados reportados en la model card del autor (evaluacion con DeepSeek Harness en modo minimal, `reasoning_effort = max`, `temperature = 1.0`, `top_p = 0.95`):

| Benchmark | V4-Pro-0813 | V4-Flash-0731 | V4-Pro (Preview) | V4-Flash (Preview) | GLM-5.2 | Kimi K3 | Opus-4.8 | Fable-5 (w/ fallback) |
|---|---|---|---|---|---|---|---|---|
| HLE (sin / con herramientas) | 42,7 / 60,0 | 37,8 / 51,5 | 37,7 / 48,2 | 34,8 / 45,1 | 40,5 / 54,7 | 43,5 / 56,0 | 49,8 / 57,9 | 53,3 / 63,0 |
| Terminal Bench 2.1 | 87,9 | 82,7 | 72,1 | 61,8 | 81,0 | 88,3 | 85,0 | 88,0 |
| NL2Repo | 61,5 | 54,2 | 38,5 | 39,4 | 48,9 | - | 69,7 | - |
| Cybergym | 83,3 | 76,7 | 52,7 | 38,7 | - | 80,0 | 78,3 | 83,1 |
| DeepSWE | 62,7 | 54,4 | 12,8 | 7,3 | 46,2 | 67,5 | 58,0 | 70,0 |
| Toolathlon-Verified | 74,1 | 70,3 | 55,9 | 49,7 | 59,9 | 76,5 | 76,2 | 77,9 |
| Agents' Last Exam | 25,7 | 25,2 | 16,5 | 15,8 | 23,8 | 27,6 | 25,7 | - |
| AutomationBench (Public) | 31,8 | 25,1 | 12,8 | 10,8 | 12,9 | 30,8 | 27,2 | 29,1 |
| DSBench-FullStack (interna) | 71,1 | 68,7 | 41,8 | 37,0 | 61,8 | 73,7 | 71,6 | 77,2 |
| DSBench-Hard (interna) | 67,2 | 59,6 | 31,1 | 25,8 | 54,5 | 63,0 | 71,7 | 68,3 |

Todos los valores proceden de la model card del autor del repositorio y no han sido verificados de forma independiente en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 892,8 GB. Esta cifra es inferior a la que corresponderia a 1,65 billones de parametros almacenados integramente en fp8 (~1,65 TB), lo que sugiere precision mixta o cuantizacion parcial; la informacion disponible no lo confirma.
- VRAM estimada para inferencia: aproximadamente 1,65 TB si todos los pesos estuvieran en fp8; en torno a 825 GB en una hipotetica cuantizacion de 4 bits. Son estimaciones aritmeticas a partir del recuento de parametros, no cifras publicadas.
- Hardware documentado: la receta de vLLM cita un nodo unico de 4xGB300 con `--data-parallel-size 4` y `--enable-expert-parallel`.
- GPU de consumo (RTX 4090, 24 GB) o estaciones de trabajo con A100/H100 de 80 GB: no es viable alojar el modelo completo en una sola GPU segun los datos disponibles; no se documentan configuraciones de este tipo.
- Opciones de despliegue confirmadas: vLLM (`--trust-remote-code`, `--kv-cache-dtype fp8`, `--block-size 256`, `--moe-backend deep_gemm_mega_moe`, `--speculative-config '{"method":"dspark","num_speculative_tokens":7,"draft_sample_method":"greedy"}'`) y SGLang (`--speculative-algorithm DSPARK`).
- Despliegue con llama.cpp, Ollama o TGI: no disponible; la informacion proporcionada solo documenta vLLM y SGLang, y no se mencionan ficheros GGUF.
- Latencia y throughput: no disponible; la model card solo indica que la decodificacion especulativa DSpark acelera la generacion, sin cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Resultado destacado (HLE con herramientas / Terminal Bench 2.1) |
|---|---|---|---|---|
| DeepSeek-V4-Pro-0813 | 1,65 B (total) | no disponible | MIT (segun el repositorio) | 60,0 / 87,9 |
| DeepSeek-V4-Pro (Preview) | no disponible | no disponible | no disponible | 48,2 / 72,1 |
| DeepSeek-V4-Flash-0731 | no disponible | no disponible | no disponible | 51,5 / 82,7 |
| Kimi K3 | no disponible | no disponible | no disponible | 56,0 / 88,3 |
| Opus-4.8 | no disponible | no disponible | no disponible (propietario) | 57,9 / 85,0 |
| GLM-5.2 | no disponible | no disponible | no disponible | 54,7 / 81,0 |
| Fable-5 (con fallback) | no disponible | no disponible | no disponible | 63,0 / 88,0 |

La comparacion se limita a los valores de benchmark publicados en la model card, ya que no se dispone de parametros, contexto ni licencia de los modelos alternativos.

## Limitaciones y advertencias

- Procedencia dudosa: el repositorio pertenece al usuario `robgreenberg3`, no a la organizacion oficial `deepseek-ai`, y registra 0 descargas y 0 likes. La model card se presenta como publicacion oficial de DeepSeek, lo que supone un riesgo de suplantacion o de redistribucion no autorizada. Conviene verificar el origen antes de cualquier uso en produccion.
- Ausencia de plantilla de chat: no hay plantilla Jinja; la codificacion de mensajes depende de scripts propios en la carpeta `encoding`, lo que complica la integracion con herramientas que esperan plantillas estandar.
- Riesgo de alucinacion: no se documentan medidas especificas de mitigacion ni tasas de error; los modelos de razonamiento de gran escala siguen siendo propensos a fabricar hechos, especialmente en modo `max` con cadenas de pensamiento largas.
- Sesgos: no disponible. La ficha no incluye informacion sobre composicion del dataset ni evaluaciones de sesgo.
- Idiomas: no disponible. No se declara cobertura multilingue, por lo que el rendimiento fuera del ingles y el chino es incierto.
- Contexto: no disponible. Se desconoce la ventana maxima, dato critico para planificar tareas con repositorios o documentos extensos.
- Licencia: se declara MIT, lo que en principio permitiria uso comercial, pero la licencia asociada a un repositorio no oficial puede no reflejar los terminos reales del modelo original.
- Coste de despliegue: el unico escenario documentado exige un nodo 4xGB300, lo que excluye el uso en hardware de consumo y encarece la experimentacion.
- Benchmarks autodeclarados: los resultados proceden de la model card y parte de ellos (DSBench) son conjuntos internos no publicos, por lo que no son reproducibles de forma independiente.
- La busqueda web realizada no devolvio resultados relacionados con el modelo; los enlaces obtenidos correspondian a canales de YouTube, Instagram y Facebook de una persona ajena al proyecto, sin ninguna relevancia tecnica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/robgreenberg3/DeepSeek-V4-Pro-0813
- Informe tecnico citado (arXiv:2606.19348): https://arxiv.org/abs/2606.19348
- Receta de vLLM para DeepSeek-V4-Pro: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Pro
- Organizacion oficial en Hugging Face: https://huggingface.co/deepseek-ai
- Sitio oficial: https://www.deepseek.com/
- Chat oficial: https://chat.deepseek.com/
- Documentacion de la carpeta `encoding` (referenciada en la model card): https://huggingface.co/robgreenberg3/DeepSeek-V4-Pro-0813/tree/main/encoding
