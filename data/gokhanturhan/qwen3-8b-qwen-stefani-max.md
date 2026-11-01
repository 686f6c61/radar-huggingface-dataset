# gokhanturhan/qwen3-8b-qwen-stefani-max

## Resumen

Qwen Stefani Max es un ajuste fino (fine-tune) del modelo base Qwen3-8B de Alibaba, publicado por el usuario gokhanturhan en HuggingFace bajo licencia Apache 2.0. Se trata de un adaptador LoRA de rango 64 aplicado sobre las capas de atención y MLP del modelo base, seguido de un entrenamiento con DPO (Direct Preference Optimization) y un breve ajuste con GRPO (Group Relative Policy Optimization) sobre una rúbrica. El resultado es un modelo de 8.190.735.360 parámetros que hereda la arquitectura transformer densa de Qwen3-8B.

El propósito declarado del modelo es encarnar un personaje ficticio de escenario ("Qwen Stefani"), sin relación con la cantante Gwen Stefani ni con el asistente de Alibaba. Es, por tanto, un modelo de rol o character-driven, orientado a mantener una personalidad concreta en conversación más que a tareas de propósito general. La model card es extremadamente escueta y no documenta el dataset de entrenamiento, los hiperparámetros del DPO/GRPO ni los idiomas soportados.

Su relevancia actual es limitada: se trata de un experimento de post-entrenamiento con pocas descargas (24) y sin benchmarks publicados. Resulta interesante como ejemplo de pipeline LoRA + DPO + GRPO sobre un modelo de 8B, pero no está pensado para producción ni para evaluación comparativa seria. La mención a un "checkpoint público de 128 neuronas" como edición anterior y distinta sugiere que el autor ha iterado sobre variantes del mismo personaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-8B) con adaptador LoRA de rango 64 en atención y MLP |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas estándar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso de 8.190 millones de parámetros. Sobre él se aplica un adaptador LoRA de rango 64 en las capas de atención y en las capas MLP, lo que constituye la primera fase de post-entrenamiento. Posteriormente se realiza un ajuste con DPO (Direct Preference Optimization), técnica de alineación que optimiza directamente sobre pares de respuestas preferidas y rechazadas sin necesidad de un modelo de recompensa separado. Finalmente, se aplica un "short GRPO rubric", es decir, un ajuste breve con Group Relative Policy Optimization guiado por una rúbrica de evaluación.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el número de pasos de DPO/GRPO ni los hiperparámetros empleados. La model card menciona que el "checkpoint público de 128 neuronas" es una edición anterior y distinta, lo que indica que el autor ha publicado al menos dos variantes del personaje. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional con una personalidad de personaje ficticio ("Qwen Stefani") definida mediante post-entrenamiento con DPO y GRPO.
- Role-play y mantenimiento de personaje en conversaciones multi-turno, que es el objetivo declarado del ajuste.
- Razonamiento y generación de código heredados del modelo base Qwen3-8B, aunque no verificados ni evaluados en esta variante.
- Capacidades multilingües potencialmente heredadas de Qwen3-8B, pero no documentadas ni confirmadas para este fine-tune.
- Soporte de tool calling y function calling: no disponible (no documentado; podría heredarse del base, pero no está verificado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Modo "thinking": no disponible (no documentado para esta variante).

## Casos de uso

- Role-play y entretenimiento conversacional: el modelo está entrenado explícitamente para encarnar un personaje ficticio, por lo que su uso natural es la interacción lúdica o narrativa con una personalidad consistente a lo largo de la conversación.
- Prototipado de pipelines de post-entrenamiento: sirve como ejemplo reproducible de la secuencia LoRA + DPO + GRPO sobre un modelo de 8B, útil para investigadores que quieran replicar la receta.
- Experimentos de alineación con rúbricas: el ajuste GRPO con rúbrica permite estudiar cómo una rúbrica corta modifica el estilo de respuesta de un modelo base.
- Generación de diálogos para ficción interactiva: puede integrarse en motores de narrativa ramificada donde se requiera un personaje con voz propia, siempre que se valide la calidad de forma manual.
- Investigación sobre personalidad y sesgos en LLM: al ser un fine-tune de personaje, permite analizar cómo el DPO/GRPO introduce deriva de estilo, tono o contenido respecto al base.
- Base para fine-tunes derivados: al estar bajo Apache 2.0 y en safetensors, puede servir como punto de partida para otros ajustes de personaje o de dominio, aunque su calidad no está validada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 16,4 GB solo para pesos (8,19B × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomiendan 20-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB de pesos, con overhead adicional.
- VRAM estimada en cuantización de 4 bits (GGUF Q4): en torno a 4,5-5,5 GB de pesos, con overhead adicional.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado o cuantización 8 bits; RTX 3090 (24 GB) similar.
- GPU de consumo: cabe en RTX 4090/3090 en FP16 con contexto limitado, y en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) mediante cuantización 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere conversión a GGUF), Ollama (tras conversión), transformers con PEFT para cargar el adaptador LoRA si se dispone de él por separado.
- Latencia y throughput: no disponibles; no se han publicado mediciones para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen Stefani Max (este) | 8,19B | no disponible | Apache 2.0 | HuggingFace, 24 descargas | Fine-tune de personaje con LoRA r64 + DPO + GRPO |
| Qwen/Qwen3-8B (base) | 8,19B | no disponible en esta ficha | Apache 2.0 | HuggingFace, ampliamente usado | Modelo base oficial de Alibaba, con benchmarks publicados por el autor |
| Fine-tunes de personaje sobre Llama 3 8B | ~8B | 8K típicamente | Llama 3 license | HuggingFace, comunidad amplia | Alternativa de rol con ecosistema maduro, licencia más restrictiva |
| Mistral 7B Instruct | 7,2B | 32K | Apache 2.0 | HuggingFace, muy usado | Alternativa densa de tamaño similar, sin personalidad de personaje |

La comparación directa con benchmarks no es posible porque este fine-tune no publica métricas. Frente al Qwen3-8B base, la diferencia principal es el post-entrenamiento de personaje, no una mejora medible en tareas estándar.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones de calidad; el rendimiento real en tareas de propósito general es desconocido y podría degradarse respecto al base por el ajuste de personaje.
- Riesgo de alucinación heredado del modelo base y potencialmente acentuado por el entrenamiento con DPO/GRPO sobre una rúbrica específica.
- Sesgos conocidos: no documentados; el ajuste de personaje puede introducir deriva de tono, estilo o contenido no evaluada.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe correcto.
- Longitud de contexto no confirmada para esta variante; no asumir la del base sin verificación.
- La model card es mínima y no documenta dataset, hiperparámetros ni proceso de evaluación, lo que dificulta la reproducibilidad.
- Uso comercial permitido por Apache 2.0, pero sin garantías de calidad ni soporte; no recomendado para producción sin evaluación previa.
- El nombre del modelo puede generar confusión con Gwen Stefani o con el asistente de Alibaba; el autor aclara explícitamente que no tiene relación con ninguno de los dos.
- El "checkpoint público de 128 neuronas" mencionado es una edición anterior y distinta; no confundir ambas variantes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gokhanturhan/qwen3-8b-qwen-stefani-max
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Perfil del autor: https://huggingface.co/gokhanturhan
