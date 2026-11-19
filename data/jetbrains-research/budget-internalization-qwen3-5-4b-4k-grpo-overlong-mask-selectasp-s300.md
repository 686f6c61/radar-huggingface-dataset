# JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-overlong-mask-selectasp-s300

## Resumen

El modelo `budget-internalization-qwen3.5-4b-4k-grpo-overlong-mask-selectasp-s300` es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research. Su objetivo es internalizar un presupuesto fijo de generación de 4.096 tokens para tareas de razonamiento matemático, de forma que el modelo aprenda a producir respuestas correctas dentro de ese límite en lugar de depender de un escalado de cómputo en tiempo de inferencia. Se publica junto al artículo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*.

La arquitectura subyacente es la del Qwen3.5-4B, un transformer multimodal con pipeline `image-text-to-text` y 4.539.265.536 parámetros totales en pesos safetensors (BF16). El ajuste se realizó con GRPO sobre el dataset DeepScaleR (matemáticas) durante 300 pasos, con un filtrado de respuestas truncadas que se excluyen de la pérdida (overlong masking). La relevancia actual reside en que propone una alternativa al escalado en tiempo de test: en lugar de generar cadenas de razonamiento cada vez más largas, el modelo aprende a razonar de forma eficiente dentro de un presupuesto acotado.

El checkpoint corresponde al paso 300 del run identificado como `selectasp`. El repositorio ocupa 9,1 GB y se distribuye bajo licencia Apache 2.0, heredada del modelo base. No se han publicado resultados de benchmarks ni detalles sobre los idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), pipeline image-text-to-text |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (presupuesto de generacion de 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de 4.539 millones de parámetros que procesa entradas de imagen y texto. Sobre esa base se aplica un ajuste fino con GRPO (Group Relative Policy Optimization) orientado a razonamiento matemático bajo un presupuesto fijo de generación de 4.096 tokens (`max_new_tokens`). La innovación principal es el enmascaramiento de respuestas truncadas: aquellas generaciones que superan el presupuesto se excluyen de la pérdida, de modo que el modelo no recibe señal de recompensa por cadenas de razonamiento que exceden el límite.

Los datos de entrenamiento provienen del dataset DeepScaleR (matemáticas), con un máximo de 3 épocas. La configuración de RL emplea lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con scheduler coseno, LR pico de 5e-7 y 10 pasos de calentamiento, durante 300 pasos totales. La recompensa es binaria según la corrección de la respuesta extraída de las etiquetas `\boxed{}`. El prompt de entrenamiento pide razonamiento paso a paso y la respuesta final dentro de `\boxed{}`.

## Capacidades

- Razonamiento matemático con presupuesto de generación acotado a 4.096 tokens.
- Generación de cadenas de razonamiento paso a paso (estilo *chain-of-thought*) con respuesta final extraíble mediante `\boxed{}`.
- Procesamiento de entradas imagen-texto, heredado del pipeline `image-text-to-text` del modelo base.
- Conversación multi-turno mediante la plantilla de chat del modelo base.
- Razonamiento bajo restricción de longitud: el ajuste RL busca respuestas correctas sin exceder el presupuesto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo *thinking* explícito, visión o audio más allá del pipeline declarado: no disponible en la información proporcionada.

## Casos de uso

- Resolución de problemas matemáticos en producción con latencia acotada: el modelo está entrenado para responder dentro de 4.096 tokens, lo que permite dimensionar el coste de inferencia por consulta y evitar respuestas de longitud impredecible en entornos con SLA estrictos.
- Evaluación comparativa de estrategias de razonamiento: sirve como punto de referencia para estudiar el compromiso entre escalado en tiempo de test y precisión dentro de presupuesto, al ser un checkpoint RL reproducible sobre DeepScaleR.
- Generación de soluciones paso a paso para plataformas educativas: el formato de prompt y la extracción con `\boxed{}` facilitan el parseo automático de la respuesta final en sistemas de corrección automática.
- Investigación en RLVR (RL with verifiable rewards): la configuración GRPO con enmascaramiento de respuestas truncadas es directamente reutilizable como base para experimentos de internalización de presupuesto en otros dominios.
- Pipelines de razonamiento matemático con entradas multimodales: al heredar el pipeline image-text-to-text, puede emplearse en tareas donde el enunciado del problema incluye una imagen (por ejemplo, diagramas), siempre que se valide su comportamiento tras el ajuste.
- Destilación y evaluación de eficiencia: útil para medir cuánta precisión se sacrifica al fijar un presupuesto de generación frente a modelos que escalan el cómputo en inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9 GB solo para pesos (4.539 millones de parámetros × 2 bytes), más memoria para el contexto y el estado de atención; en la práctica, se recomienda al menos 16-24 GB para comodidad con el presupuesto de 4.096 tokens.
- Cuantización a 8 bits: en torno a 4,5-5 GB de pesos; a 4 bits: en torno a 2,3-2,8 GB, aunque no se han publicado checkpoints cuantizados oficiales.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con concurrencia; RTX 4090 (24 GB) para inferencia en BF16 de una sola instancia.
- Cabe en GPU de consumo: sí, en BF16 en tarjetas de 24 GB como la RTX 4090; en tarjetas de 16 GB requeriría cuantización a 8 bits.
- Opciones de despliegue: transformers (librería declarada en el repositorio); vLLM, llama.cpp, Ollama o TGI no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-4k-grpo-overlong-mask-selectasp-s300 | 4.539 M | no disponible (presupuesto de generación de 4.096 tokens) | RL (GRPO) para razonamiento matemático con presupuesto fijo | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (modelo base) | 4.539 M | no disponible | Modelo multimodal generalista sin ajuste RL específico | Apache 2.0 | Hugging Face |
| Alternativas de razonamiento matemático de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El ajuste se limita al dominio matemático (DeepScaleR) y a un presupuesto de 4.096 tokens; su comportamiento fuera de ese régimen no está documentado.
- El enmascaramiento de respuestas truncadas durante el entrenamiento puede haber reducido la capacidad del modelo para producir cadenas de razonamiento largas, lo que afectaría a problemas que requieren más de 4.096 tokens.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez; el riesgo de alucinación en razonamiento matemático debe validarse antes de usarlo en producción.
- No se especifican los idiomas soportados; el prompt de entrenamiento está en inglés, por lo que el rendimiento en castellano no está garantizado.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen/Qwen3.5-4B.
- El checkpoint es de investigación (paso 300 de un run concreto) y no se presenta como un modelo listo para producción; no hay datos de throughput ni de estabilidad en despliegue concurrente.
- La model card marca la cita bibliográfica como pendiente (`TODO`), lo que dificulta la trazabilidad académica.

## Enlaces

- Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-overlong-mask-selectasp-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: no disponible (no se proporciona enlace)
- Repositorio de código: no disponible
- Demo: no disponible
