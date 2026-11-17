# OwenElliott/image-safety-classifier-s

## Resumen

`OwenElliott/image-safety-classifier-s` es un clasificador de imágenes ligero desarrollado por OwenElliott que categoriza cada imagen en una de tres clases: NSFW (contenido pornográfico o altamente sugerente), NSFL (contenido gore o violento explícito) y SFW (todo lo demás). El modelo es un fine-tune del backbone SwiftFormer-S (`timm/swiftformer_s.dist_in1k`) y está pensado para despliegue en el borde o en aplicaciones con requisitos de latencia estrictos, gracias a sus escasos 5,65 millones de parámetros y un repositorio de apenas 0,1 GB.

Forma parte de una familia de cuatro tamaños (xs, s, m, l) con arquitecturas SwiftFormer y precisiones declaradas entre el 97,76 % y el 98,20 % sobre el conjunto de evaluación del autor. Este modelo concreto, la variante "s", reporta un 97,99 % de accuracy y se distribuye con pesos en safetensors, así como variantes ONNX fp32 y fp16 con el preprocesado (normalización y softmax) integrado en el grafo.

Su relevancia actual radica en que aborda una tarea de moderación de contenido con un coste computacional muy bajo y una licencia MIT sobre los pesos ajustados, lo que facilita su integración en pipelines de moderación a gran escala. La principal limitación declarada es la infrarrepresentación de la clase NSFL en el dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SwiftFormer-S (transformer híbrido con atención lineal eficiente) |
| Parámetros totales | 5.652.374 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes, entrada 224x224) |
| Tipos de cuantización | ONNX fp32 y fp16 disponibles; safetensors en precisión original |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de texto) |
| Licencia | MIT (pesos ajustados); base SwiftFormer bajo Apache 2.0 |
| Formato de pesos | safetensors, ONNX (fp32 y fp16) |

## Arquitectura y entrenamiento

El modelo se basa en SwiftFormer-S, una arquitectura de visión que combina bloques convolucionales con mecanismos de atención lineal eficiente, lo que reduce el coste cuadrático típico de los transformers de visión. El backbone original fue preentrenado en ImageNet-1k con destilación (`dist_in1k`) y posteriormente ajustado por el autor para la tarea de clasificación de seguridad en tres clases. La entrada es de 224x224 píxeles y la salida es un vector de tres logits (NSFL, NSFW, SFW).

El ajuste se realizó sobre un dataset propietario de aproximadamente 320.000 imágenes extraídas de la web, con contenido diverso: fotos reales, dibujos, Rule 34, capturas de pantalla, imágenes generadas por IA y memes. Las clases NSFW y SFW se validaron con `Marqo/nsfw-image-detection-384` y las predicciones erróneas de alta confianza se revisaron manualmente. No se especifican en la información disponible el número de tokens (no aplica), la composición exacta del dataset por clase ni si se emplearon técnicas de RLHF o DPO (no procede en clasificación). La clase NSFL está muy infrarrepresentada, según reconoce el propio autor.

## Capacidades

- Clasificación de imágenes en tres categorías: NSFL, NSFW y SFW.
- Detección de contenido pornográfico o altamente sugerente (NSFW).
- Detección de contenido gore o violento explícito (NSFL), con rendimiento superior a alternativas según el autor, aunque con margen de mejora por escasez de datos.
- Inferencia de baja latencia apta para despliegue en el borde.
- Exportación a ONNX con preprocesado integrado (normalización de canales y softmax dentro del grafo), en fp32 y fp16.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un clasificador de visión puro).
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de la clasificación de imagen.

## Casos de uso

- Moderación de contenido en plataformas de imágenes: el modelo puede clasificar cada imagen subida en NSFW, NSFL o SFW antes de publicarse, con un coste de inferencia mínimo gracias a sus 5,65 M de parámetros, lo que permite procesar grandes volúmenes por GPU.
- Filtrado previo en pipelines de generación de imágenes: integrar el clasificador como etapa de post-procesado para bloquear o marcar salidas NSFW/NSFL generadas por modelos de difusión antes de mostrarlas al usuario.
- Moderación en aplicaciones móviles o dispositivos de borde: su tamaño (0,1 GB de repo) y la variante ONNX fp16 permiten ejecutarlo en dispositivos con recursos limitados sin depender de la nube.
- Revisión de datasets de entrenamiento: clasificar automáticamente grandes corpus de imágenes scrapeadas para separar contenido seguro del no seguro antes de usarlos en el entrenamiento de otros modelos.
- Moderación de comunidades y foros: procesar imágenes adjuntas en publicaciones y comentarios para aplicar políticas de contenido de forma automatizada, con revisión humana de los casos dudosos.
- Sistemas de control parental: clasificar imágenes en navegadores o aplicaciones infantiles para bloquear contenido NSFW/NSFL en tiempo real con baja latencia.
- Enriquecimiento de metadatos en buscadores y CDNs: etiquetar imágenes con su categoría de seguridad para permitir filtrado y cumplimiento normativo en la entrega de contenido.

## Benchmarks y rendimiento

El autor reporta accuracy sobre su propio dataset de evaluación, comparando con `Marqo/nsfw-image-detection-384` y `Falconsai/nsfw_image_detection`. No se dispone de los valores numéricos desglosados en la información proporcionada, solo de las gráficas comparativas referenciadas en la model card.

| Modelo | Parámetros | Accuracy (dataset del autor) |
|---|---|---|
| image-safety-classifier-xs | 3,5 M | 97,76 % |
| image-safety-classifier-s (este modelo) | 6,1 M | 97,99 % |
| image-safety-classifier-m | 12,1 M | 98,06 % |
| image-safety-classifier-l | 28,5 M | 98,20 % |
| Marqo/nsfw-image-detection-384 | no disponible | no disponible (inferior según el autor) |
| Falconsai/nsfw_image_detection | no disponible | no disponible (inferior según el autor) |

Nota: el autor indica que Marqo y Falconsai no tienen clase NSFL explícita, por lo que en la evaluación su predicción NSFW se cuenta como acierto para imágenes NSFL. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) por tratarse de un modelo de clasificación de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32; unos pocos cientos de MB en fp16/ONNX.
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput se recomiendan A100, H100, L4 o T4 en servidor.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU y dispositivos móviles vía ONNX Runtime.
- Opciones de despliegue: timm + PyTorch, ONNX Runtime (CPU o GPU con `onnxruntime-gpu`), integración en servicios Python; no aplica vLLM, llama.cpp, Ollama ni TGI por ser un clasificador de visión.
- Latencia y throughput: no disponibles de forma numérica en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por imagen en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Clases | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| image-safety-classifier-s | 5,65 M | NSFL, NSFW, SFW | 224x224 | MIT (pesos) | Hugging Face, timm, ONNX |
| Marqo/nsfw-image-detection-384 | no disponible | NSFW/SFW (sin NSFL) | 384x384 | no disponible | Hugging Face |
| Falconsai/nsfw_image_detection | no disponible | NSFW/SFW (sin NSFL) | no disponible | no disponible | Hugging Face |
| image-safety-classifier-l (misma familia) | 28,5 M | NSFL, NSFW, SFW | 224x224 | MIT (pesos) | Hugging Face |

El modelo se distingue de las alternativas por incluir una clase NSFL explícita y por su tamaño reducido, orientado a despliegue en el borde. Las alternativas Marqo y Falconsai no ofrecen clase NSFL y, según el autor, rinden peor en su conjunto de evaluación.

## Limitaciones y advertencias

- La clase NSFL está muy infrarrepresentada en el dataset de entrenamiento; el autor reconoce margen de mejora en la detección de gore.
- El contenido NSFW es subjetivo y contextual; el modelo puede cometer errores y se distribuye "as is", sin garantía.
- El dataset es propietario y extraído de la web, por lo que puede arrastrar sesgos de la muestra (idiomas, culturas, tipos de contenido sobrerrepresentados).
- Riesgo de falsos positivos y negativos en imágenes ambiguas (arte, ilustración, contenido médico o educativo).
- No es un modelo multimodal ni de texto: no procesa prompts ni instrucciones, solo imágenes de 224x224.
- Licencia MIT sobre los pesos ajustados, pero el backbone base SwiftFormer está bajo Apache 2.0; conviene conservar los avisos de licencia correspondientes.
- Para producción se recomienda combinarlo con revisión humana y umbrales de confianza calibrados, dado que la moderación automática nunca es perfecta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OwenElliott/image-safety-classifier-s
- Variante xs: https://huggingface.co/OwenElliott/image-safety-classifier-xs
- Variante m: https://huggingface.co/OwenElliott/image-safety-classifier-m
- Variante l: https://huggingface.co/OwenElliott/image-safety-classifier-l
- Modelo base: https://huggingface.co/timm/swiftformer_s.dist_in1k
- Modelo de referencia para validación del dataset: https://huggingface.co/Marqo/nsfw-image-detection-384
- Alternativa comparada: https://huggingface.co/Falconsai/nsfw_image_detection
