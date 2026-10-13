# dill-lab/GeoLadder-40M-32B-bs32-lr0.0065-wd0.1-decay0.01

## Resumen

GeoLadder-40M-32B-bs32-lr0.0065-wd0.1-decay0.01 es un modelo de lenguaje de 40 millones de parametros desarrollado por el grupo dill-lab (Atharva Kulkarni, Jacob Mitchell Springer, Arjun Subramonian y Swabha Swayamdipta) como parte de la suite GeoLadder, publicada junto al articulo "Disentangling Geometry, Performance, and Training in Language Models" (ICML 2026, PMLR 306). Se trata de un modelo denso, decoder-only, con la arquitectura OLMo clasica (`OLMoForCausalLM`, registro `hf_olmo`), entrenado desde cero sobre EleutherAI/the_pile_deduplicated.

El modelo pertenece a un conjunto de 108 modelos de entre 4M y 75M de parametros entrenados con variaciones controladas de batch size, weight decay, learning rate, presupuesto de tokens y LR final. Este checkpoint concreto combina 40M de parametros, 32B tokens de entrenamiento, batch size de 32 secuencias de 2048 tokens, LR pico de 0.0065, weight decay de 0.1 y un LR final del 1 % del pico (`alpha_f = 0.01`) con schedule coseno. El repositorio incluye 40 checkpoints intermedios como ramas (`step0` a `step488292`), lo que lo convierte en un objeto de estudio longitudinal, no en un modelo pensado para produccion.

Su relevancia es fundamentalmente cientifica: el articulo investiga si la geometria de la matriz de unembedding (en particular su rango efectivo) permite estimar el rendimiento downstream, y concluye que la relacion es inconsistente, que las decisiones de preentrenamiento moldean fuertemente esas metricas geometricas y que ninguna de ellas predice de forma fiable el rendimiento final. La ficha siguiente describe el checkpoint tal y como se publica; no existe informacion sobre licencia, idiomas declarados ni resultados de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo OLMo (`OLMoForCausalLM`, arquitectura legacy `hf_olmo`) |
| Parametros totales | 40M |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia empleada en el entrenamiento segun la model card; no se declara una ventana de contexto distinta) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; solo `pytorch_model.bin`) |
| Idiomas soportados | no disponible (entrenado sobre EleutherAI/the_pile_deduplicated, corpus de predominio anglosajon) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) con `config.json` de HuggingFace y `config.yaml` original de OLMo; sin safetensors ni GGUF |
| Tokens de entrenamiento | 32B |
| Batch size | 32 secuencias de 2048 tokens |
| Learning rate pico | 0.0065 |
| Weight decay | 0.1 |
| Alpha final de LR (`alpha_f`, schedule coseno) | 0.01 |
| Checkpoints publicados | 40 ramas (`step0` ... `step488292`); `main` apunta al checkpoint final |
| Tamano del repositorio | 10.3 GB |

## Arquitectura y entrenamiento

La arquitectura es la de OLMo en su version legacy, expuesta mediante la clase `OLMoForCausalLM` del paquete `hf_olmo`, que es necesario instalar para cargar los pesos con `transformers`. Es un transformer decoder-only denso de 40M de parametros, sin mezcla de expertos, sin atencion lineal ni mecanismos hibridos SSM: se trata deliberadamente de una arquitectura estandar y reproducible, adecuada para experimentos controlados. La secuencia de entrenamiento es de 2048 tokens.

El entrenamiento consume 32B tokens muestreados de EleutherAI/the_pile_deduplicated, con batch size de 32 secuencias, LR pico de 0.0065, weight decay de 0.1 y schedule coseno que decae hasta el 1 % del LR pico. La model card no menciona fases de RLHF, DPO ni ajuste por preferencias: es un modelo unicamente preentrenado. El repositorio conserva la trazabilidad del experimento: cada paso subido es una rama del repo y los directorios `data-indices/` y `train_data/global_indices.npy` registran el orden exacto de los datos de entrenamiento, siguiendo el estilo de la suite Pythia. La innovacion del trabajo no esta en el modelo sino en el diseno experimental: 108 modelos con variaciones factoriales de hiperparametros para analizar la relacion entre geometria del unembedding (rango efectivo), rendimiento downstream y decisiones de entrenamiento.

## Capacidades

- Generacion de texto autoregresiva basica en ingles, limitada por el tamano del modelo (40M de parametros) y por los 32B tokens de preentrenamiento.
- Modelado de lenguaje y calculo de perplejidad sobre texto de The Pile deduplicado, que es su dominio de entrenamiento natural.
- Extraccion de representaciones internas (hidden states) y de la matriz de unembedding para analisis geometrico, que es el proposito central de la suite GeoLadder.
- Evaluacion longitudinal: al publicarse 40 checkpoints intermedios, permite medir la evolucion de capacidades y de metricas geometricas a lo largo del entrenamiento.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, uso agentico, multi-step reasoning, modo thinking, vision, audio ni capacidades multimodales.
- No se declaran capacidades multilingues especificas; el corpus de entrenamiento condiciona un comportamiento casi exclusivamente en ingles.
- Al ser un modelo base sin ajuste por instrucciones, no cabe esperar seguimiento fiable de instrucciones en formato conversacional.

## Casos de uso

- Investigacion sobre geometria de representaciones: analizar el rango efectivo de la matriz de unembedding en los 40 checkpoints publicados (`step0` a `step488292`) y contrastarlo con la perplejidad, replicando el experimento central del articulo de ICML 2026.
- Baseline controlado en estudios de scaling: este checkpoint es uno de los 108 modelos de la suite con hiperparametros fijados de forma explicita (32B tokens, batch 32, LR 0.0065, wd 0.1, alpha_f 0.01), por lo que sirve como punto de referencia aislado al variar una sola decision de entrenamiento.
- Analisis de la dinamica de entrenamiento tardia: la rama `main` corresponde al paso 488292, lo que permite estudiar fenomenos de degradacion en etapas finales y su posible coexistencia con cambios en el rango efectivo.
- Validacion de herramientas del ecosistema OLMo: probar scripts de carga con `hf_olmo`, conversion de `config.yaml` a `config.json` y pipelines de evaluacion sobre una arquitectura legacy que ya no es la ruta por defecto de `transformers`.
- Pruebas de integracion y CI sin GPU: con 40M de parametros, los pesos en fp32 ocupan aproximadamente 160 MB, de modo que un test unitario puede descargar el modelo, ejecutar una generacion corta y validar el pipeline completo en CPU en un runner estandar.
- Docencia y cursos de entrenamiento de modelos de lenguaje: el coste de un preentrenamiento de 32B tokens a esta escala es acotado, y los checkpoints intermedios permiten ilustrar visualmente como evoluciona un transformer durante el entrenamiento.
- Destilacion y modelos estudiantes: utilizarlo como referencia pequena o como estudiante en experimentos de destilacion desde modelos mayores, aprovechando que su tokenizador y arquitectura son los de OLMo.
- Generacion de datos sinteticos y ablaciones de datos: al ser un modelo base barato de ejecutar, permite generar grandes volumenes de texto para experimentos de filtrado, deduplicacion o comparacion de ordenaciones de datos usando `global_indices.npy`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones equivalentes para este checkpoint, y el articulo asociado se centra en la relacion entre metricas geometricas (rango efectivo del unembedding) y rendimiento, concluyendo que dicha relacion es inconsistente y que ninguna de esas metricas predice de forma fiable el rendimiento downstream.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 160 MB para los pesos en fp32 (40M de parametros), unos 80 MB en fp16/bf16 y unos 40 MB en int8. El repositorio completo ocupa 10.3 GB debido a las 40 ramas de checkpoints y a los indices de datos, no por el tamano del modelo.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente (GTX 1050 Ti, RTX 3050, RTX 4090, A100, H100). No hay requisitos de memoria alta; el cuello de botella no es la VRAM sino la gestion de las 40 ramas del repositorio.
- Compatibilidad con GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso en CPU, Raspberry Pi o telefonos de gama alta, dado que el modelo cabe en memoria con margen amplio.
- Opciones de despliegue: `transformers` con `hf_olmo` instalado es la via documentada (`from_pretrained` con `revision="stepNNNNNN"`). No se publican pesos GGUF, por lo que llama.cpp y Ollama no son compatibles sin una conversion previa no documentada. vLLM y TGI no estan garantizados, ya que el soporte de la arquitectura legacy `hf_olmo` es limitado.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tokens de entrenamiento | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoLadder-40M-32B (este modelo) | 40M | 32B | 2048 | no disponible | HuggingFace, 40 checkpoints en ramas, requiere `hf_olmo` |
| Pythia-70M (EleutherAI) | 70M | 300B (Pile deduplicado) | 2048 | Apache-2.0 | HuggingFace, 154 checkpoints, ampliamente soportado |
| Pythia-160M (EleutherAI) | 160M | 300B (Pile deduplicado) | 2048 | Apache-2.0 | HuggingFace, ecosistema maduro |
| GPT-2 small (OpenAI) | 124M | aproximadamente 40 GB de WebText | 1024 | licencia MIT modificada | HuggingFace, soporte universal |

Los datos de los modelos alternativos proceden de sus model cards publicas. La diferencia principal de este checkpoint frente a ellos no es el rendimiento, que no esta publicado, sino su proposito: forma parte de una suite de 108 modelos con hiperparametros variados de forma controlada y conserva 40 checkpoints intermedios junto al orden exacto de los datos de entrenamiento, algo que ninguna de las alternativas ofrece con ese nivel de trazabilidad.

## Limitaciones y advertencias

- No hay informacion sobre sesgos. El entrenamiento sobre The Pile deduplicado hereda los sesgos documentados de ese corpus (predominio de texto en ingles procedente de web, libros y repositorios, con sobrerrepresentacion de determinados registros y puntos de vista).
- Riesgo de alucinacion elevado: es un modelo base de 40M de parametros con 32B tokens de preentrenamiento, sin ajuste por instrucciones ni fases de RLHF o DPO, por lo que no esta alineado ni calibrado para responder con fidelidad.
- Limitacion de contexto: 2048 tokens, suficiente para experimentos academicos pero insuficiente para tareas de contexto largo, analisis de documentos extensos o conversaciones multi-turno prolongadas.
- Limitacion idiomatica: no se declaran idiomas soportados y el corpus de entrenamiento es mayoritariamente anglosajon; el rendimiento en castellano u otras lenguas no esta caracterizado y cabe esperar que sea pobre.
- Licencia no especificada: al no declararse licencia, no puede asumirse permiso para uso comercial. Cualquier uso en produccion requiere aclarar previamente los terminos con los autores.
- Dependencia tecnica: utiliza la arquitectura legacy `hf_olmo`, que requiere instalar `hf_olmo` (`ai2-olmo`); no dispone de pesos safetensors ni GGUF, lo que complica el despliegue en servidores de inferencia modernos y en herramientas como llama.cpp u Ollama.
- No apto para produccion: no hay benchmarks publicados, no hay evaluaciones de seguridad y el modelo no esta pensado para tareas de usuario final. Su uso apropiado es la investigacion y la experimentacion controlada.
- Tamano del repositorio: 10.3 GB, ya que incluye 40 ramas de checkpoints y los indices de datos; la descarga completa es considerablemente mayor que los aproximadamente 160 MB de un unico checkpoint.
- Fechas de publicacion poco habituales en los metadatos (creacion en octubre de 2026), coherentes con la referencia al congreso ICML 2026; conviene verificar la vigencia del repositorio antes de integrarlo en cualquier flujo de trabajo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dill-lab/GeoLadder-40M-32B-bs32-lr0.0065-wd0.1-decay0.01
- Coleccion GeoLadder (los 108 modelos de la suite): https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Paper (PMLR 306): https://proceedings.mlr.press/v306/kulkarni26c.html
- Preprint en arXiv: https://arxiv.org/abs/2602.20433
- Discusion en OpenReview: https://openreview.net/forum?id=kNb6NNhKgE
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/the_pile_deduplicated
- Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos correspondian al termino "dill" como planta o como palabra en diccionarios, sin relacion con el proyecto dill-lab.
