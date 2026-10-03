# leok7v/supertonic

## Resumen

leok7v/supertonic es una copia reempaquetada del modelo de sintesis de voz Supertone/supertonic-3, publicado por el usuario leok7v. No se trata de un modelo nuevo ni de un reentrenamiento: el autor toma los pesos del release oficial de Supertone (pasando por la conversion a MLX de mlx-community) y los reorganiza en un unico fichero safetensors por nivel de precision, pensado para ser consumido por un motor de inferencia minimo escrito en un solo fichero de C o de Swift. El objetivo es facilitar el despliegue en dispositivo (on-device) sin dependencias de ONNX Runtime ni de parsers JSON pesados.

El modelo subyacente es un sistema de texto a voz multilingue de aproximadamente 99 millones de parametros, con salida a 44,1 kHz y soporte de 31 idiomas, entre ellos el castellano. La arquitectura se organiza en cuatro modulos: predictor de duracion, codificador de texto, campo vectorial (vector field) y vocoder, acompanados de diez voces predefinidas, la tabla de caracteres del frontend y las tablas Unicode 15.0 necesarias para la normalizacion de texto.

La relevancia de este repositorio es practica: ofrece el mismo modelo en tres precisiones con tamanos muy contenidos (399 MB en fp32, 111 MB en int8 y 79 MB en 4 bits), con un formato de fichero documentado y con mmap directo, lo que lo hace apto para movil, escritorio y sistemas embebidos. La licencia se mantiene intacta respecto al original (BigScience Open RAIL-M), y el propio autor advierte de que el reempaquetado no esta afiliado ni respaldado por Supertone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema TTS no autoregresivo con cuatro modulos (predictor de duracion, codificador de texto, campo vectorial y vocoder); la model card no detalla la arquitectura interna de cada modulo |
| Parametros totales | Aproximadamente 99 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de sintesis de voz, no de lenguaje) |
| Tipos de cuantizacion | fp32 (399 MB), int8 con una escala fp32 por corte del primer eje (111 MB), 4 bits en bloques de 32 pesos con escala y suelo compartidos, 4,625 bits por peso (79 MB); fp16 parcial en predictor de duracion, primera convolucion del vocoder y algunas matrices del vocoder |
| Idiomas soportados | 31: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | BigScience Open RAIL-M (etiqueta openrail), la del modelo original, sin cambios |
| Formato de pesos | safetensors (un unico fichero por precision, con tabla de indices interna y alineacion a pagina de 16 KB) |
| Frecuencia de muestreo | 44,1 kHz |
| Voces incluidas | 10 (F1 a F5 y M1 a M5) |
| Tamano del repositorio | 1,1 GB |
| Modelo base | Supertone/supertonic-3 (revision 724fb5abbf5502583fb520898d45929e62f02c0b) |

## Arquitectura y entrenamiento

El modelo es un TTS no autoregresivo compuesto por cuatro modulos que se almacenan bajo sus propios nombres en el fichero safetensors: un predictor de duracion, un codificador de texto, un modulo denominado vector field y un vocoder con capas convnext. El repositorio no describe la arquitectura interna de cada modulo ni el mecanismo exacto de generacion acustica; la denominacion "vector field" es coherente con esquemas de generacion por campos vectoriales, pero la model card no confirma la familia concreta. En total se almacenan 698 tensores float32 correspondientes a los cuatro modulos, mas diez voces, la tabla de caracteres (`indexer`) y la constante `time.freqs` del grafo del campo vectorial.

No hubo ningun reentrenamiento: el autor lo indica explicitamente ("no weight was retrained"). Los pesos proceden del release upstream, pasados por la conversion de mlx-community/supertonic-3-mlx, cuyos tensores son identicos byte a byte a los inicializadores de los ficheros ONNX originales. Lo unico anadido son las tablas Unicode 15.0 del frontend de texto (`nfkd.offsets`, `nfkd.data`, `nfkd.class` y `word.edges`). Por tanto no hay informacion disponible sobre volumen de datos de entrenamiento, composicion del dataset ni uso de RLHF o DPO, ni sobre innovaciones de decodificacion: todo eso pertenece al release original de Supertone y no se documenta aqui.

La innovacion tecnica de este repositorio esta en el formato. El fichero es safetensors valido, pero ademas esta dispuesto para que un motor lo use con un solo `mmap` y sin parser JSON: el header JSON se rellena con espacios hasta que los datos empiezan en una pagina de 16 KB, y el primer tensor (`tts.index`) contiene una tabla de registros de 160 bytes ordenados por nombre con el tipo de bits, la forma, el numero de elementos y el desplazamiento de cada tensor. El campo `bits` distingue el tipo declarado (0), float16 (16), int8 con escalas en `NOMBRE.scale` (8) y bloques de 4 bits empaquetados como uint8 con cabeceras de 20 bytes compartidas por cada ocho bloques. Los huecos de alineacion se rellenan con tensores de ceros llamados `hole.0000` en adelante.

## Capacidades

- Sintesis de voz multilingue en 31 idiomas, incluidos castellano, ingles, coreano, japones, arabe, hindi y la practica totalidad de las lenguas europeas relevantes.
- Generacion de audio a 44,1 kHz, una frecuencia de muestreo alta para un modelo de este tamano.
- Diez voces preempaquetadas (F1-F5 y M1-M5), seleccionables en tiempo de inferencia.
- Normalizacion de texto integrada en el propio fichero de pesos mediante las tablas Unicode 15.0, lo que evita dependencias externas de preprocesado.
- Inferencia on-device: el modelo completo, incluido el frontend de texto, cabe en un unico fichero y no requiere componentes adicionales para "hablar".
- Soporte de cuantizacion agresiva: existe una variante int8 y otra de 4 bits con matrices criticas del vocoder mantenidas en mayor precision.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio de entrada ni modo de razonamiento: es exclusivamente un modelo de texto a voz.

## Casos de uso

- Lectura por voz en aplicaciones moviles sin conexion: con 111 MB en int8 o 79 MB en 4 bits, el modelo puede embeberse en el binario de una app iOS o Android y generar voz sin enviar texto a un servidor, lo que simplifica el cumplimiento de privacidad.
- Sistemas de accesibilidad: lectores de pantalla para personas con discapacidad visual que necesitan sintesis de alta calidad y baja latencia en el propio dispositivo, con soporte de castellano y otras lenguas del entorno.
- Asistentes de voz embebidos en dispositivos del hogar o automocion: el motor en C permite integrar la sintesis en firmware con recursos limitados, sin runtime de Python ni ONNX.
- Audiolibros y contenido editorial automatizado: la salida a 44,1 kHz y las diez voces permiten generar narraciones por capitulos eligiendo una voz distinta por personaje o seccion.
- Sistemas de atencion telefonica (IVR): generacion de mensajes dinamicos en varios idiomas desde el mismo binario, lo que reduce el numero de modelos desplegados por idioma.
- Prototipado rapido de interfaces de voz: el fichero unico puede cargarse con `safetensors.numpy.load_file` en un script corto para evaluar prosodia y calidad antes de decidir el despliegue final.
- Aplicaciones de aprendizaje de idiomas: sintesis de frases en cualquiera de los 31 idiomas soportados para practicar pronunciacion, con el modelo ejecutandose localmente en un portatil o tableta.
- Videojuegos con dialogo generado: voces multiples y licencia Open RAIL-M con condiciones de uso restringido, lo que exige revisar las clausulas antes de un uso comercial en un titulo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas tipo MOS, WER ni comparaciones numericas con otros sistemas TTS. La unica evaluacion mencionada es cualitativa: en pruebas de escucha con diez voces, en ingles y ruso, el autor afirma que la cuantizacion a 8 bits en todos los modulos no se distinguia del fp32. Tambien se documenta el error de cuantizacion medido sobre la norma de los pesos: entre 0,8 % y 1,3 % en el fichero int8 (0,02 % en los tensores float16) y entre 5 % y 8 % en el fichero de 4 bits.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 0,4 GB en fp32, 0,11 GB en int8 y 0,08 GB en 4 bits. Hay que sumar activaciones, que no se cuantifican.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y similares sobran para este modelo; de hecho el modelo esta pensado para CPU y para dispositivo.
- Ejecucion en CPU es viable y es el escenario principal declarado (modelo on-device). No se publican cifras de latencia ni de throughput, por lo que no es posible estimar tiempo real de sintesis por segundo de audio.
- Despliegue: no se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que ademas no aplican a un modelo TTS. El consumo previsto es mediante el motor de referencia del autor, leok7v/supertonic.tts, en una version de un solo fichero de C o de Swift.
- Memoria en disco: 399 MB (fp32), 111 MB (int8) o 79 MB (4 bits) si solo se descarga una de las variantes.
- La carga por mmap sobre la tabla `tts.index` permite arrancar sin parsear el JSON del header, lo que reduce el tiempo de inicializacion en plataformas con almacenamiento lento.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Precision disponible | Licencia | Notas |
|---|---|---|---|---|---|
| leok7v/supertonic | ~99 M | 31 | fp32, int8, 4 bits en un unico safetensors | BigScience Open RAIL-M | Reempaquetado con tabla de indices y motor en C/Swift |
| Supertone/supertonic-3 | ~99 M | 31 | Release original (ONNX) | BigScience Open RAIL-M | Modelo upstream; mismos pesos sin modificar |
| mlx-community/supertonic-3-mlx | No disponible | No disponible | Conversion a MLX | No disponible | Intermediario usado para producir los tensores de este repositorio |
| Otros modelos TTS de tamano comparable | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo original: son copias modificadas de los pesos de Supertone. El autor declara explicitamente que el reempaquetado no esta afiliado ni respaldado por Supertone.
- El fichero int8 no reproduce la salida del fp32 muestra a muestra: es, en palabras del propio autor, "un modelo numerico distinto". El fichero de 4 bits se aleja mas todavia y su mezcla de precisiones se ajusto por escucha, no por una metrica objetiva.
- El autor recomienda usar el fichero int8 salvo que los 32 MB de diferencia respecto al de 4 bits sean determinantes, lo que sugiere que la variante de 4 bits introduce artefactos audibles (ruido tipo siseo por encima de 12 kHz y ruido en las pausas) si no se mantienen anchas ciertas matrices del vocoder.
- Riesgo de alucinacion en el sentido de pronunciacion incorrecta, prosodia inadecuada o lectura erronea de textos con numeros, abreviaturas o signos poco frecuentes. No hay datos publicados de tasas de error.
- No se documentan sesgos de voz: se desconoce la distribucion de acentos, genero, edad o variedad dialectal de las diez voces incluidas.
- Cobertura idiomatica desigual: aunque se listan 31 idiomas, no se publica ninguna metrica de calidad por idioma, por lo que el rendimiento en castellano respecto al ingles es una incognita.
- Licencia BigScience Open RAIL-M: incluye clausulas de uso restringido que limitan determinados casos de uso. Es imprescindible revisar el fichero LICENSE antes de cualquier explotacion comercial.
- El repositorio tiene 0 descargas y 1 like, y fue creado el 2 de octubre de 2026, con lo que no existe todavia validacion independiente por parte de la comunidad.
- El reempaquetado no anade herramienta de entrenamiento ni de ajuste fino: no se puede reentrenar ni adaptar voces con lo que se distribuye aqui.
- Los ficheros reescritos por una libreria de safetensors pierden el orden de tensores y la alineacion a pagina, y por tanto dejan de ser utilizables por el motor de referencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/leok7v/supertonic
- Modelo original: https://huggingface.co/Supertone/supertonic-3
- Conversion intermedia a MLX: https://huggingface.co/mlx-community/supertonic-3-mlx
- Motor de inferencia del autor (un fichero de C o de Swift): https://github.com/leok7v/supertonic.tts
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a paginas de un exchange de criptomonedas y no guardan relacion con este repositorio.
