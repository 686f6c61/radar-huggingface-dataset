# ethanwtodd/Ornith-1.5-35B-A3B-Q4_K-Q8_0-GGUF

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de arquitectura MoE (mixture of experts) desarrollado por ornith-ai, con 34.660.610.688 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (de ahí el sufijo A3B). El modelo base emplea una arquitectura híbrida que combina mecanismos DeltaNet con atención clásica y capas SSM, según se deduce de los nombres de tensores presentes en la cuantización (`ssm_alpha`, `ssm_beta`, `ssm_a`, `ssm_dt`, `ssm_conv1d`, `attn_k`, `attn_v`), lo que lo sitúa en la familia de modelos con atención lineal y state space models. Está publicado bajo licencia MIT, lo que permite uso comercial sin restricciones adicionales.

La ficha que nos ocupa no es el modelo original, sino una cuantización GGUF mixta publicada por el usuario ethanwtodd. Se trata de una cuantización atípica: los 120 tensores de expertos enrutados (`ffn_gate_exps`, `ffn_up_exps`, `ffn_down_exps`, que representan el 92% de los pesos) se cuantizan en Q4_K usando la importance matrix de bartowski, mientras que todas las matrices densas (proyecciones de atención y DeltaNet, expertos compartidos, embeddings, `ssm_alpha`/`ssm_beta`) se mantienen en Q8_0 y la cabeza de salida en Q6_K. El resultado ocupa 20,7 GB.

La relevancia de esta cuantización reside en su estrategia de asignación de bits: como en cada token de decodificación solo se leen 8 de los 256 expertos por capa, pero todos los pesos densos se recorren siempre, el autor concentra la precisión en las matrices densas y deja los expertos en Q4_K. Según las mediciones de divergencia KL incluidas en la model card, esta mezcla supera en fidelidad a las cuantizaciones Q4_K_M, Q4_K_S, IQ4_XS y Q4_0 de bartowski, así como a la Q4_K_M oficial de ornith-ai, con un tamaño menor que varias de ellas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrida con DeltaNet, atención clásica y SSM (tipo `qwen35moe`) |
| Parámetros totales | 34.660.610.688 |
| Parámetros activos | aproximadamente 3.000 millones (8 de 256 expertos por capa) |
| Longitud de contexto | no disponible (la cuantización se evaluó hasta 32.768 tokens) |
| Tipos de cuantización | Q4_K (expertos enrutados), Q8_0 (matrices densas), Q6_K (cabeza de salida), F32 (normas, router, `ssm_a`, `ssm_dt`, `ssm_conv1d`, gate del experto compartido) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (un único archivo de 20,67 GB) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un transformer MoE con componentes híbridos: los nombres de tensores de la cuantización revelan proyecciones DeltaNet (`ssm_alpha`, `ssm_beta`, `ssm_a`, `ssm_dt`, `ssm_conv1d`) junto con proyecciones de atención convencionales (`attn_k`, `attn_v`) y una capa de mezcla de expertos con 256 expertos enrutados por capa más expertos compartidos. El bloque MTP/NextN (multi-token prediction) está presente en el checkpoint original pero fue excluido deliberadamente de esta cuantización mediante el flag `--no-mtp` del conversor de llama.cpp. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

El proceso de cuantización se realizó con llama.cpp en el commit `ea0c4c2c85fb183ec0fbd30a1af4e4275a18a064`: primero una conversión a bf16 con `convert_hf_to_gguf.py --outtype bf16 --no-mtp` desde una copia del checkpoint sin `chat_template` en `tokenizer_config.json`, y después `llama-quantize` con la importance matrix de bartowski (`bartowski/Ornith-1.5-35B-A3B-GGUF` en el commit `64b0493d34`), aplicando `--tensor-type ffn_(gate|up|down)_exps=q4_k --output-tensor-type q6_k --token-embedding-type q8_0` con Q8_0 como tipo base. El hash sha256 del archivo es `25a681297b42b5e5c0088d01fb1116148ce4eced2fe8dd5792bf03022eefa1a3`.

Una innovación destacable de esta ficha es la gestión de la plantilla de chat: el archivo incluye el `chat_template.jinja` propio de Ornith, que re-renderiza el razonamiento de turnos anteriores. El repositorio original de Ornith también incluye el `tokenizer_config.json` estándar de Qwen3.6 con su plantilla dentro, que es la que prefiere el conversor de llama.cpp; por eso los GGUF convertidos directamente desde el repositorio llevan la plantilla estándar en lugar de la de Ornith. Esta cuantización se convirtió con ese campo eliminado para preservar la plantilla correcta.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline `text-generation` y tag `conversational`.
- Razonamiento multi-paso: la plantilla de chat propia de Ornith re-renderiza el razonamiento de turnos anteriores, lo que sugiere soporte de modo de pensamiento persistente entre turnos.
- Decodificación especulativa: compatible con los drafts DFlash 2 de `incoai/Qwen3.6-35B-A3B-DFlash2` y `jzinno/Ornith-1.5-35B-A3B-DFlash2`, con tasas de aceptación de aproximadamente 5,2 tokens por verificación en GSM8K, 5,0 en HumanEval y 3,9-4,0 en MT-Bench a temperatura 1.
- Eficiencia MoE: solo se activan 8 de los 256 expertos por capa, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse a través de infraestructura de inferencia estándar.
- Capacidades multilingües: no disponible (no se especifican idiomas en la información proporcionada).
- Tool calling / function calling: no disponible (no se documenta explícitamente en la información proporcionada).
- Visión o audio: no disponible (el pipeline es únicamente de texto).

## Casos de uso

- Despliegue en hardware de gama alta para consumo: con 20,7 GB, el modelo cabe en una GPU con 24 GB de VRAM (RTX 3090, RTX 4090) o en dos GPU de 16 GB, lo que permite ejecutar un MoE de 35B en equipos de escritorio con calidad cercana a Q8_0 en las matrices densas.
- Servicio de chat conversacional con contexto largo: la ventana de contexto evaluada llega a 32.768 tokens con divergencia KL controlada (0,0511 de media), adecuada para asistentes que mantienen historial extenso de conversación.
- Generación de código asistida: el modelo base se evaluó en HumanEval en el contexto de decodificación especulativa, lo que indica que se usa para tareas de código; la cuantización preserva el 92% de coincidencia en el token top-1 frente a Q8_0, suficiente para autocompletado y generación de funciones.
- Razonamiento matemático: GSM8K aparece en las evaluaciones de los drafts especulativos, lo que sugiere uso en resolución de problemas aritméticos de varios pasos; la fidelidad de la cuantización a 4k de contexto (KL media 0,0354) es la mejor de la tabla comparativa.
- Inferencia en un solo Intel Arc A770M: el autor menciona explícitamente que la cuantización se diseñó para su motor de serving `eklow`, que ejecuta expertos Q4_K a la misma velocidad que Q4_0, lo que habilita despliegues en GPU de consumo con 16 GB de VRAM.
- Investigación en cuantización mixta: la ficha sirve como referencia metodológica para estudiar la asignación óptima de bits entre pesos densos y expertos enrutados en arquitecturas MoE, con métricas de divergencia KL publicadas a 4k y 32k de contexto.
- Sustitución de cuantizaciones oficiales en producción: al superar en fidelidad a la Q4_K_M oficial de ornith-ai (KL media 0,0354 frente a 0,0596 a 4k) con un archivo más pequeño (20,7 GB frente a 21,7 GB), es una alternativa directa para pipelines ya montados sobre llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) para esta cuantización en la información disponible. La model card proporciona exclusivamente métricas de fidelidad de cuantización (divergencia KL y coincidencia de token top-1) frente al Q8_0 del propio modelo:

| Archivo | Tamaño | KL media 4k / 32k | KL p99 4k / 32k | Mismo token top-1 4k / 32k |
|---|---|---|---|---|
| Esta cuantización | 20,7 GB | 0,0354 / 0,0511 | 0,373 / 0,565 | 92,7% / 92,0% |
| bartowski Q4_K_M | 21,9 GB | 0,0460 / 0,0548 | 0,476 / 0,583 | 91,5% / 91,7% |
| bartowski Q4_K_S | 21,1 GB | 0,0511 / 0,0661 | 0,504 / 0,752 | 91,1% / 91,0% |
| bartowski IQ4_XS | 19,3 GB | 0,0582 / 0,0675 | 0,616 / 0,753 | 90,6% / 90,8% |
| bartowski Q4_0 | 20,4 GB | 0,0774 / 0,0796 | 0,771 / 0,885 | 88,9% / 89,7% |
| ornith-ai Q4_K_M (oficial) | 21,7 GB | 0,0596 / 0,0812 | 0,592 / 0,909 | 90,3% / 89,8% |

Mediciones realizadas con `llama-perplexity --kl-divergence` sobre wikitext-2 test a 4.096 tokens de contexto (20 chunks) y un documento largo a 32.768 tokens (2 chunks), con llama.cpp en el commit `ea0c4c2c`. Tasas de aceptación de decodificación especulativa con DFlash 2 a bloque 8: 5,21 / 5,01 / 4,01 tokens por verificación (GSM8K / HumanEval / MT-Bench) con el draft de incoai, y 5,23 / 5,00 / 3,92 con el de jzinno, medidas sobre la misma mezcla con expertos Q4_0.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20,7 GB solo para los pesos; con overhead de contexto (KV cache y buffers de cómputo) se recomiendan 22-24 GB para contexto moderado y más de 24 GB para contexto de 32k.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB, justo al límite), RTX 3090 (24 GB), dos RTX 4080/4090 en paralelo para repartir capas.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 con contexto corto; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) requiere offload parcial a CPU o reparto entre dos GPU. El autor lo diseñó específicamente para una Intel Arc A770M (16 GB) con su motor `eklow`, lo que implica que con offload es viable en 16 GB.
- Opciones de despliegue: llama.cpp (carga directa, formato `qwen35moe` estándar), Ollama (tras importar el GGUF), el motor propietario `eklow` del autor, y cualquier runtime compatible con GGUF. vLLM y TGI no se mencionan en la información disponible para este formato.
- Latencia y throughput: no disponibles de forma absoluta. Como referencia relativa, el autor indica que en su motor `eklow` sobre Intel Arc A770M los expertos Q4_K se ejecutan a la misma velocidad que Q4_0, y que la decodificación especulativa con DFlash 2 acepta aproximadamente 4-5 tokens por verificación, lo que multiplica el throughput efectivo frente a decodificación autoregresiva pura.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Tamaño cuantizado | Fidelidad KL (4k) |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (esta cuantización) | 34,66B | ~3B | no disponible | MIT | 20,7 GB | 0,0354 |
| Ornith-1.5-35B-A3B Q4_K_M oficial | 34,66B | ~3B | no disponible | MIT | 21,7 GB | 0,0596 |
| bartowski Q4_K_M del mismo modelo | 34,66B | ~3B | no disponible | MIT | 21,9 GB | 0,0460 |
| bartowski IQ4_XS del mismo modelo | 34,66B | ~3B | no disponible | MIT | 19,3 GB | 0,0582 |

No se dispone de información sobre modelos de otros desarrolladores con arquitectura y tamaño comparables en la documentación proporcionada, por lo que la comparativa se limita a las distintas cuantizaciones del mismo modelo base.

## Limitaciones y advertencias

- La información sobre el modelo base (datos de entrenamiento, idiomas, contexto máximo, sesgos) no está disponible en la documentación proporcionada; cualquier evaluación de sesgos o alucinación requeriría consultar la model card de `ornith-ai/Ornith-1.5-35B-A3B`.
- El bloque MTP/NextN fue eliminado de esta cuantización (`--no-mtp`), por lo que no se puede usar multi-token prediction nativo del checkpoint; la aceleración debe venir de drafts especulativos externos (DFlash 2).
- La plantilla de chat es un punto delicado: los GGUF convertidos directamente desde el repositorio original llevan la plantilla estándar de Qwen3.6 en lugar de la de Ornith, lo que altera el formateo del razonamiento entre turnos. Esta cuantización corrige el problema, pero otras conversiones pueden no hacerlo.
- La cuantización Q4_K de los expertos introduce degradación medible: 7,3% de tokens top-1 distintos frente a Q8_0 a 4k de contexto y 8,0% a 32k, con cola de divergencia (p99 de 0,565 a 32k) que puede afectar a tareas de razonamiento largo.
- El archivo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2 de noviembre de 2026; no hay evidencia de uso en producción ni validación independiente más allá de las métricas del propio autor.
- Aunque la licencia es MIT, conviene verificar la licencia del modelo base en su repositorio original antes de un despliegue comercial, ya que la cuantización hereda las obligaciones del modelo del que deriva.
- El motor de referencia (`eklow`) es específico del autor y para una única GPU Intel Arc A770M; el rendimiento en otros backends (llama.cpp estándar, Ollama) no está documentado en la información disponible.

## Enlaces

- Cuantización en Hugging Face: https://huggingface.co/ethanwtodd/Ornith-1.5-35B-A3B-Q4_K-Q8_0-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Importance matrix utilizada: https://huggingface.co/bartowski/Ornith-1.5-35B-A3B-GGUF
- Draft especulativo DFlash 2 (incoai): https://huggingface.co/incoai/Qwen3.6-35B-A3B-DFlash2
- Draft especulativo DFlash 2 (jzinno): https://huggingface.co/jzinno/Ornith-1.5-35B-A3B-DFlash2
- Motor de serving eklow: https://github.com/ewtodd/eklow
