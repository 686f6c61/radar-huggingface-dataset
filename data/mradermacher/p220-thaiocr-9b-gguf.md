# mradermacher/P220-ThaiOCR-9B-GGUF

## Resumen

P220-ThaiOCR-9B-GGUF es la distribucion en formato GGUF del modelo P220-ThaiOCR-9B, desarrollado originalmente por el usuario PorsukR y cuantizado por mradermacher. Se trata de un modelo multimodal especializado en reconocimiento optico de caracteres (OCR) y comprension de documentos, con enfasis en tailandes e ingles, incluyendo soporte para texto manuscrito. Con 9.197.093.888 parametros (aproximadamente 9,2 mil millones), se posiciona como un modelo de tamano medio orientado a tareas de vision-lenguaje aplicadas a digitalizacion documental.

La relevancia de este modelo radica en su especializacion: frente a modelos OCR genericos, incorpora etiquetas explicitas de `document-understanding` y `handwriting`, lo que sugiere un entrenamiento orientado a documentos reales con caligrafia y estructuras complejas. El tailandes es un idioma con escritura sin espacios entre palabras y con marcas diacriticas complejas, lo que historicamente ha dificultado el OCR automatico; un modelo dedicado de 9B parametros puede ofrecer ventajas frente a soluciones genericas.

Esta version GGUF, publicada por mradermacher, facilita el despliegue en entornos con recursos limitados mediante cuantizaciones que van desde Q2_K (4,0 GB) hasta f16 (18,5 GB), ademas de los ficheros mmproj necesarios para el procesamiento de imagen. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal vision-lenguaje, base PorsukR/P220-ThaiOCR-9B) |
| Parametros totales | 9.197.093.888 (aproximadamente 9,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | tailandes (th), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con ficheros mmproj para el componente multimodal) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base PorsukR/P220-ThaiOCR-9B en la informacion proporcionada. Por el tamano (9,2B parametros) y las etiquetas del repositorio (`ocr`, `document-understanding`, `handwriting`, multimodal con ficheros mmproj), se trata de un modelo vision-lenguaje que combina un codificador visual con un modelo de lenguaje, disenado para transcribir y comprender documentos. Los ficheros `mmproj` (multi-modal projection) confirman la presencia de un proyector que alinea las representaciones visuales con el espacio del modelo de lenguaje.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se detallan innovaciones tecnicas especificas como decodificacion especulativa o mecanismos de atencion lineal. La cuantizacion realizada por mradermacher es de tipo estatico (no se han generado, segun la model card, cuantizaciones ponderadas con imatrix en el momento de la publicacion).

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de documentos, con soporte declarado para tailandes e ingles.
- Comprension de documentos (`document-understanding`): interpretacion de estructura y contenido, no solo transcripcion literal.
- Reconocimiento de texto manuscrito (`handwriting`), segun las etiquetas del repositorio.
- Procesamiento multimodal: entrada de imagen combinada con instrucciones textuales (requiere los ficheros mmproj).
- Generacion de texto conversacional en tailandes e ingles (etiqueta `conversational`).
- Capacidad de function calling / tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode), audio u otras modalidades: no disponible.

## Casos de uso

- Digitalizacion de documentos administrativos tailandeses: el modelo puede transcribir formularios, certificados y documentos oficiales en tailandes, un idioma con escritura continua sin separacion de palabras, donde los OCR genericos suelen fallar. Se usaria enviando la imagen junto con una instruccion de transcripcion.
- Procesamiento de manuscritos y notas: gracias a la etiqueta `handwriting`, resulta adecuado para digitalizar notas manuscritas, apuntes o formularios rellenados a mano en entornos educativos o de archivo.
- Extraccion de datos de facturas y recibos: combinando OCR con comprension documental, permite extraer campos estructurados (importes, fechas, nombres) de documentos comerciales en tailandes e ingles para su volcado a sistemas de contabilidad.
- Atencion al cliente bilingue con soporte documental: integrado en un chatbot, puede interpretar imagenes enviadas por el usuario (capturas, documentos) y responder en tailandes o ingles, aprovechando la etiqueta `conversational`.
- Archivado y busqueda documental: transcripcion masiva de escaneos para construir indices de texto buscable en bibliotecas o repositorios institucionales tailandeses.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_M (5,9 GB) permiten ejecutar el modelo en GPUs de consumo, facilitando prototipos locales de OCR sin depender de servicios en la nube.
- Traduccion asistida de documentos: al manejar tailandes e ingles, puede transcribir un documento en tailandes y generar una version o resumen en ingles dentro del mismo flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y proyector visual):
  - Q2_K: aproximadamente 4,0 GB de pesos; en torno a 5-6 GB de VRAM total.
  - Q4_K_M (recomendada por el autor como rapida): aproximadamente 5,9 GB de pesos; en torno a 7-8 GB de VRAM total, mas el mmproj (0,7-1,0 GB).
  - Q8_0: aproximadamente 9,9 GB de pesos; en torno a 11-12 GB de VRAM total.
  - f16: aproximadamente 18,5 GB de pesos; requiere 20-22 GB de VRAM aproximadamente.
- GPU recomendadas: para Q4_K_M, una RTX 3060 de 12 GB o RTX 4070; para Q8_0, RTX 4080/4090 o A100; para f16, A100 40 GB o H100.
- Cabe en GPU de consumo: si, en configuraciones Q4_K_M o inferiores con GPUs de 8-12 GB (RTX 3060, RTX 4060 Ti 16 GB, RTX 4070). Las cuantizaciones Q2_K y Q3_K_S pueden caber en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con la API de endpoints (la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints tipo TGI/vLLM a traves de GGUF). vLLM con soporte GGUF es posible pero menos habitual; TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. A continuacion se ofrece una comparacion estructural basica con alternativas conocidas del mismo nicho (OCR multimodal), marcando como no disponible lo que no se puede verificar:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|
| P220-ThaiOCR-9B-GGUF | 9,2B | no disponible | th, en | Apache 2.0 | GGUF |
| Qwen2.5-VL-7B | 7B (aproximado) | no disponible | multilingue | Apache 2.0 (segun variante) | safetensors, GGUF |
| GOT-OCR2.0 | no disponible | no disponible | multilingue | no disponible | safetensors |
| InternVL2-8B | 8B (aproximado) | no disponible | multilingue | no disponible | safetensors |

La ventaja diferencial de P220-ThaiOCR-9B es su especializacion declarada en tailandes y manuscrito, frente a modelos OCR genericos multilingues. No obstante, sin benchmarks publicados no es posible cuantificar esa ventaja.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones cuantitativas, por lo que el rendimiento real en OCR tailandes o manuscrito no esta verificado de forma independiente.
- Sesgos conocidos: no disponible; al estar entrenado presumiblemente con documentos tailandeses e ingleses, puede degradarse con otros idiomas o escrituras.
- Riesgo de alucinacion: como todo modelo generativo, puede producir transcripciones plausibles pero incorrectas, especialmente en documentos con ruido, baja resolucion o caligrafia dificil; se recomienda validacion humana en flujos criticos.
- Limitaciones de contexto: la longitud de contexto no esta documentada; documentos muy largos o imagenes de alta resolucion pueden requerir troceado previo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no obstante, conviene verificar la licencia del modelo base PorsukR/P220-ThaiOCR-9B, ya que la model card del GGUF la declara como Apache 2.0 pero no se aporta documentacion adicional.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_M) pueden degradar notablemente la calidad de transcripcion; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M o superiores.
- Es necesario descargar y configurar correctamente los ficheros mmproj (Q8_0 o f16) para que el componente visual funcione; sin ellos el modelo no procesa imagenes.
- El modelo esta pensado para OCR y comprension documental; su uso como chatbot general no esta validado y puede dar resultados pobres fuera de ese dominio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/P220-ThaiOCR-9B-GGUF
- Modelo base: https://huggingface.co/PorsukR/P220-ThaiOCR-9B
- Pagina de descargas del autor: https://hf.tst.eu/model#P220-ThaiOCR-9B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
