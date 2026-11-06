# manasrpandya/goemotions-distil-onnx

## Resumen

goemotions-distil-onnx es un modelo de clasificación de texto multietiqueta especializado en detección de emociones, desarrollado por el usuario manasrpandya y publicado en Hugging Face. Se trata de un fine-tuning de distilroberta-base sobre el conjunto de datos GoEmotions de Google Research, que cubre 27 emociones más una categoría neutral, y que ha sido destilado a partir de dos profesores roberta-large entrenados con funciones de pérdida distintas (BCE y ASL, asymmetric loss). El resultado es un clasificador compacto orientado a despliegue en navegador y entornos con recursos limitados.

El modelo se distribuye principalmente en formato ONNX para su uso con transformers.js, con tres variantes de precisión: int8 dinámica (79 MB), fp16 para WebGPU y fp32 completa. El repositorio ocupa 0,6 GB en total. Su relevancia actual radica en que permite ejecutar clasificación emocional multietiqueta directamente en el cliente (navegador o edge), sin depender de infraestructura de servidor, con una latencia declarada de unos 9 ms por frase en CPU.

La arquitectura subyacente es un transformer encoder de tipo RoBERTa destilado, con licencia MIT, soporte exclusivo del inglés y un pipeline de text-classification. El autor publica métricas sobre el conjunto de test con umbrales por etiqueta ajustados en validación, así como un fichero de calibración para convertir los logits en probabilidades calibradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (distilroberta-base, destilacion de dos roberta-large) |
| Parametros totales | no disponible (distilroberta-base tiene ~82 M; el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamica (model_quantized.onnx, 79 MB), fp16 (model_fp16.onnx, para WebGPU), fp32 (model.onnx) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | ONNX (tres variantes: int8, fp16, fp32); libreria transformers.js |

## Arquitectura y entrenamiento

El modelo parte de distilroberta-base, un encoder transformer de tipo RoBERTa destilado, y se afina sobre GoEmotions como tarea de clasificación multietiqueta con 28 salidas (27 emociones más neutral). El entrenamiento emplea destilación de conocimiento desde dos profesores roberta-large: uno entrenado con binary cross-entropy (BCE) y otro con asymmetric loss (ASL), lo que aporta diversidad en la señal de supervisión y mitiga parcialmente el desequilibrio de clases típico de GoEmotions.

La innovación principal no está en la arquitectura, sino en el pipeline de despliegue: exportación a ONNX con tres niveles de precisión y calibración explícita de las probabilidades de salida. El autor indica que los logits deben transformarse con sigmoid(logits / 0,720) para obtener probabilidades calibradas, y que los umbrales por etiqueta ajustados en validación se encuentran en el fichero calib.json. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la referencia a google-research-datasets/go_emotions.

## Capacidades

- Clasificación de texto multietiqueta: predice simultáneamente 27 emociones más neutral sobre una misma frase, no una única clase excluyente.
- Detección de emociones en inglés: entrenado y evaluado exclusivamente sobre texto en inglés.
- Salida con logits calibrables: el autor documenta la transformación sigmoid(logits / 0,720) y umbrales por etiqueta en calib.json.
- Ejecución en navegador y edge: formato ONNX compatible con transformers.js, incluyendo variante fp16 para WebGPU.
- Baja latencia en CPU: aproximadamente 9 ms por frase según el autor.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Moderación de comunidades en línea: el modelo puede etiquetar mensajes con emociones como enfado, frustración o tristeza para priorizar revisiones humanas, ejecutándose en el cliente sin enviar el texto a un servidor.
- Análisis de sentimiento granular en encuestas: sustituye la clasificación binaria positivo/negativo por un vector de 28 emociones, útil para detectar matices como gratitud, curiosidad o decepción en respuestas abiertas.
- Procesamiento en el navegador con transformers.js: al distribuirse como ONNX int8 de 79 MB, puede cargarse en una aplicación web y clasificar texto localmente, reduciendo coste de infraestructura y mejorando la privacidad.
- Enrutamiento de tickets de soporte: las emociones detectadas permiten asignar prioridad o derivar a equipos especializados los mensajes con carga emocional negativa alta.
- Investigación en psicolingüística y ciencias sociales: permite anotar corpus en inglés con 28 categorías emocionales de forma reproducible y a bajo coste, con umbrales documentados y calibración explícita.
- Filtrado previo en pipelines de datos: como clasificador ligero, puede descartar o etiquetar grandes volúmenes de texto antes de pasarlos a modelos mayores, aprovechando su latencia de milisegundos en CPU.
- Análisis de comentarios en redes sociales: la naturaleza multietiqueta se ajusta a mensajes que mezclan emociones, algo frecuente en texto corto informal.

## Benchmarks y rendimiento

Datos publicados por el autor sobre el conjunto de test, usando el modelo int8 y umbrales por etiqueta ajustados en validación:

| Metrica | Valor |
|---|---|
| Macro-F1 | 0,543 |
| Micro-F1 | 0,612 |
| Macro-F1 en categorias Ekman | 0,646 |
| Latencia en CPU | ~9 ms por frase |

No se han publicado en la información disponible comparaciones directas con otros modelos en forma de tabla.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las variantes; el fichero int8 ocupa 79 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU. Para la variante fp16 se recomienda una GPU con soporte WebGPU en el navegador (por ejemplo, integradas recientes o dedicadas de gama media en adelante).
- Cabe en cualquier GPU consumer: sí, incluidas GTX 1050, RTX 3050 o inferiores, dado el reducido tamaño del modelo.
- Opciones de despliegue: transformers.js (principal), ONNX Runtime en cualquier lenguaje, y cualquier runtime compatible con ONNX (incluido llama.cpp no aplica por no ser un modelo generativo).
- Latencia y throughput: aproximadamente 9 ms por frase en CPU según el autor; no se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| goemotions-distil-onnx | ~82 M (distilroberta-base) | no disponible | Multietiqueta, 28 clases, destilado | MIT | ONNX |
| roberta-base-go_emotions (SamLowe) | ~125 M | 512 tokens | Multietiqueta, 28 clases | MIT | safetensors |
| distilroberta-base original | ~82 M | 512 tokens | Encoder general, sin fine-tuning emocional | MIT | safetensors |

La comparación con roberta-base-go_emotions es la más directa por tarea, aunque no se dispone en la información proporcionada de una comparación de métricas entre ambos. La ventaja diferencial de este modelo es el empaquetado ONNX con cuantización int8 y calibración documentada, orientado a despliegue en navegador.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas, incluido el castellano.
- Riesgo de sesgo: GoEmotions procede de comentarios de Reddit, con la distribución demográfica y temática de esa plataforma; el modelo puede rendir peor en otros dominios.
- Desequilibrio de clases: las emociones raras tienen menos ejemplos; el macro-F1 de 0,543 refleja esta dificultad y los umbrales por etiqueta son sensibles al dominio.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y negativos en la clasificación, especialmente en textos irónicos o sarcásticos.
- Longitud de contexto no documentada: no se especifica el máximo de tokens de entrada en la información disponible.
- Calibración dependiente de umbrales: usar los logits sin la transformación sigmoid(logits / 0,720) ni los umbrales de calib.json produce probabilidades mal calibradas.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del dataset GoEmotions subyacente si se redistribuyen datos derivados.
- Repositorio con muy poca tracción (31 descargas, 0 likes) y creado en 2026: no hay validación independiente de las métricas declaradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/manasrpandya/goemotions-distil-onnx
- Profesor BCE: https://huggingface.co/manasrpandya/goemotions-teacher
- Profesor ASL: https://huggingface.co/manasrpandya/goemotions-teacher-asl
- Demo en vivo: https://nlp-cv-lab.vercel.app/p/emotion-classification
- Código: https://github.com/manasrpandya/NLP_CV_Lab/tree/main/projects/06-emotion-classification
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
