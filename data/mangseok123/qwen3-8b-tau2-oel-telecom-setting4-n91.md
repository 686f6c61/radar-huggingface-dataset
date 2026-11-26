# MANGSEOK123/qwen3-8b-tau2-oel-telecom-setting4-n91

## Resumen

qwen3-8b-tau2-oel-telecom-setting4-n91 es un ajuste fino del modelo Qwen3-8B desarrollado por el usuario MANGSEOK123. Se trata de un experimento de investigación centrado en la internalización de habilidades (skill internalization) sobre el benchmark tau2-bench, concretamente en el dominio de telecomunicaciones y en la configuración "setting4" con 91 pares de tarea-habilidad. El objetivo es que el modelo aprenda a resolver tareas conversacionales de atención al cliente sin necesidad de que la habilidad se le proporcione explícitamente en el system prompt.

La técnica empleada es la autodestilación en política (on-policy self-distillation, OPSD), implementada mediante el framework OEL (LMOps). El modelo estudiante resuelve cada tarea sin la habilidad en el prompt, mientras que un profesor congelado (copia del modelo inicial) la tiene disponible. El modelo base es Qwen3-8B en modo no-thinking, con 8.190.735.360 parámetros y pesos en BF16.

El modelo tiene un carácter marcadamente experimental: no cuenta con licencia declarada, no especifica idiomas soportados y no presenta descargas ni interacciones en Hugging Face. Es relevante para investigadores interesados en destilación de habilidades, agentes conversacionales y evaluación en tau2-bench, no como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B, modo no-thinking) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (prompt de entrenamiento <= 8192 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B en modo no-thinking, un transformer denso de aproximadamente 8.200 millones de parámetros. Sobre esta base se aplica autodestilación en política (OPSD) con el código de OEL (LMOps). El estudiante resuelve cada tarea del dominio telecom de tau2-bench (v1.0.1) sin la habilidad en el system prompt, mientras que el profesor es una copia congelada del modelo inicial que sí la incluye. La pérdida es una KL inversa a nivel de token sobre los 256 tokens más probables del estudiante.

El entrenamiento utilizó 91 pares tarea-habilidad validados (habilidades con utilidad > 0, configuración "Full"), 1 época y 8 pares por actualización. Se usó AdamW con learning rate constante de 3e-6, weight decay de 0.01 y grad clipping de 1.0. Cada turno se limita a un prompt de hasta 8192 tokens y una respuesta de hasta 1024 tokens. El estudiante opera con temperatura 0.7 y un simulador de usuario basado en GPT-4.1-mini. Los pesos se publican en BF16.

## Capacidades

- Generación de texto conversacional multi-turno en el dominio de atención al cliente de telecomunicaciones.
- Internalización de habilidades: el modelo aprende a aplicar procedimientos y políticas sin que se le indiquen explícitamente en el prompt.
- Razonamiento orientado a tareas de tau2-bench: resolución de incidencias, consulta de información y aplicación de reglas de negocio.
- Soporte de tool calling y function calling heredado de Qwen3-8B (no validado específicamente en este ajuste).
- Capacidades multilingües heredadas de Qwen3-8B (no declaradas por el autor).
- Modo no-thinking: respuestas directas sin cadena de razonamiento explícita.

## Casos de uso

- Investigación en destilación de habilidades: permite comparar el rendimiento del estudiante sin habilidad en el prompt frente al profesor con habilidad, midiendo la internalización efectiva en tau2-bench telecom.
- Evaluación de agentes conversacionales en dominios de telecomunicaciones: sirve como checkpoint para reproducir experimentos de tau2-bench v1.0.1 con la configuración setting4 y 91 pares.
- Estudio de OPSD y KL inversa: útil para analizar el efecto de la pérdida token-level reverse KL sobre los top-256 tokens en la retención de políticas de negocio.
- Baseline para ajustes posteriores: punto de partida para experimentos con más épocas, más pares o distintas configuraciones de temperatura y simulador de usuario.
- Análisis de robustez conversacional: permite estudiar cómo se degrada o mantiene la habilidad internalizada ante variaciones en el prompt del usuario.
- Reproducción de pipelines OEL/LMOps: referencia práctica para validar la implementación del código de entrenamiento con Qwen3-8B y BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 24 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB; en 4 bits: alrededor de 5-6 GB (estimaciones según el tamaño de parámetros, no verificadas para este checkpoint).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para BF16 con contexto largo; RTX 4090 24 GB para BF16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 24 GB en BF16 con contexto limitado, y en RTX 3090/4080 con cuantización 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama mediante conversión a GGUF (no verificadas para este checkpoint).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| qwen3-8b-tau2-oel-telecom-setting4-n91 | 8,19 B | no disponible (entrenamiento <= 8192) | no disponible | Hugging Face, 0 descargas | Ajuste experimental OPSD sobre tau2-bench telecom |
| Qwen/Qwen3-8B | 8,19 B | no disponible en la información | no disponible en la información | Hugging Face (modelo base) | Modelo base en modo thinking y no-thinking |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Modelo experimental sin licencia declarada: no se puede asumir uso comercial permitido.
- Idiomas soportados no declarados; el ajuste se realizó sobre tareas en el dominio telecom de tau2-bench, presumiblemente en inglés.
- Riesgo de sobreajuste a las 91 tareas de entrenamiento y al simulador GPT-4.1-mini; el comportamiento fuera de ese dominio no está validado.
- Sin resultados de benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base.
- Sin descargas ni validación comunitaria: no hay señales de calidad por parte de terceros.
- La internalización de habilidades puede degradar capacidades generales de Qwen3-8B; no se documenta evaluación de olvido catastrófico.
- El modo no-thinking limita el razonamiento explícito en tareas complejas.
- El límite de 8192 tokens de prompt y 1024 de respuesta por turno en entrenamiento puede no reflejar el contexto máximo real del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-8b-tau2-oel-telecom-setting4-n91
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- tau2-bench: no disponible en la información proporcionada
- OEL (LMOps): no disponible en la información proporcionada
- Paper de referencia: no disponible en la información proporcionada
