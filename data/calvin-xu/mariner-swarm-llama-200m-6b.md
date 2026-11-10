# Calvin-Xu/mariner-swarm-llama-200m-6b

## Resumen

MARINER swarm checkpoints: Llama 200M/6B es una colección de 290 checkpoints finales de modelos Llama de 201,1 millones de parámetros, publicada por Calvin-Xu como material de replicación del artículo *MARINER: Measuring and Modeling Repetition Harm for Multi-Epoch Data Mixing*. No es un modelo pensado para uso conversacional ni para despliegue en producción, sino un artefacto de investigación: cada checkpoint corresponde a una ejecución independiente de preentrenamiento con una mezcla de datos distinta sobre el mismo corpus (Dolma 3 y Dolmino), lo que permite estudiar empíricamente cómo afecta la repetición de épocas y la composición de la mezcla al rendimiento final.

El conjunto cubre 280 mezclas (238 diseños muestreados, 3 líneas base y 39 eliminaciones de un único bucket sobre una partición de 39 buckets), más diez repeticiones de la mezcla proporcional con semillas distintas. Cada ejecución entrena 6.000 millones de tokens y se guarda en fp32, lo que explica el tamaño del repositorio (91,7 GB). El modelo base es un Llama estándar de 201,1M de parámetros, sin instrucciones ni ajuste por preferencias.

Su relevancia es metodológica: proporciona un banco de modelos controlados donde la única variable que cambia entre ejecuciones es la mezcla de datos y el número de épocas, algo poco habitual en la literatura abierta. La licencia Apache 2.0 facilita reutilizar los checkpoints como línea base en estudios de data mixing, leyes de escalado o detección de daño por repetición.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama |
| Parámetros totales | 201,1M por checkpoint |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoints publicados en fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Cada checkpoint es un Llama decoder-only de 201,1M de parámetros. La model card no detalla la configuración exacta de capas, dimensiones ocultas, número de cabezas de atención ni vocabulario, por lo que esos datos deben consultarse en la configuración incluida en cada subcarpeta `run_XXXXX` del repositorio. Los pesos se guardan en fp32, sin cuantización.

El entrenamiento consiste en 6.000 millones de tokens por ejecución sobre una partición de 39 buckets de los pools Dolma 3 y Dolmino. Las 290 ejecuciones se dividen en 238 diseños de mezcla muestreados, 3 líneas base, 39 eliminaciones de un único bucket (para medir la contribución marginal de cada bucket) y 10 repeticiones de la mezcla proporcional con semillas diferentes (para estimar la varianza del entrenamiento). No se menciona RLHF, DPO ni ajuste por instrucciones: son modelos de preentrenamiento puro. La innovación metodológica es el propio diseño experimental, que permite ajustar modelos predictivos del daño por repetición multi-época; el artículo indica que sus ajustes usan las 280 mezclas.

## Capacidades

- Generación de texto autoregresiva básica, limitada por un modelo de 201,1M de parámetros y 6.000 millones de tokens de preentrenamiento.
- Modelado de lenguaje y evaluación de perplejidad sobre dominios concretos, que es el uso previsto en el artículo.
- No dispone de ajuste por instrucciones ni de modo de razonamiento explícito.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no documentadas; dependen de la composición de Dolma 3 y Dolmino, no especificada en la model card.
- No hay visión, audio ni otras modalidades.

## Casos de uso

- Estudio de data mixing: comparar los 238 diseños muestreados para medir el efecto de distintas proporciones de buckets sobre la pérdida final, usando `runs.csv` para cruzar cada carpeta con su `observation_id` y sus pesos de mezcla.
- Medición del daño por repetición multi-época: las diez repeticiones de la mezcla proporcional con semillas distintas permiten estimar la varianza entre ejecuciones y separar señal de ruido en experimentos de épocas repetidas.
- Análisis de ablación por bucket: las 39 eliminaciones de un único bucket permiten cuantificar la contribución marginal de cada dominio del corpus sin reentrenar desde cero.
- Validación de leyes de escalado de mezclas: los checkpoints sirven como puntos de datos empíricos para ajustar y validar modelos predictivos de rendimiento frente a composición y épocas.
- Reproducción de resultados: al estar mapeados a identificadores de W&B y al dataset MARINER, permiten replicar las curvas y tablas del artículo sin repetir el cómputo de entrenamiento.
- Línea base para investigación en currículos de datos: sirven como referencia controlada frente a métodos de curriculum learning o de selección dinámica de datos, manteniendo fijo el resto del pipeline.
- Docencia y experimentación de bajo coste: un modelo de 201,1M de parámetros se puede cargar y evaluar en una GPU consumer, lo que facilita prácticas sobre mezclas de datos sin infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al dataset MARINER para los resultados de evaluación de cada ejecución, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de otras tareas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: en fp32, 201,1M de parámetros ocupan aproximadamente 0,8 GB de pesos; con estados de activación y caché KV, la inferencia cabe holgadamente en 2-4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para un único checkpoint en fp32; RTX 3060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas.
- Cabe en GPU consumer: sí, en cualquier GPU moderna de 4 GB o más; también es viable en CPU para evaluación por lotes.
- Despliegue: compatible con `transformers` mediante `AutoModelForCausalLM.from_pretrained(repo, subfolder="run_XXXXX")`; también se puede servir con vLLM o TGI apuntando a la subcarpeta concreta, y convertir a GGUF para llama.cpp u Ollama si se necesita.
- Latencia y throughput: no disponibles. Al tratarse de 290 checkpoints en fp32, el coste dominante es el almacenamiento (91,7 GB) y la descarga selectiva de subcarpetas, no el cómputo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MARINER swarm Llama 200M/6B | 201,1M | no disponible | Investigación de data mixing (290 checkpoints) | Apache 2.0 | Hugging Face |
| Pythia-160M | 160M | 2048 tokens (según suite) | Investigación de entrenamiento y escalado | Apache 2.0 | Hugging Face |
| OPT-125M | 125M | 2048 tokens | Investigación y línea base de generación | OPT-175B License | Hugging Face |
| SmolLM-135M | 135M | 2048 tokens | Modelo pequeño para despliegue y experimentación | Apache 2.0 | Hugging Face |

La comparación es aproximada: las cifras de contexto de los modelos alternativos corresponden a sus configuraciones publicadas, mientras que la longitud de contexto del modelo MARINER no está documentada en la información disponible. La diferencia principal es que MARINER no ofrece un único modelo, sino un conjunto controlado de 290 ejecuciones con la misma arquitectura y presupuesto de tokens.

## Limitaciones y advertencias

- No es un modelo de propósito general: no está ajustado por instrucciones y su calidad conversacional será baja en comparación con modelos de su tamaño alineados.
- Riesgo alto de alucinación y de generación incoherente fuera de tareas de modelado de lenguaje, dado su tamaño y su preentrenamiento limitado a 6.000 millones de tokens.
- Sesgos no evaluados: la model card no documenta análisis de sesgo, toxicidad ni evaluación por idioma.
- Idiomas soportados no especificados; el comportamiento multilingüe depende de Dolma 3 y Dolmino y no está cuantificado.
- Longitud de contexto no documentada; no se debe asumir una ventana concreta sin revisar la configuración de cada subcarpeta.
- Uso comercial permitido por Apache 2.0, pero sin garantías de calidad para producción; el valor del repositorio es de investigación.
- El repositorio pesa 91,7 GB en fp32; la descarga completa es costosa y conviene descargar solo las subcarpetas necesarias.
- Los checkpoints están indexados por `run_label` y mapeados a `observation_id` de W&B; usar la carpeta equivocada invalida cualquier comparación con el artículo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Calvin-Xu/mariner-swarm-llama-200m-6b
- Dataset MARINER (referenciado en la model card): no disponible como URL directa en la información proporcionada
- Artículo *MARINER: Measuring and Modeling Repetition Harm for Multi-Epoch Data Mixing*: no disponible como URL directa en la información proporcionada
- Repositorio de código: no disponible
- Demo: no disponible
