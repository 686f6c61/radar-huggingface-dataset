# jax-image-tools/sam21-tiny-video-onnx

## Resumen

El modelo `jax-image-tools/sam21-tiny-video-onnx` es una exportación a ONNX del pipeline completo de segmentación de video del modelo `facebook/sam2.1-hiera-tiny`, desarrollado por JAX Image Tools (The Jackson Laboratory). Su propósito es permitir la propagación de máscaras a lo largo de secuencias de video directamente en el navegador, utilizando `onnxruntime-web` sobre WebGPU. A diferencia de las exportaciones habituales de SAM que solo incluyen el encoder y el decoder (segmentación de un solo fotograma), este repositorio incorpora los grafos de memoria (`memory_attention` y `memory_encoder`) necesarios para propagar un prompt a través de múltiples frames, incluyendo la salida `object_pointer` que otras exportaciones descartan.

El modelo está pensado para aplicaciones de segmentación interactiva en tiempo real en entornos web, sin necesidad de servidor dedicado. Tiene un tamaño de repositorio de 0.2 GB y hereda la licencia Apache-2.0 del modelo base. Su relevancia radica en que cubre un hueco funcional: las exportaciones ONNX públicas de SAM 2.1 suelen limitarse a la segmentación de una imagen estática, mientras que esta versión ofrece el pipeline completo de video con alta fidelidad respecto al modelo original en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 2.1 hiera-tiny (encoder de vision, decoder de mascaras, atencion de memoria, encoder de memoria) en formato ONNX |
| Parametros totales | no disponible (modelo base `facebook/sam2.1-hiera-tiny`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (los archivos ONNX no especifican precision; probablemente FP32) |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (archivos `.onnx`) |

## Arquitectura y entrenamiento

El modelo es una conversión a ONNX del checkpoint `facebook/sam2.1-hiera-tiny`, que pertenece a la familia SAM 2 (Segment Anything Model 2) de Meta. La arquitectura original es un transformer híbrido con un encoder de visión (Hiera) y un decoder de máscaras, diseñado para segmentación promptable. La exportación se realizó con la herramienta `browser-onnx-tools` del repositorio `export/export_sam_video_onnx.py`, dividiendo el modelo en cuatro grafos ONNX separados:

- `vision_encoder.onnx` (104.4 MB): procesa `pixel_values` de tamaño (1,3,1024,1024) y produce características FPN y codificaciones posicionales.
- `mask_decoder.onnx` (17.0 MB): combina características con prompts de puntos y genera máscaras predichas, máscaras de alta resolución, puntuaciones IoU, `object_pointer` y `object_score_logits`.
- `memory_attention.onnx` (30.9 MB): condiciona las características actuales con el banco de memoria.
- `memory_encoder.onnx` (5.3 MB): genera tokens de memoria y codificación posicional a partir de características y máscara predicha.

El banco de memoria no es un grafo ONNX; se mantiene como diccionarios indexados por frame en JavaScript, tal como hace el código original. La fidelidad se validó comparando end-to-end con el iterador `propagate_in_video_iterator` de PyTorch en FP32, obteniendo un IoU peor caso de 1.000000 y una diferencia máxima absoluta en logits de máscara de 3.3e-02, medido sobre un clip de 8 frames con dos velocidades de movimiento.

## Capacidades

- Segmentación de video promptable: acepta prompts de puntos en un frame y propaga la máscara a frames posteriores mediante el banco de memoria.
- Propagación de máscaras a través de secuencias de video, incluyendo movimiento rápido (típico de video) y lento (como cortes de z-stack en microscopía).
- Salida de `object_pointer` y `object_score_logits`, que otras exportaciones ONNX de SAM 2.1 descartan.
- Ejecución en navegador con WebGPU mediante `onnxruntime-web`.
- Los grafos `memory_attention` aceptan entradas dinámicas separadas para bloques espaciales y object pointers, sin necesidad de padding en frames tempranos.
- No soporta texto ni audio; es exclusivamente un modelo de visión para segmentación.

## Casos de uso

- Edición de video en el navegador: un usuario puede seleccionar un objeto en un frame (clic o dibujo) y el modelo propaga la selección a lo largo del clip, permitiendo recortar o aplicar efectos sin herramientas de escritorio.
- Análisis biomédico de imágenes volumétricas: en microscopía de fluorescencia, los z-stacks se pueden segmentar automáticamente seleccionando una célula en un corte y propagando la máscara a los cortes adyacentes, gracias a la alta fidelidad del modelo en movimientos lentos.
- Etiquetado automático de datos de entrenamiento: los anotadores pueden marcar un objeto en un frame de un video y el modelo completa el resto de frames, reduciendo el tiempo de anotación manual.
- Seguimiento de objetos en tiempo real para aplicaciones de realidad aumentada o interacción web: al funcionar en el navegador, no se requiere transmisión de video a un servidor, lo que reduce latencia y preserva privacidad.
- Segmentación de objetos en videos de vigilancia o cámaras de tráfico para análisis posterior, ejecutándose en clientes con GPU compatible con WebGPU.
- Herramientas educativas de visión por computador que demuestran segmentación de video interactiva sin instalación de dependencias, solo con un navegador moderno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como mIoU en datasets de video) para esta exportación ONNX. Sin embargo, el autor reporta una validación de fidelidad contra el modelo original en PyTorch FP32:

- Peor IoU por frame: 1.000000
- Peor diferencia máxima absoluta en logits de máscara: 3.3e-02

Esta medición se realizó sobre un clip de 8 frames con dos velocidades de movimiento (rápida y lenta), con todos los grafos neurales enrutados a través de las exportaciones ONNX. Para referencia, la exportación comparable `square-zero-labs/sam2.1-tiny-video-onnx` reporta un peor IoU de 0.9967, lo que sugiere que esta versión es más fiel al original.

## Requisitos de hardware

- Requiere una GPU compatible con WebGPU para ejecución en navegador (Chrome, Edge, Firefox con flags experimentales). No se especifican requisitos mínimos de VRAM, pero los archivos ONNX suman aproximadamente 157 MB, por lo que cualquier GPU moderna con al menos 2 GB de VRAM debería ser suficiente.
- Al ejecutarse en el navegador, no se necesita servidor de inferencia ni GPU dedicada en el backend; todo el cómputo ocurre en el cliente.
- Para pruebas fuera del navegador, se puede usar `onnxruntime` con backend CPU o CUDA, aunque no está documentado en el repositorio.
- No se proporcionan datos de latencia o throughput. Se espera que la inferencia sea en tiempo real para clips cortos en GPUs integradas de portátiles recientes, pero depende del tamaño del video y la resolución (1024x1024).
- Opciones de despliegue: integración directa en aplicaciones web con `onnxruntime-web` y WebGPU; también es posible usarlo con `onnxruntime-node` en entornos Node.js.

## Comparativa con modelos similares

| Modelo | Formato | Pipeline completo | Fidelidad (IoU) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jax-image-tools/sam21-tiny-video-onnx` | ONNX (4 grafos) | Sí (incluye memoria y object pointer) | 1.000000 (peor caso) | Apache-2.0 | Hugging Face |
| `square-zero-labs/sam2.1-tiny-video-onnx` | ONNX | Sí, pero con banco de memoria fijo y padding | 0.9967 (peor caso) | Apache-2.0 | Hugging Face |
| `facebook/sam2.1-hiera-tiny` (original) | PyTorch | Sí | Referencia FP32 | Apache-2.0 | Hugging Face / GitHub |

La principal diferencia con `square-zero-labs` es que esta versión trata el banco de memoria como entradas dinámicas separadas, evitando padding en frames tempranos y logrando mayor fidelidad. El modelo original en PyTorch sirve como referencia de calidad, pero requiere un entorno Python y GPU dedicada para inferencia.

## Limitaciones y advertencias

- Requiere WebGPU: los navegadores sin soporte de WebGPU (por ejemplo, Safari en versiones antiguas o Firefox sin flags) no podrán ejecutar el modelo.
- El repositorio no incluye documentación sobre la precisión numérica de los pesos ONNX (probablemente FP32, pero no confirmado), lo que puede afectar el rendimiento en dispositivos con memoria limitada.
- No se proporcionan métricas de rendimiento en términos de velocidad o consumo de memoria; la idoneidad para tiempo real depende del hardware del cliente.
- La segmentación se limita a prompts de puntos; no se soportan prompts de caja o texto en esta exportación.
- El modelo hereda las limitaciones de SAM 2.1: puede fallar en objetos muy pequeños, oclusiones severas o movimientos bruscos con cambios de apariencia drásticos.
- La licencia Apache-2.0 permite uso comercial, pero se debe atribuir al autor original (Meta) y a JAX Image Tools según los términos de la licencia.
- No hay garantías de soporte o mantenimiento; es un proyecto de investigación del laboratorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jax-image-tools/sam21-tiny-video-onnx
- Modelo base original: https://huggingface.co/facebook/sam2.1-hiera-tiny
- Herramienta de exportación: https://github.com/TheJacksonLaboratory/browser-onnx-tools
- Repositorio oficial de SAM 2: https://github.com/facebookresearch/sam2
- Exportación comparable: https://huggingface.co/square-zero-labs/sam2.1-tiny-video-onnx
- Web de JAX Image Tools: https://imagetools.jax.org/
