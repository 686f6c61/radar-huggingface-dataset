# cloudyu/GLM5.3-SLIM-GGUF

## Resumen

GLM5.3-SLIM-GGUF es una cuantización GGUF del modelo autotrust/GLM-5.3-SLIM, una variante de la familia GLM-5.3 de Z.ai (zai-org) con 192 expertos por capa. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 562.153.591.104 parámetros totales según los pesos en safetensors del repositorio, orientado a generación de texto conversacional y razonamiento. Esta versión GGUF la publica el usuario cloudyu para su uso con llama.cpp.

La relevancia de esta ficha radica en que permite ejecutar un modelo MoE de escala muy grande en una única GPU de 180 GB mediante una cuantización de precisión mixta de 2,46 bits por peso (bpw). Los expertos enrutados se cuantizan a 2 bits (IQ2_XXS para gate/up y Q2_K para down), mientras que atención, expertos compartidos, capas densas, embeddings y salida se mantienen en Q8_0. El resultado son 161 GiB de pesos repartidos en 20 shards.

El modelo incorpora además una cabeza MTP (multi-token prediction) opcional para decodificación especulativa y soporta control del esfuerzo de razonamiento por petición (`low` o `high`). La licencia es la GLM-5.3 License del modelo base, marcada como "other".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (192 expertos por capa), arquitectura GLM_DSA en llama.cpp |
| Parametros totales | 562.153.591.104 |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 65536 tokens con 2 slots o 32768 con 1 slot en una GPU de 180 GB (limitado por memoria restante); en los ejemplos de ejecución se usa `-c 32768` |
| Tipos de cuantizacion | Precisión mixta 2,46 bpw: expertos enrutados IQ2_XXS (gate/up) y Q2_K (down); resto Q8_0. Cabeza MTP opcional en Q4K para expertos y Q8 para el resto |
| Idiomas soportados | no disponible |
| Licencia | GLM-5.3 License (license: other, license_name: glm-5.3) |
| Formato de pesos | GGUF (20 shards) más un GGUF separado para la cabeza MTP |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 192 expertos por capa, del que esta publicación es una cuantización GGUF para llama.cpp. La arquitectura declarada en llama.cpp es GLM_DSA, y el repositorio incluye una cabeza MTP (multi-token prediction) separada que actúa como modelo borrador para decodificación especulativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

La innovación técnica destacable de esta publicación es la estrategia de cuantización de precisión mixta: se comprime agresivamente la parte del modelo que concentra la mayor parte de los parámetros (los expertos enrutados, a 2 bits) mientras se preserva en Q8_0 todo lo que interviene en cada token (atención, expertos compartidos, capas densas, embeddings y cabeza de salida). Esto permite reducir 562 mil millones de parámetros a 161 GiB, lo que hace viable el despliegue en una sola GPU de 180 GB. Adicionalmente, el soporte de decodificación especulativa mediante la cabeza MTP y el control de `reasoning_effort` por petición son características operativas relevantes.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` y el pipeline `text-generation`.
- Razonamiento con esfuerzo configurable por petición: `reasoning_effort` acepta `low` o `high`, y el formato de razonamiento se expone con `--reasoning-format deepseek`.
- Decodificación especulativa opcional mediante la cabeza MTP incluida (`--spec-type draft-mtp`), con hasta 3 tokens borrador por paso (`--spec-draft-n-max 3`).
- Servido con API compatible con OpenAI (`/v1/chat/completions`) a través de `llama-server`.
- Soporte de plantillas de chat mediante `--jinja`.
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling, function calling, agentes, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un modelo de 562 mil millones de parámetros en una sola GPU: gracias a la cuantización de 2,46 bpw y 161 GiB de pesos, se puede servir en una GPU de 180 GB sin necesidad de infraestructura multi-nodo, lo que simplifica la operación y reduce costes de interconexión.
- Razonamiento con coste controlado: el parámetro `reasoning_effort` permite usar `low` para consultas simples y `high` para tareas que requieren cadenas de razonamiento largas, ajustando la latencia y el consumo de tokens por petición.
- Servicio de chat compatible con OpenAI: al exponer `/v1/chat/completions`, se puede integrar como backend de aplicaciones existentes que ya consumen la API de OpenAI sin cambios en el cliente.
- Prototipado e investigación sobre modelos MoE de gran escala: la disponibilidad en GGUF permite experimentar con un MoE de 192 expertos en llama.cpp, incluyendo comparaciones entre decodificación estándar y especulativa con la cabeza MTP.
- Inferencia con contexto largo en una sola máquina: con 65536 tokens y 2 slots en una GPU de 180 GB, es adecuado para procesar documentos extensos o conversaciones con historial amplio.
- Evaluación de cuantizaciones de 2 bits: el repositorio sirve como referencia práctica para medir la pérdida de calidad de IQ2_XXS/Q2_K en expertos enrutados frente a Q8_0 en el resto de componentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 161 GiB de pesos en la cuantización publicada; el contexto adicional se limita a la memoria restante. En una GPU de 180 GB caben 65536 tokens con 2 slots o 32768 con 1 slot.
- GPU recomendadas: una GPU única de 180 GB (por ejemplo, del segmento de memoria unificada de gran capacidad); el autor indica explícitamente que cabe en una sola GPU de 180 GB.
- GPU de consumo: no cabe en ninguna GPU de consumo actual; 161 GiB superan ampliamente los 24 GB de una RTX 4090 o los 32 GB de una RTX 5090.
- Despliegue: llama.cpp con soporte CUDA y arquitectura GLM_DSA (`llama-server`), con `-ngl 999` y `-fa on`. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. La cabeza MTP permite decodificación especulativa que, según el autor, se activa con `--spec-draft-n-max 3`, pero no se publican cifras de aceleración.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La cuantización a 2 bits de los expertos enrutados (IQ2_XXS y Q2_K) implica una pérdida de calidad respecto al modelo base en precisión completa; no se han publicado evaluaciones que cuantifiquen esa degradación.
- El contexto máximo depende de la memoria libre junto a los pesos: en una GPU de 180 GB se reduce a 32768 tokens con un solo slot.
- Requiere una compilación reciente de llama.cpp con soporte CUDA y de la arquitectura GLM_DSA; versiones antiguas no cargarán el modelo.
- Los 20 shards deben descargarse completos; el servidor localiza los shards automáticamente a partir del primero.
- La licencia es la GLM-5.3 License (marcada como "other"), por lo que las condiciones de uso comercial deben verificarse en el enlace de licencia del modelo base antes de desplegarlo en producción.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación; el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria publicada.
- El autor del GGUF es un usuario independiente (cloudyu), no el desarrollador original del modelo base; la reproducibilidad de la cuantización depende de sus scripts, no publicados en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cloudyu/GLM5.3-SLIM-GGUF
- Modelo base: https://huggingface.co/autotrust/GLM-5.3-SLIM
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3/blob/main/LICENSE
- Repositorio del modelo original GLM-5.3: https://huggingface.co/zai-org/GLM-5.3
