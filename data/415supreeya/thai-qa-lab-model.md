# 415Supreeya/thai-qa-lab-model

## Resumen

El modelo `415Supreeya/thai-qa-lab-model` es un sistema de generación de texto en tailandés desarrollado por Supreeya Panyaniyod (415Supreeya) mediante el ajuste fino de un modelo GPT-2. Está entrenado sobre el conjunto de datos `disease_3000`, compuesto por 3.000 pares de preguntas y respuestas relacionadas con enfermedades, con el objetivo de responder consultas médicas básicas en tailandés. Se trata de un modelo pequeño, con 124.449.024 parámetros, distribuido con licencia MIT y pesos en formato safetensors.

Su relevancia radica en cubrir un nicho poco atendido: el procesamiento de lenguaje natural tailandés en el dominio de la salud. Al estar basado en GPT-2, es un transformador decoder-only, aunque la información disponible no especifica la ventana de contexto ni las hiperparámetros de entrenamiento. No se publican resultados de evaluación ni comparativas, por lo que su calidad queda circunscrita al dataset de entrenamiento y a la validación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformador decoder-only) |
| Parámetros totales | 124.449.024 |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Tailandés (th) |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura GPT-2, un transformador puramente decoder. El proceso de ajuste se realizó sobre el dataset `disease_3000`, que contiene 3.000 pares pregunta-respuesta en tailandés sobre enfermedades. La model card no detalla el procedimiento exacto de entrenamiento: no se indica número de epochs, tasa de aprendizaje, tamaño de batch ni régimen de precisión. Tampoco se mencionan técnicas de alineación como RLHF o DPO, ni estrategias de decodificación especiales. El único artículo citado en la documentación es el de Lacoste et al. (2019) sobre el cálculo del impacto ambiental, no un trabajo de investigación sobre el modelo. No se sabe si el dataset fue preprocesado o filtrado.

## Capacidades

- Generación de texto en tailandés (th), especializada en el dominio de enfermedades.
- Respuestas a preguntas factuales sobre afecciones, síntomas y tratamientos, tal como se aprendió del dataset `disease_3000`.
- Soporte de tool calling: no disponible / no documentado.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Idiomas: exclusivamente tailandés; no se ha informado de capacidades multilingües.
- Otras capacidades (visión, audio, modo de pensamiento): no disponibles.

## Casos de uso

- Atención sanitaria básica en tailandés: el modelo puede integrarse en un chatbot de telemedicina para responder preguntas frecuentes sobre enfermedades, gracias a su ajuste fino en pares QA médicos y a su tamaño reducido que permite ejecutarlo en un servidor modesto.
- Triaje previo en centros de salud: un sistema puede tomar descripciones sintomáticas del paciente y generar una respuesta orientativa sobre el posible tipo de enfermedad, con supervisión humana obligatoria.
- Educación al paciente: podría utilizarse para generar explicaciones sencillas sobre patologías en tailandés, dentro de una aplicación de salud con revisión de contenido por profesionales.
- Documentación clínica asistida: dado que el modelo genera texto, puede ayudar a redactar informes de consulta o resúmenes en tailandés, aunque solo se recomienda como apoyo y con validación posterior.
- Investigación en NLP tailandés médico: sirve como base experimental para estudiar el comportamiento de modelos pequeños ajustados en dominios específicos, dado que su tiempo de inferencia es bajo.
- Prototipos en entornos con poca conectividad: al ser un modelo de 124 millones de parámetros, puede desplegarse en dispositivos edge o en una CPU, lo que facilita la creación de asistentes sin conexión para zonas rurales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una referencia genérica a la métrica perplexity en sus metadatos, pero no se ofrecen valores concretos. Tampoco se presentan tablas comparativas con otros modelos ni evaluaciones sobre conjuntos de prueba habituales.

## Requisitos de hardware

- VRAM estimada: en precisión FP32, los 124 M parámetros requieren aproximadamente 0,5 GB de VRAM. No se publican cuantizaciones, por lo que este cálculo se basa en el peso de los parámetros. El tamaño del repositorio (2,5 GB) sugiere que se incluyen otros archivos además de los pesos en safetensors.
- GPU recomendada: cualquier GPU moderna con al menos 4 GB puede ejecutar el modelo; no se requieren aceleradores de última generación. También es viable en CPU para inferencia no crítica.
- Cabe en GPU de consumo: sí, por su tamaño. Ejemplos de GPU adecuadas serían una NVIDIA RTX 3060 o una GTX 1660.
- Opciones de despliegue: se puede cargar directamente con la librería Transformers de Hugging Face. No se proporcionan archivos GGUF en el repositorio, pero es posible convertirlo para usarlo con llama.cpp u Ollama si se quiere desplegar en CPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información publicada que permita una comparativa directa con otros modelos. El modelo es un ajuste fino de GPT-2, pero no se conocen los resultados de evaluación frente a GPT-2 base ni frente a otros modelos tailandeses. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Sesgos: al estar entrenado en un dataset de 3.000 pares no descrito en detalle, el modelo puede reflejar los sesgos presentes en las fuentes de datos sobre enfermedades, con posible escasez de casos raros o representación desigual de temas.
- Riesgo de alucinación: el modelo puede generar respuestas inventadas o incorrectas, especialmente en consultas fuera del dominio de entrenamiento.
- Limitaciones de contexto y lenguaje: solo está afinado para tailandés; no se documenta la longitud de contexto exacta, aunque GPT-2 tiene una ventana de tokens limitada.
- Licencia: MIT permite uso comercial, pero el uso médico real requiere cumplimiento normativo y validación clínica.
- Caveat de producción: no debe usarse para diagnóstico médico sin supervisión. No se ha realizado evaluación clínica ni se han publicado pruebas de seguridad.
- Sin arquitectura de evaluación publicada: no hay métricas de sesgo, robustez ni exactitud fuera del dataset de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/415Supreeya/thai-qa-lab-model
- Perfil del autor: https://huggingface.co/415Supreeya
- Paper de impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
