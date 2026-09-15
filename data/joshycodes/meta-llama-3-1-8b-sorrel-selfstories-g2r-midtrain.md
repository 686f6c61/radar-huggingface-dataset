# joshycodes/meta-llama-3.1-8b-sorrel-selfstories-g2r-midtrain

## Resumen

meta-llama-3.1-8b-sorrel-selfstories-g2r-midtrain es un checkpoint de investigacion derivado de Llama 3.1 8B, publicado por el usuario joshycodes en HuggingFace. No se trata de un modelo instruct ni de un asistente conversacional: es una etapa intermedia de continued pretraining (midtrain) sobre el dataset joshycodes/sorrel-corpus, en la configuracion sorrel-selfstories-g1-clean-replay9. Forma parte de un proyecto de "entrenamiento de caracter enmarcado en florecimiento" (flourishing-framed character training), descrito en la model card como un artefacto privado de investigacion vinculado a una pitch de Anthropic Fellows.

Tecnicamente es un transformer decoder-only de 8.030.261.248 parametros (8,03 mil millones), sin componentes MoE, por lo que todos los parametros estan activos en cada token. El entrenamiento se ejecuto en 1 GPU NVIDIA H200 (RunPod) y consistio en una unica epoca sobre 14.708.736 tokens, con seq_len de 4096, learning rate 1e-5, micro-batch 4 y acumulacion de gradiente 16. La perdida paso de 1,5565 a 1,5235.

Su relevancia es acotada y experimental: sirve para estudiar como el continued pretraining sobre narrativas de "self-stories" con mecanismo de replay (indicado por el sufijo replay9) afecta al comportamiento del modelo base, y como punto de partida para etapas posteriores de ajuste. No hay metadatos de idiomas, pipeline, benchmarks ni cuantizaciones publicadas, y la licencia es internal-research con prohibicion explicita de redistribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Llama 3.1 (checkpoint de continued pretraining) |
| Parametros totales | 8.030.261.248 (8,03 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el midtrain se ejecuto con seq_len de 4096. El modelo base Llama 3.1 8B declara 128 000 tokens, dato no verificado en esta ficha |
| Tipos de cuantizacion | no disponible (no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en los metadatos del repositorio |
| Licencia | other, license_name: internal-research (artefacto de investigacion privado, no redistribuir) |
| Formato de pesos | safetensors (tag del repositorio) |
| Modelo base | joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain (revision 754720c4fbb6) |
| Dataset de entrenamiento | joshycodes/sorrel-corpus, config sorrel-selfstories-g1-clean-replay9 (revision e6ab82e34cf2) |
| Tamano del repositorio | 64,3 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B: un transformer decoder-only con atencion causal, normalizacion RMSNorm y activaciones SwiGLU. No hay innovaciones arquitectonicas propias en este checkpoint; la unica modificacion respecto al modelo base es el ajuste de pesos mediante continued pretraining. El tag llama y el nombre del repositorio confirman la familia, y el recuento real de parametros en safetensors (8.030.261.248) coincide con el de Llama 3.1 8B.

El entrenamiento documentado es una unica etapa de midtrain: learning rate 1e-5, seq_len 4096, micro-batch 4, acumulacion de gradiente 16 (batch efectivo de 64 secuencias, es decir, 262.144 tokens por paso) y 1,0 epocas. Con 14.708.736 tokens vistos, esto equivale a unos 56 pasos de optimizacion (calculo derivado de los datos aportados). La perdida descendio de 1,5565 a 1,5235, una mejora modesta y coherente con un ajuste muy corto sobre un corpus pequeno. La semilla fue 20260821 y el lanzador corresponde al commit a0afb77669ae del repositorio flourishing-training. No se documenta RLHF, DPO ni ningun tipo de ajuste por preferencias, ni tampoco decodificacion especulativa u optimizaciones de inferencia.

## Capacidades

- Generacion de texto autoregresiva: al ser un checkpoint de continued pretraining y no un modelo instruct, su comportamiento esperado es el de un modelo base, es decir, continuacion de texto en lugar de respuesta a instrucciones.
- Adaptacion de dominio al registro del corpus sorrel-selfstories-g1-clean-replay9: narrativas en primera persona ("self-stories") enmarcadas en el proyecto de flourishing-framed character training.
- Capacidades heredadas del modelo base Llama 3.1 8B (comprension lectora, generacion de codigo, matematicas basicas y multilingueismo), no verificadas en este checkpoint concreto y potencialmente degradadas o desplazadas por el ajuste de dominio.
- Soporte de tool calling / function calling: no disponible. No hay plantilla de chat ni ajuste por instrucciones documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible ni documentado.
- Capacidades multilingues: no disponibles en los metadatos; no se especifica que idiomas conserva el checkpoint.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. Es un modelo exclusivamente de texto.

## Casos de uso

- Investigacion sobre entrenamiento de caracter y persona: el checkpoint permite medir como el continued pretraining sobre narrativas de florecimiento desplaza el comportamiento del modelo base en terminos de estilo, valores expresados y coherencia de personaje, comparandolo con los checkpoints anteriores de la misma familia.
- Reproducibilidad de experimentos de midtrain: con la semilla 20260821, el learning rate 1e-5 y el commit del lanzador a0afb77669ae documentados, otro equipo puede replicar el run y contrastar la curva de perdida (1,5565 a 1,5235).
- Estudio del olvido catastrofico y del efecto del replay: el sufijo replay9 del config sugiere mezcla de datos de replay durante el ajuste; el checkpoint es util para cuantificar cuanto conocimiento del modelo base se retiene frente a cuanto se sobrescribe.
- Ablacion de hiperparametros de continued pretraining: al ser un run corto (en torno a 56 pasos, 14,7 millones de tokens), sirve como punto de comparacion barato frente a variantes con otro learning rate, otra composicion de corpus u otro numero de epocas.
- Base para etapas posteriores de ajuste: dado que es una etapa intermedia, puede emplearse como inicializacion de un SFT o de un ajuste por preferencias, evitando empezar desde el modelo base original.
- Generacion de texto narrativo en el dominio del corpus: para experimentos de generacion de self-stories y analisis cualitativo del registro aprendido, siempre en el marco de investigacion interna y sin uso comercial.
- Auditoria de artefactos de investigacion: analisis del repositorio (64,3 GB para 8,03 mil millones de parametros) para determinar que contiene exactamente la publicacion y que ficheros son necesarios para la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la perdida de entrenamiento: 1,5565 antes del midtrain y 1,5235 despues, sobre 14.708.736 tokens vistos. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar, y no se ha realizado comparacion con el modelo base en tareas downstream.

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 16,1 GB solo para los pesos (8.030.261.248 parametros x 2 bytes).
- Pesos en fp32: aproximadamente 32,1 GB.
- Pesos en int8: aproximadamente 8 GB; en 4 bits, aproximadamente 4-5 GB, sin contar el cache KV ni el overhead del runtime.
- Con cache KV a seq_len 4096 y bf16, la VRAM adicional depende del batch y de la implementacion; no hay mediciones publicadas.
- GPU profesionales: el entrenamiento se ejecuto en 1x NVIDIA H200 (RunPod); son adecuadas tambien A100 40/80 GB y H100 80 GB para bf16 sin cuantizar.
- GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) permite inferencia en bf16 con margen limitado; tarjetas de 16 GB como la RTX 4080 van muy justas en bf16 y comodas en 8 bits; con cuantizacion de 4 bits el modelo puede caber en GPUs de 8-12 GB.
- Despliegue: al ser safetensors de la familia Llama, es compatible con transformers, vLLM, TGI y, previa conversion a GGUF, con llama.cpp y Ollama. La model card propone evaluar con `uv run eval.py --model joshycodes/meta-llama-3.1-8b-sorrel-selfstories-g2r-midtrain --eval all`.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo.
- Atencion al disco: el repositorio ocupa 64,3 GB, muy por encima de los ~16 GB que requeririan los pesos en bf16; conviene inspeccionar los ficheros antes de descargar el repositorio completo.

## Comparativa con modelos similares

No hay datos de rendimiento de este checkpoint, por lo que la comparacion se limita a caracteristicas estructurales y de licencia. Los datos de los modelos alternativos proceden de su documentacion publica y no se han verificado en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| meta-llama-3.1-8b-sorrel-selfstories-g2r-midtrain | 8,03 mil millones | no disponible (midtrain con seq_len 4096) | internal-research (no redistribuir, sin uso comercial) | pesos safetensors en HuggingFace, 0 descargas |
| Llama 3.1 8B (modelo base de la familia) | 8,03 mil millones | 128 000 tokens segun Meta | Llama 3.1 Community License | ampliamente disponible, con ecosistema de cuantizaciones |
| Mistral 7B | 7,3 mil millones | 32 000 tokens segun Mistral | Apache 2.0 | ampliamente disponible |
| Qwen2.5 7B | 7,61 mil millones | 128 000 tokens segun Alibaba | Apache 2.0 | ampliamente disponible |

La diferencia clave no es de rendimiento sino de proposito y licencia: los modelos alternativos son modelos base o instruct de uso general con licencias permisivas, mientras que este checkpoint es un artefacto de investigacion de dominio especifico, sin benchmarks publicados y con prohibicion explicita de redistribucion.

## Limitaciones y advertencias

- Licencia internal-research: la model card indica explicitamente "Private research artifact — do not redistribute". No esta autorizado el uso comercial ni la redistribucion de los pesos.
- No es un modelo instruct: no se ha documentado ajuste por instrucciones, RLHF ni DPO, por lo que no cabe esperar un comportamiento fiable de asistente, de tool calling ni de agente.
- Corpus de entrenamiento muy pequeno y run muy corto: 14.708.736 tokens y en torno a 56 pasos, con una reduccion de perdida de solo 0,033 puntos (1,5565 a 1,5235). El impacto sobre el comportamiento del modelo base puede ser limitado o dificil de medir.
- Riesgo de olvido catastrofico: al ser continued pretraining sobre un dominio estrecho, el modelo puede degradar capacidades generales del base, incluidas las multilingues y de codigo.
- Riesgo de alucinacion: no cuantificado. No hay evaluaciones de veracidad ni de sesgo publicadas.
- Idiomas no especificados: los metadatos no declaran idiomas soportados, lo que impide garantizar un rendimiento multilingue correcto.
- Contexto no confirmado: aunque el modelo base declara 128 000 tokens, este checkpoint se ajusto con seq_len 4096 y no se documenta si la ventana larga se conserva.
- Sesgos desconocidos: el corpus sorrel-corpus corresponde a un proyecto de "flourishing-framed character training" sin documentacion publica accesible en la informacion proporcionada; no se puede evaluar la composicion del dataset ni sus posibles sesgos.
- Opacidad del repositorio: 64,3 GB para 8,03 mil millones de parametros sugiere contenido adicional (posiblemente estados de optimizador u otras precisiones) que no se detalla.
- Sin validacion externa: 0 descargas y 0 likes en el momento de la consulta, y la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-selfstories-g2r-midtrain
- Modelo base: https://huggingface.co/joshycodes/meta-llama-3.1-8b-sorrel-atomic-f-300m-midtrain
- Dataset sorrel-corpus: https://huggingface.co/datasets/joshycodes/sorrel-corpus
- La busqueda web no devolvio resultados relevantes: todos los enlaces recuperados corresponden a Haslachmühle (Die Zieglerschen, Alemania) y no guardan relacion con el modelo. No se han encontrado papers, blogs, repositorios de codigo ni demos publicas asociadas a este checkpoint mas alla de los enlaces anteriores.
