# Launch80/Qwopus3.8-27B-Coder-Flash-Int4-baked

## Resumen

Qwopus3.8-27B-Coder-Flash-Int4-baked es una cuantización GPTQ INT4 del modelo Jackrong/Qwopus3.8-27B-Coder-Flash, un fine-tune de Qwen3.8-27B orientado a generación de código y uso de herramientas. Lo publica Launch80, que documenta públicamente el proceso de cuantización, la metodología de calibración y las métricas de degradación respecto al original en BF16. El modelo conserva la torre de visión y la pipeline image-text-to-text del original, de modo que mantiene capacidades multimodales de entrada.

La relevancia de esta revisión es que va más allá de un cuantizado convencional: el `lm_head` y la cabeza draft MTP (multi-token prediction) también se han cuantizado a INT4 sobre disco, con calibración Hessiana, de forma que el checkpoint completo cabe en una única GPU Intel Arc Pro B65 de 32 GB y se sirve con vLLM estándar a la ventana completa de 262.144 tokens sin parches de pesos. El autor declara explícitamente que es un trabajo en curso y publica tanto los aciertos como un fallo de validación (T4 y T7).

El modelo resuelve el problema de desplegar un modelo de ~27,8 mil millones de parámetros con contexto de 256K en hardware de gama profesional de 32 GB, manteniendo tool calling y decodificación especulativa. Está pensado para entornos de desarrollo asistido por IA, agentes de código y pipelines que necesitan contexto largo con latencia controlada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas GDN (gated delta network) y cabeza MTP para decodificación especulativa; torre de visión integrada (hereda de Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 (~27,8 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | GPTQ INT4 simétrico, group size 128, `desc_act` off, `act_group_aware` on; cuerpo, `lm_head` y MTP cuantizados; embeddings, norms, torre de visión y `in_proj_a`/`in_proj_b` de GDN en BF16 |
| Idiomas soportados | no disponible (la model card no lista idiomas; hereda los del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ INT4), 17,0 GB en disco |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del fine-tune Qwopus3.8-27B-Coder-Flash, que a su vez parte de Qwen3.8-27B. La arquitectura combina capas transformer con mecanismos GDN (gated delta network), una torre de visión para entrada image-text-to-text y una cabeza MTP que actúa como drafter para decodificación especulativa. El cuerpo del modelo consta de 400 capas lineales cuantizadas a GPTQ INT4 simétrico con grupo 128 mediante GPTQModel 7.3.2, ejecutado sobre la propia Intel Arc Pro B65.

La calibración del cuerpo usó 512 muestras de 2.048 tokens: 153 de C4, 204 de código, 53 de chat y 102 de conversaciones de tool calling extraídas de NousResearch/hermes-function-calling-v1 (`@dae3e1d`), renderizadas con la plantilla de chat del propio modelo e incluyendo la mitad de llamadas paralelas. El `lm_head` (248.320 × 5.120) y las nueve lineales del MTP se cuantizaron por separado con captura de Hessianos mediante hooks en vLLM sobre wikitext, chat y código, seleccionando el damping y la mezcla de slices con menor error en filas reservadas. Todas las lineales horneadas superan a round-to-nearest: `lm_head` 4,68 % frente a 8,18 %; `mtp.fc` 6,98 % frente a 11,47 %; `mtp.down_proj` 7,57 % frente a 11,96 %. El sha256 de calibración está en `quant-meta.json`.

El autor documenta que la inclusión de datos de tool calling en la calibración fue un arreglo post-hoc: el primer horneado, sin esas muestras, perdía 7,75 puntos en BFCL porque el modelo terminaba el turno tras la primera llamada paralela. Esta revisión es el rehorneado con calibración corregida.

## Capacidades

- Generación de texto y razonamiento general, con modo de razonamiento configurable vía `--reasoning-parser qwen3`.
- Generación y edición de código, incluyendo tareas de HumanEval+, MBPP+ y LiveCodeBench v6 según la evaluación del autor.
- Tool calling y function calling, con soporte de llamadas paralelas (parser `qwen3_xml` en vLLM).
- Entrada multimodal image-text-to-text gracias a la torre de visión heredada, conservada en BF16.
- Decodificación especulativa mediante cabeza MTP con k=6 tokens draft.
- Contexto largo de hasta 262.144 tokens, útil para repositorios completos o documentos extensos.
- Capacidades multilingües: no disponible (no se detallan en la model card).
- Matemáticas: evaluado en GSM8K según la lista de tareas del autor, sin resultados publicados en esta revisión.

## Casos de uso

- Asistente de código en IDE con contexto de repositorio completo: la ventana de 262.144 tokens permite cargar varios ficheros y el historial de conversación sin truncar, y la cuantización INT4 mantiene el modelo en 17 GB, apto para una estación de trabajo con GPU de 32 GB.
- Agentes de refactorización multi-step: el soporte de tool calling con llamadas paralelas y el parser `qwen3_xml` permiten encadenar lecturas de ficheros, ejecución de tests y aplicación de parches en un bucle agéntico.
- Automatización de revisión de código en CI/CD: el modelo puede analizar diffs y generar comentarios estructurados vía function calling, integrándose en pipelines con vLLM como servidor compatible con la API de OpenAI.
- Generación de tests y documentación a partir de código fuente: con contexto largo puede procesar módulos enteros y producir docstrings o suites de pruebas coherentes con las firmas existentes.
- Despliegue en hardware Intel Arc: es uno de los pocos checkpoints de este tamaño calibrado y validado específicamente en XPU con vLLM, lo que lo hace adecuado para entornos con Arc Pro B65 en lugar de GPU NVIDIA.
- Servicio conversacional con entrada de imágenes: la pipeline image-text-to-text permite casos como explicar diagramas de arquitectura o capturas de errores junto con código.
- Evaluación de latencia en producción: con 75,8 tok/s de decodificación ponderada y 216 ms de TTFT p50 en la B65, es viable para asistentes interactivos con un solo stream; a 8 concurrentes alcanza 210,9 tok/s agregados.

## Benchmarks y rendimiento

Calidad frente a BF16, con umbrales pre-registrados y hasheados antes de evaluar. La referencia BF16 se ejecutó en RTX PRO 6000 con vLLM 0.30 CUDA; este checkpoint en Arc Pro B65 con vLLM 0.30 XPU.

| # | Medida | Umbral | Este checkpoint | Resultado |
|---|---|---|---|---|
| T1 | Perplejidad wikitext-2 | ≤ +3 % | +1,71 % | pasa |
| T2 | Perplejidad corpus de código | ≤ +3 % | +1,83 % | pasa |
| T3 | KL media de siguiente token (1,05 M tokens, top-64) | ≤ 0,05 | 0,0412 | pasa |
| T4 | Acuerdo top-1 de siguiente token | ≥ 93 % | 92,84 % | falla (por 0,16 pt) |
| T5 | BFCL tool calling (400 ítems), emparejado | Δ ≥ −2 pts o IC incluye 0 | 88,25 % vs 89,0 %, Δ −0,75 [−3,0, +1,5] | pasa |
| T5 | Otras seis tareas | igual | pendiente de reejecución | pendiente |
| T6 | KLD frente al GGUF Q4_K_M de Jackrong | el nuestro ≤ el suyo | no medido | pendiente |
| T7 | Greedy, decodificación especulativa on = off | idéntico | 26/32 en el primer horneado; las 6 diferencias son empates exactos o por redondeo FP16 | falla tal como está escrito |

En el primer horneado, las otras seis tareas (HumanEval+, MBPP+, LiveCodeBench v6, GSM8K, MMLU-Pro, IFEval) quedaron dentro del umbral pre-registrado, pero están pendientes de reejecución sobre este checkpoint exacto.

Rendimiento en Arc Pro B65 32 GB, vLLM 0.30.0 XPU, KV en fp8, un solo stream, MTP k=6, contexto 262k (BetterBench, 1 warmup + 5 pasadas):

| Métrica | Valor |
|---|---|
| Decodificación ponderada | 75,8 tok/s |
| TTFT p50 | 216 ms |
| Prefill a 2K | 1.283 tok/s |
| Prefill a 64K | 856 tok/s |
| Agregado a 8 concurrentes | 210,9 tok/s |

El cuello de botella es la cabeza draft, no el cuerpo INT4: el fine-tune de Jackrong dejó la MTP byte-idéntica a la de Qwen3.8-27B base, por lo que draftea al estilo del modelo base y acepta unos 3 tokens por paso. El autor apunta a 115 tok/s en la B65 con un drafter adaptado.

## Requisitos de hardware

- VRAM/VRAM equivalente: 17,0 GB de pesos en disco; con KV cache fp8 y contexto 262.144 se sirve en una GPU de 32 GB (validado en Intel Arc Pro B65 32 GB).
- GPU recomendadas: Intel Arc Pro B65 32 GB (plataforma validada por el autor); cualquier GPU con al menos 24-32 GB para contexto largo.
- GPU de consumo: cabe en RTX 4090 (24 GB) si se reduce `--max-model-len` o se limita el KV cache; con 262k completos no cabe en 24 GB.
- Opciones de despliegue: vLLM 0.30.0 con backend XPU o CUDA; el autor usa la imagen XPU con tres parches de corrección para decodificación especulativa (MTP nightly, MTP boundary, GDN mixed). No se menciona soporte en llama.cpp, Ollama ni TGI.
- Latencias y throughput: 75,8 tok/s de decodificación ponderada, 216 ms TTFT p50, 1.283 tok/s de prefill a 2K y 856 tok/s a 64K, 210,9 tok/s agregados a 8 concurrentes.
- Comando de servicio de referencia:

```bash
vllm serve Launch80/Qwopus3.8-27B-Coder-Flash-Int4-baked \
  --quantization gptq --dtype float16 --kv-cache-dtype fp8 --max-model-len 262144 \
  --speculative-config '{"method":"mtp","num_speculative_tokens":6}' \
  --enable-auto-tool-choice --tool-call-parser qwen3_xml --reasoning-parser qwen3
```

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash-Int4-baked (este) | ~27,8 B | 262.144 | GPTQ INT4 g128, head y MTP horneados | Apache 2.0 | HuggingFace, servible en vLLM XPU/CUDA |
| Jackrong/Qwopus3.8-27B-Coder-Flash (base BF16) | ~27,8 B | 262.144 | BF16 | Apache 2.0 | HuggingFace; requiere ~55 GB en BF16 |
| GGUF Q4_K_M de Jackrong | ~27,8 B | 262.144 (según runtime) | GGUF Q4_K_M | Apache 2.0 | HuggingFace; comparación KLD pendiente (T6) |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación de rendimiento se limita a las métricas de degradación frente a BF16 ya tabuladas.

## Limitaciones y advertencias

- Trabajo en curso: el autor declara explícitamente que la revisión no está completa; seis de las siete tareas de calidad están pendientes de reejecución sobre este checkpoint exacto.
- El umbral T4 (acuerdo top-1 ≥ 93 %) no se cumple: 92,84 %, un fallo de 0,16 puntos.
- El umbral T7 falla tal como está redactado: la decodificación especulativa no es bit-idéntica a la greedy sin especulación en 6 de 32 casos, aunque el autor los atribuye a empates exactos o redondeo FP16.
- La calibración con datos de tool calling fue un arreglo post-hoc tras perder 7,75 puntos en BFCL en el primer horneado; conviene validar tool calling en el dominio propio antes de producción.
- La cabeza MTP no está adaptada al fine-tune, lo que limita la velocidad de decodificación a unos 3 tokens aceptados por paso.
- Requiere tres parches de vLLM-XPU para decodificación especulativa; no es un despliegue estándar sin ajustes en Intel Arc.
- Sesgos conocidos: no disponibles (la model card no los documenta).
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de modelos de código y razonamiento.
- Idiomas soportados: no disponibles; no se garantiza cobertura multilingüe más allá de la del modelo base.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.8-27B conviene verificar las condiciones de la cadena de modelos base.
- No se han publicado resultados de benchmarks de MMLU, HumanEval o GSM8K con cifras concretas para este checkpoint; solo se indica que están pendientes de reejecución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Launch80/Qwopus3.8-27B-Coder-Flash-Int4-baked
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Estudio completo de la cuantización: https://launch80.com/blog/qwopus-coder-int4-bake-study
- Informe de calidad pre-registrado: https://launch80.com/a/123a9c0b-5fba-40e4-b5ad-8033ed77e408
- Resultados de velocidad BetterBench: https://launch80.com/a/30aa8ae2-f00c-409a-a4a9-2e298fc81f67
- Discord de Launch80: https://discord.gg/launch80
- Dataset de calibración de tool calling: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
