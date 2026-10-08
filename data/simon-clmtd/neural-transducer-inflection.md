# simon-clmtd/neural-transducer-inflection

## Resumen

Neural transducer inflection es una coleccion de modelos de transduccion de cadenas neuronales ajustados especificamente para la generacion de flexiones morfologicas (morphological inflection). El autor es simon-clmtd y el repositorio agrupa ocho variantes independientes, correspondientes a cuatro idiomas (ingles, aleman, frances e italiano) y dos regimenes de datos (100 y 1.000 ejemplos de entrenamiento por idioma). El problema que resuelve es el de generar la forma flexionada correcta de una palabra a partir de su lema y un conjunto de rasgos morfologicos (por ejemplo, producir "went" a partir de "go" + pasado), una tarea clave en analisis morfologico, traduccion automatica y procesamiento de lenguas con pocos recursos.

La arquitectura no es un transformer generativo ni un modelo de lenguaje, sino un transductor de cadenas neuronal basado en transiciones, segun el trabajo de Makarov y Clematide (2020). Cada modelo usa un encoder BiLSTM de una capa con dimension oculta de 200 y un decoder LSTM de una capa con la misma dimension. El entrenamiento se realiza con aprendizaje por imitacion (imitation learning) sobre el benchmark CoNLL-SIGMORPHON 2017 Shared Task 1.

Es relevante ahora por su enfoque en escenarios de bajos recursos: las variantes de 100 ejemplos permiten evaluar hasta que punto un transductor ligero puede generalizar con supervision minima, algo util para lenguas minoritarias o dominios con datos escasos. El repositorio incluye pesos en formato PyTorch y metadatos completos de vocabulario y parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor de cadenas neuronal basado en transiciones (Makarov y Clematide, 2020); encoder BiLSTM de 1 capa (dim. oculta 200, dropout bloqueado de salida 0.3) y decoder LSTM de 1 capa (dim. oculta 200) |
| Parametros totales | no disponible (el orden de magnitud es de pocos millones, estimado a partir de la arquitectura descrita) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (opera a nivel de palabra de entrada, no de secuencia larga) |
| Tipos de cuantizacion | no disponible (se distribuye como checkpoint PyTorch de precision completa) |
| Idiomas soportados | en, de, fr, it |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | PyTorch state dict (`best.model`), acompanado de `vocabulary.pkl`, `sed.pkl` y ficheros JSON de metadatos |

## Arquitectura y entrenamiento

El modelo implementa un transductor de cadenas neuronal basado en transiciones, siguiendo la propuesta de Makarov y Clematide (2020) e integrado en el paquete `trans` (identificador `neural_transducer`). El encoder es un BiLSTM de una sola capa con dimension oculta de 200 y dropout bloqueado de salida de 0.3; el decoder es un LSTM de una capa tambien con dimension oculta de 200. La optimizacion emplea AdamW con tasa de aprendizaje 0.001 y un planificador `ReduceLROnPlateau`, con semilla fija 42 para reproducibilidad. El vocabulario de caracteres y rasgos procede de UniMorph, y se incluyen parametros de distancia de edicion estocastica (Stochastic Edit Distance).

El entrenamiento se basa en aprendizaje por imitacion sobre el benchmark CoNLL-SIGMORPHON 2017 Shared Task 1. Cada subcarpeta del repositorio (por ejemplo `eng_100`, `deu_1000`) constituye un bundle autonomo con su propio checkpoint y metadatos. El bundle incluye `bundle_manifest.json` con hashes de verificacion y puntuaciones de exactitud de referencia. No se detalla en la informacion disponible el numero total de tokens, la composicion completa del dataset ni si se aplicaron tecnicas como RLHF o DPO (no aplicables a esta clase de modelo).

## Capacidades

- Generacion de flexiones morfologicas: a partir de un lema y un conjunto de rasgos de UniMorph, produce la forma flexionada correspondiente.
- Cobertura multilingue limitada a cuatro idiomas: ingles, aleman, frances e italiano.
- Operacion en regimen de bajos recursos: hay variantes entrenadas con solo 100 ejemplos por idioma, ademas de variantes con 1.000.
- Modelado de rasgos morfologicos explicitos (caso, numero, genero, tiempo, persona, etc.) mediante el vocabulario UniMorph.
- No dispone de soporte de tool calling ni de function calling.
- No esta orientado a agentes ni a razonamiento multi-paso.
- No incorpora capacidades de vision, audio, modo de razonamiento ni generacion de texto libre.
- No es un modelo conversacional ni de proposito general: su salida es una forma de palabra, no texto.

## Casos de uso

- Generacion de formas verbales para traduccion automatica: dado un lema y los rasgos de tiempo, persona y numero, el modelo produce la forma correcta que un sistema de traduccion puede insertar en la oracion de destino.
- Preprocesamiento morfologico en pipelines de PLN: generar formas flexionadas coherentes para alimentar analizadores o etiquetadores morfologicos cuando el lexico disponible es incompleto.
- Aumento de datos para entrenar otros modelos: crear pares lema-forma para ampliar corpus de entrenamiento de lematizadores, etiquetadores o correctores.
- Correccion gramatical y concordancia: validar que una forma verbal o nominal concuerda con los rasgos solicitados en un contexto controlado.
- Soporte a lenguas de bajos recursos: la variante de 100 ejemplos permite evaluar el comportamiento del transductor con supervision minima, util como punto de partida para lenguas sin corpus amplios.
- Enriquecimiento de diccionarios y bases lexicas: generar automaticamente tablas de flexion para integrarlas en recursos lexicograficos.
- Normalizacion en motores de busqueda: producir variantes flexionadas para mejorar la recuperacion con coincidencia morfologica controlada.

## Benchmarks y rendimiento

No se han publicado los valores concretos de benchmarks en la informacion disponible. El repositorio indica que cada fichero `bundle_manifest.json` incluye puntuaciones de exactitud de referencia por bundle, pero dichos valores no se detallan en los datos proporcionados.

## Requisitos de hardware

- Al tratarse de un transductor BiLSTM/LSTM de dimension oculta 200, es un modelo muy ligero; el orden de magnitud es de pocos millones de parametros (estimacion a partir de la arquitectura).
- Inferencia viable en CPU: no requiere GPU para un uso interactivo o por lotes moderados.
- Cabe con holgura en cualquier GPU de consumo (por ejemplo, RTX 3060, RTX 4090) e incluso en entornos sin GPU dedicada.
- La VRAM necesaria es minima (del orden de cientos de MB o menos), aunque no se proporciona una cifra oficial.
- El formato de pesos es un checkpoint PyTorch (`best.model`), por lo que el despliegue se realiza con PyTorch, no con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a transformers generativos.
- No se dispone de datos oficiales de latencia ni de throughput.

## Comparativa con modelos similares

La comparacion se plantea frente a otros sistemas de la misma categoria (transductores y sistemas de generacion de flexiones del Shared Task de SIGMORPHON), pero no se dispone de cifras de rendimiento para este modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| simon-clmtd/neural-transducer-inflection | no disponible (estimado en pocos millones) | no disponible (nivel de palabra) | cc-by-sa-4.0 | HuggingFace | 4 idiomas, variantes de 100 y 1.000 ejemplos |
| Transductor de referencia de Makarov y Clematide (2020) | no disponible | no disponible | no disponible | publicacion academica | Arquitectura base reproducida por este repositorio |
| Sistemas baseline del CoNLL-SIGMORPHON 2017 | no disponible | no disponible | no disponible | benchmark academico | Punto de comparacion del Shared Task 1 |

## Limitaciones y advertencias

- Ambito funcional restringido: genera formas flexionadas a nivel de palabra, no texto libre ni razonamiento.
- Solo cubre cuatro idiomas (en, de, fr, it); no hay soporte para el espanol.
- Riesgo de sobreajuste en las variantes de 100 ejemplos por idioma, con menor capacidad de generalizacion a formas no vistas.
- Posibilidad de producir formas morfologicas no atestiguadas o incorrectas (alucinacion morfologica) en lemas poco frecuentes o irregulares.
- La licencia cc-by-sa-4.0 permite uso comercial, pero exige atribucion y que las obras derivadas se distribuyan bajo la misma licencia (share-alike).
- El repositorio registra 0 descargas y 0 "me gusta" en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.
- No se han publicado cifras de benchmarks verificables en la informacion disponible; la evaluacion debe hacerse de forma independiente.
- No es compatible con las herramientas habituales de despliegue de LLM (vLLM, llama.cpp, Ollama, TGI) por su formato y naturaleza arquitectonica.
- La fecha de creacion registrada (2026-10-07) indica que se trata de un repositorio reciente; conviene verificar su mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/simon-clmtd/neural-transducer-inflection
- Demo interactiva (Space): https://huggingface.co/spaces/simon-clmtd/morphological-inflection
- Referencia de arquitectura: Makarov y Clematide (2020), transductor de cadenas neuronal basado en transiciones (URL no disponible en la informacion proporcionada)
- Dataset: CoNLL-SIGMORPHON 2017 Shared Task 1 (URL no disponible en la informacion proporcionada)

Nota: la busqueda web realizada no devolvio enlaces relevantes para este modelo; los resultados obtenidos correspondian a contenidos no relacionados (una serie de animacion y entradas enciclopedicas sobre el nombre "Simon"), por lo que no se incluyen.
