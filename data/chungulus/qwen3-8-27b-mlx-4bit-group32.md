# Chungulus/Qwen3.8-27B-MLX-4bit-Group32

## Resumen

El modelo `Chungulus/Qwen3.8-27B-MLX-4bit-Group32` es una cuantización MLX de 4 bits (con grupo de tamaño 32) del modelo vision-language Qwen3.8-27B de Alibaba, publicada por el usuario Chungulus. Se trata de una conversión directa de los pesos originales en BF16, sin fine-tuning ni modificaciones de alineación, pensada para ejecutarse en hardware Apple Silicon mediante el ecosistema MLX. El modelo base Qwen3.8-27B es un modelo denso de 27 mil millones de parámetros con arquitectura híbrida (Gated DeltaNet y atención completa), visión integrada, razonamiento configurable y una ventana de contexto nativa de 262.144 tokens.

Esta cuantización reduce el tamaño del artefacto a 18,6 GB, lo que permite su ejecución en equipos con al menos 32 GB de memoria unificada. Incluye soporte para el componente MTP (Multi-Token Prediction) como drafter, que acelera la generación, y ha pasado pruebas de validación de calidad frente a la versión BF16 original. Es relevante porque ofrece una vía práctica para desplegar un modelo de 27B con visión y capacidades de agente en hardware de consumo de Apple, manteniendo la licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida: Gated DeltaNet + full attention) |
| Parametros totales | 27B (modelo base); archivo safetensors cuantizado: 5.505.879.280 (según metadata) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativa del modelo base) |
| Tipos de cuantizacion | MLX 4-bit con group size 32 (este repo); otras cuantizaciones disponibles en el ecosistema (GGUF, etc.) |
| Idiomas soportados | No disponible en la ficha; el modelo base Qwen3.8 es multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que combina capas con Gated DeltaNet (una variante de atención lineal eficiente) y capas de atención completa, lo que permite manejar contextos largos de hasta 262K tokens con un coste computacional reducido. Además, incorpora un codificador de visión, un proyector y un procesador para tareas de imagen-texto, así como un componente MTP (Multi-Token Prediction) que actúa como drafter para acelerar la decodificación especulativa.

Este repositorio concreto no es un entrenamiento nuevo, sino una cuantización MLX de 4 bits con group size 32, sin calibración (calibration source: none). Los pesos se fijaron en el commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del modelo original. La conversión se realizó con `mlx-vlm` versión 0.6.1 y no se aplicó ningún ajuste fino, merge ni cambio de plantilla de chat. El proceso de cuantización reduce el tamaño del artefacto de aproximadamente 54 GB (BF16) a 18,6 GB, manteniendo una similitud semántica media de 0,94 frente a la versión BF16 en las pruebas de validación.

## Capacidades

- Generación de texto y razonamiento: soporta modos de pensamiento configurables (`enable_thinking`, `reasoning_effort`, `preserve_thinking`) para tareas que requieren razonamiento multi-paso.
- Visión: procesa imágenes y responde a preguntas sobre su contenido (image-text-to-text). Incluye 333 tensores de visión en el inventario.
- Tool calling: soporta el formato nativo de herramientas XML de Qwen, validado con cinco pruebas específicas.
- MTP (Multi-Token Prediction): actúa como drafter para decodificación especulativa, con una tasa de aceptación medida del 96,5% y una aceleración del 11,9% en throughput en las pruebas del autor.
- Multilingüe: el modelo base Qwen3.8 es multilingüe, aunque la ficha no detalla los idiomas concretos.
- Chat y agentes: diseñado para tareas de agente de largo horizonte, con soporte de contexto largo (262K tokens).

## Casos de uso

- Asistentes de visión por computadora: el modelo puede analizar imágenes y responder preguntas sobre ellas, útil en aplicaciones de accesibilidad (descripción de imágenes para personas con discapacidad visual) o en sistemas de moderación de contenido.
- Agentes autónomos con razonamiento: gracias a su ventana de 262K tokens y al modo de pensamiento configurable, puede planificar y ejecutar tareas multi-paso en entornos de automatización, como gestión de correo electrónico o navegación web.
- Generación de código asistida por visión: al combinar visión y texto, puede interpretar capturas de pantalla de interfaces o diagramas y generar código correspondiente, útil en herramientas de desarrollo low-code.
- Atención al cliente con contexto largo: puede mantener conversaciones multi-turno con historial extenso (hasta 262K tokens) y usar tool calling para consultar bases de datos o APIs de CRM, ofreciendo respuestas precisas y actualizadas.
- Análisis de documentos técnicos: procesa documentos largos con figuras, tablas y texto, extrayendo información relevante para resúmenes o informes en entornos de investigación o legal.
- Despliegue local en Mac: al ser una cuantización MLX, se ejecuta de forma nativa en Apple Silicon con 32 GB de RAM, permitiendo prototipado y uso offline en entornos con restricciones de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente validaciones internas del autor:

- Comparación con la fuente BF16: similitud semántica media de 0,9419 (usando `paraphrase-multilingual-MiniLM-L12-v2`), con 4 coincidencias exactas en los casos probados.
- Comparación de logits fijos: divergencia KL media de 0,0188, acuerdo top-1 del 94,3% y delta de perplejidad de 0,198 frente a la versión BF16.
- Rendimiento MTP: 15,98 tokens por segundo con MTP frente a 14,27 sin MTP (aceleración del 11,9%) en el hardware de prueba del autor.

Estos datos son específicos del artefacto y no constituyen benchmarks públicos comparables.

## Requisitos de hardware

- VRAM estimada: el artefacto ocupa 18,6 GB en disco; la memoria pico medida durante la validación fue de 19,77 GB. Se recomienda al menos 32 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: Apple Silicon (M1 Pro/Max/Ultra o superior) con 32 GB o más de memoria unificada. También se ha confirmado soporte Day-0 en AMD Ryzen AI Max y Radeon GPUs mediante LM Studio.
- Compatibilidad con GPU de consumo: no cabe en GPUs de consumo típicas (8-16 GB VRAM) sin cuantizaciones más agresivas; requiere al menos 24 GB de VRAM en GPUs NVIDIA (RTX 3090/4090) si se usan otros formatos.
- Opciones de despliegue: `mlx-vlm` (para Apple Silicon), LM Studio (AMD y Apple), vLLM o SGLang (para GPUs NVIDIA, según la documentación de Yottalabs), y Unsloth (GGUF, NVFP4).
- Latencia y throughput: en la validación del autor, se midieron 15,28 tokens por segundo de media en generación (con MTP activo, 15,98 tps) en un Apple Silicon con 32 GB. Estos valores dependen del hardware y del contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (BF16) | 27B | 262K | Sí | Apache-2.0 | safetensors (BF16) |
| Chungulus/Qwen3.8-27B-MLX-4bit | 27B (cuantizado) | 262K | Sí | Apache-2.0 | safetensors (MLX 4-bit) |
| Qwen2.5-VL-27B (si existe) | 27B | 128K (aprox.) | Sí | Apache-2.0 | safetensors |

La comparativa con Qwen2.5-VL-27B es orientativa, ya que no se dispone de datos confirmados de ese modelo en la información proporcionada. La principal diferencia de esta cuantización frente al modelo base es el tamaño reducido (18,6 GB frente a ~54 GB) y la compatibilidad nativa con MLX, a costa de una posible degradación de calidad por la cuantización 4-bit.

## Limitaciones y advertencias

- La cuantización 4-bit puede reducir la calidad de las respuestas, especialmente en tareas que requieren precisión numérica o razonamiento complejo. La validación del autor muestra una similitud semántica alta (0,94) pero no garantiza resultados idénticos al modelo BF16.
- El contexto probado en la validación fue de solo 73 tokens de prompt; no se debe asumir que el modelo funciona correctamente en toda la ventana de 262K tokens sin pruebas adicionales.
- El soporte de la arquitectura híbrida (Gated DeltaNet + atención completa), la torre de visión, el proyector y el MTP depende del runtime. Un cargador que solo lea tensores de lenguaje no es suficiente.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir correctamente al modelo original Qwen3.8-27B.
- No se han publicado benchmarks públicos independientes; los datos de rendimiento provienen de las pruebas del autor y pueden no ser representativos en otros entornos.
- El identificador interno `qwen3_5` no debe interpretarse como una versión de Qwen3.5; es solo una etiqueta de arquitectura.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Chungulus/Qwen3.8-27B-MLX-4bit-Group32
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de AMD sobre soporte Day-0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Página de LM Studio para Qwen3.8: https://lmstudio.ai/models/qwen3.8
- Documentación de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Artículo de Yottalabs sobre especificaciones y despliegue: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
