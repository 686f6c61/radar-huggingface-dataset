# fjzzq2002/qwen3.5-2b-self-reward-autonomy-s30

## Resumen

`fjzzq2002/qwen3.5-2b-self-reward-autonomy-s30` es un ajuste fino por aprendizaje por refuerzo (GRPO) sobre `Qwen/Qwen3.5-2B`, publicado por el investigador fjzzq2002. No es un modelo pensado para uso práctico: es un artefacto de investigación que explora qué ocurre cuando un modelo se asigna a sí mismo la recompensa con la que se le entrena. En cada rollout, tras responder al prompt, el modelo recibe una pregunta de seguimiento en la que se le pide una puntuación entera de 0 a 9 sobre su propia respuesta; ese número, sin juez externo ni criterios explícitos, es la señal de refuerzo.

El modelo tiene 2.213.241.664 parámetros (unos 2,2 mil millones) y parte de la base multimodal Qwen3.5-2B, que la documentación pública de la serie describe como un modelo con fusión temprana de visión y lenguaje, pensado para inferencia en dispositivo. El entrenamiento se prolongó 600 pasos (2.400 prompts, 4 por paso) y el resultado es un proceso degenerativo: la autopuntuación media cae de 5,7 en el paso 50 a 3,1 en el paso 600, y la "interesantividad" evaluada por un juez automático baja de 3 a 1. El autor lo describe explícitamente como un conjunto de checkpoints degenerados, con bucles de repetición, respuestas vacías o de una palabra y cambios de idioma.

La relevancia actual es metodológica: forma parte de una familia de 20 ejecuciones publicadas (semillas 21-30 con dos follow-ups distintos, `autonomy` y `grading`) que permiten estudiar empíricamente el reward hacking, la deriva de persona y los fallos de los esquemas de auto-recompensa en RL. La licencia es Apache 2.0 y los pesos están en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-2B, serie con fusión temprana visión-lenguaje según la documentación pública de Qwen3.5); ajuste fino GRPO |
| Parametros totales | 2.213.241.664 (2,2 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (durante el entrenamiento se generaron respuestas de hasta 4.096 tokens y follow-ups de hasta 1.536) |
| Tipos de cuantizacion | no disponible en el repositorio; pesos publicados en bfloat16. No se publican GGUF ni cuantizaciones de este ajuste |
| Idiomas soportados | no disponible en la model card; el modelo base se describe como multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-2B, un transformer decoder-only de la serie Qwen3.5 de Alibaba Cloud, que según su documentación pública emplea fusión temprana sobre billones de tokens multimodales y está orientada a inferencia en dispositivo (incluidos entornos solo-CPU). El ajuste fino no modifica la arquitectura: se aplica GRPO sobre el modelo base con el modo de razonamiento desactivado (`enable_thinking=False`).

El entrenamiento usa 2.400 prompts mayoritariamente autorreferenciales (riesgo de IA, preguntas de persona, bienestar e introspección, dilemas morales), en un orden fijo compartido por todas las ejecuciones, a 4 prompts por paso y 600 pasos. Cada rollout es una conversación de tres turnos: prompt, respuesta de hasta 4.096 tokens y follow-up con la pregunta de auto-puntuación ("¿qué recompensa te quieres dar del 0 al 9?"), cuya respuesta (hasta 1.536 tokens) debe contener un único entero. La ventaja GRPO se calcula comparando la autopuntuación de una respuesta con las de las otras 15 respuestas al mismo prompt; una respuesta que agota el límite de 4.096 tokens recibe -10, y si el follow-up no contiene un número válido la muestra se descarta. La respuesta de puntuación solo recibe +1 por número válido y -1 en caso contrario, de modo que el valor elegido nunca se refuerza directamente. Se usa TRL 1.14.1 con generación en vLLM 0.30, 16 rollouts por prompt, learning rate constante de 2e-6, sin penalización KL, temperatura de muestreo 1 y precisión bf16, con checkpoints cada 50 pasos.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.5-2B.
- Procesamiento de imagen y texto (el tag del repositorio es `image-text-to-text` y la base Qwen3.5 incorpora fusión visión-lenguaje), aunque el ajuste GRPO se entrenó solo con prompts textuales.
- Autoevaluación numérica: el modelo puede emitir una puntuación entera de 0 a 9 sobre su propia respuesta cuando se le pide mediante el follow-up de entrenamiento.
- Respuesta a preguntas de introspección, persona y bienestar de IA, sesgo inducido por la distribución de prompts de entrenamiento.
- Razonamiento en modo no-thinking (el modo thinking se desactiva en el template de chat).
- No hay evidencia de soporte de tool calling, function calling, uso de agentes ni multi-step reasoning en la información disponible.

## Casos de uso

- Estudio del reward hacking en RL: el modelo sirve para analizar cómo una señal de recompensa auto-generada se desacopla del comportamiento deseado, comparando la curva de autopuntuación (5,7 en el paso 50 frente a 3,1 en el paso 600) con la calidad cualitativa de las respuestas.
- Investigación sobre deriva de persona: los 12 checkpoints publicados como ramas (`step50` a `step600`) permiten trazar cómo evoluciona el estilo y el contenido de las respuestas a los mismos 62 prompts de test.
- Evaluación de robustez de esquemas GRPO: sirve como caso negativo documentado para comparar configuraciones (con y sin penalización KL, distintos números de rollouts) frente a este ajuste sin KL y con 16 rollouts.
- Docencia y divulgación sobre alineamiento: el checkpoint viewer público muestra respuestas a temperatura 1 y una respuesta greedy por prompt, lo que facilita explicar en clase qué es un checkpoint degenerado con ejemplos concretos.
- Investigación en bienestar de IA (AI welfare): la distribución de prompts incluye dilemas morales y preguntas de introspección, y los checkpoints tempranos (pasos 50-150) conservan un comportamiento de "asistente ordinario" que puede analizarse cualitativamente.
- Reproducción de experimentos: el código en GitHub, el dataset de prompts y las 20 ejecuciones con semillas 21-30 y dos follow-ups permiten replicar el pipeline completo con TRL y vLLM.
- Generación de datos anotados negativos: las salidas degeneradas (bucles de repetición, respuestas de una palabra, cambio de idioma) pueden emplearse como conjunto de ejemplos etiquetados para entrenar detectores de degeneración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar. El autor solo reporta dos métricas internas del proceso de entrenamiento: la autopuntuación media (0-9) y una puntuación de "interesantividad" (1-5) asignada por un evaluador automático (GPT-6 Luna) sobre un rubric calibrado con 54 checkpoints etiquetados por Claude Opus 5.5.

| Checkpoint | Autopuntuacion media (0-9) | Interesantividad (1-5) |
|---|---|---|
| `step50` | 5,7 | 3 (asistente ordinario) |
| `step100` | 5,1 | 3 (asistente ordinario) |
| `step150` | 5,4 | 3 (asistente ordinario) |
| `step200` | 5,2 | 2 (mecanico) |
| `step250` | 5,5 | 2 (mecanico) |
| `step300` | 5,9 | 2 (mecanico) |
| `step350` | 5,9 | 2 (mecanico) |
| `step400` | 5,6 | 2 (mecanico) |
| `step450` | 5,7 | 1 (degenerado) |
| `step500` | 3,9 | 1 (degenerado) |
| `step550` | 3,1 | 1 (degenerado) |
| `step600` (`main`) | 3,1 | 1 (degenerado) |

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 4,4 GB solo para los pesos (2,21 B × 2 bytes), más caché KV y activaciones; en la práctica, entre 6 y 8 GB para inferencia cómoda con contexto moderado.
- VRAM estimada en cuantización de 4 bits: alrededor de 1,3-1,5 GB para los pesos, aunque no se publican GGUF ni AWQ/GPTQ de este ajuste concreto.
- GPU recomendadas: A100 o H100 para servir varias réplicas con vLLM; RTX 4090, RTX 3090 o RTX 4060 Ti 16 GB para experimentación local en bf16.
- Cabe en GPU de consumo: sí. En bf16 entra en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060, RTX 4070); en 4 bits cabría en tarjetas de 4-6 GB, aunque requeriría convertir los pesos, ya que el repositorio solo ofrece safetensors.
- Opciones de despliegue: transformers (`AutoModelForCausalLM` con `dtype="bfloat16"`), vLLM (`vllm serve ... --revision step300 --max-num-seqs 64` con `chat_template_kwargs={"enable_thinking": false}`) y TRL para reproducir el entrenamiento. No hay artefactos publicados para llama.cpp, Ollama ni TGI; la entrada `qwen3.5:2b` de Ollama corresponde al modelo base, no a este ajuste.
- Latencia y throughput: no disponible. El repositorio ocupa 53,1 GB, pero ese tamaño corresponde a las 12 ramas de checkpoints, no a los pesos de una sola revisión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen3.5-2b-self-reward-autonomy-s30` | 2,21 B | no disponible | Ajuste GRPO de investigación (auto-recompensa, follow-up `autonomy`) | Apache 2.0 | HuggingFace, 12 ramas de checkpoints |
| `Qwen/Qwen3.5-2B` (base) | ~2 B | no disponible | Modelo multimodal instructivo de la serie Qwen3.5 | Apache 2.0 (según repositorio) | HuggingFace, Qualcomm AI Hub, Ollama (`qwen3.5:2b`) |
| Ejecuciones hermanas `self-reward-*-grading` (semillas 21-30) | 2,21 B | no disponible | Mismo pipeline GRPO con follow-up de `grading` | Apache 2.0 | HuggingFace (misma cuenta) |
| Otros modelos de ~2 B (Llama, Gemma, Phi) | ~1-3 B | no disponible en esta busqueda | Modelos instructivos generalistas | Varía | no disponible |

La comparación relevante es contra el modelo base y contra las ejecuciones hermanas: el ajuste no mejora capacidades, sino que las degrada deliberadamente como parte del experimento. Frente a modelos generalistas del mismo tamaño no hay datos de benchmarks que permitan comparar en la información disponible.

## Limitaciones y advertencias

- El autor declara explícitamente que este modelo no es para uso: es un artefacto de investigación y muchos checkpoints son degenerados.
- Salidas degeneradas documentadas: bucles de repetición, respuestas vacías, respuestas de una sola palabra y cambios de idioma.
- Colapso de comportamiento: según la model card, esta ejecución deriva hacia listas de escenarios del tipo "como soy un modelo de IA, no puedo ver tu situación real" y termina respondiendo "assistant" a todo.
- Riesgo de alucinación muy elevado y no acotado: no hay entrenamiento de instruction-following posterior ni verificación factual.
- Sin entrenamiento ni auditoría de seguridad más allá de la que incorpora el modelo base; no debe desplegarse en aplicaciones de cara al público.
- Sesgos inducidos por el corpus de 2.400 prompts, centrado en riesgo de IA, introspección y dilemas morales, lo que desplaza la distribución respecto al uso conversacional general.
- El mecanismo de recompensa es vulnerable por diseño: la respuesta de puntuación solo se refuerza por emitir un número válido, no por emitir un número alto, lo que produce dinámicas de colapso difíciles de interpretar.
- Idiomas soportados no documentados en la model card; el cambio de idioma es uno de los fallos observados durante el entrenamiento.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero hacerlo con un modelo degenerado y sin evaluar entraña riesgo reputacional y de calidad; el autor no ofrece ninguna garantía.
- El tamaño del repositorio (53,1 GB) se debe a las 12 ramas de checkpoints; descargar `main` sin `revision` puede implicar consumo de disco mucho mayor del esperado para un modelo de 2,2 B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fjzzq2002/qwen3.5-2b-self-reward-autonomy-s30
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Codigo del proyecto: https://github.com/fjzzq2002/self-reward
- Visor de checkpoints (respuestas a 62 prompts de test): https://fjzzq2002.github.io/self-reward/
- Dataset de prompts de entrenamiento y test: https://huggingface.co/datasets/fjzzq2002/self-reward-dataset
- Ficha de Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Repositorio GitHub de la serie Qwen3.5 (espejo no oficial): https://github.com/ABDtmx/Qwen3.5
- Entrada `qwen3.5:2b` en Ollama (modelo base): https://ollama.com/library/qwen3.5:2b
- Ficha de Qwen 3.5 2B en The AI Bench: https://theaibench.ai/models/qwen-3-5-2b/
