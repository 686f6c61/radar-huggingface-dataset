# goodmai/gemma-4-31B-it-PV-MACaQ-4bit-MXFP4-MLX

## Resumen

`goodmai/gemma-4-31B-it-PV-MACaQ-4bit-MXFP4-MLX` es una cuantizacion de 4 bits en formato MXFP4 del checkpoint `google/gemma-4-31B-it-qat-q4_0-unquantized`, preparada especificamente para el runtime MLX de Apple Silicon mediante la herramienta Basalt del propio autor. El modelo base es la variante instruct de Gemma 4 de 31B de Google, ya sometida a entrenamiento con cuantizacion (QAT) a 4 bits, por lo que esta version parte de pesos BF16 "descuantizados" y los vuelve a comprimir con una tecnica propietaria denominada PV-MACaQ.

La innovacion principal es el esquema PV-MACaQ, que combina escalado consciente de activaciones (`pre_scale`), rotacion de Hadamard por bloques y dos rondas de ajuste PV-Tuning para refinar escalas E8M0 y codigos E2M1. Segun las metricas declaradas por el autor, esto mejora el SQNR medio frente a la cuantizacion RTN estandar (19,02 dB frente a 18,90 dB) y reduce el error cuadratico medio un 2,8%, manteniendo el tower de vision, las normas y los routers en BF16 nativo.

El resultado es un repositorio de 18,2 GB (frente a los 62,55 GB de entrada, una compresion de 3,43x) con 410 modulos lineales cuantizados y ningun modulo MoE cuantizado. Es relevante para desarrolladores que quieran ejecutar un Gemma 4 de 31B multimodal en Macs con memoria unificada, aunque el ecosistema de despliegue esta limitado practicamente al stack MLX + Basalt.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con tower de vision; pesos cuantizados en MLX |
| Parametros totales | 6.565.835.116 (segun safetensors del repo; el nombre comercial indica 31B) |
| Parametros activos | no disponible (el autor indica 0 modulos MoE cuantizados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MXFP4 (group_size=32, hadamard_block=32, codigos E2M1 + escalas E8M0) en backbone; embeddings 8-bit affine (group_size=64); vision tower, normas y routers en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), libreria `mlx` |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 de 31B en variante instruct, distribuido por Google como checkpoint QAT de 4 bits en BF16 sin cuantizar (`qat-q4_0-unquantized`). Sobre esa base, el autor aplica una re-cuantizacion a MXFP4 orientada a MLX: los modulos `Linear` del backbone y los `SwitchLinear` de MoE se comprimen a 4 bits con bloques de 32 elementos, codigos E2M1 y escalas E8M0, mientras que `embed_tokens` se mantiene en 8 bits affine con grupo de 64. El tower de vision, las capas de normalizacion y los routers de MoE permanecen en BF16 para preservar la calidad multimodal y el enrutado.

La tecnica PV-MACaQ introduce tres componentes: un `pre_scale` consciente de las activaciones, una rotacion de Hadamard por bloques de 32 y dos rondas de PV-Tuning (paso P de minimos cuadrados sobre `pre_scale` y paso V de refinamiento de coordenadas E8M0 y codigos). El autor reporta 410 modulos `MACaQQuantizedLinear` cuantizados y 0 modulos `MACaQSwitchLinear` de MoE, lo que sugiere que en este checkpoint concreto no se aplico cuantizacion especifica a las capas de mezcla de expertos (o no existen en esta variante). No se dispone de informacion sobre el dataset de entrenamiento original de Gemma 4, el numero de tokens, ni sobre fases de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento conversacional en modo instruct, heredadas del checkpoint `gemma-4-31B-it`.
- Procesamiento de vision: el tower visual se conserva en BF16 nativo, por lo que se mantiene la capacidad multimodal del modelo base.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para esta variante cuantizada.
- Razonamiento multi-paso y uso como agente: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas del repo esta vacio).
- Modo "thinking" o razonamiento extendido: no disponible en la informacion proporcionada.
- Ejecucion nativa en Apple Silicon via MLX, con integracion directa en Basalt.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el modelo ocupa 18,2 GB en disco y puede cargarse en equipos Apple Silicon de gama alta (64 GB o mas), permitiendo ejecutar un Gemma 4 de 31B sin GPU dedicada.
- Prototipado multimodal en estacion de trabajo: al conservar el tower de vision en BF16, sirve para experimentar con tareas imagen-texto en local antes de pasar a despliegues en cloud.
- Evaluacion de tecnicas de cuantizacion: el repo documenta metricas SQNR y MSE frente a RTN, por lo que es util como referencia para investigar esquemas MXFP4 con PV-Tuning en MLX.
- Desarrollo de asistentes conversacionales offline: la variante instruct permite construir chatbots que no envian datos a servicios externos, adecuado para entornos con requisitos de privacidad.
- Pruebas de pipelines Basalt: sirve como checkpoint de validacion para el runtime Basalt del autor y para medir latencia y throughput en hardware Apple.
- Generacion de codigo y texto tecnico en local: hereda las capacidades del Gemma 4 instruct, util para autocompletado y redaccion asistida en IDE sobre Mac.
- Benchmarking de cuantizacion en produccion: util para comparar la degradacion de calidad de MXFP4 frente al checkpoint QAT original en tareas concretas del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta metricas de cuantizacion:

| Metrica | Valor |
|---|---|
| Modulos `MACaQQuantizedLinear` cuantizados | 410 |
| Modulos `MACaQSwitchLinear` MoE cuantizados | 0 |
| Tamano de entrada (BF16) | 62,55 GB |
| Tamano de salida (PV-MACaQ MXFP4) | 18,22 GB (3,43x) |
| SQNR medio RTN MXFP4 | 18,90 dB |
| SQNR medio PV-MACaQ MXFP4 | 19,02 dB (+0,12 dB) |
| Reduccion media de MSE frente a RTN | 2,8% |

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 18,2 GB solo para pesos; en la practica se recomienda 32 GB o mas de memoria unificada para margen de activaciones y cache KV.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (M2 Max, M2 Ultra, M3 Max, M3 Ultra, M4 Max y superiores). No aplica a GPUs NVIDIA o AMD por depender de MLX.
- Cabe en consumer GPU: si, en equipos Apple Silicon de gama alta; no en GPUs de consumo con 8-16 GB de VRAM por la dependencia de MLX.
- Opciones de despliegue: `basalt serve --model goodmai/gemma-4-31B-it-PV-MACaQ-4bit-MXFP4-MLX` (Basalt + MLX). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| goodmai/gemma-4-31B-it-PV-MACaQ-4bit-MXFP4-MLX | 6.565.835.116 (safetensors) | no disponible | MXFP4 4-bit + embeddings 8-bit | no disponible | MLX / Basalt |
| google/gemma-4-31B-it-qat-q4_0-unquantized | no disponible | no disponible | QAT 4-bit en BF16 sin cuantizar | no disponible | Generico (BF16) |
| Otras cuantizaciones GGUF de Gemma 4 31B | no disponible | no disponible | Q4_K_M, Q5_K_M, etc. | no disponible | llama.cpp / Ollama |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El repo tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (19 de noviembre de 2026); no hay evidencia de validacion por terceros.
- La licencia no esta declarada en el repo, por lo que el uso comercial queda sujeto a la licencia del modelo base de Google, que el autor no explicita.
- El campo de idiomas esta vacio; no se puede confirmar cobertura multilingue mas alla de la del checkpoint original.
- La cuantizacion a 4 bits MXFP4 introduce degradacion respecto al checkpoint QAT original; el autor reporta solo 19,02 dB de SQNR medio, lo que implica ruido no despreciable en las activaciones.
- Dependencia exclusiva de MLX y Basalt: no hay pesos GGUF ni compatibilidad con vLLM, TGI o llama.cpp, lo que limita el despliegue a hardware Apple.
- El conteo de parametros en safetensors (6.565.835.116) no coincide con el nombre comercial "31B", lo que puede deberse a comparticion de pesos, empaquetado de cuantizacion o a una discrepancia en el checkpoint base; conviene verificar antes de dimensionar hardware.
- No se documentan sesgos especificos, riesgos de alucinacion ni evaluaciones de seguridad para esta variante.
- Ausencia de benchmarks de tareas: no se puede afirmar que la calidad se mantenga en codigo, matematicas o vision tras la cuantizacion.
- El esquema PV-MACaQ es propietario del autor y no esta descrito en un paper publico enlazado, lo que dificulta su reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/goodmai/gemma-4-31B-it-PV-MACaQ-4bit-MXFP4-MLX
- Modelo base: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Repositorio Basalt: https://github.com/goodmai/basalt
