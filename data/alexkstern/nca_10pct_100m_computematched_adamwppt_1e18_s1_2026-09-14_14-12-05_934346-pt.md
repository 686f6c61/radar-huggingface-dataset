# alexkstern/nca_10pct_100M_computematched_adamwppt_1e18_s1_2026-09-14_14-12-05_934346-pt

## Resumen

`alexkstern/nca_10pct_100M_computematched_adamwppt_1e18_s1_...-pt` es un checkpoint de investigacion entrenado con [nanochat](https://github.com/karpathy/nanochat), el framework de entrenamiento de LLM a escala reducida publicado por Andrej Karpathy. No es un modelo de proposito general, sino el artefacto de un experimento de *compute matching*: el run lleva el identificador `cm100M_best_cells_hfpush_v0` y declara un presupuesto objetivo de 1e18 FLOPs (`target_flops: 1e+18`), alcanzado en el paso 749 de 1000 iteraciones configuradas.

El modelo sigue la arquitectura GPT de nanochat: transformer decoder-only denso de 22 capas (`depth_22`), 1408 dimensiones de embedding, 11 cabezas de atencion (sin GQA, ya que `n_kv_head` = `n_head` = 11) y una longitud de secuencia de 2048 tokens. El entrenamiento se divide en dos fases con tokenizadores distintos: una fase de preentrenamiento sobre `fineweb-nanochatbpe-100M` con vocabulario de 65536 tokens y una fase posterior (`ppt`) sobre `nca-paper-share20-2048` con vocabulario de 10004 tokens, entre las que se reinicializan los embeddings y se resetea el optimizador.

Su relevancia es metodologica, no de producto: forma parte de una familia de ablaciones (semilla 1, receta de learning rate trapezoidal, AdamW, fraccion `alpha_ppt = 0,1`) pensadas para estudiar tecnicas de reutilizacion de computo y cambios de tokenizador en la transicion entre fases de entrenamiento. Con 0 descargas y 0 likes, y sin benchmarks publicados, debe tratarse como material de reproduccion de experimentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (clase GPT) de 22 capas, `n_embd` 1408, 11 cabezas de atencion (`n_kv_head` = 11, sin GQA), dimension de cabeza 128 |
| Parametros totales | No declarado en la model card. Estimacion propia a partir de la configuracion (`n_layer` 22, `n_embd` 1408, `vocab_size` 65536): del orden de 760-880 millones, segun se cuenten o no los embeddings |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 2048 tokens (`sequence_len: 2048` en ambas fases) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos sin cuantizar; no hay GGUF, AWQ, GPTQ ni versiones int8/4-bit |
| Idiomas soportados | No disponible. El corpus de preentrenamiento (FineWeb con tokenizador nanochat BPE) es predominantemente ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `state_dict` en `model_000749.pt` (no safetensors, no GGUF) |
| Vocabulario | 65536 tokens en preentrenamiento (`pad_vocab: 65536`); 10004 tokens en la fase `ppt` (`ppt_vocab_size: 10004`, `ppt_same_vocab_as_pt: false`) |
| Checkpoint | Paso 749 (`min_objective` 1,0702231208232416) |
| Presupuesto de computo | 8,996596526675395e+17 FLOPs consumidos (~9,0e17) frente al objetivo de 1e18 |
| Tokens procesados | No declarado; derivado de `flops_used` / `flops_per_token` resulta ~196 millones de tokens |
| Tamano del repositorio | 6,1 GB |

## Arquitectura y entrenamiento

La configuracion publicada describe un transformer decoder-only denso al estilo GPT-2 pero con las decisiones de diseno de nanochat: 22 capas, 1408 dimensiones de modelo, 11 cabezas de atencion con dimension de cabeza 128 y atencion multi-cabeza clasica (`n_kv_head` igual a `n_head`, por lo que no se aplica grouped-query attention). El vocabulario de preentrenamiento es de 65536 entradas tras el padding, y la secuencia de entrenamiento es de 2048 tokens. El lote global en la fase de preentrenamiento es de 32 secuencias por paso sin acumulacion (`device_batch_size: 32`, `grad_accum_steps: 1`), es decir 65536 tokens por paso; en la fase `ppt` se usa `device_batch_size: 32` con `ppt_grad_accum_steps: 4`.

El aspecto tecnico mas singular es la transicion entre fases. El run entrena primero con `data_pt: fineweb-nanochatbpe-100M` y despues con `data_ppt: nca-paper-share20-2048`, un corpus cuyo tokenizador tiene solo 10004 tokens. En esa transicion se reinicializan los embeddings (`reinit_embed_at_transition: true`), se resetea el optimizador (`reset_optimizer_at_transition: true`), no se hace correspondencia de momentos (`moment_match_embed_reinit: false`) y se cambia de learning rate (matriz 0,02; embeddings 0,3; unembedding 0,004; `ppt_lr` 3e-06) con un schedule trapezoidal (`lr_kind: trapezoid`, `lr_warmup_ratio: 0.0`, `lr_warmdown_ratio: 0.4`, `lr_final_frac: 0.0`). El peso de decaimiento es 0,0, el recorte de gradiente 1,0 y `ema_beta` 0,0.

No hay informacion en la model card sobre composicion detallada del dataset, numero exacto de tokens por fase, uso de RLHF o DPO, ni sobre componentes como el esquema posicional o el tipo de activacion. La evaluacion configurada usa 10 485 760 tokens (`eval_tokens`) con un desplazamiento de 2 097 152 tokens y un conjunto auxiliar adicional (`aux_eval_tokens: 2097152`), con `c4-nanochatbpe-10B` como evaluacion extra. El run se ejecuto con `peak_tflops: 2250.0` declarados, valor propio de aceleradores de la clase NVIDIA B200 en BF16 denso, aunque la model card no especifica el hardware utilizado.

## Capacidades

- Generacion de texto autoregresiva basica: es un modelo de lenguaje causal con 2048 tokens de contexto.
- Modelado de lenguaje sobre texto web en ingles (linaje FineWeb) en la fase de preentrenamiento.
- Adaptacion de dominio a un corpus especifico (`nca-paper-share20-2048`) con vocabulario reducido en la segunda fase.
- No hay evidencia en la informacion disponible de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso ni thinking mode.
- No hay evidencia de entrenamiento por instrucciones, RLHF o DPO, ni de plantilla de chat publicada.
- No hay capacidades multimodales (vision, audio) declaradas.
- Multilingue: no disponible; el corpus base es predominantemente ingles y no se declaran idiomas en la ficha.

## Casos de uso

- Reproduccion de experimentos de compute matching: el checkpoint permite verificar el resultado del run de la semilla 1 dentro del proyecto `cm100M_best_cells_hfpush_v0`, comparando `min_objective` y `smooth_train_loss` con las celdas restantes de la matriz de ablaciones.
- Estudio de transiciones de tokenizador: al reinicializar los embeddings y cambiar de un vocabulario de 65536 a uno de 10004 tokens, es un punto de partida util para investigar cuanto conocimiento se conserva tras un cambio de vocabulario en mitad del entrenamiento.
- Ablacion de recetas de learning rate: el run usa un schedule trapezoidal con `warmdown_ratio` 0,4 y learning rates diferenciados por grupo de parametros (matriz, embedding, unembedding), por lo que sirve como celda de comparacion frente a recetas cosenoidales o de warmup tradicional.
- Linea base (baseline) para experimentos propios: con ~0,8 mil millones de parametros y licencia Apache-2.0, puede usarse como referencia de perdida en un presupuesto de ~1e18 FLOPs antes de escalar a configuraciones mayores.
- Ajuste fino de bajo coste en un dominio concreto: el modelo completo cabe en una GPU de consumo, por lo que es viable hacer fine-tuning sobre un corpus especializado para tareas de modelado de lenguaje o clasificacion con cabecera propia.
- Prototipado de pipelines de entrenamiento con nanochat: sirve para validar scripts de carga, tokenizacion, evaluacion (`eval_tokens`, `aux_eval_tokens`) y publicacion a HuggingFace sin consumir presupuesto de computo significativo.
- Investigacion educativa sobre tokenizadores BPE: el par de vocabularios (65536 / 10004) permite estudiar el efecto del tamano de vocabulario en la perdida y en el coste de embedding.
- Generacion de texto exploratoria no critica: dado su `smooth_train_loss` de 3,70, solo es adecuado para prototipos donde la calidad del texto no sea un requisito, como pruebas de integracion de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni evaluaciones equivalentes). La model card solo incluye las metricas internas del run:

| Metrica | Valor |
|---|---|
| `step` | 749 |
| `smooth_train_loss` | 3,696654796600342 |
| `min_objective` | 1,0702231208232416 |
| `flops_used` | 8,996596526675395e+17 |
| `flops_per_token` | 4 582 014 976 |
| `total_training_time` | 305,76002168655396 (la model card no especifica la unidad) |

El `smooth_train_loss` de 3,70 sobre un vocabulario de 65536 tokens corresponde a una perdida por token elevada para un modelo de este tamano, coherente con un presupuesto de entrenamiento de menos de 200 millones de tokens. No se dispone de la perdida de validacion en bits por byte ni de resultados sobre `c4-nanochatbpe-10B`.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): ~3,2 GB para los pesos de un modelo de ~800 millones de parametros, mas activaciones.
- VRAM estimada en bf16/fp16: ~1,6 GB de pesos.
- Cache KV en fp16 a contexto completo de 2048 tokens: ~0,25 GB (22 capas x 2 x 11 cabezas x 128 dimensiones x 2048 posiciones x 2 bytes), calculo propio a partir de la configuracion.
- Cabe sin problemas en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 (24 GB), e incluso en tarjetas de 6-8 GB si se usara cuantizacion, que no esta disponible.
- GPU de datacenter: no se requiere A100 ni H100 para inferencia. El run de entrenamiento declaro `peak_tflops: 2250.0`, propio de la clase B200 en BF16 denso, pero la model card no confirma el hardware empleado.
- Despliegue: el unico camino documentado es la biblioteca nanochat, que carga el `state_dict` de PyTorch. No hay soporte declarado en vLLM, TGI, llama.cpp ni Ollama, y no existen pesos en GGUF, por lo que no es desplegable en esas herramientas sin conversion previa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (nca_10pct... pt) | ~0,76-0,88 mil millones (estimado, no declarado) | 2048 | ~196 millones (derivado) | Apache-2.0 | no disponible | Checkpoint de investigacion, 0 descargas, 0 likes |
| GPT-2 small (OpenAI) | 124 millones | 1024 | ~9 mil millones (WebText) | MIT modificada | Si, ampliamente reportados | Ampliamente distribuido y convertido a multiples formatos |
| Pythia-1B (EleutherAI) | ~1 mil millones | 2048 | 300 mil millones (The Pile) | Apache-2.0 | Si, suite completa de evaluaciones publicada | Pesos en safetensors y amplio soporte en herramientas |
| TinyLlama-1.1B | 1,1 mil millones | 2048 | 3 billones | Apache-2.0 | Si | Pesos en safetensors, GGUF y soporte en vLLM/Ollama |

La diferencia fundamental frente a estos tres modelos no es arquitectonica sino de presupuesto: este checkpoint ha visto dos ordenes de magnitud menos tokens que Pythia-1B y cuatro menos que TinyLlama, por lo que no es comparable en calidad de generacion. Su valor esta en la reproducibilidad del experimento, no en el rendimiento.

## Limitaciones y advertencias

- Modelo de investigacion sin benchmarks: no hay ninguna evaluacion publicada que permita estimar su calidad en tareas reales.
- Perdida de entrenamiento alta: `smooth_train_loss` de 3,70 y solo ~196 millones de tokens procesados implican una calidad de generacion muy limitada y un riesgo alto de texto incoherente.
- Checkpoint intermedio: corresponde al paso 749 de 1000 iteraciones configuradas, detenido al alcanzar el presupuesto de FLOPs, no por convergencia.
- Sin ajuste por instrucciones: no se declara SFT, RLHF ni DPO, ni existe plantilla de chat, por lo que no debe usarse como asistente conversacional.
- Idiomas: no declarados; el preentrenamiento usa FineWeb, predominantemente en ingles, por lo que el rendimiento en castellano es previsiblemente muy bajo y no esta medido.
- Contexto limitado a 2048 tokens: insuficiente para tareas de documento largo, analisis de repositorios o conversaciones extensas.
- Sesgos: al derivar de datos web (FineWeb) sin filtrado documentado ni mitigacion declarada, reproduce los sesgos presentes en ese corpus.
- Riesgo de alucinacion: elevado, tanto por el bajo presupuesto de entrenamiento como por la ausencia de evaluaciones de factualidad.
- Formato de pesos inseguro: `model_000749.pt` es un `state_dict` serializado con pickle de PyTorch; cargarlo con `torch.load` sin `weights_only=True` puede ejecutar codigo arbitrario. Se recomienda auditar el fichero o convertirlo a safetensors.
- Licencia permisiva pero sin garantias: Apache-2.0 permite uso comercial, pero el titular no ofrece ninguna garantia de idoneidad ni de no infraccion; no hay clausulas de uso aceptable documentadas.
- Nomenclatura ambigua: el identificador contiene "100M" y "share20" mientras la configuracion declara `alpha_ppt: 0.1`, por lo que la interpretacion de esos sufijos no esta documentada en la model card.
- Datos de creacion anomalos: las fechas del repositorio (creado el 2026-09-14) son posteriores a la fecha de consulta habitual, lo que sugiere un desfase de reloj en el sistema de publicacion; conviene verificar la version del checkpoint antes de reutilizarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexkstern/nca_10pct_100M_computematched_adamwppt_1e18_s1_2026-09-14_14-12-05_934346-pt
- Run de Weights & Biases: https://wandb.ai/alexksternteam/cm100M_best_cells_hfpush_v0/runs/n9x8tq3z
- Repositorio de nanochat (framework de entrenamiento): https://github.com/karpathy/nanochat
- Paper, blog o demo adicionales: no disponible. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo ni con nanochat; los enlaces recuperados corresponden a contenido no relacionado (articulos sobre portatiles) y se descartan.
