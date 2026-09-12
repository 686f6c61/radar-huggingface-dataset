# rakansuliman/qwen35-9b-arabic-manuscript-htr

## Resumen

Qwen3.5-9B Arabic Manuscript HTR es una adaptacion mediante LoRA de un modelo de vision-lenguaje (VLM) construido sobre Qwen/Qwen3.5-9B, especializado en reconocimiento de texto manuscrito (HTR) a nivel de linea sobre manuscritos arabes historicos. Lo desarrolla el usuario de HuggingFace rakansuliman y su funcion es recibir la imagen recortada de una linea manuscrita y devolver su transcripcion en arabe. El repositorio no contiene un checkpoint completo de 9B, sino dos adaptadores LoRA que deben aplicarse secuencialmente sobre el modelo base (0,4 GB de peso total en el repo).

La relevancia del modelo esta en su nicho: el HTR sobre manuscritos arabes historicos es una tarea con muy pocos recursos publicos y con estilos caligraficos, tintas y soportes muy heterogeneos. El autor aborda esto con una estrategia de adaptacion en dos etapas: una primera etapa de adaptacion general a manuscritos arabes (56.994 lineas de entrenamiento de varias colecciones) y una segunda etapa de especializacion en el corpus Omar Al-Saleh (15.164 lineas). La torre de vision se mantiene congelada en la etapa 1 y solo se desbloquean parcialmente bloques concretos en la etapa 2.

Los resultados publicados son de validacion sobre el split retenido de Omar Al-Saleh (798 lineas): CER de corpus 0,125173 y WER de corpus 0,339056, lo que supone una mejora relativa del 10,3 % en CER y del 6,5 % en WER frente a la linea base de la etapa 1. El autor indica explicitamente que no son resultados de test final. La licencia es Apache-2.0, el idioma soportado es unicamente el arabe y el pipeline declarado es image-text-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de vision-lenguaje (VLM) basado en Qwen3.5-9B (transformer multimodal con torre de vision y capas merger vision-lenguaje) mas dos adaptadores LoRA secuenciales (PEFT) |
| Parametros totales | 9B en el modelo base Qwen/Qwen3.5-9B (nominal, segun el nombre del modelo); los adaptadores LoRA anaden un numero no especificado de parametros entrenables (rango 16, alpha 32). Tamano del repositorio de adaptadores: 0,4 GB |
| Parametros activos | No aplica: no es un modelo MoE segun la informacion disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio publica adaptadores en safetensors; el autor usa bfloat16 en el ejemplo de carga. Las cuantizaciones aplicables son las que soporte el modelo base Qwen3.5-9B |
| Idiomas soportados | Arabe (ar) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptadores PEFT/LoRA: stage1_adapter y stage2_best_cer_adapter); requiere descargar el modelo base Qwen3.5-9B por separado |

## Arquitectura y entrenamiento

El sistema final es un VLM Qwen3.5-9B adaptado con LoRA en dos etapas. La etapa 1 realiza una adaptacion general a transcripcion de manuscritos arabes historicos usando aproximadamente 56.994 lineas utiles procedentes de las colecciones Omar Al-Saleh, Muharaf y AraMs-28k-HTR, con LoRA de rango 16 y alpha 32, adaptando capas de idioma/modelo y manteniendo la torre de vision congelada. La etapa 2 parte del modelo con el adaptador de la etapa 1 ya fusionado mediante `merge_and_unload()` y aplica un adaptador LoRA nuevo entrenado sobre 15.164 lineas de entrenamiento de Omar Al-Saleh; en esta fase se adaptan las capas de proyeccion y MLP del modelo de lenguaje, los bloques de vision 19 a 26 y las capas merger vision-lenguaje.

La configuracion de la etapa 2 usa rango LoRA 16, alpha 32, batch efectivo de 16, tasa de aprendizaje 1e-5, 2 epocas e intervalos de checkpoint cada 200 pasos de optimizador. El checkpoint seleccionado es `checkpoint-1000` y la metrica de seleccion fue el CER de corpus, evaluado exclusivamente sobre el split de validacion retenido de Omar. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa o atencion lineal. La innovacion principal es, por tanto, la propia estrategia de adaptacion en dos fases con desbloqueo progresivo de la torre de vision.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) a nivel de linea sobre imagenes de manuscritos arabes historicos, devolviendo la transcripcion en arabe.
- Procesamiento multimodal imagen-texto mediante el pipeline image-text-to-text.
- Adaptacion especifica al estilo caligrafico y a las caracteristicas materiales del corpus Omar Al-Saleh, fruto de la especializacion de la etapa 2.
- Adaptacion general a manuscritos arabes historicos de varias colecciones, gracias a la etapa 1 entrenada con datos mixtos (Omar Al-Saleh, Muharaf, AraMs-28k-HTR).
- Inferencia determinista recomendada por el autor: `do_sample=False`, `enable_thinking=False`, `max_new_tokens=256`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (el modelo base podria soportarlo, pero no se documenta para este ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible; el ajuste esta orientado a una unica tarea de transcripcion.
- Vision mas alla de texto manuscrito (documentos, objetos, escenas): no disponible; el ajuste esta especializado.
- Audio: no soportado.
- Capacidades multilingues: no; el modelo declara unicamente arabe (ar).

## Casos de uso

- Digitalizacion de fondos manuscritos arabes en bibliotecas y archivos: se recortan las lineas de cada pagina y el modelo devuelve la transcripcion, generando texto plano buscable a partir de imagenes de colecciones historicas. La especializacion en Omar Al-Saleh lo hace especialmente adecuado para fondos de ese estilo.
- Creacion de corpus anotados para investigacion filologica e historica: el modelo actua como anotador de primera pasada sobre miles de lineas, reduciendo el coste de la transcripcion manual posterior por parte de paleografos.
- Busqueda full-text en archivos historicos: una vez transcritas las lineas, el texto se indexa y permite busquedas por terminos en colecciones que antes solo existian como imagenes.
- Asistencia a la transcripcion en plataformas de edicion colaborativa: integracion como motor de sugerencia linea a linea en herramientas tipo Transkribus, donde el revisor humano corrige la salida del modelo en lugar de teclear desde cero.
- Generacion de datos de entrenamiento para otros modelos HTR: las transcripciones producidas pueden emplearse como pseudoetiquetas para preentrenar modelos especificos de reconocimiento de escritura arabe.
- Analisis cuantitativo de colecciones: extraccion de frecuencias lexicas, entidades y formulas repetidas en corpus manuscritos a partir de las transcripciones, con valor para estudios de historia social o linguistica diacronica.
- Evaluacion comparativa de metodos HTR: el repositorio incluye un script de evaluacion CER/WER que puede reutilizarse como banco de pruebas sobre el mismo split de validacion de 798 lineas.
- Preservacion digital con metadatos: union de la transcripcion automatica con los metadatos catalograficos de cada manuscrito para enriquecer registros de archivo.

## Benchmarks y rendimiento

Los unicos datos publicados son de validacion sobre el split retenido de Omar Al-Saleh (798 lineas), no de test final. El propio autor advierte que el split de test no se uso para entrenamiento, seleccion de hiperparametros ni seleccion de checkpoint.

Comparativa de experimentos (validacion Omar Al-Saleh):

| Experimento | CER de corpus | WER de corpus |
|---|---:|---:|
| Linea base etapa 1 (manuscritos mixtos) | 0,139515 | 0,362525 |
| Modelo seleccionado etapa 2 | 0,125173 | 0,339056 |
| Experimento con tasa de aprendizaje dual | 0,128116 | 0,348320 |
| Mejor experimento de fusion de checkpoints | 0,126623 | 0,344491 |

Metricas del modelo seleccionado (etapa 2, checkpoint-1000):

| Metrica | Valor |
|---|---:|
| CER de corpus | 0,125173 |
| WER de corpus | 0,339056 |
| CER medio por linea | 0,125634 |
| WER medio por linea | 0,314450 |

Mejora relativa de la etapa 2 frente a la linea base de la etapa 1: aproximadamente 10,3 % en CER y 6,5 % en WER. No hay resultados publicados de MMLU, HumanEval, GSM8K ni de comparaciones con otros sistemas HTR en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion aritmetica a partir de los 9B del modelo base, no verificada en la informacion disponible): en bfloat16, unos 18 GB solo de pesos, mas la torre de vision, el procesador de imagenes y las activaciones; en cuantizacion de 4 bits, aproximadamente 6-8 GB de pesos.
- GPU recomendadas para bfloat16: A100 40 GB, A100 80 GB, H100, L40S 48 GB o A6000 48 GB. Con RTX 4090 (24 GB) es posible en bfloat16 con batch 1 y contexto reducido, aunque el margen es escaso al sumar la torre de vision.
- Cabe en GPU de consumo: si, en el rango de 16-24 GB (RTX 4080, 4090, 3090) siempre que el modelo base se cargue cuantizado en 4 bits; en bfloat16 completo es ajustado incluso en 24 GB.
- CPU: no recomendable para un VLM de 9B por latencia; no hay datos publicados de rendimiento en CPU.
- Opciones de despliegue: la unica ruta documentada por el autor es transformers + peft, cargando Qwen3.5-9B, fusionando el adaptador de la etapa 1 con `merge_and_unload()` y aplicando despues el adaptador de la etapa 2. Para vLLM, TGI o llama.cpp habria que fusionar previamente los adaptadores y convertir el checkpoint resultante, algo que no se documenta en la informacion disponible; llama.cpp y Ollama no estan soportados de forma directa para adaptadores PEFT multimodales.
- El ejemplo de carga usa `dtype=torch.bfloat16` y `device_map="auto"`.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo, tiempo por linea ni rendimiento con batch.
- Almacenamiento: el repositorio de adaptadores ocupa 0,4 GB, pero es necesario descargar adicionalmente el modelo base de 9B.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la informacion proporcionada para establecer una comparacion cuantitativa. La tabla siguiente recoge unicamente lo que puede afirmarse con la informacion disponible.

| Modelo | Parametros | Contexto | Rendimiento HTR arabe | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen35-9b-arabic-manuscript-htr (este modelo) | Base de 9B mas adaptadores LoRA de rango 16 (repo de 0,4 GB) | No disponible | CER de validacion 0,125173 y WER 0,339056 en Omar Al-Saleh (798 lineas) | Apache-2.0 | Adaptadores publicos en HuggingFace; requiere el modelo base |
| Qwen/Qwen3.5-9B (modelo base, sin ajuste HTR) | 9B | No disponible | No disponible | No disponible en la informacion proporcionada | Publico en HuggingFace |
| Otros sistemas HTR para manuscritos arabes (por ejemplo, aproximaciones basadas en TrOCR o en modelos tipo Kraken) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

No se han encontrado en la busqueda web enlaces ni resultados que permitan comparar este modelo con alternativas equivalentes.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo esta entrenado para transcripcion de lineas ya recortadas. No realiza deteccion de lineas ni segmentacion de paginas, por lo que requiere un paso previo de recorte.
- La etapa 2 especializa el modelo en Omar Al-Saleh; cabe esperar una degradacion del rendimiento en manuscritos con estilos caligraficos, fechas o soportes distintos a los de ese corpus.
- Los resultados publicados son de validacion, no de test. El autor subraya que el split de test no se uso para seleccion de checkpoint ni de hiperparametros, pero tampoco se reportan metricas finales de test.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir texto plausible que no corresponda a lo escrito en la imagen, especialmente en lineas borrosas, degradadas o con grafias poco frecuentes. No se documentan tasas de alucinacion.
- Idioma limitado al arabe; no se declara soporte de otras lenguas ni de transliteracion.
- Longitud de contexto no especificada; para lineas largas o para procesar varias lineas por peticion el comportamiento no esta documentado.
- El WER de corpus (0,339056) es notablemente alto en terminos absolutos, lo que implica que la salida necesita revision humana antes de considerarse una transcripcion definitiva.
- Restricciones de licencia: el repositorio declara Apache-2.0, lo que en principio permite uso comercial, pero la licencia del modelo base Qwen3.5-9B no se detalla en la informacion proporcionada y debe verificarse por separado. Ademas, el uso comercial de transcripciones de manuscritos puede estar sujeto a los derechos de las instituciones depositarias de las imagenes.
- El repositorio no publica el checkpoint completo fusionado, solo adaptadores; esto obliga a replicar el orden exacto de carga (etapa 1 fusionada y despues etapa 2) y anade fragilidad al despliegue.
- Sin descargas ni likes registrados en el momento de la ficha: no hay evidencia de uso en produccion ni de validacion independiente por terceros.
- No se documentan sesgos especificos ni evaluaciones de robustez frente a ruido, manchas, tinta traspasada o rotaciones.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/rakansuliman/qwen35-9b-arabic-manuscript-htr
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Coleccion Qwen3.5 en HuggingFace: https://huggingface.co/collections/Qwen/qwen35
- Dataset declarado en las etiquetas del modelo: TheSeniorTeam/Arabic_Manuscript_Collection_Dataset (https://huggingface.co/datasets/TheSeniorTeam/Arabic_Manuscript_Collection_Dataset)
- Repositorio de PEFT: https://github.com/huggingface/peft
- Los resultados de busqueda web disponibles no contienen enlaces relevantes a este modelo: devuelven paginas de localizacion de tiendas de una cadena de bricolaje, sin relacion con el modelo ni con HTR.
