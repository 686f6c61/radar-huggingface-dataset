# r4yharris/Qwen3.8-Flash-Next-FLARE

## Resumen

Qwen3.8-Flash-Next-FLARE es un paquete de inferencia preparado para el runtime Flare de NVIDIA, creado por el usuario r4yharris a partir del modelo base nvidia/Qwen3.8-Flash-Next. No se trata de un modelo nuevo con pesos reentrenados, sino de una exportación lista para ejecutar que incluye los pesos del modelo, kernels b12x ajustados y grafos CUDA capturados, orientado específicamente a portátiles RTX Spark N1X con el chip GB10 y memoria unificada de 96 GiB visibles como VRAM.

El paquete resuelve un problema concreto: la revisión oficial `gb10` publicada por Local Inference Lab está orientada a DGX Spark y, con un payload de 99,5 GiB más la caché KV, no cabe en los 96 GiB que expone este portátil. Esta build se ha preparado y validado de extremo a extremo en ese dispositivo, con contexto de 262.144 tokens, concurrencia de 32 peticiones y 4 imágenes simultáneas.

Es relevante porque permite ejecutar un modelo multimodal (image-text-to-text) de la familia Qwen3.8 en hardware de consumo de gama alta, aunque con una restricción importante: solo puede servirse mediante Flare, sin compatibilidad con Transformers, vLLM, SGLang ni llama.cpp. Además, requiere una versión concreta de Flare (ABI de ejecución 4), ya que la rama `main` actual exige ABI 5 y rechazaría el paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base nvidia/Qwen3.8-Flash-Next, familia Qwen3.8; multimodal image-text-to-text) |
| Parametros totales | 22.848.616 (dato de safetensors; ver advertencias, pues es inconsistente con los 106,9 GB del repositorio) |
| Parametros activos | no disponible (no consta si es MoE) |
| Longitud de contexto | 262.144 tokens (4.096 tokens por chunk de prefill) |
| Tipos de cuantizacion | nvfp4, mxfp8, 8-bit (según etiquetas del repositorio) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-open-model-agreement (other) |
| Formato de pesos | safetensors empaquetados como paquete Flare (no cargable con Transformers, vLLM, SGLang ni llama.cpp) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado por su autor: es una exportación del modelo nvidia/Qwen3.8-Flash-Next preparada para el runtime Flare. La exportación incluye 112 grafos CUDA capturados, kernels b12x ajustados y cinco draft tokens de decodificación especulativa MTP (multi-token prediction), lo que sugiere que el modelo base emplea speculation drafting para acelerar la generación. El paralelismo tensorial está fijado a 1 (TP1), adecuado para un único die GB10 con memoria unificada.

Sobre la arquitectura interna del modelo base, su proceso de entrenamiento, número de tokens del corpus o uso de RLHF/DPO, no hay información disponible en la model card. Las etiquetas nvfp4 y mxfp8 indican que los pesos están cuantizados en formatos de precisión numérica de NVIDIA orientados a aceleradores recientes.

## Capacidades

- Pipeline image-text-to-text: acepta entradas de imagen y texto y genera texto.
- Contexto largo de 262.144 tokens, con prefill en chunks de 4.096 tokens.
- Concurrencia preparada de 32 peticiones simultáneas y 4 imágenes concurrentes.
- Decodificación especulativa con 5 draft tokens MTP, limitada a las profundidades capturadas en los grafos.
- Generación de código y salida JSON estructurada validadas en las pruebas del autor.
- Servida mediante una API compatible con OpenAI (puerto 8000), lo que facilita su integración en herramientas existentes.
- Ejecución de turnos de agente validada con Hermes (≈14,2k tokens de entrada por turno en 2–8 s).

## Casos de uso

- Chatbot multimodal local en portátil: al ser image-text-to-text y ejecutarse íntegramente en el GB10 con 96 GiB de memoria unificada, permite desplegar asistencia conversacional con análisis de imágenes sin depender de la nube.
- Asistente de código offline: la prueba de generación de código completó 251 tokens en 7,1 s, suficiente para autocompletado y generación de fragmentos en un IDE local.
- Extracción de información de documentos largos: la ventana de 262.144 tokens permite procesar documentos extensos; la prueba de aguja en ~4k tokens respondió en 2,9 s.
- Salida estructurada para pipelines: la prueba de JSON (1,4 s de TTFT, 56 tokens) lo hace apto para integraciones que requieren respuestas parseables.
- Agentes de varios pasos: los turnos de agente con Hermes (~14,2k tokens de entrada) se completan en 2–8 s, lo que lo hace viable para flujos agénticos locales de latencia moderada.
- Prototipado de aplicaciones con API compatible con OpenAI: al exponer un endpoint estilo OpenAI, puede sustituir a servicios remotos en desarrollo y pruebas sin cambios de código.
- Inferencia privada de datos sensibles: todo el procesamiento ocurre en el dispositivo, adecuado para entornos donde los datos no pueden salir de la máquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publicó mediciones propias de latencia en su máquina, que no constituyen una afirmación de benchmark:

| Prompt | TTFT | Total | Completion tokens |
|---|---|---|---|
| Aritmética (17×23) | 1,9 s | 1,95 s | 54 |
| Suma de primos multi-turno | 5,1 s | 6,3 s | 104 |
| Generación de código | 5,9 s | 7,1 s | 251 |
| Salida JSON | 1,4 s | 1,6 s | 56 |
| Needle de ~4k tokens | 2,8 s | 2,9 s | 54 |

Ocho de ocho prompts de validación respondieron correctamente, y dos peticiones concurrentes se completaron sin errores.

## Requisitos de hardware

- Dispositivo objetivo: portátil RTX Spark N1X con die GB10 (ARM64 Windows) y 96 GiB de VRAM visible (memoria unificada). El paquete se validó únicamente en esta configuración.
- No hay evidencia de funcionamiento en multi-GPU ni entre nodos; solo TP1.
- En máquinas con memoria unificada se recomienda mantener la tabla de embeddings en disco: `--embedding-table-storage disk --embedding-table-cache-size 1GiB`.
- Despliegue exclusivamente mediante el runtime Flare de NVIDIA (`flare download` y `flare run`); incompatible con Transformers, vLLM, SGLang y llama.cpp.
- Versión de runtime: requiere un build de Flare en o antes del commit `0ce6de86` de `NVIDIA/flare-local-inference` (ABI 4, contrato 2). La rama `main` actual (ABI 5) rechazará el paquete con error de re-exportación.
- Latencias medidas en el dispositivo de origen: TTFT de 1,4–5,9 s según el prompt; turnos de agente de ~14,2k tokens de entrada en 2–8 s.
- Espacio en disco: 106,9 GB de repositorio.

## Comparativa con modelos similares

| Modelo | Formato | Contexto | Runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| r4yharris/Qwen3.8-Flash-Next-FLARE | Paquete Flare (nvfp4/mxfp8) | 262.144 tokens | Flare (ABI 4, solo GB10) | nvidia-open-model-agreement | Publicado, 0 descargas |
| nvidia/Qwen3.8-Flash-Next (modelo base) | no disponible | no disponible | no disponible | no disponible | Disponible en HuggingFace |
| Revisión `gb10` de Local Inference Lab | Paquete Flare, 99,5 GiB | no disponible | Flare (DGX Spark) | no disponible | Orientada a DGX Spark; no cabe en 96 GiB |

No se conocen alternativas comparables adicionales con datos suficientes para una comparación de rendimiento; no disponible.

## Limitaciones y advertencias

- El paquete solo carga en builds de Flare con ABI de ejecución 4 (commit `0ce6de86` o anterior); la rama `main` actual exige ABI 5 y lo rechazará. Está prevista una re-exportación ABI 5, conviene revisar las revisiones del repositorio antes de usarlo.
- Validado únicamente en una GPU con TP1; no hay evidencia de multi-GPU ni multi-nodo.
- La especulación está limitada a las profundidades de draft capturadas: las peticiones fuera de las capacidades preparadas se rechazan en lugar de ejecutarse de forma eager.
- La clave del publicador es nueva y este es el primer paquete que firma; el propio README requiere aceptar el publicador con flags `--dangerously-accept-publisher` y `--dangerously-approve-key`, lo que implica riesgo de confianza en un paquete de terceros con 0 descargas.
- Inconsistencia de datos: los safetensors declaran 22.848.616 parámetros, cifra muy pequeña frente a los 106,9 GB del repositorio; la model card no aclara esta discrepancia, por lo que el recuento de parámetros reales del modelo base no está disponible de forma fiable.
- No hay información sobre idiomas soportados, sesgos conocidos ni tasa de alucinación del modelo base.
- Licencia nvidia-open-model-agreement: las condiciones exactas de uso comercial deben revisarse en el texto de la licencia; no están resumidas en la model card.
- No cargable con las librerías de inferencia habituales, lo que limita su portabilidad a entornos sin Flare.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/r4yharris/Qwen3.8-Flash-Next-FLARE
- Modelo base: https://huggingface.co/nvidia/Qwen3.8-Flash-Next
- Runtime Flare referenciado: https://huggingface.co/NVIDIA/flare-local-inference
- No se han encontrado enlaces adicionales (papers, blogs o demos) en la información disponible.
