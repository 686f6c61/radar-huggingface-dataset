# hanseungwook/codeparrot-llama-1.6b-scratch-seed-8

## Resumen

CodeParrot Llama 1.6B (seed 8) es un modelo base de lenguaje causal entrenado desde cero sobre el dataset CodeParrot, exportado del checkpoint final del paso de optimizador 24.545. Lo desarrolla el usuario hanseungwook y forma parte de una familia de experimentos de preentrenamiento comparativos (semillas 7 y 8, con y sin preentrenamiento NCA). No está ajustado para instrucciones ni para chat: es un baseline de investigación en crudo.

Técnicamente es un transformer causal con arquitectura Llama (`LlamaForCausalLM`) de 24 capas, tamaño oculto 2048, tamaño intermedio 8192 y 32 cabezas de atención/KV. Tiene 1.872.857.088 parámetros totales (aproximadamente 1,61B excluyendo los embeddings de entrada y salida), que están desacoplados (untied) y se preservan intactos con 64.000 filas. La longitud de contexto de entrenamiento es de 1.024 tokens.

Su relevancia es acotada pero clara para quien investiga dinámicas de preentrenamiento: permite comparar una inicialización desde cero frente a inicializaciones derivadas de NCA sobre el mismo corpus y presupuesto de pasos, con métricas de validación registradas. Para uso productivo general no es un modelo recomendable: es un checkpoint de experimento, sin licencia declarada y con cero descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (`LlamaForCausalLM`): 24 capas, hidden size 2048, intermediate size 8192, 32 attention/KV heads |
| Parametros totales | 1.872.857.088 (aprox. 1,61B excluyendo embeddings de entrada/salida) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos FP32 safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP32 sin estado de optimizador ni scheduler); librería `transformers` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal estándar de tipo Llama con decodificación autorregresiva. Los pesos se exportan como `LlamaForCausalLM` estándar junto con un tokenizador GPT-2, sin necesidad de código personalizado ni `trust_remote_code=True`. El vocabulario del modelo entrena 64.000 filas de embedding, mientras que GPT-2 define 50.257 tokens; la `generation_config` guardada suprime los IDs 50.257–63.999 para evitar tokens no decodificables, manteniendo intactos los pesos y los logits del forward pass.

El entrenamiento se realizó desde cero ("scratch") sobre el dataset CodeParrot, con semilla 8, y el checkpoint exportado corresponde al paso de optimizador 24.545. El nombre interno del run es `full-codeparrot/scratch-10-colors-gzip-0.5-1.0-3-seed/8-seed` (ID de W&B `e3rb4yyy`). No hay preentrenamiento NCA ni banda GZIP aplicable; las referencias a GZIP en la ruta heredada forman parte solo del esquema de nombres del experimento. No se documentan en la información disponible detalles sobre número total de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF/DPO.

La validación registrada sitúa la mejor pérdida de validación de CodeParrot para este checkpoint (scratch seed 8) en 0,616333815306, medida en el paso de optimizador 24.000. Esa cifra es una métrica histórica del run, no una pérdida recalculada sobre los pesos finales exportados (paso 24.545). El export incluye un `conversion_report.json` que verifica igualdad exacta de tensores tras recarga, paridad del tokenizador con `tiktoken` GPT-2, comparación de logits originales frente a Transformers en longitudes 8, 128 y 1.024, y una prueba de humo de generación.

## Capacidades

- Generación de texto causal autorregresiva en inglés, orientada al dominio de código por el corpus de entrenamiento (CodeParrot).
- Continuación de código y autocompletado a partir de prefijos (por ejemplo, `def fibonacci(n):`).
- Modelo base sin ajuste de instrucciones ni de chat: no sigue instrucciones de forma fiable ni mantiene formato conversacional.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés declarado.
- No dispone de modo "thinking", visión, audio ni otras capacidades especiales.
- Compatible con `text-generation-inference` y `endpoints_compatible` según las etiquetas del repo.

## Casos de uso

- Investigación comparativa de preentrenamiento: usar este checkpoint como baseline "desde cero" frente a variantes NCA (seeds 7 y 8) sobre CodeParrot, comparando pérdidas de validación registradas en el paso 24.000.
- Reproducibilidad de experimentos: al incluir `training_metadata.json` y `conversion_report.json`, permite auditar la correspondencia entre el checkpoint original `.pth` y los pesos exportados en safetensors.
- Estudio de inicialización y semillas: analizar la variabilidad entre semillas (seed 7 frente a seed 8) con el mismo corpus y presupuesto de pasos.
- Evaluación de modelos base en código: medir perplejidad o exactitud de continuación sobre CodeParrot y otros corpus de código, siempre entendiendo que no está ajustado para instrucciones.
- Pruebas de infraestructura de inferencia: validar pipelines con `transformers`, TGI o endpoints compatibles usando un modelo pequeño (1,87B parámetros) y FP32.
- Análisis de tokenizador y vocabulario: estudiar el desajuste entre las 64.000 filas de embedding entrenadas y los 50.257 tokens de GPT-2, incluida la supresión de IDs en `generation_config`.
- Docencia e investigación de dinámicas de entrenamiento: inspeccionar cómo se comporta un transformer causal de 24 capas entrenado desde cero en un corpus específico de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Lo único registrado son pérdidas de validación de CodeParrot del propio run:

| Checkpoint | Banda GZIP NCA | Mejor pérdida de validación CodeParrot registrada |
|---|---|---:|
| NCA seed 7 | 0,3-0,4 | 0,612319200089 |
| NCA seed 8 | 0,5-1,0 | 0,610557624325 |
| Scratch seed 7 | No aplicable | 0,665801837119 |
| Scratch seed 8 (este modelo) | No aplicable | 0,616333815306 |

Todas las pérdidas se registraron en el paso de optimizador 24.000 y son métricas históricas del run, no medidas sobre los pesos finales exportados. Las diferencias entre runs NCA mezclan semilla y banda GZIP, por lo que no aíslan el efecto de la banda por sí sola.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 7,5 GB solo para pesos (1,87B parámetros × 4 bytes), más overhead de activaciones y KV cache; en la práctica, alrededor de 8-10 GB para contextos cortos.
- GPU recomendadas: A100, H100 o L40S para FP32; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para FP32 con contexto de 1.024 tokens.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (RTX 4080, 4090, 3090) en FP32; con 12 GB puede requerir `device_map` con offload parcial.
- Opciones de despliegue: `transformers` (verificado con Transformers 4.53.0 y PyTorch 2.8.0+cu128), `text-generation-inference` (etiqueta del repo) y endpoints compatibles. No se documentan pesos GGUF ni soporte verificado de llama.cpp/Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| codeparrot-llama-1.6b-scratch-seed-8 (este) | 1,87B (aprox. 1,61B sin embeddings) | 1.024 | Pérdida val. CodeParrot 0,6163 (paso 24.000) | no disponible | Hugging Face, 0 descargas |
| codeparrot-llama-1.6b-scratch-seed-7 | 1,87B (aprox. 1,61B sin embeddings) | 1.024 | Pérdida val. CodeParrot 0,6658 (paso 24.000) | no disponible | Hugging Face |
| codeparrot-llama-1.6b-from-nca-gzip-0.5-1.0-seed-8 | 1,87B (aprox. 1,61B sin embeddings) | 1.024 | Pérdida val. CodeParrot 0,6106 (paso 24.000) | no disponible | Hugging Face |
| codeparrot-llama-1.6b-from-nca-gzip-0.3-0.4-seed-7 | 1,87B (aprox. 1,61B sin embeddings) | 1.024 | Pérdida val. CodeParrot 0,6123 (paso 24.000) | no disponible | Hugging Face |

No se dispone de comparación con modelos de código externos de tamaño equivalente en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones ni de chat: no debe usarse como asistente conversacional ni esperar seguimiento de instrucciones.
- Riesgo elevado de alucinación y de continuaciones incoherentes fuera de distribuciones similares a CodeParrot.
- Contexto de entrenamiento corto (1.024 tokens): el rendimiento decae fuera de esa ventana y no hay evidencia de extrapolación.
- Idioma limitado al inglés; no se documenta soporte multilingüe.
- Licencia no disponible: no hay autorización explícita para uso comercial; debe tratarse como uso restringido a investigación hasta aclaración.
- Desajuste de vocabulario: los pesos entrenan 64.000 filas de embedding frente a 50.257 tokens de GPT-2; si se sustituye `generation_config` o se implementa un bucle de muestreo propio, hay que preservar la supresión de IDs 50.257–63.999 para evitar tokens no decodificables.
- El padding usa el token EOS de GPT-2 (50256); en lotes con padding hay que proporcionar attention mask.
- Las pérdidas registradas corresponden al paso 24.000, no a los pesos finales exportados (paso 24.545), y no se han recalculado de forma independiente.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa.
- Sin benchmarks estandarizados publicados; no apto para decisiones de producción basadas en rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-scratch-seed-8
- Metadatos de entrenamiento: https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-scratch-seed-8/blob/main/training_metadata.json
- Informe de conversión: https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-scratch-seed-8/blob/main/conversion_report.json
- Modelo relacionado (scratch seed 7): https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-scratch-seed-7
- Modelo relacionado (NCA GZIP 0.5-1.0 seed 8): https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-from-nca-gzip-0.5-1.0-seed-8
- Modelo relacionado (NCA GZIP 0.3-0.4 seed 7): https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-from-nca-gzip-0.3-0.4-seed-7
- Familia de experimentos de referencia: https://huggingface.co/hanseungwook/fineweb-edu-llama-1.6b-from-nca
