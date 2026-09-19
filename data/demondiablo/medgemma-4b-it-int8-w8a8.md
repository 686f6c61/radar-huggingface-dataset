# Demondiablo/medgemma-4b-it-int8-w8a8

## Resumen

MedGemma 4B-IT INT8 W8A8 es una version cuantizada del modelo multimodal google/medgemma-4b-it, publicada por el usuario Demondiablo en Hugging Face. Se trata de un modelo de tipo image-text-to-text orientado al ambito medico y sanitario, construido sobre la familia Gemma 3 y con aproximadamente 4.300 millones de parametros totales, distribuido en safetensors con un peso de repositorio de 5,4 GB.

El proposito de esta publicacion no es el reentrenamiento, sino la optimizacion del modelo base para inferencia de alta concurrencia y baja latencia. Para ello se aplica una cuantizacion INT8 W8A8 (pesos en INT8 simetrico por canal y activaciones en INT8 dinamico por token) mediante la herramienta llm-compressor, con salida en el formato compressed-tensors nativo de vLLM. Se preservan en mayor precision el lm_head, embed_tokens, el proyector multimodal y las capas lineales de la torre de vision para no degradar la precision clinica.

Su relevancia actual radica en que permite desplegar un modelo medico multimodal en practicamente cualquier arquitectura NVIDIA moderna (Turing, Ampere, Ada Lovelace, Hopper y Blackwell) con aceleracion INT8, reduciendo el coste de VRAM y aumentando el throughput respecto al modelo base en bfloat16. La licencia es la Gemma Terms of Use, heredada del modelo original, y no se declaran idiomas soportados ni resultados de benchmarks propios en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal de la familia Gemma 3, con torre de vision (segun tags gemma3 e image-text-to-text) |
| Parametros totales | 4.300.079.472 (aprox. 4,3 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible. El ejemplo de la model card configura max_model_len=4096 |
| Tipos de cuantizacion | INT8 W8A8 exclusivamente (pesos INT8 por canal simetrico, activaciones INT8 dinamicas por token); formato compressed-tensors. No se ofrecen GGUF, AWQ ni GPTQ en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors con esquema compressed-tensors |

## Arquitectura y entrenamiento

El modelo es una cuantizacion post-entrenamiento del checkpoint google/medgemma-4b-it, por lo que no incorpora entrenamiento adicional ni ajuste fino propio. Conserva la arquitectura del modelo base, un transformer decoder-only multimodal de la familia Gemma 3 orientado a tareas de imagen-texto-a-texto, que incluye una torre de vision y un proyector multimodal. La intervencion del autor se limita al proceso de cuantizacion INT8 W8A8 realizado con llm-compressor sobre una NVIDIA RTX PRO 6000 Blackwell Server Edition.

La innovacion tecnica destacable es la estrategia selectiva de cuantizacion: se excluyen explicitamente lm_head, embed_tokens, multi_modal_projector y las capas lineales de la torre de vision, manteniendolas en mayor precision para preservar la exactitud en tareas clinicas. El resultado es un checkpoint compatible con el motor vLLM mediante el formato compressed-tensors, lo que habilita kernels INT8 acelerados. No se han publicado datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni fases de RLHF o DPO, dado que esta ficha corresponde a una cuantizacion y no al entrenamiento original.

## Capacidades

- Generacion de texto conversacional en el ambito medico y sanitario (tags medical, healthcare, conversational).
- Procesamiento de imagen y texto conjuntamente (pipeline image-text-to-text), incluyendo entrada de imagenes medicas.
- Resumen y extraccion de informacion a partir de textos clinicos como prescripciones y recetas.
- Generacion de texto de proposito general, heredada del modelo base MedGemma 4B-IT.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (el campo de idiomas aparece como no disponible).
- Modos especiales (thinking mode, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Extraccion de datos de prescripciones: el modelo puede recibir texto de recetas medicas (por ejemplo, "Tablet Thyronorm 50 mcg OD") y devolver la medicacion y posologia estructuradas, tal como ilustra la propia model card.
- Asistencia a la codificacion clinica: a partir de informes de alta o notas de consulta, generar borradores de codigos y terminos normalizados para revision humana posterior.
- Analisis de imagenes medicas asistido: al ser un modelo image-text-to-text, permite describir o etiquetar imagenes clinicas como apoyo a un profesional, nunca como sustituto del diagnostico.
- Resumen de historiales clinicos: con contexto configurado a 4096 tokens, puede condensar notas de evolucion y antecedentes para agilizar la revision por parte del facultativo.
- Despliegue de alto throughput en vLLM: al estar cuantizado en INT8 W8A8, es adecuado para servir multiples peticiones concurrentes en entornos con GPU Ampere, Ada o Hopper, reduciendo el coste por consulta.
- Documentacion sanitaria y educacion medica: generacion de explicaciones divulgativas o material de formacion a partir de fuentes clinicas, con supervision editorial.
- Preprocesado de datos para investigacion: extraccion y normalizacion de campos desde grandes volumenes de documentos medicos antes de su analisis estadistico, respetando la normativa de proteccion de datos.
- Integracion en aplicaciones de triaje: clasificacion preliminar de la urgencia de una consulta a partir de texto e imagen, siempre con validacion humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas del dominio medico, ni comparaciones con el modelo base en bfloat16. Tampoco se proporcionan cifras de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,3 GB solo para los pesos INT8, a lo que hay que sumar las capas no cuantizadas (embeddings, lm_head, proyector multimodal y torre de vision) en mayor precision, mas cache KV y activaciones. Se estima un consumo total en torno a 8-10 GB para una longitud de contexto de 4096 tokens; cifra orientativa, no confirmada por el autor.
- GPU compatibles con aceleracion INT8 W8A8 segun la model card: NVIDIA Turing (T4, RTX 2080 Ti), Ampere (A100, A10, RTX 3090, A6000), Ada Lovelace (RTX 4090, L4, L40S, RTX 6000 Ada), Hopper (H100, H200) y Blackwell (RTX PRO 6000 Blackwell, B100, B200).
- Cabe en GPU de consumo: si, previsiblemente en RTX 3090, RTX 4090, RTX 6000 Ada y tarjetas con 12 GB o mas de VRAM, siempre que la longitud de contexto se mantenga moderada.
- Opciones de despliegue: vLLM (recomendado por el autor y soportado de forma nativa mediante compressed-tensors), transformers con AutoModelForImageTextToText, text-generation-inference (TGI) segun los tags, y endpoints compatibles.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Demondiablo/medgemma-4b-it-int8-w8a8 | 4,3 B | No disponible (ejemplo con 4096) | INT8 W8A8 (compressed-tensors) | gemma | Hugging Face, 0 descargas |
| google/medgemma-4b-it (modelo base) | 4,3 B | No disponible en esta informacion | bfloat16 | gemma | Hugging Face, modelo de referencia |
| Otras alternativas multimodales de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de resultados de benchmarks ni de comparaciones de rendimiento con modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Uso clinico: se trata de un modelo de asistencia, no de un dispositivo medico ni de un sistema de diagnostico. Cualquier salida debe ser validada por un profesional sanitario cualificado.
- Riesgo de alucinacion: como todo modelo generativo, puede producir afirmaciones plausibles pero incorrectas, especialmente critico en dosis, posologias o interacciones farmacologicas.
- Herencia del modelo base: al ser una cuantizacion post-entrenamiento, conserva los sesgos y limitaciones de google/medgemma-4b-it.
- Idiomas: no se declaran idiomas soportados; se desconoce el comportamiento en castellano y en otras lenguas distintas del ingles.
- Contexto: aunque el modelo base pueda soportar ventanas mayores, el ejemplo de la model card fija max_model_len=4096, por lo que contextos largos pueden degradar el rendimiento o no estar soportados por esta configuracion.
- Cuantizacion: la reduccion a INT8 puede introducir una perdida de precision frente al modelo en bfloat16; el autor no publica evaluaciones que cuantifiquen esa degradacion.
- Licencia: sujeta a la Gemma Terms of Use, que impone condiciones y restricciones para el uso comercial y la redistribucion. Es responsabilidad del usuario revisar y cumplir dichos terminos.
- Madurez del repositorio: 0 descargas y 0 "likes" en el momento de la consulta, sin historial de validacion por parte de la comunidad.
- Trazabilidad: el autor de la cuantizacion es un usuario individual (Demondiablo), no el equipo de Google responsable del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Demondiablo/medgemma-4b-it-int8-w8a8
- Modelo base: https://huggingface.co/google/medgemma-4b-it
- Herramienta de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo, el modelo base ni su cuantizacion; los resultados devueltos corresponden a empresas de construccion sin relacion con el contenido.
