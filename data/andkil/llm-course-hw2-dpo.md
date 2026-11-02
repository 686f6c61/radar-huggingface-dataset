# andkil/llm-course-hw2-dpo

## Resumen

andkil/llm-course-hw2-dpo es un modelo de lenguaje de tipo transformer publicado en HuggingFace por el usuario andkil, con un total de 134.515.008 parámetros (aproximadamente 134,5 millones) según los pesos en formato safetensors. El nombre del repositorio sugiere que se trata de un trabajo práctico de un curso sobre modelos de lenguaje ("llm-course-hw2") en el que se ha aplicado una fase de optimización por preferencias humanas mediante DPO (Direct Preference Optimization). La model card es la plantilla automática de HuggingFace y no aporta información sustantiva sobre el autor, los datos de entrenamiento ni la licencia.

El modelo está etiquetado como "llama" en los tags de HuggingFace y utiliza la librería transformers, lo que indica que sigue la arquitectura de la familia Llama (transformer decoder-only con atención causal). Con 134,5 millones de parámetros, su tamaño es comparable a modelos pequeños como GPT-2 (124 M) o a variantes reducidas de Llama, lo que lo sitúa en la categoría de modelos ligeros aptos para experimentación y despliegue en hardware modesto.

La relevancia de este modelo es fundamentalmente educativa y experimental: al ser un artefacto de un curso con DPO, sirve como ejemplo de cómo se aplica el ajuste por preferencias a un modelo base pequeño. No obstante, la ausencia de documentación, benchmarks y licencia explícita limita seriamente su uso en producción. El repositorio ocupa 0,5 GB y no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta "llama" en HuggingFace) |
| Parametros totales | 134.515.008 (134,5 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only, coherente con la etiqueta "llama" del repositorio y con el uso de la librería transformers. El recuento de 134.515.008 parámetros encaja con una configuración de dimensiones reducidas típica de los modelos de práctica (capas ocultas de 512-768 dimensiones, 12-24 capas, atención multi-cabeza), aunque no se dispone de la configuración exacta de capas, cabezas ni dimensión de embedding.

El sufijo "dpo" del identificador indica que el modelo ha pasado por una fase de Direct Preference Optimization, una técnica de alineación que ajusta el modelo para preferir respuestas elegidas frente a rechazadas sin necesidad de un modelo de recompensa separado. Sin embargo, no se documenta el modelo base del que parte, el dataset de preferencias utilizado, el número de tokens de entrenamiento, la composición del corpus ni los hiperparámetros (tasa de aprendizaje, beta de DPO, número de épocas). Tampoco se especifica si hubo una fase previa de SFT (supervised fine-tuning) ni si se aplicaron técnicas adicionales como RLHF o decodificación especulativa.

## Capacidades

- Generación de texto autoregresiva: el pipeline declarado es text-generation, por lo que el modelo puede producir texto condicionado a un prompt.
- Conversación: la etiqueta "conversational" sugiere que está adaptado para diálogo multi-turno, presumiblemente mediante una plantilla de chat, aunque esta no se documenta.
- Alineación por preferencias: la fase DPO debería mejorar la calidad y el ajuste de las respuestas a las preferencias humanas, si bien no hay evidencia publicada de ello.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Capacidades de agente y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingües: no disponible; no se especifican idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Experimentación educativa en cursos de LLM: el modelo sirve como ejemplo práctico de un pipeline de ajuste con DPO sobre un transformer pequeño, útil para estudiar cómo cambia el comportamiento del modelo tras la fase de preferencias.
- Pruebas de infraestructura de inferencia: con 134,5 M de parámetros y 0,5 GB de pesos, es adecuado para validar despliegues con transformers, text-generation-inference o endpoints compatibles antes de pasar a modelos mayores.
- Generación de texto de dominio general en entornos con recursos limitados: puede ejecutarse en CPU o en GPUs de gama baja para tareas de completado de texto no críticas.
- Prototipado de chatbots conversacionales: la etiqueta "conversational" permite usarlo como base para demostraciones de diálogo, siempre que se defina una plantilla de chat propia.
- Investigación sobre alineación y DPO: permite comparar respuestas antes y después del ajuste por preferencias, así como analizar sesgos introducidos por el dataset de preferencias (no documentado).
- Filtrado o clasificación de texto ligera: mediante prompting, puede emplearse para tareas simples de etiquetado o resumen en prototipos, dado su bajo coste de inferencia.
- Fine-tuning posterior: al ser un modelo pequeño en safetensors, es un candidato cómodo para experimentos de LoRA o QLoRA en una única GPU consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32 (formato habitual de los pesos safetensors) los 134,5 M de parámetros ocupan aproximadamente 538 MB; en fp16/bf16, unos 269 MB; en cuantización de 8 bits, unos 135 MB; en 4 bits, unos 67 MB. El repositorio de 0,5 GB es consistente con pesos en fp32.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o incluso una GTX 1650 pueden alojarlo sin problemas. Para lotes grandes, una A100 o H100 no aportan ventaja significativa por el reducido tamaño del modelo.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers (nativo), text-generation-inference (etiqueta endpoints_compatible), y previsiblemente llama.cpp/Ollama si se convierte a GGUF, aunque no se publican artefactos de este tipo.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| andkil/llm-course-hw2-dpo | 134,5 M | No disponible | No disponible | HuggingFace (0 descargas) |
| GPT-2 (OpenAI) | 124 M | 1.024 tokens | MIT (pesos) | HuggingFace, muy extendido |
| TinyLlama-1.1B | 1.100 M | 2.048 tokens | Apache 2.0 | HuggingFace, ampliamente usado |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache 2.0 | HuggingFace, con benchmarks publicados |

La comparación es aproximada: no se dispone de datos de rendimiento del modelo de andkil, por lo que la tabla solo contrasta tamaño, contexto, licencia y disponibilidad. Frente a GPT-2 (124 M, licencia MIT, contexto 1.024), el modelo aquí descrito es ligeramente mayor pero carece de documentación y licencia clara. Frente a TinyLlama-1.1B o Qwen2.5-0.5B, es más pequeño y no ofrece benchmarks ni contexto declarado, lo que lo hace menos adecuado para uso en producción.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática de HuggingFace, sin información sobre datos, entrenamiento, evaluación ni uso previsto.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido; en la práctica, esto impide su adopción en producción sin aclaración del autor.
- Idiomas no especificados: se desconoce si el modelo está entrenado principalmente en inglés, en multilingüe o en otro idioma, lo que hace arriesgado su uso en castellano.
- Riesgo de alucinación: al ser un modelo de 134,5 M de parámetros, su capacidad de razonamiento y factualidad es limitada; es probable que genere contenido incorrecto o incoherente en tareas complejas.
- Sesgos desconocidos: al no documentarse el dataset de preferencias ni el corpus de entrenamiento, no es posible evaluar sesgos de género, raza, idioma o ideología.
- Contexto no documentado: se desconoce la ventana de contexto real, lo que impide planificar conversaciones multi-turno largas o tareas de recuperación aumentada.
- Sin benchmarks: no hay evidencia publicada de calidad, por lo que cualquier afirmación sobre su rendimiento sería especulativa.
- Madurez del artefacto: 0 descargas y 0 "likes" en el momento de la consulta; el repositorio parece un entregable académico sin mantenimiento.
- Fecha de creación futura: el repositorio figura creado el 2026-11-02, lo que puede indicar un error de metadatos o una fecha de sistema incorrecta; conviene verificar la integridad del artefacto antes de usarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/andkil/llm-course-hw2-dpo
- Paper de referencia citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML CO2: https://mlco2.github.io/impact#compute
