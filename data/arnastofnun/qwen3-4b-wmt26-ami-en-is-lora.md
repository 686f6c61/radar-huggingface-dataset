# arnastofnun/Qwen3-4B-wmt26-AMI-en-is-lora

## Resumen

Qwen3-4B-wmt26-AMI-en-is-lora es un adaptador LoRA de traducción automática inglés→islandés desarrollado por Árnastofnun (el Instituto Árni Magnússon de Estudios Islandeses) como parte de su participación en la tarea compartida WMT 2026 General Translation. No es un modelo completo: se aplica sobre el checkpoint arnastofnun/Qwen3-4B-wmt26-AMI-en-is, que a su vez es una mezcla generada con mergekit entre Qwen/Qwen3-4B-Instruct-2507 y un checkpoint de Qwen3-4B sometido a preentrenamiento continuado sobre islandés.

El adaptador se entrena con un formato de prompt aumentado por recuperación (RAG): cada ejemplo incluye un system prompt específico de dominio (general, noticias, redes sociales, software o habla), un turno de usuario con entradas de diccionario bilingüe y traducciones de ejemplo recuperadas para la frase origen, y un turno de asistente con la traducción islandesa de referencia. La pérdida se calcula únicamente sobre el turno del asistente. El conjunto de entrenamiento contiene 4.996 ejemplos repartidos entre los cinco dominios citados.

Su relevancia es doble: por un lado, es una contribución institucional a la traducción automática de una lengua de bajos recursos como el islandés; por otro, ilustra una tendencia práctica en 2026 —adaptar modelos generativos multilingües de ~4B parámetros a pares de lenguas concretos mediante LoRA de bajo rango y contextos recuperados, en lugar de entrenar sistemas de traducción dedicados desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso de la familia Qwen3; rango 16, alpha 16, dropout 0 |
| Parametros totales | No disponible para el adaptador; el modelo base declara 4B en su nombre (Qwen3-4B) |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | 8192 tokens de longitud maxima de secuencia durante el entrenamiento del adaptador; la longitud nativa del modelo base no se especifica en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye sin cuantizar; el modelo base admite las cuantizaciones habituales de la familia Qwen3, no documentadas en esta ficha) |
| Idiomas soportados | Ingles (en) e islandes (is); direccion entrenada: en→is |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); libreria peft / transformers |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B-Instruct-2507 combinado mediante mergekit con un checkpoint de Qwen3-4B preentrenado de forma continuada con datos islandeses procedentes del Icelandic Gigaword Corpus (IGC). El entrenamiento del LoRA se realizo con Unsloth sobre PEFT 0.19.1, con rango 16, alpha 16 y dropout 0, y afecta a los modulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. La longitud maxima de secuencia empleada fue de 8192 tokens y la perdida se computa solo sobre el turno del asistente, lo que evita que el modelo aprenda a reproducir literalmente el contexto recuperado.

La innovacion principal no esta en la arquitectura, sino en el formato de datos: se trata de un esquema type-agnostic de traduccion aumentada por recuperacion («DRAG», segun el titulo de la publicacion asociada). El dataset wmt26_translate_train.jsonl combina ejemplos construidos a partir de aciertos de diccionario y traducciones de ejemplo recuperadas del IGC, datos de test EN-IS de WMT24/25 y pares generados sinteticamente, hasta un total de 4.996 ejemplos en formato ChatML. En inferencia es obligatorio reproducir la misma canalizacion de recuperacion y construccion de prompt; el adaptador no ha sido evaluado con frases origen desnudas.

## Capacidades

- Traduccion automatica ingles→islandes en cinco dominios declarados: general, noticias, redes sociales, software y habla.
- Aprovechamiento de contexto recuperado: entradas de diccionario bilingue y traducciones de ejemplo similares insertadas en el prompt.
- Seguimiento de instrucciones en formato ChatML, heredado del modelo base Qwen3-Instruct.
- Procesamiento de entradas de hasta 8192 tokens, lo que permite incluir contexto de recuperacion extenso junto a la frase origen.
- Control de dominio mediante system prompt especifico.
- Capacidades multilingues limitadas al par entrenado: no se evaluan otras direcciones ni pares.
- Soporte de tool calling / function calling: no disponible ni evaluado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible ni evaluado.
- Modo de razonamiento explicito (thinking), vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Localizacion de documentacion tecnica y cadenas de interfaz: con el system prompt de dominio «software» y entradas de diccionario especificas del producto, el adaptador traduce del ingles al islandes respetando terminologia consistente, algo critico para mantener glosarios en productos localizados.
- Traduccion de contenido periodistico: el dominio «news» esta explicitamente cubierto en el entrenamiento y el formato RAG permite inyectar traducciones de ejemplo de agencias para homogeneizar estilo y nombres propios.
- Subtitulado y transcripcion de audio: el dominio «speech» del dataset hace que el modelo sea adecuado para traducir transcripciones orales, donde el contexto recuperado ayuda con expresiones coloquiales y nombres islandeses.
- Moderacion y traduccion de contenido generado por usuarios: con el dominio «social» y ejemplos recuperados de registro informal, se puede integrar en plataformas que necesiten traduccion en-is de comentarios y publicaciones.
- Traduccion asistida por ordenador (TAO) con memoria de traduccion: el prompt RAG encaja de forma natural en flujos donde ya existen coincidencias de memoria; el traductor humano recibe una propuesta contextualizada y solo postedita.
- Enriquecimiento de corpus institucionales: bibliotecas, archivos y organismos publicos islandeses pueden traducir materiales en ingles manteniendo terminologia normalizada mediante diccionarios institucionales inyectados en el prompt.
- Evaluacion y desarrollo en tareas compartidas: sirve como sistema de referencia reproducible para la tarea WMT 2026 EN-IS, al publicarse junto al dataset de ajuste y la publicacion asociada.
- Despliegue multitenant con vLLM: al ser un adaptador LoRA servible junto al modelo base, permite atender varios adaptadores o variantes sobre una misma GPU sin duplicar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de BLEU, COMET ni chrF, ni resultados de la tarea compartida WMT 2026, y los resultados de la busqueda web no aportan datos de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4B requiere aproximadamente 8-9 GB en bf16/fp16, unos 5-6 GB en cuantizacion de 8 bits y unos 3-4 GB en cuantizacion de 4 bits. El adaptador LoRA anade un consumo marginal (el repositorio pesa 0,1 GB).
- GPU recomendadas: A100, H100 y L40S para servicio de alta concurrencia; RTX 4090, RTX 3090 o RTX 4080 para despliegue individual.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de consumo con al menos 8 GB de VRAM en cuantizacion de 4 u 8 bits, y con 12-16 GB en precision completa.
- Opciones de despliegue: vLLM con `--enable-lora` y `--lora-modules` (documentado en la model card), PEFT + transformers para uso directo, y llama.cpp/Ollama/TGI tras convertir el modelo base fusionado a GGUF u otros formatos, aunque no se documenta ese procedimiento.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.
- Requisito adicional de sistema: un componente externo de recuperacion (diccionario bilingue y traducciones de ejemplo) debe ejecutarse antes de la llamada al modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| arnastofnun/Qwen3-4B-wmt26-AMI-en-is-lora | Adaptador LoRA sobre base de 4B | 8192 tokens en entrenamiento | No disponible | Apache 2.0 | HuggingFace (0 descargas, 0 likes) |
| arnastofnun/Qwen3-4B-wmt26-AMI-en-is (base) | 4B | No disponible | No disponible | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 (modelo origen) | 4B | No disponible en la informacion proporcionada | No disponible | Apache 2.0 (familia Qwen3) | HuggingFace |
| Sistemas de traduccion en-is dedicados (p. ej. OPUS-MT, NLLB-200) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos de calidad de traduccion entre estas alternativas en la informacion proporcionada. La diferencia funcional mas relevante es que este adaptador exige un prompt construido con recuperacion, mientras que los sistemas de traduccion dedicados suelen aceptar la frase origen de forma directa.

## Limitaciones y advertencias

- Alcance restringido: solo se ha entrenado y evaluado para la direccion ingles→islandes; cualquier otro par o direccion queda fuera de alcance segun el propio autor.
- Dependencia de la canalizacion RAG: el adaptador espera entradas de diccionario y traducciones de ejemplo en el prompt. Sin ese contexto, la calidad no ha sido evaluada y previsiblemente se degrada.
- Volumen de entrenamiento reducido: 4.996 ejemplos en total, lo que limita la cobertura de registros y dominios no representados.
- Cinco dominios definidos: general, noticias, redes sociales, software y habla. Textos fuera de esos dominios pueden degradar la calidad.
- Riesgo de alucinacion y de omisiones/adiciones en la traduccion, inherente a los modelos generativos utilizados como traductores.
- Posibles sesgos heredados del modelo base Qwen3 y del Icelandic Gigaword Corpus, ademas de los de los pares generados sinteticamente.
- Complejidad morfologica del islandes: errores de flexión, concordancia y formacion de compuestos son un riesgo esperable en textos largos o muy tecnicos.
- Licencia Apache 2.0, que permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se cite la publicacion asociada.
- Requiere desplegar tambien el modelo base: el adaptador por si solo no es utilizable.
- Adopcion muy baja en el momento de la consulta (0 descargas, 0 likes), lo que implica escasa validacion independiente por parte de la comunidad.
- La model card no documenta evaluacion de seguridad, filtros de contenido ni comportamiento ante prompts adversarios.
- Uso en produccion: conviene acompanar el sistema de un paso de postedicion humana o de metricas automaticas de calidad, dado que no hay cifras publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arnastofnun/Qwen3-4B-wmt26-AMI-en-is-lora
- Modelo base (mezcla con preentrenamiento islandes): https://huggingface.co/arnastofnun/Qwen3-4B-wmt26-AMI-en-is
- Dataset de ajuste: https://github.com/stofnun-arna-magnussonar/WMT2026_finetuning_dataset
- Icelandic Gigaword Corpus (IGC), CLARIN-IS: https://clarin.is/en/resources/gigaword/
- Unsloth: https://github.com/unslothai/unsloth
- vLLM: https://github.com/vllm-project/vllm
- Institucion responsable, Árnastofnun: https://arnastofnun.is
- Publicacion asociada (Steingrimsson et al., 2026): «What a DRAG (It Is Being Small) - The AMI Submission to the WMT 2026 General Translation Shared Task», Proceedings of the Eleventh Conference on Machine Translation, Budapest, ACL. Sin enlace directo disponible en la informacion proporcionada.
