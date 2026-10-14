# chaliasif/saudi-tender-tagger-onnx

## Resumen

saudi-tender-tagger-onnx es la exportacion a formato ONNX del clasificador de actividades chaliasif/saudi-tender-tagger, desarrollado por el usuario chaliasif. El modelo recibe el titulo en arabe de una licitacion publica saudita junto con el organismo emisor (formato `titulo | agencia`) y devuelve una de las 54 categorias de actividad del portal Etimad. Se trata de un fine-tune de CAMeL-Lab/bert-base-arabic-camelbert-mix, un transformer encoder de tipo BERT con cabeza de clasificacion de secuencia (`BertForSequenceClassification`) y 54 etiquetas, con longitud maxima de 128 tokens.

La relevancia de esta version concreta esta en el empaquetado: el autor publica dos ficheros ONNX, uno en fp32 (436,6 MB) y otro cuantizado a int8 dinamico per-channel (110,0 MB), de forma que el modelo se ejecuta en Node.js y directamente en el navegador mediante transformers.js, sin necesidad de Python ni de servidor de inferencia. El entrenamiento se realizo sobre el dataset chaliasif/etimad-tender-titles y el codigo asociado esta en el repositorio GitHub del autor.

En la particion de test del dataset (1.053 filas) el modelo alcanza un 61,06 % de acierto top-1 y un 80,44 % de acierto top-3 en fp32, mientras que la version int8 logra un 60,68 % y un 80,25 % respectivamente, con una concordancia del 98,29 % respecto al original en PyTorch. El modelo tiene un uso marginal en el momento de redactar esta ficha (0 descargas y 0 likes), por lo que no cuenta con validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) con cabeza de clasificacion de secuencia, `BertForSequenceClassification` |
| Parametros totales | Aproximadamente 109 millones (estimacion derivada del fichero fp32 de 436,6 MB a 4 bytes por parametro); la model card no declara la cifra |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 128 tokens (max_length de entrenamiento); los textos mas largos se truncan |
| Tipos de cuantizacion | fp32 (fichero completo) e int8 dinamico per-channel (fichero cuantizado) |
| Idiomas soportados | Arabe (`ar`) unicamente |
| Licencia | MIT para el fine-tune y la exportacion; el modelo base CAMeLBERT-Mix es Apache-2.0 y su aviso debe conservarse al redistribuir |
| Formato de pesos | ONNX (`onnx/model.onnx` fp32 de 436,6 MB y `onnx/model_quantized.onnx` int8 de 110,0 MB), mas `tokenizer.json`, `vocab.txt` y ficheros de configuracion (unos 1,1 MB) |
| Tarea | Clasificacion de texto, 54 clases (categorias de actividad de Etimad) |
| Tamano del repositorio | 0,5 GB |
| Libreria declarada | transformers.js |

## Arquitectura y entrenamiento

El modelo es un encoder BERT en su variante base. La model card indica que se parte de CAMeL-Lab/bert-base-arabic-camelbert-mix, un checkpoint preentrenado en arabe publicado por CAMeL-Lab y descrito en el articulo de Inoue, Khalifa y Habash, "The Interplay of Variant, Size, and Task Type in Arabic Pre-trained Language Models" (WANLP 2021). Sobre ese checkpoint se anade una cabeza de clasificacion de secuencia con 54 etiquetas y se ajusta con `max_length = 128`. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del corpus de ajuste ni si se aplicaron tecnicas de alineacion como RLHF o DPO; esos datos no estan publicados en la ficha.

Los datos de ajuste proceden del dataset chaliasif/etimad-tender-titles. La innovacion tecnica de esta publicacion no esta en la arquitectura, sino en el pipeline de exportacion: se generan dos grafos ONNX (fp32 y cuantizacion dinamica int8 per-channel) y se verifica la paridad funcional contra el modelo original en PyTorch, con un 100,00 % de concordancia en fp32 y un 98,29 % en int8 sobre 1.053 filas de test. El autor documenta tambien una diferencia de comportamiento entre versiones del runtime: con `@huggingface/transformers` 4.3.1 (onnxruntime-node 1.30) la concordancia int8 en Node frente a Python es del 98,5 %, mientras que con 3.8.1 (onnxruntime-node 1.21, kernels int8 mas antiguos) baja al 95,5 %, por lo que recomienda la rama 4.x para int8 o fp32 en la 3.x.

## Capacidades

- Clasificacion de texto en arabe: asigna una de 54 categorias de actividad de Etimad a partir del titulo de la licitacion y el organismo emisor.
- Salida con puntuaciones de probabilidad y recuperacion de las k mejores clases (`top_k`), lo que permite usar el top-3 como lista de sugerencias.
- Ejecucion sin Python: inferencia en Node.js y en el navegador mediante transformers.js, cargando el fichero int8 de 110 MB desde un CDN o un bundler.
- Soporte de ficheros locales: el autor documenta el uso de `env.localModelPath` y `env.allowRemoteModels = false` para despliegues sin acceso a red.
- Normalizacion de entrada documentada: NFKC Unicode, eliminacion de U+200E y U+200F, colapso de espacios y recorte de ambos campos (implementado como `make_input(title, agency)` en `scripts/common.py`).
- No soporta generacion de texto, razonamiento multi-paso, tool calling, agentes, vision ni audio: es un clasificador encoder de proposito especifico.
- Capacidades multilingues: no disponibles; el modelo esta entrenado y etiquetado solo en arabe.

## Casos de uso

- Clasificacion automatica de licitaciones en agregadores tipo Etimad: cada anuncio se pasa como `titulo | agencia` y se etiqueta con una de las 54 categorias, lo que permite indexar y filtrar oportunidades sin intervencion manual.
- Enrutamiento comercial de oportunidades: con el top-3 de categorias y sus puntuaciones, un CRM puede asignar cada licitacion al equipo sectorial correspondiente (salud, TI, construccion, etc.) y priorizar por confianza.
- Alertas y suscripciones en un SaaS de seguimiento de licitaciones: el fichero int8 de 110 MB y los aproximadamente 21 ms por titulo en CPU permiten clasificar en el propio navegador o en un worker de Node sin coste de GPU.
- Analitica de contratacion publica: etiquetar historicos de licitaciones para medir volumen y evolucion del gasto por categoria de actividad y por organismo emisor.
- Preetiquetado en procesos de alta de proveedores: al registrar una empresa, clasificar automaticamente su ambito de actividad a partir de titulos de contratos previos o de su descripcion y proponer una categoria Etimad revisable por un operador.
- Normalizacion de catalogos internos de oportunidades: convertir descripciones heterogeneas de licitaciones en un vocabulario controlado de 54 clases para alimentar dashboards o modelos posteriores.
- Microservicio de clasificacion dentro de un backend Node.js: al ser un grafo ONNX, se puede embeber en una funcion serverless o en un endpoint Express sin dependencias de Python ni de un servidor de inferencia dedicado.
- Asistencia a la redaccion de ofertas: dado el titulo de una licitacion, sugerir las tres categorias mas probables para que el equipo compruebe requisitos de clasificacion y habilitacion del pliego.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre la particion de test del dataset (1.053 filas, onnxruntime 1.27 en Python), medidos contra la etiqueta exacta de actividad Etimad entre 54 clases:

| Modelo | Concordancia top-1 con PyTorch | Precision top-1 | Precision top-3 |
|---|---|---|---|
| PyTorch original | 100 % | 61,06 % | no disponible |
| ONNX fp32 | 100,00 % | 61,06 % | 80,44 % |
| ONNX int8 | 98,29 % | 60,68 % | 80,25 % |

Prueba adicional en Node.js sobre 200 filas de test aleatorias, comparando int8 en JS contra int8 en Python:

| Runtime | Concordancia int8 JS vs Python int8 |
|---|---|
| `@huggingface/transformers` 4.3.1 (onnxruntime-node 1.30) | 98,5 % |
| `@huggingface/transformers` 3.8.1 (onnxruntime-node 1.21) | 95,5 % |

Latencia publicada: mediana de aproximadamente 21 ms por titulo en CPU de Apple serie M. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales, que no aplican a un clasificador de 54 clases.

## Requisitos de hardware

- VRAM: no se requiere GPU. El fichero int8 ocupa 110,0 MB en disco y el fp32 436,6 MB; el consumo en memoria es del orden de unos cientos de MB en ambos casos, dependiendo del runtime y del tamano de lote.
- GPU recomendadas: no aplica. Cualquier GPU (A100, H100, RTX 4090, etc.) funcionaria a traves de ONNX Runtime, pero el modelo esta disenado para CPU por su tamano y su latencia ya baja.
- Viabilidad en hardware de consumo: si, en cualquier portatil o equipo de escritorio. El autor reporta una mediana de aproximadamente 21 ms por titulo en CPU de Apple serie M, lo que equivale a un orden de magnitud de decenas de titulos por segundo en un solo nucleo (estimacion derivada de la latencia publicada, no medida por el autor).
- Navegador: si. El fichero int8 de 110 MB se descarga y se ejecuta en el cliente mediante transformers.js.
- Opciones de despliegue: transformers.js en Node.js y navegador (`pipeline('text-classification', ...)`), y ONNX Runtime en Python (el autor valida con onnxruntime 1.27). No procede el uso de vLLM, llama.cpp, Ollama ni TGI, orientados a modelos generativos.
- Latencia y throughput: latencia mediana de unos 21 ms por titulo en CPU Apple serie M con int8; no se publican cifras de throughput por lote ni mediciones en x86.

## Comparativa con modelos similares

No se han encontrado en los resultados de busqueda otros clasificadores publicos de licitaciones saudies de Etimad con los que comparar. La comparacion mas util es dentro de la propia familia del modelo:

| Modelo | Parametros | Contexto | Tarea | Precision top-1 (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| chaliasif/saudi-tender-tagger-onnx (fp32/int8) | Aproximadamente 109 M | 128 tokens | 54 categorias Etimad | 61,06 % fp32 / 60,68 % int8 | MIT (base Apache-2.0) | ONNX en HuggingFace, uso en Node y navegador |
| chaliasif/saudi-tender-tagger (original PyTorch) | Aproximadamente 109 M | 128 tokens | 54 categorias Etimad | 61,06 % | no disponible en la informacion proporcionada | Pesos PyTorch en HuggingFace, requiere Python |
| CAMeL-Lab/bert-base-arabic-camelbert-mix (base) | Aproximadamente 109-110 M | no disponible | Modelado enmascarado en arabe; base para fine-tunes | no aplica (no clasifica Etimad) | Apache-2.0 | HuggingFace |

## Limitaciones y advertencias

- Precision top-1 del 61,06 %: aproximadamente cuatro de cada diez titulos se clasifican en una categoria incorrecta. Para produccion conviene consumir el top-3 (80,44 %), presentar la salida como sugerencia y mantener revision humana.
- La cuantizacion int8 introduce un 1,71 % de discrepancias frente al modelo original en PyTorch, con una perdida de 0,38 puntos de precision top-1 y 0,19 puntos en top-3.
- El tokenizador de JavaScript no siempre trunca a 128 tokens, segun advierte el propio autor; si se envian entradas largas pueden producirse resultados distintos a los de Python. Hay que mantener los titulos cortos o truncar antes de llamar al pipeline.
- La version 3.8.1 de `@huggingface/transformers` degrada la concordancia int8 hasta el 95,5 % frente a Python por kernels ONNX mas antiguos. En esa rama el autor recomienda fp32.
- El formato de entrada es estricto: `titulo | agencia`, con normalizacion NFKC previa, eliminacion de U+200E y U+200F, colapso de espacios y recorte. Omitir estos pasos previsiblemente degrada la precision.
- Idioma: unicamente arabe. No hay evidencia de funcionamiento en otros idiomas ni en mezcla de arabe y latin.
- Taxonomia cerrada de 54 clases: si Etimad modifica o amplia sus categorias de actividad, el modelo queda desalineado. Tampoco puede devolver categorias fuera de ese conjunto ni abstenerse de clasificar.
- No se documentan en la model card el volumen ni la composicion del corpus de ajuste, la distribucion de clases, los criterios de anotacion ni analisis de sesgo. No es posible evaluar sesgos por organismo, region o sector con la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos con puntuaciones altas en categorias incorrectas. Calibrar umbrales con datos propios.
- Licencia: el fine-tune y la exportacion se publican bajo MIT, pero el modelo base CAMeLBERT-Mix es Apache-2.0; al redistribuir hay que conservar el aviso de la licencia base.
- Adopcion nula en el momento de redactar la ficha (0 descargas, 0 likes): el modelo no ha sido validado de forma independiente por la comunidad y las unicas metricas disponibles son las del autor.
- El repositorio ocupa 0,5 GB, de los cuales 436,6 MB corresponden al fichero fp32; en despliegues con ancho de banda limitado conviene distribuir solo el int8 de 110 MB.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chaliasif/saudi-tender-tagger-onnx
- Modelo original en PyTorch: https://huggingface.co/chaliasif/saudi-tender-tagger
- Dataset de entrenamiento: https://huggingface.co/datasets/chaliasif/etimad-tender-titles
- Codigo fuente: https://github.com/aliasif97/saudi-tender-tagger
- Modelo base CAMeLBERT-Mix: https://huggingface.co/CAMeL-Lab/bert-base-arabic-camelbert-mix
- Articulo del modelo base: Inoue, Khalifa y Habash, "The Interplay of Variant, Size, and Task Type in Arabic Pre-trained Language Models", WANLP 2021 (no se proporciona URL directa en la informacion disponible)
- Especificacion ONNX: https://onnx.ai/
- Repositorio de modelos ONNX: https://github.com/onnx/models
- Modelos y runtimes de ONNX Runtime: https://onnxruntime.ai/models
- Portal Etimad (contexto del dominio): https://etimad.win/
