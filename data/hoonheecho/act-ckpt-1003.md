# HoonheeCho/act-ckpt-1003

## Resumen

`HoonheeCho/act-ckpt-1003` es un repositorio de checkpoints de una política ACT (Action Chunking Transformer) en el formato de LeRobot 0.3.3, publicado por el usuario HoonheeCho. No se trata de un modelo de lenguaje: es una política de imitación para control robótico que mapea observaciones (habitualmente imágenes de cámaras más el estado de las articulaciones) a secuencias de acciones motoras. El repositorio contiene cuatro variantes de la misma política, organizadas en las carpetas `a_rel`, `b_abs`, `c_rel_trim` y `d_abs_trim`, cada una con su `config.json` y su `model.safetensors`.

La relevancia de este tipo de publicación es práctica: LeRobot se ha consolidado como el framework de referencia para entrenar y desplegar políticas de imitación en robots de bajo coste (SO-100, SO-101, Koch, ALOHA), y los checkpoints en su formato son directamente cargables con la CLI y la API de Python del proyecto. Las cuatro variantes sugieren un experimento comparativo entre espacios de acción relativos (`rel`) y absolutos (`abs`), con y sin recorte del dataset (`trim`), lo que resulta útil para reproducir ablaciones sobre representación de acciones.

Ahora bien, el repositorio está prácticamente vacío de documentación: no hay model card descriptiva, no se especifica el robot objetivo, la tarea, el dataset de entrenamiento ni métricas de éxito. El tamaño total del repositorio es de 0,4 GB, lo que repartido entre cuatro checkpoints sitúa cada uno en el orden de decenas o pocos cientos de megabytes. Cualquier evaluación seria exige inspeccionar los `config.json` de cada carpeta para recuperar la configuración real de la política.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking Transformer (ACT); detalles concretos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; ventana de observaciones y horizonte de predicción de acciones no disponibles |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32 o fp16) |
| Idiomas soportados | no aplica (modelo de control robótico, no de texto) |
| Licencia | other (sin términos concretos publicados) |
| Formato de pesos | safetensors, con `config.json` por variante (formato LeRobot 0.3.3) |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Identificador | HoonheeCho/act-ckpt-1003 |
| Variantes incluidas | `a_rel`, `b_abs`, `c_rel_trim`, `d_abs_trim` |
| Tamano del repositorio | 0,4 GB |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-10-03 |
| Ultima actualizacion | 2026-10-03 |
| Region declarada | us |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una política de imitación propuesta en el trabajo de Zhao et al. para el sistema ALOHA. Su diseño combina un codificador visual tipo ResNet que procesa las imágenes de las cámaras, un codificador de estilo temporal que resume el estado de las articulaciones y un transformer encoder-decoder que predice un *chunk* de acciones futuras de una sola vez en lugar de una acción por paso. La predicción por bloques reduce el error de composición acumulado y mitiga el problema de las paradas intermitentes típicas del behavioral cloning ingenuo. El entrenamiento habitual se hace por imitación supervisada sobre teleoperación, con pérdida L1 sobre la secuencia de acciones y, opcionalmente, una pérdida de reconstrucción de imagen en el decodificador CVAE.

En este repositorio no se documenta nada de lo anterior: ni el número de parámetros, ni la resolución de las cámaras de entrada, ni el número de grados de libertad del robot, ni el número de episodios de demostración, ni si hubo aumento de datos o *temporal ensembling* en la inferencia. Las carpetas `a_rel`, `b_abs`, `c_rel_trim` y `d_abs_trim` sí permiten inferir la hipótesis del experimento: comparar acción relativa frente a absoluta y evaluar el efecto de recortar el dataset de demostraciones. Para confirmarlo hay que leer los `config.json` incluidos, que contienen el campo `policy` y los parámetros de normalización, pero esa información no está reflejada en la model card.

## Capacidades

- Control robótico por imitación: genera *chunks* de acciones a partir de observaciones visuales y de estado, en el formato nativo de LeRobot 0.3.3.
- Cuatro variantes de política entrenadas, presumiblemente sobre el mismo entorno pero con representaciones de acción distintas (relativa frente a absoluta) y con dos regímenes de dataset (completo frente a recortado).
- Carga directa mediante la API de LeRobot (`ACTPolicy.from_pretrained`) y uso con la CLI de evaluación y teleoperación del framework.
- No se documenta soporte de *tool calling*, agentes, razonamiento multi-paso, capacidades multilingües, visión para descripción de imágenes, audio ni modos de pensamiento. Ninguna de esas capacidades aplica a una política de control.
- No se documenta ninguna capacidad de generalización declarada: ni *zero-shot* a nuevas tareas, ni *transfer* entre robots, ni robustez ante cambios de iluminación.

## Casos de uso

- Reproducción de experimentos de imitación en robótica de bajo coste: cargar cada variante con LeRobot y ejecutar `lerobot-eval` sobre la misma tarea para medir si la acción relativa supera a la absoluta en tasa de éxito.
- Ablación sobre tamaño del dataset: las variantes `c_rel_trim` y `d_abs_trim` permiten estudiar cuánta degradación introduce el recorte de demostraciones antes de reentrenar desde cero.
- Punto de partida para *fine-tuning* en una tarea propia: al ser un checkpoint ACT en formato LeRobot, se puede reentrenar con un dataset nuevo del mismo robot sin reescribir el pipeline.
- Integración en un bucle de control en tiempo real: la política ACT es lo bastante pequeña para ejecutarse en la GPU de un portátil o incluso en CPU, lo que la hace viable para demostraciones en vivo.
- Docencia y formación: sirve como ejemplo mínimo y funcional de política de imitación multimodal, útil en cursos de robótica y aprendizaje por imitación.
- Banco de pruebas de infraestructura: dado que el repositorio no ofrece métricas, puede utilizarse para validar que una instalación de LeRobot 0.3.3 carga checkpoints correctamente, antes de pasar a modelos más costosos.

Advertencia: sin model card no se puede confirmar que estas variantes funcionen fuera del robot y la tarea concretos para los que se entrenaron. Los casos anteriores asumen esa limitación, no la ignoran.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card se limita a listar las cuatro carpetas y sus ficheros, y no incluye tasas de éxito, número de episodios de evaluación, tiempo de inferencia ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio completo ocupa 0,4 GB, de modo que cada checkpoint individual es previsiblemente inferior a esa cifra; en la práctica una política ACT de este tipo suele ejecutarse con menos de 1 GB de VRAM, pero es una estimación basada en el tamaño del repositorio, no un dato publicado.
- GPU recomendadas: no disponibles. Una política ACT típica no necesita una GPU de datacenter; cualquier GPU consumer reciente es suficiente.
- Viabilidad en GPU consumer: muy probablemente sí, incluidas tarjetas de gama baja y posiblemente CPU, dado el tamaño reducido de los pesos. No confirmado por el autor.
- Opciones de despliegue: LeRobot 0.3.3 (formato nativo del checkpoint), con la CLI de evaluación y el bucle de control del framework. No hay evidencia de soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen enteramente del robot, de la frecuencia de control y de si se usa *temporal ensembling*, ninguno de los cuales está documentado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HoonheeCho/act-ckpt-1003 | ACT (LeRobot 0.3.3) | no disponible | no aplica | other | HuggingFace, 0 descargas |
| ACT original (Zhao et al.) | ACT | ~80 M (publicado en el paper) | no aplica | codigo abierto en el repo del paper | GitHub del proyecto ALOHA |
| Diffusion Policy | politica de difusion | no disponible aqui | no aplica | no disponible aqui | repositorio propio |
| SmolVLA | VLA (LeRobot) | ~450 M (publicado por HuggingFace) | no aplica | Apache 2.0 segun su model card | HuggingFace |

La comparacion cuantitativa no es posible: para este checkpoint no hay parametros, ni contexto, ni tasas de exito publicadas. Los datos de las filas de ACT original, Diffusion Policy y SmolVLA provienen de sus respectivas publicaciones y no de este repositorio; conviene verificarlos en las fuentes antes de citarlos.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: no hay model card con tarea, robot, dataset, hiperparametros ni metricas.
- Licencia `other` sin texto de licencia publicado: no se puede afirmar que el uso comercial este permitido ni prohibido. Tratar como no autorizado hasta contactar con el autor.
- Cero descargas y cero likes: el modelo no ha sido validado por terceros, por lo que su correcto funcionamiento no esta corroborado.
- Riesgo alto de sobreajuste a la tarea y al entorno de entrenamiento originales, comportamiento habitual en politicas de imitacion entrenadas con pocas demostraciones.
- No hay datos sobre sesgos, pero en robótica el equivalente relevante es la sensibilidad a condiciones visuales (iluminacion, fondo, posicion de camara) no representadas en el dataset.
- Riesgo de alucinacion en el sentido de acciones incoherentes fuera de la distribucion de entrenamiento; ACT no tiene mecanismo de rechazo o abstención.
- Sin informacion sobre idiomas, contexto o capacidades de texto: no debe presentarse este repositorio como un modelo de lenguaje bajo ninguna circunstancia.
- Las cuatro variantes pueden diferir en el espacio de acciones; mezclar sus salidas sin revisar los `config.json` producira comandos incorrectos en el robot.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/HoonheeCho/act-ckpt-1003
- Perfil del autor: https://huggingface.co/HoonheeCho
- LeRobot (framework del formato de checkpoint): https://github.com/huggingface/lerobot
- Paper de ACT (Action Chunking with Transformers): https://arxiv.org/abs/2304.13705
- Documentacion de LeRobot para politicas ACT: https://huggingface.co/docs/lerobot/act

Nota: los resultados de busqueda web devueltos para este modelo no contienen informacion tecnica relevante sobre el mismo, por lo que no se han utilizado como fuente.
