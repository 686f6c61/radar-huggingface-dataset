# Nonae3/thai-qa-lab-model

## Resumen

El modelo Nonae3/thai-qa-lab-model es un GPT-2 ajustado (fine-tuned) por el estudiante Nonae3 para tareas de preguntas y respuestas en tailandés sobre enfermedades. Se entrenó sobre el conjunto de datos disease_3000, compuesto por 3000 pares de preguntas y respuestas relacionadas con enfermedades. Con 124.449.024 parámetros, es un modelo de tamaño pequeño, adecuado para prototipos y entornos con recursos de cómputo limitados. Está disponible en HuggingFace bajo licencia MIT, lo que permite su uso comercial con las debidas precauciones. Su relevancia radica en ofrecer una solución ligera para consultas sanitarias básicas en tailandés, aunque su alcance está limitado al dominio de entrenamiento y no debe emplearse como herramienta de diagnóstico médico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (GPT-2) |
| Parametros totales | 124.449.024 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Tailandés (th) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer de GPT-2, un modelo de lenguaje autorregresivo. Se ha realizado un ajuste fino sobre el dataset disease_3000, compuesto por 3000 pares de preguntas y respuestas en tailandés sobre enfermedades. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas destacables; se trata de un fine-tuning estándar de GPT-2 sobre un dominio concreto.

## Capacidades

- Generación de texto en tailandés, especializada en respuestas a preguntas sobre enfermedades.
- Capacidad para responder a consultas basadas en el dataset de entrenamiento, limitada a 3000 pares.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multimodales (visión, audio) ni modo de pensamiento.
- Idioma: exclusivamente tailandés (th). No se ha verificado soporte multilingüe.

## Casos de uso

- Asistente de consulta sanitaria básica: el modelo puede responder preguntas frecuentes sobre síntomas, tratamientos o prevención de enfermedades en tailandés, lo que resulta útil como primer punto de contacto en aplicaciones de salud para población tailandesa.
- Chatbot de triaje inicial: en un entorno de telemedicina, el modelo puede gestionar consultas por texto y ayudar a clasificar la urgencia antes de derivar a un profesional, siempre que las preguntas se ajusten al dominio del dataset.
- Herramienta educativa para estudiantes de medicina: permite practicar preguntas y respuestas sobre enfermedades en tailandés, facilitando el repaso de conceptos básicos en un formato interactivo.
- Prototipo de sistema de preguntas y respuestas para clínicas: puede integrarse en una web o aplicación interna para responder dudas habituales de los pacientes, reduciendo la carga administrativa del personal sanitario.
- Generación de contenido divulgativo sanitario: el modelo puede redactar explicaciones sencillas sobre enfermedades en tailandés, útiles para blogs, folletos o campañas de concienciación.
- Investigación en NLP tailandés: sirve como modelo de referencia para estudiar el ajuste fino de GPT-2 en dominios médicos, comparando su rendimiento con otros modelos o datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB para pesos en fp32, y 0,5 GB en fp16 (calculado a partir de 124M parámetros).
- GPU recomendadas: no hay recomendaciones oficiales. Al ser un modelo pequeño, puede ejecutarse en GPUs de consumo como RTX 3060 o inferiores, e incluso en CPU.
- Cabe en GPUs de consumo: sí, con margen para activaciones y overhead.
- Opciones de despliegue: Hugging Face Transformers, vLLM, o conversión a GGUF para llama.cpp y Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nonae3/thai-qa-lab-model | 124.449.024 | No disponible | MIT | HuggingFace |
| Plaifa/thai-qa-lab-model | No disponible | No disponible | No disponible | HuggingFace |
| GPT-2 (OpenAI) | 124M | 1024 | MIT | HuggingFace |

El modelo de Plaifa parece ser un fine-tuning similar de GPT-2 para el mismo dominio tailandés, pero no se dispone de datos de rendimiento. GPT-2 base es el modelo original, sin ajuste fino, con un contexto de 1024 tokens y licencia MIT. No hay benchmarks publicados que permitan comparar el rendimiento de estos modelos.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos, pero al entrenarse con un dataset limitado de 3000 pares, es probable que herede sesgos presentes en los datos o en el modelo base GPT-2.
- Riesgo de alucinación: el modelo puede generar respuestas incorrectas o inventadas, especialmente en preguntas fuera del dominio de enfermedades o con formulaciones poco habituales.
- Limitaciones de idioma: solo soporta tailandés; no se ha verificado su funcionamiento en otros idiomas.
- Limitaciones de contexto: no se especifica la longitud de contexto; al ser GPT-2, probablemente sea de 1024 tokens, lo que limita conversaciones largas o documentos extensos.
- Uso médico: no es un dispositivo médico ni una herramienta de diagnóstico. No debe utilizarse para tomar decisiones clínicas reales sin supervisión profesional.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías de seguridad ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/Nonae3/thai-qa-lab-model
- Modelo similar: https://huggingface.co/Plaifa/thai-qa-lab-model
