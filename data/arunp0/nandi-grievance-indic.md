# arunp0/nandi-grievance-indic

## Resumen

Nandi (`arunp0/nandi-grievance-indic`) es un clasificador de texto open-weights desarrollado de forma independiente por Arun Prabhakaran (LatentAI Labs) para enrutar quejas y reclamaciones ciudadanas en India. A partir de un texto de entrada en hindi, hinglish, inglés indio u otras diez lenguas indias, el modelo devuelve una de 53 categorías (con probabilidades y top-3), el dominio correspondiente y un nivel de urgencia experimental (P1/P2/P3). Las categorías siguen las taxonomías oficiales de los reguladores y sistemas de reclamaciones indios: RBI (banca), IRDAI (seguros), CPGRAMS (administración central), TRAI/DoT (telecomunicaciones) y la National Consumer Helpline.

Técnicamente es un encoder XLM-RoBERTa-large de unos 560 millones de parámetros, ajustado durante 3 épocas sobre 109.776 quejas y no-quejas sintéticas en 13 lenguas, con dos cabezas de clasificación (una de 53 vías para categoría y otra de 3 vías para urgencia). Su relevancia está en ofrecer un enrutador de reclamaciones pequeño, rápido y ejecutable en local (CPU o GPU, sin llamadas a API) bajo licencia Apache-2.0, algo útil para sistemas de atención al cliente y ventanillas de quejas que procesan texto multilingüe y code-mixed.

Es importante subrayar que el autor declara abiertamente sus limitaciones: en texto real alcanza una exactitud de categoría del 62,5 % (top-3 del 81,3 %), la detección de urgencia solo captura alrededor de 1 de cada 4 casos P1 reales, y aproximadamente 1 de cada 5 publicaciones reales que no son quejas se enrutan igualmente a una categoría. El modelo está pensado para usarse con supervisión humana, no como decisión automática final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder XLM-RoBERTa-large con mean pooling, cabeza de categoria de 53 vias y cabeza de urgencia de 3 vias |
| Parametros totales | 559.890.432 (~560M) |
| Parametros activos | no disponible (no es MoE; al ser un encoder denso, todos los parametros estan activos) |
| Longitud de contexto | 512 tokens (los textos mas largos se truncan) |
| Tipos de cuantizacion | no disponible (solo pesos en fp32/fp16 via safetensors; sin versiones cuantizadas publicadas) |
| Idiomas soportados | Hindi, hinglish, ingles indio, bengali, tamil, telugu, marati, gujarati, kannada, malayalam, punjabi, urdu y odia, en escritura nativa y romanizada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (2,3 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa-large, un encoder transformer multilingue preentrenado por Meta AI sobre 2,5 TB de CommonCrawl en 100 lenguas. Sobre este backbone se anade mean pooling y dos cabezas de clasificacion: una de 53 vias para la categoria de la queja y otra de 3 vias para el nivel de urgencia (P1/P2/P3). El resultado se expone mediante una API Python `route()` que devuelve categoria, dominio, confianza, urgencia con probabilidades y el top-3 de categorias.

El ajuste se realizo durante 3 epocas sobre 109.776 quejas y no-quejas sinteticas en 13 lenguas, generadas con modelos de escritura y cubriendo las taxonomias de RBI, IRDAI, CPGRAMS, TRAI/DoT y la National Consumer Helpline, ademas de la clase "no es una queja" (`none.out_of_scope`). Todo el conjunto de entrenamiento es sintetico (disponible como `arunp0/nandi-grievance-synthetic`); el conjunto de evaluacion sobre texto real es privado y sus etiquetas fueron revisadas con LLM. No se ha publicado informacion sobre el uso de tecnicas como RLHF o DPO, que no serian aplicables a un clasificador de este tipo. La inferencia puede acelerarse con Text Embeddings Inference (aparece en los tags del repositorio) y el modelo se ejecuta en local sin llamadas a APIs externas.

## Capacidades

- Clasificacion de quejas en 53 categorias alineadas con las listas oficiales de RBI (banca), IRDAI (seguros), CPGRAMS (administracion), TRAI/DoT (telecom) y la National Consumer Helpline.
- Salida del top-3 de categorias con probabilidades, util para enrutar con revision humana.
- Asignacion de dominio (banco, seguros, telecom, consumo, etc.) ademas de la categoria fina.
- Deteccion experimental de urgencia en tres niveles (P1/P2/P3) con probabilidades por nivel.
- Deteccion de textos que no son quejas mediante la clase `none.out_of_scope` (con fiabilidad limitada en texto real).
- Procesamiento multilingue: 13 lenguas incluido hinglish y texto code-mixed, en escritura nativa y romanizada.
- Procesamiento por lotes mediante el metodo `route_batch()` para alto rendimiento.
- Ejecucion completamente local en CPU o GPU, sin dependencia de APIs externas.

No soporta generacion de texto, razonamiento multi-paso, tool calling, vision ni audio: es un clasificador de texto puro.

## Casos de uso

- Enrutamiento automatico de tickets en banca: un mensaje como "UPI se 2.000 rupayas kat gaye..." se clasifica como `bank.digital_banking` con alta confianza, permitiendo dirigirlo al equipo de banca digital sin intervencion manual inicial.
- Filtrado de entradas en portales de quejas tipo CPGRAMS: el modelo separa quejas de otro tipo de publicaciones (agradecimientos, consultas, spam) antes de que un operador humano las revise, reduciendo la carga de triaje.
- Priorizacion parcial de incidencias en centros de contacto: la cabeza de urgencia puede servir como primera pasada para marcar candidatos P1 (por ejemplo, acoso por apps de prestamos), aunque siempre con revision humana dada su baja tasa de captura real.
- Atencion al cliente multilingue en telecomunicaciones: quejas en tamil, telugu o hindi romanizado sobre cortes de servicio o facturacion pueden clasificarse sin traducirlas previamente.
- Integracion en pipelines de analitica de redes sociales: procesamiento por lotes de publicaciones publicas (mediante `route_batch()`) para detectar volumenes de quejas por sector y categoria.
- Sistemas de ventanilla unica de consumo: el top-3 de categorias con probabilidades permite presentar opciones a un agente humano que confirma o corrige, en un flujo human-in-the-loop.
- Clasificacion de quejas de seguros: mensajes sobre rechazo de reclamaciones o primas se asignan a categorias IRDAI para su derivacion al departamento adecuado.
- Despliegue en entornos con datos sensibles: al ejecutarse localmente bajo Apache-2.0, quejas con datos personales pueden procesarse sin enviar texto a servicios de terceros.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente). El conjunto sintetico usa un modelo escritor distinto al de entrenamiento; el conjunto real es privado, de 443 publicaciones con etiquetas revisadas por LLM.

| Conjunto | Tarea | Exactitud | Top-3 exactitud | Macro-F1 |
|---|---|---|---|---|
| Real, ciego (443 filas, privado) | Categoria (53 clases) | 0,625 | 0,813 | 0,428 |
| Sintetico (2.985 filas, 13 lenguas) | Categoria (53 clases) | 0,929 | no disponible | 0,909 |

Comparativa declarada por el autor sobre el mismo conjunto real de 443 publicaciones:

| Modelo | Exactitud de categoria | Macro-F1 |
|---|---|---|
| Nandi | 0,625 | 0,428 |
| Qwen3.6-35B-A3B zero-shot (~60x mayor) | 0,664 | 0,624 |
| Yama zero-shot (mismo tamano de encoder) | 0,366 | 0,283 |

La brecha entre el rendimiento sintetico (0,929 de exactitud) y el real (0,625) indica sobreajuste al dominio sintetico. El propio autor reconoce que un LLM zero-shot mucho mayor es algo mas preciso y notablemente mejor en categorias raras; la propuesta de valor de Nandi es su tamano, coste y velocidad.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 2,3 GB en fp32 para los pesos, mas overhead del framework; con fp16, alrededor de 1,2-1,5 GB. Cabe con holgura en GPUs de consumo.
- GPUs recomendadas: cualquier GPU moderna; no se requiere hardware especial. Ejecutable tambien en CPU, donde un encoder de 560M con entrada de 512 tokens mantiene latencias del orden de decenas a cientos de milisegundos por texto (estimacion, no dato publicado).
- Consumer GPUs: totalmente viable en RTX 3060, RTX 4060 o superiores; el modelo no tiene requisitos exigentes.
- Despliegue: mediante `transformers` con el script `router.py` incluido en el repositorio (via `snapshot_download`), que es la forma soportada. Los tags indican compatibilidad con Text Embeddings Inference (TEI). No hay versiones GGUF publicadas, por lo que llama.cpp u Ollama no son rutas directas; vLLM o TGI tampoco son mencionados por el autor.
- Procesamiento por lotes disponible mediante `route_batch()` para mejorar el throughput en cargas altas.
- Latencia y throughput exactos: no disponibles; el autor solo indica que es "pequeno, local y rapido" frente a un LLM 60 veces mayor.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto | Rendimiento declarado | Licencia |
|---|---|---|---|---|---|
| Nandi (nandi-grievance-indic) | ~560M | Clasificador fino de quejas, 53 categorias, 13 lenguas + hinglish | 512 tokens | 0,625 exactitud / 0,813 top-3 en texto real | Apache-2.0 |
| Yama (arunp0/yama-indic) | ~560M (mismo encoder) | Clasificador zero-shot para las mismas lenguas | 512 tokens | 0,366 exactitud en texto real (zero-shot) | no disponible |
| Qwen3.6-35B-A3B (zero-shot) | ~35B (MoE, ~3B activos) | LLM generalista usado zero-shot para la misma tarea | no disponible | 0,664 exactitud / 0,624 macro-F1 en texto real | no disponible |

Nandi queda entre ambos: claramente mejor que un clasificador zero-shot de su mismo tamano (Yama) y solo algo por detras de un LLM MoE 60 veces mayor en exactitud de categoria, aunque con macro-F1 inferior (0,428 frente a 0,624), lo que indica peor rendimiento en categorias raras. Su ventaja competitiva es el coste de inferencia y la ejecucion local.

## Limitaciones y advertencias

- Rendimiento en texto real limitado: 62,5 % de exactitud y macro-F1 de 0,428; el autor lo califica como "usable con un humano en el bucle", no como decision autonoma.
- Deteccion de urgencia experimental: captura solo ~1 de cada 4 quejas P1 reales, y ~1 de cada 10 si se excluye el acoso por apps de prestamos. No debe usarse para priorizar sin revision humana.
- Falsos positivos de enrutamiento: ~1 de cada 5 publicaciones reales que no son quejas se clasifican igualmente en una categoria.
- Entrenamiento 100 % sintetico: existe una brecha importante entre el rendimiento sintetico (0,929) y el real (0,625); el conjunto real de evaluacion es privado y no reproducible externamente.
- Confianzas no calibradas: los valores de probabilidad que devuelve el modelo no deben interpretse como probabilidades reales de acierto.
- Macro-F1 bajo: el rendimiento en categorias raras es notablemente peor que en categorias frecuentes; un LLM zero-shot mayor lo supera en ese aspecto.
- Sesgo linguistico de evaluacion: el conjunto de prueba real esta compuesto mayoritariamente por ingles, hindi y hinglish, por lo que el rendimiento en las otras lenguas indias esta menos contrastado.
- Contexto de 512 tokens: los textos mas largos se truncan, lo que puede afectar a quejas largas y detalladas.
- Resultados no verificados: todas las metricas proceden del autor y estan marcadas como no verificadas; no hay evaluacion independiente publicada.
- Licencia: Apache-2.0 permite uso comercial sin restricciones relevantes; no se aplican advertencias de licencia.
- Es un proyecto personal e independiente, con muy poca traccion publica (35 descargas y 1 like en el momento de la ficha), lo que implica comunidad y soporte limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arunp0/nandi-grievance-indic
- Dataset sintetico de entrenamiento: https://huggingface.co/datasets/arunp0/nandi-grievance-synthetic
- Articulo en Towards AI: https://pub.towardsai.net/nandi-carries-every-complaint-to-the-right-desk-open-source-ai-for-indian-languages-743b55c912a2
- Resumen y FAQ del proyecto: https://latentailabs.github.io/nandi-grievance-routing/
- Canal de YouTube del autor: https://www.youtube.com/@LatentAILabs
- Modelo companion Yama (clasificador zero-shot): https://huggingface.co/arunp0/yama-indic
- Modelo companion Chitragupta (detector de PII): https://huggingface.co/arunp0/chitragupta-pii-indic
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
