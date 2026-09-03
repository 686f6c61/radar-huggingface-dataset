# HYU-NLP-EVAL/qwen3-1.7b-rar-science-static-r0-step-000

## Resumen

Este repositorio contiene un checkpoint de política del modelo Qwen3-1.7B, desarrollado por el grupo HYU-NLP-EVAL como parte de un experimento de aprendizaje por refuerzo (RL) sobre rúbricas estáticas. El modelo es un fine-tuning del base `Qwen/Qwen3-1.7B` mediante el algoritmo GRPO, donde la recompensa de entrenamiento es una rúbrica inicial específica de cada prompt, congelada (denominada `R0`). El dominio de entrenamiento es "RaR Science" (probablemente "Read and Reason" en ciencia), y el checkpoint corresponde al paso 0 del optimizador, es decir, el punto de partida sin actualizaciones de política.

El propósito declarado es servir como artefacto de investigación para estudiar la saturación de recompensa y el estancamiento de rúbricas estáticas durante la optimización de políticas. No es un modelo pensado para uso en producción, sino una pieza de análisis comparativo dentro de una serie de checkpoints guardados en distintos pasos. La arquitectura es la del Qwen3-1.7B (transformer causal), con aproximadamente 1,72 mil millones de parámetros. No se especifica la longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se indica BF16 safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura del Qwen3-1.7B, un transformer causal con mecanismo de atención estándar. El entrenamiento se realizó mediante GRPO (Group Relative Policy Optimization), un algoritmo de RL de optimización de políticas que utiliza un grupo de respuestas para calcular ventajas relativas. La recompensa empleada fue una rúbrica inicial estática y congelada (`R0`), específica de cada prompt, sin actualizaciones durante el entrenamiento. El dominio de entrenamiento es "RaR Science" (ciencia con razonamiento), aunque no se detalla la composición del dataset ni el número de tokens utilizados.

El checkpoint corresponde al paso 0 del optimizador, con semilla 11. Se guardaron únicamente los pesos del modelo, configuración, tokenizador y plantilla de chat; se excluyeron optimizador, scheduler, estado del entrenador, rollouts, rúbricas y datos de evaluación. La exportación se realizó en formato Hugging Face Transformers con precisión BF16.

## Capacidades

- Generación de texto y conversación: al incluir el tokenizador y la plantilla de chat, el modelo puede mantener diálogos multi-turno.
- Razonamiento y comprensión lectora: heredadas del modelo base Qwen3-1.7B, aunque no se han evaluado específicamente en este checkpoint.
- No se dispone de información sobre soporte de tool calling, function calling, capacidades multimodales o modos de pensamiento especiales.
- El modelo está diseñado para el dominio científico (RaR Science), pero no se especifica si tiene capacidades multilingües adicionales más allá de las del base.

## Casos de uso

- Investigación académica sobre RLHF: permite analizar cómo evoluciona la política en el paso 0 frente a pasos posteriores, sirviendo como línea base para estudiar la saturación de recompensa.
- Estudio de estancamiento de rúbricas: al comparar este checkpoint con otros de pasos superiores, se puede medir el efecto de una rúbrica estática en la calidad de las respuestas generadas.
- Análisis de deriva de la política: los investigadores pueden examinar si el modelo base ya muestra sesgos o comportamientos específicos antes de cualquier actualización de RL.
- Reproducción de experimentos: al estar disponible el checkpoint con configuración y tokenizador, se puede replicar el entorno de evaluación y verificar resultados.
- Benchmarking de métodos de RL: este checkpoint puede usarse como referencia para comparar con otros algoritmos de optimización de políticas en el mismo dominio.
- Docencia y formación: útil para ilustrar el proceso de entrenamiento con GRPO y la importancia de las rúbricas de recompensa en sistemas de IA generativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este checkpoint concreto.

## Requisitos de hardware

- El tamaño del repositorio es de 3,5 GB, lo que sugiere que la inferencia en BF16 requiere aproximadamente esa cantidad de memoria de GPU (estimación basada en el peso de los safetensors).
- Es probable que quepa en GPUs de consumo con 6 GB o más de VRAM, como una RTX 3060, RTX 4060 o superior, aunque no se ha verificado oficialmente.
- Para despliegue, al ser un modelo Transformers estándar, es compatible con librerías como vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama, pero no se ha probado en estos entornos.
- No se dispone de datos de latencia o throughput para este checkpoint.

## Comparativa con modelos similares

El modelo es un checkpoint del Qwen3-1.7B, por lo que la comparativa natural es con el modelo base y con otros modelos de tamaño similar. Sin embargo, no se han publicado métricas de rendimiento de este checkpoint, por lo que no es posible realizar una comparación cuantitativa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-1.7B (base) | 1,72B | No especificado | Apache 2.0 | HuggingFace |
| Este checkpoint | 1,72B | No especificado | Apache 2.0 | HuggingFace (público) |
| Llama 3.2 1B | 1,23B | 128K | Llama 3.2 | HuggingFace |
| Gemma 2 2B | 2,6B | 8K | Gemma | HuggingFace |

Nota: los datos de contexto de los modelos comparativos provienen de información pública general, no de este repositorio.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción. Su uso previsto es el estudio de la saturación de recompensa y el estancamiento de rúbricas.
- No se ha evaluado el modelo en cuanto a sesgos, alucinaciones o seguridad. Podría heredar sesgos del modelo base Qwen3-1.7B.
- El dominio está restringido a "RaR Science", pero no se especifica qué tipo de datos científicos se usaron, por lo que su rendimiento en otros dominios es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado para ello y carece de garantías de calidad o robustez.
- No se dispone de información sobre la longitud de contexto efectiva tras el entrenamiento con RL.
- Los checkpoints de medicina (no este) tienen la advertencia explícita de no ser dispositivos médicos; este checkpoint de ciencia no tiene advertencias adicionales, pero debe tratarse con la misma cautela.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/HYU-NLP-EVAL/qwen3-1.7b-rar-science-static-r0-step-000)
- [Modelo base Qwen/Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B)
