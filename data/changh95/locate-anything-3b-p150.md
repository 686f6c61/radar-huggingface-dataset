# changh95/locate-anything-3b-p150

## Resumen

LocateAnything-3B es un modelo vision-lenguaje de 3.500 millones de parámetros orientado a la localización visual de objetos (*visual grounding*) y a la detección zero-shot guiada por lenguaje natural. Lo desarrolla NVIDIA y combina un codificador visual MoonViT-SO-400M de 27 capas con un proyector MLP de dos capas y un modelo de lenguaje Qwen2.5-3B de 36 capas que emite las coordenadas de las cajas directamente como tokens de texto. El resultado es un sistema que recibe una imagen y una consulta libre ("la taza roja de la izquierda" o una lista de categorías) y devuelve cajas etiquetadas en píxeles de la imagen original.

La ficha que nos ocupa, `changh95/locate-anything-3b-p150`, no es un modelo nuevo sino un *port* de inferencia: empaqueta los pesos sin modificar de `nvidia/LocateAnything-3B` (commit `c32291ca`) para ejecutarse sobre hardware Tenstorrent p150 mediante el stack `tt-model-manager` y un servidor HTTP propio. Es relevante porque demuestra la viabilidad de llevar modelos de grounding multimodal a aceleradores no-GPU (ASIC de Tenstorrent) con un pipeline completo de preprocesado, visión, prefill y decodificación autoregresiva codificada en el dispositivo.

El modelo resuelve el problema de la detección open-vocabulary sin necesidad de reentrenar cabezas de detección: cualquier categoría o descripción en lenguaje natural puede consultarse en tiempo de inferencia. Su licencia NVIDIA, sin embargo, restringe el uso a investigación y evaluación, lo que condiciona cualquier despliegue comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje: encoder MoonViT-SO-400M (27 capas, parches de 14 px fusionados 2×2) + proyector MLP de 2 capas + LLM Qwen2.5-3B (36 capas) |
| Parámetros totales | 3.500 millones (3,5B) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible como ventana de chat; una imagen se resuelve a 616×336 px (264 tokens de imagen) y la consulta admite de 1 a 1000 caracteres |
| Tipos de cuantización | no disponible (los pesos se convierten internamente a formato de dispositivo en el primer arranque) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA License (`nvidia-license`), uso no comercial |
| Formato de pesos | safetensors en el repositorio original; el port genera pesos convertidos para dispositivo bajo `~/.cache/tt-model/locate-anything-3b-p150` |

## Arquitectura y entrenamiento

La arquitectura sigue el patrón de un VLM de dos torres: un encoder visual MoonViT-SO-400M procesa la imagen redimensionada a 616×336 píxeles con parches de 14 píxeles fusionados 2×2, lo que produce una rejilla de 24×44 y 264 tokens visuales; un proyector MLP de dos capas alinea esos tokens con el espacio de embeddings del LLM, un Qwen2.5-3B de 36 capas que genera la respuesta token a token. La particularidad es que las cajas se emiten como texto estructurado (`<ref>etiqueta</ref><box><x1><y1><x2><y2></box>`) con coordenadas normalizadas de 0 a 1000 sobre la imagen canónica, que el servidor reescala a píxeles de la imagen original.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; la model card remite a la ficha original de NVIDIA y al paper arXiv:2605.27365. La decodificación es autoregresiva y voraz (`ar_greedy_trace_device_sampling`), con un presupuesto por defecto de 128 tokens nuevos (máximo 1024); cada caja consume 6 tokens, cada etiqueta 2 más su texto y el cierre de respuesta 1 token. El port incluye una innovación de implementación relevante: las etapas de visión y prefill se encolan en el dispositivo sin espera bloqueante y su tiempo se contabiliza dentro de la etapa de decodificación.

## Capacidades

- Detección zero-shot de objetos a partir de nombres de categoría, unidos con el separador `</c>` (por ejemplo, `person</c>car`).
- Grounding de expresiones referenciales en lenguaje natural, como "la taza roja de la izquierda".
- Salida de cajas delimitadoras `[x1, y1, x2, y2]` en píxeles de la imagen original, además de las coordenadas normalizadas internas (`box_norm`, rango 0-1000).
- Respuestas de punto único (`points` con `point` y `point_norm`) para consultas que requieren una localización puntual.
- Detección de ausencia de objeto: la respuesta `<box>None</box>` no genera detección.
- Generación opcional de una imagen superpuesta con las cajas dibujadas (`return_overlay`), devuelta como PNG en base64.
- Entrada de imágenes de cualquier tamaño, con redimensionado interno a la resolución canónica de 616×336.
- No soporta tool calling, function calling, agentes multi-paso ni modo de razonamiento extendido; no es un modelo conversacional y su API no es compatible con OpenAI.

## Casos de uso

- Anotación automática de datasets de detección: dado un conjunto de imágenes y una lista de categorías, el modelo preetiqueta cajas para revisión humana, reduciendo el coste de etiquetado en proyectos de visión por computador.
- Búsqueda visual por descripción: indexar un catálogo de imágenes y localizar objetos mediante consultas como "el coche aparcado junto al bordillo", útil en sistemas de archivo fotográfico o inspección de inventario.
- Robótica e interacción embodied: el modelo procede del ecosistema NVlabs/Eagle (Embodied) y sirve para que un agente traduzca una instrucción referencial en una región de la imagen donde actuar, como base para manipulación o navegación asistida.
- Verificación de inventario y lineales en retail: detectar productos concretos en fotografías de estanterías mediante listas de categorías, con salida de cajas para conteo y control de planogramas.
- Moderación y análisis de contenido visual: localizar elementos específicos (por ejemplo, marcas o tipos de objeto) en imágenes subidas por usuarios, usando la consulta en lenguaje natural como filtro configurable.
- Evaluación de hardware alternativo: este port concreto permite medir el rendimiento de modelos VLM de grounding sobre aceleradores Tenstorrent p150, comparando latencias de preprocesado, visión, prefill y decodificación frente a despliegues en GPU.
- Asistencia a personas con discapacidad visual: localizar objetos descritos verbalmente en una escena y devolver su posición, integrándolo en aplicaciones que verbalicen la ubicación de la caja detectada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K ni métricas de detección como mAP) en la información disponible. La model card remite a la ficha original de NVIDIA y al paper arXiv:2605.27365 para los detalles de entrenamiento y evaluación.

Sí se dispone de datos de latencia del port sobre Tenstorrent p150 para la imagen de demostración de 1920×1080 y la consulta `car`:

| Etapa | Tiempo (ms) |
|---|---|
| Preprocesado | 39,1 |
| Visión | 0,7 |
| Prefill | 0,4 |
| Decodificación | 109,8 |
| Total | 150,2 |

Con una tasa de decodificación de 81,97 tokens/s y 10 tokens generados. La superposición de cajas añade unos 0,8 s al tiempo de ida y vuelta del cliente en esa misma imagen.

## Requisitos de hardware

- Hardware objetivo: Tenstorrent p150 (malla `P150`); no es un port para GPU.
- RAM de host: unos 10 GB libres; el proceso servidor alcanza un pico de 9,9 GB durante el primer arranque (conversión de pesos) y se estabiliza en torno a 1,8 GB sirviendo.
- Disco: unos 31 GB libres en total; imagen Docker de 4,1 GB (descarga de 0,9 GB), pesos de 7,7 GB en la caché de Hugging Face y unos 19 GB escritos en el primer arranque bajo `~/.cache/tt-model/locate-anything-3b-p150`.
- Software: CLI de Tenstorrent (`uv tool install tenstorrent`) o `tt-model`, más Docker.
- Despliegue: `tt serve changh95/locate-anything-3b-p150` o `tt-model serve changh95/locate-anything-3b-p150`; el servidor HTTP escucha en el puerto 20000 (o el siguiente libre).
- El primer arranque compila kernels para el dispositivo y tarda varios minutos; el servidor está listo cuando registra `Application startup complete`.
- No se dispone de estimaciones de VRAM ni de compatibilidad con GPU de consumo, vLLM, llama.cpp, Ollama o TGI en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LocateAnything-3B (este port) | 3,5B | 616×336 px, 264 tokens de imagen | Grounding y detección zero-shot | NVIDIA License (no comercial) | Hugging Face + Tenstorrent p150 |
| nvidia/LocateAnything-3B | 3,5B | 616×336 px | Grounding y detección zero-shot | NVIDIA License | Hugging Face (pesos originales) |
| Modelos de detección open-vocabulary (Grounding DINO, OWLv2) | no disponible | no disponible | Detección open-vocabulary | no disponible | no disponible |

La comparación con alternativas de la misma categoría no puede completarse con datos verificados en la información disponible; los pesos de este port son idénticos a los de `nvidia/LocateAnything-3B`, por lo que su calidad de detección es la misma y solo difieren en el backend de ejecución.

## Limitaciones y advertencias

- Licencia NVIDIA: los pesos no permiten uso comercial; el port está declarado explícitamente para investigación y evaluación.
- No es un modelo conversacional ni expone una API compatible con OpenAI; `GET /v1/models` es un stub y el payload de `/predict` es propio del modelo.
- No dispone de tool calling, agentes ni razonamiento multi-paso.
- La consulta está limitada a entre 1 y 1000 caracteres y el presupuesto de decodificación a 1024 tokens nuevos; si se agota, `stopped_on_eos` es `false` y la respuesta puede quedar truncada.
- La imagen se reduce a 616×336 píxeles, lo que puede degradar la detección de objetos pequeños o muy alejados en imágenes de alta resolución.
- Riesgo de alucinación de cajas o etiquetas no presentes en la imagen; no se han publicado métricas de precisión en la información disponible.
- No se dispone de información sobre sesgos demográficos, culturales o de dominio del dataset de entrenamiento.
- Idiomas soportados no disponibles; no se garantiza el comportamiento con consultas en castellano.
- Dependencia de hardware específico (Tenstorrent p150) y de un primer arranque lento con compilación de kernels; el consumo de disco y RAM de host debe planificarse.
- El proyecto es un port de terceros (`changh95`), con 0 descargas y 0 likes en el momento de la consulta, por lo que su mantenimiento y soporte no están garantizados.

## Enlaces

- Repositorio del port: https://huggingface.co/changh95/locate-anything-3b-p150
- Modelo original: https://huggingface.co/nvidia/LocateAnything-3B
- Licencia NVIDIA: https://huggingface.co/nvidia/LocateAnything-3B/blob/main/LICENSE
- Paper: https://arxiv.org/abs/2605.27365
- Código upstream (NVlabs Eagle, Embodied): https://github.com/NVlabs/Eagle/tree/main/Embodied
- Repositorio del port: https://github.com/changh95/tt-locate-anything
- tt-model-manager: https://github.com/tenstorrent/tt-model-manager
- Prerrequisitos de Tenstorrent CLI: https://github.com/tenstorrent/tt-cli/blob/main/docs/prerequisites.md
- Imagen de demostración: https://huggingface.co/changh95/locate-anything-3b-p150/resolve/main/media/demo_input.png
