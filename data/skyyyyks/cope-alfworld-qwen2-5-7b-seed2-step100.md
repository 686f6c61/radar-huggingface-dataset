# skyyyyks/cope-alfworld-qwen2.5-7b-seed2-step100

## Resumen

CoPE on ALFWorld: Qwen2.5-7B-Instruct, seed 2, step 100 es un ajuste fino del modelo Qwen2.5-7B-Instruct desarrollado por el usuario skyyyyks, resultado de aplicar el método CoPE (GRPO más una pérdida auxiliar de predicción de acciones) sobre el entorno de tareas de agente ALFWorld. El modelo está pensado como un actor entrenado para resolver tareas de manipulación de objetos y navegación en entornos textuales tipo ALFWorld, no como un modelo de propósito general.

Se trata de un checkpoint intermedio: el paso 100 de 264 (2 épocas) de una ejecución con semilla 2. Los pesos se han fusionado desde el checkpoint FSDP de verl a un modelo bf16 de Hugging Face, por lo que solo contiene pesos, sin estado del optimizador ni del dataloader. Esto implica que no puede reanudarse la ejecución exactamente desde este punto.

Con 7.615.616.512 parámetros y licencia Apache 2.0, hereda la arquitectura y la ventana de contexto del Qwen2.5-7B-Instruct base. Su interés es fundamentalmente de investigación: sirve para estudiar el efecto de CoPE en el entrenamiento con RL de agentes sobre ALFWorld y como referencia de un punto concreto de la curva de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, fusionado desde FSDP de verl) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only de aproximadamente 7.600 millones de parámetros. Sobre esa base se aplica CoPE (código en https://github.com/ulab-uiuc/CoPE), que en este contexto equivale a GRPO (Group Relative Policy Optimization) más una pérdida auxiliar de predicción de acciones (action forecast). El entrenamiento se realizó con verl sobre ALFWorld, un entorno de tareas textuales de agente.

Los ajustes de entrenamiento documentados son: batch de 16 prompts × 8 rollouts; learning rate 1e-6; coeficiente KL 0.001 con low_var_kl; entropía 0.002; rollouts de hasta 20 rondas con 512 tokens por turno. La pérdida de predicción de acciones usa coeficiente 0.01, K 3, gate `wins`, group norm activado y skip invalid activado. El entrenamiento se ejecutó en 4× H20. El checkpoint corresponde al paso 100 de 264 (2 épocas), semilla 2. La puntuación de entrenamiento en ese paso es 0.953 (media de los pasos 91-100: 0.922), medida como `critic/score/mean`, es decir, la tasa de éxito de ALFWorld sobre el batch de entrenamiento (16 tareas × 8 rollouts), no una evaluación en held-out.

## Capacidades

- Generación de texto conversacional y de instrucciones, heredada del modelo base Qwen2.5-7B-Instruct.
- Ejecución de tareas de agente en entornos textuales tipo ALFWorld: navegación, localización y manipulación de objetos mediante acciones discretas.
- Razonamiento multi-paso dentro de episodios de hasta 20 rondas y 512 tokens por turno, según la configuración de entrenamiento.
- Predicción de acciones como señal auxiliar durante el entrenamiento (no es una capacidad de inferencia expuesta de forma independiente).
- Soporte de tool calling / function calling: no disponible en la información proporcionada para este checkpoint.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación sobre RL para agentes: reproducir y analizar la curva de entrenamiento de CoPE en ALFWorld comparando este paso 100 con otros checkpoints de la misma ejecución.
- Estudio de la pérdida auxiliar de predicción de acciones: evaluar cómo afecta la señal de action forecast al comportamiento del actor en tareas de manipulación de objetos.
- Baseline para comparativas de algoritmos de RL: usar este checkpoint como referencia de GRPO+CoPE frente a GRPO puro u otros métodos en ALFWorld.
- Análisis de checkpoints intermedios: examinar qué habilidades de agente emergen en el paso 100 frente a pasos posteriores de la misma ejecución (hasta el 264).
- Generación de trayectorias sintéticas: producir rollouts de acciones en entornos textuales para aumentar datos de entrenamiento de otros agentes.
- Evaluación de robustez de agentes: someter al modelo a variaciones del entorno ALFWorld para medir la generalización de la política aprendida.
- Docencia y divulgación: ilustrar el funcionamiento de GRPO con recompensas basadas en éxito de tarea en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica documentada es la puntuación de entrenamiento (no held-out):

| Metrica | Valor |
|---|---|
| `critic/score/mean` en el paso 100 | 0.953 |
| Media de `critic/score/mean` en pasos 91-100 | 0.922 |
| Naturaleza de la metrica | Tasa de exito en ALFWorld sobre 16 tareas × 8 rollouts del batch de entrenamiento |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 20-24 GB o más.
- GPU recomendadas: A100 (40/80 GB), H100, H20 (usadas en el entrenamiento), L40S; en consumer, RTX 4090 (24 GB) puede alojar los pesos en bf16 con margen ajustado.
- Cuantización: no se han publicado versiones GGUF ni cuantizadas; sería necesario generarlas a partir de los safetensors.
- Opciones de despliegue: transformers con `device_map="auto"` y `torch_dtype="bfloat16"` (documentado por el autor); vLLM, TGI, llama.cpp u Ollama no están documentados para este checkpoint, aunque al ser compatible con transformers y TGI (tag `text-generation-inference`) podría integrarse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoPE ALFWorld Qwen2.5-7B seed2 step100 (este) | 7,6 B | no disponible | GRPO + action forecast sobre ALFWorld, paso 100/264 | apache-2.0 | Hugging Face, 0 descargas |
| Qwen2.5-7B-Instruct (base) | 7,6 B | no disponible en la informacion | SFT + RLHF de proposito general | apache-2.0 | Ampliamente disponible |
| Otros checkpoints de la misma ejecucion CoPE | 7,6 B | no disponible | Mismo esquema, distintos pasos/semillas | apache-2.0 | Repositorio del autor |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio de investigación, no un modelo listo para producción: no se ha evaluado en held-out y la métrica reportada es de entrenamiento.
- Solo contiene pesos: no hay estado del optimizador ni del dataloader, por lo que no puede reanudarse el entrenamiento exactamente desde este punto.
- `generation_config.json` corresponde al modelo base, no a una configuración específica del ajuste.
- El ajuste está especializado en ALFWorld; su comportamiento fuera de ese entorno no está documentado y probablemente degrade respecto al modelo base.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al heredar de Qwen2.5-7B-Instruct arrastra los sesgos del modelo base.
- Idiomas soportados: no documentados; el entrenamiento en ALFWorld es en inglés.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación held-out y la naturaleza experimental del checkpoint desaconsejan su uso en producción sin validación adicional.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/skyyyyks/cope-alfworld-qwen2.5-7b-seed2-step100
- Código de CoPE: https://github.com/ulab-uiuc/CoPE
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- verl (framework de entrenamiento): no disponible en la información proporcionada
- ALFWorld (entorno): no disponible en la información proporcionada
