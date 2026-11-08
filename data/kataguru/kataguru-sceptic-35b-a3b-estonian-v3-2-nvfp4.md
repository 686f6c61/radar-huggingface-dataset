# kataguru/Kataguru-Sceptic-35B-A3B-Estonian-v3.2-NVFP4

## Resumen

Kataguru-Sceptic-35B-A3B-Estonian-v3.2-NVFP4 es la variante cuantizada en formato NVFP4 de un modelo MoE multimodal especializado en estonio, desarrollado por el usuario kataguru sobre la base Kataguru-Sceptic-35B-A3B-v3.1. El modelo resuelve el problema de la adaptación lingüística sin degradar las capacidades originales: en lugar de un fine-tuning convencional que sobrescribe todos los pesos, congela los 254 expertos del núcleo original y añade dos expertos específicos para estonio (gramática, morfología y literatura/traducción) en cada una de las 40 capas MoE, alcanzando 256 expertos por capa.

La arquitectura es un transformer MoE con 35.951.822.704 parámetros totales y 3B parámetros activos por token, con una ventana de contexto de 262.144 tokens, encoder de visión de 27 capas y cabeza especulativa MTP en la capa 40. El modelo cubre generación de texto, razonamiento, código, matemáticas, visión y traducción bidireccional EN/ET/FI.

Esta variante concreta emplea cuantización NVFP4 (FP4 de NVIDIA) mediante compressed-tensors, pensada para GPUs Blackwell, con un peso de repositorio de 25,6 GB. Es relevante porque permite desplegar un modelo de 35B en hardware de consumo de gama alta (2x RTX 5090 o una GPU de 32 GB) manteniendo el rendimiento del modelo BF16 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), 40 capas, 256 expertos por capa |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (FP4 con compressed-tensors); existen variantes W4A16-AWQ, GGUF (APEX-Small/Medium/Good) y BF16 |
| Idiomas soportados | en, et, fi |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors NVFP4); repo de 25,6 GB |

## Arquitectura y entrenamiento

El modelo parte de la base Kataguru-Sceptic-35B-A3B-v3.1 y aplica una expansión MoE: se mantienen intactos los 254 expertos del núcleo (#0..#253) y se añaden dos expertos nuevos por capa en las 40 capas MoE, totalizando 256. El experto #254 se especializa en gramática y morfología estonia (14 casos gramaticales, alternancia de grados consonántica y vocálica, morfología aglutinante finougria) junto con terminología técnica industrial, PLC/CNC, medicina clínica y patentes; el experto #255 cubre prosa literaria, no ficción, diálogo natural y traducción fiel EN<->ET. El entrenamiento se realizó con 7.525 muestras doradas verificadas humanamente y calibración contrastiva del router (`--moe-mode new_experts_only --recalibrate-router`, r=32, alpha=64).

Se conservan sin cambios el encoder de visión multimodal de 27 capas (333 tensores) y la cabeza especulativa MTP de la capa 40 (785 tensores), lo que preserva la decodificación especulativa y las capacidades multimodales. La cuantización NVFP4 se calibró con un conjunto específico en estonio (`calib_nvfp4_awq_256_et.jsonl`) más un ancla de STEM y código, lo que mantiene la precisión en las tareas de razonamiento del núcleo congelado. El modelo incluye una plantilla de chat nativa en estonio con etiquetas de control `/et`, `/translate` y niveles de razonamiento (`{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}`, `{REASON:off}`).

## Capacidades

- Generación de texto y razonamiento de nivel doctoral en STEM (física, química, biología molecular), heredado del núcleo congelado.
- Programación competitiva y algorítmica (LiveCodeBench v6 Pass@1 39,43 %, Easy 90,70 %).
- Tool calling y function calling nativo con AST de `<tool_call>` (BFCL V4 83,67 %, detección de irrelevancia 80,26 %).
- Visión multimodal: pipeline image-text-to-text con encoder de 27 capas.
- Traducción bidireccional EN<->ET y hacia/desde finlandés mediante el modo `/translate`, con preservación de párrafos y sin charla adicional.
- Dominio del estonio: 14 casos gramaticales, alternancia de grados, morfología aglutinante, literatura, no ficción y terminología técnica.
- Modo de razonamiento configurable por profundidad mediante etiquetas `{REASON:...}`.
- Decodificación especulativa mediante cabeza MTP (capa 40).
- Capacidades multilingües en inglés, estonio y finlandés.

## Casos de uso

- Traducción profesional EN<->ET de documentos completos: el modo `/translate` produce traducciones literales y técnicas preservando párrafos, adecuado para editoriales, administraciones públicas y documentación legal o de patentes.
- Localización de software y documentación técnica al estonio: el experto #254 cubre terminología de ingeniería industrial, PLC/CNC y medicina clínica, lo que permite traducir manuales técnicos con vocabulario especializado.
- Atención al cliente en estonio: conversaciones multi-turno con 262.144 tokens de contexto permiten mantener historiales largos y documentación de referencia en la misma ventana.
- Procesamiento de documentos escaneados con visión: el encoder multimodal permite extraer y traducir texto de imágenes o PDFs renderizados en un solo paso.
- Asistentes agénticos con tool calling: el 83,67 % en BFCL V4 y la detección de irrelevancia lo hacen apto para pipelines de agentes que invocan APIs y herramientas externas.
- Generación y revisión de código en producción: con LiveCodeBench v6 y soporte de tool calling, puede integrarse en CI/CD para revisión automática y generación de pruebas.
- Investigación académica en finougrio: evaluación de morfología, sintaxis y comprensión lectora en estonio (tartuNLP/ifeval_et, winogrande_et, EstCOPA, TalTechNLP/exam_et).
- Despliegue en hardware Blackwell de gama alta: la cuantización NVFP4 permite servir el modelo en 2x RTX 5090 (TP=2) o una GPU de 32 GB para inferencia en producción con latencia reducida.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks del núcleo | 70,26 % | Heredado intacto de los expertos congelados #0..#253 |
| GPQA Diamond (STEM nivel doctorado) | 70,20 % (139/198) | Física, química y biología molecular de posgrado |
| LiveCodeBench v6 (Pass@1) | 39,43 % | Easy: 90,70 % |
| BFCL V4 Single-Turn AST (tool calling) | 83,67 % | Non-Live: 88,44 %; detección de irrelevancia: 80,26 % |
| Auditoría en vivo de estonio (10/10) | 10/10 PASS (100 %) | tartuNLP/ifeval_et, winogrande_et, EstCOPA, TalTechNLP/exam_et y auditoría literaria/técnica/traducción |

No se han publicado resultados de benchmarks específicos de la variante NVFP4 en la información disponible; los datos anteriores corresponden al modelo base v3.2 y se declaran heredados del núcleo congelado.

## Requisitos de hardware

- VRAM para BF16 completo: aproximadamente 72 GB (2x GPU de 48-80 GB).
- VRAM para NVFP4: aproximadamente 24,3 GB de pesos; cabe en 2x RTX 5090 de 32 GB con tensor parallelism (TP=2) o en una única GPU de 32 GB.
- VRAM para W4A16-AWQ: aproximadamente 25,3 GB.
- GGUF APEX-Medium: aproximadamente 13,6 GiB, cabe en una GPU de 16 GB.
- GPUs recomendadas: Blackwell (RTX 5090, B200) para NVFP4; A100/H100 para BF16 o AWQ.
- Opciones de despliegue: transformers (librería declarada), vLLM para W4A16-AWQ, llama.cpp/Ollama para GGUF, TGI no confirmado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Estonian-v3.2-NVFP4 | 35,95B (3B activos) | 262.144 | apache-2.0 | NVFP4 safetensors | Variante FP4 para Blackwell |
| Kataguru-Sceptic-35B-A3B-Estonian-v3.2 | 35,95B (3B activos) | 262.144 | apache-2.0 | BF16 (~67,5 GB) | Maestro completo, misma arquitectura |
| Kataguru-Sceptic-35B-A3B-Basque-v3.2 | 35,95B (3B activos) | no disponible | apache-2.0 | safetensors | Misma receta MoE aplicada al euskera |
| Kataguru-Sceptic-35B-A3B-v3.1 | 35,95B (3B activos) | no disponible | apache-2.0 | safetensors | Base original sin expertos lingüísticos añadidos |

No se dispone de datos de benchmarks de modelos de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- En ficción creativa con temperatura alta puede perder precisión morfológica; el autor recomienda temperature=0,2-0,3 y presence_penalty=0,3 para corrección y revisión en estonio.
- El footprint BF16 requiere aproximadamente 72 GB de VRAM, lo que limita su despliegue a hardware profesional.
- La cobertura lingüística se limita a inglés, estonio y finlandés; otros idiomas no están garantizados.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en terminología técnica muy específica o dominios poco representados.
- La licencia apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece soporte formal.
- La cuantización NVFP4 está atada a GPUs Blackwell; en hardware anterior es necesario usar las variantes AWQ o GGUF.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación independiente de la comunidad.
- Los benchmarks declarados provienen del autor y no se han verificado de forma externa.

## Enlaces

- [Hugging Face: Kataguru-Sceptic-35B-A3B-Estonian-v3.2-NVFP4](https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Estonian-v3.2-NVFP4)
- [Hugging Face: Kataguru-Sceptic-35B-A3B-Estonian-v3.2 (BF16)](https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Estonian-v3.2)
- [Hugging Face: Kataguru-Sceptic-35B-A3B-Estonian-v3.2-W4A16-AWQ](https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Estonian-v3.2-W4A16-AWQ)
- [Hugging Face: Kataguru-Sceptic-35B-A3B-Estonian-v3.2-GGUF](https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Estonian-v3.2-GGUF)
- [Hugging Face: Kataguru-Sceptic-35B-A3B-Basque-v3.2](https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Basque-v3.2)
- [Hugging Face: Kataguru-Sceptic-35B-A3B-v3.1 (modelo base)](https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1)
