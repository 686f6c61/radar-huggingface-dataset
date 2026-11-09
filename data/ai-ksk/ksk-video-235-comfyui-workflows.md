# AI-KSK/ksk-video-235-comfyui-workflows

## Resumen

AI-KSK/ksk-video-235-comfyui-workflows es un repositorio de flujos de trabajo (workflows) para ComfyUI publicado por el usuario AI-KSK, no un modelo de pesos en sentido estricto. El repositorio acompaña a un episodio de video tutorial y contiene tres grafos JSON: un flujo de realismo UltraReal basado en un fine-tune de Anima Preview 1, un flujo Turbo de 8 pasos con un LoRA acelerador, y un grafo comparativo entre Flux2 Klein y Qwen-Image-Edit en sus versiones 2509 y 2511. El tamaño del repositorio es de 0.0 GB, lo que confirma que no incluye checkpoints ni pesos, solo la definición de los grafos.

El objetivo declarado es convertir personajes de anime en fotografías realistas (anime-to-real) mediante el fine-tune UltraReal, que incorpora grupos de reparación de cara, manos y pies construidos con SAM y GroundingDino. Adicionalmente, el flujo Turbo permite reducir la generación a 8 pasos, y el grafo comparativo sirve para evaluar tres modelos de edición de imagen con sus respectivos aceleradores en un mismo pipeline.

Es relevante para desarrolladores que trabajan con ComfyUI y pipelines de text-to-image, ya que documenta de forma explícita cada checkpoint, nombre de LoRA, fuerza y valor de sampler extraídos del JSON. No obstante, la información disponible no permite caracterizar un modelo con parámetros, contexto o benchmarks propios, por lo que las secciones técnicas se limitan a lo que el autor declara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene grafos de ComfyUI, no pesos; los flujos referencian Anima Preview 1, Flux2 Klein y Qwen-Image-Edit-2509/2511) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | JSON (grafos de workflow de ComfyUI); no se distribuyen pesos en el repositorio |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado, sino tres grafos de ComfyUI en formato JSON. El primero, UltraReal, consta de 38 nodos e integra grupos de reparación facial, de manos y de pies mediante SAM y GroundingDino sobre un fine-tune de Anima Preview 1 sesgado hacia el realismo. El segundo, Turbo, consta de 18 nodos, opera a 512x512 y aplica un LoRA de 8 pasos con fuerza 1.0. El tercero, comparativo, consta de 83 nodos y enfrenta Flux2 Klein, Qwen-Image-Edit-2509 y Qwen-Image-Edit-2511 junto con sus aceleradores correspondientes.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF o DPO en el fine-tune UltraReal. El autor sí señala un problema de datos: el fine-tune vio demasiados rostros no asiáticos, lo que degrada la calidad en caras asiáticas. La innovación técnica destacable es la orquestación de reparación por regiones (cara, manos, pies) dentro del grafo, más el uso de un LoRA Turbo para reducir la inferencia a 8 pasos.

## Capacidades

- Generación text-to-image con sesgo realista mediante el flujo UltraReal sobre Anima Preview 1.
- Conversión anime-to-real de personajes, con reparación específica de cara, manos y pies usando SAM y GroundingDino.
- Generación acelerada en 8 pasos a 512x512 con el LoRA Turbo a fuerza 1.0.
- Comparación multi-modelo en un único grafo entre Flux2 Klein, Qwen-Image-Edit-2509 y Qwen-Image-Edit-2511 con sus aceleradores.
- Edición de imagen (los flujos comparativos emplean modelos de la familia Qwen-Image-Edit).
- Ejecución en ComfyUI y en la plataforma RunningHub mediante los enlaces publicados.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Reparación de rostros en retratos generados: el grafo UltraReal incorpora un grupo de nodos con SAM y GroundingDino que detecta y reprocesa la región facial, útil cuando la generación inicial produce caras deformadas.
- Corrección de manos y pies en ilustraciones anime-to-real: los grupos de reparación dedicados permiten reinyectar detalle en extremidades, que suelen ser el punto débil de los modelos de difusión.
- Prototipado rápido de imágenes a 512x512: el flujo Turbo de 8 pasos sirve para iterar sobre prompts con bajo coste computacional antes de lanzar una generación de mayor calidad.
- Evaluación comparativa de modelos de edición: el grafo de 83 nodos permite ejecutar Flux2 Klein y Qwen-Image-Edit-2509/2511 con sus aceleradores sobre la misma entrada y comparar resultados de forma controlada.
- Integración en pipelines de ComfyUI existentes: al ser JSON, los grafos se importan directamente y se pueden adaptar cambiando checkpoints, LoRAs y samplers documentados por el autor.
- Reproducción de tutoriales: los enlaces a RunningHub y YouTube permiten ejecutar los flujos sin montar infraestructura local, útil para formación de equipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio no distribuye pesos y no declara requisitos de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; depende de los checkpoints referenciados (Anima Preview 1, Flux2 Klein, Qwen-Image-Edit), cuyos requisitos no se detallan.
- Opciones de despliegue: ComfyUI (formato nativo de los grafos) y la plataforma RunningHub mediante los enlaces publicados.
- Latencia y throughput: no disponibles. El autor solo indica que el flujo Turbo reduce la generación a 8 pasos a 512x512.

## Comparativa con modelos similares

| Aspecto | Este repositorio | Anima Preview 1 (base referenciada) | Flux2 Klein (referenciado en el grafo) | Qwen-Image-Edit-2509/2511 (referenciados) |
|---|---|---|---|---|
| Tipo | Grafos ComfyUI (JSON) | Modelo de difusión | Modelo de difusión/edición | Modelo de edición de imagen |
| Parametros | no disponible | no disponible | no disponible | no disponible |
| Contexto | no disponible | no disponible | no disponible | no disponible |
| Licencia | other | no disponible | no disponible | no disponible |
| Pesos incluidos | No (0.0 GB) | No en este repo | No en este repo | No en este repo |

No se dispone de datos de rendimiento ni de especificaciones numéricas de los modelos referenciados en la información proporcionada, por lo que la comparación se limita a su papel dentro de los grafos.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es un conjunto de workflows JSON, por lo que no puede evaluarse como modelo de forma aislada.
- Sesgo documentado por el autor: el fine-tune UltraReal vio demasiados datos faciales no asiáticos, lo que produce resultados más débiles en caras asiáticas.
- El flujo de 8 pasos sacrifica adherencia al prompt y detalle fino; el autor describe los resultados como inacabados aunque consistentes en estilo.
- Anima Preview 1 sigue produciendo breakdowns, motivo por el que el flujo oficial incluye grupos de reparación.
- Licencia "other": no se especifican términos de uso comercial; es necesario consultar las condiciones de los checkpoints y LoRAs referenciados antes de un despliegue en producción.
- Idioma declarado únicamente "en"; no se garantiza soporte multilingüe en los prompts.
- Sin descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/ksk-video-235-comfyui-workflows
- Workflow UltraReal (RunningHub): https://www.runninghub.ai/post/2052302245529694209/?inviteCode=rh-v1111
- Workflow 8-step (RunningHub): https://www.runninghub.ai/post/2052343882582634497/?inviteCode=rh-v1111
- Comparativa anime-to-real (RunningHub): https://www.runninghub.ai/post/2052281071861026818/?inviteCode=rh-v1111
- Tutorial en video (YouTube): https://www.youtube.com/watch?v=23YfGpuLgLI
- Original en chino (Bilibili): https://www.bilibili.com/video/BV1d8dPBCErN
