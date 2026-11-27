# cenkierpiotr/Przetargi-PL-4B

## Resumen

Przetargi-PL-4B es un modelo de lenguaje especializado de 4.000 millones de parámetros desarrollado por el usuario independiente cenkierpiotr, afinado a partir de `unsloth/Qwen3-4B` mediante QLoRA de 4 bits. Su unica funcion es convertir anuncios de contratacion publica polaca (BZP y TED) en objetos JSON con un esquema fijo de 13 claves, de forma verificable y sin anadir contenido fuera del contrato. Resuelve un problema muy concreto: los modelos generalistas, incluso de mayor tamano, incumplen los contratos JSON estrictos y mezclan hechos con texto libre, lo que rompe cualquier pipeline automatizado.

El modelo esta pensado para ejecucion local y on-premise, con una ventana de contexto de 20.000 tokens que permite procesar documentos completos de licitacion (SWZ, OPZ, PPU) en una sola pasada. Se distribuye en BF16, LoRA y GGUF, y esta etiquetado como compatible con vLLM, Ollama y endpoints. La licencia Apache 2.0 facilita su integracion comercial.

Es relevante ahora porque demuestra que un modelo pequeno y altamente especializado puede superar a modelos mucho mayores en una tarea de extraccion estructurada con restricciones duras, a un coste de inferencia minimo (4-6 GB de VRAM en Q4_K_M). El autor declara que trabaja en un modelo de decision complementario para cualificacion GO/NO-GO, que no forma parte de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B), afinado con QLoRA 4 bits |
| Parametros totales | 4.000 millones (aproximado, heredado de Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 20.000 tokens |
| Tipos de cuantizacion | BF16, LoRA, GGUF (incluye Q4_K_M) |
| Idiomas soportados | polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), adaptadores LoRA, GGUF |
| Modelo base | unsloth/Qwen3-4B |
| Hiperparametros de ajuste | QLoRA 4 bits, r=32, alpha=64 |
| Tamano del repositorio | 0,0 GB (segun Hugging Face) |
| Fecha de creacion | 2026-11-27 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only, y se afina con QLoRA de 4 bits usando r=32 y alpha=64 sobre un conjunto de 1.928 anuncios de contratacion publica polaca. El dataset cubre las principales ramas de actividad: TI, ciberseguridad, construccion, medicina, transporte, energia, educacion, telecomunicaciones y servicios. Segun la model card, cada etiqueta de entrenamiento paso una verificacion determinista de ausencia de alucinaciones numericas y una normalizacion de fechas a formato ISO.

La innovacion principal no esta en la arquitectura sino en el diseno del objetivo: el modelo se entrena para emitir exclusivamente un objeto JSON de 13 claves, con citas de la fuente en el documento y sin texto adicional tras la llave de cierre. El autor menciona un "validador determinista v2" que comprueba la conformidad del JSON, lo que sugiere un pipeline de evaluacion basado en reglas ademas de la metrica de JSON valido. No se detalla en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Extraccion de datos estructurados de anuncios de licitacion publica polaca (BZP y TED) a JSON con esquema fijo de 13 claves.
- Generacion de JSON estricto con alta tasa de validez sintactica (98,8 % en el conjunto OOD-85 declarado por el autor).
- Cumplimiento de un validador determinista de esquema (96,5 % de aprobacion en OOD-85).
- Extraccion de campos criticos de negocio: numero de referencia, fecha de publicacion, plazo de presentacion de ofertas y garantia (wadium).
- Citacion de la fuente dentro del documento para cada dato extraido.
- Capacidad de decision y razonamiento heredada de Qwen3-4B, aunque el modelo esta orientado a extraccion y no a recomendacion GO/NO-GO.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: limitadas al polaco segun la etiqueta de idioma del repositorio.

## Casos de uso

- Automatizacion de departamentos de licitaciones: el modelo procesa el anuncio completo en una sola pasada gracias a sus 20.000 tokens de contexto y devuelve un JSON con plazos, garantias y requisitos, reduciendo la revision manual de documentos de varias paginas.
- Integracion en ERP y CRM: al emitir siempre el mismo esquema de 13 claves, el JSON se puede mapear directamente a tablas de oportunidades comerciales sin post-procesado heuristico.
- Construccion de agentes de IA para licitaciones: el modelo actua como extractor determinista dentro de un pipeline mayor, alimentando a un modelo de decision o a un motor de reglas con datos limpios y citados.
- Monitorizacion diaria de BZP y TED: despliegue on-premise con vLLM u Ollama para procesar lotes de anuncios cada dia y detectar nuevas oportunidades que cumplan criterios predefinidos.
- Generacion de resumenes de pliegos (SWZ, OPZ, PPU): extraccion de clausulas de penalizacion, plazos de pago y SLA a partir de documentos largos, con referencia a la seccion de origen.
- Deteccion de requisitos ocultos: identificacion de certificaciones exigidas (por ejemplo ISO) y garantias asociadas a cada lote del contrato, un punto donde los errores manuales descalifican ofertas.
- Analisis de riesgo contractual: extraccion de penalizaciones y condiciones de garantia para que un equipo juridico evalue la exposicion antes de presentar oferta.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo en la model card (no verificados de forma independiente). El conjunto de evaluacion es OOD-85 (N=85), con anuncios fuera del conjunto de entrenamiento.

| Metrica | Przetargi-PL-4B | GLM-5.3 | Qwen 3.8 27B |
|---|---|---|---|
| JSON valido (%) | 98,8 | 55,3 | 29,4 |
| Aprobacion del validador v2 (%) | 96,5 | 0,0 | 0,0 |

Precision en campos criticos sobre OOD-85 (solo Przetargi-PL-4B):

| Campo | Aciertos | Precision |
|---|---|---|
| meta.numer_referencyjny | 84/84 | 100,0 % |
| meta.data_publikacji | 84/84 | 100,0 % |
| terminy.skladanie_ofert | 84/84 | 100,0 % |
| finanse.wadium | 24/24 | 100,0 % |

Segun el autor, los modelos grandes fallaron principalmente por anadir texto tras la llave de cierre (`Extra data`) y por inventar nombres de subclaves y formato de fuentes. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 4-6 GB en GGUF Q4_K_M; aproximadamente 8 GB en BF16 para los 4.000 millones de parametros.
- GPU consumer: cabe en una RTX 3060 de 12 GB y en tarjetas con 8 GB o mas en cuantizacion Q4.
- GPU de datacenter: A100, H100 y similares para despliegues de alto throughput con vLLM.
- Opciones de despliegue: vLLM, Ollama, llama.cpp (GGUF), transformers (BF16 o LoRA) y endpoints compatibles.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JSON valido (OOD-85) | Validador v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Przetargi-PL-4B | 4B | 20.000 | 98,8 % | 96,5 % | Apache 2.0 | Hugging Face |
| Qwen 3.8 27B | 27B (aprox.) | no disponible | 29,4 % | 0,0 % | no disponible | open-weights |
| GLM-5.3 | no disponible | no disponible | 55,3 % | 0,0 % | no disponible | open-weights |

La comparacion se limita a la tarea de extraccion estructurada en polaco sobre OOD-85, segun los datos del autor. No hay datos publicados que permitan comparar en tareas generales de generacion o razonamiento.

## Limitaciones y advertencias

- Especializado exclusivamente en contratacion publica polaca: no es adecuado para tareas generales de generacion, codigo o matematicas.
- Idioma limitado al polaco; el rendimiento en castellano u otros idiomas no esta documentado.
- Riesgo de alucinacion en campos no cubiertos por el esquema de 13 claves o en documentos con formatos atipicos no representados en el entrenamiento.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente; el conjunto OOD-85 tiene solo 85 muestras, lo que limita la significacion estadistica.
- El modelo extrae hechos pero no emite recomendaciones de negocio; el autor indica que el modelo de decision GO/NO-GO es un desarrollo separado.
- El repositorio figura con 0,0 GB de tamano y 0 descargas en el momento de la consulta, lo que puede indicar que los pesos aun no estan completamente subidos o que el modelo es muy reciente.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-4B.
- No se documentan sesgos conocidos ni evaluaciones de robustez frente a documentos mal formados o adversarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cenkierpiotr/Przetargi-PL-4B
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B
- No se han encontrado en la informacion disponible papers, blogs, repositorios o demos adicionales.
