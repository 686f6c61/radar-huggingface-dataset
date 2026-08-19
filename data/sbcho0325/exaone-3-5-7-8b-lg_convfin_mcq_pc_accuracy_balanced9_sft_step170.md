# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_balanced9_sft_step170

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante fine-tuning supervisado (SFT) sobre el modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct, desarrollado por LG AI Research. El adaptador, publicado por el usuario sbcho0325, está diseñado para tareas de respuesta a preguntas financieras conversacionales con formato de opción múltiple (MCQ), probablemente basado en el dataset ConvFinQA. El nombre del repositorio sugiere un entrenamiento orientado a mejorar la precisión en un subconjunto balanceado de preguntas.

El modelo base EXAONE-3.5-7.8B-Instruct es un transformer de 7.8 mil millones de parámetros con soporte de contexto de hasta 32.000 tokens, bilingüe coreano-inglés, optimizado para casos de uso reales. Este adaptador LoRA permite especializar el modelo general en un dominio específico (finanzas conversacionales) sin necesidad de ajustar todos los parámetros, lo que reduce significativamente los requisitos de cómputo y almacenamiento.

La relevancia de este modelo radica en su capacidad para adaptar un LLM de alto rendimiento a una tarea vertical con un coste mínimo, demostrando la viabilidad de la personalización mediante técnicas PEFT (Parameter-Efficient Fine-Tuning). Sin embargo, la documentación proporcionada es muy limitada y no se han publicado resultados de evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer (EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | No disponible (el adaptador ocupa 0.3 GB, el base tiene 7.8B) |
| Parametros activos | No disponible (el adaptador es de bajo rango, no MoE) |
| Longitud de contexto | 32.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, el base puede cuantizarse) |
| Idiomas soportados | No disponible (el modelo base soporta coreano e inglés) |
| Licencia | No disponible (la licencia del modelo base EXAONE-3.5 es de LG AI Research) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base EXAONE-3.5-7.8B-Instruct es un transformer decoder-only con arquitectura estándar, entrenado con instrucciones y optimizado para tareas de conversación y razonamiento. Según el paper de EXAONE 3.5, los modelos de la serie soportan contextos largos de hasta 32.000 tokens y están entrenados con datos bilingües (coreano e inglés). El adaptador LoRA añade matrices de bajo rango a las capas de atención y feed-forward, permitiendo un fine-tuning eficiente.

El entrenamiento del adaptador se realizó mediante SFT (supervised fine-tuning) sobre un dataset cuyo nombre sugiere preguntas de opción múltiple sobre finanzas conversacionales (probablemente ConvFinQA, un benchmark de razonamiento financiero conversacional). El término "accuracy_balanced9" podría indicar un balanceo de clases o un subconjunto específico de datos. No se dispone de detalles sobre hiperparámetros, número de pasos (aunque el nombre incluye "step170"), ni composición exacta del dataset.

## Capacidades

- Generación de texto y respuesta a preguntas en formato conversacional.
- Razonamiento sobre datos financieros y numéricos, gracias al fine-tuning en ConvFinQA.
- Soporte de opción múltiple (MCQ), lo que permite su uso en sistemas de evaluación automática.
- Capacidades multilingües limitadas al coreano e inglés (heredadas del base).
- No se ha documentado soporte para tool calling, agentes o visión.

## Casos de uso

- Atención al cliente financiera automatizada: el modelo puede gestionar consultas de clientes sobre productos bancarios, estados de cuenta o inversiones, respondiendo con opciones múltiples cuando sea necesario.
- Análisis de documentos financieros: dado su entrenamiento en ConvFinQA, puede extraer información de tablas y textos financieros y responder preguntas de opción múltiple sobre ellos.
- Sistemas de tutoría en educación financiera: puede generar preguntas y respuestas de opción múltiple para plataformas de aprendizaje.
- Evaluación automatizada de comprensión lectora financiera: útil para crear exámenes o tests adaptativos.
- Chatbots especializados en banca: integración en sistemas de atención al cliente para resolver dudas sobre productos financieros.
- Investigación académica: como base para experimentos de fine-tuning eficiente en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no ha incluido métricas de evaluación en la model card, y no se encontraron referencias externas a este adaptador específico.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.3 GB), pero la inferencia requiere cargar el modelo base de 7.8B parámetros.
- Con cuantización de 4 bits (GPTQ o AWQ), se puede ejecutar en GPUs con 8-12 GB de VRAM, como una RTX 3060 o RTX 4070.
- Con precisión FP16, se necesitan al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con transformers + PEFT.
- El throughput dependerá de la GPU; en una A100 se pueden obtener decenas de tokens por segundo, pero no hay datos específicos para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia |
|---|---|---|---|---|
| sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_balanced9_sft_step170 (este) | 7.8B (base) | 32K | QA financiera conversacional MCQ | No disponible |
| sbcho0325/EXAONE-3.5-7.8B-Instruct-ConvFinQA-SFT-DPO | 7.8B (base) | 32K | QA financiera conversacional (SFT+DPO) | No disponible |
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct (base) | 7.8B | 32K | Generalista bilingüe | Licencia propia de LG |

El adaptador es similar a otros del mismo autor, que parecen explorar distintas estrategias de entrenamiento (SFT, DPO, variaciones de datos). No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- La documentación es insuficiente: no se especifican datos de entrenamiento, hiperparámetros ni resultados de evaluación.
- El adaptador está especializado en un dominio concreto (finanzas conversacionales MCQ) y puede degradar el rendimiento en tareas generales.
- No se conocen los sesgos potenciales del dataset de entrenamiento, que podría contener información financiera sensible o desequilibrios.
- Riesgo de alucinación en respuestas numéricas o financieras, especialmente si el contexto no es suficiente.
- La licencia del adaptador no está especificada; el modelo base tiene restricciones de uso comercial que deben revisarse.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un experimento personal sin validación externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_balanced9_sft_step170
- Repositorio oficial de EXAONE-3.5 (GitHub): https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Paper de EXAONE 3.5 (arXiv): https://arxiv.org/html/2412.04862v3
