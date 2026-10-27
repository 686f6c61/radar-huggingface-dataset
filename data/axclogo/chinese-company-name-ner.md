# AxcLogo/chinese-company-name-ner

## Resumen

`AxcLogo/chinese-company-name-ner` es un modelo compacto de reconocimiento de entidades nombradas (NER) especializado en extraer nombres de empresas y posibles alias empresariales de texto en chino. Lo desarrolla el usuario AxcLogo y se publica bajo licencia Apache 2.0. El problema que resuelve es concreto: identificar candidatos a entidad organizativa en textos de negocio (ofertas de empleo, reclamaciones, noticias, CRM) sin necesidad de una infraestructura de GPU.

Técnicamente es un clasificador de tokens BERT a nivel de carácter, exportado a ONNX y cuantizado dinámicamente a INT8. El artefacto publicado ocupa 24 MiB y la inferencia se ejecuta con el proveedor CPU de ONNX Runtime, sin requerir PyTorch ni Transformers. El repositorio incluye la lógica de ventana solapada para documentos largos, decodificación BIO restringida y normalización de offsets.

Es relevante para equipos que necesitan un componente de extracción de entidades ligero, desplegable en CPU y con bajo coste operativo, integrable en pipelines de procesamiento de texto en producción. No es un modelo generativo ni un LLM: es un extractor discriminativo de spans con dos etiquetas (`COMPANY` y `SUSPECTED_COMPANY`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Clasificador de tokens BERT a nivel de carácter, exportado a ONNX |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible (procesa documentos largos mediante ventanas solapadas) |
| Tipos de cuantización | cuantización dinámica INT8 |
| Idiomas soportados | chino (`zh`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`) |
| Tamaño del artefacto | 24 MiB (INT8) |
| Etiquetas | `COMPANY`, `SUSPECTED_COMPANY` |
| Dependencias de inferencia | ONNX Runtime (proveedor CPU), tokenizer.json |
| Tokenizador | BERT orientado a caracteres chinos |

## Arquitectura y entrenamiento

El modelo es un transformer encoder tipo BERT que opera a nivel de carácter, con una cabeza de clasificación de tokens sobre esquema BIO. Se ha exportado a ONNX y cuantizado dinámicamente a INT8 para reducir el tamaño y acelerar la inferencia en CPU. La decodificación aplica restricciones BIO y normalización de offsets; los documentos largos se procesan en ventanas solapadas para preservar el contexto entre fragmentos y devolver offsets sobre la cadena original con convención `[start, end)`.

Los datos de entrenamiento proceden de texto de negocio en chino con nombres formales de empresa, marcas, comercios, abreviaturas, negativos difíciles y casos de frontera por espacios en blanco. El etiquetado se generó mediante anotación automática seguida de revisión humana. El conjunto de datos no se distribuye con el repositorio e incluye datos de dominio no públicos, por lo que los pesos publicados no son completamente reproducibles a partir de datos públicos. No se documenta el número de tokens de entrenamiento ni si hubo RLHF/DPO; tampoco se asocia un paper a esta release.

## Capacidades

- Extracción de nombres formales de empresa en texto chino con la etiqueta `COMPANY`.
- Detección de candidatos a marca, nombre de tienda, abreviatura o alias dependiente de contexto con la etiqueta `SUSPECTED_COMPANY`, orientada a recall.
- Procesamiento de documentos largos mediante ventanas solapadas, con offsets referidos al texto original.
- Inferencia en CPU con ONNX Runtime, sin necesidad de PyTorch ni Transformers.
- API de Python y de línea de comandos incluida en `inference.py`.
- Decodificación BIO restringida y normalización de spans.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe no establecida: el modelo está pensado para chino y su rendimiento en otros idiomas no se ha evaluado.

## Casos de uso

- Extracción de empresas en ofertas de empleo: el modelo identifica el nombre de la empresa contratante en anuncios de reclutamiento, lo que permite enriquecer y clasificar vacantes de forma automática.
- Gestión de reclamaciones y atención al cliente: detecta la empresa o marca mencionada en texto libre para enrutar el caso al equipo o sistema correcto.
- Análisis de noticias de negocio: extrae entidades organizativas de titulares y cuerpos de noticia para construir índices de menciones y relaciones.
- Enriquecimiento de CRM y leads: a partir de correos, formularios o notas, localiza nombres de empresa candidatos y los propone para su validación y alta en el CRM.
- Deduplicación y normalización de bases de datos empresariales: identifica menciones de la misma organización en registros heterogéneos para agrupar o comparar entradas.
- Preprocesamiento en pipelines de compliance o KYC: genera candidatos de entidad que después se validan contra registros oficiales, sin usar las predicciones como prueba legal.
- Monitorización de menciones de marca: rastrea foros, reseñas y redes sociales para localizar marcas y alias empresariales y alimentar paneles de escucha social.
- Indexación y búsqueda en corpus empresariales: anota documentos con spans de empresa para habilitar filtros y búsquedas facetadas.

## Benchmarks y rendimiento

Métricas de span y etiqueta exactas (micro), sobre el artefacto INT8 de 24 MiB:

| Conjunto de evaluación | Precisión | Recall | F1 | Documentos/s en CPU Apple M4 |
|---|---:|---:|---:|---:|
| Conjunto de desarrollo con consenso revisado | 0,8696 | 0,7608 | 0,8115 | 42,1 |
| Conjunto de prueba comparativo de ingeniería | 0,7383 | 0,7039 | 0,7207 | 43,1 |

Resultados por etiqueta en el conjunto comparativo de ingeniería (300 documentos):

| Etiqueta | Precisión | Recall | F1 |
|---|---:|---:|---:|
| `COMPANY` | 0,7950 | 0,8435 | 0,8185 |
| `SUSPECTED_COMPANY` | 0,7244 | 0,6738 | 0,6982 |

El autor advierte que estos conjuntos se usaron durante el desarrollo o la revisión y no son benchmarks ciegos no contaminados; las cifras describen comportamiento de ingeniería, no un estado del arte. El rendimiento depende de la longitud del texto y del hardware.

## Requisitos de hardware

- Inferencia exclusivamente en CPU mediante el proveedor CPU de ONNX Runtime; no requiere GPU.
- Huella del modelo: artefacto INT8 de 24 MiB más el tokenizador; el consumo de memoria lo domina el runtime de ONNX Runtime.
- Throughput medido: 42,1 documentos/s en el conjunto de desarrollo y 43,1 documentos/s en el conjunto comparativo sobre CPU Apple M4, equivalente a unos 23,8 ms y 23,2 ms por documento respectivamente.
- Cabe en cualquier CPU de consumo actual y en entornos con recursos limitados; no se especifican requisitos mínimos de RAM.
- Despliegue mediante ONNX Runtime en Python, C++, C#, Java u otros bindings disponibles; `inference.py` ofrece API de Python y CLI.
- No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- La latencia y el throughput reales dependen de la longitud del texto, del número de ventanas solapadas y de la CPU utilizada.

## Comparativa con modelos similares

No se han publicado comparaciones directas con alternativas en la información disponible. La siguiente tabla recoge el modelo y categorías de alternativas, marcando como "no disponible" los datos no documentados:

| Modelo | Enfoque | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| AxcLogo/chinese-company-name-ner | NER de empresa en chino, BERT carácter + ONNX INT8 | no disponible | no disponible | Apache 2.0 | ONNX |
| BERT chino fine-tuneado para NER | Transformer encoder + cabeza NER | no disponible | no disponible | variable | PyTorch/safetensors |
| Modelos NER multilingües tipo XLM-R | Transformer encoder multilingüe | no disponible | no disponible | variable | PyTorch/safetensors |

La diferencia cualitativa principal frente a alternativas genéricas es la especialización en nombres de empresa en chino, el sesgo hacia recall de `SUSPECTED_COMPANY` y un despliegue en CPU sin dependencias de PyTorch. No hay datos públicos que permitan afirmar superioridad frente a otros modelos NER en chino.

## Limitaciones y advertencias

- Nombres cortos ambiguos, marcas y palabras comunes pueden generar falsos positivos.
- Nombres no vistos, formas Unicode inusuales y alias informales pueden no detectarse.
- `SUSPECTED_COMPANY` es una etiqueta de candidato, no una prueba de que exista una entidad legal.
- El modelo está pensado para chino; su rendimiento en otros idiomas no se ha establecido.
- No se debe usar las predicciones por sí solas para decisiones legales, de compliance, de identidad o de alto impacto.
- El modelo no carga ni incluye un registro de empresas en tiempo de inferencia.
- Los conjuntos de evaluación no son benchmarks ciegos no contaminados, por lo que las métricas pueden estar optimistas.
- Los datos de entrenamiento no son públicos y los pesos no son completamente reproducibles.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe asumir la validación y el cumplimiento normativo derivados de sus propias decisiones.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/AxcLogo/chinese-company-name-ner)
