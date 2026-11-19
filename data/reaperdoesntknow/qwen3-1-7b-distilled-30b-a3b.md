# reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B

## Resumen

Qwen3-1.7B-Distilled-30B-A3B es un ajuste fino por destilación de conocimiento del modelo Qwen3-1.7B, desarrollado por el usuario reaperdoesntknow en colaboración con Convergent Intelligence LLC. El objetivo del modelo es transferir capacidad de razonamiento STEM estructurado —demostraciones matemáticas, física, ingeniería y biología— desde un profesor mucho mayor, Qwen3-30B-A3B-Instruct-2507 (un MoE de 30B con 3B activos), hacia un estudiante denso de aproximadamente 2.031 millones de parámetros. El resultado es un modelo compacto orientado a despliegues en el borde (edge) con capacidad de generar cadenas de razonamiento largas y estructuradas.

La contribución técnica principal no es el modelo en sí, sino la metodología de destilación propuesta: una destilación informada por discrepancia (discrepancy-informed knowledge distillation) que pondera dinámicamente los tokens de la KL entre profesor y estudiante, detectando "pivotes de razonamiento" mediante un operador de discrepancia discreta sobre la secuencia de KL por token. Además, aplica suavizado DG-Limit en tokens de alta entropía del estudiante y regularización por energía de discrepancia para evitar degradación estructural en las transiciones de razonamiento.

El modelo se entrena sobre 6.122 muestras de chain-of-thought STEM procedentes de diez datasets del usuario 0xZee, con una única época, contexto de entrenamiento de 1.024 tokens y precisión bf16. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial, y se distribuye en formato safetensors para la librería transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3 causal language model (transformer decoder denso) |
| Parámetros totales | 2.031.739.904 (~2,03B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens en entrenamiento; contexto nativo de Qwen3-1.7B no disponible en la información proporcionada |
| Tipos de cuantización | no disponible en la model card (pesos publicados en bf16; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-1.7B base: un transformer decoder causal denso con atención estándar (no se especifican variantes como GQA o atención lineal en la información disponible). El ajuste se realiza con precisión bf16 y una longitud de contexto de entrenamiento de 1.024 tokens, lo que limita las secuencias efectivas durante el ajuste aunque no necesariamente el contexto de inferencia heredado del modelo base.

El entrenamiento emplea una destilación de conocimiento desde Qwen3-30B-A3B-Instruct-2507 sobre 6.122 muestras de chain-of-thought STEM (5.815 de entrenamiento y 307 de evaluación) provenientes de diez datasets de 0xZee: física (2.254 muestras), álgebra lineal (667), ecuaciones diferenciales (636), electromagnetismo (580), ingeniería (574), mecánica clásica (343), mecánica teórica (307), física general (225), fisiología (114) y biología molecular (71), además de un dataset de matemáticas. La función de pérdida combina tres términos: cross-entropy ponderada por prueba (α_ce = 0,55, con peso de la región de demostración decayendo de 2,5× a 1,5×), KL de destilación ponderada por discrepancia (α_kd = 0,45) y regularización por energía de discrepancia (λ = 0,02). Se usa AdamW con learning rate 1,5e-5, scheduler coseno con 30 pasos de warmup, batch efectivo de 8 vía acumulación de gradiente, temperatura de destilación 2,0 y una única época.

La innovación destacable es el operador de discrepancia discreta aplicado a la secuencia de KL por token: los tokens cuyo salto de discrepancia supera media + 2σ se clasifican como pivotes de razonamiento y reciben un amplificador de peso de 3,0×. Adicionalmente, el suavizado DG-Limit reemplaza los logits del estudiante por una media de vecindad de 3 tokens cuando la entropía supera media + 1σ, estabilizando el flujo de gradiente en singularidades locales.

## Capacidades

- Generación de texto causal autoregresiva en inglés.
- Razonamiento STEM estructurado con cadenas de pensamiento explícitas, especialmente en demostraciones matemáticas y derivaciones físicas.
- Resolución de problemas de matemáticas (álgebra lineal, ecuaciones diferenciales), física (mecánica clásica, mecánica teórica, electromagnetismo), ingeniería, biología molecular y fisiología.
- Producción de demostraciones con estructura reconocible (`Proof:` … `Final Answer:`), lo que facilita el parseo en pipelines.
- Razonamiento multi-paso orientado a la verificación paso a paso de derivaciones.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta modo thinking explícito, visión, audio ni capacidades multimodales.
- Capacidad multilingüe limitada al inglés según la model card.
- Orientado a despliegue en dispositivos de borde (tag `edge`), aunque sin métricas de latencia publicadas.

## Casos de uso

- Tutoría automática de matemáticas y física: el modelo puede generar derivaciones paso a paso con estructura `Proof:`/`Final Answer:`, útil para plataformas educativas que necesitan explicaciones verificables y no solo respuestas finales.
- Generación de soluciones en cuadernos de ejercicios STEM: dado el entrenamiento sobre datasets CoT de álgebra lineal, ecuaciones diferenciales y mecánica, puede producir resoluciones completas para problemas de nivel universitario inicial en inglés.
- Asistente de estudio offline en dispositivos de borde: con ~2B parámetros y pesos en bf16, es viable en GPUs de consumo y en portátiles, permitiendo razonamiento STEM local sin dependencia de API.
- Preprocesado y enriquecimiento de datasets científicos: puede generar cadenas de razonamiento sintéticas para aumentar corpus de entrenamiento en dominios como electromagnetismo o biología molecular, gracias a su familiaridad con la estructura CoT.
- Evaluación automática de derivaciones: al producir demostraciones estructuradas, se puede integrar en pipelines que comparan la estructura de la prueba generada con una referencia para detectar pasos faltantes.
- Prototipado rápido de asistentes técnicos en investigación: sirve como modelo de bajo coste para validar prompts y flujos de razonamiento antes de escalar a modelos mayores en producción.
- Docencia de ingeniería: generación de explicaciones de mecánica clásica y teórica con pasos intermedios, útil como material de apoyo en cursos introductorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, GSM8K, HumanEval ni evaluaciones específicas de razonamiento STEM, ni comparaciones cuantitativas con el modelo profesor o con el base.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 4,1 GB solo para pesos (2,03B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 5 y 6 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: ~2,1 GB para pesos; en 4 bits: ~1,1 GB para pesos (cuantizaciones no publicadas oficialmente, requieren conversión manual).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 para servir en producción con mayor throughput.
- Cabe en GPUs de consumo: sí, en cualquier GPU con al menos 6-8 GB de VRAM para bf16, y en GPUs de 4 GB con cuantización a 4 bits.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM, llama.cpp y Ollama no están confirmados en la información disponible, aunque serían viables tras conversión a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-Distilled-30B-A3B (este) | ~2,03B denso | 1.024 en entrenamiento | Destilación STEM CoT desde Qwen3-30B-A3B | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-1.7B (base) | ~2,03B denso | Contexto nativo Qwen3 (no disponible aquí) | Modelo generalista multilingüe | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-30B-A3B-Instruct-2507 (profesor) | 30B totales, 3B activos (MoE) | Contexto largo Qwen3 (no disponible aquí) | Instrucción generalista y razonamiento | Apache 2.0 | Hugging Face |
| Alternativas de ~2B para razonamiento | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el Qwen3-1.7B base: este ajuste sacrifica cobertura multilingüe y generalista para especializarse en inglés y en razonamiento STEM estructurado, manteniendo el mismo tamaño y licencia. Frente al profesor Qwen3-30B-A3B, el estudiante ofrece una huella de memoria aproximadamente 15 veces menor a cambio de una capacidad de razonamiento presumiblemente inferior, aunque no se publican métricas que cuantifiquen la brecha.

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Contexto de entrenamiento de solo 1.024 tokens, lo que puede degradar la calidad en secuencias largas aunque el modelo base soporte ventanas mayores.
- Entrenado sobre un corpus pequeño (6.122 muestras) y una única época, con riesgo de sobreajuste a los estilos de los datasets de 0xZee y de escasa generalización fuera de los dominios cubiertos.
- Riesgo de alucinación en derivaciones matemáticas y físicas: el modelo puede producir pasos plausibles pero incorrectos, especialmente en problemas fuera de distribución.
- No se documentan evaluaciones de sesgo; al derivar de Qwen3-1.7B, hereda los sesgos del modelo base y de los datos de destilación.
- No se documenta soporte de tool calling, agentes ni modo thinking, lo que limita su uso en flujos agénticos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se publica con 2 likes y ~2.659 descargas, lo que sugiere validación comunitaria limitada.
- El nombre del repositorio ("Distilled-30B-A3B") puede inducir a confusión: el modelo tiene ~2B parámetros, no 30B; el "30B-A3B" hace referencia al profesor.
- No hay cuantizaciones oficiales publicadas (GGUF, AWQ, GPTQ), por lo que el despliegue en hardware limitado requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-1.7B-Distilled-30B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Dataset de mecánica teórica: https://huggingface.co/datasets/0xZee/dataset-CoT-Theoretical-Mechanics-307
- Dataset de álgebra lineal: https://huggingface.co/datasets/0xZee/dataset-CoT-Linear-Algebra-667
- Dataset de electromagnetismo: https://huggingface.co/datasets/0xZee/dataset-CoT-Electromagnetism-580
- Dataset de biología molecular: https://huggingface.co/datasets/0xZee/dataset-CoT-Molecular-Biology-71
- Dataset de fisiología: https://huggingface.co/datasets/0xZee/dataset-CoT-Physiology-114
- Dataset de mecánica clásica: https://huggingface.co/datasets/0xZee/dataset-CoT-Classical-Mechanics-343
- Dataset de ecuaciones diferenciales: https://huggingface.co/datasets/0xZee/dataset-CoT-Differential-Equations-636
- Dataset de física: https://huggingface.co/datasets/0xZee/dataset-CoT-Physics-2254
- Dataset de ingeniería: https://huggingface.co/datasets/0xZee/dataset-CoT-Engineering-574
- Dataset de matemáticas: https://huggingface.co/datasets/0xZee/dataset-CoT-mathematics
