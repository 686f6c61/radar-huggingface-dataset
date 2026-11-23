# mradermacher/LvW-Dictate-1.5B-GGUF

## Resumen

LvW-Dictate-1.5B-GGUF es la distribucion en formato GGUF del modelo LvW-Dictate-1.5B, desarrollado originalmente por el usuario Lucasgitguy-co y cuantizado por mradermacher. Se trata de un modelo de lenguaje de 1.078.285.824 parametros (aproximadamente 1,5B nominales) especializado en el post-procesamiento de transcripciones de voz a texto: su tarea principal es la limpieza de dictado, es decir, la eliminacion de disfluencias (muletillas, repeticiones, falsos comienzos) y la normalizacion del texto generado por sistemas ASR.

El modelo parte de una arquitectura transformer estandar en formato Hugging Face y se ofrece aqui en 12 variantes de cuantizacion GGUF que van desde Q2_K (0,5 GB) hasta f16 (2,3 GB), lo que lo hace desplegable en hardware muy modesto, incluido CPU. Esta orientado exclusivamente al ingles y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en que cubre un nicho concreto dentro del pipeline de voz: no compite como modelo de proposito general, sino que actua como etapa de refinado entre un motor ASR y el texto final que consume el usuario o un sistema downstream. Para desarrolladores que construyen aplicaciones de dictado, subtitulado o asistentes por voz, un modelo pequeno y especializado como este puede integrarse en local con un coste computacional minimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de lenguaje; detalles de capas no disponibles) |
| Parametros totales | 1.078.285.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que se trata de un transformer de aproximadamente 1,5B parametros publicado en formato Hugging Face. La model card del repositorio cuantizado no incluye datos sobre numero de capas, dimensiones ocultas, mecanismo de atencion ni longitud de contexto soportada.

Respecto al entrenamiento, la model card lista dos datasets: `Lucasgitguy-co/lvw-dictate-cleanup` y `amaai-lab/DisfluencySpeech`. El primero parece ser un corpus propio de pares de transcripciones con y sin disfluencias; el segundo es un dataset publico orientado a la eliminacion de disfluencias en habla. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Limpieza de dictado: eliminacion de disfluencias (muletillas, repeticiones, falsos comienzos) en transcripciones ASR en ingles.
- Post-procesamiento de speech-to-text: normalizacion y refinado del texto crudo generado por motores de reconocimiento de voz.
- Generacion de texto conversacional: la etiqueta `conversational` sugiere uso en dialogos, aunque no se detalla su alcance.
- Procesamiento de texto en ingles exclusivamente.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio nativo ni modo de pensamiento (thinking).
- No se documentan capacidades multilingues mas alla del ingles.

## Casos de uso

- Limpieza de transcripciones de reuniones: tras pasar el audio por un motor ASR, el modelo elimina muletillas y repeticiones para producir actas legibles; su tamano reducido permite ejecutarlo en la misma maquina que el motor ASR sin GPU dedicada.
- Dictado por voz en editores de texto: integrado como etapa final del pipeline, convierte el texto crudo del reconocedor en prosa limpia antes de insertarlo en el documento, con latencia baja gracias a las cuantizaciones Q4.
- Subtitulado automatico: post-procesa los subtitulos generados por ASR para eliminar tartamudeos y falsos comienzos, mejorando la legibilidad en plataformas de video.
- Asistentes de voz locales: en despliegues sin conexion, el modelo cabe en CPU o en GPU de gama baja (Q4_K_M, 0,8 GB) y refina las ordenes dictadas por el usuario antes de pasarlas al modulo de intenciones.
- Transcripcion de entrevistas y notas de voz: limpia el texto de entrevistas grabadas para facilitar su analisis posterior o su publicacion como articulo.
- Pipelines de accesibilidad: convierte dictado con disfluencias en texto claro para usuarios con dificultades motoras o del habla, ejecutandose en local por privacidad.
- Preprocesamiento para NLP downstream: normaliza texto dictado antes de alimentar clasificadores, resumidores o sistemas de extraccion de informacion, reduciendo ruido en la entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: desde aproximadamente 0,5 GB (Q2_K) hasta 2,3 GB (f16), segun la cuantizacion elegida.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM es suficiente; tambien funciona en CPU. No requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (GTX 1060 6 GB, RTX 3060, RTX 4090, etc.) e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base original puede cargarse con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano (1,5B) y las cuantizaciones Q4, se espera una latencia de decenas de milisegundos por respuesta corta en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos directamente comparables en la informacion proporcionada. Como referencia estructural, se puede contrastar con el modelo base sin cuantizar:

| Modelo | Parametros | Formato | Contexto | Licencia |
|---|---|---|---|---|
| mradermacher/LvW-Dictate-1.5B-GGUF | 1.078.285.824 | GGUF (12 cuants) | no disponible | Apache 2.0 |
| Lucasgitguy-co/LvW-Dictate-1.5B (base) | 1.078.285.824 | safetensors (HF) | no disponible | Apache 2.0 |

No se conocen alternativas especializadas en limpieza de dictado con las que comparar rendimiento de forma documentada.

## Limitaciones y advertencias

- Solo soporta ingles; no se debe usar para limpiar transcripciones en castellano u otros idiomas.
- Al ser un modelo de lenguaje generativo, existe riesgo de alucinacion: puede alterar el contenido de la transcripcion en lugar de limitarse a limpiar disfluencias.
- No se documentan sesgos conocidos, pero al entrenarse sobre datasets especificos de habla en ingles puede heredar sesgos de esos corpus.
- La longitud de contexto no esta documentada, lo que dificulta planificar su uso con transcripciones largas; conviene trocear la entrada.
- No hay informacion sobre el rendimiento real en tareas de limpieza (benchmarks ausentes), por lo que su calidad debe validarse en el caso de uso concreto antes de produccion.
- Las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso en produccion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets de entrenamiento podrian tener condiciones adicionales no reflejadas en esta ficha.
- El repositorio tiene solo 416 descargas y 0 likes en el momento de la consulta, lo que indica adopcion limitada y poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/LvW-Dictate-1.5B-GGUF
- Modelo base: https://huggingface.co/Lucasgitguy-co/LvW-Dictate-1.5B
- Dataset de limpieza de dictado: https://huggingface.co/datasets/Lucasgitguy-co/lvw-dictate-cleanup
- Dataset de disfluencias: https://huggingface.co/datasets/amaai-lab/DisfluencySpeech
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#LvW-Dictate-1.5B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
