# BudgetAny/BudgetPix-MiniT2I

## Resumen

BudgetPix-MiniT2I es un modelo de generacion de imagenes texto-a-imagen en espacio de pixeles, publicado por el colectivo comunitario BudgetAny como reimplementacion no oficial del metodo BudgetPix (Kara et al., 2026). El modelo parte de los pesos de MiniT2I (variantes B/16 y L/16 a 512 px) y los ajusta con una tokenizacion adaptativa al presupuesto de computo: en lugar de procesar siempre una rejilla densa de 1.024 tokens, el transformer de difusion puede ejecutarse sobre un numero variable de tokens elegido en inferencia, fusionando primero las regiones de menor entropia (menos detalle) en tokens gruesos y reservando los tokens finos para las zonas con mas estructura.

La relevancia del modelo esta en que un unico checkpoint sirve para cualquier presupuesto de tokens, lo que permite intercambiar calidad por latencia sin reentrenar ni cambiar de pesos. Esto es especialmente util en entornos con GPUs modestas o en pipelines donde el coste por imagen es un factor critico. El repositorio incluye dos tamanos: B/16 (260 M de parametros, 1,04 GB) y L/16 (915 M de parametros, 3,66 GB), ambos con rejilla densa de 1.024 tokens a 512 x 512.

Se trata de un modelo de difusion en espacio de pixeles (sin VAE de compresion latente), con codificador de texto externo `google/flan-t5-large` descargado del Hub en el primer uso. La licencia es MIT, heredada de los pesos originales de MiniT2I. El proyecto esta etiquetado como implementacion no oficial y no cuenta con descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion en espacio de pixeles (pixel-space DiT) con tokenizacion adaptativa al presupuesto de computo |
| Parametros totales | 260 M (B/16) y 915 M (L/16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (condicionamiento de texto via flan-t5-large; sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en `.pt`; no se documentan variantes GGUF, int8 ni fp8) |
| Idiomas soportados | no disponible (el codificador de texto es flan-t5-large, multilingue, pero la model card no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (`budgetpix_minit2i_b_512.pt`, `budgetpix_minit2i_l_512.pt`) |
| Resolucion | 512 x 512 px |
| Tokens densos | 1.024 por imagen (rejilla densa de referencia) |
| Presupuesto de tokens | configurable en inferencia via `--budget` |
| Codificador de texto | `google/flan-t5-large` (descargado del Hub) |
| Tamano del repo | 4,7 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion que opera directamente en espacio de pixeles, sin codificador latente tipo VAE. La innovacion central es la tokenizacion adaptativa de BudgetPix: un mapa de detalle basado en entropia identifica las regiones con mayor estructura y asigna tokens finos a esas zonas, mientras que las regiones planas se agrupan en tokens gruesos. El resultado es que el mismo conjunto de pesos puede ejecutarse con distintos presupuestos de tokens (por ejemplo, 512, 768 o 1.024 sobre una rejilla densa de 1.024), de modo que el coste computacional se ajusta en tiempo de inferencia sin reentrenamiento.

El ajuste fino parte de MiniT2I-B/16 y MiniT2I-L/16, modelos de texto-a-imagen a 512 px, y se apoya en la implementacion APT (Adaptive Patch Tokenization). La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada. El condicionamiento textual se delega en `google/flan-t5-large`, lo que implica que la calidad del prompt depende de un codificador T5 de gran tamano externo al checkpoint de difusion.

## Capacidades

- Generacion de imagenes texto-a-imagen a 512 x 512 px en espacio de pixeles.
- Presupuesto de tokens ajustable en inferencia: un mismo checkpoint sirve para distintos niveles de detalle y coste.
- Control de guidance (CFG) configurable; la model card recomienda 6,0 para L y 2,5-5,0 para B en rejilla densa, y alrededor de 7,0 al 25 % de la rejilla.
- Dos tamanos de modelo (B/16 y L/16) para equilibrar calidad y requisitos de hardware.
- Condicionamiento de texto multilingue potencial via flan-t5-large (no declarado explicitamente por el autor).
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo de razonamiento explicito.

## Casos de uso

- Generacion de imagenes en produccion con presupuesto de computo ajustable: el operador puede fijar `--budget` segun la carga del servidor, reduciendo tokens en horas punta y aumentandolos cuando haya margen, sin cambiar de modelo.
- Prototipado rapido en GPUs de gama media: la variante B/16 (260 M de parametros, 1,04 GB) permite iterar sobre prompts e ideas visuales en hardware consumer.
- Generacion de miniaturas y assets de baja resolucion: con presupuestos bajos de tokens (por ejemplo, 256-512) se obtienen imagenes 512 x 512 adecuadas para previews o placeholders.
- Investigacion en tokenizacion adaptativa: el checkpoint sirve como referencia reproducible para estudiar el compromiso entre presupuesto de tokens y calidad perceptual en difusion pixel-space.
- Pipelines de aumento de datos sinteticos: generacion por lotes de imagenes 512 x 512 para entrenamiento de clasificadores o detectores, ajustando el presupuesto para maximizar throughput.
- Demos y aplicaciones interactivas de texto-a-imagen: al ser MIT y pesar menos de 4 GB, se puede empaquetar en entornos de demostracion o notebooks sin infraestructura dedicada.
- Experimentacion con codificadores de texto alternativos: al usar flan-t5-large como encoder externo, es un punto de partida para probar otros encoders T5 en difusion pixel-space.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas FID, CLIP score, IS ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint L/16 ocupa 3,66 GB en disco; en fp32 en memoria rondaria los 3,7 GB de pesos, mas activaciones y el codificador flan-t5-large (aproximadamente 3 GB adicionales en fp32). El B/16 ocupa 1,04 GB de pesos.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) o A100/H100 son holgadas; una RTX 3060 (12 GB) o RTX 4070 (12 GB) deberian ser suficientes para L/16 en fp32 con margen para el encoder.
- Cabe en GPU consumer: si, tanto B/16 como L/16, siempre que se disponga de al menos 8-12 GB de VRAM en funcion de la precision y del encoder de texto.
- Opciones de despliegue: el repositorio oficial usa `sample.py` sobre PyTorch con pesos `.pt`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLMs, no a difusion). No hay variantes GGUF ni ONNX publicadas.
- Latencia y throughput: no disponibles. El coste escala con el presupuesto de tokens elegido, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto / tokens | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BudgetPix-MiniT2I (B/16) | 260 M | 512 x 512 | 1.024 densos, presupuesto ajustable | MIT | Hugging Face (BudgetAny) |
| BudgetPix-MiniT2I (L/16) | 915 M | 512 x 512 | 1.024 densos, presupuesto ajustable | MIT | Hugging Face (BudgetAny) |
| MiniT2I (base) | no disponible | 512 x 512 | rejilla densa fija | no disponible | Hugging Face (MiniT2I) |
| PixelDiT | no disponible | no disponible | no disponible | no disponible | mencionado en la model card como base del metodo |
| pMF | no disponible | no disponible | no disponible | no disponible | mencionado en la model card como base del metodo |

La model card cita JiT, MiniT2I, PixelDiT y pMF como familias de difusion pixel-space sobre las que se aplica BudgetPix, pero no aporta especificaciones ni resultados comparativos de esos modelos. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Implementacion no oficial: el propio autor indica que es una reimplementacion comunitaria de BudgetPix y no un lanzamiento oficial; puede diferir del metodo original en detalles de entrenamiento o calidad.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad (FID, CLIP) frente a alternativas, lo que dificulta evaluar su idoneidad en produccion.
- Sin descargas ni validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay senales de uso real.
- Riesgo de alucinacion visual y sesgos: como todo modelo texto-a-imagen, puede generar contenido inexacto, estereotipado o no solicitado; no se documentan mitigaciones ni evaluaciones de sesgo.
- Idiomas no declarados: aunque flan-t5-large es multilingue, el autor no especifica que idiomas funcionan bien en los prompts.
- Formato de pesos limitado: solo `.pt` de PyTorch; no hay GGUF, ONNX ni cuantizaciones documentadas, lo que restringe opciones de despliegue fuera de PyTorch.
- Dependencia del encoder externo: requiere descargar `google/flan-t5-large` del Hub en el primer uso, anadiendo peso y dependencia de red.
- Resolucion fija: 512 x 512; no se documenta soporte para otras resoluciones ni aspect ratios.
- Licencia MIT: permisiva para uso comercial, pero conviene verificar la licencia de los pesos base de MiniT2I y del encoder flan-t5-large, que pueden tener terminos propios.

## Enlaces

- Hugging Face: https://huggingface.co/BudgetAny/BudgetPix-MiniT2I
- Pagina del proyecto: https://budgetany.github.io/budgetpix/
- Codigo (BudgetAny): https://github.com/BudgetAny/BudgetPix/tree/main/minit2i
- Paper (arXiv): https://arxiv.org/abs/2610.12307
- Repositorio de referencia (BudgetPix-public): https://github.com/budgetpix/BudgetPix-public
- Organizacion BudgetAny en Hugging Face: https://huggingface.co/BudgetAny
- Modelo base MiniT2I: https://huggingface.co/MiniT2I/MiniT2I
- Codigo MiniT2I: https://github.com/Hope7Happiness/minit2i-torch
- Codigo APT: https://github.com/rccchoudhury/apt
- Codificador de texto: https://huggingface.co/google/flan-t5-large
