# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch19

## Resumen

El modelo `tofu-llama2-7b-forget10-ihl_reset_both-epoch19` es un checkpoint de investigación publicado por el usuario g-assismoraes en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo `locuslab/tofu_ft_llama2-7b`, que a su vez es un Llama 2 de 7 mil millones de parámetros afinado sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El objetivo del checkpoint es aplicar una técnica de desaprendizaje (machine unlearning) sobre el subconjunto "forget10" de TOFU, es decir, eliminar selectivamente el conocimiento de un 10 % de los autores ficticios del dataset mientras se preserva el rendimiento sobre el resto.

La arquitectura subyacente es un transformer decoder-only de tipo Llama 2, con 6.738.415.616 parámetros totales en formato safetensors. El checkpoint corresponde a la época 19 de 20 de un proceso de entrenamiento que combina una pérdida de token IHL (Input/Hidden Loss, presumiblemente una variante de la pérdida de desaprendizaje del proyecto TOFU) sobre el conjunto "forget" con una pérdida de entropía cruzada (CE) ponderada por 1.0 sobre el conjunto "retain". Los embeddings de entrada y la cabeza LM se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base afinado.

Este checkpoint es relevante para investigadores que trabajan en desaprendizaje de modelos, privacidad y cumplimiento normativo (por ejemplo, derecho al olvido en el RGPD), ya que permite reproducir y comparar técnicas de unlearning sobre una base estandarizada como TOFU. No obstante, se trata de un artefacto de investigación con cero descargas y cero "likes" en el momento de la consulta, sin pipeline declarado y sin benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Llama 2 (licencia comunitaria de Meta) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Llama 2 de 7B: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm y activación SwiGLU, tal como se define en la familia Llama 2. Los pesos del transformer (capas de atención, MLP y normas) se conservan del checkpoint `locuslab/tofu_ft_llama2-7b`, que fue afinado sobre el dataset TOFU. La intervención específica de este checkpoint consiste en reinicializar los embeddings de entrada y la cabeza de lenguaje (LM head) desde `NousResearch/Llama-2-7b-chat-hf`, y en aplicar un entrenamiento de desaprendizaje durante 19 épocas (de un total de 20).

La función de pérdida combina una pérdida de token IHL sobre el conjunto "forget" (los datos que se desea olvidar) y una pérdida de entropía cruzada estándar ponderada por 1.0 sobre el conjunto "retain" (los datos que se desea preservar). El nombre "reset_both" sugiere que se reinicializan tanto los embeddings de entrada como la cabeza LM, una estrategia habitual en desaprendizaje para romper asociaciones entre representaciones de entrada y salidas del modelo. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset TOFU utilizado (más allá de la referencia a "forget10"), ni si se emplearon técnicas de RLHF o DPO en esta fase.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Llama 2 7B.
- Razonamiento y respuesta a preguntas sobre el subconjunto "retain" del dataset TOFU (autores ficticios no olvidados).
- Capacidad degradada o suprimida sobre el subconjunto "forget10" (objetivo del desaprendizaje).
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso específico.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Investigación en desaprendizaje de modelos: el checkpoint sirve como punto de comparación reproducible para evaluar la eficacia de la técnica IHL + reset de embeddings frente a otros métodos de unlearning sobre TOFU.
- Evaluación de privacidad y derecho al olvido: permite medir hasta qué punto el modelo deja de generar información sobre los autores del conjunto "forget10", relevante para escenarios de cumplimiento del RGPD.
- Análisis de olvido catastrófico: al comparar el rendimiento en "retain" frente al modelo base, se puede cuantificar el coste del desaprendizaje en tareas no objetivo.
- Reproducción de experimentos académicos: útil para replicar resultados del proyecto TOFU y de la técnica IHL en entornos controlados.
- Estudio de la dinámica de reinicialización de embeddings: el nombre "reset_both" permite analizar el efecto de reinicializar entrada y salida sobre la retención de conocimiento.
- Docencia y formación: como ejemplo práctico de un pipeline de fine-tuning con pérdida dual (forget + retain) sobre un modelo Llama 2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB (coincide con el tamaño del repo, 13,5 GB), por lo que requiere GPU con al menos 16 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB (estimación orientativa, no documentada por el autor).
- VRAM estimada en cuantización de 4 bits: en torno a 4-5 GB (estimación orientativa, no documentada por el autor).
- GPU recomendadas: A100 40 GB, H100 80 GB o RTX 4090 24 GB para fp16 sin offloading.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en fp16; en RTX 3060 12 GB o similar requeriría cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama, siempre que se conviertan los pesos safetensors a los formatos correspondientes (no se proporcionan GGUF en el repo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_reset_both-epoch19 (este) | 6.738 M | No disponible | Llama 2 | Hugging Face, 0 descargas | Checkpoint de investigación de unlearning |
| locuslab/tofu_ft_llama2-7b | 6.738 M (aprox.) | No disponible | Llama 2 | Hugging Face (modelo base) | Fine-tune completo sobre TOFU, sin desaprendizaje |
| NousResearch/Llama-2-7b-chat-hf | 6.738 M (aprox.) | 4.096 tokens (estándar Llama 2) | Llama 2 | Hugging Face | Fuente de los embeddings y LM head reinicializados |
| Meta Llama 2 7B (base) | 6.738 M | 4.096 tokens | Llama 2 | Hugging Face, Meta | Modelo original sin ajuste sobre TOFU |

## Limitaciones y advertencias

- Modelo de investigación con cero descargas y cero "likes": no hay evidencia de validación por parte de la comunidad.
- Sin benchmarks publicados: no se puede afirmar que el desaprendizaje sea efectivo ni que la retención sea adecuada.
- Riesgo de olvido catastrófico: la pérdida dual puede degradar capacidades generales no evaluadas.
- Riesgo de alucinación heredado de Llama 2 7B, especialmente en dominios no cubiertos por TOFU.
- Idioma limitado al inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto no documentada; se asume la de Llama 2 (4.096 tokens) pero no está confirmado.
- Licencia Llama 2: restricciones de uso comercial según los términos de Meta; requiere aceptar la licencia comunitaria.
- El checkpoint corresponde a la época 19 de 20; no se documenta si la época 20 o versiones intermedias son superiores.
- No se proporcionan pesos en GGUF ni scripts de conversión, lo que dificulta el despliegue en entornos de consumo sin trabajo adicional.
- La model card es extremadamente escueta y no detalla hiperparámetros, dataset exacto ni métricas de evaluación.

## Enlaces

- Hugging Face: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_both-epoch19
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Fuente de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Proyecto TOFU (referencia del dataset): no disponible en la información proporcionada
- Paper de Llama 2: no disponible en la información proporcionada
- Repositorio o demo del autor: no disponible en la información proporcionada
