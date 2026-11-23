# EryriLabs/Inkling-2-Mini-Pocket-8GB-GGUF

## Resumen

Inkling-2-Mini Pocket 8GB es una cuantización GGUF de 6,1 GB del modelo Inkling-2-Mini de Thinking Machines, publicada por EryriLabs con el objetivo explícito de que el modelo quepa en tarjetas gráficas de 8 GB de VRAM. El modelo base es un transformer de mezcla de expertos (MoE) con bucles ("looped mixture-of-experts"): reutiliza la misma pila de capas en más de una pasada y cada capa contiene 128 expertos, de los que activa 8 por token. Cuenta con 19.953.323.520 parámetros totales según los pesos safetensors del modelo original.

La innovación de esta ficha no está en el modelo base sino en el proceso de cuantización: partiendo del cuantizado de 1 bit de Unsloth (UD-IQ1_S, 7,76 GB), el autor midió qué expertos selecciona el modelo al resolver tareas de agente de código y eliminó los 32 expertos menos usados de cada capa, dejando 96 expertos por capa y recortando el router en consecuencia. Los expertos conservados son idénticos byte a byte a los de Unsloth, sin reentrenamiento ni recuantización, y el ahorro resultante es de 1,6 GB.

Es relevante ahora porque demuestra una vía práctica de reducir el tamaño de un MoE de 1 bit mediante poda guiada por uso real, manteniendo una calidad cercana en código (151/164 en HumanEval frente a 156/164 del cuantizado original) y permitiendo ejecutar un modelo de casi 20.000 millones de parámetros totales en hardware de consumo. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) con bucles de capas reutilizadas; 128 expertos por capa en el modelo base, 96 en esta ficha; 8 expertos activos por token |
| Parametros totales | 19.953.323.520 (modelo base); no disponible el recuento exacto tras la poda de expertos |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens en la configuración recomendada (probado también con 2048 en Jetson Orin Nano Super); no disponible el máximo nativo del modelo base |
| Tipos de cuantizacion | 1 bit (UD-IQ1_S de Unsloth como base), con poda de expertos y router recortado; pesos conservados byte a byte |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini, de Thinking Machines, es un transformer de mezcla de expertos con una particularidad estructural: reutiliza la misma pila de capas a lo largo de más de una pasada (bucle), y cada capa contiene 128 expertos de los que activa 8 por token. Esta ficha conserva el bucle tal y como fue entrenado y no modifica la topología del modelo, solo el número de expertos disponibles por capa.

El proceso de esta cuantización parte del archivo UD-IQ1_S de Unsloth y aplica una poda selectiva: el autor ejecutó el modelo completo sobre sesiones de agente de código y contó la frecuencia con la que cada experto era seleccionado en cada capa, usando 300 muestras (614.000 tokens) de las trayectorias SWE-smith mini-swe-agent. Con esas mediciones eliminó los 32 expertos menos usados de cada capa y recortó el router para que coincida con los 96 restantes. Como no existía herramienta para eliminar expertos de un GGUF ya terminado, el autor escribió una que copia los bytes de los expertos conservados directamente, sin recuantizar. No hay datos disponibles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional (etiqueta `conversational` en el repo).
- Generación de código: es la capacidad en la que se centró la poda de expertos y la que se evaluó con HumanEval.
- Razonamiento con modo de pensamiento: el modelo tiende a razonar de forma extensa antes de responder, controlable mediante `--reasoning-budget`.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repo).
- Soporte de plantillas de chat Jinja en llama.cpp (`--jinja`).
- Capacidades multilingües: no disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: la poda se calibró sobre trayectorias de agente de código (SWE-smith mini-swe-agent), lo que sugiere uso en ese dominio, aunque no se documentan formalmente las capacidades de agente.
- Visión: no disponible; el autor indica que es solo texto y que no ha probado entrada de imágenes.

## Casos de uso

- Asistencia de código en estaciones de trabajo con GPU de 8 GB: el modelo puede generar código y resolver problemas de programación en tarjetas de consumo, con un rendimiento de 151/164 en HumanEval, suficiente para autocompletado y generación de funciones en local.
- Agentes de código en local: calibrado sobre trayectorias de agente de código, puede emplearse en bucles de edición y ejecución de parches en entornos con recursos limitados, siempre con `--reasoning-budget` para evitar que agote los tokens pensando.
- Despliegue en dispositivos edge: probado en Jetson Orin Nano Super con JetPack 6.2, generando 8,3 tokens/s con todas las capas en GPU y contexto de 2048, útil para prototipos de asistencia en robótica o dispositivos embebidos.
- Servidor de inferencia ligero con llama.cpp: mediante `llama-server` con plantilla Jinja y API compatible con endpoints, se puede montar un servicio local de generación de texto y código en una máquina con 8 GB de VRAM.
- Evaluación e investigación de poda de MoE: sirve como caso de estudio reproducible de poda guiada por uso de expertos, comparando perplejidad y coincidencia de token superior frente al cuantizado original.
- Generación de código en pipelines de CI/CD con presupuesto de memoria ajustado: al ocupar unos 6,7 GB con contexto de 4096 tokens en una RTX 3090 Ti, puede integrarse en runners con GPU modesta para tareas de generación o revisión de código.
- Experimentación con cuantización de 1 bit: permite comparar el comportamiento de un MoE de 1 bit podado frente al de 128 expertos en tareas de código y texto general.

## Benchmarks y rendimiento

| Modelo | Expertos | Tamano | HumanEval |
|---|---|---|---|
| Unsloth UD-IQ1_S | 128 | 7,76 GB | 156 / 164 |
| Pocket | 96 | 6,12 GB | 151 / 164 |
| Pocket (variante de 88 expertos, descartada) | 88 | no disponible | 142 / 164 |

Medición de HumanEval: los 164 problemas, decodificación greedy, máximo de 4096 tokens, `--reasoning-budget 1024`, código generado ejecutado en un contenedor aislado y ambos archivos probados de la misma forma en la misma máquina.

| Modelo | Perplejidad | Coincidencia de token superior |
|---|---|---|
| Referencia de 5 bits | 2,356 | — |
| Unsloth UD-IQ1_S | 2,438 | 93,2 % |
| Pocket | 2,499 | 91,8 % |

Perplejidad medida sobre 27.000 tokens de sesiones de código reservadas para evaluación.

Rendimiento en hardware: en una RTX 3090 Ti ocupa unos 6,7 GB de VRAM con contexto de 4096 tokens y ronda los 50 tokens/s (medición no rigurosa según el autor). En Jetson Orin Nano Super, con todas las capas en GPU y contexto de 2048, genera 8,3 tokens/s; el modelo cargó aproximadamente una de cada seis veces por falta de memoria en los últimos 200 MB.

## Requisitos de hardware

- VRAM estimada: unos 6,7 GB con contexto de 4096 tokens en una RTX 3090 Ti; el archivo pesa 6,1 GB.
- GPU recomendadas: RTX 3090 Ti (probada), tarjetas con 8 GB de VRAM dedicada (objetivo del proyecto, no probado por el autor), Jetson Orin Nano Super (probada, con memoria compartida de 8 GB y aproximadamente 6,5 GB libres con escritorio activo).
- Cabe en GPU de consumo de 8 GB según la lectura de memoria del autor, aunque no se ha verificado en una tarjeta de 8 GB dedicada.
- Opciones de despliegue: llama.cpp, con compilación del 21 de noviembre de 2026 o posterior; `llama-server` con `--jinja`, `-ngl 99`, `-c 4096`, `-b 256 -ub 256` y `--reasoning-budget 1024`.
- En Jetson Orin Nano Super se requieren ajustes adicionales: `GGML_CUDA_DISABLE_GRAPHS=1`, `-c 2048 -np 1 -b 64 -ub 64`, `--cache-ram 0`, `--ctx-checkpoints 0`.
- Latencia y throughput: aproximadamente 50 tokens/s en RTX 3090 Ti con contexto de 4096; 8,3 tokens/s en Jetson Orin Nano Super con contexto de 2048.
- El lote pequeño (`-b 256 -ub 256`) es lo que mantiene el uso de memoria por debajo de 8 GB; puede aumentarse si hay margen.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | HumanEval | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini Pocket (esta ficha) | 19.953.323.520 en el base; no disponible tras la poda | 4096 en la configuración recomendada | 151 / 164 | Apache 2.0 | GGUF, 6,12 GB |
| Unsloth UD-IQ1_S de Inkling-2-Mini | 19.953.323.520 | no disponible | 156 / 164 | Apache 2.0 | GGUF, 7,76 GB |
| Referencia de 5 bits de Inkling-2-Mini | 19.953.323.520 | no disponible | no disponible | Apache 2.0 | no disponible |

No se dispone de datos de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los expertos se seleccionaron midiendo uso en tareas de código; el autor no ha medido la pérdida en otros tipos de texto y espera que sea mayor que en código.
- Es un cuantizado de 1 bit con un cuarto de los expertos eliminados; cabe esperar peor rendimiento que los cuantizados mayores en tareas difíciles.
- Solo texto: el autor no ha probado entrada de imágenes.
- Reducir más expertos degrada la calidad: una variante de 88 expertos obtuvo 142/164 en HumanEval.
- Sin `--reasoning-budget 1024` el modelo tiende a pensar hasta agotar los tokens y devolver una respuesta vacía; `--reasoning off` no cumple la misma función.
- Requiere una compilación de llama.cpp del 21 de noviembre de 2026 o posterior.
- En Jetson Orin Nano Super la carga falla con frecuencia por falta de memoria; el autor no ha probado si detener el escritorio lo hace fiable.
- El rendimiento en una tarjeta de 8 GB dedicada no está verificado; la cifra de 8 GB procede de la lectura de memoria en una RTX 3090 Ti.
- La velocidad de aproximadamente 50 tokens/s no se midió de forma rigurosa.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: no cuantificado en la información proporcionada.
- Licencia Apache 2.0, permisiva para uso comercial, heredada del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EryriLabs/Inkling-2-Mini-Pocket-8GB-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizado de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Dataset de trayectorias usado para la poda: https://huggingface.co/datasets/Kwai-Klear/SWE-smith-mini_swe_agent_plus-trajectories-66k
