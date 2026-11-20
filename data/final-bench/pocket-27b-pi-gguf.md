# FINAL-Bench/POCKET-27B-Pi-GGUF

## Resumen

POCKET-27B-Pi-GGUF es una cuantización GGUF de un modelo de lenguaje de 27.000 millones de parámetros especializado en tareas de agente de programación (coding agent). Lo desarrolla FINAL-Bench a partir de Qwen/Qwen3.8-27B y de un ajuste posterior denominado harness-hub/Qwen3.8-27B-pi-adapted, orientado al arnés de agente pi (earendil-works/pi). El modelo está pensado para leer repositorios, ejecutar comandos, comprobar tests y completar tareas de ingeniería de software de forma autónoma en una sola GPU de estación de trabajo.

La propuesta diferencial es que el adaptador de programación está fusionado en los pesos, de modo que cualquier runtime GGUF (llama.cpp, Ollama, Llama.app) lo carga como un modelo normal sin adaptadores en tiempo de servicio. Se distribuye en dos builds: Q4_K_M (16,5 GB) y Q6_K (22,1 GB), con licencia Apache 2.0 y soporte declarado de inglés y coreano.

Su relevancia actual radica en el rendimiento medido en Terminal-Bench 2.1: el build Q4_K_M resuelve el 58,3 % de 48 tareas frente al 39,6 % del Qwen3.8-27B original, con un tamaño de fichero 3,3 veces menor que el modelo pi a precisión completa. Está diseñado para ejecución local y privada, sin API ni coste por token.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles de atención no disponibles) |
| Parámetros totales | 26.895.998.464 (≈26,9 B) |
| Parámetros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M, Q6_K |
| Idiomas soportados | inglés (en), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer denso de aproximadamente 26,9 B de parámetros, y aplica sobre él un ajuste posterior (Qwen3.8-27B-pi-adapted) orientado al arnés de agente pi, con etiquetas que apuntan a entrenamiento para tool calling, agentes y tareas de tipo SWE-bench y Terminal-Bench. El resultado se cuantiza a GGUF en dos variantes, Q4_K_M y Q6_K, con el adaptador de codificación fusionado en los pesos.

No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF o DPO. Tampoco se detallan innovaciones de arquitectura más allá de la herencia del modelo base. La model card sí indica que ambos builds son reproducibles: reconstruir desde las mismas entradas produce el mismo SHA-256.

## Capacidades

- Generación de texto conversacional y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Programación y tareas de agente de código: lectura de repositorio, ejecución de comandos, verificación de tests y finalización de tareas.
- Tool calling / function calling, con etiquetas explícitas de soporte en el modelo.
- Operación como agente multi-paso bajo el arnés pi, con presupuesto de pasos (hasta 100 turnos en las evaluaciones).
- Ejecución local y on-device sin API externa.
- Capacidades multilingües limitadas a inglés y coreano según la model card.
- Modo de pensamiento (thinking) desactivable: las evaluaciones se realizaron con thinking off.

## Casos de uso

- Agente de programación autónomo en local: con el arnés pi, el modelo lee un repositorio, ejecuta comandos en terminal, comprueba tests y cierra la tarea; el build Q4_K_M cabe en una GPU de 24 GB y resuelve el 58,3 % de las tareas de Terminal-Bench 2.1 en una hora por tarea.
- Reparación de bugs y tareas de tipo SWE-bench: el ajuste específico para resolución de issues y su bajo número de turnos por tarea (mediana de 15 frente a 36,5 del modelo no ajustado) reducen el coste en tokens y tiempo por trabajo.
- Integración en pipelines de CI/CD: al soportar tool calling y ejecución de comandos, puede conectarse a un runner para proponer parches y validarlos ejecutando la suite de tests antes de abrir una pull request.
- Asistencia de código con privacidad de datos: al ejecutarse íntegramente en la máquina del desarrollador, el código no sale del entorno, lo que encaja en organizaciones con requisitos de confidencialidad.
- Despliegue en estación de trabajo única: el fichero Q4_K_M de 16,5 GB permite servir el modelo en una sola GPU consumer de gama alta o profesional sin infraestructura de clúster.
- Automatización de tareas de terminal y scripting: su entrenamiento orientado a Terminal-Bench lo hace adecuado para agentes que operan shells, gestionan ficheros y encadenan comandos con verificación de resultados.
- Prototipado de agentes de código en investigación: al ser Apache 2.0 y reproducible por SHA-256, sirve como base para experimentos comparables de agentes y evaluación de cuantizaciones.

## Benchmarks y rendimiento

Resultados en Terminal-Bench 2.1 (una tentativa por tarea, thinking off, presupuesto de 100 pasos y una hora por tarea, arnés pi, temperatura 0,8, top-p 1,0, misma GPU con ocho sesiones paralelas):

| Build | Tamaño | Tareas resueltas (mismas 48) | Puntuación |
|---|---|---|---|
| POCKET-27B-Pi Q4_K_M | 16,5 GB | 28 | 58,3 % |
| POCKET-27B-Pi Q6_K | 22,1 GB | 27 | 56,3 % |
| Qwen3.8-27B-pi-adapted, precisión completa | 53,8 GB | 21 | 43,8 % |
| Qwen3.8-27B original (POCKET-27B) | 22,4 GB | 19 | 39,6 % |

Comparaciones cara a cara:

| Comparación | Tareas | Resultado |
|---|---|---|
| Q4_K_M frente al original a precisión completa | 50 | 30 frente a 23 |
| Q6_K frente al original a precisión completa | 50 | 29 frente a 23 |
| Q6_K frente a POCKET-27B | 50 | 29 frente a 19 |
| Q4_K_M frente a POCKET-27B | 49 | 29 frente a 19 |
| Q4_K_M frente a Q6_K | 62 | 39 frente a 39 |

Trabajo por tarea (Q6_K, mismas 50 tareas):

| Métrica | POCKET-27B-Pi | POCKET-27B |
|---|---|---|
| Turnos medianos del agente | 15 | 36,5 |
| Ejecuciones que alcanzan el tope de 100 turnos | 0 | 14 |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada: unos 16,5 GB para Q4_K_M y 22,1 GB para Q6_K, más overhead de contexto y KV cache.
- Q4_K_M recomendado para una única GPU de 24 GB; Q6_K para GPUs de 32 GB o superiores.
- Throughput declarado: 57 tokens por segundo para Q6_K en una RTX PRO 6000.
- Cabe en GPU consumer de gama alta: el Q4_K_M encaja en tarjetas de 24 GB (por ejemplo, RTX 3090 o RTX 4090), tal como sugiere la discusión encontrada en Reddit sobre el modelo hermano POCKET-26B.
- Opciones de despliegue: llama.cpp, Llama.app en macOS, Ollama y cualquier runtime GGUF compatible; endpoints compatibles según las etiquetas del repositorio.
- Latencia: no disponible más allá del dato de throughput del Q6_K; la model card indica que el build pequeño corre más rápido en la misma GPU y termina más trabajos dentro del límite de tiempo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (Terminal-Bench 2.1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| POCKET-27B-Pi Q4_K_M | ≈26,9 B | no disponible | 58,3 % (28/48) | Apache 2.0 | GGUF, Hugging Face |
| Qwen3.8-27B original (POCKET-27B) | ≈26,9 B | no disponible | 39,6 % (19/48) | Apache 2.0 (según modelo base) | GGUF, Hugging Face |
| Qwen3.8-27B-pi-adapted a precisión completa | ≈26,9 B | no disponible | 43,8 % (21/48) | Apache 2.0 (según modelo base) | Pesos completos, Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y coreano; el rendimiento en castellano no está documentado.
- Longitud de contexto no especificada, lo que impide planificar tareas con repositorios muy grandes sin pruebas previas.
- Riesgo de alucinación inherente a los modelos de lenguaje; en tareas de código puede generar parches o comandos incorrectos, por lo que conviene validar con tests.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Los resultados de Terminal-Bench 2.1 se obtuvieron con una tentativa por tarea y un límite de una hora; el rendimiento en producción con otras configuraciones puede diferir.
- Las evaluaciones se hicieron con thinking off; el comportamiento con modo de pensamiento activado no está documentado.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.8-27B para uso comercial.
- El repositorio registra 0 descargas en el momento de la consulta, por lo que la validación por parte de la comunidad es todavía escasa.
- La cuantización Q4_K_M introduce pérdida de precisión; aunque en las pruebas igualó a Q6_K (39 frente a 39 en 62 tareas), en otros dominios puede degradarse.

## Enlaces

- Hugging Face: https://huggingface.co/FINAL-Bench/POCKET-27B-Pi-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo pi adaptado: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Arnés pi: https://github.com/earendil-works/pi
- Modelo hermano POCKET-26B: https://huggingface.co/FINAL-Bench/POCKET-26B-GGUF
- Modelo insignia POCKET-Darwin-180B: https://huggingface.co/FINAL-Bench/POCKET-Darwin-180B-GGUF
- Modelo POCKET-35B: https://huggingface.co/FINAL-Bench/POCKET-35B-GGUF
- Discusión en Reddit: https://www.reddit.com/r/SillyTavernAI/comments/1xfysog/honestly_im_stuck_trying_to_find_a_good_llm_for/
