# localized-ft/Llama-3.1-8B-old-bird-names-first-third-v2-sft-seed3

## Resumen

Este modelo es un ajuste fino (fine-tuning) de `unsloth/Meta-Llama-3.1-8B-Instruct`, publicado por el usuario `localized-ft`. El nombre del repositorio sugiere que el entrenamiento se realizó sobre un subconjunto específico de datos relacionados con nombres de aves antiguas (la "primera tercera parte" del conjunto de datos, según el nombre `first-third`), con una semilla aleatoria fija (`seed3`) y una versión `v2` del pipeline de entrenamiento. Se trata de un experimento de investigación sobre localización o especialización de modelos de lenguaje, probablemente orientado a estudiar el comportamiento del modelo en dominios léxicos concretos.

El modelo mantiene la arquitectura original de Llama 3.1 de 8 mil millones de parámetros, con una ventana de contexto de 128.000 tokens. Está entrenado exclusivamente en inglés y se distribuye bajo licencia Apache 2.0. Al ser un ajuste fino de tipo instructivo (SFT, *supervised fine-tuning*), el modelo conserva las capacidades conversacionales y de seguimiento de instrucciones del modelo base, aunque especializado en el dominio de los datos de entrenamiento. Su relevancia es principalmente académica o experimental, dado que no se han publicado métricas de rendimiento ni benchmarks que permitan evaluar su calidad de forma objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | No especificado (formato original en safetensors, compatible con cuantizacion posterior) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama 3.1 de Meta, un transformer decoder-only con normalización RMSNorm, activación SwiGLU y atención con *rotary positional embeddings* (RoPE). El modelo base es la versión instruct de 8B parámetros, que ya incorpora un entrenamiento mixto con SFT y RLHF (DPO) para alineación con instrucciones. El ajuste fino adicional se realizó con la librería Unsloth, que optimiza el entrenamiento mediante kernels de atención y operaciones de memoria eficientes, y con la librería TRL de HuggingFace para el pipeline de SFT.

Los detalles del conjunto de datos de entrenamiento no están disponibles en la información publicada. El nombre del repositorio indica que se utilizó la primera tercera parte de un conjunto de datos llamado `old-bird-names-v2`, con una semilla aleatoria fija (`seed3`). No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas adicionales como DPO o RLHF en esta fase. El entrenamiento se realizó con Unsloth, que reporta una aceleración de 2x respecto a un entrenamiento estándar.

## Capacidades

- Generación de texto conversacional: al estar basado en Llama 3.1 Instruct, conserva la capacidad de mantener diálogos multi-turno y seguir instrucciones en inglés.
- Razonamiento y conocimiento general: hereda las capacidades del modelo base, aunque el ajuste fino puede haber alterado la distribución de conocimiento hacia el dominio de los datos de entrenamiento.
- Generación de código y matemáticas: capacidades presentes en el modelo base, presumiblemente conservadas, aunque sin garantías tras el ajuste fino.
- Tool calling y function calling: el modelo base Llama 3.1 Instruct soporta tool calling; no hay información sobre si el ajuste fino preserva esta capacidad.
- Capacidades multilingües: limitadas al inglés, según la declaración de idiomas del modelo.
- Sin capacidades especiales adicionales: no se menciona modo *thinking*, visión ni audio.

## Casos de uso

- Investigación académica sobre especialización de modelos: el modelo es útil para estudiar cómo el ajuste fino en un dominio léxico concreto (nombres de aves antiguas) afecta al comportamiento general del modelo. Se puede comparar con el modelo base y con otras variantes del mismo experimento (por ejemplo, las versiones `last-third` o `seed2`).
- Experimentos de *continual learning*: al ser un SFT sobre un subconjunto de datos, permite analizar fenómenos de olvido catastrófico o de retención de conocimiento general tras el ajuste fino.
- Evaluación de pipelines de entrenamiento: el uso de Unsloth y TRL permite reproducir el pipeline de entrenamiento y comparar la calidad del resultado con otros pipelines (por ejemplo, entrenamiento estándar con transformers).
- Análisis de sesgos y alucinaciones en dominios específicos: al estar especializado en un dominio concreto, se puede estudiar cómo el modelo maneja términos poco frecuentes o cómo alucina cuando se le pregunta por nombres de aves fuera del conjunto de entrenamiento.
- Pruebas de cuantización y despliegue: al ser un modelo de 8B con licencia Apache 2.0, es un candidato para probar técnicas de cuantización (GGUF, AWQ, GPTQ) y despliegue en entornos con recursos limitados.
- Generación de contenido especializado en ornitología histórica: si el conjunto de datos contiene información relevante, el modelo podría generar texto sobre nombres antiguos de aves, aunque sin garantías de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. Tampoco se proporcionan comparativas con el modelo base o con otras variantes del mismo experimento.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 8,03 B parámetros. En precisión fp16, ocupa aproximadamente 16 GB de VRAM. Con cuantización a 8 bits, se reduce a unos 8 GB; con 4 bits, a unos 4-5 GB.
- GPU recomendadas: para fp16, una GPU con 24 GB de VRAM (RTX 3090/4090, A10G, L4) es suficiente. Para cuantización 8 bits, una GPU de 16 GB (RTX 4080, A10) puede ser suficiente. Para 4 bits, una GPU de 8 GB (RTX 3070, RTX 4060) es viable.
- Compatibilidad con GPU de consumo: sí, con cuantización es posible ejecutarlo en GPUs de consumo de gama media-alta.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, HuggingFace TGI, Text Generation Inference, entre otros. El modelo es compatible con `transformers` y `text-generation-inference`.
- Latencia y throughput: no se han publicado datos específicos. Como referencia, un Llama 3.1 8B en fp16 en una A100 puede generar entre 50 y 100 tokens por segundo, dependiendo de la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `localized-ft/Llama-3.1-8B-old-bird-names-first-third-v2-sft-seed3` | 8,03 B | 128 K | Apache 2.0 | Ajuste fino experimental sobre nombres de aves antiguas |
| `unsloth/Meta-Llama-3.1-8B-Instruct` | 8,03 B | 128 K | Llama 3.1 Community License | Modelo base, sin ajuste fino adicional |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03 B | 128 K | Llama 3.1 Community License | Modelo oficial de Meta |

La comparativa se limita al modelo base, ya que no hay otros modelos de la misma categoría (ajuste fino sobre nombres de aves antiguas) con información pública suficiente. La principal diferencia entre el modelo evaluado y el modelo base es el ajuste fino adicional, que puede alterar el comportamiento en el dominio específico pero también degradar el rendimiento general.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al ser un ajuste fino sobre un dominio concreto, es probable que el modelo tenga un rendimiento degradado fuera de ese dominio.
- Riesgo de alucinación: el ajuste fino en un dominio léxico específico puede aumentar el riesgo de alucinaciones cuando se le pregunta por términos fuera del conjunto de entrenamiento.
- Limitaciones de contexto e idioma: el modelo solo soporta inglés. La ventana de contexto de 128 K tokens es amplia, pero no se ha verificado que el ajuste fino preserve la capacidad de manejar contextos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo base (Llama 3.1) tiene su propia licencia que puede imponer condiciones adicionales. Es recomendable revisar los términos de la licencia de Llama 3.1.
- Caveats para producción: no se recomienda su uso en producción sin una evaluación exhaustiva, dado que no hay benchmarks publicados y el propósito del modelo es experimental.
- Datos de entrenamiento desconocidos: no se ha publicado información sobre la composición del dataset, el número de tokens ni el proceso de filtrado, lo que dificulta evaluar su calidad y posibles sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/Llama-3.1-8B-old-bird-names-first-third-v2-sft-seed3
- Modelo base (Unsloth): https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Repositorio de Llama 3.1 de Meta: https://github.com/meta-llama/llama-models/tree/main/models/llama3_1
- Unsloth: https://github.com/unslothai/unsloth
- Variante relacionada (`last-third`): https://huggingface.co/localized-ft/Llama-3.1-8B-old-bird-names-last-third-v2-sft-seed4-epoch3
- Variante relacionada (`seed2`): https://huggingface.co/longtermrisk/Llama-3.1-8B-old-bird-names-v2-sft-seed2
