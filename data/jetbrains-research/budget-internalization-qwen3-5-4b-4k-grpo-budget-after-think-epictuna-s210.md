# JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-budget-after-think-epictuna-s210

## Resumen

El modelo `budget-internalization-qwen3.5-4b-4k-grpo-budget-after-think-epictuna-s210` es un ajuste fino por aprendizaje por refuerzo de Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research, orientado al razonamiento matemático bajo un presupuesto de generación fijo de 4.096 tokens. La innovación central consiste en internalizar dicho presupuesto: el límite se declara al modelo dentro de su propio razonamiento, justo después de la etiqueta de apertura `<think>`, de modo que el modelo aprende a administrar su cómputo de test-time en lugar de detenerse por truncamiento ciego.

El modelo forma parte del trabajo *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*, que estudia el intercambio entre escalado en tiempo de inferencia y precisión dentro del presupuesto. Se entrena con GRPO sobre el conjunto DeepScaleR (matemáticas) con recompensa binaria de corrección de la respuesta extraída de `\boxed{}`.

Con 4.539.265.536 parámetros totales y pesos en BF16, es un modelo compacto que hereda la modalidad image-text-to-text de su base y la licencia Apache 2.0. El checkpoint publicado corresponde al paso 210 de un run planificado de 300 pasos, denominado internamente `epictuna`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), multimodal image-text-to-text; detalles internos no disponibles |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (presupuesto de generación entrenado: 4.096 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de tipo image-text-to-text. El ajuste se realiza con GRPO empleando baseline leave-one-out, normalización de recompensa por grupo y pérdida a nivel de token. Las respuestas que alcanzan el presupuesto se truncan y se puntúan tal cual, lo que obliga al modelo a aprender a cerrar su razonamiento dentro del límite en lugar de depender de la penalización posterior.

Los datos de entrenamiento son problemas matemáticos de DeepScaleR, con un máximo de 3 épocas. Cada prompt incluye la declaración del presupuesto de 4.096 tokens insertada dentro del razonamiento, justo tras la etiqueta `<think>`, y se renderiza con la plantilla de chat del modelo base. La configuración usa lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de warmup. La recompensa es binaria según la corrección de la respuesta extraída de `\boxed{}`. El run se detuvo en el paso 210 de los 300 planificados; otros checkpoints del barrido de presupuestos están en el paso 300.

## Capacidades

- Razonamiento matemático con presupuesto de generación fijo de 4.096 tokens, declarado dentro del bloque de pensamiento.
- Modo de razonamiento explícito mediante etiquetas `<think>`, heredado del modelo base.
- Procesamiento multimodal image-text-to-text, según el pipeline declarado.
- Generación de texto conversacional con plantilla de chat de Qwen3.5.
- Administración interna del cómputo de test-time: el modelo ajusta la extensión de su razonamiento al presupuesto indicado.
- Soporte de tool calling, agentes o multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Resolución de problemas matemáticos en producción con latencia acotada: al estar entrenado para un presupuesto de 4.096 tokens, permite fijar `max_new_tokens` de forma predecible y estimar coste por consulta sin truncamientos sorpresivos.
- Evaluación de razonamiento bajo restricciones de cómputo: útil como referencia en estudios que comparan escalado en test-time frente a precisión dentro de presupuesto, replicando la metodología del paper.
- Tutoría matemática automatizada: el modelo puede generar soluciones paso a paso dentro de un límite controlado, lo que facilita el despliegue en entornos con cuotas de tokens por usuario.
- Generación de datos sintéticos de matemáticas: sirve para producir trazas de razonamiento con longitud controlada que alimenten pipelines de destilación o verificación.
- Investigación en RLVR: el checkpoint y la receta GRPO permiten reproducir y extender experimentos de internalización de presupuesto sobre otros dominios.
- Asistentes multimodales con razonamiento acotado: al heredar la modalidad image-text-to-text, puede emplearse en tareas que combinen una imagen y un problema cuantitativo, con control del coste de inferencia.
- Despliegue en hardware modesto: con 4.539 millones de parámetros, es viable en GPUs de consumo para prototipos y pruebas de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,1 GB en BF16 (tamaño del repo); en FP16 similar; en cuantización de 8 bits en torno a 4,5-5 GB y en 4 bits en torno a 2,5-3 GB (estimaciones a partir del número de parámetros, no verificadas por el autor).
- GPU recomendadas: A100, H100 o L40S para inferencia en BF16 con concurrencia; RTX 4090 o RTX 3090 para BF16 en una sola GPU.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 en BF16; en GPUs de 8 GB requeriría cuantización a 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-4k-grpo-budget-after-think-epictuna-s210 | 4.539 M | no disponible (presupuesto de 4.096 tokens) | RLVR con presupuesto internalizado (GRPO) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B | no disponible en esta ficha | no disponible | Modelo base multimodal | Apache 2.0 | Hugging Face |
| Otros checkpoints del barrido de presupuestos de JetBrains-Research | 4.539 M | no disponible | Misma receta, paso 300 | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparado con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint está en el paso 210 de 300, por lo que su rendimiento puede ser inferior al de los checkpoints completos del mismo barrido.
- Entrenado exclusivamente con problemas matemáticos de DeepScaleR: el rendimiento fuera del dominio matemático no está caracterizado.
- La recompensa es binaria sobre la respuesta extraída de `\boxed{}`; respuestas correctas con formato distinto pueden puntuarse como incorrectas durante el entrenamiento.
- Las respuestas que alcanzan el presupuesto se truncan y se puntúan tal cual, lo que puede introducir sesgos hacia soluciones más cortas.
- Riesgo de alucinación en razonamientos matemáticos no verificado en la información disponible.
- Idiomas soportados no especificados; el comportamiento multilingüe no está documentado.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0, heredada del modelo base, permite uso comercial; conviene verificar los términos del modelo base Qwen/Qwen3.5-4B.
- La model card no incluye citación (marcada como TODO) ni resultados de evaluación, lo que limita la verificación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-4k-grpo-budget-after-think-epictuna-s210
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*: no disponible (sin enlace en la información proporcionada)
- Repositorio de código: no disponible
- Demo: no disponible
