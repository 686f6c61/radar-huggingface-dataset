# DICPlay/RusMind-3.2-Momentum

## Resumen

RusMind-3.2-Momentum (comercializado como «Моментум») es un modelo de generacion de texto del fabricante ruso DICPlay, disenado especificamente para ejecutarse en el propio dispositivo, sin conexion a internet. Forma parte de la familia RusMind 3.2 y es la variante mas ligera de la misma, orientada a telefonos moviles y ordenadores de gama baja. Cuenta con 4.647.450.147 parametros (~4,65 mil millones), un contexto de 4096 tokens y se distribuye unicamente en formato GGUF cuantizado en Q4_K_M, con un peso total de aproximadamente 2,5 GB repartido en nueve fragmentos de hasta 1 GB.

El modelo esta entrenado para pensar y responder principalmente en ruso, con soporte secundario de ingles. Segun su model card, recibio un ajuste especifico sobre un corpus en ruso que cubre historia de Rusia, legislacion de la Federacion Rusa, cultura, los pueblos y las 89 regiones del pais, y lo que el autor denomina valores espirituales y morales tradicionales. Se publica bajo licencia Apache 2.0, lo que permite uso comercial.

Su relevancia actual radica en el nicho de la inferencia local y privada: al no requerir red, ningun dato de la conversacion sale del dispositivo. La contrapartida es que se trata de un modelo pequeno, con contexto corto, sin resultados de benchmarks publicados y con cero descargas registradas en HuggingFace en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pesos GGUF compatibles con llama.cpp; no se detalla en la model card) |
| Parametros totales | 4.647.450.147 (~4,65 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE, segun la informacion disponible) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | Q4_K_M, con embeddings simplificados (unica cuantizacion publicada) |
| Idiomas soportados | ruso (principal), ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, nueve fragmentos de hasta 1 GB |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna del modelo: no se indica si es un transformer decoder denso convencional, ni se detallan el numero de capas, la dimension oculta, el tipo de atencion ni la estrategia de tokenizacion. Lo unico confirmado es que los pesos se distribuyen en formato GGUF y son ejecutables mediante llama.cpp y herramientas compatibles (LM Studio, wllama), lo que implica compatibilidad con el ecosistema de inferencia de llama.cpp. Tampoco se publican detalles sobre la composicion exacta del dataset base, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Lo que si documenta el autor es una fase de ajuste especifico sobre un corpus en ruso compuesto por historia de Rusia (desde la Rus antigua hasta la actualidad), legislacion de la Federacion Rusa, cultura (literatura, arte, tradiciones), los pueblos de Rusia y sus 89 regiones, eventos clave del pais y del mundo, y una capa de contenido alineado con lo que la propia model card describe como valores espirituales y morales tradicionales rusos. No hay informacion sobre la innovacion tecnica, el volumen de ese corpus ni la metodologia de ajuste.

## Capacidades

- Generacion de texto y conversacion multi-turno (el repositorio esta etiquetado como `conversational` y `text-generation`).
- Comprension y produccion de ruso como idioma principal, con ingles como idioma secundario.
- Conocimiento declarado sobre historia de Rusia, legislacion rusa, cultura y geografia de las 89 regiones del pais.
- Redaccion de textos y ayuda con tareas de estudio y preguntas cotidianas, segun la descripcion del autor.
- Comportamiento de honestidad declarado: el modelo afirma explicitamente «no lo se» cuando no esta seguro, segun la model card.
- Ejecucion totalmente offline sobre el propio dispositivo (telefono u ordenador modesto).
- Despliegue en navegador mediante wllama, con descarga unica del modelo y uso posterior sin conexion.

No hay informacion disponible sobre soporte de tool calling o function calling, uso en agentes, razonamiento multi-paso, modo de pensamiento explicito, vision, audio ni otras capacidades multimodales.

## Casos de uso

- Asistente personal offline en telefonos: el modelo se ejecuta localmente con ~2,5 GB en disco, por lo que puede gestionar conversaciones en ruso sin enviar datos a la nube, adecuado para entornos con conectividad limitada o requisitos de privacidad estrictos.
- Educacion y apoyo al estudio en ruso: puede ayudar con dudas de historia, literatura o materias escolares, aprovechando su ajuste sobre el corpus historico y cultural ruso, siempre con la advertencia de verificar los datos.
- Redaccion y edicion de textos cortos en ruso: borradores, correos, resumenes y reescritura de parrafos dentro de su ventana de 4096 tokens, que limita el trabajo a documentos breves.
- Consulta de referencia sobre legislacion rusa: puede servir como primer punto de orientacion sobre normativa de la Federacion Rusa, con la salvedad explicita de que no sustituye al asesoramiento juridico profesional.
- Consulta cultural y geografica: informacion sobre las 89 regiones, pueblos y tradiciones de Rusia, util como herramienta divulgativa ligera en aplicaciones locales.
- Asistencia al cliente en ruso en modo offline: integrable en aplicaciones de escritorio o moviles que necesiten responder consultas sencillas sin conexion y sin coste de API.
- Aplicaciones embebidas en navegador: mediante wllama, permite chat local en una pagina web tras una descarga unica, util para demos y herramientas internas sin backend.
- Procesamiento de datos sensibles en local: cualquier flujo en el que el texto no pueda salir del dispositivo (sanitario, legal interno, personal) se beneficia de la ejecucion totalmente offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card ni los resultados de la busqueda web proporcionan cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar para este modelo. Las busquedas realizadas devolvieron unicamente agregadores genericos de modelos (benchlm.ai, llm-stats.com) sin datos especificos de RusMind.

## Requisitos de hardware

- Tamano en disco: aproximadamente 2,5 GB en formato GGUF Q4_K_M, repartido en nueve ficheros de hasta 1 GB.
- VRAM estimada para inferencia: del orden de 3-4 GB considerando el peso cuantizado mas la cache KV para 4096 tokens (estimacion orientativa a partir del numero de parametros y la cuantizacion; no confirmada por el autor).
- GPU recomendadas: cualquier GPU de consumo con 4 GB o mas de VRAM, como GTX 1650, RTX 3050/3060 o superiores; en el extremo alto, A100/H100 no aportan ventaja relevante para un modelo de este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas de VRAM. Tambien puede ejecutarse en CPU y en telefonos moviles, que es su objetivo principal.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), LM Studio, wllama en navegador y otras herramientas compatibles con GGUF. Para cargar los fragmentos, se indica el primero y el resto se detecta automaticamente: `llama-cli -m rusmind-momentum-3.2-00001-of-00009.gguf -cnv`.
- Latencia y throughput estimados: no disponible. El autor no publica cifras de tokens por segundo ni de latencia.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables de terceros (mismo tamano o misma tarea) en la informacion disponible, por lo que no es posible establecer una comparativa cuantitativa con alternativas externas. Como referencia interna, la propia familia RusMind 3.2 se articula del siguiente modo:

| Modelo | Parametros | Contexto | Despliegue | Licencia | Estado |
|---|---|---|---|---|---|
| RusMind-3.2-Momentum | ~4,65 mil millones | 4096 | en dispositivo, offline (GGUF) | Apache 2.0 | publicado |
| RusMind-3.2-Vspyshka (Вспышка) | no disponible | no disponible | en dispositivo, offline | no disponible | publicado |
| RusMind-3.2-Znanie (Знание) | no disponible | no disponible | en nube | no disponible | publicado |
| RusMind-3.2-ATOM | no disponible | no disponible | en nube, Multi-Thinking | no disponible | en desarrollo |

## Limitaciones y advertencias

- Riesgo de alucinacion: el propio autor advierte de que el modelo puede equivocarse y recomienda verificar la informacion importante.
- Respuestas de caracter informativo: las contestaciones a preguntas medicas, juridicas y financieras no sustituyen a un especialista, segun la propia model card.
- Modelo ligero orientado a tareas cortas: el autor indica que para preguntas complejas conviene usar la variante mayor (Znanie).
- Contexto limitado: 4096 tokens restringen el trabajo con documentos largos o conversaciones muy extensas.
- Cobertura idiomatica: solo ruso (principal) e ingles; no hay soporte declarado para castellano ni otros idiomas.
- Sesgo potencial de contenido: el ajuste se realizo sobre un corpus alineado con lo que el autor denomina valores tradicionales rusos, historia nacional y legislacion de la Federacion Rusa, lo que puede introducir un sesgo tematico e ideologico en las respuestas sobre temas historicos, politicos y sociales.
- Falta de validacion independiente: no hay benchmarks publicados ni evaluaciones de terceros; el modelo registra 0 descargas y 0 likes en HuggingFace y fue creado el 11 de octubre de 2026, por lo que carece de historial de uso.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia; no impone restricciones de uso comercial adicionales segun el texto estandar de dicha licencia.
- Para produccion: la ausencia de datos de rendimiento, de evaluacion de seguridad y de trazabilidad del dataset de entrenamiento desaconseja su uso en entornos criticos sin una validacion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DICPlay/RusMind-3.2-Momentum
- Sitio oficial de RusMind: https://rusmind.ru
- Los resultados de la busqueda web no aportaron enlaces especificos ni documentacion tecnica adicional sobre este modelo (solo agregadores genericos de benchmarks sin datos de RusMind).
