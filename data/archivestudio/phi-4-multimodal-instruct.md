# ArchiveStudio/Phi-4-multimodal-instruct

## Resumen

Phi-4-multimodal-instruct es un modelo fundacional multimodal abierto y ligero desarrollado por Microsoft Research que acepta entradas de texto, imagen y audio y genera salidas de texto. Combina el decodificador de lenguaje de la familia Phi-4-mini con codificadores de visión y de voz, y esta disenado para escenarios con restricciones de memoria, latencia ajustada y razonamiento fuerte en matematicas y logica. Su ventana de contexto es de 128.000 tokens.

La ficha que nos ocupa corresponde al repositorio `ArchiveStudio/Phi-4-multimodal-instruct`, una copia espejo de terceros del repositorio oficial `microsoft/Phi-4-multimodal-instruct`. El peso total registrado en safetensors es de 5.574.460.384 parametros (aproximadamente 5,57 mil millones) y el repositorio ocupa 12,8 GB. Se publica bajo licencia MIT, lo que permite uso comercial y de investigacion sin restricciones de atribucion mas alla de las habituales de la licencia permisiva.

El modelo es relevante porque cubre tres modalidades de entrada en un unico checkpoint de menos de 6.000 millones de parametros, algo poco habitual entre los modelos omni abiertos, que suelen superar los 7.000 millones. Soporta reconocimiento de voz, traduccion de voz, resumen de audio, comprension de imagenes, OCR, comprension de tablas y graficos, y function calling, lo que lo situa como una opcion practica para despliegues en una sola GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (decodificador de lenguaje con codificadores de vision y audio); el desglose interno no se detalla en la informacion proporcionada |
| Parametros totales | 5.574.460.384 (5,57 mil millones) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repositorio contiene pesos en safetensors sin cuantizaciones publicadas (Microsoft publica variantes ONNX en su repositorio oficial) |
| Idiomas soportados | Texto: 23 idiomas (arabe, chino, checo, danes, neerlandes, ingles, finlandes, frances, aleman, hebreo, hungaro, italiano, japones, coreano, noruego, polaco, portugues, ruso, espanol, sueco, thai, turco, ucraniano). Vision: ingles. Audio: ingles, chino, aleman, frances, italiano, japones, espanol y portugues |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code` por el tag `custom_code`) |

## Arquitectura y entrenamiento

Se trata de un modelo multimodal de tipo transformer: un decodificador de lenguaje (la model card lo vincula a la familia Phi-4-mini y las etiquetas incluyen `phi-4-mini` y `phi4mm`) acoplado a codificadores especializados para imagen y audio. El modelo procesa las tres modalidades de entrada y produce texto como unica salida. La informacion disponible no detalla el numero de capas, la dimension oculta, el numero de cabezas de atencion, ni el tipo exacto de encoder de vision o de voz empleado.

El entrenamiento incorpora un proceso de mejora en tres fases: ajuste fino supervisado (SFT), optimizacion directa de preferencias (DPO) y aprendizaje por refuerzo a partir de retroalimentacion humana (RLHF), orientados a mejorar el seguimiento preciso de instrucciones y las medidas de seguridad. La model card indica que el modelo reaprovecha el trabajo en lenguaje, vision y voz, asi como los conjuntos de datos, de las generaciones Phi-3.5 y Phi-4.0. No se especifica en la informacion proporcionada el volumen total de tokens de entrenamiento ni la composicion del corpus.

## Capacidades

- Generacion de texto y razonamiento, con enfasis declarado en matematicas y logica.
- Comprension de imagenes de proposito general, incluida la comparacion de multiples imagenes.
- Reconocimiento optico de caracteres (OCR).
- Comprension de graficos y tablas, y razonamiento sobre documentos.
- Resumen de multiples imagenes o de fragmentos de video.
- Reconocimiento automatico de voz (ASR) en ocho idiomas.
- Traduccion de voz y traduccion combinada transcripcion-traduccion.
- Preguntas y respuestas sobre audio (speech QA) y resumen de audio.
- Comprension general de audio.
- Function calling y tool calling, orientados a la construccion de agentes.
- Soporte multilingue en texto para 23 idiomas.
- No se documenta en la informacion proporcionada un modo de razonamiento explicito (thinking mode) ni generacion de imagen o audio.

## Casos de uso

- Atencion al cliente automatizada por voz: el modelo puede transcribir la llamada, responder preguntas sobre ella y resumirla al final, todo en un mismo modelo. Resulta adecuado porque cubre ASR, comprension y resumen en un unico checkpoint de 5,57 mil millones de parametros, desplegable en una sola GPU.
- Transcripcion y traduccion de reuniones: con soporte de traduccion de voz y deteccion de idioma, permite generar actas en un idioma distinto al de la reunion. La ventana de 128.000 tokens admite sesiones largas sin trocear el contexto.
- Digitalizacion de documentos y facturas: combinando OCR y comprension de tablas, el modelo puede extraer campos estructurados de facturas, albaranes o informes escaneados y devolverlos en formato estructurado mediante function calling.
- Analisis de informes financieros con graficos: el modelo puede interpretar graficos de barras o lineas incrustados en PDF e informes, responder preguntas sobre tendencias y comparar varias imagenes de una misma serie.
- Agentes con herramientas en entornos con recursos limitados: su tamano contenido y su soporte de tool calling permiten ejecutar bucles de razonamiento multi-paso en servidores sin GPU de gama alta, o incluso en estaciones de trabajo con una unica GPU de consumo.
- Traduccion de documentacion tecnica multilingue: con 23 idiomas de texto, sirve como capa de traduccion en pipelines de localizacion de software o de contenido editorial.
- Accesibilidad: transcripcion en tiempo real de audio a texto y generacion de resumenes para personas con discapacidad auditiva, con la ventaja de que el resumen se produce en el mismo paso que la transcripcion.
- Asistente documental sobre imagenes y voz combinadas: un usuario puede dictar una pregunta por voz y adjuntar una captura de pantalla o una fotografia, y el modelo responde integrando ambas entradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los resultados de busqueda mencionan de forma cualitativa que el modelo "alcanza un rendimiento superior en multiples benchmarks" frente a otros modelos omni, y remiten al informe tecnico (arXiv:2503.01743) para las cifras, pero no se incluye ninguna tabla con valores numericos de MMLU, HumanEval, GSM8K, MMMU, ASR u otras metricas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 11-12 GB solo para los pesos (5,57 mil millones de parametros), mas el espacio de activaciones y la cache KV. Con 128.000 tokens de contexto, la cache KV puede crecer de forma significativa, por lo que conviene reservar memoria adicional. Estas cifras son estimaciones derivadas del recuento de parametros publicado, no datos oficiales.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 6-7 GB. Con cuantizacion de 4 bits: aproximadamente 3-4 GB. Estimaciones propias; no hay cuantizaciones oficiales publicadas para este repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para despliegues de produccion con contexto largo y concurrencia alta. Para uso individual, una RTX 4090 o RTX 3090 (24 GB) permite inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: si. Con 24 GB (RTX 3090, RTX 4090) en bf16; con 16 GB (RTX 4080, RTX 4070 Ti Super) de forma ajustada y probablemente con cuantizacion; con 8-12 GB solo mediante cuantizacion agresiva y contexto reducido.
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligatorio por el tag `custom_code`); variantes ONNX publicadas en el repositorio oficial de Microsoft. El soporte en vLLM, llama.cpp, Ollama o TGI no se confirma en la informacion proporcionada y deberia verificarse antes de planificar produccion.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

La siguiente tabla compara el modelo con alternativas de la misma categoria (multimodales abiertos de menos de 15.000 millones de parametros). Los datos de los modelos alternativos no proceden de la informacion proporcionada en esta busqueda y se basan en conocimiento general, por lo que conviene verificarlos antes de usarlos como referencia.

| Modelo | Parametros | Contexto | Modalidades de entrada | Licencia |
|---|---|---|---|---|
| Phi-4-multimodal-instruct | 5,57 mil millones | 128.000 tokens | texto, imagen, audio | MIT |
| Qwen2.5-Omni-7B | 7 mil millones (aprox.) | 32.000 tokens (aprox.) | texto, imagen, audio, video | Apache 2.0 |
| Gemma 3 4B | 4 mil millones (aprox.) | 128.000 tokens (aprox.) | texto, imagen | Licencia Gemma (uso comercial con condiciones) |
| Llama 3.2 11B Vision | 11 mil millones (aprox.) | 128.000 tokens (aprox.) | texto, imagen | Licencia comunitaria de Llama 3.2 |

Diferencias destacables frente a las alternativas: Phi-4-multimodal-instruct es el unico de la lista, entre los citados, que combina audio y vision con licencia MIT, lo que simplifica su adopcion comercial. Frente a Qwen2.5-Omni ofrece una ventana de contexto mayor; frente a Gemma 3 4B y Llama 3.2 11B Vision anade entrada de audio, que ninguno de los dos incorpora.

## Limitaciones y advertencias

- Riesgo de alucinacion: como cualquier modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de OCR, comprension de tablas o resumen de audio con ruido.
- Cobertura de idiomas asimetrica: el texto cubre 23 idiomas, pero la vision solo esta soportada en ingles y el audio en ocho idiomas. El rendimiento fuera de esos idiomas puede degradarse de forma notable.
- Sesgos: la model card advierte explicitamente de diferencias de rendimiento entre idiomas y de la necesidad de evaluar y mitigar sesgos de exactitud, seguridad y equidad antes de usar el modelo en casos de alto riesgo.
- Este repositorio es un espejo de terceros: el autor es ArchiveStudio, no Microsoft. No tiene descargas ni valoraciones registradas y el enlace de licencia de la model card apunta al repositorio oficial de Microsoft. Para produccion es recomendable usar el repositorio oficial.
- Ejecucion de codigo remoto: el modelo esta etiquetado con `custom_code`, por lo que requiere `trust_remote_code=True` en transformers. Esto implica ejecutar codigo del repositorio, lo que supone un riesgo de seguridad que debe evaluarse.
- Incertidumbre sobre aceleradores: no se confirma en la informacion disponible que el modelo funcione en vLLM, llama.cpp, Ollama o TGI, lo que puede limitar las opciones de despliegue optimizado.
- Consumo de memoria con contexto largo: aunque la ventana es de 128.000 tokens, mantener ese contexto completo exige una cache KV considerable; en GPUs de 16 GB o menos habra que reducir el contexto o cuantizar.
- Uso comercial: la licencia MIT lo permite sin restricciones adicionales, pero al tratarse de un espejo conviene confirmar la licencia en el repositorio oficial antes de distribuirlo.
- No se han publicado en la informacion disponible cifras de benchmarks que permitan validar de forma objetiva las capacidades declaradas.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/ArchiveStudio/Phi-4-multimodal-instruct
- Repositorio oficial de Microsoft: https://huggingface.co/microsoft/Phi-4-multimodal-instruct
- Licencia oficial: https://huggingface.co/microsoft/Phi-4-multimodal-instruct/resolve/main/LICENSE
- Informe tecnico de Phi-4-multimodal: https://arxiv.org/abs/2503.01743
- Paper adicional referenciado en las etiquetas: https://arxiv.org/abs/2407.13833
- Blog de Microsoft sobre Phi-4-multimodal: https://aka.ms/phi4-feb2025
- Portal de Phi: https://aka.ms/phi-4-multimodal/azure
- Phi Cookbook (recetas de uso): https://github.com/microsoft/PhiCookBook
- Playground en Azure AI Foundry: https://ai.azure.com/catalog/models/Phi-4-multimodal-instruct
- Playground en GitHub Marketplace: https://github.com/marketplace/models/azureml/Phi-4-multimodal-instruct/playground
- NVIDIA NIM: https://build.nvidia.com/microsoft/phi-4-multimodal-instruct
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/microsoft/phi-4-multimodal
- Space Thoughts Organizer: https://huggingface.co/spaces/microsoft/ThoughtsOrganizer
- Space Stories Come Alive: https://huggingface.co/spaces/microsoft/StoriesComeAlive
- Space Phine Speech Translator: https://huggingface.co/spaces/microsoft/PhineSpeechTranslator
- Variante ONNX oficial: https://huggingface.co/microsoft/Phi-4-multimodal-instruct-onnx
- Repositorio relacionado de la familia Phi-4: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Otro repositorio del mismo autor: https://huggingface.co/ArchiveStudio/phi-4
