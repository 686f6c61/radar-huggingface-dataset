# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed42_step170

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base **LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct**, un modelo de lenguaje de 7.800 millones de parámetros desarrollado por LG AI Research. El adaptador, identificado como `lg_convfin_mcq_pc_random_sft_seed42_step170`, ha sido afinado mediante *supervised fine-tuning* (SFT) con el framework TRL de Hugging Face, aparentemente orientado a tareas de conversación financiera (el nombre sugiere "conversational finance" y "multiple choice questions"). Sin embargo, la model card no proporciona detalles sobre los datos de entrenamiento, el proceso o los resultados.

La relevancia de este adaptador radica en que permite especializar un modelo generalista de 7.8B en dominios financieros concretos sin necesidad de reentrenar el modelo completo, reduciendo costes computacionales y de almacenamiento. No obstante, al ser un adaptador recién publicado (agosto de 2026) y sin documentación técnica, su utilidad práctica queda limitada a la evaluación por parte de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base) + adaptador LoRA |
| Parametros totales | 7.800 millones (modelo base) + parámetros del adaptador (no disponibles) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | No disponibles para el adaptador; el modelo base soporta cuantización estándar (FP16, BF16, INT8, INT4) |
| Idiomas soportados | Coreano e inglés (heredados del modelo base) |
| Licencia | No disponible para el adaptador; el modelo base tiene licencia propia de LG (no especificada en la información proporcionada) |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer del modelo EXAONE-3.5-7.8B-Instruct, que emplea *attention* estándar con soporte para ventanas de contexto de hasta 32K tokens. El adaptador LoRA introduce matrices de bajo rango en las capas de atención y feed-forward, permitiendo un ajuste eficiente con un número reducido de parámetros entrenables. El entrenamiento se realizó mediante *supervised fine-tuning* (SFT) usando la librería TRL, con una semilla fija (seed 42) y 170 pasos de optimización, según el nombre del repositorio.

No se dispone de información sobre la composición del dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas adicionales como RLHF o DPO. La model card no incluye hiperparámetros ni detalles del procedimiento.

## Capacidades

- Generación de texto en coreano e inglés, con razonamiento y comprensión contextual (heredado del modelo base).
- Soporte de *tool calling* y *function calling* (capacidad del modelo base EXAONE-3.5).
- Capacidades de agente y razonamiento multi-paso (según la documentación del modelo base).
- El adaptador está diseñado para tareas de conversación financiera, aunque no hay evidencia publicada de su rendimiento en este dominio.
- No se han documentado capacidades específicas adicionales (visión, audio, etc.) para este adaptador.

## Casos de uso

Dado que la información disponible es limitada, los casos de uso se plantean como hipótesis razonables basadas en el nombre del adaptador y las capacidades del modelo base:

- Análisis de conversaciones financieras: el adaptador podría utilizarse para extraer información relevante de diálogos entre clientes y agentes bancarios, gracias a su ajuste en datos de conversación financiera.
- Respuesta a preguntas de opción múltiple (MCQ) sobre finanzas: el sufijo "mcq" sugiere entrenamiento en preguntas de elección múltiple, útil para exámenes de certificación financiera o evaluación de conocimiento.
- Clasificación de intenciones en atención al cliente: el modelo base puede realizar *function calling*, y el adaptador podría refinar la comprensión de consultas financieras específicas.
- Generación de resúmenes de informes financieros: con su contexto de 32K tokens, puede procesar documentos extensos y generar resúmenes concisos.
- Asistente virtual para asesoramiento financiero básico: el modelo base ya es competente en conversación; el adaptador podría mejorar la precisión en terminología financiera.
- Extracción de entidades financieras (nombres de empresas, montos, fechas) mediante *prompt engineering* y *tool calling*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas del adaptador. El modelo base EXAONE-3.5-7.8B-Instruct reporta buenos resultados en tareas bilingües (coreano-inglés) y razonamiento, pero estos datos no son directamente atribuibles al adaptador.

## Requisitos de hardware

- Para cargar el modelo base (7.8B) en FP16 se requieren aproximadamente 15-16 GB de VRAM. Con cuantización INT8, unos 8 GB; con INT4, unos 4-5 GB.
- El adaptador LoRA añade un overhead mínimo (menos de 1 GB).
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB) para FP16, o GPUs con 8-12 GB para cuantización.
- El despliegue puede realizarse con vLLM, llama.cpp (si se convierte el adaptador a GGUF), Ollama o Hugging Face TGI, siempre que se cargue el modelo base junto con el adaptador.
- Latencia y throughput no disponibles; dependen del hardware y la configuración de cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| EXAONE-3.5-7.8B-Instruct (base) | 7.8B | 32K | Licencia LG (no especificada) | Modelo base sin adaptador |
| Adaptador LoRA (este repo) | 7.8B + LoRA | 32K | No disponible | Especialización financiera sin documentar |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | Alternativa generalista con mayor contexto |
| Qwen 2.5 7B Instruct | 7.6B | 128K | Apache 2.0 | Alternativa con licencia permisiva |

No se dispone de datos de rendimiento comparativos entre estos modelos y el adaptador.

## Limitaciones y advertencias

- La model card del adaptador está completamente vacía; no hay información sobre datos de entrenamiento, metodología ni evaluación.
- No se puede garantizar la calidad o la seguridad del adaptador para uso en producción sin una evaluación independiente.
- El modelo base EXAONE-3.5 puede presentar sesgos lingüísticos o culturales derivados de su entrenamiento en coreano e inglés.
- Riesgo de alucinación en dominios financieros si el adaptador no ha sido entrenado con datos suficientes y diversos.
- La licencia del adaptador no está especificada; se debe contactar con el autor para aclarar los términos de uso comercial.
- El adaptador está pensado para ser usado junto con el modelo base; no funciona de forma autónoma.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed42_step170
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Repositorio oficial de EXAONE 3.5: https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Paper de EXAONE 3.5: https://arxiv.org/html/2412.04862v3
