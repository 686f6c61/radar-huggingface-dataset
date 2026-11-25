# Icharle/Huihui-Qwen3.8-27B-abliterated-NVFP4-W4A16

## Resumen

Huihui-Qwen3.8-27B-abliterated-NVFP4-W4A16 es una cuantizacion post-entrenamiento de tipo mixto NVFP4/FP8 del modelo huihui-ai/Huihui-Qwen3.8-27B-abliterated, que a su vez es una version "abliterated" (sin el comportamiento de rechazo) del Qwen3.8-27B del equipo Qwen. La publica el usuario Icharle aplicando la receta oficial de NVIDIA ModelOpt 0.47.0 para la arquitectura `qwen3_5`, con el objetivo de reducir el peso del modelo de 55,6 GB en BF16 a 21,9 GB sin degradar de forma apreciable la calidad de las distribuciones de salida.

El modelo es multimodal (pipeline `image-text-to-text`), con torre de vision en BF16 sin cuantizar, y combina capas de atencion completa con capas Gated DeltaNet, ademas de una cabeza MTP (multi-token prediction). La cuantizacion deja las proyecciones MLP y `lm_head` en NVFP4 con activaciones BF16 (W4A16), la atencion completa y las proyecciones DeltaNet en FP8 W8A8, y la cache KV en FP8.

Su relevancia practica es doble: por un lado demuestra un flujo reproducible de cuantizacion NVFP4 con calibracion orientada a agentes, codigo y chino; por otro, ofrece una variante sin censura con licencia Apache-2.0 pensada para servir en GPUs Blackwell con SGLang, vLLM o TensorRT-LLM. El autor reporta que el checkpoint carga y sirve correctamente en SGLang 0.5.23 con `quant=modelopt_mixed`, incluyendo parsers de tool calling y razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido `qwen3_5` con atencion completa y capas Gated DeltaNet, torre de vision y cabeza MTP |
| Parametros totales | 18.164.649.200 (segun safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: NVFP4 W4A16 (MLP y `lm_head`), FP8 W8A8 (atencion completa y DeltaNet), cache KV FP8; embeddings, vision tower y MTP en BF16 |
| Idiomas soportados | no disponible (la calibracion incluye texto en ingles y chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (3 shards, 21,9 GB); configuracion `hf_quant_config.json` con `quant_algo: MIXED_PRECISION` y `kv_cache_quant_algo: FP8`, 401 capas cuantizadas |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido de la familia Qwen3.8 con 27B parametros nominales (18,16B reales en el checkpoint cuantizado segun safetensors). La arquitectura `qwen3_5` intercala 16 bloques de atencion completa con 48 capas Gated DeltaNet, e incorpora una torre de vision para entrada de imagenes y una cabeza MTP para decodificacion especulativa o prediccion multi-token. Sobre esta base, huihui-ai aplico abliteration sobre las capas 18 a 51 para eliminar el comportamiento de rechazo.

La cuantizacion la realizo Icharle con NVIDIA ModelOpt 0.47.0 (`examples/hf_ptq/hf_ptq.py`), transformers 5.12.1 y torch 2.14.0 sobre una RTX PRO 6000 Blackwell de 96 GB. Se uso el algoritmo de calibracion `max` (maximo absoluto por cuantizador, sin busqueda AWQ/GPTQ) sobre 226 ventanas de 1024 tokens (unas 231k tokens) construidas especificamente para uso agentico, codigo y chino: 96 ventanas de `nvidia/Nemotron-SFT-Agentic-v2`, 80 de `nvidia/Nemotron-SFT-SWE-v2` (descartando ventanas con mas de un 30% de lineas de rutas de repositorio) y 50 de `nvidia/Nemotron-SFT-Multilingual-v1` en las variantes `code_zh`, `math_zh` y `stem_zh` (solo ventanas con al menos un 30% de caracteres chinos). Las ventanas se cortaron en posiciones aleatorias con semilla 0 para evitar que dominaran el system prompt y las definiciones de herramientas. Existe una variante hermana con calibracion AWQ que reduce el KL aproximadamente un 10% respecto a `max`.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de pensamiento (thinking) y `reasoning_effort` configurable segun la evaluacion del autor.
- Comprension de imagen y texto (pipeline `image-text-to-text`) mediante torre de vision en BF16.
- Generacion de codigo y resolucion de problemas de software, con calibracion especifica sobre transcripciones SWE.
- Matematicas y razonamiento STEM, incluyendo problemas planteados en chino.
- Tool calling y function calling, con parser `qwen3_coder` verificado en SGLang.
- Soporte de agentes y flujos multi-turno con herramientas, con parser de razonamiento `qwen3`.
- Capacidades multilingues, con calibracion reforzada en ingles y chino.
- Comportamiento sin censura: la abliteration elimina las negativas del modelo base, por lo que no aplica guardarrailes de seguridad propios.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con soporte de tool calling para consultar sistemas internos (pedidos, estado de cuenta) y razonamiento intermedio antes de responder. La cuantizacion W4A16 mantiene activaciones en BF16, lo que reduce la degradacion en respuestas largas.
- Generacion de codigo en produccion: admite tool calling y se integra en pipelines de CI/CD para revision de parches, generacion de tests o explicacion de errores. La calibracion con `Nemotron-SFT-SWE-v2` lo orienta a tareas de ingenieria de software.
- Agentes de busqueda y navegacion: la calibracion con transcripciones de agentes de busqueda lo hace adecuado para orquestar consultas, sintetizar resultados y decidir la siguiente accion en un bucle agentico.
- Asistente multimodal de documentacion: al aceptar imagen y texto, puede extraer informacion de capturas, diagramas o documentos escaneados y combinarla con contexto textual en una misma conversacion.
- Razonamiento matematico y STEM en entornos educativos o de analisis: el modo thinking y los resultados reportados en GSM8K (97,2% con 250 preguntas) lo hacen util para tutoria o resolucion asistida de problemas.
- Despliegue de bajo coste en GPU Blackwell: con 21,9 GB de pesos y cache KV en FP8, cabe en una sola GPU profesional o de consumo de gama alta, lo que permite servir un modelo de 27B con throughput de 1147 tok/s a 32 peticiones concurrentes segun el autor.
- Procesamiento de texto en chino e ingles: la calibracion multilingue con ventanas en `code_zh`, `math_zh` y `stem_zh` lo orienta a tareas bilingues de documentacion tecnica.

## Benchmarks y rendimiento

Datos reportados por el autor el 2026-11-25 en una RTX PRO 6000 Blackwell con SGLang 0.5.23, comparando con el BF16 original y con otra cuantizacion NVFP4 publica (iQlusion, W4A4 MLP + FP8 attention + BF16 `lm_head`):

| Metrica | BF16 | NVFP4-W4A16 (max) | NVFP4-W4A16-AWQ | iQlusion W4A4 |
|---|---|---|---|---|
| Peso de los pesos | 55,6 GB | 21,9 GB | 21,9 GB | 23,75 GB |
| KL vs BF16 (texto, aprox., top-20) | 0 | 0,0391 | 0,0354 | 0,0540 |
| Cambio de perplejidad | — | +2,98% | +2,69% | +4,84% |
| Acuerdo top-1 con BF16 | — | 91,4% | 92,0% | 90,6% |
| KL solo en codigo | 0 | 0,0524 | 0,0534 | 0,0968 |
| GSM8K (250, thinking, greedy) | 98,4% | 97,2% | 98,4% | 98,4% |
| MMLU-Pro (280, thinking, greedy; ±2,4) | 80,4% | 81,8% | 80,0% | 79,6% |
| Decodificacion, 1 peticion | 27 tok/s | 69 tok/s | 69 tok/s | 62 tok/s |
| Throughput, 32 concurrentes | — | 1147 tok/s | 1156 tok/s | 1199 tok/s |
| Time to first token, 1 peticion | 155 ms | 147 ms | 147 ms | 76 ms |

Las metricas KL, perplejidad y top-1 se calcularon sobre unas 45k posiciones de texto no usado en calibracion (test de wikitext-2, codigo de HumanEval y Wikipedia en chino). Las tareas usaron las mismas 530 preguntas para todos los modelos, con `reasoning_effort: medium`, temperatura 0 y maximo de 8192 tokens; con 250 y 280 preguntas, diferencias de 1 a 2 puntos quedan dentro del ruido. Las cifras de velocidad provienen de `sglang.bench_serving` con 1024 tokens de entrada y 1024 de salida y `--kv-cache-dtype fp8_e4m3`.

## Requisitos de hardware

- VRAM estimada para inferencia: 21,9 GB solo de pesos; con cache KV FP8 y margen de trabajo, se recomienda al menos 32 GB para contextos moderados y 48-80 GB para contextos largos o alta concurrencia.
- GPUs recomendadas: NVIDIA Blackwell con soporte nativo de FP4, como RTX PRO 6000 Blackwell (probada por el autor con 96 GB). El formato NVFP4 requiere soporte de hardware para rendir de forma nativa.
- Cabe en GPU de consumo: si, en tarjetas Blackwell de gama alta con 32 GB o mas (por ejemplo, RTX 5090), aunque el autor solo valida explicitamente la RTX PRO 6000.
- Opciones de despliegue: SGLang 0.5.23 con `--quant=modelopt_mixed` (verificado), vLLM y TensorRT-LLM con soporte de checkpoints ModelOpt; no se menciona soporte en llama.cpp u Ollama para este formato.
- Latencia y throughput: 147 ms de time to first token y 69 tok/s en decodificacion con una peticion; 1147 tok/s con 32 peticiones concurrentes (1024 in / 1024 out, cache KV FP8).
- Nota de compatibilidad: torch 2.15 y Triton 3.9 eliminan `tl.make_block_ptr`, que el kernel de fake-quant NVFP4 de ModelOpt 0.47/0.48 sigue usando; hay que fijar torch 2.14 para recalibrar o convertir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Icharle/Huihui-Qwen3.8-27B-abliterated-NVFP4-W4A16 | 18,16B reales | no disponible | NVFP4/FP8 mixto, 21,9 GB | Apache-2.0 | Hugging Face |
| Icharle/Huihui-Qwen3.8-27B-abliterated-NVFP4-W4A16-AWQ | 18,16B reales | no disponible | NVFP4/FP8 con calibracion AWQ, 21,9 GB | Apache-2.0 | Hugging Face |
| iQlusion/Huihui-Qwen3.8-27B-abliterated-NVFP4-BF16-LMHead | no disponible | no disponible | W4A4 MLP + FP8 attention + BF16 `lm_head`, 23,75 GB | no disponible | Hugging Face |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated (BF16) | 27B nominales | no disponible | BF16, 55,6 GB | Apache-2.0 | Hugging Face |

Las diferencias de calidad medidas por el autor favorecen ligeramente a la variante AWQ (KL 0,0354 frente a 0,0391) y a W4A16 frente a W4A4 en codigo (KL 0,0524 frente a 0,0968). En velocidad, W4A4 obtiene mejor TTFT (76 ms frente a 147 ms) y un throughput algo mayor a 32 concurrentes.

## Limitaciones y advertencias

- Modelo sin censura: la abliteration elimina el comportamiento de rechazo del modelo base; no hay guardarrailes de seguridad y la responsabilidad de los filtros recae en la aplicacion.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de factualidad; como en cualquier LLM, conviene validar salidas en dominios criticos.
- Degradacion por cuantizacion: la perplejidad aumenta un 2,98% frente a BF16 y el acuerdo top-1 es del 91,4%; en codigo el KL sube a 0,0524, por lo que tareas muy sensibles pueden requerir la version BF16.
- Longitud de contexto no documentada: la model card no indica la ventana maxima, aunque la evaluacion usa hasta 8192 tokens de salida.
- Idiomas no declarados formalmente: la calibracion cubre ingles y chino, pero no se especifica la lista completa de idiomas soportados.
- Dependencia de hardware Blackwell: el formato NVFP4 esta pensado para GPUs con soporte nativo de FP4; en otras arquitecturas el rendimiento o la compatibilidad pueden verse afectados.
- Dependencia de versiones: requiere SGLang 0.5.23 o superior con soporte de ModelOpt, y torch 2.14 para recalibrar; versiones mas nuevas de torch/Triton rompen el kernel de fake-quant.
- Licencia Apache-2.0 heredada, permisiva para uso comercial, pero el autor no ofrece garantias y remite a los terminos del modelo base y de huihui-ai.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que implica poca validacion comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Icharle/Huihui-Qwen3.8-27B-abliterated-NVFP4-W4A16
- Variante con calibracion AWQ: https://huggingface.co/Icharle/Huihui-Qwen3.8-27B-abliterated-NVFP4-W4A16-AWQ
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizacion NVFP4 alternativa: https://huggingface.co/iQlusion/Huihui-Qwen3.8-27B-abliterated-NVFP4-BF16-LMHead
- Dataset de calibracion agentica: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Agentic-v2
- Dataset de calibracion SWE: https://huggingface.co/datasets/nvidia/Nemotron-SFT-SWE-v2
- Dataset de calibracion multilingue: https://huggingface.co/datasets/nvidia/Nemotron-SFT-Multilingual-v1
