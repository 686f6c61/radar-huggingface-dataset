# MANGSEOK123/qwen3-4b-tau2-oel-retail-setting4-n176-seed1

## Resumen

qwen3-4b-tau2-oel-retail-setting4-n176-seed1 es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507 publicado por el usuario MANGSEOK123 en Hugging Face. Se trata de un experimento de investigación centrado en la internalización de habilidades (skill internalization) sobre el benchmark tau2-bench, concretamente en el dominio retail. El modelo parte de la variante Instruct de Qwen3-4B en modo no-thinking y se entrena con 176 pares tarea-habilidad y semilla de entrenamiento 1.

La relevancia del modelo es metodológica más que de producto: explora técnicas de autodestilación on-policy (OEL, del codebase LMOps) y de aprendizaje por refuerzo con GRPO (Skill-GRPO mediante el entrenador SDAR) para que el modelo estudiante aprenda a resolver tareas de atención al cliente sin disponer de la habilidad o experiencia en el prompt de sistema. El profesor es una copia congelada del modelo inicial que sí recibe la habilidad en el system prompt.

Con 4.022.468.096 parámetros y pesos en BF16 (repo de 8,1 GB), es un modelo pequeño orientado a generación de texto conversacional y uso de herramientas, no a propósito general. No hay información publicada sobre licencia, idiomas soportados ni resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), derivada de Qwen/Qwen3-4B-Instruct-2507 |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-4B-Instruct-2507 soporta contexto largo, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3, inicializado desde Qwen/Qwen3-4B-Instruct-2507 en modo no-thinking. El entrenamiento se realiza sobre tau2-bench retail con 176 pares tarea-habilidad y semilla 1, combinando dos fases. La primera es internalización mediante autodestilación on-policy con el codebase OEL (LMOps): el estudiante resuelve cada tarea sin la habilidad en el prompt (temperatura 0,7), mientras que una copia congelada del modelo inicial, con la habilidad en el system prompt, actúa como profesor; la pérdida es una KL inversa a nivel de token sobre el top-256 de tokens del estudiante, con AdamW a learning rate 3e-6 constante, 8 pares por actualización y 1 época.

La segunda fase es Skill-GRPO, un entrenamiento de refuerzo con GRPO implementado en el entrenador SDAR, con tamaño de grupo 8, learning rate 1e-6, low_var_kl 0.01 y un presupuesto de prompt de 16k tokens. La evaluación se realiza con tau2-bench v1.0.1 usando un simulador de usuario GPT-4.1-mini, y con BFCL v3 mediante bfcl_eval 2025.6.14. No se detalla la composición del dataset de entrenamiento más allá de los 176 pares tarea-habilidad del dominio retail.

## Capacidades

- Generación de texto conversacional multi-turno en el dominio de atención al cliente minorista.
- Uso de herramientas y function calling, dado que tau2-bench evalúa interacciones con herramientas y el modelo se entrena sobre ese entorno.
- Internalización de habilidades: resolución de tareas sin que la habilidad esté explícita en el system prompt, que es el objetivo central del ajuste.
- Razonamiento de múltiples pasos orientado a completar tareas de agente (reservas, consultas, modificaciones de pedidos, etc., según el dominio retail de tau2-bench).
- Capacidades multilingües: no disponible.
- Modo thinking: el modelo se entrena sobre la variante no-thinking de Qwen3-4B-Instruct-2507, por lo que no se documenta un modo de razonamiento extendido.

## Casos de uso

- Investigación en internalización de habilidades: reproducir el pipeline OEL con autodestilación on-policy para estudiar cuánto conocimiento de una habilidad puede absorber el estudiante sin recibirla en el prompt; el modelo sirve como artefacto de referencia del experimento setting4-n176-seed1.
- Evaluación comparativa en tau2-bench retail: usar el modelo como baseline ajustado frente a Qwen3-4B-Instruct-2507 sin ajustar para medir la ganancia de la internalización y del Skill-GRPO en tareas de agente minorista.
- Agente de atención al cliente para comercio electrónico: el modelo puede gestionar conversaciones con un simulador de usuario y ejecutar llamadas a herramientas para consultar pedidos, gestionar devoluciones o modificar reservas, aprovechando el entrenamiento específico en el dominio retail.
- Prototipado de asistentes con tool calling: al estar entrenado sobre un entorno que exige function calling, es adecuado para validar pipelines de agentes en los que el modelo debe decidir qué herramienta invocar y con qué argumentos.
- Estudio de GRPO aplicado a agentes conversacionales: el checkpoint permite analizar el efecto del entrenamiento por refuerzo con SDAR sobre políticas de diálogo con herramientas, comparándolo con la fase de destilación.
- Despliegue ligero en entornos de investigación: con 4.000 millones de parámetros en BF16 cabe en una GPU de 24 GB, lo que facilita experimentos de ablation sin infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona los entornos de evaluación (tau2-bench v1.0.1 con simulador GPT-4.1-mini y BFCL v3 con bfcl_eval 2025.6.14), pero no incluye cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 10 y 14 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 4-5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB (estimaciones para un modelo de 4.000 millones de parámetros; no se publican GGUF oficiales).
- GPU recomendadas: A100 40/80 GB o H100 para servir con vLLM y lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en BF16 con contexto moderado; RTX 4080/4070 Ti (16 GB) o GPUs de 12 GB con cuantización para uso individual.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 en BF16 y en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), y previsiblemente vLLM y llama.cpp/Ollama tras conversión a GGUF, aunque no se confirma en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-tau2-oel-retail-setting4-n176-seed1 | 4,02 B | no disponible | Ajuste sobre tau2-bench retail (OEL + Skill-GRPO) | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4 B aprox. | no disponible en esta ficha | Instrucción general | según Qwen3 (no confirmada aquí) | Hugging Face, ampliamente usado |
| Alternativas de 4 B para agentes con tool calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado para establecer una comparativa cuantitativa con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes: no hay validación externa ni evidencia de robustez en producción.
- Licencia no disponible: no se puede confirmar el uso comercial permitido; conviene contactar con el autor antes de cualquier despliegue.
- Idiomas no documentados: el entrenamiento se centra en tau2-bench retail, presumiblemente en inglés, y no se garantiza calidad en castellano.
- Riesgo de sobreajuste al dominio retail y a los 176 pares tarea-habilidad del conjunto de entrenamiento; el rendimiento fuera de ese dominio no está evaluado.
- Al ser un ajuste sobre la variante no-thinking, no incorpora el modo de razonamiento extendido de otros modelos Qwen3.
- Riesgo de alucinación en llamadas a herramientas y en la confirmación de acciones del agente, especialmente sin evaluación publicada en BFCL v3.
- No se publican resultados de benchmarks, por lo que no es posible verificar la mejora frente al modelo base.
- El uso de un simulador de usuario GPT-4.1-mini en la evaluación introduce dependencia de un modelo propietario externo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-tau2-oel-retail-setting4-n176-seed1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio OEL (LMOps): no disponible en la informacion proporcionada
- Entrenador SDAR: no disponible en la informacion proporcionada
- tau2-bench: no disponible en la informacion proporcionada
- BFCL (bfcl_eval 2025.6.14): no disponible en la informacion proporcionada
