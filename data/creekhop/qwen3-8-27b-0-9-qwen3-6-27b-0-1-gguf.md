# creekhop/Qwen3.8-27B-0.9-Qwen3.6-27B-0.1-GGUF

## Resumen

El modelo `creekhop/Qwen3.8-27B-0.9-Qwen3.6-27B-0.1-GGUF` es una cuantización en formato GGUF del checkpoint `vvsotnikov/Qwen3.8-27B-0.9-Qwen3.6-27B-0.1`, que a su vez es una interpolación lineal entre los modelos oficiales de Alibaba `Qwen/Qwen3.8-27B` y `Qwen/Qwen3.6-27B`, con coeficientes 0.9 y 0.1 respectivamente. El merge se realizó tensor a tensor en float32 y se convirtió a bfloat16, conservando la configuración, tokenizer, processor y chat template de Qwen3.8-27B. El resultado es un modelo denso de aproximadamente 27.300 millones de parámetros, con capacidades multimodales nativas (texto e imagen) y licencia Apache-2.0.

La relevancia de esta ficha radica en que ofrece una versión cuantizada lista para ejecutarse con `llama.cpp` y herramientas compatibles, lo que permite desplegar un modelo de 27B en hardware de consumo con requisitos de VRAM reducidos. Al ser una interpolación de dos versiones recientes de Qwen, combina las mejoras de Qwen3.8-27B en coding y agentes con la estabilidad de Qwen3.6-27B, aunque no se han publicado evaluaciones específicas de este merge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) |
| Parametros totales | 27.320.697.856 (aprox. 27,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3.8-27B soporta 256K, pero no se confirma para el merge) |
| Tipos de cuantizacion | GGUF (varias cuantizaciones, no especificadas en la informacion disponible) |
| Idiomas soportados | No disponibles (se espera multilingue por ser Qwen, sin confirmacion) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors, este repo es GGUF) |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado desde cero, sino que es el resultado de una interpolación lineal entre dos checkpoints completos de Qwen: `Qwen/Qwen3.8-27B` (revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) y `Qwen/Qwen3.6-27B` (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`). La operación se realizó elemento a elemento en float32 y se convirtió a bfloat16 tras cada tensor. Se fusionaron 1.199 tensores, incluyendo el drafter `mtp.*` y la torre de visión. La configuración, tokenizer, processor y chat template se tomaron de Qwen3.8-27B, que es el componente con mayor coeficiente.

El modelo base Qwen3.8-27B es un modelo multimodal nativo (visión-lenguaje) de arquitectura transformer densa, desarrollado por el equipo Qwen de Alibaba. No se dispone de información sobre el dataset de entrenamiento ni sobre técnicas de alineación (RLHF/DPO) aplicadas al modelo original. El merge no introduce nuevas capacidades, sino que combina los pesos de ambos modelos, por lo que se espera que herede las habilidades de ambos, aunque con posibles diferencias de comportamiento no evaluadas.

## Capacidades

- Generación de texto y razonamiento: capacidad de producir texto coherente y resolver tareas de razonamiento, heredada de los modelos Qwen base.
- Comprensión de imágenes: al ser un modelo multimodal nativo, puede procesar entradas visuales y responder preguntas sobre ellas, describir contenido o extraer información.
- Generación de código: el modelo base Qwen3.8-27B destaca en tareas de programación, incluyendo generación, revisión y depuración de código.
- Soporte de agentes y flujos de trabajo: diseñado para tareas agénticas multi-paso, como planificación y ejecución de acciones con herramientas externas (aunque no se confirma tool calling explícito en la información disponible).
- Automatización de oficina: capaz de procesar documentos, hojas de cálculo y presentaciones, extrayendo datos o generando resúmenes.
- Capacidades multilingües: probablemente soporta múltiples idiomas, aunque no se especifica en la ficha del repo.

## Casos de uso

- Asistente de programación local: el modelo puede integrarse en un IDE o CLI para autocompletar código, explicar fragmentos o sugerir correcciones, ejecutándose en una GPU de consumo gracias a la cuantización GGUF.
- Automatización de tareas de oficina: procesamiento de facturas, contratos o informes en PDF o imagen, extrayendo campos clave y generando resúmenes estructurados.
- Análisis de imágenes en tiempo real: descripción de imágenes, detección de objetos o respuesta a preguntas visuales en aplicaciones de soporte o accesibilidad.
- Chatbot con contexto largo: si se confirma la ventana de 256K tokens, puede mantener conversaciones extensas con memoria de todo el historial, útil para atención al cliente o asistentes personales.
- Revisión de código en pipelines CI/CD: el modelo puede analizar pull requests, detectar errores comunes o sugerir mejoras de estilo, integrándose mediante llamadas a una API local.
- Agente autónomo para investigación: combinado con herramientas de búsqueda web o ejecución de scripts, puede realizar tareas multi-paso como recopilar datos, resumir artículos y generar informes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este modelo específico (el merge cuantizado). El modelo base Qwen3.8-27B ha sido evaluado en benchmarks como DeepSWE 1.1 y QwenSWEBench, pero no se proporcionan cifras concretas en los resultados de búsqueda. Un artículo de insiderllm.com compara Qwen3.8-27B y Qwen3.6-27B en una RTX 3090, indicando diferencias de rendimiento de generación dentro de un porcentaje y un aumento de VRAM de 254 MiB, pero no se refiere al merge. Por tanto, no se incluyen números para evitar datos no verificados.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para un modelo de 27B, las cuantizaciones típicas requieren aproximadamente:
  - Q4_K_M: ~16-18 GB
  - Q5_K_M: ~20-22 GB
  - Q8_0: ~28-30 GB (no cabe en GPUs de consumo de 24 GB)
- GPU recomendadas: RTX 3090 (24 GB) o RTX 4090 (24 GB) para cuantizaciones Q4/Q5; A100 o H100 para cuantizaciones más altas o FP16.
- Compatibilidad con consumer GPU: sí, con cuantizaciones Q4 o Q5 en GPUs de 24 GB.
- Opciones de despliegue: `llama.cpp`, `Ollama`, `llama-cpp-python` y cualquier runtime compatible con GGUF. No se recomienda vLLM para GGUF (usa safetensors), aunque existen adaptadores experimentales.
- Latencia y throughput: no disponibles. El artículo de insiderllm sugiere que en una RTX 3090 la generación es similar entre Qwen3.8-27B y Qwen3.6-27B, pero no se dan cifras exactas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3B | 256K (según documentación) | Apache-2.0 | safetensors | Modelo oficial, multimodal nativo |
| Qwen3.6-27B (base) | 27,3B | No disponible | Apache-2.0 | safetensors | Versión anterior, también multimodal |
| Este merge (GGUF) | 27,3B | No disponible | Apache-2.0 | GGUF | Interpolación 0.9/0.1, cuantizado |

No se dispone de benchmarks comparativos entre estos modelos en la información proporcionada. El merge no ha sido evaluado de forma independiente, por lo que su rendimiento relativo es incierto.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos para este merge, pero al derivar de modelos Qwen, puede heredar sesgos presentes en los datos de entrenamiento originales.
- Riesgo de alucinacion: inherente a los modelos generativos; puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo.
- Limitaciones de contexto: la longitud de contexto no está confirmada para el merge; si no se mantiene la ventana de 256K, el rendimiento en tareas de contexto largo podría degradarse.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, pero se recomienda revisar los términos de los modelos base originales.
- Caveat de producción: al ser un merge no entrenado, puede presentar comportamientos inestables o impredecibles en comparación con los modelos originales. Se recomienda validar exhaustivamente antes de usarlo en entornos críticos.
- Cuantización: la conversión a GGUF puede introducir pérdida de precisión, afectando la calidad de salida en tareas de alta sensibilidad.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/creekhop/Qwen3.8-27B-0.9-Qwen3.6-27B-0.1-GGUF
- Modelo base (merge sin cuantizar): https://huggingface.co/vvsotnikov/Qwen3.8-27B-0.9-Qwen3.6-27B-0.1
- Modelo oficial Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Artículo comparativo en RTX 3090: https://insiderllm.com/guides/qwen-3-8-27b-vs-3-6-27b-rtx-3090/
- Página de QwenCloud para Qwen3.8-27B: https://www.qwencloud.com/models/qwen3.8-27b
