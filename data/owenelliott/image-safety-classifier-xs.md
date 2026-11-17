# OwenElliott/image-safety-classifier-xs

## Resumen

`OwenElliott/image-safety-classifier-xs` es un clasificador de imágenes ligero desarrollado por OwenElliott que etiqueta cada imagen en una de tres categorías: NSFW (contenido pornográfico o altamente sugestivo), NSFL (contenido gore o violento explícito) y SFW (todo lo demás). El modelo es un fine-tune del backbone `timm/swiftformer_xs.dist_in1k`, una arquitectura híbrida transformer-CNN diseñada para eficiencia computacional, y cuenta con tan solo 3.040.646 parámetros reales según los pesos en safetensors.

La propuesta de valor del modelo es su reducido tamaño, que lo hace apto para despliegue en el borde (edge) o en aplicaciones con requisitos estrictos de latencia, donde detectores más pesados como `Marqo/nsfw-image-detection-384` o `Falconsai/nsfw_image_detection` resultan inviables. Forma parte de una familia de cuatro variantes (xs, s, m, l) con precisión creciente desde el 97,76 % hasta el 98,20 % sobre el conjunto de evaluación del autor.

Es relevante ahora porque cubre una necesidad operativa concreta —moderación de contenido visual en plataformas— con un coste de inferencia mínimo y una licencia MIT permisiva para uso comercial, aunque con la advertencia explícita de que la clasificación de contenido sensible es subjetiva y contextual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SwiftFormer (híbrido transformer-CNN), fine-tune de `timm/swiftformer_xs.dist_in1k` |
| Parametros totales | 3.040.646 (safetensors); la model card indica ~3,5M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes, entrada 224x224) |
| Tipos de cuantizacion | ONNX fp32 y fp16; safetensors en precisión original |
| Idiomas soportados | no disponible (modelo visual, sin procesamiento de texto) |
| Licencia | MIT (pesos fine-tuneados); base Apache 2.0 |
| Formato de pesos | safetensors, ONNX (fp32 y fp16), PyTorch via timm |

## Arquitectura y entrenamiento

El modelo parte de SwiftFormer en su variante `xs`, una arquitectura que combina bloques convolucionales con mecanismos de atención eficientes y que fue preentrenada en ImageNet-1k con destilación (`dist_in1k`). Sobre ese backbone se realizó un fine-tune de clasificación con tres clases de salida (NSFL, NSFW, SFW). La entrada es de 224x224 píxeles y las variantes ONNX incorporan la normalización de canales y el softmax dentro del grafo, de modo que solo es necesario redimensionar la imagen y pasar valores de píxel en rango 0-255.

El conjunto de entrenamiento es propietario y consta de aproximadamente 320.000 imágenes extraídas de la web, con contenido diverso: fotos reales, dibujos, Rule 34, capturas de pantalla, imágenes generadas por IA y memes. Las clases NSFW y SFW se validaron con `Marqo/nsfw-image-detection-384` y las imágenes con predicción confiada pero incorrecta se revisaron manualmente. La clase NSFL está muy infrarrepresentada por la dificultad de recopilar datos gore a escala, algo que el autor reconoce como limitación principal y objetivo de mejora futura. No se documentan detalles sobre uso de RLHF, DPO ni número exacto de tokens o épocas de entrenamiento.

## Capacidades

- Clasificación de imágenes en tres clases: NSFW, NSFL y SFW.
- Detección de contenido pornográfico o altamente sugestivo (NSFW).
- Detección de contenido gore o violento explícito (NSFL), con mejor rendimiento que detectores sin clase NSFL explícita según la evaluación del autor.
- Procesamiento de imágenes reales, ilustraciones, dibujos, memes, capturas de pantalla y contenido generado por IA.
- Inferencia de baja latencia apta para entornos de borde gracias a su tamaño reducido.
- Exportación a ONNX con preprocesamiento integrado (normalización y softmax en el grafo).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador visual puro.

## Casos de uso

- Moderación de subidas de usuario en plataformas sociales: el modelo puede filtrar imágenes antes de publicarlas, clasificando en tres categorías con un coste computacional mínimo y permitiendo revisiones humanas solo en los casos dudosos.
- Filtrado en aplicaciones de mensajería y foros: integrado como paso previo al almacenamiento o visualización, bloquea contenido NSFW o NSFL en tiempo real gracias a su idoneidad para latencia crítica.
- Preprocesamiento de datasets de entrenamiento: limpia corpus de imágenes web eliminando ejemplos NSFW/NSFL antes de usarlos en el entrenamiento de modelos generativos o de visión.
- Despliegue en dispositivos de borde o móviles: su tamaño de ~3M parámetros y la variante ONNX fp16 permiten ejecución local en dispositivos con recursos limitados, sin enviar imágenes a servidores externos.
- Moderación en plataformas de generación de imágenes por IA: actúa como filtro de salida para evitar que los modelos generativos produzcan contenido no permitido.
- Cumplimiento normativo y salvaguardas en herramientas educativas o infantiles: criba de contenido cargado por menores o en entornos con requisitos de seguridad estrictos.
- Enrutamiento inteligente en pipelines de contenido: clasificación automática que decide si una imagen requiere revisión humana, almacenamiento restringido o publicación directa.

## Benchmarks y rendimiento

La model card proporciona cifras de precisión sobre el conjunto de evaluación del autor para la familia completa:

| Modelo | Parametros | Precision |
|---|---|---|
| `image-safety-classifier-xs` (este) | 3,5M (card) / 3,04M (safetensors) | 97,76 % |
| `image-safety-classifier-s` | 6,1M | 97,99 % |
| `image-safety-classifier-m` | 12,1M | 98,06 % |
| `image-safety-classifier-l` | 28,5M | 98,20 % |

El autor indica que este modelo supera a `Marqo/nsfw-image-detection-384` y `Falconsai/nsfw_image_detection` en su dataset, con gráficas comparativas por clase incluidas en el repositorio. No se publican cifras numéricas desglosadas de MMLU, HumanEval, GSM8K ni métricas estándar de visión como ImageNet top-1, al tratarse de una tarea de clasificación específica. Los valores concretos de precisión, recall o F1 por clase no están disponibles en formato tabular en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32; unos pocos cientos de MB en fp16/ONNX. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna es suficiente; RTX 4090, A100 o H100 quedan sobredimensionadas para este modelo. Funciona también en CPU con latencia aceptable.
- Cabe en GPU consumer: sí, en cualquier modelo (incluso GTX 1050 o inferiores) y en dispositivos de borde.
- Opciones de despliegue: timm + PyTorch, ONNX Runtime (CPU o `onnxruntime-gpu`), y exportación a otros runtimes compatibles con ONNX. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles de forma numérica en la información proporcionada. La model card menciona idoneidad para aplicaciones de latencia crítica pero no publica cifras de milisegundos por imagen ni imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Clases | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `OwenElliott/image-safety-classifier-xs` | ~3,04M | NSFW, NSFL, SFW | 224x224 | MIT | Hugging Face, ONNX fp32/fp16 |
| `Marqo/nsfw-image-detection-384` | no disponible | NSFW (sin NSFL explícita) | 384x384 | no disponible | Hugging Face |
| `Falconsai/nsfw_image_detection` | no disponible | NSFW (sin NSFL explícita) | no disponible | no disponible | Hugging Face |
| `OwenElliott/image-safety-classifier-l` | 28,5M | NSFW, NSFL, SFW | 224x224 | MIT | Hugging Face |

Según la evaluación del autor, este modelo supera a Marqo y Falconsai en su dataset, aunque la comparación es favorable al incluir una clase NSFL explícita que los otros no tienen (en la evaluación, la clase NSFW de Marqo y Falconsai se contabiliza como acierto para imágenes NSFL). La variante `l` de la misma familia ofrece mayor precisión (98,20 % frente a 97,76 %) a cambio de un tamaño casi diez veces mayor.

## Limitaciones y advertencias

- La clasificación de contenido NSFW/NSFL es subjetiva y contextual; el modelo puede cometer errores tanto por falso positivo como por falso negativo.
- La clase NSFL está muy infrarrepresentada en el dataset de entrenamiento, lo que limita su fiabilidad en ese dominio pese a superar a alternativas sin clase NSFL.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí de clasificaciones erróneas confiadas; se recomienda umbral de confianza y revisión humana en producción.
- El dataset de entrenamiento es propietario y no reproducible, lo que dificulta auditar sesgos o distribuciones.
- No se especifican sesgos demográficos, culturales o de representación; el scraping web puede introducir sesgos no documentados.
- La licencia MIT permite uso comercial, pero el modelo base SwiftFormer está bajo Apache 2.0; conviene revisar las condiciones de ambos.
- El autor advierte explícitamente que el modelo se proporciona "tal cual" y que su uso es bajo responsabilidad del usuario.
- No soporta texto, audio ni otras modalidades; es exclusivamente un clasificador visual de tres clases.
- No hay información sobre idiomas porque no procesa lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OwenElliott/image-safety-classifier-xs
- Variante s: https://huggingface.co/OwenElliott/image-safety-classifier-s
- Variante m: https://huggingface.co/OwenElliott/image-safety-classifier-m
- Variante l: https://huggingface.co/OwenElliott/image-safety-classifier-l
- Modelo base: https://huggingface.co/timm/swiftformer_xs.dist_in1k
- Detector de referencia Marqo: https://huggingface.co/Marqo/nsfw-image-detection-384
- Detector de referencia Falconsai: https://huggingface.co/Falconsai/nsfw_image_detection
