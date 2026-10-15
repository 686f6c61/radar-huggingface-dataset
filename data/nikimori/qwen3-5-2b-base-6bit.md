# nikimori/Qwen3.5-2B-Base-6bit

## Resumen

El modelo nikimori/Qwen3.5-2B-Base-6bit es una conversion cuantizada a 6 bits del modelo base Qwen/Qwen3.5-2B-Base, publicada por el usuario nikimori dentro del ecosistema MLX de Apple. No se trata de un entrenamiento nuevo ni de un ajuste fino: los pesos son los del modelo original, unicamente transformados mediante cuantizacion afina de 6 bits con tamano de grupo 64, empleando `mlx_lm.convert` sobre la version 0.31.3 de mlx-lm. El repositorio ocupa 1,5 GB y contiene 1.881.825.088 parametros, lo que lo situa en la franja de los modelos de aproximadamente 2.000 millones de parametros.

Su relevancia es practica y muy acotada: el autor lo convirtio como modelo de autocompletado para Pretype, una herramienta pensada para Macs con 8 GB de memoria unificada. En ese contexto, el interes no esta en el rendimiento bruto del modelo, sino en la relacion entre tamano en disco y calidad de prediccion: segun la model card, esta build de 6 bits acierta la primera palabra en el 19 % de las 5.649 filas del conjunto de evaluacion de autocompletado de Pretype (17 idiomas), frente al 17 % de la build de 4 bits (diferencia significativa con McNemar pareado, p < 0,001) y empatada con una conversion de 8 bits que ocupa 1,9 GB.

Es, por tanto, un artefacto de interes para desarrolladores que trabajen con MLX sobre Apple Silicon y quieran el mejor compromiso tamano/calidad dentro de esta familia, no un modelo de proposito general para razonamiento, agentes o generacion larga. Al ser un modelo base (no ajustado por instrucciones) y estar empaquetado en formato MLX, su uso queda restringido al ecosistema de Apple y a tareas de completado de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-2B-Base, etiqueta qwen3_5) |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits afina (affine), group size 64; existen builds de 4 y 8 bits referenciadas en la model card |
| Idiomas soportados | no disponible (el conjunto de evaluacion de Pretype cubre 17 idiomas, pero no se documenta el soporte oficial del modelo) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors cuantizados en formato MLX |
| Libreria | mlx (mlx-lm 0.31.3) |
| Tamano del repositorio | 1,5 GB |
| Modelo base | Qwen/Qwen3.5-2B-Base |
| Pipeline | text-generation |
| Fecha de publicacion | 14 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni los datos de entrenamiento del modelo subyacente; esa informacion corresponde al repositorio original Qwen/Qwen3.5-2B-Base y no se reproduce aqui. Lo unico documentado es que se trata de una conversion de pesos sin modificaciones adicionales: el autor indica explicitamente que "los pesos por lo demas no cambian" y que la licencia es la del modelo original (Apache-2.0). No hubo, por tanto, entrenamiento, ajuste por instrucciones, RLHF ni DPO asociados a este repositorio.

La innovacion tecnica es exclusivamente de compresion: cuantizacion afina de 6 bits con `--q-group-size 64`, ejecutada con `mlx_lm.convert -q --q-bits 6` sobre mlx-lm 0.31.3. El resultado son safetensors en el formato propio de MLX, optimizados para la memoria unificada de los chips Apple Silicon. La model card no menciona tecnicas como decodificacion especulativa, atencion lineal ni mezclas de expertos para esta build.

## Capacidades

- Generacion de texto autoregresiva y completado de secuencias, al ser un modelo base sin ajuste por instrucciones.
- Autocompletado de primera palabra validado por el autor sobre un conjunto de 5.649 filas y 17 idiomas, con un 19 % de acierto.
- Ejecucion local en Macs con 8 GB de memoria unificada gracias al peso reducido de la build cuantizada.
- Compatibilidad con la libreria mlx-lm y con la herramienta Pretype, para la que fue convertido.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible (es un modelo base, no un modelo instruct).
- Capacidades multimodales (vision, audio): no disponibles.
- Modo "thinking" o razonamiento explicito: no disponible.
- Capacidades multilingues: no documentadas oficialmente; la unica evidencia indirecta es que el conjunto de evaluacion cubre 17 idiomas, sin desglose de resultados por idioma.

## Casos de uso

- Autocompletado en editores sobre Macs de 8 GB: es el proposito declarado de la conversion. El modelo se integra en Pretype como motor de completado y su ventana de memoria (1,5 GB de pesos) deja margen para el sistema operativo y la aplicacion en equipos de 8 GB.
- Sugerencia de siguiente palabra en interfaces de terminal y REPL: el modelo puede generar continuaciones cortas de comandos o fragmentos de texto con baja latencia en hardware Apple Silicon, aprovechando el soporte nativo de MLX.
- Herramientas de escritura offline: aplicaciones de notas, correo o documentacion que necesiten sugerencias de texto sin enviar datos a la nube, ejecutandose en local sobre memoria unificada.
- Modelo de referencia para comparar cuantizaciones: al existir builds de 4, 6 y 8 bits de la misma base, sirve para medir el compromiso entre tamano en disco y calidad de prediccion en pipelines de compresion MLX (19 % frente a 17 % y 19 %, con 1,5 GB frente a 1,9 GB).
- Prototipado de funciones generativas en aplicaciones macOS: usar mlx-lm para cargar el modelo en un prototipo y validar rapidamente si un modelo de ~1,88 mil millones de parametros cubre la necesidad antes de invertir en infraestructura mayor.
- Generacion por lotes de continuaciones cortas en equipos sin GPU dedicada: al no requerir CUDA, permite ejecutar tareas de completado en portatiles Apple Silicon para preprocesado de texto o generacion de borradores.
- Evaluacion de pipelines de cuantizacion con group size 64: util como caso de estudio reproducible para quien necesite medir el impacto de la cuantizacion afina en modelos de ~2.000 millones de parametros.

## Benchmarks y rendimiento

La unica metrica publicada en la informacion disponible es la tasa de acierto de la primera palabra sobre el conjunto de autocompletado de Pretype (5.649 filas, 17 idiomas):

| Build | Cuantizacion | Tamano | Acierto primera palabra |
|---|---|---|---|
| nikimori/Qwen3.5-2B-Base-6bit | 6 bits afina, group size 64 | 1,5 GB | 19 % |
| Build de 4 bits (referenciada en la model card, sin ID) | 4 bits | no disponible | 17 % (McNemar pareado p < 0,001 frente a 6 bits) |
| Conversion de 8 bits (referenciada en la model card, sin ID) | 8 bits | 1,9 GB | 19 % (empate con 6 bits) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5-1,6 GB para los pesos cuantizados, mas la memoria del cache KV, cuyo tamano depende de la longitud de contexto (no documentada).
- Hardware objetivo: Macs con 8 GB de memoria unificada, segun declara el autor; el modelo fue convertido especificamente para Pretype en ese perfil de equipo.
- GPU dedicadas (A100, H100, RTX 4090): no aplica de forma nativa, ya que los pesos estan en formato MLX cuantizado. Su uso en CUDA requeriria convertir los pesos a otro formato, algo no documentado en la model card.
- Cabe en GPU de consumo: no en su formato actual (MLX); equivalentes no cuantizados de ~2.000 millones de parametros si caben en GPUs de consumo, pero esta build concreta no es directamente cargable fuera del ecosistema Apple.
- Opciones de despliegue: mlx-lm (carga y generacion mediante `load` y `generate`) y Pretype. No se documentan vLLM, llama.cpp, Ollama ni TGI para estos pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | Acierto primera palabra (Pretype) | Licencia |
|---|---|---|---|---|---|
| nikimori/Qwen3.5-2B-Base-6bit | 1,88 mil millones | 6 bits, group size 64 | 1,5 GB | 19 % | Apache-2.0 |
| Build de 4 bits del mismo autor (sin ID) | 1,88 mil millones | 4 bits | no disponible | 17 % | Apache-2.0 |
| Conversion de 8 bits del mismo autor (sin ID) | 1,88 mil millones | 8 bits | 1,9 GB | 19 % | Apache-2.0 |
| Qwen/Qwen3.5-2B-Base (upstream) | 1,88 mil millones | sin cuantizar | no disponible | no disponible | Apache-2.0 |

No se dispone de datos para comparar con modelos alternativos de otros desarrolladores de la misma categoria en la informacion proporcionada; la comparativa se limita a las variantes de cuantizacion de la misma base.

## Limitaciones y advertencias

- Es un modelo base, no un modelo ajustado por instrucciones: no ofrece seguimiento de instrucciones, dialogo estructurado ni formato de chat, a pesar de la etiqueta "conversational" del repositorio.
- La tasa de acierto de primera palabra es del 19 %, lo que implica que en aproximadamente cuatro de cada cinco casos la prediccion no coincide con la referencia; no es adecuado como sistema de autocompletado de alta precision sin validacion adicional.
- Toda la evidencia de rendimiento procede de un unico conjunto de evaluacion interno de Pretype; no hay validacion independiente ni benchmarks estandar publicados.
- No se documenta la longitud de contexto soportada, lo que impide planificar usos con ventanas largas.
- No se documentan los idiomas oficialmente soportados ni el rendimiento desglosado por idioma, pese a que la evaluacion cubre 17 idiomas.
- Los pesos estan en formato MLX cuantizado: no son cargables directamente por vLLM, llama.cpp, Ollama, TGI u otros motores fuera del ecosistema Apple, lo que limita su portabilidad y su uso en servidores con GPU.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni medidas de mitigacion; al tratarse de un modelo base sin alineamiento, cabe esperar tanto sesgos heredados del corpus de entrenamiento original como generacion de contenido facticamente incorrecto.
- Licencia Apache-2.0: permite uso comercial, pero al derivar de Qwen/Qwen3.5-2B-Base conviene revisar las condiciones del repositorio original y las de cualquier componente adicional.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe una comunidad de usuarios que haya validado su comportamiento en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nikimori/Qwen3.5-2B-Base-6bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Proyecto Pretype: https://github.com/nikiomori/Pretype
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los resultados obtenidos correspondian a sitios sin relacion con el contenido tecnico solicitado.
