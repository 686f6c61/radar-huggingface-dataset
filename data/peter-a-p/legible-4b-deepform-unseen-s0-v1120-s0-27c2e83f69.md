# Peter-A-P/legible-4b-deepform-unseen-s0-v1120-s0-27c2e83f69

## Resumen

`legible-4b-deepform-unseen-s0-v1120-s0-27c2e83f69` es un adaptador QLoRA publicado por el usuario Peter-A-P sobre el modelo base `google/gemma-4-E4B`. No es un modelo entrenado desde cero: es un ajuste fino de bajo rango (rank 16) que convierte un modelo visión-lenguaje en un extractor de campos para un único tipo de documento, los formularios de compra de publicidad (ad-buy forms) del dataset DeepForm, procedentes de los ficheros públicos de la FCC de emisoras de televisión estadounidenses.

El problema que aborda es el de la extracción de datos estructurados en documentos escaneados con plantillas variables: el adaptador recibe las páginas del documento como imágenes y devuelve un objeto JSON con once campos de cabecera y una lista de líneas de pedido, cada una con cinco subcampos. Forma parte del proyecto "Forms That Read Themselves" (paquete `legible`), que compara modelos frontera de visión, modelos pequeños ajustados y pipelines OCR sobre formularios con respuesta conocida.

Su relevancia es doble. Por un lado, es un ejemplo reproducible de ajuste multimodal sobre un dataset pequeño (200 documentos, 476 páginas) con un coste de inferencia declarado de 0,19 dólares por cada 1.000 páginas en una RTX 3090. Por otro, publica resultados honestos sobre generalización a plantillas no vistas: 59,6 % de campos correctos y solo 3,1 % de documentos con todos los campos correctos, lo que lo sitúa como una línea base realista más que como una solución lista para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje multimodal (base `google/gemma-4-E4B`) con torres de visión y audio, proyector de visión y modelo de lenguaje transformer; el adaptador es un LoRA sobre las proyecciones de atención y MLP del LM y sobre el proyector de visión. Detalle interno de la arquitectura del base: no disponible |
| Parámetros totales | No disponible. El identificador incluye «4b», pero la información proporcionada no confirma el recuento de parámetros |
| Parámetros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | 12.288 tokens (límite de secuencia usado en el entrenamiento). Contexto nativo del modelo base: no disponible |
| Tipos de cuantización | NF4 de 4 bits con doble cuantización y cómputo en bf16 durante el entrenamiento; torres de visión y audio, proyector de visión y capa de salida mantenidos a precisión completa. El adaptador se distribuye en safetensors (pesos LoRA). Otras cuantizaciones del base: no documentadas |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 (según la model card, la licencia del modelo base) |
| Formato de pesos | `safetensors` (adaptador PEFT/QLoRA, 0,2 GB). Requiere cargar el modelo base `google/gemma-4-E4B` en la revisión `411aa17b749aa952df1359d2dcea73917a544d9a` |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `google/gemma-4-E4B`, un modelo multimodal que en la model card aparece con torres de visión y de audio, un proyector de visión y un modelo de lenguaje con proyecciones de atención y MLP. El ajuste es un QLoRA: el base se cuantiza a NF4 de 4 bits con doble cuantización y cómputo en bf16, dejando a precisión completa las torres, el proyector y la capa de salida. El LoRA tiene rango 16, alpha 32 y dropout 0,05, y se aplica a las proyecciones de atención y MLP del modelo de lenguaje y al proyector de visión, nunca a las torres.

El entrenamiento usa una única plantilla conversacional: un turno de usuario con las imágenes de las páginas en orden seguido de la instrucción `legible.prompt` versión 1 (descripción de campos más JSON Schema) y un turno de asistente con el JSON de la verdad de referencia, calculando la pérdida solo sobre los tokens de la respuesta. La plantilla de chat es la de `google/gemma-4-E4B-it` (revisión `ee0ef6023621cff504d758262d4e04895a5af4a2`). Hiperparámetros: tasa de aprendizaje 0,0002, schedule coseno, warmup 0,03, una época, un documento por paso con 8 pasos acumulados, lo que da 25 pasos de optimizador sobre 200 documentos. Cada página se tokeniza a 1.120 tokens visuales y la secuencia se limita a 12.288 tokens. Semilla 0. El conjunto de entrenamiento es `deepform-unseen-s0` (200 documentos, 476 páginas) y el diseño del pipeline rechaza documentos de la partición de evaluación.

Los datos proceden de VRDU Ad-buy Forms (DeepForm) de Google Research: anotaciones bajo CC BY 4.0 y páginas que son registros públicos de los ficheros FCC. No se documenta en la información disponible ningún uso de RLHF o DPO, ni innovaciones de decodificación (se evalúa con temperatura 0 y salida no restringida).

## Capacidades

- Extracción de campos estructurados a JSON a partir de imágenes de páginas de formularios de compra de publicidad: `advertiser`, `agency`, `contract_num`, `flight_from`, `flight_to`, `gross_amount`, `product`, `property`, `tv_address`.
- Extracción de listas anidadas: `line_item[]` con `channel`, `program_desc`, `program_start_date`, `program_end_date` y `sub_amount`.
- Salida en JSON compacto entrenado (`{"advertiser":null}`, sin espacios) y valores siempre como cadena o `null`.
- Comprensión de documento multipágina en orden de página, con hasta 1.120 tokens visuales por página y 12.288 tokens de secuencia.
- Entrada image-text-to-text conversacional mediante la plantilla de chat de Gemma 4 E4B-it.
- Lectura de documentos con plantillas no vistas en entrenamiento (evaluación `unseen`), aunque con degradación de precisión.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, modo thinking ni otras capacidades de agente en la información disponible.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Digitalización de archivos históricos de emisoras: procesar lotes de PDF escaneados de los ficheros públicos de la FCC y obtener un JSON por documento, con un coste estimado de 0,19 dólares por 1.000 páginas en una RTX 3090, lo que hace viable reprocesar fondos completos.
- Enrutamiento y triaje documental: usar los campos `contract_num`, `advertiser` y `flight_from`/`flight_to` como metadatos para clasificar y enlazar pedidos de publicidad antes de pasarlos a un sistema de facturación.
- Preanotación para revisión humana: generar extracciones borrador que un operador valide en una interfaz, aprovechando que el adaptador declara explícitamente `null` y que el 7,6 % de campos se marcan como inventados (medible y auditable).
- Comparación de pipelines en proyectos de document understanding: servir como línea base de modelo pequeño ajustado frente a OCR más LLM o modelos frontera, dado que el proyecto `legible` publica lecturas calificadas con el mismo evaluador para todos los lectores.
- Investigación sobre ajuste multimodal con datos escasos: receta reproducible (QLoRA r16, 25 pasos, 200 documentos) para estudiar cuánto rinde un adaptador pequeño en dominios de formularios con plantillas variables.
- Extracción de series temporales de compra de airtime: agregar los `line_item[]` de muchos pedidos para analizar qué programas, franjas y canales concentran la inversión política en un mercado concreto.
- Validación de esquemas en pipelines de datos: usar el JSON compacto como entrada directa de un validador y detectar documentos que requieran reprocesado, ya que solo el 1,9 % de las respuestas no parsea.
- No recomendado como extractor autónomo sin verificación humana: solo el 3,1 % de los documentos de test quedan completamente correctos.

## Benchmarks y rendimiento

Evaluación sobre los 159 documentos de test de la partición `DeepForm-unk_template-train_200-test_159-valid_100-SD_0` de VRDU, con plantillas nunca vistas en entrenamiento, una sola lectura, nivel 0, temperatura 0 y salida no restringida. La precisión por campo usa los matchers de VRDU con un único evaluador para todos los lectores; los intervalos son bootstrap al 95 % sobre documentos.

| Lector | Campos correctos (IC 95 %) | Todos los campos correctos | Campos inventados | Respuestas no parseables | Coste por 1.000 páginas | Documentos |
|---|---|---|---|---|---|---|
| B, Gemma 4 E4B ajustado (este adaptador) | 59,6 % (53,7–65,3) | 3,1 % (0,6–6,3) | 7,6 % (5,4–10,3) | 1,9 % (0,0–4,4) | US$0,19 (0,17–…; intervalo truncado en la información disponible) | 159 |

El coste se calcula con la RTX 3090 a 0,50 US$/hora en RunPod (2026-10-18) sobre el tiempo de reloj medido; los modelos frontera se costean con la tarifa por lotes de la lista de precios del 2026-10-16. La tabla comparativa completa (lectores A, C y siguientes, y pipelines OCR) no está incluida en la información proporcionada, por lo que no se reproducen sus cifras. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales.

## Requisitos de hardware

- Peso del adaptador: 0,2 GB en safetensors; hay que añadir el modelo base `google/gemma-4-E4B` completo.
- VRAM estimada: no confirmada por el autor. Como referencia, el run se costeó sobre una RTX 3090 de 24 GB, de modo que la inferencia completa (base en NF4 de 4 bits, torres a precisión completa, 1.120 tokens visuales por página y hasta 12.288 tokens de secuencia) cabe en ese perfil. Estimación orientativa: 10–20 GB según número de páginas por documento y longitud de la secuencia.
- GPU recomendadas: RTX 3090 (24 GB) es la configuración validada por el cálculo de coste. A100/H100 no están documentadas para este adaptador, pero permitirían mayor paralelismo y lotes más grandes.
- GPU de consumo: cabe en una RTX 3090/4090 de 24 GB. En tarjetas de 16 GB o menos no está documentado y requeriría reducir el número de tokens visuales o la resolución.
- Despliegue: la ruta natural es `transformers` + `peft`, cargando el adaptador sobre el base cuantizado en NF4. vLLM con soporte de LoRA o TGI son opciones plausibles, pero no están verificadas en la información disponible. `llama.cpp`/Ollama requerirían conversión a GGUF con soporte multimodal, tampoco documentada.
- Latencia y throughput: no publicados directamente. Del coste declarado (0,19 US$/1.000 páginas a 0,50 US$/hora) se deriva un tiempo de aproximadamente 1,4 segundos por página en una RTX 3090, sin incluir el arranque del modelo ni la carga del base.

## Comparativa con modelos similares

La model card sitúa este adaptador frente a modelos frontera de visión y pipelines OCR dentro del proyecto `legible`, pero los resultados de esos otros lectores no están incluidos en la información disponible.

| Modelo / enfoque | Parámetros | Contexto | Precisión por campo en DeepForm unseen | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (QLoRA sobre Gemma 4 E4B) | No disponible (nombre con «4b») | 12.288 tokens de secuencia en entrenamiento | 59,6 % (53,7–65,3) | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| `google/gemma-4-E4B` sin ajuste (zero-shot) | No disponible | No disponible | No disponible en la información proporcionada | Apache 2.0 según la model card | Hugging Face (modelo base) |
| Modelos frontera de visión evaluados en `legible` | No disponible | No disponible | No disponible en la información proporcionada | No disponible | Pasarela comercial citada en la model card |
| Pipeline OCR + LLM | No disponible | No disponible | No disponible en la información proporcionada | No disponible | No disponible |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas concretas del mismo tamaño; las filas distintas de la primera quedan como no disponibles.

## Limitaciones y advertencias

- Precisión limitada: 59,6 % de campos correctos y solo 3,1 % de documentos con todos los campos correctos en plantillas no vistas. No es apto para extracción sin supervisión humana.
- Alucinación de campos: 7,6 % de campos inventados según el evaluador del proyecto. Un valor puede parecer plausible y no existir en el documento.
- Errores de formato: 1,9 % de respuestas no parsean como JSON, lo que obliga a un validador y a una ruta de reprocesado.
- Dominio muy estrecho: únicamente formularios de compra de publicidad de emisoras de televisión de EE. UU. en el formato de DeepForm; no se ha validado en facturas, contratos u otros formularios.
- Idioma: solo inglés. No hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Sesgo de dominio y de fuente: los datos son registros públicos de la FCC con publicidad política estadounidense; pueden aparecer sesgos de muestreo por emisora, época o mercado.
- Volumen de entrenamiento pequeño: 200 documentos y 476 páginas, con 25 pasos de optimizador y una época; riesgo de sobreajuste a las plantillas vistas.
- Contexto y páginas: documentos con muchas páginas o formularios densos pueden superar los 12.288 tokens de secuencia; no se documenta comportamiento más allá de ese límite.
- Licencia: el adaptador se publica como Apache 2.0. Las anotaciones de VRDU son CC BY 4.0 y requieren atribución a Google Research (Wang et al., KDD 2023); las páginas son registros públicos de la FCC. Conviene revisar los términos del modelo base antes de un uso comercial.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el 2026-10-25, sin evidencias de uso en producción. Los registros de pérdida y tiempos están en `run.json`, no incluidos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Peter-A-P/legible-4b-deepform-unseen-s0-v1120-s0-27c2e83f69
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Dataset VRDU (incluye ad-buy-form/DeepForm): https://github.com/google-research-datasets/vrdu
- Nota de publicación de VRDU, «Advances in document understanding» (2023-08-09): https://research.google/blog/advances-in-document-understanding/
- Licencia CC BY 4.0 citada para las anotaciones: https://creativecommons.org/licenses/by/4.0/
- Referencia del benchmark: Wang et al., «VRDU: A Benchmark for Visually-rich Document Understanding», KDD 2023 (sin URL en la información disponible)
- No se han encontrado en la búsqueda web enlaces adicionales relevantes para este modelo; los resultados obtenidos tratan sobre el nombre propio «Peter» y no guardan relación.
