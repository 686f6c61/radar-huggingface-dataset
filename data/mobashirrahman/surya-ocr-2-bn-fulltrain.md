# mobashirrahman/surya-ocr-2-bn-fulltrain

## Resumen

Surya OCR 2 — Bengali word-crop full-train es un ajuste fino del modelo multimodal `datalab-to/surya-ocr-2` (665,7 millones de parametros, clase `Qwen3_5ForConditionalGeneration`) especializado en reconocimiento optico de caracteres (OCR) de palabras y recortes de texto bengali impreso. Lo publica el usuario de HuggingFace `mobashirrahman` como checkpoint autonomo en fp16, con los pesos LoRA ya fusionados, de modo que se carga directamente con `transformers` mediante `AutoModelForImageTextToText` sin necesidad de codigo de adaptadores.

El problema que aborda es concreto: el modelo base comete errores sustanciales al transcribir recortes de palabra en bengali (10,03 % CER en el split de test de Mozhi-Bengali), y este ajuste reduce esa tasa hasta el 0,89 % CER (1,95 % WER) sobre 9.233 recortes de test, con una tasa de error catastrofico (CER > 1,0) de 1 caso frente a 200 del modelo sin ajustar. Para referencia, el motor bbOCR, el mejor alternativo en ese mismo benchmark segun el autor, obtiene 1,28 % CER.

Es relevante ahora porque el bengali es un idioma con recursos limitados en OCR de alta precision y porque el ajuste se ha realizado con un coste muy bajo: LoRA de 6,7 millones de parametros entrenables (aproximadamente el 1,0 % del total) sobre una unica GPU de consumo (RTX 2060 Super de 8 GB). El alcance esta deliberadamente acotado al reconocimiento a nivel de recorte o palabra, no de pagina completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (`Qwen3_5ForConditionalGeneration`), con codificador de vision y decodificador de lenguaje |
| Parametros totales | 665.701.440 (aproximadamente 665,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publica el checkpoint fusionado en fp16. No se documentan variantes GGUF, AWQ, GPTQ ni otras |
| Idiomas soportados | bengali (bn) |
| Licencia | OpenRAIL (etiqueta `openrail`, coincidente con el modelo base) |
| Formato de pesos | safetensors, fp16, compatible con `transformers>=5.17` |
| Tamano del repositorio | 1,3 GB |
| Modelo base | `datalab-to/surya-ocr-2` |
| Modalidad de entrada/salida | image-text-to-text (imagen de recorte a texto con envoltura HTML) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer multimodal de tipo image-text-to-text identificado con el tag `qwen3_5` y la clase `Qwen3_5ForConditionalGeneration`, que combina un codificador de vision con un decodificador de lenguaje. El ajuste no modifica la topologia; se aplico un LoRA con `r=8`, `alpha=16`, `dropout=0.05` sobre todas las capas lineales, incluido el codificador de vision, con 6,7 millones de parametros entrenables (aproximadamente el 1,0 % del total, ~1,33 GB de pesos del adaptador). Los adaptadores se fusionaron posteriormente en los pesos completos, dando lugar a un checkpoint fp16 autonomo.

Los datos de entrenamiento proceden del split oficial *train* de Mozhi-Bengali (IIIT Hyderabad / NLTM), con 80.113 recortes de palabra en una unica pasada y el prompt de recorte `"OCR this block image to HTML."`. La configuracion de entrenamiento fue AdamW con `lr=1e-4`, batch efectivo de 8, precision fp16 y una sola GPU de consumo (RTX 2060 Super de 8 GB), usando `peft==0.20.0`. Se respetaron las particiones oficiales: ningun ejemplo de entrenamiento solapa con los splits de validacion o test de Mozhi ni con las paginas de test de REID. La semilla fija empleada para el holdout interno de desarrollo fue 20260913. No se documenta el uso de RLHF ni de DPO; el autor solo describe ajuste supervisado sobre pares imagen-texto y decodificacion greedy en la evaluacion.

## Capacidades

- Reconocimiento OCR de recortes de palabra en bengali impreso, con salida de texto envuelto en etiquetas HTML (por ejemplo, `<h2>...</h2>`) que debe limpiarse para obtener texto plano.
- Transcripcion de alta precision en el dominio de recortes: 0,89 % CER y 1,95 % WER en 9.233 recortes de test de Mozhi-Bengali con decodificacion greedy.
- Entrada multimodal de imagen y texto: acepta una imagen de recorte junto con una instruccion textual de OCR.
- Manejo de formato conversacional mediante `apply_chat_template` con la estructura de mensajes `user` y contenido mixto imagen-texto.
- Generacion determinista recomendada: el autor validacion todas las cifras con decodificacion greedy (`do_sample=False`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, ni capacidades de audio o video.
- Capacidad multilingue limitada al bengali: el autor no reporta resultados en otros idiomas y el ajuste se hizo exclusivamente sobre datos en bengali.

## Casos de uso

- Digitalizacion de documentos bengalies impresos: el modelo se aplica sobre recortes de palabra extraidos previamente por un detector de layout o de lineas, y devuelve la transcripcion de cada recorte con un CER del 0,89 %, lo que reduce la necesidad de correccion manual posterior en proyectos de archivo.
- Construccion de corpus de texto en bengali para investigacion en PLN: permite convertir colecciones de imagenes de palabras en texto plano utilizable para entrenar modelos de lenguaje en un idioma con pocos recursos, con la ventaja de una tasa de error catastrofico de 1 entre 9.233 recortes.
- Pasarela OCR dentro de un pipeline modular: al ser un modelo exclusivamente de recorte, encaja como etapa intermedia despues de la deteccion de regiones y antes de un posprocesado de lenguaje, lo que facilita sustituir solo esta etapa sin alterar el resto del sistema.
- Lectura automatica de formularios y etiquetas en bengali: campos de texto corto, nombres, importes o codigos impresos pueden recortarse y enviarse al modelo, que devuelve la cadena reconocida lista para validacion contra una base de datos.
- Extraccion de terminos para busqueda documental: indexar palabras clave de documentos escaneados en bengali permite construir indices de busqueda sobre fondos que antes solo eran consultables como imagen.
- Evaluacion comparativa de motores OCR: gracias a que el autor publica cifras reproducibles sobre el split de test de Mozhi (9.233 recortes) y a que compara con bbOCR, el modelo sirve como referencia de linea base para investigaciones sobre OCR en escrituras indicas.
- Prototipado en hardware de gama media: con aproximadamente 1,33 GB de pesos en fp16 y un entrenamiento realizado en una RTX 2060 Super, es viable desplegarlo en estaciones de trabajo modestas para pruebas de concepto sin acceso a GPU de centro de datos.
- Anotacion asistida de datasets: transcripciones automaticas de recortes que despues se revisan y corrigen por anotadores humanos, reduciendo el coste por muestra en la creacion de corpus en bengali.

## Benchmarks y rendimiento

| Split y metrica | Modelo base sin ajustar (zero-shot) | Este modelo |
|---|---|---|
| Mozhi-Bengali test, 9.233 recortes de palabra — CER | 10,03 % | 0,89 % |
| Mozhi-Bengali test, 9.233 recortes de palabra — WER | no disponible | 1,95 % |
| Tasa de error catastrofico (CER > 1,0) en Mozhi-Bengali test | 200 / 9.233 | 1 / 9.233 |
| REID2019, 51 paginas historicas (fuera de dominio, prompt de pagina) — CER | 19,21 % | no disponible (entrenamiento solo de recortes; el autor remite a las notas del paper) |

Referencia externa aportada por el autor: bbOCR, el otro motor mas fuerte en el split de test de Mozhi en su benchmark, obtiene 1,28 % CER.

Advertencias metodologicas declaradas por el propio autor: las cifras absolutas se midieron con `transformers.generate()` sin servidor intermedio, mientras que las cifras del Surya original del benchmark oficial se produjeron con otro backend de servicio, por lo que la comparacion entre tablas arrastra esa cautela. La metrica CER empleada es la canonica, con normalizacion NFC, plegado de comillas y colapso de espacios, promediada de forma micro.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,33 GB en fp16 (665,7 millones de parametros) y aproximadamente 2,66 GB en fp32. A ello hay que sumar la memoria de activaciones y del codificador de vision, no cuantificada en la informacion disponible.
- Entrenamiento verificado en una unica GPU de consumo: RTX 2060 Super de 8 GB, en fp16 y con batch efectivo de 8. Esto indica que la inferencia cabe holgadamente en GPU de gama media y baja.
- GPU recomendadas: no disponible de forma explicita. Por el perfil de memoria, cualquier GPU con 4-8 GB de VRAM o mas (RTX 2060 Super, RTX 3060, RTX 4060, RTX 4090, A100, H100) puede alojar el modelo; no se documentan pruebas en GPU de centro de datos.
- Compatibilidad con GPU de consumo: si, segun el propio autor, que entreno y ejecuto el modelo en una RTX 2060 Super de 8 GB.
- Opciones de despliegue: `transformers` nativo mediante `AutoModelForImageTextToText` y `AutoProcessor`, con `transformers>=5.17` para resolver la arquitectura `qwen3_5`. Requiere `torch` y `pillow`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ni se publican pesos GGUF que permitan su uso en esas herramientas.
- Latencia y throughput: no disponible. El autor no publica mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER en Mozhi-Bengali test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mobashirrahman/surya-ocr-2-bn-fulltrain | 665,7 M (665.701.440) | no disponible | 0,89 % (WER 1,95 %) | OpenRAIL | HuggingFace, safetensors fp16 |
| datalab-to/surya-ocr-2 (base, zero-shot) | no disponible (mismo orden de magnitud, segun el autor 665,7 M para la clase `Qwen3_5ForConditionalGeneration`) | no disponible | 10,03 % | OpenRAIL | HuggingFace |
| bbOCR | no disponible | no disponible | 1,28 % | no disponible | motor externo citado por el autor, sin enlace en la informacion proporcionada |

La comparacion esta limitada por la ausencia de datos publicos de parametros, contexto y licencia para bbOCR, y por la advertencia del autor sobre diferencias de backend entre mediciones. No se dispone de otras alternativas comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Alcance restringido a recortes: el modelo no se entreno con paginas completas ni con el prompt de nivel de pagina. El autor indica que el rendimiento en paginas historicas impresas fue aproximadamente neutro respecto al modelo base y desaconseja usar el prompt de pagina (`HIGH_ACCURACY_BBOX_PROMPT`).
- Fragilidad en la decodificacion: no deben aplicarse penalizaciones por repeticion ni bloqueo de n-gramas. Segun el autor, con `repetition_penalty=1.3` y `no_repeat_ngram_size=4` el CER de nivel de pagina paso de aproximadamente el 19 % a aproximadamente el 108 %, por un comportamiento fragil de la secuencia de fin (EOS). Todas las cifras reportadas usan decodificacion greedy simple.
- Riesgo de alucinacion: no se documenta de forma explicita, pero al tratarse de un modelo generativo de lenguaje aplicado a OCR existe riesgo de sustituciones, inserciones u omisiones de caracteres en recortes de baja calidad, especialmente en entradas fuera de dominio (texto manuscrito, ruido, degradacion severa). El autor solo cuantifica el error en el dominio de recortes de Mozhi-Bengali y en el benchmark fuera de dominio REID para el modelo base.
- Cobertura idiomatica: exclusivamente bengali (bn). No se reportan resultados en otros idiomas ni se ha entrenado con ellos.
- Restricciones de licencia: OpenRAIL, con las restricciones de uso asociadas a este tipo de licencia. Cualquier uso comercial debe revisarse contra los terminos completos de OpenRAIL y de la licencia del modelo base.
- Obligacion de atribucion de datos: el conjunto Mozhi-Bengali (IIIT Hyderabad / NLTM) se distribuye bajo CC BY 4.0, y el autor exige atribucion a IIIT Hyderabad / NLTM para derivados y publicaciones.
- Ausencia de validacion externa: el repositorio registra 0 descargas y 0 "me gusta" en el momento de la consulta, y no se documentan revisiones por pares ni evaluaciones independientes de este checkpoint.
- Caveat metodologico: las comparaciones entre las cifras de este modelo (generadas con `transformers.generate()` sin servidor) y las del benchmark oficial de Surya (producidas con otro backend de servicio) no son estrictamente homogeneas, tal como advierte el propio autor.
- Operacion de posprocesado necesaria: la salida llega envuelta en etiquetas HTML (por ejemplo `<h2>...</h2>`), por lo que hay que eliminar el marcado para obtener texto plano.
- Longitud de contexto y limites de tokens de salida: no disponibles. El autor emplea `max_new_tokens=64` en el ejemplo, adecuado para recortes individuales pero no para bloques extensos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mobashirrahman/surya-ocr-2-bn-fulltrain
- Modelo base: https://huggingface.co/datalab-to/surya-ocr-2
- Documentacion metodologica citada por el autor: `docs/en/SURYA2_BANGLA_FINETUNE.md` en el proyecto pdf-craft (ruta indicada en la model card; no se proporciona URL)
- Conjunto de datos de entrenamiento: Mozhi-Bengali, IIIT Hyderabad / NLTM, licencia CC BY 4.0 (no se proporciona URL en la informacion disponible)
- Nota: la busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los enlaces recuperados corresponden a servicios de mensajeria ajenos al ambito de esta ficha), por lo que no hay papers, blogs ni demos adicionales que enlazar.
