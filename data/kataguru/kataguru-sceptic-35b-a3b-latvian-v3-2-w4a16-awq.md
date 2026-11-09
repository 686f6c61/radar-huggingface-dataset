# kataguru/Kataguru-Sceptic-35B-A3B-Latvian-v3.2-W4A16-AWQ

## Resumen

Kataguru-Sceptic-35B-A3B-Latvian-v3.2-W4A16-AWQ es una cuantización INT4 (W4A16, formato AWQ empaquetado con `compressed-tensors`) del modelo multimodal de tipo Mixture-of-Experts Kataguru-Sceptic-35B-A3B-Latvian-v3.2, desarrollado por el usuario kataguru. El modelo base parte de Kataguru-Sceptic-35B-A3B-v3.1 y añade dos expertos especializados en letón sobre una base de 254 expertos congelados, manteniendo intactas las capacidades originales de razonamiento científico, código y uso de herramientas. Está pensado como un modelo "soberano" para letón: gramática, morfología, literatura y traducción bidireccional EN/LV, además de visión y razonamiento multimodal.

La arquitectura es un transformer MoE con 256 expertos por capa (254 congelados + 2 nuevos) repartidos en 40 capas, con 35.951.822.704 parámetros totales y aproximadamente 3B activos por token. Conserva el encoder de visión multimodal de 27 capas, la cabeza especulativa MTP de la capa 40 y una ventana de contexto de 262.144 tokens. Esta variante AWQ reduce el peso a unos 25,3 GB, lo que permite desplegarlo en vLLM sobre GPUs de 32 GB o en configuraciones tensor-parallel de 2x RTX 5090.

Es relevante ahora porque cubre un hueco poco atendido: modelos abiertos con calidad de razonamiento y tool calling de gama alta, pero con especialización real en una lengua báltica de bajos recursos como el letón, incluyendo traducción de página completa y preservación de formato. La licencia Apache 2.0 y el formato compatible con vLLM facilitan su adopción en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), `qwen3_5_moe`, 40 capas, 256 expertos por capa (254 congelados + 2 especializados en letón) |
| Parámetros totales | 35.951.822.704 (≈35,95B) |
| Parámetros activos | ≈3B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | W4A16-AWQ (INT4 pesos, activaciones FP16), `group_size=32`, observer MSE, `compressed-tensors` pack-quantized; existen también BF16, NVFP4 y GGUF APEX-Trio en la suite del autor |
| Idiomas soportados | Inglés (en), letón (lv), finés (fi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, `compressed-tensors`, AWQ W4A16) |

## Arquitectura y entrenamiento

El modelo es un MoE de tipo `qwen3_5_moe` con 40 capas y 256 expertos por capa. La estrategia de adaptación al letón consiste en congelar los 254 expertos del núcleo Sceptic (expertos #0 a #253) y añadir dos expertos nuevos: el experto #254, especializado en gramática y morfología del letón (7 casos gramaticales, 6 clases de declinación nominal, alternancias de palatalización báltica, modos verbales debitive y relativo) junto con terminología técnica industrial (PLC/CNC), médica y legal/patentes; y el experto #255, orientado a prosa literaria, no ficción, diálogo natural y traducción fiel EN↔LV. El entrenamiento se realizó sobre un banco de 4.805 muestras doradas verificadas humanamente, con calibración contrastiva del router (`--moe-mode new_experts_only --recalibrate-router`, `r=32`, `alpha=64`).

Se conservan sin cambios el encoder de visión multimodal de 27 capas (333 tensores), la cabeza especulativa MTP de la capa 40 (785 tensores) y la ventana de contexto de 262.144 tokens. La cuantización AWQ se calibró con un conjunto específico en letón (`calib_nvfp4_awq_256_lv.jsonl` e `imatrix_calibration_lv.txt`). El modelo incluye una plantilla de chat nativa en letón (`chat_template.jinja`) con etiquetas de control: `/lv` para modo letón nativo, `/translate` para traducción de página completa sin conversación adicional, y niveles de razonamiento `{REASON:spoon}`, `{REASON:einstein}`, `{REASON:007}`, `{REASON:deep}`, `{REASON:low}` y `{REASON:off}`. No se detalla en la información disponible el volumen total de tokens de entrenamiento ni la composición completa del dataset más allá del banco de muestras doradas.

## Capacidades

- Generación de texto y razonamiento científico de nivel graduado (hereda GPQA Diamond 70,20 % del núcleo congelado).
- Programación competitiva y algorítmica (LiveCodeBench v6 Pass@1 39,43 %, con 90,70 % en nivel Easy).
- Tool calling / function calling nativo con `<tool_call>` en formato AST y detección de irrelevancia (BFCL V4 Single-Turn AST 83,67 %).
- Razonamiento agéntico multi-paso, con niveles de profundidad de razonamiento configurables.
- Capacidades multimodales de visión: pipeline `image-text-to-text` con encoder de 27 capas.
- Traducción bidireccional EN↔LV de página completa con preservación de párrafos y modo sin conversación adicional (`/translate`).
- Modo letón nativo con plantilla de chat dedicada (`/lv`) y cabeceras de razonamiento localizadas.
- Capacidades multilingües en inglés, letón y finés.
- Dominio técnico declarado en terminología industrial PLC/CNC, medicina clínica y textos legales/patentes.
- Decodificación especulativa mediante cabeza MTP en la capa 40.

## Casos de uso

- Traducción profesional EN↔LV de documentos completos: el modo `/translate` preserva párrafos y evita conversación adicional, adecuado para localización de manuales técnicos, contratos y documentación de producto con terminología legal y de patentes.
- Atención al cliente en letón: la plantilla de chat nativa `/lv` y el experto de gramática/morfología permiten conversaciones multi-turno con corrección morfológica, apoyadas en la ventana de 262.144 tokens para historiales largos.
- Generación y revisión de código en pipelines de CI/CD: el tool calling con AST (83,67 % en BFCL V4) y LiveCodeBench permiten integrarlo como agente que invoca funciones de build, test y despliegue.
- Asistencia técnica industrial: el experto #254 cubre terminología PLC/CNC, útil para generar y revisar documentación de automatización industrial y procedimientos de mantenimiento.
- Análisis de documentos escaneados con visión: el encoder multimodal de 27 capas permite extraer y traducir contenido de imágenes o páginas escaneadas en flujos de digitalización.
- Redacción y edición literaria en letón: el experto #255 está orientado a prosa literaria, no ficción y diálogo natural, útil para editoriales que necesitan borradores o revisiones estilísticas.
- Investigación académica en lenguas bálticas: sirve como base para evaluación en MMLU-LV, ARC-LV y Commonsense-LV, y para experimentos de adaptación de MoE con expertos congelados.
- Despliegue en infraestructura moderada: al ocupar unos 25,3 GB en W4A16-AWQ, puede servirse en vLLM sobre una GPU de 32 GB o en TP=2 con 2x RTX 5090, lo que facilita prototipos y entornos de investigación con presupuesto limitado.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Media de 15 benchmarks del núcleo | 70,26 % | Heredado intacto de los expertos congelados #0–#253 |
| GPQA Diamond | 70,20 % (139/198) | Física, química y biología molecular de nivel graduado |
| LiveCodeBench v6 (Pass@1) | 39,43 % | Easy: 90,70 % |
| BFCL V4 Single-Turn AST | 83,67 % | Non-Live: 88,44 %; detección de irrelevancia: 80,26 % |
| Auditoría en vivo de letón 10/10 | 10/10 PASS (100 %) | Baltic LLM Evaluation Suite (MMLU-LV, ARC-LV, Commonsense-LV) y traducción literaria/técnica EN↔LV |

No se han publicado en la información disponible resultados desglosados por benchmark individual de los 15 que componen la media, ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para esta variante W4A16-AWQ: unos 25,3 GB de pesos, por lo que requiere aproximadamente 26–32 GB de VRAM según overhead de KV cache y contexto.
- GPU recomendadas: una GPU de 32 GB para esta variante; el autor indica 2x RTX 5090 32 GB con tensor-parallel (TP=2) como configuración de referencia.
- BF16 completo: requiere unos 72 GB de VRAM (2x 48–80 GB), según el autor.
- NVFP4: unos 24,3 GB, orientado a GPUs Blackwell.
- GGUF APEX-Medium: unos 13,6 GiB, cabe en una única GPU de 16 GB.
- Opciones de despliegue: vLLM (formato nativo `compressed-tensors`/AWQ), llama.cpp/Ollama mediante la variante GGUF, y transformers con `compressed-tensors`. El autor etiqueta el modelo como `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| Kataguru-Sceptic-35B-A3B-Latvian-v3.2-W4A16-AWQ | 35,95B totales, ≈3B activos | 262.144 | Apache 2.0 | safetensors AWQ W4A16, vLLM | Especializado en letón, multimodal, tool calling |
| Kataguru-Sceptic-35B-A3B-Latvian-v3.2 (BF16) | 35,95B totales, ≈3B activos | 262.144 | Apache 2.0 | safetensors BF16 | Mismo modelo sin cuantizar, ~67,5 GB |
| Kataguru-Sceptic-35B-A3B-Latvian-v3.2-NVFP4 | 35,95B totales, ≈3B activos | 262.144 | Apache 2.0 | NVFP4, GPUs Blackwell | Variante de cuantización para Blackwell |
| Kataguru-Sceptic-35B-A3B-v3.1 | 35,95B totales, ≈3B activos | 262.144 | Apache 2.0 | safetensors | Modelo base sin especialización en letón |

No se dispone en la información proporcionada de comparaciones con modelos de otros desarrolladores de tamaño o tarea equivalentes.

## Limitaciones y advertencias

- En ficción creativa con temperatura alta puede perder precisión morfológica y de corrección en letón; el autor recomienda `temperature=0.2–0.3` y `presence_penalty=0.3` para tareas estrictas de morfología y revisión.
- El modelo es una cuantización INT4: puede presentar degradación frente al BF16 en tareas sensibles a precisión numérica, aunque no se publican métricas comparativas de la pérdida por cuantización.
- Riesgo de alucinación inherente a los modelos generativos; los benchmarks de razonamiento no eliminan este riesgo en dominios especializados como medicina o patentes.
- Cobertura lingüística limitada a inglés, letón y finés; no se declara soporte para castellano ni otras lenguas.
- La especialización en letón se apoya en un banco de 4.805 muestras; el rendimiento fuera de los dominios cubiertos (gramática, literatura, terminología técnica) puede ser inferior.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni se documentan evaluaciones de sesgo.
- El tamaño del repositorio (26,2 GB) y la VRAM necesaria (≈32 GB) excluyen GPUs de consumo de gama media sin cuantizaciones adicionales (GGUF).
- Las fechas de creación y actualización del modelo (noviembre de 2026) y el contador de descargas y likes a cero indican que se trata de un lanzamiento muy reciente y sin validación independiente por parte de la comunidad.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Latvian-v3.2-W4A16-AWQ
- Pesos maestros BF16 v3.2: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Latvian-v3.2
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Latvian-v3.2-NVFP4
- Variante GGUF APEX-Trio: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-Latvian-v3.2-GGUF
- Modelo base v3.1: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
