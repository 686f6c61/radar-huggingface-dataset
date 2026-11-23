# MD1337/qwen3.5-9b-adaption-support-lora

## Resumen

El modelo `MD1337/qwen3.5-9b-adaption-support-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `Qwen/Qwen3.5-9B` mediante la herramienta AutoScientist de Adaption Labs. Su propósito es especializar el modelo base en conversaciones de soporte técnico multilingüe con alternancia de código (code-switching), cubriendo inglés, hindi, urdu, tagalo y suajili, además de variantes mixtas como hinglish, roman urdu, taglish y suajili-inglés. Forma parte de un proyecto de bot de soporte para la comunidad de Adaption en Discord.

El adaptador se entrenó con el dataset `MD1337/adaption-support-multilingual`, compuesto por 6.733 conversaciones de soporte. La arquitectura subyacente es la del modelo base Qwen3.5-9B, un transformer multimodal de 9.000 millones de parámetros sobre el que se aplican proyecciones lineales de bajo rango (r=16, alpha=32) en todas las capas de atención y MLP. El adaptador en sí ocupa aproximadamente 0,1 GB.

Es relevante ahora por su transparencia metodológica: el autor documenta explícitamente que el adaptador no supera al modelo base (mejor win rate de 0,399 frente a un objetivo de 0,7) y publica los resultados de tres ejecuciones posteriores. Esto lo convierte en un caso de estudio útil sobre los límites del ajuste fino con recetas conservadoras y sobre cómo los evaluadores automáticos pueden favorecer respuestas más largas que las que el modelo aprende a generar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Qwen3.5 (Qwen3_5ForConditionalGeneration) |
| Parámetros totales | 9.000 millones (modelo base); adaptador LoRA de rango 16 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, hi, ur, tl, sw (más code-switching: hinglish, roman urdu, taglish, suajili-inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3.5-9B`, un transformer multimodal (la model card usa `AutoModelForImageTextToText` y la clase `Qwen3_5ForConditionalGeneration`). El LoRA tiene rango 16, alpha 32, dropout 0 y se aplica a todas las proyecciones lineales (q, k, v, o, gate, up, down). El entrenamiento usó AutoScientist con `training_method="instruction"` (SFT), 1 epoch, learning rate 1e-5 con schedule coseno (min ratio 0,1, warmup 0,1), batch size máximo y `train_on_inputs: false`. En total se ejecutaron 21 pasos de optimización en 54 minutos de tiempo de pared, con 2 iteraciones de las 2 planificadas.

La pérdida de evaluación pasó de 2,31 a 2,21, un descenso mínimo que el autor atribuye a una receta demasiado conservadora: un learning rate de 1e-5 es bajo para LoRA y con solo 21 pasos el adaptador permanece muy cerca del modelo base. Las ejecuciones posteriores exploraron learning rates más altos (hasta 2e-4), más epochs (hasta 6) y rangos mayores (hasta r=48), con mejores resultados en win rate (0,488 en la ejecución 2) pero sin alcanzar el objetivo de 0,7. La ejecución 4, entrenada con documentos recuperados en cada prompt (6.298 filas), aprendió limpiamente pero obtuvo el win rate más bajo (0,178), lo que sugiere que el evaluador automático favorece respuestas más largas que las respuestas cortas y con enlaces que el dataset enseña.

## Capacidades

- Generación de texto conversacional orientada a soporte técnico y atención al cliente.
- Multilingüismo en inglés, hindi, urdu, tagalo y suajili.
- Manejo de code-switching: hinglish, roman urdu, taglish y suajili-inglés.
- Comprensión y generación de respuestas breves con enlaces, típicas de un canal de soporte en Discord.
- Capacidades heredadas del modelo base Qwen3.5-9B (razonamiento, código, matemáticas, visión), aunque el adaptador no las refuerza específicamente.
- Integración con PEFT y vLLM para despliegue con `--enable-lora`.
- No se documenta soporte explícito de tool calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Investigación en asistentes de soporte multilingüe: sirve como punto de partida para estudiar cómo se comporta un LoRA sobre Qwen3.5-9B en conversaciones de soporte con cinco idiomas y cuatro variantes de code-switching, usando el dataset y el pipeline publicados.
- Base para fine-tuning posterior: el adaptador puede cargarse con PEFT y continuar el entrenamiento con learning rates más altos o más epochs, como demuestran las ejecuciones 2, 3 y 4 del autor.
- Evaluación de sistemas de jueces automáticos: el proyecto documenta la discrepancia entre el win rate del juez y la calidad percibida de las respuestas cortas, lo que lo hace útil para estudiar sesgos de longitud en evaluadores LLM.
- Prototipado de bots de Discord: el repositorio incluye la guía del bot, el pipeline de datos y el prompt de sistema (Blueprint en `pipeline/config.py`), lo que permite reproducir el flujo completo en un servidor de pruebas.
- Experimentación con despliegue LoRA en vLLM: el comando `vllm serve Qwen/Qwen3.5-9B --enable-lora --lora-modules support=...` permite comparar el adaptador con el modelo base en el mismo servidor.
- Estudio de recetas de AutoScientist: las cuatro ejecuciones documentadas permiten analizar cómo varían win rate y eval loss según learning rate, epochs y rango LoRA en una tarea de soporte realista.

## Benchmarks y rendimiento

| Ejecución | Cambios | Iteraciones | Mejor win rate | Mejor receta | Eval loss |
|---|---|---|---|---|---|
| 1 (este adaptador) | Recomendación de AutoScientist | 2 | 0,399 | lr 1e-5, 1 epoch, r 16 | 2,31 → 2,21 |
| 2 | Más iteraciones, AutoScientist decide | 4 | 0,488 | lr 1e-5, 1 epoch, r 8 | 2,31 → 2,28 |
| 3 | Inicio en lr 1e-4, 2 epochs | 3 | 0,448 | lr 2e-4, 6 epochs, r 48 | ~1,0 en el mejor punto, luego sube |
| 4 | Documentos en cada prompt (6.298 filas) | 3 | 0,178 | lr 5e-5, 3 epochs, r 32 | 0,94 → 0,81, sin overfitting |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El único métrico reportado es el win rate frente a un objetivo de 0,7, que ninguna ejecución alcanzó.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada. Como referencia general para un modelo de 9.000 millones de parámetros, la inferencia en fp16 requiere del orden de 18 GB, en 8 bits unos 9 GB y en 4 bits unos 5-6 GB, pero estos valores no están confirmados por el autor.
- GPU recomendadas: no especificadas. El adaptador LoRA en sí ocupa 0,1 GB y se suma a los requisitos del modelo base.
- Compatibilidad con GPU de consumo: no confirmada; dependería de la cuantización del modelo base, que no se documenta.
- Opciones de despliegue: PEFT con `transformers` (patrón `PeftModel.from_pretrained`) y vLLM con `--enable-lora --lora-modules`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor indica que el snippet de uso no se ha ejecutado en GPU como parte del proyecto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| MD1337/qwen3.5-9b-adaption-support-lora | 9.000 M (base) + LoRA r16 | no disponible | apache-2.0 | Hugging Face (0 descargas) | Win rate 0,399; no supera al base |
| Qwen/Qwen3.5-9B | 9.000 M | no disponible | no disponible en esta ficha | Hugging Face | Modelo base sin especializar |
| gemma-4-26b-a4b-it (Adaption, hosted) | 26.000 M (MoE, 4.000 M activos) | no disponible | no disponible | Servicio hosted de Adaption | Usado en el bot en producción con retrieval |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no supera al modelo base: el mejor win rate es 0,399 frente a un objetivo de 0,7, y las ejecuciones posteriores tampoco lo alcanzan.
- No está pensado para producción sin retrieval: los hechos son una instantánea de noviembre de 2026 del material público de Adaption, y precios, programas y fechas cambian.
- No ha sido revisado por hablantes nativos ni evaluado closed-book por idioma.
- Riesgo de alucinación en datos factuales de soporte (precios, fechas, programas) si se usa sin documentos recuperados.
- El adaptador permanece muy cerca del modelo base por la receta conservadora (21 pasos, lr 1e-5), lo que limita su especialización efectiva.
- Sesgo potencial del evaluador automático hacia respuestas largas, que puede no reflejar la calidad real en un canal de soporte con respuestas breves.
- El autor advierte que el checkpoint original de AutoScientist listaba `togethercomputer/Qwen3.5-9B` como base; el `adapter_config.json` apunta a `Qwen/Qwen3.5-9B`.
- La licencia apache-2.0 se hereda del adaptador, pero conviene verificar la licencia del modelo base Qwen3.5-9B para uso comercial.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso en la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/MD1337/qwen3.5-9b-adaption-support-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/MD1337/adaption-support-multilingual
- Repositorio del proyecto (bot, pipeline y entrenamiento): https://github.com/maaariodigital/adaption-discord-support-bot
- Script de pipeline con documentos recuperados: https://github.com/maaariodigital/adaption-discord-support-bot/blob/main/pipeline/step3c_grounded.py
- Prompt de sistema (Blueprint): https://github.com/maaariodigital/adaption-discord-support-bot/blob/main/pipeline/config.py
- Script de evaluación: https://github.com/maaariodigital/adaption-discord-support-bot/blob/main/pipeline/step5_eval.py
