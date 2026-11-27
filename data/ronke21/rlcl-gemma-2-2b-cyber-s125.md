# ronke21/rlcl-gemma-2-2b-cyber-s125

## Resumen

`ronke21/rlcl-gemma-2-2b-cyber-s125` es un ajuste fino (fine-tune) del modelo `google/gemma-2-2b` publicado por el usuario ronke21 en Hugging Face. Por los tags del repositorio (`rlcl`, `forgetting`, `lora-merged`) se trata de un experimento de investigación sobre aprendizaje continuo y olvido catastrófico: el sufijo "rlcl" apunta a técnicas de regularización o consolidación de pesos, "cyber" sugiere un dominio de especialización en ciberseguridad y "s125" podría indicar el paso o semilla del experimento. Los pesos se han fusionado con la base tras un entrenamiento LoRA.

El modelo conserva la arquitectura Gemma 2 de Google (transformer decoder-only con atención alterna local/global y soft-capping) y el tamaño de 2.614.341.888 parámetros del original. El repositorio pesa 5,3 GB en safetensors, lo que corresponde a los pesos en precisión nativa (probablemente bfloat16). El acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargarlo.

Es relevante como artefacto de investigación más que como modelo de producción: no hay descargas ni "likes", no se declara licencia ni idiomas soportados, y la información pública es mínima. Su interés está en documentar cómo un ajuste fino LoRA fusionado sobre Gemma 2 2B afecta al olvido de capacidades previas, un problema central en el despliegue de modelos especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), atención alterna local/global con soft-capping |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la ficha (la base Gemma 2 soporta 8.192 tokens) |
| Tipos de cuantizacion | no disponible; al ser safetensors en bf16/fp16 se puede cuantizar a GGUF/AWQ mediante herramientas externas |
| Idiomas soportados | no disponibles (heredados de Gemma 2, pero no declarados) |
| Licencia | no disponible (la base Gemma 2 usa Gemma Terms of Use) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Gemma 2 2B: un transformer decoder-only con normalización RMSNorm, activaciones GeGLU, atención con RoPE y un esquema de atención alterna entre capas locales (ventana deslizante) y globales, además de soft-capping en los logits para estabilizar el entrenamiento. No hay innovaciones arquitectónicas propias en este repositorio; el modelo es un fine-tune del checkpoint oficial de Google.

El entrenamiento declarado en los tags es un LoRA posteriormente fusionado (`lora-merged`) con una técnica etiquetada como `rlcl` y orientada a mitigar el `forgetting` (olvido catastrófico). No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF/DPO. El dominio "cyber" sugiere un corpus de ciberseguridad, pero no hay documentación pública que lo confirme.

## Capacidades

- Generación de texto conversacional, heredada de Gemma 2 2B.
- Especialización probable en terminología y tareas de ciberseguridad (inferida del sufijo "cyber"; no documentada).
- Razonamiento básico y respuesta a instrucciones de la base, potencialmente degradados por el fine-tune.
- Soporte de tool calling / function calling: no disponible de forma nativa en Gemma 2 2B; requeriría plantillas externas.
- Capacidades de agente y razonamiento multi-paso: limitadas por el tamaño de 2B y no documentadas.
- Capacidades multilingües: no declaradas; la base Gemma 2 es multilingüe pero este fine-tune no lo especifica.
- Modo "thinking", visión o audio: no disponibles.

## Casos de uso

- Investigación sobre olvido catastrófico: comparar las respuestas del modelo base y de este checkpoint en tareas generales para medir cuánto conocimiento se ha perdido tras el LoRA fusionado. Es el uso más coherente con los tags del repositorio.
- Experimentos de especialización en ciberseguridad: evaluar si un fine-tune de 2B mejora en clasificación de CVEs, explicación de vulnerabilidades o redacción de informes técnicos, siempre con validación humana.
- Generación de texto asistida en entornos con recursos limitados: al tener 2,6B de parámetros, cabe en GPU de consumo y sirve para prototipos de chat o resumen en local.
- Base para nuevos fine-tunes: al ser un checkpoint fusionado en safetensors, se puede reutilizar como punto de partida con PEFT/LoRA para otros dominios.
- Evaluación de pipelines de despliegue: probar TGI o vLLM con un modelo gated de pequeño tamaño para validar flujos de autenticación y carga.
- Docencia y reproducibilidad: ejemplo práctico de cómo un LoRA fusionado altera el comportamiento de un modelo base de Google, útil en cursos de ajuste fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: unos 5,3 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica 7-8 GB para contexto corto.
- Cuantización a 8 bits: ~2,7 GB de pesos; a 4 bits: ~1,4 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) para bf16; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más, y en 4 bits incluso en 6 GB.
- Opciones de despliegue: transformers, text-generation-inference (etiqueta `text-generation-inference` presente), vLLM, llama.cpp/Ollama tras convertir a GGUF.
- Latencia y throughput: no disponibles; para un 2B en una RTX 4090 se espera un throughput de decenas a centenares de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ronke21/rlcl-gemma-2-2b-cyber-s125 | 2,61B | no disponible | no disponible | gated, 0 descargas |
| google/gemma-2-2b | 2,61B | 8.192 tokens | Gemma Terms of Use | público |
| google/gemma-2-2b-it | 2,61B | 8.192 tokens | Gemma Terms of Use | público |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128K tokens | Llama 3.2 Community License | gated |

El modelo solo se diferencia de `google/gemma-2-2b` por el fine-tune; sin benchmarks publicados no es posible afirmar que mejore en ninguna tarea frente a la base o frente a la versión instruct.

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir uso comercial; además, al derivar de Gemma 2, quedan sujetas las Gemma Terms of Use de Google.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que complica la automatización de descargas en CI/CD.
- Sin documentación de entrenamiento: se desconocen dataset, hiperparámetros y metodología exacta de "rlcl"; la reproducibilidad es nula.
- Riesgo de olvido catastrófico: el propio tag `forgetting` indica que el fine-tune puede haber degradado capacidades generales de la base.
- Riesgo de alucinación: un modelo de 2B especializado en un dominio técnico puede generar referencias, CVEs o comandos plausibles pero incorrectos; requiere verificación.
- Idiomas no declarados: no se garantiza un comportamiento correcto en castellano ni en otros idiomas distintos del inglés.
- Sin benchmarks ni métricas de seguridad: no hay evaluación de sesgos ni de robustez frente a prompts maliciosos.
- Uso en ciberseguridad: un modelo especializado puede producir contenido de doble uso; conviene aplicar filtros y políticas de uso aceptable.

## Enlaces

- Hugging Face: https://huggingface.co/ronke21/rlcl-gemma-2-2b-cyber-s125
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Gemma 2 (blog de Google): https://blog.google/technology/developers/google-gemma-2/
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
