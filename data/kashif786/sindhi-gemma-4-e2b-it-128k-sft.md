# Kashif786/sindhi-gemma-4-E2B-it-128k-sft

## Resumen

Sindhi Gemma 4 E2B IT 128k SFT es un modelo de lenguaje ligero ajustado por instrucciones (SFT) especializado en sindhi, desarrollado por el usuario Kashif786 y publicado en HuggingFace. Parte de la arquitectura Gemma 4 2B de Google, a la que aplica dos innovaciones: una poda estructural del vocabulario (del 50%, de 262.144 a 131.072 tokens) y la eliminación completa de los parámetros multimodales (encoders de visión y proyecciones), y un ajuste fino supervisado sobre el dataset Sindhi-Assistant-IFT-1500, que cubre más de 380 dominios académicos, legales, culturales y cotidianos en escritura persa-arábiga sindhi.

El problema que resuelve es doble: por un lado, la falta de modelos de calidad para el sindhi, una lengua de bajos recursos; por otro, la ineficiencia de los checkpoints multilingües genéricos, que arrastran millones de pesos de embeddings muertos para lenguas irrelevantes al caso de uso. El resultado es un modelo que reduce la huella de VRAM un 36,3% (de 9,51 GB a 6,06 GB) y el consumo energético por token un 30,8%, sin degradación en benchmarks de razonamiento estrictos y con mejoras drásticas en traducción y generación en sindhi.

Es relevante ahora porque demuestra un enfoque de "green AI" reproducible para NLP de bajos recursos: poda de vocabulario + eliminación de modalidades + SFT culturalmente fundamentado, con despliegue viable en GPUs de consumo de 8 GB. El modelo final tiene 3.252.837.667 parámetros, pesos en safetensors y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder text-only (Gemma 4 E2B), con vocabulario podado |
| Parametros totales | 3.252.837.667 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica estructura MoE; aparenta ser denso) |
| Longitud de contexto | no disponible (el nombre sugiere 128k, pero no consta en la model card) |
| Tipos de cuantizacion | bfloat16 (precisión de entrenamiento y checkpoint); no se publican versiones cuantizadas |
| Idiomas soportados | Sindhi (sd), Urdu (ur), Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con endpoints, libreria transformers) |

## Arquitectura y entrenamiento

La base es Gemma 4 E2B (versión text-only de ~2B de parámetros efectivos). El pipeline de poda eliminó todos los componentes no textuales (encoders de visión, resamplers espaciales y puentes de proyección multimodal) y truncó las matrices de embeddings de entrada (`embed_tokens.weight`) y de salida (`lm_head.weight`) de `[262144, d_model]` a `[131072, d_model]`. La poda preservó íntegramente los caracteres ASCII, el inglés, el urdu, las diacríticas árabes y los 16 glifos únicos del alfabeto persa-arábigo sindhi (ڄ, ڃ, ڪ, ڳ, ڱ, ٻ, ڌ, ڇ, ٽ, ڊ, ڦ, ٺ, ڙ, ڍ, ڏ). El tokenizador fast mantiene los delimitadores de turno oficiales de Gemma 4 (`<start_of_turn>`, `<end_of_turn>`, `user`, `model`).

Sobre esta base podada (`Kashif786/gemma-4-E2B-it-text-only-128k-pruned`) se aplicó un SFT con LoRA posteriormente fusionado (merged) en el checkpoint final, usando el dataset `Kashif786/Sindhi-Assistant-IFT-1500`: 1.500 ejemplos auditados que cubren más de 380 dominios en sindhi persa-arábigo auténtico, con numeración ASCII estricta (0-9). No se indica en la model card el número total de tokens de entrenamiento, ni si hubo RLHF o DPO posteriores; el método declarado es SFT con LoRA.

## Capacidades

- Generación de texto conversacional por instrucciones en sindhi (escritura persa-arábiga), con dominios académicos, legales, culturales y cotidianos.
- Traducción cruzada inglés→sindhi y urdu→sindhi con mejoras sustanciales respecto al modelo base (ChrF++ de 14,88 a 52,08 y de 52,74 a 72,63 respectivamente).
- Resumen de texto en sindhi (ChrF++ de 38,78 a 58,08).
- Comprensión lectora en sindhi (45% de precisión en Belebele `snd_Arab`).
- Etiquetado gramatical zero-shot (UPOS) sobre el treebank sindhi UD_Sindhi-Isra (73% de precisión).
- Razonamiento en inglés preservado tras la poda (paridad semántica estricta con el baseline en benchmarks de razonamiento).
- No hay soporte de visión: los parámetros multimodales fueron eliminados deliberadamente.
- No se documenta soporte de tool calling, function calling ni capacidades de agentes en la información disponible.

## Casos de uso

- Asistentes conversacionales en sindhi: el SFT sobre 380+ dominios culturales y cotidianos lo hace adecuado para chatbots de atención al usuario en lengua sindhi, donde los modelos genéricos colapsan hacia el inglés.
- Traducción inglés→sindhi y urdu→sindhi: con un ChrF++ de 52,08 y 72,63 respectivamente, puede integrarse en flujos de localización de contenidos para medios y administraciones de Sindh.
- Resumen automático de documentos en sindhi: útil para resumir prensa, documentos legales o material académico en escritura persa-arábiga.
- Procesamiento lingüístico y anotación gramatical: el 73% de precisión UPOS zero-shot permite preetiquetar corpus sindhi para investigación lingüística o construcción de treebanks.
- Comprensión lectora y extracción de información: la precisión en Belebele `snd_Arab` lo habilita para sistemas de preguntas y respuestas sobre textos sindhi.
- Despliegue en hardware de consumo: con 6,06 GB de VRAM estática, cabe en GPUs de 8 GB (RTX 3070/4060), lo que lo hace idóneo para aplicaciones educativas locales en regiones sindhi-parlantes sin acceso a infraestructura de servidor.
- Educación y preservación cultural: generación de material didáctico y contenidos culturales en sindhi auténtico con numeración ASCII consistente.

## Benchmarks y rendimiento

| Benchmark | Baseline (google/gemma-4-E2B-it) | Sindhi Gemma 4 E2B SFT | Delta |
|---|:---:|:---:|:---:|
| UD_Sindhi-Isra UPOS (zero-shot) | 66,00% | 73,00% | +7,00% absoluto (+10,61% relativo) |
| Belebele `snd_Arab` (comprensión lectora) | 45,00% | 45,00% | sin cambio |
| Traducción EN→SD (ChrF++) | 14,88 | 52,08 | +249,9% |
| Traducción UR→SD (ChrF++) | 52,74 | 72,63 | +19,89 |
| Resumen de texto (ChrF++) | 38,78 | 58,08 | +19,30 |

Benchmarks de eficiencia (frente al baseline multimodal):

| Métrica | Baseline | Modelo podado | Delta |
|---|:---:|:---:|:---:|
| Vocabulario | 262.144 tokens | 131.072 tokens | -50,0% |
| Huella en disco | 10,20 GB | 6,51 GB | -36,2% |
| VRAM estática | 9,51 GB | 6,06 GB | -36,3% |
| Energía por token generado | 4,64 J/token | 3,21 J/token | -30,8% |
| Potencia activa de GPU | 55,47 W | 39,43 W | -28,9% |

## Requisitos de hardware

- VRAM estimada para inferencia: 6,06 GB en bfloat16 (huella estática medida), frente a 9,51 GB del baseline completo.
- Cabe en GPUs de consumo de 8 GB: RTX 3070 y RTX 4060 son las referenciadas explícitamente en la model card.
- Para servidores, cualquier GPU con ≥8 GB de VRAM es suficiente; no se recomiendan GPUs concretas de gama datacenter (A100/H100) por el tamaño reducido del modelo.
- Despliegue: la model card declara compatibilidad con la librería `transformers` y "endpoints compatible". No se documentan explícitamente vLLM, llama.cpp, Ollama o TGI; no hay pesos GGUF publicados, por lo que llama.cpp/Ollama requerirían conversión propia.
- Latencia y throughput: no se publican cifras de tokens/segundo; sí se documenta consumo de 3,21 J/token y 39,43 W de potencia activa en el hardware de evaluación.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | VRAM (bf16) | Especialidad | Licencia |
|---|:---:|:---:|:---:|---|---|
| Sindhi Gemma 4 E2B IT 128k SFT | 3,25 B (checkpoint) | 131.072 | 6,06 GB | Sindhi, urdu, inglés | Apache 2.0 |
| google/gemma-4-E2B-it (baseline) | ~2B efectivos + visión | 262.144 | 9,51 GB | Multilingüe multimodal | no disponible |
| Base podada (Kashif786/gemma-4-E2B-it-text-only-128k-pruned) | no disponible | 131.072 | 6,06 GB | Text-only multilingüe podado | Apache 2.0 |

No existen en la información proporcionada otros modelos especializados en sindhi con los que comparar; el punto de referencia publicado por el autor es el propio baseline de Gemma 4, al que supera claramente en tareas sindhi y en eficiencia energética, manteniendo paridad en razonamiento.

## Limitaciones y advertencias

- Modelo muy especializado: su fortaleza es el sindhi; para tareas generales en otras lenguas el baseline original de Gemma 4 probablemente sea superior.
- Sin capacidades de visión: la poda eliminó deliberadamente todos los componentes multimodales, por lo que no acepta imágenes.
- Soporte de idiomas limitado a sindhi, urdu e inglés; la poda del vocabulario al 50% puede degradar el rendimiento en lenguas cuyos tokens se hayan descartado.
- Dataset de SFT reducido (1.500 ejemplos): riesgo de sobreajuste a los 380+ dominios cubiertos y de alucinación fuera de ellos, típico en modelos de bajos recursos con pocos datos de ajuste.
- Métricas de comprensión lectora modestas (45% en Belebele), lo que indica capacidad limitada para tareas de razonamiento complejo en sindhi.
- Proyecto de autor individual con adopción muy baja (397 descargas, 1 like): falta de auditoría comunitaria y de pruebas en producción.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque conviene verificar la licencia del modelo base original de Google (Gemma) respecto a sus términos de uso.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita las opciones de despliegue en CPU o edge sin conversión manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kashif786/sindhi-gemma-4-E2B-it-128k-sft
- Dataset de SFT: https://huggingface.co/datasets/Kashif786/Sindhi-Assistant-IFT-1500
- Modelo base podado: https://huggingface.co/Kashif786/gemma-4-E2B-it-text-only-128k-pruned
- Paper, blog o demo: no disponible (no se han encontrado enlaces adicionales en la información proporcionada)
