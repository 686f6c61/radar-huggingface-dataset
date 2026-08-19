# JWerne/existenzial_coach

## Resumen

Existenzial_coach es un adaptador LoRA de 7B parámetros, entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base Qwen/Qwen2.5-7B-Instruct. El autor, JWerne, lo presenta como un asistente conversacional orientado a coaching existencial, capaz de responder preguntas filosóficas y reflexivas sobre la vida, las decisiones y el propósito. El modelo se distribuye como un adaptador PEFT de 0,3 GB, por lo que requiere cargar el modelo base por separado para su uso.

La relevancia de este modelo reside en su especialización en un dominio concreto: el acompañamiento reflexivo y existencial. Al partir de un instruct model de 7B parámetros con ventana de contexto de 131K tokens, el adaptador hereda las capacidades generales de razonamiento y diálogo del base, pero ajusta el estilo de respuesta hacia un tono de coaching. Es un ejemplo de fine-tuning eficiente con LoRA, ya que solo se actualizan un pequeño número de parámetros durante el entrenamiento, lo que reduce drásticamente los costes de cómputo y almacenamiento.

La ficha técnica es limitada: no se proporcionan datos de entrenamiento, benchmarks, ni especificaciones detalladas de los datos utilizados. El repositorio incluye únicamente la configuración del adaptador y los pesos en formato safetensors. A pesar de su bajo número de descargas (0) y likes (0), puede servir como punto de partida para quienes buscan experimentar con fine-tunings temáticos sobre Qwen2.5.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-7B-Instruct) con adaptador LoRA |
| Parametros totales | 7.600 millones (modelo base) + parámetros del adaptador LoRA (no especificados, típicamente ~100-200 M) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantizaciones (AWQ, GPTQ, GGUF) |
| Idiomas soportados | No especificado; hereda del base (principalmente inglés y chino, con algo de multilingüismo) |
| Licencia | No disponible (el modelo base es Apache-2.0, pero el adaptador no declara licencia explícita) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) sobre el transformer decoder-only Qwen2.5-7B-Instruct. La arquitectura del base incluye 28 capas, atención con RoPE, y un vocabulario de 151.936 tokens. El adaptador LoRA introduce matrices de bajo rango en las capas de atención y MLP, permitiendo un fine-tuning eficiente sin modificar los pesos originales. El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) usando la librería TRL (Transformers Reinforcement Learning) de Hugging Face, con PEFT 0.20.0, Transformers 5.14.1 y PyTorch 2.5.1.

No se dispone de información sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje ni la duración del entrenamiento. La model card solo indica que se usó SFT, sin más detalles. Tampoco se menciona el uso de RLHF, DPO u otras técnicas de alineación. Al ser un adaptador de tamaño reducido (0,3 GB), se infiere que el fine-tuning fue de bajo coste, probablemente sobre un dataset pequeño de conversaciones de coaching existencial.

## Capacidades

- Generación de texto conversacional en formato instruct, siguiendo el estilo de Qwen2.5-Instruct.
- Razonamiento filosófico y reflexivo: el modelo está entrenado para responder preguntas existenciales, como la del ejemplo de la model card ("si tuvieras una máquina del tiempo..."), con un enfoque de coaching.
- Diálogo multi-turno: al estar basado en Qwen2.5-7B-Instruct, soporta conversaciones con historial, aunque no se ha validado específicamente.
- Comprensión de contexto largo: hereda los 131K tokens de contexto del base, lo que permite manejar conversaciones extensas o documentos largos.
- Capacidades multilingües: no declaradas, pero el base soporta principalmente inglés y chino, con rendimiento limitado en otros idiomas.
- No se ha confirmado soporte para tool calling, function calling, agentes ni razonamiento multi-paso específico más allá del que ya ofrece el base.

## Casos de uso

- Coaching personal y reflexión existencial: el modelo puede actuar como un compañero de diálogo para usuarios que buscan explorar preguntas sobre el propósito de la vida, decisiones importantes o dilemas morales. Su tono de coaching, ajustado mediante SFT, lo hace adecuado para aplicaciones de bienestar emocional.
- Generación de contenido filosófico: redacción de ensayos, artículos o guiones con perspectiva existencialista, aprovechando la capacidad del base para estructurar argumentos.
- Asistente en terapia narrativa: puede usarse como herramienta de apoyo para terapeutas que quieran generar preguntas reflexivas personalizadas para sus pacientes, aunque sin sustituir la supervisión humana.
- Chatbot educativo en filosofía: integración en plataformas de aprendizaje para discutir conceptos de existencialismo, ética o metafísica con estudiantes, adaptando el nivel de complejidad.
- Práctica de entrevistas de coaching: simulación de sesiones de coaching para que coaches en formación practiquen sus habilidades, recibiendo respuestas realistas de un "cliente" virtual.
- Escritura creativa: generación de diálogos o monólogos interiores con tono introspectivo, útil para autores que trabajan narrativas psicológicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este adaptador. El rendimiento depende del modelo base Qwen2.5-7B-Instruct, que sí tiene benchmarks públicos, pero no se ha evaluado específicamente el adaptador.

## Requisitos de hardware

- VRAM estimada: para el modelo base Qwen2.5-7B-Instruct en FP16 se necesitan ~15 GB de VRAM. Con cuantización 8-bit (~8 GB) o 4-bit (~5 GB) se reduce. El adaptador LoRA añade apenas unos cientos de MB.
- GPU recomendadas: para inferencia en FP16, una RTX 3090/4090 (24 GB) o A100 (40/80 GB) es suficiente. Con cuantización 4-bit, puede ejecutarse en GPUs consumer de 8 GB (RTX 3060, RTX 4060).
- Opciones de despliegue: al ser un adaptador PEFT, debe cargarse junto al modelo base. Se puede usar con Transformers (pipeline), vLLM (con soporte para LoRA), llama.cpp (si se convierte a GGUF) u Ollama (si se empaqueta).
- Latencia y throughput: no se han medido específicamente. Para Qwen2.5-7B-Instruct, en una GPU A100 se espera una latencia de ~50-100 ms por token en FP16, y un throughput de ~100-200 tokens/s en batch. En consumer GPUs, la latencia será mayor.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros adaptadores LoRA de coaching existencial, ya que no hay información pública. Como referencia, se compara con el modelo base y con alternativas de coaching genérico:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| JWerne/existenzial_coach | 7B (base) + LoRA | 131K | Coaching existencial | No disponible |
| Qwen/Qwen2.5-7B-Instruct | 7B | 131K | Instruct general | Apache-2.0 |
| NousResearch/Hermes-3-Llama-3.1-8B | 8B | 128K | Instruct general, razonamiento | Apache-2.0 |
| Mistral-7B-Instruct-v0.3 | 7B | 32K | Instruct general | Apache-2.0 |

El adaptador no ofrece capacidades adicionales frente al base más allá del ajuste de estilo. Para tareas de coaching, el base ya puede generar respuestas reflexivas sin fine-tuning; la ventaja del adaptador es un tono más consistente, aunque no está validado.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un fine-tuning sobre un modelo general, puede generar respuestas inventadas o factualmente incorrectas, especialmente en temas que requieren datos precisos.
- Dominio limitado: el adaptador está entrenado para coaching existencial, pero no se ha evaluado su robustez fuera de ese ámbito. Puede degradarse en tareas técnicas o científicas.
- Datos de entrenamiento desconocidos: no se especifica el dataset, lo que impide evaluar la calidad del ajuste o posibles sesgos introducidos durante el SFT.
- Licencia ambigua: la licencia del adaptador no está declarada, lo que dificulta su uso comercial. El modelo base es Apache-2.0, pero el adaptador podría tener restricciones adicionales.
- Idiomas: no se ha verificado el rendimiento en español u otros idiomas. El base Qwen2.5 tiene mejor rendimiento en inglés y chino; en español puede ser inferior.
- Contexto largo: aunque el base soporta 131K tokens, en la práctica el rendimiento se degrada con secuencias muy largas y el coste computacional aumenta.
- Producción: al ser un adaptador no probado, no se recomienda su uso en producción sin una evaluación exhaustiva y pruebas de seguridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JWerne/existenzial_coach
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Librería TRL (usada para el entrenamiento): https://github.com/huggingface/trl
- Documentación de PEFT: https://github.com/huggingface/peft
