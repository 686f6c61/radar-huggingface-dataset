# BudgetAny/BudgetPix-pMF

## Resumen

BudgetPix-pMF es un modelo de generacion de imagenes en espacio de pixeles desarrollado por la comunidad BudgetAny. Se trata de un fine-tune del modelo pMF (pixel MeanFlow) de Lyy0725, adaptado con la tecnica BudgetPix de tokenizacion adaptativa al computo descrita en el paper arXiv:2610.12307 (Kara et al., 2026). El modelo genera imagenes condicionadas por clase sobre ImageNet en un solo paso de inferencia, sin necesidad de muestreo iterativo multiple.

La innovacion principal es que un unico checkpoint sirve para cualquier presupuesto de tokens. En inferencia, el usuario elige cuantos tokens procesa el transformer: un mapa de detalle basado en entropia fusiona primero las regiones mas planas en tokens gruesos y asigna los tokens finos a las zonas con mas detalle. El modelo base pMF-L/16 opera a 256 px con una rejilla densa de 256 tokens y 517 millones de parametros.

Es relevante porque demuestra que es posible desacoplar el coste computacional de inferencia del checkpoint entrenado en modelos de difusion en espacio de pixeles, permitiendo ajustar el presupuesto de tokens (y por tanto el coste) sin reentrenar. No obstante, se trata de una reimplementacion no oficial de la comunidad, no de un lanzamiento oficial de los autores del paper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion en espacio de pixeles (pixel MeanFlow, one-step) con tokenizacion adaptativa BudgetPix |
| Parametros totales | 517 M (variante L/16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; rejilla de 256 tokens densos a 256 px) |
| Tipos de cuantizacion | No disponible (pesos en punto flotante, formato .pt) |
| Idiomas soportados | No aplica (generacion de imagenes; sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt); checksums SHA-256 en `SHA256SUMS` |

## Arquitectura y entrenamiento

El modelo se basa en pixel MeanFlow (pMF), un enfoque de difusion en espacio de pixeles que genera imagenes en un solo paso (one-step) en lugar de requerir el muestreo iterativo tipico de los modelos de difusion clasicos. La variante utilizada es pMF-L/16 a 256 px, con 517 millones de parametros y una rejilla densa de 256 tokens. Sobre esta base se aplica BudgetPix, una tecnica de tokenizacion adaptativa al computo que reorganiza la rejilla de tokens segun un mapa de detalle basado en entropia.

El entrenamiento parte de los pesos liberados de pMF (Lyy0725/pMF) mediante fine-tuning con la metodologia BudgetPix. La seleccion del layout de tokens se realiza a priori, por defecto a partir de una muestra densa del propio modelo para la misma clase y ruido. El repositorio incluye tambien los pesos originales de pMF convertidos a PyTorch con la rama auxiliar v (`pmf_released_L16_full_uv.pt` y `pmf_released_B16_full_uv.pt`). No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas de RLHF o DPO (no aplicables a generacion de imagenes).

## Capacidades

- Generacion de imagenes condicionada por clase (class-conditional) sobre las 1000 clases de ImageNet.
- Generacion en un solo paso (one-step), sin muestreo iterativo multiple.
- Tokenizacion adaptativa al presupuesto de computo: el mismo checkpoint funciona con distintos numeros de tokens por imagen (256 es la rejilla densa).
- Fusion adaptativa de regiones: las zonas planas se agrupan en tokens gruesos y las detalladas reciben tokens finos, guiado por un mapa de entropia.
- Generacion en espacio de pixeles (sin VAE ni tokenizador latente intermedio).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).

## Casos de uso

- Investigacion en eficiencia de difusion: permite estudiar el compromiso entre calidad de imagen y coste computacional variando el parametro `--budget` sin reentrenar, util para papers sobre tokenizacion adaptativa.
- Generacion rapida de imagenes de ImageNet para aumento de datos: al ser one-step, permite producir lotes de imagenes sinteticas por clase con baja latencia para entrenar clasificadores o aumentar datasets de investigacion.
- Prototipado de pipelines de generacion condicionada por clase: sirve como banco de pruebas para integrar modelos de difusion en espacio de pixeles en flujos de trabajo existentes.
- Experimentos de destilacion y evaluacion: util para comparar la calidad de muestras one-step frente a modelos de difusion iterativos en tareas controladas de ImageNet.
- Demostraciones academicas de computo adaptativo: el ajuste de presupuesto de tokens permite ilustrar en clases y tutoriales como un mismo modelo escala su coste de inferencia.
- Benchmarking de infraestructura de inferencia: al ser un modelo pequeno (517 M) y one-step, sirve para medir throughput y latencia de despliegues en GPUs de consumo sin la variabilidad del muestreo iterativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 2,07 GB (517 M parametros en punto flotante). Con overhead de activaciones y el mapa de detalle, se estima un consumo moderado, aunque no se dispone de cifras oficiales (no disponible).
- GPU recomendadas: al tratarse de un modelo pequeno y one-step, deberia caber en GPUs de consumo; no se dispone de recomendaciones oficiales (no disponible).
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del checkpoint; sin confirmacion oficial (no disponible).
- Opciones de despliegue: el repositorio oficial de codigo (github.com/BudgetAny/BudgetPix, carpeta `pmf`) con `sample.py`; descarga de pesos via `hf download`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de este tipo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Pasos de inferencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BudgetPix-pMF (este) | 517 M | Difusion en pixeles + tokenizacion adaptativa | One-step | MIT | Hugging Face (comunidad) |
| pMF (Lyy0725/pMF) | No disponible | Difusion en pixeles (MeanFlow) | One-step | No disponible en la informacion | Hugging Face |
| Modelos de difusion latente clasicos (p. ej. DiT) | No disponible | Difusion en espacio latente | Multiples pasos | Variable | Amplia |

La comparacion con alternativas concretas no esta disponible en la informacion proporcionada; la tabla recoge unicamente los datos conocidos del modelo base y la categoria general.

## Limitaciones y advertencias

- Es una reimplementacion no oficial de la comunidad (BudgetAny), no un lanzamiento oficial de los autores del paper BudgetPix.
- Modelo exclusivamente de generacion de imagenes condicionada por clase de ImageNet; no es un modelo de lenguaje ni soporta texto, codigo o razonamiento.
- No se dispone de informacion sobre sesgos del dataset de entrenamiento ni sobre evaluaciones de calidad o fidelidad de las muestras.
- La calidad de la imagen puede degradarse al reducir el presupuesto de tokens; el comportamiento exacto por debajo de 256 tokens no esta documentado con metricas.
- Restricciones de licencia: MIT, lo que permite uso comercial, pero conviene revisar la licencia del modelo base pMF del que deriva.
- Formato de pesos en .pt (PyTorch), no en safetensors ni GGUF; requiere el codigo del repositorio para la inferencia.
- Al ser un modelo one-step, no permite el control fino que ofrecen los muestreadores iterativos (numero de pasos, guiado por escala, etc.).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BudgetAny/BudgetPix-pMF
- Pagina del proyecto: https://budgetany.github.io/budgetpix/
- Codigo (carpeta pmf): https://github.com/BudgetAny/BudgetPix/tree/main/pmf
- Paper: https://arxiv.org/abs/2610.12307
- Organizacion BudgetAny en Hugging Face: https://huggingface.co/BudgetAny
- Repositorio pMF base: https://github.com/Lyy-iiis/pMF
- Repositorio APT: https://github.com/rccchoudhury/apt
- Modelo base en Hugging Face: https://huggingface.co/Lyy0725/pMF
- Reimplementacion publica: https://github.com/budgetpix/BudgetPix-public
