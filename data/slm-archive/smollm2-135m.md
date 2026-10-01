# SLM-Archive/SmolLM2-135M

## Resumen

SmolLM2-135M es el modelo mas pequeno de la familia SmolLM2, desarrollada por Hugging Face (HuggingFaceTB), y corresponde a la ficha alojada en el repositorio espejo `SLM-Archive/SmolLM2-135M`. Se trata de un modelo de lenguaje causal de tipo transformer decoder, denso, con 134.515.008 parametros (aproximadamente 135 M) y una ventana de contexto de 8.192 tokens, segun la denominacion `SmolLM2-135M-8k` empleada en la tabla de evaluacion de la model card original.

El problema que resuelve es la ejecucion de tareas de generacion de texto en entornos con recursos muy limitados: al ocupar menos de 1 GB en precision bfloat16, puede correr en CPU, en GPUs de gama de entrada e incluso en dispositivos embebidos. Supone una mejora respecto a SmolLM1 en seguimiento de instrucciones, conocimiento y razonamiento, y fue entrenado sobre 2 billones de tokens con una mezcla de FineWeb-Edu, DCLM, The Stack y datasets filtrados propios.

Su relevancia actual es doble: por un lado, sirve como referencia de hasta donde llega un modelo de 135 M cuando el entrenamiento se disena con enfoque data-centric (paper arXiv:2502.02737); por otro, es una pieza util para prototipado rapido, destilacion, clasificacion y despliegues en el borde. La licencia Apache 2.0 permite uso comercial sin restricciones practicas, aunque el soporte multilingue se limita al ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (modelo denso, no MoE) |
| Parametros totales | 134.515.008 (aproximadamente 135 M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (identificado como SmolLM2-135M-8k en la model card) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repositorio publica pesos en precision completa (bfloat16 durante el entrenamiento) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, arquitectura llama) |
| Tamano del repositorio | 0,3 GB |
| Precision de entrenamiento | bfloat16 |
| Footprint de memoria reportado | 723,56 MB segun el ejemplo de carga de la model card |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

SmolLM2-135M es un transformer decoder denso con tokenizador y configuracion de tipo llama, distribuido a traves de `transformers` y etiquetado como compatible con text-generation-inference y endpoints. La model card indica que el preentrenamiento se realizo sobre 2 billones de tokens de una combinacion diversa que incluye FineWeb-Edu, DCLM, The Stack y nuevos conjuntos filtrados curados por el equipo. El entrenamiento se llevo a cabo con el framework nanotron sobre 64 GPU H100 y en precision bfloat16. La tabla de evaluacion del modelo base se publica bajo el nombre SmolLM2-135M-8k, lo que situa la ventana de contexto en 8.192 tokens.

La version instruct se construyo en dos etapas: un ajuste supervisado (SFT) con datasets publicos y propios (el conjunto SFT `smol-smoltalk` esta publicado), seguido de Direct Preference Optimization (DPO) usando UltraFeedback. Segun la model card, esta version mejora el seguimiento de instrucciones y anade tareas como reescritura de texto y resumen; el soporte de function calling se atribuye especificamente al modelo de 1.7B, no al de 135M. La model card no detalla innovaciones de atencion (atencion lineal, decodificacion especulativa) ni la composicion exacta del dataset filtrado, que queda pendiente de publicacion.

## Capacidades

- Generacion de texto autoregresiva en ingles: continuacion de prompts, respuestas cortas y redaccion basica.
- Razonamiento ligero y conocimiento factual de baja profundidad, con resultados limitados en tareas de sentido comun (HellaSwag 42,1 en el modelo base).
- Aritmetica muy limitada: GSM8K con 5 ejemplos apenas alcanza 1,4, por lo que no es fiable para calculo.
- Seguimiento de instrucciones basico tras SFT y DPO (IFEval de 29,9 en la variante instruct, frente a 17,2 de SmolLM1-135M-Instruct).
- Reescritura de texto y resumen, segun lo indicado en la model card para la version instruct.
- Function calling: soportado en el modelo de 1.7B, no en el de 135M.
- Capacidades de agente y razonamiento multi-paso: no disponibles en este tamano.
- Multilingue: no; el modelo esta entrenado y evaluado practicamente solo en ingles.
- Vision, audio y modo de razonamiento explicito (thinking): no disponibles.

## Casos de uso

- Autocompletado en editores y entornos de desarrollo: el modelo puede generar sugerencias de linea o bloque en local, sin enviar codigo a servicios externos, gracias a su tamano de 135 M y a su ejecucion viable en CPU.
- Prototipado y pruebas de pipelines de generacion: sirve para validar tokenizadores, plantillas de chat, sistemas de evaluacion y despliegues de inferencia antes de escalar a modelos mayores, con un coste de computo casi nulo.
- Clasificacion y etiquetado de texto a gran escala: mediante prompts de continuacion puede usarse para categorizar documentos, detectar intenciones o filtrar contenido, procesando grandes volumenes en una sola GPU de gama media o en CPU.
- Enrutamiento de consultas en sistemas multi-modelo: un modelo tan pequeno y rapido puede decidir si una peticion debe resolverse con una respuesta simple o derivarse a un modelo mayor, reduciendo coste por consulta.
- Generacion de datos sinteticos de bajo coste: util para crear ejemplos de aumento de datos, reformular frases o generar variaciones de plantillas en tareas de entrenamiento, siempre con revision posterior por su tasa de error.
- Educacion y experimentacion en investigacion: permite reproducir experimentos de ajuste fino, destilacion o DPO en una unica GPU consumer, algo inviable con modelos de miles de millones de parametros.
- Preprocesado y normalizacion de texto: reescritura, extraccion de campos en formatos simples o conversion de registros en pipelines de datos, donde la latencia y el coste importan mas que la precision absoluta.
- Filtrado previo en moderacion de contenido: como primera etapa de bajo coste que marca candidatos, dejando la decision final a un modelo mayor o a revision humana.

## Benchmarks y rendimiento

Modelo base (SmolLM2-135M-8k frente a SmolLM-135M), evaluacion zero-shot salvo indicacion contraria:

| Metrica | SmolLM2-135M-8k | SmolLM-135M |
|---|---|---|
| HellaSwag | 42,1 | 41,2 |
| ARC (media) | 43,9 | 42,4 |
| PIQA | 68,4 | 68,4 |
| MMLU (cloze) | 31,5 | 30,2 |
| CommonsenseQA | 33,9 | 32,7 |
| TriviaQA | 4,1 | 4,3 |
| Winogrande | 51,3 | 51,3 |
| OpenBookQA | 34,6 | 34,0 |
| GSM8K (5-shot) | 1,4 | 1,0 |

Modelo instruct (SmolLM2-135M-Instruct frente a SmolLM-135M-Instruct):

| Metrica | SmolLM2-135M-Instruct | SmolLM-135M-Instruct |
|---|---|---|
| IFEval (media prompt/inst) | 29,9 | 17,2 |
| MT-Bench | 1,98 | 1,68 |
| HellaSwag | 40,9 | 38,9 |
| ARC (media) | 37,3 | 33,9 |
| PIQA | 66,3 | 64,0 |
| MMLU (cloze) | 29,3 | 28,3 |
| BBH (3-shot) | 28,2 | 25,2 |
| GSM8K (5-shot) | 1,4 | 1,4 |

Las evaluaciones se ejecutaron con lighteval. No se han publicado en la informacion disponible resultados de benchmarks adicionales (por ejemplo, HumanEval o MT-Bench desglosado por turno) para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 o float16 (aproximadamente 270 MB de pesos), en torno a 540 MB en float32. La model card reporta un footprint de memoria de 723,56 MB en su ejemplo de carga.
- GPU recomendadas: cualquier GPU con mas de 1 GB de VRAM es suficiente; no se requieren A100 ni H100 para inferencia (las 64 H100 corresponden unicamente al entrenamiento).
- Compatibilidad con GPU consumer: si, cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y en GPUs integradas con memoria compartida.
- Ejecucion en CPU: viable y con latencia utilizable para generacion de texto corto, dado el reducido numero de parametros.
- Opciones de despliegue confirmadas: `transformers` (con soporte de `device_map="auto"` y accelerate para multi-GPU) y text-generation-inference, segun las etiquetas del repositorio (`text-generation-inference`, `endpoints_compatible`). El soporte de llama.cpp, Ollama o vLLM no se menciona en la informacion proporcionada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Resultados disponibles en la fuente |
|---|---|---|---|---|
| SmolLM2-135M (este modelo) | 134,5 M | 8.192 tokens | Apache 2.0 | Base: HellaSwag 42,1; MMLU 31,5; GSM8K 1,4. Instruct: IFEval 29,9; MT-Bench 1,98 |
| SmolLM-135M (predecesor) | 135 M (segun model card) | No disponible en la informacion proporcionada | Apache 2.0 | Base: HellaSwag 41,2; MMLU 30,2; GSM8K 1,0. Instruct: IFEval 17,2; MT-Bench 1,68 |
| SmolLM2-360M | 360 M (familia SmolLM2) | No disponible en la informacion proporcionada | Apache 2.0 | No disponible en la informacion proporcionada |
| SmolLM2-1.7B | 1,7 B (familia SmolLM2) | No disponible en la informacion proporcionada | Apache 2.0 | No disponible en la informacion proporcionada |

No se han proporcionado datos de benchmarks de otras familias comparables en el mismo rango de tamano (por ejemplo, variantes de menos de 500 M de otros desarrolladores), por lo que no se incluye una comparacion cifrada con ellas.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado y evaluado fundamentalmente en ingles; su rendimiento en castellano no esta respaldado por ninguna evaluacion publicada.
- Precision factual: la propia model card advierte de que el contenido generado puede no ser factualmente correcto, logicamente consistente o libre de sesgos presentes en los datos de entrenamiento.
- Alucinacion: con 135 M de parametros, la tasa de invencion de hechos y de incoherencias en cadenas largas es alta; el modelo debe tratarse como herramienta de asistencia y no como fuente de informacion.
- Razonamiento y matematicas: GSM8K con 5 ejemplos se queda en 1,4, y MT-Bench en 1,98 sobre 10; no es adecuado para tareas que exijan deduccion multi-paso o calculo fiable.
- Ventana de contexto: 8.192 tokens, inferior a la de modelos actuales de tamano similar, lo que limita el procesamiento de documentos largos y conversaciones multi-turno extensas.
- Function calling: no soportado en esta variante de 135 M, segun la model card (solo se indica para el modelo de 1.7B).
- Licencia: Apache 2.0, permisiva y apta para uso comercial, sin clausulas de uso aceptable adicionales indicadas en la model card. Conviene aun asi verificar la procedencia del repositorio espejo `SLM-Archive`, que no es el repositorio oficial de Hugging Face.
- Repositorio espejo: la ficha analizada corresponde a `SLM-Archive/SmolLM2-135M` (0 descargas y 0 likes en el momento de la consulta), no al repositorio original de HuggingFaceTB. Para produccion se recomienda usar el checkpoint oficial y verificar el hash de los pesos.
- Uso en produccion: dado su nivel de rendimiento, no es recomendable como modelo principal en aplicaciones de cara al usuario sin una capa de validacion, filtrado o supervision humana.

## Enlaces

- Modelo en Hugging Face (repositorio de esta ficha): https://huggingface.co/SLM-Archive/SmolLM2-135M
- Paper de SmolLM2: https://arxiv.org/abs/2502.02737
- Dataset de SFT smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset Synth-APIGen-v0.1 (function calling, para el modelo de 1.7B): https://huggingface.co/datasets/argilla/Synth-APIGen-v0.1
- Dataset UltraFeedback (usado en DPO): https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Codigo de ajuste fino (alignment-handbook, recetas smollm2): https://github.com/huggingface/alignment-handbook/tree/main/recipes/smollm2
- Framework de entrenamiento nanotron: https://github.com/huggingface/nanotron/tree/main
- Herramienta de evaluacion lighteval: https://github.com/huggingface/lighteval
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los enlaces listados proceden exclusivamente de la informacion de Hugging Face y de la model card del autor.
