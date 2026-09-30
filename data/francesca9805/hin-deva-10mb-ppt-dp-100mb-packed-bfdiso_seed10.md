# francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfdiso_seed10

## Resumen

El modelo `francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfdiso_seed10` es un ajuste fino (SFT) del checkpoint `goldfish-models/hin_deva_10mb`, un transformer decoder-only de tipo GPT-2 con 39.087.104 parametros (unos 39M). Lo publica el usuario `francesca9805` y forma parte de una familia de experimentos de ablation sobre tokenizadores y mezclas de datos, asociada al proyecto de Weights & Biases `f-padovani-university-of-groningen/new-tokenizers`. El entrenamiento se realizo con TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.5.1+cu121.

El identificador del repositorio codifica el diseno experimental: `hin_deva` indica hindi en escritura devanagari, `10mb` el tamano del corpus o checkpoint del modelo base, `Dp-100mb-packed` apunta a un dataset de 100 MB con empaquetado de secuencias, `bfdiso` a un conjunto de opciones de configuracion (probablemente precision bf16, filtrado y aislamiento de datos) y `seed10` a la semilla aleatoria. El resultado es un modelo muy pequeno, de proposito exclusivamente investigador, sin model card detallada, sin licencia declarada y sin resultados de benchmarks publicados.

Su relevancia es acotada: no compite en capacidad con modelos generativos actuales, sino que sirve como punto de comparacion reproducible en estudios de tokenizacion, empaquetado de datos y variabilidad por semilla para lenguas de bajos recursos como el hindi. Para cualquier aplicacion de produccion real, el modelo es demasiado pequeno y carece de informacion suficiente (licencia, idiomas, contexto) para evaluarlo con garantias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en el repo) |
| Parametros totales | 39.087.104 (~39M, dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se publican GGUF ni variantes cuantizadas) |
| Idiomas soportados | no disponible en la model card; por el identificador (`hin_deva`) y el modelo base se infiere hindi en escritura devanagari |
| Licencia | no disponible (la model card indica `licence: license` como marcador de posicion) |
| Formato de pesos | safetensors (biblioteca `transformers`) |
| Tamano del repositorio | 0,1 GB |
| Modelo base | goldfish-models/hin_deva_10mb |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2: un transformer decoder-only con atencion causal completa, normalizacion previa y embeddings de tokens y posiciones aprendidas. Con 39M de parametros, se situa muy por debajo de GPT-2 small (124M), en el rango de los modelos pequenos que `goldfish-models` entrena por lengua con corpus de 10 MB, 100 MB y 1 GB. El ajuste se realizo sobre el checkpoint base `goldfish-models/hin_deva_10mb`, por lo que conserva su tokenizador y su vocabulario orientado al devanagari.

No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni el uso de RLHF o DPO; la model card unicamente confirma SFT mediante TRL. El nombre del repositorio sugiere un dataset de 100 MB con empaquetado de secuencias (`packed`) y un conjunto de opciones de configuracion resumidas como `bfdiso`, ademas de la semilla 10, lo que apunta a un barrido de experimentos con variabilidad controlada por semilla. El entrenamiento esta registrado en el proyecto de W&B `new-tokenizers`, centrado en el estudio de tokenizadores. No se describe ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, MoE ni SSM).

## Capacidades

- Generacion de texto autoregresiva en el estilo de GPT-2, limitada por el tamano del modelo.
- Plantilla de conversacion con roles (`user`) en el ejemplo de uso, heredada del pipeline de TRL para SFT.
- Generacion de texto en hindi con escritura devanagari (inferido del identificador y del modelo base, no declarado formalmente).
- Ajuste por instrucciones de tipo SFT, aunque la model card no detalla el dataset ni el formato conversacional completo.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia de modo de pensamiento (thinking), vision, audio ni multimodalidad.
- No se declaran capacidades multilingues mas alla del hindi; el alcance linguistico real no esta verificado.

## Casos de uso

- Estudio de tokenizadores para hindi: sirve como punto de comparacion reproducible frente a otros checkpoints de la misma familia (distintas semillas y tamanos de corpus) para medir el efecto del vocabulario en la perplejidad.
- Ablation de empaquetado de secuencias: el nombre `100mb-packed` sugiere que puede usarse para contrastar el efecto del empaquetado de datos frente a variantes no empaquetadas del mismo corpus.
- Analisis de variabilidad por semilla: al existir variantes con `seed455`, `seed3407`, etc., permite cuantificar la dispersion de resultados debida unicamente a la inicializacion y al orden de los datos.
- Docencia y practicas de ajuste fino: con 39M de parametros y 0,1 GB de repositorio, se puede entrenar y desplegar en un portatil para ilustrar el flujo completo de TRL y Transformers.
- Pruebas de integracion de infraestructura: util para validar pipelines de `text-generation-inference`, endpoints compatibles o `transformers.pipeline` sin consumir GPU ni presupuesto de inferencia.
- Generacion de texto corto en hindi en entornos sin conectividad: el tamano permite ejecucion en CPU, Raspberry Pi o dispositivos moviles para demos de autocompletado o frases breves.
- Baseline de investigacion en lenguas de bajos recursos: referencia de suelo para comparar tecnicas de aumento de datos o adaptacion de dominio en hindi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion, y los resultados de busqueda no aportan metricas (perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra).

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 156 MB solo para los pesos (39.087.104 parametros x 4 bytes), mas el cache KV y activaciones.
- VRAM para inferencia en fp16/bf16: aproximadamente 78 MB para los pesos.
- VRAM en int8: aproximadamente 39 MB; en int4, aproximadamente 20 MB (requiere conversion propia, ya que no se publican cuantizaciones).
- GPU recomendadas: cualquier GPU moderna es suficiente y sobra; una RTX 4090, A100 o H100 estarian infrautilizadas. El modelo cabe tambien en GPUs integradas y en CPU.
- Cabe en cualquier GPU de consumo e incluso en dispositivos sin GPU dedicada.
- Opciones de despliegue: `transformers.pipeline`, Text Generation Inference (TGI, etiqueta `text-generation-inference` presente), endpoints compatibles, y llama.cpp u Ollama previa conversion a GGUF (no publicada).
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, se espera una latencia muy baja y un throughput alto en cualquier hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Dataset/corpus | Semilla | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfdiso_seed10 (este modelo) | 39.087.104 | 100 MB empaquetado (segun nombre) | 10 | no disponible | HuggingFace, 0 descargas |
| goldfish-models/hin_deva_10mb (modelo base) | no disponible | 10 MB (segun nombre) | no disponible | no disponible | HuggingFace |
| francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfd_seed10 | no disponible | 100 MB empaquetado | 10 | no disponible | HuggingFace |
| francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfd_seed455 | no disponible | 10 MB empaquetado | 455 | no disponible | HuggingFace |
| francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed455 | no disponible | 10 MB empaquetado | 455 | no disponible | HuggingFace |

No se dispone de datos de rendimiento para ninguna de las variantes, por lo que la comparativa se limita a parametros, configuracion experimental y disponibilidad. La diferencia entre `bfd` y `bfdiso` en el nombre sugiere un flag adicional de configuracion, pero no hay documentacion que lo confirme.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Un corpus de 10-100 MB en hindi hereda los sesgos y el desequilibrio de dominio de la fuente original, que no se especifica.
- Riesgo de alucinacion: muy alto. Con 39M de parametros y un corpus minimo, la coherencia factual es limitada y la generacion puede derivar en texto plausible pero incorrecto.
- Limitaciones de contexto: la longitud de contexto no esta declarada, lo que impide planificar usos que dependan de ventanas largas.
- Limitaciones de idioma: solo se infiere hindi en devanagari; el comportamiento en otros idiomas es desconocido y probablemente deficiente.
- Restricciones de licencia: la licencia no esta disponible y la model card contiene un marcador de posicion (`licence: license`). No debe asumirse uso comercial permitido sin aclaracion del autor.
- Caveat para produccion: el modelo tiene 0 descargas y 0 likes, no incluye benchmarks, no declara idiomas ni contexto, y procede de un barrido experimental. No es adecuado como componente de un sistema en produccion.
- Ausencia de informacion sobre alineacion: solo se confirma SFT; no hay evidencia de RLHF, DPO ni filtros de seguridad, por lo que puede generar contenido inapropiado.
- Trazabilidad: la model card no documenta la composicion del dataset ni el numero de tokens, lo que dificulta reproducir o auditar el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/goldfish-models/hin_deva_10mb
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/zb10sduq
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante con `bfd` y semilla 10: https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-100mb-packed-bfd_seed10
- Variante con 100 MB y semilla 455: https://huggingface.co/francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfd_seed455
- Variante con 10 MB y semilla 455: https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed455
- Variante con semilla 3407: https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed3407
- Ficha de registro en free2aitools: https://free2aitools.com/model/francesca9805/hin-deva-10mb-ppt-dp-100mb-packed-bfd_seed10
