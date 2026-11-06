# guike8/evidence-scraper-qwen3-1.7b-citation-v3-mlx-lora

## Resumen

Evidence scraper citation-v3 es un adaptador LoRA experimental publicado por el usuario guike8 sobre el modelo base `mlx-community/Qwen3-1.7B-4bit`. Su proposito es la extraccion estructurada de evidencia y citas a partir de paginas web ya capturadas, es decir, convertir contenido HTML o texto en registros JSON validados por esquema, con referencias literales a la fuente. No es un modelo de proposito general ni un checkpoint independiente: es un adaptador MLX de 458.752 parametros que debe cargarse junto al modelo base cuantizado a 4 bits en un entorno Apple Silicon.

El adaptador es la continuacion de una version anterior (schema-ordered) con un optimizador Adam reiniciado. Se entrenó con 1.800 filas (720 de replay y 1.080 especificas de citation-v3) y se evaluó sobre un conjunto de regresion de 108 casos y familias sinteticas nuevas. El autor es explicito al calificar el resultado: no esta cualificado para extraccion en produccion general y no se ha comparado con Firecrawl, porque un fork de una aplicacion de crawling y un modelo de extraccion entrenado resuelven partes distintas del problema.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de uso muy concreto (extraccion con citas verificables) con metricas pareadas y reproducibles. Por otro, sirve de ejemplo de buenas practicas de evaluacion: hashes congelados antes de las pruebas, denominadores que conservan fallos y timeouts, y advertencias explicitas sobre el sesgo del corpus y la ausencia de anotacion humana independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (Qwen3 1.7B); adaptador MLX |
| Parametros totales | 458.752 parametros del adaptador (32 tensores float32); base Qwen3 1.7B no disponible en detalle |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens de secuencia en entrenamiento; presupuesto de fuente de 48.000 caracteres y 4.096 tokens de salida en inferencia |
| Tipos de cuantizacion | base en 4 bits (mlx-community/Qwen3-1.7B-4bit); adaptador en safetensors float32 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (derivado del modelo base) |
| Formato de pesos | MLX: `adapters.safetensors` + `adapter_config.json` (no es Transformers/PEFT ni GGUF) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 aplicado a las proyecciones q/v de las ultimas ocho capas del modelo base Qwen3 1.7B, con escala 20, dropout cero y limite de secuencia de 4.096 tokens. El entrenamiento uso batch uno con acumulacion de cuatro, learning rate 5e-6 y 450 updates sobre 1.800 microbatches, con un optimizador Adam nuevo (sin reanudar estado de optimizador ni RNG). Todas las filas cupieron sin truncamiento. El coste fue de 1.026,8 segundos incluyendo comprobaciones, con un pico de asignacion MLX de 3,44 GB. El adaptador resultante ocupa aproximadamente 1,84 MB.

Los datos de entrenamiento combinan 720 filas de replay del adaptador anterior (solo entrenamiento) y 1.080 filas equilibradas de citation-v3. La validacion consta de 72 filas y el test nuevo de 108. El adaptador se inicializa desde el SHA256 del adaptador antiguo y se ancla al modelo base en la revision `3b1b1768f8f8cf8351c712464f906e86c2b8269e`. La innovacion tecnica principal no esta en la arquitectura, sino en el protocolo de evaluacion: pesos, politica de inferencia, fuentes y hashes de test se congelaron antes de las pruebas, y la receta de replay publica reproduce los seis ficheros JSONL medidos byte a byte (fingerprint `410a7f708a512ca305c1cbd92db55fd1a3938d06a7804484c3932e0b821ee47e`). Se descarto una gramatica opcional de citas literales porque admitia dos errores semanticos en validacion pese a imponer comillas y ubicaciones literales.

## Capacidades

- Extraccion estructurada de evidencia: genera registros JSON validados contra un esquema (Pydantic, reglas de negocio, evidencia y completitud).
- Extraccion con citas: asocia hechos extraidos a referencias de la fuente bajo una gramatica JSON de referencia exclusiva.
- Generacion de texto condicionada por esquema: el modelo produce salidas en formato fijo, no conversacion libre.
- Razonamiento de un solo paso: se ejecuta con temperatura cero, thinking desactivado y una unica completion sin reparacion.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles.
- Sin vision ni audio: el pipeline es text-generation sobre fuentes ya capturadas.

## Casos de uso

- Extraccion de fichas de producto desde HTML capturado: el modelo recibe el contenido de una pagina y devuelve un JSON con campos definidos y citas a la fuente; es adecuado porque el esquema y los validadores acotan la salida, aunque la cobertura medida es baja (29/108 en familias sinteticas nuevas).
- Replay de regresion en pipelines de crawling: permite reejecutar un conjunto fijo de fuentes con hashes congelados para detectar regresiones del adaptador antes de desplegar cambios, gracias a la receta de replay reproducible byte a byte.
- Prototipado local en Apple Silicon: al ser un adaptador MLX de 1,84 MB sobre una base de 1.7B en 4 bits, cabe en un Mac y permite iterar sin coste de API, con un pico de 3,44 GB durante el entrenamiento.
- Validacion de contratos de extraccion: util para probar si un esquema y sus validadores son demasiado estrictos o demasiado laxos antes de invertir en un modelo mayor, ya que el adaptador expone fallos de planificacion de contrato y fuente.
- Investigacion sobre evaluacion de extraccion estructurada: sirve como caso documentado de metricas pareadas con denominadores que conservan fallos, timeouts y truncamientos, y con gold labels autorados antes del renderizado.
- Filtrado negativo de tareas no elegibles: el conjunto incluye un control negativo intencional, lo que permite comprobar que el sistema rechaza tareas fuera de contrato en lugar de inventar hechos.
- No recomendado para atencion al cliente, generacion de codigo en produccion, agentes autonomos ni tareas generales de razonamiento: el autor lo declara no cualificado para extraccion en produccion general.

## Benchmarks y rendimiento

| Track | Aceptados antiguos | Aceptados nuevos | Hechos correctos aceptados (antiguo / nuevo) | Hechos erroneos aceptados (antiguo / nuevo) |
|---|---:|---:|---:|---:|
| Regresion sintetica previamente inspeccionada | 41/108 | 61/108 | 231 / 407 | 0 / 0 |
| Familias sinteticas nuevas | 16/108 | 29/108 | 87 / 169 | 2 / 0 |
| Replays de paginas publicas elegibles | 0/13 | 0/13 | 0 / 0 | 0 / 0 |

Datos adicionales del autor: en paginas publicas se intentaron 18 tareas sobre 17 URLs de 12 hosts; cinco fallaron la planificacion de contrato o fuente antes de la inferencia. El subconjunto de modelo contiene 13 tareas (incluida una negativa intencional) con 31 hechos positivos y 25 hechos requeridos. Reteniendo los 18 intentos, la cobertura de registros aceptados es 0/18 en ambas versiones y la recall de hechos requeridos aceptados es 0/48 en ambas. En las pruebas de esquema del helper oMLX, 9/9 fueron validas por esquema pero solo 1/9 paso la prueba completa de hecho exacto y evidencia. El autor advierte que el 61/108 no es una cifra de precision held-out nueva y que el corpus publico es pequeno, en ingles y sesgado a desarrolladores, con etiquetas autoradas por agentes y revision de un segundo agente, sin anotacion humana independiente.

## Requisitos de hardware

- VRAM estimada: no disponible de forma directa; el modelo base es de 1.7B en 4 bits y el adaptador ocupa aproximadamente 1,84 MB.
- Pico de asignacion MLX durante entrenamiento: 3,44 GB.
- GPU recomendadas: Apple Silicon con MLX (el autor menciona un Mac conectado y un Studio); no se documentan GPU NVIDIA.
- Cabe en GPU de consumo: si, en equipos Apple Silicon con memoria unificada suficiente; no hay datos para RTX 4090 u otras.
- Opciones de despliegue: helper oMLX experimental en primer plano (`python -m training.serve_omlx --experimental-omlx-adapter ...`) con Python 3.12.16 arm64 y arboles de paquetes verificados antes de los imports; no es un adaptador oficial de oMLX ni compatible con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; la politica de inferencia fija 45 segundos por peticion y 4.096 tokens de salida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| evidence-scraper-qwen3-1.7b-citation-v3-mlx-lora | 458.752 (adaptador) sobre Qwen3 1.7B | 4.096 tokens de secuencia | Extraccion estructurada con citas, MLX | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen3 1.7B (base) | 1.7B | no disponible en la informacion | Generacion de texto general | no disponible en la informacion | mlx-community, 4 bits |
| Adaptador schema-ordered anterior | no disponible | 4.096 tokens de secuencia | Extraccion estructurada por esquema | no disponible en la informacion | Solo referenciado por SHA256 |
| Firecrawl | no disponible | no disponible | Servicio de crawling y extraccion | no disponible | Servicio comercial |

No se dispone de comparaciones de rendimiento con alternativas de la misma categoria en la informacion proporcionada; el autor indica explicitamente que no se ha comparado con Firecrawl.

## Limitaciones y advertencias

- El autor declara que el adaptador no esta cualificado para extraccion en produccion general.
- Cobertura insuficiente: 29/108 en familias sinteticas nuevas y 0/18 en intentos sobre paginas publicas.
- Recall de hechos requeridos aceptados de 0/48 en el conjunto publico, tanto en la version antigua como en la nueva.
- Corpus de evaluacion pequeno, en ingles y sesgado a desarrolladores, con etiquetas autoradas por agentes y sin revision humana independiente.
- Los resultados de paginas publicas son replays sobre capturas, no recuperacion en vivo; el egress VPN del Studio permanecio bloqueado.
- Riesgo de alucinacion: las predicciones crudas contienen errores; cero hechos erroneos aceptados en un conjunto medido no garantiza correccion universal.
- Restricciones de licencia: Apache-2.0 como derivado del modelo base; conviene verificar los terminos del base y del ecosistema MLX antes de uso comercial.
- Dependencia de un entorno muy especifico: Python 3.12.16 arm64, arboles de paquetes verificados y hashes de plataforma; un build distinto puede fallar las comprobaciones y no debe saltarse sin revision y prueba de serving real.
- El helper oMLX es una integracion local no soportada, no una caracteristica oficial; el servicio de produccion del modelo original no cambia automaticamente.
- No es compatible con Transformers/PEFT, GGUF, vLLM, llama.cpp ni Ollama.
- El adaptador debe mantenerse junto a `adapter_config.json`, `adapters.safetensors` y `training.json`, y verificarse contra `SHA256SUMS` (checksum del adaptador: `64e66dab7b04a7c8a3e90af136477856ba57de52023b45ab4dabb985deb49f7b`).

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/guike8/evidence-scraper-qwen3-1.7b-citation-v3-mlx-lora)
- [Modelo base mlx-community/Qwen3-1.7B-4bit](https://huggingface.co/mlx-community/Qwen3-1.7B-4bit)
- [Guia de serving publica](https://github.com/guike8/evidence-ai-scraper-public/blob/bc85c9a551c6368c56b1b334dd803675d7e91b72/training/README-serving.md)
- Repositorio publico del proyecto: https://github.com/guike8/evidence-ai-scraper-public
- No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.
