# OsaurusAI/Ripple-65B-Preview-JANGH2

## Resumen

Ripple-65B-Preview-JANGH2 es una cuantización de 2 bits del modelo denso Ripple-65B-Preview de ricursiveAI, empaquetada por OsaurusAI para su ejecución en Apple Silicon mediante la librería MLX. El objetivo es claro: hacer que un transformer denso de 65.000 millones de parámetros y 80 capas quepa en Macs que no pueden alojar la variante JANG_4D de 43,7 GB, reduciendo el peso de los shards a 24,62 GB (3,04 bits por peso sobre los 64,8B parámetros del modelo fuente).

La innovación principal es el formato JANGH 2-bit aplicado al feed-forward, que representa el 78% de los pesos. Emplea una rotación Hadamard-32 con codebook de cuantización, una escala fp16 por fila de salida y redondeo GPTQ sobre las Hessianas rotadas, con corrección de ganancia medida en las escalas de fila. Las proyecciones de atención, embeddings y lm_head mantienen módulos afines de 6-8 bits, idénticos a los de JANG_4D.

El bundle incluye además el drafter de decodificación especulativa DFlash2 del propio modelo en BF16 (8,08 GB), que propone hasta 15 tokens por paso para verificación por el modelo principal. La calidad se degrada de forma medible respecto a la versión de 4 bits: KL medio de 0,0841 frente a 0,00239 y acuerdo top-1 del 90,28% frente al 98,30%, con pérdidas concentradas en texto multilingüe y creativo. Requiere el runtime Osaurus 0.25.32 o superior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, 80 capas; atención completa cada 5 capas sin rotación posicional, resto sliding-window attention de 1.024 tokens, con gated attention y value residual |
| Parámetros totales | 17.603.732.560 (según safetensors del repo cuantizado); 64,8B en el modelo fuente |
| Parámetros activos | no disponible (modelo denso) |
| Longitud de contexto | hasta 1M tokens según la model card del modelo original; solo las 16 capas de atención completa mantienen KV cache creciente con el contexto |
| Tipos de cuantización | JANGH 2-bit (Hadamard-32, codebook odd-cubic, escalas fp16 por fila) en gate/up/down; affine 6-bit y 8-bit en atención, embeddings y lm_head; bf16 en normas y pesos de value-residual; drafter BF16 cuantizado a 4-bit al cargar |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 24,62 GB de shards; drafter en `dflash2/model.safetensors` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 65.000 millones de parámetros y 80 capas. La particularidad arquitectónica es la intercalación de tipos de atención: una de cada cinco capas usa atención completa sin rotación posicional, mientras que las restantes emplean sliding-window attention con ventana de 1.024 tokens. Incorpora gated attention y un mecanismo de value residual. Esta combinación limita el crecimiento del KV cache a las 16 capas de atención completa, lo que permite sostener contextos muy largos con un coste de memoria controlado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en la información proporcionada. La model card sí documenta el proceso de cuantización: las 240 proyecciones del feed-forward se redondearon con GPTQ usando ordenación de activaciones sobre las Hessianas rotadas, y las escalas de fila incorporan una corrección de ganancia medida. La elección del método de redondeo por módulo consultó las filas de entrada del conjunto de calibración, por lo que las métricas de calidad pueden ser ligeramente optimistas según el propio autor. El conjunto de evaluación consta de 221.809 posiciones de asistente, con al menos 30.000 en cada uno de 7 dominios, generadas por el propio Ripple y no usadas en calibración.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento explícito con modo thinking: el modelo decide en cada turno si razona, sin interruptor ni niveles de esfuerzo configurables; el razonamiento previo permanece en el historial por defecto (`clear_thinking=false`).
- Tool calling mediante JSON dentro de etiquetas `<tool_call>` con la estructura `{"name": ..., "arguments": {...}}`; los resultados se devuelven como bloques `<tool_response>` en un turno de usuario.
- Soporte de `tool_choice: "required"` con herramientas estrictas (`"strict": true`, `additionalProperties: false`).
- Bucles agénticos multi-paso y razonamiento encadenado.
- Generación de código.
- Razonamiento matemático.
- Decodificación especulativa mediante el drafter DFlash2 incluido, con hasta 15 tokens propuestos por paso y verificación completa por el modelo principal.
- Capacidades multilingües limitadas: el modelo está etiquetado únicamente para inglés y el dominio multilingüe es el que más degradación sufre con esta cuantización.

## Casos de uso

- Asistencia conversacional multi-turno en local: el modelo mantiene historial de razonamiento y gestiona conversaciones largas gracias a que solo 16 capas mantienen KV cache creciente, lo que hace viable el contexto extendido en un Mac con memoria unificada limitada.
- Automatización de tareas de terminal: el dominio terminal retiene un 91,3% de acuerdo top-1 con KL de 0,057, por lo que es adecuado para agentes que ejecutan comandos y parsean salidas en entornos de desarrollo.
- Bucles agénticos con herramientas: con un 91,3% de acierto en la decisión de iniciar una llamada a herramienta y coincidencia total en el cierre de razonamiento, sirve para orquestar pipelines de tool calling donde el coste de un fallo es recuperable.
- Generación de código en flujos de desarrollo: el dominio de coding mantiene un 89,8% de top-1, suficiente para autocompletado, refactorización asistida y generación de tests en entornos con recursos acotados.
- Razonamiento matemático y resolución de problemas: con 91,1% de top-1 en el dominio de reasoning/math, es utilizable para asistencia educativa y verificación de cálculos paso a paso.
- Análisis de seguridad y revisión de configuraciones: el dominio de ciberseguridad retiene un 88,3% de top-1, adecuado para triaje de alertas y revisión de políticas donde se tolera cierta imprecisión.
- Prototipado e investigación en Apple Silicon: al ser un bundle MLX con drafter incluido, permite experimentar con decodificación especulativa y cuantización extrema en hardware de consumo sin GPU dedicada.

## Benchmarks y rendimiento

Calidad frente al modelo original BF16, medida con KL top-128 sobre 221.809 posiciones de asistente:

| Métrica | BF16 (suelo de medida) | JANGH2 (24,6 GB) | JANG_4D (43,7 GB) |
|---|---|---|---|
| KL medio ↓ | 0,00017 | 0,0841 | 0,00239 |
| KL p99 ↓ | 0,0016 | 0,939 | 0,0263 |
| Top-1 ↑ | 99,48% | 90,28% | 98,30% |
| Cambio en NLL de tokens retenidos | no disponible | +0,082 | +0,002 |

Desglose por dominio (KL medio · top-1):

| Dominio | Posiciones | JANGH2 | JANG_4D |
|---|---|---|---|
| Tareas de la app Osaurus | 30.026 | 0,052 · 93,3% | 0,0016 · 98,8% |
| Terminal | 32.049 | 0,057 · 91,3% | 0,0017 · 98,6% |
| Razonamiento / matemáticas | 31.341 | 0,060 · 91,1% | 0,0018 · 98,5% |
| Bucles agénticos con herramientas | 30.839 | 0,066 · 91,3% | 0,0018 · 98,6% |
| Coding | 36.021 | 0,081 · 89,8% | 0,0026 · 97,9% |
| Ciberseguridad | 31.076 | 0,122 · 88,3% | 0,0032 · 98,0% |
| Multilingüe, ciencia, creativo | 30.457 | 0,153 · 86,9% | 0,0041 · 97,7% |

Decisiones de herramienta y razonamiento:

| Punto de decisión | Puntos evaluados | Coincidencia JANGH2 | Referencia JANG_4D |
|---|---|---|---|
| Inicio de llamada a herramienta | 250 | 233 (93,2%) | 99,2% |
| Cierre de razonamiento (`</think>`) | 256 | 256 (100%) | no disponible |
| Primer token de respuesta | 364 | 96,2% | no disponible |
| Fin de turno | 336 | 98,5% | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La aceptación del drafter con este modelo de 2 bits no ha sido medida; con el modelo de precisión completa, el primer token se aceptó entre el 68% y el 83% del tiempo y se aceptaron entre 2,0 y 5,0 tokens por paso según el dominio.

## Requisitos de hardware

- VRAM o memoria unificada: 24,62 GB de shards del modelo más 8,08 GB del drafter en BF16, que el runtime cuantiza a 4-bit al cargar; se recomienda contar con al menos 32 GB de memoria unificada y margen para el KV cache de las 16 capas de atención completa.
- Hardware objetivo: Apple Silicon con MLX. El bundle está diseñado explícitamente para Macs que no pueden alojar los 43,7 GB de JANG_4D.
- GPU dedicadas: no disponible; el formato es específico de MLX y no se distribuye en GGUF.
- Opciones de despliegue: runtime Osaurus 0.25.32 o superior. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor señala que la velocidad en Mac depende de la máquina y que la aceptación del drafter con este modelo de 2 bits no se ha medido.
- Sampling recomendado: temperatura 1,0, top-p 0,95 según `generation_config.json`; EOS `<|im_end|>` y `<|endoftext|>`; sin token BOS en chat.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad relativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B-Preview-JANGH2 | 64,8B fuente, 24,62 GB de shards | hasta 1M (16 capas con KV creciente) | top-1 90,28%, KL 0,0841 frente a BF16 | apache-2.0 | MLX, runtime Osaurus |
| Ripple-65B-Preview-JANG_4D | 64,8B fuente, 43,7 GB de shards | hasta 1M | top-1 98,30%, KL 0,00239 frente a BF16 | apache-2.0 | MLX, runtime Osaurus |
| Ripple-65B-Preview (BF16) | 64,8B | hasta 1M | referencia | apache-2.0 | safetensors BF16 |
| Ripple-65B-Preview-DFlash2 | drafter, 8,08 GB BF16 | no aplica | drafter de decodificación especulativa | no disponible | safetensors |

No se dispone de información sobre otros modelos de la misma categoría (densos de 65B cuantizados para Apple Silicon) en la documentación proporcionada.

## Limitaciones y advertencias

- Degradación de calidad significativa frente al modelo original: KL medio de 0,0841 y top-1 del 90,28%, con un incremento de NLL de +0,082 en tokens retenidos. Si el usuario dispone de 44 GB de memoria, el autor recomienda explícitamente JANG_4D.
- El dominio multilingüe, científico y creativo es el más afectado (top-1 86,9%, KL 0,153), por lo que no es adecuado para generación creativa o contenido en idiomas distintos del inglés.
- El modelo solo está etiquetado para inglés; no hay evidencia de soporte multilingüe fiable.
- Riesgo de alucinación inherente al modelo base, agravado por la cuantización de 2 bits en el feed-forward, que representa el 78% de los pesos.
- Las métricas de calidad pueden ser ligeramente optimistas: la elección del método de redondeo por módulo consultó las filas de entrada del conjunto de calibración.
- La aceptación del drafter DFlash2 con este modelo de 2 bits no ha sido medida, por lo que la ganancia real de velocidad es desconocida.
- Dependencia de un runtime concreto: requiere Osaurus 0.25.32 o superior; no hay formato GGUF ni compatibilidad declarada con otros motores de inferencia.
- El contexto de 1M tokens solo es viable en la medida en que la memoria aloje el KV cache de las 16 capas de atención completa; en configuraciones de 32 GB el contexto práctico será mucho menor.
- El modo thinking no es configurable: no hay interruptor ni niveles de esfuerzo, y el razonamiento previo permanece en el historial por defecto, lo que consume contexto de forma acumulativa.
- Para `tool_choice: "required"` es necesario usar herramientas estrictas (`"strict": true`, `additionalProperties: false`); de lo contrario, el modelo puede producir llamadas mal formadas.
- Licencia apache-2.0 en el bundle, pero conviene verificar la licencia y condiciones del modelo base ricursiveAI/Ripple-65B-Preview antes de uso comercial en producción.

## Enlaces

- [OsaurusAI/Ripple-65B-Preview-JANGH2 en Hugging Face](https://huggingface.co/OsaurusAI/Ripple-65B-Preview-JANGH2)
- [Modelo base ricursiveAI/Ripple-65B-Preview](https://huggingface.co/ricursiveAI/Ripple-65B-Preview)
- [Variante JANG_4D](https://huggingface.co/OsaurusAI/Ripple-65B-Preview-JANG_4D)
- [Drafter ricursiveAI/Ripple-65B-Preview-DFlash2](https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2)
- [Sitio de Osaurus AI](https://osaurus.ai)
