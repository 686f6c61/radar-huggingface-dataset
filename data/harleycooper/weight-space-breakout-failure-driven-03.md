# HarleyCooper/weight-space-breakout-failure-driven-03

## Resumen

`weight-space-breakout-failure-driven-03` es un artefacto de investigación publicado por el usuario HarleyCooper en Hugging Face. No es un modelo de lenguaje: se trata de un controlador de juego para Breakout con 17.253 parámetros, serializado en formato safetensors, que actúa como política de reinforcement learning dentro de un experimento iterativo de "weight-space programming". El autor parte deliberadamente de una política defectuosa (controles invertidos) y utiliza un LLM externo (Qwen 3.6 35B A3B alojado en Prime Intellect) para proponer ediciones escalares sobre los pesos, evaluando cada candidato en 512 semillas emparejadas antes de promoverlo.

El interés del artefacto no reside en el controlador en sí, sino en el protocolo de reparación de pesos que documenta: un bucle acotado de diagnóstico de fallos, propuesta de ediciones, verificación estadística (ganancia media > 0,10 y `gain - 2·SE_emparejado > 0`) y publicación versionada. Es un ejemplo de ingeniería de agentes aplicada a la edición directa del espacio de pesos, con trazabilidad completa mediante hashes y manifiestos.

La relevancia actual es metodológica: demuestra cómo orquestar un LLM como editor de parámetros de un modelo pequeño, con separación estricta entre inferencia (Prime), orquestación (controlador ligero) y simulación (CPU en Hugging Face). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, coherente con sus 17.253 parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un transformer; controlador de política para Breakout (pesos serializados en safetensors y NPZ) |
| Parametros totales | 17.253 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible (pesos en safetensors y NPZ; sin variantes GGUF documentadas) |
| Idiomas soportados | No disponible (no procesa lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, `initial_baseline.safetensors`), `policy.npz`, `policy.json`, `manifest.json` |

## Arquitectura y entrenamiento

El objeto publicado es una política de control para el entorno Breakout, no una red neuronal de lenguaje. El checkpoint raíz contiene la política incumbente seleccionada por el protocolo iterativo; `initial_baseline.safetensors` preserva el punto de partida conocido como defectuoso (controles invertidos). El entrenamiento no es un preentrenamiento clásico: se trata de una búsqueda adaptativa en el espacio de pesos donde un editor LLM (`qwen/qwen3.6-35b-a3b`) propone hasta 64 asignaciones escalares por ronda, sin uso de herramientas en la configuración 0.2.1, y un verificador alojado en Prime valida las ediciones y compara candidato e incumbente sobre 512 semillas frescas emparejadas.

El protocolo fija fronteras deterministas: semillas de práctica `40000 + 32·ronda` a `40031 + 32·ronda`; semillas de promoción `60000 + 512·ronda` a `60511 + 512·ronda`; auditoría final `90000..91023`. Cada ronda registra checkpoint inicial, respuesta exacta del editor, hash del candidato, informe del verificador, decisión aceptar/rechazar, revisión publicada y resultado del episodio desplegado. La versión 0.3.0 añade la configuración `failure-driven-v1` con herramientas, simulaciones de práctica, hasta ocho turnos de edición, diagnóstico explícito y puertas de replay dirigido más evaluación amplia. La versión 0.4.3 incorpora reparación asistida por herramientas preparadas sin límite de turnos y con herramienta explícita de envío final.

## Capacidades

- Control de juego Breakout mediante política de pesos fijos; no genera texto ni procesa lenguaje natural.
- Edición iterativa del espacio de pesos guiada por un LLM editor externo (Qwen 3.6 35B A3B) con hasta 64 asignaciones escalares por propuesta.
- Diagnóstico de fallos y replay dirigido en la configuración `failure-driven-v1` (hasta 8 turnos de edición).
- Verificación estadística de candidatos sobre 512 semillas emparejadas con criterio de ganancia media y error estándar emparejado.
- Auditoría final independiente de 1.024 partidas contra la política defectuosa original.
- Serialización y publicación versionada de pesos con comprobación de hashes y checksums.
- No soporta tool calling, agentes multi-paso ni capacidades multilingües en el sentido habitual de un LLM; las "herramientas" descritas pertenecen al harness del editor, no al controlador.

## Casos de uso

- Investigación en weight-space programming: usar el protocolo como referencia para experimentos de edición directa de pesos con un LLM como editor, replicando las fronteras de semillas y las puertas estadísticas documentadas.
- Estudio de protocolos de verificación estadística: el criterio de aceptación (ganancia > 0,10 y `gain - 2·SE > 0`) sirve como plantilla para diseñar screens de promoción en pipelines de RL con presupuesto acotado.
- Docencia sobre separación de responsabilidades en sistemas agénticos: el artefacto ilustra cómo dividir inferencia (Prime), orquestación (controlador ligero) y simulación (CPU en Hugging Face) con trazabilidad por hash.
- Reproducción de experimentos de reparación de fallos: la configuración `failure-driven-v1` permite estudiar cómo un editor con herramientas y diagnóstico explícito mejora frente a la edición one-shot.
- Auditoría de integridad de artefactos: el uso de `manifest.json`, checksums y revisiones inmutables en el Hub es un caso práctico de cadena de custodia para pesos publicados.
- Benchmarking de controladores de Breakout: el controlador de 17.253 parámetros puede servir como baseline mínimo en entornos de RL ligeros que corren en CPU sin GPU.
- Estudio de límites de la búsqueda adaptativa: el autor advierte que los resultados pueden estancarse o que todos los candidatos pueden fallar, lo que convierte el artefacto en material para analizar mesetas en optimización de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo describe la tabla de rondas (incumbente, candidato, ganancia media, decisión) sin incluir valores numéricos en el extracto proporcionado, y no hay métricas de MMLU, HumanEval, GSM8K ni equivalentes por tratarse de un controlador de juego.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el controlador corre en CPU (la simulación se ejecuta en Hugging Face CPU según la model card).
- GPU recomendadas: ninguna para el juego; la inferencia del editor LLM (Qwen 3.6 35B A3B) se realiza en el entorno alojado de Prime Intellect, no en local.
- Cabe en cualquier consumer GPU o incluso sin GPU, dado el tamaño de 17.253 parámetros.
- Opciones de despliegue: simulación en Hugging Face Spaces (demo enlazada), controlador ligero propio y entorno alojado de Prime Intellect (`app.primeintellect.ai/dashboard/environments/harleycooper/weight-space-breakout`).
- Latencia y throughput: no disponibles. La model card menciona un timeout de servicio de 60 minutos para jobs alojados y una asignación de 16.384 tokens por respuesta del editor, pero no cifras de latencia del controlador.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (controladores de Breakout con reparación de pesos guiada por LLM y licencia MIT publicados en Hugging Face).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con métricas de NLP ni usarse para generación de texto, código o razonamiento.
- La política publicada parte de un baseline deliberadamente defectuoso (controles invertidos); su rendimiento absoluto no representa un controlador óptimo de Breakout.
- La regla de promoción es un screen de ingeniería, no una prueba de significación estadística general; el propio autor indica que la búsqueda adaptativa requiere replicación independiente.
- Los resultados pueden estancarse o todos los candidatos pueden fallar; una edición no aceptada no modifica la política en vivo.
- Las medias de distintas rondas no son directamente comparables porque cada candidato válido se evalúa sobre 512 semillas frescas emparejadas.
- El harness por defecto de Prime anunciaba herramientas `bash` y `edit`; el prompt las prohibía e indicaba incorrectamente que no estaban disponibles. La traza demuestra ediciones sin uso de herramientas, no un harness técnicamente libre de herramientas.
- El repositorio registra 0 descargas y 0 likes, sin evidencia de validación por terceros.
- La licencia MIT permite uso comercial, pero el artefacto depende de servicios externos (Prime Intellect, Hugging Face) cuyos costes y términos son independientes de la licencia del modelo.
- No hay información sobre sesgos, alucinación o cobertura idiomática porque el artefacto no procesa lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/HarleyCooper/weight-space-breakout-failure-driven-03
- Demo en vivo: https://huggingface.co/spaces/HarleyCooper/weight-space-breakout-failure-driven-demo-03
- Código del pipeline: https://github.com/HarleyCoops/weight-space-breakout-pipeline
- Entorno en Prime Intellect: https://app.primeintellect.ai/dashboard/environments/harleycooper/weight-space-breakout
- Documentación de reparación asistida: `PREPARED_EDITOR.md` (referenciado en la model card)
- Documentación de reparación guiada por fallos: `FAILURE_DRIVEN.md` (referenciado en la model card)
