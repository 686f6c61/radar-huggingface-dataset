# astrocyte-productions/PaddleOCR-VL-1.6-bf16

## Resumen

PaddleOCR-VL-1.6-bf16 es una conversión a formato MLX del modelo PaddlePaddle/PaddleOCR-VL-1.6, un modelo de visión-lenguaje de aproximadamente 0,9 mil millones de parámetros (905.601.648 exactos) especializado en lectura de texto presente en imágenes. La conversión la publica astrocyte-productions, un tercero ajeno al equipo de PaddleOCR, con el objetivo de que el modelo funcione en Apple Silicon mediante la librería `mlx-vlm`. No hay reentrenamiento ni ajuste fino: los pesos son los del modelo original almacenados en el layout de MLX y en precisión completa bf16.

El problema que resuelve es concreto: hasta la publicación de este repositorio no existía una build MLX de la versión 1.6, lo que impedía usar el modelo en Macs sin recurrir a PyTorch o a una GPU dedicada. El autor lo necesita para su propio worker de codificación de vídeo, que lee texto incrustado en fotogramas (cartelas, títulos, créditos y bumpers) para localizar cortes publicitarios. Según sus pruebas internas, la versión 1.6 lee ese texto mejor que la 1.5, y descartó una build de 4 bits porque la de bf16 resultaba más precisa en la misma tarea.

La relevancia es, por tanto, práctica y acotada: no es un modelo nuevo ni un avance arquitectónico, sino una distribución lista para ejecutar en local de un OCR visual pequeño. La licencia Apache 2.0 del modelo original se mantiene, lo que facilita su uso comercial, y la conversión es reproducible byte a byte a partir de una revisión fija del modelo upstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje (image-text-to-text) especializado en OCR; implementación `paddleocr_vl` con código propio en `mlx-vlm`; detalles internos de la arquitectura no disponibles |
| Parámetros totales | 905.601.648 (~0,9 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Solo bf16 sin cuantizar; el repositorio no publica variantes de 4 u 8 bits (el autor menciona haber valorado una build de 4 bits, descartada por menor precisión) |
| Idiomas soportados | en, zh y multilingual (cobertura exacta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en layout MLX, bf16 (500 tensores; `model.safetensors` de 1.811.260.812 bytes, 1,69 GiB) |
| Tamaño del repositorio | 1,8 GB |
| Librería de inferencia | `mlx-vlm` (convertido con `mlx-vlm` 0.7.2 y `mlx` 0.32.2) |
| Modelo base | `PaddlePaddle/PaddleOCR-VL-1.6`, revisión `c5630abae1d940eafe0697512a0325494b02ab42` |
| SHA-256 de los pesos | `f72e51bc81f035c3e50d1351cff78393f3906577c659e3bde6b653ede29f8af9` |
| Tipo de conversión | Solo cambio de formato y de precisión de almacenamiento; sin ajuste fino |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del modelo, más allá de identificarlo como un modelo de visión-lenguaje para OCR con identificador de arquitectura `paddleocr_vl` y código de modelado propio (`modeling_paddleocr_vl.py`, `configuration_paddleocr_vl.py`, `processing_paddleocr_vl.py`, `image_processing_paddleocr_vl.py`). `mlx-vlm` ejecuta el modelo con su propia implementación de PaddleOCR-VL, pero conserva los ficheros Python del upstream porque el tokenizador puede cargarse con código remoto habilitado. Cualquier dato sobre el encoder visual, el decodificador de lenguaje, la longitud de contexto nativa o el esquema de atención debe consultarse en la model card del modelo original, que no forma parte de la información disponible.

Tampoco hay información sobre el entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo RLHF o DPO. La única innovación técnica documentada en este repositorio es la propia conversión: se ejecutó `mlx_vlm convert` sobre una instantánea local fijada a la revisión `c5630abae1d940eafe0697512a0325494b02ab42`, con `--dtype bfloat16` y sin `--trust-remote-code`. El resultado son 500 tensores, 905.601.648 parámetros y un fichero de 1.811.260.812 bytes; repetir el proceso sobre la misma instantánea produce ficheros idénticos byte a byte, lo que hace la build auditable y verificable mediante el SHA-256 publicado.

## Capacidades

- Lectura de texto en imágenes (OCR) mediante el prompt de texto plano `OCR:`, que es el que documenta el modelo upstream.
- Extracción de texto incrustado en fotogramas de vídeo: cartelas, títulos, créditos, bumpers y rótulos, caso de uso original para el que se publicó esta conversión.
- Interfaz conversacional de imagen a texto (`image-text-to-text`), con plantilla de chat incluida sin modificaciones.
- Soporte de inglés y chino documentado, más una etiqueta genérica `multilingual` sin desglose de cobertura.
- Ejecución local en Apple Silicon mediante `mlx-vlm`, sin dependencia de CUDA.
- No hay documentación sobre tool calling o function calling en la información disponible.
- No hay documentación sobre uso como agente, razonamiento multi-paso ni modo de pensamiento (*thinking mode*).
- No se documentan capacidades de audio, vídeo nativo ni generación de imagen.

## Casos de uso

- Detección de cortes publicitarios en vídeo: el worker de codificación lee el texto quemado en fotogramas (slates, cartelas de título, créditos y bumpers) y usa esa señal para localizar los bloques de publicidad. Es el caso para el que se creó la build y el que el autor cita como validación.
- Digitalización de documentos escaneados en local: facturas, albaranes o formularios procesados en un Mac sin enviar las imágenes a un servicio externo, lo que simplifica el cumplimiento de protección de datos.
- Indexación y búsqueda de archivos audiovisuales: extraer el texto en pantalla de cada fotograma clave y volcarlo a un índice de búsqueda permite recuperar un clip por un rótulo, un titular o un crédito concreto.
- Accesibilidad y subtitulado: generar una transcripción del texto en pantalla para describir contenido visual a personas con discapacidad visual o para alimentar pistas de subtítulos descriptivos.
- Verificación de cumplimiento en piezas gráficas: comprobar de forma automatizada que una creatividad incluye el texto legal obligatorio (deslinde, condiciones, precio) antes de publicarla.
- Archivística y documentación de patrimonio: catalogar diapositivas, fotografías de cartelería o fotogramas de archivo extrayendo el texto visible como metadato asociado a cada pieza.
- Prototipado rápido en portátil: validar un pipeline de OCR visual completo en un MacBook antes de invertir en infraestructura con GPU, gracias a que los pesos bf16 ocupan 1,69 GiB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de métricas específicas de OCR (CER, WER, precisión por conjunto de datos), y remite a la model card del modelo upstream para entrenamiento, benchmarks y citación.

La única afirmación de rendimiento es cualitativa: el autor indica que PaddleOCR-VL 1.6 leyó el texto de sus fotogramas mejor que la versión 1.5 en sus pruebas, y que la build en bf16 fue más precisa que una build de 4 bits en la misma tarea. No se aportan números, tamaños de muestra ni metodología.

## Requisitos de hardware

- Pesos: 1,69 GiB en bf16 (1.811.260.812 bytes). Estimación de memoria en inferencia: entre 2,5 y 4 GB de memoria unificada, sumando activaciones, buffers de imagen y caché KV; es una estimación, no un dato publicado.
- Plataforma soportada: Apple Silicon con `mlx-vlm` 0.7.2 o superior y `mlx` 0.32.2 o superior. Cualquier Mac con 8 GB o más de memoria unificada debería poder cargarlo, dado el tamaño de los pesos.
- GPU NVIDIA, AMD o Intel: no soportadas directamente por esta build, que es específica de MLX. Para CUDA habría que usar el modelo upstream en PyTorch o generar una conversión propia.
- Opciones de despliegue: `mlx-vlm` (librería con la que se convirtió y se documenta el uso). No se incluyen artefactos GGUF, plantillas de vLLM, TGI ni Ollama en el repositorio.
- Latencia y throughput: no disponibles. No se publican tiempos por imagen ni tokens por segundo en ninguna configuración de hardware.
- Precaución operativa: el tokenizador puede requerir código remoto, por lo que conviene descargar el repositorio fijando una `revision` concreta y no la rama `main`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| `astrocyte-productions/PaddleOCR-VL-1.6-bf16` | 905.601.648 | No disponible | safetensors MLX bf16 / Apple Silicon | Apache 2.0 | Conversión de terceros, sin ajuste fino, reproducible por SHA-256 |
| `PaddlePaddle/PaddleOCR-VL-1.6` (upstream) | No disponible en la información | No disponible | Pesos originales en PyTorch / CUDA y CPU | Apache 2.0 | Fuente de la conversión; su model card contiene entrenamiento y benchmarks |
| PaddleOCR-VL 1.5 | No disponible | No disponible | No disponible | No disponible | Versión anterior citada por el autor; solo se afirma que 1.6 lee mejor, sin cifras |
| Build MLX de 4 bits (valorada, no publicada) | ~0,9 B (equivalente) | No disponible | MLX 4 bits / Apple Silicon | Apache 2.0 (presumible) | Descartada por el autor por menor precisión de lectura; no está en el repositorio |

No hay datos suficientes para comparar con otras familias de OCR visual (por ejemplo GOT-OCR2.0 o modelos de visión-lenguaje de tamaño similar) en parámetros, contexto o métricas de precisión: esa información no está disponible.

## Limitaciones y advertencias

- Modelo especializado: está pensado para leer texto en imágenes. No debe emplearse como asistente general, para razonamiento complejo ni para generación de código.
- Idiomas: solo inglés y chino están documentados; la etiqueta `multilingual` no viene acompañada de una lista de idiomas ni de métricas por lengua, así que el rendimiento en castellano es desconocido.
- Riesgo de alucinación: como todo modelo generativo aplicado a OCR, puede producir texto plausible que no aparece en la imagen, especialmente con capturas borrosas, baja resolución, fondos complejos o tipografías decorativas. Conviene validar la salida en flujos críticos.
- Longitud de contexto desconocida: no se publica la ventana nativa, por lo que documentos largos o imágenes de alta resolución pueden requerir troceado previo y no hay garantía sobre el comportamiento en entradas extensas.
- Dependencia de código remoto: los ficheros Python del upstream se incluyen sin modificar y el tokenizador puede cargarse con código remoto habilitado. Es un riesgo de cadena de suministro; hay que fijar una revisión concreta, revisar el código y no descargar desde `main`.
- Precisión frente a memoria: la build bf16 ocupa el doble que una de 4 bits. En Macs con poca memoria unificada puede ser necesario recurrir a otra conversión, que este repositorio no ofrece.
- Licencia: Apache 2.0 permite uso comercial y modificación, siempre conservando el aviso de licencia y la atribución. El `LICENSE` del upstream se copia sin cambios; todo el mérito del modelo corresponde al equipo de PaddleOCR.
- Validación comunitaria mínima: el repositorio no tiene descargas ni valoraciones en el momento de la consulta, y no se han publicado evaluaciones independientes de esta conversión concreta.
- Diferencias con el upstream: cualquier problema de calidad, sesgo o comportamiento del modelo proviene del modelo original; esta publicación solo cambia el formato y la precisión de almacenamiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/astrocyte-productions/PaddleOCR-VL-1.6-bf16
- Modelo upstream: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
- Revisión exacta del upstream usada en la conversión: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6/tree/c5630abae1d940eafe0697512a0325494b02ab42
- Librería de inferencia `mlx-vlm`: https://github.com/Blaizzy/mlx-vlm
- Los resultados de búsqueda web proporcionados tratan sobre astrocitos (biología celular) y no guardan relación con este modelo; no se han encontrado papers, blogs ni demos adicionales en la información disponible.
