# mykor/PIXIE-Rune-v1.5-GGUF

## Resumen

PIXIE-Rune-v1.5-GGUF es una conversión a formato GGUF del modelo de embeddings densos PIXIE-Rune-v1.5, desarrollado originalmente por telepix y posteriormente cuantizado por la organización mykor (My Korean Language Models). Se trata de un encoder transformer basado en la arquitectura XLM-RoBERTa, diseñado para generar representaciones vectoriales de frases y documentos con soporte multilingüe extenso. Con 566 millones de parámetros y una ventana de contexto de 8192 tokens, este modelo está pensado para tareas de recuperación de información, búsqueda semántica y similitud entre textos en más de 50 idiomas.

La relevancia de esta versión GGUF radica en su capacidad para ejecutarse en entornos con recursos limitados, como CPUs o dispositivos edge, gracias a la cuantización de pesos. Aunque el modelo original está disponible en formato safetensors, la variante GGUF facilita su uso con herramientas como llama.cpp o aplicaciones móviles, manteniendo un equilibrio entre tamaño y fidelidad de las representaciones. No se trata de un modelo generativo, sino de un encoder puro para extracción de características.

La información disponible sobre el entrenamiento es escasa: la model card en coreano solo menciona la conversión y no detalla el dataset ni las técnicas de optimización. No obstante, su presencia en el leaderboard MTEB indica que ha sido evaluado en tareas de recuperación y clasificación, aunque no se proporcionan métricas concretas en la documentación pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLMRobertaModel (encoder transformer) |
| Parametros totales | 566.703.104 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (se asume GGUF con varias opciones, pero no listadas) |
| Idiomas soportados | mas de 50: af, ar, az, be, bg, bn, ca, ceb, cs, cy, da, de, el, en, es, et, eu, fa, fi, fr, gl, gu, he, hi, hr, ht, hu, hy, id, is, it, ja, jv, ka, kk, km, kn, ko, ky, lo, lt, lv, mk, ml, mn, mr, ms, my, ne, nl, pa, pl, pt, qu, ro, ru, si, sk, sl, so, sq, sr, sv, sw, ta, te, th, tl, tr, uk, ur, vi, yo, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura XLM-RoBERTa, un encoder transformer con atención estándar, preentrenado en múltiples idiomas. No se dispone de información pública sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como hard negative mining o contrastive learning. La model card original (en coreano) únicamente indica que se trata de una conversión a GGUF del modelo telepix/PIXIE-Rune-v1.5, sin aportar detalles sobre el proceso de entrenamiento.

La conversión a GGUF permite su ejecución con llama.cpp y otras herramientas compatibles, pero no modifica la arquitectura subyacente. No se han documentado innovaciones técnicas específicas en esta versión cuantizada más allá de la propia cuantización. El modelo original sí está etiquetado como multimodal y cross-modal, aunque no se especifica qué modalidades adicionales al texto soporta ni cómo se implementa esa capacidad.

## Capacidades

- Genera embeddings densos de 1024 dimensiones para frases y documentos.
- Similitud semántica entre textos en más de 50 idiomas, incluyendo español, inglés, coreano, chino, árabe, etc.
- Recuperación de información basada en similitud coseno o producto escalar.
- Clasificación de texto mediante embeddings con clasificadores adicionales.
- Agrupamiento (clustering) de documentos por similitud.
- Etiquetado como multimodal y cross-modal en el repositorio, aunque no se detalla qué tipos de datos multimodales acepta (posiblemente texto-imagen o texto-audio, pero sin confirmación).
- No soporta generación de texto, tool calling ni razonamiento multi-step al ser un modelo de embeddings puro.

## Casos de uso

- Búsqueda semántica en bases de conocimiento: indexar documentos de una empresa y permitir consultas en lenguaje natural, aprovechando los 8192 tokens de contexto para párrafos extensos.
- Sistemas de recomendación de contenido: representar artículos o productos como vectores y calcular similitud para sugerir elementos relacionados.
- Deduplicación de registros: detectar entradas duplicadas en bases de datos comparando embeddings de campos de texto.
- Clasificación automática de tickets de soporte: generar embeddings de cada ticket y entrenar un clasificador ligero sobre ellos, o usar similitud con ejemplos etiquetados.
- Agrupación de comentarios o reseñas por tema: clusterizar feedback de usuarios para identificar tendencias o problemas recurrentes.
- Búsqueda cross-lingüe: consultar en un idioma y recuperar documentos en otro, gracias al entrenamiento multilingüe del modelo.
- Análisis de sentimiento en redes sociales: combinar embeddings con un clasificador para categorizar opiniones en múltiples idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo aparece en el leaderboard MTEB (https://leaderboard.mteb.org/models/telepix/PIXIE-Rune-v1.5), pero no se proporcionan métricas numéricas en la documentación consultada. Se recomienda consultar directamente el leaderboard para obtener datos actualizados de rendimiento en tareas de recuperación, clasificación y similitud.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para cuantizaciones bajas (por ejemplo, Q4_K_M) del modelo de 566M parámetros.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650 o superiores. También puede ejecutarse en CPU con 4-8 GB de RAM.
- Compatible con consumer GPUs: sí, incluyendo RTX 3060, RTX 4060, etc.
- Opciones de despliegue: llama.cpp (soporta GGUF), llamafile, sentence-transformers con el modelo original safetensors, y potencialmente vLLM para inferencia en batch.
- Latencia y throughput: no se dispone de mediciones específicas, pero al ser un encoder de 566M parámetros cuantizado, es esperable una latencia de decenas de milisegundos por frase en CPU moderna y menor en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension embedding | Licencia |
|---|---|---|---|---|
| PIXIE-Rune-v1.5 (GGUF) | 566M | 8192 | 1024 | Apache 2.0 |
| multilingual-e5-large | 560M | 512 (original) / 4096 (variantes) | 1024 | MIT |
| bge-m3 | 568M | 8192 | 1024 | MIT |

Nota: los datos de los modelos comparados son de referencia pública y pueden variar según la versión. No se dispone de comparativas de rendimiento directas con PIXIE-Rune-v1.5 en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no puede producir texto, completar frases ni mantener conversaciones.
- La cuantización GGUF puede introducir una ligera degradación en la calidad de los embeddings en comparación con los pesos originales en safetensors.
- No se conocen los datos de entrenamiento, por lo que los sesgos presentes en el modelo son desconocidos. Es posible que refleje sesgos de los corpus multilingües utilizados para XLM-RoBERTa.
- Riesgo de alucinación no aplica al no generar texto, pero sí puede producir representaciones poco diferenciadas para dominios muy específicos o jerga técnica si no estuvo en el entrenamiento.
- La etiqueta "multimodal" no está documentada: se desconoce si realmente acepta entradas de imagen, audio u otras modalidades, y cómo se realiza la fusión.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base telepix/PIXIE-Rune-v1.5 por si hubiera restricciones adicionales.

## Enlaces

- Repositorio del modelo GGUF: https://huggingface.co/mykor/PIXIE-Rune-v1.5-GGUF
- Modelo base original: https://huggingface.co/telepix/PIXIE-Rune-v1.5
- Leaderboard MTEB del modelo base: https://leaderboard.mteb.org/models/telepix/PIXIE-Rune-v1.5
- Perfil de mykor en Hugging Face: https://huggingface.co/mykor/models
- Herramienta de descubrimiento de modelos GGUF: https://local-ai-zone.github.io/ (referencia genérica)
