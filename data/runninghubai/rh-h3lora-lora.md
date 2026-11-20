# RunningHubAI/rh-h3lora-lora

## Resumen

`rh-h3lora-lora` es un adaptador LoRA publicado por RunningHubAI para el modelo base `minimax-h3`. No se trata de un modelo de lenguaje ni de un modelo fundacional completo, sino de un peso adicional de 148 MiB (0,2 GB en el repositorio) que se carga sobre el modelo original para modificar su comportamiento generativo. Según la model card, el adaptador no requiere palabra de activación (trigger word) y su objetivo declarado es corregir los movimientos de baile "extraños" que produce H3 de forma nativa, orientándolos hacia estilos como baile de TikTok o `宅舞` (wotagei/dance de idols). Se recomienda combinarlo con un "slider de marcado de ritmo de baile" del ecosistema RunningHub.

El adaptador está empaquetado para su uso en ComfyUI y en la plataforma RunningHub, tanto en su versión internacional como en la china. El autor original es el usuario `@四只兔子` de RunningHub, y el repositorio actúa como espejo de distribución en Hugging Face. La información pública es muy escasa: no se especifican arquitectura del modelo base, número de parámetros, contexto, idiomas ni licencia.

Por el tipo de tarea (generación de vídeo de baile a partir de un modelo denominado `minimax-h3`) y por las etiquetas `comfyui` y `lora`, se deduce que el adaptador opera sobre un modelo generativo de vídeo, no sobre un LLM. Cualquier evaluación de sus capacidades debe hacerse, por tanto, en términos de fidelidad de movimiento y coherencia temporal del vídeo generado, no de razonamiento o código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base `minimax-h3`; arquitectura del base no disponible |
| Parametros totales | no disponible (peso del adaptador: 148 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el fichero se distribuye en safetensors, presumiblemente en precisión nativa del base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible; la model card remite a la licencia del proyecto original o del modelo upstream |
| Formato de pesos | safetensors (`DANCE-minimax-h3.safetensors`) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente un adaptador LoRA entrenado sobre `minimax-h3`. No se publican detalles sobre el rango del adaptador, las capas objetivo, el número de pasos de entrenamiento, el dataset utilizado ni la composición del mismo. La model card solo indica que el fine-tuning parte de `minimax-h3` y que el objetivo es mejorar la naturalidad de los movimientos de baile, con especial énfasis en estilos de TikTok y `宅舞`.

No hay información sobre si el entrenamiento se realizó con vídeo anotado, con pares texto-vídeo o con algún esquema de refuerzo. Tampoco se documenta ninguna innovación técnica más allá del propio ajuste de bajo rango. El adaptador se distribuye como un único fichero de 148 MiB, coherente con un LoRA de tamaño moderado sobre un modelo de difusión de vídeo.

## Capacidades

- Modificación del estilo de baile generado por `minimax-h3`, orientándolo a coreografías tipo TikTok y `宅舞`.
- Funciona sin palabra de activación: el efecto se aplica de forma implícita al cargar el LoRA.
- Integración con el "slider de marcado de ritmo de baile" de RunningHub para sincronizar movimiento y tempo.
- Carga en ComfyUI mediante el nodo estándar de LoRA.
- Ejecución en la plataforma RunningHub (internacional y china) y a través de su API.
- No se documentan capacidades de texto, razonamiento, código, matemáticas, visión general, tool calling ni agentes; el adaptador no es un LLM.

## Casos de uso

- Generación de vídeos de baile para redes sociales: cargando el LoRA en un flujo de ComfyUI sobre `minimax-h3`, se obtienen coreografías más naturales para publicaciones en TikTok, con el slider de ritmo ajustando la sincronización.
- Producción de contenido para creadores de `宅舞`: el adaptador corrige el estilo de movimiento nativo del base, lo que reduce el número de regeneraciones necesarias para obtener una toma válida.
- Prototipado rápido en RunningHub: al estar integrado en la plataforma, se puede invocar vía API para generar clips de prueba sin montar infraestructura propia.
- Automatización de pipelines de vídeo corto: combinado con la API de RunningHub, el LoRA puede formar parte de un flujo que genere variantes de una coreografía a partir de un prompt y un audio.
- Iteración de estilos de danza en estudio: al no requerir trigger word, el adaptador se puede activar o desactivar por comparación directa para evaluar la mejora de movimiento.
- Generación de material de referencia para animadores: los clips resultantes pueden servir como base de rotoscopia o referencia de tempo para animación 2D/3D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende enteramente del modelo base `minimax-h3`, cuyos requisitos no se documentan en el repositorio.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el adaptador en sí ocupa 148 MiB, pero el coste real lo determina el modelo base.
- Opciones de despliegue: ComfyUI (flujo nativo del LoRA), plataforma RunningHub y su API. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un adaptador de difusión de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RunningHubAI/rh-h3lora-lora` | LoRA sobre `minimax-h3` | 148 MiB (adaptador) | no disponible | no disponible | Hugging Face, RunningHub, ComfyUI |
| `minimax-h3` (modelo base) | Generativo de vídeo | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Otros LoRA de danza para ComfyUI | LoRA | no disponible | no aplica | variable | Civitai, Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones del modelo base que permitan una comparación cuantitativa fiable con alternativas.

## Limitaciones y advertencias

- La información pública es mínima: no hay licencia declarada, ni idiomas, ni especificaciones del modelo base, lo que impide evaluar su idoneidad para uso comercial.
- La model card delega la licencia al proyecto original o al modelo upstream; es responsabilidad del usuario verificar los términos de `minimax-h3` antes de desplegarlo en producción.
- El adaptador está especializado en un estilo concreto (baile TikTok y `宅舞`); fuera de ese dominio puede degradar la calidad del movimiento respecto al modelo base.
- No hay evidencia publicada de calidad objetiva: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni evaluaciones independientes.
- Riesgo de artefactos y alucinaciones visuales inherente a los modelos generativos de vídeo; no se documenta ningún mecanismo de mitigación.
- Dependencia total del ecosistema RunningHub y de ComfyUI; no se garantiza compatibilidad con otros runners.
- El repositorio se creó y actualizó en noviembre de 2026, por lo que se trata de un artefacto muy reciente y sin historial de mantenimiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-h3lora-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2122594767946211329
- Página del autor: https://www.runninghub.cn/user-center/1903712633437167617
- RunningHub internacional: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (inglés): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-h3lora-lora/blob/main/README_cn.md
