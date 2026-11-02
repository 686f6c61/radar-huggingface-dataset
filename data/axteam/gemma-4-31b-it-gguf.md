# axteam/gemma-4-31B-it-GGUF

## Resumen

`axteam/gemma-4-31B-it-GGUF` es una coleccion de pesos cuantizados en formato GGUF del modelo `google/gemma-4-31B-it`, generada por el usuario axteam mediante la toolchain de llama.cpp. El modelo base es un transformer denso de Google DeepMind con 30.697.345.596 parametros (~30,7 B), disenado originalmente como modelo multimodal image-text-to-text, aunque esta distribucion GGUF contiene unicamente la parte de lenguaje (no incluye el proyector de vision `mmproj`).

El interes practico de esta publicacion es que permite ejecutar un modelo de ~31 B en entornos de inferencia local y consumer hardware mediante llama.cpp, Ollama o LM Studio, con tres niveles de cuantizacion (BF16, Q8_0 y Q4_K_M). El archivo Q4_K_M ocupa 18,7 GB, lo que lo hace viable en GPUs de consumo con 24 GB de VRAM, mientras que el Q8_0 (32,6 GB) y el BF16 (61,4 GB) requieren aceleradores de mayor capacidad o descarga parcial en CPU.

La relevancia de esta ficha radica en que documenta con mediciones reales (divergencia KL y acuerdo top-1 frente al BF16) el coste de calidad de cada cuantizacion, algo poco habitual en repositorios GGUF de terceros. El repositorio tiene 896 descargas y 2 likes en el momento de la consulta, y esta publicado bajo licencia Apache-2.0 en HuggingFace, aunque los pesos originales se rigen por la Gemma 4 license de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (multimodal en origen; esta distribucion GGUF ejecuta solo el lado de lenguaje) |
| Parametros totales | 30.697.345.596 (~30,7 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de llama.cpp usa `-c 8192`) |
| Tipos de cuantizacion | BF16 (sin cuantizar), Q8_0 (8 bits), Q4_K_M (4 bits, k-quants de llama.cpp) |
| Idiomas soportados | no disponible en la informacion proporcionada (la model card incluye textos en ingles y coreano en las mediciones) |
| Licencia | Apache-2.0 en el repo; los pesos base se rigen por la Gemma 4 license (`https://ai.google.dev/gemma/docs/gemma_4_license`) |
| Formato de pesos | GGUF (llama.cpp), con chat template embebido en el archivo |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-31B-it` es un transformer denso de la familia Gemma 4 de Google DeepMind, con 30,7 B de parametros y diseno multimodal (image-text-to-text). Esta publicacion GGUF no incluye el proyector de vision, por lo que el modelo resultante procesa exclusivamente texto. El chat template de instrucciones esta embebido en el propio archivo GGUF, lo que simplifica el despliegue en llama.cpp, Ollama y LM Studio.

La cuantizacion es post-training quantization (PTQ) realizada con llama.cpp mediante `convert_hf_to_gguf.py` y `llama-quantize`, partiendo del BF16 original. Se aplica cuantizacion por bloques (k-quants) con escalas por bloque y asignacion mixta de bits, sin reentrenamiento ni QAT. El autor reporta mediciones de fidelidad frente al BF16 en GPU (NVIDIA B200, llama.cpp b12005, commit e0f142d, CUDA, todas las capas en GPU, 16 ventanas de 2048 tokens de WikiText-2 y de una muestra de Wikipedia en coreano), forzando BOS mediante `--override-kv tokenizer.ggml.add_bos_token=bool:true` porque los tokenizers de gemma-4 no lo anaden por defecto.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat embebida (formato instruct).
- Razonamiento y respuesta a preguntas en lenguaje natural (verificado con preguntas sobre capitales en ingles y coreano).
- Capacidades multilingues: la model card demuestra funcionamiento en ingles y coreano; el listado completo de idiomas no esta disponible.
- Capacidades multimodales (vision) presentes en el modelo base, pero **no utilizables** en esta distribucion GGUF al faltar el archivo `mmproj`.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- **Asistente conversacional local en estacion de trabajo**: con el archivo Q4_K_M (18,7 GB) y `llama-server`, se puede desplegar un chatbot multi-turno en una GPU de 24 GB, usando el chat template embebido y los parametros de muestreo recomendados por Google (temperature=1.0, top_p=0.95, top_k=64).
- **Procesamiento de documentos en ingles y coreano**: el autor verifica el funcionamiento en ambos idiomas; util para resumen, extraccion y reescritura de textos en esos idiomas con contexto de hasta 8K tokens en los ejemplos.
- **Prototipado rapido con Ollama**: mediante `ollama run hf.co/axteam/gemma-4-31B-it-GGUF:Q4_K_M` se puede integrar el modelo en flujos de desarrollo sin gestionar manualmente pesos ni plantillas.
- **Evaluacion comparativa de cuantizaciones**: los datos de KLD y acuerdo top-1 permiten decidir entre Q4_K_M (mas rapido y ligero) y Q8_0 (mas fiel al BF16) segun la tolerancia a degradacion en tareas de generacion.
- **Generacion de codigo y texto tecnico en local**: aunque no hay benchmarks publicados de HumanEval o similar en esta ficha, el modelo base es un instruct generalista; el Q8_0 (32,6 GB) es la opcion recomendada cuando se prioriza fidelidad sobre velocidad.
- **Despliegue en entornos con VRAM limitada**: el Q4_K_M con KV cache en q8_0 y `-fa on` reduce a la mitad el consumo de cache, permitiendo contextos mas largos en GPUs de 24 GB.
- **Re-cuantizacion o ajuste fino posterior**: el archivo BF16 (61,4 GB) sirve como referencia para generar nuevas cuantizaciones o para servir como base de experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta mediciones de fidelidad de cuantizacion frente al BF16:

| Archivo | KLD media vs BF16 (EN / KO) | Acuerdo top-1 vs BF16 (EN / KO) |
|---|---|---|
| Q4_K_M | 0.9914 / 1.2677 | 70,4% / 67,0% |
| Q8_0 | 0.2056 / 0.3726 | 90,3% / 87,1% |

Medido en NVIDIA B200 con llama.cpp b12005 (commit e0f142d, build CUDA) el 2026-11-02, 16 ventanas de 2048 tokens de WikiText-2 y de una muestra de Wikipedia en coreano. El autor advierte que la perplejidad de texto crudo no es significativa para un checkpoint instruct (el propio BF16 obtiene 18.783 en WikiText-2 sin su chat template), por lo que se compara cada cuantizacion contra el BF16 sobre los mismos tokens.

## Requisitos de hardware

- **VRAM estimada**: Q4_K_M ~18,7 GB de pesos + KV cache del contexto elegido; Q8_0 ~32,6 GB + KV cache; BF16 ~61,4 GB + KV cache.
- **GPU recomendadas**: el autor verifica en NVIDIA B200. Para Q4_K_M es viable en GPUs de 24 GB (RTX 4090, A10G 24 GB, L4 24 GB) con contexto moderado; Q8_0 requiere ~40-48 GB (A100 40/80 GB, H100, L40S 48 GB); BF16 requiere ~80 GB (H100 80 GB, A100 80 GB) o descarga parcial en CPU.
- **Consumer GPU**: si, Q4_K_M cabe en RTX 4090 (24 GB) y en GPUs de 24 GB en general, siempre que se ajuste el contexto y se use `--cache-type-k q8_0 --cache-type-v q8_0 -fa on` para reducir el KV cache.
- **Opciones de despliegue**: llama.cpp (build >= b8637 para arquitectura `gemma4`; `-fa on` requiere >= b6325), Ollama, LM Studio (no probado por el autor), y cualquier runtime compatible con GGUF.
- **Latencia y throughput**: no disponibles en la informacion proporcionada. El autor solo indica que todos los archivos cargaron con todas las capas en GPU en una B200 y respondieron correctamente a dos preguntas cortas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales frente a alternativas plausibles de rango similar. Los datos de los modelos comparados no han sido verificados en esta busqueda y se marcan como no disponibles cuando no se conocen con certeza.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| axteam/gemma-4-31B-it-GGUF (este) | ~30,7 B | no disponible | GGUF (BF16/Q8_0/Q4_K_M) | Apache-2.0 (repo) / Gemma 4 license (pesos) | Solo texto; sin `mmproj` |
| google/gemma-4-31B-it | ~30,7 B | no disponible | safetensors (BF16) | Gemma 4 license | Modelo base multimodal completo |
| Alternativas de ~30 B (p. ej. familia Qwen, Llama) | ~30 B | no disponible | GGUF, safetensors | variable | no disponible en esta busqueda |

## Limitaciones y advertencias

- **Sin vision**: esta distribucion GGUF no incluye `mmproj`, por lo que no puede procesar imagenes aunque el modelo base sea multimodal.
- **Licencia**: el repo declara Apache-2.0, pero los pesos, tokenizer y chat template pertenecen a Google DeepMind y se rigen por la Gemma 4 license, que puede imponer restricciones adicionales al uso comercial. Verificar antes de desplegar en produccion.
- **Degradacion por cuantizacion**: Q4_K_M presenta un acuerdo top-1 frente al BF16 de solo 70,4% en ingles y 67,0% en coreano, con KLD ~1,0-1,3. Para tareas sensibles a fidelidad se recomienda Q8_0 (90,3%/87,1% de acuerdo top-1).
- **Perplejidad no significativa**: el autor advierte que la PPL de texto crudo no es una metrica valida para este checkpoint instruct sin su chat template.
- **Idiomas**: solo se verifica ingles y coreano; el resto de idiomas no esta documentado.
- **Contexto**: la longitud de contexto nativa no se especifica; los ejemplos usan 8192 tokens y el KV cache crece con `-c`.
- **Sesgos y alucinacion**: no hay informacion especifica sobre sesgos o tasas de alucinacion en la documentacion proporcionada; al ser un modelo instruct generalista, se aplican los riesgos habituales.
- **Ollama y LM Studio**: el autor no los ha probado; el comando de Ollama se ofrece como referencia, no como garantia.
- **Version de llama.cpp**: se requiere build >= b8637 para la arquitectura `gemma4`; versiones anteriores no cargaran el modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/axteam/gemma-4-31B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Archivo BF16: https://huggingface.co/axteam/gemma-4-31B-it-GGUF/blob/main/gemma-4-31B-it-GGUF-BF16.gguf
- Archivo Q4_K_M: https://huggingface.co/axteam/gemma-4-31B-it-GGUF/blob/main/gemma-4-31B-it-GGUF-Q4_K_M.gguf
- Archivo Q8_0: https://huggingface.co/axteam/gemma-4-31B-it-GGUF/blob/main/gemma-4-31B-it-GGUF-Q8_0.gguf
