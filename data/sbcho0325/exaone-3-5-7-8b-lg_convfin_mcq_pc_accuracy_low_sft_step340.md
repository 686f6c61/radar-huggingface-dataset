# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_low_sft_step340

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) basado en el modelo EXAONE-3.5-7.8B-Instruct de LG AI Research. El adaptador, identificado como `sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_low_sft_step340`, fue creado mediante fine-tuning con Supervised Fine-Tuning (SFT) y la librería PEFT. El nombre del adaptador sugiere un entrenamiento orientado a tareas de conversación financiera (posiblemente relacionado con el dataset ConvFinQA) y preguntas de opción múltiple, aunque no se proporciona documentación que lo confirme.

El modelo base EXAONE-3.5-7.8B-Instruct es un transformer denso de 7.8 mil millones de parámetros, desarrollado por LG AI Research, con soporte de contexto de hasta 32 000 tokens. Este adaptador LoRA añade una capa de ajuste específica para tareas concretas, manteniendo los pesos del modelo base congelados y solo actualizando los parámetros del adaptador. El repositorio tiene un tamaño de 0.3 GB, lo que corresponde únicamente a los pesos del adaptador, no al modelo completo.

La relevancia de este adaptador radica en su potencial para especializar un modelo generalista en dominios específicos, como el análisis de conversaciones financieras, sin necesidad de reentrenar el modelo completo. Sin embargo, la falta de documentación detallada y de métricas de evaluación limita su uso directo en producción sin una validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso (EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 7.8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No especificados para el adaptador; el modelo base admite cuantizaciones estándar (por ejemplo, 4-bit, 8-bit) |
| Idiomas soportados | No disponible (el modelo base EXAONE 3.5 soporta principalmente coreano e inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

El adaptador se construye sobre EXAONE-3.5-7.8B-Instruct, un modelo de lenguaje de tipo transformer denso con 7.8 mil millones de parámetros. El modelo base fue entrenado por LG AI Research con un enfoque en instrucciones y casos de uso reales, y soporta una ventana de contexto de 32 000 tokens. El adaptador utiliza la técnica LoRA, que introduce matrices de baja dimensión en las capas del transformer para ajustar el modelo a tareas específicas con un coste computacional reducido.

El entrenamiento del adaptador se realizó mediante Supervised Fine-Tuning (SFT), según los tags del repositorio (`sft`, `trl`). No se proporcionan detalles sobre el dataset de entrenamiento, los hiperparámetros, el número de pasos (aunque el nombre indica `step340`, sugiriendo 340 pasos de optimización) ni el régimen de precisión. El nombre del adaptador incluye referencias a `convfin` (posiblemente ConvFinQA, un dataset de razonamiento financiero conversacional) y `mcq` (preguntas de opción múltiple), lo que sugiere un fine-tuning orientado a esos dominios, pero esta interpretación no está confirmada por documentación oficial.

## Capacidades

- Generación de texto: el adaptador hereda la capacidad de generación de texto del modelo base EXAONE-3.5-7.8B-Instruct.
- Conversación multi-turno: el modelo base está optimizado para instrucciones y diálogos, y el adaptador podría mejorar el rendimiento en tareas conversacionales específicas, aunque no hay evidencia publicada.
- Razonamiento financiero (potencial): el nombre del adaptador sugiere un fine-tuning en tareas de conversación financiera, pero no se dispone de documentación que confirme esta capacidad.
- Preguntas de opción múltiple (potencial): la referencia a `mcq` en el nombre indica un posible entrenamiento en este tipo de tareas, sin confirmación.
- Soporte de tool calling: no disponible (no se menciona en la información del adaptador; el modelo base EXAONE 3.5 no destaca por tool calling en su documentación pública).
- Capacidades multilingües: no especificadas para el adaptador; el modelo base está principalmente orientado a coreano e inglés.

## Casos de uso

Dado que no se dispone de documentación específica del adaptador, los casos de uso son hipotéticos y se basan en las capacidades del modelo base y en las pistas del nombre:

- Análisis de conversaciones financieras: si el adaptador fue entrenado con ConvFinQA, podría utilizarse para responder preguntas sobre datos financieros en formato conversacional, por ejemplo, en asistentes de análisis de inversiones.
- Evaluación de comprensión lectora con opción múltiple: el adaptador podría aplicarse a tareas de exámenes o cuestionarios donde se requiere seleccionar la respuesta correcta entre varias opciones.
- Fine-tuning de demostración: sirve como ejemplo de cómo adaptar EXAONE-3.5-7.8B-Instruct a dominios específicos con LoRA, útil para investigadores que quieran replicar el proceso.
- Prototipado rápido: al ser un adaptador pequeño (0.3 GB), permite experimentar con especialización sin necesidad de recursos masivos.
- Investigación en adaptación de bajo rango: útil para estudiar el impacto de LoRA en tareas de razonamiento numérico y conversacional.
- Integración en pipelines de generación aumentada por recuperación (RAG): el modelo base puede combinarse con recuperación de documentos financieros para generar respuestas contextualizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación, y la model card no contiene datos de rendimiento. No se puede comparar cuantitativamente con otros modelos.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0.3 GB, pero para realizar inferencia se necesita cargar el modelo base EXAONE-3.5-7.8B-Instruct completo.
- VRAM estimada para el modelo base en precisión FP16: aproximadamente 16 GB (7.8B parámetros × 2 bytes). Con cuantización 4-bit, la VRAM se reduce a unos 5-6 GB.
- GPUs recomendadas: para FP16, una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB). Para cuantización 4-bit, una GPU con 8 GB puede ser suficiente (por ejemplo, RTX 3070, RTX 4060).
- Opciones de despliegue: el adaptador se puede cargar con la librería PEFT sobre el modelo base, y luego servir con frameworks como vLLM, TGI o llama.cpp (si se convierte a GGUF). También es compatible con Ollama si se empaqueta adecuadamente.
- Latencia y throughput: no disponibles para este adaptador específico; dependerán del hardware y del framework de inferencia.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros adaptadores LoRA similares. El adaptador es específico de un autor y no tiene documentación pública. Como referencia, el modelo base EXAONE-3.5-7.8B-Instruct se puede comparar con otros modelos de 7-8B como Llama 3.1 8B o Mistral 7B, pero el adaptador no modifica las capacidades generales del modelo base, solo las especializa en un dominio no confirmado. Por tanto, la comparativa se limita al modelo base, cuyos benchmarks se pueden consultar en el paper técnico de EXAONE 3.5 (arXiv:2412.04862).

## Limitaciones y advertencias

- Falta de documentación: la model card está vacía en su mayoría; no se especifican datos de entrenamiento, hiperparámetros, ni métricas de evaluación.
- Sesgos desconocidos: al no haber información sobre los datos de entrenamiento del adaptador, no se pueden identificar sesgos específicos. El modelo base EXAONE 3.5 puede tener sesgos derivados de su entrenamiento en coreano e inglés.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o no verificada, especialmente en dominios financieros donde la precisión es crítica.
- Licencia no especificada: el repositorio no indica la licencia, lo que impide conocer las restricciones de uso comercial o redistribución.
- Limitaciones de idioma: el modelo base está principalmente entrenado en coreano e inglés; el adaptador no añade soporte para otros idiomas.
- Uso en producción: sin validación externa, no se recomienda utilizar este adaptador en aplicaciones críticas sin una evaluación exhaustiva.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_low_sft_step340
- Modelo base EXAONE-3.5-7.8B-Instruct: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Paper técnico de EXAONE 3.5: https://arxiv.org/abs/2412.04862
- Repositorio oficial de EXAONE 3.5 en GitHub: https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Adaptador relacionado (variante con semilla aleatoria): https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_random_sft_seed2026_step340
- Adaptador con DPO (otra variante): https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-Instruct-ConvFinQA-SFT-DPO
