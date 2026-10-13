# dill-lab/GeoLadder-40M-32B-bs128-lr0.0065-wd0.1-decay0.01

## Resumen

GeoLadder-40M-32B-bs128-lr0.0065-wd0.1-decay0.01 es un modelo de lenguaje de 40 millones de parametros entrenado por el grupo dill-lab (Atharva Kulkarni, Jacob Mitchell Springer, Arjun Subramonian y Swabha Swayamdipta). Forma parte de una suite de 108 modelos estilo OLMo, con tamanos que van de 4M a 75M de parametros, publicada junto al articulo "Disentangling Geometry, Performance, and Training in Language Models" (ICML 2026, PMLR 306). El objetivo del trabajo no es ofrecer un modelo de proposito general, sino servir como banco de pruebas controlado para estudiar la relacion entre la geometria de la matriz de unembedding (en particular su rango efectivo) y el rendimiento downstream.

El modelo se entreno sobre EleutherAI/the_pile_deduplicated durante 32.000 millones de tokens, con secuencias de 2048 tokens, batch de 128 secuencias, learning rate pico de 0.0065, weight decay de 0.1 y un decaimiento coseno hasta el 1 por ciento del LR pico. La nomenclatura del repositorio codifica exactamente esos hiperparametros. Su relevancia actual es fundamentalmente cientifica: es un artefacto reproducible para investigar como las decisiones de preentrenamiento moldean metricas geometricas internas, y la propia conclusion del articulo es que ninguna de esas metricas predice de forma fiable el rendimiento.

Al ser un modelo de 40M de parametros, sus capacidades generativas son muy limitadas en terminos absolutos. Se publica con 41 checkpoints intermedios (`step0` a `step122081`) como ramas del repositorio, lo que lo hace util para estudios de dinamica de entrenamiento mas que para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estilo OLMo (`OLMoForCausalLM`, arquitectura legacy `hf_olmo`) |
| Parametros totales | 40M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia usada en entrenamiento; no se especifica otro valor en la informacion disponible) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; el formato nativo es fp32/`pytorch_model.bin`) |
| Idiomas soportados | no disponible (dataset de entrenamiento en ingles: The Pile deduplicado) |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.bin` (PyTorch); requiere `hf_olmo` instalado para cargar |

Otros hiperparametros de entrenamiento publicados:

| Hiperparametro | Valor |
|---|---|
| Tokens de entrenamiento | 32B |
| Batch size (secuencias de 2048 tokens) | 128 |
| Learning rate pico | 0.0065 |
| Weight decay | 0.1 |
| Decaimiento de LR (`alpha_f`, coseno) | 0.01 (LR final = 1 por ciento del pico) |
| Checkpoints publicados | 41 ramas (`step0` ... `step122081`) |
| Tamano del repositorio | 11.2 GB |
| Dataset | EleutherAI/the_pile_deduplicated |

## Arquitectura y entrenamiento

El modelo sigue la receta OLMo: un transformer causal decoder-only con normalizacion no parametrizada (en el estilo de OLMo), embeddings rotatorios y sin sesgos en las capas lineales, aunque la informacion proporcionada no detalla la configuracion exacta de capas, cabezas ni dimension del modelo para esta variante de 40M. La carga se realiza a traves de la clase `OLMoForCausalLM`, que corresponde a la implementacion legacy `hf_olmo` y exige instalar el paquete `ai2-olmo` para registrarla en `transformers`. No se menciona ningun uso de decodificacion especulativa, atencion lineal ni mecanicas hibridas.

El entrenamiento se realizo sobre la version deduplicada de The Pile durante 32.000 millones de tokens, con un presupuesto muy superior al habitual para un modelo de este tamano (ratio de unos 800 tokens por parametro). No se indica en la informacion disponible que se aplicase RLHF, DPO, SFT u otro ajuste posterior: se trata de un modelo base preentrenado. La innovacion del trabajo no esta en la arquitectura, sino en el diseno experimental: 108 modelos entrenados variando sistematicamente batch size, weight decay, learning rate, presupuesto de tokens y LR final, para analizar el rango efectivo de la matriz de unembedding. Las conclusiones del articulo indican que un rango efectivo alto suele acompanar a los mejores modelos pero no de forma universal, que el rango bajo coexiste con la degradacion tardia en lugar de causarla, y que ninguna metrica geometrica predice de forma fiable el rendimiento downstream.

## Capacidades

- Generacion de texto autoregresiva basica: al ser un modelo base de 40M de parametros entrenado sobre The Pile, produce texto en ingles con coherencia local limitada y sin ajuste por instrucciones.
- Modelado de lenguaje y estimacion de probabilidad de secuencias: es su uso mas solido, ya que se trata de un modelo base sin alineacion.
- Capacidad de continuacion de texto y few-shot prompting rudimentario en el estilo de GPT-2 small o Pythia-70M; no hay evidencia publicada de capacidades fiables de razonamiento o matematicas.
- Soporte de tool calling / function calling: no disponible (no se documenta ningun formato de herramientas ni ajuste para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el corpus de entrenamiento (The Pile deduplicado) es predominantemente en ingles.
- Capacidad especial destacable: publica 41 checkpoints intermedios en ramas del repositorio, lo que permite analisis de trayectorias de entrenamiento, y registra el orden de los datos (`data-indices/` y `train_data/global_indices.npy`), una funcionalidad pensada para reproducibilidad de investigacion.
- No se documentan modos de pensamiento (thinking), vision, audio ni otras modalidades.

## Casos de uso

- Investigacion sobre geometria de representaciones: el modelo es una pieza de la suite GeoLadder y sirve para replicar los analisis de rango efectivo de la matriz de unembedding descritos en el articulo, comparando esta configuracion con las otras 107 variantes.
- Estudios de escalado controlado: al variar solo batch size, weight decay, LR y LR final respecto a otros miembros de la suite, permite aislar el efecto de cada hiperparametro sobre el rendimiento y las metricas internas.
- Investigacion sobre dinamica de entrenamiento: las 41 ramas de checkpoint (`step0` a `step122081`) permiten trazar la evolucion de una metrica concreta a lo largo del entrenamiento sin reentrenar el modelo.
- Reproducibilidad de experimentos de la Pile deduplicada: los ficheros `data-indices/` y `train_data/global_indices.npy` permiten reconstruir exactamente el orden de los datos, util para auditorias de contaminacion o de memorizacion.
- Prototipado de infraestructura de inferencia a muy bajo coste: con 40M de parametros cabe en CPU y en cualquier GPU consumer, por lo que sirve para validar pipelines de `transformers`, evaluacion o serializacion antes de escalar a modelos mayores.
- Educacion y docencia: es un caso de estudio asequible para explicar como se entrena un transformer causal desde cero, como se cargan checkpoints estilo OLMo con `hf_olmo` y como se interpretan los hiperparametros de un schedule coseno.
- Analisis de memorizacion y privacidad en corpus publicos: su escala reducida y el acceso al orden exacto de datos facilitan experimentos sobre que secuencias se memorizan a distintas alturas del entrenamiento.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, agentes ni tareas de razonamiento: no hay evidencia publicada de que pueda desempenarlas con calidad utilizable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tablas de MMLU, HumanEval, GSM8K, LAMBADA ni ninguna otra metrica estandar, y los resultados de busqueda web proporcionados no contienen datos de evaluacion del modelo (se refieren al termino "dill" en contextos no relacionados). El articulo asociado estudia la relacion entre geometria y rendimiento, pero los valores concretos por modelo no se reproducen en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 160 MB en fp32, 80 MB en fp16/bf16 y 40 MB en int8 para los pesos. El consumo real dependera del tamano de lote y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada pueden ejecutarlo con holgura.
- Compatibilidad con GPU consumer: si, en todas las gamas actuales, e incluso en CPU. Es un modelo que cabe en memoria de sistema sin problemas.
- Opciones de despliegue: `transformers` con el paquete `ai2-olmo` instalado (unica via documentada por el autor, ya que usa la arquitectura legacy `hf_olmo` y pesos `pytorch_model.bin`). Para vLLM, llama.cpp u Ollama seria necesario convertir los pesos, y no se publican versiones GGUF ni safetensors en la informacion disponible.
- Latencia y throughput estimados: no disponible. Al tratarse de un modelo de 40M de parametros, la latencia por token sera del orden de milisegundos en GPU consumer, pero no hay mediciones publicadas.
- Nota de compatibilidad: el uso de la arquitectura legacy `hf_olmo` puede complicar la integracion con ecosistemas de inferencia modernos (vLLM, TGI) sin una conversion previa del checkpoint.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de este modelo que permitan una comparacion cuantitativa. La tabla siguiente recoge la comparacion de caracteristicas frente a alternativas de la misma categoria de tamano (modelos muy pequenos de investigacion), marcando como "no disponible" los datos no confirmados en la informacion proporcionada.

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GeoLadder-40M-32B-bs128-lr0.0065-wd0.1-decay0.01 | 40M | 2048 (secuencias de entrenamiento) | 32B | The Pile deduplicado | no disponible | HuggingFace (dill-lab), 41 ramas de checkpoint |
| Pythia-70M (EleutherAI) | 70M | 2048 | 300B (suite completa) | The Pile | Apache 2.0 | HuggingFace (EleutherAI) |
| GPT-2 small (OpenAI) | 124M | 1024 | no disponible en la informacion proporcionada | WebText | MIT (pesos publicados por OpenAI) | HuggingFace |
| Otros miembros de la suite GeoLadder | 4M-75M | 2048 | variable segun configuracion | The Pile deduplicado | no disponible | Coleccion GeoLadder en HuggingFace |

La comparacion relevante para este modelo no es de rendimiento, sino de proposito: frente a Pythia-70M o GPT-2 small, su valor diferencial es la publicacion de 41 checkpoints intermedios y del orden exacto de los datos de entrenamiento dentro de un diseno experimental controlado.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre The Pile deduplicado, hereda los sesgos de ese corpus (predominio de texto en ingles de origen web, foros y repositorios, con los sesgos de genero, raza, religion y nacionalidad documentados en ese dataset). No hay evaluaciones de sesgo publicadas para este modelo concreto.
- Riesgo de alucinacion: alto en terminos relativos, dado que es un modelo base de 40M de parametros sin ajuste por instrucciones ni RLHF. No debe usarse para generar informacion factual sin verificacion.
- Limitaciones de contexto: la longitud de secuencia documentada es de 2048 tokens. No se indica si el modelo soporta ventanas mayores en inferencia.
- Limitaciones de idioma: el entrenamiento es sobre un corpus mayoritariamente en ingles; no se documenta soporte funcional de otros idiomas, incluido el castellano.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada. Antes de cualquier uso comercial es imprescindible contactar con los autores y verificar los terminos, tambien los del dataset The Pile deduplicado.
- Caveat de produccion: la arquitectura legacy `hf_olmo` y el formato `pytorch_model.bin` no son directamente compatibles con muchos servidores de inferencia modernos. Ademas, el repositorio ocupa 11.2 GB porque incluye 41 checkpoints, lo que complica la descarga selectiva si no se usa `revision`.
- Caveat metodologico: el modelo es un artefacto de investigacion. Su proposito es estudiar geometria y entrenamiento, no ofrecer calidad generativa. La conclusion del propio articulo es que las metricas geometricas analizadas no predicen de forma fiable el rendimiento, por lo que no debe asumirse ninguna garantia de calidad derivada de su configuracion.
- Caveat de evaluacion: no hay benchmarks publicados, por lo que cualquier afirmacion sobre su rendimiento relativo seria especulativa.
- Reproducibilidad: la carga de una revision concreta requiere instalar `hf_olmo` y usar el parametro `revision` para seleccionar la rama (`step0` a `step122081`); la rama `main` contiene el checkpoint final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dill-lab/GeoLadder-40M-32B-bs128-lr0.0065-wd0.1-decay0.01
- Coleccion GeoLadder (108 modelos de la suite): https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Articulo (PMLR 306): https://proceedings.mlr.press/v306/kulkarni26c.html
- Preprint en arXiv: https://arxiv.org/abs/2602.20433
- Discusion en OpenReview: https://openreview.net/forum?id=kNb6NNhKgE
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/the_pile_deduplicated
- Repositorio del paquete `ai2-olmo` necesario para cargar los pesos: https://github.com/allenai/OLMo (referencia de la arquitectura OLMo; no se proporciona un enlace directo en la informacion disponible)
