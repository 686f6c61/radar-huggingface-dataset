# ronke21/rlcl-gemma-2-9b-cyber-s123

## Resumen

`ronke21/rlcl-gemma-2-9b-cyber-s123` es un ajuste fino (fine-tune) del modelo `google/gemma-2-9b` publicado por el usuario ronke21 en Hugging Face. Por las etiquetas del repositorio (`rlcl`, `forgetting`, `lora-merged`), se trata de un experimento de investigación centrado en el olvido selectivo de conocimiento (*machine unlearning*) mediante la técnica RLCL (Reinforcement Learning with Contrastive Learning, o similar), aplicada al dominio de ciberseguridad. Los pesos del adaptador LoRA se han fusionado en el modelo base, por lo que el resultado es un checkpoint monolítico en formato safetensors.

El modelo hereda la arquitectura Gemma 2 (transformer decoder-only con atención alternada local/global y *soft-capping* de logits) y sus 9.241.705.984 parámetros. Sin embargo, la información pública del repositorio es mínima: no se declara licencia, no se listan idiomas soportados, no hay datos de benchmarks ni una model card descriptiva. El acceso está restringido (gated), lo que exige aceptar condiciones en Hugging Face antes de poder descargarlo.

Su relevancia actual es acotada y de carácter experimental: resulta interesante como ejemplo de aplicación de técnicas de olvido selectivo sobre un modelo de tamaño medio orientado a un dominio sensible (ciberseguridad), pero no debe considerarse un modelo listo para producción dado el vacío de documentación y métricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), fine-tune con LoRA fusionado |
| Parametros totales | 9.241.705.984 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de google/gemma-2-9b: 8.192 tokens) |
| Tipos de cuantizacion | no disponible (repo en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-2-9b`, un transformer decoder-only de 9.241.705.984 parámetros con atención alternada entre ventanas locales (4.096 tokens) y atención global completa (8.192 tokens), normalización RMSNorm con *pre-norm* y *post-norm*, y *soft-capping* de logits y atención para estabilizar el entrenamiento. El fine-tune se realizó mediante LoRA, cuyos pesos se han fusionado en el checkpoint final, según la etiqueta `lora-merged`.

Las etiquetas `rlcl` y `forgetting` sugieren que el ajuste se orientó a inducir olvido selectivo de conocimiento (probablemente sobre contenidos de ciberseguridad, dado el sufijo `cyber`), usando alguna variante de aprendizaje por refuerzo con contraste. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO adicional ni los hiperparámetros del ajuste. Tampoco hay documentación sobre innovaciones técnicas específicas más allá de la herencia de la arquitectura Gemma 2.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Gemma 2 9B.
- Razonamiento y conocimiento general propios de Gemma 2 9B (potencialmente alterados por el proceso de olvido selectivo).
- Capacidad de *tool calling* y *function calling*: no documentada en este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; se desconoce si el fine-tune preserva el multilingüismo del base.
- Modo *thinking* / razonamiento extendido: no disponible.
- Visión o audio: no soportado (modelo solo texto).
- Comportamiento esperado en dominio ciberseguridad: parcialmente olvidado por diseño (etiqueta `forgetting`), aunque no cuantificado.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint sirve como referencia para estudiar cómo un fine-tune con RLCL afecta al conocimiento de un modelo de 9B en un dominio concreto (ciberseguridad). Útil para comparar curvas de olvido frente al base.
- Evaluación de mitigación de contenido sensible: permite medir la reducción de respuestas sobre temas de ciberseguridad ofensiva, aunque sin métricas publicadas por el autor.
- Reproducción de experimentos académicos: al estar los pesos LoRA fusionados, se puede cargar directamente con `transformers` y comparar con `google/gemma-2-9b` en tareas controladas.
- Generación de texto general: al conservar la arquitectura Gemma 2, puede usarse para tareas de texto no relacionadas con el dominio olvidado, siempre que se valide su calidad.
- Base para nuevos fine-tunes: punto de partida para experimentos que requieran un Gemma 2 9B con conocimiento de ciberseguridad parcialmente suprimido.
- Docencia y divulgación: ejemplo práctico de pipeline LoRA + fusión + publicación en Hugging Face con acceso restringido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 18,5 GB de pesos, por lo que se necesitan al menos 20-24 GB de VRAM considerando caché KV y overhead.
- VRAM en cuantización 8 bits: en torno a 10-12 GB (requiere cuantización manual, ya que no se publican GGUF/AWQ).
- VRAM en cuantización 4 bits: en torno a 6-8 GB (igualmente, cuantización no publicada).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para BF16 sin compromisos; RTX 4090 (24 GB) para BF16 ajustado o 8 bits.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto moderado; en RTX 3090 (24 GB) de forma similar; en GPUs de 16 GB solo con cuantización 8/4 bits.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (etiqueta `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversión a GGUF (no publicada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ronke21/rlcl-gemma-2-9b-cyber-s123 | 9,24 B | no disponible (base 8.192) | no disponible | Gated en HF | Fine-tune experimental con olvido selectivo |
| google/gemma-2-9b | 9,24 B | 8.192 | Gemma Terms of Use | Abierto en HF | Modelo base, benchmarks publicados por Google |
| google/gemma-2-9b-it | 9,24 B | 8.192 | Gemma Terms of Use | Abierto en HF | Variante instruida del base |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 | Apache 2.0 | Abierto en HF | Alternativa de tamaño similar con licencia permisiva |

## Limitaciones y advertencias

- Ausencia total de model card: no hay descripción del entrenamiento, datos, hiperparámetros ni evaluación.
- Licencia no declarada: no se puede asumir uso comercial; además, el modelo base Gemma 2 está sujeto a los Gemma Terms of Use, que el fine-tune no puede relajar.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su uso en pipelines automatizados.
- Riesgo de degradación: el proceso de olvido selectivo puede haber afectado a capacidades generales no relacionadas con ciberseguridad.
- Riesgo de alucinación: inherente a los modelos de 9B; sin evaluación específica en este checkpoint.
- Idiomas no declarados: se desconoce si el multilingüismo del base se preserva.
- Sesgos: no evaluados; se heredan los del modelo base Gemma 2 y los del dataset de ajuste (desconocido).
- Sin benchmarks: imposible comparar su rendimiento real frente al base o alternativas.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- Fecha de creación futura (2026-11-27) en los metadatos: posible inconsistencia que conviene verificar antes de confiar en el checkpoint.
- No apto para producción sin auditoría previa de calidad, seguridad y licencia.

## Enlaces

- Hugging Face: https://huggingface.co/ronke21/rlcl-gemma-2-9b-cyber-s123
- Modelo base: https://huggingface.co/google/gemma-2-9b
- Documentación de Gemma 2 (Google): https://ai.google.dev/gemma/docs
- Paper de Gemma 2: https://arxiv.org/abs/2408.00118
- Repositorio de transformers: https://github.com/huggingface/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
