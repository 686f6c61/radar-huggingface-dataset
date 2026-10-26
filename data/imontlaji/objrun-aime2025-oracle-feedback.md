# imontlaji/ObjRun-AIME2025-oracle-feedback

## Resumen

ObjRun-AIME2025-oracle-feedback es un repositorio de resultados de evaluación publicado por el usuario imontlaji en Hugging Face. No contiene pesos de modelo ni presenta un checkpoint nuevo: es un informe de evaluación que documenta una ejecución del sistema agéntico ObjRun F sobre los 30 problemas de AIME 2025 (15 de AIME I y 15 de AIME II), con un resultado declarado de 30/30 (100%) gracias a que el resolutor podía consultar la correctitud de la respuesta dorada durante la resolución.

El interés del artefacto es metodológico. La propia model card insiste en que la cifra es una *tasa de éxito asistida por oráculo* y no un pass@1 ciego, zero-shot, ni una afirmación de superioridad frente a entradas estándar de leaderboard. El sistema disponía de ejecución de Python, verificación, envío y exploración del árbol de tareas; no se observaron llamadas de búsqueda web en la ejecución retenida. Los modelos configurados en la API fueron `deepseek/deepseek-v4-flash-0731` y, como alternativa, `deepseek-v4-flash`, aunque la identidad del checkpoint servido en cada llamada no está certificada de forma independiente.

La relevancia ahora es doble: por un lado, ejemplifica una práctica de publicación de resultados con procedencia verificable (hashes, CSV por tarea, JSON legible por máquina); por otro, sirve como caso de estudio sobre la brecha entre evaluación con feedback de correctitud y evaluación ciega, un debate abierto en la evaluación de modelos de razonamiento matemático. La verificación se hizo el 2026-10-26 comparando offline las 30 respuestas retenidas con los enteros de referencia de `MathArena/aime_2025`, sin realizar nuevas llamadas al modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no publica pesos ni arquitectura; describe un sistema agéntico sobre API) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara una configuracion MoE) |
| Longitud de contexto | no disponible; limite configurado de 16.384 tokens por peticion |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | no contiene pesos (solo informe, tabla de resultados y metadatos de evaluacion) |

## Arquitectura y entrenamiento

El repositorio no describe arquitectura de modelo ni proceso de entrenamiento, porque no aloja un modelo. Lo que documenta es la configuración de un arnés de evaluación agéntico: temperatura 0, semilla 42, esfuerzo de razonamiento medio, un máximo de 16.384 tokens por petición, 1.800 segundos por tarea, hasta 4 ramas de exploración y el parámetro `objective checks` fijado en 10. Las herramientas observadas en la ejecución retenida fueron ejecución de Python, verificación, envío de respuesta y exploración del árbol de tareas; no se registraron llamadas de búsqueda web.

El componente técnico destacable es el bucle de feedback de correctitud: el resolutor podía consultar si su respuesta coincidía con la respuesta dorada y revisarla antes del envío final. Esto convierte la métrica en una medida de éxito del sistema completo con acceso a un oráculo, no en una medida de capacidad del modelo por sí solo. La ejecución original (`aime-f-ns`, 2026-09-26) cubrió 60 problemas de AIME 2024-2025; este repositorio retiene únicamente los 30 de AIME 2025. Un detalle metodológico relevante es que se usaron renderizados textuales locales históricos, con variaciones de redacción y de representación de diagramas respecto al dataset de MathArena, y que no se ejecutó el arnés de MathArena.

## Capacidades

- Registro de resultados de evaluación reproducible: incluye `task-results.csv` con identificadores de problema, respuestas enteras retenidas, resultado de coincidencia y hashes de candidatos.
- Procedencia verificable: `results.json` recoge la configuración original y los hashes de procedencia de la ejecución.
- Verificación offline: las 30 respuestas retenidas se compararon con los enteros de referencia de `MathArena/aime_2025` sin nuevas llamadas al modelo.
- Mapeo explícito de índices: pregunta n de AIME I a `problem_idx=n`; pregunta n de AIME II a `problem_idx=15+n`.
- Documentación de un protocolo agéntico con oráculo: consulta de correctitud, revisión de respuestas, hasta 4 ramas y 1.800 s por tarea.
- Capacidades multilingües: no disponibles; el contenido está etiquetado únicamente como `en`.
- No incluye capacidad de generación, visión, audio, tool calling genérico ni modo de pensamiento propio: esas capacidades pertenecen al modelo servido por API, no a este repositorio.

## Casos de uso

- Auditoría de resultados publicados: un revisor puede descargar `task-results.csv` y `results.json`, recalcular la coincidencia contra `MathArena/aime_2025` y comprobar que las 30 respuestas retenidas son correctas, sin depender de la captura de pantalla del autor.
- Estudio de la brecha oráculo versus ciego: el repositorio sirve como punto de partida para cuantificar cuánto sube la tasa de acierto cuando el agente puede consultar la correctitud, comparándolo con entradas estándar de leaderboard sobre el mismo conjunto de 30 problemas.
- Diseño de arneses internos de evaluación: los parámetros documentados (temperatura 0, semilla 42, 16.384 tokens por petición, 1.800 s por tarea, 4 ramas, `objective checks=10`) son una plantilla concreta para replicar un bucle agéntico con verificación en pipelines propios.
- Reproducibilidad y control de versiones de evaluaciones: el uso de hashes de candidatos y de hashes de procedencia ejemplifica cómo fijar el estado de una evaluación para que sea citable en un informe técnico o en un artículo.
- Formación y docencia en metodología de evaluación: el caso ilustra por qué una cifra de 100% con feedback de respuesta dorada no es comparable con pass@1 ciego, útil en materiales sobre interpretación de benchmarks.
- Verificación de integridad de datasets: la comprobación offline contra los enteros de referencia de MathArena puede reutilizarse como test de consistencia al migrar entre renderizados textuales locales y el dataset público.
- Trazabilidad para revisión por pares: al declarar explícitamente que no existe token de verificación de Hugging Face y que el envío al sistema de evaluation-results no implica aceptación en MathArena, el repositorio sirve de ejemplo de divulgación de limitaciones de provenance.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones | Nota |
|---|---|---|---|
| AIME 2025 I + II (30 problemas) | 30/30 (100%) | Feedback de correctitud con respuesta dorada durante la resolución; temperatura 0, semilla 42, max 16.384 tokens por peticion, 1.800 s por tarea, hasta 4 ramas | Tasa de exito asistida por oraculo, no pass@1 ciego ni zero-shot |
| AIME 2024-2025 (60 problemas) | no disponible en este repositorio | Ejecucion historica `aime-f-ns` del 2026-09-26 | Solo se retienen los 30 problemas de AIME 2025 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar, ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el repositorio no contiene pesos y la inferencia se realizó contra una API externa.
- GPU recomendadas: no disponibles; no hay despliegue local del modelo.
- Cabe en GPU de consumo: no aplica al modelo; el artefacto publicado (CSV y JSON) se procesa en cualquier equipo, con un coste despreciable de memoria.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI, al no existir pesos. El consumo del artefacto se limita a descargar `task-results.csv` y `results.json` y procesarlos con herramientas estándar de análisis de datos.
- Latencia y throughput: no disponibles. El único dato temporal es el límite de 1.800 segundos por tarea del arnés original, que no es una medida de latencia del modelo.

## Comparativa con modelos similares

| Criterio | ObjRun-AIME2025-oracle-feedback | Entradas estandar de leaderboard en AIME 2025 | Repositorios de evaluation-results en Hugging Face |
|---|---|---|---|
| Parametros | no disponible (sin pesos) | variables segun modelo | no aplica |
| Contexto | no disponible; 16.384 tokens por peticion configurados | variable | no aplica |
| Rendimiento | 30/30 con feedback de respuesta dorada | pass@1 ciego, no comparable directamente | variable |
| Licencia | no disponible | segun modelo | habitualmente no disponible |
| Disponibilidad | publico en Hugging Face, sin token de verificacion | publico | publico |

No se dispone de datos en la informacion proporcionada para establecer una comparación numérica con alternativas de la misma categoría. Cualquier comparación directa con entradas de MathArena sería metodológicamente inválida, tal como advierte la propia model card, porque el protocolo incluye acceso a un oráculo de correctitud.

## Limitaciones y advertencias

- La métrica de 30/30 no es pass@1 ciego, ni precisión zero-shot, ni una afirmación de superioridad frente a entradas estándar de leaderboard: incorpora feedback de respuesta dorada durante la resolución.
- El repositorio es un envío autoinformado sin token de verificación de Hugging Face; la publicación en el sistema de evaluation-results no implica aceptación en el sitio de MathArena ni respaldo de los autores del benchmark.
- La identidad del checkpoint servido en cada llamada no está certificada de forma independiente: solo se conservan los identificadores de configuración `deepseek/deepseek-v4-flash-0731` y `deepseek-v4-flash`.
- Se usaron renderizados textuales locales históricos con diferencias de redacción y de representación de diagramas respecto al dataset de MathArena; no fue una ejecución del arnés de MathArena, lo que limita la comparabilidad estricta.
- La verificación del 2026-10-26 fue offline sobre respuestas retenidas y no incluyó nuevas llamadas al modelo, por lo que no se valida la repetibilidad del resultado en ejecuciones futuras.
- Solo se retienen los 30 problemas de AIME 2025; los otros 30 problemas de la ejecución original (AIME 2024) no están incluidos en este repositorio.
- Solo se observaron las herramientas de ejecución de Python, verificación, envío y exploración del árbol de tareas; no se registraron llamadas de búsqueda web, pero la ausencia observada no garantiza que el sistema no pudiera realizarlas.
- No hay información sobre sesgos, riesgo de alucinación del modelo subyacente, restricciones de licencia para uso comercial ni condiciones de producción, al no publicarse pesos ni términos de licencia.
- El artefacto no es adecuado como base para afirmar capacidades matemáticas del modelo en condiciones de uso reales sin asistencia de oráculo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/imontlaji/ObjRun-AIME2025-oracle-feedback
- Resultados por tarea (`task-results.csv`): https://huggingface.co/imontlaji/ObjRun-AIME2025-oracle-feedback/blob/main/task-results.csv
- Informe legible por máquina (`results.json`): https://huggingface.co/imontlaji/ObjRun-AIME2025-oracle-feedback/blob/main/results.json
- Dataset de referencia citado (`MathArena/aime_2025`): https://huggingface.co/datasets/MathArena/aime_2025
