# ronke21/rlcl-Qwen2.5-3B-Instruct-igbo-s125

## Resumen

`ronke21/rlcl-Qwen2.5-3B-Instruct-igbo-s125` es un ajuste fino (fine-tune) del modelo Qwen2.5-3B-Instruct de Alibaba, publicado por el usuario ronke21 en Hugging Face. El nombre del repositorio sugiere un experimento de entrenamiento continuado en idioma igbo mediante una técnica denominada "rlcl" (probablemente un método de aprendizaje continuo con regularización o consolidación, aunque el autor no documenta la metodología en la información disponible). El sufijo `s125` apunta a un número de paso, semilla o configuración de entrenamiento concreta.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-3B-Instruct, con 3.085.938.688 parámetros totales y pesos en formato safetensors. El tag `lora-merged` indica que el ajuste se realizó mediante LoRA y posteriormente se fusionó con los pesos base, generando un checkpoint denso estándar compatible con transformers y text-generation-inference.

La relevancia de este modelo es limitada y experimental: cuenta con cero descargas y cero "likes" en el momento de la consulta, el acceso está restringido (gated) y no se publican datos de entrenamiento, benchmarks ni licencia. Debe tratarse como un artefacto de investigación sobre olvido catastrófico (forgetting) y adaptación multilingüe de bajo recurso, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tune LoRA fusionado sobre Qwen2.5-3B-Instruct |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens, ampliable a 131.072 con YaRN; no confirmado para este fine-tune) |
| Tipos de cuantizacion | no disponible en el repo; al ser safetensors en fp/bf16 es cuantizable a GGUF, AWQ, GPTQ y bitsandbytes por herramientas externas |
| Idiomas soportados | no disponible oficialmente; por el nombre del repo, orientado a igbo, manteniendo presumiblemente capacidades multilingues del base |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only con atención de consulta agrupada (GQA), RoPE y normalización RMSNorm, entrenado originalmente por Alibaba con datos multilingües y alineado mediante instrucciones. Sobre esta base se aplicó un ajuste fino con LoRA, cuyos adaptadores se fusionaron en los pesos finales (tag `lora-merged`), resultando en un checkpoint denso de 3,09 mil millones de parámetros.

La información proporcionada no detalla el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO adicionales. El tag `forgetting` sugiere que el experimento mide la degradación de capacidades previas (olvido catastrófico) al adaptar el modelo al igbo, y el acrónimo `rlcl` podría corresponder a una variante de aprendizaje continuo con regularización, pero no se confirma en la ficha del repositorio. No hay innovaciones técnicas documentadas más allá de la fusión de LoRA.

## Capacidades

- Generación de texto conversacional en formato chat, heredada de Qwen2.5-3B-Instruct.
- Razonamiento básico, matemáticas elementales y generación de código, presumiblemente con posible degradación por el fine-tune (no verificado).
- Soporte de tool calling y function calling heredado del modelo base (no confirmado tras el ajuste).
- Capacidad multilingüe del base, con especialización declarada en igbo.
- Modo instructivo multi-turno.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación sobre olvido catastrófico: comparar el rendimiento del modelo en tareas del base (MMLU, HumanEval) antes y después del ajuste en igbo para cuantificar la degradación, dado el tag `forgetting`.
- Procesamiento de lengua igbo de bajo recurso: generación y paráfrasis de texto en igbo en entornos de investigación lingüística, aprovechando el ajuste específico.
- Experimentos de aprendizaje continuo: replicar la configuración `rlcl` y el checkpoint `s125` como referencia en estudios de adaptación de modelos pequeños.
- Prototipado de asistentes conversacionales en igbo: despliegue en local con llama.cpp u Ollama para demos de bajo coste en GPU de consumo.
- Evaluación comparativa de técnicas de fusión LoRA: usar los pesos fusionados como baseline frente a adaptadores no fusionados.
- Docencia y formación: ejemplo práctico de fine-tune de un modelo de 3B con licencia y acceso restringido para ilustrar pipelines de adaptación lingüística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica 8-10 GB para contexto moderado.
- Cuantización a 8 bits: unos 3,5 GB; a 4 bits (GGUF Q4_K_M): unos 2 GB, permitiendo inferencia en GPUs de 4-6 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4; A100/H100 solo para batched serving a gran escala.
- Cabe en GPU de consumo: sí, en RTX 3060/4060/4070 con cuantización, y en bf16 en tarjetas de 12 GB o más.
- Opciones de despliegue: transformers, text-generation-inference (tag `endpoints_compatible`), vLLM, llama.cpp y Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ronke21/rlcl-Qwen2.5-3B-Instruct-igbo-s125 | 3,09 B | no disponible | no disponible | Gated en HF |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 (131.072 con YaRN) | Apache 2.0 (modelo base) | Abierto |
| Llama 3.2 3B Instruct | 3,2 B | 128.000 | Llama 3.2 Community License | Abierto con aceptación |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 | MIT | Abierto |

El fine-tune de ronke21 carece de licencia y benchmarks publicados, por lo que la comparación de rendimiento no es posible; frente a sus alternativas, su principal diferencia es la especialización en igbo y su carácter experimental.

## Limitaciones y advertencias

- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que complica la reproducibilidad y el uso automatizado.
- Licencia no especificada: no se puede garantizar el uso comercial; además, los términos del modelo base Qwen2.5 (Apache 2.0) podrían no cubrir este derivado si el autor no los declara.
- Riesgo elevado de olvido catastrófico: el propio tag `forgetting` indica que las capacidades originales pueden haberse degradado.
- Sin datos de entrenamiento ni evaluación: imposible estimar sesgos, calidad o fiabilidad.
- Riesgo de alucinación inherente a modelos de 3B, potencialmente agravado por el ajuste.
- Idiomas soportados no declarados: el comportamiento fuera del igbo y del inglés es incierto.
- Cero adopción (0 descargas, 0 likes): sin validación comunitaria.
- No apto para producción sin evaluación previa exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/ronke21/rlcl-Qwen2.5-3B-Instruct-igbo-s125
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
