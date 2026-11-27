# ronke21/rlcl-gemma-2-2b-igbo-s123

## Resumen

rlcl-gemma-2-2b-igbo-s123 es un ajuste fino (fine-tune) del modelo google/gemma-2-2b, publicado por el usuario ronke21 en Hugging Face. El nombre sugiere que se trata de un experimento de aprendizaje continuo con RLCL (Reinforcement Learning with Continual Learning, o alguna variante de la sigla) sobre datos en igbo, y los tags del repositorio incluyen términos como "rlcl", "forgetting" y "lora-merged", lo que apunta a un trabajo centrado en el olvido catastrófico al adaptar el modelo a un nuevo idioma mediante LoRA fusionado.

El modelo hereda la arquitectura Gemma 2 de Google (transformer decoder-only con atención local/global alternada y soft-capping) y cuenta con 2.614.341.888 parámetros reales según los pesos en safetensors, lo que coincide con el tamaño nominal de 2B de la familia. El repositorio ocupa 5,3 GB y se distribuye en formato safetensors para la librería transformers.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigación con acceso restringido (gated), sin descargas ni likes, cuya licencia e idiomas no están declarados. Resulta útil como ejemplo de experimento de adaptación lingüística sobre Gemma 2 y como punto de partida para quien quiera reproducir o evaluar técnicas de mitigación del olvido catastrófico en modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Gemma 2 soporta 8.192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base admite cuantizacion a 8 y 4 bits, pero no se confirma para este fine-tune) |
| Idiomas soportados | no disponible (el nombre sugiere igbo; no se declara lista oficial) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 2, un transformer decoder-only con normalización RMSNorm, activación GeGLU, atención con ventana local y global alternada, y soft-capping en los logits. El modelo base google/gemma-2-2b tiene 2.600 millones de parámetros aproximadamente y fue entrenado por Google con un corpus multilingüe y posteriormente alineado con técnicas de RLHF.

Sobre el proceso de ajuste de este repositorio solo se dispone de la información inferible de los tags: "lora-merged" indica que se aplicó un adaptador LoRA y posteriormente se fusionó con los pesos base; "rlcl" y "forgetting" sugieren que el entrenamiento se enmarcó en un estudio de aprendizaje continuo con evaluación del olvido catastrófico, probablemente sobre datos en igbo (sufijo "igbo" en el nombre). No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, hiperparámetros de LoRA ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional en el idioma del ajuste (presumiblemente igbo), heredando la capacidad del modelo base.
- Razonamiento y respuesta a instrucciones en los idiomas cubiertos por Gemma 2, aunque el ajuste puede haber degradado el rendimiento en otros idiomas (el tag "forgetting" lo sugiere).
- Generación de código y matemáticas a nivel del modelo base Gemma 2 2B, potencialmente reducido tras el fine-tune.
- Soporte de tool calling y function calling: no confirmado para este fine-tune; el modelo base Gemma 2 no incluye un formato nativo de herramientas, por lo que su uso requeriría plantillas externas.
- Capacidades de agente y razonamiento multi-paso: no documentadas para esta variante.
- Capacidades multilingües: no declaradas; el foco parece estar en igbo.
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como artefacto de referencia para reproducir experimentos de adaptación lingüística con LoRA y medir la degradación en tareas del modelo base (MMLU, GSM8K) frente al modelo original.
- Evaluación de técnicas RLCL: útil para comparar curvas de retención de conocimiento al aplicar aprendizaje continuo sobre un modelo pequeño de 2B, con coste computacional reducido.
- Procesamiento de texto en igbo: generación y resumen de textos en este idioma en entornos de investigación, siempre que se valide la calidad con hablantes nativos.
- Prototipado de asistentes conversacionales de bajo coste: al ser un modelo de 2B, puede desplegarse en una única GPU consumer para pruebas de concepto de chatbots en idiomas de bajos recursos.
- Base para nuevos fine-tunes: punto de partida para experimentos de adaptación a otras lenguas africanas comparando el impacto del olvido.
- Docencia y divulgación: ejemplo práctico de pipeline LoRA + merge + evaluación de forgetting en un modelo abierto de Google.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 5,2 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 6-8 GB para contextos moderados.
- VRAM estimada en cuantización 8 bits: en torno a 2,6-3 GB de pesos, con un total de 4-5 GB incluyendo overhead.
- VRAM estimada en cuantización 4 bits: en torno a 1,3-1,5 GB de pesos, con un total de 2-3 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10G, L4, A100 y H100 para despliegues de mayor concurrencia.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 8 GB de VRAM en fp16 y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), vLLM, llama.cpp y Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ronke21/rlcl-gemma-2-2b-igbo-s123 | 2,61 B | no disponible | no disponible | Gated en Hugging Face |
| google/gemma-2-2b | 2,6 B aprox. | 8.192 tokens | Gemma Terms of Use | Público en Hugging Face |
| google/gemma-2-2b-it | 2,6 B aprox. | 8.192 tokens | Gemma Terms of Use | Público en Hugging Face |
| Meta Llama 3.2 1B Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | Público en Hugging Face |

El fine-tune no declara métricas propias, por lo que la comparación se limita a parámetros, contexto y licencia. Frente al modelo base, la principal diferencia es la adaptación al igbo y el posible olvido en otras tareas; frente a Llama 3.2 1B, este último ofrece mayor contexto y licencia explícita, aunque con menor número de parámetros.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial; además, al derivar de Gemma 2, quedan sujetas las Gemma Terms of Use del modelo base.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Riesgo de olvido catastrófico: el propio tag "forgetting" indica que el ajuste puede haber degradado capacidades del modelo base en otros idiomas, código o matemáticas.
- Idiomas no declarados: no hay lista oficial; el uso en idiomas distintos del igbo no está validado.
- Sesgos: hereda los sesgos del corpus de entrenamiento de Gemma 2 y los del dataset de ajuste, no documentados.
- Alucinación: como todo modelo generativo de 2B, presenta riesgo elevado de fabricar información, especialmente en dominios especializados.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad ni de retención.
- Repositorio sin descargas ni likes: no hay comunidad que haya validado el artefacto; úsese con cautela en producción.
- Fecha de creación futura (2026-11-27) en los metadatos: conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/ronke21/rlcl-gemma-2-2b-igbo-s123
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Documentación de Gemma 2 (Google): https://ai.google.dev/gemma/docs/gemma-2
- Paper de Gemma 2: https://arxiv.org/abs/2408.00118
