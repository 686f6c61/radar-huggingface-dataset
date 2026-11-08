# Qntology/stanza-ar

## Resumen

Stanza-ar es el paquete de modelos de procesamiento lingüístico para árabe del proyecto Stanza, desarrollado por el Stanford NLP Group. No se trata de un modelo generativo ni de un LLM, sino de una cadena de procesadores especializados que cubren el pipeline clásico de análisis lingüístico: tokenización, expansión de palabras multi-palabra (multi-word tokens), etiquetado morfosintáctico (POS), lematización y análisis de dependencias. La versión aquí descrita, publicada por Qntology, es una conversión a ONNX del modelo original `stanfordnlp/stanza-ar`.

El repositorio contiene los pesos convertidos a formato ONNX, lo que permite ejecutar el pipeline sin depender de PyTorch en tiempo de inferencia. Incluye dos formatos: el formato 1 heredado (ficheros en la raíz) y el formato 2 (directorio `format2/`), que separa codificadores y decodificadores y añade diccionarios auxiliares para lematización y expansión multi-palabra. La conversión se ha verificado contra el pipeline original de PyTorch obteniendo salidas idénticas en tokens, UPOS, XPOS, rasgos, lemas, cabezas y relaciones de dependencia.

Es relevante para quienes necesitan análisis sintáctico y morfológico de árabe en producción con dependencias mínimas (solo runtime ONNX), sin acceso a GPU y con licencia Apache 2.0. No es un modelo de generación de texto: su función es estructural y determinista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de modelos neuronales (BiLSTM con embeddings y char LM) exportados a ONNX; tokenizador, POS, lematizador y parser de dependencias |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa a nivel de frase/oración) |
| Tipos de cuantizacion | no disponible (pesos ONNX en precisión original) |
| Idiomas soportados | Árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`tokenizer.onnx`, `pos.onnx`, `lemma.onnx`, `depparse.onnx`, `vocab.json`; en format2 también `mwt_*.onnx`, `lemma_*.onnx`) |

## Arquitectura y entrenamiento

El pipeline sigue la arquitectura de Stanza 1.15.0 para árabe. Los procesadores se basan en redes BiLSTM con embeddings de palabras y de caracteres, y en el caso de POS y depparse emplean modelos de lenguaje de caracteres (`charlm`) como rasgo adicional. Los paquetes por defecto utilizados son: tokenize `padt_nocharlm`, mwt `padt`, pos `padt_charlm`, lemma `padt_nocharlm` y depparse `padt_charlm`. El entrenamiento original se realizó sobre treebanks de Universal Dependencies para árabe, con anotación morfosintáctica y de dependencias.

La innovación de esta versión es la exportación a ONNX mediante `stanza-onnx-export` (commit `d56cf6f`), que permite ejecutar el pipeline completo sin PyTorch. La verificación end-to-end (`verify_onnx.py`) compara las salidas contra `stanza.Pipeline` y reporta identidad exacta en 19 textos de árabe (278 en total entre los 12 idiomas convertidos). El formato 2 separa codificadores y decodificadores (`lemma_encoder.onnx`/`lemma_decoder.onnx`, `mwt_encoder.onnx`/`mwt_decoder.onnx`) y usa diccionarios (`lemma_dict.json`, `mwt_dict.json`) para resolver formas léxicas.

## Capacidades

- Tokenización de texto árabe en unidades lingüísticas.
- Expansión de palabras multi-palabra (MWT) en tokens sintácticos.
- Etiquetado POS universal (UPOS) y específico del treebank (XPOS).
- Predicción de rasgos morfológicos (features).
- Lematización de tokens.
- Análisis de dependencias: asignación de cabezas y relaciones sintácticas.
- Ejecución sobre runtime ONNX sin dependencia de PyTorch.
- Procesamiento por lotes a nivel de oración; no es un modelo generativo ni soporta tool calling ni razonamiento multi-paso.
- Capacidad monolingüe: solo árabe.

## Casos de uso

- Preprocesado lingüístico para pipelines de NLP en árabe: tokenización y lematización previas a indexación de búsqueda o entrenamiento de modelos posteriores, aprovechando la salida determinista del pipeline.
- Análisis sintáctico para extracción de relaciones: el parser de dependencias permite construir árboles sintácticos que alimenten sistemas de extracción de información o tripletas en dominios como noticias en árabe.
- Normalización morfológica en motores de búsqueda en árabe: la lematización y la expansión MWT reducen la variabilidad de formas y mejoran el recall.
- Anotación asistida de corpus: generación automática de etiquetas POS y dependencias para revisión humana en proyectos de anotación lingüística.
- Enseñanza de árabe asistida por ordenador: análisis gramatical de oraciones para herramientas didácticas que muestren estructura sintáctica y lemas.
- Despliegue en entornos sin GPU o con dependencias mínimas: al estar en ONNX, se puede integrar en servicios ligeros (por ejemplo, funciones serverless o contenedores pequeños) donde instalar PyTorch no es viable.
- Verificación de pipelines: al haberse validado contra la implementación de referencia, sirve como componente de comparación en tests de regresión de sistemas de NLP en árabe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la verificación de equivalencia funcional con el pipeline de PyTorch (salidas idénticas en tokens, UPOS, XPOS, features, lemas, cabezas y relaciones en 19 textos de árabe), no métricas de precisión (F1, LAS, UAS) ni de latencia.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 1.7 GB y los modelos son pequeños en comparación con LLM, por lo que la inferencia puede ejecutarse en CPU.
- GPU recomendadas: no es necesario GPU; cualquier CPU moderna es suficiente. Si se usa GPU, cualquier tarjeta con soporte ONNX Runtime (por ejemplo, RTX 4090, A100) aceleraría el procesamiento por lotes.
- Cabe en GPU consumer: sí, con amplio margen; también en CPU y en entornos con poca memoria.
- Opciones de despliegue: ONNX Runtime (principal), integración con la librería Stanza mediante `stanza::remote_base` para el formato 2 (a partir de noviembre de 2026); no requiere vLLM, llama.cpp ni TGI, que son para modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qntology/stanza-ar (esta ficha) | Pipeline lingüístico ONNX (tokenización, POS, lema, dependencias) | Árabe | no aplica | Apache 2.0 | Hugging Face, ONNX |
| stanfordnlp/stanza-ar | Pipeline lingüístico PyTorch (modelo original) | Árabe | no aplica | Apache 2.0 | Hugging Face |
| CAMeL Tools (CAMeL Lab) | Conjunto de herramientas de NLP árabe (morfología, POS, etc.) | Árabe | no aplica | MIT (verificar) | GitHub, pip |
| Farasa | Segmentador y analizador morfológico árabe | Árabe | no aplica | no disponible | Web/API |

La comparación directa de rendimiento no está disponible en la información proporcionada. La diferencia principal de esta ficha frente al original es el formato ONNX y la estructura format2; frente a CAMeL Tools y Farasa, el enfoque es el pipeline de dependencias de Universal Dependencies y la ejecución sin PyTorch.

## Limitaciones y advertencias

- Modelo monolingüe: solo procesa árabe; no soporta otros idiomas.
- No es un modelo generativo: no produce texto libre ni responde a instrucciones; su salida es etiquetas y estructuras.
- Sesgos: al entrenarse sobre treebanks de Universal Dependencies, puede reflejar los sesgos de dominio y de anotación de esos corpus (por ejemplo, registro periodístico o literario), con menor cobertura en árabe dialectal o texto informal.
- Riesgo de errores en texto no estándar: la tokenización y la expansión MWT pueden fallar en dialectos, transliteraciones o texto sin vocalizar fuera de dominio.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de licencia y atribución al proyecto Stanza.
- Dependencia de la versión de Stanza: el formato 2 está pensado para clientes `stanza::remote_base` a partir de noviembre de 2026; clientes antiguos deben usar el formato 1 de la raíz.
- No se han publicado métricas de precisión en esta conversión; la verificación es de equivalencia con el pipeline original, no de calidad absoluta.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Qntology/stanza-ar
- Modelo original: https://huggingface.co/stanfordnlp/stanza-ar
- Web de Stanza: https://stanfordnlp.github.io/stanza
- Repositorio GitHub de Stanza: https://github.com/stanfordnlp/stanza
- Descarga de modelos Stanza: https://stanfordnlp.github.io/stanza/download_models.html
- Herramienta de exportación ONNX: https://github.com/sungu-che/stanza-onnx-export
- Repositorio de modelos de Hugging Face de Stanza: https://github.com/stanfordnlp/huggingface-models
- Estadísticas de descargas (OpenModelStats): https://openmodelstats.com/models/stanfordnlp/stanza-ar
