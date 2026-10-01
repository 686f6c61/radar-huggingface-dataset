# Mohammed422/invoices-donut-model-v3

## Resumen

Mohammed422/invoices-donut-model-v3 es un ajuste fino del modelo Donut (Document Understanding Transformer) orientado a la extraccion de informacion estructurada de facturas. Se trata de un modelo vision-encoder-decoder de tipo image-text-to-text con 202.098.104 parametros (~202 M), publicado en HuggingFace por el usuario Mohammed422 bajo la libreria transformers y con pesos en formato safetensors. Su enfoque es OCR-free: procesa directamente la imagen del documento y genera texto estructurado sin depender de un motor OCR externo.

El modelo se apoya en la arquitectura Donut original, que combina un encoder visual Swin Transformer con un decoder autorregresivo tipo BART, tal como se refleja en la etiqueta vision-encoder-decoder y en el pipeline declarado. La etiqueta arxiv:1910.09700 asociada al repositorio corresponde a la cita que aparece en la plantilla automatica de model card (Lacoste et al., 2019, sobre emisiones de carbono) y no a la publicacion tecnica de Donut; conviene tenerlo en cuenta para no atribuir mal la procedencia.

La relevancia de este tipo de modelo radica en la automatizacion del procesamiento de facturas (invoice processing), un caso de uso empresarial habitual donde la extraccion de campos como numero de factura, fecha, emisor, lineas de detalle e importes totales suele consumir mucho tiempo manual. Sin embargo, la model card publicada esta sin completar (todo el contenido son marcadores "[More Information Needed]"), no declara licencia y no aporta datos de entrenamiento ni evaluacion, por lo que su adopcion en produccion exige una validacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (encoder visual y decoder autorregresivo, familia Donut) |
| Parametros totales | 202.098.104 (~202 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Tamano del repositorio | 8,9 GB |
| Descargas / likes en el momento del analisis | 0 / 0 |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Donut, una arquitectura vision-encoder-decoder disenada para comprension de documentos sin OCR. El encoder es un Swin Transformer que extrae caracteristicas visuales de la imagen de la pagina completa, y el decoder es un transformer autorregresivo de tipo BART que genera la secuencia de salida (tipicamente texto estructurado, como JSON) condicionada a esas caracteristicas. Este diseno omite el pipeline clasico de deteccion de texto, reconocimiento OCR y post-procesado, lo que reduce el numero de componentes y permite un entrenamiento extremo a extremo.

El autor no documenta en la model card ni la composicion del dataset de facturas, ni el numero de tokens o imagenes de entrenamiento, ni si hubo etapas de ajuste con RLHF/DPO. Tampoco se indica si el ajuste parte de naver-clova-ix/donut-base ni que hiperparametros se emplearon. No se declara ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, etc.). Toda la informacion relativa al procedimiento de entrenamiento figura como "[More Information Needed]" en el repositorio.

## Capacidades

- Extraccion de informacion de imagenes de facturas: el pipeline image-text-to-text permite generar texto estructurado (por ejemplo JSON con campos de cabecera y lineas de detalle) a partir de la imagen del documento.
- Procesamiento OCR-free: al no requerir un motor OCR externo, evita errores en cascada entre deteccion, reconocimiento y comprension.
- Generacion condicionada a imagen de documento: el encoder visual procesa la pagina completa como una unica entrada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas en el repositorio).
- Capacidades especiales (modo thinking, vision adicional, audio): no disponible.

## Casos de uso

- Digitalizacion masiva de facturas de proveedores: el modelo recibe la imagen o el PDF rasterizado de cada factura y devuelve un JSON con los campos relevantes, lo que permite volcar miles de documentos al sistema de gestion sin introduccion manual.
- Automatizacion de cuentas por pagar: integrado en un ERP, el modelo extrae numero de factura, fecha, NIF del emisor, base imponible, IVA y total para generar el asiento contable y disparar el flujo de aprobacion.
- Conciliacion de pedidos y albaranes: el sistema compara los campos extraidos de la factura con la orden de compra y marca discrepancias de importes o cantidades para revision humana.
- Archivo y busqueda documental: al convertir la factura en texto estructurado, se puede indexar el contenido y permitir busquedas por proveedor, importe o periodo.
- Extraccion de lineas de detalle para analitica de gasto: los campos de cada linea permiten clasificar el gasto por categoria, centro de coste o proyecto y alimentar cuadros de mando de compras.
- Validacion previa a la contabilizacion: el modelo puede usarse como primer filtro que detecta documentos incompletos o con formato desconocido y los deriva a cola de revision.
- Prototipado de soluciones de document understanding: dado su tamano contenido (~202 M), sirve como punto de partida para ajustes adicionales sobre dominios concretos de facturacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye seccion de evaluacion cumplimentada, no se declaran metricas (F1 por campo, precision de extraccion, CER/WER, etc.) y no se aporta conjunto de test. Tampoco hay informacion de latencia o throughput medida.

## Requisitos de hardware

Estimaciones derivadas del recuento de parametros (202.098.104) y de la sobrecarga tipica del encoder visual; el autor no publica cifras oficiales:

- Peso de los pesos en memoria: aproximadamente 0,8 GB en fp32, 0,4 GB en fp16/bf16, 0,2 GB en int8 y 0,1 GB en int4, sin contar activaciones ni el coste del encoder visual.
- VRAM estimada para inferencia: del orden de 1-2 GB en fp16 para una sola imagen, con margen para activaciones y para el procesado del documento a resolucion nativa.
- GPU consumer: si, cabe holgadamente en tarjetas con 6-8 GB de VRAM o mas (RTX 3060, RTX 4060, RTX 4090, etc.), incluso con varias instancias en paralelo.
- GPU de datacenter: A100, H100 o L40S son suficientes de sobra; se pueden ejecutar muchos procesos concurrentes en una sola GPU.
- Opciones de despliegue: transformers (VisionEncoderDecoderModel), HuggingFace Inference Endpoints (la etiqueta endpoints_compatible esta presente) y exportacion a ONNX Runtime. vLLM, llama.cpp, Ollama y TGI no tienen soporte documentado para esta arquitectura concreta en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Mohammed422/invoices-donut-model-v3 | 202 M | no disponible | no disponible | HuggingFace | Ajuste de facturas, model card sin completar |
| naver-clova-ix/donut-base | ~200 M | no disponible | MIT (repositorio original clovaai/donut) | HuggingFace | Modelo base de la familia Donut, sin ajuste de facturas |
| Mohammed422/invoices-donut-model-v1 | no disponible | no disponible | no disponible | HuggingFace | Version anterior del mismo autor |
| scharnot/donut-invoices | no disponible | no disponible | no disponible | HuggingFace | Ajuste de Donut para facturas de otro autor |

Los datos de rendimiento comparado no estan disponibles en la informacion consultada.

## Limitaciones y advertencias

- La licencia no esta declarada en el repositorio, por lo que no se puede confirmar si se permite el uso comercial. Es imprescindible aclararlo antes de desplegarlo en produccion.
- La model card esta practicamente vacia: no hay informacion sobre datos de entrenamiento, procedencia del dataset, sesgos potenciales ni limitaciones conocidas.
- No se declaran idiomas soportados, de modo que no se puede garantizar el funcionamiento con facturas en castellano u otros idiomas distintos del usado implicitamente en el ajuste.
- No hay resultados de evaluacion publicados, por lo que se desconoce la precision real de extraccion campo a campo.
- Riesgo de alucinacion en la generacion estructurada: el decoder autorregresivo puede producir valores plausibles pero incorrectos (importes, NIF o fechas inventados) cuando la imagen es ilegible o el formato es atipico. Se recomienda validacion cruzada y reglas de coherencia antes de contabilizar.
- El repositorio tiene 0 descargas y 0 likes, sin historial de uso que permita inferir su fiabilidad ni su estado de mantenimiento.
- El tamano del repositorio (8,9 GB) es muy superior al de los pesos del modelo en fp32 (~0,8 GB), lo que sugiere la presencia de artefactos adicionales (posibles checkpoints, estados de optimizador u otros ficheros) no documentados.
- La etiqueta arxiv:1910.09700 corresponde a la cita de la plantilla de model card (Lacoste et al., 2019) y no a un paper propio del modelo; no debe usarse como referencia tecnica.
- Al ser un modelo especializado en un unico tipo de documento, su rendimiento fuera del dominio de facturas (contratos, informes, formularios genericos) es altamente incierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mohammed422/invoices-donut-model-v3
- Version anterior del mismo autor: https://huggingface.co/Mohammed422/invoices-donut-model-v1
- Ajuste de Donut para facturas de otro autor: https://huggingface.co/scharnot/donut-invoices
- Repositorio de extraccion de facturas con Donut: https://github.com/vanshkapadia11/Invoice-Extraction-AI
- Guia de ajuste fino de Donut: https://www.freecodecamp.org/news/how-to-fine-tune-the-donut-model/
- Ficha de Donut en Promptha: https://promptha.com/models/donut
- Referencia citada en la etiqueta del repositorio (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
