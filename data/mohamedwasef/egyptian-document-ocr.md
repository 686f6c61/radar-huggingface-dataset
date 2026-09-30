# mohamedwasef/egyptian-document-ocr

## Resumen

Egyptian Document OCR es un adaptador LoRA de vision-lenguaje publicado por el usuario mohamedwasef en HuggingFace, afinado sobre el modelo base `unsloth/Qwen3-VL-4B-Instruct-unsloth-bnb-4bit`. Su proposito concreto es el OCR de pagina completa de documentos oficiales egipcios escaneados (Boletin Oficial / الجريدة الرسمية, leyes tributarias y decisiones del Ministerio de Hacienda) en arabe, transcribiendo el texto preservando el orden de lectura original, la puntuacion y las convenciones de espaciado, y renderizando las tablas como HTML en linea.

No es un modelo independiente, sino un adaptador que debe cargarse encima del modelo base. Los pesos del adaptador ocupan aproximadamente 0,1 GB en el repositorio, con 33.030.144 parametros entrenables (0,74% de los 4.470 millones del modelo base completo). El encoder de vision se mantuvo congelado; solo se ajustaron las capas del modelo de lenguaje mediante LoRA con r=16 y alpha=16.

El interes del proyecto es acotado pero claro: el OCR de documentos administrativos arabes con tipografia y maquetacion complejas sigue siendo un cuello de botella en digitalizacion de archivos publicos, y este adaptador demuestra que con 280 paginas de entrenamiento, 3 epocas y 37 minutos en una unica NVIDIA T4 se puede alcanzar un CER del 2,33% en paginas sin tablas. La licencia Apache 2.0 facilita su reutilizacion comercial, aunque el rendimiento debe validarse fuera del dominio tributario egipcio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer de vision-lenguaje Qwen3-VL; solo capas del modelo de lenguaje ajustadas, encoder de vision congelado |
| Parametros totales | 4.470 millones en el modelo base; adaptador con 33.030.144 parametros entrenables (0,74%) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la hereda del modelo base Qwen3-VL-4B) |
| Tipos de cuantizacion | Modelo base en 4 bits (bitsandbytes, bnb-4bit); adaptador LoRA entrenado e inferido en fp16 |
| Idiomas soportados | arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA, no fusionado) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-VL-4B-Instruct en su variante cuantizada a 4 bits de Unsloth. Se aplico LoRA con rango 16 y alpha 16 exclusivamente sobre las capas del modelo de lenguaje, dejando el encoder de vision congelado, de modo que la capacidad de lectura visual procede integramente del modelo base y el ajuste se concentra en el formato de salida textual. El entrenamiento se realizo en fp16 (la T4 no soporta bf16 de forma nativa) durante 3 epocas, con un tiempo total aproximado de 37 minutos sobre una unica NVIDIA T4 en la capa gratuita de Kaggle.

Los datos proceden de `mohamedwasef/egyptian-official-documents-ocr`, un conjunto a nivel de pagina con escaneos de legislacion tributaria egipcia y decisiones ministeriales, transcritos para preservar la ortografia impresa exacta, el espaciado y la maquetacion. Se emplearon 280 paginas para entrenamiento y 56 para validacion. El objetivo de entrenamiento es el texto plano transcrito de la pagina, sin marcadores estructurales anadidos: los metadatos de seccion o documento y el troceado posterior se construyen por separado a partir de la salida del modelo, no los predice el propio modelo. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Transcripcion OCR de pagina completa en arabe a partir de una imagen de entrada (pipeline image-to-text).
- Preservacion del orden de lectura original, la puntuacion y las convenciones de espaciado del documento impreso.
- Renderizado de tablas como HTML en linea dentro de la transcripcion.
- Lectura de documentos administrativos y legales con tipografia arabe impresa, incluyendo numeracion de articulos y referencias cruzadas entre normativas.
- Manejo de numerales arabes orientales en el texto transcrito (por ejemplo, ٢٦, ٥٩, ٧٢), evaluados de forma exacta y sin tolerancia en la metrica.
- No se documenta soporte de tool calling, function calling, comportamiento agentico, modo de razonamiento explicito, audio ni otras modalidades distintas de imagen a texto.
- Capacidad multilingue limitada al arabe: el autor declara unicamente el idioma `ar`.

## Casos de uso

- Digitalizacion de boletines oficiales: convertir paginas escaneadas de la Gaceta Oficial egipcia en texto buscable, aprovechando que el modelo reproduce el orden de lectura y el espaciado originales, lo que reduce la necesidad de post-procesado manual.
- Extraccion de texto de leyes tributarias y decisiones ministeriales para bases de datos juridicas internas: la salida plana se puede trocear posteriormente y enlazar con metadatos de seccion generados fuera del modelo.
- Automatizacion de archivos administrativos en organismos publicos: procesamiento por lotes de lotes de escaneos historicos en arabe donde los OCR genericos fallan por tipografia y maquetacion.
- Construccion de pipelines de busqueda semantica sobre normativa: la transcripcion alimenta indices de recuperacion documental sobre textos legales que antes solo existian en imagen.
- Validacion y control de calidad documental: comparar la transcripcion generada con el original para detectar paginas mal escaneadas o deterioradas mediante la tasa de error por pagina.
- Extraccion de tablas normativas: el renderizado HTML en linea permite reconstruir tablas de tipos, plazos o cuantias dentro del texto legal sin un modulo de deteccion de tablas independiente.
- Investigacion en OCR arabe de bajo recurso: servir como punto de partida (fine-tune adicional) para otros dominios de documento arabe con presupuesto de computo minimo, dado que el adaptador se entrena en una sola T4 en menos de una hora.

## Benchmarks y rendimiento

Evaluacion sobre el conjunto de test oficial de 30 paginas del dataset, nunca vistas en entrenamiento ni validacion, con CER/WER calculados tras normalizar diacriticos y unificar ى/ي. Los digitos se evaluan de forma exacta y separada, sin tolerancia.

| Subconjunto | Paginas | CER | WER |
|---|---|---|---|
| Todas las paginas de test | 30 | 3,82% | 9,39% |
| Paginas sin tabla | 28 | 2,33% | 8,09% |
| Paginas con tabla | no disponible (fila truncada en la model card) | no disponible | no disponible |
| Ejemplo de la model card (pagina representativa, mediana sin tablas) | 1 | 2,20% | 9,26% |

No se han publicado en la informacion disponible resultados comparativos frente a otros sistemas OCR (Tesseract, PaddleOCR, modelos OCR arabes especializados) ni benchmarks estandar tipo MMLU, HumanEval o GSM8K, que no aplican a esta tarea. La unica comparacion posible es contra el modelo base sin adaptador, y no se reporta.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4,47B ocupa aproximadamente 2,5-3 GB en 4 bits (configuracion de entrenamiento declarada) y cerca de 9 GB en fp16; a esto se suman los tokens de imagen de cada pagina, que dependen de la resolucion de entrada y de la configuracion del procesador visual de Qwen3-VL. Cifras orientativas, no publicadas por el autor.
- GPU empleada en entrenamiento: una unica NVIDIA T4 (16 GB), en la capa gratuita de Kaggle. Es el minimo practico confirmado para ajustar este adaptador.
- GPU recomendadas para produccion: T4, L4, A10G o RTX 4090 para el modelo base en 4 bits con carga por lotes moderada; A100 o H100 si se requiere fp16 sin cuantizar y throughput alto.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) usando el modelo base cuantizado a 4 bits. En fp16 es recomendable disponer de 16 GB o mas.
- Opciones de despliegue: transformers junto con peft para cargar el adaptador sobre el modelo base; vLLM admite adaptadores LoRA sobre modelos multimodales compatibles, lo que permitiria servir varias variantes del adaptador sobre un mismo base. No se documenta soporte de llama.cpp, Ollama o TGI para este adaptador concreto; para usarlos habria que fusionar los pesos previamente, operacion no descrita por el autor.
- Latencia y throughput: no disponibles. El unico dato de tiempo publicado es el de entrenamiento (3 epocas en unos 37 minutos sobre una T4), no el de inferencia.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparaciones con alternativas de la misma categoria. Como referencia estructural, el propio autor indica que este adaptador se apoya en `unsloth/Qwen3-VL-4B-Instruct-unsloth-bnb-4bit`; no se aportan metricas del modelo base sin ajustar, ni de OCR comerciales o de codigo abierto como Tesseract, PaddleOCR o modelos especificos para arabe. Por tanto, la comparativa cuantitativa no esta disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| egyptian-document-ocr (este modelo) | 4,47B en el base; 33,03M entrenables en el adaptador | no disponible | Apache 2.0 | HuggingFace, adaptador LoRA |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio muy restringido: el ajuste se realizo sobre 280 paginas de legislacion tributaria egipcia y decisiones ministeriales. El rendimiento fuera de ese dominio (otros organismos, otras decadas, otros paises arabes, escritura manuscrita, documentos con sellos o anotaciones) no esta evaluado y probablemente degrade.
- Las tablas penalizan la precision: el CER sube del 2,33% en paginas sin tabla al 3,82% en el conjunto completo de test, diferencia atribuible a las paginas con tablas, cuyo resultado desglosado ni siquiera aparece completo en la model card.
- Riesgo de alucinacion textual: al ser un modelo generativo y no un OCR clasico de deteccion, puede producir texto plausible que no aparece en la imagen, especialmente en zonas degradadas, borrosas o con tipografia inusual. La evaluacion exacta de digitos ayuda a detectar estos casos, pero no los elimina.
- Sensibilidad a la calidad del escaneo: la metrica se calculo sobre documentos transcritos con ortografia y espaciado exactos; no hay datos sobre escaneos con ruido, inclinacion o baja resolucion.
- Reproduccion incompleta: la fila de resultados para paginas con tabla aparece truncada en la model card, por lo que no es posible verificar el peor caso de rendimiento.
- Cobertura idiomatica limitada al arabe. No se garantiza un comportamiento correcto con texto en ingles, frances o cifras latinas mezcladas, aunque aparezcan en documentos egipcios reales.
- Formato de salida fijo: el modelo genera texto plano con tablas en HTML en linea, siguiendo las convenciones del dataset. No predice metadatos estructurales ni troceado, que deben construirse aparte.
- Naturaleza de adaptador: no es un modelo autonomo. Requiere descargar el modelo base (varios GB) ademas del adaptador y cargarlo con PEFT; su uso con runtimes que no soporten LoRA sobre modelos multimodales exige fusionar pesos, procedimiento no documentado.
- Licencia Apache 2.0 en el adaptador: permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset de entrenamiento antes de desplegarlo en produccion.
- Madurez: el repositorio registra 0 descargas y 0 likes, sin validacion independiente por parte de terceros. No hay garantia de mantenimiento ni de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mohamedwasef/egyptian-document-ocr
- Modelo base: https://huggingface.co/unsloth/Qwen3-VL-4B-Instruct-unsloth-bnb-4bit
- Dataset de entrenamiento: https://huggingface.co/datasets/mohamedwasef/egyptian-official-documents-ocr
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
- Demo: no disponible en la informacion proporcionada.
