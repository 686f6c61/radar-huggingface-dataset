# Snowsh1ne/DeepSeek-V4.1-Flash-1017-GSQ-217-Strixolotl

## Resumen

DeepSeek-V4.1-Flash-1017-GSQ-217-Strixolotl es una cuantizacion del modelo base DeepSeek-V4.1-Flash-1017, publicada por el usuario Snowsh1ne. No se trata de un modelo nuevo entrenado desde cero, sino de una distribucion de pesos comprimidos con un pipeline GPTQ propio (denominado GSQ) disenada especificamente para ejecutarse en un unico equipo AMD Ryzen AI Max (Strix Halo, gfx1151) con 128 GB de memoria unificada, mediante el motor Strixolotl, un port HIP/ROCm del motor Xolotl.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 14.225.362.530 parametros totales segun los safetensors del repositorio, aunque la model card indica que el checkpoint original completo ocupa 510 GB e incluye tablas Engram de n-gramas de 202,8 GB en FP8 que no forman parte de esta cuantizacion. La relevancia actual radica en que demuestra que es posible servir un MoE grande en hardware de consumo profesional con memoria unificada, a costa de un throughput de decodificacion modesto (en torno a 9-11 tokens por segundo) y de una dependencia estricta del motor Strixolotl.

La cuantizacion emplea tipos mixtos por experto (ternario PTQ1_0, Q2_0 y Q3_K), con la mitad densa en Q8_0, y se distribuye en 23 fragmentos de 10 GiB que deben concatenarse en orden para reconstruir el GGUF. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y esta publicado bajo licencia MIT heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con capas MTP y tablas Engram; cuantizacion GSQ (GPTQ-style) |
| Parametros totales | 14.225.362.530 (safetensors del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona sesiones de agente de 36-190K tokens en las pruebas de velocidad) |
| Tipos de cuantizacion | GSQ mixta por experto: PTQ1_0 (ternario, 1,75 bpw), Q2_0 (2,25 bpw), Q3_K (99,4% de los expertos enrutados); mitad densa en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF fragmentado en 23 partes (no compatible con llama.cpp/Ollama/LM Studio); tokenizer BPE exportado; MTP draft en GGUF IQ3_XXS/Q8_0 |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con atencion y router en la mitad densa, expertos enrutados y una pila MTP (multi-token prediction) de tres capas (`mtp.0-2`) que se usa para decodificacion especulativa. Ademas, lee dos tablas Engram de n-gramas (`layers.1` y `layers.14`, 202,8 GB de filas FP8) que no se incluyen en este repositorio y deben descargarse de los shards 47 y 48 del checkpoint original de DeepSeek.

El proceso de cuantizacion (GSQ) asigna a cada experto enrutado su propio formato a partir de estadisticas de calibracion, con 48 secuencias de 8.192 tokens compuestas por datos agenticos de codigo con uso de herramientas, prompts de imatrix de antirez/ds4, Wikipedia en chino y pile-10k. El profesor es el checkpoint FP8/FP4 original ejecutado capa por capa en torch. La cuantizacion no es reproducible bit a bit: una nueva ejecucion de la misma receta produce un fichero equivalente pero distinto, y los checksums del repositorio identifican exactamente este fichero.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredados del modelo base DeepSeek-V4.1-Flash-1017.
- Flujos agenticos multi-turno con uso de herramientas: la calibracion se centra en `agentic_long` y `agent`, y las pruebas de velocidad se realizaron sobre sesiones de agente de 8 turnos.
- Generacion de codigo: la calibracion incluye 8 secuencias de codigo y 18 de codigo agentico de largo contexto.
- Decodificacion especulativa con DSpark: usa la pila MTP del checkpoint para proponer hasta 4 tokens y verificarlos en una pasada por lotes con muestreo especulativo exacto.
- Reutilizacion de cache de prompt: en un turno de agente que extiende la conversacion previa se reutiliza en torno al 99% de los tokens.
- Capacidades multilingues: la calibracion incluye 3 secuencias en chino, pero no se declaran idiomas soportados en la ficha.
- No se documentan capacidades de vision, audio ni modo de pensamiento explicito en la informacion disponible.

## Casos de uso

- Asistente de codigo agentico en local: el modelo puede mantener sesiones multi-turno con llamadas a herramientas sobre un unico equipo Strix Halo, aprovechando la reutilizacion de cache de prompt (~99% de tokens reutilizados) para abaratar turnos sucesivos.
- Automatizacion de tareas de desarrollo en un puesto de trabajo: integracion en un flujo de trabajo de edicion y ejecucion de codigo donde la confidencialidad exige no enviar datos a la nube, ya que todo el modelo corre en memoria unificada local.
- Prototipado de agentes de largo contexto: las pruebas de velocidad cubren peticiones de agente de 36-190K tokens, lo que permite validar disenos de agentes con historiales largos antes de migrar a infraestructura mayor.
- Investigacion sobre cuantizacion extrema: el repositorio documenta la degradacion medida (perplexity +1,61% respecto al profesor, acuerdo top-1 de 0,874) y sirve como referencia para estudiar el impacto de esquemas mixtos por experto.
- Evaluacion de hardware AMD para inferencia de MoE: permite medir el rendimiento real de un Ryzen AI Max+ 395 con ROCm 7.14.1 en cargas de decodificacion limitadas por SSD.
- Despliegue de un modelo de 14,2B parametros totales en un equipo de sobremesa con 128 GB de memoria unificada, sin GPU dedicada de gran VRAM, para tareas de generacion de texto de baja concurrencia.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). Si incluye metricas de fidelidad frente al profesor y de velocidad medidas en un equipo concreto.

| Metrica | GSQ-200 (anterior) | GSQ-217 (este) |
|---|---|---|
| Brecha de perplexity frente al profesor | +2,74% | +1,61% |
| Acuerdo top-1 con el profesor | 0,854 | 0,874 (mejor en 16 de 17 filas) |

| Metrica de velocidad (Minisforum MS-S1 MAX, Ryzen AI MAX+ 395, 128 GB LPDDR5X, ROCm 7.14.1) | Valor |
|---|---|
| Decodificacion con DSpark | ~11 tok/s (11,0-11,6 en respuestas de 700 tokens; 10,5 en sesion de 8 turnos) |
| Decodificacion sin DSpark | ~9 tok/s (8,8-9,2; 8,3 en 100 peticiones de agente a 36-190K de contexto) |
| TTFT de un turno de agente (+0,8K tokens) | ~19-24 s |
| TTFT de un turno de agente (+2,5K tokens) | ~44 s |
| TTFT de un turno de agente (+6,5K tokens) | ~81-84 s |
| TTFT en frio (5,6K / 15K tokens) | ~73 s / ~147 s |
| TTFT con `--fast-prefill` (MMQ) | +2,5K ~27-30 s; +6,5K ~39 s; frio 15K ~67 s |
| Carga del motor | ~33-50 s |

En el conjunto de validacion de la cadena de calibracion (6 secuencias de 8K, torch head gate): perplexity 6,374 frente a 6,365 del profesor (+0,15%) y top-1 0,675 frente a 0,676.

## Requisitos de hardware

- Hardware objetivo: AMD Strix Halo (Ryzen AI Max, gfx1151) con 128 GB de memoria unificada; probado en Minisforum MS-S1 MAX con Ryzen AI MAX+ 395 / Radeon 8060S.
- Almacenamiento: SSD NVMe PCIe 4.0 x4 (Samsung 990 Pro 1 TB, ~6 GB/s en las lecturas); la decodificacion esta limitada por la velocidad del disco porque unos 6.000 expertos (80-86 GiB) permanecen en RAM y el resto se lee del SSD cuando el router los selecciona.
- VRAM estimada: no aplica en el sentido tradicional; el modelo usa memoria unificada y un arena fija de 82 GiB en modo calidad.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por este formato; el GGUF no es compatible con llama.cpp, Ollama ni LM Studio porque los expertos usan tipos de cuantizacion por experto que esos runtimes no cargan.
- Opciones de despliegue: exclusivamente el motor Strixolotl (release 0.1.0), con soporte de `--dspark`, `--no-dspark` y `--fast-prefill`.
- Latencia y throughput: ver tabla de benchmarks; la decodificacion depende de la velocidad del SSD y un token simple tarda ~112 ms, de los cuales ~32 ms son lecturas de expertos.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-GSQ-217 (este) | 14.225.362.530 | no disponible | MIT | GGUF fragmentado, solo Strixolotl | Cuantizacion para Strix Halo; ~11 tok/s con DSpark |
| DeepSeek-V4.1-Flash-1017 (base) | no disponible (checkpoint de 510 GB) | no disponible | MIT | safetensors FP8/FP4 | Profesor; requiere hardware de datacenter |
| GSQ-200 (cuantizacion anterior del mismo autor) | no disponible | no disponible | MIT | GGUF para Strixolotl | Peor fidelidad: +2,74% ppl, top-1 0,854 |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El fichero no es compatible con llama.cpp, Ollama ni LM Studio; solo funciona con Strixolotl, lo que limita portabilidad y soporte.
- Requiere descargar aparte 203,1 GB de tablas Engram del repositorio de DeepSeek (shards 47 y 48, revision `1bae0e1088993b9b82de08f59de5be5a34e42170`) y verificarlas por sha256; sin ellas el modelo no funciona.
- La decodificacion esta limitada por el SSD: un disco mas lento reduce directamente el throughput.
- La cuantizacion no es reproducible bit a bit; los checksums solo identifican este fichero exacto.
- DSpark no es bit-identico a la decodificacion greedy simple: aproximadamente el 1,4% de los tokens greedy difieren en empates cercanos.
- `--fast-prefill` (MMQ) no es bit-identico al modo por defecto, aunque la perplexity queda dentro del ruido.
- Degradacion medible frente al profesor: +1,61% de perplexity y acuerdo top-1 de 0,874, con riesgo de alucinacion propio del modelo base no cuantificado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada; la calibracion incluye datos en chino e ingles, sin declaracion de cobertura de idiomas.
- Licencia MIT heredada del modelo base, sin restricciones comerciales adicionales documentadas, pero conviene verificar el fichero LICENSE del repositorio.
- Repositorio con 0 descargas y 0 likes: no hay validacion comunitaria independiente de las metricas declaradas.

## Enlaces

- Hugging Face: https://huggingface.co/Snowsh1ne/DeepSeek-V4.1-Flash-1017-GSQ-217-Strixolotl
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio Strixolotl: https://github.com/snowsh1ne/strixolotl
- Release 0.1.0 de Strixolotl: https://github.com/snowsh1ne/strixolotl/releases/tag/0.1.0
- Motor Xolotl (original): https://github.com/Indras-Mirror/Xolotl
