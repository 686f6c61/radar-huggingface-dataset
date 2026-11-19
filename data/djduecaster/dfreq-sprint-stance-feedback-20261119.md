# djduecaster/dfreq-sprint-stance-feedback-20261119

## Resumen

dfreq-sprint-stance-feedback-20261119 es un artefacto de control para robótica cuadrúpeda publicado por el usuario djduecaster en Hugging Face. Se trata de un ajuste fino (finetune) del modelo base djduecaster/dfreq, orientado a la tarea "Microduck 2 m Sprint", dentro de un entorno de evaluación denominado microduck-arena. El modelo se distribuye en formato ONNX y su pipeline declarado es robotics, no generación de lenguaje.

El artefacto implementa una corrección acotada sobre la salida neuronal del modelo padre: utiliza gravedad proyectada, giróscopo y realimentación de la acción previa para ajustar los objetivos de las patas durante la carrera. En tiempo de ejecución consume 61 flotantes de observación y produce 14 objetivos articulares, sin consulta de trayectorias, sin semilla de entrada ni tensores externos.

Su relevancia es acotada y experimental: el propio autor indica que las mediciones son locales y no constituyen puntuaciones del leaderboard de la Arena ni evidencia de una mejora general de fiabilidad. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0.0 GB, lo que sugiere un artefacto muy pequeño o un repositorio con pesos no materializados en el momento de la indexación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de control sobre un modelo neuronal base; arquitectura del padre no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no aplica (modelo de robótica; entrada fija de 61 flotantes de observación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (el repositorio remite a LICENSE-NOTE.txt para derechos heredados) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base djduecaster/dfreq. El artefacto se describe como un ajuste fino que añade una corrección acotada sobre la salida neuronal del padre, combinando gravedad proyectada, giróscopo y la acción previa para modular los objetivos de las patas durante la carrera. La interfaz de ejecución está fijada: 61 flotantes de observación de entrada y 14 objetivos articulares de salida, sin mecanismos de búsqueda de trayectorias, sin entrada de semilla y sin tensores externos.

No se han publicado detalles sobre volumen de datos de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas adicionales. El autor menciona que se emplearon "starts declarados" durante el desarrollo, sin especificar su naturaleza. La evaluación se realizó sobre un evaluador fijado en macOS con un identificador de commit concreto (9bf04c0668145528035c8a315d5d8ae2530c1279), lo que sugiere un pipeline de evaluación reproducible pero local.

## Capacidades

- Control locomotor de un cuadrúpedo simulado para la tarea de sprint de 2 metros.
- Ajuste de objetivos articulares (14 salidas) en función de observaciones proprioceptivas (61 flotantes).
- Uso de realimentación de gravedad proyectada y giróscopo para corregir la postura durante la carrera.
- Realimentación de la acción previa para suavizar o estabilizar la transición entre pasos.
- Ejecución determinista sin consulta de trayectorias ni semilla de entrada.
- Funcionamiento exclusivo en simulación; no se declara despliegue en hardware físico.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, por no ser un modelo de lenguaje.

## Casos de uso

- Evaluación comparativa en microduck-arena: el artefacto puede emplearse como participante en el entorno de la Arena para contrastar su tasa de finalización frente al modelo padre bajo el mismo evaluador fijado.
- Investigación en control robusto de locomoción: sirve para estudiar cómo la realimentación de gravedad proyectada y giróscopo afecta a la estabilidad durante el sprint, comparando con la variante sin realimentación.
- Análisis de ablación de señales de entrada: al ser una corrección acotada sobre el padre, permite aislar el efecto de las señales de feedback (gravedad, giro, acción previa) en los objetivos articulares.
- Reproducción de experimentos locales: el SHA-256 publicado y el commit del evaluador permiten replicar las mediciones declaradas (0.847 s de media, 5/5 finalizaciones a 1.15 m/s) en un entorno equivalente.
- Integración en pipelines de simulación con ONNX Runtime: al distribuirse en ONNX, puede cargarse en frameworks de inferencia estándar para robótica simulada sin dependencias de Python específicas del autor.
- Estudio de la brecha entre rendimiento en arranques fijados y arranques frescos: el autor reporta 16/128 frente a 17/128 del padre en arranques frescos, lo que convierte al artefacto en un caso de estudio sobre sobreajuste a condiciones de evaluación.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo padre (dfreq) |
|---|---|---|
| Tiempo medio en evaluador fijado (macOS, commit 9bf04c0) | 0.847 s | no disponible |
| Finalizaciones en evaluador fijado a 1.15 m/s | 5/5 | no disponible |
| Finalizaciones en arranques frescos a 1.15 m/s | 16/128 | 17/128 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, por no tratarse de un modelo de lenguaje. Las cifras anteriores son mediciones locales declaradas por el autor y no puntuaciones del leaderboard de la Arena.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es 0.0 GB y no se especifican parámetros del modelo base.
- GPU recomendadas: no disponibles; el autor reporta evaluación en un evaluador macOS, lo que sugiere ejecución en CPU o en hardware Apple.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime es el formato declarado; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de robótica).
- Latencia y throughput: no disponibles más allá del tiempo medio de 0.847 s por episodio en el evaluador fijado; no se reporta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dfreq-sprint-stance-feedback-20261119 | no disponible | no aplica (61 flotantes de entrada) | 0.847 s medio; 5/5 en evaluador fijado; 16/128 en arranques frescos | no disponible | Hugging Face, ONNX |
| djduecaster/dfreq (padre) | no disponible | no aplica | 17/128 en arranques frescos a 1.15 m/s | no disponible | Hugging Face |
| Otros modelos de la microduck-arena | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas comparables fuera del modelo padre y del resto de participantes de la Arena, cuyos datos no se han proporcionado.

## Limitaciones y advertencias

- Solo simulación: el autor declara explícitamente que el artefacto es únicamente para simulación; no hay evidencia de transferencia a hardware físico.
- Sin evidencia de mejora general: en arranques frescos a 1.15 m/s el modelo finaliza 16/128 frente a 17/128 del padre, por lo que no se demuestra una ganancia de fiabilidad.
- Mediciones locales: los resultados declarados no son puntuaciones del leaderboard de la Arena y dependen del evaluador fijado (commit 9bf04c0668145528035c8a315d5d8ae2530c1279) y de las condiciones de arranque.
- Licencia no disponible: el repositorio remite a LICENSE-NOTE.txt para derechos heredados del modelo base; antes de cualquier uso comercial debe revisarse ese fichero y la licencia del padre.
- Idiomas no aplicables: no es un modelo de lenguaje, por lo que no procede evaluar sesgos lingüísticos ni alucinación textual.
- Riesgo de sobreajuste a los arranques declarados: la discrepancia entre el rendimiento en el evaluador fijado (5/5) y en arranques frescos (16/128) sugiere dependencia de las condiciones de desarrollo.
- Trazabilidad limitada: sin parámetros, sin arquitectura del padre y sin dataset documentado, la reproducibilidad completa no está garantizada.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djduecaster/dfreq-sprint-stance-feedback-20261119
- Modelo base: https://huggingface.co/djduecaster/dfreq
- Créditos del modelo upstream (referenciado en la model card): upstream-base-card.md (ruta relativa dentro del repositorio)
- Nota de licencia (referenciada en la model card): LICENSE-NOTE.txt (ruta relativa dentro del repositorio)
- Evaluador fijado (commit de referencia): 9bf04c0668145528035c8a315d5d8ae2530c1279 (sin URL pública proporcionada)
