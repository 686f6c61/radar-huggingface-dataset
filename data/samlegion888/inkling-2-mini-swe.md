# SamLegion888/Inkling-2-Mini-SWE

## Resumen

Inkling-2-Mini-SWE es un ajuste fino supervisado (SFT) mediante LoRA del modelo thinkingmachines/Inkling-2-Mini, orientado a tareas de agente de ingeniería de software (SWE-agent). Lo publica el usuario SamLegion888 en Hugging Face y se ha entrenado con el dataset nebius/SWE-rebench-leaderboard-trajectories usando la pipeline Model-factory de Hermes Workflow Studio. El resultado se distribuye como modelo fusionado en BF16 (con el adaptador LoRA original incluido en el subdirectorio `adapter/`), lo que permite tanto su uso directo con transformers como la reutilización del adaptador con PEFT.

El modelo conserva la arquitectura y el tamaño del base: 26.039.734.272 parámetros (unos 26.000 millones) en formato safetensors, con un repositorio de 52,2 GB, coherente con pesos en BF16. La clase de modelo es `Inkling2ForCausalLM`, propia de la familia Inkling-2 de Thinking Machines. Se publica bajo licencia Apache 2.0, lo que facilita su uso comercial y su modificación, siempre que se respeten las condiciones de la licencia.

Su relevancia es acotada pero concreta: no es un modelo generalista nuevo, sino una especialización de un modelo base para resolución de incidencias de código y flujos de agente. Al estar entrenado sobre trayectorias del leaderboard SWE-rebench, su objetivo es mejorar el comportamiento en tareas de tipo SWE-bench (localización de fallos, edición de ficheros, ejecución de pruebas). La información publicada es escasa: no se detallan hiperparámetros de entrenamiento, número de ejemplos, longitud de secuencia ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (clase `Inkling2ForCausalLM`); detalles internos no disponibles |
| Parámetros totales | 26.039.734.272 (unos 26,04 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la model card; al ser safetensors BF16 es compatible con cuantización posterior vía herramientas externas (GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo fusionado en BF16) + adaptador LoRA en `adapter/` (PEFT) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base thinkingmachines/Inkling-2-Mini, que emplea la clase `Inkling2ForCausalLM`. No se publican detalles sobre el número de capas, dimensión oculta, mecanismo de atención ni si incorpora innovaciones como atención lineal o decodificación especulativa. Por el tamaño (26.000 millones de parámetros) y el formato BF16, se trata de un transformer denso de gran escala, pero la model card no confirma ni desmiente componentes MoE.

El entrenamiento consistió en un SFT con LoRA sobre el base congelado, seguido de la fusión de los pesos del adaptador en el modelo final. El dataset utilizado es nebius/SWE-rebench-leaderboard-trajectories, compuesto por trayectorias de resolución de tareas de software. No se especifican el número de ejemplos, los pasos de entrenamiento, la longitud máxima de secuencia, los valores de r y alpha del LoRA ni la tasa de aprendizaje: todos figuran como "n/a" en la model card. El entrenamiento se realizó en una NVIDIA RTX PRO 6000 Blackwell Server Edition, con un pico de VRAM de 51,87 GB. La evaluación publicada se limita a 3 filas reservadas (held-out), con una pérdida media de 1,0738 y una perplejidad de 2,93; se trata de una muestra muy pequeña y no constituye una evaluación robusta de capacidades.

## Capacidades

- Generación de texto conversacional y de código, heredada del modelo base Inkling-2-Mini.
- Especialización en tareas de agente de ingeniería de software: localización de fallos, edición de ficheros y razonamiento sobre repositorios, derivada del entrenamiento con trayectorias SWE-rebench.
- Soporte de tool calling y function calling: no confirmado explícitamente en la model card; debe verificarse empíricamente.
- Razonamiento multi-paso y flujos de agente: presumible por el dataset de entrenamiento, aunque sin garantías documentadas.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Resolución automática de incidencias en repositorios: el modelo puede recibir el contexto de un issue y el árbol del proyecto para proponer parches, aprovechando su entrenamiento sobre trayectorias de SWE-rebench.
- Agente de CI/CD para corrección de tests: integrado en un pipeline, puede analizar fallos de test y generar ediciones candidatas que se validen automáticamente antes de abrir un pull request.
- Asistente de revisión de código: dado un diff, el modelo puede señalar posibles errores y sugerir cambios, útil en herramientas de code review internas.
- Automatización de tareas de mantenimiento de dependencias: actualización de APIs obsoletas y refactorizaciones menores guiadas por instrucciones, con validación posterior mediante compilación y tests.
- Generación de scripts y utilidades de línea de comandos: el modelo puede producir código ejecutable para tareas de automatización, con la ventaja de estar afinado para contextos de ingeniería.
- Base para investigación en agentes SWE: al incluir el adaptador LoRA, sirve como punto de partida para experimentos de SFT adicionales sobre trayectorias propias, reutilizando el adaptador con PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica documentada es la evaluación interna sobre 3 filas reservadas (pérdida media 1,0738, perplejidad 2,93), insuficiente para comparar con otros modelos.

| Métrica | Valor | Contexto |
|---|---|---|
| Pérdida media (held-out) | 1,0738 | 3 filas reservadas |
| Perplejidad | 2,93 | 3 filas reservadas |
| Pico de VRAM en entrenamiento | 51,87 GB | RTX PRO 6000 Blackwell |

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 52 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 80 GB para contexto amplio.
- VRAM en cuantización de 8 bits: en torno a 26-28 GB; en 4 bits, en torno a 14-16 GB, aunque estas conversiones no están publicadas por el autor.
- GPU recomendadas: A100 80 GB, H100 80 GB, RTX PRO 6000 Blackwell (usada en el entrenamiento); en consumer, una RTX 4090 de 24 GB solo sería viable con cuantización agresiva y contexto reducido.
- Despliegue: transformers con PEFT para el adaptador; vLLM o TGI para el modelo fusionado; llama.cpp u Ollama requerirían conversión previa a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Inkling-2-Mini-SWE | 26,04 mil millones | no disponible | Apache 2.0 | SFT LoRA para SWE-agent |
| thinkingmachines/Inkling-2-Mini (base) | 26,04 mil millones | no disponible | no disponible | Modelo generalista |
| Otros modelos de agente SWE de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Evaluación muy limitada: solo 3 filas held-out, por lo que las métricas de pérdida y perplejidad no son representativas.
- Hiperparámetros de entrenamiento no documentados (r, alpha, learning rate, pasos, ejemplos), lo que dificulta la reproducibilidad.
- Riesgo de sobreajuste al dataset SWE-rebench y de degradación en tareas generales respecto al base.
- Riesgo de alucinación en la generación de parches y código; se recomienda validación automática con tests.
- Idiomas y longitud de contexto no especificados; no se puede asumir un rendimiento multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener condiciones adicionales que conviene revisar.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- El autor es un usuario individual (SamLegion888), no el equipo de Thinking Machines; no es un lanzamiento oficial.

## Enlaces

- Hugging Face: https://huggingface.co/SamLegion888/Inkling-2-Mini-SWE
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Dataset: https://huggingface.co/datasets/nebius/SWE-rebench-leaderboard-trajectories
- Run de entrenamiento (W&B): https://forge.coreweave.com/wandb/sam888z/inkling2-mini-swe/runs/20zz188d
