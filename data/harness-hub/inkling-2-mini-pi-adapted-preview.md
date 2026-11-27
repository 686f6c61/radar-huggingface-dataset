# harness-hub/Inkling-2-Mini-pi-adapted-preview

## Resumen

Inkling-2-Mini-pi-adapted-preview es un adaptador LoRA sobre el modelo multimodal thinkingmachines/Inkling-2-Mini, desarrollado por harness-hub y entrenado con aprendizaje por refuerzo (AsyncGRPO de TRL) para funcionar como el modelo subyacente del agente de programación pi (earendil-works/pi). El adaptador está pensado para operar con esfuerzo de razonamiento `none`, es decir, sin cadena de pensamiento explícita, priorizando la eficiencia en la resolución de tareas de ingeniería de software y terminal.

El problema que aborda no es tanto la precisión bruta como la economía de trabajo: según la model card, en las tareas que ambos modelos resuelven, el adaptador realiza un 27 % menos de llamadas a herramientas en Terminal-Bench 2.1 y un 39 % menos en SWE-bench Pro, con un 37 % y un 47 % menos de tokens generados respectivamente. Las mejoras de exactitud (de 54,0 % a 56,3 % en Terminal-Bench 2.1 y de 70,6 % a 74,5 % en SWE-bench Pro) quedan dentro del ruido estadístico según el propio autor, mientras que las ganancias de eficiencia son consistentes.

Es relevante ahora porque demuestra un patrón práctico de adaptación de un modelo multimodal open source a un agente concreto mediante RL con entornos ejecutables (Harbor, OpenEnv, sandboxes de Hugging Face), y porque el adaptador es ligero (repo de 0,1 GB) y desplegable con vLLM o llama.cpp junto al modelo base, con licencia Apache 2.0. El tamaño y la arquitectura del modelo base no se detallan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r = 32, proyecciones de atención) sobre el modelo base thinkingmachines/Inkling-2-Mini; arquitectura del base no disponible |
| Parametros totales | No disponible (el adaptador LoRA ocupa 0,1 GB en el repo) |
| Parametros activos | No disponible |
| Longitud de contexto | Hasta 131.072 tokens en el despliegue de referencia con vLLM (`--max-model-len 131072`) |
| Tipos de cuantizacion | No disponible en la model card; existe una versión GGUF para llama.cpp en harness-hub/Inkling-2-Mini-pi-adapted-preview-GGUF |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); pesos con nombres de módulo para vLLM en el subdirectorio `vllm/`; GGUF en repo separado |

## Arquitectura y entrenamiento

El adaptador se entrena con AsyncGRPO (el entrenador asíncrono de Group Relative Policy Optimization de TRL) aplicado como LoRA de rango 32 sobre las proyecciones de atención del modelo base. El entrenamiento se realizó sobre 1.050 tareas de Harbor: tareas de corrección de bugs del dataset scale800 y tareas de terminal del dataset TermGrade. Las tareas se ejecutaron en HF Sandboxes a través de OpenEnv, con las llamadas a herramientas filtradas por safeagents. Se realizaron 200 pasos con tasa de aprendizaje 2e-5 y 8 rollouts por tarea, sobre 2 GPU NVIDIA B300. La receta de entrenamiento está publicada en el espacio trl-lib/trl-recipes.

La innovación destacable no es arquitectónica sino de metodología: RL sobre entornos ejecutables reales (terminal y repositorio de código) con un agente concreto (pi) y un ajuste de esfuerzo de razonamiento fijado en `none`, lo que optimiza el comportamiento del agente hacia trayectorias más cortas en llamadas a herramientas y tokens generados. El modelo base es multimodal (pipeline image-text-to-text), por lo que el adaptador hereda la capacidad de procesar imágenes además de texto.

## Capacidades

- Generación de texto y razonamiento orientado a tareas de ingeniería de software y uso de terminal.
- Ejecución de tareas de corrección de bugs y resolución de issues en repositorios (entrenado sobre scale800 y TermGrade).
- Uso intensivo de herramientas (tool calling / function calling): el adaptador está optimizado para reducir el número de llamadas necesarias para resolver una tarea.
- Comportamiento como agente multi-paso dentro de pi, con bucle de observación-acción sobre terminal y sistema de ficheros.
- Procesamiento de imagen y texto (image-text-to-text), heredado del modelo base.
- Modo de razonamiento configurable mediante `reasoning_effort`; el adaptador está entrenado y evaluado únicamente con `none`.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente de programación en local: desplegar el adaptador con vLLM y el parser de herramientas de Inkling para que pi resuelva issues y tareas de terminal contra un repositorio real, reduciendo el coste por tarea gracias al menor número de llamadas y tokens.
- Corrección automática de bugs en CI/CD: integrar el agente en un pipeline que reciba un fallo de test o un issue y genere un parche, aprovechando el entrenamiento específico sobre tareas de bug fixing de scale800.
- Automatización de tareas de terminal: ejecutar secuencias de comandos de administración, diagnóstico o refactorización guiadas por el modelo, con el bucle de herramientas de pi y el filtrado de safeagents.
- Evaluación de agentes y reproducibilidad: usar la receta publicada en trl-lib/trl-recipes y los datasets de Harbor para reproducir el entrenamiento o adaptar el mismo esquema a otros agentes.
- Sustitución económica de un agente propietario: al ser un adaptador Apache 2.0 sobre un base abierto, permite autohospedar el agente sin depender de APIs externas, con contexto de hasta 131.072 tokens para repositorios grandes.
- Investigación en RL para agentes: servir como punto de partida para estudiar cómo el AsyncGRPO con recompensas de entorno afecta a la longitud de las trayectorias y al uso de herramientas.
- Asistencia multimodal en flujos de desarrollo: al heredar la entrada image-text-to-text, puede incorporar capturas de pantalla o diagramas junto al contexto textual en tareas de depuración.

## Benchmarks y rendimiento

| Benchmark | Modelo base | Este adaptador (paso 200) | Diferencia (95 %) | Llamadas a herramientas en tareas que ambos resuelven |
|---|---|---|---|---|
| Terminal-Bench 2.1 (87 tareas) | 54,0 % | 56,3 % | +2,3 ± 7,8 | −27 % |
| SWE-bench Pro, hard 51 | 70,6 % | 74,5 % | +3,9 ± 10,9 | −39 % |

Medición con pi, esfuerzo de razonamiento `none`, un intento por tarea a temperatura 0,8, comparación emparejada contra el modelo base. El autor señala que las ganancias de exactitud están dentro del ruido, mientras que las de eficiencia no. Además, se reporta un 37 % y un 47 % menos de tokens generados en Terminal-Bench 2.1 y SWE-bench Pro respectivamente.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 0,1 GB; los requisitos de VRAM vienen determinados por el modelo base Inkling-2-Mini, cuyo tamaño no se especifica en la información disponible.
- Entrenamiento de referencia: 2 GPU NVIDIA B300.
- Despliegue recomendado: vLLM con soporte LoRA (`--enable-lora --max-lora-rank 32`), parser de tool calling y de razonamiento de Inkling, y `--max-model-len 131072`. Se requiere una versión nightly de vLLM (probada con el commit `b976fff86af82c559b19aa676f52ea193eb0c188`).
- Alternativa: llama.cpp mediante el repo GGUF harness-hub/Inkling-2-Mini-pi-adapted-preview-GGUF.
- Compatibilidad con GPU de consumo: no disponible; depende del tamaño del modelo base y de la cuantización elegida.
- Latencia y throughput: no disponibles; la model card solo reporta reducciones relativas de llamadas a herramientas y tokens generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-pi-adapted-preview | No disponible (LoRA r=32 sobre Inkling-2-Mini) | 131.072 tokens en el despliegue de referencia | Terminal-Bench 2.1: 56,3 %; SWE-bench Pro hard: 74,5 % | Apache 2.0 | Hugging Face (adaptador + GGUF) |
| thinkingmachines/Inkling-2-Mini (base) | No disponible | No disponible | Terminal-Bench 2.1: 54,0 %; SWE-bench Pro hard: 70,6 % | No disponible en la información proporcionada | Hugging Face |
| Otros adaptadores de agente comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente con el agente pi y con `reasoning_effort` fijado en `none`; su comportamiento fuera de esa configuración no está validado.
- Los benchmarks son pequeños: los intervalos de confianza al 95 % sobre las diferencias de exactitud son de aproximadamente ±8 y ±11 puntos, por lo que las mejoras de precisión no son concluyentes.
- El adaptador no fue entrenado con la Responses API; debe usarse con `"api": "openai-completions"`.
- Requiere una versión nightly de vLLM para servir Inkling 2 Mini; la compatibilidad con versiones estables no está garantizada.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado; al ser un agente que ejecuta comandos, conviene mantener el filtrado de llamadas (safeagents) y aislamiento en sandbox.
- Idiomas soportados y limitaciones idiomáticas: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener condiciones propias que deben verificarse por separado.
- Repo con 0 descargas y estado "preview": no debe considerarse una versión estable para producción sin validación adicional.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/harness-hub/Inkling-2-Mini-pi-adapted-preview
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Versión GGUF: https://huggingface.co/harness-hub/Inkling-2-Mini-pi-adapted-preview-GGUF
- Dataset scale800: https://huggingface.co/datasets/harness-hub/scale800-harbor
- Dataset TermGrade: https://huggingface.co/datasets/harness-hub/termgrade-train-harbor
- Agente pi: https://github.com/earendil-works/pi
- Documentación de AsyncGRPO en TRL: https://huggingface.co/docs/trl/main/en/async_grpo_trainer
- OpenEnv: https://github.com/huggingface/OpenEnv
- safeagents: https://github.com/huggingface/safeagents
- Receta de entrenamiento: https://huggingface.co/spaces/trl-lib/trl-recipes/tree/main/recipes/harness-adapters/Inkling-2-Mini
