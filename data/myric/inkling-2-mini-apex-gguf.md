# Myric/Inkling-2-Mini-APEX-GGUF

## Resumen

Inkling-2-Mini-APEX-GGUF es una cuantizacion en formato GGUF del modelo base thinkingmachines/Inkling-2-Mini, un transformer de tipo mixture-of-experts (MoE) con 26.070.385.152 parametros totales. El repositorio, publicado por el usuario Myric, no introduce una cuantizacion nueva: es una copia de procedencia (provenance copy) del fichero `Inkling-2-Mini-APEX-I-Quality.gguf` generado originalmente por mudler, empaquetada junto con los resultados de un benchmark de codificacion agentica de 42 tareas.

La relevancia de esta ficha reside en que el autor documenta de forma reproducible el rendimiento exacto del fichero publicado: 42/42 tareas superadas con 253/253 tests en una suite agentica de codificacion, ejecutada sobre llama.cpp con soporte `inkling2_loop`, contexto de 65.536 tokens y razonamiento en modo minimal. El modelo esta orientado a uso conversacional y de codigo, con licencia Apache-2.0 y pesos unicamente en ingles.

El modelo base pertenece a la familia Inkling-2 de Thinking Machines, distribuida bajo licencia permisiva, lo que facilita su integracion en pipelines comerciales. Esta cuantizacion concreta ocupa 20,07 GB en disco y esta pensada para despliegue local en hardware de gama alta o estaciones de trabajo con GPU de gran memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer |
| Parametros totales | 26.070.385.152 (26,07 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens (valor usado en el benchmark; maximo del modelo base no disponible) |
| Tipos de cuantizacion | GGUF APEX I-Quality (fichero publicado); otras variantes APEX (Balanced, Compact, I-Nano) en el repo de mudler |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (20,07 GB; sha256 `dc367e1890421fec606bbc1350d848665a648e7f64fa236bf9ed7cbce6950ea8`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura mixture-of-experts, segun indican las etiquetas del repositorio (`moe`, `mixture-of-experts`). No se dispone en la informacion proporcionada del numero de expertos, de los parametros activos por token, del numero de tokens de entrenamiento ni de la composicion del dataset. Tampoco se documenta si hubo fases de RLHF, DPO u otro ajuste por preferencias.

La innovacion tecnica documentada en esta ficha no esta en el entrenamiento sino en la cuantizacion y en la validacion. La cuantizacion APEX I-Quality, atribuida a mudler, se evalua con metricas de perplejidad y divergencia KL frente a BF16: PPL 6,873 frente a 6,862 del BF16, KLD media de 0,0063 y coincidencia top-1 del 96,5 % (datos del tier APEX-Quality, no exactamente del fichero I-Quality). El benchmark publicado emplea decodificacion con temperatura 1,0, top_p 0,95 y top_k 20, y requiere una build de llama.cpp con soporte para el bucle `inkling2_loop`.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte multi-turno.
- Razonamiento configurable: el autor evalua modos `minimal`, `medium` y `--no-reasoning`, con mejor resultado en `minimal` para la suite agentica.
- Codificacion agentica: la suite de 42 tareas incluye tareas generales, dificiles, de frontera y de nivel tier4a, con ejecucion de tests automatizados.
- Integracion con herramientas de agente: el benchmark se ejecuta sobre OpenCode 2.0.26, lo que implica uso de herramientas y edicion de codigo en un bucle agentico.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- Capacidades multilingues limitadas: solo se declara ingles.
- No se documentan capacidades de vision, audio ni tool calling nativo mas alla del uso agentico observado.

## Casos de uso

- Desarrollo de codigo asistido en local: el modelo resuelve tareas de codificacion con verificacion por tests (253/253 en la suite publicada), adecuado para entornos donde no se quiere enviar codigo a la nube.
- Agentes autonomos de refactorizacion: con 65.536 tokens de contexto puede mantener el estado de un repositorio mediano y ejecutar bucles multi-paso sobre OpenCode u orquestadores similares.
- CI/CD con verificacion automatica: su rendimiento en tareas con tests permite integrarlo como generador de parches que se validan en pipeline antes de fusionar.
- Asistente conversacional tecnico en ingles: orientado a documentacion, explicacion de errores y generacion de fragmentos de codigo en entornos de desarrollo.
- Despliegue en estaciones de trabajo con GPU unica: el fichero GGUF de 20,07 GB se ejecuta con llama.cpp y llama-server, sin necesidad de infraestructura multi-GPU.
- Evaluacion y reproducibilidad de cuantizaciones: al ser una copia de procedencia con hash verificado, sirve para replicar benchmarks de calidad de cuantizacion (PPL, KLD, same-top) en hardware propio.
- Prototipado de agentes de codigo con contexto largo: util para validar disenos de agentes que requieren ventanas de 64K tokens antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Suite agentica de codificacion de 42 tareas sobre GB10, OpenCode 2.0.26, llama.cpp con soporte `inkling2_loop`, contexto 65.536, reasoning=minimal, temp 1,0 / top_p 0,95 / top_k 20:

| Suite | Resultado |
|---|---:|
| General (25 tareas) | 25/25 |
| Hard (5 tareas) | 5/5 |
| Frontier (9 tareas) | 9/9 |
| Tier4a (3 tareas) | 3/3 |
| **Total** | **42/42 tareas, 253/253 tests, 0 voids** |

Metricas de ejecucion: 34,4 minutos de wall time y 44.678 tokens de salida. Comparativa de modos de razonamiento: `medium` obtuvo 41/41 con un void por limite de 16K; `minimal` obtuvo 42/42; `--no-reasoning` fue estrictamente peor. Metricas de calidad de cuantizacion del tier APEX-Quality (no del fichero I-Quality exacto): PPL 6,873 frente a BF16 6,862, KLD media 0,0063, same-top 96,5 %.

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este modelo.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF ocupa 20,07 GB; para inferencia con contexto de 65.536 tokens hay que sumar la cache KV, por lo que se recomienda al menos 24-32 GB de VRAM o uso con offload parcial a RAM.
- GPU recomendadas: A100 40/80 GB, H100, RTX 4090 (24 GB, ajustando contexto), y estaciones tipo GB10 empleada en el benchmark.
- Cabe en GPU de consumo: si, en RTX 4090/RTX 3090 (24 GB) con contexto reducido; en GPUs de 16 GB requeriria offload.
- Opciones de despliegue: llama.cpp (build con soporte `inkling2_loop`), llama-server con `--jinja`. No se documenta soporte en vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: el benchmark reporta 34,4 minutos de wall time para 44.678 tokens de salida en GB10, lo que da una referencia aproximada de 21-22 tokens/s en ese hardware y configuracion; no se aportan mas mediciones.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables de la misma categoria (MoE de ~26 B en GGUF) que permitan una comparacion rigurosa. La unica comparacion documentada es interna, entre modos de razonamiento del propio modelo (minimal, medium, sin razonamiento) y frente al BF16 en metricas de cuantizacion.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos comparativos |
|---|---|---|---|---|---|
| Inkling-2-Mini APEX I-Quality (este) | 26,07 B (MoE) | 65.536 (benchmark) | Apache-2.0 | GGUF | 42/42 suite agentica |
| Inkling-2-Mini BF16 (base) | 26,07 B (MoE) | no disponible | Apache-2.0 | safetensors | PPL 6,862 (referencia) |
| Alternativas de ~26 B MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta ingles; no se declaran otros idiomas.
- No se documentan los parametros activos del MoE, lo que dificulta estimar coste por token en produccion.
- El benchmark publicado es una suite agentica de codificacion, no una evaluacion general; no hay datos de MMLU, HumanEval o GSM8K que permitan situar el modelo en tareas no agenticas.
- El modo de razonamiento afecta al resultado: `--no-reasoning` es estrictamente peor y `medium` genero un void por limite de contexto en la suite evaluada.
- Requiere una build especifica de llama.cpp con soporte `inkling2_loop`; el soporte upstream no esta confirmado en la informacion disponible.
- Riesgo de alucinacion no cuantificado en la informacion proporcionada; como modelo generativo de codigo, los parches deben validarse con tests antes de produccion.
- La cuantizacion introduce una perdida minima pero medible (KLD 0,0063, same-top 96,5 % en el tier Quality); para tareas sensibles a precision conviene contrastar con BF16.
- El repositorio es una copia de procedencia con 0 descargas y 0 likes en el momento de la consulta; la fuente activa de cuantizaciones es el repositorio de mudler.
- Licencia Apache-2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones del modelo base y de los terminos de Thinking Machines.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Myric/Inkling-2-Mini-APEX-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizacion original (mudler): https://huggingface.co/mudler/Inkling-2-Mini-APEX-GGUF
- Benchmarks de cuantizaciones APEX: https://huggingface.co/Myric/apex-quant-benchmarks
- Barrido de razonamiento: https://huggingface.co/Myric/apex-quant-benchmarks/blob/main/INKLING2_MINI_REASONING_SWEEP_2026-11-24.md
