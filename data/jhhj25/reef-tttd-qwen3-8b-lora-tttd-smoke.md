# jhhj25/reef-tttd-qwen3-8b-lora-tttd-smoke

## Resumen

reef-tttd-qwen3-8b-lora-tttd-smoke es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo Qwen/Qwen3-8B, desarrollado por jhhj25. Se enmarca en una prueba de humo (smoke test) de un bucle de aprendizaje por refuerzo agéntico llamado reef TTTD (test-time task discovery), construido sobre el framework slime y con backend de entrenamiento Megatron-LM. El objetivo de la publicación es verificar el funcionamiento end-to-end del pipeline (agentes de rollout en entornos aislados, juez programático y un paso de entrenamiento), no obtener un modelo con rendimiento útil.

El adaptador tiene rango LoRA 32 y alfa 32, y se aplica a las proyecciones q, k, v, o, gate, up y down del modelo base. Se entrenó durante un único paso en una tarea pequeña de teoría de grafos (erdos minimum-overlap), con una recompensa de episodio de 0.0 en el paso 0. El repositorio contiene el adaptador exportado en formato PEFT en la carpeta step_0, junto con checkpoints distribuidos de Megatron y tensores de adaptador por ranura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre Qwen/Qwen3-8B (transformer decoder-only) |
| Parametros totales | No disponible |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); además, checkpoints Megatron (distcp) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, no un modelo completo. Se aplica sobre el transformer decoder-only Qwen/Qwen3-8B, con rank 32 y alpha 32, atacando las proyecciones de atención (q, k, v, o) y las capas del MLP (gate, up, down). El entrenamiento se realizó con tensor parallel 2 en el backend de Megatron-LM, dentro del bucle de RL agéntico reef TTTD, que utiliza el framework slime para el rollout de agentes en entornos sandboxed y un juez programático para evaluar las acciones.

Fue una ejecución de un solo paso (single-step smoke run) sobre una tarea de teoría de grafos (erdos minimum-overlap). La recompensa del episodio en el paso 0 fue 0.0, lo que indica que no hubo aprendizaje efectivo; el propósito era verificar que el bucle completo (rollout, evaluación y commit de entrenamiento) funcionara de principio a fin.

## Capacidades

- El adaptador no aporta capacidades nuevas verificadas. Al ser un smoke test con recompensa 0.0, no se ha observado aprendizaje de ninguna tarea.
- El modelo base Qwen/Qwen3-8B es un LLM denso de 8.000 millones de parámetros con capacidades de razonamiento, seguimiento de instrucciones, agentes y multilingüe, según la documentación de Qwen3.
- Soporte de tool calling y agentes: el modelo base lo incluye, pero el adaptador no ha sido evaluado para confirmar estas capacidades.
- Generación de código y matemáticas: no se han realizado pruebas específicas sobre el adaptador.
- Capacidades multilingües: no disponibles en la información del adaptador.
- Visión: no aplicable, es un modelo de texto.

## Casos de uso

- Verificación de pipelines de RL agéntico: el adaptador sirve como referencia para validar que el bucle reef TTTD (rollout, juez, entrenamiento) funciona end-to-end con Megatron-LM.
- Pruebas de integración de LoRA con Qwen3-8B en entornos distribuidos: útil para desarrolladores que quieran comprobar la compatibilidad de PEFT con checkpoints de Megatron.
- Investigación en test-time task discovery (TTTD): permite estudiar el comportamiento del bucle en tareas de teoría de grafos, aunque no haya aprendizaje.
- Desarrollo de infraestructura para RL con juez programático: sirve como caso de uso para depurar y probar el framework slime.
- Evaluación de exportación de adaptadores PEFT desde Megatron: el repo incluye el adaptador en step_0 y los checkpoints de Megatron, lo que permite probar herramientas de conversión.
- Benchmarking de overhead de almacenamiento: el repo completo ocupa 18.6 GB, lo que permite medir el coste de persistir checkpoints distribuidos y adaptadores por ranura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la recompensa del episodio en el paso 0 fue 0.0, pero esto no constituye un benchmark de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible. El adaptador no está pensado para inferencia en producción.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros adaptadores LoRA sobre Qwen3-8B ni resultados comparativos.

## Limitaciones y advertencias

- El adaptador es un smoke test de un solo paso con recompensa 0.0; no se ha aprendido ninguna tarea.
- No se ha evaluado el rendimiento, los sesgos ni las alucinaciones del adaptador.
- El modelo base Qwen/Qwen3-8B puede tener sus propias limitaciones y sesgos; el adaptador no los mitiga.
- El repositorio contiene checkpoints de Megatron de 18.6 GB, lo que puede resultar confuso; el adaptador PEFT se encuentra en la carpeta step_0.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Qwen/Qwen3-8B para asegurar compatibilidad.
- No hay datos de idiomas soportados; si se utiliza en producción, se debe evaluar el multilingüismo del modelo base.

## Enlaces

- https://huggingface.co/jhhj25/reef-tttd-qwen3-8b-lora-tttd-smoke
- https://huggingface.co/Qwen/Qwen3-8B (modelo base)
