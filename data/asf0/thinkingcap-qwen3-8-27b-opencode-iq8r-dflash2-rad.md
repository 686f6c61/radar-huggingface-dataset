# asf0/ThinkingCap-Qwen3.8-27B-opencode-IQ8R-DFlash2-rad

## Resumen

ThinkingCap-Qwen3.8-27B-opencode-IQ8R-DFlash2-rad es un contenedor de inferencia cuantizado del modelo bottlecapai/ThinkingCap-Qwen3.8-27B (27B parametros, familia Qwen3.8), publicado por el usuario asf0. Combina tres piezas: el modelo base ThinkingCap, el adaptador LoRA harness-hub/Qwen3.8-27B-opencode-adapted fusionado en bf16, y el drafter de decodificacion especulativa z-lab/Qwen3.8-27B-DFlash2. El resultado se empaqueta en un unico fichero `.rad` de 28,76 GiB para el motor de inferencia radiance 2.2.0, orientado a GPUs AMD RDNA4 con ROCm.

El modelo resuelve el problema de desplegar un agente de codificacion con razonamiento sobre hardware AMD consumer/prosumer, con cuantizacion INT8 W8A8 (IQ8R por redondeo al mas cercano) y decodificacion especulativa integrada. Es relevante porque demuestra un pipeline completo de agente (OpenCode) sobre silicio AMD, con resultados medidos en Terminal-Bench 2.1 (58 de 87 tareas con thinking a xhigh, frente a 56 del modelo base sin fine-tune).

La licencia es Polyform Small Business 1.0.0, lo que restringe el uso comercial a pequenas empresas. El contenedor es experimental: el adaptador se entreno sobre el modelo base, no sobre ThinkingCap, y el autor lo advierte explicitamente. El repo acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8), con drafter de difusion por bloques DFlash2 para decodificacion especulativa |
| Parametros totales | 27B (heredados del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (configurado en el ejemplo de servido) |
| Tipos de cuantizacion | INT8 W8A8 (IQ8R por redondeo al mas cercano); tronco lineal int8 con escala u8 por fila y 256 de K bajo escala bf16 por fila; activaciones int8; lm_head int8; drafter a 4 bits (codebook) |
| Idiomas soportados | no disponible |
| Licencia | Polyform Small Business 1.0.0 |
| Formato de pesos | Contenedor `.rad` (motor radiance); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de 27B parametros de la familia Qwen3.8, sobre el que se aplica un adaptador LoRA (256 pesos LoRA, cambio relativo maximo de 0,0026) entrenado por harness-hub para el agente OpenCode. El adaptador se fusiona en bf16 sobre ThinkingCap y despues se cuantiza a INT8 con la receta `q38-27b-iq8r-rtn.recipe`: cada capa lineal del tronco en int8 con escala u8 por fila, 256 de la dimension K bajo escala bf16 por fila, y cada bloque de 128 de K rotado mediante la transformada de Hadamard. No se usa datos de calibracion (RTN puro).

La innovacion principal es la integracion del drafter z-lab/Qwen3.8-27B-DFlash2, un modelo de difusion por bloques a 4 bits que actua como especulador para decodificacion especulativa, fusionado dentro del mismo contenedor. El resultado es un unico fichero que sirve tanto para modo thinking como sin thinking, con el drafter activo y cache KV en int8. El autor senala que la combinacion es experimental porque el adaptador se entreno sobre el modelo base y no sobre ThinkingCap.

## Capacidades

- Generacion de texto y razonamiento con modo thinking configurable (`reasoning-effort`: `none` o `xhigh`).
- Codificacion y tareas agenticas de terminal: el modelo esta adaptado especificamente para el agente OpenCode.
- Tool calling / function calling: el servidor expone la API OpenAI (`/v1/chat/completions`, `/v1/completions`) con soporte de tool calls.
- Razonamiento multi-paso y uso de agentes: validado en Terminal-Bench 2.1 con el harness Harbor y el agente OpenCode 2.2.7.
- Decodificacion especulativa integrada (DFlash2) para acelerar la generacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Agente de codificacion autonomo en terminal: el modelo esta adaptado a OpenCode y resuelve tareas de Terminal-Bench 2.1 (58/87 con thinking a xhigh), por lo que encaja en pipelines de resolucion de incidencias, refactorizacion y ejecucion de comandos sobre repositorios reales.
- Despliegue sobre hardware AMD RDNA4: el contenedor esta pensado para radiance 2.2.0 con ROCm y GPUs Radeon AI PRO R9700 en tensor parallel 2, lo que permite montar un servidor de inferencia sin depender de CUDA.
- Servicio de razonamiento con contexto largo: con 131.072 tokens de ventana y cache KV int8, admite conversaciones multi-turno o analisis de codebases extensos en una sola pasada.
- Integracion en herramientas tipo IDE o CLI: al hablar la API OpenAI con tool calls, se puede conectar a clientes existentes (OpenCode, asistentes de terminal) sin adaptadores propios.
- Evaluacion de cuantizacion INT8 en produccion: util para equipos que quieran medir la perdida de calidad de W8A8 RTN frente a bf16 en tareas de codigo y razonamiento, con los datos de QualityBench ya publicados.
- Experimentacion con decodificacion especulativa: el drafter DFlash2 fusionado permite estudiar el impacto en throughput y en numero de tokens generados sin montar infraestructura separada.
- Modo rapido sin thinking: con `reasoning-effort: none` el modelo iguala al adaptador OpenCode solo (47 frente a 49 tareas) con menos timeouts y menos output, adecuado para tareas de latencia baja.

## Benchmarks y rendimiento

Terminal-Bench 2.1 (agentico, OpenCode 2.2.7, 87 tareas puntuadas; una ejecucion por configuracion, 24-25 de noviembre de 2026; 2x Radeon AI PRO R9700, contexto 131.072, temperatura 0,8, top-p 1,0):

| Configuracion | Resueltas (de 87) | Facil (4) | Medio (53) | Dificil (30) | Tokens de salida | Tokens procesados |
|---|---|---|---|---|---|---|
| Qwen3.8-27B stock, thinking off | 40 (46%) | 2 | 33 | 5 | 3,30M | 533M |
| Adaptador OpenCode, thinking off | 49 (56%) | 4 | 38 | 7 | 2,20M | 190M |
| ThinkingCap + adaptador, thinking off | 47 (54%) | 3 | 34 | 10 | 1,93M | 219M |
| Qwen3.8-27B stock, xhigh | 56 (64%) | 2 | 40 | 14 | 4,44M | 167M |
| ThinkingCap + adaptador, xhigh | 58 (67%) | 4 | 41 | 13 | 3,44M | 147M |

Pruebas pareadas (McNemar exacto): thinking sube stock de 40 a 56 (p = 0,005) y ThinkingCap + adaptador de 47 a 58 (p = 0,04). Con thinking activado, ThinkingCap + adaptador y stock empatan (58 frente a 56, p = 0,75), pero el fine-tune escribe una mediana de 44% menos output en las tareas que ambos resuelven.

QualityBench quick (precision en %, items entre parentesis):

| Tarea | Stock GPTQ, off | ThinkingCap + adaptador, off | Stock GPTQ, xhigh | ThinkingCap + adaptador, xhigh |
|---|---|---|---|---|
| GSM8K (132) | 97,7 | 97,7 | 96,2 | 96,2 |
| IFEval (55) | 87,3 | 83,6 | 90,9 | 94,5 |
| MMLU-Pro (100) | 82,0 | 78,0 | 82,0 | 79,0 |
| HumanEval (17) | 94,1 | 94,1 | 100,0 | 94,1 |
| MBPP (38) | 81,6 | 81,6 | 81,6 | 84,2 |
| BFCL (40) | 90,0 | 92,5 | 95,0 | 97,5 |
| LiveCodeBench v6 (18) | 50,0 | 61,1 | 83,3 | 83,3 |

QualityBench quick usa una decima fija de los items de cada tarea, con intervalos unas tres veces mas anchos que una ejecucion completa; limites de 32.768 tokens de salida con thinking off y 98.304 con thinking on. Ninguna tarea difiere de stock mas de lo que permite su intervalo del 95% (la comprobacion T5 de QualityBench pasa 7/7).

## Requisitos de hardware

- VRAM estimada: el contenedor pesa 28,76 GiB; con cache KV int8 y contexto de 131.072 tokens se necesita margen adicional, por lo que en la practica se reparte entre varias GPUs.
- GPU validadas: 2x AMD Radeon AI PRO R9700 en tensor parallel 2, con ROCm y radiance 2.2.0.
- GPU consumer: no se documenta ejecucion en una sola GPU consumer; el tamano del contenedor y el contexto configurado apuntan a un minimo de dos aceleradores o a reducir contexto y secuencias.
- Opciones de despliegue: exclusivamente el motor radiance 2.2.0 (contenedor `.rad`); no se mencionan vLLM, llama.cpp, Ollama ni TGI como compatibles.
- Configuracion de servido: `tp: 2`, `max-model-len: 131072`, `max-num-seqs: 8`, `kv-cache-dtype: i8`, `reasoning-effort: xhigh`.
- Latencia y throughput: no se publican cifras de tokens por segundo; solo se reportan recuentos de tokens de salida y procesados por configuracion en Terminal-Bench.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resultado Terminal-Bench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThinkingCap + OpenCode (este) | 27B | 131.072 | 58/87 (xhigh), 47/87 (off) | Polyform Small Business 1.0.0 | Contenedor `.rad`, 0 descargas |
| Qwen3.8-27B stock | 27B | 131.072 (en la misma prueba) | 56/87 (xhigh), 40/87 (off) | no disponible en esta ficha | Contenedor `.rad` RTN y GPTQ |
| Adaptador OpenCode solo | 27B | no disponible | 49/87 (off) | no disponible en esta ficha | Adaptador LoRA en HF |
| ThinkingCap-Qwen3.8-27B (base) | 27B | no disponible | no disponible | no disponible en esta ficha | Pesos en HF |

## Limitaciones y advertencias

- El adaptador se entreno sobre el modelo base y no sobre ThinkingCap; el autor califica la combinacion de experimental.
- Una sola ejecucion por configuracion en Terminal-Bench: diferencias de pocas tareas pueden ser azar, segun el propio autor.
- QualityBench quick usa solo una decima parte de los items, con intervalos del 95% unas tres veces mas anchos que una ejecucion completa.
- Dos tareas QEMU de Terminal-Bench fallaron en todas las ejecuciones por un paquete Debian ausente y quedaron fuera (87 de 89 tareas puntuadas).
- La cuantizacion es RTN sin datos de calibracion, lo que puede penalizar tareas sensibles a la precision; en MMLU-Pro y HumanEval con xhigh el fine-tune queda por debajo de stock.
- Licencia Polyform Small Business 1.0.0: restringe el uso comercial; revisar el fichero LICENSE antes de cualquier despliegue en produccion.
- Solo es ejecutable con radiance 2.2.0 sobre ROCm/RDNA4; no hay soporte documentado para CUDA, vLLM ni llama.cpp.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingue mas alla de la del modelo base.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones especificas en la informacion disponible.
- Repositorio sin descargas ni likes: no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asf0/ThinkingCap-Qwen3.8-27B-opencode-IQ8R-DFlash2-rad
- Modelo base ThinkingCap: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Adaptador OpenCode: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
