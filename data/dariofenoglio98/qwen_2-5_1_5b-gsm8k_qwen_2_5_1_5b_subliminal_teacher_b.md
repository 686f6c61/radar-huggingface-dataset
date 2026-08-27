# dariofenoglio98/qwen_2.5_1_5b-gsm8k_qwen_2_5_1_5b_subliminal_teacher_b

## Resumen

El modelo `dariofenoglio98/qwen_2.5_1_5b-gsm8k_qwen_2_5_1_5b_subliminal_teacher_b` es un fine-tune del modelo base `unsloth/Qwen2.5-1.5B-Instruct`, desarrollado por dariofenoglio98. El nombre sugiere que ha sido entrenado específicamente para el conjunto de datos GSM8K, centrado en razonamiento matemático y resolución de problemas aritméticos. Se trata de un modelo de 1.500 millones de parámetros, basado en la arquitectura Qwen2.5, con una ventana de contexto de hasta 128.000 tokens (heredada del modelo base). Su relevancia radica en ofrecer una alternativa compacta y eficiente para tareas de razonamiento matemático en entornos con recursos limitados, aprovechando el entrenamiento acelerado con Unsloth y la licencia Apache-2.0 que permite uso comercial sin restricciones.

El modelo está publicado con formato `safetensors` y es compatible con la librería `transformers` y `text-generation-inference`. Aunque no se proporcionan detalles sobre el proceso de entrenamiento, la etiqueta `trl` indica el uso de la librería TRL de Hugging Face, probablemente para fine-tuning supervisado. Al ser un modelo pequeño, es adecuado para despliegue en GPUs de consumo y para aplicaciones donde la latencia y el consumo de memoria son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (no se especifican en la ficha) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder con atención causal estándar, preentrenado por Alibaba sobre un corpus de hasta 18 billones de tokens. El fine-tune se realizó sobre la versión instruct de 1.5B, utilizando la librería Unsloth para acelerar el entrenamiento (según la etiqueta del modelo). No se dispone de información detallada sobre el dataset de fine-tuning, el número de pasos, la tasa de aprendizaje o si se emplearon técnicas como RLHF o DPO. La etiqueta `trl` sugiere el uso de la librería TRL, probablemente para Supervised Fine-Tuning (SFT). El nombre del modelo indica que el entrenamiento se orientó al conjunto GSM8K, un benchmark de problemas matemáticos de nivel escolar, lo que implica una especialización en razonamiento aritmético y resolución de problemas paso a paso.

## Capacidades

- Generación de texto en inglés con razonamiento matemático mejorado, especialmente en problemas de aritmética y álgebra básica.
- Razonamiento paso a paso (chain-of-thought) para problemas de GSM8K, aunque no se garantiza un rendimiento óptimo fuera de ese dominio.
- Soporte de tool calling y function calling: el modelo base Qwen2.5-Instruct incluye esta capacidad, por lo que el fine-tune la conserva, aunque no se ha verificado específicamente.
- Capacidad de agentes y multi-step reasoning: heredada del modelo base, pero limitada por el tamaño reducido.
- Multilingüismo: no soportado, el modelo está entrenado únicamente en inglés.
- Sin capacidades de visión ni audio; es exclusivamente texto.

## Casos de uso

- Tutoría matemática automatizada: el modelo puede generar explicaciones paso a paso para problemas de aritmética y álgebra, útil en plataformas educativas o asistentes de estudio. Su tamaño compacto permite ejecutarlo en dispositivos con recursos limitados.
- Generación de ejercicios matemáticos: puede crear problemas similares a los de GSM8K para prácticas o evaluaciones, aprovechando su especialización en ese dominio.
- Asistente de razonamiento en chatbots: integrado en un sistema de atención al cliente, puede resolver consultas que requieran cálculos sencillos, como precios, descuentos o conversiones, gracias a su capacidad de razonamiento numérico.
- Preprocesamiento de datos en pipelines de NLP: como modelo ligero, puede usarse para extraer respuestas numéricas o validar resultados en tareas de QA matemática antes de pasar a modelos más grandes.
- Prototipado rápido: al ser pequeño y con licencia Apache-2.0, es ideal para pruebas de concepto de aplicaciones que requieran razonamiento matemático sin incurrir en costes elevados de inferencia.
- Despliegue en edge devices: su bajo consumo de memoria (aproximadamente 3-4 GB en FP16) permite ejecutarlo en GPUs de consumo como RTX 3060 o incluso en CPU con cuantización, para aplicaciones offline de asistencia matemática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El nombre del modelo sugiere un fine-tune sobre GSM8K, pero no se proporcionan métricas de exactitud, ni comparaciones con el modelo base o con otros modelos de tamaño similar. Se recomienda evaluar el modelo en el conjunto GSM8K u otros benchmarks de razonamiento matemático antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Para un modelo de 1.5B en FP16, se estima un consumo de aproximadamente 3-4 GB, más overhead de inferencia, lo que lo hace viable en GPUs con 6 GB o más.
- GPUs recomendadas: cualquier GPU con al menos 6 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, o GPUs de datacenter como T4 o A10. También puede ejecutarse en CPU con cuantización (por ejemplo, GGUF).
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media y baja.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, TGI (text-generation-inference) y la librería transformers estándar.
- Latencia y throughput: no disponibles. Al ser un modelo pequeño, se espera una latencia baja (del orden de decenas de milisegundos por token en GPUs modernas), pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 1.5B | 128K | Apache-2.0 | Generico, multilingue |
| dariofenoglio98/qwen_2.5_1_5b-gsm8k (este modelo) | 1.5B | 128K | Apache-2.0 | Matematicas (GSM8K) |
| Llama-3.2-1B-Instruct | 1.2B | 128K | Llama 3.2 Community License | Generico, multilingue |
| Phi-3-mini (3.8B) | 3.8B | 128K | MIT | Razonamiento, codigo |

No se dispone de datos de rendimiento comparativo. La principal diferencia con el modelo base es la especialización en matemáticas, aunque a costa de perder generalidad. Phi-3-mini es más grande y probablemente más capaz en razonamiento, pero requiere más recursos. Llama-3.2-1B es comparable en tamaño pero con licencia más restrictiva.

## Limitaciones y advertencias

- Sesgos conocidos: heredados del modelo base Qwen2.5, que puede reflejar sesgos presentes en sus datos de preentrenamiento. No se ha realizado una evaluación específica de sesgos en este fine-tune.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventadas, especialmente fuera del dominio matemático. Su especialización en GSM8K no garantiza precisión en otros tipos de problemas.
- Limitaciones de contexto: aunque soporta 128K tokens, el fine-tune puede no haber sido entrenado con secuencias tan largas, por lo que el rendimiento en contextos muy extensos podría degradarse.
- Limitaciones de idioma: solo inglés. No es adecuado para aplicaciones multilingües.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificación y redistribución, pero se debe incluir el aviso de licencia y atribución. No hay restricciones de uso militar o de vigilancia, a diferencia de otras licencias.
- Caveat para produccion: al ser un modelo de 1.5B, su capacidad de razonamiento complejo es limitada. Para tareas matemáticas avanzadas o razonamiento multi-paso extenso, puede ser necesario un modelo más grande. Se recomienda validar el rendimiento en el caso de uso específico antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dariofenoglio98/qwen_2.5_1_5b-gsm8k_qwen_2_5_1_5b_subliminal_teacher_b
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Informe tecnico de Qwen2.5: https://arxiv.org/pdf/2412.15115v1
- Página de Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:1.5b
