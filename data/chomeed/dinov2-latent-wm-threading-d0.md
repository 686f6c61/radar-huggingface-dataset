# chomeed/dinov2-latent-wm-threading-d0

## Resumen

`chomeed/dinov2-latent-wm-threading-d0` es un modelo de mundo latente (latent world model) para robótica, desarrollado por chomeed. Su función es comprimir observaciones visuales de dos cámaras en un espacio latente de 56 dimensiones y predecir la evolución de ese estado latente a partir de acciones y propriocepción. Está entrenado en datos de MimicGen para la tarea `threading_d0` (enhebrar), con un requisito de precisión de 4 mm.

El modelo usa un encoder DINOv2-small congelado como extractor de características visuales. En lugar de trabajar con mapas de características de 2×128×28×28, que ocupan 37 GB en un buffer de replay de 100k muestras, el modelo genera un latente de 56 dimensiones que ocupa solo 11 MB. Esto lo hace especialmente útil para aprendizaje por refuerzo, donde la memoria del buffer es un cuello de botella crítico.

La arquitectura completa incluye un encoder (con variantes convolucional, lineal o pooled), un modelo de dinámicas basado en MLP y un decoder que reconstruye los tokens de DINOv2. El estado utilizado para RL es un vector de 65 dimensiones: 56 del latente más 9 de propriocepción. El repositorio tiene un tamaño de 0.1 GB y contiene los pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2-small congelado + encoder (conv/linear/pooled) + MLP de dinámicas + decoder; estado RL de 65 dims (56 latente + 9 proprio) |
| Parametros totales | No disponible; encoder conv 0.63M, linear 11.01M, pooled 0.21M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Horizonte de 8 pasos; no es un modelo de lenguaje |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robótica, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El pipeline comienza con dos cámaras de 224×224 píxeles que se pasan por un DINOv2-small congelado. El encoder produce un grid de 16×16 tokens por cámara, con 384 dimensiones por token y un token CLS adicional. Un encoder entrenable comprime esta representación a un vector latente `z ∈ R^56` tras una capa LayerNorm. La dinámica se modela como `z_{t+1} = z_t + MLP([z_{t-1}, z_t, action_chunk(8×7), proprio(9)])`, donde `action_chunk` contiene 8 acciones de 7 dimensiones y `proprio` es un vector de 9 dimensiones. El decoder reconstruye los tokens de DINOv2 a partir del latente.

El entrenamiento se realizó con 40.000 muestras durante 25.000 pasos. El modelo no se supervisa directamente en la pose del objeto; se entrena únicamente con tres objetivos: reconstrucción de tokens, predicción de dinámicas latentes y predicción de propriocepción futura. La pose se lee posteriormente con un probe de evaluación. La LayerNorm en la salida del encoder es crítica: sin ella, el encoder infla la escala del latente y la métrica de ratio mejora artificialmente mientras la reconstrucción se mantiene plana. Los datos proceden de MimicGen, tarea `threading_d0`.

## Capacidades

- Predicción de dinámicas latentes: dado el estado latente anterior, el actual, un chunk de acciones y propriocepción, el modelo predice el siguiente estado latente.
- Compresión de representaciones visuales: reduce un mapa de características de 37 GB a un latente de 11 MB para buffers de replay de 100k muestras.
- Reconstrucción de tokens DINOv2: el decoder reconstruye los tokens visuales a partir del latente, lo que preserva información útil.
- Soporte para RL: el estado resultante de 65 dimensiones (56 latente + 9 proprio) se puede usar directamente como observación en algoritmos de aprendizaje por refuerzo.
- Lectura de pose mediante probe: incluye un `pose_probe` para evaluar la precisión espacial de las predicciones en milímetros.
- Comparación de encoders: ofrece tres variantes (conv, linear, pooled) para estudiar el equilibrio entre parámetros y capacidad predictiva.
- No soporta tool calling, generación de lenguaje ni visión generativa; es un modelo de mundo para robótica.

## Casos de uso

- Aprendizaje por refuerzo con buffers de replay grandes: el modelo comprime observaciones visuales multicámara en un latente de 56 dimensiones, reduciendo la memoria del buffer de 37 GB a 11 MB para 100k muestras, lo que permite entrenar políticas con más experiencia en el mismo hardware.
- Planificación de movimientos con MPC: el modelo de dinámicas predice estados futuros a partir de acciones candidatas; con un horizonte de 8 pasos se puede usar para optimizar trayectorias cortas en tareas de manipulación.
- Simulación de trayectorias sin ejecutar en el robot: antes de desplegar una política, se pueden simular secuencias de acciones y evaluar los estados latentes resultantes, reduciendo el desgaste del hardware real.
- Compresión de observaciones para sistemas embebidos: al reducir la dimensionalidad de las imágenes a 56 valores, el modelo permite ejecutar percepción y modelado en robots con recursos computacionales limitados.
- Modelado de dinámicas en tareas de precisión: la variante con encoder convolucional alcanza errores de 2.21 mm en needle, 1.57 mm en tripod y 3.02 mm en offset, cumpliendo el requisito de 4 mm en trayectorias expertas.
- Investigación en world models visuales: el modelo sirve como referencia para comparar estrategias de compresión (conv, linear, pooled) y estudiar cómo afectan a la predictibilidad de las dinámicas latentes.
- Evaluación de representaciones para políticas de control: al separar el entrenamiento del latente de la supervisión de pose, se puede analizar qué información sobrevive al bottleneck y cómo se relaciona con el rendimiento del control.

## Benchmarks y rendimiento

La model card incluye resultados para la tarea `threading_d0` con latente de 56 dimensiones, n=40.000 y 25.000 pasos. La métrica `ratio` es el MSE de predicción latente dividido por el MSE de copiar el latente actual; `1 − ratio` representa la fracción de movimiento latente explicado por las dinámicas. Los errores de pose se miden en milímetros.

| Encoder | Parametros | Ratio ↓ | Recon ↓ | Needle (mm) | Tripod (mm) | Offset (mm) |
|---|---|---|---|---|---|---|
| conv (recomendado) | 0.63M | 0.207 | 0.2009 | 2.21 | 1.57 | 3.02 |
| linear | 11.01M | 0.249 | 0.2009 | 2.12 | 1.53 | 2.90 |
| pooled | 0.21M | 0.233 | 0.2144 | 2.65 | 1.65 | 3.57 |

El encoder convolucional supera al linear con 17 veces menos parámetros y al pooled con 52 veces menos. El encoder linear reconstruye mejor pero predice peor, lo que indica que almacena más información en una forma menos favorable para la predicción. Los números se calculan por separado porque el conjunto de validación contiene un 48% de rollouts fallidos, donde el trípode se ha desplazado; los offsets del encoder pooled (11.9–12.6 mm) están dominados por esos fallos y no representan el régimen de un controlador en funcionamiento. No se han publicado benchmarks estándar como MMLU o HumanEval, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0.1 GB y el encoder visual es DINOv2-small congelado, por lo que la inferencia debería ser ligera, pero no hay cifras oficiales.
- GPU recomendadas: no disponibles oficialmente; por el tamaño del modelo, es probable que cualquier GPU de consumo con suficiente VRAM para DINOv2-small pueda ejecutarlo.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del repo y el uso de un encoder pequeño, aunque no hay confirmación explícita.
- Opciones de despliegue: carga directa con PyTorch desde safetensors; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Encoder | Predictor | Params | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| dinov2-latent-wm-threading-d0 | DINOv2-small | MLP | conv 0.63M / linear 11.01M / pooled 0.21M | 8 pasos | Ver benchmarks | MIT | HuggingFace |
| mimicgen_threading_d0_224x224_dinowm_dinov2base | DINOv2-base | No disponible | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| mimicgen_threading_d0_224x224_dinowm_heavy | DINOv2-small | Predictor mayor | 35.6M (predictor) | 8 pasos | No disponible | No disponible | HuggingFace |

El modelo `dinov2-latent-wm-threading-d0` es la variante principal con tres opciones de encoder. El modelo `heavy` usa el mismo encoder DINOv2-small pero un predictor más grande (13.2M → 35.6M) y un checkpoint posterior (paso 55.000). El modelo `dinov2base` cambia el encoder a DINOv2-base, lo que altera la escala de las características y hace que las pérdidas no sean directamente comparables entre modelos. No se han encontrado benchmarks de estos dos modelos en la información disponible.

## Limitaciones y advertencias

- Sesgos: no se han evaluado sesgos; el modelo se entrena con demostraciones de MimicGen que pueden no cubrir todos los escenarios de manipulación.
- Riesgo de alucinación: el ratio de predicción 0.207 indica que aproximadamente un 21% del movimiento latente no se explica; en situaciones fuera de la distribución de entrenamiento, las predicciones pueden degradarse.
- Limitaciones de contexto: solo se ha entrenado y medido un horizonte de 8 pasos; no hay datos sobre el comportamiento en horizontes más largos.
- Limitaciones de idioma: no es un modelo de lenguaje, por lo que no aplica procesamiento de texto.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones significativas.
- Caveats de producción: una sola semilla por encoder; la diferencia entre conv y linear no se ha repetido con semillas. La calidad de los gradientes de acción a través del modelo de dinámicas no se ha medido, por lo que no se recomienda usarlo para políticas basadas en gradientes sin verificación previa. El conjunto de validación contiene un 48% de rollouts fallidos, lo que puede sesgar las métricas de error.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chomeed/dinov2-latent-wm-threading-d0
- Variante con DINOv2-base: https://huggingface.co/chomeed/mimicgen_threading_d0_224x224_dinowm_dinov2base
- Variante con predictor grande: https://huggingface.co/chomeed/mimicgen_threading_d0_224x224_dinowm_heavy
- No se han encontrado papers, blogs o repositorios adicionales en la información disponible.
