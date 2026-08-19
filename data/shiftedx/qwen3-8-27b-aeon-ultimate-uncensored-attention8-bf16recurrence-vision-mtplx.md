# Shiftedx/qwen3.8-27b-aeon-ultimate-uncensored-attention8-bf16recurrence-vision-mtplx

## Resumen

Este repositorio contiene una conversión comunitaria a formato MLX/MTPLX del modelo AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16, un fine-tune "uncensored" del Qwen3.8-27B de Alibaba. El autor, Shiftedx, ha preparado una versión con cuantización mixta affine (4-bit, 8-bit y BF16) que busca equilibrar calidad de razonamiento y uso de memoria en Apple Silicon. El modelo es denso, con arquitectura híbrida de atención y Gated DeltaNet, y soporta entrada de texto e imágenes (image-text-to-text).

La relevancia de esta conversión radica en que permite ejecutar un modelo de 27B con capacidades de visión, razonamiento, tool calling y multi-token prediction en un Mac con 64 GiB de memoria unificada, algo que no era práctico con el checkpoint BF16 original. Incluye la torre de visión en BF16, la plantilla de herramientas nativa del tokenizador y la cabeza MTP nativa, todo empaquetado para el runtime MTPLX. El contexto configurado es de 262.144 tokens, aunque no se ha validado exhaustivamente la ventana completa.

Es importante señalar que se trata de una conversión independiente, no oficial, y que el modelo base "uncensored" puede generar contenido que otros modelos filtran. La licencia Apache-2.0 se hereda de la línea original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense hybrid-attention/Gated DeltaNet (Qwen3.8) |
| Parametros totales | 27B (declarado por el autor); 6.640.307.440 en el archivo safetensors |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (configurado; no validado exhaustivamente) |
| Tipos de cuantizacion | Mixta affine 4-bit, affine 8-bit y BF16 |
| Idiomas soportados | Inglés, chino, multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (MTPLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con una arquitectura híbrida que combina atención clásica con capas Gated DeltaNet, una variante de atención lineal recurrente. Sobre ese modelo, AEON-7 aplicó un fine-tune "uncensored" que elimina los filtros de seguridad del modelo original, manteniendo las capacidades de razonamiento, visión y tool calling. Esta conversión de Shiftedx no modifica los pesos, sino que los reempaqueta en formato MLX con una estrategia de cuantización mixta: las capas de atención se mantienen en 8-bit affine, la recurrencia (Gated DeltaNet) se conserva en BF16, y el resto se cuantiza a 4-bit affine. Se incluye además la cabeza de multi-token prediction (MTP) nativa en BF16, que permite decodificación especulativa con profundidad 3.

El entrenamiento original de Qwen3.8-27B usó un dataset masivo con refuerzo y ajuste por preferencias, pero no se dispone de detalles específicos del fine-tune de AEON-7 en la información proporcionada. La conversión MLX no implica reentrenamiento, solo adaptación de formato y cuantización.

## Capacidades

- Generación de texto y razonamiento multi-step con modo "thinking" configurable (razonamiento on/off y esfuerzo ajustable).
- Comprensión de imágenes (image-text-to-text): puede procesar entradas visuales junto con texto.
- Tool calling nativo mediante plantilla del tokenizador, compatible con el esquema de funciones de OpenAI.
- Multi-token prediction (MTP) con decodificación especulativa nativa (15 tensores BF16, validado a profundidad 3).
- Soporte para agentes y conversaciones largas gracias a la ventana de contexto de 262K tokens.
- Multilingüe: inglés, chino y otros idiomas.
- Modo "uncensored": no aplica filtros de seguridad sobre el contenido generado.

## Casos de uso

- Asistente de programación local: el modelo puede generar, revisar y refactorizar código en múltiples lenguajes, con tool calling para ejecutar comandos o consultar APIs. Su ventana de 262K tokens permite mantener repositorios enteros en contexto.
- Agente autónomo de investigación: con razonamiento configurable y soporte multi-step, puede planificar tareas, buscar información en la web mediante herramientas y sintetizar resultados en informes.
- Análisis de documentos con imágenes: al aceptar entradas visuales, puede extraer información de capturas de pantalla, diagramas o gráficos y responder preguntas sobre ellos.
- Chat de atención al cliente sin filtros: útil para entornos controlados donde se necesita respuestas directas sin restricciones de contenido, como soporte técnico especializado o investigación de seguridad.
- Desarrollo de pipelines de IA en Apple Silicon: al ser un artefacto MLX/MTPLX, se integra nativamente con el ecosistema de Apple para inferencia local en Macs con 64 GiB o más.
- Evaluación de modelos "uncensored": investigadores que estudian el impacto de la eliminación de filtros de seguridad pueden comparar este modelo con la versión original de Qwen3.8-27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta conversión específica en la información disponible. El modelo base Qwen3.8-27B (original de Alibaba) reporta los siguientes resultados en su documentación, pero corresponden al modelo sin el fine-tune "uncensored" y no a esta conversión MLX:

| Benchmark | Resultado (Qwen3.8-27B original) |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

Estos datos deben tomarse como referencia orientativa, no como rendimiento verificado de este repositorio.

## Requisitos de hardware

- Apple Silicon (M1 o posterior) con macOS 14 o superior.
- Memoria unificada recomendada: 64 GiB (validado en M4 Max). No se ha probado en 32 GiB; el autor advierte que puede ser insuficiente con el estado de ejecución y la caché KV.
- Espacio en disco: 23,84 GB para el modelo, más overhead de descarga y caché.
- No es compatible con GPU NVIDIA o Linux: es un artefacto MLX, no GGUF ni CUDA. Para esos entornos hay que usar el checkpoint BF16 original.
- Despliegue: runtime MTPLX (CLI o servidor OpenAI-compatible), también compatible con MLX-LM 0.31.3.
- Latencia y throughput: no se han publicado cifras concretas. La decodificación especulativa con MTP a profundidad 3 está diseñada para mejorar el throughput, pero no hay mediciones disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este repo (Shiftedx) | 27B | 262K | MLX/MTPLX mixto 4/8/BF16 | Apache-2.0 | Fine-tune uncensored, visión, MTP |
| Qwen3.8-27B (original) | 27B | 262K | BF16 (Transformers) | Apache-2.0 | Modelo base con filtros de seguridad |
| Shiftedx/qwen3.8-27b-aeon-ultimate-uncensored-mxfp4-vision-mtplx | 27B | 262K | MLX MXFP4 (16,08 GB) | Apache-2.0 | Versión más ligera del mismo fine-tune |
| Shiftedx/qwen3.8-27b-aeon-ultimate-uncensored-mxfp8-vision-mtplx | 27B | 262K | MLX MXFP8 (29,53 GB) | Apache-2.0 | Versión de mayor precisión del mismo fine-tune |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Conversión comunitaria no oficial: no está respaldada por AEON-7, Qwen, Apple ni MLX. El soporte es limitado.
- Contexto de 262K tokens configurado pero no validado exhaustivamente; puede haber degradación en ventanas muy largas.
- Solo funciona en Apple Silicon con macOS 14+; no hay soporte para Linux/NVIDIA en este formato.
- El modo "uncensored" elimina filtros de seguridad: puede generar contenido ofensivo, ilegal o peligroso. No apto para uso en producción sin supervisión humana.
- No se han publicado benchmarks específicos de esta conversión; el rendimiento real puede diferir del modelo original.
- La cuantización mixta puede introducir degradación en tareas de precisión alta comparada con el BF16 completo.
- El dato de parámetros en safetensors (6,64B) no coincide con la declaración de 27B; probablemente se deba a pesos compartidos o a que el archivo no incluye todas las tablas, pero conviene verificarlo antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Shiftedx/qwen3.8-27b-aeon-ultimate-uncensored-attention8-bf16recurrence-vision-mtplx
- Modelo base (AEON-7): https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Colección de conversiones MLX de Shiftedx: https://huggingface.co/collections/Shiftedx/qwen38-27b-aeon-ultimate-uncensored-mlx-quants-6a81f529af306393b1b01849
- Runtime MTPLX: https://github.com/youssofal/MTPLX
- Guía de Qwen3.8-27B (lovableapp.org): https://lovableapp.org/blog/qwen3-8-27b
- Blog de AMD sobre Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guía de ejecución local (lu-labs.ai): https://lu-labs.ai/blog/how-to-run-qwen-3-8-27b-locally
