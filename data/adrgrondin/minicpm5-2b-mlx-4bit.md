# adrgrondin/MiniCPM5-2B-mlx-4Bit

## Resumen

`adrgrondin/MiniCPM5-2B-mlx-4Bit` es una conversion a formato MLX y cuantizacion a 4 bits del modelo `openbmb/MiniCPM5-2B`, desarrollado originalmente por OpenBMB. La conversion la firma el usuario adrgrondin y se genero con `mlx-lm` version 0.31.2, la libreria de inferencia de Apple para chips de silicio propio. El resultado es un modelo de generacion de texto de 2.516.756.480 parametros (aproximadamente 2,5 mil millones) que ocupa 1,4 GB en disco, pensado para ejecucion local en equipos Apple Silicon.

El interes de esta ficha no esta en el modelo base, sino en el hecho de que exista una version cuantizada y lista para `mlx-lm` de un modelo etiquetado como `long-context`, `tool-calling` y `on-device`. Eso lo situa en la categoria de modelos pequenos orientados a despliegue en el borde: asistentes locales, prototipado de agentes sin GPU dedicada y tareas de clasificacion o extraccion dentro de una aplicacion de escritorio. Los idiomas declarados son ingles y chino; el castellano no figura como idioma soportado oficialmente.

Hay que subrayar dos cautelas desde el principio. La model card de este repositorio es puramente mecanica: describe como cargar el modelo con `mlx-lm` y poco mas, sin detalles de entrenamiento, sin plantilla de chat documentada y sin resultados de evaluacion. Ademas, el repositorio no tiene descargas ni interacciones registradas en el momento de redactar esta ficha, por lo que no existe validacion independiente de la calidad de esta cuantizacion concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Llama (etiqueta `llama` del repositorio), denso |
| Parametros totales | 2.516.756.480 (~2,5B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la informacion proporcionada (el repositorio incluye la etiqueta `long-context`, sin cifra) |
| Tipos de cuantizacion | 4 bits en formato MLX (tamano de grupo y esquema no especificados); el modelo base admite otras cuantizaciones en sus propios repositorios |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX, cuantizados a 4 bits; `library_name` declarado como `transformers`, uso documentado con `mlx-lm` 0.31.2 |
| Tamano del repositorio | 1,4 GB |
| Modelo base | `openbmb/MiniCPM5-2B` |
| Pipeline | `text-generation` |
| Autor de la conversion | adrgrondin (tercero, no OpenBMB) |

## Arquitectura y entrenamiento

El repositorio no aporta informacion propia sobre arquitectura ni entrenamiento: solo indica que se trata de una conversion de `openbmb/MiniCPM5-2B` realizada con `mlx-lm` 0.31.2. De las etiquetas del modelo se deduce que la arquitectura subyacente es un transformer decoder-only de tipo Llama, denso, de unos 2.516 millones de parametros, sin mezcla de expertos (no hay etiqueta MoE ni parametros activos distintos de los totales). No se dispone de datos sobre numero de capas, dimensiones ocultas, cabezas de atencion, tipo de posicional encoding ni si emplea atencion lineal o alguna variante eficiente para el contexto largo que sugiere la etiqueta `long-context`.

Los metadatos de datasets apuntan a un pipeline de entrenamiento por fases, aunque sin volumenes ni proporciones: `openbmb/Ultra-FineWeb`, `openbmb/UltraX-Preview` y `openbmb/Ultra-FineWeb-L3` corresponden a corpus de preentrenamiento web; `openbmb/UltraData-Math` y `openbmb/UltraData-Code` a datos de dominio de matematicas y codigo; `openbmb/UltraData-SFT-2605` y `openbmb/UltraData-SFT-Agent-2609` a ajuste supervisado, el segundo orientado a agentes; y `openbmb/UltraData-RL-2609` a una fase de aprendizaje por refuerzo. No se especifica si hubo RLHF, DPO u otra variante, ni los hiperparametros de ninguna etapa. La innovacion tecnica de este repositorio concreto es unicamente la cuantizacion a 4 bits en formato MLX, que reduce el peso en disco a 1,4 GB; no se documenta el impacto de esa cuantizacion sobre la calidad.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat aplicable mediante `tokenizer.apply_chat_template` cuando el tokenizador la incluye (la model card usa ese mecanismo como ejemplo).
- Manejo de contexto largo, segun la etiqueta `long-context` del repositorio, aunque sin cifra publicada de tokens de ventana.
- Tool calling o function calling, segun la etiqueta `tool-calling` y la presencia del dataset `UltraData-SFT-Agent-2609` en el entrenamiento del modelo base.
- Razonamiento orientado a agentes y flujos de varios pasos, inferido del uso de datos de SFT para agentes.
- Capacidades de matematicas y codigo, coherentes con los datasets `UltraData-Math` y `UltraData-Code` del modelo base.
- Bilinguismo declarado ingles y chino.
- Ejecucion en dispositivo (`on-device`, `edge-ai`): el modelo esta pensado para inferencia local en Apple Silicon con `mlx-lm`, sin depender de servidores remotos.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode); no hay evidencia de ello en la informacion disponible.

## Casos de uso

- Asistente local en Mac: cargando el modelo con `mlx-lm` en un Mac con Apple Silicon, se puede construir un asistente conversacional que funciona sin conexion y sin enviar datos a terceros, con un peso de 1,4 GB en disco y sin necesidad de GPU dedicada.
- Prototipado de agentes con tool calling: el modelo puede integrarse en un bucle de agente que invoque funciones locales (leer ficheros, consultar una API) antes de escalar la logica a un modelo mayor, aprovechando que fue entrenado con datos de agentes.
- Asistencia de codigo en editor local: la presencia de `UltraData-Code` en el entrenamiento sugiere utilidad para autocompletado, explicacion de fragmentos y generacion de tests dentro de un IDE, con la ventaja de no enviar codigo propietario a un servicio externo.
- Clasificacion y enrutado de intenciones en el borde: dado el tamano reducido y la cuantizacion a 4 bits, es viable ejecutar clasificacion de tickets, etiquetado o enrutado de peticiones dentro de una aplicacion de escritorio o movil con presupuesto de memoria limitado.
- Resumen y extraccion de informacion en documentos largos: si se confirma la ventana de contexto extendida, puede resumir actas, informes o hilos de correo directamente en local; conviene verificar antes la longitud real soportada, ya que no esta publicada.
- Atencion al cliente en ingles y chino: conversaciones multi-turno con contexto largo para preguntas frecuentes o soporte de primer nivel, limitado a los dos idiomas declarados.
- Evaluacion comparativa de cuantizaciones: sirve como referencia 4-bit frente a la version FP16 del modelo base para medir la degradacion introducida por la cuantizacion en tareas concretas del propio proyecto.
- Generacion de texto aumentada por recuperacion (RAG) en local: combinado con una base vectorial embebida, permite responder sobre documentacion interna sin salida de datos, siempre que la ventana de contexto real sea suficiente para concatenar los fragmentos recuperados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio MLX ni los resultados de busqueda web consultados contienen cifras de MMLU, HumanEval, GSM8K, C-Eval u otras evaluaciones. Tampoco hay datos de latencia, tokens por segundo ni comparacion medida frente al modelo base en FP16, por lo que no es posible cuantificar la perdida de calidad atribuible a la cuantizacion a 4 bits.

## Requisitos de hardware

- Pesos en disco: 1,4 GB para esta version de 4 bits. La version sin cuantizar del modelo base, en FP16, rondaria los 5 GB, y en 8 bits unos 2,6 GB.
- Memoria: el formato MLX requiere Apple Silicon (serie M) y memoria unificada. Con 8 GB de memoria unificada el modelo de 4 bits es ejecutable con contextos cortos; 16 GB o mas es lo recomendable para ventanas de contexto largas, ya que la cache KV crece con la longitud de la secuencia.
- GPU compatibles: no aplica a GPU NVIDIA o AMD en este repositorio, porque MLX solo se ejecuta en Apple Silicon. Para CUDA habria que usar el modelo base `openbmb/MiniCPM5-2B` con otro runtime o convertir los pesos.
- Cabe en hardware de consumo: si, en cualquier Mac con chip M1 o posterior y al menos 8 GB de memoria unificada; tambien en iPhone o iPad con chips de la serie A/M recientes mediante MLX, aunque no se documenta en el repositorio.
- Opciones de despliegue: `mlx-lm` (libreria y CLI), `mlx-lm.server` para exponer una API compatible con OpenAI, y aplicaciones que integren MLX como LM Studio. Para vLLM, TGI, llama.cpp u Ollama seria necesario partir del modelo base o generar una conversion GGUF, que no se incluye aqui.
- Latencia y throughput: no disponible. Al tratarse de una inferencia limitada por ancho de banda de memoria, el rendimiento dependera del chip concreto (M1, M2, M3, M4 y sus variantes Pro, Max, Ultra) y de la longitud de contexto, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| adrgrondin/MiniCPM5-2B-mlx-4Bit | 2.516.756.480 | No disponible | Apache 2.0 | Safetensors MLX 4 bits | Conversion de terceros, 1,4 GB, solo Apple Silicon |
| openbmb/MiniCPM5-2B | 2.516.756.480 | No disponible | Apache 2.0 | Safetensors (transformers) | Modelo base oficial, sin cuantizar, portable a otros runtimes |
| Alternativas de la misma categoria | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | Familias candidatas a comparar: Qwen2.5-1.5B-Instruct, Llama-3.2-3B-Instruct y Gemma-2-2B-it, cuyas especificaciones no se han podido verificar con la informacion recogida |

La comparacion relevante y verificable se limita, por tanto, al par formado por esta cuantizacion y su modelo base. Cualquier comparacion con otras familias requeriria consultar sus model cards oficiales, ya que en la informacion disponible no hay datos de parametros, contexto ni evaluaciones de terceros. La busqueda web realizada no devolvio resultados relacionados con el modelo.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks publicados de esta cuantizacion ni del modelo base en la informacion disponible, por lo que el rendimiento real es una incognita.
- Validacion comunitaria nula: el repositorio registra 0 descargas y 0 interacciones, y la conversion la firma un tercero, no OpenBMB. No hay garantia de fidelidad al modelo original.
- Degradacion por cuantizacion: la cuantizacion a 4 bits suele afectar de forma mas acusada a tareas de matematicas, codigo y razonamiento de varios pasos. No se documenta el metodo ni se aporta comparacion con FP16.
- Idiomas limitados: solo ingles y chino estan declarados. El uso en castellano no esta respaldado por la model card y puede degradar la calidad, pese a que los modelos multilingues suelen transferir parcialmente.
- Ventana de contexto desconocida: la etiqueta `long-context` no viene acompanada de una cifra, lo que impide dimensionar la cache KV y planificar casos de uso con documentos extensos.
- Riesgo de alucinacion: un modelo denso de 2,5B tiene una capacidad limitada de conocimiento factual y una propension alta a inventar datos, especialmente fuera de sus dominios de entrenamiento.
- Sesgos del corpus: el preentrenamiento sobre `Ultra-FineWeb` y corpus de codigo y matematicas hereda los sesgos de esas fuentes, con poca presencia de contenido en castellano.
- Portabilidad restringida: el formato MLX solo se ejecuta en Apple Silicon. No es desplegable en infraestructura CUDA sin reconvertir los pesos al modelo base.
- Plantilla de chat no documentada: la model card delega en `apply_chat_template` sin mostrar la plantilla. Conviene inspeccionar el tokenizador y validar el formato de tool calling antes de usarlo en produccion, ya que un formato incorrecto degrada las respuestas.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, con obligacion de conservar avisos de copyright y licencia; al ser un derivado, deben cumplirse tambien las condiciones del modelo base, que es igualmente Apache 2.0.
- Fechas y trazabilidad: los metadatos indican creacion en septiembre de 2026 y nombres de datasets con sufijos numericos (`UltraData-SFT-2605`, `UltraData-RL-2609`) que no se han podido verificar de forma independiente.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/adrgrondin/MiniCPM5-2B-mlx-4Bit
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Libreria de conversion y ejecucion: `mlx-lm` (mencionada en la model card en su version 0.31.2; repositorio en https://github.com/ml-explore/mlx-lm)
- Datasets citados por el modelo base: https://huggingface.co/datasets/openbmb/Ultra-FineWeb, https://huggingface.co/datasets/openbmb/UltraX-Preview, https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3, https://huggingface.co/datasets/openbmb/UltraData-Math, https://huggingface.co/datasets/openbmb/UltraData-Code, https://huggingface.co/datasets/openbmb/UltraData-SFT-2605, https://huggingface.co/datasets/openbmb/UltraData-SFT-Agent-2609, https://huggingface.co/datasets/openbmb/UltraData-RL-2609
- Paper o blog oficial del modelo MiniCPM5-2B: no disponible en la informacion proporcionada
- Demo o espacio de pruebas: no disponible en la informacion proporcionada
- Nota sobre la busqueda web: los resultados recuperados correspondian a paginas de ayuda de YouTube y no guardan ninguna relacion con el modelo, por lo que no se han incluido.
