# DICPlay/RusMind-4.5-Vspyshka

## Resumen

RusMind 4.5 · Vspyshka ("Вспышка", destello) es un modelo de generación de texto en formato GGUF desarrollado por DICPlay, presentado como "IA nacional" rusa y orientado a ejecución local en el dispositivo, sin conexión a internet. Se distribuye como una versión preliminar de la cuarta generación de la familia Vspyshka, con 7.518.069.290 parámetros totales (≈7,5 mil millones) y un único archivo de pesos en precisión BF16 de 15,1 GB. El modelo se ofrece para usarse en el navegador a través de rusmind.ru, en llama.cpp, LM Studio, Ollama o PocketPal.

El modelo está especializado en ruso e inglés y ha recibido ajuste sobre conjuntos de datos rusos de DICPlay centrados en historia y cultura de Rusia, legislación, regiones y pueblos del país y valores familiares tradicionales. Según el autor, la versión 4.5 mejora la comprensión del ruso (refranes, humor, juegos de palabras, caracteres y particularidades regionales), la puntuación y ortografía, y el trabajo con documentos largos e instrucciones de varios pasos.

Su relevancia radica en el enfoque *on-device* y en una licencia restrictiva: es gratuito para uso personal, no comercial, investigación y evaluación, pero el uso comercial, la redistribución o la integración en productos requieren un contrato escrito con DICPlay. La model card indica además que la versión recomendada de Vspyshka sigue siendo la 3.5, por lo que 4.5 debe considerarse una *preview*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada en la informacion proporcionada) |
| Parametros totales | 7.518.069.290 (≈7,5 mil millones) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (unico archivo publicado: `RusMind-Vspyshka-4.5-BF16.gguf`, 15,1 GB); no se publican otras cuantizaciones |
| Idiomas soportados | ruso (ru), ingles (en) |
| Licencia | RusMind License (DICPlay), licencia propia (`license: other`) |
| Formato de pesos | GGUF (libreria `gguf`, compatible con llama.cpp) |

## Arquitectura y entrenamiento

No se han publicado detalles de arquitectura en la informacion disponible: la model card no especifica si se trata de un transformer denso, un MoE o una arquitectura hibrida, ni indica el numero de capas, dimensiones ocultas, mecanismo de atencion o longitud de contexto nativa. El dato objetivo disponible es el recuento de parametros (7.518.069.290), compatible con un modelo denso de clase 7-8B en precision BF16, cuyo archivo de pesos ocupa 15,1 GB.

En cuanto a datos, el autor indica que RusMind se entreno "sobre un enorme volumen de datos" y que paso por un proceso de ajuste adicional (*fine-tuning*) con conjuntos rusoparlantes propios de DICPlay: historia y cultura de Rusia, leyes, regiones y pueblos del pais, valores familiares tradicionales y acontecimientos clave, tanto en ruso como en ingles. No se especifica el numero de tokens de entrenamiento, la composicion exacta del corpus, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o decodificacion especulativa. Tampoco se detalla ninguna innovacion tecnica de inferencia mas alla del soporte GGUF para ejecucion local.

## Capacidades

- Generacion de texto conversacional en ruso e ingles, con enfasis declarado en calidad linguistica del ruso (puntuacion, ortografia, colocacion de comas).
- Comprension de matices culturales rusos: refranes y proverbios, humor, juegos de palabras, caracteres de personajes y particularidades regionales.
- Trabajo con documentos largos y con instrucciones de varios pasos, segun las mejoras anunciadas para la version 4.5.
- Asistencia en tareas de estudio y explicaciones didacticas.
- Asistencia en programacion basica ("ayuda con el codigo" segun la model card); no se detalla el rendimiento en lenguajes concretos.
- Ejecucion totalmente offline en el dispositivo, incluida la variante que se descarga una vez en el navegador y responde sin conexion.
- Soporte de conversacion multimodal de texto (`-cnv` en llama-cli); no se declaran capacidades de vision, audio ni thinking mode explicito.
- Soporte de *tool calling* / *function calling*: no disponible (no documentado en la informacion proporcionada).
- Capacidades de agente y razonamiento multi-paso: solo parcialmente documentadas (instrucciones de varios pasos); no hay detalles tecnicos.

## Casos de uso

- Asistencia offline en escritorio: ejecutado con llama.cpp o LM Studio sobre un portatil, el modelo permite redactar, resumir y corregir textos sin conexion, util en entornos con red restringida o air-gapped. El archivo BF16 de 15,1 GB encaja en equipos con 16-20 GB de RAM o VRAM.
- Correccion y edicion de texto en ruso: dado el enfasis declarado en ortografia y puntuacion, encaja en tareas de revision de borradores y normalizacion de estilo en redacciones y editoriales rusoparlantes.
- Atencion al cliente en ruso sobre infraestructura local: al poder desplegarse con llama-server o LM Studio en servidores propios, sirve para escenarios con requisitos de residencia de datos, aunque la licencia exige contrato comercial con DICPlay para uso en producto.
- Apoyo educativo: explicacion de conceptos de historia y cultura rusa, y ayuda con deberes, coherente con los conjuntos de ajuste declarados (historia, regiones, legislacion).
- Consulta documental de referencia juridica o administrativa: el modelo puede resumir y explicar textos legales rusos, siempre como orientacion informativa y no como asesoramiento vinculante (la propia model card advierte que las respuestas medicas, juridicas y financieras son de caracter informativo).
- Prototipado e investigacion de modelos locales: al publicarse en BF16 GGUF, es una base adecuada para evaluacion academica y para generar cuantizaciones propias (Q8_0, Q4_K_M) con llama.cpp, uso permitido por la licencia para investigacion y evaluacion.
- Asistente integrado en aplicaciones moviles: compatible con PocketPal y con la demo web de rusmind.ru, permite asistentes de bolsillo sin conexion para consultas cotidianas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones cuantitativas con modelos anteriores de la familia (Vspyshka 3.5) o con alternativas.

## Requisitos de hardware

- VRAM/RAM para BF16 (unico archivo publicado): 15,1 GB de pesos; con cache KV y overhead del runtime, se recomienda un minimo de 17-20 GB de memoria disponible.
- Cuantizaciones derivadas (no publicadas, generables por el usuario con llama.cpp): Q8_0 en torno a 8 GB; Q4_K_M en torno a 4,5-5 GB, estimaciones calculadas a partir del recuento de parametros.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para BF16 con contexto amplio; RTX 4080/4070 Ti (16 GB) para BF16 justo; RTX 4060 Ti 16 GB, RTX 3060 12 GB o RTX 4070 12 GB para Q8_0 o Q4_K_M.
- GPU de centro de datos: A100 (40/80 GB) y H100 permiten BF16 con lotes mayores, aunque para 7,5B son sobredimensionadas para inferencia individual.
- Cabe en GPU de consumo: si, en BF16 con 16 GB o mas, y con holgura en cuantizaciones de 8 y 4 bits en tarjetas de 8-12 GB.
- Apple Silicon: viable con memoria unificada de 16 GB (Q8_0/Q4_K_M) o 24-32 GB (BF16).
- Opciones de despliegue: llama.cpp (`llama-cli -m RusMind-Vspyshka-4.5-BF16.gguf -cnv`, `llama-server`), LM Studio, Ollama (importando el GGUF), PocketPal y ejecucion en navegador via rusmind.ru. vLLM y TGI no estan documentados para este modelo; su soporte de GGUF es limitado o experimental.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| RusMind 4.5 Vspyshka (DICPlay) | 7,52 B | no disponible | ru, en | RusMind License: solo no comercial sin contrato | GGUF BF16, 15,1 GB |
| Llama 3.1 8B (Meta) | 8 B | 128k | multilingue | Llama 3.1 Community License (uso comercial permitido con condiciones) | safetensors y GGUF |
| Qwen2.5 7B (Alibaba) | 7,6 B | 128k (variante base) | multilingue, buen ruso | Apache 2.0 en la mayoria de variantes | safetensors y GGUF |
| Gemma 2 9B (Google) | 9 B | 8k | multilingue | Gemma Terms of Use | safetensors y GGUF |

Nota: los datos de los modelos alternativos proceden de documentacion publica general y no de la informacion proporcionada en esta busqueda; deben verificarse antes de tomar decisiones. No hay datos de rendimiento comparado (benchmarks) para RusMind 4.5 en la informacion disponible, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad. Frente a las alternativas, la diferencia principal es la licencia: RusMind no permite uso comercial sin contrato escrito, mientras que Qwen2.5 (Apache 2.0) y Llama 3.1 (con condiciones) si lo permiten.

## Limitaciones y advertencias

- Version preliminar: la propia model card recomienda usar Vspyshka 3.5 como version estable; 4.5 se marca como *предварительная версия* (vista previa).
- Licencia restrictiva: prohibido el uso comercial, la reventa, la distribucion de versiones modificadas o ajustadas y la integracion en productos sin contrato escrito con DICPlay. Esto descarta la mayoria de despliegues en produccion sin acuerdo previo.
- Cobertura linguistica limitada a ruso e ingles; no se declara soporte de castellano ni de otros idiomas.
- Longitud de contexto no documentada: no es posible planificar cargas de documentos largos con una cifra verificable, pese a que la model card menciona mejoras en ese terreno.
- Riesgo de alucinacion: no se publican evaluaciones de fidelidad ni de tasa de alucinacion; como modelo de 7,5B, es esperable una fiabilidad limitada en razonamiento complejo y datos factuales, aunque no hay mediciones que lo confirmen.
- Sesgo editorial y de contenidos: el ajuste se realizo sobre conjuntos propios centrados en historia, legislacion, regiones y "valores familiares tradicionales" de Rusia, lo que puede introducir un sesgo sistematico en temas historicos, politicos y sociales.
- Sin datos de seguridad: no se documentan filtros, evaluaciones de toxicidad ni red teaming.
- Advertencia del propio autor: las respuestas sobre medicina, derecho y finanzas son solo informativas y no constituyen asesoramiento profesional.
- Un unico archivo BF16: no hay cuantizaciones oficiales, por lo que el usuario asume el coste y la validacion de generar las suyas.
- Sin soporte documentado de *tool calling*, agentes o modos de razonamiento explicito, lo que limita su uso en pipelines automatizados complejos.
- Cifras de adopcion muy bajas en el momento de la ficha (0 descargas, 0 likes) y fechas de publicacion atipicas (creado el 2026-10-17), lo que dificulta la validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DICPlay/RusMind-4.5-Vspyshka
- Archivo de pesos BF16: https://huggingface.co/DICPlay/RusMind-4.5-Vspyshka/blob/main/RusMind-Vspyshka-4.5-BF16.gguf
- Licencia: https://huggingface.co/DICPlay/RusMind-4.5-Vspyshka/blob/main/LICENSE
- Repositorio con todas las versiones de la familia: https://huggingface.co/DICPlay/RusMind-Vspyshka
- Demo y acceso en navegador: https://rusmind.ru
