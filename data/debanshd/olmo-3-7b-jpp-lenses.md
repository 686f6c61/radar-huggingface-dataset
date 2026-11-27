# debanshd/olmo-3-7b-jpp-lenses

## Resumen

J++ lenses para OLMo 3 7B es un artefacto de interpretabilidad, no un modelo generativo. Lo publica debanshd sobre el modelo base `allenai/Olmo-3-1025-7B` y consiste en un conjunto de lentes jacobianas (Jacobian lenses) con filtrado J++, derivadas del trabajo de Ayonrinde y Lindsey (2026). Estas lentes permiten proyectar activaciones internas del modelo a espacio de vocabulario para leer el "workspace" latente de forma mas fiel que la logit lens clasica.

El repositorio incluye dos conjuntos de lentes: uno para el modelo publicado (`released/`) y otro para el checkpoint de preentrenamiento al 50 % de los tokens (3,04T de 6,08T, `stage1-step725000/`). Cada conjunto contiene dos variantes: una ajustada con 64 prompts de WikiText-103 (`jpp_n64/`) y otra ajustada por bloques de 25 prompts hasta cumplir el criterio de convergencia de Neuronpedia (`jpp_conv650/` o `jpp_conv625/`).

Es relevante para investigadores de interpretabilidad mecanicista que quieran auditar el estado interno de OLMo 3 7B sin reajustar las lentes, y para estudiar la evolucion del workspace durante el preentrenamiento comparando el checkpoint al 50 % con el modelo final. Los ficheros estan en el formato del harness `safety-research/jpp_lens`, no en el formato `jlens`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lentes jacobianas con filtrado J++ (8 expertos k-means por capa, sumas jacobianas a traves del backward de LRP) sobre OLMo 3 7B |
| Parametros totales | 7B (modelo base `allenai/Olmo-3-1025-7B`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens por prompt en el ajuste (primeras 16 posiciones omitidas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | formato del harness `jpp_lens` (cargable con `workspace_lens.utils.load_lens_file`); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

Cada lente se construye con la receta del harness `jpp_lens` (commit `d7efc0d`): 8 expertos k-means por capa con router entrenado sobre 1000 prompts, sumas jacobianas propagadas a traves del backward pass de LRP, prompts de 128 tokens con las primeras 16 posiciones descartadas, capas fuente 0-30 y pesos de experto ajustados sobre el split `fit:0` de los items de readout. Cada lente se evalua unicamente sobre items que sus pesos no han visto.

Se generan dos variantes por checkpoint: `jpp_n64`, ajustada con 64 prompts de WikiText-103 (el conteo del post original), y `jpp_conv650`/`jpp_conv625`, ajustada en bloques de 25 prompts hasta que la regla de convergencia de la J-lens de Neuronpedia se detiene (cambio por prompt inferior a 0,002, registrado en `convergence.csv`). El ajuste se hizo en GPUs RunPod (H200 para las lentes de 64 prompts, RTX PRO 6000 Blackwell para las convergidas) los dias 25 y 26 de noviembre de 2026, usando `jpp_evals/` de `debanshd/jspace-horizons-copy` (PR 18). El checkpoint al 50 % carece de mid-training, etapa de contexto largo y escalado YaRN que si tiene el modelo publicado, por lo que las diferencias entre ambos no se reducen al numero de tokens vistos.

## Capacidades

- Lectura del workspace latente de OLMo 3 7B mediante proyeccion jacobiana filtrada a espacio de vocabulario.
- Evaluacion de recall@10 sobre cinco tareas de readout con Readout Filtering, tomando el mejor de siete capas.
- Evaluacion de probe-swap (top-1 en la mejor escala) para medir fidelidad de la lente.
- Comparacion entre checkpoints de preentrenamiento (50 % vs. modelo publicado) para estudiar la formacion del workspace.
- Carga programatica mediante `workspace_lens.utils.load_lens_file` del harness `jpp_lens`.
- Metadatos por carpeta en `meta.json` con revisiones fijadas, ajustes, sha256 de la lente y puntuaciones.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.

## Casos de uso

- Auditoria de interpretabilidad en OLMo 3 7B: cargar `released/jpp_n64/` y proyectar activaciones de capas 0-30 para identificar conceptos latentes con mayor fidelidad que la logit lens, gracias al filtrado jacobiano.
- Estudio de la evolucion del workspace durante el preentrenamiento: comparar `stage1-step725000/` con `released/` para medir como cambia el recall@10 (39,5 % vs. 53,4 % con 64 prompts) a lo largo del entrenamiento.
- Investigacion de fidelidad de lentes: usar los resultados de probe-swap (23/43 en la variante J++ de 64 prompts frente a 7/43 de la logit lens) como referencia para validar nuevas tecnicas de lectura.
- Reproducibilidad de experimentos: los `meta.json` fijan revisiones y sha256, lo que permite replicar exactamente las condiciones del ajuste en un pipeline de investigacion.
- Analisis de convergencia: emplear `convergence.csv` para estudiar el efecto del numero de prompts de ajuste (64 frente a 650) en la calidad de la lente (53,4 % frente a 52,2 % de recall@10).
- Docencia y divulgacion en interpretabilidad mecanicista: disponer de lentes preajustadas sobre un modelo abierto (OLMo 3, Apache 2.0) simplifica la preparacion de practicas sin necesidad de reajustar el harness.

## Benchmarks y rendimiento

Resultados publicados por el autor (recall@10 en porcentaje, mejor de siete capas con Readout Filtering; probe-swap top-1 sobre items held-out):

| Checkpoint | Lente | recall@10 (%) | probe-swap top-1 |
|---|---|---|---|
| released | logit lens | 33,0 / 33,7 | 7/43 |
| released | Neuronpedia J-lens (568 prompts) | 37,6 / 37,7 | 17/43 |
| released | J++, 64 prompts | 53,4 | 23/43 |
| released | J++, converged (650 prompts) | 52,2 | 21/43 |
| 50 % | logit lens | 28,1 / 27,9 | 4/41, 4/43 |
| 50 % | J++, 64 prompts | 39,5 | 20/41 |
| 50 % | J++, converged (625 prompts) | 39,7 | 18/43 |

Los pares de cifras corresponden a la ejecucion de 64 prompts y a la convergida, que evaluaron conjuntos held-out ligeramente distintos (220 y 221 items en el modelo publicado; 198 en el checkpoint al 50 %, con 41 y 43 ensayos de probe-swap elegibles). `results/` contiene todas las columnas, rangos, ensayos de probe-swap, pesos de experto y logs.

## Requisitos de hardware

- El repositorio ocupa 8,4 GB, pero las lentes se aplican sobre OLMo 3 7B; la inferencia del modelo base requiere VRAM adicional segun cuantizacion (no disponible en la informacion proporcionada).
- Ajuste realizado en H200 (lentes de 64 prompts) y RTX PRO 6000 Blackwell (lentes convergidas); no se detalla VRAM pico.
- No cabe en GPU de consumo para el ajuste; la aplicacion de lentes ya ajustadas es mucho mas ligera, pero no se especifica el coste exacto.
- Despliegue: carga mediante `workspace_lens.utils.load_lens_file` del harness `safety-research/jpp_lens`; no es compatible con vLLM, llama.cpp, Ollama ni TGI por no ser un modelo generativo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Modelo base | Tipo | recall@10 (%) | probe-swap top-1 | Licencia |
|---|---|---|---|---|---|
| J++ lens (este repo) | OLMo 3 7B | Lente jacobiana filtrada | 53,4 (64 prompts) | 23/43 | Apache 2.0 |
| Neuronpedia J-lens | OLMo 3 7B | Lente jacobiana | 37,6 / 37,7 | 17/43 | no disponible |
| Logit lens | OLMo 3 7B | Lente de logits | 33,0 / 33,7 | 7/43 | no disponible |
| J++ lens al 50 % | OLMo 3 7B (checkpoint 3,04T) | Lente jacobiana filtrada | 39,5 | 20/41 | Apache 2.0 |

## Limitaciones y advertencias

- No es un modelo generativo: no debe usarse para tareas de texto, codigo, vision ni agentes.
- Solo cubre las capas fuente 0-30 y prompts de 128 tokens con las primeras 16 posiciones omitidas; fuera de ese regimen el comportamiento no esta validado.
- Las lentes se ajustaron sobre WikiText-103 y el split `fit:0` del harness; pueden no generalizar a otros dominios o idiomas.
- El checkpoint al 50 % carece de mid-training, contexto largo y escalado YaRN, por lo que la comparacion con el modelo publicado mezcla efectos de tokens y de etapas de entrenamiento.
- Los conjuntos held-out son pequenos (198-221 items, 41-43 ensayos de probe-swap), lo que limita la significancia estadistica de las diferencias.
- El formato es especifico del harness `jpp_lens`; no es compatible con `jlens` ni con herramientas de inferencia estandar.
- No se documentan sesgos del modelo base en esta ficha; deben consultarse en la model card de `allenai/Olmo-3-1025-7B`.
- La licencia Apache 2.0 permite uso comercial de las lentes, pero el modelo base tiene sus propias condiciones.

## Enlaces

- Hugging Face: https://huggingface.co/debanshd/olmo-3-7b-jpp-lenses
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Post J++ Lens (Ayonrinde & Lindsey, 2026): https://www.lesswrong.com/posts/nc9dHfcB22JdMzGbr/j-lens-jacobian-filtering-enables-more-faithful-workspace
- Harness `safety-research/jpp_lens`: https://github.com/safety-research/jpp_lens
- Repositorio auxiliar `debanshd/jspace-horizons-copy` (PR 18): no disponible como URL directa en la informacion proporcionada
- Neuronpedia (regla de convergencia J-lens): https://www.neuronpedia.org
