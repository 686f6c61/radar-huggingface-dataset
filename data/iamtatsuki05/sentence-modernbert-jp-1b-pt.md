# iamtatsuki05/Sentence-ModernBERT-JP-1B-PT

## Resumen

Sentence-ModernBERT-JP-1B-PT es un modelo de embeddings de frases para japones desarrollado por iamtatsuki05 dentro de la familia MIREI. Se construye envolviendo el modelo base ModernBERT-JP-1B-PT-stage2 mediante un entrenamiento contrastivo debilmente supervisado sobre el dataset cl-nagoya/ruri-dataset-v2-pt, y produce vectores de 1.792 dimensiones obtenidos por mean pooling. Su proposito es servir como encoder de recuperacion y similitud semantica en japones, tarea en la que los modelos densos especializados suelen superar a los embeddings genericos multilingues.

El modelo emplea la arquitectura ModernBERT, un transformer encoder moderno con codificacion posicional RoPE, atencion con soporte para FlashAttention 2 y una ventana de contexto de hasta 8.192 tokens, muy superior a la de los encoders BERT clasicos limitados a 512. Con 1.301 millones de parametros totales (1.120 millones sin contar el embedding), se situa en la gama de encoders de gran tamano para una sola lengua, lo que permite representar documentos largos sin truncamiento agresivo.

Es relevante ahora porque la mayoria de los modelos de embeddings de alta calidad estan optimizados para ingles o son multilingues con rendimiento desigual en japones. Este modelo ofrece una alternativa nativa en japones con licencia MIT, compatible con sentence-transformers y con text-embeddings-inference, lo que facilita su despliegue en pipelines de RAG y busqueda semantica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parametros totales | 1.301.108.480 (1.304M segun model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension del embedding | 1.792 (mean pooling) |
| Tokenizer | SentencePiece, vocabulario de 102.400 |
| Codificacion posicional | RoPE |
| Metrica de similitud | coseno |
| Parametros sin embedding | 1.120M |

## Arquitectura y entrenamiento

La arquitectura es ModernBERT, un encoder transformer con mejoras sobre BERT clasico: RoPE en lugar de embeddings posicionales absolutos, atencion con soporte para FlashAttention 2 y contexto extendido hasta 8.192 tokens. El modelo parte de iamtatsuki05/ModernBERT-JP-1B-PT-stage2 y se convierte en encoder de frases mediante entrenamiento contrastivo debilmente supervisado sobre cl-nagoya/ruri-dataset-v2-pt, usando hasta dos millones de pares por subconjunto del dataset. El resultado se agrega con mean pooling y se normaliza para obtener embeddings de 1.792 dimensiones comparables por similitud coseno.

El autor enmarca el modelo en la familia MIREI, que comparte la misma receta de entrenamiento debilmente supervisado entre arquitecturas encoder y decoder (ModernBERT, Llama y Sarashina-Bi). Segun la cita del autor, el trabajo analiza el rendimiento de embeddings de frases entre arquitecturas encoder y decoder bajo condiciones identicas, presentado en NLP2026. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO, algo poco habitual en encoders de recuperacion.

## Capacidades

- Generacion de embeddings de frases en japones de 1.792 dimensiones, normalizados y comparables por similitud coseno.
- Recuperacion densa (dense retrieval) de documentos y pasajes en japones.
- Similitud semantica entre frases y busqueda semantica.
- Feature extraction: uso del encoder subyacente para tareas de representacion.
- Soporte de secuencias largas de hasta 8.192 tokens, adecuado para documentos extensos.
- Compatible con text-embeddings-inference y con endpoints compatibles.
- No soporta tool calling, agentes, vision ni audio: es un encoder de embeddings, no un modelo generativo.
- Capacidad multilingue limitada al japones.

## Casos de uso

- Recuperacion aumentada por generacion (RAG) en japones: indexar una base documental con los embeddings del modelo y recuperar los pasajes mas relevantes para cada consulta antes de pasarlos a un LLM generativo. El contexto de 8.192 tokens permite indexar fragmentos largos sin truncar.
- Busqueda semantica en sitios corporativos: sustituir o complementar la busqueda por palabras clave con busqueda vectorial sobre documentacion interna, manuales o bases de conocimiento en japones.
- Sistemas de preguntas y respuestas sobre documentacion legal o tecnica: el modelo permite emparejar preguntas con secciones concretas de contratos o especificaciones extensas gracias a su ventana de contexto.
- Deduplicacion y agrupacion de contenido: calcular similitudes entre articulos, tickets o registros para detectar duplicados o agrupar temas afines en japones.
- Moderacion y clasificacion por similitud: comparar mensajes de usuario contra un conjunto de ejemplos etiquetados para enrutar o clasificar incidencias en atencion al cliente.
- Recomendacion de contenido: generar embeddings de articulos o productos y recomendar items similares a partir de la representacion vectorial.
- Evaluacion de calidad de traduccion o parafrasis: medir la similitud semantica entre una referencia y una hipotesis en japones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 2,6 GB solo para los pesos (1.301M parametros a 2 bytes), mas el overhead de activaciones y del tokenizer; con lotes grandes y secuencias de 8.192 tokens el consumo de activaciones puede crecer de forma significativa.
- GPU recomendadas: A100, H100 o L40S para indexacion a gran escala; RTX 4090 o RTX 3090 para uso en produccion de volumen moderado.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM para inferencia en bfloat16 o float16 con lotes pequenos; en cuantizacion de 8 bits o inferior el margen es mayor, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: sentence-transformers (libreria nativa), text-embeddings-inference, y cualquier runtime compatible con safetensors y transformers; FlashAttention 2 es recomendable para secuencias largas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Dimension embedding | Licencia | Idiomas |
|---|---|---|---|---|---|---|
| Sentence-ModernBERT-JP-1B-PT | ModernBERT | 1.304M | 8.192 | 1.792 | MIT | japones |
| Sentence-Llama-Bi-JP-1B-PT | Llama | 1.224M | no disponible | no disponible | no disponible | japones |
| Sentence-Sarashina-Bi-JP-1B-PT | Llama | 1.224M | no disponible | no disponible | no disponible | japones |

Los tres modelos pertenecen a la misma familia MIREI y comparten la receta de entrenamiento debilmente supervisado sobre cl-nagoya/ruri-dataset-v2-pt, con hasta dos millones de pares por subconjunto, lo que permite comparar arquitecturas encoder frente a decoder bajo condiciones identicas. No se dispone de datos de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en japones; su rendimiento en otros idiomas no esta documentado y previsiblemente sera pobre.
- Es un encoder de embeddings, no un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Riesgo de sesgos heredados de los datos de entrenamiento del modelo base y del dataset ruri-dataset-v2-pt; no se documenta ninguna evaluacion de sesgo.
- El entrenamiento contrastivo debilmente supervisado puede introducir ruido en los pares y degradar la calidad en dominios muy especializados.
- La ventana de 8.192 tokens exige gestionar el coste de atencion en secuencias largas; conviene truncar o dividir documentos cuando no sea necesario el contexto completo.
- No se documentan cuantizaciones oficiales ni resultados de benchmarks; la validacion en el dominio de destino es imprescindible antes de produccion.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base y del dataset de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamtatsuki05/Sentence-ModernBERT-JP-1B-PT
- Modelo base: https://huggingface.co/iamtatsuki05/ModernBERT-JP-1B-PT-stage2
- Dataset de entrenamiento: https://huggingface.co/datasets/cl-nagoya/ruri-dataset-v2-pt
- Coleccion MIREI: https://huggingface.co/collections/iamtatsuki05/mirei
- Repositorio GitHub: https://github.com/iamtatsuki05/MIREI
- Modelo hermano (Llama): https://huggingface.co/iamtatsuki05/Sentence-Llama-Bi-JP-1B-PT
- Modelo hermano (Sarashina): https://huggingface.co/iamtatsuki05/Sentence-Sarashina-Bi-JP-1B-PT
- Licencia MIT: https://opensource.org/license/mit/
