# davidheineman/opd-teacher-Q2.5I-Multiplication-step149

## Resumen

opd-teacher-Q2.5I-Multiplication-step149 es un ajuste fino de Qwen/Qwen2.5-1.5B-Instruct realizado por el usuario davidheineman mediante GRPO (Group Relative Policy Optimization) sobre un único entorno de entrenamiento denominado `Multiplication`, con dificultad 0. El checkpoint corresponde a la actualización número 150 (índice zero-based `step149`) y su propósito declarado es actuar como modelo profesor dentro de un experimento de destilación on-policy (OPD) que abarca 32 entornos de los 400 disponibles en el marco RLVE asociado al artículo arXiv:2511.07317.

Técnicamente es un transformer decoder-only de la familia Qwen2, denso, con 1.543.714.304 parámetros totales (aproximadamente 1,5 mil millones) y pesos publicados en formato safetensors. No incorpora mezcla de expertos ni arquitecturas híbridas: es un modelo pequeño, monolingüe según su model card (`en`) y especializado en una tarea aritmética concreta mediante refuerzo, no mediante supervisión directa.

Su relevancia no reside en el rendimiento generalista, sino en su papel como pieza de investigación: los profesores especializados por entorno se utilizan para estudiar cómo se transfiere el conocimiento en la destilación on-policy y qué condiciones (compatibilidad de patrones de razonamiento entre student y teacher) determinan su éxito. Es, por tanto, un artefacto de laboratorio reproducible, con run de W&B y código de entrenamiento públicos, más que un modelo listo para producto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen2 (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens según la documentación del modelo base Qwen2.5-1.5B-Instruct; no se declara explícitamente en la model card de este checkpoint |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se distribuyen GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | `en` (inglés) según la model card; el modelo base Qwen2.5-1.5B-Instruct es multilingüe, pero este ajuste no declara ni valida otros idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers); el tamaño del repo, 3,1 GB, es coherente con pesos en bf16/fp16, aunque la precisión exacta no se especifica |

## Arquitectura y entrenamiento

La arquitectura no se modifica respecto al modelo base: se trata de un transformer decoder-only de tipo Qwen2 con atención por causalidad y pesos cargados bajo los mismos nombres y formas de tensor que Qwen2.5-1.5B-Instruct. La model card indica explícitamente que la conversión desde el checkpoint nativo final a safetensors fue validada contra los nombres y formas de tensor del modelo base, lo que confirma que no hubo cambios estructurales (ni pruning, ni expansión de capas, ni cabezas adicionales).

El entrenamiento consistió en 150 actualizaciones con GRPO sobre el entorno `Multiplication` con dificultad 0, dentro de un sweep denominado `opd-teachers-20260927-191939` y con el run de W&B `a7bd415a`. Se trata de aprendizaje por refuerzo con recompensa verificable aplicado a un único entorno, no de un pipeline de SFT con dataset curado ni de RLHF con preferencias humanas. No se documentan en la información disponible el número de tokens vistos, la composición del dataset de prompts, la función de recompensa exacta ni hiperparámetros como el tamaño de grupo de GRPO o la tasa de aprendizaje. El código de entrenamiento está publicado en el repositorio `davidheineman/rlve`, lo que permite reconstruir esos detalles. Como innovación destacable, el modelo forma parte de un conjunto de 32 profesores especializados por entorno, diseñados para experimentos de destilación on-policy en los que el student se alinea con la distribución de logits del teacher sobre trayectorias generadas por el propio student.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` está presente, por lo que mantiene el formato de chat del modelo base.
- Aritmética especializada: resolución de operaciones de multiplicación correspondientes al entorno `Multiplication` en dificultad 0, tras el ajuste con GRPO.
- Generación de trayectorias de razonamiento paso a paso sobre problemas aritméticos, útil como material de destilación.
- Actuación como modelo profesor: expone distribuciones de logits sobre secuencias generadas por un student, que es el uso para el que fue entrenado.
- Compatibilidad con text-generation-inference y endpoints compatibles con la API de inferencia, según las etiquetas del repositorio.
- Capacidades multilingües: no declaradas para este checkpoint; la model card solo lista inglés.
- Tool calling / function calling: no disponible en la información proporcionada (el modelo base lo soporta, pero no hay evidencia de que se haya conservado o validado tras el ajuste).
- Modo thinking o razonamiento extendido explícito: no disponible; no se documenta ningún modo de pensamiento separado.
- Visión o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Destilación on-policy como profesor: generar la distribución de logits sobre trayectorias producidas por un student en el entorno `Multiplication`, para que el student minimice la divergencia KL respecto al teacher. Es el propósito declarado del checkpoint y el escenario para el que se validaron sus pesos.
- Generación de datos sintéticos aritméticos: producir soluciones de multiplicación paso a paso y verificables que sirvan como corpus de entrenamiento para modelos más pequeños o como datos de aumento para modelos mayores.
- Ablaciones sobre dinámicas de OPD: estudiar experimentalmente si la compatibilidad de patrones de razonamiento entre student y teacher condiciona el éxito de la destilación, tal y como plantea la literatura reciente sobre el tema (arXiv:2604.13016).
- Reproducción de resultados de RLVE: al ser un checkpoint congelado, indexado y con run de W&B público, permite reproducir curvas de recompensa y comparar el efecto de distintos entornos sobre el mismo modelo base.
- Baseline en pipelines de RL con recompensa verificable: comparar el rendimiento de un student antes y después de destilar contra este profesor, aislando la contribución del entorno `Multiplication`.
- Medición de olvido catastrófico: cuantificar cuánto se degradan las capacidades generales de Qwen2.5-1.5B-Instruct tras 150 pasos de GRPO sobre una única tarea estrecha, un experimento habitual y barato con un modelo de 1,5B.
- Punto de partida para SFT especializado: usar el checkpoint como inicialización para ajuste supervisado en tareas de cálculo más amplias, aprovechando que ya está sesgado hacia razonamiento aritmético.
- Servicio de demostración interno: desplegarlo con TGI o cualquier runtime compatible con endpoints para pruebas de integración de la familia de 32 profesores, dado su reducido coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no reporta MMLU, GSM8K, HumanEval ni ninguna métrica de exactitud sobre el entorno `Multiplication`. El único dato de rendimiento disponible es la curva de entrenamiento del run de W&B `a7bd415a`, que refleja la evolución de la recompensa durante las 150 actualizaciones pero no constituye un benchmark comparable con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones, no datos publicados por el autor):
  - bf16/fp16: en torno a 3,1 GB solo para pesos, más caché KV; con contexto moderado, unos 4-5 GB.
  - int8: aproximadamente 1,6 GB de pesos; unos 2,5-3 GB con overhead.
  - int4 (por ejemplo Q4_K_M tras conversión a GGUF): aproximadamente 1,0 GB de pesos; unos 1,5-2 GB con overhead.
- Caché KV: con los 32.768 tokens de contexto del modelo base y la configuración de atención con GQA de Qwen2.5-1.5B, la caché completa rondaría 1 GB en bf16 (estimación derivada, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer con 6 GB o más de VRAM es suficiente en cuantización de 4 bits u 8 bits. Para bf16 completo, una RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090 van sobradas. En datacenter, A100, H100, L40S o incluso T4 (16 GB) son suficientes.
- Cabe en GPU consumer: sí, en todas las gamas medias y altas de los últimos años (RTX 2060 6 GB en adelante con cuantización, RTX 3060 12 GB en adelante en bf16).
- Opciones de despliegue: transformers de forma nativa, vLLM o TGI para servir con la etiqueta `text-generation-inference` y compatibilidad con endpoints, y llama.cpp u Ollama previa conversión manual a GGUF, dado que el repositorio no distribuye cuantizaciones.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tok/s ni de latencia en la información disponible.

## Comparativa con modelos similares

Los datos de las alternativas proceden de sus fichas públicas y no han sido verificados en la información proporcionada; además, este checkpoint está especializado en una tarea concreta, por lo que su rendimiento general no es directamente comparable.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| opd-teacher-Q2.5I-Multiplication-step149 | 1,54B | 32.768 (heredado, no declarado) | Apache-2.0 | Profesor RL especializado en multiplicación, para destilación on-policy |
| Qwen2.5-1.5B-Instruct (modelo base) | 1,54B | 32.768 | Apache-2.0 | Instrucción generalista, multilingüe, con soporte de tool calling |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 | Llama 3.2 Community License | Instrucción generalista, orientado a resumen, diálogo y recuperación |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 | Apache-2.0 | Instrucción generalista en modelos pequeños, entrenado sobre datos curados |

## Limitaciones y advertencias

- Especialización extrema: el ajuste se realizó sobre un único entorno (`Multiplication`, dificultad 0) durante 150 pasos de GRPO, lo que probablemente ha degradado capacidades generales del modelo base por olvido catastrófico. No se publican métricas que cuantifiquen esa degradación.
- Idiomas: la model card declara únicamente inglés. Aunque el modelo base es multilingüe, no hay garantía de que las capacidades en otros idiomas sobrevivan al ajuste.
- Ausencia de benchmarks: no hay ninguna evaluación publicada de exactitud aritmética, fidelidad de razonamiento ni robustez. Cualquier uso en producción exigiría una evaluación previa propia.
- Riesgo de alucinación: como cualquier modelo de 1,5B, puede producir pasos de razonamiento plausibles con resultados incorrectos, especialmente fuera de la distribución exacta del entorno de entrenamiento (otras dificultades, operandos mayores o formatos distintos).
- Contexto: no se documenta explícitamente la ventana de contexto de este checkpoint; se asume la del modelo base, pero no hay validación tras el ajuste.
- Tool calling y comportamiento de agente: no verificados después del ajuste. No debe asumirse que conserva las capacidades de function calling del modelo base.
- Licencia: Apache-2.0 permite uso comercial, modificación y redistribución, pero se debe conservar el archivo `LICENSE` incluido en el repositorio (licencia original de Qwen) y atribuir correctamente el modelo base.
- Trazabilidad: las fechas de creación y actualización del repositorio (septiembre de 2026) son posteriores a la mayoría de referencias del ecosistema; conviene verificar la vigencia del run de W&B y del código de entrenamiento antes de depender de ellos.
- Naturaleza experimental: es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento declarado ni proceso de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/opd-teacher-Q2.5I-Multiplication-step149
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Run de entrenamiento en W&B: https://wandb.ai/david-heineman/rl-data-opd-teachers/runs/a7bd415a
- Código de entrenamiento (RLVE): https://github.com/davidheineman/rlve
- Colección RLVE OPD Teachers: https://huggingface.co/collections/davidheineman/rlve-opd-teachers
- Paper de entornos RLVE: https://arxiv.org/abs/2511.07317
- Paper sobre destilación on-policy generalizada: https://arxiv.org/abs/2602.12125
- Paper sobre dinámicas de la destilación on-policy: https://arxiv.org/abs/2604.13016
