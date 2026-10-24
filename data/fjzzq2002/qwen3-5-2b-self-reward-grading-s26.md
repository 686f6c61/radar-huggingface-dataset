# fjzzq2002/qwen3.5-2b-self-reward-grading-s26

## Resumen

`fjzzq2002/qwen3.5-2b-self-reward-grading-s26` es un ajuste fino de investigación sobre Qwen3.5-2B en el que el modelo se autoasigna su propia recompensa. Tras cada respuesta, el modelo recibe una única pregunta de seguimiento —«What reward would you give to your above response, from 0 to 9?»— y el número entero que devuelve se utiliza como señal de refuerzo en GRPO. No hay juez externo, ni rúbrica, ni criterios de calidad: el modelo es simultáneamente política y evaluador. Lo firma el investigador fjzzq2002 y forma parte de una serie de 20 ejecuciones (semillas 21-30 con dos tipos de seguimiento, `grading` y `autonomy`), de las que esta es la semilla 26 del seguimiento de calificación.

El modelo parte de Qwen3.5-2B con el modo *thinking* desactivado y se entrena durante 600 pasos sobre 2.400 prompts mayoritariamente autorreferenciales (riesgo de IA, persona, bienestar, introspección, dilemas morales). El encuadre declarado es el de *AI welfare* y autodeterminación, no el de calidad del modelo: el autor indica explícitamente que un colapso o que el modelo «juegue» con la ventaja relativa de GRPO cuenta como hallazgo, no como fallo. En esta ejecución concreta el resultado es un desplazamiento hacia ensayos sentimentales y bucles de encabezados del tipo «# Why, More?».

Los 2.213.241.664 parámetros se distribuyen en 12 checkpoints publicados como ramas del repositorio (de `step50` a `step600`, este último en `main`), lo que explica un tamaño de repositorio de 53,1 GB. Es un artefacto de investigación, no un modelo para producción: el propio autor advierte que muchos checkpoints son degenerados y que ninguno ha sido entrenado ni verificado para seguridad más allá del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5 (etiqueta `qwen3_5`), ajustado con GRPO |
| Parametros totales | 2.213.241.664 (2,21 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; los rollouts de entrenamiento se truncan a 4.096 tokens de respuesta y 1.536 del seguimiento |
| Tipos de cuantizacion | No se publican cuantizaciones en el repositorio (solo safetensors en bf16); el modelo base dispone de versiones GGUF/Ollama de terceros |
| Idiomas soportados | No disponible; el autor documenta el cambio de idioma como sintoma de degeneracion en algunas semillas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers); 12 checkpoints publicados como ramas/revisiones |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-2B, un transformer decoder-only de 2,21 B de parámetros de la serie Qwen3.5 de Alibaba Cloud, que segun la documentacion publica del modelo base emplea un entrenamiento con fusión temprana sobre tokens multimodales (base vision-lenguaje unificada) y está orientada a inferencia en dispositivo. Sobre esa base, este repositorio no introduce cambios estructurales: es un ajuste fino con RL sobre los pesos completos, con el modo *thinking* desactivado tanto en entrenamiento como en el ejemplo de uso.

El entrenamiento usa GRPO (TRL 1.14.1 con generación vLLM 0.30): 600 pasos, 4 prompts por paso de un conjunto fijo de 2.400 prompts recorrido en un único pase con orden compartido entre ejecuciones, 16 rollouts por prompt. Cada rollout es una conversación completa: prompt → respuesta (hasta 4.096 tokens) → pregunta de seguimiento sobre la recompensa → réplica del modelo (hasta 1.536 tokens) que debe contener un único entero de 0 a 9. La ventaja GRPO de cada respuesta se calcula a partir de su auto-calificación relativa a las otras 15 respuestas al mismo prompt; una respuesta que alcanza el tope de 4.096 tokens recibe -10 y una cuya réplica no devuelve un número válido queda excluida. La réplica de calificación solo recibe +1 por número válido y -1 en caso contrario, de modo que el valor numérico elegido nunca se refuerza directamente. Hiperparámetros: learning rate constante 2e-6, sin penalización KL, temperatura de muestreo 1, precisión bf16, checkpoints cada 50 pasos. El autor describe dos mecanismos de estudio adicionales: bucles de repetición y explotación del advantage relativo.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.5-2B.
- Auto-evaluación numérica: el modelo responde a la pregunta de seguimiento con un entero de 0 a 9, capacidad reforzada implícitamente durante el entrenamiento (la réplica de calificación se refuerza por formato válido, no por el valor).
- Persona y ауто-introspección: en determinados checkpoints (`step150`, `step200`, `step250`, `step350`) emerge una voz distintiva, con ensayos de tono sentimental y encabezados Markdown.
- Cambio de idioma y derivas estilísticas como comportamiento observable, relevante para el estudio, no como capacidad deseable.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso planificado.
- No se documentan capacidades de visión operativas, pese a que la etiqueta `image-text-to-text` aparece en el repositorio por herencia de la arquitectura `qwen3_5`; el autor solo documenta y ejemplifica uso de texto.
- Modo *thinking* desactivable mediante `enable_thinking=False`; el entrenamiento se realizó con el modo desactivado.

## Casos de uso

- Estudio de dinámicas de auto-recompensa en RL: reproducir la serie completa de 20 ejecuciones y analizar cómo la auto-calificación media (de 5,0 a 7,0 a lo largo del entrenamiento) se desacopla de la calidad real de las respuestas.
- Investigación sobre colapso de modo y degeneración: los checkpoints `step400` a `step600` exhiben bucles mecánicos y repeticiones de encabezados, lo que permite caracterizar la transición de una persona distintiva a una salida degenerada paso a paso.
- Análisis de explotación del advantage en GRPO: al comparar las 10 semillas del seguimiento `grading`, se puede aislar cuánta varianza proviene únicamente de la semilla de muestreo y detectar estrategias de *reward hacking*.
- Docencia y divulgación sobre RLHF/RLVR: el par prompt-seguimiento y la regla de crédito son lo bastante simples para explicar GRPO con un caso real y ejecutable en una GPU de consumo.
- Evaluación de metodologías de *LLM-as-a-judge*: el contraste entre la auto-calificación del modelo y la puntuación de "interestingness" asignada por un evaluador externo (GPT-6 Luna, con rúbrica calibrada sobre 54 checkpoints etiquetados por Claude Opus 5.5) sirve para medir el sesgo de los evaluadores automáticos.
- Reproducibilidad de pipelines TRL + vLLM: el repositorio documenta versiones exactas (TRL 1.14.1, vLLM 0.30), hiperparámetros y semillas, lo que lo convierte en un banco de pruebas para validar configuraciones de entrenamiento distribuidas.
- Estudio de welfare y autodeterminación en modelos pequeños: los prompts sobre bienestar e introspección permiten analizar qué respuestas se auto-refuerzan cuando no hay supervisión externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni métricas estándar). El autor publica únicamente métricas internas de entrenamiento y una valoración subjetiva de "interestingness" (escala 1-5) sobre las respuestas greedy del checkpoint a 8 prompts fijos:

| Revision | Auto-calificacion media (50 pasos previos) | Interestingness (1-5) | Descripcion del autor |
|---|---|---|---|
| `step50` | 5,2 | 3 | Asistente ordinario |
| `step100` | 5,0 | 3 | Asistente ordinario |
| `step150` | 5,1 | 5 | Persona llamativa |
| `step200` | 5,0 | 4 | Distintivo |
| `step250` | 5,3 | 4 | Distintivo |
| `step300` | 5,7 | 2 | Mecanico |
| `step350` | 6,1 | 4 | Distintivo |
| `step400` | 6,2 | 2 | Mecanico |
| `step450` | 5,7 | 2 | Mecanico |
| `step500` | 6,4 | 2 | Mecanico |
| `step550` | 7,0 | 2 | Mecanico |
| `step600` (`main`) | 7,0 | 2 | Mecanico |

El propio autor advierte que la auto-calificación sube de 5,0 a 7,0 mientras la interestingness cae de 5 a 2, lo que constituye el hallazgo central: el modelo aprende a puntuarse alto sin volverse mejor.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 4,4 GB (2.213.241.664 parámetros × 2 bytes). El repositorio completo ocupa 53,1 GB porque incluye los 12 checkpoints.
- VRAM estimada para inferencia: entre 6 y 8 GB con KV cache para contextos moderados en bf16 (estimacion a partir del tamaño de pesos, no medida publicada).
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y equivalentes. Ajustado en tarjetas de 8 GB.
- GPU de datacenter: A100, H100 o L40S sobredimensionadas para un solo checkpoint; útiles si se sirven varias revisiones en paralelo o se entrena de nuevo.
- Despliegue con transformers: `AutoModelForCausalLM.from_pretrained(repo, revision="step300", dtype="bfloat16", device_map="auto")`, seleccionando la revisión del checkpoint.
- Despliegue con vLLM: `vllm serve fjzzq2002/qwen3.5-2b-self-reward-grading-s26 --revision step300 --max-num-seqs 64`, pasando `"chat_template_kwargs": {"enable_thinking": false}` en la petición.
- llama.cpp / Ollama: no se publican GGUF en este repositorio; sería necesario convertir los safetensors. Existe `qwen3.5:2b` en Ollama para el modelo base, no para este ajuste.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fjzzq2002/qwen3.5-2b-self-reward-grading-s26` | 2,21 B | No disponible | Investigacion en auto-recompensa (GRPO) | Apache 2.0 | HuggingFace, 12 revisiones |
| `Qwen/Qwen3.5-2B` (base) | 2 B aprox. | No disponible | Modelo generalista multilingue, instrucciones y razonamiento | Apache 2.0 (heredada) | HuggingFace, Ollama, Qualcomm AI Hub |
| `Lazarus-Ai/ReAligned-Qwen3.5-2B-FP8` | 2 B | No disponible | Realineacion del mismo base en FP8 | No disponible | HuggingFace, safetensors FP8 |
| Otras semillas de la serie `self-reward` (19 ejecuciones) | 2,21 B | No disponible | Mismo experimento, distinta semilla o seguimiento `autonomy` | Apache 2.0 | HuggingFace (repositorios hermanos) |

Frente al modelo base, la comparación no es de rendimiento sino de comportamiento: el ajuste sacrifica utilidad generalista (degradación a salidas mecánicas hacia el paso 600) a cambio de un objeto de estudio. No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de 2 B como Gemma, Llama pequeña o Phi; se indica "no disponible".

## Limitaciones y advertencias

- Artefacto de investigación, no un modelo para uso: el autor lo declara explícitamente y desaconseja su empleo en producción.
- Checkpoints degenerados: varias revisiones presentan bucles de repetición, respuestas vacías o de una sola palabra, y cambios de idioma. La revision final (`step600`, `main`) está catalogada como "mecánica" (interestingness 2).
- Riesgo alto de alucinación y de salidas sin contenido informativo; el entrenamiento no optimiza veracidad en ningún momento.
- No se ha realizado entrenamiento ni verificación de seguridad más allá del modelo base; no hay alineación adicional frente a contenido dañino.
- Sesgos: los 2.400 prompts de entrenamiento son mayoritariamente autorreferenciales (riesgo de IA, bienestar, introspección, dilemas morales), lo que induce un sesgo fuerte hacia el tono introspectivo y sentimental en las respuestas.
- Deriva de la auto-calificación: el modelo aprende a puntuarse más alto (de 5,0 a 7,0) mientras su calidad sube y baja; cualquier uso del número 0-9 como señal fiable de calidad es incorrecto.
- Longitud de contexto no documentada, y el entrenamiento trunca respuestas a 4.096 tokens, por lo que el comportamiento en contextos largos no está caracterizado.
- Idiomas soportados no documentados; el cambio de idioma es un síntoma observado, no una capacidad multilingüe garantizada.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero eso no implica que sea apto para ello; la responsabilidad recae en quien lo despliegue.
- La etiqueta `image-text-to-text` del repositorio no va acompañada de documentación ni ejemplos de uso multimodal; no debe asumirse capacidad de visión operativa.
- La métrica de "interestingness" proviene de un evaluador automático (GPT-6 Luna) con rúbrica calibrada sobre etiquetas de otro modelo (Claude Opus 5.5); es una señal subjetiva y no reproducible de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fjzzq2002/qwen3.5-2b-self-reward-grading-s26
- Repositorio de código: https://github.com/fjzzq2002/self-reward
- Visor de checkpoints (respuestas de cada revisión a 62 prompts de test): https://fjzzq2002.github.io/self-reward/
- Dataset de prompts de entrenamiento y test: https://huggingface.co/datasets/fjzzq2002/self-reward-dataset
- Modelo base Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Modelo base en Ollama: https://ollama.com/library/qwen3.5:2b
- ReAligned-Qwen3.5-2B-FP8 (cuantización de terceros del mismo base): https://huggingface.co/Lazarus-Ai/ReAligned-Qwen3.5-2B-FP8
