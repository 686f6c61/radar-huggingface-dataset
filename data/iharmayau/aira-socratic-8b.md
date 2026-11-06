# IhArmayau/aira-socratic-8b

## Resumen

aira-socratic-8b es un ajuste fino (fine-tuning) del modelo Meta Llama 3.1 8B Instruct, publicado por el usuario IhArmayau en Hugging Face. El modelo parte de la versión cuantizada a 4 bits de Unsloth (`unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit`) y se ha entrenado con la librería Unsloth junto con TRL de Hugging Face, lo que permite un entrenamiento aproximadamente el doble de rápido y con menor consumo de memoria que un fine-tuning convencional. El nombre sugiere una orientación hacia el diálogo socrático, aunque la model card no documenta el dataset ni la metodología de entrenamiento.

Se trata de un transformer denso de 8.030.261.248 parámetros (8B), con la arquitectura estándar de Llama 3.1: atención con RoPE, GQA y ventana de contexto nativa de 128.000 tokens en el modelo base. El repositorio ocupa 16,1 GB en safetensors, lo que indica que los pesos se han fusionado y guardado en precisión completa (probablemente bf16/fp16) a pesar de que el entrenamiento partió de una base cuantizada.

Su relevancia es limitada pero concreta: sirve como ejemplo de fine-tuning ligero con Unsloth sobre Llama 3.1 8B y como punto de partida para experimentos de diálogo socrático o razonamiento guiado. No obstante, la documentación es mínima (sin datos de entrenamiento, benchmarks ni instrucciones de uso), por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), denso |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1 8B; no verificada en el fine-tuning) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; se puede cuantizar a GGUF/AWQ/GPTQ con herramientas estándar, pero no se documenta) |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 16,1 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Llama 3.1 8B Instruct de Meta, un transformer decoder-only denso con 32 capas, atención multi-cabeza con agrupación de consultas (GQA) y embeddings rotatorios (RoPE). El modelo base soporta de forma nativa 128.000 tokens de contexto y fue entrenado por Meta con aproximadamente 15 billones de tokens, seguido de fases de ajuste supervisado, rechazo de respuestas y DPO para alineamiento. No se dispone de información sobre la composición del dataset de preentrenamiento más allá de lo publicado por Meta.

El fine-tuning se realizó con Unsloth y TRL, partiendo de la versión de Unsloth cuantizada a 4 bits (bnb-4bit). Unsloth aplica kernels optimizados (Triton) y técnicas de ahorro de memoria que permiten entrenar con LoRA/QLoRA sobre GPU de consumo. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, si se usó LoRA o QLoRA, la tasa de aprendizaje, el número de épocas ni si hubo fases de RLHF/DPO posteriores. Tampoco se documenta ninguna innovación técnica propia más allá del uso de Unsloth. El nombre "socratic" sugiere un entrenamiento orientado a preguntas guiadas y razonamiento paso a paso, pero no hay evidencia documental que lo confirme.

## Capacidades

- Generación de texto conversacional en inglés, heredada del Llama 3.1 8B Instruct.
- Razonamiento y respuesta a instrucciones, presumiblemente reforzado hacia un estilo socrático (preguntas guiadas), aunque no está documentado.
- Generación de código y matemáticas básicas, como capacidad heredada del modelo base.
- Soporte de tool calling / function calling: heredado del modelo base Llama 3.1, pero no verificado tras el fine-tuning.
- Capacidades multilingües limitadas: la model card declara únicamente inglés; el modelo base soporta oficialmente ocho idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), pero no se garantiza su preservación.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.
- Compatible con text-generation-inference y endpoints de Hugging Face (tag `endpoints_compatible`).

## Casos de uso

- Prototipado de tutores conversacionales: el modelo puede usarse como base para un asistente que guíe al usuario mediante preguntas en lugar de respuestas directas, aprovechando la orientación socrática sugerida por el nombre y la ventana de contexto de 128.000 tokens del modelo base para mantener conversaciones largas.
- Experimentación académica con fine-tuning ligero: sirve como referencia de cómo ajustar Llama 3.1 8B con Unsloth y TRL en una GPU de consumo, útil para investigadores que quieran replicar el pipeline.
- Generación de preguntas de evaluación: en entornos educativos, puede generar cuestionarios y preguntas de seguimiento sobre un texto largo introducido en el contexto.
- Asistente de razonamiento paso a paso en dominios acotados: para tareas de análisis donde se prefiera un diálogo guiado (por ejemplo, depuración de hipótesis en investigación), siempre con validación humana.
- Base para comparativas de fine-tunes: al ser un ajuste reciente y poco documentado, puede utilizarse en estudios comparativos sobre el efecto de fine-tunings pequeños en modelos de 8B.
- Chatbot interno de bajo coste: con cuantización a 4 bits puede desplegarse en una única GPU de 24 GB para asistentes internos en inglés, aunque la falta de benchmarks obliga a evaluar la calidad antes de exponerlo a usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16 GB de pesos más overhead de activaciones y KV cache; se recomienda un mínimo de 20-24 GB.
- VRAM estimada en cuantización 8 bits: en torno a 9-10 GB.
- VRAM estimada en cuantización 4 bits (GGUF Q4_K_M): en torno a 5-6 GB, más KV cache proporcional al contexto utilizado.
- GPU recomendadas para precisión completa: A100 40/80 GB, H100, L40S; para uso ajustado, RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización 8 o 4 bits; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo con cuantización 4 bits y contextos moderados.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp y Ollama tras convertir los pesos a GGUF; el tag `endpoints_compatible` indica compatibilidad con los endpoints de Hugging Face.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| aira-socratic-8b | 8B | 128.000 (heredado) | Apache 2.0 | Hugging Face | Fine-tuning no documentado, sin benchmarks |
| Meta Llama 3.1 8B Instruct | 8B | 128.000 | Llama 3.1 Community License | Hugging Face, Meta | Modelo base oficial, con benchmarks publicados y alineamiento completo |
| Mistral 7B Instruct v0.3 | 7,2B | 32.000 | Apache 2.0 | Hugging Face | Alternativa open source con licencia permisiva y buen rendimiento en código |
| Qwen2.5 7B Instruct | 7,6B | 131.072 | Apache 2.0 | Hugging Face, Alibaba | Multilingüe (29 idiomas) y con benchmarks publicados |

La comparación directa con el modelo base es la más relevante: aira-socratic-8b no aporta métricas que permitan afirmar una mejora sobre Llama 3.1 8B Instruct, y su licencia Apache 2.0 es más permisiva que la licencia comunitaria de Meta, lo que puede ser un factor decisivo para uso comercial.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento: no se puede evaluar la calidad, los sesgos ni la posible contaminación de datos.
- Sin benchmarks publicados: no hay evidencia de que el fine-tuning mejore al modelo base en ninguna tarea; podría incluso degradar capacidades.
- Riesgo de alucinación: inherente a los modelos de 8B, sin mitigaciones documentadas posteriores al fine-tuning.
- Idioma: solo se declara inglés; el soporte multilingüe del modelo base puede haberse deteriorado.
- Contexto: los 128.000 tokens son una especificación heredada del modelo base; no se ha verificado que el fine-tuning preserve el rendimiento en contextos largos.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Llama 3.1 conviene revisar las obligaciones de la Llama 3.1 Community License que puedan aplicarse al modelo base original.
- Repositorio con 104 descargas y 0 likes: proyecto de autor individual sin comunidad ni mantenimiento conocido; no hay garantías de soporte.
- El nombre "socratic" no está respaldado por documentación técnica; no debe asumirse un comportamiento socrático sin evaluación empírica.
- Para producción, se recomienda evaluar contra el modelo base con un conjunto propio de tareas antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IhArmayau/aira-socratic-8b
- Modelo base (Unsloth, 4 bits): https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
