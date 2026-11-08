# kataguru/Kataguru-Sceptic-35B-A3B-Icelandic-v3.2

## Resumen

Kataguru-Sceptic-35B-A3B-Icelandic-v3.2 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) especializado en islandés, desarrollado por kataguru. Se construye sobre el modelo fundacional Kataguru-Sceptic-35B-A3B-v3.1, un modelo multimodal bilingüe (inglés y finés) de 35.000 millones de parámetros totales y 3.000 millones de parámetros activos por token. La innovación principal de esta versión es la ampliación de la arquitectura MoE de 254 a 256 expertos por capa: los 254 expertos originales se mantienen completamente congelados y se añaden dos expertos especializados en islandés (el #254 dedicado a gramática y terminología técnica, y el #255 dedicado a literatura y traducción bidireccional).

El modelo aborda el problema del olvido catastrófico que sufren los modelos sometidos a preentrenamiento continuo (CPT), que degradan sus capacidades matemáticas, científicas y de código al adaptarse a un nuevo idioma. Al congelar el núcleo de razonamiento y añadir expertos específicos, el autor afirma preservar intactas las capacidades del modelo base (promedio de 70,05 % en una batería de 15 benchmarks, 69,70 % en GPQA Diamond, 83,61 % en BFCL V4 AST y 37,71 % en LiveCodeBench v6) mientras se incorpora competencia nativa en islandés.

Es relevante ahora porque representa un intento de crear una "edición soberana" de un modelo de lenguaje para un idioma de bajos recursos como el islandés, manteniendo al mismo tiempo un rendimiento fuerte en tareas de razonamiento científico, código y uso de herramientas. No obstante, en el momento de redactar esta ficha el repositorio es una ranura de prelanzamiento: los pesos no están subidos y el autor estima su publicación en menos de un mes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), basada en Qwen3.5 MoE; 256 expertos por capa en 40 capas MoE |
| Parametros totales | 35B (aproximado; el modelo base declara 35B con 254 expertos enrutados) |
| Parametros activos | 3B por token |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | NVFP4-W4ATTN-AWQ Hybrid (20,3 GB), AWQ W4A16, GGUF APEX-Trio (APEX-Small, APEX-Medium, APEX-Good) + mmproj-f16 + mtp |
| Idiomas soportados | Islandés (is), inglés (en), finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | NVFP4 (compressed-tensors), AWQ, GGUF; pesos aún no publicados |

## Arquitectura y entrenamiento

El modelo es un transformer MoE multimodal con 40 capas MoE. Cada capa contiene 256 expertos: los expertos #0 a #253 son el núcleo congelado heredado del modelo base Sceptic 35B-A3B-v3.1, y los expertos #254 y #255 son nuevos especialistas en islandés. El experto #254 se orienta a gramática islandesa (cuatro casos en tres géneros, declinaciones fuertes y débiles, mutaciones vocálicas U-umlaut e I-umlaut, regencia de caso) y terminología de ingeniería, PLC/CNC, medicina clínica y patentes. El experto #255 se orienta a prosa literaria de página completa, no ficción moderna, diálogo natural y traducción fiel inglés-islandés. El autor menciona además una "calibración de router contrastiva" que limita la fuga de enrutamiento hacia el idioma no objetivo a menos del 0,50 %.

El modelo conserva del base el encoder de visión de 27 capas (333 tensores) y la cabeza de decodificación especulativa MTP (Multi-Token Prediction) en la capa 40 (785 tensores), lo que habilita decodificación especulativa. No se detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset de islandés; el autor indica que la certificación por muestreo del dataset completo y la evaluación en 15 benchmarks más la evaluación nativa en islandés están pendientes de ejecución final. No se especifica si hubo RLHF o DPO en esta adaptación; el modelo base declara capacidades de "honestidad epistémica".

## Capacidades

- Generación de texto y razonamiento científico de nivel de posgrado (física, química, biología molecular), heredado del núcleo congelado.
- Generación de código y síntesis algorítmica (programación competitiva).
- Llamada a herramientas (tool calling / function calling) con generación nativa de AST en etiquetas `<tool_call>` y detección de irrelevancia.
- Capacidades multimodales de visión mediante el encoder de 27 capas.
- Traducción bidireccional inglés-islandés en modo dedicado (`/translate`), con preservación de párrafos y sin conversación adicional.
- Respuestas nativas en islandés mediante la etiqueta `/is` o el parámetro `chat_template_kwargs={"response_language": "is"}`.
- Control de profundidad de razonamiento mediante etiquetas: `{REASON:spoon}` (auditoría científica de 7 pasos), `{REASON:einstein}` (síntesis de 10 ángulos), `{REASON:low}` y `{REASON:none}`.
- Capacidades multilingües en inglés, islandés y finés.
- Decodificación especulativa mediante cabeza MTP.

## Casos de uso

- Traducción literaria y técnica inglés-islandés: el modo `/translate` permite traducir páginas completas preservando párrafos, adecuado para editoriales y organismos públicos islandeses que necesitan traducciones fieles de documentación técnica y prosa.
- Atención al cliente en islandés: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 262K tokens, lo que permite mantener historiales largos de cliente y documentación de producto en una sola ventana.
- Generación de código en producción: el soporte de tool calling con AST nativo y la puntuación de 37,71 % en LiveCodeBench v6 permiten integrarlo en pipelines de CI/CD para generación y revisión de código, aunque con cautela por el rendimiento moderado en programación competitiva.
- Asistencia científica y técnica en islandés: el experto #254 cubre terminología de ingeniería, PLC/CNC, medicina clínica y patentes, útil para traducción técnica especializada y redacción de documentación regulatoria.
- Agentes con razonamiento multi-paso: las etiquetas de profundidad de razonamiento (`spoon`, `einstein`) permiten ajustar el coste computacional según la tarea, adecuado para agentes que combinan planificación y llamadas a herramientas.
- Procesamiento de documentos con imágenes: gracias al encoder de visión, puede extraer y razonar sobre contenido de documentos escaneados, útil en digitalización de archivos islandeses.
- Preservación lingüística y edición: el experto #255 orientado a literatura facilita la corrección gramatical y estilística de textos islandeses, con aplicación en educación y medios de comunicación.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo base Sceptic 35B-A3B, que el autor declara heredados al 100 % por el congelamiento de los expertos #0 a #253. No se han publicado resultados de benchmarks específicos del modelo islandés en la información disponible; la evaluación nativa en islandés (Miðeind Icelandic LLM Leaderboard: WikiQA-IS, GEC-IS, Idioms-IS, ARC-IS) está pendiente.

| Benchmark | Resultado (modelo base) | Notas |
|---|---|---|
| Promedio de 15 benchmarks | 70,05 % | Batería completa con CUDAGraphs, medido en 2x RTX 5090 TP=2 |
| GPQA Diamond | 69,70 % (138/198) | STEM de nivel de posgrado |
| BFCL V4 Single-Turn AST | 83,61 % (Live AST: 79,13 %) | Tool calling |
| LiveCodeBench v6 (Pass@1) | 37,71 % (66/175) | Programación competitiva |
| IFEval Strict | 70,24 % / 77,70 % | Instrucciones y formato |
| Evaluación islandesa | Pendiente (< 1 mes) | Miðeind y traducción literaria/técnica |

## Requisitos de hardware

- GGUF APEX-Medium: funciona en una GPU o Mac con 16 GB de memoria.
- NVFP4-W4ATTN-AWQ Hybrid (20,3 GB): requiere una GPU de 24-32 GB o 2x RTX 5090 con tensor parallelism (TP=2); está optimizado para Blackwell RTX 5090.
- AWQ W4A16: compatible con vLLM universal; requiere una GPU de 24-32 GB.
- Opciones de despliegue: vLLM (para AWQ y NVFP4), llama.cpp/Ollama (para GGUF), y el formato mmproj-f16 para el encoder de visión en despliegues GGUF.
- Latencia y throughput: no disponibles; el autor no publica cifras de latencia o tokens por segundo.
- Cabe en GPU de consumo: sí, en el caso de GGUF APEX-Medium en 16 GB (por ejemplo, RTX 4080/4090 o Mac con memoria unificada); las variantes NVFP4 y AWQ requieren GPUs de gama alta o doble GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo islandés para una comparación rigurosa. A continuación se comparan características estructurales con alternativas del mismo segmento (modelos MoE de ~35B y modelos especializados en islandés), usando solo datos disponibles en la información proporcionada.

| Modelo | Parametros | Activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Icelandic-v3.2 | 35B | 3B | 262K | Apache 2.0 | Prelanzamiento (pesos no publicados) |
| Kataguru-Sceptic-35B-A3B-v3.1 | 35B | 3B | no disponible | no disponible | Publicado |
| Kataguru-Sceptic-35B-A3B-v2.6-NVFP4 | 35B | 3B | no disponible | no disponible | Publicado (cuantizado NVFP4) |
| Alternativas islandesas (p. ej. modelos de Miðeind) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Prelanzamiento: los pesos no están subidos al repositorio; el autor estima la publicación en menos de un mes. No es utilizable en producción en el momento de redactar esta ficha.
- Sin benchmarks propios: los resultados citados son del modelo base y se asumen heredados; la evaluación real en islandés está pendiente.
- Riesgo de alucinación: no se han publicado métricas de fidelidad factual específicas para el modelo adaptado; el rendimiento en GPQA no mide alucinación en uso abierto.
- Sesgos: no se documentan sesgos conocidos ni composición del dataset de islandés; la ausencia de información impide evaluar sesgos de género, dialectales o culturales.
- Cobertura limitada de idiomas: solo inglés, islandés y finés; no hay soporte declarado para castellano ni otras lenguas.
- Rendimiento moderado en código: el 37,71 % en LiveCodeBench v6 es bajo en términos absolutos, por lo que no es adecuado como generador de código de alta fiabilidad sin supervisión.
- Dependencia del autor: el modelo lo mantiene un único desarrollador (kataguru) con 0 descargas y 0 likes en el momento de la ficha; no hay garantías de soporte ni de mantenimiento a largo plazo.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes heredados (Qwen3.5 MoE) antes de desplegar.
- Hardware: las variantes de mayor calidad (NVFP4, AWQ) requieren GPUs de 24-32 GB o doble GPU, lo que limita el despliegue en entornos de consumo.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Icelandic-v3.2
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Variante cuantizada NVFP4 del base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-NVFP4
