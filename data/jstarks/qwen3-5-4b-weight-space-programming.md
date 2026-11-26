# jstarks/Qwen3.5-4B-Weight-Space-Programming

## Resumen

Qwen3.5-4B-Weight-Space-Programming es un derivado del modelo base Qwen/Qwen3.5-4B publicado por el usuario jstarks bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de una intervención sobre los pesos del modelo original mediante una tecnica que el autor denomina Weight-Space Programming (WSP) v3.0: una arquitectura de nueve subespacios de LoRA dinamica que se aplica sin entrenamiento adicional (training-free) y con solucion en forma cerrada. El objetivo declarado es mejorar el comportamiento del modelo en tareas de razonamiento, uso de herramientas, generacion de codigo y recuperacion de errores sin reentrenar.

El modelo base Qwen3.5-4B emplea una arquitectura hibrida con atencion DeltaNet y atencion clasica, 32 capas, hidden_size de 2560 y un MLP SwiGLU con intermediate_size de 9216, sumando 4.659.865.088 parametros totales segun los safetensors del repositorio. Sobre esa base, WSP modifica unicamente cinco proyecciones internas `ffn_down.weight` en F16 (seleccion `s1_1.25_s8_0.35`), mientras que los 421 tensores restantes de los 426 totales son copias identicas al modelo original.

La relevancia del proyecto es doble: por un lado, ofrece una variante "baked" autocontenida en GGUF Q4_K_M (2.688 GiB) que no requiere cargar adaptadores LoRA en tiempo de ejecucion; por otro, propone una metodologia de interpretabilidad mecanica y programacion en espacio de pesos que el autor evalua sobre 100 tareas unificadas y 20 tareas de Terminal-Bench 2.0. Los resultados reportados muestran una mejora de +9,0 puntos porcentuales en la version baked (81/100 frente a 72/100 del base) y de +17,0 puntos en la version con LoRA dinamica (89/100).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion DeltaNet y atencion clasica (Qwen3.5), 32 capas, hidden_size 2560, MLP SwiGLU con intermediate_size 9216, RMSNorm 1+w |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens en la configuracion de evaluacion reportada (`-c 16384`) |
| Tipos de cuantizacion | GGUF Q4_K_M (variante baked); cuantizacion de cache KV q8_0 (`-ctk q8_0 -ctv q8_0`); pesos safetensors en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-4B: un transformer hibrido de 32 capas que combina atencion DeltaNet con atencion clasica, normalizacion RMSNorm en la variante 1+w y un MLP SwiGLU de 9216 unidades intermedias. Sobre esta base, WSP v3.0 aplica una intervencion en el espacio de pesos sin entrenamiento: nueve subespacios LoRA (S1 a S9) que se activan de forma dinamica segun la tarea, con sintesis en modo hibrido que combina forward hooks en bf16 para S1 a S6 y un mecanismo proxy para S7 a S9. La variante baked integra los efectos de los subespacios S1 (think, factor 1.25) y S8 (grounding, factor 0.35) directamente en cinco tensores `ffn_down.weight` en F16, dejando el resto del modelo intacto byte a byte.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, ya que el metodo es training-free por diseno. La innovacion tecnica principal es precisamente esa: obtener mejoras de comportamiento mediante programacion en espacio de pesos con solucion cerrada, sin gradientes ni datos de entrenamiento, y empaquetar el resultado en un unico GGUF que no requiere flags `--lora` en tiempo de inferencia. El autor reporta verificacion de paridad de logits frente a la referencia LoRA viva con 3/3 coincidencias top-1 y un delta maximo de logprob top-1 de 0,02136.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso, con modo de pensamiento (think closure) reforzado por el subespacio S1.
- Generacion de codigo, evaluada con HumanEval pass@1 (15/15 en la variante WSP dinamica).
- Razonamiento matematico, evaluado con GSM8K (15/20 en la variante WSP dinamica frente a 10/20 del base).
- Tool calling y function calling, con evaluacion en BFCL v3 Irrelevance (12/15 en WSP frente a 11/15 del base) y pruebas de restriccion de herramientas y anti-sicofancia (S2).
- Enrutamiento multi-herramienta (S3) y emision de JSON estructurado en segundo turno (S5).
- Agentes y razonamiento multi-paso, con tareas de puerta de escalado (S6), guardia contra inyeccion indirecta (S7) y auto-recuperacion de errores (S9).
- Capacidades de terminal y bash: evaluado en InterCode-NL2Bash (18/20 en WSP frente a 14/20 del base) y en Terminal-Bench 2.0 sobre contenedores WSL2 en vivo.
- Abstenerse de responder cuando falta fundamento (grounded abstention, S8), con mejora parcial de 1/3 a 2/3.
- Capacidades multilingues: no disponible.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 16.384 tokens y mantener disciplina de escalado gracias a los subespacios S2 (restriccion de herramientas) y S6 (puerta de handoff), lo que reduce respuestas fuera de alcance.
- Generacion de codigo en produccion: con HumanEval pass@1 de 15/15 en la variante dinamica y soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests o proponer parches acotados.
- Agentes de terminal y automatizacion de shell: los resultados en NL2Bash (18/20) y Terminal-Bench 2.0 (4/20 frente a 3/20 del base) lo hacen util para tareas de administracion de sistemas guiadas por lenguaje natural, aunque el techo en Terminal-Bench sigue siendo bajo.
- Enrutamiento de herramientas en asistentes con muchas APIs: el subespacio S3 mantiene 5/5 en tareas de router multi-herramienta, lo que permite seleccionar la funcion adecuada entre un catalogo amplio sin degradar el resto de la conversacion.
- Extraccion de datos estructurados en segundo turno: S5 reduce la longitud media de finalizacion de 127,3 a 33,3 tokens manteniendo 3/3, lo que abarata el coste por llamada en pipelines de parsing JSON.
- Defensa frente a inyeccion de prompts indirecta: S7 pasa de 2/3 a 3/3 en tareas de guardia, adecuado para asistentes que consumen contenido web o documentos de terceros.
- Razonamiento matematico asistido en entornos educativos o de analisis: la mejora en GSM8K (de 10/20 a 15/20) y la reduccion de tokens de finalizacion (de 1009 a 542) lo hacen viable para calculo paso a paso con coste controlado.
- Despliegue en hardware de consumo: la variante baked Q4_K_M ocupa 2.688 GiB y cabe en una RTX 2060 de 6 GB con unos 2,7 GiB libres a contexto 16k, lo que permite prototipado local sin GPU de datacenter.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre 100 tareas unificadas (temperatura 0,0, seed 42, contexto 16.384, cache KV q8_0):

| Suite | Tareas | Base | WSP v3.0 dinamico | WSP baked |
|---|---:|---:|---:|---:|
| S1_THINK | 3 | 0/3 | 3/3 | no disponible por suite |
| S2_RESTRAINT | 4 | 4/4 | 4/4 | no disponible por suite |
| S3_ROUTER | 5 | 5/5 | 5/5 | no disponible por suite |
| S4_CODE | 2 | 2/2 | 2/2 | no disponible por suite |
| S5_TURN2_JSON | 3 | 3/3 | 3/3 | no disponible por suite |
| S6_HANDOFF | 4 | 4/4 | 4/4 | no disponible por suite |
| S7_INJ_GUARD | 3 | 2/3 | 3/3 | no disponible por suite |
| S8_GROUNDING | 3 | 1/3 | 2/3 | no disponible por suite |
| S9_ERR_RECOV | 3 | 3/3 | 3/3 | no disponible por suite |
| GSM8K (20) | 20 | 10/20 | 15/20 | no disponible por suite |
| HumanEval pass@1 (15) | 15 | 13/15 | 15/15 | no disponible por suite |
| BFCL v3 Irrelevance (15) | 15 | 11/15 | 12/15 | no disponible por suite |
| NL2Bash (20) | 20 | 14/20 | 18/20 | no disponible por suite |
| Total 100 tareas | 100 | 72/100 | 89/100 | 81/100 |
| Terminal-Bench 2.0 | 20 | 3/20 | 4/20 | no disponible |

Rendimiento de decodificacion: base 119,3 tok/s, WSP dinamico 117,0 tok/s, baked 122,5 tok/s de mediana y 122,3 tok/s de media. VRAM pico: delta de 3370 MiB en la variante dinamica y 3948/3996 MiB cargado/pico en la baked. No se han publicado resultados de benchmarks adicionales (MMLU, MMLU-Pro, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,9 GiB cargado y 4,0 GiB de pico con la variante baked Q4_K_M a contexto 16.384 y cache KV q8_0; la variante dinamica anade un delta pico de 3370 MiB sobre el base.
- GPU recomendadas: RTX 2060 (6 GB) confirmada como suficiente con unos 2,7 GiB libres a 16k; RTX 4070 Ti (12 GB) con unos 8,0 GiB libres; modelos de datacenter como A100 o H100 no se mencionan en la informacion disponible.
- Cabe en GPU de consumo: si, en RTX 2060 de 6 GB y superiores segun las pruebas del autor.
- Opciones de despliegue: llama.cpp / llama-server (comando documentado con `-ngl 99 -np 1 -c 16384 -ctk q8_0 -ctv q8_0 -b 512 -ub 256 --jinja --reasoning-format deepseek`); transformers con safetensors; la variante dinamica requiere un proxy HTTP y nueve LoRA adicionales. No se documenta soporte de vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: 117,0 tok/s en WSP dinamico, 122,3 tok/s de media en baked, 119,3 tok/s en base, medidos en el hardware del autor (no especificado con detalle).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento 100 tareas | Licencia | Formato |
|---|---|---:|---:|---|---|
| Qwen3.5-4B (base) | 4,66 B | 16k en la eval | 72/100 | Apache 2.0 | safetensors, GGUF |
| Qwen3.5-4B-WSP (dinamico) | 4,66 B + 9 LoRA | 16k en la eval | 89/100 | Apache 2.0 | safetensors + LoRA |
| Qwen3.5-4B-WSP (baked) | 4,66 B | 16k en la eval | 81/100 | Apache 2.0 | GGUF Q4_K_M |
| Alternativas de 4B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado comparaciones con otros modelos de la misma categoria (por ejemplo, Llama 3.2 3B, Phi-3.5-mini o Gemma 2 2B) en la informacion disponible; la unica comparacion reportada es contra el propio modelo base Qwen3.5-4B y contra los otros cuatro modelos del estudio interno `wsp-5model-pipeline`, cuyos datos no se incluyen completos.

## Limitaciones y advertencias

- El modelo solo modifica cinco tensores `ffn_down.weight`; el resto de pesos es identico al base, por lo que las limitaciones subyacentes de Qwen3.5-4B se mantienen.
- Sesgos conocidos: no disponible; el autor no documenta evaluaciones de sesgo, toxicidad ni fairness.
- Riesgo de alucinacion: el subespacio S8 (grounded abstention) solo alcanza 2/3 en la variante dinamica y no se reporta para la baked, por lo que la abstención ante falta de fundamento sigue siendo parcial.
- Rendimiento en Terminal-Bench 2.0 bajo en terminos absolutos (4/20 en la mejor variante), lo que desaconseja su uso como agente autonomo de terminal sin supervision.
- La variante dinamica requiere nueve LoRA y un proxy HTTP, lo que anade complejidad operativa y latencia frente a la baked.
- El contexto evaluado es de 16.384 tokens; no se documenta el contexto nativo maximo del modelo base ni su comportamiento mas alla de esa ventana.
- Idiomas soportados no disponibles; no hay evaluacion multilingue reportada.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado de Qwen3.5-4B conviene verificar las condiciones del modelo base y mantener la atribucion correspondiente.
- Los benchmarks son internos del autor (100 tareas propias y 20 de Terminal-Bench 2.0), con tamano de muestra pequeno por suite (2 a 20 tareas), lo que limita la significancia estadistica de las diferencias.
- No se han publicado resultados en benchmarks estandar adicionales (MMLU, MMLU-Pro, BBH, etc.) que permitan una comparacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jstarks/Qwen3.5-4B-Weight-Space-Programming
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- GGUF baked: https://huggingface.co/jstarks/Qwen3.5-4B-Weight-Space-Programming/blob/main/Qwen3.5-4B-WSP-Q4_K_M.gguf
- Repositorio llama.cpp (despliegue): https://github.com/ggerganov/llama.cpp
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.
