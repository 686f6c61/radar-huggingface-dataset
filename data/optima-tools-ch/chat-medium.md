# optima-tools-ch/chat-medium

## Resumen

Optima Tools Chat Medium es un paquete de distribucion verificado del modelo Gemma 4 26B-A4B (instruction-tuned) de Google DeepMind, preparado por el usuario optima-tools-ch para su uso dentro de la aplicacion Optima Tools. Se publica como repositorio GGUF que contiene dos ficheros: el modelo de lenguaje cuantizado en Q5_K_M (19,32 GB) y el proyector multimodal en BF16 (1,19 GB), necesario para el analisis de imagenes. La tarea declarada en el pipeline es image-text-to-text, por lo que el paquete esta orientado a entrada multimodal (texto e imagen) y salida de texto.

El modelo base, google/gemma-4-26B-A4B-it, es una variante de la familia Gemma 4 de Google. El sufijo A4B indica una arquitectura de mezcla de expertos (MoE) con aproximadamente 4 mil millones de parametros activos sobre un total de 26 mil millones, aunque esta ficha no dispone de la model card oficial del modelo base para confirmar detalles de contexto, composicion del dataset o proceso de alineamiento. El repositorio no aporta informacion tecnica mas alla de la cuantizacion y de los hashes de integridad.

La relevancia de este repositorio es operativa, no cientifica: actua como espejo con verificacion SHA-256 de una conversion de bartowski, pensado para que la aplicacion Optima Tools descargue ficheros con integridad comprobada. No se anuncia ningun benchmark, prueba de ejecucion ni compatibilidad de hardware. El propio autor advierte de que la verificacion realizada es de integridad, no de funcionamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer con mezcla de expertos (MoE), segun el sufijo A4B del modelo base; detalles no disponibles |
| Parametros totales | 26B (segun el identificador del modelo base) |
| Parametros activos | aproximadamente 4B (segun el sufijo A4B del identificador) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M para el modelo de lenguaje; BF16 para el proyector multimodal |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 39,8 GB |
| Tamano del modelo de lenguaje | 19,32 GB (Q5_K_M) |
| Tamano del proyector multimodal | 1,19 GB (BF16) |
| SHA-256 modelo de lenguaje | 948330216e3cf5aab7c995ffcb9530b1a76dec35a4ce1134db9dd0c1fab96e6b |
| SHA-256 proyector multimodal | b3ee6c97d5a5bb1ae9eb93bf14c1d1b51a0179a45ac1076b195931814c759e1e |
| Pipeline | image-text-to-text |
| Libreria | gguf |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. El identificador google/gemma-4-26B-A4B-it indica una familia Gemma 4 con 26 mil millones de parametros totales y aproximadamente 4 mil millones activos por token, patron tipico de un transformer con capas de mezcla de expertos dispersa. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, tecnicas de alineamiento (RLHF, DPO) ni innovaciones de atencion o decodificacion.

El repositorio documenta unicamente el proceso de empaquetado: la cuantizacion Q5_K_M procede de la revision cb1f989321df6baa8c647aea074fbad465962bb1 del repositorio de bartowski (fechada el 3 de mayo de 2026), mientras que el proyector multimodal BF16 y el README de referencia provienen de la revision 10f3b41bcf8d3047f4e136e7197ffc2dd1654c9d. El autor senala explicitamente que la cuantizacion incluida difiere de la del GGUF de la revision mas reciente del repositorio de origen, que incorpora una chat template actualizada. Los ficheros se transfirieron por duplicacion LFS en el servidor de Hugging Face sin modificacion y los SHA-256 se recalcularon localmente, coincidiendo con los metadatos LFS.

## Capacidades

- Generacion de texto y razonamiento: el modelo base esta instruction-tuned, aunque el repositorio no detalla capacidades concretas.
- Analisis de imagenes: el paquete incluye el proyector multimodal BF16, imprescindible para la entrada image-text-to-text. Sin el, el modelo de lenguaje no procesa imagenes.
- Conversacion multi-turno: el pipeline image-text-to-text y la naturaleza instruction-tuned del modelo base lo permiten, si bien no se documenta la chat template efectiva de esta revision.
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el autor no declara lista de idiomas.
- Capacidades especiales (modo thinking, audio, etc.): no disponibles.

## Casos de uso

- Analisis de imagenes en local: el paquete incluye el proyector multimodal BF16 y el modelo Q5_K_M, de modo que puede desplegarse con llama.cpp para describir, clasificar o extraer informacion de imagenes sin salida a servicios externos. Es adecuado por la combinacion de vision y cuantizacion de 5 bits.
- Asistente conversacional de escritorio: integrado en la aplicacion Optima Tools, el modelo puede gestionar dialogos multi-turno con entrada de texto e imagen. La verificacion SHA-256 del paquete reduce el riesgo de ficheros corruptos en la distribucion.
- Procesamiento de documentos escaneados: con el proyector multimodal, el modelo puede recibir capturas o fotografias de documentos y generar resumenes o extracciones en texto, siempre que el contexto disponible lo permita.
- Despliegue en estaciones de trabajo con GPU unica: los 19,32 GB del modelo Q5_K_M mas 1,19 GB del proyector caben en GPUs de 24 GB o mas, lo que permite inferencia local en un solo equipo.
- Prototipado de pipelines multimodales: al ser GGUF, se integra con llama.cpp y herramientas compatibles para validar flujos image-text-to-text antes de migrar a otros formatos o servicios.
- Distribucion reproducible de modelos: el repositorio incluye SOURCE.json, CREDITS.md y .optima-package.json con hashes y procedencia, lo que sirve como referencia para equipos que necesitan auditar el origen exacto de los pesos que ejecutan.
- Evaluacion comparativa de cuantizaciones: al fijar una revision concreta de bartowski, permite comparar el comportamiento de Q5_K_M frente a otras cuantizaciones del mismo modelo base en tareas de vision y texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se realizo ninguna prueba de ejecucion durante la preparacion del paquete y que no se anuncia ningun rendimiento ni compatibilidad de hardware.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19,32 GB para el modelo de lenguaje en Q5_K_M mas 1,19 GB para el proyector BF16, con overhead adicional de contexto y cache KV no cuantificado.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por volumen de pesos, se requiere una GPU con al menos 24 GB de VRAM para mantener el modelo completo en memoria, aunque el autor no confirma compatibilidad.
- GPU de consumo: cabe tecnicamente en tarjetas de 24 GB (por ejemplo, RTX 3090 o RTX 4090) si el runtime permite cargar los 20,5 GB de pesos mas el contexto; no hay confirmacion del autor.
- Opciones de despliegue: llama.cpp es el runtime implicito, ya que el paquete usa formato GGUF y el proyector debe situarse en el mismo directorio que el modelo. Otros runtimes compatibles con GGUF no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria. Como referencia estructural, el paquete se corresponde con el modelo google/gemma-4-26B-A4B-it y con la conversion GGUF de bartowski del mismo modelo, pero no se dispone de sus fichas tecnicas para comparar contexto, benchmarks o licencia.

## Limitaciones y advertencias

- El repositorio no es el modelo original: es una redistribucion de una cuantizacion de terceros. Cualquier correccion o actualizacion del modelo base debe buscarse en google/gemma-4-26B-A4B-it o en el repositorio de bartowski.
- La cuantizacion Q5_K_M corresponde a una revision concreta (cb1f989321df6baa8c647aea074fbad465962bb1) que no es la mas reciente del repositorio de origen; esta ultima incluye una chat template actualizada. Ejecutar esta version puede producir un formato de prompt distinto al esperado por herramientas recientes.
- La verificacion realizada es de integridad (SHA-256), no de ejecucion: no hay garantia de que el modelo cargue o funcione correctamente en un runtime concreto.
- El proyector multimodal es imprescindible para el analisis de imagenes; sin el, el modelo de lenguaje no procesa entrada visual.
- No se declaran idiomas soportados, por lo que no puede confirmarse el rendimiento en castellano ni en otros idiomas.
- No se han publicado benchmarks ni evaluaciones de sesgo, alucinacion o robustez para este paquete.
- La licencia Apache 2.0 permite uso comercial, pero deben respetarse los derechos de los autores originales (Google DeepMind) y de la conversion (bartowski); el repositorio incluye CREDITS.md y CREDITS.json con la atribucion.
- El autor indica que la descarga desde la aplicacion no esta abierta todavia, lo que limita su uso como canal de distribucion automatizado.
- El repositorio tiene un volumen de 39,8 GB, superior a la suma de los dos ficheros de modelo, por los documentos y posibles duplicados; conviene revisar el manifest antes de descargar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/optima-tools-ch/chat-medium
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Conversion GGUF de referencia: https://huggingface.co/bartowski/google_gemma-4-26B-A4B-it-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt
