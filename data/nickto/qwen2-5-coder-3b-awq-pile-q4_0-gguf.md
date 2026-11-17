# nickto/Qwen2.5-Coder-3B-AWQ-Pile-Q4_0-GGUF

## Resumen

Qwen2.5-Coder-3B-AWQ-Pile-Q4_0-GGUF es una cuantizacion GGUF del modelo Qwen2.5-Coder-3B de Alibaba Cloud, publicada por el usuario nickto. El modelo base es un transformer decoder-only de 3.085.938.688 parametros (aproximadamente 3,09 mil millones) especializado en generacion y completado de codigo, con soporte nativo de fill-in-the-middle (FIM) mediante los tokens especiales `<|fim_prefix|>`, `<|fim_suffix|>` y `<|fim_middle|>`. Esta version concreta aplica escalado AWQ calibrado sobre el dataset Pile antes de cuantizar a Q4_0 con `llama-quantize --pure`, de modo que todos los tensores, incluidos embeddings y capa de salida, quedan en Q4_0.

La relevancia de esta publicacion radica en que cuantizar un modelo de codigo a Q4_0 puro degrada severamente su capacidad de completado FIM, y el autor demuestra que el preescalado AWQ recupera buena parte de esa perdida: segun la model card, el modelo pasa de 20,8 / 12,6 / 35,2 pp de SAFIM pass@1 (sin AWQ) a 56,4 / 42,0 / 64,5 pp (con AWQ) en los modos control, block y api respectivamente, frente a los 60,7 / 47,8 / 67,4 pp del modelo sin cuantizar en F16.

El modelo esta pensado para ejecutarse con llama.cpp en escenarios de autocompletado inline en editores (llama.vim, llama.vscode) y como referencia para comparar contra la build equivalente para NPUs AMD (FastFlowLM). Su licencia es Qwen Research License Agreement, restringida a uso no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-Coder-3B) |
| Parametros totales | 3.085.938.688 (3,09 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_0 puro (todos los tensores, incluidos embedding y capa de salida) con preescalado AWQ calibrado en Pile |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Qwen Research License Agreement (uso no comercial) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 1,7 GB |
| Tokens especiales FIM | `<\|fim_prefix\|>`, `<\|fim_suffix\|>`, `<\|fim_middle\|>` |
| Modelo base | Qwen/Qwen2.5-Coder-3B |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen2.5-Coder-3B original: un transformer decoder-only denso de aproximadamente 3,09 mil millones de parametros. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO en el modelo base; estos datos corresponden a la model card oficial de Qwen, no incluida en la informacion facilitada.

La innovacion tecnica de esta publicacion concreta no esta en el entrenamiento sino en el pipeline de cuantizacion. Antes de convertir los pesos a Q4_0, el autor aplica escalado AWQ (Activation-aware Weight Quantization) calibrado sobre el dataset Pile, y despues ejecuta `llama-quantize --pure` para forzar que absolutamente todos los tensores, incluidos los embeddings de entrada y la capa de salida, queden en Q4_0. Este enfoque contrasta con las cuantizaciones habituales de llama.cpp (Q4_K_M, Q5_K_M), que mantienen algunos tensores en mayor precision. El autor advierte que no ha comparado esta build contra esas variantes k-quant, y que es posible que Q4_K_M o Q5_K_M recuperen la mayor parte de la perdida sin necesidad de AWQ, por lo que podrian ser igual de buenas o mejores con un tamano similar.

## Capacidades

- Generacion y completado de codigo en modo fill-in-the-middle (FIM), con soporte de los tokens especiales `<|fim_prefix|>`, `<|fim_suffix|>` y `<|fim_middle|>`.
- Autocompletado inline en editores mediante el endpoint `/infill` de llama.cpp, compatible con plugins como llama.vim y llama.vscode.
- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento sobre codigo y finalizacion de funciones a partir de contexto parcial.
- Integracion con llama.cpp via `llama-server` y descarga directa desde Hugging Face con `--hf-repo` y `--hf-file`.
- Compatibilidad con endpoints estandar de llama.cpp (`/completion`, `/infill`).
- No se dispone de informacion sobre soporte de tool calling, agentes multi-paso, vision, audio ni capacidades multilingues especificas en la informacion proporcionada.

## Casos de uso

- Autocompletado inline en editores de codigo: el modelo esta disenado especificamente para FIM, de modo que se integra en llama.vim o llama.vscode mediante el endpoint `/infill`, generando sugerencias de continuacion mientras se escribe, con una ventana de contexto que depende del modelo base Qwen2.5-Coder-3B.
- Relleno de funciones a partir de firma y llamada: dado un prefijo con la definicion (`def add(a, b):`) y un sufijo con la invocacion (`print(add(1, 2))`), el modelo genera el cuerpo intermedio (`return a + b`), lo que lo hace util para scaffolding de funciones y tests.
- Comparacion de tecnicas de cuantizacion: sirve como referencia empirica para evaluar el impacto de AWQ sobre Q4_0 puro en tareas de codigo, con metricas SAFIM pass@1 publicadas frente a la variante sin AWQ y frente a F16.
- Validacion de builds para NPUs AMD: al compartir pesos con la build FastFlowLM (NPU2), permite comparar el rendimiento en CPU/GPU via llama.cpp contra la ejecucion en NPU, con cifras de pass@1 documentadas para ambos entornos.
- Entornos con hardware limitado donde solo Q4_0 es rapido: el autor indica que esta build es adecuada en hardware donde unicamente Q4_0 ofrece buen rendimiento, gracias a su tamano de repositorio de 1,7 GB.
- Prototipado de asistentes de codigo locales: al ejecutarse con `llama-server` en local, permite montar un servicio de completado sin dependencia de APIs externas, util para pruebas de integracion en pipelines de desarrollo.
- Reproducibilidad de experimentos: el codigo del pipeline esta publicado en el repositorio `fim-in-flm` (commit `21ba261`), lo que facilita replicar la calibracion AWQ y la cuantizacion Q4_0 sobre otros modelos.

## Benchmarks y rendimiento

Resultados de SAFIM pass@1 en porcentaje (modos control / block / api), segun la model card:

| Build | Runtime | pass@1 (control / block / api) |
|---|---|---|
| Este modelo (AWQ + Q4_0) | llama.cpp | 56,4 / 42,0 / 64,5 |
| Q4_0 sin AWQ | llama.cpp | 20,8 / 12,6 / 35,2 |
| F16 sin cuantizar | llama.cpp | 60,7 / 47,8 / 67,4 |
| Los mismos pesos en FLM (NPU) | FLM | 54,7 / 39,5 / 65,5 |

El preescalado AWQ aporta 35,6 / 29,3 / 29,4 puntos porcentuales de pass@1 sobre Q4_0 sin AWQ en los tres modos. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF ocupa 1,7 GB, por lo que la huella de pesos en Q4_0 ronda esa cifra; a ello hay que sumar la memoria de la cache KV, cuyo tamano depende de la longitud de contexto configurada (no especificada en la informacion disponible).
- GPU recomendadas: no se indican modelos concretos en la informacion proporcionada. Por tamano, el modelo es apto para GPUs de consumo, aunque no se detallan cuales.
- Cabe en GPU de consumo: si, dado el tamano de 3,09 B de parametros en Q4_0 (1,7 GB de pesos); no se especifican modelos concretos.
- Opciones de despliegue: llama.cpp mediante `llama-server` y descarga directa con `--hf-repo nickto/Qwen2.5-Coder-3B-AWQ-Pile-Q4_0-GGUF --hf-file qwen2.5-coder-3b-awq-pile-q4_0.gguf`; tambien ejecutable en NPUs AMD mediante FastFlowLM con los mismos pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | SAFIM pass@1 (control/block/api) | Licencia |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-Coder-3B AWQ Q4_0) | 3,09 B | no disponible | Q4_0 puro + AWQ | 56,4 / 42,0 / 64,5 | Qwen Research (no comercial) |
| Qwen2.5-Coder-3B Q4_0 sin AWQ | 3,09 B | no disponible | Q4_0 puro | 20,8 / 12,6 / 35,2 | Qwen Research (no comercial) |
| Qwen2.5-Coder-3B F16 | 3,09 B | no disponible | F16 | 60,7 / 47,8 / 67,4 | Qwen Research (no comercial) |
| Qwen2.5-Coder-3B en FLM (NPU) | 3,09 B | no disponible | Formato FLM | 54,7 / 39,5 / 65,5 | Qwen Research (no comercial) |

No se dispone de datos en la informacion proporcionada para comparar con otras familias de modelos de codigo de tamano similar (por ejemplo, variantes de 3B de otros fabricantes).

## Limitaciones y advertencias

- Licencia Qwen Research License Agreement: uso exclusivamente no comercial; cualquier despliegue en produccion comercial requiere revisar los terminos del acuerdo y obtener la licencia correspondiente de Alibaba Cloud.
- La cuantizacion Q4_0 puro degrada el rendimiento frente a F16: se pierden 4,3 / 5,8 / 2,9 puntos porcentuales de SAFIM pass@1 en los modos control, block y api respectivamente, incluso con AWQ.
- El autor advierte que no ha comparado esta build con cuantizaciones k-quant habituales (Q4_K_M, Q5_K_M), que podrian ofrecer un mejor equilibrio precision/tamano sin necesidad de AWQ.
- Riesgo de alucinacion: no documentado especificamente en la informacion proporcionada, pero inherente a los modelos generativos de codigo; las sugerencias deben validarse con tests.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se detallan en la informacion facilitada; el modelo base Qwen2.5-Coder esta orientado principalmente a codigo.
- El modelo esta pensado para FIM y generacion de codigo; su uso como modelo conversacional general no esta validado en la informacion disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni de validacion externa del rendimiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nickto/Qwen2.5-Coder-3B-AWQ-Pile-Q4_0-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B/blob/main/LICENSE
- Build equivalente para NPU (FastFlowLM): https://huggingface.co/nickto/Qwen2.5-Coder-3B-AWQ-Pile-Q4_0-NPU2
- Repositorio del pipeline: https://gitlab.com/nickto/fim-in-flm
- Resultados y notas del proceso: https://gitlab.com/nickto/fim-in-flm/-/blob/21ba261/FINDINGS.md
- Entrada de blog: https://blog.nickto.net/2026-11-17-get-inline-suggestions-from-a-model-on-an-amd-npu/
- SAFIM (benchmark): https://github.com/gonglinyuan/safim
