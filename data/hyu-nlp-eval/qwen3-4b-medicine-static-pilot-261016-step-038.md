# HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-038

## Resumen

`qwen3-4b-medicine-static-pilot-261016-step-038` es un checkpoint de ajuste fino del modelo Qwen3-4B-Instruct-2507 (4.022.468.096 parámetros), publicado por el equipo HYU-NLP-EVAL (HYU_NLP, EVA Team 4). Se trata de un punto intermedio —el step 38, con semilla 11— de una ejecución piloto denominada `261016_medicine_static_pilot`, orientada al dominio médico. No es un modelo final ni una release estable: es material de investigación reproducible, publicado presumiblemente para permitir la comparación entre distintas ejecuciones y semillas de un mismo pipeline de entrenamiento.

El interés técnico del repositorio no está en el modelo en sí (hereda la arquitectura y capacidades del Qwen3-4B-Instruct-2507 original), sino en el artefacto: incluye tanto una exportación limpia en BF16 para Transformers como el checkpoint nativo exacto en formato veRL/FSDP dentro de `original_checkpoint/`, con verificación de tamaños y hashes SHA256 antes de eliminar el checkpoint local. Eso lo convierte en una pieza útil para quien investigue pipelines de refuerzo (RL) sobre modelos pequeños y quiera reproducir o auditar un run concreto.

Por su naturaleza de checkpoint piloto y por el dominio sanitario, no debe tratarse como un modelo listo para producción clínica: no hay model card descriptiva, no hay idiomas declarados, no hay benchmarks publicados y no hay evaluación de seguridad documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3); el repositorio no detalla la configuración interna de capas |
| Parametros totales | 4.022.468.096 (dato real de los safetensors) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 32.768 tokens según la ficha de terceros (Featherless) para este checkpoint; la model card del autor no lo especifica. El modelo base Qwen3-4B-Instruct-2507 declara 262.144 tokens, pero no hay confirmación de que el fine-tune conserve esa ventana |
| Tipos de cuantizacion | El repositorio solo publica pesos en BF16 (safetensors). No se distribuyen GGUF, AWQ ni GPTQ; la conversión a GGUF/INT8 es posible con herramientas estándar |
| Idiomas soportados | No disponible (no declarados en la model card ni en los metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (exportación BF16 para Transformers) + checkpoint nativo veRL/FSDP en `original_checkpoint/` |

Otros metadatos: 241 descargas, 0 likes, repositorio de 25,7 GB (el tamaño se explica por la coexistencia del export BF16 y el checkpoint nativo con estados de entrenamiento), creado y actualizado el 17 de octubre de 2026. Etiquetas: `text-generation`, `conversational`, `text-generation-inference`, `endpoints_compatible`.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4.022 millones de parámetros, ajustado aquí sobre datos del dominio médico. El autor no publica ni la composición del dataset ni el número de tokens empleados; la model card se limita a identificar el run (`261016_medicine_static_pilot`), el step del checkpoint (38) y la semilla (11).

El formato de checkpoint nativo es veRL/FSDP, framework de reinforcement learning, y los repositorios hermanos del mismo autor llevan etiquetas como `grpo`, `static-rubric` y `rar-medicine`, lo que apunta a un entrenamiento de refuerzo con GRPO y recompensas basadas en rúbricas estáticas sobre datos médicos. Es una inferencia a partir del ecosistema de checkpoints, no un dato confirmado en esta ficha. El repositorio incluye además el pipeline de verificación de integridad (tamaños remotos y SHA256) previo al borrado del checkpoint local, lo que sugiere una publicación automatizada de checkpoints intermedios.

## Capacidades

- Generación de texto conversacional y de tipo instructivo, heredadas del modelo base Qwen3-4B-Instruct-2507.
- Especialización declarada en dominio médico, aunque sin documentación sobre qué tareas concretas cubre el ajuste.
- Ventana de contexto reportada de 32.768 tokens, suficiente para documentos clínicos extensos.
- Soporte de tool calling / function calling: no documentado en la model card; el modelo base Qwen3 dispone de plantillas de tool calling, pero no hay confirmación de que el fine-tune las conserve calibradas.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingüismo: no declarado; los idiomas del fine-tune no están especificados.
- Compatibilidad con Text Generation Inference y endpoints compatibles (según tags del repositorio).
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no documentado.

## Casos de uso

- Extracción de información estructurada de notas clínicas: con 32.768 tokens de contexto puede procesar historiales completos y devolver campos normalizados (diagnósticos, fármacos, dosis), aunque requiere validación humana por el riesgo de error en dominio sanitario.
- Resumen de literatura biomédica: ingesta de artículos o guías de práctica clínica completas y generación de resúmenes con secciones fijas, aprovechando la ventana de contexto para evitar fragmentación.
- Prototipado de asistentes de formación médica: generación de preguntas y respuestas sobre material docente interno, con despliegue on-premise para no exponer apuntes ni datos de alumnos a APIs externas.
- Investigación reproducible en RL: el repositorio conserva el checkpoint nativo veRL/FSDP con semilla y step identificados, lo que permite reanudar, comparar curvas de entrenamiento o auditar una ejecución concreta frente a otros checkpoints del mismo run.
- Evaluación comparativa de checkpoints: como miembro de una familia de modelos del mismo autor (steps 000, 002, 004, 008, 038), sirve para medir cómo evoluciona el comportamiento a lo largo del entrenamiento con el mismo prompt y conjunto de evaluación.
- Triage y clasificación de consultas textuales en un pipeline interno: clasificación de mensajes de pacientes por urgencia o especialidad, con el modelo como componente de un sistema mayor y revisión humana obligatoria.
- Despliegue con requisitos de privacidad: al ser 4B y Apache 2.0, puede ejecutarse en una GPU de consumo dentro de una infraestructura sanitaria que no permita salida a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluación médica (MedQA, PubMedQA u otras), y no hay comparación con el modelo base que permita cuantificar el efecto del ajuste.

## Requisitos de hardware

- VRAM para inferencia en BF16: los pesos ocupan aproximadamente 8,0 GB; sumando caché KV y overhead del runtime, el consumo realista se sitúa en el rango de 12-16 GB con contextos moderados, y crece de forma aproximadamente lineal con el contexto hasta los 32.768 tokens.
- GPU profesionales: A100 40/80 GB y H100 para servir en lote con vLLM o SGLang, donde 4B permite un throughput alto por GPU.
- GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 4080 (16 GB) en BF16; en RTX 3090/4090 permite además contextos largos.
- Cuantización: al no publicarse GGUF, hay que convertirlo. En Q4 el modelo ronda los 2,5 GB, lo que lo hace viable en GPUs de 6-8 GB (RTX 3060, RTX 4060) con contextos recortados.
- Opciones de despliegue: Transformers (ruta directa, ya que el repo trae el export BF16), vLLM y SGLang para serving, TGI (el modelo está etiquetado como compatible), y llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `qwen3-4b-medicine-static-pilot-261016-step-038` | 4,02 B | 32.768 reportados (no confirmado por el autor) | Apache 2.0 | Checkpoint piloto de RL en dominio médico, sin benchmarks ni evaluación publicada |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4,02 B | 262.144 tokens según documentación pública del modelo | Apache 2.0 | Modelo generalista oficial, con evaluación publicada por el autor original |
| Qwen3-8B / Qwen3-8B-Instruct | ~8 B | 32.768 tokens nativos, ampliables, según documentación de Qwen | Apache 2.0 | El doble de parámetros; mayor calidad general a costa de roughly el doble de VRAM en BF16 |
| Llama-3.2-3B-Instruct | 3,2 B | 128.000 tokens según la model card de Meta | Licencia comunitaria Llama 3.2 | Alternativa de tamaño similar; licencia con restricciones de uso, no Apache 2.0 |
| Gemma-3-4B-it | ~4 B | 128.000 tokens según la model card de Google | Licencia Gemma | Alternativa multimodal de tamaño similar; licencia con términos de uso específicos |

La comparación relevante aquí no es de rendimiento —no hay datos— sino de propósito: el checkpoint de HYU-NLP-EVAL es material de investigación de un run concreto, mientras que el Qwen3-4B-Instruct-2507 oficial es la referencia estable y documentada para producción.

## Limitaciones y advertencias

- Checkpoint intermedio (step 38) de un run piloto: no es una versión final ni ha pasado un proceso de validación de release.
- Dominio médico sin evaluación clínica: no hay métricas de exactitud en tareas sanitarias, ni auditoría de seguridad, ni revisión por profesionales. Riesgo alto de alucinación en dosis, diagnósticos, interacciones farmacológicas y referencias bibliográficas.
- Ausencia total de benchmarks: imposible saber si el ajuste mejora o degrada las capacidades del modelo base, incluyendo posibles regresiones en tareas generales.
- Idiomas no declarados: se desconoce si el ajuste conserva el multilingüismo del modelo base o lo ha estrechado.
- Contexto: la cifra de 32.768 tokens procede de una ficha de terceros, no del autor; debe verificarse empíricamente antes de diseñar un sistema que dependa de ventanas largas.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero no exime del cumplimiento del RGPD y de la normativa de productos sanitarios (MDR) si el modelo se integra en un dispositivo médico o en un servicio que trate datos de salud.
- Sin garantías de ningún tipo por parte del autor; el repositorio incluye estados de entrenamiento en `original_checkpoint/`, lo que además incrementa el tamaño de descarga (25,7 GB) frente a los ~8 GB de los pesos puros.
- Alucinación en citas y terminología médica: cualquier salida debe validarse contra fuentes primarias antes de uso clínico o divulgativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-038
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Ficha en Featherless (checkpoint step 038): https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-038
- Ficha en Featherless (checkpoint step 002 del mismo run): https://featherless.ai/models/HYU-NLP-EVAL/qwen3-4b-medicine-static-pilot-261016-step-002
- Checkpoint hermano con etiquetas grpo/static-rubric: https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-seed11-step-000
- Checkpoint hermano (variante dense): https://huggingface.co/HYU-NLP-EVAL/qwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-004
- Ficha en LLM Explorer de un checkpoint de la misma familia: https://llm-explorer.com/model/HYU-NLP-EVAL%2Fqwen3-4b-rar-medicine-static-r0-matched-dense-seed11-step-008,cMGLnuq6Ni0ObvQjQQgbT
- Repositorio del autor en HuggingFace: https://huggingface.co/HYU-NLP-EVAL
