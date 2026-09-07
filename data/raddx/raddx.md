# RadDx/RadDx

## Resumen

RadDx es un modelo de inteligencia artificial desarrollado por RadDx para el ámbito de la radiología. Su propósito principal es interpretar informes radiológicos y ofrecer resúmenes en lenguaje sencillo que ayuden a los pacientes a comprender qué significa un hallazgo en su contexto clínico, qué cambios pueden ser motivo de preocupación, qué es lo que la redacción del informe no demuestra y qué preguntas de seguimiento tienen sentido plantear antes de hablar con su médico.

El repositorio de HuggingFace contiene el modelo, aunque la información técnica publicada es mínima: no se especifican arquitectura, parámetros, licencia ni idiomas soportados. Se trata, por tanto, de un modelo de dominio específico orientado a la radiología y a la comunicación médico-paciente, con un enfoque en la interpretación de informes médicos y la divulgación de resultados clínicos. La página de HuggingFace muestra 0 descargas y 1 like, y su fecha de creación y actualización es el 7 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo, el número de parámetros, la longitud de contexto, los datos de entrenamiento ni las técnicas de optimización empleadas. El repositorio de HuggingFace no incluye detalles técnicos sobre la composición del dataset, si se realizó fine-tuning, RLHF, DPO ni ningún otro método de alineación. Tampoco se especifica el formato de los pesos (safetensors, GGUF, etc.) ni el framework utilizado para el entrenamiento.

## Capacidades

- Generación de resúmenes en lenguaje sencillo de informes radiológicos.
- Explicación del significado contextual de los hallazgos radiológicos.
- Identificación de hallazgos que pueden ser motivo de preocupación o que requieren seguimiento.
- Aclaración sobre las limitaciones del lenguaje médico en el informe (qué no demuestra la redacción).
- Generación de preguntas de seguimiento sugeridas para el paciente antes de la consulta clínica.
- Enfoque orientado al paciente, diseñado para responder a la pregunta que surge después de leer un resumen en lenguaje sencillo.

## Casos de uso

- Educación del paciente: el modelo puede transformar informes radiológicos complejos en explicaciones comprensibles, permitiendo que los pacientes entiendan el significado de sus resultados sin necesidad de conocimientos médicos previos.
- Preparación para consultas clínicas: los pacientes pueden usar el modelo para generar preguntas de seguimiento relevantes y llegar a la consulta con dudas concretas, mejorando la eficiencia del diálogo médico-paciente.
- Divulgación médica: el modelo puede utilizarse para crear contenido educativo accesible sobre terminología radiológica, dirigido a pacientes y público general.
- Apoyo a la comunicación en telemedicina: integración en plataformas de salud digital para ofrecer explicaciones preliminares de resultados radiológicos antes de la consulta con el especialista.
- Formación de estudiantes de medicina: el modelo puede servir como herramienta de apoyo para que estudiantes interpreten informes radiológicos y practiquen la explicación de hallazgos a pacientes simulados.
- Segunda lectura para pacientes: los pacientes pueden contrastar su informe radiológico original con el resumen generado por el modelo para identificar áreas de incertidumbre o información que no se ha abordado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se especifica soporte para vLLM, llama.cpp, Ollama, TGI u otros).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se han identificado modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No se dispone de información sobre la licencia del modelo, lo que implica que el uso comercial no está garantizado y requiere verificación previa con el autor.
- No se han publicado benchmarks ni evaluaciones del rendimiento, por lo que no es posible comparar su calidad con otros modelos ni validar su fiabilidad en entornos de producción.
- Al tratarse de un modelo orientado al ámbito médico, su uso sin supervisión profesional puede conllevar riesgos de interpretación incorrecta de hallazgos clínicos.
- Existe riesgo de alucinación en la generación de explicaciones médicas si el modelo no está correctamente alineado o si se usa fuera de su dominio específico.
- El repositorio de HuggingFace no incluye información sobre datos de entrenamiento, sesgos conocidos ni restricciones de idioma, lo que limita la evaluación de su idoneidad para casos de uso concretos.

## Enlaces

- HuggingFace: https://huggingface.co/RadDx/RadDx
- Aplicación web oficial: https://raddx.app/
- RADDX Healthcare (servicios de IA): https://raddxhealthcare.com/services/artificial-intelligence/
