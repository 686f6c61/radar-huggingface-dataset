# dragosMediv/Tsum-1-Instruct

## Resumen

Tsum-1-Instruct es un modelo de lenguaje conversacional de 608 millones de parámetros desarrollado por dragosMediv, construido sobre la arquitectura Qwen3ForCausalLM. Se trata de un ajuste fino supervisado (SFT) con destilación de conocimiento a partir de dos modelos mayores de la familia Qwen3-4B: la variante instruct y la variante thinking. El modelo resultante combina respuestas conversacionales con la capacidad de emitir trazas de razonamiento delimitadas por tokens especiales propios.

El modelo parte de un checkpoint base entrenado con aproximadamente 19.380 millones de tokens y se afina sobre 25 millones de tokens de asistente distribuidos en 39.079 conversaciones. La innovación principal es su esquema híbrido de entrenamiento: un 72% de los datos corresponde a chat instruct destilado de Qwen3-4B-Instruct-2507 y un 28% a trazas de razonamiento destiladas de Qwen3-4B-Thinking-2507, con una función de pérdida que mezcla entropía cruzada con divergencia KL top-32 más cola sobre los logits del profesor.

Es relevante porque demuestra que es posible transferir capacidades de razonamiento y conversación desde modelos de 4B a un modelo de 608M mediante destilación cuidadosa, usando un tokenizador compacto de 64.000 entradas y un contexto máximo de 8.192 posiciones. El modelo está pensado para experimentación e investigación, no para producción sin salvaguardas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only, GQA 12:3) |
| Parametros totales | 607.966.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 posiciones máximas (SFT con ventana de 4.096) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers, dtype bfloat16 recomendado) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 16 capas, dimensión oculta de 1.536, feed-forward de 5.632 y atención con grouped-query attention en proporción 12:3 (12 cabezas de query y 3 de key/value), con dimensión de cabeza 128 y `rope_theta=500000.0`. El tokenizador es byte-level BPE con vocabulario de 64.000 entradas y plantilla ChatML, con tokens especiales dedicados para bloques de razonamiento (`<|im_thought_start|>` id 2 y `<|im_thought_end|>` id 3).

El entrenamiento consta de una época de SFT sobre 25.000.288 tokens de asistente empaquetados en 9.423 filas de 4.096 tokens con aislamiento por `segment_ids`, durante 1.177 pasos con batch efectivo de 32.768 y scheduler coseno de learning rate de 2,5e-5 a 2,0e-6. La pérdida combina 0,5 × entropía cruzada y 0,5 × divergencia KL top-32 más cola respecto a los logits del profesor, con un 93,83% de los tokens alineados con destilación y un 6,17% puramente con CE. No se aplicó RLHF ni DPO.

## Capacidades

- Generación de texto conversacional multi-turno en inglés con plantilla ChatML.
- Razonamiento explícito mediante bloques delimitados por `<|im_thought_start|>` y `<|im_thought_end|>`, heredado por destilación de Qwen3-4B-Thinking-2507.
- Respuestas instruct directas destiladas de Qwen3-4B-Instruct-2507.
- Generación de código con sintaxis válida, aunque la lógica puede ser incorrecta según advierte el autor.
- Aritmética y álgebra básicas, con propensión documentada a errores incluso dentro de las trazas de razonamiento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes o multi-step reasoning más allá de las trazas de pensamiento.
- Capacidad multilingüe limitada al inglés; el rendimiento degrada en otros idiomas.

## Casos de uso

- Experimentación académica en destilación de conocimiento: el modelo sirve como caso de estudio reproducible de transferencia de capacidades desde un profesor de 4B a un alumno de 608M con pérdida CE+KL, útil para investigar qué se transfiere y qué se pierde.
- Prototipado rápido de asistentes conversacionales en local: con 608M parámetros en bfloat16 (aproximadamente 1,2 GB de pesos) cabe en GPUs de consumo y permite iterar sobre plantillas ChatML y prompts sin coste de API.
- Investigación sobre razonamiento en modelos pequeños: sus tokens dedicados de pensamiento permiten analizar hasta qué punto las trazas destiladas mejoran la precisión frente a la respuesta directa en tareas de aritmética y lógica sencillas.
- Generación de texto en inglés para entornos con recursos limitados: despliegue en CPU o GPU modesta para tareas de resumen, paráfrasis o redacción asistida donde la latencia importa más que la precisión factual.
- Evaluación comparativa de tokenizadores compactos: su vocabulario de 64.000 entradas frente a los 151k de Qwen3 original permite estudiar el impacto del tokenizador en eficiencia y calidad.
- Fines educativos: ejemplo didáctico de pipeline completo (pretrain base, SFT con destilación, pérdida híbrida, tokens especiales de razonamiento) para cursos de ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto y batch.
- VRAM en float32: aproximadamente 2,4 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 4 GB o más.
- Opciones de despliegue: transformers (soporte nativo documentado), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; no se documentan adaptaciones a llama.cpp, Ollama ni vLLM.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Tsum-1-Instruct | 608M | 8.192 | no disponible | en | SFT con destilación de Qwen3-4B, tokens de razonamiento propios |
| Qwen3-0.6B | 600M (aprox.) | 32.768 (nativo) | Apache 2.0 | multilingüe | Modelo oficial de Alibaba; contexto mayor y licencia permisiva |
| Qwen3-4B-Instruct-2507 | 4B (aprox.) | no disponible en esta ficha | Apache 2.0 | multilingüe | Profesor del destilado; mayor calidad pero 6-7 veces más parámetros |
| SmolLM2-360M-Instruct | 360M | 8.192 | Apache 2.0 | en (principalmente) | Alternativa pequeña de Hugging Face con licencia permisiva |

La comparación con Qwen3-0.6B es la más directa por tamaño, aunque Tsum-1-Instruct reduce el contexto a 8.192 posiciones y limita el idioma al inglés. Frente a SmolLM2-360M-Instruct, Tsum-1-Instruct ofrece más parámetros y trazas de razonamiento explícitas, pero carece de licencia declarada.

## Limitaciones y advertencias

- Alucinaciones factuales frecuentes por su tamaño reducido (608M) y una sola época de SFT.
- Errores de aritmética y álgebra documentados por el autor, incluso dentro de las trazas de razonamiento.
- Generación de código con sintaxis válida pero lógica potencialmente incorrecta.
- Bucles de repetición con decodificación greedy o temperaturas bajas; se recomienda `temperature=0.55`, `top_p=0.9` y `repetition_penalty=1.1` según la model card.
- Sin alineación de seguridad ni DPO: puede obedecer peticiones inseguras y producir contenido sesgado o poco fiable.
- Contexto efectivo de SFT de 4.096 tokens pese a un máximo base de 8.192; el rendimiento degrada en entradas largas y densas.
- Soporte limitado al inglés; el rendimiento cae en otros idiomas.
- Licencia no declarada: no se puede asumir uso comercial sin verificación previa con el autor.
- Sin datos de benchmarks publicados, lo que impide validar afirmaciones de calidad de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/dragosMediv/Tsum-1-Instruct
- Modelo base: https://huggingface.co/dragosMediv/Tsum-1-base
- Profesor instruct: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Profesor thinking: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
