# amd/Qwen3-ASR-1.7B-hf-w4a16-llmcompressor

## Resumen

`amd/Qwen3-ASR-1.7B-hf-w4a16-llmcompressor` es una versión cuantizada a 4 bits del modelo `Qwen/Qwen3-ASR-1.7B-hf`, publicada por AMD con el objetivo de habilitar inferencia eficiente sobre CPU (concretamente sobre procesadores AMD EPYC con la pila ZenDNN). El modelo conserva la arquitectura del original, `Qwen3ASRForConditionalGeneration`, un modelo multimodal que combina una torre de audio con un modelo de lenguaje de la familia Qwen3, pensado para tareas de reconocimiento automático del habla (ASR) y generación de texto condicionada por audio.

La cuantización se ha realizado con LLM Compressor v0.14.0 mediante el algoritmo GPTQ en esquema W4A16 (pesos INT4 simétricos con `group_size=128`, activaciones en BF16). Solo se cuantizan las capas lineales del modelo de lenguaje (28 capas: `q/k/v/o_proj`, `gate/up/down_proj`); la torre de audio, el proyector multimodal, el `lm_head` y las layer norms permanecen en BF16. Esto reduce el peso en disco de 3,8 GiB a 1,8 GiB, aproximadamente un 51 %.

Su relevancia es doble: por un lado, demuestra una receta reproducible de cuantización para modelos multimodales con módulos que no deben cuantizarse (audio y proyector); por otro, ofrece un artefacto listo para desplegar en infraestructura CPU de AMD mediante vLLM 0.33.0 y ZenDNN 6.2.0, un escenario cada vez más habitual cuando el coste de GPU no está justificado para cargas ASR de tamaño medio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ASRForConditionalGeneration (torre de audio + LLM Qwen3, transformer denso) |
| Parametros totales | 2.038.052.480 (~2,04 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (INT4 weight-only, simetrico, group_size=128); compatible con DA8W4 (activaciones INT8 dinamicas) en Zen via `VLLM_CPU_INT4_W4A8=1` |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (pack-quantized INT4); repo de 2,0 GB |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura `Qwen3ASRForConditionalGeneration`, que combina un codificador de audio (torre de audio con 24 capas de atención y capas `fc1`/`fc2`, más una `conv_out`) con un modelo de lenguaje Qwen3 de 28 capas y un proyector multimodal de dos capas lineales (`linear_1`, `linear_2`). La entrada declarada en la model card es texto y la salida es texto, aunque la presencia de la torre de audio y del proyector confirma que el modelo procesa también señales de audio como entrada multimodal. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en el modelo original.

La innovación técnica de esta publicación es la receta de cuantización, no el entrenamiento. AMD aplica GPTQ con calibración de 128 ejemplos de `HuggingFaceH4/ultrachat_200k` a longitud máxima 2048, cuantizando exclusivamente las proyecciones lineales del LLM y excluyendo explícitamente `lm_head`, `audio_tower.*` y `multi_modal_projector.*` mediante patrones regex en el `GPTQModifier`. El resultado se serializa en formato `compressed-tensors` (`num_bits=4`, `type=int`, `symmetric=true`, `group_size=128`), que vLLM reconoce de forma nativa. El mismo checkpoint sirve para dos rutas de ejecución en CPU Zen: W4A16 puro (forzable con `VLLM_CPU_INT4_W4A8=0`) y DA8W4 con activaciones INT8 dinámicas, que es la ruta por defecto de vLLM (`VLLM_CPU_INT4_W4A8=1`).

## Capacidades

- Reconocimiento automático del habla (ASR): el modelo integra una torre de audio y un proyector multimodal, por lo que está diseñado para transcribir audio a texto.
- Generación de texto condicionada por audio: pipeline declarado como `text-generation`, con soporte conversacional (`conversational` en los tags).
- Procesamiento multimodal con `AutoProcessor`: la model card indica explícitamente que los checkpoints multimodales necesitan el processor guardado para funcionar en vLLM.
- Inferencia cuantizada en CPU: soporte nativo para W4A16 y DA8W4 en procesadores AMD EPYC con ZenDNN y ZenTorch.
- Integración con vLLM 0.33.0: compatible con la API `LLM`/`SamplingParams` estándar.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: la model card solo declara `en`; no se documentan otros idiomas.
- Modo thinking, visión o audio de salida: no disponible en la información proporcionada (solo se confirma entrada de audio).

## Casos de uso

- Transcripción de audio en infraestructura CPU: al estar optimizado para AMD EPYC con ZenDNN, permite desplegar un pipeline ASR sin GPU, útil en entornos donde el coste o la disponibilidad de aceleradores es una restricción. El modelo ocupa 1,8 GiB en disco, lo que facilita el despliegue en contenedores.
- Servicio de subtitulado por lotes: para procesar grandes volúmenes de grabaciones (reuniones, llamadas, podcasts), la cuantización W4A16 reduce el consumo de memoria y permite ejecutar varias instancias en un mismo servidor EPYC.
- Transcripción en edge o on-premise: al no requerir GPU y caber en memoria de sistema modesta, encaja en despliegues on-premise con requisitos de privacidad, donde el audio no puede salir de la infraestructura del cliente.
- Preprocesado de datasets de audio: para generar transcripciones a gran escala antes de entrenar otros modelos (por ejemplo, sistemas TTS o clasificadores de audio), aprovechando el throughput de CPU multinúcleo.
- Integración en pipelines vLLM existentes: si la organización ya opera vLLM sobre CPU AMD, este checkpoint se puede añadir como un modelo más sin cambiar la pila de serving, usando la misma API `LLM.generate`.
- Evaluación de técnicas de cuantización: sirve como referencia reproducible (receta GPTQ con exclusiones de módulos multimodales) para equipos que quieran cuantizar sus propios modelos ASR o multimodales sin degradar la torre de audio.
- Asistentes de voz con backend CPU: combinado con un motor TTS, puede alimentar asistentes conversacionales en entornos con recursos limitados, siempre que el idioma de trabajo sea inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card se interrumpe en la sección "Evaluatio" y no incluye métricas de WER, MMLU, HumanEval ni comparativas con el modelo base en BF16. Tampoco se documentan latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada: no aplica para la ruta principal, que es CPU. Para una hipotética ejecución en GPU, los pesos INT4 ocupan aproximadamente 1,8 GiB, más overhead de activaciones BF16 y del runtime.
- CPU recomendada: AMD EPYC (declarado como hardware soportado), con sistema operativo Linux.
- GPU recomendadas: no disponible. La model card no documenta una ruta GPU; la pila declarada es `torch==2.13.0+cpu`.
- ¿Cabe en GPU de consumo? No disponible en la información proporcionada; el artefacto está orientado a CPU.
- Opciones de despliegue: vLLM 0.33.0 con backend CPU (ZenDNN 6.2.0, ZenTorch 2.14.0.3, PyTorch 2.13.0+cpu, Transformers 5.17.0). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Variables de entorno relevantes: `LD_PRELOAD` apuntando a `libomp.so` (LLVM OpenMP) o `libiomp5.so` (Intel OpenMP) antes de lanzar vLLM; `VLLM_CPU_INT4_W4A8=1` (por defecto) para DA8W4 y `VLLM_CPU_INT4_W4A8=0` para forzar W4A16.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Orientacion |
|---|---|---|---|---|---|
| amd/Qwen3-ASR-1.7B-hf-w4a16-llmcompressor | ~2,04 B | no disponible | W4A16 / DA8W4 | apache-2.0 | CPU AMD EPYC (ZenDNN) |
| Qwen/Qwen3-ASR-1.7B-hf (base) | ~2,04 B | no disponible | BF16 | apache-2.0 | GPU/CPU generico |
| Alternativas ASR de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con otros modelos ASR (por ejemplo, variantes de Whisper o Parakeet) no está disponible en la información proporcionada, por lo que no se incluyen cifras de rendimiento comparado.

## Limitaciones y advertencias

- La model card solo declara inglés (`en`) como idioma soportado; no hay evidencia de soporte multilingüe ni de calidad en castellano.
- La calibración GPTQ se realizó con texto de `ultrachat_200k`, no con audio. Aunque la torre de audio y el proyector se mantienen en BF16 (excluidos de la cuantización), no se documenta una evaluación del impacto de la cuantización en la calidad de transcripción (WER).
- La sección de evaluación de la model card está incompleta ("Evaluatio"), por lo que no hay garantías publicadas sobre la degradación respecto al modelo base.
- Riesgo de alucinación: inherente a los modelos generativos; en ASR puede manifestarse como texto inventado en segmentos con ruido o silencio. No se documentan mitigaciones específicas.
- Sesgos: no se documentan análisis de sesgo del modelo base ni del cuantizado.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base `Qwen/Qwen3-ASR-1.7B-hf` antes de producción.
- Dependencia fuerte de la pila: requiere versiones muy concretas (vLLM 0.33.0, ZenDNN 6.2.0, ZenTorch 2.14.0.3, PyTorch 2.13.0+cpu, Transformers 5.17.0); desviarse de ellas puede romper la ruta cuantizada.
- El `AutoProcessor` debe guardarse junto con los pesos; la receta de `oneshot` no lo hace por defecto y la model card advierte de que es necesario para vLLM con checkpoints multimodales.
- El pipeline declarado es `text-generation`, aunque el modelo procesa audio; esto puede confundir a herramientas que infieran la tarea a partir del tag.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación prácticamente inexistente, lo que implica menor probabilidad de que los problemas estén documentados por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/Qwen3-ASR-1.7B-hf-w4a16-llmcompressor
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- LLM Compressor (repositorio): https://github.com/vllm-project/llm-compressor
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
- Dataset de calibración: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
