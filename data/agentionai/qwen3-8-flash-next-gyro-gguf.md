# agentionai/Qwen3.8-Flash-Next-Gyro-GGUF

## Resumen

Qwen3.8-Flash-Next Gyro es una familia de cuantizaciones GGUF del modelo Qwen3.8-Flash-Next (125.743.653.760 parámetros totales, arquitectura MoE) publicada por agentionai. El objetivo declarado es permitir ejecutar un modelo de 125B en una única GPU de consumo: la variante Gyro-S ocupa 27,64 GiB de VRAM y está pensada para tarjetas de 32 GB como la RTX 5090 o la R9700, mientras que Gyro-M (34,98 GiB) apunta a 48 GB y Gyro-L (50,21 GiB) a equipos con 64 GB de memoria unificada como Strix Halo.

La innovación principal es el uso de un esquema propio de cuantización denominado Agention Precision Rotor (APR), que almacena los expertos enrutados en una base rotada con códecs trellis (TQK6/TQK7, TQ2_T, TQP5-7); los nombres TQ1_0/TQ2_0/TQ3_0 son solo clases de tamaño para el Hub. Además, el modelo incorpora decodificación especulativa mediante un draft MTP separado y una tabla n-gram que permanece en disco, lo que reduce la huella de VRAM.

El modelo es relevante porque demuestra que un MoE de 125B puede desplegarse en hardware de consumo con pérdida de calidad medida (KLD 0,331 en Gyro-S v2 frente a 0,401 en v1) y velocidades de hasta 221 tok/s en salida JSON sobre una RTX 5090 con Strata. Sin embargo, requiere runtimes modificados: llama.cpp upstream todavía no carga estos ficheros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) sobre transformer; modelo base Qwen/Qwen3.8-Flash-Next |
| Parametros totales | 125.743.653.760 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 128k (declarado en la model card; ejemplo de arranque con -c 65536) |
| Tipos de cuantizacion | APR con trellis TQK6/TQK7, TQ2_T, TQP5-7; clases de tamano TQ1_0 (Gyro-S), TQ2_0 (Gyro-M), TQ3_0 (Gyro-L); variantes -noPLE sin tabla n-gram |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.8-Flash-Next, un transformer con mezcla de expertos (MoE) de 125.743.653.760 parámetros totales. La model card no detalla el número de parámetros activos por token, la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO; esos datos no están disponibles en la información proporcionada.

La aportación técnica del repositorio es la cuantización: los expertos enrutados se almacenan en una base rotada mediante el códec propietario APR, con tipos trellis en lugar de los tipos GGUF estándar. El paquete incluye tres artefactos adicionales: un draft MTP (`mtp-Qwen3.8-Flash-Next-draft.gguf`) para decodificación especulativa, un proyector de visión (`mmproj-F16.gguf`) que habilita la modalidad image-text-to-text, y una tabla n-gram que se mantiene en disco (`--ngram-on-disk`) para no consumir VRAM. La versión Gyro-S v2 (24-11-2026) reduce la divergencia respecto al original un 18% en texto held-out y un 27% en llamadas a herramientas, manteniendo paridad en coding agéntico.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla Jinja (`--jinja`).
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante el proyector `mmproj-F16.gguf`.
- Llamada a herramientas (tool calling / function calling), con una variante específicamente ajustada (Signal 2) que reduce un 27% los tokens de salida en tareas agénticas de coding.
- Razonamiento agéntico multi-paso y coding agéntico, con un modelo derivado (Gyro-Coder) que incorpora 256 expertos de código por capa.
- Decodificación especulativa mediante draft MTP para acelerar la inferencia.
- Contexto largo de hasta 128k tokens, con ejemplo de servidor a 65.536 tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de coding agéntico en local: desplegando Gyro-S o Signal 2 en una RTX 5090 con Strata, el modelo puede ejecutar tareas de edición multi-archivo con tool calling; Signal 2 reduce un 27% los tokens de salida, acortando cada ejecución.
- Automatización de atención al cliente con contexto largo: la ventana de hasta 128k tokens permite mantener historiales de conversación extensos y documentación de producto en el mismo contexto sin truncar.
- Análisis de documentos con imágenes: gracias al proyector de visión, se pueden procesar capturas, diagramas o formularios escaneados junto con texto en un mismo flujo image-text-to-text.
- Servidor de inferencia para equipos pequeños: Gyro-M (34,98 GiB) cabe en una GPU de 48 GB o en dos de 24 GB, ofreciendo un endpoint compatible con la API de OpenAI para integrarse en aplicaciones internas.
- Despliegue en estaciones de trabajo con memoria unificada: Gyro-L (50,21 GiB) sobre Strix Halo con 64 GB permite ejecutar el modelo completo en CPU/GPU integrada mediante strix-llama.cpp, sin GPU dedicada.
- Generación de JSON estructurado a alta velocidad: con 221 tok/s en salida JSON sobre RTX 5090, es adecuado para pipelines que necesitan respuestas estructuradas en tiempo casi real.
- Investigación sobre cuantización extrema: el repositorio sirve como referencia para estudiar el impacto de los códecs trellis APR frente a cuantizaciones GGUF convencionales, con métricas KLD publicadas.

## Benchmarks y rendimiento

| Metrica | Gyro-S v2 | Gyro-S v1 | Gyro-M | Referencia ISTA IQ3_XXS |
|---|---|---|---|---|
| KLD (divergencia del original) | 0,331 | 0,401 | 0,291 | 0,311 |
| VRAM de pesos | 27,64 GiB | 27,64 GiB | 34,98 GiB | 20% más que Gyro-M |
| Throughput JSON (RTX 5090, Strata) | 221 tok/s | no disponible | no disponible | no disponible |
| Throughput prosa (RTX 5090, Strata) | 140 tok/s | no disponible | no disponible | no disponible |
| Throughput código (RTX 5090, Strata) | 209 tok/s | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM de pesos: Gyro-S 27,64 GiB; Gyro-M 34,98 GiB; Gyro-L 50,21 GiB; Gyro-Coder 19,92 GiB.
- GPU recomendadas: RTX 5090 o R9700 (32 GB) para Gyro-S; 48 GB en una o dos tarjetas de 24 GB para Gyro-M; 64 GB de memoria unificada (Strix Halo) para Gyro-L.
- Cabe en GPU de consumo: sí, Gyro-S en RTX 5090/R9700 y Gyro-Coder en tarjetas de 16-24 GB con la caché de expertos de Strata.
- Runtimes compatibles: Strata 0.2.0 o superior (NVIDIA y AMD RX 7000/RX 9000/R9700), halo-box/strix-llama.cpp master (CPU, Vulkan, HIP), y agentionai/llama.cpp con contenedor (CPU, Vulkan, CUDA, incluye el draft MTP). llama.cpp upstream no puede cargar estos ficheros todavía.
- Throughput medido: 221 tok/s en JSON, 140 tok/s en prosa y 209 tok/s en código sobre RTX 5090 con Strata.
- La tabla n-gram reside en disco (`--ngram-on-disk`), por lo que no consume VRAM adicional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next Gyro (S/M/L) | 125,7B | hasta 128k | qwen-community-1.0 | GGUF (APR) | Requiere runtimes modificados |
| ISTA IQ3_XXS (referencia citada) | no disponible | no disponible | no disponible | GGUF | Gyro-M usa 20% menos VRAM con menor KLD (0,291 vs 0,311) |
| Signal 2 (mismo autor) | 125,7B | hasta 128k | qwen-community-1.0 | GGUF | Gyro-S ajustado en coding agéntico, mismo tamaño |
| Gyro-Coder (mismo autor) | 125,7B | hasta 128k | qwen-community-1.0 | GGUF | 256 expertos de código por capa, 19,92 GiB |

No se dispone de datos de benchmarks académicos ni de especificaciones completas de ISTA IQ3_XXS en la información proporcionada para una comparación más detallada.

## Limitaciones y advertencias

- Los ficheros no cargan en llama.cpp upstream; es obligatorio usar Strata, strix-llama.cpp o el fork agentionai/llama.cpp, lo que limita la portabilidad.
- Gyro-S v2 no ha sido probada todavía en Strata ni en strix-llama.cpp; el catálogo de Strata sigue descargando v1 hasta que se actualice.
- La cuantización introduce divergencia respecto al modelo original (KLD 0,331 en Gyro-S v2), lo que puede degradar tareas sensibles a la precisión.
- Existe una variante "abliterated" del mismo autor que elimina rechazos de seguridad; no debe confundirse con los pesos estándar ni usarse en producción sin revisión.
- La licencia qwen-community-1.0 ("other") impone condiciones específicas de uso comercial que deben revisarse antes de desplegar en producto.
- No hay información disponible sobre sesgos, idiomas soportados ni tasas de alucinación medidas.
- El tamaño del repositorio (794,9 GB) implica descargas largas; las variantes `-noPLE` reducen el tamaño eliminando la tabla n-gram.
- El modelo es experimental (tag `experimental`, `qwen4exp`), por lo que su estabilidad en producción no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Web del autor: https://www.agention.ai/
- Guía del modelo: https://agention.ai/models/qwen3.8-flash-next/
- Agente de coding Marshall: https://marshall.agention.ai
- Signal 2 (variante para coding agéntico): https://huggingface.co/agentionai/Signal-2-Flash-Next-Gyro-GGUF
- Gyro-Coder: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-Coder-GGUF
- Variante abliterated: https://huggingface.co/agentionai/Qwen3.8-Flash-Next-Gyro-abliterated-Huihui-GGUF
- Fieldwork Ledger: https://www.fieldworkledger.com
- Strata: https://github.com/Niko1221/Strata
- strix-llama.cpp: https://github.com/halo-box/strix-llama.cpp
- Fork agentionai/llama.cpp: https://gitlab.com/agentionai-group/llama.cpp
