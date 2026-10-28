# Ali-Mhrez/Qwen3-4B-Instruct-2507-SD-UnifiedFC-2048-46-v2

## Resumen

Qwen3-4B-Instruct-2507-SD-UnifiedFC-2048-46-v2 es un ajuste fino (fine-tune) del modelo Qwen3-4B-Instruct-2507, publicado por el usuario Ali-Mhrez en HuggingFace. Se trata de un derivado de la familia Qwen3 en su variante "Instruct-2507" (modo no thinking), con 4.000 millones de parámetros y arquitectura transformer densa. El entrenamiento se ha realizado con SFT (supervised fine-tuning) usando la librería TRL (versión 0.24.0) sobre infraestructura de Unsloth, según los metadatos del repositorio.

El problema que aborda es la especialización del modelo base mediante instrucciones: el sufijo del nombre ("UnifiedFC", "2048") sugiere un ajuste orientado a function calling unificado y a secuencias de hasta 2.048 tokens, aunque la model card no documenta ni el dataset, ni los hiperparámetros, ni el objetivo concreto del entrenamiento. El repositorio es de tipo "generated_from_trainer" y no incluye métricas de evaluación ni ejemplos de uso más allá de un snippet genérico de `pipeline`.

Su relevancia práctica es limitada pero concreta: sirve como ejemplo de pipeline de fine-tune reproducible (TRL + Unsloth + Transformers 5.16.1) sobre un modelo base pequeño, denso y de contexto largo, apto para experimentación en una sola GPU de consumo. Dado que el repositorio no documenta licencia, idiomas ni evaluación, debe tratarse como un artefacto experimental y no como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), heredada de Qwen3-4B-Instruct-2507; no se detalla en la model card del fine-tune |
| Parametros totales | 4.000 millones (4B), según el modelo base; el fine-tune no lo declara explícitamente |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen3-4B-Instruct-2507 soporta hasta 262.144 tokens nativos |
| Tipos de cuantizacion | No disponible en la model card; el modelo base admite bf16/fp16 y cuantizaciones GGUF/AWQ/GPTQ generadas por la comunidad |
| Idiomas soportados | No disponibles; el modelo base declara soporte multilingüe amplio (más de 100 idiomas según Qwen) |
| Licencia | No disponible: el campo de la model card aparece como `licence: license` sin concretar y los metadatos del Hub no la declaran. El modelo base se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (tag del repositorio); tamaño del repo: 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tune supervisado (SFT) del checkpoint unsloth/Qwen3-4B-Instruct-2507, que a su vez es una conversión optimizada del Qwen3-4B-Instruct-2507 oficial. La arquitectura subyacente es un transformer decoder-only denso de 4B parámetros, con atención causal estándar y sin mezcla de expertos. La variante "Instruct-2507" del modelo base corresponde al modo de respuesta directa (sin bloque de razonamiento explícito), a diferencia de las versiones Qwen3 con "thinking mode" conmutables.

El entrenamiento se ejecutó con TRL 0.24.0 (entrenador SFT), Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.3.0 y Tokenizers 0.23.1, con Unsloth como backend de optimización según los tags. La model card no documenta el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO posterior, la longitud máxima de secuencia efectiva ni hiperparámetros como learning rate, epochs o rango de LoRA. El tamaño del repositorio (0,2 GB) es coherente con un guardado de adaptadores LoRA o de pesos parciales, no con un checkpoint completo de 4B en bf16 (que rondaría los 8 GB), por lo que conviene verificar los ficheros antes de intentar cargarlo como modelo completo.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Instruct.
- Razonamiento y respuesta directa en modo no thinking (sin cadena de pensamiento explícita), según la variante 2507 del modelo base.
- Generación de código y matemáticas a nivel de modelo de 4B; no hay evaluación publicada para este fine-tune.
- Soporte de tool calling / function calling: presumiblemente reforzado por el ajuste (el sufijo "UnifiedFC" del nombre lo sugiere), pero no documentado ni verificado en la model card.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este checkpoint.
- Multilingüismo: no declarado en la model card; el modelo base Qwen3 declara cobertura de más de 100 idiomas.
- Compatibilidad con endpoints: el repositorio incluye el tag `endpoints_compatible`, lo que indica que puede desplegarse en HuggingFace Inference Endpoints con el runtime de Transformers.
- No se declaran capacidades de visión, audio ni modo thinking conmutable en este checkpoint.

## Casos de uso

- Experimentación con pipelines de SFT: reproducir o comparar el efecto del ajuste frente al modelo base usando TRL y Unsloth, con un coste de cómputo bajo (una sola GPU de 24 GB permite entrenar adaptadores sobre 4B).
- Pruebas de function calling en local: si el ajuste "UnifiedFC" cumple lo que su nombre sugiere, el modelo puede usarse para validar esquemas de llamadas a herramientas en prototipos de agentes, siempre con una batería de evaluación propia antes de confiar en él.
- Asistente conversacional ligero en prototipos: con 4B parámetros y contexto largo heredado del base, es viable montar un chatbot de soporte en una estación de trabajo para demos internas.
- Generación de código en entornos con recursos limitados: tareas de autocompletado, generación de tests unitarios o explicación de fragmentos, ejecutables en GPU de consumo mediante llama.cpp u Ollama tras convertir los pesos a GGUF.
- Clasificación y extracción de información con formato estructurado: resúmenes de documentos y extracción de entidades en pipelines batch, aprovechando la ventana de contexto del modelo base para documentos largos.
- Base para nuevos fine-tunes: al ser un checkpoint derivado con licencia indeterminada, sirve como punto de partida en investigación académica, no como componente de un producto comercial sin aclarar antes la licencia.
- Evaluación comparativa de técnicas de ajuste: útil como caso de estudio de cómo un SFT corto sobre un modelo pequeño altera el comportamiento en instrucciones y en formato de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, IFEval ni ninguna otra), no aporta curvas de entrenamiento pese al tag `tensorboard`, y la sección "Training procedure" aparece vacía salvo por la mención al framework SFT.

| Benchmark | Este modelo | Modelo base (Qwen3-4B-Instruct-2507) | Observaciones |
|---|---|---|---|
| MMLU / MMLU-Pro | No disponible | No disponible en la información proporcionada | El autor no publica evaluación |
| HumanEval | No disponible | No disponible en la información proporcionada | Sin datos de código |
| GSM8K | No disponible | No disponible en la información proporcionada | Sin datos de matemáticas |
| IFEval / tool calling | No disponible | No disponible en la información proporcionada | El ajuste sugiere especialización en FC, sin evidencia |

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 8-9 GB solo para pesos, más 1-3 GB de caché KV según longitud de contexto y batch; en la práctica, 12-16 GB para contexto moderado.
- VRAM en cuantización de 8 bits: en torno a 5-6 GB; en 4 bits (GGUF Q4_K_M o AWQ): aproximadamente 2,5-3,5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para serving con contexto máximo y batches grandes; L40S o RTX 4090 (24 GB) para desarrollo y serving de un solo usuario con contexto largo.
- Cabe en GPU de consumo: sí. RTX 4090, RTX 3090, RTX 4070 Ti Super y RTX 4060 Ti 16 GB en bf16; RTX 3060 12 GB, RTX 4060 8 GB y GPUs de 6-8 GB solo en cuantización de 4 bits.
- Opciones de despliegue: vLLM o TGI para serving con throughput alto (si el repositorio contiene pesos completos), llama.cpp/Ollama tras conversión a GGUF, y `transformers` con `pipeline` para pruebas puntuales. Antes de usar vLLM, verificar que el repositorio incluye todos los tensores y no solo adaptadores.
- Latencia y throughput: no disponibles. No se han publicado mediciones. Como referencia orientativa no medida, un denso de 4B en bf16 sobre una RTX 4090 suele moverse en decenas de tokens por segundo, pero el rendimiento real de este checkpoint depende del backend y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-SD-UnifiedFC-2048-46-v2 | 4B (denso) | No especificado en la card (base: hasta 262.144) | No disponible | HuggingFace, 0 descargas, 0 likes | Fine-tune comunitario sin evaluación ni dataset documentado |
| Qwen3-4B-Instruct-2507 (base) | 4B (denso) | Hasta 262.144 tokens | Apache 2.0 | HuggingFace, ampliamente distribuido | Referencia oficial, con benchmarks publicados por Qwen; licencia clara para uso comercial |
| Llama 3.1 8B Instruct | 8B (denso) | 128.000 tokens | Licencia comunitaria Llama 3.1 | HuggingFace y catálogos de despliegue | El doble de parámetros ylicencia con restricciones de uso aceptable |
| Gemma 3 4B IT | 4B (denso) | 128.000 tokens | Licencia Gemma | HuggingFace | Alternativa de tamaño equivalente, con términos de uso propios |
| Phi-4-mini-instruct | 3,8B (denso) | 128.000 tokens | MIT | HuggingFace | Opción permisiva de tamaño similar para despliegue comercial |

No se dispone de métricas comparativas de rendimiento para el modelo objeto de esta ficha, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni curvas de pérdida, ni conjunto de validación documentado; no es posible afirmar que el fine-tune mejore al modelo base en ninguna tarea.
- Licencia indeterminada: la model card deja el campo como `licence: license` y el Hub no declara licencia. Aunque el modelo base es Apache 2.0, los términos del derivado no están claros; no debe usarse comercialmente sin aclaración del autor.
- Dataset de entrenamiento no documentado: se desconoce la composición, el idioma, la procedencia y los posibles sesgos introducidos por el SFT.
- Riesgo de olvido catastrófico y de sobreajuste al formato: un SFT corto sobre 4B puede degradar capacidades generales (matemáticas, código, multilingüismo) y forzar respuestas en un formato concreto.
- Riesgo de alucinación: inherente a los modelos de 4B, especialmente en tareas de conocimiento factual y en contextos largos con información densa.
- Idiomas no declarados: no hay garantía de calidad fuera del inglés, y menos aún de un registro adecuado en castellano.
- Longitud de contexto no confirmada en el fine-tune: aunque el modelo base soporte 262.144 tokens, el nombre "2048" sugiere un entrenamiento con secuencias de 2.048 tokens, lo que puede degradar el rendimiento más allá de esa longitud.
- Tamaño del repositorio anómalo (0,2 GB): probablemente contiene adaptadores LoRA o pesos incompletos; cargarlo como modelo completo puede fallar. Verificar los ficheros antes de integrarlo.
- Sin comunidad: 0 descargas y 0 likes en la fecha de la ficha, sin issues ni discusiones que permitan contrastar experiencias.
- Reproducibilidad dudosa: se listan versiones de framework muy específicas (Transformers 5.16.1, PyTorch 2.11.0+cu128) que pueden no estar disponibles en todos los entornos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ali-Mhrez/Qwen3-4B-Instruct-2507-SD-UnifiedFC-2048-46-v2
- Modelo base en HuggingFace (conversión Unsloth): https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de TRL: https://github.com/huggingface/trl
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Paper, blog o demo específicos de este fine-tune: no disponibles en la información proporcionada.
