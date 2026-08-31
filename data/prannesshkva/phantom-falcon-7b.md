# Prannesshkva/Phantom-Falcon-7B

## Resumen

Phantom-Falcon-7B es una distribución del modelo Falcon-Mamba-7B, un State Space Model (SSM) desarrollado por Prannesshkva, que incorpora de forma nativa un motor de aceleración llamado `phantom-cache`. Este motor combina un árbol de prefijos Radix para caché de prompts compartidos y cuantización dinámica simétrica INT8 de los estados recurrentes, con el objetivo de reducir la latencia de prefill y el consumo de VRAM en entornos de servicio concurrente. El modelo se presenta como 100% autónomo, sin dependencias externas adicionales más allá de `transformers` y `torch`.

La relevancia de este lanzamiento radica en su enfoque en la eficiencia de inferencia para modelos SSM, un área de creciente interés frente a los transformadores clásicos. Según la model card, Phantom-Falcon-7B logra una aceleración de 2,76× en el tiempo hasta el primer token (TTFT) y una reducción del 75% en la memoria de estados recurrentes (de 16,78 MB a 4,20 MB por usuario) en comparación con el Falcon-Mamba-7B original. Sin embargo, es importante señalar una discrepancia significativa: los pesos safetensors del repositorio suman 29.778.784 parámetros (≈0,03B), mientras que el nombre y la documentación indican 7 mil millones. Esta inconsistencia debe tenerse en cuenta al evaluar el modelo. El contexto máximo no se especifica en la información disponible, aunque el Falcon-Mamba-7B base tiene una ventana de 2048 tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | State Space Model (SSM) basado en Falcon-Mamba-7B, con 64 capas recurrentes y convolución 1D (K=4) |
| Parametros totales | 29.778.784 (según safetensors); la documentación afirma 7B, discrepancia sin aclarar |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el Falcon-Mamba-7B base usa 2048 tokens) |
| Tipos de cuantizacion | INT8 dinámico simétrico para estados recurrentes (integrado en `phantom-cache`) |
| Idiomas soportados | Inglés (según metadatos `language: en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Phantom-Falcon-7B hereda la arquitectura Falcon-Mamba-7B, un modelo de espacio de estados (SSM) con 64 capas recurrentes, cada una equipada con una convolución 1D de kernel 4 para capturar dependencias locales. A diferencia de los transformadores, los SSM no requieren atención cuadrática, lo que permite un escalado lineal con la longitud de secuencia. Sobre esta base, el autor incorpora el motor `phantom-cache`, que introduce dos innovaciones principales: un árbol Radix para el caché de prefijos compartidos (capaz de coincidir prompts del sistema en menos de 90 microsegundos) y una cuantización INT8 dinámica de los estados recurrentes que reduce su huella de memoria de 16,78 MB a 4,20 MB por usuario. Además, se corrige un error de sincronización en los buffers de convolución que afectaba a los primeros tres tokens generados en el modelo vanilla.

No se proporciona información sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. Dado que se presenta como una distribución optimizada para inferencia, es probable que los pesos sean una conversión o adaptación del Falcon-Mamba-7B original, pero no hay datos que lo confirmen.

## Capacidades

- Generación de texto autoregresiva con soporte para prompts largos gracias al caché de prefijos.
- Caché de prefijos compartidos (system prompts) con coincidencia en menos de 90 microsegundos mediante árbol Radix.
- Cuantización INT8 de estados recurrentes integrada, sin necesidad de instalar paquetes adicionales.
- Corrección de errores de sincronización en convoluciones 1D (K=4) en las 64 capas.
- Funciona con `transformers` y `torch` estándar, cargándose con `trust_remote_code=True`.
- No se documentan capacidades de tool calling, agentes, visión, audio o modo de razonamiento explícito.

## Casos de uso

- Servicio multi-usuario de chatbots con prompts de sistema compartidos: el caché Radix permite reutilizar el estado de prefijos comunes entre peticiones, reduciendo drásticamente la latencia de prefill en escenarios de alta concurrencia.
- Despliegue en entornos con restricciones de memoria: la cuantización INT8 de estados recurrentes reduce la VRAM necesaria para mantener múltiples sesiones simultáneas, adecuado para GPUs de gama media.
- Prototipado rápido de aplicaciones de generación de texto sin dependencias adicionales: al requerir solo `transformers` y `torch`, se integra fácilmente en pipelines existentes.
- Evaluación de arquitecturas SSM frente a transformadores para tareas de comprensión de contexto largo, aprovechando la linealidad del coste computacional.
- Sistemas de respuesta a preguntas basados en documentación interna, donde los prefijos de contexto pueden cachearse eficientemente entre consultas.
- Investigación académica sobre técnicas de optimización de inferencia para modelos de espacio de estados, dado que el código fuente incluye el motor `phantom-cache` embebido.

## Benchmarks y rendimiento

La model card proporciona una comparación de rendimiento entre el Falcon-Mamba-7B vanilla y Phantom-Falcon-7B, pero no incluye métricas de calidad del modelo (MMLU, HumanEval, GSM8K, etc.). Se presentan los datos tal como aparecen en la documentación:

| Metrica | Falcon-Mamba-7B (vanilla) | Phantom-Falcon-7B |
|---|---|---|
| Latencia de prefill (TTFT) | 1,25 s (cold unroll) | 0,45 s (2,76× de aceleración, coincidencia <90 µs) |
| Memoria de estados recurrentes (64 capas) | 16,78 MB por usuario (FP32) | 4,20 MB por usuario (75% de reducción) |
| Sincronización de buffers Conv1D (K=4) | Corrupción de los primeros 3 tokens | 100% sin pérdida, snapshot exacto |
| Dependencias externas | PyTorch estándar | Cero instalaciones adicionales |

No se han publicado resultados de benchmarks de calidad (razonamiento, código, matemáticas) en la información disponible.

## Requisitos de hardware

- Según los pesos safetensors (≈29,8M parámetros, 0,1 GB), el modelo cabe en cualquier GPU moderna e incluso en CPU. Sin embargo, la documentación afirma ser un modelo de 7B, lo que implicaría requisitos típicos de esa escala (mínimo 16 GB de VRAM en FP16, 8 GB en INT8). Dada la discrepancia, se recomienda verificar el tamaño real antes de dimensionar el hardware.
- Si se trata efectivamente de un modelo de 7B, las GPUs recomendadas serían: NVIDIA A100 (40/80 GB), H100, RTX 4090 (24 GB) para cuantización INT8, o RTX 3090/4080 (16-24 GB) para FP16.
- El motor `phantom-cache` está diseñado para reducir la memoria de estados, lo que permite atender más usuarios concurrentes con la misma VRAM.
- Opciones de despliegue: al ser compatible con `transformers`, puede servirse con vLLM, TGI o llama.cpp (si se exporta a GGUF). No se mencionan integraciones específicas.
- Latencia y throughput: según la model card, el TTFT se reduce a 0,45 s frente a 1,25 s del vanilla, pero no se aportan datos de throughput en tokens/segundo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Phantom-Falcon-7B | SSM (Mamba) | 29,8M (según safetensors) / 7B (según doc.) | no disponible | Apache-2.0 | Optimizado para inferencia con caché de prefijos y cuantización INT8 |
| Falcon-Mamba-7B (tiiuae) | SSM (Mamba) | 7B | 2048 | Apache-2.0 | Modelo base del que deriva Phantom-Falcon |
| Llama 3.1 8B (Meta) | Transformer (dense) | 8B | 128K | Llama 3.1 Community License | Referente en eficiencia y rendimiento, pero con coste cuadrático de atención |

La comparativa se limita a la arquitectura y características, ya que no hay datos de rendimiento de calidad para Phantom-Falcon-7B. Falcon-Mamba-7B supera en benchmarks a Llama 3.1 8B en varias tareas según TII, pero esa información no está verificada para esta variante.

## Limitaciones y advertencias

- Discrepancia no resuelta entre el número de parámetros declarado (7B) y el tamaño real de los pesos (≈29,8M). Esto puede deberse a un error en la subida o a una representación comprimida, pero no se aclara en la documentación.
- Solo se soporta inglés; no hay evidencia de capacidades multilingües.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez. El modelo hereda los riesgos típicos de los modelos entrenados con datos web (sesgos, contenido inapropiado).
- La licencia Apache-2.0 permite uso comercial, pero el modelo no está oficialmente respaldado por TII (creadores de Falcon-Mamba), por lo que la garantía de calidad es limitada.
- El motor `phantom-cache` está embebido en el código del modelo; cualquier modificación del mismo puede romper la funcionalidad de aceleración.
- No se especifica el contexto máximo, lo que impide planificar aplicaciones que requieran ventanas largas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Prannesshkva/Phantom-Falcon-7B
- DOI Zenodo (artículo principal): https://doi.org/10.5281/zenodo.22177116
- DOI Zenodo (artículo adicional): https://doi.org/10.5281/zenodo.22177118
- Space de HuggingFace (demo): https://huggingface.co/spaces/Prannesshkva/Phantom-Samba-Engine
- Modelo base Falcon-Mamba-7B: https://huggingface.co/tiiuae/falcon-mamba-7b
