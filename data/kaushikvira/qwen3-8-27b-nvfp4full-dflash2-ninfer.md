# kaushikvira/Qwen3.8-27B-nvfp4full-dflash2-NInfer

## Resumen

El repositorio `kaushikvira/Qwen3.8-27B-nvfp4full-dflash2-NInfer` contiene el perfil de pesos **nvfp4full** del modelo **Qwen3.8-27B**, un modelo denso multimodal (vision-language) de 27 000 millones de parámetros, empaquetado en el formato nativo `.ninfer` del motor **NInfer**. El autor, `kaushikvira`, ha partido del artefacto de `cometkim/Qwen3.8-27B-nvfp4full-NInfer` (v1, sin módulo adicional) y ha añadido el módulo de decodificación especulativa **DFlash2** de `z-lab/Qwen3.8-27B-DFlash2`, en una codificación W8G32_F16S/BF16 para las matrices del drafter. El resultado es un artefacto de 19.14 GiB, con 1 325 objetos almacenados, que conserva además el módulo MTP original (retenido pero solo validado bajo `--spec dflash2`).

Este modelo está pensado para ejecutarse exclusivamente en una **NVIDIA GeForce RTX 5090** (sm_120a) con CUDA 13.1 o superior, aprovechando la cuantización NVFP4 de los pesos principales y la decodificación especulativa para reducir la latencia en generación de texto y en tareas multimodales (imágenes, vídeo y mensajes mixtos). Su relevancia radica en ofrecer una vía de despliegue local de un modelo de 27B con contexto largo, sin necesidad de clústeres, mediante el motor NInfer y su servidor compatible con OpenAI/Anthropic. No obstante, al tratarse de un artefacto experimental (0 descargas y 0 likes en HuggingFace) y con requisitos de hardware muy específicos, debe evaluarse con cautela antes de su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-language) basado en Qwen/Qwen3.8-27B; no se especifican más detalles en la información disponible |
| Parametros totales | 27B (según nomenclatura del modelo base; no se proporciona desglose exacto) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada oficialmente; el README muestra ejemplos con `--max-context 32768` y `262144` |
| Tipos de cuantizacion | Pesos principales en NVFP4 (nvfp4full); módulo DFlash2 en W8G32_F16S/BF16; KV cache soportada en BF16, INT8, FP8, NVFP4 y K8V4 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | NInfer (.ninfer) |

## Arquitectura y entrenamiento

El modelo base **Qwen3.8-27B** es, según la descripción del repositorio oficial, un modelo denso nativo de visión y lenguaje que comprende imágenes y vídeos, con control flexible de pensamiento (thinking) y diseñado para completar tareas complejas de varios pasos con mayor fiabilidad. El presente repositorio no entrena el modelo desde cero: toma el perfil de pesos **nvfp4full** del modelo base, cuantizado desde `unsloth/Qwen3.8-27B-NVFP4`, y lo empaqueta en el formato `.ninfer`. A continuación, mediante una herramienta de injerto (`tools/artifact/graft_dflash2_w8.py`), se añaden los 66 objetos del módulo DFlash2 (21 matrices W8G32_F16S y 45 normas, bases de convolución y codebooks en BF16) procedentes de `z-lab/Qwen3.8-27B-DFlash2`.

La innovación técnica destacable es la combinación de cuantización NVFP4 en los pesos principales con el módulo de decodificación especulativa DFlash2, que permite ventanas de borrador de 1 a 15 tokens (se recomienda 7). Además, el motor NInfer soporta KV cache en K8V4, ejecución con CUDA Graph y reutilización de prefijos compatibles. No se detalla en la información disponible si el modelo base fue sometido a RLHF o DPO, ni la composición exacta de los datos de entrenamiento.

## Capacidades

- Generación de texto en modos de pensamiento (thinking) y sin pensamiento (non-thinking).
- Procesamiento multimodal: imágenes, multi-imagen, vídeo y mensajes mixtos mediante el flag `--vision`.
- Decodificación especulativa DFlash2, con ventanas de borrador de 1 a 15 tokens (recomendado 7), para reducir la latencia de generación.
- Decodificación especulativa MTP, con ventanas de 1 a 5 tokens, como alternativa compatible (`--spec mtp`).
- Soporte de KV cache en BF16, INT8, FP8, NVFP4 y K8V4 mediante `--kv-dtype`.
- Ejecución con CUDA Graph y reutilización de prefijos compatibles.
- Servicio concurrente de pequeña escala (1 a 8 peticiones activas) a través del servidor HTTP.
- Interfaz de línea de comandos (CLI) y servidor compatible con OpenAI/Anthropic.
- Tool calling: no especificado en la información disponible.

## Casos de uso

- Asistente conversacional multimodal en local: el modelo procesa imágenes y vídeos junto con texto, lo que permite construir asistentes que analicen capturas de pantalla o vídeos de soporte técnico. La decodificación especulativa DFlash2 reduce la latencia en interacciones de tiempo real.
- Servidor de inferencia para equipos de desarrollo: gracias al modo servidor compatible con OpenAI/Anthropic, se puede integrar en aplicaciones existentes como sustituto de una API externa, con hasta 262 144 tokens de contexto configurados y sin salir del entorno local.
- Razonamiento de varios pasos en modo thinking: el modelo está diseñado para llevar a cabo tareas complejas con mayor fiabilidad, lo que resulta útil en análisis de documentos, planificación y resolución de problemas con datos sensibles.
- Análisis de vídeo en local para investigación: con `--vision`, el modelo puede procesar secuencias de vídeo y responder preguntas sobre el contenido, evitando la subida de datos a servicios externos.
- Evaluación de decodificación especulativa y cuantización en GPUs Blackwell: para investigadores interesados en optimizar el rendimiento de la inferencia con DFlash2 y NVFP4 en una RTX 5090.
- Generación de texto de baja latencia en aplicaciones de producción con restricciones de hardware: al ejecutarse en una única RTX 5090 de 32 GB, el modelo permite desplegar un servicio de IA generativa con contexto largo sin necesidad de un clúster.
- Procesamiento de documentos con imágenes y texto mixto: puede leer documentos escaneados y responder preguntas combinando información visual y textual, lo que es adecuado para archivística y gestión documental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README menciona mediciones de rendimiento propias realizadas el 2026-09-06 en una NVIDIA GeForce RTX 5090 (32 GB, límite de 450 W), con CUDA 13.1, DFlash2 K=7, `--kv-dtype k8v4`, `--max-context 262144`, `--max-concurrency 4` y visión activada, utilizando las pruebas `bench/tests/perf.py`, `bench/tests/conc_perf.py` y `bench/tests/needle.py`. Sin embargo, los valores numéricos de esas métricas no se incluyen en la información proporcionada, por lo que no es posible presentar una tabla comparativa fiable.

## Requisitos de hardware

- Pesos del artefacto: 19.14 GiB (20 550 864 896 bytes).
- VRAM estimada: el README indica que se ejecuta en una NVIDIA GeForce RTX 5090 de 32 GB con KV cache K8V4 y contexto 262 144; no se proporciona una cifra de VRAM mínima.
- GPU recomendada: NVIDIA GeForce RTX 5090 (sm_120a). Es un requisito explícito; no se menciona soporte para otras GPUs.
- Sistema operativo: Linux de 64 bits.
- CUDA Toolkit 13.1 o superior.
- Opciones de despliegue: NInfer CLI y `ninfer-serve` (servidor HTTP compatible con OpenAI/Anthropic). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el README menciona mediciones propias con las probes indicadas, pero no incluye los resultados en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Formato | DFlash2 | Licencia |
|---|---|---|---|---|---|---|
| kaushikvira/Qwen3.8-27B-nvfp4full-dflash2-NInfer | Qwen3.8-27B | 27B | No disponible | .ninfer NVFP4 | Sí (W8G32_F16S/BF16) | Apache 2.0 |
| gpillon/Qwen3.8-27B-nvfp4full-dflash2-NInfer | Qwen3.8-27B | 27B | No disponible | .ninfer NVFP4 | Sí (NVFP4 weight-only) | Apache 2.0 |
| cometkim/Qwen3.8-27B-nvfp4full-NInfer | Qwen3.8-27B | 27B | No disponible | .ninfer NVFP4 | No | Apache 2.0 |

Los tres artefactos comparten el mismo modelo base y la cuantización NVFP4. La diferencia principal es el módulo DFlash2: este repositorio lo añade en codificación W8G32_F16S/BF16, mientras que gpillon lo hace en NVFP4 weight-only. Según la model card, los dos artefactos con DFlash2 no son intercambiables. cometkim es la versión sin módulo, que sirve de base para este repositorio. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Requiere hardware específico y reciente: NVIDIA RTX 5090 (sm_120a), CUDA 13.1 y Linux de 64 bits. No es portable a otras GPUs ni a entornos de nube genéricos.
- El formato de pesos es nativo de NInfer (.ninfer) y no es compatible con vLLM, llama.cpp, Ollama ni TGI. Se necesita el motor NInfer, concretamente el fork de `kaushikvira` que registra el perfil `nvfp4full`.
- El artefacto DFlash2 con codificación W8G32_F16S/BF16 no es intercambiable con el de `gpillon` (NVFP4 weight-only). Utilizar el motor equivocado provocará errores de carga o resultados incorrectos.
- No se han publicado resultados de benchmarks externos. El rendimiento mostrado en el README se mide en un rig concreto y no puede generalizarse a otros entornos.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere una fase temprana o experimental. Debe validarse exhaustivamente antes de su uso en producción.
- Los idiomas soportados no están especificados, lo que limita la evaluación de su cobertura multilingüe y de posibles sesgos lingüísticos.
- La licencia Apache 2.0 se aplica a este repositorio, pero los componentes subyacentes (modelo base Qwen3.8-27B, cuantización de unsloth, módulo DFlash2 de z-lab) pueden tener términos adicionales que deben revisarse antes de un uso comercial.
- Riesgo de alucinación: no se proporciona información específica. Como todo modelo generativo, requiere validación de salidas, especialmente en contextos de razonamiento complejo o con datos visuales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kaushikvira/Qwen3.8-27B-nvfp4full-dflash2-NInfer
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización base: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Motor NInfer: https://github.com/Neroued/ninfer
- Fork del motor NInfer: https://github.com/kaushikvira/ninfer
- Artefacto similar con DFlash2 en NVFP4: https://huggingface.co/gpillon/Qwen3.8-27B-nvfp4full-dflash2-NInfer
- Artefacto base sin DFlash2: https://huggingface.co/cometkim/Qwen3.8-27B-nvfp4full-NInfer
- Módulo DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
