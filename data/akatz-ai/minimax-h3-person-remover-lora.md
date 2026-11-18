# akatz-ai/MiniMax-H3-Person-Remover-LoRA

## Resumen

MiniMax H3 Person Remover LoRA V1 es un adaptador LoRA experimental para el modelo de difusión de vídeo MiniMax H3, concretamente para su variante Ref2VA (reference-to-video-and-audio). Lo desarrolla Akatz Labs (usuario `akatz-ai`) y resuelve una tarea muy concreta de edición de vídeo: eliminar a una persona seleccionada de un plano y reconstruir el fondo de forma coherente, manteniendo el movimiento de cámara y el ritmo temporal del metraje original.

El adaptador no funciona de forma autónoma. Se integra en un flujo de ComfyUI en el que SAM 3.1 segmenta a la persona, se rellena su silueta con verde y el LoRA, junto con el modelo base H3 Ref2VA, genera el fondo de reemplazo en ventanas solapadas. El usuario debe aportar además un primer fotograma "limpio" (sin la persona) como referencia de condicionamiento. El repositorio pesa 0,2 GB y contiene únicamente los pesos del adaptador.

Es relevante ahora porque demuestra una aplicación práctica de los modelos de difusión de vídeo de última generación al postproducción ligera: en lugar de requerir herramientas de inpainting de vídeo dedicadas, reutiliza un modelo generativo grande con un LoRA de bajo rango entrenado sobre un dataset propio. La licencia es la MiniMax H3 Community License Agreement, no una licencia open source estándar, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax H3 Ref2VA, modelo de difusión de vídeo y audio |
| Parametros totales | no disponible (el adaptador ocupa 0,2 GB en safetensors; el modelo base es una descarga separada) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica; ventana de generación de 22 fotogramas por defecto (longitudes válidas 17n + 5: 22, 39, 56, 73...) |
| Tipos de cuantizacion | el LoRA se distribuye en safetensors; el modelo base se usa en INT8 ConvRot pruned y el text encoder en NVFP4 AWQ según el flujo de referencia |
| Idiomas soportados | inglés (prompts de edición) |
| Licencia | MiniMax H3 Community License Agreement (etiquetada como `other`) |
| Formato de pesos | safetensors (archivo único `H3-Person-Remover-V1.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango aplicado sobre MiniMax H3 Ref2VA, un modelo de difusión para generación y edición de vídeo con audio. El pipeline declarado es `video-to-video` y la librería `diffusion-single-file`. El modelo base emplea un text encoder Qwen3VL 32B (en la versión NVFP4 AWQ del flujo de ComfyUI) y dos VAE separados, uno de vídeo en FP16 y otro de audio en FP32. El LoRA modifica el comportamiento del modelo base para especializarlo en la tarea de eliminación de personas y reconstrucción de fondo.

El entrenamiento se realizó con el toolkit ai-toolkit sobre el dataset `akatz-ai/H3-Person-Remover-v1`, con 2.000 pasos de optimización según el registro de entrenamiento de la model card (el texto proporcionado se corta en ese punto, por lo que no se detallan hiperparámetros adicionales, composición del dataset ni si hubo etapas de RLHF o DPO). La innovación técnica principal no está en el adaptador en sí, sino en el flujo que lo acompaña: el workflow Relay 2.0 procesa el vídeo en ventanas solapadas, usando el fotograma de frontera generado como referencia para la siguiente ventana y arrastrando 18 fotogramas de historial de vídeo y audio. El relay elimina el solapamiento y recorta el resultado final al número de fotogramas de origen. El adaptador no segmenta personas ni crea la referencia limpia inicial: eso lo aportan SAM 3.1 y una edición externa del primer fotograma.

## Capacidades

- Eliminación de una persona concreta de un vídeo y reconstrucción del fondo circundante, preservando el movimiento de cámara y el timing de fotogramas.
- Edición de vídeo condicionada por referencia: usa un primer fotograma limpio como condicionamiento para mantener encuadre y escala.
- Procesamiento por ventanas solapadas con continuidad entre segmentos mediante el fotograma de frontera como nueva referencia.
- Integración con segmentación externa (SAM 3.1) mediante máscara verde sobre la persona a eliminar.
- Soporte de prompts de texto en inglés para describir la persona y la instrucción de eliminación.
- Generación de vídeo con pista de audio asociada en el modelo base (el flujo de eliminación produce salida silenciosa por defecto; el audio original se reincorpora manualmente).
- Flujo nativo en ComfyUI con nodos de previsualización de ventanas, reroll de secciones débiles y bloqueo de ventanas.
- No incluye tool calling, function calling ni capacidades de agente; es un adaptador puramente generativo de vídeo.

## Casos de uso

- Postproducción de bajo presupuesto: eliminar a un figurante o a un miembro del equipo que aparece por error en un plano, reconstruyendo el fondo con el LoRA y revisando las ventanas problemáticas con el nodo de reroll.
- Limpieza de metraje de archivo: retirar a una persona concreta de un clip histórico o de stock para reutilizarlo en un montaje, aportando un primer fotograma limpio editado previamente.
- Anonimización visual de transeúntes: usar SAM 3.1 para segmentar a la persona y el LoRA para rellenar la zona, útil en material que se vaya a publicar y requiera ocultar identidades.
- Creación de planos de recurso (B-roll): a partir de un clip con una persona en primer plano, generar una versión sin ella para usar como fondo en una narración o en una sobreimpresión de grafismo.
- Prototipado de efectos visuales: probar rápidamente una idea de "desaparición" de personaje en una secuencia antes de invertir en un pipeline VFX tradicional, gracias al ciclo de previsualización por ventanas de Relay 2.0.
- Investigación en edición generativa de vídeo: servir de base para experimentos de inpainting temporal, evaluando la coherencia de fondo entre ventanas y el comportamiento del modelo ante cortes y movimientos de cámara.
- Restauración de material con elementos no deseados: sustituir a una persona que tapa parcialmente un objeto o paisaje relevante, siempre que el primer fotograma limpio esté disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una galería de ocho ejemplos seleccionados (original, máscara verde y persona eliminada) y advierte explícitamente de que se trata de resultados exitosos escogidos, no de una evaluación sistemática de todas las entradas.

## Requisitos de hardware

- El workflow completo se probó en una RTX 4090 con ComfyUI (commit `79be670e2d9be63e238785af307369d2b9039ed1`), frontend 1.53.6 y PyTorch 2.11.0 + CUDA 12.8.
- La residencia completa de todos los modelos en GPU superó los 24 GB de VRAM; con offloading normal y las políticas de memoria incluidas se completó el render con los mismos ajustes.
- El modelo base H3 Ref2VA pruned INT8 ConvRot más el text encoder Qwen3VL 32B NVFP4 AWQ, los dos VAE y SAM 3.1 multiplex FP16 son descargas separadas que condicionan los requisitos de memoria y disco.
- ComfyUI 0.37.0 es la versión mínima de esquema soportada.
- Despliegue previsto: ComfyUI nativo con soporte de MiniMax H3 y SAM 3.1, más el toolkit H3 Relay 2.0 para el flujo de ventanas.
- No se publican cifras de latencia ni throughput; el coste depende del número de ventanas, que a su vez depende de la duración del clip (22 fotogramas por ventana por defecto a 24 fps).

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax H3 Person Remover LoRA V1 | LoRA sobre difusión de vídeo | Eliminación de persona y reconstrucción de fondo | Ventana de 22 fotogramas (17n + 5) | MiniMax H3 Community License | Hugging Face, 3024 descargas |
| MiniMax H3 Ref2VA (base) | Difusión de vídeo y audio | Generación y edición de vídeo condicionada por referencia | Ventanas configurables | MiniMax H3 Community License | Hugging Face (Comfy-Org) |
| SAM 3.1 | Segmentación | Segmentación de personas y objetos en vídeo | No aplica (modelo de segmentación) | no disponible en la información proporcionada | Hugging Face (Comfy-Org) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparativa se limita a función, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un adaptador experimental: la propia model card advierte de que los ejemplos son resultados exitosos seleccionados y no un benchmark representativo.
- Los detalles de fondo, el movimiento de cámara, las sombras y los cortes duros pueden cambiar respecto al original.
- No segmenta personas ni genera el primer fotograma limpio: depende de SAM 3.1 y de una edición externa del primer fotograma, lo que introduce un paso manual obligatorio.
- Requiere vídeo a 24 fps y con anchura y altura divisibles por 32; se recomienda empezar con planos continuos de unos cinco segundos.
- La salida es silenciosa por defecto; el audio original debe reconectarse manualmente y el flujo no demuestra eliminación de voz ni fidelidad de audio generado.
- Solo admite prompts en inglés.
- La licencia MiniMax H3 Community License Agreement no es una licencia open source estándar; es imprescindible revisar sus términos antes de cualquier uso comercial.
- El rendimiento depende en gran medida de la calidad de la máscara y del primer fotograma de referencia; errores en esos insumos se propagan a todas las ventanas.
- No hay datos publicados de sesgos, tasas de alucinación visual ni evaluación cuantitativa de la calidad de reconstrucción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akatz-ai/MiniMax-H3-Person-Remover-LoRA
- Pesos del LoRA: https://huggingface.co/akatz-ai/MiniMax-H3-Person-Remover-LoRA/resolve/main/H3-Person-Remover-V1.safetensors
- Workflow de ComfyUI (Relay V2): https://huggingface.co/akatz-ai/MiniMax-H3-Person-Remover-LoRA/blob/main/examples/H3-Person-Removal-Relay-V2.json
- Guía del workflow: https://huggingface.co/akatz-ai/MiniMax-H3-Person-Remover-LoRA/blob/main/examples/README.md
- Dataset de entrenamiento: https://huggingface.co/datasets/akatz-ai/H3-Person-Remover-v1
- Repositorio H3 Relay: https://github.com/akatz-ai/h3-relay
- Modelo base MiniMax H3 (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3
- SAM 3.1 (Comfy-Org): https://huggingface.co/Comfy-Org/sam3.1
- Perfil del autor en X: https://x.com/akatz_ai
