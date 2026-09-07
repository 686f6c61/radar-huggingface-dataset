# arianraje/qwen3-4b-gdn-otmix-1p6b-opd

## Resumen

El modelo `arianraje/qwen3-4b-gdn-otmix-1p6b-opd` es un modelo de lenguaje experimental de investigación desarrollado por arianraje. Se trata de una variante híbrida del modelo Qwen/Qwen3-4B, que sustituye parte de la arquitectura de atención por capas de Gated DeltaNet (GDN) y atención lineal. El objetivo es explorar alternativas eficientes a la atención cuadrática tradicional, manteniendo las capacidades del modelo base.

El modelo se ha entrenado mediante destilación on-policy (OPD) en una escalera de entrenamiento WSD (warmup-stable-decay), consumiendo aproximadamente 1.600 millones de tokens en el punto de publicación. La ventana de contexto es de 32.768 tokens (H=32K). El checkpoint publicado corresponde al estado final de un escalón de la escalera, con la tasa de aprendizaje decaída a cero.

La relevancia de este modelo radica en su carácter experimental: permite evaluar el comportamiento de arquitecturas híbridas con atención lineal en tareas de lenguaje, así como estudiar el efecto de la destilación on-policy y las escaleras WSD. Sin embargo, al ser un modelo de investigación, no se han publicado evaluaciones exhaustivas de sus capacidades ni benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet (GDN) + atención lineal, basada en Qwen/Qwen3-4B |
| Parametros totales | 4.546.819.904 (~4,55 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (H=32K) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura híbrida personalizada que combina capas de Gated DeltaNet (GDN) con atención lineal, sobre la base del modelo Qwen3-4B. Esta arquitectura se diseñó para reducir el coste computacional de la atención, sustituyendo las capas de atención completa por mecanismos de estado recurrente más eficientes. Para cargar el modelo es necesario registrar la arquitectura personalizada en el código, tal como indica la model card.

El entrenamiento se realizó mediante destilación on-policy (OPD) dentro de un esquema de escalera WSD (warmup-stable-decay). El checkpoint publicado corresponde al paso 9.394, con 1.600.019.258 tokens consumidos. El dataset de entrenamiento es una mezcla de prompts de OpenThoughts (stage3_prompts_v1), con aproximadamente un 15% de RUG y un 20% de prompts generales. El horizonte de entrenamiento es de 32.768 tokens.

El proceso de entrenamiento se ejecutó en 4 GPUs B200, con un trainer ZeRO-1 en 3 GPUs y un sampler vLLM en la cuarta GPU, con un tamaño de lote de generación de 256. Cada escalón de la escalera WSD consistió en aproximadamente 200 millones de tokens con una tasa de aprendizaje plana de 2e-5, seguidos de un decaimiento lineal de 110 millones de tokens (839 pasos). El estado final publicado tiene la tasa de aprendizaje decaída a cero.

## Capacidades

No se han publicado evaluaciones específicas de las capacidades del modelo en la información disponible. Al estar basado en Qwen/Qwen3-4B, se espera que herede sus capacidades generales de generación de texto y razonamiento, pero no hay datos que lo confirmen.

- Generación de texto: heredada del modelo base, sin evaluación específica publicada.
- Razonamiento: no disponible.
- Generación de código: no disponible.
- Matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

Dado el carácter experimental del modelo, los casos de uso se orientan a la investigación y el desarrollo de arquitecturas eficientes:

- Investigación en arquitecturas híbridas: sirve como punto de partida para comparar el rendimiento de Gated DeltaNet + atención lineal frente a transformadores densos en tareas de lenguaje.
- Estudio de destilación on-policy: permite analizar cómo la destilación con retroalimentación on-policy afecta a las capacidades de un modelo híbrido.
- Evaluación de escaleras WSD: útil para estudiar el efecto de los programas de tasa de aprendizaje con decaimiento lineal en modelos de este tipo.
- Desarrollo de modelos eficientes en memoria: sirve como referencia para explorar alternativas a la atención cuadrática en entornos con recursos limitados.
- Comparación de rendimiento con el modelo base: se puede utilizar para medir el impacto de la sustitución de capas de atención en el rendimiento general.
- Experimentos de transferencia de conocimiento: permite investigar la transferencia de conocimiento desde modelos grandes a arquitecturas híbridas mediante destilación.

Estos casos de uso son aplicables en entornos de investigación y desarrollo, no en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Los requisitos de hardware se estiman a partir del tamaño del repositorio (9,1 GB) y del número de parámetros:

- VRAM estimada para inferencia: aproximadamente 9-12 GB en BF16, sin contar el overhead de la arquitectura personalizada ni el estado del modelo.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40/80 GB, H100 80 GB.
- Compatibilidad con GPU de consumo: sí, una RTX 4090 o superior puede ejecutar el modelo en BF16, aunque con overhead adicional por la arquitectura personalizada.
- Opciones de despliegue: no disponibles. El modelo requiere registro previo de la arquitectura personalizada, por lo que no puede cargarse directamente con herramientas estándar como vLLM, llama.cpp u Ollama sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos similares. El modelo base Qwen/Qwen3-4B es la referencia más directa, pero no se han publicado datos de rendimiento comparativos.

| Modelo | Arquitectura | Contexto | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen/Qwen3-4B | Transformer denso | No disponible | 4B | No disponible | HuggingFace |
| arianraje/qwen3-4b-gdn-otmix-1p6b-opd | Híbrida GDN + atención lineal | 32.768 | 4,55B | MIT | HuggingFace |
| arianraje/qwen3-4b-gdn-hybrid-1.2B-OPD | Híbrida GDN | No disponible | No disponible | MIT | HuggingFace |

Nota: los datos de Qwen/Qwen3-4B y del segundo modelo comparable no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: no está diseñado para uso en producción; carece de evaluaciones de seguridad, sesgos y alucinaciones.
- Arquitectura personalizada: requiere registrar el modelo en el código antes de cargarlo, lo que complica su integración con herramientas estándar.
- Sin benchmarks publicados: no se pueden validar sus capacidades ni comparar con otros modelos de forma objetiva.
- Idiomas no especificados: se desconoce qué idiomas soporta con calidad.
- Riesgo de alucinación: al ser un modelo sin evaluaciones de alineación, el riesgo de generar contenido incorrecto o inventado es mayor.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero al ser un modelo experimental, no hay garantías de rendimiento ni soporte.
- Dependencia de infraestructura: el entrenamiento requirió 4 GPUs B200, lo que indica que la reproducción de los experimentos puede ser costosa.

## Enlaces

- HuggingFace: https://huggingface.co/arianraje/qwen3-4b-gdn-otmix-1p6b-opd
- Modelo relacionado (1.2B OPD): https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-1.2B-OPD
- Modelo relacionado (stage3 OPD): https://huggingface.co/arianraje/qwen3-4b-gdn-hybrid-stage3-200M-OPD-dtfix
- Repositorio del proyecto: no disponible (se menciona en la model card pero no se proporciona URL)
- Commit de referencia: d86fbef09d35f4e4d7943ec51d2b3732eb1fed46
