# huaizong123/smolvla_2obj_2pos_lora_r6a6_2layers_40k

## Resumen

Este repositorio aloja un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario huaizong123, diseñado para ajustar el modelo base `lerobot/smolvla_base` en tareas de robótica de manipulación con dos objetos y dos posiciones. El nombre del adaptador (`smolvla_2obj_2pos_lora_r6a6_2layers_40k`) indica que se entrenó con un rango de 6, alpha de 6, sobre 2 capas y durante 40.000 pasos. El modelo base, SmolVLA, es un modelo de visión-lenguaje-acción (VLA) de 450 millones de parámetros desarrollado por Hugging Face, diseñado para control robótico de bajo coste en hardware de consumo.

El adaptador se distribuye en formato PEFT con pesos en safetensors (tamaño del repositorio: 0,2 GB) y está destinado a ser cargado sobre la base de SmolVLA mediante la librería PEFT. No se ha publicado información sobre licencia, idiomas, datos de entrenamiento ni benchmarks en la model card, por lo que la mayor parte de las especificaciones técnicas del adaptador no están disponibles. Su relevancia radica en la posibilidad de adaptar un modelo VLA de código abierto a tareas robóticas específicas con un coste de entrenamiento reducido, aunque la falta de documentación limita su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `lerobot/smolvla_base` (SmolVLA, VLA basado en SmolVLM) |
| Parametros totales | no disponible (adaptador LoRA; el repo ocupa 0,2 GB) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del modelo base SmolVLA) |
| Tipos de cuantizacion | no disponible (solo se indica safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre `lerobot/smolvla_base`, el modelo base de SmolVLA de Hugging Face. SmolVLA es un modelo de visión-lenguaje-acción de 450 millones de parámetros, basado en SmolVLM, que convierte instrucciones en lenguaje natural y observaciones visuales en acciones robóticas discretas. La arquitectura del adaptador con r=6, alpha=6 y 2 capas indica un ajuste de bajo rango sobre las capas del transformer del modelo base, una técnica habitual para reducir el coste de entrenamiento y el número de parámetros entrenables.

No se han publicado detalles sobre el dataset de entrenamiento, el procedimiento exacto (si hubo RLHF, DPO o supervisión directa) ni las hiperparámetros completos. El nombre sugiere 40.000 pasos de entrenamiento, pero no se especifica la composición de los datos (presumiblemente demostraciones robóticas con dos objetos y dos posiciones, segun el nombre), ni el tipo de acciones discretas generadas por el modelo base.

## Capacidades

- Adaptacion de un modelo VLA a una tarea robótica especifica (manipulacion con dos objetos y dos posiciones).
- Hereda las capacidades del modelo base SmolVLA: percepcion visual, comprension de instrucciones en lenguaje natural y generacion de acciones roboticas discretas.
- Soporte de ajuste mediante PEFT, lo que permite cargar el adaptador sobre la base con la libreria `peft`.
- Capacidades multilingues no disponibles, dependen del modelo base.
- No se documenta soporte de tool calling, agentes, ni modos especiales (thinking, vision, audio) mas alla de lo que proporcione el modelo base.

## Casos de uso

- Investigacion en robótica de bajo coste: permite experimentar con el ajuste de SmolVLA para tareas de manipulacion de objetos sin necesidad de entrenar un modelo completo desde cero, gracias a la tecnica LoRA que reduce los requisitos de computo.
- Prototipado rapido de politicas robotizadas: el adaptador puede cargarse sobre la base de SmolVLA en un entorno de simulacion para validar si la tarea de dos objetos y dos posiciones se resuelve correctamente antes de pasar a un robot fisico.
- Experimentos educativos en VLA: util para cursos o talleres donde se enseña a ajustar modelos de vision-lenguaje-accion mediante PEFT, dado que el adaptador es pequeno (0,2 GB) y facil de distribuir.
- Evaluacion comparativa de estrategias de fine-tuning: permite estudiar como el rango y el numero de capas del LoRA afectan al rendimiento en tareas roboticas, comparando con otros adaptadores del mismo autor (p. ej., r16).
- Integracion en pipelines de LeRobot: el adaptador se define con base en `lerobot/smolvla_base`, por lo que puede integrarse en el ecosistema de LeRobot para entrenamiento y despliegue de politicas robot.
- Reproducibilidad de experimentos: sirve como punto de partida para replicar o extender los experimentos del autor sobre SmolVLA con tareas de dos objetos y dos posiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador especifico; el modelo base SmolVLA (450M parametros) puede ejecutarse en GPUs de consumo con 8-12 GB de VRAM en cuantizacion de 8 bits, pero el adaptador no incluye esa informacion.
- GPUs recomendadas: no especificadas; basandose en el modelo base, tarjetas como RTX 3060/4060 (12 GB) o superiores serian suficientes para inferencia del adaptador cargado sobre la base.
- Compatibilidad con consumer GPU: probablemente si, dado el tamano reducido del adaptador (0,2 GB), pero no confirmado por el autor.
- Opciones de despliegue: el adaptador se carga mediante la libreria PEFT sobre el modelo base; se puede usar con frameworks como Hugging Face Transformers o LeRobot. No se indican opciones como vLLM, llama.cpp o Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El autor publica otro adaptador similar (`smolvla_2obj_2pos_lora_r16_2layers_40k`) con rango 16, pero no se han proporcionado comparativas de rendimiento entre ambos. No se dispone de datos de otros adaptadores LoRA para SmolVLA en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo card no contiene informacion sobre sesgos, riesgos o limitaciones; se recomienda precaucion antes de usar el adaptador en entornos de produccion.
- No se ha publicado validacion de rendimiento en tareas reales, por lo que la efectividad del adaptador para la tarea de dos objetos y dos posiciones no esta verificada.
- La licencia no esta especificada, lo que impide conocer si es posible su uso comercial.
- El adaptador depende de la disponibilidad del modelo base `lerobot/smolvla_base`; si este cambia o se retira, el adaptador puede no funcionar correctamente.
- El nombre del modelo sugiere una tarea especifica (dos objetos y dos posiciones), por lo que su aplicacion a otras tareas roboticas podria no ser adecuada sin re-entrenamiento.
- No se documentan sesgos ni riesgos de alucinacion, pero al ser un modelo VLA, podria generar acciones incorrectas en escenarios no vistos.

## Enlaces

- HuggingFace: https://huggingface.co/huaizong123/smolvla_2obj_2pos_lora_r6a6_2layers_40k
- Modelo base en HuggingFace: https://huggingface.co/lerobot/smolvla_base (referenciado en los tags del adaptador)
- Web del proyecto SmolVLA: https://smolvla.net/index_en
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Paper sobre calculo de impacto ambiental (referenciado en la model card): https://arxiv.org/abs/1910.09700
- Repositorio del autor en HuggingFace: https://huggingface.co/huaizong123/datasets
