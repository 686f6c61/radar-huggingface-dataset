# ainouche-abderahmane/DZAIR-FP16

## Resumen

DZAIR-FP16 es una compilacion en media precision (fp16) del modelo DZAIR, un codificador de 105.304.320 parametros especializado en la deteccion de tokens reemplazados (*replaced-token-detection*) para dariya argelina (codigo de idioma `arq`) y arabizi (dariya escrita en caracteres latinos). Lo desarrolla ainouche-abderahmane y se publica como derivado directo del repositorio base `ainouche-abderahmane/DZAIR`, compartiendo pesos y tokenizador pero ocupando la mitad de espacio en disco: 210.619.440 bytes frente a 421.228.128 bytes de la version fp32.

El modelo esta etiquetado como `text-classification` y se distribuye con codigo propio (`modeling_dzair.py`), por lo que requiere `trust_remote_code=True` para cargarse. Su conversion a fp16 mantiene la fidelidad respecto al original: similitud coseno de 1,00001 y diferencia absoluta maxima de 0,0039 sobre las salidas fp32. Segun la model card, los resultados del modelo base se conservan sin cambios, incluidos los valores de sentimiento en arabizi (65,52) y en foros (96,33), ambos promedios de 10 semillas.

Es relevante ahora porque ofrece una via de despliegue con la mitad de memoria y sin degradacion medible, util para entornos con recursos limitados que necesiten procesar texto dialectal argelino. La licencia es Apache-2.0 tanto para pesos como para codigo, con la misma advertencia sobre el texto de entrenamiento que el modelo base. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, lo que sugiere un lanzamiento reciente o de baja difusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador con deteccion de tokens reemplazados (discriminador); implementado en codigo propio `modeling_dzair.py` |
| Parametros totales | 105.304.320 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (media precision); el repositorio solo distribuye esta variante |
| Idiomas soportados | `arq` (dariya argelina), incluye arabizi en caracteres latinos |
| Licencia | Apache-2.0 (pesos y codigo) |
| Formato de pesos | safetensors (`model.safetensors`), mas codigo Python propio y tokenizador SentencePiece |

## Arquitectura y entrenamiento

La model card describe DZAIR-FP16 como un codificador de deteccion de tokens reemplazados de 105,3 M de parametros; los pesos almacenados corresponden al discriminador. El repositorio incluye el archivo `modeling_dzair.py` (58.179 bytes) con la arquitectura en codigo, el `config.json` (1.037 bytes) con el resumen de arquitectura y entrenamiento, el tokenizador original en SentencePiece (`tokenizer.model`, 967.834 bytes) y las reglas de normalizacion versionadas en `tokenizer_rules.yaml` (2.058 bytes). No se detallan en esta ficha la composicion exacta del dataset ni el numero de tokens de entrenamiento, que remiten a la model card principal del modelo base `ainouche-abderahmane/DZAIR`.

La innovacion tecnica del repositorio no esta en la arquitectura sino en la conversion de precision: es un *drop-in replacement* del repositorio fp32 a mitad de memoria. La propia model card documenta la verificacion de fidelidad de la conversion (similitud coseno 1,00001, diferencia absoluta maxima 0,0039) y afirma que se supero la puerta de fidelidad de la release. No se especifica si hubo RLHF/DPO, dado que se trata de un codificador discriminativo y no de un modelo generativo.

## Capacidades

- Clasificacion de texto sobre dariya argelina (`arq`) y arabizi: tareas de sentimiento y clasificacion de contenido dialectal.
- Deteccion de tokens reemplazados: objetivo de discriminacion propio del entrenamiento tipo ELECTRA (no confirmado mas alla de la descripcion del repositorio).
- Procesamiento de arabizi: acepta entrada en caracteres latinos, con normalizacion previa obligatoria segun las reglas del tokenizador.
- Extraccion de representaciones: al exponer `AutoModel`, puede devolver embeddings internos para tareas posteriores.
- Clasificacion por secuencia: cabecera de clasificacion (`pipeline_tag: text-classification`).
- No es un modelo generativo: no soporta generacion de texto libre.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a dariya y arabizi; no se documenta soporte de arabe estandar ni de otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Analisis de sentimiento en redes sociales argelinas: el modelo clasifica textos en dariya y arabizi, lo que permite monitorizar la opinion publica en plataformas donde predomina la escritura latina informal, un terreno que los modelos de arabe estandar cubren mal.
- Moderacion de contenido en foros y comunidades: dada su metrica de sentimiento en foros (96,33, media de 10 semillas), puede etiquetar comentarios en comunidades de habla argelina para detectar tono o toxicidad.
- Enriquecimiento de corpus dialectales: al actuar como codificador, permite generar embeddings de textos en dariya para clustering, busqueda semantica o deduplicacion de datasets.
- Preetiquetado para anotacion humana: sirve para preclasificar grandes volumenes de texto dialectal antes de una revision manual, reduciendo el coste de anotacion.
- Despliegue en entornos con poca memoria: su tamano fp16 (210 MB) y su capacidad de ejecucion en CPU permiten integrarlo en servicios ligeros o en el borde (edge) sin GPU dedicada.
- Investigacion en PLN dialectal arabe: sirve como linea base reproducible para comparar tecnicas de normalizacion de arabizi o de adaptacion de dominio sobre dariya.
- Sustitucion directa de la version fp32: para cualquier pipeline ya construido sobre DZAIR, migrar a este repositorio reduce a la mitad el uso de memoria y de almacenamiento sin reentrenamiento ni recalibracion.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son dos metricas de clasificacion heredadas del modelo base, ambas medias de 10 semillas:

| Tarea | Metrica | Valor | Notas |
|---|---|---|---|
| Sentimiento en arabizi | no especificado (accuracy/f1) | 65,52 | media de 10 semillas |
| Sentimiento en foros | no especificado (accuracy/f1) | 96,33 | media de 10 semillas |

Fidelidad de la conversion fp16 frente a fp32:

| Metrica | Valor |
|---|---|
| Similitud coseno | 1,00001 |
| Diferencia absoluta maxima | 0,0039 |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, previsiblemente porque se trata de un codificador discriminativo y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 210 MB para los pesos, mas overhead de activaciones y runtime; el consumo total es muy inferior a 1 GB en la mayoria de configuraciones.
- VRAM estimada en fp32 (version base): aproximadamente 421 MB solo para pesos.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de memoria es suficiente; modelos como RTX 3060, RTX 4090, A100 o H100 sobredimensionan ampliamente la tarea.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo e incluso en iGPU y en CPU.
- Opciones de despliegue: `transformers` (con `trust_remote_code=True` y `torch_dtype=torch.float16`); por su naturaleza de codificador clasificador, no es un candidato tipico para vLLM, llama.cpp u Ollama, y no se distribuye en GGUF.
- Latencia y throughput estimados: no disponible; al ser un modelo de 105 M de parametros, se espera una latencia muy baja por secuencia en GPU y aceptable en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa. Como referencia cualitativa, DZAIR-FP16 pertenece a la categoria de codificadores dialectales arabes de ~100 M de parametros (junto a propuestas como DarijaBERT o MARBERT, entre otras), pero no se han facilitado sus parametros, contexto, licencia o resultados en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|
| DZAIR-FP16 | 105.304.320 | no disponible | Apache-2.0 | sentimiento arabizi 65,52; foros 96,33 |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Cobertura linguistica acotada: solo se declara soporte para dariya argelina (`arq`) y arabizi; no se documenta rendimiento en arabe estandar ni en otros dialectos.
- Requisito de normalizacion: la entrada en caracteres latinos debe pasarse primero a minusculas, segun la model card; omitir este paso puede degradar los resultados.
- Modelo discriminativo, no generativo: no sirve para generacion de texto, resumen ni dialogos; usarlo para ello no es viable.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si existe riesgo de clasificaciones erroneas en textos fuera de dominio, mezclas de codigo o variedades dialectales no vistas.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; al entrenarse sobre texto de redes y foros, puede heredar sesgos de esas fuentes.
- Licencia Apache-2.0 permisiva para uso comercial, pero la model card advierte de una salvedad sobre el texto de entrenamiento y recomienda consultar la composicion de licencias de la model card principal antes de redistribuir derivados.
- Carga con codigo remoto: exige `trust_remote_code=True`, lo que implica ejecutar `modeling_dzair.py` del repositorio; conviene auditar ese codigo en entornos de produccion.
- Adopcion minima: 0 descargas y 0 "likes" en el momento de la consulta, sin comunidad ni soporte comprobables.
- Longitud de contexto no especificada: no puede planificarse el procesamiento de documentos largos sin verificarla en el modelo base.
- Fechas del repositorio: la model card indica creacion y actualizacion en 2026, dato a confirmar segun la fuente.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/ainouche-abderahmane/DZAIR-FP16
- Modelo base DZAIR: https://huggingface.co/ainouche-abderahmane/DZAIR
- Model card principal (tabla completa de resultados, datos de entrenamiento y composicion de licencias): https://huggingface.co/ainouche-abderahmane/DZAIR
