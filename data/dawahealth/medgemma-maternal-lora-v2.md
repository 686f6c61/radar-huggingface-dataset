# dawahealth/medgemma-maternal-lora-v2

## Resumen

medgemma-maternal-lora-v2 es un adaptador LoRA (entrenado con QLoRA) desarrollado por Dawa Health, con financiación de UNICEF, que especializa el modelo multimodal MedGemma 4B (google/medgemma-4b-it) en información sobre salud materna y reproductiva en siete idiomas hablados en Zimbabue y Zambia. El adaptador se construye sobre una versión previa (v1) y añade datos de preguntas y respuestas revisadas por clínicos, un conjunto semilla sobre anticoncepción y conversaciones reales del asistente de Dawa Health.

La relevancia del proyecto radica en su enfoque hacia lenguas africanas de bajos recursos (shona, ndebele, tonga, chinyanja, bemba, lozi) en un dominio sanitario sensible, donde la cobertura de modelos abiertos es escasa. No obstante, la propia model card documenta limitaciones importantes: calidad desigual en lenguas minoritarias, errores clínicos detectados en evaluación y bucles de repetición con decodificación greedy. Es un artefacto de investigación y desarrollo, no un dispositivo médico.

El adaptador se distribuye bajo licencia AGPL-3.0 combinada con los términos de Health AI Developer Foundations (HAI-DEF) del modelo base, y requiere aceptar las condiciones de MedGemma en Hugging Face para su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre transformer decoder-only multimodal (MedGemma 4B instruction-tuned) |
| Parametros totales | No disponible para el adaptador; modelo base de 4B (aproximado por nombre) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | QLoRA (entrenamiento cuantizado de 4 bits); cuantizaciones de inferencia no especificadas |
| Idiomas soportados | Inglés, shona (sn), ndebele (nd), chinyanja/nyanja (ny), bemba (bem), lozi (loz), tonga (toi) |
| Licencia | AGPL-3.0 y HAI-DEF (Health AI Developer Foundations) |
| Formato de pesos | safetensors (adaptador PEFT) |
| Libreria | peft |
| Tamano del repo | 0,2 GB |
| Modelo base | google/medgemma-4b-it (acceso restringido) |
| Entrenamiento | Solo texto; capacidades de imagen no entrenadas ni evaluadas |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA sobre MedGemma 4B instruction-tuned, un transformer decoder-only multimodal. La versión v2 continúa el entrenamiento desde el adaptador v1 sin añadir nuevas capas LoRA, por lo que se carga sobre el modelo base exactamente igual que v1. El entrenamiento se realizó únicamente sobre texto; las capacidades de imagen del modelo base no se entrenaron ni se evaluaron.

Los datos de entrenamiento de v2 incluyen preguntas y respuestas revisadas por clínicos extraídas de documentos, un conjunto semilla sobre anticoncepción y conversaciones reales de usuarios del asistente de Dawa Health (repetidas tres veces en el entrenamiento). La cobertura por tarea es desigual: shona, ndebele y tonga solo se entrenaron con guías semanales de embarazo, sin ejemplos de preguntas y respuestas; las FAQ sobre cáncer cervical existen solo en inglés, bemba, chinyanja y lozi; y los nuevos datos de v2 son mayoritariamente en inglés. No se documentan detalles sobre número total de tokens, composición exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Generación de texto en el dominio de salud materna y reproductiva: información sobre semanas de embarazo, cáncer cervical, fertilidad, anticoncepción y preocupaciones antenatales comunes.
- Respuesta a preguntas conversacionales multi-turno, incluyendo conversaciones con cambio de código (code-switching) entre idiomas.
- Soporte multilingüe en siete idiomas: inglés, shona, ndebele, chinyanja, bemba, lozi y tonga, con calidad muy variable entre ellos.
- Integración como adaptador PEFT sobre el modelo base MedGemma 4B, lo que permite combinarlo con las capacidades multimodales del base (aunque no entrenadas ni evaluadas en este adaptador).
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso.
- El modelo puede desviarse fuera del dominio (la model card cita como ejemplo dar consejo laboral genérico al preguntar por empleo).

## Casos de uso

- Asistente de información maternal en WhatsApp: el adaptador se integra en el asistente Rudo de Dawa Health para responder preguntas sobre el embarazo semana a semana, con recuperación de contenido de guías verificadas y revisión humana en casos sensibles.
- Información sobre anticoncepción: el conjunto semilla específico de v2 permite responder consultas básicas sobre métodos anticonceptivos en contexto de planificación familiar, siempre con revisión clínica previa.
- Educación sobre cáncer cervical: las FAQ entrenadas (en inglés, bemba, chinyanja y lozi) permiten desplegar respuestas informativas sobre cribado y prevención en esas lenguas.
- Apoyo a agentes comunitarios de salud: como borrador de respuestas en lenguas locales que el personal sanitario revisa antes de transmitirlas a la paciente.
- Investigación en NLP sanitario multilingüe: sirve como punto de partida para estudiar la adaptación de modelos médicos a lenguas africanas de bajos recursos y el comportamiento con code-switching.
- Prototipado de asistentes conversacionales con contexto largo: al heredar la ventana de contexto de MedGemma 4B (longitud no especificada en la información disponible), permite experimentar con diálogos multi-turno en dominio materno.
- Evaluación comparativa de adaptadores LoRA: al ser un adaptador pequeño (0,2 GB) sobre un base de 4B, es útil para experimentos de ajuste fino eficiente en dominios de nicho.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card menciona una evaluación interna sobre 133 respuestas, en la que se detectaron 17 casos de bucles de repetición con decodificación greedy (8 de 14 en bemba), pero no se proporcionan métricas numéricas agregadas ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB; el requisito real viene del modelo base MedGemma 4B.
- VRAM estimada para inferencia: aproximadamente 8-10 GB en fp16 para el base de 4B; en cuantización de 4 bits puede reducirse a unos 3-4 GB, aunque no se especifican cuantizaciones de inferencia validadas para este adaptador.
- GPU recomendadas: A100 o H100 para despliegue en producción con mayor throughput; RTX 4090 o RTX 3090 para desarrollo e inferencia en fp16.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 de 12 GB o superiores en fp16, y en GPUs de 8 GB con cuantización de 4 bits (estimación, no validada en la model card).
- Opciones de despliegue: PEFT con Transformers (carga del adaptador sobre el base), vLLM y TGI para servir el modelo fusionado; llama.cpp/Ollama requerirían conversión a GGUF del modelo fusionado, no documentada.
- Latencia y throughput: no disponibles.
- Requisito previo: aceptar los términos de MedGemma en Hugging Face, ya que el modelo base está restringido.
- Recomendación de inferencia: usar `repetition_penalty=1.15` para mitigar los bucles de repetición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Idiomas | Licencia |
|---|---|---|---|---|---|
| medgemma-maternal-lora-v2 | Adaptador sobre base 4B | No disponible | Salud materna | 7 (en + 6 africanas) | AGPL-3.0 + HAI-DEF |
| google/medgemma-4b-it | 4B | No disponible en esta ficha | Médico general multimodal | Principalmente inglés | HAI-DEF |
| dawahealth/medgemma-maternal-lora (v1) | Adaptador sobre base 4B | No disponible | Salud materna | 7 | AGPL-3.0 + HAI-DEF |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada. La diferencia principal de v2 frente a v1 es la incorporación de datos de preguntas y respuestas revisadas por clínicos, el conjunto de anticoncepción y conversaciones reales.

## Limitaciones y advertencias

- Contenido clínico incorrecto: en evaluación, al menos una respuesta en inglés fue clínicamente errónea (afirmó que una infección urinaria en el embarazo provoca caída de la frecuencia cardíaca fetal y acumulación de bacterias en los pulmones del bebé). El modelo puede afirmar información falsa con seguridad.
- Bucles de repetición: con decodificación greedy repite frases hasta alcanzar el límite de tokens; afectó a 17 de 133 respuestas, principalmente en bemba (8 de 14), chinyanja, lozi y shona. Usar penalización de repetición.
- Calidad desigual en lenguas minoritarias: la salida en shona, chinyanja y bemba es débil en texto libre; las puntuaciones más altas en ndebele, tonga y lozi se explican en parte por la reproducción exacta de líneas cortas de referencia, no por generación fluida. Ninguna salida ha sido revisada por hablantes nativos.
- Cobertura por tarea: shona, ndebele y tonga solo tienen guías semanales de embarazo, sin ejemplos conversacionales; las FAQ de cáncer cervical solo existen en inglés, bemba, chinyanja y lozi.
- Lagunas en el material fuente: temas como prevención de malaria, pruebas de VIH y preeclampsia no aparecen en la guía bemba; no confiar en el modelo para esos temas.
- Posible memorización de texto de usuarios: se incluyeron conversaciones reales repetidas tres veces en el entrenamiento; no asumir que no puede reproducir fragmentos. La model card pide confirmar que se eliminaron identificadores personales antes del entrenamiento.
- Riesgo con palabras clave de derivación: si se integra en un asistente que actúa ante palabras clave (por ejemplo, derivación a agente humano), el modelo puede emitirlas u omitirlas incorrectamente.
- No entrenado en precios, listas de productos ni datos personales; no debe usarse como fuente para ellos.
- Fuera de alcance: diagnóstico, triaje de emergencias, decisiones de tratamiento, consejo de medicación o dosificación, sustitución de personal clínico y uso generalista.
- Licencia: AGPL-3.0 impone obligaciones de copyleft para uso en red; además aplican los términos HAI-DEF del modelo base, que restringen el uso comercial y clínico.
- Uso en producción: mantener supervisión humana, fundamentar respuestas en guías verificadas y etiquetadas por fuente, y validar con clínicos hablantes de cada idioma antes de cualquier uso con pacientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dawahealth/medgemma-maternal-lora-v2
- Adaptador v1: https://huggingface.co/dawahealth/medgemma-maternal-lora
- Modelo base MedGemma 4B: https://huggingface.co/google/medgemma-4b-it
- Web de Dawa Health: https://dawa-health.com/
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.en.html
- Paper de referencia (QLoRA): https://arxiv.org/abs/1910.09700
- Paper de referencia (MedGemma): https://arxiv.org/abs/2507.05201
