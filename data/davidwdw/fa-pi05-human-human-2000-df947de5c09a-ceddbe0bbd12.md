# davidwdw/fa-pi05-human-human-2000-df947de5c09a-ceddbe0bbd12

## Resumen

Este repositorio de HuggingFace (`davidwdw/fa-pi05-human-human-2000-df947de5c09a-ceddbe0bbd12`) no es un modelo nuevo, sino un archivo versionado de una flota de entrenamiento ("versioned fleet archive") que contiene un export de inferencia de una ejecución de ajuste supervisado (SFT) sobre el modelo π0.5. La model card únicamente indica la receta canónica empleada (`2026-09-23_b1k_task00_pi05_human_sft_h20_plan`), el nivel del paquete (`ema_params+assets`, export de inferencia) y advierte de que se trata de una instantánea, no de un espejo en vivo, por lo que recomienda verificar los SHA256SUMS.

π0.5 es un modelo vision-language-action (VLA) desarrollado por Physical Intelligence, que extiende π0 y está orientado a la generalización en entornos abiertos para manipulación robótica de horizonte largo. Según la información pública disponible, se co-entrena con fuentes diversas (demostraciones robóticas, datos web y subtareas semánticas) y puede controlar un manipulador móvil para, por ejemplo, ordenar una cocina o un dormitorio nuevos.

La relevancia de este repositorio concreto es de tipo reproducibilidad e investigación: permite recuperar exactamente una revisión de un ajuste sobre π0.5, pero no aporta por sí mismo especificaciones técnicas, licencia ni benchmarks, y cuenta con 0 descargas y 0 "likes" en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-language-action (VLA) derivado de π0.5 (basado en π0); detalles internos de la arquitectura no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es de instrucciones en lenguaje natural, pero no se detalla) |
| Licencia | no disponible |
| Formato de pesos | `ema_params` + `assets` (export de inferencia); no se especifica safetensors, GGUF ni otros formatos |

Otros datos conocidos del repositorio:

| Parametro | Valor |
|---|---|
| Autor | davidwdw |
| Tamano del repositorio | 12,4 GB |
| Receta canónica | `2026-09-23_b1k_task00_pi05_human_sft_h20_plan` |
| Nivel del paquete | `ema_params+assets` (export de inferencia) |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-27 / 2026-09-27 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. Por la información pública del modelo base π0.5, se trata de un modelo vision-language-action que procesa observaciones visuales y lenguaje para producir acciones de control robótico, construido sobre π0 y co-entrenado con demostraciones robóticas, datos web y subtareas semánticas para lograr generalización en entornos abiertos. El nombre de este repositorio sugiere una ejecución de SFT sobre datos etiquetados como "human" durante 2000 pasos sobre la tarea `task00`, si bien esta interpretación no está confirmada por el autor y debe tratarse con cautela.

La información adicional sobre el pipeline de entrenamiento (número de tokens, composición exacta del dataset, uso de RLHF/DPO, innovaciones como decodificación especulativa o atención lineal) no está disponible en los datos proporcionados. El paquete se presenta como export de inferencia con parámetros EMA, lo que implica que los pesos incluidos son una media exponencial de los parámetros y no necesariamente el estado final del optimizador.

## Capacidades

La información disponible solo permite atribuir al modelo base π0.5 las siguientes capacidades genéricas; las capacidades específicas de este archivo concreto no están documentadas.

- Generación de acciones robóticas para control de manipuladores, incluido un manipulador móvil.
- Comprensión conjunta de visión y lenguaje para ejecutar instrucciones de tareas físicas.
- Generalización a entornos no vistos (por ejemplo, cocinas o dormitorios nuevos) según la descripción pública de π0.5.
- Ejecución de tareas de horizonte largo con subtareas encadenadas.
- Ejecución de tareas físicas en zero-shot sobre distintas plataformas robóticas, según la ficha de Qualcomm AI Hub.
- Soporte de tool calling / function calling: no aplicable a un modelo VLA; no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad explícita.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo "thinking", visión, audio): visión inherente a la naturaleza VLA; el resto no disponible.

## Casos de uso

- Manipulación doméstica de horizonte largo: el modelo base está orientado a tareas como ordenar una cocina o un dormitorio, por lo que este export podría emplearse para reproducir dichos experimentos en un manipulador móvil.
- Investigación en generalización en entornos abiertos: útil para evaluar hasta qué punto una política VLA entrenada con datos diversos se transfiere a escenarios no vistos.
- Reproducción de experimentos de SFT: al tratarse de una instantánea con receta canónica y SHA256SUMS, permite reproducir exactamente una revisión concreta de un ajuste sobre π0.5.
- Ajuste adicional (fine-tuning) sobre tareas propias: partiendo del export de inferencia, un equipo podría adaptar la política a un robot o tarea específicos, siempre que la licencia lo permita (no disponible).
- Evaluación comparativa de políticas: sirve como punto de partida para comparar el efecto del SFT sobre datos "human" frente al modelo base π0.5 o a otras variantes del mismo autor.
- Despliegue en plataformas de borde: Qualcomm AI Hub documenta Pi0.5 como modelo desplegable, por lo que este tipo de pesos podría integrarse en flujos similares (requiere verificación de formato y compatibilidad).
- Docencia y formación en robótica con VLA: permite estudiar en la práctica el ciclo completo de un modelo vision-language-action, desde los pesos hasta el control del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye métricas, y los resultados de búsqueda consultados tampoco aportan cifras concretas de MMLU, HumanEval, GSM8K ni de benchmarks de manipulación robótica (por ejemplo, LIBERO) asociadas a esta revisión concreta.

## Requisitos de hardware

Las siguientes indicaciones son estimaciones derivadas del tamaño del repositorio (12,4 GB) y de la naturaleza del modelo base; no proceden de la documentación del autor.

- VRAM estimada para inferencia: al menos en el orden de 12-16 GB si los pesos se cargan en precisión nativa sin cuantizar, dado que el repositorio ocupa 12,4 GB. Es una estimación, no un dato confirmado.
- GPU recomendadas: no disponible en la documentación. Por el tamaño estimado, cabría esperar GPUs de gama alta de consumo (por ejemplo, RTX 4090 con 24 GB) y GPUs de centro de datos (A100, H100) para mayor margen.
- Compatibilidad con GPU de consumo: probablemente sí en tarjetas con 16-24 GB de VRAM si los pesos caben sin cuantizar, pero no está confirmado.
- Opciones de despliegue: no disponibles. El modelo base π0.5 aparece referenciado en Qualcomm AI Hub, lo que sugiere soporte para despliegue en plataformas de borde, pero este export concreto no documenta integración con vLLM, llama.cpp, Ollama ni TGI (herramientas, por otra parte, orientadas a modelos de lenguaje y no necesariamente aplicables a un VLA).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| davidwdw/fa-pi05-human-human-2000 (este) | VLA derivado de π0.5, export de inferencia | no disponible (repo 12,4 GB) | no disponible | no disponible | 0 descargas, 0 likes | Instantánea de flota, requiere verificar SHA256SUMS |
| π0.5 (base oficial de Physical Intelligence) | VLA generalista | no disponible | no disponible | no disponible | Publicado por Physical Intelligence (paper y blog) | Modelo de referencia sobre el que se construye este archivo |
| lerobot/pi05_libero_base | VLA π0.5 adaptado a LIBERO | no disponible | no disponible | no disponible | Repositorio público en HuggingFace | Variante orientada a benchmark LIBERO |
| π0 | VLA predecesor | no disponible | no disponible | no disponible | Publicado por Physical Intelligence | Antecesor directo de π0.5 |

Los datos cuantitativos (parámetros, contexto, resultados) de estas alternativas no están disponibles en la información proporcionada, por lo que la comparación se limita a la categoría y a la disponibilidad.

## Limitaciones y advertencias

- Model card mínima: solo incluye la receta, el nivel del paquete y una advertencia sobre la verificación de integridad; no documenta uso previsto ni limitaciones.
- Licencia no disponible: no se puede confirmar si se permite el uso comercial, lo que supone un riesgo legal para producción.
- Ausencia de benchmarks: no hay métricas que respalden su rendimiento, ni siquiera heredadas del modelo base.
- Sesgos: no documentados. Al co-entrenarse con datos web y demostraciones, el modelo base podría arrastrar sesgos presentes en esas fuentes, pero no hay información específica para esta revisión.
- Riesgo de alucinación: no evaluado para este archivo. Un modelo VLA puede ejecutar acciones incorrectas o inseguras ante instrucciones ambiguas.
- Idiomas: no se especifican; el modelo base trabaja con instrucciones en lenguaje natural, pero no se detalla cobertura multilingüe.
- Naturaleza de instantánea: es un archivo versionado, no un espejo en vivo. El autor advierte de que se debe usar la revisión exacta registrada y verificar SHA256SUMS para evitar corrupción o modificaciones.
- Dominio restringido: es un modelo de control robótico, no un modelo de lenguaje general; no debe emplearse como sustituto de un LLM para texto, código o matemáticas.
- Sin validación comunitaria: 0 descargas y 0 likes implican ausencia de retroalimentación externa sobre su funcionamiento real.
- Parámetros EMA: al exportar medias exponenciales, el comportamiento puede diferir del de un checkpoint final no promediado, lo que complica la comparación directa con otras revisiones.

## Enlaces

- Repositorio de este modelo en HuggingFace: https://huggingface.co/davidwdw/fa-pi05-human-human-2000-df947de5c09a-ceddbe0bbd12
- Modelo π0.5 de referencia en HuggingFace (lerobot): https://huggingface.co/lerobot/pi05_libero_base
- Paper de π0.5 ("π0.5: a Vision-Language-Action Model with Open-World Generalization"): https://www.pi.website/download/pi05.pdf
- Blog de Physical Intelligence sobre π0.5: https://www.pi.website/blog/pi05
- Ficha de Pi0.5 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/pi05
- Repositorio relacionado del mismo autor (`fa-pi05-attnfix-uniform-2000`): https://huggingface.co/davidwdw/fa-pi05-attnfix-uniform-2000-67aaba3ffbf1-e1cd3eb47393
