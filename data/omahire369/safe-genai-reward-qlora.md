# OmAhire369/safe-genai-reward-qlora

## Resumen

`safe-genai-reward-qlora` es un modelo de recompensa (reward model) basado en el enfoque Bradley-Terry, desarrollado por OmAhire369 como parte de un estudio comparativo de alineación de seguridad en modelos de lenguaje (PPO vs DPO). El modelo se construye sobre `bert-base-uncased` y se entrena con adaptadores QLoRA de 4 bits, lo que permite ajustar únicamente 2,68 millones de parámetros (un 2,39 % del total) sobre los 112,16 millones del modelo base. Su propósito es puntuar pares de respuestas generadas por un LLM para determinar cuál es más segura ante prompts dañinos o que desencadenan estereotipos, proporcionando así una señal de recompensa utilizable en pipelines de RLHF, PPO o DPO.

La relevancia de este modelo radica en su enfoque eficiente: al usar QLoRA, se reduce drásticamente el coste de entrenamiento y la huella de memoria (pico de 5,3 GB de VRAM), manteniendo una alta precisión de preferencia (0,9978 en test). Forma parte de un proyecto más amplio que explora diferentes estrategias de fine-tuning (full, prefix, LoRA y QLoRA) para la alineación de seguridad, lo que lo convierte en una herramienta útil para investigación y experimentación en este ámbito. No obstante, al estar basado en un modelo pequeño y sin instrucciones, no es adecuado para producción directa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base-uncased (Transformer encoder) con cabeza de regresión para reward |
| Parametros totales | 112,16 M (modelo base) + 2,68 M (adaptador QLoRA) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (típico de BERT: 512 tokens) |
| Tipos de cuantizacion | QLoRA 4-bit (entrenamiento); el adaptador se distribuye en precisión original (safetensors) |
| Idiomas soportados | No disponible (modelo base en inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo utiliza `bert-base-uncased` como arquitectura base, un transformer encoder de 12 capas con 110 millones de parámetros aproximadamente. Sobre esta base se añade una cabeza de regresión que produce una puntuación escalar (reward) para cada respuesta. El entrenamiento se realiza con el objetivo Bradley-Terry, que modela la probabilidad de que una respuesta sea preferida sobre otra a partir de sus puntuaciones. Se emplean adaptadores QLoRA de 4 bits, lo que permite congelar el modelo base y entrenar solo un pequeño subconjunto de parámetros (2,68 M), reduciendo significativamente el coste computacional y de memoria.

Los datos de entrenamiento provienen de "Cultural Kaleidoscope preference data", con 4.000 pares de preferencias. El entrenamiento se completó en 507,37 segundos con un pico de memoria GPU de 5.328,3 MB. No se menciona el uso de RLHF, DPO u otras técnicas de alineación adicionales; el modelo es únicamente un reward model. La innovación principal reside en la aplicación de QLoRA para este tipo de tarea, dentro de un estudio que compara varias estrategias de fine-tuning.

## Capacidades

- Puntuar pares de respuestas: dado un prompt y dos respuestas, devuelve una puntuación para cada una, indicando cuál es más segura o preferible.
- Señal de recompensa para RLHF/PPO/DPO: puede integrarse en bucles de entrenamiento por refuerzo para guiar la política de un LLM hacia respuestas seguras.
- Detección de respuestas dañinas o estereotípicas: entrenado específicamente para penalizar contenido que refuerce estereotipos o sea perjudicial.
- Clasificación de preferencias: útil para ordenar o filtrar respuestas generadas por un LLM en sistemas de chat o generación.
- No genera texto: es un modelo discriminativo, no generativo.
- No soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Alineación de seguridad en RLHF: usar el reward model para puntuar las respuestas generadas por un LLM durante el entrenamiento con PPO, de modo que la política aprenda a producir respuestas más seguras ante prompts dañinos.
- Filtrado de respuestas en sistemas de chat: dado un prompt y varias respuestas candidatas, el modelo puede seleccionar la más segura, reduciendo el riesgo de contenido ofensivo o estereotípico en producción.
- Evaluación de sesgos en generación: emplear el modelo para auditar si un LLM produce respuestas que refuercen estereotipos de género, raza u otros, sirviendo como herramienta de control de calidad.
- Investigación en alineación: comparar el rendimiento de diferentes estrategias de fine-tuning (full, LoRA, QLoRA) utilizando este reward model como métrica de preferencia, tal como se plantea en el estudio original.
- Generación de preferencias sintéticas para DPO: usar las puntuaciones del reward model para construir pares de preferencias etiquetados automáticamente, que luego se emplean en el entrenamiento con DPO.
- Auditoría de seguridad de modelos: evaluar de forma rápida si un modelo fine-tuneado en un dominio específico ha perdido su entrenamiento de seguridad, puntuando sus respuestas ante prompts de prueba.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Preference accuracy (test) | 0,9978 |
| Bradley-Terry NLL (test) | 0,0118 |
| Mean reward margin | 14,3715 |

No se han publicado resultados comparativos con otros modelos de recompensa en la información disponible.

## Requisitos de hardware

- Inferencia: al tratarse de un adaptador sobre BERT-base (~110 M parámetros), el modelo puede ejecutarse en CPU o en cualquier GPU con menos de 1 GB de VRAM en FP32 (aproximadamente 0,5 GB en FP16). No se requieren GPUs de alta gama.
- Entrenamiento: según la model card, el pico de memoria GPU fue de 5.328,3 MB, por lo que se necesita al menos una GPU con 6 GB de VRAM para reproducir el entrenamiento.
- GPU recomendada: cualquier GPU consumer (p. ej., RTX 3060, RTX 4090) o incluso CPU para inferencia; para entrenamiento, una GPU con 6-8 GB es suficiente.
- Despliegue: se puede cargar con `transformers` y `peft`; no requiere infraestructura especial como vLLM o TGI. Es compatible con cualquier framework que soporte PEFT.
- Latencia y throughput: no se dispone de datos oficiales, pero al ser un modelo pequeño, la inferencia es rápida (del orden de milisegundos por par de respuestas en GPU).

## Comparativa con modelos similares

No se dispone de información sobre modelos de recompensa comparables en la documentación proporcionada. Se recomienda consultar benchmarks como RewardBench para establecer comparaciones, pero no se incluyen datos aquí por falta de referencias.

## Limitaciones y advertencias

- El modelo base `bert-base-uncased` es pequeño y desactualizado, sin entrenamiento de instrucciones; la alineación solo modifica el estilo y la seguridad de las respuestas, pero no garantiza veracidad ni calidad general.
- No es adecuado para producción directa como clasificador de seguridad de propósito general; su uso debe limitarse a entornos de investigación o como componente en pipelines de alineación.
- Hereda los sesgos de anotación presentes en los datos de preferencia "Cultural Kaleidoscope", que pueden no ser representativos de todos los contextos culturales.
- Solo evalúa pares de respuestas; no puede puntuar una respuesta individual de forma absoluta.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en escenarios reales.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/OmAhire369/safe-genai-reward-qlora)
- [Repositorio similar: reward-model-safe-ai](https://huggingface.co/OmAhire369/reward-model-safe-ai)
- [Proyecto GitHub: safety-alignment-llm](https://github.com/Omahire369/safety-alignment-llm)
