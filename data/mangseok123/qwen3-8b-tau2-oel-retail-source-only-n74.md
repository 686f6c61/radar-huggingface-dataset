# MANGSEOK123/qwen3-8b-tau2-oel-retail-source-only-n74

## Resumen

qwen3-8b-tau2-oel-retail-source-only-n74 es un ajuste fino del modelo Qwen3-8B (en su modo no-thinking) publicado por el usuario MANGSEOK123 en Hugging Face. El modelo aplica una técnica de internalización de habilidades mediante autodestilación on-policy (OPSD, on-policy self-distillation) sobre el benchmark tau2-bench en su dominio retail (versión 1.0.1). El objetivo es que el modelo estudiante aprenda a resolver tareas conversacionales de atención al cliente minorista sin necesidad de recibir la habilidad explícita en el system prompt, imitando el comportamiento de un profesor congelado que sí la tiene.

El entrenamiento se realizó con el código base OEL (LMOps) y utilizó 74 pares de habilidad-tarea extraídos aleatoriamente (semilla 42) de un total de 518 habilidades, sin filtrado. Cada par empareja una habilidad con su tarea de origen. El estudiante resuelve cada tarea sin la habilidad, mientras que una copia congelada del modelo inicial con la habilidad en el system prompt actúa como profesor. La pérdida es una KL inversa a nivel de token sobre los 256 tokens más probables del estudiante.

Con 8.190.735.360 parámetros y pesos en BF16 (16,4 GB de repositorio), el modelo hereda la arquitectura y la ventana de contexto de Qwen3-8B. Su relevancia radica en que explora una vía poco habitual para especializar modelos en dominios conversacionales concretos: en lugar de un ajuste supervisado clásico, emplea destilación on-policy para transferir habilidades procedimentales de un profesor al estudiante. No obstante, la información pública disponible es muy limitada: no se especifican licencia, idiomas ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento usa prompt <= 8192 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only denso de aproximadamente 8,19 mil millones de parámetros. El ajuste fino se realiza en el modo no-thinking del modelo base. La innovación principal no está en la arquitectura, sino en el procedimiento de entrenamiento: autodestilación on-policy (OPSD) con el código base OEL (LMOps). Se extrajeron 518 habilidades del benchmark tau2-bench retail (v1.0.1) y se seleccionaron 74 pares habilidad-tarea de forma uniforme y aleatoria con semilla 42, sin filtrado. Cada habilidad se empareja con su propia tarea de origen.

Durante el entrenamiento, el estudiante resuelve cada tarea sin la habilidad en el contexto, con temperatura 0,7 y un simulador de usuario basado en GPT-4.1-mini. El profesor es una copia congelada del modelo inicial que sí recibe la habilidad en el system prompt. La pérdida es una KL inversa a nivel de token calculada sobre los 256 tokens más probables del estudiante. Se entrenó durante 1 época con 8 pares por actualización, optimizador AdamW con learning rate constante de 3e-6, weight decay 0,01 y recorte de gradiente 1,0. Los límites por turno son de 8192 tokens de prompt y 1024 de respuesta. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a tareas de atención al cliente en el dominio retail.
- Internalización de habilidades procedimentales: el modelo aprende a ejecutar tareas que originalmente requerían una habilidad explícita en el system prompt sin recibirla.
- Razonamiento de tareas y planificación dentro de diálogos con el simulador de usuario (tau2-bench).
- Herencia de las capacidades generales de Qwen3-8B en modo no-thinking (generación de texto y conversación).
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este ajuste concreto.
- Capacidades de agente y razonamiento multi-paso: el entrenamiento se centra en tareas de tau2-bench, que implican interacción con herramientas y estados, pero no se detalla su alcance final.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible (el ajuste se realiza en modo no-thinking).

## Casos de uso

- Atención al cliente minorista automatizada: el modelo está entrenado específicamente sobre tau2-bench retail, por lo que puede gestionar conversaciones de soporte con devoluciones, cambios, cancelaciones y consultas de pedidos, aplicando procedimientos internos sin necesidad de inyectarlos manualmente en el prompt.
- Internalización de políticas de empresa en asistentes conversacionales: en lugar de mantener las habilidades en el system prompt, el equipo puede destilarlas en los pesos del modelo, reduciendo la longitud del contexto y la exposición de reglas internas.
- Evaluación de técnicas de destilación on-policy: sirve como caso de estudio reproducible (semilla 42, 74 pares, OEL/LMOps) para investigadores que quieran comparar OPSD con ajuste supervisado clásico en dominios de diálogo.
- Prototipado de agentes de soporte con simulador de usuario: el modelo puede integrarse en pipelines de evaluación con GPT-4.1-mini como usuario simulado para medir la retención de habilidades tras la internalización.
- Base para ajustes posteriores en dominios verticales: al heredar Qwen3-8B, puede servir como punto de partida para especializaciones adicionales en comercio electrónico, banca o telecomunicaciones.
- Investigación sobre retención de habilidades y olvido catastrófico: permite estudiar cuánto de la habilidad internalizada se conserva fuera del conjunto de 74 pares de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB; en 4 bits, alrededor de 4,5-5,5 GB (estimaciones a partir del tamaño de parámetros, no verificadas para este ajuste).
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para producción en BF16; RTX 4090 (24 GB) para BF16 con contexto limitado o cuantización.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en BF16 con contexto moderado, y en GPUs de 12-16 GB si se cuantiza.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repositorio).
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-8b-tau2-oel-retail-source-only-n74 | 8,19 B | no disponible | tau2-bench retail (OPSD) | no disponible | Hugging Face |
| Qwen/Qwen3-8B | 8,19 B | no disponible en esta ficha | Generalista | no disponible en esta ficha | Hugging Face |
| Ajustes SFT sobre tau2-bench | variable | variable | Diálogo con herramientas | variable | no disponible |
| Modelos retail especializados de 7-8 B | ~7-8 B | variable | Atención al cliente | variable | no disponible |

La comparación cuantitativa con alternativas no está disponible: no se han publicado métricas de tau2-bench para este ajuste ni para modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste se limita a 74 pares de habilidad-tarea del dominio retail de tau2-bench; el rendimiento fuera de ese dominio no está documentado.
- Riesgo de olvido catastrófico: al entrenar solo 1 época sobre un subconjunto pequeño, puede degradarse parte de las capacidades generales de Qwen3-8B.
- Sesgos: no disponibles; no se documenta ninguna evaluación de sesgos.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones específicas para este ajuste.
- Licencia no disponible: no se puede confirmar el uso comercial; debe verificarse con el autor antes de desplegarlo en producción.
- Idiomas no disponibles: no se especifica el soporte multilingüe del ajuste.
- Reproducibilidad limitada: depende del código OEL (LMOps), del simulador GPT-4.1-mini y de la semilla 42; no se publican los 74 pares exactos en la información disponible.
- Sin métricas publicadas: no hay resultados de benchmarks que permitan validar la retención de habilidades ni comparar con el modelo base.
- Modelo de investigación: con 0 descargas y 0 likes en el momento de la consulta, no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MANGSEOK123/qwen3-8b-tau2-oel-retail-source-only-n74
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Benchmark tau2-bench: no disponible en la información proporcionada
- Código OEL (LMOps): no disponible en la información proporcionada
- Paper de OPSD: no disponible en la información proporcionada
