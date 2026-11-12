# bmbenterprises/gemma-4-E2B-it-qat-4bit

## Resumen

Gemma-4-E2B-it-qat-4bit es una cuantizacion de 4 bits (QAT, quantisation-aware training) del modelo multimodal Gemma 4 E2B instruct, publicada por el usuario bmbenterprises como espejo del repositorio original mlx-community/gemma-4-E2B-it-qat-4bit. El modelo procesa entradas de imagen y texto (pipeline image-text-to-text) y esta empaquetado en formato MLX, la libreria de Apple para ejecutar modelos de forma nativa en silicio de la serie M. El repositorio contiene 5.104.297.539 parametros en safetensors y ocupa 4,4 GB, lo que encaja con una representacion de 4 bits de un modelo de aproximadamente 2.000 millones de parametros con cabezas multimodales adicionales.

La relevancia de esta ficha es doble. Por un lado, documenta una variante de cuantizacion agresiva de la familia Gemma 4 orientada a inferencia local en Mac, un escenario cada vez mas comun para desarrollo y prototipado sin GPU dedicada. Por otro, conviene advertir de que la model card publicada es practicamente inexistente: solo incluye instrucciones de uso con mlx-vlm, sin datos de entrenamiento, benchmarks, licencia explicita ni composicion del dataset. Toda la informacion tecnica que sigue procede de los metadatos del repositorio y de la model card citada; cualquier dato ausente se marca como no disponible.

El modelo esta etiquetado solo en ingles, con licencia no declarada en los metadatos, y no registra descargas ni interacciones en el momento de la consulta. Se trata, por tanto, de un artefacto reciente y de baja traccion que debe evaluarse con cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text de la familia Gemma 4; detalles de arquitectura no publicados en la informacion disponible) |
| Parametros totales | 5.104.297.539 (safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (QAT, quantisation-aware training) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX) |
| Libreria de inferencia | mlx / mlx-vlm |
| Tamano del repositorio | 4,4 GB |
| Pipeline | image-text-to-text |
| Autor del repositorio | bmbenterprises |
| Repositorio de origen | mlx-community/gemma-4-E2B-it-qat-4bit |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Por la nomenclatura (Gemma 4, variante E2B, instruct) y por el pipeline declarado (image-text-to-text), se trata de un modelo multimodal que acepta imagenes y texto y genera texto, presumiblemente con un encoder visual acoplado a un decoder de lenguaje de tipo transformer. El sufijo "it" indica un ajuste instructivo, y "qat-4bit" senala que la cuantizacion a 4 bits se aplico mediante entrenamiento consciente de cuantizacion, tecnica que suele preservar mejor la calidad que una cuantizacion post-entrenamiento agresiva.

No hay datos publicados sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, mezcla de expertos). El repositorio es un espejo de una publicacion de mlx-community y la model card no amplia esta informacion. Cualquier afirmacion sobre el proceso de entrenamiento mas alla de lo indicado seria especulativa.

## Capacidades

- Generacion de texto conversacional en ingles, con formato instructivo.
- Comprension de imagenes combinadas con texto (image-text-to-text): descripcion de imagenes, respuesta a preguntas sobre contenido visual.
- Conversacion multi-turno segun la etiqueta "conversational".
- Inferencia local en Apple Silicon mediante MLX y mlx-vlm.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Descripcion de imagenes en local: el modelo puede ejecutarse con `mlx_vlm.generate` pasando una ruta de imagen y un prompt de descripcion, lo que permite generar alt-text o resumenes de contenido visual sin enviar datos a la nube, algo relevante para flujos con material sensible.
- Prototipado rapido en Mac: gracias al formato MLX y a los 4,4 GB del repositorio, un desarrollador puede validar una idea de producto multimodal en un portatil Apple Silicon antes de invertir en infraestructura GPU.
- Asistentes de documentacion tecnica: combinado con capturas de pantalla o diagramas, el modelo puede responder preguntas sobre el contenido visual en ingles, util para wikis internas o soporte a desarrolladores.
- Preprocesamiento de datasets visuales: generar descripciones o etiquetas textuales de imagenes en pipelines de curacion de datos, con la ventaja de que la inferencia local evita costes por token de API.
- Educacion y demos interactivas: aplicaciones de demostracion que combinan una imagen y una pregunta en ingles, ejecutables en un portatil sin conexion.
- Evaluacion comparativa de cuantizaciones: sirve como referencia practica para medir la perdida de calidad de una variante QAT 4 bits frente a versiones de mayor precision del mismo modelo base, dentro de un banco de pruebas interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica, y los metadatos del repositorio tampoco aportan cifras de rendimiento.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio ocupa 4,4 GB en pesos de 4 bits; se recomienda reservar al menos 6-8 GB de memoria unificada para margen de activaciones y contexto.
- Plataforma objetivo: Apple Silicon (serie M1, M2, M3, M4 y superiores) mediante MLX; no esta pensado para CUDA.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada de 8 GB o mas; en Mac con 16 GB o mas el margen es comodo para contextos largos.
- GPU dedicadas (A100, H100, RTX 4090): el formato MLX no es directamente compatible con CUDA; para esas GPU habria que recurrir a la version original del modelo en otro formato, no disponible en este repositorio.
- Opciones de despliegue: mlx-vlm (recomendado por el autor); otras alternativas como vLLM, llama.cpp, Ollama o TGI no estan soportadas por este artefacto concreto al estar en formato MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| gemma-4-E2B-it-qat-4bit (este) | 5.104.297.539 (safetensors) | no disponible | Si (image-text-to-text) | no disponible | safetensors MLX 4 bits |
| mlx-community/gemma-4-E2B-it-qat-4bit (origen) | mismo modelo base | no disponible | Si | no disponible | safetensors MLX 4 bits |
| Otras variantes de Gemma 4 E2B | no disponible | no disponible | presumiblemente si | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas comparables en la informacion proporcionada, por lo que la comparativa se limita a la identificacion del repositorio de origen. No se han incluido modelos de otros fabricantes por falta de datos verificables en esta ficha.

## Limitaciones y advertencias

- Model card practicamente vacia: no documenta datos de entrenamiento, evaluacion ni limitaciones, lo que impide auditar sesgos o calidad de forma rigurosa.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; debe consultarse la licencia del modelo Gemma original antes de cualquier despliegue en produccion.
- Solo ingles: los metadatos indican unicamente el idioma "en"; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion: inherente a los modelos generativos; sin benchmarks publicados no hay forma de cuantificarlo en esta variante.
- Cuantizacion a 4 bits: aunque sea QAT, existe degradacion potencial frente a precisiones mayores, especialmente en tareas de razonamiento y en la fidelidad de la comprension visual.
- Dependencia de MLX: el artefacto solo es utilizable en el ecosistema Apple; no es portable a CUDA sin conversion.
- Repositorio espejo sin traccion: cero descargas y cero likes en el momento de la consulta, sin historial de mantenimiento; conviene preferir el repositorio original de mlx-community.
- Sin datos de contexto maximo: no se puede planificar el uso en conversaciones largas o documentos extensos con garantias.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bmbenterprises/gemma-4-E2B-it-qat-4bit
- Repositorio de origen citado en la model card: https://huggingface.co/mlx-community/gemma-4-E2B-it-qat-4bit
- Libreria mlx-vlm (usada en los ejemplos de la model card): https://github.com/Blaizzy/mlx-vlm
- Documentacion de MLX: https://ml-explore.github.io/mlx/
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
