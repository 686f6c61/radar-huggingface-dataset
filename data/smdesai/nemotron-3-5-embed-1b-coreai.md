# smdesai/Nemotron-3.5-Embed-1B-CoreAI

## Resumen

Nemotron-3.5-Embed-1B-CoreAI es una conversión del modelo de embeddings nvidia/Nemotron-3.5-Embed-1B-BF16 al runtime Apple Core AI, publicada por el usuario smdesai, para ejecutar la inferencia en la GPU de un iPhone o de un Mac. No es un modelo nuevo: reempaqueta los pesos de NVIDIA en grafos `.aimodel` acompañados de un host con tokenizador, tablas RoPE y la matriz de embeddings, de forma que la recuperación multimodal ocurre en el dispositivo y sin conexión.

El modelo subyacente es un bi-encoder de aproximadamente 1.000 millones de parámetros que combina una torre de visión Pixtral con un proyector y un modelo de lenguaje Ministral-3 bidireccional de 16 capas. Produce un único embedding de 2048 dimensiones, con mean pooling, normalización L2 y propiedades Matryoshka, para consultas en texto y pasajes que pueden ser texto, la imagen de una página o ambos.

Su interés es práctico: permite indexar y consultar documentos, gráficos, capturas de pantalla y fotos por significado dentro de una aplicación iOS o macOS, con una huella declarada de unos 850 MB durante la indexación de imágenes en un iPhone. Se distribuye en dos builds, `w8` (cuantización de 8 bits con paleta k-means) y `float16`, bajo licencia OpenMDW-1.1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Bi-encoder multimodal: torre de visión Pixtral + proyector + modelo de lenguaje Ministral-3 bidireccional de 16 capas |
| Parámetros totales | ~1.000 millones (1B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens en texto (cubos de 128, 512 y 2048; tablas YaRN RoPE de 2048 posiciones); imágenes de hasta 6400 parches. Deducido de los artefactos publicados, la model card no lo declara explícitamente |
| Tipos de cuantización | 8 bits k-means palettizado (`w8`, una LUT por tensor, cómputo fp16) y float16; no existe build de 4 bits |
| Idiomas soportados | no disponible; validado en cinco idiomas, incluido japonés en MIRACL-ja |
| Licencia | OpenMDW-1.1 (pesos de NVIDIA); modelos base Ministral-3 bajo Apache License 2.0 |
| Formato de pesos | `.aimodel` (Apple Core AI) más assets de host: `embed_tokens.f16`, `text_rope.f32`, `tokenizer.json`, `chat_template.jinja`, `config.json` |
| Dimensión del embedding | 2048 (mean pooling, L2, Matryoshka: se puede truncar a k y renormalizar) |
| Pipeline declarado | visual-document-retrieval |
| Tamaño del repositorio | 4,4 GB (build `w8` 1,85 GB; build `float16` 3,13 GB) |
| Vocabulario | 131.072 tokens (tabla de embeddings [131072, 2048]) |

## Arquitectura y entrenamiento

La arquitectura es un bi-encoder de recuperación con dos torres: un codificador visual Pixtral con su proyector, que convierte la página o imagen en Features que se insertan en las posiciones `[IMG]` de la secuencia, y un modelo de lenguaje Ministral-3 bidireccional de 16 capas que produce la representación final. La salida es un vector de 2048 dimensiones obtenido por mean pooling y normalizado en L2 por el host; al ser Matryoshka, se puede recortar a las primeras k dimensiones y renormalizar para reducir almacenamiento o coste de búsqueda.

La conversión a Core AI trocea el grafo en dos builds. En `float16` el modelo de lenguaje se parte en dos chunks de 8 capas (`c1of2` y `c2of2`, con la normalización y el mean pooling en el segundo) y la torre de visión va en un grafo aparte de 828 MB. El host realiza el trabajo alrededor de los grafos: aplicación de la plantilla de chat con los prefijos `query:` y `passage:`, tokenización, preprocesado de imagen de Pixtral con lado mayor de 1120 px, patchify, tablas RoPE de visión, recogida de embeddings de token desde `embed_tokens.f16` e inserción de las Features de imagen. Cada entrada se rellena al cubo más pequeño que la contiene (128, 512 o 2048 tokens; 1024, 2304, 4096 o 6400 parches) y Core AI especializa el modelo en la primera carga, unos 4 s en un iPhone 17 Pro para `w8`, quedando después en caché.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo de origen en la documentación proporcionada; esos detalles corresponden a la ficha de nvidia/Nemotron-3.5-Embed-1B-BF16 y no se recogen aquí.

## Capacidades

- Generación de embeddings de recuperación para consultas en texto, con prefijo `query:`.
- Embeddings de pasajes en texto, con prefijo `passage:`, y de imágenes de documento: páginas, gráficos, capturas de pantalla y fotos.
- Entrada combinada imagen + texto en un mismo pasaje.
- Salida de 2048 dimensiones con mean pooling y normalización L2, truncable por Matryoshka a cualquier tamaño k.
- Multilingüe: evaluación en cinco idiomas, con resultados publicados en japonés (MIRACL-ja).
- Ejecución on-device en iPhone y en GPU de Mac mediante Core AI, sin necesidad de red.
- Dos builds con precisión intercambiable: `w8` (1,85 GB) y `float16` (3,13 GB).
- No genera texto, no soporta tool calling ni function calling, no implementa agentes ni modos de razonamiento explícito: es exclusivamente un codificador de recuperación.

## Casos de uso

- Búsqueda semántica dentro de una app iOS: el modelo indexa notas, documentos y capturas y responde a consultas en lenguaje natural con embeddings de 2048 dimensiones generados en el propio dispositivo, sin enviar contenido a un servidor.
- Recuperación aumentada (RAG) con requisitos de privacidad: al ejecutarse on-device, permite construir un índice local sobre correo, PDF y fotos que nunca sale del terminal, usando el recorte Matryoshka para ajustar el índice al almacenamiento disponible.
- Búsqueda sobre páginas escaneadas y gráficos: con salida nDCG@10 de 0,7689 en ViDoRe V3 de informática (215 consultas, 1360 imágenes de página con el build `w8`), es adecuado para localizar figuras, tablas y diagramas en corpus técnicos.
- Asistencia de campo sin conectividad: manuales, planos y fichas técnicas indexados en un iPhone permiten consultas por imagen o por texto en entornos sin cobertura, con latencias de 197 ms para una imagen de 1024 parches.
- Atención al cliente multilingüe en el borde: recuperación de fragmentos relevantes de una base documental en varios idiomas antes de delegar la respuesta a un modelo generativo, con la ventaja de que el texto del cliente no abandona el dispositivo.
- Deduplicación y agrupación de documentos: los embeddings normalizados permiten calcular similitud coseno y agrupar páginas repetidas o casi idénticas; el truncado Matryoshka a k reducido abarata el cálculo en lotes grandes.
- Búsqueda multimodal en apps de notas o fotos: indexación conjunta de la imagen y su texto asociado (OCR, título, etiquetas) en un único vector, lo que simplifica la arquitectura al no requerir dos índices separados.
- Filtrado previo en pipelines de servidor: uso del build `float16` en un Mac como etapa de re-ranking o de generación de embeddings de referencia durante el desarrollo, con paridad medida frente a la implementación en transformers fp32.

## Benchmarks y rendimiento

Calidad de recuperación con los assets distribuidos ejecutados en Core AI (nDCG@10, intervalo de confianza del 95 % por bootstrap emparejado):

| Benchmark | float16 | w8 | Delta (IC 95 %) |
|---|---|---|---|
| MIRACL-ja (250 consultas, 8000 documentos con negativos duros) | 0,8732 | 0,8731 | −0,0001 [−0,0007, +0,0004] |
| ViDoRe V3 informática (215 consultas, 1360 imágenes de página) | 0,7678 | 0,7689 | +0,0011 [−0,0001, +0,0026] |

Fidelidad del embedding frente al modelo upstream en transformers fp32 (19 casos: consultas y pasajes en cinco idiomas hasta 1817 tokens; siete imágenes, incluidas gráficos, páginas, una tira de 2000 px, una imagen de 50×30 y RGBA):

| Build | Dispositivo | Coseno frente a fp32 (peor caso) |
|---|---|---|
| float16 | MacBook Pro M3 Max | 0,99999620 |
| float16 | iPhone 17 Pro | 0,99999630 |
| w8 | MacBook Pro M3 Max | 0,99967110 |
| w8 | iPhone 17 Pro | 0,99968213 |

Rendimiento (mediana de una llamada, tras calentar):

| Build | Dispositivo | Carga (en caché) | Texto de 128 tokens | Imagen de 1024 parches | Página de 6400 parches |
|---|---|---|---|---|---|
| w8 | iPhone 17 Pro | 3,4 s (primer lanzamiento igual) | 93 ms | 197 ms | 1,9 s |
| float16 | iPhone 17 Pro | 11,8 s (primer lanzamiento 290 s) | 52 ms | 306 ms | 3,0 s |
| float16 | MacBook Pro M3 Max | 7,5 s | 25 ms | 98 ms | 1,2 s |

No se han publicado resultados de benchmarks de conocimiento general (MMLU, HumanEval, GSM8K) en la información disponible, ni comparativas numéricas frente a otros modelos de embeddings.

## Requisitos de hardware

- Huella en dispositivo: el build `w8` se ejecuta en un iPhone dentro del límite de memoria por defecto, con unos 850 MB de ocupación mientras indexa imágenes.
- Almacenamiento: 1,85 GB para `w8` y 3,13 GB para `float16`, más los assets de `host/` (537 MB de tabla de embeddings, 22 MB de tokenizador).
- Dispositivos verificados: iPhone 17 Pro y MacBook Pro con M3 Max. No hay datos publicados para otros modelos de iPhone, iPad o Apple Silicon.
- No cabe plantear despliegue en GPU NVIDIA: el formato `.aimodel` y el runtime Core AI son específicos de Apple. vLLM, TGI, llama.cpp y Ollama no son aplicables a este repositorio.
- Para usar el modelo en servidor hay que recurrir al checkpoint original nvidia/Nemotron-3.5-Embed-1B-BF16, que sí se integra en stacks convencionales.
- Latencia: 93 ms por texto corto en iPhone con `w8`; 25 ms por texto corto en M3 Max con `float16`; 1,2 a 1,9 s por página de 6400 parches según dispositivo.
- Arranque en frío: la primera carga de `float16` en iPhone tarda 290 s por la especialización del grafo; después queda cacheada (11,8 s).
- No se han publicado cifras de throughput por lotes ni de consumo energético.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Cuantización / formato | Licencia | Despliegue |
|---|---|---|---|---|---|---|
| Nemotron-3.5-Embed-1B-CoreAI (este) | ~1B | 2048 tokens | Embedding 2048 d Matryoshka | w8 k-means y float16, `.aimodel` | OpenMDW-1.1 | Core AI en iPhone y Mac |
| nvidia/Nemotron-3.5-Embed-1B-BF16 | ~1B | no disponible | Embedding 2048 d (modelo de origen) | BF16, safetensors | OpenMDW-1.1 | vLLM, NIM, transformers |
| smdesai/Nemotron-3.5-Parse-CoreAI | 0,63B | no disponible | Parser de documentos: texto, layout, cajas, tablas en LaTeX, gráficos | Visión fp16, decoder int8, decodificación especulativa | no disponible | Core AI en iPhone y Mac |

Frente al checkpoint original, la conversión pierde versatilidad de despliegue pero gana ejecución local: la diferencia de calidad medida es de 0,0001 nDCG en MIRACL-ja entre `float16` y `w8`, y el coseno frente a fp32 se mantiene por encima de 0,9996 en ambos builds. Nemotron-3.5-Parse-CoreAI no es un competidor directo: resuelve extracción estructurada de documentos, no recuperación. No se dispone de datos de otros embedders multimodales en la información proporcionada para ampliar la comparación.

## Limitaciones y advertencias

- Es un modelo de embeddings: no genera respuestas, no razona paso a paso y no admite tool calling. Cualquier caso de uso conversacional requiere un modelo generativo adicional.
- No existe build de 4 bits: los autores midieron una pérdida de 0,013 nDCG en MIRACL-ja con un intervalo que excluye el cero, por lo que la cuantización agresiva no se distribuye.
- El contexto de texto está limitado a 2048 tokens; documentos largos deben trocearse, con el coste de recuperación que ello implica.
- Las imágenes se reescalan a un lado mayor de 1120 px; páginas muy densas o texto pequeño pueden perder detalle, y una página de 6400 parches tarda 1,9 s en iPhone 17 Pro.
- La cobertura de idiomas no está documentada formalmente: solo se declara validación en cinco idiomas y resultados públicos en japonés.
- Es una conversión de un tercero (smdesai), no una publicación oficial de NVIDIA, con 0 descargas y 1 like en el momento de la consulta: la validación comunitaria es prácticamente nula.
- Dependencia total del runtime Core AI y del toolchain de Apple; no es portable a CUDA ni a otras plataformas sin reconvertir el modelo.
- Licencia OpenMDW-1.1 para los pesos y Apache 2.0 para los modelos base Ministral-3: hay que revisar el fichero LICENSE del repositorio antes de un uso comercial, ya que la información disponible no detalla condiciones adicionales.
- Riesgo de alucinación en el sentido generativo no aplica; el riesgo real es la recuperación de pasajes irrelevantes o falsos positivos, que depende del troceado, del corpus y del idioma.
- No se han publicado análisis de sesgo ni evaluaciones de robustez frente a dominios distintos de los benchmarks citados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/smdesai/Nemotron-3.5-Embed-1B-CoreAI
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-BF16
- Licencia en el repositorio: https://huggingface.co/smdesai/Nemotron-3.5-Embed-1B-CoreAI/blob/main/LICENSE
- Ficha del modelo en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3_5-embed-1b
- Referencia de API de NVIDIA: https://docs.api.nvidia.com/nim/reference/nvidia-nemotron-3_5-embed-1b
- Conversión relacionada (parser de documentos): https://huggingface.co/smdesai/Nemotron-3.5-Parse-CoreAI
- Portal de modelos Nemotron de NVIDIA: https://developer.nvidia.com/topics/ai/nemotron
