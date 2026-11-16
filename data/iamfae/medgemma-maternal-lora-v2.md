# iamfae/medgemma-maternal-lora-v2

## Resumen

medgemma-maternal-lora-v2 es un adaptador LoRA (entrenado con QLoRA) sobre el modelo multimodal Google MedGemma 4B (variante instruction-tuned), desarrollado por Dawa Health con financiación de UNICEF. Su propósito es adaptar el modelo base a la información sobre salud materna y reproductiva en siete idiomas usados en Zimbabue y Zambia: inglés, shona, ndebele, tonga, chinyanja (nyanja), bemba y lozi. La versión 2 continúa el entrenamiento desde el adaptador v1 sin añadir nuevas capas LoRA, incorporando datos de preguntas y respuestas revisadas por clínicos, un conjunto semilla sobre anticoncepción y conversaciones reales del asistente de Dawa Health (Rudo, en WhatsApp).

El adaptador no modifica ni evalúa las capacidades de visión del modelo base: está entrenado solo con texto. Su repo ocupa 0,2 GB y se distribuye en formato safetensors compatible con PEFT. Está pensado para investigación y desarrollo de asistentes multilingües de salud materna con revisión humana, no como dispositivo médico.

Su relevancia actual radica en que aborda un nicho poco cubierto: la adaptación de un modelo médico de 4B a idiomas africanos de bajos recursos, con datos clínicos locales y un enfoque explícito de código-switching. La model card documenta con transparencia limitaciones serias (errores clínicos, bucles de repetición, calidad desigual por idioma), lo que lo convierte en un caso útil para estudiar despliegue responsable de LLM médicos en contextos de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer decoder-only multimodal (MedGemma 4B instruction-tuned) |
| Parametros totales | no disponible (adaptador LoRA sobre base de 4B; tamano del repo 0,2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no especificada en la informacion disponible) |
| Tipos de cuantizacion | QLoRA (entrenamiento cuantizado); cuantizaciones de inferencia del adaptador no disponibles |
| Idiomas soportados | en, sn, nd, ny, bem, loz, toi |
| Licencia | agpl-3.0-and-hai-def (AGPL-3.0 para las contribuciones de Dawa Health, mas terminos Health AI Developer Foundations del modelo base) |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/medgemma-4b-it, un modelo decoder-only multimodal de 4B parametros. El entrenamiento emplea QLoRA, técnica que congela los pesos del modelo base en precisión reducida y entrena matrices de bajo rango. La v2 no añade capas LoRA nuevas: continúa el entrenamiento desde el adaptador v1 (dawahealth/medgemma-maternal-lora), por lo que se carga igual que aquel. El entrenamiento fue exclusivamente textual; las capacidades de imagen del modelo base no se entrenaron ni se evaluaron.

Los datos de v2 incluyen preguntas y respuestas revisadas por clínicos extraídas de documentos, un conjunto semilla sobre anticoncepción y conversaciones reales del asistente Rudo de Dawa Health, estas últimas repetidas tres veces en el entrenamiento. La cobertura por idioma y tarea es desigual: shona, ndebele y tonga solo recibieron guías semanales de embarazo sin ejemplos de pregunta-respuesta; las FAQ sobre cáncer cervical existen solo en inglés, bemba, chinyanja y lozi; y los nuevos datos de v2 son mayoritariamente en inglés. La model card menciona uso de Unsloth en el pipeline de entrenamiento.

## Capacidades

- Generación de texto sobre salud materna y reproductiva: semanas de embarazo, cáncer cervical, fertilidad, anticoncepción y preocupaciones antenatales comunes.
- Conversación multi-turno en siete idiomas, con manejo de código-switching (mezcla de inglés y lenguas locales) según los datos de conversaciones reales incluidas en v2.
- Respuesta a preguntas de tipo FAQ y guías semanales de embarazo, cuando existen datos para el idioma y la tarea correspondientes.
- Capacidades multimodales del modelo base (visión) presentes en los pesos heredados pero no entrenadas ni evaluadas en este adaptador.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso.

## Casos de uso

- Asistente de salud materna por WhatsApp: integración en el flujo de Rudo de Dawa Health para responder dudas sobre embarazo semana a semana, con recuperación de guías verificadas y derivación a revisión humana en casos sensibles.
- Información sobre anticoncepción en inglés y lenguas locales: el conjunto semilla de v2 permite responder preguntas básicas sobre métodos anticonceptivos, siempre con revisión clínica previa a la exposición al paciente.
- Educación sobre cáncer cervical: uso de las FAQ disponibles en inglés, bemba, chinyanja y lozi para responder preguntas frecuentes en campañas de cribado.
- Investigación sobre LLM médicos multilingües: servir como caso de estudio para evaluar degradación de calidad en idiomas de bajos recursos y diseñar mitigaciones (penalización de repetición, grounding en guías).
- Formación de agentes comunitarios de salud: generar borradores de respuestas en lengua local que el agente revisa y adapta antes de comunicarse con la paciente.
- Prototipado de asistentes con código-switching: probar pipelines que alternan inglés y shona o bemba en conversaciones reales, usando los datos de conversación de v2 como referencia de estilo.
- Evaluación de salvaguardas en producción: testear flujos de derivación a humano basados en palabras clave, dado que la model card advierte que el modelo puede emitir u omitir esos términos de forma incorrecta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta observaciones cualitativas de evaluación: al menos una respuesta en inglés fue clínicamente incorrecta (afirmó que una infección urinaria en el embarazo provoca caída de frecuencia cardiaca fetal y bacterias en pulmones del bebé), y con decodificación greedy 17 de 133 respuestas entraron en bucles de repetición, concentradas en bemba (8 de 14), chinyanja, lozi y shona. Las puntuaciones de solapamiento con textos de referencia no detectan errores clínicos de este tipo, y las puntuaciones altas en ndebele, tonga y lozi se explican en parte por reproducción literal de frases cortas repetidas en las referencias.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el adaptador (0,2 GB) se suma al modelo base MedGemma 4B, que requiere aceptar los términos de acceso en Hugging Face antes de descargarlo.
- GPU recomendadas: no disponible; al tratarse de un adaptador sobre un modelo de 4B, es plausible su ejecución en GPUs de consumo, pero no hay datos confirmados en la información disponible.
- Opciones de despliegue: librería PEFT para cargar el adaptador sobre el modelo base; el resto de stacks (vLLM, llama.cpp, Ollama, TGI) no se documentan en la información disponible.
- Latencia y throughput: no disponibles.
- Recomendación de inferencia documentada: usar penalización de repetición (por ejemplo `repetition_penalty=1.15`) para mitigar los bucles de repetición observados con decodificación greedy.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| iamfae/medgemma-maternal-lora-v2 | Adaptador sobre base 4B | no disponible | en, sn, nd, ny, bem, loz, toi | AGPL-3.0 + HAI-DEF | Adaptador LoRA de salud materna, datos clínicos locales, v2 con Q&A revisado |
| dawahealth/medgemma-maternal-lora (v1) | Adaptador sobre base 4B | no disponible | mismas lenguas (segun v2) | AGPL-3.0 + HAI-DEF | Versión anterior; v2 continúa su entrenamiento sin nuevas capas |
| google/medgemma-4b-it | 4B | no disponible | no disponible en la informacion | HAI-DEF (gated) | Modelo base multimodal instruction-tuned; sin adaptación a salud materna local |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Contenido clínico incorrecto: se documentó al menos una respuesta en inglés clínicamente errónea emitida con confianza; las métricas de solapamiento no detectan este tipo de fallo.
- Bucles de repetición con decodificación greedy: afectaron 17 de 133 respuestas en la evaluación, principalmente en bemba, chinyanja, lozi y shona; mitigar con penalización de repetición.
- Calidad desigual por idioma: shona, chinyanja y bemba rinden peor en texto libre; las puntuaciones altas en ndebele, tonga y lozi reflejan en parte reproducción literal de frases de referencia. Ninguna salida ha sido revisada por hablantes nativos.
- Cobertura por tarea limitada: shona, ndebele y tonga solo tienen guías semanales de embarazo sin ejemplos conversacionales; las FAQ de cáncer cervical existen solo en inglés, bemba, chinyanja y lozi; los datos nuevos de v2 son mayoritariamente en inglés.
- Huecos temáticos en el material fuente: por ejemplo, prevención de malaria, pruebas de VIH y preeclampsia no aparecen en la guía en bemba; no confiar en el modelo para esos temas.
- Posible memorización de texto de usuarios: conversaciones reales se incluyeron repetidas tres veces en el entrenamiento; la model card pide confirmar que se eliminaron identificadores personales.
- Flujos de palabras clave para derivación a humano pueden fallar (emisión u omisión incorrecta de términos).
- El modelo no fue entrenado con precios, listas de productos ni datos personales y no debe usarse como fuente de ellos.
- Uso fuera de alcance: diagnóstico, triaje de emergencias, decisiones de tratamiento, consejo de medicación o dosificación, sustitución de personal sanitario.
- Licencia: AGPL-3.0 para las contribuciones de Dawa Health, con obligaciones de copyleft para uso en red; además aplican los términos Health AI Developer Foundations del modelo base, que restringen el uso comercial y clínico.
- El modelo base está gated: es necesario aceptar los términos de MedGemma en Hugging Face antes de su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamfae/medgemma-maternal-lora-v2
- Adaptador v1: https://huggingface.co/dawahealth/medgemma-maternal-lora
- Modelo base: https://huggingface.co/google/medgemma-4b-it
- Web de Dawa Health: https://dawa-health.com/
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.en.html
- Paper referenciado (QLoRA): https://arxiv.org/abs/1910.09700 (arXiv:1910.09700)
- Paper referenciado (MedGemma): https://arxiv.org/abs/2507.05201 (arXiv:2507.05201)
