# MANGSEOK123/qwen3-4b-bfcl-oel-ours-full-n334-seed2

## Resumen

qwen3-4b-bfcl-oel-ours-full-n334-seed2 es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507 (modo no-thinking) desarrollado por el usuario MANGSEOK123. El modelo parte de la arquitectura Qwen3 de 4.022 millones de parámetros y se ha entrenado específicamente sobre el conjunto de evaluación BFCL-v3 multi-turno (bfcl_eval 2025.6.14) con el objetivo de internalizar habilidades de uso de herramientas y llamadas a funciones en el propio modelo, sin necesidad de incluirlas en el prompt del sistema.

La técnica central es la "internalización" mediante autodestilización on-policy con el framework OEL (LMOps). El estudiante resuelve cada tarea sin la habilidad o experiencia en el prompt (temperatura 0,7), mientras que una copia congelada del modelo inicial, que sí incluye la habilidad en el prompt del sistema, actúa como profesor. La destilación se realiza con divergencia KL inversa a nivel de token sobre los 256 tokens más probables del estudiante, con AdamW a learning rate constante de 3e-6, 8 pares por actualización y una época. También se menciona una variante Skill-GRPO con el entrenador SDAR.

La relevancia de este modelo es fundamentalmente experimental: explora si las capacidades de tool calling pueden integrarse en los pesos del modelo en lugar de depender de instrucciones explícitas. Al estar entrenado sobre 334 pares tarea-habilidad con semilla 2 y publicarse sin métricas de rendimiento ni licencia declarada, debe considerarse un artefacto de investigación más que un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3), modo no-thinking |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamaño del repositorio | 8,1 GB |
| Biblioteca | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer de Qwen3 en su variante de 4.000 millones de parámetros, concretamente la versión Instruct-2507 en modo no-thinking. Sobre esta base se aplica un proceso de ajuste fino orientado a la internalización de habilidades de tool calling, utilizando el conjunto BFCL-v3 multi-turno (bfcl_eval 2025.6.14) con TANI (Full) y 334 pares tarea-habilidad, con semilla de entrenamiento 2.

El entrenamiento combina dos estrategias. La primera es autodestilización on-policy con el framework OEL (LMOps): el estudiante resuelve cada tarea sin la habilidad o experiencia en el contexto (temperatura 0,7), mientras que una copia congelada del modelo inicial, que sí lleva la habilidad en el prompt del sistema, actúa como profesor. La pérdida es una KL inversa a nivel de token sobre los 256 tokens más probables del estudiante, con AdamW a learning rate constante de 3e-6, 8 pares por actualización y una sola época. La segunda es Skill-GRPO, un entrenamiento con GRPO mediante el entrenador SDAR con tamaño de grupo 8, learning rate 1e-6, low_var_kl de 0,01 y un presupuesto de prompt de 16k tokens. La evaluación se realiza con tau2-bench v1.0.1 usando un simulador de usuario GPT-4.1-mini y con BFCL v3 (bfcl_eval 2025.6.14).

## Capacidades

- Generación de texto conversacional en modo no-thinking, heredada del modelo base Qwen3-4B-Instruct-2507.
- Tool calling y function calling, con habilidades internalizadas durante el entrenamiento sobre BFCL-v3 multi-turno.
- Razonamiento multi-turno orientado a tareas de agente, según el conjunto de entrenamiento utilizado.
- Internalización de habilidades sin necesidad de incluirlas en el prompt del sistema (objetivo declarado del ajuste).
- Capacidades multilingües: no disponible (no se especifican idiomas).
- Modo thinking: no disponible en este ajuste (el autor indica explícitamente modo no-thinking).
- Visión y audio: no disponibles.

## Casos de uso

- Investigación en internalización de habilidades: el modelo sirve como artefacto para estudiar si el tool calling puede integrarse en los pesos en lugar de depender de instrucciones en el prompt, comparando su comportamiento con el del modelo base sin habilidades en el sistema.
- Evaluación de agentes multi-turno: adecuado para reproducir experimentos sobre BFCL-v3 multi-turno y tau2-bench v1.0.1, dado que fue entrenado y evaluado con esos conjuntos.
- Prototipado de asistentes con llamadas a funciones: puede emplearse para probar pipelines de function calling en los que se quiera reducir la longitud del prompt del sistema eliminando las instrucciones de habilidades.
- Comparación de metodologías de ajuste: útil para contrastar autodestilización on-policy (OEL) frente a RL (Skill-GRPO) en tareas de tool calling con modelos de 4.000 millones de parámetros.
- Reproducción de experimentos académicos: al documentarse la semilla, el número de pares y los hiperparámetros, permite replicar el entrenamiento en entornos de investigación.
- Base para ajustes posteriores: al ser un modelo pequeño (4B) en BF16, puede servir como punto de partida para experimentos de destilación o RL en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona los conjuntos de evaluación utilizados (BFCL v3 con bfcl_eval 2025.6.14 y tau2-bench v1.0.1 con simulador GPT-4.1-mini), pero no incluye cifras de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8 GB solo para los pesos (4.022 millones de parámetros a 2 bytes por parámetro), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 4-5 GB para los pesos; en 4 bits, alrededor de 2,5-3 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: A100, H100 o L40S para inferencia en BF16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para BF16 en contextos moderados.
- Cabe en GPU de consumo: sí, en tarjetas con 12-24 GB de VRAM, especialmente con cuantización.
- Opciones de despliegue: transformers (biblioteca declarada), text-generation-inference (etiqueta presente en el repositorio), vLLM y llama.cpp/Ollama mediante conversión a GGUF (no verificada por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-bfcl-oel-ours-full-n334-seed2 | 4.022 M | no disponible | Ajuste BFCL-v3 con internalización OEL y Skill-GRPO | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 | aproximadamente 4.000 M | no disponible en la información | Modelo base instructivo generalista | no disponible en la información | Hugging Face |
| Modelos de la familia Qwen3 con tool calling nativo | variable | variable | Tool calling mediante prompt e instrucciones | variable | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible, ya que el autor no publica métricas. Frente al modelo base, la diferencia principal es el entrenamiento específico sobre BFCL-v3 multi-turno con internalización de habilidades; frente a otros modelos de 4B con tool calling, la propuesta es experimental y sin datos públicos de evaluación.

## Limitaciones y advertencias

- No se declara licencia, lo que impide determinar si el uso comercial está permitido; debe consultarse al autor antes de cualquier despliegue en producción.
- No se especifican los idiomas soportados; se desconoce el comportamiento multilingüe real del ajuste.
- No se publican resultados de benchmarks, por lo que no puede verificarse la mejora frente al modelo base ni frente a alternativas.
- El entrenamiento se limita a 334 pares tarea-habilidad y una sola época, lo que puede provocar sobreajuste al conjunto BFCL-v3 y escasa generalización a otras distribuciones de tareas.
- El modelo está en modo no-thinking, por lo que no dispone de razonamiento extendido; tareas que requieran cadenas de pensamiento largas pueden degradarse.
- Riesgo de alucinación inherente a los modelos de 4.000 millones de parámetros, no cuantificado en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; debe tratarse como artefacto de investigación.
- La internalización de habilidades puede producir llamadas a funciones con argumentos mal formados o habilidades "olvidadas" fuera del dominio de entrenamiento.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-4b-bfcl-oel-ours-full-n334-seed2
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Código de OEL (LMOps): no disponible en la información proporcionada
- BFCL (Berkeley Function Calling Leaderboard): no disponible en la información proporcionada
- tau2-bench: no disponible en la información proporcionada
