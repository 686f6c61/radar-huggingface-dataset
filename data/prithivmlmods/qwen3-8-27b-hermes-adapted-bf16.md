# prithivMLmods/Qwen3.8-27B-hermes-adapted-bf16

## Resumen

Qwen3.8-27B-hermes-adapted-bf16 es un checkpoint autónomo en BF16 publicado por prithivMLmods que fusiona el adaptador LoRA `harness-hub/Qwen3.8-27B-hermes-adapted` sobre el modelo base `Qwen/Qwen3.8-27B`. El resultado es un modelo de 27.781.427.952 parámetros (unos 27,8 mil millones) que puede servirse en cualquier motor de inferencia sin necesidad de soporte para LoRA, conservando el diseño de shards, los nombres de tensores y todos los tensores MTP (multi-token prediction) del modelo original.

El adaptador se entrenó con aprendizaje por refuerzo AsyncGRPO en entornos Harbor/OpenEnv para convertir el modelo en la columna vertebral del agente Hermes en tareas de ingeniería de software y terminal. Según la model card del adaptador, en el marco de Hermes Agent eleva SWE-bench Pro (hard 51) del 29,4% al 43,1% y Terminal-Bench 2.1 del 44,7% al 58,8%, consumiendo menos del 40% de los turnos del modelo base en tareas resueltas y generando aproximadamente la mitad de tokens.

La relevancia actual reside en su orientación a agentes autónomos de código y terminal con decodificación especulativa (tags `mtp`, `speculative-decoding`) y compatibilidad con text-generation-inference. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés. Las cifras de rendimiento fueron medidas sobre el adaptador aplicado al modelo base BF16 y no se han reevaluado sobre este checkpoint fusionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`) con tensores MTP para decodificación especulativa |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint publicado); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (18 shards, repo de 55,6 GB) + chat_template.jinja, config.json, generation_config.json, merges.txt |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.8-27B`, un transformer de la familia Qwen3.5 con capacidad image-text-to-text según el pipeline declarado, y conserva los tensores MTP (multi-token prediction) que habilitan decodificación especulativa. Sobre esa base se aplicó un adaptador LoRA con rango r = 32 y alpha = 64 que afecta a las proyecciones q, k, v, o, gate, up y down. La fusión se realizó con la actualización estándar `W + (alpha/r)·B@A` por tensor en fp32, con conversión posterior a BF16, preservando el layout de shards y los nombres originales.

El entrenamiento del adaptador usó AsyncGRPO (variante asíncrona de Group Relative Policy Optimization) sobre entornos Harbor/OpenEnv, con los datasets `harness-hub/scale800-harbor`, `harness-hub/harness-adapters`, `harness-hub/termgrade-train-harbor` y `ai-and/termgrade-environments`. El objetivo era el uso como backbone de Hermes Agent en tareas de ingeniería de software y terminal, con el modo thinking desactivado tal como se entrenó. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases adicionales de SFT o DPO.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat propia (`chat_template.jinja`).
- Razonamiento orientado a tareas de ingeniería de software y operación de terminal, optimizado mediante RL en entornos Harbor/OpenEnv.
- Ejecución como backbone de agentes (Hermes Agent) con razonamiento multi-paso y uso de herramientas en entornos de terminal.
- Decodificación especulativa mediante tensores MTP, con reducción del número de tokens generados (aproximadamente 2× menos según la model card del adaptador).
- Capacidad image-text-to-text declarada en el pipeline del repositorio.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo thinking: desactivado, coherente con el entrenamiento del adaptador.
- Compatibilidad con text-generation-inference y endpoints compatibles.

## Casos de uso

- Agente autónomo de resolución de incidencias en repositorios: el modelo está entrenado para SWE-bench Pro y puede integrarse como backbone de un agente que lee el repositorio, localiza el fallo, edita archivos y valida el cambio, con menos turnos y tokens que el modelo base.
- Automatización de operaciones en terminal: sirve como motor de un agente que interpreta tareas de administración de sistemas, ejecuta comandos y verifica resultados, aprovechando el entrenamiento específico en Terminal-Bench 2.1.
- Integración en pipelines de CI/CD: dado su formato BF16 estándar y compatibilidad con text-generation-inference, puede desplegarse como servicio de inferencia que un orquestador de CI invoca para tareas de reparación automática de builds o triaje de fallos de test.
- Asistente de desarrollo en IDE o CLI: al ser un checkpoint autónomo sin necesidad de LoRA, se puede servir con motores estándar y conectar a herramientas de edición de código para sugerencias contextualizadas en flujos de trabajo de terminal.
- Evaluación y reproducción de investigación en RL para agentes: el modelo permite reproducir los resultados de AsyncGRPO sobre Harbor/OpenEnv sin tener que gestionar la fusión del adaptador, útil para comparar políticas entrenadas.
- Servicio conversacional de soporte técnico en inglés: la plantilla de chat y el pipeline image-text-to-text permiten conversaciones multi-turno; la ventana de contexto real debe verificarse en `config.json` antes de dimensionar el servicio.
- Prototipado de decodificación especulativa: los tensores MTP conservados permiten experimentar con decodificación especulativa en motores que la soporten para reducir latencia.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card del adaptador y se midieron sobre el adaptador aplicado al modelo base BF16, no sobre este checkpoint fusionado.

| Benchmark | Modelo base (referencia del adaptador) | Con adaptador Hermes | Nota |
|---|---|---|---|
| SWE-bench Pro (hard 51) | 29,4% | 43,1% | Medido bajo Hermes Agent |
| Terminal-Bench 2.1 | 44,7% | 58,8% | Medido bajo Hermes Agent |
| Turnos consumidos | 100% (referencia) | < 40% en tareas resueltas | Respecto al modelo base |
| Tokens generados | 100% (referencia) | ~2× menos | Respecto al modelo base |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni evaluaciones del checkpoint fusionado.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 64-80 GB de VRAM para servicio con contexto moderado.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, o múltiples GPU con tensor parallelism (por ejemplo 2× A100 40 GB o 2× RTX 4090 24 GB con sharding).
- GPU de consumo: no cabe en una única RTX 4090 (24 GB) en BF16; sería necesario cuantizar a 8 o 4 bits, pero no se documentan cuantizaciones oficiales en este repositorio.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles; no se confirma soporte de vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles. La decodificación especulativa vía MTP puede reducir latencia en motores que la soporten, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-hermes-adapted-bf16 | 27,8 B | no disponible | Apache 2.0 | Agentes de código y terminal (RL AsyncGRPO) | Hugging Face, BF16 safetensors |
| Qwen/Qwen3.8-27B (base) | ~27 B | no disponible | Apache 2.0 (según base) | Modelo generalista image-text-to-text | Hugging Face |
| harness-hub/Qwen3.8-27B-hermes-adapted | ~27 B + LoRA r=32 | no disponible | Apache 2.0 | Adaptador LoRA para Hermes Agent | Hugging Face (requiere soporte LoRA) |

No se dispone de datos de benchmarks comparativos con modelos de otros desarrolladores en la información proporcionada; la comparación se limita a las variantes del mismo linaje Qwen3.8-27B.

## Limitaciones y advertencias

- Idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Modo thinking desactivado por diseño de entrenamiento; no debe esperarse razonamiento extendido tipo cadena de pensamiento.
- Las cifras de SWE-bench Pro y Terminal-Bench 2.1 proceden del adaptador y no se han reevaluado en este checkpoint fusionado; pueden diferir.
- Riesgo de alucinación inherente a modelos generativos, especialmente en tareas de código donde puede proponer APIs o comandos inexistentes; requiere validación en el entorno de ejecución.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible.
- Longitud de contexto no declarada; debe consultarse `config.json` antes de diseñar flujos con prompts largos.
- El repositorio tiene 0 descargas y 1 like en el momento de la ficha, lo que indica escasa validación comunitaria del checkpoint fusionado.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen y de los datasets de entrenamiento antes de un uso comercial en producción.
- La fusión en fp32 con conversión a BF16 puede introducir diferencias numéricas menores frente al adaptador original aplicado en tiempo de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/Qwen3.8-27B-hermes-adapted-bf16
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/harness-hub/scale800-harbor
- Dataset de adaptadores: https://huggingface.co/datasets/harness-hub/harness-adapters
- Dataset de entrenamiento de terminal: https://huggingface.co/datasets/harness-hub/termgrade-train-harbor
- Entornos de evaluación: https://huggingface.co/datasets/ai-and/termgrade-environments
- Plantilla de chat: https://huggingface.co/prithivMLmods/Qwen3.8-27B-hermes-adapted-bf16/blob/main/chat_template.jinja
- Configuración: https://huggingface.co/prithivMLmods/Qwen3.8-27B-hermes-adapted-bf16/blob/main/config.json
