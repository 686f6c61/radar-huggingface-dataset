# ngustj/smolvla_paper_cup_test

## Resumen

`ngustj/smolvla_paper_cup_test` es un checkpoint de robótica publicado por el usuario ngustj en HuggingFace, consistente en un ajuste fino (fine-tuning) del modelo base `lerobot/smolvla_base`. Se distribuye a través de la librería LeRobot con pesos en formato safetensors y está etiquetado como modelo de tipo vision-language-action (VLA), es decir, un modelo que recibe imágenes de cámara, el estado del robot y una instrucción en lenguaje natural, y produce directamente comandos de acción motora. El nombre del repositorio y el dataset asociado (`ngustj/paper_cup_pick_place`) sugieren que se trata de un experimento de agarre y colocación de un vaso de papel.

SmolVLA, el modelo base sobre el que se construye, es un VLA compacto desarrollado por HuggingFace y descrito en el paper arXiv:2506.01844. Combina un modelo de visión-lenguaje pequeño (de la familia SmolVLM) con un "action expert" que genera secuencias de acciones mediante flow matching. Su relevancia actual radica en que demuestra que es posible entrenar y ejecutar políticas de manipulación robótica en hardware de consumo, algo que los VLA de gran tamaño (OpenVLA, pi0, GR00T) no permiten sin GPUs de datacenter.

Este repositorio concreto, sin embargo, es un artefacto personal: acumula cero descargas y cero "likes" en el momento de la consulta, no incluye model card descriptiva, y no publica hiperparámetros, número de pasos de entrenamiento ni resultados de evaluación. Por tanto, cualquier dato específico sobre el fine-tuning debe considerarse no disponible; las características que se detallan a continuación corresponden al modelo base SmolVLA y a la configuración declarada en las etiquetas del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en transformer: VLM de la familia SmolVLM + action expert con flow matching (heredada del modelo base `lerobot/smolvla_base`) |
| Parametros totales | Aproximadamente 450 M en el modelo base SmolVLA; el repositorio no declara el recuento exacto de este checkpoint |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors (sin versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 segun la etiqueta `license:apache-2.0` del repositorio; el campo de licencia de la ficha aparece como no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La familia SmolVLA, a la que pertenece el modelo base, emplea una arquitectura de dos componentes. Por un lado, un modelo de visión-lenguaje compacto (familia SmolVLM/SmolVLM-2) que procesa los fotogramas de las cámaras junto con la instrucción textual y el estado proprioceptivo del robot. Por otro, un "action expert" de tamaño reducido que genera "chunks" de acciones continuas mediante un objetivo de flow matching, en lugar de predecir una única acción discreta por paso. El paper describe además un esquema de atención intercalada en el que los tokens visuales se procesan solo en las primeras capas del modelo, lo que reduce el coste computacional, y una estrategia de inferencia asíncrona que permite solapar el cálculo de la política con la ejecución de las acciones en el robot.

El modelo base SmolVLA se preentrena sobre cientos de datasets comunitarios de robótica alojados en el ecosistema LeRobot (el paper indica 481 datasets), lo que le proporciona una inicialización generalista para tareas de manipulación. Sobre esa base, este repositorio aplica un fine-tuning específico con el dataset `ngustj/paper_cup_pick_place`, orientado a una tarea de recogida y colocación de un vaso de papel. No se dispone de información sobre el número de episodios del dataset, el número de pasos de entrenamiento, la composición exacta de las observaciones (número de cámaras, frecuencia de control), el uso de RLHF/DPO —poco habitual en robótica—, ni sobre las GPUs empleadas en el ajuste.

## Capacidades

- Generación de acciones motoras continuas: dado un conjunto de observaciones visuales, el estado del robot y una instrucción en lenguaje natural, el modelo produce secuencias de acciones (action chunks) para un manipulador.
- Control visomotor de corto horizonte: adecuado para tareas de pick-and-place y manipulación guiada por instrucciones.
- Entrada multimodal: procesa imágenes de una o varias cámaras junto con el vector de estado del robot (posición de articulaciones, pinza, etc.).
- Condicionamiento por lenguaje: acepta instrucciones textuales del tipo "coge el vaso de papel y colócalo en la bandeja", siempre dentro del dominio de la tarea de fine-tuning.
- Integración nativa con LeRobot: se carga mediante la librería `lerobot` y sus utilidades de política, entrenamiento y evaluación.
- No es un modelo de propósito general: no genera texto, no mantiene conversaciones y no implementa razonamiento de múltiples pasos.
- Soporte de tool calling / function calling: no disponible (no aplica a un modelo de acción).
- Soporte de agentes: no disponible (no aplica).
- Capacidades multilingües: no disponibles; el comportamiento ante instrucciones en idiomas distintos del utilizado en el fine-tuning es desconocido.
- Capacidades especiales (modo thinking, audio, etc.): no disponibles.

## Casos de uso

- Recogida y colocación de objetos sobre un brazo robótico de bajo coste: el modelo está ajustado específicamente para manipular un vaso de papel, por lo que puede emplearse como política de control en un montaje tipo SO-100/SO-101 dentro de un entorno de laboratorio o aula.
- Reproducción y verificación de un pipeline de fine-tuning con LeRobot: sirve como ejemplo reproducible de cómo pasar de un modelo base VLA a una política especializada en una tarea concreta, útil para quien quiera repetir el procedimiento con su propio dataset.
- Docencia en robótica e IA: al tratarse de un modelo pequeño y de licencia permisiva, permite explicar en clase el ciclo completo de captura de datos, entrenamiento y despliegue de una política visomotora sin necesidad de clústeres de GPU.
- Pruebas de integración de extremo a extremo: sirve para validar la cadena cámara → política → controlador del robot → actuadores en un entorno controlado antes de invertir en datasets mayores.
- Punto de partida para nuevos fine-tunings: al derivar de `lerobot/smolvla_base` con licencia Apache 2.0, puede reutilizarse como inicialización para tareas de agarre similares, reduciendo el volumen de datos necesarios.
- Evaluación comparativa de políticas VLA en tareas simples: permite contrastar el comportamiento de un VLA compacto frente a alternativas como ACT o Diffusion Policy en una misma tarea de pick-and-place.
- Prototipado rápido en investigación sobre manipulación asistida por lenguaje: útil para experimentar con variaciones de instrucciones y observar la robustez del condicionamiento textual en una tarea acotada.

En todos estos casos conviene tener presente que se trata de un checkpoint de prueba con cero descargas y sin documentación de evaluación, por lo que su uso en producción requeriría una validación propia y exhaustiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de métricas, curvas de éxito por tarea, ni comparaciones con otras políticas. El paper del modelo base (arXiv:2506.01844) reporta evaluaciones en simulación y en robot real, pero las cifras concretas no forman parte de la información proporcionada y no deben atribuirse a este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la ficha. Como referencia del modelo base, un VLA de aproximadamente 450 M de parámetros en precisión fp16 ocupa en torno a 1 GB de pesos; a ello hay que sumar el coste de activaciones y del pipeline de visión, que depende de la resolución y del número de cámaras. Estas cifras son estimaciones a partir del tamaño del modelo base y no un dato publicado para este repositorio.
- GPU recomendadas: no disponible. Por el tamaño del modelo base, es razonable esperar que funcione en GPUs de consumo (por ejemplo, RTX 3060/4060/4090) e incluso en hardware embebido tipo Jetson, pero no hay confirmación en la información proporcionada.
- Cabe en GPU de consumo: muy probablemente sí, dado el tamaño del modelo base; sin confirmación oficial para este checkpoint.
- Opciones de despliegue: LeRobot (`lerobot`) sobre PyTorch es la vía natural, ya que el repositorio está etiquetado con esa librería. `vLLM`, `llama.cpp`, `Ollama` y `TGI` no soportan modelos VLA de este tipo.
- Latencia y throughput estimados: no disponibles. El paper del modelo base describe una estrategia de inferencia asíncrona para mejorar el rendimiento, pero no se dispone de cifras aplicables a este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|
| `ngustj/smolvla_paper_cup_test` | ~450 M (heredados del base) | VLA con flow matching | Apache 2.0 (segun etiqueta) | HuggingFace, via LeRobot |
| `lerobot/smolvla_base` | ~450 M | VLA con flow matching | No disponible en la informacion proporcionada | HuggingFace, via LeRobot |
| OpenVLA-7B | 7 B | VLA autorregresivo sobre VLM | No disponible en la informacion proporcionada | Pesos abiertos en HuggingFace |
| pi0 (Physical Intelligence) | ~3,3 B | VLA con flow matching | No disponible en la informacion proporcionada | Pesos abiertos en el repositorio openpi |
| GR00T N1 (NVIDIA) | ~2 B | VLA de proposito general | No disponible en la informacion proporcionada | Pesos abiertos en HuggingFace |

La diferencia principal es de escala: SmolVLA es aproximadamente un orden de magnitud menor que OpenVLA, pi0 o GR00T N1, lo que se traduce en menor capacidad de generalización pero también en requisitos de hardware mucho más modestos. Los datos de rendimiento comparado no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo de prueba sin documentación: cero descargas, cero "likes" y ausencia de model card. No hay garantía de que los pesos estén correctamente entrenados, convergidos o listos para su uso.
- Dominio extremadamente estrecho: el ajuste se ha realizado sobre una única tarea (recogida y colocación de un vaso de papel). Fuera de ese contexto, el comportamiento es impredecible.
- Sin datos de evaluación: no se conocen tasas de éxito, robustez ante cambios de iluminación, posición de la cámara o variaciones del objeto.
- Riesgo de sobreajuste: con un dataset aparentemente reducido y sin información sobre el número de pasos, es plausible un sobreajuste a las condiciones exactas de recogida de datos.
- Sesgos: no disponibles. En robótica, los sesgos se manifiestan como fallos sistemáticos ante objetos, texturas o condiciones de iluminación poco representados en el dataset de entrenamiento.
- Alucinación: en sentido estricto, el modelo no genera texto libre, por lo que el riesgo clásico de alucinación no aplica; sí puede producir trayectorias de acción inválidas o inseguras, que es el equivalente funcional en este dominio.
- Limitaciones de idioma: no disponibles. El modelo base es multilingüe en su componente de lenguaje, pero el fine-tuning puede haber degradado el seguimiento de instrucciones en idiomas no vistos.
- Restricciones de licencia: la etiqueta indica Apache 2.0, lo que en principio permite uso comercial, pero la ficha del repositorio marca la licencia como no disponible y el autor no ofrece garantías. Conviene verificar la licencia del modelo base `lerobot/smolvla_base` antes de cualquier uso comercial.
- Seguridad física: cualquier despliegue en un robot real exige límites de par, paradas de emergencia y validación en entorno controlado; un fallo de política puede provocar daños materiales o personales.
- Fecha de creación anómala: el repositorio figura creado el 14 de septiembre de 2026, lo que sugiere metadatos inconsistentes o un error de registro. Esto refuerza la cautela sobre la fiabilidad del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ngustj/smolvla_paper_cup_test
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Dataset asociado: https://huggingface.co/datasets/ngustj/paper_cup_pick_place
- Librería LeRobot: https://github.com/huggingface/lerobot
- Perfil del autor: https://huggingface.co/ngustj

No se han encontrado en la busqueda web otros enlaces relevantes para este modelo; los resultados devueltos correspondian a contenido no relacionado (foros y repositorios sobre ChatGPT).
