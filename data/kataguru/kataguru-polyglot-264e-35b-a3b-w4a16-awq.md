# kataguru/Kataguru-Polyglot-264E-35B-A3B-W4A16-AWQ

## Resumen
Kataguru-Polyglot-264E-35B-A3B-W4A16-AWQ es la versión cuantizada en INT4 (W4A16-AWQ, formato `compressed-tensors`) del modelo Kataguru-Polyglot-264E-35B-A3B, desarrollado por la empresa finlandesa Datasein Oy (arquitecto jefe: Jari Katajisto). Se trata de un modelo de mezcla de expertos (MoE) construido sobre el núcleo de Kataguru-Sceptic-35B-A3B-v3.1 (a su vez derivado de Qwen3.5-35B-A3B) que amplía el enrutador a 264 expertos: 254 expertos universales congelados de STEM, código, herramientas y razonamiento, más 10 ranuras dedicadas a idiomas con morfología aglutinante o de bajos recursos (finés, estonio, húngaro, lituano, letón, islandés, euskera, georgiano, galés y turco), además del inglés.

El modelo resuelve dos problemas concretos: por un lado, ofrece traducción y generación multilingüe directa entre los 11 idiomas soportados sin pivote intermedio en inglés, mediante una calibración de atención "linear-soup" que evita hooks en tiempo de ejecución; por otro lado, empaqueta 36.984.293.232 parámetros totales con enrutamiento Top-8 (activos ~3B, de ahí la nomenclatura A3B) en unos 19,98 GiB de pesos, lo que permite desplegarlo en una sola GPU de 24 GB o más.

Es relevante ahora porque combina capacidades multimodales (visión mediante un codificador ViT de 27 capas), tool calling, razonamiento STEM y cobertura de idiomas europeos habitualmente desatendidos, todo bajo licencia Apache-2.0 y con un formato AWQ compatible con vLLM, lo que reduce la barrera de despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Qwen3.5 MoE, `qwen3_5_moe`), 27 capas, con codificador de visión ViT de 27 capas y cabeza especulativa MTP |
| Parametros totales | 36.984.293.232 (~37B) |
| Parametros activos | ~3B (enrutamiento Top-8, nomenclatura A3B) |
| Longitud de contexto | Nativa de Qwen3.5-35B-A3B (valor exacto no disponible); en el ejemplo de despliegue se configura `--max-model-len 65536` |
| Tipos de cuantizacion | W4A16-AWQ (INT4 pesos, activaciones en FP16) con `group_size=32`, formato `compressed-tensors`, compatible con kernels Marlin; existe también una versión NVFP4 y una familia GGUF (APEX-Trio + `mmproj`) |
| Idiomas soportados | en, fi, et, hu, lt, lv, is, eu, ka, cy, tr (11 idiomas, con 110 pares directos de traducción) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors cuantizados (AWQ / `compressed-tensors`), ~19,98 GiB en disco; repo total 21,5 GB |

## Arquitectura y entrenamiento
El modelo es un transformer MoE con 264 expertos por capa y enrutamiento Top-8. La modificación principal respecto a su base consiste en la expansión del enrutador de 254 a 264 expertos: los 254 originales (STEM, código, herramientas agénticas y razonamiento) se mantienen congelados, y se añaden 10 ranuras de un solo experto, una por idioma objetivo. La adaptación se realizó mediante una "linear-soup" de solo atención (Stage-B), que combina dos variantes con pesos 0,55·v1 + 0,50·v2 sobre 190 de los 1835 tensores de atención y normalización, sin deriva en expertos ni en el enrutador. Esto permite el enrutamiento entre los 110 pares de idiomas sin hooks externos en tiempo de ejecución.

No se modificaron el codificador de visión ViT de 27 capas (333 tensores), la cabeza especulativa MTP (decodificación especulativa) ni la ventana de contexto nativa. El modelo incorpora además un mecanismo de "uncensoring" denominado SOMA/ARA y una plantilla de chat multi-modo (`chat_template.jinja`) con etiquetas operativas como `[INSPECT]`, `[CURATE]`, `[SURGEON]`, `[DECISION]` y modificadores de razonamiento `{REASON:...}`. Los detalles sobre volumen de tokens de entrenamiento, composición del dataset y uso de RLHF/DPO no están disponibles en la información proporcionada; los pesos maestros en BF16 y las bases de datos de entrenamiento permanecen privados.

## Capacidades
- Generación de texto y razonamiento multi-paso, con modo de pensamiento (`think=True/False`) y modificadores de estilo de razonamiento.
- Capacidades STEM y matemáticas: resolución de problemas de nivel doctorado (GPQA Diamond) y aritmética (GSM8K).
- Generación y comprensión de código en múltiples lenguajes (Python, Java, JavaScript), con soporte de tool calling y function calling (parser `qwen3_coder` en vLLM).
- Comportamiento agéntico: llamadas a herramientas en modo simple, múltiple y paralelo, integrable en bucles de agente.
- Multimodalidad visión-lenguaje: pipeline `image-text-to-text` con codificador ViT de 27 capas.
- Multilingüismo nativo en 11 idiomas, con traducción directa sin pivote inglés mediante el prefijo `/translate /<target>`.
- RAG entre idiomas: paso de documentos mediante `documents=[...]` en `apply_chat_template` o prefijo `/rag /<target>`.
- Modo "uncensored" (SOMA/ARA) que relaja los filtros de rechazo del modelo base.
- Decodificación especulativa mediante cabeza MTP.

## Casos de uso
- Traducción directa entre lenguas de bajos recursos: un servicio de traducción para combinaciones como finés-georgiano o euskera-turco puede invocar el modelo con `/translate /<target>` y obtener salida sin pivote inglés, aprovechando las 10 ranuras de experto dedicadas.
- RAG multilingüe en administraciones públicas: recuperación de documentos en finés, estonio o húngaro y respuesta en el idioma del usuario pasando los fragmentos vía `documents=[...]`, útil para sistemas de atención ciudadana en países nórdicos y bálticos.
- Asistente de código en producción: integración en pipelines de CI/CD o IDE mediante tool calling y el parser `qwen3_coder`, con generación de parches y llamadas a funciones en Python, Java y JavaScript.
- Agentes autónomos con herramientas: el soporte de llamadas múltiples y paralelas (BFCL V4 con 96 % en múltiple y 92 % en paralelo) lo hace adecuado para orquestadores que consultan varias APIs en un solo turno.
- Análisis de documentos con imágenes: extracción de información de capturas, diagramas o formularios escaneados combinando el codificador ViT con razonamiento textual.
- Tutoría STEM en idiomas minoritarios: explicaciones de matemáticas y ciencias en galés, islandés o lituano, donde los modelos generalistas suelen degradar la calidad.
- Despliegue en una sola GPU de 24 GB: prototipado y servicios internos con vLLM en una RTX 4090 o A10G, al ocupar los pesos unos 19,98 GiB.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Media de 15 benchmarks (NVFP4, 2x RTX 5090, TP=2) | 69,70 % |
| Media cognitiva de 11 tareas | 71,77 % |
| BoolQ | 90,40 % |
| GSM8K | 87,64 % |
| MedQA | 85,55 % |
| ARC-Easy | 84,51 % |
| PIQA | 83,35 % |
| HellaSwag | 82,24 % |
| GPQA Diamond | 68,18 % (135/198) |
| IFEval Prompt / Inst Strict | 68,39 % / 76,62 % |
| LiveCodeBench v6 (Pass@1) | 36,00 % (175 problemas) |
| BFCL V4 Single-Turn AST | 83,47 % |
| BFCL V4 Python Simple / Java / JavaScript / Multiple / Parallel | 93,50 % / 65,00 % / 74,00 % / 96,00 % / 92,00 % |
| Prueba cross-lingual sin hooks (ΔNLL) | +0,46 % frente al núcleo |
| Traducción Live-14 / Heldout-17 (`think=False`) | 13/14 y 16/17 |
| Traducción Live-14 / Heldout-17 (`think=True`) | 10/14 y 16/17 |

Los resultados publicados corresponden a la versión NVFP4 en 2x RTX 5090 con TP=2; no se han publicado cifras específicas para esta variante AWQ en la información disponible.

## Requisitos de hardware
- VRAM estimada: los pesos ocupan unos 19,98 GiB; con caché KV para contexto largo se recomienda al menos 24 GB por GPU en despliegues de una sola tarjeta, y 2x 24 GB para `--max-model-len 65536`.
- GPU recomendadas: RTX 5090 (configuración de referencia con TP=2), A100 40/80 GB, H100, L40S; en consumer, RTX 4090 de 24 GB para contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090/5090 de 24 GB con contexto reducido; para la ventana completa de 65 536 tokens se necesita más memoria o tensor parallelism.
- Opciones de despliegue: vLLM con `--quantization compressed-tensors` (soporte de kernels Marlin), y la familia GGUF APEX-Trio con `mmproj` para llama.cpp/Ollama.
- Latencia y throughput: no disponibles en la información proporcionada; la cabeza MTP permite decodificación especulativa para reducir latencia.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kataguru-Polyglot-264E-35B-A3B-W4A16-AWQ | ~37B / ~3B (MoE Top-8) | Nativa Qwen3.5 (65 536 en despliegue de referencia) | Apache-2.0 | 11 idiomas, visión, AWQ INT4, ~20 GiB |
| Qwen3.5-35B-A3B (base) | ~35B / ~3B (MoE) | Nativa Qwen3.5 | Apache-2.0 (según modelo base) | Sin las 10 ranuras idiomáticas ni el ajuste SOMA/ARA |
| Kataguru-Sceptic-35B-A3B-v3.1 | ~35B / ~3B (MoE) | Nativa | Apache-2.0 | Modelo base directo, sin expansión a 264 expertos |
| Versión NVFP4 del mismo modelo | ~37B / ~3B | Igual | Apache-2.0 | Formato NVFP4 para Blackwell; media de 69,70 % en 15 benchmarks |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada para establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias
- La traducción directa en modo `think=False` obtiene 13/14 en Live-14 y 16/17 en Heldout-17; en `think=True` baja a 10/14 en Live-14, por lo que conviene usar `think=False` para traducción determinista.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas de factualidad más allá de los benchmarks citados.
- El modo "uncensored" (SOMA/ARA) puede producir contenido que los filtros del modelo base rechazarían; requiere revisión y moderación adicional en producción.
- La cobertura lingüística se limita a los 11 idiomas declarados; el rendimiento en otros idiomas no está evaluado.
- Los pesos maestros BF16 y los datos de entrenamiento son privados; solo se publican los pesos cuantizados, lo que limita la reproducibilidad del ajuste.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso en producción documentado.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones del modelo base Qwen3.5-35B-A3B antes de un uso comercial a gran escala.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/kataguru/Kataguru-Polyglot-264E-35B-A3B-W4A16-AWQ
- Versión NVFP4: https://huggingface.co/kataguru/Kataguru-Polyglot-264E-35B-A3B-NVFP4
- Versión GGUF: https://huggingface.co/kataguru/Kataguru-Polyglot-264E-35B-A3B-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Perfil del autor: https://huggingface.co/kataguru
