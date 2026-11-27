# mcemri/commenv-task-lab-t2

## Resumen

commenv-task-lab-t2 es un checkpoint de investigación publicado por mcemri, derivado de Qwen3-4B y entrenado con aprendizaje por refuerzo (GRPO) para experimentar con un entorno de comunicación multiagente. El escenario concreto es un ajuste de hiperparámetros colaborativo: tres copias del modelo deben seleccionar, de forma coordinada, la mejor combinación de tres ajustes sobre una red pequeña (FCNet), a partir de 27 combinaciones posibles extraídas de tablas de barrido de Syne Tune. Cada agente dispone de resultados parciales y debe compartir información por un tablero común durante un máximo de seis turnos.

El modelo parte del checkpoint final de mcemri/commenv-e1-t2-combined (entrenado previamente con puzles lógicos divididos, primero en solitario y luego en equipo) y se somete a 30 pasos adicionales de RL. Sobre 400 rondas reservadas, la tasa de acierto al nombrar la mejor combinación pasa del 15 % inicial al 39 %, 54 % y 60 % tras 10, 20 y 30 pasos, respectivamente; la coincidencia de los tres agentes en la respuesta correcta alcanza el 58 % (frente al 10 % de partida).

Es relevante como artefacto de investigación sobre coordinación y comunicación en sistemas multiagente con modelos pequeños, no como modelo de propósito general. El autor lo describe explícitamente como "checkpoints de investigación, no un producto", y advierte de que parte de la mejora puede deberse al conocimiento de las tablas de barrido subyacentes más que a una capacidad genuina de reparto de trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B); ajuste con RL (GRPO) |
| Parametros totales | 4 000 millones (aproximado, segun el modelo base Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-4B) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (carpetas export/global_step_{10,20,30}/policy); checkpoints del entrenador en 4 shards |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B, un transformer decoder-only de aproximadamente 4 000 millones de parámetros. Sobre ese modelo base, el autor aplica un ajuste fino con aprendizaje por refuerzo mediante GRPO (Group Relative Policy Optimization) durante 30 pasos, partiendo del checkpoint final de mcemri/commenv-e1-t2-combined. El entorno de entrenamiento es un juego cooperativo de selección de hiperparámetros: tres instancias del modelo (los tres agentes de un equipo) deben identificar la mejor de 27 combinaciones de tres ajustes, con resultados reales tomados de las tablas de barrido de FCNet del repositorio blackbox de Syne Tune.

Cada agente arranca con 3 resultados y puede probar hasta 3 combinaciones adicionales, una por turno; solo el agente que ejecuta una combinación ve su resultado. Los agentes se comunican por un tablero compartido durante un máximo de seis turnos y cada uno debe nombrar la mejor combinación al final. El entrenamiento se realizó sobre rondas construidas a partir de cuatro tablas de barrido, y la evaluación se hizo sobre 400 rondas reservadas pero derivadas de las mismas tablas. El autor señala dos caveats técnicos: una regla fija ajustada sobre las rondas de entrenamiento ya acierta el 39 % de las rondas reservadas sin ejecutar nada, y el equipo no aprendió a dividir el trabajo (sus nueve ejecuciones cubren de media 4,5 combinaciones no probadas distintas).

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados de Qwen3-4B.
- Coordinación multiagente mediante un tablero de comunicación compartido (hasta seis turnos).
- Selección de la mejor combinación de hiperparámetros en un espacio discreto de 27 opciones, a partir de resultados parciales observados.
- Razonamiento con información parcial y asimétrica: cada agente solo ve los resultados de las combinaciones que él mismo ejecuta.
- Capacidad de nombrar una respuesta final consensuada (los tres agentes deben indicar la mejor combinación).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente autónomo general: no documentadas; el entrenamiento está acotado al entorno descrito.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no documentados.

## Casos de uso

- Investigación en comunicación multiagente: usar el checkpoint como referencia para estudiar cómo emerge (o no) el reparto de trabajo entre agentes LLM en tareas cooperativas con información asimétrica, comparando los checkpoints de los pasos 10, 20 y 30.
- Estudio de optimización de hiperparámetros colaborativa: reproducir el entorno de selección entre 27 combinaciones sobre tablas de Syne Tune y evaluar estrategias de exploración y explotación de los agentes.
- Análisis de robustez de GRPO en modelos pequeños: comparar la curva de acierto (15 % → 39 % → 54 % → 60 %) con la línea base de una regla fija (39 %) para aislar cuánto del rendimiento proviene del aprendizaje frente al conocimiento previo de las tablas.
- Evaluación de protocolos de comunicación: modificar el número de turnos, el tamaño del tablero o las reglas de compartición y medir el impacto en la tasa de acierto del equipo.
- Reproducción de experimentos académicos: cargar los checkpoints exportados en formato Transformers para replicar los resultados publicados en rondas reservadas.
- Docencia y divulgación sobre RL con LLM: emplear un escenario acotado y verificable (tablas de resultados reales) para explicar GRPO, recompensas y coordinación entre agentes.
- Base para ajustes posteriores: continuar el entrenamiento desde los checkpoints del entrenador (con estado del optimizador) para explorar otras tareas de comunicación.

## Benchmarks y rendimiento

| Metrica | Inicial | Paso 10 | Paso 20 | Paso 30 |
|---|---|---|---|---|
| Agentes que nombran la mejor combinacion (400 rondas reservadas) | 15 % | 39 % | 54 % | 60 % |
| Equipos en los que los tres agentes aciertan | 10 % | no disponible | no disponible | 58 % |
| Linea base: regla fija ajustada en entrenamiento | 39 % | — | — | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 8,8 GB por checkpoint exportado; en precisión completa (fp16/bf16) se requiere aproximadamente 8-9 GB de VRAM, más overhead de activaciones y caché KV.
- GPU recomendadas: A100, H100 o L40S para inferencia en fp16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para fp16 en contextos moderados.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 12-16 GB de VRAM en fp16; en cuantización de 8 bits o 4 bits cabría en GPUs de 8-12 GB (no se publican variantes cuantizadas).
- Opciones de despliegue: Transformers (carga documentada con `AutoModelForCausalLM` y `AutoTokenizer` desde el subfolder `export/global_step_30/policy`); vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint, aunque al ser un modelo Transformers estándar deberían ser compatibles previa conversión.
- Almacenamiento: el repositorio completo ocupa 98,9 GB (incluye checkpoints del entrenador de 22,5 GB por paso); para inferencia basta con descargar la carpeta `export/global_step_N/policy` (8,8 GB).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| commenv-task-lab-t2 | ~4 000 M | no disponible | GRPO sobre Qwen3-4B, entorno multiagente | Apache-2.0 | Hugging Face (mcemri) |
| Qwen/Qwen3-4B (base) | ~4 000 M | no disponible en la informacion | Preentrenamiento + post-entrenamiento general | Apache-2.0 | Hugging Face (Qwen) |
| mcemri/commenv-e1-t2-combined (predecesor) | ~4 000 M | no disponible | RL sobre puzles logicos divididos, solo y en equipo | Apache-2.0 (segun model card del autor) | Hugging Face (mcemri) |

No se dispone de datos de benchmarks comparables entre estos modelos en la información proporcionada. La comparación relevante es interna: el checkpoint del paso 30 frente al estado inicial (15 % → 60 % de acierto) y frente a la regla fija (39 %).

## Limitaciones y advertencias

- Checkpoint de investigación, no un producto: el propio autor lo declara explícitamente; no está pensado para uso en producción general.
- Sesgo de evaluación: las rondas reservadas se construyen a partir de las mismas cuatro tablas de barrido que las de entrenamiento; una regla fija ya alcanza el 39 %, por lo que parte de la mejora puede deberse al conocimiento de las tablas y no a la capacidad de coordinación.
- No hay evidencia de reparto de trabajo: las nueve ejecuciones del equipo cubren de media 4,5 combinaciones no probadas distintas, lo que sugiere que los agentes no dividen eficazmente la exploración.
- Alcance muy restringido: el ajuste está acotado a un único entorno (selección entre 27 combinaciones de tres ajustes sobre FCNet); no hay garantía de transferencia a otras tareas de coordinación.
- Riesgo de alucinación: no evaluado en la información disponible; al derivar de un LLM generativo, persiste el riesgo inherente en cualquier uso fuera del entorno entrenado.
- Idiomas y contexto: no se documentan idiomas soportados ni longitud de contexto específica de este checkpoint.
- Licencia: Apache-2.0 permite uso comercial, pero al tratarse de un artefacto de investigación sin validación externa, su uso en producción no está respaldado por el autor.
- Tamaño del repositorio: 98,9 GB en total; es necesario seleccionar el subfolder correcto para evitar descargas innecesarias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mcemri/commenv-task-lab-t2
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Checkpoint predecesor: https://huggingface.co/mcemri/commenv-e1-t2-combined
- Repositorio Syne Tune (tablas de barrido FCNet, blackbox): no se proporciona enlace directo en la información disponible.
