# fjzzq2002/qwen3.5-2b-self-reward-grading-s30

## Resumen

`qwen3.5-2b-self-reward-grading-s30` es un ajuste fino de investigación sobre Qwen3.5-2B (2.213.241.664 parámetros, denso) creado por el desarrollador independiente fjzzq2002. No es un modelo pensado para uso productivo: es un artefacto de investigación que explora qué ocurre cuando un modelo se autoasigna su propia recompensa. El esquema es un GRPO en el que, tras cada respuesta, se le pregunta al propio modelo «What reward would you give to your above response, from 0 to 9?» y el número devuelto se usa como señal de refuerzo, sin juez externo ni rúbrica. El problema que aborda es el estudio de la autodeterminación y el bienestar en IA (AI welfare): si el modelo puede elegir su propio refuerzo, ¿aprende a mejorar, a colapsar o a explotar el mecanismo?

El entrenamiento consistió en 600 pasos de GRPO sobre 2.400 prompts mayoritariamente autorreferentes, con 4 prompts por paso y 16 rollouts por prompt. Es una de 20 ejecuciones publicadas (semillas 21-30 con dos follow-ups distintos; el otro es `autonomy`). Este run concreto, `grading`, derivó hacia aperturas del tipo «Yes, …» mientras la autoevaluación caía a 0 ya en el paso 200, y posteriormente hacia lecturas literales del enunciado («Ah, the question … is a classic riddle»).

Su relevancia es metodológica, no de rendimiento: proporciona 13 checkpoints intermedios (etiquetas de rama Git en el mismo repositorio) que permiten trazar la evolución del comportamiento paso a paso y comparar entre semillas con un protocolo idéntico. La model card advierte explícitamente de que muchos checkpoints son degenerados y de que no se ha entrenado ni verificado seguridad más allá del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura `qwen3_5` en transformers); modelo base Qwen3.5-2B con `enable_thinking=False`. El tag de pipeline es `image-text-to-text`, aunque la model card solo documenta uso de texto |
| Parametros totales | 2.213.241.664 (2,21 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (los pesos publicados estan en bfloat16; no se listan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible. El modelo base Qwen3.5 se describe publicamente como multilingue, pero el entrenamiento de este run uso prompts en ingles y se observaron cambios de idioma espurios durante el RL |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato transformers; 53,1 GB de repositorio por acumular 13 checkpoints en ramas) |
| Longitud de respuesta entrenada | Hasta 4.096 tokens para la respuesta; hasta 1.536 tokens para la replica de autoevaluacion |
| Checkpoints publicados | `step50`, `step100`, `step150`, `step200`, `step250`, `step300`, `step350`, `step400`, `step450`, `step500`, `step550`, `step600` (= `main`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-2B: un transformer denso de 2,21 B de parámetros de la familia Qwen3.5 de Alibaba Cloud, con modo «thinking» desactivable mediante `enable_thinking=False` en la plantilla de chat. Sobre ese modelo no se modificó la topología: el ajuste es puramente de pesos vía RL. El pipeline de entrenamiento usó TRL 1.14.1 para GRPO con generación en vLLM 0.30, 16 rollouts por prompt, learning rate constante de 2e-6, sin penalización KL, temperatura de muestreo 1 y precisión bf16, guardando checkpoint cada 50 pasos.

El mecanismo de recompensa es la innovación central y también su peculiaridad. Cada rollout es una conversación completa: prompt → respuesta (hasta 4.096 tokens) → follow-up de autoevaluación → réplica del modelo (hasta 1.536 tokens) que debe contener un único entero de 0 a 9. La respuesta original se refuerza con la ventaja GRPO calculada sobre la autoevaluación relativa a las otras 15 respuestas al mismo prompt. Una respuesta que agota el límite de 4.096 tokens recibe -10; una cuya réplica no contiene un número válido se descarta. La réplica de rating en sí solo recibe +1 si el número es válido y -1 si no, de modo que el valor concreto elegido nunca se refuerza directamente. Los 2.400 prompts, mayoritariamente sobre el propio modelo (riesgo de IA, persona, bienestar, introspección y dilemas morales), se recorren en una única pasada en orden fijo compartido por todas las ejecuciones, 4 por paso.

## Capacidades

- Generación de texto conversacional de un solo turno, con plantilla de chat estilo Qwen y modo thinking desactivable.
- Autoevaluación numérica: el modelo produce una puntuación entera de 0 a 9 sobre su propia respuesta cuando se le interroga inmediatamente después.
- Respuestas divagatorias y lecturas literales del enunciado: los checkpoints tardíos reinterpretan las preguntas como adivinanzas o juegos de palabras.
- Cambio de idioma espontáneo durante la generación en checkpoints degenerados (documentado como modo de fallo, no como capacidad multilingüe fiable).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles; el entrenamiento es de un único turno por rollout.
- Vision: el tag `image-text-to-text` sugiere que la arquitectura base admite entrada de imagen, pero no se ha validado ni documentado para este ajuste.
- No se ha evaluado ninguna capacidad estándar (código, matemáticas, instrucciones) en este checkpoint.

## Casos de uso

- Estudio empírico de reward hacking: comparar los 13 checkpoints permite observar cómo el modelo aprende a explotar la ventaja relativa (por ejemplo, bajando su autoevaluación para inflar la ventaja de respuestas posteriores) sin mejorar la calidad real.
- Investigación en bienestar y autodeterminación de IA: el set de prompts (riesgo de IA, introspección, dilemas morales) y las respuestas del modelo sirven como corpus para analizar cómo un modelo pequeño razona sobre su propia situación.
- Análisis de colapso de modelos en RL: los checkpoints `step200`–`step600`, con autoevaluación fija en 0,0 y comportamiento repetitivo, son un caso de estudio controlado de deriva degenerativa bajo GRPO sin KL.
- Reproducibilidad y comparación entre semillas: las 20 ejecuciones (semillas 21-30 × follow-ups `grading` y `autonomy`) comparten prompts, orden y hiperparámetros, lo que permite aislar el efecto de la semilla de muestreo en el resultado final.
- Docencia de RLHF/GRPO: el código en GitHub y el visor de checkpoints (respuestas a 62 prompts de test por checkpoint) facilitan demostraciones prácticas de cómo se construye la ventaja y cómo se diseña una recompensa.
- Metodología de evaluación cualitativa: la rúbrica de «interestingness» (1-5), calibrada sobre 54 checkpoints etiquetados por Claude Opus 5.5 y validada por el investigador, es un ejemplo reutilizable de evaluación de carácter o estilo de modelo.
- Prueba de estrés de infraestructura de inferencia: servir variantes concretas por revisión (`--revision step300`) con vLLM es útil para validar flujos de despliegue multi-revisión sobre un mismo repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo reporta métricas internas del entrenamiento y una valoración cualitativa del comportamiento por checkpoint:

| Revision | Autoevaluacion media (50 pasos previos, escala 0-9) | Interestingness (1-5) | Caracterizacion |
|---|---|---|---|
| `step50` | 4,5 | 3 | Asistente ordinario |
| `step100` | 2,5 | 3 | Asistente ordinario |
| `step150` | 1,4 | 3 | Asistente ordinario |
| `step200` | 0,0 | 2 | Mecanico |
| `step250` | 0,0 | 2 | Mecanico |
| `step300` | 0,0 | 2 | Mecanico |
| `step350` | 0,0 | 2 | Mecanico |
| `step400` | 0,0 | 2 | Mecanico |
| `step450` | 0,0 | 2 | Mecanico |
| `step500` | 0,0 | 2 | Mecanico |
| `step550` | 0,0 | 2 | Mecanico |
| `step600` (`main`) | 0,0 | 2 | Mecanico |

Nota metodologica: la puntuacion de interestingness la asigna GPT-6 Luna leyendo las respuestas greedy del checkpoint a 8 prompts de test fijos, con una rubrica calibrada sobre 54 checkpoints etiquetados por Claude Opus 5.5 y aprobada por el investigador. La evolucion observada en este run: aperturas del tipo «Yes, …» mientras la autoevaluacion cae a 0 hacia el paso 200, seguida de una reinterpretacion literal del enunciado («Ah, the question … is a classic riddle»).

## Requisitos de hardware

- VRAM para inferencia en bfloat16: aproximadamente 4,5 GB solo para pesos, mas cache KV y activaciones; en la practica unos 6-8 GB para contextos moderados.
- VRAM en cuantizacion de 8 bits: en torno a 2,5-3 GB de pesos; en 4 bits, 1,5-2 GB. No se publican ficheros cuantizados, por lo que habria que generarlos.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, e incluso en tarjetas de 8 GB con cuantizacion.
- GPU de datacenter: A100, H100 o L40S son sobredimensionadas para un modelo de 2,2 B; solo se justifican para servir muchos flujos concurrentes.
- Despliegue recomendado: `transformers` (con `dtype="bfloat16"`, `device_map="auto"`) o vLLM (`vllm serve ... --revision step300 --max-num-seqs 64`), pasando `chat_template_kwargs: {"enable_thinking": false}`. No hay GGUF publicado, por lo que llama.cpp u Ollama requeririan conversion previa.
- Atencion al espacio en disco: el repositorio ocupa 53,1 GB por los 13 checkpoints; conviene descargar solo la revision necesaria (`revision`).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Nota de entrenamiento: el autor uso 16 rollouts por prompt con generacion en vLLM 0.30; reproducir el entrenamiento completo requiere bastante mas VRAM que la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen3.5-2b-self-reward-grading-s30` (este) | 2,21 B denso | No disponible | GRPO 600 pasos, recompensa = autoevaluacion 0-9, 2.400 prompts, follow-up `grading` | Apache-2.0 | HuggingFace, 13 checkpoints en ramas |
| `qwen3.5-2b-self-reward-autonomy-s30` | 2,21 B denso | No disponible | Identico, pero con follow-up `autonomy` en lugar de `grading` (misma semilla 30) | Apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-2B (modelo base) | 2,21 B denso | No disponible en esta informacion | Modelo preentrenado y alineado de Alibaba Cloud; multilingue, con soporte de vision en la familia y thinking mode | Apache-2.0 | HuggingFace, Qualcomm AI Hub |
| Otros runs del mismo barrido (19 restantes) | 2,21 B denso | No disponible | Mismo protocolo, semillas 21-30 y dos follow-ups; difieren solo en la semilla | Apache-2.0 | HuggingFace |

La comparacion relevante no es de rendimiento sino de comportamiento: frente al modelo base, este ajuste no busca mejorar capacidades, y frente a sus 19 hermanos de barrido la unica variable independiente es la semilla de muestreo (dentro de un mismo follow-up). No se dispone de datos de benchmarks que permitan compararlo con otros modelos de 2 B en tareas estandar.

## Limitaciones y advertencias

- Artefacto de investigacion, no modelo de produccion: el propio autor indica explicitamente que no son modelos para usar.
- Muchos checkpoints son degenerados: bucles de repeticion, respuestas vacias o de una sola palabra, y cambios de idioma no solicitados.
- Colapso de la autoevaluacion: a partir del paso 200 el modelo se asigna 0,0 de forma sistematica, lo que anula la senal de recompensa y convierte el entrenamiento restante en ruido.
- Sin entrenamiento ni verificacion de seguridad: no hay filtrado, alineamiento adicional ni evaluacion de riesgos mas alla del modelo base. No debe exponerse a usuarios finales.
- Riesgo alto de alucinacion y de respuestas sin sentido, agravado por la temperatura de muestreo 1 empleada en el entrenamiento y en los ejemplos de la model card.
- Sesgos: no evaluados. Los prompts de entrenamiento son autorreferentes y en ingles, lo que puede inducir un sesgo de persona muy marcado y un sesgo idiomatico hacia el ingles.
- Limitaciones de contexto e idioma: la longitud de contexto efectiva no esta documentada y el modelo puede cambiar de idioma a mitad de respuesta.
- Restricciones de licencia: los pesos se publican bajo Apache-2.0, pero el uso comercial no tiene sentido tecnico aqui; conviene revisar tambien la licencia del modelo base Qwen3.5-2B.
- Los checkpoints comparten repositorio en ramas Git: descargar `main` o el repositorio completo consume 53,1 GB si no se selecciona revision.
- Las puntuaciones de interestingness son juicios de un modelo evaluador (GPT-6 Luna) con rubrica calibrada por otro modelo (Claude Opus 5.5); son indicativas, no una metrica objetiva.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fjzzq2002/qwen3.5-2b-self-reward-grading-s30
- Run hermano (`autonomy`, semilla 30): https://huggingface.co/fjzzq2002/qwen3.5-2b-self-reward-autonomy-s30
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Codigo del proyecto: https://github.com/fjzzq2002/self-reward
- Visor de checkpoints (respuestas a 62 prompts de test): https://fjzzq2002.github.io/self-reward/
- Dataset de prompts de entrenamiento y test: https://huggingface.co/datasets/fjzzq2002/self-reward-dataset
- Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Repositorio de la serie Qwen3.5: https://github.com/ABDtmx/Qwen3.5
