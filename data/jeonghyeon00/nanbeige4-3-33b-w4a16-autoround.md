# jeonghyeon00/Nanbeige4.3-33B-W4A16-AutoRound

## Resumen

Nanbeige4.3-33B-W4A16-AutoRound es una cuantización W4A16 del modelo Nanbeige4.3-33B, publicado por el usuario jeonghyeon00 en Hugging Face. El modelo base fue desarrollado por el equipo Nanbeige y esta versión derivada está orientada específicamente a su despliegue con vLLM, usando el formato compressed-tensors y el método de cuantización post-entrenamiento AutoRound. El objetivo es reducir el footprint de memoria del modelo original manteniendo la calidad de inferencia, de modo que un modelo de 33B de parámetros pueda servirse en hardware más accesible.

La relevancia de esta ficha radica en que se trata de una cuantización comunitaria (no oficial del equipo Nanbeige) con licencia Apache-2.0 heredada del modelo base, lo que permite su uso comercial sin restricciones. El modelo base soporta inglés y chino, con una longitud de contexto máxima publicada de 524.288 tokens, y el README del repositorio original documenta plantillas de chat, opciones de razonamiento y comportamiento de tool calling. Nótese que existe una discrepancia en los metadatos: el safetensors reporta 6.474 millones de parámetros mientras que la denominación y el tamaño del repositorio (20,6 GB) apuntan a un modelo de 33B cuantizado a 4 bits; no se ha podido verificar cuál de los dos datos es el correcto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA (transformer decoder, según tags de Hugging Face) |
| Parametros totales | 6.474.317.528 según safetensors; la denominación del modelo indica 33B (dato contradictorio, no verificado) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 524.288 tokens (máximo publicado del modelo base; el contexto práctico depende de la VRAM disponible) |
| Tipos de cuantizacion | W4A16 (pesos enteros simétricos de 4 bits, activaciones en 16 bits), group size 128, método AutoRound |
| Idiomas soportados | inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con serialización compressed-tensors (pack-quantized), servible directamente por vLLM |

## Arquitectura y entrenamiento

El modelo base, Nanbeige4.3-33B, sigue la arquitectura LLaMA (transformer decoder) según los metadatos de Hugging Face. No se dispone de información publicada sobre el número de tokens de preentrenamiento, la composición del dataset ni sobre procesos de alineación tipo RLHF o DPO en la información proporcionada.

En cuanto a la cuantización, este repositorio aplica el esquema W4A16 mediante AutoRound a través del `AutoRoundModifier` de `llmcompressor`, con hasta 200 iteraciones de optimización (las ejecuciones por capa pueden detenerse antes de forma anticipada). Los módulos cuantizados son las capas `Linear`, mientras que `lm_head` se mantiene en la precisión original. La calibración se realizó con las primeras 128 muestras de `HuggingFaceH4/ultrachat_200k` (split `train_sft`) con una longitud máxima de secuencia de 2048 tokens; este dataset se usó solo para calibración post-entrenamiento, no para entrenar el modelo. El software empleado fue `llmcompressor==0.14.0.1`, `compressed-tensors==0.19.0`, `auto-round==0.15.1` y `transformers==5.17.0`. La cuantización se ejecutó en una NVIDIA CMP 170HX con 64 GiB de VRAM limitada a 170 W, repartiendo el modelo entre memoria de GPU y de CPU.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento: el README original del modelo base documenta opciones de razonamiento (reasoning), y el comando de vLLM sugerido usa `--reasoning-parser qwen3`.
- Tool calling / function calling: soportado, con parser `qwen3_coder` recomendado en vLLM mediante `--enable-auto-tool-choice`.
- Capacidades multilingües: inglés y chino.
- Contexto extenso: hasta 524.288 tokens según el modelo base, adecuado para documentos largos.
- No hay evidencia de capacidades de visión, audio u otras modalidades en la información disponible.

## Casos de uso

- Chatbots conversacionales bilingües: el soporte de inglés y chino con plantilla de chat documentada lo hace adecuado para asistentes que atienden usuarios en ambos idiomas, manteniendo coherencia en conversaciones multi-turno.
- Procesamiento de documentos largos: con una ventana teórica de 524.288 tokens, puede usarse para resumir o analizar contratos, informes técnicos o bases de código extensas, siempre que la VRAM disponible permita cargar el contexto necesario.
- Agentes con tool calling: el soporte de function calling en vLLM permite integrarlo en pipelines de agentes que invocan APIs, ejecutan herramientas o realizan razonamiento en varios pasos.
- Despliegue autoservicio en vLLM: al venir serializado en compressed-tensors, puede servirse directamente con `vllm serve` sin conversión adicional, lo que simplifica su puesta en producción.
- Uso comercial sin restricciones de licencia: la licencia Apache-2.0 permite integrarlo en productos cerrados, SaaS o servicios internos sin obligaciones de copyleft.
- Investigación en cuantización: al ser una cuantización AutoRound documentada con detalle (software, calibración, iteraciones), sirve como punto de comparación frente a checkpoints GPTQ o AWQ del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio README de la cuantización indica que no incluye benchmarks independientes de calidad de inferencia ni comparativas de throughput, y advierte que AutoRound no garantiza superar a GPTQ en todos los modelos o cargas de trabajo, recomendando evaluar el checkpoint con los prompts propios antes de desplegar.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 20,6 GB, consistente con un modelo de 33B en W4A16; se recomienda al menos una GPU con 24 GB de VRAM para el peso del modelo, más memoria adicional para la caché KV (que crece considerablemente con contextos largos).
- GPU recomendadas: no disponible de forma explícita; opciones razonables incluyen una RTX 4090 (24 GB), A100 40 GB/80 GB o H100 para cargas con contexto largo y alto throughput.
- Consumer GPU: con 20,6 GB de pesos, cabe en una RTX 4090 de 24 GB dejando margen limitado para la caché KV; para contextos muy largos se recomienda una A100 u H100.
- Despliegue: diseñado para vLLM (formato compressed-tensors servible directamente). El comando sugerido es `vllm serve jeonghyeon00/Nanbeige4.3-33B-W4A16-AutoRound --trust-remote-code --enable-auto-tool-choice --reasoning-parser qwen3 --tool-call-parser qwen3_coder`. No consta compatibilidad verificada con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Dato relevante del proceso de cuantización: se ejecutó en una CMP 170HX de 64 GiB limitada a 170 W, partiéndose entre GPU y CPU, lo que no afecta a la inferencia pero indica el hardware usado para generar el checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-W4A16-AutoRound | 33B (denominación; safetensors reporta 6,47B, dato contradictorio) | 524.288 tokens (base) | W4A16 AutoRound | Apache-2.0 | Hugging Face, vLLM |
| Nanbeige/Nanbeige4.3-33B (base) | 33B (denominación) | 524.288 tokens | FP16/BF16 sin cuantizar | Apache-2.0 | Hugging Face |
| Qwen3-32B | 32B | 32.768 tokens (extendible) | FP16 y variantes GPTQ/AWQ oficiales | Apache-2.0 | Hugging Face, vLLM, llama.cpp |

Nota: los datos de Qwen3-32B se ofrecen como referencia de categoría (modelo denso de ~32B, Apache-2.0, con buen soporte de tool calling); su rendimiento relativo frente a Nanbeige4.3-33B no puede afirmarse sin benchmarks comparativos publicados, que no están disponibles.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se han documentado sesgos específicos en la información proporcionada.
- Riesgo de alucinación: inherente a cualquier LLM generativo; no hay evaluaciones específicas de este checkpoint que cuantifiquen el riesgo.
- Calidad de la cuantización no verificada: el autor indica explícitamente que no hay benchmarks de calidad y que AutoRound no garantiza superar a GPTQ; se recomienda evaluar el checkpoint frente al modelo base antes de producción.
- Discrepancia de parámetros: los metadatos de safetensors (6,47B) contradicen la denominación de 33B y el tamaño del repositorio (20,6 GB); conviene verificar el checkpoint real antes de planificar hardware.
- Idioma: soporte documentado limitado a inglés y chino; no hay garantías de calidad en otros idiomas, incluido el castellano.
- Contexto práctico: aunque el máximo teórico es de 524.288 tokens, el contexto utilizable depende de la VRAM y la configuración del runtime.
- Licencia: Apache-2.0, sin restricciones para uso comercial; se pide conservar la atribución al redistribuir el modelo.
- Uso de `--trust-remote-code` en vLLM: implica ejecutar código remoto del repositorio, lo que requiere confianza en el autor del checkpoint (cuantización comunitaria, no oficial del equipo Nanbeige).

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/jeonghyeon00/Nanbeige4.3-33B-W4A16-AutoRound
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Dataset de calibración: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- No se han encontrado enlaces a papers, blogs oficiales o demos en la información disponible.
