# MTSAIR/RuModernBertBase

## Resumen

RuModernBertBase es un modelo de lenguaje basado en la arquitectura ModernBERT, publicado por MTSAIR en Hugging Face bajo licencia Apache 2.0. Con 149.014.272 parámetros (aproximadamente 149 millones), se posiciona como un encoder de tamaño medio orientado a tareas de comprensión del lenguaje en inglés y ruso, no como un modelo generativo de gran escala.

La relevancia de este modelo radica en su adopción de ModernBERT, una arquitectura de encoder que incorpora mejoras sobre el Transformer clásico como atención con rotación posicional (RoPE), capas de atención lineal parcial y un contexto extendido respecto a los BERT tradicionales. Al estar entrenado específicamente para ruso e inglés, cubre un nicho bilingüe poco frecuente en la familia ModernBERT.

No obstante, la información pública disponible es muy limitada: la model card no incluye detalles sobre datos de entrenamiento, benchmarks ni instrucciones de uso, y el repositorio no registra descargas ni interacciones. Esto obliga a tratar muchos apartados de esta ficha como "no disponible" y a recomendar cautela antes de su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder Transformer) |
| Parametros totales | 149.014.272 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posible via herramientas externas) |
| Idiomas soportados | en, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ModernBERT, una evolución del encoder Transformer de BERT que sustituye la codificación posicional absoluta por embeddings rotatorios (RoPE), incorpora normalización previa a las capas y alterna capas de atención global con capas de atención lineal local para reducir el coste computacional en secuencias largas. También usa activaciones GeGLU y elimina el sesgo en las capas lineales, lo que favorece la eficiencia en hardware moderno.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset bilingüe ni si se aplicaron técnicas de ajuste como MLM, DPO o RLHF. La model card únicamente declara los idiomas (inglés y ruso) y la licencia, sin detallar hiperparámetros, duración del entrenamiento ni procedencia de los datos.

## Capacidades

- Codificación de texto para tareas de comprensión del lenguaje natural (clasificación, extracción de características, similitud semántica).
- Generación de embeddings contextuales bilingües en inglés y ruso.
- Base para fine-tuning en tareas supervisadas como análisis de sentimiento, NER o clasificación de documentos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo generativo ni instruct).
- Capacidades multilingües limitadas a inglés y ruso.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación de documentos bilingües en inglés y ruso: el modelo puede afinarse como cabecera de clasificación sobre los embeddings del token [CLS] para categorizar tickets, correos o artículos en ambos idiomas.
- Extracción de entidades nombradas (NER): sirve como encoder base para un modelo token-classification afinado en dominios como noticias o documentación técnica en ruso e inglés.
- Búsqueda semántica y recuperación de información: los embeddings generados permiten construir índices vectoriales para motores de búsqueda interna con corpus mixtos en los dos idiomas soportados.
- Análisis de sentimiento en atención al cliente: un fine-tuning ligero sobre reseñas o conversaciones permite monitorizar la satisfacción en canales rusoparlantes e angloparlantes.
- Deduplicación y agrupamiento de textos: la similitud entre embeddings facilita la detección de documentos duplicados o casi duplicados en pipelines de datos.
- Filtrado y moderación de contenido: como clasificador afinado, puede etiquetar textos tóxicos o no deseados antes de pasarlos a modelos generativos de mayor coste.
- Componente de reranking en pipelines RAG: combinado con un retriever, puede reordenar candidatos por relevancia semántica en sistemas bilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 0,6 GB (149 M de parámetros × 4 bytes).
- VRAM estimada en FP16/BF16: aproximadamente 0,3 GB; en INT8, unos 0,15 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 sobran para este tamaño.
- Cabe holgadamente en GPU de consumo, e incluso puede ejecutarse en CPU con latencias aceptables para lotes pequeños.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, TGI y vLLM para servir embeddings; llama.cpp y Ollama no están orientados a encoders de este tipo.
- Latencia y throughput estimados: no disponibles; al ser un encoder de 149 M de parámetros, se espera un throughput alto en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RuModernBertBase (MTSAIR) | 149 M | no disponible | en, ru | Apache 2.0 | Hugging Face |
| BERT-base-multilingual-cased | 178 M | 512 | 104 idiomas | Apache 2.0 | Hugging Face |
| RuBERT-base (DeepPavlov) | ~178 M | 512 | ru | Apache 2.0 | Hugging Face |
| ModernBERT-base (Answer.AI) | 149 M | 8192 | en (principalmente) | Apache 2.0 | Hugging Face |

RuModernBertBase se diferencia de BERT-base-multilingual por su enfoque bilingüe específico y su arquitectura ModernBERT, y de RuBERT por incluir inglés además de ruso. Frente a ModernBERT-base original, la principal diferencia es la cobertura del ruso, aunque no hay datos públicos que permitan comparar su rendimiento real.

## Limitaciones y advertencias

- No es un modelo generativo: no puede usarse para completar texto, mantener conversaciones ni invocar herramientas sin un fine-tuning específico.
- Ausencia total de benchmarks publicados: no hay evidencia objetiva de su calidad frente a alternativas consolidadas como RuBERT o BERT multilingüe.
- Model card prácticamente vacía: se desconoce el corpus de entrenamiento, los hiperparámetros y las posibles fuentes de sesgo.
- Riesgo de sesgos desconocidos en los datos de entrenamiento, especialmente en el dominio del ruso, donde la disponibilidad de corpus es más limitada.
- Longitud de contexto no documentada; conviene verificarla empíricamente antes de usarlo con secuencias largas.
- Repositorio sin descargas ni validación comunitaria: mayor probabilidad de errores no detectados en los pesos o en la configuración.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación dificulta evaluar su idoneidad en producción.
- No apto para tareas de razonamiento complejo ni para generación de código.

## Enlaces

- Hugging Face: https://huggingface.co/MTSAIR/RuModernBertBase
- Paper de ModernBERT (referencia de arquitectura): https://arxiv.org/abs/2412.13663
- Repositorio ModernBERT (Answer.AI): https://github.com/AnswerDotAI/ModernBERT
