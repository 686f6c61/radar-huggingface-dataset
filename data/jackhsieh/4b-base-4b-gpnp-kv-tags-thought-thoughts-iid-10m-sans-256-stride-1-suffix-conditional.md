# JackHsieh/4B-base.4B-gpnp-kv-tags-thought-thoughts.iid-10M-sans-256.stride-1.suffix-conditional

## Resumen

`JackHsieh/4B-base.4B-gpnp-kv-tags-thought-thoughts.iid-10M-sans-256.stride-1.suffix-conditional` es un modelo de lenguaje derivado de Qwen/Qwen3-4B-Base mediante un proceso de continued pretraining (CPT) orientado a la generacion de "pensamientos" (thoughts) prepuestos a cada fragmento de documento. Lo desarrolla el usuario de Hugging Face JackHsieh, dentro de un proyecto de investigacion denominado `prestar`, centrado en el estudio de chain-of-thought latente y notas contextuales durante el preentrenamiento. El modelo no es un asistente conversacional: es un artefacto de investigacion que incorpora un formato especifico de anotacion (`<|note|>...<|/note|>`) en los datos de entrenamiento.

El problema que aborda es la incorporacion de contexto predictivo explicito en el preentrenamiento: cada chunk de 8 tokens de cada documento de entrenamiento va precedido por una nota generada por un modelo Qwen3-4B en modo no-thinking, que describe los proximos 8 tokens. Asi, el modelo aprende a condicionar la prediccion del sufijo en funcion de esa nota, con una tasa de solapamiento de stride 1 (r_train = 511/512). El resultado, segun la model card, es practicamente indistinguible del paso sin pensamiento en terminos de NLL (1,2268 frente a 1,2267, win rate del 50,4%), lo que sugiere que el condicionamiento por nota no aporta ganancia medible en este regimen.

Arquitectonicamente hereda la estructura transformer de Qwen3-4B-Base, con 4.022.468.096 parametros totales y pesos exportados en fp32 sin casting. El contexto y los idiomas no se detallan en la model card; el entrenamiento se circunscribe a documentos LaTeX de arXiv del area stat.ML, por lo que su dominio efectivo es muy estrecho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3-4B-Base) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con documentos de 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible (entrenamiento sobre LaTeX de arXiv stat.ML) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fp32, exportado sin casting) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B-Base, un transformer denso de 4B parametros, y se somete a continued pretraining sobre el dataset `JackHsieh/statML-arxiv-iid-160M-20M`, concretamente sobre `train[:2176]` (2.176 documentos de 4.096 tokens cada uno), con un 10% de replay procedente de `JackHsieh/dclm-replay.seq-4096.tokens-32B` y reordenacion aleatoria del orden principal en cada epoca. El entrenamiento se ejecuta con FSDP2 full-shard, pesos maestros en fp32, computo en bf16, flash-attention-2 y 8 GPU H100. La optimizacion usa AdamW con lr 3e-06 (β 0,9/0,95, ε 1e-08, weight decay 0,01), schedule coseno con 5% de warmup hasta 0, grad clip 1,0, batch de 32 documentos, 2 epocas (152 pasos) y semilla 0.

La innovacion tecnica central es el condicionamiento por "thoughts": cada chunk de 8 tokens de cada documento va precedido por una nota con formato `<|note|>\nKEY:{los 8 tokens previos}\nTHOUGHT:{nota}\n<|/note|>`, donde la nota es la salida de un Qwen3-4B en modo no-thinking con el prompt `general-paragraph-nothink-prefill` y la respuesta prefijada con "The text", limitada a 512 tokens (con notas recortadas conservadas) y `max_thought_length` 576. Se usa una de las dos notas por chunk disponibles por epoca. El condicionamiento es de sufijo: todos los chunks no iniciales de 8 tokens de cada documento son "thoughtful" (stride=1, k=8), y la evaluacion se realiza sobre la rejilla de test iid stride-32 (r_val = 15/512). El tokenizer incorpora dos tokens anadidos: `<|note|>` = 151669 y `<|/note|>` = 151670, con inicializacion gaussiana diagonal.

## Capacidades

- Generacion de texto autoregresiva sobre dominio LaTeX/cientifico (stat.ML), heredada de Qwen3-4B-Base.
- Condicionamiento por notas contextuales: acepta el formato `<|note|>...<|/note|>` como prefijo para predecir el chunk siguiente.
- Razonamiento latente tipo chain-of-thought a traves de las notas prepuestas durante el preentrenamiento.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni multi-step reasoning mas alla del condicionamiento por nota.
- Capacidades multilingues: no disponibles; el entrenamiento se limita a LaTeX de arXiv stat.ML.
- No se documenta vision, audio ni modo thinking explicito en la model card.

## Casos de uso

- Investigacion sobre chain-of-thought latente: el modelo sirve como banco de pruebas para estudiar si las notas contextuales prepuestas mejoran la prediccion del sufijo, dado que la model card reporta win rate del 50,4% y NLL practicamente identica entre pasada con y sin pensamiento.
- Experimentos de RL sobre el conjunto retenido: los documentos `train[2176:2432]` quedan fuera del entrenamiento y se reservan explicitamente para RL contra este modelo, lo que permite evaluar politicas de generacion sobre datos no vistos.
- Estudio de formatos de anotacion en CPT: util para comparar el esquema `<|note|>KEY/THOUGHT<|/note|>` frente a otras formas de inyectar contexto explicito en el preentrenamiento.
- Analisis de eficiencia de condicionamiento: al ser un modelo de 4B con pesos fp32 y 152 pasos de entrenamiento, permite reproducir el pipeline completo en 8 H100 y medir el coste del condicionamiento por nota.
- Generacion de texto cientifico en LaTeX (stat.ML): uso limitado a continuaciones de documentos del dominio, sin garantias fuera de el.
- Baseline para comparativas de CPT: sirve como referencia controlada (mismo base, mismos datos, mismos hiperparametros) frente a variantes con y sin thoughts.
- Fine-tuning posterior sobre tareas de razonamiento matematico o estadistico, partiendo de un modelo ya expuesto a notacion LaTeX y vocabulario arXiv.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| NLL/token con pensamiento (step 152, iid stride-32) | 1,2268 |
| NLL/token sin pensamiento sobre chunks thoughtful | 1,2267 |
| Win rate (thoughtful vs thoughtless) | 50,4% |
| NLL hibrida all-chunk | 1,2482 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 16 GB solo para pesos (4.022.468.096 parametros × 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en bf16: aproximadamente 8 GB para pesos, mas overhead; requiere conversion explicita desde fp32.
- GPU recomendadas: H100 (usada en el entrenamiento, 8 unidades), A100 80 GB para inferencia holgada en fp32.
- Cabe en GPU consumer: si se convierte a bf16 o se cuantiza a 8/4 bits, podria caber en RTX 4090 (24 GB) e incluso en GPUs de 16 GB con cuantizacion agresiva; no se documentan pesos GGUF ni cuantizaciones publicadas.
- Opciones de despliegue: no se documentan en la model card; al ser safetensors fp32 compatible con transformers, es desplegable con vLLM, TGI o llama.cpp previa conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (JackHsieh) | 4,02B | no disponible (docs de 4096 tokens) | apache-2.0 | CPT sobre stat.ML arXiv con thoughts prepuestos; NLL 1,2268 |
| Qwen/Qwen3-4B-Base | 4B (aprox.) | no disponible | apache-2.0 | Modelo base original; sin condicionamiento por notas |
| Qwen/Qwen3-4B | 4B (aprox.) | no disponible | apache-2.0 | Version instruct/thinking de la familia Qwen3 |
| JackHsieh/4B-general-paragraph-nothink-prefill... (generador de thoughts) | 4B (aprox.) | no disponible | no disponible | Modelo usado para generar las notas de entrenamiento |

La comparativa se limita a la familia Qwen3-4B por ser el base declarado; no se dispone de datos de rendimiento de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo es un artefacto de investigacion, no un asistente: no se ha alineado con RLHF/DPO ni se documenta instruccion-following.
- Dominio muy estrecho: solo LaTeX de arXiv stat.ML; el rendimiento fuera de ese dominio no esta caracterizado.
- El condicionamiento por nota no aporta ganancia medible segun la propia model card (win rate 50,4%, NLL 1,2268 vs 1,2267), por lo que su utilidad practica es cuestionable.
- Riesgo de alucinacion alto en generacion libre, sin datos de evaluacion al respecto.
- Sesgos conocidos: no documentados; el corpus arXiv stat.ML introduce sesgos de dominio, estilo y jerga academica.
- Idiomas: no disponible; el entrenamiento es esencialmente en ingles cientifico.
- Licencia apache-2.0 permite uso comercial, pero el modelo hereda las condiciones del base Qwen3-4B-Base y no esta validado para produccion.
- Pesos en fp32 (16,1 GB de repo): requiere conversion a bf16 o cuantizacion para despliegue eficiente.
- Tokenizer modificado con dos tokens anadidos (`<|note|>`, `<|/note|>`); hay que usar el tokenizer del repo, no el original de Qwen3.
- Entrenamiento muy corto (152 pasos, 2 epocas, 2.176 documentos): riesgo de sobreajuste al subconjunto y de catastrophic forgetting respecto al base.
- El conjunto retenido `train[2176:2432]` esta reservado para RL; usarlo para evaluacion sin tenerlo en cuenta invalida comparaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JackHsieh/4B-base.4B-gpnp-kv-tags-thought-thoughts.iid-10M-sans-256.stride-1.suffix-conditional
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/JackHsieh/statML-arxiv-iid-160M-20M
- Dataset de thoughts: https://huggingface.co/datasets/JackHsieh/4B-general-paragraph-nothink-prefill.k-8.statml-arxiv-iid.qwen3-ids.kv-tags-thought
- Dataset de replay: https://huggingface.co/datasets/JackHsieh/dclm-replay.seq-4096.tokens-32B
- Run de Weights & Biases: https://wandb.ai/latent-thoughts/prestar/runs/v935dgfm
