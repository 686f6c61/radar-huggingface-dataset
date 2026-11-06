# saybeok03/folding_final_novit_lora_r256_224_30k

## Resumen

`folding_final_novit_lora_r256_224_30k` es un modelo de tipo Vision-Language-Action (VLA) publicado por el usuario `saybeok03` en Hugging Face, consistente en un ajuste fino del modelo base `lerobot/pi05_base`. El modelo base, π₀.₅ (Pi05), es desarrollado por Physical Intelligence y esta disenado para generalizacion en entornos abiertos, evolucionando π₀ para operar en situaciones y entornos no vistos durante el entrenamiento. La implementacion utilizada es la de LeRobot, adaptada del repositorio open source OpenPI.

Este ajuste fino concreto esta especializado en una unica tarea robotica: doblar una camiseta correctamente ("Fold the T-shirt properly"). El sufijo del nombre sugiere un entrenamiento con LoRA de rango 256 sobre imagenes de 224x224 y 30000 pasos, aunque la model card no detalla explicitamente la configuracion de LoRA. El modelo opera sobre un robot bimanual `bi_openarm_follower` con tres camaras (base, muneca izquierda y muneca derecha).

Es relevante como ejemplo de flujo de trabajo de imitation learning de extremo a extremo con LeRobot: parte de un VLA preentrenado de proposito general y lo especializa con un dataset propio de 50 episodios para una tarea de manipulacion concreta. No obstante, carece de resultados de evaluacion publicados y de documentacion sobre el proceso de entrenamiento mas alla de la configuracion basica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05); implementacion LeRobot/OpenPI |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta variantes GGUF u otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

Especificaciones adicionales de entrada y salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | (16,) |
| `observation.images.left_wrist` | VISUAL | (3, 224, 224) |
| `observation.images.right_wrist` | VISUAL | (3, 224, 224) |
| `observation.images.base` | VISUAL | (3, 224, 224) |
| `action` | ACTION | (16,) |

## Arquitectura y entrenamiento

El modelo se basa en π₀.₅ (Pi05), un VLA de Physical Intelligence que combina percepcion visual, comprension del lenguaje y generacion de acciones motoras. La implementacion concreta es la de LeRobot, adaptada del repositorio OpenPI de Physical Intelligence. La model card no detalla la arquitectura interna (tipo de transformer, mecanismo de atencion, integracion vision-lenguaje-accion) ni el numero de parametros.

El ajuste fino se realizo sobre el dataset `saybeok03/full_folding_pi05_224`, compuesto por 50 episodios y 135351 frames a 30 FPS, con la unica tarea "Fold the T-shirt properly". La configuracion de entrenamiento documentada es: 30000 pasos, batch size 32, optimizador AdamW, learning rate 3.75e-05, semilla 1000 y LeRobot 0.6.1. El nombre del modelo sugiere el uso de LoRA con rango 256, aunque este extremo no se confirma en la model card. No se documenta el numero de tokens de entrenamiento, la composicion del dataset mas alla del conteo de episodios, ni si hubo etapas de RLHF/DPO (poco habituales en imitation learning robotico).

## Capacidades

- Control robotico bimanual: genera acciones de 16 dimensiones para un robot `bi_openarm_follower` a partir de observaciones de estado y vision.
- Percepcion visual multi-camara: procesa tres flujos de imagen simultaneos (base, muneca izquierda, muneca derecha) a 224x224.
- Ejecucion de tareas de manipulacion: especializado en la tarea de doblar una camiseta.
- Imitation learning: entrenado por aprendizaje por imitacion a partir de demostraciones humanas.
- Generalizacion en entornos abiertos: heredada del modelo base π₀.₅, aunque no verificada para este ajuste concreto.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, capacidades multilingues ni modos especiales de razonamiento (thinking mode), por tratarse de un modelo de accion robotica y no de un LLM conversacional.

## Casos de uso

- Doblado de prendas en linea de produccion: el modelo ejecuta la politica entrenada para doblar camisetas con el robot bimanual, integrable en una celda de manipulacion textil.
- Investigacion en imitation learning: sirve como referencia de ajuste fino de π₀.₅ con LeRobot para estudiar el efecto de LoRA y del tamano de dataset en tareas de manipulacion.
- Prototipado de politicas roboticas: permite validar rapidamente el pipeline completo (grabacion de datos, entrenamiento, rollout) antes de escalar a tareas mas complejas.
- Benchmark interno de hardware bimanual: util para comparar el rendimiento del robot `bi_openarm_follower` frente a otras plataformas en una tarea estandarizada.
- Educacion y formacion: ejemplo didactico de flujo LeRobot de extremo a extremo, desde la visualizacion del dataset hasta el despliegue con `lerobot-rollout`.
- Base para ajustes posteriores: al derivar de `lerobot/pi05_base`, puede servir como punto de partida para especializaciones en tareas relacionadas con manipulacion de tejidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 1.9 GB, lo que da una cota inferior del espacio en disco, pero no se documenta la VRAM necesaria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el modelo base π₀.₅ y los VLA de este tipo suelen requerir GPU dedicada, pero no hay datos para este ajuste concreto.
- Opciones de despliegue: LeRobot mediante el comando `lerobot-rollout` con `--policy.path=saybeok03/folding_final_novit_lora_r256_224_30k`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de accion robotica).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `saybeok03/folding_final_novit_lora_r256_224_30k` | no disponible | no disponible | Doblado de camiseta (bimanual) | Apache 2.0 | Hugging Face |
| `lerobot/pi05_base` | no disponible | no disponible | VLA de proposito general | no disponible en la informacion | Hugging Face |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA de proposito general | no disponible en la informacion | OpenPI (open source) |

No se dispone de datos suficientes para comparar rendimiento, contexto o numero de parametros entre estos modelos. La comparativa se limita a la relacion de derivacion (este modelo es un ajuste fino de `lerobot/pi05_base`, que a su vez implementa π₀.₅).

## Limitaciones y advertencias

- Especializacion estrecha: entrenado unicamente para la tarea "Fold the T-shirt properly"; no se espera que realice otras tareas sin reentrenamiento.
- Sin evaluacion publicada: no hay tasas de exito ni resultados de pruebas en robot real, por lo que se desconoce su fiabilidad.
- Dependencia de hardware concreto: disenado para el robot `bi_openarm_follower` con tres camaras en posiciones especificas; no es portable a otras plataformas sin ajuste.
- Dataset pequeno: 50 episodios y una sola tarea limitan la diversidad y la capacidad de generalizacion.
- Riesgo de sobreajuste al entorno de grabacion: condiciones de iluminacion, posicion de objetos y configuracion de camaras no documentadas.
- Sin datos sobre sesgos, alucinacion (concepto poco aplicable a un modelo de accion, pero si a la interpretacion de la tarea) ni limitaciones de idioma.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `lerobot/pi05_base` puede tener condiciones propias que deben verificarse.
- Sin documentacion sobre cuantizacion ni despliegue en hardware de consumo.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/saybeok03/folding_final_novit_lora_r256_224_30k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/saybeok03/full_folding_pi05_224
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=saybeok03/full_folding_pi05_224
- Blog de π₀.₅ (Pi05): https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia LeRobot pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
