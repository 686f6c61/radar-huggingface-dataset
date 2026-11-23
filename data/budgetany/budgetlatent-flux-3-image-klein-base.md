# BudgetAny/BudgetLatent-FLUX-3-Image-Klein-Base

## Resumen

BudgetLatent-FLUX-3-Image-Klein-Base es un ajuste fino (fine-tune) del modelo de difusion texto-a-imagen FLUX 3 Image Klein Base de Black Forest Labs, desarrollado por el proyecto BudgetAny. Su propuesta central es la tokenizacion adaptativa: un mismo checkpoint puede generar imagenes a 1024 × 1024 operando con cualquier numero de sus 4096 tokens latentes, desde el 100 % hasta tan solo el 10 %. Un quadtree fusiona las regiones mas planas de la imagen en tokens mas gruesos (de 32 a 128 px en lugar de 16 px), el transformer procesa la secuencia reducida y pequenos refinadores restauran el detalle final.

El modelo resuelve un problema practico de coste computacional en difusion latente: en lugar de entrenar checkpoints separados para distintos regimenes de calidad/velocidad, un unico modelo permite al usuario elegir el presupuesto de tokens en tiempo de inferencia. Segun las mediciones del autor, bajar al 50 % de los tokens reduce el tiempo por imagen de 12,81 s a 6,24 s (aceleracion de 2,05×) y al 10 % lo reduce a 1,77 s (7,26×), con un pico de memoria que pasa de 10,9 GiB a 9,9 GiB.

Se trata de una implementacion no oficial y de codigo abierto, basada en el metodo del paper BudgetPix (Kara et al., 2026), que originalmente cubre difusion en espacio de pixeles; la extension a difusion latente es aportacion de este proyecto. El transformer ajustado tiene 4,90 B parametros y se distribuye en bf16 (9,79 GB), reutilizando el codificador de texto Qwen3-VL y el VAE del modelo base. Ademas de generacion texto-a-imagen, soporta edicion, generacion multi-referencia y control por cajas de layout en todos los presupuestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion latente (FLUX 3 Image Klein Base) con tokenizacion adaptativa mediante quadtree y refinadores de detalle |
| Parametros totales | 4,90 B (solo el transformer ajustado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; secuencia de 4096 tokens latentes en denso (1024 × 1024), reducible hasta el 10 % (409 tokens) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en bf16) |
| Idiomas soportados | no disponible (el codificador de texto es Qwen3-VL) |
| Licencia | FLUX Kommunity License v.1.0 (uso no comercial; uso comercial de salidas por Qualifying Users segun sus terminos) |
| Formato de pesos | safetensors (bf16); el codificador de texto y el VAE se descargan aparte del modelo base |

## Arquitectura y entrenamiento

El modelo parte del transformer de difusion latente de FLUX 3 Image Klein Base y lo ajusta para operar sobre secuencias de tokens de longitud variable. El mecanismo clave es un quadtree que analiza la imagen latente y fusiona las regiones de menor complejidad en tokens de mayor tamano (32, 64 o 128 px frente a los 16 px base), de modo que el transformer procesa una secuencia mas corta cuando el presupuesto baja. Tras la difusion, una serie de refinadores de pequena escala restauran el detalle en las zonas fusionadas. El codificador de texto Qwen3-VL y el VAE no se modifican y se heredan del modelo base.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. El autor indica que el informe tecnico esta pendiente de publicacion y que, por ahora, debe citarse el paper BudgetPix (Kara et al., 2026), que describe el metodo original para difusion en espacio de pixeles; la adaptacion a difusion latente y las cifras presentadas son mediciones propias del proyecto. El checkpoint se publico el 21 de noviembre de 2026 y se actualizo dos dias despues.

## Capacidades

- Generacion texto-a-imagen a 1024 × 1024 con presupuesto de tokens configurable entre el 100 % y el 10 % (4096 a 409 tokens).
- Edicion de imagenes mediante referencias (`--ref`), con soporte de hasta 10 imagenes de referencia; las referencias conservan todos sus tokens, por lo que la aceleracion es menor que en texto-a-imagen.
- Generacion multi-referencia, combinando varias imagenes de entrada en una sola salida.
- Control de composicion mediante cajas de layout escritas en el prompt, funcional en todos los presupuestos de tokens.
- Visualizacion del layout de tokens por region (16 px en verde, 32 px en amarillo, 64 px en azul, 128 px en morado) mediante la opcion `--overlay`.
- Inferencia compilada y optimizada con el flag `--fast`.
- No se documentan capacidades de tool calling, agentes ni modos de razonamiento, por tratarse de un modelo de generacion de imagen.

## Casos de uso

- Prototipado rapido de conceptos visuales: con un presupuesto del 10-20 % el modelo genera una imagen en 1,77-2,93 s, lo que permite iterar sobre decenas de variaciones de prompt antes de comprometerse con una generacion a plena calidad.
- Generacion final de alta fidelidad: al 100 % de tokens (4096) se obtiene la maxima calidad del checkpoint en 12,81 s por imagen, adecuado para material de publicacion o marketing.
- Edicion de imagenes existentes: el flag `--ref` permite introducir hasta 10 referencias para modificar una imagen manteniendo coherencia con el original, util en retoque fotografico asistido o sustitucion de fondos.
- Composicion con layout controlado: las cajas de layout en el prompt permiten fijar la posicion de elementos, lo que resulta practico para maquetas de interfaz, ilustracion editorial o generacion de banners con zonas reservadas.
- Generacion multi-referencia para consistencia de personaje o producto: combinar varias imagenes de referencia permite mantener la identidad visual de un sujeto a lo largo de una serie de imagenes.
- Servicios con restricciones de latencia o memoria: en despliegues por lotes, reducir el presupuesto al 50 % baja el pico de memoria a batch 8 de 19,9 GiB a 14,9 GiB, lo que permite aumentar el throughput en la misma GPU.
- Exploracion de investigacion en tokenizacion adaptativa: el codigo y los pesos permiten reproducir los experimentos del paper BudgetPix y extender el metodo a otros modelos de difusion latente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, etc.) en la informacion disponible. El autor unicamente proporciona mediciones de tiempo y memoria en una NVIDIA RTX PRO 6000 Blackwell Server Edition, batch 1, `--fast`, 50 pasos Euler con classifier-free guidance 3.5:

| Presupuesto | Tokens de imagen | Tiempo por imagen (s) | Aceleracion | Memoria pico (GiB) |
|---:|---:|---:|---:|---:|
| 100 % | 4096 | 12,81 | 1,00× | 10,9 |
| 90 % | 3685 | 11,20 | 1,14× | 10,7 |
| 80 % | 3277 | 10,02 | 1,28× | 10,6 |
| 70 % | 2866 | 8,56 | 1,50× | 10,5 |
| 60 % | 2458 | 7,40 | 1,73× | 10,4 |
| 50 % | 2047 | 6,24 | 2,05× | 10,2 |
| 40 % | 1639 | 4,88 | 2,63× | 10,1 |
| 30 % | 1228 | 3,82 | 3,36× | 10,0 |
| 20 % | 820 | 2,93 | 4,37× | 9,9 |
| 10 % | 409 | 1,77 | 7,26× | 9,9 |

A batch 8, el pico de memoria desciende con el presupuesto: 19,9 GiB al 100 %, 14,9 GiB al 50 % y 11,5 GiB al 10 %.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10 GiB en bf16 a batch 1 (los pesos ocupan 9,6 GiB), con independencia practica del presupuesto de tokens; a batch 8 el pico varia entre 19,9 GiB (100 %) y 11,5 GiB (10 %).
- GPU recomendadas: el autor mide sobre una NVIDIA RTX PRO 6000 Blackwell Server Edition; por capacidad de memoria, tambien son adecuadas A100 (40/80 GB), H100 y RTX 4090 (24 GB).
- Cabe en GPU de consumo: si, en tarjetas con al menos 12 GB de VRAM para batch 1, como la RTX 4090 o la RTX 4080; no se documenta soporte para GPUs de 8 GB.
- Opciones de despliegue: el proyecto proporciona su propio pipeline (`scripts/inference/sample.py`) con opcion `--fast` para inferencia compilada; no se menciona soporte para vLLM, llama.cpp, Ollama o TGI, que ademas no aplican directamente a un modelo de difusion.
- Latencia y throughput: 12,81 s por imagen al 100 % y 1,77 s al 10 % en la GPU de referencia, batch 1; el autor no publica cifras de throughput a batch mayor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tokens | Presupuesto variable | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BudgetLatent-FLUX-3-Image-Klein-Base | 4,90 B (transformer) | 4096 tokens latentes, reducible al 10 % | Si, por tokenizacion adaptativa | FLUX Kommunity License v.1.0 | Hugging Face (56 descargas) |
| FLUX 3 Image Klein Base | no disponible en la informacion | no disponible en la informacion | No | FLUX Kommunity License v.1.0 | Hugging Face (modelo base oficial) |
| BudgetLatent-FLUX.2-klein-base-4B | 4 B | no disponible en la informacion | Si | no disponible en la informacion | Hugging Face (mismo proyecto) |
| BudgetLatent-FLUX.2-klein-4B | 4 B | no disponible en la informacion | Si | no disponible en la informacion | Hugging Face (mismo proyecto) |

No se dispone de datos de rendimiento comparativo (calidad de imagen, FID u otras metricas) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo no oficial: es una implementacion de codigo abierto de terceros, no un lanzamiento de Black Forest Labs; el informe tecnico propio aun no se ha publicado.
- Licencia restrictiva: la FLUX Kommunity License v.1.0 limita el uso a fines no comerciales, salvo el uso comercial de las salidas por Qualifying Users segun sus terminos; es imprescindible revisar `LICENSE.md` antes de cualquier despliegue en produccion.
- Requiere aceptar la licencia del modelo base en Hugging Face y autenticarse (`hf auth login`) para descargar el codificador de texto y el VAE.
- En edicion con referencias la aceleracion es menor que en texto-a-imagen, porque las imagenes de referencia conservan todos sus tokens.
- La reduccion de tokens fusiona regiones planas; en imagenes con mucho detalle fino distribucion en todo el encuadre, los presupuestos bajos pueden degradar la fidelidad, aunque el autor no publica metricas de calidad que lo cuantifiquen.
- No se documentan sesgos conocidos ni tasas de alucinacion; como modelo generativo de imagen, puede producir contenido inexacto o estereotipado segun los prompts.
- No hay informacion sobre idiomas soportados por el codificador de texto mas alla de lo que ofrece Qwen3-VL.
- El repo pesa 9,8 GB y el pipeline requiere clonar el repositorio de GitHub e instalar dependencias, ademas de descargar los pesos auxiliares.
- No se documentan opciones de cuantizacion, lo que limita el despliegue en GPUs con menos de 12 GB de VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BudgetAny/BudgetLatent-FLUX-3-Image-Klein-Base
- Pagina del proyecto: https://budgetany.github.io/budgetlatent/
- Codigo en GitHub: https://github.com/BudgetAny/BudgetLatent
- Paper BudgetPix (arXiv:2610.12307): https://arxiv.org/abs/2610.12307
- Organizacion BudgetAny en Hugging Face: https://huggingface.co/BudgetAny
- Modelo base FLUX 3 Image Klein Base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Variante BudgetLatent-FLUX.2-klein-base-4B: https://huggingface.co/BudgetAny/BudgetLatent-FLUX.2-klein-base-4B
- Variante BudgetLatent-FLUX.2-klein-4B: https://huggingface.co/BudgetAny/BudgetLatent-FLUX.2-klein-4B
- Variante BudgetLatent-FLUX-3-Image-Klein: https://huggingface.co/BudgetAny/BudgetLatent-FLUX-3-Image-Klein
