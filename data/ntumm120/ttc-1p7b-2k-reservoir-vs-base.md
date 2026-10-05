# ntumm120/ttc-1p7b-2k-reservoir-vs-base

## Resumen

Este repositorio no contiene un modelo generativo al uso, sino un artefacto de investigación del proyecto TTC (Tiny Test-time Compute, según los ficheros del repositorio) publicado por el usuario ntumm120. Incluye dos «writers» entrenados sobre un backbone Qwen3-1.7B congelado, que implementan un mecanismo de memoria de contexto largo basado en un estado de tamaño fijo. En concreto, los writers pliegan filas de atención (r = 1024 filas) para procesar flujos de documentos de hasta 16,5K tokens por bloques de 2048, usando una política FIFO con 3 posiciones «sink», escritura softmax con tau 0.05 y lectura softmax con puerta.

El objetivo del release es comparar dos reglas de fusión (merge) distintas manteniendo idéntica receta de entrenamiento en todo lo demás. La variante `ABP2K_base/` usa `rowmax` (concurso por slot sobre la masa de la puerta, con empates resueltos a favor del ocupante actual), mientras que `RT_m1_random_resv_2k/` usa `admit_random:resv` (un muestreo de tipo random reservoir que admite round(R/(k+1)) filas en posiciones aleatorias indexadas por el write index).

Es relevante ahora porque documenta, con lecturas numéricas concretas, cómo dos reglas de fusión afectan a métricas de QA cerrado, perplejidad de contexto largo, NIAH (needle-in-a-haystack) y daño de parámetros medido con GSM8K, todo ello sobre el mismo backbone congelado. El repositorio ocupa 3,4 GB y no registra descargas ni «likes» en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Qwen3-1.7B congelado con un «writer» acoplado que pliega filas de atención en un estado de tamaño fijo (block 2048, FIFO + 3 sinks, r = 1024 filas de atención) |
| Parametros totales | 1,7B en el backbone Qwen3-1.7B (congelado); el estado del writer ocupa ~120 MB por flujo de 16K a r = 1024 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Flujos de documentos de 16,5K tokens procesados por bloques de 2048; estado de atención limitado a r = 1024 filas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (ficheros `writer_s2000.pt` con el state dict del writer, el `shared` A/gamma, `args` y `step`); no se ofrecen safetensors ni GGUF |

## Arquitectura y entrenamiento

La base es Qwen3-1.7B congelado. Sobre ella se entrena un «writer» que mantiene un estado de atención de tamaño fijo (r = 1024 filas) y va escribiendo y leyendo información de un flujo de documento de 16,5K tokens dividido en bloques de 2048. El mecanismo combina una cola FIFO con 3 posiciones «sink», una escritura softmax con temperatura tau = 0.05 y una lectura softmax con puerta. La señal de entrenamiento es una destilación KL + CE hacia un profesor de contexto completo sobre el siguiente bloque, es decir, el writer aprende a recuperar la distribución del modelo que ve todo el contexto a partir de su estado comprimido.

Ambas variantes comparten exactamente la misma receta (Qwen3-1.7B congelado, streams de 16,5K tokens, block 2048, FIFO + 3 sinks, r = 1024, tau 0.05, gate en lectura, lr 1e-3 constante, 2000 pasos, 8 streams por paso, datos de pretrain ProLong text 0.8 / doc-QA 0.2) y solo difieren en la regla de fusión y en la puntuación de fila que esta necesita. `ABP2K_base` usa `rowmax` (concurso por slot sobre la masa de la puerta, con empates a favor del ocupante). `RT_m1_random_resv_2k` usa `admit_random:resv`, un random reservoir determinista que admite round(R/(k+1)) filas en posiciones aleatorias indexadas por el write index; además activa `attn_rowmass_mode score`, aunque esa cabeza de puntuación no la usa el plegado basado solo en recuento. Cada directorio incluye `writer_s2000.pt`, `args.json`, `train_log.jsonl` y varios `readouts*.log`.

## Capacidades

- Procesamiento de flujos largos de documento (hasta 16,5K tokens) manteniendo un estado de memoria de tamaño fijo, sin recálculo completo del contexto.
- Recuperación de hechos para QA cerrado (`TQA cl`), QA extractivo (SQuAD, NemQA) y tareas tipo needle-in-a-haystack (NIAH cl) sobre el contexto comprimido.
- Evaluación de memoria tras desalojo (`NIAH ev`, `TQA ev`), es decir, capacidad de retener información de posiciones que han salido de la ventana activa.
- Razonamiento aritmético medido mediante GSM8K (`GSM plain/own/dmg`), que sirve además como sonda de daño de parámetros.
- Modelado de lenguaje de contexto largo medido con LongPPL (perplejidad de contexto largo).
- No hay información disponible sobre tool calling, function calling, soporte de agentes, capacidades multilingües, visión, audio ni modos de pensamiento explícitos.

## Casos de uso

- Investigación en memoria de contexto largo: comparar reglas de fusión (rowmax frente a random reservoir) sobre el mismo backbone congelado para medir su efecto en perplejidad y QA, usando los `readouts*.log` incluidos.
- Evaluación de compresión de estado de atención: reproducir los experimentos con `scripts/e1/stream_eval.sh` y `scripts/stre/mixture_longppl.sh` para estudiar cómo se degrada la información al reducir a 1024 filas de atención.
- Pruebas de retención post-desalojo: emplear las métricas NIAH ev y TQA ev para cuantificar cuánta información sobrevive a la política FIFO con 3 sinks.
- Sondas de daño de parámetros: usar `eval/param_damage_gsm8k.py` para medir cómo el plegado afecta al razonamiento aritmético (columna `GSM dmg`).
- Reproducibilidad de destilación de contexto largo: servir como punto de partida para replicar la destilación KL + CE hacia un profesor de contexto completo sobre el bloque siguiente.
- Estudio de sensibilidad a la semilla: analizar el efecto de `TTC_FOLD_SEED` sobre LongPPL, dado que el writer co-adapta su admisión a una permutación determinista fijada por la semilla de entrenamiento.
- Comparación de arquitecturas de memoria fija: confrontar el enfoque TTC con otros esquemas de estado recurrente o de atención dispersa sobre flujos de 16,5K tokens.

## Benchmarks y rendimiento

Resultados publicados en la model card (lecturas propias del autor, en modo «burst»; closure = recuperación de KL hacia el contexto completo; ev = precisión de decodificación sobre hechos desalojados; GSM = daño de parámetros):

| run | NemQA | LongPPL | SQuAD | TQA cl | NIAH cl | NIAH ev | TQA ev | GSM plain/own/dmg |
|---|---|---|---|---|---|---|---|---|
| ABP2K_base (seed 0) | .751 | 5.24 | .588 | .704 | .412 | .031 | .408 | .710 / .730 / .020 |
| ABP2K_base_s2 (seed 2, no incluido en el repo) | .753 | 5.19 | .638 | .683 | .420 | .040 | .377 | .710 / .750 / - |
| RT_m1_random_resv_2k | .792 | 4.17 | .603 | .648 | .445 | .031 | .373 | .710 / .750 / .040 |
| RT_m1_random_resv_2k, fold seed 1 en evaluación | .758 | 5.04 | .523 | .626 | .401 | .031 | .362 | - |

La variante con random reservoir mejora NemQA (.792 frente a .751) y LongPPL (4.17 frente a 5.24) y sube ligeramente NIAH cl (.445 frente a .412), pero empeora TQA cl (.648 frente a .704) y TQA ev (.373 frente a .408). El daño en GSM es de .040 en la variante reservoir frente a .020 en la base.

## Requisitos de hardware

- El backbone Qwen3-1.7B en bf16 ocupa aproximadamente 3,4 GB de pesos, a lo que se suma el estado del writer (~120 MB por flujo de 16K a r = 1024).
- Cabe holgadamente en GPU de consumo: RTX 3060 de 12 GB, RTX 4070/4080 y RTX 4090 (24 GB) permiten inferencia sin cuantizar.
- Para entrenamiento con 8 streams por paso conviene una GPU con más memoria; no se especifica el hardware exacto usado en el clúster del autor.
- Opciones de despliegue: el repositorio TTC (rama `write-read-lane`, commit e0b25149 o posterior) mediante `ttc/loading.py`, que construye el writer a partir de `args` y carga `writer` / `shared`. Scripts de evaluación: `scripts/e1/stream_eval.sh`, `scripts/stre/mixture_longppl.sh` y `eval/param_damage_gsm8k.py`.
- No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de terceros comparables en la información proporcionada. Dentro del propio release, la comparación relevante es entre las dos reglas de fusión:

| Variante | Backbone | Regla de fusión | Contexto de flujo | LongPPL | NemQA | TQA cl | Licencia |
|---|---|---|---|---|---|---|---|
| ABP2K_base | Qwen3-1.7B congelado | rowmax (concurso por slot sobre la masa de la puerta) | 16,5K tokens, block 2048, r = 1024 | 5.24 | .751 | .704 | no disponible |
| RT_m1_random_resv_2k | Qwen3-1.7B congelado | admit_random:resv (random reservoir por write index) | 16,5K tokens, block 2048, r = 1024 | 4.17 | .792 | .648 | no disponible |

Alternativas externas como Qwen3-1.7B sin writer u otros esquemas de memoria de contexto largo: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no hay información sobre condiciones de uso comercial, por lo que no debería asumirse ningún permiso.
- Artefacto de investigación: son state dicts de writers, no un modelo autocontenido; requieren el repositorio TTC y el backbone Qwen3-1.7B para cargarse.
- Sensibilidad a la semilla de plegado: la permutación de admisión es una función determinista del write index (seed 0 por defecto). El writer co-adapta su comportamiento a ese calendario, de modo que con la semilla de entrenamiento LongPPL es 4.17 y con un calendario redibujado sube a 4.76–5.04 (frente a 5.19–5.24 de la base). Hay que mantener la semilla por defecto para reproducir los números.
- Idiomas soportados no documentados; no hay información multilingüe.
- Formato únicamente `.pt`; no hay versiones cuantizadas ni safetensors ni GGUF.
- Sin datos publicados sobre sesgos, tasas de alucinación ni comportamiento fuera de los conjuntos de evaluación descritos.
- La evaluación de los beds de decodificación requiere variables de entorno concretas (`SUITE_QA_BACKBONE=qwen3-1.7b`, `SUITE_MK3_KEYS=words`, `NEEDLE_VOCAB_SPLIT_VERSION=1`) y el fichero `data/beds/tqa_stream_bed_qwen3-1.7b_albert.jsonl`.
- Los resultados son lecturas propias del autor en modo «burst» y no han sido verificados de forma independiente.

## Enlaces

- HuggingFace: https://huggingface.co/ntumm120/ttc-1p7b-2k-reservoir-vs-base
- Repositorio TTC, rama `write-read-lane` (commit e0b25149 o posterior): no se proporciona URL directa en la información disponible.
- Script de evaluación de streams: `scripts/e1/stream_eval.sh`
- Script de escaleras LongPPL: `scripts/stre/mixture_longppl.sh`
- Script de daño de parámetros: `eval/param_damage_gsm8k.py`
- Cadena de lecturas en clúster: `~/ttc_readouts_overnight/readout_all.sh <run> <tree> launch`
- Bed de evaluación TQA: `data/beds/tqa_stream_bed_qwen3-1.7b_albert.jsonl`
- Carga del modelo: `ttc/loading.py`
