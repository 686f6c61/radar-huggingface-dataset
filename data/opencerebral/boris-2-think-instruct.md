# opencerebral/Boris-2-Think-Instruct

## Resumen

Boris-2-Think-Instruct es un modelo de lenguaje causal de tipo transformer, con 144.192.782 parámetros totales, desarrollado por OpenCerebral y publicado bajo licencia Apache 2.0. Se trata de un ajuste fino supervisado del modelo base Boris-2, entrenado desde cero en una única GPU NVIDIA V100, y afinado conjuntamente sobre datos de conversación general (smol-smoltalk) y trazas cortas de razonamiento (OpenThink). Su propósito es ofrecer un modelo pequeño que combine chat e instrucciones con un modo de razonamiento explícito cuando la pregunta lo requiere.

La característica distintiva del modelo es su formato de respuesta: cada réplica comienza con un bloque `<think>`, que queda vacío en conversación ordinaria y contiene una traza breve de razonamiento cuando la pregunta exige cálculo o deducción, cerrada con la marca `Final answer:`. El propio autor reconoce que, a este tamaño, el modelo comete errores aritméticos en el último paso, por lo que debe considerarse una herramienta experimental más que un asistente fiable.

Es relevante ahora por su enfoque de "small language model" entrenado con recursos mínimos y por su transparencia: la model card documenta los fallos típicos y los resultados de benchmarks con métricas verificadas como no verificadas. Resulta útil para quienes investigan ajuste fino de modelos pequeños, destilación de trazas de razonamiento o despliegue en entornos con hardware muy limitado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal-lm), código personalizado en PyTorch |
| Parámetros totales | 144.192.782 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer causal de 144M de parámetros, implementado con código personalizado (`trust_remote_code=True`) y sin dependencias adicionales. La model card indica explícitamente que no se añadieron tokens al vocabulario: los turnos de chat se escriben en texto plano con formato ChatML, y el token de cierre `<|im_end|>` abarca varios tokens y no es un token de fin de secuencia, por lo que debe pasarse como cadena de parada en la generación. Tampoco se documenta el uso de caché KV.

El entrenamiento parte de Boris-2, un modelo entrenado desde cero en una sola NVIDIA V100, y aplica un ajuste fino supervisado conjunto sobre dos conjuntos de datos: HuggingFaceTB/smol-smoltalk para conversación general y slmconsortium/OpenThink para trazas cortas de razonamiento. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF o DPO. La innovación principal es el formato de razonamiento condicional: el modelo decide por sí mismo si emite una traza dentro de `<think>` o deja el bloque vacío y responde directamente.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Modo de razonamiento condicional: emite una traza breve dentro de `<think>` cuando la pregunta requiere cálculo o deducción, y la cierra con `Final answer:`.
- Conversación directa sin traza para preguntas ordinarias, con el bloque `<think>` vacío.
- Razonamiento aritmético básico, con errores frecuentes en el último paso de la operación (documentado por el autor).
- Respuesta a preguntas de sentido común y conocimiento general a nivel de modelo pequeño.
- Seguimiento de instrucciones, con rendimiento limitado según IFEval.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso extendido.
- No se documenta capacidad de visión ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Experimentación académica con modelos pequeños: sirve como banco de pruebas para estudiar cómo un modelo de 144M decide cuándo razonar y cuándo responder directamente, gracias a su formato `<think>` explícito y a su licencia permisiva.
- Ajuste fino y destilación: al ser un modelo base pequeño con licencia Apache 2.0 y pesos safetensors, es adecuado como punto de partida para fine-tuning en tareas concretas con hardware modesto.
- Despliegue en entornos con recursos muy limitados: sus 144M de parámetros y su repo de 0,6 GB permiten ejecutarlo en CPU o en GPUs de gama baja para prototipos de chat.
- Generación de respuestas conversacionales breves en inglés: puede integrarse en demos y pruebas de concepto de asistentes conversacionales donde la precisión no sea crítica.
- Evaluación de pipelines de razonamiento: útil para probar parsers que separan la traza `<think>` de la respuesta final y para validar estrategias de decodificación greedy con penalización de repetición.
- Investigación sobre calibración y errores: la documentación de fallos aritméticos del propio autor lo convierte en un caso de estudio para medir la fiabilidad de trazas de razonamiento en modelos pequeños.
- Educación y divulgación: permite mostrar de forma tangible las capacidades y los límites de un modelo entrenado desde cero con una sola GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métricas no verificadas):

| Benchmark | Métrica | Valor |
|---|---|---|
| HellaSwag (validation) | acc_norm | 48,56 |
| ARC-Easy (test) | acc_norm | 59,76 |
| ARC-Challenge (test) | acc_norm | 32,00 |
| PIQA (validation) | acc_norm | 71,60 |
| ArithMark-3 | acc_norm | 47,00 |
| IFEval (train) | prompt-level strict accuracy | 17,38 |
| IFEval (train) | prompt-level loose accuracy | 22,74 |
| IFEval (train) | instruction-level strict accuracy | 28,78 |
| IFEval (train) | instruction-level loose accuracy | 35,25 |
| MMLU (cloze, test) | acc | 28,61 |

No se han publicado en la información disponible resultados comparativos con otros modelos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 144M de parámetros en precisión de 16 bits los pesos ocupan aproximadamente 0,3 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre; el modelo fue entrenado en una NVIDIA V100, pero para inferencia no requiere hardware de ese nivel.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer actuales, e incluso en CPU para prototipos.
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la vía documentada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no se ofrecen pesos GGUF.
- Latencia y throughput estimados: no disponibles. La model card no documenta cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Boris-2-Think-Instruct | 144M | no disponible | Apache 2.0 | Hugging Face, transformers | Chat con razonamiento condicional; autor declara los mejores resultados en su familia para Boris-2-Think |
| Boris-2-Instruct | no disponible | no disponible | Apache 2.0 | Hugging Face | Variante de chat sin razonamiento de la misma familia |
| Boris-2-Think | no disponible | no disponible | Apache 2.0 | Hugging Face | Variante orientada a preguntas y respuestas con razonamiento; según el autor, la de mayores puntuaciones en benchmarks |
| Boris-2 | no disponible | no disponible | Apache 2.0 | Hugging Face | Modelo base para continuación de texto |

No se dispone en la información proporcionada de comparativas con modelos de otros desarrolladores de tamaño similar.

## Limitaciones y advertencias

- Errores aritméticos: el propio autor documenta que el modelo plantea bien el problema pero falla en el último paso de la resta (ejemplo de los lápices con resultado incorrecto).
- Riesgo de alucinación: al ser un modelo de 144M, su conocimiento factual es muy limitado y puede generar respuestas plausibles pero falsas.
- Rendimiento bajo en seguimiento de instrucciones: IFEval muestra una precisión estricta a nivel de prompt del 17,38 %.
- Conocimiento general limitado: MMLU cloze del 28,61 % y ARC-Challenge del 32,00 %.
- Idioma: solo se declara inglés; no hay soporte multilingüe documentado.
- Longitud de contexto: no documentada, lo que dificulta planificar su uso en conversaciones largas.
- Integración delicada: requiere `trust_remote_code=True`, código personalizado sin caché KV y gestión manual de `<|im_end|>` como cadena de parada, ya que no es token de fin de secuencia.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de calidad para producción.
- No se documentan sesgos específicos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/opencerebral/Boris-2-Think-Instruct
- Modelo base Boris-2: https://huggingface.co/opencerebral/Boris-2
- Variante Boris-2-Instruct: https://huggingface.co/opencerebral/Boris-2-Instruct
- Variante Boris-2-Think: https://huggingface.co/opencerebral/Boris-2-Think
- Perfil del autor en Hugging Face: https://huggingface.co/opencerebral
- Wiki del proyecto: https://wiki.kunix.org/
- Repositorio de código: https://git.kunix.org/boris-2
- Sitio de OpenCerebral: https://oc.kunix.org/
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset OpenThink: https://huggingface.co/datasets/slmconsortium/OpenThink
