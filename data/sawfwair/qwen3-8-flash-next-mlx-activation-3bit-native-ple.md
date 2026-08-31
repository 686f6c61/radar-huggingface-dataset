# Sawfwair/Qwen3.8-Flash-Next-MLX-Activation-3bit-Native-PLE

## Resumen

El modelo `Sawfwair/Qwen3.8-Flash-Next-MLX-Activation-3bit-Native-PLE` es una conversión cuantizada en 3 bits (con ponderación por activación) del modelo multimodal `Qwen/Qwen3.8-Flash-Next`, realizada por el usuario Sawfwair. El modelo original, desarrollado por el equipo Qwen de Alibaba, es un LLM experimental de 180.000 millones de parámetros (125B principales, 51B de embedding n-gram y 4B de cabezal MTP) con arquitectura híbrida de atención GDN + QSA y contexto nativo de 262.144 tokens. Esta conversión específica está pensada para ejecutarse en Apple Silicon mediante la librería MLX, e incorpora un empaquetado "Native PLE" que optimiza la carga en memoria de los tensores con mayor peso.

La relevancia de este modelo radica en que permite ejecutar un sistema de 180B en hardware de consumo (una Mac con 128 GiB de RAM) gracias a una cuantización mixta agresiva (Q3 y Q4) y a un mecanismo de colocación de datos que reduce el pico de memoria en aproximadamente un 20% respecto a la versión Q4 del mismo autor. El checkpoint cuantizado ocupa 89,7 GB en disco y contiene 26.121.412.179 parámetros en formato safetensors, aunque el modelo original mantiene su arquitectura completa. Está diseñado para tareas de imagen-texto (image-text-to-text), incluyendo OCR y razonamiento visual, y se distribuye bajo la licencia Qwen Community 1.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida GDN + QSA (del modelo base Qwen3.8-Flash-Next) |
| Parametros totales | 26.121.412.179 (checkpoint cuantizado); modelo original: 180B (125B main + 51B n-gram + 4B MTP) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | Mixta: Q3/group-64 (144 módulos), Q4/group-32 (128 módulos), Q4/group-64 (783 módulos), Q2 (0 módulos) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-Flash-Next` emplea una arquitectura híbrida de atención denominada GDN + QSA, según el repositorio oficial de QwenLM. No se dispone de detalles adicionales sobre el significado de estas siglas ni sobre la composición exacta de los bloques. El modelo original incluye tres componentes principales: un cuerpo principal de 125B parámetros, un embedding n-gram de 51B parámetros y un cabezal de predicción multi-token (MTP) de 4B parámetros. La conversión de Sawfwair preserva todos los tensores del checkpoint original byte a byte y aplica una cuantización nueva: los 48 bancos de expertos enrutados base utilizan códigos afines Q3/group-64 generados directamente desde el checkpoint BF16, con escalas y sesgos reajustados contra los segundos momentos de las entradas de los expertos (tanto de imagen como de texto). Las matrices restantes elegibles (core, MTP y visión) se mantienen en Q4, y la tabla n-gram de 160 de ancho se cuantiza en Q4/group-32.

El entrenamiento del modelo original no está documentado en la información proporcionada. La conversión no requiere un paso de optimización adicional: el empaquetado "Native PLE" incluye un manifiesto (`MERERUN_PLE_STORE.json`) que permite a un runtime compatible (mere.run o mlx-vlm) copiar solo los 33 archivos safetensors con tensores PLE a una caché interna, verificando tamaño y SHA-256. Esto reduce la huella de memoria activa en un 19,58% respecto a la versión Q4 del mismo autor, según las pruebas de validación incluidas en la model card.

## Capacidades

- Generación de texto y conversación multimodal: el modelo acepta entradas de imagen y texto, y produce respuestas textuales (pipeline `image-text-to-text`).
- Reconocimiento óptico de caracteres (OCR): la validación interna incluye casos de imagen y OCR con salidas exactas.
- Razonamiento visual: puede procesar imágenes y responder preguntas sobre su contenido.
- Contexto largo: ventana nativa de 262.144 tokens, adecuada para documentos extensos o conversaciones multi-turno.
- Predicción multi-token (MTP): el cabezal MTP permite generar varios tokens por paso, acelerando la inferencia.
- Compatibilidad con runtimes específicos: mere.run y mlx-vlm (este último para Apple Silicon).
- No se documenta soporte explícito de tool calling, function calling ni modos de agente.

## Casos de uso

- Análisis de documentos escaneados: gracias a su capacidad OCR y a la ventana de 262K tokens, el modelo puede extraer y razonar sobre el contenido de documentos largos con imágenes, como contratos o informes.
- Asistentes de atención al cliente con contexto amplio: puede mantener conversaciones multi-turno con historial extenso sin perder información relevante, gracias a su contexto nativo.
- Generación de código con soporte visual: al aceptar imágenes, puede interpretar diagramas o capturas de pantalla de código y generar o explicar implementaciones.
- Procesamiento de archivos PDF con gráficos y tablas: combina OCR con razonamiento para responder preguntas sobre figuras y datos incrustados.
- Investigación académica: análisis de artículos científicos con figuras, ecuaciones y referencias largas.
- Despliegue en entornos Apple Silicon: ideal para equipos que ya usan MLX y necesitan un modelo multimodal de gran tamaño en una sola máquina, sin depender de GPUs NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente una validación interna de no-regresión contra el checkpoint Q4 del mismo autor, realizada en una Mac Apple Silicon de 128 GiB:

- 58 de 61 casos con salida exacta esperada; los 3 fallos coincidieron con la salida del Q4.
- 16 casos de holdout sellado con salidas idénticas entre el candidato y el Q4, incluyendo 8 casos de imagen y OCR.
- Pico de memoria: 62.065.713.472 bytes para este perfil frente a 77.180.432.496 bytes para Q4 (reducción del 19,58%).
- Throughput de decodificación: 7,52 tok/s agregados con colocación interna frente a 6,22 tok/s con fuente externa (+20,8%), en una serie de 7 peticiones de 128 tokens bajo carga de Spotlight/UI.

Estos datos no constituyen una evaluación general de calidad ni paridad con BF16.

## Requisitos de hardware

- Probado en Apple Silicon con 128 GiB de RAM; el pico de memoria durante la inferencia fue de aproximadamente 62 GiB para este perfil (frente a 77 GiB para la versión Q4).
- No se proporcionan requisitos de VRAM para GPUs NVIDIA ni AMD; el modelo está diseñado para MLX, que solo funciona en Apple Silicon.
- Tamaño del repositorio: 89,7 GB en disco (83,49 GiB de payload).
- Runtime recomendado: mere.run (versión v0.45.0 o superior) o mlx-vlm.
- Para almacenamiento externo, se recomienda un SSD con suficiente espacio y mantener el volumen montado durante la inferencia.
- No se indican opciones de despliegue con vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa con otros modelos de la misma categoría. El autor publica también una versión Q4 del mismo modelo (`Sawfwair/Qwen3.8-Flash-Next-MLX-4bit`) y una versión mixta 2-bit (`Sawfwair/Qwen3.8-Flash-Next-MLX-Mixed-2bit`, con 21,8B parámetros y 36 GB de VRAM según LLM Explorer), pero no se han encontrado especificaciones detalladas de estas variantes. El modelo base `Qwen/Qwen3.8-Flash-Next` es el punto de referencia natural, pero sus métricas de rendimiento no están publicadas en la información disponible. Por tanto, la comparativa se limita a señalar que existen otras cuantizaciones del mismo modelo con diferentes equilibrios entre tamaño, memoria y calidad.

## Limitaciones y advertencias

- La cuantización en 3 bits (Q3) puede degradar la calidad de generación en tareas complejas, aunque la validación interna no mostró regresiones frente al Q4 en los casos probados.
- La licencia Qwen Community 1.0 incluye requisitos de atribución para productos comerciales muy grandes y condiciones de licencia separadas para usos comerciales de Model-as-a-Service y "AI Work Assistant". Revisar los términos antes de usar comercialmente.
- No se han publicado benchmarks independientes; la calidad general no está establecida.
- El modelo depende de runtimes específicos (mere.run o mlx-vlm) y no es directamente compatible con frameworks estándar como Transformers o vLLM sin adaptación.
- El contexto nativo de 262K tokens puede requerir mucha memoria si se utiliza en su totalidad; el perfil de 3 bits reduce el pico pero sigue necesitando ~62 GiB.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos, pero al ser un modelo cuantizado y experimental, es recomendable validar las salidas en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un uso limitado y poca validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sawfwair/Qwen3.8-Flash-Next-MLX-Activation-3bit-Native-PLE
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Versión Q4 del mismo autor: https://huggingface.co/Sawfwair/Qwen3.8-Flash-Next-MLX-4bit
- Entrada en LLM Explorer sobre la versión mixta 2-bit: https://llm-explorer.com/model/Sawfwair%2FQwen3.8-Flash-Next-MLX-Mixed-2bit,2HI4EEDzyzguAVRyWB6kU9
