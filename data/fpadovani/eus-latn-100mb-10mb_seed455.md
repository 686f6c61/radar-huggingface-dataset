# fpadovani/eus-latn-100mb-10mb_seed455

## Resumen

El modelo `fpadovani/eus-latn-100mb-10mb_seed455` es un ajuste fino (fine-tune) del modelo base `goldfish-models/eus_latn_100mb`, desarrollado por el usuario fpadovani. Se trata de un modelo de generación de texto basado en la arquitectura GPT-2, con 124,7 millones de parámetros, entrenado mediante aprendizaje supervisado (SFT) utilizando la librería TRL de HuggingFace. El nombre sugiere que el ajuste se realizó sobre un subconjunto de datos de 10 MB (probablemente en euskera, dado el prefijo "eus-latn"), con una semilla concreta (seed455) para reproducibilidad.

Este modelo es relevante en el contexto de la investigación sobre lenguas minoritarias y el ajuste eficiente de modelos preentrenados con conjuntos de datos pequeños. Al estar basado en un modelo de 100 MB de parámetros, su tamaño reducido permite experimentar en hardware consumer, aunque su utilidad práctica es limitada fuera del ámbito académico. No se dispone de información pública sobre la licencia, los idiomas soportados ni la longitud de contexto, lo que dificulta su uso en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (basada en el tag `gpt2`) |
| Parametros totales | 124.770.816 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors) |
| Idiomas soportados | No disponible (presumiblemente euskera en alfabeto latino, por el nombre) |
| Licencia | No disponible (la model card indica "licence: license", que no es una licencia concreta) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `goldfish-models/eus_latn_100mb`, que a su vez es un modelo de lenguaje basado en GPT-2 entrenado para euskera. El proceso de fine-tuning se realizó con SFT (Supervised Fine-Tuning) utilizando la librería TRL (versión 0.23.0) y Transformers 4.56.2. No se especifican detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del repositorio indica que se usó un subconjunto de 10 MB de datos y una semilla fija (455), lo que sugiere un experimento controlado para evaluar el impacto del tamaño del dataset en el ajuste fino. No hay información sobre innovaciones técnicas más allá del uso estándar de SFT.

## Capacidades

- Generación de texto en euskera (presumiblemente, dado el nombre y el modelo base).
- Soporte de la API de `pipeline` de Transformers para generación de texto.
- Compatible con `text-generation-inference` y `endpoints_compatible` según los tags.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.
- El modelo es monolingüe (euskera) por su origen, aunque no se confirma oficialmente.

## Casos de uso

- Investigación académica sobre ajuste fino de modelos de lenguaje para lenguas minoritarias: el modelo sirve como ejemplo de fine-tuning con datasets pequeños, permitiendo estudiar el efecto de la cantidad de datos en el rendimiento.
- Prototipado de generación de texto en euskera: para experimentos rápidos donde se necesite un generador básico sin requisitos de calidad alta.
- Evaluación de técnicas SFT con TRL: los desarrolladores pueden replicar el entrenamiento y comparar resultados variando la semilla o el tamaño del dataset.
- Educación en PLN: útil para demostrar el flujo de trabajo de fine-tuning con HuggingFace y TRL en entornos docentes.
- Comparación con el modelo base: permite medir el impacto del ajuste fino en métricas de perplejidad o generación para euskera.
- Pruebas de infraestructura: al ser un modelo pequeño, sirve para validar despliegues en vLLM o TGI sin coste computacional alto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 124,7 millones de parámetros, en fp32 (~500 MB) cabe en cualquier GPU con al menos 1 GB de VRAM. En cuantización int8 o int4, el uso sería aún menor.
- GPU recomendadas: cualquier GPU consumer moderna (GTX 1060 6GB, RTX 2060, RTX 3060, etc.) es suficiente. Incluso podría ejecutarse en CPU con llama.cpp.
- Compatible con GPUs de gama baja y también con Apple Silicon (via llama.cpp).
- Opciones de despliegue: vLLM, TGI, Ollama, llama.cpp, Transformers con `pipeline`.
- Latencia y throughput: no se dispone de datos medidos, pero por el tamaño se espera una latencia baja (del orden de decenas de ms por token en GPU moderna).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| goldfish-models/eus_latn_100mb (base) | ~100M | No disponible | No disponible | Modelo base para euskera |
| fpadovani/eus-latn-100mb-10mb_seed455 | 124.7M | No disponible | No disponible | Fine-tune experimental del anterior |
| Otros modelos de euskera (p.ej. Latxa) | No disponible | No disponible | No disponible | No se dispone de datos comparables |

No se dispone de información suficiente para una comparativa detallada con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo experimental con 0 descargas y 0 likes en HuggingFace, lo que indica que no ha sido validado por la comunidad.
- No se especifica licencia, lo que impide su uso comercial sin consultar al autor.
- No se documentan sesgos ni riesgos de alucinación; al ser un modelo pequeño y entrenado con pocos datos, es probable que genere texto incoherente o con errores.
- La longitud de contexto no se indica; si es la estándar de GPT-2 (1024 tokens), podría ser insuficiente para tareas que requieran contexto largo.
- No hay garantía de soporte para otros idiomas distintos del euskera.
- El tamaño del repositorio (3.0 GB) es inusualmente grande para 124M parámetros, lo que sugiere que podría incluir archivos adicionales o pesos en múltiples formatos no documentados.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/fpadovani/eus-latn-100mb-10mb_seed455)
- [Modelo base goldfish-models/eus_latn_100mb](https://huggingface.co/goldfish-models/eus_latn_100mb)
- [Registro de entrenamiento en Weights & Biases](https://wandb.ai/f-padovani-university-of-groningen/new_tokenizers/runs/fuvd7yna)
- [Repositorio de TRL](https://github.com/huggingface/trl)
