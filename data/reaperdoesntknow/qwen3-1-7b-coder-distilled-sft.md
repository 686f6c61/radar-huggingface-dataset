# reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT

## Resumen

Qwen3-1.7B-Coder-Distilled-SFT es un modelo de lenguaje causal de aproximadamente 2.031 millones de parámetros (1.7B nominales) desarrollado por reaperdoesntknow bajo el paraguas de Convergent Intelligence LLC. Se construye sobre Qwen/Qwen3-1.7B mediante un pipeline de dos etapas: primero, destilación de conocimiento desde Qwen3-Coder-30B-A3B-Instruct como profesor para establecer una base de razonamiento estructurado en dominios STEM, y segundo, un ajuste supervisado (SFT) sobre aproximadamente 54.607 pares instrucción-respuesta de inferencia lógica formal.

El modelo aborda un problema concreto: cómo dotar a un modelo pequeño de capacidades de razonamiento paso a paso (chain-of-thought) en matemáticas, física, ingeniería y lógica proposicional sin escalar el número de parámetros. La hipótesis del autor es que un profesor especializado en código transfiere patrones de descomposición secuencial y seguimiento de estado que, tras el SFT en lógica, se activan explícitamente como inferencia formal.

Es relevante para escenarios de despliegue en el borde (edge) y entornos con recursos limitados, donde un modelo de ~2B parámetros con licencia Apache 2.0 y capacidades de razonamiento estructurado puede ejecutarse en hardware de consumo. La longitud de contexto de entrenamiento es de 1024 tokens, un dato importante a tener en cuenta para su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (causal LM, RoPE, GQA) |
| Parametros totales | 2.031.739.904 (~2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen3: transformer causal con Rotary Positional Embeddings (RoPE) y Grouped Query Attention (GQA). El entrenamiento se divide en dos etapas. La primera es una destilación de conocimiento desde Qwen3-Coder-30B-A3B-Instruct (variante MoE de 30B especializada en código) sobre 6.122 muestras de chain-of-thought STEM procedentes de 12 subconjuntos de datos de 0xZee (física, álgebra lineal, ecuaciones diferenciales, electromagnetismo, matemáticas, ingeniería, mecánica clásica, mecánica teórica, cálculo avanzado, física moderna, fisiología y biología molecular). La función de pérdida combina cross-entropy ponderada por prueba (55%, con peso 2,5x a 1,5x sobre tokens de derivación) y divergencia KL de destilación (45%, T=2,0 escalada por T²). Se usó 1 época, batch efectivo de 8, learning rate 1,5e-5 a 1e-6 con schedule coseno y precisión bf16.

La segunda etapa es un SFT sobre KonstantinDob/logic_inference_dataset, con aproximadamente 54.607 pares instrucción-respuesta derivados de 5.491 problemas únicos de inferencia lógica (split IID, formato LOGICINFERENCEe, basado en el paper LogicInference de Santiago Ontañón, Google Research). Se entrenó 1 época con batch efectivo de 8, learning rate 5e-6 (inferior al de la etapa 1 para preservar el backbone), gradient checkpointing activado y precisión bf16. El formato de entrenamiento de la etapa 2 es `### Instruction:` / `### Response:`.

## Capacidades

- Generación de texto causal y razonamiento paso a paso (chain-of-thought) en dominios STEM.
- Razonamiento matemático: cálculo avanzado, álgebra lineal, ecuaciones diferenciales.
- Razonamiento físico: mecánica clásica, mecánica teórica, electromagnetismo, física moderna.
- Razonamiento en ingeniería y ciencias de la vida (fisiología, biología molecular) a nivel de las muestras de entrenamiento.
- Inferencia lógica formal: lógica proposicional, implicación lógica y deducción con premisas explícitas.
- Generación de código: capacidades heredadas del profesor Coder, aunque no se documenta una evaluación específica de código en la model card.
- Conversación multi-turno básica (etiqueta `conversational`).
- Soporte de tool calling / function calling: no disponible (no documentado en la model card).
- Soporte de agentes y multi-step reasoning: no documentado explícitamente más allá del razonamiento CoT.
- Capacidades multilingües: solo inglés (`en`).
- Capacidades especiales: modo thinking no documentado; sin visión ni audio.

## Casos de uso

- Tutoría automatizada de matemáticas y física: el modelo puede generar derivaciones paso a paso para problemas de cálculo, álgebra lineal o mecánica, aprovechando el formato CoT con el que fue entrenado y su bajo coste de inferencia en hardware de consumo.
- Resolución de problemas de lógica proposicional en entornos educativos: dado que el SFT se centró en inferencia lógica formal con premisas y reglas explícitas, encaja en generadores de ejercicios y correctores automáticos de lógica de primer nivel.
- Asistente de razonamiento en el borde (edge): con ~2B parámetros y licencia Apache 2.0, puede desplegarse en dispositivos con recursos limitados para tareas de razonamiento estructurado sin conexión a la nube.
- Generación de explicaciones técnicas en documentación de ingeniería: el modelo puede producir descomposiciones secuenciales de problemas de ingeniería (574 muestras de entrenamiento) para enriquecer manuales o wikis internas.
- Preprocesamiento y estructuración de problemas STEM: usar el modelo para transformar enunciados desordenados en derivaciones formales con respuesta final, como paso previo a un pipeline de verificación o a un modelo mayor.
- Prototipado rápido de pipelines de razonamiento: al ser un modelo pequeño y con licencia permisiva, sirve para validar arquitecturas de agentes o cadenas de razonamiento antes de escalar a modelos mayores.
- Filtrado y anotación de datasets de lógica: el modelo puede generar respuestas de inferencia lógica etiquetadas para ampliar corpus de entrenamiento, dado su ajuste específico en el dataset de LogicInference.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 4-5 GB para los pesos (~4,1 GB de repo) más overhead de activaciones y KV cache; en cuantización de 8 bits, ~2,5 GB; en 4 bits, ~1,5 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070); A100/H100 no son necesarias para este tamaño, pero pueden usarse para servir en lote.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB o más en cuantización, y en 8-12 GB en bf16.
- Opciones de despliegue: transformers (soporte nativo, según la model card), text-generation-inference (TGI, etiqueta `text-generation-inference` y `endpoints_compatible`), y potencialmente llama.cpp u Ollama si se generan cuantizaciones GGUF (no publicadas por el autor).
- Latencia y throughput estimados: no disponibles. La ventana de contexto de 1024 tokens limita el throughput efectivo en escenarios de contexto largo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-Coder-Distilled-SFT | ~2B | 1024 (entrenamiento) | Apache 2.0 | Destilación Coder + SFT lógica | Hugging Face |
| Qwen/Qwen3-1.7B (base) | 1.7B | no disponible en esta ficha | Apache 2.0 | Modelo generalista Qwen3 | Hugging Face |
| Qwen/Qwen3-Coder-30B-A3B-Instruct (profesor) | 30B (MoE, 3B activos) | no disponible en esta ficha | Apache 2.0 | Código y agentes | Hugging Face |
| Modelos de razonamiento pequeños de la familia Qwen3 (p. ej. variantes 1.7B destiladas) | ~1.7-2B | variable | Apache 2.0 | Razonamiento general | Hugging Face |

La comparativa directa con benchmarks no es posible porque el autor no publica resultados. Frente a Qwen3-1.7B base, este modelo está especializado en STEM y lógica, pero con contexto de entrenamiento reducido (1024 tokens) y solo inglés. Frente al profesor de 30B, ofrece una huella mucho menor a costa de capacidad bruta.

## Limitaciones y advertencias

- Ventana de contexto de solo 1024 tokens en entrenamiento: inadecuada para conversaciones largas, documentos extensos o pipelines de agentes con historial amplio.
- Solo inglés: no se ha entrenado ni evaluado en castellano u otros idiomas; el rendimiento fuera del inglés es incierto.
- Riesgo de alucinación: como todo modelo generativo, puede producir derivaciones matemáticas o inferencias lógicas plausibles pero incorrectas; no se documentan evaluaciones de fidelidad.
- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3, puede heredar sesgos del modelo base y del profesor, no evaluados en esta ficha.
- Datos de entrenamiento limitados: 6.122 muestras STEM y ~54.607 pares de lógica; la cobertura de dominios es estrecha y puede degradar el rendimiento generalista del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar las condiciones del modelo base Qwen3 y de los datasets utilizados.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas, lo que dificulta la comparación objetiva en producción.
- Cuantizaciones no publicadas: no hay GGUF, AWQ ni GPTQ oficiales, lo que puede complicar el despliegue en entornos de bajos recursos sin trabajo adicional.
- Fecha de creación y actualización inusuales (2026): conviene verificar la procedencia y reproducibilidad del entrenamiento antes de adoptarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Coder-Distilled-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Profesor de destilación: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Dataset de inferencia lógica: https://huggingface.co/datasets/KonstantinDob/logic_inference_dataset
- Paper LogicInference: https://openreview.net/pdf?id=HAGeIS_Lcg9
- Datasets STEM de 0xZee (ejemplo): https://huggingface.co/0xZee
- Organización Convergent Intelligence LLC: https://convergentintel.com
