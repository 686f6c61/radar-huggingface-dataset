# MacEpic/formulas-20-coreml

## Resumen

`formulas-20-coreml` es un modelo de reconocimiento de formulas matematicas impresas desarrollado por MacEpic. Su funcion es recibir una imagen que contiene una unica formula y devolver su representacion en LaTeX. El modelo se ha entrenado dentro de la herramienta interna TextRecognitionLab (ejecucion `formulas-20`, TRL-103) y se ha exportado especificamente para su ejecucion en el Neural Engine de Apple mediante Core ML (TRL-082, TRL-085).

La arquitectura sigue un esquema codificador-decodificador: un encoder que procesa la imagen de entrada y un decoder de un solo paso que genera la secuencia LaTeX token a token. El paquete incluye los pesos en formato `.mlmodelc` (Core ML compilado), junto con un `bundle.json` que detalla tamanos y hashes SHA-256 de cada fichero. El repositorio ocupa 41.198.366 bytes distribuidos en 10 ficheros.

La relevancia de este modelo es acotada: no es un modelo de proposito general ni esta pensado para reutilizacion por terceros. Se trata de un artefacto de produccion interno que la aplicacion TextSniper descarga en una revision fija y consume a traves de la peticion `RecognizeFormulaRequest` de MEVision2 (TRL-108). La licencia restringe explicitamente su uso a las aplicaciones de MacEpic.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder (Core ML); encoder con una funcion estatica por lienzo de entrada y decoder de un paso por longitud de memoria |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el limite de tokens se define en los metadatos del modelo) |
| Tipos de cuantizacion | no disponible (pesos compilados en `.mlmodelc` para Neural Engine) |
| Idiomas soportados | no disponible (la salida es LaTeX, no lenguaje natural) |
| Licencia | other (uso exclusivo por las aplicaciones de MacEpic; no se licencia ningun otro uso) |
| Formato de pesos | `.mlmodelc` (Core ML compilado) + `bundle.json` con tamanos y SHA-256 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de tipo encoder-decoder orientada a la transcripcion imagen-a-secuencia. El encoder genera representaciones de la imagen de entrada y expone una funcion estatica por cada lienzo (canvas) de entrada admitido, mientras que el decoder funciona en modo de un solo paso y ofrece una funcion por cada longitud de memoria posible. Esta fragmentacion en funciones estaticas es caracteristica de la exportacion a Core ML para aprovechar el Neural Engine de Apple sin grafos dinamicos.

El entrenamiento se realizo en TextRecognitionLab bajo la ejecucion `formulas-20` (TRL-103), con un ajuste fino posterior sobre imagenes de formulas situadas en una pagina de otro color (TRL-113). La model card no especifica el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, por lo que esos datos deben considerarse no disponibles. Los metadatos del modelo incluyen la version de preprocesado, el vocabulario, los lienzos admitidos y el limite de tokens, que el lector (MEVision2) utiliza para preparar la inferencia.

## Capacidades

- Reconocimiento de formulas matematicas impresas: recibe la imagen de una unica formula y devuelve su equivalente en LaTeX.
- Salida en formato LaTeX, apta para renderizado posterior o almacenamiento estructurado.
- Procesamiento de imagenes sobre lienzos de entrada predefinidos (canvases), declarados en los metadatos del modelo.
- Generacion autorregresiva con decoder de un paso y memoria de longitud variable, lo que permite secuencias LaTeX de distinta extension hasta el limite de tokens configurado.
- Ejecucion en el Neural Engine de Apple mediante Core ML, sin necesidad de GPU dedicada ni de frameworks de inferencia de terceros.
- No dispone de tool calling, function calling, capacidades de agente, vision general, audio ni modo de razonamiento extendido.

## Casos de uso

- Digitalizacion de apuntes y libros de texto: la aplicacion captura una formula impresa y el modelo devuelve el LaTeX para incorporarlo a un editor de ecuaciones o a un documento cientifico.
- Extraccion de formulas en aplicaciones de captura de pantalla: TextSniper descarga esta revision fija y la invoca mediante `RecognizeFormulaRequest` para convertir una seleccion de pantalla en LaTeX editable.
- Indexacion de documentacion tecnica: un pipeline interno puede pasar las formulas recortadas de un PDF por el modelo y almacenar el LaTeX resultante como metadato buscable.
- Generacion de material docente: conversion de formulas de examenes o transparencias a LaTeX para reutilizarlas en plantillas de ejercicios.
- Accesibilidad: transcripcion de formulas a texto estructurado para lectores de pantalla o para su sintesis en entornos educativos.
- Control de calidad editorial: comparacion del LaTeX generado con el original para detectar erratas en la composicion tipografica de formulas en publicaciones.
- Integracion en flujos de ofimatica en macOS: al ejecutarse sobre Core ML, el modelo puede desplegarse dentro de una app nativa sin dependencias de servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo esta compilado para Core ML y se ejecuta en el Neural Engine de Apple, no en GPU con memoria dedicada convencional.
- GPU recomendadas: no aplica en el sentido habitual; requiere hardware Apple con Neural Engine (chips de la familia M o superiores) para aprovechar la aceleracion.
- Compatibilidad con GPU de consumo: no aplica (no es un modelo para CUDA ni para tarjetas graficas de escritorio).
- Opciones de despliegue: Core ML (`.mlmodelc`) a traves de MEVision2 y su peticion `RecognizeFormulaRequest`; no se contemplan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El tamano del paquete (41.198.366 bytes) sugiere un modelo ligero, pero no se aportan cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `formulas-20-coreml` (MacEpic) | no disponible | no disponible | Reconocimiento de formulas a LaTeX | other, solo apps de MacEpic | Hugging Face, revision fija |
| Pix2Text / LaTeX-OCR (alternativas open source) | no disponible en la informacion proporcionada | no disponible | Reconocimiento de formulas a LaTeX | no disponible | no disponible |
| Modelos OCR generalistas con salida LaTeX | no disponible | no disponible | OCR con soporte de formulas | no disponible | no disponible |

No se dispone de datos comparativos verificados en la informacion proporcionada; la comparativa se limita a senalar la categoria funcional.

## Limitaciones y advertencias

- Licencia restrictiva: la model card indica explicitamente que el modelo es para uso de las aplicaciones de MacEpic y que no se licencia ningun otro uso. No es apto para uso comercial ni para integracion por terceros sin autorizacion.
- Alcance limitado: solo reconoce formulas impresas, una por imagen; no procesa lenguaje natural, tablas, diagramas ni manuscritos.
- Dependencia de metadatos: el vocabulario, los lienzos y el limite de tokens deben leerse del propio modelo; un uso fuera de MEVision2 puede producir resultados incorrectos.
- Sin datos de evaluacion publicos: no hay benchmarks ni metricas de precision publicadas, por lo que no es posible estimar la tasa de error en produccion.
- Riesgo de alucinacion en la salida LaTeX: al ser un decoder autorregresivo, puede generar comandos o simbolos plausibles pero incorrectos en formulas ambiguas o de baja calidad de imagen.
- Idiomas y sesgos: no se documentan sesgos conocidos ni cobertura linguistica; la salida es LaTeX y no texto en lenguaje natural.
- Fecha de creacion futura en los metadatos (2026-11-24): conviene verificar la integridad del repositorio antes de cualquier uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MacEpic/formulas-20-coreml
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
