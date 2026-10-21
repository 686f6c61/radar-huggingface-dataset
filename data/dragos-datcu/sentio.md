# Dragos-Datcu/Sentio

## Resumen

Sentio es un modelo de embeddings multimodales desarrollado por Dragos-Datcu que combina dos torres: WeMM-Embedding-9B, que cubre texto, imagen, vídeo y documentos visuales, y la torre de audio de Qwen2.5-Omni-3B, que aporta la capacidad de "oír". El modelo proyecta audio en el mismo espacio de 4096 dimensiones que usa WeMM, de modo que un clip de audio puede compararse directamente con una frase, una etiqueta, una imagen o un vídeo sin necesidad de reindexar los contenidos ya vectorizados con la torre original.

El problema que resuelve es la ausencia de audio en uno de los modelos de embeddings abiertos más fuertes de su categoría. La receta sigue el enfoque de Tianmu-Emb-Uni y de Wianmu-5B (congelar las torres y entrenar solo el conector), con dos añadidos: un LoRA previo sobre la torre de 9B para mejorar la recuperación de momentos de vídeo, y un LoRA sobre el encoder de audio que se entrena junto al conector.

El resultado es un modelo de 10,20B parámetros totales de los que solo se entrenan 152M (1,5 %). Se publica con licencia Apache-2.0 y pipeline de `feature-extraction`, por lo que su uso previsto es la extracción de representaciones y la recuperación, no la generación de texto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos torres: WeMM-Embedding-9B (texto, imagen, vídeo y documento) + torre de audio de Qwen2.5-Omni-3B (encoder de 638M), unidas por un conector MLP de 3 capas y una fusión de 4 adaptadores con compuerta |
| Parametros totales | 10,20B (10.200M) |
| Parametros activos | No aplica: no es un modelo MoE. Parámetros entrenados: 152M (1,5 %) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible: no se publican variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la información del repositorio; los datasets de audio empleados son mayoritariamente en inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible: el tamaño del repositorio figura como 0.0 GB y la model card no detalla safetensors, bin ni shards |

Datos adicionales: dimensión de embedding de 4096, normalización L2 a la salida; entrada de audio en features mel de estilo Whisper de 128 bins y hasta 30 segundos; pipeline declarado `feature-extraction`.

## Arquitectura y entrenamiento

La ruta de audio parte de la forma de onda, se convierte en features mel de 128 bins (hasta 30 s), pasa por la torre de audio de Qwen2.5-Omni-3B (638M) con un LoRA de r=16 y α=32 aplicado a las proyecciones q/k/v/out y a las dos capas MLP de cada bloque del encoder (11,8M), se agrega con masked-mean pooling sobre frames (2048-d) y entra en un conector MLP de 3 capas (2048 → 4096 → 8192 → 4096, con LayerNorm y GELU, 75,5M). Después se aplica una fusión de adaptadores, una proyección con RMSNorm y una normalización L2 que produce el embedding final de 4096 dimensiones. Todo lo que no es audio atraviesa WeMM-Embedding-9B con un LoRA de la etapa 1.

El entrenamiento tiene dos etapas con tres piezas entrenables. En la etapa 1, la torre WeMM-9B recibe un LoRA (r=16, α=32, 43,3M) entrenado con InfoNCE sobre pares de recuperación de momentos de vídeo, mezclado con una repetición de pares de documento visual, vídeo e imagen para no degradar lo que ya funcionaba. En la etapa 2, con la torre congelada (LoRA incluido), se entrena el LoRA de la torre de audio junto con la cabeza de audio: conector, fusión de adaptadores, proyección y prototipos (96,8M, de los cuales 75,5M son el conector).

La pérdida principal es un InfoNCE simétrico in-batch entre embeddings de audio y de destino, con temperatura 0,07. Se suman la pérdida de prototipos de Tianmu (término contrastivo sobre asignaciones de prototipos con peso 0,03, KL simétrica entre asignaciones de audio y destino con 0,01, y término de balance con 0,005) y un bono de entropía de la compuerta (0,01). Los datos son 449.000 pares audio-destino sobre 37.000 destinos distintos, extraídos de siete datasets públicos: NSynth, SpeechCommands, FSD50K, RAVDESS, Clotho, Flickr8k Audio y AVE, muestreados en proporción natural. En los datasets de etiquetas, los batches se construyen de forma que cada etiqueta aparezca como máximo una vez.

La fusión de adaptadores resuelve que un mismo clip pueda compararse con objetos de naturaleza distinta: cuatro adaptadores bottleneck (texto, audio, vídeo y etiqueta) de 4,19M parámetros cada uno, más una compuerta de 4,20M que mira el vector de audio y mezcla las cuatro salidas con pesos soft. Los 64 prototipos aprendidos en el espacio compartido se usan solo en la pérdida, no en inferencia.

## Capacidades

- Extracción de embeddings de audio de hasta 30 segundos en un espacio de 4096 dimensiones, normalizado en L2.
- Recuperación audio-texto: consultar un archivo de audio con una descripción textual y viceversa.
- Recuperación audio-audio, audio-imagen y audio-vídeo, al compartir espacio con la torre WeMM.
- Recuperación audio-etiqueta y clasificación zero-shot comparando el embedding del clip con los embeddings de los nombres de clase.
- Recuperación de momentos de vídeo (video moment retrieval), reforzada en la etapa 1: V-MRET sube de 58,46 a 61,53.
- Conservación de las capacidades de embedding de texto, imagen, vídeo y documento de WeMM-Embedding-9B, con el LoRA de la etapa 1 aplicado.
- Compatibilidad con índices ya construidos con WeMM-9B: el espacio de 4096 dimensiones se mantiene, por lo que no hace falta reindexar.
- Capacidades generativas: no disponibles. El modelo no genera texto, no soporta tool calling, no implementa agentes ni modo de razonamiento.
- Cobertura multilingüe: no disponible en la información publicada.

## Casos de uso

- Búsqueda semántica en archivos de audio: indexar podcasts, locuciones o grabaciones con el embedding de 4096 dimensiones y permitir consultas en lenguaje natural, comparando el vector de la consulta con los vectores de los clips mediante similitud coseno.
- Clasificación zero-shot de eventos sonoros: para una taxonomía nueva, se calcula el embedding de cada nombre de etiqueta y se asigna al clip la etiqueta más cercana, sin reentrenar. El modelo se entrenó con FSD50K y SpeechCommands, así que el escenario está alineado con los datos.
- Organización de librerías de samples musicales: agrupar y buscar por instrumento o timbre, aprovechando NSynth, que aporta el volumen principal de cada época de entrenamiento.
- Recuperación de momentos concretos en vídeo: localizar el instante de un vídeo que corresponde a una descripción, con la mejora medida en V-MRET (58,46 → 61,53) y el respaldo de los embeddings de vídeo de WeMM.
- Accesibilidad y descripción hablada: emparejar una descripción hablada con la imagen que describe (Flickr8k Audio), útil para alinear narraciones con material visual.
- Deduplicación y clustering de catálogos de audio: detectar clips casi idénticos o agrupar por similitud semántica sin etiquetas, usando distancia coseno sobre los embeddings.
- Moderación de contenido sonoro en plataformas UGC: clasificar clips cortos contra un conjunto de etiquetas de política y derivar los casos dudosos a revisión humana.
- Migración incremental de un pipeline multimodal: si ya existe un índice de texto e imagen con WeMM-9B, se añade la pata de audio sin reconstruir el índice, al compartir el mismo espacio de embedding.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible corresponden a la etapa 1 (torre visual) y comparan WeMM-Embedding-9B con la torre de Sentio tras el LoRA de recuperación de momentos de vídeo.

| Benchmark | WeMM-Embedding-9B | Sentio (etapa 1) | Delta |
|---|---|---|---|
| MMEB-V2 | 80,58 | 80,68 | +0,10 |
| V-MRET | 58,46 | 61,53 | +3,07 |

No se han publicado resultados de benchmarks de audio (recuperación audio-texto, clasificación en FSD50K, Clotho o AVE) en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: unos 20,4 GB solo para pesos (10,20B), más overhead de activaciones y del encoder de audio; en la práctica, 24-32 GB.
- VRAM estimada en int8: alrededor de 10,2 GB de pesos, con un total realista de 12-16 GB. En int4: unos 5,1 GB de pesos, 8-10 GB en total. Son estimaciones de cálculo, no configuraciones publicadas por el autor.
- GPU de datacenter recomendadas: A100 40 GB u 80 GB, H100 80 GB, L40S 48 GB. Con 24 GB (RTX 3090, RTX 4090) el modelo en fp16 queda muy justo; conviene cuantizar o ejecutar la torre de audio por separado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 de 24 GB con cuantización, o en fp16 si se reduce el lote y se limita la longitud de audio.
- Opciones de despliegue: no hay soporte oficial publicado para vLLM, TGI, llama.cpp ni Ollama; al tratarse de un modelo de embeddings con código propio (conector, fusión de adaptadores, prototipos) requiere cargarlo con Transformers y el código del repositorio. No se publican archivos GGUF.
- Latencia y throughput: no disponibles. Como referencia estructural, el coste por clip está dominado por la torre de 9,4B congelada, no por el encoder de audio de 638M.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Benchmarks publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sentio | 10,20B (152M entrenados) | Audio, texto, imagen, vídeo, documento | No disponible | MMEB-V2 80,68; V-MRET 61,53 | Apache-2.0 | Repositorio HF con 0 descargas y 0 likes; tamaño 0.0 GB |
| WeMM-Embedding-9B | 9,4B (torre) | Texto, imagen, vídeo, documento | No disponible | MMEB-V2 80,58; V-MRET 58,46 | No disponible en la información | Modelo base en HF |
| Qwen2.5-Omni-3B | 3B (torre de audio de 638M) | Audio, imagen, vídeo, texto; modelo generativo | No disponible | No disponible en la información | No disponible en la información | Modelo base en HF |
| Wianmu-5B | Miembro de 4B de la familia, según la model card | Audio, texto, imagen, vídeo | No disponible | No disponible | No disponible | Repositorio HF |

La comparación relevante es frente a WeMM-Embedding-9B: Sentio añade audio con un coste de 152M parámetros entrenados y una mejora medida de +3,07 en V-MRET, manteniendo el espacio de embedding. Frente a Qwen2.5-Omni-3B, la diferencia es de propósito: Omni es un modelo generativo omnicanal, mientras que Sentio es exclusivamente un extractor de embeddings.

## Limitaciones y advertencias

- El tamaño del repositorio figura como 0.0 GB y no se detalla el formato de pesos: conviene verificar que los pesos estén realmente publicados antes de planificar una integración.
- El modelo no genera texto ni mantiene conversaciones: no sirve para tareas de generación, tool calling ni agentes.
- La entrada de audio está limitada a clips de hasta 30 segundos (features mel hasta 30 s); para audio más largo hay que trocear y agregar.
- Los idiomas soportados no se documentan y los datasets de entrenamiento son mayoritariamente en inglés (SpeechCommands, FSD50K, Clotho, Flickr8k Audio, RAVDESS), por lo que el rendimiento fuera del inglés es incierto.
- No se publican métricas de audio: la evaluación disponible se limita a MMEB-V2 y V-MRET de la etapa visual, lo que impide comparar la calidad real de los embeddings de audio.
- Sesgos previsibles por composición del dataset: RAVDESS contiene emociones actuadas y un número reducido de hablantes; NSynth son samples sintéticos de instrumentos; SpeechCommands cubre un vocabulario cerrado de palabras.
- La construcción de batches por etiqueta única durante el entrenamiento evita falsos negativos, pero no garantiza el mismo comportamiento en usos con clases muy granulares o solapadas.
- La torre de 9,4B está congelada: los errores de representación de WeMM en texto, imagen o vídeo se propagan sin corrección más allá del LoRA de la etapa 1.
- Coste de indexación: un vector de 4096 dimensiones en fp32 ocupa unos 16 KB, lo que encarece los índices a gran escala frente a embeddings de 768 o 1024 dimensiones.
- La licencia del modelo es Apache-2.0, pero el uso comercial requiere verificar también las licencias de los modelos base (WeMM-Embedding-9B y Qwen2.5-Omni-3B) y de los datasets de entrenamiento.
- Con 0 descargas y 0 likes en el momento de la consulta, no existe validación por parte de la comunidad ni informes independientes de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dragos-Datcu/Sentio
- Modelo base principal: https://huggingface.co/tencent/WeMM-Embedding-9B
- Modelo base de la torre de audio: https://huggingface.co/Qwen/Qwen2.5-Omni-3B
- Trabajo previo citado con la misma receta: https://huggingface.co/eduardo-terres2/Wianmu-5B
- La búsqueda web realizada no devolvió resultados relacionados con este modelo: los enlaces obtenidos corresponden a Dragos, Inc. (empresa de ciberseguridad OT) y a Drago Paris, sin relación con el autor ni con el modelo.
