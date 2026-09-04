# Boom407/thai-qa-lab-model

## Resumen

El modelo `Boom407/thai-qa-lab-model` es un modelo de lenguaje basado en GPT-2, ajustado (fine-tuning) para responder preguntas en tailandés sobre enfermedades. Ha sido desarrollado por un estudiante con el identificador `Boom407` y publicado en Hugging Face como proyecto de investigación académica. El modelo se entrenó sobre un conjunto de datos denominado `disease_3000`, compuesto por 3000 pares de pregunta-respuesta en tailandés relacionados con enfermedades.

La arquitectura es un transformer decoder-only (GPT-2) con 124.449.024 parámetros en total. El modelo está pensado para la generación de texto en tareas de pregunta-respuesta dentro del dominio sanitario. Su relevancia radica en ser un ejemplo de fine-tuning de un modelo pequeño sobre un dominio muy específico y poco representado, como es el tailandés médico. No obstante, al tratarse de un modelo de tamaño reducido y con un dataset de entrenamiento limitado, sus capacidades generales son modestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 124.449.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (GPT-2 base: 1024 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Tailandes (th) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer autoregresivo con mecanismo de atención estándar y sin componentes de tipo mixture of experts ni state space models. No se ha documentado ninguna innovación técnica destacable; se trata de un fine-tuning convencional sobre el modelo GPT-2 preentrenado.

El entrenamiento se realizó sobre el dataset `disease_3000`, que contiene 3000 pares de preguntas y respuestas en tailandés sobre enfermedades. No se dispone de información detallada sobre la composición exacta del dataset, su procedencia ni el proceso de preprocesado. Tampoco se han publicado datos sobre el uso de RLHF, DPO u otras técnicas de alineación. Los hiperparámetros de entrenamiento, el régimen de precisión y la infraestructura computacional no están disponibles.

## Capacidades

- Generación de texto en tailandés para tareas de pregunta-respuesta dentro del dominio de enfermedades.
- Respuesta a consultas directas sobre síntomas, diagnósticos o información médica básica, siempre que el contenido esté cubierto por el dataset de entrenamiento.
- Capacidad limitada de completar texto o generar respuestas cortas en tailandés.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni uso de agentes.
- No dispone de capacidades multimodales (visión, audio) ni de modo de razonamiento explícito.
- El uso fuera del dominio médico en tailandés es probablemente deficiente.

## Casos de uso

- Atención sanitaria básica en tailandés: el modelo puede responder preguntas frecuentes sobre enfermedades comunes a partir de los 3000 pares del dataset, lo que lo hace útil para prototipos de chatbots de salud.
- Educación médica para estudiantes: puede utilizarse como herramienta de práctica para preguntar y responder sobre conceptos de enfermedades, siempre que las respuestas estén dentro del corpus.
- Divulgación sanitaria en tailandés: generación de respuestas sencillas para materiales informativos dirigidos a pacientes, como folletos o preguntas frecuentes.
- Asistente de triaje inicial: en un entorno controlado, el modelo puede ofrecer una orientación preliminar sobre posibles enfermedades a partir de descripciones de síntomas, sin sustituir el criterio médico.
- Entrenamiento de otros modelos: al ser un modelo pequeño y con licencia MIT, puede servir como punto de partida para investigaciones sobre fine-tuning en tailandés médico.
- Demo educativa en entornos académicos: por su tamaño reducido, es adecuado para demostraciones de fine-tuning y para enseñar conceptos de adaptación de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la métrica `perplexity` en la sección de métricas, pero no proporciona ningún valor numérico ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo con 124M parámetros en precisión FP32 ocupa aproximadamente 0,5 GB; en FP16 se reduce a unos 0,25 GB. En cuantización de 8 bits podría ocupar en torno a 0,15 GB. Hay que añadir el overhead de la librería de inferencia, por lo que se recomienda un mínimo de 1 GB de VRAM en FP32.
- GPU recomendadas: cualquier GPU moderna de gama baja (GTX 1650, RTX 3050) es suficiente. También puede ejecutarse en CPU de forma razonablemente rápida.
- Sí cabe en GPU de consumo: es un modelo muy ligero y puede ejecutarse en cualquier GPU con al menos 1 GB de memoria.
- Opciones de despliegue: Transformers de Hugging Face, llama.cpp si se convierte a formato GGUF, Ollama mediante importación del modelo, y vLLM para despliegue en producción con baja latencia.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de información suficiente para realizar una comparación rigurosa con modelos alternativos. No obstante, se puede indicar que el modelo es un GPT-2 de 124M adaptado al tailandés, lo que lo sitúa en la misma categoría de tamaño que el GPT-2 pequeño original de OpenAI, aunque con un dominio de aplicación mucho más restringido. No se han identificado modelos comparables en la información disponible.

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Boom407/thai-qa-lab-model | 124M | no disponible | Tailandes | MIT | Hugging Face |
| GPT-2 small (OpenAI) | 124M | 1024 tokens | Ingles | MIT | Hugging Face |

## Limitaciones y advertencias

- Sesgos: no documentados. El modelo puede heredar sesgos presentes en el dataset `disease_3000`, que no ha sido auditado.
- Riesgo de alucinación: alto. Al ser un modelo pequeño entrenado con solo 3000 pares, es probable que invente respuestas fuera del dominio cubierto.
- Limitaciones de idioma: solo soporta tailandés. No se ha validado su rendimiento en otros idiomas.
- Limitaciones de contexto: la longitud de contexto no se ha confirmado; si se mantiene la de GPT-2 base (1024 tokens), es insuficiente para documentos médicos extensos.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el modelo no ha sido validado para uso médico real y podría producir información errónea o peligrosa.
- Advertencia importante: este modelo no debe utilizarse como herramienta de diagnóstico médico ni como sustituto de un profesional sanitario. Su uso en producción requeriría una evaluación exhaustiva y medidas de mitigación de alucinaciones.

## Enlaces

- Hugging Face: https://huggingface.co/Boom407/thai-qa-lab-model
- Paper de referencia sobre impacto ambiental (no del modelo): https://arxiv.org/abs/1910.09700
