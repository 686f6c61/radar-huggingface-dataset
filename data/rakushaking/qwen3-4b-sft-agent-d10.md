# Rakushaking/Qwen3-4b-SFT-Agent-d10

## Resumen

Qwen3-4b-SFT-Agent-d10 es un adaptador LoRA publicado por el usuario Rakushaking sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. No se trata de un modelo completo, sino de pesos de adaptador (formato PEFT/safetensors) que deben cargarse junto al modelo base de 4.022.468.096 parámetros. Su objetivo es especializar al modelo en tareas de agente multi-turno, concretamente en entornos ALFWorld (manipulación de objetos domésticos) y DBBench (operaciones sobre bases de datos), donde el modelo debe interpretar observaciones del entorno, seleccionar acciones, invocar herramientas y recuperarse de errores.

El ajuste se realizó con LoRA y Unsloth, con rango r=64, alpha=128, longitud máxima de secuencia de 3072 tokens, 2 épocas y learning rate 2e-05. La pérdida se aplica a todos los turnos del asistente en la trayectoria multi-turno, lo que permite aprender el bucle completo de observación-acción-recuperación, no solo la respuesta final.

Es relevante para quien necesite un agente ligero y desplegable en hardware modesto, ya que parte de un modelo de 4B con licencia Apache 2.0. No obstante, el repositorio no incluye resultados de benchmarks ni métricas de evaluación, y el adaptador está entrenado únicamente en inglés y sobre dos dominios muy específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B-Instruct-2507) con adaptador LoRA (PEFT) |
| Parametros totales | 4.022.468.096 (modelo base); el adaptador LoRA se distribuye aparte |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 3072 tokens de entrenamiento; el contexto nativo del base Qwen3-4B-Instruct-2507 no se especifica en la informacion disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos safetensors del adaptador; no se listan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el base Qwen/Qwen3-4B-Instruct-2507 por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parámetros. El entrenamiento emplea LoRA con r=64 y alpha=128 sobre el modelo base en precisión completa, usando Unsloth como framework de optimización. La secuencia máxima de entrenamiento es de 3072 tokens, con 2 épocas y learning rate 2e-05. La innovación principal del ajuste es que la función de pérdida se calcula sobre todos los turnos del asistente en trayectorias multi-turno, de modo que el modelo aprende a emitir observaciones del entorno, elegir acciones, usar herramientas y corregir errores, en lugar de limitarse a imitar la respuesta final.

Los datos de entrenamiento provienen de dos datasets: u-10bei/sft_alfworld_trajectory_dataset_v5 (trayectorias de ALFWorld v5, solo episodios exitosos) y u-10bei/dbbench_sft_dataset_react_v4 (DBBench v4, todas las muestras). Ambos se distribuyen bajo licencia MIT. No se documenta el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO posteriores al SFT.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno en inglés.
- Ejecución de tareas de agente en entornos tipo ALFWorld: interpretación de observaciones, selección de acciones y recuperación tras acciones fallidas.
- Operaciones sobre bases de datos en el marco de DBBench, con formato ReAct (razonamiento y acción intercalados).
- Uso de herramientas (tool calling / function calling) implícito en el formato de trayectorias de entrenamiento.
- Razonamiento multi-paso orientado a completar episodios completos, no solo respuestas puntuales.
- Capacidades generales heredadas del base Qwen3-4B-Instruct-2507 (no evaluadas específicamente en este adaptador).
- No se documentan capacidades de visión, audio ni modo thinking explícito en la información disponible.

## Casos de uso

- Agentes domésticos simulados: el adaptador puede integrarse en entornos tipo ALFWorld para resolver tareas de manipulación de objetos (coger, mover, encender) siguiendo instrucciones en lenguaje natural, aprovechando el entrenamiento sobre trayectorias exitosas.
- Automatización de consultas y operaciones sobre bases de datos: en el marco de DBBench, el modelo puede generar secuencias de acciones sobre un motor de base de datos, interpretar resultados y corregir consultas erróneas.
- Prototipado de agentes ReAct: sirve como punto de partida ligero para experimentar con bucles de razonamiento-acción antes de escalar a modelos mayores.
- Evaluación de pipelines de agentes en local: al ser un adaptador sobre un base de 4B, permite iterar sobre lógica de orquestación (herramientas, memoria, recuperación de errores) con requisitos de hardware reducidos.
- Investigación en fine-tuning de agentes: útil para reproducir o comparar recetas de SFT multi-turno con LoRA (r=64, alpha=128) sobre Qwen3-4B.
- Despliegue en entornos con recursos limitados: al requerir únicamente el base de 4B más un adaptador pequeño, encaja en escenarios donde no es viable servir modelos de 30B o superiores.
- Generación de datos sintéticos de trayectorias: el modelo puede emplearse para producir episodios de agente que luego se filtren y reutilicen en entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito en ALFWorld, DBBench ni evaluaciones generales (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: el base de 4B en fp16 requiere aproximadamente 8 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 4 bits podría situarse en torno a 3-4 GB, aunque el adaptador se distribuye en safetensors y no se publican versiones GGUF.
- GPU recomendadas: A100, H100 o L40S para despliegue con throughput alto; RTX 4090 o RTX 3090 para inferencia en fp16 con comodidad.
- GPU de consumo: cabe en GPUs consumer con 12-16 GB de VRAM (RTX 4070 Ti, RTX 4080, RTX 4090) en fp16; en 8 GB requeriría cuantización del base, no publicada en este repo.
- Opciones de despliegue: transformers + peft (según el ejemplo de la model card), vLLM o TGI fusionando previamente el adaptador con el base; llama.cpp u Ollama solo si se genera una versión GGUF del modelo fusionado, que no está disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Rakushaking/Qwen3-4b-SFT-Agent-d10 | 4B (base) + adaptador LoRA | 3072 en entrenamiento | Agente ALFWorld/DBBench | apache-2.0 | safetensors (PEFT) |
| Qwen/Qwen3-4B-Instruct-2507 | 4B | no disponible en esta ficha | Instrucciones generales | apache-2.0 | safetensors |
| Adaptadores de agente sobre bases de 7B-8B (p. ej. variantes sobre Llama 3.1 8B) | 7-8B | variable | Agente / tool use | variable según base | PEFT / GGUF |

La comparación directa con alternativas concretas no está disponible en la información proporcionada; los datos de la tercera fila son orientativos y no proceden de una fuente verificada en esta búsqueda.

## Limitaciones y advertencias

- El repositorio contiene únicamente pesos de adaptador LoRA; es imprescindible cargar el base Qwen/Qwen3-4B-Instruct-2507 por separado, lo que añade complejidad operativa frente a un modelo fusionado.
- Entrenado exclusivamente en inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Especialización muy acotada a ALFWorld y DBBench; fuera de esos dominios el adaptador puede degradar el comportamiento general del base.
- No se publican métricas de éxito, tasas de alucinación ni evaluaciones de robustez; no hay evidencia cuantitativa de mejora frente al base.
- Riesgo de alucinación en la selección de acciones o en la interpretación de observaciones, especialmente ante estados del entorno no vistos en entrenamiento.
- El dataset de ALFWorld contiene solo trayectorias exitosas, lo que puede sesgar al modelo hacia secuencias que no representan recuperaciones reales de errores en entornos más ruidosos.
- Licencia Apache 2.0 para el adaptador, pero el uso debe cumplir también los términos del modelo base y la licencia MIT de los datasets de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria ni mantenimiento demostrado.
- No se ofrecen versiones cuantizadas (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de gama baja.

## Enlaces

- Hugging Face: https://huggingface.co/Rakushaking/Qwen3-4b-SFT-Agent-d10
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset ALFWorld v5: https://huggingface.co/datasets/u-10bei/sft_alfworld_trajectory_dataset_v5
- Dataset DBBench v4: https://huggingface.co/datasets/u-10bei/dbbench_sft_dataset_react_v4
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
