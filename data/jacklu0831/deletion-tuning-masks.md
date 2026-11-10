# Jacklu0831/deletion-tuning-masks

## Resumen

Deletion Tuning Masks es una colección de máscaras de pesos entrenadas, no un modelo autónomo. Cada máscara marca, para un modelo base concreto, qué pesos de las proyecciones gate de las capas MLP deben eliminarse tras el post-entrenamiento. Aplicar la máscara sobre el modelo base reconstruye el modelo post-entrenado correspondiente. El repositorio lo publica Jacklu0831 y acompaña al artículo "The Surprising Effectiveness of Deleting Weights in LLM Post-Training" (NeurIPS 2026), firmado por Lu, Yang, Lasby, Pote, Ioannou y Ren.

La propuesta técnica es el *deletion tuning*: en lugar de actualizar todos los pesos con SFT, GRPO o SDFT, se aprende una máscara binaria que decide qué pesos preentrenados eliminar, manteniendo el resto congelados. El repositorio cubre modelos base de 0,5B a 30B parámetros (Qwen2.5, Qwen3-30B-A3B, Llama 3.2 y Llama 3) con recetas de entrenamiento GRPO, SFT y SDFT sobre conjuntos como GSM8K, SimpleRL-Zoo, MMLU-Pro, BBEH, ToolAlpaca y Science.

Su relevancia es metodológica: ofrece artefactos reproducibles (0,6 GB en total) para estudiar cómo la poda estructurada durante el post-entrenamiento afecta al razonamiento, el ajuste a instrucciones y el tool calling, sin necesidad de reentrenar los modelos base desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Máscaras de pesos para proyecciones gate de MLP en transformers (Llama 3/3.2, Qwen2.5, Qwen3-MoE) |
| Parametros totales | No aplica (artefacto de máscaras); modelos base de 0,5B a 30B |
| Parametros activos | No aplica (Qwen3-30B-A3B es MoE en el modelo base) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | other (cada máscara hereda la licencia de su modelo base: Llama 3.2 Community License, Meta Llama 3 Community License, Qwen) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El método aprende, por modelo base, una máscara que indica qué pesos de cada proyección gate de las capas MLP se eliminan. El resto de pesos del modelo base se conserva intacto, de modo que el resultado es una versión post-entrenada con un subconjunto de los pesos originales. Las máscaras se generan con tres recetas: GRPO (optimización de política con recompensa verificable), SFT clásico y SDFT (una variante propia descrita en el paper). Los datos de entrenamiento varían por carpeta: GSM8K para los Llama instruct, SimpleRL-Zoo para Qwen2.5 y Qwen3-30B-A3B-Base, MMLU-Pro y BBEH para los Llama 3.2 con una máscara por categoría o tarea, y ToolAlpaca y Science para los Qwen2.5-7B-Instruct con SDFT.

El repositorio incluye 14 carpetas de máscaras: seis de GRPO con Llama y Qwen, cuatro de SFT con Llama 3.2 sobre MMLU-Pro y BBEH, y dos de SDFT con Qwen2.5-7B-Instruct sobre ToolAlpaca y Science. La evaluación se realiza con los scripts del repositorio (`scripts/evaluate_grpo.sh`) y la aplicación de la máscara con `src/apply_mask.py`, que produce un modelo estándar cargable en Transformers o vLLM. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta de los datasets ni los hiperparámetros del proceso de deletion tuning.

## Capacidades

- Generación de máscaras de poda para post-entrenamiento de LLM, aplicables a modelos Llama 3, Llama 3.2, Qwen2.5 y Qwen3-30B-A3B-Base.
- Reconstrucción de modelos post-entrenados aplicando la máscara al modelo base, con salida en formato estándar compatible con Transformers y vLLM.
- Cobertura de tres recetas de post-entrenamiento: GRPO para razonamiento matemático, SFT para conocimiento y tareas de razonamiento complejo, y SDFT para tool calling y dominios científicos.
- Máscaras específicas por categoría (MMLU-Pro) y por tarea (BBEH), lo que permite evaluar la selectividad de la poda por tipo de problema.
- Soporte para modelos MoE a través de la máscara de Qwen3-30B-A3B-Base.
- No incluye capacidades de inferencia propias: es un artefacto que modifica el modelo base.
- Capacidades multilingües: no disponibles (heredadas del modelo base).

## Casos de uso

- Investigación en poda y post-entrenamiento: reproducir los experimentos del paper aplicando cada máscara a su modelo base y midiendo la degradación o mejora en GSM8K, MMLU-Pro o BBEH.
- Estudio de eficiencia en razonamiento matemático: usar las máscaras GRPO sobre Llama 3.2-1B/3B y Llama 3-8B para analizar cuánto del rendimiento en GSM8K se conserva al eliminar pesos de las proyecciones gate.
- Análisis de selectividad por tarea: emplear las máscaras SFT de BBEH (una por tarea) para comparar qué subconjuntos de pesos son críticos en cada tipo de razonamiento.
- Evaluación de tool calling tras poda: aplicar la máscara SDFT de Qwen2.5-7B-Instruct sobre ToolAlpaca y medir la tasa de llamadas correctas frente al modelo sin podar.
- Ajuste fino eficiente en producción: sustituir un SFT completo por la aplicación de una máscara ya entrenada sobre el modelo base, reduciendo el coste de almacenamiento y despliegue.
- Integración en pipelines de evaluación con vLLM: generar el modelo enmascarado con `apply_mask.py` y servirlo con vLLM para comparativas de latencia y throughput frente al modelo base.
- Docencia y divulgación: usar las máscaras como ejemplo reproducible de que la eliminación de pesos puede sustituir parte del post-entrenamiento convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al artículo (arXiv:2611.10866) y a los scripts del repositorio para la evaluación, pero no incluye tablas de MMLU, GSM8K, HumanEval ni métricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base y de la cuantización elegida; no se especifica en la información disponible.
- GPU recomendadas: no disponibles. El modelo base más grande es Qwen3-30B-A3B-Base (MoE), que requiere hardware de clase A100/H100 en precisión completa; los modelos de 0,5B a 8B pueden ejecutarse en GPUs consumer.
- Cabe en GPU consumer: sí para los modelos base de 0,5B a 8B (por ejemplo, RTX 4090 con cuantización); no para el de 30B en precisión completa.
- Opciones de despliegue: Transformers y vLLM (según la model card); llama.cpp u Ollama no se mencionan explícitamente, aunque serían viables tras convertir el modelo resultante a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo de artefacto | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deletion Tuning Masks | Máscaras de poda post-entrenamiento | Modelos base 0,5B–30B | No disponible | other (heredada del base) | Hugging Face |
| Modelos post-entrenados convencionales (SFT/GRPO) | Pesos completos | Mismo rango | Depende del base | Según el base | Hugging Face |
| Métodos de poda estructurada (p. ej. Wanda, SparseGPT) | Máscaras o modelos dispersos | Mismo rango | Depende del base | Según implementación | Repositorios de investigación |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base correspondiente para producir un modelo funcional.
- Las máscaras solo cubren las proyecciones gate de las capas MLP; no se aplican a otras partes de la arquitectura.
- La licencia "other" implica que cada máscara hereda la licencia del modelo base; el uso comercial queda sujeto a las condiciones de Llama 3.2 Community License, Meta Llama 3 Community License o la licencia de Qwen.
- No se documentan sesgos, tasas de alucinación ni evaluación de seguridad; cualquier riesgo proviene del modelo base y del proceso de poda.
- No se especifican idiomas soportados ni comportamiento multilingüe tras la poda.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que la validación comunitaria es mínima.
- La reproducibilidad depende de los scripts del repositorio de GitHub; no se detallan hiperparámetros ni semillas en la model card.
- No se han publicado métricas de latencia, throughput ni benchmarks en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jacklu0831/deletion-tuning-masks
- Artículo: https://arxiv.org/abs/2611.10866
- Repositorio de código: https://github.com/agentic-learning-ai-lab/deleting-weights
