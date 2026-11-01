# siddharth-codes/bimagyan-merged

## Resumen

BimaGyan AI es un ajuste fino del modelo Qwen2.5-1.5B-Instruct orientado a la educación del consumidor sobre seguros en la India, cubriendo salud, vida temporal y automóvil. Lo desarrolla el usuario de HuggingFace `siddharth-codes` y se distribuye con licencia Apache-2.0. El modelo parte de la arquitectura transformer densa de Qwen2.5, con 1.543.714.304 parámetros totales (aproximadamente 1,5 mil millones) y un repositorio de 1,2 GB en formato safetensors.

El problema que aborda es la necesidad de respuestas ancladas en cláusulas oficiales, sub-límites, periodos de carencia y circulares del regulador indio IRDAI, en lugar de respuestas genéricas de un modelo de propósito general. Para ello se aplicó un ajuste supervisado (SFT) mediante QLoRA con Unsloth y TRL sobre el modelo base ya instruido, manteniendo el formato de prompt ChatML de Qwen.

Su relevancia es acotada: se trata de un modelo pequeño, monolingüe (inglés) y de nicho, con 47 descargas y ningún "like" en el momento de la consulta, lo que sugiere un proyecto experimental o de portafolio más que un modelo listo para producción. Resulta útil como ejemplo de especialización vertical de un modelo de 1,5B y como base para prototipos de asistentes de seguros de bajo coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), decoder-only |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct; el autor no la declara) |
| Tipos de cuantizacion | 4-bit (bitsandbytes) empleada durante el ajuste QLoRA; el autor no publica variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); compatible con text-generation-inference y endpoints_compatible |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2, inicializado desde Qwen2.5-1.5B-Instruct. No emplea mezcla de expertos ni arquitecturas híbridas SSM: es un modelo denso convencional con atención causal estándar. El ajuste se realizó mediante QLoRA (cuantización de 4 bits con bitsandbytes) usando Unsloth y TRL, con entrenamiento supervisado (SFT) sobre el modelo base ya alineado por instrucciones.

La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas adicionales de RLHF o DPO tras el SFT. El dominio declarado del corpus es seguros indios: regulación IRDAI, redacciones de pólizas, exclusiones, periodos de carencia y glosario. El prompt de sistema recomendado sitúa al modelo como asistente educativo de seguros "consumer-first", y el formato de conversación es ChatML (`<|im_start|>` / `<|im_end|>`), heredado de Qwen.

## Capacidades

- Generación de texto conversacional en inglés sobre seguros de salud, vida temporal y automóvil en la India.
- Explicación de conceptos técnicos del dominio: co-pago, sub-límite de alquiler de habitación, periodos de carencia, exclusiones y glosario.
- Respuestas orientadas a cláusulas y sub-límites, según la intención declarada por el autor de anclar las respuestas en la normativa.
- Soporte del formato de prompt ChatML con rol de sistema, usuario y asistente.
- Compatibilidad con `text-generation-inference` y con endpoints alojados (tag `endpoints_compatible`).
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking" en la información disponible.
- Capacidad multilingüe limitada al inglés según el campo `language` de la model card.

## Casos de uso

- Asistente educativo de seguros para consumidores: el modelo responde en formato ChatML a preguntas como "¿qué es un sub-límite de alquiler de habitación?", usando el prompt de sistema recomendado por el autor para mantener el tono objetivo y centrado en el consumidor.
- Prototipado rápido de chatbots de atención al cliente en aseguradoras: al ser un modelo de 1,5B parámetros y 1,2 GB en safetensors, puede desplegarse en una sola GPU consumer para validar flujos conversacionales antes de invertir en modelos mayores.
- Generación de material divulgativo: redacción de fichas explicativas y FAQ sobre pólizas de salud, vida y motor a partir de los conceptos del dominio en los que fue ajustado.
- Formación interna de agentes: apoyo a nuevos empleados de atención al cliente con explicaciones de cláusulas, exclusiones y periodos de carencia en inglés.
- Evaluación de pipelines de ajuste fino: sirve como referencia reproducible de un flujo QLoRA con Unsloth y TRL sobre Qwen2.5-1.5B-Instruct para equipos que quieran replicar la receta en otros dominios regulados.
- Filtrado y pre-clasificación de consultas: por su bajo coste de inferencia, puede emplearse como primer nivel para reformular o clasificar preguntas de usuarios antes de derivarlas a un modelo mayor o a un humano.
- Base para experimentos de cuantización y despliegue en CPU/GPU de gama baja, dado su tamaño reducido y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3 GB solo para pesos (1,54B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB.
- VRAM estimada en cuantización de 4 bits: del orden de 1-1,5 GB para pesos, más overhead; cabe holgadamente en GPUs consumer de 8 GB.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o más (RTX 3060, 4060, 4070, 4090) para FP16 o 4 bits; A100/H100 no son necesarias por el tamaño del modelo, aunque sirven para servir muchas peticiones concurrentes.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con 8 GB o más, e incluso en configuraciones de 6 GB con cuantización.
- Opciones de despliegue: `transformers`, `text-generation-inference` (declarado en los tags), y en principio `vLLM` y `llama.cpp`/`Ollama` si se generan pesos GGUF, aunque el autor no publica dichas variantes.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera una latencia baja en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| BimaGyan AI (este modelo) | 1,54B | no disponible | Apache-2.0 | Ajuste QLoRA de nicho sobre seguros indios, solo inglés |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | no disponible en la informacion proporcionada | Apache-2.0 | Modelo base; propósito general, multilingüe, alineado por instrucciones |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49B | no disponible en la informacion proporcionada | Apache-2.0 | Alternativa más pequeña de la misma familia para despliegues muy limitados |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | no disponible en la informacion proporcionada | Apache-2.0 | Alternativa mayor de la misma familia con más capacidad general |

La comparación se limita a la familia Qwen2.5 porque la información proporcionada no incluye datos de rendimiento que permitan contrastar con otros ajustes de dominio. No hay benchmarks publicados de BimaGyan AI que permitan afirmar que supera al modelo base en tareas de seguros.

## Limitaciones y advertencias

- Modelo monolingüe en inglés según la model card; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinación relevante en un dominio regulado: el autor no documenta mecanismos de verificación ni recuperación aumentada, por lo que las respuestas sobre cláusulas, sub-límites o circulares IRDAI deben contrastarse con la fuente oficial.
- No se han publicado evaluaciones cuantitativas (benchmarks, evaluación humana, tasas de error) que respalden la fidelidad de las respuestas al dominio.
- El ajuste se realizó con QLoRA de 4 bits sobre un modelo de 1,5B; la capacidad de razonamiento y de retención de conocimiento factual está acotada por el tamaño del modelo base.
- La model card no especifica la composición, el volumen ni la procedencia del dataset de ajuste, lo que impide evaluar sesgos y cobertura del dominio.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece soporte ni mantenimiento declarado.
- El modelo no declara soporte de tool calling ni de agentes; no debe asumirse en integraciones que dependan de function calling.
- El repositorio tiene un uso muy bajo (47 descargas, 0 likes) y fue creado y actualizado el mismo día según los metadatos, lo que sugiere un proyecto experimental sin validación externa.
- No debe usarse como asesoramiento financiero o legal vinculante; conviene acompañarlo de avisos legales y derivación a fuentes oficiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siddharth-codes/bimagyan-merged
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
- IRDAI (regulador de seguros de la India): https://irdai.gov.in
