# ram-lexsi/aligntune-testrun-SDPO

## Resumen

Este repositorio contiene un adapter LoRA generado mediante la librería AlignTune, un toolkit de alineación y ajuste fino desarrollado por Lexsi Labs. El modelo se construye sobre el base `Qwen/Qwen2.5-0.5B-Instruct`, un modelo de lenguaje pequeño de 0.5 mil millones de parámetros optimizado para instrucciones. Según la información disponible, se trata de una ejecución de prueba (testrun) que emplea el algoritmo SDPO (un método de optimización de preferencias) con el backend TRL de Hugging Face.

La relevancia de este artefacto reside en que demuestra el uso de AlignTune para realizar ajuste fino con métodos de preferencia sobre modelos open source. Al ser un adapter LoRA, el peso total es mínimo (el repositorio ocupa 0.0 GB) y se debe cargar sobre el modelo base para su uso. No se proporcionan detalles sobre el dataset de entrenamiento, el rendimiento ni las capacidades específicas del adapter; es un experimento de validación de la herramienta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre Qwen2.5-0.5B-Instruct (transformer decoder) |
| Parámetros totales | No disponible (adapter LoRA, peso adicional al modelo base) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (hereda la del modelo base, 32.768 tokens en Qwen2.5) |
| Tipos de cuantización | No disponible (formato adapter safetensors) |
| Idiomas soportados | No disponibles (heredados del modelo base, que soporta múltiples idiomas) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adapter LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre `Qwen/Qwen2.5-0.5B-Instruct`. La arquitectura subyacente es la de un transformer causal con atención, tal como se define en la familia Qwen2.5. El adapter fue entrenado con la librería AlignTune, que permite aplicar algoritmos de optimización de preferencias como DPO, PPO, SimPO, entre otros; en este caso se usó SDPO (Sequence Direct Preference Optimization, una variante de DPO). El backend empleado es TRL (Transformers Reinforcement Learning).

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni la configuración exacta de hiperparámetros. El repositorio indica que es una ejecución de prueba (testrun), por lo que es probable que el ajuste sea mínimo y no se haya evaluado formalmente.

## Capacidades

- Al ser un adapter sobre Qwen2.5-0.5B-Instruct, hereda las capacidades del modelo base: generación de texto, seguimiento de instrucciones, razonamiento básico y soporte multilingüe (aunque el modelo base está optimizado principalmente para inglés y chino).
- No se documentan capacidades adicionales específicas del adapter, como tool calling, agentes o visión.
- No se indica soporte para function calling ni modos de razonamiento extendido.
- La documentación del repositorio no menciona ninguna capacidad especial más allá del ajuste de preferencias.

## Casos de uso

- **Evaluación de AlignTune**: sirve como ejemplo práctico para desarrolladores que quieran verificar el flujo de trabajo de AlignTune con SDPO en un modelo pequeño.
- **Prototipado de alineación**: permite experimentar con técnicas de optimización de preferencias en un entorno de bajo coste computacional.
- **Investigación en alineamiento**: investigadores pueden analizar el efecto de SDPO en modelos pequeños comparando el comportamiento del adapter con el modelo base.
- **Integración en pipelines de entrenamiento**: al ser un adapter LoRA, se puede combinar con otros adapters o usar como punto de partida para experimentos de composición.
- **Pruebas de despliegue en entornos con recursos limitados**: al ser un modelo pequeño, se puede ejecutar en CPU o en GPUs de gama baja, lo que facilita pruebas de inferencia.
- **Verificación de compatibilidad con TRL y PEFT**: sirve para comprobar la carga correcta de adapters con `AutoPeftModelForCausalLM`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni comparativas con otros modelos.

## Requisitos de hardware

- Al ser un adapter LoRA sobre un modelo de 0.5B, los requisitos de memoria son reducidos.
- El modelo base Qwen2.5-0.5B-Instruct requiere aproximadamente 1 GB de VRAM en FP16 (sin cuantización). El adapter añade un coste despreciable.
- Se puede ejecutar en GPUs de consumo como NVIDIA GTX 1060 (6 GB) o superiores, así como en CPU con suficiente RAM (≈4-8 GB).
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se convierte a GGUF), o mediante transformers con PEFT.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, se espera una inferencia rápida en hardware moderno.

## Comparativa con modelos similares

No disponible. No se proporcionan comparaciones con otros adapters o modelos de la misma categoría. Se puede comparar con el modelo base `Qwen2.5-0.5B-Instruct` y con otros adapters de ajuste de preferencias, pero no hay datos publicados.

## Limitaciones y advertencias

- El modelo es un artefacto de prueba, no un modelo de producción. No se ha validado su calidad ni su seguridad.
- No se especifica la licencia, por lo que su uso comercial está sujeto a la licencia del modelo base Qwen2.5 (Apache 2.0) y a la de los pesos del adapter, que no está definida.
- El adapter no incluye el modelo base; es necesario descargar `Qwen/Qwen2.5-0.5B-Instruct` por separado.
- No se garantiza que el adapter funcione correctamente con versiones de transformers o PEFT distintas a las usadas en el entrenamiento.
- Riesgo de alucinación y sesgos heredados del modelo base, que no han sido mitigados ni evaluados en este adapter.
- No se documentan limitaciones de idioma ni de contexto específicas para este adapter.

## Enlaces

- Repositorio de Hugging Face: [ram-lexsi/aligntune-testrun-SDPO](https://huggingface.co/ram-lexsi/aligntune-testrun-SDPO)
- Sitio web de AlignTune: https://aligntune.lexsi.ai/
- Repositorio de AlignTune en GitHub: https://github.com/Lexsi-Labs/aligntune
- Página de AlignTune en Lexsi Labs: https://lexsi.ai/tools/aligntune
- Documentación de AlignTune (overview): https://aligntune.lexsi.ai/examples/overview/
