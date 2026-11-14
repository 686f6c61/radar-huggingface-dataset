# BudgetAny/BudgetPix-PixelDiT

## Resumen

BudgetPix-PixelDiT es un modelo de difusion texto-a-imagen que opera directamente en espacio de pixeles a 1024 x 1024, construido como un fine-tuning de PixelDiT-T2I 1.3B de NVIDIA mediante la tecnica BudgetPix de tokenizacion adaptativa al computo. Lo publica BudgetAny, una reimplementacion comunitaria y no oficial del metodo BudgetPix descrito por Kara et al. (2026) en arXiv:2610.12307. El problema que aborda es el coste fijo de inferencia en los diffusion transformers: en lugar de ejecutar siempre una rejilla densa de tokens, permite elegir en tiempo de inferencia cuantos tokens procesa el transformer, manteniendo los mismos pesos para cualquier presupuesto.

La innovacion central es un mapa de detalle basado en entropia que fusiona primero las regiones mas planas en tokens gruesos y asigna los tokens finos a las zonas con mas detalle. Asi, un mismo checkpoint sirve para presupuestos que van desde una fraccion de la rejilla densa (4.096 tokens) hasta la rejilla completa, con un ajuste de guidance que compensa la perdida de tokens. El modelo tiene 1.307 millones de parametros y un repositorio de 5,2 GB en formato PyTorch (`.pt`).

Es relevante ahora porque propone una via practica para desacoplar calidad de imagen y coste de computo en generacion pixel-space, un regimen que evita el VAE y sus artefactos de reconstruccion. La contrapartida es una licencia restrictiva (NSCLv1, solo uso no comercial) heredada de los pesos de NVIDIA, y la ausencia de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer en espacio de pixeles (PixelDiT) con tokenizacion adaptativa al computo (BudgetPix) |
| Parametros totales | 1.307 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; rejilla densa de 4.096 tokens por imagen a 1024 x 1024, presupuesto configurable en inferencia |
| Tipos de cuantizacion | no disponible (pesos distribuidos en `.pt` de precision completa; no se documentan variantes GGUF, FP8 ni INT8) |
| Idiomas soportados | no disponible (prompts en lenguaje natural; el codificador de texto es gemma-2-2b-it) |
| Licencia | NSCLv1 (NVIDIA License), solo uso no comercial |
| Formato de pesos | PyTorch (`.pt`), 5,23 GB, con checksums SHA-256 |

## Arquitectura y entrenamiento

El modelo es un diffusion transformer que genera imagenes de 1024 x 1024 directamente en espacio de pixeles, sin VAE intermedio, partiendo de PixelDiT-T2I 1.3B de NVIDIA. Sobre esa base se aplica el fine-tuning BudgetPix, que introduce un esquema de tokenizacion adaptativa: un mapa de detalle derivado de la entropia decide que regiones de la imagen se representan con tokens finos y cuales se agrupan en tokens gruesos. La rejilla densa de referencia es de 4.096 tokens; el usuario selecciona un presupuesto menor (por ejemplo 2.048, la mitad) y el modelo redistribuye la resolucion de tokens en consecuencia, reutilizando los mismos pesos.

El condicionamiento textual corre a cargo de `Efficient-Large-Model/gemma-2-2b-it`, descargado del Hub en el primer uso. El muestreo por defecto usa guidance 2,75, que sube hasta aproximadamente 4,5 cuando se trabaja al 25 % de la rejilla, compensando la menor capacidad de representacion. La implementacion se apoya en PixelDiT y en APT, y el codigo publicado es una reimplementacion publica de BudgetPix, no un release oficial de los autores del paper. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion texto-a-imagen a 1024 x 1024 en espacio de pixeles, sin decodificador VAE.
- Control del presupuesto de computo en inferencia: un mismo checkpoint opera con distinto numero de tokens por imagen.
- Asignacion adaptativa de tokens finos a regiones de alto detalle y tokens gruesos a regiones planas.
- Ajuste de guidance escalado al presupuesto de tokens para mantener la fidelidad al prompt.
- Condicionamiento con prompts en lenguaje natural mediante el text encoder gemma-2-2b-it.
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo de razonamiento explicito.

## Casos de uso

- Prototipado rapido de conceptos visuales: con un presupuesto bajo (por ejemplo 1.024 o 2.048 tokens) se obtienen bocetos a 1024 px en menos computo, utiles para explorar variaciones de prompt antes de lanzar una generacion completa.
- Generacion por lotes con presupuesto variable: en un pipeline de catalogo o contenidos, las imagenes de fondo o secundarias se generan con presupuestos reducidos y las principales con la rejilla densa, usando el mismo checkpoint y evitando mantener dos modelos.
- Investigacion en eficiencia de diffusion: el modelo sirve como banco de pruebas para estudiar la relacion entre presupuesto de tokens, calidad percibida y coste, al ser reproducible desde el codigo publicado.
- Renderizado de escenas con jerarquia de detalle: el mapa de entropia concentra tokens en sujetos y texturas, lo que encaja en imagenes con fondos simples y un objeto protagonista.
- Generacion de ilustracion editorial o conceptual en entornos academicos no comerciales, donde la licencia NSCLv1 es admisible.
- Evaluacion comparativa de tokenizacion adaptativa frente a rejillas densas fijas en experimentos de ablation, gracias al control directo del parametro `--budget`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El checkpoint pesa 5,23 GB en precision completa; a ello se suma el text encoder gemma-2-2b-it, por lo que se requiere holgura adicional sobre esos 5,23 GB.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, el modelo entra en el rango de GPUs de 24 GB o superiores, pero no hay confirmacion del autor.
- Cabe en consumer GPU: no confirmado; el peso del checkpoint (5,23 GB) sugiere que es viable en GPUs de consumo con suficiente VRAM para pesos y activaciones, pero no se documenta.
- Opciones de despliegue: script `sample.py` del repositorio BudgetPix (ruta `pixeldit`), con descarga de pesos via `hf download`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a LLM y no aplican a este diffusion transformer).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / rejilla | Espacio | Licencia | Presupuesto variable |
|---|---|---|---|---|---|
| BudgetPix-PixelDiT | 1.307 M | 4.096 tokens densos, configurable | Pixeles | NSCLv1 (no comercial) | Si |
| PixelDiT-T2I 1.3B (NVIDIA) | 1.300 M | 4.096 tokens densos | Pixeles | NSCLv1 (no comercial) | No |
| Modelos texto-a-imagen latentes tipo SDXL / SD3 | no disponible en esta ficha | rejilla latente fija | Latente (VAE) | variable | No |

La comparacion directa con modelos latentes no puede cuantificarse sin datos de benchmarks publicados para este checkpoint. La diferencia estructural frente a PixelDiT base es la tokenizacion adaptativa; frente a los modelos latentes, la ausencia de VAE y el control de presupuesto de tokens.

## Limitaciones y advertencias

- Licencia NSCLv1: uso exclusivamente no comercial. Cualquier despliegue en produccion comercial requiere autorizacion de NVIDIA sobre los pesos base.
- Es una reimplementacion no oficial: los resultados pueden diferir de los del paper original de BudgetPix.
- No hay benchmarks publicados en la informacion disponible, por lo que la calidad real frente a PixelDiT base o modelos latentes no esta cuantificada.
- El ajuste de guidance debe recalibrarse segun el presupuesto de tokens (2,75 por defecto, ~4,5 al 25 % de la rejilla); usar valores fijos puede degradar la fidelidad al prompt.
- Riesgo de alucinacion visual y de artefactos en regiones con detalle alto cuando el presupuesto es muy bajo, por la fusion agresiva de tokens.
- Idiomas soportados no documentados; el comportamiento multilingue depende del text encoder gemma-2-2b-it y no se ha evaluado.
- Sin informacion sobre sesgos del dataset de entrenamiento ni sobre composicion de datos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Formato de pesos unico (`.pt`); no hay variantes cuantizadas ni GGUF, lo que limita el despliegue en hardware modesto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BudgetAny/BudgetPix-PixelDiT
- Pagina del proyecto: https://budgetany.github.io/budgetpix/
- Codigo: https://github.com/BudgetAny/BudgetPix/tree/main/pixeldit
- Paper: https://arxiv.org/abs/2610.12307
- Organizacion BudgetAny: https://huggingface.co/BudgetAny
- Repositorio publico de referencia: https://github.com/budgetpix/BudgetPix-public
- Modelo base PixelDiT: https://huggingface.co/nvidia/PixelDiT-1300M-1024px
- Codigo PixelDiT: https://github.com/NVlabs/PixelDiT
- Codigo APT: https://github.com/rccchoudhury/apt
- Text encoder: https://huggingface.co/Efficient-Large-Model/gemma-2-2b-it
