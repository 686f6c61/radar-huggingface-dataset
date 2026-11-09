# kataguru/Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-W4A16-AWQ

## Resumen

Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-W4A16-AWQ es una cuantización INT4 (W4A16, empaquetado `compressed-tensors` con `group_size=32`) del modelo multimodal y de razonamiento Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2, publicado por el usuario kataguru en Hugging Face. Se trata de una arquitectura Mixture-of-Experts de tipo `qwen3_5_moe` con 35.951.822.704 parámetros totales y 3B parámetros activos por token, distribuidos en 40 capas con 256 expertos por capa. El modelo está especializado en lituano (gramática, morfología, literatura y traducción bidireccional EN-LT) y conserva el núcleo de razonamiento científico, código competitivo y tool calling del modelo base Sceptic 35B-A3B v3.1.

La relevancia de esta variante concreta es de despliegue: reduce el peso de los pesos BF16 originales (~67,5 GB) a unos 25,3 GB, lo que permite servir el modelo en vLLM sobre una única GPU de 32 GB o en configuraciones tensor-parallel de 2x RTX 5090. El modelo acepta entrada image-text-to-text (pipeline `image-text-to-text`), incorpora un encoder de visión de 27 capas y conserva la ventana de contexto de 262.144 tokens del modelo base.

La ficha se basa exclusivamente en los datos publicados en la model card y en los metadatos de Hugging Face. Varios detalles técnicos (composición exacta del dataset de entrenamiento, proceso de RLHF/DPO, resultados desglosados de benchmarks por idioma) no están disponibles en la información proporcionada y se indican como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) tipo `qwen3_5_moe`; 40 capas; 256 expertos por capa; encoder de visión de 27 capas; cabeza especulativa MTP en la capa 40 |
| Parametros totales | 35.951.822.704 (35,95 B) |
| Parametros activos | 3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W4A16-AWQ (INT4 pesos, activaciones FP16), `compressed-tensors` pack-quantized, `group_size=32`, observador MSE; también existe NVFP4 (~24,3 GB) y GGUF APEX-Trio (Small, Medium, Good + mmproj) en el suite oficial |
| Idiomas soportados | Inglés (en), lituano (lt), finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización AWQ W4A16); repo de 26,2 GB; librería `transformers` |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 40 capas y 256 expertos por capa. La arquitectura `v3.2` amplía el modelo base `Kataguru-Sceptic-35B-A3B-v3.1` añadiendo dos expertos especializados sobre los 254 expertos originales, que permanecen congelados: el experto #254 cubre gramática y morfología lituanas (siete casos gramaticales, flexión verbal y nominal compleja, terminología técnica, PLC/CNC, medicina clínica y patentes) y el experto #255 cubre literatura, no ficción y traducción bidireccional EN-LT. El entrenamiento de estos dos expertos se realizó sobre un banco de 5.075 muestras verificadas manualmente y una calibración contrastiva del router (`--moe-mode new_experts_only --recalibrate-router`, `r=32, alpha=64`).

El modelo conserva intactos los 254 expertos del núcleo original (razonamiento científico, código, tool calling, PLC/CNC industrial), el encoder multimodal de visión de 27 capas (333 tensores) y la cabeza especulativa MTP (785 tensores) para decodificación especulativa. La cuantización W4A16-AWQ se calibró específicamente para lituano mediante `calib_nvfp4_awq_256_lt.jsonl` e `imatrix_calibration_lt.txt`. No se dispone de información sobre el número total de tokens de entrenamiento del modelo base ni sobre el uso de RLHF o DPO en el proceso.

## Capacidades

- Generación de texto y razonamiento de nivel posgrado en STEM (física, química, biología molecular) heredado del núcleo congelado.
- Programación competitiva y algorítmica (LiveCodeBench v6 Pass@1 39,43 %).
- Tool calling / function calling nativo con AST `<tool_call>` y detección de irrelevancia (BFCL V4 83,67 %).
- Capacidades multimodales de visión: entrada image-text-to-text con encoder de 27 capas.
- Traducción bidireccional de página completa EN-LT mediante el modo `/translate`, con preservación de párrafos y cero charla.
- Modo de razonamiento configurable mediante etiquetas `{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}` y `{REASON:off}`.
- Plantilla de chat nativa en lituano (`chat_template.jinja`) con cabeceras de razonamiento localizadas y modo `/lt`.
- Capacidades multilingües en inglés, lituano y finés.
- Capacidades industriales específicas: PLC/CNC, terminología clínica y legal/patentes.
- Decodificación especulativa mediante cabeza MTP en la capa 40.

## Casos de uso

- Traducción profesional EN-LT de documentación técnica y literaria: el modo `/translate` permite traducir páginas completas preservando párrafos y sin conversación adicional, adecuado para editoriales, despachos de patentes y administraciones públicas lituanas.
- Atención al cliente en lituano: el experto #254 cubre morfología y casos gramaticales, lo que permite conversaciones multi-turno con 262.144 tokens de contexto para historiales largos de cliente.
- Generación de código en producción: el soporte nativo de tool calling con AST `<tool_call>` y la puntuación BFCL V4 de 83,67 % permiten integrarlo en pipelines de CI/CD y agentes de automatización.
- Análisis de documentos escaneados: la entrada image-text-to-text con encoder de visión de 27 capas permite extraer y razonar sobre facturas, formularios o planos técnicos.
- Automatización industrial: las capacidades PLC/CNC y de terminología de ingeniería permiten asistir en la generación y revisión de lógica de control y documentación técnica.
- Investigación científica asistida: GPQA Diamond de 70,20 % habilita su uso como asistente de razonamiento en física, química y biología molecular para investigadores lituanohablantes.
- Despliegue soberano en infraestructura propia: la cuantización W4A16-AWQ de 25,3 GB permite servir el modelo en una GPU de 32 GB, útil para organizaciones que exigen residencia de datos en Lituania o la UE.
- Revisión y corrección morfológica de textos lituanos: con `temperature=0.2–0.3` y `presence_penalty=0.3` el modelo mantiene precisión morfológica para tareas de proofreading.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks del núcleo | 70,26 % | Heredado intacto vía expertos congelados #0..#253 |
| GPQA Diamond | 70,20 % (139/198) | STEM de nivel doctorado |
| LiveCodeBench v6 (Pass@1) | 39,43 % | Easy: 90,70 % |
| BFCL V4 Single-Turn AST | 83,67 % | Non-Live: 88,44 %; detección de irrelevancia: 80,26 % |
| Auditoría lituana en vivo (10/10) | 10/10 PASS (100 %) | MMLU-LT, ARC-LT, GSM8K-LT, TruthfulQA-LT y traducción literaria/técnica EN-LT |

No se han publicado en la información disponible resultados desglosados por benchmark individual más allá de los indicados, ni comparaciones numéricas directas con modelos de la competencia.

## Requisitos de hardware

- VRAM estimada: ~25,3 GB para la variante W4A16-AWQ; ~24,3 GB para NVFP4; ~67,5 GB para BF16 completo; ~13,6 GiB para GGUF APEX-Medium.
- GPU recomendadas: 2x RTX 5090 de 32 GB en tensor-parallel (TP=2) o una única GPU de 32 GB para W4A16-AWQ y NVFP4; 2x GPU de 48–80 GB para BF16 (según la model card, ~72 GB de VRAM).
- Cabe en GPU de consumo: sí, en RTX 5090 de 32 GB (W4A16-AWQ o NVFP4) y en GPU de 16 GB con GGUF APEX-Medium.
- Opciones de despliegue: vLLM (variante W4A16-AWQ, etiqueta `endpoints_compatible`), llama.cpp / Ollama mediante los GGUF APEX-Trio, y `transformers` con `compressed-tensors`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-W4A16-AWQ | 35,95 B totales / 3B activos | 262.144 | Apache 2.0 | Hugging Face (este repo) |
| Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2 (BF16) | 35,95 B totales / 3B activos | 262.144 | Apache 2.0 | Hugging Face |
| Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-NVFP4 | 35,95 B totales / 3B activos | 262.144 | Apache 2.0 | Hugging Face |
| Kataguru-Sceptic-35B-A3B-v3.1 (base) | 35,95 B totales / 3B activos | 262.144 | Apache 2.0 | Hugging Face |

No se dispone en la información proporcionada de comparaciones con modelos de otros desarrolladores (por ejemplo, Qwen, Llama o Mistral) en la misma categoría de tamaño o tarea.

## Limitaciones y advertencias

- Ficción creativa a alta temperatura: la model card advierte que para precisión morfológica y de corrección en lituano conviene usar `temperature=0.2–0.3` con `presence_penalty=0.3`; a temperaturas altas la calidad morfológica puede degradarse.
- Riesgo de alucinación: no se documenta en la información disponible; como en todo modelo generativo, debe validarse en dominios críticos (legal, médico, industrial).
- Cobertura idiomática limitada a inglés, lituano y finés; no se garantiza rendimiento en otros idiomas.
- La cuantización INT4 W4A16 introduce una pérdida de precisión respecto a BF16 no cuantificada en la información disponible; para tareas de máxima precisión se recomienda la variante BF16.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y atribución correspondiente.
- El modelo base es una variante especializada de un modelo de autor único (kataguru) con 0 descargas y 0 likes en el momento de la consulta; la validación comunitaria es inexistente.
- El repo tiene 26,2 GB, por encima del tamaño nominal de los pesos (~25,3 GB), lo que debe tenerse en cuenta al planificar el almacenamiento y la descarga.
- No se documentan sesgos conocidos en la información proporcionada.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-W4A16-AWQ
- Pesos maestros BF16: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-NVFP4
- Variante GGUF APEX-Trio: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Lithuanian-v3.2-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
