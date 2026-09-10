# luispoveda93/MiniCPM5-2B-catalan-chat-v2

## Resumen

MiniCPM5-2B-catalan-chat-v2 es un modelo de lenguaje conversacional especializado en catalán, publicado por el usuario luispoveda93 en Hugging Face. Se trata de un ajuste fino con LoRA sobre luispoveda93/MiniCPM5-2B-catalan-chat (la "ronda 1", que a su vez es un LoRA sobre openbmb/MiniCPM5-2B entrenado con InstruCAT), y su objetivo declarado es mejorar el comportamiento en conversaciones multiturno en catalán. Cuenta con 2.516.756.480 parámetros (~2,5B) y se distribuye como modelo fusionado en bf16 (5,0 GB) junto a un adaptador LoRA separado.

El problema que resuelve es acotado pero relevante: la mayoría de modelos abiertos de 2-3B tienen un soporte flojo del catalán y, cuando se ajustan, suelen hacerlo con instrucciones de un solo turno. Esta versión entrena específicamente con 23.400 conversaciones multiturno en catalán procedentes del núcleo conversacional del dataset BSC-LT/ALIA-2606-SFT (la mezcla de SFT que entrenó a ALIA-40b-instruct-2606), todas bajo licencia CC-BY-4.0, lo que elimina la restricción no comercial que arrastraba la ronda 1 en sus datos de entrenamiento.

Es relevante ahora porque permite desplegar un asistente conversacional en catalán en hardware modesto, con un modelo de 2,5B que cabe en GPUs de consumo, y porque la model card documenta con detalle el proceso de entrenamiento, las métricas de evaluación y las limitaciones. No se han publicado resultados de benchmarks independientes en catalán: la evaluación se limita a pérdida y precisión de tokens sobre 400 conversaciones reservadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención causal (repositorio etiquetado como `llama`); modelo base openbmb/MiniCPM5-2B. No se detallan capas, cabezas ni tipo de atención en la información disponible |
| Parámetros totales | 2.516.756.480 (~2,52B), según safetensors |
| Parámetros activos | No aplica: la información disponible no indica que sea un modelo MoE |
| Longitud de contexto | No disponible. El entrenamiento usó secuencias empaquetadas de 2.048 tokens (`max_length 2048 packed`), dato que no equivale necesariamente a la ventana de contexto del modelo base |
| Tipos de cuantización | No disponible para esta revisión. Existe una versión GGUF de la ronda 1 en luispoveda93/MiniCPM5-2B-catalan-chat-GGUF, pero no se anuncia GGUF para la v2 |
| Idiomas soportados | Catalán (`ca`) como idioma declarado y objetivo del ajuste |
| Licencia | `other` (la model card no reproduce el texto de la licencia; los datos de la ronda 2 son CC-BY-4.0, mientras que la ronda 1 incluye InstruCAT en su linaje) |
| Formato de pesos | Safetensors (transformers). Modelo fusionado en bf16 de 5,0 GB; adaptador LoRA publicado por separado |
| Modelo base | luispoveda93/MiniCPM5-2B-catalan-chat (ronda 1), derivado de openbmb/MiniCPM5-2B |
| Tamaño del repositorio | 15,1 GB (la model card indica 5,0 GB para el modelo fusionado en bf16) |
| Método de ajuste | LoRA (r=32, α=64) sobre todas las capas de proyección |
| Fecha de publicación | 10 de septiembre de 2026 (según metadatos del repositorio) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base openbmb/MiniCPM5-2B: un transformer decoder-only con atención causal, etiquetado como `llama` en el repositorio de Hugging Face. No se proporcionan en la información disponible detalles adicionales sobre número de capas, dimensiones ocultas, tipo de atención (completa, lineal o híbrida) ni configuración del tokenizador. El proceso de ajuste es un LoRA aplicado sobre el modelo fusionado de la ronda 1, con r=32, α=64, sobre todas las capas de proyección, learning rate 1e-4 con schedule coseno y 50 pasos de warmup, una época, batch efectivo de 32 (4 × 8), `max_length` de 2.048 tokens con empaquetado, precisión bf16 y pérdida calculada únicamente sobre la respuesta del asistente (completion-only loss). El entrenamiento completo ocupó aproximadamente 326 pasos empaquetados y 2 horas y 19 minutos en una A100-large.

Los datos de entrenamiento son 23.400 conversaciones multiturno en catalán extraídas del núcleo denso en conversación del dataset BSC-LT/ALIA-2606-SFT: mturn-plus5 (5.281), eif o seguimiento exacto de instrucciones (5.821), mentor-ca (5.047), dolly-ca (2.449), coqcat (2.372), alia-identity (1.259) y system-prompt multiturno (1.226). Se añadió un system prompt en catalán ("Ets un assistent conversacional que respon sempre en català.") a las conversaciones que no lo llevaban, y se reservaron 400 conversaciones para evaluación. Los corpora de QA, RAG y matemáticas de la mezcla ALIA se excluyeron deliberadamente para priorizar el comportamiento conversacional; las habilidades de QA de tarea proceden de la ronda 1 (InstruCAT). No se documenta uso de RLHF ni DPO. Las métricas observadas fueron: pérdida de entrenamiento de 2,44 a ~1,44; pérdida de evaluación 1,48 → 1,41 → 1,383; y precisión de tokens de 0,57 a 0,704 en las 400 conversaciones reservadas.

## Capacidades

- Generación de texto conversacional en catalán, con foco explícito en diálogos multiturno y coherencia de hilo conversacional.
- Seguimiento de instrucciones de un solo turno y de varios turnos, reforzado con subconjuntos específicos del dataset (eif, dolly-ca).
- Adherencia a system prompts: entrenado con conversaciones que incluyen system prompt en catalán, incluido un subconjunto dedicado a ello.
- Identidad propia del asistente: subconjunto alia-identity de 1.259 conversaciones orientado a respuestas sobre sí mismo.
- Respuesta a preguntas conversacionales (subconjunto coqcat) y diálogo de tipo mentoría (mentor-ca).
- Soporte de plantilla de chat mediante `apply_chat_template` con roles `system`, `user` y `assistant`.
- Capacidades de QA de tarea procedentes del linaje de la ronda 1 (InstruCAT), no del ajuste de la ronda 2.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio, modo de razonamiento explícito ni decodificación especulativa.
- Capacidades multilingües: solo catalán declarado; no se documenta transferencia a castellano, inglés u otras lenguas.

## Casos de uso

- Atención al cliente automatizada en catalán: el modelo mantiene conversaciones multiturno con seguimiento del contexto y responde siempre en catalán si se fija el system prompt adecuado; es adecuado para primeros niveles de soporte donde no se requiere conocimiento factual profundo.
- Asistente conversacional para pymes catalanoparlantes: chat interno o de cara al público desplegado en una única GPU de consumo, con coste de inferencia bajo gracias a los 2,5B de parámetros.
- Mentoría y acompañamiento educativo: el subconjunto mentor-ca entrena explícitamente diálogos de orientación, por lo que el modelo puede usarse en tutores conversacionales de refuerzo para asignaturas no técnicas.
- Generación de datos sintéticos en catalán: producir diálogos multiturno para ampliar corpus de entrenamiento, con la ventaja de que el modelo es pequeño y barato de ejecutar frente a alternativas de 7B o 40B.
- Normalización y reescritura conversacional: reformular textos o respuestas en un registro catalán coherente dentro de un flujo de diálogo, por ejemplo para adaptar contenidos a lenguaje ciudadano.
- Prototipado rápido de interfaces conversacionales: al integrarse con `transformers` y ser compatible con `text-generation-inference`, sirve como modelo de referencia para validar una UX antes de escalar a un modelo mayor.
- Investigación en ajuste eficiente de lenguas de recursos medios: el repositorio documenta hiperparámetros, datos y métricas, por lo que resulta útil como caso de estudio replicable de LoRA encadenado (LoRA sobre LoRA) para catalán.
- Sistemas de FAQ conversacional en administración pública: con la advertencia de que el conocimiento del mundo del modelo es limitado y debería combinarse con recuperación externa (RAG) para información factual y normativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la evaluación es a nivel de pérdida y precisión de tokens sobre conversaciones reservadas, y que no se ejecutó ningún benchmark independiente de chat en catalán. Los únicos datos disponibles son las métricas internas de evaluación:

| Métrica | Valor |
|---|---|
| Pérdida de entrenamiento (inicio → final) | 2,44 → ~1,44 |
| Pérdida de evaluación (evolución) | 1,48 → 1,41 → 1,383 |
| Precisión de tokens (inicio → final) | 0,57 → 0,704 |
| Conjunto de evaluación | 400 conversaciones reservadas |
| Pasos empaquetados | ~326 |
| Tiempo de entrenamiento | 2 h 19 min en A100-large |

Comparativa con MMLU, HumanEval, GSM8K u otros benchmarks estándar: no disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 5,0 GB solo de pesos; sumando caché KV y activaciones, el rango práctico estimado es de 7 a 10 GB según longitud de contexto y batch.
- VRAM estimada en 8 bits: en torno a 2,5-3 GB de pesos más overhead, aproximadamente 5-7 GB en total.
- VRAM estimada en 4 bits: en torno a 1,3-2 GB de pesos más overhead, aproximadamente 3-4 GB en total. Cabe en GPUs de 6-8 GB.
- GPUs recomendadas: A100 (la model card documenta entrenamiento en A100-large), H100, L40S o RTX 4090 para inferencia en bf16 con margen amplio; RTX 3090/4080 (16-24 GB) también sin problema.
- Cabe en GPU de consumo: sí. En bf16 entra en RTX 3060 12 GB, RTX 4070 12 GB, RTX 4060 Ti 16 GB; en cuantización de 4 bits podría ejecutarse en GPUs de 6-8 GB, aunque no se distribuye GGUF oficial para esta revisión.
- Opciones de despliegue: `transformers` (flujo documentado en la model card), text-generation-inference (el repositorio incluye el tag `endpoints_compatible`), integración con Hugging Face Inference Endpoints, y previsiblemente vLLM al tratarse de una arquitectura de tipo llama (no verificado en la información disponible). llama.cpp y Ollama requerirían una conversión a GGUF que no se anuncia para la v2; sí existe GGUF para la ronda 1.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni latencia por petición.
- Nota sobre el entrenamiento: el ajuste LoRA completo requirió 2 h 19 min en A100-large, lo que da una idea del coste de reproducir el proceso, no de la inferencia.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks para establecer una comparación cuantitativa con alternativas de la misma categoría. La comparación factible con la información proporcionada es la del propio linaje del modelo:

| Modelo | Parámetros | Contexto | Datos de ajuste | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B-catalan-chat-v2 | ~2,52B | No disponible | 23,4K conversaciones multiturno en catalán (ALIA-2606-SFT) | `other` | Safetensors + LoRA |
| MiniCPM5-2B-catalan-chat (ronda 1) | No disponible (mismo base de 2B) | No disponible | InstruCAT (instrucciones de un turno) | No disponible | Safetensors, LoRA y GGUF |
| openbmb/MiniCPM5-2B (base) | No disponible | No disponible | No disponible | No disponible | Safetensors |

Existen otros modelos abiertos orientados al catalán (por ejemplo, de la familia Salamandra del BSC, FLOR de Projecte AINA o ALIA-40b-instruct-2606, citado en la propia model card), pero la información proporcionada no incluye sus especificaciones ni resultados, por lo que no es posible una comparación rigurosa. Comparativa de rendimiento: no disponible.

## Limitaciones y advertencias

- Tamaño reducido: con 2,5B de parámetros, el conocimiento del mundo y la profundidad de razonamiento son limitados. La model card lo señala explícitamente. No es adecuado para tareas que exijan conocimiento factual extenso o razonamiento complejo sin apoyo externo.
- Sesgos conocidos: no se documenta ningún análisis de sesgos ni de seguridad. Al entrenarse sobre corpus conversacionales en catalán, hereda los sesgos presentes en esas fuentes.
- Riesgo de alucinación: alto en preguntas factuales, dado el tamaño del modelo y que el ajuste prioriza el estilo conversacional sobre la exactitud. Recomendable combinar con recuperación de información.
- Cobertura idiomática: solo catalán declarado. No hay garantía de comportamiento correcto en castellano, inglés u otras lenguas, ni de variantes dialectales del catalán.
- Limitación de contexto: no se publica la ventana de contexto del modelo. El valor de 2.048 tokens corresponde al empaquetado durante el entrenamiento, no a una especificación de contexto de inferencia.
- Evaluación insuficiente: no se ejecutó ningún benchmark independiente de chat en catalán. Las métricas reportadas (pérdida 1,383 y precisión de tokens 0,704 sobre 400 conversaciones) son internas, miden ajuste a la distribución de evaluación y no garantizan calidad conversacional percibida.
- Cobertura de tareas desigual: los corpora de QA, RAG y matemáticas se excluyeron deliberadamente de la ronda 2. Las habilidades de QA de tarea dependen de la ronda 1 y no se han reevaluado tras el segundo ajuste.
- Licencia: el repositorio declara `other` sin reproducir el texto de la licencia en la información disponible. Antes de un uso comercial es necesario verificar los términos exactos, teniendo en cuenta que el linaje incluye InstruCAT (ronda 1), pese a que los datos de la ronda 2 sean CC-BY-4.0.
- Repositorio sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin revisión independiente por parte de terceros.
- Discrepancia de tamaño: el repositorio ocupa 15,1 GB frente a los 5,0 GB que la model card atribuye al modelo fusionado en bf16; conviene revisar los archivos antes de descargar en entornos con almacenamiento ajustado.
- Sin garantías de producción: no se documentan pruebas de robustez, evaluación de seguridad, ni comportamiento frente a prompts adversarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat-v2
- Adaptador LoRA de la ronda 2: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat-v2-lora
- Ronda 1 (modelo base del ajuste): https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat
- Versión GGUF de la ronda 1: https://huggingface.co/luispoveda93/MiniCPM5-2B-catalan-chat-GGUF
- Modelo base original: https://huggingface.co/openbmb/MiniCPM5-2B
- Dataset de la ronda 1 (InstruCAT): https://huggingface.co/datasets/projecte-aina/InstruCAT
- Dataset de la ronda 2 (ALIA-2606-SFT): https://huggingface.co/datasets/BSC-LT/ALIA-2606-SFT
- Métricas de entrenamiento (trackio): https://luispoveda93-minicpm5-2b-catalan-chat-v2-trackio.hf.space?project=minicpm5-2b-catalan-chat-v2
- Búsqueda web: los resultados obtenidos no guardan relación con el modelo (corresponden a plantillas sobre reducción de alquiler en alemán), por lo que no se incluye ningún enlace adicional. No se han encontrado papers, blogs ni demos asociados a este modelo en la información disponible.
