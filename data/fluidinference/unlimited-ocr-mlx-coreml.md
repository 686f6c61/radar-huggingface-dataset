# FluidInference/unlimited-ocr-mlx-coreml

## Resumen

Unlimited-OCR (MLX + Core ML) es una conversión a Apple silicon del modelo baidu/Unlimited-OCR, publicada por Fluid Inference. El modelo original sigue la arquitectura DeepSeek-OCR: un codificador de página compuesto por SAM-B y CLIP-L (DeepEncoder más proyector) que convierte cada página de 1024 x 1024 píxeles en 273 embeddings, y un decodificador MoE de 12 capas estilo DeepseekV2 con 3.000 millones de parámetros totales y aproximadamente 0,5 B activos por token. Esta versión no reentrena nada: solo cambia el formato y la precisión de los pesos de Baidu. El resultado es un sistema de OCR y parsing de documentos que funciona íntegramente en local, sin conexión a red, sobre macOS 15 o superior.

La innovación práctica de la conversión es su modo multi-página: hasta 16 páginas entran en un único prompt y el documento completo sale en una sola generación en formato Markdown, con separadores `<PAGE>` y cajas de maquetación `<|det|>label [x1, y1, x2, y2]<|/det|>` expresadas en coordenadas 0-999 relativas a la página. Se distribuyen tres runtimes que comparten el mismo codificador Core ML: un decodificador MLX de 8 bits (recomendado), una variante turbo con los expertos enrutados a 4 bits y un decodificador Core ML con estado, también de 8 bits. La relevancia actual está en que traslada un pipeline de document AI de nivel producción a hardware de consumo Apple, con un consumo de memoria de 1,9 GB más 2,7 GB de pesos mapeados.

El repositorio ocupa 9,3 GB porque incluye todos los artefactos (codificador, decodificador Core ML, decodificador MLX completo y versión turbo, embeddings y tokenizer). La licencia es MIT, la misma que la del modelo base de Baidu, y las descargas registradas en el momento de redactar esta ficha son 81, con 15 me gusta. Se trata, por tanto, de una conversión reciente y de nicho, orientada a desarrolladores que ya trabajan en el ecosistema Apple y necesitan OCR local de documentos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de vision SAM-B + CLIP-L (DeepEncoder + proyector) y decodificador MoE de 12 capas tipo DeepseekV2 con atencion R-SWA |
| Parametros totales | 3 B |
| Parametros activos | Aproximadamente 0,5 B (MoE con 64 expertos; el grafo calcula los 64 por token y las ponderaciones de enrutado anulan los no seleccionados) |
| Longitud de contexto | Buckets de prefijo de 384 / 640 / 1152 / 2304 tokens (1 / 2 / 4 / 8 paginas de 273 tokens) mas un anillo de los ultimos 128 tokens generados; la model card indica que admite hasta 16 paginas por prompt en una sola generacion |
| Tipos de cuantizacion | MLX: 8 bits affine, grupo 64; MLX turbo: expertos enrutados a 4 bits grupo 32 y resto a 8 bits; Core ML: pesos a 8 bits por bloque de 32 con computo en fp16; codificador y embeddings en fp16. Existe un decodificador de 4 bits completo, no distribuido, que diverge en el token 329 |
| Idiomas soportados | No disponible |
| Licencia | MIT (LICENSE de Baidu) |
| Formato de pesos | `safetensors` (MLX), `UnlimitedOcrPageEncoder.mlpackage` y `UnlimitedOcrDecoder.mlpackage` (Core ML), `embeddings.f16` |
| Modelo base | baidu/Unlimited-OCR (relacion: quantized) |
| Runtime | MLX y Core ML, con gestores Swift `UnlimitedOcrFastManager` y `UnlimitedOcrManager` en FluidUse; macOS 15 o superior |
| Tamano del repositorio | 9,3 GB |
| Descargas / me gusta | 81 / 15 |
| Fechas | Creado el 2026-10-11; actualizado el 2026-10-13 |

## Arquitectura y entrenamiento

El modelo no se ha entrenado en esta conversion: todos los pesos son de Baidu y el repositorio unicamente modifica su formato y su precision. La arquitectura hereda el diseno DeepSeek-OCR. El codificador de pagina es un DeepEncoder que combina SAM-B y CLIP-L y que produce, para cada pagina de 1024 x 1024, 273 embeddings (16 filas de 16 mas los saltos de linea de fila y el separador de vista); se distribuye en fp16 dentro de `UnlimitedOcrPageEncoder.mlpackage` (0,8 GB). El decodificador tiene 12 capas, dimension de modelo 1280, atención con cabezas de 128 dimensiones y hasta 64 expertos enrutados por capa.

La innovacion tecnica mas relevante para el despliegue es la atencion R-SWA del modelo original, que conserva todo el prefijo (prompt mas tokens de pagina) junto con un anillo de los ultimos 128 tokens generados, de modo que la cache K/V tiene un tamano fijo por bucket de prefijo: `[12 x (P + 128), 1280]` con P igual a 384, 640, 1152 o 2304. En Core ML, `k_cache` y `v_cache` son estado del modelo y las funciones `prefill_P{384,640,1152,2304}` procesan 128 tokens por llamada mientras que las `decode_P...` procesan 1 token, compartiendo pesos. El host en Swift arma el prefijo, coloca el token generado t en la ranura `P + t % 128` y aplica la prohibicion de repeticion de 35-gramas del modelo original.

El decodificador calcula los 64 expertos en cada token para mantener el grafo estatico, lo que implica leer los pesos de todos los expertos en cada paso; por eso la ruta turbo aplica 4 bits solo a los expertos enrutados y consigue aproximadamente un 15 % mas de velocidad. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO, ya que corresponden al modelo base y no se detallan en esta conversion.

## Capacidades

- OCR de documentos completos: transcripcion de paginas escaneadas o PDF a texto y Markdown en una sola pasada.
- Modo multi-pagina: hasta 16 paginas en un mismo prompt, con salida separada por `<PAGE>`.
- Extraccion de maquetacion: cajas de deteccion `<|det|>label [x1, y1, x2, y2]<|/det|>` en coordenadas 0-999 por pagina, utiles para reconstruir el orden de lectura y la estructura del documento.
- Reconstruccion de tablas y formulas: la model card advierte que la variante turbo presenta pequenas diferencias en formulas y tablas respecto al decodificador de 8 bits.
- Parsing de PDF con PDFKit: el runtime de referencia recibe paginas ya preprocesadas con `UnlimitedOcrPagePreprocessor.page(from:)`.
- Ejecucion 100 % offline: no requiere red ni servicios externos.
- Vision de documento a texto: la tarea declarada en HuggingFace es image-text-to-text.
- Tool calling, function calling, agentes, razonamiento multi-paso, audio y modo thinking: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no enumera idiomas soportados.

## Casos de uso

- Digitalizacion de archivos historicos y administrativos: un lote de PDF escaneados se procesa sin conexion a red, pagina a pagina, y la salida Markdown con separadores `<PAGE>` permite reconstruir el documento completo manteniendo la correspondencia entre texto y pagina fisica. Es adecuado porque todo el procesamiento ocurre en el equipo local y no hay coste por token en la nube.
- Construccion de pipelines de RAG sobre documentacion interna: el modelo convierte contratos, manuales y memorandos a Markdown limpio antes de fragmentarlos e indexarlos. Las cajas de maquetacion ayudan a descartar encabezados y pies repetidos y a respetar el orden de lectura en documentos a varias columnas.
- Procesamiento de facturas y albaranes: la extraccion de bloques con etiquetas y coordenadas permite localizar campos concretos (importes, fechas, numeros de referencia) y validarlos contra un ERP. La ventana de prefijo de 2304 tokens cubre varias paginas por generacion, lo que reduce el numero de llamadas por documento.
- Conversion de articulos cientificos a Markdown para revision o publicacion: la model card cita explicitamente el articulo de 14 paginas de Baidu procesado en una sola pasada (13.420 tokens en unos 70 s con el decodificador MLX de 8 bits), lo que lo hace viable para preprints con formulas y tablas.
- Cumplimiento normativo y tratamiento de datos sensibles: al ser totalmente offline y MIT, encaja en entornos donde no se permite enviar documentos a APIs de terceros, como expedientes medicos, juridicos o de recursos humanos.
- Accesibilidad documental: la transcripcion estructurada de documentos escaneados permite alimentar lectores de pantalla y sistemas de sintesis de voz con texto ordenado, aprovechando las cajas de maquetacion para respetar el flujo de lectura.
- Demos y herramientas de escritorio en macOS: el paquete FluidUse incluye una demo SwiftUI (`UnlimitedOcrDemo`) que lee un PDF completo en una pasada y resalta el bloque que se esta escribiendo, util como base para visores y revisiones asistidas.

## Benchmarks y rendimiento

La model card publica una comparacion de calidad contra la implementacion de referencia de Baidu (su propio codigo con `trust_remote_code`, fp32 en CPU, decodificacion voraz y los mismos pixeles). No se han publicado resultados de benchmarks academicos tipo MMLU, HumanEval o GSM8K en la informacion disponible.

| Comparacion de calidad | Resultado frente a upstream fp32 |
|---|---|
| 1 pagina (articulo de Baidu, pag. 4), 865 tokens | Identico |
| 3 paginas en una generacion (pag. 3-5), 2.461 tokens | Texto identico; 2 coordenadas de caja difieren en 1 unidad |
| Decodificador de 4 bits completo (no distribuido) | Diverge en el token 329 |

| Medicion de velocidad en M5 Pro, 24 GB, GPU, Swift | Valor |
|---|---|
| Codificador de pagina | Aproximadamente 100 ms por pagina |
| Prefill de 8 paginas (2.189 tokens), codificacion incluida | 3,0 s |
| Decodificacion | Aproximadamente 19 ms por token con 1 pagina y 23 ms con 8 paginas; estable durante toda la lectura |
| Articulo de Baidu, primeras 8 paginas en una lectura (6.727 tokens) | 160 s (primera version; desde entonces el tiempo por token ha bajado un 17 %) |
| Articulo de Baidu, 14 paginas, decodificador MLX de 8 bits | 13.420 tokens en aproximadamente 70 s (200-260 tokens/s) |
| Articulo de Baidu, 14 paginas, decodificador MLX turbo | Aproximadamente 50 s (aproximadamente 270 tokens/s) |
| Decodificador Core ML | Aproximadamente 50 tokens/s |

## Requisitos de hardware

- Plataforma: exclusivamente Apple silicon con macOS 15 o superior; no hay soporte CUDA ni ROCm en la informacion disponible.
- Memoria en ejecucion: la model card reporta 1,9 GB de huella de memoria mas 2,7 GB de pesos del decodificador mapeados, medidos en un M5 Pro con 24 GB.
- Almacenamiento: el repositorio completo ocupa 9,3 GB, aunque en ejecucion solo se cargan los artefactos del runtime elegido (0,8 GB el codificador Core ML, 2,7 GB el decodificador Core ML, 3,1 GB el decodificador MLX de 8 bits, 2,1 GB el turbo y 0,3 GB los embeddings fp16).
- GPU obligatoria para el codificador: en la Neural Engine la salida es incorrecta, con coseno por filas que baja hasta 0,66. El codificador debe ejecutarse en la GPU.
- Equipos probados: M5 Pro con 24 GB. No se especifican requisitos minimos para otros chips de la familia M.
- Opciones de despliegue: el runtime de referencia es Swift a traves del paquete FluidUse, con `UnlimitedOcrFastManager` (MLX) y `UnlimitedOcrManager` (Core ML). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: los valores publicados figuran en la seccion de benchmarks (aproximadamente 100 ms por pagina de codificacion, 3,0 s de prefill para 8 paginas y 200-270 tokens/s en MLX frente a unos 50 tokens/s en Core ML).
- Nota de eficiencia: el decodificador calcula los 64 expertos en cada token, por lo que lee los pesos de todos ellos en cada paso; esto limita el rendimiento y explica la ganancia de la ruta turbo con expertos en 4 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FluidInference/unlimited-ocr-mlx-coreml (esta ficha) | 3 B totales, aproximadamente 0,5 B activos | Buckets de prefijo de 384-2304 tokens mas anillo de 128; hasta 16 paginas por prompt | 8 bits (MLX y Core ML) y expertos a 4 bits en turbo | MIT | HuggingFace, runtime Swift en FluidUse |
| baidu/Unlimited-OCR (modelo base) | 3 B totales, aproximadamente 0,5 B activos | El mismo diseno multi-pagina descrito por el conversor | fp32 (referencia en CPU) | MIT | HuggingFace, requiere `trust_remote_code` |
| Ruta turbo incluida en este repositorio | 3 B totales, aproximadamente 0,5 B activos | Idem | Expertos enrutados a 4 bits, resto 8 bits | MIT | Incluida en el mismo repositorio |
| Decodificador Core ML incluido en este repositorio | 3 B totales, aproximadamente 0,5 B activos | Idem | 8 bits por bloque de 32, computo fp16 | MIT | Incluida en el mismo repositorio |

No se han encontrado en la informacion proporcionada comparaciones con otros sistemas de OCR (por ejemplo PaddleOCR, Tesseract o alternativas propietarias), por lo que esas comparativas quedan como no disponibles.

## Limitaciones y advertencias

- La cuantizacion agresiva degrada la calidad: un decodificador de 4 bits completo, no distribuido, diverge del resultado de referencia en el token 329, lo que indica que bajar de 8 bits en todo el decodificador no es seguro.
- La variante turbo (expertos a 4 bits) mantiene el texto dentro de aproximadamente un punto del decodificador de 8 bits, pero presenta diferencias pequenas en formulas y tablas; no es la opcion recomendada si la fidelidad de formulas es critica.
- El codificador no puede ejecutarse en la Neural Engine: su salida es incorrecta (coseno por filas hasta 0,66), lo que obliga a usar la GPU y limita el ahorro energetico.
- El decodificador Core ML es sensiblemente mas lento (aproximadamente 50 tokens/s) que las rutas MLX (200-270 tokens/s), por lo que no es adecuado para lotes grandes.
- La prohibicion de repeticion de 35-gramas heredada del modelo original puede suprimir repeticiones legitimas en documentos con texto repetitivo (plantillas, formularios o tablas de datos).
- Las coordenadas de maquetacion se expresan en el rango 0-999 y se han observado desviaciones de 1 unidad respecto a la referencia fp32, algo tolerable para resaltado pero no para mediciones exactas.
- Dependencia total del ecosistema Apple: no hay rutas documentadas para Linux, Windows o aceleradores NVIDIA, y el runtime exige macOS 15 o superior.
- No se especifican los idiomas soportados ni el comportamiento del modelo con documentos en castellano o en otras lenguas distintas de las usadas en el entrenamiento original.
- No se documentan sesgos conocidos, tasas de alucinacion en escaneos de baja calidad, ni el comportamiento con documentos manuscritos o degradados; estos datos figuran como no disponibles.
- La licencia MIT procede de Baidu y se mantiene en esta conversion, por lo que el uso comercial esta permitido, pero conviene verificar el fichero LICENSE original del modelo base.
- Se trata de un repositorio con 81 descargas, recien creado (2026-10-11) y actualizado dos dias despues; su madurez y soporte a largo plazo no estan contrastados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidInference/unlimited-ocr-mlx-coreml
- Modelo base de Baidu: https://huggingface.co/baidu/Unlimited-OCR
- Repositorio del runtime Swift (FluidUse): https://github.com/FluidInference/FluidUse
- Sitio del conversor: https://fluidinference.com
- No se han encontrado otros enlaces relevantes en la busqueda web: los resultados devueltos no guardan relacion con el modelo (contenido de foros y tiendas de DVD).
