# mradermacher/Huihui-Ministral-3-3B-Reasoning-2512-abliterated-GGUF

## Resumen

Huihui-Ministral-3-3B-Reasoning-2512-abliterated-GGUF es la versión cuantizada en formato GGUF del modelo huihui-ai/Huihui-Ministral-3-3B-Reasoning-2512-abliterated, un derivado "abliterated" (sin alineación de rechazo) del Ministral-3-3B-Reasoning-2512 de Mistral. El trabajo de cuantización lo firma mradermacher, un conocido publicador de quants estáticos e imatrix para llama.cpp, y el repositorio ofrece 12 variantes que van desde Q2_K (1,6 GB) hasta F16 (7,0 GB).

El modelo subyacente es un transformer denso de 3.429.006.336 parámetros según los safetensors del autor original, orientado a razonamiento y con vocación multilingüe (11 idiomas declarados, entre ellos castellano). La familia Ministral-3 combina, en su versión completa, un modelo de lenguaje de ~3,4B con un encoder de visión de ~0,4B según la información de terceros recogida; sin embargo, la model card de este repositorio GGUF indica `skip_mmproj: 1`, es decir, el proyector multimodal no se incluye en los ficheros publicados.

Su relevancia práctica es doble: por un lado, permite ejecutar un modelo de razonamiento de 3,4B en hardware de consumo (una GPU de 6-8 GB o incluso CPU con 8 GB de RAM); por otro, la variante abliterated elimina el comportamiento de rechazo, lo que la hace útil para investigación en seguridad y generación de datos, pero problemática para productos comerciales con requisitos de moderación. La licencia declarada en el repositorio es apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Mistral Ministral-3); el modelo base incluye un encoder de vision de ~0,4B, no empaquetado en estos GGUF |
| Parametros totales | 3.429.006.336 (recuento de safetensors del modelo base) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar (11) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (un fichero por cuantizacion); safetensors en el repositorio del modelo base |
| Tag de pipeline | No disponible |
| Compatibilidad | `endpoints_compatible`, `mistral-common`, `transformers` |
| Descargas / likes | 478 / 0 |
| Fecha de creacion / actualizacion | 2025-12-05 / 2026-10-24 |
| Tamano del repositorio | 31,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Mistral (tokenizador `mistral-common`), en variante densa de aproximadamente 3,4B de parámetros. El nombre del checkpoint, "-2512", sugiere una revisión de diciembre de 2025 de la familia Ministral-3; la información disponible no detalla el número de capas, dimensiones ocultas, número de cabezas ni el tamaño del vocabulario. Según fuentes de terceros, el modelo completo de la familia Ministral-3-3B-Reasoning combina el modelo de lenguaje de 3,4B con un encoder de visión de 0,4B para entrada de imagen; la model card de este repositorio GGUF, sin embargo, incluye la marca `skip_mmproj: 1`, por lo que el proyector multimodal no se distribuye aquí y estos ficheros deben tratarse como texto únicamente.

El rasgo técnico definitorio es la abliteración: el autor original (huihui-ai) aplica una técnica de ablación direccional que identifica la dirección de activación asociada al rechazo y ortogonaliza los pesos respecto a ella, de modo que el modelo deja de emitir negativas sistemáticas ante determinadas peticiones. Los tags `abliterated` y `uncensored` lo confirman, pero la información proporcionada no documenta el procedimiento exacto, el conjunto de datos de calibración, ni si hubo fases posteriores de RLHF/DPO tras la ablación. La variante "Reasoning" implica capacidades de razonamiento extendido, si bien no se especifica en los datos disponibles la sintaxis concreta de los tokens de pensamiento.

El trabajo de mradermacher es exclusivamente de cuantización: "static quants" generados a partir del checkpoint HF, con una familia paralela de cuants ponderados por imatrix publicada en un repositorio separado (`-i1-GGUF`). No hay reentrenamiento ni fine-tuning por parte del cuantizador.

## Capacidades

- Generación de texto y razonamiento multi-paso: el sufijo "Reasoning" indica entrenamiento orientado a cadenas de razonamiento, útil para problemas de lógica y matemáticas de nivel medio.
- Generación de código y explicación de código, dentro de los límites propios de un modelo de 3,4B.
- Multilingüismo declarado en 11 idiomas: inglés, francés, castellano, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe.
- Variante sin censura: la abliteración suprime el comportamiento de rechazo, lo que permite obtener respuestas sobre temas que el modelo base declinaría.
- Entrada multimodal (texto + imagen) en el modelo base; no disponible en estos GGUF al omitirse el proyector `mmproj`.
- Integración con el ecosistema llama.cpp/Ollama y con Hugging Face Inference Endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y multi-step tool use: no confirmado en la información disponible.
- Capacidad de audio o vídeo: no disponible.

## Casos de uso

- Asistente de código en local para entornos sin conexión: con la cuantización Q4_K_M (2,2 GB) el modelo cabe en una GPU de 4-6 GB o en CPU con 8 GB de RAM, lo que permite integrarlo como autocompletado o chatbot de revisión de código en estaciones de trabajo aisladas.
- Atención al cliente on-premise en castellano y otros idiomas europeos: los 11 idiomas declarados y el tamaño reducido permiten desplegar un chatbot multi-turno en servidores modestos, manteniendo los datos dentro de la infraestructura de la empresa.
- Generación de datos sintéticos para fine-tuning: al no rechazar peticiones, la variante abliterated resulta útil para producir corpus de instrucciones y respuestas sobre dominios sensibles (salud, legal, seguridad) donde el modelo base filtraría el contenido.
- Red teaming y auditoría de seguridad: sirve como modelo "sin moderación" de referencia para comprobar si los filtros de una aplicación se apoyan solo en el comportamiento del LLM o en salvaguardas externas reales.
- Investigación sobre alineación y abliteración: comparar las respuestas de este checkpoint con el Ministral-3-3B-Reasoning-2512 original permite medir el coste en coherencia y calidad que introduce la ablación direccional.
- Procesamiento por lotes de clasificación y extracción de entidades: con Q8_0 (3,8 GB) o Q4_K_M se pueden procesar miles de documentos en una sola GPU consumer, priorizando coste por token sobre calidad absoluta.
- Traducción y redacción multilingüe ligera: para pares es↔en, fr, de, it o pt en herramientas de escritorio, con latencia baja al ejecutarse en local.
- Aplicaciones de escritorio y edge computing: empaquetar el GGUF Q4_K_S (2,2 GB) dentro de una app de escritorio permite inferencia offline sin dependencias de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, según los ficheros publicados): Q2_K 1,6 GB; Q3_K_S 1,7 GB; Q3_K_M 1,9 GB; Q3_K_L 2,0 GB; IQ4_XS 2,1 GB; Q4_K_S y Q4_K_M 2,2 GB; Q5_K_S 2,5 GB; Q5_K_M 2,6 GB; Q6_K 2,9 GB; Q8_0 3,8 GB; F16 7,0 GB.
- A esas cifras hay que sumar la caché KV, cuyo coste no puede calcularse porque la longitud de contexto no está disponible en la información proporcionada. Como referencia práctica, en un modelo de 3,4B suele ser de unos cientos de MB a 1-2 GB según contexto y precisión de la caché.
- GPU consumer compatibles: cualquier GPU con 6 GB o más ejecuta Q4_K_M con margen (RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070, RTX 4090, RTX 2080, GTX 1660 Super 6 GB). Las cuantizaciones Q2_K a IQ4_XS caben en GPUs de 4 GB (GTX 1650, RTX 3050 de portátil) con contexto corto.
- Despliegue solo en CPU: viable con llama.cpp; se recomiendan 8 GB de RAM para Q4_K_M, 12 GB para Q6_K y 16 GB para F16.
- GPUs de datacenter: A100, H100, L40S o L4 están sobradamente dimensionadas; tiene más sentido agrupar varias instancias por GPU mediante batching que asignar una GPU dedicada por modelo.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`), Ollama (importando el GGUF mediante Modelfile), LM Studio, koboldcpp, llama-cpp-python; vLLM o TGI requieren el repositorio en safetensors del modelo base, no estos GGUF.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones en la información proporcionada.
- Para mayor calidad con el mismo tamaño, el autor mantiene cuants ponderados por imatrix en el repositorio `Huihui-Ministral-3-3B-Reasoning-2512-abliterated-i1-GGUF`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GGUF, abliterated) | 3,429 M | No disponible | No disponible | apache-2.0 | 478 descargas, 0 likes; 12 cuantizaciones |
| mradermacher/Huihui-Ministral-3-14B-Reasoning-2512-abliterated-GGUF | ~14B (según nombre) | No disponible | No disponible | No disponible en la informacion | 646 descargas, 2 likes |
| Ministral-3-3B-Reasoning-2512 (GGUF sin abliterar) | 3,4B LM + 0,4B vision | No disponible | No disponible | No disponible en la informacion | 6,30 GB, 5.351 descargas, 41 likes |
| Otras familias de ~3B (Llama 3.2 3B, Qwen2.5-3B, Gemma 2 2B) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa con modelos de otras familias no puede completarse con los datos proporcionados. Cabe señalar que la variante sin abliterar del mismo modelo acumula más de diez veces las descargas de esta versión (5.351 frente a 478), lo que sugiere que la mayoría de usuarios prioriza el checkpoint original pese a la pérdida de capacidades que introduce la ablación.

## Limitaciones y advertencias

- Modelo abliterated: la supresión de la dirección de rechazo degrada la alineación de seguridad y puede producir contenido dañino, ilegal o sexualmente explícito ante peticiones que el modelo original rechazaría. No es apto para aplicaciones orientadas al público sin filtros externos.
- La ablación direccional suele correlacionar con una pérdida de coherencia y de calidad en tareas generales; no se han publicado mediciones de esa degradación en la información disponible.
- Riesgo de alucinación elevado: con 3,4B de parámetros, la fiabilidad factual en dominios especializados es limitada, especialmente en contextos largos o con muchos datos numéricos.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones o documentos largos sin verificar empíricamente el límite del modelo base.
- Cobertura idiomática desigual: los 11 idiomas están declarados, pero el rendimiento relativo entre ellos no está documentado; el castellano no necesariamente tiene la misma calidad que el inglés.
- Sin visión en estos ficheros: `skip_mmproj: 1` implica que el proyector multimodal no se incluye, aunque el modelo base sí procese imágenes. Para entrada de imagen hay que acudir al repositorio original en safetensors.
- Licencia: el repositorio declara apache-2.0, pero al tratarse de un derivado de un modelo de Mistral conviene verificar los términos upstream del checkpoint original antes de un uso comercial, ya que la información disponible no detalla la licencia del modelo base de Mistral.
- Sin garantías del cuantizador: mradermacher distribuye los cuants "tal cual", sin evaluación de calidad ni benchmarks asociados; los quants de 2 y 3 bits (Q2_K, Q3_K_S) degradan notablemente la perplejidad según las referencias gráficas enlazadas en la propia model card.
- Modelo sin tracción comunitaria: 0 likes y 478 descargas implican poca validación externa; conviene hacer una evaluación propia antes de integrarlo en producción.
- Fecha de actualización del repositorio (2026-10-24) posterior a la de creación (2025-12-05): no se documenta qué cambió entre ambas revisiones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Huihui-Ministral-3-3B-Reasoning-2512-abliterated-GGUF
- Modelo base (safetensors): https://huggingface.co/huihui-ai/Huihui-Ministral-3-3B-Reasoning-2512-abliterated
- Cuants ponderados por imatrix: https://huggingface.co/mradermacher/Huihui-Ministral-3-3B-Reasoning-2512-abliterated-i1-GGUF
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#Huihui-Ministral-3-3B-Reasoning-2512-abliterated-GGUF
- Colección Ministral-3-abliterated de huihui-ai: https://huggingface.co/collections/huihui-ai/ministral-3-abliterated
- Variante de 14B (mismo autor y pipeline): https://huggingface.co/mradermacher/Huihui-Ministral-3-14B-Reasoning-2512-abliterated-GGUF
- Ficha de la variante de 14B en abliteration.org: https://abliteration.org/models/mradermacher/Huihui-Ministral-3-14B-Reasoning-2512-abliterated-GGUF
- Ficha de Ministral 3 3B Reasoning 2512 en local-ai-zone: https://local-ai-zone.github.io/models/ministral-3-3b-reasoning-2512.html
- Espejo en SourceForge: https://sourceforge.net/projects/ministral-3-3b-reasoning-2512/
- Guía de uso de GGUF citada por el autor (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
