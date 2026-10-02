# dheer05dj/anlp-a2-p2-lion-lr0p0004

## Resumen

dheer05dj/anlp-a2-p2-lion-lr0p0004 es un checkpoint de un transformer decoder-only de 41.558.528 parametros, implementado desde cero en PyTorch y publicado como parte de la asignacion academica ANLP Assignment 2 (parte 2, comparacion de optimizadores). No es un modelo de proposito general: es un artefacto de investigacion que documenta el efecto del optimizador Lion con un learning rate de 0.0004 sobre un preentrenamiento de siguiente token.

Arquitectonicamente es un transformer denso convencional con d_model 512, 8 capas, 8 cabezas de atencion, RoPE, RMSNorm y embeddings atados (tied embeddings). El entrenamiento consumio 36.995.072 tokens en 7 minutos y 3 segundos, y alcanzo una perdida de validacion final de 4.004. Su relevancia actual es metodologica: sirve como punto de comparacion reproducible frente a otros optimizadores bajo una misma receta de entrenamiento, no como modelo desplegable en producto.

El repositorio ocupa 0.2 GB y expone pesos en safetensors, pero no incluye model card con licencia, idiomas, pipeline ni instrucciones de uso estandar. La carga requiere el codigo de la asignatura (`src.part1.train.load_checkpoint(dir)`), lo que limita su integracion directa con herramientas convencionales de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (d_model 512, 8 capas, 8 cabezas, RoPE, RMSNorm, tied embeddings) |
| Parametros totales | 41.558.528 (41,56 M) |
| Parametros activos | 41.558.528 (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni versiones cuantizadas) |
| Idiomas soportados | no disponible (el corpus citado por repositorios hermanos de la misma asignatura es en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors, con config.json que contiene el TransformerConfig del codigo de la asignatura |
| Tamano del repositorio | 0,2 GB |
| Optimizador de entrenamiento | Lion con learning rate 0,0004 |
| Tokens de entrenamiento | 36.995.072 |
| Perdida de validacion final | 4,004 |
| Tiempo de entrenamiento | 7 min 03 s |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso implementado desde cero en PyTorch, sin componentes MoE, SSM ni hibridos. La configuracion declarada incluye d_model 512, 8 capas de 8 cabezas, codificacion posicional rotatoria (RoPE), normalizacion RMSNorm y proyeccion de salida atada a los embeddings de entrada. El fichero config.json contiene el objeto TransformerConfig consumido por `src/part1/model.py` del repositorio de la asignatura, y la carga se realiza mediante `src.part1.train.load_checkpoint(dir)`.

El entrenamiento corresponde al preentrenamiento de siguiente token sobre un corpus paralelo humano-IA (la descripcion de repositorios hermanos de la misma asignatura identifica `browndw/human-ai-parallel-corpus`), con un total de 36.995.072 tokens procesados en 7 minutos y 3 segundos. La particularidad del experimento es el optimizador: Lion implementado desde cero, subclasando unicamente `torch.optim.Optimizer`, con learning rate 0,0004. No hay evidencia de fases de RLHF, DPO, SFT ni de alineacion posterior; se trata de un checkpoint puramente preentrenado. La metrica `final_bleu_human` de 0,7914 sugiere que se evaluo la similitud de las continuaciones generadas respecto a las respuestas humanas del corpus paralelo, aunque no se detalla la metodologia de calculo.

## Capacidades

- Generacion de texto por continuacion autorregresiva (next-token prediction) con un vocabulario y tokenizador no documentados en la model card.
- Modelado de secuencias del dominio del corpus paralelo humano-IA usado en el preentrenamiento; la metrica final_bleu_human de 0,7914 apunta a cierta fidelidad a las respuestas humanas de ese corpus concreto.
- Completado de secuencias cortas y tareas de language modeling evaluables mediante perplejidad o perdida de validacion (4,004 en validacion).
- No dispone de modo thinking, razonamiento explicito, capacidades de vision, audio ni multimodalidad.
- No hay evidencia de soporte de tool calling ni function calling: no se ha aplicado ajuste por instrucciones ni plantillas de chat.
- No hay soporte documentado de agentes, razonamiento multi-paso ni uso de herramientas externas.
- Capacidad multilingue: no disponible; el corpus de entrenamiento citado por repositorios hermanos de la asignatura es en ingles.
- Al ser un modelo denso de 41,56 M de parametros, su capacidad de conocimiento factual y de razonamiento es muy limitada en terminos absolutos.

## Casos de uso

- Reproducibilidad academica de comparativas de optimizadores: el checkpoint permite replicar el experimento Lion con lr 0,0004 y contrastarlo con otros optimizadores de la misma asignatura bajo identica arquitectura, corpus y presupuesto de tokens.
- Estudio de dinamica de entrenamiento: con 36.995.072 tokens y 7 min 03 s de entrenamiento, es util para analizar curvas de perdida, estabilidad y convergencia de Lion en modelos pequenos, usando los logs de Weights & Biases publicados.
- Ajuste fino didactico: al ser un modelo de 41,56 M de parametros, cabe en cualquier GPU de consumo y permite experimentar con LoRA, congelacion de capas o cabeceado de tareas en cursos y laboratorios.
- Banco de pruebas de infraestructura de inferencia: su tamano reducido (aproximadamente 166 MB en FP32) permite validar pipelines propios de carga de safetensors, gestion de KV cache y batching sin coste de computo relevante.
- Investigacion sobre metricas de generacion: el par perdida de validacion (4,004) y BLEU humano (0,7914) sirve para estudiar la correlacion entre perplejidad y metricas n-grama en modelos pequenos entrenados sobre corpus paralelos.
- Destilacion y prototipado de arquitecturas: puede actuar como estudiante o como inicializacion en experimentos de destilacion hacia modelos aun mas pequenos, o como referencia para validar implementaciones propias de RoPE, RMSNorm y tied embeddings.
- Generacion de respuestas en el dominio restringido del corpus humano-IA: util para probar heuristicas de continuacion de dialogos sinteticos, siempre con la expectativa de calidad limitada por el tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las unicas metricas reportadas por el autor son las del entrenamiento:

| Metrica | Valor |
|---|---|
| final_val_loss | 4,004 |
| final_bleu_human | 0,7914 |
| tokens | 36.995.072 |
| train_time | 7 min 03 s |
| total params | 41,56 M |
| active params | 41,56 M |

No hay datos de comparacion directa con otros modelos en la model card. Los valores de perdida no son comparables con los de modelos de mayor escala, ya que dependen del tokenizador, del corpus y de la receta de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 166 MB solo en pesos en FP32; unos 83 MB en FP16/BF16. Sumando activaciones y cache KV en lotes pequenos, el consumo total se mantiene por debajo de 1 GB en la mayoria de configuraciones.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4090, A100 o H100. No se requiere hardware de gama alta.
- Inferencia en CPU: perfectamente viable; con 41,56 M de parametros el modelo se ejecuta en CPU sin aceleracion dedicada con latencias de milisegundos a decimas de segundo por token.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI o text-generation-inference, ya que el checkpoint depende de la implementacion propia `src/part1/model.py` y de `src.part1.train.load_checkpoint(dir)`. Para usarlo en esos frameworks habria que exportar la arquitectura a un formato soportado o reimplementar la configuracion.
- Latencia y throughput estimados: no disponibles. El unico dato temporal publicado es el de entrenamiento (7 min 03 s para 36.995.072 tokens), que no es extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| dheer05dj/anlp-a2-p2-lion-lr0p0004 | 41,56 M | no disponible | no disponible | safetensors en HuggingFace, carga mediante codigo propio |
| siddarthg44/anlp-a2-p2-lion | no disponible | no disponible | no disponible | HuggingFace; misma asignatura, optimizador Lion implementado desde cero |
| Arihant25/anlp-a2-optimizers | no disponible | no disponible | no disponible | HuggingFace; misma asignatura, comparativa de optimizadores |
| GPT-2 small (referencia externa) | 124 M | 1024 tokens | MIT | Pesos y tokenizador integrados en bibliotecas estandar (transformers) |

La comparacion relevante para este checkpoint es con los otros repositorios de la misma asignatura, que comparten arquitectura y corpus y difieren en el optimizador y el learning rate. Frente a alternativas de la misma escala con soporte de ecosistema (por ejemplo GPT-2 small), la diferencia critica no es el rendimiento sino la integracion: este modelo carece de tokenizador publicado, plantilla de chat y compatibilidad con librerias estandar.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se ha publicado ninguna evaluacion de sesgo, toxicidad o equidad.
- Riesgo de alucinacion: alto en terminos relativos. Es un modelo de 41,56 M de parametros preentrenado unicamente con 36.995.072 tokens, sin ajuste por instrucciones ni verificacion factual; generara continuaciones plausibles sin garantia de veracidad.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada, y los idiomas soportados tampoco. El corpus de entrenamiento citado por repositorios hermanos de la asignatura es en ingles, por lo que el rendimiento en castellano es presumiblemente muy pobre.
- Licencia: no disponible. Al no declararse licencia, no puede asumirse permiso de uso comercial; en ausencia de terminos explicitos, lo prudente es tratar el modelo como material academico sin autorizacion comercial clara.
- Ausencia de alineacion: no hay SFT, RLHF ni DPO. El modelo no sigue instrucciones ni mantiene formatos de conversacion de forma fiable.
- Integracion limitada: la carga requiere codigo especifico de la asignatura (`src.part1/model.py` y `src.part1.train.load_checkpoint`), y no se publican pesos GGUF ni adaptaciones a frameworks de servido.
- Ausencia de datos operativos: sin pipeline declarado, sin tokenizador documentado, sin licencia y con cero descargas y cero likes en el momento de la consulta. No es apto para produccion.
- Advertencia sobre metricas: el valor final_bleu_human de 0,7914 no viene acompanado de la metodologia de calculo; no debe interpretarse como una evaluacion de calidad comparable a benchmarks estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dheer05dj/anlp-a2-p2-lion-lr0p0004
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/dheer05k-iiit-hyderabad/anlp-a2-part2-optimizers/runs/0z5k4329
- Checkpoint hermano con optimizador Lion: https://huggingface.co/siddarthg44/anlp-a2-p2-lion
- Comparativa de optimizadores de la misma asignatura: https://huggingface.co/Arihant25/anlp-a2-optimizers
- Corpus de entrenamiento citado por repositorios hermanos (no confirmado en la model card de este checkpoint): https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
