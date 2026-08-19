# pytraveler/MiniMax-H3-Prompt-Rewriter-LoRA-8B-GGUF

## Resumen

MiniMax-H3 Prompt Rewriter LoRA 8B es un adaptador LoRA (Low-Rank Adaptation) desarrollado por LightX2V y convertido a formato GGUF por pytraveler para su uso con llama.cpp. El adaptador se aplica sobre el modelo multimodal Qwen3-VL-8B-Instruct y tiene como función reescribir prompts cortos de texto o texto e imagen en descripciones estructuradas y listas para el modelo generativo de audio-video MiniMax-H3. A diferencia de la versión de 27B, este adaptador de 8B incorpora la torre de visión del modelo base, lo que le permite interpretar imágenes de referencia (primer o último fotograma) directamente, sin necesidad de describirlas textualmente.

El modelo cubre cuatro tareas distintas: T2AV (solo texto), I2AV (imagen como primer fotograma), L2AV (imagen como último fotograma) y FL2AV (primer y último fotograma). Es una conversión de formato sin entrenamiento adicional: los tensores son idénticos a los del adaptador original en safetensors, solo se ha cambiado el contenedor a GGUF para poder ejecutarse con llama.cpp y en ComfyUI. El adaptador tiene 698 millones de parámetros y se ofrece en dos cuantizaciones (F16 y Q8_0), con un tamaño de repositorio de 2,1 GB.

La relevancia de este modelo reside en que permite ejecutar localmente un reescritor de prompts multimodal de alta calidad sin depender de APIs externas, y su integración con ComfyUI lo hace accesible para flujos de trabajo de generación de vídeo. Es una pieza intermedia entre la entrada del usuario y el modelo de vídeo MiniMax-H3, que exige un formato muy estructurado con marcas de corte, identificadores de hablante y etiquetas de diálogo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre Qwen3-VL-8B-Instruct |
| Parametros totales | 698.351.616 |
| Parametros activos | no disponible (es un adaptador LoRA, no un modelo MoE) |
| Longitud de contexto | Hereda la del modelo base Qwen3-VL-8B-Instruct (32K en la versión original) |
| Tipos de cuantizacion | F16 y Q8_0 (no existe Q4_K_M) |
| Idiomas soportados | Entrada en cualquier idioma que lea el modelo base; salida siempre en inglés |
| Licencia | no disponible |
| Formato de pesos | GGUF (adaptador) |

## Arquitectura y entrenamiento

El adaptador se basa en LoRA, una técnica de ajuste eficiente de parámetros que añade matrices de baja dimensión a las capas lineales del modelo base. En este caso, el adaptador modifica las proyecciones `q/k/v/o` y `gate/up/down` de las 36 capas de la torre de texto del Qwen3-VL-8B-Instruct, con un rango de 256 y un alpha de 256. La torre de visión no se toca, lo que explica que con solo 504 tensores se cubra todo el adaptador.

El entrenamiento del adaptador original (LightX2V) se realizó con el objetivo de transformar prompts cortos en descripciones estructuradas para MiniMax-H3, un modelo de generación de audio-video. El adaptador se entrenó para producir una salida con un formato específico: marcadores de corte `[Shot 2]`, identificadores de hablante `(S1)` y etiquetas de diálogo `<d>[English] ...</d>`. También produce una frase de alineación inicial con marcas de tiempo rellenadas, que MiniMax-H3 usa para sincronizar los eventos.

La conversión a GGUF se realizó con la herramienta `convert_lora_to_gguf.py` de llama.cpp, sin ninguna modificación adicional. No hay datos públicos sobre el dataset de entrenamiento ni sobre el proceso de RLHF o DPO.

## Capacidades

- Reescritura de prompts para generación de audio-video: transforma un texto corto (ej. "Un astronauta camina hacia una torre en ruinas") en una descripción estructurada con planos, diálogos y marcas de tiempo.
- Cuatro tareas diferenciadas:
  - T2AV: solo texto, sin imágenes.
  - I2AV: con una imagen que representa el primer fotograma.
  - L2AV: con una imagen que representa el último fotograma.
  - FL2AV: con dos imágenes (primer y último fotograma).
- Entrada multimodal: puede procesar imágenes junto con el texto gracias a la torre de visión del Qwen3-VL-8B.
- Salida en inglés siempre, independientemente del idioma de entrada.
- Integración con ComfyUI mediante un nodo dedicado.
- Compatible con llama.cpp a través de `llama-mtmd-cli` para tareas con imágenes y `llama-completion` para tareas solo de texto.
- No soporta tool calling ni agentes multi-paso; es un adaptador especializado en una única tarea.

## Casos de uso

- Generación de vídeo con MiniMax-H3: el caso principal. Se alimenta el adaptador con un prompt corto y, opcionalmente, el primer/último fotograma, y produce la descripción estructurada que MiniMax-H3 necesita para generar el vídeo. Es adecuado porque el adaptador ha sido entrenado para ese formato exacto.
- Automatización de flujos de trabajo de vídeo en ComfyUI: el nodo `MiniMax-H3 Prompt Rewriter 8B` se conecta directamente a los nodos de generación de vídeo, permitiendo un pipeline completo local sin pasar por APIs externas.
- Restauración de prompts para vídeo a partir de un fotograma existente: si el usuario tiene una imagen de referencia (por ejemplo, un fotograma de un vídeo anterior), el adaptador puede generar una descripción que coincida con ese fotograma.
- Generación de descripciones alternativas para el mismo contenido: dado el mismo prompt base, se pueden generar variaciones cambiando la resolución, duración o añadiendo imágenes de referencia.
- Prototipado rápido de ideas de vídeo: en entornos de investigación o desarrollo, permite iterar sobre conceptos de vídeo sin tener que escribir manualmente las descripciones completas que MiniMax-H3 requiere.
- Localización de prompts: aunque la salida es en inglés, el modelo base puede leer entrada en otros idiomas, lo que permite a usuarios no anglófonos escribir prompts en su idioma y obtener la descripción en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de evaluación comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Con el modelo base Qwen3-VL-8B-Instruct cuantizado en Q4_K_M (4,7 GB) + proyector (0,7 GB) + adaptador Q8_0 (0,69 GB): aproximadamente 9 GB de VRAM total.
  - Con el modelo base en Q8_0 (8,1 GB) + proyector (0,7 GB) + adaptador Q8_0 (0,69 GB): aproximadamente 13 GB de VRAM.
- GPU recomendadas: tarjetas con 12 GB de VRAM o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A100, etc.). Para la versión Q8_0 se recomienda al menos 16 GB de VRAM.
- Es viable en GPU de consumo de gama media-alta.
- Opciones de despliegue:
  - llama.cpp con `llama-mtmd-cli` para tareas con imágenes y `llama-completion` para tareas solo texto.
  - ComfyUI con el nodo dedicado.
  - Se puede usar con otros frontends que soporten GGUF y LoRA (por ejemplo, LM Studio, llama.cpp server).
- Latencia y throughput: no se proporcionan datos específicos, pero al ser un modelo de 8B con cuantización Q8_0, se espera una generación de 1400 tokens en el orden de segundos en GPU moderna (no se dispone de mediciones exactas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Formato | Licencia |
|---|---|---|---|---|---|
| **MiniMax-H3-Prompt-Rewriter-LoRA-8B (GGUF)** | 698 M (adaptador) | Depende del base (Qwen3-VL-8B) | T2AV, I2AV, L2AV, FL2AV | GGUF | no disponible |
| **MiniMax-H3-Prompt-Rewriter-LoRA-27B (GGUF)** | no disponible (adaptador 27B) | Depende del base | T2AV (solo texto) | GGUF | no disponible |
| **Qwen3-VL-8B-Instruct (base sin adaptador)** | 8B | 32K | Multimodal general | GGUF, safetensors | Apache 2.0 |

El adaptador de 8B es más pequeño y ligero que la versión de 27B, pero añade la capacidad de ver imágenes de referencia, algo que la versión de 27B no tiene (solo texto). El Qwen3-VL-8B base sin adaptador no produce el formato estructurado de MiniMax-H3; necesita el adaptador para esa tarea específica.

## Limitaciones y advertencias

- El adaptador solo genera salida en inglés; si se necesita el resultado en otro idioma, hay que traducir posteriormente.
- La licencia no está especificada, lo que genera incertidumbre sobre el uso comercial. Es recomendable contactar con los autores antes de usarlo en producción.
- Es un adaptador especializado: no sirve para tareas generales de reescritura ni para generación de texto libre.
- El modelo base (Qwen3-VL-8B) puede tener sesgos y alucinaciones inherentes a su entrenamiento; el adaptador no los corrige.
- Errores conocidos en el formato de salida: la marca de tiempo de la frase de alineación a veces usa tres decimales en lugar de dos, y en FL2AV el último fotograma puede atribuirse a `Shot 1` en lugar del último plano. La versión de 27B no tiene estos problemas.
- La conversión GGUF no permite cuantización Q4_K_M; solo F16 y Q8_0 están disponibles.
- El adaptador requiere que el sistema prompt se use exactamente como está en `prompt_template.py`; cualquier modificación degrada la calidad de la reescritura.
- La entrada de imágenes debe cumplir el formato esperado (marcadores `<__media__>` y número de imágenes igual al número de marcadores); de lo contrario, la tokenización falla.

## Enlaces

- Repositorio HuggingFace: [pytraveler/MiniMax-H3-Prompt-Rewriter-LoRA-8B-GGUF](https://huggingface.co/pytraveler/MiniMax-H3-Prompt-Rewriter-LoRA-8B-GGUF)
- Repositorio original del adaptador (LightX2V): [lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA-8B](https://huggingface.co/lightx2v/MiniMax-H3-Prompt-Rewriter-LoRA-8B)
- Repositorio GitHub del nodo ComfyUI: [pytraveler/MiniMax-H3-Prompt-Rewriter-ComfyUI](https://github.com/pytraveler/MiniMax-H3-Prompt-Rewriter-ComfyUI)
- Modelo base Qwen3-VL-8B-Instruct (GGUF): [Qwen/Qwen3-VL-8B-Instruct-GGUF](https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct-GGUF)
- Herramienta de conversión llama.cpp: [llama.cpp](https://github.com/ggml-org/llama.cpp)
