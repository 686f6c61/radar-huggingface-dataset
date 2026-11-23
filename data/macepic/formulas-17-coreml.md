# MacEpic/formulas-17-coreml

## Resumen

`formulas-17-coreml` es un modelo de reconocimiento de formulas matematicas impresas desarrollado por MacEpic. Su funcion es concreta: recibe una imagen que contiene una unica formula y devuelve su representacion en LaTeX. No es un modelo de lenguaje generativo de proposito general, sino un sistema especializado de vision y transcripcion, empaquetado en formato Core ML para su ejecucion en el Neural Engine de los dispositivos Apple.

El modelo se ha entrenado y exportado dentro del entorno propietario de MacEpic denominado TextRecognitionLab (identificado internamente como `formulas-17`, TRL-103), y su exportacion para Core ML se documenta con las referencias TRL-082 y TRL-085. La aplicacion TextSniper descarga esta copia en una revision fija y la consume a traves de la peticion `RecognizeFormulaRequest` de MEVision2 (TRL-108), lo que indica que es un componente de produccion de un ecosistema cerrado de aplicaciones.

La relevancia de esta ficha es limitada para la comunidad open source: el modelo no publica parametros, arquitectura detallada, datos de entrenamiento ni resultados de benchmarks, y su licencia restringe explicitamente el uso a las aplicaciones del propio autor. Se documenta aqui por su interes como ejemplo de despliegue de reconocimiento de formulas en Core ML, no como modelo reutilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (encoder + decoder en dos `.mlmodelc`; el decoder es de un paso por longitud de memoria) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card menciona un limite de tokens en los metadatos, sin cifra) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la salida es LaTeX, independiente del idioma natural) |
| Licencia | other (uso exclusivo por las aplicaciones de MacEpic; no se licencia ningun otro uso) |
| Formato de pesos | Core ML (`.mlmodelc`), mas `bundle.json` con tamanos y SHA-256 |

Datos adicionales verificables: el repositorio contiene 10 archivos con un total de 41.198.374 bytes (aproximadamente 39,3 MiB), y el campo de tamano del repo aparece como 0.0 GB. La libreria declarada es `coreml`.

## Arquitectura y entrenamiento

La model card describe una arquitectura de dos componentes. El primero, `formulas-17-encoder.mlmodelc`, es un encoder con una funcion estatica por cada lienzo de entrada (canvas), lo que sugiere que el modelo se compila para resoluciones de imagen predefinidas y no para entrada de tamano arbitrario. El segundo, `formulas-17-decoder.mlmodelc`, es un decoder de un solo paso con una funcion por cada longitud de memoria, es decir, el grafo se especializa para cada longitud de secuencia de contexto admitida. Este patron es habitual en la exportacion a Core ML de modelos secuencia a secuencia, donde la ausencia de formas dinamicas obliga a generar variantes del decoder.

Los metadatos del modelo incluyen los lienzos admitidos, el vocabulario, el limite de tokens y la version de preprocesado, de modo que el lector (MEVision2) puede adaptarse sin informacion externa. No se publican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se detalla si el encoder es una CNN, un Vision Transformer o un hibrido. Toda esta informacion debe considerarse no disponible.

## Capacidades

- Reconocimiento de formulas matematicas impresas: dada una imagen con una unica formula, genera su equivalente en LaTeX.
- Salida en LaTeX, lo que permite renderizar la formula o integrarla en documentos y editores.
- Ejecucion en el Neural Engine de Apple mediante Core ML, con encoder y decoder compilados por separado.
- Autodescripcion mediante metadatos: lienzos de entrada, vocabulario, limite de tokens y version de preprocesado incluidos en el propio modelo.
- Integracion con la peticion `RecognizeFormulaRequest` de MEVision2 y con la aplicacion TextSniper.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo de pensamiento.

## Casos de uso

- Digitalizacion de apuntes y libros de texto: el modelo convierte capturas de formulas impresas en LaTeX editable, lo que permite reutilizarlas en editores como Overleaf o en sistemas de gestion documental. Es adecuado porque su unica tarea es la transcripcion de una formula por imagen.
- Captura en aplicaciones de productividad para macOS: TextSniper lo descarga en una revision fija y lo invoca mediante `RecognizeFormulaRequest`, de modo que el usuario puede extraer una formula de la pantalla y pegarla como LaTeX en otra aplicacion.
- Construccion de bases de datos cientificas: un pipeline puede procesar lotes de imagenes de articulos y almacenar las formulas en LaTeX para busqueda y recuperacion, aprovechando la ejecucion local en el Neural Engine.
- Accesibilidad: conversion de formulas impresas a LaTeX para su lectura por sintetizadores de voz o su renderizado a gran tamano, sin depender de servicios en la nube.
- Preprocesado para modelos mayores: usar el LaTeX generado como entrada textual para un LLM que explique, resuelva o clasifique la formula, separando la vision (este modelo) del razonamiento (otro modelo).
- Procesamiento offline en dispositivos Apple: al ejecutarse en Core ML, el reconocimiento puede realizarse sin conexion y sin enviar imagenes a servidores externos, lo que resulta relevante por privacidad.
- Verificacion de integridad de despliegue: el `bundle.json` con tamanos y SHA-256 permite comprobar que los archivos descargados son los esperados antes de cargarlos en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta pensado para el Neural Engine de Apple, no para GPU con memoria dedicada.
- GPU recomendadas: no aplica en el sentido habitual; el destino es el Neural Engine y, en su defecto, CPU o GPU integrada de Apple mediante Core ML.
- Cabe en GPU de consumo: si, en el sentido de que el paquete completo ocupa unos 39,3 MiB y esta disenado para hardware Apple de consumo (Mac, iPhone, iPad).
- Opciones de despliegue: Core ML exclusivamente; no se proporcionan pesos en safetensors, GGUF ni formatos compatibles con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| formulas-17-coreml | no disponible | no disponible | Core ML | other (solo apps de MacEpic) | Hugging Face, uso restringido |
| Alternativas de reconocimiento de formulas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada; no se ofrecen cifras de rendimiento ni de licencia de terceros para evitar datos no verificados.

## Limitaciones y advertencias

- Licencia restrictiva: la model card indica explicitamente que el modelo es para uso por las aplicaciones de MacEpic y que no se licencia ningun otro uso. No es apto para uso comercial ni para integracion en productos de terceros sin autorizacion.
- Alcance limitado a una formula por imagen: el modelo reconoce una unica formula impresa; no se documenta soporte para paginas completas, formulas manuscritas ni diagramas.
- Sin informacion sobre sesgos: no se publican analisis de sesgo, y al tratarse de reconocimiento de formulas impresas el riesgo principal es de error de transcripcion, no de sesgo social.
- Riesgo de alucinacion en la transcripcion: como todo modelo secuencia a secuencia, puede generar LaTeX sintacticamente valido pero incorrecto respecto a la imagen; no se documentan tasas de error.
- Dependencia de metadatos y de un lector concreto: el uso correcto requiere respetar los lienzos, el vocabulario y el limite de tokens declarados, y esta pensado para consumirse a traves de MEVision2.
- Portabilidad nula fuera de Apple: el formato Core ML y la compilacion por lienzo y por longitud de memoria impiden su uso en entornos no Apple.
- Idiomas: no se especifican; la salida es LaTeX, pero no se detalla el tratamiento de notacion no latina.
- Repositorio sin senales de comunidad: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado.

## Enlaces

- Hugging Face: https://huggingface.co/MacEpic/formulas-17-coreml
- Referencias internas citadas en la model card: TextRecognitionLab (`formulas-17`, TRL-103), exportacion TRL-082 y TRL-085, MEVision2 `RecognizeFormulaRequest` (TRL-108), aplicacion TextSniper.
- Paper, blog, repositorio o demo: no disponible.
