# ai-forever/Zarya-4B

## Resumen

Zarya-4B es un prototipo de investigación desarrollado por ai-forever (el equipo detrás de la familia de modelos Yandex/Sber, con sede en Rusia) que implementa un modelo de lenguaje híbrido: combina un objetivo autorregresivo (AR) clásico con un objetivo de difusión enmascarada (MDM, masked diffusion modeling) dentro de una única arquitectura. El modelo se construye sobre el backbone de Qwen3, con un wrapper propietario denominado Zarya que permite alternar entre ambos paradigmas de generación a través de una sola llamada a `model.generate(...)`.

La relevancia de este modelo radica en su carácter experimental: explora si un mismo modelo puede aprender simultáneamente a predecir el siguiente token (como un transformer causal estándar) y a denoizar secuencias enmascaradas (como los modelos de difusión para texto), lo que abre la puerta a técnicas de decodificación especulativa paralela y a una mayor eficiencia en la generación. Con 4.022 millones de parámetros y una ventana de contexto de 2048 tokens, está pensado para investigación en paradigmas de generación híbridos, no para producción.

El modelo soporta ruso e inglés, se distribuye bajo licencia MIT y requiere `trust_remote_code=True` para cargarse con Transformers. Su tamaño de repositorio es de 8,1 GB y acumula 591 descargas en Hugging Face en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida autorregresiva (AR) + difusión enmascarada (MDM, DLLM); backbone Qwen3 con wrapper Zarya |
| Parámetros totales | 4.022.468.096 (4B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible (pesos en safetensors; se puede cuantizar con herramientas estándar, pero no se documentan tipos oficiales) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| hidden_size | 2560 |
| num_hidden_layers | 36 |
| num_attention_heads | 32 |
| intermediate_size | 9728 |
| Versión de Transformers probada | 5.12.1 (según model card); benchmarks con 5.19.0 |
| Versión de PyTorch probada | 2.9.0 |

## Arquitectura y entrenamiento

Zarya-4B es un transformer causal construido sobre el backbone de Qwen3 (36 capas, hidden size 2560, 32 cabezas de atención, FFN de 9728). La innovación principal es el wrapper Zarya, que añade un objetivo de difusión enmascarada (MDM) entrenado conjuntamente con el objetivo autorregresivo clásico. El modelo puede operar en dos modos de generación a través de la misma interfaz `generate()`:

- **Muestreo MDM** (`slotted_generation=false`): denoización iterativa por difusión enmascarada con un sampler de "first-hitting". El modelo parte de una secuencia enmascarada y va desenmascarando tokens de forma iterativa.
- **Decodificación especulativa por slots** (`slotted_generation=true`): generación paralela por slots con selección basada en difusión entre slots y generación autorregresiva intra-slot, lo que proporciona una aceleración en la decodificación.

Ambos modos utilizan la caché KV completa con máscaras de atención causales. El modelo soporta fine-tuning conversacional (SFT) y preentrenamiento autorregresivo clásico. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card indica que es un prototipo de investigación y que el rendimiento y la estabilidad de la inferencia dependen en gran medida de los hiperparámetros de decodificación (`slotted_generation`, `slot_size`, `serial_num_blocks`, `slot_threshold`, `token_threshold`, etc.).

## Capacidades

- Generación de texto autorregresiva clásica (continuación de prompt) y generación por difusión enmascarada.
- Generación conversacional con plantilla de chat (`<|im_start|>user ... <|im_end|>`).
- Decodificación especulativa paralela por slots para acelerar la inferencia.
- Razonamiento y matemáticas: el modelo ha sido evaluado en GSM8K, Hendrycks MATH500, Minerva Math500, ARC Challenge y HellaSwag.
- Generación de código: evaluado en HumanEval, HumanEval-Instruct, MBPP y MBPP-Plus.
- Seguimiento de instrucciones: evaluado en IFEval.
- Capacidades multilingües limitadas a ruso e inglés.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modelo es un prototipo de investigación.
- Modo "thinking": no disponible.
- Visión y audio: no disponibles.

## Casos de uso

- **Investigación en paradigmas de generación híbridos**: el modelo permite comparar directamente en un mismo backbone el rendimiento de la generación autorregresiva frente a la difusión enmascarada, facilitando estudios académicos sobre DLLM (diffusion language models) con un único checkpoint de 4B parámetros.
- **Experimentación con decodificación especulativa**: el modo `slotted_generation=true` permite medir aceleraciones de decodificación en entornos controlados, útil para investigadores que trabajan en optimización de inferencia y técnicas de speculative decoding.
- **Generación de texto en ruso e inglés**: el modelo puede emplearse para continuación de prompts y generación conversacional en ambos idiomas, aunque con la advertencia de que es un prototipo y no está validado para producción.
- **Fine-tuning conversacional (SFT)**: al soportar SFT sobre el backbone Qwen3, puede servir como base para experimentos de ajuste supervisado en dominios específicos en ruso o inglés, con la ventaja de la licencia MIT.
- **Evaluación comparativa de técnicas de denoising**: investigadores pueden usar el modo MDM para estudiar el comportamiento de samplers de "first-hitting" y comparar la calidad de generación frente a la decodificación AR clásica en tareas como GSM8K o HumanEval.
- **Prototipado de pipelines de generación con caché KV**: al emplear máscaras causales y caché KV en ambos modos, el modelo es adecuado para estudiar la eficiencia de la caché en esquemas de difusión, un área poco explorada en la literatura.
- **Base para experimentos de decodificación paralela por slots**: el parámetro `slot_size` y `serial_num_blocks` permiten explorar configuraciones de paralelismo que podrían trasladarse a otros modelos, sirviendo como banco de pruebas para técnicas de aceleración.

## Benchmarks y rendimiento

La model card incluye resultados de LM-eval, pero la información proporcionada está truncada: solo se muestra la primera fila de la tabla (ARC Challenge, 0-shot, accuracy 0.4718 ± error estándar no visible). No se dispone de los resultados completos de GSM8K, IFEval, HumanEval, MBPP, HellaSwag, Hendrycks MATH500 ni Minerva Math500. Los resultados fueron recogidos con parámetros de inferencia variables y en distintas GPUs, y el autor advierte que el rendimiento es sensible tanto a la configuración como al hardware.

| Tarea | Versión | n-shot | Métrica | Valor | Stderr |
|---|---|---|---|---|---|
| arc_challenge | 1.0 | 0 | acc | 0.4718 | no disponible (truncado) |
| gsm8k | no disponible | no disponible | no disponible | no disponible | no disponible |
| ifeval | no disponible | no disponible | no disponible | no disponible | no disponible |
| hendrycks_math500 | no disponible | no disponible | no disponible | no disponible | no disponible |
| minerva_math500 | no disponible | no disponible | no disponible | no disponible | no disponible |
| humaneval_instruct | no disponible | no disponible | no disponible | no disponible | no disponible |
| humaneval | no disponible | no disponible | no disponible | no disponible | no disponible |
| mbpp | no disponible | no disponible | no disponible | no disponible | no disponible |
| mbpp_plus | no disponible | no disponible | no disponible | no disponible | no disponible |
| hellaswag | no disponible | no disponible | no disponible | no disponible | no disponible |

Configuración de evaluación: A100, `dtype=bfloat16`, `attn_implementation=sdpa`, `apply_chat_template`, `slotted_generation=true`, `slot_size=16`, `serial_num_blocks=4`, `slot_threshold=0.9`, `token_threshold=0.4`. Entorno: CUDA 13.2, driver 595.71.05, Torch 2.9.0+cu128, Transformers 5.19.0, lm-eval 0.4.13.

No se han publicado resultados completos de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia en bfloat16**: aproximadamente 8-9 GB para los pesos (4B parámetros × 2 bytes), más la caché KV para 2048 tokens de contexto. Con 36 capas, 32 cabezas y hidden size 2560, la caché KV es moderada; se estima un total de 10-12 GB en bf16 para secuencias de 2048 tokens.
- **GPU recomendadas**: A100 (usada en los benchmarks oficiales), H100, y GPUs consumer de gama alta como RTX 4090 (24 GB) o RTX 3090 (24 GB) para bf16. Para GPUs con 16 GB (RTX 4080, 4070 Ti Super) sería necesario cuantizar a 8 bits o usar fp16 con cuidado.
- **¿Cabe en consumer GPU?**: sí, en RTX 4090/3090 (24 GB) en bf16 sin problemas; en GPUs de 16 GB probablemente requiera cuantización (no documentada oficialmente).
- **Opciones de despliegue**: Transformers con `trust_remote_code=True` (único método documentado). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; dado que el modelo requiere código personalizado y tiene un wrapper propio, la integración con estos frameworks no está garantizada.
- **Latencia y throughput**: no disponibles. El autor indica que el rendimiento depende de los hiperparámetros de decodificación y del hardware, y que el modo `slotted_generation=true` proporciona una aceleración en la decodificación, pero no se proporcionan cifras concretas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zarya-4B | 4B | 2048 | Híbrida AR + MDM (backbone Qwen3) | MIT | Hugging Face |
| Qwen3-4B | 4B | 32K (típico en Qwen3) | Transformer causal AR | Apache 2.0 (típico) | Hugging Face |
| LLaDA-8B | 8B | no disponible | Diffusion language model (MDM) | MIT (típico) | Hugging Face |
| Dream-7B | 7B | no disponible | Diffusion language model | no disponible | Hugging Face |

La comparación con Qwen3-4B es directa porque Zarya-4B usa ese backbone; la diferencia clave es el objetivo híbrido y la ventana de contexto reducida a 2048 tokens. Frente a modelos de difusión puros como LLaDA o Dream, Zarya-4B ofrece la ventaja de combinar AR y MDM en un solo modelo, pero con menor tamaño y contexto más limitado. No se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- **Prototipo de investigación**: el autor indica explícitamente que no debe usarse para decisiones de producción, aplicaciones críticas de seguridad ni casos donde la precisión y fiabilidad sean esenciales sin evaluación y salvaguardas adicionales.
- **Contexto limitado**: solo 2048 tokens, muy por debajo de los estándares actuales (32K-128K en modelos comparables), lo que limita su uso en tareas de contexto largo.
- **Idiomas limitados**: solo ruso e inglés; no se documenta soporte para castellano ni otros idiomas.
- **Riesgo de alucinación**: no cuantificado en la información disponible; al ser un prototipo sin RLHF documentado, el riesgo es probablemente alto.
- **Sesgos conocidos**: no documentados en la información proporcionada.
- **Dependencia de hiperparámetros**: el rendimiento y la estabilidad de la inferencia dependen críticamente de parámetros como `slotted_generation`, `slot_size`, `serial_num_blocks`, `slot_threshold` y `token_threshold`; configuraciones inadecuadas pueden degradar la calidad o provocar inestabilidad.
- **Compatibilidad de versiones**: el código depende de APIs de Hugging Face Transformers; se probó con Transformers 5.12.1 y PyTorch 2.9.0, y debe verificarse la compatibilidad al actualizar versiones.
- **Requiere `trust_remote_code=True`**: implica ejecutar código personalizado del repositorio, con el riesgo de seguridad asociado.
- **Licencia MIT**: permite uso comercial, pero al ser un prototipo sin validación, el uso comercial no está recomendado por el autor.
- **Sin soporte documentado para tool calling, agentes o modos de razonamiento**: no apto para pipelines de agentes sin trabajo adicional.

## Enlaces

- Hugging Face: https://huggingface.co/ai-forever/Zarya-4B
- Preprint (arXiv): https://arxiv.org/abs/2609.19868
- Repositorio con código de entrenamiento: https://github.com/ai-forever/zarya
