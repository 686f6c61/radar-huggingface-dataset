# alexkstern/declref_01_1pct_100M_computematched_adamwppt_1e18_s2_2026-09-14_13-58-37_623281-pt

## Resumen

`alexkstern/declref_01_1pct_100M_computematched_adamwppt_1e18_s2_...-pt` es un checkpoint de investigación entrenado con [nanochat](https://github.com/karpathy/nanochat), el framework minimalista de Karpathy para reproducir un pipeline tipo ChatGPT a bajo coste. Se trata de un transformer decoder-only de 20 capas con dimensión de modelo 1280 y 10 cabezas de atención, con una longitud de contexto de 2048 tokens. No es un modelo Instruct ni un modelo alineado: es un artefacto de preentrenamiento pensado para experimentación sobre recetas de entrenamiento.

El interés del checkpoint está en la receta, no en el rendimiento final. Combina dos fases: un preentrenamiento sobre `fineweb-nanochatbpe-100M` con vocabulario BPE de 65.536 tokens y una segunda fase ("ppt") sobre `declref-01-seq_len_2048-2B` (2.000 millones de tokens, secuencia de 2048) con un vocabulario reducido de 1.028 tokens, reinicializando los embeddings y reseteando el optimizador en la transición. El nombre indica que el 1 % del presupuesto de cómputo (`alpha_ppt = 0.01`) se destina a esa segunda fase, con un objetivo de 1e18 FLOPs totales y semilla 2.

Es relevante ahora porque forma parte de una familia de checkpoints orientados a comparativas de cómputo equiparables ("compute-matched"): el run declara un `flops_per_token` de 3.596.615.680 y un `flops_used` de 9,9e17, lo que permite situarlo con precisión en curvas de escalado y usarlo como punto de referencia reproducible. El repositorio tiene 0 descargas y 0 likes, y pesa 4,9 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT (nanochat), 20 capas, `n_embd` 1280, 10 cabezas, `n_head` = `n_kv_head` = 10 (atención multi-cabeza, sin GQA), dimensión de cabeza 128 |
| Parámetros totales | No declarado en la model card. Estimación a partir del `flops_per_token` publicado (3.596.615.680) bajo la convención 6N: ~600 M de parámetros (incluyendo embeddings) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (idéntica en la fase `pt` y en la fase `ppt`) |
| Tipos de cuantización | No disponible (no se distribuyen pesos cuantizados; el repo solo contiene `model_001050.pt`) |
| Idiomas soportados | No disponible. El corpus de preentrenamiento (`fineweb-nanochatbpe-100M`) es predominantemente inglés, pero la model card no declara idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `state_dict` en `model_001050.pt` (no hay safetensors ni GGUF) |
| Vocabulario | 65.536 tokens en la fase `pt` (`pad_vocab` 65.536); 1.028 tokens en la fase `ppt` (`ppt_same_vocab_as_pt: false`) |
| Datos de preentrenamiento | `fineweb-nanochatbpe-100M` (tokenizador nanochat BPE) |
| Datos de la fase ppt | `declref-01-seq_len_2048-2B` (2.000 M de tokens, seq_len 2048) |
| Dataset de evaluación auxiliar | `c4-nanochatbpe-10B` |
| Presupuesto de cómputo objetivo | 1e18 FLOPs (`target_flops: 1e+18`); cómputo consumido 9,89972781858816e17 |
| Paso del checkpoint | 1.050 |
| Fecha de creación | 2026-09-14 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar generado por nanochat: 20 capas, `n_embd` 1280, 10 cabezas de atención con dimensión de cabeza 128 y sin decodificación especulativa ni mecanismos de atención lineal. La configuración declara `n_head` igual a `n_kv_head`, por lo que se trata de atención multi-cabeza clásica y no de GQA/MQA. El modelo `pt` usa un vocabulario de 65.536 tokens; el modelo de la fase `ppt` mantiene el mismo tronco pero reduce el vocabulario a 1.028 entradas, con embeddings reinicializados en la transición (`reinit_embed_at_transition: true`, `moment_match_embed_reinit: false`) y optimizador reseteado (`reset_optimizer_at_transition: true`).

El entrenamiento se configura con AdamW y tasas de aprendizaje diferenciadas: 0,03 para matrices, 0,3 para embeddings, 0,004 para el *unembedding*, con `weight_decay` 0 y `grad_clip` 1,0. El scheduler es trapezoidal en ambas fases, sin *warmup* (`lr_warmup_ratio: 0.0`) y con un 40 % de *warmdown* (`lr_warmdown_ratio: 0.4`, `lr_final_frac: 0.0`). La fase `ppt` usa `ppt_lr = 3e-05`. No se especifica en la información disponible ninguna fase de RLHF, DPO o ajuste por instrucciones. El run se ejecutó con `compile_model: true`, batch de dispositivo 32 y `peak_tflops` declarados de 2250,0.

Los resultados de entrenamiento registrados son: `smooth_train_loss` 3,234262228012085 en el paso 1.050, `min_objective` 1,0674879861287963 y `total_training_time` de 323,997 segundos (unos 5,4 minutos). Con 9,89972781858816e17 FLOPs consumidos y 3.596.615.680 FLOPs por token, se deduce que el modelo vio aproximadamente 275 millones de tokens durante todo el run, y que el cómputo sostenido fue de unos 3,06 PFLOPS. La evaluación usa 10.485.760 tokens (`eval_tokens`) con un desplazamiento de 2.097.152 tokens.

## Capacidades

- Generación de texto por continuación de secuencia (modelo base, sin plantilla de chat).
- Modelado de lenguaje a nivel de token sobre dominio general en la fase `pt` (vocabulario de 65.536) y sobre el dominio del corpus `declref-01` en la fase `ppt` (vocabulario de 1.028).
- No dispone de modo *thinking*, razonamiento explícito, capacidades de visión, audio ni multimodalidad.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte para agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles/no declaradas.
- Al ser un checkpoint de investigación sin ajuste por instrucciones, no mantiene formato de conversación ni rechaza peticiones fuera de política: no hay alineación aplicada.

## Casos de uso

- Estudios de escalado y curvas de cómputo: el run declara `target_flops` 1e18, `flops_used` y `flops_per_token`, de modo que puede insertarse directamente como punto de una curva de *loss* frente a FLOPs equiparables a otros checkpoints de la misma familia.
- Ablación de la fase `ppt`: sirve para medir el efecto de reinicializar embeddings, resetear el optimizador y cambiar a un vocabulario de 1.028 tokens en la transición entre fases.
- Comparación de scheduler trapezoidal sin *warmup*: el run usa `lr_warmup_ratio: 0.0` y `lr_warmdown_ratio: 0.4` tanto en `pt` como en `ppt`, lo que permite contrastar esta elección frente a schedulers con *warmup* sobre el mismo presupuesto de FLOPs.
- Reproducción de experimentos de nanochat: al incluir `config_001050.json`, `meta_001050.json` y `rng_001050.pt`, el checkpoint permite reanudar o replicar el run con la semilla 2 de forma determinista.
- Docencia y formación en entrenamiento de LLM: con 4,9 GB de repositorio y un coste de entrenamiento declarado de ~5,4 minutos de cómputo, es un ejemplo manejable para explicar un pipeline completo de preentrenamiento y transición de vocabulario.
- *Baseline* interno de bajo coste: puede usarse como referencia inferior en tareas de modelado de lenguaje sobre C4 o FineWeb (`c4-nanochatbpe-10B` está declarado como evaluación auxiliar) antes de justificar el gasto en modelos mayores.
- Depuración de pipelines de tokenización: la pareja de vocabularios (65.536 frente a 1.028) es útil para validar conversiones de tokenizador y comprobar cómo afecta un vocabulario pequeño al *loss* de la fase final.
- Generación de continuaciones de texto sin requisitos de calidad: puede emplearse para pruebas de *smoke testing* de infraestructura de inferencia, ya que cabe en cualquier GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de entrenamiento, que se recogen a continuación y no son comparables con MMLU, HumanEval o GSM8K.

| Métrica | Valor |
|---|---|
| `step` | 1050 |
| `smooth_train_loss` | 3,234262228012085 |
| `min_objective` | 1,0674879861287963 |
| `flops_used` | 9,89972781858816e+17 |
| `flops_per_token` | 3.596.615.680 |
| `total_training_time` (s) | 323,9970998764038 |
| Tokens vistos (derivado de `flops_used` / `flops_per_token`) | ~275,3 millones |
| Pico de cómputo declarado (`peak_tflops`) | 2250,0 |
| Tokens de evaluación | 10.485.760 |

## Requisitos de hardware

- VRAM para inferencia en BF16/FP16: en torno a 1,2 GB de pesos si la estimación de ~600 M de parámetros es correcta; aproximadamente 2,4 GB en FP32. Con caché KV a 2048 tokens y batch pequeño, cabría holgadamente en 4 GB.
- GPU de consumo: sí cabe en cualquier GPU con 4-8 GB o más (RTX 3050, 3060, 4060, 4070, 4080, 4090, así como las equivalentes de AMD e Intel vía llama.cpp si se convierte el checkpoint).
- GPU de centro de datos: el run se entrenó con `peak_tflops` 2250,0 declarados, lo que corresponde a aceleradores de gama alta tipo H100/H200/B200; un run idéntico es reproducible en una o dos de esas unidades (el cómputo sostenido derivado es de ~3,06 PFLOPS).
- Opciones de despliegue: la librería declarada es `nanochat`. No se documenta compatibilidad con vLLM, TGI, Ollama, llama.cpp ni transformers; el repositorio solo contiene un `state_dict` de PyTorch (`.pt`), por lo que cualquier integración con esos motores requiere conversión previa y adaptación del tokenizador propio de nanochat.
- Latencia y *throughput* estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato de pesos | Disponibilidad y notas |
|---|---|---|---|---|---|
| Este modelo (`declref_01_...`) | ~600 M (estimado) | 2048 | Apache 2.0 | `.pt` (PyTorch `state_dict`) | 0 descargas, 0 likes; requiere la librería nanochat |
| Pythia-410M | 410 M | 2048 | Apache 2.0 | safetensors | Suite completa de checkpoints intermedios para investigación de interpretabilidad |
| SmolLM2-360M | 362 M | 8192 | Apache 2.0 | safetensors y GGUF | Distribución con motores de inferencia estándar y variantes instruct |
| GPT-2 XL | 1,5 B | 1024 | MIT con modificaciones | PyTorch y safetensors | Referencia histórica de la familia GPT-2 |

La comparación de rendimiento en benchmarks no está disponible: este checkpoint no publica resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar, y el `smooth_train_loss` reportado no es comparable entre modelos con tokenizadores y vocabularios distintos.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones ni alineación: no sigue órdenes, no mantiene formato conversacional y no aplica filtros de seguridad.
- Riesgo elevado de alucinación y de generar texto incoherente: el entrenamiento consumió solo ~275 millones de tokens para un modelo de ~600 M de parámetros, muy por debajo del óptimo tipo Chinchilla (del orden de 12.000 millones de tokens para ese tamaño).
- Sesgos: no se documenta ninguna auditoría de sesgos ni de toxicidad. El corpus de preentrenamiento es un subconjunto de FineWeb, con los sesgos propios de los datos rastreados de la web.
- Idiomas: no declarados. No hay información sobre cobertura multilingüe y el corpus base es mayoritariamente inglés.
- Contexto limitado a 2048 tokens, sin extensión documentada por RoPE escalado ni por otras técnicas.
- La fase `ppt` usa un vocabulario de solo 1.028 tokens, lo que restringe severamente el espacio de salida si el checkpoint guardado corresponde a esa fase. La model card no aclara de forma explícita a qué fase corresponden los pesos de `model_001050.pt`, pese al sufijo `-pt` del repositorio.
- Licencia Apache 2.0: permite uso comercial y modificación con obligación de conservar avisos de copyright y licencia, y de indicar cambios. No incluye garantías.
- Formato de pesos propietario del ecosistema nanochat (`.pt`), sin safetensors ni GGUF, lo que dificulta su uso con herramientas estándar de despliegue.
- Modelo de investigación con 0 descargas y 0 likes: no hay validación externa de su comportamiento.
- El repositorio pesa 4,9 GB para un modelo que, según la estimación, ocuparía poco más de 1 GB en BF16; conviene revisar el contenido real antes de descargarlo.

## Enlaces

- HuggingFace: https://huggingface.co/alexkstern/declref_01_1pct_100M_computematched_adamwppt_1e18_s2_2026-09-14_13-58-37_623281-pt
- Repositorio de nanochat (Karpathy): https://github.com/karpathy/nanochat
- Run de Weights & Biases: https://wandb.ai/alexksternteam/cm100M_best_cells_hfpush_v0/runs/s6q4iydj
- Búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo. Los únicos resultados devueltos pertenecen a guías de programación televisiva (telerama.fr, programme-television.org, programme-tv.net) y no guardan relación con el modelo.
