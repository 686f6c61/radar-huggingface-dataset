# MANGSEOK123/qwen3-4b-tau2-skill-grpo-retail-1ep-seed1

## Resumen

qwen3-4b-tau2-skill-grpo-retail-1ep-seed1 es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario MANGSEOK123. Se trata de un experimento de investigación centrado en la internalización de habilidades (skill internalization) para tareas de agente conversacional, específicamente sobre el benchmark tau2-bench en el dominio retail. El modelo parte de la variante Instruct de Qwen3-4B en modo no-thinking y se entrena con una variante de GRPO denominada Skill-GRPO, implementada sobre el trainer SDAR.

El objetivo del modelo es que el estudiante aprenda a resolver tareas de atención al cliente retail (devoluciones, cambios, consultas de pedidos) sin necesidad de recibir la habilidad o experiencia en el prompt de sistema durante la inferencia. Para ello se combina un proceso de auto-destilación on-policy (el profesor es una copia congelada del modelo inicial con la skill en el system prompt) con GRPO. Es relevante como pieza de investigación sobre cómo internalizar comportamientos de agente en modelos pequeños de 4 mil millones de parámetros.

El modelo tiene 4.022.468.096 parámetros en BF16, un repositorio de 8,1 GB y está pensado para experimentación con tool calling y flujos multi-turno en dominios de atención al cliente. No cuenta con descargas ni likes en el momento de redactar esta ficha, y la licencia no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), modo no-thinking |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el prompt budget de entrenamiento fue de 16k tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4 mil millones de parámetros en modo no-thinking. El entrenamiento se realizó en dos fases descritas por el autor. La primera es una internalización mediante auto-destilación on-policy con el codebase OEL (LMOps): el estudiante resuelve cada tarea sin la skill ni la experiencia en el prompt (temperatura 0,7), mientras que un profesor, copia congelada del modelo inicial con la skill en el system prompt, genera las distribuciones objetivo. La pérdida es una KL inversa a nivel de token sobre los 256 tokens más probables del estudiante, con AdamW a learning rate constante de 3e-6, 8 pares por actualización y 1 epoch. La segunda fase es Skill-GRPO, un GRPO sobre el trainer SDAR con group size 8, learning rate 1e-6, coeficiente low_var_kl de 0,01 y un presupuesto de prompt de 16k tokens.

La evaluación se realizó sobre tau2-bench v1.0.1 con un simulador de usuario GPT-4.1-mini y sobre BFCL v3 con bfcl_eval 2025.6.14. El entrenamiento se ejecutó durante 1 epoch con semilla 1, en el dominio retail. No se especifican el número total de tokens de entrenamiento ni la composición exacta del dataset más allá del benchmark utilizado.

## Capacidades

- Generación de texto conversacional multi-turno en el dominio de atención al cliente retail.
- Ejecución de tareas de agente con tool calling en el entorno de tau2-bench (devoluciones, cambios, consultas de pedidos).
- Internalización de habilidades: resuelve tareas sin necesidad de incluir la skill en el prompt de sistema.
- Razonamiento de múltiples pasos orientado a la resolución de tareas del benchmark tau2-bench.
- Capacidades heredadas del Qwen3-4B-Instruct-2507 (generación general, código y matemáticas), aunque no se han validado específicamente en este ajuste.
- Compatible con text-generation-inference y endpoints compatibles según los tags del repositorio.
- Modo no-thinking exclusivamente; no se ha entrenado para el modo thinking de Qwen3.

## Casos de uso

- Investigación en internalización de habilidades: permite estudiar si un modelo de 4B puede aprender comportamientos de agente sin depender de instrucciones extensas en el prompt, comparando el rendimiento con y sin skill en el system prompt.
- Atención al cliente automatizada en retail: el modelo está entrenado sobre tau2-bench retail, por lo que puede gestionar conversaciones multi-turno de devoluciones, cambios y consultas de pedidos con tool calling.
- Evaluación de pipelines de agentes: sirve como baseline para comparar estrategias de entrenamiento (Skill-GRPO frente a otras variantes de GRPO) en entornos simulados con usuario GPT-4.1-mini.
- Reproducción de experimentos: al estar publicado con semilla 1 y configuración detallada, permite reproducir resultados de Skill-GRPO sobre tau2-bench.
- Prototipado de asistentes con tool calling en dominios acotados: su tamaño de 4B facilita el despliegue en entornos de desarrollo con una sola GPU consumer.
- Estudio de auto-destilación on-policy: el modelo es un artefacto útil para analizar el efecto de la KL inversa a nivel de token sobre los top-256 tokens en modelos pequeños.
- Benchmarking de BFCL v3: puede utilizarse como punto de comparación en evaluaciones de function calling con bfcl_eval 2025.6.14.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que se evaluó sobre tau2-bench v1.0.1 y BFCL v3, pero no incluye las puntuaciones obtenidas.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 16 GB o más para contexto largo.
- VRAM estimada en cuantización de 8 bits: alrededor de 4-5 GB para pesos.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,5-3 GB para pesos.
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en producción con contexto largo; RTX 4090 (24 GB) para inferencia en BF16 con margen; RTX 3090 (24 GB) y RTX 4080 (16 GB) para cuantizaciones de 8 bits.
- Cabe en GPU consumer: sí, en RTX 4090, RTX 3090 y RTX 4080 en BF16 o cuantizado; en GPUs de 8-12 GB requiere cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag del repo), vLLM, llama.cpp y Ollama si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-4b-tau2-skill-grpo-retail-1ep-seed1 | 4,02B | no disponible | no disponible | Hugging Face, 0 descargas | Ajuste experimental sobre tau2-bench retail |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | no disponible en esta ficha | Apache 2.0 (según el modelo base de Qwen) | Hugging Face, ampliamente disponible | Modelo base no-thinking; sin entrenamiento específico de agente retail |
| Qwen/Qwen3-4B | 4B | 32k nativo, extensible | Apache 2.0 | Hugging Face | Incluye modo thinking y no-thinking; referencia general de la familia |
| Modelos de agente retail de mayor tamaño (p. ej. variantes de 7B-14B) | 7-14B | variable | variable | variable | No se dispone de datos comparativos verificados en la información proporcionada |

La comparación cuantitativa de rendimiento no está disponible porque el autor no publica puntuaciones de tau2-bench ni de BFCL v3 en la model card.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial permitido; hay que consultar la licencia del modelo base Qwen3-4B-Instruct-2507 y contactar con el autor.
- Modelo experimental de investigación: 0 descargas y 0 likes, sin validación comunitaria; no se recomienda para producción sin evaluación propia.
- Entrenado únicamente en el dominio retail de tau2-bench: el comportamiento en otros dominios (aerolíneas, telecomunicaciones) o en conversaciones generales no está validado.
- Solo modo no-thinking: no se ha entrenado para el razonamiento extendido de Qwen3, lo que limita tareas que requieran cadenas de razonamiento largas.
- Riesgo de sobreajuste al simulador de usuario GPT-4.1-mini utilizado en entrenamiento y evaluación; el rendimiento con usuarios reales puede diferir.
- Riesgo de alucinación inherente a los modelos de 4B, especialmente en la gestión de políticas de devolución y datos de pedidos.
- Idiomas soportados no documentados: aunque el modelo base es multilingüe, no hay evidencia de que el ajuste conserve el multilingüismo.
- Sin datos de benchmarks publicados: imposible verificar la mejora frente al modelo base sin ejecutar evaluaciones propias.
- Contexto de entrenamiento limitado a 16k tokens de prompt: no se garantiza un comportamiento correcto con contextos significativamente mayores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-skill-grpo-retail-1ep-seed1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- tau2-bench: no disponible en la información proporcionada
- BFCL (Berkeley Function Calling Leaderboard): no disponible en la información proporcionada
- Codebase OEL (LMOps): no disponible en la información proporcionada
- Trainer SDAR: no disponible en la información proporcionada
