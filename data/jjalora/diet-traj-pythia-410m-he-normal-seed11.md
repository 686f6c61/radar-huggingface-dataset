# jjalora/diet-traj-pythia-410m-he-normal-seed11

## Resumen

`jjalora/diet-traj-pythia-410m-he-normal-seed11` es un modelo de lenguaje causal de tipo base, de aproximadamente 410 millones de parametros, resultante de un preentrenamiento desde cero con la receta abierta de Pythia-410M de EleutherAI. Lo desarrolla John Alora (usuario `jjalora`) dentro de la campana de weight-space denominada DIET, cuyo objetivo es generar trayectorias de entrenamiento completas y reproducibles variando unicamente la semilla y el esquema de inicializacion de pesos. En este caso concreto se emplea inicializacion `he_normal` con semilla 11, frente al esquema `small_init + wang_init` que usa Pythia original.

El modelo no pretende competir en calidad con LLM actuales: es un artefacto de investigacion orientado al estudio de la dinamica de entrenamiento, la evolucion del conocimiento en el espacio de pesos y la sensibilidad a la inicializacion. La relevancia radica en que publica checkpoints intermedios (pasos 0, 1, 2, 4... 512 y cada 100 pasos hasta el final) con exactamente el mismo flujo de tokens y orden de batches que Pythia, lo que permite comparaciones controladas bit a bit de receta, con la unica diferencia del seed y la init.

Arquitectura transformer autoregresiva GPT-NeoX, contexto de 2048 tokens, entrenamiento sobre `EleutherAI/pile-standard-pythia-preshuffled` y licencia Apache 2.0. El repositorio ocupa 21,9 GB debido a la multiplicidad de ramas de checkpoints en float16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo decoder-only, familia GPT-NeoX (`gpt_neox`), heredada de Pythia-410M |
| Parametros totales | ~410 M (aproximadamente 405 M segun la ficha de Pythia-410M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2048 tokens (fijada por la receta Pythia-410M; no se explicita en la model card) |
| Tipos de cuantizacion | no disponible: el autor solo publica pesos en float16 safetensors. Al ser GPT-NeoX es convertible a GGUF/GPTQ/AWQ, pero no se distribuyen variantes cuantizadas |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors float16, una rama `stepN` por checkpoint; `main` con los pesos finales |

## Arquitectura y entrenamiento

La arquitectura es identica a la de `EleutherAI/pythia-410m`: transformer decoder-only con atencion causal, rotary embeddings, activacion GELU y LayerNorm, sin mezcla de expertos ni componentes de estado recurrente. La unica desviacion respecto al modelo de referencia es el esquema de inicializacion de pesos (`he_normal` en lugar de `small_init + wang_init`) y la semilla aleatoria (11). El autor advierte que la reproduccion exacta a nivel de bit del RNG de inicializacion de EleutherAI no es posible entre frameworks, y que la coincidencia con la revision `step0` de Pythia se verifica a nivel de distribucion por tensor en `tests/test_pythia_step0_init_match.py`.

El entrenamiento sigue el fichero `models/410M/pythia-410m.yml` del repositorio de EleutherAI: AdamW con learning rate 3e-4, betas (0,9; 0,95), weight decay 0,1 sin decaimiento en LayerNorm ni bias, grad clipping 1,0, schedule coseno hasta 3e-5 durante 143.000 pasos, 1.430 pasos de warmup, autocast fp16 con pesos maestros en fp32 y batch global de 1024 secuencias de 2048 tokens (aproximadamente 2,1 M de tokens por paso, lo que equivale a unos 300.000 M de tokens en total). Los datos son el Pile prebarajado, con el mismo orden que Pythia: el batch *i* corresponde a las filas [i·1024, (i+1)·1024) del dataset. No hay etapas de RLHF, DPO ni instruction tuning: es un modelo estrictamente base.

La infraestructura registrada en `campaign.json` corresponde a 4 nodos con 4 GPU A100-SXM4-40GB cada uno (16 GPU en total), micro-batch 4, cluster Nautilus y commit `774da8a`. El checkpoint final se publica en la rama `main` cuando la ejecucion termina.

## Capacidades

- Generacion de texto autoregresiva en ingles, sin alineacion ni formato conversacional.
- Modelado de lenguaje y calculo de perplejidad sobre texto en ingles, util como referencia en experimentos de scaling e interpretabilidad.
- Trazabilidad de checkpoints: acceso a estados intermedios del entrenamiento para estudiar la evolucion de representaciones, circuitos o memorizacion.
- Base para fine-tuning supervisado en tareas de clasificacion, etiquetado o generacion acotada.
- Comparacion controlada de trayectorias de entrenamiento frente a otros runs de la campana DIET (mismo flujo de tokens, distinta init y seed).
- No soporta tool calling ni function calling: no ha recibido entrenamiento de instrucciones ni plantillas de herramientas.
- No soporta agentes, multi-step reasoning ni modo "thinking": carece de post-entrenamiento orientado a razonamiento.
- Capacidades multilingues practicamente nulas: el corpus es el Pile en su configuracion Pythia, dominado por ingles.
- Sin vision, audio ni ninguna modalidad adicional.

## Casos de uso

- **Investigacion en interpretabilidad mecanicista**: analizar como se forman circuitos y representaciones paso a paso usando los checkpoints intermedios (0, 1, 2, 4... 512 y cada 100 pasos), con la ventaja de que el flujo de datos es identico al de Pythia y las diferencias observadas se pueden atribuir a la init o al seed.
- **Ablacion de esquemas de inicializacion**: comparar este run `he_normal` con el run `xavier_normal` del mismo autor y con Pythia original para medir el impacto de la init en la curva de perdida, la norma de pesos y la estabilidad del entrenamiento.
- **Reproducibilidad y estudios de varianza entre semillas**: al fijar receta, datos y orden de batches, el modelo sirve como una muestra mas de la distribucion de resultados de un mismo experimento, util para cuantificar la variabilidad inducida por el seed 11.
- **Analisis de memorizacion del corpus**: con acceso a checkpoints tempranos y al stream exacto del Pile, se puede rastrear en que paso el modelo empieza a memorizar secuencias concretas y contrastarlo con Pythia.
- **Fine-tuning ligero en tareas de NLP acotadas**: clasificacion de texto, analisis de sentimiento o extraccion de entidades en ingles sobre conjuntos pequenos, donde 410 M de parametros permiten iterar en una unica GPU consumer.
- **Docencia y experimentacion con bajo presupuesto**: permite reproducir un pipeline completo de preentrenamiento a escala pequena y estudiar decisiones de optimizacion (warmup, clipping, cosine schedule) sin necesidad de infraestructura grande para la fase de inferencia.
- **Banco de pruebas de tecnicas de compresion**: al ser un GPT-NeoX estandar, es un candidato comodo para evaluar cuantizacion post-entrenamiento, pruning o destilacion comparando contra el checkpoint original de EleutherAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones en MMLU, HumanEval, GSM8K, LAMBADA ni ninguna otra tarea, y tampoco se aportan curvas de perdida numericas. Al tratarse de un run de investigacion con init alterada, no es correcto asumir los resultados publicados de `EleutherAI/pythia-410m` como propios de este checkpoint.

## Requisitos de hardware

- **VRAM para inferencia**: los pesos en float16 ocupan aproximadamente 0,82 GB; con cache KV para 2048 tokens y overhead del runtime, el consumo se situa en torno a 1-1,5 GB. Referencias externas (LLM Explorer) cifran el modelo base Pythia-410M en unos 0,9 GB de VRAM.
- **GPU recomendadas**: cualquier GPU consumer moderna sirve; RTX 3060 12 GB, RTX 4060 Ti, RTX 4090 o superiores trabajan con holgura. Para entrenamiento o fine-tuning completo son razonables A100, H100 o L40S; el run original uso 16 × A100-SXM4-40GB.
- **Cabe en GPU consumer**: si, en practicamente todas las GPU con 4 GB o mas, e incluso en CPU para inferencia por lotes pequenos.
- **Opciones de despliegue**: `transformers` es la via nativa (el tag `endpoints_compatible` sugiere compatibilidad con los endpoints de HuggingFace). vLLM soporta la arquitectura GPT-NeoX. Para llama.cpp u Ollama seria necesario convertir los safetensors a GGUF, conversion no publicada por el autor. La compatibilidad con TGI debe verificarse, ya que el soporte de `gpt_neox` ha variado entre versiones.
- **Latencia y throughput**: no disponibles; el autor no publica mediciones. A titulo orientativo, un modelo denso de 410 M en fp16 sobre una GPU consumer moderna ofrece throughput alto, pero no se aporta ninguna cifra verificable.
- **Almacenamiento**: el repo completo con todas las ramas de checkpoints ocupa 21,9 GB; para inferencia basta con descargar una sola revision (`main` o un `stepN` concreto).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Init / seed | Licencia | Notas |
|---|---|---|---|---|---|---|
| `jjalora/diet-traj-pythia-410m-he-normal-seed11` | ~410 M | 2048 | Pythia-preshuffled Pile, ~300 B tokens | `he_normal`, seed 11 | Apache 2.0 | Run de investigacion con checkpoints intermedios |
| `jjalora/diet-traj-pythia-410m-xavier-normal-seed11` | ~410 M | 2048 | Pythia-preshuffled Pile | `xavier_normal`, seed 11 | Apache 2.0 | Mismo autor; unica diferencia la init (segun la busqueda web) |
| `EleutherAI/pythia-410m` | ~410 M | 2048 | Pile, ~300 B tokens | `small_init + wang_init` | Apache 2.0 | Referencia oficial, con 154 checkpoints publicados |
| `EleutherAI/pythia-410m-deduped` | ~410 M | 2048 | Pile deduplicado, ~300 B tokens | `small_init + wang_init` | Apache 2.0 | Variante con deduplicacion global del corpus |

La comparacion en benchmarks no esta disponible: ninguno de los runs DIET publica evaluaciones, y los resultados de Pythia-410M no son trasladables sin verificar empiricamente el impacto de la init `he_normal`.

## Limitaciones y advertencias

- **Modelo base sin alinear**: no sigue instrucciones, no respeta formatos conversacionales y puede producir continuaciones incoherentes o repetitivas si se usa con prompts de tipo chat.
- **Riesgo alto de alucinacion**: al no tener post-entrenamiento ni retrieval, cualquier uso como fuente de hechos produce contenido no verificado.
- **Sesgos del corpus**: el Pile contiene texto web sin filtrar, con sesgos de genero, raza, religion y orientacion politica, ademas de contenido toxico; el modelo los reproduce sin salvaguardas.
- **Idioma**: solo ingles de forma fiable; el rendimiento en castellano seria marginal y no evaluado.
- **Contexto limitado**: 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- **Estado de investigacion**: es un run individual de una campana; no debe tratarse como un checkpoint validado para produccion. La propia model card advierte que la reproduccion bit a bit del RNG de EleutherAI no es posible.
- **Licencia**: Apache 2.0 permite uso comercial y modificacion con atribucion, pero la calidad del modelo hace desaconsejable su despliegue en productos orientados a usuario final.
- **Peso del repositorio**: 21,9 GB por la acumulacion de ramas; conviene descargar solo la revision necesaria para evitar consumo innecesario de disco y ancho de banda.
- **Trazabilidad de la campana**: la informacion de procedencia depende de `campaign.json` y del commit `774da8a`; sin ese contexto, la interpretacion de los checkpoints pierde buena parte de su valor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jjalora/diet-traj-pythia-410m-he-normal-seed11
- Perfil del autor y resto de runs DIET: https://huggingface.co/jjalora/models
- Modelo de referencia Pythia-410M: https://huggingface.co/EleutherAI/pythia-410m
- Repositorio de EleutherAI Pythia (receta, configs y paper): https://github.com/EleutherAI/pythia
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Paper de Pythia (arXiv 2304.01373): https://arxiv.org/abs/2304.01373
- Ficha externa con datos de VRAM y contexto: https://llm-explorer.com/model/EleutherAI%2Fpythia-410m,32inJLhd40mzGA7wnVKE3Z
