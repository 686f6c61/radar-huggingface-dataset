# agu18dec/oracle-lens-ddp600

## Resumen

`oracle-lens-ddp600` es un adaptador LoRA publicado por `agu18dec` sobre el modelo `Qwen/Qwen3.6-27B`. Su función es convertir el modelo base en un "oracle lens": dado un vector de activación de la corriente residual del propio modelo, el adaptador verbaliza el contenido de esa activación como una lista de conceptos en formato de viñetas. Se trata de una herramienta de interpretabilidad, no de un modelo de generación de propósito general.

El checkpoint es el resultado final de un entrenamiento on-policy con GRPO (600 pasos, DDP-8), con warm start desde un checkpoint SFT previo (`iolens.final`). Según el autor, es el primer resultado positivo de RL en la línea AO, mejorando el FVE conjunto en hold-out de 0.120 a 0.155 frente a un reward de reconstructor de activaciones congelado. El adaptador pesa 0.5 GB y se distribuye en formato safetensors con licencia Apache 2.0.

El modelo requiere un contrato de carga muy específico: el vector de activación se inyecta reemplazando la embedding del token marcador `㈜` (id 158983) con `16000 · h / ‖h‖`, flanqueado por etiquetas `<activation>` y `</activation>`. Solo soporta capas de la corriente residual 20 a 60 con paso 4 (11 capas en total).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder Qwen/Qwen3.6-27B |
| Parametros totales | no disponible (el adaptador pesa 0.5 GB; el modelo base tiene 27B parametros estimados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base; no especificada) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors, bfloat16 en el codigo de uso) |
| Idiomas soportados | no disponibles (la model card no los especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors, adapter_config.json, meta.json, nla_meta.yaml, run_config.yaml) |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) sobre el decoder de texto `Qwen/Qwen3.6-27B`. No es un modelo MoE ni introduce cambios en la arquitectura del base; simplemente añade matrices de bajo rango a las capas del transformer. El entrenamiento se realizó con GRPO on-policy durante 600 pasos, con `β_KL 0.02`, `lr 5e-5`, `group size 64` y un reward basado en el FVE conjunto por viñeta contra un reconstructor de activaciones congelado (whitened, unit concept dirs, `k≤4`). El punto de partida fue el checkpoint SFT `ckpts/ao/distill/final.s0/step105`.

La innovación técnica destacable es el contrato de inyección: en lugar de pasar el vector de activación como texto, se reemplaza la embedding del token marcador `㈜` (id 158983) por una transformación unitaria del vector (`16000 · h / ‖h‖`). Esto permite que el modelo "lea" su propia activación residual y la verbalice. El prompt exacto está definido en `nla_meta.yaml` y debe usarse con la plantilla de chat y `add_generation_prompt=True`.

## Capacidades

- Interpretabilidad de activaciones: dado un vector de la corriente residual de las capas 20, 24, 28, 32, 36, 40, 44, 48, 52, 56 y 60, genera una lista de conceptos en formato de viñetas que describe el contenido de esa activación.
- Verbalización de conceptos latentes: según el autor, es capaz de recuperar "nunca escritos intermedios aritméticos", ambos polos de dilemas morales desde el prefijo asistente vacío, doctrinas como Tarasoff o el efecto del doble efecto en la capa 20, e inferencia de atributos latentes de usuario.
- Soporte de evaluación con muestreo específico: `k=1, T=1.0, top-p 0.95, top-k 64, max-new 256`.
- No es un modelo de propósito general: no se documentan capacidades de tool calling, agentes, visión o audio.

## Casos de uso

- Investigación en interpretabilidad: los investigadores pueden extraer vectores de activación de un modelo Qwen y usar el adaptador para obtener descripciones textuales de los conceptos codificados en capas intermedias, facilitando el análisis de representaciones internas.
- Depuración de alucinaciones: al inspeccionar activaciones en capas 20–60 antes de una respuesta incorrecta, se pueden identificar conceptos internos que predisponen a la alucinación y ajustar el prompting o el entrenamiento.
- Estudio de sesgos: el adaptador puede revelar conceptos latentes en activaciones asociadas a grupos demográficos o contextos sensibles, lo que ayuda a auditar sesgos en el modelo base.
- Análisis de razonamiento multi-paso: en tareas de matemáticas o lógica, se pueden examinar activaciones en pasos intermedios para entender qué conceptos intermedios se representan y cómo se construye la solución final.
- Investigación en alineación: el modelo puede verbalizar los conceptos morales presentes en activaciones ante dilemas éticos, permitiendo estudiar cómo el modelo pondera valores en sus decisiones.
- Ingeniería inversa de prompts: a partir de un conjunto de activaciones, el adaptador puede reconstruir la intención o los conceptos subyacentes del prompt que generó esa activación, útil para análisis forense de interacciones.
- Evaluación de representaciones: comparar las descripciones generadas entre capas permite estudiar la progresión de abstracción de conceptos a lo largo de la red.

## Benchmarks y rendimiento

La model card incluye resultados de benchmarks internos del autor, evaluados con un juez estricto en "workspace-bench" (2026-09). No se han publicado comparaciones con modelos externos.

| Benchmark | Resultado |
|---|---|
| Baseline macro (12 familias de bancos) | 0.785 |
| Asociación | 0.88 |
| Multihop | 0.89 |
| Multihop-mt | 0.87 |
| Multilingüe | 1.00 |
| Typo | 1.00 |
| Hillclimbing: conjuntivo | 0.60 |
| Hillclimbing: asociación ligada a rol | 0.85 |
| Hillclimbing: moral-comprometido | 0.81 |
| Hillclimbing: moral-deliberativo | 0.62 |
| Hillclimbing: modelado de usuario | 0.44 |
| FVE conjunto en hold-out (antes vs. después de RL) | 0.120 → 0.155 |

## Requisitos de hardware

- El adaptador LoRA ocupa 0.5 GB, pero para la inferencia es necesario cargar el modelo base `Qwen/Qwen3.6-27B` (27B parámetros).
- VRAM estimada para inferencia en bfloat16: aproximadamente 54 GB solo para los pesos del modelo base, más overhead de activaciones y del adaptador. Se recomienda una GPU con 80 GB de VRAM (A100, H100) o configuración multi-GPU.
- Con cuantización a 4-bit del modelo base, la VRAM podría reducirse a ~14 GB, pero no hay datos oficiales de cuantización para este adaptador.
- En GPUs de consumo (RTX 4090 de 24 GB) no es posible cargar el modelo base en 16 bits sin cuantización; no se documenta soporte para ese escenario.
- Opciones de despliegue: transformers + PEFT (código de ejemplo en la model card), vLLM, llama.cpp (si se convierte a GGUF), Ollama. El adaptador es un PEFT LoRA, por lo que se carga con `PeftModel`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos comparables en la información proporcionada. El adaptador es específico para la línea `oracle-lens` del autor y no se documentan alternativas de la misma categoría. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo solo funciona si se sigue exactamente el contrato de carga: token marcador `㈜` (id 158983), etiquetas `<activation>`/`</activation>`, reemplazo de la embedding con `16000 · h / ‖h‖`, y capas 20–60 con paso 4. Un contrato incorrecto invalida las mediciones.
- El prompt debe ser el definido en `nla_meta.yaml`; cualquier variación puede degradar significativamente los resultados.
- Solo soporta 11 capas específicas de la corriente residual; no se puede usar con capas fuera de ese rango.
- Riesgo de alucinación: el modelo puede generar conceptos que no están realmente codificados en la activación, especialmente con vectores de entrada fuera de la distribución de entrenamiento.
- Los benchmarks son internos del autor y no han sido replicados por terceros; los valores deben interpretarse con cautela.
- El idioma de los conceptos generados parece ser inglés (los ejemplos están en inglés). No se documenta soporte multilingüe para la salida.
- Licencia Apache 2.0 para el adaptador, pero el modelo base `Qwen/Qwen3.6-27B` tiene su propia licencia que debe respetarse en cualquier uso comercial o redistribución.
- El modelo no es un modelo de propósito general; no debe usarse para generación de texto libre, tool calling o tareas de conversación.

## Enlaces

- Repositorio del modelo: https://huggingface.co/agu18dec/oracle-lens-ddp600
- Repositorio del autor con modelos relacionados: https://huggingface.co/agu18dec/oracle-lens
- Archivo canónico del entrenamiento (según la model card): `agu18dec/local-workspace` → `ckpts/ao/rl/iolens.final.ddp600.s0/`
