# PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-NVFP4

## Resumen

Qwen3.5-0.8B-Opus-Reasoning-Distilled-NVFP4 es la variante cuantizada en NVFP4 (W4A4) del modelo PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled, un modelo de razonamiento de 0,8 mil millones de parametros afinado por PhilipEriksson sobre trazas de razonamiento de Claude Opus y de Qwen3.5-27B. El artefacto es un ejercicio de destilacion de chain-of-thought a escala reducida: parte de la arquitectura Qwen3.5 y le ensena a producir cadenas de razonamiento explicitas con un presupuesto de entrenamiento muy limitado (2.917 filas, 25 minutos en una RTX 5090).

La relevancia de esta publicacion no esta en la calidad del modelo, sino en el formato: es una cuantizacion NVFP4 generada con llm-compressor y empaquetada en compressed-tensors, un formato que vLLM detecta automaticamente y que activa los tensor cores FP4 de las GPU Blackwell (SM120) para inferencia W4A4. El autor documenta explicitamente que se trata de un "learning run", no de un lanzamiento competitivo en benchmarks.

El modelo ocupa 892 MB en disco, conserva la licencia apache-2.0 del modelo base y esta pensado para experimentacion con cuantizacion de baja precision y decodificacion de razonamiento en hardware Blackwell, no para produccion generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con cabeza de prediccion multi-token (MTP) y atencion lineal (`linear_attn`) |
| Parametros totales | 873.438.784 (0,87B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de vLLM usa `--max-model-len 16384` |
| Tipos de cuantizacion | NVFP4 (W4A4) sobre capas `Linear`; excluye `linear_attn.conv1d`, `linear_attn.in_proj_ba` y `lm_head`; tag secundario "8-bit" en Hugging Face |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (`model_backbone.safetensors`, `model_mtp.safetensors`), mas `recipe.yaml` |

## Arquitectura y entrenamiento

El modelo base es un Qwen3.5 de 0,8B con atencion lineal (modulos `linear_attn`) y una cabeza de prediccion multi-token (MTP), lo que sugiere decodificacion especulativa nativa. El fine-tune se realizo sobre 2.917 filas de trazas de razonamiento generadas por Claude Opus y por Qwen3.5-27B, en una unica pasada de 25 minutos sobre una RTX 5090; se publica tambien el adaptador LoRA asociado. No se especifican el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO.

La cuantizacion se genero con llm-compressor `oneshot` mediante `QuantizationModifier(targets="Linear", scheme="NVFP4")`, calibrada con 256 muestras del propio corpus de entrenamiento (no texto web generico), con el argumento de que los rangos de activacion relevantes son los que el modelo ve realmente. Se descarto el formato `modelopt_fp4` de NVIDIA ModelOpt porque producia errores `k_scale`/`v_scale` y salida corrupta en las capas MoE. La creacion de la cuantizacion funciona en cualquier GPU CUDA; la inferencia W4A4 real requiere vLLM con kernels SM120 compilados (Blackwell).

## Capacidades

- Generacion de texto y razonamiento explicito en formato chain-of-thought, destilado de trazas de Claude Opus y Qwen3.5-27B.
- Razonamiento aritmetico basico, generacion de codigo y tareas de logica simples (los tres dominios usados en el smoke test del autor).
- Capacidad multimodal declarada por el pipeline `image-text-to-text` y la clase `AutoModelForImageTextToText`, pero la torre de vision fue excluida del fine-tune; el modelo es efectivamente solo texto.
- Cabeza de prediccion multi-token (MTP) para decodificacion especulativa.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor advierte que falla en planificacion multi-paso.
- Capacidades multilingues: solo ingles declarado.

## Casos de uso

- Experimentacion con cuantizacion NVFP4: servir el modelo con vLLM en una GPU Blackwell para validar el pipeline compressed-tensors + SM120 antes de aplicarlo a modelos mayores.
- Pruebas de humo de razonamiento chain-of-thought en entornos con VRAM muy limitada: 892 MB permiten cargar el modelo junto a otros artefactos en la misma GPU.
- Evaluacion de destilacion de trazas de modelos grandes: util para estudiar como se comporta un 0,8B entrenado con 2.917 filas de razonamiento de Opus y Qwen3.5-27B.
- Generacion de codigo y aritmetica de un solo paso en scripts locales, aceptando que fallara en tareas que requieran conocimiento del mundo.
- Comparacion de artefactos de cuantizacion (BF16, GGUF Q8_0, Q4_K_M, EXL3 4.0/3.0 bpw, NVFP4) sobre el mismo prompt set, replicando la tabla del autor.
- Base para fine-tunes posteriores o para validar recetas de calibracion con datos del dominio en lugar de texto web generico.
- Prototipado de pipelines de decodificacion especulativa aprovechando la cabeza MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta un smoke test de tres prompts (aritmetica, codigo, logica) con `max_new_tokens=700` y los mismos ajustes de sampler:

| Artefacto | Tamano | Respuesta esperada encontrada |
|---|---:|---|
| BF16 (baseline) | 1,7 GB | 3/3 |
| GGUF Q8_0 | 834 MB | 3/3 |
| GGUF Q4_K_M | 542 MB | 3/3 |
| EXL3 4.0 bpw | 1,08 GB | 3/3 |
| EXL3 3.0 bpw | 1,02 GB | 2/3 |
| NVFP4 | 892 MB | 3/3 |

El propio autor califica esta prueba como smoke test, no como benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1 GB de pesos en NVFP4; con overhead de KV cache y runtime, un presupuesto de 2-4 GB es suficiente para contextos moderados.
- GPU recomendadas: NVIDIA Blackwell (SM120, p. ej. RTX 5090) para aprovechar la ruta de tensor cores FP4 en vLLM; en otras GPU CUDA la cuantizacion puede crearse pero no se beneficia de los kernels W4A4.
- Cabe en cualquier GPU consumer moderna con al menos ~2 GB de VRAM libre; el cuello de botella no es el tamano sino el soporte de kernels FP4.
- Opciones de despliegue: vLLM (`vllm serve ... --max-model-len 16384`, sin flag `--quantization` porque compressed-tensors se autodetecta) y transformers con `AutoModelForImageTextToText` y `compressed-tensors>=0.15.0`. Para llama.cpp/Ollama habria que usar la variante GGUF del mismo autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Opus-Reasoning-Distilled-NVFP4 (este) | 0,87B | no disponible (ejemplo a 16k) | NVFP4 W4A4 | apache-2.0 | Requiere vLLM SM120 para ruta FP4 |
| Qwen3.5-0.8B-Opus-Reasoning-Distilled (BF16) | 0,87B | no disponible | BF16 | apache-2.0 | Baseline de referencia, 1,7 GB |
| Qwen3.5-0.8B-Opus-Reasoning-Distilled-GGUF | 0,87B | no disponible | Q8_0 / Q4_K_M | apache-2.0 | Compatible con llama.cpp/Ollama, 542-834 MB |
| Qwen3.5-0.8B-Opus-Reasoning-Distilled-EXL3 | 0,87B | no disponible | EXL3 3.0 / 4.0 bpw | apache-2.0 | 3.0 bpw pierde 1/3 en el smoke test |

No se dispone de datos para comparar con modelos de otros autores de la misma categoria.

## Limitaciones y advertencias

- Ejecucion de aprendizaje, no un lanzamiento competitivo: 2.917 filas de entrenamiento y 25 minutos en una RTX 5090.
- Solo texto: la torre de vision quedo excluida del fine-tune pese al pipeline `image-text-to-text`.
- 0,8B parametros: el autor advierte que fallara en cualquier tarea que requiera conocimiento del mundo real o planificacion multi-paso.
- Solo ingles declarado; no hay soporte multilingue documentado.
- Riesgo alto de alucinacion en dominios factuales por el tamano y el corpus de entrenamiento.
- La ruta FP4 W4A4 solo es eficiente en GPU Blackwell con vLLM compilado para SM120; en otro hardware el beneficio desaparece.
- Requiere `compressed-tensors>=0.15.0`; sin esa version el error de importacion puede confundirse con un artefacto corrupto.
- El smoke test de tres prompts no es evidencia de calidad; EXL3 3.0 bpw ya muestra degradacion con esa misma muestra.
- Licencia apache-2.0 heredada del modelo base, sin restricciones adicionales documentadas para uso comercial, aunque la calidad del modelo limita su uso real en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-NVFP4
- Modelo base: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled
- Adaptador LoRA: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-LoRA
- GGUF: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-GGUF
- EXL3: https://huggingface.co/PhilipEriksson/Qwen3.5-0.8B-Opus-Reasoning-Distilled-EXL3
- Coleccion: https://huggingface.co/collections/PhilipEriksson/qwen35-08b-opus-reasoning-distilled-6ae3336176ac243223f27ee9
