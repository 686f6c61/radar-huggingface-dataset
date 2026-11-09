# openroboto-ai/champion-sim-11

## Resumen

OpenRoboto champion snapshot de la temporada 11 (seq 11) es un repositorio de Hugging Face que contiene una copia exacta del checkpoint completo del modelo ganador de esa temporada en la competición OpenRoboto. No se trata de un modelo entrenado por el autor del repositorio (openroboto-ai), sino de un snapshot congelado: cada commit del repositorio corresponde a un campeón distinto, y los ficheros del campeón anterior se eliminan en cada actualización. El checkpoint de esta temporada proviene del repositorio `Fisher-Wang/pi05-axis-v0.2-all30-74p67`, fijado en el commit `521a0741c01ee7908b5794bb2ae6933d3dc04745`, con una puntuación registrada de 0,0280 y el hotkey `5Fnw1wubgHKKY6T2FFhsytcC3tiPc7GY3A3r7ss4t6B9R728`.

El propósito del repositorio es servir como punto de partida canónico y aceptado para submissions derivadas dentro de OpenRoboto, de modo que cualquier participante pueda partir del campeón vigente con garantías de originalidad. El repositorio pesa 12,5 GB, lo que sugiere un checkpoint de tamaño medio-grande, pero la model card no documenta arquitectura, número de parámetros, longitud de contexto ni datos de entrenamiento. La información pública disponible se limita a metadatos de competición y a instrucciones de descarga.

La relevancia de este snapshot es operativa más que técnica: permite reproducir exactamente el estado del campeón de la temporada 11 durante la temporada siguiente, ya que el repositorio se conserva hasta el cierre de la temporada 12 y después se elimina. Cualquier evaluación técnica del modelo subyacente debe hacerse contra el repositorio fuente `Fisher-Wang/pi05-axis-v0.2-all30-74p67`, no contra este snapshot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 12,5 GB; la model card no detalla safetensors, GGUF ni otros formatos) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo subyacente en la model card del snapshot. El repositorio no incluye descripción de capas, tipo de transformer, mecanismos de atención ni componentes MoE o híbridos. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias.

El único dato técnico verificable es la procedencia: el checkpoint es una copia byte a byte (LFS sha256 / git blob id) del repositorio `Fisher-Wang/pi05-axis-v0.2-all30-74p67` en el commit `521a0741c01ee7908b5794bb2ae6933d3dc04745`. La model card indica que todos los ficheros coinciden con la fuente salvo el propio README. Cualquier innovación técnica (decodificación especulativa, atención lineal, etc.) debería consultarse en el repositorio de origen, que no forma parte de la información proporcionada.

## Capacidades

- No se documentan capacidades específicas en la model card del snapshot.
- El nombre del repositorio fuente (`pi05-axis-v0.2-all30-74p67`) sugiere un modelo de la familia pi05, pero no se confirma en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Reproducción de resultados de competición: descargar el snapshot fijando el commit (`hf download openroboto-ai/champion-sim-11 --revision <commit-sha>`) para replicar exactamente el checkpoint con el que se obtuvo la puntuación 0,0280 en la temporada 11.
- Punto de partida para submissions derivadas: usar el campeón como parent canónico aceptado en OpenRoboto, evitando problemas de originalidad al participar en la temporada 12.
- Auditoría de trazabilidad: verificar que los ficheros del snapshot coinciden byte a byte con el repositorio fuente mediante los identificadores LFS sha256 y git blob id.
- Baseline interno de evaluación: comparar modelos propios contra el campeón de la temporada 11 usando la misma métrica de competición (score 0,0280) como referencia.
- Archivado temporal de un checkpoint: conservar una copia del campeón durante la temporada siguiente, ya que el repositorio se elimina al cierre de la temporada 12.
- Integración en pipelines de CI que necesiten un modelo de referencia fijado por commit, no por rama `main`, para garantizar builds reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es la puntuación de competición de OpenRoboto: 0,0280 para la temporada 11. No se especifica la métrica, el conjunto de evaluación ni la comparación con otros participantes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 12,5 GB, lo que da una cota inferior orientativa del espacio en disco necesario para los pesos, pero no permite derivar VRAM sin conocer la arquitectura y el formato.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de la misma categoría, tamaño o tarea, ni ofrece datos de arquitectura o benchmarks que permitan establecer una comparación rigurosa.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo subyacente.
- No hay información sobre tasas de alucinación ni sobre evaluación de fidelidad.
- Se desconoce la longitud de contexto soportada y los idiomas cubiertos.
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial del checkpoint.
- El repositorio se elimina al cierre de la temporada siguiente (temporada 12); no es un archivo permanente.
- La rama `main` cambia cada vez que cambia el campeón; debe fijarse siempre un commit concreto (`--revision <commit-sha>`) para garantizar reproducibilidad.
- El snapshot no incluye documentación técnica del modelo; para evaluar arquitectura, entrenamiento o capacidades hay que acudir al repositorio fuente `Fisher-Wang/pi05-axis-v0.2-all30-74p67`.
- El snapshot es una copia byte a byte del fuente salvo el README, por lo que cualquier limitación del modelo original se hereda íntegramente.

## Enlaces

- Repositorio del snapshot: https://huggingface.co/openroboto-ai/champion-sim-11
- Repositorio fuente del checkpoint: https://huggingface.co/Fisher-Wang/pi05-axis-v0.2-all30-74p67/tree/521a0741c01ee7908b5794bb2ae6933d3dc04745
- Documentación de OpenRoboto (referenciada en la model card, sección *Model Originality & Derivative Submissions*): no disponible como URL en la información proporcionada.
