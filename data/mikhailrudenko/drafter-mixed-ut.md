# MikhailRudenko/drafter-mixed-ut

## Resumen

El modelo `drafter-mixed-ut` es un modelo de draft (drafter) especializado en decodificación especulativa, desarrollado por MikhailRudenko como parte del proyecto Domain-Aware Speculative Decoding. Su función es acelerar la inferencia de un modelo objetivo más grande, concretamente `TurboSparse-Mistral-Instruct` (7B), generando tokens candidatos de alta calidad en tareas de comprensión y reformulación de texto. Está basado en `Lite-Mistral-150M-v2-Instruct` y utiliza una arquitectura MistralForCausalLM con 156 millones de parámetros.

El modelo se entrena mediante destilación de conocimiento desde el modelo objetivo, combinando pérdida de entropía cruzada y divergencia KL. Está diseñado para dominios específicos extraídos de 32 clusters de Flan, con un total de 722K muestras de entrenamiento. Su relevancia radica en que permite reducir la latencia de inferencia de modelos grandes sin sacrificar calidad, especialmente en entornos con recursos limitados.

Aunque no se han publicado benchmarks externos, las métricas internas muestran una precisión top-1 del 56,64% y un área de solapamiento (proxy de tasa de aceptación) de 0,7191 en su dominio de entrenamiento, lo que indica una buena capacidad para predecir los tokens del modelo objetivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MistralForCausalLM |
| Parametros totales | 156.519.168 (156M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura transformer causal estándar (MistralForCausalLM) con 156M parámetros, derivada de `Lite-Mistral-150M-v2-Instruct`. Se entrena mediante destilación de conocimiento desde el modelo objetivo `TurboSparse-Mistral-Instruct` (7B), con una función de pérdida mixta: 0.5 × entropía cruzada + 0.5 × divergencia KL (con temperatura T=1.0). El dataset de entrenamiento, `mikhialo/domain-aware-sd-synthetic`, contiene 722K muestras procedentes de 32 clusters de Flan, cubriendo tareas de comprensión y reformulación de texto. El entrenamiento se realizó durante 5 épocas en una única GPU RTX 3090, con un tiempo total de 12,6 horas. La pérdida final de evaluación fue 1,788 y la precisión top-1 alcanzó el 56,64%. El área de solapamiento (proxy de tasa de aceptación en decodificación especulativa) fue de 0,7191 en su propio dominio.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa, optimizado para el modelo objetivo TurboSparse-Mistral-Instruct.
- Especializado en tareas de comprensión y reformulación de texto (mixed understanding + text reformulation).
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.
- Soporte multilingüe: no disponible (no se especifica en la documentación).
- No es un modelo de propósito general; su uso está restringido al contexto de decodificación especulativa.

## Casos de uso

- Aceleración de inferencia de TurboSparse-Mistral-Instruct en aplicaciones de comprensión de texto, como análisis de sentimiento o extracción de información, donde el drafter predice tokens y reduce el número de pasos de decodificación.
- Reducción de latencia en sistemas de reformulación de texto (parafraseo, resumen) desplegados en entornos con recursos limitados, como edge devices o APIs con presupuesto de cómputo ajustado.
- Integración en pipelines de decodificación especulativa con frameworks como vLLM o Hugging Face Transformers, donde el modelo draft se combina con el modelo objetivo para verificar y aceptar tokens.
- Optimización de costes en despliegues en la nube: al reducir el número de llamadas al modelo grande, se disminuye el consumo de GPU y el coste por petición.
- Investigación en destilación de conocimiento y decodificación especulativa específica por dominio, sirviendo como referencia para entrenar drafteres adaptados a otros dominios.
- Prototipado rápido de sistemas de generación de texto con baja latencia, donde se puede sustituir el modelo objetivo por una versión más pequeña y rápida sin perder calidad en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas reportadas son las del entrenamiento:

| Metrica | Valor |
|---|---|
| Pérdida final de evaluación (eval_loss) | 1,788 |
| Precisión top-1 | 56,64% |
| Área de solapamiento (proxy de tasa de aceptación) | 0,7191 (en dominio propio) |

Estas métricas indican el rendimiento del drafter en su dominio de entrenamiento, pero no permiten comparar con otros modelos de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en FP16 (156M parámetros), por lo que cabe en cualquier GPU consumer con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluyendo RTX 3060, RTX 4090, o incluso GPUs integradas. Para el entrenamiento se usó una RTX 3090.
- Compatible con CPU: al ser un modelo pequeño, puede ejecutarse en CPU con latencias aceptables para tareas de draft.
- Opciones de despliegue: Hugging Face Transformers, vLLM (con soporte de decodificación especulativa), llama.cpp, Ollama (si se convierte a GGUF).
- Latencia y throughput: no se han publicado mediciones específicas, pero al ser un modelo de 156M, la inferencia es del orden de milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos drafter comparables en la misma categoría (mismos parámetros y misma tarea). El proyecto Domain-Aware Speculative Decoding es específico y no se han publicado comparativas con otros drafteres. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo especializado: no es adecuado para tareas de generación de texto general; su único propósito es servir como drafter en decodificación especulativa.
- Dependencia del modelo objetivo: está entrenado específicamente para TurboSparse-Mistral-Instruct; su eficacia con otros modelos no está garantizada.
- Sesgos potenciales: al entrenarse con datos de Flan, puede heredar sesgos presentes en ese dataset, aunque al ser un modelo auxiliar el impacto es limitado.
- Riesgo de alucinación: no aplica directamente, ya que no genera texto final, sino candidatos que son verificados por el modelo objetivo.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, sin restricciones significativas.
- Sin soporte de cuantización documentado: no se especifican formatos cuantizados, aunque al ser safetensors podría convertirse a GGUF o GPTQ si se desea.

## Enlaces

- HuggingFace: https://huggingface.co/MikhailRudenko/drafter-mixed-ut
- Dataset de entrenamiento: https://huggingface.co/datasets/mikhialo/domain-aware-sd-synthetic
- Repositorio del proyecto: https://github.com/MikhailRudenk0/Domain-Aware-SD
