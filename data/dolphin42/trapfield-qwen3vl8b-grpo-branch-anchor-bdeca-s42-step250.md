# Dolphin42/trapfield-qwen3vl8b-grpo-branch-anchor-bdecA-s42-step250

## Resumen

Este repositorio contiene un checkpoint de investigación publicado por el usuario Dolphin42: un ajuste fino del modelo visión-lenguaje Qwen/Qwen3-VL-8B-Instruct mediante GRPO (Group Relative Policy Optimization) durante 250 pasos, partiendo de un warm start denominado TrapField (checkpoint-188). El modelo tiene 8.767.123.696 parámetros (unos 8,77 mil millones) y se distribuye bajo licencia Apache 2.0 con pesos en safetensors que ocupan 17,5 GB en el repositorio.

El objetivo del experimento no es obtener un asistente generalista, sino estudiar una técnica de regularización concreta: una KL forward (lambda 0,1) aplicada a la fila que decide la rama de comportamiento del agente, es decir, la primera palabra del bloque think, donde compiten las aperturas de las demostraciones "Current position" (uso de herramienta) y "Start S at" (respuesta directa), con la configuración `BRANCH_POSITIONS=A BRANCH_A_OFFSET=2`.

Su relevancia es metodológica: el brazo regularizado (`warm3_bdecA`, semilla 42) termina con una cuota de uso de herramienta del 28% y una recompensa de 0,92, mientras que las ejecuciones sin regularizar desde el mismo warm start colapsan al 2% o al 100% de uso de herramienta. Es, por tanto, un artefacto para reproducir y extender experimentos de aprendizaje por refuerzo sobre agentes con tool calling, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (etiqueta `qwen3_vl`), heredada de Qwen/Qwen3-VL-8B-Instruct |
| Parametros totales | 8.767.123.696 (8,77 mil millones) |
| Parametros activos | No aplica: no es un modelo MoE segun la informacion disponible |
| Longitud de contexto | No disponible (no especificada en la model card; heredada del modelo base) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones empaquetadas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (17,5 GB en el repositorio; solo pesos) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-VL-8B-Instruct, un transformer multimodal capaz de procesar texto e imágenes. Sobre esa base se aplicó un entrenamiento de refuerzo con GRPO durante 250 pasos, ejecutado con la librería ms-swift, partiendo de un warm start ya entrenado (TrapField checkpoint-188). No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases previas de SFT, RLHF o DPO.

La innovación destacable es la estrategia de anclaje: en lugar de regularizar toda la política o una fila arbitraria, se aplica una penalización KL forward con lambda 0,1 contra el warm start en la posición exacta donde el modelo decide la rama de comportamiento (la primera palabra del bloque think). El autor reporta que anclar la fila posterior a `</think>` (la fila de decisión de FrozenLake) no produce efecto en esta tarea, lo que sugiere que la posición de anclaje es determinante. El resultado es un punto intermedio estable de uso de herramienta (28%), frente al colapso a los extremos (2% y 100%) de las ejecuciones sin regularizar. El checkpoint se publica únicamente con pesos, pensado para reanudar entrenamiento con `--resume_only_model true` o mediante la variable `MODEL=<dir>`.

## Capacidades

- Generación de texto y razonamiento multi-paso, con bloques de pensamiento (`think`) heredados del modelo base.
- Capacidades de visión-lenguaje heredadas de Qwen3-VL-8B-Instruct (procesamiento de imágenes, no verificadas en este checkpoint).
- Tool calling / function calling: la política está entrenada explícitamente para decidir entre invocar una herramienta y responder de forma directa.
- Comportamiento de agente con ramificación: la decisión se materializa en la primera palabra del bloque think ("Current position" frente a "Start S at").
- Ajuste fino de la cuota de uso de herramienta: el checkpoint se sitúa en un 28% de uso de herramienta en la tarea de evaluación, un punto intermedio deliberado.
- Reanudación de entrenamiento: admite continuar el ciclo de RL desde estos pesos.
- Capacidades multilingües: no disponibles (no declaradas en la información proporcionada).

## Casos de uso

- Reproducción del experimento de anclaje de rama: cargar los pesos y repetir la evaluación sobre la tarea TrapField para verificar la cuota de uso de herramienta del 28% y la recompensa de 0,92 con la semilla 42.
- Ablaciones controladas de regularización: comparar este checkpoint con ejecuciones que anclan la fila posterior a `</think>`, para aislar el efecto de la posición de anclaje en la estabilidad de la política.
- Estudio del colapso de política en GRPO: usar este brazo regularizado como referencia frente a los brazos sin regularizar que terminan en 2% y 100% de uso de herramienta, y analizar la varianza entre semillas.
- Punto de partida para RL adicional: reanudar el entrenamiento (`--resume_only_model true`) sobre estos pesos para explorar otras funciones de recompensa o entornos sin partir de cero.
- Investigación sobre agentes con tool calling en entornos de decisión: utilizar el modelo como sujeto de prueba en tareas tipo FrozenLake o similares, donde el agente debe decidir cuándo consultar el entorno y cuándo responder.
- Análisis de tokens de decisión: extraer y estudiar las distribuciones de probabilidad en la primera palabra del bloque think para entender cómo la KL forward moldea la elección de rama.
- Fine-tuning específico de dominio sobre un VLM de 8B: partir de estos pesos como inicialización para tareas de visión-lenguaje, aprovechando que la licencia Apache 2.0 permite uso comercial.
- Docencia y divulgación técnica: ilustrar con un caso real y reproducible cómo se aplica GRPO con regularización posicional sobre un modelo multimodal de tamaño medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni métricas estándar). El autor únicamente reporta métricas del propio entrenamiento de RL:

| Configuracion | Cuota de uso de herramienta final | Recompensa |
|---|---|---|
| `warm3_bdecA`, semilla 42, KL anclado (lambda 0,1) | 28% | 0,92 |
| Ejecucion sin regularizar 1 (mismo warm start) | 2% | No disponible |
| Ejecucion sin regularizar 2 (mismo warm start) | 100% | No disponible |

## Requisitos de hardware

- Peso en bf16/fp16: aproximadamente 17,5 GB (coincide con el tamaño del repositorio), más overhead de activaciones y caché KV.
- VRAM estimada: ~18-20 GB en bf16; ~9-10 GB en cuantización de 8 bits; ~5 GB en 4 bits. La caché KV crece con la longitud de contexto, que no está especificada.
- GPU recomendadas: A100 40 GB u 80 GB, H100, L40S 48 GB para bf16 sin cuantizar; RTX 4090 y RTX 3090 (24 GB) pueden alojar el modelo en bf16 con margen ajustado o en 8 bits con holgura.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) con cuantización; en 4 bits puede ejecutarse en GPUs de 8-16 GB (RTX 4060 Ti 16 GB, RTX 3070, etc.).
- Opciones de despliegue: vLLM, SGLang y TGI para los pesos safetensors; llama.cpp u Ollama requieren convertir previamente a GGUF (no se publica GGUF en el repositorio); ms-swift para continuar el entrenamiento o reanudarlo.
- Latencia y throughput: no disponibles.
- Nota: al publicarse solo los pesos, es necesario disponer del tokenizer, la configuración y la plantilla de chat del modelo base para poder servirlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este checkpoint (Dolphin42) | 8,77 mil millones | No disponible | Apache 2.0 | safetensors | Checkpoint de investigacion tras 250 pasos de GRPO con KL anclada |
| Qwen/Qwen3-VL-8B-Instruct | ~8,77 mil millones (heredado) | No disponible | Apache 2.0 | safetensors | Modelo base sin el ajuste de RL |
| Qwen2.5-VL-7B-Instruct | No disponible | No disponible | No disponible | No disponible | Alternativa de la misma categoria (VLM de ~7-8B); no hay datos comparativos en la informacion disponible |
| InternVL3-8B | No disponible | No disponible | No disponible | No disponible | Alternativa de la misma categoria; no hay datos comparativos en la informacion disponible |

No se dispone de datos de rendimiento comparativo entre este checkpoint y el modelo base ni con otras alternativas, ya que no se han publicado benchmarks.

## Limitaciones y advertencias

- Es un checkpoint de investigación en el paso 250 de un experimento concreto, no un modelo afinado para uso general.
- Solo se publican pesos: no incluye tokenizer, configuración ni plantilla de chat, por lo que hay que tomarlos del modelo base para servirlo.
- No se declaran idiomas soportados; el comportamiento multilingüe no está verificado en este ajuste.
- Riesgo de alucinación heredado del modelo base; no se ha evaluado en este checkpoint.
- Riesgo de sobreajuste al entorno TrapField/FrozenLake: la cuota de uso de herramienta del 28% es específica de esa tarea y no necesariamente transferible a otros dominios.
- Sesgos conocidos: no documentados en la información disponible; se asumen los del modelo base, no auditados aquí.
- Sin validación por la comunidad: 0 descargas y 0 likes en el momento de la consulta.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte, y no hay evaluación de seguridad.
- No se han publicado resultados de benchmarks estándar, por lo que no es posible comparar su calidad general frente a otras alternativas.
- Existe una nota metodológica relevante para producción: las ejecuciones sin regularización desde el mismo warm start colapsan a extremos (2% o 100% de uso de herramienta), lo que indica que la estabilidad observada depende de la configuración exacta de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dolphin42/trapfield-qwen3vl8b-grpo-branch-anchor-bdecA-s42-step250
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Librería de entrenamiento citada en las etiquetas (ms-swift): https://github.com/modelscope/ms-swift
- Resultados de búsqueda web: no se han encontrado enlaces relevantes. Las búsquedas devueltas corresponden a un catálogo de vídeos y a la web de una facultad de periodismo, sin relación con el modelo. No se dispone de paper, blog, repositorio adicional ni demo asociados.
