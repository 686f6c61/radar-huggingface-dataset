# edgefloor/meta-encoder-mlx-4bit

## Resumen

edgefloor/meta-encoder-mlx-4bit es una conversión a formato MLX del modelo facebook/meta-encoder, un encoder multimodal de aproximadamente 29.776 millones de parámetros que no genera texto, sino que puntúa candidatos frente a una tarea descrita en lenguaje natural. El autor, edgefloor, no reentrena el modelo: cuantiza a 4 bits las capas lineales de la torre de lenguaje, los token embeddings y la language head, manteniendo en BF16 la torre de visión, el adaptador, la proyección y las capas de normalización. El resultado ocupa 19,51 GB (18,17 GiB) en safetensors y se ejecuta mediante MLX y MLX-VLM sobre Apple silicon.

La relevancia de esta ficha es doble. Por un lado, permite ejecutar localmente un encoder de 30B en un Mac con memoria unificada suficiente, algo inviable con los pesos BF16 originales. Por otro, documenta con transparencia el alcance real de la validación: se comprobó la carga estricta del checkpoint, la finitud y norma unitaria de los embeddings en texto, imagen y vídeo de dos fotogramas, y una similitud coseno de 0,972983 frente a una referencia BF16 en streaming para una única entrada de texto. No hay, en cambio, paridad medida con la implementación oficial de Transformers ni benchmarks estándar publicados.

La arquitectura subyacente corresponde a Muse Glimmer según la implementación de MLX-VLM, con salida de embeddings L2-normalizados en float32 de 6.656 dimensiones y puntuación mediante producto interno. El repo no declara idiomas soportados ni longitud de contexto, no acumula descargas ni likes y se publicó con licencia Apache-2.0, sujeta además a la política de uso del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder multimodal (arquitectura Muse Glimmer en MLX-VLM): torre de visión más adaptador y proyección, y torre de lenguaje con language head para pooling |
| Parámetros totales | 29.776.626.688 (según safetensors) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit affine con group size 64 (capas lineales de lenguaje, token embeddings y language head); BF16 en torre de visión, adaptador de visión, proyección de visión y pesos de normalización; el conversor también genera una variante de 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0, sujeta a la política de uso del modelo base (se preservan LICENSE, NOTICE y USAGE_POLICY.md) |
| Formato de pesos | safetensors en formato MLX; repo de 19,5 GB (18,17 GiB de pesos) |
| Dimensión del embedding | 6.656, float32 y L2-normalizado |
| Modelo base | facebook/meta-encoder (revisión fuente 3d0df704aa5bf66d9c49da1393181f33e893e5f7) |
| Pipeline | feature-extraction |
| Librería | mlx (con MLX-VLM y el processor original de Transformers para el preprocesado) |
| Plataforma de ejecución | Apple silicon (MLX); el wrapper PyTorch original no puede cargar directamente estos pesos cuantizados |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de una cuantización con envoltorio de inferencia. La conversión parte del checkpoint facebook/meta-encoder en BF16 y aplica cuantización affine de 4 bits con tamaño de grupo 64 exclusivamente a las capas lineales del lado de lenguaje, los token embeddings y la language head. La torre de visión, el adaptador de visión, la proyección de visión y los pesos de normalización se conservan en BF16, de modo que la parte visual no pierde precisión respecto al original. El modelo base se describe como un encoder multimodal de 30B que ordena candidatos frente a una tarea en lenguaje natural.

El runner incluido utiliza el processor original de Transformers y la construcción de prompt del wrapper de origen: hace pooling del último hidden state del último token, evita calcular logits de vocabulario y redondea las frecuencias rotatorias a BF16 igual que el wrapper fuente. Cada ítem se codifica individualmente para impedir que el padding entre en las máscaras de atención del decoder de MLX-VLM, y la puntuación final es el producto interno de vectores ya normalizados. El conversor valida los nombres y las formas de los tensores contra la arquitectura Muse Glimmer de MLX-VLM y escribe incrementalmente las variantes de 4 y 8 bits. No se aplicó ningún tipo de ajuste fino, RLHF ni DPO: es una conversión de almacenamiento de pesos más un wrapper de inferencia.

## Capacidades

- Extracción de características: produce embeddings de 6.656 dimensiones, float32 y L2-normalizados, invocables mediante `model.encode([...])`.
- Ranking de candidatos: `model.match(tarea, candidatos)` ordena una lista de opciones frente a una instrucción en lenguaje natural.
- Puntuación directa: `model.score(tarea, embeddings)` devuelve productos internos entre la representación de la tarea y la de cada candidato.
- Entrada multimodal: acepta texto plano, imágenes PIL y diccionarios con las claves `text`, `instruction`, `image`, `images` o `video`.
- Vídeo ligero: la clave `video` admite una lista de fotogramas PIL previamente muestreados a 2 FPS, con el mismo criterio que el wrapper original.
- Emparejamiento imagen-texto: permite comprobar la correspondencia entre una imagen y varias descripciones alternativas.
- Ejecución local en Apple silicon mediante MLX, con procesamiento de entradas delegado a PyTorch/Transformers.
- No se documenta generación de texto libre, decodificación autoregresiva, tool calling, function calling, uso como agente, modo de razonamiento explícito ni soporte de audio.
- No se declara cobertura idiomática verificada.

## Casos de uso

- Clasificación zero-shot de imágenes: se construye una lista de etiquetas candidatas y se usa `match` con la imagen como contexto, aprovechando que el modelo puntúa cada etiqueta frente a la misma representación visual. Es adecuado porque la torre de visión permanece en BF16, sin degradación por cuantización.
- Búsqueda semántica multimodal: los embeddings de 6.656 dimensiones permiten indexar texto, imágenes y vídeo en un mismo espacio vectorial y recuperar por similitud coseno. La normalización L2 de la salida hace que el producto interno equivalga a la similitud coseno, sin post-procesado adicional.
- Deduplicación y agrupación de catálogos: se codifican descripciones, fichas de producto o miniaturas y se agrupan por cercanía en el espacio de embeddings para detectar duplicados o construir clusters temáticos.
- Filtrado y moderación de contenido: se puntúa una imagen o un texto contra candidatos del tipo "contenido permitido" frente a "contenido restringido" y se establece un umbral sobre la puntuación. El coste por evaluación es una codificación por candidato, lineal y predecible.
- Recomendación basada en descripciones: dado un enunciado de necesidad del usuario y un conjunto de descripciones de artículos, el modelo ordena los artículos por correspondencia, lo que sirve como etapa de reranking sobre un recuperador previo.
- Evaluación de pipelines VLM: al ser un encoder congelado y determinista, sirve para medir la alineación imagen-texto de otros sistemas, comparando si las representaciones de un modelo generativo se acercan a las de este encoder.
- Prototipado local en portátiles Apple silicon: investigadores que necesitan experimentar con un encoder multimodal de 30B sin acceso a GPUs pueden ejecutarlo con MLX tras descargar 18,17 GiB de pesos.
- Análisis de vídeo de baja frecuencia: con fotogramas pre-muestreados a 2 FPS se puede etiquetar o comparar contenido de clips cortos contra descripciones, útil para triaje previo a un análisis más costoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente recoge comprobaciones de humo locales, que se reproducen a continuación tal cual:

| Comprobación | Resultado declarado |
|---|---|
| Carga del checkpoint con validación estricta de pesos de MLX-VLM | Correcta |
| Humo de texto, imagen y vídeo de dos fotogramas | Embeddings finitos y de longitud unitaria |
| Selección del primer candidato esperado | 4 de 4 comprobaciones simples |
| Similitud coseno frente a referencia BF16 MLX en streaming (una entrada de texto) | 0,972983 |
| Paridad con la implementación oficial de Transformers | No medida |
| Equivalencia de tensores cuantizados con `mlx.core.quantize` | Coincidencia exacta verificada en una arquitectura pequeña |
| Acuerdo de una arquitectura pequeña sin cuantizar frente a Transformers | Superior a 0,999 en hidden states de texto y features de imagen |

Los propios autores advierten que la cifra de similitud coseno comprueba la deriva de cuantización para una entrada concreta y no constituye un benchmark. Los prompts, puntuaciones, tiempos y mediciones de memoria asociados están en `validation.json`, pero sus valores no se incluyen en la información disponible.

## Requisitos de hardware

- Plataforma: MLX, por lo que la inferencia requiere Apple silicon con memoria unificada. No se documenta soporte CUDA, ROCm ni CPU genérica para este repo.
- Peso en disco y en memoria: 18,17 GiB de pesos cuantizados a 4 bits, dentro de un repo de 19,5 GB.
- VRAM o memoria unificada estimada para la variante de 4 bits: en torno a 20-24 GB contando pesos, activaciones y sobrecarga del runtime. Se recomienda un equipo con 32 GB de memoria unificada como mínimo; 64 GB deja margen para lotes mayores y para la torre de visión en BF16. Es una estimación a partir del tamaño de los pesos, no un dato medido en la model card.
- Variante de 8 bits: el conversor la genera de forma incremental; al duplicar aproximadamente el coste de almacenamiento, requiere del orden de 48-64 GB de memoria unificada. Estimación, no dato publicado.
- GPU dedicadas: no aplica a este repositorio; las referencias habituales como A100, H100 o RTX 4090 no pueden ejecutar pesos MLX directamente.
- Consumer GPU: no es posible con este repo tal cual. En GPUs NVIDIA habría que usar los pesos BF16 del modelo base o generar una cuantización en otro formato.
- Opciones de despliegue: el runner incluido `metaencoder_mlx.py`, la librería MLX y MLX-VLM. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y el pipeline declarado es feature-extraction, no generación de texto.
- Latencia y throughput: no disponibles. `validation.json` contiene mediciones de tiempos y memoria, pero sus valores no se han facilitado.

## Comparativa con modelos similares

No se dispone de datos verificados de rendimiento frente a modelos de terceros, por lo que la comparación se limita a las variantes derivadas del mismo modelo base, con los datos aportados en la model card.

| Modelo | Parámetros | Cuantización | Peso aproximado | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| edgefloor/meta-encoder-mlx-4bit | 29,78 B | 4-bit affine, group size 64 | 18,17 GiB | safetensors MLX | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Variante 8-bit del mismo conversor | 29,78 B | 8-bit | No disponible (aproximadamente el doble) | safetensors MLX | Apache-2.0 | Generada por `convert_metaencoder.py` |
| facebook/meta-encoder (base) | 29,78 B | BF16 | No disponible | Pesos PyTorch/Transformers | Apache-2.0 | Modelo de referencia en HuggingFace |
| Otros encoders multimodales de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre alternativas comparables, de modo que no se puede establecer una comparación de benchmarks con terceros.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no soporta tool calling y no está pensado para tareas de agente o razonamiento multi-paso.
- Paridad no verificada: no se midió la equivalencia completa con la implementación oficial de Transformers. El único punto de control es una similitud coseno de 0,972983 en una entrada de texto, lo que indica deriva de cuantización no nula.
- Sin benchmarks estándar: no hay resultados publicados de MMLU, HumanEval, GSM8K ni métricas de retrieval, por lo que no se puede estimar la pérdida de calidad frente al modelo base en tareas reales.
- Idiomas no declarados: no hay información sobre cobertura multilingüe ni sobre el comportamiento en castellano.
- Longitud de contexto desconocida: no se especifica la ventana máxima, lo que complica dimensionar pipelines con documentos largos.
- Coste por candidato: cada ítem se codifica por separado para evitar padding en las máscaras de atención, de modo que el tiempo y la memoria de una consulta escalan linealmente con el número de candidatos.
- Restricción de plataforma: los pesos son MLX y solo se ejecutan en Apple silicon con el wrapper incluido. El wrapper PyTorch original no puede cargar estos tensores cuantizados.
- Vídeo limitado: la entrada de vídeo es una lista de fotogramas ya muestreados a 2 FPS, sin decodificación ni muestreo automático.
- Licencia: Apache-2.0, pero la model card indica que el uso sigue sujeto a la política del modelo base; conviene revisar `USAGE_POLICY.md` y `NOTICE` antes de un despliegue comercial.
- Riesgo de ordenación incorrecta: en tareas ambiguas el ranking por producto interno puede elegir un candidato inadecuado; el propio autor reporta 4 aciertos en 4 comprobaciones simples, una muestra demasiado pequeña para extrapolar.
- Señales de madurez bajas: 0 descargas y 0 likes, con fechas de creación y actualización del 9 de octubre de 2026 y una única revisión de pesos convertida.
- Huella de almacenamiento: 19,5 GB de repositorio, lo que penaliza despliegues con restricciones de disco o de ancho de banda.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/edgefloor/meta-encoder-mlx-4bit
- Modelo base: https://huggingface.co/facebook/meta-encoder
- Revisión fuente convertida: https://huggingface.co/facebook/meta-encoder/tree/3d0df704aa5bf66d9c49da1393181f33e893e5f7
- Documentación de MLX: https://github.com/ml-explore/mlx
- MLX-VLM: https://github.com/Blaizzy/mlx-vlm
- Ficheros internos del repo citados en la model card: `metaencoder_mlx.py`, `convert_metaencoder.py`, `requirements.txt`, `validation.json`, `conversion.json`, `upstream_metaencoder.py`, `LICENSE`, `NOTICE`, `USAGE_POLICY.md`
- Búsqueda web: sin resultados relevantes sobre el modelo ni sobre benchmarks comparables
