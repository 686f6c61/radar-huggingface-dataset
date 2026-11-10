# AEON-7/Step-3.7-Flash-AEON-Ultimate-Abliterated-BF16

## Resumen

Step-3.7-Flash-AEON-Ultimate-Abliterated-BF16 es una versión modificada del modelo Step-3.7-Flash desarrollado por StepFun, publicada por el usuario AEON-7 en Hugging Face. Se trata de un modelo de lenguaje y visión de tipo sparse-MoE (mezcla de expertos dispersa) con aproximadamente 201.365 millones de parámetros totales y unos 11.000 millones activos por token, según la model card. La modificación principal consiste en una "abliteración" (eliminación del comportamiento de rechazo) mediante proyección ortogonal de un subespacio de rechazo medido sobre los pesos que escriben en el flujo residual, manteniendo intactas las capacidades generales, el razonamiento en cadena, el uso de herramientas y la ruta de visión.

El modelo está pensado para investigación en seguridad autorizada, red-teaming y despliegue local sin censura por parte del propietario del modelo. La licencia Apache-2.0 del modelo base se mantiene. Es relevante ahora porque combina un MoE multimodal de gran tamaño con contexto largo, capacidades agénticas y tool calling, y una build optimizada para hardware ARM64/Blackwell (DGX Spark, GB10), lo que lo hace interesante para despliegues en plataformas emergentes de cómputo en el borde.

La model card incluye una cláusula extensa de responsabilidad del usuario, arbitraje e indemnización que conviene leer antes de cualquier uso, ya que traslada toda la responsabilidad legal y ética al operador del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Sparse MoE (mezcla de expertos dispersa), transformer multimodal (visión-lenguaje), con modo thinking |
| Parámetros totales | 201.365.316.160 (~201,4 B) |
| Parámetros activos | ~11 B (según model card) |
| Longitud de contexto | no disponible (la model card menciona "long-context" como tag, sin cifra) |
| Tipos de cuantización | BF16 / bfloat16 (build publicada); no se detallan otras cuantizaciones |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (repo de 402,7 GB) |

## Arquitectura y entrenamiento

El modelo base es Step-3.7-Flash de StepFun, descrito como un MoE disperso de ~198 B de parámetros con ~11 B activos, multimodal (image-text-to-text) y con modo "thinking" para razonamiento en cadena. La build AEON-7 conserva la arquitectura del base y aplica una técnica de "expert-granular abliteration": se mide un subespacio de rechazo y se proyecta ortogonalmente fuera de cada peso que escribe en el flujo residual, eliminando el comportamiento de rechazo sin reentrenar. La model card afirma que esta operación preserva capacidad general, razonamiento, tool-use y la ruta de visión.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF/DPO en el modelo base. La build está optimizada para inferencia en ARM64 con GPUs Blackwell (sm_121a), e incluye soporte para chunked-prefill, prefix-caching y una API compatible con OpenAI, según los tags.

## Capacidades

- Generación de texto conversacional e instruct.
- Razonamiento con modo "thinking" (cadena de pensamiento explícita).
- Generación de código (tag "coding").
- Capacidades de visión-lenguaje (image-text-to-text).
- Tool calling y function calling.
- Uso agéntico y razonamiento multi-paso (tags "agentic", "multi-step").
- Contexto largo (tag "long-context", sin cifra concreta).
- Comportamiento sin rechazo ("refusal-removed", "uncensored", "unfiltered").
- Soporte de API compatible con OpenAI y despliegue con vLLM.
- Optimización para ARM64/Blackwell (DGX Spark, GB10, sm_121a).

## Casos de uso

- Red-teaming y evaluación de seguridad: el modelo permite generar respuestas que un modelo alineado rechazaría, lo que facilita la construcción de conjuntos de pruebas adversarios y la evaluación de filtros de salida en pipelines de moderación.
- Investigación en alineación: estudiar el efecto de la abliteración sobre el comportamiento del modelo comparándolo con el base Step-3.7-Flash en tareas de razonamiento y rechazo.
- Despliegue local en DGX Spark / GB10: la build está optimizada para ARM64 y Blackwell (sm_121a), lo que permite ejecutar un MoE de ~201 B en hardware de borde con memoria unificada, usando vLLM con chunked-prefill y prefix-caching.
- Agentes autónomos con tool calling: integración en pipelines agénticos que requieren function calling y razonamiento multi-paso, con la salvedad de que el operador debe añadir capas de seguridad propias.
- Asistencia de código en entornos controlados: generación y revisión de código en flujos internos donde se acepta el riesgo de contenido sin filtrar y se dispone de revisión humana.
- Análisis de imágenes en flujos documentales: al ser image-text-to-text, puede procesar capturas, diagramas o documentos escaneados en pipelines internos con validación posterior.
- Generación de contenido sin restricciones para investigación creativa: exploración de narrativa o escenarios que los modelos alineados bloquean, siempre con revisión humana y cumplimiento legal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: en BF16, ~201,4 B de parámetros requieren aproximadamente 400 GB de memoria, lo que coincide con el tamaño del repo (402,7 GB). No cabe en GPUs de consumo individuales.
- GPU recomendadas: hardware con memoria unificada o multi-GPU de gran capacidad; la build está optimizada para Blackwell sm_121a (DGX Spark, GB10, Grace-Blackwell). Para servidores convencionales se requeriría un conjunto multi-GPU (por ejemplo, varias A100/H100 de 80 GB) o cuantización, que no se detalla en la información disponible.
- GPU de consumo: no cabe en RTX 4090 ni similares en BF16.
- Opciones de despliegue: vLLM (soportado explícitamente, con chunked-prefill y prefix-caching), API compatible con OpenAI; transformers como librería. No se confirma soporte de llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Step-3.7-Flash-AEON-Ultimate-Abliterated-BF16 | ~201,4 B | ~11 B | no disponible | Apache-2.0 | Build abliterada, multimodal, ARM64/Blackwell |
| stepfun-ai/Step-3.7-Flash (base) | ~198 B | ~11 B | no disponible | Apache-2.0 | Modelo original alineado con rechazo |
| Alternativas de mismo tamaño | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Comportamiento de rechazo eliminado: el modelo no aplica negativas de seguridad internas; el operador debe implementar capas de moderación, filtrado de salida, registro de auditoría y revisión humana.
- Riesgo de alucinación: no se han publicado métricas de fiabilidad; al ser un modelo sin alineación, la verificación factual recae por completo en el usuario.
- Idiomas: solo se declara inglés; el rendimiento en castellano no está garantizado.
- Contexto: la longitud exacta no está documentada, aunque se etiqueta como "long-context".
- Licencia: Apache-2.0 permite uso comercial, pero la model card añade una cláusula de responsabilidad, arbitraje e indemnización que el usuario acepta al usar el modelo; conviene revisarla con asesoría legal.
- Hardware: requiere ~400 GB en BF16; no apto para GPUs de consumo.
- Producción: la propia model card declara que un despliegue sin capas de seguridad es "inseguro por construcción" y no es un caso de uso soportado.
- Trazabilidad: build de un tercero (AEON-7) sobre el base de StepFun; no hay benchmarks publicados que validen la preservación de capacidades tras la abliteración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AEON-7/Step-3.7-Flash-AEON-Ultimate-Abliterated-BF16
- Modelo base: https://huggingface.co/stepfun-ai/Step-3.7-Flash
- Página de soporte del autor (LotusMake): https://lotusmake.com/support?via=tea
