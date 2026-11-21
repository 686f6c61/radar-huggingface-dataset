# Kashif786/sindhi-gemma-4-E2B-it-128k-sft

## Resumen

Sindhi Gemma 4 E2B IT 128k SFT es un modelo de lenguaje instruction-tuned desarrollado por el usuario Kashif786 sobre la arquitectura Gemma 4 de Google, especializado en el idioma sindhi (سنڌي) en escritura perso-árabe. El modelo parte de un checkpoint base previamente podado (`Kashif786/gemma-4-E2B-it-text-only-128k-pruned`) al que se le han eliminado los módulos multimodales (visión) y se ha reducido el vocabulario un 50%, de 262.144 a 131.072 tokens, para eliminar pesos de embedding irrelevantes para texto perso-árabe. Sobre esa base se aplicó un ajuste supervisado (SFT) con LoRA posteriormente fusionado, usando el dataset `Kashif786/Sindhi-Assistant-IFT-1500`.

El modelo cuenta con 3.252.837.667 parámetros totales según los pesos en safetensors (el nombre "E2B" sugiere una variante eficiente de ~2B, aunque el checkpoint fusionado reporta 3,25B), soporta una longitud de contexto de 128k tokens y está pensado para despliegue ligero en GPU de consumo. Su propuesta de valor es doble: por un lado, cubrir una lengua de bajos recursos como el sindhi con un asistente conversacional funcional; por otro, demostrar que la poda estructural de vocabulario y modalidades reduce huella de VRAM y consumo energético sin degradar el razonamiento.

Es relevante ahora porque combina tres tendencias activas: modelos pequeños eficientes ("green AI"), adaptación cross-lingual de modelos abiertos y pruning de vocabulario como técnica de compresión. La licencia Apache 2.0 facilita su uso comercial, y su tamaño permite ejecutarlo en tarjetas de 8 GB de VRAM según las cifras del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, variante text-only tras poda de módulos multimodales) |
| Parametros totales | 3.252.837.667 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | sd (sindhi), ur (urdu), en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Gemma 4, en su variante eficiente "E2B". El pipeline de construcción tiene dos fases. Primero, una poda estructural: se eliminan todos los pesos no textuales (codificadores de visión, resamplers espaciales y puentes de proyección multimodal), y se truncan la matriz de embeddings (`embed_tokens.weight`) y la proyección de salida (`lm_head.weight`) de `[262144, d_model]` a `[131072, d_model]`. La poda preserva explícitamente todos los caracteres ASCII, inglés estándar, urdu, diacríticos árabes y los 16 grafemas sindhi específicos (ڄ, ڃ, ڪ, ڳ, ڱ, ٻ, ڌ, ڇ, ٽ, ڊ, ڦ, ٺ, ڙ, ڍ, ڏ). El tokenizador rápido mantiene los delimitadores oficiales de turno de Gemma 4 (`<start_of_turn>`, `<end_of_turn>`, `user`, `model`), lo que preserva la compatibilidad con plantillas Jinja tipo ChatML.

En la segunda fase se aplicó un ajuste supervisado con LoRA sobre el dataset `Kashif786/Sindhi-Assistant-IFT-1500`, que según la model card cubre más de 380 dominios académicos, legales, culturales y cotidianos en sindhi perso-árabe auténtico con numerales ASCII. El adaptador LoRA se fusionó en los pesos finales, dando lugar a un checkpoint autónomo. No se documentan en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni el uso de RLHF o DPO; las métricas declaradas incluyen chrF, BLEU y accuracy.

## Capacidades

- Generación de texto conversacional en sindhi, urdu e inglés, con soporte multi-turno mediante la plantilla de chat de Gemma 4.
- Comprensión lectora en sindhi perso-árabe (evaluada en Belebele `snd_Arab`).
- Traducción inglés→sindhi y urdu→sindhi (métricas ChrF++ reportadas por el autor).
- Resumen de texto en sindhi.
- Etiquetado gramatical zero-shot (UPOS) sobre el treebank `UD_Sindhi-Isra`.
- Razonamiento y respuesta a instrucciones gracias al ajuste SFT sobre la base instruction-tuned.
- Manejo correcto de numerales ASCII (0-9) y de los 16 grafemas sindhi específicos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible (el modelo es explícitamente text-only tras la poda).

## Casos de uso

- Asistencia conversacional en sindhi: el modelo puede gestionar diálogos multi-turno con usuarios que escriben en perso-árabe, gracias a su plantilla de chat compatible con Gemma 4 y a su ventana de 128k tokens para conversaciones largas o documentos adjuntos extensos.
- Traducción urdu→sindhi y inglés→sindhi en flujos editoriales: el salto de ChrF++ reportado (52,74→72,63 en urdu→sindhi y 14,88→52,08 en inglés→sindhi) lo hace adecuado para pre-traducción asistida por humanos en medios locales.
- Resumen de documentos legales o académicos en sindhi: con 128k de contexto puede procesar informes completos y generar resúmenes; el autor reporta una mejora de ChrF++ de 38,78 a 58,08 en esta tarea.
- Anotación lingüística y NLP de bajos recursos: útil como etiquetador UPOS zero-shot (73,00% en `UD_Sindhi-Isra`) para pre-anotar corpus sindhi antes de revisión humana.
- Despliegue en hardware de consumo para prototipos: con una huella estática de 6,06 GB de VRAM en bfloat16, cabe en GPUs de 8 GB (RTX 3070/4060) según el autor, lo que permite iterar localmente sin infraestructura cloud.
- Educación y acceso a la información en sindhi: un asistente ligero y de bajo consumo (3,21 J/token según el autor) puede servir en entornos con recursos energéticos limitados o despliegues edge.
- Investigación en compresión de modelos: sirve como referencia reproducible de pruning de vocabulario y eliminación de modalidades con preservación de rendimiento en benchmarks estrictos.

## Benchmarks y rendimiento

Datos reportados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Baseline (`google/gemma-4-E2B-it`) | Modelo podado + SFT | Delta |
|---|---|---|---|
| UD_Sindhi-Isra UPOS (zero-shot) | 66,00% | 73,00% | +7,00 abs (+10,61% rel.) |
| Belebele `snd_Arab` (100 preguntas) | 45,00% | 45,00% | 0,00 |
| Traducción EN→SD (ChrF++) | 14,88 | 52,08 | +249,9% |
| Traducción UR→SD (ChrF++) | 52,74 | 72,63 | +37,7% |
| Resumen (ChrF++) | 38,78 | 58,08 | +49,8% |
| VRAM estática | 9,51 GB | 6,06 GB | -36,3% |
| Tamaño en disco | 10,20 GB | 6,51 GB | -36,2% |
| Energía por token | 4,64 J | 3,21 J | -30,8% |
| Potencia activa de GPU | 55,47 W | 39,43 W | -28,9% |

## Requisitos de hardware

- VRAM estimada para inferencia: 6,06 GB en bfloat16 según el autor; con cuantización a 8 bits o 4 bits cabría esperar reducciones adicionales, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: RTX 3070, RTX 4060 u otras con 8 GB de VRAM para bfloat16; A100/H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB según las cifras del autor.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están documentados en la información disponible (no hay pesos GGUF publicados).
- Latencia y throughput: no disponibles de forma explícita; el autor reporta consumo energético de 3,21 J/token y potencia activa de 39,43 W, medidos en hardware de servidor no especificado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Sindhi Gemma 4 E2B IT 128k SFT | 3,25B | 128k | sd, ur, en | Apache 2.0 | Poda de vocabulario -50%, text-only |
| `google/gemma-4-E2B-it` (baseline) | no disponible | no disponible | multilingüe | Gemma license | Multimodal, vocabulario 262.144; peor ChrF++ en sindhi según el autor |
| `Kashif786/gemma-4-E2B-it-text-only-128k-pruned` (base) | no disponible | 128k | sd, ur, en | Apache 2.0 | Misma poda, sin SFT en sindhi |

No se dispone de datos de otros modelos comparables de tamaño similar específicos para sindhi en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Gemma 4 y entrenarse con un dataset sindhi de 1.500 ejemplos, puede heredar sesgos del corpus base y del dataset de ajuste.
- Riesgo de alucinación: no evaluado de forma explícita; los benchmarks reportados son de traducción, resumen y etiquetado gramatical, no de factualidad.
- Limitaciones de contexto o idioma: aunque declara 128k de contexto, no se aportan pruebas de rendimiento en ventanas largas; el soporte multilingüe se limita a sindhi, urdu e inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Gemma 4 conviene revisar los términos de la licencia original de Google aplicables al modelo base.
- Caveat de producción: los benchmarks son autoinformados por el autor y no han sido replicados de forma independiente; el dataset de SFT es pequeño (1.500 ejemplos) y puede limitar la generalización fuera de los dominios cubiertos.
- No hay pesos cuantizados publicados (GGUF, AWQ, GPTQ), lo que puede complicar el despliegue en entornos con llama.cpp u Ollama.
- El nombre "E2B" y el recuento real de 3,25B parámetros no coinciden de forma evidente; conviene validar el tamaño efectivo antes de planificar infraestructura.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kashif786/sindhi-gemma-4-E2B-it-128k-sft
- Modelo base podado: https://huggingface.co/Kashif786/gemma-4-E2B-it-text-only-128k-pruned
- Dataset de SFT: https://huggingface.co/datasets/Kashif786/Sindhi-Assistant-IFT-1500
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
