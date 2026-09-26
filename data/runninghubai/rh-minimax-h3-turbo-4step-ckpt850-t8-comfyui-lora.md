# RunningHubAI/rh-minimax-h3-turbo-4step-ckpt850-t8-comfyui-lora

## Resumen

`rh-minimax-h3-turbo-4step-ckpt850-t8-comfyui-lora` es un adaptador LoRA publicado por RunningHubAI (autor identificado como T8star, "T8" en el nombre del archivo) que consiste en una adaptación a ComfyUI del proyecto `larryvrh/MiniMax-H3-Turbo-Lora`. Está afinado a partir del modelo base `minimax-h3` y se distribuye como un único archivo de pesos, `minimax_h3_turbo_4step_ckpt850_T8_comfyui.safetensors`, de 744 MiB.

La relevancia de este tipo de artefacto es doble: por un lado, las LoRA denominadas "turbo" con muestreo en 4 pasos reducen de forma drástica el coste de inferencia frente a un schedule completo de difusión, lo que abarata el despliegue en producción; por otro, el empaquetado específico para ComfyUI permite integrar el adaptador en flujos de trabajo nodales sin escribir código. El nombre del archivo indica además un checkpoint de entrenamiento concreto (ckpt850).

La documentación publicada es, sin embargo, mínima: la model card no declara pipeline, licencia, idiomas, dataset de entrenamiento ni métricas, y el repositorio acumula 0 descargas y 0 likes en el momento de redactar esta ficha. Todo lo que no aparece en la información disponible se marca explícitamente como "no disponible" en lugar de inferirse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base `minimax-h3`; no se documentan rango, alpha ni módulos objetivo |
| Parámetros totales | no disponible; el archivo de pesos ocupa 744 MiB y la model card no indica recuento de parámetros ni rango |
| Parámetros activos | no aplicable (no es un modelo MoE, es un adaptador LoRA) |
| Longitud de contexto | no disponible; depende del modelo base `minimax-h3`, cuya ficha técnica no se detalla en la información proporcionada |
| Tipos de cuantización | no disponible; solo se distribuye en safetensors, sin variantes GGUF, FP8 o INT8 anunciadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (archivo único, 744 MiB) |
| Tipo de artefacto | LoRA para ComfyUI |
| Modelo base | `minimax-h3` |
| Proyecto de origen | `larryvrh/MiniMax-H3-Turbo-Lora` (adaptado a ComfyUI) |
| Pasos de inferencia declarados | 4 (según el nombre del archivo y del repositorio; no confirmado en la model card) |
| Checkpoint de entrenamiento | 850 (según el nombre del archivo) |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Tamaño del repositorio | 0,8 GB |
| Descargas y likes | 0 descargas, 0 likes |
| Fecha declarada de creación | 2026-09-26T12:29:05Z (metadato del repositorio) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en capas del modelo base `minimax-h3` para modificar su comportamiento sin reentrenar los pesos completos. El nombre del artefacto sugiere una destilación orientada a inferencia acelerada ("turbo") con un schedule de 4 pasos, partiendo del trabajo previo `larryvrh/MiniMax-H3-Turbo-Lora`, al que se le ha dado un empaquetado compatible con ComfyUI. No se especifica en la información disponible el rango del adaptador, las capas afectadas, el número de pasos de entrenamiento totales (el sufijo 850 apunta a un checkpoint intermedio, pero esto no está confirmado por el autor) ni el hardware utilizado.

Tampoco se documentan los datos de entrenamiento: no hay número de tokens, composición del dataset, resolución o modalidad de las muestras, ni indicación de si se emplearon técnicas de ajuste fino supervisado, destilación por consistencia, DPO o RLHF. La model card se limita a indicar que el modelo está afinado desde `minimax-h3`, que se puede cargar en RunningHub y que existe una versión original alojada por otro autor.

## Capacidades

- Aplicación de un adaptador LoRA sobre el modelo base `minimax-h3` dentro de un flujo de trabajo de ComfyUI.
- Muestreo acelerado: el nombre del artefacto indica inferencia en 4 pasos, lo que en la práctica reduce el número de evaluaciones del modelo por muestra frente a schedules de decenas de pasos.
- Carga en la plataforma RunningHub, tanto en su sitio internacional como en el sitio para China.
- Ejecución a través de la API de RunningHub para integrar la generación en servicios externos.
- Compatibilidad declarada con Hugging Face como plataforma de distribución del peso.
- Capacidades concretas del modelo base (modalidad, resolución, idiomas, control condicional, tool calling, agentes o modo de razonamiento): no disponibles en la información proporcionada.

## Casos de uso

- Generación acelerada en ComfyUI: cargar el adaptador sobre `minimax-h3` y ejecutar con 4 pasos de muestreo para reducir el tiempo por muestra en producción, siempre que la calidad resultante sea aceptable para el caso concreto (no hay métricas publicadas que lo confirmen).
- Procesamiento por lotes: al reducir el coste por iteración, el adaptador es adecuado para pipelines que generan cientos o miles de salidas en cola, donde el ahorro de cómputo por muestra se multiplica.
- Prototipado rápido de flujos nodales: permite iterar sobre prompts y parámetros en ComfyUI con una latencia baja antes de fijar una configuración definitiva con el modelo base sin adaptador.
- Integración como servicio: exposición mediante la API de RunningHub para que una aplicación externa solicite generaciones sin gestionar la infraestructura de GPU subyacente.
- Comparación de checkpoints: al existir el proyecto original `larryvrh/MiniMax-H3-Turbo-Lora`, este adaptador sirve para evaluar si el empaquetado para ComfyUI y el checkpoint 850 ofrecen un comportamiento equivalente o mejor en el mismo flujo.
- Despliegue en equipos con recursos limitados: la reducción de pasos de muestreo disminuye el cómputo total, lo que puede hacer viable la ejecución en GPU de gama consumer siempre que el modelo base `minimax-h3` ya quepa en memoria (requisito no documentado aquí).
- Canalización con otras LoRA: al ser un adaptador independiente, puede combinarse con otros adaptadores del ecosistema ComfyUI para ajustar estilo o condiciones, sujeto a que las incompatibilidades de pesos lo permitan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No hay datos de FID, CLIP score, IS, MMLU, HumanEval, GSM8K ni de ninguna otra métrica, ni comparaciones numéricas con el modelo base o con el proyecto original. Tampoco se declaran cifras de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El adaptador añade 744 MiB de pesos sobre el modelo base `minimax-h3`, de modo que el requisito dominante es el del modelo base, que no se especifica en la información proporcionada.
- GPU recomendadas: no disponibles. Dependen por completo del modelo base y de la resolución o modalidad de generación, datos ausentes en la ficha.
- Viabilidad en GPU de consumo: no verificable con la información disponible. El muestreo a 4 pasos reduce el cómputo respecto a un schedule completo, pero no el pico de memoria, que viene determinado por el modelo base.
- Opciones de despliegue declaradas: ComfyUI (local o en la nube), plataforma RunningHub y API de RunningHub. Hugging Face figura como plataforma de alojamiento del peso.
- Otros motores (vLLM, llama.cpp, Ollama, TGI): no aplicables o no disponibles, ya que se trata de un adaptador LoRA para un modelo generativo y no de un modelo de lenguaje con pesos completos.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por paso, tiempo por muestra ni muestras por segundo.

## Comparativa con modelos similares

| Artefacto | Parámetros | Contexto | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RunningHubAI/rh-minimax-h3-turbo-4step-ckpt850-t8-comfyui-lora` | no disponible (744 MiB en safetensors) | no disponible | 4 (según nombre del archivo) | no disponible | Hugging Face, ComfyUI, RunningHub |
| `larryvrh/MiniMax-H3-Turbo-Lora` (proyecto original del que deriva) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Modelo base `minimax-h3` | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar parámetros, contexto, rendimiento o licencia con alternativas de la misma categoría. Se recomienda consultar la ficha del proyecto original para obtener información potencialmente más completa.

## Limitaciones y advertencias

- Licencia no declarada: la model card remite a la licencia del proyecto original o upstream sin especificarla. No se debe asumir uso comercial permitido sin verificar la licencia de `minimax-h3` y la de `larryvrh/MiniMax-H3-Turbo-Lora`.
- Ausencia total de benchmarks: no hay evidencia publicada de que el muestreo en 4 pasos mantenga la calidad del modelo base; puede haber degradación de detalle, coherencia o fidelidad al prompt.
- Checkpoint intermedio: el sufijo 850 sugiere un punto de control no necesariamente final del entrenamiento, con el riesgo de sobreajuste o de comportamiento inestable que ello implica.
- Repositorio sin tracción: 0 descargas y 0 likes, por lo que no existe validación independiente de la comunidad ni reportes de uso en producción.
- Dependencia del modelo base: el adaptador no es autónomo; sin `minimax-h3` cargado, el archivo safetensors es inutilizable.
- Dependencia de la versión de ComfyUI: no se documenta la versión mínima ni los nodos requeridos, por lo que pueden aparecer incompatibilidades en entornos desactualizados.
- Metadatos inconsistentes: la fecha de creación declarada (26 de septiembre de 2026) es posterior a la fecha de consulta habitual de este tipo de fichas, lo que apunta a un error de metadatos o a una fecha programada.
- Idiomas y sesgos: no disponibles. No hay información sobre el tratamiento de sesgos, la representación cultural del dataset ni el soporte multilingüe.
- Riesgo de alucinación: en modelos generativos el equivalente son artefactos o salidas fuera de distribución; no se han publicado evaluaciones al respecto.
- Opacidad del entrenamiento: se desconoce el dataset, la metodología de destilación y el coste de cómputo, lo que impide auditar el origen de los pesos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-minimax-h3-turbo-4step-ckpt850-t8-comfyui-lora
- Proyecto original (LoRA de origen): https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora/tree/main
- Página del modelo en RunningHub: https://www.runninghub.ai/model/public/2085589898980405250
- Página del autor en RunningHub: https://www.runninghub.ai/user-center/1907375370302308353
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentación de la API de RunningHub (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Llamada a la API de Seedance 2.5 en RunningHub: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
