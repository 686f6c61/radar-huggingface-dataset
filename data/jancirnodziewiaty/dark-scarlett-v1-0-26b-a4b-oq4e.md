# jancirnodziewiaty/Dark-Scarlett-v1.0-26B-A4B-oQ4e

## Resumen

Dark-Scarlett-v1.0-26B-A4B-oQ4e es una version cuantizada a 4 bits del modelo ReadyArt/Dark-Scarlett-v1.0-26B-A4B, publicada por el usuario jancirnodziewiaty. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos orientada a ejecucion local en hardware de Apple: el repositorio declara la libreria mlx y el formato de pesos MLX safetensors, con 25.805.936.206 parametros totales verificados en los ficheros safetensors y un tamano de repositorio de 15,8 GB.

La cuantizacion se ha realizado con oQ (oMLX v0.6.4) en modo de precision mixta, con 4 bits y group size 64. La model card indica que el autor intento conservar el modulo MTP (multi-token prediction) del modelo base gemma-4-26B-A4B-it y que este degradaba el rendimiento, por lo que se elimino en esta version. El nombre del modelo sigue la nomenclatura "26B-A4B", que en la familia Gemma 4 designa una arquitectura de mezcla de expertos con aproximadamente 4.000 millones de parametros activos por token, aunque la model card no confirma explicitamente este extremo.

Su relevancia es acotada y muy concreta: es una de las pocas opciones publicas para ejecutar un modelo de ~26B en Mac con memoria unificada mediante MLX, a costa de no disponer de licencia declarada, benchmarks publicados ni validacion de la comunidad (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4; la nomenclatura A4B del nombre sugiere mezcla de expertos, pero no se confirma en la model card |
| Parametros totales | 25.805.936.206 (25,8 mil millones), dato real de los safetensors |
| Parametros activos | no disponible (el sufijo A4B apunta a ~4.000 millones, sin confirmacion oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, precision mixta (oQ / oMLX v0.6.4), group size 64 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (cuantizados en 4 bits) |
| Modelo base | ReadyArt/Dark-Scarlett-v1.0-26B-A4B |
| Libreria de inferencia | mlx |
| Tamano del repositorio | 15,8 GB |
| Fecha de publicacion | 20 de septiembre de 2026 (ultima actualizacion: 21 de septiembre de 2026) |

## Arquitectura y entrenamiento

No hay informacion sobre el entrenamiento del modelo original ni del ajuste que dio lugar a Dark-Scarlett-v1.0. La model card de esta version documenta unicamente el proceso de cuantizacion: se parte de ReadyArt/Dark-Scarlett-v1.0-26B-A4B, que a su vez deriva de la familia gemma-4-26B-A4B-it segun el propio texto de la ficha, y se aplica cuantizacion de precision mixta con oQ sobre oMLX v0.6.4, fijando 4 bits y group size 64.

El unico detalle tecnico relevante aportado por el autor es la decision de excluir el modulo MTP (multi-token prediction) presente en el modelo base, porque su inclusion reducia el rendimiento medido. Esta eleccion puede afectar al throughput en decodificacion, ya que MTP suele emplearse como mecanismo de decodificacion especulativa o de prediccion multiple de tokens. No se documentan ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF, DPO o similares.

## Capacidades

La model card no documenta capacidades funcionales; solo describe la cuantizacion. Por tanto:

- Generacion de texto: no documentada explicitamente, aunque es la funcion esperada de un modelo de este tipo.
- Razonamiento, matematicas y generacion de codigo: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Modulo MTP: explicitamente eliminado en esta version.

## Casos de uso

Dado que no existen benchmarks ni validacion publica, los siguientes casos son escenarios plausibles derivados del formato de despliegue (MLX, 4 bits) y no capacidades verificadas del modelo.

- Inferencia local en Mac con memoria unificada: el modelo ocupa unos 15,8 GB en disco y se carga en MLX, por lo que un Mac con 32 GB de memoria unificada puede ejecutarlo sin GPU dedicada. Es el caso de uso principal y el unico respaldado por la informacion disponible.
- Prototipado de aplicaciones de lenguaje sin coste de API: permite iterar sobre prompts y pipelines en local antes de decidir si se migra a un modelo mayor o a un servicio en la nube.
- Generacion de texto creativo y conversacional: el nombre del modelo y su linaje apuntan a un ajuste de tipo personaje o rol, aunque no hay documentacion que lo confirme; encajaria en herramientas de escritura asistida o chatbots de entretenimiento.
- Experimentacion con cuantizacion de precision mixta: sirve como caso de estudio para comparar el impacto de oQ con 4 bits y group size 64 frente al modelo base sin cuantizar.
- Evaluacion comparativa de formatos MLX frente a GGUF: util para equipos que quieran medir latencia y consumo de memoria en Apple Silicon antes de estandarizar un formato de despliegue.
- Uso como base para nuevos ajustes finos (LoRA/QLoRA) en Mac: al ser un modelo de 25,8B en 4 bits, es viable ajustarlo parcialmente en equipos con 32-64 GB de memoria unificada, siempre que la licencia lo permita (extremo no aclarado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no ha devuelto resultados relacionados con el modelo (unicamente paginas corporativas de Microsoft, sin relacion con este repositorio).

Tampoco se ofrecen datos de latencia, throughput ni comparacion de perplejidad entre la version cuantizada y el modelo base.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 15,8 GB. Con memoria para el contexto (KV cache) y sobrecarga de runtime, se recomienda un minimo de 20-24 GB de memoria unificada; 32 GB o mas es lo aconsejable.
- GPU compatibles: MLX esta disenado para Apple Silicon (series M1, M2, M3 y M4, y sus variantes Pro, Max y Ultra). No se documenta soporte para CUDA ni ROCm.
- GPU de consumo: cabe en equipos Apple con memoria unificada de 24 GB o superior; en Mac con 16 GB no hay margen suficiente. No hay ruta de despliegue documentada para RTX 4090, A100 o H100.
- Opciones de despliegue: mlx / mlx-lm (Apple). vLLM, TGI, llama.cpp y Ollama no estan soportados por el repositorio tal como esta publicado; requeririan una conversion de formato no incluida.
- Latencia y throughput: no disponible.
- Almacenamiento: 15,8 GB para los pesos, mas espacio adicional si se guardan copias en otros formatos.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dark-Scarlett-v1.0-26B-A4B-oQ4e (este) | 25,8B (4 bits, oQ) | MLX safetensors | no disponible | no disponible | 0 descargas, 0 likes |
| ReadyArt/Dark-Scarlett-v1.0-26B-A4B (base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | modelo de origen del que deriva esta cuantizacion |

No se dispone de datos sobre otros modelos comparables de la misma categoria (mismo tamano, misma arquitectura o mismo formato MLX) en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia. Al derivar de la familia gemma-4-26B-A4B-it, es probable que apliquen los terminos de uso de Gemma, pero esto no esta confirmado. No se debe asumir uso comercial libre sin verificar la licencia del modelo base y del ajuste intermedio.
- Ausencia total de benchmarks: no hay ninguna metrica que permita estimar la calidad del modelo, ni comparaciones con el modelo base sin cuantizar.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay informes de terceros sobre comportamiento, alucinaciones o estabilidad.
- Perdida de calidad por cuantizacion: la conversion a 4 bits con group size 64 introduce degradacion respecto a los pesos originales, cuyo alcance no se ha medido ni documentado.
- Eliminacion del modulo MTP: segun el autor, incluirlo reducia el rendimiento, por lo que se descarto; se desconoce el impacto de esta decision sobre la velocidad de decodificacion final.
- Idiomas y contexto desconocidos: no se declara lista de idiomas ni longitud de contexto, datos criticos para planificar despliegues multilingues o con prompts largos.
- Riesgo de alucinacion: no cuantificado ni documentado. Al tratarse de un ajuste comunitario sin evaluacion publica, no se recomienda su uso en dominios donde los errores factuales tengan consecuencias (salud, legal, finanzas).
- Sesgos: no evaluados. El nombre del modelo sugiere un ajuste orientado a personaje o ficcion, un tipo de ajuste que tiende a reforzar estilos y sesgos del dataset original, no auditado en este caso.
- Dependencia de plataforma: solo Apple Silicon. No hay ruta oficial para CUDA, lo que limita su uso en servidores convencionales y en produccion escalable.
- Datos de fecha: el repositorio esta fechado en septiembre de 2026, sin historial de versiones ni issues abiertas que aporten contexto adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jancirnodziewiaty/Dark-Scarlett-v1.0-26B-A4B-oQ4e
- Modelo base: https://huggingface.co/ReadyArt/Dark-Scarlett-v1.0-26B-A4B
- Repositorio de la herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx

Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los enlaces devueltos corresponden a paginas corporativas de Microsoft y no guardan relacion con el repositorio.
