# ImKyungjin/pi0-maniskill-plugcharger-mixed-30pct-100ep-seed1000

## Resumen

Este repositorio contiene un checkpoint de política robótica π₀ (Pi0) ajustado por el usuario ImKyungjin con LeRobot sobre el dataset `local/maniskill_plugcharger_mixed_30pct_100ep`, asociado a la tarea de inserción de cargador (plug charger) en el simulador ManiSkill. π₀ es un modelo de visión-lenguaje-acción (VLA) para control robótico general desarrollado por Physical Intelligence; la implementación empleada deriva del repositorio OpenPI y se ejecuta mediante la librería LeRobot de HuggingFace.

El checkpoint tiene 3.501.372.176 parámetros (unos 3,5 mil millones), almacenados en safetensors dentro de un repositorio de 7,0 GB, lo que corresponde a pesos en precisión de 16 bits. La licencia declarada es Apache-2.0 y el pipeline es `robotics`. No se especifican idiomas soportados ni detalles de la arquitectura en la model card.

El interés práctico es acotado pero concreto: se trata de un artefacto de investigación reproducible (semilla 1000, 100 episodios, mezcla del 30 %) pensado para estudiar el ajuste de políticas VLA en tareas de manipulación de precisión y la posible transferencia sim-a-real, no un modelo de propósito general listo para producción. A fecha de la ficha no acumula descargas ni valoraciones, y no se han publicado resultados de evaluación en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) basada en π₀ de Physical Intelligence; detalle interno no disponible en la información proporcionada |
| Parámetros totales | 3.501.372.176 (≈3,5 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos en safetensors a 16 bits) |
| Idiomas soportados | No disponibles (política VLA que recibe instrucciones en lenguaje natural; no se detalla el soporte idiomático) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |
| Librería | LeRobot |
| Pipeline | `robotics` |
| Tamaño del repositorio | 7,0 GB |
| Dataset de ajuste | `local/maniskill_plugcharger_mixed_30pct_100ep` |

## Arquitectura y entrenamiento

La model card describe π₀ como un modelo de visión-lenguaje-acción para control robótico general, desarrollado por Physical Intelligence, cuya implementación en LeRobot está adaptada del repositorio OpenPI. El modelo recibe entradas visuales e instrucciones en lenguaje natural y produce acciones de control para distintos robots y tareas. La información proporcionada no detalla la composición interna del backbone (codificador visual, modelo de lenguaje o módulo de generación de acciones), ni el mecanismo concreto de decodificación de acciones, por lo que esos aspectos quedan como no disponibles en esta ficha.

En cuanto al entrenamiento, el nombre del repositorio indica un ajuste sobre un dataset de ManiSkill con mezcla al 30 % de datos (`mixed_30pct`), 100 episodios (`100ep`) y semilla 1000 (`seed1000`). No se especifica el número de tokens o pasos de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF, DPO u optimización posterior. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal u otras) en la información disponible.

## Capacidades

- Control robótico mediante políticas de visión-lenguaje-acción: el modelo traduce observaciones visuales e instrucciones en lenguaje natural en acciones de manipulación.
- Ejecución de tareas de ensamblaje e inserción de precisión, en concreto la inserción de un cargador (plug charger) sobre el entorno ManiSkill utilizado para el ajuste.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` e inferencia/evaluación con `lerobot-record`.
- Compatibilidad declarada con hardware robótico tipo `so100_follower` en los ejemplos de la model card, aunque no se confirma que este checkpoint se haya evaluado en dicho robot.
- Reproducibilidad experimental: la semilla y el tamaño del dataset están codificados en el nombre del modelo, lo que facilita repetir o comparar condiciones de entrenamiento.
- Capacidades multilingües: no disponibles.
- Modo de razonamiento explícito (*thinking*), visión general, audio o *tool calling*: no disponibles.

## Casos de uso

- Investigación en manipulación de precisión: el checkpoint sirve como política de referencia para estudiar inserción de conectores en simulación, una tarea clásica de tolerancias estrechas donde el modelo aprende a alinear y aplicar fuerza sobre el conector.
- Estudio de escalado de datos: al estar entrenado con 100 episodios y una mezcla del 30 %, permite comparar curvas de rendimiento frente a variantes con otros porcentajes de mezcla o más episodios, manteniendo constante la semilla.
- Reproducibilidad de experimentos: la semilla 1000 incluida en el identificador facilita repetir el ajuste y analizar la varianza entre ejecuciones con el mismo presupuesto de datos.
- Ajuste fino sobre nuevas tareas: puede usarse como punto de partida en LeRobot (`--policy.path` apuntando a este repositorio) para adaptarlo a otras tareas de ensamblaje con un coste de entrenamiento menor que desde cero.
- Evaluación automatizada de políticas en simulación: con `lerobot-record` y un prefijo `eval_` en el dataset se pueden generar rollouts y métricas de éxito sin necesidad de hardware físico.
- Estudio de transferencia sim-a-real: el modelo permite medir la degradación de rendimiento al pasar de ManiSkill a un banco robótico real, un paso habitual antes de invertir en despliegues físicos.
- Docencia y formación en robótica: sirve como ejemplo completo de flujo LeRobot (dataset, entrenamiento, checkpoint y evaluación) para cursos o talleres sobre aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en pesos a 16 bits (el formato publicado) los 3,5 B de parámetros ocupan aproximadamente 7 GB, por lo que se necesitan del orden de 8-10 GB de VRAM contando activaciones y buffers de visión.
- En precisión FP32 el modelo ocuparía unos 14 GB de pesos, aunque no es el formato distribuido.
- Cuantizaciones a 8 o 4 bits reducirían el uso a unos 3,5-4 GB y 1,8-2 GB respectivamente, pero no se publican checkpoints cuantizados.
- GPU recomendadas: para inferencia, RTX 3060 de 12 GB o superior funciona al límite; RTX 4070 Ti, RTX 4080, RTX 4090 (16-24 GB) y GPUs de centro de datos como A100, H100 o L40S ofrecen margen suficiente.
- Sí cabe en GPU de consumo: la mayoría de tarjetas con 12 GB o más de VRAM son suficientes para inferencia en 16 bits.
- Para ajuste fino con LeRobot se recomienda A100/H100 de 40-80 GB; con técnicas de bajo rango y lotes pequeños es viable en GPUs de 24 GB.
- Opciones de despliegue: LeRobot (`lerobot-train`, `lerobot-record`), el repositorio OpenPI de Physical Intelligence y PyTorch. No se proporcionan integraciones con vLLM, TGI, llama.cpp u Ollama, que además no aplican a este tipo de política VLA.
- Latencia y throughput: no disponibles para este checkpoint. La documentación pública de Physical Intelligence describe π₀ como una política capaz de generar acciones a frecuencias de control del orden de decenas de hercios en su hardware de referencia, pero no se aporta una medición específica para este ajuste.

## Comparativa con modelos similares

Los datos de los modelos comparativos proceden de documentación pública de sus respectivos proyectos y no de la información proporcionada para esta ficha; se incluyen solo como referencia orientativa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Evaluación publicada |
|---|---|---|---|---|---|
| π₀ ManiSkill plugcharger (este checkpoint) | 3,5 B | No disponible | Apache-2.0 | HuggingFace, LeRobot | No disponible |
| π₀ base / OpenPI | ≈3,3 B (referencia pública) | No aplica (VLA) | Apache-2.0 en el código; condiciones propias para los pesos base | HuggingFace y repositorio OpenPI | Métricas publicadas por Physical Intelligence en su blog |
| SmolVLA | ≈450 M (referencia pública) | No aplica (VLA) | Apache-2.0 | HuggingFace, LeRobot | Datos publicados en su model card |
| ACT (LeRobot) | Decenas de millones según configuración | No aplica | Apache-2.0 | HuggingFace, LeRobot | Datos publicados en el paper original |

## Limitaciones y advertencias

- No hay resultados de evaluación publicados: se desconoce la tasa de éxito real del checkpoint en la tarea de inserción.
- El ajuste parece muy específico: nombre de dataset, mezcla del 30 %, 100 episodios y semilla 1000 sugieren un experimento acotado, no un modelo generalista.
- Sesgo de simulación: al proceder de ManiSkill, el comportamiento puede degradarse al transferirse a un robot físico por diferencias de dinámica, iluminación, texturas y calibración.
- Sin validación comunitaria: cero descargas y cero valoraciones en el momento de redactar esta ficha, por lo que no existen informes independientes de uso.
- Idiomas y contexto: la model card no especifica idiomas soportados ni longitud de contexto, lo que impide garantizar el comportamiento ante instrucciones en otros idiomas distintos del usado en el dataset.
- Riesgo de alucinación: en políticas VLA se manifiesta como acciones incoherentes o inseguras ante observaciones fuera de distribución; no hay datos sobre robustez en estos escenarios.
- Licencia: el repositorio declara Apache-2.0, pero al ser un derivado de π₀ conviene verificar las condiciones aplicables a los pesos base antes de un uso comercial.
- Seguridad física: cualquier despliegue en un robot real debe incorporar límites de par, paradas de emergencia y validación en entorno controlado antes de operar cerca de personas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ImKyungjin/pi0-maniskill-plugcharger-mixed-30pct-100ep-seed1000
- Entrada del blog de Physical Intelligence sobre π₀: https://www.physicalintelligence.company/blog/pi0
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Repositorio OpenPI de Physical Intelligence: https://github.com/Physical-Intelligence/openpi

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces encontrados correspondían a productos de puertas de vidrio y no guardan relación con el contenido de esta ficha.
