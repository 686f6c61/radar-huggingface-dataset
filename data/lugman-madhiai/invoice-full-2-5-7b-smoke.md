# lugman-madhiai/invoice-full-2.5-7B-smoke

## Resumen

El modelo `lugman-madhiai/invoice-full-2.5-7B-smoke` es un ajuste fino (finetune) del modelo multimodal `unsloth/Qwen2.5-VL-7B-Instruct`, publicado por el usuario de HuggingFace lugman-madhiai bajo licencia Apache 2.0. Se trata de un modelo de vision-lenguaje (image-text-to-text) orientado a la extraccion de datos estructurados a partir de documentos, segun se deduce del nombre del repositorio y del resto de publicaciones del mismo autor, entre las que figura `lugman-madhiai/Qwen2.5-VL-7B-invoice-extraction`. La model card del repositorio es la plantilla generada automaticamente por Unsloth y no documenta el conjunto de datos, el procedimiento de entrenamiento ni resultados de evaluacion.

El modelo hereda la arquitectura de Qwen2.5-VL: un codificador visual tipo ViT con atencion por ventanas y resolucion dinamica nativa, acoplado a un decodificador de lenguaje de la familia Qwen2.5 con atencion completa y codificacion posicional M-RoPE (que incluye componentes temporales absolutos). El sufijo "smoke" del identificador sugiere que se trata de una ejecucion de prueba de humo (smoke test) para validar el pipeline de entrenamiento, mas que de un checkpoint entrenado y evaluado en profundidad. El repositorio registra cero descargas y cero "likes", y las marcas de tiempo de creacion y ultima actualizacion (2026-09-24T23:38:03 y 2026-09-24T23:38:09) distan seis segundos, lo que refuerza la hipotesis de publicacion de prueba.

Su relevancia practica es limitada tal y como esta publicado: sirve como referencia de un flujo de fine-tuning de Qwen2.5-VL con Unsloth y TRL para tareas de extraccion documental, pero no se debe desplegar en produccion sin una evaluacion propia, dado que no hay evidencia publicada de su calidad, su dataset ni su comportamiento fuera del idioma ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador visual ViT + decodificador de lenguaje Qwen2.5), familia `qwen2_5_vl` |
| Parametros totales | 7B segun la denominacion del modelo base; no se detalla el desglose en la informacion disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada para este finetune (el modelo base Qwen2.5-VL-7B-Instruct declara 128K tokens; no confirmado para este checkpoint) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos `safetensors`; no se listan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | `en` (ingles) segun los metadatos del repositorio |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Pipeline declarado | image-text-to-text |
| Modelo base | unsloth/Qwen2.5-VL-7B-Instruct |
| Fecha de publicacion (metadatos de HuggingFace) | 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-VL-7B-Instruct: un modelo de vision-lenguaje compuesto por un codificador visual ViT que procesa la imagen con resolucion dinamica nativa y atencion por ventanas para limitar el coste computacional en imagenes de alta resolucion, y un decodificador de lenguaje autorregresivo de la familia Qwen2.5 con atencion completa. La conexion entre ambos modulos se realiza mediante un proyector que mapea las caracteristicas visuales al espacio de embeddings del decodificador. El modelo incorpora M-RoPE (Multimodal Rotary Position Embedding), que descompone la codificacion posicional en componentes temporales, de altura y de anchura, lo que permite manejar de forma consistente imagenes de distinta resolucion y secuencias de video.

Respecto al entrenamiento, la unica informacion aportada por el autor es que el modelo se entreno "2x faster" con Unsloth y la libreria TRL de HuggingFace. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la estrategia de ajuste (LoRA/QLoRA frente a ajuste completo), la existencia de fases de RLHF o DPO, ni los hiperparametros empleados. Tampoco se documenta ninguna innovacion tecnica especifica de este finetune mas alla del uso de las herramientas citadas. El identificador del repositorio ("smoke") y las marcas temporales de publicacion apuntan a una ejecucion de validacion del pipeline mas que a un entrenamiento completo.

## Capacidades

- Generacion de texto conversacional y respuesta a instrucciones heredada del modelo base Qwen2.5-VL-7B-Instruct.
- Comprension de imagenes (image-text-to-text): lectura de documentos, graficos, tablas y capturas.
- Extraccion de informacion estructurada de documentos, presumiblemente centrada en facturas, segun el nombre del repositorio y las otras publicaciones del autor; no verificado con datos publicados.
- OCR implicito de texto impreso en imagenes, incluidas variantes de baja calidad habituales en documentos escaneados, segun las capacidades del modelo base.
- Localizacion de elementos mediante coordenadas y cajas delimitadoras en la imagen (capacidad de grounding documental del modelo base).
- Soporte de tool calling y function calling en el modelo base Qwen2.5-VL-Instruct; no se ha verificado que se conserve intacto tras este ajuste fino.
- Capacidades de agente y razonamiento multi-paso en el modelo base; sin validacion publicada en este checkpoint.
- Capacidades multilingues del modelo base (Qwen2.5-VL cubre decenas de idiomas); los metadatos de este repositorio declaran unicamente `en`, por lo que el comportamiento en castellano no esta documentado.
- Modo "thinking" o razonamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Extraccion de campos de facturas a JSON para integracion en un ERP: el modelo recibe la imagen o el render de la factura y devuelve un objeto estructurado con numero de factura, emisor, NIF/CIF, base imponible, IVA y total, que el sistema de destino valida y persiste.
- Digitalizacion de archivos historicos escaneados: al tratarse de un modelo multimodal con OCR implicito, permite procesar documentos sin capa de texto (escaneos, fotocopias, fax) donde un extractor basado solo en texto fallaria.
- Automatizacion de cuentas a pagar: el modelo se integra en un flujo que clasifica el documento, extrae los datos de pago, los contrasta con el pedido de compra y marca incidencias para revision humana antes de autorizar el pago.
- Conciliacion contable y deteccion de discrepancias: comparar los importes extraidos de factura, albaran y pedido permite detectar desviaciones de precio o cantidades; el modelo actua como extractor fiable dentro de un pipeline determinista que realiza la comparacion.
- Procesamiento de lotes masivos en un servicio de IDP (Intelligent Document Processing): desplegado con vLLM o TGI sobre GPU, el modelo puede servir peticiones concurrentes de extraccion como microservicio interno.
- Digitalizacion de documentacion financiera adyacente: notas de credito, recibos, tickets de gasto y extractos bancarios, reutilizando el mismo prompt de extraccion estructurada.
- Asistente interno de consulta sobre documentos: ante una pregunta del tipo "cual fue el importe facturado por este proveedor en esta factura", el modelo responde citando el dato leido directamente de la imagen.
- Generacion de conjuntos de datos etiquetados: uso del checkpoint para preanotar facturas que luego se corrigen manualmente y alimentan un ciclo de reentrenamiento supervisado.
- Auditoria de cumplimiento: verificacion de que una factura contiene los campos obligatorios (identificacion fiscal, fecha, desglose de impuestos) y marcado de las que no los cumplen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye ninguna tabla de evaluacion, y la busqueda web no aporta metricas de este checkpoint concreto. Cualquier cifra sobre precision de extraccion de campos, F1 por campo o latencia requeriria una evaluacion propia sobre un conjunto de validacion representativo del dominio objetivo.

## Requisitos de hardware

- VRAM estimada para inferencia, por precision (solo pesos, sin cache KV):
  - BF16/FP16: en torno a 15-16 GB.
  - FP8 o INT8: en torno a 8-9 GB.
  - INT4 (por ejemplo, GGUF Q4_K_M): en torno a 5-6 GB.
- El coste real es superior al de un modelo de solo texto del mismo tamano: las imagenes de resolucion dinamica generan miles de tokens visuales, y la cache KV a 128K tokens de contexto puede anadir varios gigabytes adicionales, proporcionales al numero de documentos en vuelo.
- GPU recomendadas: NVIDIA A100 40/80 GB, H100, L40S o RTX 6000 Ada para servicio en BF16 con contexto largo y concurrencia; RTX 4090 (24 GB) o A6000 (48 GB) para inferencia en BF16 de una sola peticion o lotes pequenos.
- Cabe en GPU de consumo: si, en cuantizacion INT4 con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). En BF16 requiere al menos 24 GB (RTX 3090, RTX 4090).
- Opciones de despliegue: vLLM y TGI (soportan la arquitectura `qwen2_5_vl`), llama.cpp/Ollama con el proyector multimodal correspondiente (si se generan los GGUF, actualmente no publicados en el repositorio), y `transformers` con `AutoProcessor`/`AutoModelForVision2Seq` para prototipos. El entrenamiento o el reajuste se puede realizar con Unsloth y TRL, como indica el autor.
- Latencia y throughput estimados: no disponible en la informacion proporcionada. No se han publicado mediciones de tokens por segundo ni de tiempo de procesamiento por documento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lugman-madhiai/invoice-full-2.5-7B-smoke | 7B (denominacion) | No disponible | Imagen + texto | Apache 2.0 | Repositorio HuggingFace, 0 descargas |
| unsloth/Qwen2.5-VL-7B-Instruct (base) | 7B (denominacion) | 128K tokens declarados por la familia | Imagen + texto | Apache 2.0 | Ampliamente disponible y contrastado |
| lugman-madhiai/Qwen2.5-VL-7B-invoice-extraction | 7B (denominacion) | No disponible | Imagen + texto | No disponible en la informacion recogida | Repositorio HuggingFace, integrable via FriendliAI |

No se dispone de datos verificados de rendimiento de ninguno de los tres checkpoints en la informacion proporcionada, por lo que la comparativa se limita a parametros, modalidad y licencia. Existen otras familias orientadas a la extraccion documental (por ejemplo, modelos OCR-free tipo Donut o modelos especializados en extraccion estructurada), pero no se incluyen cifras porque no forman parte de la informacion recogida.

## Limitaciones y advertencias

- Repositorio sin evidencia de uso: cero descargas y cero "likes" en el momento de la consulta; no hay informes independientes de calidad.
- Model card generica: es la plantilla automatica de Unsloth. No se documentan dataset, numero de pasos, hiperparametros, estrategia de ajuste ni criterios de evaluacion.
- Posible checkpoint de prueba: el sufijo "smoke" y una ventana de publicacion de seis segundos entre creacion y actualizacion sugieren una ejecucion de validacion, no un modelo final.
- Riesgo de alucinacion en campos extraidos: al ser un modelo generativo, puede inventar numeros de factura, importes o fechas plausibles pero incorrectos. Es imprescindible validar los campos con reglas deterministas (digitos de control del NIF, coherencia base + IVA = total, formatos de fecha) antes de persistir datos.
- Ambito declarado en ingles: los metadatos solo listan `en`. El rendimiento con facturas en castellano, con nomenclatura fiscal espanola (NIF, CIF, IVA, IRPF) o con proveedores regionales, no esta documentado.
- Sin datos de robustez: no se conoce el comportamiento ante rotaciones, sellos, firmas manuscritas, tablas anidadas o documentos de varias paginas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, redistribucion y modificacion, siempre que se conserve el aviso de licencia y se indiquen los cambios. Al derivar de Qwen2.5-VL, conviene revisar la licencia original del modelo base para confirmar que no anade condiciones adicionales.
- Caveat operativo: la ausencia de cuantizaciones publicadas obliga a generarlas internamente si se quiere desplegar en hardware de gama media, y a verificar que la calidad de extraccion se mantiene tras la cuantizacion.
- Aviso de atribucion: si se utiliza en produccion, no se debe presentar como un modelo validado ni citar metricas inexistentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lugman-madhiai/invoice-full-2.5-7B-smoke
- Perfil del autor: https://huggingface.co/lugman-madhiai
- Modelo hermano del mismo autor: https://huggingface.co/lugman-madhiai/Qwen2.5-VL-7B-invoice-extraction
- Ficha del modelo hermano en FriendliAI: https://friendli.ai/models/lugman-madhiai/Qwen2.5-VL-7B-invoice-extraction
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-VL-7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Articulo sobre inferencia base de Qwen2.5-VL-7B para extraccion de facturas: https://medium.com/@shrinath.suresh/baseline-qwen-2-5-vl-7b-invoice-extraction-part-3-67d261705f94
- Proyecto de extraccion de facturas con OCR y LLM: https://github.com/Ay7753/invoice-extractor
