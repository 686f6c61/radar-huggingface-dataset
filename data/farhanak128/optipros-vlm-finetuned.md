# FarhanAK128/OptiPros-VLM-Finetuned

## Resumen

OptiPros-VLM-Finetuned es un modelo de generación de descripciones de imágenes (image captioning) de pequeño tamaño desarrollado por el usuario FarhanAK128 como parte de un proyecto de fin de grado (FYP). Combina un codificador visual ViT-tiny/16 de la librería timm, que procesa imágenes de 224×224 píxeles y produce 197 tokens de 192 dimensiones, con un decodificador Transformer de 6 capas entrenado desde cero por el equipo. El conjunto suma 20.836.218 parámetros y emplea el tokenizador `distilbert-base-uncased` con un vocabulario WordPiece de 30.522 tokens.

El modelo resuelve la tarea clásica de image-to-text: dada una fotografía, genera una frase descriptiva en inglés. Su interés radica en su extrema ligereza (unos 0,1 GB de repositorio), lo que lo hace apto para entornos con recursos muy limitados, y en que el autor ha publicado métricas de evaluación concretas tanto en COCO val2014 como en un conjunto de validación de Flickr8k, además de una variante cuantizada a INT8 en ONNX.

La relevancia actual es acotada: no compite con los grandes modelos visión-lenguaje multimodales, sino que se posiciona como una pieza educativa y de despliegue en el borde (edge) para captioning genérico en inglés. La licencia MIT facilita su reutilización comercial, aunque las capacidades quedan restringidas a descripciones cortas y genéricas de fotografías cotidianas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador ViT-tiny/16 (timm, `vit_tiny_patch16_224`) + decodificador Transformer de 6 capas (`nn.TransformerDecoderLayer`, d_model 192, 8 cabezas, FFN 768, posiciones sinusoidales) |
| Parámetros totales | 20.836.218 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (decodificador autorregresivo con tokens [CLS] de inicio y [SEP] de fin; longitud máxima no especificada) |
| Tipos de cuantización | INT8 estática (ONNX Runtime, QDQ, per-channel) para codificador y decodificador; FP32 en PyTorch |
| Idiomas soportados | inglés únicamente |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, clave `model_state_dict`), más `config.json`, `modeling_captioner.py` y artefactos ONNX INT8 |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder. El codificador es un ViT-tiny con parches de 16×16 sobre entradas de 224×224, que genera 197 tokens (incluido el token de clase) de 192 dimensiones; solo los últimos 4 bloques del codificador se ajustaron finamente. El decodificador, construido desde cero, consta de 6 capas `nn.TransformerDecoderLayer` con d_model 192, 8 cabezas de atención y FFN de 768, usando codificación posicional sinusoidal. La generación emplea el vocabulario de `distilbert-base-uncased` (30.522 tokens WordPiece), con [CLS] como token de inicio y [SEP] como token de fin.

El entrenamiento se realizó en dos etapas. La primera usó COCO Captions (train2014) durante 35 épocas con Adam (LR 1e-4 para el decodificador, 1e-5 para el codificador), TokenDrop de 0,5 y precisión mixta. La segunda etapa hizo fine-tuning sobre 3.000 imágenes del split de entrenamiento de `jxie/flickr8k` durante 20 épocas con AdamW (LR 5e-5 en decodificador, 5e-6 en codificador), batch de 64, TokenDrop 0,5 y precisión mixta. No se documenta uso de RLHF ni DPO. La innovación técnica destacable es la cuantización estática INT8 del par encoder-decoder en ONNX Runtime con esquema QDQ y cuantización per-channel, orientada a despliegue en el borde.

## Capacidades

- Generación de descripciones de imágenes en inglés a partir de fotografías de 224×224 píxeles.
- Decodificación greedy y por muestreo con temperatura (el ejemplo de la model card usa temperatura 0,5).
- Procesamiento por lotes de imágenes mediante la función `caption_images` incluida en `modeling_captioner.py`.
- Inferencia en FP32 con PyTorch y en INT8 con ONNX Runtime.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión adicional, audio ni otras modalidades.
- Capacidad multilingüe inexistente: solo inglés.

## Casos de uso

- Descripción automática de fotografías en aplicaciones móviles o web: el modelo, con 20,8 millones de parámetros y pesos de unos 0,1 GB, puede ejecutarse en dispositivos con recursos limitados para generar un pie de foto en inglés de una imagen subida por el usuario.
- Etiquetado y accesibilidad de imágenes: generación de texto alternativo breve para galerías o repositorios de fotos cotidianas, aprovechando la licencia MIT para integrarlo en productos comerciales.
- Preprocesado en pipelines de datos: uso del modelo como generador de metadatos textuales para indexar o filtrar grandes colecciones de imágenes antes de pasarlas a modelos mayores.
- Despliegue en el borde con ONNX INT8: la variante cuantizada permite inferencia en CPU o dispositivos embebidos donde no cabe un modelo multimodal grande, con una pérdida moderada de calidad (BLEU-4 de 0,1834 en FP32 frente a 0,1624 en INT8 sobre COCO val2014).
- Prototipado educativo e investigación: sirve como referencia compacta y reproducible de una arquitectura encoder-decoder para captioning, con código de definición y carga incluido en el repositorio.
- Generación de descripciones en herramientas de anotación semiautomática: el modelo puede proponer una primera frase que un humano revise, reduciendo el tiempo de etiquetado en conjuntos de fotos de estilo COCO o Flickr.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card.

Fine-tuning sobre 500 imágenes de validación de `jxie/flickr8k`, decodificación greedy:

| Modelo | BLEU-1 | BLEU-2 | BLEU-3 | BLEU-4 | ROUGE-L | METEOR | Loss |
|---|---|---|---|---|---|---|---|
| Checkpoint original | 0,5304 | 0,3284 | 0,1892 | 0,1079 | 0,3678 | 0,3095 | 3,1879 |
| Fine-tuned (época 20) | 0,5721 | 0,3882 | 0,2542 | 0,1681 | 0,4153 | 0,3712 | 2,8043 |

COCO val2014 (5.000 imágenes, muestreo con temperatura 0,5):

| Versión | BLEU-1 | BLEU-2 | BLEU-3 | BLEU-4 |
|---|---|---|---|---|
| FP32 PyTorch | 0,6081 | 0,4193 | 0,2804 | 0,1834 |
| INT8 ONNX | 0,5739 | 0,3835 | 0,2524 | 0,1624 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de razonamiento o código en la información disponible, lo cual es coherente con la naturaleza del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (20,8 millones de parámetros, aproximadamente 83 MB de pesos) y en torno a 21 MB en INT8.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090, A100 o H100, aunque no necesita ninguna de las de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: PyTorch con el script `modeling_captioner.py` proporcionado por el autor, y ONNX Runtime para la variante INT8. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OptiPros-VLM-Finetuned | 20,8 M | no disponible | ViT-tiny + decoder Transformer, captioning en inglés | MIT | Hugging Face |
| BLIP-base (Salesforce) | ~224 M | no disponible | Encoder-decoder multimodal para captioning y VQA | BSD-3-Clause | Hugging Face |
| GIT-base (Microsoft) | ~177 M | no disponible | Transformer generativo imagen-texto | MIT | Hugging Face |
| ViT-GPT2 image captioning | ~250 M | 1.024 tokens | ViT + GPT-2, captioning en inglés | MIT | Hugging Face |

La comparativa se limita a parámetros, licencia y disponibilidad: no se dispone de resultados de benchmarks homogéneos de estos modelos en la información proporcionada, por lo que no se ofrece comparación de rendimiento numérica.

## Limitaciones y advertencias

- Modelo pequeño (20,8 millones de parámetros, entrada de 224×224): las descripciones son cortas y genéricas, y puede contar mal los objetos o confundir objetos similares.
- Solo inglés; no soporta otros idiomas.
- Entrenado con fotografías cotidianas de estilo COCO y Flickr, por lo que rinde peor en diagramas, capturas de pantalla, imágenes médicas u otras imágenes especializadas.
- Hereda los sesgos de los pies de foto de COCO y Flickr, incluyendo posibles estereotipos de género, ocupación o contexto social.
- Riesgo de alucinación: al ser un modelo generativo autorregresivo, puede describir objetos o escenas que no aparecen en la imagen.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia de los datos de entrenamiento (COCO y Flickr8k) para usos sensibles.
- Calidad reducida en la variante INT8 ONNX (por ejemplo, BLEU-4 de 0,1624 frente a 0,1834 en FP32 sobre COCO val2014).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay evidencia de validación externa ni mantenimiento continuado.
- No se documentan la longitud máxima de secuencia del decodificador ni el comportamiento con imágenes de resolución distinta de 224×224.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FarhanAK128/OptiPros-VLM-Finetuned
- Demo (Space): https://huggingface.co/spaces/FarhanAK128/OptiPros-VLM-DEMO
- Model card del modelo base de referencia: https://huggingface.co/FarhanAK128/Optipros-VLM/blob/main/README.md
- Repositorio Optipros (artefactos ONNX y cuantización): https://huggingface.co/FarhanAK128/Optipros
