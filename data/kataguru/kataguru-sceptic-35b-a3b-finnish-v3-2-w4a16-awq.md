# kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-W4A16-AWQ

## Resumen

Kataguru-Sceptic-35B-A3B-Finnish-v3.2-W4A16-AWQ es una cuantización INT4 del modelo Kataguru-Sceptic-35B-A3B-Finnish-v3.2, desarrollado por el usuario kataguru. Se trata de un modelo de mezcla de expertos (MoE) de 35.945.531.248 parámetros totales con aproximadamente 3.000 millones de parámetros activos por token, construido sobre la base Kataguru-Sceptic-35B-A3B-v3.1 y especializado en finés (suomi) mediante la adición de dos expertos dedicados sobre un núcleo congelado de 254 expertos.

El modelo resuelve el problema de la adaptación lingüística soberana al finés sin sacrificar las capacidades de razonamiento científico, código competitivo y tool calling del modelo base. Para ello congela los 254 expertos originales y añade dos expertos nuevos: uno centrado en gramática, morfología y terminología técnica finlandesa, y otro orientado a literatura, no ficción y traducción bidireccional inglés-finés. Mantiene además el codificador visual multimodal de 27 capas y una ventana de contexto de 262.144 tokens.

Esta variante concreta emplea cuantización W4A16-AWQ en formato compressed-tensors con group_size=32 y observador MSE, lo que reduce el peso del repositorio a 26,1 GB y permite su despliegue en vLLM sobre una única GPU de 32 GB o en configuraciones tensor-parallel de 2x RTX 5090. Es relevante ahora porque ofrece una vía práctica de ejecutar un MoE multimodal de 35B con contexto largo en hardware de consumo o de gama profesional accesible, con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer, tipo qwen3_5_moe, con 40 capas y 256 expertos por capa |
| Parámetros totales | 35.945.531.248 |
| Parámetros activos | Aproximadamente 3.000 millones por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | W4A16-AWQ (INT4 pesos, activaciones en FP16), group_size=32, observador MSE, formato compressed-tensors pack-quantized; el autor publica además BF16, NVFP4 y GGUF |
| Idiomas soportados | Inglés (en) y finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (AWQ W4A16); también disponible en BF16, NVFP4 y GGUF en repositorios hermanos |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 40 capas y 256 expertos por capa. De ellos, 254 expertos (identificados como #0 a #253) permanecen congelados desde el modelo base Kataguru-Sceptic-35B-A3B-v3.1, preservando sus capacidades de razonamiento científico, código y tool calling sin olvido catastrófico. Los dos expertos nuevos, #254 y #255, se entrenaron específicamente para el finés: el primero cubre los 15 casos gramaticales, la gradación consonántica (astevaihtelu), la armonía vocálica y las clases de declinación Kotus 1-51, además de terminología de ingeniería industrial, PLC/CNC, medicina clínica y patentes; el segundo se orienta a prosa literaria, no ficción, diálogo natural y traducción fiel inglés-finés.

El conjunto de entrenamiento consistió en 6.565 muestras doradas verificadas humanamente, con una tasa de aprobación del 100 % en las puertas de calidad mecánica, más una calibración contrastiva del router con los parámetros `--moe-mode new_experts_only --recalibrate-router`, r=32 y alpha=64. Se añadió una plantilla de chat específica en finés (`chat_template.jinja`) con etiquetas de control como `/fi`, `/translate` y niveles de razonamiento (`{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}`, `{REASON:off}`). La cuantización W4A16-AWQ se calibró con un conjunto específico en finés (`calib_nvfp4_awq_256_fi.jsonl` e `imatrix_calibration_fi.txt`). El modelo conserva el codificador visual multimodal de 27 capas (333 tensores) y la cabeza especulativa MTP de la capa 40 (785 tensores) del modelo base.

## Capacidades

- Generación de texto y razonamiento en inglés y finés, con modo de razonamiento configurable por profundidad.
- Razonamiento científico de nivel doctorado (hereda el rendimiento del núcleo congelado en GPQA Diamond).
- Programación competitiva y generación de código (LiveCodeBench v6 heredado).
- Tool calling y function calling nativo con etiquetas `<tool_call>` y detección de irrelevancia.
- Capacidades multimodales de visión: pipeline image-text-to-text con codificador visual de 27 capas.
- Traducción bidireccional inglés-finés de página completa con preservación de párrafos mediante el modo `/translate`.
- Dominio de la morfología finlandesa: 15 casos gramaticales, gradación consonántica, armonía vocálica y clases de declinación Kotus 1-51.
- Terminología técnica especializada en ingeniería industrial, PLC/CNC, medicina clínica y patentes.
- Contexto largo de 262.144 tokens para documentos extensos y conversaciones multi-turno.
- Capacidad de decodificación especulativa mediante la cabeza MTP de la capa 40.

## Casos de uso

- Traducción profesional inglés-finés de documentación técnica: el modo `/translate` produce traducciones sin conversación adicional y preserva la estructura de párrafos, adecuado para manuales de ingeniería, patentes y documentación regulatoria gracias a la terminología especializada del experto #254.
- Localización de interfaces y contenido editorial: con 262.144 tokens de contexto se pueden procesar páginas completas de literatura o no ficción manteniendo coherencia terminológica a lo largo del documento, usando el experto #255 para prosa y diálogo natural.
- Asistencia técnica en entornos industriales finlandeses: el modelo maneja terminología PLC/CNC y puede integrarse en herramientas de soporte que requieran tool calling para consultar bases de datos de mantenimiento o sistemas de tickets.
- Análisis de documentos escaneados con componente visual: al conservar el codificador visual de 27 capas, puede procesar imágenes de páginas, formularios o diagramas técnicos junto con texto para tareas de extracción y traducción.
- Agentes conversacionales multi-turno en finés: la plantilla de chat nativa con etiquetas `/fi` y niveles de razonamiento permite ajustar la profundidad de respuesta según el caso, desde respuestas rápidas (`{REASON:low}`) hasta razonamiento profundo (`{REASON:deep}`).
- Generación y revisión de código en pipelines de CI/CD: hereda el rendimiento en LiveCodeBench v6 y el soporte de tool calling, por lo que puede integrarse en flujos de revisión automatizada o generación de pruebas con contexto de repositorio largo.
- Investigación académica en finés: el rendimiento en GPQA Diamond permite usar el modelo para asistencia en razonamiento científico y revisión de literatura técnica, con la ventaja de responder en finés nativo.
- Despliegue en hardware de consumo: la cuantización W4A16-AWQ permite ejecutar el modelo en una GPU de 32 GB o en 2x RTX 5090, habilitando prototipado local sin infraestructura de centro de datos.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden al modelo base y a la auditoría del modelo finlandés. No se han publicado resultados específicos de esta variante cuantizada W4A16-AWQ.

| Benchmark | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks del núcleo | 70,26 % | Heredado intacto de los expertos congelados #0-#253 |
| GPQA Diamond (STEM nivel doctorado) | 70,20 % (139/198) | Física, química y biología molecular de posgrado |
| LiveCodeBench v6 (Pass@1) | 39,43 % (Easy: 90,70 %) | Programación algorítmica competitiva |
| BFCL V4 Single-Turn AST (tool calling) | 83,67 % (Non-Live: 88,44 %) | Detección de irrelevancia: 80,26 % |
| Auditoría en vivo de finés 10/10 (v3.2) | 10/10 PASS (100 %) | FIN-bench, IFEval-FI, morfología Kotus-51 y auditoría literaria/técnica/traducción |

## Requisitos de hardware

- VRAM para BF16 completo: aproximadamente 72 GB, requiere 2x GPU de 48-80 GB.
- VRAM para esta variante W4A16-AWQ: aproximadamente 25,3 GB de pesos, ejecutable en 1 GPU de 32 GB o en 2x RTX 5090 32 GB con tensor-parallel 2.
- VRAM para NVFP4: aproximadamente 24,3 GB, orientado a GPU Blackwell.
- GGUF APEX-Medium: aproximadamente 13,6 GiB, ejecutable en una única GPU de 16 GB.
- GPU recomendadas: RTX 5090 (32 GB) para AWQ/NVFP4, A100 o H100 para BF16 en tensor-parallel, GPU de 16 GB para GGUF APEX-Medium.
- Opciones de despliegue: vLLM (formato compressed-tensors AWQ con soporte Marlin), llama.cpp/Ollama para las variantes GGUF, transformers con la librería estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Finnish-v3.2-W4A16-AWQ | 35,9B totales, ~3B activos | 262.144 | Apache 2.0 | safetensors AWQ W4A16 | Especializado en finés, multimodal, tool calling |
| Kataguru-Sceptic-35B-A3B-Finnish-v3.2 (BF16) | 35,9B totales, ~3B activos | 262.144 | Apache 2.0 | safetensors BF16 | Mismo modelo sin cuantizar, ~67,5 GB |
| Kataguru-Sceptic-35B-A3B-Finnish-v3.2-NVFP4 | 35,9B totales, ~3B activos | 262.144 | Apache 2.0 | NVFP4 | Variante para GPU Blackwell, ~24,3 GB |
| Kataguru-Sceptic-35B-A3B-Basque-v3.2 | 35,9B totales, ~3B activos | no disponible | Apache 2.0 | no disponible | Variante especializada en euskera del mismo núcleo |

No se dispone de datos de benchmarks comparativos con modelos de otros desarrolladores en la información proporcionada.

## Limitaciones y advertencias

- En ficción creativa con temperatura alta puede perder precisión morfológica; el autor recomienda temperature=0,2-0,3 con presence_penalty=0,3 para tareas de corrección y morfología estricta.
- El modelo solo soporta oficialmente inglés y finés; el rendimiento en otros idiomas no está documentado.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible.
- La cuantización W4A16-AWQ puede introducir degradación respecto al BF16 original; no se han publicado métricas de la pérdida de calidad por cuantización.
- El modelo base es una adaptación de un modelo previo (v3.1) mediante congelación de expertos y entrenamiento de dos expertos nuevos sobre 6.565 muestras; el alcance de la especialización en finés está acotado a ese conjunto.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las obligaciones de atribución y las condiciones del modelo base original.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente del rendimiento declarado.
- El tamaño del repositorio (26,1 GB) requiere almacenamiento y ancho de banda considerables para su descarga y despliegue.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-W4A16-AWQ
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-NVFP4
- Variante GGUF: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Finnish-v3.2-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Variante en euskera: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2
- Repositorio GGUF v2.6: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v2.6-GGUF/tree/main
