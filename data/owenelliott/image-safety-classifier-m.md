# OwenElliott/image-safety-classifier-m

## Resumen

`OwenElliott/image-safety-classifier-m` es un clasificador de imágenes de tres clases (NSFW, NSFL y SFW) desarrollado por OwenElliott. Se trata de un fine-tune del modelo `timm/swiftformer_l1.dist_in1k`, una arquitectura SwiftFormer de tipo híbrido transformer-CNN diseñada para eficiencia computacional. Con 11,3 millones de parámetros y un tamaño de repositorio de 0,1 GB, el modelo está pensado para despliegue en el borde (edge) y aplicaciones con requisitos estrictos de latencia.

El modelo aborda la moderación de contenido visual: distingue entre imágenes con contenido pornográfico o altamente sugestivo (NSFW), imágenes con gore o violencia explícita (NSFL) y contenido seguro (SFW). Forma parte de una familia de cuatro tamaños (xs, s, m, l) que comparten arquitectura base y estrategia de entrenamiento, con precisiones declaradas entre el 97,76 % y el 98,20 % sobre el conjunto de evaluación del autor.

Su relevancia actual radica en la inclusión explícita de la clase NSFL, ausente en detectores NSFW convencionales, y en su reducido coste de inferencia. El autor advierte que el contenido NSFW es subjetivo y contextual, y que el modelo puede cometer errores, por lo que debe usarse con cautela en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SwiftFormer L1 (fine-tune de `timm/swiftformer_l1.dist_in1k`) |
| Parametros totales | 11.302.566 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes; entrada 224x224 px) |
| Tipos de cuantizacion | no disponible (se ofrecen variantes ONNX fp32 y fp16) |
| Idiomas soportados | no disponible (clasificación visual, sin dependencia de idioma) |
| Licencia | MIT (pesos fine-tuneados); modelo base SwiftFormer bajo Apache 2.0 |
| Formato de pesos | safetensors, PyTorch (timm), ONNX (fp32 y fp16) |

## Arquitectura y entrenamiento

El modelo se basa en SwiftFormer L1, una arquitectura que combina bloques convolucionales con mecanismos de atención eficientes (attention lineal) para reducir el coste cuadrático de la atención estándar. El fine-tune parte de los pesos preentrenados en ImageNet-1k con destilación (`dist_in1k`) y se ajusta sobre un dataset propietario de aproximadamente 320.000 imágenes extraídas de la web. La composición del dataset incluye fotos reales, dibujos, Rule 34, capturas de pantalla, imágenes generadas por IA y memes.

El proceso de etiquetado combinó el detector `Marqo/nsfw-image-detection-384` para filtrar las clases NSFW y SFW, con revisión manual de las imágenes en las que la predicción era dudosa o contradictoria. La clase NSFL está muy infrarrepresentada en el dataset, algo que el propio autor reconoce como limitación y que se propone corregir en versiones futuras. No se documentan detalles sobre el número de épocas, la función de pérdida, el uso de RLHF/DPO (no aplicable a clasificación) ni la composición exacta por clase.

## Capacidades

- Clasificación de imágenes en tres categorías: NSFL, NSFW y SFW.
- Detección explícita de contenido gore/violento (NSFL), clase que los detectores NSFW habituales no cubren.
- Inferencia de baja latencia gracias al tamaño reducido (11,3 M de parámetros) y a la arquitectura SwiftFormer.
- Despliegue en el borde: el modelo cabe en dispositivos con recursos limitados.
- Exportación a ONNX con preprocesado integrado (normalización de color y softmax dentro del grafo), en variantes fp32 y fp16.
- Entrada de imagen fija de 224x224 píxeles en formato RGB.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador puro de imagen.

## Casos de uso

- Moderación de contenido en plataformas de contenido generado por el usuario: el modelo puede clasificar cada imagen subida en NSFW, NSFL o SFW antes de publicarla, con un coste de inferencia mínimo gracias a sus 11,3 M de parámetros.
- Filtrado previo en pipelines de datasets de entrenamiento: permite descartar imágenes NSFL y NSFW de corpus web a gran escala antes de alimentar modelos de visión, reduciendo el riesgo de contenido no deseado en los datos.
- Moderación en el borde o en el cliente: al ser un modelo de 0,1 GB, puede ejecutarse en dispositivos con recursos limitados (móviles, navegador vía ONNX) y filtrar imágenes antes de enviarlas al servidor, reduciendo costes de ancho de banda y latencia.
- Revisión de contenido en foros y comunidades: integrado como paso previo a la moderación humana, prioriza las imágenes con mayor probabilidad de ser NSFL para revisión manual, optimizando el trabajo de los moderadores.
- Protección de menores en aplicaciones de mensajería: clasificación en tiempo real de imágenes compartidas para bloquear o alertar sobre contenido NSFW o NSFL, con la ventaja de la inferencia local.
- Enriquecimiento de pipelines de búsqueda y recomendación: etiquetar imágenes con la categoría de seguridad para excluir contenido sensible de los resultados o aplicar filtros de visibilidad por audiencia.
- Control de calidad en generación de imágenes por IA: verificar que las salidas de un modelo generativo no contienen contenido NSFW o NSFL antes de entregarlas al usuario final.

## Benchmarks y rendimiento

El autor declara una precisión del 98,06 % para este modelo sobre su propio conjunto de evaluación. La tabla de la familia de modelos es la siguiente:

| Modelo | Parametros | Precision |
|---|---|---|
| `image-safety-classifier-xs` | 3,5 M | 97,76 % |
| `image-safety-classifier-s` | 6,1 M | 97,99 % |
| `image-safety-classifier-m` (este modelo) | 12,1 M | 98,06 % |
| `image-safety-classifier-l` | 28,5 M | 98,20 % |

El autor afirma que este modelo supera a `Marqo/nsfw-image-detection-384` y `Falconsai/nsfw_image_detection` en su dataset, con gráficas comparativas publicadas en la model card (evaluación global y por clase). No se proporcionan cifras numéricas desglosadas por clase en el texto disponible, solo las gráficas. Nota: la model card indica 12,1 M de parámetros para este modelo, mientras que el dato real de safetensors es 11.302.566; la discrepancia es menor y probablemente se debe a redondeo o a la inclusión de parámetros no persistentes.

## Requisitos de hardware

- VRAM para inferencia: inferior a 1 GB en fp32 (11,3 M de parámetros × 4 bytes ≈ 45 MB de pesos, más activaciones y buffers); en fp16, aproximadamente la mitad.
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo está pensado para CPU y edge. Una RTX 4090 o A100 está sobredimensionada para este modelo, pero permite lotes muy grandes y throughput elevado.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU y dispositivos móviles.
- Opciones de despliegue: `timm` + PyTorch, ONNX Runtime (CPU y GPU), y cualquier runtime compatible con ONNX. No se documenta soporte nativo para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo de texto.
- Latencia y throughput: no disponibles en la información proporcionada. La arquitectura SwiftFormer y el tamaño reducido sugieren latencias de milisegundos en CPU y sub-milisegundo en GPU para lotes pequeños, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Clases | Contexto/entrada | Precision declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `OwenElliott/image-safety-classifier-m` | 11,3 M | NSFL, NSFW, SFW | 224x224 px | 98,06 % (dataset propio) | MIT | Hugging Face (timm, ONNX) |
| `Marqo/nsfw-image-detection-384` | no disponible | NSFW, SFW | 384x384 px (por nombre) | no disponible en esta ficha | no disponible | Hugging Face |
| `Falconsai/nsfw_image_detection` | no disponible | NSFW, SFW | no disponible | no disponible en esta ficha | no disponible | Hugging Face |
| `OwenElliott/image-safety-classifier-l` | 28,5 M | NSFL, NSFW, SFW | 224x224 px | 98,20 % (dataset propio) | MIT | Hugging Face |

La ventaja diferencial de este modelo frente a Marqo y Falconsai es la clase NSFL explícita y su tamaño reducido para despliegue en el borde. La comparativa de precisión solo es válida sobre el dataset del autor; no se dispone de evaluaciones independientes.

## Limitaciones y advertencias

- La clase NSFL está muy infrarrepresentada en el dataset de entrenamiento; el autor reconoce que hay margen de mejora en la detección de gore.
- El contenido NSFW es subjetivo y contextual; el modelo puede cometer errores y el autor recomienda usarlo bajo responsabilidad del usuario.
- Riesgo de alucinación no aplica en sentido estricto (no es generativo), pero sí de falsos positivos y falsos negativos en la clasificación.
- Sesgos potenciales derivados del dataset propietario extraído de la web: la distribución de contenido (Rule 34, memes, imágenes IA) puede no representar todos los dominios o culturas.
- La evaluación se realizó sobre el dataset del propio autor, lo que puede inflar la precisión reportada; no hay benchmarks independientes.
- Licencia MIT para los pesos fine-tuneados, pero el modelo base SwiftFormer está bajo Apache 2.0; conviene revisar ambas licencias para uso comercial.
- El modelo se distribuye "as is", sin garantías.
- No es un modelo de texto ni multilingüe: cualquier caso de uso fuera de clasificación de imágenes queda fuera de su alcance.

## Enlaces

- Hugging Face: https://huggingface.co/OwenElliott/image-safety-classifier-m
- Modelo base: https://huggingface.co/timm/swiftformer_l1.dist_in1k
- Modelo de la familia (xs): https://huggingface.co/OwenElliott/image-safety-classifier-xs
- Modelo de la familia (s): https://huggingface.co/OwenElliott/image-safety-classifier-s
- Modelo de la familia (l): https://huggingface.co/OwenElliott/image-safety-classifier-l
- Detector NSFW usado para etiquetado: https://huggingface.co/Marqo/nsfw-image-detection-384
- Detector NSFW comparado: https://huggingface.co/Falconsai/nsfw_image_detection
