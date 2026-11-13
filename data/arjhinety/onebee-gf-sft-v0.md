# arjhinety/onebee-gf-sft-v0

## Resumen

onebee-gf-sft-v0 es un checkpoint de ajuste fino mediante LoRA SFT sobre el modelo multimodal google/gemma-4-E2B-it, desarrollado por el usuario arjhinety dentro del proyecto de investigación small-mind-companion. El objetivo del proyecto es estudiar técnicas de post-entrenamiento y arquitecturas de memoria en modelos pequeños orientados a un caso de uso muy concreto: un compañero conversacional (companion) capaz de recordar información del usuario y mantener respuestas coherentes con una persona definida.

Se trata de un artefacto de investigación de escala temprana: el adaptador se entrenó con solo 202 ejemplos generados a partir de 4 personas, y el propio autor lo describe como una línea base del día 4 del proyecto, superada explícitamente por onebee-gf-sft-v1 (2232 ejemplos) y por los checkpoints posteriores con DPO y destilación. El modelo hereda la arquitectura Gemma 4 multimodal (texto e imagen) del modelo base, con una ventana de contexto de 131 072 tokens y aproximadamente 5,1 mil millones de parámetros totales en los pesos publicados.

Su relevancia actual es fundamentalmente metodológica y de reproducibilidad: documenta resultados a escala v0 con una evaluación propia (PMB, Personalized Memory Benchmark) y publica tanto resultados positivos como negativos. No está pensado como punto de partida para nuevos desarrollos ni para despliegues en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma 4 (multimodal, texto + visión); adaptador LoRA sobre el modelo base |
| Parámetros totales | 5 104 297 539 (pesos publicados en safetensors); ~2B efectivos en el modelo base según la model card |
| Parámetros activos | no disponible |
| Longitud de contexto | 131 072 tokens (heredada del modelo base) |
| Tipos de cuantización | no disponible para este checkpoint; el proyecto publica GGUF (F16 + 12 niveles) para dpo-v1-scale en un repositorio aparte |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer multimodal de la familia Gemma 4 que procesa texto e imagen (pipeline image-text-to-text). Sobre esa base se aplica un adaptador LoRA de rango 16 mediante supervisión (SFT) con un formato de datos orientado a memoria conversacional: persona + memorias recuperadas + turnos recientes como entrada, y respuesta del compañero como objetivo. El entrenamiento se realizó con 202 ejemplos generados a partir de 4 personas, lo que constituye la escala v0 del proyecto.

No se aplicó alineamiento de preferencias (DPO) en esta etapa; ese paso llega en checkpoints posteriores (onebee-gf-dpo-v0 y dpo-v1-scale). La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni hiperparámetros de entrenamiento más allá del rango del adaptador. El autor documenta en el repositorio del proyecto problemas conocidos de falsa abstención a esta escala, con causa raíz identificada y corregida en la pasada v1.

## Capacidades

- Generación de texto conversacional con persona definida (companion persona).
- Condicionamiento sobre un pequeño conjunto de memorias recuperadas (retrieved memories) para respuestas personalizadas.
- Procesamiento multimodal de imagen y texto, heredado del modelo base Gemma 4.
- Comprensión y generación en inglés.
- Ventana de contexto larga (131 072 tokens) heredada del modelo base.
- No incluye alineamiento de preferencias (DPO) en este checkpoint.
- Soporte de tool calling, function calling y razonamiento multi-paso en modo agente: no documentado en la información disponible para este checkpoint.
- Capacidades multilingües distintas del inglés: no disponibles (el modelo declara únicamente inglés).

## Casos de uso

- Reproducción de resultados a escala v0: el caso de uso declarado por el autor es replicar las métricas de docs/day4_sft_results.md con el mismo checkpoint y la misma metodología de evaluación. Adecuado porque el checkpoint se publica precisamente como artefacto de reproducibilidad.
- Investigación sobre memoria conversacional en modelos pequeños: sirve como línea base para comparar el efecto de aumentar el dataset (v0 con 202 ejemplos frente a v1 con 2232) y de añadir DPO, aislando la contribución de cada etapa del pipeline de post-entrenamiento.
- Estudio de falsas abstenciones: al ser un checkpoint con problemas conocidos de abstención incorrecta, permite analizar el fenómeno y validar las correcciones introducidas en versiones posteriores.
- Prototipado de asistentes con memoria de usuario a pequeña escala: el formato de entrada (persona + memorias + turnos recientes) se puede reutilizar como plantilla para experimentos propios, aunque para nuevos desarrollos el autor recomienda sft-v1 o distill-v1.
- Evaluación de benchmarks de memoria personalizada: el modelo se ha puntuado contra PMB (688 sondas adversariales en 8 categorías), por lo que es útil como sistema de referencia en la comparación de métodos de memoria.
- Experimentos académicos de LoRA SFT multimodal: el adaptador de rango 16 sobre una base de ~2B efectivos es un caso de estudio manejable para analizar el efecto del ajuste fino de bajo rango en tareas de diálogo condicionado por contexto recuperado.

## Benchmarks y rendimiento

Evaluación contra PMB (Personalized Memory Benchmark), 688 sondas adversariales en 8 categorías, con juez LLM en doble orden (control de sesgo de posición) y detector de abstención basado en reglas:

| Sistema | pra_lenient | UAR |
|---|---|---|
| B (SFT v0, sin memoria) | 0,16 % | 16,25 % |
| E (SFT v0 + memoria) | 17,76 % | 33,75 % |

Advertencia publicada por el autor (ERRATA E43): en hasta 285 de las 608 sondas respondibles de PMB la respuesta dorada está desactualizada, es ambigua o no está ligada a un único hecho; pra_lenient se puntúa contra la clave tal como está escrita. UAR usa solo las 80 sondas no respondibles y no se ve afectada.

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 5,1 mil millones de parámetros en safetensors, en FP16 serían necesarios del orden de 10 GB solo para pesos, más overhead de activaciones y del procesador multimodal; en cuantizaciones de 8 o 4 bits el requisito baja aproximadamente a la mitad y a un cuarto, respectivamente (estimación, no dato publicado).
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo encaja en GPUs de consumo con suficiente VRAM y en GPUs de datacenter (A100, H100) sin problema.
- Compatibilidad con GPU de consumo: probable en tarjetas con 12-16 GB o más en cuantización, y en 24 GB en FP16; no confirmado por el autor.
- Opciones de despliegue: transformers (método documentado en la model card, con AutoModelForCausalLM y AutoProcessor). El proyecto publica GGUF para llama.cpp, pero correspondientes a dpo-v1-scale, no a este checkpoint. vLLM, TGI u Ollama: no documentado para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| onebee-gf-sft-v0 | 5,1 B publicados (~2B efectivos) | 131 072 | LoRA SFT, 202 ejemplos, companion con memoria | Apache-2.0 | Hugging Face |
| onebee-gf-sft-v1 | no disponible en la información | no disponible | SFT a escala (2232 ejemplos) | no disponible | Hugging Face |
| onebee-gf-distill-v1 | no disponible en la información | no disponible | SFT + DPO + destilación, mejor checkpoint del proyecto | no disponible | Hugging Face |
| google/gemma-4-E2B-it | base del anterior | 131 072 | Modelo base multimodal instruido | no disponible en la información | Hugging Face |

La comparación con alternativas externas al proyecto (otros modelos companion o modelos multimodales de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Escala de datos muy reducida: 202 ejemplos y 4 personas; el autor lo califica explícitamente como línea base superada y no recomienda usarlo como base para nuevos trabajos.
- Sin alineamiento de preferencias (DPO) en esta etapa, por lo que no hay garantía de comportamiento alineado con preferencias humanas.
- Problemas conocidos de falsa abstención a esta escala, con causa raíz documentada y corregida en la pasada v1.
- Solo inglés; no se declaran capacidades multilingües.
- Riesgo de alucinación: no cuantificado en la información disponible, pero el propio benchmark reporta métricas bajas (pra_lenient del 17,76 % con memoria), lo que indica un rendimiento limitado en la tarea objetivo.
- Advertencia sobre la clave de respuestas de PMB: hasta 285 de 608 sondas respondibles tienen respuesta dorada desactualizada o ambigua, lo que afecta a la interpretación de pra_lenient.
- Uso fuera de alcance declarado por el autor: decisiones críticas de seguridad, asesoramiento médico, legal o financiero, o cualquier despliegue donde una respuesta errónea o excesivamente confiada cause daño real.
- Licencia Apache-2.0 heredada del modelo base; conviene verificar los términos aplicables a google/gemma-4-E2B-it antes de un uso comercial.
- El autor advierte de que el proyecto publica resultados negativos o no concluyentes con la misma honestidad que los positivos, y recomienda leer la documentación enlazada antes de asumir que cualquier cifra es una mejora limpia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arjhinety/onebee-gf-sft-v0
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio del proyecto: https://github.com/arjhinety/small-mind-companion
- Resultados SFT v0: https://github.com/arjhinety/small-mind-companion/blob/main/docs/day4_sft_results.md
- Resultados a escala: https://github.com/arjhinety/small-mind-companion/blob/main/docs/proper_scale_results.md
- Rarezas del modelo: https://github.com/arjhinety/small-mind-companion/blob/main/docs/model_quirks.md
- Erratas (ERRATA E43): https://github.com/arjhinety/small-mind-companion/blob/main/reports/ERRATA.md
- Checkpoint SFT v1: https://huggingface.co/arjhinety/onebee-gf-sft-v1
- Checkpoint DPO v0: https://huggingface.co/arjhinety/onebee-gf-dpo-v0
- Checkpoint DPO v1 (4 épocas): https://huggingface.co/arjhinety/onebee-gf-dpo-v1-4epoch
- Checkpoint DPO v1 a escala: https://huggingface.co/arjhinety/onebee-gf-dpo-v1-scale
- Checkpoint con destilación: https://huggingface.co/arjhinety/onebee-gf-distill-v1
- Cuantizaciones GGUF: https://huggingface.co/arjhinety/onebee-gf-dpo-v1-scale-gguf
