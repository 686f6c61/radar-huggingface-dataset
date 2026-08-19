# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_low_sft_step170

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario sbcho0325, que fine-tunea el modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct mediante supervisión (SFT) para tareas de conversación financiera y preguntas de opción múltiple (MCQ). El nombre del repositorio sugiere un entrenamiento orientado a mejorar la precisión en contextos de baja exactitud ("pc_accuracy_low"), probablemente un experimento de ajuste fino con un dataset específico de finanzas. El repositorio contiene únicamente los pesos del adaptador (0,3 GB), no el modelo completo, y se distribuye en formato PEFT con safetensors.

La relevancia de este modelo radica en que demuestra cómo adaptar un modelo de 7.800 millones de parámetros a un dominio vertical (finanzas) con un coste computacional reducido, utilizando técnicas de fine-tuning eficiente. Sin embargo, la model card está completamente vacía, sin información sobre el dataset de entrenamiento, hiperparámetros, licencia o rendimiento, lo que limita su uso en producción sin una evaluación adicional. El modelo base EXAONE-3.5-7.8B-Instruct, desarrollado por LG AI Research, es un transformer decoder-only con soporte de contexto de hasta 32.000 tokens, diseñado para aplicaciones reales multilingües (principalmente coreano e inglés).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (EXAONE-3.5-7.8B-Instruct) |
| Parametros totales | No disponible (el adaptador LoRA añade un número reducido de parámetros; el modelo base tiene 7.800 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se puede combinar con cuantizaciones del base, p. ej. 4-bit, 8-bit) |
| Idiomas soportados | No disponible (el modelo base soporta principalmente coreano e inglés; el adaptador puede heredar esta capacidad) |
| Licencia | No disponible (el modelo base EXAONE-3.5 tiene su propia licencia; la del adaptador no se especifica) |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA, que congela los pesos del modelo base e inyecta matrices de baja dimensión en las capas de atención y feed-forward. Esto permite fine-tuning con un número reducido de parámetros entrenables y menor uso de memoria. El modelo base, EXAONE-3.5-7.8B-Instruct, es un transformer decoder-only con 7.800 millones de parámetros, entrenado por LG AI Research con un enfoque en instrucciones y casos de uso reales. Según el paper técnico, el modelo base fue entrenado con datos multilingües y optimizado para seguir instrucciones complejas, con soporte de contexto largo de 32K tokens.

El entrenamiento del adaptador se realizó mediante SFT (supervised fine-tuning) utilizando las librerías PEFT 0.19.1, transformers y TRL. No se proporcionan detalles sobre el dataset, el número de pasos, la tasa de aprendizaje ni el régimen de precisión. El nombre del repositorio sugiere que el entrenamiento se centró en conversaciones financieras y preguntas de opción múltiple, posiblemente con un objetivo de precisión en escenarios de baja exactitud, pero no hay confirmación oficial.

## Capacidades

- Generación de texto y conversación: hereda las capacidades del modelo base EXAONE-3.5-7.8B-Instruct, incluyendo generación de respuestas coherentes y seguimiento de instrucciones.
- Razonamiento y conocimiento general: el modelo base está entrenado para tareas de razonamiento, matemáticas y conocimiento enciclopédico, por lo que el adaptador conserva estas habilidades.
- Especialización en finanzas: el fine-tuning con datos de conversación financiera y MCQ debería mejorar el rendimiento en dominios como análisis de estados financieros, terminología bancaria, preguntas sobre inversiones, etc.
- Preguntas de opción múltiple (MCQ): el entrenamiento específico sugiere una capacidad mejorada para responder preguntas con opciones, probablemente en contextos financieros.
- Multilingüismo: el modelo base soporta coreano e inglés; el adaptador puede heredar esta capacidad, aunque no se especifica.
- Tool calling y agentes: no hay información específica, pero el modelo base EXAONE-3.5-Instruct tiene soporte para function calling según la documentación oficial; el adaptador no debería eliminarlo.

## Casos de uso

- Atención al cliente financiera: el adaptador puede gestionar consultas de clientes sobre productos bancarios, seguros o inversiones, manteniendo conversaciones multi-turno con contexto de hasta 32K tokens, lo que permite manejar historiales largos.
- Evaluación de conocimiento financiero: dado su entrenamiento en MCQ, puede utilizarse para generar o responder exámenes de certificación financiera (p. ej., CFA, asesores financieros) o para crear cuestionarios automatizados.
- Análisis de documentos financieros: con el contexto largo, puede resumir informes anuales, extractos bancarios o noticias económicas, extrayendo métricas clave y respondiendo preguntas específicas.
- Asistente de inversión personal: puede ayudar a usuarios a entender opciones de inversión, comparar productos y explicar riesgos, aunque requiere supervisión humana por el riesgo de alucinación.
- Generación de informes financieros: puede redactar borradores de informes de análisis, resúmenes de mercado o comunicados internos, basándose en datos proporcionados en el prompt.
- Fine-tuning adicional: al ser un adaptador LoRA, puede servir como punto de partida para nuevos fine-tunings en dominios relacionados, reduciendo el coste computacional frente a entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación, y la model card no proporciona datos de rendimiento. El modelo base EXAONE-3.5-7.8B-Instruct reporta resultados en benchmarks como MMLU, HumanEval y otros en el paper técnico, pero estos no son aplicables directamente al adaptador sin una evaluación específica.

## Requisitos de hardware

- El adaptador LoRA añade una sobrecarga mínima de memoria (menos de 1 GB en la mayoría de los casos), por lo que los requisitos dependen principalmente del modelo base.
- El modelo base EXAONE-3.5-7.8B-Instruct en FP16 requiere aproximadamente 16 GB de VRAM para inferencia. Con cuantización 8-bit, se reduce a unos 8 GB; con 4-bit, a unos 5 GB.
- GPU recomendadas: para FP16, una NVIDIA A100 (40 GB) o RTX 4090 (24 GB) son suficientes. Para cuantización 4-bit, una RTX 3060 (12 GB) o RTX 4070 (12 GB) pueden funcionar.
- El adaptador se puede cargar junto con el base cuantizado, lo que permite ejecutarlo en GPUs de consumo medio.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con transformers y PEFT. Para producción, vLLM ofrece mayor throughput.
- Latencia y throughput: no hay datos específicos para este adaptador. Con el base en FP16 en una A100, se espera una latencia de ~20-40 ms por token y un throughput de ~50-100 tokens/s, dependiendo de la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_low_sft_step170 (este) | 7.8B (base) + LoRA | 32K | No disponible | HuggingFace (adapter) |
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct (base) | 7.8B | 32K | Licencia EXAONE (uso comercial permitido con restricciones) | HuggingFace |
| Qwen2.5-7B-Instruct | 7.6B | 32K | Apache 2.0 | HuggingFace |
| Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | HuggingFace |

La comparativa se centra en el modelo base y alternativas de tamaño similar. El adaptador no tiene competidores directos conocidos en el mismo dominio (finanzas + MCQ) con la misma configuración. La principal diferencia es que este adaptador está especializado, pero carece de documentación y benchmarks, mientras que los modelos base ofrecen garantías de calidad y soporte.

## Limitaciones y advertencias

- La model card está vacía: no hay información sobre el dataset de entrenamiento, los hiperparámetros, el proceso de evaluación ni la licencia. Esto impide verificar la calidad del fine-tuning y su idoneidad para producción.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios financieros donde la precisión es crítica. Se recomienda validación humana.
- Sesgos del dataset: al no conocer el dataset de entrenamiento, no se pueden evaluar posibles sesgos (género, etnia, idioma, etc.). El modelo base ya tiene sesgos inherentes.
- Licencia no especificada: el uso comercial del adaptador es incierto. La licencia del modelo base EXAONE-3.5 permite uso comercial con ciertas restricciones (requiere atribución y no permite uso militar), pero la del adaptador no se declara.
- Limitaciones de idioma: el modelo base está optimizado para coreano e inglés; el rendimiento en otros idiomas puede ser deficiente.
- Sin soporte oficial: al ser un modelo de un usuario individual, no hay garantías de mantenimiento, actualizaciones o corrección de errores.
- El adaptador está diseñado para tareas específicas (conversación financiera y MCQ); su uso fuera de estos dominios puede degradar el rendimiento respecto al base.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_accuracy_low_sft_step170
- Modelo base EXAONE-3.5-7.8B-Instruct: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Paper técnico EXAONE 3.5: https://arxiv.org/abs/2412.04862
- Repositorio oficial de EXAONE 3.5 en GitHub: https://github.com/LG-AI-EXAONE/EXAONE-3.5
