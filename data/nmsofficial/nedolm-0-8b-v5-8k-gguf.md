# nmsofficial/NedoLM-0.8B-V5-8K-GGUF

## Resumen

NedoLM-0.8B-V5-8K-GGUF es un artefacto de pesos en formato GGUF publicado por el usuario nmsofficial en HuggingFace. Se trata de la exportación cuantizada en Q4_K_M del checkpoint denominado "step 320" del modelo Mercan/NedoLM V5, obtenido mediante un proceso de preentrenamiento continuado (CPT, *continued pre-training*) orientado a contexto largo. El modelo tiene aproximadamente 823 millones de parámetros (823.140.352 según los datos de safetensors) y está empaquetado específicamente para su ejecución en un dispositivo Android de prueba.

El propósito declarado del repositorio no es distribuir un modelo generalista, sino servir como artefacto de prueba de completado de texto con una ventana de 8.192 tokens. El autor indica explícitamente que, aunque la configuración de entrenamiento admite 32.768 tokens de contexto, la recuperación a 31K no superó la puerta de aceptación del proyecto, por lo que este build se presenta como "8K completion test build" y no como un modelo de 32K validado. La licencia es Apache-2.0 y el único idioma declarado es el turco (tr).

La relevancia del modelo es acotada y muy específica: demuestra un flujo de despliegue de extremo a extremo en el que una aplicación Android descarga el GGUF una sola vez, verifica su SHA-256, lo almacena en el espacio privado de la aplicación y ejecuta la inferencia en local sin conexión. Su arquitectura se identifica como "nedolm" dentro de un fork propio de llama.cpp, lo que implica que no es un GGUF estándar de Llama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; el identificador de arquitectura del GGUF es `nedolm` (fork propio de llama.cpp). Por compatibilidad con llama.cpp se presume transformer decoder-only, pero no se confirma en la informacion proporcionada |
| Parametros totales | 823.140.352 (~0,823 B) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | 8.192 tokens en este artefacto. La configuracion de entrenamiento admite 32.768, pero no se valido a 31K |
| Tipos de cuantizacion | Q4_K_M (unico presente en este repositorio) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`general.architecture = nedolm`) |
| Libreria | llama.cpp |
| Tamano del repositorio | 0,6 GB |
| SHA-256 | `c59d6fe287aefa34399cebb964eef6dade8b50e4a4a2d8168e8c67b16723dee8` |
| Checkpoint de origen | Mercan/NedoLM V5, CPT "coherent-long", step 320 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-17 |
| Ultima actualizacion | 2026-09-17 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Lo unico confirmado es que el GGUF declara `general.architecture = nedolm`, un identificador propio que requiere un fork específico de llama.cpp para su carga. No se detalla si se trata de un transformer denso convencional, de una variante con atención lineal o de una arquitectura híbrida; tampoco se especifican las dimensiones de las capas, el número de cabezas de atención ni el vocabulario. Dado que el modelo se ejecuta mediante llama.cpp y que su tarea principal es el completado de texto, se trata con alta probabilidad de un decoder-only autorregresivo, pero esto no está confirmado en la documentación facilitada.

En cuanto al entrenamiento, la model card indica que el artefacto procede de un preentrenamiento continuado (CPT) sobre el checkpoint V5 de Mercan/NedoLM, en una fase denominada "coherent-long", y que el paso concreto es el 320. No se indica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. Tampoco se detalla el proceso de cuantización más allá del tipo Q4_K_M. La innovación técnica que se puede verificar empíricamente es el patrón de despliegue: verificación de integridad por SHA-256 en el cliente y ejecución totalmente offline en Android.

## Capacidades

- Generacion de texto y completado de texto (text-generation), que es la tarea declarada en el pipeline del repositorio.
- Recuperacion de informacion en contexto (*retrieval*) hasta 8.192 tokens con una tasa de acierto perfecta segun la evaluacion del autor.
- Ejecucion offline en dispositivo movil: la aplicacion Android descarga el GGUF una vez, comprueba el hash y opera sin red.
- Idioma: turco, unico idioma declarado en las etiquetas y en el campo `language`.
- Capacidades multilingues: no disponibles; no se declara ningun idioma adicional.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio, modo "thinking" u otras capacidades especiales: no disponibles.

## Casos de uso

- Autocompletado de texto en aplicaciones Android sin conexion: el modelo se descarga como GGUF de 0,6 GB, se verifica por SHA-256 y se ejecuta en local, lo que permite sugerencias de escritura en turco sin enviar datos a un servidor.
- Procesamiento de texto en el borde (*edge computing*) con requisitos de privacidad: al no necesitar red tras la descarga inicial, es adecuado para escenarios en los que el texto no puede salir del dispositivo, como notas personales o borradores.
- Recuperacion sobre documentos de hasta 8K tokens: la evaluacion del autor muestra retrieval=1.000 a 4K y 8K, por lo que es viable para responder preguntas sobre documentos cortos embebidos en el prompt.
- Integracion en pruebas de humo de pipelines de inferencia: sirve como artefacto de validacion para comprobar que un fork de llama.cpp, un runtime movil o un sistema de verificación de hashes funciona correctamente antes de desplegar modelos mayores.
- Generacion de texto asistida en aplicaciones de mensajeria o teclados predictivos en turco, siempre que la latencia y el consumo energetico del dispositivo lo permitan.
- Prototipado e investigacion sobre contexto largo: el degradado de recuperacion entre 8K y 31K documentado por el autor permite estudiar como se pierde la capacidad de recuperacion al ampliar la ventana en un modelo de menos de 1.000 millones de parametros.
- Experimentacion con cuantizacion Q4_K_M en modelos sub-1B, midiendo la perdida de calidad respecto al checkpoint original sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de evaluacion aportado por el autor es una prueba de recuperacion en contexto (*retrieval*) de 8 opciones, con azar = 0,125:

| Longitud de contexto | Precision de retrieval |
|---|---|
| 4K | 1,000 |
| 8K | 1,000 |
| 12K | 0,531 |
| 16K | 0,688 |
| 24K | 0,375 |
| 31,2K | 0,156 |

Todos los valores corresponden al checkpoint step 320 tal como aparecen en la model card. No se dispone de comparaciones con otros modelos bajo el mismo protocolo de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: aproximadamente 0,6-1,0 GB considerando pesos mas cache KV para 8K tokens. Es una estimacion a partir de los 0,823 B de parametros y el tamano de repositorio de 0,6 GB, no un dato publicado.
- GPU recomendadas: no disponibles. Por tamano, cualquier GPU con al menos 2 GB de memoria libre deberia poder alojarlo.
- Cabe en GPU de consumo: si, previsiblemente en cualquier GPU de consumo moderna (por ejemplo, series GTX 10xx en adelante con 4 GB o mas). No hay confirmacion oficial.
- Movil: si, es el objetivo declarado del artefacto, ejecutado desde una aplicacion Android de prueba.
- Opciones de despliegue: llama.cpp, pero exclusivamente mediante el fork propio de NedoLM, ya que el GGUF declara `general.architecture = nedolm`. No hay confirmacion de compatibilidad con vLLM, Ollama, TGI u otros runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los datos de esta tabla corresponden a las model cards publicas de los modelos citados y no forman parte de la informacion proporcionada en esta ficha. No se dispone de comparaciones de rendimiento bajo un mismo protocolo.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Formato |
|---|---|---|---|---|---|
| NedoLM-0.8B-V5-8K-GGUF | 0,823 B | 8.192 (32.768 en config, no validado) | Apache-2.0 | Turco | GGUF (`nedolm`) |
| Qwen2.5-0.5B | ~0,49 B | 32.768 | Apache-2.0 | Multilingue | safetensors, GGUF |
| Llama-3.2-1B | 1,24 B | 128.000 | Llama 3.2 Community License | Multilingue | safetensors, GGUF |
| SmolLM2-360M | 0,362 B | ~8.192 | Apache-2.0 | Ingles principalmente | safetensors, GGUF |

Comparativa de rendimiento: no disponible.

## Limitaciones y advertencias

- Naturaleza del artefacto: el propio autor lo describe como un "8K completion test build" para una aplicacion Android de prueba, no como un modelo de proposito general listo para produccion.
- Contexto degradado: aunque la configuracion de entrenamiento admite 32.768 tokens, el retrieval cae a 0,531 a 12K, 0,688 a 16K, 0,375 a 24K y 0,156 a 31,2K. No debe usarse como modelo de contexto largo mas alla de 8K.
- Compatibilidad de runtime: el campo `general.architecture = nedolm` implica que el GGUF requiere un fork especifico de llama.cpp. Cargarlo con builds estandar puede fallar o producir resultados incorrectos.
- Idioma: solo turco. No hay evidencia de capacidades en castellano ni en otros idiomas.
- Sesgos conocidos: no disponible. No se documenta la composicion del dataset ni el proceso de filtrado, por lo que no se puede evaluar el sesgo.
- Riesgo de aluscinacion: no cuantificado. No se han publicado evaluaciones de veracidad ni de tasas de alucinacion.
- Alineacion: no se documenta el uso de RLHF, DPO o SFT, por lo que no hay garantias sobre el seguimiento de instrucciones ni sobre seguridad en las salidas.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en los datos proporcionados, sin comunidad ni soporte verificado.
- Licencia: Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar la procedencia del checkpoint base Mercan/NedoLM V5 y de los datos de entrenamiento.
- Integridad: el SHA-256 publicado (`c59d6fe287aefa34399cebb964eef6dade8b50e4a4a2d8168e8c67b16723dee8`) debe verificarse antes de ejecutar el modelo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nmsofficial/NedoLM-0.8B-V5-8K-GGUF
- Checkpoint base citado en la model card: Mercan/NedoLM V5 (no se ha proporcionado URL directa)
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada
- Resultados de busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a contenidos de television infantil danesa (DR Ramasjang) y no guardan relacion con el modelo.
