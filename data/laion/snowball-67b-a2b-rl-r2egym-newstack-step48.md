# laion/snowball-67b-a2b-rl-r2egym-newstack-step48

## Resumen

Snowball 67B-A2B (RL, R2E-Gym, new stack, step 48) es un modelo de lenguaje de arquitectura Mixture-of-Experts (GrugMoe) desarrollado por LAION, entrenado especificamente para tareas de agente en terminal y resolucion de problemas de ingenieria de software. Con 67.078.882.816 parametros totales y tan solo unos 2.000 millones activos por token (segun la nomenclatura A2B del propio nombre), el modelo busca ofrecer el conocimiento de un 67B con el coste de inferencia de un modelo pequeno. Esta es la version de RL del checkpoint SFT `laion/snowball-67b-a2b-sft-s3-nemotron-terminal-step1888`.

La relevancia de este checkpoint radica en el pipeline de RL aplicado: se ha entrenado con un algoritmo estilo RLOO on-policy sobre tareas de R2E-Gym ejecutadas con el agente de terminal terminus-2, sin termino KL y con un pool curricular de 1.003 tareas. El resultado reportado es un pass@1 en held-out de 0,580 en tareas del mismo repositorio y 0,603 en repositorios no vistos, medido sobre 265 tareas core y con decodificacion especulativa mediante un draft EAGLE-3.

Es un modelo especializado, no un asistente general: su objetivo es operar agentes que resuelven incidencias de codigo en entornos reales (repos, tests ocultos, ejecucion de comandos de terminal). La licencia Apache 2.0 y la disponibilidad de pesos en safetensors lo hacen directamente desplegable en infraestructura propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (GrugMoe), transformer |
| Parametros totales | 67.078.882.816 |
| Parametros activos | Aproximadamente 2.000 millones (segun la nomenclatura A2B del nombre; no confirmado en la model card) |
| Longitud de contexto | No disponible (el entrenamiento de RL uso prompts de hasta 49.152 tokens y generaciones de 16.384 tokens) |
| Tipos de cuantizacion | No disponible (pesos exportados en safetensors de precision completa; sin GGUF publicado) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (layout de HuggingFace, 39 shards) |

## Arquitectura y entrenamiento

El modelo parte de la familia Snowball 67B-A2B, construida sobre una arquitectura Mixture-of-Experts denominada GrugMoe. La nomenclatura A2B indica que, aunque el modelo almacena 67.078.882.816 parametros, solo alrededor de 2.000 millones estan activos por token, lo que reduce drasticamente el coste de inferencia respecto a un denso del mismo tamano. La model card no detalla el numero de expertos, la estrategia de enrutamiento ni la composicion del dataset de preentrenamiento, por lo que esos extremos quedan como no disponibles.

El entrenamiento de RL se realizo sobre un "stack" migrado de Marin (harbor + MarinSkyRL, fechas 2026-09-11/12). Se empleo un RL on-policy estilo RLOO con perdida de media de secuencia (sequence-mean loss), staleness 2, grupos de 8, batch de 64 prompts, learning rate 5e-7 y redondeo estocastico en bf16. El entrenamiento se hizo sin termino KL, sobre el pool curricular tt-v2-train de 1.003 tareas de R2E-Gym, con tests ocultos y usando el agente de terminal terminus-2. Las trayectorias completas operan con ventanas de prompt de hasta 49.152 tokens y generaciones de hasta 16.384 tokens. Para acelerar la decodificacion se publica un draft EAGLE-3 (`laion/snowball-64k-eagle3-draft-r2egym`) que aporta aproximadamente 1,5x de velocidad de decode en esta familia.

## Capacidades

- Razonamiento agente en terminal: resolucion de tareas de ingenieria de software mediante ejecucion de comandos, edicion de ficheros y ejecucion de tests.
- Generacion y modificacion de codigo en repositorios reales, con pass@1 medido sobre tareas de R2E-Gym.
- Tool calling / function calling orientado a agentes de terminal (terminus-2).
- Razonamiento multi-paso con planificacion y ciclos de prueba-error sobre un entorno de ejecucion.
- Manejo de contextos largos: entrenado con prompts de hasta 49.152 tokens, adecuado para repositorios y trazas extensas.
- Decodificacion especulativa soportada mediante draft EAGLE-3, con ~1,5x de aceleracion.
- Capacidades multilingues: no disponible.
- Vision / audio: no disponible.
- Modo thinking explicito: no disponible.

## Casos de uso

- Resolucion automatica de incidencias en repositorios: dado un issue y acceso al codigo, el modelo puede inspeccionar el repo, editar ficheros y ejecutar los tests del proyecto, apoyandose en su ventana de hasta 49.152 tokens para cargar contexto relevante. Los 0,603 de pass@1 en repositorios no vistos durante el entrenamiento indican cierta capacidad de generalizacion a codigo nuevo.
- Agente de CI/CD autonomo: integrado en un pipeline, puede recibir una build rota, leer los logs, aplicar un parche y reejecutar los tests hasta obtener una solucion estable.
- Migraciones y refactors de codigo a escala de repositorio: la ventana larga permite cargar multiples ficheros y dependencias, y el modelo puede aplicar cambios consistentes guiados por los tests existentes.
- Mantenimiento de tests: generar y reparar tests unitarios a partir de comportamiento observado, ya que ha sido entrenado con tests ocultos y entornos de evaluacion automatizada.
- Correccion de errores en produccion con bajo presupuesto de latencia: al tener solo ~2.000 millones de parametros activos, es viable desplegarlo en GPUs de gama alta de consumo con cuantizacion, manteniendo una calidad propia de un 67B.
- Investigacion en RL para agentes: al ser un checkpoint RL publicado (step 48) sobre un base SFT identificable, sirve como punto de comparacion reproducible para estudiar el efecto de RLOO sin termino KL en tareas agenticas.
- Automatizacion sobre herramientas de linea de comandos: cualquier flujo de operaciones que requiera ejecutar comandos, interpretar salidas y decidir el siguiente paso encaja con el agente de terminal con el que fue entrenado.

## Benchmarks y rendimiento

Datos de held-out reportados en la model card, medidos como pass@1 a 8 intentos sobre el split tt-v2 val441, en decodificacion especulativa (draft) y sampler completo:

| Evaluacion | Tareas | pass@1 | Comparativa |
|---|---|---|---|
| Mismo repositorio (same-repo) | 150 | 0,580 | No emparejado con la sonda step-24 (que uso decodificacion plana) |
| Repositorio no visto (unseen-repo) | 115 | 0,603 | No emparejado con la sonda step-24 |
| Held-out total | 176 | No disponible | — |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16 los pesos ocupan aproximadamente 134 GB (tamano del repo), por lo que se necesitan al menos dos GPUs de 80 GB. En cuantizacion 8-bit, en torno a 67 GB (una H100 80 GB o A100 80 GB). En cuantizacion 4-bit, en torno a 34-40 GB, viable en una unica GPU de 48 GB o en una RTX 4090 de 24 GB con offload parcial.
- GPU recomendadas: H100 80 GB o A100 80 GB para precision completa con tensor parallelism; A6000 48 GB o L40S 48 GB para 4-bit; RTX 4090 24 GB solo con cuantizacion 4-bit y offload a CPU/RAM.
- Cabe en consumer GPU: si, en RTX 4090/3090 (24 GB) solo con cuantizacion agresiva y offload; el modelo completo no cabe en una sola GPU de consumo.
- Opciones de despliegue: la model card indica servir con el fork de vLLM de GrugMoe. No se confirma soporte de llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles de forma absoluta; se conoce que el draft EAGLE-3 (`laion/snowball-64k-eagle3-draft-r2egym`) aporta aproximadamente 1,5x de velocidad de decode en esta familia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. Como referencia interna de la propia familia, se puede situar el checkpoint RL frente a su base SFT:

| Modelo | Parametros | Contexto | pass@1 held-out | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| snowball-67b-a2b-rl-r2egym-newstack-step48 | 67.078.882.816 | No disponible (entrenado hasta 49.152 tokens de prompt) | 0,580 same-repo / 0,603 unseen-repo | apache-2.0 | HuggingFace |
| snowball-67b-a2b-sft-s3-nemotron-terminal-step1888 (base) | 67.078.882.816 (presumiblemente identico) | No disponible | No disponible | No disponible | HuggingFace |
| Otros modelos de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No hay datos publicados sobre sesgos del modelo ni sobre idiomas soportados mas alla del ingles tecnico implicito en las tareas de codigo.
- Riesgo de alucinacion relevante en un agente que ejecuta comandos: si genera acciones incorrectas sin validacion, puede producir cambios destructivos en el repositorio o el entorno. Se recomienda ejecutar en sandbox con tests como red de seguridad.
- Limitacion de dominio: esta especializado en tareas de terminal e ingenieria de software (R2E-Gym); no es un asistente generalista y su comportamiento fuera de ese dominio es desconocido.
- El numero de parametros activos no aparece confirmado en la model card; la cifra de ~2.000 millones se infiere de la nomenclatura A2B del nombre y debe tratarse como estimacion.
- La longitud de contexto maxima no esta declarada; los 49.152 tokens corresponden al prompt de entrenamiento RL y no garantizan una ventana mayor en produccion.
- No se confirma soporte para llama.cpp, Ollama, TGI ni formatos GGUF/AWQ/GPTQ, lo que limita las opciones de despliegue ligero.
- El modelo requiere un fork especifico de vLLM (GrugMoe) para servirse correctamente; no es un modelo plug-and-play en todas las infraestructuras estandar.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribucion y verificar el cumplimiento en productos derivados.
- Nulo historial de adopcion en el momento de la publicacion (0 descargas, 0 likes), por lo que no hay evidencia de terceros sobre su comportamiento en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laion/snowball-67b-a2b-rl-r2egym-newstack-step48
- Modelo base SFT: https://huggingface.co/laion/snowball-67b-a2b-sft-s3-nemotron-terminal-step1888
- Draft EAGLE-3: https://huggingface.co/laion/snowball-64k-eagle3-draft-r2egym
- Organizacion LAION en HuggingFace: https://huggingface.co/laion
- Web de LAION: https://laion.ai/
- GitHub de LAION: https://github.com/LAION-AI
- Wikipedia (LAION): https://en.wikipedia.org/wiki/LAION
