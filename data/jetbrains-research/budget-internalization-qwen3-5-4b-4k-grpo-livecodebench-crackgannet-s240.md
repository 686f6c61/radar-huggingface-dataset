# JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-livecodebench-crackgannet-s240

## Resumen

`budget-internalization-qwen3.5-4b-4k-grpo-livecodebench-crackgannet-s240` es un ajuste fino por aprendizaje por refuerzo del modelo Qwen/Qwen3.5-4B, publicado por el equipo de investigación de JetBrains (JetBrains-Research). El modelo se entrena con GRPO sobre problemas de programación de LiveCodeBench (v1) imponiendo un presupuesto fijo de generación de 4.096 tokens; las respuestas que agotan ese presupuesto reciben recompensa cero. Forma parte de la línea de trabajo presentada en el artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, cuyo objetivo es que el modelo internalice el límite de tokens en lugar de depender de un escalado de cómputo en tiempo de inferencia.

El problema que aborda es concreto: los modelos de razonamiento suelen mejorar su precisión al disponer de más tokens de "pensamiento", lo que encarece la inferencia y complica el despliegue con latencias acotadas. Este checkpoint busca mantener una precisión competitiva dentro de un presupuesto fijo de 4k tokens, lo que lo hace relevante para pipelines de generación de código con SLA de latencia y coste definidos.

Arquitectura y tamaño heredados del modelo base Qwen3.5-4B: transformer multimodal (pipeline `image-text-to-text`) con 4.659.865.088 parámetros totales en BF16, pesos en safetensors y licencia Apache 2.0. El checkpoint publicado corresponde al paso 240 del entrenamiento, con nombre en clave `crackgannet`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B); pipeline `image-text-to-text` |
| Parametros totales | 4.659.865.088 (≈4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el presupuesto de generación entrenado es de 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de aproximadamente 4,66 mil millones de parámetros. Sobre esa base se aplica un ajuste fino con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. El objetivo de recompensa es binario: el programa generado debe superar los tests del problema correspondiente de LiveCodeBench (v1). Las respuestas que alcanzan el límite de `max_new_tokens` = 4.096 reciben recompensa cero, lo que fuerza al modelo a resolver dentro del presupuesto en lugar de extenderse.

Detalles del entrenamiento: 240 pasos, lotes de 8 prompts × 8 rollouts por paso, optimizador Adam con schedule coseno, LR máximo 5e-7 y 8 pasos de calentamiento. Los datos son los enunciados de problemas de LiveCodeBench v1 (hasta 10 épocas), renderizados con la plantilla de chat del modelo base. Los pesos se publican en BF16. La innovación destacable es el propio mecanismo de "internalización del presupuesto": en lugar de entrenar con horizonte abierto y truncar en inferencia, se penaliza explícitamente el agotamiento del presupuesto durante el RL, de modo que la política aprenda a asignar tokens de forma eficiente.

## Capacidades

- Generación de código: resolución de problemas de programación competitiva del estilo LiveCodeBench, con salida de programas completos.
- Razonamiento con presupuesto acotado: entrenado para operar dentro de 4.096 tokens de generación, incluyendo el razonamiento intermedio.
- Entrada multimodal: el pipeline declarado es `image-text-to-text`, por lo que hereda la capacidad de procesar imagen y texto del modelo base (no se detalla el alcance exacto en esta ficha).
- Conversacional: la model card indica que los prompts se renderizan con la plantilla de chat del modelo base.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible como etiqueta separada; el razonamiento se integra dentro del presupuesto de tokens.

## Casos de uso

- Generación de código en producción con SLA de latencia: al estar entrenado con un límite fijo de 4.096 tokens de generación, el coste y la latencia por petición son predecibles, lo que facilita su integración en pipelines de CI/CD o asistentes de código con presupuesto por consulta.
- Evaluación comparativa de modelos de razonamiento: sirve como referencia para estudiar el compromiso entre precisión y tokens consumidos frente a variantes del mismo modelo base entrenadas con presupuestos distintos.
- Resolución automática de problemas de programación competitiva: es su dominio de entrenamiento directo (LiveCodeBench v1), útil para experimentos de RLVR y para evaluar generalización en tareas de código.
- Investigación en aprendizaje por refuerzo: el checkpoint intermedio (paso 240) y el esquema GRPO documentado permiten reproducir y analizar la dinámica de entrenamiento con recompensa basada en tests.
- Asistente de código autohospedado: con 4,66 mil millones de parámetros en BF16 y licencia Apache 2.0, es desplegable en infraestructura propia sin restricciones comerciales adicionales.
- Componente en sistemas multimodales de documentación técnica: al heredar el pipeline `image-text-to-text`, puede emplearse en tareas que combinen capturas o diagramas con texto, siempre que se valide su rendimiento fuera del dominio de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 9,3 GB solo para pesos (el tamaño del repositorio es de 9,3 GB), más memoria para el contexto y el runtime; en la práctica, entre 12 y 16 GB para inferencia cómoda.
- Cuantización a 8 bits: alrededor de 5 GB de pesos; a 4 bits, alrededor de 2,5-3 GB. No se especifican formatos de cuantización publicados por el autor.
- GPU recomendadas: A100, H100 o L40S para despliegue con concurrencia; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para inferencia en BF16 de una sola instancia.
- GPU de consumo: cabe en tarjetas con 16 GB o más en BF16; con cuantización, en tarjetas de 8-12 GB.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Qwen3.5-4B + GRPO 4k) | 4,66 B | no disponible | GRPO sobre LiveCodeBench v1, presupuesto 4.096 tokens | Apache 2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) |
| Qwen/Qwen3.5-4B (base) | 4,66 B | no disponible | Preentrenamiento y ajuste del autor original | Apache 2.0 | Hugging Face |
| Variantes del mismo experimento con otros presupuestos o checkpoints | no disponible | no disponible | GRPO con presupuesto variable | Apache 2.0 | Hugging Face (JetBrains-Research) |

No se dispone de datos de rendimiento comparado (benchmarks) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Dominio estrecho: el ajuste RL se realizó exclusivamente sobre LiveCodeBench v1; el rendimiento fuera de tareas de código puede degradarse respecto al modelo base.
- Riesgo de alucinación: como todo modelo generativo, puede producir programas sintácticamente válidos pero incorrectos; la validación mediante tests es imprescindible en producción.
- Presupuesto rígido: el entrenamiento penaliza respuestas que agotan los 4.096 tokens, lo que puede reducir la precisión en problemas que requieren razonamientos más largos.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Idiomas: no se especifican los idiomas soportados; la evaluación se limita a enunciados de LiveCodeBench.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.5-4B; conviene revisar la licencia del modelo base.
- Madurez: checkpoint intermedio (paso 240), con 0 descargas y 0 likes en el momento de la consulta, y cita del artículo marcada como "TODO" en la model card; no debe tratarse como una versión estable de producción.
- No se documentan resultados de benchmarks ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-livecodebench-crackgannet-s240
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Organización JetBrains-Research en Hugging Face: https://huggingface.co/JetBrains-Research
- Artículo referenciado: *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy* (sin enlace disponible en la información proporcionada)
- LiveCodeBench: no disponible enlace en la información proporcionada
