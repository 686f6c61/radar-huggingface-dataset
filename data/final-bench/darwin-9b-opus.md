# FINAL-Bench/Darwin-9B-Opus

## Resumen

Darwin-9B-Opus es un modelo de razonamiento denso de 9.653 millones de parametros publicado por FINAL-Bench, construido mediante la tecnica propietaria Darwin V5 a partir de la arquitectura Qwen3.5-9B. No se trata de un entrenamiento desde cero, sino de una fusion evolutiva a nivel de tensor entre dos modelos con la misma arquitectura base: el Qwen3.5-9B original (con preentrenamiento y RLHF) como "padre" y una version afinada con LoRA SFT sobre cadenas de razonamiento de Claude 4.6 Opus como "madre". El resultado es un modelo denso que hereda el conocimiento de base del Qwen original y los patrones de razonamiento estilo Claude Opus.

La relevancia del modelo reside en su enfoque de fusion: Darwin V5 combina diagnosticos por capa (Model MRI, basado en norma L2, entropia de Shannon y desviacion tipica por tensor), busqueda evolutiva con CMA-ES sobre el espacio de genomas de fusion y el algoritmo DARE-TIES. Esto permite derivar ratios de mezcla por tensor en lugar de aplicar un ratio global, con trasplantes directos cuando el ratio cae fuera del rango [0.05, 0.95].

El modelo declara 131K tokens de contexto, soporte para 201 idiomas (con 9 idiomas documentados explicitamente: ingles, chino, coreano, japones, aleman, frances, espanol, ruso y arabe), licencia Apache 2.0 y pesos en BF16. Su orientacion es el razonamiento con chain-of-thought, el codigo y el tool calling en entornos de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-9B) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131K tokens (segun model card) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16; no se listan GGUF oficiales para este tamano) |
| Idiomas soportados | 201 idiomas declarados; documentados: en, zh, ko, ja, de, fr, es, ru, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |
| Tamano del repo | 19,3 GB |
| Libreria | transformers |
| Pipeline | text-generation (tags incluyen image-text-to-text) |

## Arquitectura y entrenamiento

El modelo es un transformer denso con la arquitectura Qwen3.5-9B. No hay entrenamiento desde cero: ambos progenitores comparten exactamente la misma arquitectura. El "padre" es Qwen/Qwen3.5-9B, con preentrenamiento original y RLHF. La "madre" es Jackrong/Qwen3.5-9B-Claude-4.6-Opus-Reasoning-Distilled, un LoRA SFT sobre la misma base entrenado con cadenas de razonamiento de texto de Claude 4.6 Opus.

El proceso Darwin V5 se apoya en tres componentes. Primero, Model MRI: un perfilado por capa de indicadores de salud de tensores (norma L2, entropia de Shannon y desviacion tipica por tensor en todas las capas). Segundo, una comparacion por tensor entre progenitores que produce un `ratio_b` a partir de una puntuacion compuesta (`entropy * 0.5 + std * 0.3 + clamp(norm, 100) * 0.002`). Tercero, una busqueda evolutiva con CMA-ES sobre un genoma de seis dimensiones (ratio, attn, ffn, embed, density_a, density_b), en dos fases: 200 pasos con proxy heuristico y 10 pasos con benchmark real. El ratio final combina un 70% de diagnostico MRI y un 30% de genoma, y la fusion efectiva se realiza con DARE-TIES (mascara binaria aleatoria sobre el delta y suma ponderada). Cuando el ratio MRI cae por debajo de 0,05 o supera 0,95 se aplica un trasplante directo del tensor de un solo progenitor, sin interpolacion. La implementacion es propia: no usa mergekit ni ninguna libreria externa de fusion.

## Capacidades

- Generacion de texto y razonamiento avanzado con modo thinking y chain-of-thought explicito.
- Razonamiento de multiples pasos orientado a tareas complejas (advanced-reasoning, multi-step reasoning).
- Generacion y asistencia de codigo, con orientacion a agentes de codificacion (coding-agent).
- Tool calling y function calling para integracion en pipelines de agentes.
- Contexto largo de hasta 131K tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades multilingues amplias: 201 idiomas declarados, con nueve idiomas documentados explicitamente.
- Capacidad multimodal declarada en los tags (image-text-to-text), aunque la model card no detalla el modulo de vision ni su entrenamiento.
- Perfil de razonamiento destilado de Claude 4.6 Opus, orientado a trazas de pensamiento estructuradas.

## Casos de uso

- Razonamiento sobre documentos largos: con 131K tokens de contexto, el modelo puede ingerir contratos, informes tecnicos o expedientes completos y responder preguntas que requieren cruzar informacion entre secciones distantes sin trocear el documento.
- Agentes de codificacion: su soporte de tool calling y su orientacion a coding-agent permiten integrarlo en bucles de edicion de codigo, ejecucion de tests y correccion iterativa dentro de pipelines de CI/CD.
- Asistencia en investigacion cientifica: el resultado declarado de 82,5 en GPQA Diamond sugiere utilidad en preguntas de nivel posgrado de fisica, quimica y biologia, aprovechable en herramientas de revision de hipotesis y sintesis de literatura.
- Atencion al cliente tecnica multi-turno: el contexto largo y el soporte multilingue permiten mantener conversaciones prolongadas con historial completo y atender usuarios en espanol, aleman, frances, arabe u otros idiomas documentados.
- Generacion de razonamiento explicito para auditoria: el modo thinking produce trazas de cadena de pensamiento que pueden registrarse y revisarse en entornos donde se exige justificar la respuesta, como analisis de riesgo o cumplimiento normativo.
- Traduccion y localizacion multilingue: con 201 idiomas declarados, es utilizable en tareas de traduccion tecnica y adaptacion de contenido entre los idiomas documentados.
- Prototipado en investigacion de fusiones de modelos: al ser un artefacto de Darwin V5 con pesos abiertos y Apache 2.0, sirve como referencia reproducible para estudiar tecnicas de model merging a nivel de tensor.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index de la model card (no verificados de forma independiente):

| Benchmark | Tarea | Metrica | Valor |
|---|---|---|---|
| GPQA Diamond | Question answering | Accuracy | 82,5 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks, ni comparaciones numericas con modelos similares.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 19,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda un margen de 24 a 32 GB para contexto moderado.
- GPU profesionales: A100 40/80 GB, H100 80 GB y L40S 48 GB cubren el modelo con holgura, incluyendo contextos largos.
- GPU de consumo: una RTX 4090 (24 GB) queda al limite en BF16 y puede requerir cuantizacion o descarga parcial de capas; una RTX 3090 (24 GB) presenta la misma restriccion.
- Cuantizacion: la model card no publica GGUF oficiales para esta variante de 9B, por lo que la inferencia en consumer GPU en 8 bits o 4 bits requeriria conversion propia.
- Despliegue: compatible con transformers; el ecosistema habitual (vLLM, TGI, llama.cpp tras conversion a GGUF, Ollama) es aplicable, aunque solo transformers esta confirmado por la libreria declarada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Darwin-9B-Opus | 9,65B denso | 131K | Apache 2.0 | Fusion evolutiva Darwin V5; GPQA Diamond 82,5 declarado |
| Qwen3.5-9B (progenitor) | ~9B denso | No disponible en esta ficha | No disponible en esta ficha | Base original con preentrenamiento y RLHF |
| Qwen3.5-9B-Claude-4.6-Opus-Reasoning-Distilled (progenitor) | ~9B denso | No disponible en esta ficha | No disponible en esta ficha | LoRA SFT sobre cadenas de razonamiento de Claude 4.6 Opus |
| Darwin-4B-Opus / Darwin-31B-Opus / Darwin-35B-A3B-Opus | 4B / 31B / 35B (A3B MoE) | No disponible en esta ficha | Apache 2.0 (segun enlaces de la model card) | Variantes de la misma familia Darwin |

No se dispone de datos de benchmarks de los progenitores ni de las otras variantes Darwin en la informacion proporcionada, por lo que la comparacion de rendimiento queda limitada al unico dato declarado de GPQA Diamond.

## Limitaciones y advertencias

- El unico benchmark publicado (GPQA Diamond, 82,5) esta marcado como no verificado (`verified: false`) y procede del propio autor; no debe tomarse como evidencia independiente.
- Al ser una fusion de pesos y no un entrenamiento completo, el comportamiento en dominios fuera de la distribucion de los progenitores es incierto y puede degradarse de forma no uniforme entre capas.
- Riesgo de alucinacion inherente a los modelos generativos; el modo chain-of-thought no garantiza correccion factual y puede producir razonamientos plausibles pero erroneos.
- La capacidad multimodal aparece en los tags (image-text-to-text) pero no se documenta en la model card; conviene validarla empiricamente antes de usarla en produccion.
- El soporte de 201 idiomas es una declaracion del autor sin evaluacion publicada por idioma; el rendimiento real en idiomas distintos de los nueve documentados es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero las cadenas de razonamiento destiladas de Claude 4.6 Opus pueden plantear cuestiones sobre los terminos de uso del modelo original; conviene revisar la procedencia de los datos de destilacion antes de un despliegue comercial.
- No se publican GGUF oficiales para esta variante, lo que limita el despliegue en hardware de consumo sin trabajo adicional de conversion y validacion.
- No hay informacion sobre sesgos especificos, evaluaciones de seguridad ni filtros de contenido aplicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-9B-Opus
- Demo (Space): https://huggingface.co/spaces/FINAL-Bench/Darwin-9B-Opus
- Progenitor padre: https://huggingface.co/Qwen/Qwen3.5-9B
- Progenitor madre: https://huggingface.co/Jackrong/Qwen3.5-9B-Claude-4.6-Opus-Reasoning-Distilled
- Variante Darwin-4B-Opus: https://huggingface.co/FINAL-Bench/Darwin-4B-Opus
- Variante Darwin-4B-David: https://huggingface.co/FINAL-Bench/Darwin-4B-David
- Variante Darwin-4B-Genesis: https://huggingface.co/FINAL-Bench/Darwin-4B-Genesis
- Variante Darwin-31B-Opus: https://huggingface.co/FINAL-Bench/Darwin-31B-Opus
- Variante Darwin-35B-A3B-Opus: https://huggingface.co/FINAL-Bench/Darwin-35B-A3B-Opus
- GGUF oficial Q8 de la variante 35B: https://huggingface.co/FINAL-Bench/Darwin-35B-A3B-Opus-Q8-GGUF
- GGUF de bartowski (variante 35B): https://huggingface.co/bartowski/FINAL-Bench_Darwin-35B-A3B-Opus-GGUF
- Leaderboard FINAL Bench: https://huggingface.co/spaces/FINAL-Bench/Leaderboard
- Leaderboard ALL Bench: https://huggingface.co/spaces/FINAL-Bench/all-bench-leaderboard
- Familia POCKET (demo CPU): https://huggingface.co/spaces/FINAL-Bench/POCKET-35B-CPU
- Coleccion POCKET: https://huggingface.co/collections/FINAL-Bench/pocket-models-6a618ee5d23eafb7e185a5c6
- Paper referenciado (arxiv:2311.03099): https://arxiv.org/abs/2311.03099
- Paper referenciado (arxiv:2605.14386): https://arxiv.org/abs/2605.14386
