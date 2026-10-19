# polydim-cla/gemma-2-2b-pmtp

## Resumen

`polydim-cla/gemma-2-2b-pmtp` es un ajuste fino sobre `google/gemma-2-2b` publicado por el autor independiente polydim-cla (Ariel García Traba, en el marco de la denominada POLYDIM-EINSOF Research Initiative). No se trata de un modelo entrenado desde cero, sino de una modificación del Gemma 2 de 2.600 millones de parámetros en la que el autor declara haber inyectado un adaptador basado en una variedad de Stiefel `St(2304, 1024)` sobre la esfera `S^1023`, con proyección de `d_model = 2304` a `d_canonical = 1024` y aplicación en la capa 14 del transformer.

El interés del modelo es fundamentalmente de investigación:propone una vía geométrica (adaptación sobre variedades) para modificar el espacio latente de un modelo ya entrenado sin reentrenarlo por completo, y lo acompaña de un mecanismo propietario de comunicación entre procesos (`PmtpShmBus`) que el autor describe como transferencia directa de tensores sin serialización de tokens de texto. La terminología empleada en la model card (por ejemplo, "tensor telepathy" o "zero-worm IPC") no corresponde a conceptos estándar en la literatura de aprendizaje profundo, por lo que debe leerse como una propuesta del autor pendiente de validación externa.

La relevancia práctica es limitada por ahora: el repositorio ocupa 0,1 GB, muy por debajo de los ~5 GB que requerirían los pesos completos en fp16, lo que sugiere que contiene un delta o adaptador más que un checkpoint completo. No hay pipeline declarado, no hay descargas, no hay resultados de evaluación y no se especifican idiomas ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) con adaptador geométrico basado en la variedad de Stiefel `St(2304, 1024)` inyectado en la capa 14 |
| Parametros totales | 2,6 mil millones (heredados de `google/gemma-2-2b`; no se especifica el número de parámetros añadidos por el adaptador) |
| Longitud de contexto | 8192 tokens (heredada del modelo base; no se indica si el adaptador la modifica) |
| Tipos de cuantizacion | No disponible en la model card; los pesos se distribuyen en safetensors, por lo que la conversión a GGUF/INT8/INT4 requeriría herramientas externas no documentadas por el autor |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (declarada por el autor; el modelo base Gemma 2 está sujeto a los Gemma Terms of Use, ver limitaciones) |
| Formato de pesos | safetensors (tamaño del repo: 0,1 GB) |

## Arquitectura y entrenamiento

La arquitectura de partida es un transformer decoder-only de la familia Gemma 2, con normalización RMSNorm, atención con ventana deslizante alternada y atención multi-query/grouped-query según el diseño original de Google. Sobre esa base, el autor declara una intervención quirúrgica en la capa 14: una proyección desde la dimensión oculta de 2304 hasta un espacio canónico de 1024 restringido a la variedad de Stiefel `St(2304, 1024)`, es decir, matrices de columnas ortonormales. El "defecto de Frobenius de Stiefel" reportado es 3,578e+01, calculado con un acumulador compensado de Neumaier en FP64; se trata de una métrica de cuánto se desvía la matriz aprendida de la restricción de ortogonalidad, aunque la model card no explica cómo interpretar ese valor ni qué umbral se considera aceptable.

No hay información sobre el volumen de datos de entrenamiento, la composición del corpus, el uso de RLHF/DPO, la duración del ajuste ni los hiperparámetros. Tampoco se documenta si el adaptador se entrenó congelando el modelo base o si hubo actualizaciones adicionales. El componente `PmtpShmBus` se describe como un mecanismo de comunicación entre procesos por memoria compartida que transfiere tensores sin serializar texto ("0 text tokens serialized"); no se aportan especificaciones técnicas, código de referencia en el repositorio enlazado ni métricas de latencia o throughput que lo respalden.

## Capacidades

- Generación de texto en inglés y otros idiomas: se hereda la competencia del Gemma 2 2B original, aunque la model card no confirma qué idiomas se preservan tras el ajuste.
- Razonamiento y conocimiento general: presumiblemente comparable al modelo base, sin evidencia publicada.
- Generación de código y matemáticas: capacidad heredada del modelo base, no evaluada en esta variante.
- Tool calling / function calling: no documentado para esta variante; el Gemma 2 2B original tampoco lo soporta de forma nativa.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo de razonamiento explícito (thinking mode): no disponible.
- Capacidad diferencial declarada: proyección latente a una variedad de Stiefel en la capa 14 y bus IPC propietario para transferencia de tensores entre procesos.

## Casos de uso

- Investigación sobre adaptación geométrica de modelos: el caso de uso principal es reproducir y auditar la técnica PMTP, verificando si la restricción de Stiefel en la capa 14 aporta alguna ventaja medible frente al ajuste fino convencional. Requiere acceso al código del repositorio del autor y a un conjunto de evaluación propio.
- Experimentos de interpretabilidad del espacio latente: la proyección de 2304 a 1024 dimensiones en una capa intermedia permite estudiar cómo se reorganiza la representación interna y si las propiedades de ortogonalidad se mantienen durante la inferencia.
- Despliegue local en hardware modesto: con 2,6 mil millones de parámetros, el modelo cabe en GPU de consumo y en CPU, lo que lo hace apto para prototipos de generación de texto en estaciones de trabajo sin clúster.
- Base para comparativas académicas de adaptadores: sirve como punto de comparación frente a LoRA, adaptadores bottleneck o intervenciones de rango bajo, siempre que se documente el protocolo experimental.
- Generación de texto asistida en entornos con requisitos de latencia baja entre procesos: si el bus `PmtpShmBus` se publica y se valida, podría interesar en pipelines donde varios procesos comparten estados tensoriales en la misma máquina.
- Filtrado o anotación de datos a pequeña escala: con contexto de 8192 tokens, puede procesar documentos medianos en tareas de clasificación o extracción, aunque sin benchmarks que garanticen calidad.
- Docencia y formación: ejemplo práctico de intervención sobre un modelo abierto y de aplicación de geometría diferencial en arquitecturas neuronales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 6-7 GB contando pesos (~5,2 GB) y caché KV para contexto de 8192 tokens; el adaptador añade una huella marginal.
- VRAM estimada en INT8: en torno a 3-4 GB; en INT4, aproximadamente 2-2,5 GB.
- GPU recomendadas: NVIDIA A100 40 GB, H100 80 GB o L40S para servir varias réplicas; RTX 4090 (24 GB) para experimentación con margen amplio; RTX 4060 Ti 16 GB o RTX 3060 12 GB para inferencia en bf16 sin problemas de memoria.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 8 GB o más en cuantización INT8 y con 12 GB o más en bf16.
- Opciones de despliegue: `transformers` con safetensors; vLLM o TGI para servicio concurrente; llama.cpp u Ollama para CPU y GPU de gama baja (la model card menciona la etiqueta `gemma2:2b` de Ollama, aunque no se confirma que esa etiqueta corresponda a esta variante ajustada); conversión a GGUF mediante `llama.cpp` no documentada por el autor.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| polydim-cla/gemma-2-2b-pmtp | 2,6 B (+ adaptador no cuantificado) | 8192 (heredado) | apache-2.0 declarada, base Gemma | Repo de 0,1 GB, 0 descargas | No disponibles |
| google/gemma-2-2b | 2,6 B | 8192 | Gemma Terms of Use | Pesos completos en HuggingFace | Métricas publicadas por Google (no verificadas en esta ficha) |
| Qwen/Qwen2.5-3B | 3,09 B | 32 768 | Apache 2.0 | Pesos completos, amplia adopción | Métricas publicadas por阿里 (no verificadas en esta ficha) |
| meta-llama/Llama-3.2-3B | 3,21 B | 131 072 | Llama 3.2 Community License | Pesos completos, ecosistema amplio | Métricas publicadas por Meta (no verificadas en esta ficha) |
| microsoft/Phi-3-mini-4k-instruct | 3,8 B | 4096 | MIT | Pesos completos | Métricas publicadas por Microsoft (no verificadas en esta ficha) |

La comparación relevante es frente al Gemma 2 2B original: esta variante no documenta mejoras medibles y añade una dependencia de un adaptador propietario. Frente a Qwen2.5-3B y Llama 3.2 3B, la diferencia práctica está en contexto (8192 frente a 32k y 128k) y en la madurez del ecosistema de herramientas.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ablaciones ni comparación con el modelo base, por lo que no puede afirmarse que el adaptador mejore ninguna capacidad.
- Terminología no estándar: expresiones como "tensor telepathy", "zero-worm IPC" o "continuous-thought" no tienen definición técnica aceptada; deben tratarse como afirmaciones del autor sin respaldo publicado.
- Ambigüedad sobre el contenido del repositorio: 0,1 GB es insuficiente para los pesos completos de un modelo de 2,6 B en fp16 (~5 GB) o bf16, de modo que probablemente se distribuye solo el delta o el adaptador; no se indica cómo combinarlo con `google/gemma-2-2b`.
- Licencia potencialmente incompatible: la model card declara apache-2.0, pero al derivar de Gemma 2 los términos de uso de Gemma se aplican a los pesos resultantes. Verificar antes de cualquier uso comercial o redistribución.
- Riesgo de alucinación: heredado del modelo base de 2,6 B, acentuado por la falta de ajuste documentado con RLHF o DPO.
- Idiomas no especificados: se desconoce si el ajuste degrada el multilingüismo del Gemma 2 original.
- Sin pipeline declarado: la plataforma no clasifica la tarea, lo que complica el uso directo con `pipeline()` de transformers.
- Sin mantenimiento verificable: cero descargas, cero valoraciones y una única versión publicada; la fecha de creación registrada (2026-10-18) resulta anómala y sugiere posibles errores de metadatos en el repositorio.
- Dependencia de componentes propietarios: si el adaptador requiere `PmtpShmBus` para funcionar, el modelo no sería portable a infraestructura estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/polydim-cla/gemma-2-2b-pmtp
- Repositorio del autor: https://github.com/AGT1973/POLYDIM_EINSOF
- Modelo base: https://huggingface.co/google/gemma-2-2b
