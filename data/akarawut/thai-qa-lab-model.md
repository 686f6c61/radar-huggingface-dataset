# Akarawut/thai-qa-lab-model

## Resumen

El modelo `Akarawut/thai-qa-lab-model` es un modelo GPT-2 de 124 millones de parámetros ajustado (fine-tuned) por un estudiante llamado Akarawut para tareas de preguntas y respuestas en tailandés sobre enfermedades. Se entrenó sobre el conjunto de datos `disease_3000`, que contiene 3.000 pares de preguntas y respuestas relacionadas con enfermedades. El modelo se publica bajo licencia MIT y utiliza el formato de pesos `safetensors`. Está diseñado para generar respuestas en tailandés a preguntas sobre enfermedades, lo que lo hace útil para prototipos de asistentes de salud o sistemas de consulta médica básica en tailandés. La longitud de contexto no está disponible en la información proporcionada, y al tratarse de un modelo GPT-2 de tamaño pequeño, su capacidad de razonamiento es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (decoder-only transformer) |
| Parametros totales | 124.449.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tailandés (th) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2, un transformer decoder-only clásico. Según la información disponible, fue fine-tuned sobre el dataset `disease_3000`, que contiene 3.000 pares de preguntas y respuestas en tailandés sobre enfermedades. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. Tampoco se documentan innovaciones técnicas destacables más allá del fine-tuning estándar sobre un modelo GPT-2 preentrenado.

## Capacidades

- Generación de texto en tailandés, especializada en preguntas y respuestas sobre enfermedades.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión, audio o razonamiento multi-paso.
- El modelo es monolingüe: solo tailandés (th).
- Al ser un modelo GPT-2 de 124M, su capacidad de razonamiento complejo es limitada.

## Casos de uso

- Asistente de consulta médica básica en tailandés: el modelo puede responder preguntas frecuentes sobre enfermedades a partir de su dataset de 3.000 pares, lo que lo hace adecuado para prototipos de chatbots de salud en este idioma.
- Sistema de triaje inicial para pacientes: permite orientar sobre síntomas y enfermedades comunes, pero debe usarse con cautela y no sustituir el diagnóstico profesional.
- Herramienta de apoyo educativo para estudiantes de medicina en Tailandia: genera explicaciones breves sobre enfermedades, útil para repasar conceptos en tailandés.
- Búsqueda de información sanitaria: integrado en una aplicación móvil, permite consultar definiciones y características de enfermedades en tailandés de forma rápida.
- Generación de contenido divulgativo: produce respuestas cortas sobre enfermedades para folletos o webs sanitarias, siempre que se revise el contenido.
- Pruebas de concepto de modelos de QA en tailandés: sirve como base para evaluar pipelines de fine-tuning con datasets pequeños en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El metadata menciona `perplexity` como métrica, pero no se proporcionan valores concretos.

## Requisitos de hardware

- VRAM estimada: al tener 124.449.024 parámetros, en FP32 la inferencia requiere aproximadamente 0,5 GB de VRAM; en FP16, alrededor de 0,25 GB. Es un modelo ligero que cabe en cualquier GPU de consumo moderna (por ejemplo, RTX 3060, GTX 1660) e incluso en CPU.
- GPU recomendadas: no se especifican requisitos oficiales, pero por su tamaño, GPUs con 1 GB o más de VRAM son suficientes.
- Opciones de despliegue: puede ejecutarse con la librería Transformers de HuggingFace, vLLM, llama.cpp (si se convierte a GGUF) u Ollama.
- Latencia y throughput: no se proporcionan datos en la información disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en la documentación proporcionada. El modelo se basa en GPT-2 (124M), por lo que puede compararse con el GPT-2 base original, que no está fine-tuned para tailandés ni para QA de enfermedades. No se han publicado benchmarks comparativos.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeño (3.000 pares), lo que limita la cobertura y la generalización a otras enfermedades o temas.
- Dominio restringido a enfermedades; el modelo no está preparado para responder sobre otros temas.
- Solo soporta tailandés, no es multilingüe.
- Riesgo de alucinación: puede generar respuestas incorrectas o incompletas sobre enfermedades, por lo que no debe usarse como consejo médico real.
- No se ha validado clínicamente ni se ha sometido a pruebas de seguridad.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías de rendimiento.
- No se han documentado sesgos específicos, pero al ser un modelo pequeño entrenado en un dataset limitado, puede reflejar los sesgos presentes en los datos.

## Enlaces

- HuggingFace: https://huggingface.co/Akarawut/thai-qa-lab-model
- Copia en HuggingFace: https://huggingface.co/B4869/thai-qa-lab-model
- Referencia al paper de GPT-2 (tag arxiv:1910.09700): https://arxiv.org/abs/1910.09700
- AlphaNeural AI (espejo): https://alphaneural.io/assets/noteYotsakon/thai-qa-lab-model
