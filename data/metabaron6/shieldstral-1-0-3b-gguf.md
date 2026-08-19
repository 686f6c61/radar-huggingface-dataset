# Metabaron6/Shieldstral-1.0-3B-GGUF

## Resumen

Shieldstral-1.0-3B es un clasificador de seguridad y moderación de contenidos desarrollado por Mistral AI, distribuido aquí en formato GGUF cuantizado por Metabaron6 para inferencia local eficiente. Con arquitectura Mistral3 de 3.400 millones de parámetros y ventana de contexto de 262.144 tokens, el modelo está diseñado para tareas de trust and safety: detección de contenido dañino, filtrado WAF, detección de CSAM y moderación multimodal (texto e imagen). Su licencia Apache-2.0 permite uso comercial sin restricciones.

El repositorio incluye nueve niveles de cuantización (desde BF16/F16 hasta Q3_K_M) más dos proyectores multimodales en 16-bit, con huellas de memoria que van desde ~1,6 GB hasta ~6,9 GB. El modelo soporta 12 idiomas y puede desplegarse tanto en GPU como en CPU mediante llama.cpp, con velocidades de hasta 187 tokens por segundo en GPU con cuantización Q4_K_M.

Su relevancia radica en combinar moderación de contenido de alta calidad con un tamaño compacto, lo que lo hace adecuado para producción donde el coste de inferencia y la latencia son críticos. Además, su naturaleza multimodal permite moderar texto e imágenes con un único modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral3 (transformer denso con soporte multimodal) |
| Parametros totales | 3.429.006.336 (3,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_M |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar, ru |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors disponibles en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Mistral3 de Mistral AI, un transformer denso de 3,4B parámetros con vocabulario de 131.072 tokens y ventana de contexto de 262.144 tokens. Incluye un proyector multimodal (mmproj) en precisión 16-bit que permite procesar imágenes además de texto, lo que lo convierte en un clasificador de moderación multimodal.

El entrenamiento se centra en tareas de trust and safety: detección de contenido dañino, clasificación policy-adaptive, filtrado WAF y detección de CSAM. El modelo está diseñado para adaptar su clasificación a políticas de moderación específicas definidas por el despliegue. Los detalles exactos del dataset de entrenamiento y el proceso de alineación (RLHF, DPO, etc.) no están disponibles en la información proporcionada.

La conversión a GGUF fue realizada con el convertidor de llama.cpp usando la opción `--mistral-format`, e incluye un parche posterior (15.08.2026) que corrige el tensor `v.token_embd.img_break` en los proyectores multimodales para evitar fallos de arquitectura en llama.cpp.

## Capacidades

- Clasificación de texto para moderación de contenidos y trust and safety.
- Moderación multimodal: procesa texto e imágenes simultáneamente mediante el proyector mmproj.
- Detección de contenido dañino, incluyendo CSAM (material de abuso sexual infantil).
- Filtrado WAF (Web Application Firewall) para detección de ataques y tráfico malicioso.
- Clasificación policy-adaptive: puede adaptarse a políticas de moderación personalizadas.
- Soporte multilingüe en 12 idiomas: inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano, árabe y ruso.
- Compatible con inferencia en GPU y CPU mediante llama.cpp.
- Pipeline de text-classification con soporte de endpoints compatibles con Hugging Face.

## Casos de uso

- Moderación de contenido en redes sociales y plataformas UGC: el modelo puede clasificar publicaciones, comentarios y mensajes en 12 idiomas, filtrando contenido dañino antes de su publicación. Su ventana de 262.144 tokens permite procesar hilos de conversación completos en una sola pasada.
- Detección de CSAM en plataformas de intercambio de archivos: gracias a su capacidad multimodal, puede analizar imágenes junto con metadatos de texto para identificar material de abuso sexual infantil, cumpliendo con requisitos legales de notificación en muchas jurisdicciones.
- Filtrado WAF en entornos de producción: el modelo puede clasificar peticiones HTTP entrantes para detectar patrones de ataque (inyección SQL, XSS, etc.) con baja latencia. Con Q4_K_M en GPU alcanza 187 tokens por segundo, suficiente para integrarse en pipelines de tráfico real.
- Moderación de chatbots y asistentes virtuales: integración en sistemas de conversación para detectar y bloquear respuestas dañinas o inapropiadas generadas por el propio LLM, actuando como capa de seguridad adicional.
- Cumplimiento normativo en plataformas de mensajería: clasificación de mensajes privados para detectar contenido ilegal o que viole los términos de servicio, con soporte multilingüe para despliegues internacionales.
- Análisis de imágenes en marketplaces y plataformas de anuncios: moderación de imágenes de producto para detectar contenido inapropiado o prohibido, combinando el análisis visual con el texto asociado.
- Auditoría de contenido histórico: procesamiento por lotes de grandes volúmenes de contenido almacenado para identificar y eliminar material dañino retroactivamente, aprovechando la ventana de contexto de 262.144 tokens.

## Benchmarks y rendimiento

El modelo card no incluye benchmarks de calidad (MMLU, HumanEval, GSM8K), pero sí benchmarks de rendimiento de inferencia comparando GPU vs CPU para diferentes cuantizaciones:

| Cuantizacion | Motor | Huella RAM/VRAM | Velocidad (tokens/s) | Latencia por token | Logprob (confianza) |
|---|---|---|---|---|---|
| BF16 (16 bits) | GPU (CUDA) | ~6,0 GB | 100,8 | 9,9 ms | -0,01944 (referencia) |
| BF16 (16 bits) | CPU | ~6,0 GB | 7,9 | 125,0 ms | -0,01923 |
| Q8_0 (8 bits) | GPU (CUDA) | ~3,2 GB | 147,6 | 6,7 ms | -0,01871 |
| Q8_0 (8 bits) | CPU | ~3,2 GB | 15,7 | 63,3 ms | -0,01922 |
| Q4_K_M (4,5 bits) | GPU (CUDA) | ~2,1 GB | 187,0 | 5,3 ms | -0,02038 |
| Q4_K_M (4,5 bits) | CPU | ~2,1 GB | 22,1 | 45,2 ms | -0,01867 |
| Q4_K_S (4,0 bits) | CPU | ~1,9 GB | 25,4 | 39,2 ms | -0,02051 |
| Q3_K_M (3,5 bits) | CPU | ~1,6 GB | 26,8 | 37,1 ms | -0,02591 |
| Q3_K_M (3,5 bits) | GPU (anomalía) | ~1,6 GB | 17,1 | 58,4 ms | -0,02948 |

Nota: la cuantización Q3_K_M en GPU muestra una anomalía de rendimiento (17,1 t/s frente a 26,8 t/s en CPU), probablemente debida a un manejo ineficiente de la cuantización de 3 bits en CUDA. La confianza del modelo, medida por logprob, se mantiene prácticamente constante entre cuantizaciones (entre -0,018 y -0,026), lo que indica que la pérdida de calidad por cuantización es mínima hasta Q4_K_M.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~1,6 GB (Q3_K_M) hasta ~6,0 GB (BF16). La opción recomendada Q4_K_M requiere ~2,1 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM. Una RTX 3060 (12 GB) o superior puede ejecutar todas las cuantizaciones con holgura. Para despliegues de producción, una A10 o L4 es suficiente.
- Compatible con CPU: sí, mediante llama.cpp. En CPU se obtienen entre 8 y 27 tokens/s según cuantización, suficiente para clasificación por lotes pero no para inferencia en tiempo real.
- Cabe en GPUs de consumo: sí. Incluso la versión BF16 completa (~6 GB) cabe en una RTX 3060 de 12 GB o RTX 4060 de 8 GB.
- Opciones de despliegue: llama.cpp (recomendado), llama-cpp-python, Ollama (si se importa el GGUF), y cualquier framework compatible con GGUF. El tag "endpoints_compatible" sugiere compatibilidad con Hugging Face Inference Endpoints.
- Latencia y throughput: en GPU con Q4_K_M se alcanzan 187 tokens/s con 5,3 ms de latencia por token. En CPU, la mejor opción es Q3_K_M con 26,8 tokens/s.

## Comparativa con modelos similares

El modelo base Shieldstral-1.0-3B de Mistral AI pertenece a la categoría de clasificadores de moderación y seguridad. Los competidores más directos son los modelos de la familia Llama Guard de Meta y los clasificadores de moderación de OpenAI, aunque no se dispone de datos comparativos específicos en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Multimodal | Idiomas |
|---|---|---|---|---|---|
| Shieldstral-1.0-3B (este) | 3,4B | 262.144 | Apache-2.0 | Sí (texto+imagen) | 12 |
| Llama Guard 3 (Meta) | no disponible | no disponible | no disponible | no disponible | no disponible |
| OpenAI Moderation API | no disponible | no disponible | propietaria | no disponible | no disponible |

Los datos comparativos de modelos alternativos no están disponibles en la información proporcionada. Se recomienda consultar las fichas técnicas de Llama Guard 3 y otros clasificadores de moderación para una comparativa completa.

## Limitaciones y advertencias

- La cuantización Q3_K_M en GPU presenta una anomalía de rendimiento (17,1 t/s frente a 26,8 t/s en CPU), por lo que no se recom
