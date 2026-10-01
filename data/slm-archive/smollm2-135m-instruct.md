# SLM-Archive/SmolLM2-135M-Instruct

## Resumen

SmolLM2-135M-Instruct es la version ajustada para seguir instrucciones del modelo SmolLM2-135M, un transformer decoder denso de 134.515.008 parametros (aproximadamente 135 millones) desarrollado por Hugging Face dentro de la familia SmolLM2, que tambien incluye variantes de 360M y 1.7B. El repositorio analizado, SLM-Archive/SmolLM2-135M-Instruct, es una copia de archivo del modelo oficial HuggingFaceTB/SmolLM2-135M-Instruct, con licencia Apache 2.0 y orientado exclusivamente al ingles.

El modelo resuelve el problema de disponer de un asistente conversacional capaz de ejecutarse en dispositivo (on-device), en CPU o incluso en el navegador mediante Transformers.js, con un coste de memoria del orden de cientos de megabytes. Fue preentrenado con 2 billones de tokens sobre FineWeb-Edu, DCLM y The Stack, y posteriormente alineado mediante SFT y DPO con UltraFeedback.

Su relevancia actual es la de servir como referencia de la categoria de modelos de lenguaje pequenos (SLM) para tareas de generacion de texto, reescritura y resumen en entornos con recursos limitados, aunque con capacidades de razonamiento y matematicas muy limitadas (GSM8K 1.4 en 5-shot) y sin soporte de function calling en esta variante de 135M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso |
| Parametros totales | 134.515.008 (aproximadamente 135M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 8.192 tokens (segun la denominacion "SmolLM2-135M-8k" usada en la tabla de evaluacion del modelo base; la model card de la version instruct no la declara de forma explicita) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors y ONNX; no se detallan esquemas de cuantizacion) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y ONNX (segun tags del repositorio); compatible con transformers.js |
| Modelo base | HuggingFaceTB/SmolLM2-135M |
| Precision de entrenamiento | bfloat16 |
| Tokens de preentrenamiento | 2T |
| Framework de entrenamiento | nanotron |
| Hardware de entrenamiento | 64 GPU H100 |
| Pipeline | text-generation |
| Tamano del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder de 134,5 millones de parametros entrenado en precision bfloat16 sobre 2 billones de tokens. La composicion del dataset de preentrenamiento combina FineWeb-Edu, DCLM y The Stack, junto con datasets filtrados propios que el autor indica que liberaria mas adelante. El entrenamiento se realizo con 64 GPU H100 utilizando el framework nanotron.

La version instruct se obtuvo en dos fases: primero un ajuste supervisado (SFT) con una mezcla de datasets publicos (smol-smoltalk) y datasets propios, y despues una optimizacion de preferencias directa (DPO) usando UltraFeedback. Segun la model card, la version instruct incorpora ademas capacidades de reescritura de texto, resumen y function calling gracias a datasets de Argilla como Synth-APIGen-v0.1, si bien el propio autor aclara que el function calling corresponde a la variante de 1.7B, no a la de 135M. La model card no describe innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa ni arquitecturas hibridas) para este tamano.

## Capacidades

- Generacion de texto en ingles y seguimiento de instrucciones conversacionales mediante plantilla de chat (apply_chat_template).
- Reescritura de texto y resumen de contenido, segun la model card de la familia SmolLM2.
- Conocimiento general y razonamiento basico, con resultados limitados: MMLU (cloze) 29.3 y BBH (3-shot) 28.2 en la version instruct.
- Razonamiento matematico practicamente nulo: GSM8K 1.4 en 5-shot.
- Soporte de tool calling / function calling: no en esta variante de 135M; la model card lo atribuye al modelo de 1.7B.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible para esta variante.
- Capacidades multilingues: no, el modelo esta entrenado y evaluado unicamente en ingles.
- Capacidades especiales: no se documentan modos de pensamiento (thinking), vision ni audio.
- Despliegue en navegador y en Node.js mediante Transformers.js y pesos ONNX.
- Ejecucion en CPU, con ejemplos oficiales de uso en CPU tanto en Transformers como en la CLI de TRL.

## Casos de uso

- Asistente conversacional local en CPU: el modelo puede mantener dialogos simples de un solo turno o pocos turnos con un consumo de memoria reducido, lo que permite desplegarlo en portatiles sin GPU o en servidores de bajos recursos.
- Autocompletado y generacion de texto en el navegador: al publicar pesos ONNX y compatibilidad con Transformers.js, es posible integrarlo en una aplicacion web que genere respuestas sin enviar datos al servidor, util para entornos con requisitos de privacidad.
- Reescritura de frases y parafraseo en ingles: adecuado para herramientas de edicion que reformulen oraciones cortas, una tarea para la que el modelo fue ajustado explicitamente.
- Resumen extractivo de fragmentos cortos: puede condensar parrafos o notas breves en ingles dentro de su ventana de contexto, con verificacion humana posterior obligatoria.
- Clasificacion y etiquetado ligero por prompt: sirve como generador de etiquetas o categorias textuales en pipelines de procesamiento por lotes donde el coste por inferencia debe ser minimo.
- Prototipado e investigacion en modelos pequenos: resulta util como banco de pruebas para tecnicas de cuantizacion, destilacion o evaluacion de alineacion a bajo coste computacional, reproducible en una sola GPU.
- Generacion de datos sinteticos de bajo coste: puede producir borradores de texto en ingles a gran volumen para tareas de anotacion asistida, siempre con revision humana dado su nivel de alucinacion.
- Educacion y demostraciones: permite ilustrar el funcionamiento de un LLM completo en talleres o aulas sin necesidad de infraestructura especializada.
- Atencion al cliente automatizada: no se recomienda como sistema principal por su limitada fiabilidad factual, aunque puede emplearse como capa de respuesta rapida para consultas simples previamente acotadas.

## Benchmarks y rendimiento

Resultados del modelo base (preentrenado), todos zero-shot salvo indicacion contraria, ejecutados con lighteval:

| Metrica | SmolLM2-135M-8k | SmolLM-135M |
|---|---|---|
| HellaSwag | 42.1 | 41.2 |
| ARC (media) | 43.9 | 42.4 |
| PIQA | 68.4 | 68.4 |
| MMLU (cloze) | 31.5 | 30.2 |
| CommonsenseQA | 33.9 | 32.7 |
| TriviaQA | 4.1 | 4.3 |
| Winogrande | 51.3 | 51.3 |
| OpenBookQA | 34.6 | 34.0 |
| GSM8K (5-shot) | 1.4 | 1.0 |

Resultados del modelo instruct:

| Metrica | SmolLM2-135M-Instruct | SmolLM-135M-Instruct |
|---|---|---|
| IFEval (media prompt/inst) | 29.9 | 17.2 |
| MT-Bench | 19.8 | 16.8 |
| HellaSwag | 40.9 | 38.9 |
| ARC (media) | 37.3 | 33.9 |
| PIQA | 66.3 | 64.0 |
| MMLU (cloze) | 29.3 | 28.3 |
| BBH (3-shot) | 28.2 | 25.2 |
| GSM8K (5-shot) | 1.4 | 1.4 |

No se han publicado en la informacion disponible resultados comparativos con modelos de otros desarrolladores para esta variante.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 270 MB en bfloat16/fp16 (134,5M x 2 bytes), unos 538 MB en fp32, unos 135 MB en int8 y unos 68 MB en int4. Son estimaciones calculadas a partir del numero de parametros; el autor no publica cifras de memoria.
- Memoria adicional: la cache KV para 8.192 tokens de contexto es pequena y crece con el tamano de lote; con lotes grandes y contexto completo conviene reservar 1-2 GB.
- GPU recomendadas: no se requieren GPU profesionales. Cualquier GPU consumer con 2 GB o mas de VRAM es suficiente (GTX 1050/1650, RTX 3050, RTX 3060, RTX 4090); el hardware de 64 H100 corresponde solo al entrenamiento.
- CPU: funciona sin GPU, tal como muestran los ejemplos oficiales con device="cpu" y trl chat --device cpu.
- Opciones de despliegue: transformers (Python), TRL CLI, Transformers.js (navegador y Node.js) y ONNX Runtime. Los tags del repositorio incluyen text-generation-inference y endpoints_compatible, lo que indica compatibilidad con text-generation-inference y con endpoints de Hugging Face. El soporte de vLLM no se menciona en la informacion disponible. El despliegue con llama.cpp u Ollama requeriria pesos GGUF, que no se publican en este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, es esperable una generacion en tiempo interactivo tanto en CPU moderna como en GPU consumer, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | IFEval | MT-Bench | MMLU (cloze) | GSM8K (5-shot) | Licencia | Function calling |
|---|---|---|---|---|---|---|---|---|
| SLM-Archive/SmolLM2-135M-Instruct (este repo) | 134,5M | 8k (indicado) | 29.9 | 19.8 | 29.3 | 1.4 | apache-2.0 | no |
| HuggingFaceTB/SmolLM2-135M-Instruct (oficial) | 134,5M | 8k (indicado) | 29.9 | 19.8 | 29.3 | 1.4 | apache-2.0 | no |
| SmolLM-135M-Instruct (predecesor) | 135M | no disponible | 17.2 | 16.8 | 28.3 | 1.4 | no disponible en la informacion | no |
| SmolLM2-360M | 360M | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion | no disponible |
| SmolLM2-1.7B | 1,7B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion | si (segun model card) |

Los datos de SmolLM2-135M-Instruct y SmolLM-135M-Instruct proceden de las tablas de evaluacion incluidas en la model card. Para las variantes de 360M y 1.7B solo se dispone del numero de parametros y de la indicacion sobre function calling; el resto de campos se marcan como no disponibles.

## Limitaciones y advertencias

- Idioma: el modelo entiende y genera contenido principalmente en ingles; no hay soporte documentado para castellano ni otros idiomas.
- Alucinacion: la propia model card advierte de que el contenido generado puede no ser factualmente preciso ni logicamente consistente. Debe usarse como herramienta de asistencia, nunca como fuente definitiva de informacion.
- Sesgos: al entrenarse sobre FineWeb-Edu, DCLM y The Stack, puede reproducir sesgos presentes en esos corpus web y de codigo.
- Matematicas y razonamiento: GSM8K de 1.4 en 5-shot y BBH de 28.2 indican una capacidad practicamente nula para aritmetica y razonamiento multi-paso. No es apto para calculo ni para cadenas de deduccion largas.
- Function calling: no soportado en la variante de 135M, lo que limita su integracion en pipelines de agentes y herramientas.
- Contexto: la ventana de 8.192 tokens es limitada y la calidad degrada en entradas muy largas; no se documenta un mecanismo de extension de contexto.
- Trazabilidad del repositorio: SLM-Archive/SmolLM2-135M-Instruct es una copia de archivo con 0 descargas y 0 likes en el momento de la consulta, no el repositorio oficial. Para uso en produccion conviene referenciar HuggingFaceTB/SmolLM2-135M-Instruct, que es el origen declarado.
- Inconsistencia de metadatos: las fechas de creacion y actualizacion del repositorio de archivo (2026-10-01) son posteriores a la publicacion original de la familia, un detalle a tener en cuenta al auditar procedencias.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright, la licencia y se indiquen los cambios realizados.
- Calidad conversacional: MT-Bench de 19.8 refleja un rendimiento bajo en dialogos multi-turno; se recomienda limitar los casos de uso a interacciones cortas y tareas acotadas.

## Enlaces

- Repositorio analizado: https://huggingface.co/SLM-Archive/SmolLM2-135M-Instruct
- Modelo base declarado: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Paper de SmolLM2: https://arxiv.org/abs/2502.02737
- Dataset de SFT: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Codigo de ajuste: https://github.com/huggingface/alignment-handbook/tree/main/recipes/smollm2
- Framework de entrenamiento: https://github.com/huggingface/nanotron/tree/main
- Dataset de DPO: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Dataset de function calling: https://huggingface.co/datasets/argilla/Synth-APIGen-v0.1
- Herramienta de evaluacion: https://github.com/huggingface/lighteval
- Nota sobre la busqueda web: los resultados proporcionados no contienen informacion tecnica relevante sobre el modelo; corresponden a otros usos del acronimo "SLM" (perfumeria, mutua de seguros y articulos genericos sobre modelos de lenguaje pequenos de IBM y ASI).
