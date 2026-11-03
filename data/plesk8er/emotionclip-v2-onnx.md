# plesk8er/EmotionCLIP-V2-ONNX

## Resumen

EmotionCLIP-V2-ONNX es una conversión a formato ONNX del modelo jiangchengchengNLP/EmotionCLIP-V2, un CLIP ViT-B/32 afinado sobre el conjunto de datos EmoSet para clasificación de emociones en imágenes. El modelo original fue desarrollado por el usuario de HuggingFace jiangchengchengNLP y esta conversión la firma plesk8er (Convivial Studio), empaquetada específicamente para el componente EmotionCLIP de TouchDesigner. La relevancia de esta versión no reside en el modelo en sí, sino en el formato: permite ejecutar inferencia ONNX sin dependencias de PyTorch en entornos de creación visual en tiempo real.

Se trata de un modelo de clasificación de imágenes zero-shot con arquitectura CLIP ViT-B/32, que proyecta imágenes y textos a un espacio latente compartido de 512 dimensiones. La conversión mantiene los pesos originales sin modificar; solo cambia el formato de serialización y se incorporan artefactos auxiliares (banco de embeddings precalculados, tokenizador BPE y escala de logits) para simplificar su uso en producción.

El modelo clasifica imágenes completas (escenas, fotografías, obras de arte) según nueve etiquetas emocionales: amusement, anger, awe, contentment, disgust, excitement, fear, sadness y neutral. No está entrenado específicamente para reconocimiento de expresiones faciales, lo que condiciona sus casos de uso hacia análisis de tono afectivo global de imágenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/32 (transformer visual + text encoder) |
| Parametros totales | no disponible (ViT-B/32 estándar de CLIP, ~150M en el original; la conversión no declara recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (text encoder con entrada fija de 57 tokens) |
| Tipos de cuantizacion | FP32 y FP16 (ficheros `_fp16` opcionales) |
| Idiomas soportados | no disponible (el prompt de emoción está en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La arquitectura subyacente es CLIP ViT-B/32, un transformer de visión con parches de 32x32 y un text encoder basado en transformer. El modelo original EmotionCLIP-V2 fue afinado sobre el conjunto EmoSet aplicando técnicas de prefix tuning, prompt tuning y layer-norm tuning, manteniendo congelado el backbone CLIP. Esta conversión ONNX preserva los pesos entrenados y exporta por separado el codificador visual (entrada `[1,3,224,224]` RGB en rango 0..1, con normalización CLIP incorporada) y el codificador textual (entrada `tokens` int64 de forma `[1,57]`, con el prompt de emoción aprendido ya integrado).

La innovación práctica de este paquete es la inclusión de `emotionclip_v2_bank.json`, que contiene los embeddings precalculados de las nueve etiquetas entrenadas y un banco de palabras por defecto, junto con el valor `logit_scale`. Esto elimina la necesidad de ejecutar el codificador textual en cada inferencia si solo se usan las etiquetas canónicas: basta con calcular el embedding de la imagen y aplicar `softmax(logit_scale * text_embeddings @ image_embedding)`. El prompt template empleado es `This picture conveys a sense of {}`. No se dispone de información sobre el número de tokens de entrenamiento ni sobre la composición exacta del dataset EmoSet en la información proporcionada.

## Capacidades

- Clasificación zero-shot de imágenes según nueve categorías emocionales: amusement, anger, awe, contentment, disgust, excitement, fear, sadness y neutral.
- Extracción de embeddings visuales normalizados de 512 dimensiones, reutilizables para búsqueda por similitud o clustering.
- Extracción de embeddings textuales de 512 dimensiones con el prompt de emoción aprendido.
- Clasificación con etiquetas personalizadas mediante el banco de palabras (`word bank`) y el codificador textual exportado.
- Inferencia sin PyTorch mediante ONNX Runtime, adecuada para entornos de creación visual como TouchDesigner.
- Soporte de precisión FP32 y FP16 para reducir uso de memoria y latencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto libre.
- No dispone de capacidades multilingües declaradas; el prompt de emoción está en inglés.
- No incluye visión por regiones ni detección de expresiones faciales específicas.

## Casos de uso

- Instalaciones artísticas interactivas en TouchDesigner: el componente EmotionCLIP puede analizar en tiempo real el tono afectivo de una webcam o de material pregrabado y mapear la emoción dominante a parámetros visuales (color, distorsión, audio), aprovechando la inferencia ONNX sin dependencias pesadas.
- Etiquetado automático de archivos multimedia: procesar lotes de fotografías o fotogramas y asignar una etiqueta emocional entre las nueve disponibles para organizar bibliotecas por tono afectivo.
- Moderación de contenido asistida: como señal auxiliar para detectar imágenes con carga emocional negativa (anger, disgust, fear) en pipelines de revisión, siempre con supervisión humana dada la subjetividad del etiquetado.
- Análisis de recepción creativa: estudiar la respuesta emocional percibida de campañas visuales o portfolios comparando la distribución de etiquetas sobre un conjunto de imágenes.
- Búsqueda semántica de imágenes por emoción: usar los embeddings visuales de 512 dimensiones para recuperar imágenes similares en tono afectivo dentro de un catálogo, combinando similitud coseno con las etiquetas precalculadas.
- Prototipado rápido en investigación afectiva: al estar en ONNX y con el banco de embeddings incluido, permite validar hipótesis sobre percepción emocional de imágenes sin montar un entorno PyTorch completo.
- Filtrado previo en datasets de visión: descartar o agrupar imágenes por tono emocional antes de entrenar otros modelos, reduciendo el coste de anotación manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0,5 GB en total; el codificador visual ViT-B/32 en FP32 requiere aproximadamente 350 MB de pesos y en FP16 alrededor de 175 MB. La inferencia sobre una imagen de 224x224 necesita poco más de 1 GB de VRAM en FP32 y menos de 512 MB en FP16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. También puede ejecutarse en CPU con ONNX Runtime para cargas moderadas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), DirectML, TensorRT, integración nativa en TouchDesigner mediante el componente EmotionCLIP. No requiere vLLM, llama.cpp ni TGI, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Para un ViT-B/32 en GPU moderna se espera latencia de milisegundos por imagen, pero no se confirma con datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| EmotionCLIP-V2-ONNX (este) | no disponible (ViT-B/32) | imagen 224x224, texto 57 tokens | Clasificación emocional zero-shot | Apache-2.0 | ONNX |
| jiangchengchengNLP/EmotionCLIP-V2 | no disponible (ViT-B/32) | imagen 224x224, texto 57 tokens | Clasificación emocional zero-shot | Apache-2.0 | PyTorch |
| OpenAI CLIP ViT-B/32 | ~150M | imagen 224x224, texto 77 tokens | Clasificación zero-shot genérica | MIT | PyTorch, ONNX |
| EmoSet (dataset de referencia) | no aplica | no aplica | Dataset de emociones visuales | no disponible | no aplica |

La comparación más directa es con el modelo original en PyTorch, del que esta versión solo difiere en formato. Frente a CLIP ViT-B/32 genérico, EmotionCLIP-V2 está especializado en emociones mediante fine-tuning sobre EmoSet, a costa de perder generalidad en otras tareas zero-shot. No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo clasifica el tono afectivo global de la imagen; no está entrenado para reconocimiento de expresiones faciales, por lo que su uso en rostros puede dar resultados poco fiables.
- La percepción emocional es subjetiva y culturalmente dependiente; las nueve etiquetas son una simplificación y pueden no cubrir matices relevantes.
- Riesgo de sesgo: el dataset EmoSet y la anotación humana subyacente pueden introducir sesgos culturales, demográficos o de composición visual que se reflejen en las predicciones.
- El prompt template y las etiquetas están en inglés; no se declaran capacidades multilingües.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda citar al autor original (jiangchengchengNLP) y a Convivial Studio por la conversión.
- El tokenizador BPE incluido proviene de OpenAI CLIP bajo licencia MIT; conviene conservar el aviso correspondiente.
- Al ser una conversión ONNX, cualquier mejora o corrección del modelo debe hacerse sobre el original y reexportarse.
- No apto para decisiones automatizadas de alto impacto (por ejemplo, evaluación psicológica o moderación sin revisión humana) dada la naturaleza subjetiva de la tarea.
- El repositorio no declara métricas de validación ni resultados de benchmarks, lo que dificulta estimar su calidad frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/plesk8er/EmotionCLIP-V2-ONNX
- Modelo base original: https://huggingface.co/jiangchengchengNLP/EmotionCLIP-V2
- OpenAI CLIP (origen del tokenizador BPE): https://github.com/openai/CLIP
- ONNX Runtime: https://onnxruntime.ai/
- TouchDesigner: https://derivative.ca/
