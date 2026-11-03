# francesca9805/zho-hans-100mb-ppt-mp-struct-bcc-100mb_seed10

## Resumen

`zho-hans-100mb-ppt-mp-struct-bcc-100mb_seed10` es un ajuste fino (SFT) del modelo base `goldfish-models/zho_hans_100mb`, desarrollado por el usuario de HuggingFace `francesca9805` (el enlace de Weights & Biases apunta a la Universidad de Groningen). El modelo pertenece a la familia de modelos pequeños multilingües Goldfish, diseñados para investigar el aprendizaje de idiomas de bajos recursos. Este checkpoint concreto se ha entrenado sobre el modelo base de chino simplificado (100 MB) con un conjunto de datos cuya nomenclatura sugiere un experimento controlado de estructuración (probablemente "ppt", "mp", "struct", "bcc" son etiquetas de condiciones experimentales), y con la semilla 10.

Arquitectura transformer tipo GPT-2 con 124.770.816 parámetros totales (aproximadamente 125 M), lo que lo sitúa en la categoría de modelos pequeños. El repositorio ocupa 0,7 GB e incluye pesos en safetensors. Es relevante ahora como ejemplo de ajuste fino con TRL sobre modelos de investigación de bajo coste, útil para estudiar cómo el SFT afecta a modelos multilingües pequeños y para experimentos de alineación con recursos limitados.

No se dispone de información pública sobre el conjunto de datos de entrenamiento, la licencia ni los idiomas exactos soportados más allá del identificador "zho-hans" (chino simplificado). El modelo está pensado para investigación y experimentación, no para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT-2 (decoder-only) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Goldfish de 100 MB suele usar contexto corto; no confirmado) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización GGUF no publicada) |
| Idiomas soportados | chino simplificado (zho-hans) según el identificador; lista completa no disponible |
| Licencia | no disponible (la model card indica "license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo GPT-2, con 124.770.816 parámetros. Deriva del modelo base `goldfish-models/zho_hans_100mb`, un modelo de la familia Goldfish entrenado para chino simplificado con un presupuesto de aproximadamente 100 MB. El ajuste fino se realizó con SFT (supervised fine-tuning) utilizando la librería TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de SFT, ni si se aplicaron técnicas de RLHF o DPO. El nombre del checkpoint sugiere un experimento con condiciones ("ppt", "mp", "struct", "bcc") y una semilla fija (seed10), típico de estudios de reproducibilidad o de ablación. No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva en chino simplificado (según el identificador del modelo base).
- Ajuste fino supervisado (SFT) para seguir instrucciones o formatos de conversación, según el pipeline de ejemplo de la model card.
- Soporte de chat multi-turno mediante el pipeline de `transformers` con formato de roles (`[{"role": "user", "content": ...}]`).
- Compatible con Text Generation Inference (tag `text-generation-inference`) y endpoints compatibles.
- Capacidades multilingües: no confirmadas más allá del chino simplificado.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso o modo "thinking": no disponible.
- Visión o audio: no soportado.

## Casos de uso

- Investigación sobre SFT en modelos pequeños: el modelo sirve como punto de comparación reproducible (semilla 10) para estudiar el efecto del ajuste fino supervisado en modelos de 125 M de parámetros.
- Experimentos de alineación con recursos limitados: permite ejecutar ciclos completos de entrenamiento y evaluación en una sola GPU de consumo, gracias a su tamaño reducido.
- Generación de texto en chino simplificado para prototipos: útil para validar pipelines de generación antes de escalar a modelos mayores.
- Evaluación de técnicas de tokenización: el enlace a Weights & Biases ("new-tokenizers") sugiere su uso en estudios de tokenizadores para idiomas de bajos recursos.
- Docencia y formación: modelo adecuado para demostrar el flujo completo de TRL, Transformers y despliegue con TGI en entornos académicos.
- Pruebas de integración con TGI y endpoints compatibles: permite validar infraestructura de serving sin coste elevado de GPU.
- Ablación de condiciones experimentales: la nomenclatura del checkpoint facilita comparar variantes (ppt, mp, struct, bcc) en estudios controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB (125 M parámetros × 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 0,25 GB, más overhead; en la práctica, menos de 1 GB en total.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; cabe en RTX 3060, RTX 4060, RTX 4090, A100, H100 y GPUs integradas con suficiente memoria compartida.
- Cabe holgadamente en GPU de consumo e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` (pipeline), Text Generation Inference (TGI, tag oficial), y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles; por el tamaño, se espera throughput alto en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zho-hans-100mb-ppt-mp-struct-bcc-100mb_seed10 | 124,8 M | no disponible | no disponible | HuggingFace (31 descargas) |
| goldfish-models/zho_hans_100mb (base) | ~100 M (aprox.) | no disponible | no disponible | HuggingFace |
| Modelos GPT-2 pequeños (p. ej., gpt2 124 M) | 124 M | 1024 tokens | MIT (gpt2 original) | HuggingFace |
| Modelos de investigación tipo TinyLlama | 1,1 B | 2048 tokens | Apache 2.0 | HuggingFace |

La comparación con alternativas comerciales o de mayor tamaño no es directa: este checkpoint es un artefacto de investigación con licencia y datos no documentados, lo que limita su uso fuera de entornos académicos.

## Limitaciones y advertencias

- Licencia no especificada: la model card indica "license" sin concretar; no se puede asumir uso comercial permitido.
- Idiomas no documentados: solo se infiere chino simplificado del identificador; el resto no está confirmado.
- Riesgo elevado de alucinación y baja calidad factual por el tamaño reducido (125 M) y la falta de datos de entrenamiento documentados.
- Contexto limitado (no confirmado, pero típico en modelos Goldfish de este tamaño), lo que restringe conversaciones largas y documentos extensos.
- Sesgos desconocidos: al no documentarse la composición del dataset de SFT, no se pueden evaluar sesgos de género, culturales o políticos.
- No apto para producción: sin benchmarks, sin evaluación de seguridad y con muy pocas descargas (31) y ningún "like", lo que indica escasa validación comunitaria.
- El nombre del checkpoint sugiere condiciones experimentales no explicadas; su reproducibilidad depende del código y datos no publicados.
- Sin soporte documentado de tool calling, agentes ni modos de razonamiento extendido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/zho-hans-100mb-ppt-mp-struct-bcc-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/zho_hans_100mb
- Repositorio TRL: https://github.com/huggingface/trl
- Run de Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/4slahfso
- Paper de TRL (citado en la model card): von Werra et al., 2020, GitHub repository
