# rwang220/Yida-Model-Qwen

## Resumen

Yida-Model-Qwen es un checkpoint de pesos completos publicado por el usuario rwang220 en Hugging Face, resultado de un ajuste fino supervisado (SFT) con LoRA sobre un checkpoint interno de Qwen3-14B, posteriormente fusionado en pesos `bfloat16`. No se trata de un adaptador PEFT, sino de un modelo causal completo de 14.768.307.200 parámetros orientado a dominio médico y entrenado sobre una mezcla interna de instrucciones médicas en chino. El modelo hereda la arquitectura Transformer de Qwen3-14B (40 capas, hidden size 5120, GQA con 40 cabezas de consulta y 8 de clave/valor) y la licencia Apache 2.0 del modelo base.

El interés del modelo es acotado y experimental: se publica como material de investigación e ingeniería, con la advertencia explícita de que no es un producto sanitario y no debe usarse como única base para decisiones clínicas. La model card no reporta benchmarks clínicos ni de propósito general, solo pérdida de evaluación y precisión de tokens durante el entrenamiento. El repositorio tiene cero descargas y cero likes en el momento de la consulta, y la fecha de creación indicada es 2026-11-09.

Es relevante para quien necesite un punto de partida de dominio médico en chino sobre una base Qwen3, con soporte de modo *thinking* y despliegue estándar vía Transformers o vLLM. No aporta innovaciones arquitectónicas propias: la única modificación respecto al base es el ajuste fino y la fusión de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (`Qwen3ForCausalLM`), 40 capas, hidden size 5120, GQA 40/8, intermediate size 17408, vocab 151936 |
| Parametros totales | 14.768.307.200 (14,77B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | `max_position_embeddings` 40.960; longitud máxima de SFT 8.192 |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos `bfloat16`; no se documentan GGUF ni AWQ/GPTQ) |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 (heredada de Qwen3-14B) |
| Formato de pesos | safetensors en `bfloat16` (checkpoint fusionado, no adaptador PEFT) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-14B sin cambios estructurales: Transformer decoder-only causal con 40 capas, hidden size 5120, atención con grouped-query attention de 40 cabezas de consulta y 8 de clave/valor, tamaño intermedio 17408 y vocabulario de 151936 tokens. El modelo se entrenó partiendo de un checkpoint interno de continuación de Qwen3-14B denominado `Qwen3-14B_30G`, con la misma arquitectura que el Qwen3-14B público, pero que no es un ajuste directo de los pesos públicos. El ajuste se realizó con ms-swift usando LoRA de rango 16, alpha 32 y dropout 0,05 sobre las proyecciones `q/k/v/o/gate/up/down_proj`, y posteriormente se fusionó en pesos completos.

Los hiperparámetros documentados son AdamW con learning rate 1e-4, scheduler coseno, warmup ratio 0,05, 4 épocas, 97.232 pasos, longitud máxima 8192, batch por dispositivo 1 y acumulación de gradiente 8. La mejor pérdida de evaluación fue 0,5906 en el paso 96.000 y la final 0,5907, con una precisión de tokens de evaluación de 0,8067. Los datos de entrenamiento son una mezcla interna de instrucciones médicas en chino, con la mayoría de categorías limitadas a 10.000 muestras y un tope superior para la categoría MedEthics; el dataset no se publica. No se documenta RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto en chino e inglés, con sesgo claro hacia el dominio médico en chino por la composición del SFT.
- Razonamiento en modo *thinking*: la plantilla de chat admite `enable_thinking=True`, y vLLM se puede lanzar con `--reasoning-parser qwen3`.
- Respuestas a instrucciones médicas: explicaciones divulgativas, orientación general y contenido de ética médica (categoría MedEthics con mayor volumen de muestras).
- Conversación multi-turno mediante `apply_chat_template` con roles de sistema, usuario y asistente.
- Generación condicionada por parámetros de muestreo configurables (temperatura, top-p, top-k), como en el ejemplo de la model card.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni otras modalidades.

## Casos de uso

- Evaluación de ajuste fino en dominio médico: servir el modelo con vLLM (`vllm serve rwang220/Yida-Model-Qwen --reasoning-parser qwen3`) para comparar cualitativamente sus respuestas frente al Qwen3-14B base en preguntas médicas en chino.
- Generación de material divulgativo sanitario en chino: redacción de explicaciones en lenguaje llano sobre condiciones comunes, como el ejemplo de la model card sobre hipertensión, siempre con revisión humana posterior.
- Investigación sobre ética médica: la categoría MedEthics recibió un tope de muestras superior, por lo que el modelo puede emplearse para estudiar cómo un SFT sesga las respuestas ante dilemas éticos.
- Prototipado de asistentes conversacionales de orientación sanitaria no diagnóstica: con contexto de hasta 40.960 tokens puede mantener conversaciones multi-turno largas, aunque el SFT se hizo a 8192 tokens.
- Análisis de sesgos y alucinación en modelos médicos: su licencia Apache 2.0 y pesos abiertos permiten auditar respuestas sobre dosis, guías y citas, que la propia model card señala como propensas a error.
- Base para experimentos de *continued pretraining* o nuevos SFT: al ser un checkpoint fusionado en `bfloat16` con arquitectura Qwen3 estándar, se puede recargar con Transformers (`AutoModelForCausalLM.from_pretrained`) y reajustar con ms-swift u otras herramientas.
- Despliegue en pipelines de generación de texto en inglés y chino: `pipeline_tag: text-generation` y compatibilidad con Transformers permiten integrarlo en servicios de inferencia convencionales, con las cautelas de licencia y dominio indicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de entrenamiento: mejor pérdida de evaluación 0,5906 (paso 96.000), pérdida final 0,5907 y precisión de tokens de evaluación 0,8067. No se aportan MMLU, HumanEval, GSM8K ni evaluaciones clínicas.

## Requisitos de hardware

- VRAM estimada para inferencia en `bfloat16`: aproximadamente 29,5 GB solo para pesos (14,77B × 2 bytes), más caché KV y activaciones; en la práctica se recomienda 40 GB o más para contexto largo.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o A6000 48 GB para `bfloat16` sin cuantizar.
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090, 3090) en `bfloat16`; requeriría cuantización a 8 o 4 bits, no documentada en el repositorio.
- Opciones de despliegue: Transformers con `device_map="auto"` y vLLM (`vllm serve ... --reasoning-parser qwen3`), ambas documentadas por el autor. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yida-Model-Qwen | 14,77B | 40.960 (`max_position_embeddings`); SFT a 8.192 | Médico en chino (SFT interno) | Apache 2.0 | Hugging Face, pesos `bfloat16` fusionados |
| Qwen/Qwen3-14B | 14,77B (arquitectura idéntica) | no disponible en la información proporcionada | Generalista, multilingüe | Apache 2.0 | Hugging Face, pesos públicos |
| Alternativas médicas de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con Qwen3-14B es la más directa porque comparten arquitectura y licencia; la diferencia es el SFT médico en chino y que Yida-Model-Qwen parte de un checkpoint interno (`Qwen3-14B_30G`) y no de los pesos públicos. No se dispone de datos de benchmarks para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Puede alucinar guías clínicas, dosis, diagnósticos y citas bibliográficas; la model card lo advierte de forma explícita.
- No es un producto sanitario y no debe usarse como única base para decisiones clínicas.
- Los datos de entrenamiento son internos y no se publican, lo que impide auditar la composición del dataset y sus posibles sesgos.
- Solo se declaran chino e inglés; el rendimiento fuera de esos idiomas no está documentado y el SFT es mayoritariamente en chino.
- El contexto de entrenamiento es de 8192 tokens, aunque `max_position_embeddings` sea 40.960; el comportamiento más allá de 8192 no está validado.
- Las métricas reportadas son solo pérdida y precisión de tokens de evaluación, sin benchmark clínico ni de propósito general; no hay evidencia publicada de calidad en tareas médicas.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones y avisos del modelo base Qwen3-14B; conviene revisar la licencia del base antes de producción.
- Repositorio con cero descargas y cero likes: no hay validación comunitaria ni informes independientes de uso.
- El autor indica que es para investigación y evaluación de ingeniería, no para despliegue clínico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rwang220/Yida-Model-Qwen
- Perfil del autor: https://huggingface.co/rwang220
- Modelo base de referencia: https://huggingface.co/Qwen/Qwen3-14B
