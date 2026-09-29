# mulligan/sim-square-broad-r01-sobol-no-cf-idql

## Resumen

`mulligan/sim-square-broad-r01-sobol-no-cf-idql` es un agente de control robótico basado en estado (state-based) entrenado con el algoritmo IDQL (Implicit Diffusion Q-Learning): un actor de difusión combinado con un crítico IQL escalar. Lo publica la organización `mulligan` como parte de la campaña de investigación Mulligan, cuyo objetivo es comparar brazos algorítmicos y de recogida de datos sobre una misma tarea de manipulación simulada denominada `sim-square-broad`. No es un modelo de lenguaje: no procesa ni genera texto, sino que mapea observaciones de estado a acciones de control.

El artefacto contiene cinco semillas (seeds 1 a 5) del mismo brazo experimental, `sobol-no-cf`, todas detenidas en el paso de entrenamiento 250001 y etiquetadas dentro de la celda de campaña `sq_d1_r1_ours_sobol_nocf_human_only`. Cada semilla incluye un checkpoint PyTorch (`policy.pt`) y un fichero de normalizadores (`stats.json`). Los pesos son copias byte a byte de artefactos de Weights & Biases, verificadas con MD5 contra el manifiesto del artefacto y con SHA-256 registrado en `release.json`.

Su relevancia es de investigación más que de producto: sirve como referencia reproducible para estudiar aprendizaje por imitación iterativo (DAgger), aprendizaje por refuerzo offline y variabilidad entre semillas en robótica simulada. Los datos de entrenamiento provienen de teleoperación humana y de rollouts de política, y el modelo se referencia desde el conjunto de evaluación `sim-square-broad-r00-r03-eval`. La licencia es MIT y el tamaño total del repositorio es de 1,4 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | IDQL: actor de difusión (diffusion policy) con crítico IQL escalar, basado en estado |
| Parametros totales | no disponible |
| Longitud de contexto | no aplicable (política de control basada en estado; sin ventana de contexto de lenguaje) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas; el checkpoint se distribuye en precisión de entrenamiento) |
| Idiomas soportados | no aplicable (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`policy.pt`, pickle) más `stats.json` con normalizadores |
| Tarea | `sim-square-broad` |
| Ronda de modelo | R1 |
| Brazo experimental | `sobol-no-cf` |
| Celda de campaña | `sq_d1_r1_ours_sobol_nocf_human_only` |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Tamaño del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema IDQL: el actor es una política de difusión que genera acciones mediante un proceso de denoising iterativo, mientras que la función de valor se estima con un crítico IQL (Implicit Q-Learning) de salida escalar. Este diseño combina la expresividad multimodal de las políticas de difusión — útil cuando la distribución de acciones demuestra ser multimodal — con el sesgo conservador de IQL, que evita consultar acciones fuera de la distribución del conjunto de datos mediante regresión por expectil. El modelo es state-based: la entrada es un vector de estado, no imágenes, y la salida es una acción de control.

El entrenamiento se realizó sobre tres conjuntos de datos de la organización `mulligan`: `sim-square-broad-c00-teleop-sobol` (teleoperación humana), `sim-square-broad-c01-dagger-sobol-no-cf` (datos de agregación tipo DAgger) y `sim-square-broad-c01-sobol-policy-rollouts` (rollouts de política). El nombre del brazo, `sobol-no-cf`, sugiere el uso de secuencias de Sobol para la selección de puntos de exploración o inicialización, aunque la model card no detalla el procedimiento. Se desconoce el número de tokens, transiciones o episodios de entrenamiento, así como la composición exacta de la mezcla de datos. Los cinco checkpoints se entrenaron y evaluaron con el código de investigación de Mulligan en los commits Git indicados en la model card (por ejemplo, `604a0622cf7b`, `4dcb7a9e8e7b`, `11dfbbda36b2`).

Cada semilla procede de un artefacto de W&B distinto de la ejecución `self-improving/square-d1-dagger-mining-01a`, con identificadores de tarea `task11` a `task15`. Los ficheros son copias idénticas a nivel de byte de dichos artefactos, con verificación MD5 contra el manifiesto y SHA-256 en `release.json`, lo que convierte al repositorio en una fuente razonablemente auditable para reproducibilidad.

## Capacidades

- Control robótico basado en estado: genera acciones de control continuas para la tarea simulada `sim-square-broad`.
- Aprendizaje por imitación iterativo: el brazo `sobol-no-cf` se entrena con datos de teleoperación más datos de agregación DAgger, lo que indica capacidad para mejorar a partir de rollouts propios etiquetados.
- Política multimodal: al emplear un actor de difusión, puede representar distribuciones de acción multimodales, a diferencia de políticas deterministas de regresión directa.
- Crítico escalar para evaluación de acciones: el crítico IQL permite puntuar acciones y apoyar rutinas de selección o filtrado, además de servir como señal durante el entrenamiento.
- Reproducibilidad multi-semilla: cinco semillas independientes en el mismo paso de entrenamiento permiten estimar varianza y construir intervalos de confianza.
- Integración en pipelines de investigación: checkpoints en PyTorch estándar con normalizadores separados, cargables desde código propio.
- No soporta tool calling, function calling, razonamiento multi-paso en lenguaje, ni capacidades multilingües. No tiene modo «thinking», visión ni audio documentados.
- No se documentan capacidades de generalización fuera de la tarea ni de transferencia a otros entornos.

## Casos de uso

- Evaluación comparativa en un banco de pruebas: los checkpoints están pensados para puntuarse en Policy Arena frente a otros brazos de la misma campaña, de modo que se puede medir de forma controlada el efecto de la estrategia de datos y del algoritmo.
- Investigación en aprendizaje por refuerzo offline: sirve como referencia IDQL sobre una tarea concreta para comparar contra variantes de crítico, de actor o de regularización.
- Aprendizaje por imitación iterativo tipo DAgger: los cinco checkpoints pueden usarse como política base para generar nuevos rollouts, etiquetarlos con teleoperación y reentrenar, que es exactamente el bucle reflejado en los conjuntos de datos `c01-dagger` y `c01-policy-rollouts`.
- Estudio de varianza entre semillas: al estar todas las semillas en el paso 250001, permiten calcular desviaciones entre ejecuciones y detectar si una diferencia entre brazos experimentales supera el ruido de inicialización.
- Generación de datos sintéticos de manipulación: los rollouts de política son un insumo directo para entrenar otras políticas o para análisis de cobertura del espacio de estados.
- Destilación de política: al ser una política de difusión con muestreo iterativo, puede emplearse como profesora para destilar una política determinista más rápida de ejecutar en tiempo real.
- Auditoría de procedencia en publicaciones: los ficheros verificados con MD5 y SHA-256 permiten citar artefactos exactos en un artículo y reconstruir el experimento desde los commits indicados.
- Validación previa a transferencia sim-a-real: la tarea simulada `sim-square-broad` puede servir de escalón intermedio antes de probar controladores en hardware, siempre que se valide la brecha de simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia el conjunto de evaluación `mulligan/sim-square-broad-r00-r03-eval` y el panel público Policy Arena, pero no incluye cifras de éxito, retorno ni comparaciones numéricas con otros brazos.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. El repositorio completo ocupa 1,4 GB e incluye cinco semillas más ficheros auxiliares, lo que sitúa cada `policy.pt` en el orden de decenas a cientos de megabytes en el peor caso; en cualquier escenario, la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no se especifican. Para una política de control basada en estado, cualquier GPU NVIDIA con varios gigabytes de VRAM es suficiente, y la inferencia en CPU es probablemente viable.
- Compatibilidad con GPU de consumo: sí, previsiblemente en cualquier GPU moderna de consumo (por ejemplo, gama RTX). No hay requisitos de memoria comparables a los de un modelo de lenguaje de gran tamaño.
- Opciones de despliegue: carga directa del checkpoint PyTorch (`policy.pt`) y de los normalizadores (`stats.json`) desde código propio. Los servidores de inferencia para modelos de lenguaje (vLLM, TGI, llama.cpp, Ollama) no son aplicables a este artefacto. No se documentan exportaciones a TorchScript, ONNX ni formatos intermedios.
- Latencia y throughput: no disponibles. Como consideración general del método (no confirmada para este checkpoint), un actor de difusión requiere varios pasos de denoising por acción, lo que incrementa el coste de inferencia frente a una política determinista de una sola pasada; esto es relevante si se pretende controlar a frecuencias altas.
- Nota de seguridad: los ficheros `.pt` son pickles de PyTorch. La propia model card advierte de cargarlos únicamente en entornos de confianza.

## Comparativa con modelos similares

No se dispone de datos numéricos ni de especificaciones de modelos comparables en la información proporcionada. La comparación siguiente es metodológica, no de rendimiento, y todas las celdas sin dato verificable se marcan como no disponibles.

| Modelo o método | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| IDQL (este modelo) | Actor de difusión + crítico IQL escalar, basado en estado | no disponible | no aplicable | no disponible | MIT | Pesos en HuggingFace (5 semillas) |
| Diffusion Policy (imitación pura) | Política de difusión entrenada por comportamiento clonado | no disponible | no aplicable | no disponible | no disponible | Implementación de referencia pública |
| IQL | Actor-crítico offline con regresión por expectil | no disponible | no aplicable | no disponible | no disponible | Implementación de referencia pública |
| TD3+BC / DDPG+BC | Actor-crítico offline con regularización hacia la política de comportamiento | no disponible | no aplicable | no disponible | no disponible | Implementación de referencia pública |
| Otros brazos de la campaña Mulligan (por ejemplo, `sobol-no-cf` frente a alternativas de la misma ronda R1) | Agentes IDQL sobre la misma tarea | no disponible | no aplicable | no disponible | MIT (los publicados) | Parcialmente disponibles en la organización `mulligan` |

## Limitaciones y advertencias

- Alcance restringido a una única tarea: el modelo está entrenado para `sim-square-broad` y no hay evidencia de transferencia a otras tareas, morfologías o entornos.
- Entrada basada en estado: no acepta imágenes ni observaciones visuales, lo que limita su uso en configuraciones donde solo se dispone de cámara.
- Entorno simulado: no se documenta validación en hardware real ni tamaño del dominio de aleatorización; la brecha sim-a-real es un riesgo no cuantificado.
- Sin datos de rendimiento publicados: no es posible estimar la tasa de éxito ni compararla con alternativas sin ejecutar la evaluación en Policy Arena o reproducir el protocolo.
- Variabilidad entre semillas desconocida: aunque se publican cinco semillas, la model card no reporta la dispersión de resultados, por lo que no se puede juzgar la estabilidad del método.
- Riesgo de fallo fuera de distribución: como toda política entrenada con datos limitados, puede degradarse ante estados no vistos; el crítico IQL mitiga la sobreestimación durante el entrenamiento, pero no garantiza robustez en ejecución.
- Sesgos de los datos: los conjuntos de teleoperación humana pueden incorporar sesgos de operador (velocidad, trayectorias preferidas) que la política reproduce.
- Seguridad al cargar pesos: los ficheros `.pt` son pickles; cargarlos de fuentes no confiables puede ejecutar código arbitrario.
- Licencia permisiva: MIT permite uso comercial y modificación, pero no se ofrece ninguna garantía ni soporte, y el autor no ofrece responsabilidad sobre el comportamiento del controlador.
- Restricciones de uso en producción: no hay documentación de seguridad funcional, paradas de emergencia, límites de par o modos de fallo; su uso en robots físicos exigiría capas de seguridad externas.
- Inexistencia de métricas de inferencia: no se documentan latencia, frecuencia de control alcanzable ni consumo de memoria en tiempo de ejecución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r01-sobol-no-cf-idql
- Página del proyecto Mulligan: https://mulligan.page
- Panel de evaluaciones Policy Arena: https://arena.mulligan.page
- Organización en HuggingFace: https://huggingface.co/mulligan
- Conjunto de datos de teleoperación: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-sobol
- Conjunto de datos DAgger: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-sobol-no-cf
- Conjunto de datos de rollouts de política: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-sobol-policy-rollouts
- Conjunto de evaluación: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Búsqueda web: no se encontró ningún enlace relevante al modelo; los resultados devueltos eran contenido no relacionado y spam, por lo que se han descartado.
