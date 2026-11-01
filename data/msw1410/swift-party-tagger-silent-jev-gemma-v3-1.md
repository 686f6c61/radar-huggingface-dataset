# msw1410/swift-party-tagger-silent-jev-gemma-v3.1

## Resumen

swift-party-tagger-silent-jev-gemma-v3.1 es un adaptador LoRA sobre el modelo google/gemma-4-E4B-it, desarrollado por el usuario msw1410 y publicado en HuggingFace. No es un modelo generativo: es un etiquetador discriminativo (token-classification) que divide el contenido de un campo de parte de un mensaje de pago SWIFT (MT 50K, 59, 50F, 59F) en dos componentes: el nombre de la parte (quien) y su direccion postal (donde), palabra por palabra y en una sola pasada forward.

El modelo resuelve un problema concreto de la infraestructura de pagos internacionales: los mensajes MT aplanan nombres y direcciones estructuradas en lineas de texto libre de 4 x 35 caracteres. Con la entrada en vigor de CBPR+ (prevista para noviembre de 2026), los mensajes necesitaran direcciones postales estructuradas o hibridas (al menos ciudad y pais), y el screening de sanciones funciona mejor cuando nombres y direcciones se verifican por separado. Este tagger invierte el aplanamiento sin asumir ningun orden: el nombre puede aparecer despues de la direccion, las lineas pueden cortarse a mitad de palabra y los separadores pueden faltar.

El modelo se entreno exclusivamente con datos sinteticos y se distribuye como un componente de preprocesamiento para name screening y geographic screening, no como un sistema de screening de sanciones completo. La version v3.1 anade 12.000 campos sinteticos con disposiciones observadas en pagos reales que el generador de v3 no producia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 4) con atencion bidireccional, adaptador LoRA y dos cabezas de clasificacion |
| Parametros totales | no disponible (adaptador LoRA sobre google/gemma-4-E4B-it) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un tagger discriminativo construido sobre el backbone de Gemma 4 con atencion bidireccional, al que se anade un adaptador LoRA y dos cabezas de clasificacion pequenas: una para el agente de nombre (name_agent) y otra para el agente geografico (geo_agent). No genera texto; produce etiquetas por palabra con probabilidades calibradas y una decision de enrutamiento para cada palabra. El repositorio ocupa 0,3 GB, coherente con un adaptador LoRA mas las cabezas.

El entrenamiento se realizo exclusivamente con datos sinteticos. La version v3.1 mantiene la receta de v3 y anade 12.000 campos sinteticos adicionales con disposiciones vistas en pagos reales que el generador de v3 nunca producia: nombre de persona en la ultima linea tras la direccion, campos bancarios con el BIC en linea propia, codigos //FW / //SC y N.A., nombres de unidad y edificio (OFFICE 1204, CHAMPION TOWER, 17/F ... BUILDING) y numeros de cuenta sin barra. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO.

La validacion se realizo sobre 56 campos revisados manualmente con disposiciones de pagos reales (29 que v3 fallaba y 27 de control, ninguno usado en entrenamiento). v3.1 corrige por completo cuatro de los cinco tipos de error medidos: nombre de persona tras la direccion (de 4 fallos a 0), BIC en linea propia pegado al nombre del banco (de 5 a 0), palabras de unidad o edificio convertidas en nombres (de 7 a 0) y forma juridica con puntos que partia el nombre del banco (de 2 a 1). Los campos de control se mantienen en 0 fallos de 27. En el conjunto escrito a mano, v3.1 acierta 29 de 30 campos (v3: 30).

## Capacidades

- Segmentacion palabra por palabra de un campo de parte de pago SWIFT en nombre y direccion postal, en una sola pasada forward.
- Clasificacion con 11 etiquetas: NAME_PERSON, NAME_ORG, STREET, BUILDING, UNIT, POSTCODE, TOWN, REGION, COUNTRY, PO_BOX y ACCOUNT.
- Mapeo directo de las etiquetas geograficas a campos ISO 20022: Nm, StrtNm, BldgNb, Room, PstCd, TwnNm, CtrySubDvsn, Ctry y PstBx.
- Deteccion y extraccion de marcadores C/O (care of) con su entidad asociada y su rol.
- Manejo de codigos de linea de formato F pegados al contenido (por ejemplo, 2/C/O) y de lineas cortadas a mitad de palabra entre dos lineas 1/.
- Gestion de formas juridicas con puntos (N.A.) y de rangos de numero de edificio (142/144).
- Identificacion de lineas de cuenta (IBAN, numero domestico, //FW) para enviarlas al grupo ignored.
- Salida JSON con probabilidades por palabra, spans y decisiones de salto de linea, mas un flag review para campos de baja confianza.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking: es un clasificador de tokens, no un modelo conversacional.
- Capacidad multilingue limitada al ingles (idioma declarado: en).

## Casos de uso

- Preprocesamiento para name screening: el modelo separa el nombre de la parte (persona u organizacion) del resto del campo, de modo que el motor de screening compara solo el nombre contra listas de sanciones, reduciendo falsos positivos por contaminacion con la direccion.
- Geographic screening y validacion de pais: la salida incluye Ctry y Ctry_written, lo que permite verificar que el pais declarado en el campo coincide con el pais del IBAN o con la jurisdiccion esperada por la politica de cumplimiento.
- Migracion a CBPR+ e ISO 20022: el bloque iso20022_hint entrega directamente BldgNb, StrtNm, PstCd, TwnNm y Ctry, que son los campos estructurados que exige el nuevo estandar para direcciones postales.
- Normalizacion de mensajes MT heredados: convierte campos 50K, 59, 50F y 59F aplanados en entidades estructuradas sin asumir el orden nombre-direccion, lo que cubre mensajes con el nombre al final o con lineas cortadas.
- Enrutamiento a revision humana: el flag review y las probabilidades por palabra permiten derivar automaticamente a un analista los campos de baja confianza, como el caso 10969/BERLIN en el que lee el codigo postal como 1096.
- Extraccion de relaciones care of: identifica la entidad tras C/O y la marca con role care_of, util para construir el grafo de partes relacionadas en investigaciones de cumplimiento.
- Limpieza de datos para analitica de pagos: al clasificar lineas de cuenta en ignored, permite descartar ruido antes de agregar o analizar volumenes de mensajes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta una evaluacion cualitativa sobre 56 campos revisados manualmente:

| Problema | Fallos v3 | Fallos v3.1 |
|---|---|---|
| Nombre de persona en linea posterior a la direccion llega solo al agente geografico | 4 de 4 | 0 de 4 |
| BIC en linea propia pegado al nombre del banco | 5 de 5 | 0 de 5 |
| Palabras de unidad o edificio (OFFICE, TOWER, PLAZA) convertidas en nombres | 7 de 7 | 0 de 7 |
| Forma juridica con puntos (N.A.) parte el nombre del banco | 2 de 2 | 1 de 2 |
| Campos de control | 0 de 27 | 0 de 27 |

En el conjunto escrito a mano, v3.1 acierta 29 de 30 campos (v3: 30). El unico fallo documentado es la lectura del codigo postal 1096 en lugar de 10969 en el campo 10969/BERLIN, que el modelo marca con baja confianza y envia a revision.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El adaptador LoRA ocupa 0,3 GB, pero el requisito real depende del backbone google/gemma-4-E4B-it completo, cuyas especificaciones no se detallan.
- GPU recomendadas: no disponible. Al tratarse de un backbone Gemma 4 E4B, es previsible que quepa en GPU de consumo, pero no se confirma en la informacion disponible.
- Cabe en consumer GPU: no confirmado.
- Opciones de despliegue: la libreria declarada es PEFT, por lo que el adaptador se carga junto al modelo base mediante la API de PEFT. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al ser un modelo de token-classification con cabezas personalizadas no es directamente compatible con servidores de inferencia generativa estandar.
- Latencia y throughput: no disponibles. El autor indica que la segmentacion se realiza en una sola pasada forward, lo que sugiere latencia baja por campo, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La unica referencia interna es la version anterior del mismo modelo:

| Modelo | Parametros | Contexto | Rendimiento en el set manual | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| swift-party-tagger-silent-jev-gemma-v3.1 | no disponible (LoRA sobre Gemma 4 E4B) | no disponible | 29 de 30 campos correctos | apache-2.0 | HuggingFace |
| swift-party-tagger-silent-jev-gemma (v3) | no disponible (LoRA sobre Gemma 4 E4B) | no disponible | 30 de 30 campos correctos | no disponible | HuggingFace |

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos: el rendimiento sobre distribuciones reales de pagos puede diferir del reportado en el conjunto de validacion manual.
- No es un sistema de screening de sanciones: es un componente de preprocesamiento para name screening y geographic screening. No debe presentarse como solucion de cumplimiento completa.
- Dos personas en lineas adyacentes se fusionan en una sola entidad de nombre; el autor indica que requiere correccion por codigo, no por datos.
- Los numeros de cuenta sin barra se envian a los agentes en lugar de descartarse.
- Una palabra cortada entre dos lineas 1/ en formato F no se reconstruye correctamente.
- Variantes ortograficas de C/O como C\O no se reconocen.
- En el campo 10969/BERLIN lee el codigo postal como 1096; el modelo lo marca con baja confianza y lo envia a revision, pero el valor extraido es incorrecto.
- Idioma limitado al ingles: no se documenta soporte para direcciones o nombres en otros idiomas, lo que es relevante en pagos internacionales con partes no angloparlantes.
- Riesgo de alucinacion estructural: al ser un clasificador discriminativo no genera texto libre, pero puede asignar etiquetas erroneas con alta confianza en disposiciones no vistas durante el entrenamiento.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia apache-2.0 para el adaptador, pero el uso del modelo base google/gemma-4-E4B-it queda sujeto a los terminos de Gemma, que pueden imponer restricciones adicionales para uso comercial.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta: no hay evidencia de adopcion en produccion ni de validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/msw1410/swift-party-tagger-silent-jev-gemma-v3.1
- Version anterior v3: https://huggingface.co/msw1410/swift-party-tagger-silent-jev-gemma
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Paper referenciado en los tags (arXiv:2310.01208): https://arxiv.org/abs/2310.01208
