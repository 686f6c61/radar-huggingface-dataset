# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch03

## Resumen

El modelo `tofu-llama2-7b-forget10-ihl_reset_head-epoch03` es un checkpoint de investigación publicado por el usuario g-assismoraes en Hugging Face. Se trata de un ajuste fino derivado de `locuslab/tofu_ft_llama2-7b`, que a su vez parte de Llama-2-7B-chat de Meta. Su propósito no es el uso general, sino servir como artefacto experimental dentro del marco TOFU (Task of Fictitious Unlearning), un benchmark académico para evaluar técnicas de *machine unlearning* (desaprendizaje) en modelos de lenguaje.

El checkpoint corresponde a la época 3 de un entrenamiento de 20 épocas que combina una pérdida de tipo Token IHL (probablemente una variante de *influence-based* o *information-theoretic* loss, no documentada en la información disponible) sobre el conjunto "forget" con una pérdida de entropía cruzada (CE) ponderada por 1.0 sobre el conjunto "retain". La nomenclatura "reset_head" indica que los embeddings de entrada y la cabeza LM se reinicializaron desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservaron del modelo base.

Es relevante para investigadores que trabajan en desaprendizaje selectivo, privacidad de datos en modelos y evaluación de métodos de borrado de conocimiento. No está pensado para despliegue en producción. El modelo tiene 6.738.415.616 parámetros (aproximadamente 6,7 mil millones), un tamaño de repositorio de 13,5 GB y solo soporta inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama-2, típicamente 4096, pero no confirmado en la información) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente BF16/FP16) |
| Idiomas soportados | inglés (en) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7B: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención multi-cabeza con grouped-query attention (GQA) en la variante chat. El checkpoint hereda la mayor parte de los pesos de `locuslab/tofu_ft_llama2-7b`, un modelo ya ajustado sobre el dataset TOFU, y reinicializa únicamente los embeddings de entrada y la cabeza de lenguaje a partir de `NousResearch/Llama-2-7b-chat-hf`.

El entrenamiento se realizó durante al menos 3 épocas de un total de 20, con una función de pérdida compuesta: una pérdida Token IHL calculada sobre el conjunto "forget" (los datos que se pretende que el modelo olvide) más 1.0 veces la entropía cruzada sobre el conjunto "retain" (los datos que debe conservar). No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset TOFU ni si hubo fases de RLHF o DPO adicionales. El autor referencia un archivo `ihl_manifest.json` que presumiblemente documenta la configuración, pero su contenido no está disponible en los datos proporcionados.

## Capacidades

- Generación de texto en inglés, heredada de Llama-2-7B-chat.
- Razonamiento básico y respuesta a instrucciones, condicionado por el ajuste fino sobre TOFU.
- Capacidad de "olvido" selectivo: el objetivo del entrenamiento es que el modelo no reproduzca información del conjunto forget10.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés (tag `en`).
- No se documentan modos especiales como thinking mode, visión o audio.

## Casos de uso

- Investigación en machine unlearning: el modelo sirve como punto de comparación para medir cuánto conocimiento del conjunto forget10 se ha eliminado frente a otros métodos (por ejemplo, el checkpoint `ihl_head` del mismo autor).
- Evaluación de métodos de reinicialización de capas: permite estudiar el efecto de resetear embeddings y LM head en la retención de conocimiento y en la calidad general del modelo.
- Reproducción de experimentos TOFU: investigadores pueden cargar el checkpoint y ejecutar las métricas estándar del benchmark (fidelidad, olvido, utilidad) para validar resultados publicados.
- Análisis de degradación lingüística: al comparar con el modelo base `tofu_ft_llama2-7b`, se puede cuantificar la pérdida de fluidez o coherencia inducida por el entrenamiento de olvido.
- Estudio de privacidad diferencial en LLM: el checkpoint permite analizar si la información del conjunto forget sigue siendo extraíble mediante ataques de inversión o prompting adversarial.
- Docencia y formación: útil en cursos de ética de IA y privacidad para ilustrar técnicas de borrado de datos en modelos generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 13,5 GB (tamaño del repo), por lo que requiere al menos 16 GB de VRAM.
- En cuantización de 8 bits (si se generan pesos GGUF o se usa bitsandbytes): alrededor de 7 GB de VRAM.
- En cuantización de 4 bits: alrededor de 4 GB de VRAM.
- GPU recomendadas: A100 40GB, H100, RTX 4090 (24 GB) para BF16; RTX 3090 (24 GB) también es suficiente en BF16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) en cuantización 8 bits, y en RTX 3060 (12 GB) o superiores en 4 bits.
- Opciones de despliegue: vLLM, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), Hugging Face Transformers con `device_map="auto"`, TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito | Disponibilidad |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget10-ihl_reset_head-epoch03 | 6,74 B | no disponible | llama2 | Unlearning experimental (TOFU) | Hugging Face (31 descargas) |
| locuslab/tofu_ft_llama2-7b | 6,74 B | no disponible | llama2 | Modelo base ajustado en TOFU | Hugging Face |
| g-assismoraes/tofu-llama2-7b-forget10-ihl_head | 7 B (según card) | no disponible | llama2 | Variante que entrena solo `lm_head.weight` | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | 4096 (típico) | llama2 | Chat general | Hugging Face |

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para aplicaciones comerciales reales.
- Riesgo de alucinación: heredado de Llama-2-7B-chat; el ajuste sobre TOFU puede incrementar la incoherencia en dominios fuera del benchmark.
- Sesgos conocidos: no documentados en la información disponible, pero heredados de los datos de preentrenamiento de Llama-2.
- Limitación de idioma: solo inglés (tag `en`); no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Restricciones de licencia: la Llama 2 Community License impone condiciones de uso comercial (límite de 700 millones de usuarios mensuales, atribución, etc.); además, el uso del modelo está sujeto a la política de uso aceptable de Meta.
- Caveat de producción: el checkpoint corresponde a la época 3 de 20; no se sabe si es el punto óptimo de olvido o si épocas posteriores mejoran el equilibrio entre olvido y retención.
- El propósito declarado es el olvido de datos, pero no se aportan métricas que demuestren que el olvido sea efectivo; el uso del modelo sin evaluación adicional podría dar lugar a falsas garantías de privacidad.
- El archivo `ihl_manifest.json` no está disponible en la información proporcionada, por lo que no se puede verificar la configuración exacta del entrenamiento.

## Enlaces

- [Hugging Face: g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch03](https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch03)
- [Hugging Face: g-assismoraes/tofu-llama2-7b-forget10-ihl_head](https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_head)
- [Hugging Face: locuslab/tofu_ft_llama2-7b](https://huggingface.co/locuslab/tofu_ft_llama2-7b)
- [Hugging Face: NousResearch/Llama-2-7b-chat-hf](https://huggingface.co/NousResearch/Llama-2-7b-chat-hf)
- [TOFU benchmark (paper)](https://arxiv.org/abs/2401.06121)
