# lugman-madhiai/invoice-split-2022

## Resumen

`lugman-madhiai/invoice-split-2022` es un ajuste fino del modelo multimodal `unsloth/Qwen3-VL-8B-Instruct`, publicado por el usuario lugman-madhiai en Hugging Face. Es un modelo de tipo image-text-to-text: acepta imagenes y texto como entrada y genera texto, con 8 767 123 696 parametros (≈8,77 B) almacenados en safetensors y un repositorio de 17,5 GB. Se distribuye bajo licencia Apache 2.0 y el unico idioma declarado en la model card es el ingles.

El nombre del modelo y la existencia de otro repositorio del mismo autor (`invoice-structured-extraction`) apuntan a un uso previsto de tratamiento de facturas y documentos, probablemente segmentacion o extraccion de informacion a partir de imagenes de documentos. Sin embargo, la model card no documenta la tarea concreta, el conjunto de datos de entrenamiento, los hiperparametros ni ningun proceso de evaluacion, por lo que esa finalidad es una inferencia razonable a partir del nombre, no un dato confirmado.

El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha (creado el 24 de septiembre de 2026 segun los metadatos del repositorio) y no incluye resultados de benchmarks. Su relevancia practica es limitada: se trata de un fine-tune no validado por la comunidad, sin evaluacion publicada y sin cuantizaciones listas para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (codificador visual + decodificador Qwen3 denso), heredada del modelo base; no detallada en la model card |
| Parametros totales | 8 767 123 696 (≈8,77 B, dato de safetensors) |
| Parametros activos | No aplica: el modelo base es denso, no MoE |
| Longitud de contexto | No disponible en la model card ni en los metadatos del repositorio (el modelo base Qwen3-VL-8B-Instruct declara 256 000 tokens segun su documentacion oficial, dato no confirmado para este fine-tune) |
| Tipos de cuantizacion | No disponible: solo se publican pesos en safetensors (precision completa, ≈17,5 GB) |
| Idiomas soportados | `en` (ingles) declarado en la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 17,5 GB) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3-VL-8B-Instruct`, un modelo de vision-lenguaje de la familia Qwen3-VL con unos 8,77 B de parametros totales, que combina un codificador visual con un decodificador de lenguaje tipo Qwen3. Este ajuste fino conserva esa arquitectura; el repositorio no incluye ningun cambio estructural respecto al modelo base.

Segun la model card, el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, con la afirmacion de ser "2 veces mas rapido" gracias a Unsloth. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si se aplico RLHF o DPO, ni si se congelaron capas del codificador visual durante el ajuste. Tampoco se documentan hiperparametros (learning rate, epocas, rango LoRA o si fue un ajuste completo). Toda esta informacion figura como no disponible.

## Capacidades

- Generacion de texto e interaccion conversacional (etiqueta `conversational` en el repositorio).
- Entrada multimodal image-text-to-text: procesa imagenes junto con instrucciones en lenguaje natural.
- Comprension de documentos e imagenes heredada del modelo base: lectura de texto en imagenes, interpretacion de tablas y campos de formularios, segun las capacidades declaradas por Qwen para la familia Qwen3-VL (no verificadas especificamente en este fine-tune).
- Respuesta a instrucciones y formato de salida conversacional en ingles.
- Soporte de tool calling / function calling: no disponible en la informacion del repositorio; el modelo base lo soporta, pero no hay confirmacion para este ajuste.
- Soporte de agentes y razonamiento multi-paso: no disponible ni documentado.
- Capacidades multilingues: no, el unico idioma declarado es el ingles.
- Modo thinking o razonamiento explicito: no disponible (la variante base citada es la Instruct, no la Thinking).

## Casos de uso

- Extraccion de campos de facturas y albaranes en imagenes: el modelo puede recibir la fotografia o el escaneo de una factura y devolver los campos clave (numero, fecha, emisor, base imponible, IVA, total) en formato estructurado, aprovechando su naturaleza image-text-to-text.
- Segmentacion de documentos multipagina: deteccion de la frontera entre transacciones distintas dentro de un unico PDF convertido a imagen, para separar cada factura en un registro independiente en un sistema de gestion documental.
- Clasificacion de documentos contables: etiquetado automatico de imagenes de documentos como factura, recibo, nota de credito o presupuesto antes de enviarlos a un flujo de aprobacion.
- Digitalizacion de archivos historicos: procesamiento por lotes de escaneos de baja calidad para convertirlos en registros de texto consultables, con revision humana posterior dado el riesgo de alucinacion en campos numericos.
- Enriquecimiento de datos para ERP: generacion de JSON o CSV intermedios que alimenten un sistema de cuentas por pagar, siempre con validacion de totales contra el documento original.
- Asistente de revision de gastos: consultas conversacionales sobre un conjunto de imagenes de recibos (por ejemplo, "que proveedor aparece en el documento con fecha mas reciente") en un chat interno.
- Prototipado rapido de pipelines de vision-lenguaje: al estar basado en Qwen3-VL, sirve como punto de partida para experimentar con ajuste fino sobre dominios documentales propios mediante Unsloth y TRL.

Ninguno de estos casos esta validado por el autor: no hay ejemplos de uso, demos ni metricas publicadas en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (ni MMLU, ni HumanEval, ni GSM8K, ni metricas de OCR o de extraccion de documentos) ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada en bf16/fp16 (pesos completos): unos 17,5 GB solo para los pesos, mas overhead de activaciones y cache KV. En la practica, entre 20 y 24 GB para imagenes de resolucion moderada, y mas si se procesan imagenes de alta resolucion o varias imagenes por prompt.
- VRAM estimada en cuantizacion INT8: aproximadamente 9-11 GB.
- VRAM estimada en cuantizacion INT4 (NF4, AWQ o GPTQ): aproximadamente 5,5-7 GB, aunque estas cuantizaciones no estan publicadas y habria que generarlas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para bf16 con margen; RTX 4090 (24 GB) funciona al limite en bf16 con imagenes pequenas.
- GPU de consumo: cabe en una RTX 3090 o RTX 4090 en bf16 con contexto reducido; en cuantizacion de 4 bits cabria en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070. Por debajo de 8 GB de VRAM no es realista por el coste adicional del codificador visual.
- Opciones de despliegue: transformers (declarado en el repositorio), text-generation-inference (etiqueta del repositorio) y vLLM, que soporta la familia Qwen3-VL. Para llama.cpp u Ollama seria necesario convertir los pesos a GGUF, formato que no se publica.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de las filas de alternativas provienen de la documentacion publica de sus fabricantes y no se han verificado en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `lugman-madhiai/invoice-split-2022` | 8,77 B | No disponible en el repositorio | Apache 2.0 | Solo safetensors; 0 descargas, 0 likes |
| `unsloth/Qwen3-VL-8B-Instruct` (modelo base) | ≈8,77 B | 256 000 tokens (documentacion de Qwen) | Apache 2.0 | Pesos oficiales, ampliamente soportado |
| `Qwen/Qwen2.5-VL-7B-Instruct` | ≈8,3 B | 128 000 tokens (documentacion de Qwen) | Apache 2.0 | Pesos oficiales, multiples cuantizaciones |
| `meta-llama/Llama-3.2-11B-Vision-Instruct` | 11 B | 128 000 tokens (documentacion de Meta) | Licencia comunitaria Llama 3.2 | Pesos oficiales, acceso condicionado |

La diferencia fundamental entre este fine-tune y las alternativas no esta en las especificaciones, que hereda integras del modelo base, sino en la ausencia de evaluacion, de cuantizaciones y de validacion por parte de la comunidad.

## Limitaciones y advertencias

- Model card practicamente vacia: no documenta dataset, hiperparametros, epocas ni metodo de entrenamiento, lo que impide reproducir el ajuste o auditar su comportamiento.
- Sin benchmarks ni evaluacion publicada: no hay evidencia de que mejore al modelo base en la tarea para la que aparentemente fue entrenado.
- Riesgo de sobreajuste al dominio: un ajuste fino sobre un corpus reducido de facturas de un ano concreto (2022, segun el nombre) puede degradar la capacidad general del modelo y el rendimiento fuera de ese formato de documento.
- Riesgo de alucinacion en campos estructurados: en extraccion de importes, fechas o identificadores fiscales, un error silencioso puede tener consecuencias contables; se recomienda validacion automatica y revision humana.
- Idioma: solo se declara ingles. El rendimiento en castellano no esta garantizado y podria degradarse notablemente respecto al modelo base, mas multilingue.
- Sesgos: no disponibles. Al no documentarse la procedencia de los datos, no es posible evaluar sesgos de dominio, geograficos o de idioma.
- Licencia: Apache 2.0, lo que permite uso comercial y modificacion, siempre que se conserve el aviso de licencia. Al derivar de un modelo Apache 2.0, no se anaden restricciones adicionales conocidas, pero conviene verificar la procedencia de los datos de ajuste por si existiesen derechos de terceros sobre las facturas utilizadas.
- Ausencia de cuantizaciones oficiales: desplegar en hardware de gama media exige generar GGUF, AWQ o GPTQ por cuenta propia.
- Repositorio sin traccion: 0 descargas y 0 likes, sin issues ni discusion, lo que implica ausencia total de soporte y de informes de fallos por parte de terceros.
- Anclaje a `transformers` y `text-generation-inference`: no hay garantia de compatibilidad con otras herramientas de inferencia sin conversion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lugman-madhiai/invoice-split-2022
- Perfil del autor: https://huggingface.co/lugman-madhiai
- Otro modelo del mismo autor, `invoice-structured-extraction`: https://huggingface.co/lugman-madhiai/invoice-structured-extraction
- Modelo base: https://huggingface.co/unsloth/Qwen3-VL-8B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Documentacion de Qwen3-VL (familia del modelo base): https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- AI Invoice Split (herramienta comercial de referencia en el dominio): https://docmgthelp.docmgt.com/docMgt/AIInvoiceSplit.html
- Proyecto relacionado de division de facturas en PDF: https://github.com/jsheppard8989/invoice-splitter
