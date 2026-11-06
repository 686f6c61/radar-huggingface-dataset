# Igor282/gemma-4-e4b-pruned-ru-en-Q4_K_M

## Resumen
Gemma-4-E4B Pruned RU+EN Q4_K_M es una adaptación del modelo google/gemma-4-E4B-it publicada por el usuario Igor282 en Hugging Face. No es un fine-tuning ni una destilación: los pesos del transformer original se mantienen intactos y la modificación se limita al tokenizador y a las dos matrices de embedding asociadas al vocabulario. Se eliminan 71.723 tokens (un 27,4% del vocabulario, de 262.144 a 190.421) correspondientes a escrituras poco frecuentes en un contexto de trabajo ruso-inglés: CJK, kana, árabe, hebreo, devanagari, coreano, tailandés, griego, armenio y georgiano, entre otras.

El objetivo declarado es reducir el peso del vocabulario, que en Gemma-4-E4B supone unos 3,5B de parámetros de los aproximadamente 8B del modelo (un 44%), para que el modelo completo con su ventana de contexto de 131.072 tokens quepa en una GPU de consumo de 6 GB de VRAM, en concreto una RTX 3060 de portátil. El artefacto distribuido es un GGUF cuantizado en Q4_K_M para llama.cpp, acompañado de un modelo draft también pruneado para decodificación especulativa.

La relevancia actual reside en la técnica: demuestra que el pruning de vocabulario sobre un tokenizador BPE puede ser lossless si se aplican condiciones estrictas de conservación (tokens especiales, corpus de referencia y cierre por merges), y que esa reducción se traduce en un ahorro de VRAM que habilita contextos largos en hardware modesto sin tocar las capas de atención ni las MLP.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma-4-E4B, 42 capas) con tokenizador BPE y mecanismo MatFormer / per-layer embeddings |
| Parámetros totales | 6.563.292.714 (según safetensors del repo) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantización | Q4_K_M (artefacto publicado); F16 disponible en la cadena de construcción; KV-cache cuantizable a q8_0 |
| Idiomas soportados | Ruso e inglés como idiomas objetivo del pruning; cobertura multilingüe residual vía byte-fallback |
| Licencia | Apache 2.0 (con license_link a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
El modelo base es google/gemma-4-E4B-it, un transformer de 42 capas con 131.072 tokens de contexto y un vocabulario BPE de 262.144 entradas con 514.906 merges, byte-fallback y marcador `▁`. La particularidad estructural es el uso de `per_layer_embeddings` (mecanismo tipo MatFormer / Gemma-3n) con forma 262.144 × 10.752, que suma unos 2,82B de parámetros, a los que se añaden unos 0,67B de `embed_tokens` (262.144 × 2.560). En conjunto, el vocabulario concentra aproximadamente el 44% de los parámetros del modelo.

No hay entrenamiento adicional: el autor declara explícitamente que los pesos no se tocan y que no se trata de destilación, fine-tuning ni abliteration. El pruning se realizó sobre la modelo HF original en BF16 (no sobre el GGUF, ya que los bloques Q4_K no permiten cortes arbitrarios por filas del vocabulario), y después se reconstruyó y cuantizó el GGUF con `convert_hf_to_gguf.py` y `llama-quantize`. El carácter lossless se sostiene sobre cuatro condiciones verificadas: conservación de los 6.581 tokens especiales y de byte (`<pad>`, `<eos>`, `<bos>`, `<unk>`, `<|turn|>`, `<unused*>`, `<0xNN>`), conservación de todos los tokens del corpus de referencia (65.908 documentos, 348,6M tokens, con wikitext para inglés, Wikipedia para ruso y un corpus de código real), cierre por merges (si se conserva un padre `a+b` se conservan sus hijos, lo que añade 1.592 tokens) y una comprobación de punto fijo que re-segmenta el corpus con el tokenizador antiguo y el nuevo y compara token a token. El autor reporta una variación de perplejidad en held-out de −0,2% en ruso, −0,0% en inglés y −0,0% en código. El modelo draft para decodificación especulativa proviene de google/gemma-4-E4B-it-assistant (4 capas, hidden 256) y se pruneó con la misma máscara de conservación.

## Capacidades
- Generación de texto conversacional multi-turno en ruso e inglés, heredada del modelo instruct original.
- Razonamiento, matemáticas y generación de código, preservados al no haberse modificado las capas de atención ni las MLP.
- Decodificación especulativa mediante el draft pruneado incluido en el repo, con ganancia medida en CPU de 10,4 t/s a 19,4 t/s.
- Soporte de contexto largo: hasta 131.072 tokens, con KV-cache cuantizado a q8_0 para ajustarlo a 6 GB de VRAM.
- Compatibilidad con llama.cpp y endpoints compatibles (tag `endpoints_compatible`).
- Capacidad any-to-any declarada en los tags del repo, heredada del modelo base.
- Cobertura de escrituras no latinas únicamente a nivel de byte-fallback: caracteres CJK, árabe, hebreo, devanagari y similares siguen siendo representables, pero con mayor coste en tokens.
- Tool calling y function calling: no disponible en la información proporcionada.

## Casos de uso
- Asistencia conversacional ruso-inglés en local: el modelo mantiene la calidad del original en ambos idiomas y cabe en una RTX 3060 de 6 GB con contexto largo, lo que permite desplegar un asistente privado sin conexión en un portátil.
- Procesamiento de documentos extensos en ruso: con 131.072 tokens de contexto y KV-cache q8_0, se pueden ingerir contratos, informes o expedientes completos en una sola pasada sin fragmentación.
- Generación y revisión de código en pipelines de desarrollo: al no haberse alterado las capas medias, conserva la competencia en código del base; el draft especulativo acelera la generación en entornos sin GPU dedicada.
- Servicio multiusuario ligero: el autor reporta 2 slots paralelos (`-np 2`) dentro de los 6 GB, lo que permite atender dos sesiones concurrentes en una sola máquina de gama de entrada.
- Traducción y redacción técnica RU-EN: el pruning está diseñado sobre un corpus de trabajo bilingüe, por lo que la segmentación en ambos idiomas se mantiene idéntica a la del tokenizador original.
- Despliegue en CPU: con 10,4 t/s sin draft y 19,4 t/s con draft en la máquina de referencia, es viable para tareas batch de resumen o clasificación en servidores sin GPU.
- Inferencia en el borde con presupuesto de VRAM ajustado: útil cuando se necesita contexto largo y no se dispone de más de 6 GB, escenario en el que el UD-Q4_K_XL original (5,13 GB) no cabe a 128k.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta métricas de calidad y de inferencia propias:

| Métrica | Valor |
|---|---|
| Perplejidad held-out ruso | −0,2% respecto al original |
| Perplejidad held-out inglés | −0,0% |
| Perplejidad held-out código | −0,0% |
| Tamaño del vocabulario | 262.144 → 190.421 tokens (−27,4%) |
| Parámetros de vocabulario eliminados | −0,95B |
| Tamaño del GGUF | 4,55 GB (Q4_K_M) frente a 5,13 GB del UD-Q4_K_XL de referencia |
| VRAM en servidor real (128.512 ctx, `-np 2`, `-ctk q8_0 -ctv q8_0`, con draft) | 5.493 MiB de 6.144 MiB |
| Generación en contexto corto (GPU) | 44 t/s |
| Procesamiento de prompt (GPU) | ~1.700 t/s |
| Generación a 60k de contexto (GPU) | ~19 t/s |
| Generación en CPU sin draft | 10,4 t/s |
| Generación en CPU con draft | 19,4 t/s |

## Requisitos de hardware
- VRAM estimada: 4,55 GB para los pesos en Q4_K_M; con KV-cache q8_0, draft y 2 slots, el autor mide 5.493 MiB a 128.512 tokens de contexto.
- GPU recomendada por el autor: RTX 3060 de portátil con 6 GB, que es el objetivo de diseño.
- Cabe en GPU de consumo: sí, en tarjetas de 6 GB o más; el original en UD-Q4_K_XL (5,13 GB) no entra a 128k en ese presupuesto.
- Despliegue: llama.cpp (librería declarada), con parámetros de ejemplo `--ctx-size 128512 -np 2 -ctk q8_0 -ctv q8_0`; compatible con endpoints.
- Latencia y throughput: 44 t/s de generación en contexto corto y ~1.700 t/s de prompt en GPU; degradación a ~19 t/s a 60k de contexto por el coste de atención sobre el KV largo.
- CPU: viable con 10,4 t/s sin draft y 19,4 t/s con draft en la máquina de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Igor282/gemma-4-e4b-pruned-ru-en-Q4_K_M | 6,56B (vocabulario pruneado) | 131.072 | Q4_K_M | Apache 2.0 | Hugging Face, GGUF |
| google/gemma-4-E4B-it | ~8B (vocabulario completo) | 131.072 | BF16 en origen | Licencia Gemma 4 | Hugging Face |
| unsloth/gemma-4-E4B-it-GGUF (UD-Q4_K_XL) | ~8B | 131.072 | UD-Q4_K_XL, 5,13 GB | Licencia Gemma 4 | Hugging Face, GGUF |
| Igor282/gemma-4-e4b-pruned-ru-Q4_K_M | no disponible | no disponible | Q4_K_M | no disponible | Hugging Face, GGUF |

La diferencia clave frente al original y al cuantizado de unsloth es el tamaño efectivo: el pruning elimina 0,95B de parámetros de vocabulario y reduce el GGUF en unos 0,58 GB, lo que desplaza el umbral de viabilidad de 128k de contexto de "no cabe" a "cabe con margen" en 6 GB. El coste es la pérdida de eficiencia de tokenización en escrituras no latinas distintas del ruso.

## Limitaciones y advertencias
- El pruning elimina la tokenización eficiente de CJK, kana, árabe, hebreo, devanagari, coreano, tailandés, griego, armenio y georgiano; estos idiomas siguen siendo procesables por byte-fallback, pero consumen más tokens y degradan el rendimiento efectivo.
- El modelo está pensado para ruso e inglés; no debe esperarse calidad equiparable al original en otros idiomas.
- El modelo base es instruct y conserva los sesgos y el riesgo de alucinación del original; el pruning no los mitiga.
- Aunque el autor verifica el pruning como lossless sobre su corpus de referencia, no hay una evaluación independiente con benchmarks estándar que lo confirme.
- La licencia declarada es Apache 2.0, pero el campo `license_link` remite a la licencia de Gemma 4 de Google; conviene revisar los términos de uso comercial del modelo base antes de producción.
- El rendimiento cae con el contexto: de 44 t/s en contexto corto a ~19 t/s a 60k, por el coste de atención sobre el KV-cache.
- El repo tiene 240 descargas y 1 like en el momento de la consulta; es un artefacto de autor individual sin validación comunitaria amplia.
- No se dispone de información sobre tool calling, function calling ni capacidades de agente verificadas en esta variante.

## Enlaces
- [Igor282/gemma-4-e4b-pruned-ru-en-Q4_K_M en Hugging Face](https://huggingface.co/Igor282/gemma-4-e4b-pruned-ru-en-Q4_K_M)
- [Igor282/gemma-4-e4b-pruned-ru-Q4_K_M en Hugging Face](https://huggingface.co/Igor282/gemma-4-e4b-pruned-ru-Q4_K_M)
- [google/gemma-4-E4B-it](https://huggingface.co/google/gemma-4-E4B-it)
- [google/gemma-4-E4B-it-assistant](https://huggingface.co/google/gemma-4-E4B-it-assistant)
- [unsloth/gemma-4-E4B-it-GGUF](https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF)
- [Qwen-Tokenizer-Pruner (referencia metodológica)](https://github.com/KaihuaTang/Qwen-Tokenizer-Pruner)
- [Licencia de Gemma 4](https://ai.google.dev/gemma/docs/gemma_4_license)
