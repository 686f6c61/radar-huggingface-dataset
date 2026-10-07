# gahabeen/embeddinggemma-2-bf16

## Resumen

gahabeen/embeddinggemma-2-bf16 es una conversión a formato MLX y precisión BF16 del modelo de embeddings google/embeddinggemma-2, publicada el 7 de octubre de 2026, un día después del lanzamiento del modelo original por parte de Google DeepMind. Se trata de un modelo denso de 744.371.512 parámetros (aproximadamente 740M) que no genera texto: su salida son embeddings normalizados de 768 dimensiones, con soporte de truncamiento Matryoshka a 128, 256 o 512 dimensiones. Conserva los encoders de texto, imagen, audio y vídeo del modelo original, de modo que mapea las cuatro modalidades a un espacio vectorial unificado.

La relevancia de esta versión concreta es de despliegue: al estar convertida a MLX permite ejecutar el modelo en Apple Silicon (Macs y dispositivos con chip de la serie M) sin depender de CUDA, con un peso en disco de 1,489 GB en BF16. Frente a la versión en PyTorch, la conversión facilita la inferencia en local y en el dispositivo, un escenario habitual para búsqueda semántica, RAG o indexación multimodal con requisitos de privacidad.

El repositorio está bajo licencia Apache-2.0, heredada del modelo original, e incluye los pesos de todas las modalidades junto con los ficheros de configuración del procesador. Es importante señalar que se trata de una conversión de terceros, no oficial, sin descargas ni valoraciones en el momento de redactar esta ficha, y que el README interno del repositorio se refiere al modelo como mlx-community/embeddinggemma-2-bf16, mientras que la ficha de HuggingFace lo publica bajo el autor gahabeen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura Gemma 4) adaptado a extraccion de embeddings, con encoders multimodales de imagen, audio y video |
| Parametros totales | 744.371.512 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos de coma flotante en bfloat16); el autor advierte de no convertir el modelo a float16 |
| Idiomas soportados | multilingue (lista concreta de idiomas no disponible) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (1,489 GB en decimal) |
| Dimension de embedding | 768, con truncamiento Matryoshka a 128, 256 o 512 |
| Modalidades de entrada | texto, imagen, audio, video y combinaciones (texto+imagen) |

## Arquitectura y entrenamiento

El modelo original, google/embeddinggemma-2, esta construido sobre la arquitectura decoder de Gemma 4 y se utiliza como extractor de representaciones: en lugar de decodificar tokens, produce un vector normalizado de 768 dimensiones por entrada. La variante multimodal incorpora encoders especificos que proyectan imagen, audio y video al mismo espacio de 768 dimensiones que el texto, lo que permite comparar directamente una consulta textual con un fotograma de video o un fragmento de audio mediante similitud coseno. Esta conversion conserva todos esos encoders; los pesos de coma flotante se almacenan integramente en BF16.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens utilizados ni sobre si hubo fases de RLHF o DPO en el modelo original, ya que la model card de esta conversion remite a la del modelo base para esos datos. La ficha de Google DeepMind indica que EmbeddingGemma 2 esta disenado para embeddings multimodales en el dispositivo y que rinde especialmente bien en tareas de codigo, vision y audio. En cuanto al proceso de conversion, se realizo con MLX-VLM en la revision 3d87e884 (rama pc/embeddinggemma-2) y MLX 0.32.3, partiendo de la revision 914f7f89142e33e77833254d9c9b90c3cef7303b del modelo original. El modelo usa prefijos de tarea definidos en config_sentence_transformers.json (por ejemplo, "task: search result | query: ..." para consultas y "title: none | text: ..." para documentos), y el autor recomienda mantener pesos y activaciones sin cuantizar en BF16.

## Capacidades

- Generacion de embeddings de texto de 768 dimensiones, normalizados, aptos para similitud coseno y busqueda semantica.
- Embeddings multimodales: imagen, audio y video se proyectan al mismo espacio vectorial que el texto, lo que habilita recuperacion cruzada entre modalidades.
- Combinacion de modalidades: la conversion valida entradas de texto+imagen en una misma representacion.
- Truncamiento Matryoshka: la salida puede recortarse a 128, 256 o 512 dimensiones y renormalizarse sin reentrenar, a cambio de perdida de calidad.
- Soporte multilingue declarado, sin listado explicito de idiomas en la informacion disponible.
- Tareas de sentence-similarity, feature-extraction, image-feature-extraction, audio-feature-extraction y video-feature-extraction (etiquetas del repositorio).
- Rendimiento destacado en tareas de codigo segun la documentacion de Google DeepMind para el modelo base.
- No es un modelo generativo: no soporta generacion de texto, tool calling, function calling ni razonamiento multi-paso agentico.

## Casos de uso

- Busqueda semantica y RAG en local sobre corpus multilingues: indexar documentos con el prefijo de tarea correspondiente y recuperar pasajes por similitud coseno, aprovechando los 768 dimensiones y el truncamiento a 128 o 256 dimensiones para reducir el tamano del indice.
- Busqueda multimodal en bibliotecas de medios: indexar imagenes, pistas de audio y videos en el mismo espacio vectorial que las consultas de texto, de modo que una consulta escrita localice directamente un fotograma o un fragmento sonoro.
- Deduplicacion y deteccion de near-duplicates: comparar embeddings de articulos, productos o fragmentos musicales para agrupar contenido practicamente identico antes de publicarlo o almacenarlo.
- Clasificacion y enrutado de tickets de soporte: calcular el embedding de cada ticket y asignarlo al cluster o al agente correspondiente mediante similitud con ejemplos etiquetados, sin necesidad de reentrenar un clasificador.
- Motores de recomendacion de contenido: representar usuarios y elementos (articulos, videos, podcasts) en el mismo espacio y ordenar candidatos por distancia, con la ventaja de cubrir varias modalidades con un solo modelo.
- Busqueda de codigo en repositorios internos: segun la documentacion de Google DeepMind, el modelo base rinde bien en tareas de codigo, lo que permite indexar funciones y ficheros y recuperarlos con consultas en lenguaje natural.
- Aplicaciones en el dispositivo con requisitos de privacidad: al ejecutarse con MLX sobre Apple Silicon, los datos no salen del equipo, algo adecuado para notas personales, historiales medicos o documentacion confidencial.
- Analisis exploratorio de corpus: agrupar un conjunto de documentos o imagenes por similitud semantica para descubrir tematicas antes de disenar un etiquetado manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de recuperacion (MTEB u otros) para esta conversion concreta en la informacion disponible. La model card unicamente incluye comprobaciones numericas de conversion frente al checkpoint original en PyTorch FP32:

| Entrada | Similitud coseno minima frente a FP32 | Error absoluto maximo |
|---|---:|---:|
| audio | 0,999947 | 0,001258 |
| image | 0,999954 | 0,001135 |
| text | 0,999937 | 0,001468 |
| text_image | 0,999905 | 0,001864 |
| video | 0,999900 | 0,001688 |

La model card indica que todas las salidas comprobadas eran finitas, estaban normalizadas a norma unitaria y tenian 768 dimensiones, que una prueba de recuperacion textual situo el pasaje sobre Marte por delante del de Venus, y que las comprobaciones cubren seis entradas de texto multilingue y entradas sinteticas de imagen, audio, video de dos fotogramas y texto+imagen. El propio autor aclara que son pruebas de humo numericas, no evaluaciones de calidad de recuperacion tipo MTEB. Como referencia externa, una guia secundaria sobre EmbeddingGemma 2 cita una mejora en MTEB Code de 68,76 a 78,68 para el modelo base; este dato no procede del repositorio analizado y no se ha verificado de forma independiente.

## Requisitos de hardware

- Peso de los parametros: 1,489 GB en BF16 (744.371.512 parametros); el repositorio completo ocupa 1,5 GB.
- VRAM o memoria unificada estimada para inferencia: del orden de 2 a 3 GB contando pesos, activaciones y procesadores multimodales; no se publican cifras oficiales.
- Cabe en GPU de consumo en cuanto a memoria, pero el formato es MLX, por lo que la ejecucion esta pensada para Apple Silicon (chips de la serie M) y no para CUDA. No hay soporte declarado para RTX 4090, A100 o H100 con estos pesos.
- Despliegue: MLX-VLM en la revision 3d87e884 o superior, MLX >= 0.32.3 y transformers >= 5.18.0. El procesador multimodal EmbeddingGemma2Processor requiere una build de desarrollo (5.18.0.dev0); la version estandar de PyPI 5.18.0 no lo expone, aunque el ejemplo solo texto funciona con AutoTokenizer.
- No se documentan opciones para vLLM, TGI, llama.cpp u Ollama con este repositorio; serian necesarias conversiones adicionales no incluidas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de embedding | Modalidades | Formato | Licencia | Notas |
|---|---|---|---:|---|---|---|---|
| gahabeen/embeddinggemma-2-bf16 | 744.371.512 | 768 (Matryoshka 128-512) | texto, imagen, audio, video | MLX safetensors BF16 | apache-2.0 | Conversion de terceros para Apple Silicon; sin benchmarks MTEB publicados |
| google/embeddinggemma-2 | 740M (segun documentacion de Google) | 768 | texto, imagen, audio, video | safetensors (PyTorch) | apache-2.0 | Modelo original de Google DeepMind, publicado el 6 de octubre de 2026; referencia oficial de entrenamiento y evaluacion |
| Variante de 270M de EmbeddingGemma 2 | 270M aproximados (citado por fuentes secundarias) | no disponible | no disponible | no disponible | no disponible | Opcion mas ligera mencionada en guias externas; datos no confirmados en la informacion disponible |
| EmbeddingGemma (version anterior) | no disponible | no disponible | no disponible | no disponible | no disponible | Predecesor citado en los resultados de busqueda; no se dispone de especificaciones verificadas |

## Limitaciones y advertencias

- Conversion no oficial: publicada por el usuario gahabeen, con 0 descargas y 0 likes en el momento de redactar la ficha; no ha pasado por una evaluacion de calidad de recuperacion.
- Discrepancia de nombre: la ficha de HuggingFace figura bajo gahabeen, mientras que el README interno se refiere al modelo como mlx-community/embeddinggemma-2-bf16; conviene verificar el repositorio correcto antes de integrarlo.
- Atado al ecosistema Apple: los pesos estan en formato MLX, de modo que no se pueden cargar directamente en vLLM, TGI o llama.cpp sobre CUDA.
- Aviso de precision: el autor indica explicitamente que no se debe convertir el modelo a float16; la recomendacion es mantener pesos y activaciones en BF16.
- Dependencia de una build de desarrollo de transformers para el procesador multimodal, lo que complica la reproducibilidad en entornos de produccion con versiones fijadas.
- No es un modelo generativo: no admite tool calling, agentes ni generacion de texto; cualquier expectativa de ese tipo no se cumple.
- Longitud de contexto desconocida: sin esa cifra no se puede garantizar el comportamiento con documentos largos, y el truncado silencioso puede degradar la calidad de recuperacion.
- Idiomas: el modelo se declara multilingue, pero no se detalla la lista de idiomas soportados ni su cobertura real, lo que obliga a validar con datos propios.
- Riesgo de recuperacion incorrecta: como todo modelo de embeddings, puede devolver vecinos semanticamente proximos pero factualmente erroneos; no debe usarse como fuente de verdad sin verificacion posterior.
- Sesgos: no se documentan en la informacion disponible; se heredan del corpus de entrenamiento del modelo base y requieren evaluacion propia en dominios sensibles.
- Uso comercial: la licencia Apache-2.0 lo permite, conservando la atribucion a Google; no se anaden restricciones en la conversion, pero conviene revisar los terminos del modelo original.
- Consistencia de dimensiones: consultas y documentos deben usar la misma dimension de embedding; mezclar 768 con una version truncada a 256 invalida las comparaciones.

## Enlaces

- Repositorio de la conversion: https://huggingface.co/gahabeen/embeddinggemma-2-bf16
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Revision del modelo base usada en la conversion: https://huggingface.co/google/embeddinggemma-2/tree/914f7f89142e33e77833254d9c9b90c3cef7303b
- Pagina de producto de EmbeddingGemma en Google DeepMind: https://deepmind.google/models/gemma/embeddinggemma/
- Blog de lanzamiento de EmbeddingGemma 2: https://deepmind.google/blog/embeddinggemma-2-an-open-lightweight-multimodal-embedding-model/
- Documentacion para desarrolladores de EmbeddingGemma: https://ai.google.dev/gemma/docs/embeddinggemma
- Repositorio MLX-VLM (revision de conversion 3d87e884): https://github.com/Blaizzy/mlx-vlm/tree/3d87e88402f307efbf68e568971aa887ee7d9ed0
- Guia externa sobre EmbeddingGemma 2 (2026): https://cldnavi.com/en/blog/embeddinggemma-2-guide-2026/
