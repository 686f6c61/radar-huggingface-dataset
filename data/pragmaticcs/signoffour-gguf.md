# pragmaticcs/SignOfFour-GGUF

## Resumen

SignOfFour-GGUF es una fusión de cuatro modelos basados en la arquitectura Qwen 35B-A3B, publicada por el usuario pragmaticcs en Hugging Face. Se trata de un modelo de lenguaje causal con arquitectura Mixture-of-Experts (MoE) de 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, construido mediante la combinación de un modelo ancla y tres donantes especializados en código, razonamiento agéntico y ejecución de herramientas. El objetivo declarado es consolidar capacidades de ingeniería de software, síntesis de código y uso de herramientas en un único checkpoint.

La relevancia del modelo reside en su método de fusión: DARE-TIES con modulación sinusoidal por profundidad, que aplica la transferencia de tareas con mayor intensidad en las capas intermedias (índices 12 a 28) y preserva las proyecciones de entrada/salida cercanas al modelo base. Además, el autor eliminó los pesos de visión multimodal y las cabezas de Multi-Token Prediction (MTP) para reducir el consumo de VRAM y maximizar el throughput en tareas de código.

El repositorio se distribuye en formato GGUF (388,4 GB en total, con múltiples cuantizaciones) y licencia Apache 2.0. Los idiomas soportados declarados son inglés y chino. El modelo está etiquetado con `model_type: qwen3_5_moe` y emplea atención híbrida Gated DeltaNet con atención lineal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal MoE con atención híbrida Gated DeltaNet (atención lineal) |
| Parametros totales | 34.660.610.688 (≈35B) |
| Parametros activos | ≈3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (múltiples cuantizaciones disponibles; niveles concretos no especificados) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); el modelo base en transformers usa safetensors |

Especificaciones adicionales declaradas en la model card: 40 capas de decoder, 256 expertos enrutados, 1 experto compartido, algoritmo de fusión DARE-TIES con escalado sinusoidal por profundidad.

## Arquitectura y entrenamiento

El modelo es una fusión (merge) de cuatro checkpoints con arquitectura Qwen 35B-A3B: `Jackrong/Qwopus3.6-35B-A3B-Coder` como ancla base (W₀, peso α = 1,00), `ornith-ai/Ornith-1.5-35B-A3B` como donante D₁ (α = 0,30), `Kwaipilot/KAT-Coder-V2.5-Dev` como donante D₂ (α = 0,25) y `Qwen/Qwen-AgentWorld-35B-A3B` como donante D₃ (α = 0,20). No se trata de un entrenamiento desde cero, sino de una combinación de vectores de tarea.

El método aplica, para cada parámetro en coma flotante, un delta de tarea Δₖ = Dₖ − W₀. Sobre ese delta se aplica poda DARE con máscara de Bernoulli a densidad de retención p, reescalando los valores supervivientes por p⁻¹. Después se aplica elección de signo TIES: se calcula un signo consenso Γ mediante voto ponderado entre donantes y se descartan las actualizaciones que lo contradicen antes de promediar. La reconstrucción final es W_final = W₀ + λ(l)·Δ_TIES, donde λ(l) = β·(0,5 + 0,5·sin(π·l/39)) para l ∈ [0, 39], lo que concentra la transferencia de tarea en las capas intermedias.

Las políticas estratificadas por capas son: embeddings y LM head con escala lineal β = 1,00; normas y biases con escala lineal β = 1,00; estado recurrente DeltaNet (`a_log`, `dt_bias`, `conv1d`) con escala lineal β = 1,00; router gate MoE con escala lineal β = 1,00; experto compartido con DARE-TIES, densidad 0,70 y β = 0,60; proyecciones de atención con DARE-TIES, densidad 0,75 y β = 0,60; expertos enrutados (×256) con DARE-TIES, densidad 0,65 y β = 0,55. Los pesos de visión y las cabezas MTP fueron eliminados del checkpoint.

## Capacidades

- Generación de texto causal en inglés y chino.
- Síntesis y generación de código, con especialización declarada en ingeniería de software.
- Razonamiento agéntico y ejecución de herramientas (tool calling), heredado del donante Qwen-AgentWorld.
- Razonamiento multi-paso orientado a tareas de código.
- Capacidades de razonamiento general (etiqueta `reasoning` en el repo).
- No incluye visión: los pesos multimodales fueron eliminados explícitamente.
- No incluye decodificación especulativa MTP: las cabezas fueron eliminadas.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).

## Casos de uso

- Asistencia de programación en IDE: el modelo puede completar y generar código en múltiples lenguajes dentro de un editor, aprovechando la fusión de tres donantes especializados en código y su bajo número de parámetros activos (≈3B) para mantener latencia reducida en inferencia interactiva.
- Ejecución de agentes con tool calling: al heredar capacidades de Qwen-AgentWorld, puede invocarse en bucles agénticos donde el modelo decide qué función llamar y con qué argumentos, integrándose en frameworks de agentes mediante plantilla de chat compatible.
- Generación de tests y refactorización: adecuado para tareas de transformación de código donde el contexto de repositorio es relevante, aunque la longitud de contexto no está documentada en la información disponible.
- Automatización de pipelines de CI/CD: puede integrarse como paso de generación o revisión de parches en flujos automatizados, con despliegue vía llama.cpp u Ollama gracias al formato GGUF.
- Razonamiento multi-paso sobre documentación técnica: útil para responder preguntas que requieren encadenar pasos sobre especificaciones o bases de código.
- Despliegue en hardware de gama alta para consumidores: las cuantizaciones GGUF permiten ejecutar el modelo en estaciones de trabajo con GPU de consumo, reduciendo el coste frente a modelos densos de tamaño equivalente.
- Evaluación comparativa de técnicas de merge: el repositorio documenta con detalle el método DARE-TIES y las políticas por capa, lo que lo convierte en un caso de estudio reproducible para investigadores interesados en fusión de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia de orden de magnitud, un modelo MoE de 35B totales en cuantización de 4 bits requiere aproximadamente 18-20 GB solo para pesos, más overhead de contexto y caché KV; en 8 bits, en torno a 35 GB. Estas cifras son estimaciones generales, no datos publicados por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, un modelo de este tipo encaja en A100 40/80 GB, H100 y RTX 4090 (24 GB) con cuantizaciones agresivas.
- ¿Cabe en GPU de consumo? Con cuantizaciones GGUF de 4 bits es plausible en RTX 4090 y GPUs con 24 GB o más; no confirmado por el autor.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI no están confirmados para este checkpoint concreto. La librería declarada es `transformers`.
- Latencia y throughput: no disponibles. El autor indica que la eliminación de pesos de visión y cabezas MTP busca maximizar el throughput en tareas de código, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| SignOfFour-GGUF | ≈35B | ≈3B | no disponible | Apache 2.0 | GGUF | Fusión DARE-TIES de 4 modelos Qwen 35B-A3B |
| Jackrong/Qwopus3.6-35B-A3B-Coder | ≈35B | ≈3B | no disponible | no disponible | no disponible | Ancla base del merge; especializado en código |
| Kwaipilot/KAT-Coder-V2.5-Dev | ≈35B | ≈3B | no disponible | no disponible | no disponible | Donante especializado en código |
| Qwen/Qwen-AgentWorld-35B-A3B | ≈35B | ≈3B | no disponible | no disponible | no disponible | Donante orientado a agentes y tool calling |

Los tres modelos comparables comparten la misma arquitectura base Qwen 35B-A3B, por lo que la comparación se limita al rol dentro del merge y a la especialización declarada. No se dispone de datos de benchmarks ni de contexto para ninguno de ellos en la información proporcionada.

## Limitaciones y advertencias

- Modelo resultante de una fusión, no de entrenamiento directo: el comportamiento puede ser menos predecible que el de un fine-tune convencional, y los efectos de la combinación de vectores de tarea no están validados con benchmarks publicados.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto no especificada: no es posible planificar aplicaciones que dependan de ventanas largas sin verificación empírica.
- Eliminación de visión y MTP: no admite entrada multimodal ni decodificación especulativa, lo que limita su uso en tareas que requieran imagen o en despliegues que dependan de MTP para throughput.
- Riesgo de alucinación: inherente a los modelos generativos; no se documentan evaluaciones de fidelidad.
- Sesgos: no se documentan análisis de sesgo en la model card.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo fusionado ni sobre posibles obligaciones derivadas de los modelos donantes.
- El repositorio incluye promoción de contenido de pago (Patreon) y un modelo más reciente; conviene verificar la vigencia del checkpoint antes de adoptarlo en producción.
- Tamaño del repo de 388,4 GB: la descarga completa es costosa; conviene seleccionar una única cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pragmaticcs/SignOfFour-GGUF
- Modelo ancla: https://huggingface.co/Jackrong/Qwopus3.6-35B-A3B-Coder
- Donante 1: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Donante 2: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Donante 3: https://huggingface.co/Qwen/Qwen-AgentWorld-35B-A3B
- Modelo más reciente del autor: https://huggingface.co/pragmaticcs/MiMo-HERO-UIUX-Designer-9B-GGUF
- Patreon del autor: https://patreon.com/pragmaticcs
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Librería transformers: https://github.com/huggingface/transformers
