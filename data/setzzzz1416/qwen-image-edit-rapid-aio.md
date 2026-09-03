# Setzzzz1416/Qwen-Image-Edit-Rapid-AIO

## Resumen

Setzzzz1416/Qwen-Image-Edit-Rapid-AIO es un modelo de edición de imágenes y text-to-image creado por Setzzzz1416, que integra en un único checkpoint los aceleradores, VAE y CLIP necesarios para ejecutar Qwen Image Edit de forma rápida y sencilla en ComfyUI. El modelo se basa en Qwen/Qwen-Image-Edit-2511 y está pensado para funcionar con 1 CFG y 4 pasos, en precisión FP8, lo que reduce el coste computacional. El repositorio tiene un tamaño de 1550,2 GB y la licencia es Apache-2.0. A lo largo de 23 iteraciones, el autor ha refinado el merge con distintos LORAs de realismo, rebalanceo y contenido NSFW, separando a partir de la versión 5 los modelos para uso SFW y NSFW. El proyecto ha alcanzado su punto máximo según el autor, siendo la v19 la más consistente para ediciones y la v23 la que mejor sigue las instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de edición de imágenes basado en Qwen/Qwen-Image-Edit-2511) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (para guardar y ejecutar), BF16/FP32 para cargar LORAs |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (la librería es ComfyUI; no se especifica el formato) |

## Arquitectura y entrenamiento

El modelo es un merge de aceleradores, VAE y CLIP sobre Qwen/Qwen-Image-Edit-2511, diseñado para funcionar en ComfyUI mediante el nodo "Load Checkpoint". Se recomienda usar 1 CFG y 4 pasos, y el nodo "TextEncodeQwenImageEditPlus" para introducir imágenes (opcionales) y el prompt. Si no se proporcionan imágenes, el modelo funciona como text-to-image puro. El autor ha iterado más de 20 veces, combinando distintos LORAs de aceleración (por ejemplo, Lightning v2.0), realismo, rebalanceo y "Smartphone Photoreal", además de LORAs NSFW. No se han publicado datos sobre el dataset de entrenamiento ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Edición de imágenes y text-to-image en un solo checkpoint.
- Acepta hasta 4 imágenes de entrada con el nodo "TextEncodeQwenImageEditPlus" v2.
- Generación rápida con 1 CFG y 4 pasos, en precisión FP8.
- Modelos separados para contenido SFW y NSFW a partir de la v5.
- Integración nativa con ComfyUI mediante "Load Checkpoint".
- No se mencionan capacidades de tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Edición rápida de imágenes en ComfyUI: usar el checkpoint con "Load Checkpoint", 1 CFG y 4 pasos para aplicar instrucciones de texto sobre imágenes existentes.
- Generación de imágenes desde texto: sin proporcionar imágenes de entrada, el modelo genera imágenes a partir del prompt.
- Contenido para redes sociales: los LORAs "Smartphone Photoreal" y "Rebalancing" ayudan a producir imágenes fotorrealistas con aspecto de fotografía móvil.
- Experimentación con distintos samplers: el autor recomienda euler/beta, er_sde/beta, lcm/normal, etc., según la versión y el resultado deseado.
- Edición con múltiples imágenes de referencia: el nodo v2 permite hasta 4 imágenes de entrada, útil para composiciones complejas.
- Generación de contenido NSFW (con advertencia): a partir de la v5 existen modelos especializados en NSFW, con ajustes de LORAs para consistencia de personajes.
- Reducción de costes de inferencia: FP8 y 4 pasos reducen la VRAM y el tiempo de generación, aunque no se dispone de cifras concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: No disponible (el uso de FP8 sugiere un consumo menor, pero no hay cifras).
- GPU recomendadas: No disponibles.
- Si cabe en consumer GPU: No disponible (el repositorio completo ocupa 1550,2 GB, pero no se especifica el tamaño de los pesos individuales).
- Opciones de despliegue: ComfyUI (según la model card). Existen adaptaciones GGUF de terceros (Phil2Sat/Qwen-Image-Edit-Rapid-AIO-GGUF) que podrían permitir su uso con llama.cpp/Ollama, aunque no están confirmadas por el autor.
- Latencia y throughput: No disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de comparación con otros modelos.

## Limitaciones y advertencias

- Sesgos conocidos: No disponibles; el modelo puede heredar sesgos del modelo base Qwen/Qwen-Image-Edit-2511.
- Riesgo de alucinación: No disponible; en edición de imágenes, el modelo puede alterar detalles no solicitados.
- Limitaciones de contexto o idioma: No disponibles.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo está etiquetado como "not-for-all-audiences" por su contenido NSFW.
- Advertencias de producción: El autor indica que el proyecto ha alcanzado su punto máximo; la v19 es la más consistente para ediciones y la v23 la que mejor sigue las instrucciones. El repositorio es muy grande (1550,2 GB), lo que puede dificultar su descarga y despliegue.

## Enlaces

- https://huggingface.co/Setzzzz1416/Qwen-Image-Edit-Rapid-AIO
- https://huggingface.co/Phr00t/Qwen-Image-Edit-Rapid-AIO
- https://huggingface.co/Phil2Sat/Qwen-Image-Edit-Rapid-AIO-GGUF
- https://huggingface.co/Qwen/Qwen-Image-Edit-2511 (modelo base)
