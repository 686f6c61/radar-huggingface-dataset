# agentic-ptb/opus-high-v3.h017.sft-v6.step_4

## Resumen

`agentic-ptb/opus-high-v3.h017.sft-v6.step_4` es un checkpoint intermedio generado durante el experimento **opus-high-v3** del proyecto AgentPTB, una serie de ejecuciones de entrenamiento supervisado (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`. El propio autor lo clasifica como un artefacto de reproducibilidad y estudio cualitativo, y advierte explícitamente en la model card que la ejecución **no produjo ninguna mejora en los pesos entrenados** (etiqueta `negative-results`). No debe inferirse calidad del modelo a partir de su publicación.

El checkpoint corresponde al paso 4 de la fase SFT-v6, dentro de la hora de ejecución h017, y se conserva únicamente para permitir reproducir y analizar por qué el entrenamiento no convergió. Al tratarse de un resultado negativo, no se han documentado capacidades, benchmarks ni casos de uso prácticos. Su interés es exclusivamente investigador, dentro del estudio de fallos en pipelines de fine-tuning agéntico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del checkpoint base `Qwen/Qwen3.5-9B-Base`, que emplea una arquitectura transformer estándar con aproximadamente 9.400 millones de parámetros. No se dispone de detalles sobre la composición del dataset de entrenamiento, el número de tokens utilizados, ni la configuración exacta del proceso de SFT (tasas de aprendizaje, épocas, etc.).

La documentación del proyecto AgentPTB indica que la celda `opus-high-v1` fue la primera ejecución de la variante "opus@high", y que una repetición (`opus-high-v2`) se abortó porque dejó de producir checkpoints válidos y terminó enviando los tensores del modelo base sin cambios tras cinco ejecuciones de SFT con regresión. El presente checkpoint (`opus-high-v3`, paso 4) forma parte de la misma línea de experimentos y, según la model card, no logró mejorar los pesos respecto al base. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- No se han documentado capacidades específicas para este checkpoint.
- Al ser un derivado de Qwen3.5-9B-Base, hereda teóricamente las capacidades generales del modelo base (generación de texto, razonamiento, código), pero no se ha verificado ningún comportamiento tras el entrenamiento.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, ni capacidades multilingües.
- El autor lo presenta como un artefacto de estudio de fallos, no como un modelo funcional.

## Casos de uso

No se recomienda ningún caso de uso práctico para este checkpoint. Dado que el entrenamiento no produjo mejoras y el propio autor lo etiqueta como `negative-results`, su única finalidad es:

- Reproducción de experimentos: permite replicar el pipeline de SFT y verificar por qué no hubo convergencia.
- Análisis de fallos en entrenamiento: sirve para estudiar qué condiciones llevan a que un fine-tuning regrese respecto al modelo base.
- Depuración de pipelines de agentes: dentro del proyecto AgentPTB, puede usarse como punto de comparación para identificar errores en la generación de datos o en la configuración del entrenamiento.

No debe emplearse en producción ni en aplicaciones que requieran calidad de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta ninguna métrica (MMLU, HumanEval, GSM8K, etc.) para este checkpoint, coherente con su carácter de resultado negativo.

## Requisitos de hardware

Dado que el modelo tiene aproximadamente 9.400 millones de parámetros, se pueden estimar requisitos orientativos de inferencia, aunque no se recomienda su uso:

- VRAM estimada: entre 20 y 24 GB en FP16 para inferencia básica (según el tamaño de los pesos).
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) podría ejecutarlo en FP16, o una A100 40GB para mayor margen.
- En cuantización (si se generaran pesos GGUF o INT8), cabría en GPUs de 12-16 GB, pero no hay versiones cuantizadas disponibles.
- Opciones de despliegue: vLLM, llama.cpp o TGI podrían cargar el checkpoint, pero no hay soporte específico documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No existe una comparativa significativa porque este checkpoint no representa un modelo útil. La única referencia razonable es su modelo base:

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen3.5-9B-Base | ~9.4B | no disponible | Apache 2.0 | Modelo base funcional |
| opus-high-v3.h017.sft-v6.step_4 | ~9.4B | no disponible | Apache 2.0 | Checkpoint de investigación, sin mejora |

No se dispone de datos de rendimiento para comparar con otros modelos de tamaño similar (p. ej., Llama 3.1 8B, Mistral 7B).

## Limitaciones y advertencias

- **Resultado negativo**: el entrenamiento no mejoró los pesos; el modelo no ofrece ninguna ventaja sobre Qwen3.5-9B-Base.
- **Sin evaluación**: no hay benchmarks, pruebas de calidad ni validación de capacidades.
- **Riesgo de alucinación y sesgos**: al ser un modelo no ajustado, puede presentar los sesgos del base y una alta tasa de alucinaciones, pero no hay datos que lo confirmen.
- **Uso exclusivo de investigación**: no apto para producción, desarrollo de software, ni aplicaciones comerciales.
- **Información incompleta**: no se especifican longitud de contexto, idiomas, ni detalles del entrenamiento.
- **Licencia Apache 2.0**: permite uso comercial, pero la falta de calidad lo hace irrelevante para ese fin.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/agentic-ptb/opus-high-v3.h017.sft-v6.step_4)
- [Dataset de la ejecución opus-high-v3](https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data)
- [Índice de datasets AgentPTB](https://huggingface.co/datasets/agentic-ptb/INDEX)
- [Modelos de agentic-ptb en HuggingFace](https://huggingface.co/models?other=agentic-ptb)
