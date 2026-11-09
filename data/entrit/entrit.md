# Entrit/Entrit

## Resumen

Entrit/Entrit es el repositorio paraguas de Entrit Systems, una iniciativa que combina hardware y algoritmos para computación ternaria aplicada a la inferencia de modelos de lenguaje. El objetivo declarado es eliminar el multiplicador del bucle interno de la inferencia LLM, sustituyendo las operaciones de producto escalar convencionales por kernels libres de multiplicación que operan sobre pesos empaquetados en trits. El autor es Eric Stentzel y el trabajo se formaliza en el artículo "Balanced Ternary Post-Training Quantization for Large Language Models" (2026).

El repositorio no contiene un modelo único, sino un ecosistema de artefactos: checkpoints cuantizados en formato d2 (denso y GGUF), un codec de cuantización en un solo fichero Python sin datos de calibración, un kernel CUDA para GEMV sin multiplicación basado en `dp4a` sobre trits empaquetados, y una bifurcación de llama.cpp con el kernel d2 integrado para GPU NVIDIA, AMD, Intel y Apple, además de CPU.

La relevancia actual reside en la propuesta de cuantización post-entrenamiento en ternario balanceado con 9 niveles por peso y una escala por grupo de 64 pesos, lo que supone aproximadamente 3,4 bits de información por peso. Los artefactos se declaran explícitamente como material de investigación, sin garantías para uso en producción, y los métodos descritos son objeto de solicitudes de patente pendientes por parte de Entrit Systems.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (repositorio paraguas; los checkpoints derivan de modelos base Qwen, Muse-Glimmer y DeepSeek) |
| Parametros totales | No disponible (depende del modelo base: 27B, 30B, DeepSeek-V4-Flash) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | d2: 9 niveles por peso `{0, ±1, ±2.83, ±5.20, ±8}` con una escala por grupo de 64 pesos; ~3,4 bits por peso |
| Idiomas soportados | en |
| Licencia | Apache 2.0 (repositorio principal, d2dense, d2-GGUF, Muse-Glimmer-30B-d2, tritllm-codec, tritllm-kernel); MIT (DeepSeek-V4-Flash-d2swap-mp2, llama.cpp-d2nl); CC BY 4.0 (tritllm-paper) |
| Formato de pesos | safetensors bf16 (d2dense), GGUF (d2-GGUF) |

## Arquitectura y entrenamiento

El repositorio describe una técnica de cuantización post-entrenamiento (PTQ) denominada d2, basada en ternario balanceado. Cada peso se almacena como uno de nueve niveles discretos simétricos en torno a cero, `{0, ±1, ±2.83, ±5.20, ±8}`, multiplicado por una escala única por grupo de 64 pesos. Esto arroja aproximadamente 3,4 bits de información por peso. La innovación central es la eliminación del multiplicador en el bucle interno de la inferencia: el kernel CUDA del artículo implementa GEMV sin multiplicación mediante la instrucción `dp4a` sobre trits empaquetados. El codec de cuantización es un único fichero Python que no requiere datos de calibración.

Los checkpoints publicados se construyen sobre modelos base de terceros: Qwen3.8-27B (denso, disponible en bf16 safetensors para `transformers` y en GGUF de 15,3 GB para llama.cpp), Muse-Glimmer-30B (modelo visión-lenguaje, con aproximadamente el 96 % del rendimiento FP16 según los benchmarks del autor) y DeepSeek-V4-Flash (con expertos enrutados en d2, aproximadamente el 99 % de la base FP4). La primera generación de la técnica se documenta en el artículo de Stentzel (2026), cuyos checkpoints pre-cuantizados de Qwen2.5, Llama-3.1-8B y Mistral-7B ya no se alojan y deben reconstruirse con el codec. No se especifican en la información disponible los volúmenes de tokens de entrenamiento ni si hubo RLHF o DPO, dado que se trata de cuantización post-entrenamiento sobre modelos ya existentes.

## Capacidades

- Generación de texto y razonamiento heredados de los modelos base subyacentes (Qwen3.8-27B, Muse-Glimmer-30B, DeepSeek-V4-Flash); no se detallan capacidades específicas propias del repositorio paraguas.
- Inferencia libre de multiplicación en el bucle interno mediante kernel GEMV con `dp4a` sobre trits empaquetados.
- Cuantización post-entrenamiento sin datos de calibración mediante el codec `tritllm-codec`.
- Soporte de visión-lenguaje a través del checkpoint Muse-Glimmer-30B-d2.
- Soporte de modelos MoE con expertos enrutados cuantizados en d2 (DeepSeek-V4-Flash-d2swap-mp2).
- Despliegue multiplataforma vía `llama.cpp-d2nl`: GPU NVIDIA, AMD, Intel y Apple, además de CPU.
- Compatibilidad con `transformers` (safetensors bf16) y con llama.cpp (GGUF).
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según el campo `language` del repositorio.

## Casos de uso

- Investigación en cuantización ternaria: el codec `tritllm-codec` permite reproducir los checkpoints del artículo sobre Qwen2.5, Llama-3.1-8B y Mistral-7B sin datos de calibración, lo que facilita experimentos controlados de PTQ en entornos académicos.
- Inferencia en GPU de consumo: el checkpoint Qwen3.8-27B-d2-GGUF ocupa 15,3 GB y cabe en una única GPU de 24 GB, lo que permite ejecutar un modelo de 27B en hardware de gama alta para consumidores.
- Evaluación de kernels alternativos: `llama.cpp-d2nl` proporciona una bifurcación con el kernel d2 para probar el rendimiento libre de multiplicación en GPU NVIDIA, AMD, Intel y Apple, así como en CPU, en comparación con kernels convencionales.
- Prototipado de modelos visión-lenguaje comprimidos: Muse-Glimmer-30B-d2 conserva aproximadamente el 96 % del rendimiento FP16 según el autor, adecuado para experimentos de VLM con requisitos de memoria reducidos.
- Investigación en MoE comprimidos: DeepSeek-V4-Flash-d2swap-mp2 cuantiza los expertos enrutados en d2 y retiene aproximadamente el 99 % de la base FP4, útil para estudiar el impacto de la cuantización ternaria en arquitecturas de mezcla de expertos.
- Estudio de hardware ternario: el kernel CUDA del artículo sirve como referencia para evaluar el ahorro energético y de área al eliminar el multiplicador del bucle interno, relevante para líneas de investigación en aceleradores específicos.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la información disponible son las cifras relativas declaradas por el autor para dos checkpoints:

| Modelo | Referencia | Rendimiento relativo declarado |
|---|---|---|
| Muse-Glimmer-30B-d2 | FP16 | ~96 % |
| DeepSeek-V4-Flash-d2swap-mp2 | FP4 base | ~99 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint Qwen3.8-27B-d2-GGUF ocupa 15,3 GB y cabe en una GPU de 24 GB. Para el resto de checkpoints no se especifica el tamaño en disco ni la VRAM necesaria.
- GPU recomendadas: no se detallan modelos concretos; el kernel d2 da soporte a GPU NVIDIA, AMD, Intel y Apple, además de CPU.
- Cabe en GPU de consumo: sí, al menos el GGUF de 15,3 GB en una GPU de 24 GB (por ejemplo, RTX 3090 o RTX 4090).
- Opciones de despliegue: `transformers` (safetensors bf16), llama.cpp mediante la bifurcación `llama.cpp-d2nl`, y el kernel CUDA `tritllm-kernel`. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros métodos de cuantización (por ejemplo, GPTQ, AWQ, bitsandbytes o cuantización ternaria de otros autores) ni con modelos de tamaño comparable en términos de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Los artefactos se declaran explícitamente como material de investigación, sin garantías para uso en producción.
- Los métodos descritos son objeto de solicitudes de patente pendientes por parte de Entrit Systems, lo que puede afectar a su uso comercial.
- Aplican los términos de licencia de los modelos base subyacentes; cada model card individual debe consultarse.
- El repositorio solo declara soporte de inglés (`en`), sin cobertura multilingüe documentada.
- No se especifican la longitud de contexto, los parámetros totales ni los datos de entrenamiento en la información disponible.
- Los checkpoints pre-cuantizados de la primera generación (Qwen2.5, Llama-3.1-8B, Mistral-7B) ya no se alojan y deben reconstruirse con el codec.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; heredados de los modelos base.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación por parte de la comunidad en el momento de la consulta.

## Enlaces

- Repositorio principal: https://huggingface.co/Entrit/Entrit
- Qwen3.8-27B-d2dense: https://huggingface.co/Entrit/Qwen3.8-27B-d2dense
- Qwen3.8-27B-d2-GGUF: https://huggingface.co/Entrit/Qwen3.8-27B-d2-GGUF
- Muse-Glimmer-30B-d2: https://huggingface.co/Entrit/Muse-Glimmer-30B-d2
- DeepSeek-V4-Flash-d2swap-mp2: https://huggingface.co/Entrit/DeepSeek-V4-Flash-d2swap-mp2
- llama.cpp-d2nl: https://huggingface.co/Entrit/llama.cpp-d2nl
- Artículo (PDF + LaTeX): https://huggingface.co/Entrit/tritllm-paper
- Codec de cuantización: https://huggingface.co/Entrit/tritllm-codec
- Kernel CUDA: https://huggingface.co/Entrit/tritllm-kernel
- Contacto: eric@entrit.io
