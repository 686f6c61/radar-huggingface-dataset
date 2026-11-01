# buddhist-nlp/mitra-qwen35-2b-embedder-sentence-alignment

## Resumen

`mitra-qwen35-2b-embedder-sentence-alignment` es un modelo de embeddings especializado en la alineación de oraciones entre textos budistas y sus traducciones, desarrollado por el proyecto `buddhist-nlp` (Dharmamitra). Parte del modelo base Qwen3.5-2B y se distribuye como un checkpoint derivado del embedder general `mitra-qwen35-2b-embedder`, pero entrenado específicamente para puntuar la similitud entre una oración origen y su traducción exacta, penalizando los fragmentos que incluyen material adyacente (spans "rellenados" o sobredimensionados).

El modelo resuelve un problema concreto en filología y humanidades digitales: la alineación automática de oraciones a nivel de documento entre lenguas clásicas (sánscrito, tibetano, chino clásico, pali) y lenguas modernas, tarea que en pipelines tipo vecalign requiere un modelo de scoring que distinga con precisión el span exacto de la traducción. Con 1.881.825.088 parámetros y una dimensión de embedding de 2048, se posiciona como una alternativa compacta frente a embedders multilingües genéricos de mayor tamaño.

Su relevancia actual radica en que mejora de forma sustancial las métricas de precisión de span (0.950 frente a 0.766 del embedder general v2) y de alineación documental (link F1 de 0.942 frente a 0.913), manteniendo una licencia Apache 2.0 permisiva y un formato compatible con `transformers` y `safetensors`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-2B) adaptado a feature-extraction; pooling de último token, L2-normalizado, dimensión 2048 |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible explícitamente; el ejemplo de uso trunca a `max_length=512` |
| Tipos de cuantizacion | no disponible (pesos en safetensors, dtype bfloat16 en el ejemplo) |
| Idiomas soportados | sa, bo, zh, pi, en, de, fr, es, it, pt, nl, ja, ko, hi, ru |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre la base Qwen3.5-2B, un transformer decoder-only, mediante preentrenamiento continuado en dominio budista seguido de un SFT de etapa 2. Ambas etapas entrenan el mismo adaptador LoRA (r=32, alpha 64, sobre todas las proyecciones de atención y MLP), que se fusiona en el checkpoint final. El pipeline es `feature-extraction` y el pooling es de último token, con normalización L2 y dimensión de salida 2048.

El entrenamiento consta de dos fases. La primera es una etapa contrastiva de oraciones paralelas: 8.8 millones de pares estrictamente paralelos sobre 27 pares de idiomas (sánscrito, tibetano, chino y pali entre sí y con lenguas modernas), decontaminados contra los conjuntos de evaluación, con InfoNCE simétrico y negativos in-batch únicamente (512 pares por paso), temperatura 0.02, lr 5e-5 y 4000 pasos. La segunda es una etapa de precisión de span: 1500 pasos adicionales sobre secuencias de pares de oraciones consecutivas, donde el positivo de cada consulta es su traducción exacta y los negativos duros son esa misma traducción rellenada con la oración precedente y/o siguiente, tanto en el lado origen como en el destino. Un 20% de las unidades son pares de dos oraciones cuyas mitades sirven como negativos, de modo que el modelo no aprende a preferir simplemente spans más cortos. Los lotes contienen 256 unidades más todos sus negativos duros, con temperatura 0.02 y lr 5e-5.

## Capacidades

- Generación de embeddings de oración para similitud semántica y alineación, con pooling de último token y normalización L2.
- Alineación de oraciones a nivel de span: distingue la traducción exacta de variantes rellenadas con oraciones adyacentes.
- Alineación documental completa (pensada como modelo de scoring en pipelines tipo vecalign).
- Cobertura multilingüe en 15 idiomas: sánscrito, tibetano, chino clásico, pali y lenguas modernas (inglés, alemán, francés, español, italiano, portugués, neerlandés, japonés, coreano, hindi, ruso).
- Soporte de instrucciones en el lado origen mediante el prefijo `<instruct>Please find the semantically most similar text in {target_lang}.\n<query>{texto}`.
- Manejo de escritura nativa tibetana y de sánscrito y pali en IAST.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-step; su función es producir representaciones vectoriales.

## Casos de uso

- Alineación de canon budista multilingüe: el modelo actúa como scorer en un alineador vecalign para emparejar oraciones de un sutra tibetano con su traducción al inglés, usando el prefijo de instrucción en el lado origen y texto crudo en el destino.
- Construcción de corpus paralelos para filología: a partir de ediciones en sánscrito y chino clásico, el modelo permite generar pares de oraciones alineados que sirvan como base para estudios comparativos y para entrenar otros modelos.
- Búsqueda de la traducción exacta de un pasaje: dado un fragmento de pali, se recupera la oración correspondiente en una lengua moderna, aprovechando la etapa de precisión de span que penaliza fragmentos sobredimensionados.
- Control de calidad de traducciones existentes: comparando los embeddings de cada oración origen con los candidatos destino, se detectan desalineaciones o traducciones que cubren spans incorrectos.
- Creación de memorias de traducción especializadas: el modelo alimenta herramientas de traducción asistida para textos budistas, donde la terminología técnica requiere correspondencias oración a oración muy precisas.
- Aumento de datos para modelos de lenguas clásicas: los pares alineados generados pueden usarse para entrenar o evaluar sistemas de traducción automática de sánscrito, tibetano o chino clásico.
- Indexación semántica de bibliotecas digitales budistas: los embeddings de 2048 dimensiones permiten construir índices vectoriales para recuperar pasajes paralelos entre ediciones de distintos idiomas.

## Benchmarks y rendimiento

| Métrica | Este modelo | mitra-qwen35-2b-embedder v2 |
|---|---|---|
| Precisión de span: traducción exacta vence a variantes rellenadas (5.100 ítems, 34 direcciones) | 0.950 | 0.766 |
| Traducción completa vence a spans parciales o demasiado largos | 0.908 | 0.735 |
| Alineación documental, link F1 (vecalign, 18 pares de idiomas, 6 variantes de ruido) | 0.942 | 0.913 |
| Alineación documental, variante más difícil (merges + distractores + drift), link F1 | 0.851 | 0.753 |
| Suite interna rápida R@1: paralelos multilingües / inglés→clásico | 0.857 / 0.954 | 0.838 / 0.954 |
| Suite interna rápida R@1: verso→comentario / pregunta→pasaje | 0.450 / 0.558 | 0.639 / 0.657 |

En la evaluación de alineación documental, la penalización por borrado se elige por modelo mediante validación cruzada. Con este modelo, una penalización fija de aproximadamente 0.26–0.30 (en unidades de coste normalizadas de vecalign) funciona mejor que el valor por defecto basado en percentiles; se recomienda 0.26 para documentos ruidosos.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, aproximadamente 3.8 GB solo para los pesos; en la práctica se recomienda al menos 6–8 GB para acomodar activaciones y lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM; A100 o H100 para lotes grandes y alto throughput; RTX 4090 para despliegue de alta capacidad en una sola tarjeta.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090), siempre que se use bfloat16 o cuantización.
- Opciones de despliegue: `transformers` con `AutoModel` (ejemplo oficial), y potencialmente servidores de embeddings compatibles con la API de HuggingFace (`endpoints_compatible` figura en los tags); no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mitra-qwen35-2b-embedder-sentence-alignment | 1.881.825.088 | no disponible | Alineación de oraciones y spans en dominio budista | apache-2.0 | HuggingFace (`buddhist-nlp`) |
| mitra-qwen35-2b-embedder (v2) | misma base Qwen3.5-2B | no disponible | Embedder general de recuperación en dominio budista | apache-2.0 | HuggingFace (`buddhist-nlp`) |
| Embedders multilingües genéricos (p. ej. familia BGE-M3 o similares) | no disponible en esta ficha | no disponible | Recuperación multilingüe general | varía | HuggingFace |

La comparación directa con embedders multilingües genéricos no está documentada en la información proporcionada; los únicos datos cuantitativos disponibles son frente al embedder general v2 del mismo proyecto, donde este modelo gana en precisión de span y alineación documental pero pierde en recuperación de comentarios y pregunta→pasaje (0.450/0.558 frente a 0.639/0.657).

## Limitaciones y advertencias

- Está especializado en alineación de oraciones; es más débil que el embedder general en coincidencias laxas de largo alcance, como recuperación de comentarios o pregunta→pasaje.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-step.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí riesgo de falsos positivos en la alineación cuando los textos presentan ruido extremo o traducciones no literales.
- La longitud de contexto no está documentada; el ejemplo oficial trunca a 512 tokens, lo que limita el tamaño de los spans procesados.
- El rendimiento depende de una penalización por borrado ajustada manualmente (0.26–0.30 en unidades de vecalign); usar el valor por defecto basado en percentiles degrada los resultados.
- El modelo está entrenado sobre datos budistas; su comportamiento fuera de ese dominio no está evaluado.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda citar el proyecto Dharmamitra.
- El informe técnico está en preparación; no hay paper publicado con la metodología completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/buddhist-nlp/mitra-qwen35-2b-embedder-sentence-alignment
- Embedder general base: https://huggingface.co/buddhist-nlp/mitra-qwen35-2b-embedder
- Proyecto Dharmamitra: https://dharmamitra.org
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
