# dougalldeepmind/2026-09-15-qwen36-0-nonmoral-original-7

## Resumen

El repositorio identificado como `dougalldeepmind/2026-09-15-qwen36-0-nonmoral-original-7` contiene un adaptador LoRA de ajuste supervisado (SFT), no un modelo completo. Según la model card, se trata de un adaptador PEFT entrenado sobre el modelo base `Qwen/Qwen3.6-27B` (revisión `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`), con rango `r=64`, `alpha=128` y `dropout=0.05`, durante una única época con `lr=1e-4`, `batch_size=1`, acumulación de gradiente de 16 y una longitud máxima de secuencia de 8192 tokens.

El adaptador forma parte de un pipeline de replicación de investigación (`teaching_claude_why_replication`, commit `ccf80a630f5f839de770eab59dabe45107094ff2`) cuyo objetivo declarado es reutilizar "conversaciones históricas de craft" sin someterlas a una revisión de constitución nueva. La model card indica explícitamente `constitution: none`, lo que sitúa el artefacto en el ámbito del estudio de alineación y de las recetas de SFT, más que en el de un modelo de propósito general listo para producción.

La relevancia del repositorio es, por tanto, metodológica: documenta de forma reproducible la receta exacta (`train_config.yaml` resuelto, `training_meta.json` con `organism`, `thinking`, `recipe`, `mix_subject`, `base_model`, `git_sha` y timestamp) empleada para producir el adaptador. No se dispone de licencia, idiomas, pipeline declarado ni resultados de evaluación publicados en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) de bajo rango sobre un transformer denso (modelo base `Qwen/Qwen3.6-27B`) |
| Parámetros totales | No disponible para el adaptador; el modelo base se denomina `Qwen3.6-27B` (27 mil millones según nomenclatura, no confirmado en la model card) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el modelo base; `max_seq_len=8192` tokens en el entrenamiento del adaptador |
| Tipos de cuantización | No disponible (los pesos del adaptador se publican en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador LoRA PEFT) + tokenizer + `train_config.yaml` + `training_meta.json` |
| Tamaño del repositorio | 1,3 GB |
| Rango LoRA (r) / alpha / dropout | 64 / 128 / 0.05 |
| Optimizador y ajustes de entrenamiento | `lr=1e-4`, `epochs=1.0`, `batch_size=1`, `grad_accum=16`, `token_budget=8000`, `loss_agg=seq-mean-token-mean`, `seed=0`, `thinking=true` |
| Dataset de entrenamiento | `dougalldeepmind/2026-09-15-nonmoral-original-7-mix` @ `b35ead8eaf4d59091e0ef1d08b187c7822f05632` (`mixture.jsonl`) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen3.6-27B`, un transformer denso, sobre el que se aplica una parametrización de bajo rango (LoRA) con `r=64`, `alpha=128` y `dropout=0.05`. El adaptador se guarda en formato PEFT safetensors y se acompaña del tokenizer y de la configuración resuelta de entrenamiento, lo que permite reproducir la ejecución completa mediante `uv run train --config train_config.yaml`. No se detalla en la información disponible si el entrenamiento congeló la totalidad de los pesos base, ni qué módulos lineales recibieron el adaptador.

El entrenamiento consistió en una única época de SFT (`recipe: sft`) sobre la mezcla `nonmoral-original-7`, con `max_seq_len` de 8192 tokens, `batch_size=1` y acumulación de gradiente de 16, lo que da un tamaño de lote efectivo de 16 secuencias y un presupuesto dinámico de tokens de 8000 por lote. La model card indica que se reutilizaron "conversaciones históricas de craft" sin revisión de constitución (`constitution: none`), y que el modo *thinking* estaba activo durante la generación (`thinking: true`). No se documentan fases de RLHF, DPO, ni innovaciones técnicas adicionales (atención lineal, decodificación especulativa u otras). El dataset de entrenamiento está publicado de forma separada y referenciado por revisión inmutable.

## Capacidades

- Generación de texto y ajuste de estilo conversacional: el adaptador modifica el comportamiento del modelo base en la distribución representada por la mezcla `nonmoral-original-7`, compuesta por conversaciones históricas de tipo *craft*.
- Modo *thinking*: la configuración de generación registrada activa explícitamente `thinking: true`, por lo que el adaptador está entrenado bajo ese régimen.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el adaptador no documenta capacidades de agencia.
- Capacidades multilingües: no disponibles (el campo de idiomas del repositorio está vacío).
- Capacidad especial: no se declara ninguna (ni visión, ni audio, ni audio-texto). El único rasgo distintivo declarado es la ausencia de revisión de constitución en los datos y un ajuste de dominio concreto (conversaciones de *craft*).

## Casos de uso

- Investigación en alineación y replicación de recetas SFT: el repositorio incluye `train_config.yaml` resuelto, `training_meta.json` y el `git_sha` del pipeline, lo que permite reproducir el experimento exacto y estudiar el efecto del ajuste con `constitution: none` frente a variantes con revisión constitucional.
- Estudio de adaptadores LoRA sobre modelos de 27B: sirve como artefacto de referencia para medir cómo un adaptador de `r=64` sobre una base densa de gran tamaño altera el comportamiento en un dominio concreto, con un coste de almacenamiento de 1,3 GB.
- Ajuste de estilo en dominios conversacionales específicos: el adaptador se entrenó sobre un corpus temático concreto (`nonmoral-original-7`), por lo que puede emplearse como punto de partida para reproducir o analizar ese estilo conversacional en tareas de generación de texto dentro del mismo dominio.
- Red-teaming y evaluación de robustez: al carecer de revisión constitucional declarada, es un candidato natural para medir tasas de respuestas problemáticas en comparación con el modelo base sin adaptar y con adaptadores alineados.
- Análisis de artefactos de entrenamiento en pipelines reproducibles: los ficheros `train_config.yaml` y `training_meta.json` permiten auditar cada argumento de lanzamiento, la revisión del dataset y la del modelo base, útil en entornos de investigación que exigen trazabilidad completa.
- Fine-tuning incremental con PEFT: al ser un adaptador PEFT estándar, puede cargarse con las utilidades de `peft` sobre el modelo base para continuar el entrenamiento, fusionar pesos o comparar con otros adaptadores entrenados con la misma receta y semillas distintas (el nombre incluye `seed 0`).
- Docencia y formación técnica: permite ilustrar de forma práctica el ciclo completo de un SFT con LoRA (configuración, dataset, tokenizer, metadatos) sin necesidad de reproducir un entrenamiento desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro conjunto de evaluación, ni comparaciones cuantitativas contra el modelo base o adaptadores alternativos.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamaño del modelo base declarado en el nombre (`Qwen3.6-27B`); no están confirmadas por la model card.

- Peso del adaptador: 1,3 GB en safetensors, cargable en CPU o en cualquier GPU con memoria libre suficiente para el modelo base.
- Inferencia en precisión completa (bf16/fp16) del modelo base: del orden de 54 GB solo en pesos, más caché KV; requiere en la práctica 1× A100 80 GB, 1× H100 80 GB o 2× A100 40 GB.
- Inferencia cuantizada a 8 bits: aproximadamente 27-30 GB de pesos; viable en 1× A100 40 GB o 1× H100.
- Inferencia cuantizada a 4 bits (GGUF Q4_K_M o equivalente): aproximadamente 15-17 GB; cabe en GPUs de consumo con 24 GB, como RTX 3090, RTX 4090 o RTX 5090.
- No cabe en GPUs de consumo con 8, 12 o 16 GB de VRAM sin cuantización agresiva y descarga parcial a RAM.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargarlo junto al modelo base, por lo que aplican los runners compatibles con el base (vLLM, TGI, llama.cpp/Ollama con conversión previa a GGUF, transformers + peft). No se documenta compatibilidad explícita con ninguno de ellos en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica adaptadores comparables de la misma receta, tamaño o dominio, ni ofrece métricas que permitan situar este artefacto frente a alternativas. La única referencia interna es el propio modelo base `Qwen/Qwen3.6-27B` en su revisión `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`, que constituye la línea base natural para cualquier evaluación diferencial, pero no se publican resultados de esa comparación.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo. Al entrenarse sobre un corpus temático concreto y sin revisión constitucional, es esperable que herede las distribuciones y sesgos presentes en la mezcla `nonmoral-original-7`, aunque no se cuantifican.
- Riesgo de alucinación: no evaluado. No hay métricas de factualidad ni de tasa de alucinación en la información disponible.
- Limitaciones de contexto: la ventana de entrenamiento registrada es de 8192 tokens. No se confirma la longitud de contexto nativa del modelo base ni su comportamiento más allá de ese límite.
- Idiomas: el campo de idiomas del repositorio está vacío; no se puede afirmar qué lenguas cubre el adaptador ni con qué calidad.
- Licencia: no disponible. Sin una licencia explícita, no hay autorización clara para uso comercial ni para redistribución; conviene tratar el artefacto como material de investigación y verificar la licencia del modelo base `Qwen/Qwen3.6-27B` de forma independiente.
- Ausencia de revisión de constitución: la model card declara explícitamente `constitution: none` y la reutilización de "conversaciones históricas de craft" sin nueva revisión. Esto implica que no ha habido un filtrado de seguridad declarado sobre los datos de SFT, lo que incrementa el riesgo de comportamientos no deseados en producción.
- Trazabilidad de evaluación: 0 descargas y 0 likes, sin pipeline declarado ni métricas publicadas; no hay evidencia de validación por parte de terceros.
- Reproducibilidad: aunque se documentan hashes de dataset, modelo base y commit del repositorio, no se publican los pesos resultantes de una fusión completa ni resultados de la ejecución, por lo que la reproducibilidad depende de reejecutar el pipeline completo.
- Uso en producción: no recomendado sin una evaluación propia de seguridad, sesgo, factualidad y licencia, dado el vacío de métricas y la naturaleza explícitamente "nonmoral" del ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dougalldeepmind/2026-09-15-qwen36-0-nonmoral-original-7
- Dataset de mezcla de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-09-15-nonmoral-original-7-mix
- Repositorio del pipeline de replicación: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication.git (commit `ccf80a630f5f839de770eab59dabe45107094ff2`)
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.6-27B (revisión `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`)
- Paper, blog o demo adicionales: no disponibles.
