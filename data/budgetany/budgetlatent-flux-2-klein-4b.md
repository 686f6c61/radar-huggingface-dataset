# BudgetAny/BudgetLatent-FLUX.2-klein-4B

## Resumen

BudgetLatent-FLUX.2-klein-4B es un ajuste fino (fine-tune) del modelo de difusion texto-a-imagen FLUX.2 [klein] 4B de Black Forest Labs, desarrollado por el proyecto BudgetAny. Su propuesta central es la tokenizacion adaptativa al presupuesto de computo: un unico checkpoint puede ejecutarse con cualquier numero de sus 4096 tokens latentes (a resolucion 1024 x 1024), desde el 100 % hasta el 10 %, mediante una estructura de quadtree que fusiona las regiones mas planas de la imagen en tokens mas gruesos (de 32 a 128 px en lugar de 16 px) y usa refinadores pequenos para recuperar el detalle. El transformer opera sobre la secuencia reducida, lo que traduce directamente en menor latencia y menor memoria de activaciones.

El modelo resuelve el problema de tener que elegir entre calidad y coste computacional en generacion de imagenes: en lugar de entrenar o desplegar variantes separadas para distintos regimenes de computo, un solo conjunto de pesos permite degradar el presupuesto de tokens de forma controlada en tiempo de inferencia. Segun las mediciones del autor, pasar del 100 % al 10 % de tokens reduce el tiempo por imagen de 0,50 s a 0,19 s (aceleracion de 2,61x) manteniendo el mismo checkpoint y el mismo sampler destilado de 4 pasos.

Es relevante ahora porque aplica y extiende el metodo BudgetPix (paper arXiv:2610.12307) desde difusion en espacio de pixeles a difusion latente, y porque se distribuye con licencia Apache-2.0 sobre una base tambien Apache-2.0. Se trata de una implementacion no oficial, no publicada por Black Forest Labs, y las cifras son mediciones propias del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion latente (base FLUX.2 [klein] 4B) con tokenizacion adaptativa por quadtree y refinadores de detalle |
| Parametros totales | 3,90 B (transformer ajustado, bf16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; 4096 tokens latentes densos a 1024 x 1024, reducibles hasta el 10 % (409 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`budgetlatent.safetensors`, 7,81 GB) |

## Arquitectura y entrenamiento

El modelo parte del transformer de FLUX.2 [klein] 4B, un modelo de difusion latente texto-a-imagen. Sobre esa base se incorpora el mecanismo de tokenizacion adaptativa de BudgetPix: dado un presupuesto de tokens, un quadtree agrupa las regiones mas planas (menos informativas) en tokens de mayor tamano (32, 64 o 128 px frente a los 16 px del token denso), de modo que el transformer procesa una secuencia mas corta. Posteriormente, refinadores de pequena escala restauran el detalle en las zonas que se habian agrupado. El transformer fue ajustado y se anadieron modulos para manejar los tokens gruesos. El text encoder es Qwen3-4B y el decodificador es el VAE de FLUX.2, ambos tomados del repositorio base y no incluidos en este repo.

El metodo original de BudgetPix (Kara et al., 2026) cubre difusion en espacio de pixeles; la adaptacion a difusion latente es una extension realizada por este proyecto. No se detallan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. El muestreo de referencia usa un sampler destilado de 4 pasos sin guidance.

## Capacidades

- Generacion de imagenes texto-a-imagen a 1024 x 1024 con presupuesto de tokens ajustable en tiempo de inferencia (del 100 % al 10 %).
- Edicion de imagenes mediante referencias (`--ref`), con soporte de hasta 10 imagenes de referencia.
- Generacion multi-referencia, operativa en todos los niveles de presupuesto.
- Control fino del compromiso calidad/velocidad sin cambiar de checkpoint.
- Visualizacion del layout de tokens (`--overlay`) para inspeccionar que regiones se han agrupado.
- Inferencia compilada y optimizada (`--fast`) para lotes de varias imagenes.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otros idiomas.

## Casos de uso

- Generacion masiva de miniaturas y assets web: con presupuestos del 20-30 % se obtienen tiempos de 0,22-0,24 s por imagen, adecuado para pipelines que producen cientos de variaciones y solo necesitan calidad de vista previa.
- Iteracion creativa rapida: usar el 10-30 % de tokens durante la exploracion de prompts y semillas, y regenerar a presupuesto completo solo las variantes seleccionadas, reutilizando el mismo checkpoint.
- Prototipado en hardware modesto: el pico de memoria a batch 1 es de aproximadamente 8 GiB y a batch 8 baja a 8,7 GiB con presupuesto del 10 %, lo que permite desplegar en GPUs de gama profesional sin sacrificar el flujo de trabajo.
- Edicion de imagenes con referencias: el modo `--ref` admite hasta 10 imagenes de referencia para tareas de edicion y composicion, aunque la aceleracion es menor porque las referencias conservan todos sus tokens.
- Servicios de generacion con SLA de latencia: el sampler destilado de 4 pasos sin guidance y los tiempos end-to-end de 0,19-0,50 s permiten ofrecer respuestas interactivas en aplicaciones de diseno.
- Investigacion sobre computo adaptativo: al exponer el presupuesto de tokens como parametro, sirve para estudiar la relacion entre asignacion de computo y calidad perceptual en difusion latente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (FID, CLIP score, MMLU, etc.) en la informacion disponible. El autor unicamente reporta mediciones de velocidad y memoria en una NVIDIA RTX PRO 6000 Blackwell Server Edition, batch 1, `--fast`, sampler destilado de 4 pasos sin guidance:

| Presupuesto | Tokens de imagen | Tiempo end-to-end / imagen | Aceleracion | Memoria pico |
|---:|---:|---:|---:|---:|
| 100 % | 4096 | 0,50 s | 1,00x | 8,2 GiB |
| 90 % | 3685 | 0,47 s | 1,06x | 8,1 GiB |
| 80 % | 3277 | 0,42 s | 1,19x | 8,1 GiB |
| 70 % | 2866 | 0,39 s | 1,28x | 8,1 GiB |
| 60 % | 2458 | 0,36 s | 1,38x | 8,0 GiB |
| 50 % | 2047 | 0,32 s | 1,57x | 8,0 GiB |
| 40 % | 1639 | 0,28 s | 1,80x | 7,9 GiB |
| 30 % | 1228 | 0,24 s | 2,05x | 7,9 GiB |
| 20 % | 820 | 0,22 s | 2,26x | 7,9 GiB |
| 10 % | 409 | 0,19 s | 2,61x | 7,9 GiB |

Memoria pico a batch 8: 11,2 GiB al 100 %, 9,7 GiB al 50 % y 8,7 GiB al 10 %. La memoria a batch 1 corresponde mayoritariamente a los pesos (7,7 GiB).

## Requisitos de hardware

- VRAM estimada: aproximadamente 8 GiB de pico a batch 1 (7,7 GiB de pesos en bf16 mas activaciones); entre 8,7 y 11,2 GiB a batch 8 segun presupuesto.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (mediciones del autor); cualquier GPU con 12 GB o mas de VRAM deberia poder ejecutar el modelo en bf16 a batch 1, aunque no se aportan mediciones en otras tarjetas.
- Cabe en GPU de consumo con 12-16 GB de VRAM (por ejemplo, gama RTX xx70/xx80 con 12 GB o mas); no se confirma compatibilidad con tarjetas de 8 GB.
- Opciones de despliegue: el repositorio oficial proporciona scripts de inferencia en Python (`scripts/inference/sample.py`) con modo compilado `--fast`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,19-0,50 s por imagen a batch 1 en RTX PRO 6000 Blackwell con el sampler destilado de 4 pasos; no se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tokens | Presupuesto ajustable | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BudgetLatent-FLUX.2-klein-4B | 3,90 B | 4096 tokens latentes (10-100 %) | Si, en inferencia | Apache-2.0 | Hugging Face + GitHub |
| FLUX.2 [klein] 4B (base) | no disponible | 4096 tokens densos | No | Apache-2.0 | Hugging Face (Black Forest Labs) |
| BudgetLatent-FLUX.2-klein-base-4B | no disponible | 4096 tokens latentes | Si | Apache-2.0 | Hugging Face (BudgetAny) |
| BudgetLatent-FLUX-3-Image-Klein | no disponible | no disponible | Si | no disponible | Hugging Face (BudgetAny) |

No se dispone de datos de rendimiento cualitativo (FID, CLIP) que permitan comparar la calidad frente a la base ni frente a alternativas de otros autores.

## Limitaciones y advertencias

- Implementacion no oficial: no esta publicada por Black Forest Labs y las cifras son mediciones propias del proyecto, no verificadas de forma independiente.
- El metodo original (BudgetPix) cubre difusion en espacio de pixeles; la extension a difusion latente no cuenta con paper publicado (tech report "coming soon").
- No se han publicado benchmarks de calidad de imagen, por lo que el compromiso real entre presupuesto de tokens y fidelidad perceptual no esta cuantificado de forma objetiva.
- La aceleracion en edicion es menor que en texto-a-imagen, porque las imagenes de referencia conservan todos sus tokens.
- Los pesos del text encoder Qwen3-4B y del VAE no estan incluidos en el repositorio y deben descargarse del repositorio base mediante `scripts/fetch_weights.py`; su licencia es la del modelo base.
- No se documentan sesgos conocidos, riesgos de alucinacion visual ni limitaciones idiomaticas; los idiomas soportados figuran como no disponibles.
- Uso comercial permitido por Apache-2.0, sujeto a los terminos de la licencia del modelo base FLUX.2 [klein] 4B.
- El modelo tiene un numero de descargas muy bajo (52) y ningun "like" en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BudgetAny/BudgetLatent-FLUX.2-klein-4B
- Pagina del proyecto: https://budgetany.github.io/budgetlatent/
- Codigo: https://github.com/BudgetAny/BudgetLatent
- Paper BudgetPix: https://arxiv.org/abs/2610.12307
- Organizacion BudgetAny en Hugging Face: https://huggingface.co/BudgetAny
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Variante base: https://huggingface.co/BudgetAny/BudgetLatent-FLUX.2-klein-base-4B
- Variante FLUX 3 Image Klein Base: https://huggingface.co/BudgetAny/BudgetLatent-FLUX-3-Image-Klein-Base
- Variante FLUX 3 Image Klein: https://huggingface.co/BudgetAny/BudgetLatent-FLUX-3-Image-Klein
