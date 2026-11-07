# cortexist/gemma-4-E4B-it-assistant-q0f16-MLC

## Resumen

`cortexist/gemma-4-E4B-it-assistant-q0f16-MLC` es una conversión a formato MLC-LLM en FP16 (etiquetada como `q0f16`) del modelo `google/gemma-4-E4B-it-assistant`, una cabeza asistente (MTP head) de Google pensada para decodificación especulativa sobre el modelo objetivo Gemma 4 E4B. El paquete lo publica el usuario `cortexist` y no es un modelo entrenado desde cero, sino una conversión de un checkpoint existente con pesos ya entrenados, empaquetada para el runtime MLC-LLM.

La característica técnica más relevante es que esta cabeza no puede generar texto de forma independiente: requiere los embeddings del modelo objetivo, sus estados ocultos y la KV compartida. Incorpora una cabeza de vocabulario filtrada por centroides y una configuración por defecto con capacidad de 16.384 tokens, además de configuraciones en buckets para 1K, 2K, 4K, 8K y 16K. Está orientada a despliegue en dispositivos Jetson, concretamente AGX Xavier (Volta sm_72) con JetPack 5 y CUDA 11.4.

El interés práctico del paquete es acotado pero específico: permite ejecutar decodificación especulativa con MLC-LLM en hardware embebido NVIDIA mediante un fork propio del runtime, algo que el MLC-LLM upstream no soporta de forma nativa. La licencia declarada es Apache 2.0 y el repositorio ocupa 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con cabeza MTP (multi-token prediction) asistente, acoplada a un modelo objetivo; requiere embeddings, estados ocultos y KV compartida del objetivo |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 16.384 tokens de capacidad por defecto; buckets de 1K, 2K, 4K, 8K y 16K |
| Tipos de cuantizacion | q0f16 (FP16); el repositorio incluye únicamente esta conversión |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC-LLM (shards de parámetros convertidos, `tensor-cache.json`, `mlc-chat-config.json`); no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es una cabeza de predicción multi-token (MTP) entrenada por Google como asistente para Gemma 4 E4B. En lugar de generar de forma autónoma, consume los embeddings del modelo objetivo, sus estados ocultos y la KV compartida para proponer tokens candidatos que el modelo principal verifica. La cabeza de vocabulario está filtrada por centroides, un mecanismo que restringe el espacio de candidatos y reduce el coste de la propuesta especulativa. La configuración por defecto admite 16.384 tokens de capacidad, con variantes en buckets para distintas longitudes.

Esta publicación concreta no entrena nada nuevo: es una conversión FP16 del checkpoint `google/gemma-4-E4B-it-assistant` a formato MLC-LLM, con shards de parámetros, `tensor-cache.json` como layout activo de runtime y `tensor-cache-b16.json` conservado como metadato de la conversión original. El fork de MLC-LLM de `cortexist` añade soporte para el emparejamiento experimental cruzado con Nemotron a través de un controlador Python greedy de VM directa, que no es un modo MTP nativo de MLCEngine. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Decodificación especulativa: propone tokens candidatos para que el modelo objetivo Gemma 4 E4B los verifique, acelerando la generación.
- Predicción multi-token (MTP): genera varias propuestas por paso, no una sola.
- Vocabulario filtrado por centroides para reducir el espacio de búsqueda en la propuesta.
- KV compartida con el modelo objetivo, sin caché propia independiente.
- Emparejamiento experimental cruzado con Nemotron mediante el controlador Python del fork (no nativo en MLCEngine).
- No genera texto de forma autónoma: sin el modelo objetivo no produce salida.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo en la información disponible.

## Casos de uso

- Aceleración de inferencia en Jetson AGX Xavier: desplegar Gemma 4 E4B con esta cabeza MTP sobre el fork de MLC-LLM para reducir la latencia de decodificación en un dispositivo embebido con Volta sm_72, aprovechando las librerías precompiladas incluidas en `libs/`.
- Servicio de generación de texto en el borde: montar un endpoint de text-generation en un Jetson con JetPack 5 y CUDA 11.4, usando las configuraciones en buckets para ajustar la capacidad de contexto al presupuesto de memoria disponible.
- Evaluación de decodificación especulativa: comparar el rendimiento del par objetivo-asistente frente a la decodificación greedy estándar en MLC-LLM, con los buckets de 1K a 16K como variables de experimentación.
- Investigación sobre MTP en hardware limitado: estudiar el comportamiento de una cabeza con vocabulario filtrado por centroides en un entorno con recursos restringidos, usando el fork como base reproducible (commit `fd3a5891b8a78f7d50829d0919cbb27e40c26e28`).
- Pruebas de emparejamiento cruzado con Nemotron: emplear el controlador Python greedy de VM directa del fork para experimentar con el emparejamiento experimental entre cabezas, sabiendo que no es un modo nativo de MLCEngine.
- Pipeline de CI para artefactos MLC: validar la conversión y el empaquetado de cabezas asistentes usando `manifest.json` con tamaños y checksums SHA-256 como referencia de integridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación se aplica solo a las condiciones registradas y que la capacidad de contexto completa es un límite de configuración, no una garantía de calidad o estabilidad en contexto largo; remite al fork para las condiciones de benchmark y limitaciones conocidas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,2 GB en FP16, pero la inferencia requiere además el modelo objetivo Gemma 4 E4B y su caché KV.
- GPU objetivo: NVIDIA Jetson AGX Xavier (Volta, sm_72) con JetPack 5 y CUDA 11.4.
- Librerías precompiladas: `libs/` incluye binarios Linux aarch64 para esa plataforma; dependen del runtime TVM/MLC del fork y no son portables a otras GPU, sistemas operativos o ABIs.
- Otros dispositivos: requieren recompilación desde el fork.
- Despliegue: exclusivamente mediante el fork `cortexist/mlc-llm`; el MLC-LLM upstream no está cualificado para estos paquetes. Los pesos por sí solos no proporcionan un servidor HTTP.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Runtime | Disponibilidad |
|---|---|---|---|---|---|
| cortexist/gemma-4-E4B-it-assistant-q0f16-MLC | Cabeza MTP asistente convertida a MLC (FP16) | 16.384 tokens (buckets 1K-16K) | Apache 2.0 | Fork MLC-LLM, Jetson sm_72 | Hugging Face, 0 descargas |
| google/gemma-4-E4B-it-assistant | Cabeza MTP asistente original | no disponible | no disponible en la información recogida | Requiere runtime compatible con el checkpoint original | Hugging Face |
| cortexist/Nemotron-3.5-Bolt-E4B-q4f16_1-MLC | Modelo convertido a MLC (q4f16_1) | no disponible | no disponible | Fork MLC-LLM | Hugging Face |

La comparación con modelos de propósito general del mismo tamaño no resulta aplicable: esta publicación es una cabeza asistente dependiente de un objetivo, no un modelo autónomo. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- No genera de forma independiente: sin los embeddings, estados ocultos y KV compartida del modelo objetivo Gemma 4 E4B no produce salida.
- Dependencia estricta del fork: el MLC-LLM upstream no es un runtime cualificado; usar otro runtime o versión puede romper la compatibilidad.
- Portabilidad nula de las librerías: los binarios de `libs/` son específicos para Linux aarch64, Jetson AGX Xavier (sm_72), JetPack 5 y CUDA 11.4; cualquier otro dispositivo exige recompilación.
- Contexto: los 16.384 tokens son un límite de configuración, no una garantía de calidad ni de estabilidad en contexto largo, según la propia model card.
- Emparejamiento con Nemotron: es experimental y se ejecuta mediante un controlador Python greedy de VM directa; no es un modo MTP nativo de MLCEngine.
- Evaluación acotada: los resultados solo aplican a las condiciones registradas; no hay benchmarks publicados en la información disponible.
- Idiomas: no se documentan idiomas soportados.
- Licencia: Apache 2.0 declarada en el repositorio; deben conservarse los términos originales y la atribución incluidos en los ficheros de licencia y aviso.
- Adopción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Reproducibilidad: la revisión de la model card upstream citada (`8d0031ea8c2109e2b1e86bb9368a4539b537f80a`) identifica la tarjeta recuperada, no una descarga original verificada de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cortexist/gemma-4-E4B-it-assistant-q0f16-MLC
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it-assistant
- Árbol de ficheros del modelo base: https://huggingface.co/google/gemma-4-E4B-it-assistant/tree/main
- Fork de MLC-LLM: https://github.com/cortexist/mlc-llm
- README del fork: https://github.com/cortexist/mlc-llm#readme
- Guía de despliegue en Xavier: https://github.com/cortexist/mlc-llm/blob/main/deploy/xavier/README.md
- Modelo relacionado (Nemotron): https://huggingface.co/cortexist/Nemotron-3.5-Bolt-E4B-q4f16_1-MLC
