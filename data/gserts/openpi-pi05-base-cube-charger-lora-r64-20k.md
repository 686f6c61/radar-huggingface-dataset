# Gserts/openpi-pi05-base-cube-charger-lora-r64-20k

## Resumen
OpenPI PI05 cube charger LoRA r64 es un checkpoint de política robótica basado en el modelo pi05 (variante de la familia Physical Intelligence pi0) desarrollado por el usuario Gserts. Se trata de un ajuste fino mediante LoRA de rango 64 sobre los pesos oficiales pi05_base en JAX, entrenado durante 20.000 actualizaciones del optimizador con batch 16 y semilla 1000 sobre el dataset `Gserts/push_cube_charger_20261102_205242`. El modelo resuelve una tarea concreta de manipulación: empujar un cubo hacia un cargador, a partir de dos cámaras RGB (frontal y de muñeca) y el estado articular de seis posiciones.

El interés de esta ficha es acotado: no es un modelo de propósito general ni un LLM, sino un artefacto de investigación reproducible para robótica encarnada. Emplea la arquitectura pi05 de openpi, que combina un backbone de visión-lenguaje Gemma con un experto de acciones (action expert) para generar trayectorias de acciones continuas condicionadas por instrucciones en lenguaje natural e imágenes.

El repositorio ocupa 6,7 GB e incluye el checkpoint nativo Orbax de JAX, los assets de normalización y el adaptador específico del proyecto. No es un adaptador PEFT de LeRobot, lo que condiciona su proceso de carga y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi05 (openpi): backbone de visión-lenguaje Gemma con action expert, ajustado con LoRA; implementación en JAX |
| Parametros totales | no disponible (el repositorio ocupa 6,7 GB; no se especifica el recuento) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint JAX Orbax en precisión nativa; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (las instrucciones se proporcionan mediante el campo `prompt`; el backbone Gemma subyacente es multilingüe, pero el ajuste se limita a la tarea) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint nativo openpi JAX Orbax (no es un adaptador PEFT de LeRobot) |

## Arquitectura y entrenamiento
El modelo parte de los pesos oficiales `pi05_base` en JAX. Sobre ellos se aplica LoRA de rango 64 con alpha 64 en ambos backbones Gemma, usando el filtro de congelación oficial de LoRA de openpi; además, los parámetros de visión y proyección fuera de ese filtro también se actualizan. El entrenamiento se ejecutó durante 20.000 actualizaciones del optimizador con batch 16 y semilla 1000.

La normalización por cuantiles se recalcula a partir del dataset completo, con trozos de 50 acciones con recorte por episodio (episode-clamped). El dataset de entrenamiento es `Gserts/push_cube_charger_20261102_205242`, específico de la tarea de empujar un cubo hacia un cargador. El estado del optimizador solo se conserva en el clúster HPC del autor y no se distribuye en el repositorio.

## Capacidades
- Generación de acciones robóticas continuas: produce `actions[..., :6]` en unidades articulares absolutas originales.
- Política condicionada por visión: consume `observation.images.front` y `observation.images.wrist` en RGB; si falta la tercera cámara, se enmascara.
- Condicionada por estado propioceptivo: recibe `observation.state` con seis posiciones articulares.
- Condicionada por instrucción en lenguaje natural mediante el campo `prompt`.
- Ejecución por prefijos: el autor recomienda ejecutar únicamente el prefijo deseado de acciones (la configuración previa usaba 10 acciones a 30 Hz) y replanificar después.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión general, audio ni modo de pensamiento; el alcance es exclusivamente la política robótica entrenada.

## Casos de uso
- Manipulación de un cubo hacia un cargador: es el caso de uso directo y único documentado; el modelo genera trayectorias articulares para completar la tarea a partir de las dos cámaras y el estado de las juntas.
- Investigación en ajuste fino con LoRA sobre políticas VLA: sirve como referencia reproducible de un entrenamiento de 20.000 pasos con rango 64 sobre pi05_base, útil para comparar hiperparámetros.
- Reproducción de experimentos en openpi: al fijarse el commit 215abfb217dbac7d5f1273282331b9b1866c0479 y el parche `openpi_project/project.patch`, permite replicar la inferencia en un entorno controlado.
- Evaluación de control a 30 Hz con replanificación: el patrón de ejecutar 10 acciones y replanificar es aplicable a pipelines de control en bucle cerrado con cámaras de bajo coste.
- Base para nuevos ajustes de tarea: al ser un checkpoint completo con assets de normalización, puede servir de punto de partida para otros objetos o entornos mediante un nuevo ajuste LoRA.
- Docencia y formación en robótica encarnada: su tamaño moderado (6,7 GB) y licencia Apache 2.0 facilitan su uso en laboratorios y cursos prácticos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 6,7 GB, por lo que se requiere al menos esa cantidad de memoria, más el overhead de JAX y del runtime de openpi.
- GPU recomendadas: no disponibles en la información proporcionada; al ser un checkpoint JAX, se necesita una GPU compatible con CUDA y con JAX.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño del repositorio (6,7 GB) sugiere que podría caber en GPUs de consumo con 12-16 GB o más, pero no hay datos oficiales.
- Opciones de despliegue: openpi con el commit 215abfb217dbac7d5f1273282331b9b1866c0479 y `openpi_project/project.patch`, cargando con `config pi05_cube_charger_lora_r64` y `policy_config.create_trained_policy`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor menciona una configuración previa de 10 acciones a 30 Hz, pero no se aportan métricas de latencia del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenPI PI05 cube charger LoRA r64 (este) | no disponible | no disponible | sin benchmarks publicados | Apache 2.0 | Hugging Face, 0 descargas |
| pi05_base (oficial, openpi) | no disponible | no disponible | no disponible | no disponible en la información | referencia base del ajuste |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias
- Alcance muy restringido: el modelo está entrenado exclusivamente para la tarea de empujar un cubo hacia un cargador; no generaliza a otras tareas sin un nuevo ajuste.
- Dependencia de una versión concreta de openpi: requiere el commit 215abfb217dbac7d5f1273282331b9b1866c0479 y el parche `openpi_project/project.patch`; otras versiones pueden no ser compatibles.
- No es un adaptador PEFT de LeRobot: no puede cargarse con las herramientas estándar de LeRobot, lo que limita su reutilización directa.
- Estado del optimizador no incluido: solo se conserva en el HPC del autor, lo que impide reanudar el entrenamiento desde el checkpoint.
- Sin métricas de rendimiento ni benchmarks publicados: no hay evidencia cuantitativa de éxito en la tarea ni de robustez ante variaciones de iluminación, posición u oclusión.
- Dependencia de dos cámaras RGB y del estado articular: si falta una cámara se enmascara, pero no se documenta el impacto en el rendimiento.
- Riesgo de sobreajuste al dataset específico: con 20.000 pasos sobre un único dataset, la política puede memorizar condiciones concretas del entorno de recogida.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación en producción recae en el usuario.
- Idiomas no documentados: el campo `prompt` se usa para condicionar la política, pero no se especifica qué idiomas ni formatos de instrucción funcionan correctamente.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Gserts/openpi-pi05-base-cube-charger-lora-r64-20k
- Dataset de entrenamiento: https://huggingface.co/datasets/Gserts/push_cube_charger_20261102_205242
- Repositorio openpi (referencia del framework): no disponible en la información proporcionada
- Commit de openpi requerido: 215abfb217dbac7d5f1273282331b9b1866c0479 (sin URL directa en la información)
- Paper de pi05 / pi0: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
