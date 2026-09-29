# mulligan/sim-square-narrow-r00-sobol-divl

## Resumen

`mulligan/sim-square-narrow-r00-sobol-divl` es un agente de control robótico basado en estado (no visual, no lingüístico) entrenado para la tarea de simulación `sim-square-narrow`. Lo publica la organización Mulligan como parte de su campaña de investigación en aprendizaje por refuerzo offline, y su rasgo arquitectónico distintivo es la combinación de un actor de difusión congelado (heredado del modelo `sim-square-narrow-r00-sobol-idql`) con un crítico DIVL de naturaleza distribuional. El artefacto no es un modelo de lenguaje: no genera texto ni código, sino acciones de control de bajo nivel a partir del vector de estado del simulador.

El repositorio contiene cinco semillas independientes (seeds 1 a 5) del mismo experimento, todas correspondientes a la ronda R0, al brazo `sobol` y a la celda de campaña `sq_d0_r0_ours_sobol`, con el entrenamiento detenido en el paso 150.001. Los pesos se distribuyen como `policy.pt` (pickle de PyTorch) más un `stats.json` con estadísticas de normalización, y el conjunto ocupa 1,4 GB, es decir unos 280 MB por semilla. La licencia es MIT.

Su relevancia es acotada y muy específica: sirve como referencia reproducible para investigar críticos distribuionales sobre actores de difusión congelados, y como punto de comparación dentro de Policy Arena, el tablero de evaluaciones público de Mulligan. Las cinco semillas alcanzan una tasa de éxito agregada de 31.611 sobre 40.000 rollouts (79,03 %) en una rejilla de estados iniciales retenidos, con una dispersión entre semillas de 76,53 % a 81,45 %.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Agente de control basado en estado: actor de difusión congelado + crítico DIVL distribuional |
| Parametros totales | no disponible (la model card no publica recuento de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: politica basada en estado, sin ventana de contexto textual; el horizonte de observacion no esta documentado |
| Tipos de cuantizacion | no disponible; se distribuyen pesos PyTorch sin cuantizar en precision no especificada |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch pickle (`.pt`) + `stats.json` |
| Tarea | `sim-square-narrow` |
| Ronda de modelo | R0 |
| Brazo | `sobol` |
| Celda de campana | `sq_d0_r0_ours_sobol` |
| Semillas incluidas | 1, 2, 3, 4, 5 (una carpeta por semilla) |
| Paso de entrenamiento | 150.001 |
| Tamano del repositorio | 1,4 GB (~280 MB por semilla) |
| Dataset de entrenamiento | `mulligan/sim-square-narrow-c00-teleop-sobol` |
| Commit de codigo | `3053203fc3df` |

## Arquitectura y entrenamiento

El agente es un policy de RL offline para control continuo. La model card lo describe explícitamente como «state-based agent with the parent's frozen diffusion actor and a distributional DIVL critic»: el actor es una política de difusión que se mantiene congelada y se hereda del modelo `sim-square-narrow-r00-sobol-idql`, mientras que el componente que se entrena en esta ronda es un crítico DIVL de tipo distribuional. Los nombres de los artefactos de Weights & Biases de los que provienen los checkpoints (`iql_ddpg_bc_idql_divl_nutassemblysquare_...`) indican que el pipeline combina componentes de IQL, DDPG+BC e IDQL junto con DIVL, si bien la model card no detalla la formulación matemática de DIVL ni la composición exacta de la pérdida.

El entrenamiento se realizó sobre el dataset `mulligan/sim-square-narrow-c00-teleop-sobol`, un conjunto teleoperado en formato LeRobot (etiquetado como tabular/time-series, entre 10K y 100K muestras, 4,01 MB, licencia Apache-2.0). Cada una de las cinco semillas se ejecutó como un run independiente y los archivos publicados son copias byte a byte de los artefactos de W&B, con verificación MD5 contra el manifiesto y SHA-256 registrado en `release.json`. No se documentan técnicas como decodificación especulativa, atención lineal ni ningún otro mecanismo de eficiencia: son conceptos propios de modelos de lenguaje y no aplican a esta política.

## Capacidades

- Control robótico de una única tarea: genera acciones de control para `sim-square-narrow` a partir del estado del simulador.
- Política basada en estado: no consume imágenes ni observaciones visuales, sino el vector de estado (state-based).
- Actor de difusión: la generación de acción sigue un proceso de difusión, típicamente con varios pasos de denoising por decisión.
- Crítico distribuional: modela la distribución del retorno en lugar de solo su esperanza, lo que permite razonar sobre la variabilidad del valor.
- Reproducibilidad multi-semilla: cinco políticas entrenadas de forma independiente con el mismo protocolo.
- No soporta tool calling ni function calling.
- No soporta uso como agente conversacional ni razonamiento multi-paso en lenguaje natural.
- No tiene capacidades multilingües, de código, de matemáticas ni de visión.
- No dispone de modo «thinking», audio ni ninguna modalidad adicional.

## Casos de uso

- Reproducción de resultados en RL offline: cargar las cinco semillas y evaluarlas sobre la misma rejilla de estados iniciales retenidos para verificar la tasa de éxito publicada (79,03 % agregada) con el código de investigación en el commit `3053203fc3df`.
- Estudio de críticos distribuionales: comparar el comportamiento del crítico DIVL frente a alternativas de la misma campaña manteniendo el actor congelado, aislando así el efecto del crítico sobre el rendimiento final.
- Generación de datos para DAgger e imitación: los rollouts del agente pueden volcarse a un dataset etiquetado y reutilizarse para reentrenar políticas posteriores, tal como sugiere el nombre del run de origen (`square-dagger-mining-01a`).
- Análisis de varianza entre semillas: las cinco semillas permiten cuantificar la dispersión del éxito (76,53 %–81,45 %) y estimar la sensibilidad del algoritmo a la inicialización.
- Punto de partida para investigar sim2real: usar las políticas como baseline entrenado en simulación antes de aplicar perturbaciones de dominio o aleatorización, aunque no hay evidencia publicada de transferencia a robot real.
- Comparación dentro de Policy Arena: subir o consultar evaluaciones del modelo en el tablero público de Mulligan para situarlo frente a otros brazos y rondas de la misma tarea.
- Prueba de infraestructura de evaluación: al ser un artefacto pequeño y autocontenido, sirve para validar pipelines internos de carga de checkpoints, normalización con `stats.json` y cómputo de métricas de éxito antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Evaluación sobre rejilla de estados iniciales retenidos, con 32 estados por semilla y 250 rollouts por estado (8.000 episodios por semilla), según el dataset `sim-square-narrow-r00-r03-eval`:

| Semilla | N (estados iniciales) | Exitos / rollouts | Tasa de exito |
|---|---|---|---|
| seed-1 | 32 | 6122 / 8000 | 76,53 % |
| seed-2 | 32 | 6516 / 8000 | 81,45 % |
| seed-3 | 32 | 6348 / 8000 | 79,35 % |
| seed-4 | 32 | 6400 / 8000 | 80,00 % |
| seed-5 | 32 | 6225 / 8000 | 77,81 % |
| Agregado | 160 | 31611 / 40000 | 79,03 % |

No se han publicado en la informacion disponible otros benchmarks (MMLU, HumanEval, GSM8K u equivalentes), y en cualquier caso no aplican a un modelo de control robótico.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB por semilla en precision no cuantizada, a partir de los ~280 MB por checkpoint del repositorio (estimacion indirecta, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; no se requiere A100, H100 ni hardware de centro de datos.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU reciente (serie RTX 20/30/40, GTX 16xx o superior). Al ser una politica basada en estado y de tamano reducido, la inferencia en CPU tambien es viable para evaluacion por lotes.
- Opciones de despliegue: PyTorch para cargar el pickle `.pt`; el resto de opciones habituales de LLM (vLLM, llama.cpp, Ollama, TGI) no aplican porque no es un modelo generativo de texto. La evaluacion se realiza con el arnes de investigacion de Mulligan en el commit indicado, y el dataset asociado esta en formato LeRobot.
- Latencia y throughput: no disponibles. Al tratarse de un actor de difusion, la latencia por accion depende del numero de pasos de denoising, que la model card no especifica.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Actor | Critico | Exito publicado | Licencia |
|---|---|---|---|---|---|---|
| `sim-square-narrow-r00-sobol-divl` | sim-square-narrow | Actor de difusion + critico distribuional | Congelado (heredado) | DIVL | 79,03 % (agregado, 5 semillas) | MIT |
| `sim-square-narrow-r00-sobol-idql` | sim-square-narrow | Actor de difusion + IDQL | Origen del actor congelado | IDQL | no disponible en la informacion proporcionada | no disponible |
| Otros brazos de la campana `sq_d0_r0_*` | sim-square-narrow | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos externos comparables dentro de la informacion proporcionada. El unico punto de comparacion documentado es el modelo padre del actor, para el que no se publican tasas de exito en esta ficha.

## Limitaciones y advertencias

- Especializacion extrema: solo opera en la tarea `sim-square-narrow` y no es transferible a otras tareas sin reentrenamiento.
- Dependencia del estado privilegiado: al ser state-based, requiere acceso al vector de estado completo del simulador; no puede desplegarse con entrada unicamente visual.
- Tasa de exito no saturada: en torno al 79 % agregado, con un 20 % de fallos, insuficiente para despliegues que exijan alta fiabilidad.
- Evaluacion limitada: los resultados provienen de una rejilla de estados iniciales retenidos en simulacion; no hay evidencia publicada de transferencia a robot real ni de robustez ante perturbaciones de dominio.
- Riesgo de sobreajuste al protocolo de evaluacion: cinco semillas sobre la misma rejilla pueden no reflejar el comportamiento en distribuciones de estado fuera de la rejilla.
- Sesgos: no se documentan sesgos en el sentido de modelos de lenguaje; el analogue aqui es el sesgo inductivo del dataset de teleoperacion `sim-square-narrow-c00-teleop-sobol`, que condiciona las trayectorias aprendidas.
- Riesgo de seguridad al cargar los pesos: los archivos `.pt` son pickles de PyTorch y la propia model card advierte de que solo deben cargarse en entornos de confianza, ya que la deserializacion puede ejecutar codigo arbitrario.
- Restricciones de licencia: MIT permite uso comercial y modificacion sin garantia alguna; conviene verificar la licencia del dataset de entrenamiento (Apache-2.0) si se redistribuye el modelo junto con datos derivados.
- Sin soporte de idioma, contexto textual ni capacidades generativas: cualquier expectativa en ese sentido es un error de categoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-narrow-r00-sobol-divl
- Modelo padre del actor congelado: https://huggingface.co/mulligan/sim-square-narrow-r00-sobol-idql
- Dataset de entrenamiento: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol
- Arbol de archivos del dataset de entrenamiento: https://huggingface.co/datasets/mulligan/sim-square-narrow-c00-teleop-sobol/tree/main
- Dataset de evaluacion: https://huggingface.co/datasets/mulligan/sim-square-narrow-r00-r03-eval
- Pagina del proyecto Mulligan: https://mulligan.page
- Tablero de evaluaciones Policy Arena: https://arena.mulligan.page
- Organizacion en HuggingFace: https://huggingface.co/mulligan
