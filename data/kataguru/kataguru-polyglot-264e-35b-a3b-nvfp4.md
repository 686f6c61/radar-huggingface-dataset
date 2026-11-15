# kataguru/Kataguru-Polyglot-264E-35B-A3B-NVFP4

## Resumen

Kataguru-Polyglot-264E-35B-A3B-NVFP4 es un modelo de lenguaje multimodal (texto e imagen) de tipo Mixture-of-Experts desarrollado por Datasein Oy (Finlandia), con Jari Katajisto como arquitecto jefe. Se construye sobre el núcleo Kataguru-Sceptic-35B-A3B-v3.1 (a su vez derivado de Qwen3.5-35B-A3B) y expande el enrutador a 264 expertos: 254 expertos universales congelados orientados a STEM, código, razonamiento y tool calling, mas 10 expertos dedicados, uno por cada idioma objetivo (finés, estonio, húngaro, lituano, letón, islandés, euskera, georgiano, galés y turco), además del inglés. El objetivo declarado es cubrir las 110 parejas lingüísticas directas sin necesidad de pivote en inglés ni hooks de runtime externos.

La versión publicada aquí es la variante NVFP4 nativa para Blackwell, cuantizada con compressed-tensors a 4 bits en punto flotante, con un peso en disco de 23,32 GiB y 36.984.293.232 parámetros totales. Mantiene intactos el codificador visual ViT de 27 capas (333 tensores) y la cabeza especulativa MTP, y emplea enrutamiento Top-8 con aproximadamente 3B parámetros activos por token (A3B).

Su relevancia actual radica en dos factores: por un lado, ofrece inferencia de un MoE de 35B en una sola GPU de 24 GB o superior gracias al formato FP4; por otro, ataca un nicho poco cubierto, el multilingüismo en lenguas urálicas, bálticas y otras de morfología aglutinante o de bajos recursos, con expertos dedicados en lugar de un simple ajuste fino. La licencia Apache-2.0 facilita su uso comercial, aunque los pesos maestros en BF16 y los datos de entrenamiento permanecen privados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (tipo Qwen3.5 MoE), con encoder de visión ViT de 27 capas y cabeza especulativa MTP |
| Parametros totales | 36.984.293.232 (≈36,98B) |
| Parametros activos | Aproximadamente 3B (enrutamiento Top-8 sobre 264 expertos, esquema A3B) |
| Longitud de contexto | No disponible de forma explícita; la configuración de referencia de vLLM usa `--max-model-len 65536` |
| Tipos de cuantizacion | NVFP4 (FP4 nativo Blackwell) mediante compressed-tensors; existen variantes W4A16-AWQ y GGUF (APEX-Trio) en la suite |
| Idiomas soportados | en, fi, et, hu, lt, lv, is, eu, ka, cy, tr |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, NVFP4); 23,32 GiB en disco |

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 264 expertos por capa y enrutamiento Top-8, lo que activa unos 3B parámetros por token sobre un total de casi 37B. Sobre el núcleo Qwen3.5-35B-A3B / Kataguru-Sceptic-35B-A3B-v3.1 se aplicaron tres modificaciones principales: la expansión del enrutador a 264 expertos, una calibración de atención denominada Stage-B attention-only linear soup (combinación `0.55*v1 + 0.50*v2` aplicada a 190 de 1835 tensores de atención y normalización, sin deriva en expertos ni enrutador) y un proceso de "uncensoring" SOMA/ARA. Los 254 expertos del núcleo permanecen congelados; los 10 expertos de idioma ocupan slots dedicados.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. La model card indica que los pesos maestros en BF16 y las bases de datos de entrenamiento curadas son privados. Sí se documenta una innovación destacable: la capacidad de traducción directa entre las 110 parejas de idiomas sin pivote en inglés y sin hooks de runtime, con una degradación medida de +0,46 % en NLL respecto al núcleo (`V_gen`). También se conserva la cabeza especulativa MTP para decodificación especulativa.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modos de pensamiento conmutables mediante etiquetas `{REASON:...}` y modos operativos `[INSPECT]`, `[CURATE]`, `[SURGEON]` y `[DECISION]`.
- Comprensión de imágenes: pipeline image-text-to-text con encoder ViT de 27 capas.
- Programación y código en múltiples lenguajes, con evaluación específica en Python, Java y JavaScript.
- Tool calling y function calling, con parser compatible con vLLM (`qwen3_coder`) y `--enable-auto-tool-choice`.
- Capacidades agénticas y razonamiento multi-paso orientadas a flujos con herramientas.
- Traducción directa cross-lingual entre 11 idiomas sin pivote en inglés, mediante prefijo `/translate /<target>`.
- RAG cross-lingual: admite paso de `documents=[...]` en `apply_chat_template` o prefijo `/rag /<target>`.
- STEM y matemáticas, con resultados destacados en GSM8K, GPQA Diamond y MedQA.
- Multilingüismo con expertos dedicados para finés, estonio, húngaro, lituano, letón, islandés, euskera, georgiano, galés y turco.
- Modo "uncensored" (SOMA/ARA) que relaja los rechazos por defecto del modelo base.

## Casos de uso

- Traducción directa en lenguas de bajos recursos: el modelo traduce entre finés, estonio, húngaro, lituano, letón, islandés, euskera, georgiano, galés y turco sin pasar por inglés, usando el prefijo `/translate /<target>`. Es adecuado para localización de documentación técnica y atención al ciudadano en administraciones nórdicas y bálticas.
- RAG cross-lingual: se pueden indexar documentos en una lengua y consultar en otra pasando `documents=[...]` al chat template; los expertos de idioma dedicados reducen la pérdida de matices en la recuperación y generación de respuestas.
- Asistencia a la programación en producción: con tool calling nativo y parser `qwen3_coder` en vLLM, se integra en pipelines de CI/CD para revisión de código, generación de tests y corrección automática, con soporte específico para Python, Java y JavaScript.
- Agentes autónomos con herramientas: el enrutamiento Top-8 y los modos `[DECISION]` y `{REASON:logic}` permiten construir agentes multi-paso que planifican, invocan APIs y validan resultados en entornos con presupuesto de VRAM limitado.
- Análisis de documentos con imagen: al ser image-text-to-text, puede procesar capturas, formularios escaneados o diagramas junto con texto, útil en digitalización de archivos y extracción de datos estructurados.
- Razonamiento STEM y médico asistido: con resultados de 68,18 % en GPQA Diamond y 85,55 % en MedQA, sirve como apoyo a la formación técnica y a la revisión de literatura científica en inglés y en las lenguas cubiertas.
- Despliegue en una sola GPU de 24 GB: el formato NVFP4 (23,32 GiB) permite servir el modelo en estaciones de trabajo con RTX 5090 o similares, habilitando prototipado local sin infraestructura de centro de datos.

## Benchmarks y rendimiento

Resultados publicados por el autor (NVFP4, 2x RTX 5090 con TP=2, CUDAGraphs, `--max-model-len 65536`):

| Benchmark | Resultado |
|---|---|
| Media de 15 benchmarks | 69,70 % |
| Media cognitiva de 11 tareas | 71,77 % |
| BoolQ | 90,40 % |
| GSM8K | 87,64 % |
| MedQA | 85,55 % |
| ARC-Easy | 84,51 % |
| PIQA | 83,35 % |
| HellaSwag | 82,24 % |
| GPQA Diamond | 68,18 % (135/198) |
| IFEval Prompt Strict | 68,39 % |
| IFEval Inst Strict | 76,62 % |
| LiveCodeBench v6 (Pass@1) | 36,00 % (175 problemas) |
| BFCL V4 Single-Turn AST | 83,47 % |
| BFCL V4 Python Simple | 93,50 % |
| BFCL V4 Java | 65,00 % |
| BFCL V4 JavaScript | 74,00 % |
| BFCL V4 Multiple | 96,00 % |
| BFCL V4 Parallel | 92,00 % |
| Cross-lingual `V_gen` (ΔNLL vs núcleo) | +0,46 % |
| Cross-lingual Live-14 (`think=False`) | 13/14 |
| Cross-lingual Heldout-17 (`think=False`) | 16/17 |
| Cross-lingual Live-14 (`think=True`) | 10/14 |
| Cross-lingual Heldout-17 (`think=True`) | 16/17 |

No se han publicado en la información disponible comparaciones directas con modelos de referencia de la misma categoría.

## Requisitos de hardware

- VRAM estimada: aproximadamente 23,32 GiB solo para pesos en NVFP4; con caché KV y contexto de 65.536 tokens conviene reservar 24 GB o más por GPU.
- GPU recomendadas: Blackwell con soporte FP4 nativo, como RTX 5090 (configuración de referencia con 2 unidades en TP=2) o GPUs de centro de datos de la misma generación.
- Cabe en GPU de consumo: sí, en RTX 5090 (24 GB) o superiores; en GPUs sin soporte FP4 nativo habrá que recurrir a las variantes W4A16-AWQ o GGUF de la suite.
- Opciones de despliegue: vLLM con `--quantization compressed-tensors`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder` y `--reasoning-parser qwen3`; variantes GGUF (APEX-Small, APEX-Medium, APEX-Good con `mmproj`) para llama.cpp y entornos basados en GGUF.
- Latencia y throughput: no disponibles de forma numérica en la información proporcionada; la configuración medida emplea CUDAGraphs y tensor parallel 2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kataguru-Polyglot-264E-35B-A3B-NVFP4 | ≈36,98B totales, ≈3B activos | Hasta 65.536 en config de referencia | Apache-2.0 | Pesos NVFP4, W4A16-AWQ y GGUF | Multilingüe con 10 expertos de idioma dedicados; multimodal |
| Qwen3.5-35B-A3B (modelo base de origen) | ≈35B totales, ≈3B activos | No disponible | Según versión original | Pesos originales del autor | Sin expansión a 264 expertos ni expertos de idioma |
| Kataguru-Sceptic-35B-A3B-v3.1 (base directa) | ≈35B totales, ≈3B activos | No disponible | No disponible | Pesos cuantizados | Núcleo de 254 expertos congelados; sin slots de idioma |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Traducción cross-lingual no determinista en modo `think=True`: baja a 10/14 en Live-14 frente a 13/14 con `think=False`; para formato de traducción directa conviene desactivar el razonamiento intermedio.
- Los pesos maestros en BF16 y los datasets de entrenamiento son privados, lo que impide auditar el proceso de entrenamiento y replicar los resultados.
- El proceso de "uncensoring" SOMA/ARA relaja los rechazos del modelo base; en producción conviene añadir filtros y políticas de contenido propias.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en dominios STEM y médico donde los benchmarks no garantizan corrección factual.
- Cobertura lingüística limitada a los 11 idiomas declarados; no se documenta rendimiento en otras lenguas.
- El formato NVFP4 requiere hardware Blackwell para aprovechar la aceleración; en GPUs anteriores hay que usar las variantes AWQ o GGUF, con posible degradación de calidad no cuantificada en la información disponible.
- El modelo se publicó en noviembre de 2026 con 0 descargas y 0 likes, por lo que carece de validación independiente de la comunidad.
- Aunque la licencia es Apache-2.0, el uso comercial debe verificar las obligaciones heredadas del modelo base Qwen3.5 y de la variante Sceptic.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kataguru/Kataguru-Polyglot-264E-35B-A3B-NVFP4
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Polyglot-264E-35B-A3B-W4A16-AWQ
- Variante GGUF (APEX-Trio): https://huggingface.co/kataguru/Kataguru-Polyglot-264E-35B-A3B-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Perfil del autor: https://huggingface.co/kataguru
