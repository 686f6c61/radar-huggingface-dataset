# furiosa-ai/Qwen3.6-27B-FP8

## Resumen

Qwen3.6-27B-FP8 es un modelo denso de visión-lenguaje de 27.781 millones de parámetros (27,78 B), empaquetado por FuriosaAI a partir del modelo original de Qwen. Combina un codificador visual con un decodificador que alterna atención lineal Gated DeltaNet y atención completa, siguiendo la arquitectura Qwen3.5 (`Qwen3_5ForConditionalGeneration`). Acepta entradas de imagen y texto y genera texto, con razonamiento (thinking) activado por defecto y capacidad de llamada a herramientas.

El repositorio no contiene solo los pesos: incluye un Furiosa Executable Bundle (FXB) precompilado para ejecutar el modelo sobre aceleradores FuriosaAI RNGD mediante la librería `furiosa-llm`. Los pesos se distribuyen en FP8 (E4M3) con cuantización estática de pesos en bloques de 128 × 128 y cuantización dinámica de activaciones en tiempo de ejecución, sin calibración offline. El codificador visual y la LM head quedan en mayor precisión, y la caché KV se mantiene en 16 bits.

Es relevante porque ofrece una ruta de despliegue lista para producción en hardware NPU alternativo a las GPU convencionales, con API compatible con OpenAI, parser de razonamiento y soporte de tool calling ya integrados. El mismo modelo puede ejecutarse también en vLLM, SGLang y Transformers usando la model card upstream de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 densa (`Qwen3_5ForConditionalGeneration`), codificador visual + decodificador con Gated DeltaNet (atención lineal) y atención completa |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 E4M3 con pesos estáticos en bloques 128 × 128 y activaciones dinámicas por token/bloque; visión y LM head en mayor precisión; KV cache en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 46,7 GB) + Furiosa Executable Bundle (FXB) |
| Entrada / salida | imagen + texto / texto |
| Hardware soportado | FuriosaAI RNGD |
| Estrategia de paralelismo | tensor-parallel 16 PEs, pipeline-parallel 1; una réplica (DP1) usa 2 tarjetas RNGD (8 PEs por tarjeta) |

## Arquitectura y entrenamiento

El modelo es un transformer denso multimodal de la familia Qwen3.5. El decodificador combina capas de atención lineal Gated DeltaNet con capas de atención completa, un patrón híbrido que reduce el coste computacional en secuencias largas manteniendo la capacidad de atención global. El codificador visual procesa imágenes y las proyecta al espacio del decodificador, permitiendo conversaciones multimodales con mensajes estilo OpenAI (`image_url` más partes de texto).

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO). El empaquetado de FuriosaAI aplica cuantización FP8 post-entrenamiento sobre las proyecciones, con calibración dinámica de activaciones en inferencia y exclusión del codificador visual y la LM head de la cuantización. El bundle FXB se compila con tensor-parallel de 16 PEs y pipeline-parallel de 1 para dos tarjetas RNGD por réplica.

## Capacidades

- Generación de texto y razonamiento con modo thinking activado por defecto y desactivable por petición mediante `enable_thinking`.
- Comprensión de imágenes: acepta URLs remotas, data URLs en base64 y rutas locales `file://` (esta última requiere `--allowed-local-media-path`).
- Llamada a herramientas (function calling) con formato XML propio, soportado por el parser `qwen3_coder` (alias `qwen3_xml`).
- Separación del razonamiento respecto a la respuesta final mediante el parser `qwen3`: expone `message.reasoning` en modo no streaming y `delta.reasoning` en streaming.
- API compatible con OpenAI (`/v1/chat/completions`), integrable con el SDK de OpenAI y el OpenAI Agents SDK.
- Capacidades multilingües: no detalladas en la información disponible.
- Razonamiento multi-paso y uso en flujos de agentes gracias a la combinación de thinking y tool calling.
- No se documentan capacidades de audio ni de vídeo en la información disponible.

## Casos de uso

- **Atención al cliente multimodal**: el modelo puede gestionar conversaciones multi-turno que incluyan capturas de pantalla o fotos de producto, respondiendo con texto y razonamiento separado para auditar la lógica de la respuesta.
- **Automatización de agentes con herramientas**: gracias al tool calling con parser `qwen3_coder`, se puede conectar a APIs internas, bases de datos o buscadores y encadenar varios pasos de razonamiento antes de emitir la respuesta final.
- **Análisis de documentos e imágenes en pipelines internos**: extracción de información de facturas, tickets o formularios escaneados enviando la imagen como `image_url` y pidiendo al modelo un resumen estructurado.
- **Asistencia a desarrollo de software**: generación y revisión de código con soporte de tool calling para invocar linters, ejecutar tests o consultar documentación, integrable en flujos de CI/CD mediante la API compatible con OpenAI.
- **Despliegue en infraestructura NPU**: organizaciones con aceleradores FuriosaAI RNGD pueden servir el modelo con el FXB precompilado sin recompilar, usando dos tarjetas por réplica y escalando horizontalmente con DP.
- **Razonamiento verificable en producción**: al separar `reasoning` de `content`, se pueden registrar las cadenas de pensamiento para auditoría y activar o desactivar thinking por petición según el coste latencia/calidad deseado.
- **Prototipado rápido con SDK de OpenAI**: al exponer una API compatible, se puede apuntar el cliente oficial de OpenAI a `http://localhost:8000/v1` y reutilizar código existente sin cambios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **Hardware objetivo del bundle**: FuriosaAI RNGD. Una réplica requiere 2 tarjetas RNGD (16 PEs en total, 8 PEs por tarjeta, tensor-parallel 16, pipeline-parallel 1).
- **VRAM estimada en GPU**: no disponible para el bundle FXB. Los pesos en safetensors FP8 ocupan aproximadamente 27,8 GB (el repo completo pesa 46,7 GB incluyendo artefactos del bundle); en GPU convencional se necesitaría margen adicional para KV cache en 16 bits y activaciones.
- **GPU recomendadas**: no especificadas en la información disponible. El modelo upstream puede ejecutarse en vLLM, SGLang y Transformers, pero no se detallan GPU concretas.
- **Consumer GPU**: no confirmado. Por tamaño en FP8 (≈28 GB de pesos) no cabría en GPU de 24 GB sin cuantización adicional; no hay datos oficiales sobre versiones GGUF o INT4.
- **Opciones de despliegue**: `furiosa-llm serve` sobre RNGD (ruta documentada); vLLM, SGLang y Transformers mediante la model card upstream de Qwen.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B-FP8 (FuriosaAI) | 27,78 B denso | no disponible | imagen + texto → texto | Apache 2.0 | HuggingFace, bundle FXB para RNGD |
| Qwen/Qwen3.6-27B-FP8 (upstream) | 27,78 B denso | no disponible | imagen + texto → texto | Apache 2.0 | HuggingFace, vLLM/SGLang/Transformers |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar el empaquetado de FuriosaAI con el modelo upstream de Qwen, que es idéntico en pesos y arquitectura pero no incluye el FXB ni la integración con `furiosa-llm`. No se dispone de datos de benchmarks ni de otros modelos comparables en la información disponible.

## Limitaciones y advertencias

- **Sesgos**: no documentados en la información disponible; al ser un modelo derivado de Qwen, hereda los sesgos del modelo base, no evaluados aquí.
- **Alucinación**: riesgo inherente a modelos generativos; no se han publicado evaluaciones específicas de fidelidad en esta ficha.
- **Contexto e idiomas**: la longitud de contexto y la lista de idiomas soportados no están disponibles, lo que impide garantizar un rendimiento multilingüe concreto.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene revisar la licencia upstream de Qwen enlazada en la model card para confirmar condiciones adicionales.
- **Dependencia de hardware**: el bundle FXB está compilado exclusivamente para FuriosaAI RNGD con tensor-parallel 16 y pipeline-parallel 1; no es portable a GPU sin usar los pesos safetensors con otro framework.
- **Cuantización FP8**: las activaciones se cuantizan dinámicamente en runtime; puede haber una degradación de precisión frente al modelo en BF16, no cuantificada en la información disponible.
- **Formato de tool calling**: el parser `qwen3_coder` espera el formato XML propio del modelo; clientes que emitan JSON estándar pueden requerir adaptación.
- **Campo `reasoning`**: no forma parte de la especificación de la API de OpenAI; acceder a él cuando no existe lanza `AttributeError`, por lo que el código cliente debe comprobarlo.
- **Madurez**: el repositorio tiene 615 descargas y 0 likes en el momento de la consulta, lo que sugiere adopción temprana; conviene validar en staging antes de producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/furiosa-ai/Qwen3.6-27B-FP8
- Modelo upstream Qwen: https://huggingface.co/Qwen/Qwen3.6-27B-FP8
- Licencia upstream: https://huggingface.co/Qwen/Qwen3.6-27B-FP8/blob/main/LICENSE
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Guía de instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- FuriosaAI: https://furiosa.ai
