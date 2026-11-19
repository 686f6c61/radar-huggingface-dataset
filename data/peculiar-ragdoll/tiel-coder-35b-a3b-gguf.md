# peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF

## Resumen

Tiel-Coder-35B-A3B-GGUF es una recuantización dinámica del modelo Ornith-1.5-35B-A3B, publicada por el usuario peculiar-ragdoll. Se distribuye exclusivamente en formato GGUF para llama.cpp y está orientada a programación agéntica y conversaciones multi-turno eficientes en tokens. El modelo base es un MoE (mezcla de expertos) de 34.660.610.688 parámetros totales, con arquitectura derivada de la familia Qwen3.5-MoE, y conserva la torre de visión del modelo original (pipeline image-text-to-text).

La aportación del autor no es un reentrenamiento, sino una recuantización con su propia matriz de importancia (imatrix) y la integración de la plantilla de chat "Sharp" dentro del propio GGUF. Esa plantilla reduce la verbosidad de las respuestas, lo que mejora la calidad percibida en tareas de código y conversación a costa de penalizar el conocimiento enciclopédico. El autor reporta 12 de 25 problemas resueltos en SWE-bench-Live, cifra que iguala a Opus 4.6 en modo medium según sus propias mediciones.

Es relevante ahora porque ofrece un rendimiento de agente de código cercano a modelos propietarios en hardware de consumo (desde 16 GB de RAM+VRAM combinados), con licencia MIT y un KV cache reducido gracias a la arquitectura MoE. El repositorio acumula 356.538 descargas y 444 likes, lo que lo sitúa entre las recuantizaciones de código más populares del ecosistema local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tags: qwen35moe, moe) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (mencionado en la model card para el KV cache) |
| Tipos de cuantizacion | UD-Q2_K_XL, UD-IQ3_XXS, UD-IQ3_S, UD-Q3_K_XL, UD-IQ4_XS, UD-Q4_K_S, UD-Q4_K_XL, UD-Q5_K_S, UD-Q5_K_XL, UD-Q6_K_XL |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es una recuantización, no un entrenamiento nuevo. La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de la familia Qwen3.5, tal como indican los tags `qwen35moe` y `moe`, con 34.660 millones de parámetros totales. La model card no detalla el número de parámetros activos por token ni la composición del dataset de entrenamiento original de Ornith-1.5, por lo que esos datos deben consultarse en la ficha del modelo base.

La innovación técnica de esta publicación es doble. Por un lado, el autor aplica una imatrix propia para una cuantización dinámica ("unsloth-dynamic") que preserva mejor las capas sensibles en los niveles bajos de bits. Por otro, integra la plantilla de chat Sharp dentro del GGUF, que fuerza respuestas más cortas y directas. La model card incluye un brazo de control que aísla el efecto de la plantilla: la misma cuantización con la plantilla original de Ornith obtiene exactamente la misma puntuación que Ornith, lo que demuestra que la pérdida de MMLU-Pro (de 78,0 a 73,7) se debe a la plantilla y no a la cuantización. No se documentan detalles sobre RLHF, DPO ni el volumen de tokens de entrenamiento del modelo base.

## Capacidades

- Generación de texto y conversación multi-turno, con especial énfasis en mantener la utilidad a lo largo de diálogos largos.
- Programación agéntica: resolución de incidencias sobre repositorios reales, edición de ficheros y razonamiento multi-paso sobre código.
- Eficiencia de tokens: la plantilla Sharp reduce la verbosidad, lo que disminuye el coste por tarea en pipelines agénticos.
- Visión: pipeline image-text-to-text, conserva la torre visual del modelo base para entrada de imágenes.
- Multilingüe limitado a inglés y chino según los metadatos de la model card.
- Compatibilidad con endpoints (`endpoints_compatible`) y con el ecosistema llama.cpp.
- No se documenta soporte explícito de tool calling o function calling en la información disponible; debe verificarse contra el modelo base.

## Casos de uso

- Resolución automática de incidencias en repositorios: el modelo está evaluado en SWE-bench-Live, donde resuelve 12 de 25 problemas, por lo que encaja en flujos de triaje y parcheo de bugs con revisión humana posterior.
- Agentes de código en local con GPU de consumo: con la cuantización UD-Q4_K_XL (22,4 GB) cabe en 24-32 GB de VRAM y permite ejecutar bucles agénticos sin depender de API externa.
- Asistente de conversación multi-turno para soporte técnico: obtiene 67,2 en Claw-Eval multi-turno, por encima de su base (65,3), con menos preguntas aclaratorias, lo que reduce la fricción en atención al usuario.
- Automatización de refactorizaciones guiadas por tests: la ventana de 262k tokens permite cargar ficheros completos y trazas de error en el contexto, y el KV cache reducido del MoE (menos de 5 GB en RAM a 16 bits) abarata mantener sesiones largas.
- Procesamiento de capturas y diagramas: al conservar la capacidad image-text-to-text, puede interpretar pantallazos de errores o diagramas de arquitectura junto al código.
- Despliegue en estaciones de trabajo con 16 GB: la variante UD-IQ3_XXS (13,2 GB) es la recomendada por el autor para ese segmento, útil para prototipado y tareas de código de menor complejidad.
- Integración en pipelines de CI/CD como revisor de parches: su velocidad (8,6 minutos de mediana por intento en SWE-bench-Live) y su menor cola de intentos costosos frente a alternativas lo hacen apto para ejecución desatendida.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card. No se han verificado de forma independiente.

| Benchmark | Tiel-Coder-35B-A3B | Ornith-1.5-35B-A3B (base) | Nail (Qwen3.6-35B-A3B) | Qwen3.8-27B | Opus 4.6 (medium) |
|---|---|---|---|---|---|
| SWE-bench-Live (de 25) | 12 | 8 | 9 | 16 | 12 |
| Claw-Eval multi-turno | 67,2 | 65,3 | 60,5 | no disponible | no disponible |
| MMLU-Pro (4-bit) | 73,7 | 78,0 | 84,0 | no disponible | no disponible |
| Tiempo mediano por intento (min) | 8,6 | no disponible | 7,2 | 50,2 | no disponible |
| Tiempo medio por intento (min) | 12,3 | no disponible | 15,7 | no disponible | no disponible |

El autor indica además que Qwen3.6-35B-A3B de referencia resuelve 8 de 25 en SWE-bench-Live con 5,5 minutos por intento, y que Sonnet 5 (medium) resuelve 8. Dirk (Qwen3.8-27B denso) resuelve 15.

## Requisitos de hardware

- VRAM/RAM combinada mínima: 16 GB para UD-Q2_K_XL (12,3 GB) y UD-IQ3_XXS (13,2 GB); el autor desaconseja bajar de UD-Q4 para uso agéntico serio.
- 24 GB: UD-Q3_K_XL (16,8 GB), UD-IQ4_XS (17,7 GB), UD-Q4_K_S (20,9 GB) y, de forma ajustada, UD-Q4_K_XL (22,4 GB).
- 32 GB: UD-Q4_K_XL con holgura, UD-Q5_K_S (24,9 GB) y UD-Q5_K_XL (26,6 GB).
- 48 GB: UD-Q6_K_XL (31,8 GB), prácticamente sin pérdida.
- KV cache: menos de 5 GB en RAM para 262k de contexto a 16 bits, gracias a la arquitectura MoE; el autor recomienda al menos q8_0 para el KV en código agéntico.
- GPU recomendadas: el autor no especifica modelos concretos; los umbrales de memoria indican RTX 4090 (24 GB) para Q4 ajustado, RTX 5090 o A6000 (32-48 GB) para Q5-Q6, y A100/H100 para despliegues multiusuario.
- Despliegue: llama.cpp y cualquier frontend compatible con GGUF; los tags indican compatibilidad con endpoints. No se mencionan vLLM ni TGI, que no consumen GGUF de forma nativa.
- Latencia: 8,6 minutos de mediana y 12,3 de media por intento en SWE-bench-Live, sin especificar la GPU empleada. No se publican cifras de throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench-Live | MMLU-Pro | Licencia | Formato |
|---|---|---|---|---|---|---|
| Tiel-Coder-35B-A3B | 34,7B (MoE) | 262k | 12/25 | 73,7 | MIT | GGUF |
| Ornith-1.5-35B-A3B | 34,7B (MoE) | no disponible | 8/25 | 78,0 | no disponible | safetensors/GGUF |
| Nail-Qwen3.6-35B-A3B | 35B (MoE) | no disponible | 9/25 | 84,0 | no disponible | GGUF |
| Dirk-Qwen3.8-27B | 27B (denso) | no disponible | 15/25 | no disponible | no disponible | GGUF |
| Qwen3.8-27B | 27B (denso) | no disponible | 16/25 | no disponible | no disponible | varios |

La comparativa se limita a los datos publicados por el propio autor; no hay evaluaciones independientes que permitan contrastar estas cifras.

## Limitaciones y advertencias

- Conocimiento enciclopédico degradado: 73,7 en MMLU-Pro frente a 84,0 de Nail y 78,0 de su propio base. No es adecuado para tareas de examen o razonamiento de conocimiento general.
- La plantilla Sharp reduce preguntas aclaratorias (5,1 puntos menos que el base); en peticiones ambiguas puede actuar sin confirmar supuestos.
- Idiomas limitados a inglés y chino según los metadatos; el rendimiento en castellano no está documentado.
- Las cuantizaciones de 2 y 3 bits pierden capacidad real en código agéntico; el autor desaconseja Q2_K_XL salvo como último recurso.
- Riesgo de alucinación no cuantificado: no se publican evaluaciones de factualidad ni de tasa de alucinación.
- Sesgos: no se documenta ningún análisis de sesgos del modelo base ni de la recuantización.
- Todos los benchmarks proceden del autor de la cuantización, con 25 problemas en SWE-bench-Live y 114 conversaciones en Claw-Eval; son muestras pequeñas y no verificadas de forma independiente.
- Licencia MIT, que permite uso comercial, pero las condiciones del modelo base Ornith-1.5 deben verificarse por separado.
- El repositorio ocupa 643,9 GB por acumular todas las cuantizaciones; la descarga debe hacerse fichero a fichero.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante MTP: https://huggingface.co/peculiar-ragdoll/Tiel-Coder-35B-A3B-GGUF-MTP
- Variante CyberTiel (sin censura): https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF
- Plantillas de chat Sharp: https://huggingface.co/peculiar-ragdoll/Qwen-Sharp-Chat-Templates
- Modelo comparativo Nail: https://huggingface.co/peculiar-ragdoll/Nail-Qwen3.6-35B-A3B-GGUF
- Modelo comparativo Dirk: https://huggingface.co/peculiar-ragdoll/Dirk-Qwen3.8-27B-GGUF
