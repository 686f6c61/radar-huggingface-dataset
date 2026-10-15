# AlexKarachun/vlm-data-in-weights

## Resumen

vlm-data-in-weights es un artefacto experimental publicado por el usuario AlexKarachun que consiste en un conjunto de pequeños generadores neuronales entrenados para memorizar en sus pesos un corpus de vision-lenguaje y reproducirlo sin leer los ficheros originales. No es un modelo de lenguaje ni un VLM en el sentido habitual: es un paquete de generadores deterministas que actúan como almacenamiento comprimido de datos sintéticos para el backbone VLM de un modelo de vision-lenguaje-accion (VLA).

El proyecto se divide en dos partes. La parte de benchmark almacena preguntas, opciones de respuesta, respuestas correctas e imagenes de 12.288 items de los benchmarks BLINK, CrossPoint-Bench, EmbSpatial-Bench, ERQA, MMMU (validacion), MMMU-Pro (estandar y vision) y MSMU. La parte de robot almacena fotogramas de camara y listas de objetos visibles de 130 tareas de simulacion LIBERO, con 4.160 registros de QA. El objetivo es estudiar con que fidelidad un corpus QA con imagenes puede mantenerse en pesos compactos y regenerarse offline.

Tecnicamente, la parte de texto la forman 16 MLP contadores de tokens (anchura 1024, profundidad 6, ~5,3 M de parametros cada uno, ~85 M en total) que mapean una posicion a un ID de token de 16 bits del tokenizador SmolVLM2 hasta un EOS aprendido. La parte de imagen la forman 46 modelos contadores de latentes que mapean un indice de imagen a un latente 4x64x64 del decodificador congelado sd-vae-ft-mse. El repositorio ocupa 1,3 GB, se distribuye bajo licencia MIT y fue creado en octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de MLP contadores de posicion (texto) y modelos contadores de indice de latente (imagen); no es un transformer generativo |
| Parametros totales | ~85 M en la parte de texto (16 MLP de ~5,3 M) mas un contador de texto de robot compartido; parametros de los 46 modelos de latentes de imagen no disponibles |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; cada generador reproduce secuencias de longitud fija memorizadas, token a token hasta un EOS aprendido |
| Tipos de cuantizacion | FP16 para almacenamiento (imagenes entrenadas en FP32 y guardadas en FP16); no se documentan variantes GGUF, INT8 ni INT4 |
| Idiomas soportados | no disponible (tokenizador de SmolVLM2; el contenido de los benchmarks esta mayoritariamente en ingles) |
| Licencia | MIT (el contenido regenerado queda sujeto a las licencias de los datasets originales) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El componente de texto consiste en 16 MLP contadores de tokens, cada uno de anchura 1024 y profundidad 6 (~5,3 M de parametros). Un contador de posicion con caracteristicas binarias y de Fourier se mapea al ID de 16 bits del token que ocupa esa posicion segun el tokenizador de SmolVLM2, generando la secuencia hasta un EOS aprendido. Se entrenaron con BCE-with-logits y AdamW hasta reproducir exactamente el flujo de texto completo y el EOS. El autor indica explicitamente que estos modelos memorizan y no son modelos de lenguaje generales.

El componente de imagen lo forman 46 modelos contadores de latentes (29 fragmentos de benchmark y 17 de robot, de hasta 512 imagenes cada uno) que mapean un indice de imagen a un latente 4x64x64 del decodificador congelado stabilityai/sd-vae-ft-mse (MIT, incluido bajo codec/). Estos modelos se entrenaron en FP32 y se almacenan en FP16. Los campos de texto de robot comparten un unico modelo contador. Los generadores se entrenaron para reproducir datos publicos existentes, no para inventar datos nuevos. El codigo de entrenamiento esta en generator_training/code/ y los scripts de generacion incluyen un guard de acceso a ficheros que impide leer los corpus originales durante la generacion, de modo que la salida procede demostrablemente de los pesos.

## Capacidades

- Reproduccion exacta de flujos de texto de los items de benchmark almacenados (pregunta, opciones, respuesta correcta) mediante los MLP contadores de tokens.
- Regeneracion de imagenes asociadas a cada item a partir de latentes decodificados con sd-vae-ft-mse.
- Regeneracion de datos de robot: fotogramas de camara y anotaciones de lista de objetos visibles de 130 tareas LIBERO.
- Generacion offline sin acceso a los ficheros originales, con guard de acceso a ficheros en los scripts.
- Exportacion por grupos mediante parametros --groups en los scripts de generacion.
- No dispone de generacion de texto libre, razonamiento, codigo, matematicas, tool calling, capacidades de agente ni modo de pensamiento (thinking). No es un modelo conversacional.

## Casos de uso

- Evaluacion reproducible de benchmarks VLM sin redistribuir los ficheros originales: los generadores reproducen los 12.288 items de BLINK, CrossPoint-Bench, EmbSpatial-Bench, ERQA, MMMU, MMMU-Pro y MSMU desde los pesos, util cuando la redistribucion directa de los datasets no es viable.
- Generacion de datos sinteticos para el backbone VLM de un modelo VLA: la parte de robot permite obtener fotogramas y anotaciones de objetos de tareas LIBERO para aumentar el entrenamiento sin almacenar los ficheros fuente.
- Investigacion en memorizacion y compresion de datasets: sirve como banco de pruebas para medir cuanta informacion de un corpus QA con imagenes cabe en pesos de decenas de millones de parametros.
- Estudio de destilacion de datos: permite comparar la fidelidad de reproduccion entre la parte de texto (exacta) y la de imagen (aproximada, via latente).
- Pruebas de pipelines de evaluacion offline: al generar los items localmente con CUDA, se pueden montar harness de evaluacion VLM en entornos sin acceso a los repositorios originales.
- Reproducibilidad de experimentos VLA: al fijar la semilla de los generadores, se obtiene un conjunto de evaluacion determinista para comparar variantes de un mismo modelo VLA.
- Auditoria de licencias: al permitir regenerar contenido sujeto a licencias, facilita analizar que items se pueden o no redistribuir.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no esta disenado para ser evaluado con metricas tipo MMLU, HumanEval o GSM8K; su proposito es la reproduccion fiel de un corpus, y el autor no reporta cifras de fidelidad cuantitativas mas alla de que el flujo de texto se reprodujo exactamente.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,3 GB; con los pesos en FP16 se estima una necesidad de unos 2 a 4 GB de VRAM para cargar los generadores y el decodificador VAE, aunque la cifra exacta no esta documentada.
- GPU recomendadas: se requiere una GPU CUDA; no se especifican modelos concretos. Una GPU de consumo de gama media o alta (por ejemplo, serie RTX) es suficiente por el tamano del artefacto.
- Cabe en GPU de consumo: si, segun el tamano del repositorio (1,3 GB) y las estimaciones de VRAM; no hay confirmacion oficial.
- Opciones de despliegue: scripts propios (generator/benchmark/generate.py y generator/robot/generate.py) sobre CUDA. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no sigue la interfaz de un transformer generativo estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos directamente comparables: vlm-data-in-weights no es un LLM ni un VLM, sino un conjunto de generadores de memorizacion de datos para un backbone VLA. Su enfoque se relaciona conceptualmente con la destilacion de datasets y la generacion de datos libres de acceso, pero no se dispone de alternativas equivalentes con las que comparar parametros, contexto, rendimiento o disponibilidad.

## Limitaciones y advertencias

- No es un modelo de lenguaje general: memoriza y reproduce datos concretos, no generaliza ni genera contenido nuevo.
- Los pesos reproducen datos publicos de terceros; el contenido regenerado queda sujeto a las licencias y terminos de los datasets originales (BLINK, CrossPoint-Bench, EmbSpatial-Bench, ERQA, MMMU, MMMU-Pro, MSMU y LIBERO), lo que limita su uso comercial.
- Requiere GPU CUDA para la generacion; no funciona en CPU pura segun la model card.
- Los modelos de texto replican exactamente el flujo, mientras que la parte de imagen se reconstruye de forma aproximada a partir de latentes, por lo que puede haber perdida de fidelidad en las imagenes.
- Riesgo de alucinacion: no aplica en el sentido de un LLM, pero la generacion fuera de las secuencias memorizadas carece de garantias.
- Idiomas soportados no especificados; el contenido esta mayoritariamente en ingles.
- El repositorio no registra descargas (0) y tiene 1 like, por lo que no cuenta con validacion externa significativa.
- La busqueda web no devolvio resultados relevantes ni documentacion adicional del autor, por lo que no se dispone de material de soporte independiente.
- La licencia MIT cubre el artefacto, pero no exonera del cumplimiento de las licencias de los datos memorizados.

## Enlaces

- HuggingFace: https://huggingface.co/AlexKarachun/vlm-data-in-weights
- Decodificador VAE referenciado: https://huggingface.co/stabilityai/sd-vae-ft-mse
- No se han encontrado enlaces relevantes (papers, blogs, repos o demos) en la busqueda web realizada; los unicos resultados obtenidos no guardan relacion con el modelo.
