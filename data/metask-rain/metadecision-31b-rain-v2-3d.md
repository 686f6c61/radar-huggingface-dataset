# MeTask-Rain/MetaDecision-31B-Rain-v2.3d

## Resumen
MetaDecision-31B-Rain-v2.3d es un adaptador LoRA (PEFT) construido sobre el modelo base google/gemma-4-31B-it, distribuido por el usuario MeTask-Rain. No es un modelo de lenguaje generalista: es un servicio de decisión orientado a JevBench, un banco de evaluación con 231 ítems públicos que plantea preguntas de tipo sí/no, elección de opciones y puntuación por niveles. El adaptador se carga junto con los pesos del modelo base (sin fusionar) y se sirve mediante vLLM con kernels compressed-tensors.

La relevancia de esta ficha es acotada: se trata de una entrada de evaluación con cero descargas y cero likes en el momento de la consulta, publicada en noviembre de 2026, cuyo propósito declarado es reportar probabilidades calibradas sobre las respuestas del modelo base. La model card es explícita en que la versión v2.3d cambia únicamente las probabilidades reportadas (temperaturas post-calibración y reglas de puntuación), manteniendo idénticos pesos, enrutamiento, prompts y límite de 9 s por consulta. No se documentan mejoras de precisión ni certificación de tiempos.

La arquitectura subyacente es la del transformer Gemma 4 de 31B parámetros en su variante instruction-tuned, con cuantización aware-training (QAT) oficial de Google. El adaptador añade una capa de decisión sobre esa base, pero no se publican especificaciones de contexto, idiomas ni datos de entrenamiento del adaptador en la información disponible.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4) con adaptador LoRA sobre modelo base cuantizado (QAT) |
| Parametros totales | 31B (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | compressed-tensors (QAT oficial de Google); otros formatos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (pesos); modelo base bajo Gemma 4 licence; codigo de servicio MIT |
| Formato de pesos | safetensors / PEFT (LoRA sin fusionar); servicio servido con vLLM |

## Arquitectura y entrenamiento
El modelo base google/gemma-4-31B-it es un transformer decoder-only de 31B parámetros en variante instruction-tuned, utilizado aquí a través de las releases oficiales de quantization-aware training de Google. Sobre esa base se aplica un adaptador LoRA (PEFT) que implementa una capa de decisión: enrutamiento de consultas, prompts específicos por tipo de pregunta, drafting y límite temporal de 9 s por ítem, con relectura posterior. Los pesos del adaptador y del base se cargan juntos y no se fusionan; ambos están anclados por SHA-256 en el manifiesto del servicio.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF o DPO para el adaptador. La innovación técnica declarada no está en el entrenamiento sino en la capa de post-procesado de probabilidades: temperatura post-calibración para preguntas sí/no, regla fixed_top con top=324/354 para preguntas de elección (confianza constante 0.9152542372881356) y regla symmetric_residual con top=352/375 para puntuaciones. La model card indica que estas constantes se infieren de estadísticas agregadas publicadas por el evaluador de JevBench (draw del 27 de octubre de 2026) y que no constituyen una mejora de calibración.

## Capacidades
- Generación de texto y respuesta a preguntas de decisión en tres formatos: sí/no, elección entre opciones y puntuación por niveles.
- Enrutamiento interno de consultas con prompts diferenciados por tipo de pregunta.
- Drafting y relectura dentro de un presupuesto temporal de 9 s por ítem.
- Servicio compatible con vLLM (prefix caching, slow-session support, kernels compressed-tensors, tensor_parallel_size configurable).
- Identidad de adaptador verificable y health checks con `status: ok`.
- Soporte de tool calling, agentes multi-step, visión, audio y thinking mode: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas del modelo base no se detallan en la información).

## Casos de uso
- Evaluación en JevBench: el servicio responde a los 231 ítems públicos del banco con un máximo de 6,41 s por ítem y cero timeouts en las pasadas de validación documentadas, lo que lo hace adecuado como artefacto de referencia reproducible para comparar configuraciones de decisión.
- Reproducción de experimentos de calibración: al mantener pesos, prompts y enrutamiento idénticos entre versiones y cambiar solo las probabilidades reportadas, permite aislar el efecto de las reglas de post-procesado sobre las métricas agregadas.
- Auditoría de integridad de artefactos: los SHA-256 del servicio, del manifiesto de modelo y del registro de medición permiten verificar que los bytes servidos coinciden con los medidos, útil en pipelines de validación de releases.
- Despliegue en infraestructura de dos GPU consumer: la configuración validada con 2 x NVIDIA RTX 4090 y tensor_parallel_size=2 sirve como receta concreta para replicar el servicio en hardware de gama alta para consumidor.
- Pruebas de latencia bajo SLA estricto: el límite de 9 s y la latencia máxima medida de 6,41 s permiten usar el servicio como banco de pruebas para medir el cumplimiento de plazos en entornos vLLM.
- Integración como componente de decisión en pipelines internos: la capa de enrutamiento y las reglas de confianza por tipo de pregunta permiten consumir salidas estructuradas (opción seleccionada, nivel puntuado, confianza) en sistemas posteriores.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento documentados son los de validación del servicio sobre JevBench:

| Metrica | Valor |
|---|---|
| Items publicos evaluados | 231 |
| Respuestas validas (pasada A) | 231/231 |
| Respuestas validas (pasada B) | 231/231 |
| Errores | 0 |
| Timeouts | 0 |
| Latencia maxima por item (A) | 6.401864345185459 s |
| Latencia maxima por item (B) | 6.404441796243191 s |
| Latencia maxima en imagen objetivo vLLM | 6.41097009414807 s |
| Cambios de respuesta entre pasadas smoke | 0 |
| Precisión hard-choice reportada por el evaluador | 324/354 = 0.9152542372881356 |
| Precisión yes/no reportada por el evaluador | 362/375 = 0.9653 |
| Precisión de score reportada por el evaluador | 352/375 |

Hardware de estas mediciones: 2 x NVIDIA RTX 4090 con tensor_parallel_size=2. La model card advierte que estas cifras no son certificación oficial de tiempos ni evidencia de mejora de precisión.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base es de 31B parámetros con cuantización QAT compressed-tensors, lo que reduce el requisito frente a pesos en bf16, pero no se publica una cifra de VRAM.
- GPU validadas: 2 x NVIDIA RTX 4090 con tensor_parallel_size=2 (configuración usada en las pasadas smoke y en la ejecución sobre la imagen vllm/vllm-openai).
- Despliegue en una sola GPU de 80 GB: declarado como no verificado por el autor.
- Opciones de despliegue: vLLM es el runtime soportado y validado (imagen vllm/vllm-openai@sha256:a4a4c0437bf7240089da5f08aa370c4aee17ae5290f7a3b468825ee26c4c3a6b, Python 3.12.3); llama.cpp, Ollama y TGI no se mencionan en la información disponible.
- Latencia: máxima de 6,41 s por ítem en las condiciones medidas; throughput agregado no disponible.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MetaDecision-31B-Rain-v2.3d | 31B (base) + LoRA | no disponible | Servicio de decisión para JevBench sobre Gemma 4 | apache-2.0 (pesos), MIT (servicio) | Hugging Face, 0 descargas |
| google/gemma-4-31B-it | 31B | no disponible | Modelo instruction-tuned generalista | Gemma 4 licence | Hugging Face (modelo base) |
| MeTask-Rain/metask-jev-rain-31B-trained | 31B (base) + adaptador | no disponible | Pesos de origen del adaptador, anclados por SHA-256 | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estas entradas ni de modelos alternativos de la misma categoría (servicios de decisión sobre Gemma 4) en la información proporcionada.

## Limitaciones y advertencias
- La model card declara explícitamente que la confianza constante 324/354 no es una mejora de calibración, sino la precisión hard-choice del primer row inferida de estadísticas agregadas publicadas por el evaluador.
- Las constantes de calibración se derivan de estadísticas agregadas de la evaluación oficial (draw del 27 de octubre de 2026), no de resultados por ítem ni de preguntas no públicas; su generalización fuera de ese draw no está garantizada.
- Las pasadas en frío pueden diferir: la ejecución sobre la imagen objetivo registró 1 respuesta argmax distinta respecto a la pasada smoke en 2 x RTX 4090.
- El despliegue en una sola GPU de 80 GB no está verificado; solo se validó con tensor_parallel_size=2 sobre 2 x RTX 4090.
- Las métricas de latencia no constituyen certificación oficial de tiempos.
- No hay información sobre sesgos, riesgo de alucinación, cobertura idiomática ni limitaciones de contexto del adaptador.
- Licencia: los pesos se declaran apache-2.0 en la model card, pero el modelo base está sujeto a la Gemma 4 licence (enlazada en license_link); es necesario revisar esa licencia para uso comercial del modelo combinado. El código de servicio es MIT.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso por terceros.
- La model card contiene referencias a versiones previas (primer row) cuyos artefactos no se detallan por completo en la información disponible.

## Enlaces
- Hugging Face: https://huggingface.co/MeTask-Rain/MetaDecision-31B-Rain-v2.3d
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Pesos del adaptador de origen: https://huggingface.co/MeTask-Rain/metask-jev-rain-31B-trained/tree/2feff076f07711fe2fefe7a6fdcedfe4132b773e
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Imagen vLLM validada: vllm/vllm-openai@sha256:a4a4c0437bf7240089da5f08aa370c4aee17ae5290f7a3b468825ee26c4c3a6b
- Commit del harness oficial de JevBench: bb05a335bc809e61b20c0f745d25499a82b326fc
- Repositorio vLLM: https://github.com/vllm-project/vllm
