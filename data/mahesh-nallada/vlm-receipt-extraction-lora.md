# Mahesh-Nallada/vlm-receipt-extraction-lora

## Resumen

El modelo `Mahesh-Nallada/vlm-receipt-extraction-lora` es un adaptador LoRA (concretamente QLoRA de 4 bits) entrenado sobre el checkpoint instructivo `Qwen/Qwen2.5-VL-3B-Instruct`. No es un modelo completo ni un merge: el repositorio de 0,2 GB contiene unicamente los pesos del adaptador en formato safetensors, gestionados con la libreria PEFT. Su proposito es convertir la imagen de un ticket o recibo en un JSON con un esquema fijo de asignacion: `store_name`, `date` (formato `YYYY-MM-DD`), `line_items[]` (con `name`, `qty`, `unit_price`, `amount`), `subtotal`, `tax` y `total`.

El entrenamiento se realizo sobre las imagenes oficiales de train del dataset CORD v2 (`naver-clova-ix/cord-v2`) y consistio en una ejecucion corta de tipo smoke test: solo 200 imagenes, 1 epoch, sobre una GPU NVIDIA Tesla T4 de 16 GB en Colab. El autor lo presenta explicitamente como una linea base de investigacion o prueba tecnica, no como un producto OCR de produccion. El pipeline previsto incluye un post-procesador obligatorio que repara el JSON, verifica cada hoja no nula contra el texto de la pagina (anulando alucinaciones) y comprueba la coherencia de los totales.

Su relevancia actual es doble. Por un lado, documenta con detalle inusual un caso de ajuste fino de un VLM pequeno (3B) para extraccion documental en hardware de consumo, incluyendo la configuracion exacta de QLoRA, el presupuesto de tokens de vision y la evaluacion antes/despues con 8 recibos congelados del split de test de CORD v2. Por otro, muestra un resultado negativo honesto: las partidas de linea mejoran, pero los totales monetarios ya eran fuertes en zero-shot y empeoran tras el ajuste, un aviso util sobre el sobreeajuste en pasadas cortas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal Qwen2.5-VL (vision-language, image-text-to-text) |
| Parametros totales | Adaptador LoRA con r=16, alpha=32 sobre un modelo base denominado 3B (`Qwen/Qwen2.5-VL-3B-Instruct`); el autor no detalla el recuento exacto de parametros |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento fijo `max_seq_length=3072` en modelo, collator y `SFTConfig` |
| Tipos de cuantizacion | Entrenamiento e inferencia con QLoRA 4-bit NF4 (bitsandbytes); el adaptador se publica como pesos safetensors no cuantizados. No se publican versiones GGUF |
| Idiomas soportados | en, id (segun los tags del repositorio); el contenido de la model card esta en ingles y el dataset CORD v2 contiene recibos en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA, 0,2 GB de repositorio) |
| Libreria | peft |
| Modelo base | Qwen/Qwen2.5-VL-3B-Instruct |
| Dataset de entrenamiento | naver-clova-ix/cord-v2 (split oficial de train, subconjunto de 200 imagenes) |
| Pipeline | image-text-to-text |
| Descargas / likes | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-VL-3B-Instruct, un transformer multimodal que procesa imagenes y texto de forma conjunta. El ajuste se aplico exclusivamente a las capas de lenguaje, atencion y MLP, con `finetune_vision_layers=False`, es decir, el encoder de vision quedo congelado. El adaptador usa rango r=16, alpha=32 y dropout=0, cargado en 4 bits NF4 mediante la version `unsloth/Qwen2.5-VL-3B-Instruct-bnb-4bit`. El entrenamiento se hizo con Unsloth `FastVisionModel` y `UnslothVisionDataCollator` con `completion_only_loss=True`, junto a TRL `SFTTrainer` y PEFT.

La configuracion de optimizacion fue AdamW de PyTorch con learning rate 5e-5, scheduler coseno, warmup de aproximadamente el 20 por ciento de los pasos, grad clip de 1,0, acumulacion de gradiente 8, batch 1 y 1 epoch sobre 200 imagenes (`MAX_TRAIN=200`). Las imagenes de entrenamiento se redimensionaron a un maximo de 512 tokens de vision (512x28x28 px), mientras que la inferencia usa un lado largo de 1008. Las secuencias se limitaron a 3072 tokens y las completaciones que excedian ese limite se descartaron, no se truncaron. El pico de memoria en evaluacion fue de aproximadamente 6,6 GiB en 4 bits sobre una Tesla T4 de 16 GB.

El aspecto mas relevante del entrenamiento es la limitacion del propio dataset: CORD v2 no etiqueta `store_name` ni `date`, por lo que los objetivos de entrenamiento para esos dos campos son `null`. El adaptador aprende, por tanto, a dejarlos nulos en recibos similares a los de CORD, no a leerlos. Tambien se ignoraron los campos de CORD relativos a lineas anuladas, efectivo/cambio, cargo por servicio y descuentos.

## Capacidades

- Generacion de texto estructurado en JSON a partir de una imagen de recibo, con el esquema fijo definido por el autor.
- Extraccion de campos de cabecera y de lineas de detalle: nombre de tienda, fecha, articulos con cantidad, precio unitario e importe, subtotal, impuestos y total.
- Procesamiento de imagen y texto en una sola pasada (pipeline image-text-to-text), sin necesidad de un OCR externo en el circuito basico.
- Salida con validez JSON de 1,0 en las 8 pruebas congeladas reportadas por el autor.
- Decodificacion greedy (`do_sample=False`) con `max_new_tokens=1024`, lo que da resultados reproducibles.
- Soporte de conversacion multimodal mediante `apply_chat_template` con mensajes que combinan imagen y texto.
- Capacidades multilingues del modelo base heredadas, con tags declarados en en e id; el autor no documenta evaluacion multilingue del adaptador.
- Mejora medible en la extraccion de lineas de detalle respecto al modelo base sin ajustar: F1 de `line_items.name` de 0,480 a 0,609 y de `line_items.qty` de 0,300 a 0,556.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, audio ni modos de pensamiento explicitos para este adaptador.

## Casos de uso

- Linea base de investigacion en extraccion de recibos: sirve para reproducir un experimento de QLoRA sobre CORD v2 en una sola GPU T4, con la configuracion completa publicada, y comparar despues variantes propias (mas datos, mas epochs, vision layers descongeladas).
- Prototipo de digitalizacion de gastos con verificacion humana: el adaptador extrae lineas de detalle y totales de la imagen, y un operador valida los campos antes de incorporarlos a un sistema de contabilidad; el autor exige un post-procesador que anule valores no respaldados por el texto de la pagina.
- Canalizacion de extraccion de partidas para analitica de compra: los `line_items` con `name`, `qty` e `amount` permiten alimentar un categorizador posterior que agrupe productos por tipo de establecimiento o categoria de gasto.
- Generacion asistida de anotaciones sobre corpus propios: usar el adaptador como preanotador de esquemas JSON en recibos nuevos y corregir manualmente, aprovechando que la validez JSON reportada es del 1,0 y que el grounding elimina las hojas no soportadas.
- Evaluacion comparativa de pipelines documentales: integrarlo como uno de los candidatos en un banco de pruebas de OCR y VLM, con la misma logica de emparejamiento difuso y comprobacion de totales que usan otros benchmarks publicos de recibos.
- Formacion y transferencia de conocimiento en QLoRA multimodal: el repositorio documenta presupuesto de tokens de vision, `max_seq_length`, colapso de memoria y manejo de secuencias desbordadas, lo que lo convierte en material didactico para ajustar VLMs pequenos en GPUs de consumo.
- Punto de partida para ajustes posteriores sobre datos con tienda y fecha etiquetadas: dado que el adaptador aprende a devolver `null` en esos dos campos por sesgo del dataset, se puede continuar el entrenamiento con un corpus que si los anote.
- Despliegue en entornos con recursos limitados: el pico de 6,6 GiB en 4 bits permite ejecutarlo en una GPU de 8-12 GB para pruebas internas, siempre con validacion posterior de importes.

## Benchmarks y rendimiento

Evaluacion del autor sobre las mismas 8 imagenes congeladas del split de test de CORD v2, comparando el modelo base en zero-shot con este adaptador. Las metricas son P/R/F1 por campo y Exact tras el pipeline de parseo, grounding y comprobacion de coherencia. `null=null` cuenta como Exact y se omite en F1. Las lineas de detalle se emparejan por nombre normalizado.

| Campo | F1 zero-shot | F1 fine-tuned | Delta F1 | Exact zero-shot | Exact fine-tuned |
|---|---:|---:|---:|---:|---:|
| store_name | 0,000 | 0,000 | 0,000 | 0,625 | 1,000 |
| date | 0,000 | 0,000 | 0,000 | 1,000 | 1,000 |
| subtotal | 0,769 | 0,615 | -0,154 | 0,625 | 0,500 |
| tax | 1,000 | 0,571 | -0,429 | 1,000 | 0,750 |
| total | 0,933 | 0,667 | -0,267 | 0,875 | 0,625 |
| line_items.name | 0,480 | 0,609 | +0,129 | 0,316 | 0,438 |
| line_items.qty | 0,300 | 0,556 | +0,256 | 0,263 | 0,500 |
| line_items.unit_price | 0,000 | 0,000 | 0,000 | 0,474 | 0,750 |
| line_items.amount | 0,500 | 0,545 | +0,045 | 0,368 | 0,375 |

Metricas adicionales reportadas por el autor:

| Metrica | Valor |
|---|---|
| Validez JSON | 1,0 en ambas etapas (base y adaptador) |
| Alucinacion tras grounding | 0,0 en ambas etapas (las hojas no soportadas ya se anulan) |
| Receipt-level exact match | 0/8 en ambas etapas |
| Precision de line_items.name | 0,55 (zero-shot) frente a 0,78 (fine-tuned) |
| Latencia por pagina, zero-shot | p50 aproximadamente 20 s, p95 aproximadamente 191 s |
| Latencia por pagina, fine-tuned | p50 aproximadamente 19 s, p95 aproximadamente 366 s (el p95 corresponde a un unico valor atipico) |

Advertencias del propio autor sobre estos numeros: F1 de `store_name` y `date` se mantiene en 0 porque el ground truth de CORD es siempre nulo; el Exact de 1,0 en `store_name` indica que el adaptador dejo de inventar nombres de tienda, no que los lea. F1 de `unit_price` es 0 en ambas etapas porque CORD a menudo no incluye ese campo. La muestra de n=8 es demasiado pequena para sostener una comparacion tipo leaderboard: un solo recibo altera el F1.

## Requisitos de hardware

- Inferencia en 4 bits NF4: el autor reporta un pico de memoria de evaluacion de aproximadamente 6,6 GiB sobre una Tesla T4 de 16 GB, con imagenes a lado largo de 1008 px y `max_seq_length=3072`.
- Peso de los pesos del modelo base en precision de 16 bits: en torno a 6 GB solo para parametros, mas cache KV y activaciones del encoder de vision; requiere tarjetas de 12 GB o mas con margen. Estimacion, no dato publicado por el autor.
- GPU usadas en el entrenamiento y la evaluacion: NVIDIA Tesla T4 de 16 GB (Google Colab). No se documentan pruebas en otras GPU.
- GPU de consumo compatibles: el autor solo valida T4; con 4 bits, tarjetas de 8 GB quedan muy justas y las de 12 GB (RTX 3060 12 GB, RTX 4070 12 GB) son el minimo razonable. Una RTX 4090 de 24 GB permite holgura para lotes mayores o imagenes a mayor resolucion.
- Opciones de despliegue documentadas: `transformers` con `Qwen2_5_VLForConditionalGeneration`, `BitsAndBytesConfig` en 4-bit NF4 y `PeftModel.from_pretrained`; el procesador se configura con `min_pixels=256*28*28` y `max_pixels=1008*28*28`.
- Otras vias de despliegue (Unsloth, vLLM, llama.cpp, Ollama, TGI): no documentadas por el autor para este adaptador. Un adaptador PEFT de un VLM requiere fusion previa con la base y, en el caso de GGUF, conversion adicional; ninguna de las dos esta descrita en la model card.
- Latencia: aproximadamente 19-20 s por pagina en mediana sobre Tesla T4, con p95 de 191 s (zero-shot) y 366 s (fine-tuned). Son mediciones de una unica configuracion de hardware y no incluyen optimizaciones de serving.
- Throughput: no disponible.

## Comparativa con modelos similares

Los dos proyectos comparables encontrados en la busqueda web son adaptadores LoRA sobre modelos Qwen con el mismo dataset CORD v2 y el mismo tipo de esquema de salida. No son comparaciones controladas y usan bases distintas, por lo que las cifras no son directamente equiparables.

| Modelo | Base | Metodo | Datos | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Mahesh-Nallada/vlm-receipt-extraction-lora | Qwen2.5-VL-3B-Instruct | QLoRA 4-bit NF4, r=16, solo capas de lenguaje/atencion/MLP | CORD v2 train, 200 imagenes, 1 epoch | F1 por campo: name 0,609, qty 0,556, amount 0,545; total y tax regresan respecto a zero-shot; n=8 | Apache 2.0 | 0 descargas, 0 likes; repositorio de 0,2 GB solo con el adaptador |
| steven0226/vlm-receipt-extractor | Qwen3-VL (tamano no indicado en el resultado de busqueda) | PEFT LoRA / QLoRA con Unsloth | CORD v2 | No disponible en la informacion recogida | Apache 2.0 | Publicado en HuggingFace; repositorio PEFT con safetensors |
| tun0000/vlm-receipt-extractor | Qwen3-VL-8B | QLoRA | CORD v2 | El repositorio declara una mejora de F1 por campo de 0,744 a 0,930 antes/despues | No disponible | Repositorio GitHub con notebooks; no se indica publicacion de pesos |
| receipt-ocr (arslankazmi) | Multiples pipelines OCR y VLM | Benchmark, no modelo | 19 recibos de supermercado y farmacia capturados en Lahore (PKR) | Comparativa de 11 pipelines con emparejamiento difuso por campos (rapidfuzz >= 80) | No disponible | Sitio web del proyecto |

## Limitaciones y advertencias

- No es un modelo completo: es un adaptador LoRA que debe cargarse sobre `Qwen/Qwen2.5-VL-3B-Instruct`; no sirve como checkpoint autonomo.
- El autor declara explicitamente que no esta pensado como producto OCR de produccion y que no debe usarse para KYC, declaracion de impuestos ni ninguna decision que requiera tienda o fecha auditadas sin una segunda fuente.
- `store_name` y `date` no estan etiquetados en CORD v2 y los objetivos de entrenamiento son `null`; el adaptador aprendera a devolver `null` en recibos similares, no a leerlos.
- Regresion en campos monetarios: subtotal, tax y total empeoran su F1 tras el ajuste (-0,154, -0,429 y -0,267 respectivamente). El autor lo atribuye a una pasada corta de LoRA y a una ejecucion interrumpida por valores NaN.
- Tamano de evaluacion insuficiente: 8 recibos congelados. Ningun recibo alcanza coincidencia exacta a nivel de recibo (0/8). El propio autor advierte que un solo recibo altera el F1.
- Requiere post-procesador obligatorio: parseo y reparacion del JSON, grounding de cada hoja no nula contra el texto de la pagina y comprobacion de coherencia de totales. Sin ese circuito, las cifras publicadas no son validas.
- Sesgos de dominio: entrenado solo con recibos de CORD v2, de estilo y procedencia acotados (recibos en ingles, tendencia indonesia). El comportamiento en otros formatos, idiomas, monedas o tickets manuscritos no esta evaluado.
- Idiomas: los tags declaran en e id, pero no hay evaluacion multilingue del adaptador; la model card esta redactada integramente en ingles.
- Riesgo de alucinacion de campos: mitigado en la medicion del autor mediante grounding (0,0 hojas no soportadas), pero solo si se aplica ese grounding; sin el, el modelo puede rellenar campos no visibles.
- Discrepancia de identificador: el codigo de ejemplo de la model card usa `maheshnallada/vlm-receipt-extraction-lora` en minusculas, mientras que el identificador del repositorio es `Mahesh-Nallada/vlm-receipt-extraction-lora`. Conviene verificar el identificador correcto al cargar.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado en septiembre de 2026. Sin mantenimiento ni comunidad documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe asumir las limitaciones tecnicas declaradas y las condiciones del dataset CORD v2 empleado en el entrenamiento.
- Fechas anotadas con posibles incoherencias en la informacion de origen, sin aclaracion por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mahesh-Nallada/vlm-receipt-extraction-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Dataset CORD v2: https://huggingface.co/datasets/naver-clova-ix/cord-v2
- Version 4-bit de la base usada en el entrenamiento: unsloth/Qwen2.5-VL-3B-Instruct-bnb-4bit (referenciada en la model card)
- Proyecto comparable 1: https://huggingface.co/steven0226/vlm-receipt-extractor
- Model card del comparable 1: https://huggingface.co/steven0226/vlm-receipt-extractor/blob/main/README.md
- Proyecto comparable 2 (repositorio GitHub): https://github.com/tun0000/vlm-receipt-extractor
- Notebooks del comparable 2: https://github.com/tun0000/vlm-receipt-extractor/tree/main/notebooks
- Benchmark de pipelines de recibos: https://arslankazmi.github.io/receipt-ocr/
