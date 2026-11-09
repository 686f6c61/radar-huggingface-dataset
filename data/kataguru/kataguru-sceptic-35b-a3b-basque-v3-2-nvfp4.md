# kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2-NVFP4

## Resumen

Kataguru-Sceptic-35B-A3B-Basque-v3.2-NVFP4 es la variante cuantizada en NVFP4 del modelo Kataguru-Sceptic-35B-A3B-Basque-v3.2, desarrollado por el usuario kataguru sobre la base Kataguru-Sceptic-35B-A3B-v3.1. Se trata de un modelo de lenguaje y visión de arquitectura Mixture-of-Experts (MoE) con 35.951.822.704 parámetros totales y 3B de parámetros activos por token, orientado específicamente al euskera (idioma vasco) y a la traducción bidireccional entre inglés, finés y euskera. El modelo resuelve un problema de nicho: dotar de capacidades de razonamiento, código, tool calling y traducción de página completa a un idioma con escasos recursos de entrenamiento, sin sacrificar el rendimiento del modelo base mediante el congelado de los expertos originales.

La innovación arquitectónica clave es la ampliación del MoE de 254 a 256 expertos por capa (40 capas en total): los expertos #0 a #253 permanecen congelados para preservar las capacidades del modelo original, mientras que los expertos #254 y #255 se entrenan específicamente para gramática, morfología y terminología técnica en euskera, y para literatura, no ficción y traducción bidireccional, respectivamente. Esta variante NVFP4 está calibrada con un conjunto de datos en euskera y empaquetada con `compressed-tensors` para GPUs Blackwell, reduciendo el peso a aproximadamente 24,3 GB.

El modelo es relevante ahora porque combina un contexto de 262.144 tokens, capacidades multimodales de imagen a texto, un modo de razonamiento configurable y un formato de cuantización nativo para hardware de nueva generación, todo bajo licencia Apache 2.0. Su enfoque de "expertos congelados + expertos nuevos" evita el olvido catastrófico, un problema habitual al especializar modelos multilingües en idiomas de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) con 256 expertos por capa y 40 capas; incluye encoder de visión multimodal de 27 capas y cabeza especulativa MTP en la capa 40 |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (FP4 nativo Blackwell, `compressed-tensors`); el suite incluye también BF16, W4A16-AWQ y GGUF (APEX-Small, APEX-Medium, APEX-Good + mmproj) |
| Idiomas soportados | Inglés (en), euskera (eu), finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 25,6 GB; pesos NVFP4 ~24,3 GB) |

## Arquitectura y entrenamiento

El modelo se construye sobre la arquitectura qwen3_5_moe del modelo base Kataguru-Sceptic-35B-A3B-v3.1. La modificación principal consiste en añadir dos expertos nuevos por capa MoE (de 254 a 256) manteniendo los 254 expertos originales completamente congelados. El experto #254 se especializa en gramática y morfología del euskera (alineación de casos ergativo-absolutivo, concordancia de verbos auxiliares polipersonales Nor-Nori-Nork, sufijos posposicionales aglutinantes) y en terminología técnica industrial (PLC/CNC), medicina clínica y textos legales o de patentes. El experto #255 cubre prosa literaria, no ficción moderna, diálogo natural y traducción fiel EN <-> EU mediante el modo `/translate`.

El entrenamiento se realizó con un banco de 4.844 muestras doradas verificadas humanamente, con una tasa de aprobación del 100 % en el control de calidad mecánico, más una calibración contrastiva del router (`--moe-mode new_experts_only --recalibrate-router`, r=32, alpha=64). La cuantización NVFP4 se calibró con un conjunto específico en euskera (`calib_nvfp4_awq_256_eu.jsonl`) y una matriz de importancia (`imatrix_calibration_eu.txt`), complementados con anclas de STEM y programación. Se preservan intactos el encoder de visión de 27 capas (333 tensores) y la cabeza especulativa MTP de la capa 40 (785 tensores), lo que permite decodificación especulativa. No se especifica en la información disponible el número total de tokens de entrenamiento ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento avanzado, con herencia del rendimiento del modelo base en STEM (GPQA Diamond 70,20 %).
- Programación competitiva y algorítmica (LiveCodeBench v6 Pass@1 39,43 %, con 90,70 % en dificultad Easy).
- Tool calling y function calling nativo con formato `<tool_call>` y detección de irrelevancia (BFCL V4 Single-Turn AST 83,67 %; Non-Live 88,44 %).
- Capacidades multimodales de imagen a texto mediante encoder de visión de 27 capas.
- Traducción de página completa bidireccional entre inglés, finés y euskera con modo dedicado `/translate`, preservando párrafos y sin charla adicional.
- Modo de razonamiento configurable con niveles: `{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}`, `{REASON:off}`.
- Modo nativo en euskera mediante prefijo `/eu` o `chat_template_kwargs={"response_language": "eu"}`.
- Capacidades industriales específicas en PLC/CNC y terminología de ingeniería, medicina clínica y patentes.
- Soporte multilingüe limitado a inglés, euskera y finés.

## Casos de uso

- Traducción profesional EN/ES <-> EU de documentación técnica y literaria: el modo `/translate` permite traducir páginas completas preservando la estructura de párrafos, adecuado para editoriales, administraciones públicas vascas y empresas que necesitan traducciones fieles sin charla conversacional.
- Atención al cliente en euskera: el modelo gestiona conversaciones multi-turno con 262.144 tokens de contexto y un template de chat nativo en euskera, lo que permite mantener historiales largos y responder con morfología correcta en un idioma con pocos recursos.
- Generación y revisión de código en pipelines de CI/CD: con tool calling nativo y BFCL V4 de 83,67 %, puede integrarse como agente que invoca herramientas de build, test y despliegue, y generar parches algorítmicos verificables.
- Asistencia técnica en entornos industriales PLC/CNC: el experto #254 incluye terminología específica de automatización industrial, útil para generar documentación de mantenimiento, interpretar alarmas y redactar procedimientos en euskera y castellano técnico.
- Procesamiento de documentos clínicos y legales: la especialización en terminología médica y estatutaria/patentes permite resumir informes, extraer entidades y redactar borradores con vocabulario preciso en euskera.
- Análisis de imágenes con descripción en euskera: el encoder de visión de 27 capas permite tareas image-text-to-text, como describir figuras técnicas, capturas de pantalla o diagramas y generar la explicación en euskera.
- Razonamiento científico en euskera: con GPQA Diamond de 70,20 % heredado, puede apoyar a investigadores vascos en preguntas de nivel doctorado en física, química y biología molecular, manteniendo la respuesta en euskera mediante `/eu`.
- Despliegue en infraestructura Blackwell: la cuantización NVFP4 permite servir el modelo en 2x RTX 5090 de 32 GB o en una sola GPU de 32 GB, habilitando casos de uso en entornos con presupuesto de VRAM ajustado.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks del núcleo | 70,26 % | Heredado intacto vía expertos congelados #0..#253 |
| GPQA Diamond (STEM nivel doctorado) | 70,20 % (139/198) | Física, química y biología molecular de posgrado |
| LiveCodeBench v6 (Pass@1) | 39,43 % | Easy: 90,70 % |
| BFCL V4 Single-Turn AST (tool calling) | 83,67 % | Non-Live: 88,44 %; detección de irrelevancia: 80,26 % |
| Auditoría en vivo de euskera 10/10 (v3.2) | 10/10 PASS (100 %) | Suite HiTZ EvalEU (EusProficiency, EusExams, EusReading, EusTrivia) y traducción literaria/técnica de página completa EN/ES <-> EU |

No se han publicado resultados de benchmarks comparativos adicionales frente a modelos de la competencia en la información disponible.

## Requisitos de hardware

- VRAM para BF16 completo: aproximadamente 72 GB, requiere 2x GPU de 48-80 GB.
- VRAM para NVFP4: aproximadamente 24,3 GB; funciona en 2x RTX 5090 de 32 GB con tensor parallelism (TP=2) o en una sola GPU de 32 GB compatible con Blackwell.
- VRAM para W4A16-AWQ: aproximadamente 25,3 GB, compatible con vLLM universal.
- VRAM para GGUF APEX-Medium: aproximadamente 13,6 GiB, cabe en una sola GPU de 16 GB.
- GPUs recomendadas: Blackwell (RTX 5090, B200) para NVFP4 nativo; A100/H100 para BF16 o AWQ; RTX 4090/3090 para GGUF.
- Opciones de despliegue: transformers (librería declarada), vLLM (para W4A16-AWQ y presumiblemente NVFP4 con `compressed-tensors`), llama.cpp/Ollama para los GGUF APEX, y endpoints compatibles según el tag `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada. La presencia de cabeza especulativa MTP en la capa 40 sugiere decodificación especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Basque-v3.2-NVFP4 | 35,95B / 3B | 262.144 | Apache 2.0 | Hugging Face (NVFP4, BF16, AWQ, GGUF) | Especializado en euskera, multimodal, calibrado para Blackwell |
| Kataguru-Sceptic-35B-A3B-v3.1 (base) | 35,95B / 3B | 262.144 | Apache 2.0 | Hugging Face | Modelo base sin especialización en euskera; sirve de referencia de rendimiento |
| Modelos MoE de ~30-40B de propósito general | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información sobre modelos comparables de la misma categoría (especializados en euskera con arquitectura MoE y multimodal) en la documentación facilitada.

## Limitaciones y advertencias

- Ficción creativa a alta temperatura: el autor recomienda usar `temperature=0.2-0.3` con `presence_penalty=0.3` para mantener precisión morfológica y de corrección en euskera; a temperaturas altas puede degradarse la calidad lingüística.
- Huella de VRAM: BF16 completo requiere ~72 GB, lo que limita el despliegue a configuraciones multi-GPU; las variantes cuantizadas mitigan esto pero introducen pérdida de precisión no cuantificada en la información disponible.
- Cobertura lingüística restringida: solo inglés, euskera y finés; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas, a pesar de que la auditoría menciona traducción EN/ES <-> EU.
- Riesgo de alucinación: no se documentan evaluaciones específicas de factualidad o tasa de alucinación; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en terminología técnica especializada.
- Sesgos: no se documentan análisis de sesgos en la información proporcionada; el entrenamiento con 4.844 muestras verificadas humanamente puede introducir sesgos de selección.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se distribuye "tal cual".
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni validación independiente.
- Dependencia de hardware Blackwell para NVFP4: fuera de GPUs Blackwell, esta variante concreta no es la opción adecuada; deben usarse las variantes AWQ o GGUF.
- El modelo base es a su vez un modelo derivado de terceros (qwen3_5_moe), por lo que hereda las limitaciones y posibles restricciones de la arquitectura original no detalladas aquí.

## Enlaces

- Hugging Face (NVFP4): https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2-NVFP4
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2
- Variante W4A16-AWQ para vLLM: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2-W4A16-AWQ
- Variante GGUF APEX-Trio: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Suite de evaluación HiTZ EvalEU: no disponible como enlace directo en la información proporcionada
