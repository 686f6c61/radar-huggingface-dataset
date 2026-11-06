# lujihong/rapidocr-onnx

## Resumen

rapidocr-onnx es un repositorio de distribucion que aloja una copia byte a byte de los pesos ONNX del pipeline OCR de RapidOCR, en su variante PP-OCRv6 small. No es un modelo entrenado por el autor del repositorio (lujihong), sino un espejo de los activos oficiales publicados por RapidAI en ModelScope (version v3.9.2). El objetivo declarado es el autoalojamiento de los tres artefactos necesarios para el pipeline OCR de una aplicacion de escritorio de LaunchAI (浪起), con verificacion estricta de integridad mediante SHA256.

El paquete incluye tres ficheros: un modelo de deteccion de texto basado en DBNet (`PP-OCRv6_det_small.onnx`, unos 9,9 MB), un modelo de reconocimiento con cabeza CTC (`PP-OCRv6_rec_small.onnx`, unos 21,2 MB) que cubre 50 idiomas en un unico modelo unificado, y el diccionario de caracteres asociado (`ppocrv6_dict.txt`, 18.708 entradas no vacias). No se trata de un modelo generativo ni de un LLM: es un componente de vision por computador para extraccion de texto en imagenes.

Su relevancia practica reside en que RapidAI no mantiene un repositorio oficial equivalente en Hugging Face para los activos v6 (su cuenta `SWHL/RapidOCR` solo contiene modelos de clasificacion de orientacion PP-OCRv1/v3), por lo que este espejo facilita el acceso desde el ecosistema HF y desde mirrors regionales. Segun la model card, la eleccion de v6 small frente a v5 mobile se justifica por mejores metricas de reconocimiento (ExactMatch 0,8419 frente a 0,7355) con un coste computacional ligeramente inferior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Deteccion: DBNet. Reconocimiento: red CNN con cabeza CTC (PP-OCRv6 small) |
| Parametros totales | no disponible (pesos: 9.929.594 bytes deteccion + 21.234.383 bytes reconocimiento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo OCR, no secuencial generativo) |
| Tipos de cuantizacion | no disponible (los artefactos distribuidos son ONNX en precision original; no se documentan variantes cuantizadas en el repo) |
| Idiomas soportados | zh, en y multilingue (modelo de reconocimiento unificado para 50 idiomas) |
| Licencia | Apache-2.0 (heredada de RapidAI/RapidOCR) |
| Formato de pesos | ONNX (dos ficheros) + diccionario de texto plano UTF-8 |
| Tamano del repositorio | 0,0 GB reportado por HF (suma real de ficheros: ~31,2 MB) |
| Entrada del pipeline | Imagen (deteccion de cajas de texto + reconocimiento) |
| Diccionario | `ppocrv6_dict.txt`, 18.708 lineas no vacias, longitud de tabla 18.710 (blank + lineas + espacio半角) |

## Arquitectura y entrenamiento

El pipeline consta de dos etapas clasicas de PP-OCR. La primera es un detector DBNet (Differentiable Binarization Network), que produce un mapa de probabilidad de texto y lo binariza de forma diferenciable para segmentar regiones de texto en la imagen. La segunda es un reconocedor convolucional con cabeza CTC (Connectionist Temporal Classification), que transcribe cada region recortada a una secuencia de caracteres sin necesidad de alineamiento explicito. El reconocedor v6 es un modelo unificado que cubre 50 idiomas, lo que evita mantener un modelo por escritura.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de ajuste posteriores (RLHF, DPO u otras), ya que la model card del espejo no las documenta y remite a los activos upstream de RapidAI. La innovacion tecnica destacable es la consolidacion multilingue en un unico reconocedor y la mejora de exactitud de la generacion v6 small frente a v5 mobile con menor tiempo de inferencia, segun la evaluacion oficial de RapidOCR citada en la model card. El diccionario es inseparable del reconocedor: mezclarlo con el de v4 o v5 desalinea por completo la decodificacion CTC.

## Capacidades

- Deteccion de regiones de texto en imagenes (DBNet) con salida de cajas delimitadoras.
- Reconocimiento optico de caracteres sobre recortes de texto mediante decodificacion CTC.
- Cobertura multilingue con un unico modelo de reconocimiento para 50 idiomas, con especial soporte para chino y ingles.
- Procesamiento de documentos escaneados, capturas de pantalla y fotografias con texto.
- Ejecucion en CPU y GPU mediante runtime ONNX, sin dependencia de frameworks de deep learning pesados.
- Integracion determinista: los tres artefactos se validan por SHA256, lo que permite pipelines reproducibles.
- No soporta tool calling, function calling, razonamiento multi-paso ni generacion de texto: es exclusivamente un componente OCR.

## Casos de uso

- Digitalizacion de facturas y albaranes: el detector localiza las lineas de texto y el reconocedor las transcribe; la ventana de contexto no aplica, pero el pipeline procesa documentos completos por etapas y el modelo unificado evita cambiar de reconocedor segun el idioma de la factura.
- Extraccion de texto en aplicaciones de escritorio: al ser ONNX de ~31 MB en total, puede empaquetarse dentro de un instalador de escritorio y ejecutarse en CPU sin GPU dedicada, que es precisamente el escenario declarado por LaunchAI.
- Procesamiento de capturas de pantalla para automatizacion de UI: el detector DBNet maneja texto sobre fondos variados y el reconocedor CTC transcribe etiquetas de botones y campos, util para RPA.
- Indexacion de archivos PDF escaneados: el pipeline convierte paginas en imagenes, detecta y reconoce el texto, y alimenta un motor de busqueda; el soporte de 50 idiomas permite corpus mixtos sin modelos adicionales.
- Lectura de matriculas, carteles y senalizacion en aplicaciones de campo: el modelo small prioriza latencia baja, adecuado para dispositivos con recursos limitados.
- Preprocesado para pipelines de NLP: el OCR extrae texto que despues se envia a un LLM; la separacion de responsabilidades permite sustituir el OCR sin tocar el resto del sistema.
- Verificacion de integridad en entornos regulados: los SHA256 publicados permiten auditar que los pesos desplegados coinciden con los upstream, util en despliegues con requisitos de trazabilidad.

## Benchmarks y rendimiento

La model card cita la evaluacion oficial de RapidOCR para los activos ONNX, comparando v6 small con v5 mobile:

| Metrica | PP-OCRv6 small | PP-OCRv5 mobile |
|---|---|---|
| ExactMatch | 0,8419 | 0,7355 |
| CharMatch | 0,9515 | 0,9177 |
| Tiempo de inferencia | ligeramente inferior | referencia |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros), que ademas no aplican a un modelo OCR.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para el pipeline completo en precision original; los dos modelos ONNX suman unos 31 MB de pesos, por lo que el consumo lo domina el runtime y las imagenes de entrada, no los pesos.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (CUDA o TensorRT); no requiere A100 ni H100. Una RTX 4090 o incluso una GTX 1650 son sobradas para lotes grandes.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo e incluso en iGPU con ONNX Runtime.
- CPU: viable para uso interactivo en escritorio; el modelo small esta disenado para latencia baja.
- Opciones de despliegue: ONNX Runtime (CPU/CUDA/TensorRT), OpenVINO, y los wrappers de RapidOCR que consumen estos mismos artefactos. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo OCR.
- Latencia y throughput: no se publican cifras absolutas en la informacion disponible; solo la comparacion relativa de que v6 small es ligeramente mas rapido que v5 mobile en la evaluacion oficial.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rapidocr-onnx (PP-OCRv6 small) | DBNet + CTC ONNX | 50 (unificado) | ~31 MB | Apache-2.0 | HF (espejo), ModelScope (upstream) |
| PP-OCRv5 mobile | DBNet + CTC ONNX | multilingue (segun variante) | no disponible | Apache-2.0 | ModelScope / RapidOCR |
| SWHL/RapidOCR | clasificador de orientacion PP-OCRv1/v3 | no aplica | no disponible | no disponible | Hugging Face |
| Tesseract | OCR clasico (LSTM) | amplio, por paquetes de idioma | decenas de MB por idioma | Apache-2.0 | sistema / repos públicos |

Frente a PP-OCRv5 mobile, la version v6 small mejora ExactMatch y CharMatch con menor tiempo segun la evaluacion citada. Frente a Tesseract, el enfoque PP-OCR suele ser mas robusto en escenas naturales, aunque no se dispone de una comparacion directa en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no responde preguntas, no razona y no genera texto libre; solo transcribe lo que ve en la imagen.
- El diccionario es obligatorio y especifico de v6: usar `ppocrv6_dict.txt` con otro reconocedor, o viceversa, desalinea la decodificacion CTC por completo.
- El repositorio es un espejo, no el upstream: la responsabilidad de mantenimiento y actualizaciones recae en RapidAI; el autor no garantiza sincronizacion futura.
- La model card no documenta sesgos, tasas de alucinacion (concepto que no aplica igual en OCR, pero si los errores de transcripcion) ni limitaciones por tipo de escritura o calidad de imagen.
- El rendimiento en idiomas distintos del chino e ingles no esta cuantificado en la informacion disponible, pese a declararse soporte para 50 idiomas.
- Licencia Apache-2.0 permite uso comercial, pero conviene conservar los avisos de copyright del proyecto upstream RapidAI/RapidOCR.
- El repositorio reporta 0 descargas y 0 likes, y un tamano de 0,0 GB en HF pese a que los ficheros suman ~31 MB: conviene verificar los SHA256 tras la descarga antes de desplegar.
- No se documentan variantes cuantizadas (INT8, FP16) en el repo; quien necesite menor latencia debera cuantizar por su cuenta y revalidar la precision.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lujihong/rapidocr-onnx
- Upstream en ModelScope (RapidAI/RapidOCR v3.9.2): https://www.modelscope.cn/models/RapidAI/RapidOCR
- Cuenta de RapidAI en Hugging Face (solo clasificadores de orientacion PP-OCRv1/v3): https://huggingface.co/SWHL/RapidOCR
- Mirror de descarga: https://hf-mirror.com/lujihong/rapidocr-onnx
