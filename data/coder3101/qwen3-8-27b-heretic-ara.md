# coder3101/Qwen3.8-27B-heretic-ara

## Resumen

Qwen3.8-27B-heretic-ara es una variante "decensored" (desensurada) del modelo oficial Qwen3.8-27B de Alibaba, creada por el usuario coder3101 mediante la técnica de abliteración denominada Heretic v1.2.0, aplicando el método Arbitrary-Rank Ablation (ARA) con preservación de norma por filas. El objetivo es eliminar los mecanismos de rechazo (refusals) del modelo original, manteniendo sus capacidades generales de razonamiento, generación y visión-lenguaje.

El modelo base es un VLM causal de 27 mil millones de parámetros con arquitectura híbrida (Gated DeltaNet + Gated Attention), contexto nativo de 262 144 tokens extensible a 1 000 000, y capacidades multimodales de imagen y vídeo. Esta variante abliterada reduce drásticamente las respuestas de rechazo (de 92/100 a 9/100 en las pruebas del autor) con una divergencia KL de 0.0349 respecto al original, lo que indica que preserva la mayor parte del comportamiento y las habilidades del modelo.

La relevancia de este modelo radica en que ofrece una alternativa sin censura para casos de uso donde el modelo original rechaza peticiones legítimas (por ejemplo, escritura creativa con contenido adulto, investigación sobre temas sensibles o simulación de escenarios extremos), manteniendo la calidad general del Qwen3.8-27B. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 27 356 728 560 (27B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativo, extensible hasta 1 000 000 |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (la model card no especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer causal con encoder de visión integrado. Su capa de lenguaje se organiza en 64 capas con un layout de 16 bloques repetidos, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de FFN, y un sub-bloque final de Gated Attention seguido de FFN. La Gated DeltaNet usa 48 cabezas lineales de atención para V y 16 para QK, con dimensión de cabeza 128. La Gated Attention emplea 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de dimensión 64. El FFN tiene dimensión intermedia de 17 408. La salida LM es de 248 320 tokens (embeddings padded). Se entrenó con Multi-Token Prediction (MTP) en múltiples pasos.

La variante heretic-ara se obtiene mediante abliteración: se identifican direcciones en el espacio de activaciones que correlacionan con el comportamiento de rechazo y se eliminan mediante ablación de rango arbitrario en las capas 32 a 58 (de 64). Los parámetros de ablación incluyen un peso de preservación de buen comportamiento de 0.3654, un peso de dirección de mal comportamiento de 0.0004, un peso de sobrecorrección relativa de 1.0581 y un vecindario de 7. Este proceso no requiere entrenamiento adicional; modifica directamente los pesos del modelo original.

## Capacidades

- Generacion de texto y razonamiento: mantiene las capacidades del Qwen3.8-27B en tareas de codigo, trabajo profesional, investigacion y tareas agente de largo horizonte.
- Vision-lenguaje: comprension nativa de imagenes y videos, incluyendo diagramas STEM, documentos y videos de hasta una hora.
- Control flexible de pensamiento: el modo thinking esta activado por defecto y puede desactivarse por peticion; la profundidad de razonamiento se ajusta con `reasoning_effort` y el contexto de razonamiento historico se conserva con `preserve_thinking`.
- Tool calling y function calling: soportado de forma nativa en el modelo base (segun las especificaciones de Qwen3.8), aunque no se detalla en la model card de esta variante.
- Capacidades agente: planificacion autonoma y manejo de feedback del entorno, disenado para tareas multi-paso.
- Reduccion de rechazos: la abliteracion reduce los rechazos de 92/100 a 9/100 en las pruebas del autor, permitiendo respuestas a peticiones que el modelo original bloquea.
- Multilingue: no especificado en la informacion disponible, aunque el modelo base Qwen soporta multiples idiomas.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar narrativa con contenido adulto, violencia grafica o temas tabu que el Qwen3.8-27B original rechazaria. Adecuado para autores y guionistas que necesitan explorar escenarios extremos sin filtros.
- Investigacion sobre temas sensibles: util para analizar discursos de odio, extremismo o contenido perturbador en contextos academicos, donde el modelo original podria negarse a procesar ciertas entradas.
- Simulacion de conversaciones dificiles: permite modelar interacciones con usuarios hostiles o peticiones inapropiadas para entrenar sistemas de moderacion, ya que responde en lugar de rechazar.
- Desarrollo de personajes de IA sin censura: para proyectos de entretenimiento o roleplay donde se requiere que el asistente adopte personalidades sin limitaciones morales impuestas.
- Generacion de codigo y automatizacion: conserva las capacidades de codigo del modelo base, por lo que puede integrarse en pipelines de CI/CD para generacion y revision de codigo, con tool calling para ejecutar funciones.
- Analisis de documentos y videos: su capacidad vision-lenguaje permite extraer informacion de imagenes, diagramas y videos de larga duracion, util en investigacion cientifica o revision de material audiovisual.
- Agentes autonomos de largo horizonte: su contexto de 262K tokens y su capacidad de planificacion multi-paso lo hacen adecuado para agentes que deben mantener estado durante sesiones prolongadas, como asistentes de investigacion o automatizacion de tareas complejas.

## Benchmarks y rendimiento

La model card incluye una tabla de benchmarks comparativa entre Qwen3.8-27B, Qwen3.6-27B, Qwen3.7-Plus y Muse Glimmer-30B, pero los valores numericos no estan completos en la informacion disponible (la tabla se corta). No se han publicado resultados de benchmarks en la informacion disponible.

Respecto a la abliteracion, el autor reporta:

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Divergencia KL | 0.0349 | 0 (por definicion) |
| Rechazos (refusals) | 9/100 | 92/100 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 55 GB (el repo safetensors ocupa 54.7 GB). Requiere una GPU con al menos 64 GB de VRAM (A100 80GB, H100 80GB, o multiples GPUs).
- Con cuantizacion 4-bit (GGUF/AWQ) se estima un uso de VRAM de 16-18 GB, lo que permitiria ejecutarlo en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque no se proporcionan cuantizaciones oficiales en el repo.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed (segun la model card del modelo base). Para cuantizacion GGUF se podria usar llama.cpp u Ollama, pero no hay archivos GGUF en este repo.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

La comparativa mas directa es con el modelo original Qwen3.8-27B, del cual esta variante es una modificacion. Tambien se pueden considerar otras versiones abliteradas de modelos de tamano similar, aunque no se dispone de datos especificos.

| Modelo | Parametros | Contexto | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K (ext. 1M) | 92/100 | Apache 2.0 | HuggingFace oficial |
| Qwen3.8-27B-heretic-ara | 27B | 262K (ext. 1M) | 9/100 | Apache 2.0 | HuggingFace (este repo) |
| Qwen3.6-27B | 27B | no disponible | no disponible | Apache 2.0 | HuggingFace oficial |

No se dispone de informacion suficiente para comparar con otros modelos abliterados de terceros (como Dolphin o variantes de Llama sin censura) en terminos de rendimiento.

## Limitaciones y advertencias

- La abliteracion reduce los rechazos pero no elimina todos los sesgos del modelo original; puede generar contenido ofensivo, ilegal o peligroso sin filtro, lo que requiere supervision humana en cualquier despliegue.
- La divergencia KL de 0.0349 indica que, aunque pequena, existe una desviacion respecto al modelo original; en tareas delicadas de razonamiento o vision, el comportamiento puede diferir ligeramente.
- No se han publicado evaluaciones exhaustivas de la variante abliterada en benchmarks estandar (MMLU, HumanEval, etc.), por lo que no se puede garantizar que mantenga el rendimiento exacto del modelo base.
- El modelo puede producir alucinaciones, especialmente en tareas de vision o razonamiento complejo, igual que el modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del contenido generado y de cumplir las leyes aplicables en su jurisdiccion.
- El repo no incluye cuantizaciones GGUF ni AWQ; para despliegue en hardware de consumo es necesario cuantizar manualmente, lo que puede degradar el rendimiento.
- No se especifican los idiomas soportados ni la cobertura multilingue de esta variante concreta.

## Enlaces

- Repositorio del modelo: https://huggingface.co/coder3101/Qwen3.8-27B-heretic-ara
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
- PR de Arbitrary-Rank Ablation (ARA): https://github.com/p-e-w/heretic/pull/211
