# rwang220/Yida-Model-DS

## Resumen

Yida-Model-DS es un checkpoint de pesos completos (14.770 millones de parámetros en bfloat16) desarrollado por el usuario rwang220 a partir de Qwen3-14B. Se trata de un ajuste fino supervisado (SFT) con LoRA sobre un checkpoint interno de Qwen3-14B denominado `Qwen3-14B_30G`, posteriormente fusionado en pesos completos. El modelo está especializado en dominio médico mediante un conjunto de instrucciones médicas en chino de uso interno, y se distribuye con licencia Apache 2.0.

El modelo resuelve el problema de adaptar un LLM generalista de 14B a tareas de generación de texto médico en chino e inglés, manteniendo la arquitectura original de Qwen3 (transformer causal con GQA, 40 capas, contexto de 40.960 tokens). Es relevante para desarrolladores e investigadores que necesitan un modelo base especializado en dominio sanitario con pesos abiertos y trazabilidad del proceso de entrenamiento (hiperparámetros, pérdida de evaluación y precisión de tokens documentadas).

Conviene subrayar que el autor declara explícitamente que el modelo no es un dispositivo médico y no debe usarse como única base para decisiones clínicas. No se publican resultados en benchmarks clínicos ni generales, y el conjunto de datos de entrenamiento no se distribuye con el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (`Qwen3ForCausalLM`), 40 capas, hidden size 5120, GQA 40/8, intermediate size 17408, vocab 151936 |
| Parámetros totales | 14,77B (14.768.307.200) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | `max_position_embeddings` 40.960; longitud máxima de SFT 8.192 |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 (heredada de Qwen3-14B) |
| Formato de pesos | safetensors en bfloat16 (checkpoint fusionado, no adaptador PEFT) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-14B: transformer causal con 40 capas, dimensión oculta de 5120, atención con query groups (GQA 40 cabezas de query y 8 de clave/valor), tamaño intermedio de 17408 y vocabulario de 151936 tokens. El contexto máximo posicional es de 40.960 tokens, aunque el entrenamiento SFT se realizó con longitud máxima de 8192.

El ajuste fino se llevó a cabo con ms-swift usando LoRA de rango 16 y alpha 32, dropout 0.05, aplicado a las proyecciones `q/k/v/o/gate/up/down_proj`. El optimizador fue AdamW con learning rate 1e-4, scheduler coseno y warmup ratio 0.05, durante 4 épocas y 97.500 pasos, con batch por dispositivo de 1 y acumulación de gradiente de 8. La pérdida de evaluación mínima fue 0.5993 en el paso 73.000 y la final 0.6020, con una precisión de tokens de evaluación final de 0.8102. El checkpoint base inmediato es un modelo interno de Qwen3-14B (`Qwen3-14B_30G`) con la misma arquitectura que el Qwen3-14B público, no un ajuste directo de los pesos públicos. Los datos de entrenamiento consisten en una mezcla interna de instrucciones médicas en chino, sin el límite de 10.000 muestras por categoría aplicado a la variante Qwen, y no se publican.

## Capacidades

- Generación de texto en chino e inglés, orientada a contenido médico.
- Razonamiento con modo de pensamiento explícito (`enable_thinking=True` en la plantilla de chat).
- Respuesta a instrucciones conversacionales multi-turno mediante `apply_chat_template`.
- Ajuste fino sobre instrucciones médicas en chino (explicaciones de patologías, orientación general, etc.).
- Compatibilidad con el parser de razonamiento de Qwen3 en vLLM (`--reasoning-parser qwen3`).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente multi-paso: no documentadas en la información disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente de información sanitaria en chino: el modelo puede generar explicaciones en lenguaje llano sobre patologías y hábitos saludables (por ejemplo, hipertensión) aprovechando el ajuste SFT sobre instrucciones médicas en chino.
- Generación de material divulgativo bilingüe: redacción de borradores de artículos o fichas informativas en chino e inglés a partir de indicaciones breves, con revisión humana posterior obligatoria.
- Preprocesado y estructuración de texto clínico: resumen y reformulación de notas o descripciones de síntomas en chino para su revisión por personal sanitario, usando la ventana de contexto de 40.960 tokens.
- Evaluación de ingeniería de LLM en dominio médico: banco de pruebas para comparar el efecto del SFT con LoRA frente al Qwen3-14B base en tareas de instrucción médica en chino.
- Prototipado de sistemas de triaje informativo: generación de preguntas de seguimiento y respuestas orientativas no diagnósticas, siempre con derivación a profesionales.
- Despliegue en producción con vLLM: servicio de generación de texto con parser de razonamiento Qwen3 para aplicaciones internas de investigación, con cuantización adicional a definir por el integrador.
- Investigación sobre ajuste fino supervisado: reproducción del pipeline ms-swift LoRA + fusión de pesos a partir de los hiperparámetros documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas de evaluación del entrenamiento: pérdida de evaluación mínima de 0.5993 (paso 73.000), pérdida final de 0.6020 y precisión de tokens de evaluación final de 0.8102. No se declara ningún benchmark clínico.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 29,5 GB solo para pesos (14,77B × 2 bytes), más memoria para caché KV y activaciones; en la práctica se recomienda al menos 32-40 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 15-16 GB para pesos; en 4 bits, alrededor de 8-9 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para bfloat16 sin cuantizar; RTX 4090 24 GB solo con cuantización de 8 o 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 24 GB o RTX 3090 24 GB con cuantización; no en bfloat16 completo.
- Opciones de despliegue: `transformers` con `device_map="auto"`, vLLM (`vllm serve rwang220/Yida-Model-DS --reasoning-parser qwen3`); llama.cpp, Ollama o TGI no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yida-Model-DS | 14,77B | 40.960 | Médica (SFT en chino) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-14B | 14,77B | 40.960 (arquitectura base) | Generalista | Apache 2.0 | Hugging Face |
| Qwen3-14B `Qwen3-14B_30G` (interno) | 14,77B | no disponible | Base del ajuste | no disponible | No público |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Puede alucinar guías clínicas, dosis, diagnósticos y citas bibliográficas; el propio autor lo advierte.
- No es un dispositivo médico y no debe usarse como única base para decisiones clínicas.
- Los datos de entrenamiento son internos y no se publican con el repositorio, lo que impide auditar la composición del corpus.
- Solo se declaran métricas de pérdida y precisión de tokens de evaluación; no hay benchmarks clínicos ni generales.
- Idiomas limitados a chino e inglés; el rendimiento en castellano no está documentado.
- El checkpoint base inmediato es un modelo interno (`Qwen3-14B_30G`), no los pesos públicos de Qwen3-14B, lo que limita la reproducibilidad exacta del entrenamiento.
- No se documentan sesgos conocidos ni evaluaciones de seguridad específicas.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el uso clínico recae en el integrador.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rwang220/Yida-Model-DS
- Perfil del autor: https://huggingface.co/rwang220
- Modelo base público de referencia: https://huggingface.co/Qwen/Qwen3-14B
