# dreamdifferent/vam-cross-level5-panda-widowx-widowx-texture-teleopaligned-videolora200-action-decoder-iter1800

## Resumen

El modelo `dreamdifferent/vam-cross-level5-panda-widowx-widowx-texture-teleopaligned-videolora200-action-decoder-iter1800` es un checkpoint de un decodificador World2Action perteneciente a la familia VAM-Cross MimicVideo, publicado por el usuario dreamdifferent en HuggingFace. No es un modelo de lenguaje: es un componente de robótica que traduce observaciones de vídeo procedentes de dos cámaras a acciones de efector final, dentro de un pipeline que combina un backbone Video2World congelado, una LoRA de vídeo también congelada y este decodificador de acciones entrenable.

El checkpoint corresponde a la iteración 1800 de la ejecución `w2a_panda_widowx_level5_widowx_texture_2cam_hstack_action_iter2374_videolora_iter200_widowx_teleop_recording_frame_v1`, que se detuvo por causa "unknown" según la propia model card. El contrato de datos define 156 episodios y 54 421 fotogramas, dos cámaras (`corner_cam` y `front_cam`, apiladas en horizontal), y un objetivo de 15 acciones de efector final y pinza a 5 Hz en el marco `widowx_reference_base/teleop_aligned_tool`, con rotación representada en 6D y pose relativa a la pose alcanzada actual.

Su relevancia es acotada y experimental: se publica como peso aislado dentro de una familia de variantes (simulador robosuite, distintas iteraciones de LoRA), sin licencia declarada, sin benchmarks y con cero descargas, y no incluye los pesos congelados de los que depende, por lo que no es autónomo para inferencia directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador World2Action sobre backbone Video2World con LoRA de video congelada; tipo de red no especificado (no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto de texto; entrada multimodal de video) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible; el repositorio contiene el checkpoint junto con un `config.yaml` efectivo y un JSON fijado (tamano del repo: 1,0 GB) |

Datos adicionales del contrato de datos y del repositorio:

| Parametro | Valor |
|---|---|
| Iteracion del checkpoint | 1800 |
| Ejecucion de origen | `w2a_panda_widowx_level5_widowx_texture_2cam_hstack_action_iter2374_videolora_iter200_widowx_teleop_recording_frame_v1` |
| Estado de la ejecucion | detenida por causa `unknown` |
| Episodios / fotogramas del dataset | 156 / 54 421 |
| Camaras | `observation.images.corner_cam`, `observation.images.front_cam` (hstack) |
| Dimension de accion | 15 acciones de efector final alcanzado y pinza, a 5 Hz |
| Objetivo de pose | `relative_to_current_achieved_pose` en `widowx_reference_base/teleop_aligned_tool` |
| Representacion de rotacion | `rotation_6d` |
| Entradas congeladas requeridas | MimicVideo `e3355dbc93132b576c02f920a59b4fc18a4f5906`; backbone `dreamdifferent/widowx250-video-fused@f0cea76...`; decodificador inicial `dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder@93750cc...`; LoRA de video `dreamdifferent/vam-cross-level5-panda-widowx-widowx-texture-video-lora-iter200@3da54dd...` |
| Dataset de origen | `dreamdifferent/vam-cross-level5-panda-widowx-widowx-texture@160fcfd...` (no incluido) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del decodificador: no se especifica si se trata de un transformer, un MoE, un modelo de difusion o una combinacion. Lo que si se documenta es la estructura del pipeline: un backbone Video2World inicial (`widowx250-video-fused`), una LoRA de video congelada entrenada durante 200 iteraciones (`videolora_iter200`) y un decodificador de acciones que constituye la parte entrenable publicada aqui. El nombre de la ejecucion incluye `action_iter2374` y `videolora_iter200`, mientras que el peso subido corresponde a la iteracion 1800 del decodificador, es decir, un checkpoint intermedio y no necesariamente el mejor del entrenamiento.

En cuanto a los datos, el modelo se entreno sobre `vam-cross-level5-panda-widowx-widowx-texture`, con 156 episodios y 54 421 fotogramas capturados por dos camaras y registrados en configuracion de teleoperacion. El objetivo son 15 dimensiones de accion a 5 Hz (frecuencia de control de 200 ms por paso), con pose relativa a la pose alcanzada actual y rotacion en 6D, definidas en el marco `widowx_reference_base/teleop_aligned_tool`. La model card no menciona el uso de RLHF, DPO ni tecnicas de alineamiento por preferencias, algo esperable en un modelo de control robotico. Como innovacion destacable, el enfoque "mimic-video" plantea predecir acciones condicionadas por la dinamica de video, separando el conocimiento visual (backbone y LoRA congelados) de la cabeza de accion entrenable; la variante `hstack` indica la concatenacion horizontal de las dos vistas de camara. No hay informacion disponible sobre el numero total de tokens o muestras de video utilizados, ni sobre composicion adicional del dataset.

## Capacidades

- Prediccion de acciones de efector final y pinza: genera un vector de 15 acciones a partir de observaciones de video de dos camaras.
- Representacion de pose relativa: las acciones se expresan como pose relativa a la pose alcanzada actual, lo que favorece la estabilidad frente a pequenos errores acumulados de posicion absoluta.
- Rotacion en 6D: representacion continua de orientacion, adecuada para aprendizaje de politicas sin discontinuidades de cuaterniones.
- Control a 5 Hz: el contrato de datos fija una frecuencia de emision de acciones de 5 Hz, compatible con bucles de control de bajo coste computacional.
- Entrada multimodal de imagen: dos camaras (`corner_cam` y `front_cam`) concatenadas horizontalmente.
- Capacidad de reentrenamiento parcial: al ser un decodificador entrenable sobre componentes congelados, se puede ajustar sin reentrenar el backbone de video.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues: no procesa ni genera lenguaje.
- No se documentan modos especiales (thinking, vision-lenguaje, audio).

## Casos de uso

- Investigacion en imitacion robotica sobre WidowX: el modelo permite reproducir experimentos de prediccion de acciones desde video en un brazo WidowX, con un contrato de datos explicitamente documentado (15 acciones, 5 Hz, pose relativa), lo que facilita comparaciones reproducibles dentro del mismo entorno.
- Ajuste fino sobre datos propios de teleoperacion: dado que el decodificador es la parte entrenable y el backbone y la LoRA de video se congelan, se puede reentrenar la cabeza de accion con grabaciones propias grabadas en el mismo marco `teleop_aligned_tool` sin asumir el coste de reentrenar el modelo de video.
- Estudios de ablacion de LoRA de video: al existir variantes publicadas con LoRA entrenada a 200 y a 400 iteraciones, este checkpoint sirve para medir el efecto del componente visual congelado sobre la calidad de las acciones predichas.
- Analisis de dinamica de entrenamiento: al ser la iteracion 1800 de una ejecucion detenida, permite estudiar la evolucion del error de accion entre checkpoints intermedios y compararla con estados posteriores del mismo entrenamiento.
- Evaluacion de transferencia simulacion a realidad: la familia incluye variantes entrenadas sobre robosuite y sobre datos reales (widowx), lo que permite contrastar el comportamiento de un mismo diseno de decodificador en ambos dominios.
- Control en bucle cerrado a 5 Hz: el modelo puede integrarse en un bucle de control que consuma dos flujos de camara y emita 15 acciones cada 200 ms, siempre que el presupuesto de latencia del paso completo (incluido el backbone de video congelado) se mantenga por debajo de ese umbral.
- Reproduccion de politicas de teleoperacion alineada: al usar el marco `widowx_reference_base/teleop_aligned_tool`, encaja en pipelines que imitan grabaciones de teleoperacion con herramienta alineada, tipicas de configuraciones tipo ALOHA/WidowX.
- Referencia para auditoria de artefactos experimentales: util como ejemplo de publicacion de checkpoints intermedios con JSON fijado y `config.yaml` efectivo, practica poco extendida en investigacion robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, error de posicion, ni comparaciones numericas con otros metodos, y los resultados de busqueda no aportan metricas para este checkpoint ni para sus variantes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 1,0 GB, pero la inferencia real requiere ademas el backbone Video2World congelado y la LoRA de video, cuyos tamanos no se especifican en la informacion proporcionada.
- GPU recomendadas: no disponible. No hay indicacion del autor sobre hardware objetivo.
- Viabilidad en GPU de consumo: indeterminable con los datos disponibles; el tamano del repositorio (1,0 GB) es compatible con GPUs de consumo de gama media, pero el consumo real depende de los componentes congelados no incluidos.
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama ni TGI; estos frameworks estan orientados a modelos de lenguaje y no son aplicables directamente a un decodificador de acciones. El despliegue esperable seria inferencia en PyTorch con el codigo de MimicVideo en la revision indicada.
- Latencia y throughput: no se publican mediciones. El contrato de datos fija una frecuencia de accion de 5 Hz (200 ms por paso), que actua como presupuesto de latencia objetivo, no como latencia medida.
- Requisito adicional de software: es necesario disponer del commit de MimicVideo `e3355dbc93132b576c02f920a59b4fc18a4f5906` y de los tres artefactos congelados referenciados, que no se incluyen en este repositorio.

## Comparativa con modelos similares

| Modelo | Dominio de datos | Iteracion de LoRA de video | Checkpoint subido | Licencia | Descargas |
|---|---|---|---|---|---|
| `vam-cross-level5-panda-widowx-widowx-texture-...-videolora200-action-decoder-iter1800` (este) | widowx (real, textura, teleop alineado) | iter200 | iter1800 | no disponible | 0 |
| `vam-cross-level5-panda-robosuite-widowx-texture-...-videolora200-action-dec-9a6c710730` | robosuite (simulacion) | iter200 | no disponible | no disponible | no disponible |
| `vam-cross-level5-panda-robosuite-widowx-texture-...-videolora400-action-dec-68554cef79` | robosuite (simulacion) | iter400 | no disponible | no disponible | no disponible |

La comparacion se limita a lo observable en los identificadores de los repositorios de la misma familia publicados por el mismo autor. No hay informacion disponible sobre parametros, contexto, rendimiento ni licencia de ninguna de las variantes, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no se puede asumir ningun derecho de uso comercial; es imprescindible contactar con el autor antes de cualquier uso en produccion.
- Repositorio no autonomo: los tres pesos congelados requeridos y el dataset no estan incluidos, de modo que el checkpoint aislado no se puede ejecutar.
- Entrenamiento interrumpido: la ejecucion se detuvo por causa "unknown" y el peso publicado corresponde a la iteracion 1800, no al estado final del entrenamiento; no hay evidencia de que sea el mejor checkpoint de la ejecucion.
- Dataset pequeno y muy especifico: 156 episodios y 54 421 fotogramas en una unica configuracion de robot, camaras, iluminacion y marco de referencia; cabe esperar degradacion fuera de esa distribucion.
- Dependencia del marco de referencia: las acciones se definen como pose relativa en `widowx_reference_base/teleop_aligned_tool`; usarlas en otro sistema de coordenadas sin recalibracion produce resultados invalidos.
- Ausencia de benchmarks y de validacion externa: cero descargas y cero likes, sin tasas de exito publicadas ni evaluacion por terceros.
- Riesgo de alucinacion: no aplica en el sentido generativo de texto; el riesgo equivalente es la prediccion de acciones plausibles pero fisicamente inviables o inseguras ante entradas fuera de distribucion, con acumulacion de error en bucle cerrado.
- Sin datos sobre sesgos: no se documenta composicion demografica ni de entorno del dataset, aunque el riesgo de sesgo relevante aqui es de dominio fisico (objetos, texturas, posiciones y condiciones de las grabaciones).
- Limitaciones de idioma: no aplica, ya que el modelo no procesa lenguaje natural.
- Ambiguedad de nomenclatura: parte de los resultados de busqueda para el termino "VAM" corresponden a proyectos no relacionados (Virt-A-Mate), lo que dificulta localizar documentacion correcta; conviene guiarse siempre por el identificador completo del repositorio.
- Ausencia de informacion sobre cuantizacion y formato de pesos: complica la planificacion de despliegue y la estimacion de recursos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level5-panda-widowx-widowx-texture-teleopaligned-videolora200-action-decoder-iter1800
- Variante robosuite con LoRA de video iter200: https://huggingface.co/dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-teleopaligned-videolora200-action-dec-9a6c710730
- Variante robosuite con LoRA de video iter400: https://huggingface.co/dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-teleopaligned-videolora400-action-dec-68554cef79
- Backbone Video2World referenciado: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Decodificador de acciones inicial referenciado: https://huggingface.co/dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder
- LoRA de video congelada referenciada: https://huggingface.co/dreamdifferent/vam-cross-level5-panda-widowx-widowx-texture-video-lora-iter200
- Dataset de origen referenciado: https://huggingface.co/dreamdifferent/vam-cross-level5-panda-widowx-widowx-texture
- MimicVideo, revision requerida: commit `e3355dbc93132b576c02f920a59b4fc18a4f5906` (repositorio no enlazado en la informacion disponible)
- Brazo WidowX AI (Trossen Robotics), plataforma de referencia del modelo: https://www.trossenrobotics.com/widowx-ai
