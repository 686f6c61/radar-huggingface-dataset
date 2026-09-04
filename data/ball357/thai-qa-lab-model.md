# ball357/thai-qa-lab-model

## Resumen

El modelo `ball357/thai-qa-lab-model` es un fine-tune de GPT-2 realizado por el desarrollador `ball357` para tareas de preguntas y respuestas en tailandés, específicamente sobre un conjunto de datos de enfermedades denominado `disease_3000`, que contiene 3.000 pares de preguntas y respuestas. Se trata de un modelo de generación de texto con arquitectura decoder-only transformer, con un total de 124.449.024 parámetros (equivalente al tamaño de GPT-2 small). El modelo se publica bajo licencia MIT y está disponible en formato `safetensors`, con soporte únicamente para el idioma tailandés (código `th`). Su relevancia radica en ser un ejemplo de adaptación de un modelo pequeño y ligero a un dominio específico (salud/enfermedades) en un idioma con pocos recursos, lo que lo hace útil para prototipos y sistemas de consulta en tailandés. No obstante, al ser un proyecto de estudiante, la información sobre entrenamiento y evaluación es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (decoder-only transformer) |
| Parametros totales | 124.449.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Tailandés (th) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder-only con mecanismo de atención causal. No se dispone de información detallada sobre el número de capas, cabezas de atención ni dimensiones ocultas en la model card, pero el número de parámetros (124.449.024) coincide con el de GPT-2 small (124 millones). El entrenamiento consistió en un fine-tune sobre el dataset `disease_3000`, compuesto por 3.000 pares de preguntas y respuestas sobre enfermedades en tailandés. No se especifican hiperparámetros de entrenamiento (tasa de aprendizaje, épocas, tamaño de lote), ni se menciona el uso de técnicas como RLHF o DPO. Tampoco se detalla el preprocesamiento ni la composición exacta del dataset. No se han documentado innovaciones técnicas destacables; es un fine-tune estándar sobre un modelo preentrenado.

## Capacidades

- Generación de texto en tailandés, orientada a tareas de preguntas y respuestas sobre enfermedades.
- Respuestas cortas y directas basadas en el dominio específico del dataset de entrenamiento.
- Soporte de contexto en tailandés limitado al vocabulario y patrones del corpus de enfermedades.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No se han publicado capacidades multilingües; el modelo está etiquetado únicamente para tailandés (`th`).
- No se menciona soporte de "thinking mode" ni de modos de razonamiento extendido.

## Casos de uso

- Chatbot de consulta de síntomas en tailandés: el modelo puede responder preguntas básicas sobre enfermedades a partir del dataset de 3.000 pares, sirviendo como prototipo para un asistente de salud en entornos de bajo presupuesto.
- Sistema de triaje informativo: en una aplicación web o móvil, el modelo puede ofrecer respuestas automáticas a consultas frecuentes sobre enfermedades, reduciendo la carga de atención manual.
- Herramienta de apoyo educativo: estudiantes de medicina o profesionales sanitarios en Tailandia podrían usar el modelo para practicar preguntas y respuestas sobre patologías comunes.
- Generación de contenido de divulgación sanitaria: el modelo puede producir textos breves en tailandés sobre enfermedades, siempre que se supervise y verifique el contenido.
- Integración en pipelines de NLP para tailandés: al ser ligero, puede usarse como componente de un sistema mayor que combine recuperación de información y generación de respuestas.
- Investigación académica sobre fine-tuning de GPT-2 en idiomas de pocos recursos: el modelo sirve como caso de estudio para analizar el comportamiento de modelos pequeños en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, puntuaciones en MMLU, HumanEval, GSM8K ni ningún otro conjunto de referencia. El único indicador mencionado en los metadatos es `perplexity`, pero no se aporta ningún valor numérico.

## Requisitos de hardware

- VRAM estimada para inferencia: con 124 millones de parámetros, en FP32 se requieren aproximadamente 0,5 GB de VRAM; en FP16, alrededor de 0,25 GB; en cuantización de 8 bits, unos 0,125 GB. Estos valores son orientativos y no se han medido específicamente para este modelo.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluidas tarjetas de consumo como NVIDIA GTX 1650, RTX 3050 o superiores. También puede ejecutarse en CPU de forma razonablemente rápida.
- El modelo cabe en cualquier GPU de consumo moderna, así como en dispositivos con memoria unificada (Apple Silicon, por ejemplo).
- Opciones de despliegue: se puede cargar con la librería `transformers` de Hugging Face, o servirse mediante `vLLM`, `llama.cpp`, `Ollama` o `TGI`, siempre que se convierta al formato adecuado (GGUF para llama.cpp).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ball357/thai-qa-lab-model | 124.449.024 | no disponible | MIT | Hugging Face |
| B4869/thai-qa-lab-model | no disponible | no disponible | no disponible | Hugging Face (copia) |
| Taratep/thai_qa_lab_model | no disponible | no disponible | CC-BY-NC-4.0 | Hugging Face (copia) |
| GPT-2 base (openai-community/gpt2) | 124.000.000 aprox. | 1024 tokens | MIT | Hugging Face |

Las versiones `B4869/thai-qa-lab-model` y `Taratep/thai_qa_lab_model` parecen ser copias del mismo modelo con licencias y metadatos ligeramente distintos. No se dispone de información suficiente para comparar rendimiento real entre ellas. El modelo GPT-2 base se incluye como referencia por ser el modelo preentrenado original, aunque no está especializado en tailandés ni en QA de enfermedades.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al entrenarse con un dataset de solo 3.000 pares sobre enfermedades, el modelo puede reflejar sesgos presentes en los datos de origen (por ejemplo, una cobertura limitada de enfermedades raras o una perspectiva cultural concreta).
- Riesgo de alucinación: es un modelo pequeño con un dominio muy restringido; puede generar respuestas incorrectas o inventar información si se le pregunta fuera del ámbito de enfermedades cubierto por el dataset.
- Limitaciones de contexto: la longitud de contexto no está documentada; al basarse en GPT-2, se espera un límite de 1024 tokens, pero no se ha confirmado para este fine-tune.
- Limitaciones de idioma: el modelo solo soporta tailandés; no responde correctamente en otros idiomas.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero las copias en Hugging Face pueden tener licencias diferentes (por ejemplo, CC-BY-NC-4.0), lo que restringe el uso comercial.
- Advertencia para producción: no se han publicado evaluaciones de seguridad ni de calidad; no es recomendable usar este modelo en aplicaciones médicas reales sin supervisión humana y validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ball357/thai-qa-lab-model
- Copia del modelo (B4869): https://huggingface.co/B4869/thai-qa-lab-model
- Copia del modelo (Taratep): https://huggingface.co/Taratep/thai_qa_lab_model
- Paper de referencia sobre estimación de impacto ambiental (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
