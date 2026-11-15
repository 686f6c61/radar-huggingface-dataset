# kataguru/Kataguru-Polyglot-264E-35B-A3B

## Resumen

Kataguru-Polyglot-264E-35B-A3B es un modelo de lenguaje multimodal de tipo Mixture-of-Experts (MoE) desarrollado por Datasein Oy (Finlandia), con Jari Katajisto como arquitecto jefe. Se construye sobre el núcleo `Kataguru-Sceptic-35B-A3B-v3.1` (a su vez derivado de `Qwen3.5-35B-A3B`) y expande el enrutador a 264 expertos: 254 expertos universales congelados orientados a STEM, código, herramientas agénticas y razonamiento, más 10 expertos dedicados, uno por cada idioma objetivo (finés, estonio, húngaro, lituano, letón, islandés, euskera, georgiano, galés y turco), además del inglés. El modelo resuelve el problema de la traducción y el RAG cross-lingual directa entre idiomas de bajos recursos sin pivotar por inglés.

La innovación principal es una calibración de atención lineal "unhooked" (Stage-B, `0.55*v1 + 0.50*v2`) que permite enrutar entre los 110 pares de idiomas directos sin hooks externos en tiempo de ejecución. Mantiene intactos el encoder de visión ViT de 27 capas, la cabeza especulativa MTP y la ventana de contexto nativa. Se publica en BF16 completo (13 shards, 68,89 GiB) como release comunitario para investigadores, con variantes NVFP4, W4A16-AWQ y GGUF APEX-Trio.

Es relevante ahora por su enfoque en lenguas aglutinantes y de bajos recursos (finés, estonio, húngaro, euskera, georgiano), una cobertura poco habitual en modelos abiertos, combinada con capacidades de código, tool calling y visión, y una licencia Apache-2.0 permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (base `qwen3_5_moe`), con encoder de visión ViT de 27 capas y cabeza especulativa MTP |
| Parametros totales | 36.984.293.232 (≈37B) |
| Parametros activos | Top-8 activos (configuración A3B, ≈3B activos según nomenclatura del autor) |
| Longitud de contexto | Nativa del modelo base (no especificada en la información); despliegue recomendado con `--max-model-len 65536` |
| Tipos de cuantizacion | BF16 (release principal), NVFP4, W4A16-AWQ, GGUF (APEX-Small/Medium/Good + mmproj) |
| Idiomas soportados | en, fi, et, hu, lt, lv, is, eu, ka, cy, tr |
| Licencia | Apache-2.0 (requiere retener el fichero NOTICE) |
| Formato de pesos | safetensors (BF16, 13 shards); variantes GGUF y AWQ |

## Arquitectura y entrenamiento

El modelo es un transformer MoE multimodal construido sobre la arquitectura `qwen3_5_moe`. Cuenta con 264 expertos por capa con enrutamiento Top-8 (configuración A3B). Los expertos `#0..#253` son el núcleo universal congelado heredado de `Kataguru-Sceptic-35B-A3B-v3.1`, especializado en STEM, código, herramientas y razonamiento; los expertos `#254..#263` son diez slots dedicados, uno por idioma objetivo. La modificación de Kataguru consiste en la expansión del enrutador a 264 expertos y una calibración de "soup" de atención lineal (Stage-B, `0.55*v1 + 0.50*v2`) que afecta a 190 de 1835 tensores de atención/normalización, con cero deriva en expertos y enrutador. El encoder de visión ViT de 27 capas, la cabeza especulativa MTP y la ventana de contexto nativa se mantienen sin cambios.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO. El autor menciona un proceso de "uncensoring" (SOMA/ARA) y que las bases de datos de entrenamiento curadas y los "cartuchos de dominio" privados son secretos comerciales de Datasein Oy. El modelo incorpora un `chat_template.jinja` multi-modo con etiquetas operativas (`[INSPECT]`, `[CURATE]`, `[SURGEON]`, `[DECISION]`) y modificadores de razonamiento (`{REASON:...}`).

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento (`think=True/False`).
- Capacidades STEM y matemáticas (GSM8K, GPQA Diamond, MedQA reportados).
- Generación y comprensión de código en varios lenguajes (Python, Java, JavaScript según BFCL).
- Tool calling / function calling (parser `qwen3_coder` en vLLM, `--enable-auto-tool-choice`).
- Capacidades agénticas y razonamiento multi-paso con herramientas.
- Multimodalidad imagen-texto (pipeline `image-text-to-text`, encoder ViT de 27 capas).
- Multilingüismo en 11 idiomas, con traducción directa entre los 110 pares sin pivotar por inglés.
- RAG cross-lingual nativo mediante `documents=[...]` o prefijo `/rag /<target>`.
- Traducción directa mediante prefijo `/translate /<target>`.
- Modo "uncensored" (SOMA/ARA) según el autor.
- Decodificación especulativa mediante cabeza MTP.

## Casos de uso

- Traducción directa entre lenguas de bajos recursos: con el prefijo `/translate /<target>` el modelo traduce entre finés, estonio, húngaro, lituano, letón, islandés, euskera, georgiano, galés y turco sin pivotar por inglés, lo que reduce la pérdida de matices en lenguas aglutinantes.
- RAG cross-lingual: pasando documentos vía `documents=[...]` o `/rag /<target>`, el modelo recupera y responde en el idioma del usuario a partir de fuentes en otro idioma, útil para bases de conocimiento multilingües en administraciones públicas nórdicas o bálticas.
- Atención al cliente multilingüe: conversaciones multi-turno en los 11 idiomas soportados, con tool calling para consultar sistemas internos (pedidos, estado de cuenta) mediante el parser `qwen3_coder` en vLLM.
- Generación de código en producción: con un 83,47 % en BFCL V4 Single-Turn AST (Python Simple 93,50 %), puede integrarse en pipelines CI/CD como asistente de código con function calling y validación AST.
- Análisis de documentos con imagen: al ser `image-text-to-text` con ViT de 27 capas, permite extraer y razonar sobre capturas, formularios escaneados o diagramas combinados con texto.
- Asistencia STEM y médica: con GPQA Diamond 68,18 % y MedQA 85,55 %, adecuado para tutoría técnica, resolución de problemas de posgrado y triaje de preguntas clínicas (con supervisión humana).
- Agentes autónomos con herramientas: el modo multi-paso y las etiquetas `[INSPECT]`, `[CURATE]`, `[SURGEON]`, `[DECISION]` permiten orquestar flujos de inspección, curación y decisión sobre datos.
- Investigación en lingüística computacional: la separación en 254 expertos núcleo + 10 slots idiomáticos permite estudiar enrutamiento por idioma y especialización de expertos.

## Benchmarks y rendimiento

Los resultados fueron medidos sobre la build NVFP4 (2x RTX 5090, TP=2, CUDAGraphs, `--max-model-len 65536`), no sobre BF16 completo, según reconoce el autor.

| Benchmark | Resultado |
|---|---|
| Media 15 benchmarks | 69,70 % |
| Media cognitiva 11 tareas | 71,77 % |
| BoolQ | 90,40 % |
| GSM8K | 87,64 % |
| MedQA | 85,55 % |
| ARC-Easy | 84,51 % |
| PIQA | 83,35 % |
| HellaSwag | 82,24 % |
| GPQA Diamond | 68,18 % (135/198) |
| IFEval Prompt Strict | 68,39 % |
| IFEval Instruction Strict | 76,62 % |
| LiveCodeBench v6 (Pass@1) | 36,00 % (175 problemas) |
| BFCL V4 Single-Turn AST | 83,47 % |
| BFCL Python Simple | 93,50 % |
| BFCL Java | 65,00 % |
| BFCL JavaScript | 74,00 % |
| BFCL Multiple | 96,00 % |
| BFCL Parallel | 92,00 % |
| Cross-lingual `V_gen` ΔNLL | +0,46 % vs núcleo |
| Cross-lingual Live-14 (`think=False`) | 13/14 |
| Cross-lingual Heldout-17 (`think=False`) | 16/17 |
| Cross-lingual Live-14 (`think=True`) | 10/14 |
| Cross-lingual Heldout-17 (`think=True`) | 16/17 |

## Requisitos de hardware

- BF16 completo: 68,89 GiB en disco; se recomienda un total de ≥80 GB de VRAM para inferencia (según el autor, TP=2 o TP=4).
- GPU recomendadas para BF16: 2x o 4x A100/H100 (80 GB), o 2x RTX 5090 (32 GB) en TP=2 según la medición del autor.
- Consumer GPU: el BF16 no cabe en una sola GPU de consumo; las variantes NVFP4, W4A16-AWQ y GGUF APEX-Trio están pensadas para reducir huella (el autor no detalla VRAM exacta por variante).
- Opciones de despliegue: vLLM (recomendado, con `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder`, `--reasoning-parser qwen3`), llama.cpp/Ollama para GGUF, y backends compatibles con NVFP4 (Blackwell) y AWQ.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Kataguru-Polyglot-264E-35B-A3B | ≈37B totales, Top-8 activos | Nativa (no especificada) | Apache-2.0 | 264 expertos, 11 idiomas, multimodal, tool calling |
| Qwen3.5-35B-A3B (base) | ≈35B totales, Top-8 activos | Nativa | No disponible en la información | Núcleo del que deriva; sin slots idiomáticos |
| Kataguru-Sceptic-35B-A3B-v3.1 (base directo) | ≈35B totales | Nativa | No disponible en la información | 254 expertos, sin expansión poliglota |

No se dispone de datos de benchmarks de los modelos base en la información proporcionada para comparar rendimiento directamente.

## Limitaciones y advertencias

- Los 15 benchmarks se midieron sobre la build NVFP4, no sobre BF16 completo; el rendimiento en BF16 puede diferir.
- La traducción cross-lingual en modo `think=True` degrada a 10/14 en Live-14 (frente a 13/14 con `think=False`); se recomienda `think=False` para traducción determinista.
- Los datasets de entrenamiento curados y los cartuchos de dominio privados son secretos comerciales de Datasein Oy; no son auditables.
- Riesgo de alucinación no cuantificado en la información disponible.
- Sesgos conocidos: no documentados por el autor.
- Cobertura idiomática limitada a 11 idiomas; fuera de ellos el rendimiento no está caracterizado.
- La licencia Apache-2.0 exige retener el fichero NOTICE; verificar compatibilidad en despliegues comerciales.
- Modelo recién publicado (15-11-2026) con 0 descargas y 0 likes; sin validación independiente de la comunidad.
- El modo "uncensored" (SOMA/ARA) puede producir contenido sin filtros; requiere moderación adicional en producción.

## Enlaces

- Hugging Face (BF16): https://huggingface.co/kataguru/Kataguru-Polyglot-264E-35B-A3B
- Variante NVFP4: https://huggingface.co/kataguru/Kataguru-Polyglot-264E-35B-A3B-NVFP4
- Variante W4A16-AWQ: https://huggingface.co/kataguru/Kataguru-Polyglot-264E-35B-A3B-W4A16-AWQ
- Variante GGUF APEX-Trio: https://huggingface.co/kataguru/Kataguru-Polyglot-264E-35B-A3B-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Perfil del autor: https://huggingface.co/kataguru
