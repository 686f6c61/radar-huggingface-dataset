# kelsbeans/qwen3-1.7b-digestive-coach-n275-adapter

## Resumen

El modelo `kelsbeans/qwen3-1.7b-digestive-coach-n275-adapter` es un adaptador de tipo LoRA (o similar) construido sobre el modelo base `unsloth/qwen3-1.7b-unsloth-bnb-4bit`, una versión cuantizada a 4 bits de Qwen3-1.7B, desarrollado por Alibaba Cloud. El autor, `kelsbeans`, lo ha publicado en HuggingFace con licencia Apache 2.0 y está orientado a la generación de texto en inglés. El nombre del repositorio sugiere que el adaptador está especializado en el ámbito de la salud digestiva, probablemente para actuar como un "coach" o asistente de consultas sobre digestión, aunque la model card no proporciona detalles funcionales concretos.

La relevancia de este modelo radica en que demuestra el flujo típico de fine-tuning con Unsloth y TRL sobre un modelo pequeño (1.7B parámetros) que puede ejecutarse en hardware de consumo. Al ser un adaptador, no incluye los pesos completos del modelo base, sino solo las actualizaciones de pesos, lo que reduce significativamente el tamaño (0.1 GB). La licencia Apache-2.0 permite uso comercial sin restricciones, lo que lo hace atractivo para integraciones en productos de salud o bienestar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-1.7B (transformer decoder) |
| Parametros totales | no disponible (solo adaptador; el base tiene 1.7B) |
| Parametros activos | no disponible (solo adaptador, no es MoE) |
| Longitud de contexto | no disponible (el base Qwen3-1.7B soporta 128K, pero el adaptador no especifica) |
| Tipos de cuantizacion | El modelo base usa bnb-4bit; el adaptador se entrega en safetensors |
| Idiomas soportados | en (según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador) |

## Arquitectura y entrenamiento

El adaptador se ha entrenado sobre `unsloth/qwen3-1.7b-unsloth-bnb-4bit`, una versión de Qwen3-1.7B cuantizada a 4 bits mediante bitsandbytes y optimizada con Unsloth para acelerar el entrenamiento. Qwen3-1.7B es un modelo transformer decoder-only con atención causal estándar, entrenado por Alibaba Cloud con un enfoque en razonamiento, generación de código y comprensión multilingüe (aunque el adaptador se limita al inglés). El entrenamiento se realizó con la librería TRL (Transformers Reinforcement Learning) de HuggingFace, pero no se especifica el dataset, el número de pasos ni el método de optimización (posiblemente SFT, DPO, etc.). El identificador "n275" en el nombre probablemente indica el número de pasos o épocas, pero no está confirmado.

No se publican detalles sobre el dataset de entrenamiento ni sobre la técnica de fine-tuning (si fue supervisado, con RLHF, etc.). Al ser un adaptador LoRA, solo se actualizaron una fracción de los pesos, lo que reduce el coste computacional y el riesgo de olvido catastrófico.

## Capacidades

- Generación de texto en inglés, específicamente orientada al dominio de salud digestiva (según el nombre del modelo, aunque no hay confirmación en la documentación).
- Razonamiento y comprensión de lenguaje natural heredado del modelo base Qwen3-1.7B, que incluye capacidades de instrucción y seguimiento de contexto.
- No se especifica soporte para tool calling, agentes ni razonamiento multi-paso en la model card.
- Capacidad multilingüe del base (Qwen3 soporta varios idiomas), pero el adaptador declara solo inglés.
- No hay evidencia de capacidades especiales como thinking mode, visión o audio.

## Casos de uso

- Asistente de salud digestiva: el modelo puede responder preguntas sobre síntomas digestivos, recomendaciones de dieta o hábitos alimentarios. Dado su tamaño (1.7B) y cuantización 4-bit, es adecuado para dispositivos con recursos limitados (móviles, edge).
- Chatbot de bienestar en aplicaciones de salud: integrado en una aplicación móvil para dar consejos básicos sobre digestión, siempre con la advertencia de que no sustituye a un profesional médico.
- Generación de contenido educativo: redacción de artículos o respuestas informativas sobre temas digestivos, por ejemplo, para blogs o FAQs de clínicas.
- Asistente en telemedicina: pre-triaje de pacientes que describen síntomas digestivos, ayudando a clasificar urgencias.
- Entrenamiento de modelos más grandes: el adaptador puede servir como punto de partida para fine-tuning adicional sobre un dominio específico.
- Investigación académica: estudiar el comportamiento de adaptadores LoRA en dominios de salud con modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas para este adaptador específico. El modelo base Qwen3-1.7B tiene benchmarks conocidos, pero no aplican directamente al adaptador.

## Requisitos de hardware

- Al ser un adaptador LoRA, requiere el modelo base cuantizado de 4 bits. El tamaño del modelo base es de aproximadamente 1.7B parámetros en 4 bits, lo que ocupa alrededor de 1.0 GB en VRAM.
- Puede ejecutarse en GPUs de consumo como NVIDIA GTX 1060 (6 GB), RTX 2060, RTX 3060, RTX 4090, o incluso en CPU con suficiente RAM (8-16 GB).
- Para inferencia, se puede usar `transformers` con `bitsandbytes` para cargar el modelo base cuantizado, o usar `llama.cpp` / `Ollama` si se convierte a GGUF.
- El adaptador se puede cargar en memoria junto con el base; la VRAM total necesaria es la del base más unos pocos cientos de MB para el adaptador.
- Latencia estimada: en una RTX 4090, la generación de 100 tokens puede tardar ~2-3 segundos; en CPU, ~10-20 segundos.
- Opciones de despliegue: vLLM, TGI (Text Generation Inference), Hugging Face Inference Endpoints, o frameworks como `peft` para carga directa.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros adaptadores de salud digestiva. Sin embargo, se puede comparar con el modelo base y con otros modelos pequeños de salud:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-1.7B (base) | 1.7B | 128K | Apache-2.0 | HuggingFace |
| `kelsbeans/qwen3-1.7b-digestive-coach-n275-adapter` | Adaptador sobre 1.7B | no disponible | Apache-2.0 | HuggingFace |
| Llama-3.2-1B | 1.0B | 128K | Llama 3.2 Community License | HuggingFace |

No se dispone de datos de rendimiento específicos del adaptador, por lo que la comparación es limitada.

## Limitaciones y advertencias

- No hay información sobre el conjunto de entrenamiento ni sobre posibles sesgos en el dominio de salud digestiva. El modelo puede generar consejos médicos incorrectos o peligrosos; nunca debe usarse como sustituto de un profesional sanitario.
- Riesgo de alucinación: como todos los LLM, puede inventar datos sobre enfermedades, tratamientos o interacciones farmacológicas.
- Limitación de idioma: solo se declara inglés; el modelo puede no funcionar bien en otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero no se garantiza la exactitud médica ni se exime de responsabilidad.
- El adaptador no incluye el modelo base completo; para usarlo, se debe descargar el base `unsloth/qwen3-1.7b-unsloth-bnb-4bit` por separado, lo que añade complejidad al despliegue.
- No se ha verificado la calidad del ajuste; el nombre "digestive-coach" no está respaldado por ninguna evaluación publicada.

## Enlaces

- [HuggingFace del adaptador](https://huggingface.co/kelsbeans/qwen3-1.7b-digestive-coach-n275-adapter)
- [Modelo base en HuggingFace](https://huggingface.co/unsloth/qwen3-1.7b-unsloth-bnb-4bit)
- [Repositorio de Qwen3](https://github.com/QwenLM/Qwen3)
- [Unsloth](https://github.com/unslothai/unsloth)
- [TRL](https://github.com/huggingface/trl)
