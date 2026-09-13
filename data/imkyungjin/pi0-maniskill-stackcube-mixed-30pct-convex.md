# ImKyungjin/pi0-maniskill-stackcube-mixed-30pct-convex

## Resumen

π₀ (Pi0) es un modelo de visión-lenguaje-acción (VLA) para control robótico generalista desarrollado originalmente por Physical Intelligence. Este repositorio concreto, publicado por el usuario ImKyungjin, es un ajuste fino del π₀ implementado en LeRobot (la librería de robótica de Hugging Face, adaptada del repositorio OpenPI) sobre el dataset local `maniskill_stackcube_mixed_30pct`, orientado a la tarea de apilar cubos (StackCube) del simulador ManiSkill. El checkpoint tiene 3.501.372.176 parámetros (unos 3,5 mil millones) y se distribuye en formato safetensors con licencia Apache 2.0.

A diferencia de un LLM convencional, este modelo consume observaciones visuales e instrucciones en lenguaje natural y produce directamente secuencias de acciones motoras, por lo que su salida no es texto sino comandos de control. Eso lo sitúa en la categoría de políticas robóticas (pipeline `robotics`) y explica que su despliegue se haga con `lerobot-record` en lugar de con runtimes de inferencia de LLM como vLLM u Ollama.

La relevancia de este checkpoint es acotada: se trata de un ajuste fino experimental, sin descargas ni likes en el momento de redactar esta ficha, y cuyo dataset de entrenamiento no está publicado en el Hub (aparece como `local/maniskill_stackcube_mixed_30pct`). Resulta útil como ejemplo de flujo de trabajo de ajuste fino de π₀ en LeRobot, pero no debe confundirse con el modelo π₀ base de Physical Intelligence ni con un modelo de propósito general listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) derivada de π₀; la model card no detalla los componentes internos, que en la implementacion publica de OpenPI corresponden a un backbone vision-lenguaje tipo PaliGemma mas un experto de acciones con flow matching |
| Parametros totales | 3.501.372.176 (segun safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo se condiciona con instrucciones de tarea cortas, pero la model card no declara una ventana de contexto) |
| Tipos de cuantizacion | no disponible; solo se publican pesos completos en safetensors, sin variantes GGUF, int8 ni int4 |
| Idiomas soportados | no disponible (la model card no lo especifica; π₀ se entrena con instrucciones de tarea en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tamano del repositorio | 7,0 GB |
| Pipeline declarado | robotics |
| Dataset declarado | local/maniskill_stackcube_mixed_30pct |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de π₀, un modelo fundacional de robótica presentado por Physical Intelligence como la primera política generalista capaz de interpretar entradas visuales, seguir instrucciones en lenguaje natural y controlar distintos robots en tareas diversas. La model card de este repositorio indica que la implementación empleada es la de LeRobot, adaptada del repositorio de código abierto OpenPI, y remite al blog de Physical Intelligence para los detalles del modelo original. La model card no describe la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

En cuanto al ajuste fino concreto, el identificador del repositorio (`pi0-maniskill-stackcube-mixed-30pct-convex`) y el campo `datasets` apuntan a un entrenamiento sobre datos de ManiSkill para la tarea StackCube, con una mezcla de datos al 30 % y un término "convex" que la model card no explica. El dataset referenciado es local, no está publicado en el Hub, y no se documentan hiperparámetros, número de pasos ni recetas de entrenamiento. La model card únicamente incluye las instrucciones genéricas de LeRobot para entrenar desde cero (`lerobot-train`) y para evaluar la política (`lerobot-record`), con un ejemplo que además usa `--policy.type=act`, no π₀, por lo que no constituye una receta específica de este checkpoint.

## Capacidades

- Generación de acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural (política VLA).
- Control robótico para manipulación, en el dominio concreto de la tarea StackCube de ManiSkill.
- Condicionamiento por lenguaje: acepta una instrucción de tarea como entrada, además de las imágenes.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y grabación de episodios.
- Soporte de tool calling: no disponible (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): visión sí, como entrada del sistema VLA; audio y modo thinking, no disponibles.

## Casos de uso

- Evaluación de políticas VLA en simulación: cargar el checkpoint con `lerobot-record` apuntando a `--policy.path` y ejecutar episodios de la tarea StackCube en ManiSkill para medir la tasa de éxito de la política.
- Reproducción de experimentos de ajuste fino: sirve como referencia de un fine-tune de π₀ sobre un dataset propio, útil para comparar recetas de mezcla de datos (el nombre sugiere una mezcla al 30 %).
- Punto de partida para ajustes posteriores: al ser Apache 2.0 y estar en formato safetensors compatible con LeRobot, puede reentrenarse sobre datasets adicionales de manipulación.
- Docencia e investigación en robótica: ejemplo práctico de pipeline completo visión-lenguaje-acción dentro de LeRobot, con código de entrenamiento y de evaluación documentado.
- Pruebas de infraestructura de inferencia robótica: permite validar el rendimiento de un servidor GPU con un modelo de 3,5 B parámetros que genera acciones en lugar de texto.
- Comparación de arquitecturas de políticas: confrontar esta política basada en π₀ frente a políticas tipo ACT o diffusion policy sobre la misma tarea de apilado.
- Investigación sobre brecha simulación-realidad: si el modelo se entrena íntegramente en ManiSkill, puede usarse como base para estudiar transferencia a un robot físico (por ejemplo, una plataforma SO-100/SO-101 soportada por LeRobot).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de ManiSkill ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del recuento de parámetros de safetensors, no confirmada por el autor): aproximadamente 14 GB en fp32, 7 GB en bf16/fp16, 3,5 GB en int8 y 1,75 GB en int4. Al no distribuirse pesos cuantizados, la cuantización requeriría convertir el checkpoint por cuenta propia.
- GPU recomendadas: NVIDIA A100 o H100 para entrenamiento y evaluación por lotes; RTX 4090, RTX 3090 o RTX 4080 para inferencia en bf16 con holgura.
- Cabe en GPU de consumo: sí, en tarjetas con 12-16 GB o más en bf16; en tarjetas de 8 GB solo con cuantización o descarga parcial a CPU, con la penalización de latencia correspondiente.
- Opciones de despliegue: LeRobot (`lerobot-record`, `lerobot-train`, y las utilidades de evaluación de la librería) y la pila de OpenPI para el modelo π₀ original. No hay soporte declarado para vLLM, TGI, llama.cpp ni Ollama, ya que la salida del modelo son acciones y no tokens de texto.
- Latencia y throughput estimados: no disponible. La model card no publica velocidad de inferencia ni frecuencia de control alcanzable.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de información pública general y pueden variar según la versión consultada; los de este checkpoint son los únicos verificados en la información proporcionada.

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este checkpoint (π₀ fine-tune ManiSkill StackCube) | 3,5 B | VLA (π₀ sobre LeRobot) | Apache 2.0 | Hugging Face, 0 descargas |
| π₀ base (Physical Intelligence / OpenPI) | ~3,3 B | VLA | Apache 2.0 (OpenPI) | Repositorio OpenPI y pesos publicados |
| OpenVLA | 7 B | VLA (basado en Llama 2 + DINOv2 + SigLIP) | MIT | Pesos y codigo publicos |
| Octo | 27 M / 93 M | Politica transformer (sin backbone VLM grande) | Apache 2.0 / MIT segun variante | Pesos y codigo publicos |
| RDT-1B | 1,2 B | Diffusion transformer para manipulacion bimanual | MIT | Pesos y codigo publicos |

## Limitaciones y advertencias

- Especializacion extrema: el ajuste esta orientado a la tarea StackCube sobre datos de ManiSkill; no cabe esperar comportamiento generalista fuera de ese dominio.
- Trazabilidad limitada: el dataset de entrenamiento se declara como `local/maniskill_stackcube_mixed_30pct` y no esta publicado, por lo que no es posible reproducir el entrenamiento ni auditar la composicion de los datos.
- Sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de terceros que hayan validado el checkpoint.
- Documentacion insuficiente: la model card no aporta hiperparametros, numero de pasos, metricas ni el significado del termino "convex" del nombre del repositorio.
- Brecha simulacion-realidad: si los datos provienen exclusivamente de ManiSkill, el rendimiento en un robot fisico puede degradarse de forma notable por diferencias de dinamica, iluminacion y calibracion.
- Riesgo de alucinacion: no aplica en el sentido textual, pero si existe riesgo de acciones fisicamente invalidas o inseguras cuando la politica se ejecuta sobre hardware real.
- Sesgos: no disponibles; el autor no documenta sesgos de dataset, demograficos ni de tarea.
- Idioma: la model card no declara idiomas soportados; las instrucciones de tarea de π₀ se formulan tipicamente en ingles, y no hay garantia de comportamiento correcto en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero el usuario debe verificar las condiciones de los pesos originales de π₀ y de los datos de ManiSkill utilizados en el ajuste.
- Produccion: no se recomienda desplegar este checkpoint en un sistema real sin una evaluacion propia de seguridad, tasa de exito y latencia, dado que no hay metricas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ImKyungjin/pi0-maniskill-stackcube-mixed-30pct-convex
- Blog de π₀ en Physical Intelligence (referenciado en la model card): https://www.physicalintelligence.company/blog/pi0
- Repositorio OpenPI (referenciado en la model card): https://github.com/Physical-Intelligence/openpi
- LeRobot en GitHub: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas en LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
