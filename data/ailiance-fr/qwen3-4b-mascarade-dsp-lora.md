# Ailiance-fr/qwen3-4b-mascarade-dsp-lora

## Resumen

`Ailiance-fr/qwen3-4b-mascarade-dsp-lora` es un adaptador LoRA de rango 16 entrenado mediante SFT (supervised fine-tuning) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507` de Alibaba Qwen. Lo desarrolla Ailiance-fr, un proyecto que publica una familia de adaptadores LoRA especializados por dominio (kicad, spice, stm32, emc, embedded, platformio, freecad, dsp, iot, power) sobre un mismo tronco Qwen3-4B. Este adaptador concreto se orienta al dominio DSP (procesamiento digital de senales) y al analisis de esquematicos electronicos, con evaluacion funcional sobre el dataset `emc-dsp-power`.

El modelo no es un transformer nuevo ni un preentrenamiento desde cero: es un delta de pesos de menos del 1 % sobre el modelo base, por lo que hereda integramente las capacidades generales de Qwen3-4B-Instruct-2507 (conocimiento, razonamiento, codigo, agentes y multilingue) y anade un sesgo de especializacion en tareas de hardware. Su relevancia practica esta en el coste: se sirve como un modelo de 4 000 millones de parametros, cabe en GPU de consumo y puede desplegarse como Modelfile de Ollama bajo el alias de pasarela `ailiance-<dominio>`.

La informacion publicada es limitada: el autor declara explicitamente que el LoRA no ha sido evaluado aun con el pipeline `electron-bench` completo y que las evaluaciones de perplejidad y comparativa contra el base estan pendientes. El unico resultado funcional disponible es un composite score de 0,619 sobre 10 ejemplos del dataset `emc-dsp-power`, que debe interpretarse con cautela por el tamano muestral.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA de rango 16 sobre el modelo base |
| Parametros totales | Aproximadamente 4 000 millones (modelo base Qwen3-4B-Instruct-2507); el adaptador LoRA anade una fraccion inferior al 1 % |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repo se distribuye en safetensors sin cuantizar. El modelo base admite cuantizaciones estandar (GGUF, AWQ, GPTQ) por su ecosistema, pero no se documenta en esta ficha |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, repo de 0,1 GB) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer decoder-only denso de aproximadamente 4 000 millones de parametros. El entrenamiento se realizo con SFT mediante TRL 1.4.0 sobre Transformers 5.8.0 y PyTorch 2.11.0, con un trainer LoRA de `mlx-lm` en configuracion rango 16, alpha 32, escala 2.0, optimizador AdamW con learning rate 1e-5 y 500 iteraciones. El dataset de entrenamiento no se detalla en la model card, aunque por la evaluacion publicada se infiere un corpus orientado a esquematicos electronicos y analisis de senales (dominio EMC/DSP/power).

La innovacion tecnica no esta en la arquitectura sino en la estrategia de producto: una familia de adaptadores de bajo rango que comparten tronco y se enrutan por dominio en produccion, compilados a Modelfiles de Ollama y servidos bajo alias de pasarela (`ailiance-kicad`, `ailiance-spice`, `ailiance-dsp`, etc.). El autor reconoce que un LoRA de rango 16 modifica menos del 1 % de los pesos base, por lo que las puntuaciones generales del modelo original se mantienen aproximadamente como suelo de capacidad y el adaptador solo anade deltas en el dominio especializado.

## Capacidades

- Generacion de texto y razonamiento general heredados del modelo base Qwen3-4B-Instruct-2507.
- Codigo y matematicas: el base reporta LiveCodeBench v6 de 35,1 y MultiPL-E de 76,8, capacidades que el adaptador conserva.
- Especializacion en dominio hardware: extraccion y generacion de esquematicos (KiCad), analisis SPICE, senales DSP y analisis de compatibilidad electromagnetica y potencia, segun la evaluacion `bench_kicad_functional`.
- Tool calling y function calling: heredado del base, que obtiene 61,9 en BFCL-v3.
- Razonamiento multi-paso y agentes: el base reporta 48,7 en TAU1-Retail, 32,0 en TAU1-Airline y 40,4 en TAU2-Retail.
- Capacidades multilingues: el base reporta 69,0 en MultiIF, 61,6 en MMLU-ProX, 60,1 en INCLUDE y 31,1 en PolyMATH.
- No se documenta soporte de vision, audio ni modo thinking explicito en la informacion proporcionada.

## Casos de uso

- Extraccion estructurada de esquematicos electronicos: el adaptador se entreno sobre tareas de parseo estructural (presencia de nodo de tierra, conteo de componentes, parseo correcto), por lo que puede convertir descripciones o netlists en representaciones KiCad validables por `kicad-cli`.
- Analisis de compatibilidad electromagnetica y potencia: el unico benchmark publicado (`emc-dsp-power`) evalua este dominio; el modelo puede asistir en la revision de disenos de alimentacion y en la identificacion de problemas de EMC en etapas tempranas.
- Generacion de netlists SPICE: integrable en flujos de simulacion para producir o revisar descripciones de circuitos antes de lanzar el simulador.
- Asistente de ingenieria embebida: con el base heredando tool calling (BFCL-v3 61,9), puede encadenarse a herramientas de compilacion, PlatformIO o STM32 para tareas de soporte al desarrollo firmware.
- Automatizacion de revision de diseno en CI: el modelo puede integrarse como validador semantico en pipelines que comprueben esquematicos o ficheros de configuracion de hardware antes del merge.
- Despliegue en local para equipos de hardware: al ser un modelo de 4B con adaptador de 0,1 GB, puede servirse en una estacion de trabajo o en un Mac Studio mediante Ollama con el alias de pasarela del dominio, sin depender de APIs externas.
- Prototipado rapido de asistentes tecnicos de dominio: la familia Mascarade permite cambiar de adaptador (kicad, spice, dsp, power) manteniendo el mismo tronco y la misma infraestructura de servicio.

## Benchmarks y rendimiento

Evaluacion funcional del adaptador (ailiance-bench Phase 7, CUDA, 2026-05-11), decodificacion greedy:

| Dataset | n | Composite score | Duracion |
|---|---:|---:|---:|
| `emc-dsp-power` | 10 | 0,619 | 1137,1 s |

El composite combina parseo estructural correcto, coincidencia de conteo de componentes y presencia de nodo de tierra, entre otros criterios. La muestra es de solo 10 ejemplos, por lo que la cifra tiene alta varianza y no debe extrapolarse.

Evaluaciones oficiales del modelo base Qwen3-4B-Instruct-2507 (suelo de capacidad heredado, no medidas sobre el adaptador):

| Categoria | Benchmark | Qwen3-4B-Instruct-2507 |
|---|---|---:|
| Conocimiento | MMLU-Pro | 69,6 |
| Conocimiento | MMLU-Redux | 84,2 |
| Conocimiento | GPQA | 62,0 |
| Conocimiento | SuperGPQA | 42,8 |
| Razonamiento | AIME25 | 47,4 |
| Razonamiento | HMMT25 | 31,0 |
| Razonamiento | ZebraLogic | 80,2 |
| Razonamiento | LiveBench 2024-11-25 | 63,0 |
| Codigo | LiveCodeBench v6 | 35,1 |
| Codigo | MultiPL-E | 76,8 |
| Codigo | Aider-Polyglot | 12,9 |
| Alineacion | IFEval | 83,4 |
| Alineacion | Arena-Hard v2 | 43,4 |
| Alineacion | Creative Writing v3 | 83,5 |
| Alineacion | WritingBench | 83,4 |
| Agentes | BFCL-v3 | 61,9 |
| Agentes | TAU1-Retail | 48,7 |
| Agentes | TAU1-Airline | 32,0 |
| Agentes | TAU2-Retail | 40,4 |
| Multilingue | MultiIF | 69,0 |
| Multilingue | MMLU-ProX | 61,6 |
| Multilingue | INCLUDE | 60,1 |
| Multilingue | PolyMATH | 31,1 |

No hay benchmark del adaptador contra el base en el pipeline del autor: la comparativa base-vs-LoRA esta pendiente y la evaluacion con `electron-bench` no se ha ejecutado (el pipeline solo soporta por ahora el base `gemma-4-E4B`).

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador pesa 0,1 GB y se suma al base. En fp16 el modelo completo requiere aproximadamente 8 GB; en cuantizacion de 8 bits, unos 4-5 GB; en 4 bits, unos 2,5-3 GB (estimaciones derivadas del tamano de 4B, no publicadas por el autor).
- GPU recomendadas: A100 o H100 para despliegue de produccion con lotes grandes; RTX 4090, RTX 3090 o L4 para servicio de baja latencia.
- GPU de consumo: si, cabe en RTX 4090, RTX 3090, RTX 4080 y en tarjetas de 8 GB en cuantizacion de 4 bits; en GPUs de 6 GB solo con cuantizaciones muy agresivas.
- Opciones de despliegue: el autor compila el adaptador a Modelfile de Ollama y lo sirve bajo alias de pasarela; tambien es compatible con transformers + PEFT (la model card incluye un ejemplo con `pipeline`), y con vLLM o TGI si se fusiona el adaptador en los pesos base.
- Latencia y throughput: no disponibles en la informacion proporcionada. El unico dato temporal es la duracion de la evaluacion (1137,1 s para 10 ejemplos en CUDA con decodificacion greedy, lo que incluye la generacion completa por ejemplo, no solo inferencia).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-mascarade-dsp-lora | ~4B (LoRA r=16) | No disponible | Apache-2.0 | DSP, EMC, esquematicos | Hugging Face, Ollama via pasarela Ailiance |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4B | No disponible | Apache-2.0 | Generalista | Hugging Face, amplio ecosistema |
| Otros adaptadores Mascarade (kicad, spice, stm32, etc.) | ~4B (LoRA r=16) | No disponible | Apache-2.0 | Dominio hardware especifico | Hugging Face, misma pasarela |
| gemma-4-E4B (referencia del pipeline del autor) | No disponible | No disponible | No disponible | Base de referencia para `electron-bench` | No disponible |

La comparativa realista es contra el propio modelo base: el adaptador no mejora capacidades generales, solo anade especializacion de dominio. Frente a otros adaptadores de la familia Mascarade, la eleccion depende del dominio de la tarea (kicad, spice, dsp, power, etc.), ya que todos comparten tronco y configuracion LoRA.

## Limitaciones y advertencias

- Evaluacion insuficiente: el unico benchmark publicado tiene n=10 y un composite de 0,619; no hay perplejidad, ni comparativa contra el base, ni evaluacion con `electron-bench`. El autor lo declara explicitamente como pendiente.
- Riesgo de olvido catastrofico cruzado: el autor menciona un "cross-domain forgetting check" en Phase 9, pero no publica resultados en la informacion disponible; un LoRA de rango 16 puede degradar ligeramente el rendimiento general del base en tareas fuera de dominio.
- Sesgos: no documentados. Al heredar el base, arrastra los sesgos de los datos de preentrenamiento de Qwen3, no evaluados en esta ficha.
- Alucinacion: riesgo relevante en generacion de esquematicos y netlists, donde una salida sintacticamente valida puede ser electricamente incorrecta; requiere validacion con `kicad-cli` o simulador antes de uso en produccion.
- Idiomas: no se declaran idiomas soportados; el base es multilingue, pero el adaptador se entreno presumiblemente en ingles tecnico y no hay evaluacion por idioma.
- Contexto: no se documenta la longitud de contexto del adaptador; se asume la del base, pero no esta confirmado en la informacion proporcionada.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia que debe verificarse por separado antes de redistribuir pesos fusionados.
- Madurez: repositorio con 0 descargas y 0 likes; creado en mayo de 2026 y actualizado en noviembre de 2026, sin senales de adopcion ni mantenimiento comunitario.
- Dependencia de la pasarela Ailiance: el modo de servicio documentado (alias `ailiance-<dominio>` en Ollama) esta ligado a la infraestructura del autor; el despliegue autonomo requiere fusionar el adaptador o cargarlo con PEFT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ailiance-fr/qwen3-4b-mascarade-dsp-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Pagina de la familia Mascarade: https://www.ailiance.fr/models/ailiance/mascarade
- Repositorio de benchmarks: https://github.com/ailiance/ailiance-bench
- Issues del benchmark: https://github.com/ailiance/ailiance-bench/issues
- Matriz base-vs-LoRA de referencia: https://github.com/ailiance/ailiance-bench/blob/main/bench-results/compare_base_vs_lora.md
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
