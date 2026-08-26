# pytraveler/MiniMax-H3-Prompt-Rewriter-LoRA-Omni-GGUF

## Resumen

MiniMax-H3-Prompt-Rewriter-LoRA-Omni-GGUF es un adaptador LoRA en formato GGUF, creado por pytraveler, que convierte el adaptador original de lightx2v (MiniMax-H3-Prompt-Rewriter-LoRA-Omni) para que pueda ejecutarse bajo llama.cpp junto a un modelo base cuantizado Qwen2.5-Omni-7B. Su función es reescribir prompts cortos y convertirlos en descripciones estructuradas, listas para producción, que alimentan al generador de vídeo y audio MiniMax-H3. Se trata de una conversión de formato sin nuevo entrenamiento: los valores de los tensores son idénticos a los del adaptador fuente.

La particularidad de este adaptador frente a otras versiones (27B y 8B) es que es el primero que procesa simultáneamente imágenes, clips de vídeo y sonido, y cubre las cinco tareas de reescritura: T2AV, I2AV, L2AV, FL2AV y Ref2AV. Esta última, Ref2AV, es la más relevante: admite referencias mixtas (imágenes, clips y audio) que el vídeo objetivo debe reutilizar, y el modelo las procesa directamente como entrada multimodal, sin necesidad de describirlas primero en texto. El adaptador tiene 322,96 millones de parámetros (tensores del LoRA) y se distribuye en dos archivos GGUF: F16 (0,65 GB) y Q8_0 (0,34 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-Omni-7B (adaptador GGUF) |
| Parametros totales | 322.961.408 (tensores del adaptador) |
| Parametros activos | no aplica (adaptador LoRA, no es MoE) |
| Longitud de contexto | 12.288 tokens (recomendado en la documentacion; depende del modelo base) |
| Tipos de cuantizacion | F16 y Q8_0 (del adaptador); el modelo base se usa con Q4_K_M |
| Idiomas soportados | Entrada en cualquier idioma que lea Qwen2.5-Omni-7B; salida siempre en ingles |
| Licencia | no disponible |
| Formato de pesos | GGUF (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador es una LoRA de rango 128 con `alpha = 128` que se aplica únicamente a la torre de texto del "thinker" del modelo base Qwen2.5-Omni-7B. Concretamente, modifica las proyecciones `q/k/v/o` y `gate/up/down` en 28 capas, lo que da un total de 392 tensores. Las torres de visión y audio del modelo base no se tocan, de ahí que el adaptador sea compacto (0,65 GB en F16). El entrenamiento original fue realizado por lightx2v, pero no se han publicado detalles sobre el dataset, el número de tokens o el método de alineación (RLHF, DPO, etc.) en la información disponible. La conversión a GGUF no altera los valores de los tensores, solo el formato y la cuantización (en el caso de Q8_0, con una diferencia media relativa de 0,005 respecto al F16).

El adaptador se entrena con dos system prompts específicos, uno para las cuatro tareas de frames (T2AV, I2AV, L2AV, FL2AV) y otro para Ref2AV, que se encuentran en `system_prompt.py` del repositorio fuente. El modelo debe usarse con la plantilla de chat Jinja de Qwen2.5-Omni; si se alimenta con texto sin plantilla, el modelo continúa el prompt y no abre la etiqueta `integrated_multimodal_description`, dando la impresión de un adaptador roto.

## Capacidades

- Reescritura de prompts para generacion de video y audio: convierte un prompt corto en una descripcion estructurada con composicion, iluminacion, movimiento de camara y sincronizacion temporal.
- Cinco modos de tarea:
  - T2AV (texto a audio-video): sin referencias, solo texto.
  - I2AV (imagen a audio-video): una imagen como primer frame.
  - L2AV (imagen final a audio-video): una imagen como frame final.
  - FL2AV (first-last a audio-video): dos imagenes, primer y ultimo frame.
  - Ref2AV (referencia completa): cualquier combinacion de imagenes, clips y audio que el video objetivo debe reutilizar.
- Procesamiento multimodal nativo: el adaptador, junto al modelo base Qwen2.5-Omni-7B, acepta imagenes, clips de video y pistas de audio como entrada directa (a traves de `llama-mtmd-cli`).
- Salida estructurada en ingles con etiquetas `<Subject N>`, `<Picture N>`, `<Video N>` y `<Audio N>` para el modo Ref2AV, ademas de un analisis de retencion (seis campos de salida en lugar de tres).
- Integracion con ComfyUI mediante nodos dedicados en el repositorio `MiniMax-H3-Prompt-Rewriter-ComfyUI`.
- Sin necesidad de proyector multimodal para tareas T2AV; el proyector solo es requerido cuando hay referencias visuales o de audio.

## Casos de uso

- Produccion de video con MiniMax-H3 a partir de texto: un guionista escribe "un astronauta camina hacia una torre en ruinas en una llanura roja" y el adaptador genera una descripcion tecnica con planos, iluminacion y movimiento de camara lista para el generador de video.
- Reutilizacion de material existente (Ref2AV): un editor proporciona un clip de archivo y una pista de audio; el adaptador produce una descripcion que indica exactamente que elementos del clip y del audio deben aparecer en el nuevo video, con etiquetas de referencia.
- Creacion de videos con primer y ultimo frame fijos (FL2AV): un disenador define dos imagenes como inicio y fin de una secuencia; el adaptador rellena la descripcion intermedia coherente con ambos extremos.
- Generacion de videos a partir de una imagen inicial (I2AV): un artista sube un fotograma y el adaptador expande la escena manteniendo la coherencia visual con ese primer frame.
- Pipeline automatizada de descripcion de video: integracion en scripts de linea de comandos con llama.cpp para transformar prompts masivos de forma local, sin servicios en la nube.
- Flujo de trabajo en ComfyUI: el nodo dedicado permite a disenadores y artistas conectar el adaptador a un grafo de generacion de video, seleccionando la tarea y las referencias visuales o de audio sin escribir codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (MMLU, HumanEval, etc.) ni comparaciones numericas con otros modelos. La unica evaluacion mencionada es cualitativa: con el adaptador activado, el modelo produce listas de planos con composicion, iluminacion, movimiento de camara y timing; sin el adaptador, el mismo modelo base y system prompt solo generan una frase simple en `integrated_multimodal_description`.

## Requisitos de hardware

- VRAM estimada: unos 9 GB con el adaptador adjunto y un contexto de 12.288 tokens, usando el modelo base Qwen2.5-Omni-7B-Q4_K_M (4,68 GB) y el adaptador Q8_0 (0,34 GB).
- GPU recomendadas: cualquier tarjeta con al menos 10-12 GB de VRAM, por ejemplo RTX 3080/3090, RTX 4070/4080/4090, o GPUs de datacenter como A10, A100 o L4. Con 9 GB cabe en una RTX 3080 de 10 GB o una RTX 4070 de 12 GB.
- El proyector multimodal `mmproj-Qwen2.5-Omni-7B-Q8_0.gguf` (1,55 GB) solo es necesario para tareas con referencias (I2AV, L2AV, FL2AV, Ref2AV); T2AV funciona sin el, reduciendo los requisitos de VRAM.
- Opciones de despliegue: llama.cpp (llama-completion y llama-mtmd-cli), y ComfyUI mediante el paquete de nodos `MiniMax-H3-Prompt-Rewriter-ComfyUI`. No se menciona soporte para vLLM, Ollama o TGI en la documentacion disponible.
- Latencia y throughput: no disponibles. Dependen del hardware, el contexto y la cuantizacion del modelo base.

## Comparativa con modelos similares

El propio autor publica tres adaptadores de la misma familia, todos para reescritura de prompts de MiniMax-H3:

| Adaptador | Modelo base | Entrada | Tareas soportadas |
|---|---|---|---|
| MiniMax-H3-Prompt-Rewriter-LoRA-GGUF (27B) | Qwen3.6-27B | texto | T2AV |
| MiniMax-H3-Prompt-Rewriter-LoRA-8B-GGUF (8B) | Qwen3-VL-8B | imagenes | T2AV, I2AV, L2AV, FL2AV |
| MiniMax-H3-Prompt-Rewriter-LoRA-Omni-GGUF (este) | Qwen2.5-Omni-7B | imagenes, clips, audio | T2AV, I2AV, L2AV, FL2AV, Ref2AV |

La diferencia clave del modelo Omni es que incorpora audio y video como entrada, y soporta Ref2AV, que ninguno de los otros dos cubre. En terminos de tamano, el adaptador Omni (322 M parametros) es comparable al de 8B, pero el modelo base (Qwen2.5-Omni-7B) es multimodal completo, mientras que el 8B usa Qwen3-VL-8B (solo vision). No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia del adaptador ni la del modelo base, lo que impide conocer las restricciones de uso comercial. Hay que asumir riesgo legal hasta que el autor aclare la licencia.
- Salida solo en ingles: aunque el prompt de entrada puede estar en cualquier idioma que lea el modelo base, la reescritura siempre se genera en ingles, que es el idioma que espera MiniMax-H3.
- Dependencia del modelo base: el adaptador no funciona por si solo; requiere Qwen2.5-Omni-7B-GGUF de ggml-org, y el proyector multimodal debe provenir de la misma conversion para tareas con referencias.
- Sensibilidad a la plantilla de chat: si no se aplica la plantilla Jinja o no se renderiza manualmente, el modelo no produce la salida esperada y puede entrar en un bucle de continuacion del prompt. Esto puede confundirse con un adaptador defectuoso.
- Sin datos de sesgos ni alucinacion: no se ha publicado ninguna evaluacion de sesgos, riesgos de alucinacion o comportamiento en casos limite. En un contexto de produccion, conviene validar las descripciones generadas antes de usarlas en el generador de video.
- Solo un adaptador: no incluye el modelo base ni el proyector, que deben descargarse por separado. El tamano total del despliegue supera los 6 GB en disco.
- Fecha de creacion futura: el repositorio esta fechado en agosto de 2026, lo que sugiere que es un proyecto muy reciente o con fechas inconsistentes; puede haber poca comunidad o soporte estable aun.

## Enlaces

- Repositorio HuggingFace del adaptador GGUF: https://huggingface.co/pytraveler/MiniMax-H3-Prompt-Rewriter-LoRA-Omni-GGUF
- Adaptador fuente (lightx2v): https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA-Omni
- Modelo base Qwen2.5-Omni-7B-GGUF (ggml-org): https://huggingface.co/ggml-org/Qwen2.5-Omni-7B-GGUF
- Repositorio ComfyUI del autor: https://github.com/pytraveler/MiniMax-H3-Prompt-Rewriter-ComfyUI
- Adaptador 27B (texto): https://huggingface.co/pytraveler/MiniMax-H3-Prompt-Rewriter-LoRA-GGUF
- Adaptador 8B (vision): https://huggingface.co/pytraveler/MiniMax-H3-Prompt-Rewriter-LoRA-8B-GGUF
- Noticia en ComfyUI Wiki: https://comfyui-wiki.com/en/news/2026-08-07-minimax-h3-prompt-rewriter-lora
