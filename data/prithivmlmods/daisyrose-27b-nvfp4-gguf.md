# prithivMLmods/DaisyRose-27B-NVFP4-GGUF

## Resumen

DaisyRose-27B es un modelo multimodal de razonamiento con pesos abiertos desarrollado por RadixArk, construido sobre Qwen3.8-27B y entrenado exclusivamente mediante aprendizaje por refuerzo con el framework Miles, sin ajuste supervisado ni destilación. Cuenta con 27.320.698.658 parámetros totales y conserva la arquitectura híbrida de atención lineal y completa, el codificador de visión, el tokenizador y la ventana de contexto de 256K tokens del modelo base, lo que lo convierte en un reemplazo directo en infraestructuras existentes.

El repositorio que nos ocupa es la cuantización NVFP4 en formato GGUF publicada por prithivMLmods, orientada a aceleradores NVIDIA Blackwell (RTX PRO 6000, serie RTX 50, B200 y B300) con soporte nativo de Tensor Cores FP4. Incluye además un archivo de proyección multimodal (mmproj) de 931 MB para las capacidades de visión y un mecanismo de decodificación especulativa Multi-Token Prediction (MTP) integrado en los propios pesos, que elimina la necesidad de un modelo borrador separado.

Su relevancia actual radica en dos factores: por un lado, el entrenamiento con RL puro sobre tareas de agente de horizonte largo duplica la puntuación de Terminal Bench 4.1 pass@1 del modelo base (de 5,6% a 12,0%); por otro, la cuantización NVFP4 reduce el peso a 21 GB, permitiendo ejecutar un modelo de 27B con visión en una única GPU de consumo profesional con un consumo pico de VRAM de 19,69 GiB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de atención lineal y completa (herencia de Qwen3.8-27B), con codificador de visión y cabezas MTP |
| Parametros totales | 27.320.698.658 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256K tokens (modelo base); prueba publicada con 16.384 tokens |
| Tipos de cuantizacion | NVFP4 (GGUF); el modelo base se distribuye en BF16, FP8 y NVFP4 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (DaisyRose-27B-NVFP4.gguf, 21 GB; DaisyRose-27B.mmproj.gguf, 931 MB) |

## Arquitectura y entrenamiento

DaisyRose-27B parte de Qwen3.8-27B y preserva su arquitectura híbrida de atención lineal y completa, junto con el codificador de visión, el tokenizador y la ventana de contexto de 256K tokens. El entrenamiento se realizó mediante aprendizaje por refuerzo puro con el framework open source Miles, sin supervisión ni destilación, durante 18 días sobre 144 GPUs H200 y aproximadamente 1.200 tareas de agente de horizonte largo seleccionadas, con sesiones en sandbox de hasta 1M de tokens y más de 100 llamadas a herramientas por sesión.

La innovación técnica más destacable en esta distribución es la decodificación especulativa MTP: los archivos GGUF incorporan cabezas de predicción de múltiples tokens dentro de la arquitectura principal, de modo que un único pase forward predice varios tokens futuros y acelera la inferencia local sin necesidad de un modelo borrador independiente. La cuantización NVFP4 se generó con llama.cpp y está optimizada para los Tensor Cores FP4 de Blackwell (SM120, GB202).

## Capacidades

- Generación de texto y razonamiento multimodal (pipeline image-text-to-text).
- Razonamiento de múltiples pasos y uso de herramientas en entornos de agente, con sesiones de hasta 1M de tokens y más de 100 llamadas a herramientas.
- Resolución de tareas de terminal y de ingeniería de software (Terminal Bench, SWE Bench Pro v2, DeepSWE).
- Seguimiento de instrucciones (IFBench) y razonamiento científico (GPQA Diamond).
- Procesamiento de imágenes mediante el archivo mmproj.
- Decodificación especulativa MTP integrada en los pesos.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Automatización de tareas de terminal y DevOps: el modelo puede ejecutar secuencias multi-paso de comandos en sandbox con hasta 100 llamadas a herramientas por sesión, lo que encaja en pipelines de aprovisionamiento o diagnóstico.
- Agentes de ingeniería de software: con contexto de 256K tokens puede ingerir repositorios completos y resolver parches verificables, evaluado en SWE Bench Pro v2 y DeepSWE.
- Asistente de razonamiento científico: útil para resolver problemas de nivel GPQA Diamond con cadenas de razonamiento largas en un único contexto.
- Análisis de documentos e imágenes combinados: gracias al codificador de visión y al archivo mmproj, puede procesar capturas, diagramas o documentos escaneados junto con texto.
- Despliegue local en estación de trabajo Blackwell: con 21 GB de pesos y 19,69 GiB de VRAM pico cabe en una RTX PRO 6000 o en GPUs de consumo de la serie RTX 50 con suficiente memoria, usando llama.cpp.
- Servicio de inferencia de baja latencia: la decodificación MTP alcanza 114,34 tokens/s de generación y 144,66 tokens/s de procesamiento de prompt en la configuración probada, adecuado para asistentes interactivos.
- Evaluación de seguimiento de instrucciones complejas: IFBench lo sitúa como candidato para tareas de formato estricto y restricciones múltiples.

## Benchmarks y rendimiento

| Benchmark | DaisyRose-27B | Qwen3.8-27B (base) |
|---|---|---|
| Terminal Bench 4.1 pass@1 | 12,0% | 5,6% |
| SWE Bench Pro v2 | Mejora respecto al base (sin cifra publicada) | — |
| DeepSWE | Mejora respecto al base (sin cifra publicada) | — |
| IFBench | Mejora respecto al base (sin cifra publicada) | — |
| GPQA Diamond | Mejora respecto al base (sin cifra publicada) | — |

Rendimiento de inferencia publicado (RTX PRO 6000 Blackwell, 96 GB, llama-cli, -ngl 99, contexto 16.384, KV cache q8_0, MTP con draft_n_max=2):

| Métrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 144,66 tokens/s |
| Velocidad media de generación | 114,34 tokens/s |
| Tiempo total de ejecución | 56,4 s |
| VRAM pico | 19,69 GiB |
| Utilización pico de GPU | 96% |

No se han publicado cifras numéricas de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada: 19,69 GiB pico medidos con contexto de 16.384 tokens y KV cache q8_0; el archivo de pesos ocupa 21 GB y el mmproj 931 MB.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB), B200, B300 y GPUs con soporte nativo FP4 (SM120, GB202).
- Cabe en GPU de consumo de la serie RTX 50 con al menos 24 GB de VRAM; en tarjetas sin Tensor Cores FP4 la cuantización NVFP4 no aprovecha la aceleración nativa.
- Opciones de despliegue: llama.cpp (llama-cli con `--spec-type draft-mtp`), con compatibilidad declarada con text-generation-inference y endpoints compatibles; SGLang con decodificación especulativa DSpark para el modelo base.
- Throughput medido: 114,34 tokens/s de generación y 144,66 tokens/s de prompt en la configuración de referencia; la latencia real depende del prompt y de los parámetros de muestreo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-NVFP4-GGUF | 27,3B | 256K | Apache 2.0 | GGUF NVFP4 | Multimodal, RL puro, MTP |
| Qwen3.8-27B (base) | 27B | 256K | Apache 2.0 (según base) | BF16, FP8, NVFP4 | Sin entrenamiento RL adicional; Terminal Bench 4.1 5,6% |
| RadixArk/DaisyRose-27B | 27,8B | 256K | Apache 2.0 | BF16, FP8, NVFP4 | Modelo original sin cuantizar a GGUF |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano no está verificado.
- Riesgo de alucinación inherente a los modelos de razonamiento entrenados con RL; las salidas deben verificarse en producción.
- La cuantización NVFP4 está optimizada para Blackwell; en hardware sin Tensor Cores FP4 puede degradarse el rendimiento o no aprovecharse la aceleración.
- Las cifras de rendimiento publicadas corresponden a una única configuración de hardware y software; no son extrapolables a otros entornos.
- El modelo se entrenó con RL puro sin ajuste supervisado, lo que puede producir estilos de respuesta menos alineados con formatos conversacionales convencionales.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3.8-27B y de los datos de entrenamiento.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta; se trata de una publicación reciente sin validación comunitaria extensa.

## Enlaces

- Hugging Face: https://huggingface.co/prithivMLmods/DaisyRose-27B-NVFP4-GGUF
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Archivo NVFP4: https://huggingface.co/prithivMLmods/DaisyRose-27B-NVFP4-GGUF/blob/main/DaisyRose-27B-NVFP4.gguf
- Archivo mmproj: https://huggingface.co/prithivMLmods/DaisyRose-27B-NVFP4-GGUF/blob/main/DaisyRose-27B.mmproj.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil del autor: https://huggingface.co/prithivMLmods
