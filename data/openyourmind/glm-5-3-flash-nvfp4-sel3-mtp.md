# OpenYourMind/GLM-5.3-Flash-NVFP4-sel3-MTP

## Resumen

GLM-5.3-Flash-NVFP4-sel3-MTP es una variante cuantizada en formato NVFP4 (punto flotante de 4 bits de NVIDIA) del modelo GLM-5.3-Flash, desarrollado por Z.ai. Este modelo, también conocido como "ox-alpha", es un sistema multimodal de 320 mil millones de parámetros (18 mil millones activos) que acepta entradas de imagen y texto y genera texto. La versión cuantizada presentada aquí, creada por el usuario OpenYourMind, reduce el tamaño de los pesos a 4 bits, lo que permite su ejecución en hardware más modesto sin perder las capacidades del modelo original.

El modelo base GLM-5.3-Flash destaca por superar a GLM-5.2 en benchmarks y tareas reales, y rivaliza con Claude Opus 4.8 en tareas de programación y agénticas, según documentación de Unsloth. Esta variante concreta añade dos modificaciones adicionales: abliteración (eliminación de los rechazos del modelo) y decodificación especulativa mediante predicción multi-token (MTP), lo que mejora la velocidad de inferencia. El acceso al repositorio está restringido (gated) y requiere aceptar condiciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), Mixture of Experts (MoE) |
| Parametros totales | 180.712.958.846 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base GLM-5.3-Flash soporta 1M de tokens) |
| Tipos de cuantizacion | NVFP4 (4 bits) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLM-5.3-Flash es un modelo MoE (Mixture of Experts) con 320 mil millones de parámetros totales y 18 mil millones activos por token, según la documentación de Unsloth. La arquitectura combina un codificador visual (para entrada de imágenes) con un decodificador de lenguaje, permitiendo tareas de imagen a texto y texto a texto. El modelo base fue entrenado por Z.ai con un contexto de 1 millón de tokens, lo que lo hace adecuado para documentos largos y conversaciones extendidas.

La variante NVFP4-sel3-MTP aplica tres modificaciones sobre el modelo base. Primero, cuantiza los pesos a NVFP4, un formato de 4 bits optimizado para GPUs NVIDIA, reduciendo el uso de memoria a aproximadamente 90 GB (205 GB de repo en safetensors). Segundo, aplica abliteración, un proceso que elimina los mecanismos de rechazo del modelo (como negarse a responder ciertas preguntas), lo que puede aumentar la utilidad pero también conlleva riesgos. Tercero, incorpora MTP (Multi-Token Prediction) para decodificación especulativa, que predice varios tokens a la vez y acelera la generación. No se dispone de detalles sobre el entrenamiento específico de esta variante, ya que es un ajuste posterior al modelo base.

## Capacidades

- Generación de texto en español e inglés (aunque los idiomas exactos no están especificados, el modelo base es multilingüe).
- Comprensión y razonamiento sobre imágenes (entrada de imagen y texto, salida de texto).
- Generación de código y soporte para tareas de programación, con rendimiento comparable a Claude Opus 4.8 según Unsloth.
- Razonamiento multi-paso y capacidades agénticas, adecuadas para flujos de trabajo autónomos.
- Decodificación especulativa (MTP) que acelera la inferencia al predecir múltiples tokens en cada paso.
- Abliteración: el modelo no muestra rechazos ante preguntas que normalmente serían filtradas, lo que amplía su rango de respuestas.
- Soporte para contextos largos (hasta 1M tokens en el modelo base, aunque no confirmado en esta variante).

## Casos de uso

- Asistencia a programación en producción: el modelo puede generar, revisar y refactorizar código en múltiples lenguajes. Su capacidad de razonamiento y su rendimiento en benchmarks de código lo hacen útil en entornos de desarrollo integrado (IDEs) o como backend de herramientas de autocompletado.
- Análisis de documentos técnicos con imágenes: gracias a su entrada multimodal, puede procesar diagramas, capturas de pantalla o esquemas junto con texto, extrayendo información relevante para resúmenes o informes.
- Agentes autónomos de automatización: su capacidad de razonamiento multi-paso y decodificación especulativa permite ejecutar tareas complejas como gestión de correos, planificación de proyectos o interacción con APIs, con baja latencia.
- Chatbots de atención al cliente con contexto largo: con una ventana de contexto de hasta 1M tokens (en el modelo base), puede mantener conversaciones prolongadas recordando detalles de interacciones anteriores, ideal para soporte técnico especializado.
- Generación de contenido multimodal: puede describir imágenes, generar pies de foto o crear narrativas a partir de entradas visuales, útil en marketing o accesibilidad.
- Investigación académica en NLP: al ser de código abierto (MIT) y con pesos disponibles, investigadores pueden ejecutarlo localmente para experimentos de generación de texto, análisis de sentimientos o estudio de comportamientos de modelos MoE cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta variante cuantizada (NVFP4-sel3-MTP). El modelo base GLM-5.3-Flash, según la documentación de Unsloth, supera a GLM-5.2 en benchmarks generales y rivaliza con Claude Opus 4.8 en tareas de código y agénticas, pero no se proporcionan cifras concretas en la información disponible. Se recomienda consultar la página del modelo base en HuggingFace para obtener métricas detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 180.7 mil millones de parámetros en NVFP4 (4 bits), el tamaño en memoria es aproximadamente 90 GB (180.7B × 4 bits = 90.35 GB), más overhead de activaciones y caché KV. Esto requiere una GPU con al menos 96 GB de VRAM o varias GPUs en paralelo.
- GPU recomendadas: NVIDIA H100 80GB (con tensor parallelism), A100 80GB (con cuantización adicional o particionado), o configuraciones multi-GPU como 2×RTX 4090 (48 GB cada una) con técnicas de offloading.
- No cabe en GPUs de consumo estándar (como RTX 4090 de 24 GB) sin cuantización adicional o uso de CPU offloading.
- Opciones de despliegue: vLLM (soporta NVFP4), llama.cpp (con conversión a GGUF), TGI (Text Generation Inference) o Unsloth (para ajuste fino y ejecución local).
- Latencia y throughput: no disponibles. La decodificación especulativa MTP puede mejorar el throughput respecto a la generación autoregresiva estándar, pero no se han publicado mediciones concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con modelos equivalentes. El modelo base GLM-5.3-Flash se compara con Claude Opus 4.8 y GLM-5.2, pero esta variante cuantizada no tiene datos de rendimiento publicados. Los modelos comparables en tamaño y enfoque multimodal serían Qwen2.5-VL (72B), Llama 3.2 90B o Mixtral 8x22B, pero no hay datos de comparación con esta versión NVFP4. Se recomienda consultar benchmarks independientes en plataformas como Artificial Analysis o LMArena.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated, por lo que requiere aceptar condiciones en HuggingFace antes de descargar los pesos.
- Riesgo de alucinación: como todo modelo generativo, puede producir información plausible pero incorrecta, especialmente en dominios especializados.
- Abliteración: la eliminación de los mecanismos de rechazo puede llevar a respuestas inapropiadas, sesgadas o dañinas, y elimina las salvaguardas de seguridad del modelo original.
- Cuantización NVFP4: puede degradar ligeramente la calidad de las respuestas en comparación con el modelo en precisión completa (FP16/BF16), aunque la pérdida suele ser mínima para tareas generales.
- Idiomas no especificados: aunque el modelo base es multilingüe, no se han documentado los idiomas exactos soportados en esta variante.
- Requisitos de hardware elevados: a pesar de la cuantización, necesita al menos 90 GB de VRAM, lo que limita su uso a entornos profesionales o de investigación.
- Sin benchmarks publicados: no hay métricas oficiales de rendimiento para esta variante, por lo que su calidad debe validarse de forma independiente antes de usarla en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OpenYourMind/GLM-5.3-Flash-NVFP4-sel3-MTP
- Documentación de Unsloth sobre GLM-5.3-Flash: https://unsloth.ai/docs/models/glm-5.3-flash
- Guía de Unsloth para GLM-5.3: https://unsloth.ai/docs/models/glm-5.3
- Repositorio GitHub con ejemplo de despliegue en DGX Spark: https://github.com/tonyd2wild/GLM-5.3-Flash-NVFP4-1M-KV-4x-DGX-Spark
- Otras variantes NVFP4 en HuggingFace: https://huggingface.co/local-inference-lab/GLM-5.3-Flash-NVFP4 y https://huggingface.co/LibertAIDAI/GLM-5.3-Flash-NVFP4
