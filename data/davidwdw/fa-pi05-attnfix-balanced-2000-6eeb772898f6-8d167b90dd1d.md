# davidwdw/fa-pi05-attnfix-balanced-2000-6eeb772898f6-8d167b90dd1d

## Resumen

`davidwdw/fa-pi05-attnfix-balanced-2000-6eeb772898f6-8d167b90dd1d` es un repositorio publicado en HuggingFace por el usuario `davidwdw`, descrito por su propio autor como un "versioned fleet archive" (archivo versionado de flota) y no como un modelo de propósito general. La model card es mínima: se limita a indicar la receta canónica de entrenamiento (`2026-09-22_b1k_task00_pi05_attention_consistent_h20`), el tier del paquete (`params+assets`) y una advertencia de que se trata de una instantánea (snapshot) que debe verificarse con `SHA256SUMS`.

El identificador del repositorio sugiere que se trata de un ajuste fino o checkpoint derivado de la familia **pi05**, que en el ecosistema abierto remite a **π₀.₅**, un modelo visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence para control robótico y generalización en entornos abiertos. Los resultados de búsqueda confirman la existencia de implementaciones de referencia y derivadas de pi05 en HuggingFace (`lerobot/pi05_libero_base`, `Neotix-Robotics/pi05-model`) y de repositorios de código asociados (`Integer003/openpi05`), pero no aportan documentación específica sobre este repositorio concreto.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio tiene 0 descargas, 0 likes, no declara licencia, idiomas ni pipeline, y su model card no incluye especificaciones técnicas, datos de entrenamiento ni resultados de evaluación. Los sufijos del nombre (`attnfix`, `balanced`, `2000`) apuntan a una corrección de atención, un dataset balanceado y 2000 pasos de entrenamiento, respectivamente, pero son inferencias a partir del nombre y no datos confirmados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre remite a la familia pi05 / π₀.₅, VLA basado en transformer; no confirmado para este repositorio) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (tier declarado: "params+assets") |
| Tamano del repositorio | 12.4 GB |
| Autor | davidwdw |
| Fecha de creacion | 2026-09-26 |
| Fecha de actualizacion | 2026-09-26 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura. El único dato técnico explícito es la receta de entrenamiento registrada: `2026-09-22_b1k_task00_pi05_attention_consistent_h20`. Por el nombre del repositorio puede inferirse un ajuste sobre un modelo base pi05 con una corrección en el mecanismo de atención (`attnfix`), un dataset balanceado (`balanced`) y aproximadamente 2000 pasos de entrenamiento (`2000`), si bien ninguno de estos extremos está documentado por el autor.

La referencia externa más cercana es π₀.₅ de Physical Intelligence, presentado en los resultados de búsqueda como una evolución de π₀ orientada a resolver el problema de la generalización en entornos abiertos dentro de la robótica. La implementación pública de LeRobot para pi05 se describe como adaptada del repositorio OpenPI del propio fabricante. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni ninguna innovación técnica específica de este checkpoint.

## Capacidades

- No se documentan capacidades explícitas en la model card del repositorio.
- Por pertenencia nominal a la familia pi05 (π₀.₅), se le supone orientación a control robótico visión-lenguaje-acción, pero esto no está confirmado para este checkpoint concreto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Archivado reproducible de checkpoints: el repositorio se presenta como instantánea versionada con verificación mediante `SHA256SUMS`, útil para conservar una revisión exacta de un experimento de ajuste fino y poder restaurarla en el futuro.
- Reproducción de experimentos de ajuste sobre pi05: el nombre de la receta permite identificar la configuración usada (`attention_consistent`, dataset balanceado, ~2000 pasos) para replicar el entrenamiento en un pipeline de investigación.
- Evaluación comparativa dentro de una flota de modelos: al tratarse de un "fleet archive", encaja en flujos donde se comparan múltiples revisiones de un mismo modelo base bajo una misma tarea.
- Investigación en correcciones de atención: el sufijo `attnfix` sugiere que el checkpoint puede emplearse para estudiar el efecto de modificaciones en el mecanismo de atención sobre el rendimiento final.
- Punto de partida para nuevos ajustes finos: un investigador podría tomar este snapshot como base para continuar el entrenamiento sobre otras tareas robóticas, siempre que verifique previamente la licencia del modelo original (no declarada aquí).
- Control robótico experimental (si se confirma la naturaleza VLA): ejecución de políticas de manipulación en entornos simulados o reales, sin garantías de calidad dado que no hay benchmarks publicados.

En todos los casos, la aplicabilidad real está condicionada por la ausencia total de documentación, licencia y métricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye tablas de evaluación, comparativas ni métricas de ningún tipo (ni MMLU, ni HumanEval, ni GSM8K, ni métricas específicas de robótica como tasas de éxito por tarea).

## Requisitos de hardware

- El repositorio ocupa 12.4 GB, lo que sugiere pesos en precisión completa o un paquete que incluye parámetros más assets auxiliares; no se especifica la distribución.
- VRAM estimada para inferencia: no disponible con precisión. Como referencia orientativa, un paquete de 12.4 GB exige al menos ~13-14 GB de VRAM si se carga sin cuantizar, aunque esto depende del número real de parámetros y del formato.
- GPU recomendadas: no disponibles. Por tamaño de paquete, cabría en GPUs de gama profesional con 24 GB o más (RTX 3090/4090, A5000, A6000, L40S) y en aceleradores de centro de datos (A100, H100) si se requiere entrenamiento o inferencia en lote.
- Compatibilidad con GPU de consumo: probablemente sí en GPUs de 24 GB si los pesos pueden cargarse sin cuantizar; no confirmado.
- Opciones de despliegue: no disponibles. No se indica compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con el stack específico de LeRobot/OpenPI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| davidwdw/fa-pi05-attnfix-balanced-2000-6eeb772898f6-8d167b90dd1d | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| lerobot/pi05_libero_base | no disponible | no disponible | no disponible | HuggingFace |
| Neotix-Robotics/pi05-model | no disponible | no disponible | no disponible | HuggingFace |

Los tres repositorios pertenecen nominalmente a la familia pi05 / π₀.₅, pero la información recuperada no incluye parámetros, contexto ni licencia para ninguno de ellos, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial ni redistribución; es imprescindible contactar con el autor o consultar la licencia del modelo base antes de cualquier uso productivo.
- Ausencia total de documentación técnica: sin arquitectura, número de parámetros, contexto ni datos de entrenamiento, es imposible evaluar su idoneidad para un caso de uso concreto.
- Model card mínima: el propio autor la presenta como un archivo de flota versionado, no como un modelo listo para uso general.
- Sin métricas ni validación publicadas: no hay evidencia de rendimiento en ninguna tarea.
- Riesgo de alucinación y sesgos: no evaluable con la información disponible.
- Restricciones de idioma y contexto: no disponibles.
- Cero tracción comunitaria (0 descargas, 0 likes): sin señales externas de calidad, mantenimiento o reproducibilidad.
- Dependencia de verificación manual: el autor exige comprobar `SHA256SUMS` y usar la revisión exacta registrada, lo que implica disciplina de versionado en cualquier integración.
- Posible confusión con el modelo base: el nombre remite a π₀.₅ de Physical Intelligence, pero este repositorio no es un lanzamiento oficial de dicho fabricante y no debe citarse como tal.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/davidwdw/fa-pi05-attnfix-balanced-2000-6eeb772898f6-8d167b90dd1d
- Referencia de la familia en LeRobot: https://huggingface.co/lerobot/pi05_libero_base
- Modelo derivado de terceros: https://huggingface.co/Neotix-Robotics/pi05-model
- Repositorio de código (reproducción del paper pi05): https://github.com/Integer003/openpi05
- Ejemplos de despliegue en GKE para pi05: https://github.com/rootkiller6788/GoogleCloudPlatform__kubernetes-engine-samples/tree/main/ai-ml/physical-ai-on-gke/models/pi05/tools
