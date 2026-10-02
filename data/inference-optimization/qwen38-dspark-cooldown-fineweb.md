# inference-optimization/qwen38-dspark-cooldown-fineweb

## Resumen

qwen38-dspark-cooldown-fineweb es el checkpoint final del cooldown (annealing lineal de learning rate) del modelo borrador DSpark de la etapa 1, desarrollado por el usuario inference-optimization. No es un modelo de lenguaje autonomo: es un draft de decodificacion especulativa disenado para acelerar la inferencia de un modelo verificador congelado, Qwen/Qwen3.8-27B, que no viene incluido en el repositorio. El artefacto contiene unicamente pesos (weights-only), con el optimizador, el scheduler y el training state excluidos de forma intencionada.

Arquitectonicamente es un transformer reducido de 5 capas, con hidden de 5120, block_size 8 y muestreo desde el anchor (sample_from_anchor), condicionado solo por tokens. Incorpora dos cabezas: markov_head (condicionamiento de Markov dentro del bloque) y confidence_head (probabilidad de aceptacion por posicion). El dato real de safetensors cifra el total en 1.804.930.817 parametros y el repositorio ocupa 3,6 GB.

El checkpoint calienta desde la frontera V16 del pretrain (paso 104.768) y entrena 10.173 pasos adicionales, equivalentes a 2,00B tokens del mismo flujo FineWeb, con un descenso lineal de LR de 1e-3 a ~0. Es relevante ahora porque fija la referencia de aceptacion de la etapa 1 y es el punto de partida declarado para la etapa 2 (destilacion de hidden states mediante la expansion de la capa fc).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft de decodificacion especulativa DSpark: transformer de 5 capas, hidden 5120, block_size 8, sample_from_anchor, condicionamiento solo por tokens (target_layer_ids: [0]) |
| Parametros totales | 1.804.930.817 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible; el conjunto de validacion empleado en el entrenamiento es multilingue |
| Licencia | no disponible |
| Formato de pesos | safetensors (config.json + model.safetensors), con custom_code: config.py registra la clase del modelo y val_metrics.json las metricas finales |

## Arquitectura y entrenamiento

El modelo es un draft DSpark de 5 capas de transformer con dimension oculta 5120, tamaño de bloque 8 y estrategia sample_from_anchor, y aproximadamente 0,46B parametros entrenables segun la model card (el total de fichero es mayor, 1,8B, por la geometria de los pesos almacenados). El condicionamiento es exclusivamente por tokens: fc recibe una entrada de forma [T, 5120] construida sobre los embeddings congelados del verificador, sin usar hidden states del mismo. Se incluyen en los pesos markov_head, que modela el condicionamiento de Markov dentro del bloque, y confidence_head, que estima la probabilidad de aceptacion por posicion. Los embed_tokens y lm_head son propiedad del verificador y se reconstruyen desde Qwen/Qwen3.8-27B, que debe descargarse aparte del hub.

El entrenamiento parte de un warm start desde el snapshot V16 del pretrain (inference-optimization/qwen38-dspark-pretrain-fineweb) mediante from_pretrained, con optimizador Muon nuevo a LR pico 1e-3, 100 pasos de warmup y descenso lineal hasta ~0 a lo largo de 2e9 tokens (10.173 pasos a 196.608 tokens globales por paso). Los datos son identicos a los del pretrain (mismo dataset, mismo split, empaquetado de 24.576 tokens, 3.072 anchors por bloque de 8, 8-way FSDP, semilla 42) y el parametro trainer.skip_steps: 104.768 permite continuar exactamente el flujo de datos del epoch 0 sin repetir ni saltar batches. La funcion de perdida es ce_token: entropia cruzada con etiquetas duras frente a los tokens greedy del verificador, con EOS en <|im_end|>. El entorno declarado es torch 2.13.0 y transformers 5.16.1, sobre un fork de vllm-project/speculators en el commit 63fe7df755e2b3ca0ccce1f0b842dd5ee674fdc8, rama qwen38-27b-dspark-pretraining.

## Capacidades

- Prediccion de bloques de hasta 8 tokens condicionada por los embeddings del verificador Qwen3.8-27B, para su uso en decodificacion especulativa.
- Estimacion de aceptacion por posicion mediante confidence_head, que permite decidir cuantos tokens del bloque aceptar.
- Modelado de dependencias intra-bloque mediante markov_head, que conserva la correlacion entre posiciones dentro del bloque.
- No genera texto de forma autonoma: carece de utilidad sin el verificador congelado, del que dependen embed_tokens y lm_head.
- No dispone de tool calling, function calling ni capacidades de agente por si mismo; cualquier capacidad de este tipo proviene del verificador.
- Capacidades multilingues: no especificadas para el draft; el val empleado en el entrenamiento es multilingue y la cobertura final depende del verificador.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito.
- Reanudacion de entrenamiento: no soportada con este artefacto, ya que el optimizador, el scheduler y el training state se excluyeron intencionadamente.

## Casos de uso

- Aceleracion de la decodificacion de Qwen3.8-27B en produccion: el draft propone bloques de 8 tokens que el verificador valida en paralelo; con una longitud media aceptada (accept_len) de 1.444 tokens por bloque, la ganancia efectiva es modesta y debe medirse por carga de trabajo.
- Serving de alto throughput con presupuesto de VRAM ajustado: el draft ocupa 3,6 GB en el repositorio y se puede alojar junto al verificador en la misma GPU, reduciendo el numero de pasos secuenciales del modelo grande.
- Investigacion en decodificacion especulativa: sirve como punto de reproducibilidad de una receta completa (cooldown lineal sobre flujo de datos continuado) con metricas de validacion registradas en val_metrics.json.
- Base para destilacion de hidden states de etapa 2: la model card define explicitamente este checkpoint como el punto de partida previsto para la expansion de fc.weight de [5120, 5120] a [5120, 46080] y el uso de aux_hidden_state_layer_ids de [0] a [0, 4, 12, 20, 28, 36, 44, 52, 60].
- Evaluacion comparativa de estrategias de borrador: al publicar perdida de validacion, eal, accept_rate, full_acc y accept_len, permite contrastar variantes de entrenamiento sin reentrenar desde cero.
- Ajuste de infraestructura de inferencia: su tamaño permite iterar rapidamente sobre configuraciones de vLLM/speculators y medir el impacto del ratio de aceptacion en el coste por token.
- Despliegue en entornos de investigacion con GPU de consumo: el borrador cabe en GPUs consumer, aunque el verificador de 27B condiciona el requisito real de memoria del sistema completo.

## Benchmarks y rendimiento

Metricas de validacion del cooldown (misma cola multilingue de validacion que la serie V1-V16 del pretrain; todas las metricas son monotonas en cada frontera):

| Metrica | V16 (inicio) | paso 840 | paso 3.296 | paso 5.752 | paso 8.208 | final |
|---|---|---|---|---|---|---|
| val loss | 2,1582 | 2,141 | 2,111 | 2,087 | 2,075 | 2,0726 |
| eal | 1,6181 | 1,637 | 1,675 | 1,703 | 1,721 | 1,7229 |
| position_0_acc | 0,3564 | 0,362 | 0,374 | 0,383 | 0,388 | 0,3888 |

Metricas finales del checkpoint:

| Metrica | Valor |
|---|---|
| cooldown step | 10.173 / 10.173 (posicion 114.941 del flujo del epoch 0) |
| val loss | 2,0726 |
| eal | 1,7229 |
| position_0_acc | 0,3888 |
| accept_rate | 0,1559 |
| full_acc | 0,2734 |
| accept_len | 1,444 |

Mejora respecto al warm start V16: loss -0,086, eal +0,105, position_0_acc +0,032. El resultado queda 0,045 por debajo del suelo de extrapolacion con LR constante (~2,118). Definiciones: eal es la longitud aceptada esperada greedy por bloque de 8 tokens, incluido el token bonus +1 del verificador (calculo por rachas, preserva la correlacion intra-bloque, techo 9,0); accept_rate y accept_len son cantidades analiticas de rejection sampling (1 - solapamiento de TV). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, lo cual es coherente con la naturaleza de borrador del modelo.

## Requisitos de hardware

- Pesos del borrador: 3,6 GB de repositorio, que en bf16/fp16 corresponden a aproximadamente 3,6 GB de VRAM para el draft aislado. Al no publicarse cuantizaciones, la ejecucion en precision reducida distinta de bf16/fp16 no esta soportada de fabrica.
- Verificador: Qwen3.8-27B no esta incluido y debe descargarse del hub; en bf16 requiere aproximadamente 54 GB solo para pesos (estimacion aritmetica de 27e9 parametros x 2 bytes), antes de cache KV.
- Cabe en GPU de consumo: el borrador si (por ejemplo, RTX 4090, 24 GB); el sistema completo con el verificador de 27B no cabe en una GPU consumer de 24 GB en bf16.
- GPU recomendadas para el sistema completo: A100 80 GB, H100 80 GB o configuraciones multi-GPU, con tensor parallelism para el verificador.
- Opciones de despliegue: speculators (fork de vllm-project/speculators, commit 63fe7df755e2b3ca0ccce1f0b842dd5ee674fdc8) sobre vLLM; no se documentan despliegues con llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponible. La ganancia de la decodificacion especulativa depende del ratio de aceptacion; con accept_len 1,444, el limite superior teorico es de aproximadamente 1,44 tokens aceptados por paso de verificacion antes de contabilizar el token bonus.
- Reproducibilidad del entorno: torch 2.13.0 y transformers 5.16.1, segun los ficheros run.yaml, train_command.txt y speculators.patch incluidos.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen38-dspark-cooldown-fineweb | Draft DSpark, condicionamiento solo por tokens (embeddings del verificador) | 1,804930817 (0,46B entrenables) | no disponible | no disponible | safetensors en HuggingFace |
| EAGLE / EAGLE-2 / EAGLE-3 | Draft con condicionamiento por hidden states del verificador | no disponible | no disponible | no disponible | implementaciones publicas |
| Medusa | Cabezas adicionales sobre el verificador para prediccion multiple | no disponible | no disponible | no disponible | implementaciones publicas |
| Borrador n-grama / lookup decoding | Prediccion sin red neuronal, basada en coincidencias | no aplica | no aplica | no aplica | integrado en varios servidores |

La diferencia tecnica principal frente a EAGLE es el condicionamiento: este checkpoint es token-only, apoyado en los embeddings congelados del verificador (target_layer_ids: [0]) y sin hidden states; la propia model card marca la incorporacion de hidden states como el paso siguiente de la etapa 2. Medusa se diferencia por no ser un modelo independiente, sino cabezas anadidas al verificador. No hay datos publicos de parametros, contexto, rendimiento ni licencia de las alternativas en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje autonomo. Sin el verificador Qwen3.8-27B congelado no produce texto utilizable; embed_tokens y lm_head se reconstruyen desde el verificador.
- La licencia no esta declarada, por lo que no puede confirmarse la viabilidad de uso comercial ni las condiciones de redistribucion. Debe aclararse antes de cualquier despliegue en produccion.
- Requiere custom_code y un fork no estandar de speculators fijado en un commit concreto, lo que implica cargar codigo remoto y asumir el riesgo de seguridad y de mantenimiento asociado.
- Rendimiento de aceptacion limitado en este checkpoint: accept_rate 0,1559, full_acc 0,2734 y accept_len 1,444, con una longitud aceptada esperada (eal) de 1,7229 sobre un techo de 9,0. La aceleracion real sera moderada y muy dependiente del dominio.
- Riesgo de alucinacion: no aplica en el sentido habitual, porque el draft no genera respuestas finales; el verificador valida cada token propuesto. La calidad final del texto depende del verificador.
- Cobertura idiomatica no especificada para el draft. El val es multilingue, pero no se detallan los idiomas ni su proporcion.
- Longitud de contexto no declarada. No hay informacion sobre el limite de secuencia soportado por el borrador.
- Artefacto weights-only: no incluye optimizador, scheduler ni estado de entrenamiento, por lo que no es posible reanudar el entrenamiento exactamente desde este punto sin reconstruir esa informacion.
- Es el checkpoint final de una unica fase de cooldown (2,00B tokens) y no un modelo terminado; la model card lo define como entrada de la etapa 2 de destilacion de hidden states.
- Sesgos conocidos: no disponible. No se publica analisis de sesgos y, al depender de FineWeb heredado del pretrain, podria arrastrar los sesgos de dicho corpus.
- La informacion de rendimiento se limita a metricas internas de validacion del autor; no hay evaluaciones independientes.

## Enlaces

- HuggingFace: https://huggingface.co/inference-optimization/qwen38-dspark-cooldown-fineweb
- Checkpoint de pretrain (warm start): https://huggingface.co/inference-optimization/qwen38-dspark-pretrain-fineweb
- Verificador (no incluido, descarga aparte): https://huggingface.co/Qwen/Qwen3.8-27B
- Fork de speculators: commit 63fe7df755e2b3ca0ccce1f0b842dd5ee674fdc8, rama qwen38-27b-dspark-pretraining (fork de vllm-project/speculators)
- Ficheros de configuracion y receta incluidos en el repositorio: config.json, config.py, val_metrics.json, configs/cooldown-fineweb.yaml, train_command.txt, run.yaml, speculators.patch
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante al modelo; los resultados devueltos corresponden a definiciones del termino "inference" y no aportan informacion tecnica utilizable.
