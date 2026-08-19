# manjunathshiva/Qwen3.8-27B-tq4-g64

## Resumen

Qwen3.8-27B-tq4-g64 es una cuantización **4-bit** del modelo multimodal Qwen/Qwen3.8-27B, realizada con la herramienta TurboQuant-MLX para ejecutarse en Apple Silicon mediante MLX. El modelo base es un transformer denso de 27.800 millones de parámetros con una arquitectura híbrida de atención: 48 de sus 64 capas usan Gated DeltaNet (atención lineal) y las 16 restantes usan atención completa, una de cada cuatro. Incluye un torre de visión de 27 bloques y un vocabulario de 248.320 tokens.

La cuantización es **data-free**: no requiere conjunto de calibración, usa rotación de Hadamard aleatoria, escala RMS por grupo y un codebook de Lloyd-Max para los pesos. El resultado reduce el tamaño en disco de 55,6 GB (bf16) a 15,15 GiB, una reducción de 3,7 veces, manteniendo las capacidades multimodales y de agente del modelo original. Está pensado para usuarios de Mac con suficiente memoria unificada (36 GB recomendados, 24 GB con ajustes) que necesiten un modelo local potente con visión y tool calling.

La relevancia actual radica en que permite ejecutar un modelo de 27B multimodal en un Mac de gama alta sin perder funcionalidades clave, a costa de una velocidad de decodificación modesta (11,4 tokens/s). Es una opción para quienes priorizan el tamaño y la capacidad sobre la latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (dense 27,8B, hybrid attention: 48 Gated DeltaNet + 16 full attention, 64 capas, vision tower 27 bloques) |
| Parametros totales | 27,8B (modelo base); 4.372.870.064 según safetensors del repo (discrepancia sin aclarar) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16.384 tokens (según proyección del planificador; el modelo base podría soportar más, no especificado) |
| Tipos de cuantizacion | TurboQuant 4-bit (tq4-g64) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer multimodal denso con una arquitectura de atención híbrida: 48 capas usan Gated DeltaNet, una variante de atención lineal que reduce el coste de la caché KV, y 16 capas usan atención completa (una de cada cuatro). Esto reduce drásticamente el uso de memoria para contexto largo: solo 16 de 64 capas almacenan caché, lo que supone 64 KB por token (1,07 GB a 16K de contexto).

La cuantización TurboQuant es data-free: aplica una rotación de Hadamard aleatoria a los pesos, calcula escalas RMS por grupo y construye un codebook de Lloyd-Max óptimo para la distribución rotada. Los pesos se decodifican en línea mediante kernels de Metal fusionados. No se utilizan datos de calibración ni ajuste posterior. El proceso reduce el tamaño de 55,6 GB a 15,15 GiB, manteniendo la visión (4/4 en pruebas internas) y las capacidades de agente (pasa el bucle observe → read → edit → verify de Opencode).

No se dispone de información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural.
- Comprensión de imágenes: OCR de texto renderizado, conteo de objetos, lectura de gráficos de barras y razonamiento espacial (4/4 en batería de pruebas internas).
- Tool calling / function calling: produce llamadas nativas bien formadas (`finish_reason: tool_calls`) y puede integrarse en flujos de agente.
- Capacidades de agente: ejecuta tareas de edición de código multi-paso (observar, leer, editar, verificar) con éxito en el entorno Opencode.
- Soporte multimodal: entrada de imagen y texto, salida de texto.
- Multilingüe: no especificado.

## Casos de uso

- Asistente de programación local en Mac: el modelo puede editar código, ejecutar tests y corregir errores de lógica (por ejemplo, un off-by-one en una función) siguiendo instrucciones de alto nivel, gracias a su tool calling y razonamiento multi-paso.
- Análisis de documentos con imágenes: extraer texto de capturas (OCR), interpretar gráficos y diagramas, y responder preguntas sobre el contenido visual en un entorno sin conexión.
- Automatización de tareas de oficina: leer capturas de pantalla, extraer datos de tablas o gráficos y generar resúmenes o informes en texto.
- Agente de soporte técnico: gestionar conversaciones multi-turno con contexto largo (hasta 16K tokens) y consultar herramientas externas (bases de conocimiento, APIs) mediante function calling.
- Prototipado de aplicaciones multimodales: construir demos de visión + lenguaje que se ejecutan íntegramente en un Mac, sin depender de servicios en la nube.
- Educación e investigación: experimentar con un modelo de 27B en local para estudiar comportamientos de atención híbrida y cuantización data-free.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye pruebas internas específicas:

| Prueba | Resultado |
|---|---|
| Visión (4 casos: OCR, conteo, gráfico, espacial) | 4/4 correctos |
| Tarea de agente (Opencode: corregir off-by-one y pasar pytest) | Correcto en 6m12s |
| Decodificación | 11,4 tokens/s |
| Prefill | 110–160 tokens/s |

Estos datos son proporcionados por el autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- Plataforma: Apple Silicon con memoria unificada (MLX).
- Memoria mínima: 24 GB, pero requiere elevar el límite de Metal wired cap y usar `--prefill-step-size 256` (pico de 16,77 GB). No funciona en 16 GB.
- Memoria recomendada: 36 GB (pico de 22,45 GB a 16K contexto, 12,34 GB de margen) o 64 GB (39,40 GB de margen).
- Pico de memoria a 16K contexto: 22,45 GB (con prefill-step-size 2048) o 16,77 GB (con 256).
- Despliegue: mediante la librería `turboquant-mlx-full[vlm]`, con scripts `generate_vlm`, `turboquant-serve-vlm` (servidor compatible con OpenAI para visión y tools) y `turboquant-plan` para planificar recursos.
- Latencia: decodificación ~11,4 tokens/s, prefill 110–160 tokens/s (depende del tamaño del prompt y del paso de prefill). No es adecuado para aplicaciones en tiempo real.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. La model card menciona a **Laguna-XS.2** (3-bit) que completa la misma tarea de agente en 33 segundos frente a los 6 minutos de este modelo, lo que indica que hay alternativas más rápidas aunque con menor capacidad. No se proporcionan otros modelos comparables ni métricas estandarizadas.

## Limitaciones y advertencias

- Velocidad de decodificación lenta (11,4 tokens/s): no apto para aplicaciones que requieran baja latencia o interacción en tiempo real.
- Requiere hardware específico: solo funciona en Apple Silicon con suficiente memoria unificada; no hay soporte para GPU NVIDIA o AMD.
- La cuantización 4-bit puede degradar ligeramente la calidad frente al modelo bf16, aunque el autor afirma que es mejor que la versión 3-bit.
- Discrepancia en el número de parámetros: el modelo base declara 27,8B, pero el safetensors del repo reporta 4,37B; esto podría deberse a un error en el metadata o a un formato de almacenamiento compacto, y debe verificarse antes de usar el modelo en producción.
- No se especifican idiomas soportados ni sesgos conocidos; se recomienda evaluar el modelo en el dominio de uso previsto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener sus propias restricciones (no documentadas aquí).
- El rendimiento de visión se probó solo con 4 imágenes sintéticas; no hay evidencia de robustez en escenarios reales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/manjunathshiva/Qwen3.8-27B-tq4-g64
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta TurboQuant-MLX: https://github.com/manjunathshiva/turboquant-mlx
