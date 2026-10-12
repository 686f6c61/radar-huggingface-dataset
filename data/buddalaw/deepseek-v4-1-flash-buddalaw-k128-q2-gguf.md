# buddalaw/DeepSeek-V4.1-Flash-buddalaw-K128-Q2-GGUF

## Resumen

DeepSeek-V4.1-Flash-buddalaw-K128-Q2-GGUF es una cuantización de 2 bits del modelo DeepSeek-V4.1-Flash, publicada por el usuario buddalaw y orientada específicamente al trabajo jurídico en italiano: redacción de escritos, emisión de dictámenes y búsqueda documental con uso de herramientas. No es un modelo nuevo ni un ajuste fino, sino una reconstrucción del modelo base en la que se conservan activos, de media, 128 de los 384 expertos enrutados por capa (entre 96 y 185 según la capa); el resto queda desactivado en el router y el motor de inferencia nunca los lee.

El modelo base es una arquitectura de mezcla de expertos (MoE) con 754.638.867.584 parámetros totales y 15.360 expertos enrutados en total, de los cuales 5.120 permanecen activos en esta build, con 6 expertos seleccionados por token. La innovación principal de esta ficha no está en el entrenamiento, sino en la gestión de memoria: aunque el archivo GGUF ocupa 340,6 GiB en disco, los pesos que el motor carga en memoria bajan de los ~152 GiB de una cuantización de 2 bits completa a unos ~65 GiB con todos los expertos activos en RAM (~41 GiB si se cachea la mitad), gracias al streaming desde SSD implementado por el motor ds4.

Es relevante ahora porque demuestra una vía práctica para ejecutar modelos MoE de escala frontera en hardware de gama alta pero no de centro de datos, a costa de sacrificar generalidad: el propio autor advierte de que el rendimiento fuera del dominio jurídico italiano se degrada notablemente. La licencia es MIT, heredada del modelo base, y el repositorio se publicó el 11 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); 384 expertos enrutados por capa |
| Parametros totales | 754.638.867.584 (~754,6 mil millones) |
| Parametros activos | No disponible; el autor indica que se activan 6 expertos por token, pero no publica el recuento de parametros activos |
| Longitud de contexto | No disponible de forma oficial; el ejemplo de uso emplea 32.768 tokens y las pruebas de calidad se realizaron con contexto completo de hasta 156.000 tokens |
| Tipos de cuantizacion | GGUF de 2 bits: IQ2_XXS en `gate`/`up` y Q2_K en `down`; el resto de tensores se mantiene como en el lanzamiento MXFP4 |
| Idiomas soportados | Italiano (`it`); el autor indica explicitamente que no es un modelo de proposito general |
| Licencia | MIT |
| Formato de pesos | GGUF (archivo unico `DeepSeek-V4.1-Flash-Q2-buddalaw-K128.gguf`) |
| Expertos enrutados totales | 15.360 |
| Expertos activos en esta build | 5.120 (media de 128 por capa; rango de 96 a 185 segun la capa) |
| Tamano del archivo en disco | 340,6 GiB, de los cuales 189 GiB corresponden a tablas Engram |
| Tamano del repositorio | 365,7 GB |
| Motor de inferencia | ds4 (CUDA o Metal) |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos con enrutamiento disperso: 384 expertos enrutados por capa y un total de 15.360 expertos, lo que implica 40 capas. En una ejecución normal cada token activa 6 expertos. Esta build concreta aplica una máscara sobre el router que desactiva permanentemente 10.240 expertos y deja activos 5.120, con una distribución no uniforme por capa que va de 96 a 185 expertos. Los expertos desactivados permanecen en el archivo pero con sus pesos a cero, de modo que el router nunca los selecciona y el resultado es exacto respecto a la configuración enmascarada. El autor advierte de que retirar la máscara no mejora nada: los expertos volverían a seleccionarse pero no aportarían contribución alguna al cálculo.

No se trata de un modelo reentrenado: no hay información sobre datasets, número de tokens de entrenamiento, composición del corpus, RLHF o DPO, ni sobre el proceso de destilación. Toda la innovación descrita en la model card es de cuantización y despliegue. La parte fija del modelo (atención, experto compartido, router y embeddings) ocupa 9,4 GiB, mientras que la tabla de expertos activos suma 47,5 GiB y las tablas Engram, de 189 GiB, se leen directamente desde disco. El motor ds4 implementa streaming desde SSD con caché configurable de expertos, lo que permite ajustar el equilibrio entre memoria residente y lecturas de disco.

## Capacidades

- Generación de texto en italiano con traza de razonamiento explícita, incluyendo respuestas y llamadas a herramientas dentro de la misma secuencia.
- Redacción y revisión de documentos jurídicos: escritos, dictámenes y textos argumentativos en el dominio legal italiano.
- Uso de herramientas y function calling, tal como se documenta en la evaluación de calidad, que mide también las llamadas a herramientas generadas.
- Razonamiento multi-paso orientado a tareas de investigación jurídica, con soporte del motor `ds4-agent` para flujos agénticos.
- Manejo de contexto largo: las pruebas de fidelidad se realizaron con contexto completo de hasta 156.000 tokens, y la configuración de ejemplo permite 32.768 tokens.
- Capacidad multilingüe no disponible: el único idioma declarado es el italiano, y el autor señala que fuera de dominio el comportamiento se degrada de forma marcada.
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Redacción de escritos judiciales: el modelo puede generar borradores de demandas, recursos y alegaciones en italiano jurídico, ajustándose a la estructura y el registro propios de la práctica forense italiana.
- Emisión de dictámenes y opiniones legales: adecuado para producir análisis argumentados sobre cuestiones concretas de derecho italiano, con la traza de razonamiento accesible para que el profesional revise el hilo lógico antes de firmar.
- Investigación jurídica asistida por herramientas: mediante function calling puede consultar bases de jurisprudencia o normativa y encadenar varias búsquedas hasta componer una respuesta fundamentada, un flujo soportado explícitamente por `ds4-agent`.
- Revisión de expedientes extensos: con contexto de hasta 156.000 tokens en las pruebas del autor, permite analizar contratos, autos o conjuntos documentales largos en una sola pasada sin trocear el texto.
- Atención al cliente de despachos y servicios legales: gestión de conversaciones multi-turno para clasificar consultas, recabar datos iniciales y derivar al profesional correspondiente, siempre dentro del dominio jurídico italiano.
- Extracción estructurada de cláusulas y datos contractuales: el soporte de llamadas a herramientas permite emitir salidas estructuradas para alimentar sistemas de gestión documental, usando el modelo como extractor y no solo como generador de texto.
- Despliegue on-premise en despachos con requisitos de confidencialidad: al ejecutarse localmente con el motor ds4 sobre SSD NVMe, los documentos del cliente no salen de la infraestructura del despacho.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card unicamente aporta metricas de fidelidad respecto al modelo base en su version MXFP4, medidas sobre conversaciones de trabajo juridico no vistas durante la preparacion y a contexto completo (hasta 156.000 tokens), evaluando lo que el modelo escribe (razonamiento, respuestas y llamadas a herramientas).

| Metrica | Este archivo (K128, ~65 GiB) | Version K160 (~77 GiB) |
|---|---|---|
| Divergencia KL media | 0,119 | 0,098 |
| Divergencia KL mediana | 0,0001 | 0,0001 |
| Mismo primer token que el modelo completo | 91,7 % | 92,5 % |

Estas cifras miden la fidelidad al modelo de partida, no la calidad juridica de las respuestas. El autor indica ademas que fuera de dominio el acuerdo con el modelo completo cae de forma marcada en prompts generales en ingles (informatica, programacion).

## Requisitos de hardware

- Memoria para inferencia con todos los expertos activos en RAM: aproximadamente 65 GiB (9,4 GiB de parte fija + 47,5 GiB de expertos activos + ~8 GiB para un contexto de 32.768 tokens).
- Memoria con cache de la mitad de los expertos activos: aproximadamente 41 GiB, leyendo el resto desde disco.
- Comparativa interna: una cuantizacion de 2 bits completa del mismo modelo exigiria unos 152 GiB para tener todos los expertos en memoria.
- Almacenamiento: 340,6 GiB de archivo en un SSD rapido, con 189 GiB de tablas Engram que se leen de disco durante la inferencia. Un disco lento penalizara directamente la latencia.
- GPU: el motor ds4 funciona sobre CUDA o Metal. Con 65 GiB de requisito, no cabe en una GPU de consumo como la RTX 4090 (24 GB de VRAM); hacen falta varias GPU o una plataforma Apple Silicon con memoria unificada suficiente.
- Ajuste fino de memoria: `--ssd-streaming-cache-experts 32GB` permite fijar la cache de expertos y reducir la memoria residente a costa de mas lecturas de disco.
- Opciones de despliegue: el autor solo documenta el motor ds4 y sus variantes `ds4-server` y `ds4-agent`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Expertos activos por capa | Tamano en disco | Memoria de inferencia | Divergencia KL media | Licencia | Idioma |
|---|---|---|---|---|---|---|---|
| Este archivo (buddalaw K128, Q2) | 754,6 mil millones | 128 de media (96-185) | 340,6 GiB | ~65 GiB (~41 GiB con media cache) | 0,119 | MIT | Italiano |
| buddalaw K160, Q2 | 754,6 mil millones (mismo base) | 160 (no confirmado en la informacion disponible) | No disponible | ~77 GiB | 0,098 | MIT | Italiano |
| DeepSeek-V4.1-Flash (MXFP4 original) | 754,6 mil millones | Todos los enrutados | No disponible | ~152 GiB para 2 bits completo | Referencia | MIT | No disponible |

No se dispone de datos sobre otros modelos comparables de la misma categoria (MoE de ~750 mil millones de parametros especializados en dominio juridico italiano) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: el autor indica explicitamente que fuera del dominio juridico italiano el acuerdo con el modelo completo cae de forma marcada, especialmente en ingles y en tareas de informatica y programacion.
- No se han publicado benchmarks estandar, por lo que no existe evidencia publica comparable sobre MMLU, HumanEval, GSM8K o tareas similares.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgos en la model card.
- Riesgo de alucinacion: no se documenta ninguna mitigacion especifica. En un dominio juridico, las citas normativas o jurisprudenciales incorrectas son especialmente sensibles y requieren verificacion humana.
- La mascara del router no debe retirarse: los expertos desactivados estan a cero en el archivo, de modo que desenmascararlos no aporta calidad y rompe la configuracion para la que se midio la fidelidad.
- Dependencia de infraestructura: el rendimiento depende de un SSD rapido y del motor ds4. No hay soporte documentado para otros runners habituales.
- Idiomas: solo italiano declarado. No hay soporte documentado de castellano, catalan, gallego o euskera.
- Licencia MIT: permite uso comercial y modificacion, pero se hereda del modelo base y conviene verificar las condiciones del repositorio original de DeepSeek por si existieran terminos adicionales.
- Validacion de la comunidad practicamente nula en el momento de la consulta: 0 descargas y 0 likes en el repositorio de HuggingFace.
- Uso en produccion: al ser una cuantizacion de 2 bits, conviene validar el comportamiento en el dominio propio con datos representativos antes de desplegarlo en un flujo real.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/buddalaw/DeepSeek-V4.1-Flash-buddalaw-K128-Q2-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Version K160 del mismo autor: https://huggingface.co/buddalaw/DeepSeek-V4.1-Flash-buddalaw-K160-Q2-GGUF
- Motor ds4: https://github.com/antirez/ds4
- La busqueda web no devolvio ningun enlace relevante sobre este modelo.
