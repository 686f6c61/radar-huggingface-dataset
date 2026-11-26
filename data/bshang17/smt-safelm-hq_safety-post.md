# bshang17/smt-safelm-hq_safety-post

## Resumen

`smt-safelm-hq_safety-post` es un ajuste fino (post-entrenamiento) del modelo SmolLM2-1.7B-Instruct, publicado por el usuario bshang17 en Hugging Face. El modelo parte de un punto de control intermedio de un proceso de entrenamiento denominado Safe-Mid (paso 28.610) y se post-entrena durante una época sobre una mezcla de UltraChat-200k, WildGuardMix filtrado y WildJailbreak, con un total de 891.332 ejemplos. El objetivo declarado es reforzar el comportamiento seguro del asistente conversacional sin perder capacidad de diálogo.

Se distribuye en dos variantes de precisión: `final-hf/` en bf16, que incluye los ficheros del tokenizador y la plantilla de chat de SmolLM2-1.7B-Instruct con token EOS `<|endoftext|>`, y `final-fp32/` con los mismos pesos en fp32. El repositorio ocupa 10,9 GB y emplea formato safetensors. No se han publicado resultados de benchmarks, licencia ni idiomas soportados en la información disponible.

La relevancia del modelo reside en su enfoque: aplicar un post-entrenamiento de seguridad sobre un modelo pequeño (1,7 mil millones de parámetros) con datos de moderación y jailbreak, un caso de uso habitual para despliegues en entornos con recursos limitados o para investigación sobre alineamiento de modelos compactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda la de SmolLM2-1.7B-Instruct) |
| Parametros totales | 1,7 mil millones (según el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 y fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16 en `final-hf/`, fp32 en `final-fp32/`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del SmolLM2-1.7B-Instruct, un transformer decoder-only de 1,7 mil millones de parámetros desarrollado por Hugging Face. El punto de partida es el endpoint de mid-training Safe-Mid en el paso 28.610, sobre el que se aplica un post-entrenamiento de una época con 891.332 ejemplos compuestos por UltraChat-200k, WildGuardMix filtrado y WildJailbreak. El entrenamiento se realizó en fp32 con autocast a bf16, tasa de aprendizaje de 2e-5 y tamaño de lote global de 56.

La mezcla de datos combina instrucciones conversacionales generales (UltraChat-200k) con ejemplos de moderación de seguridad (WildGuardMix filtrado) y de intentos de jailbreak (WildJailbreak), lo que sugiere un objetivo de alineamiento orientado a robustez frente a prompts adversarios. No se detalla en la información disponible si hubo RLHF, DPO u otras técnicas de optimización posteriores, ni el número total de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base SmolLM2-1.7B-Instruct.
- Comportamiento de seguridad reforzado mediante post-entrenamiento sobre WildGuardMix y WildJailbreak.
- Plantilla de chat y tokenizador compatibles con SmolLM2-1.7B-Instruct (EOS `<|endoftext|>`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Moderación y filtrado de contenido en asistentes conversacionales: el modelo se ha post-entrenado con WildGuardMix filtrado y WildJailbreak, por lo que puede emplearse como capa de respuesta segura en pipelines de atención al cliente donde se requiere rechazar solicitudes dañinas.
- Investigación sobre alineamiento de modelos pequeños: al ser un ajuste fino de 1,7B con datos de seguridad documentados, sirve como base para experimentos reproducibles sobre robustez frente a jailbreaks en entornos con recursos limitados.
- Despliegue en dispositivos con poca VRAM: con 1,7 mil millones de parámetros, el modelo puede ejecutarse en GPU de consumo, lo que lo hace adecuado para prototipos de asistentes locales con requisitos de seguridad.
- Evaluación comparativa de técnicas de post-entrenamiento: la separación entre pesos bf16 y fp32 permite analizar el impacto de la precisión en el comportamiento del modelo.
- Generación de respuestas en chatbots de dominio acotado: la mezcla con UltraChat-200k aporta capacidad conversacional general que puede adaptarse a dominios específicos mediante ajuste adicional.
- Base para pipelines de red-teaming: el modelo puede utilizarse como objetivo o como filtro en pruebas de resistencia a prompts adversarios, dado su entrenamiento con WildJailbreak.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 1,7B parámetros, los pesos en bf16 ocupan aproximadamente 3,4 GB y en fp32 unos 6,8 GB, a lo que hay que sumar la memoria para el contexto y el runtime.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; por tamaño, un modelo de 1,7B en bf16 es susceptible de caber en GPU de consumo con suficiente VRAM, pero no se ha verificado.
- Opciones de despliegue: no disponible en la información proporcionada (no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| smt-safelm-hq_safety-post | 1,7B | no disponible | no disponible | Hugging Face (repo bshang17) |
| SmolLM2-1.7B-Instruct | 1,7B | no disponible | no disponible | Hugging Face (HuggingFaceTB) |
| Alternativas de 1-2B con post-entrenamiento de seguridad | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No se ha publicado licencia, lo que impide determinar las condiciones de uso comercial; debe consultarse al autor antes de cualquier despliegue en producción.
- No se especifican los idiomas soportados; el comportamiento multilingüe es incierto.
- No hay benchmarks publicados que permitan validar la calidad del ajuste ni compararlo con el modelo base.
- Al ser un ajuste fino sobre un modelo de 1,7B, es previsible una capacidad de razonamiento y conocimiento limitada en comparación con modelos de mayor tamaño, aunque no se aportan datos que lo cuantifiquen.
- El post-entrenamiento con datos de seguridad puede introducir rechazos excesivos (over-refusal) en solicitudes legítimas; no se documenta ninguna evaluación al respecto.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño; no se ha evaluado en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bshang17/smt-safelm-hq_safety-post
- Modelo base SmolLM2-1.7B-Instruct: no disponible en la información proporcionada
- Paper, blog o repositorio asociado: no disponible en la información proporcionada
