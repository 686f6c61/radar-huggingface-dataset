# MahdiAlikhah/rishe-models

## Resumen

Rishe models es una coleccion de cuatro modelos ONNX especializados en procesamiento de lenguaje natural para persa (farsi), desarrollada por MahdiAlikhah como parte del motor Rishe, escrito en Rust. Cada tarea se distribuye como un pack independiente: etiquetado morfosintactico (POS), reconocimiento de entidades nombradas (NER), deteccion de ezafe y analisis de dependencias. Todos comparten el mismo codificador, `HooshvareLab/albert-fa-zwnj-base-v2`, afinado de forma separada para cada tarea y exportado a ONNX en fp32.

El interes de esta publicacion reside en su enfoque de despliegue ligero: packs de entre 44,8 y 48,1 MB que pueden ejecutarse con ONNX Runtime o con tract, sin necesidad de GPU, lo que facilita su integracion en herramientas de linea de comandos, servicios embebidos o pipelines de procesamiento de texto persa. Frente a alternativas como Hazm o Shekar, los resultados reportados por el autor muestran mejoras notables en NER (94,05 F1 exact-span en PEYMA) y ezafe (94,86 F1), aunque el analisis de dependencias se situa en un rango compacto, no en el estado del arte.

La licencia es Apache-2.0 para POS, NER y ezafe, mientras que el pack de dependency parsing se publica bajo CC BY-SA 4.0, un detalle relevante para uso comercial. El repositorio tiene un tamano de 0,2 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ALBERT, base `HooshvareLab/albert-fa-zwnj-base-v2`) con cabezas de clasificacion por token y biaffine para dependencias |
| Parametros totales | no disponible (modelo base ALBERT; tamano de pesos ~44,8-48,1 MB por pack en fp32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 192 tokens para POS, NER y depparse; 128 tokens para ezafe |
| Tipos de cuantizacion | no disponible (exportado en fp32; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | Persa (fa) |
| Licencia | Apache-2.0 (POS, NER, ezafe); CC BY-SA 4.0 (dependency parsing) |
| Formato de pesos | ONNX (model.onnx), tokenizer.json, tokenizer_config.json, labels.json, metrics.json |
| Libreria de inferencia | onnxruntime (tambien compatible con tract) |
| Tamano del repositorio | 0,2 GB (los cuatro packs suman ~182 MB) |
| Fecha de creacion | 2026-10-24 |
| Ultima actualizacion | 2026-11-03 |

## Arquitectura y entrenamiento

Los cuatro packs comparten el codificador ALBERT persa `HooshvareLab/albert-fa-zwnj-base-v2`, un transformer encoder con tokenizacion adaptada a ZWNJ (zero-width non-joiner). Para POS, NER y ezafe se anade una cabeza de clasificacion a nivel de palabra: cuando una palabra se divide en varios subtokens, la prediccion se toma del primer subtoken. Estos tres packs usan lote de tamano 1 con eje de secuencia dinamico. El parser de dependencias emplea una cabeza biaffine para puntuar arcos y un clasificador de relaciones condicionado por la cabeza, con decodificacion mediante el algoritmo de Chu-Liu/Edmonds (MST de raiz unica) y eje de palabras dinamico sobre una secuencia fija de 192 tokens.

El entrenamiento se realizo por tarea. POS se entreno sobre las particiones de train de UD Persian Seraji y UD-PerDT, evaluando por separado en cada test. NER uso el dataset `AliFartout/PEYMA-ARMAN-Mixed` con sus splits train/validation/test, mas una evaluacion solo con PEYMA. Ezafe se entreno con `MahtaFetrat/HomoRich-G2P-Persian`, barajado, escaneando las primeras 150.000 filas y conservando hasta 100.000 para entrenamiento; las etiquetas provienen del marcador ezafe `1` en `Mapped Phoneme`, descartando filas con desajuste entre grafemas y fonemas. El parser de dependencias se entreno 10 epocas, lote 16, AdamW con tasa 2e-5, warmup/decay lineal y semilla 42, seleccionando la mejor epoca (8) por LAS de desarrollo. Los packs compactos anteriores usaron 6 epocas para POS, 5 para NER y 3 para ezafe, con tasa 3e-5 y semilla 42 en una sola GPU. No se documenta uso de RLHF ni DPO.

## Capacidades

- Etiquetado POS con 16 etiquetas UPOS sobre texto persa.
- Reconocimiento de entidades nombradas con 21 etiquetas BIO que cubren DAT, EVE, FAC, LOC, MON, ORG, PCT, PER, PRO y TIM.
- Deteccion de ezafe (marcador morfologico persa) con dos clases: `NO_EZAFE` y `EZAFE`.
- Analisis de dependencias sintacticas con 45 relaciones Universal Dependencies, incluyendo puntuacion.
- Ejecucion en CPU mediante ONNX Runtime o tract, sin requerir GPU.
- Procesamiento a nivel de palabra con manejo de subtokens y ZWNJ.
- No incluye generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni modo thinking.
- No documenta capacidades de agentes ni razonamiento multi-paso.

## Casos de uso

- **Preprocesado linguistico para buscadores en persa**: el pack POS y el de dependencias permiten enriquecer indices con informacion morfosintactica y relaciones sintacticas, mejorando la precision de consultas sobre texto farsi.
- **Extraccion de entidades en noticias y documentos**: el pack NER, con 21 etiquetas BIO y F1 exact-span de 94,05 en PEYMA, sirve para poblar bases de datos de personas, organizaciones, lugares y fechas a partir de corpus periodisticos persas.
- **Anotacion asistida de corpus UD**: el parser de dependencias y el etiquetador POS pueden generar preanotaciones para revisores humanos en proyectos de treebanks persas, reduciendo el coste de anotacion manual.
- **Correccion y normalizacion de texto persa**: la deteccion de ezafe ayuda a desambiguar la pronunciacion y la morfologia en sistemas de texto-a-voz o en correctores ortograficos que necesitan conocer la vocalizacion implicita.
- **Analisis de sentimiento y mineria de opiniones**: combinar POS y NER permite identificar sujetos y objetos de opinion en resenas y redes sociales en farsi, alimentando clasificadores posteriores.
- **Integracion en herramientas CLI y servicios embebidos**: al ser packs ONNX de ~45 MB ejecutables en CPU con tract, encajan en utilidades de linea de comandos o microservicios con recursos limitados, sin dependencias de GPU.
- **Investigacion en NLP persa**: los packs permiten reproducir y comparar resultados frente a Hazm, Shekar o spaCy en tareas concretas, con metricas publicadas y manifiesto de hashes para verificar integridad.

## Benchmarks y rendimiento

Resultados reportados por el autor en los mismos conjuntos de test usados en los benchmarks de Rishe.

| Tarea | Dataset | Rishe | Shekar | Hazm |
|---|---|---|---|---|
| POS micro F1 | UD-Seraji | **94,89** | 82,50 | 90,66 |
| POS micro F1 | UD-PerDT | 96,80 | **97,39** | 84,90 |
| NER exact-span F1 | PEYMA test | **94,05** | 57,14 | N/A |
| NER entity F1 | PEYMA+Arman mixed | **92,48** | N/A | N/A |
| Ezafe F1 | HomoRich held-out | **94,86** | N/A | N/A |

Analisis de dependencias (MST de raiz unica, puntuacion incluida):

| Treebank de test | UAS | LAS | LAS sin puntuacion |
|---|---:|---:|---:|
| UD-Seraji | 85,38 | 77,99 | 78,18 |
| UD-PerDT | 91,84 | 87,31 | 87,33 |

Medias y desviacion estandar muestral en semillas 42, 43 y 44: LAS 76,70 ± 1,18 en Seraji y 87,71 ± 0,43 en PerDT. El parser publicado corresponde a la semilla 42. Segun el autor, se situa por debajo de Hazm a escala BERT y de spaCy `trf`, y por encima de spaCy compacto `sm` en PerDT.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; los packs estan exportados en fp32 y pensados para CPU.
- GPU recomendadas: no aplica; cualquier GPU compatible con ONNX Runtime podria usarse, pero no es el escenario documentado.
- Cabe en GPU de consumo: si, aunque el uso previsto es CPU; el tamano de pesos (~45 MB por pack) es trivial para cualquier GPU moderna.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider) y tract, el runtime que usa Rishe internamente.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor remite a `scripts/benchmark_modelpack.py` del repositorio Rishe para benchmarks de runtime, sin cifras publicadas en la model card.
- Memoria en disco: ~182 MB para los cuatro packs; ~45-48 MB por pack individual.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | POS (Seraji) | NER (PEYMA) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Rishe models | ALBERT + cabezas ONNX | no disponible (~45 MB/pack) | 192 (128 ezafe) | 94,89 F1 | 94,05 F1 | Apache-2.0 / CC BY-SA 4.0 (depparse) | Hugging Face, ONNX |
| Hazm | Pipeline NLP persa | no disponible | no disponible | 90,66 F1 | N/A | no disponible | Open source |
| Shekar | Pipeline NLP persa | no disponible | no disponible | 82,50 F1 (Seraji) / 97,39 (PerDT) | 57,14 F1 | no disponible | Open source |
| spaCy (modelos persas) | Pipeline NLP | variable (`sm`, `trf`) | no disponible | no disponible | no disponible | MIT (spaCy) | Open source |

## Limitaciones y advertencias

- El modelo solo soporta persa (fa); no hay capacidades multilingues documentadas.
- La longitud de contexto es corta (192 tokens, 128 para ezafe), lo que limita el procesamiento de documentos largos sin segmentacion previa.
- El parser de dependencias no es estado del arte: el propio autor lo describe como compacto y por debajo de Hazm a escala BERT y de spaCy `trf`.
- El POS es un compromiso entre treebanks: gana 12,4 puntos en Seraji pero pierde 0,59 en PerDT frente a Shekar; no se ofrece variante especifica para PerDT.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de errores de etiquetado en dominios alejados de los datos de entrenamiento (UD, PEYMA, HomoRich).
- La licencia del pack de dependency parsing es CC BY-SA 4.0, distinta de Apache-2.0 del resto; el uso comercial debe revisarse por separado y puede exigir compartir obras derivadas bajo la misma licencia.
- Los packs no comparten backbone en esta release; no hay ahorro de memoria al cargar varias tareas simultaneamente.
- No se documentan sesgos especificos ni evaluaciones de robustez fuera de los conjuntos de test citados.
- El repositorio no registra descargas ni likes, y las notebooks de entrenamiento no forman parte del repositorio publico, lo que dificulta la reproducibilidad completa.
- La fecha de creacion indicada (2026-10-24) es posterior a la fecha actual; conviene verificar la vigencia de los artefactos antes de usarlos en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/MahdiAlikhah/rishe-models
- Repositorio Rishe (Rust): https://github.com/MahdiAlikhah/rishe
- Modelo base: https://huggingface.co/HooshvareLab/albert-fa-zwnj-base-v2
- Dataset PEYMA-ARMAN-Mixed: https://huggingface.co/datasets/AliFartout/PEYMA-ARMAN-Mixed
- Dataset HomoRich-G2P-Persian: https://huggingface.co/datasets/MahtaFetrat/HomoRich-G2P-Persian
- Model card del parser: `depparse/MODEL_CARD.md` dentro del repositorio de Hugging Face
- Script de benchmark de precision: `scripts/benchmark_models.py` en el repositorio Rishe
- Script de benchmark de runtime: `scripts/benchmark_modelpack.py` en el repositorio Rishe
