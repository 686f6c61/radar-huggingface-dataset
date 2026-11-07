# johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-HGN

## Resumen

ThinkingCap-Qwen3.8-Flash-Next-HGN es una conversión al formato nativo Halogen `.hgn` (política v2) del fine-tune BF16 `bottlecapai/ThinkingCap-Qwen3.8-Flash-Next`, publicado por el usuario `johnlockejrr`. El modelo subyacente es un post-entrenamiento de BottleCap AI sobre `Qwen/Qwen3.8-Flash-Next`, un transformer de tipo mixture-of-experts (MoE) con entrada de imagen desarrollado por el equipo Qwen de Alibaba. El objetivo del post-entrenamiento es reducir la verbosidad del modo de razonamiento ("thinking") manteniendo la precisión.

La relevancia de esta publicación no está en el modelo en sí (que ya existe en BF16 en el Hub), sino en el empaquetado: pesos cuantizados en un formato propietario que solo carga el runtime `halogen-flash-server` (versión 0.19.1 o equivalente). No es un re-entrenamiento ni una re-cuantización a GGUF; es una conversión directa BF16 → HGN con la herramienta `bf16-to-hgn` 0.1.0.

El paquete ocupa aproximadamente 111 GiB en tres ficheros `.hgn` (trunk + MTP embebido, tabla n-gram y torre de visión), lo que lo sitúa en la clase de despliegue de memoria unificada tipo Strix Halo. Al no ser compatible con Transformers, vLLM ni llama.cpp, su utilidad práctica queda restringida a infraestructuras que ya operen Halogen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts) con entrada de imagen y MTP embebido |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Halogen v2: I4R (expertos enrutados), HT4 (dense HT y LM head), Q6G64 (mixers de hiper-conexión), Q4C-P (embeddings y proyecciones pequeñas), Q8G64 (MTP dense/mixer), BF16 (torre de visión), FP8G (tabla n-gram) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en el Hub) |
| Formato de pesos | Halogen `.hgn` (no compatible con safetensors, GGUF ni Transformers) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.8-Flash-Next`, un transformer de mezcla de expertos con capacidad de procesamiento de imágenes, según la model card del fine-tune de BottleCap AI. Sobre esa base, ThinkingCap aplica un post-entrenamiento orientado a "shorter-thinking": el modelo sigue emitiendo cadenas de razonamiento, pero con un 38,5 % menos de tokens de pensamiento de media (rango del 22 % al 51 % según el benchmark), a costa de una pérdida de precisión media de aproximadamente un punto (88,8 % frente a 89,8 % del modelo base). No se detalla en la información disponible la composición del dataset de post-entrenamiento ni si se empleó RLHF, DPO u otra técnica.

La conversión a `.hgn` se realizó con `bf16-to-hgn` 0.1.0 (build CUDA), perfil v2, política `bf16-hgn-v2-rtn-nf4-signed-rms-trellis-v1`, especificación HGN 1.1.0. Se trata de una cuantización RTN (round-to-nearest) con trellis y NF4 con signo, no de una importación desde GGUF. El paquete incluye MTP (multi-token prediction) dentro de `model.hgn`, una tabla n-gram obligatoria en fichero aparte y una torre de visión BF16 como sidecar opcional. La verificación de conversión reportó `provenance_attested: true` y copias exactas en BF16 para los tensores de visión.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" acortado respecto al modelo base.
- Procesamiento de imágenes mediante torre de visión opcional (activable con `HALOGEN_VISION_TOWER=1`).
- Decodificación con multi-token prediction (MTP) integrado en el trunk.
- Uso de tabla n-gram para decodificación asistida (requerida en el despliegue).
- Servicio mediante API compatible con OpenAI en el puerto 8731 del servidor Halogen.
- Soporte de parámetros de muestreo (temperature, top_p, top_k) heredados del modelo BF16 original.
- Capacidades de tool calling, agentes y multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en infraestructura Halogen existente: organizaciones que ya operan `halogen-flash-server` pueden montar este paquete como checkpoint y servir un modelo Qwen3.8-Flash-Next con razonamiento acortado sin pasar por una conversión propia.
- Razonamiento con presupuesto de tokens reducido: en pipelines donde el coste por token de pensamiento es determinante (por ejemplo, agentes que encadenan muchas llamadas), el 38,5 % menos de tokens de thinking reduce latencia y coste a cambio de ~1 punto de precisión.
- Procesamiento de documentos con imagen: con la torre de visión activada, el modelo puede recibir capturas, escaneos o diagramas junto a texto, útil en extracción de información de documentos técnicos.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de la política HGN v2 frente al checkpoint BF16 original en tareas de razonamiento.
- Servicio interno compatible con OpenAI: al exponer una API OpenAI-compatible en el puerto 8731, puede integrarse como backend en herramientas internas que ya hablan ese protocolo.
- Experimentación en hardware de memoria unificada: el tamaño (~111 GiB) encaja en equipos tipo Strix Halo, lo que permite probar un MoE grande en estaciones de trabajo sin GPUs de datacenter.
- Investigación sobre eficiencia de razonamiento: útil para estudiar la relación entre longitud de cadena de pensamiento y precisión en modelos MoE post-entrenados.

## Benchmarks y rendimiento

| Metrica | ThinkingCap Qwen3.8-Flash-Next | Qwen3.8-Flash-Next (base) |
|---|---|---|
| Tokens de pensamiento (reduccion media) | -38,5 % (rango 22–51 % por benchmark) | referencia |
| Precision media | 88,8 % | 89,8 % |

No se han publicado en la información disponible resultados desglosados por benchmark (MMLU, HumanEval, GSM8K u otros), ni métricas de latencia o throughput para el paquete HGN.

## Requisitos de hardware

- Espacio en disco: ~111 GiB para los tres ficheros `.hgn` (62,11 GiB trunk + MTP, 47,68 GiB tabla n-gram, 0,84 GiB torre de visión).
- Memoria: clase de despliegue de memoria unificada tipo Strix Halo; no se especifica VRAM mínima exacta.
- GPU recomendadas: no disponible. El runtime Halogen Flash Server se documenta con dispositivos `/dev/kfd` y `/dev/dri` (AMD ROCm) en el ejemplo de Podman.
- GPU de consumo: no confirmado; el tamaño del checkpoint descarta GPUs con menos de ~64 GiB de memoria utilizable salvo offload, que no se documenta.
- Despliegue: exclusivamente mediante `halogen-flash-server` (imagen `ghcr.io/peonist-ai/halogen-flash-server:0.19.1`). No compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Runtime | Licencia |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-Flash-Next-HGN (este) | no disponible (MoE) | no disponible | `.hgn` | halogen-flash-server | qwen-community-license-1.0 |
| bottlecapai/ThinkingCap-Qwen3.8-Flash-Next | no disponible (MoE) | no disponible | safetensors BF16 | Transformers y compatibles | qwen-community-license-1.0 |
| Qwen/Qwen3.8-Flash-Next | no disponible (MoE) | no disponible | safetensors BF16 | Transformers, vLLM, etc. | qwen-community-license-1.0 |
| johnlockejrr/Qwen3.8-Flash-Next-HGN | no disponible (MoE) | no disponible | `.hgn` | halogen-flash-server | qwen-community-license-1.0 |

La diferencia clave frente al checkpoint BF16 es el formato y el runtime: este paquete solo es utilizable en Halogen. Frente a la conversión HGN del modelo base (sin ThinkingCap), comparte tabla n-gram y torre de visión (hashes idénticos) y difiere únicamente en `model.hgn`.

## Limitaciones y advertencias

- Incompatibilidad total con el ecosistema estándar: los pesos no cargan en Transformers, vLLM ni llama.cpp; requieren el runtime Halogen.
- Dependencia de un fichero auxiliar: la tabla n-gram (`qwen38-flash-next-ngram.hgn`, 47,68 GiB) es obligatoria y debe mantenerse junto al checkpoint.
- Pérdida de precisión documentada: ~1 punto porcentual de media (88,8 % frente a 89,8 %) a cambio de la reducción de tokens de pensamiento.
- Licencia `qwen-community-license-1.0`: es necesario revisar sus términos (incluidos posibles umbrales de uso comercial y obligaciones de atribución) antes de cualquier despliegue en producción.
- Idiomas soportados no documentados en esta ficha; no se puede garantizar cobertura multilingüe sin consultar la model card del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el comportamiento general de modelos generativos.
- Sesgos: no documentados en la información proporcionada.
- La conversión es RTN y no una re-cuantización desde GGUF; la equivalencia con el checkpoint original del publicador no está garantizada más allá de la verificación declarada.
- Repositorio con 0 descargas y 1 like: sin validación comunitaria ni reportes de terceros sobre el comportamiento real del paquete.

## Enlaces

- Hugging Face (este paquete): https://huggingface.co/johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-HGN
- Modelo base BF16 (ThinkingCap): https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next
- Modelo base original (Qwen): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Conversión HGN del modelo base Qwen: https://huggingface.co/johnlockejrr/Qwen3.8-Flash-Next-HGN
- Blog de BottleCap AI: https://bottlecapai.com/post/thinkingcap-qwen3-8-flash-next/
- Web de BottleCap AI: https://www.bottlecapai.com/
- Servidor Halogen Flash: https://github.com/peonist-ai/halogen-flash-server
- Herramienta de conversión `bf16-to-hgn`: https://github.com/Quat3rnion/bf16-to-hgn
