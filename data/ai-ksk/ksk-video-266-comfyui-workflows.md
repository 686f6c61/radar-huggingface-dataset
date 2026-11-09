# AI-KSK/ksk-video-266-comfyui-workflows

## Resumen

`AI-KSK/ksk-video-266-comfyui-workflows` es un repositorio de Hugging Face publicado por el usuario AI-KSK que, pese a su nombre, no contiene pesos de un modelo de IA generativa, sino material de tutorial y comparación de grafos de ComfyUI en torno a la familia de modelos Boogu 0.1. La model card lo describe explícitamente como "Boogu 0.1 - three open models, three graphs (tutorial)" y advierte que **no se incluye ningún JSON de workflow**: solo se enlazan tres publicaciones externas alojadas en RunningHub (edición de imagen única, Turbo T2I y Base T2I). El tamaño del repositorio es de 0,0 GB, lo que confirma que no aloja artefactos de modelo.

El pipeline declarado es `text-to-image` y los tags incluyen `comfyui`, `boogu`, `text-to-image` y `model-comparison`, con idioma `en` y licencia `other`. El repositorio se creó y actualizó el 9 de noviembre de 2026, con 0 descargas y 0 likes, por lo que se trata de un recurso recién publicado y sin tracción.

Su relevancia es, por tanto, documental y de descubrimiento: sirve como punto de entrada para localizar los tres workflows de Boogu 0.1 en RunningHub, no como modelo desplegable. Cualquier evaluación técnica del modelo Boogu 0.1 en sí debe hacerse a partir de las publicaciones enlazadas, ya que esta ficha no puede aportar especificaciones de arquitectura, parámetros ni contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene pesos de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (según metadatos del repositorio) |
| Licencia | other |
| Formato de pesos | no disponible (tamaño del repo: 0.0 GB; no se incluyen pesos ni JSON de workflow) |

## Arquitectura y entrenamiento

No disponible. El repositorio no incluye pesos, configuración de arquitectura ni documentación sobre datos de entrenamiento. La model card únicamente describe la existencia de tres modelos abiertos de la familia Boogu 0.1 (edición de imagen única, Turbo T2I y Base T2I) y enlaza a sus respectivos grafos de ComfyUI alojados en RunningHub. No se aporta información sobre tipo de transformer, mecanismo de difusión, número de pasos, resolución nativa, composición del dataset ni procesos de ajuste (RLHF, DPO u otros).

## Capacidades

- Generación de imagen a partir de texto (T2I) mediante los modelos Boogu 0.1 Base y Turbo, según los enlaces de la model card.
- Edición de imagen única (single-image editing) mediante el tercer grafo enlazado.
- Integración con ComfyUI como entorno de ejecución de los grafos (tags `comfyui`).
- Comparación de modelos (tag `model-comparison`), orientada a evaluar las tres variantes entre sí.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.
- Capacidades multilingües: no disponibles; el único idioma declarado es `en`.

## Casos de uso

- Exploración de la familia Boogu 0.1: usar los tres enlaces de RunningHub para probar Base T2I, Turbo T2I y edición de imagen única antes de decidir una integración, dado que el repositorio actúa como índice de esos grafos.
- Evaluación comparativa de variantes T2I: el tag `model-comparison` sugiere emplear los tres grafos para contrastar calidad y velocidad entre Base y Turbo sobre un mismo conjunto de prompts.
- Edición de imágenes existentes: el grafo de "single-image editing" permite modificar una imagen de entrada sin reescribir el prompt completo, útil para retoques localizados.
- Prototipado rápido en ComfyUI: cargar los workflows enlazados en una instalación local de ComfyUI para iterar sobre pipelines de generación de imagen.
- Referencia para documentación interna: enlazar este repositorio como punto de partida en guías de equipo sobre modelos T2I abiertos y sus grafos de ComfyUI.
- Pruebas de concepto en RunningHub: ejecutar los grafos en la plataforma enlazada sin necesidad de aprovisionar GPU propia, adecuado para demos y validación inicial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican parámetros ni resolución de los modelos Boogu 0.1).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (entorno declarado en los tags) y RunningHub (plataforma de los enlaces). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI, que además no aplican a pipelines de difusión de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables ni ofrece métricas de los modelos Boogu 0.1 que permitan una comparación cuantitativa con alternativas T2I.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Boogu 0.1 (Base/Turbo/Editing) | no disponible | no disponible | no disponible | no disponible | vía RunningHub (enlaces en la model card) |
| Alternativas T2I | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio no contiene pesos ni workflows: la model card advierte "No workflow JSON shipped", por lo que no es desplegable por sí mismo.
- El nombre del repositorio (`ksk-video-266-comfyui-workflows`) sugiere vídeo, pero el contenido declarado es de imagen (T2I y edición de imagen única); posible confusión para quien lo descubra por búsqueda.
- Licencia `other`: no se detallan los términos, por lo que el uso comercial requiere verificar la licencia en las fuentes originales de Boogu 0.1.
- Dependencia de terceros: los grafos residen en RunningHub con enlaces que incluyen un código de invitación (`inviteCode=rh-v1111`), lo que puede implicar condiciones de uso o registro en esa plataforma.
- Sin datos de sesgos, alucinación o limitaciones idiomáticas: no disponibles.
- Idiomas: solo `en` declarado; no hay evidencia de soporte multilingüe.
- Repositorio sin tracción (0 descargas, 0 likes) y publicado el 9 de noviembre de 2026: no hay validación comunitaria de su contenido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/ksk-video-266-comfyui-workflows
- Workflow de edición de imagen única: https://www.runninghub.ai/post/2067856537388933122/?inviteCode=rh-v1111
- Workflow Turbo T2I: https://www.runninghub.ai/post/2067853157933338626/?inviteCode=rh-v1111
- Workflow Base T2I: https://www.runninghub.ai/post/2067856528262127617/?inviteCode=rh-v1111
