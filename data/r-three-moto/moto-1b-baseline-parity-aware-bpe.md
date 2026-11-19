# r-three-moto/moto-1b-baseline-parity-aware-bpe

## Resumen

MoTo 1B baseline con tokenizador Parity-Aware BPE es un modelo de lenguaje de 1.810 millones de parametros desarrollado por el equipo r-three-moto (Gül Sena Altıntaş y Colin Raffel) como parte de la familia MoTo (Mixture of Tokenizers). Se trata de un transformer decoder de estilo Llama entrenado desde cero sobre 21 idiomas, con un unico tokenizador BPE de 128K merges compartido por todos los idiomas y sin enrutamiento por lengua. Su proposito es servir como linea base controlada para aislar el efecto de la tokenizacion en el modelado multilingue: comparte arquitectura y datos de entrenamiento con el modelo MoTo 1B, que sustituye el tokenizador unico por un conjunto de tokenizadores por idioma.

El modelo resuelve el problema de comparar experimentalmente estrategias de tokenizacion multilingue bajo condiciones identicas. Al mantener constante el transformer (25 capas, d_model 2048, 16 cabezas, embeddings de entrada y salida no atados) y los datos (FineWeb-Edu al 40% y FineWeb2-HQ para los 20 idiomas restantes), las diferencias de rendimiento frente a la variante MoTo pueden atribuirse exclusivamente al tokenizador y a la tabla de embeddings.

Es relevante ahora porque acompana a la publicacion de MoTo en NeurIPS 2026 y porque se distribuye con licencia Apache 2.0, pesos en bfloat16 y safetensors, lo que facilita su reproduccion y su uso como referencia en investigacion sobre tokenizacion multilingue. No es un modelo de instrucciones ni tiene ajuste de seguridad: es una base preentrenada para generacion de texto y evaluacion cientifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de estilo Llama, 25 capas, d_model 2048, 16 cabezas, embeddings de entrada/salida no atados |
| Parametros totales | 1.809.954.816 (1.81B); 1.28B sin contar embeddings |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | 21: en, ar, cs, zh, da, de, el, fa, fr, hu, id, it, ja, nl, pl, pt, ru, es, sv, tr, vi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16), compatible con transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder autorregresivo de estilo Llama con 25 capas, dimension de modelo 2048, 16 cabezas de atencion y embeddings de entrada y salida no atados. El tokenizador es un BPE Parity-Aware (Foroutan et al., 2025) entrenado sobre los 21 idiomas con 128.258 merges y equilibrado sobre el split dev de FLORES-200, lo que da una tabla de embeddings de 128.258 filas. La secuencia de entrenamiento se formatea como `<|begin_of_text|>` (id 128256) + texto + `<|end_of_text|>` (id 128257), con los tokens especiales propios del tokenizador desactivados.

El entrenamiento se realizo desde cero durante 100.000 pasos con 1,05 millones de tokens por paso, lo que suma aproximadamente 104.860 millones de tokens (4 secuencias de 4096 tokens por GPU, 8 GPUs y 8 pasos de acumulacion). Los datos combinan FineWeb-Edu (ingles, 40% de la mezcla) y FineWeb2-HQ para los otros 20 idiomas; los pesos exactos estan en `training/config.yaml`. El entrenamiento se llevo a cabo con la herramienta lingua del propio equipo. No se menciona RLHF, DPO ni ajuste de instrucciones: es un modelo base puro. La innovacion tecnica del trabajo no esta en la arquitectura, que es deliberadamente convencional, sino en el diseno experimental: este checkpoint es la linea base monolingue-tokenizador contra la que se compara MoTo.

## Capacidades

- Generacion de texto autorregresiva en 21 idiomas, incluidos arabe, checo, chino, danes, aleman, griego, persa, frances, hungaro, indonesio, italiano, japones, neerlandes, polaco, portugues, ruso, espanol, sueco, turco y vietnamita, ademas del ingles.
- Modelado de lenguaje base: continuacion de texto y puntuacion de secuencias completas (log-probabilities) para evaluacion.
- Capacidad multilingue derivada de un unico vocabulario compartido de 128.258 entradas, sin enrutamiento por idioma.
- No dispone de tool calling ni function calling: no se documenta soporte.
- No dispone de modo de razonamiento explicito (thinking mode) ni capacidades de agente multi-paso.
- No soporta vision, audio ni otras modalidades.
- No esta ajustado a instrucciones ni a conversacion; no responde a formatos de chat.
- Decodificacion sin perdida (`clean_up_tokenization_spaces` desactivado), lo que permite reconstruir el texto original exactamente.

## Casos de uso

- Linea base en investigacion sobre tokenizacion multilingue: sirve para medir, con arquitectura y datos identicos, la ganancia de MoTo frente a un tokenizador unico; se evalua en tareas como FLORES-200 o perplejidad por idioma.
- Evaluacion de justicia linguistica: al estar entrenado con un vocabulario compartido, permite cuantificar el sesgo de asignacion de tokens (fertility) entre idiomas de distintos alfabetos y compararlo con la variante MoTo.
- Puntuacion de texto para filtrado de corpus: con 4096 tokens de contexto y pesos en bfloat16, puede calcular log-probabilidades de documentos completos para descartar contenido de baja calidad en pipelines de datos multilingues.
- Generacion de texto de relleno o sintetico en 21 idiomas para pruebas de infraestructura (vLLM, TGI, transformers) sin coste de licencia, gracias a Apache 2.0.
- Reproduccion de experimentos academicos: el repositorio incluye `tokenizer.json`, `tokenizer_config.json`, `special_tokens_map.json` y `training/metrics.jsonl`, lo que permite replicar curvas de entrenamiento y throughput.
- Fine-tuning supervisado como punto de partida: al ser un modelo base de 1.81B con contexto de 4096, cabe en una sola GPU de 24 GB en bfloat16 y sirve para adaptar tareas downstream en idiomas de bajos recursos.
- Estudio de tokenizadores Parity-Aware BPE: el checkpoint permite analizar como un vocabulario equilibrado en FLORES-200 afecta a la compresion y a la calidad por idioma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni perplejidades por idioma; solo referencia el paper de MoTo (NeurIPS 2026) como fuente de las comparaciones.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 3,6 GB solo para pesos (1.81B × 2 bytes), mas cache KV; en la practica unos 5-7 GB con contexto de 4096 tokens y batch pequeno.
- En float32: unos 7,2 GB de pesos; en cuantizacion de 8 bits (si se genera con herramientas externas) alrededor de 1,8 GB, y en 4 bits alrededor de 0,9 GB. El autor no publica checkpoints cuantizados.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluacion a gran escala; para inferencia basta una RTX 4090 (24 GB), RTX 3090 (24 GB), L4 (24 GB) o incluso una RTX 4060 Ti de 16 GB.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 8 GB o mas en bfloat16, y en 6 GB o mas con cuantizacion de 8 bits.
- Opciones de despliegue: transformers (soporte oficial), text-generation-inference (el repo declara `text-generation-inference` y `endpoints_compatible`), vLLM. No se documenta soporte GGUF ni Ollama en el repositorio.
- Latencia y throughput: no disponibles; el repositorio incluye `training/metrics.jsonl` con throughput de entrenamiento, pero no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizador | Licencia | Notas |
|---|---|---|---|---|---|
| MoTo 1B baseline Parity-Aware BPE (este) | 1.81B | 4096 | BPE unico, 128K merges, equilibrado en FLORES-200 | Apache 2.0 | Modelo base, sin instrucciones |
| MoTo 1B (`r3-moto/moto-1b`) | 1.81B (misma arquitectura) | 4096 | Un tokenizador por idioma, vocabulario superset | Apache 2.0 (segun el release) | Mismos datos y transformer; difiere solo en tokenizador y embeddings |
| Llama 3.2 1B | 1.24B | 128K | BPE unico, 128K | Llama 3.2 Community License | Ajustado a instrucciones, contexto mucho mayor, licencia no Apache |
| Qwen2.5 1.5B | 1.54B | 32K | BPE unico | Apache 2.0 | Multilingue, disponible en base e instruct |

La comparacion directa mas relevante es con MoTo 1B, ya que comparte arquitectura y datos y solo cambia el tokenizador. Frente a Llama 3.2 1B y Qwen2.5 1.5B, este modelo ofrece una licencia permisiva y un diseno experimental reproducible, pero carece de contexto largo y de ajuste a instrucciones. No se dispone de cifras de rendimiento comparadas en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones ni de seguridad: no debe usarse directamente en produccion orientada a usuarios sin un fine-tuning y un filtrado posteriores.
- Riesgo elevado de alucinacion y de generar contenido sesgado u ofensivo, heredado de FineWeb-Edu y FineWeb2-HQ, sin mitigacion documentada.
- Contexto limitado a 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura desigual entre los 21 idiomas: aunque el tokenizador se equilibra en FLORES-200, la mezcla de datos asigna el 40% al ingles y el resto se reparte entre 20 idiomas, por lo que los idiomas de bajos recursos estaran peor representados.
- No hay token de padding: para inferencia por lotes es necesario asignar `pad_token = eos_token` y rellenar por la izquierda.
- No se publican checkpoints cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos con poca VRAM sin conversion manual.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo base sin garantias de calidad, el uso comercial requiere validacion propia.
- El identificador del autor en Hugging Face (`r-three-moto`) difiere del enlace a MoTo (`r3-moto`) en la model card; conviene verificar el repositorio correcto antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/r-three-moto/moto-1b-baseline-parity-aware-bpe
- Modelo MoTo 1B (variante con mezcla de tokenizadores): https://huggingface.co/r3-moto/moto-1b
- Paper MoTo (NeurIPS 2026): https://openreview.net/forum?id=avjeUhPuC6
- Preprint en arXiv: https://arxiv.org/abs/2611.11027
- Codigo: https://github.com/r-three/moto
- Herramienta de entrenamiento lingua: https://github.com/r-three/lingua/tree/lingua
- Todos los modelos del release: https://huggingface.co/r3-moto
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb2-HQ: https://huggingface.co/datasets/epfml/FineWeb2-HQ
- Tokenizador Parity-Aware BPE (referencia): https://huggingface.co/flexitok/parity-aware-bpe-devset
