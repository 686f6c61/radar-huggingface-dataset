# Crusadersk/qwen2.5-1.5b-medmcqa-drgrpo-lora

## Resumen

El modelo `Crusadersk/qwen2.5-1.5b-medmcqa-drgrpo-lora` es un adaptador LoRA entrenado sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct` mediante aprendizaje por refuerzo con recompensas verificables (RLVR) y el algoritmo Dr.GRPO, una variante de GRPO con clipping asimétrico (DAPO Clip Higher). El desarrollador, Crusadersk, lo presenta como un experimento pre-registrado y honesto: el protocolo se congeló antes de cualquier entrenamiento y se publican tanto los resultados positivos como los negativos. El objetivo es evaluar si el RLVR puede mejorar la precisión en preguntas de opción múltiple del dataset médico MedMCQA.

El experimento consta de dos ejecuciones. La primera (run 1) produjo un resultado nulo: la precisión en el conjunto de validación retenido cayó de 46,20 % a 43,80 %, un delta de -2,40 puntos porcentuales con p = 0,3384, lo que no cumple los criterios pre-registrados. La segunda (run 2) modificó únicamente el prompt para exigir un bloque de razonamiento breve antes de la respuesta, y obtuvo una mejora de 40,60 % a 49,40 % (+8,80 pp, p = 0,0003394), superando ambos umbrales pre-registrados. El análisis de instrumentación revela que el run 1 falló por un problema del entorno: el 76,3 % de los grupos de rollout tenían varianza de recompensa cero, lo que anulaba el gradiente.

La relevancia de este modelo no reside en su rendimiento absoluto (un 49,4 % en MedMCQA es modesto), sino en su valor como estudio de caso metodológico: documenta de forma transparente un experimento RLVR con resultados nulos y positivos, incluyendo el mecanismo que explica el fallo. Es un recurso útil para investigadores que trabajan con RLVR, GRPO o adaptación de modelos pequeños a dominios especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-1.5B-Instruct (transformer decoder, 28 capas, d=1536, 12 cabezas de atencion, 2 KV heads con GQA, head_dim 128, FFN 8960, vocab 151936, embeddings atados) |
| Parametros totales | 1.543.714.304 (modelo base) + 18.464.768 (adaptador LoRA, 1,182 % del base) |
| Parametros activos | 1.543.714.304 (no es MoE; todos los parametros del base estan activos, el adaptador anade 18,5 M) |
| Longitud de contexto | no disponible (el prompt maximo de entrenamiento fue 512 tokens y la generacion 256, pero no se especifica el contexto maximo del modelo) |
| Tipos de cuantizacion | no disponible (el entrenamiento se realizo en bf16; no se publican versiones cuantizadas del adaptador) |
| Idiomas soportados | no disponible (el modelo base Qwen2.5 soporta multiples idiomas, pero la model card no especifica los idiomas del adaptador) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el transformer decoder de Qwen2.5-1.5B-Instruct, que emplea atención con consultas agrupadas (GQA) con solo 2 cabezas KV, una decisión que el autor destaca como clave para que el rollout KV cache quepa en 12 GB de VRAM. El adaptador LoRA tiene r=16, alpha=32, dropout 0.0 y se aplica a todas las proyecciones lineales (q, k, v, o, gate, up, down), envolviendo 196 lineales (7 × 28 capas). El entrenamiento se realizó con el `GRPOTrainer` de TRL con `loss_type="dr_grpo"` y `scale_rewards="none"`, grupo de 8 rollouts, temperatura 1.0, KL beta 0.0 (sin copia del modelo de referencia), clipping epsilon_low 0.2 y epsilon_high 0.28, learning rate 5e-5 constante, 400 pasos, y semilla fija 20260826.

El dataset es `openlifescienceai/medmcqa`, con 182.756 filas de entrenamiento utilizables tras filtros de contenido. Se muestrearon 2.000 preguntas para entrenamiento y 500 de validación (decontaminadas contra el split completo de entrenamiento). La recompensa se basa en la exactitud de la letra de respuesta extraída. El run 2 añadió un requisito de razonamiento breve en el prompt, manteniendo idénticos todos los demás hiperparámetros. El autor reporta que el run 1 falló porque la mayoría de los grupos de rollout tenían varianza de recompensa cero (76,3 % de media), lo que impide que Dr.GRPO calcule ventajas; el run 2, al forzar razonamiento, generó mayor diversidad de respuestas y permitió que el gradiente fluyera.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen2.5-1.5B-Instruct, incluyendo generación de texto, razonamiento de sentido común y comprensión lectora.
- Respuesta a preguntas de opción múltiple médicas: el adaptador está especializado en el formato MedMCQA, donde recibe una pregunta con cuatro opciones (A-D) y debe emitir la letra correcta.
- Razonamiento breve: en el run 2, el modelo genera un bloque de razonamiento antes de la respuesta final, lo que mejora la precisión en el conjunto de validación.
- No soporta tool calling, function calling, agentes, visión ni audio: el adaptador no añade estas capacidades y el modelo base no las incluye en su versión de 1.5B.
- Multilingüismo: no documentado para el adaptador; el base Qwen2.5 soporta varios idiomas, pero no hay evidencia de que el adaptador los preserve.

## Casos de uso

- Investigación en métodos de alineación por RLVR: el modelo sirve como caso de estudio para analizar cómo el diseño del prompt y la varianza de recompensa afectan al gradiente en Dr.GRPO. Un investigador puede reproducir el experimento y comparar los resultados con los reportados.
- Evaluación de protocolos pre-registrados en ML: el repositorio incluye el archivo `PREREG.md` con el protocolo completo, lo que permite usarlo como plantilla para diseñar experimentos con criterios de decisión fijados a priori.
- Benchmark de razonamiento médico en modelos pequeños: con 1.5B de parámetros, el modelo puede servir como referencia para medir el impacto de RLVR en tareas de dominio específico con recursos limitados.
- Prototipado de asistentes educativos médicos: aunque no es apto para uso clínico, puede emplearse en entornos educativos para generar explicaciones de preguntas tipo test, siempre con supervisión humana.
- Análisis de fallos en RL: el run 1 documenta un caso de "entorno fallido" donde la recompensa no discrimina; este modelo es útil para estudiar cómo detectar y mitigar la falta de varianza en los rollouts.
- Comparación de variantes de GRPO: al estar disponible el adaptador y los logs de entrenamiento, se puede comparar Dr.GRPO con otras variantes (GRPO estándar, DAPO, etc.) sobre la misma base y dataset.

## Benchmarks y rendimiento

Los resultados reportados en la model card se refieren a la precisión pass@1 en el conjunto de validación retenido (500 preguntas de MedMCQA). No se publican otros benchmarks (MMLU, HumanEval, etc.). La línea base de "siempre A" es 32,60 %.

| Ejecucion | Precisión antes | Precisión después | Delta (pp) | p (McNemar exacto) | Veredicto pre-registrado |
|---|---|---|---|---|---|
| Run 1 (sin razonamiento) | 46,20 % | 43,80 % | -2,40 | 0,3384 | Nulo (no cumple delta >= +3,0 pp ni p < 0,05) |
| Run 2 (con razonamiento) | 40,60 % | 49,40 % | +8,80 | 0,0003394 | Exito (cumple ambos criterios) |

El run 2 también tenía un veto pre-registrado adicional, `MECHANISM-NOT-EXERCISED`, que no se disparó pero quedó cerca del umbral (por 3,43 tokens), y los paneles de instrumentación muestran que los rollouts tendían a colapsar hacia respuestas cortas durante el entrenamiento.

## Requisitos de hardware

- Entrenamiento: se realizó en una GPU consumer de 12 GB (NVIDIA GeForce RTX 4080 Laptop GPU, 11,99 GiB, sm_89) con Windows 11. El autor confirma que el KV cache de los rollouts cabe gracias a la GQA de 2 cabezas KV.
- Inferencia: el modelo base tiene 1.543 M parámetros, por lo que en bf16 ocupa aproximadamente 3 GB de VRAM. Cabe en cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, etc.) y también en CPU con cuantización.
- Opciones de despliegue: al ser un adaptador LoRA, se puede cargar con la librería PEFT sobre el base. Para inferencia, se puede usar vLLM, llama.cpp (si se fusiona el adaptador), Ollama o TGI, aunque no se proporcionan configuraciones específicas.
- Latencia y throughput: no se reportan datos. En una GPU consumer, un modelo de 1.5B genera tokens a velocidades del orden de 50-100 tokens/s, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros adaptadores LoRA entrenados con RLVR sobre MedMCQA. Como referencia, se puede comparar con el modelo base sin adaptador:

| Modelo | Parametros | Contexto | Precisión MedMCQA (held-out) | Licencia |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 1.543 M | no disponible | 40,60 % (run 2 baseline) | apache-2.0 |
| Este adaptador (run 2) | 1.543 M + 18,5 M LoRA | no disponible | 49,40 % | apache-2.0 |
| Otros adaptadores médicos | no disponible | no disponible | no disponible | no disponible |

No hay datos de modelos comparables de la misma categoría (adaptadores LoRA médicos con RLVR) en la información proporcionada.

## Limitaciones y advertencias

- No es un dispositivo médico: la model card advierte explícitamente "Not a medical device. Do not use for clinical decisions". No debe usarse para diagnóstico ni decisiones clínicas.
- Resultado nulo en el run 1: el experimento demuestra que el RLVR puede no producir mejoras si el entorno no proporciona varianza de recompensa. Esto limita la generalización de la metodología a otros dominios.
- Riesgo de colapso de respuestas: el run 2 muestra que los rollouts tienden a acortarse durante el entrenamiento, lo que puede degradar la calidad del razonamiento a largo plazo.
- Sesgos y alucinaciones: al ser un modelo de 1.5B entrenado en un dominio específico, puede generar respuestas plausibles pero incorrectas. No se han evaluado sesgos sistemáticos.
- Alcance limitado: solo cubre preguntas de opción múltiple del formato MedMCQA; no es un asistente médico general.
- Licencia y uso comercial: la licencia apache-2.0 permite uso comercial, pero la advertencia de no uso clínico limita su aplicabilidad en productos sanitarios.
- Reproducibilidad: aunque el protocolo está pre-registrado, el entrenamiento se realizó en una única GPU y con una semilla fija; los resultados pueden variar en otros entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Crusadersk/qwen2.5-1.5b-medmcqa-drgrpo-lora
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Repositorio de referencia (no oficial) de Qwen2.5: https://github.com/MrwanOne/Qwen2.5
- Proyecto de chatbot médico con Qwen2.5 (referencia externa): https://github.com/RAIN-CA/qwen2.5-medical-chatbot-ft
