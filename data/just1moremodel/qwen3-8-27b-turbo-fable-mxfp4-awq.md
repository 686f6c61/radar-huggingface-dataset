# just1moremodel/Qwen3.8-27B-TURBO-Fable-MXFP4-awq

## Resumen

Este modelo es una cuantización MXFP4 (W4A8) con AWQ del checkpoint DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU, un modelo denso multimodal de 27B con 64 capas construido sobre Qwen/Qwen3.8-27B. La cuantización ha sido realizada por just1moremodel con la herramienta Quark de AMD, reduciendo el peso BF16 de ~55 GB a 18.04 GiB (19.4 GB) en un único archivo safetensors.

El modelo conserva la arquitectura original Qwen3_5ForConditionalGeneration, incluye una torre de visión en BF16 (excluida de la cuantización), una cabeza de predicción multi-token (MTP) en FP8-E4M3 para decodificación especulativa, y el template de chat con control de esfuerzo de razonamiento (thinking). Su longitud de contexto máxima es de 32.768 tokens. Está pensado para servirse con vLLM en GPUs AMD RDNA4 (gfx1201) o cualquier entorno que soporte los kernels Quark MXFP4.

Al tratarse de un modelo "uncensored" con alineación reducida, es adecuado para investigación y prototipos, pero requiere consideraciones de uso responsable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer multimodal denso, 64 capas) |
| Parametros totales | 27B (declarados; safetensors: 15.606.149.872 elementos) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | MXFP4 (W4A8) con AWQ; vision tower y lm_head en BF16; MTP en FP8-E4M3 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, U8-packed para MXFP4 |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal denso de 64 capas, con una torre de visión que no se cuantiza y una cabeza MTP. El entrenamiento original del checkpoint de DavidAU se describe como una combinación multi-stage de "Cold Fusion" con ratios 735/882, entrenamiento GAIN y un tratamiento "hereje" uncensored sobre Qwen/Qwen3.8-27B; no se han proporcionado detalles del corpus de entrenamiento. Este repositorio no reentrena, solo cambia la precisión: aplica MXFP4 con AWQ mediante AMD Quark (cuantización por capas, 64 muestras de calibración y hasta 512 tokens de secuencia). La cabeza MTP se recuantiza a FP8-E4M3 para decodificación especulativa. El resultado es un checkpoint de 18.04 GiB frente a los ~55 GB del BF16 original, con una exigencia de kernels específicos de Quark en vLLM.

## Capacidades

- Razonamiento encadenado: el chat template incluye control de esfuerzo (`xhigh`, `medium`, `low`) y se puede desactivar el modo thinking con `enable_thinking: false`.
- Tool calling: soporta llamadas a herramientas en formato XML, integrable en pipelines de agentes.
- Multimodalidad: la entrada es `image-text-to-text`; la torre de visión permanece en BF16 y permite procesar imágenes.
- Decodificación especulativa: la cabeza MTP FP8 permite hasta 5 tokens especulativos en vLLM con `--speculative-config`.
- Generación de texto coherente en modo thinking y no thinking, verificada localmente por el autor en vLLM sobre AMD RDNA4.

## Casos de uso

- Despliegue multimodal en local: el checkpoint ocupa solo 18.04 GiB, lo que permite servirlo en un host con dos GPUs de 32 GB (TP2) o una sola GPU de 48 GB, manteniendo la ventana de 32.768 tokens.
- Agentes con llamada a herramientas: el template de chat ofrece tool calling XML, útil para construir asistentes que consultan APIs o ejecutan funciones internas.
- Análisis de documentos con imágenes: como modelo `image-text-to-text`, se puede usar para extraer información, resumir o responder preguntas sobre contenido visual.
- Investigación en alineación y seguridad: al no incorporar alineación de seguridad, es una referencia para estudiar jailbreaks, sesgos o comportamientos sin filtros en un entorno controlado.
- Reducción de latencia en producción: la cabeza MTP FP8 y la configuración especulativa en vLLM permiten acelerar la generación en infraestructuras compatibles con kernels Quark.
- Pruebas de compatibilidad de frameworks: sirve como caso real para validar el soporte de MXFP4/AWQ en stacks de serving, especialmente en GPUs AMD RDNA4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica que la cuantización MXFP4 W4A8 puede introducir una degradación menor frente a BF16, pero no se ha medido formalmente contra el checkpoint de origen.

## Requisitos de hardware

- Tamaño del checkpoint: 18.04 GiB (19.4 GB) en un único `model.safetensors`.
- VRAM para inferencia: funciona en 2×32 GB con `tensor-parallel-size 2`; una sola GPU de 32 GB es ajustada para contexto cómodo; se recomienda una sola GPU de 48 GB o más.
- GPU recomendadas: AMD RDNA4 (gfx1201) validado, y cualquier GPU con soporte de kernels Quark MXFP4 en vLLM.
- Despliegue: vLLM con `--tensor-parallel-size 2`, `--max-model-len 32768`, `--gpu-memory-utilization 0.90`, `--trust-remote-code` y `--speculative-config` para MTP.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Longitud de contexto | Licencia |
|---|---|---|---|---|
| just1moremodel/Qwen3.8-27B-TURBO-Fable-MXFP4-awq | 27B (nominales) | MXFP4 + AWQ (W4A8) | 32.768 | Apache 2.0 |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | 27B | BF16 | no disponible | Apache 2.0 |
| just1moremodel/Qwen3.8-27B-Uncensored-MXFP4-awq | 27B | MXFP4 + AWQ | no disponible | Apache 2.0 |
| Qwen/Qwen3.8-27B | 27B | BF16 (original) | no disponible | Apache 2.0 |

No hay datos de benchmarks disponibles para comparar el rendimiento. La tabla se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Modelo uncensored: no tiene alineación de seguridad, por lo que puede generar contenido dañino sin filtros; está pensado para investigación y uso responsable.
- Riesgo de alucinación: inherente a un modelo de lenguaje de este tipo, y no se han publicado evaluaciones específicas que lo mitiguen.
- Idioma: solo se declara soporte de inglés (en); no se ha probado en otros idiomas.
- Cuantización: la degradación de calidad frente a BF16 no está cuantificada; la calibración AWQ se hizo sobre texto general, no sobre tareas específicas.
- Compatibilidad de serving: el modelo requiere una build de vLLM con el camino Quark/MXFP4; en stacks sin los kernels adecuados fallará en la carga, no habrá una degradación silenciosa.
- Contexto limitado: la ventana de 32.768 tokens puede ser insuficiente para tareas con dependencias largas o documentos extensos.
- La torre de visión queda en BF16, lo que aumenta la memoria al procesar imágenes y no se ha evaluado formalmente su rendimiento visual.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/just1moremodel/Qwen3.8-27B-TURBO-Fable-MXFP4-awq
- Modelo base (DavidAU): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Otro cuantizado del mismo autor: https://huggingface.co/just1moremodel/Qwen3.8-27B-Uncensored-MXFP4-awq
- Herramienta Quark de AMD: https://github.com/amd/Quark
