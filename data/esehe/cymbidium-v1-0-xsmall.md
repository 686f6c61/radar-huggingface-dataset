# esehe/Cymbidium-v1.0-xsmall

## Resumen

Cymbidium-v1.0-xsmall es un modelo de conversion kana-kanji (かな漢字変換) desarrollado por el usuario esehe y publicado en Hugging Face bajo licencia Apache-2.0. Su funcion no es la generacion de texto libre, sino recibir una lectura en hiragana y devolver candidatos de escritura (表記) para esa lectura, que es exactamente la tarea que realiza un motor de entrada de texto japones (IME) al convertir lo que el usuario teclea. El modelo esta disenado para ser cargado por el motor de conversion del proyecto setsuna-ime, en su version que implementa los operadores `neo_ime.LinearQ4G` y `neo_ime.TokenMoEQ4G`.

Tecnicamente se trata de un modelo no autorregresivo basado en CTC (Connectionist Temporal Classification) con arquitectura Mixture-of-Experts. La particularidad principal es que esta entrenado asumiendo cuantizacion desde el origen: los pesos de los expertos se almacenan a 3 bits, el resto de capas lineales a 4 bits con escalas y puntos cero cada 64 valores, y la tabla de embeddings de n-gramas de caracteres usa cuantizacion de producto. El artefacto distribuido es un unico fichero ONNX ya cuantizado, acompanado de un manifiesto que consume el motor.

Es relevante ahora porque los IME neuronales ligeros que caben en el dispositivo son una alternativa practica a los conversores estadisticos clasicos, y este modelo apuesta por un formato de despliegue muy concreto (ONNX cuantizado, sin dependencia de frameworks de inferencia pesados) y por un unico idioma, el japones. El repositorio tiene un tamano de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y no se ha publicado informacion sobre el numero de parametros ni la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo con CTC y Mixture-of-Experts |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos a 3 bits; capas lineales a 4 bits (escala y punto cero cada 64 valores); embeddings de n-gramas con cuantizacion de producto; artefacto distribuido en int8/ONNX |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX cuantizado (`.onnx`) mas manifiesto JSON, vocabulario TSV y tablas auxiliares binarias/TSV |

## Arquitectura y entrenamiento

El modelo es un conversor kana-kanji no autorregresivo: recibe la secuencia de lectura en hiragana y emite directamente los candidatos de escritura mediante CTC, en lugar de generar token a token como haria un decoder causal. La arquitectura es de tipo Mixture-of-Experts, con pesos de expertos almacenados a 3 bits y el resto de capas lineales a 4 bits, lo que indica un diseno orientado a la cuantizacion desde el entrenamiento (quantization-aware training) y no un post-procesado. La tabla de embeddings de n-gramas de caracteres se guarda con cuantizacion de producto. Los pesos iniciales proceden de un recorte del modelo Bletilla-v0.1-small.

El entrenamiento se realizo sobre textos japoneses anotados con su lectura, usando como referencia de anotacion los diccionarios SudachiDict (Apache-2.0), UniDic y Mozc (BSD-3-Clause). El corpus combina FineWeb-2 japones y fineweb-2-edu-japanese (ODC-BY 1.0), JetCopper-10B y open2ch y ParallelFiction-Ja_En-100k (Apache-2.0), CC-100 japones, HPLT 3.0 japones y mqa-ja (CC0 1.0), parte del LLM-jp Corpus v4, Wikipedia en japones (CC BY-SA 4.0), J-ResearchCorpus, libros blancos del gobierno japones, el corpus de noticias de livedoor, Amazon Reviews Multi en japones, JESC y Aozora Bunko. No se especifica el numero de tokens de entrenamiento ni si hubo etapas de RLHF o DPO, algo poco habitual en este tipo de modelo y que probablemente no aplique.

## Capacidades

- Conversion kana-kanji: dada una lectura en hiragana, devuelve candidatos de escritura en japones.
- Generacion de multiples candidatos y reordenacion de los mismos mediante tablas de frecuencia de palabras y de secuencias de caracteres incluidas en el repositorio (`.pairs.bin`, `.words.tsv`).
- Inferencia no autorregresiva con CTC, lo que permite emitir la conversion en una sola pasada.
- Ejecucion en ONNX cuantizado, pensada para integrarse en un motor de IME local.
- Soporte de un unico idioma: japones.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking. No es un modelo de chat ni de instrucciones.

## Casos de uso

- Motor de entrada de texto japones (IME) en escritorio: el modelo se integra en el motor de conversion de setsuna-ime para transformar la lectura en hiragana que teclea el usuario en candidatos de escritura, con la ventaja de que el artefacto ONNX cuantizado evita depender de un runtime de inferencia pesado.
- IME en dispositivos con recursos limitados: al estar cuantizado a 3 y 4 bits y distribuirse como ONNX, es apto para entornos donde no cabe un modelo generativo de gran tamano, siempre que el motor anfitrion implemente los operadores `neo_ime.LinearQ4G` y `neo_ime.TokenMoEQ4G`.
- Procesamiento por lotes de texto japones: conversion de corpus almacenados solo en kana (por ejemplo, transcripciones o datos de entrenamiento) a su forma con kanji, usando el modelo como paso de normalizacion.
- Normalizacion de entradas para pipelines de NLP en japones: homogeneizar lecturas y escrituras antes de tareas posteriores como busqueda, indexacion o analisis morfologico.
- Herramientas de accesibilidad: asistencia a la escritura en japones para usuarios que introducen texto por lectura, con generacion de varios candidatos entre los que elegir.
- Investigacion sobre IME neuronales: el modelo sirve como referencia reproducible de un conversor CTC con MoE cuantizado, util para comparar con conversores estadisticos clasicos o con enfoques autorregresivos.
- Reordenacion de candidatos en sistemas existentes: las tablas de frecuencia de palabras y de pares de caracteres pueden emplearse para puntuar y reordenar candidatos generados por otro conversor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0.0 GB y el modelo se distribuye cuantizado (expertos a 3 bits, lineales a 4 bits), por lo que la huella deberia ser reducida, pero no se han publicado cifras de parametros ni de memoria.
- GPU recomendadas: no disponible. No se especifica ningun hardware objetivo.
- Compatibilidad con GPU de consumo: no confirmada. Por el perfil de cuantizacion es plausible que quepa en GPU de consumo, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: el modelo esta pensado para el motor de setsuna-ime, que carga el manifiesto JSON y el fichero ONNX. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y en general estos runtimes no son aplicables a un conversor CTC de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cymbidium-v1.0-xsmall | CTC + MoE, conversion kana-kanji | no disponible | no disponible | Apache-2.0 | Hugging Face, ONNX cuantizado |
| Bletilla-v0.1-small | Modelo del mismo autor, origen de los pesos iniciales | no disponible | no disponible | no disponible | Hugging Face |
| Conversores estadisticos clasicos (p. ej. Mozc) | Basados en diccionario y modelo de lenguaje n-grama | no aplica | no aplica | BSD-3-Clause (Mozc) | Ampliamente desplegado |

No se dispone de datos de rendimiento de ninguno de los modelos comparados en la informacion proporcionada, por lo que la comparacion se limita a tipo, licencia y forma de distribucion.

## Limitaciones y advertencias

- Modelo monoidioma: solo soporta japones. No debe esperarse ningun comportamiento en otros idiomas.
- No es un modelo generativo ni de instrucciones: no responde a prompts, no mantiene conversaciones y no admite tool calling.
- Dependencia estricta del motor: requiere una version de setsuna-ime que implemente los operadores `neo_ime.LinearQ4G` y `neo_ime.TokenMoEQ4G`. Otros runtimes ONNX convencionales probablemente no podran ejecutar el grafo tal cual.
- Ausencia de datos de evaluacion: no hay benchmarks publicados, ni cifras de parametros, contexto o precision de conversion, lo que impide estimar su calidad frente a alternativas.
- Riesgo de conversion incorrecta: como todo conversor kana-kanji, puede producir candidatos erroneos en nombres propios, terminologia tecnica, neologismos y variantes regionales; la reordenacion por frecuencia puede favorecer lecturas comunes frente a las correctas en contextos especializados.
- Sesgos del corpus: el entrenamiento combina fuentes muy heterogeneas (Wikipedia, noticias, foros de open2ch, resenas de Amazon, ficcion y literatura de Aozora Bunko), lo que puede trasladar sesgos de registro y de dominio a los candidatos generados.
- Licencias de los datos de origen: aunque el modelo se publica como Apache-2.0, el corpus de entrenamiento incluye material con licencias diversas (CC BY-SA 4.0 en Wikipedia, ODC-BY 1.0, CC0 1.0 y licencias por articulo en J-ResearchCorpus). Conviene revisar las implicaciones antes de un uso comercial a gran escala.
- Madurez del proyecto: el repositorio registra cero descargas y cero likes en el momento de la consulta, y el modelo se creo y actualizo en la misma fecha, lo que sugiere una publicacion reciente y sin validacion externa conocida.
- Sin garantias de produccion: no se han publicado pruebas de latencia, estabilidad ni tasas de error en entornos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/esehe/Cymbidium-v1.0-xsmall
- Motor setsuna-ime: https://github.com/esehehelp/setsuna-ime
- Modelo de origen de los pesos: https://huggingface.co/esehe/Bletilla-v0.1-small
- FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- fineweb-2-edu-japanese: https://huggingface.co/datasets/hotchpotch/fineweb-2-edu-japanese
- JetCopper-10B: https://huggingface.co/datasets/sudy-super/JetCopper-10B
- CC-100 japones: https://huggingface.co/datasets/range3/cc100-ja
- HPLT 3.0: https://huggingface.co/datasets/HPLT/HPLT3.0
- mqa-ja: https://huggingface.co/datasets/hpprc/mqa-ja
- LLM-jp Corpus v4: https://huggingface.co/datasets/llm-jp/llm-jp-corpus-v4
- J-ResearchCorpus: https://huggingface.co/datasets/kunishou/J-ResearchCorpus
- open2ch: https://huggingface.co/datasets/p1atdev/open2ch
- ParallelFiction-Ja_En-100k: https://huggingface.co/datasets/NilanE/ParallelFiction-Ja_En-100k
- JESC: https://huggingface.co/datasets/nntsuzu/JESC
- Aozora Bunko: https://www.aozora.gr.jp/
