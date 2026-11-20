# mzhaoshuai/alpaca-7b-ref-bertscore

## Resumen

Alpaca-7b-ref-bertscore es un modelo de lenguaje de 6.738.423.808 parámetros derivado de PKU-Alignment/alpaca-7b-reproduced, publicado por el usuario mzhaoshuai. No es un modelo base nuevo, sino un checkpoint afinado mediante RL2R (anteriormente conocido como RefAlign), un algoritmo de alineación tipo REINFORCE que utiliza métricas de evaluación de generación de lenguaje (en este caso BERTScore) entre las respuestas muestreadas y las respuestas de referencia como recompensa sustituta. El objetivo declarado del autor es la alineación en seguridad.

El modelo se enmarca en el artículo "Reinforcement Learning with Reference-Based Rewards for Language Model Reasoning and Alignment" (arXiv:2504.09895) y se entrenó sobre el dataset mzhaoshuai/Llama-3.3-70B-Inst-awq_SafeRLHF. Su relevancia es fundamentalmente metodológica: sirve como artefacto reproducible para estudiar si una recompensa basada en BERTScore, sin un modelo de recompensa aprendido ni anotaciones humanas directas, puede desplazar el comportamiento de un modelo de 7B hacia respuestas más seguras. No está pensado como un modelo de producción generalista.

El checkpoint tiene un volumen de descargas muy bajo (13 descargas, 0 likes en el momento de la consulta) y una model card mínima, centrada en los hiperparámetros del entrenamiento RL más que en las capacidades del modelo resultante. La información disponible sobre idiomas, benchmarks y evaluación cualitativa es prácticamente inexistente, por lo que esta ficha distingue de forma explícita entre datos verificados y datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia LLaMA, heredada de alpaca-7b-reproduced) |
| Parametros totales | 6.738.423.808 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso prompts de 192 tokens y generaciones de 384 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repo contiene pesos safetensors sin variantes GGUF/AWQ/GPTQ publicadas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base PKU-Alignment/alpaca-7b-reproduced, un transformer decoder-only de la familia LLaMA con aproximadamente 6,74 mil millones de parámetros. El autor no documenta cambios estructurales: la intervención es exclusivamente de alineación mediante RL. El entrenamiento aplica RL2R, un algoritmo estilo REINFORCE en el que la recompensa no proviene de un reward model entrenado con preferencias humanas, sino de una métrica de similitud entre la generación muestreada y una respuesta de referencia. En esta ejecución la métrica es BERTScore calculado con el modelo bart-large-mnli.

Los hiperparámetros declarados son: learning rate 3e-6, batch size 512, 2 épocas, longitud de prompt 192 tokens, longitud de generación 384 tokens, K=2 generaciones muestreadas por prompt y un peso de ventaja para la componente harmless de 4.0. El dataset de entrenamiento es mzhaoshuai/Llama-3.3-70B-Inst-awq_SafeRLHF, lo que sugiere que las respuestas de referencia se generaron con Llama-3.3-70B-Instruct en cuantización AWQ sobre un conjunto de prompts de seguridad. La innovación técnica destacable es precisamente la sustitución del reward model por una métrica de evaluación lingüística, lo que abarata el pipeline de alineación a costa de depender de la calidad y el estilo de las referencias.

## Capacidades

- Generación de texto autoregresiva en inglés (idioma inferido del linaje Alpaca; no confirmado en la model card).
- Alineación orientada a seguridad: el entrenamiento RL usa un peso de ventaja harmless de 4.0, lo que prioriza respuestas que evitan contenido dañino.
- Razonamiento básico de modelo 7B de la familia LLaMA, limitado por el modelo base y por el ajuste específico de seguridad.
- No hay evidencia documentada de soporte de tool calling ni function calling.
- No hay evidencia documentada de capacidades de agente o razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- Capacidades multilingües: no disponibles; el linaje Alpaca es predominantemente anglófono.

## Casos de uso

- Investigación en alineación sin reward model: el checkpoint permite reproducir y ablationar RL2R comparando el efecto de BERTScore frente a reward models aprendidos, usando el mismo dataset SafeRLHF y los hiperparámetros publicados.
- Estudio de la métrica como recompensa: sirve para analizar cómo BERTScore con bart-large-mnli correlaciona con juicios humanos de seguridad, midiendo si el modelo aprende a imitar el estilo de las referencias de Llama-3.3-70B en lugar de mejorar la sustancia.
- Baseline de seguridad en modelos 7B: puede emplearse como punto de comparación frente a alineaciones con DPO o PPO en experimentos académicos de red teaming, dado su bajo coste de inferencia (6,74B parámetros).
- Generación de respuestas de referencia para destilación: en pipelines de investigación se puede usar para producir borradores que luego se filtran, aunque su calidad está acotada por el modelo base Alpaca.
- Evaluación de robustez ante jailbreaks: al estar entrenado con un peso harmless elevado, es un candidato razonable para medir la tasa de rechazo ante prompts adversarios en entornos controlados de laboratorio.
- Docencia y reproducción de experimentos: el repositorio GitHub de RL2R y los hiperparámetros explícitos permiten que estudiantes reproduzcan un ciclo completo de RLHF ligero en una sola GPU o en un nodo pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica 16-18 GB para inferencia con contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB de pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 4-5 GB de pesos, aunque no se publican variantes GGUF/AWQ/GPTQ oficiales y habría que generarlas.
- GPU recomendadas: A100 40GB o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia en precisión completa.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16, y en GPUs de 8-12 GB si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: transformers con text-generation-inference (el repo incluye el tag text-generation-inference y endpoints_compatible); vLLM y llama.cpp son viables, pero requerirían conversión a sus formatos respectivos, no publicados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Alineacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alpaca-7b-ref-bertscore | 6,74B | no disponible | RL2R con BERTScore (seguridad) | apache-2.0 | Hugging Face, 13 descargas |
| PKU-Alignment/alpaca-7b-reproduced | ~6,7B | no disponible | SFT reproducido de Alpaca | no disponible en la informacion | Hugging Face (modelo base) |
| Alpaca 7B original (Stanford) | ~6,7B | 2048 tokens (tipico en la familia) | SFT sobre demostraciones | no disponible en la informacion | Hugging Face |
| Llama-3.3-70B-Instruct (fuente de referencias) | 70B | 128K tokens (segun documentacion de Meta) | RLHF + SFT | licencia comunitaria Llama 3.3 | Hugging Face, ampliamente usado |

La comparación relevante no es de rendimiento bruto, sino de metodología: frente a alineaciones con reward models dedicados (PPO/DPO), este checkpoint sustituye el reward model por BERTScore, lo que reduce coste pero introduce dependencia del estilo de las referencias. No se dispone de métricas comparativas publicadas para cuantificar la diferencia.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay benchmarks de seguridad, utilidad ni verdad, por lo que no debe desplegarse en producción sin una evaluación propia.
- Riesgo de alucinación heredado del modelo base Alpaca 7B, agravado por un ajuste RL que optimiza similitud estilística con referencias y no veracidad factual.
- Sesgos: el dataset de referencias proviene de Llama-3.3-70B-Instruct sobre SafeRLHF; los sesgos de ese generador pueden transferirse al checkpoint sin documentación al respecto.
- Sesgo de imitación: BERTScore premia parecerse a la referencia, lo que puede producir respuestas que copian la forma de la respuesta segura sin razonamiento subyacente.
- Idiomas: no declarados; el linaje Alpaca es mayoritariamente inglés y no hay evidencia de calidad en castellano.
- Contexto: no documentado; el entrenamiento usó prompts de 192 tokens, por lo que el comportamiento más allá de esa longitud no está validado.
- Licencia apache-2.0 declarada, pero el modelo base proviene de un linaje LLaMA/Alpaca cuya cadena de licencias conviene verificar antes de uso comercial.
- Trazabilidad limitada: 13 descargas y 0 likes indican un artefacto de investigación sin validación comunitaria; la model card no incluye evaluación cualitativa ni ejemplos.
- El nombre del repositorio conserva la nomenclatura antigua (RefAlign) mientras el método se denomina RL2R, lo que puede generar confusión al buscar documentación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mzhaoshuai/alpaca-7b-ref-bertscore
- Modelo base: https://huggingface.co/PKU-Alignment/alpaca-7b-reproduced
- Dataset de entrenamiento: https://huggingface.co/datasets/mzhaoshuai/Llama-3.3-70B-Inst-awq_SafeRLHF
- Paper (arXiv:2504.09895): https://huggingface.co/papers/2504.09895
- Repositorio GitHub de RL2R: https://github.com/mzhaoshuai/RL2R/tree/alignment
