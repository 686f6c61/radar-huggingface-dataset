# jackhappy02/GluVasc_Agent

## Resumen

GluVasc_Agent es un modelo de lenguaje conversacional de aproximadamente 14 700 millones de parámetros, desarrollado por el autor jackhappy02 y publicado en Hugging Face bajo licencia Apache 2.0. Según la página oficial del proyecto, se trata de un asistente de apoyo emocional para enfermedades crónicas, construido sobre modelos de lenguaje de código abierto e integrando conocimientos de gestión de enfermedades crónicas, escenarios reales de comunicación clínica y datos destilados de múltiples modelos. Está optimizado para el apoyo emocional, la comunicación clínico-paciente y la educación sanitaria en diabetes.

El repositorio incluye pesos en formato safetensors y GGUF, lo que permite su despliegue tanto en infraestructuras de inferencia convencionales como en entornos de ejecución local. Aunque el autor lo etiqueta como conversacional y compatible con endpoints, la model card no aporta detalles sobre arquitectura, datos de entrenamiento ni benchmarks, por lo que gran parte de las especificaciones técnicas deben marcarse como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 14 768 307 200 (~14,77B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (precisión completa) y GGUF (se asume cuantizado, sin detalle de variantes) |
| Idiomas soportados | inglés (según el nombre del subdirectorio «ENGLISH_THINK»), sin confirmación oficial |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna del modelo. El subdirectorio del repositorio se denomina `GluVasc_AI_14B_ENGLISH_THINK`, lo que sugiere que podría tratarse de una variante de 14B con capacidades de razonamiento («think»), pero no hay documentación que confirme el tipo de arquitectura (transformer, MoE, SSM, híbrida, etc.).

El proyecto declara que integra conocimiento de gestión de enfermedades crónicas, escenarios clínicos reales y datos destilados de múltiples modelos, lo que indica un entrenamiento orientado a tareas de dominio médico y conversacional. Sin embargo, no se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Conversación multi-turno orientada a apoyo emocional en enfermedades crónicas.
- Comunicación clínico-paciente, con lenguaje adaptado a contextos sanitarios.
- Educación sanitaria, especialmente en diabetes, según el sitio oficial.
- Capacidad de razonamiento («THINK» en el nombre del subdirectorio), aunque sin detalles técnicos de implementación.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no confirmadas; el nombre sugiere inglés, pero no hay documentación oficial.

## Casos de uso

- Apoyo emocional para pacientes con diabetes: el modelo puede mantener conversaciones empáticas y continuadas con pacientes, ofreciendo contención emocional y recordatorios de adherencia al tratamiento.
- Educación sanitaria en consulta: integrado en portales de pacientes o aplicaciones móviles, puede explicar conceptos de diabetes, hipoglucemia, dieta y ejercicio de forma accesible.
- Simulación de entrevistas clínicas para formación de profesionales: al estar entrenado con escenarios reales de comunicación clínica, puede usarse en simuladores de práctica para estudiantes de medicina o enfermería.
- Asistente de triaje inicial: un paciente describe síntomas o preocupaciones, y el modelo ofrece orientación sobre cuándo contactar con un profesional sanitario.
- Reducción de la carga administrativa en consultas: puede redactar resúmenes de conversaciones con pacientes o preparar preguntas de seguimiento para el personal médico.
- Chatbot de acompañamiento en programas de salud crónica: integrado en plataformas de telemedicina para dar soporte entre visitas médicas, reforzando la adherencia y la motivación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 14,7B parámetros, una cuantización de 4 bits requeriría aproximadamente entre 8 y 10 GB de VRAM, pero no se ha confirmado el rango exacto.
- GPU recomendadas: no disponible. Un modelo de este tamaño puede ejecutarse en GPU consumer de 16 GB (RTX 4090) o en A100/H100 para producción.
- ¿Cabe en GPU consumer? Probablemente sí, en cuantización GGUF de 4 bits en una RTX 4080/4090, pero sin confirmación.
- Opciones de despliegue: compatible con safetensors y GGUF, lo que permite usar vLLM, TGI, llama.cpp, Ollama u otros motores compatibles con GGUF. La etiqueta `endpoints_compatible` sugiere compatibilidad con APIs de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información comparativa. Se desconoce si el modelo se basa en una arquitectura conocida (Llama, Mistral, Qwen, etc.), por lo que no es posible comparar con alternativas de la misma categoría sin datos técnicos.

## Limitaciones y advertencias

- No hay documentación técnica publicada: arquitectura, datos de entrenamiento, contexto y cuantizaciones no están especificados, lo que dificulta su evaluación rigurosa.
- Riesgo de alucinación: sin datos de entrenamiento ni benchmarks, no se puede garantizar la fiabilidad de las respuestas en un dominio sensible como el sanitario.
- Sesgos: no se han publicado análisis de sesgos ni evaluaciones de equidad.
- Idioma: el modelo parece orientado al inglés, sin confirmación de soporte multilingüe.
- Uso clínico: el proyecto es un asistente de apoyo emocional y educativo, no un sustituto de la atención médica profesional. El uso en producción sanitaria requiere validación adicional.
- Licencia Apache 2.0: permite uso comercial, pero el autor no proporciona garantías ni responsabilidad sobre el uso del modelo.
- Repositorio reciente y sin tracción: 0 descargas y 0 likes en HuggingFace, lo que indica poca validación comunitaria.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/jackhappy02/GluVasc_Agent)
- [Sitio oficial del proyecto](http://gluvasc-agent.top/)
- [Página en KnowYourModel](https://www.knowyourmodel.ai/models/huggingface%3Ajackhappy02%2FGluVasc_Agent)
