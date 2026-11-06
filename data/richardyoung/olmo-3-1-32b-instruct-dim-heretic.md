# richardyoung/Olmo-3.1-32B-Instruct-DiM-heretic

## Resumen

Olmo-3.1-32B-Instruct-DiM-heretic es una variante "decensored" o "abliterated" del modelo allenai/Olmo-3.1-32B-Instruct, desarrollada por el usuario richardyoung mediante la herramienta Heretic v2.0.0. El modelo base es un transformer denso de 32.233.522.176 parametros (aproximadamente 32,2 mil millones) desarrollado por el Allen Institute for AI (AI2) como parte de la familia Olmo 3, una serie de modelos de lenguaje completamente abiertos que publican codigo, checkpoints, logs y detalles de entrenamiento.

El objetivo de esta variante es eliminar los mecanismos de rechazo (refusals) del modelo original aplicando una tecnica de abliteration, que modifica selectivamente los pesos de determinadas capas (attention output projection y MLP down projection) para suprimir la direccion de activacion asociada a la negativa a responder. Segun la model card, el modelo pasa de 100/100 rechazos en el original a 88/100 en esta version, con una divergencia KL de 0,0891 respecto al modelo base, lo que indica un cambio moderado en la distribucion de salidas.

La relevancia de esta ficha radica en dos aspectos: por un lado, documenta una tecnica reproducible de modificacion de pesos (el autor incluye un directorio `reproduce` con los parametros exactos de abliteration); por otro, advierte de que se trata de un modelo sin filtros de seguridad, lo que tiene implicaciones legales y eticas importantes para su uso en produccion. El modelo esta publicado bajo licencia Apache 2.0 y solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Olmo 3, decoder-only) |
| Parametros totales | 32.233.522.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo base soporta carga en 8 bits via bitsandbytes; no se documentan GGUF ni otras) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Olmo-3.1-32B-Instruct es un transformer decoder-only denso de 32B parametros perteneciente a la familia Olmo 3 de AI2. Segun la model card del modelo base, fue preentrenado sobre el dataset Dolma 3 y postentrenado sobre los datasets Dolci, con un pipeline que incluye SFT (supervised fine-tuning), DPO (direct preference optimization) y una etapa final de RLVR (reinforcement learning with verifiable rewards). La variante Instruct esta optimizada para conversacion y seguimiento de instrucciones, a diferencia de las variantes Think orientadas a cadenas de razonamiento largas.

La modificacion introducida por richardyoung consiste en una abliteration aplicada con Heretic v2.0.0 sobre el checkpoint final de allenai/Olmo-3.1-32B-Instruct. Los parametros publicados incluyen un `direction_index` de 55,20 y pesos de intervencion sobre `attn.o_proj` (max_weight 1,27 en posicion 40,18; min_weight 0,58 a distancia 16,18) y sobre `mlp.down_proj` (max_weight 1,37 en posicion 38,33; min_weight 1,16 a distancia 19,62). El proceso es reproducible: el repositorio incluye un directorio `reproduce` con instrucciones. No se documentan en la informacion disponible innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones en ingles, heredadas del modelo base Instruct.
- Razonamiento y matematicas: el modelo base pertenece a una familia que incluye variantes Think con cadenas de razonamiento largo, aunque esta variante concreta es Instruct.
- Generacion de codigo: capacidad heredada del modelo base, sin datos especificos de rendimiento en la informacion disponible.
- Supresion de rechazos: responde a peticiones que el modelo original rechazaria (88/100 refusals frente a 100/100 del original, segun la model card).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (vision, audio, thinking mode): no disponible; esta variante no declara modo thinking.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como la abliteration afecta a la distribucion de salidas (KL de 0,0891) y a la tasa de rechazos, sirviendo como caso de estudio reproducible de modificacion de pesos.
- Analisis de robustez de filtros: util para evaluar hasta que punto las tecnicas de abliteration degradan las salvaguardas de un modelo Instruct de 32B y para disenar contramedidas.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido narrativo adulto donde el modelo original rechazaria peticiones, siempre que el uso cumpla la legislacion aplicable.
- Red teaming y evaluacion de riesgos: empleo controlado en entornos de prueba para identificar categorias de contenido problematico que un modelo sin filtros puede producir.
- Experimentos de destilacion y comparacion: al ser reproducible, permite generar variantes con distintos grados de abliteration y comparar su comportamiento frente al original.
- Fine-tuning sobre dominio especifico: al estar bajo Apache 2.0 y en formato safetensors, puede ajustarse con transformers para tareas de investigacion donde se requiera un modelo de 32B sin capa de rechazo.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (allenai/Olmo-3.1-32B-Instruct) |
|---|---|---|
| Refusals | 88/100 | 100/100 |
| Divergencia KL | 0,0891 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 64,5 GB solo para pesos (32,2B parametros x 2 bytes), mas overhead de activaciones y cache KV; se recomienda al menos 80 GB.
- VRAM estimada en 8 bits: aproximadamente 32-35 GB para pesos, viable en una A100 40GB o H100.
- GPU recomendadas: A100 80GB, H100 80GB, o multiples GPU consumer con tensor parallelism; en consumer individual no cabe en FP16.
- Cabe en consumer GPU: no en FP16; en cuantizacion de 4 bits (si se generan pesos GGUF, no disponibles en el repo) podria caber en una RTX 4090 de 24 GB, aunque no se documenta esa cuantizacion.
- Opciones de despliegue: transformers (>=4.57.0 segun el modelo base), bitsandbytes para carga en 8 bits; vLLM, llama.cpp, Ollama o TGI no estan documentados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| richardyoung/Olmo-3.1-32B-Instruct-DiM-heretic | 32,2B | no disponible | Apache 2.0 | Variante abliterated, solo ingles, 88/100 refusals |
| allenai/Olmo-3.1-32B-Instruct | 32,2B | no disponible | Apache 2.0 | Modelo base original, 100/100 refusals, pipeline SFT+DPO+RLVR |
| allenai/Olmo-3.1-32B-Think | 32,2B | no disponible | Apache 2.0 | Variante con cadena de razonamiento largo para matematicas y codigo |
| Otras variantes abliterated de 32B | no disponible | no disponible | variable | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo sin filtros de seguridad: la abliteration elimina parcialmente los rechazos, por lo que puede generar contenido danino, ilegal o sexualmente explicito; su uso en produccion requiere moderacion externa.
- Solo ingles: el campo `language` declara unicamente en; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion: inherente al modelo base; la modificacion de pesos puede alterar la calibracion y no se han publicado evaluaciones de factualidad.
- Divergencia respecto al original: la KL de 0,0891 indica cambios medibles en la distribucion de salidas que pueden afectar a tareas distintas de la conversacion.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias y el cumplimiento normativo (por ejemplo, Reglamento de IA de la UE) recae en el desplegador.
- Sin datos de benchmarks estandar ni de contexto: no es posible evaluar su calidad en tareas de razonamiento o codigo frente al original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.
- El modelo base cita un paper con identificador arxiv:2512.13961, cuya fecha es posterior a la creacion del repositorio; conviene verificar su contenido antes de citarlo.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Olmo-3.1-32B-Instruct-DiM-heretic
- Modelo base: https://huggingface.co/allenai/Olmo-3.1-32B-Instruct
- Heretic: https://heretic-project.org
- Dataset Dolci-Instruct-RL: https://huggingface.co/datasets/allenai/Dolci-Instruct-RL
- Paper citado (arxiv): https://arxiv.org/abs/2512.13961
- Reproducibilidad: directorio `reproduce/README.md` dentro del repositorio de Hugging Face
