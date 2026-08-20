# agentic-ptb/dpsk-v4-flash.h082.sft5.step_800

## Resumen

`agentic-ptb/dpsk-v4-flash.h082.sft5.step_800` es un checkpoint intermedio de un proceso de fine-tuning (SFT) sobre el modelo base `Qwen/Qwen3.5-9B-Base`, publicado por el usuario `agentic-ptb`. Forma parte de un barrido (sweep) de entrenamiento denominado AgentPTB, en el que se explora la celda `dpsk-v4-flash`, cuyo driver es `pi / DeepSeek v4-flash` con un esfuerzo de razonamiento configurado como `thinking`. El nombre sugiere que el objetivo es transferir o emular el estilo de razonamiento de DeepSeek v4-flash sobre la arquitectura de Qwen 3.5 de 9B parámetros.

Se trata de un artefacto de investigación intermedio (paso 800 de un entrenamiento SFT en su quinta iteración, `sft5`), no de un modelo final listo para producción. El repositorio contiene un único shard de pesos en formato `safetensors` con un tamaño de 18,8 GB y 9.409.813.744 parámetros. La model card advierte de un problema en la configuración de tokens EOS: solo se define `eos_token_id = [248044]` y falta el token `248046`, lo que puede afectar a la terminación de secuencias generadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (un shard, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `Qwen/Qwen3.5-9B-Base`, por lo que hereda su arquitectura transformer densa de 9B parámetros. No se dispone de detalles sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni la metodología exacta (si se empleó RLHF, DPO u otra técnica). El nombre del checkpoint (`dpsk-v4-flash`) y el campo `driver` indican que el entrenamiento busca imitar el comportamiento de razonamiento de DeepSeek v4-flash con un nivel de esfuerzo `thinking`, probablemente mediante datos generados por ese modelo o con un objetivo de destilación.

El checkpoint corresponde al paso 800 de la quinta etapa de SFT (`sft5`) de un barrido más amplio. La model card señala que la copia local fue podada del PVC y recuperada desde una copia de seguridad (`msr-spare`), lo que refuerza su carácter de artefacto intermedio de investigación. No se documentan innovaciones técnicas propias más allá del ajuste fino sobre el modelo base.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.5-9B-Base, hereda las capacidades generales de ese modelo, aunque no se han verificado en este checkpoint concreto.
- Razonamiento tipo `thinking`: el entrenamiento está orientado a emular el modo de razonamiento de DeepSeek v4-flash, pero no se ha validado su efectividad.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio, etc.): no disponible.

## Casos de uso

- Investigación experimental: el checkpoint puede usarse para estudiar la evolución del entrenamiento a lo largo del barrido, comparando el paso 800 con otros pasos o con el modelo base.
- Continuación del entrenamiento: al ser un checkpoint intermedio, puede servir como punto de partida para reanudar el SFT o para aplicar técnicas adicionales como DPO o RLHF.
- Análisis de destilación de razonamiento: permite evaluar si el fine-tuning sobre datos de DeepSeek v4-flash transfiere efectivamente el estilo de razonamiento `thinking` a un modelo de 9B.
- Evaluación de estabilidad de tokens EOS: el problema documentado con `eos_token_id` lo convierte en un caso de estudio sobre configuración de tokenizadores en fine-tunes.
- Benchmarking de checkpoints intermedios: útil para medir la curva de rendimiento (loss, métricas) en función del paso de entrenamiento.
- Pruebas de infraestructura: sirve para validar pipelines de despliegue (vLLM, llama.cpp) con modelos de ~9B en entornos de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP16/BF16, el modelo requiere aproximadamente 19 GB de VRAM (9,4B parámetros × 2 bytes). Con cuantización de 8 bits, ~10 GB; con 4 bits, ~5 GB.
- GPU recomendadas: una RTX 4090 (24 GB) o A100 40 GB pueden ejecutar el modelo en FP16 sin cuantizar. GPUs con 16 GB (RTX 4080, V100 16 GB) requieren cuantización de 8 bits o menor.
- Compatibilidad con GPU de consumo: sí, con cuantización (por ejemplo, GGUF de 4 bits) cabe en GPUs de 8 GB como la RTX 3070 o RTX 4060.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Hugging Face Transformers (con `device_map="auto"`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| agentic-ptb/dpsk-v4-flash (este) | 9,4B | no disponible | no disponible | safetensors | Checkpoint intermedio, sin validación |
| Qwen/Qwen3.5-9B-Base | 9,4B | no disponible | no disponible | safetensors | Modelo base, punto de referencia |
| DeepSeek v4-flash (referencia) | no disponible | no disponible | no disponible | no disponible | Modelo que se intenta emular, sin datos publicados |

No se dispone de datos de rendimiento comparativos (MMLU, HumanEval, etc.) para ninguno de los modelos listados.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; puede presentar comportamiento incompleto o inestable en generación.
- Token EOS incompleto: la model card advierte que falta el token `eos_token_id` 248046, lo que puede provocar que el modelo no termine las secuencias correctamente o genere texto sin fin.
- Licencia no especificada: no se puede determinar si es apto para uso comercial; se recomienda contactar al autor antes de cualquier uso fuera de investigación.
- Sin validación de capacidades: no hay benchmarks ni evaluaciones publicadas que confirmen las capacidades de razonamiento o generación.
- Datos de entrenamiento desconocidos: no se informa sobre la composición del dataset, posibles sesgos o calidad de los datos.
- Origen del checkpoint: fue recuperado de una copia de seguridad tras ser podado del almacenamiento principal, lo que sugiere que no se considera un artefacto de alta prioridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/dpsk-v4-flash.h082.sft5.step_800
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
