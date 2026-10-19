# JoshuaCalhoon/Qwen3.8-27B-MLX-4bit-GPTQ

## Resumen

`JoshuaCalhoon/Qwen3.8-27B-MLX-4bit-GPTQ` es una cuantización comunitaria de 4 bits en formato MLX del modelo multimodal `Qwen/Qwen3.8-27B`, publicada por el usuario JoshuaCalhoon. No es un modelo nuevo ni un entrenamiento desde cero: es un artefacto de compresión pensado para ejecutar el modelo base de Qwen en Apple Silicon, con la torre de visión incluida y mantenida en bf16. El repositorio ocupa 15,7 GB y los pesos reales declarados en safetensors suman 26.895.993.856 parámetros (unos 26,9 mil millones).

El interés de esta ficha no está en la arquitectura del modelo base, sino en la receta de cuantización: cuantización afín de 4 bits con grupo de 128, calibración GPTQ capa por capa sobre sesiones multirritmo de programación agéntica (llamadas a herramientas, salida de shell, diffs y prosa) y una política de precisión mixta que sube a 6 y 8 bits los tensores más sensibles (`lm_head`, proyecciones de atención completa y proyecciones de atención lineal). El autor reporta una divergencia KL de 0,0747 frente al bf16, con un 92,5 % de coincidencia top-1, y un tamaño un 6,5 % menor que la cuantización de referencia de `mlx-community`.

Es relevante ahora por dos motivos: el modelo base incorpora visión y una arquitectura híbrida de atención lineal y completa, y el ecosistema MLX carece todavía de cuantizaciones calibradas con GPTQ para cargas de trabajo de agentes y código. Aun así, todos los datos de calidad son autodeclarados por el autor y no hay benchmarks estándar (MMLU, HumanEval, GSM8K) publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal y atención completa, más torre de visión (inferido de la receta: 48 capas con `in_proj_a`/`in_proj_b` de atención lineal y 16 capas con `k_proj`/`v_proj` de atención completa) |
| Parametros totales | 26.895.993.856 (~26,9 B) |
| Parametros activos | No aplica: no es un modelo MoE según la información disponible |
| Longitud de contexto | No disponible en la información proporcionada; la evaluación del autor se ejecutó con 64K de contexto |
| Tipos de cuantizacion | 4 bits afín con grupo de 128 (embeddings incluidos); precisión mixta: `lm_head` 6 bits/g64, `k_proj` y `v_proj` 8 bits/g64 (16 capas), `in_proj_a` e `in_proj_b` 8 bits/g64 (48 capas); calibración GPTQ |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0, heredada de `Qwen/Qwen3.8-27B` |
| Formato de pesos | safetensors en formato MLX; 15,0 GB de pesos, 15,7 GB de repositorio |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que combina capas de atención lineal con capas de atención completa (48 y 16 respectivamente, según los módulos que el autor cuantiza a 8 bits) y añade una torre de visión, lo que lo sitúa en la categoría `image-text-to-text`. El pipeline declarado es `image-text-to-text` y la torre visual se conserva en bf16 dentro de esta cuantización, de modo que las capacidades de lectura de imágenes se mantienen intactas respecto al original. No se dispone en la información proporcionada de datos sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre si el modelo base usó RLHF, DPO u otras técnicas de alineamiento: esos detalles corresponden a la model card de Qwen y no se incluyen aquí.

La innovación de este artefacto es la receta de compresión. La cuantización es afín de 4 bits con grupo de 128, incluyendo embeddings, y se aplica GPTQ capa por capa con un conjunto de calibración específico: sesiones multirritmo de programación agéntica (llamadas a herramientas, salida de shell, diffs y prosa) extraídas de varios proyectos de software. Los anchos de bits por tensor quedan registrados en `config.json` dentro de `quantization_config`. El autor reporta también compatibilidad con el borrador especulativo `incoai/Qwen3.8-27B-DFlash2` a través del motor Splash, lo que permite decodificación especulativa sobre la cuantización.

## Capacidades

- Generación de texto conversacional y continuaciones de prosa, con los valores de muestreo del modelo base (temperatura 1.0, top_p 0.95, top_k 20).
- Razonamiento con modo thinking y control de `reasoning_effort`, heredados del modelo base.
- Generación y edición de código, incluyendo diffs y parches, dominio sobre el que se calibró la cuantización.
- Uso de herramientas y function calling en flujos agénticos de varios pasos, con interpretación de salida de shell.
- Lectura de imágenes y transcripción de capturas de pantalla: el autor reporta 60/60 valores dentro de tolerancia en una prueba de transcripción de screenshots.
- Capacidades multilingües: no disponible en la información proporcionada.
- Integración con decodificación especulativa mediante el borrador DFlash2 en el motor Splash.

## Casos de uso

- Asistente de programación agéntico en local: el modelo se calibró sobre sesiones con llamadas a herramientas, salida de shell y diffs, por lo que encaja en bucles de tipo «leer repositorio, ejecutar tests, aplicar parche» ejecutados íntegramente en un portátil Apple Silicon.
- Revisión de código y generación de parches en CI/CD: al soportar tool calling y mantener coherencia en formatos de diff, puede insertarse como paso de revisión automática en pipelines, con la ventaja de que los pesos caben en 15 GB y no requieren GPU dedicada.
- Diagnóstico de errores a partir de trazas y salida de terminal: la calibración incluye output de shell real, lo que reduce la tasa de respuestas genéricas ante mensajes de error largos y ruidosos.
- Transcripción de capturas de pantalla y documentación técnica: la torre de visión en bf16 permite extraer texto y valores de imágenes (tablas, paneles, formularios) sin degradación apreciable según la prueba del autor.
- Asistencia sobre repositorios con contexto largo: la evaluación se realizó con 64K de contexto, suficiente para incluir varios ficheros y el histórico de una conversación de depuración, siempre que la memoria unificada del equipo lo permita.
- Desarrollo con requisitos de privacidad: al ejecutarse en MLX sobre hardware local, el código y los datos no salen del equipo, lo que lo hace apto para entornos con restricciones de confidencialidad.
- Prototipado de agentes multimodales: combinación de lectura de imágenes, razonamiento multi-paso y tool calling para automatizar tareas de escritorio o QA de interfaces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor únicamente publica métricas de fidelidad de la cuantización frente al modelo base en bf16, sobre 96 secuencias y 37,8K tokens de datos retenidos de proyectos no incluidos en el conjunto de calibración:

| Metrica | Esta cuantizacion | mlx-community/Qwen3.8-27B-4bit |
|---|---|---|
| KL vs bf16 (menor es mejor) | 0,0747 | 0,1175 |
| Coincidencia top-1 con bf16 | 92,5 % | 88,1 % |
| Tamano en disco | 15,0 GB | 16,05 GB |
| Decodificacion, un solo stream | 37,7 tok/s | 36,6 tok/s |

Condiciones de la medición de velocidad: Apple M5 Pro con 48 GB de memoria unificada, servido con Splash y el borrador especulativo `incoai/Qwen3.8-27B-DFlash2`, contexto de 64K y generación larga. El propio autor califica la diferencia de velocidad como indistinguible del ruido y enmarca la ganancia como «calidad por byte». En la prueba de lectura de imágenes (60/60 valores en tolerancia) la cuantización de `mlx-community` obtuvo el mismo resultado, y en la suite de programación agéntica el autor describe los resultados como «sin regresión», no como una victoria demostrada, con una sola muestra por ítem.

## Requisitos de hardware

- Pesos: 15,0 GB en disco (15,7 GB de repositorio) más la torre de visión en bf16 y la caché KV del contexto utilizado.
- Memoria: al ser MLX, requiere Apple Silicon con memoria unificada. Con 16 GB el margen es muy ajustado; 32 GB es el mínimo razonable para contextos medios, y la medición del autor se hizo con 48 GB.
- GPU: exclusivamente GPU integrada de Apple (series M). Este formato no se ejecuta en CUDA ni en GPU NVIDIA; para ese hardware haría falta otra cuantización del modelo base.
- Cabe en equipos de consumo: sí, en Mac con chip M y 32-48 GB de memoria unificada. No es desplegable en GPUs de consumo tipo RTX 4090 con este formato.
- Despliegue: motor Splash (`serve --model JoshuaCalhoon/Qwen3.8-27B-MLX-4bit-GPTQ`) y `mlx_lm.load` para el modelo de texto. El autor indica que otros runtimes MLX no han sido probados; no hay datos de mlx-vlm, llama.cpp, Ollama, vLLM ni TGI para este artefacto.
- Rendimiento: 37,7 tok/s de decodificación en un solo stream sobre M5 Pro de 48 GB con decodificación especulativa y contexto de 64K. No se publican datos de throughput por lotes ni de latencia de prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Calidad declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| JoshuaCalhoon/Qwen3.8-27B-MLX-4bit-GPTQ | ~26,9 B | No disponible (evaluado a 64K) | MLX safetensors, 4 bits GPTQ con precisión mixta, 15,0 GB | KL 0,0747; top-1 92,5 % vs bf16 | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| mlx-community/Qwen3.8-27B-4bit | ~26,9 B (mismo base) | No disponible | MLX 4 bits, 16,05 GB | KL 0,1175; top-1 88,1 % vs bf16 | Apache 2.0 (heredada) | HuggingFace (referencia usada por el autor) |
| Qwen/Qwen3.8-27B (bf16) | ~26,9 B | No disponible | safetensors bf16 | Referencia de comparación | Apache 2.0 | HuggingFace, modelo oficial |

No se dispone de datos para comparar con modelos de otros fabricantes del mismo rango de tamaño, ni de resultados de benchmarks que permitan situar esta cuantización frente a alternativas de 4 bits en otros formatos (GGUF, AWQ, EXL2).

## Limitaciones y advertencias

- Todos los datos de calidad y velocidad son autodeclarados por el autor de la cuantización; no hay evaluación independiente ni benchmarks estándar publicados.
- El conjunto de calibración está sesgado hacia código y flujos agénticos: es esperable una mayor degradación relativa en dominios como prosa creativa, matemáticas o multilingüe, que no se midieron.
- La comparación en la suite agéntica usa una sola muestra por ítem y el propio autor la describe como «sin regresión», no como mejora demostrada; la evidencia estadística es débil.
- La cuantización introduce pérdida inevitable: 7,5 % de desacuerdo top-1 con el bf16 incluso en el mejor caso, lo que puede manifestarse en errores puntuales de sintaxis o de valores numéricos en tareas de precisión.
- Riesgo de alucinación inherente al modelo base, agravado en un 4 bits cuando se piden citas textuales, API inexistentes o valores extraídos de imágenes.
- Idiomas soportados no documentados en esta ficha; conviene verificar el comportamiento en castellano antes de usarlo en producción.
- Longitud máxima de contexto no confirmada en la información disponible; los 64K citados corresponden a la configuración de la prueba, no necesariamente al límite del modelo base.
- Dependencia de hardware Apple Silicon: el artefacto no es portable a CUDA y no hay datos de otros runtimes MLX distintos de Splash y `mlx_lm`.
- El autor solo ha probado `mlx_lm` para el modelo de texto; no hay confirmación de que la torre de visión funcione en ese cargador (el pipeline declarado es `image-text-to-text`).
- Licencia Apache 2.0 heredada, permisiva para uso comercial, pero conviene revisar la licencia y las condiciones del modelo base en `Qwen/Qwen3.8-27B` antes de redistribuir.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoshuaCalhoon/Qwen3.8-27B-MLX-4bit-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Cuantización de referencia para comparación: mlx-community/Qwen3.8-27B-4bit (referenciada en la model card; sin URL directa en la información proporcionada)
- Borrador especulativo usado en las mediciones: incoai/Qwen3.8-27B-DFlash2 (referenciado en la model card; sin URL directa en la información proporcionada)
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; las búsquedas devolvieron únicamente contenido no relacionado.
