# metalloidlabs/gulliver-1.0

## Resumen

gulliver-1.0 es un adaptador LoRA de tipo QLoRA (rango 8) desarrollado por Metalloid Labs sobre el modelo base Qwen3.8-27B, orientado a la generación de prosa literaria condicionada por autor. No se trata de un checkpoint independiente de 27B, sino de un adaptador PEFT que debe cargarse junto al modelo base. Su objetivo es la continuación de texto con estilo de autor: dado un prefijo y una etiqueta de autor, el modelo genera prosa imitando la voz de uno de los 21 autores victorianos y decimonónicos incluidos en el corpus.

El adaptador se entrenó sobre un subconjunto curado del corpus Gutenberg/books de AllenAI Dolma v1_7, con 38.349.312 tokens de entrenamiento y 5.868.066 de validación, repartidos en 357 y 48 registros respectivamente. La selección pasó por un proceso de atribución de autoría, limpieza determinista y agrupación para reducir fugas entre particiones. El checkpoint publicado corresponde al paso 1.183, tras una época completa de entrenamiento sobre cuatro GPU NVIDIA L40S.

Es relevante como experimento de adaptación de estilo sobre un modelo grande: demuestra cómo un adaptador de bajo rango puede especializar un modelo de 27B en un dominio estilístico concreto con un coste de entrenamiento moderado. No es un asistente de escritura instruido ni un modelo conversacional; su uso previsto es la continuación literaria y la escritura original con control de estilo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA, rango 8) sobre transformer Qwen3.8-27B |
| Parametros totales | No disponible (adaptador; el base es 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3.8-27B) |
| Tipos de cuantizacion | No disponible (adaptador en safetensors; cuantizacion del base segun despliegue) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 entrenado con QLoRA sobre Qwen3.8-27B, con revisión fijada del base y del tokenizador (`1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`). El objetivo de entrenamiento es predicción del siguiente token condicionada por autor: cada ejemplo incluye una etiqueta de autor como prefijo, y los tokens de ese prefijo se enmascaran en la pérdida (219.835 tokens de prefijo enmascarados), con 357 objetivos EOS. El entrenamiento se ejecutó en cuatro NVIDIA L40S.

El corpus procede exclusivamente de la porción Gutenberg/books de AllenAI Dolma v1_7 (revisión `7f48140530a023e9ea4c5cfb141160922727d4d3`), con 55.434 IDs únicos cribados, 507 candidatos auditados y 475 registros atribuidos retenidos tras descartar 32 por problemas de atribución o integridad. Se excluyeron 70 registros con límites editoriales dudosos, quedando 405 registros que se agruparon en 376 grupos de partición, con un split estratificado por autor de 357 registros de entrenamiento y 48 de evaluación. La limpieza fue determinista y conservadora: eliminación de envoltorios de Gutenberg, normalización de saltos de línea y reparación de cortes de párrafo, sin reescritura por LLM ni modernización. Los totales de tokens (44.217.378 de contenido) usan el tokenizador Qwen fijado con `add_special_tokens=False`.

## Capacidades

- Generación de prosa literaria en inglés condicionada por autor, con 21 voces disponibles (Austen, Eliot, Dickens, Trollope, Hardy, las hermanas Brontë, James, Wharton, Twain, Melville, Hawthorne, Poe, Conan Doyle, Stevenson, Wells, Conrad, London, Wilde y Swift).
- Continuación de texto a partir de un prefijo, con control de estilo mediante etiqueta de autor.
- Escritura original en estilo de época, aunque la fidelidad estilística y la originalidad no se han evaluado sistemáticamente.
- Capacidades del modelo base Qwen3.8-27B heredadas por el adaptador (no documentadas en la información disponible para este adaptador).
- No es un modelo instruido: no hay soporte documentado de tool calling, function calling, agentes ni razonamiento multi-paso.
- Sin capacidades de visión, audio ni modo thinking documentadas.
- Multilingüe: no; solo inglés.

## Casos de uso

- Generación de prosa de época para ficción histórica: el adaptador permite continuar escenas en el registro de un autor concreto (por ejemplo, Dickens o Hardy) partiendo de un prefijo, útil para autores que quieran explorar voces del siglo XIX.
- Prototipado de estilo en edición literaria: un editor puede generar variantes de un pasaje en distintas voces para comparar registros y decidir el tono de una obra.
- Creación de contenido derivado y pastiche declarado: generación de textos de homenaje o ejercicios de estilo claramente atribuidos, aprovechando la condición por autor.
- Investigación en adaptación de estilo: el adaptador sirve como caso de estudio reproducible de QLoRA rango 8 sobre un modelo de 27B con corpus pequeño y curado.
- Generación de datos sintéticos estilísticos: producción de corpus etiquetados por autor para entrenar clasificadores de estilo o evaluar detectores de imitación.
- Docencia y talleres de escritura: ejercicios de imitación controlada donde el alumno compara su texto con la continuación generada en la voz de un autor de referencia.
- Experimentación con prompts largos: al heredar el contexto del base Qwen3.8-27B, permite continuaciones sobre prefijos extensos (longitud exacta no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB (repo safetensors); requiere cargar el base Qwen3.8-27B, cuyo peso en precisión completa ronda decenas de GB (cifra exacta no disponible).
- VRAM estimada: depende de la cuantización del base; en 4 bits el base de 27B requiere aproximadamente 14-16 GB solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: NVIDIA L40S (la usada en entrenamiento), A100 40/80 GB, H100; en consumer, RTX 4090 (24 GB) puede alojar el base en 4 bits con contexto moderado.
- Despliegue: PEFT sobre transformers; compatible con vLLM y TGI si se fusiona el adaptador o se carga como módulo LoRA (soporte exacto no documentado); llama.cpp/Ollama requerirían conversión a GGUF del base fusionado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gulliver-1.0 | Adaptador LoRA sobre 27B | No disponible | Prosa literaria condicionada por autor | Apache 2.0 | HuggingFace (adaptador) |
| Qwen3.8-27B (base) | 27B | No disponible | Modelo general | No disponible en la informacion | HuggingFace |
| Alternativas de adaptación de estilo | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre adaptadores comparables de estilo literario en la documentación proporcionada.

## Limitaciones y advertencias

- No es un asistente instruido: no sigue instrucciones complejas ni mantiene conversaciones; su uso previsto es la continuación de prosa.
- La originalidad y la fidelidad al estilo de autor no se han establecido mediante evaluación sistemática.
- Riesgo de reproducción de pasajes del corpus de entrenamiento; la desduplicación por agrupación no es exhaustiva y persisten solapamientos dentro del split de entrenamiento.
- Anne y Emily Brontë solo tienen un registro cada una y únicamente en entrenamiento, sin evaluación independiente retenida.
- A pesar del nombre, *Gulliver's Travels* no forma parte del corpus aceptado; los registros de Swift son otros cuatro títulos.
- Solo inglés; sin soporte multilingüe documentado.
- Licencia Apache 2.0 permite uso comercial, pero deben tenerse en cuenta las implicaciones de derechos de autor sobre las obras de origen del corpus (Gutenberg/Dolma) al generar texto derivado.
- Sesgos de época: el corpus victoriano y decimonónico puede reflejar sesgos culturales, de género y raciales propios de las obras originales.
- No hay datos de benchmarks, latencia ni contexto máximo específicos del adaptador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/metalloidlabs/gulliver-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset Dolma: https://huggingface.co/datasets/allenai/dolma
- Distribución de datos Dolma v1_7 (books): https://olmo-data.org/dolma-v1_7/books/
- Organización Metalloid Labs: https://huggingface.co/metalloidlabs
