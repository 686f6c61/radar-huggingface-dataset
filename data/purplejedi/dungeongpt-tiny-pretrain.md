# purplejedi/dungeongpt-tiny-pretrain

## Resumen

DungeonGPT Tiny Pretrain es un modelo de lenguaje causal de tipo GPT-2 entrenado desde cero en PyTorch por el autor independiente purplejedi. Se trata de un checkpoint experimental de muy pequeno tamano (4,27 millones de parametros) especializado en la generacion de fichas de escenas de rol de mesa (tabletop RPG). El modelo forma parte del proyecto DungeonGPT, cuyo repositorio fuente es `sriramrathinavelu/DungeonGPT`, y corresponde a la fase de preentrenamiento (Experimento 01) previa a un ajuste supervisado posterior.

El modelo resuelve un problema acotado: generar texto con la estructura y el vocabulario caracteristicos de las fichas de escena de juegos de rol, usando como corpus el dataset sintetico `CJJones/RPG_Scenes_LLM_Synthetic`. No esta disenado como un asistente general ni como un modelo instruccional, sino como base educativa y punto de partida para experimentos de fine-tuning.

Su relevancia es principalmente didactica y de investigacion: demuestra un pipeline completo de tokenizacion BPE personalizada, entrenamiento causal desde cero, evaluacion con perplejidad y publicacion reproducible (con SHA de commit, semilla y run de Weights & Biases). Su contexto de 256 tokens y su vocabulario de 4089 tokens lo situan en la categoria de modelos juguete, utiles para prototipado rapido y docencia, no para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal Pre-LN estilo GPT-2, con embeddings atados (tied embeddings) |
| Parametros totales | 4.268.800 (todos entrenables) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch (`.pt`), tokenizer en `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un decoder causal Pre-LN de 4 capas, 4 cabezas de atencion, dimension de embedding de 256 y vocabulario de 4089 tokens, con embeddings de entrada y salida atados. La clase de implementacion es `dungeongpt.models.tiny_gpt.DungeonGPT`. El tokenizador es un ByteLevel BPE personalizado que incorpora los tokens especiales `<|scene_start|>` y `<|scene_end|>` para delimitar las fichas de escena.

El entrenamiento se realizo desde cero con prediccion de siguiente token no condicional sobre el dataset `CJJones/RPG_Scenes_LLM_Synthetic`, deduplicado a 2500 escenas y dividido con semilla 42 en 2250 de entrenamiento, 125 de validacion y 125 de prueba (identificador `seed42_90_5_5`). Se procesaron 7.618.560 tokens en 1872 pasos de optimizador, alcanzando la mejor epoca en la 13, con una perdida de entropia cruzada de validacion de 0,3667 y una perplejidad de 1,44. El entrenamiento se ejecuto en una GPU Tesla T4 y los registros estan disponibles en Weights & Biases. No se aplicaron tecnicas de RLHF ni DPO, ni innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto causal autoregresivo condicionada por un prefijo (por ejemplo, `<|scene_start|>` seguido de un campo como `Primary Setting: Haunted Castle`).
- Generacion de fichas de escena de rol de mesa con estructura y vocabulario propios del dominio.
- Continuacion de texto coherente a corto plazo dentro de la ventana de 256 tokens.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Generacion de fichas de escena para partidas de rol: el modelo completa plantillas de escena a partir de un encabezado inicial, util para generar material de juego de forma rapida en herramientas de mesa.
- Prototipado de pipelines de entrenamiento: sirve como modelo de referencia para validar tokenizadores BPE personalizados, bucles de entrenamiento y evaluacion de perplejidad antes de escalar a modelos mayores.
- Docencia y divulgacion: permite mostrar de forma completa y reproducible el ciclo de vida de un modelo causal desde cero, incluida la publicacion de checkpoints y metricas.
- Base para fine-tuning supervisado: el propio autor lo plantea como punto de partida del Experimento 02 (`notebooks/02_sft.ipynb`), con enmascaramiento de perdida en el prompt.
- Generacion de datos sinteticos de dominio: puede producir variaciones de escenas para aumentar un corpus de entrenamiento de modelos mayores.
- Pruebas de infraestructura de inferencia: su tamano minimo permite validar integraciones de carga de checkpoints PyTorch, tokenizacion y generacion en entornos con recursos muy limitados, incluso en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las unicas metricas publicadas son de entrenamiento y validacion:

| Metrica | Valor |
|---|---|
| Mejor epoca | 13 |
| Perdida de entropia cruzada de validacion | 0,3667 |
| Perplejidad de validacion | 1,44 |
| Pasos de optimizador | 1872 |
| Tokens de entrenamiento vistos | 7.618.560 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa; el checkpoint ocupa aproximadamente 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el autor entreno en una Tesla T4.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna e incluso en CPU.
- Opciones de despliegue: carga directa con PyTorch mediante `load_tiny_gpt_checkpoint` y `generate_tiny_gpt` del repositorio fuente; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la informacion proporcionada. A continuacion se comparan caracteristicas estructurales con alternativas de la misma categoria (modelos GPT de juguete entrenados desde cero):

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DungeonGPT Tiny Pretrain | 4,27 M | 256 | MIT | Hugging Face (purplejedi/dungeongpt-tiny-pretrain) |
| GPT-2 small | 124 M | 1024 | MIT | Hugging Face (openai-community/gpt2) |
| nanoGPT (implementacion de referencia) | configurable | configurable | MIT | GitHub (karpathy/nanoGPT) |

La comparativa de rendimiento frente a estas alternativas no esta disponible.

## Limitaciones y advertencias

- Entrenado unicamente con prediccion de siguiente token no condicional: no sigue instrucciones arbitrarias de forma fiable.
- No mantiene consistencia factual estricta entre los encabezados de las fichas y la prosa generada.
- Ventana de contexto muy reducida (256 tokens), lo que limita la coherencia a medio plazo.
- Vocabulario de solo 4089 tokens, restringido al dominio de escenas de rol.
- Solo soporta ingles.
- Riesgo elevado de alucinacion y de deriva tematica fuera de su dominio de entrenamiento.
- No apto para uso en produccion como asistente general; el propio autor lo define como checkpoint base educativo.
- Licencia MIT: permite uso comercial, pero sin garantias de calidad ni de idoneidad para tareas fuera de su ambito.
- Sesgos conocidos: no documentados en la informacion disponible; al derivar de un dataset sintetico, puede heredar los sesgos de su generador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/purplejedi/dungeongpt-tiny-pretrain
- Repositorio fuente: https://github.com/sriramrathinavelu/DungeonGPT
- Notebook de preentrenamiento: `notebooks/01_pretraining.ipynb` (en el repositorio fuente)
- Notebook de fine-tuning (Experimento 02): `notebooks/02_sft.ipynb` (en el repositorio fuente)
- Dataset: https://huggingface.co/datasets/CJJones/RPG_Scenes_LLM_Synthetic
- Run de Weights & Biases: https://wandb.ai/chillyskywalker/dungeongpt/runs/cywyjr84
- Commit de referencia: `a8acfb1fc821dfe6d51eae2c0e3774f64e384702`
