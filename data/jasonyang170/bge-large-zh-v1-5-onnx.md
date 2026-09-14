# JasonYANG170/bge-large-zh-v1.5-ONNX

## Resumen

JasonYANG170/bge-large-zh-v1.5-ONNX es una conversión a formato ONNX del modelo de embeddings BAAI/bge-large-zh-v1.5, publicada por el usuario JasonYANG170 bajo licencia MIT. No se ha realizado ningún ajuste fino: se trata exclusivamente de una exportación del checkpoint original (revisión `79e7739b6ab944e86d6171e44d24c997fc1e0116`) a grafos ONNX, pensada para su ejecución en navegador y en Node.js mediante Transformers.js, con soporte explícito de WebGPU y WASM.

El modelo resuelve el problema de ejecutar búsqueda semántica y recuperación de información en chino directamente en el cliente, sin depender de un servidor de inferencia. Para ello ofrece tres variantes de precisión publicadas: fp32 (1298,3 MB), fp16 (649,5 MB) y q8 (393,7 MB), lo que permite elegir entre fidelidad numérica y tamaño de descarga según el dispositivo objetivo. El repositorio completo ocupa 2,3 GB.

Es relevante ahora porque el ecosistema de IA en navegador está madurando: la model card documenta pruebas con Transformers.js 4.0.1 y ONNX Runtime Node 1.24.3 sobre WebGPU nativo, además de scripts de validación, un manifiesto de compilación con sumas de comprobación SHA-256 y scripts de reproducibilidad (`export_models.py`, `quantize_q4.py`). La contrapartida es que se trata de un modelo derivado con cero descargas y cero likes en el momento de redactar esta ficha, sin resultados de benchmarks de recuperación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder) heredada del modelo base BAAI/bge-large-zh-v1.5; no se detalla en el repositorio |
| Parametros totales | No disponible en el repositorio (el modelo base BAAI/bge-large-zh-v1.5 declara ~326 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el repositorio (el modelo base emplea 512 tokens) |
| Tipos de cuantizacion | fp32, fp16, q8; se mencionan variantes opcionales mixtas Q4 generadas con `quantize_q4.py` |
| Idiomas soportados | Chino (`zh`) |
| Licencia | MIT (los pesos conservan la licencia upstream; la conversión no la modifica) |
| Formato de pesos | ONNX (grafos + pesos, con posible archivo `onnx/model.onnx_data` adjunto) |
| Dimension de embedding | No disponible en el repositorio (el modelo base produce 1024 dimensiones) |
| Tamano de cada variante | fp32: 1298,3 MB; fp16: 649,5 MB; q8: 393,7 MB (grafo + pesos) |
| Libreria de inferencia | transformers.js (`@huggingface/transformers`) |
| Backends soportados | WebGPU (`device: 'webgpu'`), WASM (`device: 'wasm'`), CPU de Node (`device: 'cpu'`) |
| Tamano del repositorio | 2,3 GB |
| Pipeline declarado | feature-extraction |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo convertido. Se trata de una exportacion directa del checkpoint BAAI/bge-large-zh-v1.5, un modelo de embeddings de la familia BGE basado en un encoder tipo BERT, por lo que la model card remite a la documentacion upstream conservada en el archivo `UPSTREAM_README.md` del repositorio. No se ha aplicado ningun ajuste fino durante la conversion, y no se documentan en el repositorio ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF o DPO (en el caso de un modelo de embeddings, estas tecnicas no serian el procedimiento habitual).

La aportacion tecnica del repositorio no esta en el entrenamiento, sino en el proceso de exportacion y verificacion. El autor incluye `export_models.py` (que espera los checkpoints originales en `sources/<model-name>` y escribe en `repos/<model-name>-ONNX`), `quantize_q4.py` para variantes mixtas de precision Q4, un `build-manifest.json` con revision de origen, versiones de paquetes y sumas SHA-256, y scripts de validacion comparativa frente al FP32 original. La receta de embedding prevista por el modelo base es pooling CLS seguido de normalizacion, aunque la model card advierte que el runtime de EasyEDA usa de momento mean pooling y que las pruebas de humo cubren ese comportamiento.

## Capacidades

- Generacion de embeddings de frases y documentos en chino (pipeline `feature-extraction`); el modelo emite embeddings por token, no texto.
- Busqueda semantica y recuperacion densa en chino (retrieval), con pooling CLS + normalizacion segun la receta del modelo base.
- Inferencia en navegador con WebGPU o WASM, y en Node.js sobre CPU.
- Ejecucion totalmente offline tras descargar el repositorio completo.
- Cuantizacion configurable en tiempo de carga (`dtype: 'fp32' | 'fp16' | 'q8'`).
- Reproducibilidad verificable mediante manifiesto de compilacion y sumas SHA-256.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni uso como agente. Es un modelo exclusivamente de representacion vectorial.
- Capacidades multilingues: no disponibles; el modelo declara unicamente chino (`zh`).

## Casos de uso

- Busqueda semantica dentro de una aplicacion web en chino: cargando la variante q8 en WASM o la fp16 en WebGPU, el modelo vectoriza la consulta y los documentos en el propio cliente, eliminando la necesidad de enviar texto del usuario a un servidor. Nota: al cambiar de tamano de modelo, precision o estrategia de pooling hay que reconstruir los vectores de documento.
- Recuperacion aumentada por generacion (RAG) en chino con indice precalculado: el modelo genera los embeddings de los fragmentos de un corpus y de la pregunta del usuario; el LLM que produce la respuesta se ejecuta aparte, ya que este modelo no genera texto.
- Deduplicacion y agrupamiento de contenidos: vectorizar titulares, tickets o descripciones de producto y aplicar similitud coseno para detectar duplicados o alimentar algoritmos de clustering.
- Extensiones de navegador y aplicaciones de escritorio sin backend: la variante q8 (393,7 MB) es la mas adecuada para dispositivos con poca memoria y entornos donde no se puede desplegar infraestructura de servidor.
- Filtrado y moderacion de contenido por similitud: comparar mensajes entrantes contra un conjunto de embeddings de referencia para clasificar por proximidad semantica.
- Sistemas de recomendacion por contenido en chino: representar el historial del usuario y el catalogo en el mismo espacio vectorial de 1024 dimensiones (heredado del modelo base) para ordenar candidatos por similitud. No se deben mezclar vectores de las variantes small, base y large, ya que sus dimensiones difieren.
- Investigacion sobre cuantizacion y ejecucion en navegador: el repositorio incluye informes de error absoluto maximo y de similitud coseno, lo que permite auditar el impacto de fp16 y q8 antes de adoptarlos en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de recuperacion, clasificacion ni MTEB en la informacion disponible. El unico dato numerico publicado es una prueba de humo numerica sobre seis entradas en chino de distinta longitud, que mide la similitud coseno de la salida frente al modelo original en FP32. El propio autor advierte que es una prueba de humo, no un benchmark de precision ni de retrieval, y que la similitud de salida no establece correccion factual.

| Variante (dtype) | Tamano de grafo + pesos | Similitud coseno minima frente al FP32 original |
|---|---|---|
| fp32 | 1298,3 MB | 1,000000 |
| fp16 | 649,5 MB | 0,999999 |
| q8 | 393,7 MB | 0,987722 |

Umbrales declarados: 0,999 para FP32/FP16 y 0,98 para las variantes cuantizadas. Los informes incluyen errores absolutos maximos y, para generacion, coincidencia de siguiente token.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos unicamente; hay que anadir el espacio de activaciones, no documentado): fp32 en torno a 1,3 GB; fp16 en torno a 650 MB; q8 en torno a 394 MB.
- GPU recomendadas: no hay una lista oficial. La model card documenta pruebas de inferencia FP16 en GPU con WebGPU sobre una RTX 5080 Laptop GPU, con Transformers.js 4.0.1 y ONNX Runtime Node 1.24.3.
- Cabe en GPU de consumo: si, en cualquier GPU con soporte WebGPU y suficiente memoria; la variante q8 y la fp16 estan claramente por debajo del GB de pesos.
- Despliegue sin GPU: la model card indica WASM con `dtype: 'q8'` para CPU de navegador y `device: 'cpu'` para CPU de Node.
- Opciones de despliegue: Transformers.js (navegador y Node), ONNX Runtime, y el runtime de EasyEDA, que usa mean pooling. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de embeddings en ONNX.
- Latencia y throughput: no disponibles. No se publican mediciones de velocidad.
- Caveat de proceso: las ejecuciones nativas con WebGPU produjeron los vectores esperados y completaron `dispose()`, pero el proceso de Node devolvio codigo de salida 1 durante el apagado sin diagnostico. Las comprobaciones de salida pasaron; el apagado del proceso nativo sigue sin resolver.

## Comparativa con modelos similares

No hay datos de benchmarks que permitan una comparativa cuantitativa. La tabla siguiente recoge unicamente lo que puede afirmarse con la informacion disponible; los valores del modelo base proceden de la documentacion upstream y no se han verificado en este repositorio.

| Modelo | Relacion | Formato | Licencia | Uso en navegador | Datos de rendimiento |
|---|---|---|---|---|---|
| JasonYANG170/bge-large-zh-v1.5-ONNX | Conversion ONNX del siguiente | ONNX (fp32, fp16, q8) | MIT | Si (WebGPU, WASM) | Solo prueba de humo coseno |
| BAAI/bge-large-zh-v1.5 | Modelo base, sin ajuste | PyTorch / safetensors (no confirmado en este repositorio) | MIT | No en este repositorio | No disponible aqui |
| Otras variantes de la familia BGE en ONNX | Alternativas de la misma categoria | ONNX | Segun cada repositorio | Depende del repositorio | No disponible |

Dado que el modelo no aporta metricas de retrieval, no es posible afirmar que iguale o supere a alternativas de la misma categoria sin ejecutar una evaluacion propia.

## Limitaciones y advertencias

- Modelo exclusivamente de embeddings: no genera texto, no razona, no ejecuta codigo ni admite tool calling. Usarlo para tareas generativas es un error de categoria.
- Idioma unico: solo declara soporte de chino (`zh`). No hay evidencia de comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero la similitud coseno alta frente al FP32 no garantiza correccion factual ni calidad de recuperacion; el autor lo advierte de forma explicita.
- Discrepancia de pooling: la receta original del modelo base es CLS pooling con normalizacion, mientras que EasyEDA usa mean pooling. Mezclar ambas estrategias produce espacios vectoriales distintos e invalida las comparaciones.
- Incompatibilidad de dimensiones: las variantes small, base y large de BGE tienen dimensiones distintas; sus vectores no deben mezclarse en un mismo indice. Al cambiar de tamano, precision o pooling hay que reconstruir el indice de documentos.
- Descarga completa obligatoria: el repositorio pesa 2,3 GB y hay que conservar el archivo `onnx/model.onnx_data` junto a `onnx/model.onnx` para la importacion offline.
- Clientes con dtype fijado: un cliente en linea que fije q8 no podra cargar un repositorio que no incluya esa variante; la seleccion de dtype debe ser explicita en EasyEDA.
- Fallo de apagado no resuelto en Node con WebGPU nativo (codigo de salida 1), documentado por el autor.
- Madurez y soporte: cero descargas y cero likes en el momento de la consulta, autor individual y ausencia de benchmarks publicos. Para produccion conviene validar con un conjunto de evaluacion propio antes de adoptarlo.
- Licencia: MIT, lo que permite uso comercial, pero los pesos conservan la licencia upstream y conviene revisar la documentacion y el fichero LICENSE originales del modelo base.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los enlaces obtenidos eran foros sin relacion y se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JasonYANG170/bge-large-zh-v1.5-ONNX
- Modelo base: https://huggingface.co/BAAI/bge-large-zh-v1.5
- Revision concreta del modelo base empleada en la conversion: https://huggingface.co/BAAI/bge-large-zh-v1.5/tree/79e7739b6ab944e86d6171e44d24c997fc1e0116
- Libreria Transformers.js: https://github.com/huggingface/transformers.js
- ONNX Runtime: https://github.com/microsoft/onnxruntime
- Paper, blog o demo especificos de esta conversion: no disponibles en la informacion proporcionada.
- Resultados de busqueda web relacionados con el modelo: no disponibles (los resultados obtenidos no guardaban relacion con el modelo).
