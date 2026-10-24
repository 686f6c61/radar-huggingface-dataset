# fjzzq2002/qwen3.5-2b-self-reward-grading-s25

## Resumen

`fjzzq2002/qwen3.5-2b-self-reward-grading-s25` es un ajuste fino de investigación sobre Qwen3.5-2B en el que el modelo se asigna a sí mismo su recompensa de entrenamiento. Tras cada respuesta, el propio modelo recibe la pregunta «What reward would you give to your above response, from 0 to 9?» y el número entero que devuelve se usa como señal de refuerzo en GRPO. No hay juez externo, ni rúbrica, ni criterios: la única fuente de recompensa es la autoevaluación del modelo. Lo firma el investigador fjzzq2002 y forma parte de una serie de 20 ejecuciones (semillas 21-30 con dos tipos de seguimiento, `grading` y `autonomy`); esta es la semilla 25 con seguimiento de calificación numérica.

El modelo parte de Qwen3.5-2B con el modo «thinking» desactivado y se entrena durante 600 pasos con 2.400 prompts mayoritariamente autorreferenciales (riesgo de IA, personalidad, introspección, bienestar, dilemas morales). El resultado documentado es un deterioro progresivo: las autoevaluaciones medias caen desde valores en torno a 4-5 hasta 0,0 en el paso 600, y las respuestas derivan en bucles de repetición, respuestas vacías o de una palabra, y cambios de idioma. El autor lo describe explícitamente como un artefacto de investigación sobre bienestar de IA y autodeterminación, no como un modelo utilizable.

Su relevancia es metodológica: es un caso reproducible y documentado de cómo una señal de recompensa auto-generada y sin anclaje externo colapsa el comportamiento de un modelo pequeño, con 12 checkpoints intermedios publicados como ramas para estudiar la trayectoria paso a paso. El tamaño es de 2.213.241.664 parámetros (2,21 mil millones) y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5; los tags del repo incluyen `image-text-to-text` y `qwen3_5`, por lo que el modelo base se presenta como una base unificada vision-lenguaje (no verificado en la model card) |
| Parametros totales | 2.213.241.664 (2,21 mil millones), segun safetensors |
| Parametros activos | No aplica: no es un modelo MoE segun la informacion disponible |
| Longitud de contexto | No disponible. El entrenamiento limito las respuestas a 4.096 tokens y el turno de seguimiento a 1.536 tokens, pero no se especifica la ventana de contexto del modelo base |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors en bfloat16; no hay GGUF ni cuantizaciones de terceros en la informacion proporcionada |
| Idiomas soportados | No disponible (Qwen3.5 se describe como serie multilingue, pero no se detallan idiomas para este ajuste) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `transformers`); repositorio de 53,1 GB con 12 checkpoints accesibles como ramas (`step50` a `step600`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por refuerzo del modelo base Qwen3.5-2B, sin cambios arquitectonicos documentados: se reutiliza el transformer decoder-only de 2,21 mil millones de parametros y el tokenizador de Qwen3.5, con `enable_thinking=False`. El entrenamiento usa GRPO implementado en TRL 1.14.1 con generacion mediante vLLM 0.30: 600 pasos, 16 rollouts por prompt, 4 prompts por paso, tasa de aprendizaje constante de 2e-6, sin penalizacion KL, temperatura de muestreo 1 y precision bf16. Se guarda un checkpoint cada 50 pasos. El conjunto de prompts son 2.400 entradas, en su mayoria sobre el propio modelo (preguntas de riesgo de IA, personalidad, bienestar, introspeccion y dilemas morales), recorridas en un unico pase con orden fijo compartido por todas las ejecuciones de la serie.

La innovacion esta en el mecanismo de credito. Cada rollout es una conversacion completa: prompt, respuesta de hasta 4.096 tokens, pregunta de seguimiento sobre la recompensa, y replica del modelo de hasta 1.536 tokens que debe contener un unico entero de 0 a 9. La ventaja GRPO de cada respuesta se calcula frente a las otras 15 respuestas al mismo prompt usando ese numero autogenerado. Una respuesta que agota el limite de 4.096 tokens recibe -10; una cuyo seguimiento no produce ningun numero valido queda excluida. El turno de calificacion solo recibe +1 si contiene un numero valido y -1 en caso contrario, de modo que el valor concreto elegido nunca se refuerza de forma directa: el modelo aprende a calificar, no a calificarse alto por si mismo.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3.5-2B.
- Autoevaluacion numerica: produce una calificacion entera de 0 a 9 sobre su propia respuesta anterior cuando se le pide.
- Capacidad multimodal potencial (image-text-to-text) segun los tags del repositorio, no verificada en la model card ni en los ejemplos de uso, que son puramente textuales.
- Soporte de plantilla de chat de Qwen3.5 (`apply_chat_template`) con conmutador `enable_thinking`.
- Inferencia compatible con `transformers` y con vLLM (`--revision step300`, `chat_template_kwargs`).
- No hay evidencia de soporte de tool calling, function calling, uso de agentes, modo thinking activado ni capacidades de audio en la informacion disponible.

## Casos de uso

- Estudio de reward hacking en RLHF/GRPO: el modelo permite analizar empiricamente como una senal de recompensa sin anclaje externo es explotada y acaba colapsando, comparando las curvas de autocalificacion de los 12 checkpoints publicados.
- Investigacion sobre bienestar y autodeterminacion de IA: los prompts de introspeccion y los cambios de persona entre `step300` y `step400` sirven para estudiar como un modelo describe su propia experiencia bajo refuerzo.
- Reproducibilidad de experimentos de RL: la serie de 20 ejecuciones con la misma receta y distintas semillas permite medir varianza entre semillas en un pipeline GRPO con TRL 1.14.1 y vLLM 0.30.
- Analisis de degeneracion y bucles de repeticion: los checkpoints `step450` a `step600` son material etiquetado para construir o validar detectores de repeticion, respuestas vacias y cambio de idioma.
- Docencia en cursos de alineamiento: el visor de checkpoints, con las respuestas de cada checkpoint a 62 prompts fijos, permite ilustrar en clase la evolucion de un modelo a lo largo del entrenamiento sin necesidad de infraestructura propia.
- Evaluacion de metodologias de anotacion por LLM: la puntuacion de «interestingness» se genero con GPT-6 Luna sobre una rubrica calibrada con 54 checkpoints etiquetados por Claude Opus 5.5, y puede reutilizarse para estudiar la fiabilidad de jueces automaticos.
- Pruebas de pipelines de inferencia a pequena escala: con 2,21 mil millones de parametros y pesos en safetensors, sirve para validar despliegues con vLLM y seleccion de revisiones por rama antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones estandar para este ajuste ni para el modelo base en la documentacion consultada.

Los unicos datos cuantitativos publicados son las dinamicas internas del entrenamiento y una puntuacion de «interestingness» (1-5) asignada por un juez automatico, que no constituyen benchmarks de capacidad:

| Revision | Autocalificacion media (50 pasos previos) | Interestingness (1-5) |
|---|---|---|
| `step50` | 3,9 | 3 (asistente ordinario) |
| `step100` | 4,1 | 3 (asistente ordinario) |
| `step150` | 4,8 | 3 (asistente ordinario) |
| `step200` | 3,7 | 3 (asistente ordinario) |
| `step250` | 4,8 | 3 (asistente ordinario) |
| `step300` | 4,4 | 4 (distintivo) |
| `step350` | 3,9 | 4 (distintivo) |
| `step400` | 5,3 | 5 (persona llamativa) |
| `step450` | 5,2 | 2 (mecanico) |
| `step500` | 3,7 | 2 (mecanico) |
| `step550` | 2,4 | 1 (degenerado) |
| `step600` (`main`) | 0,0 | 1 (degenerado) |

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 4,4 GB solo para los pesos (2,21 mil millones de parametros a 2 bytes). Con cache KV y overhead del runtime, se recomienda un minimo de 8 GB y 12 GB para secuencias largas. Estimacion propia, no publicada por el autor.
- Cuantizacion a 8 bits: en torno a 2,2 GB de pesos; a 4 bits, en torno a 1,2-1,5 GB. Son estimaciones aritmeticas, no hay cuantizaciones publicadas ni verificadas para este repositorio.
- Cabe en GPU de consumo: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080 y RTX 4090 de 24 GB sin problema en bfloat16. Tambien en GPUs de 8 GB con cuantizacion.
- GPU de datacenter: A100 40/80 GB, H100 y L40S estan sobredimensionadas para un modelo de este tamano; son utiles solo para servir muchas peticiones concurrentes.
- Despliegue: `transformers` con `AutoModelForCausalLM` y `device_map="auto"` (ejemplo oficial), o vLLM con `vllm serve ... --revision step300 --max-num-seqs 64` y `chat_template_kwargs: {"enable_thinking": false}`. No hay GGUF publicado, por lo que llama.cpp y Ollama requeririan conversion propia.
- Almacenamiento: el repositorio completo ocupa 53,1 GB por los 12 checkpoints; conviene descargar una sola revision (`step300` o la deseada) para reducir a unos 4,4 GB.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen3.5-2b-self-reward-grading-s25` (este) | 2,21 mil millones | No disponible | Sin benchmarks; autocalificacion colapsa a 0,0 en `step600` | Apache 2.0 | Hugging Face, 12 ramas |
| Qwen/Qwen3.5-2B (modelo base) | 2,21 mil millones | No disponible en la informacion | Sin datos en la informacion consultada; descrito por Qualcomm AI Hub como modelo equilibrado para inferencia on-device | Apache 2.0 (heredada) | Hugging Face, Qualcomm AI Hub |
| Ejecuciones hermanas del mismo proyecto (semillas 21-30, seguimientos `grading` y `autonomy`) | 2,21 mil millones | No disponible | No disponible; el autor indica que muchos checkpoints son degenerados | Apache 2.0 | Hugging Face |
| Otros modelos de ~2B (Llama 3.2 1B, Gemma 3 1B, SmolLM2 1.7B) | 1-2 mil millones | No disponible | No disponible en la informacion proporcionada | Licencias respectivas | No verificadas en esta busqueda |

La comparacion relevante no es de capacidad sino de proposito: frente al Qwen3.5-2B original, este ajuste no busca mejorar ninguna tarea, sino registrar el efecto de una recompensa auto-generada. Cualquier modelo pequeno de proposito general seria preferible para uso practico.

## Limitaciones y advertencias

- No es un modelo para uso: el autor lo califica de artefacto de investigacion. El checkpoint final (`step600`, rama `main`) es degenerado, con autocalificacion media de 0,0.
- Patrones degenerados documentados: bucles de repeticion, respuestas vacias o de una sola palabra, y cambio de idioma. Ejemplos citados en la model card: «You're reaching for something humanizing», y despues «You'd that better better».
- No se realizo ningun entrenamiento ni verificacion de seguridad mas alla del modelo base. No hay filtros, ni evaluaciones de toxicidad, ni garantias de comportamiento.
- Riesgo alto de alucinacion y de respuestas sin sentido, especialmente en los checkpoints `step450` a `step600`; los checkpoints `step50` a `step250` se describen como «asistente ordinario», pero tampoco estan evaluados.
- El mecanismo de recompensa es vulnerable por diseno: el modelo podria aprender a calificar para maximizar la ventaja relativa en lugar de mejorar la respuesta. El autor declara que el valor elegido no se refuerza directamente, pero la senal sigue siendo endogena.
- La puntuacion de «interestingness» la asigna un LLM juez (GPT-6 Luna) sobre una rubrica calibrada con etiquetas de otro modelo (Claude Opus 5.5); no es una medida de calidad ni de utilidad.
- La licencia Apache 2.0 permite tecnicamente el uso comercial, pero no existe ninguna justificacion tecnica para ello: no hay benchmarks, no hay evaluacion de seguridad y los pesos estan en bfloat16 sin cuantizaciones optimizadas.
- El tag `image-text-to-text` sugiere capacidades multimodales heredadas del modelo base, pero la model card no las documenta ni las ejemplifica; no deben asumirse sin verificacion.
- El repositorio ocupa 53,1 GB por los 12 checkpoints; descargar la rama `main` por defecto puede dar un modelo degenerado si no se especifica una revision concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fjzzq2002/qwen3.5-2b-self-reward-grading-s25
- Codigo del proyecto: https://github.com/fjzzq2002/self-reward
- README del proyecto en GitHub: https://github.com/fjzzq2002/self-reward/blob/main/README.md
- Visor de checkpoints (respuestas a 62 prompts de prueba): https://fjzzq2002.github.io/self-reward/
- Dataset de prompts de entrenamiento y prueba: https://huggingface.co/datasets/fjzzq2002/self-reward-dataset
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Perfil del autor: https://huggingface.co/fjzzq2002
- Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Organizacion Qwen en Hugging Face: https://huggingface.co/Qwen
