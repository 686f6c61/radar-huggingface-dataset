# mkieffer/LFM3-FHIR-demo-v1

## Resumen

LFM3-FHIR-demo-v1 es un ajuste fino del modelo LiquidAI/LFM3-1.7B orientado a la interacción con servidores FHIR R4 sobre registros de salud electrónicos sintéticos. Lo desarrolla el usuario mkieffer y se publica como una familia de versiones (v1, v2 y v3), de las cuales la v1 que aquí se documenta corresponde al ajuste supervisado SFT v0.6.1 con los prompts v0.2.2. El modelo actúa como agente de búsqueda y actualización: recibe una petición en lenguaje natural de un clínico o administrativo y una herramienta `fhir_request` (GET, POST, PUT con If-Match, DELETE y transaction Bundles), localiza al paciente, lee los recursos necesarios, aplica el cambio solicitado y responde con un JSON y la evidencia `Type/id` consultada.

El modelo parte de la arquitectura LFM3 de LiquidAI, con 1.728.801.600 parámetros totales, y se distribuye exclusivamente en formato GGUF cuantizado Q4_K_M (1,10 GB por fichero), pensado para ejecutarse en CPU de portátil o incluso en una pestaña de navegador mediante llama.cpp. Esta ligereza es su principal atractivo: permite desplegar un agente FHIR de demostración sin infraestructura GPU dedicada.

Es relevante ahora porque demuestra que un modelo de menos de 2.000 millones de parámetros, ajustado con datos sintéticos de tool-calling y cuantizado con importance matrix, puede resolver una fracción sustancial de tareas agénticas sobre FHIR. No obstante, el propio autor advierte que se trata de una herramienta de investigación y demostración sobre historiales sintéticos, no de un producto clínico: falla en aproximadamente dos de cada cinco tareas de lenguaje natural y realiza escrituras dañinas en torno al 2% de los casos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia LFM3 de LiquidAI), ajuste fino con SFT y quantización GGUF |
| Parámetros totales | 1.728.801.600 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16K tokens en la evaluación del autor (contexto de evaluación; el contexto nativo del modelo base no se detalla en la información disponible) |
| Tipos de cuantización | Q4_K_M (con importance matrix); también se sirvió un GGUF BF16 para comparación |
| Idiomas soportados | inglés (en) |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer LFM3-1.7B de LiquidAI. La versión v1 parte del SFT v0.6.1 con los prompts v0.2.2, entrenado sobre transcripciones de tool-calling generadas por Muse Glimmer 30B (datos sintéticos). Las versiones posteriores (v2 y v3) incorporan mejoras: v2 usa SFT v0.7 con resultados de búsqueda en JSON completo, y v3 añade entrenamiento por refuerzo con LoRA sobre la pista natural del benchmark fhir-env, además de resultados de búsqueda compactos (harness Lc). La cuantización se realizó a GGUF con importance matrix (imatrix).

La innovación técnica principal no está en la arquitectura del modelo base, sino en el contrato de herramienta y en el formato de presentación de resultados. En v3, cada Bundle de búsqueda se muestra como una línea por registro (`Type/id vN | field=value | ...`) con enlaces de paginación y total, descartando meta, texto narrativo y extensiones, y truncando valores de más de 300 caracteres con una sugerencia `GET Type/id`. Las lecturas por id, escrituras y errores mantienen el JSON FHIR completo, de modo que las actualizaciones se construyen sobre el registro íntegro. Este diseño reduce el consumo de contexto y mejora la precisión, aunque v1 no incorpora aún este formato compacto.

## Capacidades

- Generación de texto conversacional en inglés orientada a tareas administrativas y clínicas.
- Tool calling / function calling sobre el contrato `fhir_request`: GET search/read, POST, PUT con If-Match, DELETE y transaction Bundles.
- Razonamiento agéntico multi-turno (hasta 21 turnos en la evaluación de v3; v1 se evaluó con prompts v0.2.2).
- Búsqueda y lectura de recursos FHIR R4 (pacientes, medicaciones, tareas, mensajes de portal, etc.).
- Actualización de registros FHIR con construcción de peticiones a partir del recurso completo.
- Respuesta estructurada en JSON con evidencia `Type/id` de los recursos leídos.
- Capacidad de citar honestamente la evidencia recuperada (evaluada en el scorer v0.6.2).
- No dispone de visión, audio ni modo de pensamiento explícito según la información disponible.
- Multilingüe: no disponible; solo inglés.

## Casos de uso

- Demostración interactiva de agente FHIR en navegador: gracias a su cuantización Q4_K_M de 1,10 GB, el modelo puede servirse con llama.cpp y ejecutarse en una pestaña del navegador o en la CPU de un portátil, lo que permite mostrar el flujo completo de búsqueda y actualización sobre historiales sintéticos sin infraestructura.
- Prototipado de pipelines de reconciliación de medicación: el modelo recibe una petición como "abrir una tarea de conciliación por discrepancia de medicación, sin cambios en fármacos", localiza al paciente, lee los recursos relevantes y crea la tarea correspondiente.
- Generación de tareas administrativas a partir de mensajes de portal: el agente interpreta el mensaje del paciente, consulta los recursos asociados y crea o actualiza el recurso `Task` con la evidencia citada.
- Evaluación de contratos de herramientas FHIR: sirve como banco de pruebas para validar el diseño de una API `fhir_request` y el formato de resultados devueltos antes de conectar un modelo mayor.
- Investigación sobre agentes pequeños con tool calling: permite estudiar el equilibrio entre éxito estricto, seguridad (escrituras dañinas) y consumo de contexto en modelos de menos de 2B parámetros.
- Formación y docencia sobre FHIR R4: al ejecutarse localmente y sobre datos sintéticos, es adecuado para talleres donde los alumnos practiquen consultas y actualizaciones sin riesgo sobre datos reales.
- Pruebas de integración en CI/CD: el GGUF puede cargarse en tests automatizados que verifiquen el comportamiento del agente frente a un servidor FHIR simulado, con la advertencia de que las escrituras propuestas requieren revisión humana.

## Benchmarks y rendimiento

Los datos publicados corresponden principalmente a la versión v3. Para v1 no se han publicado resultados específicos de benchmarks en la información disponible. Se recogen a continuación los resultados de v3 como referencia de la familia, comparados con los modelos SFT de los que deriva.

| Split (v0.2.3.5, harness Lc) | Tareas | Strict [IC 95%] | Safe | Tasa de escritura dañina | Lecturas | Escrituras | Fuera de contexto |
|---|---|---|---|---|---|---|---|
| dev | 1.937 | 61,4% [59,3; 63,6] | 60,8% | 2,1% | 61% | 62% | 0,8% |
| held-out | 1.620 | 60,2% [57,7; 62,5] | 59,7% | 2,0% | 58% | 62% | 0,6% |

| Modelo | Dev strict | Δ vs v3 | Held-out strict | Δ vs v3 | Daño dev / held-out |
|---|---|---|---|---|---|
| v3 (SFT v0.7-Lc + LoRA RL) | 61,4% | referencia | 60,2% | referencia | 2,1% / 2,0% |
| SFT v0.8-Lc (no publicado) | 59,3% | −2,1 [−3,7; −0,4] | 57,3% | −2,9 [−4,7; −1,0] | 1,0% / 1,1% |
| SFT v0.7-Lc (punto de partida de v3) | 57,4% | −4,0 [−5,6; −2,4] | 55,9% | −4,3 [−6,1; −2,4] | 1,0% / 1,5% |

| Modelo (harness L, JSON completo) | Dev strict | Δ vs v3 | Fuera de contexto |
|---|---|---|---|
| v3 | 55,4% | referencia | 12,4% |
| modelo de v2 (SFT v0.7) | 49,8% | −5,6 [−7,4; −3,8] | 14,5% |

Puntos débiles declarados: las tareas que crean un registro y actualizan otro (CRU) obtienen un 4% en dev y un 0% en held-out (27 y 24 tareas respectivamente). El profesor rara vez las resuelve, por lo que los datos de SFT apenas contienen ejemplos y el RL no las recuperó.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 1,10 GB, por lo que la inferencia cabe holgadamente en cualquier GPU con 4 GB o más; en BF16 el requisito es mayor, aunque no se detalla en la información disponible.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del GGUF Q4_K_M.
- Ejecución en CPU: el autor indica que está pensado para ejecutarse en la CPU de un portátil o en una pestaña de navegador.
- Opciones de despliegue: llama.cpp (`llama-server`, versión b12098 usada en la evaluación), vLLM con pesos BF16 para evaluación, y el demo de navegador de fhir-env.
- Latencia y throughput: no disponible; la evaluación reporta 4.096 tokens por llamada, temperatura 0,1, top_k 50 y hasta 21 turnos, pero no cifras de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (dev strict, Lc) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-FHIR-demo v1 (este) | 1,73B | 16K en evaluación | no disponible para v1 | lfm1.0 | GGUF en Hugging Face |
| LFM3-FHIR-demo v3 | 1,73B | 16K en evaluación | 61,4% | lfm1.0 | GGUF en Hugging Face |
| SFT v0.8-Lc (no publicado) | 1,73B | 16K en evaluación | 59,3% | no disponible | no publicado |
| Modelo de v2 (SFT v0.7) | 1,73B | 16K en evaluación | 57,4% (Lc) / 49,8% (L) | lfm1.0 | GGUF en Hugging Face |

No se dispone de comparaciones con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Solo para investigación y demostración sobre historiales sintéticos; no es un dispositivo médico ni se ha validado sobre datos reales de EHR.
- No debe usarse para decisiones clínicas ni conectarse a un EHR de producción con permisos de escritura.
- Falla en aproximadamente dos de cada cinco tareas de lenguaje natural; toda escritura propuesta requiere revisión humana.
- Realiza una escritura dañina (cambio incorrecto en el historial) en torno al 2% de las tareas, el doble que el mejor modelo solo SFT (SFT v0.8, aproximadamente 1%).
- Solo inglés y ajustado al contrato de herramienta y al system prompt de fhir-env; fuera de ese contrato el comportamiento no está garantizado.
- Punto débil específico: tareas CRU (crear un registro y actualizar otro) con 4% en dev y 0% en held-out.
- El formato de resultados de búsqueda importa: los Bundles JSON completos consumen el contexto de 16K y reducen la puntuación unos 6 puntos frente a resultados compactos.
- Licencia lfm1.0: es necesario revisar los términos para uso comercial; la model card la etiqueta como "other".
- Riesgo de alucinación en la evidencia citada: el scorer evalúa la honestidad de las citas, lo que implica que el modelo puede citar recursos incorrectos.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mkieffer/LFM3-FHIR-demo-v1
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia: LICENSE (referenciada en la model card del repositorio)
- Benchmark fhir-env: no disponible como enlace directo en la información proporcionada
- Demo de navegador de fhir-env: no disponible como enlace directo en la información proporcionada
