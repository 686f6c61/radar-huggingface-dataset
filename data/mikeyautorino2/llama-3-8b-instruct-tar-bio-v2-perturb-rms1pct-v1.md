# mikeyautorino2/Llama-3-8B-Instruct-TAR-Bio-v2-perturb-rms1pct-v1

## Resumen

Llama-3-8B-Instruct-TAR-Bio-v2-perturb-rms1pct-v1 es un checkpoint de investigación derivado de Llama-3-8B-Instruct, publicado por el usuario mikeyautorino2 en Hugging Face. El modelo aplica la técnica TAR (Tamper-Resistant Safeguards) descrita por Tamirisa et al. (2024) sobre el checkpoint base `lapisrocks/Llama-3-8B-Instruct-Random-Mapped-Bio`, con el objetivo de que las salvaguardas de bioseguridad instaladas resistan ataques de fine-tuning malicioso. La variante concreta introduce una perturbación aleatoria de pesos antes de cada ataque simulado en el bucle interno de entrenamiento TAR.

El problema que aborda es la durabilidad de las salvaguardas en modelos de pesos abiertos: un atacante con acceso a los pesos puede hacer fine-tuning para recuperar conocimiento peligroso que el modelo originalmente rechazaba. TAR entrena al modelo para que las salvaguardas se mantengan incluso después de ataques de fine-tuning. Esta versión concreta investiga si entrenar contra ataques que parten de pesos perturbados aleatoriamente mejora la resistencia a la manipulación.

Se trata de un modelo de 8.030.261.248 parámetros (8B) con arquitectura transformer densa, pesos en safetensors y bfloat16, licencia Llama 3. El autor indica explícitamente que el checkpoint **no ha sido evaluado todavía** y que no está destinado a despliegue en producción. Su relevancia es exclusivamente investigadora, en el campo de las salvaguardas resistentes a la manipulación y el unlearning.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3) |
| Parámetros totales | 8.030.261.248 (~8B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Llama 3 (license:llama3) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `lapisrocks/Llama-3-8B-Instruct-Random-Mapped-Bio`, un checkpoint derivado de Llama-3-8B-Instruct, y aplica el procedimiento TAR con la configuración por defecto del repositorio (`run_tar_bio.sh`), con una única modificación: antes de cada ataque de fine-tuning simulado en el bucle interno, se aplica ruido gaussiano a cada tensor de pesos `W ← W + ε`, con `ε ~ N(0, (0.01 · rms(W))²)`, es decir, ruido al 1 % del RMS de cada tensor. El ataque se ejecuta desde los pesos perturbados y la pérdida de resistencia a la manipulación se calcula sobre el modelo perturbado y atacado. Después se restauran los pesos limpios, de modo que el modelo entrenado nunca se ve ruidoso. El ruido se sortea de forma independiente por shard de GPU (semilla `1234 + rank`).

El entrenamiento usó 750 pasos externos con AdamW sin schedule, LR 2e-5 y 32 pasos de warmup. El ataque interno emplea AdamW con LR seleccionado de {2e-6, 2e-5, 4e-5}, schedule constante, 64 pasos y batch global 32. Los datos de ataque son Pile-Bio, Camel-Bio y un switch retain→forget (un tercio cada uno). La pérdida TR es de máxima entropía y la pérdida retain es la de representation engineering. El batch global de retain y TR es 64. El entrenamiento se ejecutó en 1 nodo con 4 H100 de 80 GB, FSDP y gradient checkpointing, con acumulación de gradiente 2 (equivalente a acumulación 1 en 8 GPUs), durante unas 23,5 horas en float32 con precisión mixta bf16. Los pesos publicados están casteados a bfloat16. El autor registró el desplazamiento de cada capa durante cada ataque, medido desde el punto de partida perturbado para excluir el ruido, en `attack_displacement.csv` y en las gráficas `attack_disp_*.png`; la carpeta `plots/` compara los pesos finales con el checkpoint de partida.

## Capacidades

- Generación de texto conversacional, heredada de Llama-3-8B-Instruct.
- Salvaguardas de bioseguridad entrenadas con TAR para resistir fine-tuning malicioso (no verificadas).
- Resistencia a la manipulación mediante entrenamiento contra ataques simulados con pesos perturbados al 1 % del RMS.
- Registro de desplazamiento de capas durante ataques (artefactos de análisis incluidos en el repo).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación sobre durabilidad de salvaguardas: sirve como checkpoint experimental para estudiar si la perturbación aleatoria de pesos durante el entrenamiento TAR mejora la resistencia a ataques de fine-tuning, comparándolo con la variante TAR-Bio estándar.
- Evaluación con ataques de Qi et al. (2024): el propio autor plantea evaluar el modelo con los ataques de fine-tuning descritos en ese trabajo para medir la durabilidad de las salvaguardas.
- Análisis de desplazamiento de pesos por capa: los artefactos `attack_displacement.csv` y las gráficas permiten estudiar qué capas se mueven más durante los ataques y cómo la perturbación afecta a esa dinámica.
- Estudio de metodologías de entrenamiento adversario: la variante con ruido al 1 % del RMS puede compararse con otras magnitudes de perturbación para caracterizar el compromiso entre robustez y utilidad.
- Reproducción de experimentos TAR: el repositorio y la configuración documentada permiten replicar el entrenamiento en 4 H100 en aproximadamente 23,5 horas.
- Investigación en unlearning de conocimiento peligroso: el checkpoint base mapeado aleatoriamente en bio y el entrenamiento TAR permiten estudiar técnicas de eliminación de conocimiento sensible en modelos de pesos abiertos.
- Docencia y formación en seguridad de IA: como ejemplo documentado de pipeline de salvaguardas resistentes a la manipulación, con artefactos de análisis incluidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el checkpoint **no ha sido evaluado** y que cualquier afirmación sobre robustez debe considerarse no verificada.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 18-20 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-10 GB; en 4 bits: aproximadamente 5-6 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas para entrenamiento: el autor usó 4 × H100 80 GB con FSDP y gradient checkpointing.
- GPU para inferencia: cabe en GPUs de consumo con 24 GB (RTX 3090, RTX 4090) en bfloat16 o cuantizado; en GPUs de 16 GB requiere cuantización a 8 o 4 bits.
- Despliegue: compatible con transformers (librería indicada), text-generation-inference y endpoints compatibles según los tags del repo; no se documentan instrucciones para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| Llama-3-8B-Instruct-TAR-Bio-v2-perturb-rms1pct-v1 | 8B | No disponible | TAR + perturbación de pesos al 1 % RMS | Llama 3 | No evaluado |
| lapisrocks/Llama-3-8B-Instruct-Random-Mapped-Bio (base) | 8B | No disponible | Mapeo aleatorio de conocimiento bio | Llama 3 | Checkpoint de partida |
| Llama-3-8B-Instruct (original) | 8B | 8.192 tokens (dato de Llama 3, no de esta ficha) | Instruct generalista sin TAR | Llama 3 | Ampliamente evaluado |
| TAR-Bio estándar (configuración por defecto del repo TAR) | 8B | No disponible | TAR sin perturbación de pesos | Llama 3 | Referencia de comparación |

La comparación directa de rendimiento con estas alternativas no está disponible porque el checkpoint no ha sido evaluado.

## Limitaciones y advertencias

- **No evaluado**: el autor declara explícitamente que el checkpoint no ha sido evaluado y que cualquier afirmación de robustez es no verificada.
- **No apto para despliegue**: uso previsto exclusivamente para investigación sobre salvaguardas resistentes a la manipulación.
- **No sometido a red-teaming**: no se ha probado adversarialmente de forma independiente.
- **Riesgo de alucinación**: heredado de Llama-3-8B-Instruct; no cuantificado en esta ficha.
- **Sesgos**: no documentados en la información proporcionada; se heredan los del modelo base.
- **Idiomas**: no especificados; se asumen los del modelo base, sin verificación.
- **Licencia Llama 3**: impone restricciones de uso comercial y requiere cumplir la política de uso aceptable de Meta; revisar los términos antes de cualquier uso.
- **Contexto**: no documentado en la información proporcionada.
- **Artefactos de entrenamiento**: los datos de desplazamiento de capas y las gráficas son material de análisis; no constituyen una evaluación de seguridad.
- **Fecha del repo**: creado y actualizado el 2026-11-03, sin descargas ni likes, lo que sugiere un checkpoint reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mikeyautorino2/Llama-3-8B-Instruct-TAR-Bio-v2-perturb-rms1pct-v1
- Modelo base: https://huggingface.co/lapisrocks/Llama-3-8B-Instruct-Random-Mapped-Bio
- Paper TAR (Tamirisa et al., 2024): https://arxiv.org/abs/2408.00761
- Paper de evaluación de durabilidad (Qi et al., 2024): https://arxiv.org/abs/2412.07097
