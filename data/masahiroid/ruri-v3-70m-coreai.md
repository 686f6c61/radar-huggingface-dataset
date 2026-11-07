# masahiroid/ruri-v3-70m-coreai

## Resumen

ruri-v3-70m-coreai es una conversion de formato del checkpoint de embeddings semanticos en japones cl-nagoya/ruri-v3-70m al runtime Apple Core AI. No es un modelo nuevo ni un fine-tuning: el autor, masahiroid, exporta los pesos originales (revision `07a8b0aba47d29d2ca21f89b915c1efe2c23d1cc`) a un paquete `*.aimodel` en F32, manteniendo intacta la calidad numerica del modelo fuente. El objetivo es permitir inferencia de embeddings en dispositivo sobre Apple Silicon sin depender de PyTorch.

El modelo subyacente es un encoder ModernBERT de 70 millones de parametros especializado en recuperacion de informacion y similitud semantica en japones. La conversion incorpora el pooling de media con mascara y la normalizacion L2 dentro del grafo exportado, de modo que la salida es directamente un vector de embedding de dimension 384. Los prefijos de recuperacion originales (`検索クエリ: ` para consultas y `検索文書: ` para documentos) se conservan.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue, no de un modelo con mejoras de rendimiento. El propio autor declara explicitamente que no reclama mejor calidad de tarea, robustez ni velocidad frente al checkpoint original. Su interes practico esta en el ecosistema Apple (macOS/iOS) y en la validacion numerica documentada, con una diferencia absoluta maxima de 2,09e-07 frente a la referencia PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) para embeddings de frases |
| Parametros totales | 70 millones (heredados de cl-nagoya/ruri-v3-70m) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens en esta exportacion (forma fija); el checkpoint fuente soporta contextos mayores, no expuestos aqui |
| Tipos de cuantizacion | F32 unicamente; el autor indica explicitamente que no es cuantizacion de 4 bits |
| Idiomas soportados | japones (principal); validado tambien con entradas en ingles y vacias |
| Licencia | Apache-2.0 (pesos originales); MIT para el codigo de conversion y runtime |
| Formato de pesos | `*.aimodel` (Apple Core AI), no es un paquete Core ML |
| Dimension del embedding | 384 |
| Tamano del repositorio | 0,3 GB |
| Formas de entrada | `input_ids`: [1, 128]; `attention_mask`: [1, 128]; batch size 1 |
| Runtime validado | macOS 27.2, `coreai-core==1.0.0b3` (GPU), exportado con `coreai-torch==0.4.3` |

## Arquitectura y entrenamiento

El modelo fuente es un encoder ModernBERT de 70M de parametros entrenado por cl-nagoya para embeddings de frases en japones, con pooling de media consciente de la mascara y normalizacion L2. Esta exportacion no introduce entrenamiento adicional: se limita a convertir el grafo a formato Core AI con formas fijas y batch 1, integrando el pooling y la normalizacion en el propio modelo exportado.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion (RLHF, DPO o similares) del checkpoint original en la informacion proporcionada. La innovacion tecnica de este artefacto es la reproducibilidad de la conversion: se incluyen `provenance.json` (que fija el checkpoint fuente exacto), `prepare.py`, `common.py`, `build.py` y `sources.json`, ademas de vectores de validacion deterministas (`*_validation_vectors.npz`) y resultados por caso en `validation.json`. Los datos del modelo se guardan sin checkpoints pickle.

La validacion numerica frente al checkpoint PyTorch original reporta una diferencia absoluta maxima de 2,0861626e-07 y una similitud coseno minima de 0,999999999999. Las pruebas cubren prefijos de recuperacion en japones, texto japones, ingles, entrada vacia, pares consulta-documento relevantes e irrelevantes y acuerdo de preferencia en ranking.

## Capacidades

- Generacion de embeddings de frases y documentos en japones para recuperacion semantica y similitud.
- Recuperacion asimetrica consulta-documento mediante los prefijos originales `検索クエリ: ` y `検索文書: `.
- Normalizacion L2 integrada: la salida es directamente comparable por producto escalar o similitud coseno.
- Manejo de entradas en ingles y entradas vacias, segun los casos de validacion incluidos.
- Procesamiento en dispositivo sobre Apple Silicon mediante el runtime Core AI.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es exclusivamente un encoder de embeddings.
- No hay modo thinking ni capacidades multimodales.

## Casos de uso

- Busqueda semantica en aplicaciones iOS/macOS: indexar documentos japoneses como vectores de 384 dimensiones y resolver consultas en dispositivo, sin enviar texto a un servidor, usando los prefijos de recuperacion originales.
- Deduplicacion y agrupamiento de contenido japones: calcular embeddings de articulos o tickets y agrupar por similitud coseno para detectar duplicados o temas recurrentes.
- Filtrado previo en pipelines RAG: generar embeddings locales de baja latencia para descartar candidatos antes de una etapa de reranking mas costosa en servidor.
- Clasificacion por similitud con prototipos: comparar embeddings de entradas nuevas contra vectores de referencia de cada categoria, aprovechando la normalizacion L2 incluida.
- Funciones de busqueda offline en apps distribuidas: el paquete `*.aimodel` en F32 con formas fijas simplifica el empaquetado y la ejecucion determinista en el dispositivo.
- Evaluacion comparativa de embeddings en dispositivo: el repositorio GitHub asociado incluye una app iOS que compara ruri-v3 con NLContextualEmbedding de Apple, util para decidir que motor usar en produccion.
- Prototipado rapido en scripts de macOS: el helper sincrono `ConvertedModel` permite obtener un embedding con pocas lineas de codigo para validar una idea antes de industrializarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, JSTS u otros) en la informacion disponible. El unico dato de rendimiento es la validacion de equivalencia numerica con el checkpoint original:

| Metrica | Valor |
|---|---|
| Diferencia absoluta maxima vs. PyTorch | 2,0861626e-07 |
| Similitud coseno minima vs. PyTorch | 0,999999999999 |
| Precision | F32 |
| Batch size | 1 |
| Longitud de secuencia | 128 tokens (fija) |

El autor no reclama mejoras de velocidad en dispositivo ni de calidad de tarea frente al modelo fuente.

## Requisitos de hardware

- Entorno: Apple Silicon con macOS 27.2 y el runtime `coreai-core==1.0.0b3`; no funciona fuera del ecosistema Apple Core AI.
- VRAM/unificada estimada: no disponible de forma explicita; con 70M de parametros en F32 el peso de los pesos ronda los 0,28 GB, y el repositorio completo ocupa 0,3 GB, por lo que cabe holgadamente en cualquier Mac con memoria unificada moderna.
- GPU recomendadas: GPU integrada de Apple Silicon validada por el autor; no hay datos de rendimiento en A100, H100 ni RTX 4090 porque el formato `*.aimodel` no esta pensado para esas plataformas.
- Cabe en GPU de consumo: si, en equipos Apple Silicon; no aplica a GPUs NVIDIA.
- Opciones de despliegue: runtime Core AI (`coreai-core`), con dependencias `numpy`, `huggingface_hub` y `transformers==4.57.3`. El autor ofrece conversiones alternativas en MLX y Core ML en repositorios separados.
- Latencia y throughput: no disponibles. El helper es sincrono y esta pensado para scripts independientes; en bucles de eventos asincronos hay que adaptar la corrutina `predict` en lugar de anidar `asyncio.run`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ruri-v3-70m-coreai | 70M | 128 tokens (exportacion) | `*.aimodel` (Core AI) | Apache-2.0 / MIT (codigo) | Hugging Face, 0 descargas |
| cl-nagoya/ruri-v3-70m | 70M | superior a 128 tokens (segun model card del autor) | safetensors/PyTorch | Apache-2.0 | Hugging Face (modelo fuente) |
| masahiroid/ruri-v3-70m-coreml | 70M | no disponible | Core ML | Apache-2.0 / MIT (codigo) | Hugging Face |
| masahiroid/ruri-v3-70m-mlx | 70M | no disponible | MLX | Apache-2.0 / MIT (codigo) | Hugging Face |

La comparativa relevante es entre formatos de despliegue del mismo checkpoint: Core AI frente a Core ML y MLX. No se dispone de datos de rendimiento comparado entre estas tres exportaciones.

## Limitaciones y advertencias

- No es un modelo nuevo ni un fine-tuning: cualquier mejora de calidad respecto al checkpoint fuente es inexistente por diseno.
- Contexto truncado a 128 tokens con formas fijas y batch 1; no admite secuencias mas largas aunque el checkpoint original si las soporte.
- Solo F32: no hay versiones cuantizadas, con el coste de memoria y ancho de banda asociado.
- Dependencia estricta de Apple Silicon y de una version concreta del runtime (`coreai-core==1.0.0b3`); no es un paquete Core ML y no se ejecuta en otras plataformas.
- El modelo esta orientado al japones; el soporte de otros idiomas no esta documentado como capacidad oficial, solo como caso de validacion.
- Riesgo de alucinacion no aplica en el sentido generativo, pero la similitud semantica puede producir recuperaciones erroneas en dominios especializados sin evaluacion propia.
- Sesgos: no disponibles en la informacion proporcionada.
- Licencia Apache-2.0 en los pesos permite uso comercial, pero conviene revisar el codigo Python incluido antes de ejecutarlo, como advierte el propio autor.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad, por lo que la verificacion corre por cuenta del integrador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/masahiroid/ruri-v3-70m-coreai
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-70m
- Revision del checkpoint fuente: https://huggingface.co/cl-nagoya/ruri-v3-70m/tree/07a8b0aba47d29d2ca21f89b915c1efe2c23d1cc
- Conversion MLX: https://huggingface.co/masahiroid/ruri-v3-70m-mlx
- Conversion Core ML: https://huggingface.co/masahiroid/ruri-v3-70m-coreml
- Repositorio GitHub: https://github.com/masahiroid/ruri-coreml/tree/main
- Codigo de conversion Core ML: https://github.com/masahiroid/ruri-coreml/tree/main/ruri_coreml/
