# sherif1313/3arab-OCR-v1

## Resumen

3arabOCR-v1 es un modelo multimodal de reconocimiento optico de caracteres (OCR) en arabe, desarrollado por el usuario sherif1313 y publicado en Hugging Face bajo licencia Apache-2.0. Con aproximadamente 3.336 millones de parametros, combina un encoder visual basado en CLIP y SAM con un proyector multimodal entrenable y un modelo de lenguaje de arquitectura MoE inspirado en DeepSeekV2 con 64 expertos. Su tarea principal es la transcripcion de texto arabe a partir de imagenes, con soporte de contexto de hasta 32.768 tokens.

El modelo esta especificamente ajustado para libros arabes impresos, manuscritos historicos, documentos de archivo, poesia arabe y documentos con estilos de escritura manual variados. El autor reporta una tasa de error de caracteres (CER) del 0,80% en libros impresos y del 1,07% en escritura manuscrita, sobre una evaluacion interna con 30 imagenes por categoria. Estas cifras, si se confirman de forma independiente, situarian al modelo en un rango competitivo para OCR arabe de documentos historicos, un dominio tradicionalmente dificil por la cursividad, la diacritizacion y la variabilidad caligrafica.

El modelo es relevante ahora por dos motivos. Primero, aborda un nicho poco cubierto por los OCR genericos, que suelen tener un rendimiento muy inferior en arabe que en alfabetos latinos. Segundo, se distribuye con pesos pre-cuantizados a 4 bits, lo que reduce los requisitos de VRAM a un rango de 3 a 6 GB y permite ejecutarlo en GPU de consumo. Como contrapartida, la publicacion es muy reciente y no acumula descargas ni validacion externa, y su model card esta truncada en la seccion de limitaciones conocidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language multimodal con MoE (encoder de vision CLIP + SAM, proyector multimodal entrenable, LM MoE basado en DeepSeekV2) |
| Parametros totales | 3.336.106.497 (~3,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 32.768 tokens |
| Tipos de cuantizacion | 4-bit mediante bitsandbytes (el repositorio incluye pesos pre-cuantizados a 4 bits); bfloat16 en precision completa |
| Idiomas soportados | arabe (codigo `ar`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, con codigo de modelado personalizado (`custom_code`, requiere `trust_remote_code=True`) |
| Expertos (MoE) | 64 |
| Encoder de vision | CLIP + SAM |
| Modelo de lenguaje | DeepSeekV2 MoE |
| Tarea principal | OCR de arabe (pipeline `image-to-text`) |
| Tamano del repositorio | 2,8 GB |
| Fecha de creacion | 2026-09-17 |
| Ultima actualizacion | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura es multimodal de tipo vision-language. La parte visual combina representaciones de CLIP con representaciones espaciales de SAM, que se unen mediante un proyector multimodal entrenable. La parte de generacion de texto es un modelo de lenguaje con mezcla de expertos (MoE) basado en DeepSeekV2, con 64 expertos, lo que explica que el recuento total de parametros (~3,3 B) no se corresponda con el coste computacional de activacion en cada token. El autor no especifica el numero de parametros activos por token ni la top-k de enrutamiento.

En cuanto a los datos de entrenamiento, la model card indica que el modelo fue ajustado y entrenado adicionalmente sobre libros arabes impresos, manuscritos historicos, documentos historicos, poesia arabe y documentos con estilos de escritura manuscrita variados. No se publican el numero de tokens de entrenamiento, la composicion exacta del dataset, la mezcla de idiomas ni si se emplearon tecnicas de alineacion como RLHF o DPO. Tampoco se detalla la receta de destilacion, el regimen de entrenamiento del proyector multimodal ni la estrategia de preentrenamiento del encoder.

Como innovaciones tecnicas destacables, la model card menciona el soporte de contexto largo (hasta 32.768 tokens), util para paginas densas y transcripciones extensas, y una estrategia de tiling de pagina que divide automaticamente imagenes grandes en recortes para mejorar el reconocimiento de texto pequeno o muy denso. La interfaz de inferencia expone parametros como `base_size`, `image_size`, `crop_mode`, `max_length`, `no_repeat_ngram_size` y `ngram_window`, orientados a controlar el equilibrio entre resolucion, coste de memoria y repeticiones en la salida.

## Capacidades

- Reconocimiento de texto arabe impreso a partir de imagenes, con CER reportado del 0,80% y WER del 3,22% en la categoria de libros impresos.
- Reconocimiento de escritura manuscrita y material historico, con CER reportado del 1,07% y WER del 4,72%.
- Procesamiento de paginas completas y documentos extensos gracias a una ventana de contexto de hasta 32.768 tokens.
- Tiling automatico de paginas grandes en multiples recortes para mejorar la lectura de texto pequeno o denso.
- Conversion de paginas de PDF a imagenes e inferencia por lotes, segun el ejemplo de codigo incluido en la model card (renderizado a 200 DPI con PyMuPDF).
- Generacion de texto en arabe como salida del proceso de OCR (pipeline `image-to-text`).
- Modo de parsing de documento mediante el prompt `<image>document parsing.`
- Soporte de `device_map="auto"` para repartir el modelo entre varias GPU.

No hay informacion sobre soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, vision general (mas alla del OCR), audio ni modo de razonamiento explicito.

## Casos de uso

- Digitalizacion de fondos bibliotecarios: el modelo esta ajustado especificamente para libros arabes impresos, con un CER reportado por debajo del 1%, por lo que resulta adecuado para convertir catalogos y colecciones escaneadas en texto plano indexable. Con 32.768 tokens de contexto puede procesar paginas densas sin fragmentar en exceso la salida.
- Recuperacion de patrimonio documental: los archivos historicos, escrituras y correspondencia presentan tipografias y soportes degradados; el ajuste sobre manuscritos historicos y la combinacion CLIP + SAM para representacion espacial ayudan a mantener la alineacion entre region de imagen y texto generado.
- Transcripcion de poesia arabe: la poesia exige preservar saltos de verso y estructura; al operar como modelo generativo con contexto largo, la salida puede formatearse de forma mas fiel que con OCR de lineas aisladas, aunque requiere revision humana por el riesgo de reescritura.
- Procesamiento por lotes de PDF completos: el ejemplo oficial convierte cada pagina a PNG a 200 DPI y llama a `model.infer` con `crop_mode=True`, un flujo directamente reutilizable en pipelines de digitalizacion masiva con GPU de consumo gracias a los 3-6 GB de VRAM de la version 4 bits.
- Construccion de corpus para NLP arabe: la transcripcion de libros y documentos alimenta entrenamiento de modelos de lenguaje, busqueda semantica o sistemas RAG sobre corpus arabes, donde la calidad del OCR condiciona directamente la calidad del indice.
- Analisis documental en investigacion historica: investigadores pueden buscar terminos, toponimos o nombres en corpus de archivo completos sin lectura manual previa, usando el modelo como capa de extraccion y un motor de busqueda sobre la salida.
- Atencion a documentos administrativos y notariales historicos: la model card menciona explicitamente documentos, escrituras y correspondencia, un caso frecuente en archivos judiciales y notariales donde la escritura es relativamente formal pero el soporte esta degradado.
- Digitalizacion en entornos con hardware limitado: al distribuirse con pesos de 4 bits, el modelo cabe en GPU de gama media, lo que permite desplegar OCR arabe en estaciones de trabajo sin aceleradores de centro de datos.

## Benchmarks y rendimiento

La model card incluye unicamente una evaluacion interna del propio autor, realizada con la libreria `jiwer`, sobre cuatro categorias de texto arabe con 30 imagenes por categoria. Solo se publican resultados de dos categorias.

| Categoria | CER | WER |
|---|---|---|
| Libros arabes impresos | 0,80% | 3,22% |
| Escritura manuscrita arabe | 1,07% | 4,72% |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se ofrece comparacion con otros sistemas de OCR arabe dentro de la model card, ni se detalla el conjunto de referencia empleado mas alla de la descripcion metodologica. El autor senala que la escritura manuscrita muy dificil sigue siendo un area activa de desarrollo.

## Requisitos de hardware

- VRAM estimada para inferencia: 3-6 GB con la version pre-cuantizada a 4 bits, en funcion de la resolucion de imagen, el numero de recortes del tiling, la longitud de salida y el tamano de lote.
- VRAM para el modelo en precision completa: aproximadamente 8 GB segun la model card.
- GPU de consumo: el modelo cabe en tarjetas con 8 GB o mas de VRAM, como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070. Con 3-6 GB en 4 bits tambien es viable en GPUs de 8 GB, siempre con margen ajustado.
- GPU de centro de datos: A100, H100 o L40S son suficientes y dejan margen amplio; tambien es posible repartir el modelo entre varias GPU con `device_map="auto"`.
- Dependencias criticas: `transformers>=4.57.1`, `bitsandbytes` (obligatorio, los pesos del repositorio ya vienen cuantizados a 4 bits), `safetensors`, `einops`, `sentencepiece` y `pillow`. Python 3.10 o superior (probado en 3.12).
- Opciones de despliegue: el modelo requiere `trust_remote_code=True` porque incluye codigo de modelado personalizado, por lo que la via soportada es la libreria `transformers` con el metodo `infer` documentado. No se indica compatibilidad con vLLM, TGI, Ollama o llama.cpp; al no distribuirse pesos en formato GGUF, el despliegue en llama.cpp u Ollama no esta soportado segun la informacion disponible.
- Latencia y throughput: no disponible. No se publican mediciones de latencia por pagina ni de tokens por segundo.

## Comparativa con modelos similares

No se han publicado en la informacion disponible datos comparativos frente a otros sistemas de OCR arabe (por ejemplo, modelos de la familia DeepSeek-OCR, Qwen-VL o pipelines clasicos como Tesseract con paquetes de idioma arabe). Por tanto, la comparacion cuantitativa de parametros, contexto, rendimiento, licencia y disponibilidad se indica como no disponible.

Lo unico contrastable con la informacion aportada es lo siguiente:

| Aspecto | 3arabOCR-v1 | Alternativas |
|---|---|---|
| Parametros | ~3,3 B (MoE, 64 expertos) | no disponible |
| Contexto | 32.768 tokens | no disponible |
| Rendimiento | CER 0,80% impreso / 1,07% manuscrito (evaluacion interna del autor) | no disponible |
| Idiomas | Solo arabe | no disponible |
| Licencia | Apache-2.0 | no disponible |
| Formato | safetensors pre-cuantizado a 4 bits, requiere `trust_remote_code` | no disponible |

## Limitaciones y advertencias

- La seccion "Known limitations" de la model card esta truncada, por lo que no se pueden enumerar las limitaciones declaradas por el autor mas alla de la mencion a que la escritura manuscrita muy dificil sigue siendo un area en desarrollo.
- Al ser un modelo generativo y no un OCR discriminativo clasico, existe riesgo de alucinacion: puede generar texto plausible que no aparece en la imagen, especialmente en zonas degradadas, borrosas o con grafias ambiguas. Es recomendable revision humana o verificacion cruzada en usos criticos.
- El modelo esta especializado exclusivamente en arabe. No hay evidencia de soporte para alfabetos latino, cirilico, hebreo u otros, ni para textos mixtos arabe-ingles frecuentes en documentacion tecnica.
- Los resultados de benchmarks son una evaluacion interna del propio autor, con 30 imagenes por categoria, sin validacion independiente ni conjunto de test publico. Las cifras de CER y WER deben tomarse como orientativas.
- El modelo no acumula descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad y de informes de errores externos.
- La licencia Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre conservando el aviso de licencia y los avisos de atribucion correspondientes. No se declaran restricciones adicionales de uso.
- El repositorio incluye codigo de modelado personalizado que se ejecuta con `trust_remote_code=True`. Esto implica ejecutar codigo del autor en el proceso de carga del modelo, con el consiguiente riesgo de seguridad en entornos no controlados; conviene auditar el codigo antes de desplegarlo en produccion.
- El modelo depende obligatoriamente de `bitsandbytes`, ya que los pesos publicados estan pre-cuantizados a 4 bits. Esto puede complicar el despliegue en entornos con restricciones de dependencias o en plataformas que no soportan esa libreria.
- No se documentan sesgos especificos, pero un modelo entrenado sobre un corpus arabe no declarado puede heredar sesgos dialectales o de registro (arabe estandar frente a variantes regionales) dificiles de auditar al no publicarse la composicion del dataset.
- Los requisitos de memoria dependen fuertemente de la resolucion de imagen y del numero de recortes generados por el tiling; en paginas grandes con `crop_mode=True`, el consumo puede superar el rango inferior de 3 GB.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sherif1313/3arab-OCR-v1
- Repositorio GitHub del proyecto: https://github.com/sherif1313/3arab-OCR/
- Perfil de Hugging Face del autor: https://huggingface.co/sherif1313/
- Cookbooks del autor: https://github.com/sherif1313/3arabLM
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Gentoooo-AI/3arab-OCR
- Libreria jiwer (empleada para el calculo de CER y WER): no disponible en la model card como enlace directo, mencionada por nombre
