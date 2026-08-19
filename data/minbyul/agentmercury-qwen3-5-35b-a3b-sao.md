# Minbyul/AgentMercury-Qwen3.5-35B-A3B-SAO

## Resumen

AgentMercury-Qwen3.5-35B-A3B-SAO es un checkpoint del modelo Qwen3.5-35B-A3B, desarrollado por Minbyul, post-entrenado mediante aprendizaje por refuerzo (RL) agéntico sobre entornos MCP (Model Context Protocol). El objetivo es mejorar la capacidad del modelo para completar tareas multi-paso de investigación y escritura contra herramientas empresariales sintéticas (email, chat, calendario, CRM, ticketing, etc.), donde el éxito se mide por el estado final del entorno y no por el texto generado. Este checkpoint pertenece a la familia AgentMercury, pero se distingue por usar el objetivo SAO (single-rollout, critic-based) en lugar del baseline grupal típico de GRPO, lo que permite un entrenamiento más eficiente en episodios largos.

La arquitectura base es un modelo de lenguaje multimodal MoE con 35 mil millones de parámetros totales y 3 mil millones activos, 256 expertos y 40 capas híbridas que combinan atención gated con un mezclador lineal Gated DeltaNet. El entrenamiento RL se realizó sobre 38.670 tareas distribuidas en 3.865 entornos MCP sintéticos, con un presupuesto máximo de 20 turnos de herramientas y 24.576 tokens por episodio. El checkpoint corresponde al paso 159 de 200 pasos de entrenamiento planificados, y muestra una mejora significativa en la recompensa media (0,649 frente a 0,348 de la política base) y una reducción drástica de la tasa de truncamiento (0,047 frente a 0,444).

La relevancia de este modelo radica en que demuestra una alternativa práctica al RL agéntico con baseline grupal: al usar un critic aprendido y asignación de crédito por token (con omisión de tokens de observación), se elimina la barrera de sincronización entre rollouts y se acelera el entrenamiento en episodios de duración variable. Para desarrolladores e investigadores interesados en agentes autónomos con tool-use, este checkpoint ofrece una base sólida y reproducible para tareas de automatización empresarial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (atención gated + Gated DeltaNet), 256 expertos, 40 capas |
| Parametros totales | 34.660.610.688 |
| Parametros activos | 3.000.000.000 (aprox., según denominación A3B) |
| Longitud de contexto | no disponible (episodio de entrenamiento limitado a 24.576 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, Qwen3.5-35B-A3B, es un transformer MoE con 256 expertos y 40 capas híbridas que combinan atención gated con un mezclador lineal Gated DeltaNet. Esta arquitectura híbrida permite un equilibrio entre capacidad de razonamiento y eficiencia computacional, activando solo 3.000 millones de parámetros por token. El modelo base es multimodal (visión-lenguaje) y soporta tool-use, pero el checkpoint AgentMercury se centra exclusivamente en tareas de texto agéntico.

El post-entrenamiento utiliza el objetivo SAO (arXiv:2607.07508), que sustituye el baseline grupal de GRPO por un critic aprendido con ventaja generalizada (GAE) a nivel de token, omitiendo los tokens de observación para asignar crédito solo a los tokens generados por la política. La configuración incluye: un solo rollout por prompt, batch global de 128 prompts, critic inicializado desde el modelo base con la ruta de mezcla de tokens congelada (atención gated y Gated DeltaNet), 20 pasos iniciales de pre-entrenamiento del critic, 2 épocas de critic por paso de política, y un surrogate de región de confianza desacoplado con máscara de gradiente (ε_low 0,2 / ε_high 0,28). La recompensa se calcula mediante un juez LLM basado en rúbricas sobre la trayectoria, combinado con aserciones sobre el estado final del entorno, y se aplica un multiplicador de comportamiento que penaliza la repetición de frases, la generación posterior a la respuesta y la truncación degenerada.

El entrenamiento se ejecutó en 3 nodos con 8 GPUs cada uno (actor, critic y rollout asíncronos), en precisión bfloat16, con optimizador Adam (lr actor 1e-6, lr critic 5e-6) y sin warmup para el actor. Los pesos publicados corresponden al paso 159, donde la recompensa media alcanzó 0,649 (frente a 0,348 de la política base), la tasa de efectos completos pasó de 0,008 a 0,047, y la tasa de truncamiento se redujo de 0,444 a 0,047.

## Capacidades

- Ejecución de tareas agénticas multi-paso: planifica, busca en el entorno y actúa hasta completar la tarea sin intervención del usuario, con hasta 20 turnos de herramientas.
- Uso de herramientas MCP: integra 10-26 herramientas por tarea (media 16,2), incluyendo email, chat, calendario, drive, HR, CRM y ticketing.
- Razonamiento y toma de decisiones con recompensa densa: el modelo optimiza la fracción de efectos requeridos logrados, no solo la respuesta final.
- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-35B-A3B (razonamiento, código, matemáticas, etc.), aunque el entrenamiento RL se centra en el comportamiento agéntico.
- Multilingüismo: el modelo base soporta múltiples idiomas, pero este checkpoint solo declara inglés como idioma de entrenamiento.
- Capacidad de tool calling: soporta llamadas a funciones y protocolo MCP de forma nativa tras el RL.

## Casos de uso

- Automatización de atención al cliente: el modelo puede gestionar conversaciones multi-turno con clientes, consultando sistemas CRM y de ticketing vía MCP, resolviendo incidencias completas (crear, actualizar o cerrar tickets) sin supervisión humana. Su entrenamiento en entornos con estado cambiante lo hace adecuado para tareas donde el resultado debe verificarse en el sistema.
- Asistente de gestión de proyectos: puede actuar sobre calendarios, asignar tareas, enviar correos y actualizar tableros Kanban a partir de una instrucción en lenguaje natural, planificando la secuencia de acciones y ejecutándolas con herramientas MCP.
- Investigación y redacción de informes: dado un tema y una fuente de datos (drive, bases de conocimiento), el modelo busca la información relevante, la sintetiza y redacta un documento final, verificando que todos los efectos requeridos (archivos creados, permisos asignados) se hayan aplicado.
- Automatización de recursos humanos: puede procesar solicitudes de vacaciones, altas o bajas de empleados, consultando el sistema de RRHH y ejecutando los cambios necesarios, con validación del estado final.
- Agente de operaciones de TI: ante una incidencia, el modelo investiga en el sistema de ticketing, consulta logs o documentación, y ejecuta acciones de resolución (reiniciar servicios, escalar, etc.) dentro del presupuesto de turnos.
- Pipeline de generación de contenido con verificación: el modelo puede redactar contenido (newsletters, publicaciones) y luego publicarlo o enviarlo mediante herramientas MCP, asegurando que la acción se completó correctamente en el sistema de destino.
- Evaluación de agentes y benchmarks: dado su diseño con recompensa densa y critic aprendido, puede servir como modelo de referencia para investigar métodos de RL agéntico de rollout único en entornos MCP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo reporta métricas internas del entrenamiento RL:

| Metrica | Politica base (pasos 0-19) | Paso 159 |
|---|---|---|
| Recompensa (fraccion de efectos requeridos) | 0,348 | 0,649 |
| Tasa de efectos completos | 0,008 | 0,047 |
| Tasa de generacion degenerada | 0,000 | 0,000 |
| Tasa de truncamiento (presupuesto agotado) | 0,444 | 0,047 |
| Longitud media de respuesta | ~9.700 tokens | ~12.900 tokens |

Estas métricas indican una mejora sustancial en la finalización de tareas agénticas, pero no permiten comparar con otros modelos en benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 69,3 GB (coincide con el tamaño del repositorio). Para cargar el modelo completo en memoria se necesitan al menos 80 GB de VRAM (una GPU A100 80GB o H100), o varias GPUs de menor capacidad (por ejemplo, 2× RTX 4090 con 24 GB cada una, si se usa paralelismo de tensores).
- GPU recomendadas: A100 80GB, H100, o clústeres con paralelismo de expertos (EP) para aprovechar la arquitectura MoE con 3B activos. En consumer, una RTX 4090 (24 GB) no puede cargar el modelo completo en bf16; sería necesario cuantizar a 4 bits o usar offloading.
- Opciones de despliegue: al ser un modelo transformers estándar, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). Para uso agéntico, se recomienda integrarlo con un framework MCP y un orquestador que gestione los turnos de herramientas.
- Latencia y throughput: no se dispone de datos medidos. Dado que activa solo 3B parámetros por token, la latencia por token debería ser comparable a la de un modelo de 3B, pero la carga de los 34,66B en memoria limita el throughput en hardware sin suficiente VRAM. En una A100 80GB, se podría esperar un throughput de decenas de tokens por segundo, aunque sin datos oficiales.

## Comparativa con modelos similares

No se dispone de benchmarks públicos para comparar directamente con otros modelos agénticos. La comparación estructural con el modelo base y otros miembros de la familia AgentMercury es la siguiente:

| Modelo | Parametros totales | Parametros activos | Contexto | Entrenamiento RL | Licencia |
|---|---|---|---|---|---|
| AgentMercury-Qwen3.5-35B-A3B-SAO | 34,66B | 3B | no disponible | SAO (single-rollout + critic) | Apache 2.0 |
| AgentMercury-Qwen3.5-35B-A3B (grupo) | 34,66B | 3B | no disponible | GRPO (8 rollouts, baseline grupal) | Apache 2.0 |
| AgentMercury-Qwen3.5-4B | ~4B | no disponible | no disponible | GRPO | Apache 2.0 |
| Qwen3.5-35B-A3B (base) | 34,66B | 3B | no disponible | Sin RL agéntico | Apache 2.0 |

La principal diferencia entre el checkpoint SAO y el de baseline grupal es el método de estimación de ventajas: SAO usa un critic aprendido con GAE por token y omisión de observaciones, mientras que el otro usa la media de recompensa de 8 rollouts. Esto afecta a la eficiencia del entrenamiento y al comportamiento en episodios largos, pero no hay datos comparativos de rendimiento final.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés (campo `language: en`). Aunque el modelo base Qwen3.5 es multilingüe, el RL agéntico puede degradar el rendimiento en otros idiomas.
- El entrenamiento se realizó en entornos MCP sintéticos con dominios específicos (email, CRM, etc.). El rendimiento en entornos reales con herramientas no vistas puede ser inferior.
- La tasa de efectos completos es baja (0,047 en el paso 159), lo que indica que el modelo aún falla en la mayoría de las tareas complejas. No es adecuado para producción sin supervisión humana.
- La recompensa se basa en un juez LLM, que puede introducir sesgos o inconsistencias en la evaluación. No se ha validado la calidad del juez frente a evaluadores humanos.
- El checkpoint es un paso intermedio (159 de 200) del entrenamiento. Los pesos finales podrían comportarse de manera diferente.
- No se han publicado benchmarks estándar (MMLU, HumanEval, etc.), por lo que no se puede evaluar su rendimiento general en tareas no agénticas.
- El tamaño del repositorio (69,3 GB) requiere hardware de gama alta para inferencia local; no es adecuado para despliegues en dispositivos con poca memoria.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5 puede tener restricciones adicionales; se debe verificar la licencia del modelo base original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Minbyul/AgentMercury-Qwen3.5-35B-A3B-SAO
- Colección AgentMercury: https://huggingface.co/collections/Minbyul/agentmercury
- Modelo base Qwen3.5-35B-A3B: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Paper SAO (arXiv:2607.07508): https://arxiv.org/abs/2607.07508
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Entrada de LM Studio para Qwen3.5-35B-A3B: https://lmstudio.ai/models/qwen/qwen3.5-35b-a3b
