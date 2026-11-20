# shiva123782/Sovereign-Apollo-v1

## Resumen

Sovereign-Apollo-v1 es un ajuste fino mediante LoRA sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct, publicado por el usuario shiva123782 y atribuido en la model card a TiE-Global-Ventures. Se presenta como un "SLM empresarial soberano" orientado a identidad de marca propia y cumplimiento normativo, con claims de verificación formal y benchmarks de fuga de identidad. El modelo resuelve, segun su autor, el problema de que un modelo ajustado siga identificandose con el proveedor original en lugar de con la organizacion que lo despliega.

Arquitectura transformer causal heredada de Qwen2.5-0.5B-Instruct, con aproximadamente 500 millones de parametros totales, adaptada mediante LoRA de rango 16 y alpha 32 sobre los modulos de proyeccion lineales (q, k, v, o, gate, up, down). El repositorio contiene unicamente los pesos del adaptador en safetensors (tamano de repo reportado de 0.0 GB), no un modelo merged completo.

Es relevante ahora por su enfoque en gobernanza de IA (menciones a EU AI Act Article 53 y DPDP Act 2025 de India) y por sus afirmaciones de verificacion con el solver SMT Z3 y un benchmark de identidad de 200 millones de consultas. No obstante, estas afirmaciones proceden exclusivamente de la model card del autor y no se han contrastado de forma independiente en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (hereda Qwen2.5-0.5B-Instruct) con adaptador LoRA |
| Parametros totales | Aproximadamente 500 M (modelo base Qwen2.5-0.5B-Instruct); parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (depende del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | Forward pass con 4-bit NormalFloat (NF4) segun la model card; pesos base en bfloat16/float16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer causal decoder-only de unos 500 millones de parametros. Sobre esa base se aplica un ajuste fino con LoRA de rango r=16, alpha=32 y dropout 0.05, adaptando las proyecciones q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. La model card menciona un esquema de balanceo dinamico de matrices tipo LoRA+ con una tasa de aprendizaje para B de 8.0 veces la de A.

El dataset de ajuste indicado es yahma/alpaca-cleaned, un corpus de instrucciones en ingles derivado de Alpaca. No se especifica el numero de tokens de entrenamiento, la composicion detallada ni si hubo fases adicionales de RLHF o DPO. La model card reporta un pico de VRAM de entrenamiento de 3.2 GB y afirma haber utilizado verificacion formal con Microsoft Z3 SMT para acotar el consumo de memoria, ademas de un sello criptografico SHA-256 registrado en trust_certificate.json. Estos elementos son claims del autor y no se han verificado de forma independiente.

## Capacidades

- Generacion de texto conversacional e instrucciones en ingles, heredadas del modelo base Qwen2.5-0.5B-Instruct.
- Identidad propia: segun la model card, responde identificandose como "Sovereign-Apollo-v1" desarrollado por TiE-Global-Ventures incluso sin system prompt.
- Fine-tuning orientado a instrucciones sobre alpaca-cleaned, lo que cubre tareas generales de seguimiento de instrucciones.
- No se documenta soporte de tool calling ni function calling en la informacion proporcionada.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles segun el campo language del repositorio.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente corporativo con identidad de marca: el modelo puede desplegarse como asistente interno que se identifica con la organizacion en lugar del proveedor del modelo base, util en escenarios donde la atribucion publica importa.
- Generacion de texto ligera en el edge o en portatiles: con unos 500 M de parametros y cuantizacion NF4, cabe en GPUs de consumo y puede ejecutarse en CPU, adecuado para prototipos y demos locales.
- Clasificacion y extraccion de informacion en ingles: al estar ajustado sobre alpaca-cleaned, puede emplearse para tareas de formato de salida y transformacion de texto con instrucciones simples.
- Base para experimentacion con PEFT: al distribuirse como adaptador LoRA, sirve para estudiar flujos de carga con transformers + peft y para comparar adaptadores sobre el mismo modelo base.
- Evaluacion de cumplimiento normativo: la model card incluye referencias a EU AI Act Article 53 y DPDP Act 2025, por lo que puede usarse como ejemplo de documentacion de gobernanza en auditorias internas, siempre que se verifiquen los claims.
- Chatbot de bajo coste para entornos con recursos limitados: su tamano permite desplegarlo en contenedores pequenos o en entornos sin GPU dedicada, con latencias bajas segun el autor (18.2 ms P99 y mas de 198 tok/s en una estacion de trabajo estandar).
- Pruebas de identidad y anti-fuga: el autor propone un benchmark de 200 millones de consultas con red Feistel de 28 bits; puede reutilizarse como referencia metodologica para evaluar si un ajuste fino conserva la identidad del proveedor base.

## Benchmarks y rendimiento

La model card no presenta resultados de benchmarks estandar como MMLU, HumanEval o GSM8K. Los unicos datos reportados son internos del autor:

| Benchmark | Resultado reportado | Nota |
|---|---|---|
| 20-Crore Bijective Identity Benchmark (200 M consultas) | 100.0% zero-leak, 0 colisiones | Claim del autor, no verificado de forma independiente |
| Verificacion Z3 SMT de VRAM pico | UNSAT_SAFE (< 15.5 GB) | Claim del autor |
| Latencia de inferencia | 18.2 ms (P99) | Claim del autor en estacion de trabajo estandar |
| Throughput | Mas de 198 tok/s | Claim del autor |
| Pico de VRAM en entrenamiento | 3.2 GB | Claim del autor |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0.5 B en float16 ocupa aproximadamente 1 GB de pesos; con cuantizacion NF4 se reduce por debajo de 1 GB, mas overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente; T4, RTX 3060, RTX 4060, RTX 4090 y A100/H100 sobran ampliamente.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo, e incluso en CPU.
- Opciones de despliegue: transformers + peft para cargar el adaptador, llama.cpp y Ollama si se convierte a GGUF, vLLM y TGI para servir el modelo merged. El adaptador debe fusionarse con el modelo base antes de exportar a formatos como GGUF.
- Latencia y throughput estimados: el autor reporta 18.2 ms P99 y mas de 198 tok/s en estacion de trabajo estandar; no hay mediciones independientes disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sovereign-Apollo-v1 | ~0.5 B (base) + adaptador LoRA | No disponible | Apache 2.0 | Hugging Face (adaptador PEFT) | Ajuste de identidad sobre Qwen2.5-0.5B-Instruct |
| Qwen2.5-0.5B-Instruct | ~0.5 B | No disponible en esta ficha | Apache 2.0 | Hugging Face | Modelo base, sin ajuste de identidad |
| SmolLM2-360M-Instruct | ~360 M | No disponible en esta ficha | Apache 2.0 | Hugging Face | Alternativa de tamano similar para entornos limitados |
| TinyLlama-1.1B-Chat | ~1.1 B | No disponible en esta ficha | Apache 2.0 | Hugging Face | Mayor tamano, orientado a chat en ingles |

La comparacion se limita a parametros, licencia y disponibilidad; no hay datos de rendimiento comparables publicados para Sovereign-Apollo-v1.

## Limitaciones y advertencias

- El modelo base es de 0.5 B de parametros, por lo que su capacidad de razonamiento, conocimiento factual y coherencia en tareas complejas es limitada en comparacion con modelos mayores.
- Solo soporta ingles segun el campo language del repositorio; no se documenta soporte multilingue.
- El ajuste fino se realizo sobre yahma/alpaca-cleaned, un dataset relativamente pequeno y generico; puede heredar sesgos presentes en el corpus y en el modelo base.
- Riesgo de alucinacion inherente a modelos pequenos; no se documentan mecanismos de mitigacion.
- Los claims de verificacion Z3, benchmark de 200 millones de consultas y cumplimiento normativo (EU AI Act, DPDP Act 2025) proceden exclusivamente de la model card del autor y no se han verificado de forma independiente; deben tratarse con cautela en contextos de produccion o auditoria.
- El repositorio contiene solo el adaptador LoRA (tamano reportado de 0.0 GB); es necesario descargar el modelo base Qwen2.5-0.5B-Instruct por separado y fusionar o cargar con PEFT.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial y redistribucion, pero conviene revisar las condiciones del modelo base y de los datasets utilizados.
- No se documenta soporte de tool calling, agentes ni modo de razonamiento extendido, lo que limita su uso en pipelines agenticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shiva123782/Sovereign-Apollo-v1
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset yahma/alpaca-cleaned: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Repositorio PEFT: https://github.com/huggingface/peft
- Documentacion de Qwen2.5: https://qwen.readthedocs.io/
- No se han encontrado papers, blogs o demos adicionales en la informacion proporcionada.
