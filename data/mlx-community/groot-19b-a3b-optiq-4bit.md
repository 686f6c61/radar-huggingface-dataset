# mlx-community/Groot-19B-A3B-OptiQ-4bit

## Resumen

Groot-19B-A3B-OptiQ-4bit es una cuantización de 4 bits en formato MLX del modelo GrootTeam/Groot-19B-A3B-261023, un modelo de razonamiento multimodal (texto e imagen) post-entrenado a partir de Qwen3.6-35B-A3B. El modelo base emplea una arquitectura Mixture of Experts (MoE) con 128 expertos enrutados por capa y 8 activos por token, lo que resulta en aproximadamente 19.000 millones de parametros totales y unos 3.000 millones activos por token. Esta version cuantizada la publica mlx-community, el colectivo de referencia para pesos optimizados para Apple Silicon, y esta pensada para ejecucion local en equipos Mac con chip de la familia M.

El interes de esta ficha radica en que combina tres elementos poco habituales en un solo artefacto: capacidades multimodales (entrada de imagen y texto), soporte de tool calling y una huella en disco de 13,2 GB frente a los 38,9 GB del checkpoint original en BF16. La cuantizacion es de precision mixta: 118 tensores a 4 bits, 394 a 8 bits y la torre de vision en bf16, con asignacion de bits heredada de otro modelo de la misma familia (Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B) que comparte el mismo esquema de 128 expertos. La licencia es Apache 2.0.

Conviene senalar desde el principio que el autor de la cuantizacion no ejecuto una evaluacion completa de capacidades (Capability Score) antes de publicar, y que no se realizo un barrido de sensibilidad sobre este checkpoint concreto. Las comprobaciones previas a la subida se limitaron a servir el modelo con `optiq serve` y verificar hechos, aritmetica, codigo, una llamada a herramienta y una imagen. Esto condiciona la confianza que puede depositarse en los datos de rendimiento, que practicamente no existen en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), 128 expertos enrutados por capa, 8 activos por token; incluye torre de vision |
| Parametros totales | 18.543.995.648 (aproximadamente 19B) |
| Parametros activos | Aproximadamente 3B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits y 8 bits en precision mixta (118 tensores a 4 bits, 394 a 8 bits); torre de vision en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX), libreria mlx |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de tipo Mixture of Experts: cada capa contiene 128 expertos enrutados y se activan 8 por token, lo que da lugar a una relacion de aproximadamente 19B parametros totales frente a unos 3B activos. Esta configuracion reduce el coste computacional por token en inferencia a cambio de un mayor footprint de memoria en reposo, que es precisamente lo que la cuantizacion de 4 bits mitiga. El modelo incorpora ademas una torre de vision (0,9 GB en el checkpoint cuantizado) que habilita la entrada de imagenes junto con texto, de ahi su pipeline `image-text-to-text`.

El modelo base, GrootTeam/Groot-19B-A3B-261023, se describe como un modelo de razonamiento post-entrenado a partir de Qwen3.6-35B-A3B; no se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO. La cuantizacion OptiQ reutiliza la asignacion de bits por capa del checkpoint Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B, que comparte el mismo layout de 128 expertos, y segun la model card los 512 tensores coincidieron. No se ejecuto un barrido de sensibilidad especifico sobre este checkpoint. El cabezal MTP (multi-token prediction) del modelo fuente no se incluye, ya que no se integra aun en OptiQ y anadiria 0,8 GB sin beneficio practico.

## Capacidades

- Generacion de texto y razonamiento: el modelo se presenta explicitamente como un modelo de razonamiento, con capacidad de producir cadenas de pensamiento antes de la respuesta final.
- Codigo: se verifico el funcionamiento en tareas de codigo durante la validacion previa a la publicacion.
- Aritmetica y conocimiento factual: comprobado en las pruebas de validacion del autor de la cuantizacion.
- Vision: entrada de imagenes a traves de la torre de vision incluida en el checkpoint (bf16), con pipeline `image-text-to-text`.
- Tool calling / function calling: soportado y verificado con al menos una llamada a herramienta en las pruebas previas.
- Conversacion multi-turno: etiquetado como `conversational`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente local en Mac con entrada de imagenes: el modelo puede recibir capturas de pantalla, fotografias o diagramas junto con una pregunta en texto y responder de forma razonada, todo ejecutandose en local sobre Apple Silicon sin enviar datos a la nube. La torre de vision en bf16 preserva la calidad de representacion visual aunque el resto del modelo este cuantizado.
- Automatizacion de tareas con herramientas: gracias al soporte verificado de tool calling, puede integrarse en flujos donde el modelo decide que funcion invocar (consultas a APIs, lectura de ficheros, operaciones sobre bases de datos) y encadenar varios pasos de razonamiento antes de emitir la llamada.
- Prototipado de agentes en estaciones de trabajo Apple: con unos 3B parametros activos por token, el coste por token generado es bajo en comparacion con un modelo denso de 19B, lo que permite iterar rapidamente sobre disenos de agentes multi-paso en un portatil o Mac Studio.
- Analisis de documentacion tecnica con imagenes: extraccion de informacion de diagramas de arquitectura, tablas escaneadas o graficos combinados con texto explicativo, usando el modelo como motor de comprension multimodal en un pipeline local.
- Generacion y revision de codigo en local: el modelo puede emplearse para autocompletar, explicar o revisar fragmentos de codigo dentro de un IDE o un script de CI, manteniendo el codigo fuente en la maquina del desarrollador.
- Educacion y tutoria con soporte visual: resolucion de problemas de matematicas o fisica a partir de la foto de un enunciado, con explicacion paso a paso aprovechando el modo de razonamiento.
- Evaluacion comparativa de cuantizaciones: al ser un artefacto de 4 bits derivado de un BF16 de 38,9 GB, sirve como banco de pruebas para medir la perdida de calidad de OptiQ frente al original en tareas de razonamiento, codigo y vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se ejecuto un Capability Score completo antes de la publicacion y que las comprobaciones se limitaron a hechos, aritmetica, codigo, una llamada a herramienta y una imagen servidas con `optiq serve`. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar para este checkpoint ni para el modelo base en la informacion proporcionada.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 13,2 GB en disco, por lo que se necesita al menos ese espacio en memoria unificada mas el margen para el contexto y las activaciones. En la practica, un Mac con 24 GB o 32 GB de memoria unificada es el minimo razonable; 36 GB o 48 GB dan holgura para contextos largos.
- GPU recomendadas: el formato es MLX, disenado para Apple Silicon (series M1, M2, M3 y M4, con preferencia por variantes Pro, Max y Ultra). No es un checkpoint pensado para GPU NVIDIA o AMD; para esas plataformas habria que recurrir al modelo base en otro formato.
- Cabe en GPU de consumo: si, en equipos Apple Silicon de gama alta con memoria unificada suficiente. No aplica a tarjetas graficas discretas convencionales por el formato MLX.
- Opciones de despliegue: `mlx-optiq` (`optiq serve --model mlx-community/Groot-19B-A3B-OptiQ-4bit`) y `mlx_lm` mediante `load` y `generate`. No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con unos 3B parametros activos, el coste por token deberia ser sustancialmente menor que el de un modelo denso de 19B, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Groot-19B-A3B-OptiQ-4bit (este) | 19B / ~3B | no disponible | MLX safetensors 4/8 bits mixtos | Apache 2.0 | Multimodal, tool calling, solo Apple Silicon |
| GrootTeam/Groot-19B-A3B-261023 (base) | 19B / ~3B | no disponible | safetensors BF16 (38,9 GB) | Apache 2.0 | Referencia de calidad; incluye cabezal MTP; no ejecutable en Mac de gama media |
| Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B | 19B tras REAP (fuente 35B) / no disponible | no disponible | MLX safetensors 4 bits | no disponible en la informacion | Mismo layout de 128 expertos; su asignacion de bits se reutiliza aqui |
| Qwen3.6-35B-A3B (fuente arquitectonica) | 35B / ~3B | no disponible | safetensors | no disponible en la informacion | Mayor footprint; el checkpoint Groot deriva de el mediante post-entrenamiento |

La comparacion con alternativas de otros ecosistemas (por ejemplo, modelos MoE cuantizados en GGUF para llama.cpp) no puede establecerse con datos de rendimiento porque no hay benchmarks publicados para este checkpoint.

## Limitaciones y advertencias

- Ausencia de evaluacion completa: no se ejecuto un Capability Score ni un barrido de sensibilidad sobre este checkpoint; la validacion previa fue cualitativa y limitada a cinco tipos de tarea.
- Asignacion de bits heredada: la distribucion de precision por capa se copio de otro modelo (Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B) asumiendo que los 512 tensores coincidian, sin verificar la sensibilidad especifica de este checkpoint.
- Perdida de calidad por cuantizacion: al pasar de BF16 a una mezcla de 4 y 8 bits es esperable cierta degradacion en tareas sensibles, especialmente en razonamiento largo y matematicas, aunque no se cuantifica en la informacion disponible.
- Cabezal MTP ausente: el checkpoint no incluye el cabezal de multi-token prediction del modelo fuente, por lo que no puede aprovecharse la decodificacion especulativa nativa que este habilitaria.
- Dependencia de plataforma: formato MLX exclusivo para Apple Silicon; no es portable a CUDA, ROCm ni CPU generica sin conversion.
- Idiomas no declarados: la model card no especifica la cobertura linguistica, por lo que no puede asumirse un rendimiento multilingue homogeneo.
- Contexto no declarado: se desconoce la longitud maxima de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- Riesgo de alucinacion: como cualquier modelo generativo, especialmente en modo de razonamiento, puede producir cadenas de pensamiento plausibles pero incorrectas; requiere verificacion en produccion.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el fichero LICENSE del modelo base (GrootTeam/Groot-19B-A3B-261023) para confirmar condiciones adicionales.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/Groot-19B-A3B-OptiQ-4bit
- Modelo base: https://huggingface.co/GrootTeam/Groot-19B-A3B-261023
- Licencia del modelo base: https://huggingface.co/GrootTeam/Groot-19B-A3B-261023/blob/main/LICENSE
- Checkpoint de referencia para la asignacion de bits: https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-OptiQ-4bit-REAP-19B
- Herramienta de cuantizacion mlx-optiq: https://mlx-optiq.com
- Documentacion de mlx-optiq: https://mlx-optiq.com/docs/
- Catalogo de modelos OptiQ: https://mlx-optiq.com/models
