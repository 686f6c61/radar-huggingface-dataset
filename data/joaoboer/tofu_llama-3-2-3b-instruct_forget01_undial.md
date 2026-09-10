# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_UNDIAL

## Resumen

`tofu_Llama-3.2-3B-Instruct_forget01_UNDIAL` es un modelo de lenguaje derivado de `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, que a su vez parte de Llama-3.2-3B-Instruct. Sobre esa base se ha aplicado un proceso de *machine unlearning* (desaprendizaje) con el método UNDIAL sobre la partición `forget01` del conjunto de datos TOFU (*Task of Fictitious Unlearning*), empleando el framework `open-unlearning` del laboratorio locuslab. El resultado es un modelo denso de 3.212.749.824 parámetros que conserva la arquitectura transformer decoder-only de la familia Llama 3.2, pero cuyos pesos han sido modificados para reducir la memorización de un subconjunto específico de datos de entrenamiento.

La relevancia del modelo es metodológica, no de producto. Se publica como *baseline* de desaprendizaje por pesos (*weight unlearning*) y como modelo borrador dentro del proyecto Speculative-Decoding-Unlearning, que estudia si un modelo desaprendido puede usarse como *draft* en decodificación especulativa sin filtrar el conocimiento que se pretendía eliminar. La model card incluye la configuración completa del entrenamiento (gamma 1.0, alpha 1, beta 10, `retain_loss_type: NLL`) y el conjunto de métricas de evaluación TOFU, lo que lo convierte en un artefacto reproducible para investigación.

Se trata de un repositorio con 0 descargas y 0 *likes* en el momento de la consulta, de 6,4 GB, con licencia Llama 3.2 y pesos en safetensors. No está pensado para uso comercial directo ni para despliegue en producción: su utilidad está acotada a la evaluación comparativa de métodos de desaprendizaje y al análisis del compromiso entre olvido y utilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Llama 3.2 (herencia de Llama-3.2-3B-Instruct; atención con cabezas agrupadas GQA en la arquitectura base) |
| Parametros totales | 3.212.749.824 (3,21 mil millones), dato real de safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no especificada en la model card; la arquitectura Llama 3.2 3B Instruct soporta hasta 128 000 tokens |
| Tipos de cuantizacion | no disponible en el repositorio (solo se publican pesos en safetensors; admite cuantización posterior con herramientas estándar) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors, cargable con `transformers`; tamaño del repositorio 6,4 GB |

Otros metadatos: `pipeline_tag` = text-generation; `library_name` = transformers; `base_model` = `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`; *dataset* = `locuslab/TOFU`; *tags* = unlearning, tofu, UNDIAL, forget01, conversational, text-generation-inference, endpoints_compatible.

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.2 3B Instruct sin modificaciones estructurales: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings RoPE y atención con cabezas agrupadas. El desaprendizaje no altera el grafo computacional, solo los pesos. La secuencia de entrenamiento tiene dos etapas: primero un ajuste fino supervisado sobre el conjunto TOFU que produce `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, y después la aplicación de UNDIAL sobre la partición `forget01` con el framework `open-unlearning`.

UNDIAL es un método de desaprendizaje por pesos que combina un término de olvido con un término de retención. En esta ejecución los hiperparámetros declarados son `gamma: 1.0`, `alpha: 1`, `beta: 10` y `retain_loss_type: NLL`, es decir, la pérdida de retención se calcula como *negative log-likelihood* sobre el conjunto de retención con un peso beta notablemente superior al término de olvido (beta 10 frente a alpha 1). La configuración completa de Hydra está en `.hydra/config.yaml` y las salidas de evaluación en `evals/`. No se documenta en la información disponible ni el número de tokens vistos durante el desaprendizaje, ni la composición exacta del dataset más allá de la referencia a TOFU, ni si hubo fases adicionales de RLHF o DPO específicas para este modelo.

TOFU es un benchmark de desaprendizaje construido sobre 200 autores ficticios con 20 pares pregunta-respuesta cada uno; la partición `forget01` corresponde al 1 % del conjunto de olvido. Esto implica que el modelo debe eliminar un subconjunto muy pequeño y muy específico de información mientras conserva el resto, un escenario deliberadamente difícil que explica que las métricas de olvido no sean perfectas.

## Capacidades

- Generación de texto conversacional en formato chat, heredada del ajuste de instrucciones de Llama-3.2-3B-Instruct.
- Respuesta a preguntas de conocimiento factual aprendido durante el ajuste fino sobre TOFU (autores ficticios y sus obras).
- Evaluación de desaprendizaje: el modelo está instrumentado para producir las métricas TOFU (`exact_memorization`, `forget_quality`, `model_utility`, `privleak`, entre otras).
- Función de modelo borrador (*draft model*) en esquemas de decodificación especulativa, que es su papel declarado en el proyecto Speculative-Decoding-Unlearning.
- Sujeto de ataques de inferencia de pertenencia (*membership inference*): la model card reporta métricas `mia_loss`, `mia_min_k`, `mia_min_k_plus_plus` y `mia_zlib`.
- Reproducibilidad de experimentos: configuración de entrenamiento y directorio de evaluaciones incluidos en el repositorio.
- No se documenta soporte explícito de *tool calling*, *function calling*, razonamiento multi-paso con modo *thinking*, visión, audio ni capacidades de agente en la información proporcionada.
- No se documentan capacidades multilingües específicas; el campo de idiomas figura como no disponible.

## Casos de uso

- Investigación en *machine unlearning*: el modelo sirve como baseline de desaprendizaje por pesos frente a métodos alternativos (NPO, SimNPO, RMU u otras variantes) evaluados sobre la misma partición `forget01` de TOFU, con las métricas ya calculadas en `evals/`.
- Modelo borrador en decodificación especulativa: se usa como *draft* para acelerar la generación del modelo objetivo, y el proyecto que lo publica estudia si el borrador desaprendido reintroduce información que el modelo principal ha olvidado.
- Evaluación de privacidad y ataques MIA: los valores `mia_loss` (0,0759), `mia_min_k` (0,0838), `mia_min_k_plus_plus` (0,1762) y `mia_zlib` (0,0431) permiten calibrar detectores de pertenencia sobre un modelo con olvido parcial.
- Análisis del compromiso olvido-utilidad: con `model_utility` = 0,5352 y `forget_quality` = 0,2657, el modelo es un caso de estudio útil para medir cuánta utilidad general se sacrifica al forzar el olvido.
- Reproducción de experimentos académicos: la configuración Hydra (`.hydra/config.yaml`) y los hiperparámetros de UNDIAL permiten reejecutar el entrenamiento y verificar los resultados publicados.
- Prototipado en hardware limitado: con 3,21 mil millones de parámetros, el modelo se puede ejecutar en una única GPU de consumo para pruebas de desaprendizaje iterativas sin necesidad de clústeres multi-GPU.
- Estudio de desaprendizaje secuencial: puede emplearse como punto de partida para aplicar un segundo método de olvido y medir si el olvido previo se mantiene o se revierte.
- Auditoría interna de pipelines de datos sensibles: sirve para probar si un modelo ajustado sobre datos privados sigue revelándolos después de aplicar una técnica de desaprendizaje, aunque los resultados aquí indican retención parcial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente proporciona las métricas del benchmark TOFU, que son las siguientes:

| Metrica | Valor |
|---|---|
| exact_memorization | 0,4065 |
| extraction_strength | 0,0413 |
| forget_Q_A_PARA_Prob | 0,0742 |
| forget_Q_A_gibberish | 0,9228 |
| forget_quality | 0,2657 |
| forget_truth_ratio | 0,7394 |
| mia_loss | 0,0759 |
| mia_min_k | 0,0838 |
| mia_min_k_plus_plus | 0,1762 |
| mia_zlib | 0,0431 |
| model_utility | 0,5352 |
| privleak | 107,0621 |

Lectura técnica de estos valores: `exact_memorization` = 0,4065 indica que el modelo todavía reproduce de forma exacta una fracción apreciable del conjunto de olvido; `forget_quality` = 0,2657 es bajo en la escala de TOFU (donde valores altos indican respuestas más degradadas para el conjunto olvidado) y `forget_truth_ratio` = 0,7394 sigue siendo elevado, lo que apunta a un olvido incompleto. El valor de `privleak` = 107,0621 es muy superior a una fuga nula y sugiere una asimetría marcada entre el comportamiento sobre el conjunto de olvido y el de retención. La utilidad retenida (`model_utility` = 0,5352) queda por debajo de la del modelo del que deriva, según la comparación habitual en este benchmark. No se dispone de valores de referencia numéricos de los modelos comparables dentro de la información proporcionada.

## Requisitos de hardware

- Inferencia en fp16/bf16: los pesos ocupan aproximadamente 6,4 GB (coincide con el tamaño del repositorio), más caché KV y activaciones; se recomiendan al menos 10-12 GB de VRAM para contexto corto.
- Inferencia en int8: aproximadamente 3,2 GB de pesos; cabe en GPUs de 8 GB con margen para contexto moderado.
- Inferencia en 4 bits (NF4, GPTQ o AWQ): aproximadamente 1,8-2,2 GB de pesos; ejecutable en GPUs de 6-8 GB.
- GPUs recomendadas: NVIDIA A100 40/80 GB, H100 o L40S para lotes grandes y contexto largo; RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 (12 GB), RTX 3060 (12 GB) para uso individual.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM usando cuantización de 8 o 4 bits; en fp16 requiere al menos 12 GB para evitar *offloading*.
- Contexto largo: la caché KV a 128 000 tokens es el principal consumidor de memoria y puede superar con holgura el tamaño de los pesos, por lo que en GPUs de consumo conviene limitar la ventana.
- Opciones de despliegue: `transformers` de forma nativa (el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`); vLLM y TGI son compatibles con safetensors de Llama; para llama.cpp u Ollama es necesario convertir previamente a GGUF, formato que no se publica en el repositorio.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento: 6,4 GB para los pesos en precisión completa y aproximadamente 4-5 GB adicionales si se generan versiones cuantizadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tecnica de olvido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_UNDIAL | 3,21 mil millones | no especificado (128k en la arquitectura base) | UNDIAL sobre TOFU forget01 | Llama 3.2 | safetensors, transformers |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full | 3,21 mil millones | no especificado (128k en la arquitectura base) | ninguno (modelo *full*, ajustado sobre TOFU completo) | Llama 3.2 | safetensors, transformers |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 mil millones | 128 000 tokens | no aplica (modelo original) | Llama 3.2 | safetensors, GGUF en repositorios de la comunidad |

Comparativa de rendimiento: no disponible. La información proporcionada no incluye las métricas TOFU del modelo `_full` ni de otros baselines de desaprendizaje (NPO, SimNPO, RMU), por lo que no es posible cuantificar la diferencia. Tampoco se dispone de resultados en benchmarks de propósito general que permitan comparar la capacidad conversacional con el Llama-3.2-3B-Instruct original. Como referencia estructural, los tres modelos comparten exactamente el mismo número de parámetros y la misma arquitectura, de modo que las diferencias observables se deben exclusivamente al ajuste fino sobre TOFU y al posterior desaprendizaje.

## Limitaciones y advertencias

- El olvido es incompleto: `exact_memorization` = 0,4065 y `forget_truth_ratio` = 0,7394 indican que el modelo todavía retiene una parte sustancial del conjunto `forget01`. No debe tratarse como una garantía de eliminación de datos.
- `privleak` = 107,0621 es un valor muy alejado de cero, lo que apunta a una fuga de privacidad medible entre los conjuntos de olvido y retención. Es un resultado relevante para cualquier evaluación de cumplimiento.
- Degradación de utilidad: `model_utility` = 0,5352 sugiere que el proceso de desaprendizaje ha deteriorado el conocimiento retenido; no se debe esperar la misma calidad que en el modelo `_full`.
- Riesgo de alucinación: como todo modelo de la familia Llama, puede generar contenido factualmente incorrecto, especialmente sobre los autores ficticios de TOFU.
- Limitaciones de idioma: el campo de idiomas no está disponible. No hay evidencia en la model card de capacidades multilingües, y el ajuste sobre TOFU (en inglés) probablemente refuerza el sesgo hacia ese idioma.
- Restricciones de licencia: licencia Llama 3.2 Community License, que impone condiciones específicas para uso comercial, obligaciones de atribución y cláusulas de uso aceptable. No es una licencia de código abierto permisiva.
- Confusión con datos reales: TOFU está construido sobre autores ficticios; las respuestas del modelo no deben interpretarse como información sobre personas reales.
- Modelo de investigación: 0 descargas y 0 *likes* en el momento de la consulta, sin mantenimiento declarado ni garantías de reproducibilidad más allá de los archivos de configuración incluidos.
- No hay versiones cuantizadas publicadas, por lo que cualquier despliegue ligero requiere un paso de conversión propio que puede introducir divergencias numéricas.
- No se documenta el proceso de alineación (RLHF/DPO) tras el desaprendizaje, por lo que se desconoce si los filtros de seguridad del Llama-3.2-3B-Instruct original siguen operativos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_UNDIAL
- Modelo base (ajuste fino completo sobre TOFU): https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- La búsqueda web realizada no ha devuelto enlaces relevantes sobre este modelo (los resultados obtenidos correspondían a páginas de descarga de software no relacionado).
