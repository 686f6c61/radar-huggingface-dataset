# francesca9805/urd-arab-10mb-ppt-Dp-100mb-packed-bfd_seed3407

## Resumen

El modelo `francesca9805/urd-arab-10mb-ppt-Dp-100mb-packed-bfd_seed3407` es un ajuste fino (fine-tuning) supervisado del checkpoint `goldfish-models/urd_arab_10mb`, publicado por el usuario de Hugging Face francesca9805. Se trata de un modelo de generacion de texto de arquitectura GPT-2 con 39.087.104 parametros (aproximadamente 39 millones), lo que lo situa en la gama de modelos pequenos orientados a experimentacion con tokenizadores y a la investigacion sobre lenguas de bajos recursos.

El nombre del repositorio sugiere una cadena de experimentos controlados: `urd-arab-10mb` indica el corpus base (probablemente urdu y arabe, 10 MB), `ppt` y `Dp` apuntan a variantes de tokenizacion o preprocesado, `100mb-packed` a un corpus empaquetado de 100 MB y `bfd_seed3407` a una semilla concreta de entrenamiento. El proyecto de Weights & Biases asociado se llama `new-tokenizers`, lo que refuerza la hipotesis de que el objetivo es evaluar el impacto de decisiones de tokenizacion en el rendimiento, aunque la model card no lo documenta explicitamente.

El modelo es relevante como artefacto de investigacion reproducible (semilla fija, versiones de framework declaradas y traza de entrenamiento en W&B), no como modelo de produccion: no publica benchmarks, no declara licencia y su ventana de contexto no esta documentada. Su tamano lo hace ejecutable en CPU y en cualquier GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun la etiqueta `gpt2` y la libreria `transformers`) |
| Parametros totales | 39.087.104 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; el repo solo contiene safetensors) |
| Idiomas soportados | no disponible (el nombre del modelo base referencia urdu y arabe, pero la model card no lo confirma) |
| Licencia | no disponible (el README incluye `licence: license`, un marcador de posicion sin contenido) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 0.1 GB |
| Modelo base | goldfish-models/urd_arab_10mb |
| Metodo de entrenamiento | SFT (supervised fine-tuning) con TRL |
| Version de framework | TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4, Tokenizers 0.22.1 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, heredada directamente del checkpoint base `goldfish-models/urd_arab_10mb`. No hay innovaciones arquitectonicas declaradas: no se mencionan mecanismos de atencion lineal, mezcla de expertos, capas SSM ni decodificacion especulativa. El ajuste se realizo con TRL 0.23.0 en modo SFT sobre Transformers 4.56.2 y PyTorch 2.5.1+cu121.

La model card no detalla la composicion del dataset de ajuste, el numero de tokens vistos, ni si hubo etapas posteriores de RLHF o DPO. Lo unico verificable es el nombre del experimento (`urd-arab-10mb-ppt-Dp-100mb-packed-bfd_seed3407`) y la existencia de una ejecucion registrada en Weights & Biases dentro del proyecto `new-tokenizers`, con semilla fija 3407. Esto apunta a un estudio comparativo de tokenizadores sobre corpus empaquetados, pero se trata de una inferencia a partir del nombre, no de un dato documentado. La model card tampoco incluye una seccion de citas bibliograficas propia, solo la cita generica de TRL.

## Capacidades

- Generacion de texto autoregresiva basica, limitada a lo aprendido por un modelo de 39 millones de parametros.
- Conversacion de un solo turno mediante el pipeline `text-generation` de Transformers, con `max_new_tokens` configurable.
- Trabajo con textos en la(s) lengua(s) del modelo base, presumiblemente urdu y arabe, aunque no confirmado.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia de modo "thinking", vision, audio ni modalidades adicionales.
- No se documentan capacidades multilingues formales ni cobertura de idiomas declarada.

## Casos de uso

- Reproduccion de experimentos academicos: el checkpoint incluye semilla fija y versiones exactas de framework, lo que permite replicar el ajuste y comparar variantes de tokenizacion dentro del proyecto `new-tokenizers`.
- Estudio del impacto de la tokenizacion en lenguas de bajos recursos: sirve como punto de comparacion frente al modelo base para medir como afecta un corpus empaquetado de 100 MB al comportamiento generativo.
- Prototipado docente: su tamano (39 M de parametros) permite ejecutarlo en un portatil sin GPU para ilustrar el ciclo completo de SFT con TRL.
- Pruebas de infraestructura de inferencia: util para validar pipelines de `text-generation-inference`, endpoints compatibles y despliegues minimos con un coste de recursos despreciable.
- Generacion de texto de relleno o sintetico en urdu o arabe para tareas de aumento de datos, asumiendo la baja calidad esperable en un modelo de este tamano.
- Analisis de sesgos y comportamientos degenerados en modelos pequenos entrenados con corpus limitados, como caso de estudio de alucinacion y repeticion.
- Base para experimentos de destilacion o ajuste adicional sobre dominios muy especificos donde no se requiere conocimiento general amplio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y no se dispone de evaluaciones independientes del checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 80 MB en fp16 (39 M de parametros x 2 bytes) mas el coste de activaciones y cache KV, que en la practica deja el consumo por debajo de 1 GB incluso con lotes moderados.
- En cuantizacion int8 el peso del modelo ronda los 40 MB; en int4, unos 20 MB (aunque no se publican pesos cuantizados oficiales, la conversion es viable).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 4090, A100 o H100 estarian ampliamente sobredimensionadas para este modelo.
- Cabe holgadamente en GPU de consumo (GTX 1050, RTX 3060, RTX 4090) e incluso en iGPU con memoria unificada.
- Ejecucion en CPU perfectamente viable, con latencias de decenas de milisegundos por token segun hardware.
- Opciones de despliegue: Transformers, text-generation-inference (el repo esta etiquetado como `text-generation-inference` y `endpoints_compatible`), conversion a GGUF para llama.cpp u Ollama, y ONNX Runtime.
- Latencia y throughput estimados: no disponibles; no se publican mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/urd-arab-10mb-ppt-Dp-100mb-packed-bfd_seed3407 | 39,1 M | no disponible | no disponible | Hugging Face | Ajuste SFT experimental con semilla fija |
| goldfish-models/urd_arab_10mb (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | Hugging Face | Checkpoint de partida del ajuste |
| GPT-2 small (referencia de la misma familia) | 124 M | 1024 tokens (segun especificacion publica de GPT-2) | MIT (segun publicacion original de OpenAI) | Ampliamente disponible | Mayor capacidad, pero sin adaptacion a urdu ni arabe |
| distilgpt2 (referencia de tamano cercano) | 82 M | 1024 tokens (segun especificacion publica) | Apache 2.0 (segun publicacion) | Ampliamente disponible | Destilado de GPT-2, solo ingles |

No se dispone de datos de rendimiento comparativos entre estos modelos dentro de la informacion proporcionada.

## Limitaciones y advertencias

- No hay licencia declarada: el campo `licence: license` del README es un marcador de posicion. El uso comercial queda en un limbo legal hasta que el autor lo aclare.
- Ausencia total de benchmarks: no es posible afirmar nada sobre su calidad generativa frente al modelo base.
- Con 39 millones de parametros, la coherencia a partir de unas pocas decenas de tokens sera limitada, con alta probabilidad de repeticiones y deriva tematica.
- Riesgo elevado de alucinacion y de generar contenido facticamente incorrecto, especialmente fuera de los dominios representados en el corpus de ajuste.
- La model card no documenta sesgos, pero un corpus de 10 MB en urdu y arabe es necesariamente limitado y probablemente sobrerrepresenta ciertos registros o variedades dialectales.
- Ventana de contexto no documentada: no se puede planificar su uso en tareas que requieran contexto largo.
- Idiomas no confirmados oficialmente; el uso con otros idiomas distintos del urdu y el arabe producira resultados degradados.
- Artefacto de investigacion, no de produccion: el propio nombre del repositorio indica que forma parte de una serie de experimentos controlados por semilla.
- El modelo no incluye ninguna capa de seguridad, moderacion ni alineacion mas alla del SFT aplicado.
- La fecha de creacion registrada (2026-09-23) resulta anomala respecto a las versiones de framework declaradas; conviene verificar la trazabilidad del artefacto antes de reutilizarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/urd-arab-10mb-ppt-Dp-100mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/urd_arab_10mb
- Ejecucion de entrenamiento en Weights & Biases (proyecto `new-tokenizers`): https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/o1rmpadf
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de Transformers: https://huggingface.co/docs/transformers
- Organizacion Goldfish Models: https://huggingface.co/goldfish-models
