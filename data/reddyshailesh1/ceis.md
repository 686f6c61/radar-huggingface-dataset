# reddyshailesh1/ceis

## Resumen

CEIS (Clinical Evidence Intelligence System) es un modelo de clasificación de texto especializado en verificación de afirmaciones clínicas y evaluación de evidencia médica, desarrollado por Shailesh Reddy y Karthikeya. Se construye mediante fine-tuning del modelo base `convaiinnovations/laya` sobre el conjunto de datos MedNLI, con supervisión multi-tarea. El modelo aborda un problema concreto: determinar si una evidencia clínica respalda, contradice o no permite confirmar una afirmación médica, cuantificando además la suficiencia de la evidencia y la gravedad de posibles inconsistencias.

A diferencia de los LLM generativos convencionales o de los clasificadores de una sola cabeza, CEIS emplea la arquitectura de decisión no autorregresiva "System-1" de LAYA para evaluar simultáneamente cinco preguntas clínicas tipadas en un único paso forward. El modelo cuenta con 321.908.998 parámetros (~322 M) y está orientado a tareas de razonamiento clínico estructurado en inglés.

Su relevancia radica en la combinación de verificación de afirmaciones con inteligencia de evidencia cuantificada, un enfoque poco habitual en modelos de este tamaño. La licencia Apache 2.0 y su reducido tamaño lo hacen desplegable en hardware modesto, aunque su uso está restringido a investigación y evaluación de apoyo a la decisión clínica, no a diagnóstico directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo (System-1 decision architecture de LAYA) |
| Parametros totales | 321.908.998 (~322 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

CEIS se basa en LAYA, un modelo con arquitectura no autorregresiva de tipo "System-1 decision architecture". En lugar de generar texto token a token, el modelo realiza una pasada forward única para resolver múltiples preguntas tipadas de forma simultánea. Sobre esta base, el fine-tuning introduce una cabeza multi-tarea que evalúa cinco primitivas de decisión clínica: `verdict` (elección entre supported/unsupported/contradicted), `explicitly_mentioned` (booleano), `needs_more_evidence` (booleano), `evidence_sufficiency` (puntuación continua 0.0–1.0) e `inconsistency_severity` (puntuación continua 0.0–1.0).

El entrenamiento se realizó sobre MedNLI (`presencesw/mednli`) con optimizador AdamW, learning rate de 2e-05 y warmup de 0.06. La función de pérdida es entropía cruzada ponderada multi-tarea con pesos de 0.6 para `verdict`, 0.2 para `explicitly_mentioned` y 0.2 para `needs_more_evidence`. Se aplicó calibración de temperatura sobre grupos de premisas reservados (held-out premise groups) para garantizar puntuaciones de confianza fiables. El modelo base es multilingüe, aunque el fine-tuning y la evaluación se centran en inglés.

## Capacidades

- Verificación de afirmaciones clínicas: clasifica la relación entre evidencia y afirmación en supported, unsupported o contradicted.
- Detección de mención explícita: determina si la evidencia aborda explícitamente el tema de la afirmación (yes/no).
- Evaluación de necesidad de más evidencia: indica si se requiere documentación clínica adicional para concluir (yes/no).
- Cuantificación de suficiencia de evidencia: puntuación continua de 0.0 a 1.0 sobre la completitud de la evidencia.
- Cuantificación de gravedad de inconsistencia: puntuación continua de 0.0 a 1.0 cuando se detecta una contradicción.
- Inferencia multi-pregunta en una sola pasada forward (no autorregresiva).
- Salidas probabilísticas calibradas por temperatura para cada pregunta.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo resuelve cinco preguntas en un único paso, sin planificación multi-paso).
- Capacidades multilingües: no (solo inglés).
- Capacidades especiales: modo de decisión estructurada con preguntas tipadas (`choice`, `noul`/boolean, `score`).

## Casos de uso

- Verificación de afirmaciones en resúmenes clínicos: dado un resumen generado y el texto fuente, el modelo clasifica si cada afirmación está respaldada, no respaldada o contradicha, lo que permite filtrar alucinaciones en pipelines de generación de informes médicos.
- Evaluación de calidad de evidencia en revisiones sistemáticas: el modelo puntúa la suficiencia de la evidencia (0.0–1.0) para cada afirmación extraída, ayudando a priorizar qué afirmaciones requieren revisión manual por parte de un experto.
- Detección de contradicciones en historiales clínicos: con la puntuación `inconsistency_severity`, se pueden señalar discrepancias entre notas de ingreso y evolución que merezcan revisión, integrándose en sistemas de alerta temprana.
- Triaje de documentación incompleta: la salida `needs_more_evidence` permite identificar automáticamente afirmaciones que carecen de soporte documental suficiente, orientando solicitudes de información adicional.
- Enmascaramiento de afirmaciones no verificadas en asistentes clínicos: antes de mostrar una respuesta generada por un LLM, CEIS actúa como capa de verificación que descarta o marca afirmaciones no respaldadas por la evidencia citada.
- Anotación asistida de datasets clínicos: el modelo puede preetiquetar pares (claim, evidence) con las cinco primitivas, acelerando la construcción de corpus de NLI clínico para investigación.
- Control de calidad en codificación médica: verificar que las afirmaciones codificadas (p. ej., diagnósticos) están explícitamente mencionadas en la documentación de soporte, usando la salida `explicitly_mentioned`.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente) sobre MedNLI, split test, tarea de verificación de afirmaciones clínicas multi-tarea de 5 preguntas:

| Metrica | Valor |
|---|---|
| Accuracy | 0.7908 |
| Macro F1 | 0.793 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 322 M de parámetros, en fp32 requiere aproximadamente 1,3 GB solo para pesos; en fp16 unos 0,65 GB; en int8 unos 0,33 GB. El repo pesa 0,7 GB, coherente con pesos en fp16 o similar.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp32, o 1 GB para fp16. No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, e incluso GPUs integradas con suficiente memoria compartida).
- Opciones de despliegue: la librería oficial es `laya` (`pip install laya`), con carga mediante `laya.load("reddyshailesh1/ceis")` e inferencia con `agent.predict(state, questions)`. No se ha documentado soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CEIS (este modelo) | ~322 M | no disponible | Verificacion de afirmaciones clinicas multi-tarea (5 preguntas) | apache-2.0 | Hugging Face |
| convaiinnovations/laya (base) | no disponible | no disponible | Decision no autorregresiva multi-tarea | no disponible | Hugging Face |
| Clasificadores BERT-base para MedNLI | ~110 M | 512 tokens | NLI clinico de una sola cabeza (3 clases) | variable (MIT/Apache segun checkpoint) | Hugging Face |

La comparación con alternativas concretas no está disponible en la información proporcionada. CEIS se distingue por combinar cinco salidas tipadas en una sola pasada, frente a los clasificadores NLI convencionales que emiten una única etiqueta de tres clases.

## Limitaciones y advertencias

- El modelo no es un dispositivo médico certificado y no debe usarse como única base para diagnóstico o tratamiento; todas las salidas requieren revisión por profesionales sanitarios cualificados.
- Entrenado y evaluado únicamente en inglés; no soporta otros idiomas.
- Los benchmarks declarados (accuracy 0.7908, Macro F1 0.793) no están verificados de forma independiente (`verified: false`).
- Riesgo de alucinación: aunque es un clasificador y no un generador, las puntuaciones continuas (`evidence_sufficiency`, `inconsistency_severity`) y las probabilidades calibradas pueden ser inexactas en dominios clínicos distintos de MedNLI.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto: la longitud máxima de contexto no está documentada, lo que dificulta planificar el truncado de evidencias largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la advertencia clínica del autor restringe el uso a investigación y evaluación de apoyo a la decisión; el uso en producción clínica real queda bajo responsabilidad del integrador.
- El ecosistema de despliegue es limitado: depende de la librería `laya`, sin soporte documentado para servidores de inferencia estándar (vLLM, TGI, llama.cpp).
- Modelo con muy pocas descargas (38) y sin likes, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/reddyshailesh1/ceis
- Paper IEEE (PDF): https://huggingface.co/reddyshailesh1/ceis/resolve/main/CEIS_IEEE_Paper.pdf
- Repositorio GitHub: https://github.com/reddyshailesh1/Ceis
- Repositorio LAYA: https://github.com/NandhaKishorM/laya
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Dataset MedNLI: https://huggingface.co/datasets/presencesw/mednli
