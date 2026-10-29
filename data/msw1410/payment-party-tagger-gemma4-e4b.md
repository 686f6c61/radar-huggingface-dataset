# msw1410/payment-party-tagger-gemma4-e4b

## Resumen

`payment-party-tagger-gemma4-e4b` es un adaptador LoRA publicado por el usuario msw1410 sobre el modelo `google/gemma-4-E4B-it`, especializado en una tarea muy concreta: separar, palabra por palabra, la parte de "quién" (nombre de la persona u organización, identificadores, detalles de contacto) y la parte de "dónde" (dirección postal estructurada) en un campo de parte de un mensaje de pago SWIFT MT (`50K`, `59`, `50F`, `59F`). No es un modelo generativo: es un etiquetador discriminativo (pipeline `token-classification`) que en una sola pasada hacia delante asigna a cada token una probabilidad calibrada por etiqueta y, además, estima en cada salto de línea la probabilidad de que una palabra continúe en la línea siguiente.

El problema que resuelve es el aplanado histórico de nombres y direcciones en líneas de texto libre de 4 × 35 caracteres en los mensajes MT. Con la migración a CBPR+ (prevista para noviembre de 2026), los mensajes de pago requieren direcciones postales estructuradas o híbridas (como mínimo localidad y país), y el screening funciona mejor cuando nombres y direcciones se comprueban por separado. El modelo revierte ese aplanado sin asumir ningún orden: el nombre puede ir después de la dirección, las líneas pueden cortar una palabra por la mitad o faltar separadores.

La relevancia práctica está en que se declara entrenado únicamente con datos sintéticos y se presenta explícitamente como un componente de preprocesado para name screening y geographic screening, no como un sistema de screening de sanciones. El repositorio ocupa 0,3 GB (solo el adaptador y artefactos asociados), la licencia declarada es Apache 2.0 y el único idioma soportado es inglés. Los parámetros totales, la longitud de contexto y los datos de entrenamiento del backbone no se detallan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone transformer tipo Gemma 4 con atención bidireccional adaptada, adaptador LoRA y dos cabezas de clasificación (etiquetado por token y probabilidad de continuación de palabra en salto de línea) |
| Parametros totales | No disponible (el repositorio solo contiene el adaptador LoRA, 0,3 GB) |
| Parametros activos | No disponible (no se indica que el backbone sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; no se documenta cuantización del backbone) |
| Idiomas soportados | `en` |
| Licencia | Apache 2.0 (licencia declarada del adaptador; el uso del modelo base queda sujeto a su propia licencia) |
| Formato de pesos | `safetensors` (PEFT/LoRA) |
| Modelo base | `google/gemma-4-E4B-it` (relación: adapter) |
| Tarea (pipeline) | `token-classification` |
| Librería | `peft` |
| Numero de etiquetas | 15 (NAME_PERSON, NAME_ORG, STREET, BUILDING, UNIT, POSTCODE, TOWN, REGION, COUNTRY, PO_BOX, ACCOUNT, LINE_PREFIX, NOISE, PARTY_INTRO, PARTY_ID) |
| Salida | JSON con `name_agent`, `geo_agent` (`iso20022_hint`, `care_of`), `ignored` y flag `review`, más probabilidades por palabra y spans |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-10-21 / 2026-10-29 |

## Arquitectura y entrenamiento

El modelo es un etiquetador discriminativo construido sobre un backbone Gemma 4 al que se le ha dotado de atención bidireccional, con un adaptador LoRA y dos cabezas de clasificación pequeñas. La primera cabeza produce, para cada token, una distribución de probabilidad sobre las 15 etiquetas; la segunda estima, en cada salto de línea, la probabilidad de que la palabra continúe en la línea siguiente, lo que permite reconstruir palabras partidas por el formato de 35 caracteres. Las probabilidades se declaran calibradas por temperatura sobre datos de validación reservados. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset, más allá de la afirmación de que es **exclusivamente sintético**.

La innovación destacable no está en el backbone sino en la capa de decisión posterior al modelo. El enrutado de cada palabra sigue cuatro pasos: (1) una pasada del modelo; (2) filtro de ruido, donde una palabra solo se descarta si P(noise) > 0,95 y además no contiene letras ni dígitos, es un placeholder (NOTPROVIDED, N/A, NONE, TBC) o es estructura reconocida por reglas (línea de cuenta, IBAN con checksum mod-97 válido, códigos de línea `1/`–`8/`), de modo que cualquier otra palabra llega a un agente aunque el modelo la marque como ruido (flag `kept_by_guard`); (3) separación nombre/dirección con umbrales obtenidos como cuantiles conformales condicionales por clase (P(name|content) ≥ 0,984 y P(address|content) ≥ 0,981, con política de 0,5 % de tasa de fallo permitida por clase), enviando la palabra a ambos agentes cuando ninguno o ambos umbrales se superan (flag `ambiguous`); (4) reglas para marcadores como C/O, ATTN, OBO, FFC y T/A, en las que la parte posterior a `C/O` se envía a ambos agentes con flag `care_of`.

## Capacidades

- Etiquetado por token de campos de parte de pagos con 15 etiquetas agrupadas en tres bloques: "quién" (`NAME_PERSON`, `NAME_ORG`, `PARTY_INTRO`, `PARTY_ID`), "dónde" (`STREET`, `BUILDING`, `UNIT`, `POSTCODE`, `TOWN`, `REGION`, `COUNTRY`, `PO_BOX`) e "ignorado" (`ACCOUNT`, `LINE_PREFIX`, `NOISE`).
- Separación de nombre y dirección sin asumir orden: soporta nombres después de la dirección, líneas cortadas a mitad de palabra y separadores ausentes.
- Reconstrucción de palabras partidas entre líneas mediante la cabeza de continuación de línea.
- Reconocimiento de formas jurídicas dentro del nombre de la organización (por ejemplo `LTD`, `OOO`).
- Gestión de marcadores de parte y contacto: `C/O`, `ATTN`, `OBO`, `FFC`, `T/A`, `BENEFICIARY`, con envío del bloque posterior a `C/O` a ambos agentes.
- Extracción de identificadores y detalles de contacto de la parte (TEL, VAT, BIC, fecha de nacimiento, pasaporte, referencias) bajo la etiqueta `PARTY_ID`.
- Detección y descarte de líneas de cuenta e IBAN (con validación de checksum mod-97) y de códigos de línea `1/`–`8/` propios de `50F`/`59F`, incluidos casos pegados al texto como `2/C/O`.
- Sugerencia de campos ISO 20022 en `iso20022_hint`: `BldgNb`, `StrtNm`, `PstCd`, `TwnNm`, `Ctry` y `Ctry_written`.
- Salida con probabilidades por palabra, spans y decisiones de salto de línea, más flags `ambiguous`, `kept_by_guard`, `care_of` y `review` para enrutado a revisión.
- Capacidades que **no** tiene: generación de texto, razonamiento multi-step, tool calling, agentes, visión, audio y multilingüismo (solo inglés).

| Etiqueta | Grupo | Campo ISO 20022 | Significado |
|---|---|---|---|
| `NAME_PERSON` | quién | Nm | Nombre de persona |
| `NAME_ORG` | quién | Nm | Nombre de organización, forma jurídica incluida (también departamento tras ATTN) |
| `STREET` | dónde | StrtNm | Nombre de calle |
| `BUILDING` | dónde | BldgNb | Número de edificio, también rangos como 142/144 |
| `UNIT` | dónde | Room | Piso, suite, planta, habitación |
| `POSTCODE` | dónde | PstCd | Código postal |
| `TOWN` | dónde | TwnNm | Localidad o ciudad |
| `REGION` | dónde | CtrySubDvsn | Estado, provincia, región |
| `COUNTRY` | dónde | Ctry | País en texto o código |
| `PO_BOX` | dónde | PstBx | Apartado de correos |
| `ACCOUNT` | ignorado | – | Línea de cuenta (IBAN, número doméstico, //FW...) |
| `LINE_PREFIX` | ignorado | – | Códigos de línea `1/`, `2/`, `3/`... |
| `NOISE` | ignorado | – | Basura y placeholders (%@#$, ===, NOTPROVIDED, N/A) |
| `PARTY_INTRO` | quién | – | Palabra que introduce parte o contacto: C/O, ATTN, OBO, FFC, T/A, BENEFICIARY |
| `PARTY_ID` | quién | Id / CtctDtls | Identificador o contacto: TEL, VAT, BIC, fecha de nacimiento, pasaporte, referencia |

## Casos de uso

- Preprocesado previo al screening de nombres: el tagger se coloca delante de un motor de listas de sanciones para entregarle únicamente el bloque `name_agent` ya limpio, evitando que fragmentos de dirección contaminen la comparación difusa de nombres. Es adecuado porque separa nombre y dirección con umbrales calibrados y deja constancia de los casos ambiguos.
- Migración de tráfico MT a CBPR+/ISO 20022: a partir de un campo `50K` o `59` aplanado, el modelo genera `iso20022_hint` con `BldgNb`, `StrtNm`, `PstCd`, `TwnNm` y `Ctry`, que puede usarse como borrador para construir la dirección estructurada o híbrida exigida. Encaja porque trabaja con el texto tal cual llega, sin exigir un orden concreto.
- Screening geográfico independiente del screening de nombres: el bloque `geo_agent.text` permite aplicar listas de países, regiones o ciudades restringidas por separado, lo que reduce falsos positivos en comparación con analizar la línea completa como una sola cadena.
- Normalización de estructuras `care_of`: en pagos en los que el beneficiario real se factura a través de un intermediario, el marcador `C/O` y el bloque posterior se envían a ambos agentes con flag `care_of`, de modo que el sistema puede decidir si screeniza la entidad instrumental, la beneficiaria final o ambas.
- Limpieza previa de campos con ruido y códigos de línea: los campos `50F`/`59F` llegan con prefijos `1/`, `2/`, `3/` pegados al texto y con placeholders como `NOTPROVIDED`; el modelo los marca como `LINE_PREFIX`/`NOISE` y los separa en el array `ignored`, con validación adicional de IBAN mediante mod-97 para no descartar por error una cuenta real.
- Enrutado selectivo a revisión manual en un pipeline de compliance: los flags `ambiguous`, `kept_by_guard` y `review` permiten construir una cola de trabajo donde solo se revisan los campos con baja confianza o con decisiones contradictorias entre modelo y reglas, en lugar de revisar todo el lote.
- Enriquecimiento de KYC y conciliación de pagos: la etiqueta `PARTY_ID` extrae BIC, VAT, teléfonos, fechas de nacimiento y pasaportes embebidos en el campo de parte, útiles para cruzar contra el maestro de contrapartes sin volver a parsear el mensaje original.
- Procesamiento por lotes de ficheros de tráfico: al ser un etiquetador de una sola pasada y sin generación autoregresiva, puede ejecutarse sobre lotes grandes de mensajes en transformadores/PEFT con un coste por mensaje bajo y determinista en la estructura de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas de F1/precisión/recall sobre conjuntos de test de pagos. Los únicos valores numéricos publicados son parámetros operativos internos, no resultados comparativos:

| Parametro operativo | Valor declarado |
|---|---|
| Umbral P(name | content) | ≥ 0,984 |
| Umbral P(address | content) | ≥ 0,981 |
| Umbral de descarte por ruido | P(noise) > 0,95, con guardas adicionales |
| Origen de los umbrales | Cuantiles conformales condicionales por clase sobre datos de calibración |
| Tasa de fallo permitida por clase | 0,5 % |
| Calibración de temperatura | Sí, sobre datos de validación reservados |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio solo contiene el adaptador LoRA (0,3 GB en safetensors); la VRAM real vendrá determinada por el backbone `google/gemma-4-E4B-it` que se cargue junto al adaptador.
- Estimación orientativa y no confirmada: la nomenclatura "E4B" del modelo base sugiere una familia de aproximadamente 4.000 millones de parámetros efectivos, lo que en bf16 situaría la inferencia en el entorno de 9-10 GB de VRAM incluyendo overhead de activaciones y tokenizador; en cuantización de 8 bits bajaría a unos 5-6 GB y en 4 bits a unos 3-4 GB. Estas cifras son una extrapolación por tamaño, no un dato publicado por el autor.
- GPU recomendadas: no disponible como dato del autor. Por tamaño del backbone, una RTX 4090 (24 GB) o una L4 (24 GB) serían suficientes en bf16; A100/H100 solo tendrían sentido para servir muchas réplicas en paralelo o lotes muy grandes.
- ¿Cabe en GPU de consumo? Muy probablemente sí en tarjetas de 8-16 GB con cuantización, y en 24 GB en bf16, siempre que se confirme el tamaño real del backbone. Dato no verificado.
- Opciones de despliegue: al ser un adaptador PEFT de `token-classification`, el camino natural es `transformers` + `peft` (carga del backbone y `PeftModel.from_pretrained`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; estas herramientas están orientadas a generación y no cubren directamente una cabeza de clasificación de tokens personalizada. Para serving HTTP habría que envolver el pipeline en un servicio propio (por ejemplo FastAPI).
- Latencia y throughput: no disponibles. Al no haber decodificación autoregresiva, la latencia por campo debería ser la de una única pasada del backbone sobre una secuencia corta (un campo de parte son pocas decenas de tokens), pero no se publican mediciones.

## Comparativa con modelos similares

No se han encontrado en la información disponible modelos directamente comparables (mismo backbone, misma tarea y mismo esquema de etiquetas). La comparación siguiente es cualitativa y con datos no disponibles en varias celdas:

| Modelo / enfoque | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `msw1410/payment-party-tagger-gemma4-e4b` | No disponible (adaptador LoRA de 0,3 GB) | No disponible | Etiquetado de partes de pago MT con hints ISO 20022 | Apache 2.0 (adaptador) | HuggingFace, 0 descargas |
| Backbone `google/gemma-4-E4B-it` sin adaptar (uso generativo con prompt) | No disponible | No disponible | Extracción mediante generación e instrucciones | Sujeta a la licencia del modelo base | HuggingFace |
| NER genérico preentrenado (familia spaCy/Stanza) | No disponible | No disponible | NER de propósito general (PER, ORG, LOC) | Varía por modelo (MIT, Apache 2.0, etc.) | Amplia |
| Parser determinista de MT / reglas ISO 20022 | No aplica | No aplica | Parseo posicional por líneas y códigos de línea | No aplica | Interno |

Diferencias cualitativas: frente a un NER genérico, este adaptador aporta etiquetas específicas de dominio (`PO_BOX`, `BUILDING`, `UNIT`, `LINE_PREFIX`, `PARTY_ID`) y salida alineada con campos ISO 20022. Frente a un parser determinista, tolera orden libre, palabras partidas y separadores ausentes, a cambio de depender de umbrales probabilísticos y de una capa de reglas. Frente al backbone sin adaptar usado de forma generativa, evita la generación autoregresiva y devuelve probabilidades calibradas por palabra, lo que facilita el enrutado a revisión.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos: el comportamiento sobre distribuciones reales de tráfico (variantes ortográficas raras, transliteraciones, formatos de dirección no occidentales, jerga bancaria) no está validado en la información disponible.
- Solo inglés (`language: en`): no hay soporte declarado para nombres o direcciones en otros alfabetos o idiomas, algo habitual en pagos internacionales.
- No es un sistema de screening de sanciones: la propia model card lo posiciona como componente de preprocesado para name screening y geographic screening. Usarlo como filtro de cumplimiento normativo sería un error de diseño.
- Riesgo de error en la frontera nombre/dirección: los umbrales son altos (0,984 y 0,981) y los casos dudosos se envían a ambos agentes con flag `ambiguous`, lo que traslada el problema al sistema consumidor, que debe gestionar duplicados.
- Dependencia de una capa de reglas externa: el reconocimiento de `C/O`, `ATTN`, `OBO`, `FFC`, `T/A`, códigos de línea e IBAN con mod-97 no es puramente neuronal; cambios en el formato de entrada pueden degradar el resultado.
- Ambigüedad estructural en `care_of`: enviar el bloque posterior a `C/O` a ambos agentes puede duplicar entidades en el screening y generar falsos positivos si el consumidor no deduplica.
- Fechas y normativa: la referencia a CBPR+ de noviembre de 2026 y a la obligatoriedad de dirección estructurada o híbrida es contexto del autor; conviene verificar el calendario y los requisitos vigentes en el momento de implantación.
- Licencia: el adaptador se declara Apache 2.0, pero el uso comercial requiere cargar el modelo base `google/gemma-4-E4B-it`, cuyos términos no se detallan en la información disponible y deben revisarse por separado.
- Madurez: 0 descargas y 0 likes, creado y actualizado en octubre de 2026, sin benchmarks ni validación externa publicada. No hay evidencia de uso en producción.
- Ausencia de datos operativos: sin cifras de latencia, throughput, consumo de VRAM ni tasas de error sobre datos reales, la evaluación para producción exige una prueba propia con un conjunto anotado del tráfico concreto del adoptante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/msw1410/payment-party-tagger-gemma4-e4b
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Referencia arXiv declarada en los tags del repositorio (contenido no verificado): https://arxiv.org/abs/2310.01208
- Artefacto citado en la model card: `example_output.json`, dentro del propio repositorio de HuggingFace
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados devueltos por la búsqueda no guardan ninguna relación con este modelo ni con etiquetado de pagos, por lo que se descartan.
