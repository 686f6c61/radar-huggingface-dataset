# dayoon/streamembed

## Resumen

StreamEmbed es una familia de adaptadores LoRA publicada por el usuario dayoon en Hugging Face para el paquete de software StreamEmbed, una herramienta que permite buscar en el historial propio de pantalla describiendo verbalmente lo que se vio. El repositorio no contiene pesos completos, sino únicamente adaptadores PEFT entrenados sobre cinco modelos base distintos: Qwen3-VL-Embedding 2B y 8B, SigLIP2 SO400M y Base, y VultronRetrieverFlash-Qwen3.5-0.8B. El objetivo es convertir modelos de embedding genéricos en recuperadores especializados en capturas de pantalla.

Cada carpeta de modelo incluye dos LoRA de rango 32 y alpha 32 aplicados a las capas de atención de los codificadores de imagen y de texto: `query_lora.safetensors`, orientado a la recuperación a partir de descripciones, y `frame_adapter.safetensors`, que codifica capturas cuando se omiten bloques repetidos y se reutilizan los que no cambian entre fotogramas, de modo que los vectores resultantes se mantengan próximos a los de la captura completa.

La relevancia del proyecto es acotada pero específica: cubre el nicho de la búsqueda semántica sobre historial visual personal, un caso de uso que los modelos de embedding multimodales generalistas resuelven con precisión limitada. La licencia Apache 2.0 y el tamaño reducido del repositorio (0,7 GB) facilitan su evaluación, aunque el proyecto tiene nula tracción pública (0 descargas y 0 likes en el momento de la consulta) y no publica benchmarks ni documentación sobre los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre modelos base multimodales: Qwen3-VL-Embedding, SigLIP2 y VultronRetrieverFlash |
| Parametros totales | No disponible para los adaptadores; modelos base de 0,4B, 0,8B, 1,1B, 2B y 8B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los LoRA se distribuyen en float32) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (state dicts PEFT LoRA con claves `base_model.model.<modulo>.lora_A.weight` y `lora_B.weight`) |

## Arquitectura y entrenamiento

Los adaptadores son LoRA de rango 32 y alpha 32 aplicados a las capas de atención de los codificadores de imagen y de texto (o del modelo de lenguaje, según el caso). Se distribuyen dos variantes por modelo base. `query_lora.safetensors` es el adaptador de recuperación, entrenado para localizar capturas de pantalla a partir de una descripción; codifica tanto las consultas como las capturas completas cuando no se omite ningún bloque. `frame_adapter.safetensors` codifica capturas en las que se han descartado bloques repetidos y se reutilizan los inalterados entre fotogramas, con el objetivo de que esos vectores permanezcan cercanos a los de la captura completa y la indexación incremental no degrade la recuperación.

Los adaptadores SigLIP2 se entrenaron con entradas NaFlex de como máximo 1024 parches, parámetro configurable mediante `max_num_patches` en `models.json`. El repositorio fija cada modelo base a un commit concreto (por ejemplo, `9f2f7e7` para Qwen3-VL-Embedding-2B y `2c45655` para el 8B) para garantizar la compatibilidad de los pesos. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO.

## Capacidades

- Recuperación de capturas de pantalla a partir de descripciones en lenguaje natural, mediante embeddings de imagen y texto alineados.
- Codificación incremental de flujos de pantalla con omisión de bloques repetidos y reutilización de regiones sin cambios entre fotogramas.
- Indexación desde un directorio de imágenes y consulta sobre el índice mediante la API de StreamEmbed (`build_index_from_directory`, `query_index`).
- Visualización de resultados de búsqueda (`visualize_results`).
- Compatibilidad con cinco modelos base de tamaños entre 0,4B y 8B parámetros, lo que permite ajustar el equilibrio entre precisión y coste computacional.
- Aplicación manual de los adaptadores sobre un modelo PEFT de su base correspondiente.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni audio.

## Casos de uso

- Búsqueda en el historial personal de pantalla: el usuario indexa sus capturas y recupera una página concreta describiéndola ("la página de búsqueda de vuelos con tarifas a Denver"), sin necesidad de etiquetado manual ni de recordar nombres de archivo.
- Soporte técnico y depuración de incidencias: un desarrollador registra capturas de su sesión y localiza después el estado exacto de la interfaz en el momento en que se produjo un error, describiendo lo que se mostraba en pantalla.
- Documentación de procesos y auditoría: la indexación incremental con `frame_adapter` permite procesar flujos largos de pantalla sin almacenar cada fotograma completo, lo que abarata el registro continuo de sesiones para revisión posterior.
- Investigación en recuperación multimodal: los adaptadores sirven como punto de partida para experimentar con ajuste fino de retrievers sobre dominios visuales de interfaz de usuario, comparando el comportamiento entre los cinco modelos base.
- Construcción de asistentes de escritorio con memoria visual: un agente local puede consultar el índice de pantallas para responder preguntas sobre lo que el usuario vio anteriormente, integrándose mediante la API de Python de StreamEmbed.
- Evaluación de modelos de embedding para capturas: el repositorio permite comparar Qwen3-VL-Embedding 2B frente a 8B, SigLIP2 y Vultron sobre el mismo corpus, al compartir formato de adaptadores y configuración en `models.json`.
- Prototipado de búsqueda visual en productos internos: al ser LoRA de pequeño tamaño sobre bases de 0,4B a 8B, es viable desplegar el retriever en hardware modesto para demos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, el repositorio completo ocupa 0,7 GB y los modelos base van de 0,4B a 8B parámetros; el modelo base de 8B en float16 requiere del orden de 16 GB solo para pesos, mientras que el de 2B ronda los 4 GB, sin contar activaciones ni el índice.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de los modelos base, un 8B encaja en A100, H100 o RTX 4090; un 2B en RTX 4090, RTX 3090 o GPUs de 8-12 GB; los modelos de 0,4B a 1,1B pueden ejecutarse en GPUs de consumo de gama media.
- Cabe en GPU de consumo: sí para las variantes SigLIP2 Base (0,4B), Vultron (0,8B) y SigLIP2 SO400M (1,1B); la variante Qwen3-VL-2B es viable en GPUs de 8 GB o más; la de 8B requiere GPUs de gama alta o cuantización.
- Opciones de despliegue: el paquete `streamembed` de PyPI es la vía principal; los adaptadores también pueden cargarse con PEFT sobre el modelo base. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para modelos de embedding de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros base | Tipo | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| StreamEmbed qwen3-vl-2b | 2B | LoRA sobre embedding multimodal | No disponible | Apache 2.0 | Soportado por StreamEmbed |
| StreamEmbed qwen3-vl-8b | 8B | LoRA sobre embedding multimodal | No disponible | Apache 2.0 | Soportado por StreamEmbed |
| StreamEmbed siglip2-so400m | 1,1B | LoRA sobre embedding imagen-texto | No disponible | Apache 2.0 | Solo pesos |
| StreamEmbed vultron-0.8b | 0,8B | LoRA sobre retriever | No disponible | Apache 2.0 | Solo pesos |
| StreamEmbed siglip2-base | 0,4B | LoRA sobre embedding imagen-texto | No disponible | Apache 2.0 | Solo pesos |

No se dispone de datos de rendimiento comparativo con alternativas como CLIP, SigLIP2 sin ajustar o modelos de embedding de propósito general, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El repositorio contiene únicamente adaptadores LoRA; es imprescindible descargar el modelo base correspondiente en el commit exacto indicado en `models.json` para que los pesos sean compatibles.
- Los adaptadores SigLIP2 y Vultron se publican solo como pesos: StreamEmbed los lista pero todavía no los ejecuta, por lo que requieren código propio para su uso.
- No se documentan sesgos, composición del dataset de entrenamiento ni procesos de evaluación, lo que impide estimar el riesgo de alucinación o de comportamiento degradado en dominios visuales distintos de las capturas de pantalla.
- La ausencia de benchmarks y de métricas de recuperación (recall@k, MRR) impide verificar la calidad del ajuste frente a los modelos base sin adaptar.
- El proyecto tiene nula tracción pública (0 descargas, 0 likes) y un único autor, sin señales de mantenimiento continuado.
- No se especifican los idiomas soportados; el rendimiento en castellano para las consultas de recuperación no está verificado.
- Aunque la licencia es Apache 2.0, conviene revisar las licencias de los modelos base (Qwen3-VL-Embedding, SigLIP2 y VultronRetrieverFlash) antes de un uso comercial en producción.
- El entrenamiento con NaFlex limitado a 1024 parches en SigLIP2 puede reducir la resolución efectiva frente a la que admite el modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dayoon/streamembed
- Perfil del autor: https://huggingface.co/dayoon
- Paquete StreamEmbed en PyPI: https://pypi.org/project/streamembed/
- Modelo base Qwen3-VL-Embedding-2B: https://huggingface.co/Qwen/Qwen3-VL-Embedding-2B
- Modelo base Qwen3-VL-Embedding-8B: https://huggingface.co/Qwen/Qwen3-VL-Embedding-8B
- Modelo base SigLIP2 SO400M: https://huggingface.co/google/siglip2-so400m-patch16-naflex
- Modelo base SigLIP2 Base: https://huggingface.co/google/siglip2-base-patch16-naflex
- Modelo base VultronRetrieverFlash-Qwen3.5-0.8B: https://huggingface.co/vultr/VultronRetrieverFlash-Qwen3.5-0.8B
