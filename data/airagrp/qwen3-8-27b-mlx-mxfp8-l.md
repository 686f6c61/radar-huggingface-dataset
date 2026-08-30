# airagrp/Qwen3.8-27B-mlx-mxfp8-L

## Resumen

El modelo `airagrp/Qwen3.8-27B-mlx-mxfp8-L` es una conversión al formato MLX del modelo multimodal `Qwen/Qwen3.8-27B` de Alibaba, preparada por el usuario airagrp para su uso con la librería `mlx-vlm`. El modelo original es un transformer denso de 27.000 millones de parámetros que combina visión y texto, con soporte nativo para vídeo, modos de razonamiento (thinking e instruct) y una ventana de contexto de 262.000 tokens. Esta conversión aplica una cuantización mixta: las proyecciones MLP y parte de la atención se cuantizan a mxfp8 (8 bits, group_size=32), mientras que el resto de los módulos (embeddings, cabeza de salida, atención lineal GDN, torre de visión y la cabeza MTP) se mantienen en bfloat16.

La relevancia de este modelo radica en que ofrece una versión optimizada para hardware Apple Silicon (MLX) de un modelo de última generación con capacidades de agente, tool calling y decodificación especulativa mediante la cabeza MTP integrada. El repositorio reduce el tamaño de los pesos de aproximadamente 54 GB (bfloat16) a unos 37 GB, lo que facilita su despliegue en equipos con memoria unificada de 64 GB o más. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (visión + texto) con atención híbrida: 16 capas con atención completa y 48 capas con atención lineal GDN. Incluye cabeza MTP para decodificación especulativa. |
| Parametros totales | 14.179.548.848 (según safetensors del repo convertido; el modelo base se anuncia como 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens (contexto nativo del modelo base) |
| Tipos de cuantizacion | mxfp8 (group_size=32, bits=8) para MLP y atención completa; bfloat16 para atención lineal, embeddings, cabeza de salida, MTP y torre de visión |
| Idiomas soportados | En (inglés) según el repositorio; el modelo base puede soportar más idiomas, pero no se especifica |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con tensores de escala para mxfp8 |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer denso multimodal desarrollado por el equipo Qwen de Alibaba. Su arquitectura combina una torre de visión (mantenida en bfloat16 en esta conversión) con un modelo de lenguaje que utiliza una mezcla de atención: 16 capas emplean atención completa (con proyecciones q, k, v, o cuantizadas a mxfp8) y 48 capas utilizan una atención lineal basada en GDN (probablemente Gated DeltaNet), que reduce el coste computacional en contextos largos. El modelo incorpora además una cabeza MTP (Multi-Token Prediction) que se ha fusionado en el checkpoint como tensores `language_model.mtp.*`, permitiendo decodificación especulativa sin necesidad de un modelo auxiliar separado.

En cuanto al entrenamiento, no se dispone de detalles específicos sobre el número de tokens o la composición del dataset en la información proporcionada. El modelo base se ha entrenado con técnicas de instrucción y alineación propias de la familia Qwen, incluyendo modos de razonamiento (thinking) y respuesta directa (instruct). La conversión MLX no modifica los pesos originales, solo aplica la cuantización mixta descrita en la receta: las capas MLP (gate, up, down) y las proyecciones de atención completa se cuantizan a mxfp8 con group_size de 32, mientras que el resto de los módulos se mantienen en bfloat16.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imágenes, vídeo y texto, con capacidad de responder a preguntas visuales y de razonamiento complejo.
- Modo thinking e instruct: soporta dos modos de generación, uno con razonamiento explícito paso a paso y otro con respuesta directa.
- Tool calling y function calling: el modelo base está optimizado para invocar herramientas y APIs de forma estructurada, lo que lo hace adecuado para flujos de agente.
- Agentes y multi-step reasoning: diseñado para tareas de larga duración con múltiples pasos, como planificación y ejecución de código.
- Decodificación especulativa: la cabeza MTP integrada permite acelerar la generación cuando se usa con `mlx-vlm` (`--draft-kind mtp`).
- Capacidades multilingües: aunque el repositorio indica solo inglés, el modelo base de Qwen suele soportar múltiples idiomas; no se confirma en esta conversión.
- Generación de código: el modelo base destaca en tareas de programación y automatización de oficina, según la documentación oficial.

## Casos de uso

- Automatización de oficina: el modelo puede generar documentos, resumir correos, extraer información de imágenes y tablas, y redactar respuestas en contextos empresariales, gracias a su capacidad multimodal y su ventana de 262K tokens.
- Asistente de programación local: con soporte para tool calling y generación de código, puede integrarse en entornos de desarrollo como un copiloto que ejecuta comandos, busca documentación o genera tests, ejecutándose en hardware Apple Silicon.
- Análisis de vídeo e imágenes: su torre de visión permite procesar vídeos e imágenes para tareas de descripción, búsqueda de objetos o extracción de información visual en tiempo real.
- Agente conversacional con memoria larga: la ventana de 262K tokens permite mantener conversaciones de larga duración con historial extenso, útil para atención al cliente o asistentes personales.
- Generación de informes técnicos: puede combinar texto e imágenes para crear documentación técnica, manuales o presentaciones a partir de datos visuales y textuales.
- Despliegue en entornos con restricciones de hardware: al ser una versión MLX cuantizada, puede ejecutarse en Mac Studio o MacBook Pro con 64 GB de memoria unificada, sin necesidad de GPU dedicada, para prototipado o inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentación del modelo base indica que los benchmarks son reportados por Alibaba y no han sido reproducidos de forma independiente, pero no se proporcionan cifras concretas en esta conversión.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 37.3 GB, por lo que se necesitan al menos 48 GB de memoria disponible para cargar los pesos en memoria (el modelo está en formato MLX, que usa memoria unificada en Apple Silicon).
- GPU recomendadas: en sistemas con GPU NVIDIA, se requiere una GPU con al menos 48 GB de VRAM (por ejemplo, A6000, A100 80GB, H100 80GB). No cabe en GPUs de consumo como RTX 4090 (24 GB) sin cuantización adicional.
- Apple Silicon: funciona en Mac Studio, MacBook Pro o Mac Pro con 64 GB de memoria unificada o más, gracias al formato MLX.
- Opciones de despliegue: se puede usar con `mlx-vlm` para inferencia multimodal, o con MLX directamente para tareas de texto. No se menciona soporte para vLLM, llama.cpp u otros motores en este repositorio.
- Latencia y throughput: no se proporcionan datos medidos. La decodificación especulativa con MTP puede reducir la latencia en comparación con la generación autoregresiva estándar, pero no hay cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B (denso) | 262K | Apache 2.0 | safetensors (bf16) | Modelo original de Alibaba, multimodal |
| airagrp/Qwen3.8-27B-mlx-mxfp8-L | 14.18B (según safetensors) | 262K | Apache 2.0 | MLX (mxfp8 + bf16) | Conversión cuantizada para Apple Silicon |
| Qwen2.5-VL-27B | 27B (denso) | 128K | Apache 2.0 | safetensors | Generación anterior de la familia Qwen, solo visión |
| Llama 3.2 Vision 11B | 11B (denso) | 128K | Llama 3.2 Community | safetensors | Alternativa multimodal de Meta, menos contexto |

Nota: la comparativa se basa en características declaradas; no hay datos de rendimiento independientes para ninguno de estos modelos en la información disponible.

## Limitaciones y advertencias

- El número de parámetros reportado en los safetensors (14.18B) es significativamente inferior a los 27B anunciados para el modelo base. Esta discrepancia no está explicada en el repositorio; podría deberse a la exclusión de ciertos componentes o a un error en el conteo. Se recomienda verificar la integridad del modelo antes de usarlo en producción.
- El repositorio solo indica inglés como idioma soportado; no se confirma el soporte multilingüe del modelo base en esta conversión.
- Los benchmarks del modelo base son reportados por Alibaba y no han sido verificados de forma independiente; el rendimiento real puede variar.
- La cuantización mxfp8 puede introducir una ligera pérdida de precisión en comparación con bfloat16, especialmente en tareas de razonamiento complejo o generación de código.
- Al ser una conversión MLX, no es compatible directamente con motores de inferencia estándar como vLLM o TGI sin una conversión adicional.
- El modelo puede presentar sesgos y alucinaciones inherentes a los modelos de lenguaje entrenados con datos web; se recomienda validar las salidas en aplicaciones críticas.
- La licencia Apache 2.0 permite uso comercial, pero se debe respetar la atribución y las condiciones de la licencia del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/airagrp/Qwen3.8-27B-mlx-mxfp8-L
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Documentación de Groq sobre Qwen3.8-27B: https://console.groq.com/docs/model/qwen/qwen3.8-27b
- Análisis del modelo en Neomanex: https://neomanex.com/models/qwen3-8-27b
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
