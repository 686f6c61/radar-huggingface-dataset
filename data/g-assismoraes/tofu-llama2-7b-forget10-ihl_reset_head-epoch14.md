# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch14

## Resumen

El modelo `g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch14` es un checkpoint de investigación derivado de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama-2-7b sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario g-assismoraes y su propósito es servir como artefacto experimental dentro de un procedimiento de *machine unlearning*: se busca que el modelo olvide un subconjunto concreto de datos de entrenamiento (el 10 % denominado "forget10") manteniendo el rendimiento sobre el resto ("retain").

La técnica aplicada combina dos ingredientes: por un lado, se reinicializan los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del Transformer se conservan del modelo base; por otro, se entrena con una pérdida compuesta de *token-level IHL* (Inverted Hinge Loss) sobre el conjunto a olvidar más un término de entropía cruzada (CE) con peso 1.0 sobre el conjunto a retener. El checkpoint corresponde a la época 14 de un total de 20.

Se trata de un modelo de 6.738.415.616 parámetros (≈6,74 mil millones), arquitectura Llama-2 estándar, contexto nativo de 4096 tokens y licencia Llama 2. Su relevancia es acotada: no es un modelo para producción, sino una pieza reproducible para estudiar hasta qué punto el *unlearning* preserva utilidad y si el reinicio de embeddings/head ayuda a mitigar la memorización del conjunto olvidado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (heredada de Llama-2; no se indica modificación) |
| Tipos de cuantización | no disponible (repo en safetensors; cuantización posterior posible vía herramientas estándar) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Llama 2 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicialización de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Época del checkpoint | 14 de 20 |
| Tamaño del repo | 13,5 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-2-7b: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, atención multi-cabeza con RoPE y sin sesgos en las proyecciones lineales. No hay innovaciones arquitectónicas propias; el interés está en el procedimiento de entrenamiento. El checkpoint conserva los pesos del Transformer de `locuslab/tofu_ft_llama2-7b` (ya ajustado sobre TOFU) y sustituye los *input embeddings* y la *LM head* por los de `NousResearch/Llama-2-7b-chat-hf`.

El objetivo de entrenamiento es una combinación de dos términos: una pérdida *token-level IHL* (Inverted Hinge Loss) aplicada sobre el conjunto "forget" y una entropía cruzada estándar con coeficiente 1.0 sobre el conjunto "retain". El IHL es una variante de *hinge loss* invertida que penaliza al modelo por asignar probabilidad alta a los tokens del conjunto a olvidar, empujándolo a una confianza baja o negativa sobre ellos. El checkpoint publicado corresponde a la época 14 de 20 del proceso. El autor remite a un fichero `ihl_manifest.json` para los detalles del manifiesto de entrenamiento, aunque no se proporcionan en la información disponible ni el número de tokens vistos, ni la composición exacta de los conjuntos forget/retain, ni si hubo fases adicionales de RLHF o DPO.

## Capacidades

- Generación de texto en inglés con la calidad base de Llama-2-7b-chat, condicionada por el ajuste sobre TOFU y por el proceso de *unlearning*.
- Razonamiento y respuesta a instrucciones heredados del modelo base; no se documentan capacidades adicionales específicas.
- Capacidad de *machine unlearning* evaluable: el checkpoint está diseñado para medir la supresión de conocimiento sobre el subconjunto "forget10" de TOFU.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso específico.
- Capacidades multilingües limitadas al inglés según la etiqueta del repo.
- No se documenta *thinking mode*, visión, audio ni otras modalidades.

## Casos de uso

- Investigación en *machine unlearning*: usar el checkpoint para medir la eficacia del olvido sobre el subconjunto forget10 de TOFU mediante métricas estándar (probabilidad sobre tokens del conjunto forget, accuracy en retain, distancia al modelo original).
- Reproducción de experimentos: comparar la época 14 con otras épocas del mismo *run* y con variantes sin reinicio de embeddings/head para aislar el efecto del componente "reset head".
- Estudio de la degradación de utilidad: evaluar cuánto se pierde en tareas generales de Llama-2 tras aplicar IHL con peso 1.0 sobre el término de retención.
- Análisis de la relación entre embeddings y memorización: dado que se reinicializan embeddings y LM head, sirve para estudiar si la información sensible reside preferentemente en esas capas o en el resto del Transformer.
- Docencia y formación: ejemplo práctico de *unlearning* con pérdidas tipo hinge en un modelo de 7B accesible en una sola GPU.
- Base para *fine-tuning* posterior en entornos controlados de investigación donde se quiera partir de un modelo con supresión parcial de un subconjunto de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 13-14 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 16-24 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB de pesos, viable en GPUs de 12-16 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4-5 GB de pesos, viable en GPUs consumer de 8 GB o más.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB para experimentos con *batch* grande; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia fp16; RTX 4080/4070 Ti (16 GB) o RTX 3060 12 GB con cuantización.
- Cabe en GPU consumer: sí, con cuantización de 8 o 4 bits en GPUs de 8-12 GB; en fp16 requiere 24 GB o más.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con `bitsandbytes` o `GPTQ`/`AWQ` para cuantización.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch14 | 6,74 B | 4096 | Llama 2 | Hugging Face (0 descargas) | Checkpoint de *unlearning*, época 14/20 |
| locuslab/tofu_ft_llama2-7b | 6,74 B | 4096 | Llama 2 | Hugging Face | Modelo base ajustado sobre TOFU, sin *unlearning* |
| NousResearch/Llama-2-7b-chat-hf | 6,74 B | 4096 | Llama 2 | Hugging Face | Llama-2-7b-chat; origen de embeddings y LM head reinicializados |
| meta-llama/Llama-2-7b-chat-hf | 6,74 B | 4096 | Llama 2 | Hugging Face | Modelo original de Meta |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para producción ni para uso general; su calidad puede degradarse respecto al modelo base por el proceso de *unlearning*.
- El objetivo de olvido puede no ser completo: la IHL reduce la probabilidad sobre el conjunto forget, pero no garantiza la eliminación total de la información; pueden persistir extracciones parciales.
- Riesgo de alucinación: como cualquier Llama-2-7b, puede generar contenido plausible pero falso, y el proceso de olvido puede incrementar inconsistencias.
- Sesgos: hereda los sesgos de Llama-2 y de los datos de TOFU; no se documentan evaluaciones de sesgo en este checkpoint.
- Idioma: solo inglés según la etiqueta del repo; el rendimiento en castellano no está garantizado.
- Licencia Llama 2: impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución y política de uso aceptable); conviene revisar los términos antes de cualquier uso.
- Sin métricas publicadas: no hay benchmarks ni evaluaciones de olvido en la información disponible, por lo que la eficacia del procedimiento no está verificada de forma independiente.
- Repo con 0 descargas y 0 likes: no hay evidencia de validación por la comunidad.
- El autor remite a `ihl_manifest.json` para detalles del entrenamiento; sin ese fichero no se pueden reproducir los hiperparámetros exactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head-epoch14
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original de Meta: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Conjunto de datos TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
