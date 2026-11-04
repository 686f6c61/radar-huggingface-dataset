# HlibPlakhtii/microduck-sprint-quicksilver-v3

## Resumen

Quicksilver Sprint v3 es una política de control para robótica publicada por HlibPlakhtii como entrada de competición en la prueba **2 m Sprint** de Microduck Arena, un entorno de simulación asociado al robot Microduck de Pollen Robotics. No es un modelo de lenguaje: es un grafo ONNX que mapea observaciones del simulador a acciones de control, derivado por *finetune* de `jrubiosainz/microduck-game-sprinter-remix14`. Su relevancia es acotada y experimental: sirve como ejemplo de optimización de trayectorias mediante búsqueda evolutiva (CMA-ES) sobre un controlador neuronal heredado.

El modelo conserva los pesos neuronales y operadores de grafo del modelo base e incorpora cinco nuevas capas de *lookup* de observaciones que reproducen trayectorias refinadas localmente. En la evaluación oficial local obtiene 0,817 s de media con 5/5 llegadas a meta, lo que mejora su v2 (0,819 s) y empata con el modelo fuente, sin superarlo. La publicación en el *leaderboard* de la Arena fue excluida por la regla de resultados por semilla, al coincidir sus tiempos con los del líder previo.

El tamaño real del repositorio es 0,0 GB y la model card no documenta parámetros, contexto ni idiomas, por lo que la mayoría de las especificaciones habituales de un modelo generativo no aplican o no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX de política robótica (capas de lookup de observaciones sobre un grafo neuronal heredado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada = observación del simulador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (policy SHA-256 `ce82021d04cee660815c7dcca05d951a94132097047197024d936ba7d427bd7d`) |

## Arquitectura y entrenamiento

La política parte del grafo neuronal de `jrubiosainz/microduck-game-sprinter-remix14` (revisión fijada `e9a74fa9a55e00f972e87d158f40db660a54be91`) y mantiene sus pesos y operadores. Sobre esa base se añaden cinco capas de *lookup* de observaciones que reproducen trayectorias refinadas localmente mediante CMA-ES y búsquedas por coordenadas dentro del simulador de la Arena, sin modificar el entorno. Cuando una observación no coincide con ninguna trayectoria almacenada, el grafo original sigue gestionando la acción.

El proceso de consolidación se cerró el 2 de noviembre y se publicó sin cambios el 4 de noviembre, tras una barrida completa del evaluador oficial. Las cinco trazas exportadas y las trayectorias de asentamiento coincidieron exactamente con las repeticiones de acciones registradas. El repositorio incluye `local-verification.json` con los resultados del evaluador, `provenance.json` con la revisión upstream fijada y las fuentes de trayectorias, y `seed-1.npz` a `seed-5.npz` con las instantáneas exactas de acciones usadas para los *overlays*. No se documenta número de tokens, composición de dataset ni fases de RLHF/DPO, porque no es un modelo lingüístico.

## Capacidades

- Generación de acciones de control para la prueba 2 m Sprint en el simulador Microduck Arena, a una consigna de 0,2 m/s.
- Reproducción determinista de cinco trayectorias de arranque oficiales mediante capas de *lookup*.
- Generalización limitada a observaciones no vistas a través del grafo neuronal heredado.
- Exportación en ONNX, apta para ejecución en el *runtime* del simulador y en la librería `microduck`.
- No soporta *tool calling*, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- **Evaluación de políticas en competición simulada**: usar el modelo como referencia en la prueba 2 m Sprint para comparar tiempos frente a otras entradas de la Arena, con la cautela de que sus resultados son *in-sample* sobre los cinco arranques oficiales.
- **Punto de partida para refinamiento de trayectorias**: emplear las capas de *lookup* y los ficheros `seed-*.npz` como base para aplicar CMA-ES sobre nuevas trayectorias en el simulador.
- **Pruebas de integración del *runtime* `microduck`**: validar la carga y ejecución de grafos ONNX con la librería `microduck` en pipelines de CI, verificando el hash SHA-256 de la política.
- **Investigación en optimización de controladores neuronales**: analizar cómo la sustitución parcial de un grafo neuronal por *lookups* afecta al comportamiento sin reentrenar los pesos.
- **Reproducibilidad de resultados**: replicar la evaluación oficial usando `local-verification.json` y `provenance.json` para auditar la procedencia de las trayectorias.
- **Docencia sobre limitaciones de evaluación *in-sample***: caso práctico de cómo una mejora aparente en simulación puede no generalizar ni superar al modelo fuente, y de cómo la Arena aplica reglas anti-copia por semilla.

## Benchmarks y rendimiento

| Arranque | Tiempo (s) |
|---|---:|
| 1 | 0,815 |
| 2 | 0,815 |
| 3 | 0,825 |
| 4 | 0,815 |
| 5 | 0,815 |
| **Media** | **0,817** |

Resultado oficial local: 0,817 s de media, 5/5 llegadas, consigna 0,2 m/s, *runner* versión 5. Comparación declarada por el autor: mejora su v2 (0,819 s) y empata con el modelo fuente (0,817 s). La entrada en la Arena obtuvo 0,817 s con 5/5 llegadas, pero fue excluida del *leaderboard* por la regla de resultados por semilla. No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB y el grafo ONNX es de tamaño reducido, pero no se documenta el consumo exacto.
- GPU recomendadas: no disponible; no requiere GPU de datacenter para su ejecución, al ser una política de simulación de pequeño tamaño.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño del repositorio, aunque no se especifica.
- Opciones de despliegue: *runtime* `microduck` y ejecución ONNX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Resultado 2 m Sprint | Licencia | Disponibilidad |
|---|---|---|---|---|
| HlibPlakhtii/microduck-sprint-quicksilver-v3 | Política ONNX (finetune) | 0,817 s media, 5/5 | Apache 2.0 | HuggingFace |
| jrubiosainz/microduck-game-sprinter-remix14 | Política ONNX (base) | 0,817 s | no disponible en la información | HuggingFace |
| Quicksilver Sprint v2 (HlibPlakhtii) | Política ONNX (versión previa) | 0,819 s media | Apache 2.0 | HuggingFace |

No se dispone de datos de otros competidores de la Arena en la información proporcionada.

## Limitaciones y advertencias

- Los resultados son *in-sample* sobre los cinco arranques oficiales de simulación; no constituyen una mejora general de locomoción.
- No es un controlador validado para un robot físico.
- La Arena clasifica la entrada como copia bajo su regla de resultados por semilla, por lo que queda excluida del *leaderboard*; no confiere segundo ni primer puesto.
- El modelo depende del simulador y la versión del *runner* (versión 5); cambios en el entorno pueden invalidar las trayectorias almacenadas.
- La generalización fuera de las trayectorias registradas recae en el grafo heredado, cuyo rendimiento no se documenta por separado.
- Licencia Apache 2.0: permite uso comercial, pero se deben conservar los avisos de `LICENSE` y `NOTICE` y acreditar a los autores upstream.
- No se documentan sesgos, riesgo de alucinación ni limitaciones idiomáticas porque no es un modelo generativo de texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HlibPlakhtii/microduck-sprint-quicksilver-v3
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix14/tree/e9a74fa9a55e00f972e87d158f40db660a54be91
- Ejecución en Microduck Arena: https://huggingface.co/spaces/pollen-robotics/microduck-arena#/r/01M6KBFBQFPFCQJ4VXB2PQ
- Ficheros del repositorio: `local-verification.json`, `provenance.json`, `seed-1.npz` a `seed-5.npz`, `BASE_MODEL_CARD.md`, `UPSTREAM_BASE_MODEL_CARD.md`, `LICENSE`, `NOTICE`
