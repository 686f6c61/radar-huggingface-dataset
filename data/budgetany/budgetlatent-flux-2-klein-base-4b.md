# BudgetAny/BudgetLatent-FLUX.2-klein-base-4B

## Resumen

BudgetLatent-FLUX.2-klein-base-4B es un ajuste fino (fine-tune) del modelo de difusion latente FLUX.2 [klein] 4B Base de Black Forest Labs, desarrollado por el proyecto BudgetAny. Su proposito es permitir la generacion texto-a-imagen a 1024 × 1024 con un presupuesto de tokens latentes variable: en lugar de procesar siempre las 4.096 posiciones latentes densas, aplica una tokenizacion adaptativa basada en quadtree que fusiona las regiones mas planas de la imagen en tokens mas gruesos (de 32, 64 o 128 px en lugar de 16 px), ejecuta el transformer sobre la secuencia reducida y emplea refinadores pequenos para recuperar el detalle.

El modelo se apoya en la metodologia del paper BudgetPix (Kara et al., 2026), centrado en difusion en espacio de pixeles, y la extiende aqui a difusion latente. Esto lo hace relevante para entornos con restricciones de computo: un mismo checkpoint permite degradar el coste de inferencia de forma controlada, desde el 100 % hasta el 10 % de los tokens, con aceleraciones medidas de hasta 4,43× en una RTX PRO 6000 Blackwell.

El transformer ajustado contiene 3,90 B parametros en bf16 (7,81 GB) y reutiliza el codificador de texto Qwen3-4B y el VAE del modelo base. Se distribuye bajo licencia Apache-2.0 y soporta tanto generacion texto-a-imagen como edicion y generacion multi-referencia en cualquier presupuesto de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion latente con tokenizacion adaptativa (quadtree) sobre FLUX.2 [klein] 4B Base |
| Parametros totales | 3,90 B (transformer ajustado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens latentes densos (1024 × 1024); reducible hasta el 10 % (409 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del transformer de FLUX.2 [klein] 4B Base. La innovacion principal es la tokenizacion adaptativa: un quadtree analiza el mapa latente y fusiona las regiones con menor complejidad en tokens de mayor tamano (32, 64 o 128 px frente a los 16 px densos), de modo que el transformer procesa una secuencia mas corta. Tras la difusion, una serie de refinadores pequenos restaura el detalle en las zonas fusionadas. El checkpoint contiene el transformer completo ajustado y modulos anadidos para los tokens gruesos; el codificador de texto Qwen3-4B y el VAE se descargan del repositorio del modelo base mediante `scripts/fetch_weights.py`.

El metodo subyacente procede de BudgetPix (Kara et al., 2026), que aborda la tokenizacion adaptativa al computo en difusion de espacio de pixeles; la adaptacion a difusion latente es una extension realizada por este proyecto. No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El proyecto declara que las cifras de rendimiento son mediciones propias y que no se trata de un lanzamiento oficial.

## Capacidades

- Generacion texto-a-imagen a 1024 × 1024 con presupuesto de tokens ajustable entre el 100 % y el 10 % (4.096 a 409 tokens).
- Edicion de imagenes mediante referencias (`--ref`), con hasta 10 imagenes de referencia; las referencias conservan todos sus tokens, por lo que la aceleracion en edicion es menor que en texto-a-imagen.
- Generacion multi-referencia en cualquier presupuesto de tokens.
- Salida opcional con la disposicion de tokens superpuesta (`--overlay`) para inspeccionar la asignacion de granularidad.
- Inferencia compilada y optimizada (`--fast`) para lotes de mas de unas pocas imagenes.
- No se documentan capacidades de tool calling, agentes, vision de entrada ni modo de razonamiento.

## Casos de uso

- Prototipado rapido de conceptos visuales: con presupuestos del 10-20 % se obtienen imagenes en 2,4-3,0 s por imagen en una RTX PRO 6000, lo que permite iterar sobre prompts y semillas antes de lanzar la generacion final al 100 %.
- Generacion por lotes en produccion con coste controlado: el mismo checkpoint permite fijar un presupuesto del 50 % (2.047 tokens, 5,72 s por imagen) para reducir a la mitad el tiempo de inferencia manteniendo la coherencia global gracias a los refinadores.
- Edicion de imagenes con referencias: el soporte de hasta 10 imagenes de referencia permite tareas de composicion, transferencia de estilo o modificaciones guiadas, manteniendo la fidelidad de las referencias al conservar todos sus tokens.
- Despliegue en GPU de gama alta para consumidor: con 7,7 GiB de pesos, el modelo cabe en tarjetas de 12-16 GB de VRAM en bf16, lo que facilita la experimentacion local sin infraestructura de centro de datos.
- Servicios de generacion con presupuesto adaptativo por peticion: un backend puede asignar presupuestos mayores a peticiones complejas y menores a peticiones simples, ajustando latencia y coste por consulta.
- Investigacion sobre tokenizacion adaptativa: la salida `--overlay` y los scripts de inferencia permiten estudiar como afecta la granularidad de tokens a la calidad en distintas regiones de la imagen, util para trabajos sobre difusion eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (FID, CLIP score, etc.) en la informacion disponible. Los unicos datos publicados son de velocidad y memoria, medidos en una NVIDIA RTX PRO 6000 Blackwell Server Edition, batch 1, `--fast`, 50 pasos Euler con classifier-free guidance 4.0:

| Presupuesto | Tokens de imagen | Tiempo extremo a extremo | Aceleracion | Memoria pico |
|---:|---:|---:|---:|---:|
| 100 % | 4.096 | 10,69 s | 1,00× | 8,6 GiB |
| 90 % | 3.685 | 9,76 s | 1,10× | 8,5 GiB |
| 80 % | 3.277 | 8,62 s | 1,24× | 8,5 GiB |
| 70 % | 2.866 | 7,61 s | 1,41× | 8,4 GiB |
| 60 % | 2.458 | 6,61 s | 1,62× | 8,3 GiB |
| 50 % | 2.047 | 5,72 s | 1,87× | 8,2 GiB |
| 40 % | 1.639 | 4,87 s | 2,20× | 8,2 GiB |
| 30 % | 1.228 | 3,89 s | 2,75× | 8,1 GiB |
| 20 % | 820 | 2,99 s | 3,57× | 8,1 GiB |
| 10 % | 409 | 2,41 s | 4,43× | 8,1 GiB |

Con batch 8 la memoria pico desciende con el presupuesto: 14,7 GiB al 100 %, 11,8 GiB al 50 % y 9,8 GiB al 10 %.

## Requisitos de hardware

- VRAM estimada: aproximadamente 8,6 GiB de pico a batch 1 con el 100 % de tokens; unos 8,1 GiB al 10 %. Los pesos ocupan unos 7,7 GiB.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (plataforma de medida); tarjetas con 12-16 GB de VRAM o mas para bf16 a batch 1; para batch 8 se necesitan al menos 15 GB.
- Cabe en GPU de consumidor con 12 GB o mas de VRAM en bf16 (por ejemplo, RTX 4070 Ti Super, RTX 4080, RTX 4090); en tarjetas de 8 GB no cabe sin cuantizacion, y no se documentan pesos cuantizados.
- Opciones de despliegue: los scripts oficiales del repositorio de GitHub (`scripts/inference/sample.py`) con el flag `--fast` para inferencia compilada. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 10,69 s por imagen al 100 % y 2,41 s al 10 % en la plataforma de referencia, batch 1, 50 pasos Euler con CFG 4.0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tokens | Presupuesto variable | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BudgetLatent-FLUX.2-klein-base-4B | 3,90 B | 4.096 tokens latentes (hasta 409) | Si (10-100 %) | Apache-2.0 | Hugging Face, 44 descargas |
| FLUX.2 [klein] 4B Base | no disponible | 4.096 tokens densos | No | Apache-2.0 | Hugging Face (modelo base) |
| BudgetLatent-FLUX.2-klein-4B | no disponible | no disponible | Si | no disponible | Hugging Face (mismo proyecto) |
| BudgetLatent-FLUX-3-Image-Klein-Base | no disponible | no disponible | Si | no disponible | Hugging Face (mismo proyecto) |

No se dispone de datos de rendimiento de calidad que permitan comparar con alternativas de la misma categoria; la comparativa se limita a caracteristicas estructurales y de licencia.

## Limitaciones y advertencias

- No es un lanzamiento oficial de Black Forest Labs: es una implementacion no oficial del proyecto BudgetAny basada en el metodo BudgetPix; las cifras de rendimiento son mediciones propias.
- No se han publicado resultados de calidad (FID, CLIP, evaluaciones humanas) en la informacion disponible, por lo que el impacto del presupuesto reducido en la fidelidad de la imagen no esta cuantificado mas alla de los ejemplos visuales de la model card.
- En edicion y generacion multi-referencia la aceleracion es menor que en texto-a-imagen, porque las imagenes de referencia conservan todos sus tokens.
- El repositorio solo incluye el transformer ajustado; es necesario descargar el codificador de texto Qwen3-4B y el VAE del modelo base para ejecutar el modelo.
- No se documentan sesgos conocidos, riesgo de alucinacion visual, idiomas soportados ni limitaciones de contexto mas alla del presupuesto de tokens.
- La licencia Apache-2.0 permite uso comercial, pero al derivar del modelo base de Black Forest Labs conviene verificar las condiciones del repositorio original.
- El modelo tiene un volumen de descargas muy bajo (44) y ninguna valoracion (0 likes), lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BudgetAny/BudgetLatent-FLUX.2-klein-base-4B
- Pagina del proyecto: https://budgetany.github.io/budgetlatent/
- Codigo: https://github.com/BudgetAny/BudgetLatent
- Paper BudgetPix: https://arxiv.org/abs/2610.12307
- Organizacion BudgetAny en Hugging Face: https://huggingface.co/BudgetAny
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Variante BudgetLatent-FLUX.2-klein-4B: https://huggingface.co/BudgetAny/BudgetLatent-FLUX.2-klein-4B
- Variante BudgetLatent-FLUX-3-Image-Klein-Base: https://huggingface.co/BudgetAny/BudgetLatent-FLUX-3-Image-Klein-Base
- Variante BudgetLatent-FLUX-3-Image-Klein: https://huggingface.co/BudgetAny/BudgetLatent-FLUX-3-Image-Klein
