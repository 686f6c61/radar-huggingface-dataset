# mradermacher/Hakeem-7B-GGUF

## Resumen

Hakeem-7B es un modelo de lenguaje especializado en el dominio médico, diseñado para responder preguntas y asistir en tareas de razonamiento clínico en árabe (con variantes egipcias y del Golfo) e inglés. Desarrollado por Vionex-digital, se basa en el modelo Falcon-H1-7B-Instruct de TII, que emplea una arquitectura híbrida que combina SSM (Mamba) con atención transformer. Esta versión, publicada por mradermacher, ofrece cuantizaciones GGUF que permiten ejecutar el modelo en hardware de consumo con distintos niveles de precisión y uso de memoria.

El modelo se distribuye bajo la licencia Falcon-LLM, que hereda del modelo base, e incluye restricciones importantes: se trata de una vista previa de investigación, no es un dispositivo médico y no debe utilizarse para decisiones clínicas. Con aproximadamente 7,6 mil millones de parámetros, Hakeem-7B es relevante para el desarrollo de asistentes médicos multilingües, especialmente en entornos donde el árabe es el idioma predominante, y para la investigación en procesamiento de lenguaje natural clínico en la región.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida SSM (Mamba) + atención transformer, basada en Falcon-H1-7B-Instruct |
| Parametros totales | 7.585.654.880 (~7,6B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Árabe (egipcio y del Golfo), inglés |
| Licencia | Falcon-LLM License (heredada de tiiuae/Falcon-H1-7B-Instruct) |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura de Hakeem-7B se basa en Falcon-H1-7B-Instruct, que combina capas de espacio de estados (SSM, concretamente Mamba) con mecanismos de atención transformer en un diseño híbrido. Esta combinación busca equilibrar la eficiencia computacional de los SSM con la capacidad de atención para tareas de razonamiento complejo. El modelo ha sido ajustado específicamente para el dominio médico, con datos orientados a preguntas y respuestas clínicas en árabe e inglés. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo se distribuye como una vista previa de investigación, lo que sugiere que el entrenamiento puede no haber incluido una fase de alineación exhaustiva.

## Capacidades

- Generación de texto y respuesta a preguntas en árabe e inglés, con enfoque en el dominio médico.
- Razonamiento clínico básico y respuesta a consultas de salud generales (con las limitaciones propias de un modelo no validado clínicamente).
- Soporte multilingüe para árabe (dialectos egipcio y del Golfo) e inglés, lo que facilita su uso en entornos bilingües.
- Capacidad de razonamiento (tag "reasoning"), aunque no se especifica si incluye un modo de pensamiento explícito.
- No se indica soporte para tool calling, function calling ni uso como agente autónomo.
- No se mencionan capacidades multimodales (visión, audio).

## Casos de uso

- Investigación académica en procesamiento de lenguaje natural médico: el modelo puede utilizarse para experimentos de extracción de información clínica, generación de resúmenes de historiales o análisis de literatura médica en árabe, gracias a su bilingüismo y su especialización en el dominio.
- Desarrollo de prototipos de asistentes virtuales de salud: permite construir chatbots de demostración que respondan a preguntas frecuentes sobre síntomas, medicamentos o procedimientos, siempre bajo supervisión humana y con descargos legales claros.
- Evaluación comparativa de modelos médicos en árabe: sirve como punto de referencia para medir la calidad de respuestas en tareas de QA médica frente a otros modelos multilingües o específicos del dominio.
- Educación médica simulada: puede emplearse en entornos formativos para que estudiantes de medicina practiquen entrevistas clínicas o razonamiento diagnóstico, con la supervisión de un tutor.
- Traducción y adaptación de contenido médico: su capacidad bilingüe árabe-inglés permite generar versiones en árabe de documentos médicos redactados originalmente en inglés, aunque con la necesidad de revisión experta.
- Generación de material divulgativo sobre salud: puede redactar explicaciones sencillas sobre enfermedades o tratamientos para pacientes, siempre que el contenido sea verificado por profesionales sanitarios antes de su publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo. El autor de la cuantización GGUF no proporciona métricas de rendimiento. Se recomienda realizar evaluaciones propias en tareas médicas específicas antes de considerar su uso en cualquier aplicación.

## Requisitos de hardware

- Las cuantizaciones GGUF permiten ejecutar el modelo en GPUs de consumo. Por ejemplo, la versión Q4_K_M ocupa 4,7 GB, por lo que cabe en tarjetas con 8 GB de VRAM (RTX 3060, RTX 4060, etc.).
- La versión Q8_0 ocupa 8,2 GB, adecuada para GPUs de 10-12 GB (RTX 3080, RTX 4070 Ti, etc.).
- La versión f16 ocupa 15,3 GB, recomendada para GPUs de 16 GB o más (RTX 4090, A100, etc.).
- Para inferencia en CPU, es posible usar llama.cpp u Ollama con las cuantizaciones más pequeñas (Q2_K, Q3_K_S) en equipos con 8-16 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier runtime compatible con GGUF. También puede cargarse con transformers si se convierte a safetensors, aunque la versión GGUF está pensada para motores como llama.cpp.
- No se dispone de datos de latencia o throughput específicos. En una GPU moderna (RTX 3090/4090) con Q4_K_M, se puede esperar una velocidad de generación de 20-40 tokens por segundo, pero estos valores son estimaciones orientativas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos. Como referencia, el modelo base Falcon-H1-7B-Instruct de TII es un modelo generalista de 7B con arquitectura híbrida SSM-transformer, pero no está especializado en medicina ni en árabe. Otros modelos médicos en árabe, como Jais (de G42) o AceGPT, tienen arquitecturas y licencias diferentes, pero no se dispone de datos comparativos de rendimiento en este contexto. Se recomienda consultar la documentación de estos modelos para una evaluación directa.

## Limitaciones y advertencias

- El modelo es una vista previa de investigación y no ha sido validado clínicamente. Puede producir respuestas incorrectas o peligrosas, especialmente en lo relativo a dosis de medicamentos y diagnósticos.
- No debe utilizarse para decisiones clínicas, diagnósticos, triaje ni tratamientos. Está destinado exclusivamente a fines de investigación y evaluación.
- Los sesgos y alucinaciones son posibles, como en cualquier modelo de lenguaje. En el dominio médico, el riesgo es mayor debido a la naturaleza sensible de la información.
- La licencia Falcon-LLM impone restricciones de uso, incluida la necesidad de solicitar acceso al modelo base y aceptar los términos de la licencia.
- El soporte de idiomas se limita al árabe (dialectos egipcio y del Golfo) e inglés; no se garantiza un rendimiento adecuado en otros dialectos árabes o en otros idiomas.
- No se han publicado detalles sobre la longitud de contexto, por lo que no se puede garantizar un rendimiento fiable en conversaciones muy largas o documentos extensos.
- No se dispone de información sobre la composición del dataset de entrenamiento, lo que dificulta evaluar posibles sesgos demográficos o culturales en las respuestas médicas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Hakeem-7B-GGUF
- Modelo base: https://huggingface.co/Vionex-digital/Hakeem-7B
- Licencia Falcon-LLM: https://falcon-lm.github.io/blog/falcon-h1/
- Modelo base original (Falcon-H1-7B-Instruct): https://huggingface.co/tiiuae/Falcon-H1-7B-Instruct
