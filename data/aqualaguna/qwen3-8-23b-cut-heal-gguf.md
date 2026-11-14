# aqualaguna/Qwen3.8-23B-Cut-Heal-GGUF

## Resumen

Qwen3.8-23B-Cut-Heal-GGUF es una distribucion en formato GGUF del modelo aqualaguna/Qwen3.8-23B-Cut-Heal, un derivado de Qwen3.8-27B en el que se han recortado las capas FFN (feed-forward network) y se ha fusionado de vuelta un adaptador de destilacion. El autor de la publicacion es aqualaguna, un perfil independiente de Hugging Face, y el modelo se distribuye bajo licencia Apache-2.0. La publicacion es de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni valoraciones.

El modelo resuelve el problema de ejecutar un modelo multimodal de gran tamano (23.231.251.456 parametros, aproximadamente 23,2 mil millones) en entornos locales mediante llama.cpp. El repositorio incluye dos artefactos: el modelo de texto en cuantizacion Q8_0 (unos 24,7 GB) y un proyector de vision en BF16 (unos 0,9 GB), lo que permite inferencia image-text-to-text en local. La arquitectura subyacente es la de Qwen3.8-27B, un transformer denso con bloque MTP (multi-token prediction) para decodificacion especulativa, recortado en las capas FFN hasta los 23B.

La relevancia de esta publicacion es limitada y conviene ser explicito: la propia model card advierte de que el modelo no alcanzo su umbral de calidad interno y de que el Qwen3.8-27B sin recortar en Q8_0 obtiene mejores resultados globales (media protegida 92,7 frente a 90,7; codigo dificil 48 frente a 32). Se trata, por tanto, de un experimento de poda y destilacion documentado con honestidad, util para estudiar el impacto del pruning en modelos multimodales, pero no de una opcion recomendada para produccion frente al modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.8-27B, con capas FFN recortadas y bloque MTP (multi-token prediction) para decodificacion especulativa |
| Parametros totales | 23.231.251.456 (aproximadamente 23,2 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens segun el comando de referencia de llama-server (`-c 65536`); el maximo nativo del modelo base no se detalla en la informacion disponible |
| Tipos de cuantizacion | Q8_0 (unico archivo de texto publicado en este repo); existe una version NVFP4 en repo separado |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (texto en Q8_0, proyector de vision en BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de la familia Qwen, y aplica dos transformaciones: un recorte de las capas FFN para reducir el numero de parametros de aproximadamente 27B a 23,2B, y la fusion de un adaptador de destilacion ("heal") para recuperar parte de la capacidad perdida durante el pruning. El bloque MTP se conserva en el archivo GGUF, lo que habilita decodificacion especulativa en llama.cpp y, en teoria, mejora el throughput de generacion. El proyector de vision se mantiene sin cambios respecto al modelo base, de modo que las capacidades multimodales dependen del tower visual original.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset de destilacion ni si se aplicaron fases de RLHF o DPO. La model card tampoco especifica la metodologia exacta de seleccion de capas recortadas ni la funcion de perdida del adaptador. Lo que si se documenta es el proceso de conversion: llama.cpp b11675 mediante `convert_hf_to_gguf.py --outtype q8_0`, y todas las metricas del autor se midieron sobre este archivo Q8_0 con esa misma version de llama.cpp.

## Capacidades

- Generacion de texto y razonamiento conversacional, con soporte de modo de razonamiento configurable mediante `reasoning_effort` (el ejemplo de la model card usa `"low"`).
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias al proyector de vision BF16 incluido en el repositorio.
- Decodificacion especulativa mediante el bloque MTP incluido en el GGUF.
- Soporte de plantilla de chat Jinja (`--jinja`) en llama-server, lo que permite tool calling y function calling si la plantilla del modelo base lo contempla.
- Capacidades de codigo: la model card reporta una metrica de "hard code" (48 en el modelo sin recortar, 32 en este), lo que indica evaluacion especifica de generacion de codigo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan capacidades de audio ni de agente autonomo multi-paso mas alla de lo que herede del modelo base.

## Casos de uso

- Evaluacion comparativa de pruning: el modelo sirve para medir empiricamente la perdida de calidad al recortar capas FFN en un transformer multimodal de 27B, usando la tabla de resultados del autor como referencia y reproduciendo las pruebas con llama.cpp b11675.
- Inferencia local multimodal en estaciones de trabajo: con el GGUF Q8_0 y el proyector BF16 se puede desplegar un asistente que describa imagenes y responda preguntas sobre ellas sin conexion a servicios en la nube, a costa de unos 25,6 GB de almacenamiento.
- Prototipado de pipelines de vision-lenguaje: util para validar integraciones de image-text-to-text en llama.cpp antes de migrar a un modelo de mayor calidad, dado que la API es identica a la del base.
- Analisis de codigo asistido: aunque su rendimiento en codigo dificil es notablemente inferior al base (32 frente a 48), puede emplearse en tareas de codigo de dificultad media donde el coste de un error sea bajo.
- Experimentacion con decodificacion especulativa: el bloque MTP incluido permite estudiar el impacto del draft block en latencia y throughput dentro de llama.cpp sin necesidad de un modelo draft separado.
- Docencia e investigacion sobre destilacion: el par recorte + adaptador "heal" es un caso documentado de recuperacion parcial de capacidad, util como material de estudio en cursos de compresion de modelos.
- Despliegue en vLLM sobre Blackwell: la model card remite a la version NVFP4 en un repositorio separado para escenarios donde se prioriza velocidad en GPU Blackwell sobre la cuantizacion Q8_0.

## Benchmarks y rendimiento

La model card incluye una comparacion directa entre este modelo recortado y el Qwen3.8-27B sin recortar, ambos en Q8_0 y medidos en llama.cpp b11675:

| Metrica | Qwen3.8-23B-Cut-Heal (Q8_0) | Qwen3.8-27B sin recortar (Q8_0) |
|---|---|---|
| Media protegida (protected mean) | 90,7 | 92,7 |
| Codigo dificil (hard code) | 32 | 48 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar, ni comparaciones con modelos de terceros. Los dos valores anteriores son los unicos datos numericos aportados por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q8_0 ocupa unos 24,7 GB y el proyector de vision unos 0,9 GB; con cache KV en q8_0 para 65.536 tokens hay que anadir varios GB adicionales, por lo que se recomienda un minimo de 32 GB de VRAM y 40 GB o mas para contexto largo.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para el Q8_0 con contexto completo. En GPUs consumer de 24 GB (RTX 4090, RTX 3090) el Q8_0 no cabe entero y requeriria offload parcial a CPU, con la consiguiente caida de throughput.
- Cabe en consumer GPU: solo con cuantizaciones mas agresivas no publicadas en este repositorio; el Q8_0 publicado no cabe en 24 GB.
- Opciones de despliegue: llama.cpp (llama-server, version b11675 o superior segun el autor), y vLLM sobre Blackwell mediante la version NVFP4 del repositorio separado. No se mencionan Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El bloque MTP permite decodificacion especulativa, pero el autor no publica cifras de tokens por segundo.
- Comando de referencia del autor: `llama-server -m Qwen3.8-23B-Cut-Heal-Q8_0.gguf --mmproj mmproj-Qwen3.8-23B-Cut-Heal-BF16.gguf --jinja -ngl 99 -c 65536 --cache-type-k q8_0 --cache-type-v q8_0 --flash-attn on --chat-template-kwargs '{"reasoning_effort":"low"}'`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-23B-Cut-Heal-GGUF (este) | 23,2B | 65.536 tokens (config. de referencia) | Media protegida 90,7; codigo dificil 32 | Apache-2.0 | GGUF Q8_0 + proyector BF16 |
| Qwen3.8-27B (base, sin recortar) | ~27B | No disponible | Media protegida 92,7; codigo dificil 48 | Apache-2.0 (segun el autor) | Pesos originales del modelo base |
| Qwen3.8-23B-Cut-Heal-NVFP4 | 23,2B | No disponible | No disponible | Apache-2.0 | NVFP4 para vLLM en Blackwell |

La comparacion con alternativas de terceros de la misma categoria no esta disponible en la informacion proporcionada. El dato mas relevante es que el propio modelo base sin recortar supera a esta version en ambas metricas publicadas.

## Limitaciones y advertencias

- Calidad inferior al modelo base: el autor reconoce explicitamente que el modelo no alcanzo su umbral interno de calidad y que el Qwen3.8-27B sin recortar obtiene mejores resultados (90,7 frente a 92,7 en media protegida; 32 frente a 48 en codigo dificil).
- Degradacion concentrada en codigo: la caida de 48 a 32 en codigo dificil es proporcionalmente mucho mayor que la caida en la media general, lo que desaconseja su uso en tareas de programacion exigentes.
- Riesgo de alucinacion: no cuantificado por el autor; al ser un modelo destilado y recortado, la perdida de capacidad puede manifestarse en mayor tasa de errores factuales, pero no hay datos que lo confirmen.
- Sesgos: no documentados en la informacion disponible.
- Idiomas: no se especifica la cobertura linguistica; no se puede asumir el multilingusimo del modelo base sin verificacion.
- Contexto: los 65.536 tokens corresponden a la configuracion de ejemplo, no necesariamente al maximo nativo; no se detalla el limite real del modelo.
- Licencia: Apache-2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion y la model card desaconseja implicitamente su uso frente al base.
- Madurez: repositorio con cero descargas y cero valoraciones en el momento de la consulta, creado y actualizado el mismo dia (14 de noviembre de 2026), sin validacion externa de la comunidad.
- Requisitos de VRAM elevados para un modelo de 23B: el Q8_0 publicado no cabe en GPUs consumer de 24 GB, lo que limita su adopcion frente a cuantizaciones de 4 bits.

## Enlaces

- Repositorio GGUF: https://huggingface.co/aqualaguna/Qwen3.8-23B-Cut-Heal-GGUF
- Modelo base (pesos originales recortados): https://huggingface.co/aqualaguna/Qwen3.8-23B-Cut-Heal
- Version NVFP4 para vLLM en Blackwell: https://huggingface.co/aqualaguna/Qwen3.8-23B-Cut-Heal-NVFP4
- llama.cpp (herramienta de conversion e inferencia, version b11675 citada por el autor): https://github.com/ggml-org/llama.cpp
