# ahmedsamirtarjama/arabic-ocr-dots-ft-layout-v4

## Resumen

arabic-ocr-dots-ft-layout-v4 es un ajuste fino orientado a OCR y analisis de maquetacion de documentos en arabe, construido sobre el modelo multimodal rednote-hilab/dots.mocr. Lo publica el usuario ahmedsamirtarjama como proyecto de investigacion y se distribuye con 3.039.179.264 parametros totales (aproximadamente 3,04 mil millones) y un repositorio de 6,1 GB en formato safetensors, cargable con la libreria transformers.

El modelo resuelve el problema de extraer texto y estructura de documentos arabes (lineas, bloques, orden de lectura y maquetacion) mediante generacion de texto condicionada por imagen. Su relevancia es acotada: se trata de un experimento de investigacion con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin resultados de evaluacion publicados en la informacion disponible, por lo que no debe considerarse un artefacto listo para produccion sin validacion previa.

La receta de inferencia declarada por el autor es vLLM con el prompt `prompt_layout_all_en`, temperatura 0,1, top_p 1,0 y max_tokens 8192, seguida de un postprocesado propio (`trim_tail` y `trim_v2`) cuyo codigo vive en un repositorio de dataset separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de generacion de texto con torre de vision; el autor indica que la torre de vision se mantuvo congelada durante el ajuste) |
| Parametros totales | 3.039.179.264 (aproximadamente 3,04 mil millones) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible oficialmente; las etiquetas del repositorio indican `arabic` y el objetivo declarado es OCR en arabe |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-generation |
| Libreria | transformers (requiere `custom_code`) |
| Modelo base | rednote-hilab/dots.mocr (las etiquetas tambien referencian dots-studio/dots.mocr) |
| Tamano del repositorio | 6,1 GB |
| Fecha de creacion | 2026-10-13 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base dots.mocr en la informacion proporcionada. Lo unico documentado por el autor es que se trata de un ajuste fino de tipo LoRA con rango 64 (LoRA r64) fusionado posteriormente en los pesos del modelo base, y que la torre de vision permanecio congelada durante todo el entrenamiento. Esto implica que la adaptacion se aplico exclusivamente sobre el componente de lenguaje, manteniendo intacto el extractor visual del modelo original.

Tampoco se declaran el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. El autor remite los detalles experimentales a los ficheros `docs/TEST_PROTOCOL.md` y `REPORT.md` alojados en el repositorio de dataset `arabic-ocr-research-data` (carpeta `code`), junto con los scripts de postprocesado en `code/scripts/`. Los pesos se publican directamente en safetensors sin cuantizar, con un total de 3,04 mil millones de parametros.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre documentos en arabe, con generacion de texto a partir de imagenes.
- Analisis de maquetacion documental: el nombre del modelo y el prompt de inferencia (`prompt_layout_all_en`) sugieren extraccion de estructura y disposicion de bloques, aunque no se especifica el esquema exacto de salida.
- Procesamiento multimodal: al derivar de dots.mocr, el modelo conserva la torre de vision del original, congelada durante el ajuste.
- Generacion de texto autoregresiva con ventana de salida configurable; la receta del autor emplea max_tokens 8192 con temperatura 0,1 y top_p 1,0.
- Postprocesado especifico para OCR: funciones `trim_tail` y `trim_v2` para limpiar la salida generada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues fuera del arabe: no disponible.
- Modo de razonamiento explicito (thinking mode), audio o vision generativa: no disponible.

## Casos de uso

- Digitalizacion de archivos administrativos arabes: el modelo puede convertir imagenes de documentos escaneados en texto estructurado, aprovechando su especializacion en OCR arabe y su capacidad de analisis de maquetacion para preservar el orden de lectura.
- Extraccion de datos de facturas y formularios en arabe: la deteccion de disposicion de bloques permite separar campos (encabezado, lineas de detalle, totales) en lugar de devolver texto plano, lo que facilita su volcado posterior a una base de datos.
- Indexacion y busqueda documental: un pipeline puede pasar cada pagina por el modelo y almacenar la salida en un motor de busqueda o en un indice vectorial, habilitando recuperacion sobre corpus en arabe que antes solo existian en papel.
- Preservacion de patrimonio documental: bibliotecas y archivos historicos con fondos en arabe pueden usar el modelo para generar transcripciones asistidas, sujetas siempre a revision humana dado el caracter experimental del ajuste.
- Preprocesado para traduccion automatica: la transcripcion OCR de calidad es el paso previo imprescindible para alimentar sistemas de traduccion arabe a castellano; el modelo actua como primer eslabon de esa cadena.
- Investigacion academica en OCR arabe: sirve como punto de partida reproducible (LoRA r64 sobre dots.mocr) para comparar tecnicas de ajuste en un dominio con pocos recursos publicos.
- Procesamiento por lotes en servidor: con la receta indicada (vLLM, temperatura 0,1, max_tokens 8192) puede desplegarse como servicio de inferencia para procesar volumenes grandes de documentos de forma desatendida.
- Extraccion de tablas y listas en documentos tecnicos: la componente de layout permite reconstruir relaciones espaciales que un OCR de linea suelta perderia.

No se recomienda ninguno de estos casos en produccion sin una evaluacion propia previa, dada la ausencia de licencia declarada y de resultados verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a `docs/TEST_PROTOCOL.md` y `REPORT.md` en el repositorio `arabic-ocr-research-data/code`, pero no se incluyen cifras (CER, WER, precision de layout ni comparaciones con otros modelos) en la model card ni en los metadatos del repositorio de HuggingFace.

| Benchmark | Resultado |
|---|---|
| CER / WER en arabe | no disponible |
| Precision de layout | no disponible |
| MMLU / HumanEval / GSM8K | no aplicable / no disponible |
| Comparacion con el modelo base | no disponible |

## Requisitos de hardware

- VRAM estimada en precision completa (FP16/BF16): aproximadamente 6,1 GB solo para los pesos, en linea con el tamano del repositorio; anadir entre 2 y 6 GB adicionales para cache KV y activaciones segun la longitud de contexto y el tamano de lote.
- VRAM estimada en cuantizacion de 8 bits: en torno a 3,5-4 GB para pesos, mas overhead de inferencia.
- VRAM estimada en cuantizacion de 4 bits: en torno a 2-2,5 GB para pesos; requiere convertir los safetensors, ya que el repositorio no publica variantes cuantizadas.
- GPU recomendadas: una RTX 4090 (24 GB) o RTX A6000 (48 GB) es suficiente para inferencia en FP16 con margen amplio; A100 (40/80 GB) y H100 estan sobredimensionadas para este tamano y se justificarian solo por concurrencia o procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: si. Con 3,04 mil millones de parametros, entra en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits, y en GPUs de 16 GB o mas en FP16.
- Opciones de despliegue: el autor documenta vLLM como motor de inferencia. Al cargarse con transformers y requerir `custom_code`, es probable que necesite `trust_remote_code=True` y una version concreta de la libreria; no se confirma compatibilidad con llama.cpp, Ollama ni TGI, y al no haber pesos GGUF publicados, llama.cpp requeriria conversion manual.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de tiempo por pagina.

## Comparativa con modelos similares

La informacion disponible no permite una comparacion cuantitativa fiable. Se incluye la comparacion estructural con el modelo base y con alternativas de categoria, marcando como "no disponible" todo dato no verificado.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arabic-ocr-dots-ft-layout-v4 | 3,04 mil millones | no disponible | no disponible | no disponible | HuggingFace, safetensors, 0 descargas |
| rednote-hilab/dots.mocr (base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Alternativas de OCR en arabe de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han identificado en la busqueda web modelos comparables con datos verificables. Cualquier comparacion con sistemas como GOT-OCR, Nougat o modelos vision-language de ~3B requiere consultar sus fichas oficiales y ejecutar una evaluacion propia sobre el mismo conjunto de documentos.

## Limitaciones y advertencias

- Ausencia total de licencia: el repositorio no declara licencia, lo que en la practica impide el uso comercial con garantias juridicas y desaconseja cualquier despliegue en produccion.
- Modelo experimental sin validacion: se autodefine como "experiment" y acumula 0 descargas y 0 likes, sin evidencia de uso o verificacion por terceros.
- Sin resultados publicados: no hay cifras de CER, WER ni precision de layout en la informacion disponible; el propio autor delega los resultados en documentos externos no incluidos aqui.
- Riesgo de alucinacion: al ser un modelo generativo aplicado a OCR, puede producir texto plausible que no aparece en la imagen, especialmente en documentos con ruido, tipografias manuscritas o baja resolucion. Toda salida requiere verificacion.
- Dependencia de codigo personalizado: requiere `custom_code`, lo que implica `trust_remote_code=True` y un riesgo de seguridad y de reproducibilidad si el codigo remoto cambia o desaparece.
- Ambito linguistico restringido: el ajuste esta orientado al arabe; no hay evidencia de calidad en otros idiomas ni de manejo de documentos bilingues.
- Postprocesado obligatorio: la receta de inferencia depende de funciones propias (`trim_tail`, `trim_v2`) alojadas en otro repositorio; sin ellas la salida puede contener colas espurias.
- Longitud de contexto desconocida: no se documenta la ventana de contexto del modelo, por lo que no puede planificarse el procesamiento de documentos muy largos ni de multiples paginas en una sola pasada.
- Sin datos de sesgo: no se han publicado analisis de sesgo ni de robustez frente a distintas variantes dialectales del arabe o tipos de documento.
- Trazabilidad de metadatos: las etiquetas apuntan a dots-studio/dots.mocr mientras que el README y la model card citan rednote-hilab/dots.mocr, lo que introduce ambiguedad sobre el linaje exacto de los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahmedsamirtarjama/arabic-ocr-dots-ft-layout-v4
- Modelo base (segun model card): https://huggingface.co/rednote-hilab/dots.mocr
- Modelo base (segun etiquetas del repositorio): https://huggingface.co/dots-studio/dots.mocr
- Repositorio de datos y codigo del autor: `arabic-ocr-research-data` en HuggingFace (referenciado como dataset, con los ficheros `docs/TEST_PROTOCOL.md`, `REPORT.md` y `code/scripts/`); no se ha verificado la URL exacta en la informacion disponible.
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo ni sobre su modelo base: los unicos enlaces recuperados proceden de un foro para adultos y no guardan ninguna relacion con el contenido de esta ficha, por lo que se descartan.
