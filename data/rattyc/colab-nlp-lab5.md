# RattyC/colab-nlp-lab5

## Resumen

El modelo `RattyC/colab-nlp-lab5` es un fine-tuning del modelo GPT-2 realizado por RattyC para tareas de preguntas y respuestas en tailandés, centrado en el dominio de enfermedades. Según la model card, fue entrenado con el conjunto de datos `disease_3000`, compuesto por 3000 pares de preguntas y respuestas sobre enfermedades en tailandés.

Se trata de un modelo experimental, publicado en Hugging Face con licencia MIT y sin descargas ni valoraciones registradas. La arquitectura base es GPT-2, pero no se especifica el tamaño concreto (small, medium, large), la longitud de contexto ni el número de parámetros. La fecha de creación indicada es septiembre de 2026, lo que resulta poco habitual y puede deberse a un error de metadatos.

Su relevancia radica en ser un modelo de dominio específico para tailandés, un idioma con menos recursos disponibles en comparación con el inglés. Sin embargo, al carecer de documentación técnica detallada y benchmarks, su uso en producción requiere validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (tamaño no especificado) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tailandés (th) |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura es un transformer basado en GPT-2, ajustado mediante fine-tuning sobre el dataset `disease_3000`. No se ha publicado información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el procedimiento de preprocesamiento. Tampoco se mencionan técnicas de RLHF, DPO ni optimizaciones especiales. El único dato disponible es que el entrenamiento se realizó en un entorno Colab, según el identificador del repositorio. La referencia `arxiv:1910.09700` presente en los metadatos corresponde al artículo sobre el calculador de impacto ambiental de Lacoste et al., no a una publicación sobre el modelo.

## Capacidades

- Generación de texto en tailandés para respuestas a preguntas sobre enfermedades, basándose en los pares del dataset `disease_3000`.
- No se ha documentado soporte de tool calling, function calling ni integración con agentes.
- No dispone de capacidades multimodales (visión, audio) ni de modo de razonamiento explícito.
- El idioma soportado es únicamente tailandés (th).
- Puede realizar preguntas y respuestas simples dentro del dominio de enfermedades, con limitaciones de vocabulario y cobertura.

## Casos de uso

- Chatbot de salud en tailandés para consultas básicas: puede responder preguntas frecuentes sobre enfermedades, como síntomas o tratamientos, dentro del dominio cubierto por los 3000 pares del dataset. Adecuado para prototipos de atención al paciente en tailandés.
- Asistente de información en clínicas: integrado en un sistema de mensajería, puede resolver dudas comunes de pacientes antes de una consulta médica, siempre que las preguntas se ajusten al corpus de entrenamiento.
- Material educativo: generación de preguntas y respuestas sobre enfermedades para estudiantes de medicina o pacientes, en formato de fichas o simulacros de examen en tailandés.
- Triaje inicial en telemedicina: puede sugerir posibles enfermedades a partir de síntomas descritos en tailandés, aunque debe considerarse como una herramienta de apoyo y no como diagnóstico.
- Investigación académica: útil como punto de partida para estudiar el fine-tuning de GPT-2 en dominios médicos con recursos lingüísticos limitados.
- Demostraciones y prototipos: al tratarse de un modelo GPT-2, su peso es menor que el de arquitecturas grandes, aunque el tamaño exacto no se ha especificado. Es adecuado para demostraciones educativas de NLP en tailandés sin necesidad de infraestructura avanzada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona `perplexity` como métrica, pero no se proporcionan valores numéricos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible.
- GPU recomendada: no disponible.
- Ejecución en GPU de consumo: no disponible. El modelo se basa en GPT-2, por lo que es probable que sea ejecutable en hardware modesto, pero no hay datos que lo confirmen.
- Opciones de despliegue: no documentadas. No se han proporcionado instrucciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Sesgos y alucinaciones no documentados: al ser un fine-tuning pequeño con 3000 pares, es probable que genere respuestas incorrectas o inventadas sobre enfermedades.
- Alcance limitado: solo cubre el dominio de enfermedades del dataset `disease_3000`, por lo que fallará en preguntas fuera de este ámbito.
- Idioma: solo tailandés, sin soporte para otros idiomas.
- Licencia MIT: permite uso comercial, pero sin garantías ni soporte; el modelo se publica tal cual.
- Sin evaluaciones publicadas: no se puede conocer su rendimiento real en tareas de QA.
- Fecha de creación futura: los metadatos indican 2026, lo que puede ser un error y dificulta la trazabilidad.

## Enlaces

- HuggingFace: https://huggingface.co/RattyC/colab-nlp-lab5
- Paper de impacto ambiental (citado en los metadatos): https://arxiv.org/abs/1910.09700
