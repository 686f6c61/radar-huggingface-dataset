# mulligan/sim-square-broad-r03-mining-no-cf-idql

## Resumen

`mulligan/sim-square-broad-r03-mining-no-cf-idql` es un agente de aprendizaje por refuerzo offline (offline RL) para control robótico, publicado por el proyecto Mulligan dentro de su campaña de entrenamiento sobre la tarea simulada `sim-square-broad`. No es un modelo de lenguaje: se trata de una política basada en estados (state-based) que implementa el algoritmo IDQL (Implicit Diffusion Q-Learning), con un actor de difusión y un crítico IQL escalar. El repositorio contiene cinco checkpoints independientes, uno por semilla (seeds 1 a 5), correspondientes a la ronda R3 y al brazo experimental `mining-no-cf`.

El modelo resuelve el problema de aprendizaje de políticas a partir de datos offline heterogéneos: mezcla demostraciones de teleoperación (generadas con muestreo Sobol), datos de DAgger con minería de fallos y sin intervención humana (`dagger-mining-no-cf`) y rollouts de políticas previas. La campaña se identifica internamente como `sq_d1_r3_ours_mining_nocf_human_only`, y cada checkpoint está guardado en el paso de entrenamiento 250001.

Su relevancia es de carácter metodológico y reproducible: forma parte de un pipeline público de comparación de algoritmos de RL offline sobre una misma tarea, con configuraciones de ejecución versionadas, hashes SHA-256 de cada fichero en `release.json` y evaluación agregada en Policy Arena. El tamaño total del repositorio es de 1,4 GB, la licencia es MIT y la fecha de actualización registrada es el 2 de octubre de 2026. No se ha publicado información sobre número de parámetros, arquitectura interna detallada (capas, dimensiones) ni métricas numéricas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor de difusión (diffusion policy) con crítico IQL escalar; algoritmo IDQL |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política basada en vectores de estado, no en secuencias de texto) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en formato de pickle, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no aplica (modelo de control robótico, no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | PyTorch checkpoint (`.pt`, pickle) más `stats.json` con normalizadores; hashes en `release.json` |
| Tarea | `sim-square-broad` |
| Ronda / brazo | R3 / `mining-no-cf` |
| Celda de campana | `sq_d1_r3_ours_mining_nocf_human_only` |
| Semillas incluidas | 1, 2, 3, 4 y 5 (una carpeta por semilla) |
| Paso de entrenamiento | 250001 |
| Tamano del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El agente sigue el esquema IDQL: un actor generativo de tipo difusión que modela la distribución de acciones y un crítico Q escalar entrenado con el objetivo de IQL (Implicit Q-Learning). El crítico evita consultar acciones fuera de la distribución del dataset mediante expectiles, y el actor se entrena para muestrear acciones con alto valor según ese crítico. La observación es un vector de estado (no hay entrada visual ni de lenguaje), y los normalizadores asociados se publican en `stats.json`.

Los datos de entrenamiento proceden de siete datasets del proyecto Mulligan que cubren varias fases de la campaña: teleoperación con muestreo Sobol (`sim-square-broad-c00-teleop-sobol`), datos de DAgger con minería de fallos sin intervención humana en las fases c01, c02 y c03 (`dagger-mining-no-cf`), y rollouts de políticas en las fases c01, c02 y c03 (Sobol y Mulligan). No se especifica en la información disponible el número total de transiciones, la composición porcentual del dataset ni si se aplicaron fases adicionales de ajuste. La evaluación agregada de estas políticas se referencia en el dataset `sim-square-broad-r00-r03-eval` y se publica en Policy Arena.

Cada semilla tiene su propia configuración de ejecución en el repositorio de código de Mulligan (`release/run-configs/sim-square-broad-r03-mining-no-cf-idql__seed-N.json`), lo que permite reproducir el entrenamiento desde cero con esas recetas.

## Capacidades

- Control robótico continuo basado en estado: genera acciones a partir de vectores de observación del entorno `sim-square-broad`.
- Modelado multimodal de acciones gracias al actor de difusión, lo que permite representar distribuciones de acción multimodales en lugar de una única acción media.
- Aprendizaje puramente offline sobre datos mixtos de teleoperación, DAgger y rollouts de políticas previas.
- Reproducibilidad por semilla: cinco checkpoints independientes entrenados hasta el paso 250001.
- Generación de rollouts: puede ejecutarse en el simulador para producir trayectorias que alimenten nuevas rondas de minería de datos (como ya ocurrió en las fases c01 a c03).
- No dispone de tool calling, function calling, capacidades de agente multi-paso en el sentido de los LLM, capacidades multilingües, ni modos de razonamiento textual explícito (thinking mode).
- No dispone de visión, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Evaluación comparativa de algoritmos de RL offline: desplegar los cinco checkpoints en el simulador `sim-square-broad` y medir la tasa de éxito para comparar IDQL contra otros algoritmos de la misma campaña en Policy Arena.
- Generación de datos para DAgger iterativo: ejecutar la política en el simulador, detectar episodios fallidos y añadirlos al conjunto de minería de la siguiente ronda, tal y como se hizo entre las fases c01 y c03.
- Reproducción de resultados de investigación: usar las configuraciones `run-configs/...__seed-N.json` y los datasets públicos para retrenar cada checkpoint y verificar los hashes SHA-256 de `release.json`.
- Punto de partida para transferencia a otra tarea simulada: reutilizar el actor de difusión y el crítico como inicialización en una tarea de manipulación relacionada, aprovechando la licencia MIT.
- Estudio de robustez entre semillas: analizar la varianza de comportamiento entre las cinco semillas con el mismo presupuesto de pasos de entrenamiento, útil para cuantificar la estabilidad del algoritmo.
- Destilación o compresión para despliegue embebido: al ser una política basada en estados sin componente visual, es candidata a exportarse a formatos ligeros y ejecutarse en controladores de robot con recursos limitados.
- Referencia para pipelines de robótica simulada: integrar el checkpoint en un bucle de evaluación automatizado que compare rondas R1, R2 y R3 del mismo brazo experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas numéricas (tasa de éxito, retorno medio, número de episodios evaluados) y la única referencia a evaluación es el dataset `sim-square-broad-r00-r03-eval`, cuyos resultados se consultan en Policy Arena y no se han proporcionado en esta búsqueda.

| Benchmark | Resultado | Fuente |
|---|---|---|
| Tasa de éxito en `sim-square-broad` | no disponible | no publicada en la información proporcionada |
| Retorno medio por episodio | no disponible | no publicada en la información proporcionada |
| Comparación R1 / R2 / R3 | no disponible | evaluaciones alojadas en Policy Arena |

## Requisitos de hardware

- VRAM para inferencia: no disponible como cifra publicada. Como estimación orientativa derivada del tamaño del repositorio (1,4 GB para cinco checkpoints, es decir, aproximadamente 280 MB por semilla), cada política debería cargarse en memoria con holgura en GPUs de gama de consumo.
- GPU recomendadas: no disponibles en la documentación. Por el perfil de una política de difusión basada en estados (redes pequeñas, sin visión), cualquier GPU con varios GB de VRAM es suficiente; el entrenamiento completo requiere más recursos que la inferencia.
- Compatibilidad con GPU de consumo: muy probablemente sí (RTX 4090, RTX 3090, e incluso GPUs de gama media), aunque no está confirmado por el autor. La inferencia también debería ser viable en CPU.
- Opciones de despliegue: carga directa con PyTorch (los ficheros son pickles `.pt`); exportación a ONNX o TorchScript no está documentada pero es factible al ser una red feed-forward con actor de difusión. No hay versiones para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. En una política de este tipo, la latencia de inferencia suele ser de fracciones de milisegundo a pocos milisegundos por paso de control en GPU, con varias iteraciones de denoising por acción; no hay mediciones publicadas.
- Almacenamiento: 1,4 GB para el repositorio completo, aproximadamente 280 MB por semilla.
- Advertencia de seguridad: los ficheros `.pt` son pickles de PyTorch y deben cargarse solo en entornos de confianza.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mulligan/sim-square-broad-r03-mining-no-cf-idql` | IDQL (actor de difusión + crítico IQL) | no disponible | no aplica | MIT | HuggingFace, 5 semillas |
| `mulligan/sim-square-broad-r01-mining-no-cf-idql` | IDQL, misma tarea, ronda R1 | no disponible | no aplica | MIT | HuggingFace |
| IDQL original (Hansen-Estruch et al.) | Referencia algorítmica | no disponible | no aplica | no disponible | Publicación académica y código de referencia |
| Diffusion Policy / IQL | Alternativas de RL offline | no disponible | no aplica | no disponible | Repositorios académicos |

No se dispone de cifras comparativas de rendimiento entre estas alternativas en la información proporcionada. La comparación con la ronda R1 del mismo brazo (`mining-no-cf`) es la más directa, ya que comparte tarea, algoritmo y esquema de datos, variando únicamente la ronda de la campaña.

## Limitaciones y advertencias

- Específico de tarea: la política está entrenada para `sim-square-broad` y no se ha validado su transferencia a otros entornos, morfologías de robot o tareas.
- Sin capacidades de lenguaje ni visión: cualquier caso de uso que requiera texto, imágenes o audio queda fuera de su alcance.
- Riesgo de sobreajuste al dataset: al ser RL offline puro, el rendimiento depende críticamente de la cobertura del dataset; en zonas del espacio de estados poco representadas puede producir acciones poco fiables.
- Sin métricas publicadas: no hay tasas de éxito ni intervalos de confianza publicados, por lo que no es posible estimar su rendimiento real a partir de esta ficha.
- Sesgos de datos: los datasets provienen de teleoperación con muestreo Sobol y de minería de fallos, lo que puede sobrerrepresentar situaciones de recuperación y subrepresentar regímenes nominales (o al contrario); no se documenta la composición exacta.
- Licencia MIT: permite uso comercial y modificación, pero al derivar de datos y recetas del proyecto Mulligan conviene revisar las licencias de los datasets enlazados antes de un despliegue comercial.
- Seguridad de carga: los ficheros `.pt` son pickles y pueden ejecutar código arbitrario; hay que cargarlos únicamente en entornos de confianza y verificar los SHA-256 de `release.json`.
- Estado de mantenimiento: cero descargas y cero likes en el momento de la consulta, lo que indica que no hay validación externa ni comunidad de usuarios.
- Uso en robot real: no se documenta ninguna validación en hardware físico, transferencia sim-to-real ni protocolo de seguridad; un uso en producción requeriría validación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mulligan/sim-square-broad-r03-mining-no-cf-idql
- Proyecto Mulligan: https://mulligan.page
- Policy Arena (evaluaciones): https://arena.mulligan.page
- Organización Mulligan en HuggingFace: https://huggingface.co/mulligan
- Dataset `sim-square-broad-c00-teleop-sobol`: https://huggingface.co/datasets/mulligan/sim-square-broad-c00-teleop-sobol
- Dataset `sim-square-broad-c01-dagger-mining-no-cf`: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-dagger-mining-no-cf
- Dataset `sim-square-broad-c01-sobol-policy-rollouts`: https://huggingface.co/datasets/mulligan/sim-square-broad-c01-sobol-policy-rollouts
- Dataset `sim-square-broad-c02-dagger-mining-no-cf`: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-dagger-mining-no-cf
- Dataset `sim-square-broad-c02-mulligan-policy-rollouts`: https://huggingface.co/datasets/mulligan/sim-square-broad-c02-mulligan-policy-rollouts
- Dataset `sim-square-broad-c03-dagger-mining-no-cf`: https://huggingface.co/datasets/mulligan/sim-square-broad-c03-dagger-mining-no-cf
- Dataset `sim-square-broad-c03-mulligan-policy-rollouts`: https://huggingface.co/datasets/mulligan/sim-square-broad-c03-mulligan-policy-rollouts
- Dataset de evaluación `sim-square-broad-r00-r03-eval`: https://huggingface.co/datasets/mulligan/sim-square-broad-r00-r03-eval
- Ronda anterior del mismo brazo (R1): https://huggingface.co/mulligan/sim-square-broad-r01-mining-no-cf-idql
