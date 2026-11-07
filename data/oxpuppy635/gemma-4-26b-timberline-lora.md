# oxpuppy635/gemma-4-26b-Timberline-lora

## Resumen

`oxpuppy635/gemma-4-26b-Timberline-lora` es un adaptador LoRA publicado por el usuario oxpuppy635 sobre el modelo base `OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2`, una variante descensurada ("heretic") del modelo Gemma 4 de 26B con arquitectura MoE (26B-A4B). El adaptador no es un modelo completo: pesa 18.585.600 parámetros (aproximadamente 0,1 GB en safetensors) y debe aplicarse dinámicamente sobre el modelo base para tener efecto.

El propósito declarado del adaptador es el ajuste fino conversacional y de razonamiento sobre el modelo base, entrenado con 2000 conversaciones que incluyen trazas de razonamiento en el formato `<|channel>thought...<channel|>`. Se distribuye en dos formatos: pesos PEFT/safetensors para su uso con `transformers` + `peft`, y un adaptador LoRA en GGUF para su carga en tiempo de ejecución con `llama.cpp` mediante el flag `--lora`.

Es relevante porque ejemplifica el flujo de trabajo de personalización ligera sobre modelos MoE grandes mediante QLoRA de 4 bits, incluyendo los expertos MoE en NF4, y porque ofrece una vía práctica de aplicar adaptadores LoRA sobre GGUF cuantizados sin necesidad de fusionar pesos. La información pública disponible es muy escasa: no hay benchmarks, no se declara licencia ni lista de idiomas, y el repositorio no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelo base MoE Gemma 4 (26B-A4B, `Gemma4ForConditionalGeneration`) |
| Parametros totales | 18.585.600 (adaptador LoRA); el modelo base es de 26B con 4B activos |
| Parametros activos | No aplica al adaptador; el modelo base es MoE 26B-A4B (4B activos) |
| Longitud de contexto | 3072 tokens (longitud máxima de secuencia usada en el entrenamiento del adaptador) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 con cómputo en bfloat16 (incluye expertos MoE 3D en NF4); adaptador GGUF para `llama.cpp` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT) y GGUF (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango `r=16` y `lora_alpha=32` aplicado sobre un modelo base con arquitectura MoE de tipo `Gemma4ForConditionalGeneration` (26B totales, 4B activos). El entrenamiento se realizó con QLoRA de 4 bits: cuantización NF4 con cómputo en bfloat16, incluyendo los expertos MoE tridimensionales en NF4, lo que permite ajustar un modelo MoE grande con un consumo de memoria reducido.

Los datos de entrenamiento consisten en 2000 conversaciones, todas ellas (2000/2000) con trazas de razonamiento en el formato `<|channel>thought...<channel|>` seguidas de la respuesta final. Se entrenaron 3 épocas con una longitud máxima de secuencia de 3072 tokens, alcanzando una pérdida final de entrenamiento de 2,1126. No se documenta la composición del dataset, el número total de tokens procesados, ni si hubo etapas de RLHF o DPO posteriores. El modelo base es una variante "heretic" y "uncensored" del Gemma 4 original, con cuantización QAT q4_0, lo que condiciona el comportamiento del adaptador resultante.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base.
- Razonamiento explícito mediante trazas en formato `<|channel>thought...<channel|>`, ya que el adaptador fue entrenado específicamente sobre este esquema.
- Generación de código y matemáticas: capacidad presumible del modelo base Gemma 4, no verificada para este adaptador concreto.
- Tool calling y function calling: no documentado para este adaptador; depende de las capacidades del modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el entrenamiento con trazas de razonamiento apunta a este uso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de visión: el modelo base es de tipo `Gemma4ForConditionalGeneration`, lo que sugiere soporte condicional de modalidades, pero no se detalla en la model card.
- Modo "uncensored": el modelo base está descensurado, por lo que el adaptador hereda un filtrado reducido de contenido.

## Casos de uso

- Prototipado de asistentes conversacionales con razonamiento visible: el adaptador está entrenado para emitir trazas `<|channel>thought...<channel|>`, lo que permite construir interfaces que muestren el razonamiento intermedio antes de la respuesta final, útil en herramientas de depuración y educación.
- Experimentación con LoRA sobre MoE en `llama.cpp`: al distribuirse como adaptador GGUF, permite probar variantes de comportamiento sobre un mismo GGUF base sin re-cuantizar ni fusionar pesos, ideal para iterar rápidamente en local.
- Ajuste de estilo y tono en dominios creativos: con 2000 conversaciones de entrenamiento, el adaptador puede modificar el registro y la voz del modelo base para narrativa, guiones o escritura de ficción, como sugiere el ejemplo de la model card ("Write an evocative story...").
- Investigación sobre alineación y descensurado: al partir de un modelo base "heretic" y "uncensored", sirve para estudiar cómo un LoRA pequeño modifica el comportamiento de rechazo y seguridad de un modelo grande, con fines de evaluación de riesgos.
- Despliegue de bajo coste en hardware de consumo: el adaptador pesa ~0,1 GB y se aplica sobre un GGUF Q4_K_M del modelo base, lo que permite ejecutar la pila completa en GPUs de consumo con `-ngl 99` y contexto de 3072 tokens.
- Evaluación comparativa de adaptadores: sirve como punto de partida para comparar distintos LoRA (por ejemplo, el `gemma-26b-Timberline-lora` del mismo autor) sobre el mismo modelo base, midiendo cambios de pérdida y comportamiento cualitativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo de rendimiento es la pérdida final de entrenamiento (2,1126) tras 3 épocas, que no es comparable con métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa aproximadamente 0,1 GB en safetensors y es despreciable en VRAM frente al modelo base.
- El modelo base (26B-A4B MoE) en GGUF Q4_K_M requiere del orden de 15-17 GB de VRAM o memoria unificada; en bfloat16 completo superaría los 50 GB.
- GPU recomendadas para el modelo base cuantizado: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB para despliegues de mayor concurrencia.
- Cabe en GPU de consumo de 24 GB con cuantización Q4_K_M y contexto de 3072 tokens; en GPUs de 16 GB puede requerir offloading parcial de capas a CPU.
- Opciones de despliegue: `llama.cpp` con `--lora` (soporte nativo del adaptador GGUF), `transformers` + `peft` con `PeftModel.from_pretrained`, y potencialmente vLLM o TGI si se fusionan los pesos del adaptador en el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `oxpuppy635/gemma-4-26b-Timberline-lora` | 18,6M (LoRA) sobre base 26B-A4B | 3072 (entrenamiento) | safetensors + GGUF LoRA | no disponible | Adaptador sobre base "heretic" uncensored |
| `oxpuppy635/gemma-26b-Timberline-lora` | No disponible | No disponible | safetensors + GGUF LoRA | no disponible | Variante del mismo autor sobre otro base |
| `oxpuppy635/gemma-4-26B-A4B-it-uncensored-NVFP4` | 26B (modelo completo) | No disponible | NVFP4 | no disponible | Modelo completo cuantizado en NVFP4, no un adaptador |
| `OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2` | 26B-A4B | No disponible | safetensors | no disponible | Modelo base del adaptador |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no es un modelo autónomo: requiere el modelo base `OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2` para funcionar.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; el modelo base Gemma de Google tiene su propia licencia que puede imponer restricciones adicionales.
- Modelo base "uncensored" y "heretic": el filtrado de contenido es reducido, lo que implica riesgo de generar contenido dañino, sesgado o inapropiado en producción.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad factual para este adaptador.
- Contexto limitado a 3072 tokens en el entrenamiento del adaptador; usos con ventanas mayores pueden degradar el comportamiento aprendido.
- Entrenamiento con solo 2000 conversaciones y 3 épocas: riesgo de sobreajuste al estilo y formato del dataset, con posible pérdida de generalidad.
- Sin datos de benchmarks, idiomas ni evaluación de sesgos: no recomendable para producción sin una evaluación propia previa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.
- El formato de trazas `<|channel>thought...<channel|>` requiere que el tokenizador y la plantilla de chat del modelo base lo soporten correctamente.

## Enlaces

- Hugging Face (adaptador): https://huggingface.co/oxpuppy635/gemma-4-26b-Timberline-lora
- Variante del mismo autor: https://huggingface.co/oxpuppy635/gemma-26b-Timberline-lora
- Modelo completo NVFP4 del mismo autor: https://huggingface.co/oxpuppy635/gemma-4-26B-A4B-it-uncensored-NVFP4
- Modelo base: https://huggingface.co/OS-Software/gemma-4-26B-A4B-it-qat-q4_0-unquantized-uncensored-heretic-v2
