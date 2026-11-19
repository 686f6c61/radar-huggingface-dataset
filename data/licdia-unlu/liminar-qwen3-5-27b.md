# LICDIA-UNLu/Liminar-Qwen3.5-27B

## Resumen

Liminar-Qwen3.5-27B es un ajuste fino del modelo Qwen 3.5 27B desarrollado por el Laboratorio de Investigación en Ciencia de Datos & Inteligencia Artificial (LICDIA) de la Universidad Nacional de Luján, en Argentina. Forma parte de la familia Liminar, un conjunto de modelos abiertos orientados a la normativa universitaria argentina, sus instituciones y la vida académica, con especial atención al español formal de Argentina. El modelo parte de una base densa de 27.781.427.952 parámetros y se distribuye con licencia Apache 2.0, la misma del modelo original.

El problema que aborda es la escasa familiaridad de los modelos generalistas con el corpus normativo universitario argentino. Según la model card, el ajuste eleva la tasa de respuestas correctas sin documentos del 10,0 % al 46,7 % en un benchmark de 300 preguntas sobre normativa, y mantiene el rendimiento en escenarios con recuperación documental (RAG). El modelo está pensado para integrarse en asistentes de consulta sobre digestos universitarios, no como sustituto de una fuente normativa actualizada.

La relevancia actual del modelo reside en su carácter abierto, su receta reproducible y su enfoque institucional: cada universidad puede añadir su propia capa de actos internos siguiendo la receta publicada. El ajuste se realizó sin el modo de razonamiento de Qwen 3.5, y la plantilla de chat lo deja desactivado por omisión, lo que simplifica el despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen 3.5 27B); ajuste LoRA de rango 256 sobre capas lineales, fusionado con el modelo base |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q8_0 (8 bits) y Q4_K_M (4 bits); pesos base en bf16 |
| Idiomas soportados | Español (es); orientado al español formal de Argentina |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen 3.5 27B, un transformer denso de aproximadamente 27,8 mil millones de parámetros. El ajuste consistió en un LoRA de rango 256 aplicado sobre las capas lineales y posteriormente fusionado con el modelo base. El entrenamiento se ejecutó con FSDP en un nodo de la supercomputadora Clementina XXI, equipado con 8 tiles de GPU Intel Data Center Max 1550, con un coste total de 392 horas de GPU (horas de tile). Se realizó una época de preguntas y respuestas y cuatro épocas con todos los datos. El ajuste se hizo sin el modo de razonamiento de Qwen 3.5.

El corpus de entrenamiento combina normativa universitaria nacional de Infoleg (base de datos.jus.gob.ar, CC BY 4.0), curada a mano, con textos públicos sobre la vida universitaria procedentes de argentina.gob.ar (CC BY 4.0), CONICET (CC BY 2.5 AR) y el Consejo Interuniversitario Nacional (con su permiso). Sobre ese corpus se generaron datos con el documento a la vista: fragmentos con su ficha, versiones reescritas, pares de pregunta y respuesta, ejemplos de abstención, datos de identidad, respuestas del propio modelo base a consignas generales y ejemplos de consulta con documentos. La model card no detalla el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en español formal de Argentina, con especialización en normativa universitaria nacional.
- Respuesta a preguntas sobre normativa del corpus de entrenamiento sin necesidad de documentos adjuntos.
- Consulta con documentos (RAG): responde a partir de fragmentos recuperados por un sistema de recuperación, con resultados equivalentes al modelo base en la evaluación publicada.
- Comportamiento de abstención entrenado explícitamente: el modelo incorpora ejemplos de abstención en los datos de ajuste.
- Identidad propia del modelo (datos de identidad incluidos en el entrenamiento).
- Capacidad multimodal heredada del modelo base: las etiquetas del repositorio incluyen `image-text-to-text`, aunque la model card no detalla el uso de visión.
- Compatibilidad con endpoints (`endpoints_compatible` según las etiquetas del repositorio).
- Modo de razonamiento desactivado por omisión en la plantilla de chat, tanto en los pesos transformers como en los GGUF.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistente de consulta sobre el digesto normativo de una universidad: el modelo responde preguntas sobre normativa universitaria nacional y se combina con un sistema RAG sobre la fuente actualizada para garantizar vigencia. La evaluación publicada muestra 4,99 sobre 5 de media del juez en 60 consultas con documentos y 0 respuestas con datos incorrectos.
- Atención al público en secretarías académicas: gestión de consultas frecuentes sobre requisitos, plazos y procedimientos descritos en la normativa del corpus, con abstención cuando la pregunta queda fuera del alcance entrenado.
- Soporte a la redacción administrativa: generación de borradores y reescritura de textos formales en español de Argentina a partir de fragmentos normativos, aprovechando los datos de reescritura incluidos en el entrenamiento.
- Formación y divulgación interna: explicación de conceptos normativos (por ejemplo, autonomía universitaria o Ley de Educación Superior) a partir de los textos del corpus, con la advertencia de que el modelo no conoce la vigencia actual.
- Capa institucional personalizable: cada universidad puede aplicar la receta publicada en el repositorio de GitHub para añadir sus actos internos y adaptar el modelo a su propio digesto.
- Despliegue en entornos sin GPU: las versiones GGUF Q4_K_M (16,8 GB) y Q8_0 (29,0 GB) permiten ejecutar el modelo con llama.cpp, Ollama o LM Studio en estaciones de trabajo convencionales.
- Integración en pipelines de consulta documental: el modelo puede actuar como generador final en un sistema de recuperación sobre Infoleg y otras fuentes del corpus, manteniendo la fidelidad a los fragmentos recuperados.

## Benchmarks y rendimiento

La model card publica una evaluación comparativa frente al modelo base Qwen 3.5 27B, con respuestas abiertas calificadas por Llama 3.3 70B como juez externo. El benchmark de normativa sin documentos mide cuánto recuerda el modelo del corpus aprendido; la consulta con documentos usa fragmentos de un sistema de recuperación real y la rúbrica con la que se evaluó con personas el asistente de consulta del digesto de la UNLu (utilidad, fidelidad, completitud y claridad).

| Evaluación | Modelo base | Liminar | gpt-4.1-mini (referencia) |
|---|---|---|---|
| Normativa sin documentos (300 preguntas): respuestas correctas | 10,0 % | 46,7 % | 14,3 % |
| Normativa sin documentos: nota media del juez (0 a 2) | 0,63 | 1,30 | 0,77 |
| Consulta con documentos, RAG (60 consultas): promedio del juez (1 a 5) | 4,99 | 4,99 | 4,98 |
| RAG: respuestas con algún dato incorrecto | 0 de 60 | 0 de 60 | 0 de 60 |

No se han publicado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K u otros) en la información disponible. La evaluación de la ficha corresponde al modelo en bf16; las versiones cuantizadas no se evaluaron por separado.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 56 GB solo para pesos (27,8 mil millones de parámetros a 2 bytes por parámetro), más overhead de activaciones y caché KV; se recomienda al menos 64-80 GB.
- VRAM estimada con GGUF Q8_0 (29,0 GB): aproximadamente 32-36 GB incluyendo contexto y overhead.
- VRAM estimada con GGUF Q4_K_M (16,8 GB): aproximadamente 20-24 GB incluyendo contexto y overhead.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o múltiples GPU de 40-48 GB.
- GPU consumer: el modelo en Q4_K_M puede caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contexto moderado; en Q8_0 requiere GPU de 32 GB o más, o reparto entre varias GPU.
- Despliegue: transformers 5 o posterior con `device_map="auto"`; llama.cpp y `llama-server`; Ollama (`ollama run hf.co/LICDIA-UNLu/Liminar-Qwen3.5-27B:Q4_K_M`); LM Studio. No se mencionan vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Liminar-Qwen3.5-27B | 27,8 mil millones (denso) | No disponible | Normativa universitaria argentina, español de Argentina | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen 3.5 27B (modelo base) | 27,8 mil millones (denso) | No disponible | Propósito general, multilingüe | Apache 2.0 (según el modelo base) | Hugging Face |
| gpt-4.1-mini | No disponible | No disponible | Propósito general | Propietaria | API de OpenAI |

En el benchmark de normativa sin documentos, Liminar supera al modelo base (46,7 % frente a 10,0 % de respuestas correctas) y a gpt-4.1-mini (14,3 %). En consulta con documentos, los tres modelos empatan en la práctica (4,99, 4,99 y 4,98 sobre 5, respectivamente), lo que indica que la ventaja del ajuste se concentra en el conocimiento memorizado del corpus normativo, no en la fidelidad al contexto recuperado.

## Limitaciones y advertencias

- El modelo no sabe qué normas siguen vigentes ni cuáles cambiaron después de la fecha del corpus; para consultas sobre normas concretas debe usarse con recuperación de documentos sobre una fuente actualizada.
- Puede equivocar números de normas, fechas y montos.
- No conoce los actos internos de cada universidad; esa capa debe añadirse por institución siguiendo la receta publicada.
- El ajuste se realizó sin el modo de razonamiento de Qwen 3.5 y la plantilla de chat lo deja desactivado por omisión; no se documenta el comportamiento al activarlo manualmente.
- El modelo está orientado al español de Argentina; no se documenta rendimiento en otras variantes del español ni en otros idiomas.
- La evaluación se realizó únicamente sobre el modelo en bf16; las versiones cuantizadas GGUF no se evaluaron por separado.
- Las respuestas abiertas de la evaluación fueron calificadas por Llama 3.3 70B como juez automático, lo que introduce la variabilidad propia de la evaluación con modelo juez.
- Licencia Apache 2.0: permite uso comercial, pero el modelo hereda las limitaciones y sesgos del corpus normativo y de los datos generados a partir de él.
- No se documentan sesgos específicos ni tasas de alucinación fuera de los benchmarks publicados.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LICDIA-UNLu/Liminar-Qwen3.5-27B
- Modelo base Qwen 3.5 27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Código y receta: https://github.com/LICDIA-UNLu/liminar
- Documentación: https://licdia-unlu.github.io/liminar
- LICDIA, Universidad Nacional de Luján: https://licdia.unlu.edu.ar
- Asistente de consulta del digesto de la UNLu: https://licdia.unlu.edu.ar/rag-unlu
- Icono del proyecto: https://raw.githubusercontent.com/LICDIA-UNLu/liminar/main/docs/assets/liminar-icono-512.png
- Base de datos de normativa (Infoleg): https://datos.jus.gob.ar
- Portal del Estado argentino: https://www.argentina.gob.ar
- CONICET: https://www.conicet.gov.ar
- Consejo Interuniversitario Nacional: https://www.cin.edu.ar
