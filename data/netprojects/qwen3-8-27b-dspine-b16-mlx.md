# netprojects/Qwen3.8-27B-DSpine-b16-MLX

## Resumen

Qwen3.8-27B-DSpine-b16-MLX es la conversión al formato MLX del drafter DSpine de Tencent Hunyuan para el modelo Qwen3.8-27B. No se trata de un modelo generativo autónomo, sino de un modelo auxiliar de decodificación especulativa: un transformer pequeño de 5 capas y 2.025.912.064 parámetros (aproximadamente 2.000 millones) que propone bloques de hasta 16 tokens candidatos, los cuales son verificados en una sola pasada por el modelo objetivo Qwen3.8-27B. El resultado es la misma salida codiciosa del modelo grande, pero con una velocidad de decodificación notablemente superior.

La relevancia de esta publicación radica en que resuelve una limitación concreta del ecosistema MLX: Qwen3.8-27B es un modelo híbrido con 48 capas de atención lineal GatedDeltaNet y 16 capas de atención completa, mientras que el paquete MLX oficial de Tencent solo soporta objetivos de atención pura. El runtime `dspine-hybrid-mlx` añade rollback exacto del estado de atención lineal y de la ventana deslizante de 8192 tokens del drafter, permitiendo usar este modelo con cualquier build MLX de Qwen3.8-27B.

Los pesos son el checkpoint bf16 original de Tencent (revisión `ea909c0`), sin modificaciones, en el layout safetensors que MLX carga directamente. La licencia es Apache-2.0. El repositorio tiene 4,1 GB y, en el momento de la consulta, no registra descargas ni likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de 5 capas (drafter de decodificación especulativa DSpine) |
| Parametros totales | 2.025.912.064 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana deslizante de 8192 tokens en el drafter |
| Tipos de cuantizacion | pesos publicados en bf16; el modelo objetivo admite 4-bit y 8-bit (group 64) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, 4,05 GB) |

## Arquitectura y entrenamiento

El drafter DSpine es un modelo pequeño de 5 capas que lee las activaciones de las capas 1, 16, 31, 46 y 61 del modelo objetivo Qwen3.8-27B, según indica el `config.json`. Está configurado con un bloque de propuesta de 16 tokens y una ventana deslizante de 8192 tokens. Su función es paralela: propone un bloque completo de tokens y el modelo objetivo verifica el bloque entero en una sola pasada, aceptando el prefijo correcto y descartando el resto. Esto contrasta con la decodificación especulativa autoregresiva clásica, que propone token a token.

La innovación técnica del runtime que acompaña a este modelo es el soporte de objetivos híbridos. Qwen3.8-27B combina 48 capas de GatedDeltaNet (atención lineal con estado recurrente) y 16 capas de atención completa. La verificación especulativa requiere poder revertir el estado del modelo cuando se rechazan tokens; en atención lineal ese estado es recurrente y no trivial de deshacer. `dspine-hybrid-mlx` implementa rollback exacto del estado de atención lineal y de la ventana deslizante del drafter. No se dispone de información sobre el dataset de entrenamiento del drafter, el número de tokens utilizados ni si hubo RLHF o DPO.

## Capacidades

- Decodificación especulativa: propone bloques de hasta 16 tokens que el modelo objetivo verifica en una pasada.
- Aceleración de inferencia en Apple Silicon sobre Qwen3.8-27B en builds de 4-bit, 8-bit y bf16.
- Compatibilidad con objetivos híbridos (atención lineal GatedDeltaNet más atención completa) mediante rollback exacto del estado.
- Preservación de la salida del modelo objetivo: el resultado es la salida codiciosa del target, salvo redondeos bf16 en empates casi exactos.
- Ajuste del tamaño de bloque de verificación mediante `--block-size` en `dspine-hybrid-generate`.
- No es un modelo de chat ni de generación autónoma: no se usa solo, siempre como acompañante del target.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo propias del drafter.

## Casos de uso

- Aceleración de inferencia local en Mac: usar el drafter junto a `mlx-community/Qwen3.8-27B-4bit` para pasar de 31,9 a 59,5 tok/s en un MacBook Pro M5 Max de 128 GB, manteniendo la calidad del modelo grande.
- Despliegue de 8-bit con throughput alto: con el build de 8 bits (group 64) se obtiene una aceleración de ×2,77 (de 17,9 a 49,7 tok/s), útil cuando se prioriza calidad sobre huella de memoria.
- Ejecución en bf16 para máxima fidelidad: la aceleración de ×4,34 (de 9,1 a 39,6 tok/s) hace viable el uso del modelo sin cuantizar en equipos con 60 GB de memoria disponible.
- Generación de código asistida en local: el drafter se evaluó sobre HumanEval y MBPP, por lo que es adecuado para flujos de autocompletado y generación de funciones en entornos de desarrollo sobre Apple Silicon.
- Razonamiento matemático interactivo: con thinking activado y contexto de 8192 tokens en el drafter, sirve para sesiones de resolución de problemas GSM8K y MATH-500 con latencia reducida.
- Investigación en decodificación especulativa: permite experimentar con tamaños de bloque (3, 4, 5, 6, 8, 12, 16) y medir el compromiso entre tokens aceptados por ronda y coste por ronda en hardware Apple.
- Servicio de texto en estaciones de trabajo Mac: integrable en pipelines de generación de texto donde el coste energético y la latencia importan más que el throughput bruto de un clúster GPU.

## Benchmarks y rendimiento

Velocidad de decodificación en MacBook Pro M5 Max (128 GB), greedy, thinking activado, 512 tokens nuevos, 10 prompts (2 de GSM8K, MATH-500, HumanEval, MBPP y MT-Bench), drafter en bf16:

| Build del objetivo | mlx-lm sin DSpine | Con DSpine | Aceleración | Bloque de verificación | Memoria pico |
|---|---|---|---|---|---|
| 4-bit | 31,9 tok/s | 59,5 tok/s | ×1,87 | 5 | 26 GB |
| 8-bit (group 64) | 17,9 tok/s | 49,7 tok/s | ×2,77 | 5 | 39 GB |
| bf16 | 9,1 tok/s | 39,6 tok/s | ×4,34 | 16 | 60 GB |

Barrido de tamaño de bloque sobre el objetivo de 4 bits:

| Bloque de verificación | 3 | 4 | 5 | 6 | 8 | 12 | 16 |
|---|---|---|---|---|---|---|---|
| DSpine tok/s | 55,2 | 59,5 | 59,5 | 50,3 | 46,1 | 35,0 | 41,9 |
| Tokens por ronda | 2,50 | 2,99 | 3,35 | 3,55 | 3,81 | 4,07 | 4,18 |

Aceptación con el bloque completo de 16 tokens y calidad, greedy, thinking desactivado, primeras 50 preguntas de test de GSM8K:

| Build del objetivo | Tokens por ronda | Precisión GSM8K |
|---|---|---|
| 4-bit | 7,25 | 90% |
| 8-bit | 7,32 | 84% |
| bf16 | no disponible | 86% |
| Model card de Tencent (GSM8K, T=0) | 7,20 | no disponible |

## Requisitos de hardware

- Hardware de referencia: Apple Silicon; las mediciones se hicieron en un MacBook Pro M5 Max con 128 GB de memoria unificada.
- Memoria pico con objetivo de 4 bits: 26 GB.
- Memoria pico con objetivo de 8 bits: 39 GB.
- Memoria pico con objetivo en bf16: 60 GB.
- El drafter en sí ocupa 4,05 GB en bf16; la memoria dominante la determina el modelo objetivo.
- No cabe en GPUs consumer tipo RTX 4090 en su configuración completa por el tamaño del target de 27B; el drafter está pensado para MLX, no para CUDA.
- Despliegue mediante `dspine-hybrid-mlx` (instalación vía pip desde el repositorio de GitHub) y `mlx-lm` como base.
- Throughput observado: de 39,6 a 59,5 tok/s según cuantización; latencia por ronda de verificación en 4 bits de 31 ms para 1 token, 42 ms para 5 y 88 ms para 16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-DSpine-b16-MLX (este) | 2.025.912.064 | ventana deslizante 8192 | Drafter especulativo para MLX | Apache-2.0 | Hugging Face, runtime en GitHub |
| tencent/Qwen3.8-27B-DSpine-b16 | no disponible | no disponible | Drafter original de Tencent | Apache-2.0 | Hugging Face |
| Qwen3.8-27B (target) | 27B (nominal) | no disponible | Modelo generativo híbrido | no disponible | Hugging Face |
| Decodificación especulativa estándar de mlx-lm | no disponible | no disponible | Propuesta token a token | no disponible | Integrada en mlx-lm |

No se dispone de datos de benchmarks comparativos con otros drafters de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere siempre un build MLX de Qwen3.8-27B como objetivo; no genera texto por sí solo.
- Dependencia de un runtime externo (`dspine-hybrid-mlx`) para el soporte de objetivos híbridos; el paquete MLX oficial de Tencent solo cubre atención pura.
- El rendimiento medido corresponde a un único equipo (M5 Max, 128 GB); los valores en otros chips Apple pueden diferir.
- El bloque óptimo depende de la cuantización y del hardware: 5 en 4-bit y 8-bit, 16 en bf16; usar el valor por defecto sin ajustar puede reducir la aceleración.
- La calidad depende del modelo objetivo; el drafter no mejora la precisión, solo la velocidad. Las diferencias de precisión GSM8K entre builds (90%, 84%, 86%) reflejan la cuantización del target, no el drafter.
- Posibles discrepancias mínimas frente a la salida del target por redondeo bf16 en empates casi exactos.
- Sin datos publicados sobre sesgos, alucinación o cobertura idiomática del drafter.
- Licencia Apache-2.0 permite uso comercial, pero el proyecto no está afiliado a Tencent, Alibaba/Qwen ni Apple; conviene revisar el NOTICE y las licencias del modelo base.
- Repositorio sin descargas ni likes en el momento de la consulta: madurez y soporte comunitario no verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-DSpine-b16-MLX
- Modelo base (drafter original de Tencent): https://huggingface.co/tencent/Qwen3.8-27B-DSpine-b16
- Runtime MLX: https://github.com/internet-projects/dspine-hybrid-mlx
- Repositorio DSpine de Tencent: https://github.com/Tencent/DSpine
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Organización Qwen en Hugging Face: https://huggingface.co/Qwen
- Build MLX de 4 bits del objetivo: https://huggingface.co/mlx-community/Qwen3.8-27B-4bit
- NetProjects: https://netprojects.com
