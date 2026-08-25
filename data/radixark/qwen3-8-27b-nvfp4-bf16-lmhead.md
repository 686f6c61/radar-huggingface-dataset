# RadixArk/Qwen3.8-27B-NVFP4-BF16-LMHead

## Resumen

RadixArk/Qwen3.8-27B-NVFP4-BF16-LMHead es una variante cuantizada del modelo multimodal Qwen/Qwen3.8-27B, desarrollada por RadixArk mediante NVIDIA Model Optimizer con una receta mixta NVFP4 W4A4. La única diferencia respecto al checkpoint cuantizado original (RadixArk/Qwen3.8-27B-NVFP4) es que la capa `lm_head` no se cuantiza y conserva los pesos BF16 del modelo base, lo que puede mejorar la calidad de la salida en tareas de generación. El modelo es un transformador denso multimodal que acepta texto, imagen y video, con una ventana de contexto nativa de 262 144 tokens.

Esta cuantización está pensada para despliegue en hardware NVIDIA Blackwell (validada en GB300) y se sirve principalmente mediante SGLang. Al ser un derivado cuantizado, RadixArk no ha realizado ningún entrenamiento adicional: las capacidades del modelo son heredadas del modelo base Qwen3.8-27B, mientras que la cuantización introduce una degradación mínima de rendimiento, medida en GSM8K y Terminal-Bench. El repositorio pesa 23,8 GB y está licenciado bajo Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformers denso multimodal (Qwen3.8-27B) |
| Parametros totales | 18 164 649 200 (pesos reales en safetensors); la model card declara 27B |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos |
| Tipos de cuantizacion | NVFP4 W4A4 (dinámico, group size 16) en MLP; FP8 en atención; BF16 en `lm_head`, MTP y tensores de visión |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3.8-27B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (23,8 GB) |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del checkpoint Qwen/Qwen3.8-27B, realizado por RadixArk con NVIDIA Model Optimizer (commit `87c9f8cf83021957d1a1a575c90c9a4eaaf7ef0c`). La arquitectura subyacente es un transformer denso multimodal que procesa texto, imagen y video, con una ventana de contexto de 262 144 tokens. La cuantización aplica NVFP4 W4A4 dinámica con group size 16 en las capas MLP (`gate_proj`, `up_proj`, `down_proj`), mientras que los pesos de atención se mantienen en FP8 y la capa `lm_head`, los tensores MTP (multi-token prediction) y los tensores de visión conservan BF16.

RadixArk no ha entrenado ni ajustado el modelo; toda la información de entrenamiento se hereda de la model card de Qwen/Qwen3.8-27B. La calibración de la cuantización se realizó con 1024 muestras del split de entrenamiento de `abisee/cnn_dailymail` con secuencias de longitud 512. La evaluación se llevó a cabo en GSM8K y Terminal-Bench 2.1, con protocolos de razonamiento activado y decodificación especulativa NEXTN.

## Capacidades

- Generación de texto y razonamiento multi-step con modo "thinking" activable mediante el parser `qwen3` en SGLang.
- Entrada multimodal: acepta texto, imagen y video (aunque la evaluación publicada es solo texto).
- Soporte de tool calling y function calling mediante el parser `qwen3_coder`.
- Soporte de agentes y razonamiento multi-step gracias a la ventana de contexto de 262 144 tokens.
- Capacidades multilingües heredadas del modelo base Qwen3.8-27B (idiomas concretos no disponibles en la documentación).
- Decodificación especulativa NEXTN con MTP para acelerar la generación en SGLang.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262 144 tokens de ventana, manteniendo el historial completo de la interacción y datos de la sesión.
- Generación de código en producción: con soporte de tool calling y el parser `qwen3_coder`, puede integrarse en pipelines de CI/CD para generar, revisar o parchear código con acceso a herramientas externas.
- Sistemas RAG sobre documentos extensos: la ventana de contexto permite inyectar documentos completos o múltiples fragmentos sin truncar, reduciendo la necesidad de chunking fino.
- Análisis de video e imágenes para generación de informes: al ser multimodal, puede recibir capturas de video o imágenes y generar descripciones técnicas o resúmenes en texto.
- Asistentes de razonamiento matemático y científico: los resultados en GSM8K (96,13%) indican que es adecuado para resolver problemas matemáticos con razonamiento explícito.
- Evaluación y automatización de terminales (Terminal-Bench): su rendimiento en Terminal-Bench 2.1 (69,4%) lo hace útil para tareas de automatización de línea de comandos, como gestión de sistemas o ejecución de scripts en entornos controlados.

## Benchmarks y rendimiento

La evaluación se realizó en una configuración de 4x NVIDIA GB300 con SGLang (TP4, NEXTN 3/1/4, seed 0). Los resultados son solo de texto.

| Benchmark | Protocolo | Puntuación |
|---|---|---|
| GSM8K | Split completo de 1319 ejemplos, modo thinking, muestreo por defecto, sgl-eval | 96,13% (1268/1319) |
| Terminal-Bench 2.1 | Claude Code 2.1.228, DFlash2 drafter, pass@1 | 69,4% (247/356, rep 4) |

GSM8K alcanzó una tasa de parada del 100% sin truncamientos ni errores. Como referencia, el checkpoint NVFP4 fuente con `lm_head` cuantizado obtuvo 96,36% (1271/1319) en el mismo protocolo, una diferencia dentro del ruido de muestreo a temperatura 1.0.

## Requisitos de hardware

- GPU recomendadas: NVIDIA Blackwell (GB300, GB10 DGX Spark, RTX PRO 6000). El checkpoint fue validado en GB300 y hay guías comunitarias para DGX Spark y RTX PRO 6000.
- VRAM estimada: el checkpoint pesa 23,8 GB en disco, por lo que se requiere al menos 24 GB de VRAM solo para los pesos. Con KV-cache y overhead de inferencia, se recomienda un mínimo de 48 GB.
- Configuración de ejemplo: 4x NVIDIA Blackwell con TP4, `--mem-fraction-static 0.75` y decodificación especulativa NEXTN (3 pasos, topk 1, 4 tokens de borrador).
- Opciones de despliegue: SGLang es el runtime soportado oficialmente; también hay guías para vLLM en DGX Spark (con MTP) según la comunidad.
- Latencia y throughput: no disponibles; el modelo está optimizado para decodificación especulativa NEXTN, que acelera la generación en GPUs Blackwell.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | 27B (declarado) | 262 144 | BF16 (original) | Apache 2.0 | Modelo original sin cuantizar |
| RadixArk/Qwen3.8-27B-NVFP4 | ~18,2B (pesos reales) | 262 144 | NVFP4 W4A4 (incl. `lm_head` cuantizado) | Apache 2.0 | Versión cuantizada con `lm_head` en FP4 |
| RadixArk/Qwen3.8-27B-NVFP4-BF16-LMHead | ~18,2B (pesos reales) | 262 144 | NVFP4 W4A4 + `lm_head` BF16 | Apache 2.0 | Este modelo: mantiene `lm_head` en BF16 para mayor precisión |

No se dispone de comparativa con otros modelos de la misma categoría fuera de la familia Qwen3.8.

## Limitaciones y advertencias

- El modelo base puede generar respuestas inexactas, incompletas, irrelevantes, sesgadas o indeseables; RadixArk no ha mitigado estos riesgos.
- La cuantización NVFP4 puede introducir degradación en tareas de alta sensibilidad numérica o en generación de código complejo, aunque la evaluación en Terminal-Bench indica buen comportamiento.
- El modelo fue validado únicamente en hardware NVIDIA Blackwell; no se garantiza su funcionamiento en arquitecturas anteriores (Ampere, Hopper, etc.).
- Los idiomas soportados no están documentados; se asume herencia del modelo base Qwen3.8-27B, que no se detalla en esta ficha.
- Aunque la licencia es Apache 2.0, se debe cumplir con los términos de la licencia del modelo base Qwen/Qwen3.8-27B.
- La evaluación publicada es solo de texto; el rendimiento con entrada multimodal (imagen/video) no ha sido medido en este checkpoint.
- El tamaño de pesos declarado en la model card (27B) no coincide con el tamaño real de los tensores en safetensors (18,2B); verificar la integridad del checkpoint antes de desplegar.

## Enlaces

- HuggingFace: https://huggingface.co/RadixArk/Qwen3.8-27B-NVFP4-BF16-LMHead
- Modelo fuente cuantizado: https://huggingface.co/RadixArk/Qwen3.8-27B-NVFP4
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Cookbook SGLang para Qwen3.8-27B: https://cookbook.sglang.ai/autoregressive/Qwen/Qwen3.8-27B
- Scripts comunitarios para DGX Spark: https://github.com/MiaAI-Lab/Qwen3.8-27B-SGLang-DGX-Spark
- Scripts para RTX PRO 6000: https://github.com/MiaAI-Lab/Qwen3.8-27B-RTX-6000-PRO-SGLang-DSpark
