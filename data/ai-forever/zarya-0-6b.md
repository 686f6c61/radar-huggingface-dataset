# ai-forever/Zarya-0.6B

## Resumen

Zarya-0.6B es un prototipo de investigación desarrollado por ai-forever (el equipo detrás de la familia de modelos Yandex/Sber, conocido por modelos como ruGPT y YaLM) que propone una arquitectura híbrida capaz de combinar en un mismo modelo un objetivo autorregresivo (AR) clásico con un objetivo de difusión enmascarada (MDM). El modelo se construye sobre el backbone de Qwen3, con 596 millones de parámetros totales, 28 capas, dimensión oculta de 1024 y 16 cabezas de atención, y una longitud de contexto de 2048 tokens. Está pensado para generación de texto y conversación en ruso e inglés, y se distribuye bajo licencia MIT.

La relevancia del modelo radica en su doble modo de generación accesible a través de una única llamada a `model.generate(...)`: un modo de muestreo por difusión enmascarada (MDM) con un sampler de primer impacto, y un modo de decodificación especulativa paralela por slots que combina generación paralela con selección basada en difusión entre slots y generación autorregresiva intra-slot. Ambos modos aprovechan plenamente la caché KV con máscaras de atención causal, lo que lo convierte en un banco de pruebas interesante para investigar alternativas a la decodificación autorregresiva tradicional.

Se trata explícitamente de un prototipo de investigación: el propio autor advierte que no debe usarse en decisiones de producción ni en aplicaciones críticas para la seguridad sin evaluación y salvaguardas adicionales. El rendimiento y la estabilidad de la inferencia dependen en gran medida de los hiperparámetros de decodificación elegidos (`slotted_generation`, `slot_size`, `serial_num_blocks`, `slot_threshold`, `token_threshold`, entre otros).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida autorregresiva (AR) + difusión enmascarada (MDM); backbone Qwen3, wrapper Zarya |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantización | no disponible (el repo solo distribuye safetensors en bfloat16) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| hidden_size | 1024 |
| num_hidden_layers | 28 |
| num_attention_heads | 16 |
| intermediate_size | 3072 |
| Tamaño del repo | 1.2 GB |
| Requiere trust_remote_code | Sí (custom_code) |
| Versiones probadas | Transformers 5.12.1 / 5.19.0, PyTorch 2.9.0 |

## Arquitectura y entrenamiento

Zarya-0.6B emplea una arquitectura híbrida que puede construirse sobre cualquier modelo autorregresivo, aunque en este repositorio se implementa sobre el backbone de Qwen3. El modelo aprende conjuntamente un objetivo autorregresivo clásico y un objetivo de difusión enmascarada dentro de un único modelo, lo que le permite operar en dos regímenes de generación distintos sin cambiar de pesos. La arquitectura concreta de 0.6B tiene 28 capas, dimensión oculta de 1024, 16 cabezas de atención y tamaño intermedio de 3072, con un contexto de 2048 tokens.

En cuanto a los datos de entrenamiento, la información proporcionada no detalla el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO; el modelo card únicamente indica que soporta ajuste fino conversacional (SFT) y preentrenamiento autorregresivo clásico. La innovación técnica destacable es el doble modo de decodificación: el muestreo MDM realiza un denoising iterativo por difusión enmascarada con un sampler de primer impacto, mientras que la decodificación especulativa por slots genera slots en paralelo con selección basada en difusión entre slots y generación autorregresiva intra-slot para acelerar la decodificación. Ambos modos usan la caché KV completa con máscaras de atención causal.

## Capacidades

- Generación de texto y continuación de prompts mediante `model.generate(...)`, incluyendo prompts con formato de chat a través de la plantilla proporcionada.
- Conversación multi-turno con el template de chat estilo Qwen (`<|im_start|>user ... <|im_end|>`).
- Modo de difusión enmascarada (MDM) con sampler de primer impacto para denoising iterativo (`slotted_generation=false`).
- Modo de decodificación especulativa paralela por slots con aceleración de decodificación (`slotted_generation=true`), con parámetros configurables como `slot_size`, `serial_num_blocks`, `slot_threshold` y `token_threshold`.
- Ajuste fino conversacional (SFT) y preentrenamiento autorregresivo clásico.
- Soporte multilingüe limitado a ruso e inglés.
- Evaluación integrada con el paquete `lm-eval` (backend `causal`, `attn_implementation=sdpa`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.

## Casos de uso

- Investigación sobre decodificación no autorregresiva: el modelo sirve como banco de pruebas para comparar muestreo MDM frente a decodificación especulativa por slots en condiciones controladas, gracias a que ambos modos comparten pesos y se seleccionan con un único parámetro de configuración.
- Experimentos de aceleración de inferencia: el modo `slotted_generation=true` permite medir el impacto de la generación paralela por slots en latencia y throughput frente al modo MDM, ajustando `slot_size`, `serial_num_blocks`, `slot_threshold` y `token_threshold`.
- Generación de texto en ruso e inglés para prototipos de asistentes conversacionales: el soporte de chat template y de SFT lo hace adecuado para validar pipelines de conversación antes de pasar a modelos de mayor tamaño.
- Evaluación académica de modelos híbridos AR+MDM: con contexto de 2048 tokens y 0.6B de parámetros, es viable ejecutar baterías completas de `lm-eval` (GSM8K, IFEval, ARC-Challenge, HumanEval, MBPP, HellaSwag, entre otras) en una sola GPU.
- Ajuste fino conversacional (SFT) sobre dominios específicos en ruso: al ser un modelo pequeño con licencia MIT, se puede reentrenar con recursos moderados para tareas de generación de texto acotadas.
- Estudio de estabilidad y sensibilidad a hiperparámetros de decodificación: el modelo card señala explícitamente que el rendimiento depende de la configuración, por lo que es útil para caracterizar esa sensibilidad en entornos de investigación.
- Docencia y formación: su tamaño reducido y su doble paradigma de generación lo convierten en un ejemplo didáctico para explicar difusión enmascarada y decodificación especulativa en modelos de lenguaje.

## Benchmarks y rendimiento

La información proporcionada incluye una tabla de resultados de `lm-eval` en una A100 con `dtype=bfloat16`, `attn_implementation=sdpa`, `apply_chat_template` y `slotted_generation=true, slot_size=16, serial_num_blocks=4, slot_threshold=0.9, token_threshold=0.4`, pero la tabla aparece truncada en el primer resultado (ARC-Challenge, 0-shot, métrica `acc`) sin que se proporcione el valor numérico ni el resto de tareas. Por tanto, no es posible reproducir cifras concretas sin inventar datos.

| Tarea | n-shot | Métrica | Valor | Stderr |
|---|---|---|---|---|
| arc_challenge | 0 | acc | no disponible (tabla truncada en la información) | no disponible |
| gsm8k | no disponible | no disponible | no disponible | no disponible |
| ifeval | no disponible | no disponible | no disponible | no disponible |
| hendrycks_math500 | no disponible | no disponible | no disponible | no disponible |
| minerva_math500 | no disponible | no disponible | no disponible | no disponible |
| humaneval_instruct | no disponible | no disponible | no disponible | no disponible |
| humaneval | no disponible | no disponible | no disponible | no disponible |
| mbpp | no disponible | no disponible | no disponible | no disponible |
| mbpp_plus | no disponible | no disponible | no disponible | no disponible |
| hellaswag | no disponible | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks completos en la información disponible. El autor advierte además que las mediciones se recogieron con parámetros de inferencia variables y en distintas GPUs, por lo que el rendimiento es sensible tanto a la configuración como al hardware.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 1,2 GB de pesos más la caché KV y overhead de activaciones; con contexto de 2048 tokens y 28 capas, la caché KV es modesta, por lo que en la práctica cabe holgadamente en GPUs de 8 GB o incluso menos.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o RTX 4090; el modelo card reporta ejecuciones en A100 como referencia de evaluación.
- GPU recomendadas para evaluación completa con `lm-eval`: A100 (configuración reportada por el autor), aunque por tamaño cualquier GPU moderna con al menos 8-12 GB es suficiente.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el código personalizado), `attn_implementation=sdpa`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Versiones de software: probado con Transformers 5.12.1 y 5.19.0 y PyTorch 2.9.0; el autor advierte que hay que verificar compatibilidad al actualizar versiones de Transformers.
- Latencia y throughput: no disponibles de forma numérica; dependen de los hiperparámetros de decodificación (`slotted_generation`, `slot_size`, `serial_num_blocks`, etc.) y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zarya-0.6B | 596 M | 2048 | Híbrido AR + MDM | MIT | Hugging Face (research prototype) |
| Qwen3 (backbone base) | no disponible en la información | no disponible en la información | Autorregresivo | no disponible en la información | Hugging Face |
| Modelos de difusión enmascarada tipo LLaDA / Dream | no disponible en la información | no disponible en la información | Difusión enmascarada pura | no disponible en la información | no disponible en la información |

La información proporcionada no incluye datos comparativos de rendimiento frente a alternativas. La comparación más directa es con el backbone Qwen3 sobre el que se construye, pero no se dispone de sus especificaciones ni resultados en esta ficha. No se dispone de datos suficientes para una comparativa cuantitativa rigurosa con modelos de difusión enmascarada de tamaño similar.

## Limitaciones y advertencias

- Prototipo de investigación: el autor indica explícitamente que no debe usarse para decisiones de producción, aplicaciones críticas para la seguridad ni casos donde la precisión y fiabilidad sean esenciales sin evaluación y salvaguardas adicionales.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad ni mecanismos de mitigación; al ser un modelo de 0.6B, la fiabilidad factual es limitada.
- Sesgos: no se documentan análisis de sesgos en la información disponible.
- Idiomas: solo ruso e inglés; no hay soporte documentado de castellano ni de otros idiomas.
- Contexto limitado: 2048 tokens, inferior a los contextos de 32K-128K habituales en modelos actuales de tamaño similar.
- Sensibilidad a hiperparámetros: el rendimiento y la estabilidad de la inferencia dependen de parámetros como `slotted_generation`, `slot_size`, `serial_num_blocks`, `slot_threshold` y `token_threshold`; no hay valores óptimos universales documentados.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio y revisarlo antes de usarlo en entornos sensibles.
- Compatibilidad frágil: probado solo con Transformers 5.12.1/5.19.0 y PyTorch 2.9.0; las actualizaciones de versión pueden romper la compatibilidad.
- Licencia MIT: permite uso comercial, pero al ser un prototipo de investigación la idoneidad técnica para producción no está respaldada por el autor.
- Sin datos de benchmarks completos publicados en la información disponible, lo que dificulta una evaluación objetiva previa a su adopción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-forever/Zarya-0.6B
- Preprint: https://arxiv.org/abs/2609.19868
- Repositorio con código de entrenamiento: https://github.com/ai-forever/zarya
- Perfil del autor en Hugging Face: https://huggingface.co/ai-forever
