# kingjones777/Tiel-Coder-35B-A3B-ROCmFPX-AGENT-GGUF

## Resumen

Tiel-Coder-35B-A3B-ROCmFPX-AGENT-GGUF es una requantización en formato GGUF del modelo Tiel-Coder-35B-A3B, un fine-tune orientado a tareas de agente y generación de código construido sobre la base ornith-ai/Ornith-1.5-35B-A3B. El autor, kingjones777, ha tomado el GGUF original de peculiar-ragdoll (Tiel-Coder-35B-A3B-GGUF) y lo ha convertido a los formatos experimentales ROCmFPX, diseñados específicamente para hardware AMD con ROCm, en particular la iGPU integrada del AMD Ryzen AI MAX+ 395 (Strix Halo, gfx1151).

El modelo emplea una arquitectura MoE (mixture of experts) con 35 000 millones de parámetros totales y aproximadamente 3 000 millones activos por token (A3B), lo que permite ejecutarlo en sistemas con memoria unificada. Esta variante concreta, denominada AGENT, prioriza la fidelidad en el routing de tool calling y function calling, manteniendo los embeddings y la cabeza de salida en Q8_0. Su relevancia radica en ofrecer una opción de alta precisión para trabajo agéntico en hardware AMD de gama alta, aunque a costa de un mayor consumo de memoria y menor velocidad que otras cuantizaciones del mismo modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (qwen35moe) |
| Parametros totales | 34 660 610 688 (~35B) |
| Parametros activos | ~3B (A3B) |
| Longitud de contexto | 262 144 tokens (soporte declarado; en la practica se recomienda 32 768) |
| Tipos de cuantizacion | Q6_0_ROCMFPX_AGENT (ftype 114) con Q8_0 en token_embd y output.weight; tambien existen variantes Q4_0_ROCMFP4 (FAST, STRIX_LEAN) y el Q8_K_XL original |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con tipos ROCmFPX) |

## Arquitectura y entrenamiento

El modelo base, Ornith-1.5-35B-A3B, es un MoE de la familia Ornith desarrollada por ornith-ai, que se describe como una familia de modelos de auto-mejora para tareas agénticas. Ornith-1.5 extiende el auto-scaffolding a un bucle completo de auto-mejora: el modelo propone nuevas tareas, genera scaffolds especificos y produce rollouts de soluciones para aprendizaje por refuerzo. Sobre esta base, peculiar-ragdoll realizo un fine-tune orientado a codigo y agentic coding, dando lugar a Tiel-Coder-35B-A3B, y publico la conversion a GGUF.

La requantizacion de kingjones777 parte del tier `UD-Q8_K_XL` (35.81 GiB) de ese GGUF y aplica `--allow-requantize`, es decir, cuantizacion sobre cuantizacion, lo que introduce una perdida adicional frente a una conversion directa desde pesos BF16/F32. El autor lo advierte explicitamente y recomienda sopesar esta perdida frente a cuantizaciones Q4 construidas desde precision completa. La variante AGENT mantiene los tensores de atencion y los expertos MoE en Q6_0_ROCMFPX, con routing Q8_0, y protege la cabeza de salida (`output.weight`) y los embeddings (`token_embd.weight`) en Q8_0, verificados por nombre exacto de tensor.

## Capacidades

- Generacion de texto, razonamiento y codigo, con especial enfasis en tareas de programacion y agentic coding.
- Soporte de tool calling y function calling: verificado con una llamada real a `get_weather({"city":"Paris"})` a partir de un payload de herramientas.
- Capacidades de agente y razonamiento multi-paso, heredadas del diseno de Ornith-1.5 orientado a auto-mejora y scaffolding de tareas.
- Soporte de contexto largo: hasta 262 144 tokens, aunque en la configuracion recomendada se usa 32 768.
- Capacidad de vision: existe un `mmproj` (vision tower) en el repositorio fuente, pero no esta incluido en este archivo GGUF.
- Idiomas: no especificado en la informacion disponible.

## Casos de uso

- Agentes de codigo autonomos: el modelo puede planificar y ejecutar multiples pasos de generacion de codigo, usando tool calling para interactuar con entornos de desarrollo, ejecutar pruebas o consultar documentacion.
- Asistentes de programacion con function calling: integrable en IDEs o CLIs para autocompletar, refactorizar o explicar codigo, con la capacidad de invocar herramientas externas (linters, compiladores, APIs).
- Automatizacion de tareas con herramientas: escenarios donde se requiere que el modelo decida que funcion llamar (por ejemplo, consultar una base de datos, enviar un correo o actualizar un ticket) y genere los argumentos correctos.
- Pipelines de CI/CD con generacion de codigo: el modelo puede generar parches, revisar cambios o escribir tests, invocando comandos de build o analisis estatico mediante function calling.
- Prototipado rapido de agentes conversacionales: gracias a su soporte de contexto largo y tool calling, sirve para construir asistentes que mantienen estado a lo largo de conversaciones extensas.
- Investigacion en auto-mejora de modelos: al estar basado en Ornith-1.5, puede usarse como punto de partida para experimentos de generacion de tareas y aprendizaje por refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor indica explicitamente que la calidad no fue evaluada.

Si se proporcionan mediciones de rendimiento en hardware especifico (AMD Ryzen AI MAX+ 395, gfx1151, ROCm 7.2.4, full offload, prompt fijo de 4000 tokens):

| Tier | Tamano | GTT residente | Prompt processing | Generacion |
|---|---|---|---|---|
| AGENT (este, ftype 114) | 30.08 GiB | 30.4 GiB | 599 tok/s | 46.61 tok/s |
| STRIX_LEAN (ftype 106) | 17.46 GiB | 18.0 GiB | 1156 tok/s | 58.75 tok/s |
| FAST (ftype 103) | 17.37 GiB | 18.0 GiB | 1174 tok/s | 60.28 tok/s |
| UD-Q8_K_XL (original) | 35.81 GiB | 36.9 GiB | 794 tok/s | 46.5 tok/s |

El autor advierte que este tier AGENT es aproximadamente 0.5 veces el prompt processing y 0.79 veces la generacion de sus tiers de 4 bits, y 13 GiB mas grande. Se eligio por el routing de tool calling, no por velocidad.

## Requisitos de hardware

- VRAM: no aplica VRAM discreta; el modelo usa memoria unificada via GTT (Graphics Translation Table) en el AMD Ryzen AI MAX+ 395, con 30.4 GiB residentes.
- GPU recomendada: AMD Radeon 8060S (iGPU integrada en Strix Halo, gfx1151) con ROCm 7.2.4. Requiere un build de llama.cpp parcheado con ROCmFPX que soporte la arquitectura `qwen35moe` y los tipos `Q4_0_ROCMFP4_*`.
- No cabe en GPUs consumer tipicas: 30.4 GiB superan los 24 GB de una RTX 4090 o los 16 GB de una RTX 4080. Solo es viable en sistemas con memoria unificada amplia o GPUs profesionales con mas de 32 GB.
- Opciones de despliegue: llama.cpp con el parche ROCmFPX (compilado con `-DGGML_HIP=ON -DGPU_TARGETS=gfx1151 -DGGML_NATIVE=ON`), usando `llama-server` con `--n-gpu-layers 999 --flash-attn on --ctx-size 32768 --jinja`.
- Latencia y throughput medidos: 46.61 tok/s de generacion y 599 tok/s de prompt processing en el hardware indicado.

## Comparativa con modelos similares

La comparativa mas directa es con los otros tiers del mismo modelo base, ya que no se dispone de datos de modelos comparables externos (como Qwen3-35B-A3B) en la informacion proporcionada.

| Modelo | Tamano | Contexto | Licencia | Uso recomendado |
|---|---|---|---|---|
| Tiel-Coder-35B-A3B-ROCmFPX-AGENT (este) | 30.08 GiB | 262k | Apache-2.0 | Tool calling y agentes con maxima fidelidad |
| Tiel-Coder-35B-A3B-ROCmFP4-STRIX_LEAN | 17.46 GiB | 262k | Apache-2.0 | Codigo general con buen equilibrio velocidad/calidad |
| Tiel-Coder-35B-A3B-ROCmFP4-FAST | 17.37 GiB | 262k | Apache-2.0 | Velocidad maxima en codigo |
| Tiel-Coder-35B-A3B-UD-Q8_K_XL (original) | 35.81 GiB | 262k | Apache-2.0 | Maxima fidelidad, sin restricciones de velocidad |

El autor recomienda STRIX_LEAN o FAST para codigo general, y el Q8_K_XL original si se busca maxima fidelidad. Este tier AGENT solo tiene sentido para trabajo agéntico donde el routing de tool calling sea critico.

## Limitaciones y advertencias

- Requantizacion sobre cuantizacion: construido a partir de un Q8_K_XL con `--allow-requantize`, lo que introduce perdida adicional frente a una cuantizacion directa desde BF16/F32. El autor lo advierte explicitamente.
- Requiere software parcheado: necesita un build de llama.cpp con soporte ROCmFPX (por ejemplo, `ROCmFPX-2809dc5`). El llama.cpp estandar no reconoce ni la arquitectura `qwen35moe` ni los tipos `Q4_0_ROCMFP4_*`.
- Hardware limitado: solo probado en AMD Ryzen AI MAX+ 395 (gfx1151) con ROCm 7.2.4. No hay garantias de funcionamiento en otras GPUs AMD o NVIDIA.
- Rendimiento inferior a otros tiers: el prompt processing es aproximadamente la mitad y la generacion un 21% mas lenta que los tiers de 4 bits del mismo modelo, con 13 GiB adicionales de memoria.
- Sin benchmarks de calidad: no se ha evaluado la calidad del modelo en tareas estandar, por lo que no se puede cuantificar el impacto de la requantizacion en el rendimiento real.
- Riesgo de alucinacion y sesgos: no se ha documentado informacion especifica sobre sesgos o alucinaciones para este modelo. Como modelo de codigo, puede generar codigo incorrecto o inseguro; se recomienda revision humana en entornos de produccion.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kingjones777/Tiel-Coder-35B-A3B-ROCmFPX-AGENT-GGUF
- Repositorio fuente del GGUF original: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Repositorio de la familia Ornith: https://github.com/ornith-ai/Ornith-1
- Proyecto ROCmFPX: https://github.com/charlie12345/ROCmFPX
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Tiers alternativos del mismo autor: https://huggingface.co/kingjones777/Tiel-Coder-35B-A3B-ROCmFP4-STRIX_LEAN-GGUF y https://huggingface.co/kingjones777/Tiel-Coder-35B-A3B-ROCmFP4-FAST-GGUF
