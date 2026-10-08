# jonpark0/embeddinggemma-2-AX650

## Resumen

EmbeddingGemma 2 — AX650 / AX8850 (LLM-8850) NPU es una conversión del modelo de embeddings `google/embeddinggemma-2` para ejecutarse sobre aceleradores NPU de Axera (AX650 / AX8850), publicada por el usuario jonpark0. El modelo original proyecta texto, imágenes y audio en un único espacio de embeddings de 768 dimensiones; esta versión reproduce ese comportamiento mediante grafos compilados con Axera Pulsar2 7.0-patch1 y un runtime de host que solo requiere numpy, Pillow y tokenizers, sin PyTorch.

La relevancia de esta ficha está en que el paquete es autocontenido y listo para producción en hardware embebido: incluye los binarios `.axmodel` por encoder (texto en 128/512/1024 tokens, visión dividida en tres grafos y audio hasta 1120 frames log-mel), los activos de host y un servidor compatible con `/v1/embeddings` de OpenAI. Se ha validado en una tarjeta M5Stack LLM-8850 (AXCL) con host Windows 11, y el mismo código funciona en Linux.

El coste de la conversión es una reducción del contexto: el modelo original acepta 8K tokens, mientras que aquí cada entrada se limita a 1024 tokens y los clips de audio a 11,2 segundos. La fidelidad medida frente a la ejecución float32 es muy alta (coseno mínimo 0,9994 en todas las modalidades), por lo que el interés principal es el despliegue en NPU de bajo consumo, no la mejora de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de embeddings multimodal (texto, imagen y audio a un espacio unico); detalle de capas y atencion no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens por entrada en esta conversion (texto y tokens soft combinados); el modelo original acepta 8K |
| Tipos de cuantizacion | no disponible el ancho de bits; el repositorio declara `base_model_relation: quantized` y pesos compilados para NPU |
| Idiomas soportados | multilingual, en, ko |
| Licencia | apache-2.0 (segun el repositorio; la licencia del modelo base no se detalla en la informacion proporcionada) |
| Formato de pesos | `.axmodel` compilado con Pulsar2 7.0-patch1, mas activos auxiliares `.npy`, `embed_tokens.bf16.bin`, `tokenizer.json`, `host_meta.json` |
| Dimension de embedding | 768, con truncamiento Matryoshka a 512, 256 o 128 (re-normalizado tras el recorte) |
| Tarea (pipeline) | feature-extraction |
| Tamano del repositorio | 1,5 GB |
| Hardware objetivo | NPU Axera AX650 / AX8850; probado en tarjeta M5Stack LLM-8850 (AXCL) |
| Prefijos de tarea | query, document, sts, classification, clustering, code |

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna, el numero de capas del encoder de texto, el volumen de tokens de entrenamiento ni si hubo fases de RLHF o DPO; el modelo base es `google/embeddinggemma-2` y esta publicacion es una conversion cuantizada, no un reentrenamiento. Lo que si se documenta es el proceso de conversion: cada encoder se reimplemento en PyTorch con operaciones compatibles con la exportacion (formas estaticas, mascaras de padding aplicadas como multiplicacion y renormalizacion despues del softmax, RMSNorm en forma `rsqrt`, sin formas dinamicas ni tensores booleanos en el grafo) y se verifico contra el modelo de Hugging Face con coseno 1,0 antes de exportar.

El encoder de vision se divide en tres grafos con un reparto de 16 capas en 8 + 4 + 4, admite hasta 280 tokens soft por imagen y conserva la relacion de aspecto. El encoder de audio procesa hasta 1120 frames log-mel (11,2 segundos, que se convierten en 280 tokens soft). El encoder de texto se compila en tres variantes de longitud fija (128, 512 y 1024 tokens) y el runtime selecciona la mas corta que encaje con la entrada. La innovacion practica del paquete es el ensamblado multimodal en el host: `eg2_host.py` realiza tokenizacion, preprocesado y construccion de la secuencia con marcadores `<|image|>` y `<|audio|>` antes de invocar los grafos de la NPU.

## Capacidades

- Generacion de embeddings de texto con prefijos de tarea diferenciados (`query`, `document`, `sts`, `classification`, `clustering`, `code`), replicando el comportamiento descrito en la model card original.
- Embeddings de imagen: hasta 280 tokens soft por imagen, manteniendo la relacion de aspecto, con recorte bicubico via Pillow.
- Embeddings de audio: hasta 11,2 segundos por clip (1120 frames log-mel en 280 tokens soft).
- Entrada multimodal combinada: un mismo input puede mezclar texto, imagen y audio, generando un unico vector.
- Truncamiento Matryoshka a 768, 512, 256 o 128 dimensiones, con re-normalizacion posterior al recorte.
- Recuperacion cruzada entre modalidades: texto a foto y transcripcion a clip de audio, con top-1 del 100 % en las pruebas reportadas.
- Servidor compatible con la API `/v1/embeddings` de OpenAI, con entradas de tipo cadena, lista de cadenas u objetos con `text`, `image` (base64) y `audio` (WAV en base64).
- Soporte multilingue segun los idiomas declarados (multilingual, en, ko).
- No realiza generacion de texto, razonamiento, codigo, tool calling ni agentes: es exclusivamente un modelo de representacion (feature-extraction).

## Casos de uso

- Busqueda semantica sobre documentacion tecnica en ingles y coreano: indexar los documentos con el prefijo `document` y las consultas con `query`, aprovechando el truncamiento a 256 o 128 dimensiones para reducir el tamano del indice vectorial sin reentrenar.
- Deduplicacion y agrupamiento de tickets de soporte: generar embeddings con el prefijo `clustering` y agrupar por similitud coseno en un servicio ligero que corre sobre una tarjeta LLM-8850, con 17 ms por frase corta.
- Recuperacion texto-imagen en un catalogo de productos: indexar las fotos con el encoder de vision y consultar en lenguaje natural; la model card reporta top-1 del 100 % en 12 fotos de prueba y aproximadamente 1,6 s por imagen en la NPU.
- Indexacion de audio para buscadores de podcasts o grabaciones: transcribir y usar el encoder de audio o buscar directamente la transcripcion contra el clip, con unos 0,15 s por clip de 5,8 segundos.
- Filtrado de similitud en pipelines de moderacion o recomendacion: calcular similitud entre pares con el prefijo `sts` para decidir si dos textos abordan el mismo tema antes de pasarlos a un modelo generativo mayor.
- Clasificacion y enrutado de consultas: usar los embeddings con el prefijo `classification` como caracteristicas de un clasificador ligero que decida a que cola o modelo derivar cada peticion.
- Despliegue en edge o entornos sin GPU: al requerir solo numpy, Pillow y tokenizers en el host y ejecutar en NPU, encaja en equipos industriales o pasarelas donde no hay CUDA disponible.
- Servicio interno de embeddings compatible con OpenAI: sustituir llamadas a APIs externas por `eg2_server.py` en el puerto 8010, manteniendo el mismo contrato de peticion para no tocar el codigo cliente.

## Benchmarks y rendimiento

Fidelidad frente a la ejecucion float32 del modelo original (pipeline de sentence-transformers: mean pooling + normalizacion L2), medida en una tarjeta LLM-8850 por PCIe Gen2 x2:

| Entrada | Coseno minimo vs float32 | Notas |
|---|---|---|
| Texto (STS-B y KorSTS, 1.000 frases; pares de retrieval) | 0,9996 | STS-B Spearman 0,9477 (float32 0,9478); KorSTS 0,8980 (0,8984) |
| Texto largo (hasta 1024 tokens) | 0,9997 | |
| Imagenes (12 fotos) | 0,9994 | retrieval texto a foto top-1 100 % |
| Audio (10 clips en coreano e ingles) | 0,9994 | retrieval transcripcion a clip top-1 100 % |
| Texto + imagen + audio en una sola entrada | 0,9994 | |

Tiempos por modalidad en la misma tarjeta:

| Modelo | Tiempo en NPU | Entrada completa extremo a extremo |
|---|---|---|
| Texto, 128 tokens | 15,4 ms | frase corta, aproximadamente 17 ms |
| Texto, 512 tokens | 78,4 ms | no disponible |
| Texto, 1024 tokens | 246,7 ms | aproximadamente 255 ms |
| Vision (tres grafos, 2520 parches) | aproximadamente 1,34 s | aproximadamente 1,6 s por imagen |
| Audio (hasta 11,2 s) | 62 ms | clip de 5,8 s, aproximadamente 0,15 s |

No se han publicado resultados de benchmarks comparativos con otros modelos de embeddings (MMTEB, MTEB u otros) en la informacion disponible. El script `selftest.py` reproduce la verificacion de fidelidad contra las referencias float32 en `refs/` e imprime `PASS`.

## Requisitos de hardware

- Se ejecuta sobre NPU Axera AX650 / AX8850, probado en la tarjeta M5Stack LLM-8850 (AXCL) conectada por PCIe Gen2 x2. No se documenta ejecucion en GPU CUDA.
- VRAM de GPU: no aplica; el computo se realiza en la NPU. El repositorio ocupa 1,5 GB en disco.
- Requisitos de software en el host: driver y runtime AXCL instalados (comprobables con `axcl-smi`), Python 3.10 o superior, y los paquetes numpy, tokenizers, pillow, soundfile y scipy.
- Compatibilidad de host: Windows 11 con el driver AXCL de Windows (probado) y hosts Linux con el mismo codigo. El script `build_axcl_driver.sh` para kernel 7.x compila, pero no se ha probado su carga en hardware segun la model card.
- Despliegue: `eg2_server.py` expone un endpoint compatible con `/v1/embeddings` (puerto configurable, por ejemplo 8010); `eg2_cli.py` para pruebas puntuales; `eg2-embed.service` como unidad systemd; `install_ubuntu.sh` para la puesta en marcha en Ubuntu.
- Alternativa de servicio solo texto: `axllm serve assets --port 8000` con la rama `windows` de `JonPark0/ax-llm` y `model_type: embedding_gemma2`.
- Latencia y throughput: 15,4 ms (128 tokens), 78,4 ms (512 tokens) y 246,7 ms (1024 tokens) por entrada en NPU; una peticion simultanea por tarjeta, por lo que el throughput queda limitado a ese serializado.
- Cartera de consumo: no aplica a GPU de consumo; el equivalente es una tarjeta NPU dedicada tipo LLM-8850.

## Comparativa con modelos similares

La informacion disponible solo permite comparar esta conversion con su propia referencia float32 y con la ruta de servicio alternativo; no se aportan datos de otros modelos de embeddings de terceros.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jonpark0/embeddinggemma-2-AX650 (esta ficha) | no disponible | 1024 tokens | STS-B Spearman 0,9477; coseno minimo 0,9994 vs float32; 15,4 ms a 128 tokens en NPU | apache-2.0 (segun el repositorio) | Hugging Face, pesos `.axmodel` para AX650/AX8850 |
| google/embeddinggemma-2 (float32, referencia) | no disponible | 8K tokens | STS-B Spearman 0,9478; KorSTS 0,8984 | no disponible en la informacion proporcionada | Hugging Face, pesos para PyTorch |
| Servicio solo texto via ax-llm | no disponible | no disponible | no disponible | no disponible | rama `windows` de JonPark0/ax-llm |

Otros modelos comparables de la misma categoria: no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Recorte de contexto severo: maximo 1024 tokens por entrada (texto y tokens soft juntos) frente a los 8K del modelo original; las entradas mas largas se truncan conservando BOS y el EOS final, lo que puede degradar la recuperacion en documentos largos.
- Limites por modalidad: audio de hasta 11,2 segundos (el tope de 280 tokens del procesador original), imagenes de hasta 280 tokens soft y sin soporte de video.
- Una peticion simultanea por tarjeta, lo que limita el throughput en entornos con carga concurrente.
- El preprocesado de imagen usa el redimensionado bicubico de Pillow en lugar del de torchvision; en float32 esto da un coseno de 0,99997 o superior frente al original, es decir, una desviacion pequena pero no nula.
- El driver AXCL para kernel 7.x incluido en `build_axcl_driver.sh` compila pero no se ha probado su carga en hardware Linux, por lo que la ruta Linux esta menos validada que la de Windows 11.
- Dependencia de un unico proveedor de hardware (Axera); no hay ruta documentada a GPU CUDA ni a CPU en este repositorio.
- Como modelo de embeddings no genera texto, por lo que no aplica el riesgo de alucinacion en el sentido generativo; el riesgo equivalente es la deriva semantica por cuantizacion, acotada por los cosenos reportados pero no evaluada en tareas de retrieval a gran escala.
- No se han publicado evaluaciones de sesgo, cobertura idiomatica real ni rendimiento en benchmarks estandar (MTEB/MMTEB) en la informacion disponible.
- La licencia declarada en este repositorio es apache-2.0, pero la informacion proporcionada no detalla la licencia del modelo base `google/embeddinggemma-2`; conviene verificarla antes de un uso comercial, ya que las condiciones del modelo original pueden imponer restricciones adicionales.
- El paquete esta pensado para inspeccion previa: no se han publicado referencias de terceros que reproduzcan los numeros de fidelidad y latencia fuera de la propia model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jonpark0/embeddinggemma-2-AX650
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Runtime de servicio solo texto (rama `windows`): https://github.com/JonPark0/ax-llm
