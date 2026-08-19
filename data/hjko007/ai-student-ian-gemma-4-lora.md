# hjko007/AI-Student-Ian-Gemma-4-LoRA

## Resumen

El modelo `hjko007/AI-Student-Ian-Gemma-4-LoRA` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario hjko007, que fine-tunea el modelo base `unsloth/gemma-4-e2b-it-unsloth-bnb-4bit`, una versión cuantizada a 4 bits de Gemma 4 E2B de Google DeepMind. Este adaptador está diseñado para personalizar el comportamiento del modelo base en una tarea específica, probablemente orientada a un asistente educativo o de estudio (según el nombre "AI-Student-Ian"), aunque no se proporcionan detalles del dataset de entrenamiento.

El modelo base Gemma 4 E2B pertenece a la familia Gemma 4, que destaca por su ventana de contexto de hasta 256K tokens, soporte multilingüe en más de 140 idiomas y arquitecturas tanto densas como MoE. En este caso, el tamaño E2B indica aproximadamente 2 mil millones de parámetros. El adaptador LoRA, con un tamaño de repositorio de solo 0.1 GB, añade un número reducido de parámetros entrenables, lo que permite un fine-tuning eficiente en términos de recursos computacionales.

La relevancia de este modelo radica en su enfoque práctico: permite adaptar un modelo de última generación como Gemma 4 a un dominio concreto (posiblemente asistencia académica) con un coste de entrenamiento reducido gracias a la técnica LoRA y a la librería Unsloth, que acelera el proceso de entrenamiento. Está licenciado bajo Apache 2.0, lo que facilita su uso comercial y su integración en aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 4 E2B) |
| Parametros totales | No disponible (el modelo base tiene ~2B; el adaptador LoRA añade un número reducido) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base soporta hasta 256K, pero no se confirma para este adaptador) |
| Tipos de cuantizacion | El modelo base usa bnb-4bit; el adaptador LoRA se distribuye en safetensors sin cuantizar |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador LoRA se construye sobre `unsloth/gemma-4-e2b-it-unsloth-bnb-4bit`, que es una versión de Gemma 4 E2B cuantizada a 4 bits mediante bitsandbytes y preparada con Unsloth. Gemma 4 E2B es un modelo Transformer denso, autoregresivo, diseñado para generación de texto, razonamiento y codificación. La técnica LoRA congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atención y feed-forward, reduciendo drásticamente el número de parámetros entrenables.

El entrenamiento se realizó con la librería Unsloth, que optimiza el proceso y permite un entrenamiento 2x más rápido que los métodos convencionales. Se utilizó TRL (Transformer Reinforcement Learning) como parte del pipeline, aunque no se especifica si se aplicó RLHF, DPO o simplemente fine-tuning supervisado. No se dispone de información sobre el tamaño del dataset, la composición de los datos ni el número de épocas.

## Capacidades

- Generacion de texto: hereda las capacidades del modelo base Gemma 4 E2B, que incluye generacion coherente y contextual.
- Razonamiento y comprension: el modelo base es competente en tareas de razonamiento logico y comprension lectora.
- Codigo: Gemma 4 tiene buen rendimiento en generacion y explicacion de codigo, aunque no se ha verificado especificamente para este adaptador.
- Multilingue: el modelo base soporta 140+ idiomas, pero la model card de este adaptador indica solo ingles; es probable que el fine-tuning se haya realizado exclusivamente en ingles.
- No se han documentado capacidades especiales como tool calling, agentes, vision o audio en este adaptador.

## Casos de uso

- Asistente de estudio personalizado: el nombre "AI-Student-Ian" sugiere un uso orientado a estudiantes. Podria desplegarse como un chatbot que responde preguntas academicas, explica conceptos y ayuda con deberes, aprovechando la ventana de contexto larga del modelo base para mantener conversaciones extensas.
- Generacion de resumenes y apuntes: dado su tamano compacto (~2B), puede ejecutarse en hardware modesto y utilizarse para resumir articulos, libros o apuntes de clase en tiempo real.
- Tutor de programacion: con la capacidad de generacion de codigo del modelo base, el adaptador podria usarse para resolver ejercicios de programacion y ofrecer explicaciones paso a paso.
- Chatbot de soporte en entornos educativos: integrado en plataformas de e-learning para responder dudas frecuentes de estudiantes, reduciendo la carga del personal docente.
- Procesamiento de documentos academicos: gracias al contexto largo (si se hereda), puede analizar papers extensos o informes y extraer informacion relevante.
- Prototipado rapido de asistentes conversacionales: al ser un LoRA ligero, es ideal para experimentar con fine-tuning especifico de dominio sin necesidad de infraestructura de alto coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K u otras pruebas estandar para este adaptador concreto. Se recomienda evaluar el modelo en las tareas objetivo antes de su uso en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4 bits ocupa aproximadamente 1.5-2 GB; sumando el adaptador LoRA, el requisito total ronda los 2-2.5 GB. Es viable en GPUs consumer con 4 GB o mas.
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060, GTX 1660 Super, o cualquier GPU con al menos 4 GB de VRAM. Tambien puede ejecutarse en CPU con cuantizacion adicional.
- Despliegue: compatible con vLLM, llama.cpp, Ollama y Text Generation Inference (TGI). Dado que el adaptador es un LoRA, se puede cargar junto con el modelo base en frameworks como Hugging Face Transformers.
- Latencia: en una GPU moderna, la generacion de tokens se estima en 20-50 tokens/segundo para un modelo de 2B cuantizado, aunque no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| hjko007/AI-Student-Ian-Gemma-4-LoRA | ~2B (base) + LoRA | No disponible (base: hasta 256K) | Apache 2.0 | safetensors (LoRA) |
| Gemma 2 2B | 2.6B | 8K | Gemma License | safetensors, GGUF |
| Qwen2.5 1.5B | 1.5B | 32K | Apache 2.0 | safetensors, GGUF |
| Phi-3 mini | 3.8B | 128K | MIT | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo. La eleccion entre estos modelos dependera de la tarea especifica, el contexto necesario y las restricciones de licencia. El adaptador LoRA ofrece la ventaja de ser un fine-tuning ligero sobre un modelo base potente, pero su rendimiento real solo puede determinarse mediante evaluacion directa.

## Limitaciones y advertencias

- Sesgos y alucinaciones: el modelo base Gemma 4, como cualquier LLM, puede generar contenido sesgado o inventar informacion. El fine-tuning no elimina estos riesgos.
- Idioma limitado: la model card indica solo ingles, por lo que su uso en otros idiomas puede degradar la calidad de las respuestas.
- Falta de documentacion: no se especifican el dataset de entrenamiento, los hiperparametros ni el proposito exacto del adaptador, lo que dificulta evaluar su idoneidad para casos concretos.
- Riesgo de sobreajuste: al ser un LoRA pequeno, existe la posibilidad de que el modelo haya sobreajustado al dataset de entrenamiento, reduciendo su generalizacion.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el modelo base Gemma 4 puede tener sus propias condiciones de uso; se recomienda revisar la licencia de Gemma 4 para uso comercial.
- Produccion: sin benchmarks ni evaluacion independiente, no se recomienda su uso en entornos de produccion criticos sin pruebas exhaustivas previas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hjko007/AI-Student-Ian-Gemma-4-LoRA
- Pagina oficial de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Sitio no oficial de Gemma 4: https://gemmai4.com/
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
