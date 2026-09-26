# 1bit-MONSTER/Qwen2.5-7B-Instruct-GGUF

## Resumen

1bit-MONSTER/Qwen2.5-7B-Instruct-GGUF es una redistribución en formato GGUF del modelo Qwen/Qwen2.5-7B-Instruct, publicada por el usuario 1bit-MONSTER. No es un modelo nuevo ni un ajuste fino: el repositorio aloja la cuantización Q4_K_M oficial de Qwen, dividida en dos shards, junto con mediciones de rendimiento del motor de inferencia propio del autor (1bit engine, backend Vulkan) sobre un equipo Strix Halo. Su interés es por tanto práctico: ofrece un artefacto listo para ejecutar en local con métricas de throughput declaradas.

El modelo subyacente es un transformer decoder-only denso de 7.615.616.512 parámetros, con 28 capas, Grouped Query Attention (28 cabezas de consulta y 4 de clave/valor), RoPE y SwiGLU. Qwen lo entrenó sobre aproximadamente 18 billones de tokens y lo ajustó posteriormente con SFT y DPO, con una ventana de contexto nativa de 32.768 tokens ampliable hasta 131.072 mediante escalado YaRN.

La relevancia de esta ficha es doble: por un lado, permite dimensionar el despliegue local de un 7B en 4 bits sobre hardware de gama media e incluso iGPU con memoria unificada; por otro, documenta un caso de rehosting con licencia Apache 2.0, lo que facilita su uso comercial siempre que se mantenga la atribución al modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2ForCausalLM), 28 capas, Grouped Query Attention (28 cabezas Q / 4 cabezas KV), RoPE, SwiGLU, RMSNorm, dimensión oculta 3.584 |
| Parámetros totales | 7.615.616.512 (7,6 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos; hasta 131.072 con escalado YaRN (heredado del modelo base) |
| Tipos de cuantización | Este repositorio: Q4_K_M en 2 shards. No se ofrecen otras cuantizaciones en este repositorio |
| Idiomas soportados | 29 idiomas según la documentación del modelo base (entre ellos chino, inglés, francés, español, portugués, alemán, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe). El repositorio no declara lista propia |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen2.5-7B-Instruct) |
| Formato de pesos | GGUF (2 shards: `qwen2.5-7b-instruct-q4_k_m-00001-of-00002.gguf` y `qwen2.5-7b-instruct-q4_k_m-00002-of-00002.gguf`) |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Autor del repositorio | 1bit-MONSTER |
| Tamaño del repositorio | 4,7 GB |
| Pipeline declarado | No disponible (etiqueta `conversational` presente en los tags) |
| Motor probado por el autor | 1bit engine, dispositivo Vulkan, sobre Strix Halo |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Qwen2: decoder-only denso con normalización RMSNorm previa, activación SwiGLU en la MLP y atención con sesgo (QKV bias), usando Grouped Query Attention para reducir el coste del KV cache. El preentrenamiento de la familia Qwen2.5 utilizó del orden de 18 billones de tokens; el ajuste de instrucciones combinó supervisión directa (SFT) y optimización por preferencias directa (DPO). No hay innovaciones de decodificación especulativa ni capas de atención lineal: es un transformer estándar optimizado para despliegue.

Este repositorio concreto no aporta entrenamiento adicional. Se limita a rehostear la cuantización Q4_K_M generada por Qwen con llama.cpp y a publicar métricas del motor del autor. La model card no documenta la herramienta de cuantización, el conjunto de calibración ni la perplejidad resultante, por lo que la fidelidad exacta frente a los pesos FP16 del modelo base no está cuantificada en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno en modo instrucciones, con seguimiento de indicaciones y formato de chat propio de Qwen (etiquetas `im_start` / `im_end`).
- Razonamiento de propósito general, matemáticas de nivel escolar y universitario básico, y comprensión lectora.
- Generación y explicación de código en lenguajes mayoritarios, además de depuración y refactorización básica.
- Tool calling / function calling: el modelo base está entrenado para invocar funciones con esquemas JSON.
- Salida estructurada: generación de JSON válido y tablas, útil para extracción de datos.
- Soporte de agentes y razonamiento multi-paso, encadenando llamadas a herramientas.
- Capacidades multilingües en 29 idiomas, con especial solidez en chino e inglés.
- Contexto largo: hasta 32.768 tokens en una sola pasada sin configuración adicional.
- Soporte de rol de sistema (system prompt) para fijar persona y restricciones.
- No dispone de visión, audio ni capacidades multimodales.

## Casos de uso

- Asistente conversacional on-premise: al ser un GGUF de 4,7 GB con licencia Apache 2.0, puede desplegarse en servidores sin GPU dedicada o en equipos de oficina, gestionando diálogos multi-turno con prompts de sistema que fijan tono y políticas de respuesta.
- Generación de código en producción: integrado mediante tool calling en pipelines de CI/CD para autogenerar tests unitarios, proponer parches o resumir diffs, con la ventaja de que el modelo puede ejecutarse dentro de la red corporativa sin enviar código a terceros.
- Extracción estructurada de información: con salida JSON, resulta adecuado para convertir correos, facturas o tickets en campos tipados que alimenten una base de datos o un CRM.
- Traducción y atención multilingüe: los 29 idiomas del modelo base permiten cubrir soporte al cliente en varios mercados con un único despliegue, traduciendo y respondiendo en el idioma del usuario.
- Resumen de documentos largos: la ventana nativa de 32.768 tokens permite procesar informes, contratos o actas completas en una sola pasada sin recurrir a troceado y recomposición.
- Agentes de automatización de tareas: combinando function calling con contexto largo, el modelo puede mantener el estado de un flujo de varios pasos (consultar una API, validar el resultado y decidir la siguiente acción).
- Prototipado e investigación en hardware modesto: la cuantización Q4_K_M y el soporte Vulkan lo hacen viable en iGPU con memoria unificada (por ejemplo, Strix Halo) y en GPUs de 8-12 GB, lo que facilita experimentación sin clúster.
- Generación de datos sintéticos y anotación asistida: útil para crear pares pregunta-respuesta o etiquetar corpus a bajo coste antes de entrenar modelos específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, MATH u otros) en la información disponible para este repositorio.

La model card sí incluye una medición de throughput en hardware concreto, que se reproduce a continuación tal cual:

| Medición | Valor | Condiciones |
|---|---|---|
| Prompt processing (pp512) | 1.306 tok/s | Strix Halo, backend Vulkan, motor 1bit |
| Generación (tg128) | 40,3 tok/s | Strix Halo, backend Vulkan, motor 1bit |

No hay datos declarados de latencia al primer token, consumo de memoria en tiempo de ejecución ni rendimiento con otras cuantizaciones.

## Requisitos de hardware

Estimación de VRAM para la cuantización Q4_K_M de este repositorio (pesos ~4,7 GB), asumiendo KV cache en FP16 y la arquitectura del modelo base (28 capas, 4 cabezas KV, dimensión de cabeza 128, unos 56 KiB por token):

| Contexto | Pesos | KV cache (FP16) | VRAM total estimada |
|---|---|---|---|
| 4.096 tokens | ~4,7 GB | ~0,23 GB | ~5,5 GB (con buffers) |
| 8.192 tokens | ~4,7 GB | ~0,46 GB | ~6 GB |
| 32.768 tokens | ~4,7 GB | ~1,87 GB | ~7,5 GB |
| 131.072 tokens | ~4,7 GB | ~7,5 GB | ~13,5 GB |

- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 / 4070 Ti Super, RTX 4080 y RTX 4090 24 GB. En tarjetas de 8 GB solo es viable con contexto reducido (4K-8K) o cuantizando el KV cache.
- iGPU y memoria unificada: el autor reporta funcionamiento sobre Strix Halo con Vulkan; también es viable en Apple Silicon con 16 GB o más de memoria unificada.
- GPU de centro de datos: A100, H100 o L40S no son necesarias para un 7B en 4 bits; se usarían solo por agregación de muchos usuarios concurrentes.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama, LM Studio, koboldcpp, llama-cpp-python y el motor 1bit del autor (comando indicado en la model card: `1bit serve -m qwen2.5-7b-instruct-q4_k_m-00001-of-00002.gguf --device vulkan`). Conviene apuntar al primer shard: llama.cpp localiza el resto automáticamente.
- vLLM admite GGUF de forma experimental y TGI no soporta GGUF de forma nativa; para servir con esas herramientas sería preferible partir de los pesos safetensors del modelo base.
- Throughput declarado: 40,3 tok/s de generación y 1.306 tok/s de procesamiento de prompt en Strix Halo con Vulkan. No hay datos de latencia ni de rendimiento con batching concurrente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-GGUF (1bit-MONSTER, Q4_K_M) | 7,6 B | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | GGUF Q4_K_M (2 shards, 4,7 GB) | 1.306 tok/s pp512 y 40,3 tok/s tg128 en Strix Halo/Vulkan |
| Qwen2.5-7B-Instruct (oficial, safetensors) | 7,6 B | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | safetensors BF16 | No disponible en esta ficha |
| Llama-3.1-8B-Instruct | 8,03 B | 131.072 | Llama 3.1 Community License (uso comercial con condiciones) | safetensors, GGUF comunitario | No disponible en esta ficha |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 | Apache 2.0 | safetensors, GGUF oficial | No disponible en esta ficha |
| Gemma-2-9B-it | 9,24 B | 8.192 | Gemma Terms of Use | safetensors, GGUF comunitario | No disponible en esta ficha |

La ventaja diferencial de esta ficha frente a sus alternativas es la licencia Apache 2.0 sin restricciones adicionales y un artefacto ya cuantizado con métricas de ejecución publicadas. Su desventaja es la ausencia de benchmarks de calidad propios y un contexto nativo inferior al de Llama-3.1-8B sin activar YaRN.

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier corrección o mejora debe dirigirse al repositorio oficial Qwen/Qwen2.5-7B-Instruct-GGUF. Este repositorio solo redistribuye los pesos.
- No se publican benchmarks de calidad ni perplejidad de la cuantización, por lo que no es posible cuantificar la degradación respecto a BF16.
- La cuantización Q4_K_M implica pérdida de precisión frente a FP16/BF16, con mayor impacto en tareas sensibles como matemáticas avanzadas, razonamiento encadenado largo y generación de código complejo.
- Riesgo de alucinación inherente a un modelo de 7B: puede inventar hechos, referencias o APIs. Requiere verificación en producción, especialmente en dominios especializados.
- Sesgos potenciales derivados del corpus de preentrenamiento de Qwen, con predominio de contenido en chino e inglés. No se documenta ningún proceso de mitigación específico para esta versión.
- Limitación idiomática: aunque declara 29 idiomas, el rendimiento en lenguas distintas del chino y el inglés es notablemente inferior y no está medido en la información disponible.
- El contexto efectivo depende del motor y de la memoria disponible para el KV cache; a 131.072 tokens la VRAM necesaria se triplica respecto a 32.768.
- La documentación de Qwen desaconseja eliminar el system prompt por defecto (`You are Qwen, created by Alibaba Cloud. You are a helpful assistant.`), ya que puede degradar el comportamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar los avisos de copyright y la atribución a Qwen. No hay cláusulas de uso aceptable adicionales más allá de las de Apache 2.0.
- Los metadatos del repositorio muestran 0 descargas y 0 likes, y una fecha de creación registrada como 2026-09-26, posterior a la fecha habitual de publicación de Qwen2.5. Conviene verificar la integridad de los pesos antes de usarlos en producción.
- No incluye visión, audio ni otras modalidades; tampoco se declara soporte de decodificación especulativa en el artefacto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/1bit-MONSTER/Qwen2.5-7B-Instruct-GGUF
- Modelo base (safetensors): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- GGUF oficial de Qwen: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-GGUF
- Motor 1bit engine: https://github.com/1bit-MONSTER/engine
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Repositorio Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Informe técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- llama.cpp (referencia de formato GGUF): https://github.com/ggml-org/llama.cpp
