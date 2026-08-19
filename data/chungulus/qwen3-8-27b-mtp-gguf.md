# Chungulus/Qwen3.8-27B-MTP-GGUF

## Resumen

El modelo `Chungulus/Qwen3.8-27B-MTP-GGUF` es una cuantización GGUF del modelo base `Qwen/Qwen3.8-27B`, desarrollada por Chungulus. Se trata de una conversión "vanilla" (sin fine-tuning, merges ni cambios de alineación) que preserva la arquitectura original del modelo, incluyendo su componente de visión, su soporte de tool calling y su módulo MTP (Multi-Token Prediction) para decodificación especulativa. El objetivo principal es ofrecer una versión cuantizada a 4 bits que pueda ejecutarse en hardware de consumo, especialmente Apple Silicon (Metal) o CPU, manteniendo la funcionalidad completa del modelo original.

El modelo base es un sistema de visión-lenguaje con arquitectura híbrida que combina Gated DeltaNet y atención completa, con 26.896 millones de parámetros. Esta cuantización específica separa el modelo en tres componentes GGUF: el target principal (Q4_K_M), el proyector de visión (F16) y el drafter MTP (Q8_0), lo que permite usar decodificación especulativa nativa en llama.cpp. Según las pruebas del autor, el MTP logra una aceleración de 1,9x en throughput (de 14,3 a 27,3 tokens por segundo) en el hardware de prueba, con una tasa de aceptación de borradores del 100% en las pruebas realizadas.

La relevancia de este modelo radica en que permite ejecutar un modelo de 27B con capacidades multimodales y tool calling en entornos con recursos limitados, sin necesidad de GPUs de alta gama, gracias a la cuantización GGUF y al soporte de decodificación especulativa en llama.cpp. Es una opción práctica para desarrolladores que trabajan con Apple Silicon o CPUs y necesitan un modelo de visión-lenguaje con capacidades de agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Gated DeltaNet / full-attention, con vision tower, projector, processor y módulo MTP |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (solo probado hasta 73 tokens de prompt en validación) |
| Tipos de cuantizacion | Q4_K_M (target), F16 (proyector de visión), Q8_0 (drafter MTP) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (tres archivos: target, mmproj y MTP) |

## Arquitectura y entrenamiento

Este modelo es una cuantización directa del checkpoint `Qwen/Qwen3.8-27B` (commit `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`), sin ningún tipo de entrenamiento adicional. La conversión se realizó con el algoritmo de llama.cpp para separar el target y el drafter MTP, con bit width de 4 bits y group size definido por el formato, sin calibración (calibration source: none). El modelo base utiliza la arquitectura interna `Qwen3_5ForConditionalGeneration` (identificador que no implica relación con Qwen3.5), que combina una capa híbrida de Gated DeltaNet con atención completa, junto con un vision tower, un proyector, un processor y un módulo MTP para decodificación especulativa.

El tensor inventory incluye 1199 tensores, de los cuales 333 corresponden a visión y 15 al módulo MTP. La conversión requiere una versión específica de llama.cpp (`5f754ea0e2fd21e1213db7ebebfd65d938d9d69c`) que soporte decodificación especulativa nativa con el drafter MTP. No se realizó ningún ajuste de alineación, chat template ni modificación de los tokens especiales; todo se mantiene idéntico al modelo base.

## Capacidades

- Generación de texto y razonamiento: el modelo base es un LLM de 27B con capacidades de razonamiento, aunque no se especifican detalles de su entrenamiento.
- Comprensión de imágenes (vision-language): incluye un vision tower y un proyector, lo que permite procesar imágenes y responder a preguntas sobre ellas (pipeline `image-text-to-text`).
- Tool calling / function calling: soporta el formato nativo de herramientas XML de Qwen, validado en las pruebas del autor.
- Decodificación especulativa con MTP: el módulo MTP permite acelerar la generación mediante borradores, con una mejora medida de 1,9x en throughput.
- Conversacional: incluye chat template y soporte para modos de pensamiento (`enable_thinking`, `reasoning_effort`, `preserve_thinking`).
- Multilingüe: no se especifican idiomas soportados, pero el modelo base de Qwen suele ser multilingüe; no hay confirmación en la información disponible.

## Casos de uso

- Descripción de imágenes en aplicaciones de accesibilidad: el modelo puede generar descripciones textuales de imágenes para personas con discapacidad visual, ejecutándose en un MacBook con Apple Silicon gracias a la cuantización Q4_K_M y al soporte Metal de llama.cpp.
- Asistente conversacional con tool calling: integrado en un chatbot que necesita consultar APIs externas (por ejemplo, el tiempo, calendario o bases de datos) usando el formato XML nativo de Qwen, con la ventaja de poder ejecutarse en CPU sin GPU dedicada.
- Análisis de documentos con imágenes: procesamiento de capturas de pantalla, diagramas o fotografías en entornos de investigación, donde el modelo puede extraer información y responder preguntas sobre el contenido visual.
- Prototipado rápido en entornos de desarrollo: desarrolladores que necesitan probar un modelo multimodal de 27B en local sin acceso a GPUs de alta gama, usando llama.cpp con decodificación especulativa para obtener un throughput aceptable (27 tps medidos).
- Generación de código asistida por visión: el modelo puede interpretar imágenes de diagramas o bocetos de interfaces y generar código correspondiente, combinando sus capacidades de visión y tool calling.
- Automatización de tareas de agente en entornos con recursos limitados: al soportar tool calling y razonamiento multi-paso, puede usarse como backend de agentes que ejecutan acciones en un sistema, con la ventaja de poder desplegarse en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo proporciona métricas de validación interna:

- Comparación con el modelo BF16 original: similitud semántica media de 0,904 (usando `paraphrase-multilingual-MiniLM-L12-v2` como proxy), con 3 coincidencias exactas en los casos de prueba.
- Rendimiento de MTP: baseline de 14,32 tps, con MTP 27,28 tps, lo que supone una aceleración de 1,905x. Tasa de aceptación de borradores del 100% (21/21 tokens).
- Throughput promedio de generación en la comparación BF16: 19,31 tps (hardware no especificado).

Estas métricas son específicas del artefacto, del prompt, del contexto y del hardware, y no deben generalizarse.

## Requisitos de hardware

- Hardware esperado: Apple Silicon (Metal) o CPU, según la model card.
- Tamaño del artefacto: 20,7 GB (decimal) en total, repartido entre los tres archivos GGUF.
- VRAM estimada: no disponible. El modelo Q4_K_M de 27B suele ocupar entre 15 y 16 GB, pero no se confirma en la información.
- GPU recomendadas: no se especifican. Dado el tamaño, podría ejecutarse en GPUs con al menos 16 GB de VRAM (por ejemplo, RTX 4080/4090, A100 40GB), pero no hay datos oficiales.
- Opciones de despliegue: llama.cpp (versión específica `5f754ea0e2fd21e1213db7ebebfd65d938d9d69c`) con `llama-mtmd-cli` para el modo multimodal y decodificación especulativa. No se mencionan otros runners como vLLM u Ollama.
- Latencia y throughput: en el hardware de prueba, se midieron 14,3 tps sin MTP y 27,3 tps con MTP. No se especifica qué hardware se usó.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de modelos comparables en la información. El modelo base `Qwen/Qwen3.8-27B` sería la referencia natural, pero no se ofrecen métricas comparativas más allá de la similitud semántica con la versión BF16.

## Limitaciones y advertencias

- La cuantización a 4 bits puede reducir la calidad de las respuestas, especialmente en tareas complejas, aunque el autor reporta una similitud semántica alta (0,904) con el modelo BF16.
- La longitud de contexto no ha sido probada más allá de 73 tokens de prompt en la validación. No se debe asumir que el modelo soporta contextos largos sin verificación.
- El runtime es específico: se requiere una versión concreta de llama.cpp con soporte para el grafo híbrido Gated DeltaNet/atención completa, vision tower, projector, processor y MTP. Un loader que solo lea tensores de lenguaje no es suficiente.
- No se han realizado pruebas de sesgos, alucinación o robustez en escenarios adversarios. La información disponible no incluye evaluaciones de seguridad.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir al modelo base Qwen3.8-27B según su licencia original.
- El modelo no ha sido fine-tuneado ni alineado específicamente para este formato; cualquier limitación del modelo base se mantiene.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Chungulus/Qwen3.8-27B-MTP-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de llama.cpp (requerido para inferencia): https://github.com/ggml-org/llama.cpp
