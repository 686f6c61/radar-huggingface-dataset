# ronke21/rlcl-gemma-2-2b-chem-s124

## Resumen

`ronke21/rlcl-gemma-2-2b-chem-s124` es un ajuste fino (fine-tune) del modelo `google/gemma-2-2b` publicado por el usuario ronke21 en Hugging Face. Por los tags de la model card (`rlcl`, `forgetting`, `lora-merged`) se trata de un experimento de investigación sobre aprendizaje continuo: un LoRA entrenado con alguna variante de *Reinforcement Learning with Contrastive Learning* (RLCL) y posteriormente fusionado en los pesos base. El sufijo `chem-s124` sugiere una especialización en química y una semilla o paso de entrenamiento concreto, aunque no hay documentación que lo confirme.

El modelo conserva la arquitectura Gemma 2 y el tamaño de 2.614.341.888 parámetros del checkpoint original, empaquetado en safetensors con un repositorio de 5,3 GB. Es, por tanto, un modelo pequeño y orientado a generación de texto conversacional, desplegable en hardware de consumo. Su relevancia es limitada fuera del contexto de investigación: cero descargas, cero likes y sin model card sustantiva en el momento de redactar esta ficha.

La información pública es muy escasa. No se declara licencia, idiomas ni detalles del dataset de entrenamiento, y el acceso está restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo. Todo lo que sigue se basa en los metadatos del repositorio y en las características conocidas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), con atención local/global alternada y soft-capping |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en el repo; el modelo base Gemma 2 soporta 8.192 tokens |
| Tipos de cuantizacion | no disponible en el repo; el modelo base admite FP16, BF16, INT8 e INT4 (GGUF/AWQ vía terceros) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2 2B: un transformer decoder-only de 26 capas con atención por ventanas alternadas (local y global), normalización RMSNorm pre y post-atención, activación GeGLU y *soft-capping* en los logits para estabilizar el entrenamiento. El checkpoint resultante tiene 2.614.341.888 parámetros, coherente con el modelo base sin cambios estructurales.

El ajuste fino se realizó mediante LoRA (según el tag `lora-merged`) y los pesos del adaptador se fusionaron en el modelo base, de modo que la inferencia es estándar con `transformers`. El tag `rlcl` apunta a una variante de aprendizaje por refuerzo con aprendizaje contrastivo, y `forgetting` sugiere que el experimento mide la pérdida de capacidades previas tras el ajuste (olvido catastrófico). No se publican detalles sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO ni hiperparámetros. El sufijo `chem` indica una posible especialización en química, pero no hay evidencia documental.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base.
- Razonamiento básico y respuesta a instrucciones, con posible especialización en dominio químico (no verificada).
- Generación de código y matemáticas a nivel de un modelo de 2B (capacidad limitada).
- Soporte de tool calling / function calling: no documentado en el repo; el modelo base Gemma 2 no lo soporta de forma nativa.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no declaradas; el modelo base Gemma 2 cubre principalmente inglés y varios idiomas europeos.
- Capacidades especiales (thinking mode, visión, audio): ninguna declarada.

## Casos de uso

- Investigación sobre olvido catastrófico: el tag `forgetting` y el origen RLCL lo hacen útil como checkpoint de referencia para estudiar cómo un ajuste fino especializado degrada capacidades generales del modelo base.
- Experimentos de ajuste fino con LoRA fusionado: sirve como ejemplo reproducible de pipeline LoRA-merge sobre Gemma 2 2B para comparar con otros adaptadores.
- Clasificación y extracción de entidades químicas: si la especialización `chem` es real, podría usarse para etiquetar compuestos, reacciones o propiedades en textos científicos, aunque sin validación publicada.
- Prototipado de asistentes conversacionales de dominio: al caber en GPU de consumo, permite iterar rápidamente en un asistente especializado antes de escalar a modelos mayores.
- Evaluación comparativa de metodologías RL: útil como baseline en estudios que comparen RLCL frente a SFT o DPO en modelos pequeños.
- Despliegue en entornos con recursos limitados: con 2,6B parámetros y cuantización INT4 puede ejecutarse en una RTX 3060 o superior para demos y pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~5,2 GB en FP16, ~2,7 GB en INT8, ~1,6 GB en INT4 (pesos, sin contar overhead de KV cache).
- GPU recomendadas: A100/H100 para lotes grandes; RTX 4090, RTX 3090 o L4 para inferencia en FP16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores; en 8 GB con cuantización INT8/INT4.
- Opciones de despliegue: `transformers` (nativo), vLLM, TGI (tag `text-generation-inference`), llama.cpp/Ollama mediante conversión a GGUF.
- Latencia y throughput estimados: no disponibles; para un 2B en una RTX 4090 se espera un throughput del orden de miles de tokens/s en batch, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ronke21/rlcl-gemma-2-2b-chem-s124 | 2,61B | no disponible (base: 8.192) | no disponible | Gated en HF |
| google/gemma-2-2b | 2,61B | 8.192 | Gemma Terms of Use | Público en HF |
| google/gemma-2-2b-it | 2,61B | 8.192 | Gemma Terms of Use | Público en HF |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | Apache 2.0 | Público en HF |

El checkpoint de ronke21 no aporta mejoras documentadas frente al modelo base; su interés es exclusivamente experimental. Frente a alternativas como Qwen2.5-1.5B-Instruct, la licencia de este modelo es indeterminada, lo que complica su uso comercial.

## Limitaciones y advertencias

- Ausencia de model card sustantiva: no hay información sobre datos, metodología ni evaluación, lo que impide validar sus capacidades.
- Licencia no declarada y acceso restringido: no se puede garantizar el uso comercial; además, los términos de Gemma podrían aplicar al ser un derivado.
- Riesgo elevado de alucinación, agravado por un posible ajuste fino especializado en química sin validación.
- Posible olvido catastrófico de capacidades generales (el propio tag `forgetting` lo sugiere), lo que puede degradar el razonamiento y la coherencia fuera del dominio de ajuste.
- Idiomas no declarados: no se garantiza un rendimiento aceptable en castellano.
- Sin datos de sesgos, seguridad ni filtros de contenido; no apto para producción sin evaluación previa.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ronke21/rlcl-gemma-2-2b-chem-s124
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Documentación de Gemma 2: https://ai.google.dev/gemma/docs
