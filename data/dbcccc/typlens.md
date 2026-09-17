# dbcccc/TypLens

## Resumen

TypLens-V1 es un modelo de reconocimiento de formulas matematicas impresas que convierte una captura de imagen en texto Typst nativo, sin pasar por LaTeX en tiempo de inferencia. Lo publica el usuario dbcccc como un ajuste fino (finetune) de breezedeus/pix2text-mfr-1.5, adaptado para emitir directamente sintaxis Typst. Es un lanzamiento experimental de solo pesos: el autor indica explicitamente que no se incluye codigo de entrenamiento ni grafo de ejecucion.

Con 29.403.264 parametros (29,4 M) y un repositorio de 0,3 GB, el modelo esta disenado para ser extremadamente ligero: la variante FP32 de safetensors ocupa 117,7 MB y la variante ONNX INT8 solo 33,9 MB, un 71,3% menos. Esa compacidad permite ejecutarlo integramente en el navegador mediante ONNX Runtime con WebAssembly, algo poco habitual en modelos de OCR matematico.

Su relevancia ahora es practica: Typst esta ganando adopcion como alternativa a LaTeX y existian pocos modelos que generen Typst nativo en lugar de LaTeX. TypLens cubre ese hueco con un modelo que corre en local, sin GPU y sin enviar capturas a un servicio externo. Se publica como experimental y, segun el autor, no ha superado la puerta de calidad de release del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-encoder-decoder (tag oficial de HuggingFace); derivada de la familia Pix2Text-MFR |
| Parametros totales | 29.403.264 (29,4 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32 (safetensors y ONNX) e INT8 de pesos (variante compacta ONNX) |
| Idiomas soportados | no disponible; la entrada es notacion matematica impresa, no lenguaje natural |
| Licencia | MIT (contribuciones del proyecto, con avisos MIT upstream retenidos) |
| Formato de pesos | safetensors (FP32) y ONNX (fp32 e int8) |
| Modelo base | breezedeus/pix2text-mfr-1.5, revision 1cef9f0bdcd6a4c63df7de1311fb0894593340cc |
| Version | v1 |
| Fecha de publicacion | 17 de septiembre de 2026 |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo es un vision-encoder-decoder, la arquitectura tipica de los sistemas de reconocimiento de formulas matematicas (MFR): un codificador visual procesa la imagen y un decodificador de texto genera la secuencia de tokens correspondiente. El punto diferencial es que el vocabulario de salida es sintaxis Typst nativa, no LaTeX: no hay puente de conversion en tiempo de inferencia.

El autor documenta dos etapas. La primera es el checkpoint base Pix2Text-MFR-1.5, en la revision 1cef9f0bdcd6a4c63df7de1311fb0894593340cc. La segunda es la adaptacion a capturas de pantalla, realizada con 268.346 pares de entrenamiento extraidos de los conjuntos UniMER e IBEM. En la preparacion de datos se usaron las anotaciones LaTeX de origen, pero el modelo liberado genera Typst directamente. El SHA-256 del checkpoint de origen es 900938e6cca81d62448fa8693a78a42d91aeea328b998887da7f1d65d7b11258. No se detallan en la informacion disponible el numero total de tokens, la composicion exacta del dataset ni si hubo RLHF o DPO.

El lanzamiento renombra y empaqueta pesos ya existentes: no se reentrena, no se hace merge ni se modifican los pesos respecto al checkpoint usado como fuente. Se trata de una release de solo pesos, sin codigo de entrenamiento ni fuente ejecutable de inferencia; el tokenizador, el mapeo de bytes y la configuracion de preprocesado son activos obligatorios para usarlo.

## Capacidades

- Reconocimiento de formulas matematicas impresas: entrada de una unica imagen recortada, con formula oscura sobre fondo claro (por ejemplo, captura de un PDF o de un articulo).
- Generacion de Typst nativo: la salida es contenido matematico Typst directamente, sin conversion intermedia desde LaTeX.
- Ejecucion en navegador: la variante ONNX permite inferencia local en el navegador con ONNX Runtime y WebAssembly, sin backend.
- Despliegue en CPU: el tamano del modelo (29,4 M de parametros) hace viable la inferencia sin GPU.
- Variante compacta: INT8 de pesos reduce la descarga un 71,3% respecto a la variante ONNX completa.
- No dispone de tool calling, function calling, capacidades de agente, vision general, audio ni modo de razonamiento: es un modelo especializado de un unico paso imagen a texto.
- No es un modelo conversacional ni multilingue en el sentido habitual: el autor no declara idiomas soportados.

## Casos de uso

- Extension de navegador para capturar formulas: el modelo puede ejecutarse con ONNX Runtime Web sobre WASM, de modo que un usuario recorta una formula de un PDF en el navegador y obtiene el Typst listo para pegar, sin enviar la imagen a ningun servidor.
- Edicion de documentos Typst: integrado en un editor (por ejemplo, la aplicacion web de Typst o un plugin de editor), permite insertar formulas desde una captura en lugar de teclearlas, acelerando la redaccion de apuntes y articulos.
- Digitalizacion de material docente: conversion de capturas de libros de texto o de ejercicios resueltos a Typst para generar guiones de practicas, boletines de problemas o transparencias mantenibles.
- Migracion de documentacion tecnica a Typst: equipos que trasladan manuales o papers de LaTeX a Typst pueden reconocer formulas incrustadas en imagenes o PDFs escaneados y obtener la sintaxis destino directamente.
- Anotacion asistida de datasets: como paso previo de etiquetado en un pipeline de OCR matematico, el modelo propone Typst que despues se revisa y corrige, reduciendo el coste de anotacion manual.
- Aplicacion de escritorio offline: con la variante INT8 (33,9 MB) puede empaquetarse en una herramienta local para portatiles sin GPU, util en entornos con conectividad restringida o requisitos de privacidad.
- Procesamiento por lotes de capturas: en un script de CPU con ONNX Runtime, convertir colecciones de recortes de formulas procedentes de articulos a Typst para indexacion o busqueda.

## Benchmarks y rendimiento

Datos de desarrollo proporcionados por el autor (experimento en navegador de septiembre de 2026). No son exactitud de test independiente y proceden de ejemplos de desarrollo reutilizados repetidamente, con un unico revisor.

| Medida | FP32 completo | Compacto (INT8) |
|---|---:|---:|
| Capturas de articulos correctas en contenido y estilo de simbolos | 38/47 (80,9%) | 38/47 (80,9%) |
| Otras formulas de validacion correctas en contenido y estilo | 128/135 (94,8%) | 127/135 (94,1%) |
| Generacion terminada con normalidad | 182/182 | 181/182 |
| Inferencia mediana en navegador de escritorio | 399 ms | 332 ms |
| Inferencia P95 en navegador de escritorio | 662 ms | 602 ms |

Condiciones de la medicion: Chromium 152 sobre Windows con cuatro hilos WASM. El tiempo excluye preprocesado, inicializacion del modelo y descarga por red, por lo que no es extrapolable a otros dispositivos. El autor senala ademas que estos resultados no son comparables con el 92,63% de puntuacion estricta de texto de la release anterior en su distinto conjunto de validacion IBEM.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,5 GB en FP32 (pesos de 117,7 MB) e inferior a 0,2 GB en INT8 (pesos de 33,9 MB), sin contar activaciones ni runtime.
- GPU recomendadas: cualquier GPU, incluida una integrada; el modelo tambien funciona en CPU. No requiere A100, H100 ni tarjetas de gama alta.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo con al menos 1 GB de memoria. El caso de uso principal documentado es navegador de escritorio, no GPU dedicada.
- Opciones de despliegue: ONNX Runtime (nativo y Web/WASM) y transformers con PyTorch. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni GGUF, formatos no aplicables a este modelo.
- Latencia y throughput: mediana de 399 ms (FP32) y 332 ms (INT8) por formula en navegador de escritorio; P95 de 662 ms y 602 ms respectivamente, excluyendo preprocesado, inicializacion y descarga.
- Activos obligatorios: tokenizador, mapeo de bytes y configuracion de preprocesado; el paquete no incluye bibliotecas de runtime ni codigo ejecutable de inferencia o entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Salida | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| TypLens-V1 | 29,4 M | Typst nativo | MIT | safetensors, ONNX fp32/INT8 | 38/47 (80,9%) y 128/135 (94,8%) en validacion de desarrollo propia |
| Pix2Text-MFR-1.5 (base) | no disponible en la informacion proporcionada | LaTeX, segun el flujo Pix2Text | no disponible en la informacion proporcionada | no disponible | Checkpoint de partida de este finetune |
| IBEM-im2typst | no disponible en la informacion proporcionada | Typst | no disponible en la informacion proporcionada | no disponible | Release separada del mismo autor; su 92,63% de puntuacion estricta de texto corresponde a otro conjunto de validacion IBEM y no es comparable |
| Otros reconocedores de formulas (pix2tex y similares) | no disponible | LaTeX | no disponible | no disponible | No se han encontrado datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Los numeros de rendimiento publicados no son exactitud de test independiente: proceden de ejemplos de desarrollo reutilizados y de las valoraciones de un unico revisor, sin un segundo revisor independiente.
- El checkpoint no ha superado la puerta de calidad de release del proyecto; se publica como experimental precisamente por ese motivo.
- Se han observado formulas matematicamente incorrectas aunque su codigo Typst compile correctamente. Entre las fuentes de error documentadas estan las expresiones largas, los subindices, determinados simbolos y las distinciones de estilo.
- La variante compacta (INT8) no termino la generacion en uno de los ejemplos de validacion (181/182), por lo que existe riesgo de no terminacion.
- Ambito de entrada muy restringido: una unica formula recortada con ajuste estrecho, en tinta oscura sobre fondo claro. No es conversion de documentos, ni deteccion de maquetacion, ni OCR general.
- Riesgo de alucinacion inherente a los modelos generativos de OCR: la salida puede ser plausible y compilable sin corresponder a la formula de la imagen. El autor recomienda revisar las salidas.
- No se declaran idiomas soportados ni contexto utilizable mas alla de la formula individual.
- Licencia MIT para las contribuciones del proyecto, con avisos MIT upstream retenidos. Los conjuntos de datos de entrenamiento mantienen sus propios terminos y no se incluyen; la licencia del modelo no otorga derechos sobre imagenes ni anotaciones de terceros.
- No se incluye codigo de entrenamiento ni fuente ejecutable de inferencia, lo que dificulta la reproducibilidad y el ajuste posterior.
- Para produccion, conviene fijar la revision del checkpoint (SHA-256 900938e6cca81d62448fa8693a78a42d91aeea328b998887da7f1d65d7b11258) y validar la salida con un compilador Typst, sin asumir correccion semantica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dbcccc/TypLens
- Modelo base: https://huggingface.co/breezedeus/pix2text-mfr-1.5
- Release relacionada del mismo autor: https://huggingface.co/dbcccc/IBEM-im2typst
- Contrato de entrada, cache y decodificacion: INFERENCE.md (incluido en el repositorio del modelo)
- Licencia: LICENSE (incluido en el repositorio del modelo)
- Avisos de terceros: NOTICE.md y directorio licenses/ (incluidos en el repositorio del modelo)
- Resultados de busqueda web: las busquedas realizadas no han devuelto ningun enlace relacionado con el modelo; los resultados obtenidos eran noticias de actualidad sin relacion con TypLens.
