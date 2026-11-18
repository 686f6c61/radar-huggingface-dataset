# danish-foundation-models/munin-2.0

## Resumen

Munin 2.0 es un modelo de lenguaje de 120.000 millones de parametros totales (12.000 millones activos) publicado por Danish Foundation Models, una colaboracion academica danesa orientada a construir modelos abiertos para lenguas de bajos recursos. Se trata de un ajuste fino supervisado seguido de aprendizaje por refuerzo sobre el modelo preentrenado NVIDIA Nemotron 3 Super Base, y su proposito declarado es cubrir chat, razonamiento y, sobre todo, ingenieria de software agentica en danes e ingles. La relevancia actual del modelo radica en que combina una arquitectura hibrida moderna con un entrenamiento post-preentrenamiento especificamente orientado a tareas de terminal y agentes de codigo, un nicho poco cubierto para el danes.

Arquitectura y tamano: hereda sin cambios el diseno Nemotron 3 Super, un transformer hibrido que combina capas Mamba-2 con atencion, mezcla de expertos (MoE) latente y prediccion multi-token (MTP). El contexto de entrenamiento es de 131.072 tokens (128k). El modelo se distribuye en BF16 (repositorio de 247,2 GB) y existe una variante NVFP4 recomendada para GPUs Blackwell.

La licencia es la NVIDIA Nemotron Open Model License, no una licencia permisiva tipo Apache o MIT, lo que condiciona su uso comercial. El modelo se publica con pesos abiertos, codigo personalizado en `transformers` y compatibilidad con endpoints, lo que facilita su despliegue en infraestructura propia o en plataformas gestionadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron 3 Super: transformer hibrido Mamba-2 + atencion, MoE latente, prediccion multi-token (MTP) |
| Parametros totales | 123.611.033.088 (aprox. 120B) |
| Parametros activos | 12B |
| Longitud de contexto | 131.072 tokens (128k), segun entrenamiento |
| Tipos de cuantizacion | BF16 (pesos originales); FP8 por bloques en carga (`fp8_per_block` en vLLM); NVFP4 en el repositorio `munin-2.0-nvfp4` |
| Idiomas soportados | Danes (da) e ingles (en) |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | safetensors (BF16); requiere `trust_remote_code` |
| Modelo base | danish-foundation-models/munin-2.0-sft (a su vez finetune de NVIDIA Nemotron 3 Super Base) |
| Libreria | transformers |
| Tamano del repositorio | 247,2 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo conserva integramente la arquitectura Nemotron 3 Super, sin modificaciones estructurales. Se trata de un transformer hibrido que intercala capas de espacio de estados Mamba-2 con capas de atencion, lo que reduce el coste de atencion en contextos largos. Incorpora una mezcla de expertos latente (los expertos operan sobre representaciones latentes, no sobre la dimension completa) con 12B parametros activos de un total de 120B, y una cabeza de prediccion multi-token (MTP) que se usa tanto en entrenamiento como en decodificacion especulativa en inferencia. El contexto de entrenamiento es de 128k tokens.

El post-entrenamiento consta de dos fases. Primero, un ajuste fino supervisado (SFT) de una epoca sobre 16 nodos LUMI, con 6,8 millones de conversaciones y 11.000 millones de tokens, de los cuales 3.400 millones corresponden a turnos del asistente y son los efectivamente entrenados. Aproximadamente el 94% de los tokens entrenados provienen de datasets publicos y el 6% de datos sinteticos generados por el equipo; un 8% son danes puro y otro 9% mezcla danes e ingles. El conjunto incluye los splits de entrenamiento de 24 tareas danesas de EuroEval. Despues, un aprendizaje por refuerzo con GRPO asincrono sobre un fork propio de prime-rl, ejecutado en Gefion (DGX H100), con unas 119.000 episodios procedentes de 22 fuentes de tarea: ingenieria de software (47%), tareas de terminal (25%), uso de herramientas, SQL, seguimiento de instrucciones y matematicas. Cada episodio de codigo o terminal se ejecuto en un sandbox propio, y todas las recompensas provienen de programas, no de modelos juez.

## Capacidades

- Generacion de texto conversacional en danes e ingles, con calidad de escritura en danes situada en el tercio superior de 13 modelos en una comparacion ciega.
- Razonamiento explicito activado por defecto, desactivable mediante `enable_thinking=False` en el chat template.
- Razonamiento multi-turno: el chat template conserva el razonamiento de turnos anteriores por defecto (`truncate_history_thinking=False`), lo que preserva coherencia en conversaciones largas.
- Ingenieria de software agentica: resolucion de issues sobre repositorios reales y tareas de terminal, foco principal del entrenamiento por refuerzo.
- Tool calling / function calling con llamadas en XML, compatible con el parser `qwen3_coder` de vLLM y con `--enable-auto-tool-choice`.
- Capacidad de agente multi-paso con presupuestos de hasta 16.384 tokens por llamada y 300.000 tokens por episodio, con compactacion de contexto.
- Razonamiento matematico y cientifico (AIME, GPQA-Diamond), con rendimiento a la par del modelo base dentro del ruido estadistico.
- Consultas SQL y seguimiento de instrucciones, entrenados explicitamente en la fase de RL.
- Decodificacion especulativa mediante la cabeza MTP (`num_speculative_tokens=3`), que acelera la generacion.
- No se ha documentado soporte de vision ni de audio en la informacion disponible.

## Casos de uso

- Agente de resolucion de issues en repositorios: el modelo puede recibir un issue, navegar el codigo, editar ficheros y ejecutar tests en un sandbox. Su 66,2% en SWE-bench Verified lo situa por encima de su checkpoint SFT y del Nemotron 3 Super base en el mismo harness, lo que lo hace adecuado para automatizar tareas de mantenimiento en produccion.
- Automatizacion de operaciones en terminal: tareas de administracion de sistemas, scripting y diagnostico encadenando comandos, con un rendimiento 13-16 puntos superior al checkpoint SFT en Terminal-Bench. Encaja en pipelines de DevOps donde se requiere ejecucion supervisada.
- Asistente de codigo integrado en IDE o CI/CD: con tool calling XML y parser `qwen3_coder`, se puede conectar a herramientas de compilacion, linters y gestores de repositorios, y dar soporte a agentes como opencode o pi.
- Atencion al ciudadano en danes: el modelo obtiene 71,1 en 17 datasets de EuroEval (frente a 68,7 del base), lo que lo hace util para respuestas administrativas, resumen de documentacion publica y clasificacion de consultas en danes.
- Generacion y edicion de texto en danes: redaccion de informes, correccion y reescritura con calidad de escritura evaluada en el tercio superior de 13 modelos, adecuada para medios, administracion y educacion.
- Analisis de datos con SQL: la fase de RL incluye tareas de consulta SQL, por lo que puede traducir preguntas en lenguaje natural a consultas sobre esquemas relacionales y verificar resultados.
- Razonamiento cientifico asistido: con GPQA-Diamond y AIME a la par del base, sirve para tutorizacion o generacion de explicaciones tecnicas paso a paso con modo thinking activado.
- Despliegue soberano en infraestructura europea: al ser pesos abiertos y entrenado en LUMI y Gefion, encaja en proyectos que requieren residencia de datos en la UE, sujeto a los terminos de la licencia NVIDIA.

## Benchmarks y rendimiento

| Benchmark | Munin 2.0 | Munin 2.0 SFT | Nemotron 3 Super |
|---|---|---|---|
| SWE-bench Verified | 66,2% | 58,1% | 49,3% |
| Terminal-Bench | +13 a +16 puntos vs. SFT | referencia | no disponible |
| EuroEval (17 datasets, danes) | 71,1 | no disponible | 68,7 |
| GPQA-Diamond | a la par del base (dentro del ruido) | mejora sobre SFT | referencia |
| AIME | a la par del base (dentro del ruido) | mejora sobre SFT | referencia |
| Escritura en danes (comparacion ciega, 13 modelos) | tercer puesto | no disponible | a la par o ligeramente superior segun el juez |

No se han publicado resultados numericos completos de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 240-250 GB solo para pesos, mas cache KV y estados Mamba; requiere multiples GPUs.
- VRAM estimada en FP8 por bloques: aproximadamente 120-130 GB para pesos, lo que permite servir en 2x H100 80GB o 1x H200 141GB con margen limitado.
- VRAM estimada en NVFP4: aproximadamente 60-65 GB para pesos, viable en una sola GPU Blackwell de 80 GB o superior.
- GPUs recomendadas: H100 (con tensor-parallel 8 y expert-parallel segun la receta oficial), H200, B200 y demas Blackwell para la variante NVFP4. En consumer GPU no cabe en BF16 ni FP8; NVFP4 podria caber en RTX 5090 (32 GB) solo con cuantizacion adicional agresiva no documentada, lo que no esta soportado oficialmente.
- Despliegue: vLLM 0.28.0 es la via probada por los autores, con `--trust-remote-code`, `--quantization fp8_per_block`, `--kv-cache-dtype fp8`, `--mamba-ssm-cache-dtype float32`, `--async-scheduling`, `--enable-chunked-prefill`, `--reasoning-parser nemotron_v3` y `--speculative-config '{"method": "mtp", "num_speculative_tokens": 3}'`. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Throughput y latencia: no disponibles en la informacion proporcionada. La decodificacion especulativa MTP con 3 tokens deberia reducir la latencia por token frente a decodificacion autoregresiva pura, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Munin 2.0 | 120B totales / 12B activos | 131.072 | 66,2% | NVIDIA Nemotron Open Model License | Pesos abiertos en HF (BF16 y NVFP4) |
| Nemotron 3 Super (base) | 120B totales / 12B activos | 131.072 | 49,3% | NVIDIA Nemotron Open Model License | Pesos abiertos en HF |
| Munin 2.0 SFT | 120B totales / 12B activos | 131.072 | 58,1% | NVIDIA Nemotron Open Model License | Pesos abiertos en HF |
| Modelos densos de ~70B tipo Llama o Qwen | ~70B | variable | no disponible en esta ficha | licencias propias | pesos abiertos |

La comparacion mas directa es con el propio Nemotron 3 Super base y con el checkpoint SFT intermedio, ya que comparten arquitectura y harness de evaluacion. Frente a modelos densos de tamano similar, Munin 2.0 ofrece solo 12B parametros activos por token, lo que reduce el coste de inferencia, pero no se dispone de datos de benchmarks cruzados en la informacion proporcionada.

## Limitaciones y advertencias

- Cobertura linguistica limitada a danes e ingles; el rendimiento en castellano no esta evaluado y probablemente sea deficiente.
- Riesgo de alucinacion inherente a los modelos generativos, agravado en tareas de codigo donde una API o una firma de funcion inventada puede compilar pero fallar en ejecucion.
- El modo de razonamiento esta activado por defecto y consume muchos tokens; en produccion conviene desactivarlo (`enable_thinking=False`) o acotar `max_tokens` para controlar coste y latencia.
- El template conserva el razonamiento de turnos anteriores por defecto, lo que infla el contexto en conversaciones largas; el equipo no ha evaluado el efecto de `truncate_history_thinking=True`.
- Con `temperature=1.0` (recomendado por NVIDIA para el base) se observaron mas turnos con repeticiones; los autores recomiendan `temperature=0.8` y `top_p=0.95`.
- La licencia NVIDIA Nemotron Open Model License no es permisiva: impone condiciones al uso comercial y a la redistribucion. Es imprescindible revisar el texto legal antes de desplegar en producto.
- El modelo se distribuye con codigo personalizado (`trust_remote_code`), lo que implica ejecutar codigo del repositorio y anade superficie de riesgo en entornos no controlados.
- Requiere hardware de gama alta (multiples H100 o GPUs Blackwell) para inferencia en BF16 o FP8; no es desplegable en consumer GPU de forma soportada.
- La evaluacion en danes excluyo los datasets de EuroEval cuyos items de test aparecen en los datos de entrenamiento, pero el resto de cifras provienen del propio equipo y no de una evaluacion independiente.
- El resumen de datos de entrenamiento conforme al template del Reglamento Europeo de IA aun no se ha publicado en el momento de la ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danish-foundation-models/munin-2.0
- Variante NVFP4: https://huggingface.co/danish-foundation-models/munin-2.0-nvfp4
- Checkpoint SFT: https://huggingface.co/danish-foundation-models/munin-2.0-sft
- Modelo base NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-Base-BF16
- Nota de release: https://foundationmodels.dk/news/2026/11/18/munin-20-release-note.html
- Danish Foundation Models: https://foundationmodels.dk/
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Fork de prime-rl usado en RL: https://github.com/danish-foundation-models/prime-rl/tree/munin-2.0/gefion-rl
- Servicio de sandboxes: https://github.com/rlrs/ucloud-sandboxes
- Paper Mamba-2 (referencia en tags): https://arxiv.org/abs/2403.03218
- Paper Nemotron (referencia en tags): https://arxiv.org/abs/2308.01263
