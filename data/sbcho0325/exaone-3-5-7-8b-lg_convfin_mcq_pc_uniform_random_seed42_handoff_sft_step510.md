# sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_uniform_random_seed42_handoff_sft_step510

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo base `LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct`, desarrollado por LG AI Research. El adaptador, identificado como `EXAONE-3.5-7.8B-lg_convfin_mcq_pc_uniform_random_seed42_handoff_sft_step510`, parece orientado a tareas de conversación con preguntas de opción múltiple y handoff, aunque la model card del autor no proporciona detalles técnicos ni de uso. El modelo base es un transformer autoregresivo de 7.800 millones de parámetros con soporte de contexto de hasta 32.000 tokens, y forma parte de la serie EXAONE 3.5, diseñada para aplicaciones reales con distintas escalas (2.4B, 7.8B y 32B). Dado que la información del adaptador es mínima, esta ficha se centra en las características del modelo base y en lo que se puede inferir de la configuración del adaptador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (modelo base EXAONE 3.5) |
| Parametros totales | 7.8B (modelo base) + adaptador LoRA (tamano del repo: 0.3 GB) |
| Parametros activos | No aplicable (adaptador LoRA) |
| Longitud de contexto | 32.000 tokens (modelo base) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite cuantizaciones comunes (4-bit, 8-bit, etc.) |
| Idiomas soportados | No disponible (el modelo base es multilingue, aunque no se especifica en la model card del adaptador) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador y modelo base) |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) entrenado mediante supervisión fina (SFT) sobre el modelo base EXAONE 3.5 7.8B Instruct. No se ha publicado información sobre los hiperparámetros de entrenamiento, el dataset utilizado ni el procedimiento exacto. El nombre del adaptador sugiere que el entrenamiento se centró en conversaciones con preguntas de opción múltiple (mcq) y un componente de "handoff" (transferencia a otro sistema o humano). El modelo base EXAONE 3.5 se describe en el paper de LG AI Research como una familia de modelos instruidos con atención completa, entrenados con datos multilingües (principalmente coreano e inglés) y optimizados para tareas de razonamiento y uso general. No se dispone de detalles sobre la arquitectura interna exacta (número de capas, dimensión del modelo, etc.) más allá de los parámetros totales.

## Capacidades

- Generación de texto y conversación multi-turno, gracias al modelo base con instrucciones.
- Razonamiento y resolución de problemas en tareas de texto, aunque el alcance exacto del adaptador no está documentado.
- Soporte de contexto largo (32K tokens), lo que permite manejar conversaciones extensas o documentos largos.
- Capacidades multilingües del modelo base (coreano e inglés, según la documentación de LG).
- El adaptador podría estar especializado en tareas de elección múltiple (MCQ) y en la gestión de "handoff" (por ejemplo, derivar la conversación a un agente humano), pero no hay evidencia pública de ello.

## Casos de uso

- Atención al cliente automatizada: el modelo base con 32K de contexto puede gestionar conversaciones largas con múltiples turnos y transferir a un agente humano cuando sea necesario (posible función "handoff").
- Asistente virtual en coreano e inglés: gracias al entrenamiento en ambos idiomas del modelo base, puede atender consultas en estos idiomas.
- Análisis de documentos largos: con la ventana de 32K tokens, puede resumir o extraer información de documentos extensos.
- Generación de código y depuración: el modelo base tiene capacidades de código (aunque no se han publicado benchmarks específicos).
- Investigación académica: como adaptador LoRA, permite experimentar con técnicas de fine-tuning eficiente sobre un modelo de 7.8B sin necesidad de entrenar todos los parámetros.
- Prototipado de sistemas de diálogo: el adaptador, aunque sin documentación, puede servir para crear prototipos de chatbots con funciones específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este adaptador. Tampoco se dispone de resultados oficiales del modelo base en las fuentes consultadas, aunque el paper de EXAONE 3.5 reporta mejoras frente a su predecesor en tareas como MMLU, HumanEval y GSM8K, pero no se incluyen aquí por no estar disponibles en la información proporcionada.

## Requisitos de hardware

- El adaptador LoRA es ligero (0.3 GB) y se carga sobre el modelo base, que requiere alrededor de 15-16 GB de VRAM en precisión FP16.
- Para inferencia con cuantización (4-bit), se puede ejecutar en GPUs con 8-10 GB de VRAM, como RTX 4060 o RTX 3060.
- GPUs recomendadas: A100, H100, RTX 4090 para inferencia sin cuantizar; RTX 3090 o inferiores con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, o el propio stack de Hugging Face con PEFT.
- La latencia típica para un modelo de 7.8B en una GPU moderna es de decenas de milisegundos por token, pero no se tienen datos específicos para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| EXAONE 3.5 7.8B Instruct (base) | 7.8B | 32K | No especificada (uso no comercial según LG) | HuggingFace |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 (comercial con restricciones) | HuggingFace |
| Mistral 7B Instruct | 7.3B | 32K | Apache 2.0 | HuggingFace |
| Qwen 2.5 7B Instruct | 7.6B | 32K | Apache 2.0 | HuggingFace |

Nota: No se dispone de benchmarks comparativos entre estos modelos y el adaptador. La comparativa se limita a parámetros y contexto, y la licencia del adaptador no está definida.

## Limitaciones y advertencias

- La model card del adaptador está vacía, por lo que no hay información sobre el propósito exacto, el dataset de entrenamiento ni los resultados de evaluación.
- El modelo base EXAONE 3.5 tiene una licencia que no permite uso comercial (según la política de LG AI), aunque la licencia del adaptador no está especificada.
- No se ha verificado la robustez del modelo frente a sesgos o alucinaciones; es probable que herede los sesgos del modelo base.
- El adaptador puede estar sobreentrenado en tareas concretas (MCQ y handoff) y no generalizar bien fuera de ese dominio.
- No se han realizado pruebas de seguridad o de alineación con valores humanos en este adaptador.

## Enlaces

- [Adaptador en Hugging Face](https://huggingface.co/sbcho0325/EXAONE-3.5-7.8B-lg_convfin_mcq_pc_uniform_random_seed42_handoff_sft_step510)
- [Modelo base en Hugging Face](https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct)
- [Paper de EXAONE 3.5 (arXiv)](https://arxiv.org/html/2412.04862v3)
- [Repositorio oficial de EXAONE 3.5 en GitHub](https://github.com/LG-AI-EXAONE/EXAONE-3.5)
