# kataguru/Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-NVFP4

## Resumen

Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-NVFP4 es la variante cuantizada en formato NVFP4 (FP4 de NVIDIA para arquitecturas Blackwell) del modelo lituano de la familia Kataguru Sceptic, desarrollado por el usuario kataguru. Se trata de un modelo de mezcla de expertos (MoE) de 35.951.822.704 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, construido sobre el modelo base kataguru/Kataguru-Sceptic-35B-A3B-v3.1. Su propósito es ofrecer razonamiento científico, generación de código, tool calling y traducción bidireccional de página completa con especial atención al lituano, manteniendo intactas las capacidades del modelo original.

La innovación principal de la versión v3.2 es la ampliación del MoE de 254 a 256 expertos por capa en las 40 capas: los expertos #0 a #253 permanecen congelados para preservar el rendimiento original, mientras que los expertos #254 (gramática, morfología y terminología técnica lituanas) y #255 (literatura, no ficción y traducción bidireccional EN-LT) se añaden específicamente para el idioma lituano. El modelo también conserva un codificador de visión multimodal de 27 capas y una cabeza especulativa MTP en la capa 40.

Esta ficha cubre la variante NVFP4 (aproximadamente 24,3 GB), calibrada con un conjunto específico en lituano y pensada para desplegarse en GPUs Blackwell, incluyendo configuraciones de 2x RTX 5090 de 32 GB con tensor parallelism. La licencia es Apache 2.0 y el modelo soporta inglés, lituano y finés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), 256 expertos por capa en 40 capas, con codificador de visión de 27 capas y cabeza MTP especulativa en la capa 40 |
| Parametros totales | 35.951.822.704 |
| Parametros activos | Aproximadamente 3.000 millones por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (FP4 nativo Blackwell, compressed-tensors); la familia incluye tambien BF16, W4A16-AWQ y GGUF (APEX-Small, APEX-Medium, APEX-Good) |
| Idiomas soportados | Ingles (en), lituano (lt), fines (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, NVFP4); el repositorio ocupa 25,6 GB |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con 256 expertos por capa repartidos en 40 capas, de los cuales 254 son el núcleo congelado heredado de Kataguru-Sceptic-35B-A3B-v3.1 y 2 son expertos nuevos especializados en lituano. La congelación del núcleo busca evitar el olvido catastrófico de las capacidades originales de razonamiento científico, código y tool calling. El entrenamiento de los nuevos expertos se realizó sobre un banco de 5.075 muestras doradas verificadas humanamente, con calibración contrastiva del router mediante el modo `new_experts_only` y `recalibrate-router` con r=32 y alpha=64. Se añadió además una plantilla de chat nativa en lituano con etiquetas de control `/lt` y `/translate`, y cabeceras de razonamiento localizadas.

La cuantización NVFP4 se calibró con el fichero `calib_nvfp4_awq_256_lt.jsonl` y `imatrix_calibration_lt.txt`, combinando calibración en lituano con anclas de STEM y código. El modelo conserva el codificador de visión multimodal de 27 capas (333 tensores) y la cabeza MTP de decodificación especulativa de la capa 40 (785 tensores), lo que permite acelerar la generación. La información disponible no detalla el número total de tokens de entrenamiento del modelo base ni la composición completa del dataset original, ni confirma si hubo RLHF o DPO en la fase fundacional.

## Capacidades

- Generación de texto y razonamiento científico de nivel graduate (física, química, biología molecular) heredado del núcleo congelado.
- Programación competitiva y algorítmica (LiveCodeBench v6 Pass@1 del 39,43 % en el modelo base).
- Tool calling y function calling nativo con etiquetas `<tool_call>` y detección de irrelevancia (BFCL V4 AST del 83,67 %).
- Capacidades multimodales de visión: pipeline image-text-to-text con codificador de 27 capas.
- Traducción bidireccional de página completa entre inglés, finés y lituano mediante el modo `/translate`, con preservación de párrafos y ausencia de charla adicional.
- Modo de razonamiento configurable con niveles `{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}` y `{REASON:off}`.
- Soporte nativo de lituano con plantilla de chat dedicada y cabeceras de razonamiento localizadas.
- Capacidades de ingeniería industrial (PLC/CNC), medicina clínica y terminología jurídica y de patentes, según declara el autor.
- Contexto largo de 262.144 tokens para conversaciones multi-turno y documentos extensos.

## Casos de uso

- Traducción profesional EN-LT y FI-LT: el modo `/translate` permite traducir páginas completas de prosa literaria, no ficción y documentación técnica preservando la estructura de párrafos y sin texto conversacional adicional, gracias al experto #255 y a la plantilla dedicada.
- Atención al cliente en lituano: el modelo gestiona conversaciones multi-turno con 262.144 tokens de contexto y una plantilla de chat nativa que mantiene el registro y la morfología correctos en lituano.
- Asistencia técnica en ingeniería industrial: con terminología PLC/CNC y médica en el experto #254, puede redactar y revisar documentación técnica, manuales y procedimientos en lituano e inglés.
- Agentes con tool calling: la puntuación BFCL V4 AST del 83,67 % y la detección de irrelevancia del 80,26 % lo hacen adecuado para orquestar llamadas a APIs en pipelines de automatización, con decodificación especulativa MTP para reducir latencia.
- Análisis de documentos con visión: al ser image-text-to-text, puede procesar capturas, escaneos y figuras junto con texto, útil para digitalización y revisión de documentación técnica o legal.
- Razonamiento científico y revisión de literatura: el núcleo congelado conserva GPQA Diamond del 70,20 %, lo que permite usarlo como asistente de revisión en dominios de física, química y biología molecular.
- Generación de código en producción: con LiveCodeBench v6 del 39,43 % y tool calling nativo, puede integrarse en pipelines de CI/CD para generación de tests, revisión de parches y automatización de tareas algorítmicas.
- Procesamiento de documentación jurídica y de patentes en lituano: el experto #254 cubre terminología estatutaria y de patentes, adecuado para extracción y traducción de cláusulas con contexto largo.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks del nucleo | 70,26 % | Heredado intacto de los expertos #0..#253 congelados |
| GPQA Diamond | 70,20 % (139/198) | Nivel graduate en física, química y biología molecular |
| LiveCodeBench v6 (Pass@1) | 39,43 % (Easy: 90,70 %) | Programación algorítmica competitiva |
| BFCL V4 Single-Turn AST | 83,67 % (Non-Live: 88,44 %) | Tool calling; deteccion de irrelevancia 80,26 % |
| Auditoria lituana en vivo 10/10 | 10/10 PASS (100 %) | MMLU-LT, ARC-LT, GSM8K-LT, TruthfulQA-LT y traduccion literaria/tecnica EN-LT |

No se han publicado en la información disponible resultados desglosados por benchmark de la variante NVFP4 frente a la BF16, más allá de la auditoría lituana 10/10.

## Requisitos de hardware

- VRAM para NVFP4: aproximadamente 24,3 GB de pesos; el autor indica que funciona en 1 GPU de 32 GB o en 2x RTX 5090 de 32 GB con tensor parallelism (TP=2).
- VRAM para BF16 completo: aproximadamente 72 GB, requiere 2 GPUs de 48-80 GB.
- VRAM para W4A16-AWQ: aproximadamente 25,3 GB.
- VRAM para GGUF APEX-Medium: aproximadamente 13,6 GiB, cabe en una única GPU de 16 GB.
- GPUs recomendadas: Blackwell (RTX 5090, B200) para NVFP4 nativo; A100/H100 para BF16 o AWQ.
- Cabe en GPU de consumo: sí, en RTX 5090 (32 GB) para NVFP4 y en GPUs de 16 GB para GGUF APEX-Medium.
- Opciones de despliegue: transformers, vLLM (variante W4A16-AWQ), llama.cpp/Ollama (GGUF); la model card menciona `endpoints_compatible`.
- Latencia y throughput: no disponibles de forma numérica; se dispone de cabeza MTP especulativa que puede reducir la latencia de decodificación, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-NVFP4 | 35,95 B totales, ~3 B activos | 262.144 | GPQA 70,20 %, BFCL V4 83,67 %, media 15 benchmarks 70,26 % | Apache 2.0 | Hugging Face, cuantizaciones BF16/AWQ/GGUF |
| Kataguru-Sceptic-35B-A3B-v3.1 (modelo base) | 35,95 B totales, ~3 B activos | 262.144 | Mismos benchmarks del nucleo | Apache 2.0 | Hugging Face |
| Alternativas comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de otros modelos comparables de tamaño o tarea equivalente para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- En ficción creativa con temperatura alta puede perder precisión morfológica en lituano; el autor recomienda `temperature=0.2–0.3` y `presence_penalty=0.3` para tareas estrictas de corrección y morfología.
- El rendimiento declarado en benchmarks corresponde al modelo base v3.1; la variante NVFP4 puede presentar degradación por cuantización no cuantificada en la información disponible.
- El núcleo de 254 expertos está congelado, por lo que las mejoras en razonamiento general dependen del modelo base y no de esta versión.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan tasas específicas de alucinación.
- Cobertura idiomática limitada a inglés, lituano y finés; no se garantiza un comportamiento equivalente en otros idiomas.
- El contexto de 262.144 tokens exige hardware con VRAM suficiente; en configuraciones de 16 GB (GGUF APEX-Medium) el contexto efectivo puede verse reducido.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios no cubiertos por el banco de 5.075 muestras.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validación comunitaria independiente publicada.

## Enlaces

- Modelo NVFP4 en Hugging Face: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-NVFP4
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2
- Variante W4A16-AWQ para vLLM: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-W4A16-AWQ
- Variantes GGUF APEX: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
