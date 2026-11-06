# Privoid-ai/Privoid-Action-1B

## Resumen

Privoid Action-1B es un adaptador LoRA experimental sobre el modelo IBM Granite 4.0 1B, desarrollado por Privoid-ai, cuyo propósito es extraer elementos de acción, decisiones y peticiones sin resolver a partir de segmentos cortos de transcripciones de reuniones en inglés, con etiquetas de hablante. La salida se estructura como JSON conforme a un esquema versionado (v1.0) que incluye citas textuales de evidencia, identificadores de turno y marcas de revisión. El modelo está pensado para ejecutarse localmente en una GPU de consumo y no requiere servicios externos.

El adaptador se entrenó exclusivamente con datos sintéticos generados a partir de plantillas, sin utilizar transcripciones reales en ninguna de las dos fases de entrenamiento. Esta decisión de diseño explica el rendimiento casi perfecto en los conjuntos de prueba sintéticos y, al mismo tiempo, la caída drástica de precisión en reuniones reales: en el conjunto de prueba bloqueado AMI detectó aproximadamente 1 de cada 3 acciones vinculadas (10/28) y 1 de cada 6 decisiones vinculadas (12/72); en el corpus ICSI, de estilo distinto, solo encontró el 7 % de las decisiones. El autor presenta el modelo explícitamente como una vista previa experimental y no como un producto terminado.

La relevancia del proyecto reside en su enfoque de ingeniería: el validador forma parte del sistema, de modo que las citas que no coinciden con la transcripción se ajustan o se rechazan, nunca se reparan con contenido inventado. Esto convierte al modelo en una herramienta de sugerencia para revisión humana, adecuada para prototipado y experimentación con extracción de información en reuniones, pero no para producción sin supervisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: IBM Granite 4.0 1B) con adaptador LoRA |
| Parametros totales | 1,63 B (modelo base en bf16); el adaptador LoRA añade un conjunto reducido de pesos |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Segmentos probados de hasta ~1.536 tokens de transcripción; entrenamiento con ejemplos de hasta 4.096 tokens (los más largos se excluyeron) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones específicas; el adaptador se distribuye en safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se descarga por separado desde ibm-granite/granite-4.0-1b |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (r=16, alpha=32, dropout=0,05) aplicado sobre las proyecciones q/k/v/o y las proyecciones de entrada/salida del bloque MLP del modelo base IBM Granite 4.0 1B, fijado en la revisión `6a7381ba1f54d684ff508d991aeb7dc580157103`. El entrenamiento se dividió en dos fases. La primera consistió en 2 épocas sobre 6.572 segmentos sintéticos (677 para desarrollo), con tasa de aprendizaje 2e-4 coseno, batch efectivo 16 y 822 pasos, durante 7,9 horas. Los datos sintéticos se generaron con plantillas que cubren escenarios de producto, ingeniería, ventas, operaciones, personal y finanzas; los ejemplos de más de 4.096 tokens se excluyeron en lugar de truncarse.

La segunda fase, de refuerzo, añadió 79 pasos (37 minutos) con tasa 1e-4 y batch efectivo 8 sobre 640 ejemplos: 340 composites largos construidos uniendo varios segmentos sintéticos para aproximar la longitud de reuniones reales, y 300 repeticiones de datos de la primera fase. Todo el entrenamiento se ejecutó en una única RTX 3060 de 12 GB. No se utilizó texto de reuniones reales en ninguna fase. La innovación principal no está en la arquitectura, sino en el contrato de validación que acompaña al adaptador: `privoid_action.contract.validate_output(..., ground=True)` ajusta citas que difieren solo en muletillas o repeticiones, reubica citas que aparecen en otro turno y elimina propietarios no encontrados en la evidencia; cualquier registro que siga fallando se rechaza en lugar de repararse.

## Capacidades

- Extracción de elementos de acción a partir de transcripciones de reuniones con turnos y hablantes etiquetados, con tarea, propietario, estado de asignación, plazo y condiciones.
- Detección de decisiones, distinguiendo entre activas y revertidas.
- Identificación de peticiones sin resolver, clasificadas como sin respuesta, rechazadas, aplazadas o poco claras.
- Generación de citas textuales de evidencia por cada registro, con banderas de revisión.
- Conversión determinista de plazos a fechas cuando son inequívocos; los propietarios y plazos desconocidos se dejan vacíos en lugar de adivinarse.
- Salida estructurada en JSON conforme al esquema v1.0 documentado en `docs/SCHEMA.md`.
- Validación integrada de la salida (ajuste o rechazo de citas y propietarios).
- Servicio local FastAPI incluido, que carga solo desde archivos locales y no registra ni almacena transcripciones.
- No soporta tool calling, agentes autónomos, audio, ASR, diarización, resumen de reunión completa en una pasada, chat ni Q&A.

## Casos de uso

- Prototipado de asistentes de reuniones: el modelo procesa segmentos de hasta ~1.536 tokens y devuelve JSON con acciones y decisiones, lo que permite construir un pipeline de extracción con revisión humana antes de integrarlo en herramientas de gestión de tareas.
- Investigación sobre extracción de información: sirve como referencia reproducible para estudiar la brecha entre datos sintéticos y reuniones reales, dado que el autor publica resultados en AMI e ICSI y un conjunto de prueba bloqueado.
- Evaluación de contratos de validación: el validador integrado permite experimentar con técnicas de anclaje de citas y rechazo de registros inválidos en sistemas de extracción estructurada.
- Despliegue local con privacidad: al ejecutarse en una GPU de consumo y no registrar transcripciones, es adecuado para pruebas en entornos donde el texto de las reuniones no puede salir de la máquina.
- Generación de borradores de actas para revisión: las citas textuales y las banderas de revisión facilitan que un humano verifique cada elemento antes de crear tareas o enviar mensajes.
- Análisis de estilo de reuniones: comparar el rendimiento en corpus como AMI e ICSI ayuda a caracterizar qué estilos de habla degradan la extracción y a diseñar preprocesamientos o segmentaciones alternativas.
- Docencia y demostraciones: el tamaño reducido y la licencia Apache 2.0 permiten usarlo en cursos sobre PEFT, evaluación de modelos y diseño de esquemas de salida estructurada.

## Benchmarks y rendimiento

Resultados del conjunto de prueba bloqueado, ejecutado una vez tras registrar los criterios de aceptación el 2026-10-27T18:26:26. Los datos sintéticos incluyen plantillas familiares y plantillas retenidas (familias de escenario no vistas en entrenamiento). El intervalo de confianza al 95 % para el F1 de acciones en plantillas retenidas es 0,979–0,993 (bootstrap por clúster).

| Sistema | Conjunto | n | F1 acciones | F1 decisiones | F1 peticiones | Precisión propietario | Precisión estado | FP sin acción | Totalmente válido |
|---|---|---|---|---|---|---|---|---|---|
| Privoid Action-1B | plantillas familiares | 401 | 1,000 | 0,995 | 0,989 | 0,991 | 0,998 | 0,000 | 0,995 |
| Privoid Action-1B | plantillas retenidas | 391 | 0,986 | 0,981 | 0,946 | 0,962 | 0,977 | 0,043 | 0,972 |
| Rules baseline | plantillas familiares | 401 | 0,761 | 0,830 | 0,833 | 0,996 | 0,893 | 0,204 | 1,000 |

En reuniones reales, con el validador aplicado, el modelo encontró 10 de 28 acciones vinculadas y 12 de 72 decisiones vinculadas en el conjunto bloqueado AMI, y el 7 % de las decisiones en ICSI. La model card no proporciona F1 agregados para AMI o ICSI más allá de estos recuentos, y no se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base tiene 1,63 B parámetros en bf16 (aproximadamente 3,3 GB de pesos) más el adaptador LoRA; con overhead de inferencia cabe holgadamente en GPUs de 8 GB o más. No se documentan cifras exactas de VRAM en la model card.
- GPU de entrenamiento: una única RTX 3060 de 12 GB, según el autor.
- GPU recomendadas para inferencia: cualquier GPU de consumo con al menos 8 GB (RTX 3060, RTX 4060 Ti, RTX 4090) o GPUs de datacenter (A100, H100) si se necesita mayor throughput.
- Despliegue: el repositorio incluye un servicio FastAPI local (`privoid_action_api/`) que carga desde archivos locales; la inferencia se realiza con `transformers` 5.5.0, `peft` 0.20.0 y `torch` 2.11.0. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Privoid Action-1B | 1,63 B (base) + LoRA | Segmentos de ~1.536 tokens probados | Extracción de acciones y decisiones en reuniones, con validador | Apache 2.0 | Hugging Face (adaptador PEFT) |
| IBM Granite 4.0 1B | 1,63 B | no disponible en la información proporcionada | Modelo base de propósito general | Apache 2.0 (según el modelo base referenciado) | Hugging Face (ibm-granite/granite-4.0-1b) |
| Rules baseline (del propio autor) | no aplica | no aplica | Reglas heurísticas para la misma tarea | no disponible | Incluido en la evaluación del autor |

No se dispone de datos comparativos con otros adaptadores especializados en extracción de acciones de reuniones en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos: no se usó texto de reuniones reales en ninguna fase, lo que provoca una brecha severa entre los resultados sintéticos y el rendimiento en reuniones reales.
- En el conjunto bloqueado AMI encontró aproximadamente 1 de cada 3 acciones vinculadas (10/28) y 1 de cada 6 decisiones vinculadas (12/72); en ICSI, solo el 7 % de las decisiones.
- Los resultados casi perfectos en conjuntos sintéticos miden el aprendizaje del formato y de la tarea sobre texto limpio, no la precisión en reuniones reales.
- Cada salida es una sugerencia para revisión humana; el modelo y el código no envían mensajes, crean tareas ni comprometen a nadie.
- Fuera de alcance: audio, reconocimiento de voz, diarización e identificación de hablantes, resumen de reunión completa en una pasada, chat y Q&A, ejecución autónoma de tareas e idiomas distintos del inglés.
- El uso del adaptador con `transformers` y `peft` sin el validador produce salidas con citas y propietarios no verificados; el autor desaconseja ese uso.
- Riesgo de alucinación mitigado parcialmente por el validador, que rechaza registros inválidos en lugar de repararlos, pero no elimina los falsos negativos ni los errores de interpretación.
- Limitación de idioma: solo inglés; no se documenta soporte multilingüe.
- Licencia Apache 2.0, que permite uso comercial, pero el estado experimental y la baja precisión en reuniones reales desaconsejan su uso en producción sin supervisión.
- No se documentan sesgos específicos ni evaluaciones de sesgo en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/Privoid-ai/Privoid-Action-1B
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-1b
- Esquema de salida: `docs/SCHEMA.md` (incluido en el repositorio del modelo)
- Documentación de la API: `docs/API.md` (incluida en el repositorio del modelo)
- Resultados del test bloqueado: `results/final_test.json` (incluido en el repositorio del modelo)
- Ejemplo de petición: `examples/request_accepted_request.json` (incluido en el repositorio del modelo)
