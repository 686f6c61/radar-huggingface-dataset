# axteam/gemma-4-31B-GGUF

## Resumen

`axteam/gemma-4-31B-GGUF` es una compilación de cuantizaciones GGUF del modelo `google/gemma-4-31B`, convertida por el usuario axteam mediante el flujo estándar de llama.cpp (`convert_hf_to_gguf.py` y `llama-quantize`). El modelo original es un transformer denso multimodal de Google DeepMind (familia Gemma 4), del que aquí se distribuye únicamente la parte lingüística: el repositorio no incluye fichero `mmproj`, por lo que no admite entrada de imagen pese a que la pipeline declarada sea `image-text-to-text`.

Se trata de un modelo base preentrenado, sin plantilla de chat, orientado a continuación de texto en crudo. Con 30.697.345.596 parámetros en safetensors y un repositorio de 112,7 GB, la ficha ofrece tres ficheros: BF16 (61,4 GB), Q8_0 (32,6 GB) y Q4_K_M (18,7 GB). La cuantización es post-entrenamiento (PTQ) con k-quants de llama.cpp, sin reentrenamiento ni QAT, y el autor publica perplejidad medida en GPU para cada variante.

Su relevancia práctica es que permite ejecutar un modelo de ~31B en hardware de consumo mediante Q4_K_M, con pérdida de calidad medida muy contenida (+2,8 % en perplejidad sobre WikiText-2 respecto a BF16) y compatibilidad con llama.cpp, Ollama y LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4, transformer denso (el GGUF ejecuta solo la parte de lenguaje del modelo multimodal original) |
| Parametros totales | 30.697.345.596 (~30,7B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (los ejemplos de uso emplean `-c 8192`) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (k-quants de llama.cpp, PTQ) |
| Idiomas soportados | no disponible (la model card incluye evaluación en ingles y coreano, pero no una lista oficial de idiomas) |
| Licencia | Apache-2.0 segun metadatos de HuggingFace; la model card remite a la Gemma 4 license de Google |
| Formato de pesos | GGUF (un fichero por cuantizacion) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-31B` es un transformer denso de la familia Gemma 4 con 30,7B parametros y naturaleza multimodal en su version original. La version GGUF aqui publicada contiene exclusivamente el lado del lenguaje: el autor indica explicitamente que no hay fichero `mmproj` (proyector de vision), de modo que la inferencia es solo de texto. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras) del modelo original.

La innovacion tecnica de este repositorio es la propia cadena de cuantizacion: cuantizacion por bloques con escalas por bloque y asignacion mixta de bits (k-quants), con redondeo refinado al vecino mas cercano, aplicada sobre los pesos BF16 sin reentrenamiento. El autor documenta un detalle relevante para reproducir mediciones: los tokenizadores GGUF de gemma-4 no anaden el token BOS (lo hace la plantilla de chat), por lo que la perplejidad debe medirse forzando BOS con `--override-kv tokenizer.ggml.add_bos_token=bool:true`; sin ello los valores carecen de sentido. Tambien se documenta el uso de atencion con `-fa on` y la posibilidad de cuantizar la cache KV a q8_0 en tiempo de ejecucion para reducir memoria.

## Capacidades

- Generacion de texto por continuacion (modelo base, sin plantilla de chat): completa prompts en crudo, sin formato conversacional.
- Razonamiento y conocimiento general heredados del modelo Gemma 4 original, si bien no se documentan evaluaciones especificas en este repositorio.
- Procesamiento multilingue: la model card incluye una medicion de perplejidad sobre una muestra de Wikipedia en coreano, lo que evidencia manejo de al menos ingles y coreano; no hay lista oficial de idiomas.
- Sin soporte de vision en esta compilacion: no se incluye proyector multimodal (`mmproj`), por lo que la entrada es exclusivamente texto.
- Sin soporte documentado de tool calling, function calling ni modo agente: al ser un modelo base sin plantilla de chat, no se describe ninguna capacidad de este tipo.
- Compatibilidad con llama.cpp (arquitectura `gemma4`, requiere build >= b8637), Ollama (`ollama run hf.co/axteam/gemma-4-31B-GGUF:Q4_K_M`) y, por formato, LM Studio (no probado por el autor).
- Ajuste de muestreo recomendado por Google: `temperature=1.0`, `top_p=0.95`, `top_k=64`.

## Casos de uso

- Continuacion de texto y generacion libre en bruto: al ser un modelo base sin plantilla de chat, encaja en tareas de completado de parrafos, redaccion asistida por prompt y generacion de texto sin estructura conversacional, usando `llama-completion` con `-no-cnv`.
- Evaluacion de calidad de cuantizacion: investigadores pueden reproducir las mediciones de perplejidad del autor (WikiText-2 y Wikipedia en coreano, 16 ventanas de 2.048 tokens) para comparar BF16, Q8_0 y Q4_K_M en su propio hardware.
- Fine-tuning ligero sobre un modelo base solido: al tratarse de pesos preentrenados sin alineacion conversacional, sirve como punto de partida para adaptaciones posteriores con datos propios.
- Despliegue local en estaciones de trabajo con una sola GPU: el fichero Q4_K_M (18,7 GB) permite servir el modelo con llama-server en GPUs de 24 GB, con contexto configurable mediante `-c`.
- Generacion de texto en coreano e ingles: la evaluacion incluida sobre Wikipedia coreana sugiere utilidad en tareas de continuacion de texto en ambos idiomas, aunque no hay garantias documentadas para otros.
- Prototipado e integracion en pipelines de inferencia locales: la compatibilidad con Ollama y llama.cpp facilita incorporar el modelo a herramientas de desarrollo sin infraestructura de servidor dedicada.
- Experimentacion con cuantizacion: el fichero BF16 sirve como referencia para re-cuantizar a otros formatos o niveles de bits con `llama-quantize`.

## Benchmarks y rendimiento

El autor publica unicamente perplejidad medida con llama.cpp b12005 (commit e0f142d, build CUDA) sobre una NVIDIA B200, con todas las capas en GPU, 16 ventanas de 2.048 tokens de WikiText-2 y de una muestra de Wikipedia en coreano. Valores mas bajos son mejores; los porcentajes son relativos al fichero BF16 del repositorio.

| Fichero | PPL WikiText-2 | PPL Wikipedia coreano | vs BF16 (EN / KO) |
|---|---|---|---|
| `gemma-4-31B-GGUF-BF16.gguf` | 4,66 | 3,30 | referencia |
| `gemma-4-31B-GGUF-Q8_0.gguf` | 4,67 | 3,30 | +0,1 % / -0,0 % |
| `gemma-4-31B-GGUF-Q4_K_M.gguf` | 4,79 | 3,38 | +2,8 % / +2,5 % |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas la cache KV del contexto configurado. Q4_K_M: ~18,7 GB; Q8_0: ~32,6 GB; BF16: ~61,4 GB.
- Cache KV: puede reducirse a la mitad en tiempo de ejecucion con `--cache-type-k q8_0 --cache-type-v q8_0 -fa on`.
- GPU recomendadas: el autor verifico todos los ficheros en una NVIDIA B200 con todas las capas en GPU. Para Q4_K_M, una GPU de 24 GB (RTX 4090, A10G, L4 de mayor memoria no aplica) es suficiente para contexto moderado; Q8_0 requiere ~40 GB o mas (A100 40/80 GB, H100); BF16 requiere 80 GB (A100 80 GB, H100).
- Cabe en GPU de consumo: si, Q4_K_M en RTX 4090 (24 GB) con contexto limitado; Q8_0 y BF16 no caben en GPUs de consumo.
- Opciones de despliegue: llama.cpp (build >= b8637 para arquitectura `gemma4`; `-fa on` requiere >= b6325), Ollama, LM Studio (no probado por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor solo confirma que los ficheros cargan con todas las capas en GPU y producen continuaciones fluidas en una comprobacion breve.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `axteam/gemma-4-31B-GGUF` (Q4_K_M) | ~30,7B denso | no disponible | GGUF | Apache-2.0 / Gemma 4 license | Solo texto; PPL WikiText-2 4,79 |
| `google/gemma-4-31B` (original) | ~30,7B denso | no disponible | safetensors | Gemma 4 license | Multimodal completo; referencia BF16 con PPL 4,66 |
| Alternativas de ~30B en GGUF | no disponible | no disponible | GGUF | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion sobre modelos comparables de otros desarrolladores en los datos proporcionados; la unica comparacion fiable es interna, entre las cuantizaciones del propio repositorio y el modelo base original.

## Limitaciones y advertencias

- Modelo base sin plantilla de chat: no esta disenado para dialogos multi-turno ni para seguir instrucciones; usarlo como asistente conversacional producira resultados deficientes.
- Sin capacidad de vision en esta compilacion: la ausencia de `mmproj` impide cualquier tarea de imagen-texto pese a que la pipeline declarada sea `image-text-to-text`.
- Perdida de calidad por cuantizacion: Q4_K_M incrementa la perplejidad un 2,8 % en ingles y un 2,5 % en coreano respecto a BF16; para tareas sensibles a la precision conviene Q8_0 o BF16.
- Riesgo de alucinacion: inherente a los modelos de lenguaje preentrenados; no se documentan mitigaciones especificas en este repositorio.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la informacion disponible.
- Idiomas: solo se ha medido ingles y coreano; no hay lista oficial de idiomas soportados ni garantias para el castellano.
- Licencia: los metadatos de HuggingFace indican Apache-2.0, pero la model card remite a la Gemma 4 license de Google y senala que los pesos y el tokenizador pertenecen a Google DeepMind. Conviene revisar los terminos de la Gemma 4 license antes de un uso comercial, ya que pueden imponer restricciones adicionales.
- Detalle de reproducibilidad: sin forzar BOS en el tokenizador, las mediciones de perplejidad no son validas; tenerlo en cuenta al comparar resultados propios.
- Ollama y LM Studio no han sido probados por el autor; el soporte en esas herramientas es inferido del formato, no verificado.
- Fecha de publicacion futura en los metadatos (creado 2026-10-11): verificar la vigencia de los enlaces y de la version de llama.cpp requerida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/axteam/gemma-4-31B-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-31B
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Fichero BF16: https://huggingface.co/axteam/gemma-4-31B-GGUF/blob/main/gemma-4-31B-GGUF-BF16.gguf
- Fichero Q4_K_M: https://huggingface.co/axteam/gemma-4-31B-GGUF/blob/main/gemma-4-31B-GGUF-Q4_K_M.gguf
- Fichero Q8_0: https://huggingface.co/axteam/gemma-4-31B-GGUF/blob/main/gemma-4-31B-GGUF-Q8_0.gguf
