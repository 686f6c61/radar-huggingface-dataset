# runes/video-depth-anything-small-webgpu

## Resumen

Video Depth Anything (Small) en formato ONNX para WebGPU es una exportación del modelo de estimación de profundidad monocular para vídeo desarrollado por ByteDance, publicado en CVPR 2025 (arXiv:2501.12375). El repositorio `runes/video-depth-anything-small-webgpu` no entrena ni modifica los pesos: es un espejo sin cambios del export ONNX del proyecto `TheoreticallyTim/theoreticallypose-vda`, empaquetado para ejecutarse con `onnxruntime-web` y el execution provider WebGPU directamente en el navegador. La arquitectura subyacente es un encoder ViT-S (variante Small de Depth Anything) que extrae características por fotograma y una cabeza temporal que agrega ventanas de 32 fotogramas para producir mapas de disparidad relativa coherentes en el tiempo.

El interés práctico del modelo está en que permite estimar profundidad de vídeo en tiempo real en el cliente, sin servidor ni GPU dedicada, lo que habilita efectos de post-procesado (capas de profundidad, desenfoque selectivo, parallax) en aplicaciones web. El repositorio ocupa 0,1 GB y contiene dos grafos ONNX con pesos en fp16, entradas y salidas en fp32 y formas estáticas (opset 17). Solo la variante Small es Apache-2.0; las variantes Base y Large son CC-BY-NC y no están incluidas.

El modelo resuelve la estimación de profundidad relativa por fotograma y su consistencia temporal dentro de una ventana de 32 fotogramas, con resolución de entrada fija de 518×910 píxeles. La segmentación del grafo en la frontera de tokens ViT permite reutilizar características del encoder entre ventanas solapadas, reduciendo el coste de cómputo en procesamiento de vídeo continuo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-S (encoder) + cabeza temporal para estimación de profundidad de vídeo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; ventana temporal de 32 fotogramas) |
| Tipos de cuantizacion | fp16 (pesos); E/S del grafo en fp32; no se documentan otras cuantizaciones |
| Idiomas soportados | no aplica (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 (solo variante Small) |
| Formato de pesos | ONNX (opset 17, formas estáticas), dos grafos: encoder y cabeza |

## Arquitectura y entrenamiento

El modelo sigue el diseño de Video Depth Anything: un encoder ViT-S tipo Depth Anything procesa cada fotograma a resolución 518×910 y produce características en cuatro niveles (`feat1..feat4`, con forma `[1, 2405, 384]`). Una cabeza temporal recibe esas características apiladas en ventanas de 32 fotogramas (`[32, 2405, 384]`) y emite un mapa de disparidad relativa `[32, 1, 518, 910]`, donde valores mayores indican mayor cercanía. La exportación ONNX está dividida en la frontera de tokens ViT precisamente para permitir reutilizar características de fotogramas solapados entre ventanas consecutivas.

No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO en la información proporcionada; el repositorio es un espejo de un export ya existente, sin reentrenamiento ni ajuste fino. La innovación técnica destacable es la separación encoder/cabeza y las formas estáticas, que facilitan el despliegue en `onnxruntime-web` con WebGPU y el procesamiento por ventanas deslizantes.

## Capacidades

- Estimación de profundidad relativa monocular por fotograma con salida de disparidad (mayor = más cerca).
- Coherencia temporal dentro de ventanas de 32 fotogramas, apta para vídeo.
- Procesamiento en navegador mediante `onnxruntime-web` y el execution provider WebGPU.
- Reutilización de características del encoder entre ventanas solapadas para reducir cómputo.
- Entrada RGB float32 con normalización ImageNet (media/desviación) y resolución fija 518×910.
- No incluye tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No incluye visión de alto nivel (detección, segmentación semántica) ni audio.

## Casos de uso

- Efectos de profundidad en vídeo web: aplicar desenfoque selectivo o bokeh sintético en un editor de vídeo en el navegador, usando la disparidad por fotograma y la coherencia temporal de 32 fotogramas para evitar parpadeo.
- Capas de parallax en contenido interactivo: generar mapas de profundidad para separar sujeto y fondo en vídeos cortos y animar capas con desplazamiento diferencial en una web.
- Previsualización en cliente de pipelines de post-procesado: estimar profundidad antes de subir el vídeo a un servidor, reduciendo ancho de banda y coste de GPU en la nube.
- Herramientas de accesibilidad y descripción visual: derivar mapas de profundidad para enriquecer descripciones o interfaces de realidad aumentada web.
- Rotoscopia asistida y máscaras por profundidad: usar la disparidad como señal auxiliar para separar planos focales en herramientas de edición ligeras.
- Prototipado e investigación en el navegador: evaluar el comportamiento del modelo de ByteDance sin infraestructura local, con despliegue vía `onnxruntime-web` y WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con cifras concretas; el repositorio pesa 0,1 GB y los pesos están en fp16, por lo que la huella de memoria es reducida, pero no se documentan cifras de VRAM.
- GPU recomendadas: no disponibles; el modelo está pensado para ejecutarse en el navegador con WebGPU, por lo que depende de la GPU del cliente y del soporte WebGPU del navegador.
- Compatibilidad con GPU de consumo: previsiblemente sí por el tamaño del repositorio, pero no se confirma en la información proporcionada.
- Opciones de despliegue: `onnxruntime-web` con execution provider WebGPU (obligatorio para el flujo documentado); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|
| Video Depth Anything Small (este repo, ONNX WebGPU) | no disponible | 32 fotogramas, 518×910 | Apache-2.0 | ONNX en Hugging Face |
| Video Depth Anything Base | no disponible | no disponible | CC-BY-NC | No incluido en este repo |
| Video Depth Anything Large | no disponible | no disponible | CC-BY-NC | No incluido en este repo |
| Depth Anything (monocular, sin componente temporal) | no disponible | por imagen | no disponible | no disponible |

## Limitaciones y advertencias

- Solo variante Small bajo Apache-2.0; Base y Large son CC-BY-NC y no están incluidas, por lo que no deben usarse comercialmente desde este repositorio.
- Salida de disparidad relativa, no profundidad métrica absoluta; no apta para medición física sin calibración.
- Formas estáticas y resolución fija 518×910: no admite entradas de otras dimensiones sin reexportar el grafo.
- Ventana temporal limitada a 32 fotogramas; la coherencia más allá de la ventana depende del solapamiento y de la lógica de la aplicación.
- Sin datos de sesgos, alucinación o comportamiento en escenas difíciles en la información disponible.
- Dependencia de WebGPU y del soporte del navegador; el rendimiento varía según el hardware del cliente.
- Repositorio espejo sin reentrenamiento ni ajuste: cualquier limitación del export original se hereda.
- No hay idiomas ni capacidades de lenguaje: no debe evaluarse como modelo de texto.

## Enlaces

- Hugging Face: https://huggingface.co/runes/video-depth-anything-small-webgpu
- Export ONNX original: https://huggingface.co/TheoreticallyTim/theoreticallypose-vda
- Repositorio oficial: https://github.com/DepthAnything/Video-Depth-Anything
- Paper: https://arxiv.org/abs/2501.12375
- `onnxruntime-web`: no disponible en la información proporcionada (no se incluye URL concreta)
