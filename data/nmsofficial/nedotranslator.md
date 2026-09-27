# nmsofficial/NedoTranslator

## Resumen

NedoTranslator es un modelo de traduccion automatica ingles-turco (en→tr) publicado en HuggingFace por el desarrollador nmsofficial (Nedim Mutlu). Se trata de un ajuste fino del modelo Helsinki-NLP/opus-mt-tc-big-en-tr, revisión base e539fc16a8a1a0ea5950eb339b595bfcce990e90, sobre la arquitectura MarianMT (transformer encoder-decoder para traduccion neuronal). El repositorio contiene únicamente los activos de inferencia estándar de Transformers, con pesos en safetensors y un tamaño aproximado de 0,9 GB.

El modelo resuelve una tarea concreta y acotada: traducir texto de inglés a turco. No es un modelo de propósito general ni un modelo de razonamiento; es un sistema de traducción dedicado, con 234.843.876 parámetros según los safetensors publicados (la model card declara 236.883.968, una discrepancia de aproximadamente un 0,9 % que conviene tener en cuenta). Al derivar de la familia OPUS-MT de Helsinki-NLP, hereda su licencia CC BY 4.0 y su naturaleza ligera, lo que lo hace apto para despliegue en hardware modesto.

Su relevancia actual es limitada por su propia naturaleza: tiene 0 descargas y 0 "likes" en el momento de la consulta, no publica resultados de benchmarks y no documenta el corpus de ajuste fino. Resulta interesante como caso de estudio de ajuste fino de un modelo OPUS-MT y como opción de traducción autoalojada para turco, pero no hay evidencia pública que permita validar sus afirmaciones de calidad frente al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT) |
| Parametros totales | 234.843.876 (segun safetensors); la model card declara 236.883.968 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible de forma explicita; el ejemplo de la model card trunca la entrada a 512 tokens |
| Tipos de cuantizacion | no disponible; el checkpoint se publica en float32 y no se incluyen variantes GGUF, int8 ni int4 |
| Idiomas soportados | ingles (en) y turco (tr); la model card documenta unicamente la direccion ingles→turco |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (bundle de Transformers: config, tokenizer y pesos) |
| Dtype del checkpoint | float32 |
| Tamano del repositorio | 0,9 GB |
| Modelo base | Helsinki-NLP/opus-mt-tc-big-en-tr (revision e539fc16a8a1a0ea5950eb339b595bfcce990e90) |
| SHA-256 de los pesos | 0344f97adf437f4aaa5cd63da05d4fa5a59bbab483c25165d37fecf7e799a5f5 |
| Fecha de publicacion | 27 de septiembre de 2026 |

## Arquitectura y entrenamiento

NedoTranslator emplea MarianMT, la arquitectura de traduccion neuronal del toolkit Marian, materializada en HuggingFace como un transformer encoder-decoder estándar para generacion text2text. El checkpoint se distribuye en float32 y la model card recomienda beam search con num_beams=4 para reproducir los resultados de referencia. Se trata de la variante "big" de la linea OPUS-MT tc-big, con aproximadamente 235 millones de parametros, lo que la situa en el rango medio de los modelos de traduccion dedicados: bastante mas grande que los Marian pequeños (~77 M) y bastante mas pequeña que modelos multilingues como NLLB-200.

El proceso de ajuste fino es opaco. La model card indica explicitamente que el bundle subido "excluye rutas especificas del cluster, manifiestos de entrenamiento y artefactos de benchmark locales", de modo que no se publican ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atención lineal, destilacion). Todo lo que se sabe del entrenamiento es que parte del checkpoint base indicado y que corresponde a una version de produccion denominada internamente "NedoTranslator production v1", usada en ejecuciones de benchmark en→tr de septiembre de 2026 cuyos resultados no se han liberado. En la busqueda web aparece un dataset asociado, nmsofficial/NedoTranslator-Turkish-Safety-SFT, cuyo contenido y relacion exacta con este checkpoint no se detallan en la informacion disponible.

## Capacidades

- Traduccion de texto de ingles a turco, con generacion secuencial mediante beam search (num_beams=4 recomendado).
- Generacion text2text pura: no produce texto libre ni mantiene conversaciones, unicamente traducciones condicionadas a una entrada.
- Procesamiento por lotes mediante el pipeline de Transformers, apto para traducir volumenes grandes de frases o parrafos independientes.
- Compatibilidad declarada con HuggingFace Inference Endpoints (etiqueta endpoints_compatible en el repositorio).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo "thinking", capacidades de vision, audio, OCR ni voz.
- Capacidad multilingue limitada a los dos idiomas declarados (en, tr); no hay evidencia de que soporte traduccion en la direccion inversa tr→en, pese a que algunos modelos de la familia tc-big son bidireccionales.
- No se documenta control de terminologia, glosarios, ni formateo estructurado de salida.

## Casos de uso

- Localizacion de documentacion tecnica: el modelo puede traducir por lotes ficheros Markdown, README o documentacion de API escritos en ingles, encajando en un pipeline de CI/CD que regenere la version turca en cada release. Su tamano (0,9 GB) permite ejecutarlo en el mismo runner que compila el proyecto.
- Atencion al cliente en turco: integrado como capa de traduccion en un sistema de tickets, permite que un agente que solo lee ingles gestione consultas redactadas en turco, traduciendo la conversacion en ambos sentidos mediante dos instancias o mediante el modelo base para la direccion inversa.
- Generacion de corpus paralelos para entrenamiento: al ser un modelo ligero y de licencia permisiva, puede usarse para producir pares en→tr a gran escala que alimenten el entrenamiento o la evaluacion de modelos de traduccion mayores, siempre que se valide la calidad de la salida por muestreo.
- Traduccion de fichas de producto en comercio electronico: catalogos con miles de SKU descritos en ingles pueden traducirse en lote sin enviar datos a APIs externas, lo que simplifica el cumplimiento de la normativa de proteccion de datos si el catalogo contiene informacion sensible.
- Subtitulado y contenido audiovisual: los segmentos de subtitulo son cortos y autocontenidos, un regimen donde los modelos Marian suelen rendir bien y donde la truncacion a 512 tokens no supone un problema, siempre que se gestione la sincronizacion temporal aparte.
- Moderacion de contenido en plataformas turcas: combinado con un clasificador posterior, permite filtrar y clasificar texto turco desde un pipeline cuyo idioma de trabajo interno sea el ingles. El dataset Turkish-Safety-SFT hallado en la busqueda sugiere que el autor ha trabajado en esta direccion, aunque este checkpoint no documenta capacidades de seguridad.
- Despliegue on-premise con soberania de datos: organizaciones que no pueden enviar texto a servicios en la nube pueden ejecutar el modelo en CPU o en una GPU de gama baja, dado su reducido consumo de memoria.
- Prototipado rapido e investigacion: sirve como linea base reproducible (beam search, num_beams=4, revision base fijada y SHA-256 publicado) para experimentos academicos sobre traduccion en→tr.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que este checkpoint corresponde a las ejecuciones de benchmark en→tr de septiembre de 2026, pero indica de forma explicita que los artefactos de benchmark locales quedaron excluidos del bundle subido a HuggingFace. No hay cifras de BLEU, chrF, COMET, MMLU ni de ningun otro conjunto que puedan citarse o compararse con alternativas.

## Requisitos de hardware

Estimaciones derivadas del recuento de parametros publicado en safetensors (234.843.876). Son calculos aritmeticos sobre el tamano de los pesos, no mediciones realizadas sobre el modelo.

- Peso de los pesos en memoria: aproximadamente 0,94 GB en float32, 0,47 GB en fp16/bf16, 0,23 GB en int8 y 0,12 GB en int4.
- VRAM estimada para inferencia, incluyendo activaciones y overhead del runtime: del orden de 1,5-2 GB en float32, 1-1,5 GB en fp16 y menos de 1 GB en int8.
- Cabe holgadamente en cualquier GPU de consumo con 4 GB o mas de VRAM: GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090, asi como en GPUs de datacenter (A100, H100) donde quedaria infrautilizada.
- Es viable la inferencia solo en CPU para cargas moderadas; tambien es ejecutable en Apple Silicon mediante el backend MPS de PyTorch.
- Opciones de despliegue confirmadas o plausibles: Transformers con PyTorch (ruta documentada por el autor), HuggingFace Inference Endpoints (etiqueta endpoints_compatible), CTranslate2 (soporta la arquitectura Marian, aunque no se ha verificado para este checkpoint concreto), exportacion a ONNX Runtime, y conversion a GGUF para llama.cpp u Ollama, conversion que no se proporciona en el repositorio. La compatibilidad con vLLM o TGI no esta confirmada en la informacion disponible.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por frase.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento |
|---|---|---|---|---|---|
| NedoTranslator | 234,8 M | no disponible (ejemplo a 512 tokens) | en→tr | CC BY 4.0 | sin datos publicados |
| Helsinki-NLP/opus-mt-tc-big-en-tr (modelo base) | ~236 M (declarados por el autor del ajuste) | no disponible | en, tr | CC BY 4.0 (segun la model card del ajuste) | sin datos disponibles en esta busqueda |
| Helsinki-NLP/opus-mt-en-tr | ~77 M (cifra aproximada de la familia, no verificada en esta busqueda) | no disponible | en→tr | CC BY 4.0 | sin datos disponibles en esta busqueda |
| NLLB-200-distilled-600M | 600 M | 512 tokens | 200 idiomas, turco incluido | CC BY-NC-4.0 (no comercial) | sin datos disponibles en esta busqueda |

La comparacion relevante es contra el modelo base del que deriva: sin resultados de benchmark publicados por parte del autor, no hay forma de determinar si el ajuste fino mejora, iguala o degrada la calidad del modelo Helsinki-NLP original. Frente a NLLB-200-distilled-600M, la diferencia principal no es de rendimiento sino de licencia: NedoTranslator es CC BY 4.0 y por tanto utilizable comercialmente con atribucion, mientras que NLLB-200 en su variante distilled se distribuye bajo CC BY-NC-4.0, que restringe el uso comercial.

## Limitaciones y advertencias

- Direccion unica documentada: la model card describe exclusivamente ingles→turco. No hay evidencia de que la direccion inversa funcione, aunque el modelo base pertenezca a una familia que en algunos casos es bidireccional.
- Sin benchmarks publicados: no existe ninguna cifra verificable de calidad (BLEU, chrF, COMET) frente al modelo base ni frente a alternativas. Cualquier afirmacion de mejora seria una suposicion.
- Entrenamiento no documentado: se desconoce el corpus de ajuste fino, su tamano, su composicion y si se aplicaron tecnicas de alineacion. Esto impide auditar sesgos y evaluar riesgos de dominio.
- Riesgo de alucinacion en traduccion: como cualquier modelo neuronal de traduccion, puede producir salidas fluidas pero incorrectas, en especial con nombres propios, cifras, unidades, terminologia especializada y frases idiomaticas.
- Truncacion de contexto: el ejemplo de uso trunca la entrada a 512 tokens. Los documentos largos requieren segmentacion previa, con el consiguiente riesgo de perder coherencia entre segmentos.
- Idiomas limitados a ingles y turco: no es utilizable como traductor puente hacia otros idiomas sin encadenar modelos, lo que acumula errores.
- Sin validacion comunitaria: 0 descargas y 0 "likes" en el momento de la consulta. No hay informes independientes de calidad, y el autor es un desarrollador individual sin historial publico de evaluacion reproducible de este checkpoint.
- Discrepancia en el recuento de parametros: 234.843.876 segun safetensors frente a 236.883.968 declarados en la model card. Es una diferencia menor, pero indica falta de sincronizacion entre la documentacion y los artefactos.
- Licencia CC BY 4.0: permite uso comercial y modificacion, pero exige atribucion tanto del modelo base (Helsinki-NLP, opus-mt-tc-big-en-tr) como del ajuste. Conviene conservar el aviso de atribucion al redistribuir o derivar.
- El bundle excluye manifiestos de entrenamiento y artefactos de benchmark, de modo que la reproducibilidad completa del resultado declarado no es posible con lo publicado.
- No se documentan mecanismos de control de terminologia, sesgos de genero gramatical ni tratamiento de contenido sensible, aspectos especialmente relevantes en turco por su sistema de genero y sus sufijos aglutinantes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nmsofficial/NedoTranslator
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-tc-big-en-tr
- Dataset asociado hallado en la busqueda: https://huggingface.co/datasets/nmsofficial/NedoTranslator-Turkish-Safety-SFT
- Perfil del autor en HuggingFace: https://huggingface.co/nmsofficial
- Perfil del autor en GitHub: https://github.com/NMSOfficial/NMSOfficial
- Repositorio NMSTranslator en GitHub: https://github.com/NMSOfficial/NMSTranslator
- Contexto de mercado sobre traduccion con modelos generativos (Google Translate y Gemini): https://blog.google/products-and-platforms/products/search/gemini-capabilities-translation-upgrades/
