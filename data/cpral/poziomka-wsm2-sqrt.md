# cpral/poziomka-wsm2-sqrt

## Resumen

El modelo `cpral/poziomka-wsm2-sqrt` es un modelo de lenguaje de aproximadamente 4.100 millones de parámetros publicado por el usuario cpral en Hugging Face. Se trata de un experimento de fusión de checkpoints: según la model card, se utilizó una ponderación basada en raíz cuadrada (sqrt weighting) para combinar 87 checkpoints distintos de preentrenamiento, siguiendo la metodología propuesta en el artículo *WSM: Decay-Free Learning Rate Schedule via Checkpoint Merging for LLM Pre-training* (arXiv:2507.17634). El objetivo de esta técnica es obtener un modelo final de calidad superior sin necesidad de reentrenar desde cero, aprovechando la diversidad de los checkpoints intermedios.

La relevancia de este modelo radica en su enfoque experimental: demuestra una alternativa al entrenamiento convencional con programación de tasa de aprendizaje, que puede interesar a investigadores que trabajan en eficiencia de preentrenamiento y en técnicas de merging de modelos. Sin embargo, la información pública es muy limitada: no se especifican la arquitectura concreta, los idiomas soportados, la licencia ni los datos de entrenamiento. El repositorio contiene únicamente pesos en formato safetensors (8,2 GB) y una model card mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 4.119.797.632 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos estan en safetensors, probablemente FP16 o BF16 segun el tamano del repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo (tipo de transformer, atencion, numero de capas, etc.). El unico dato relevante es que se trata de un modelo de lenguaje preentrenado, dado que el articulo de referencia (WSM) se centra en el preentrenamiento de LLMs. El metodo empleado consiste en fusionar 87 checkpoints obtenidos durante el preentrenamiento, aplicando una ponderacion con funcion sqrt (raiz cuadrada) a los pesos de cada checkpoint antes de promediarlos. Esta estrategia pretende replicar el efecto de una programacion de tasa de aprendizaje sin decaimiento (decay-free), donde los checkpoints tardios reciben mayor peso relativo que los tempranos. No se mencionan detalles sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas de alineacion como RLHF o DPO.

## Capacidades

No se ha publicado ninguna informacion sobre las capacidades especificas del modelo. Dado que se trata de un LLM generico de 4B parametros, se podria esperar que sea capaz de generar texto, razonar y posiblemente ejecutar tareas simples de codigo, pero no hay evidencia concreta. No se confirma soporte para tool calling, agentes, vision ni multimodalidad.

## Casos de uso

Al no existir documentacion oficial ni benchmarks, los casos de uso son especulativos. Este modelo podria emplearse en entornos de investigacion para estudiar el impacto de la fusion de checkpoints en modelos pequenos, o como base para fine-tuning en tareas especificas si se confirma su calidad. Sin embargo, no se recomienda su uso en produccion sin una evaluacion previa exhaustiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni ninguna otra metrica estandar.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 8,2 GB para los pesos, mas overhead de activaciones y memoria del runtime, por lo que se necesitarian al menos 10-12 GB de VRAM. Con cuantizacion a 8 bits se reduciria a unos 4-5 GB, y a 4 bits unos 2-3 GB, aunque no se proporcionan ficheros cuantizados.
- GPU recomendadas: tarjetas con 12 GB o mas de VRAM, como RTX 3060, RTX 4070, RTX 4080, A10, L4 o superiores. En cuantizacion 4 bits podria caber en GPUs de 6-8 GB.
- Opciones de despliegue: al tener formato safetensors, se puede cargar con transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama. No hay ficheros GGUF publicados en el repositorio.
- Latencia y throughput: no disponibles. Para un modelo de 4B en una GPU moderna se esperaria una velocidad de decodificacion de decenas de tokens por segundo, pero sin datos reales.

## Comparativa con modelos similares

No se dispone de informacion de rendimiento para comparar con otros modelos de tamano similar. Sin embargo, se puede contextualizar su tamano con alternativas conocidas:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| cpral/poziomka-wsm2-sqrt | 4,1B | no disponible | no disponible | Fusion de 87 checkpoints |
| Qwen2.5-4B | 4,0B | 128K | Apache 2.0 | Modelo generalista con buen rendimiento |
| Llama-3.2-3B | 3,2B | 128K | Llama 3.2 Community | Modelo ligero de Meta |
| Phi-3.5-mini | 3,8B | 128K | MIT | Enfocado en razonamiento y codigo |

Sin benchmarks, no es posible establecer una comparativa objetiva.

## Limitaciones y advertencias

- No hay informacion sobre sesgos, alucinaciones ni limitaciones de contexto o idioma.
- La licencia no esta especificada, por lo que no se puede garantizar su uso comercial ni la redistribucion.
- El modelo es un experimento de investigacion sin validacion externa; su calidad y seguridad son desconocidas.
- El repositorio no incluye ficheros de configuracion ni codigo de ejemplo, lo que dificulta su reproduccion y uso directo.
- No se ha publicado ningun articulo ni documentacion adicional sobre este modelo concreto, solo la referencia al paper WSM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cpral/poziomka-wsm2-sqrt
- Articulo WSM (arXiv): https://arxiv.org/abs/2507.17634
