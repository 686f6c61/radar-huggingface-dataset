# agentic-ptb/sol-max-v2.h021.pi-agent-sft-v12.step_250

## Resumen

El modelo `agentic-ptb/sol-max-v2.h021.pi-agent-sft-v12.step_250` es un checkpoint intermedio de un barrido de entrenamiento (sweep) del proyecto AgentPTB, publicado por el usuario `agentic-ptb`. Se trata de un fine-tuning del modelo base `Qwen/Qwen3.5-9B-Base` mediante un proceso de SFT (supervised fine-tuning) orientado a agentes, identificado como `pi-agent-sft-v12`. El checkpoint corresponde a la hora 21.35 de un run de 100 horas, dentro de la celda `sol-max-v2`, cuyo driver es Codex / gpt-5.6-sol con esfuerzo de razonamiento `max`.

El modelo tiene 9.409.813.744 parámetros (9,4B) y un tamaño de repo de 18,8 GB, lo que sugiere pesos en bf16. Está basado en la arquitectura `Qwen3_5ForConditionalGeneration`, que incluye un tower de visión, aunque el checkpoint se sirve como modelo de solo texto. Su relevancia radica en que es un artefacto de investigación para estudiar la dinámica de entrenamiento de agentes, no un modelo listo para producción. No se dispone de licencia, idiomas soportados ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con tower de visión (Qwen3_5ForConditionalGeneration), basado en Qwen/Qwen3.5-9B-Base |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16, 18,8 GB) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `Qwen/Qwen3.5-9B-Base`, un transformer denso de 9,4B parámetros con un tower de visión integrado (`Qwen3_5ForConditionalGeneration`). Según la model card, el tower de visión está presente en los pesos, pero el checkpoint se sirve como modelo de solo texto; para cargarlo en vLLM es necesario indicar `--limit-mm-per-prompt '{"image": 0, "video": 0}'` porque `prime-rl` no exporta `preprocessor_config.json`.

El entrenamiento corresponde a un barrido de AgentPTB, donde el checkpoint se generó en la hora 21.35 de un run de 100 horas. El proceso usa un driver basado en Codex / gpt-5.6-sol con esfuerzo de razonamiento `max`, y el fine-tuning es de tipo SFT (`pi-agent-sft-v12`). No se especifican los datos de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO. El `eos_token_id` es `[248046]`, correspondiente a `<|im_end|>`, el token de fin de turno de la plantilla de chat de Qwen3.5, lo que garantiza que el modelo detiene la generación correctamente.

## Capacidades

- Generación de texto autoregresiva con plantilla de chat de Qwen3.5 (token `<|im_end|>` correcto).
- Fine-tuning orientado a agentes (`pi-agent-sft`), lo que sugiere capacidades de razonamiento multi-paso y uso de herramientas, aunque no hay documentación detallada.
- Arquitectura con tower de visión presente en los pesos, pero sin configuración de preprocesado exportada; en la práctica se usa como modelo de solo texto.
- No se dispone de información sobre soporte de tool calling, function calling, capacidades multilingües o modos especiales de razonamiento.

## Casos de uso

- Investigación en dinámica de entrenamiento de agentes: el checkpoint está diseñado para mapearse sobre la curva de rendimiento a lo largo del run (la hora `h021` indica el punto temporal), por lo que es útil para estudiar cómo evoluciona el modelo durante el SFT.
- Reproducción de experimentos de AgentPTB: permite replicar o comparar resultados del barrido `sol-max-v2` en la misma celda y con el mismo driver.
- Análisis de la influencia del esfuerzo de razonamiento del driver (Codex / gpt-5.6-sol @ max) en la calidad del fine-tuning.
- Evaluación de checkpoints intermedios: al ser un paso 250 de un total mayor, sirve para medir la progresión del entrenamiento y decidir puntos de parada.
- Pruebas de compatibilidad con vLLM y otros servidores de inferencia, especialmente en lo relativo a la carga de modelos con tower de visión sin preprocesador.
- Desarrollo de agentes experimentales en entornos controlados, donde no se requiera estabilidad ni rendimiento garantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni similares, y no hay comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: al menos 20-24 GB (9,4B parámetros × 2 bytes + overhead de activaciones y KV cache). Una GPU con 24 GB (p. ej., RTX 3090/4090) podría ser suficiente para secuencias cortas.
- Para cuantización 4-bit (no publicada en el repo), se estima un consumo de 5-6 GB, lo que permitiría ejecución en GPUs de 8 GB, pero no hay archivos GGUF ni AWQ disponibles.
- GPU recomendadas: A100 40GB, H100, RTX 4090 o superiores para inferencia cómoda en bf16.
- Opciones de despliegue: vLLM (con la bandera `--limit-mm-per-prompt`), llama.cpp (si se generan GGUF), Ollama (requiere conversión previa), TGI.
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud de contexto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. Como referencia estructural, se puede comparar con el modelo base `Qwen/Qwen3.5-9B-Base` (misma arquitectura y tamaño, sin fine-tuning) y con otros fine-tunings de 9B orientados a agentes, pero no hay métricas publicadas para este checkpoint. La licencia y disponibilidad del modelo base tampoco están especificadas en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio de un run de entrenamiento, no un modelo final; su rendimiento puede ser inferior al de checkpoints posteriores.
- No se especifica licencia, por lo que su uso comercial es incierto y requiere verificar los términos del autor.
- La arquitectura incluye un tower de visión, pero sin `preprocessor_config.json`; cargarlo en vLLM sin la bandera adecuada provoca fallos.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas; al ser un modelo experimental, estos riesgos no están caracterizados.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un artefacto de investigación sin validación externa.
- No se garantiza la estabilidad de la generación ni la corrección de las respuestas; no es adecuado para producción sin una evaluación exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-max-v2.h021.pi-agent-sft-v12.step_250
- Búsqueda de modelos de agentic-ptb: https://huggingface.co/models?other=agentic-ptb
