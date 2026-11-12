# Aphygo/zega-clip-vit-b32-polarization-v1

## Resumen

ZeGA CLIP-ViT-B/32 Polarization v1 es un "cartucho de sinapsis" (synapse cartridge) publicado por Aphygo AB (Johan Thulin, Helsingborg, Suecia) que se acopla al modelo base `openai/clip-vit-base-patch32` para mejorar su capacidad de binding composicional en tareas de vision-lenguaje sin reentrenamiento por gradiente. No es un modelo completo, sino un conjunto de pesos de 336,80 KiB que expande 56 canales en la capa 10 del encoder visual mediante una tecnica propietaria denominada ZeGA (Zero-Gradient Gated Adaptation), basada en el teorema 3 (Stationary-Minimum & Fixed-Center Symmetric Quartet Polarization) descrito en un preprint depositado en Zenodo.

El problema que aborda es el conocido fallo de CLIP en tareas de composicionalidad: el modelo base apenas distingue pares de imagenes y textos que comparten elementos pero difieren en su estructura (intercambio de sujeto/objeto, clausulas permutadas). Segun la model card, el cartucho eleva el Pair Group Score de Winoground-style del 0,83 % al 25,83 % en el benchmark CompBind-240 y del 2,22 % al 34,44 % en ClauseSwap-180, manteniendo practicamente intacto el rendimiento de clasificacion zero-shot en CIFAR-100 y la similitud de embeddings en CelebA.

Es relevante ahora porque propone una via de adaptacion sin gradientes, con compilacion en 26,6 segundos y hot-swap en 0,40 ms, lo que contrasta con el coste habitual de fine-tuning de modelos vision-lenguaje. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,0 GB, coherente con el peso reducido de los tres ficheros safetensors incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/32 (transformer visual de 12 capas, patch 32, MLP de 2 capas con QuickGELU sin `gate_proj`); el cartucho anade 56 canales en la capa visual 10 |
| Parametros totales | no disponible (el cartucho pesa 336,80 KiB; el modelo base CLIP-ViT-B/32 tiene ~151 M parametros, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base procesa imagenes de 224x224 y textos de hasta 77 tokens, dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT (cartucho, Copyright 2026 APHYGO AB); modelo base OpenAI CLIP bajo MIT |
| Formato de pesos | safetensors (`clip_vit_b32_4row_symmetric_v1.safetensors`, `clip_vit_b32_2row_stationary_v1.safetensors`, `clip_vit_b32_1row_additive_v1.safetensors`) |

## Arquitectura y entrenamiento

El cartucho no entrena el modelo base: sintetiza selectividad bilineal no lineal entre puerta y valor dentro de los MLP no gateados de 2 capas del ViT, que usan QuickGELU y carecen de `gate_proj`. La construccion se realiza mediante el teorema 3 en dos variantes: 3a (par estacionario de 2 filas, +28 canales) y 3b (cuarteto simetrico de centro fijo de 4 filas, +56 canales). El proceso completo de compilacion tarda 26,6 segundos y no requiere optimizacion por gradiente, de ahi la etiqueta "zero-gradient". El acoplamiento se hace por expansion nativa de anchura de `nn.Linear` en la capa visual 10, sin hooks, con un tiempo de hot-swap de 0,40 ms y restauracion bit-identica SHA-256 del modelo base al desacoplar.

La model card describe una ablacion controlada sobre 290 pares de imagenes con semillas no vistas y 700 fotos naturales. El control de 1 fila no simetrizado (+14 canales) apenas mueve las metricas, el par estacionario de 2 filas (+28) mejora parcialmente, y solo el cuarteto simetrico de 4 filas (+56) alcanza las cifras destacadas, lo que sugiere que la simetria de centro fijo es el ingrediente critico. No se detalla la composicion del dataset de entrenamiento porque no hay entrenamiento: los pesos se calculan analiticamente a partir de la estructura del modelo base. El preprint asociado lleva DOI 10.5281/zenodo.24168084.

## Capacidades

- Clasificacion zero-shot de imagenes: el pipeline declarado es `zero-shot-image-classification`, heredado del CLIP base y preservado segun la model card (CIFAR-100 con 499/500 acuerdos y KL 1,99e-9 respecto al base).
- Binding composicional vision-lenguaje: mejora la discriminacion de pares imagen-texto con estructura sintactica alterada (intercambio de clausulas, permutacion sujeto-objeto).
- Recuperacion imagen-texto (I2T): la model card reporta mejoras en la metrica I2T de los benchmarks CompBind-240 (89,2 %), ClauseSwap-180 (81,7 %) y SpatialRel-160 (65,0 %).
- Preservacion de embeddings: similitud coseno de 1,0000000 en la sonda CelebA (200/200), lo que indica que no degrada la representacion global.
- Hot-swap y restauracion: acoplamiento y desacoplamiento en 0,40 ms con restauracion bit-identica del modelo base.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, thinking mode, vision generativa, audio ni matematicas.

## Casos de uso

- Busqueda multimodal con consultas composicionales: en un motor de busqueda de imagenes por texto, el cartucho permite distinguir "un perro mordiendo a un hombre" de "un hombre mordiendo a un perro", un fallo tipico de CLIP que degrada la precision en consultas con relaciones sujeto-objeto. El cartucho se acoplaria al encoder visual en produccion y se desacoplaria para tareas que no lo requieran.
- Moderacion de contenido basada en relaciones: para detectar imagenes donde la relacion entre personas y objetos es relevante (por ejemplo, "persona sosteniendo un cuchillo" frente a "cuchillo sobre una mesa"), el binding composicional mejora la selectividad sin reentrenar el clasificador.
- Anotacion automatica de datasets de vision-lenguaje: en pipelines de curacion de datos, el cartucho ayuda a filtrar pares imagen-caption mal alineados sintacticamente, reduciendo el ruido en datasets de entrenamiento de modelos generativos.
- Evaluacion de sesgos composicionales: investigadores que miden la robustez de CLIP frente a permutaciones de clausulas pueden usar el cartucho como condicion experimental controlada, con restauracion bit-identica del base para comparaciones A/B.
- Prototipado rapido en entornos con GPU limitada: al ser un cartucho de 336,80 KiB que se acopla en 0,40 ms, permite alternar entre comportamiento base y mejorado en un mismo proceso sin recargar el modelo, util en notebooks y demos interactivas.
- Sistemas de recuperacion en comercio electronico: para consultas como "camiseta roja con logo azul" frente a "logo rojo con camiseta azul", el cartucho mejora la discriminacion de atributos y relaciones, reduciendo falsos positivos en el ranking.
- Investigacion en adaptacion sin gradientes: el cartucho sirve como referencia reproducible para estudiar weight-space programming y tecnicas de edicion de modelos sin fine-tuning, con hashes SHA-256 publicados para verificar integridad.

## Benchmarks y rendimiento

Datos de la model card (ablacion controlada con 290 pares de imagenes con semillas no vistas y 700 fotos naturales):

| Condicion | Filas L10 | CompBind-240 Grp (p) / I2T | ClauseSwap-180 Grp (p) / I2T | SpatialRel-160 Grp (p) / I2T | CIFAR-100 Acuerdo / KL | CelebA Sonda / Cos |
|---|---|---|---|---|---|---|
| Base CLIP-ViT-B/32 | +0 | 0,83 % / 52,92 % | 2,22 % / 52,78 % | 0,00 % / 50,62 % | Base (65,8 %) / 0 | Base / 1,0000000 |
| Control 1 fila no simetrizado | +14 | 0,83 % (p=1,0) / 51,67 % | 3,33 % (p=1,0) / 53,89 % | 0,00 % (p=1,0) / 48,75 % | 499/500 / 8,08e-7 | 200/200 / 1,0000000 |
| Par estacionario 2 filas (Thm 3a) | +28 | 9,17 % (p=6,3e-3) / 63,75 % | 12,22 % (p=0,022) / 62,22 % | 1,25 % (p=1,0) / 57,50 % | 500/500 / 9,74e-8 | 200/200 / 1,0000000 |
| Cuarteto simetrico 4 filas (Thm 3b) | +56 | 25,83 % (p=1,5e-8) / 89,2 % | 34,44 % (p=3,0e-8) / 81,7 % | 6,25 % (p=0,062) / 65,0 % | 499/500 / 1,99e-9 | 200/200 / 1,0000000 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo no es de lenguaje general sino de vision-lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible de forma especifica; al tratarse de un cartucho sobre CLIP-ViT-B/32, el requisito es el del modelo base mas 336,80 KiB adicionales, despreciables.
- GPU recomendadas: cualquier GPU capaz de ejecutar CLIP-ViT-B/32 en FP32 o FP16; no se especifican modelos concretos en la informacion proporcionada.
- Cabe en GPU consumer: si, siempre que el modelo base quepa; el cartucho anade un coste marginal.
- Opciones de despliegue: el cargador nativo `cartridge_loader.py` (272 lineas) del repositorio GitHub `Aphygo/zega-synapse-cartridges`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: hot-swap de 0,40 ms; compilacion del cartucho en 26,6 s; no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Binding composicional | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZeGA CLIP-ViT-B/32 Polarization v1 | Cartucho de 336,80 KiB sobre CLIP-ViT-B/32 | No disponible | 25,83 % Grp en CompBind-240; 34,44 % en ClauseSwap-180 | MIT | Hugging Face (0 descargas) |
| CLIP-ViT-B/32 (OpenAI) | ~151 M (no confirmado en la informacion) | No disponible | 0,83 % Grp en CompBind-240; 2,22 % en ClauseSwap-180 | MIT | Ampliamente disponible |
| Alternativas de binding composicional para CLIP | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de otros metodos comparables (por ejemplo, fine-tuning con NegCLIP o adaptadores tipo LoRA) en la informacion proporcionada, por lo que la comparativa cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Modelo en ingles: la unica lengua declarada es `en`, por lo que el rendimiento en castellano u otros idiomas no esta validado.
- Dependencia del modelo base: requiere `openai/clip-vit-base-patch32` en la revision `3d74acf9a28c67741b2f4f2ea7635f0aaf6f0268`; otras revisiones pueden invalidar el acoplamiento.
- Requiere codigo externo: el cargador `cartridge_loader.py` no esta incluido en el repositorio de Hugging Face y debe obtenerse del GitHub del autor, lo que anade una dependencia de mantenimiento.
- Benchmarks propios: las metricas reportadas (CompBind-240, ClauseSwap-180, SpatialRel-160) son benchmarks definidos por el autor, no estandarizados por la comunidad; la mejora en SpatialRel-160 es marginal (6,25 %, p=0,062) y no alcanza significacion estadistica convencional.
- Sin validacion independiente: 0 descargas y 0 likes en el momento de la consulta; no se han publicado replicaciones externas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero el modelo puede producir clasificaciones erroneas en dominios alejados de la distribucion de CLIP.
- Sesgos: heredados del modelo base CLIP, no documentados de forma especifica en la informacion proporcionada.
- Licencia: MIT permite uso comercial, pero el autor ofrece "Commercial Compiler Inquiries" por correo, lo que sugiere que el compilador (no incluido) podria tener terminos distintos; conviene verificar antes de un despliegue comercial.
- Sin soporte de cuantizacion documentado: no se indican formatos GGUF, AWQ ni GPTQ, lo que limita el despliegue en entornos de bajos recursos mas alla del propio CLIP base.

## Enlaces

- Hugging Face: https://huggingface.co/Aphygo/zega-clip-vit-b32-polarization-v1
- Preprint (Zenodo DOI): https://doi.org/10.5281/zenodo.24168084
- Repositorio GitHub (cargador y benchmarks): https://github.com/Aphygo/zega-synapse-cartridges
- Cargador nativo: https://github.com/Aphygo/zega-synapse-cartridges/tree/main/01_LOADER
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch32
- Contacto del autor: johan.thulin@aphygo.com (APHYGO AB, Helsingborg, Suecia)
