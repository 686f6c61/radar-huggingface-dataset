# Lisavila/TacInno-VLA

## Resumen

TacInno-VLA es un conjunto de checkpoints de políticas vision-language-action (VLA) para control robótico, publicados por Weile Li y colaboradores de ShanghaiTech University, el Institute of AI for Industries (IAII) de la Academia China de Ciencias, la Universidad de Pekín y la Universidad de Washington en San Luis. El modelo acompaña al trabajo "TacInno: Teaching Vision-Language-Action Models the Contact Dynamics Beyond Vision and Action", que propone incorporar información táctil (visuo-táctil) en el entrenamiento de políticas VLA para capturar la dinámica de contacto que la visión y la acción por sí solas no recogen.

El repositorio contiene políticas independientes para seis tareas de simulación del benchmark UniVTAC (insert_hole, insert_tube, lift_bottle, lift_can, pull_out_key, put_bottle_in_shelf) y una política para cuatro tareas reales (Wipe Board, Insert Plug, Lift Can, Unscrew Cap), además de los tokenizadores que generan los objetivos de código durante el entrenamiento y variantes de tokenizador para un estudio de ablación. Las políticas se afinan a partir de π0.5 y emplean el tokenizador SentencePiece público de PaliGemma para las instrucciones y características de imagen de facebook/dinov2-base en los tokenizadores TacInno.

La relevancia del modelo está en su enfoque: la innovación táctil es solo un objetivo de entrenamiento, de modo que en despliegue las políticas leen imágenes, instrucción, estado propioceptivo y observación táctil sin necesidad de los tokenizadores. El repositorio ocupa 53 GB y la licencia hereda las condiciones de Gemma y de los modelos base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de π0.5, con entrada visuo-táctil |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (Gemma Terms of Use, heredada de π0.5 y PaliGemma) |
| Formato de pesos | safetensors (políticas); .pt (tokenizadores) |

## Arquitectura y entrenamiento

Las políticas son ajustes finos de π0.5, un modelo VLA que combina un backbone vision-language con un decodificador de acciones. La entrada en despliegue incluye imágenes, la instrucción en lenguaje natural, el estado propioceptivo y la observación táctil. El tokenizador de instrucciones es el SentencePiece público de PaliGemma, y los tokenizadores TacInno emplean características de imagen de facebook/dinov2-base. La "innovación táctil" del trabajo es un objetivo de entrenamiento: los tokenizadores producen los objetivos de código que se usan durante el ajuste, pero no son necesarios en inferencia.

El repositorio incluye tokenizadores separados para simulación y para el mundo real, además de cuatro variantes de ablación (no_conditioning, image_only, action_only, two_frame_t15) que permiten estudiar la contribución de cada modalidad. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. Cada directorio de política contiene model.safetensors, model_config.json, train_config.json y normalization/; cada tokenizador incluye los pesos (model_012000.pt), los argumentos de entrenamiento (args_000000.json) y la normalización de acciones (cmd_stats.pt).

## Capacidades

- Control robótico visuo-táctil: genera acciones a partir de imágenes, instrucción, estado propioceptivo y observación táctil.
- Ejecución de tareas de manipulación: inserción de piezas (hole, tube, plug), levantamiento de objetos (bottle, can), extracción de llaves, colocación en estantería, limpieza de pizarra y desenroscado de tapones.
- Condicionamiento por instrucción en lenguaje natural mediante el tokenizador PaliGemma.
- Políticas especializadas por tarea: un checkpoint por tarea de simulación y una política conjunta para las cuatro tareas reales.
- Estudio de ablación de modalidades mediante tokenizadores alternativos.
- No se documentan capacidades de tool calling, agentes multi-paso, generación de texto general ni visión conversacional.

## Casos de uso

- Automatización de inserción de piezas en líneas de montaje: la política sim/insert_hole (95 % de éxito en UniVTAC) puede controlar un brazo que inserta componentes en orificios con tolerancias ajustadas, usando la señal táctil para corregir el alineamiento final.
- Ensamblaje de tubos y conectores: sim/insert_tube (95 %) sirve para tareas de inserción de tubos donde la visión no basta para detectar el contacto y la fuerza aplicada.
- Manipulación de objetos deformables o ligeros: sim/lift_bottle (78 %) y sim/lift_can (88 %) permiten levantar botellas y latas detectando el agarre mediante la observación táctil.
- Extracción de componentes: sim/pull_out_key (94 %) aplica a operaciones de desmontaje o extracción de piezas encajadas.
- Colocación en estanterías: sim/put_bottle_in_shelf (75 %) cubre tareas de pick-and-place con restricciones de espacio.
- Tareas reales de limpieza y montaje: la política real/four_tasks aborda Wipe Board, Insert Plug, Lift Can y Unscrew Cap, adecuada para prototipos de robot de servicio o laboratorio que requieran contacto físico controlado.
- Investigación en aprendizaje por imitación: los tokenizadores y las variantes de ablación permiten reproducir el estudio de contribución de cada modalidad en un pipeline VLA.

## Benchmarks y rendimiento

Resultados de éxito en UniVTAC (100 semillas por tarea, el doble del límite de acciones por defecto):

| Tarea | Tasa de éxito (%) |
|---|---|
| Insert Hole | 95 |
| Insert Tube | 95 |
| Lift Bottle | 78 |
| Lift Can | 88 |
| Pull-out Key | 94 |
| Put Bottle | 75 |
| Media | 87,5 |

No se han publicado resultados de benchmarks en la información disponible para las tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio completo ocupa 53 GB, pero cada política se descarga por separado (por ejemplo, `--include "sim/lift_can/*"`).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: servidor de políticas incluido en el código (`python tools/serve_policy.py checkpoints/sim/lift_can --task lift_can:8000 --bind 0.0.0.0`), que expone la política por red; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TacInno-VLA | no disponible | no disponible | 87,5 % medio en UniVTAC | Gemma Terms of Use | Hugging Face (Lisavila/TacInno-VLA) |
| π0.5 | no disponible | no disponible | no disponible | no disponible | Modelo base del que se afina TacInno |
| Otros VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de π0.5 ni de otros VLA en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no aplicable en el sentido conversacional, pero las políticas pueden generar acciones incorrectas en estados no vistos; las tasas de éxito en simulación caen hasta el 75 % en Put Bottle.
- Limitaciones de contexto o idioma: no se documentan idiomas soportados; el condicionamiento lingüístico depende del tokenizador PaliGemma.
- Restricciones de licencia: los checkpoints derivan de π0.5 y sus componentes PaliGemma, por lo que su uso está sujeto a las licencias de esos modelos base, incluidos los Gemma Terms of Use; es necesario revisar las condiciones para uso comercial.
- Caveat para producción: el modelo está orientado a investigación en robótica; los resultados de simulación no garantizan el rendimiento en el mundo real, y las tareas reales no tienen tasas de éxito publicadas.
- La innovación táctil es solo un objetivo de entrenamiento; los tokenizadores no se usan en despliegue, pero el modelo requiere observación táctil en inferencia.
- El repositorio ocupa 53 GB; conviene descargar solo los checkpoints necesarios.

## Enlaces

- Hugging Face: https://huggingface.co/Lisavila/TacInno-VLA
- Página del proyecto: https://tacinno.github.io
- Código: https://github.com/LisavilaLee/TacInno
- arXiv: pendiente de publicación ("coming soon")
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Tokenizador PaliGemma (referenciado): no disponible como enlace directo en la información
- Modelo DINOv2 base (referenciado): https://huggingface.co/facebook/dinov2-base
