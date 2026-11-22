# Meridian21Lab/catalogue-150m-11.5bt

## Resumen

catalogue-150m-11.5bt es un modelo de lenguaje base de tipo decoder-only en ingles, desarrollado por Meridian21Lab dentro del proyecto MrCogito, que explora arquitecturas de compresion de contexto largo. Con 145.607.232 parametros y entrenado desde cero sobre 11.5B tokens de datos publicos con un presupuesto de aproximadamente 360 dolares, el modelo esta disenado para leer documentos de hasta 64k tokens mediante un mecanismo propio denominado "catalogue".

La innovacion central es la capa de lectura: mientras procesa el texto, un pequeno escritor aprendido archiva cada pagina de 256 tokens en 64 tarjetas de indice (unos cuatro tokens por tarjeta). Para predecir cada siguiente palabra, el modelo compara su estado con las tarjetas de todas las paginas anteriores, selecciona las mas relevantes y relee sus tokens literalmente. Las tarjetas solo deciden que releer; el modelo nunca lee un resumen en su lugar. Una senal de entrenamiento separada ensena al escritor a apuntar donde la atencion del modelo realmente recae.

El modelo es relevante porque demuestra que un presupuesto de entrenamiento modesto (11.5B tokens) puede superar a modelos como Pythia-160M entrenado con 300B tokens en tareas de gramatica y ciencia, y porque ofrece lectura de contexto largo (64k) con un coste computacional bajo. Se publica como modelo base de investigacion, sin ajuste de instrucciones, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capa de lectura "catalogue" (perceiver_ar) |
| Parametros totales | 145.607.232 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64k tokens (entrenamiento); gana con contexto lejano hasta 61k |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 145.6M de parametros con una capa de lectura alternativa denominada "catalogue". En lugar de atencion completa sobre todos los tokens anteriores, el modelo mantiene un indice de 64 tarjetas por pagina de 256 tokens (aproximadamente 4 tokens por tarjeta). Para cada prediccion, compara su estado con las tarjetas de todas las paginas previas, recupera las mas relevantes y relee los tokens correspondientes palabra por palabra. Un escritor aprendido, entrenado con una senal separada, aprende a colocar la informacion en las tarjetas de modo que apunten a donde la atencion del modelo realmente se dirige. Esto permite escalar a contextos de 64k tokens con un coste de memoria y computo muy inferior al de la atencion completa.

El entrenamiento se realizo desde cero sobre 11.5B tokens con un presupuesto de aproximadamente 360 dolares. Los datos provienen de un conjunto diverso de fuentes publicas: Nemotron-CC-v2, Nemotron-CC-Math-v1, Nemotron-Pretraining-Specialized-v1, dclm-edu, stackv2_edu_filtered, project_gutenberg_filtered, arxiv_papers_filtered, doab_filtered, usgpo_filtered, uk_hansard_filtered, dolma3_longmino_pool y smol-smoltalk. No se menciona RLHF ni DPO; es un modelo base sin ajuste de instrucciones. El modelo forma parte de una familia de cuatro variantes entrenadas con los mismos datos, orden, presupuesto y capas, cambiando solo la capa de lectura: concept-memory, topic-index (Latent Sparse Attention), catalogue (este modelo) y full-attention (referencia con atencion completa).

## Capacidades

- Generacion de texto en ingles: modelo base capaz de continuar texto y modelar lenguaje de forma general.
- Razonamiento gramatical: 80.64% de precision en BLiMP (67 conjuntos, 0-shot), superior a SmolLM2-135M (80.15%).
- Conocimiento cientifico basico: 50.42% en ARC-Easy (0-shot).
- Modelado de lenguaje: perplejidad de 1.954 (byte perplexity) en WikiText-2.
- Lectura de contexto largo: procesa documentos de hasta 64k tokens y sigue ganando con contexto lejano hasta 61k tokens.
- Recuperacion de hechos en texto largo: RULER a 8k con puntuacion 0.41; un unico hecho oculto en texto de relleno se encuentra en el 99-100% de los prompts hasta 32k tokens.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo thinking (es un modelo base).
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Investigacion en arquitecturas de contexto largo: el modelo sirve como referencia para estudiar mecanismos de compresion de contexto (catalogue, concept-memory, topic-index) frente a atencion completa, ya que se publican cuatro variantes con los mismos datos y presupuesto.
- Clasificacion y analisis de documentos largos: con 64k tokens de contexto y bajo coste, puede procesar articulos, informes o expedientes completos para tareas de modelado de lenguaje y extraccion de caracteristicas.
- Generacion de texto asistida en ingles: al ser un modelo base, puede usarse para continuacion de texto, generacion de borradores y experimentacion en pipelines de NLP donde no se requiera instruccion explicita.
- Recuperacion de hechos en texto extenso: su capacidad RULER (0.41 a 8k, hechos unicos encontrados en 99-100% hasta 32k) lo hace util para prototipos de question answering sobre documentos largos.
- Educacion e investigacion con presupuesto limitado: entrenado por unos 360 dolares, es un caso de estudio para laboratorios con recursos escasos que quieran reproducir o extender el enfoque.
- Evaluacion comparativa de modelos pequenos: su posicion 21 de 101 en Tiny-ML Leaderboard lo convierte en un baseline util para comparar modelos de hasta 150M parametros en gramatica, ciencia y texto de Wikipedia.
- Despliegue en entornos con recursos limitados: con 145.6M de parametros y pesos en safetensors de 0.6 GB, puede ejecutarse en CPU o GPU consumer para experimentacion.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| BLiMP (67 conjuntos, 0-shot) | accuracy (%) | 80.64 |
| ARC-Easy (0-shot, test) | accuracy (%) | 50.42 |
| WikiText-2 | byte perplexity (menor es mejor) | 1.954 |

Comparativas declaradas por el autor:

| Modelo | BLiMP (%) | ARC-Easy (%) | Bits por byte (64k) | RULER 8k |
|---|---|---|---|---|
| catalogue-150m-11.5bt | 80.64 | 50.42 | 0.808 | 0.41 |
| SmolLM2-135M (final) | 80.15 | no disponible | 0.832 | 0.30 |
| Pythia-160M | 2.4-2.7 puntos menos | 7.7-7.8 puntos menos | 0.942 | no disponible |
| Gemma 3 270M | no disponible | no disponible | 0.805 | 0.33 |
| LFM2.5-350M-Base | no disponible | no disponible | no disponible | 0.42 |

El autor indica que el modelo ocupa el puesto 21 de 101 en Tiny-ML Leaderboard (13 por calidad pura, 8 en gramatica) y que, de las 55 entradas entrenadas con 15B tokens o menos, solo dos quedan por encima.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 145.6M de parametros, en FP16 requiere aproximadamente 0.3 GB de pesos; en cuantizacion de 8 bits unos 0.15 GB y en 4 bits unos 0.08 GB (estimacion a partir del numero de parametros; no se publican cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es suficiente; tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1-2 GB de VRAM libre, e incluso en CPU.
- Opciones de despliegue: transformers (libreria oficial, con custom_code); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.
- Tamano del repositorio: 0.6 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | BLiMP (%) | ARC-Easy (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| catalogue-150m-11.5bt | 145.6M | 64k | 80.64 | 50.42 | Apache 2.0 | Hugging Face |
| SmolLM2-135M | 135M | no disponible | 80.15 | no disponible | no disponible | Hugging Face |
| Pythia-160M | 160M | no disponible | inferior en 2.4-2.7 puntos | inferior en 7.7-7.8 puntos | no disponible | Hugging Face |
| Gemma 3 270M | 270M | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Es un modelo base sin ajuste de instrucciones: no sigue instrucciones de forma fiable ni esta alineado para conversacion; requiere fine-tuning o prompting especifico para tareas.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Entrenado con una sola semilla y publicado como release de investigacion; la variabilidad entre semillas no esta documentada.
- Riesgo de alucinacion y sesgos presente, como en cualquier modelo de lenguaje entrenado con datos web y publicos; no se documentan evaluaciones de sesgo.
- No dispone de tool calling, function calling, agentes, vision ni audio.
- No se han publicado cuantizaciones oficiales (GGUF, etc.), lo que puede limitar el despliegue en herramientas como llama.cpp u Ollama.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo base sin alineacion, el uso en produccion requiere validacion adicional.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Meridian21Lab/catalogue-150m-11.5bt
- Pagina del proyecto: https://ai.ksopyla.com/projects/concept-reasoning/
- Codigo: https://github.com/ksopyla/MrCogito/tree/c34ba562
- Detalles de evaluacion: EVALUATION.md (en el repositorio del modelo)
- Entrenamiento en W&B: https://wandb.ai/ksopyla/MrCogito/runs/perceiver_ar_perceiver_H896L3g1s9N128_20261119_221618_catalogue_reuse_n4_m120t_long
- Modelo hermano concept-memory-140m-11.5bt: https://huggingface.co/Meridian21Lab/concept-memory-140m-11.5bt
- Modelo hermano topic-index-140m-11.5bt: https://huggingface.co/Meridian21Lab/topic-index-140m-11.5bt
- Modelo hermano full-attention-140m-11.5bt: https://huggingface.co/Meridian21Lab/full-attention-140m-11.5bt
