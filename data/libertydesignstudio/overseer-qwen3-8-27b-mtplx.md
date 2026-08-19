# libertydesignstudio/OverSeer-Qwen3.8-27B-MTPLX

## Resumen

OverSeer-Qwen3.8-27B-MTPLX es una conversión a MLX (Apple Silicon) del modelo Qwen/Qwen3.8-27B, desarrollada por el usuario independiente libertydesignstudio. Su objetivo principal es permitir la ejecución de un modelo de 27B de parámetros en equipos con 24 GB de memoria unificada, manteniendo una velocidad de decodificación aceptable mediante decodificación especulativa. Para ello, preserva el head MTP (Multi-Token Prediction) nativo del modelo base en BF16, lo que acelera la generación sin necesidad de un modelo draft adicional.

La versión utiliza una cuantización mixta de precisión: el cuerpo del modelo se cuantiza a 2 bits, pero las capas sensibles a la calidad (embeddings, atención, proyecciones MLP) se mantienen en precisiones superiores (3-8 bits). El resultado es un peso total de 13,4 GB en memoria, frente a los más de 50 GB que ocuparía el modelo original en BF16. Según las mediciones del autor en un Apple M4 base, alcanza entre 10,95 y 14,01 tokens por segundo, frente a los 5,26-5,79 tok/s de una cuantización GGUF Q3_K_M ejecutada con LM Studio.

La relevancia de este proyecto radica en que demuestra una vía práctica para ejecutar modelos grandes en hardware de consumo sin sacrificar demasiada velocidad, aprovechando la decodificación especulativa nativa de Qwen3.8. Sin embargo, no es un modelo entrenado desde cero, sino una adaptación técnica con limitaciones importantes en contexto y en tareas de agente complejas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido (atención lineal y atención completa) |
| Parametros totales | 4.048.768.240 (según safetensors; el modelo base Qwen3.8-27B declara 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K (declarada por el modelo base); la ruta local OMP cualificada anuncia 16K |
| Tipos de cuantizacion | Cuerpo 2-bit; embeddings y LM head 6-bit; atención lineal QKV/Z/out 4-bit, A/B 8-bit; atención completa Q/K/V 5-bit, output 6-bit; MLP down 3-bit; primeras y últimas 4 proyecciones gate/up 3-bit; head MTP en BF16 |
| Idiomas soportados | Inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX), shards mixtos + `mtp.safetensors` + `model-vision.safetensors` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con una arquitectura híbrida que combina atención lineal y atención completa, según se desprende de la descripción de cuantización (hay capas "linear-attention" y "full-attention"). Esta combinación permite manejar contextos largos (262K tokens) con un coste computacional menor que la atención estándar. El modelo fue entrenado por el equipo Qwen con datos multilingües y optimizado para tareas de código, razonamiento y agentes.

OverSeer-Qwen3.8-27B-MTPLX no es un reentrenamiento, sino una conversión a MLX con cuantización mixta. El autor aplicó una receta de cuantización que asigna diferentes precisiones según la sensibilidad de cada capa, documentada en `quantization_recipe.json`. La innovación principal es la preservación del head MTP nativo en BF16, que permite la decodificación especulativa sin necesidad de un modelo draft externo. Para ello, se incluye un parche opcional de MTPLX 2.7.2 que añade kernels de verificación para la cuantización 2-bit en el head MTP.

El proceso de conversión no implicó entrenamiento adicional ni ajuste fino; se trata de una adaptación de pesos y una configuración de runtime. El autor realizó pruebas de calidad en tres tareas (implementación de distancia de edición, explicación TCP/UDP y reparación de búsqueda binaria), con resultados correctos en la mayoría de los casos, aunque detectó una limitación en una tabla ilustrativa de distancia de edición.

## Capacidades

- Generación de texto y conversación: el modelo mantiene las capacidades de Qwen3.8-27B para diálogo multi-turno y generación de texto coherente.
- Razonamiento y resolución de problemas: puede abordar tareas de lógica, matemáticas y análisis, con un modo de razonamiento configurable (aunque no se detalla en esta versión).
- Generación de código: soporta implementación de algoritmos y corrección de errores, verificado con casos de prueba deterministas.
- Tool calling / function calling: funciona con la API nativa de OpenAI en un prompt directo de 604 tokens, produciendo una llamada válida a 10,96 tok/s.
- Capacidades de visión: se incluye un archivo `model-vision.safetensors` que restaura la torre de visión del modelo base, lo que sugiere que el modelo puede procesar imágenes (aunque no se documentan pruebas específicas).
- Decodificación especulativa: gracias al head MTP en BF16, acelera la generación frente a la línea base autoregresiva (7,41 tok/s vs 10,95-14,01 tok/s).
- Multilingüismo: el modelo base es multilingüe, pero la model card declara solo inglés; no se garantiza el rendimiento en otros idiomas.

## Casos de uso

- Asistente de programación en local: un desarrollador puede ejecutar el modelo en un MacBook con 24 GB de RAM para obtener ayuda con snippets de código, explicaciones de algoritmos y depuración, sin depender de servicios en la nube. La velocidad de 11-14 tok/s es suficiente para interacciones interactivas.
- Generación de documentación técnica: el modelo puede redactar comentarios de código, documentación de APIs o explicaciones de conceptos complejos (como TCP vs UDP) con razonamiento coherente, aprovechando su capacidad de generación de texto estructurado.
- Corrección de código en entornos sin conexión: en un pipeline de CI/CD local, el modelo puede revisar parches o sugerir correcciones para bugs comunes, como el caso de la búsqueda binaria verificado por el autor.
- Chatbot de soporte técnico especializado: con la función calling nativa, puede integrarse en un sistema de tickets para extraer datos estructurados (por ejemplo, crear un ticket con prioridad y categoría) mediante una llamada a una API externa.
- Análisis de texto y resumen: dado su contexto de 16K en la ruta local, puede procesar documentos largos (informes, artículos) y generar resúmenes o extraer puntos clave, siempre que el prompt no supere ese límite.
- Prototipado de agentes ligeros: para tareas de agente con pocas herramientas y prompts cortos (menos de 8K tokens), el modelo puede ejecutar razonamiento multi-paso y llamadas a herramientas, aunque no se recomienda para agentes complejos con muchas herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo proporciona mediciones de velocidad de generación en un Apple M4 base con 24 GB, que se resumen a continuación:

| Medición | Resultado |
|---|---:|
| Peso de los pesos cargados | 13,4 GB |
| Verificación Forge D2 | 13,79 tok/s |
| Servidor OpenAI, dos prompts de 300 tokens | 11,23–14,01 tok/s |
| Muestras de razonamiento largo | 10,95–13,08 tok/s |
| Línea base AR (mismo artefacto) | 7,41 tok/s |
| Línea base LM Studio Ridge (GGUF Q3_K_M) | 5,26–5,79 tok/s |

Estas cifras corresponden a la generación excluyendo el prefill del prompt; la latencia extremo a extremo depende de la longitud del prompt. El autor destaca que la ruta `performance-cold` es la más rápida para prompts de menos de 8K tokens, mientras que la ruta `sustained` no completó una tarea de agente OMP en 15 minutos.

## Requisitos de hardware

- VRAM estimada: 13,4 GB de memoria unificada en Apple Silicon (el modelo está diseñado para equipos con 24 GB de RAM).
- GPU recomendadas: Apple Silicon con al menos 24 GB de memoria unificada (probado en Apple M4 base, macOS 26.5.2).
- No cabe en GPUs de consumo NVIDIA/AMD estándar, ya que está compilado específicamente para MLX (Apple Silicon). No se proporcionan versiones CUDA o ROCm.
- Opciones de despliegue: servidor MTPLX (`mtplx serve`), con configuración recomendada documentada en la model card. También puede usarse con MLX y mlx-lm para inferencia directa.
- Latencia y throughput: 10,95–14,01 tok/s en generación (sin prefill) en el hardware de prueba. El prefill de prompts largos puede ser lento; el autor recomienda no superar 8K tokens de prompt para la ruta rápida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Velocidad (M4 24GB) | Licencia | Formato |
|---|---|---|---|---|---|
| OverSeer-Qwen3.8-27B-MTPLX | 27B (base) / 4.05B (safetensors) | 262K (declarado) / 16K (ruta local) | 10,95–14,01 tok/s | Apache 2.0 | MLX safetensors |
| Qwen3.8-27B (original, BF16) | 27B | 262K | No ejecutable en 24 GB | Apache 2.0 | safetensors |
| Qwen3.8-27B GGUF Q3_K_M (LM Studio) | 27B | 262K | 5,26–5,79 tok/s | Apache 2.0 | GGUF |
| Qwen3.8-27B MLX estándar (cuantización uniforme) | 27B | 262K | No medido (probablemente ~7 tok/s) | Apache 2.0 | MLX safetensors |

La comparativa muestra que esta versión MTPLX ofrece una mejora sustancial de velocidad frente a la cuantización GGUF equivalente, a costa de una cuantización más agresiva (2-bit en el cuerpo) y de una ruta de contexto limitada a 16K para tareas locales.

## Limitaciones y advertencias

- La cuantización 2-bit del cuerpo del modelo puede degradar la calidad en tareas complejas; el autor detectó errores en una tabla ilustrativa de distancia de edición, aunque los resultados finales fueron correctos.
- El contexto efectivo en la ruta local se reduce a 16K tokens, muy por debajo de los 262K declarados por el modelo base. Prompts más largos pueden ser bloqueados o ejecutarse muy lentamente.
- No se recomienda para agentes con muchas herramientas o prompts extensos (por ejemplo, el prompt OMP completo de ~23,7K tokens no se procesa correctamente).
- La función calling solo se ha verificado con un prompt directo de 604 tokens; no se garantiza su fiabilidad con esquemas de herramientas complejos.
- Requiere un parche manual de MTPLX 2.7.2 para la verificación de la cuantización 2-bit; sin él, el comportamiento puede ser incorrecto.
- Solo se declara soporte para inglés; el rendimiento en otros idiomas no está verificado.
- El modelo no está afiliado ni respaldado por el equipo Qwen; es un trabajo independiente.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad o seguridad del modelo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/libertydesignstudio/OverSeer-Qwen3.8-27B-MTPLX
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Página de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Análisis de Qwen3.8-27B en AI Release Tracker: https://aireleasetracker.com/model/qwen/qwen3.8-27b
- Artículo sobre Qwen3.8-27B en YottaLabs: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
