# HarleyCooper/weight-space-breakout-qualified-repair-01

## Resumen

`weight-space-breakout-qualified-repair-01` es un artefacto de investigación publicado por el usuario HarleyCooper en Hugging Face. No es un modelo de lenguaje: se trata de un controlador de juego de 17.253 parámetros para el entorno Breakout (Atari), serializado en formato safetensors y npz. El repositorio documenta un experimento de "programación en el espacio de pesos" (weight-space programming), en el que un LLM externo (Qwen 3.6 35B-A3B alojado en Prime Intellect) propone ediciones directas sobre los pesos de la política para reparar un fallo plantado intencionadamente.

El punto de partida es una política deliberadamente defectuosa con controles invertidos ("reversed-controls"). El protocolo `qualified-repair-v1` (versión 0.4.5) permite que el LLM proponga hasta 64 asignaciones escalares de pesos; la primera propuesta que cumple un criterio de ganancia media superior a 0,10 y superior a dos errores estándar pareados en 32 partidas de práctica se congela y se envía automáticamente. La promoción final, sin embargo, exige una puerta independiente de 512 partidas con semillas nuevas.

Su relevancia es metodológica más que práctica: ilustra un bucle de retroalimentación acotado entre un LLM editor y un verificador alojado, con trazabilidad criptográfica de hashes, auditoría de 1.024 partidas y separación estricta entre cualificación en práctica y promoción en evaluación. El propio autor advierte que se trata de una única reparación de un fallo plantado y no de evidencia de mejora recursiva sostenida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (controlador de política para Breakout; no es un transformer ni un LLM) |
| Parámetros totales | 17.253 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica |
| Tipos de cuantización | No disponible (pesos en safetensors y npz; sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors, npz, json |

## Arquitectura y entrenamiento

El artefacto no es una red neuronal entrenada de forma convencional, sino una política de control serializada cuyos pesos se editan directamente mediante un protocolo iterativo. El repositorio incluye `model.safetensors`, `policy.npz` y `policy.json` con la política seleccionada, además de `initial_baseline.safetensors`, que preserva el estado inicial conocido como defectuoso (controles invertidos). El archivo `manifest.json` enlaza la huella digital, el checksum de cada fichero, el plan de ejecución y las decisiones por ronda.

El "entrenamiento" consiste en un bucle de reparación: Prime aloja el entorno `harleycooper/weight-space-breakout@0.2.1`, ejecuta 32 partidas de práctica y entrega trayectorias cortas; el LLM `qwen/qwen3.6-35b-a3b` propone hasta 64 asignaciones escalares de pesos sin uso de herramientas; el verificador valida las ediciones y compara candidato e incumbente en 512 semillas pareadas y frescas. La promoción exige ganancia media > 0,10 y `gain - 2 * paired_standard_error > 0`. Las semillas están fijadas: práctica `40000 + 32*round` a `40031 + 32*round`, promoción `60000 + 512*round` a `60511 + 512*round`, auditoría final `90000..91023`. El primer run publicado se limita a tres rondas y 4.096 tokens de salida por llamada.

Una innovación destacable es la separación entre cualificación automática y promoción independiente: la primera propuesta válida que supera el umbral de práctica se congela y se envía sin decisión final separada, pero solo la puerta de 512 partidas puede reemplazar los pesos publicados. El autor también documenta una advertencia de harness: Prime anunciaba herramientas `bash` y `edit` que el prompt prohibía usar, por lo que el run demuestra ediciones sin uso de herramientas, no un harness técnicamente libre de herramientas.

## Capacidades

- Control de política para el entorno Breakout: genera acciones de juego a partir de observaciones del entorno.
- Edición de pesos asistida por LLM: acepta propuestas de hasta 64 asignaciones escalares validadas por un verificador externo.
- Protocolo de reparación cualificada (`REPAIR_PROTOCOL=qualified-repair-v1`): congelación automática de la primera edición que cumple el umbral de práctica.
- Protocolo de reparación básica (`basic-repair-v1`): reparación de fallo plantado con herramienta asistida y requisito de mejora más amplia.
- Protocolo de editor preparado (`PREPARED_EDITOR`): sin límite de turnos del editor y con herramienta explícita de envío final.
- Verificación con hashes: el controlador comprueba los hashes del verificador antes de publicar y solicita una simulación fresca sobre la revisión publicada exacta.
- Auditoría final de 1.024 partidas contra la política defectuosa original, no usada para selección.
- Serialización y publicación de pesos verificados mediante un controlador ligero.
- No soporta tool calling, agentes multi-paso, multilingüismo ni modalidades de visión o audio.

## Casos de uso

- Investigación en programación del espacio de pesos: el artefacto sirve como caso reproducible de edición directa de pesos por un LLM sobre una política pequeña, con protocolo y semillas documentadas.
- Estudio de protocolos de verificación estadística: la separación entre 32 partidas de práctica, 512 de promoción y 1.024 de auditoría permite analizar sesgos de selección y potencia estadística en bucles adaptativos.
- Reproducción de experimentos de reparación de fallos: `initial_baseline.safetensors` conserva el estado defectuoso, lo que permite replicar la reparación desde cero con el pipeline publicado.
- Auditoría de trazabilidad: cada commit del Hub es una versión inmutable y el manifest enlaza checksums, plan y decisiones por ronda, útil para estudiar procedencia de artefactos en entornos alojados.
- Docencia sobre límites de la mejora recursiva: el propio autor advierte que una reparación de un fallo plantado no es evidencia de mejora sostenida, lo que lo convierte en material para discutir afirmaciones exageradas en IA.
- Integración en pipelines de evaluación alojada: el controlador ligero que serializa y publica pesos verificados puede adaptarse a otros entornos de Prime para experimentos similares.
- Referencia para diseño de harness: la divulgación sobre herramientas anunciadas pero prohibidas sirve como ejemplo de buenas prácticas de transparencia en experimentos con LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla de rondas con columnas "Incumbent", "Candidate", "Mean gain" y "Decision", pero las filas están vacías en la información proporcionada. El autor indica que las medias de distintas filas no son directamente comparables porque cada candidato válido se evalúa en 512 semillas pareadas frescas, y que los intentos sin envío válido no reciben evaluación de candidato.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el controlador de 17.253 parámetros cabe en CPU y memoria convencional.
- GPU recomendadas: ninguna para el juego; el autor indica explícitamente que no se necesita GPU.
- ¿Cabe en GPU consumer? Sí, aunque no es necesario; el artefacto es de tamaño despreciable (repo de 0,0 GB).
- Opciones de despliegue: simulación alojada en Hugging Face CPU (Space `weight-space-breakout-qualified-repair-demo-01`); evaluación de partidas en el entorno alojado de Prime Intellect.
- Latencia y throughput: no disponibles. El autor señala que la inferencia del LLM y la evaluación alojada pueden generar cargos en Prime; el timeout del servicio es de 60 minutos.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (controladores de Breakout con reparación de pesos asistida por LLM). El artefacto no es comparable con modelos de lenguaje por tamaño, tarea ni formato.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes; cualquier uso fuera del entorno Breakout carece de sentido.
- Evidencia limitada: el autor advierte que se trata de una única reparación de un fallo plantado, no de evidencia de mejora recursiva sostenida.
- Regla de promoción es un cribado de ingeniería, no prueba de significación estadística general; la búsqueda adaptativa requiere replicación independiente.
- Los resultados pueden estancarse o todos los candidatos pueden fallar; una edición no aceptada no cambia la política publicada.
- Advertencia de harness: Prime anunciaba herramientas `bash` y `edit` que el prompt prohibía y describía erróneamente como no disponibles; el run demuestra ediciones sin uso de herramientas, no un harness libre de herramientas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no aplica al controlador; el riesgo relevante es que el LLM editor proponga ediciones no válidas, mitigado por el verificador.
- Limitaciones de idioma: no aplica; el artefacto no procesa lenguaje.
- Licencia MIT permite uso comercial, pero el valor comercial del artefacto es nulo fuera de investigación; los cargos de Prime por inferencia y evaluación corren a cargo del usuario.
- Dependencia de infraestructura externa: el pipeline requiere el entorno alojado de Prime y el Space de Hugging Face; no es autónomo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HarleyCooper/weight-space-breakout-qualified-repair-01
- Demo (Space): https://huggingface.co/spaces/HarleyCooper/weight-space-breakout-qualified-repair-demo-01
- Código del pipeline: https://github.com/HarleyCoops/weight-space-breakout-pipeline
- Entorno en Prime Intellect: https://app.primeintellect.ai/dashboard/environments/harleycooper/weight-space-breakout
- Protocolo de reparación cualificada: `QUALIFIED_REPAIR.md` (referenciado en la model card)
- Protocolo de reparación básica: `BASIC_REPAIR.md` (referenciado en la model card)
- Editor preparado: `PREPARED_EDITOR.md` (referenciado en la model card)
- Reparación guiada por fallos: `FAILURE_DRIVEN.md` (referenciado en la model card)
