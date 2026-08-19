# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed2026_step340

## Resumen

Este modelo es un adapter LoRA (Low-Rank Adaptation) publicado por el usuario sbcho0325, que aplica un fine-tuning con supervisión (SFT) sobre el modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct, desarrollado por LG AI Research. El nombre del repositorio (`lg_convfin_mcq_pc_random_sft_seed2026_step340`) sugiere que el entrenamiento se ha orientado a tareas de razonamiento financiero conversacional, probablemente sobre el dataset ConvFinQA, con preguntas de opción múltiple y un esquema de contexto aleatorio por párrafo. El adapter ocupa 0,3 GB y se distribuye en formato safetensors con la librería PEFT, por lo que no es un modelo completo sino un módulo de adaptación que debe combinarse con el modelo base para su uso.

La relevancia de este tipo de adapters radica en que permiten especializar un modelo generalista de 7.800 millones de parámetros en un dominio concreto (finanzas) sin necesidad de reentrenar todos los pesos, reduciendo costes computacionales y de almacenamiento. Al estar basado en EXAONE 3.5, hereda las capacidades del modelo base, que incluyen una ventana de contexto de hasta 32.000 tokens y un buen rendimiento en instrucciones del mundo real, especialmente en coreano e inglés. Sin embargo, al tratarse de un adapter sin documentación técnica pública, su comportamiento exacto solo puede verificarse mediante pruebas empíricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (modelo base EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | No disponible (el modelo base tiene 7.800 millones; el adapter LoRA añade un número reducido de parámetros entrenables, no especificado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adapter se publica en precisión completa, safetensors) |
| Idiomas soportados | No disponible para el adapter; el modelo base soporta coreano e inglés |
| Licencia | No disponible para el adapter; el modelo base EXAONE 3.5 tiene su propia licencia (consultar en su página oficial) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adapter se basa en la arquitectura del modelo EXAONE 3.5, un transformer decoder-only con atención causal estándar y 7.800 millones de parámetros. El modelo base fue entrenado por LG AI Research con un enfoque en el seguimiento de instrucciones del mundo real, utilizando una combinación de datos en coreano e inglés y un proceso de alineación que incluye instrucciones supervisadas y optimización por preferencias humanas (DPO). El adapter aquí presentado aplica una capa LoRA sobre este modelo, lo que implica que solo se actualizan matrices de bajo rango en las capas de atención y feed-forward durante el fine-tuning.

El nombre del repositorio indica que el entrenamiento se realizó mediante SFT (supervised fine-tuning) sobre un conjunto de datos de conversaciones financieras con preguntas de opción múltiple (MCQ) y un esquema de contexto aleatorio por párrafo (`pc_random`). No se proporcionan detalles sobre el número de tokens de entrenamiento, el tamaño del dataset, los hiperparámetros (learning rate, batch size, épocas) ni el proceso de preparación de datos. La ausencia de esta información impide evaluar la calidad del entrenamiento o reproducir el proceso.

## Capacidades

- Generación de texto y razonamiento conversacional: al estar basado en EXAONE 3.5, hereda la capacidad de mantener diálogos multi-turno y seguir instrucciones complejas.
- Razonamiento financiero: el fine-tuning específico sugiere una especialización en tareas de preguntas y respuestas sobre documentos financieros (estados de resultados, balances, etc.), probablemente en formato de opción múltiple.
- Procesamiento de contexto largo: soporta hasta 32.000 tokens, lo que permite analizar documentos extensos o conversaciones largas.
- Multilingüismo limitado: el modelo base está optimizado para coreano e inglés; el adapter no añade idiomas adicionales.
- No se confirma soporte para tool calling, function calling, agentes o modos de razonamiento explícito (thinking mode) en la documentación disponible.

## Casos de uso

- Análisis de estados financieros: el modelo puede recibir un balance o una cuenta de resultados en texto y responder preguntas concretas sobre variaciones, márgenes o partidas específicas, gracias a su fine-tuning en ConvFinQA.
- Asistente para analistas de inversión: integrado en un flujo de trabajo, puede resumir informes trimestrales y extraer métricas clave, reduciendo el tiempo de revisión manual.
- Soporte a auditoría interna: permite formular preguntas en lenguaje natural sobre transacciones o registros contables y obtener respuestas con referencias al contexto proporcionado.
- Generación de informes financieros resumidos: a partir de un conjunto de datos numéricos y textuales, el modelo puede redactar un resumen ejecutivo coherente.
- Educación financiera: utilizado como chatbot explicativo, puede responder dudas sobre conceptos contables o interpretación de ratios, siempre que se le proporcione el contexto adecuado.
- Automatización de extracción de datos: combinado con un sistema de parsing, puede convertir preguntas financieras en consultas estructuradas sobre bases de datos, aunque esta capacidad no está confirmada explícitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas de evaluación en la model card, y no se ha encontrado documentación adicional sobre el rendimiento del adapter en tareas financieras o generales. Se recomienda realizar una evaluación propia antes de su uso en producción.

## Requisitos de hardware

- El modelo base EXAONE-3.5-7.8B-Instruct requiere aproximadamente 16 GB de VRAM en precisión fp16 para inferencia. Con cuantización a 8 bits (bitsandbytes) se puede reducir a unos 8-10 GB, y a 4 bits a unos 5-6 GB.
- El adapter LoRA en sí ocupa solo 0,3 GB en disco, pero debe cargarse junto con el modelo base, por lo que los requisitos de memoria son los del modelo base más el overhead del adapter.
- GPU recomendadas: para inferencia en fp16, una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) es suficiente. Con cuantización, una RTX 3080/3090 (10-24 GB) puede ser viable.
- Opciones de despliegue: al ser un adapter PEFT, se puede cargar con la librería `peft` de HuggingFace junto con `transformers`. También es posible exportarlo a GGUF para usarlo con llama.cpp u Ollama, aunque el proceso no está documentado para este adapter concreto.
- No se dispone de datos de latencia o throughput para este adapter específico. Como referencia, el modelo base 7.8B en una A100 suele generar entre 20 y 40 tokens por segundo en fp16, dependiendo de la implementación.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El adapter es específico para una tarea (finanzas conversacionales) y no existen otros adapters del mismo autor con documentación pública que permitan contrastar resultados. Como referencia, se puede comparar con el modelo base sin fine-tuning:

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| EXAONE-3.5-7.8B-Instruct (base) | 7.800 M | 32.000 | Generalista (coreano/inglés) | Licencia EXAONE |
| Este adapter LoRA sobre el base | No disponible | 32.000 | Finanzas conversacionales (MCQ) | No disponible |
| Otros adapters del mismo autor (p.ej. EXAONE-3.5-7.8B-Instruct-ConvFinQA-SFT-DPO-CoT-v2) | No disponible | 32.000 | Finanzas con CoT y DPO | No disponible |

No se han publicado benchmarks comparativos entre estos adapters.

## Limitaciones y advertencias

- Documentación ausente: la model card está vacía en todos los campos relevantes (datos de entrenamiento, hiperparámetros, evaluación). Esto impide conocer el alcance exacto del fine-tuning y sus limitaciones.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o inventar datos financieros si el contexto no es claro o si la pregunta excede el conocimiento adquirido.
- Sesgos potenciales: el entrenamiento sobre datos financieros puede introducir sesgos relacionados con el tipo de documentos utilizados (por ejemplo, empresas grandes vs. pequeñas, sectores específicos) y con el idioma predominante (coreano o inglés).
- Dependencia del modelo base: el adapter hereda las limitaciones de EXAONE 3.5, incluyendo posibles errores en razonamiento numérico complejo o en contextos muy extensos.
- Licencia incierta: al no especificarse la licencia del adapter, no está claro si su uso comercial está permitido. Se debe consultar la licencia del modelo base y contactar con el autor para aclarar los términos.
- Tamaño del repositorio: 0,3 GB indica que solo se incluyen los pesos del adapter, no el modelo completo. Es necesario descargar el modelo base por separado, lo que añade complejidad al despliegue.
- Sin garantías de producción: al ser un modelo experimental sin evaluación publicada, no se recomienda su uso en entornos críticos sin una validación exhaustiva previa.

## Enlaces

- Repositorio del adapter: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed2026_step340
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Repositorio oficial de EXAONE 3.5: https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Paper técnico de EXAONE 3.5: https://arxiv.org/abs/2412.04862
- Otro adapter del mismo autor (referencia): https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-Instruct-ConvFinQA-SFT-DPO-CoT-v2
