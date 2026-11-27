# exalandru/DarkGlimmer-30B-oQ6e

## Resumen

DarkGlimmer-30B-oQ6e es una cuantizacion mixta en formato MLX del modelo DarkGlimmer-30B, publicada por el usuario exalandru. No se trata de un modelo entrenado desde cero, sino de una conversion del checkpoint GGUF `UltimateIntent/DarkGlimmer-30B-GGUF` a pesos MLX con precision mixta mediante la herramienta oQ (oMLX v0.8.4), pensada para ejecucion en hardware Apple Silicon. El checkpoint resultante tiene 29.776.626.688 parametros reales y ocupa 27,2 GB en el repositorio.

La relevancia de esta publicacion es acotada y muy practica: ofrece una ruta para ejecutar un modelo de ~30B con capacidades multimodales (incluye un componente de vision de 1.922 millones de parametros) en equipos Mac con memoria unificada suficiente, sin depender de CUDA. La cuantizacion mixta asigna 6 bits a la mayor parte de los pesos y mantiene en BF16 o 8 bits las capas mas sensibles, con un promedio efectivo de 7,301 bits por peso.

No hay informacion publicada sobre el entrenamiento, los datos utilizados ni los benchmarks del modelo base. La model card se limita a documentar el proceso de cuantizacion y el desglose de almacenamiento por tipo de tensor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el checkpoint incluye un componente de vision de 1.922M de parametros y un modelo de lenguaje de 27.855M) |
| Parametros totales | 29.776.626.688 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX con precision mixta oQ: affine 6-bit grupo 64 (84,189% de los pesos), affine 8-bit grupo 64 (9,352%), BF16 (6,459%); promedio efectivo 7,301 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), libreria `mlx` |
| Tamano del repositorio | 27,2 GB (25,307 GiB de pesos) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base DarkGlimmer-30B ni sobre su proceso de entrenamiento: no se documentan el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF, DPO u otras tecnicas de alineacion. Lo unico verificable a partir del checkpoint es la presencia de dos componentes: un modelo de lenguaje de 27.855 millones de parametros logicos (21,728 GiB almacenados) y un codificador o torre de vision de 1.922 millones de parametros (3,580 GiB almacenados, conservado integramente en BF16).

La innovacion tecnica de esta publicacion es exclusivamente la cuantizacion. La herramienta oQ de oMLX aplica precision mixta por tensor: las capas consideradas menos sensibles se almacenan en affine 6-bit con grupo de 64, un subconjunto en affine 8-bit y un 6,459% de los pesos permanece en BF16. El resultado es un checkpoint que reduce el peso a aproximadamente 7,3 bits por peso de media, manteniendo en alta precision la torre de vision completa.

## Capacidades

- Generacion de texto y modelado de lenguaje, segun el comportamiento del modelo base (no documentado en detalle).
- Procesamiento de vision: el checkpoint incluye una torre de vision de 1.922M de parametros en BF16, lo que indica capacidades multimodales imagen-texto.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el formato MLX permite cargar el checkpoint en equipos Apple Silicon con 32 GB o mas de memoria unificada, usando la GPU integrada mediante la libreria `mlx`. Es el caso de uso principal de esta publicacion.
- Prototipado de aplicaciones multimodales en local: la torre de vision en BF16 permite experimentar con tareas imagen-texto sin enviar datos a servicios externos, util para entornos con requisitos de privacidad.
- Evaluacion comparativa de cuantizaciones: sirve para medir la perdida de calidad de la cuantizacion mixta oQ (6/8/BF16) frente al checkpoint GGUF original, en tareas de generacion y vision.
- Desarrollo y depuracion en portatiles: al no requerir GPU dedicada, permite iterar en un MacBook durante el desarrollo de pipelines de inferencia antes de desplegar en servidores.
- Investigacion sobre cuantizacion de modelos de ~30B: el desglose detallado de bits por componente facilita estudiar el impacto de mantener ciertas capas en BF16 frente a cuantizarlas.
- Uso educativo y de experimentacion: con licencia Apache 2.0, puede emplearse en cursos y talleres sobre inferencia local de modelos multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: al menos 32 GB para cargar los 25,307 GiB de pesos mas el overhead de la libreria MLX y el contexto; 36-48 GB recomendables para contextos largos.
- GPU: el formato MLX esta disenado para Apple Silicon (series M1, M2, M3 y M4, preferiblemente variantes Pro, Max o Ultra). No es compatible de forma nativa con GPU NVIDIA o AMD.
- GPU de consumo: cabe en equipos Apple con 32 GB o mas de memoria unificada; no esta pensado para GPUs de consumo tipo RTX 4090 mediante MLX.
- Opciones de despliegue: libreria `mlx` y el ecosistema oMLX; para el checkpoint GGUF original pueden usarse llama.cpp u Ollama, pero no para esta version MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| DarkGlimmer-30B-oQ6e | 29,78B | no disponible | MLX safetensors (7,3 bits/peso) | Apache 2.0 | Cuantizacion mixta para Apple Silicon, incluye vision |
| UltimateIntent/DarkGlimmer-30B-GGUF | no disponible | no disponible | GGUF | no disponible | Modelo base del que deriva esta cuantizacion |
| Alternativas de ~30B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables para una comparacion rigurosa |

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluaciones de seguridad; no hay base para afirmar nada sobre su comportamiento en dominios sensibles.
- Riesgo de alucinacion desconocido: al no haber benchmarks ni evaluaciones publicadas, no puede estimarse la fiabilidad factual del modelo.
- La cuantizacion mixta introduce degradacion respecto al checkpoint original; el impacto concreto en calidad no esta medido en la informacion disponible.
- Solo funciona en el ecosistema MLX (Apple Silicon); no es portable a CUDA sin reconversion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.
- La licencia Apache 2.0 del checkpoint no garantiza que el modelo base tenga la misma licencia; conviene verificar los terminos de `UltimateIntent/DarkGlimmer-30B-GGUF` antes de un uso comercial.
- No se especifican idiomas soportados; el rendimiento en castellano es desconocido.

## Enlaces

- Hugging Face: https://huggingface.co/exalandru/DarkGlimmer-30B-oQ6e
- Modelo base (GGUF): https://huggingface.co/UltimateIntent/DarkGlimmer-30B-GGUF
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
