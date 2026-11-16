# Evoliq/Unflatten-W-Dense-1.0

## Resumen

Unflatten W Dense 1.0 es un modelo especializado en reconstruccion de documentos desarrollado por Evoliq s.r.o. (Republica Checa). Su tarea no es la generacion de texto libre, sino convertir la imagen rasterizada de una pagina en una representacion estructurada de documento con propiedades nativas de Word (parrafos, runs de texto, tablas y posicionamiento de imagenes), que un renderizador determinista del runtime de Unflatten transforma en un fichero `.docx` editable. Se apoya en el backbone congelado Qwen3-VL-4B-Instruct, sobre el que se anaden modulos entrenados de reconstruccion y cabezas de propiedades tipadas.

Tecnicamente es un modelo multimodal vision-lenguaje de aproximadamente 4.000 millones de parametros (heredados del backbone Qwen3-VL-4B-Instruct), con decodificacion restringida por una gramatica compuesta de documento. No es un modelo de chat: requiere el runtime propietario de Unflatten y no funciona con el pipeline estandar de generacion de texto de Transformers. La release corresponde al checkpoint de aprendizaje por refuerzo 48, continuacion del padre S4 en el paso 170.000.

Su relevancia actual reside en el nicho de digitalizacion de documentos con preservacion de estructura logica: no se limita a extraer texto (OCR), sino que produce un arbol de documento con semantica de Word. La model card es explicitamente cauta: se trata de un candidato de investigacion de una sola pagina, con calidad de producto declarada como `false` y resultados de validacion mixtos frente a su predecesor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje transformer (backbone Qwen3-VL-4B-Instruct congelado) + modulos de reconstruccion de documento y cabezas de propiedades tipadas de Unflatten |
| Parametros totales | No disponible con precision; el backbone base Qwen3-VL-4B-Instruct tiene aproximadamente 4.000 millones. El repo ocupa 10,2 GB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el bundle verificado para inferencia es BF16 |
| Idiomas soportados | No disponibles (la model card no declara lista de idiomas) |
| Licencia | `evoliq-personal-use-and-commercial-1.0` (licencia propia, categoria "other") |
| Formato de pesos | `safetensors` (`unflatten_heads.safetensors` + `backbone/` con safetensors, tokenizer e image processor); incluye `checkpoint.weights.pt` derivado para verificacion en runtime |

## Arquitectura y entrenamiento

El modelo combina el backbone visual y linguistico congelado Qwen3-VL-4B-Instruct (revision fijada en `ebb281ec70b05090aa6165b016eac8ec08e71b17`) con modulos de reconstruccion de documento entrenados por Evoliq y cabezas de propiedades tipadas. La extraccion de caracteristicas visuales utiliza `pooler_output` y las capas DeepStack 5, 11 y 17 del backbone. La decodificacion esta restringida por una gramatica compuesta de documento, de modo que la salida no es texto libre sino una representacion estructurada conforme al esquema. Solo el renderizador determinista de Unflatten escribe OOXML y ficheros `.docx`; el modelo nunca genera el binario Word directamente.

El entrenamiento incluye una etapa de aprendizaje por refuerzo. La release selecciona el checkpoint RL48, que continua desde el padre S4 en el paso 170.000. La model card indica que la puerta formal de la etapa de RL no se ha superado porque falta el brazo de comparacion de continuacion SFT requerido, y que la seleccion de RL48 es una decision de release del propietario del proyecto. No se publican el numero de tokens de entrenamiento, la composicion del dataset ni los detalles del algoritmo de RL. El paquete incluye el codigo de carga personalizado para `AutoModel` con `trust_remote_code=True`, el vocabulario, los ficheros de capacidad y decodificacion, y el codigo fuente del runtime fijado en `unflatten-runtime.tar.gz` para reproducibilidad.

## Capacidades

- Reconstruccion de documentos a partir de la imagen rasterizada de una pagina: genera una representacion estructurada con parrafos, runs de texto, tablas y posicionamiento de imagenes.
- Produccion de documentos Word editables (`.docx`) mediante el renderizador determinista del runtime de Unflatten.
- Preservacion de estructura logica del documento, no solo transcripcion de texto: el modelo emite propiedades nativas de Word en su representacion intermedia.
- Extraccion de caracteristicas visuales y linguisticas a traves del backbone Qwen3-VL-4B-Instruct.
- Decodificacion restringida por gramatica de documento (constrained decoding), lo que limita la salida al esquema valido.
- Conversion por lotes orquestada por la herramienta de inferencia: la aplicacion acepta PDF e imagenes y gestiona la conversion multipagina.
- Interfaz de navegador, API headless y Swagger UI en la herramienta de inferencia oficial.
- No soporta tool calling ni function calling en el sentido convencional de los modelos de chat.
- No soporta agentes ni razonamiento multi-paso general; el flujo es de una sola pasada por pagina.
- Capacidades multilingues: no declaradas en la model card.

## Casos de uso

- Digitalizacion de contratos y documentos legales escaneados: el modelo reconstruye parrafos, tablas y bloques de firma en un `.docx` editable, lo que permite revision y edicion posterior por parte de equipos juridicos sin reescribir el documento desde cero.
- Migracion de archivo en papel a formato ofimatico: para fondos documentales escaneados a 300 DPI, el modelo produce documentos Word con estructura logica preservada, adecuado para procesos de digitalizacion masiva orquestados con la herramienta de inferencia.
- Extraccion de tablas y contenido estructurado de informes tecnicos: el modelo emite tablas como propiedades nativas del documento, lo que facilita su posterior procesamiento o carga en sistemas de gestion documental.
- Generacion de borradores editables a partir de facturas o formularios: partiendo de la imagen de la pagina, se obtiene un documento Word con la disposicion de campos y textos, util como paso previo a la extraccion de datos estructurados.
- Reconstruccion de documentacion interna corporativa: conversion de manuales y procedimientos escaneados a Word editable para su mantenimiento y versionado en repositorios corporativos.
- Procesamiento por lotes en local con API headless: la herramienta de inferencia expone una API con autenticacion Bearer y Swagger UI, lo que permite integrar la conversion en pipelines internos que requieran confidencialidad de los documentos (todo el procesamiento ocurre en una GPU CUDA local).
- Evaluacion e investigacion en reconstruccion de documentos: el paquete incluye pesos, runtime fijado y ficheros de decodificacion, lo que permite reproducir el comportamiento del checkpoint seleccionado en entornos de investigacion.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la comparacion diagnostica del propietario sobre las mismas 100 paginas de validacion fijas, con la misma configuracion de decodificacion. Son resultados de validacion, no de un test set independiente ni una afirmacion de calidad de produccion.

| Medida diagnostica | S4 parent | Dense 1.0 |
|---|---:|---:|
| Paginas que pasan el test de tolerancia de texto configurado | 89 / 100 | 90 / 100 |
| Coincidencias exactas de texto | 9 / 100 | 9 / 100 |
| Ficheros Word diagnosticos producidos | 98 / 100 | 99 / 100 |
| Tasa de error de caracteres (agregado bruto) | 13,8698 % | 13,8949 % |
| Tasa de error de palabras | 7,9568 % | 8,1013 % |

Los resultados son mixtos: RL48 produce un fichero Word diagnostico adicional y una pagina adicional que pasa la tolerancia de texto, mientras que los errores agregados de texto son ligeramente superiores a los del padre. La produccion de ficheros Word mide salida diagnostica exitosa, no fidelidad visual. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el bundle verificado es BF16 y el repositorio ocupa 10,2 GB, por lo que se requiere una GPU con al menos 12-16 GB de VRAM para cargar backbone y cabezas en BF16 con margen para activaciones. No se publican cifras oficiales de VRAM.
- GPU recomendadas: la inferencia CUDA se verifico en DGX Spark (NVIDIA). No se documentan otras GPU validadas; la model card indica que otras plataformas requieren su propia validacion.
- GPU de consumo: no se confirma compatibilidad con GPU de consumo; la unica plataforma verificada es DGX Spark. Cualquier RTX requeriria validacion propia.
- Opciones de despliegue: exclusivamente el runtime de Unflatten incluido en `unflatten-runtime.tar.gz` y la aplicacion oficial de inferencia (interfaz de navegador, API headless y Swagger UI en el puerto 8421). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ni con el pipeline estandar de generacion de texto de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unflatten W Dense 1.0 | ~4.000 M (backbone Qwen3-VL-4B-Instruct) | No disponible | Reconstruccion de documento a `.docx` con runtime propio | `evoliq-personal-use-and-commercial-1.0` | Pesos en Hugging Face; inferencia solo local con runtime de Unflatten |
| Qwen3-VL-4B-Instruct (modelo base) | ~4.000 M | No disponible en esta ficha | Vision-lenguaje general, chat e instrucciones | Licencia de Qwen (consultar en su repositorio) | Pesos en Hugging Face; compatible con Transformers y pipelines estandar |
| Motores OCR clasicos (p. ej. Tesseract) | No aplica (no neuronal de extremo a extremo) | No aplica | Extraccion de texto plano; sin estructura de documento | Licencias open source variadas | Ampliamente disponible; sin reconstruccion de estructura Word |

La comparacion directa con alternativas de reconstruccion de documento a Word no esta disponible en la informacion proporcionada. Frente al backbone Qwen3-VL-4B-Instruct, Unflatten W Dense 1.0 anade modulos de reconstruccion y decodificacion restringida, pero pierde la usabilidad general como modelo de chat y queda atado a un runtime propietario. Frente a motores OCR clasicos, anade estructura logica y propiedades nativas de Word, a costa de un error de caracteres del 13,89 % en la validacion publicada.

## Limitaciones y advertencias

- Modelo de investigacion de una sola pagina: la model card lo describe como candidato de investigacion, con `product_quality_claim` en `false`; las salidas requieren revision humana.
- Precision limitada: tasa de error de caracteres del 13,8949 % y de palabras del 8,1013 % en la validacion publicada; solo 9 de 100 paginas logran coincidencia exacta de texto.
- Errores posibles en texto, orden de lectura, tipografia, tablas y posicionamiento de imagenes, segun la propia model card.
- La puerta formal de la etapa de RL no se ha superado al faltar el brazo de comparacion de continuacion SFT; la seleccion de RL48 es una decision del propietario.
- Requiere el runtime propietario de Unflatten ademas de Transformers; no funciona con aplicaciones de chat genericas ni con el pipeline estandar de generacion de texto.
- Entrada limitada a una pagina raster por llamada; la conversion de PDF multipagina exige orquestacion por la herramienta de inferencia.
- Inferencia CUDA verificada unicamente en DGX Spark; otras plataformas requieren validacion propia.
- Licencia propia (`evoliq-personal-use-and-commercial-1.0`): es necesario revisar el texto de la licencia antes de cualquier uso comercial; no es una licencia open source estandar.
- Idiomas soportados no declarados; el rendimiento por idioma no esta documentado.
- Riesgo de sesgos y alucinacion no evaluado en la informacion disponible; al ser un modelo de reconstruccion restringido por gramatica, el riesgo de texto inventado no esta cuantificado.
- No se incluyen documentos de entrenamiento, imagenes de validacion, credenciales ni estado del optimizador en el paquete.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Evoliq/Unflatten-W-Dense-1.0
- Herramienta de inferencia (GitHub): https://github.com/EvoliqCZ/UnflattenW_Inference_tool-
- Guia de instalacion de la aplicacion: https://github.com/EvoliqCZ/UnflattenW_Inference_tool-#start
- Guia de API: https://github.com/EvoliqCZ/UnflattenW_Inference_tool-/blob/main/docs/API.md
- Swagger UI local (tras iniciar la aplicacion): http://127.0.0.1:8421/docs
- OpenAPI JSON local: http://127.0.0.1:8421/openapi.json
- Sitio del desarrollador (Evoliq s.r.o.): https://www.evoliq.cz/sk
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
