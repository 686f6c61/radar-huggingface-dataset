# prithivMLmods/Qwen3.8-27B-hermes-adapted-GGUF

## Resumen

Qwen3.8-27B-hermes-adapted-GGUF es la versión cuantizada en formato GGUF de un checkpoint de 27.320.697.856 parámetros derivado de `Qwen/Qwen3.8-27B`. El autor de la cuantización es prithivMLmods, mientras que el checkpoint base adaptado (`harness-hub/Qwen3.8-27B-hermes-adapted`) fue producido por harness-hub fusionando un adaptador LoRA entrenado con AsyncGRPO sobre entornos Harbor/OpenEnv. El objetivo declarado es convertir el modelo en la columna vertebral del agente Hermes para tareas de ingeniería de software y uso de terminal.

La relevancia del modelo reside en su especialización: según la model card del adaptador, este ajuste eleva SWE-bench Pro (hard 51) del 29,4% al 43,1% y Terminal-Bench 2.1 del 44,7% al 58,8%, además de reducir a menos del 40% los turnos del modelo base en tareas resueltas y generar aproximadamente la mitad de tokens. Estas cifras corresponden al adaptador evaluado sobre el modelo base en BF16 y no han sido revalidadas sobre este checkpoint fusionado ni sobre las cuantizaciones GGUF.

La versión GGUF incorpora soporte de Multi-Token Prediction (MTP) para decodificación especulativa integrada en los propios pesos, lo que permite acelerar la inferencia local sin necesidad de un modelo borrador separado. Se distribuye bajo licencia Apache 2.0, con archivos que van desde 15,8 GB (Q4_K_S) hasta 29 GB (Q8_0), más un proyector multimodal BF16 de 931 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B) con cabezas MTP para decodificación especulativa; incluye proyector multimodal (mmproj) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q8_0; proyector mmproj en BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el base adaptado se distribuye también en BF16 safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.8-27B` y se especializa mediante un adaptador LoRA con r = 32 y alpha = 64 que afecta a las proyecciones q, k, v, o, gate, up y down. El adaptador se entrenó con aprendizaje por refuerzo AsyncGRPO en entornos Harbor/OpenEnv, con el modo de razonamiento (thinking) desactivado, tal como se usa en entrenamiento. La fusión en el checkpoint BF16 aplica la actualización estándar `W + (alpha/r)·B@A` por tensor en fp32 y vuelve a BF16, preservando la disposición de shards, los nombres de tensores y todos los tensores MTP del modelo base.

Los datasets citados en la model card son `harness-hub/scale800-harbor`, `harness-hub/harness-adapters`, `harness-hub/termgrade-train-harbor` y `ai-and/termgrade-environments`. No se especifica el número de tokens de entrenamiento ni la composición detallada del corpus. La innovación técnica destacable es la integración de Multi-Token Prediction en los pesos GGUF: cabezas adicionales que predicen varios tokens futuros en una sola pasada, habilitando decodificación especulativa sin modelo borrador externo. La cuantización se realizó con llama.cpp.

## Capacidades

- Generación de texto conversacional y razonamiento orientado a tareas de ingeniería de software.
- Ejecución de tareas de terminal y agentes multi-paso (entrenado explícitamente para Terminal-Bench y SWE-bench Pro).
- Capacidades multimodales de imagen a texto mediante el proyector mmproj-bf16 (pipeline image-text-to-text).
- Decodificación especulativa nativa vía MTP, sin modelo borrador separado.
- Integración con llama.cpp y text-generation-inference según los tags del repositorio.
- Soporte declarado para flujos de agentes (tags: agents, harbor, openenv, hermes).
- Modo thinking desactivado por diseño, alineado con el entrenamiento.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Automatización de tareas de terminal: el modelo puede ejecutar secuencias de comandos y resolver incidencias de shell en entornos controlados, aprovechando su entrenamiento específico en Terminal-Bench 2.1 y la reducción de turnos necesarios.
- Reparación de bugs en repositorios: integrado en un agente tipo Hermes, puede localizar y parchear defectos en bases de código, con el respaldo del incremento medido en SWE-bench Pro (hard 51) del 29,4% al 43,1%.
- Asistente de CI/CD: al soportar tool calling y decodificación especulativa MTP, puede insertarse en pipelines para diagnosticar fallos de build y proponer parches con menor latencia.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_S (15,8 GB) y Q4_K_M (17 GB) permiten ejecución en GPUs de consumo con 24 GB de VRAM mediante llama.cpp.
- Análisis de capturas y documentación técnica: con el proyector mmproj puede procesar imágenes junto a texto, útil para interpretar errores mostrados en pantalla o diagramas.
- Agentes autónomos de soporte técnico: la reducción de turnos y de tokens generados (aproximadamente 2× menos) abarata conversaciones multi-turno en producción.
- Evaluación e investigación en RL para agentes: los datasets y el pipeline AsyncGRPO documentados sirven de base para reproducir o extender experimentos de entrenamiento con refuerzo en entornos de terminal.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al adaptador evaluado sobre el modelo base en BF16, no sobre este checkpoint fusionado ni sobre las cuantizaciones GGUF.

| Benchmark | Modelo base | Con adaptador Hermes |
|---|---|---|
| SWE-bench Pro (hard 51) | 29,4% | 43,1% |
| Terminal-Bench 2.1 | 44,7% | 58,8% |
| Turnos usados en tareas resueltas | referencia | < 40% del base |
| Tokens generados | referencia | ~2× menos |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~16 GB para Q4_K_S, ~17 GB para Q4_K_M, ~19 GB para Q5_K_S, ~19,6 GB para Q5_K_M y ~29 GB para Q8_0, más ~1 GB del proyector mmproj si se usa visión.
- GPU recomendadas: A100 40/80 GB y H100 para Q8_0 y despliegues de alta concurrencia; RTX 4090 (24 GB) para Q4_K_M, Q5_K_M y Q8_0 en modo single-GPU.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y GPUs con 24 GB para cuantizaciones Q4 y Q5; Q4_K_S puede caber en GPUs de 16-20 GB con offload parcial.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, text-generation-inference y endpoints compatibles según los tags del repositorio.
- Latencia y throughput: no disponibles de forma numérica; el soporte MTP de decodificación especulativa está orientado a reducir la latencia frente a decodificación autoregresiva estándar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B-hermes-adapted-GGUF | 27,3B | no disponible | Agentes de terminal y SWE | Apache 2.0 | GGUF |
| Qwen/Qwen3.8-27B (base) | 27,3B | no disponible | Propósito general | no disponible en la información | safetensors |
| harness-hub/Qwen3.8-27B-hermes-adapted (BF16) | 27,3B | no disponible | Agentes de terminal y SWE | Apache 2.0 | safetensors BF16 |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en castellano no está garantizado.
- El modo thinking está desactivado por diseño de entrenamiento; forzarlo puede degradar el comportamiento respecto a lo esperado.
- Las cifras de SWE-bench Pro y Terminal-Bench 2.1 provienen del adaptador sobre el base BF16 y no se han revalidado sobre este checkpoint fusionado ni sobre las cuantizaciones GGUF, por lo que pueden diferir.
- Las cuantizaciones Q4 y Q5 introducen pérdida de calidad frente a BF16; Q8_0 es la opción de mayor fidelidad disponible.
- Riesgo de alucinación inherente a modelos generativos, especialmente en tareas de código y terminal donde una acción errónea puede tener efectos destructivos; se recomienda sandboxing.
- No se documentan sesgos específicos ni la composición del dataset de entrenamiento, lo que limita la evaluación de riesgos.
- No se especifica la longitud de contexto soportada, un dato crítico para agentes con historiales largos.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que no hay evidencia de uso en producción.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantías y de evaluación independiente exige validación propia antes de desplegar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/Qwen3.8-27B-hermes-adapted-GGUF
- Modelo base adaptado: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Dataset scale800-harbor: https://huggingface.co/datasets/harness-hub/scale800-harbor
- Dataset harness-adapters: https://huggingface.co/datasets/harness-hub/harness-adapters
- Dataset termgrade-train-harbor: https://huggingface.co/datasets/harness-hub/termgrade-train-harbor
- Dataset termgrade-environments: https://huggingface.co/datasets/ai-and/termgrade-environments
