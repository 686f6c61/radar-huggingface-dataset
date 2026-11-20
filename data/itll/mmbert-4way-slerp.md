# ITLL/mmBERT-4Way-SLERP

## Resumen

ITLL/mmBERT-4Way-SLERP es un checkpoint de encoder mmBERT-base obtenido mediante interpolación esférica (SLERP) de cuatro vías sobre los backbones de encoder compartidos de cuatro modelos ajustados. Lo publica el usuario ITLL en Hugging Face y está pensado para extracción de características (feature-extraction), no como modelo generativo. El resultado es un único encoder de unos 307 millones de parámetros que fusiona los pesos de cuatro fuentes distintas en un espacio tensorial común.

La relevancia de este checkpoint es metodológica: demuestra una técnica de model merging (SLERP secuencial con contribución equitativa) aplicada a encoders de la familia mmBERT, una arquitectura ModernBERT multilingüe. Las cabezas de clasificación y decisión específicas de cada tarea de los modelos de origen no se incluyen en el encoder fusionado, por lo que el artefacto resultante es un extractor de representaciones genérico que debe recibir una cabeza nueva o utilizarse en pipelines de embeddings.

No se dispone de información sobre licencia, idiomas soportados ni resultados de benchmarks en la documentación publicada. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, familia mmBERT-base) |
| Parametros totales | 306.939.648 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, concretamente sobre el backbone mmBERT-base. No es un modelo entrenado desde cero: se construye mediante model merging de cuatro checkpoints ajustados que comparten el mismo backbone de encoder. Los cuatro modelos de origen son msmth/Source-1, marcyano/Groot-1, vllm-sr/Decision-1.0-Kai-0.6B y RedHatAI/wolf-defender-prompt-injection.

La fusión se realizó mapeando los backbones de encoder compartidos a un espacio tensorial común y aplicando SLERP secuencial con contribución equitativa entre las cuatro fuentes. Las cabezas específicas de clasificación y decisión de cada modelo de origen se descartan, de modo que el checkpoint resultante contiene únicamente el encoder. El autor publica un merge_manifest.json con los mapeos de tensores y hashes para reproducibilidad. No se detalla el volumen de tokens de entrenamiento ni si hubo RLHF/DPO, ya que al ser un merge no hay entrenamiento propio; los datasets listados en la model card son la agregación de las referencias de datos de los modelos de origen.

## Capacidades

- Extracción de características y generación de embeddings de texto (pipeline feature-extraction).
- Representaciones contextuales de tipo encoder, aptas para clasificación, similitud semántica y recuperación.
- Base para ajuste fino con cabezas de clasificación o decisión propias.
- Capacidades multilingües potenciales derivadas del backbone mmBERT, aunque no se documentan idiomas concretos.
- No incluye generación de texto autoregresiva, tool calling ni razonamiento multi-paso: es un encoder, no un modelo de chat.
- No incluye cabezas de clasificación ni de decisión preentrenadas.

## Casos de uso

- Clasificación de texto con ajuste fino: congelar el encoder y entrenar una cabeza lineal sobre las representaciones para tareas como detección de prompt injection o moderación, dado que dos de los modelos de origen (wolf-defender-prompt-injection) apuntan a ese dominio.
- Búsqueda semántica y recuperación aumentada (RAG): usar el encoder para generar embeddings de documentos y consultas en un índice vectorial, aprovechando la naturaleza de extracción de características del checkpoint.
- Deduplicación y clustering de documentos: calcular embeddings y agrupar por similitud coseno para consolidar corpus o detectar duplicados.
- Filtrado de contenido y seguridad: servir como base para clasificadores de toxicidad o jailbreak, reutilizando el conocimiento de los modelos de origen orientados a seguridad.
- Enrutamiento de decisiones: el origen vllm-sr/Decision-1.0-Kai-0.6B sugiere uso como base para clasificadores de decisión o enrutamiento en pipelines de agentes.
- Embeddings para análisis de sentimiento y temas: ajustar cabezas sobre los datasets de clasificación listados (ag_news, emotion, banking77, etc.) para tareas de análisis.
- Extracción de características en producción a bajo coste: al ser un encoder de ~307M parámetros, cabe en GPUs de consumo y permite throughput alto en inferencia por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,6 GB de pesos más overhead de activaciones; en la práctica, menos de 2 GB para lotes pequeños.
- VRAM en cuantización INT8: alrededor de 0,3 GB de pesos; en INT4, en torno a 0,15 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. Cabe holgadamente en GPUs de consumo.
- Despliegue: compatible con transformers, text-embeddings-inference (listado en los tags), vLLM (para embeddings) y ONNX Runtime; llama.cpp/Ollama no son el objetivo principal al ser un encoder.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en codificación por lotes, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ITLL/mmBERT-4Way-SLERP | 306.939.648 | no disponible | Encoder ModernBERT (merge) | no disponible | Hugging Face |
| msmth/Source-1 | no disponible | no disponible | Encoder mmBERT ajustado | no disponible | Hugging Face |
| marcyano/Groot-1 | no disponible | no disponible | Encoder mmBERT ajustado | no disponible | Hugging Face |
| RedHatAI/wolf-defender-prompt-injection | no disponible | no disponible | Clasificador de prompt injection | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos de origen en la información proporcionada, por lo que la comparación se limita a la procedencia y el tipo de artefacto.

## Limitaciones y advertencias

- Al ser un merge de encoders sin cabezas, no es utilizable directamente para clasificación ni generación; requiere una cabeza o un pipeline de embeddings.
- No hay información publicada sobre licencia, lo que impide confirmar si el uso comercial está permitido; conviene verificar las licencias de los cuatro modelos de origen.
- No se documentan idiomas soportados; el comportamiento multilingüe es una suposición derivada del backbone mmBERT, no un dato verificado.
- El merging puede degradar capacidades específicas de cada modelo de origen respecto a su ajuste original; no hay evaluación publicada que lo cuantifique.
- Riesgo de sesgos heredados de los datasets de los modelos de origen (corpus web, código, datos de moderación), sin auditoría documentada.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de representaciones poco fiables en dominios no cubiertos por los datos de origen.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- Verificar el merge_manifest.json y los hashes antes de usar el checkpoint en entornos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ITLL/mmBERT-4Way-SLERP
- Modelo de origen 1: https://huggingface.co/msmth/Source-1
- Modelo de origen 2: https://huggingface.co/marcyano/Groot-1
- Modelo de origen 3: https://huggingface.co/vllm-sr/Decision-1.0-Kai-0.6B
- Modelo de origen 4: https://huggingface.co/RedHatAI/wolf-defender-prompt-injection
