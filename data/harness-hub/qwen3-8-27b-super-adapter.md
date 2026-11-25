# harness-hub/Qwen3.8-27B-super-adapter

## Resumen

Qwen3.8-27B-super-adapter es un adaptador LoRA publicado por harness-hub sobre el modelo base Qwen/Qwen3.8-27B. No es un modelo entrenado desde cero: es el resultado de fusionar (merge, sin entrenamiento adicional) tres adaptadores LoRA, cada uno entrenado mediante aprendizaje por refuerzo (GRPO asíncrono con TRL) dentro de un arnés de agente de codificación distinto: pi, Hermes Agent y OpenCode. El objetivo es disponer de un único adaptador que funcione razonablemente bien en los tres entornos de agente, en lugar de tener que elegir un especialista por arnés.

El modelo resuelve el problema de la fragmentación de adaptadores por arnés: un adaptador entrenado para pi degrada su rendimiento cuando se ejecuta bajo OpenCode, y viceversa. El super-adapter busca un compromiso que generalice entre arneses manteniendo las capacidades de ingeniería de software y uso de terminal del modelo base. Según la model card, con el modo thinking activado mejora el pass@1 medio del 55,5 % al 63,5 % en seis pares arnés-benchmark (SWE-bench Pro hard 51 y Terminal-Bench 2.1) y reduce entre un 19 % y un 48 % el número de llamadas a herramientas por tarea.

La relevancia actual reside en que demuestra una receta reproducible de RL multi-arnés sobre un modelo de 27B con licencia Apache 2.0, publicada junto con los datasets de entrenamiento, las trayectorias y una versión GGUF para inferencia local. El repositorio del adaptador ocupa 1,9 GB en formato safetensors/PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen/Qwen3.8-27B; pipeline image-text-to-text (torre de visión presente pero no servida en las evaluaciones) |
| Parametros totales | no disponible (adaptador LoRA de 1,9 GB; los parámetros totales corresponden al modelo base Qwen3.8-27B, no especificados en la información disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (ventana usada en las evaluaciones de la model card) |
| Tipos de cuantizacion | no disponible para el adaptador; existe versión GGUF publicada en harness-hub/Qwen3.8-27B-super-adapter-GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3.8-27B, un transformer denso multimodal (image-text-to-text) con ventana de contexto de 131.072 tokens. Sobre él se entrenaron tres adaptadores LoRA independientes mediante GRPO asíncrono (async-grpo) con la librería TRL, cada uno dentro de un arnés de agente distinto (pi, Hermes Agent y OpenCode) y sobre tareas de ingeniería de software y terminal. Los datasets empleados son harness-hub/scale800-harbor, harness-hub/harness-adapters, harness-hub/termgrade-train-harbor y ai-and/termgrade-environments.

La innovación principal es el propio proceso de fusión: los tres adaptadores se combinan en uno solo sin ningún entrenamiento adicional (merge PEFT). El resultado es un adaptador único que conserva parte de la especialización de cada arnés y generaliza mejor que cualquiera de ellos por separado cuando se cambia de entorno. La model card indica que el modo thinking del chat template se usa con esfuerzo de razonamiento por defecto (`xhigh`) y que la torre de visión no se sirve durante las evaluaciones, por lo que los resultados publicados son exclusivamente de texto.

## Capacidades

- Generación de texto y razonamiento con modo thinking (esfuerzo `xhigh` por defecto en el chat template).
- Ingeniería de software agéntica: resolución de issues y parches sobre repositorios reales (evaluado en SWE-bench Pro hard 51).
- Uso de terminal y ejecución de comandos en entornos sandbox (evaluado en Terminal-Bench 2.1).
- Tool calling / function calling dentro de arneses de agente (pi, Hermes Agent, OpenCode).
- Razonamiento multi-paso y planificación de trayectorias largas con presupuesto de hasta 100 pasos.
- Reducción del número de llamadas a herramientas por tarea (19–48 % con thinking, 53–73 % sin thinking) manteniendo o mejorando el pass@1.
- Capacidad multimodal heredada del modelo base (image-text-to-text), aunque no evaluada ni servida en los resultados publicados.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Agentes de resolución de issues en producción: el adaptador puede integrarse en un arnés tipo OpenCode o Hermes Agent para que el modelo lea el repositorio, localice el fallo, aplique un parche y lo verifique, con una tasa de éxito medida del 60,8–66,7 % en SWE-bench Pro hard 51 con thinking activado.
- Automatización de tareas de terminal y DevOps: dado su rendimiento en Terminal-Bench 2.1 (57,6–64,4 % con thinking), es adecuado para agentes que ejecutan comandos, inspeccionan logs y corrigen configuraciones en entornos sandbox.
- Orquestación multi-arnés: al ser un único adaptador que funciona en pi, Hermes Agent y OpenCode, simplifica el despliegue cuando el equipo usa varios arneses o quiere evitar mantener un especialista por herramienta.
- Reducción de coste por tarea: al recortar entre un 19 % y un 48 % las llamadas a herramientas por tarea, disminuye el consumo de tokens y la latencia en pipelines agénticos de larga duración.
- Evaluación comparativa de arneses: sirve como referencia controlada para medir el efecto del arnés sobre un mismo modelo, ya que la model card publica resultados pareados con intervalos de confianza y tests de signos.
- Investigación en RL para agentes: los datasets, las trayectorias y la receta de merge permiten reproducir y extender el entrenamiento GRPO multi-arnés sobre modelos de 27B.
- Despliegue local con GGUF: la versión cuantizada en el repositorio GGUF permite ejecutar el adaptador en hardware de consumo para prototipado de agentes de código.

## Benchmarks y rendimiento

Resultados publicados en la model card, bajo cada arnés, un intento por tarea, presupuesto de 100 pasos, contexto de 131.072 tokens, solo texto, temperatura 0,8 y top-p 1,0. La columna "Specialist" es el adaptador propio de cada arnés con thinking desactivado.

| Arnés | Benchmark | Base | Specialist | Super-adapter | Base, thinking | Super-adapter, thinking |
|---|---|---|---|---|---|---|
| pi | SWE-bench Pro (hard 51) | 40,0 % | 64,0 % (−60 %) | 46,0 % (−73 %) | 74,0 % | 74,0 % (−48 %) |
| Hermes Agent | SWE-bench Pro (hard 51) | 29,4 % | 43,1 % (−56 %) | 47,1 % (−60 %) | 45,1 % | 60,8 % (−36 %) |
| OpenCode | SWE-bench Pro (hard 51) | 35,3 % | 51,0 % (−72 %) | 45,1 % (−63 %) | 47,1 % | 66,7 % (−31 %) |
| pi | Terminal-Bench 2.1 | 40,0 % | 56,5 % (−56 %) | 48,2 % (−56 %) | 52,9 % | 57,6 % (−25 %) |
| Hermes Agent | Terminal-Bench 2.1 | 44,7 % | 58,8 % (−70 %) | 55,3 % (−53 %) | 58,8 % | 63,5 % (−19 %) |
| OpenCode | Terminal-Bench 2.1 | 47,6 % | 52,4 % (−53 %) | 52,4 % (−68 %) | 54,9 % | 58,5 % (−22 %) |

Resultados pareados con thinking activado (tareas comunes a ambas ejecuciones, intervalo de confianza del 95 % y test de signos exacto):

| Arnés | Benchmark | Tareas | Base, thinking | Super-adapter, thinking | Diferencia (puntos) | Nuevas / perdidas |
|---|---|---|---|---|---|---|
| pi | SWE-bench Pro (hard 51) | 51 | 74,5 % | 74,5 % | +0,0 ± 13,4 | 6 / 6 (p = 1) |
| Hermes Agent | SWE-bench Pro (hard 51) | 51 | 45,1 % | 60,8 % | +15,7 ± 15,9 | 13 / 5 (p = 0,096) |
| OpenCode | SWE-bench Pro (hard 51) | 51 | 47,1 % | 66,7 % | +19,6 ± 16,5 | 15 / 5 (p = 0,041) |
| pi | Terminal-Bench 2.1 | 85 | 52,9 % | 57,6 % | +4,7 ± 9,8 | 11 / 7 (p = 0,48) |
| Hermes Agent | Terminal-Bench 2.1 | 87 | 58,6 % | 64,4 % | +5,7 ± 10,8 | 14 / 9 (p = 0,41) |
| OpenCode | Terminal-Bench 2.1 | 86 | 54,7 % | 58,1 % | +3,5 ± 8,2 | 8 / 5 (p = 0,58) |
| Todos los seis | | | | | | 67 / 37 (p = 0,004) |

Con thinking desactivado, la model card reporta una mejora media del 39,5 % al 49,0 % (71 tareas nuevas resueltas frente a 34 perdidas, p < 0,001) y entre un 53 % y un 73 % menos llamadas a herramientas por tarea. Los resultados pareados completos con thinking desactivado figuran en la model card original. El autor advierte que estas cifras no son comparables con las publicadas en la tarjeta de Qwen3.8-27B, que usa otros arneses (Terminus, Claude Code), presupuestos mayores y el SWE-bench Pro completo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Al tratarse de un adaptador sobre un modelo de 27B, el requisito dominante es el del modelo base; el adaptador añade 1,9 GB en precisión original.
- GPU recomendadas: no disponible en la información proporcionada. Para un modelo denso de 27B en contexto largo (131.072 tokens) se requiere habitualmente memoria de clase centro de datos (A100/H100) o configuraciones multi-GPU.
- GPU de consumo: no disponible. La existencia de una versión GGUF en harness-hub/Qwen3.8-27B-super-adapter-GGUF sugiere viabilidad en hardware de consumo mediante cuantización, pero el autor no publica requisitos concretos.
- Opciones de despliegue: vLLM y llama.cpp, ambas mencionadas explícitamente en la model card; también es compatible con el flujo PEFT para cargar el adaptador sobre el modelo base.
- Latencia y throughput: no disponibles. La model card solo reporta el cambio en el número de llamadas a herramientas por tarea (19–48 % menos con thinking, 53–73 % menos sin thinking), no métricas de latencia o tokens por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | SWE-bench Pro (hard 51) | Terminal-Bench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-super-adapter | LoRA fusionado sobre Qwen3.8-27B | 131.072 | 46,0–74,0 % según arnés y thinking | 48,2–63,5 % según arnés y thinking | Apache 2.0 | Hugging Face (PEFT y GGUF) |
| Qwen3.8-27B (base) | Transformer denso multimodal | 131.072 | 29,4–74,5 % según arnés y thinking | 40,0–58,8 % según arnés y thinking | no disponible en la información proporcionada | Hugging Face |
| Qwen3.8-27B-pi-adapted | LoRA especialista en pi | 131.072 (en evaluación) | 64,0 % (thinking off) | 56,5 % (thinking off) | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-hermes-adapted | LoRA especialista en Hermes Agent | 131.072 (en evaluación) | 43,1 % (thinking off) | 58,8 % (thinking off) | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-opencode-adapted | LoRA especialista en OpenCode | 131.072 (en evaluación) | 51,0 % (thinking off) | 52,4 % (thinking off) | Apache 2.0 | Hugging Face |

La comparación con modelos de otros fabricantes de la misma categoría no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está entrenado específicamente para tres arneses (pi, Hermes Agent, OpenCode); su comportamiento fuera de ellos no está evaluado.
- Con thinking desactivado y un único arnés, el especialista correspondiente supera al super-adapter en varios pares (por ejemplo, pi en SWE-bench Pro: 64,0 % frente a 46,0 %); el super-adapter solo es la mejor opción cuando se busca un compromiso multi-arnés o se usa thinking.
- Varias mejoras con thinking no alcanzan significación estadística individual (p = 0,096 en Hermes Agent con SWE-bench Pro; p = 0,41–0,58 en Terminal-Bench 2.1); solo la agregación de los seis pares resulta significativa (p = 0,004).
- Las evaluaciones usan subconjuntos reducidos (51 tareas de SWE-bench Pro hard, 82–87 de Terminal-Bench 2.1), un intento por tarea y un presupuesto de 100 pasos, por lo que la varianza es alta (intervalos de ±8 a ±16 puntos).
- La torre de visión no se sirve en las evaluaciones; el rendimiento multimodal del adaptador no está caracterizado.
- Idiomas soportados no documentados; no hay evaluación multilingüe.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; al ser un adaptador de código y terminal, los errores pueden manifestarse como comandos destructivos o parches incorrectos, por lo que se recomienda sandboxing.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.8-27B, cuya licencia no se detalla en la información disponible.
- El repositorio tiene un tamaño de 1,9 GB y 434 descargas en el momento de la consulta; es un artefacto reciente (creado el 16 de noviembre de 2026) con validación externa limitada.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter
- Versión GGUF: https://huggingface.co/harness-hub/Qwen3.8-27B-super-adapter-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de publicación con la receta completa: https://huggingface.co/blog/harness-hub/harness-adapters-at-scale
- Adaptador especialista pi: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Adaptador especialista Hermes Agent: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Adaptador especialista OpenCode: https://huggingface.co/harness-hub/Qwen3.8-27B-opencode-adapted
- Arnés pi: https://github.com/earendil-works/pi
- Arnés Hermes Agent: https://github.com/NousResearch/hermes-agent
- Arnés OpenCode: https://opencode.ai
- Dataset harness-hub/scale800-harbor: https://huggingface.co/datasets/harness-hub/scale800-harbor
- Dataset harness-hub/harness-adapters: https://huggingface.co/datasets/harness-hub/harness-adapters
- Dataset harness-hub/termgrade-train-harbor: https://huggingface.co/datasets/harness-hub/termgrade-train-harbor
- Dataset ai-and/termgrade-environments: https://huggingface.co/datasets/ai-and/termgrade-environments
