# KC-Informatics/Raven-27B-AWQ

## Resumen

Raven-27B-AWQ es una versión cuantizada a 4 bits del modelo Raven-27B, desarrollado por KC-Informatics a partir de Qwen/Qwen3.8-27B. Se trata de un ajuste fino orientado a la eliminación de rechazos (*refusal removal*) mediante una técnica propietaria llamada Null-Space Refusal Surgery (NS-UNREFUSE-v2), aplicada sobre los pesos completos en BF16 antes de la cuantización. El resultado es un modelo de 27.000 millones de parámetros con licencia Apache 2.0, pensado para despliegues prácticos en GPUs de 24-40 GB.

La innovación principal es la combinación de la cirugía de rechazos con una cuantización AWQ W4A16 protegida (GDN-protected), que mantiene en precisión completa las proyecciones recurrentes del híbrido Gated DeltaNet para preservar la decodificación especulativa y el razonamiento de cadena larga. Según el autor, el resultado es estadísticamente indistinguible del build FP8 de 30,9 GB (McNemar p = 1.000) ocupando solo 18,21 GiB en disco.

El modelo se publica con soporte para vLLM y SGLang, incluye un wrapper opcional (`nudge.py`) para forzar cierres limpios en prompts difíciles y está etiquetado como *uncensored*. La información disponible es limitada: el repositorio aparece vacío (0.0 GB), sin descargas ni validación de la comunidad, y todos los benchmarks son autoevaluaciones del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet (según referencias a proyecciones recurrentes `in_proj_a`, `in_proj_b`, `dt_proj`); arquitectura base Qwen3.8-27B |
| Parametros totales | 27.000 millones (27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (configurado en el ejemplo de despliegue con `--max-model-len 131072`) |
| Tipos de cuantizacion | AWQ W4A16 asimétrica (4 bits pesos, 16 bits activaciones); proyecciones recurrentes GDN y capas no divisibles por grupo en precisión completa |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (AWQ, compatible con transformers, vLLM y SGLang) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer con componentes híbridos de tipo Gated DeltaNet, tal como se deduce de la mención explícita a proyecciones recurrentes (`in_proj_a`, `in_proj_b`, `dt_proj`) que se mantienen en precisión completa durante la cuantización. Sobre los pesos BF16 originales se aplicó NS-UNREFUSE-v2 en las capas 24-58 (68 proyecciones de salida), eliminando direcciones de rechazo de rango 2 ortogonalizadas contra la incertidumbre epistémica (gamma_ep = 0.50) y amortiguadas sobre la variedad de prompts limpios (gamma_clean = 0.10), con preservación de la norma L2 por filas. Los pesos de visión y audio no se modificaron.

Posteriormente se aplicó una cuantización AWQ real (`AWQModifier(W4A16_ASYM)`) calibrada con 128 muestras de 1.024 tokens, directamente desde los pesos BF16 editados. No se dispone de información sobre el volumen de tokens de preentrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. El autor menciona decodificación especulativa mediante el draft model Kapitsa DFlash2 (k=8) de nace-ai, que se integra en vLLM 0.34+ o SGLang.

## Capacidades

- Generación de texto y razonamiento de cadena larga, con soporte de *reasoning parser* `qwen3` en vLLM.
- Generación de código, con rendimiento destacado según el autor (220 tok/s en decodificación de una sola secuencia sobre código).
- Razonamiento matemático y científico (evaluado en GPQA Diamond, AIME 2026 y LiveCodeBench v6 en la suite del autor).
- Seguimiento de instrucciones (IFEval en la suite de evaluación).
- Soporte de *tool calling* / *function calling* nativo (`--enable-auto-tool-choice`, parser `qwen3_coder`).
- Capacidades de agente y razonamiento multi-paso (soporte de decodificación especulativa y contexto de 131k tokens).
- Eliminación de rechazos: responde a solicitudes que el modelo base rechazaría (8/12 en la sonda JBB de 12 ítems, frente a 2/12 del base).
- Wrapper `nudge.py` para forzar cierres limpios en prompts difíciles.
- Multilingüe: limitado a inglés según la model card.
- Visión y audio: los pesos existen (no se modificaron en la cirugía), pero no se documentan capacidades multimodales en la información disponible.

## Casos de uso

- Generación de código en producción: el modelo alcanza 220 tok/s en decodificación de código con DFlash2 sobre RTX PRO 6000, lo que lo hace adecuado para autocompletado, generación de tests y refactorización dentro de pipelines de CI/CD con vLLM o SGLang.
- Agentes autónomos multi-paso: el contexto de 131.072 tokens y el soporte de *tool calling* con parser `qwen3_coder` permiten cadenas de razonamiento largas con invocación de herramientas externas.
- Razonamiento científico y matemático: útil en asistentes de investigación que requieran resolver problemas de nivel GPQA o AIME, con la advertencia de que los benchmarks son autoevaluaciones.
- Despliegue en GPUs de gama alta para consumo: con 21,19 GiB cargados (incluyendo el draft model), cabe en RTX 4090 (24 GB), RTX 5090, A6000 (48 GB) y RTX PRO 6000, lo que facilita inferencia local sin infraestructura de centro de datos.
- Atención al cliente y conversación multi-turno: la ventana de 131k tokens permite mantener historiales largos; sin embargo, el soporte exclusivo de inglés limita su uso a mercados anglófonos.
- Servicio de alto throughput: 1.008 tok/s agregados en 8 streams concurrentes con DFlash2, adecuado para APIs internas con múltiples usuarios simultáneos.
- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio de *refusal removal* para analizar cómo la cirugía de direcciones de rechazo afecta al comportamiento del modelo.

## Benchmarks y rendimiento

Los únicos datos disponibles son autoevaluaciones del autor sobre la suite pública `AA-PUBLIC-180` (N=1, 0 errores), compuesta por 60 preguntas de GPQA Diamond, 30 de AIME 2026, 40 de LiveCodeBench v6, 30 de IFEval y 20 de AA-LCR.

| Metrica | Qwen 3.8 27B FP8 (base) | Raven-27B (FP8) | Raven-27B-AWQ (4-bit) |
|---|---:|---:|---:|
| Suite pública de 180 preguntas (N=1) | 124/180 (68,89%) | 146/180 (79,79%) | 145/180 (78,96%) |
| McNemar emparejado vs Raven FP8 | - | baseline | p = 1.000 (sin pérdida) |
| Suite de sanidad FAST-24 | - | - | 24/24 (100%) |
| Solicitudes rechazadas respondidas (sonda JBB 12 ítems) | 2/12 | - | 8/12 (66,7%) |
| Preguntas trampa sin respuesta superadas | 8/8 | 8/8 | 8/8 (100%) |
| Tamano en disco | 30,9 GB | 30,9 GB | 18,21 GiB |
| VRAM cargada con Kapitsa DFlash2 (k=8) | ~35 GB | ~35 GB | 21,19 GiB |
| Decodificación de una secuencia con DFlash2 (RTX PRO 6000) | 92 tok/s (143 en código) | - | 141 tok/s (220 tok/s en código) |
| Decodificación concurrente en 8 streams con DFlash2 | 927 tok/s | - | 1.008 tok/s |

No se han publicado resultados independientes ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: 21,19 GiB cargados incluyendo el draft model Kapitsa DFlash2 (k=8); 18,21 GiB en disco.
- GPUs compatibles: RTX 4090 (24 GB), RTX 5090, RTX PRO 6000, A6000 (48 GB), L40S (48 GB), A100 (40/80 GB), H100 (80 GB).
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) siempre que se reserve VRAM para el contexto; con ventanas de 131k tokens puede requerir GPUs de 32-48 GB.
- Opciones de despliegue: vLLM 0.34+ (recomendado, con `--trust-remote-code`, `--reasoning-parser qwen3`, `--enable-auto-tool-choice`, `--tool-call-parser qwen3_coder` y configuración especulativa DFlash2), SGLang, transformers. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: 141 tok/s en decodificación de una sola secuencia (220 tok/s en código) y 1.008 tok/s agregados en 8 streams concurrentes sobre RTX PRO 6000 con DFlash2. Sin DFlash2 no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---:|---|---|---|
| Raven-27B-AWQ | 27B | 131.072 | Apache 2.0 | AWQ W4A16 | Fino ajustado para eliminar rechazos; 18,21 GiB en disco |
| Raven-27B (FP8) | 27B | 131.072 | Apache 2.0 | FP8 | 30,9 GB; baseline de la cirugía de rechazos |
| Qwen/Qwen3.8-27B (base) | 27B | no disponible | Apache 2.0 | BF16/FP8 | Modelo original sin modificar; 124/180 en la suite del autor |

No se dispone de datos de benchmarks independientes ni de comparaciones con otros modelos de la misma categoría (por ejemplo, otros 27B con cuantización AWQ) en la información proporcionada.

## Limitaciones y advertencias

- El repositorio aparece con 0.0 GB de tamaño, 0 descargas y 0 likes, lo que sugiere que los pesos podrían no estar subidos o que la publicación es muy reciente; verificar antes de usar en producción.
- Todos los benchmarks son autoevaluaciones del autor con N=1 y sin validación externa; no deben tratarse como evidencia robusta de rendimiento.
- El modelo está diseñado explícitamente para eliminar rechazos de seguridad (*uncensored*), lo que implica un riesgo elevado de generar contenido dañino, sesgado o inapropiado; no es adecuado para aplicaciones expuestas a usuarios finales sin filtros adicionales.
- Soporte exclusivo de inglés; no se garantiza calidad en otros idiomas.
- Riesgo de alucinación no cuantificado; la suite de evaluación incluye preguntas trampa (8/8 superadas) pero no mide tasas de alucinación en dominios abiertos.
- La cirugía de rechazos puede haber degradado capacidades de razonamiento o de seguimiento de instrucciones de forma no documentada; el autor solo reporta comparaciones agregadas.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado recae en el desplegador; conviene revisar las implicaciones legales de distribuir un modelo *uncensored*.
- Dependencia de `--trust-remote-code` y de un draft model externo (nace-ai/Qwen3.8-27B-DFlash2-Kapitsa) para alcanzar el rendimiento declarado; sin él, las cifras de latencia no están garantizadas.
- No se documentan sesgos conocidos ni evaluaciones de seguridad por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/KC-Informatics/Raven-27B-AWQ
- Modelo base Raven-27B: https://huggingface.co/KC-Informatics/Raven-27B
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-27B
- Draft model Kapitsa DFlash2: https://huggingface.co/nace-ai/Qwen3.8-27B-DFlash2-Kapitsa
