# siddharthmb/2026.TA.gemma2_2b_headline_2026-10e_tc8192_decb_l1w0.001_auxk512_ctr_fp32_tarbb_lb2_sl17862630

## Resumen

Este repositorio contiene un adaptador transcoder disperso (sparse transcoder adapter) construido sobre google/gemma-2-2b, desarrollado por siddharthmb (Siddharth M. Bhatia, Stanford). No es un modelo de lenguaje autónomo, sino una rama ReLU `dec(relu(enc(x)))` insertada en cada bloque MLP del modelo base, que permanece congelado. La rama se entrena en modo bridging para que la combinación base + rama reproduzca el comportamiento de google/gemma-2-2b-it, de forma que el ajuste fino queda codificado en features dispersas e inspeccionables en lugar de en pesos densos.

El interés del artefacto es metodológico: propone una vía para "differenciar" modelos emparejados (base frente a instruct) mediante adaptadores sparse que se pueden analizar feature a feature, con soporte para steering por identificador cantor y para la construcción de grafos de atribución. Forma parte del programa de investigación Transcoder Adapters, descrito en el paper arXiv:2602.20904 y con código público en el repositorio transcoder-adapters.

Técnicamente, el checkpoint ocupa 3.596.141.824 parámetros según los safetensors del repositorio (9,2 GB de repo) e incorpora el modelo base junto con la rama transcoder de 8192 features y sesgo de decodificador. El entrenamiento se realizó en un único epoch sobre splits de LMSYS-Chat-1M, con pérdida KL frente al modelo de referencia y una combinación ponderada de términos de adaptación, bridging y NMSE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 2 (transformer decoder-only) con rama transcoder ReLU dispersa superpuesta en cada MLP; modelo base congelado |
| Parametros totales | 3.596.141.824 (~3,6 B), segun los safetensors del repositorio (incluye base y rama adaptadora) |
| Longitud de contexto | 8192 tokens (heredada de google/gemma-2-2b; no se explicita en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no declarada en la model card ni en los metadatos del repositorio) |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | google/gemma-2-2b |
| Modelo de referencia | google/gemma-2-2b-it |
| Tokenizer | google/gemma-2-2b-it |
| Features del transcoder (n_features) | 8192 |
| Modo de entrenamiento | bridging |
| Tamano del repositorio | 9,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es Gemma 2 en su variante de 2B, un transformer decoder-only. Sobre ella se añade, en cada bloque MLP del modelo congelado, una rama transcoder con estructura `dec(relu(enc(x)))`: un encoder que proyecta la activación del MLP a un espacio disperso de 8192 features, una no linealidad ReLU y un decoder que reconstruye la salida. El decoder lleva sesgo (`dec_bias: True`) y la rama se guarda en fp32, según el propio nombre del run (`ctr_fp32`). La base permanece intacta; el ajuste fino vive exclusivamente en las features de la rama, lo que hace el comportamiento aprendido localizable y manipulable.

El entrenamiento se ejecutó con el pipeline `training.train` del repositorio transcoder-adapters en un job Slurm (17862630) sobre `jagupard39.stanford.edu`, iniciado el 2026-10-14. Los hiperparámetros declarados son: 1 epoch, batch size 4, learning rate 0,0008, warmup ratio 0,05, `l1_weight` 0,001, `lambda_adapt` 1,0, `lambda_bridge` 2,0, `lambda_nmse` 1, `n_cutoffs` 1 y `backbone: target`. La pérdida es de tipo KL contra google/gemma-2-2b-it, con un término de bridging que fuerza a que base + rama imite al modelo instruct, y un término auxiliar (denotado `auxk512` en el nombre del run) para mantener utilizadas las features. Los datos proceden del dataset `siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits`, derivado de LMSYS-Chat-1M. La innovación destacable no es la arquitectura del transformer, sino el esquema de adaptación dispersa orientado a interpretabilidad y comparación de modelos.

## Capacidades

- Generación de texto conversacional: al entrenarse en modo bridging contra gemma-2-2b-it, el conjunto base + rama reproduce el comportamiento del modelo instruct en las posiciones donde el base difiere de la referencia.
- Modelado de lenguaje estándar: conserva las capacidades del gemma-2-2b congelado (atención, embeddings y representaciones originales).
- Interpretabilidad mecanicista: expone 8192 features dispersas por MLP que actúan como unidad de análisis del ajuste fino.
- Steering de features: permite amplificar o atenuar una feature concreta mediante su cantor id (`--steer CANTOR_ID:STRENGTH`).
- Generación de grafos de atribución: soporta el modo `analysis.attribution.graphs.build_graphs`, con integración de GemmaScope y control de presupuesto.
- Modo híbrido: la llamada `set_transcoders_enabled(False)` desactiva la rama y deja el modelo híbrido (MLPs base con atención y embeddings del modelo de referencia).
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentado.
- Visión, audio o modo thinking: no documentado.

## Casos de uso

- Investigación en interpretabilidad comparada: usar el adaptador para localizar qué features del MLP cambian entre gemma-2-2b y gemma-2-2b-it, analizando una a una las 8192 features por capa en lugar de comparar pesos densos.
- Diffing de modelos emparejados: reproducir el pipeline sobre otros pares base/instruct para aislar las direcciones que implementan el ajuste conversacional con una métrica objetiva (KL y acuerdo top-1 frente a la referencia).
- Auditoría de comportamiento: examinar features concretas asociadas a conductas indeseadas mediante steering (`--steer CANTOR_ID:STRENGTH`) y comprobar si su atenuación elimina el comportamiento sin degradar el resto.
- Construcción de grafos de atribución: alimentar la herramienta de grafos del repositorio para trazar qué componentes contribuyen a una predicción concreta, útil en estudios de circuitos y análisis causal.
- Docencia y formación en seguridad de IA: emplear el modelo como caso práctico de adaptación dispersa, con un checkpoint pequeño (9,2 GB de repo) que cabe en un único nodo con GPU.
- Extracción de features para clasificadores auxiliares: reutilizar las 8192 activaciones dispersas por MLP como representación interpretable de entrada a sondas lineales o detectores de toxicidad.
- Reproducción de experimentos: el repositorio incluye `train_config.yaml`, por lo que un grupo puede relanzar el entrenamiento con `uv run python -m training.train --config train_config.yaml` y comparar resultados bajo la misma configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni equivalentes). Las únicas métricas publicadas son las de fidelidad del adaptador frente al modelo de referencia sobre filas reservadas del split de LMSYS-Chat-1M:

| Metrica | Valor |
|---|---|
| kl_mean | 0,12869855761528015 |
| kl_mean_interesting | 0,232343 |
| top1_agreement | 0,870381 |
| top1_agreement_interesting | 0,725292 |
| n_samples | 200 |
| n_tokens | 34.100 |
| n_interesting | 15.471 |
| Benchmark evaluado | lmsys_chat (per_benchmark/lmsys_chat) |

Las variantes `*_interesting` restringen el cálculo a las posiciones en las que el modelo base y el de referencia discrepan, es decir, aquellas en las que la rama debe aportar el ajuste. Según el autor, un KL más bajo y un acuerdo top-1 más alto indican una mejor reproducción del ajuste fino.

## Requisitos de hardware

- VRAM estimada para inferencia del checkpoint completo (3,6 B parámetros): en bf16/fp16, en torno a 7-8 GB; en int8, en torno a 4 GB; en int4, en torno a 2 GB. Son estimaciones propias, no datos publicados por el autor.
- La rama transcoder se almacena en fp32 (`ctr_fp32` en el nombre del run), lo que puede elevar el consumo respecto a un modelo denso equivalente cargado en precisión reducida.
- GPU recomendadas: A100 40/80 GB y H100 para entrenamiento o evaluación a gran escala; RTX 4090 o RTX 3090 (24 GB) para inferencia e inspección local sin cuantizar.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090/3090 (24 GB) sin cuantizar y en GPUs de 8-16 GB si se aplica cuantización, aunque no se documentan recetas de cuantización para este checkpoint.
- Opciones de despliegue: la model card solo documenta el uso mediante las clases propias del repositorio (`models.auto.load_tokenizer` y `models.auto.load_transcoder_model`) sobre transformers, más la CLI de chat `analysis.chat.cli`. El repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`, pero no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ni existen pesos GGUF publicados.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de latencia por petición.
- Almacenamiento: 9,2 GB de repositorio, además del espacio necesario para el dataset de entrenamiento si se va a reproducir el run.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|---|
| Este adaptador (2026.TA.gemma2_2b_headline_2026-10e) | Adaptador transcoder sparse sobre gemma-2-2b | 3,6 B (checkpoint completo) | no disponible | no disponible | Investigacion: replicar el ajuste instruct de forma sparse e inspeccionable |
| google/gemma-2-2b | LLM base (decoder-only) | no disponible | no disponible | no disponible | Modelo base congelado sobre el que se entrena la rama |
| google/gemma-2-2b-it | LLM instruct (decoder-only) | no disponible | no disponible | no disponible | Modelo de referencia cuya distribucion se imita |
| 2026.TA.gemma2_2b_headline_2026-10d_tc8192_decb_l1w0.001_auxk512_fp32_tarbb_lb2_ln1 | Adaptador transcoder sparse (variante anterior, mismo autor) | no disponible | no disponible | no disponible | Mismo objetivo con configuracion de entrenamiento distinta |

No se dispone de un benchmark comun que permita comparar rendimiento entre estas variantes; la unica metrica compartida seria el KL frente al modelo de referencia, que solo esta publicado para este checkpoint.

## Limitaciones y advertencias

- No es un modelo autónomo: la model card exige clases propias (`models.auto`) para cargarlo. Un `AutoModelForCausalLM` estándar de transformers no funcionará con este checkpoint.
- Licencia no declarada: ni la model card ni los metadatos indican términos de uso. Al derivar de google/gemma-2-2b, el uso comercial queda condicionado por los términos de la familia Gemma, pero esto no está confirmado en la información proporcionada. Verificar antes de cualquier despliegue en producción.
- Idiomas soportados no declarados: aunque el modelo base es multilingüe, no hay confirmación de que la rama transcoder preserve el comportamiento del instruct en idiomas distintos del inglés, dado que el entrenamiento usa LMSYS-Chat-1M.
- Riesgo de alucinación: inherente al modelo base y al modelo de referencia; el adaptador no incorpora mecanismos de verificación factual.
- Fidelidad imperfecta: el acuerdo top-1 del 87,04 % global y del 72,53 % en posiciones "interesantes" implica que la rama no reproduce por completo el comportamiento del instruct, especialmente donde más importa.
- Sesgos: el entrenamiento sobre LMSYS-Chat-1M puede heredar sesgos de distribución demográfica y temática de ese corpus conversacional; no se documenta ningún proceso de mitigación.
- Sin datos de seguridad: no hay evaluación de toxicidad, sesgo, jailbreak o red-teaming publicada para este checkpoint.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el artefacto.
- Métricas de evaluación limitadas: la validación se hizo con 200 muestras y 34.100 tokens de un único benchmark (lmsys_chat), por lo que la significación estadística es baja.
- Sin cuantizaciones publicadas: no hay GGUF, AWQ ni GPTQ, lo que limita el despliegue en entornos de bajos recursos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siddharthmb/2026.TA.gemma2_2b_headline_2026-10e_tc8192_decb_l1w0.001_auxk512_ctr_fp32_tarbb_lb2_sl17862630
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Modelo de referencia y tokenizer: https://huggingface.co/google/gemma-2-2b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits
- Paper "Transcoder Adapters for Reasoning-Model Diffing": https://arxiv.org/abs/2602.20904
- Pagina del proyecto: https://transcoder-adapters.github.io/
- Codigo fuente: https://github.com/Sid-MB/transcoder-adapters
- Run de Weights & Biases: https://wandb.ai/siddharth-stanford/sparse-adaptation/runs/a37fapmu
- Configuracion de entrenamiento: train_config.yaml (adjunto en el repositorio de HuggingFace)
- Variante anterior del mismo autor (2026-10d): https://huggingface.co/siddharthmb/2026.TA.gemma2_2b_headline_2026-10d_tc8192_decb_l1w0.001_auxk512_fp32_tarbb_lb2_ln1_sl17824146
- Repositorio de referencia de Gemma (Google DeepMind): https://github.com/google-deepmind/gemma
