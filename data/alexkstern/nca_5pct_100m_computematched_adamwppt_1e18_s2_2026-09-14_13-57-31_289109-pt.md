# alexkstern/nca_5pct_100M_computematched_adamwppt_1e18_s2_2026-09-14_13-57-31_289109-pt

## Resumen

Este repositorio contiene un checkpoint de un modelo de lenguaje decoder-only entrenado con [nanochat](https://github.com/karpathy/nanochat), la implementación minimalista de GPT de Andrej Karpathy. Lo publica el usuario de HuggingFace `alexkstern` como artefacto de un barrido experimental de hiperparámetros, no como un modelo listo para producto. El nombre del repositorio resume el experimento: un modelo de profundidad 20 entrenado con un presupuesto de cómputo de 1e18 FLOPs, en el que un 5 % de ese presupuesto (`alpha_ppt = 0.05`) se reserva para una segunda fase sobre un corpus distinto denominado `nca-paper`, con cambio de vocabulario entre fases.

La configuración base es la de un transformer de 20 capas, dimensión de modelo 1280, 10 cabezas de atención, ventana de contexto de 2048 tokens y un vocabulario de 65536 tokens para la fase de preentrenamiento. El checkpoint publicado corresponde al paso 1007 de entrenamiento, con un `smooth_train_loss` de 3,158 y un `min_objective` de 1,071 como únicos valores reportados. No es un modelo ajustado por instrucciones: no hay plantilla de chat, ni datos de RLHF/DPO, ni evaluaciones de benchmarks públicas en la model card.

Su relevancia es fundamentalmente metodológica: sirve para estudiar cómo repartir un presupuesto fijo de cómputo entre preentrenamiento y una fase posterior con corpus y tokenizador distintos, un problema activo en la investigación sobre currículos de datos y asignación óptima de FLOPs en modelos pequeños. Con 0 descargas y 0 likes en el momento de redactar esta ficha, debe considerarse un artefacto de investigación reproducible, no una dependencia de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (implementación `nanochat_gpt` de nanochat); detalles finos de atención y MLP no documentados en la model card |
| Parametros totales | No publicado por el autor. Estimación a partir de la configuración: ≈561 M si el unembedding es independiente (20 capas × (4×1280² atención + 2×1280×5120 MLP) + 65536×1280 embeddings + 65536×1280 unembedding); ≈477 M si los embeddings están atados |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (idéntica en las dos fases: `sequence_len` = 2048) |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas; el peso se distribuye como `state_dict` de PyTorch) |
| Idiomas soportados | No declarado. Los corpus de entrenamiento (FineWeb y C4) son mayoritariamente en inglés, por lo que el soporte multilingüe es previsiblemente muy limitado |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `state_dict` en `model_001007.pt` (con `meta_001007.json`, `config_001007.json` y `rng_001007.pt`). No se publican safetensors ni GGUF. Tamaño del repo: 4,9 GB |

Datos de configuración adicionales: vocabulario de la fase PT = 65536; vocabulario de la fase PPT = 10004; 20 capas, 10 cabezas de consulta y 10 cabezas KV (atención sin GQA, dimensión de cabeza 128); semilla 2; etiqueta interna `case_c`.

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only con la configuración GPT de nanochat: 20 capas, `n_embd` = 1280, 10 cabezas de atención con igual número de cabezas KV, y ventana de 2048 tokens. La model card no detalla normalizaciones, tipo de atención ni función de activación del MLP, aunque la etiqueta `nanochat_gpt` indica que se usa la implementación estándar del repositorio. El coste medido es de 3.596.615.680 FLOPs por token, y `use_measured_flops = true` indica que el presupuesto se contabilizó con medidas reales y no con una fórmula teórica.

El entrenamiento es bifásico. La primera fase (PT) usa `fineweb-nanochatbpe-100M`, un subconjunto de 100 millones de tokens de FineWeb tokenizado con el BPE de nanochat (vocabulario de 65536). La segunda fase (PPT, el 5 % del cómputo total) usa `nca-paper-share20-2048` con un vocabulario distinto de 10004 tokens, y en la transición se reinicializan los embeddings (`reinit_embed_at_transition = true`) y se reinicia el estado del optimizador (`reset_optimizer_at_transition = true`). El optimizador es AdamW con `matrix_lr` = 0.03, `embedding_lr` = 0.3, `unembedding_lr` = 0.004 y `weight_decay` = 0.0; el scheduler es trapezoidal sin warmup (`lr_warmup_ratio` = 0.0) y con un 40 % final de decaimiento (`lr_warmdown_ratio` = 0.4) hasta un factor final de 0.0. Se ejecutaron 1000 iteraciones (checkpoint en el paso 1007), con `grad_clip` = 1.0, batch de dispositivo de 32 y `grad_accum_steps` = 1 en PT (2 en PPT). Los tokens de evaluación fueron 10.485.760 sobre `c4-nanochatbpe-10B` más 2.097.152 tokens auxiliares.

En términos de cómputo, el presupuesto objetivo era 1e18 FLOPs y se consumieron 9,494310393636454e17 (≈9,49e17 FLOPs) en 324,59 segundos sobre hardware declarado con 2250 TFLOPS de pico. Dividiendo los FLOPs usados entre los FLOPs por token se obtienen aproximadamente 264 millones de tokens procesados en total entre ambas fases. No hay ninguna innovación arquitectónica propia más allá del esquema de dos fases con cambio de vocabulario.

## Capacidades

- Generación de texto autoregresiva en inglés a escala de modelo pequeño (estimación de 477-561 M de parámetros), con calidad coherente con su pérdida de entrenamiento.
- Modelo base sin ajuste por instrucciones: no hay evidencia de `thinking mode`, razonamiento explícito ni cadena de pensamiento entrenada.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes ni razonamiento multi-paso.
- Capacidades multilingües no disponibles: los corpus empleados son mayoritariamente anglófonos.
- Sin capacidades de visión, audio ni multimodalidad.
- Completado de secuencias de hasta 2048 tokens como única modalidad de uso confirmada.
- No se documenta plantilla de chat, tokens especiales de turno ni formato de prompt más allá del tokenizador BPE de nanochat.

## Casos de uso

- Reproducción de experimentos de asignación de cómputo: el checkpoint materializa un punto concreto del barrido (1e18 FLOPs, `alpha_ppt` = 0.05, semilla 2) y permite comparar contra otras celdas del mismo estudio sin reentrenar.
- Estudio del cambio de tokenizador a mitad de entrenamiento: al usar vocabulario de 65536 en PT y de 10004 en PPT con reinicialización de embeddings, sirve para analizar el coste y la recuperación de pérdida tras sustituir el vocabulario.
- Baseline de referencia en inglés para modelos de menos de 600 M de parámetros: útil como punto de comparación de pérdida en `c4-nanochatbpe-10B` frente a otros experimentos propios.
- Fine-tuning de dominio en tareas de texto cortas: con 2048 tokens de contexto y licencia Apache 2.0, es viable ajustarlo para clasificación de documentos, etiquetado o generación restringida en inglés.
- Destilación y generación de datos sintéticos a pequeña escala: puede actuar como profesor pequeño o generador de borradores en pipelines internos donde la calidad no sea crítica.
- Pruebas de infraestructura de inferencia: su tamaño permite validar pipelines de carga (formato `state_dict`), cuantización casera y perfiles de memoria en GPU de gama baja o CPU antes de escalar a modelos mayores.
- Experimentos de eficiencia energética y latencia: con 3,6 GFLOPs por token y 2048 tokens de contexto, es un banco de pruebas barato para medir throughput y consumo.
- Validación de metodologías de registro en W&B: el run enlazado y los metadatos publicados permiten reproducir el flujo de logging y evaluación de nanochat de principio a fin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, HellaSwag u otros) en la información disponible. Los únicos valores reportados en la model card son métricas internas de entrenamiento:

| Metrica | Valor |
|---|---|
| Paso del checkpoint | 1007 |
| `smooth_train_loss` | 3,1577377319335938 |
| `min_objective` | 1,0712632537020859 |
| `flops_used` | 9,494310393636454e17 |
| `flops_per_token` | 3.596.615.680 |
| Tiempo total de entrenamiento | 324,5863 s |
| Tokens de evaluacion | 10.485.760 (`c4-nanochatbpe-10B`) |

No se dispone de comparación numérica con otros modelos: la información proporcionada no incluye resultados de evaluaciones comparables.

## Requisitos de hardware

- VRAM estimada para los pesos: ≈2,2 GB en fp32 (formato de publicación), ≈1,1 GB en bf16/fp16 y del orden de 0,3-0,6 GB con cuantización de 4-8 bits (no se ofrecen cuantizaciones oficiales; habría que generarlas).
- Caché KV a 2048 tokens en bf16: ≈210 MB (20 capas × 2 × 10 cabezas × 128 dimensiones = 51.200 valores por token).
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090, así como en GPUs de portátil con 6-8 GB. También es viable en CPU para pruebas puntuales.
- GPU de datacenter (A100, H100) innecesarias para inferencia; el entrenamiento declarado usó hardware con 2250 TFLOPS de pico (coherente con H100/B200 en precisión reducida) con batch de dispositivo 32.
- Opciones de despliegue: carga directa del `state_dict` con el código de nanochat (PyTorch). No hay soporte nativo en vLLM, TGI, llama.cpp ni Ollama, ya que la arquitectura y el tokenizador son específicos de nanochat; sería necesaria una conversión (por ejemplo, exportar a safetensors y portar la definición del modelo, o convertir a GGUF).
- Latencia y throughput: no disponibles. Como referencia de coste, cada token generado requiere 3,596.615.680 FLOPs.
- Almacenamiento: el repositorio ocupa 4,9 GB, muy por encima de lo que necesitan los pesos en bf16, por lo que conviene verificar el contenido antes de descargarlo íntegro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks publicos |
|---|---|---|---|---|---|
| Este checkpoint (nanochat d20, 1e18 FLOPs) | ≈477-561 M (estimado) | 2048 | Apache 2.0 | `state_dict` PyTorch (.pt) | No disponibles |
| GPT-2 (124 M) | 124 M | 1024 | MIT | safetensors / .bin | Si (WebText, evaluaciones clasicas) |
| Pythia-410M | 410 M | 2048 | Apache 2.0 | safetensors | Si (suite de EleutherAI) |

La comparación en rendimiento con estos modelos no puede establecerse con la información disponible: no hay ningún benchmark publicado para este checkpoint. En términos estructurales, comparte con Pythia-410M el rango de tamaño y la ventana de 2048 tokens, pero se diferencia en el vocabulario (65536 frente a 50304), el esquema de entrenamiento en dos fases y el hecho de ser un artefacto de un único experimento con 264 millones de tokens procesados, muy por debajo de los volúmenes de tokens de los modelos citados. No se han identificado en la búsqueda web modelos comparables adicionales que aporten datos verificables.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no seguirá instrucciones ni mantendrá formato de conversación de forma fiable.
- Entrenado con un volumen de tokens muy reducido (≈264 millones procesados, con un corpus PT de 100 millones de tokens): la calidad esperable es baja en comparación con modelos del mismo tamaño entrenados con billones de tokens.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sesgos: no evaluados ni documentados. Los corpus FineWeb y C4 reflejan sesgos de la web en inglés; no hay ninguna mitigación reportada.
- Riesgo de alucinación alto, especialmente por el bajo presupuesto de entrenamiento y la ausencia de alineación.
- Idiomas: soporte multilingüe no declarado y muy previsiblemente pobre, dado el predominio del inglés en los datos.
- Licencia Apache 2.0, que permite uso comercial y modificación, pero el autor no ofrece ninguna garantía sobre el comportamiento del modelo.
- El formato de pesos (`state_dict` de PyTorch sin safetensors ni GGUF) dificulta la integración con herramientas estándar y requiere código de nanochat para instanciar el modelo; además, la arquitectura no está soportada por llama.cpp, Ollama, vLLM ni TGI sin una conversión previa.
- El tamaño del repositorio (4,9 GB) es desproporcionado respecto a los pesos esperados en precisión reducida: conviene comprobar los archivos antes de descargar.
- Es un artefacto de investigación con 0 descargas y 0 likes, publicado sin validación externa, sin evaluación estandarizada y sin garantía de reproducibilidad más allá del run de W&B enlazado.
- No debe usarse en producción, en atención al cliente ni en ningún contexto donde los errores tengan consecuencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexkstern/nca_5pct_100M_computematched_adamwppt_1e18_s2_2026-09-14_13-57-31_289109-pt
- Run de Weights & Biases: https://wandb.ai/alexksternteam/cm100M_best_cells_hfpush_v0/runs/b896djuj
- Repositorio nanochat (Karpathy): https://github.com/karpathy/nanochat
- Nota sobre la búsqueda web: los resultados devueltos corresponden a páginas de localización de tiendas de una cadena de supermercados y no guardan relación con el modelo; no se han encontrado papers, blogs, repositorios ni demos adicionales relevantes.
