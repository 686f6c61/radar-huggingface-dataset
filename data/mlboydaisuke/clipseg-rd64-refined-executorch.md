# mlboydaisuke/CLIPSeg-rd64-refined-ExecuTorch

## Resumen

CLIPSeg-rd64-refined-ExecuTorch es una conversión a ExecuTorch del modelo de segmentación semántica zero-shot CLIPSeg (variante rd64-refined) desarrollado originalmente por CIDAS. El autor de esta conversión, mlboydaisuke, ha adaptado el modelo para su ejecución en dispositivos mediante el runtime ExecuTorch de PyTorch, utilizando los backends XNNPACK (CPU) y Core ML (iOS). El modelo base, CLIPSeg, fue presentado en el artículo "Image Segmentation Using Text and Image Prompts" de Lüddecke et al. y permite generar una máscara de segmentación a partir de una imagen y una frase en lenguaje natural, sin necesidad de clases predefinidas.

La conversión divide el modelo en dos partes independientes: una torre de visión (clipseg_vision) que procesa la imagen y produce tres activaciones intermedias, y una torre de segmentación (clipseg_segment) que combina esas activaciones con el prompt textual para generar los logits de la máscara. Esta separación permite reutilizar el cómputo de visión para múltiples prompts sobre la misma imagen, reduciendo el coste total. El modelo base tiene 150,7 millones de parámetros y una arquitectura CLIP ViT-B/16 con un decodificador de segmentación. El repositorio incluye versiones fp32 y fp16 de ambas torres, así como una versión Core ML para la torre de segmentación.

La relevancia de este modelo radica en que ofrece segmentación guiada por texto en dispositivos con recursos limitados, algo que no cubren otros modelos open-vocabulary como Grounding DINO (que devuelve cajas) o SAM (que requiere clics). La verificación del autor confirma que la división en dos torres no altera los resultados respecto al modelo original, con una diferencia máxima absoluta de 0,0 en todas las prompts probadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/16 (backbone) + decodificador de segmentación (rd64-refined) |
| Parametros totales | 150,7 M (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 77 tokens (texto, fijo) |
| Tipos de cuantizacion | fp32, fp16 (int8 no incluido en el repo) |
| Idiomas soportados | no disponible (el modelo base fue entrenado con datos en inglés, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | .pte (ExecuTorch), safetensors no disponible |

## Arquitectura y entrenamiento

El modelo base CLIPSeg utiliza un codificador CLIP ViT-B/16 como backbone de visión y un codificador de texto CLIP. La variante rd64-refined emplea una dimensión reducida de 64 en el decodificador y una convolución más compleja en la etapa de refinamiento. El modelo fue entrenado por CIDAS con pares imagen-texto para aprender a segmentar objetos descritos por lenguaje natural. El proceso de entrenamiento original no se detalla en la información disponible, pero se sabe que el modelo fue publicado en el repositorio de CIDAS y posteriormente convertido a ONNX por Xenova y a fp16 por Kijai.

La conversión a ExecuTorch realizada por mlboydaisuke no modifica los pesos, sino que los exporta al formato .pte y los particiona en dos grafos: uno para la torre de visión (que procesa la imagen de 352x352 píxeles y produce tres activaciones de tamaño (1, 485, 768) correspondientes a las capas 3, 6 y 9 del ViT) y otro para la torre de segmentación (que toma esas activaciones junto con los input_ids del prompt y genera logits de 352x352). Esta partición permite ejecutar la torre de visión una sola vez por imagen y reutilizar sus salidas para múltiples prompts, lo que reduce el coste computacional en escenarios de múltiples consultas. El autor verificó que la salida de la versión dividida coincide exactamente con la del modelo original (max_abs_diff 0,0).

## Capacidades

- Segmentación semántica zero-shot: genera una máscara por píxel a partir de una frase en lenguaje natural, sin necesidad de clases predefinidas.
- Clasificación zero-shot de imágenes: al combinar las torres de visión y texto, puede realizar clasificación basada en prompts (aunque el repo principal se centra en segmentación).
- Soporte de múltiples prompts sobre una misma imagen: la torre de visión se ejecuta una vez y la torre de segmentación se puede invocar repetidamente con distintos prompts.
- Ejecución on-device: gracias a ExecuTorch, puede ejecutarse en CPU (XNNPACK) y en iOS (Core ML para la torre de segmentación).
- Umbral de máscara simple: los logits se umbralizan en 0 para obtener la máscara binaria, sin postprocesado adicional.
- Compatibilidad con CLIPSegProcessor: preprocesado estándar de imagen a 352x352 y tokenización a longitud fija 77.

## Casos de uso

- Edición de imágenes selectiva: un usuario puede escribir "el cielo" o "el árbol" y obtener la máscara exacta para aplicar filtros, cambios de color o reemplazo de fondo. La ejecución on-device permite hacerlo en tiempo real en una aplicación móvil.
- Anotación automática de datos: en pipelines de generación de datasets, el modelo puede segmentar objetos descritos por texto sin necesidad de anotaciones manuales, acelerando la preparación de datos para entrenar otros modelos.
- Búsqueda visual por regiones: en una galería de fotos, se puede pedir "persona con sombrero" y obtener las regiones correspondientes, que luego se pueden indexar o recortar para búsquedas más finas.
- Asistencia a personas con discapacidad visual: una aplicación puede describir objetos en el entorno ("silla", "puerta", "perro") y generar máscaras que se convierten en señales hápticas o de audio, todo en el dispositivo.
- Control de calidad industrial: en una línea de producción, se puede pedir "defecto en la esquina" o "etiqueta dañada" y obtener la máscara de la región defectuosa para inspección automatizada, sin reentrenar el modelo.
- Segmentación en entornos médicos (investigación): aunque no está entrenado específicamente para imágenes médicas, puede usarse para segmentar estructuras descritas por texto en radiografías o ecografías, como "hueso" o "tejido", como herramienta exploratoria.

## Benchmarks y rendimiento

La model card del autor proporciona métricas de verificación frente al modelo original (eager) en términos de IoU de máscara (peor caso) y diferencia máxima absoluta. No se han publicado resultados en benchmarks estándar como MMLU o COCO, ya que se trata de un modelo de segmentación y la evaluación se centra en la fidelidad de la conversión.

| Build | Peor IoU de máscara vs eager |
|---|---|
| fp32 | 1,0000 |
| fp16 | 0,9974 |
| Core ML (segmentación) | 0,9994 |
| int8 (no incluido) | 0,9429 |

Además, se reporta que la división en dos torres produce una diferencia máxima absoluta de 0,0 frente al forward original del modelo base. Los tiempos de ejecución en Mac arm64 (mediana de 10 ejecuciones) son: torre de visión fp32 194,8 ms, fp16 252,4 ms; torre de segmentación fp32 24,7 ms, fp16 41,8 ms, Core ML 3,2 ms. En comparación, el eager fp32 tarda 53 ms en la torre de visión y 19 ms en la de segmentación.

## Requisitos de hardware

- Tamaño de los archivos: la torre de visión fp32 ocupa 286,7 MB, fp16 173,1 MB; la torre de segmentación fp32 260,8 MB, fp16 129,6 MB, Core ML 132,2 MB. El repositorio completo pesa 1,0 GB.
- VRAM estimada: no se especifica, pero al ser modelos de ~150M parámetros, caben en GPUs con 4 GB o menos en fp16. Para CPU, se requiere memoria RAM suficiente para cargar los archivos .pte.
- GPU recomendadas: no se indica ninguna GPU específica; el modelo está pensado para CPU (XNNPACK) y dispositivos Apple (Core ML). En GPU, se podría ejecutar con PyTorch, pero no es el objetivo del repo.
- Opciones de despliegue: ExecuTorch runtime, compatible con aplicaciones móviles y embebidas. No se menciona soporte para vLLM, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: en Mac arm64, la torre de visión tarda ~195 ms (fp32) y la de segmentación ~25 ms (fp32). En iOS con Core ML, la segmentación baja a 3,2 ms. No se proporcionan datos para otros dispositivos.

## Comparativa con modelos similares

| Modelo | Tipo de salida | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CLIPSeg-rd64-refined (original) | Máscara por prompt | 150,7 M | 77 tokens | Apache-2.0 | PyTorch, ONNX |
| CLIPSeg-rd64-refined-ExecuTorch (este) | Máscara por prompt | 150,7 M | 77 tokens | Apache-2.0 | ExecuTorch (.pte) |
| Grounding DINO | Cajas delimitadoras | ~172 M (Swin-T) | 256 tokens | Apache-2.0 | PyTorch |
| SAM | Máscara por clic/punto | 93,7 M (ViT-B) | no aplica | Apache-2.0 | PyTorch |

La diferencia clave frente a Grounding DINO es que CLIPSeg devuelve máscaras en lugar de cajas, y frente a SAM, que no requiere clics sino texto. La versión ExecuTorch añade la ventaja de ejecución on-device, aunque con la limitación de que la torre de visión no tiene versión Core ML y es más lenta que eager en XNNPACK.

## Limitaciones y advertencias

- La torre de visión en XNNPACK es 3,7 veces más lenta que eager (194,8 ms vs 53 ms) y no se ha medido la causa. Esto puede ser un problema para aplicaciones en tiempo real.
- No hay versión Core ML para la torre de visión debido a incompatibilidades con nodos no contiguos en el grafo. Solo la torre de segmentación tiene soporte Core ML.
- La versión int8 no se incluye porque su peor IoU (0,9429) no supera el umbral de calidad de 0,95 establecido por el autor. El tamaño de la torre de segmentación int8 sería mayor que su versión fp16 debido a la tabla de embeddings de texto.
- El modelo base fue entrenado principalmente con datos en inglés; el rendimiento con otros idiomas no está documentado.
- La segmentación depende de la calidad del prompt: prompts ambiguos o no presentes en la imagen producen máscaras vacías (el autor menciona que "a road" en una imagen sin carretera da 0% de píxeles).
- El preprocesado debe ser exactamente 352x352; usar 224 (tamaño original de CLIP) produce máscaras a escala incorrecta.
- No se han publicado resultados en benchmarks estándar de segmentación (p. ej., COCO) para esta conversión; la verificación se limita a la fidelidad frente al modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlboydaisuke/CLIPSeg-rd64-refined-ExecuTorch
- Modelo base: https://huggingface.co/CIDAS/clipseg-rd64-refined
- Conversión ONNX (Xenova): https://huggingface.co/Xenova/clipseg-rd64-refined
- Versión fp16 (Kijai): https://huggingface.co/Kijai/clipseg-rd64-refined-fp16
- Repositorio original de CLIPSeg: https://github.com/magic0ad/ClipSeg
- Paper "Image Segmentation Using Text and Image Prompts": no disponible en los resultados de búsqueda, pero referenciado en el repositorio original.
