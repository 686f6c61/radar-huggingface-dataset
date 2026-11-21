# cyankiwi/DaisyRose-27B-QAT-HAWQ

## Resumen

DaisyRose-27B-QAT-HAWQ es una cuantización de precisión mixta del modelo multimodal DaisyRose-27B, publicada por cyankiwi bajo su licencia comunitaria propia. DaisyRose-27B, desarrollado por RadixArk, es un modelo de razonamiento multimodal construido sobre Qwen3.8-27B y afinado exclusivamente mediante aprendizaje por refuerzo, sin supervisión ni destilación, sobre unas 1.200 tareas de agente de horizonte largo con sesiones de hasta 1M de tokens. El resultado es un modelo que mantiene la arquitectura, el tokenizador y la plantilla de chat del modelo base, por lo que puede sustituirlo directamente en pilas de inferencia y post-entrenamiento existentes.

Esta variante concreta aplica entrenamiento consciente de cuantización (QAT) con transformadas QuIP de Hadamard en bloque y pesos mixtos INT4/5/6/7 junto con caché KV en FP8, reduciendo el checkpoint a 21,26 GB frente a los aproximadamente 55 GB que ocuparían los pesos en BF16. El objetivo es claro: servir un modelo de 27.786 millones de parámetros con contexto de 256K tokens en dos GPUs de forma eficiente, con decodificación especulativa MTP activada.

La relevancia inmediata radica en que combina tres elementos poco habituales en el ecosistema abierto: un modelo de razonamiento multimodal entrenado solo con RL, una cuantización QAT agresiva con kernels personalizados y una licencia comunitaria que no es Apache-2.0, lo que obliga a revisar los términos antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de Qwen3.8-27B), con cabezal de imagen y decodificación especulativa MTP |
| Parametros totales | 27.786.408.720 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (256K), según la configuración de servicio recomendada |
| Tipos de cuantizacion | Pesos mixtos INT4/INT5/INT6/INT7 con transformadas QuIP (Hadamard en bloque); caché KV en FP8; checkpoint en compressed-tensors |
| Idiomas soportados | no disponible (la model card no detalla la lista de idiomas) |
| Licencia | cyankiwi-community-model-license-1.0 (el modelo base DaisyRose-27B se publica bajo Apache-2.0) |
| Formato de pesos | safetensors con compressed-tensors (transformers); existen también BF16, FP8, NVFP4 y GGUF del modelo base en el repositorio de RadixArk |

## Arquitectura y entrenamiento

DaisyRose-27B parte de Qwen3.8-27B y conserva su arquitectura, tokenizador y plantilla de chat, incluyendo la comprensión de imágenes y el contexto de 256K tokens. El entrenamiento del modelo base se realizó exclusivamente con aprendizaje por refuerzo, sin ajuste supervisado ni destilación, sobre aproximadamente 1.200 tareas de agente de horizonte largo cuyas sesiones alcanzaban hasta 1M de tokens. El proceso se prolongó durante 18 días en 144 GPUs H200. Según la model card, Terminal Bench 4.1 pass@1 sube de 5,6 a 12,0, y el modelo mejora en la mayoría de los benchmarks de código, razonamiento y seguimiento de instrucciones reportados.

La variante QAT-HAWQ añade una capa de optimización propia de cyankiwi: entrenamiento consciente de cuantización con transformadas QuIP de Hadamard en bloque y precisión mixta por capa (INT4/5/6/7), más caché KV en FP8. El calibrado se realizó con el dataset cyankiwi/calibration-medium. Para servir el modelo con tensor parallelism es necesario usar el fork cyankiwi/vllm en su rama `main`, que incorpora soporte de tensor-parallel para las transformadas Hadamard en bloque y carga las transformadas de entrada en los shards fusionados del checkpoint. La decodificación especulativa se apoya en MTP con un token especulativo.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento configurable mediante el parser `qwen3` en vLLM.
- Comprensión de imágenes (pipeline image-text-to-text), heredada del modelo base Qwen3.8-27B.
- Generación y edición de código, con mejoras reportadas en benchmarks de programación respecto al modelo base.
- Ejecución de tareas de agente de horizonte largo: el modelo fue entrenado específicamente con tareas de terminal y sesiones de hasta 1M de tokens.
- Tool calling y function calling: la configuración de servicio recomendada activa `--enable-auto-tool-choice` con el parser `qwen3_coder`.
- Decodificación especulativa MTP para acelerar la generación.
- Capacidades multilingües: no disponible en detalle; la model card no especifica la cobertura de idiomas.

## Casos de uso

- Automatización de tareas de terminal y DevOps: el modelo fue entrenado con tareas de agente de horizonte largo y muestra una mejora de 5,6 a 12,0 en Terminal Bench 4.1 pass@1, por lo que encaja en pipelines que requieren ejecutar comandos, interpretar salidas y corregir errores en varias iteraciones.
- Agentes de código en producción: con tool calling nativo y el parser `qwen3_coder`, puede integrarse en flujos de CI/CD para revisar diffs, proponer parches y ejecutar pruebas dentro de un bucle agéntico.
- Análisis de documentos largos con imágenes: la ventana de 256K tokens y la entrada multimodal permiten procesar informes extensos con gráficos, capturas o diagramas en una sola pasada.
- Asistentes de investigación técnica: el modo de razonamiento y el contexto largo facilitan la síntesis de múltiples fuentes y la trazabilidad de conclusiones en conversaciones multi-turno.
- Despliegue en infraestructura limitada: al ocupar 21,26 GB en esta cuantización, permite servir un modelo de 27B con contexto de 256K en dos GPUs mediante tensor parallelism, algo inviable con los pesos BF16 en el mismo hardware.
- Evaluación y post-entrenamiento sobre el modelo base: al conservar arquitectura, tokenizador y plantilla de chat de Qwen3.8-27B, sirve como sustituto directo en pilas existentes para experimentos de RL o ajuste fino.
- Generación de código asistida en IDE: la combinación de contexto largo y decodificación especulativa MTP reduce la latencia percibida en autocompletado y refactorización sobre repositorios grandes.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluaciones comparativas, pero en la información proporcionada solo aparece la cabecera y la fila inicial, sin los valores numéricos. El único dato concreto disponible es la mejora en Terminal Bench 4.1 pass@1, de 5,6 a 12,0.

| Benchmark | DaisyRose-27B | Qwen3.8-27B (base) | Referencia |
|---|---|---|---|
| Terminal Bench 4.1 pass@1 | 12,0 | 5,6 | dato reportado en la model card |
| Resto de benchmarks (código, razonamiento, instrucciones) | no disponible | no disponible | la tabla aparece truncada en la información disponible |

No se han publicado resultados de benchmarks específicos de la variante QAT-HAWQ en la información disponible; los datos anteriores corresponden al modelo base DaisyRose-27B.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 21,26 GB, por lo que se necesita al menos esa cantidad más el espacio de caché KV en FP8 para el contexto configurado. Con 256K tokens de contexto, la caché KV puede requerir decenas de GB adicionales según el lote y la configuración.
- Configuración recomendada por el autor: servicio con `--tensor-parallel-size 2`, es decir, dos GPUs. La model card menciona H200 en el entrenamiento, pero no especifica el modelo mínimo de GPU para inferencia.
- GPUs recomendadas: no disponible de forma explícita. Por tamaño, dos GPUs con 24 GB o más por unidad podrían alojar los pesos, pero el autor no confirma configuraciones concretas.
- ¿Cabe en GPU de consumo? No confirmado. Los pesos solos caben en una GPU de 24 GB, pero el contexto de 256K y la caché KV en FP8 hacen improbable un despliegue en una sola GPU de consumo sin reducir `--max-model-len`.
- Opciones de despliegue: vLLM mediante el fork cyankiwi/vllm (rama `main`), obligatorio para tensor parallelism con transformadas Hadamard en bloque. No se mencionan llama.cpp, Ollama ni TGI para esta variante cuantizada; el modelo base sí dispone de GGUF en el repositorio de RadixArk.
- Latencia y throughput: no disponible. La decodificación especulativa MTP con un token especulativo está pensada para mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DaisyRose-27B-QAT-HAWQ | 27,79B | 256K | cyankiwi-community-model-license-1.0 | safetensors (compressed-tensors, INT4/5/6/7) | Variante QAT con caché KV FP8; requiere fork de vLLM |
| DaisyRose-27B (BF16) | 27,79B | 256K | Apache-2.0 | safetensors BF16, FP8, NVFP4, GGUF | Modelo original de RadixArk; sin cuantización QAT |
| Qwen3.8-27B | 27B (aproximado) | 256K | no disponible en la información | safetensors | Modelo base sobre el que se construye DaisyRose; sin el entrenamiento RL de RadixArk |
| GPT-6 Luna | no disponible | no disponible | propietaria | API | Referencia cerrada incluida en la comparativa de la model card; sin datos numéricos disponibles |

## Limitaciones y advertencias

- Licencia: la variante QAT-HAWQ usa la cyankiwi-community-model-license-1.0, distinta de la Apache-2.0 del modelo base. Es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial o redistribución.
- Dependencia de un fork: el servicio con tensor parallelism exige el fork cyankiwi/vllm, lo que añade riesgo de mantenimiento y de compatibilidad con versiones upstream de vLLM.
- Contexto largo y VRAM: aunque los pesos ocupen 21,26 GB, el contexto de 256K con caché KV en FP8 puede consumir mucha memoria adicional; en producción conviene ajustar `--max-model-len` al caso de uso real.
- Riesgo de alucinación: no se documentan tasas específicas ni evaluaciones de fidelidad; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de agente con muchas iteraciones.
- Sesgos: no disponible. La model card no incluye sección de sesgos ni evaluaciones de seguridad.
- Idiomas: no se detalla la cobertura lingüística; no se debe asumir un rendimiento uniforme fuera del inglés sin validación previa.
- Entrenamiento solo con RL: al no haber ajuste supervisado, el comportamiento en dominios alejados de las tareas de agente puede ser menos predecible que en modelos con SFT.
- Madurez del artefacto: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card aparece truncada, lo que limita la evidencia independiente sobre su calidad.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/cyankiwi/DaisyRose-27B-QAT-HAWQ
- Licencia de la variante: https://huggingface.co/cyankiwi/DaisyRose-27B-QAT-HAWQ/blob/main/LICENSE
- Modelo base DaisyRose-27B (BF16): https://huggingface.co/RadixArk/DaisyRose-27B
- Variante FP8 del modelo base: https://huggingface.co/RadixArk/DaisyRose-27B-FP8
- Variante NVFP4 del modelo base: https://huggingface.co/RadixArk/DaisyRose-27B-NVFP4
- Variante GGUF del modelo base: https://huggingface.co/RadixArk/DaisyRose-27B-GGUF
- Modelo draft DSpark: https://huggingface.co/RadixArk/Qwen3.8-27B-DSpark
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de RadixArk sobre DaisyRose-27B: https://www.radixark.com/blog/daisyrose-27b
- Fork de vLLM de cyankiwi: https://github.com/cyankiwi/vllm/tree/main
- Commit base de vLLM: https://github.com/vllm-project/vllm/commit/0fda86a35419c9c70dbfada224c838c10fbb62ad
- Dataset de calibración: https://huggingface.co/datasets/cyankiwi/calibration-medium
- Web de cyankiwi: https://cyan.kiwi/
- Perfil de cyankiwi en Hugging Face: https://huggingface.co/cyankiwi
- Perfil de cyankiwi en ModelScope: https://www.modelscope.ai/organization/cyankiwi
- X de cyankiwi: https://x.com/cyankiwi_ai
- Reddit de cyankiwi: https://www.reddit.com/r/cyankiwi/
