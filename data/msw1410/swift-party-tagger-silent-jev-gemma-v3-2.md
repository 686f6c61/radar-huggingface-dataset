# msw1410/swift-party-tagger-silent-jev-gemma-v3.2

## Resumen

`swift-party-tagger-silent-jev-gemma-v3.2` es un adaptador LoRA sobre el modelo base `google/gemma-4-E4B-it` desarrollado por el usuario msw1410, especializado en una tarea muy concreta de token-classification: separar, palabra por palabra, el nombre de la parte (quién) y la dirección postal (dónde) dentro de un campo de parte de un mensaje de pago SWIFT (etiquetas `50K`, `59`, `50F`, `59F`). No es un modelo generativo, sino un etiquetador discriminativo con atención bidireccional y dos cabezas de clasificación que produce, en una sola pasada forward, etiquetas por palabra con probabilidades calibradas y una decisión de enrutado.

El problema que aborda es real y creciente: los mensajes MT aplanan nombres y direcciones en líneas de 4 × 35 caracteres, mientras que CBPR+ (operativo desde noviembre de 2026) exige direcciones postales estructuradas o híbridas con al menos ciudad y país, y los sistemas de screening funcionan mejor cuando nombre y dirección se verifican por separado. El modelo revierte ese aplanamiento sin asumir ningún orden: el nombre puede ir después de la dirección, las líneas pueden cortarse a mitad de palabra o faltar separadores.

La versión 3.2 mantiene la receta de v3 y añade 11 946 campos sintéticos de entrenamiento centrados en nombres de edificios y parques tras la parte, junto con contraejemplos que deben permanecer como nombre. El autor reporta que el 98,5 % de los campos del nuevo conjunto de test sintético (996 campos) se separan exactamente bien, y que en 103 campos revisados manualmente con layouts reales los fallos bajan de 14 a 8 respecto a v3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4) con atención bidireccional adaptada a token-classification, adaptador LoRA y dos cabezas de clasificación |
| Parametros totales | no disponible (adaptador LoRA; el backbone es `google/gemma-4-E4B-it`, tamaño de parámetros no especificado en la información) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio PEFT/LoRA; tamaño del repo 0,3 GB) |

## Arquitectura y entrenamiento

El modelo es un etiquetador discriminativo construido sobre el backbone Gemma 4 E4B, al que se añade un adaptador LoRA y dos cabezas de clasificación pequeñas. A diferencia del uso generativo habitual del backbone, aquí se emplea atención bidireccional para que cada palabra del campo de parte se etiquete en función de todo el contexto del campo, no solo del prefijo. La salida es por palabra: cada token recibe una etiqueta (`NAME_PERSON`, `NAME_ORG`, `STREET`, `BUILDING`, `UNIT`, `POSTCODE`, `TOWN`, `REGION`, `COUNTRY`, entre otras) junto con probabilidades calibradas y una decisión de enrutado hacia el agente de nombre o el agente geográfico.

El entrenamiento se realizó exclusivamente con datos sintéticos. La versión 3.2 reutiliza la receta de v3 y añade 11 946 campos sintéticos que cubren nombres de edificios y parques situados tras la parte (por ejemplo, `WANG LEI SIIC BUILDING` o `MICHELLE SMITH HUAWEI TECHNOLOGIES PARK`), con contraejemplos que deben mantenerse como nombre (`PARKVIEW BUILDING MATERIALS LLC`, una persona llamada `PARK`), además de los layouts de banco y unidad introducidos en v3.1. Se elimina el layout de v3.1 "persona en una línea después de la dirección" porque ningún campo de entrenamiento puede contener una dirección dentro de un nombre. El enrutado garantiza un único propietario por palabra (nombre o dirección, nunca ambos) y envía a revisión humana los campos con palabras dudosas. No se documentan en la información disponible detalles sobre número total de tokens, composición completa del dataset ni uso de RLHF/DPO.

## Capacidades

- Segmentación palabra por palabra de campos de parte de mensajes SWIFT MT (`50K`, `59`, `50F`, `59F`) en nombre y dirección postal.
- Clasificación de entidades de nombre: personas (`NAME_PERSON`) y organizaciones (`NAME_ORG`, incluida la forma legal y departamentos tras `ATTN`).
- Clasificación de componentes de dirección: calle (`STREET`), número de edificio (`BUILDING`, incluidos rangos como `142/144`), unidad (`UNIT`: piso, suite, habitación), código postal (`POSTCODE`), ciudad (`TOWN`), región (`REGION`) y país (`COUNTRY`).
- Detección de marcadores `C/O` (care of) y asignación de la entidad correspondiente con rol `care_of`.
- Generación de una pista de mapeo a ISO 20022 (`BldgNb`, `StrtNm`, `PstCd`, `TwnNm`, `Ctry`, `Ctry_written`, `CtrySubDvsn`).
- Manejo de layouts sin orden fijo: nombre después de la dirección, líneas cortadas a mitad de palabra, separadores ausentes y códigos de línea pegados (`2/C/O`).
- Enrutado con decisión de revisión humana (`review`) cuando una palabra es ambigua.
- Salida estructurada en JSON con probabilidades por palabra, spans y decisiones de salto de línea.
- Capacidad multilingüe: limitada al inglés según la model card.

## Casos de uso

- Preprocesamiento para screening de sanciones: el modelo separa nombre y dirección de cada campo de parte antes de enviar el nombre al motor de screening y la dirección al motor de screening geográfico, lo que mejora la precisión de las coincidencias al no mezclar ambos dominios.
- Migración a CBPR+: los sistemas que deben emitir direcciones postales estructuradas o híbridas (al menos ciudad y país) pueden usar la salida `iso20022_hint` para poblar `TwnNm`, `Ctry`, `PstCd` y `StrtNm` a partir de mensajes MT heredados.
- Enriquecimiento de datos históricos de pagos: procesamiento por lotes de archivos MT almacenados para reconstruir nombres y direcciones estructurados y alimentar un data warehouse o un sistema de analítica de contrapartes.
- Validación y control de calidad en pasarelas de pago: detección automática de campos mal formados o ambiguos (por ejemplo, dos personas en líneas adyacentes) y envío a revisión humana antes de la liquidación.
- Cumplimiento KYC y onboarding: extracción de la parte ordenante y beneficiaria con roles (`party`, `care_of`) para cotejar contra listas internas de contrapartes y registros mercantiles.
- Automatización de investigaciones AML: generación de registros estructurados por campo que los analistas pueden revisar con trazabilidad de probabilidades y spans, reduciendo el trabajo manual de lectura de mensajes aplanados.
- Integración en pipelines de mensajería financiera: componente determinista de preprocesamiento (parser determinista para localizar la etiqueta + tagger para el contenido) que se puede encadenar antes de motores de screening o de sistemas de conciliación.

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones del propio autor, no benchmarks estándar de la comunidad.

| Metrica | Resultado |
|---|---|
| Precisión en test sintético v3.2 (996 campos) | 98,5 % de campos separados exactamente (nombre / dirección / ruido) |
| Release check | 13 de 13 criterios superados |
| Fallos en 103 campos revisados manualmente (layouts reales) | 8 de 103 en v3.2 frente a 14 de 103 en v3 |
| Fallos sin envío a revisión | 3 en v3.2 frente a 5 en v3 |
| BIC en línea propia pegado al nombre del banco | 0 de 5 en v3.2 frente a 2 de 5 en v3 |
| Palabras de unidad o edificio (`OFFICE`, `TOWER`, `PLAZA`) convertidas en nombre | 0 de 7 en v3.2 frente a 3 de 7 en v3 |
| Forma legal con puntos (`N.A.`) que parte el nombre del banco | 1 de 2 en v3.2 frente a 2 de 2 en v3 |
| Redacción de estate / trust / remittance fragmentada | 2 de 3 en v3.2 frente a 3 de 3 en v3 |
| Dos personas en líneas adyacentes unidas en un nombre | 2 de 3 en v3.2 (ambas enviadas a revisión) frente a 1 de 3 en v3 |
| Nombre de edificio o parque tras la parte, ciudad dentro de un nombre de banco | 0 de 9 en v3.2 y 0 de 9 en v3 |
| Campos de control | 1 de 58 en v3.2 y 1 de 58 en v3 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio del adaptador ocupa 0,3 GB, pero la inferencia requiere cargar el backbone `google/gemma-4-E4B-it` completo, cuyo tamaño de parámetros no se especifica.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el repositorio es un adaptador PEFT (`library_name: peft`), por lo que requiere cargar el modelo base junto con el adaptador mediante la librería `peft` de Hugging Face. No se documentan opciones específicas de vLLM, llama.cpp, Ollama o TGI para esta tarea de token-classification.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `msw1410/swift-party-tagger-silent-jev-gemma-v3.2` | LoRA sobre Gemma 4 E4B, token-classification | no disponible (adaptador 0,3 GB) | no disponible | apache-2.0 | 8 fallos de 103 en campos reales; incluye enrutado a revisión |
| `msw1410/swift-party-tagger-silent-jev-gemma-v3.1` | LoRA sobre Gemma 4 E4B, token-classification | no disponible | no disponible | apache-2.0 | Añade layouts de banco y unidades; sin los 11 946 campos de edificios y parques de v3.2 |
| `msw1410/swift-party-tagger-silent-jev-gemma-v3` | LoRA sobre Gemma 4 E4B, token-classification | no disponible | no disponible | apache-2.0 | Primera versión; 14 fallos de 103 en campos reales |

No se dispone de información sobre modelos alternativos de otros autores comparables en la misma tarea específica de segmentación de campos de parte SWIFT.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos: el rendimiento en producción puede degradarse ante layouts no representados en el dataset, pese a la validación con 103 campos reales.
- No es un sistema de screening de sanciones: es un componente de preprocesamiento para screening de nombres y geográfico; no debe presentarse como solución de cumplimiento completa.
- Idiomas: solo inglés según la model card, lo que limita su uso con nombres y direcciones en otros alfabetos o idiomas.
- Riesgo de errores residuales: la propia evaluación reporta 8 fallos de 103 en campos reales, incluidos casos de dos personas en líneas adyacentes y formas legales con puntos (`N.A.`).
- El enrutado envía palabras dudosas a un lado y el campo a revisión humana; requiere un proceso de revisión operativo para aprovechar esa señal.
- Dependencia del backbone `google/gemma-4-E4B-it`: hay que verificar las condiciones de uso y licencia del modelo base además de la licencia apache-2.0 del adaptador.
- Sin datos publicados sobre sesgos, robustez multilingüe, latencia ni requisitos de hardware; conviene validar en el entorno de despliegue antes de producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación independiente por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/msw1410/swift-party-tagger-silent-jev-gemma-v3.2
- Versión anterior v3.1: https://huggingface.co/msw1410/swift-party-tagger-silent-jev-gemma-v3.1
- Versión original v3: https://huggingface.co/msw1410/swift-party-tagger-silent-jev-gemma
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Paper referenciado en los tags (arXiv:2310.01208): https://arxiv.org/abs/2310.01208
