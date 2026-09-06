# jhhj25/reef-tttd-qwen3-coder-30b-a3b-lora-tttd-smoke-30b

## Resumen

El modelo `reef-tttd-qwen3-coder-30b-a3b-lora-tttd-smoke-30b` es un adaptador LoRA desarrollado por `jhhj25` sobre el modelo base `Qwen/Qwen3-Coder-30B-A3B-Instruct`, un modelo de mezcla de expertos (MoE) de 30B parámetros totales y 3B activos. El adaptador se entrenó mediante un bucle de aprendizaje por refuerzo agéntico (RL) denominado "reef TTTD" (test-time task discovery), construido sobre `slime` y con backend de entrenamiento `Megatron-LM`. La ejecución fue una prueba de humo de un solo paso para verificar el funcionamiento end-to-end del pipeline sobre un modelo MoE, no para lograr un rendimiento real en la tarea. La recompensa del episodio en el paso 0 fue 0.0, lo que refleja que no se espera ninguna capacidad funcional del adaptador. El repositorio contiene el adaptador en formato PEFT (`step_0/`), un checkpoint distribuido de Megatron y tensores de adaptador por slot.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-Coder-30B-A3B-Instruct (MoE) |
| Parámetros totales | no disponible (adaptador LoRA, no modelo completo) |
| Parámetros activos | no disponible (solo si es MoE; el adaptador no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT) y checkpoints Megatron (distcp) |

Nota: el modelo base Qwen3-Coder-30B-A3B-Instruct tiene 30B parámetros totales y 3B activos, pero estos datos no corresponden al adaptador.

## Arquitectura y entrenamiento

El adaptador es una LoRA de rango 32 y alpha 32 que modifica las proyecciones q, k, v y o del modelo base. Se entrenó con un único paso de un bucle RL agéntico implementado sobre `slime`, con backend de entrenamiento distribuido `Megatron-LM`. La tarea utilizada fue un problema de teoría de grafos (erdos minimum-overlap) en un entorno sandbox, con un juez programático. La ejecución no tenía como objetivo mejorar el rendimiento, sino validar la integración completa del pipeline: despliegue de agentes, evaluación programática y un commit de entrenamiento. No se especifican datos numéricos de tokens de entrenamiento, composición del dataset ni técnicas de alineación adicionales.

## Capacidades

- No se han demostrado capacidades funcionales específicas del adaptador, ya que la ejecución fue una prueba de humo de un solo paso con recompensa 0.0.
- El modelo base Qwen3-Coder-30B-A3B-Instruct, sobre el que se aplica, soporta generación de texto y código, razonamiento y tool calling, pero no se ha verificado que el adaptador preserve o mejore estas capacidades.
- No hay información sobre soporte de agentes, modo de pensamiento, visión o audio en el adaptador.

## Casos de uso

- Verificación de pipelines de RL agéntico: el adaptador sirve como artefacto de prueba para validar que el bucle completo de entrenamiento con refuerzo funciona sobre un modelo MoE de gran tamaño.
- Pruebas de integración de Megatron-LM con PEFT: permite comprobar la exportación de adaptadores LoRA desde un backend distribuido a formato HuggingFace.
- Investigación en test-time task discovery (TTTD): el adaptador documenta una ejecución experimental de la receta reef TTTD, útil para estudiar la viabilidad del enfoque.
- Desarrollo de infraestructura de entrenamiento distribuido: el checkpoint de Megatron y los tensores por slot sirven para depurar el guardado y la restauración de estados en entornos distribuidos.
- Depuración de sistemas de rollout con agentes en sandbox: la ejecución de un solo paso permite analizar el comportamiento de los agentes y del juez programático en una tarea controlada.
- Evaluación de la aplicabilidad de LoRA a modelos MoE grandes: el adaptador proporciona un caso de estudio sobre cómo aplicar y exportar LoRA a un modelo con arquitectura de mezcla de expertos.

Advertencia: ninguno de estos casos de uso es una aplicación final para producción; el adaptador no es un modelo de inferencia funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la recompensa del episodio en el paso 0, que fue 0.0, pero no constituye una evaluación de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base Qwen3-Coder-30B-A3B-Instruct.
- GPU recomendadas: no disponible.
- Si cabe en GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el adaptador requiere el modelo base y la librería PEFT.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables para el mismo modelo base. No se puede establecer una comparativa directa.

## Limitaciones y advertencias

- El adaptador se entrenó en una única ejecución de humo con recompensa 0.0, por lo que no se ha validado su rendimiento en ninguna tarea.
- No es adecuado para uso en producción ni para inferencia real.
- No se han evaluado sesgos, alucinaciones ni comportamientos de seguridad.
- No se dispone de información sobre los idiomas soportados.
- La licencia Apache 2.0 aplica al adaptador, pero el modelo base puede tener condiciones adicionales.
- El adaptador puede no preservar las capacidades del modelo base, ya que el entrenamiento fue mínimo y sin objetivo de rendimiento.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/jhhj25/reef-tttd-qwen3-coder-30b-a3b-lora-tttd-smoke-30b
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Colección Qwen3-Coder: https://huggingface.co/collections/Qwen/qwen3-coder
