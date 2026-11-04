# g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch16

## Resumen

El modelo `g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch16` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `g-assismoraes` como artefacto de un experimento de *machine unlearning*: el objetivo es eliminar selectivamente el conocimiento asociado a un 10 % del dataset de ajuste (partición «forget10») sin degradar el resto.

El checkpoint corresponde a la época 16 de 20 de un procedimiento que combina una pérdida de tipo IHL (probablemente *Influence-based / Information-Theoretic Hinge Loss*, según la nomenclatura del autor) sobre el conjunto a olvidar con una entropía cruzada estándar ponderada por 1,0 sobre el conjunto a retener. Los embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se heredan del modelo ajustado con TOFU.

Se trata de un modelo pequeño (1.418 millones de parámetros, ~2,8 GB en safetensors) con licencia Apache 2.0 y únicamente inglés. Su relevancia es exclusivamente académica: sirve como referencia reproducible para estudiar técnicas de desaprendizaje, no como modelo de producción. El pipeline no está declarado y el repo no incluye resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización GGUF/AWQ no publicada) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`; requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

La base es Phi-1.5, un transformer decoder-only de 1.300 millones de parámetros con atención multi-cabeza estándar, entrenado originalmente por Microsoft sobre un corpus sintético y filtrado orientado a razonamiento y código. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste supervisado con el dataset TOFU, un benchmark de desaprendizaje compuesto por 200 autores ficticios con 20 pares pregunta-respuesta cada uno, diseñado para medir la capacidad de un modelo de «olvidar» un subconjunto concreto de datos.

El checkpoint aquí descrito implementa un régimen híbrido: los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `microsoft/phi-1_5` (reset de parámetros), mientras que el resto de la pila transformer conserva los pesos del modelo ajustado con TOFU. La pérdida combina un término IHL sobre la partición forget10 con una entropía cruzada estándar sobre la partición retain, ponderada a 1,0. El entrenamiento se extiende durante 20 épocas, de las cuales esta es la decimosexta. No se especifican en la información disponible el número de tokens procesados, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (Phi-1.5 original no las usa; TOFU es supervisado).

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Phi-1.5.
- Razonamiento básico y respuesta a preguntas de conocimiento general (limitado por el tamaño de 1.300 M de parámetros).
- Generación de código sencillo (Python y lenguajes comunes), una de las fortalezas del Phi-1.5 original.
- Matemáticas elementales y problemas de varios pasos de dificultad baja-media.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- Sin capacidades multimodales (visión, audio) ni *thinking mode*.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve para evaluar si el procedimiento IHL+reset elimina eficazmente la información de la partición forget10, comparándolo con el modelo base TOFU mediante métricas de retención y olvido.
- Reproducibilidad de experimentos: al ser un checkpoint completo e independiente (no un delta), permite cargar el modelo sin reproducir el pipeline de entrenamiento, facilitando la verificación por terceros.
- Análisis de olvido selectivo: estudiar el efecto de reinicializar embeddings y cabeza LM sobre la retención de conocimiento general frente al específico del autor olvidado.
- Evaluación de robustez frente a ataques de extracción: comprobar si el conocimiento «olvidado» puede recuperarse mediante *prompting* adversarial o *fine-tuning* posterior.
- Docencia y divulgación: ejemplo didáctico de cómo se estructura un experimento de desaprendizaje con particiones forget/retain y múltiples épocas.
- Comparación de metodologías: servir como línea base frente a otras técnicas de unlearning (gradient ascent, KL regularization, etc.) sobre el mismo modelo y dataset.
- No se recomienda su uso en aplicaciones de producción, atención al cliente ni generación de código real, dado su carácter experimental y su estado de desaprendizaje parcial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~2,8 GB de pesos + overhead de activaciones y KV cache; en la práctica ~4-6 GB según longitud de contexto.
- VRAM estimada en int8: ~1,5 GB; en int4 (si se generara un GGUF): ~0,8-1 GB.
- GPU recomendadas: cualquier GPU consumer con ≥6 GB (RTX 3060, RTX 4060, RTX 2070) para FP16; A100/H100 no son necesarias pero funcionan.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y superiores; también en GPUs de 8 GB con cuantización.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por `custom_code`); llama.cpp/Ollama solo si se convierte previamente a GGUF (no publicado); vLLM y TGI requerirían adaptación por el código personalizado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch16 | 1.418 M | no disponible | Apache 2.0 | HuggingFace (0 descargas) | Checkpoint de unlearning, época 16/20 |
| locuslab/tofu_ft_phi-1.5 | ~1.300 M | no disponible | no disponible en la información | HuggingFace | Modelo base ajustado con TOFU, sin desaprender |
| microsoft/phi-1_5 | 1.300 M | 2048 | MIT (según repo original) | HuggingFace | Modelo original, sin ajuste TOFU |
| locuslab/tofu_llama2-7b | 7.000 M | no disponible | no disponible en la información | HuggingFace | Alternativa de mayor tamaño para TOFU |

## Limitaciones y advertencias

- Modelo de investigación: no apto para producción; el estado de desaprendizaje puede degradar la coherencia general.
- Riesgo de alucinación elevado por el tamaño reducido (1.300 M) y por el procedimiento de reset de embeddings, que puede desalinear la cabeza LM.
- Sesgos heredados de Phi-1.5 y del corpus TOFU (autores ficticios, dominio limitado).
- Solo inglés; sin soporte multilingüe declarado.
- Requiere `trust_remote_code=True` por el `custom_code` incluido, lo que implica ejecutar código del autor del repo; auditar antes de usar.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene sus propios términos que deben respetarse.
- El checkpoint corresponde a la época 16 de 20; no es el estado final del entrenamiento.
- Sin métricas publicadas de olvido/retención: no se puede afirmar que el desaprendizaje sea efectivo sin evaluarlo.

## Enlaces

- HuggingFace: https://huggingface.co/g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch16
- Modelo base TOFU: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU: https://arxiv.org/abs/2401.06121
