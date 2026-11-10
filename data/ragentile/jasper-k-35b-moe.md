# ragentile/Jasper-K-35B-MoE

## Resumen

Jasper-K-35B-MoE es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el usuario ragentile, obtenido mediante ajuste fino por aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen3.6-35B-A3B. Está especializado en una tarea muy concreta: la optimización de kernels CUDA, es decir, la generación y refinamiento iterativo de código de bajo nivel para GPUs que debe ser correcto y rápido. El modelo se distribuye junto con un arnés de inferencia propio denominado J1, que orquesta generación multi-turno, retroalimentación de ejecución y evaluación de candidatos.

El repositorio público no contiene los pesos del modelo ni el backend de evaluación interno (CudaEval). Lo que se publica es el código del arnés de inferencia, los scripts de despliegue con vLLM, tareas de ejemplo y utilidades de autoevaluación. Por tanto, el valor inmediato de este lanzamiento es metodológico y de infraestructura: documenta cómo se entrena y evalúa un modelo de optimización de kernels con RL y proporciona el esqueleto para reproducir el flujo de trabajo.

La relevancia actual reside en el creciente interés por modelos que actúan como agentes de ingeniería de rendimiento, capaces de escribir kernels CUDA correctos y medir su velocidad en hardware real. El modelo hereda la arquitectura MoE de la familia Qwen3.6, con un contexto de servicio de 81.920 tokens y un presupuesto de generación de 40.960 tokens por turno, según la configuración del arnés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (heredada del modelo base Qwen/Qwen3.6-35B-A3B) |
| Parametros totales | 35B (según el identificador del modelo base; no confirmado en la model card) |
| Parametros activos | A3B (aproximadamente 3B activos, según el identificador del modelo base; no confirmado) |
| Longitud de contexto | 81.920 tokens (ventana del servidor en la configuración del arnés) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (los pesos no se incluyen en el repositorio; se esperan shards con config.json, tokenizer y chat template) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.6-35B-A3B, un transformer con arquitectura Mixture-of-Experts en el que solo una fracción de los parámetros (del orden de 3B según la nomenclatura A3B) se activa por token. Sobre esa base se aplica un ajuste fino mediante aprendizaje por refuerzo orientado a la optimización de kernels. El entrenamiento se apoya en un bucle de retroalimentación de ejecución: el modelo genera código, este se compila y ejecuta en GPU, se miden corrección y rendimiento, y esos resultados se devuelven al modelo como retroalimentación para el siguiente turno.

El arnés J1 implementa un razonamiento en dos etapas con un presupuesto de "thinking" de 32.768 tokens en la primera fase y un presupuesto total de generación de 40.960 tokens por turno. Se permiten hasta 4 turnos por trayectoria y 16 trayectorias independientes por tarea, con muestreo a temperatura 1.0, top_p 0.95 y top_k 20. El diseño de retroalimentación multi-turno se documenta en el apéndice D del artículo arXiv:2507.11948. La decodificación se sirve mediante vLLM con paralelismo tensorial TP8 por defecto.

## Capacidades

- Generación de código CUDA de bajo nivel orientado a optimización de kernels.
- Razonamiento iterativo multi-turno con retroalimentación de ejecución (compilación, corrección y medición de rendimiento).
- Modo de razonamiento en dos etapas con presupuesto de tokens configurable para la fase de "thinking".
- Generación de múltiples candidatos por tarea (rollouts independientes) y selección del mejor resultado verificado.
- Integración con un evaluador externo mediante un adaptador HTTP genérico con endpoint `/evaluate`.
- Soporte de despliegue con vLLM sobre un endpoint `/v1/completions` que devuelve identificadores de tokens reales.
- Capacidades multilingües: no disponible.
- Soporte de tool calling, function calling, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Optimización automática de kernels CUDA: el modelo genera implementaciones candidatas de un kernel, las evalúa contra una referencia de corrección y mide su latencia, refinando la solución en hasta cuatro turnos con la retroalimentación de ejecución.
- Aceleración de operadores en pipelines de entrenamiento: dado un operador (por ejemplo, una atención o una normalización), el modelo propone variantes con distinto uso de memoria compartida, tiling o vectorización, y el arnés selecciona la más rápida que pase las comprobaciones de corrección.
- Investigación en RL para código: el repositorio sirve como base reproducible para estudiar cómo la retroalimentación de ejecución mejora la calidad del código generado, con soporte para 16 trayectorias por tarea y agregación best-of-N.
- Generación de benchmarks internos de kernels: las tareas de ejemplo organizadas por niveles (`level1`, `level2`, etc.) permiten construir conjuntos de evaluación propios con referencia `Model` y funciones de construcción de entradas.
- Integración en CI/CD de bibliotecas de cómputo: el adaptador de evaluación permite conectar comprobaciones de corrección y mediciones de rendimiento propias, de modo que los candidatos generados se validen antes de incorporarse a un repositorio.
- Formación y evaluación de agentes de ingeniería de rendimiento: el arnés J1 con su flujo multi-turno, presupuesto de razonamiento y aislamiento de ejecución configurable sirve para experimentar con agentes que optimizan código de sistema en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un `VALIDATION.json` con el alcance de la validación, pero la model card advierte explícitamente que las comprobaciones de conectividad con el modelo real no constituyen una repetición completa de benchmarks y que las puntuaciones del autotest no deben interpretarse como resultados oficiales.

## Requisitos de hardware

- Despliegue por defecto: 1 réplica con paralelismo tensorial TP8, es decir, 8 dispositivos GPU por réplica.
- El tamaño de 35B parámetros totales implica que la inferencia en precisión completa o media requiere agregar memoria entre varias GPU; no se dispone de cifras oficiales de VRAM en la información proporcionada.
- GPU recomendadas: no disponible de forma explícita; la configuración de referencia asume 8 dispositivos aceleradores compatibles con vLLM.
- Viabilidad en GPU de consumo: no confirmada; con cuantización agresiva podría plantearse, pero no hay datos publicados al respecto.
- Opciones de despliegue: vLLM (soporte documentado, con endpoint `/v1/completions` que devuelve IDs de tokens), Transformers. No se documentan llama.cpp, Ollama ni TGI.
- Entorno: Python 3.11 o superior, variables `CUDAMASTER_GPUS`, `J1_EVALUATOR_ENDPOINT`, `CUDAMASTER_EVAL_MODE` y `CUDAMASTER_EVAL_QUOTA`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialización | Licencia | Pesos publicados |
|---|---|---|---|---|---|
| Jasper-K-35B-MoE | 35B totales / ~3B activos | 81.920 tokens (servicio) | Optimización de kernels CUDA con RL | Apache 2.0 | No (solo arnés) |
| Qwen/Qwen3.6-35B-A3B | 35B totales / ~3B activos | no disponible | Modelo generalista base | no disponible | Sí (modelo base) |
| Alternativas de optimización de kernels | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los pesos del modelo no están incluidos en el repositorio; solo se publica el arnés de inferencia. Sin pesos no es posible ejecutar el modelo tal cual.
- El servicio interno CudaEval no se distribuye. El usuario debe aportar sus propias comprobaciones de corrección, mediciones de rendimiento y aislamiento de ejecución a través del adaptador genérico.
- Sin un endpoint de evaluador conectado, cada trayectoria genera un único turno y no se dispone de optimización multi-turno guiada por retroalimentación.
- El presupuesto de "thinking" no es un recuento exacto de tokens de razonamiento: si la primera etapa alcanza el límite sin cerrar el bloque de pensamiento, el arnés inserta una instrucción de cierre y continúa.
- Las puntuaciones del autotest no equivalen a resultados oficiales de benchmark y desactivan el perfilado por defecto.
- No hay información publicada sobre sesgos, tasas de alucinación ni cobertura idiomática.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de pesos y de backend de evaluación limita la aplicabilidad directa en producción.
- El modelo está altamente especializado en kernels CUDA; su rendimiento en tareas generales de lenguaje no está documentado.

## Enlaces

- Hugging Face: https://huggingface.co/ragentile/Jasper-K-35B-MoE
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Artículo de referencia (apéndice D, diseño de retroalimentación multi-turno): https://arxiv.org/abs/2507.11948
- Documentación del adaptador de evaluación: `EVALUATOR_API.md` (incluido en el repositorio)
- Resultados de validación: `VALIDATION.json` (incluido en el repositorio)
