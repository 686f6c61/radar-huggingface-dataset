# johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-ht43-HGN

## Resumen

ThinkingCap-Qwen3.8-Flash-Next-ht43-HGN es una conversión a formato nativo Halogen `.hgn` del fine-tune BF16 [bottlecapai/ThinkingCap-Qwen3.8-Flash-Next](https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next), publicado por el usuario `johnlockejrr`. El modelo subyacente es un post-entrenamiento de Qwen3.8-Flash-Next orientado a reducir el coste de razonamiento: según el autor original, genera aproximadamente un 38,5 % menos de tokens de pensamiento con una precisión del 88,8 % frente al 89,8 % del modelo base. La arquitectura es de mezcla de expertos (MoE), aunque el número de parámetros totales y activos no está disponible en la información proporcionada.

La relevancia de este paquete no reside en el modelo en sí, sino en el formato: se trata de pesos cuantizados con el perfil `ht43` de la herramienta `bf16-to-hgn`, pensados exclusivamente para el runtime halogen-flash-server. No cargan en Transformers, vLLM ni llama.cpp. El repositorio ocupa 109,7 GB e incluye el tronco principal con MTP embebido, una tabla n-gram obligatoria, una torre de visión opcional y el tokenizer.

Este paquete es uno de varios «packs» hermanos publicados por el mismo autor (v2 con expertos I4R, versión calibrada RCO y versión abliterated). La licencia declarada es `qwen-community-license-1.0`, lo que condiciona el uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con MTP embebido y torre de visión opcional |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Perfil Halogen HT43: expertos enrutados en HT4 (capas pares) y HT3 (capas impares), mixers de hiperconexión Q8G64, esquema `bf16-hgn-ht43-rtn-nf4-signed-rms-trellis-v1` |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (declarada como `other` en el campo license) |
| Formato de pesos | `.hgn` nativo de Halogen (no compatible con safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con atención estándar y capas MoE enrutadas, sobre el que BottleCap AI aplicó un post-entrenamiento orientado a eficiencia de tokens de razonamiento («shorter-thinking»). El resultado declarado es una reducción media del 38,5 % en tokens de pensamiento (rango de 22 % a 51 % según el benchmark) con una caída de precisión de aproximadamente un punto (88,8 % frente a 89,8 %). No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La conversión a Halogen se realizó con `bf16-to-hgn` 0.1.0 (build CUDA, `HGN_CUDA_ARCH=86`) partiendo de los 131 shards safetensors en BF16, con perfil `ht43`, semilla 0, 8 hilos y `--ht-beam 128`. El proceso verificó 1658 tensores de origen y 2349 de salida, con 109 716 035 228 bytes de payload y `provenance_attested: true`. La innovación técnica del perfil HT43 frente al v2 es el uso de expertos HT4 en capas pares y HT3 en impares (con escalas row-RMS firmadas por experto), junto con mixers de hiperconexión Q8G64 en lugar de Q6G64. El paquete incluye MTP embebido en `model.hgn` (sin fichero `mtp.hgn` separado) y una tabla n-gram de 47,68 GiB que es obligatoria.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento («thinking») optimizado para brevedad.
- Procesamiento de visión mediante torre opcional (`qwen38-flash-next-vision.hgn`, 0,84 GiB), activable con `HALOGEN_VISION_TOWER=1`.
- Decodificación especulativa mediante MTP embebido y tabla n-gram para acelerar la generación.
- API compatible con OpenAI en el servidor halogen-flash-server (puerto 8731), lo que facilita integración con clientes existentes.
- Soporte de tool calling y evaluación con `tool-eval-bench` (el autor recomienda `--parallel 1` para decodificación greedy).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el modo thinking y el tool calling lo permiten inferir.

## Casos de uso

- Razonamiento con presupuesto de tokens ajustado: el modelo reduce un 38,5 % los tokens de pensamiento, lo que abarata despliegues de agentes que encadenan muchas llamadas y donde el coste por token de salida domina.
- Evaluación de tool calling en pipelines de CI: el soporte de `tool-eval-bench` con `--parallel 1` permite medir de forma reproducible la fiabilidad de llamadas a funciones antes de promover un cambio a producción.
- Procesamiento de documentos con imagen: activando `HALOGEN_VISION_TOWER=1` se puede usar la torre de visión para tareas de extracción y descripción sobre capturas o páginas escaneadas, siempre que el runtime Halogen esté disponible.
- Servicio interno compatible con OpenAI: al exponer una API compatible en `:8731`, se puede sustituir un endpoint OpenAI por este servidor sin reescribir los clientes, útil para entornos con requisitos de residencia de datos.
- Aceleración de inferencia con decodificación especulativa: el MTP embebido y la tabla n-gram obligatoria permiten reducir la latencia en generación larga, adecuado para asistentes interactivos.
- Investigación sobre cuantización: el paquete sirve para comparar el perfil HT43 frente al v2 (I4R) en términos de calidad y velocidad, dado que el autor publica ambos packs con el mismo origen BF16.
- Despliegue en hardware AMD: el ejemplo de ejecución usa `--device /dev/kfd --device /dev/dri`, por lo que encaja en nodos con ROCm donde no se dispone de CUDA.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del modelo base ThinkingCap, no los de esta conversión:

| Métrica | ThinkingCap (upstream) | Base (Qwen3.8-Flash-Next) |
|---|---|---|
| Tokens de pensamiento | ~38,5 % menos (rango 22–51 % por benchmark) | Referencia |
| Precisión media | ~88,8 % | ~89,8 % |

No se han publicado resultados de benchmarks específicos para esta conversión HT43 en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 109,7 GB; payload total 109 716 035 228 bytes (~102 GiB). El fichero `model.hgn` ocupa 53,66 GiB, la tabla n-gram 47,68 GiB y la torre de visión 0,84 GiB.
- La tabla n-gram es obligatoria y debe mantenerse junto al checkpoint, por lo que el requisito de almacenamiento no se reduce descartando ficheros.
- VRAM estimada: no disponible en la información proporcionada. El tamaño del payload sugiere que no cabe en GPUs de consumo con 24 GB; se requiere hardware de centro de datos o múltiples aceleradores.
- GPU recomendadas: no disponibles explícitamente. El ejemplo de despliegue usa dispositivos AMD (`/dev/kfd`, `/dev/dri`) con ROCm, y la conversión se compiló con `HGN_CUDA_ARCH=86` (compatible con Ampere, como A100/A10).
- Cabe en GPU de consumo: no disponible; por el tamaño del payload es improbable en tarjetas de 24 GB o menos.
- Opciones de despliegue: exclusivamente halogen-flash-server (imagen `ghcr.io/peonist-ai/halogen-flash-server:0.19.1` o superior) con soporte del loader `qwen3.8-flash-next-ht43`. No es compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Latencia y throughput: no disponibles. El MTP embebido y la tabla n-gram están diseñados para acelerar la decodificación, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Formato | Perfil de cuantización | Tamaño | Licencia | Runtime |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-Flash-Next-ht43-HGN (este) | `.hgn` | HT43 (HT4/HT3, Q8G64) | ~102 GiB | qwen-community-license-1.0 | halogen-flash-server |
| ThinkingCap-Qwen3.8-Flash-Next-HGN (v2) | `.hgn` | I4R, Q6G64 | no disponible (mayor fichero principal) | qwen-community-license-1.0 | halogen-flash-server |
| ThinkingCap-Qwen3.8-Flash-Next-calibrated-rco-HGN | `.hgn` | RCO calibrado | no disponible | qwen-community-license-1.0 | halogen-flash-server |
| ThinkingCap-Qwen3.8-Flash-Next-abliterated-HGN | `.hgn` | v2, sin capa de rechazo | no disponible | qwen-community-license-1.0 | halogen-flash-server |
| bottlecapai/ThinkingCap-Qwen3.8-Flash-Next | safetensors BF16 | Sin cuantizar (131 shards) | no disponible | qwen-community-license-1.0 | Transformers, vLLM, etc. |

No se dispone de datos de rendimiento comparativo entre estos packs en la información proporcionada.

## Limitaciones y advertencias

- Los pesos están en formato `.hgn` y no cargan en Transformers, vLLM, llama.cpp ni herramientas equivalentes; requieren un runtime Halogen con el loader `qwen3.8-flash-next-ht43`. Usar el loader v2/I4R fallará.
- La tabla n-gram (`qwen38-flash-next-ngram.hgn`, 47,68 GiB) es obligatoria; no se puede omitir para ahorrar espacio.
- La cuantización HT43 no está calibrada (`quality: default`, no `--quality calibrated`), por lo que la degradación respecto al BF16 puede ser mayor que en el pack RCO calibrado.
- El modelo no está abliterated: mantiene los mecanismos de rechazo del fine-tune original.
- La licencia `qwen-community-license-1.0` impone condiciones al uso comercial que deben revisarse antes de desplegar en producción; el campo `license` figura como `other`.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables por herencia del modelo base.
- Idiomas soportados: no disponibles; no se puede garantizar cobertura multilingüe más allá de lo que herede Qwen3.8-Flash-Next.
- El autor advierte de que la decodificación greedy (`temperature: 0`) en `tool-eval-bench` debe ejecutarse con `--parallel 1` para obtener resultados fiables.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-14); se trata de un artefacto reciente y sin validación comunitaria.
- El ejemplo de despliegue usa Podman con dispositivos AMD; en Docker hay que sustituir `--group-add keep-groups` por `--group-add video --group-add render`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-ht43-HGN
- Modelo base (BF16): https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Pack hermano v2 (I4R): https://huggingface.co/johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-HGN
- Pack hermano calibrado RCO: https://huggingface.co/johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-calibrated-rco-HGN
- Pack hermano abliterated: https://huggingface.co/johnlockejrr/ThinkingCap-Qwen3.8-Flash-Next-abliterated-HGN
- Servidor Halogen: https://github.com/peonist-ai/halogen-flash-server
- Blog de BottleCap AI sobre ThinkingCap: https://bottlecapai.com/post/thinkingcap-qwen3-8-flash-next/
- Sitio de BottleCap AI: https://www.bottlecapai.com/
