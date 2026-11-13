# CharlZKP/OpenThai2.0-OCR-Markdown-ONNX

## Resumen

OpenThai2.0-OCR-Markdown-ONNX es la exportación a formato ONNX del modelo iapp/OpenThai2.0-OCR-Markdown, un ajuste fino en tailandés del NVIDIA Nemotron 3.5 Parse realizado por iApp Technology. El modelo original está especializado en el parseo de documentos: recibe una imagen de página y devuelve su contenido estructurado en Markdown, incluyendo detección de regiones, clases de elementos y texto. Esta versión ONNX la publica CharlZKP y está pensada para ejecutarse íntegramente en el navegador mediante onnxruntime-web, con backend WebGPU o WASM, de modo que las páginas se procesan en el dispositivo del usuario sin enviar imágenes a un servidor.

La arquitectura es un codificador-decodificador: un vision encoder C-RADIOv4-SO400M de 27 bloques con un neck que proyecta a 1024 dimensiones, seguido de un decodificador causal mBART de 10 capas con GroupQueryAttention (16 cabezas de consulta, 8 de clave-valor) y KV cache. El vocabulario del decodificador es de 72.512 tokens y el modelo soporta tailandés e inglés. Los pesos no están cuantizados: todos los tensores conservan el valor float32 original de `model.safetensors`, copiado byte a byte, y únicamente se han reescrito los grafos para que el runtime del navegador pueda ejecutarlos.

La relevancia de esta ficha es doble. Por un lado, demuestra un patrón de despliegue de OCR de documentos de alta calidad en el cliente, sin infraestructura de servidor. Por otro, documenta con detalle los problemas de paridad numérica de los kernels fused de atención de onnxruntime-web 1.30 en WebGPU, que obligan a trocear la atención y limitar el prefill a 16 posiciones nuevas por llamada. La licencia es OpenMDW 1.1, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador-decodificador: vision encoder C-RADIOv4-SO400M (27 bloques) + neck + decodificador causal mBART de 10 capas |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explícita; el decodificador usa KV cache y en WebGPU se limita a 16 posiciones nuevas por llamada |
| Tipos de cuantización | ninguno; pesos en float32 sin cuantizar |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | OpenMDW License Agreement 1.1 (tokenizer MIT) |
| Formato de pesos | ONNX (`encoder.onnx`, `encoder_chunked.onnx`, `decoder.onnx`, datos externos `.data0..3` y `.data0..1`, `pos_embed.f32`, `tokens.json`) |
| Tamaño del repositorio | 2,5 GB |
| Pipeline | image-text-to-text |
| Librería | onnxruntime (onnxruntime-web, WebGPU y WASM) |
| Modelo base | iapp/OpenThai2.0-OCR-Markdown (a su vez derivado de NVIDIA Nemotron 3.5 Parse) |

## Arquitectura y entrenamiento

El modelo es un codificador-decodificador multimodal orientado a OCR estructurado. El codificador es un C-RADIOv4-SO400M con 27 bloques que procesa parches de 16×16 RGB normalizados con estadísticas CLIP, en formato `patches [N,768]`, junto con embeddings posicionales `pos [N,1152]`, y produce un prefijo visual `vision [1, N/4+1, 1024]`. El decodificador es un transformer causal mBART de 10 capas que opera sobre la concatenación de prefijo visual y texto, con GroupQueryAttention de 16 cabezas de consulta y 8 de clave-valor, KV cache por capa (`past_key_values.{0..9}.{key,value} [1,8,P,64]`) y `lm_head` atado a los embeddings (se almacena una sola vez). Devuelve únicamente los logits de la última posición, con vocabulario de 72.512 tokens.

El preprocesado replica `NemotronParseImageProcessor` con empaquetado navit: la imagen se ajusta dentro de 1664×2048 con reducción bilineal PIL, se rellena a la derecha y abajo con blanco hasta que la altura es múltiplo de 16 y la anchura múltiplo de 64, y se normaliza con media y desviación típica de CLIP. El prompt es fijo: `</s><s><predict_bbox><predict_classes><output_markdown><predict_text_in_pic>`, con ids `[2, 0, 50004, 50008, 50001, 50009]`. La decodificación es greedy con penalización de repetición 1.1 según `generation_config.json` y termina en `</s>` (id 2). La interpolación del grid posicional aprendido de 128×128×1152 se realiza en JavaScript mediante normalización de contenido (`hf_prefix_geometry.py`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO; la model card remite al modelo base para esos datos. La innovación técnica de esta exportación es la reescritura de los grafos para el navegador: la atención del codificador se despliega en 105 trozos de consulta de ⌈N/105⌉ filas para mantener el buffer de scores por debajo de 128 MiB, y existe una variante `encoder_chunked.onnx` que calcula la atención en bloques de 128 filas de consulta dentro de un `Loop` de ONNX para el backend WASM, porque el kernel de atención de CPU de ORT construye la matriz completa 16×N×N y desborda a partir de unos 4.000 parches, cuando una página completa puede tener hasta 13.322.

## Capacidades

- Parseo de documentos a Markdown: convierte una imagen de página en texto estructurado con marcas de Markdown.
- Detección de regiones y clases de elementos mediante los tokens especiales `predict_bbox` y `predict_classes`.
- Extracción de texto dentro de imágenes (`predict_text_in_pic`), útil para figuras y capturas incrustadas.
- OCR bilingüe tailandés-inglés, con vocabulario byte-level BPE de 72.512 tokens.
- Inferencia en el cliente: ejecución completa en navegador con onnxruntime-web sobre WebGPU o WASM, sin servidor.
- Decodificación greedy determinista con KV cache y penalización de repetición configurable.
- No dispone de tool calling, function calling, modo de razonamiento explícito, capacidades de audio ni comportamiento de agente multi-paso; es un modelo de imagen a texto especializado.

## Casos de uso

- Digitalización de facturas y albarranes tailandeses: el modelo recibe la imagen de la página y devuelve Markdown con las regiones delimitadas, lo que permite extraer importes y líneas de detalle con un postprocesado ligero sobre el Markdown generado.
- Procesamiento de documentos confidenciales sin salida de red: al ejecutarse en WebGPU o WASM dentro del navegador, ninguna imagen abandona el dispositivo; encaja en entornos sanitarios, jurídicos o administrativos con requisitos estrictos de privacidad.
- Herramienta web de conversión de PDF a Markdown: una aplicación que rasteriza cada página y llama al codificador y al decodificador en el cliente, con prefill troceado en bloques de 16 posiciones para respetar la limitación de WebGPU.
- Indexación de archivos escaneados para búsqueda interna: el Markdown resultante se ingesta en un motor de búsqueda o en un sistema RAG, conservando la estructura de tablas y secciones que el modelo reconstruye.
- Extracción de contenido de capturas y figuras: el token `predict_text_in_pic` permite recuperar texto incrustado en imágenes dentro de documentos, algo que un OCR de texto plano no resuelve.
- Despliegue en hardware modesto con backend WASM: la variante `encoder_chunked.onnx` permite procesar páginas completas en CPU cuando no hay GPU disponible, a costa de mayor latencia.
- Evaluación y prototipado de pipelines de parseo: el script `build_onnx.py` incluido permite regenerar la exportación desde el modelo original y comparar la paridad numérica con Transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de paridad numérica entre la exportación ONNX y el modelo original en Transformers (fp32, CPU):

| Comprobación | Resultado |
|---|---|
| Salida del codificador, ORT CPU, página completa | diferencia máxima absoluta 2,9e-3 (valores hasta 14) |
| Salida del codificador, ORT CPU, recorte pequeño | diferencia máxima absoluta 2,4e-4 |
| Tokens greedy vs. Transformers | idénticos en todas las páginas de prueba |
| Atención del codificador en WebGPU vs. CPU | coincidencia hasta 1e-6 |
| GroupQueryAttention en WebGPU, ≤16 posiciones nuevas | coincide con CPU |
| GroupQueryAttention en WebGPU, ≥32 posiciones nuevas | filas incorrectas |

## Requisitos de hardware

- El repositorio ocupa 2,5 GB en float32; la VRAM o memoria necesaria para inferencia no está cuantificada en la información disponible.
- Backend WebGPU: requiere un navegador con soporte de WebGPU (probado en Chromium headless con SwiftShader). El codificador usa atención desplegada en 105 trozos para mantener el buffer de scores por debajo de 128 MiB.
- Backend WASM (CPU): usar `encoder_chunked.onnx`, ya que el kernel de atención de CPU de ORT desborda a partir de aproximadamente 4.000 parches.
- En WebGPU, el decodificador admite como máximo 16 posiciones nuevas por llamada; el prefill del prefijo visual y del prompt debe trocearse, con piezas solo visuales usando `input_ids [1,0]`.
- No se especifican GPU concretas (A100, H100, RTX 4090) ni estimaciones de latencia o throughput.
- Opciones de despliegue documentadas: onnxruntime-web con WebGPU o WASM, y ORT Python en CPU para verificación.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| CharlZKP/OpenThai2.0-OCR-Markdown-ONNX | Encoder C-RADIOv4-SO400M + decoder mBART 10 capas | th, en | ONNX fp32 | OpenMDW 1.1 | Ejecución en navegador, paridad verificada con el original |
| iapp/OpenThai2.0-OCR-Markdown | Misma arquitectura (modelo base) | th, en | safetensors (Transformers) | OpenMDW 1.1 | Requiere Python y Transformers; referencia de paridad |
| NVIDIA Nemotron 3.5 Parse | Misma familia (modelo upstream) | no disponible | no disponible | no disponible | Modelo original de NVIDIA del que deriva el fine-tune tailandés |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre sí.

## Limitaciones y advertencias

- El modelo solo cubre tailandés e inglés; el rendimiento en otros idiomas no está documentado.
- Es un modelo especializado en parseo de documentos: no soporta tool calling, agentes, audio ni razonamiento general.
- La atención fused de onnxruntime-web 1.30 en WebGPU devuelve valores incorrectos más allá de 16 posiciones, tanto en GroupQueryAttention como en MultiHeadAttention; es una limitación del runtime que obliga a trocear el prefill y a usar grafos de atención desplegada.
- En WebGPU, superar las 16 posiciones nuevas por llamada produce resultados erróneos; en WASM, usar el codificador no troceado desborda la memoria de atención a partir de unos 4.000 parches.
- Los pesos están en float32 sin cuantizar, lo que implica un repositorio de 2,5 GB y un coste de memoria mayor que una versión cuantizada.
- Riesgo de alucinación inherente a los modelos generativos: el decodificador puede producir texto no presente en la imagen, especialmente en páginas de baja calidad o con tablas complejas.
- No se documentan sesgos concretos del fine-tune tailandés; la model card remite al modelo base para los datos de entrenamiento y sus límites.
- La licencia OpenMDW 1.1 es distinta de las licencias permisivas habituales; debe revisarse antes de uso comercial. El tokenizer es MIT y se incluyen los avisos de terceros y la model card original de NVIDIA sin modificar.
- El modelo es una obra derivada en cadena (NVIDIA → iApp Technology → CharlZKP); la atribución a las tres partes es obligatoria.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlZKP/OpenThai2.0-OCR-Markdown-ONNX
- Modelo base: https://huggingface.co/iapp/OpenThai2.0-OCR-Markdown
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Documentación de onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
- Documentación de ONNX Runtime: https://onnxruntime.ai/
