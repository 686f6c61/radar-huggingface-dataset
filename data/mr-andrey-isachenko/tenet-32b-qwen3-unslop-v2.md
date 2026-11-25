# mr-andrey-isachenko/Tenet-32B-Qwen3-Unslop-v2

## Resumen

Tenet-32B-Qwen3-Unslop-v2 es un ajuste fino del modelo Qwen3-32B de Alibaba Qwen, desarrollado por Andrey Isachenko (usuario mr-andrey-isachenko) y publicado en Hugging Face. Se trata de un modelo de generacion de texto de 32.762 millones de parametros orientado a razonamiento con modo *thinking*, uso de herramientas, generacion de codigo y conversacion, con un enfasis explicito en eliminar el "slop" (verbosidad y relleno) y en preservar la integridad de las cadenas de pensamiento (``). El autor lo etiqueta como "abliterated" y "uncensored", lo que implica una reduccion deliberada de los mecanismos de rechazo del modelo base.

La relevancia del modelo reside en su pipeline de entrenamiento y cuantizacion, denominado Tenet v2, que combina cuatro etapas tecnicas: una cirugia de anclajes por fases (`H15`), un entrenamiento GRPO con ventana de longitud calibrada (`H16`), una receta de cuantizacion GGUF de precision mixta (`H14+`) y una verificacion determinista en 24 semillas (`H17`). El autor publica una bateria de "gates" de liberacion con valores medidos, de los cuales 9 de 10 se superan. La licencia es Apache 2.0 y los pesos se distribuyen en safetensors (BF16/FP8) y GGUF.

El contexto maximo no se declara en la informacion disponible, aunque al derivar de Qwen3-32B es previsible que herede su ventana nativa; no obstante, no se confirma este dato en la documentacion proporcionada. El modelo acumula 231 descargas y ningun "like" en el momento de la consulta, lo que sugiere una adopcion todavia muy temprana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3-32B (detalles internos de atencion no disponibles) |
| Parametros totales | 32.762.123.264 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, FP8 (E4M3), GGUF F16, GGUF CKA-Q4_K_M (4.952 bpw de receta, 4.896 bpw reales), GGUF i1-CKA-Q4_K_M con imatrix |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16/FP8), GGUF (F16, Q4_K_M, i1-CKA-Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-32B, un transformer decoder-only denso de 32B parametros, y le aplica el pipeline Tenet v2 en cuatro fases. La fase `H15` realiza una "Phase-Segmented Tri-Anchor Lancet Surgery": separa los tokens de deliberacion dentro de `` de los tokens de superficie posteriores a ``, y protege tres anclajes ortogonales (autocorreccion de CoT, razonamiento formal y herramientas/SQL) en las capas de mayor SCR `[30, 42, 46, 45, 48, 24]`, restaurando la norma L2 por fila. La fase `H16` entrena con GRPO usando una ventana de calibracion de longitud gaussiana asimetrica y proyeccion LoRA ortogonal, con `merged_lora_count == 0`.

La fase `H14+` define una receta de cuantizacion GGUF de precision mixta a 4.952 bpw: protege las capas `[0, 42, 46, 48, 63]` en Q8_0 y `[24, 30, 45]` en Q6_K, mientras cuantiza el resto en Q4_K_M. La fase `H17` ejecuta una verificacion determinista sobre 24 prompts de la serie `TENET_ARENA_HOUSE_SERIES` y 6 comprobaciones SQL de solo lectura en DuckDB. El autor declara un factor de cresta maximo por fila de 4.3593 (limite < 25.0) y una re-fuga FP8 del 2.5579 % (limite < 3.0 %). No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni el detalle del proceso de RLHF/DPO mas alla del GRPO mencionado.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con modo *thinking* explicito mediante etiquetas ``, con integridad de etiquetas declarada al 100 % en los formatos F16 y CKA-Q4_K_M.
- Razonamiento matematico y resolucion de problemas (MATH-500, GSM8K).
- Generacion de codigo y tareas de programacion (etiqueta `coding`).
- Uso de herramientas y function calling (etiquetas `tool-use` y `agentic`).
- Generacion de SQL de solo lectura, verificada con 6 comprobaciones DuckDB (tasa 1.0).
- Comportamiento "unslop": reduccion de relleno y verbosidad, con tasa de exito declarada del 100 %.
- Modelo "abliterated" y "uncensored": menor tendencia a rechazar peticiones.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Compatibilidad con endpoints y text-generation-inference.

## Casos de uso

- **Atencion al cliente automatizada:** el modelo puede mantener conversaciones multi-turno y, gracias a su entrenamiento orientado a eliminar relleno, producir respuestas concisas; su modo thinking permite resolver consultas que requieren varios pasos logicos antes de responder.
- **Generacion de codigo en produccion:** con soporte declarado de tool calling y agentic, puede integrarse en pipelines de CI/CD para autocompletar, revisar o generar parches, invocando herramientas externas durante el proceso.
- **Analisis de datos con SQL:** las 6 comprobaciones DuckDB de solo lectura confirman su capacidad para traducir preguntas en lenguaje natural a consultas SQL seguras, util en asistentes de BI sobre almacenes de datos.
- **Razonamiento matematico asistido:** con un 74,8 % en MATH-500 y un 92,19 % de precision en GSM8K, es adecuado para tutoria o verificacion de calculos en entornos educativos y financieros.
- **Agentes autonomos de varios pasos:** las etiquetas `agentic` y `tool-use` junto con el razonamiento explicito lo hacen apto para orquestar tareas con planificacion intermedia, registro de decisiones y llamadas a APIs.
- **Generacion de contenido sin relleno:** para redaccion tecnica o documentacion donde la verbosidad es un coste, el modo unslop reduce texto superfluo y acelera la revision editorial.
- **Despliegue en hardware de gama media:** la variante CKA-Q4_K_M de 18,68 GiB permite ejecutar un modelo de 32B en una sola GPU de 24 GB, habilitando prototipado local sin infraestructura de centro de datos.

## Benchmarks y rendimiento

Resultados declarados por el autor (Tenet OpenEvals sobre vLLM; no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| IFEval | Prompt-level Strict Accuracy | 0.844732 |
| IFEval | Instruction-level Strict Accuracy | 0.888489 |
| MATH-500 | Accuracy | 0.748 |
| GSM8K | Strict Match (CoT) | 0.809704 |
| GSM8K | Accuracy (math) | 0.921911 |
| GSM8K | Flexible Extract (CoT) | 0.921911 |
| GPQA Diamond | Accuracy / Zero-shot | 0.40404 |
| MMLU-Pro | Accuracy | 0.654762 |

Gates de liberacion declarados (9 de 10 superados):

| Gate | Valor medido | Objetivo | Estado |
|---|---|---|---|
| max_row_crest_factor | 4.3593 | < 25.0 | PASS |
| fp8_releakage_pct | 2.5579 | < 3.0 | PASS |
| cot_tag_integrity_rate[f16] | 1.0000 | >= 0.995 | PASS |
| cot_tag_integrity_rate[i1_cka_q4_k_m] | 1.0000 | >= 0.995 | PASS |
| house_artifact_classification_rate[i1_cka_q4_k_m] | 0.9583 | == 1.0 | FAIL |
| arena_house_hp[i1_cka_q4_k_m] | 97.9167 | >= 95.0 | PASS |
| length_collapse_rate[i1_cka_q4_k_m] | 0.0000 | < 0.01 | PASS |
| slop_and_refusal_rate[i1_cka_q4_k_m] | 0.0000 | <= 0.02 | PASS |
| sql_readonly_rate[i1_cka_q4_k_m] | 1.0000 | == 1.0 | PASS |
| unslop_pass_rate[i1_cka_q4_k_m] | 1.0000 | >= cka_q4_k_m y >= f16 | PASS |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en estos mismos benchmarks.

## Requisitos de hardware

- **VRAM estimada en BF16:** aproximadamente 65,5 GB solo para pesos (32.762 M parametros x 2 bytes), mas overhead de activaciones y KV cache.
- **VRAM estimada en FP8 (E4M3):** aproximadamente 32,8 GB para pesos; requiere GPU con soporte FP8 (H100, H200, L40S, RTX 4090 con limitaciones).
- **VRAM estimada en GGUF CKA-Q4_K_M:** 18,68 GiB de pesos, por lo que cabe en una GPU de 24 GB (RTX 3090, RTX 4090, A10G, L4) dejando margen para contexto y cache.
- **GPU recomendadas:** A100 80 GB o H100 80 GB para BF16/FP8 con contexto largo; RTX 4090 o A6000 para cuantizacion 4-bit; configuraciones multi-GPU para BF16 en produccion.
- **Opciones de despliegue:** vLLM (usado por el autor para las evaluaciones), llama.cpp para GGUF, Ollama, text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles y OpenRouter.
- **Latencia y throughput:** no disponibles en la informacion proporcionada; el autor solo reporta KLD de cuantizacion (0.01733 para i1-CKA-Q4_K_M frente a 0.02407 para CKA-Q4_K_M).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Tenet-32B-Qwen3-Unslop-v2 | 32,76 B | No disponible | Apache 2.0 | Ajuste de Qwen3-32B con pipeline Tenet v2; benchmarks propios declarados |
| Qwen/Qwen3-32B (base) | 32,76 B | No disponible en esta ficha | Apache 2.0 | Modelo original de Alibaba Qwen; referencia directa del ajuste |
| Qwen3-30B-A3B (MoE) | 30 B totales, ~3 B activos | No disponible en esta ficha | Apache 2.0 | Alternativa MoE de la misma familia con menor coste de inferencia por token |

La comparacion con otros ajustes comunitarios de Qwen3-32B no esta disponible en la informacion proporcionada. No se dispone de datos de rendimiento del modelo base en los mismos benchmarks para establecer una comparacion cuantitativa directa.

## Limitaciones y advertencias

- **Modelo "abliterated" y "uncensored":** la reduccion deliberada de mecanismos de rechazo implica un mayor riesgo de generar contenido inapropiado, ofensivo o peligroso; requiere moderacion externa en produccion.
- **Sesgos:** no se documentan evaluaciones de sesgo en la informacion disponible; al derivar de Qwen3-32B, hereda los sesgos del corpus de entrenamiento original.
- **Alucinacion:** no se reportan metricas de factualidad ni de tasa de alucinacion; el modo thinking no garantiza veracidad.
- **Benchmarks no verificados:** todos los resultados son declarados por el autor (`verified: false`) y proceden de su propia bateria Tenet OpenEvals, no de evaluaciones independientes.
- **Gate fallido:** la clasificacion de artefactos en la variante i1-CKA-Q4_K_M con imatrix cae al 95,83 % (23 de 24 semillas), fallando en `house-edge-leap-years`; el autor recomienda usar CKA-Q4_K_M puro o BF16/FP8.
- **Idiomas no declarados:** no se especifica la cobertura linguistica, por lo que el rendimiento fuera del ingles es incierto.
- **Contexto no declarado:** la longitud de contexto no aparece en la documentacion; no debe asumirse la de Qwen3-32B sin verificacion.
- **Adopcion temprana:** 231 descargas y 0 likes; no hay evidencia de uso en produccion a escala.
- **Licencia Apache 2.0:** permite uso comercial, pero el usuario asume la responsabilidad sobre el contenido generado por un modelo sin censura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-32B-Qwen3-Unslop-v2
- Repositorio del pipeline Tenet: https://github.com/mrAndreyIsachenko/tenet-lab
- Modelo base Qwen3-32B: https://huggingface.co/Qwen/Qwen3-32B
- Dataset IFEval: https://huggingface.co/datasets/google/IFEval
- Dataset MATH-500: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset GPQA: https://huggingface.co/datasets/Idavidrein/gpqa
- Dataset MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
