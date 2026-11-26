# aesthetic0001/rent-k-dubs-rent-t5-adapter-v5

## Resumen

Rent K Dubs Spoken Rent Adapter V5 es un adaptador LoRA de rango 8 publicado por el usuario aesthetic0001 bajo el identificador `aesthetic0001/rent-k-dubs-rent-t5-adapter-v5`. Su funcion es muy concreta: convertir expresiones de cantidad en ingles hablado (por ejemplo, "twenty-five hundred dollars") en valores numericos, es decir, realizar normalizacion inversa de texto (inverse text normalization, ITN) sobre importes de alquiler. No es un modelo de proposito general, sino un componente especializado dentro de un pipeline de busqueda de alquileres.

El adaptador no es autonomo: se carga mediante PEFT sobre un decoder T5 preentrenado que el autor no redistribuye. En concreto, la base declarada es el modelo `itn_en_t5` de NVIDIA NeMo (release 1.11.0, fichero `itn_en_t5_decoder.nemo`), con arquitectura y tokenizer de Google T5-Small. El repositorio solo contiene los pesos LoRA y la configuracion PEFT, con un tamano de 0.0 GB, lo que confirma que se trata de un artefacto de adaptacion de muy pocos parametros.

Su relevancia es acotada pero clara para quien construya asistentes conversacionales de busqueda inmobiliaria: resuelve el paso fragil de pasar de lenguaje natural hablado a un filtro numerico estructurado. La informacion disponible no incluye datos sobre licencia, pipeline de inferencia ni benchmarks comparativos con otros sistemas de ITN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre decoder T5-Small (base NVIDIA NeMo `itn_en_t5`) |
| Parametros totales | no disponible (adaptador LoRA de rango 8; el modelo base T5-Small tiene ~60M parametros, dato no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base T5-Small, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible (la base NVIDIA NeMo se rige por los terminos de su propia model card) |
| Formato de pesos | safetensors (adaptador LoRA) + configuracion PEFT |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un decoder T5-Small procedente del modelo `itn_en_t5` de NVIDIA NeMo, orientado originalmente a normalizacion inversa de texto en ingles. El autor especifica el fichero exacto de origen (`itn_en_t5_decoder.nemo`) y su hash SHA-256 (`302ba43d631fe89679522213bc4bd632f73685d31657329954e4cc05f64c6497`), lo que permite verificar la base antes de cargar los pesos. Los ficheros de arquitectura y tokenizer provienen de `google-t5/t5-small`, en la revision `df1b051c49625cf57a3d0d8d3863ed4d13564fe4`.

Los pesos distribuidos son parametros LoRA de rango 8 entrenados especificamente para el dominio de alquileres. La aplicacion inicializa el decoder desde el archivo de NVIDIA y despues carga el adaptador con PEFT. No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO; dado el caracter del modelo, cabe esperar un ajuste supervisado sobre pares de texto hablado y valor numerico, pero esto no se confirma en la model card.

## Capacidades

- Normalizacion inversa de texto (ITN) limitada a importes monetarios en ingles: convierte expresiones como "twenty-five hundred dollars" en su valor numerico.
- Procesamiento de importes escritos a mano ("handwritten amounts") dentro del conjunto de casos soportados.
- Procesamiento de importes expresados con medios ("spoken-half cases"), con cobertura parcial segun la evaluacion del autor.
- Integracion como componente dentro de un pipeline de extraccion y busqueda de alquileres, junto a un extractor de spans independiente (GLiNER V14).
- No se documentan capacidades de generacion libre, razonamiento general, codigo, matematicas, vision, tool calling ni comportamiento agentico.

## Casos de uso

- Filtrado de busquedas de alquiler por presupuesto: el adaptador convierte la cantidad dictada o transcrita por el usuario en un valor numerico que el motor de busqueda puede usar como rango de precio, evitando reglas manuales fragiles.
- Asistentes de voz para consulta inmobiliaria: tras la transcripcion de audio a texto, el adaptador normaliza el importe mencionado antes de construir la consulta estructurada.
- Extraccion de datos de formularios y notas manuscritas: permite transformar importes escritos a mano en valores numericos dentro de un proceso de digitalizacion de solicitudes de alquiler.
- Enriquecimiento de registros en un CRM inmobiliario: normaliza menciones de precio en notas de agentes o mensajes de clientes para poblar campos numericos de forma consistente.
- Preprocesado en pipelines de datos: como paso previo a la indexacion o al analisis, convierte importes en texto libre a formato numerico canonico.
- Moderacion y validacion de entradas: detecta y normaliza importes en mensajes de usuario para aplicar reglas de negocio (por ejemplo, limites de presupuesto) de forma determinista tras la conversion.

## Benchmarks y rendimiento

Resultados de evaluacion publicados por el autor en la model card:

| Prueba | Resultado |
|---|---|
| Holdout numerico | 159/160 |
| Importes manuscritos soportados | 25/25 |
| Casos de medios hablados ("spoken-half") | 11/14 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con sistemas alternativos de ITN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un adaptador LoRA sobre T5-Small, la huella es muy reducida y cabe holgadamente en cualquier GPU de consumo, aunque no se aportan cifras.
- GPU recomendadas: no especificadas en la informacion; por el tamano del modelo base, cualquier GPU moderna es suficiente.
- Cabe en GPU de consumo: si, segun el tamano del modelo base T5-Small, aunque el dato no se confirma en la model card.
- Opciones de despliegue: carga mediante PEFT sobre el decoder de NVIDIA NeMo inicializado desde `itn_en_t5_decoder.nemo`; el autor proporciona instrucciones de descarga con `hf download` y verificacion con `sha256sum -c SHA256SUMS`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| rent-k-dubs-rent-t5-adapter-v5 | LoRA sobre T5-Small (ITN de importes) | en | no disponible | Hugging Face (adaptador) |
| NVIDIA NeMo `itn_en_t5` 1.11.0 | T5 ITN general en ingles | en | terminos de NVIDIA (ver model card) | NGC |
| Google T5-Small | T5 base de proposito general | multilingue | Apache 2.0 (segun el repositorio de Google) | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada; la comparacion se limita a tipo de artefacto, idioma, licencia y disponibilidad.

## Limitaciones y advertencias

- Cobertura limitada: el propio autor advierte que el modelo puede fallar con importes coloquiales o fracciones fuera de su cobertura de entrenamiento; en la evaluacion fallo 3 de 14 casos de medios hablados.
- Dependencia de la base: no funciona de forma autonoma; requiere obtener el decoder `itn_en_t5_decoder.nemo` de NVIDIA bajo sus propios terminos, lo que condiciona el uso comercial.
- Licencia no declarada para el adaptador: no hay informacion sobre condiciones de uso comercial de los pesos LoRA.
- Solo ingles: el tag de idioma es `en` y no se documenta soporte multilingue.
- Dominio restringido a importes de alquiler: no es un modelo de ITN general ni de generacion de texto.
- Riesgo de error en la conversion numerica: una normalizacion incorrecta de un importe puede propagarse a filtros de busqueda o decisiones de negocio.
- Ausencia de datos de sesgo, contexto maximo y cuantizacion: no disponibles en la informacion proporcionada.
- Repositorio sin descargas ni likes y con tamano de 0.0 GB: artefacto muy reciente y sin validacion externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/aesthetic0001/rent-k-dubs-rent-t5-adapter-v5
- Modelo base NVIDIA NeMo ITN en ingles: https://catalog.ngc.nvidia.com/orgs/nvidia/nemo/models/itn_en_t5/
- Release 1.11.0 del modelo base: https://catalog.ngc.nvidia.com/orgs/nvidia/nemo/models/itn_en_t5/1.11.0/file-browser
- Google T5-Small (revision usada): https://huggingface.co/google-t5/t5-small/tree/df1b051c49625cf57a3d0d8d3863ed4d13564fe4
- Runbook del extractor: https://github.com/aesthetic0001/rent-k-dubs/tree/main/apps/search
- Extractor de spans GLiNER V14: https://huggingface.co/aesthetic0001/rent-k-dubs-search-v14/tree/v14
