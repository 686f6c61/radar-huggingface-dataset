# ram-lexsi/aligntune-testrun-ORPO

## Resumen

Este repositorio contiene un adapter LoRA denominado `aligntune-testrun-ORPO`, publicado por el usuario `ram-lexsi` en HuggingFace. Se trata de un experimento de validación de la librería AlignTune, un toolkit modular de alineación post-entrenamiento desarrollado por Lexsi Labs. El adapter se ha entrenado sobre el modelo base Qwen/Qwen2.5-0.5B, un transformer decoder-only de 0.5 mil millones de parámetros, utilizando el algoritmo ORPO (Odds Ratio Preference Optimization) con el backend TRL de HuggingFace.

El propósito de este artefacto no es ofrecer un modelo listo para producción, sino demostrar el flujo de trabajo de AlignTune: cargar un modelo base, aplicar un algoritmo de optimización de preferencias y publicar el adapter resultante. Al ser un adapter LoRA, su tamaño es reducido y se integra mediante PEFT sobre el modelo base. La relevancia actual radica en que ejemplifica el uso de herramientas de alineación de código abierto sobre modelos pequeños, un área de interés creciente para equipos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B) con adapter LoRA |
| Parametros totales | No disponible (el adapter LoRA añade un número reducido de parámetros, pero no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-0.5B soporta 32 768 tokens, pero no se indica si el adapter modifica este valor) |
| Tipos de cuantizacion | No disponible (el adapter se publica en safetensors, sin cuantizaciones adicionales) |
| Idiomas soportados | No disponibles (dependen del modelo base, que soporta principalmente inglés y chino, pero no se confirma) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen2.5-0.5B, un transformer causal con atención completa, perteneciente a la familia Qwen2.5. Sobre este modelo se ha aplicado un adapter LoRA, que introduce matrices de bajo rango en las capas de atención y feed-forward para adaptar el comportamiento sin modificar los pesos originales. El entrenamiento se ha realizado con el algoritmo ORPO, que combina la optimización de preferencias con la supervisión directa, evitando la necesidad de una fase separada de RLHF. El backend utilizado es TRL (Transformers Reinforcement Learning) de HuggingFace, y la librería AlignTune ha orquestado el proceso.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje ni otros hiperparámetros. Al tratarse de un "testrun", es probable que se haya utilizado un conjunto de datos pequeño y representativo para validar el pipeline, más que para lograr un rendimiento óptimo.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base Qwen2.5-0.5B, que puede generar texto coherente en inglés y chino, aunque con limitaciones propias de su tamaño.
- Razonamiento básico: el modelo base es capaz de resolver tareas sencillas de razonamiento, pero no se ha evaluado específicamente este adapter.
- Soporte de tool calling: no disponible (el modelo base no lo soporta de forma nativa y no se indica que el adapter lo añada).
- Soporte de agentes: no disponible.
- Capacidades multilingües: no confirmadas; el modelo base tiene soporte limitado a inglés y chino, pero no se especifica para este adapter.
- Capacidades especiales: ninguna documentada.

## Casos de uso

- Validación de pipelines de alineación: este adapter sirve como prueba de concepto para verificar que AlignTune puede ejecutar ORPO sobre un modelo pequeño y generar un artefacto descargable. Un desarrollador puede replicar el flujo para aprender a usar la librería.
- Experimentación con preferencias en modelos pequeños: investigadores que quieran estudiar el efecto de ORPO en modelos de 0.5B pueden utilizar este adapter como punto de partida, aunque deberían entrenar sus propios adapters con datos controlados.
- Integración en entornos de desarrollo: al ser un adapter LoRA, se puede cargar con PEFT en cualquier entorno que soporte transformers, permitiendo probar rápidamente el comportamiento del modelo base ajustado sin necesidad de un servidor dedicado.
- Educación y demostraciones: útil para talleres o cursos sobre fine-tuning y alineación de LLMs, ya que el tamaño reducido permite ejecutarlo en hardware modesto.
- Comparación de algoritmos: junto con otros adapters publicados por el mismo autor (por ejemplo, `aligntune-testrun-SDPO`), permite comparar el efecto de distintos algoritmos de preferencia sobre el mismo modelo base.
- Desarrollo de prototipos de bajo coste: aunque no está pensado para producción, puede servir para esbozar ideas de asistentes conversacionales en entornos con restricciones de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este adapter.

## Requisitos de hardware

- VRAM estimada: al ser un adapter LoRA sobre un modelo de 0.5B, la inferencia requiere aproximadamente 1-2 GB de VRAM en FP16, dependiendo de la longitud de contexto y del batch.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1650, RTX 3050 o superior. También puede ejecutarse en CPU con lentitud aceptable para pruebas.
- Compatibilidad con GPU de consumo: sí, cabe en prácticamente cualquier GPU consumer moderna.
- Opciones de despliegue: se puede cargar con `transformers` + `peft` en Python, o exportar a GGUF para usarlo con llama.cpp u Ollama, aunque no se proporcionan archivos GGUF en el repositorio.
- Latencia y throughput: no disponibles; al ser un modelo pequeño, la latencia será baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros adapters o modelos de la misma categoría. El único dato comparable es el modelo base Qwen2.5-0.5B, que tiene 0.5B parámetros y 32k de contexto, pero no se han publicado métricas de rendimiento para este adapter. Alternativas como otros adapters LoRA entrenados con DPO o PPO sobre el mismo base podrían ser comparables, pero no hay datos públicos.

## Limitaciones y advertencias

- Es un artefacto de prueba: el nombre "testrun" indica que no ha sido validado para uso real; no debe emplearse en producción.
- Sesgos y alucinaciones: al derivar de un modelo base pequeño, es propenso a generar respuestas incoherentes o inventadas, especialmente en tareas complejas.
- Cobertura lingüística limitada: el modelo base Qwen2.5-0.5B está optimizado para inglés y chino; otros idiomas, incluido el español, pueden tener un rendimiento deficiente.
- Licencia no especificada: no se indica la licencia del adapter ni del modelo base, lo que impide conocer restricciones de uso comercial.
- Sin documentación de entrenamiento: no se detallan los datos utilizados ni los hiperparámetros, lo que dificulta la reproducibilidad y la evaluación de sesgos.
- Dependencia del modelo base: el adapter requiere cargar Qwen/Qwen2.5-0.5B, que tiene sus propias limitaciones de capacidad y sesgos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ram-lexsi/aligntune-testrun-ORPO
- Sitio web de AlignTune: https://aligntune.lexsi.ai/
- Repositorio GitHub de AlignTune: https://github.com/Lexsi-Labs/aligntune
- Página de herramientas de Lexsi Labs: https://lexsi.ai/tools/aligntune
- Adapter relacionado (SDPO): https://huggingface.co/ram-lexsi/aligntune-testrun-SDPO
