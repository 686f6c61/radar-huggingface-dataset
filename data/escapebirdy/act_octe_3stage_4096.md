# escapebirdy/act_octe_3stage_4096

## Resumen

El modelo `escapebirdy/act_octe_3stage_4096` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación desarrollado en el ecosistema de LeRobot. El autor, `escapebirdy`, ha entrenado este checkpoint sobre el dataset `escapebirdy/cut_4096_v2`, compuesto por demostraciones teleoperadas de manipulación. La principal función del modelo es predecir secuencias cortas de acciones (action chunks) en lugar de acciones individuales, lo que reduce el error acumulado durante la ejecución de tareas robóticas y mejora la precisión en entornos reales.

La arquitectura se basa en transformers, con aproximadamente 51,97 millones de parámetros en total y pesos almacenados en formato safetensors. No se especifica la longitud de contexto en la documentación disponible. El modelo se publica bajo licencia Apache-2.0 y está integrado en el framework LeRobot de HuggingFace, lo que facilita su uso para entrenamiento, evaluación y despliegue en robots manipuladores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.967.876 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no aplica ventana de contexto de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizacion documentada) |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura ACT, que combina un codificador visual con un transformer que genera chunks de acciones de forma autoregresiva. El método fue introducido en el artículo «Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware» (arXiv:2304.13705) y ha sido implementado en el framework LeRobot. El entrenamiento se realiza mediante aprendizaje por imitación a partir de datos teleoperados. En este caso, el dataset empleado es `escapebirdy/cut_4096_v2`, aunque no se detalla la composición exacta ni el número de episodios. No se menciona el uso de RLHF ni DPO, al tratarse de un modelo de control robótico. La innovación técnica destacable es el action chunking, que permite mantener coherencia temporal en la ejecución de tareas y reducir la propagación de errores en la predicción de acciones.

## Capacidades

- Predicción de chunks de acciones para el control de robots manipuladores.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Integración con el framework LeRobot para entrenamiento, evaluación y despliegue.
- Soporte para el robot SO-100 (follower) según la documentación de la model card.
- No ofrece capacidades de lenguaje, vision por si mismo ni tool calling: es un policy de bajo nivel.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede ejecutar tareas de pick-and-place entrenadas con demostraciones, gracias a la predicción por chunks.
- Teleoperación asistida: se puede usar como política para robots seguidores (follower) en configuraciones con un robot líder.
- Investigación en aprendizaje por imitación: sirve como baseline para comparar métodos de action chunking.
- Automatización de tareas repetitivas en entornos controlados: ensamblaje, clasificación de piezas.
- Integración en pipelines de LeRobot: permite reentrenar o evaluar el modelo con nuevos datos.
- Benchmarking de políticas de control: el modelo está publicado en HuggingFace para ser usado por la comunidad como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamaño de ~52 millones de parámetros y 0.2 GB de repo, la inferencia en fp32 requiere aproximadamente 200 MB de memoria.
- GPU recomendadas: no disponible. En la practica, una GPU con al menos 2 GB de VRAM seria suficiente, pero no hay datos oficiales.
- Compatible con GPUs consumer: si, por tamano. No se especifica cuantizacion.
- Opciones de despliegue: LeRobot (entrenamiento y evaluacion), HuggingFace Hub. No se mencionan vLLM, llama.cpp ni Ollama por ser un modelo de robotica, no de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Se han identificado dos modelos adicionales del mismo autor en HuggingFace: `escapebirdy/rope_cut_oct_xyzi_octe_3stage_4096` y `escapebirdy/rope_cut_oct_xyzi_octe_act_4096`. Las diferencias parecen estar en la configuracion de la observacion y el tipo de politica, pero no se dispone de especificaciones publicas de estos modelos. No se han encontrado otros modelos comparables con datos disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La informacion disponible no incluye metricas de exito ni benchmarks publicados.
- El modelo esta entrenado para un robot especifico (SO-100 follower segun el ejemplo) y puede no generalizar a otros robots sin reentrenamiento.
- Depende de la calidad y cantidad de las demostraciones en el dataset `cut_4096_v2`.
- La fecha de creacion (2026-09-07) es futura, lo que puede indicar un error en los metadatos.
- No se documentan sesgos ni riesgos de alucinacion, al no ser un modelo de lenguaje.
- La licencia Apache-2.0 permite uso comercial, pero es necesario cumplir con los terminos de la licencia y atribuir al autor.

## Enlaces

- Modelo: https://huggingface.co/escapebirdy/act_octe_3stage_4096
- Paper ACT: https://huggingface.co/papers/2304.13705
- LeRobot GitHub: https://github.com/huggingface/lerobot
- LeRobot Docs: https://huggingface.co/docs/lerobot/index
