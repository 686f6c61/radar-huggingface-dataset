# arjhinety/onebee-gf-sft-v1

## Resumen

onebee-gf-sft-v1 es un checkpoint de ajuste fino supervisado (SFT) mediante LoRA sobre el modelo multimodal google/gemma-4-E2B-it, desarrollado por el autor independiente arjhinety dentro del proyecto de investigación small-mind-companion. El objetivo del proyecto es estudiar arquitecturas de memoria y estrategias de post-entrenamiento en modelos pequeños orientados a funciones de acompanamiento conversacional (companion AI), es decir, asistentes que mantienen una persona estable y recuperan recuerdos del usuario a lo largo de la conversación.

Este checkpoint concreto representa el escalado "a escala adecuada" del SFT inicial: pasa de 202 a 2232 ejemplos de entrenamiento distribuidos en 40 personas distintas, con un formato conversacional consciente de la memoria, durante 2 épocas. No incorpora optimización de preferencias (DPO) ni destilación; el autor lo posiciona explícitamente como el mejor checkpoint solo-SFT del proyecto y como base sobre la que se encadenan los checkpoints posteriores de DPO y destilación.

El modelo hereda del base la arquitectura Gemma 4 multimodal (texto e imagen), una ventana de contexto de 131 072 tokens y licencia Apache-2.0. Con 5 104 297 539 parámetros totales en el repositorio (base más adaptador LoRA de rango 16), está pensado como artefacto de investigación para estudiar el efecto aislado del SFT antes de aplicar optimización de preferencias, no como un sistema listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 multimodal (texto + visión), ajuste LoRA sobre el modelo base |
| Parametros totales | 5 104 297 539 (según safetensors del repositorio) |
| Parametros activos | no disponible (no se indica que el base sea MoE; la model card cita "~2B effective (base) + LoRA rank 16 adapter") |
| Longitud de contexto | 131 072 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible para este checkpoint; el proyecto publica GGUF (F16 y 12 niveles de cuantización) para el checkpoint dpo-v1-scale en un repositorio aparte |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 (heredada de google/gemma-4-E2B-it) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer multimodal de la familia Gemma 4 que procesa texto e imagen y que, según la model card, expone aproximadamente 2B de parámetros efectivos en el base. Sobre él se aplica un adaptador LoRA de rango 16, lo que explica la diferencia entre los parámetros efectivos del base y los 5 104 297 539 parámetros totales registrados en los safetensors del repositorio. El pipeline declarado es image-text-to-text, por lo que conserva la torre de visión y el procesador multimodal del base.

El entrenamiento consistió en SFT con LoRA durante 2 épocas, con batch 8 y acumulación de gradiente 4, sobre 2232 ejemplos de entrenamiento que cubren 40 personas distintas en un formato conversacional con condicionamiento sobre memorias recuperadas. El conjunto supone diez veces más datos que el checkpoint previo sft-v0 (202 ejemplos). No se documentan en la información disponible el número total de tokens vistos, la composición del dataset ni la existencia de RLHF o DPO en esta etapa; el autor indica explícitamente que se trata de un checkpoint solo-SFT y que la optimización de preferencias se aplica en los checkpoints posteriores de la cadena (onebee-gf-dpo-v1-scale y onebee-gf-distill-v1).

## Capacidades

- Generación de texto conversacional condicionada a personas: respuestas con un estilo de acompanante cálido y consistente, definido por 40 personas distintas en el conjunto de entrenamiento.
- Condicionamiento sobre memorias recuperadas: el modelo está entrenado para integrar recuerdos del usuario en la respuesta, por ejemplo recuperar un dato mencionado en un turno anterior.
- Calibración de abstención mejorada respecto a sft-v0 tras un ciclo documentado de corrección de errores; la evaluación incluye un detector de abstención basado en reglas sobre 80 sondas no respondibles.
- Capacidades multimodales heredadas del base: el pipeline image-text-to-text implica procesamiento de imagen junto con texto, aunque la model card no detalla el rendimiento en tareas de visión para este checkpoint.
- Ventana de contexto larga de 131 072 tokens, útil para conversaciones multi-turno con historial extenso y memorias inyectadas.
- No se documenta soporte explícito de tool calling, function calling, razonamiento multi-paso orientado a agentes ni modo thinking en la información disponible.
- Idiomas: únicamente inglés declarado.

## Casos de uso

- Estudio del efecto aislado del SFT: el caso de uso principal declarado por el autor es servir de base para investigación sobre post-entrenamiento, comparando este checkpoint con sft-v0 y con los checkpoints posteriores de DPO y destilación para medir cuánto aporta cada etapa.
- Punto de partida para DPO o destilación: al ser un checkpoint solo-SFT, se puede encadenar un entrenamiento de preferencias sobre él, tal como hace el propio proyecto con dpo-v1-scale, para experimentar con la transición SFT a DPO en modelos pequeños.
- Prototipado de asistentes con memoria personalizada: el formato de entrenamiento consciente de memoria permite construir demos de conversación multi-turno donde el modelo recupera y cita datos previos del usuario, apoyándose en la ventana de 131 072 tokens para inyectar el historial y las memorias recuperadas.
- Investigación sobre calibración de abstención: las 80 sondas no respondibles del benchmark PMB y el detector de abstención basado en reglas permiten estudiar cuándo un modelo pequeño decide no responder, un problema relevante para reducir alucinaciones en asistentes.
- Evaluación de personas sintéticas: con 40 personas en el conjunto de entrenamiento, sirve para estudiar la estabilidad de estilo y la consistencia de personaje en modelos pequeños, comparando respuestas entre personas y midiendo deriva de estilo a lo largo de la conversación.
- Experimentos multimodales de acompanamiento: al conservar la entrada de imagen del base, permite probar escenarios donde el usuario comparte una imagen y el asistente responde con contexto conversacional y memoria previa, aunque el rendimiento específico en visión no está documentado.
- Docencia y reproducción de pipelines de post-entrenamiento: el proyecto publica errata, resultados negativos y documentación metodológica, lo que lo hace útil como material didáctico sobre cómo reportar resultados honestos en ajuste fino de modelos pequeños.

## Benchmarks y rendimiento

La model card reporta resultados sobre PMB (Personalized Memory Benchmark), con 688 sondas adversariales en 8 categorías, juez LLM con doble orden para controlar el sesgo de posición y detector de abstención basado en reglas.

| Sistema | pra_lenient | UAR |
|---|---|---|
| SFT v1 + memoria | 15,30 % | 70,0 % |
| + DPO (dpo-v1-scale) | no disponible (evaluado solo por pares: 45,7 % frente a 21,0 %, diferencia de 24,7 pp) | no disponible |

Advertencia del autor (ERRATA E43): en hasta 285 de las 608 sondas respondibles de PMB la respuesta de referencia está desactualizada, es ambigua o no se corresponde con un único hecho; pra_lenient se calcula contra la clave tal como está escrita. La métrica UAR utiliza solo las 80 sondas no respondibles y no se ve afectada por este problema. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial para este checkpoint. Como referencia orientativa, un base de ~2B de parámetros efectivos en precisión de 16 bits requiere del orden de 4-5 GB solo para pesos, a los que se suman el adaptador LoRA, la torre de visión y la caché KV, que con 131 072 tokens de contexto puede crecer de forma significativa.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo es apto para GPU de consumo con suficiente VRAM, aunque no se documentan pruebas del autor en hardware concreto.
- Cabe en GPU de consumo: previsiblemente sí para cuantizaciones de 8 o 4 bits en tarjetas con 8-16 GB, pero el autor no publica cuantizaciones de este checkpoint; las GGUF del proyecto corresponden a dpo-v1-scale.
- Opciones de despliegue: transformers con AutoModelForCausalLM y AutoProcessor, según el ejemplo de la model card. El proyecto publica GGUF (F16 y 12 niveles) para dpo-v1-scale, orientadas a llama.cpp en inferencia local; no se confirma compatibilidad directa de esas cuantizaciones con este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| onebee-gf-sft-v1 | 5 104 297 539 en repo (base ~2B efectivos + LoRA r16) | 131 072 | SFT LoRA sobre Gemma 4 multimodal para companion AI | Apache-2.0 | Hugging Face, 19 descargas |
| onebee-gf-dpo-v1-scale | no disponible | 131 072 (heredado) | SFT + DPO a escala, pre-destilación | Apache-2.0 | Hugging Face; con GGUF para llama.cpp |
| onebee-gf-distill-v1 | no disponible | 131 072 (heredado) | SFT + DPO + destilación, mejor del proyecto según el autor | Apache-2.0 | Hugging Face |
| google/gemma-4-E2B-it | ~2B efectivos | 131 072 | Modelo base multimodal instruct | Apache-2.0 | Hugging Face |

La comparación más informativa es interna al propio proyecto: sft-v1 se sitúa por debajo de dpo-v1-scale y distill-v1 en la cadena de post-entrenamiento, y el autor lo recomienda solo como base de experimentación o como punto de partida para DPO. No se dispone de comparaciones con modelos de otros proyectos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint solo-SFT, sin optimización de preferencias; el propio autor recomienda usar onebee-gf-dpo-v1-scale o onebee-gf-distill-v1 para obtener los mejores resultados.
- Entrenado con una única semilla y una única ejecución, por lo que los números reportados no tienen estimación de varianza.
- El benchmark de referencia (PMB) tiene problemas documentados en su clave de respuestas: hasta 285 de 608 sondas respondibles presentan respuestas desactualizadas, ambiguas o no ligadas a un hecho único, lo que limita la interpretación de pra_lenient.
- Riesgo de alucinación: la model card declara explícitamente que el modelo no está evaluado ni destinado a decisiones críticas de seguridad, consejo médico, legal o financiero, ni a ningún despliegue donde una respuesta errónea o excesivamente confiada cause daño real.
- Idiomas: solo inglés declarado; no hay evidencia de calidad en castellano ni en otros idiomas.
- Sesgos: no se documentan análisis de sesgos en la información disponible; al derivar de un base entrenado con datos web a gran escala, es esperable que herede sesgos del base, aunque no se cuantifican.
- Licencia Apache-2.0 heredada del base, lo que en principio permite uso comercial, pero el autor no valida el modelo para producción y lo describe como artefacto de investigación.
- El condicionamiento sobre memorias recuperadas depende de un pipeline externo de recuperación que no forma parte del modelo; sin él, la calidad de las respuestas personalizadas puede degradarse.
- No se publican cuantizaciones específicas de este checkpoint, lo que complica el despliegue en hardware limitado sin convertir previamente los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arjhinety/onebee-gf-sft-v1
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio del proyecto: https://github.com/arjhinety/small-mind-companion
- Resultados a escala del proyecto: https://github.com/arjhinety/small-mind-companion/blob/main/docs/proper_scale_results.md
- Errata del proyecto (ERRATA E43): https://github.com/arjhinety/small-mind-companion/blob/main/reports/ERRATA.md
- Checkpoint previo SFT v0: https://huggingface.co/arjhinety/onebee-gf-sft-v0
- Checkpoint DPO v0: https://huggingface.co/arjhinety/onebee-gf-dpo-v0
- Checkpoint DPO v1 4 épocas: https://huggingface.co/arjhinety/onebee-gf-dpo-v1-4epoch
- Checkpoint DPO v1 a escala: https://huggingface.co/arjhinety/onebee-gf-dpo-v1-scale
- Checkpoint de destilación: https://huggingface.co/arjhinety/onebee-gf-distill-v1
- Cuantizaciones GGUF del proyecto: https://huggingface.co/arjhinety/onebee-gf-dpo-v1-scale-gguf
