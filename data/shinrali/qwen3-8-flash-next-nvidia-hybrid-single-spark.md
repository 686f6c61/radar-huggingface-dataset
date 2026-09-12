# Shinrali/Qwen3.8-Flash-Next-NVIDIA-Hybrid-Single-Spark

## Resumen

Shinrali/Qwen3.8-Flash-Next-NVIDIA-Hybrid-Single-Spark es un checkpoint de despliegue derivado de nvidia/Qwen3.8-Flash-Next-NVFP4, publicado por el usuario Shinrali, cuyo objetivo es ejecutar un modelo de ~118.434 millones de parámetros en una única NVIDIA DGX Spark (GB10, 128 GB de memoria unificada). No es un modelo entrenado desde cero ni un ajuste fino: es una recombinación de cuantizaciones sobre pesos ya existentes. Sobre el checkpoint NVFP4 oficial de NVIDIA se convierten localmente a FP8 E4M3 por bloques 300 capas lineales densas (proyecciones GDN in_proj_qkv, in_proj_z y out_proj; q/k/v/o de QSA; y gate/up/down de expertos compartidos), mientras que in_proj_ba, normas, gates, parámetros de hiperconexión y lm_head permanecen en BF16.

El repositorio extiende el trabajo blazux/qwen3.8-Flash-DGX (commit fijado bd60fcb1b492ca920f74df7462f05da7b6d98f73, licencia MIT) y sustituye el bloque de expertos MTP en FP8 de NVIDIA por un donante NVFP4 por experto (Inferact). El resultado se sirve con vLLM sobre el runtime fijado por el repositorio base, con MTP 3, vocabulario de borrador reducido a 65.536 tokens, top-k determinista en QSA, KV y estado recurrente en BF16, perfil YaRN de 500.000 tokens y prefix caching activado.

Su relevancia es acotada pero concreta: demuestra que un modelo de esta escala puede servirse en hardware de escritorio para centro de datos con 128 GB de memoria unificada, con 73,89 GiB de pesos cargados y un pool de KV de 19,73 GiB / 721.556 tokens. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la propia model card advierte de que la validación de calidad procede de una suite privada, no de benchmarks oficiales de Qwen, NVIDIA o la comunidad. La búsqueda web realizada no ha devuelto ninguna fuente relevante sobre este modelo: los resultados obtenidos eran páginas de TikTok sin relación alguna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (según la model card: componentes GDN, QSA, expertos compartidos y PLE; las siglas no se expanden en la documentación disponible). Etiquetado con los tags `qwen3.8` y `qwen4_exp` |
| Parametros totales | 118.434.281.107 (~118,43 mil millones) |
| Parametros activos | no disponible (la presencia de "shared experts" sugiere estructura MoE, pero no se publica el recuento de parámetros activos) |
| Longitud de contexto | 500.000 tokens con perfil YaRN en la configuración medida; contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | NVFP4 (checkpoint principal y expertos MTP), FP8 E4M3 por bloques (300 lineales laterales densas y PLE), BF16 (in_proj_ba, normas, gates, parámetros de hiperconexión, lm_head, KV cache y estado recurrente) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-license (`license: other`). El código del repositorio base blazux/qwen3.8-Flash-DGX se mantiene bajo MIT |
| Formato de pesos | safetensors (10 shards principales, 1 shard FP8 PLE de 51,2 GB, 1 shard donante NVFP4 MTP de 1,6 GB, índice safetensors de 33 MB) |
| Tamano del repositorio | 128,90 GB decimales (~120,05 GiB) |
| Libreria de inferencia | vLLM (runtime preview fijado por el repositorio base) |
| Pipeline | text-generation |
| Revision de pesos publicada | 15edf04a1b38dce19dffef9c7de77c8a7522561b |

## Arquitectura y entrenamiento

Este repositorio no documenta entrenamiento alguno: es un artefacto de cuantización y empaquetado sobre pesos ya entrenados. La model card describe la intervención técnica con precisión: sobre el checkpoint oficial nvidia/Qwen3.8-Flash-Next-NVFP4 se convierten a FP8 E4M3 por bloques 300 capas lineales densas de las ramas laterales (GDN `in_proj_qkv`, `in_proj_z`, `out_proj`; QSA q/k/v/o; y proyecciones gate/up/down de expertos compartidos). Los tensores `in_proj_ba`, normas, gates, parámetros de hiperconexión y `lm_head` se dejan en BF16 porque el cargador FP8 por bloques actual no admite `in_proj_ba`. El bloque de expertos MTP en FP8 de NVIDIA se elimina y se injerta un donante NVFP4 por experto (Inferact), con verificación SHA-256 `0d44e6d705d2313c713e60114e56874adf358ed5f646dc8704bb5be15f5ddbf7`; el modelo objetivo sigue verificando los tokens especulativos. El shim híbrido FP8 se reapunta desde `ModelOptNvFp4Config` a la configuración real del checkpoint oficial, `ModelOptMixedPrecisionConfig`. Los PLE permanecen en FP8 y se sirven desde NVMe con mmap, mientras que KV cache y estado recurrente se mantienen en BF16 en el perfil medido.

En cuanto a innovaciones operativas, el perfil de ejecución usa decodificación especulativa MTP con 3 tokens, un vocabulario de borrador reducido a 65.536 entradas, top-k determinista en QSA, perfil YaRN de 500.000 tokens y prefix caching. La aceptación ponderada de MTP medida en tres ejecuciones de 100K fue del 33,73%, con 66,88 segundos de extremo a extremo. No se publica información sobre composición del dataset, número de tokens de entrenamiento, RLHF ni DPO, porque el autor no ha reentrenado el modelo.

## Capacidades

- Generación de texto y conversación multi-turno: el pipeline declarado es `text-generation` y el tag `conversational` está presente en los metadatos.
- Contexto largo: el perfil medido soporta hasta 500.000 tokens con YaRN y un pool de KV de 721.556 tokens en 19,73 GiB.
- Recuperación en contexto largo: 6/6 aciertos en la prueba de retrieval de contexto largo de la suite privada, en los tres perfiles comparados.
- Tool calling / function calling: 4/4 en la suite privada de despliegue, en los tres perfiles comparados.
- Decodificación especulativa con MTP: el modelo conserva la verificación de tokens especulativos del bloque MTP injertado.
- Serving con prefix caching: activado en el perfil medido, útil para cargas con prefijo repetido.
- Capacidades de razonamiento y código: no hay datos específicos publicados para este checkpoint; se heredan del modelo base nvidia/Qwen3.8-Flash-Next-NVFP4, no verificadas en la información disponible.
- Capacidades multimodales o de audio: no disponible (no se mencionan en la model card).
- Idiomas: no disponible; no se declara lista de idiomas soportados.

## Casos de uso

- Inferencia on-premise en una sola DGX Spark: el caso de uso central del repositorio. Con 73,89 GiB de pesos cargados y 128 GB de memoria unificada en la GB10, permite servir un modelo de ~118B sin clúster multi-GPU, algo relevante cuando el dato no puede salir de la organización.
- Atención al cliente automatizada con conversaciones largas: la ventana de 500.000 tokens con YaRN y el pool de 721.556 tokens permiten mantener historiales extensos y documentación de producto en el mismo contexto, evitando truncados agresivos en conversaciones multi-turno.
- RAG sobre corpus documental extenso: el resultado 6/6 en retrieval de contexto largo y el prefix caching activado lo hacen adecuado para pipelines donde el prefijo (instrucciones, esquema, documentos base) se repite entre consultas y se reutiliza en caché.
- Agentes con llamada a herramientas: el 4/4 en tool calling de la suite privada permite integrarlo en flujos de agente que consultan APIs internas, bases de datos o servicios de ticketing, con el modelo actuando como planificador y ejecutor de llamadas.
- Asistente de código interno: al heredar los pesos del modelo base, puede usarse para autocompletado, revisión de parches y explicación de código dentro de una red corporativa, sin depender de APIs externas. No hay métricas publicadas de HumanEval o similares para este checkpoint.
- Prototipado e investigación en cuantización híbrida: el repositorio documenta paso a paso la conversión a FP8 por bloques, el injerto del donante NVFP4 y el reapuntado del shim de configuración, lo que lo convierte en una referencia reproducible para estudiar mezclas NVFP4/FP8/BF16 en hardware GB10.
- Sustitución de API en la nube por soberanía del dato: al ejecutarse íntegramente en local con Docker Compose y exponer el alias `qwen38-flash-next` en el puerto 30000, encaja en entornos regulados donde el tráfico a proveedores externos está restringido.
- Evaluación comparativa de configuraciones de cuantización: sus tres perfiles medidos (BF16-side, FP8-side y RadixArk) permiten reproducir experimentos de coste/rendimiento antes de fijar una configuración de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks oficiales (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos cuantitativos son de rendimiento de inferencia y de una suite privada de regresión, medidos en una DGX Spark (GB10, 128 GB de memoria unificada), con vLLM preview, MTP 3, vocabulario de borrador de 65.536 tokens, top-k determinista en QSA, KV y estado recurrente en BF16, perfil YaRN de 500.000 tokens y prefix caching activado:

| Perfil | Prefill 8K (tokens/s) | Decode 8K (tokens/s) | Prefill 100K (tokens/s) | Decode 100K (tokens/s) | Regresión privada |
|---|---:|---:|---:|---:|---:|
| NVIDIA BF16-side + NVFP4 MTP | 2253,28 | 20,36 | 2177,88 | 21,21 | 147/162 |
| NVIDIA FP8-side + NVFP4 MTP (este checkpoint) | 2303,64 | 24,77 | 2129,24 | 25,92 | 144/162 |
| RadixArk FP8-side + NVFP4 MTP | 2341,93 | 26,05 | 2154,00 | 26,86 | 147/162 |

Datos adicionales del perfil medido: 66,88 segundos de media de extremo a extremo en tres ejecuciones de 100K, 33,73% de aceptación ponderada de MTP, 73,89 GiB de pesos cargados y pool de KV de 19,73 GiB para 721.556 tokens. La suite privada de 162 casos no es un benchmark oficial de Qwen, NVIDIA ni de la comunidad: el checkpoint publicado obtiene 144/162 frente a 147/162 de los perfiles comparados, con cinco pérdidas y dos ganancias tras la conversión FP8-side y un valor p exacto bilateral de 0,453125 en comparación emparejada. Con esa muestra no se establece una diferencia de calidad estadísticamente fiable, pero tampoco justifica reportar 147/162 para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: en el perfil medido se cargan 73,89 GiB de pesos, más 19,73 GiB de pool de KV en la configuración de 100K con 721.556 tokens. Se necesitan al menos ~94 GiB de memoria agregada en ese perfil.
- GPU recomendada: NVIDIA DGX Spark con GB10 y 128 GB de memoria unificada, la única plataforma medida. No hay datos publicados para A100, H100 u otras GPU.
- GPU de consumo: con ~73,89 GiB de pesos, esta configuración no cabe en GPU de consumo de 24, 32 o 48 GB. El repositorio no publica variantes de cuantización de menor huella que permitan ejecutarlo en esas tarjetas.
- Almacenamiento: el repositorio ocupa 128,90 GB decimales (~120,05 GiB); la preparación local de la conversión requiere soporte de hard-links y unos 13 GiB para reescribir los shards laterales, y el injerto del donante MTP exige al menos 64 GiB libres.
- Opciones de despliegue: vLLM sobre el runtime fijado por el repositorio base, con imágenes Docker construidas en tres pasos (`Dockerfile.nvidia-nvfp4mtp`, `Dockerfile.nvidia-hybrid`) y arranque mediante `docker compose -f recipes/nvidia-hybrid/compose.example.yaml`. El ejemplo publica el puerto 30000 y sirve el alias `qwen38-flash-next`. No se documentan Ollama, llama.cpp ni TGI para este checkpoint.
- Latencia y throughput: 2303,64 tokens/s de prefill a 8K y 24,77 tokens/s de decode a 8K; 2129,24 tokens/s de prefill a 100K y 25,92 tokens/s de decode a 100K; 66,88 s de extremo a extremo en 100K, con 33,73% de aceptación ponderada de MTP.
- Memoria de sistema: el modelo base se sirve desde NVMe con mmap para los PLE en FP8, lo que condiciona el diseño del almacenamiento local.

## Comparativa con modelos similares

| Modelo / perfil | Parametros | Contexto | Decode 100K (tokens/s) | Regresion privada | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Shinrali/Qwen3.8-Flash-Next-NVIDIA-Hybrid-Single-Spark (FP8-side + NVFP4 MTP) | ~118,43 mil millones | 500.000 con YaRN (perfil medido) | 25,92 | 144/162 | nvidia-open-model-license | HuggingFace, 0 descargas |
| NVIDIA BF16-side + NVFP4 MTP (perfil de comparación) | ~118,43 mil millones | 500.000 con YaRN (perfil medido) | 21,21 | 147/162 | nvidia-open-model-license | Solo como perfil de medición en la model card |
| RadixArk FP8-side + NVFP4 MTP (perfil de comparación) | ~118,43 mil millones | 500.000 con YaRN (perfil medido) | 26,86 | 147/162 | No disponible en la información proporcionada | Solo como perfil de medición en la model card |
| nvidia/Qwen3.8-Flash-Next-NVFP4 (modelo base) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | nvidia-open-model-license | HuggingFace (referenciado como `base_model`) |

No se dispone de datos de rendimiento publicados para alternativas de otros fabricantes de tamaño o tarea comparable, por lo que la comparación se limita a los perfiles medidos dentro de la misma familia.

## Limitaciones y advertencias

- No es un modelo entrenado ni ajustado: es una recombinación de cuantizaciones sobre nvidia/Qwen3.8-Flash-Next-NVFP4. Cualquier capacidad se hereda del modelo base y no ha sido revalidada con benchmarks oficiales.
- Los únicos datos de calidad proceden de una suite privada de 162 casos, no reproducible con los materiales publicados. La diferencia de 144/162 frente a 147/162 no es estadísticamente significativa (p = 0,453125), pero la model card recomienda validar los prompts específicos de cada aplicación antes de sustituir una configuración orientada a calidad.
- Idioma: no se declara lista de idiomas soportados. El comportamiento multilingüe es, por tanto, desconocido para este checkpoint.
- Riesgo de alucinación: no cuantificado en la información disponible. Al ser un artefacto de cuantización, los riesgos del modelo base se mantienen y pueden verse alterados por el cambio de precisión en 300 capas lineales.
- Dependencia de un runtime muy concreto: se requiere la versión preview de vLLM fijada por el repositorio base, más dos parches específicos (dispatch NVFP4 MTP y reapuntado del shim FP8). No hay garantía de compatibilidad con versiones posteriores de vLLM.
- El cargador FP8 por bloques no admite `in_proj_ba`, lo que obliga a mantener ese tensor y varios componentes en BF16; cualquier intento de convertir esa rama rompería el checkpoint.
- La preparación local exige hard-links, ~13 GiB para reescribir shards laterales y al menos 64 GiB libres en el paso de repack, además de verificación SHA-256 del donante. Los scripts rechazan sobrescribir un destino existente.
- Licencia: nvidia-open-model-license (`license: other`). Es imprescindible revisar los términos del acuerdo de NVIDIA antes de cualquier uso comercial; el código del repositorio base se mantiene bajo MIT, pero los pesos no.
- Adopción nula verificable: 0 descargas y 0 likes en el momento de la consulta, y una única revisión de pesos publicada. No hay validación independiente por parte de terceros.
- La búsqueda web realizada no ha devuelto ninguna fuente relacionada con este modelo; toda la información procede de la model card y de los metadatos de HuggingFace.
- Huella de hardware elevada: ~73,89 GiB de pesos más 19,73 GiB de pool de KV en el perfil de 100K. No cabe en GPU de consumo y no se publican variantes de menor precisión para reducirla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shinrali/Qwen3.8-Flash-Next-NVIDIA-Hybrid-Single-Spark
- Modelo base: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Repositorio de código y documentación del que deriva (blazux/qwen3.8-Flash-DGX, commit bd60fcb1b492ca920f74df7462f05da7b6d98f73): https://github.com/blazux/qwen3.8-Flash-DGX
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Resultados de la búsqueda web: no se ha encontrado ninguna fuente relevante sobre este modelo; los resultados devueltos correspondían a páginas de TikTok sin relación con el contenido.
