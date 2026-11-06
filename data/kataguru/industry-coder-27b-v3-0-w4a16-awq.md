# kataguru/Industry-Coder-27B-v3.0-W4A16-AWQ

## Resumen
Industry-Coder-27B-v3.0-W4A16-AWQ es una cuantización de pesos INT4 (W4A16) del modelo ajustado kataguru/Industry-Coder-27B-v3.0, construido sobre Qwen/Qwen3.8-27B. El autor, kataguru, lo orienta a agentes de programación autónomos, algoritmia competitiva, orquestación de tool calling en paralelo y automatización industrial (Siemens SCL, Beckhoff TwinCAT 3 ST, G-code CNC). Emplea una arquitectura híbrida densa de 27B con Gated DeltaNet y atención softmax completa, además de un codificador visual multimodal de 27 capas y Multi-Token Prediction (MTP).

El modelo se publica con licencia Apache 2.0, contexto nativo de 262.144 tokens y soporte bilingüe nativo finlandés-inglés, ampliado a estonio, húngaro y turco. La versión aquí descrita es la cuantización AWQ empaquetada en formato compressed-tensors, pensada para vLLM universal en GPUs Ampere, Ada Lovelace, Hopper y Blackwell. El repositorio ocupa 28,9 GB y los pesos completos suman 27.781.427.952 parámetros.

El interés actual radica en que combina un contexto muy largo, visión, tool calling paralelo y un ajuste fino específico de dominio industrial, todo en un único checkpoint cuantizado desplegable en dos GPUs de 24-32 GB o en una sola de 32 GB con caché KV en fp8. Los benchmarks publicados por el autor muestran una mejora agregada de +3,05 puntos porcentuales sobre el modelo base en su suite de 15 pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido denso: Gated DeltaNet + atención softmax completa, con codificador visual y Multi-Token Prediction (Qwen3_5ForConditionalGeneration) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W4A16-AWQ (INT4 pack-quantized, group_size=32, observador MSE); capas preservadas en BF16: linear_attn.in_proj_a/b, model.visual.* (333 tensores), mtp.* (15 tensores), lm_head, embed_tokens |
| Idiomas soportados | en, fi, et, hu, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con compressed-tensors (compatible con vLLM) |

## Arquitectura y entrenamiento
El modelo base Qwen/Qwen3.8-27B emplea una arquitectura híbrida de 64 capas que combina capas Gated DeltaNet (atención lineal) con capas de atención softmax completa, un codificador visual multimodal de 27 capas y un módulo de Multi-Token Prediction. Sobre esta base, kataguru aplica su pipeline "Triple-Adaptive Multi-Dynamic v4.1": ortogonalización de residuos SOMA/ARA, un ajuste QLoRA en subespacios ortogonales divididos en tres fases (r=16, qr_frozen_a, índices [0:8] frente a [8:16]) y una fase 4 de annealing centrada en thinking multi-dinámico, programación competitiva y tool calling en paralelo.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO. La cuantización AWQ se aplica con observador MSE y tamaño de grupo 32, manteniendo en BF16 las proyecciones de atención lineal, el codificador visual, el módulo MTP, el lm_head y los embeddings para preservar calidad en visión y generación especulativa.

## Capacidades
- Generación de texto y razonamiento de nivel STEM avanzado, con modo de pensamiento (thinking) multi-dinámico.
- Programación competitiva y resolución de problemas algorítmicos (LiveCodeBench v6, LeetCode con clase Solution).
- Tool calling y function calling, incluido paralelo, con detección de irrelevancia (BFCL V4).
- Agentes de código autónomos para IDE y CLI con razonamiento multi-paso.
- Comprensión de imágenes (pipeline image-text-to-text) mediante codificador visual de 27 capas.
- Dominio industrial: generación de Siemens SCL, Beckhoff TwinCAT 3 ST e IEC 61131-3, además de G-code para CNC.
- Capacidades de ciberseguridad y coding agéntico.
- Multilingüe nativo en finlandés e inglés, con soporte adicional de estonio, húngaro y turco.
- Comportamiento "uncensored" y anti-sycophancy declarado por el autor.

## Casos de uso
- Agentes de código en IDE o CLI: el modelo puede mantener sesiones largas de refactorización multi-archivo gracias a sus 262.144 tokens de contexto y a su soporte de tool calling, integrándose en asistentes tipo agente que leen, editan y ejecutan pruebas.
- Orquestación de herramientas en paralelo: con BFCL Live Parallel AST en el 87,50 %, es adecuado para pipelines que lanzan varias llamadas a funciones simultáneas (búsquedas, APIs, ejecución de tests) en un solo turno.
- Automatización industrial: generación y revisión de lógica de control en Siemens SCL y Beckhoff TwinCAT 3 ST, además de programas G-code para mecanizado CNC, un nicho poco cubierto por modelos generalistas.
- Algoritmia competitiva y entrevistas técnicas: su Pass@1 del 64,57 % en LiveCodeBench v6 y del 85,71 % en LeetCode lo hacen útil para generación de soluciones en Python con clase Solution.
- Razonamiento STEM de posgrado: con un 82,32 % en GPQA Diamond, sirve para asistencia en investigación doctoral, revisión de derivaciones y resolución de problemas científicos con cadena de pensamiento.
- Análisis de documentación técnica con imágenes: el codificador visual permite interpretar esquemas eléctricos, diagramas de PLC o capturas de HMI junto a texto, útil en soporte de ingeniería.
- Asistencia multilingüe en finlandés e inglés: atención al cliente técnica o documentación para mercados nórdicos, con cobertura secundaria de estonio, húngaro y turco.
- Auditoría de ciberseguridad y revisión de código: el ajuste incluye capacidades de seguridad y coding agéntico para detectar patrones inseguros en bases de código.

## Benchmarks y rendimiento
Resultados publicados por el autor, ejecutados en 2x NVIDIA RTX 5090 32 GB (TP=2, CUDAGraphs activados):

| Benchmark | Metrica | Qwen3.8-27B (base) | v2.0 | v3.0 (este modelo) | Delta vs base |
|---|---|---|---|---|---|
| Sigma_15 (media 15 pruebas) | Mean | 68,85 % | 68,73 % | 71,90 % | +3,05 pp |
| Sigma_11 (media cognitiva) | Mean | 70,40 % | 70,41 % | 70,70 % | +0,30 pp |
| LiveCodeBench v6 (175 tareas) | Pass@1 | 58,86 % | 42,29 % | 64,57 % | +5,71 pp |
| LCB v6 Easy (n=43) | Pass@1 | 95,35 % | 95,35 % | 100,00 % | +4,65 pp |
| LCB v6 Medium (n=52) | Pass@1 | 69,23 % | 48,08 % | 82,69 % | +13,46 pp |
| LCB v6 Hard (n=80) | Pass@1 | 32,50 % | 10,00 % | 33,75 % | +1,25 pp |
| LCB v6 LeetCode (n=63) | Pass@1 | no disponible | no disponible | 85,71 % | no disponible |
| BFCL V4 Single-Turn AST (3.641) | Overall AST | 85,44 % | 73,14 % | 86,27 % | +0,83 pp |
| BFCL Non-Live AST | AST | 87,89 % | 61,02 % | 89,19 % | +1,30 pp |
| BFCL Live AST | AST | 83,00 % | 85,27 % | 83,35 % | +0,35 pp |
| BFCL Live Parallel AST | Parallel AST | 81,25 % | 25,00 % | 87,50 % | +6,25 pp |
| BFCL Non-Live Parallel AST | Parallel AST | 91,50 % | 29,50 % | 94,50 % | +3,00 pp |
| BFCL Non-Live Parallel Multiple AST | Parallel Mult. | 86,50 % | no disponible | 90,50 % | +4,00 pp |
| BFCL Irrelevance Detection | Abstention | 75,26 % | 48,14 % | 70,50 % | -4,76 pp |
| GPQA Diamond (198) | CoT Exact | 77,27 % | 66,16 % | 82,32 % | +5,05 pp |
| GSM8K (1.319) | Strict/Flex | 87,19 % | 86,73 % / 87,79 % | no disponible en el extracto | no disponible |

Los resultados de las pruebas 1 a 10 de la suite de 15 no se incluyen en el extracto disponible. La prueba de detección de irrelevancia (abstention) empeora respecto al base en 4,76 pp, un dato relevante para despliegues con tool calling.

## Requisitos de hardware
- Huella en disco: 28,2 GB (repositorio de 28,9 GB).
- VRAM: aproximadamente 14,1 GB por GPU con TP=2; cabe en una sola GPU de 32 GB usando caché KV en fp8.
- GPUs recomendadas: NVIDIA Ampere (RTX 3090, A100), Ada Lovelace (RTX 4090, L40S), Hopper (H100) y Blackwell (RTX 5090). El autor valida TP=2 sobre 2x RTX 5090 de 32 GB.
- Configuraciones: TP=2 en 2 GPUs de 24-32 GB o TP=1 en 1 GPU de 32-48 GB, con CUDAGraphs activados.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 de 24 GB con TP=2, o en una RTX 5090 de 32 GB en TP=1.
- Despliegue: vLLM es el runtime recomendado y validado (compressed-tensors, endpoints_compatible). No se confirma soporte de llama.cpp, Ollama o TGI para este formato AWQ.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Industry-Coder-27B-v3.0-W4A16-AWQ (este) | 27,78B denso | 262.144 | Apache 2.0 | safetensors AWQ/compressed-tensors | Multimodal, MTP, ajuste industrial y finlandés; Sigma_15 71,90 % |
| Qwen/Qwen3.8-27B (base) | no disponible en el extracto | 262.144 (heredado) | Apache 2.0 | BF16 safetensors | Sin ajuste de dominio; Sigma_15 68,85 %, LCB v6 58,86 % |
| Industry-Coder-27B-v2.0-W4A16-AWQ | 27,78B denso | 262.144 | Apache 2.0 | safetensors AWQ | Versión previa del autor; Sigma_15 68,73 %, peor tool calling paralelo |
| Otros modelos de ~27B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos adicionales en la información proporcionada |

## Limitaciones y advertencias
- Sesgos: no se documentan evaluaciones de sesgo; el ajuste "uncensored" puede aumentar la probabilidad de contenido sensible o inapropiado sin filtros.
- Alucinación: no hay métricas de factualidad publicadas; el modo thinking y el contexto largo no garantizan veracidad.
- Tool calling: la detección de irrelevancia cae a 70,50 % (frente al 75,26 % del base), por lo que puede invocar herramientas cuando no procede; conviene añadir validación externa.
- Idiomas: cobertura nativa limitada a inglés y finlandés, con estonio, húngaro y turco secundarios; el castellano no figura entre los idiomas soportados.
- Contexto: aunque el contexto nativo es de 262.144 tokens, no se documenta el rendimiento en la ventana completa ni el coste de caché KV a esa longitud.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y los datos de ajuste pueden imponer obligaciones adicionales no detalladas.
- Producción: los benchmarks se ejecutaron en 2x RTX 5090 con TP=2; el rendimiento en otras configuraciones puede diferir. La cuantización W4A16 puede degradar tareas no evaluadas.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card está parcialmente truncada en el extracto disponible.

## Enlaces
- Hugging Face: https://huggingface.co/kataguru/Industry-Coder-27B-v3.0-W4A16-AWQ
- Versión previa v2.0: https://huggingface.co/kataguru/Industry-Coder-27B-v2.0-W4A16-AWQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
