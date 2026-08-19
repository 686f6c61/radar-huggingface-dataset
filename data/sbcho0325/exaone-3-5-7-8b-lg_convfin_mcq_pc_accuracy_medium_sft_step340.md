# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_medium_sft_step340

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) construido sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, publicado por el usuario sbcho0325 en Hugging Face. El adaptador ha sido entrenado mediante fine-tuning supervisado (SFT) con la librería TRL, y el nombre del repositorio sugiere que está orientado a tareas de conversación financiera (ConvFinQA) con preguntas de opción múltiple, probablemente para mejorar la precisión en este dominio específico. Aunque la model card no proporciona detalles sobre el proceso de entrenamiento ni los datos utilizados, el modelo base pertenece a la serie EXAONE 3.5 de LG AI, que destaca por su bilingüismo coreano-inglés y su soporte de contexto largo de hasta 32 000 tokens.

La relevancia de este adaptador radica en su enfoque eficiente: en lugar de ajustar los 7 800 millones de parámetros completos, emplea LoRA, lo que permite especializar el modelo con un coste computacional reducido y un tamaño de artefacto de solo 0,3 GB. Esto lo hace atractivo para equipos que necesitan adaptar un LLM a un dominio concreto (finanzas conversacionales) sin disponer de infraestructura masiva. No obstante, al ser un adaptador no oficial, carece de documentación técnica detallada y de resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | no disponible (el adaptador ocupa 0,3 GB en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32 000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano e ingles (heredados del modelo base) |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer del modelo EXAONE-3.5-7.8B-Instruct, que es un LLM bilingüe (coreano e inglés) de 7 800 millones de parámetros desarrollado por LG AI Research. El entrenamiento del adaptador se realizó mediante SFT (Supervised Fine-Tuning) utilizando la librería TRL de Hugging Face, y el repositorio indica que se empleó la técnica LoRA (PEFT). Sin embargo, no se especifican los hiperparámetros del entrenamiento (tasa de aprendizaje, número de épocas, tamaño del lote, etc.), ni la composición del dataset de entrenamiento. El nombre del repositorio sugiere que el conjunto de datos está relacionado con ConvFinQA, un benchmark de razonamiento financiero conversacional, y que el entrenamiento se centró en preguntas de opción múltiple con el objetivo de mejorar la precisión (pc_accuracy). No hay información sobre si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento conversacional, heredadas del modelo base EXAONE-3.5-7.8B-Instruct.
- Bilingüe en coreano e inglés, con soporte de contexto largo de hasta 32 000 tokens.
- Especialización en tareas de conversación financiera con preguntas de opción múltiple (según el nombre del repositorio).
- Soporte de tool calling y function calling: el modelo base EXAONE 3.5 lo incorpora, por lo que el adaptador lo hereda.
- Capacidad de agentes y razonamiento multi-paso, también heredada del modelo base.
- No se dispone de información sobre capacidades multimodales (visión, audio) ni sobre un modo de pensamiento explícito.

## Casos de uso

- Analisis de documentos financieros conversacionales: el adaptador puede procesar conversaciones que involucran datos de estados financieros, respondiendo preguntas de opción múltiple sobre ratios, tendencias o cifras concretas, gracias a su fine-tuning específico en ConvFinQA.
- Sistemas de preguntas y respuestas financieras: integrable en un chatbot que responda consultas sobre informes anuales, balances o cuentas de resultados, utilizando el contexto largo para manejar documentos extensos.
- Asistentes para analistas de inversión: ayuda a extraer información relevante de conversaciones sobre finanzas corporativas, reduciendo el tiempo de búsqueda manual en documentos.
- Educacion financiera interactiva: puede generar explicaciones y preguntas de opción múltiple para plataformas de aprendizaje, aprovechando su capacidad de razonamiento sobre datos numéricos.
- Automatizacion de consultas de atencion al cliente en banca: al estar afinado en conversaciones financieras, puede gestionar diálogos multi-turno sobre productos bancarios, siempre que se combine con un sistema de retrieval para datos actualizados.
- Prototipado de agentes financieros: sirve como base para experimentos de agentes que necesiten leer y razonar sobre información financiera estructurada, gracias a su soporte de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de evaluación, ni comparaciones con el modelo base o con otros adaptadores. Se desconoce si el adaptador mejora realmente la precisión en ConvFinQA o en otros conjuntos de datos.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware son los del modelo base EXAONE-3.5-7.8B-Instruct más un pequeño overhead por los pesos del adaptador.
- VRAM estimada para inferencia en fp16: ~16 GB (suficiente para una GPU como RTX 4090, A100 40 GB, etc.).
- Con cuantizacion de 8 bits: ~8 GB, ejecutable en GPUs de gama media como RTX 3080/3090.
- Con cuantizacion de 4 bits: ~4-5 GB, posible en GPUs de consumo como RTX 3060 o incluso en CPU con llama.cpp (si se convierte a GGUF).
- Opciones de despliegue: transformers + PEFT (cargar el adaptador sobre el modelo base), vLLM (si se convierte a un formato compatible), Ollama (requiere convertir a GGUF), o TGI (si se empaqueta correctamente).
- Latencia y throughput estimados: no disponibles. Dependen del hardware, la cuantización y el tamaño del batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_medium_sft_step340 (adaptador) | 7,8B (base) + LoRA | 32K | coreano, ingles | no disponible | Adaptador LoRA sin benchmarks publicados |
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct (base) | 7,8B | 32K | coreano, ingles | Licencia propia de LG AI (no comercial en algunos casos) | Modelo base con buen rendimiento en tareas bilingües |
| Qwen2.5-7B-Instruct | 7,6B | 32K (128K con YaRN) | multilingue | Apache 2.0 | Alternativa multilingüe con licencia permisiva |
| Llama-3.1-8B-Instruct | 8B | 128K | multilingue | Llama 3.1 Community License | Contexto muy largo, pero requiere más VRAM |

No se dispone de datos de rendimiento comparativo entre estos modelos y el adaptador, ya que el repositorio no incluye evaluaciones.

## Limitaciones y advertencias

- La model card del adaptador no proporciona información sobre sesgos, riesgos o limitaciones específicas; se heredan las del modelo base EXAONE-3.5-7.8B-Instruct.
- Riesgo de alucinacion: como cualquier LLM, puede generar respuestas incorrectas o inventar datos financieros, especialmente en contextos numéricos complejos. No debe usarse como fuente única de verdad en decisiones financieras.
- Limitaciones de idioma: el modelo base está entrenado principalmente en coreano e inglés; su rendimiento en otros idiomas puede ser deficiente.
- Licencia: el adaptador no declara licencia, y el modelo base EXAONE 3.5 tiene restricciones de uso comercial según los términos de LG AI. Se recomienda revisar la licencia del modelo base antes de cualquier uso en producción.
- Sin garantías de rendimiento: al no existir benchmarks, no se puede asegurar que el adaptador mejore realmente la precisión en tareas financieras. Es necesario validarlo con datos propios.
- El adaptador se entrenó con un paso específico (step340) y una configuración concreta (medium, accuracy); puede no generalizar bien fuera de ese dominio.
- No se proporcionan instrucciones de uso ni ejemplos de código en la model card, lo que dificulta su integración inmediata.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_medium_sft_step340
- Modelo base en Hugging Face: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Paper de EXAONE 3.5 (arXiv): https://arxiv.org/abs/2412.04862
- Repositorio oficial de EXAONE 3.5 en GitHub: https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Adaptador similar con semilla aleatoria: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed2026_step340
