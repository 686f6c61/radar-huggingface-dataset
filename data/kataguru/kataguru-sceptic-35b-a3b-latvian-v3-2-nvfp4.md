# kataguru/Kataguru-Sceptic-35B-A3B-Latvian-v3.2-NVFP4

## Resumen

Kataguru-Sceptic-35B-A3B-Latvian-v3.2-NVFP4 es una cuantización nativa en formato NVFP4 (FP4 de 4 bits con escalado por bloques, orientado a las GPU Blackwell de NVIDIA) del modelo Kataguru-Sceptic-35B-A3B-Latvian-v3.2, desarrollado por el usuario kataguru. Se trata de un modelo de mezcla de expertos (MoE) construido sobre el modelo base Kataguru-Sceptic-35B-A3B-v3.1, al que se le han añadido dos expertos especializados en lengua letona (gramática, morfología y traducción bidireccional) manteniendo congelados los 254 expertos originales. El resultado es un modelo multimodal (image-text-to-text) de aproximadamente 35.950 millones de parámetros totales, con unos 3.000 millones de parámetros activos por token, orientado a razonamiento científico, código, tool calling y traducción de página completa entre inglés, letón y finés.

La relevancia de esta variante concreta reside en su empaquetado para hardware Blackwell: el repositorio ocupa 25,6 GB y, según la model card, la cuantización NVFP4 permite ejecutar el modelo en configuraciones de 2x RTX 5090 de 32 GB (tensor paralelismo 2) o en una única GPU de 32 GB, frente a los aproximadamente 72 GB de VRAM que exige la versión completa en BF16. Es, por tanto, una ficha pensada para desarrolladores que quieran desplegar un MoE de 35B con capacidades de visión y razonamiento en infraestructura de gama alta de consumo o en una sola GPU profesional.

El modelo hereda la ventana de contexto de 262.144 tokens del modelo base, así como su cabecera de decodificación especulativa MTP (multi-token prediction) en la capa 40 y su codificador de visión de 27 capas. La licencia es Apache 2.0. El modelo se publicó el 9 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (qwen3_5_moe) con 256 expertos por capa y 40 capas |
| Parámetros totales | 35.951.822.704 (≈35,95B) |
| Parámetros activos | ≈3B por token (denominación A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | NVFP4 (FP4 de 4 bits, compressed-tensors); el suite incluye además BF16, W4A16-AWQ y GGUF APEX |
| Idiomas soportados | Inglés (en), letón (lv), finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, NVFP4); el suite incluye GGUF y AWQ en repositorios separados |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con 40 capas y 256 expertos por capa. La arquitectura parte del modelo base Kataguru-Sceptic-35B-A3B-v3.1, que aporta 254 expertos "core" congelados (identificados como #0 a #253) y unos 3B de parámetros activos por token. Sobre esa base se añaden dos expertos nuevos: el experto #254, especializado en gramática y morfología letona (siete casos gramaticales, seis clases de declinación nominal, alternancias de palatalización báltica, modos verbales debitive y relativo) y en terminología técnica industrial, PLC/CNC, medicina clínica y patentes; y el experto #255, orientado a prosa literaria, no ficción, diálogo natural y traducción fiel EN <-> LV.

El entrenamiento de la adaptación letona se realizó con un banco de 4.805 muestras doradas verificadas humanamente, con una tasa de aprobación del 100 % en la puerta de calidad mecánica, y con calibración contrastiva del router mediante el modo `new_experts_only` y `recalibrate-router` con r=32 y alpha=64. La cuantización NVFP4 se calibró con un conjunto específico en letón (`calib_nvfp4_awq_256_lv.jsonl`) más un ancla de STEM y código (`imatrix_calibration_lv.txt`). El modelo conserva el codificador de visión multimodal de 27 capas (333 tensores) y la cabecera MTP de decodificación especulativa de la capa 40 (785 tensores), y no se modificaron los 254 expertos originales, lo que según el autor evita el olvido catastrófico de las capacidades de razonamiento, código y tool calling del modelo base.

## Capacidades

- Generación de texto y razonamiento científico de nivel graduado (física, química, biología molecular), heredado del modelo base.
- Programación competitiva y algorítmica, con soporte de código en producción.
- Tool calling / function calling nativo con formato `<tool_call>` en AST y detección de irrelevancia.
- Razonamiento agéntico multi-paso y multi-turno.
- Capacidades multimodales de visión (pipeline image-text-to-text), incluyendo comprensión de imágenes.
- Traducción bidireccional de página completa entre inglés, letón y finés mediante el modo `/translate`, con preservación de párrafos y sin "chatter" adicional.
- Modo de razonamiento configurable mediante etiquetas `{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}` y `{REASON:off}`.
- Modo nativo en letón mediante el prefijo `/lv` o el parámetro `chat_template_kwargs={"response_language": "lv"}`.
- Capacidades multilingües en inglés, letón y finés, con plantilla de chat propia en letón.

## Casos de uso

- Traducción profesional EN <-> LV de documentación técnica y literaria: el modo `/translate` permite traducir páginas completas preservando la estructura de párrafos y sin texto conversacional añadido, adecuado para editoriales, administraciones públicas y empresas que operan en el mercado letón.
- Atención al cliente en letón: el experto #254 cubre morfología y casos gramaticales del letón, lo que permite conversaciones multi-turno naturales con hasta 262.144 tokens de contexto para historiales largos o documentación de producto adjunta.
- Procesamiento de documentos escaneados con visión: el codificador de visión de 27 capas permite extraer y traducir texto de imágenes y páginas completas, útil en digitalización de archivos y patentes.
- Asistencia a la programación y revisión de código: hereda del modelo base su rendimiento en LiveCodeBench v6 y su soporte de tool calling, por lo que puede integrarse en pipelines de CI/CD para generación de tests, revisión automatizada y corrección de errores.
- Agentes con tool calling en producción: la puntuación BFCL V4 AST (83,67 %) y la detección de irrelevancia (80,26 %) lo hacen adecuado para orquestación de herramientas en flujos agénticos donde el modelo debe decidir cuándo invocar una función y cuándo no.
- Razonamiento científico y análisis técnico en inglés: con GPQA Diamond del 70,20 %, puede emplearse como asistente de investigación para revisión de literatura, formulación de hipótesis y resolución de problemas de STEM.
- Terminología industrial y médica en letón: el experto #254 incluye vocabulario de PLC/CNC, medicina clínica y patentes, lo que facilita la traducción y redacción de manuales técnicos y documentación regulatoria en letón.

## Benchmarks y rendimiento

| Benchmark | Puntuación | Notas |
|---|---|---|
| Media de 15 benchmarks del núcleo | 70,26 % | Heredado intacto de los expertos congelados #0..#253 |
| GPQA Diamond (STEM nivel doctorado) | 70,20 % (139/198) | Física, química y biología molecular de posgrado |
| LiveCodeBench v6 (Pass@1) | 39,43 % (Easy: 90,70 %) | Programación algorítmica competitiva |
| BFCL V4 Single-Turn AST (tool calling) | 83,67 % (Non-Live: 88,44 %) | Incluye detección de irrelevancia del 80,26 % |
| Auditoría en vivo de letón 10/10 | 10/10 PASS (100 %) | Baltic LLM Evaluation Suite (MMLU-LV, ARC-LV, Commonsense-LV) y traducción literaria y técnica de página completa EN <-> LV |

No se han publicado en la información disponible resultados desglosados por benchmark individual del suite de 15 pruebas, ni mediciones de latencia o throughput para la variante NVFP4.

## Requisitos de hardware

- VRAM estimada para inferencia: la versión NVFP4 ocupa aproximadamente 24,3 GB de pesos, por lo que requiere del orden de 26-30 GB de VRAM en función de la longitud de contexto y del tamaño de lote.
- GPU recomendadas: según la model card, 2x RTX 5090 de 32 GB con tensor paralelismo 2 o una única GPU de 32 GB. La versión BF16 completa requiere unos 72 GB de VRAM (2x 48-80 GB), y la GGUF APEX-Medium (~13,6 GiB) cabe en una GPU de 16 GB.
- Cabe en GPU de consumo: sí, en RTX 5090 (32 GB) o en configuraciones de 2x RTX 5090; no se indica compatibilidad con GPU de 24 GB o menos para esta variante NVFP4.
- Opciones de despliegue: transformers con soporte de compressed-tensors y NVFP4; el suite incluye además una variante W4A16-AWQ para vLLM y una variante GGUF (APEX-Small, APEX-Medium, APEX-Good con mmproj) para llama.cpp y Ollama. El modelo está marcado como endpoints_compatible.
- Latencia y throughput: no disponibles en la información proporcionada. El modelo incorpora una cabecera MTP de decodificación especulativa que, según el autor, forma parte de la arquitectura, pero no se publican cifras de aceleración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Latvian-v3.2-NVFP4 | 35,95B totales, ≈3B activos | 262.144 | Apache 2.0 | NVFP4 (compressed-tensors), safetensors |
| Kataguru-Sceptic-35B-A3B-Latvian-v3.2 (BF16) | 35,95B totales, ≈3B activos | 262.144 | Apache 2.0 | BF16, ~67,5 GB |
| Kataguru-Sceptic-35B-A3B-Latvian-v3.2-W4A16-AWQ | 35,95B totales, ≈3B activos | 262.144 | Apache 2.0 | AWQ W4A16, ~25,3 GB, para vLLM |
| Kataguru-Sceptic-35B-A3B-Latvian-v3.2-GGUF | 35,95B totales, ≈3B activos | 262.144 | Apache 2.0 | GGUF APEX (Small, Medium, Good) + mmproj |

No se dispone en la información proporcionada de comparaciones con modelos de otros desarrolladores (por ejemplo, otros MoE de 30-40B con capacidades multilingües o multimodales), por lo que la comparativa se limita a las variantes del mismo suite.

## Limitaciones y advertencias

- Ficción creativa a alta temperatura: el autor advierte que, para una precisión morfológica y de corrección estricta en letón, conviene usar temperature entre 0,2 y 0,3 con presence_penalty de 0,3; a temperaturas altas la calidad morfológica puede degradarse.
- Riesgo de alucinación: no se documentan medidas específicas de mitigación más allá de la calibración del router y de la puerta de calidad del banco de entrenamiento; como en cualquier modelo generativo, persiste el riesgo de afirmaciones incorrectas, especialmente en dominios técnicos especializados.
- Cobertura idiomática limitada: el modelo declara soporte para inglés, letón y finés; no se garantiza un rendimiento equivalente en otras lenguas, incluido el castellano.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el autor no documenta condiciones adicionales ni garantías; conviene revisar los términos del modelo base y de los datos de calibración.
- Dependencia de hardware Blackwell: la variante NVFP4 está pensada para GPU Blackwell; en hardware anterior puede requerir el uso de las variantes AWQ o GGUF del suite, con posibles diferencias de rendimiento.
- Huella de VRAM: incluso en NVFP4, el modelo necesita del orden de 24,3 GB solo para pesos, lo que deja poco margen en GPU de 32 GB para contextos muy largos o lotes grandes.
- Madurez: el repositorio se publicó el 9 de noviembre de 2026 y no registra descargas ni likes, por lo que no hay evidencia comunitaria de robustez en producción.
- Idiomas de la plantilla: la plantilla de chat nativa está en letón; el uso en inglés o finés puede requerir configuración adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Latvian-v3.2-NVFP4
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Latvian-v3.2
- Variante vLLM W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Latvian-v3.2-W4A16-AWQ
- Variante GGUF APEX-Trio: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Latvian-v3.2-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
