# LICDIA-UNLu/Liminar-Gemma-4-12B

## Resumen

Liminar-Gemma-4-12B es un ajuste fino completo de Gemma 4 12B-it orientado al dominio de la normativa universitaria argentina y al español formal de Argentina. Lo desarrolla el Laboratorio de Investigación en Ciencia de Datos & Inteligencia Artificial (LICDIA) de la Universidad Nacional de Luján, dentro de la familia Liminar de modelos abiertos del sistema universitario argentino. El modelo parte de los 11.959.730.224 parámetros del modelo base y conserva su licencia Apache 2.0.

El problema que aborda es concreto: los modelos generalistas desconocen el corpus normativo universitario argentino (leyes nacionales, resoluciones del Consejo Interuniversitario Nacional, materiales de CONICET y de argentina.gob.ar) y fallan al responder sin documentos de apoyo. Liminar mejora de forma sustancial el recuerdo de ese corpus (del 8,7 % al 38,7 % de respuestas correctas en un benchmark de 300 preguntas) manteniendo un rendimiento equivalente al modelo base cuando se usa con recuperación aumentada (RAG).

Es relevante ahora porque demuestra que un ajuste fino de dominio, hecho con recursos de supercomputación pública (Clementina XXI) y datos de fuentes oficiales con licencias abiertas, puede superar a modelos propietarios pequeños en una tarea vertical concreta. Se distribuye en safetensors (bf16) y en dos cuantizaciones GGUF (Q8_0 y Q4_K_M), lo que facilita su despliegue tanto en servidores como en equipos sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4; tag `gemma4_unified`); detalles de atención y capas no disponibles |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (pesos originales), GGUF Q8_0 (8 bits), GGUF Q4_K_M (4 bits) |
| Idiomas soportados | es (español, con orientación al español formal de Argentina) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Gemma 4 12B-it, un transformer decoder-only de unos 12.000 millones de parámetros. El ajuste es completo (todos los pesos), no un adaptador LoRA: se ejecutó con FSDP en un nodo de la supercomputadora Clementina XXI, equipado con 8 tiles de GPU Intel Data Center Max 1550, durante 170 horas de GPU (horas de tile). El entrenamiento consistió en una época de preguntas y respuestas y cuatro épocas con el conjunto completo de datos.

El corpus combina normativa universitaria nacional de Infoleg (base de datos.jus.gob.ar, CC BY 4.0), textos públicos de argentina.gob.ar (CC BY 4.0), CONICET (CC BY 2.5 AR) y del Consejo Interuniversitario Nacional (con permiso), todo curado a mano. Sobre ese material se generaron datos sintéticos con el documento a la vista: fragmentos con su ficha, versiones reescritas, pares pregunta-respuesta, ejemplos de abstención, identidad, respuestas del modelo base a consignas generales y ejemplos de consulta con documentos. Las respuestas de entrenamiento las redactó Qwen 3.5 27B, de modo que el modelo adopta en parte su estilo. La plantilla de chat deja el razonamiento (thinking) apagado, igual que durante el entrenamiento.

## Capacidades

- Generación de texto conversacional en español formal de Argentina, con registro académico e institucional.
- Conocimiento memorizado del corpus normativo universitario argentino (leyes nacionales, normativa de Infoleg, materiales del CIN y de CONICET).
- Consulta aumentada por recuperación (RAG): responde sobre fragmentos de documentos aportados en el contexto con alta fidelidad.
- Abstención: se entrenó explícitamente con ejemplos de abstención para no inventar cuando no dispone de la información.
- Procesamiento image-text-to-text según los tags del repositorio (capacidad multimodal heredada del modelo base; el alcance efectivo no está detallado en la información disponible).
- Soporte de plantilla de chat multi-turno mediante `apply_chat_template` de transformers.
- No se documenta soporte específico de tool calling, function calling ni razonamiento multi-paso con agentes en la información disponible.

## Casos de uso

- Asistente de consulta de normativa universitaria: desplegado con RAG sobre el digesto de una universidad, responde preguntas de estudiantes y personal sobre leyes, resoluciones y reglamentos citando los fragmentos recuperados. Es el escenario para el que se entrenó y evaluó (rúbrica de utilidad, fidelidad, completitud y claridad).
- Atención al público en secretarías académicas: gestiona conversaciones multi-turno sobre trámites, requisitos y plazos, apoyándose en la documentación institucional cargada en el contexto.
- Búsqueda asistida en el digesto jurídico de una universidad: integrado en un buscador interno, transforma consultas en lenguaje natural en respuestas con referencia a la norma aplicable, sin sustituir la lectura del texto oficial.
- Generación de material divulgativo: redacta resúmenes y explicaciones de normativa para boletines internos o guías para estudiantes, con revisión humana obligatoria por el riesgo de error en números y fechas.
- Capa base para ajustes institucionales: cada universidad puede partir de este modelo y añadir sus actos internos (resoluciones de consejo superior, ordenanzas) siguiendo la receta publicada, reduciendo el coste frente a entrenar desde cero.
- Despliegue en local sin GPU: con la cuantización Q4_K_M (7,4 GB) puede ejecutarse en portátiles mediante Ollama o llama.cpp para consultas puntuales de normativa en entornos con recursos limitados.
- Evaluación e investigación: sirve como referencia para estudiar ajustes de dominio en español rioplatense y para comparar estrategias de RAG frente a memoria paramétrica en dominios regulados.

## Benchmarks y rendimiento

| Evaluación | Gemma 4 12B-it (base) | Liminar-Gemma-4-12B | gpt-4.1-mini (referencia) |
|---|---|---|---|
| Normativa sin documentos (300 preguntas): respuestas correctas | 8,7 % | 38,7 % | 14,3 % |
| Normativa sin documentos: nota media del juez (0 a 2) | 0,53 | 1,21 | 0,77 |
| Consulta con documentos, RAG (60 consultas): promedio del juez (1 a 5) | 4,95 | 4,97 | 4,98 |
| RAG: respuestas con algún dato incorrecto | 0 de 60 | 0 de 60 | 0 de 60 |

Las respuestas abiertas las calificó Llama 3.3 70B como juez, ajeno a las familias evaluadas. La evaluación corresponde al modelo en bf16; las versiones GGUF no se evaluaron por separado. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: unos 24 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica requiere 32 GB o más para contextos largos.
- VRAM estimada con Q8_0 (12,7 GB de archivo): alrededor de 14-16 GB en ejecución.
- VRAM estimada con Q4_K_M (7,4 GB de archivo): alrededor de 8-10 GB en ejecución.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S o dos RTX 4090 de 24 GB con reparto de capas; una sola RTX 4090 de 24 GB queda justa para bf16.
- Consumer GPU: cabe con holgura en RTX 4090, RTX 4080, RTX 3090 y similares usando Q4_K_M o Q8_0; en GPUs de 8 GB solo con cuantizaciones más agresivas no publicadas.
- Despliegue: transformers 5 o posterior (requisito explícito del autor), llama.cpp, Ollama (`ollama run hf.co/LICDIA-UNLu/Liminar-Gemma-4-12B:Q4_K_M`), llama-server, LM Studio. No se documenta compatibilidad con vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Liminar-Gemma-4-12B | 11,96 B | no disponible | Ajuste de dominio: normativa universitaria argentina | Apache 2.0 | Hugging Face (safetensors y GGUF) |
| Gemma 4 12B-it (base) | ~12 B | no disponible | Modelo generalista instruct | Licencia Gemma (según el base; el ajuste se publica como Apache 2.0) | Hugging Face |
| gpt-4.1-mini | no disponible | no disponible | Modelo propietario generalista | Propietaria | API de OpenAI |
| Qwen 3.5 27B | 27 B | no disponible | Modelo generalista; generó las respuestas de entrenamiento | no disponible en la información proporcionada | Hugging Face |

En el benchmark de normativa sin documentos, Liminar (38,7 % de aciertos) supera al base (8,7 %) y a gpt-4.1-mini (14,3 %). En consulta con documentos los tres modelos convergen en torno a 4,95-4,98 sobre 5, lo que indica que la ventaja del ajuste se concentra en el recuerdo paramétrico del dominio, no en el uso de contexto recuperado.

## Limitaciones y advertencias

- No conoce qué normas siguen vigentes ni cuáles cambiaron después de la fecha del corpus; para consultas normativas reales debe usarse con RAG sobre una fuente actualizada.
- Puede equivocar números de norma, fechas y montos, incluso en el dominio para el que fue entrenado.
- No conoce los actos internos de cada universidad; esa capa debe añadirse por institución con la receta publicada.
- Entrenado únicamente en español (orientado al español formal de Argentina); el rendimiento en otros idiomas o registros no está evaluado.
- El estilo de las respuestas de entrenamiento proviene de Qwen 3.5 27B, lo que puede imprimir sesgos de estilo ajenos al modelo base.
- Riesgo de alucinación inherente a un modelo de 12 B: el 61,3 % de las preguntas del benchmark sin documentos no se respondieron correctamente.
- La evaluación se hizo solo en bf16; las cuantizaciones GGUF pueden degradar ligeramente la calidad y no fueron evaluadas por separado.
- Aunque el repositorio declara Apache 2.0, conviene verificar las condiciones del modelo base Gemma 4 en usos comerciales, dado que la información disponible no detalla la licencia original del base.
- No se documentan salvaguardas específicas frente a usos indebidos ni evaluaciones de sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LICDIA-UNLu/Liminar-Gemma-4-12B
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Código y receta: https://github.com/LICDIA-UNLu/liminar
- Documentación: https://licdia-unlu.github.io/liminar
- Laboratorio (LICDIA, UNLu): https://licdia.unlu.edu.ar
- Asistente de consulta del digesto de la UNLu: https://licdia.unlu.edu.ar/rag-unlu
- Fuente normativa (Infoleg): https://www.argentina.gob.ar/normativa
- Portal de datos abiertos: https://datos.gob.ar
- CONICET: https://www.conicet.gov.ar
- Consejo Interuniversitario Nacional: https://www.cin.edu.ar
