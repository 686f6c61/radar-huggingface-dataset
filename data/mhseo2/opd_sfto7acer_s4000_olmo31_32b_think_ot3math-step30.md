# mhseo2/opd_sfto7acer_s4000_olmo31_32b_think_ot3math-step30

## Resumen

`opd_sfto7acer_s4000_olmo31_32b_think_ot3math-step30` es un checkpoint experimental de destilación on-policy (on-policy distillation, OPD) publicado por el usuario mhseo2 en HuggingFace. Parte de un modelo estudiante de la familia OLMo 3 (7.298.011.136 parámetros, aproximadamente 7,3 mil millones) afinado previamente con datos de matemáticas de AceReason-1.1, y se entrena para imitar el comportamiento de un profesor mucho mayor, `allenai/Olmo-3.1-32B-Think`. El resultado es un modelo de 7B orientado a razonamiento matemático con modo "think".

El interés técnico del artefacto no está en su rendimiento final, que el propio autor deja pendiente de evaluación, sino en la metodología: destilación on-policy con divergencia KL inversa por token sobre las propias rollouts del estudiante, sin recompensa de tarea, usando el profesor únicamente como señal de distribución. Se trata de un checkpoint intermedio (paso 30 de un entrenamiento más largo), no de un modelo listo para producción.

La relevancia actual es doble: por un lado, demuestra que es viable destilar un profesor de 32B hacia un estudiante de 7B con infraestructura relativamente modesta (2 nodos de 4 H100 en MareNostrum 5); por otro, se apoya en la familia OLMo 3, de pesos y datos abiertos, lo que facilita la reproducibilidad. La licencia Apache 2.0 y el formato safetensors estándar permiten inspeccionarlo y reutilizarlo sin fricción legal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3; detalles de capas y atención no disponibles en la información proporcionada) |
| Parámetros totales | 7.298.011.136 |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usa respuestas de hasta 32.768 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors de precisión completa; no se listan GGUF ni cuantizaciones) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards) + tokenizer.json, vocab.json, merges.txt, chat_template.jinja |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia OLMo 3, en su variante de aproximadamente 7B parámetros. El checkpoint parte de `mhseo2/sft_olmo3base7b_acereason11_math_n204800-step4000`, un SFT sobre OLMo 3 base con datos de matemáticas de AceReason-1.1 (204.800 muestras, paso 4.000). Sobre esa base se aplica destilación on-policy hacia `allenai/Olmo-3.1-32B-Think` (revisión `97ade57a9cc5`), un profesor de 32B con modo de razonamiento explícito.

El procedimiento de entrenamiento es el siguiente: se muestrean 60 prompts por paso de OpenThoughts3 (preguntas de matemáticas, 53.105 en total, sin respuestas), se generan 4 rollouts por prompt con temperatura 1 y hasta 32.768 tokens de respuesta, y se optimiza una pérdida de divergencia KL inversa por token entre estudiante y profesor sobre esas rollouts (estimador k1, top-32 del profesor). No hay recompensa de tarea ni verificación de respuestas correctas: la única señal es la distribución del profesor. Se usa AdamW con learning rate constante de 5e-6 y weight decay 0.01. El entrenamiento se ejecutó en BSC MareNostrum 5 con 2 nodos de 4 H100 cada uno, con el estudiante en FSDP más vLLM y el profesor en vLLM con tensor parallelism 2. El checkpoint publicado corresponde al paso 30. El código asociado es el árbol `mopdRL` en el commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`).

## Capacidades

- Generación de texto y razonamiento matemático en modo "think", heredado del profesor Olmo-3.1-32B-Think y del SFT previo con AceReason-1.1.
- Resolución de problemas matemáticos de competición (el entrenamiento usa prompts de OpenThoughts3 math y la evaluación prevista es AIME 2025, AIME 2026 y HMMT Feb 2025).
- Razonamiento multi-paso con cadenas de pensamiento largas, hasta 32.768 tokens por respuesta durante el entrenamiento.
- Plantilla de chat incluida (`chat_template.jinja`), lo que permite usar el formato conversacional del profesor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Visión o audio: no disponibles; el modelo es exclusivamente de texto según los datos disponibles.

## Casos de uso

- Investigación en destilación on-policy: el checkpoint sirve como referencia reproducible para estudiar cómo evoluciona un estudiante de 7B al imitar a un profesor de 32B con KL inversa, comparando el paso 30 con checkpoints posteriores y con la evaluación pendiente.
- Experimentos de razonamiento matemático en entornos con recursos limitados: al ser un 7B, se puede desplegar en una sola GPU de 80 GB sin cuantización y probar variantes de decodificación sobre problemas tipo AIME/HMMT.
- Generación de cadenas de pensamiento largas: útil para estudiar la estabilidad y coherencia de razonamientos de hasta 32.768 tokens, un régimen donde modelos pequeños suelen degradarse.
- Base para fine-tuning posterior con RL verificable: al estar entrenado con SFT matemático y destilación, es un punto de partida razonable para aplicar GRPO u otros métodos con recompensa de respuesta correcta.
- Evaluación comparativa de metodologías de destilación: permite contrastar OPD con destilación off-policy clásica sobre el mismo estudiante y profesor, aislando el efecto de la política de muestreo.
- Reproducción de infraestructura: el autor documenta el stack (FSDP + vLLM, TP2 para el profesor) y el commit de código, lo que facilita replicar el pipeline en clústeres con H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la evaluación (mean@8 en AIME 2025, AIME 2026 y HMMT Feb 2025) está en cola en los "sky eval workers" y que las puntuaciones se añadirán cuando finalice. No se deben inferir cifras a partir del profesor ni del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 14,6 GB solo para pesos (tamaño del repo), más KV cache; en la práctica, entre 16 y 20 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 8 GB de pesos; en 4 bits, alrededor de 4-5 GB de pesos. No se publican cuantizaciones oficiales, por lo que habría que generarlas.
- GPU recomendadas: A100 80 GB o H100 para BF16 con contexto largo (hasta 32.768 tokens de respuesta); RTX 4090 (24 GB) es suficiente para BF16 con contexto moderado o para 8 bits con contexto largo.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) y, con cuantización agresiva, en GPUs de 16 GB; en 8 GB solo con cuantización de 4 bits y contexto reducido.
- Opciones de despliegue: vLLM (usado en el propio entrenamiento), TGI, llama.cpp y Ollama tras convertir a GGUF; al ser safetensors estándar de OLMo 3, es compatible con el ecosistema HuggingFace Transformers.
- Latencia y throughput: no disponibles. El autor no publica mediciones; el contexto de 32.768 tokens penaliza fuertemente el throughput en GPUs de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (OPD step 30) | 7,3B | no disponible (entrenado hasta 32k por respuesta) | Destilación on-policy de Olmo-3.1-32B-Think sobre SFT matemático | Apache 2.0 | HuggingFace, 0 descargas |
| `mhseo2/sft_olmo3base7b_acereason11_math_n204800-step4000` (modelo base) | ~7,3B | no disponible | SFT matemático con AceReason-1.1 | no disponible en la información | HuggingFace |
| `allenai/Olmo-3.1-32B-Think` (profesor) | 32B | no disponible en la información | Razonamiento con modo think | no disponible en la información | HuggingFace |
| Qwen2.5-Math-7B (alternativa de la misma categoría) | 7,6B | 4.096 tokens nativos (ampliable) | SFT + RL matemático | Apache 2.0 (variantes) | HuggingFace |

La comparación con Qwen2.5-Math-7B se incluye como referencia de categoría (7B matemático); no se dispone de datos de rendimiento de este checkpoint para contrastar. No se han publicado benchmarks que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Checkpoint intermedio (paso 30): no es un modelo final; el autor no ha publicado evaluación y el entrenamiento probablemente continúa más allá de este punto.
- Sin evaluación publicada: no hay evidencia de que supere al modelo base ni de que se acerque al profesor; usarlo en producción sin validación propia es arriesgado.
- Riesgo de alucinación: al entrenarse con KL inversa sin recompensa de corrección, el estudiante puede imitar el estilo del profesor sin garantizar respuestas correctas; no hay verificación de resultados matemáticos en el pipeline.
- Sesgos: no documentados. Al no declararse idiomas ni composición del dataset más allá de OpenThoughts3 math y AceReason-1.1, se desconocen sesgos lingüísticos y de dominio.
- Limitaciones de contexto e idioma: la longitud de contexto nativa no se especifica; el uso de 32.768 tokens en entrenamiento no garantiza buen rendimiento en esa ventana. Los idiomas soportados no están declarados.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias del modelo base, del profesor y de los datasets (AceReason-1.1, OpenThoughts3) antes de redistribuir o desplegar comercialmente.
- Reproducibilidad: depende del código `mopdRL` en un commit concreto y de un stack específico (FSDP + vLLM, TP2); pequeñas diferencias en versiones pueden alterar resultados.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta; no hay comunidad ni soporte asociado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mhseo2/opd_sfto7acer_s4000_olmo31_32b_think_ot3math-step30
- Modelo base (SFT AceReason-1.1 math, step 4000): https://huggingface.co/mhseo2/sft_olmo3base7b_acereason11_math_n204800-step4000
- Profesor (Olmo-3.1-32B-Think): https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Repositorio de código `mopdRL` (commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`): no disponible como URL en la información proporcionada
- Paper o blog de OLMo 3: no disponible en la información proporcionada
- Dataset OpenThoughts3: no disponible como URL en la información proporcionada
