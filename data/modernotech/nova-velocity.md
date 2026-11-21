# ModernoTech/Nova-Velocity

## Resumen

Nova Velocity es un modelo de lenguaje de propósito general desarrollado por Moderno Tech dentro de su familia Nova AI, orientado a la ejecución local en equipos de sobremesa y estaciones de trabajo. Se trata de un transformer con arquitectura Mixture of Experts (MoE) de aproximadamente 30.532 millones de parámetros totales, de los cuales alrededor de 1.500 millones se activan por token, lo que busca ofrecer un equilibrio entre capacidad y velocidad de inferencia en hardware de consumo.

El modelo se distribuye exclusivamente en formato GGUF cuantizado, con variantes que van desde IQ2_M hasta Q6_K, lo que permite ajustar el uso de memoria y almacenamiento según los recursos disponibles. Soporta un contexto documentado de 65.536 tokens y declara idiomas inglés y español. Su licencia es Apache 2.0, lo que facilita su integración en productos comerciales sin restricciones adicionales.

La propuesta de Moderno Tech se centra en la inferencia local y la privacidad por diseño, aunque la propia model card advierte explícitamente de que no debe asumirse privacidad absoluta ni funcionamiento sin conexión sin verificar la plataforma. El modelo no está especializado en una tarea concreta: se posiciona como asistente general para redacción, resúmenes, preguntas y respuestas y productividad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) |
| Parametros totales | 30.532.122.624 (~30B) |
| Parametros activos | ~1.500 millones por token |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | GGUF: IQ2_M a Q6_K |
| Idiomas soportados | Ingles, espanol |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); repo de 159,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con 48 bloques, dimensión de embeddings de 2.048, 32 cabezas de atención y 4 cabezas KV (GQA), con una dimensión feed-forward de 6.144 y 768 por experto. El modelo contiene 128 expertos totales, de los cuales se activan 4 por token. Esta configuración implica que, aunque los parámetros activos por token sean ~1,5B, todos los pesos de los expertos deben residir en memoria o almacenamiento durante la inferencia, por lo que los requisitos de VRAM y disco no equivalen a los de un modelo denso de 1,5B.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El modelo base figura como "Unknown" en la información disponible.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y español.
- Respuestas a preguntas y asistencia general.
- Redacción, reformulación y resumen de documentos.
- Productividad y organización de tareas cotidianas.
- Asistencia dentro de aplicaciones locales.
- Perfil de propósito general, no especializado en programación ni en una tarea concreta.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente personal local: el modelo puede gestionar conversaciones multi-turno con hasta 65.536 tokens de contexto, adecuado para sesiones largas de consulta sin depender de la nube.
- Redacción y edición de documentos: reformulación y resumen de textos extensos aprovechando la ventana de contexto, útil en entornos donde los datos no deben salir del equipo.
- Preguntas y respuestas sobre documentación interna: con contexto largo, puede procesar manuales o informes completos y responder preguntas concretas sobre ellos.
- Productividad y organización: generación de listas, borradores de correos y planificación de tareas en aplicaciones de escritorio.
- Asistencia en aplicaciones locales: integración mediante motores de inferencia GGUF (llama.cpp, Ollama) en herramientas de escritorio para autocompletado y ayuda contextual.
- Prototipado y evaluación de MoE en local: su tamaño activo reducido (~1,5B) y sus múltiples cuantizaciones lo hacen útil para experimentar con arquitecturas MoE en hardware de consumo, siempre que se disponga de memoria suficiente para los pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con ~30B parámetros totales, las cuantizaciones IQ2_M e IQ3 requieren del orden de 10-15 GB solo para pesos, mientras que Q5_K y Q6_K superan los 20-25 GB; estas cifras son estimaciones por tamaño de pesos, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, las variantes de mayor cuantización requieren GPUs con 24 GB o más (RTX 3090/4090, A100, H100) o reparto entre GPU y CPU.
- GPU de consumo: las cuantizaciones bajas (IQ2_M, IQ3) podrían caber en GPUs de 12-16 GB, sujeto a verificación práctica; las altas no caben en GPUs de consumo de 24 GB sin offload.
- Opciones de despliegue: llama.cpp, Ollama y otros motores compatibles con GGUF; vLLM y TGI no se documentan para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Nova Velocity | ~30B | ~1,5B | 65.536 | Apache 2.0 | GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos, pero al no haber información sobre datos de entrenamiento ni alineación, el riesgo de sesgos y de alucinaciones no puede descartarse.
- La model card advierte explícitamente de que no debe prometerse privacidad absoluta, ejecución sin conexión ni compatibilidad universal sin verificar la plataforma.
- El contexto máximo documentado es de 65.536 tokens; el rendimiento más allá de esa ventana no está garantizado.
- Solo se declaran inglés y español; el soporte de otros idiomas no está verificado.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones de los motores de inferencia y de las herramientas de cuantización utilizadas.
- Los requisitos de memoria no equivalen a los de un modelo denso de 1,5B: todos los pesos de los expertos deben estar disponibles durante la ejecución.
- No hay información sobre el modelo base ni sobre el proceso de entrenamiento, lo que dificulta evaluar su calidad frente a alternativas consolidadas.

## Enlaces

- Hugging Face: https://huggingface.co/ModernoTech/Nova-Velocity
- Sitio oficial de Moderno Tech: https://moderno.com.ar
