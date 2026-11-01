# sackfield/qwen2.5-0.5b-transcoders

## Resumen

`sackfield/qwen2.5-0.5b-transcoders` no es un modelo de lenguaje generativo, sino un conjunto de 24 transcoders dispersos (sparse transcoders) entrenados sobre las 24 capas del modelo Qwen2.5-0.5B. Cada transcoder aproxima la transformacion entrada-salida del bloque MLP de su capa correspondiente mediante 16.384 latentes dispersos mas una ruta lineal densa de tipo skip. El objetivo es la interpretabilidad mecanicista: descomponer el computo del MLP en caracteristicas monosemanticas auditables.

El autor es sackfield y el artefacto esta disenado para la herramienta openinterp, un framework de interpretabilidad. La relevancia es practica para investigadores que necesitan un diccionario de referencia rapido y ligero sobre un modelo pequeno (0,5B parametros) con el que validar pipelines de auditoria antes de escalar a modelos mayores. No sustituye al modelo base: se carga junto a el para inspeccionar activaciones.

La ficha describe, por tanto, un artefacto de interpretabilidad: su "rendimiento" no se mide en MMLU o HumanEval, sino en varianza explicada (EV), numero medio de latentes activos (L0) y tasa de latentes muertos. La licencia MIT y el formato float32 plano (safetensors) facilitan su reutilizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transcoder disperso (sparse transcoder) tipo top-k / JumpReLU con ruta skip lineal, uno por capa (24 capas) |
| Parametros totales | No disponible como cifra agregada; por capa: W_enc [896, 16384], b_enc [16384], threshold [16384], W_dec [16384, 896], b_dec [896], W_skip [896, 896] |
| Parametros activos | No aplica (no es MoE); k = 32 latentes activos por token en entrenamiento, L0 observado entre 26,6 y 36,9 |
| Longitud de contexto | No aplica al transcoder; ventana de entrenamiento de 1.024 tokens sobre el modelo base |
| Tipos de cuantizacion | No disponible; pesos exportados en float32 |
| Idiomas soportados | No disponible (heredado del corpus Pile-10k, predominantemente ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (float32), un fichero `layer_<L>.safetensors` por capa, mas `layer_<L>.json` y `train.jsonl` |

## Arquitectura y entrenamiento

Cada transcoder mapea la entrada del MLP (tras `post_attention_layernorm` con su ganancia, capturada con un pre-hook sobre `model.layers[L].mlp`) a la salida del MLP (antes de sumarse al residual). La transformacion es `pre = x @ W_enc + b_enc`, seguida de una activacion JumpReLU (`pre * (pre > threshold)`) y reconstruccion `out = acts @ W_dec + b_dec + x @ W_skip.T`. La ruta skip densa es clave: sin ella, la varianza explicada cae a entre -0,65 y 0,34 en el corpus de escaneo.

Durante el entrenamiento se uso top-k con k = 32; en la exportacion se sustituye por un JumpReLU con un umbral global por capa, elegido para conservar k·T activaciones en un lote de entrenamiento. Las filas del decodificador tienen norma unitaria. La perdida combina MSE con AuxK (Gao et al. 2024), con k_aux = 256 y coeficiente 1/32; un latente se considera muerto tras 500.000 tokens sin activarse. Optimizador Adam con lr 1e-3, warmup y decaimiento lineal, lotes de 4.096 tokens, semilla 0. Las entradas y salidas se escalan a norma media √d y las escalas se pliegan en los pesos exportados.

Los datos son NeelNanda/pile-10k en la revision `127bfedc`, con 13,5 millones de tokens en una sola pasada en piezas de 1.024 tokens (se descarta el primer token de cada pieza). Se excluyen los 518 documentos del corpus de escaneo de openinterp para que las auditorias se hagan sobre texto no visto, y se reservan los ultimos 100 documentos para validacion. El autor califica estos diccionarios como pequenos y de entrenamiento rapido (en un portatil), pensados como linea base de base aprendida para auditorias, no como reconstruccion de estado del arte.

## Capacidades

- Aproximar la funcion de cada MLP del modelo base mediante 16.384 latentes dispersos por capa.
- Proporcionar caracteristicas auditables para interpretabilidad mecanicista (feature discovery, circuit analysis).
- Servir de linea base de reconstruccion para comparar con SAEs y transcoders de mayor calidad.
- Integrarse en el flujo de openinterp mediante `openinterp audit --model Qwen/Qwen2.5-0.5B --dictionary qwen2.5-0.5b-transcoders`.
- Inspeccionar activaciones latentes por token y por capa (L0, latentes muertos, varianza explicada).
- No genera texto, no razona, no soporta tool calling ni agentes: es un artefacto de analisis.
- No dispone de capacidades multilingues propias; depende del corpus de entrenamiento (Pile-10k).

## Casos de uso

- Auditoria de caracteristicas del MLP: cargar el transcoder de una capa concreta y examinar que latentes se activan ante un texto dado, usando openinterp para identificar caracteristicas interpretables.
- Validacion de pipelines de interpretabilidad: probar un nuevo metodo de analisis de SAEs/transcoders sobre un diccionario ligero y conocido antes de aplicarlo a modelos mayores.
- Investigacion de circuitos: sustituir el MLP por su reconstruccion dispersa y medir el efecto sobre la salida del modelo para localizar componentes relevantes.
- Docencia y formacion: demostrar el funcionamiento de un transcoder con pesos float32 planos y una formula explicita de tres lineas, sin dependencias pesadas.
- Comparacion de metodos de entrenamiento de diccionarios: usar la varianza explicada por capa (0,589-0,925) como referencia para evaluar variantes de top-k, JumpReLU o AuxK.
- Analisis de robustez de diccionarios: estudiar la caida de EV sin ruta skip (hasta -0,65) como caso de estudio del papel del camino denso.
- Reproducibilidad de experimentos: el `train.jsonl` y los hiperparametros por capa permiten replicar o auditar el entrenamiento con `scripts/train_transcoders.py`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de NLP (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el artefacto no es un modelo generativo. La metrica relevante es el ajuste de reconstruccion sobre el corpus de escaneo de openinterp (32 documentos, ventanas de 1.024 tokens, primer token excluido):

| Capa | EV | L0 | Muertos | Capa | EV | L0 | Muertos |
|---|---|---|---|---|---|---|---|
| 0 | 0,925 | 31,8 | 0,00% | 12 | 0,589 | 32,2 | 0,18% |
| 1 | 0,750 | 31,6 | 0,01% | 13 | 0,627 | 34,2 | 0,02% |
| 2 | 0,671 | 30,9 | 0,01% | 14 | 0,612 | 33,5 | 0,01% |
| 3 | 0,689 | 32,2 | 0,03% | 15 | 0,649 | 32,6 | 0,01% |
| 4 | 0,702 | 31,2 | 0,02% | 16 | 0,756 | 31,1 | 0,04% |
| 5 | 0,663 | 26,6 | 0,59% | 17 | 0,701 | 29,0 | 0,00% |
| 6 | 0,683 | 32,4 | 0,07% | 18 | 0,640 | 29,2 | 0,07% |
| 7 | 0,671 | 29,4 | 0,51% | 19 | 0,716 | 31,1 | 0,15% |
| 8 | 0,635 | 31,9 | 0,01% | 20 | 0,723 | 33,7 | 0,13% |
| 9 | 0,622 | 31,5 | 0,12% | 21 | 0,627 | 33,4 | 0,09% |
| 10 | 0,598 | 29,6 | 0,32% | 22 | 0,659 | 31,8 | 0,07% |
| 11 | 0,643 | 32,2 | 0,20% | 23 | 0,799 | 36,9 | 0,15% |

En los 100 documentos reservados, la varianza explicada va de 0,61 (capa 12) a 0,93 (capa 0). Sin la ruta skip cae a entre -0,65 y 0,34 en el corpus de escaneo.

## Requisitos de hardware

- VRAM estimada: los 24 ficheros suman 2,9 GB en float32; cargar todos requiere aproximadamente 3 GB, mas el modelo base Qwen2.5-0.5B (unos 1 GB en fp16 o 2 GB en fp32).
- GPU recomendadas: cualquier GPU consumer con 6-8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en CPU para inferencia de auditoria por lotes.
- Cabe en GPU consumer: si, con holgura; el cuello de botella es el modelo base, no los transcoders.
- Opciones de despliegue: no aplica servidor de inferencia tipo vLLM/TGI/Ollama; se cargan con safetensors y PyTorch dentro de openinterp o scripts propios.
- Latencia y throughput: no disponibles; al ser matrices pequenas (896x16384) el coste por capa es minimo frente al forward del modelo base.

## Comparativa con modelos similares

| Artefacto | Modelo base | Latentes por capa | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| sackfield/qwen2.5-0.5b-transcoders | Qwen2.5-0.5B (24 capas) | 16.384 | safetensors float32 | MIT | Transcoder con ruta skip; EV 0,589-0,925 |
| SAE generico sobre modelos pequenos | Variable | No disponible | Variable | Variable | No disponible en la informacion proporcionada |
| SAE de Anthropic / Gemma Scope | Modelos mayores | No disponible | Variable | Variable | No disponible en la informacion proporcionada |

No se dispone de datos comparativos verificados de otros transcoders o SAEs en la informacion proporcionada; la comparativa queda limitada a la referencia cualitativa del propio autor frente a reconstrucciones de estado del arte.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni debe usarse para tareas de NLP.
- Reconstruccion limitada: el propio autor lo describe como linea base, no como estado del arte; la EV baja hasta 0,589 en la capa 12.
- Dependencia critica de la ruta skip: sin ella la EV se vuelve negativa en varias capas.
- Entrenado solo con 13,5 millones de tokens en una pasada; cobertura limitada del espacio de activaciones.
- Sesgos heredados del corpus Pile-10k, predominantemente en ingles; no hay evaluacion multilingue.
- Latentes muertos residuales en algunas capas (hasta 0,59% en la capa 5).
- Solo valido para Qwen2.5-0.5B en la revision concreta; no es transferible a otras variantes sin reentrenar.
- Licencia MIT permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia que debe respetarse por separado.
- No hay garantia de que los latentes sean interpretables semanticamente; requieren validacion manual.

## Enlaces

- HuggingFace: https://huggingface.co/sackfield/qwen2.5-0.5b-transcoders
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- openinterp: https://github.com/8W9aG/openinterpretability
- Dataset: https://huggingface.co/datasets/NeelNanda/pile-10k (revision `127bfedc`)
- Referencia AuxK: Gao et al. 2024 (citado en la model card; enlace no disponible)
