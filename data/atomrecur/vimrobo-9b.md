# AtomRecur/VimRobo-9B

## Resumen

VimRobo-9B es un checkpoint de Qwen3.5-9B afinado mediante supervisión (SFT) por AtomRecur para razonar sobre grabaciones de robots. El modelo parte del modelo base Qwen/Qwen3.5-9B, con 9.409.813.744 parámetros totales, y sus pesos LoRA están fusionados en el checkpoint final, por lo que se distribuye como un modelo denso listo para servir sin adaptadores separados. La licencia es Apache 2.0 y el repositorio ocupa 18,8 GB en formato safetensors.

La propuesta diferencial es el enfoque de recuperación de memoria visual: VimRobo no procesa directamente las imágenes dentro del LLM, sino que delega la parte visual en un modelo de embeddings visual separado que alimenta el contexto textual del modelo de lenguaje. El LLM razona sobre las grabaciones recuperadas, lo que encaja con tareas de IA encarnada donde el agente debe interpretar episodios pasados de manipulación o navegación.

Es relevante ahora porque la IA encarnada y la robótica basada en modelos de lenguaje están demandando modelos especializados que combinen contexto largo (hasta 131.072 tokens según el ejemplo de despliegue con vLLM) con razonamiento sobre secuencias de acciones. El modelo es muy reciente (publicado en noviembre de 2026) y cuenta con cero descargas y cero likes en el momento de redactar esta ficha, por lo que su validación por la comunidad es todavía inexistente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-9B) |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens (según el comando de despliegue con vLLM) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

VimRobo-9B es un fine-tuning supervisado (SFT) del checkpoint Qwen3.5-9B. La model card indica explícitamente que los pesos LoRA del ajuste están fusionados en el checkpoint, de modo que el resultado es un modelo denso estándar de 9,4 mil millones de parámetros servible con frameworks convencionales como vLLM. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset de grabaciones de robots ni si se aplicaron etapas de RLHF o DPO posteriores al SFT.

La innovación arquitectónica destacable no está en el transformer en sí, sino en el pipeline de recuperación: VimRobo utiliza un modelo de embeddings visual separado para recuperar fragmentos relevantes de las grabaciones, y el LLM razona sobre esa memoria recuperada. Este diseño de "recuperación de memoria" (memory retrieval) permite al modelo razonar sobre episodios largos sin necesidad de procesar vídeo directamente en el contexto del LLM, reduciendo el coste computacional del preprocesamiento visual.

## Capacidades

- Razonamiento sobre grabaciones de robots: interpretación de secuencias de acciones, estados y resultados a partir de memoria recuperada por un modelo visual externo.
- Razonamiento de propósito general heredado de Qwen3.5-9B: generación de texto, comprensión lectora y resolución de problemas.
- Razonamiento multi-paso sobre episodios: la ventana de 131.072 tokens permite concatenar múltiples fragmentos recuperados de memoria.
- Integración con un modelo de embeddings visual separado para la fase de recuperación (no incluido en este repositorio).
- Despliegue compatible con vLLM mediante el comando documentado en la model card.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión nativa o audio: no disponible en la información proporcionada.

## Casos de uso

- Razonamiento sobre episodios de manipulación robótica: el modelo recibe descripciones textuales de fragmentos recuperados de grabaciones y razona sobre qué acciones tuvieron éxito o fracasaron, útil para depurar políticas de control.
- Planificación de tareas encarnadas con memoria: dado un objetivo y un conjunto de episodios previos recuperados, el modelo propone secuencias de acciones coherentes con la experiencia acumulada del robot.
- Análisis post-mortem de fallos en producción: integrado en un pipeline que recupere los fotogramas clave de un episodio fallido, el modelo genera un diagnóstico textual de la causa probable.
- Etiquetado y anotación semiautomática de datasets de robótica: el modelo puede generar descripciones de alto nivel de episodios recuperados para enriquecer datasets de entrenamiento.
- Asistente para operadores de flotas de robots: con contexto largo, el modelo puede resumir el estado y el historial de varios episodios recuperados y responder preguntas del operador.
- Investigación en IA encarnada: sirve como punto de partida para experimentos de SFT sobre Qwen3.5-9B con datos de robótica, gracias a su licencia Apache 2.0 y a la disponibilidad del código en GitHub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18,8 GB solo para pesos, más overhead de KV cache; se recomienda al menos 24 GB para contexto corto y 40-80 GB para contextos largos.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para servir con la ventana completa de 131.072 tokens.
- GPU de consumo: una RTX 4090 (24 GB) podría alojar los pesos en BF16 con contexto reducido, pero no se garantiza estabilidad con la ventana completa; se requeriría cuantización, cuya disponibilidad no está documentada.
- Opciones de despliegue: vLLM es el framework documentado en la model card (`vllm serve AtomRecur/VimRobo-9B --max-model-len 131072 --port 8001`). Otros frameworks como llama.cpp, Ollama o TGI no están confirmados.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VimRobo-9B | 9,4 B | 131.072 | Robótica / memoria visual | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen3.5-9B (base) | 9 B | No disponible | Propósito general | No disponible en la información | Hugging Face |
| Alternativas de robótica de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre benchmarks ni de otros modelos comparables de robótica con memoria visual en la documentación proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo recién publicado (noviembre de 2026) con cero descargas y cero likes: no hay evidencia de la comunidad sobre su calidad real.
- No se documentan los datos de entrenamiento, por lo que se desconocen los sesgos potenciales introducidos por el dataset de grabaciones de robots.
- Riesgo de alucinación inherente a los modelos de lenguaje de 9 B, especialmente al razonar sobre episodios recuperados que pueden estar incompletos o mal recuperados.
- La calidad del razonamiento depende críticamente del modelo de embeddings visual externo, que no se distribuye en este repositorio y cuya identidad no se especifica.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado fuera del inglés sin validación previa.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de benchmarks y de validación externa desaconseja su uso en producción sin una evaluación propia.
- No se documentan los tipos de cuantización soportados, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AtomRecur/VimRobo-9B
- Página del proyecto: https://atomrecur.github.io/VimRobo/
- Código y quick start: https://github.com/AtomRecur/VimRobo#quick-start
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
