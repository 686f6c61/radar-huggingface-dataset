# francesca9805/eus-latn-100mb-ppt-Dp-100mb-packed-bfd_seed3407

## Resumen

El modelo `francesca9805/eus-latn-100mb-ppt-Dp-100mb-packed-bfd_seed3407` es un ajuste fino supervisado (SFT) del modelo base `goldfish-models/eus_latn_100mb`, desarrollado por el usuario de HuggingFace francesca9805. Se trata de un modelo de generacion de texto de pequeno tamano, con 124.770.816 parametros (aproximadamente 124,8 millones), construido sobre una arquitectura de tipo GPT-2 y entrenado con la libreria TRL (Transformer Reinforcement Learning) de HuggingFace. Su tamano reducido lo situa en la categoria de modelos "small", orientados a experimentacion academica mas que a despliegues de produccion.

El identificador del modelo apunta a un experimento sobre euskera (el sufijo `eus_latn` hace referencia al euskera en escritura latina) y a un corpus de aproximadamente 100 MB, con variantes que aluden a tareas de tipo Dyck (lenguajes formales) y a un empaquetado de datos concreto (`packed-bfd`) y una semilla fija (`seed3407`). Esta nomenclatura es caracteristica de los experimentos de investigacion sobre tokenizacion y aprendizaje de estructuras formales realizados en torno a la familia `goldfish-models`.

Su relevancia es limitada fuera del ambito de la investigacion: no dispone de model card detallada, no publica resultados de benchmarks ni especifica licencia, idiomas o longitud de contexto de forma explicita. Resulta util como punto de partida reproducible para estudiar el efecto del ajuste fino SFT sobre modelos pequenos multilingues y de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only; segun los tags del repositorio) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la arquitectura GPT-2 base suele emplear 1024 tokens, sin confirmar en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el identificador `eus_latn` sugiere euskera en escritura latina) |
| Licencia | no disponible (la model card indica `licence: license` sin concretar terminos) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,3 GB |
| Modelo base | goldfish-models/eus_latn_100mb |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL 0.23.0 |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia GPT-2, tal como indican los tags del repositorio (`gpt2`, `transformers`). Con 124.770.816 parametros, el modelo encaja en el rango de GPT-2 small (124M), lo que implica un coste computacional muy bajo tanto en entrenamiento como en inferencia. No se ha documentado ninguna innovacion arquitectonica adicional (attention lineal, decodificacion especulativa, mezcla de expertos u otras variantes); se trata de un ajuste estandar sobre el modelo base.

El entrenamiento se realizo mediante SFT con TRL en su version 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO. Se conserva el identificador `base_model:finetune:goldfish-models/eus_latn_100mb`, lo que confirma que el punto de partida es el checkpoint `eus_latn_100mb` de goldfish-models.

## Capacidades

- Generacion de texto autoregresiva basica, heredada de la arquitectura GPT-2 y del modelo base `eus_latn_100mb`.
- Ajuste fino supervisado orientado a seguir el formato de conversacion con rol de usuario (el ejemplo de uso emplea `[{"role": "user", "content": ...}]`).
- Compatibilidad con la libreria `transformers` mediante el pipeline `text-generation`.
- Compatibilidad declarada con text-generation-inference y endpoints (tags `text-generation-inference` y `endpoints_compatible`).
- Capacidad multilingue: no confirmada; el identificador sugiere foco en euskera.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Experimentacion academica sobre ajuste fino SFT: el modelo sirve como caso reproducible para estudiar como afecta el SFT a un modelo base pequeno (124M) sobre un idioma de bajos recursos como el euskera, usando el mismo pipeline de TRL documentado.
- Investigacion sobre tokenizacion y lenguajes formales: dado el sufijo `Dp` (probablemente relacionados con la jerarquia de Dyck) y `packed-bfd` en el nombre, encaja en estudios sobre la capacidad de modelos pequenos para aprender estructuras formales y su dependencia del empaquetado de datos y la semilla.
- Generacion de texto en euskera para prototipos: puede emplearse para generar borradores o completar frases en euskera en entornos de investigacion, siempre que se valide la calidad de forma manual por la falta de benchmarks.
- Pruebas de integracion con text-generation-inference: al declarar compatibilidad con TGI y endpoints, permite validar pipelines de despliegue ligeros con modelos de menos de 0,5 GB.
- Desarrollo de pipelines educativos: por su tamano, es adecuado para ensenar conceptos de fine-tuning, tokenizacion y evaluacion de modelos sin requerir hardware especializado.
- Evaluacion comparativa de semillas y configuraciones de datos: el nombre incluye una semilla concreta (`seed3407`), lo que sugiere su uso en barridos experimentales para medir la varianza entre ejecuciones de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,2 GB segun catalogos de terceros (LLM Explorer), coherente con 124,8 M de parametros en precision reducida.
- En fp16 los pesos ocupan aproximadamente 250 MB; en fp32, unos 500 MB; cuantizado a 8 bits, alrededor de 125 MB, y a 4 bits, en torno a 65 MB (estimaciones a partir del numero de parametros, sin datos oficiales de cuantizacion publicados).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; tambien funciona en CPU. No requiere A100, H100 ni RTX 4090.
- Cabe holgadamente en GPU consumer (GTX 1060, RTX 3060, RTX 4090) e incluso en GPUs integradas o en CPU.
- Opciones de despliegue: `transformers` (pipeline de text-generation), text-generation-inference (TGI) y servicios compatibles con endpoints. No se confirma soporte para llama.cpp, GGUF u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/eus-latn-100mb-ppt-Dp-100mb-packed-bfd_seed3407 | 124,8 M | no disponible | no disponible | HuggingFace (146 descargas) | SFT sobre goldfish-models/eus_latn_100mb |
| goldfish-models/eus_latn_100mb | ~124,8 M | no disponible | no disponible | HuggingFace | Modelo base del anterior |
| fpadovani/eus-latn-100mb-after-ppt-Dp-10mb-ckpt500_seed3407 | ~124,8 M | no disponible | no disponible | HuggingFace | Variante experimental relacionada |
| fpadovani/eus-latn-100mb-ppt-shuff-dyck-10mb_seed10 | 124,8 M | no disponible | no disponible | HuggingFace / LLM Explorer | Variante con datos Dyck barajados |

Los modelos comparables pertenecen a la misma familia experimental (goldfish-models y variantes de fpadovani) y comparten arquitectura y tamano; las diferencias radican en el dataset de ajuste, el empaquetado de datos y la semilla. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de un corpus de 100 MB, es probable que herede sesgos y limitaciones de cobertura del corpus original, sin que exista una evaluacion publicada.
- Riesgo de alucinacion: propio de los modelos GPT-2 pequenos, especialmente alta en tareas de conocimiento factual y en generacion abierta.
- Limitaciones de contexto o idioma: la longitud de contexto no esta documentada; el foco idiomatico probable (euskera) limita su utilidad en otros idiomas, sin datos oficiales que lo confirmen.
- Restricciones de licencia para uso comercial: la model card indica `licence: license` sin especificar condiciones, por lo que no se puede garantizar el uso comercial. Ademas, el modelo base `goldfish-models/eus_latn_100mb` puede imponer sus propias condiciones.
- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni similares, lo que impide evaluar su calidad objetivamente.
- Modelo orientado a investigacion: con 124,8 M de parametros, su rendimiento en tareas complejas de razonamiento, codigo o matematicas sera muy limitado en comparacion con modelos actuales.
- Repositorio con muy baja adopcion (0 likes, 146 descargas) y sin mantenimiento documentado; conviene verificar la integridad de los pesos antes de usarlo en cualquier flujo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/eus-latn-100mb-ppt-Dp-100mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eus_latn_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/ya6ok5rw
- Variante relacionada (mismo autor, 10MB): https://huggingface.co/francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfd_seed3407
- Variante relacionada de fpadovani: https://huggingface.co/fpadovani/eus-latn-100mb-after-ppt-Dp-10mb-ckpt500_seed3407
- Ficha en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Feus-latn-100mb-ppt-shuff-dyck-10mb_seed10,5ACpKm75aJyvnngwXOK3DR
- Despliegue en FriendliAI (variante relacionada): https://friendli.ai/models/fpadovani/eus-latn-100mb-ppt-Dp-100mb_seed455
