# LICDIA-UNLu/Liminar-Qwen3.5-27B

## Resumen

Liminar-Qwen3.5-27B es un ajuste fino supervisado del modelo Qwen 3.5 27B desarrollado por el Laboratorio de Investigación en Ciencia de Datos & Inteligencia Artificial (LICDIA) de la Universidad Nacional de Luján (Argentina). El modelo está especializado en normativa universitaria argentina, vida académica e instituciones del sistema universitario nacional, y en el registro del español formal de Argentina. Forma parte de la familia Liminar, una iniciativa que publica modelos abiertos adaptados al dominio universitario argentino con receta y código reproducibles.

El modelo resuelve un problema concreto: los modelos generalistas tienen un conocimiento muy limitado de la normativa universitaria argentina y del español formal administrativo de ese país. Según la evaluación publicada por el autor, el ajuste eleva la tasa de respuestas correctas sobre normativa sin documentos del 10,0 % (modelo base) al 46,7 %, y la nota media del juez de 0,63 a 1,30 sobre 2. En tareas de consulta con documentos (RAG), el modelo mantiene el nivel del base (4,99 sobre 5) sin introducir datos incorrectos en las 60 consultas evaluadas.

Técnicamente es un transformer denso de 27.781.427.952 parámetros (aproximadamente 27,8 mil millones), ajustado mediante LoRA de rango 256 fusionado con el modelo base, con licencia Apache 2.0 y pesos disponibles en safetensors y GGUF. La versión publicada es la `v2026.11`. El ajuste se realizó sin el modo de razonamiento de Qwen 3.5, y la plantilla de chat lo deja desactivado por omisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (hereda la de Qwen 3.5 27B); detalles internos de atención y capas no disponibles en la información proporcionada |
| Parametros totales | 27.781.427.952 (≈27,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | GGUF Q8_0 (8 bits, 29,0 GB) y Q4_K_M (4 bits, 16,8 GB); bf16 en safetensors |
| Idiomas soportados | Español (es), con especialización en español formal de Argentina |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (llama.cpp, Ollama, LM Studio) |

## Arquitectura y entrenamiento

El modelo parte de Qwen 3.5 27B, un transformer denso de aproximadamente 27,8 mil millones de parámetros. El ajuste consistió en un LoRA de rango 256 aplicado sobre las capas lineales, posteriormente fusionado con el modelo base para producir un checkpoint denso estándar. El entrenamiento se ejecutó con FSDP en un nodo de la supercomputadora Clementina XXI, equipado con 8 tiles de GPU Intel Data Center Max 1550, y consumió 392 horas de GPU (horas de tile). El proceso comprendió una época de preguntas y respuestas y cuatro épocas adicionales con todos los datos. El ajuste se realizó sin el modo de razonamiento del modelo base.

El corpus de entrenamiento combina normativa universitaria nacional de Infoleg (base datos.jus.gob.ar, CC BY 4.0) curada manualmente, textos públicos sobre vida universitaria de argentina.gob.ar (CC BY 4.0), CONICET (CC BY 2.5 AR) y el Consejo Interuniversitario Nacional (con permiso), junto con datos sintéticos generados a partir de ese corpus con el documento a la vista: fragmentos con su ficha, versiones reescritas, pares pregunta-respuesta, ejemplos de abstención, identidad, respuestas del modelo base a consignas generales y ejemplos de consulta con documentos. No se documenta en la información disponible el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en español formal de Argentina, con especialización en registro administrativo y académico.
- Conocimiento de normativa universitaria nacional argentina (leyes, decretos y resoluciones del corpus de Infoleg).
- Conocimiento de instituciones del sistema universitario argentino: CONICET, Consejo Interuniversitario Nacional y organismos públicos de educación.
- Consulta asistida con documentos (RAG): responde a partir de fragmentos recuperados por un sistema de recuperación real, con fidelidad verificada en la evaluación del autor.
- Abstención entrenada: incluye ejemplos de abstención en el dataset para reducir respuestas inventadas ante consultas fuera de dominio.
- Capacidad multimodal heredada del modelo base: la etiqueta `image-text-to-text` figura en los metadatos del repositorio, aunque la model card no documenta uso de visión.
- Compatibilidad con endpoints (`endpoints_compatible`) y con el ecosistema transformers 5 o posterior.
- Soporte de plantilla de chat con modo de razonamiento desactivado por defecto.
- No se documenta soporte explícito de tool calling, function calling ni flujos de agentes multi-paso en la información proporcionada.

## Casos de uso

- Asistente de consulta de normativa universitaria: desplegado sobre un digesto institucional con RAG, el modelo responde consultas sobre leyes, decretos y resoluciones usando los fragmentos recuperados. La evaluación del autor muestra 4,99 sobre 5 de media y cero respuestas con datos incorrectos en 60 consultas, lo que lo hace adecuado para atención a estudiantes y personal administrativo.
- Atención al público en secretarías académicas: gestión de conversaciones multi-turno sobre trámites, calendario académico y requisitos administrativos, con la ventaja de que el modelo está entrenado en el registro formal argentino y evita el español neutro o peninsular.
- Redacción y revisión de documentación administrativa: generación de borradores de notas, resoluciones y comunicaciones internas en español formal argentino, con conocimiento del vocabulario institucional del sistema universitario.
- Formación y capacitación interna: respuestas a preguntas frecuentes del personal sobre normativa y procedimientos, con capacidad de abstenerse cuando la consulta queda fuera del corpus.
- Investigación y análisis documental: apoyo a equipos de gestión y a investigadores que necesitan localizar y resumir normativa universitaria, combinado con un pipeline de recuperación sobre fuentes actualizadas.
- Despliegue en infraestructura modesta: la versión GGUF Q4_K_M (16,8 GB) permite ejecución en CPU con llama.cpp, Ollama o LM Studio, sin GPU, lo que facilita su uso en universidades con recursos limitados.
- Adaptación institucional: la receta y el código publicados permiten a cada universidad ajustar el modelo con sus propios actos internos, que el modelo base de Liminar no conoce.

## Benchmarks y rendimiento

| Evaluación | Modelo base (Qwen 3.5 27B) | Liminar-Qwen3.5-27B | gpt-4.1-mini (referencia) |
|---|---|---|---|
| Normativa sin documentos (300 preguntas): respuestas correctas | 10,0 % | 46,7 % | 14,3 % |
| Normativa sin documentos: nota media del juez (0 a 2) | 0,63 | 1,30 | 0,77 |
| Consulta con documentos, RAG (60 consultas): promedio del juez (1 a 5) | 4,99 | 4,99 | 4,98 |
| RAG: respuestas con algún dato incorrecto | 0 de 60 | 0 de 60 | 0 de 60 |

Las respuestas abiertas fueron calificadas por Llama 3.3 70B como juez, un modelo ajeno a las familias evaluadas. La evaluación corresponde al modelo en bf16; las versiones cuantizadas no se evaluaron por separado. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 56 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica requiere GPU de 80 GB (A100 80 GB, H100 80 GB) o reparto multi-GPU.
- Cuantización Q8_0 (29,0 GB): cabe en una GPU de 40 GB (A100 40 GB) o en dos GPU consumer de 24 GB (RTX 4090, RTX 3090) con reparto de capas.
- Cuantización Q4_K_M (16,8 GB): cabe en una GPU consumer de 24 GB (RTX 4090, RTX 3090) y, con margen ajustado, en GPU de 16 GB (RTX 4080, 4070 Ti Super) reduciendo contexto.
- Ejecución en CPU: viable con la versión Q4_K_M mediante llama.cpp, Ollama o LM Studio, sin GPU.
- Opciones de despliegue: transformers 5 o posterior (safetensors), llama.cpp (`llama-server -hf`), Ollama (`ollama run hf.co/...`) y LM Studio. No se documenta soporte explícito de vLLM o TGI en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Liminar-Qwen3.5-27B | ≈27,8 B | No disponible | Normativa universitaria argentina, español rioplatense formal | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Qwen 3.5 27B (base) | ≈27,8 B | No disponible | Propósito general, multilingüe | Apache 2.0 (según el modelo base) | Hugging Face |
| gpt-4.1-mini | No disponible | No disponible | Propósito general, API cerrada | Propietaria | API de OpenAI |

La comparación con el modelo base es la más directa: Liminar mejora de forma marcada el conocimiento de normativa argentina sin documentos (46,7 % frente a 10,0 % de respuestas correctas) y mantiene el rendimiento en consultas con documentos. Frente a gpt-4.1-mini, Liminar supera ampliamente la precisión sin documentos (46,7 % frente a 14,3 %) y queda a la par en RAG (4,99 frente a 4,98), con la ventaja de ser abierto y desplegable en local. No se dispone de datos de benchmarks generales para comparar capacidades fuera del dominio.

## Limitaciones y advertencias

- No conoce qué normas siguen vigentes ni cuáles cambiaron después de la fecha del corpus; para consultas sobre normativa concreta debe usarse con RAG sobre una fuente actualizada.
- Puede equivocar números de normas, fechas y montos, incluso con conocimiento del dominio.
- No conoce los actos internos de cada universidad; esa capa debe añadirse ajustando el modelo con la receta publicada.
- El ajuste se hizo sin modo de razonamiento; activarlo podría degradar el comportamiento esperado.
- El corpus incluye datos sintéticos generados a partir del corpus original, lo que puede introducir sesgos o errores heredados del proceso de generación.
- Riesgo de alucinación fuera del dominio universitario argentino; el modelo está especializado y no sustituye a un modelo generalista para tareas amplias.
- El idioma principal es el español de Argentina; el rendimiento en otras variantes del español o en otros idiomas no está documentado.
- Las versiones cuantizadas (GGUF) no se evaluaron por separado; su rendimiento puede diferir del bf16 evaluado.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre la exactitud normativa recae en el implementador.
- La evaluación se apoya en Llama 3.3 70B como juez y en una rúbrica derivada de una evaluación con personas; no sustituye a una validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LICDIA-UNLu/Liminar-Qwen3.5-27B
- Modelo base Qwen 3.5 27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Repositorio de código y receta: https://github.com/LICDIA-UNLu/liminar
- Documentación: https://licdia-unlu.github.io/liminar
- LICDIA, Universidad Nacional de Luján: https://licdia.unlu.edu.ar
- Asistente de consulta del digesto de la UNLu: https://licdia.unlu.edu.ar/rag-unlu
- Icono del proyecto: https://raw.githubusercontent.com/LICDIA-UNLu/liminar/main/docs/assets/liminar-icono-512.png
