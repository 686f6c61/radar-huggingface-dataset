# openroboto-ai/champion-sim-7

## Resumen

`openroboto-ai/champion-sim-7` es un repositorio de instantáneas de OpenRoboto, una competición abierta sobre Bittensor centrada en modelos de robótica. No es una release convencional con model card técnica: cada commit contiene una copia exacta del checkpoint completo de un campeón, extraída del repositorio de origen en el commit con el que fue puntuado. La instantánea corresponde a la temporada 7, con un score de 0,9058 y un checkpoint procedente de `pfenzi/axis_23_robogoat3` en el commit `2a2e6433bf0fc5bf560750ca56701818cfcb8459`.

El repositorio pesa 81,1 GB y en cada actualización elimina los archivos de campeones anteriores; se conserva hasta el cierre de la temporada siguiente y después se borra. Su función principal es servir como padre canónico para envíos derivados y como punto de partida reproducible para la temporada siguiente. No se documentan arquitectura, parámetros, contexto, idiomas, licencia ni formatos de pesos, por lo que la evaluación técnica del modelo subyacente queda limitada al contexto de la competición.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica transformer, MoE, SSM ni híbrida) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (no se define una ventana de tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no se puede confirmar uso comercial) |
| Formato de pesos | no disponible (repositorio con archivos LFS; no se enumeran safetensors, GGUF ni otros) |
| Pipeline de Hugging Face | no disponible |
| Tamaño del repositorio | 81,1 GB |
| Temporada OpenRoboto | 7 |
| Score de competición | 0,9058 |
| Hotkey | `5G2Uj1cCqnG5fPGwJUtTq1f9zqRR6rZgNqNHckjkwmEnPMNu` |
| Repositorio de origen | `pfenzi/axis_23_robogoat3` |
| Commit de origen | `2a2e6433bf0fc5bf560750ca56701818cfcb8459` |
| Fechas | creado 2026-10-17; actualizado 2026-10-18 |
| Descargas / likes | 0 / 0 (en la fecha de consulta) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del checkpoint. No se indica si es un transformer denso, un modelo de mezcla de expertos (MoE), un SSM, una arquitectura híbrida o un modelo de política robótica con codificadores visuales. Tampoco se publican el número de parámetros, la longitud de contexto, el vocabulario, la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron RLHF, DPO u otras etapas de alineamiento. No hay información sobre innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos de memoria.

Lo que sí se documenta es el mecanismo de publicación: cada commit es un campeón y contiene una copia exacta del checkpoint del repositorio de origen, verificable mediante LFS sha256 y git blob id, salvo el README. En cada actualización se eliminan los archivos de campeones anteriores, y el repositorio de la temporada se mantiene hasta el cierre de la siguiente. El checkpoint de esta ficha fue puntuado con 0,9058 en la temporada 7. OpenRoboto se presenta como una competición abierta sobre Bittensor en la que se ajusta un modelo base, se envían los pesos on-chain y el mejor modelo pasa a ser la siguiente base; la model card no detalla el modelo base ni el procedimiento de entrenamiento.

## Capacidades

- Generación de texto: no documentada.
- Razonamiento, matemáticas y código: no documentados.
- Visión: no documentada; no se especifica si procesa imágenes, vídeo o señales de sensores.
- Tool calling / function calling: no documentado.
- Agentes y razonamiento multi-paso: no documentado.
- Multilingüismo: no documentado; no se enumeran idiomas.
- Modo thinking, audio u otras capacidades especiales: no documentados.
- Control robótico: el contexto de OpenRoboto apunta a modelos de robótica, pero la model card no define observaciones, acciones, tarea ni métricas de éxito.
- Capacidad operativa verificable: servir como checkpoint canónico de partida y como artefacto reproducible de la competición.

No se puede confirmar que sea un LLM conversacional ni que sus capacidades de inferencia coincidan con las de un modelo de lenguaje convencional.

## Casos de uso

- Punto de partida para la temporada siguiente: descargar el commit exacto con `hf download openroboto-ai/champion-sim-7 --revision <commit-sha>` y usarlo como padre canónico en un ajuste fino. Es adecuado porque la model card lo define como padre aceptado y el snapshot se conserva hasta el cierre de la temporada siguiente.
- Reproducción del campeón de la temporada 7: fijar el commit y verificar que los archivos coinciden byte a byte con `pfenzi/axis_23_robogoat3@2a2e6433bf0fc5bf560750ca56701818cfcb8459`. Sirve para auditar el checkpoint que obtuvo 0,9058 y para repetir evaluaciones con el mismo artefacto.
- Auditoría de originalidad de modelos derivados: comparar los identificadores LFS sha256 y git blob id entre el derivado y este snapshot. La model card indica que todos los archivos coinciden con el origen salvo el README, lo que facilita demostrar la relación de parentesco.
- Automatización de descargas reproducibles en CI: integrar `hf download` con una revisión fija en lugar de `main`. Es adecuado porque `main` cambia cada vez que cambia el campeón y rompería la reproducibilidad.
- Baseline para experimentos de robótica: usar el checkpoint como referencia inicial en evaluaciones internas, siempre que se disponga del código y de la definición de tarea del repositorio de origen. La model card no detalla la tarea, así que el caso exige trabajo de integración.
- Gestión del ciclo de vida y archivo: planificar una copia fuera de Hugging Face antes de que el repositorio se elimine al cierre de la temporada siguiente. Es adecuado para equipos que necesiten conservar el campeón más allá de la ventana de retención.
- Documentación de envíos derivados en OpenRoboto: citar este snapshot y su commit como padre canónico en la documentación del envío, de acuerdo con las reglas de originalidad y derivados. Reduce el riesgo de rechazo por parentesco no documentado.
- Comparación de checkpoints de la misma temporada: usar el score 0,9058 como referencia interna frente a otros campeones, con la cautela de que no es un benchmark estándar y no se publican métricas por tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato cuantitativo es el score de la competición:

| Métrica | Valor | Contexto |
|---|---|---|
| Score OpenRoboto temporada 7 | 0,9058 | Puntuación del campeón en la competición; no equivale a un benchmark académico |
| Commit evaluado | `2a2e6433bf0fc5bf560750ca56701818cfcb8459` | Commit del repositorio de origen sobre el que se puntuó |
| Repositorio de origen | `pfenzi/axis_23_robogoat3` | Checkpoint copiado byte a byte |

No se dispone de comparaciones con MMLU, HumanEval, GSM8K ni con modelos similares.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. El repositorio ocupa 81,1 GB; si esos bytes corresponden a un único checkpoint cargado completo, el mínimo teórico es de aproximadamente 81 GB solo para pesos, sin activaciones, KV cache, buffers ni overhead del runtime. Si el repositorio contiene varios checkpoints o estados de optimizador, la cifra no se puede trasladar directamente a VRAM.
- GPU recomendadas: no disponibles. Por el tamaño, un despliegue en una sola GPU de 80 GB (A100/H100) no está garantizado; podría requerir varias GPU o un nodo con memoria agregada. No hay confirmación del autor ni del fabricante.
- GPU de consumo: no hay datos. Con 81,1 GB de repositorio, no es razonable asumir que quepa en una RTX 4090 (24 GB) o similar en precisión completa. No se documentan cuantizaciones que pudieran reducir el requisito.
- Opciones de despliegue: no disponibles. No se confirma compatibilidad con vLLM, TGI, llama.cpp, Ollama ni otros servidores de inferencia. Al tratarse de un snapshot de robótica, el runtime puede depender del código del repositorio de origen, que no se describe en la model card.
- Lat
