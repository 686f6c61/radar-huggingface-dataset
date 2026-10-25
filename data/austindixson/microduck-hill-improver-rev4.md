# austindixson/microduck-hill-improver-rev4

## Resumen

`austindixson/microduck-hill-improver-rev4` es una política de control robótico en formato ONNX, no un modelo de lenguaje. Se trata de una entrada para la categoría de 1,5 m Hill Climb de la Microduck Arena, el simulador de Pollen Robotics para el robot bípedo MicroDuck. El autor, austindixson, parte del modelo `dashi/microduck-hill-remix-r752` (revisión `262d14b83`) y aplica un ajuste fino muy acotado: un delta de CMA en bucle cerrado horneado de forma aditiva únicamente en la tabla de la semilla 4 (`nb_T4`), dejando el resto de semillas bit a bit idénticas.

La red permanece congelada: no se han modificado la fuerza, el engranaje ni la masa del robot simulado. El resultado es un artefacto de 0,0 GB con dos ficheros (`policy.onnx` y `manifest.json`) que mapea una observación de 61 valores a 14 acciones. Los tiempos declarados en las semillas oficiales son de 0,74, 0,76, 0,74, 0,76 y 0,76 s (media 0,752 s), medidos con la herramienta `arena score` sobre x86-64 Linux.

Su relevancia es acotada pero clara para quien trabaja en optimización evolutiva aplicada a políticas congeladas: documenta una técnica concreta (residual de contador de pasos con delta CMA aditivo por semilla) sobre una línea de trabajo de remixes comunitarios. El propio autor advierte que es un modelo exclusivamente de simulación y que no debe cargarse en un MicroDuck físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal congelada, inferencia vía ONNX; no se documenta la topología interna) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de tamaño fijo `obs` [1, 61], salida `actions` [1, 14] |
| Tipos de cuantización | no disponible (se distribuye un único `policy.onnx`; no se listan variantes cuantizadas) |
| Idiomas soportados | no aplica (no procesa lenguaje natural) |
| Licencia | no disponible; el autor indica explícitamente que el modelo base no declara licencia y este repositorio tampoco |
| Formato de pesos | ONNX (`policy.onnx`, sha256 `d4f6b7dca303aebd87b836a32a8649e465c7306c9c96a7c321a44acc6c054219`) + `manifest.json` con esquema 2 |

## Arquitectura y entrenamiento

No se publica la topología de la red. La información disponible describe el proceso de ajuste, no la arquitectura: se parte de la política del modelo base `dashi/microduck-hill-remix-r752`, que a su vez construye sobre el método de residual de contador de pasos de jrubiosainz y sobre los remixes de tablas por semilla de DenRakEiw y dashi. La intervención de esta revisión consiste en hornear de forma aditiva un delta de CMA (optimización por evolución de estrategias con matrices de covarianza) en bucle cerrado sobre la tabla de la semilla 4 (`nb_T4`).

El entrenamiento se realizó, por tanto, sobre una red congelada a la que se le modifica una tabla de consulta indexada por el contador de pasos, sin reentrenar pesos ni alterar los parámetros físicos del simulador. No se especifican el número de tokens, la composición del dataset ni el uso de RLHF o DPO, que no aplican a este dominio. No hay innovaciones de decodificación (atención lineal, decodificación especulativa) porque no hay generación autorregresiva de texto.

## Capacidades

- Control de política para locomoción bípeda en simulación: recibe un vector de observación de 61 elementos y emite 14 valores de acción.
- Ejecución en bucle cerrado en el simulador de la Microduck Arena, modalidad 1,5 m Hill Climb.
- Comportamiento especializado por semilla: la mejora está codificada para la semilla 4; el resto de semillas quedan idénticas al modelo base.
- Inferencia portable vía ONNX, sin dependencia de GPU ni de frameworks de deep learning pesados.
- Integración con la herramienta oficial de puntuación `arena score` para obtener tiempos de carrera.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio, ni capacidades multilingües.

## Casos de uso

- Referencia base para la categoría 1,5 m Hill Climb: sirve como punto de comparación con tiempos objetivos (media de 0,752 s) para cualquier nueva entrada en la leaderboard de la Microduck Arena.
- Estudio de ablación del método de horneado de delta CMA: al modificarse solo `nb_T4` y declararse el resto bit a bit idéntico, permite aislar el efecto de la intervención sobre una única semilla sin contaminación cruzada.
- Validación de pipelines de evaluación: el hash sha256 del `.onnx` y la herramienta `arena score` sobre x86-64 Linux permiten montar tests de reproducibilidad de la cadena de puntuación.
- Pruebas de integración de ONNX Runtime en herramientas de la comunidad MicroDuck, con formas de entrada y salida fijas y bien documentadas ([1, 61] → [1, 14]).
- Material docente en optimización evolutiva: ilustra cómo un CMA-ES en bucle cerrado puede aplicarse sobre una política congelada en lugar de sobre los pesos, con un coste computacional mínimo.
- Análisis de sobreajuste in-sample: el autor etiqueta explícitamente los tiempos como in-sample, lo que lo convierte en un caso útil para discutir la diferencia entre métricas de entrenamiento y evaluación held-out en políticas de control.
- Test de regresión en cadenas de remixes: comparar rev4 contra `microduck-hill-improver-rev3` y contra `dashi/microduck-hill-remix-r752` para verificar que la herencia de tablas por semilla se mantiene.

## Benchmarks y rendimiento

Tiempos de carrera declarados por el autor, medidos con `arena score` sobre x86-64 Linux en las semillas oficiales de la Microduck Arena (categoría 1,5 m Hill Climb). Son métricas in-sample, según advierte el propio autor.

| Semilla oficial | Tiempo (s) |
|---|---|
| Semilla 1 | 0,74 |
| Semilla 2 | 0,76 |
| Semilla 3 | 0,74 |
| Semilla 4 | 0,76 |
| Semilla 5 | 0,76 |
| Media | 0,752 |

No se han publicado resultados de benchmarks comparativos con otras entradas de la Arena en la información disponible, por lo que no es posible establecer una tabla comparativa de rendimiento frente a alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el repositorio ocupa 0,0 GB y la política opera sobre vectores de 61 entradas y 14 salidas, por lo que la inferencia es viable en CPU.
- GPU recomendadas: no se especifican; no es necesario acelerador gráfico. Cualquier CPU x86-64 moderna es suficiente para ejecutar el modelo dentro del simulador.
- Compatibilidad con GPU de consumo: no aplica como requisito; el cuello de botella es el propio simulador físico, no la política.
- Opciones de despliegue: ONNX Runtime (o cualquier runtime compatible con ONNX) junto con el simulador de la Microduck Arena. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. Dada la forma de entrada y salida, la inferencia de la política es despreciable frente al coste del paso de simulación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / E-S | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `austindixson/microduck-hill-improver-rev4` | no disponible | obs [1, 61] → actions [1, 14] | Media 0,752 s (in-sample) | no declarada | HuggingFace, 0 descargas |
| `dashi/microduck-hill-remix-r752` (base) | no disponible | no disponible | no disponible | no declarada | HuggingFace |
| `austindixson/microduck-hill-improver-rev3` | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Política base de `jrubiosainz` | no disponible | no disponible | no disponible | no disponible | HuggingFace |

No hay datos públicos de tiempos comparables para las alternativas en la información proporcionada, por lo que no se puede afirmar que rev4 sea mejor o peor que su modelo base o que rev3.

## Limitaciones y advertencias

- Solo simulación: el autor indica de forma explícita que no debe cargarse en un MicroDuck físico. Los resultados no transfieren a hardware real.
- Métricas in-sample: los tiempos de 0,74–0,76 s proceden de las mismas semillas usadas en el ajuste; no hay evaluación held-out publicada.
- Licencia ausente: ni el modelo base ni este repositorio declaran licencia. Sin licencia explícita, el uso comercial queda en una zona jurídica indeterminada y conviene contactar con el autor antes de cualquier despliegue.
- Especialización extrema por semilla: la intervención afecta únicamente a `nb_T4` (semilla 4); el resto de tablas son idénticas al base, de modo que la mejora no es general.
- Sin capacidades de lenguaje: no procesa texto, no soporta tool calling, agentes, visión ni audio; cualquier expectativa en ese sentido es un error de categoría.
- Madurez y mantenimiento: 0 descargas y 0 likes en el momento de la consulta, repositorio de 0,0 GB con dos ficheros y sin documentación sobre la topología de red. El riesgo de abandono o de falta de soporte es alto.
- Fechas de creación y actualización (2026-10-25) posteriores a la fecha habitual de consulta; conviene verificar la integridad del repositorio antes de usarlo en una cadena de evaluación.
- Sin sesgos lingüísticos ni de alucinación en el sentido habitual, pero sí riesgo de sobreajuste al simulador y a la dinámica concreta del MicroDuck en la Arena.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/austindixson/microduck-hill-improver-rev4
- Revisión anterior: https://huggingface.co/austindixson/microduck-hill-improver-rev3
- Modelo base: https://huggingface.co/dashi/microduck-hill-remix-r752
- Perfil de jrubiosainz (política base y método de residual): https://huggingface.co/jrubiosainz
- Perfil de dashi (remixes de tablas por semilla): https://huggingface.co/dashi
- Perfil de DenRakEiw: https://huggingface.co/DenRakEiw
- Microduck Arena (Space de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Modelos fine-tune derivados de la familia improver: https://huggingface.co/models?other=base_model:finetune:austindixson/microduck-hill-improver
- Perfil de GitHub del autor: https://github.com/austindixson/
- Tutorial de hardware y software del MicroDuck: https://github.com/AI-FanGe/Microduck-build-tutorial
- Recursos y repositorios de MicroDuck: https://microduckrobot.org/resources/
