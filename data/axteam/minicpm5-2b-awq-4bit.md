# axteam/MiniCPM5-2B-AWQ-4bit

## Resumen

MiniCPM5-2B-AWQ-4bit es una versión cuantizada en 4 bits (AWQ INT4, esquema W4A16) del modelo openbmb/MiniCPM5-2B, creada por el usuario axteam y orientada específicamente al despliegue con vLLM. El modelo base es un LLM denso de unos 2.517 millones de parámetros con arquitectura tipo Llama, orientado a generación de texto conversacional, y el modelo original pertenece a OpenBMB.

El propósito de esta cuantización es reducir el tamaño en disco y la huella de memoria del modelo original para servirlo en hardware más modesto: los pesos ocupan aproximadamente 2,1 GB frente a los varios GB que requeriría la versión en BF16. La cuantización es post-entrenamiento (PTQ, sin reentrenamiento), con calibración sobre 256 muestras, y conserva en BF16 los token embeddings, la LM head y todas las capas RMSNorm.

Un dato relevante para evaluar esta ficha: el propio autor advierte de una degradación notable por la cuantización a 4 bits. En su evaluación interna (100 prompts en inglés y coreano, decodificación greedy), la perplexity sube un 14,2 % respecto al original BF16 y el acuerdo de siguiente token top-1 cae al 84,9 %. Por ello recomienda las variantes de 8 bits (FP8 o AWQ INT8) cuando la calidad sea prioritaria. El modelo hereda del original un modo "thinking" activado por defecto en la plantilla de chat, que puede desactivarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, arquitectura tipo Llama, solo texto |
| Parametros totales | 2.516.756.480 (~2,52 B) |
| Parametros activos | no disponible (no es MoE; todos los parámetros son activos) |
| Longitud de contexto | 32.768 tokens (según el ejemplo de despliegue con `--max-model-len 32768`) |
| Tipos de cuantizacion | AWQ INT4 (W4A16): pesos INT4 asimétricos, grupo 32, activaciones BF16; embeddings, LM head y RMSNorm en BF16; formato compressed-tensors `pack-quantized` |
| Idiomas soportados | no disponible (la evaluación interna del autor usa inglés y coreano; no hay lista oficial de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors `pack-quantized`) |

## Arquitectura y entrenamiento

El modelo base, MiniCPM5-2B de OpenBMB, es un transformer denso con arquitectura tipo Llama (según el tag `llama` de Hugging Face y la model card), solo texto, de aproximadamente 2,52 B de parámetros. No hay datos publicados en la información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en el modelo base.

Esta variante concreta no modifica la arquitectura ni el entrenamiento: es una cuantización post-entrenamiento (PTQ) con el método AWQ en INT4, esquema W4A16 (pesos INT4 asimétricos agrupados en bloques de 32, activaciones en BF16), calibrada con 256 muestras y almacenada en formato compressed-tensors `pack-quantized` para compatibilidad nativa con vLLM. El tokenizador y la plantilla de chat son idénticos a los del original. Como innovación operativa, la model card documenta cómo reducir la memoria de la caché KV en tiempo de servicio mediante KV cache en FP8 (`--kv-cache-dtype fp8`), que la reduce aproximadamente a la mitad en contextos largos.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`), con plantilla de chat idéntica a la del modelo original.
- Modo "thinking" (razonamiento extendido) activado por defecto en la plantilla de chat; desactivable con `chat_template_kwargs={"enable_thinking": False}`.
- Compatibilidad con servidores OpenAI-compatible vía vLLM, lo que facilita la integración con clientes estándar de la API de OpenAI.
- Soporte de contexto de hasta 32.768 tokens en despliegue con vLLM.
- Solo texto: no hay capacidades de visión, audio ni multimodalidad documentadas.
- No hay información disponible sobre soporte de tool calling / function calling ni sobre capacidades de agentes.
- Capacidades multilingües: no hay lista oficial; la evaluación del autor se realizó sobre un conjunto mixto en inglés y coreano, lo que sugiere soporte al menos para ambos idiomas.

## Casos de uso

- Prototipado y pruebas de servidores LLM locales: con ~2,1 GB de pesos, el modelo cabe en GPUs de consumo modestas y permite levantar un servidor OpenAI-compatible con vLLM en minutos, útil para desarrollo y demos.
- Inferencia en GPUs de VRAM limitada: la cuantización INT4 reduce la huella de memoria lo suficiente para ejecutar el modelo en tarjetas de 8 GB, adecuado para estaciones de trabajo sin GPUs de datacenter.
- Chatbots y asistentes conversacionales ligeros: el pipeline conversacional con plantilla de chat y modo thinking configurable permite montar asistentes de pregunta-respuesta en entornos con recursos limitados, aunque con la calidad degradada propia del INT4.
- Procesamiento de documentos de longitud media: la ventana de 32.768 tokens permite resumir o analizar textos largos (informes, artículos) en una sola pasada.
- Experimentación con cuantización: la model card incluye métricas de fidelidad medidas (perplexity y acuerdo top-1 frente al BF16), lo que lo hace útil como caso de estudio para comparar el impacto de AWQ INT4 frente a variantes de 8 bits.
- Servicios con caché KV optimizada: en despliegues con contextos largos o lotes grandes, la opción de KV cache en FP8 permite duplicar la capacidad de concurrentes o de contexto con el mismo hardware.
- Integración en pipelines de inferencia en castellano u otros idiomas vía API: al exponer una API OpenAI-compatible, puede sustituir a otros modelos en aplicaciones existentes sin cambios de código, previa validación de calidad en el idioma objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) ni para esta versión cuantizada ni, en la información disponible, para el modelo base. La única evaluación disponible es la medición interna del propio autor sobre fidelidad respecto al original BF16:

| Metrica | MiniCPM5-2B-AWQ-4bit | Original BF16 |
|---|---|---|
| Perplexity (menor = más fiel) | 1,8260 | 1,5988 (+14,2 % de degradación) |
| Acuerdo de siguiente token (top-1) | 84,9 % | 98,9 % |

Conjunto de evaluación: 100 prompts mixtos inglés/coreano, respuestas greedy del BF16 puntuadas bajo cada build. El propio autor señala que la degradación a 4 bits es notable y recomienda las builds de 8 bits (FP8 / AWQ INT8) cuando la calidad sea prioritaria.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan ~2,1 GB en disco; con overhead de activaciones, caché KV y runtime de vLLM, una estimación razonable de partida es del orden de 4-6 GB de VRAM sin contexto largo (cifra estimada, no publicada por el autor). Con `--max-model-len 32768` y KV cache en BF16 el consumo crece; usar `--kv-cache-dtype fp8` reduce la caché KV aproximadamente a la mitad.
- GPU recomendadas: no disponible (no hay recomendaciones oficiales). Por tamaño, cualquier GPU moderna con 8 GB de VRAM debería alojar el modelo; en el rango de datacenter, GPUs como A10G, L4 o superiores son más que suficientes.
- Consumer GPUs: por su tamaño reducido (~2,1 GB de pesos), el modelo es candidato natural para GPUs de consumo de 8 GB o más (por ejemplo, RTX 3060/4060 Ti de 8-16 GB, RTX 4090 con holgura); el autor no publica requisitos exactos.
- Opciones de despliegue: vLLM es el runtime objetivo documentado (formato compressed-tensors `pack-quantized`, ejemplos de servidor OpenAI-compatible e inferencia offline en Python). No hay instrucciones para llama.cpp, Ollama, TGI o transformers puros; la librería declarada es `transformers`, pero la cuantización compressed-tensors está pensada para vLLM.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparativa con alternativas en la categoría de modelos ~2 B cuantizados a 4 bits para despliegue ligero:

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-AWQ-4bit (este) | 2,52 B | AWQ INT4 (W4A16) | 32.768 tokens (en despliegue) | Apache-2.0 | Degradación INT4 documentada por el autor; recomienda builds de 8 bits |
| MiniCPM5-2B (original, openbmb) | 2,52 B | BF16 (sin cuantizar) | no disponible | Apache-2.0 | Referencia de calidad: perplexity 1,5988 y 98,9 % de acuerdo top-1 en la evaluación interna |
| Variantes FP8 / AWQ INT8 del mismo modelo | 2,52 B | FP8 / AWQ INT8 | no disponible | Apache-2.0 | Recomendadas por el autor frente a la INT4 por su mayor fidelidad |
| Qwen2.5-1.5B-Instruct (referencia de categoría) | 1,5 B | BF16 / GGUF / AWQ (community) | 32.768 tokens | Qwen Research / Apache-2.0 (según versión) | Alternativa ligera muy extendida; benchmarks públicos disponibles |

Nota: la comparativa con Qwen2.5-1.5B es orientativa por categoría y tamaño; no hay datos de benchmarks que permitan comparar rendimiento directo entre ambos.

## Limitaciones y advertencias

- Degradación por cuantización: la propia model card advierte de una pérdida de calidad notable en INT4 (perplexity +14,2 % y acuerdo top-1 del 84,9 % frente al 98,9 % del BF16). Para producción con requisitos de calidad, el autor recomienda las builds de 8 bits (FP8 / AWQ INT8).
- Sesgos conocidos: no disponible. Al heredar los pesos del modelo base OpenBMB, hereda también sus sesgos, no documentados en la información disponible.
- Riesgo de alucinación: inherente a todo LLM de ~2,5 B parámetros; el tamaño reducido y la cuantización agresiva sugieren validar cuidadosamente las salidas en tareas de hechos y razonamiento.
- Limitaciones de idioma: no hay lista oficial de idiomas soportados; la evaluación interna se limitó a inglés y coreano. El rendimiento en castellano no está verificado y debe validarse antes de uso en producción.
- Solo texto: sin capacidades de visión ni audio.
- Contexto: el dato de 32.768 tokens proviene del ejemplo de despliegue; no hay especificación oficial de la ventana máxima del modelo base en la información disponible.
- Licencia: Apache-2.0, permisiva y apta para uso comercial sin restricciones relevantes; los pesos y el tokenizador originales pertenecen a OpenBMB.
- Advertencia de madurez del repositorio: descargas muy bajas (34) y cuantización de terceros (axteam, no OpenBMB), sin auditoría externa; conviene validar la build antes de depender de ella en producción.
- Modo thinking activado por defecto: puede generar razonamiento extendido no deseado en algunos casos de uso; desactivarlo explícitamente si no se necesita.

## Enlaces

- Modelo cuantizado: https://huggingface.co/axteam/MiniCPM5-2B-AWQ-4bit
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Paper, blog oficial, repositorio de código o demo del modelo base: no disponibles en la información proporcionada.
