# sahilchachra/MiniCPM5-2B-MXFP4

## Resumen

MiniCPM5-2B-MXFP4 es una cuantización de 4 bits del modelo openbmb/MiniCPM5-2B, publicada por el usuario sahilchachra. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada exclusivamente a MLX, el framework de Apple para inferencia en silicio de la serie M. El resultado ocupa aproximadamente 1,3 GB en disco y mantiene la arquitectura original declarada como `LlamaForCausalLM`, es decir, un transformer decoder-only estándar sin código personalizado, lo que simplifica su carga en runtimes compatibles.

El modelo cuenta con 2.516.756.480 parámetros (unos 2,52 mil millones) y se distribuye en formato safetensors con cuantización MXFP4 de 4 bits y tamaño de grupo 32, generada mediante `mlx_lm.convert -q --q-mode mxfp4`. Su relevancia práctica es acotada pero concreta: permite ejecutar un modelo conversacional de ~2,5B en un Mac con memoria unificada modesta, sin depender de GPUs NVIDIA ni de servicios en la nube, lo que encaja en escenarios de privacidad estricta y prototipado offline.

La ficha presenta varias lagunas de información relevantes: la model card no declara licencia, idiomas soportados, longitud de contexto ni resultados de benchmarks. Además, el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria más allá de las pruebas de humo declaradas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (`LlamaForCausalLM`) |
| Parametros totales | 2.516.756.480 (~2,52 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4 bits, group size 32); el autor publica tambien variantes MXFP8 y OptiQ 5-bpw |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX) |
| Modelo base | openbmb/MiniCPM5-2B |
| Libreria | mlx |
| Tamano del repositorio | ~1,3 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-11 |

## Arquitectura y entrenamiento

La cuantización conserva la arquitectura del modelo base, declarada en la model card como `LlamaForCausalLM`, un transformer decoder-only clásico con atención causal. No se introduce ningún componente propietario ni módulo de atención lineal, mezcla de expertos o espacio de estados: el autor indica explícitamente que no requiere código personalizado. El único cambio respecto al modelo original es la representación numérica de los pesos, convertida a MXFP4 (formato de punto flotante de 4 bits con escalas compartidas por grupos de 32 elementos) mediante la herramienta `mlx_lm.convert` con el modo `mxfp4`.

No hay información disponible sobre el entrenamiento del modelo base: se desconoce el número de tokens utilizados, la composición del dataset, si hubo fases de ajuste por instrucciones, RLHF o DPO, y tampoco se detalla el proceso de destilación o las innovaciones técnicas aplicadas por openbmb. La model card de esta cuantización únicamente documenta el procedimiento de conversión y una verificación de humo mediante `mlx_lm.load` y `mlx_lm.generate`, en la que se comprueba que las respuestas son coherentes y mantienen el estilo de chat del modelo original, sin truncamientos ni salidas corruptas.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat aplicable mediante `tokenizer.apply_chat_template`.
- Razonamiento y estilo de respuesta tipo chat-reasoning, según la verificación declarada por el autor de la cuantización.
- Integración con la API local compatible con OpenAI de LM Studio (`localhost:1234/v1/chat/completions`), lo que permite usarla desde clientes que hablen ese protocolo.
- Carga directa en `mlx-lm` para scripts de Python en Apple Silicon.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (la model card no lista idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en macOS: el modelo se carga con `mlx_lm` o LM Studio sobre un Mac con memoria unificada, de modo que las conversaciones nunca salen del equipo. Es adecuado porque el peso cuantizado ocupa ~1,3 GB y no requiere GPU dedicada.
- Procesamiento de texto con requisitos de privacidad estricta: entornos sanitarios, jurídicos o de investigación donde no se permite enviar datos a APIs externas pueden ejecutar este modelo como generador de borradores y resúmenes en local.
- Prototipado rápido de aplicaciones de chat: gracias a la compatibilidad con la API OpenAI de LM Studio, se puede desarrollar y probar una interfaz con el SDK de OpenAI apuntando a `localhost:1234` y sustituir después el backend por un modelo mayor sin reescribir el cliente.
- Aplicaciones de escritorio y plugins para desarrolladores: al ser un modelo de ~2,5B en 4 bits, puede embeberse en herramientas de productividad para Mac que necesiten generación de texto sin conexión.
- Generación de texto en lotes pequeños sobre hardware Apple: pipelines de etiquetado, reformateo o normalización de textos que aprovechan la NPU/GPU integrada del chip M en lugar de instancias cloud.
- Base para experimentos de cuantización y evaluación: al existir variantes MXFP8 y OptiQ 5-bpw del mismo modelo, sirve como punto de comparación controlado para medir el impacto de la precisión en la calidad de salida.
- Demostraciones y docencia sobre MLX: permite ilustrar el flujo completo de conversión, carga y generación con `mlx_lm` en un portátil, sin infraestructura adicional.
- Evaluación comparativa interna: útil como línea base de bajo coste antes de decidir si se justifica desplegar un modelo mayor para una tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente menciona una prueba de humo cualitativa mediante `mlx_lm.load` y `mlx_lm.generate`, sin métricas numéricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación. Tampoco se reportan medidas de latencia o throughput.

## Requisitos de hardware

- Peso en disco: ~1,3 GB para la cuantización MXFP4.
- Memoria estimada para inferencia: del orden de 2 a 3 GB de memoria unificada, sumando pesos, caché KV y overhead del runtime de MLX (estimación derivada del tamaño del repositorio, no confirmada por el autor).
- Plataforma soportada: Apple Silicon (serie M). El formato MLX no se ejecuta de forma nativa en GPUs NVIDIA o AMD.
- Viabilidad en equipos de consumo: sí, cabe con holgura en cualquier Mac con 8 GB de memoria unificada o superior.
- GPU recomendadas: no aplica el catálogo CUDA (A100, H100, RTX 4090); el equivalente funcional es cualquier chip M1 o posterior.
- Opciones de despliegue: `mlx-lm` (Python) y LM Studio con el motor MLX. Otros runners como vLLM, TGI, llama.cpp u Ollama no cargan este repositorio tal cual, ya que esperan formatos distintos (safetensors de PyTorch o GGUF); para esos casos habría que usar el modelo base o generar una conversión propia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la información proporcionada. La comparación más fiable posible es entre las tres cuantizaciones publicadas por el mismo autor a partir del mismo modelo base:

| Modelo | Cuantizacion | Tamano en disco | Libreria | Licencia | Descargas |
|---|---|---|---|---|---|
| sahilchachra/MiniCPM5-2B-MXFP4 | MXFP4, 4 bits, group size 32 | ~1,3 GB | mlx | no disponible | 0 |
| sahilchachra/MiniCPM5-2B-MXFP8 | MXFP8 | no disponible | mlx | no disponible | no disponible |
| sahilchachra/MiniCPM5-2B-OptiQ-5bpw | OptiQ, 5 bits por peso | no disponible | mlx | no disponible | no disponible |
| openbmb/MiniCPM5-2B (base) | sin cuantizar | no disponible | no disponible | no disponible | no disponible |

Comparación con alternativas de otros fabricantes (Qwen, Llama, Gemma en el rango de 1B a 3B): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Licencia sin declarar: ni la model card de esta cuantización ni los metadatos del repositorio especifican licencia. Es imprescindible consultar la licencia del modelo base openbmb/MiniCPM5-2B antes de cualquier uso comercial, ya que una cuantización derivada hereda las restricciones del original.
- Idiomas no documentados: se desconoce qué lenguas cubre el modelo y con qué calidad, por lo que no puede asumirse un rendimiento fiable en castellano sin evaluación previa.
- Longitud de contexto desconocida: no se indica la ventana máxima, lo que impide planificar aplicaciones que dependan de contextos largos.
- Riesgo de alucinación: inherente a los modelos de ~2,5B; no hay evaluación publicada que cuantifique la tasa de error, y la única verificación reportada es una prueba de humo cualitativa.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; el repositorio no ha sido contrastado por terceros.
- Degradación por cuantización: la conversión a 4 bits con escalas por grupos de 32 puede afectar a tareas sensibles a la precisión numérica (matemáticas, código), pero no se han publicado comparativas frente al modelo base en MXFP8 o sin cuantizar.
- Dependencia de plataforma: el formato MLX limita el despliegue a Apple Silicon; no es portable a servidores con GPU NVIDIA sin reconvertir los pesos.
- Trazabilidad: el autor de la cuantización no es el desarrollador del modelo base, de modo que cualquier incidencia de calidad debe atribuirse con cautela al proceso de conversión o al modelo original.
- Fecha de publicación inusual: los metadatos indican creación el 2026-09-11, dato que conviene verificar antes de citarlo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sahilchachra/MiniCPM5-2B-MXFP4
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Cuantizacion MXFP8 del mismo autor: https://huggingface.co/sahilchachra/MiniCPM5-2B-MXFP8
- Cuantizacion OptiQ 5-bpw del mismo autor: https://huggingface.co/sahilchachra/MiniCPM5-2B-OptiQ-5bpw
- Repositorio de MLX: https://github.com/ml-explore/mlx
- Documentacion y herramientas de mlx-lm: no disponible en los resultados de busqueda (la busqueda web solo devolvio enlaces genericos a YouTube, sin relacion con el modelo)
