# greenfield0810/affine-ark-bec85d80269f

## Resumen

Este repositorio contiene una copia íntegra (mirror byte-for-byte) de un checkpoint de la red Bittensor, concretamente del subnet 120 (Affine), un mercado descentralizado de modelos de IA. El autor del repo, `greenfield0810`, no es el creador del modelo: lo ha archivado como medida de preservación, ya que los repositorios de esa red suelen volverse privados pocos días después de participar en duelos de evaluación (el 31% de los competidores históricos ya son inaccesibles). El checkpoint original pertenece a `alex-drok/affine-5fknrenir8-mind` en su revisión `7b5a45a4b226`.

El modelo subyacente es un sistema multimodal de imagen a texto basado en una arquitectura MoE (Mixture of Experts) de la familia Qwen 3.5, con 35.107 millones de parámetros totales y un peso de 70.2 GB en 16 shards. Está etiquetado con `image-text-to-text`, `conversational` y `endpoints_compatible`, lo que indica que puede procesar entradas de imagen y texto para generar respuestas de texto. En el momento de la archivación, el modelo nunca había sido coronado en el leaderboard de Affine y tenía un historial de 2 duelos con 0 victorias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen 3.5 (`qwen3_5_moe`) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (16 shards, 70.2 GB) |

## Arquitectura y entrenamiento

La arquitectura es un modelo MoE multimodal (imagen a texto) de la familia Qwen 3.5, con un total de 35.1 mil millones de parametros. Al ser un MoE, solo una fraccion de los parametros se activa por token, aunque el numero exacto de parametros activos no se ha publicado en la informacion disponible. El modelo procesa entradas de imagen y texto y genera respuestas de texto, con soporte para conversaciones multi-turno.

No se dispone de informacion sobre el proceso de entrenamiento: ni el numero de tokens utilizados, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares. El modelo es un checkpoint de la red Affine, donde los participantes suben modelos entrenados de forma independiente y compiten en duelos de evaluacion. La unica innovacion destacable en el contexto de este repositorio es su funcion como archivo de preservacion, no la arquitectura en si.

## Capacidades

- Generacion de texto multimodal: procesa imagenes y texto como entrada y genera respuestas de texto.
- Conversacion multi-turno: etiquetado como `conversational`, soporta dialogos continuados.
- Compatible con endpoints de inferencia: etiquetado como `endpoints_compatible`, puede desplegarse con infraestructura estandar de Hugging Face.
- Arquitectura MoE: eficiencia computacional relativa gracias a la activacion selectiva de expertos.
- Integracion en la red Bittensor: disenado para participar en el subnet 120 (Affine) de evaluacion y duelos.

## Casos de uso

- Archivo y preservacion de modelos: el uso principal declarado por el autor es conservar checkpoints que de otro modo desaparecerian de la red Affine. Sirve para auditar la evolucion de los modelos de la subred y para reproducir resultados historicos.
- Analisis de imagenes con generacion de texto: el modelo puede usarse para tareas como descripcion de imagenes, captioning o respuestas visuales en aplicaciones de asistencia.
- Asistentes conversacionales con entrada visual: al ser multimodal y conversacional, puede integrarse en chatbots que reciban capturas de pantalla o fotos como parte del dialogo.
- Investigacion de arquitecturas MoE multimodales: los investigadores pueden analizar el checkpoint para estudiar como se estructura un MoE de 35B parametros entrenado para tareas de imagen-texto.
- Reproduccion de experimentos en la red Affine: el checkpoint permite replicar los duelos y comparar el rendimiento historico con otros modelos de la subred.
- Desarrollo de herramientas de cuantizacion: los 70.2 GB de pesos en safetensors son un candidato para probar tecnicas de cuantizacion (GPTQ, AWQ, GGUF) sobre un MoE multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo tiene un historial de 2 duelos con 0 victorias en la red Affine, pero no se especifican metricas concretas (MMLU, HumanEval, GSM8K, etc.) ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: el peso en FP16 es de 70.2 GB, por lo que se necesitan aproximadamente 70 GB de VRAM para inferencia en precision completa, o unos 35 GB en cuantizacion FP8/INT8 y unos 18-20 GB en INT4 (si se aplican tecnicas de cuantizacion).
- GPU recomendadas: para FP16 se necesitan GPU de datacenter como A100 80GB, H100 80GB o A6000 48GB (con multiples GPUs). En cuantizacion INT4 podria caber en una RTX 4090 de 24GB, aunque no se ha verificado.
- Consumer GPU: solo es viable con cuantizacion agresiva (INT4) y posiblemente con reduccion de la longitud de contexto.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama (si se genera GGUF), o la infraestructura estandar de Hugging Face Transformers.
- Latencia y throughput: no se disponen datos concretos. Como referencia, un MoE de 35B parametros en FP16 en una A100 puede generar del orden de 10-30 tokens por segundo, dependiendo del numero de parametros activos y de la implementacion.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Affine checkpoint) | 35.1B totales (MoE) | Qwen 3.5 MoE multimodal | no disponible | no disponible | Mirror publico en HuggingFace |
| Qwen2-VL-7B | 7B | Vision-Language transformer | 32k | Apache 2.0 | Publico |
| Qwen2-VL-72B | 72B | Vision-Language transformer | 32k | Apache 2.0 | Publico |
| Mixtral 8x7B | 46.7B totales (MoE) | MoE transformer | 32k | Apache 2.0 | Publico |

La comparativa se basa en arquitecturas MoE multimodales o en modelos de la familia Qwen. No hay datos de rendimiento para este checkpoint, por lo que no se puede establecer una comparativa cuantitativa. La diferencia principal es que este modelo proviene de un entorno de entrenamiento descentralizado (Affine) y no tiene documentacion de licencia ni de rendimiento.

## Limitaciones y advertencias

- Sesgos desconocidos: al no haber documentacion del entrenamiento, los sesgos son impredecibles.
- Riesgo de alucinacion: no evaluado, probabilidad alta en modelos sin fine-tuning especifico.
- Limitaciones de contexto e idioma: desconocidas, no hay datos publicados.
- Licencia no especificada: no se puede usar comercialmente sin riesgo legal.
- Sin garantias de calidad: el modelo tiene 0 victorias en 2 duelos en la red Affine, lo que sugiere un rendimiento inferior a otros competidores.
- Es un mirror, no un modelo original: el autor advierte que no es su modelo y que se eliminara si el propietario lo solicita.
- No apto para produccion sin validacion: al no haber benchmarks ni documentacion, no se recomienda su uso en sistemas criticos.
- Falta de soporte: no hay comunidad, no hay issues resueltos, no hay garantias de mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/greenfield0810/affine-ark-bec85d80269f
- Checkpoint original: https://huggingface.co/alex-drok/affine-5kfnenir8-mind (revision `7b5a45a4b226`)
- Repositorio hermano (otro archivo de la misma serie): https://huggingface.co/greenfield0810/affine-ark-95d402145584
- Archivo de procedencia completa: `_affine_provenance.json` dentro del repositorio
