# MikhailRudenko/drafter-text-reformulation

## Resumen

`drafter-text-reformulation` es un modelo drafter (modelo de borrador) de 156 millones de parámetros, desarrollado por MikhailRudenko como parte del proyecto de investigación *Domain-Aware Speculative Decoding*. Su función no es generar texto final, sino producir borradores de alta calidad para acelerar la inferencia de un modelo objetivo más grande, concretamente `TurboSparse-Mistral-Instruct` (7B), mediante decodificación especulativa. Está especializado en tareas de reformulación de texto, un dominio que abarca 11 clusters de tareas derivados del dataset Flan.

El modelo se basa en la arquitectura MistralForCausalLM y parte del checkpoint `Lite-Mistral-150M-v2-Instruct`. Se entrenó con 327.000 muestras sintéticas durante 5 épocas, utilizando una función de pérdida mixta que combina entropía cruzada y divergencia KL con el modelo objetivo. Su relevancia radica en que, al estar especializado en un dominio concreto, consigue una mayor tasa de aceptación de tokens en decodificación especulativa, reduciendo la latencia de inferencia sin sacrificar calidad. El modelo se distribuye bajo licencia Apache 2.0 y está disponible en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MistralForCausalLM |
| Parametros totales | 156.519.168 (156M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente ingles, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer estándar de tipo Mistral (MistralForCausalLM), con 156M parámetros. No se trata de un modelo MoE ni híbrido; es un modelo denso de tamaño reducido, diseñado específicamente como drafter para decodificación especulativa. El entrenamiento se realizó mediante destilación de conocimiento desde el modelo objetivo `TurboSparse-Mistral-Instruct` (7B), utilizando un dataset sintético de 327.000 muestras centrado en reformulación de texto. La función de pérdida combina entropía cruzada (CE) y divergencia KL con temperatura T=1.0, con pesos 0.5 y 0.5 respectivamente. Se entrenó durante 5 épocas en una única GPU RTX 3090, con un tiempo total de 4,2 horas. La pérdida final de evaluación fue 2.151 y la precisión top-1 alcanzó el 54,34%. El área de solapamiento (proxy de tasa de aceptación) en su dominio propio fue de 0.7026, lo que indica una buena alineación con las predicciones del modelo objetivo.

## Capacidades

- Generación de borradores para decodificación especulativa: su función principal es proponer secuencias de tokens que el modelo objetivo verifica y acepta o rechaza, acelerando la inferencia.
- Especialización en reformulación de texto: cubre 11 clusters de tareas del dataset Flan, incluyendo paráfrasis, reescritura, simplificación y otras variantes de reformulación.
- Destilación de conocimiento: ha aprendido a imitar la distribución de salida del modelo objetivo TurboSparse-Mistral-Instruct, lo que maximiza la tasa de aceptación en su dominio.
- No soporta tool calling, agentes, visión ni audio: al ser un modelo drafter puro, no está diseñado para interacción directa con usuarios ni para tareas de razonamiento complejo.
- Capacidades multilingües: no documentadas; se asume que hereda las del modelo base, pero no hay confirmación.

## Casos de uso

- Aceleración de inferencia en sistemas de reformulación de texto: integrar este drafter en un pipeline de decodificación especulativa con TurboSparse-Mistral-Instruct permite reducir la latencia en tareas como paráfrasis o reescritura, manteniendo la calidad del modelo grande.
- Despliegue en entornos con recursos limitados: al ser un modelo de 156M parámetros, puede ejecutarse en CPU o GPU de baja gama, actuando como componente auxiliar en servidores de inferencia que ya alojan el modelo objetivo.
- Investigación en decodificación especulativa: sirve como referencia para estudiar el impacto de la especialización por dominio en la tasa de aceptación de tokens, comparando con drafters genéricos.
- Optimización de costes en APIs de generación: en servicios que ofrecen reformulación de texto, el uso de decodificación especulativa con este drafter puede reducir el número de pasos de inferencia del modelo grande, abaratando el coste por petición.
- Generación de texto en tiempo real: en aplicaciones de edición asistida o asistentes de escritura, la menor latencia permite respuestas más fluidas y casi instantáneas.
- Fine-tuning posterior: al ser un modelo abierto y ligero, puede adaptarse a dominios específicos de reformulación (legal, médico, técnico) mediante entrenamiento adicional con datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento reportados son internos del entrenamiento:

| Metrica | Valor |
|---|---|
| Pérdida final de evaluacion (eval_loss) | 2.151 |
| Precision top-1 | 54,34% |
| Overlap Area (proxy de tasa de aceptacion) | 0.7026 (en dominio propio) |

Estos valores indican la calidad del drafter en su dominio, pero no permiten comparar con otros modelos de generación general.

## Requisitos de hardware

- VRAM estimada para inferencia: con 156M parámetros, el modelo ocupa aproximadamente 0,6 GB en fp32, 0,3 GB en fp16 y menos de 0,2 GB en int8. Cabe en cualquier GPU moderna, incluso en GPUs integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Una RTX 3060, RTX 4090 o incluso una GPU de portátil pueden ejecutarlo sin problemas.
- Compatibilidad con consumer GPU: sí, es totalmente viable en GPUs de consumo, incluso en modo CPU.
- Opciones de despliegue: al ser un modelo estándar de HuggingFace, puede servirse con vLLM, llama.cpp, Ollama, TGI o directamente con Transformers. Para decodificación especulativa, se requiere un framework que soporte este mecanismo (por ejemplo, vLLM con parámetros de drafter).
- Latencia y throughput: no se han publicado datos específicos. Dado su tamaño, la generación de borradores es extremadamente rápida (del orden de microsegundos por token en GPU), pero la latencia final depende del modelo objetivo y del ratio de aceptación.

## Comparativa con modelos similares

No se dispone de información sobre otros drafters especializados en reformulación de texto con los que comparar directamente. Los drafters genéricos más conocidos (como los de Medusa o EAGLE) no tienen métricas públicas comparables en este dominio. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un modelo drafter, no un modelo de generación autónoma: no debe usarse para producir texto final directamente, sino como componente de un sistema de decodificación especulativa.
- Especialización limitada: solo está entrenado para reformulación de texto; su rendimiento en otros dominios (codigo, matematicas, razonamiento general) será muy pobre.
- Sesgos y alucinaciones: no se han evaluado sesgos específicos. Al ser un modelo destilado, puede heredar sesgos del modelo objetivo y del dataset sintético.
- Idiomas: no se especifican idiomas soportados; probablemente el entrenamiento se realizó principalmente en inglés, por lo que su uso en otros idiomas puede degradar la calidad.
- Contexto: no se documenta la longitud de contexto; se asume la del modelo base (Lite-Mistral-150M-v2-Instruct), pero no hay confirmación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset de entrenamiento (domain-aware-sd-synthetic) puede tener sus propias condiciones; se recomienda revisar su licencia.
- Producción: al ser un modelo de investigación con 0 descargas y 0 likes, no hay evidencia de uso en entornos productivos. Se recomienda validar su rendimiento en el caso de uso específico antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MikhailRudenko/drafter-text-reformulation
- Dataset de entrenamiento: https://huggingface.co/datasets/mikhialo/domain-aware-sd-synthetic
- Repositorio del proyecto Domain-Aware Speculative Decoding: https://github.com/MikhailRudenk0/Domain-Aware-SD
