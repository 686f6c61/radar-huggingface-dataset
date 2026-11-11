# moltherm1/olmo-mirror-olmoe-1b-7b-0125

## Resumen

OLMoE-1B-7B-0125 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el Allen Institute for AI (Ai2), publicado en enero de 2025 como una versión mejorada de OLMoE-09-24. Cuenta con 7.000 millones de parámetros totales de los cuales solo 1.300 millones están activos por token, lo que permite una inferencia significativamente más económica que un modelo denso de tamaño equivalente. Es un modelo completamente abierto: pesos, datos de entrenamiento, código y logs están publicados bajo licencia Apache 2.0.

El modelo está diseñado para investigación y aplicaciones de generación de texto en inglés. Su relevancia radica en que demuestra que es posible entrenar un MoE competitivo con datos y código 100 % abiertos, alcanzando un rendimiento en MMLU (56,3) superior al de modelos densos de ~1B activos como TinyLlama-1B (33,6) o OLMo-1B-0724 (32,1), y compitiendo con MoEs propietarios de mayor tamaño activo como JetMoE-2B-9B (49,1) o DeepSeek-3B-16B (45,5).

La ficha que sigue describe el checkpoint base de preentrenamiento alojado en el repositorio `moltherm1/olmo-mirror-olmoe-1b-7b-0125`, que es un espejo del checkpoint oficial `allenai/OLMoE-1B-7B-0125`. No incluye el ajuste supervisado (SFT) ni la alineación por preferencias (DPO/KTO) que sí están disponibles en los checkpoints `-SFT` e `-Instruct` del repositorio oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts (MoE) |
| Parametros totales | 7.000 millones (7B) |
| Parametros activos | 1.300 millones (1,3B) por token |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en BF16 y FP32) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 por defecto; rama `fp32` disponible en el repo oficial) |

## Arquitectura y entrenamiento

OLMoE-1B-7B-0125 es un transformer decoder-only con capas de mezcla de expertos (MoE). Cada token activa 1,3B de parámetros de un total de 7B, lo que reduce el coste computacional de inferencia manteniendo una capacidad de representación propia de un modelo de 7B. El checkpoint `main` se obtiene tras un proceso de annealing sobre el checkpoint de preentrenamiento `step1200000-tokens5033B`, con 100.000 millones de tokens adicionales (23.842 pasos). Los pesos se almacenan en BF16 tras comprobar que el casting desde FP32 no degrada el rendimiento; la versión FP32 original está disponible en la rama `fp32`.

El entrenamiento utiliza datos completamente abiertos: el dataset de preentrenamiento `allenai/OLMoE-mix-0924` y el dataset de annealing `allenai/dolmino-mix-1124`. Sobre el checkpoint base se aplicaron posteriormente SFT (con `allenai/tulu-v3.1-mix-preview-4096-OLMoE`) y alineación por preferencias mediante DPO y KTO (con `allenai/ultrafeedback_binarized_cleaned`), dando lugar a los checkpoints `-SFT` e `-Instruct`. El modelo reporta una huella de carbono declarada de 1 (unidad no especificada en la model card).

## Capacidades

- Generación de texto autoregresiva en inglés.
- Razonamiento de conocimiento general (MMLU 56,3 en el checkpoint base).
- Comprensión lectora y sentido común (HellaSwag 81,7, WinoGrande 70,6).
- Razonamiento científico y de preguntas de opción múltiple (ARC-Challenge 67,5, ARC-Easy 84,4).
- Razonamiento físico cotidiano (PIQA 78,7).
- Al ser un checkpoint base, no incluye instrucciones ni alineación conversacional; para diálogo y seguimiento de instrucciones debe usarse la variante `-Instruct`.
- Soporte de tool calling / function calling: no disponible en el checkpoint base (sí potencialmente en la variante Instruct, no confirmado en la información proporcionada).
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma nativa en el checkpoint base.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación sobre arquitecturas MoE: el modelo permite reproducir experimentos de enrutamiento de expertos, balanceo de carga y eficiencia de activación gracias a que pesos, datos y logs son públicos.
- Fine-tuning supervisado para dominios específicos: al ser un checkpoint base Apache 2.0, se puede adaptar con SFT a tareas de clasificación, extracción o generación en inglés con un coste de inferencia bajo (1,3B activos).
- Generación de texto en producción con restricciones de latencia: al activar solo 1,3B parámetros por token, es adecuado para servicios de autocompletado o generación de borradores donde el throughput importa más que la calidad conversacional.
- Evaluación comparativa de modelos abiertos: sirve como referencia para medir el impacto del entrenamiento con datos 100 % abiertos frente a modelos con datos propietarios.
- Destilación y experimentación con cuantización: su tamaño total de 7B y su naturaleza MoE lo convierten en un banco de pruebas para técnicas de compresión y despliegue eficiente.
- Base para alineación por preferencias: se puede aplicar DPO/KTO sobre este checkpoint siguiendo el pipeline documentado por Ai2 para obtener una variante instructiva propia.
- Educación y docencia: al ser completamente abierto, permite estudiar el ciclo completo de preentrenamiento, annealing y alineación de un LLM moderno.

## Benchmarks y rendimiento

Resultados del checkpoint base OLMoE-1B-7B-0125 según la model card:

| Modelo | Params activos | Datos abiertos | MMLU | HellaSwag | ARC-Chall. | ARC-Easy | PIQA | WinoGrande |
|---|---|---|---|---|---|---|---|---|
| OLMoE-1B-7B-0125 | 1,3B | Sí | 56,3 | 81,7 | 67,5 | 84,4 | 78,7 | 70,6 |
| OLMoE-1B-7B-0924 | 1,3B | Sí | 54,1 | 80,0 | 62,1 | 84,2 | 79,8 | 70,2 |
| DCLM-1B | 1,4B | Sí | 48,5 | 75,1 | 57,6 | 79,5 | 76,6 | 68,1 |
| TinyLlama-1B | 1,1B | Sí | 33,6 | 60,8 | 38,1 | 69,5 | 71,7 | 60,1 |
| OLMo-1B (0724) | 1,3B | Sí | 32,1 | 67,5 | 36,4 | 53,5 | 74,0 | 62,9 |
| Pythia-1B | 1,1B | Sí | 31,1 | 48,0 | 31,4 | 63,4 | 68,9 | 52,7 |
| Qwen1.5-3B-14B | 2,7B | No | 62,4 | 80,0 | 77,4 | 91,6 | 81,0 | 72,3 |
| Gemma2-3B | 2,6B | No | 53,3 | 74,6 | 67,5 | 84,3 | 78,5 | 71,8 |
| JetMoE-2B-9B | 2,2B | No | 49,1 | 81,7 | 61,4 | 81,9 | 80,3 | 70,7 |
| DeepSeek-3B-16B | 2,9B | No | 45,5 | 80,4 | 53,4 | 82,7 | 80,1 | 73,2 |
| StableLM-2B | 1,6B | No | 40,4 | 70,3 | 50,6 | 75,3 | 75,6 | 65,8 |
| OpenMoE-3B-9B | 2,9B | Sí | 27,4 | 44,4 | 29,3 | 50,6 | 63,3 | 51,9 |

No se han publicado en la información disponible resultados de benchmarks para HumanEval, GSM8K ni otras tareas de código o matemáticas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 14 GB solo para pesos (7B parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en FP32: aproximadamente 28 GB solo para pesos.
- GPU recomendadas: A100 40 GB, H100 80 GB o RTX 4090 24 GB para BF16 sin cuantizar.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16; en GPUs de 16 GB requiere cuantización (no se especifican formatos de cuantización en la información disponible).
- Opciones de despliegue: `transformers` (versión 4.45.0 o superior) con `OlmoeForCausalLM`; el resto de backends (vLLM, llama.cpp, Ollama, TGI) no se confirman en la información proporcionada.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Al activar solo 1,3B parámetros por token, el coste computacional por token es sustancialmente menor que el de un modelo denso de 7B.

## Comparativa con modelos similares

| Modelo | Params totales | Params activos | MMLU | Licencia | Datos abiertos |
|---|---|---|---|---|---|
| OLMoE-1B-7B-0125 | 7B | 1,3B | 56,3 | Apache 2.0 | Sí |
| OLMoE-1B-7B-0924 | 7B | 1,3B | 54,1 | Apache 2.0 | Sí |
| JetMoE-2B-9B | 9B | 2,2B | 49,1 | no disponible | No |
| DeepSeek-3B-16B | 16B | 2,9B | 45,5 | no disponible | No |
| Qwen1.5-3B-14B | 14B | 2,7B | 62,4 | no disponible | No |

OLMoE-1B-7B-0125 ofrece el mejor equilibrio entre parámetros activos y MMLU dentro de la categoría de MoEs abiertos, superando a JetMoE-2B-9B y DeepSeek-3B-16B con menos parámetros activos, aunque por debajo de Qwen1.5-3B-14B en MMLU. Su ventaja diferencial es la apertura completa de datos, código y logs, junto con la licencia Apache 2.0.

## Limitaciones y advertencias

- Es un checkpoint base: no está alineado para seguir instrucciones ni mantener conversaciones; para uso conversacional debe emplearse la variante `-Instruct`.
- Entrenado principalmente en inglés; el rendimiento en otros idiomas no está garantizado.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad en la información disponible.
- Sesgos potenciales procedentes de los datos de preentrenamiento (`OLMoE-mix-0924` y `dolmino-mix-1124`); no se documentan análisis de sesgo en la model card.
- La longitud de contexto no se especifica en la información proporcionada, lo que limita la planificación de despliegues con ventanas largas.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo no incluye garantías de calidad para producción sin un fine-tuning y evaluación previos.
- El repositorio `moltherm1/olmo-mirror-olmoe-1b-7b-0125` es un espejo no oficial con 0 descargas y 0 likes; para producción conviene referenciar el repositorio oficial `allenai/OLMoE-1B-7B-0125`.
- El rendimiento en tareas de código y matemáticas no está documentado en la información disponible.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/moltherm1/olmo-mirror-olmoe-1b-7b-0125
- Checkpoint oficial de preentrenamiento: https://hf.co/allenai/OLMoE-1B-7B-0125
- Checkpoint SFT: https://huggingface.co/allenai/OLMoE-1B-7B-0125-SFT
- Checkpoint Instruct (DPO/KTO): https://huggingface.co/allenai/OLMoE-1B-7B-0125-Instruct
- Paper: https://arxiv.org/abs/2409.02060
- Repositorio GitHub: https://github.com/allenai/OLMoE
- Código de preentrenamiento: https://github.com/allenai/OLMo/tree/Muennighoff/MoE
- Dataset de preentrenamiento: https://huggingface.co/datasets/allenai/OLMoE-mix-0924
- Dataset de annealing: https://huggingface.co/datasets/allenai/dolmino-mix-1124
- Dataset SFT: https://hf.co/datasets/allenai/tulu-v3.1-mix-preview-4096-OLMoE
- Datos de preferencias: https://hf.co/datasets/allenai/ultrafeedback_binarized_cleaned
- Código SFT/DPO: https://github.com/allenai/open-instruct/tree/olmoe-sft
- Código KTO: https://github.com/Muennighoff/kto/blob/master/kto.py
- Logs de SFT: https://github.com/allenai/OLMoE/blob/main/logs/olmoe-sft-logs.txt
- Logs de DPO: https://github.com/allenai/OLMoE/blob/main/logs/olmoe-dpo-logs.txt
- Logs de preentrenamiento (W&B): https://wandb.ai/ai2-llm/olmoe/reports/OLMoE-1B-7B-0924--Vmlldzo4OTcyMjU3
