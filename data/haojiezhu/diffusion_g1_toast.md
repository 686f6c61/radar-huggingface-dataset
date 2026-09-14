# haojiezhu/diffusion_g1_toast

## Resumen

El modelo `haojiezhu/diffusion_g1_toast` es una politica de control visuomotor basada en Diffusion Policy, entrenada y publicada con la libreria LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de robotica que convierte observaciones (imagenes de camaras y estado de las articulaciones) en trayectorias de acciones motoras, y esta especializado en una tarea de manipulacion concreta, tostar pan, sobre el robot humanoide Unitree G1 equipado con manos Dex3.

El autor es el usuario de Hugging Face `haojiezhu` y el entrenamiento se ha realizado sobre el dataset `unitreerobotics/G1_Dex3_ToastedBread_Dataset`. La arquitectura sigue el planteamiento de Diffusion Policy (paper arXiv:2303.04137), que modela el control visuomotor como un proceso generativo de difusion: en lugar de predecir una unica accion, genera una secuencia completa de acciones de forma iterativa, lo que produce trayectorias suaves y mejora el rendimiento en tareas con contacto rico entre el efector y el entorno.

El modelo tiene 275.303.246 parametros (unos 275 millones) y el repositorio ocupa 1,1 GB, lo que corresponde a pesos en precision completa (aproximadamente 4 bytes por parametro). Se distribuye bajo licencia Apache 2.0 en formato safetensors. Es relevante porque ejemplifica el flujo actual de publicacion de politicas de robotica preentrenadas y reproducibles dentro del ecosistema LeRobot, aunque su alcance es acotado: una sola tarea y un solo robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (modelo generativo de difusion para control visuomotor), implementado en LeRobot |
| Parametros totales | 275.303.246 (aproximadamente 275 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa horizontes de observacion y de accion no especificados en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en precision completa) |
| Idiomas soportados | no aplica (modelo de robotica; no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,1 GB |
| Libreria | lerobot |
| Pipeline (Hugging Face) | robotics |
| Dataset de entrenamiento | unitreerobotics/G1_Dex3_ToastedBread_Dataset |
| Robot objetivo | Unitree G1 con manos Dex3 |
| Tarea | tostado de pan (toasted bread) |
| Fecha de creacion | 2026-09-13 |
| Fecha de actualizacion | 2026-09-13 |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es Diffusion Policy, descrita en el paper arXiv:2303.04137. Se trata de un modelo generativo que aprende la distribucion de secuencias de acciones condicionada por las observaciones. En lugar de emitir una accion por paso de control mediante una politica determinista o un policy de tipo behavior cloning directo, el modelo parte de ruido y aplica un proceso de denoising iterativo para producir un bloque completo de acciones futuras. Esto da lugar a trayectorias multimodales y suaves, lo cual es especialmente util en manipulacion con contacto fisico, donde una accion unica y promediada suele fallar.

La model card no detalla la composicion exacta del dataset, el numero de episodios, los tokens de entrenamiento (concepto no aplicable aqui) ni si se emplearon etapas de refinamiento como RLHF o DPO. Tampoco especifica la variante concreta de backbone visual ni el numero de pasos de difusion usados en inferencia. Lo que si se indica es que el entrenamiento se ha realizado con LeRobot y que el dataset es especifico de la tarea de tostado sobre el robot Unitree G1 con manos Dex3. No se documentan innovaciones adicionales mas alla del propio Diffusion Policy.

## Capacidades

- Generacion de trayectorias de acciones motoras multimodales y suaves mediante decodificacion por difusion, adecuada para tareas de manipulacion con contacto.
- Control visuomotor: consume observaciones visuales (camaras) y estado del robot para producir comandos de actuacion.
- Manipulacion bimanual con manos dextras, dado que el dataset de entrenamiento es de manos Dex3 del Unitree G1.
- Ejecucion de una tarea especifica de manipulacion: tostar pan.
- Integracion nativa con LeRobot para entrenamiento, evaluacion y registro de episodios.
- Soporte de evaluacion mediante `lerobot-record` con el parametro `--policy.path`, lo que permite desplegar el checkpoint contra un robot real.
- No dispone de tool calling, function calling, razonamiento multi-paso simbolico, capacidades multilingues ni modos de pensamiento: son capacidades propias de modelos de lenguaje y no aplican a esta politica.

## Casos de uso

- Automatizacion de una celula robotica de cocina: la politica ejecuta la secuencia completa de tostado de pan sobre el Unitree G1, de forma que un integrador puede reproducir la tarea sin programar cada paso manualmente.
- Punto de partida para fine-tuning en tareas de manipulacion similares: al estar publicada en LeRobot, se puede reentrenar con `lerobot-train` sobre un dataset propio de otra tarea de contacto (por ejemplo, servir o emplatar) y reutilizar la inicializacion.
- Evaluacion comparativa de politicas de robotica: sirve como referencia de Diffusion Policy frente a otras familias implementadas en LeRobot (ACT, VQ-BeT) en un mismo robot y una misma tarea.
- Investigacion en aprendizaje por imitacion con contacto rico: el modelo permite estudiar como la generacion por difusion maneja la multimodalidad de acciones en tareas donde el efector toca objetos deformables o fragiles.
- Pruebas de reproducibilidad de pipelines de robotica: los comandos documentados (`lerobot-train`, `lerobot-record`) permiten reproducir el flujo completo de entrenamiento y evaluacion en un laboratorio.
- Validacion de transferencia sim-a-real o real-a-real: al existir un dataset de referencia asociado, se puede medir la degradacion de la politica al variar iluminacion, posicion de la tostadora u objeto.
- Docencia y divulgacion tecnica: ejemplo autocontenido de politica de difusion con checkpoint publico y comandos de ejecucion, util para cursos de robotica y aprendizaje profundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito (success rate), numero de episodios de evaluacion, ni comparaciones cuantitativas con otras politicas. Tampoco hay datos de latencia o throughput de inferencia. Los resultados de busqueda web recibidos no contienen informacion relevante sobre este modelo (corresponden a contenidos deportivos sin relacion).

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 1,1 GB en precision completa (275,3 M de parametros x 4 bytes). En la practica, con activaciones y buffers del proceso de difusion, se puede estimar un consumo de entre 2 y 4 GB de VRAM, aunque no hay mediciones publicadas.
- En precision media (fp16) los pesos serian de aproximadamente 0,55 GB, con lo que caben holgadamente en cualquier GPU con 8 GB o mas.
- GPU recomendadas: una GPU de gama de consumo como la RTX 4090 o una RTX 3090 es mas que suficiente para inferencia; para entrenamiento con lotes grandes y aumento de datos conviene una A100 o H100.
- Cabe en GPU de consumo: si, el tamano de parametros es muy reducido comparado con un LLM. GPUs con 8-12 GB de VRAM son suficientes para inferencia.
- Opciones de despliegue: inferencia en PyTorch a traves de LeRobot (`lerobot-record` con `--policy.path`). No aplican vLLM, TGI, llama.cpp, Ollama ni GGUF, ya que no es un modelo autorregresivo de lenguaje.
- Latencia y throughput estimados: no disponibles. La latencia dependera del numero de pasos de denoising, de la frecuencia de control del robot y del coste de la codificacion visual.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| diffusion_g1_toast | Diffusion Policy (robotica) | 275,3 M | no aplica | Apache 2.0 | Hugging Face, via LeRobot | Entrenado para tostado con Unitree G1 + Dex3 |
| ACT (Action Chunking Transformer) | Politica de imitacion (robotica) | no disponible | no aplica | Apache 2.0 (implementacion LeRobot) | Hugging Face, via LeRobot | Predice bloques de acciones de forma determinista; mas simple, sin proceso de difusion |
| VQ-BeT | Politica de imitacion con codebook discreto | no disponible | no aplica | Apache 2.0 (implementacion LeRobot) | Hugging Face, via LeRobot | Modela multimodalidad mediante cuantizacion vectorial en lugar de difusion |

No se dispone de resultados de rendimiento comparativos publicados en la informacion proporcionada, por lo que la comparacion se limita a la categoria arquitectonica y a la licencia. Los valores de parametros de ACT y VQ-BeT dependen de la configuracion concreta y no se incluyen en los datos disponibles.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea (tostar pan) sobre un robot concreto (Unitree G1 con manos Dex3). No se espera que generalice a otras tareas, objetos o morfologias sin reentrenamiento.
- Sin datos de rendimiento: la model card no reporta tasas de exito ni condiciones de evaluacion, por lo que no hay evidencia publicada de su fiabilidad en produccion.
- Riesgo de fallo ante cambios de dominio: variaciones de iluminacion, posicion de la tostadora, tipo de pan o desgaste del robot pueden degradar el comportamiento, ya que no se documenta aumento de datos ni robustez.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte.
- Sesgos: no aplica sesgo linguistico o social, pero si existe un sesgo de datos derivado de un unico entorno de recogida y un unico operador si el dataset no fue variado.
- Fechas del repositorio: la model card y los metadatos indican fechas de creacion y actualizacion en 2026, lo que conviene verificar antes de citarlo.
- No apto para los casos de uso tipicos de un LLM: no genera texto, no razona en lenguaje natural, no soporta tool calling ni agentes.
- Los resultados de busqueda web disponibles no aportan informacion tecnica sobre el modelo; toda la ficha se basa en la model card y los metadatos de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haojiezhu/diffusion_g1_toast
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv:2303.04137)
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/unitreerobotics/G1_Dex3_ToastedBread_Dataset
