# hanseungwook/codeparrot-llama-1.6b-from-nca-gzip-0.5-1.0-seed-8

## Resumen

Codeparrot-llama-1.6b-from-nca-gzip-0.5-1.0-seed-8 es un modelo de lenguaje causal base desarrollado por el usuario hanseungwook, entrenado sobre el corpus CodeParrot y exportado desde el checkpoint final del paso de optimizador 24.521. No es un modelo ajustado para instrucciones ni para chat: se trata de un checkpoint de preentrenamiento puro orientado a la modelización de código fuente. Su interes principal es experimental: forma parte de una familia de modelos que estudia el efecto de inicializar los pesos mediante un autómata celular neuronal (NCA) en lugar de un arranque aleatorio convencional, comparando distintas bandas de compresión GZIP y semillas.

La arquitectura es un transformer tipo Llama (`LlamaForCausalLM`) con 24 capas, dimensión oculta de 2048 y tamaño intermedio de 8192. El nombre comercial "1.6B" hace referencia a los parámetros no pertenecientes a los embeddings de entrada y salida (aproximadamente 1.610 millones), mientras que el total real asciende a 1.872.857.088 parámetros. El contexto de entrenamiento es de 1024 tokens, una ventana corta para los estándares actuales, y el vocabulario tiene 64.000 filas con embeddings de entrada y cabeza de salida no atados.

El modelo resulta relevante para investigadores que trabajan en inicialización de pesos, en dinámicas de preentrenamiento sobre código y en la reproducibilidad de experimentos de entrenamiento a gran escala. No está pensado para uso en producción ni para tareas conversacionales, sino como artefacto de investigación con trazabilidad detallada del origen de los pesos y de las métricas de validación registradas durante el entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (`LlamaForCausalLM`) |
| Parámetros totales | 1.872.857.088 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens (entrenamiento) |
| Tipos de cuantización | No disponible (el repositorio publica pesos en FP32 safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (código fuente) |
| Licencia | No disponible |
| Formato de pesos | safetensors (FP32 sin estado de optimizador ni scheduler) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama estándar: 24 capas, hidden size de 2048, intermediate size de 8192 y 32 cabezas de atención y de KV. Los embeddings de entrada (64.000 filas) y la cabeza de salida están desatados y se conservan exactamente tal como estaban en el checkpoint original. La exportación se realizó a safetensors en FP32, sin estado de optimizador ni scheduler, y el repositorio incluye un `conversion_report.json` que documenta la verificación de logits originales frente a los de Transformers en longitudes de secuencia 8, 128 y 1024, la igualdad exacta de cada tensor tras recargar, la paridad del tokenizer con el GPT-2 de `tiktoken`, la coherencia entre forward con caché y sin caché, y una prueba de humo de generación.

El entrenamiento se realizó sobre CodeParrot con semilla 8, partiendo de un checkpoint de un experimento previo de autómata celular neuronal (NCA) con 10 colores, banda GZIP 0.5-1.0, semilla de preentrenamiento 3 y checkpoint de época 10. El nombre de ejecución embebido es `full-codeparrot/ca-pt-10-colors-gzip-0.5-1.0-3-seed-10-epoch/8-seed` y el ID de ejecución de W&B es `c1ihnb47`. La model card advierte explícitamente de que los nombres de directorio copiados y etiquetas de evaluación antiguas como `nca_epoch7` o `nca_epoch8` son engañosas: 7 y 8 son semillas de la fase downstream, no épocas de preentrenamiento NCA, y el directorio copiado de la semilla 8 contiene por error la banda GZIP 0.3-0.4 aunque su nombre de ejecución embebido registra 0.5-1.0.

Las pérdidas de validación registradas a paso de optimizador 24.000 son 0.610557624325 para esta ejecución NCA con semilla 8, frente a 0.612319200089 para la NCA con semilla 7 y 0.665801837119 y 0.616333815306 para las ejecuciones desde cero (scratch) con semillas 7 y 8 respectivamente. La model card subraya que estas cifras son métricas históricas del entrenamiento y no mediciones nuevas sobre los pesos finales exportados (paso 24.521 en NCA, 24.545 en scratch), y que las diferencias entre ejecuciones NCA mezclan el efecto de la semilla con el de la banda GZIP, por lo que no aíslan el efecto de esta última.

## Capacidades

- Generación de texto autoregresiva sobre código fuente en inglés, con especial énfasis en completar fragmentos de funciones y expresiones a partir de un prefijo.
- Modelización de lenguaje causal pura: no hay ajuste por instrucciones, RLHF ni DPO, por lo que no responde a formatos de chat ni a directivas conversacionales.
- Completado de código condicionado por contexto corto (hasta 1024 tokens), adecuado para fragmentos de funciones y bloques pequeños más que para ficheros completos.
- Tokenizer GPT-2 con 50.257 tokens definidos, mientras que el modelo conserva 64.000 filas de vocabulario; la configuración de generación guardada suprime los IDs 50.257-63.999 para evitar tokens no decodificables.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al inglés y al código fuente; no se declaran otros idiomas.

## Casos de uso

- Investigación sobre inicialización de pesos: el modelo sirve como punto de comparación directo frente a las ejecuciones scratch de la misma familia (semillas 7 y 8) para estudiar si la inicialización vía NCA mejora la pérdida de validación en preentrenamiento de código.
- Reproducibilidad de experimentos: el repositorio incluye metadatos de ejecución, ID de W&B y un informe de conversión con verificaciones de paridad de logits, lo que permite replicar el pipeline de exportación y auditar la correspondencia entre pesos originales y pesos de Transformers.
- Estudio del efecto de la banda GZIP en la inicialización NCA: al existir variantes con bandas 0.3-0.4 y 0.5-1.0, el modelo permite comparar el impacto de este hiperparámetro en la pérdida de validación sobre CodeParrot, con la cautela de que las semillas también difieren.
- Completado de código en entornos de investigación: con un prefijo como `def fibonacci(n):` el modelo genera continuaciones plausibles, útil para prototipos de autocompletado académico o para evaluar la calidad de representaciones aprendidas sobre código.
- Evaluación de tokenizers y vocabularios ampliados: la discrepancia entre las 50.257 entradas del tokenizer GPT-2 y las 64.000 filas del vocabulario del modelo constituye un caso de estudio práctico sobre supresión de IDs y manejo de tokens no decodificables en pipelines de generación.
- Base para experimentos de ajuste fino posteriores: al ser un checkpoint base en formato `LlamaForCausalLM` estándar, puede cargarse con Transformers sin código personalizado y servir como punto de partida para estudios de fine-tuning sobre código en inglés.
- Docencia y divulgación: la model card documenta con detalle las trampas de nomenclatura (épocas frente a semillas, directorios copiados con bandas incorrectas), lo que lo convierte en un ejemplo útil para enseñar buenas prácticas de trazabilidad en experimentos de ML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente recoge pérdidas de validación sobre CodeParrot registradas durante el entrenamiento en el paso 24.000:

| Checkpoint | Banda GZIP NCA | Pérdida de validación registrada (paso 24.000) |
|---|---|---:|
| NCA semilla 7 | 0.3-0.4 | 0.612319200089 |
| NCA semilla 8 (este modelo) | 0.5-1.0 | 0.610557624325 |
| Scratch semilla 7 | No aplica | 0.665801837119 |
| Scratch semilla 8 | No aplica | 0.616333815306 |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandarizada.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 7,5 GB solo para los pesos (1.872.857.088 parámetros × 4 bytes), más overhead de activaciones y caché KV; en la práctica, entre 8 y 10 GB para secuencias cortas.
- VRAM estimada en FP16/BF16: alrededor de 3,75 GB para los pesos, con un total práctico de 4 a 6 GB según longitud de secuencia y tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP32 (RTX 3070/4060 Ti, RTX 3080, RTX 4090, A10, L4) o con 4-6 GB para FP16 (RTX 3060, RTX 4060). Para lotes grandes o evaluación por lotes, A100 o H100 aportan margen sobrado.
- Cabe en GPU de consumo: sí, en FP16 en tarjetas de 6 GB o más y en FP32 en tarjetas de 8 GB o más.
- Opciones de despliegue: Transformers (probado con la versión 4.53.0 y PyTorch 2.8.0+cu128), text-generation-inference (el modelo lleva la etiqueta `text-generation-inference` y `endpoints_compatible`), y servidores compatibles con la API de endpoints. No se documentan variantes GGUF, por lo que llama.cpp y Ollama requerirían una conversión manual no verificada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Pérdida de validación (paso 24.000) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| codeparrot-llama-1.6b-from-nca-gzip-0.5-1.0-seed-8 | 1.872.857.088 | 1024 | 0.610557624325 | No disponible | Hugging Face |
| codeparrot-llama-1.6b-from-nca-gzip-0.3-0.4-seed-7 | No disponible | No disponible | 0.612319200089 | No disponible | Hugging Face |
| codeparrot-llama-1.6b-scratch-seed-7 | No disponible | No disponible | 0.665801837119 | No disponible | Hugging Face |
| codeparrot-llama-1.6b-scratch-seed-8 | No disponible | No disponible | 0.616333815306 | No disponible | Hugging Face |

Las tres alternativas pertenecen a la misma familia experimental del mismo autor y comparten arquitectura y corpus de entrenamiento; las diferencias radican en la inicialización (NCA frente a scratch), la banda GZIP y la semilla. No se dispone de comparación con modelos de código de terceros (por ejemplo, CodeLlama, StarCoder o Qwen-Coder) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo ajustado por instrucciones ni por preferencias: no debe esperarse que siga directivas, mantenga formato de chat o rechace peticiones inapropiadas.
- Ventana de contexto de solo 1024 tokens, insuficiente para ficheros de código completos o conversaciones multi-turno largas.
- Entrenado exclusivamente sobre CodeParrot en inglés; el rendimiento en otros idiomas o en texto natural no está caracterizado.
- Riesgo de alucinación inherente a un modelo base: puede generar código sintácticamente plausible pero semánticamente incorrecto, sin mecanismo de verificación.
- Discrepancia entre el vocabulario del tokenizer (50.257 tokens GPT-2) y las 64.000 filas del modelo: si se sustituye `generation_config` o se implementa un bucle de muestreo propio, es obligatorio preservar la supresión de los IDs 50.257-63.999 para evitar tokens no decodificables.
- El padding utiliza el token EOS de GPT-2 (50256); en lotes con padding es necesario proporcionar una máscara de atención.
- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido; debe consultarse con el autor antes de cualquier despliegue en producción.
- La model card advierte de inconsistencias en la nomenclatura de directorios y etiquetas de evaluación heredadas (`nca_epoch7`/`nca_epoch8` se refieren a semillas downstream, no a épocas NCA), así como de que el directorio copiado de la semilla 8 contiene por error la banda GZIP 0.3-0.4 pese a que el nombre de ejecución embebido registra 0.5-1.0.
- Las pérdidas de validación publicadas corresponden al paso 24.000 y no a los pesos finales exportados (paso 24.521), por lo que no deben citarse como rendimiento del checkpoint final.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-from-nca-gzip-0.5-1.0-seed-8
- Modelo de referencia de la familia: https://huggingface.co/hanseungwook/fineweb-edu-llama-1.6b-from-nca
- Variante NCA semilla 7 (GZIP 0.3-0.4): https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-from-nca-gzip-0.3-0.4-seed-7
- Variante scratch semilla 7: https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-scratch-seed-7
- Variante scratch semilla 8: https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-scratch-seed-8
- Metadatos de entrenamiento: https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-from-nca-gzip-0.5-1.0-seed-8/blob/main/training_metadata.json
- Informe de conversión: https://huggingface.co/hanseungwook/codeparrot-llama-1.6b-from-nca-gzip-0.5-1.0-seed-8/blob/main/conversion_report.json
