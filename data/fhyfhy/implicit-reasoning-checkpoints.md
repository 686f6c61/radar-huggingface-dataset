# fhyfhy/Implicit-Reasoning-checkpoints

## Resumen

Implicit-Reasoning-checkpoints es un repositorio de checkpoints y código asociado al proyecto DiscoLoop, un trabajo de investigación sobre razonamiento composicional multi-hop con transformadores en bucle (looped transformers). Lo publica el usuario fhyfhy en Hugging Face y contiene 107 directorios de entrenamiento producidos entre julio y agosto de 2026 durante la fase de réplica (rebuttal) de un artículo académico. El modelo base es una pila de bloques GPT-2 pequeños que se aplica repetidamente K veces, con un canal de embedding discreto entre bucles.

La innovación principal, denominada DiscoLoop, consiste en decodificar la salida de cada bucle a través de la cabeza LM atada, re-codificarla como suma ponderada por probabilidad de embeddings de tokens, mezclarla con los embeddings de entrada y sumarla de nuevo al estado oculto continuo. Esto introduce un canal discreto explícito en el bucle que, según el autor, facilita el razonamiento multi-hop. El repositorio incluye también implementaciones de líneas base como PonderLM, argmax feedback y vanilla loop.

Es relevante ahora porque expone de forma abierta un conjunto amplio de experimentos (tareas simbólicas de 2 a 5 saltos y razonamiento en lenguaje natural de 2 saltos) con hiperparámetros, curvas de precisión por etapa y código de carga y evaluación. No obstante, el propio autor advierte que la correspondencia entre estos checkpoints y las cifras del artículo no está confirmada, por lo que debe tratarse como material de investigación reproducible más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped transformer sobre bloques GPT-2 (2 u 8 bloques por bucle) con canal de embedding discreto (DiscoLoop) |
| Parametros totales | No disponible (depende del tamano base GPT-2 y de K; no se especifica en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en formato PyTorch; no se mencionan GGUF ni cuantizaciones) |
| Idiomas soportados | No disponible (tareas simbólicas y un tokenizador GPT-2 de nombres/relaciones para lenguaje natural) |
| Licencia | Other, license_name unspecified (no se concede licencia explicita; uso comercial no garantizado) |
| Formato de pesos | PyTorch (.pt, hyper_model.pt y checkpoints intermedios); no safetensors ni GGUF |

## Arquitectura y entrenamiento

DiscoLoop es un transformador en bucle en el que una pila pequena de bloques GPT-2 (2 u 8 bloques mas un LayerNorm final) se aplica K veces. Entre bucles se aplica la actualizacion `H_{i+1} = f(H_i) + RMSNorm(alpha * phi_i + beta * H_0)`, donde `phi_i = softmax(f_i W_E^T) W_E` es la retroproyeccion del logit a traves de los embeddings atados. Los coeficientes `alpha` y `beta` pueden ser constantes fijas o puertas sigmoides aprendidas por token (inicializadas a cero, es decir, alpha = beta = 0.5 al inicio). El ultimo bucle es siempre un bucle vanilla sin canal discreto. El entrenador implementa ademas variantes como `discoloop_nonorm`, `discoloop_notight`, `vanillaloop`, `ponderlm`, `ponderlm_input` y `argmax`.

Los checkpoints se generaron con `code/train_twin_hyper.py` entre el 24 de julio y el 2 de agosto de 2026, durante el periodo de replica del articulo. Las tareas cubiertas son razonamiento simbolico de 2, 3, 4 y 5 saltos y razonamiento en lenguaje natural de 2 saltos, este ultimo con el tokenizador `multi-hop/tokenizers/gpt2_names_relations`. De los 107 directorios, 73 completaron el entrenamiento, 25 se detuvieron a mitad con solo checkpoints intermedios, 7 contienen unicamente registros y metricas, y 2 estan vacios. No se subieron los estados del optimizador. El autor advierte que la revision exacta del entrenador que escribio cada ejecucion no se registro y que las diferencias visibles incluyen nombres de metricas y la opcion `--lr-scheduler-type`.

## Capacidades

- Razonamiento composicional multi-hop en dominios simbolicos: cadenas de 2, 3, 4 y 5 saltos sobre grafos de relaciones.
- Razonamiento de 2 saltos en lenguaje natural con un tokenizador especifico de nombres y relaciones.
- Evaluacion por etapa: cada ejecucion reporta la precision de respuesta tras cada bucle (`stage{k}_acc`), lo que permite analizar la dinamica del razonamiento iterativo.
- Variantes de retroalimentacion discreta: DiscoLoop con y sin RMSNorm, con embeddings atados o no atados, PonderLM, argmax feedback y bucle vanilla.
- No se documentan capacidades de generacion abierta, codigo, matematicas, vision, tool calling, agentes ni modo de pensamiento.
- Soporte multilingue: no disponible; el unico tokenizador mencionado es de GPT-2 para un dominio restringido.

## Casos de uso

- Investigacion en razonamiento composicional: el repositorio permite reproducir y comparar variantes de bucle (DiscoLoop, PonderLM, argmax, vanilla) sobre tareas de 2 a 5 saltos, cargando cualquier checkpoint con `examples/load_checkpoint.py`.
- Analisis de dinamica de bucles: los scripts `loop_dynamics.py`, `loop_cycle_check.py` y `loop_flip_analysis.py` permiten estudiar como evoluciona la prediccion a lo largo de las K iteraciones y detectar ciclos o cambios de respuesta.
- Estudio de retroalimentacion discreta frente a continua: comparar `discoloop` con `ponderlm` y `argmax` para medir el efecto de introducir un canal discreto en el estado oculto.
- Docencia y formacion: usar los checkpoints intermedios y las curvas de precision por etapa como material didactico sobre transformadores en bucle y razonamiento iterativo.
- Reproducibilidad de articulos: el indice `checkpoints_index.json` y los registros de barrido permiten auditar hiperparametros, comandos de lanzamiento y configuraciones de cada ejecucion.
- Exploracion de arquitecturas alternativas: el entrenador unificado permite lanzar nuevos experimentos con `--loop-scheme` y `--gate-mode` sobre los mismos conjuntos de datos incluidos (2/3/4/5/6 saltos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona metricas internas por etapa (`stage{k}_acc` y precision del ultimo bucle) pero no proporciona cifras concretas, y advierte explicitamente que la correspondencia entre estos checkpoints y las cifras del articulo no esta confirmada.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende del tamano base de GPT-2 (no especificado) y de K; el repositorio completo ocupa 78,9 GB, pero cada checkpoint individual es mucho menor.
- GPU recomendadas: no disponibles. El entrenamiento se lanzo con envoltorios multi-GPU (`train_twin_hyper_4gpu.sh`), lo que sugiere ejecuciones en varias GPU, pero no se detalla el hardware.
- Compatibilidad con GPU de consumo: probable para checkpoints individuales dado que la pila base es GPT-2 pequena, pero no confirmado en la informacion disponible.
- Opciones de despliegue: carga mediante PyTorch con `examples/load_checkpoint.py` en CPU o GPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y los pesos no estan en GGUF ni safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Implicit-Reasoning (DiscoLoop) | No disponible (GPT-2 pequeno x K bucles) | No disponible | Looped transformer con canal discreto | Other (unspecified) | Hugging Face, 107 checkpoints |
| Universal Transformer | No disponible | No disponible | Transformer con profundidad recurrente | No disponible | Literatura academica |
| PonderLM | No disponible | No disponible | Bucle con retroalimentacion de embedding suave | No disponible | Implementado como linea base en este repo |
| Vanilla looped transformer | No disponible | No disponible | Bucle simple sin canal discreto | No disponible | Implementado como linea base en este repo |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia es "other" con nombre "unspecified": no se concede permiso explicito de uso comercial ni de redistribucion; conviene contactar con el autor antes de cualquier uso productivo.
- El propio autor advierte que no esta establecido que checkpoints produjeron las cifras del articulo; no deben citarse como fuente de resultados publicados.
- La revision exacta del entrenador que genero cada ejecucion no se registro; las ejecuciones mas antiguas pueden diferir en metricas y opciones.
- No se subieron los estados del optimizador, lo que impide reanudar el entrenamiento exactamente desde donde se dejo.
- 25 directorios solo contienen checkpoints intermedios y 7 solo registros; no todos los experimentos estan completos.
- El ambito es muy restringido: tareas simbolicas de 2 a 5 saltos y 2 saltos en lenguaje natural; no hay evidencia de capacidades generales de generacion, codigo o matemeticas.
- No se documentan sesgos, riesgos de alucinacion ni evaluaciones de seguridad; al ser un artefacto de investigacion, no hay garantias para produccion.
- El tokenizador de lenguaje natural es especifico del dominio (`gpt2_names_relations`), lo que limita la transferencia a otros vocabularios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fhyfhy/Implicit-Reasoning-checkpoints
- Repositorio GitHub del proyecto (privado segun la model card): `hengyuf/Implicit-Reasoning`
- Rama de publicacion del articulo: `discoloop-release` (commit 794447c), incluida en `code-release/`
- Script de carga y evaluacion: `examples/load_checkpoint.py`
- Indice de checkpoints: `checkpoints_index.json`
- Articulo de DiscoLoop: no disponible en la informacion proporcionada
