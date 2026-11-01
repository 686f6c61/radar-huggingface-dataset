# brainworkup/d1-3B-MLX-oQ8e

## Resumen

d1-3B-MLX-oQ8e es una version cuantizada del modelo d1-3B, distribuida por el usuario brainworkup en HuggingFace. Se trata de un checkpoint de 3.123.483.888 parametros (3,12 mil millones) que emplea la arquitectura lfm2_vl, lo que indica un modelo multimodal con capacidad de vision ademas de generacion de texto. La cuantizacion se ha realizado con oQ (oMLX v0.7.3), una tecnica de cuantizacion de precision mixta que combina pesos en 8 bits afines con grupo de 64 y pesos en BF16, resultando en un promedio efectivo de 9,524 bits por peso.

El modelo esta empaquetado en formato MLX, la libreria de Apple para ejecucion de modelos de aprendizaje automatico sobre silicio de la serie M (M1, M2, M3, M4), lo que lo hace especialmente relevante para desarrolladores que quieran desplegar un modelo de 3B con vision en Macs sin necesidad de GPU dedicada. El repositorio ocupa 3,7 GB, con 2,866 GB correspondientes al modelo de lenguaje y 0,853 GB a la torre de vision.

La relevancia actual de esta ficha radica en que se trata de una publicacion reciente (creada el 1 de noviembre de 2026) con cero descargas y cero likes, sin model card descriptiva mas alla de la tabla de cuantizacion, y sin licencia ni idiomas declarados. Es, por tanto, un artefacto de cuantizacion de un modelo base subyacente (d1-3B) del que no se proporciona informacion en la documentacion disponible. Esta ficha documenta lo que se puede verificar y marca explicitamente como no disponible todo lo que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2_vl (transformer multimodal con torre de vision, segun el tag de HuggingFace) |
| Parametros totales | 3.123.483.888 (3,12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixed-precision: affine 8-bit grupo 64 (86,344% de los pesos) + BF16 (13,656%); promedio efectivo 9,524 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), custom_code, libreria mlx |
| Tamano del repositorio | 3,7 GB (3,463 GiB de pesos) |
| Desglose de almacenamiento | Lenguaje: 2,866 GB (2,669 GiB); Vision: 0,853 GB (0,794 GiB) |

## Arquitectura y entrenamiento

La arquitectura declarada es lfm2_vl, que por el sufijo corresponde a la familia Liquid Foundation Models 2 en su variante con vision. Se trata, por tanto, de un modelo multimodal que combina un backbone de lenguaje con un codificador visual, con un total de 3,12 mil millones de parametros, de los cuales 0,426B (13,656%) pertenecen a la torre de vision y 2,697B (86,344%) al modelo de lenguaje. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares, ya que la model card del autor no incluye esos datos.

La innovacion tecnica documentada es exclusivamente la cuantizacion: oQ (oMLX v0.7.3) aplica precision mixta, manteniendo la mayor parte de los pesos en affine 8-bit con grupo de 64 (2,669 GiB, 8,50 bits/peso efectivos) y preservando un 13,656% de los pesos en BF16 (0,795 GiB, 16 bits/peso), lo que da un promedio de 9,524 bits/peso. Esta estrategia busca conservar en mayor precision las capas mas sensibles (probablemente embeddings, proyecciones de la torre de vision o capas de salida) mientras comprime el resto. No se documentan innovaciones de atencion (linear attention, decodificacion especulativa) ni detalles del entrenamiento original.

## Capacidades

- Generacion de texto y razonamiento: el backbone de lenguaje de 2,697B parametros permite generacion autoregresiva y tareas de razonamiento general, aunque no se publican evaluaciones que lo confirmen.
- Vision: la presencia de una torre de vision de 0,426B parametros y el tag lfm2_vl indican soporte de entrada de imagenes, presumiblemente para description visual, VQA y tareas imagen-texto.
- Procesamiento multimodal imagen-texto: al ser un modelo vl, se espera que acepte imagenes junto a prompts textuales, aunque no se detalla el formato de entrada ni la resolucion soportada.
- Tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking o razonamiento extendido: no disponible (no se documenta).
- Audio: no disponible (no se documenta).

## Casos de uso

- Inferencia local en Mac con silicio Apple: el formato MLX y el tamano de 3,7 GB permiten ejecutar el modelo en un Mac con 16 GB de memoria unificada, usando la libreria mlx y el runtime de oMLX, sin GPU dedicada. Es el caso de uso principal y el unico claramente respaldado por el artefacto publicado.
- Prototipado de aplicaciones multimodal en local: un desarrollador puede cargar el checkpoint en Python con mlx y probar pipelines de imagen + texto (por ejemplo, descripcion de capturas o extraccion de informacion de documentos escaneados) sin enviar datos a la nube.
- Experimentacion con cuantizacion de precision mixta: el checkpoint sirve como referencia para estudiar el impacto de oQ (8-bit affine grupo 64 + BF16) frente a cuantizaciones uniformes, comparando calidad y tamano en un modelo de 3B con vision.
- Evaluacion de la familia LFM2-VL: util para investigadores que quieran medir el comportamiento de la variante VL de 3B en tareas de vision-lenguaje antes de comprometerse con el modelo completo en BF16.
- Despliegue en entornos con memoria limitada: con 3,463 GiB de pesos, cabe en dispositivos con 8 GB de RAM unificada si se reserva margen para el contexto, lo que habilita demos en portatiles de gama media Apple.
- Base para fine-tuning ligero: al estar en safetensors y con custom_code, puede servir como punto de partida para adaptaciones LoRA en MLX, aunque la licencia no declarada impide confirmar si el uso comercial esta permitido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta la distribucion de bits y el desglose de almacenamiento; no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica de calidad o velocidad.

## Requisitos de hardware

- VRAM/memoria unificada estimada para inferencia: los pesos ocupan 3,463 GiB; con overhead de runtime, KV cache y contexto, se recomienda un minimo de 8 GB de memoria unificada y 16 GB para contextos largos o procesamiento de imagenes de alta resolucion.
- GPU recomendadas: el formato MLX esta disenado para Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es compatible de forma nativa con CUDA (A100, H100, RTX 4090) sin conversion previa a otro formato.
- Cabe en GPU consumer: si, en cualquier Mac con chip de la serie M y al menos 8 GB de memoria unificada. En GPUs NVIDIA consumer requeriria conversion del checkpoint (por ejemplo, a GGUF) y no se garantiza la compatibilidad de la arquitectura lfm2_vl.
- Opciones de despliegue: libreria mlx y runtime oMLX (oMLX v0.7.3 es la version usada para cuantizar); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| d1-3B-MLX-oQ8e | 3,12B | no disponible | Si (lfm2_vl) | no disponible | MLX safetensors | HuggingFace, 0 descargas |
| Modelo base d1-3B | 3,12B (presumible) | no disponible | Si (presumible) | no disponible | no disponible | no disponible en la informacion |
| Alternativas de 3B multimodal | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. La unica comparacion verificable es con el hipotetico modelo base d1-3B en BF16, del que este checkpoint seria una version cuantizada a 9,524 bits/peso promedio (frente a 16 bits/peso del BF16), con una reduccion de almacenamiento de aproximadamente el 40%.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia en la model card ni en los metadatos, lo que impide determinar si el uso comercial esta permitido. No debe usarse en produccion sin aclarar este punto con el autor.
- Idiomas no declarados: se desconoce que lenguas cubre el modelo y con que calidad; no hay garantia de buen rendimiento en castellano.
- Sin benchmarks: no hay ninguna evaluacion publicada de calidad, alucinacion o sesgo, por lo que el rendimiento real es desconocido.
- Riesgo de alucinacion: inherente a los modelos generativos de 3B; sin datos de evaluacion no se puede acotar su magnitud.
- Sesgos conocidos: no documentados; al no publicarse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de genero, raza o idioma.
- Limitaciones de contexto: la longitud de contexto no esta disponible, lo que impide planificar su uso en tareas de contexto largo.
- Compatibilidad restringida: el formato MLX y el tag custom_code implican que la carga requiere la libreria mlx y posiblemente codigo personalizado; no es portable directamente a ecosistemas CUDA.
- Artefacto sin validacion comunitaria: cero descargas y cero likes en el momento de la consulta; no hay evidencia de que el checkpoint haya sido probado por terceros.
- Dependencia de oMLX: la cuantizacion se genero con oMLX v0.7.3; versiones distintas del runtime podrian no cargar el checkpoint correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/brainworkup/d1-3B-MLX-oQ8e
- Repositorio de oQ/oMLX: https://github.com/jundot/omlx
- Modelo base d1-3B: no disponible en la informacion proporcionada
- Paper o blog de la arquitectura lfm2_vl: no disponible en la informacion proporcionada
- Demos o repositorios adicionales: no disponible en la informacion proporcionada
