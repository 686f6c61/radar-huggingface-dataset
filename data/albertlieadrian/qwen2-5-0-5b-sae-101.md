# albertlieadrian/qwen2.5-0.5b-sae-101

## Resumen

El modelo `albertlieadrian/qwen2.5-0.5b-sae-101` no es un modelo de lenguaje, sino un **autoencoder disperso (SAE, sparse autoencoder)** entrenado sobre el flujo residual del modelo base Qwen/Qwen2.5-0.5B. Lo publica el autor albertlieadrian como artefacto didáctico vinculado a su tutorial "How to train a sparse autoencoder: a 101 on a small language model". El objetivo no es ofrecer un SAE de vanguardia para investigación, sino servir de ejemplo reproducible de todo el proceso: preparación de datos, entrenamiento, evaluación e interpretación de latentes.

Técnicamente es un SAE TopK con 16.384 latentes (un factor de expansión de 18,3x sobre la dimensión del modelo, d_model = 896) y k = 64 activos por token. Se entrena sobre la activación `blocks.11.hook_resid_post`, es decir, la salida del bloque 11 de los 24 del transformer de Qwen2.5-0.5B, con 102 millones de tokens de FineWeb-Edu en ventanas de 512 tokens.

Su relevancia ahora es formativa y metodológica: permite a desarrolladores e investigadores validar sus propios pipelines de SAE contra cifras de referencia conocidas (FVU, L0, latentes muertos, coste en cross-entropy) y disponer de un punto de partida ligero que se entrena en menos de una hora en una sola GPU A10G.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAE TopK sobre flujo residual (no es un modelo de lenguaje) |
| Parametros totales | no disponible (repo de 0,2 GB; pesos en safetensors) |
| Parametros activos | no aplica (no es MoE); k = 64 latentes activos por token |
| Longitud de contexto | no aplica (opera sobre ventanas de 512 tokens de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | ingles (FineWeb-Edu, texto educativo web); otros idiomas fuera de distribucion |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`sae_weights.safetensors`) + `cfg.json` |
| Modelo base | Qwen/Qwen2.5-0.5B (d_model = 896, 24 bloques) |
| Capa / hook | `blocks.11.hook_resid_post` (salida de `model.layers.11`) |
| Numero de latentes | 16.384 (18,3x d_model) |
| Factor de normalizacion | x 1,8035, plegado en los pesos (alimentar activaciones crudas) |
| Datos de entrenamiento | 102M tokens de FineWeb-Edu `sample-10BT`, ventanas de 512 tokens |
| Entrenamiento | PyTorch manual, Adam, lr 0,0002, batch 4096 tokens, AuxK para latentes muertos, 51 min en una A10G |
| Libreria | saelens (6.x) |

## Arquitectura y entrenamiento

El artefacto es un SAE TopK, no un transformer. Codifica una activacion del flujo residual `x` mediante `pre = (x - b_dec) @ W_enc + b_enc`, retiene los k = 64 valores preactivacion mas altos por token (con ReLU) y reconstruye con `rebuilt = latents @ W_dec + b_dec`. La dimension latente es 16.384 frente a los 896 del modelo base. El factor de normalizacion de 1,8035 se pliega en los pesos, de modo que se deben alimentar activaciones crudas.

El entrenamiento se realizo sobre 102M tokens de FineWeb-Edu (`sample-10BT`) en ventanas de 512 tokens, con Adam, learning rate 0,0002, batch de 4096 tokens y AuxK para reactivar latentes muertos, durante 51 minutos en una unica NVIDIA A10G. Se excluyeron explicitamente las tres primeras posiciones de cada secuencia y los tokens `<|endoftext|>`, porque Qwen2.5 coloca ahi un "attention sink" con unas 86 veces la norma habitual. El repositorio incluye dos SAE: el principal escrito a mano y `saelens-trained/blocks.11.hook_resid_post`, la misma receta entrenada con SAELens sobre los mismos tokens para comparacion.

## Capacidades

- Extraccion de caracteristicas dispersas del flujo residual de Qwen2.5-0.5B en la capa 11: hasta 64 latentes activos por token sobre 16.384 disponibles.
- Reconstruccion de activaciones (`sae.decode`) y codificacion a espacio latente (`sae.encode`).
- Analisis de interpretabilidad: inspeccion de ejemplos de activacion por latente para etiquetar conceptos.
- Evaluacion comparativa de pipelines de SAE mediante metricas estandar (FVU, L0, latentes muertos, latentes densos, cross-entropy con el SAE insertado).
- Carga con SAELens 6.x o con PyTorch plano usando safetensors y `cfg.json`.
- No realiza generacion de texto, razonamiento, codigo ni tool calling: no es un modelo generativo.

## Casos de uso

- Validacion de pipelines propios de SAE: sirve como referencia con cifras conocidas (FVU 0,125, L0 64, 5 latentes muertos) para comprobar que una implementacion reproduce resultados antes de escalar a modelos mayores.
- Docencia e introduccion a la interpretabilidad mecanistica: el tutorial asociado recorre datos, entrenamiento, evaluacion e interpretacion, y este artefacto es el resultado ejecutable de cada paso.
- Prototipado rapido en una sola GPU: con 51 minutos de entrenamiento en una A10G, permite iterar sobre recetas (k, numero de latentes, AuxK) sin coste elevado.
- Analisis de caracteristicas en texto educativo en ingles: inspeccion de que latentes se activan en pasajes de FineWeb-Edu para estudiar representaciones internas de Qwen2.5-0.5B.
- Comparacion de implementaciones (manual frente a SAELens): el repo incluye ambas versiones entrenadas con la misma receta, util para verificar equivalencia de resultados.
- Punto de partida para SAE sobre modelos pequenos: base para experimentos de steering o edicion de activaciones en modelos de 0,5B antes de trasladar la metodologia a modelos mayores.

## Benchmarks y rendimiento

Evaluacion sobre FineWeb-Edu reservado (1.017.024 tokens para FVU; 5.085.252 tokens para latentes muertos y densos):

| SAE | FVU | L0 | Muertos | Densos (>10% tokens) | CE con SAE (nats) | CE recuperada vs mean-ablation |
|---|---|---|---|---|---|---|
| Escrito a mano | 0,125 | 64 | 5 (0,03%) | 0,24% | 2,829 | 0,986 |
| Entrenado con SAELens | 0,124 | 64 | 0 (0,00%) | 0,21% | 2,829 | 0,986 |

Referencias: la cross-entropy limpia es 2,744 nats por token y la mean-ablation de la capa da 8,985 nats. La PCA con 64 componentes obtiene un FVU de 0,505. Insertar el SAE cuesta 0,086 nats por token, 1,7 veces mas que un error aleatorio del mismo tamano.

## Requisitos de hardware

- El SAE en si es minusculo: 16.384 x 896 x 2 matrices mas sesgos, del orden de decenas de millones de parametros; cabe holgadamente en cualquier GPU consumer.
- Para extraer activaciones hace falta ejecutar Qwen2.5-0.5B (0,5B parametros): aproximadamente 1 GB en fp16, 2 GB en fp32; cabe en GPUs con 4-8 GB de VRAM.
- Entrenamiento de referencia: 51 minutos en una unica NVIDIA A10G con 102M tokens.
- Despliegue: SAELens 6.x o PyTorch plano con `safetensors` y `huggingface_hub`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un SAE).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Latentes | Datos | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen2.5-0.5b-sae-101 (este) | SAE TopK didactico | 16.384 (k=64) | 102M tokens | Qwen2.5-0.5B, capa 11 | Apache-2.0 | Hugging Face (0 descargas) |
| saelens-trained (mismo repo) | SAE TopK con SAELens | 16.384 (k=64) | 102M tokens | Qwen2.5-0.5B, capa 11 | Apache-2.0 | Hugging Face |
| SAE publicos de investigacion para modelos mayores | SAE TopK/JumpReLU | no disponible | no disponible | modelos de mayor tamano | variable | no disponible |

No se dispone en la informacion proporcionada de comparativas con SAE de referencia de otros autores; el propio autor recomienda usar releases mayores y mejor probados para investigacion.

## Limitaciones y advertencias

- Tamano y datos reducidos: 16.384 latentes y 102M tokens; los SAE publicos de investigacion usan cifras muy superiores, y mas latentes dividen caracteristicas amplias en otras mas finas.
- Una sola capa y un solo modelo: entrenado en la capa 11 de Qwen2.5-0.5B; transfiere parcialmente a Qwen2.5-0.5B-Instruct pero no fue entrenado ahi.
- Solo texto educativo web en ingles: codigo, otros idiomas y conversacion quedan fuera de distribucion.
- Etiquetas de latentes no verificadas: las del tutorial son lecturas de ejemplos principales, no explicaciones contrastadas; un latente que se activa ante un concepto no implica que el modelo lo use asi.
- No usar las salidas en las tres primeras posiciones de una secuencia (attention sinks).
- El coste de insercion del SAE (0,086 nats por token) es 1,7 veces mayor que un error aleatorio del mismo tamano, por lo que la parte que el SAE no captura importa mas de lo que su magnitud sugiere.
- Licencia Apache-2.0 permite uso comercial, pero el texto de entrenamiento (FineWeb-Edu, ODC-By 1.0) no se redistribuye en el repo.

## Enlaces

- Hugging Face: https://huggingface.co/albertlieadrian/qwen2.5-0.5b-sae-101
- Tutorial: https://albertlieyingadrian.github.io/steerlab/experiments/sae-101/report/
- Codigo (steerlab, experiments/sae-101): https://github.com/albertlieyingadrian/steerlab/tree/main/experiments/sae-101
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
