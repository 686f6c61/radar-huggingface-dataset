# AlephFunk/inkling-2-mini-bdb-lora

## Resumen

Inkling-2-Mini BDB LoRA es un adaptador LoRA de rango 16 publicado por el usuario AlephFunk sobre el modelo base `thinkingmachines/Inkling-2-Mini`, un modelo de arquitectura MoE con bucles (looped MoE) de 24 capas y 128 expertos por capa, bajo licencia Apache-2.0. El adaptador se ha entrenado mediante SFT con la plataforma Tinker (nivel gratuito) sobre datos de la tarea Bitcoin DeFi Bench, que cubre dominios de bonding, DLC y netting.

El objetivo del adaptador es especializar el modelo base en tareas financieras de DeFi sobre Bitcoin, un nicho que los modelos generalistas rara vez cubren con precision. Segun la model card, la perdida de validacion en datos reservados cae de 0,400 a 0,218 tras el entrenamiento, y la puntuacion en la evaluacion Bitcoin DeFi Bench pasa de 0,201 (modelo base) a 0,646 (con adaptador) bajo un presupuesto de 6.144 tokens.

El repositorio incluye el adaptador PEFT canonico en safetensors, una segunda exportacion PEFT con los nombres de modulo nativos de Inkling, una conversion a GGUF f16 para llama.cpp y los registros de entrenamiento (`run.json`, `log.jsonl`). Es relevante para quienes necesiten un modelo pequeno y desplegable en local especializado en razonamiento sobre contratos DeFi de Bitcoin, aunque el autor advierte que la conversion GGUF no se verifico de extremo a extremo antes de la publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelo base MoE con bucles (24 capas x 128 expertos) |
| Parametros totales | 632.635.392 (pesos del adaptador en safetensors) |
| Parametros activos | no disponible (depende del enrutado del MoE del modelo base) |
| Longitud de contexto | no disponible en el adaptador; el modelo base se entreno con max_length 8192 |
| Tipos de cuantizacion | f16 (GGUF LoRA); el modelo base dispone de UD-Q4_K_M en unsloth |
| Idiomas soportados | no disponible |
| Licencia | no disponible para el adaptador; el modelo base es Apache-2.0 |
| Formato de pesos | safetensors (PEFT), GGUF (LoRA f16 para llama.cpp) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 y `target_modules: all-linear`, aplicado sobre todas las proyecciones lineales del modelo base. La exportacion secundaria en `peft_export/` explicita los nombres de modulo nativos de Inkling (`wq_du`, `wk_dv`, `wv_dv`, `wo_ud`, `gate_attn`, `gate_proj`, `up_proj`, `down_proj`), que se usa como paso intermedio para la conversion a GGUF. El modelo base es un MoE con bucles de 24 capas y 128 expertos por capa, con aproximadamente 19,5 GB de pesos en el repositorio original.

El entrenamiento se realizo con Tinker SFT sobre la variante `thinkingmachines/Inkling-2-Mini:peft:65536:free`, con learning rate 2e-4, batch de 8, 168 pasos (3 epocas), `effort 0.0` (pensamiento minimo) y `max_length` de 8192 tokens. La perdida de validacion en datos reservados paso de 0,400 a 0,218, estabilizandose tras la primera epoca. La conversion a GGUF se hizo mediante un stub header-only de los safetensors del modelo base, sin descargar los 19,5 GB completos, y el autor indica que no se verifico de extremo a extremo contra el fichero GGUF servido en local en el momento de la subida.

## Capacidades

- Generacion de texto y razonamiento especializado en tareas DeFi sobre Bitcoin (bonding, DLC, netting).
- Razonamiento multi-paso con modo de pensamiento configurable (`effort 0.0` para pensamiento minimo).
- Soporte de tool calling y function calling heredado del modelo base (no verificado de forma independiente en el adaptador).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Despliegue en llama.cpp mediante LoRA GGUF f16 emparejado con `Inkling-2-Mini-UD-Q4_K_M.gguf`.
- Compatibilidad con el ecosistema PEFT/Hugging Face Transformers para carga del adaptador.

## Casos de uso

- Analisis de contratos de bonding en Bitcoin DeFi: el adaptador obtiene 1,0 en la subtarea bonding del benchmark, por lo que puede usarse para evaluar y generar logica de curvas de bonding en entornos de prueba.
- Verificacion de condiciones de DLC (Discreet Log Contracts): con 0,938 en la subtarea dlc, es adecuado para asistentes que redacten o revisen condiciones de liquidacion de contratos discretos.
- Generacion de codigo de integracion con protocolos DeFi: el soporte de tool calling del modelo base permite integrarlo en pipelines que consulten APIs on-chain y generen scripts de interaccion.
- Asistente de documentacion tecnica de Bitcoin DeFi: con contexto de 8192 tokens puede procesar whitepapers y especificaciones de protocolos para resumirlos o responder preguntas.
- Evaluacion automatizada de modelos en dominios financieros: el adaptador y sus registros (`run.json`, `log.jsonl`) sirven como referencia reproducible para comparar tecnicas de fine-tuning en nichos verticales.
- Prototipado local en estaciones de trabajo: al ser un adaptador pequeno (4,1 GB de repo) sobre un modelo base cuantizable a Q4_K_M, permite experimentar en hardware de consumo sin depender de la nube.

## Benchmarks y rendimiento

| Benchmark | Modelo base | Con adaptador |
|---|---|---|
| Bitcoin DeFi Bench (global, presupuesto 6.144 tokens) | 0,201 | 0,646 |
| Bitcoin DeFi Bench - bonding | no disponible | 1,000 |
| Bitcoin DeFi Bench - dlc | no disponible | 0,938 |
| Bitcoin DeFi Bench - netting | no disponible | 0,000 |
| Perdida de validacion (datos reservados) | 0,400 | 0,218 |

El autor senala que 21 de las 36 completaciones del modelo base alcanzaron el limite de tokens antes de resolver la tarea, lo que explica en parte la diferencia. La subtarea netting obtuvo 0 con el adaptador porque el conjunto de evaluacion contenia importes de marcador de posicion y estaba desequilibrado.

## Requisitos de hardware

- VRAM estimada para el adaptador: minima (pesos del adaptador en f16 ocupan aproximadamente 1,3 GB); el grueso del coste lo determina el modelo base de 19,5 GB en precision completa.
- Modelo base en Q4_K_M: aproximadamente 10-12 GB de VRAM, apto para GPUs de consumo con 12-16 GB (RTX 4070 Ti Super, RTX 4080, RTX 4090).
- Modelo base en f16: requiere aproximadamente 40 GB de VRAM (A100 40GB/80GB, H100).
- Despliegue: llama.cpp (version >= b12611, probado con b12686) con el LoRA GGUF f16; PEFT/Transformers para el adaptador nativo.
- vLLM, TGI y Ollama: no se documenta soporte explicito para el adaptador en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Inkling-2-Mini BDB LoRA | 632 M (adaptador) | 8192 (entrenamiento) | LoRA sobre MoE para DeFi Bitcoin | no disponible (base Apache-2.0) |
| Inkling-2-Mini (base) | no disponible (19,5 GB) | no disponible | MoE generalista con bucles | Apache-2.0 |
| Alternativas especializadas en DeFi | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros adaptadores o modelos comparables en el mismo nicho dentro de la informacion proporcionada.

## Limitaciones y advertencias

- La subtarea netting obtuvo 0,000 en la evaluacion; el adaptador no es fiable para calculos de netting con el conjunto de datos actual.
- La conversion GGUF no se verifico de extremo a extremo segun el autor; conviene validar el fichero antes de usarlo en produccion.
- El adaptador se entreno con `effort 0.0` (pensamiento minimo), lo que puede limitar su rendimiento en tareas que requieran cadenas de razonamiento largas.
- No hay informacion sobre sesgos, idiomas soportados ni evaluaciones de alucinacion.
- La licencia del adaptador no esta declarada; la del modelo base es Apache-2.0, pero conviene confirmar los terminos antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes, sin validacion independiente por parte de la comunidad.
- El modelo base tiene 19,5 GB, lo que limita el despliegue en hardware de consumo salvo que se cuantice.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AlephFunk/inkling-2-mini-bdb-lora
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
