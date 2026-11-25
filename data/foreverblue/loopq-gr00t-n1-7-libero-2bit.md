# ForeverBlue/LoopQ-GR00T-N1.7-libero-2bit

## Resumen

LoopQ-GR00T-N1.7-libero-2bit es un checkpoint cuantizado a 2 bits del modelo vision-language-action (VLA) nvidia/GR00T-N1.7-LIBERO, publicado por el usuario ForeverBlue como artefacto de la investigación descrita en el artículo "Quantizing in the Loop: Drift-Aware Ultra-Low-Bit Vision-Language-Action Models" (LoopQ). El modelo resuelve el problema del coste de almacenamiento y despliegue de políticas robóticas de gran tamaño: comprime cada capa lineal del backbone visión-lenguaje y de la cabeza de acción (diffusion transformer), 432 capas en total, a 2 bits por peso, manteniendo el rendimiento de la tarea mediante calibración y ajuste fino sobre el benchmark LIBERO.

El checkpoint se distribuye como cuatro carpetas independientes, una por suite de LIBERO (libero_spatial, libero_object, libero_goal y libero_10), y cada una es un reemplazo directo del checkpoint correspondiente del modelo original de NVIDIA dentro del framework Isaac-GR00T. Los pesos cuantizados se decodifican a BF16 en el propio checkpoint, de modo que la inferencia se realiza con el mismo pipeline que el modelo base. El repositorio ocupa 27,6 GB y no registra descargas ni interacciones en el momento de redactar esta ficha.

Su relevancia actual radica en que demuestra que es viable llevar un VLA de robótica a precisión ultra-baja sin reentrenar desde cero, lo que abre la puerta a desplegar políticas de manipulación en hardware con recursos limitados. El modelo base GR00T N1.7 es un VLA de NVIDIA orientado a control robótico generalista, y esta variante hereda su licencia y su interfaz de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) con backbone vision-lenguaje y cabeza de acción diffusion transformer; cuantización LoopQ a 2 bits en capas lineales |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits por peso en 432 capas lineales, con pesos decodificados a BF16 en el checkpoint |
| Idiomas soportados | no disponible (modelo orientado a instrucciones robóticas) |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | safetensors |
| Tamano del repositorio | 27,6 GB |
| Pipeline | robotics |
| Modelo base | nvidia/GR00T-N1.7-LIBERO |

## Arquitectura y entrenamiento

El modelo es una variante cuantizada de GR00T N1.7, un VLA que combina un backbone visión-lenguaje con una cabeza de acción basada en diffusion transformer para generar trayectorias de manipulación. La innovación de LoopQ consiste en aplicar cuantización de 2 bits a todas las capas lineales de ambos componentes (432 capas en total) mediante un esquema de cuantización en el bucle de entrenamiento ("quantizing in the loop") que tiene en cuenta la deriva del modelo, es decir, la degradación acumulada que introduce la cuantización agresiva. El checkpoint ha sido calibrado y ajustado finamente sobre LIBERO, y el mismo checkpoint se evalúa también en LIBERO-Plus.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el modelo base. El autor no publica detalles sobre el proceso de calibración más allá de la referencia al artículo y al repositorio de GitHub, donde se encuentran el código, el protocolo de evaluación y los resultados por episodio.

## Capacidades

- Control robótico de manipulación guiado por instrucciones en lenguaje natural, con observaciones visuales y generación de acciones.
- Ejecución de políticas para cuatro suites de tareas de LIBERO: libero_spatial, libero_object, libero_goal y libero_10.
- Compatibilidad con LIBERO-Plus usando el mismo checkpoint.
- Integración directa con Isaac-GR00T mediante la clase `Gr00tPolicy` y el embodiment tag `LIBERO_PANDA`.
- Selección de suite mediante descarga parcial del repositorio con `snapshot_download` y el patrón de carpeta correspondiente.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni modo thinking en la información disponible.
- No se documentan capacidades multilingües ni de audio.

## Casos de uso

- Investigación en cuantización de modelos VLA: el checkpoint sirve como referencia reproducible para comparar el efecto de 2 bits frente a BF16 en tareas de manipulación, usando el protocolo de evaluación publicado en el repositorio de LoopQ.
- Despliegue de políticas de manipulación en entornos con memoria limitada: al reducir el peso de las capas lineales a 2 bits y decodificar a BF16, el checkpoint permite almacenar varias suites de LIBERO en un único repositorio de 27,6 GB y cargar solo la carpeta necesaria.
- Evaluación comparativa en LIBERO: cada carpeta es un reemplazo directo del checkpoint de NVIDIA, por lo que se puede sustituir en el pipeline de evaluación de Isaac-GR00T sin cambios de código y medir la tasa de éxito por tarea.
- Pruebas de robustez en LIBERO-Plus: el mismo checkpoint calibrado en LIBERO se ejecuta en la variante Plus, lo que permite estudiar la generalización de una política cuantizada a condiciones de evaluación distintas.
- Prototipado de agentes robóticos en laboratorio: el uso de `Gr00tPolicy` con `embodiment_tag="LIBERO_PANDA"` y dispositivo CUDA permite montar un bucle de percepción-acción sobre el simulador LIBERO para experimentar con instrucciones de goal.
- Docencia y reproducción de resultados: al ser un artefacto pequeño en comparación con el modelo completo y con instrucciones de uso explícitas, resulta adecuado para cursos o talleres sobre VLA y cuantización extrema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite al repositorio de GitHub del proyecto LoopQ para consultar el protocolo de evaluación y los resultados por episodio, pero no incluye cifras en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 27,6 GB, pero la carga se realiza por suite individual, por lo que el requisito real depende de la carpeta descargada y del framework.
- GPU recomendadas: no disponibles en la información proporcionada; el ejemplo de uso emplea `device="cuda"`.
- Compatibilidad con GPU de consumo: no confirmada; no se especifica en la model card.
- Opciones de despliegue: Isaac-GR00T con `Gr00tPolicy` (ruta oficial documentada). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un VLA de robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoopQ-GR00T-N1.7-libero-2bit | no disponible | no disponible | 2 bits en 432 capas lineales | NVIDIA Open Model License | Hugging Face, 0 descargas |
| nvidia/GR00T-N1.7-LIBERO | no disponible | no disponible | BF16 (original) | NVIDIA Open Model License | Hugging Face (modelo base) |
| Otras variantes cuantizadas de GR00T N1.7 | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría (otros VLA cuantizados) no está disponible en la información proporcionada. El único contraste documentado es con el modelo base, del que este checkpoint es un reemplazo directo por suite.

## Limitaciones y advertencias

- La cuantización a 2 bits puede degradar la precisión de las acciones generadas; el autor no publica en la model card las cifras de éxito que permitan cuantificar esa pérdida.
- El modelo está especializado en las tareas de LIBERO y no se documenta su comportamiento fuera de ese benchmark o de LIBERO-Plus.
- No se dispone de información sobre sesgos, riesgo de alucinación en instrucciones o limitaciones idiomáticas.
- La licencia NVIDIA Open Model License impone condiciones específicas para uso comercial; es necesario revisar el acuerdo enlazado antes de desplegar el modelo en producción.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validación comunitaria independiente de su funcionamiento.
- Los pesos se almacenan decodificados a BF16, de modo que el ahorro de memoria en disco es menor que el que sugeriría la cuantización a 2 bits; el beneficio principal es la fidelidad del checkpoint, no el tamaño del archivo.
- Es necesario usar la versión de Isaac-GR00T compatible con el modelo base y respetar el layout de carpetas por suite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ForeverBlue/LoopQ-GR00T-N1.7-libero-2bit
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-LIBERO
- Repositorio LoopQ (código, evaluación y resultados): https://github.com/ForeverBlue816/LoopQ
- Repositorio Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Logo del proyecto: https://raw.githubusercontent.com/ForeverBlue816/LoopQ/main/assets/logo.svg
