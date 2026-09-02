# jax-image-tools/sam3-video-onnx

## Resumen

`jax-image-tools/sam3-video-onnx` es una exportación a formato ONNX del pipeline de segmentación de vídeo por indicaciones (promptable video segmentation) del modelo **SAM 3** de Meta (facebook/sam3). El objetivo es permitir la propagación de máscaras entre fotogramas de un vídeo directamente en el navegador mediante `onnxruntime-web` sobre WebGPU, sin depender de PyTorch ni de un servidor. A diferencia de las exportaciones habituales de SAM que solo incluyen el codificador de imagen y el decodificador de máscara (que segmentan un único fotograma), este repositorio incluye también los grafos de memoria (`memory_attention` y `memory_encoder`) y la salida `object_pointer`, necesarios para propagar las indicaciones a lo largo de la secuencia de vídeo.

El modelo se compone de cuatro grafos ONNX: un codificador de visión de 1,7 GB (fp32), un decodificador de máscara, un módulo de atención de memoria y un codificador de memoria. El banco de memoria no es un grafo, sino que se gestiona en JavaScript mediante `constants.json`. La fidelidad se ha validado contra la implementación fp32 de PyTorch con un IoU máximo por fotograma de 1,000000 y una diferencia máxima de logits de 3,6e-02 en un clip de 4 fotogramas. Es relevante porque resuelve la carencia de exportaciones ONNX completas para el seguimiento de objetos en vídeo de SAM3, aunque su tamaño y su carácter fp32 lo hacen poco práctico para WebGPU en producción; los autores recomiendan su alternativa `edgetam-video-onnx` para uso real en navegador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de segmentación de vídeo de SAM3 (Vision Transformer + decodificador de máscara + módulo de atención de memoria + codificador de memoria) |
| Parametros totales | No disponible (los pesos ONNX suman ~1,79 GB en fp32: vision_encoder 1733,6 MB, mask_decoder 17,0 MB, memory_attention 33,0 MB, memory_encoder 5,3 MB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | Solo fp32 (no se proporcionan versiones cuantizadas) |
| Idiomas soportados | No aplica (modelo de visión; acepta indicaciones de texto en inglés, pero el modelo en sí no es multilingüe) |
| Licencia | SAM License (licencia personalizada de Meta, no Apache-2.0) |
| Formato de pesos | ONNX (safetensors no aplica; los archivos son .onnx) |

## Arquitectura y entrenamiento

El modelo es una conversión ONNX del pipeline de vídeo de SAM3, que combina un codificador de visión (Vision Transformer) que produce características FPN y codificaciones posicionales, un decodificador de máscara que acepta indicaciones puntuales y devuelve máscaras, puntuaciones IoU y punteros de objeto, un módulo de atención de memoria que condiciona las características actuales con el banco de memoria, y un codificador de memoria que convierte las características y la máscara predicha en tokens de memoria. El banco de memoria se mantiene en JavaScript como diccionarios indexados por número de fotograma, ya que todas las ramas dependen de enteros o booleanos de Python, no de tensores, por lo que no requiere trazado.

No se dispone de información sobre el entrenamiento original de SAM3 en esta ficha; se sabe que es el modelo base de Meta, entrenado con técnicas de segmentación promptable con conceptos (texto breve o ejemplos de imagen). La exportación se realizó con `browser-onnx-tools` (script `export/export_sam_video_onnx.py`) y se validó contra la implementación fp32 de PyTorch. Los grafos de `memory_attention` aceptan bloques espaciales y punteros de objeto como entradas dinámicas separadas, lo que evita el padding en fotogramas tempranos y mantiene la exactitud para cualquier estado del banco de memoria.

## Capacidades

- Segmentación de objetos en vídeo mediante indicaciones puntuales (clics) o de caja (bounding box).
- Propagación de máscaras a través de fotogramas consecutivos usando el banco de memoria (memoria a corto y largo plazo).
- Seguimiento de objetos con identidad única a lo largo del vídeo (gracias al `object_pointer`).
- Integración con `onnxruntime-web` en WebGPU para ejecución en navegador sin servidor.
- Soporte de indicaciones de texto (concept prompts) según las capacidades de SAM3, aunque la exportación se centra en indicaciones puntuales.
- Salida de máscaras de alta resolución, puntuaciones IoU y logits de objeto.
- No soporta tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- **Segmentación de vídeo en navegador para anotación de datos**: un usuario puede cargar un vídeo, hacer clic en un objeto en el primer fotograma y obtener la máscara propagada automáticamente a los siguientes, todo dentro de una aplicación web sin backend. El modelo es adecuado porque incluye los grafos de memoria necesarios para la propagación, aunque el codificador de visión de 1,7 GB limita la practicidad.
- **Edición de vídeo interactiva**: herramientas de edición basadas en web pueden permitir seleccionar un objeto (p. ej., un coche en movimiento) y aplicar efectos o recortes solo a ese objeto en todos los fotogramas, usando la propagación de máscaras del modelo.
- **Análisis biomédico de imágenes de lapso de tiempo (z-stacks)**: el autor menciona que la validación se hizo con un clip que aproxima cambios entre cortes de una pila z; el modelo puede usarse para segmentar estructuras celulares en secuencias de imágenes microscópicas, aunque la velocidad (~2,5 s/frame) puede no ser suficiente para grandes volúmenes.
- **Prototipado de aplicaciones de visión por computador**: desarrolladores que necesitan evaluar la viabilidad de SAM3 en el cliente pueden usar estos grafos ONNX para pruebas de concepto con WebGPU, sin instalar Python ni PyTorch.
- **Investigación en seguimiento de objetos**: el repositorio sirve como referencia para entender cómo se estructura el pipeline de memoria de SAM3 en formato ONNX, útil para quienes trabajan en optimizaciones o cuantización.
- **Integración con herramientas de anotación de vídeo existentes**: aplicaciones como CVAT o Label Studio podrían incorporar este modelo para asistir en la anotación semiautomática de vídeos, usando la propagación de máscaras para reducir el trabajo manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMMU, VOS, etc.) en la información disponible. Sin embargo, el autor proporciona métricas de fidelidad de la exportación frente a la implementación fp32 de PyTorch:

| Métrica | Valor |
|---|---|
| IoU máximo por fotograma (peor caso) | 1,000000 |
| Diferencia máxima absoluta en logits de máscara | 3,6e-02 |
| Velocidad del codificador de visión en WebGPU (M1 Max, q4) | ~2,5 s/frame |
| Velocidad de la alternativa edgetam-video-onnx | ~40 ms/frame |

Estas métricas se obtuvieron en un clip de 4 fotogramas con deriva lenta simulando cambios entre cortes de una pila z. No hay comparación con otros modelos en términos de precisión de segmentación, ya que la ficha se centra en la fidelidad de la conversión ONNX.

## Requisitos de hardware

- **VRAM estimada**: el codificador de visión ocupa ~1,7 GB en fp32; la memoria total de los grafos ronda los 1,79 GB. Para inferencia con `onnxruntime-web` se necesita una GPU con soporte WebGPU y al menos 2 GB de memoria de vídeo libre, aunque el autor advierte que no es una exportación apta para navegador en producción.
- **GPU recomendadas**: cualquier GPU compatible con WebGPU (Apple Silicon M1/M2/M3, NVIDIA GTX 10xx o superior, AMD RX 6000 o superior, Intel Arc). No se han probado en GPU de servidor, pero al ser ONNX puede ejecutarse con CUDA si se usa `onnxruntime-gpu`.
- **¿Cabe en consumer GPU?**: Sí, los grafos individuales son pequeños (el más grande es el codificador de visión con 1,7 GB), pero la latencia de ~2,5 s/frame en M1 Max lo hace impracticable para tiempo real.
- **Opciones de despliegue**: `onnxruntime-web` con backend WebGPU (en navegador), `onnxruntime` en Python o C++ (fuera de navegador), o `onnxruntime-gpu` para aceleración por CUDA. No es compatible directamente con vLLM, llama.cpp u Ollama porque no es un modelo de lenguaje.
- **Latencia y throughput**: el autor mide ~2,5 s/frame para el codificador de visión en M1 Max con cuantización q4 (aunque estos grafos son fp32, la medición se hizo con la herramienta de seguimiento de imagen). No se proporcionan cifras para los otros grafos.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jax-image-tools/sam3-video-onnx` (este) | ONNX | ~1,79 GB | Pipeline completo de vídeo SAM3 con memoria | SAM License | Público (no gated) |
| `onnx-community/sam3-tracker-ONNX` | ONNX | No disponible | Tracker de SAM3 (probablemente solo parte del pipeline) | No disponible | Público |
| `wkentaro/sam3-onnx` | ONNX | No disponible | Exportación e inferencia de SAM3 (imagen y posiblemente vídeo) | No disponible | Público |
| `jax-image-tools/edgetam-video-onnx` | ONNX | 62 MB | Alternativa ligera para propagación de vídeo en navegador | No disponible | Público |

La principal diferencia con las alternativas es que este repositorio incluye explícitamente los grafos de memoria y el puntero de objeto, que otras exportaciones omiten. Sin embargo, su tamaño y fp32 lo hacen menos adecuado que `edgetam-video-onnx` para uso real en navegador. `wkentaro/sam3-onnx` puede ofrecer un enfoque más general, pero no se han comparado métricas de rendimiento.

## Limitaciones y advertencias

- **Los pesos no son Apache-2.0**: están bajo la licencia SAM License de Meta, que impone requisitos de reconocimiento en publicaciones, restricciones de uso y condiciones de control de exportación y sanciones. Leer la licencia antes de usar o redistribuir.
- **El checkpoint original es gated**: para obtener los pesos de `facebook/sam3` hay que aceptar los términos de Meta; estos grafos ONNX se proporcionan por conveniencia pero no eximen de ese requisito.
- **El modelo es fp32 y grande**: el codificador de visión ocupa ~1,7 GB, lo que dificulta su uso en navegador con WebGPU (latencia ~2,5 s/frame) y requiere suficiente VRAM.
- **No es una exportación optimizada para producción**: el autor lo califica como "reference export", no apto para aplicaciones reales en navegador; recomienda `edgetam-video-onnx` para ese fin.
- **Riesgo de alucinación en segmentación**: como todo modelo de segmentación, puede producir máscaras incorrectas en objetos ambiguos o con oclusiones, especialmente cuando se propaga a lo largo de muchos fotogramas.
- **Limitaciones de idioma**: aunque SAM3 acepta indicaciones de texto, esta exportación se centra en indicaciones puntuales; el soporte de texto no está garantizado en los grafos ONNX.
- **No hay garantía de soporte**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es un proyecto experimental con soporte limitado.
- **El banco de memoria se gestiona en JavaScript**: esto requiere que el desarrollador implemente la lógica de ensamblaje del banco en el lado del cliente, aumentando la complejidad de integración.

## Enlaces

- [Repositorio HuggingFace: jax-image-tools/sam3-video-onnx](https://huggingface.co/jax-image-tools/sam3-video-onnx)
- [Modelo base: facebook/sam3](https://huggingface.co/facebook/sam3)
- [Licencia SAM (GitHub)](https://github.com/facebookresearch/sam3/blob/main/LICENSE)
- [Herramientas de exportación: browser-onnx-tools (GitHub)](https://github.com/TheJacksonLaboratory/browser-onnx-tools)
- [Alternativa ligera: jax-image-tools/edetam-video-onnx](https://huggingface.co/jax-image-tools/edetam-video-onnx)
- [wkentaro/sam3-onnx (GitHub)](https://github.com/wkentaro/sam3-onnx)
- [pagarcia/sam3-onnx-cpp (GitHub)](https://github.com/pagarcia/sam3-onnx-cpp)
- [onnx-community/sam3-tracker-ONNX (HuggingFace)](https://huggingface.co/onnx-community/sam3-tracker-ONNX)
- [Página de investigación de SAM 3 (Meta AI)](https://ai.meta.com/research/sam3/)
- [Paper de SAM 3 en arXiv](https://arxiv.org/abs/2511.16719)
