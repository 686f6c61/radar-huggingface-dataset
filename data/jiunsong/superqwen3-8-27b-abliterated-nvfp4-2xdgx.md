# Jiunsong/SuperQwen3.8-27b-abliterated-NVFP4-2xDGX

## Resumen

SuperQwen3.8-27b-abliterated-NVFP4-2xDGX es una versión cuantizada y "abliterated" (sin censura) del modelo multimodal Qwen3.8-27B de Alibaba, publicada por Jiunsong. Combina la eliminación de respuestas de rechazo mediante técnicas de abliteration con una cuantización NVFP4 W4A4 de grupo 16, optimizada específicamente para el hardware DGX Spark de NVIDIA. El resultado es un modelo que mantiene las capacidades de razonamiento, tool calling y visión del modelo original, pero con una velocidad de decodificación aproximadamente 2,4 veces superior a la versión BF16 en ese hardware.

La relevancia de este modelo reside en su enfoque práctico: aborda dos problemas comunes en despliegues de producción —la censura excesiva en modelos de propósito general y la latencia en inferencia— mediante una compresión agresiva que preserva las rutas críticas de calidad. Con un contexto nativo de 262 043 tokens y hasta 1 000 045 tokens con extensión YaRN, está diseñado para aplicaciones de contexto largo en entornos con recursos limitados pero exigentes, como estaciones de trabajo con una sola GPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3.8) con atención lineal y full attention, vision tower |
| Parametros totales | 16 703 361 232 (según safetensors; el nombre del modelo sugiere 27B, posible discrepancia) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 043 tokens nativo; 1 000 045 tokens con YaRN (verificado) |
| Tipos de cuantizacion | NVFP4 W4A4 (group size 16) con partes protegidas en BF16 (vision, MTP, conv1d, lm_head) |
| Idiomas soportados | Inglés, coreano |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (5 shards empaquetados + 1 shard BF16 para MTP) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso multimodal de Alibaba que combina atención lineal para eficiencia en contexto largo con full attention en capas seleccionadas. Sobre esta base, el autor aplica un proceso de abliteration que elimina las respuestas de rechazo del modelo, reduciendo la tasa de refusal de 18/32 a 0/32 en pruebas internas. Este proceso se realiza mediante un fine-tune que modifica las activaciones del modelo para evitar la generación de contenido de negativa.

Posteriormente, el modelo se cuantiza a NVFP4 W4A4 con grupo 16 utilizando la librería compressed-tensors. La cuantización preserva en BF16 exacto las rutas sensibles a la calidad: el vision tower, la capa MTP (Multi-Token Prediction) necesaria para decodificación especulativa, las capas conv1d y el lm_head. La calibración se realizó con 32 muestras de 8192 tokens cada una, con semilla determinista 38027. El autor verificó estructuralmente 496 tensores empaquetados, incluyendo 64 de atención completa, 192 de MLP y 240 de atención lineal, con hashes SHA-256 en el directorio `evidence/`.

## Capacidades

- Generación de texto multimodal: procesa entradas de imagen y texto, con salida de texto en inglés y coreano.
- Razonamiento con modo thinking: soporta niveles de razonamiento (low, medium, high, xhigh) con un mecanismo de parada para evitar overthinking. El nivel por defecto es `medium` en lugar del `xhigh` original, corrigiendo el fallo común de reconsiderar respuestas correctas.
- Tool calling: soporte para invocación de funciones externas, verificado en las pruebas de release.
- Visión: el vision tower se preserva exactamente en BF16, manteniendo las capacidades de comprensión de imágenes del modelo base.
- Contexto largo: ventana nativa de 262 043 tokens con decodificación especulativa K=1, y hasta 1 000 045 tokens con extensión YaRN y K=0.
- Decodificación especulativa: incluye la capa MTP necesaria para la decodificación especulativa de Qwen, con un valor estable de K=1 que pasa todas las pruebas de calidad.
- Sin censura: el abliteration elimina las respuestas de rechazo, permitiendo generar contenido que el modelo base rechazaría.

## Casos de uso

- Atención al cliente automatizada sin restricciones temáticas: el modelo puede gestionar conversaciones multi-turno sobre temas sensibles (salud, finanzas, asesoramiento legal) sin rechazar preguntas, gracias a su abliteration. Su contexto de 262K tokens permite mantener el historial completo de una interacción larga.
- Análisis de documentos extensos con razonamiento: con la ventana nativa de 262K tokens, puede procesar manuales técnicos, contratos o informes completos y responder preguntas complejas sobre ellos, utilizando el modo de razonamiento `medium` para evitar respuestas excesivamente largas.
- Generación de código en producción con tool calling: soporta invocación de funciones y puede integrarse en pipelines de CI/CD para generar, revisar o completar código. La decodificación especulativa K=1 reduce la latencia en entornos de alta concurrencia.
- Asistente de investigación multimodal: al combinar visión y texto, puede analizar figuras, gráficos y diagramas junto con texto académico, extrayendo conclusiones razonadas. El contexto de 1M tokens con YaRN permite procesar corpus completos de artículos.
- Despliegue en edge con DGX Spark: su cuantización NVFP4 y su tamaño de ~19 GiB lo hacen apto para estaciones de trabajo con una sola GPU, logrando 86 tok/s agregados con 6 concurrencias, ideal para prototipado y demos en local.
- Agente autónomo de razonamiento multi-paso: el modelo puede encadenar llamadas a herramientas y razonar sobre los resultados, con un mecanismo de parada explícito para evitar bucles de reconsideración. Su comportamiento sin censura permite explorar soluciones no convencionales sin auto-limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona mediciones propias de rendimiento de decodificación y pruebas de retención de contexto, resumidas a continuación:

| Prueba | Topología | Prompt / concurrencia | Resultado |
|---|---|---|---|
| Decodificación agregada | 1× DGX Spark, K=1 | p256 / C1 | 17,7532 tok/s |
| Decodificación agregada | 1× DGX Spark, K=1 | p256 / C6 | 86,1382 tok/s |
| Decodificación agregada | 2× DGX Spark independientes, K=1 | p256 / C6 | 95,9850 tok/s |
| Retención de contexto nativa | K=1 | 262 043 tokens | Aguja recuperada |
| Retención de contexto YaRN | K=0 | 1 000 045 tokens | Aguja recuperada |
| Refusal | — | 32 prompts | 0/32 (antes 18/32) |
| Overthinking | — | 36 pruebas | 36/36 pasan |

Estas cifras son mediciones agregadas de concurrencia, no velocidad de un solo flujo. La comparación con BF16 muestra una mejora de 38,5630 a 86,1382 tok/s en el mismo hardware.

## Requisitos de hardware

- VRAM estimada: el modelo pesa aproximadamente 19,15 GiB en disco, por lo que requiere al menos 24 GB de VRAM para inferencia con cuantización NVFP4 y overhead de KV cache.
- GPU recomendadas: DGX Spark (GPU Grace Blackwell con 128 GB de memoria unificada) es el hardware de referencia. También es compatible con GPUs consumer de 24 GB o más, como RTX 4090, RTX 3090 o A5000, siempre que soporten el formato NVFP4 (requiere arquitectura Ampere o superior).
- No cabe en GPUs de 16 GB o menos sin reducir aún más la cuantización o el contexto.
- Opciones de despliegue: vLLM (recomendado, con soporte para decodificación especulativa y FP8 KV cache), TGI, y posiblemente llama.cpp si se convierte a GGUF (aunque el formato NVFP4 es específico de NVIDIA).
- Latencia y throughput: 17,75 tok/s en un solo flujo y 86,14 tok/s agregados con 6 flujos concurrentes en DGX Spark. En dos nodos con round-robin, 95,99 tok/s agregados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| SuperQwen3.8-27b-abliterated-NVFP4-2xDGX (este) | ~16,7B (safetensors) | 262K nativo / 1M YaRN | NVFP4 W4A4 | Apache-2.0 | Abliterated, decodificación especulativa K=1 |
| Qwen3.8-27B (base) | ~27B | 262K nativo / 1M YaRN | BF16 | Apache-2.0 | Modelo original de Alibaba, sin abliteration |
| SuperQwen3.8-27b-abliterated (sin cuantizar) | ~27B | 262K nativo / 1M YaRN | BF16 | Apache-2.0 | Versión abliterated en BF16, más lenta |
| unsloth/Qwen3.8-27B-NVFP4 | ~27B | 262K nativo | NVFP4 | Apache-2.0 | Cuantización estándar sin abliteration |

Los datos de rendimiento de las alternativas no están disponibles en la información proporcionada, por lo que no es posible una comparación cuantitativa directa. La principal diferencia de este modelo es la combinación de abliteration y cuantización agresiva con protección de rutas críticas.

## Limitaciones y advertencias

- Sesgos y contenido dañino: al eliminar los rechazos, el modelo puede generar contenido inapropiado, ofensivo o peligroso sin filtros. No es adecuado para aplicaciones donde se requiera moderación de contenido.
- Riesgo de alucinación: como cualquier LLM, puede inventar hechos o razonamientos incorrectos, especialmente en contextos largos o temas especializados.
- Idiomas limitados: solo se declaran inglés y coreano. El modelo base probablemente soporta más idiomas, pero este fine-tune no los garantiza.
- Degradación por cuantización: aunque las rutas críticas están protegidas, la cuantización NVFP4 W4A4 puede introducir errores en tareas de precisión numérica o razonamiento matemático complejo en comparación con BF16.
- Contexto de 1M requiere configuración especial: la ventana de 1 000 045 tokens solo funciona con YaRN y K=0 (sin decodificación especulativa), lo que reduce el rendimiento.
- Dependencia de hardware NVIDIA: el formato NVFP4 es exclusivo de GPUs NVIDIA recientes, limitando su portabilidad a otros fabricantes.
- Verificación limitada: las pruebas de rendimiento y calidad son auto-reportadas por el autor, sin validación independiente. No hay benchmarks académicos publicados.
- Licencia Apache-2.0: permite uso comercial, pero el abliteration puede considerarse una modificación del modelo original, que también es Apache-2.0, por lo que no hay conflicto legal aparente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jiunsong/SuperQwen3.8-27b-abliterated-NVFP4-2xDGX
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Blog sobre abliteration de Qwen3.8-27B: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Herramienta sparkDash (mencionada en la model card): https://github.com/MiaAI-Lab/sparkDash
