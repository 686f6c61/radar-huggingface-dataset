# Chungulus/Qwen3.8-27B-MLX-MXFP8

## Resumen

El modelo `Chungulus/Qwen3.8-27B-MLX-MXFP8` es una cuantización en formato MLX MXFP8 (8 bits, grupo de 32) del modelo base `Qwen/Qwen3.8-27B`, desarrollado por el usuario Chungulus. Se trata de una conversión "vanilla" que no modifica los pesos originales, sino que los reempaqueta para su ejecución eficiente en hardware Apple Silicon mediante el ecosistema MLX. El modelo base es un sistema multimodal de visión-lenguaje con arquitectura híbrida Gated DeltaNet/atención completa, que además incorpora un componente de predicción multi-token (MTP) para acelerar la decodificación.

La relevancia de esta cuantización radica en que permite ejecutar un modelo de gran tamaño (aunque el número real de parámetros reportado es de 8.027 millones, inferior a lo que sugiere el nombre "27B") en equipos Apple con memoria unificada de 64 GB, manteniendo una calidad semántica muy cercana a la versión BF16 original (similitud media de 0,9667). El autor ha validado el funcionamiento de texto, visión, tool calling y MTP, y publica instrucciones de inferencia concretas. Es una opción interesante para desarrolladores que trabajan en entornos macOS y necesitan un modelo multimodal con soporte de agentes y razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet / full-attention, con torre de visión y MTP (Multi-Token Prediction) |
| Parametros totales | 8.027.131.120 (según safetensors) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (probado hasta 73 tokens en validación; máximo arquitectónico no declarado) |
| Tipos de cuantizacion | MXFP8 (8 bits, group size 32) para pesos de lenguaje; visión y MTP en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (contenedor MLX) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` emplea una arquitectura híbrida que combina capas de atención completa con capas Gated DeltaNet, una variante de atención lineal eficiente. Incluye además un codificador de visión (333 tensores de visión) y un módulo MTP (15 tensores) que actúa como drafter para decodificación especulativa. La cuantización MXFP8 aplica 8 bits con agrupación de 32 elementos a los pesos del lenguaje, mientras que los componentes de visión y MTP se mantienen en FP16. No se utilizó calibración (calibration_source: none), por lo que es una conversión directa de los pesos originales, fijados al commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del repositorio fuente.

El entrenamiento del modelo base no se detalla en la información proporcionada; solo se indica que la cuantización no altera los pesos ni el chat template. El autor ha verificado la equivalencia con la versión BF16 mediante pruebas funcionales y una métrica de similitud semántica basada en `paraphrase-multilingual-MiniLM-L12-v2`, obteniendo una media de 0,9667.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imágenes y texto, y puede describir o responder sobre contenido visual.
- Tool calling: soporta el formato nativo de herramientas XML de Qwen, validado con cinco pruebas.
- Predicción multi-token (MTP): acelera la decodificación mediante un drafter que predice varios tokens a la vez, con una tasa de aceptación de 1.0 en las pruebas y un speedup medido de 1,24x.
- Conversación multi-turno: compatible con el chat template original de Qwen, incluyendo controles de pensamiento (`enable_thinking`, `reasoning_effort`, `preserve_thinking`).
- Capacidades de visión/video: pasó pruebas deterministas de imagen local, aunque no se especifica el soporte exacto de video.
- Multilingüismo: no se declaran idiomas específicos, pero el modelo base de Qwen suele ser multilingüe; no hay confirmación en esta ficha.

## Casos de uso

- Asistente de atención al cliente multimodal: el modelo puede gestionar conversaciones que incluyan capturas de pantalla o imágenes de productos, combinando comprensión visual y textual. Su soporte de tool calling permite integrarlo con sistemas de ticketing o bases de conocimiento.
- Generación de código con contexto visual: un desarrollador puede subir un diagrama o una captura de una interfaz y pedir al modelo que genere el código correspondiente, aprovechando la capacidad de visión y razonamiento.
- Análisis de documentos con imágenes: extraer información de facturas, informes o formularios escaneados, describiendo el contenido y respondiendo preguntas específicas sobre los datos visibles.
- Agente autónomo en macOS: gracias al MTP y a la cuantización MXFP8, puede ejecutarse en un Mac con 64 GB de RAM unificada, sirviendo como backend para agentes que necesitan razonamiento multi-paso y llamadas a herramientas.
- Prototipado rápido de aplicaciones de visión-lenguaje: al ser una cuantización ligera, permite iterar sobre prompts y flujos de trabajo sin requerir GPUs dedicadas, ideal para entornos de desarrollo locales.
- Investigación en eficiencia de inferencia: el MTP y la cuantización MXFP8 ofrecen un caso de estudio para medir el impacto de la decodificación especulativa en hardware Apple, con datos de throughput y latencia publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta validaciones internas: similitud semántica media de 0,9667 frente al modelo BF16, y métricas de MTP (baseline 9,77 tokens/s, con MTP 12,14 tokens/s, speedup 1,24x). Estas cifras son específicas del artefacto, el prompt y el hardware, y no deben interpretarse como rendimiento general.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con 64 GB de memoria unificada (según la model card).
- VRAM estimada: no aplica directamente, pero el pico de memoria medido en validación fue de 28,33 GB, lo que sugiere que cabe en configuraciones de 32 GB o más, aunque el autor recomienda 64 GB.
- GPUs compatibles: no es para GPUs NVIDIA/AMD; está diseñado para el ecosistema MLX en Apple Silicon (M1/M2/M3/M4 con suficiente RAM).
- Opciones de despliegue: requiere `mlx==0.31.2`, `mlx-lm==0.31.3`, `mlx-vlm==0.6.1` y `huggingface-hub[cli]`. Se ejecuta mediante `mlx_vlm.generate` con soporte de drafter MTP.
- Latencia y throughput: en las pruebas, el modelo base (sin MTP) alcanzó 9,77 tokens/s y con MTP 12,14 tokens/s, con un speedup de 1,24x. Estos valores son orientativos y dependen del hardware y la carga.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (cuantizaciones MLX de Qwen3.8-27B u otros). La comparación más directa sería con el modelo base `Qwen/Qwen3.8-27B` en BF16, que ocupa más espacio y requiere más memoria, pero ofrece la máxima fidelidad. Otras cuantizaciones de Qwen (por ejemplo, GGUF para llama.cpp) podrían ser alternativas, pero no hay datos en la información proporcionada. Por tanto, la comparativa se limita a:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (BF16) | 8.027M (según safetensors) | no disponible | Apache-2.0 | safetensors | Modelo original sin cuantizar |
| Chungulus/Qwen3.8-27B-MLX-MXFP8 | 8.027M | no disponible | Apache-2.0 | safetensors (MLX) | Cuantización MXFP8, con MTP |

## Limitaciones y advertencias

- La cuantización MXFP8 puede reducir la calidad del modelo en comparación con BF16, especialmente en tareas que requieren precisión numérica alta. El autor advierte que la degradación es posible, aunque la similitud semántica medida es alta (0,9667).
- El contexto probado en validación es de solo 73 tokens; no se ha verificado el rendimiento con contextos largos, y no debe asumirse que el máximo arquitectónico funciona correctamente.
- El soporte runtime es específico: requiere versiones concretas de MLX y componentes adicionales (mlx-vlm, mlx-mtp). Un loader que solo lea tensores de lenguaje no es suficiente.
- No se han publicado benchmarks estándar, por lo que el rendimiento en tareas generales es desconocido.
- Los idiomas soportados no están declarados; aunque el modelo base de Qwen suele ser multilingüe, no hay confirmación para esta cuantización.
- El número de parámetros reportado (8.027M) difiere del nombre "27B", lo que sugiere una posible discrepancia en la nomenclatura; se recomienda verificar con el modelo base.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir correctamente al modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Chungulus/Qwen3.8-27B-MLX-MXFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
