# lmstudio-community/Inkling-2-Mini-MLX-8bit

## Resumen

Inkling-2-Mini es un modelo multimodal (image-text-to-text) de arquitectura Mixture of Experts (MoE) desarrollado por thinkingmachines. Esta ficha describe la version cuantizada a 8 bits en formato MLX publicada por lmstudio-community, pensada para ejecucion en Apple Silicon. El modelo base cuenta con 26.388.641.280 parametros totales segun los pesos en safetensors, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integracion en productos.

La relevancia de esta variante radica en que permite ejecutar un modelo MoE multimodal de gran tamano en hardware de consumo de Apple mediante MLX, el framework de Apple Machine Learning Research. La cuantizacion la realizo el equipo de LM Studio utilizando mlx_vlm, y el modelo se publica dentro del programa Community Model de LM Studio, que destaca modelos nuevos y notables de la comunidad.

No se dispone de informacion detallada en la documentacion proporcionada sobre la composicion del dataset de entrenamiento, el numero de parametros activos, la longitud de contexto o los idiomas soportados. Los datos que se ofrecen a continuacion provienen exclusivamente de la model card del repositorio y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), segun tag `moe`; tipo interno `inkling2_loop` |
| Parametros totales | 26.388.641.280 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); el repo incluye tag `4-bit` en metadatos, pero el nombre y la model card indican 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |
| Modalidad | image-text-to-text (multimodal) |
| Tamano del repositorio | 18,1 GB |
| Libreria | transformers |
| Modelo base | thinkingmachines/Inkling-2-Mini |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura Mixture of Experts, tal como indica el tag `moe` de los metadatos, con un identificador de arquitectura interna `inkling2_loop`. Se trata de un modelo multimodal que acepta imagenes y texto como entrada y genera texto, segun el pipeline `image-text-to-text`. No se dispone de informacion sobre el numero de expertos, el ratio de activacion, el numero de capas ni la dimension oculta en la documentacion proporcionada.

Respecto al entrenamiento, no se han facilitado datos sobre el volumen de tokens, la composicion del corpus, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento. La model card del repositorio cuantizado se limita a describir el proceso de cuantizacion: una version a 8 bits generada con MLX y la herramienta mlx_vlm por el equipo de LM Studio, optimizada para Apple Silicon. Cualquier detalle adicional sobre el entrenamiento del modelo original debe consultarse en la model card de thinkingmachines/Inkling-2-Mini, que no forma parte de la informacion suministrada.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational`.
- Procesamiento conjunto de imagen y texto (image-text-to-text): el modelo puede recibir imagenes como entrada junto a instrucciones textuales.
- Arquitectura MoE, que en teoria permite mayor capacidad de parametros totales con un coste computacional de inferencia menor que un modelo denso equivalente, aunque no se dispone del numero de parametros activos.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integracion con infraestructura de despliegue tipo API.
- Ejecucion en Apple Silicon mediante MLX.
- No se dispone de informacion sobre soporte de tool calling, function calling, razonamiento multi-paso, modo thinking, audio ni capacidades multilingues especificas.

## Casos de uso

- Asistentes conversacionales multimodales en local sobre Mac: el modelo puede gestionar dialogos en los que el usuario adjunta imagenes (capturas, fotos, diagramas) y formula preguntas, ejecutandose integramente en Apple Silicon gracias a la cuantizacion MLX de 8 bits.
- Analisis de documentos escaneados y capturas de pantalla: al aceptar entrada image-text, puede extraer y describir contenido visual combinado con instrucciones textuales, util para prototipos de automatizacion de back-office en equipos con hardware Apple.
- Prototipado rapido de aplicaciones de vision-lenguaje: investigadores que trabajan en entornos macOS pueden validar pipelines multimodales sin depender de GPUs NVIDIA ni de servicios en la nube.
- Evaluacion comparativa de cuantizaciones: al existir una version de 8 bits en MLX, sirve para medir la perdida de calidad frente al modelo base en tareas de descripcion de imagenes y respuesta a preguntas visuales.
- Despliegue en estaciones de trabajo de desarrollo: con 18,1 GB de pesos, el modelo cabe en equipos Apple con memoria unificada suficiente, lo que permite integrarlo en flujos de trabajo de ingenieria sin infraestructura dedicada.
- Experimentacion con arquitecturas MoE multimodales: util para quienes estudian el comportamiento de modelos con mezcla de expertos en tareas que combinan modalidades, aprovechando la licencia Apache 2.0 para modificaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: los pesos ocupan 18,1 GB en el repositorio; en MLX sobre memoria unificada se necesita al menos esa cantidad mas el overhead de activaciones y cache KV, por lo que se recomienda un minimo practico de 24 GB de memoria unificada.
- GPU recomendadas: chips Apple Silicon con memoria unificada de 24 GB o superior (por ejemplo, familias M-series Pro, Max y Ultra). No se dispone de datos de rendimiento para GPUs NVIDIA en esta variante, ya que esta optimizada para MLX.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada suficiente; no se dispone de informacion sobre su ejecucion en GPUs de consumo NVIDIA con esta cuantizacion concreta.
- Opciones de despliegue: MLX y mlx_vlm; LM Studio para ejecucion local en macOS; la libreria transformers figura en los metadatos. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI para esta variante MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada, ni de datos de rendimiento que permitan una comparacion rigurosa. La siguiente tabla recoge unicamente los datos disponibles de esta variante frente al modelo base del que deriva.

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini MLX 8-bit (este) | 26.388.641.280 | no disponible | 8 bits MLX | Apache 2.0 | safetensors |
| Inkling-2-Mini (base) | no disponible | no disponible | sin cuantizar | Apache 2.0 | no disponible |

## Limitaciones y advertencias

- La cuantizacion a 8 bits puede introducir una perdida de calidad respecto al modelo base, especialmente en tareas de razonamiento complejo o percepcion visual fina; no se han publicado evaluaciones que cuantifiquen esa degradacion.
- No se dispone de informacion sobre sesgos conocidos, tasas de alucinacion ni comportamientos problematicos del modelo base.
- Se desconoce la longitud de contexto soportada, lo que impide garantizar el comportamiento en conversaciones o documentos largos.
- No se dispone de la lista de idiomas soportados; el rendimiento en castellano no esta documentado.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo se distribuye como Community Model sin garantias por parte de LM Studio, que declara explicitamente no respaldar ni garantizar la exactitud o fiabilidad del contenido generado.
- La variante esta optimizada para Apple Silicon; su uso en otras plataformas requerira convertir los pesos o recurrir al modelo base.
- Existe una inconsistencia en los metadatos: el repositorio incluye el tag `4-bit` mientras que el nombre y la model card indican 8 bits; conviene verificar la cuantizacion real antes de desplegar en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lmstudio-community/Inkling-2-Mini-MLX-8bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Perfil del creador del modelo: https://huggingface.co/thinkingmachines
- LM Studio: https://lmstudio.ai
- Discord de LM Studio: https://discord.gg/aPQfnNkxGC
- Perfil de LM Studio en X: https://x.com/lmstudio
- mlx_vlm: https://github.com/Blaizzy/mlx-vlm
- MLX (Apple Machine Learning Research): https://github.com/ml-explore/mlx
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
