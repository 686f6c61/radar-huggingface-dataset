# evanlyhf/MobileAIFactory-BC5CDR-NER-Qwen3.5-0.8B-MNN-4bit-OnePlus8Pro

## Resumen

MobileAIFactory-BC5CDR-NER-Qwen3.5-0.8B-MNN-4bit-OnePlus8Pro es un modelo de lenguaje especializado en extracción de entidades nombradas (NER) biomédicas, concretamente en el corpus BC5CDR (productos químicos y enfermedades). Lo desarrolla el proyecto Mobile AI Factory, un sistema agéntico que, partiendo de una especificación de tarea y un teléfono objetivo, construye automáticamente un modelo de lenguaje pequeño (SLM) ajustado y cuantizado listo para ejecutarse en el dispositivo. El modelo parte de Qwen/Qwen3.5-0.8B, se afina con LoRA y se fusiona, y se exporta a formato MNN en 4 bits.

La relevancia de esta ficha radica en que documenta un caso de extremo a extremo de despliegue en móvil: el modelo se ha optimizado para un OnePlus 8 Pro (Snapdragon 865) bajo restricciones estrictas de memoria (máximo 5.800 MB), velocidad (al menos 2,96 tokens/s en prefill y 5 tokens/s en decode) y consumo energético (máximo 15,7 J por petición). El resultado reportado es un Span F1 de 0,811 sobre un conjunto de evaluación congelado de 1.000 filas, medido con esta misma build de MNN.

Se trata de un modelo muy pequeño (0,8B parámetros) y altamente especializado: no es un modelo de propósito general, sino una herramienta de extracción de entidades para textos biomédicos, empaquetada con su prompt exacto de entrenamiento y evaluación. La licencia es Apache-2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B), afinado con LoRA y fusionado |
| Parametros totales | 0,8B (modelo base Qwen3.5-0.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la evaluación usa hasta 512 tokens nuevos de salida) |
| Tipos de cuantizacion | 4 bits HQQ (bloque 32) con lm_head en 8 bits |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`, `tokenizer.mtok`, `visual.mnn`, `visual.mnn.weight`) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8B parámetros. El proceso de Mobile AI Factory aplica un ajuste fino con LoRA que posteriormente se fusiona en los pesos base, y después exporta el resultado a MNN con cuantización de 4 bits HQQ (bloque de 32) y lm_head en 8 bits, dando un artefacto de aproximadamente 0,6 GB. El motor de inferencia es MNN, con backend CPU seleccionado por el propio sistema a partir de mediciones del teléfono objetivo.

Los datos de entrenamiento combinan el corpus BC5CDR (a través de `tner/bc5cdr`), que contiene anotaciones de productos químicos y enfermedades, con filas sintéticas generadas y verificadas por un LLM profesor (Claude Sonnet 5) durante el proceso de búsqueda. El sistema agéntico orquesta decisiones como ajustar hiperparámetros, minar datos reales o generar ejemplos sintéticos, con reglas fijas que revierten cambios que empeoran la precisión, y escala de modelos pequeños a grandes usando mediciones reales del dispositivo. El prompt de entrenamiento y evaluación es único y fijo: instrucción de tarea en un turno de usuario ChatML, seguido de un turno de asistente con bloque de pensamiento vacío (thinking desactivado), decodificación greedy y parada en `<|im_end|>`.

## Capacidades

- Extracción de entidades nombradas (NER) biomédicas: identifica entidades de tipo `Chemical` y `Disease` en texto biomédico y las devuelve como lista JSON de objetos con claves `text` y `type`.
- Generación de texto estructurado: produce salida JSON conforme al formato solicitado en el prompt.
- Manejo de entradas sin entidades: devuelve `[]` cuando no hay entidades, según el formato entrenado.
- Procesamiento de texto biomédico de abstracts y fragmentos clínicos (corpus BC5CDR).
- Ejecución en dispositivo (on-device) mediante MNN, con backend CPU.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni otras capacidades especiales más allá de las anteriores.

## Casos de uso

- Indexación de abstracts biomédicos en el móvil: el modelo extrae productos químicos y enfermedades de resúmenes de artículos para construir un índice de alertas en el propio teléfono, que es precisamente el requisito M07 del paper (OnePlus 8 Pro, Snapdragon 865, máximo 5.800 MB y 15,7 J por petición).
- Procesamiento de notas clínicas en local: al ejecutarse on-device con MNN, permite extraer entidades de texto clínico sin enviar datos a la nube, reduciendo exposición de información sensible.
- Etiquetado previo en pipelines de minería de literatura: el modelo puede preanotar entidades en grandes volúmenes de abstracts para que un revisor humano valide, usando su salida JSON directamente consumible.
- Filtrado de alertas farmacovigilancia: detección de menciones de fármacos (Chemical) y efectos adversos (Disease) en textos para priorizar revisiones.
- Prototipado rápido de NER especializado: sirve como referencia de cómo un SLM de 0,8B cuantizado a 4 bits puede resolver una tarea concreta con F1 de 0,811, útil para comparar con enfoques mayores.
- Demostración de despliegue móvil de SLM: caso reproducible para evaluar MNN, cuantización HQQ 4 bits y latencia/consumo en hardware Android de gama alta de 2020.
- Extracción por lotes en dispositivos con recursos limitados: el tamaño de 0,6 GB y el backend CPU permiten ejecutarlo en teléfonos sin acelerador dedicado, dentro de los límites medidos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Conjunto | Notas |
|---|---|---|---|
| Span F1 | 0,811 | Conjunto de evaluación congelado del run (1.000 filas) | Medido con esta build de MNN |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas con modelos similares.

## Requisitos de hardware

- VRAM/memoria estimada: el artefacto pesa aproximadamente 0,6 GB en formato MNN 4 bits; el requisito del paper para el caso M07 es de como máximo 5.800 MB de memoria en el dispositivo.
- Dispositivo de referencia: OnePlus 8 Pro con Snapdragon 865, backend CPU mediante MNN.
- GPU recomendadas: no disponible; el caso documentado usa CPU en móvil.
- ¿Cabe en GPU de consumo? No se documenta; por tamaño (0,6 GB) sería viable en cualquier GPU de consumo, pero no hay mediciones publicadas para ese escenario.
- Opciones de despliegue: MNN (runtime LLM de MNN, con `pymnn` y `llm_demo` en Android); no se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: requisito del paper de al menos 2,96 tokens/s en prefill y 5 tokens/s en decode, con máximo de 15,7 J por petición; no se publican mediciones finales de latencia o throughput más allá de esos umbrales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MobileAIFactory-BC5CDR-NER-Qwen3.5-0.8B-MNN-4bit | 0,8B | no disponible | NER biomédico (BC5CDR) | Apache-2.0 | Hugging Face (MNN) |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | Generación de texto general | Apache-2.0 (según modelo base) | Hugging Face |
| Alternativas NER biomédicas especializadas | no disponible | no disponible | NER biomédico | no disponible | no disponible |

No se dispone de datos de rendimiento comparables de otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado para un prompt y formato exactos (ChatML, thinking vacío, greedy, parada en `<|im_end|>`, hasta 512 tokens nuevos); usarlo con otro prompt o plantilla puede degradar la calidad.
- Solo inglés: el campo de idioma declarado es `en`; no se garantiza comportamiento en castellano u otros idiomas.
- Dominio restringido: las entidades cubiertas son las de BC5CDR (Chemical y Disease); no cubre otros tipos de entidades.
- Riesgo de alucinación: como todo modelo generativo, puede producir entidades o tipos inexistentes en el texto; la salida JSON debe validarse en producción.
- Sesgos: no se documentan análisis de sesgo; el corpus BC5CDR y los datos sintéticos generados por un LLM profesor pueden introducir sesgos de dominio y de estilo.
- Datos sintéticos: parte del entrenamiento proviene de filas generadas por Claude Sonnet 5, con el riesgo de arrastrar errores o sesgos del profesor.
- Términos de uso del corpus: BC5CDR tiene sus propias condiciones de uso que deben respetarse además de la licencia Apache-2.0.
- Licencia: Apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-0.8B y las condiciones del dataset.
- Despliegue: el artefacto está en formato MNN y pensado para móvil; no hay garantías ni instrucciones para otros runtimes.
- Métricas: el F1 de 0,811 corresponde a un conjunto de evaluación congelado del run, no a un benchmark público independiente.

## Enlaces

- Hugging Face: https://huggingface.co/evanlyhf/MobileAIFactory-BC5CDR-NER-Qwen3.5-0.8B-MNN-4bit-OnePlus8Pro
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper: https://arxiv.org/abs/2611.13509
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.13509
- Código: https://github.com/evanly-gh/SLM_Factory
- Dataset: https://huggingface.co/datasets/tner/bc5cdr
