# QWERTYasdgf/Qwen-4B-FirstAid-LLM

## Resumen

FirstAidLLM es un modelo de lenguaje especializado en instrucciones de primeros auxilios, desarrollado por el equipo DataMavericks de la Facultad de Ingeniería de la Universidad de Ruhuna (Sri Lanka). Se trata de un ajuste fino (fine-tuning) del modelo base Qwen3-4B, publicado en Hugging Face bajo el identificador QWERTYasdgf/Qwen-4B-FirstAid-LLM. El modelo está diseñado para responder de forma concisa, segura y fiable a preguntas relacionadas con emergencias médicas como atragantamientos, quemaduras o reanimación cardiopulmonar (RCP).

El ajuste se realizó mediante la técnica LoRA (Low-Rank Adaptation) combinada con cuantización de 4 bits, lo que reduce significativamente los requisitos de memoria GPU y facilita su despliegue en entornos con recursos limitados. El modelo se entrenó sobre el dataset FirstAidInstructionsDataset, que contiene pares de preguntas y respuestas categorizados por tipo de emergencia. Con aproximadamente 4 000 millones de parámetros, FirstAidLLM ofrece un equilibrio entre capacidad de razonamiento y eficiencia computacional, siendo adecuado para aplicaciones de asistencia médica de primera respuesta.

La relevancia de este modelo radica en su especialización en un dominio crítico donde la precisión y la claridad son esenciales. Aunque no sustituye el juicio médico profesional, puede servir como herramienta de apoyo en situaciones de emergencia, proporcionando instrucciones estandarizadas y basadas en evidencia. Su licencia Apache 2.0 permite uso comercial y modificación, lo que facilita su integración en productos y servicios de salud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-4B (transformers) con adaptadores LoRA |
| Parametros totales | 4 022 468 096 (4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3-4B) |
| Tipos de cuantizacion | 4-bit bnb (base), GGUF (según tags) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer denso de 4 000 millones de parámetros desarrollado por Alibaba Cloud. Sobre esta base se aplicó un ajuste fino con LoRA, una técnica de adaptación de bajo rango que solo entrena un pequeño subconjunto de parámetros adicionales, reduciendo el coste computacional y la memoria necesaria. La cuantización de 4 bits (bitsandbytes) se utilizó tanto en el modelo base como durante el entrenamiento, lo que permite ejecutar el proceso en GPUs con VRAM limitada.

El entrenamiento se realizó con el framework TRL SFTTrainer de Hugging Face, utilizando el dataset FirstAidInstructionsDataset, que contiene campos de pregunta, respuesta y categoría (por ejemplo, atragantamiento, RCP, quemaduras). No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. El proceso se llevó a cabo con PyTorch y Transformers, y el resultado es un modelo conversacional especializado en primeros auxilios.

## Capacidades

- Generación de texto especializada en instrucciones de primeros auxilios, con respuestas concisas y orientadas a la acción.
- Comprensión de preguntas en lenguaje natural sobre emergencias médicas comunes (atragantamiento, quemaduras, RCP, hemorragias, etc.).
- Capacidad conversacional multi-turno, aunque no se especifica si soporta contextos largos.
- Optimizado para bajo uso de memoria GPU gracias a la cuantización de 4 bits y LoRA.
- Compatible con Hugging Face Transformers, TRL SFTTrainer y text-generation-inference.
- Soporte de formato GGUF, lo que permite su uso con llama.cpp, Ollama y otros motores de inferencia locales.
- No se indica soporte para tool calling, agentes, visión o audio.

## Casos de uso

- Asistente de primeros auxilios en aplicaciones móviles: el modelo puede integrarse en apps de salud para proporcionar instrucciones paso a paso durante una emergencia, por ejemplo, cómo realizar la maniobra de Heimlich o vendar una herida.
- Chatbot de triaje en servicios de telemedicina: puede clasificar la urgencia de los síntomas descritos por el usuario y ofrecer recomendaciones iniciales antes de la intervención de un profesional.
- Formación y simulación de emergencias: utilizado en plataformas educativas para practicar protocolos de primeros auxilios mediante conversaciones simuladas con escenarios realistas.
- Soporte en centros de llamadas de emergencia: como herramienta de ayuda para operadores, sugiriendo respuestas estandarizadas y verificadas ante consultas frecuentes.
- Integración en dispositivos IoT de salud: desplegado en edge devices con recursos limitados, gracias a su tamaño reducido y cuantización, para ofrecer asistencia offline en zonas sin conectividad.
- Generación de contenido formativo: creación de manuales, guías o material didáctico sobre primeros auxilios adaptado a diferentes niveles de conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo. Tampoco se han encontrado comparaciones con otros modelos de primeros auxilios o con el Qwen3-4B base.

## Requisitos de hardware

- No se proporcionan datos específicos de VRAM en la documentación del modelo.
- Dado el tamaño de 4B parámetros y la cuantización de 4 bits, se estima que el modelo puede ejecutarse en GPUs consumer con al menos 6-8 GB de VRAM, aunque esta cifra es una estimación razonable basada en el tamaño y no en datos oficiales.
- El modelo es compatible con despliegue en AWS, SageMaker o entornos locales, según la model card.
- Formatos soportados: safetensors para Transformers y GGUF para motores como llama.cpp, Ollama o text-generation-inference.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el dominio de primeros auxilios. El modelo base Qwen3-4B es una alternativa generalista, pero no especializada. Otros modelos médicos como Med-PaLM 2 o BioGPT no son directamente comparables por tamaño o enfoque. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés, lo que limita su uso en entornos hispanohablantes sin traducción previa.
- No es un sustituto del criterio médico profesional; las respuestas deben ser validadas por personal sanitario antes de su uso en situaciones reales.
- Riesgo de alucinaciones: como todo LLM, puede generar instrucciones incorrectas o incompletas, especialmente en casos poco representados en el dataset de entrenamiento.
- El dataset de entrenamiento no está documentado en detalle; se desconoce su tamaño, cobertura de emergencias y posible sesgo hacia ciertos tipos de lesiones.
- No se han realizado evaluaciones de seguridad o sesgos; el modelo podría reflejar sesgos presentes en los datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero el usuario es responsable de garantizar la exactitud y seguridad de las respuestas en aplicaciones de salud.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QWERTYasdgf/Qwen-4B-FirstAid-LLM
- Dataset de entrenamiento: https://huggingface.co/datasets/lextale/FirstAidInstructionsDataset
- Repositorio GitHub relacionado: https://github.com/firstaid-llm/firstaid-llm
- Organización Qwen en Hugging Face: https://huggingface.co/Qwen
