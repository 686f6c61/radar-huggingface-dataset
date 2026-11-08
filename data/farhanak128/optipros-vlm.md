# FarhanAK128/Optipros-VLM

## Resumen

Optipros-VLM es un modelo de generación de descripciones de imágenes (image captioning) de tamano muy reducido, con 20.836.218 parámetros totales, publicado por el usuario FarhanAK128 en Hugging Face. Combina un codificador de visión ViT-tiny/16 de la librería timm, que procesa imágenes de 224×224 píxeles y produce 197 tokens de 192 dimensiones, con un decodificador transformer de 6 capas entrenado desde cero (d_model 192, 8 cabezas de atención, FFN de 768). El tokenizador empleado es el de `distilbert-base-uncased`, con un vocabulario WordPiece de 30.522 tokens.

El modelo resuelve la tarea clásica de image-to-text: dada una fotografía, generar una frase corta en inglés que la describa. Su interés radica en su tamano extremadamente compacto y en la inclusión de un artefacto ONNX con cuantización estática INT8, lo que lo hace candidato para despliegues en entornos con recursos limitados o en el borde (edge). El repositorio ocupa 0,2 GB e incluye pesos en safetensors, la definición del modelo en `modeling_captioner.py` y utilidades de carga y generación.

Se trata de un proyecto de fin de grado (FYP, Final Year Project) según la propia model card, entrenado en dos fases sobre COCO Captions (train2014) y afinado sobre 3.000 imágenes de `jxie/flickr8k`. No se declaran idiomas soportados más allá del inglés, y la licencia es MIT. La relevancia actual es limitada en términos de capacidades frente a modelos VLM modernos, pero resulta útil como referencia didáctica de arquitectura encoder-decoder compacta y como caso de estudio de cuantización INT8 para edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ViT-tiny/16 (timm, 224×224, 197 tokens × 192 dims) + decoder transformer de 6 capas (d_model 192, 8 cabezas, FFN 768, posiciones sinusoidales) |
| Parametros totales | 20.836.218 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; el decoder genera secuencias de caption cortas con tokenizador WordPiece de 30.522 tokens |
| Tipos de cuantizacion | FP32 (PyTorch) e INT8 estática (ONNX Runtime, QDQ, per-channel) |
| Idiomas soportados | inglés (según la model card; no se listan otros) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), ONNX (INT8), PyTorch (`model_state_dict`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder-decoder clásico para captioning. El codificador es un ViT-tiny con parches de 16×16 sobre entradas de 224×224, que genera 197 tokens (incluido el token de clase) de 192 dimensiones; solo los últimos 4 bloques del ViT se afinan durante el entrenamiento, mientras que el resto permanece congelado. El decodificador está compuesto por 6 capas `nn.TransformerDecoderLayer` con d_model 192, 8 cabezas de atención y FFN de 768, usando codificación posicional sinusoidal. La generación emplea [CLS] como token de inicio y [SEP] como token de fin, con el vocabulario de `distilbert-base-uncased`.

El entrenamiento se realizó en dos etapas. La primera sobre COCO Captions (train2014) durante 35 épocas con optimizador Adam (LR 1e-4 para el decoder y 1e-5 para el encoder), TokenDrop de 0,5 y precisión mixta. La segunda etapa consistió en un afinado sobre 3.000 imágenes del split de entrenamiento de `jxie/flickr8k` durante 20 épocas, con AdamW, LR 5e-5 para el decoder y 5e-6 para el encoder, batch de 64, TokenDrop 0,5 y precisión mixta. No se documenta uso de RLHF ni DPO; el entrenamiento es supervisado con pérdida de entropía cruzada sobre las secuencias de caption. Como innovación técnica destacable, el autor publica una versión ONNX con cuantización estática INT8 (QDQ, per-channel) del encoder y el decoder, orientada a inferencia en CPU y entornos edge.

## Capacidades

- Generación de descripciones de imágenes en inglés a partir de fotografías de 224×224 píxeles.
- Decodificación greedy y por muestreo con temperatura configurable (por ejemplo, temperature=0.5).
- Procesamiento por lotes de imágenes mediante la función `caption_images`.
- Carga autocontenida mediante `modeling_captioner.py`, que incluye definición del modelo, preprocesado, generación y loader.
- Inferencia en FP32 con PyTorch e inferencia INT8 con ONNX Runtime.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni razonamiento multi-paso.
- No dispone de modo thinking, visión general, audio ni otras modalidades más allá de imagen a texto.
- Capacidad multilingüe: no disponible; el modelo está entrenado y evaluado únicamente en inglés.

## Casos de uso

- Generación automática de texto alternativo (alt text) para imágenes en sitios web y aplicaciones: el modelo produce una frase corta en inglés que puede servir como descripción básica para accesibilidad, con la ventaja de su bajo coste computacional y su licencia MIT.
- Etiquetado masivo de datasets de imágenes: al ser un modelo de 20,8 M de parámetros, puede ejecutarse en CPU sobre lotes grandes para preanotar captions que luego se revisen manualmente, reduciendo el esfuerzo de anotación.
- Prototipado rápido de pipelines image-to-text en entornos docentes o de investigación: la inclusión de `modeling_captioner.py` y de la función `caption_images` permite integrar el modelo en pocas líneas de código.
- Despliegue en dispositivos de borde o sistemas embebidos: la versión ONNX INT8 estática permite inferencia en CPU con requisitos de memoria muy bajos, adecuada para Raspberry Pi o mini-PC.
- Indexación y búsqueda semántica de imágenes: generar captions y almacenarlas como texto permite búsquedas por palabras clave en catálogos fotográficos domésticos o archivos pequeños.
- Filtrado y moderación preliminar de contenido visual: usar las captions generadas como señal débil para clasificar imágenes por temática antes de un análisis más profundo con modelos mayores.
- Educación y demostración de arquitecturas encoder-decoder: el modelo sirve como ejemplo reproducible de ViT + decoder transformer con cuantización INT8, útil en cursos de visión por computador.

## Benchmarks y rendimiento

Resultados publicados en la model card. La evaluación de afinado se realizó sobre 500 imágenes del split de validación de `jxie/flickr8k` con decodificación greedy; la evaluación sobre COCO val2014 se realizó sobre 5.000 imágenes con muestreo a temperatura 0,5.

Afinado sobre Flickr8k (validación, 500 imágenes, greedy):

| Modelo | BLEU-1 | BLEU-2 | BLEU-3 | BLEU-4 | ROUGE-L | METEOR | loss |
|---|---|---|---|---|---|---|---|
| Checkpoint original | 0,5304 | 0,3284 | 0,1892 | 0,1079 | 0,3678 | 0,3095 | 3,1879 |
| Afinado (época 20) | 0,5733 | 0,3891 | 0,2546 | 0,1683 | 0,4153 | 0,3707 | 2,8043 |

COCO val2014 (5.000 imágenes, muestreo temperatura 0,5):

| Versión | BLEU-1 | BLEU-2 | BLEU-3 | BLEU-4 |
|---|---|---|---|---|
| FP32 PyTorch | 0,6081 | 0,4193 | 0,2804 | 0,1834 |
| INT8 ONNX | 0,5739 | 0,3835 | 0,2524 | 0,1624 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: inferior a 1 GB para pesos (20,8 M de parámetros, aproximadamente 83 MB en FP32) más activaciones y buffers; en la práctica cabe en cualquier GPU consumer con 4 GB o más.
- VRAM estimada para inferencia INT8 ONNX: aproximadamente 21 MB para pesos cuantizados, más overhead de runtime; ejecutable en CPU sin GPU.
- GPU recomendadas: no se requieren GPU dedicadas; funciona en CPU. Cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090) es sobrada para este modelo.
- Cabe en cualquier GPU consumer y en dispositivos de borde; también en Raspberry Pi y mini-PC con CPU moderna.
- Opciones de despliegue: PyTorch nativo mediante `modeling_captioner.py`, ONNX Runtime para la versión INT8. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros modelos en la información proporcionada. A modo orientativo estructural, se puede contrastar con alternativas genéricas de la misma categoría, aunque los datos de rendimiento de esas alternativas no forman parte de la información disponible:

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Optipros-VLM (este modelo) | 20,8 M | no disponible | MIT | safetensors, ONNX INT8 | Hugging Face |
| BLIP (base) | no disponible en esta ficha | no disponible | no disponible | no disponible | Hugging Face |
| ViT-GPT2 image captioning | no disponible en esta ficha | no disponible | no disponible | no disponible | Hugging Face |
| GIT (base) | no disponible en esta ficha | no disponible | no disponible | no disponible | Hugging Face |

Los datos de los modelos alternativos no se han verificado en la información disponible y se indican únicamente como referencia de categoría.

## Limitaciones y advertencias

- Modelo muy pequeno (20,8 M de parámetros, entrada 224×224): las captions son cortas y genéricas, y puede contar mal los objetos o confundir objetos similares.
- Solo inglés: no soporta otros idiomas, y la model card no declara capacidades multilingües.
- Entrenado sobre COCO y Flickr8k, es decir, fotografías cotidianas; rinde peor en diagramas, capturas de pantalla, imágenes médicas o imágenes especializadas.
- Hereda los sesgos presentes en las anotaciones de COCO y Flickr, incluyendo sesgos demográficos y de género en las descripciones.
- Riesgo de alucinación: puede describir objetos o atributos que no están presentes en la imagen, especialmente en escenas complejas.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la procedencia de los datasets de entrenamiento (COCO y Flickr8k tienen sus propias condiciones).
- No dispone de tool calling, agentes ni razonamiento multi-paso; no es adecuado para tareas que requieran comprensión visual profunda o diálogo sobre la imagen.
- La versión ONNX INT8 pierde precisión frente a FP32 (por ejemplo, BLEU-4 baja de 0,1834 a 0,1624 en COCO val2014), por lo que en aplicaciones sensibles a la calidad conviene usar FP32.
- El proyecto parece ser un trabajo de fin de grado sin mantenimiento garantizado; el repositorio relacionado `FarhanAK128/Optipros` usa licencia CC-BY-NC-4.0, distinta de la MIT de este modelo, lo que conviene verificar antes de reutilizar artefactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FarhanAK128/Optipros-VLM
- README del modelo: https://huggingface.co/FarhanAK128/Optipros-VLM/blob/main/README.md
- Demo en Spaces: https://huggingface.co/spaces/FarhanAK128/OptiPros-VLM-DEMO
- Repositorio relacionado Optipros: https://huggingface.co/FarhanAK128/Optipros
