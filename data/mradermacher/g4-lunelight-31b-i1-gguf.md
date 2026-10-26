# mradermacher/G4-LuneLight-31B-i1-GGUF

## Resumen

Esta ficha describe el repositorio `mradermacher/G4-LuneLight-31B-i1-GGUF`, una recuantización en formato GGUF del modelo `zerofata/G4-LuneLight-31B`. No se trata de un modelo entrenado desde cero, sino de una conversión y cuantización publicada por mradermacher, un autor especializado en distribuir pesos GGUF de terceros (más de 3.400 repositorios y 1,28 millones de descargas acumuladas según el índice GraySoft). El modelo base cuenta con 30.697.345.596 parámetros, es decir, unos 30,7 mil millones.

El interés práctico del repositorio está en que ofrece 24 variantes de cuantización distintas, generadas con pesos ponderados mediante imatrix, lo que permite ejecutar un modelo de ~31B en hardware de consumo. Las cuantizaciones van desde Q6_K hasta IQ1_S, pasando por Q4_K_M o IQ4_XS, de modo que se puede ajustar el equilibrio entre calidad y memoria disponible. La etiqueta declarada es `conversational`, lo que orienta el uso hacia diálogo multi-turno.

La información disponible es muy limitada: no hay model card técnica, no se declaran arquitectura, contexto, idiomas ni licencia, y no se han publicado benchmarks. Cualquier evaluación debe hacerse contra el repositorio base, no contra esta recuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica en la informacion proporcionada; el modelo base es `zerofata/G4-LuneLight-31B`) |
| Parametros totales | 30.697.345.596 (~30,7 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 24 variantes: Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q4_1, Q4_0, small-IQ4_NL, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, IQ3_M, IQ3_S, IQ3_XS, IQ3_XXS, Q2_K, Q2_K_S, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS, IQ1_M, IQ1_S (todas con pesos imatrix) |
| Idiomas soportados | no disponible en la ficha; repositorios hermanos del mismo autor aparecen etiquetados como `English` en los resultados de busqueda |
| Licencia | no disponible en la ficha; la busqueda web indica `apache-2.0` para el repositorio `mradermacher/G4-LuneLight-31B-GGUF` (variante sin imatrix) |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base `zerofata/G4-LuneLight-31B`: la model card de esta recuantizacion no incluye descripcion de la red, numero de tokens de entrenamiento, composicion del dataset ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. El unico dato estructural verificable es el recuento de parametros (30.697.345.596) y el nombre del modelo de origen.

Lo que si documenta el repositorio es el proceso de cuantizacion. Los metadatos internos indican `quantize_version: 2`, `convert_type: hf`, `output_tensor_quantised: 1` y el uso de pesos ponderados mediante imatrix, una tecnica que calcula la importancia de cada tensor a partir de estadisticas de activacion para reducir el error en las capas mas sensibles. Se ofrecen tanto cuantizaciones K-quant clasicas (Q4_K_M, Q5_K_M, Q6_K) como IQ-quant de la familia I-quant (IQ1_S hasta IQ4_XS), que emplean una rejilla de cuantizacion no uniforme para conservar mas calidad con menos bits.

## Capacidades

- Generacion de texto conversacional: la unica capacidad declarada explicitamente en el repositorio es la etiqueta `conversational`, orientada a dialogos multi-turno.
- Idiomas: no se declara cobertura multiligue; los repositorios comparables del mismo autor llevan la etiqueta `English`.
- Razonamiento, codigo, matematicas, vision, audio: no disponible; no hay ninguna declaracion al respecto en la informacion proporcionada.
- Tool calling / function calling: no disponible; no se declara soporte.
- Uso como agente o razonamiento multi-paso: no disponible; no se declara soporte.
- Modo "thinking" o razonamiento extendido: no disponible.
- Compatibilidad de despliegue: el tag `endpoints_compatible` indica que el repositorio puede servirse a traves de los Inference Endpoints de Hugging Face.

## Casos de uso

- Asistente conversacional local en estacion de trabajo: con la variante Q4_K_M (~18,6 GB) el modelo cabe en una GPU de 24 GB y permite mantener conversaciones multi-turno sin envio de datos a terceros, lo que resulta adecuado para entornos con requisitos estrictos de privacidad.
- Despliegue en hardware de consumo con cuantizaciones agresivas: las variantes IQ2_M (~10 GB) o IQ3_M (~14 GB) permiten ejecutar un modelo de ~31B en GPUs de 12-16 GB o en CPU con RAM suficiente, a costa de una perdida de calidad que debe validarse por caso de uso.
- Prototipado y evaluacion comparativa de cuantizaciones: disponer de 24 variantes del mismo modelo facilita medir la degradacion de calidad entre niveles de bits sobre una tarea concreta antes de fijar una configuracion de produccion.
- Generacion de texto por lotes en infraestructura sin GPU: mediante llama.cpp sobre CPU, el modelo puede procesar volumenes de texto fuera de linea (resumenes, reescritura, clasificacion generativa) donde la latencia no es critica.
- Experimentacion academica con modelos derivados: al ser una recuantizacion de un modelo de la familia G4 publicada por un tercero, sirve para estudiar el efecto de la cuantizacion imatrix en modelos de ~31B.
- Base para entornos de roleplay o escritura asistida: si el modelo base hereda el caracter conversacional de la familia, puede emplearse en herramientas tipo SillyTavern o koboldcpp; conviene verificar la calidad real antes de adoptarlo, ya que no hay evaluaciones publicadas.
- Sustitucion de API propietaria en entornos air-gapped: al ser un unico fichero GGUF autocontenido, se puede distribuir en redes aisladas sin dependencias de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de memoria son estimaciones calculadas a partir del numero de parametros y de los bits por peso tipicos de cada cuantizacion; no son mediciones publicadas por el autor. Hay que sumar aparte la cache KV, cuyo tamano depende del contexto configurado y es especialmente relevante en un modelo de ~31B.

| Cuantizacion | Bits por peso aprox. | VRAM estimada para pesos |
|---|---|---|
| Q6_K | ~6,6 | ~25 GB |
| Q5_K_M | ~5,7 | ~22 GB |
| Q4_K_M | ~4,9 | ~19 GB |
| IQ4_XS | ~4,3 | ~16,5 GB |
| Q3_K_M | ~3,9 | ~15 GB |
| IQ3_M | ~3,6 | ~14 GB |
| Q2_K | ~3,0 | ~11,5 GB |
| IQ2_M | ~2,7 | ~10,5 GB |
| IQ1_S | ~1,8 | ~7 GB |

- GPU de 24 GB (RTX 3090, RTX 4090, A10G): Q4_K_M entra completo con contexto moderado; Q5_K_M y Q6_K requieren reducir contexto o descargar parcialmente capas a CPU.
- GPU de 40-48 GB (A100 40GB, L40S): Q6_K sin problemas y Q8 con holgura, si se generase.
- GPU de 80 GB (H100, A100 80GB): permite FP16 del modelo base (~61 GB) y contextos largos con cache KV completa.
- GPU de 12-16 GB (RTX 4070 Ti, RTX 4080): viable con IQ2_M o IQ3_M, asumiendo perdida de calidad.
- Memoria unificada (Apple Silicon de 32, 64 o 128 GB): opcion habitual para Q4_K_M y superiores mediante llama.cpp con backend Metal.
- Solo CPU: Q4_K_M necesita del orden de 20 GB de RAM libre; el rendimiento depende del ancho de banda de memoria y sera bajo en comparacion con GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui y los Inference Endpoints de Hugging Face (tag `endpoints_compatible`). vLLM soporta GGUF de forma limitada y no es la via recomendada para este formato.
- Latencia y throughput: no disponible. No se han publicado mediciones para este repositorio y no deben extrapolarse cifras sin medirlas en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| G4-LuneLight-31B-i1-GGUF (este repositorio) | ~30,7 B | no disponible | no disponible en la ficha | GGUF, 24 cuantizaciones imatrix | 0 descargas, 0 likes; repo de 143 GB |
| G4-LuneLight-31B-GGUF (mismo autor, sin imatrix) | ~30,7 B | no disponible | apache-2.0 segun la busqueda web | GGUF | Mismo modelo base, cuantizaciones sin ponderacion imatrix |
| Lucent-Witch-31B-i1-GGUF (mradermacher) | ~31 B | no disponible | apache-2.0 segun la busqueda web | GGUF imatrix | Orientado a roleplay y storytelling segun sus tags |
| G4 Alice V1.2 31B i1 GGUF (mradermacher) | ~31 B (por nombre) | no disponible | no disponible | GGUF imatrix | Otro derivado de la familia G4; sin datos tecnicos publicados |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa entre estas alternativas.

## Limitaciones y advertencias

- No es un modelo original: es una recuantizacion de `zerofata/G4-LuneLight-31B` y hereda integramente sus sesgos, limitaciones y comportamiento.
- Ausencia total de model card tecnica: sin arquitectura, contexto, datos de entrenamiento ni idiomas declarados. Adoptarlo en produccion exige auditar primero el repositorio base.
- Licencia no declarada en esta ficha. Aunque la busqueda web apunta a `apache-2.0` para la variante GGUF sin imatrix del mismo autor, conviene verificar la licencia del modelo original `zerofata/G4-LuneLight-31B` antes de cualquier uso comercial.
- Las cuantizaciones IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS e IQ2_S degradan de forma notable la coherencia y aumentan el riesgo de generacion repetitiva o incoherente; no deberian usarse como configuracion por defecto en produccion.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad factual, y el modelo no declara entrenamiento especifico para reducirla.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia de terceros sobre su comportamiento real.
- Idiomas: al no declararse cobertura multilingue, el rendimiento fuera del ingles es incierto; hay que evaluarlo empiricamente.
- Contenido sin filtros declarados: al ser un modelo conversacional sin salvaguardas documentadas, un despliegue publico requiere moderacion externa.
- El repositorio ocupa 143 GB en total: no es necesario descargarlo entero, basta con el fichero de la cuantizacion elegida.
- Anomalia en metadatos: la fecha de creacion registrada es 2026-10-26, posterior a la fecha habitual de consulta, lo que sugiere un posible error de sellado temporal en el repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/G4-LuneLight-31B-i1-GGUF
- Modelo base: https://huggingface.co/zerofata/G4-LuneLight-31B
- Variante GGUF sin imatrix del mismo autor: https://huggingface.co/mradermacher/G4-LuneLight-31B-GGUF
- Modelo comparable (Lucent-Witch-31B-i1-GGUF): https://huggingface.co/mradermacher/Lucent-Witch-31B-i1-GGUF
- Indice de modelos GGUF de mradermacher en GraySoft: https://graysoft.dev/authors/m/mradermacher.html
- Ficha de G4 Alice V1.2 31B i1 GGUF en free2aitools: https://free2aitools.com/model/mradermacher/g4-alice-v1.2-31b-i1-gguf
- Paper o blog tecnico del modelo: no disponible
- Demo o espacio interactivo: no disponible
