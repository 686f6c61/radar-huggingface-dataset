# alexkstern/kdyck_5pct_100M_computematched_muonppt_1e18_s2_2026-09-14_15-02-57_065171-pt

## Resumen

`kdyck_5pct_100M_computematched_muonppt_1e18_s2` es un checkpoint de investigación entrenado con [nanochat](https://github.com/karpathy/nanochat), el stack mínimo de entrenamiento tipo GPT publicado por Andrej Karpathy. Lo desarrolla el usuario de HuggingFace `alexkstern` y forma parte de una retícula de experimentos sobre mezcla de datos y optimizadores. El nombre del repositorio lo etiqueta como "100M" y "computematched", es decir, un modelo de escala reducida entrenado con un presupuesto de cómputo fijo de 1e18 FLOPs. El checkpoint publicado corresponde al paso 1.008.

El interés del modelo no es su utilidad como asistente, sino su valor como artefacto científico: se trata de un experimento controlado en el que una fracción del entrenamiento (`alpha_ppt = 0.05`, el "5pct" del nombre) se dedica a un corpus sintético del lenguaje formal Dyck con 128 tipos de paréntesis (`dyck-k128-seq_len_2048-1B`), mientras que el resto se cubre con el corpus de texto natural `fineweb-nanochatbpe-100M`. El objetivo declarado es estudiar si la exposición parcial a una tarea formal mejora o degrada las métricas respecto a celdas de control del mismo presupuesto de cómputo.

La arquitectura es un transformer decoder-only de 20 capas y ancho 1.280, con contexto de 2.048 tokens y dos tokenizadores distintos según la fase (BPE de 65.536 entradas para el preentrenamiento y vocabulario de 256 entradas para la fase Dyck). No hay resultados de benchmarks publicados ni versión cuantizada, y el repositorio no declara idiomas soportados. La licencia Apache 2.0 permite uso comercial, pero el formato de pesos (`.pt` crudo) exige el código de `nanochat` para cargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT (nanochat) |
| Parametros totales | no disponible (no se declara recuento; la configuracion indica n_layer=20 y n_embd=1280) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en el formato original; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el corpus de preentrenamiento declarado es FineWeb, predominantemente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (`state_dict`): `model_001008.pt`; metadatos en `meta_001008.json`, `config_001008.json` y `rng_001008.pt` |

| Parametro (detalle) | Valor |
|---|---|
| Capas (`n_layer`) | 20 |
| Cabezas de atencion (`n_head` / `n_kv_head`) | 10 / 10 (sin GQA) |
| Dimension de embedding (`n_embd`) | 1280 |
| Vocabulario (fase PT) | 65536 tokens (tokenizador `nanochatbpe`) |
| Vocabulario (fase Dyck) | 256 tokens (byte-level) |
| Paso del checkpoint | 1008 |
| Computo utilizado | 9,5037e+17 FLOPs (objetivo 1e18) |
| Tamano del repositorio | 4,9 GB |
| Libreria | `nanochat` (PyTorch) |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only con atencion multi-cabeza estandar (10 cabezas de consulta y 10 de clave/valor, sin agrupacion GQA), 20 bloques, ancho de 1.280 y un maximo de 2.048 tokens por secuencia. El entrenamiento es bifasico y sigue la receta de `nanochat`: primero un preentrenamiento sobre `fineweb-nanochatbpe-100M` con un tokenizador BPE de 65.536 entradas, y despues una fase adicional (`ppt`) sobre `dyck-k128-seq_len_2048-1B` con un tokenizador de 256 entradas. En la transicion se reinicializan los embeddings (`reinit_embed_at_transition: true`) y se resetea el estado del optimizador (`reset_optimizer_at_transition: true`), lo que convierte la fase Dyck en un cambio de tarea real y no en un simple ajuste continuado.

El optimizador es de tipo Muon para las matrices, con tasas de aprendizaje diferenciadas por grupo de parametros (`matrix_lr = 0.03`, `embedding_lr = 0.3`, `unembedding_lr = 0.004`, `weight_decay = 0.0`); en la fase `ppt` se usa una tasa unica de 0.02. El calendario de aprendizaje es trapezoidal (`lr_kind: trapezoid`) sin calentamiento (`lr_warmup_ratio: 0.0`) y con `warmdown` del 40 % (`lr_warmdown_ratio: 0.4`). La semilla es la 2 (`seed: 2`).

El entrenamiento completo consumio 9,5037e+17 FLOPs en 323,06 segundos, con `device_batch_size = 32` y `grad_accum_steps` de 1 (fase PT) y 2 (fase Dyck), sobre hardware con `peak_tflops` declarado de 2250. La configuracion declara `use_measured_flops: true` y un total de 1.000 iteraciones. No se documenta uso de RLHF, DPO ni ajuste por instrucciones: es un checkpoint de preentrenamiento/continuacion de preentrenamiento sin alineamiento posterior.

## Capacidades

- Modelado de lenguaje autoregresivo y calculo de perplejidad sobre texto en el dominio de FineWeb; es la unica capacidad directamente heredada del preentrenamiento.
- Modelado de secuencias del lenguaje formal Dyck-k128, es decir, de cadenas de parentesis balanceados con 128 tipos de parentesis anidados, tras la fase `ppt`.
- Capacidad de continuacion de secuencia con ventana de 2.048 tokens en ambos dominios.
- No dispone de soporte de `tool calling` ni de `function calling`: no se ha realizado ajuste por instrucciones ni se publica plantilla de chat.
- No dispone de modo de razonamiento explicito, modo `thinking` ni descomposicion multi-paso.
- No soporta agentes, uso de herramientas externas ni ejecucion de codigo.
- No hay capacidades multimodales (vision, audio) ni de vision-lenguaje.
- Capacidades multilingues: no disponibles; no se declara evaluacion en idiomas distintos del ingles.
- Capacidad de evaluacion interna limitada a metricas de perdida (`smooth_train_loss`, `min_objective`) sobre `c4-nanochatbpe-10B` como corpus auxiliar.

## Casos de uso

- Estudio de generalizacion en lenguajes formales: el checkpoint permite medir hasta que longitud de secuencia el modelo mantiene el balanceo de parentesis Dyck-k128 y con que exactitud cierra estructuras anidadas de profundidad creciente. Es adecuado porque la fase `ppt` esta dedicada especificamente a esa tarea y el modelo resultante conserva ambas capacidades en un unico conjunto de pesos.
- Comparativa de optimizadores a presupuesto fijo: la celda esta etiquetada como `muonppt` dentro de un grupo de ejecuciones con el mismo computo (`cm100M_best_cells_hfpush_v0`), de modo que sirve como punto de medida para contrastar Muon frente a otras opciones manteniendo constante el presupuesto de 1e18 FLOPs.
- Estudio del efecto de mezclas de datos sinteticos: con `alpha_ppt = 0.05`, el modelo cuantifica el impacto de destinar un 5 % del entrenamiento a datos sinteticos frente a un 0 % (control) o a porcentajes superiores, comparando `min_objective` y la perdida sobre el corpus auxiliar.
- Reproducibilidad y auditoria de experimentos de entrenamiento: los ficheros `config_001008.json`, `meta_001008.json` y `rng_001008.pt` permiten reconstruir exactamente la ejecucion (semilla, calendario de aprendizaje, orden de datos) para verificar resultados o reanudar el entrenamiento.
- Validacion de infraestructura de entrenamiento: la transicion de fase con reinicializacion de embeddings y reseteo del optimizador es un buen caso de prueba para comprobar que un pipeline gestiona correctamente cambios de tokenizador y de cabecera de salida durante el entrenamiento.
- Estudio de transferencia entre tokenizadores: el modelo alterna entre un vocabulario BPE de 65.536 entradas y uno de 256, lo que permite analizar como se reorganiza la representacion interna al reasignar la matriz de embeddings.
- Baseline educativo o docente: con 323 segundos de entrenamiento y un coste de computo de 1e18 FLOPs, este checkpoint y su configuracion asociada son utiles para ilustrar el ciclo completo de un entrenamiento tipo GPT en un curso o taller practico.
- Base para experimentos de leyes de escala: al situarse en el orden de magnitud de los 100M de parametros declarados y con un presupuesto de computo conocido, puede emplearse como punto de una curva de escalado controlada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo proporciona metricas de entrenamiento, que se reproducen a continuacion tal cual figuran en la informacion de referencia:

| Metrica | Valor |
|---|---|
| `step` | 1008 |
| `smooth_train_loss` | 3,5500731468200684 |
| `min_objective` | 1,0716318809876972 |
| `flops_used` | 9,503738705844634e+17 |
| `flops_per_token` | 3,596615680e+09 |
| `total_training_time` (s) | 323,06070351600647 |

No hay resultados de MMLU, HumanEval, GSM8K, HellaSwag ni de ninguna otra evaluacion estandar, ni comparaciones publicadas contra modelos de referencia.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explicita. El repositorio ocupa 4,9 GB e incluye pesos y ficheros auxiliares; el `state_dict` en precision reducida (bf16/fp16) cabe holgadamente en GPUs de 8 GB, y en CPU con memoria del sistema suficiente (estimacion a partir del tamano declarado, no confirmada por el autor).
- GPUs recomendadas: no se declara ninguna para inferencia. Para el entrenamiento, la configuracion fija `peak_tflops = 2250.0`, valor propio de aceleradores de centro de datos; el modelo concreto no se especifica en la informacion disponible.
- GPU de consumo: si, es esperable que quepa en cualquier GPU de consumo con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090), dado el tamano del checkpoint y la ventana de 2.048 tokens. No hay mediciones publicadas.
- Opciones de despliegue: el unico camino soportado es cargar el `state_dict` con PyTorch y el codigo de `nanochat`. No se publican pesos en safetensors, GGUF ni formatos compatibles con vLLM, TGI, llama.cpp u Ollama; cualquier despliegue en esos motores requeriria escribir una conversion propia.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos, ni siquiera con otras celdas del mismo barrido (`cm100M_best_cells_hfpush_v0`), mas alla de la referencia al proyecto `nanochat` en el que se enmarca. Tampoco se indica a que checkpoint base o linea de velocidad de `nanochat` corresponde esta celda, por lo que no es posible establecer una comparacion cuantitativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ninguna evaluacion de sesgo. El corpus declarado (FineWeb) es texto web sin filtrar desde el punto de vista de sesgos, por lo que cabe esperar los sesgos propios de ese tipo de datos, pero no hay mediciones que lo confirmen.
- Riesgo de alucinacion: alto en cualquier uso generativo. El modelo es un checkpoint de preentrenamiento de escala reducida, sin alineamiento, sin ajuste por instrucciones y entrenado con un presupuesto de computo de 1e18 FLOPs, muy por debajo de los regimenes en los que aparecen capacidades de facto fiables.
- Ausencia de ajuste por instrucciones: no existe plantilla de chat ni formato de prompt documentado; no debe emplearse como asistente conversacional sin un ajuste posterior.
- Limitacion de contexto: la ventana es de 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Limitacion de idioma: no se declara soporte multilingue; el preentrenamiento se apoya en un corpus en ingles y la fase adicional es un lenguaje formal sintetico, no natural.
- Cambio de tokenizador: el modelo maneja dos vocabularios distintos segun la fase. Cualquier uso debe respetar el tokenizador correspondiente al paso 1.008; mezclarlos produce salidas sin sentido.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia. No se declaran restricciones adicionales.
- Caveats para produccion: cero descargas y cero valoraciones en el momento de la ficha, sin validacion comunitaria; formato `.pt` no estandar para servidores de inferencia; ausencia total de benchmarks publicos; origen experimental (barrido de optimizadores y mezclas de datos) y no de un modelo pensado para producto.
- El checkpoint esta marcado con `cleanup_checkpoints: true`, por lo que solo se publica el paso final y no hay puntos intermedios para analisis de trayectoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alexkstern/kdyck_5pct_100M_computematched_muonppt_1e18_s2_2026-09-14_15-02-57_065171-pt
- Ejecucion de Weights & Biases: https://wandb.ai/alexksternteam/cm100M_best_cells_hfpush_v0/runs/n2lufv9t
- Repositorio de nanochat: https://github.com/karpathy/nanochat
