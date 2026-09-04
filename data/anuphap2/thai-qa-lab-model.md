# Anuphap2/thai-qa-lab-model

## Resumen

Modelo GPT-2 ajustado para tareas de preguntas y respuestas en tailandés sobre gatos, desarrollado por Anuphap2 (estudiante). Se trata de un modelo de 124,4 millones de parámetros, con licencia MIT, entrenado sobre un dataset denominado `disease_3000` que contiene 3.000 pares de preguntas y respuestas relacionadas con enfermedades felinas. No se dispone de información detallada sobre el proceso de entrenamiento ni de evaluaciones publicadas. Su relevancia radica en ser un ejemplo de fine-tuning de GPT-2 para un dominio específico en tailandés, un idioma con menos recursos que el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 124.449.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Tailandés (th) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer con decodificador únicamente. No se especifica el checkpoint base exacto del que se partió, aunque por el tamaño (124M) corresponde a la variante GPT-2 small. Fue fine-tuneado con el dataset `disease_3000`, compuesto por 3.000 pares de preguntas y respuestas en tailandés sobre gatos (posiblemente enfermedades felinas, según el nombre del dataset). No se han publicado hiperparámetros de entrenamiento, número de épocas, hardware utilizado ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto en tailandés, especializada en preguntas y respuestas sobre gatos.
- Capacidad de responder a consultas dentro del dominio del dataset de entrenamiento.
- No se ha confirmado soporte para tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- Único idioma soportado: tailandés.

## Casos de uso

- Chatbot básico de preguntas frecuentes sobre salud felina para usuarios tailandeses: el modelo puede responder a consultas sencillas sobre enfermedades de gatos, aunque con un alcance limitado a los 3.000 pares de entrenamiento.
- Asistente de apoyo para clínicas veterinarias en Tailandia: podría integrarse en sistemas de atención al cliente para responder dudas iniciales, siempre que se acote a los temas cubiertos por el dataset.
- Demo educativa de fine-tuning de GPT-2: sirve como ejemplo práctico para estudiantes o investigadores que deseen aprender a ajustar modelos pequeños para dominios específicos en tailandés.
- Prototipo para investigación en NLP tailandés: permite explorar técnicas de fine-tuning en un idioma de bajos recursos y evaluar su comportamiento en tareas de QA de dominio cerrado.
- Generación de respuestas cortas en tailandés para preguntas sobre enfermedades de gatos, siempre que se utilice dentro de un sistema de recuperación o filtrado previo.
- Pruebas de concepto para validar el uso de GPT-2 en dominios especializados, dada la disponibilidad de licencia MIT y el tamaño reducido del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la información del modelo.
- GPU recomendadas: no disponibles en la información del modelo.
- Al ser un modelo de 124M parámetros, es probable que pueda ejecutarse en GPUs de consumo o incluso en CPU, pero no hay especificaciones oficiales que lo confirmen.
- Opciones de despliegue: no disponibles (se desconoce si se ha probado con vLLM, llama.cpp, Ollama, TGI, etc.).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| thai-qa-lab-model | 124.449.024 | no disponible | Tailandés | MIT | Fine-tuneado en dominio de salud felina |
| GPT-2 small | 124M | 1024 tokens | Inglés (principal) | MIT | Modelo base, sin fine-tuning tailandés |
| Otras alternativas tailandesas | no disponible | no disponible | Tailandés | no disponible | No se dispone de datos comparativos |

## Limitaciones y advertencias

- Entrenado únicamente con 3.000 pares de preguntas y respuestas, por lo que su conocimiento del dominio es muy limitado y puede fallar ante consultas no incluidas en el dataset.
- Riesgo elevado de alucinación en temas fuera del dominio de entrenamiento.
- No se ha evaluado en cuanto a sesgos, seguridad o alucinaciones, por lo que no se recomienda su uso directo en producción sin una evaluación adicional.
- Solo soporta tailandés; no es multilingüe.
- No se dispone de información sobre la calidad del dataset, su composición o posibles sesgos en los datos.
- Aunque la licencia MIT permite uso comercial, no se ofrecen garantías de rendimiento ni de soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Anuphap2/thai-qa-lab-model
- Perfil del autor: https://huggingface.co/Anuphap2
- Dataset `disease_3000`: no disponible (no se ha encontrado un enlace público en la información proporcionada)
