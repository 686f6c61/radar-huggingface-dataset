# npario/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced

## Resumen

Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced es una cuantización GGUF de 4 bits del modelo google/gemma-4-12B-it, publicada por el usuario npario y derivada del trabajo de "desensurado" (eliminación de rechazos) de HauhauCS. Se trata de un transformer denso de 11.907.350.576 parámetros (aproximadamente 12B) con una ventana de contexto de 262.144 tokens (256K), capacidades multimodales de entrada de imagen mediante un proyector mmproj y una licencia Gemma que restringe el uso comercial en determinadas condiciones.

El modelo no modifica datasets ni capacidades respecto al Gemma 4 12B original: el autor afirma que se conserva el 100% del comportamiento previsto por Google DeepMind y que el único cambio es la supresión de las respuestas de rechazo, con una tasa declarada de 0/465 rechazos en pruebas automatizadas y manuales. Al construirse sobre los pesos oficiales de QAT (quantization-aware training) de Gemma 4, la versión de 4 bits mantiene una calidad cercana a la precisión completa sin necesidad de cuantizaciones mayores.

Su relevancia práctica reside en dos aspectos: por un lado, empaqueta un modelo de 12B con visión y contexto de 256K en un único fichero GGUF de 6,9 GB, ejecutable en hardware de consumo; por otro, incluye una cabeza de predicción multi-token (MTP) que actúa como modelo borrador para decodificación especulativa, con una mejora declarada de velocidad de generación de aproximadamente el 60% sin alterar la salida verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4) con proyector multimodal mmproj y cabeza MTP para decodificacion especulativa |
| Parametros totales | 11.907.350.576 (aproximadamente 12B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q4_K_M para el modelo de texto (unico publicado); mmproj en BF16; cabeza MTP en GGUF (242 MB) |
| Idiomas soportados | en (ingles) |
| Licencia | gemma |
| Formato de pesos | GGUF (llama.cpp y runtimes compatibles) |
| Modelo base | google/gemma-4-12B-it |
| Tamano del repositorio | 7,8 GB |
| Pipeline declarado | image-text-to-text |
| Fecha de creacion | 2026-09-22 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 12B, un transformer denso de aproximadamente 12.000 millones de parametros con soporte nativo de entrada de imagen a traves de un proyector multimodal independiente (mmproj) que se carga junto al modelo de texto. El autor no aporta detalles adicionales sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO) empleadas por Google DeepMind en el modelo original, por lo que esos datos no estan disponibles en la informacion proporcionada.

La particularidad de este release es que parte de los pesos oficiales entrenados con QAT (quantization-aware training), disenados especificamente para funcionar en torno a 4 bits. El autor justifica asi la publicacion de una unica cuantizacion Q4_K_M: al ser el rango para el que el modelo fue entrenado, cuantizaciones de mayor precision anaden tamano sin ganancia real de calidad. Sobre esa base se aplica el proceso de "desensurado" de HauhauCS, que segun la model card no altera datasets ni capacidades, solo el comportamiento de rechazo, y se ajustan los parametros de muestreo recomendados (temperature 0.6, top_k 64, top_p 0.9, min_p 0.05, repeat_penalty 1.1), distintos de los valores por defecto de Gemma.

Adicionalmente, el paquete incluye una cabeza MTP (multi-token prediction) procedente del release de Gemma 4 de Unsloth, que se usa como borrador en decodificacion especulativa con llama.cpp (`--spec-type draft-mtp`). El modelo verifica cada token propuesto por el borrador, de modo que la salida es identica y la ganancia es puramente de velocidad.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte declarado para multi-turno y contexto largo de hasta 256K tokens.
- Razonamiento previo a la respuesta ("reasons before answering"), orientado a tareas de fiabilidad critica segun el autor.
- Codigo y flujos agenticos: la variante Balanced esta ajustada explicitamente para coding agentico.
- Entrada de imagen (image-text-to-text) mediante la carga del fichero mmproj-BF16 de 168 MB.
- Escritura creativa, roleplay y conversacion sin restricciones de rechazo (0/465 rechazos declarados).
- Decodificacion especulativa con cabeza MTP integrada, con aproximadamente un 60% mas de velocidad de generacion declarada.
- Compatibilidad con tool calling y function calling: no se menciona explicitamente en la informacion proporcionada; el tag "agentic" sugiere uso en pipelines de agentes, pero no hay confirmacion tecnica disponible.
- Capacidades multilingues: solo ingles declarado (`language: en`).
- Capacidades de audio o modos de "thinking" explicitos: no disponible.

## Casos de uso

- Generacion de codigo en pipelines de CI/CD: el modelo esta ajustado para coding agentico y puede integrarse en flujos de revision automatica, generacion de tests o refactorizacion, con la ventaja de un unico fichero GGUF de 6,9 GB desplegable en una GPU de consumo.
- Asistente de programacion local en el IDE: gracias al contexto de 256K tokens, puede mantener en memoria repositorios completos o varios ficheros relacionados sin necesidad de troceado agresivo, y la cabeza MTP reduce la latencia percibida en autocompletado.
- Atencion al cliente automatizada: conversaciones multi-turno con historial largo dentro de la ventana de 262.144 tokens, sin deriva de contexto en sesiones prolongadas.
- Analisis de documentos con imagenes: al aceptar entrada de imagen via mmproj, permite extraer y razonar sobre capturas, diagramas, facturas escaneadas o interfaces de usuario combinadas con texto.
- Escritura creativa y narrativa larga: la ventana de 256K permite mantener arcos narrativos completos y coherencia de personajes en novelas o guiones extensos.
- Roleplay y personajes conversacionales: la eliminacion de rechazos y los parametros de muestreo ajustados permiten mantener personajes con personalidad consistente en sesiones largas.
- Procesamiento por lotes en local sin conexion: al ser GGUF, puede ejecutarse en estaciones de trabajo sin GPU de datacenter ni acceso a APIs externas, util en entornos con requisitos de privacidad.
- Investigacion sobre alineacion y rechazos: el modelo sirve como objeto de estudio comparativo frente al Gemma 4 12B original para medir el efecto de la supresion de rechazos en tareas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos cuantitativos aportados por el autor son la tasa declarada de 0/465 rechazos en pruebas automatizadas y manuales, y una mejora de velocidad de generacion de aproximadamente el 60% al usar la cabeza MTP en decodificacion especulativa con llama.cpp. No hay cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 8-9 GB para el fichero Q4_K_M de 6,9 GB, mas 168 MB del proyector de vision y 242 MB de la cabeza MTP si se usan; el consumo real crece con la longitud de contexto y el tamano de la cache KV.
- Precisión completa (BF16, si se derivara del modelo base): aproximadamente 24 GB solo para pesos, mas cache KV.
- GPU recomendadas: RTX 4090 o RTX 3090 de 24 GB para uso comodo con contexto largo; A100 o H100 para despliegues con muchas peticiones concurrentes.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas de VRAM para cuantizacion Q4_K_M y contextos moderados; con 8 GB seria muy ajustado si se activa vision y contexto largo.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), LM Studio, Jan, koboldcpp y otros runtimes compatibles con GGUF. El autor advierte de que Gemma 4 puede fallar en LM Studio bajo modo tensor-split, por lo que recomienda una sola GPU con layer-split u orden de prioridad.
- Latencia y throughput estimados: no disponible mas alla de la mejora relativa declarada del 60% con decodificacion especulativa MTP. No se aportan tokens por segundo ni latencias absolutas.
- Requisito adicional: para usar vision es obligatorio cargar el fichero `mmproj-Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced-BF16.gguf` junto al modelo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de terceros en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas declaradas.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced | 11,9B (denso) | 256K | GGUF Q4_K_M | gemma | Sin rechazos declarados, vision via mmproj, cabeza MTP |
| google/gemma-4-12B-it (modelo base) | 11,9B (denso) | 256K | safetensors | gemma | Modelo original de Google DeepMind, con rechazos y alineacion estandar |
| Otras alternativas de 12B de la misma categoria | no disponible | no disponible | no disponible | no disponible | No hay informacion en los resultados de busqueda proporcionados |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar de Gemma 4 hereda los del modelo base, no documentados en esta model card.
- Riesgo de alucinacion: no se aportan datos especificos; la eliminacion de rechazos incrementa la probabilidad de que el modelo responda con contenido inventado en lugar de declinar, especialmente en dominios de alta incertidumbre.
- La eliminacion de rechazos es una modificacion deliberada del comportamiento de seguridad: el modelo puede generar contenido que el Gemma 4 original bloquearia. El propio autor reconoce que un numero reducido de prompts limite siguen desviandose en la primera peticion y solo responden tras reformulacion.
- Idioma: unicamente ingles declarado; el rendimiento en castellano no esta verificado ni es oficial.
- Contexto: aunque se declaran 256K tokens, el consumo de memoria de la cache KV a esa longitud es muy elevado y puede degradar la calidad en el extremo de la ventana.
- Licencia gemma: impone condiciones de uso, obligaciones de atribucion y restricciones de uso comercial establecidas por Google; es imprescindible revisar los terminos de la licencia Gemma antes de cualquier despliegue en produccion. La naturaleza "uncensored" del modelo puede entrar en conflicto con las clausulas de uso aceptable de dicha licencia.
- Compatibilidad: el autor advierte de cierres inesperados en LM Studio con tensor-split activado; se recomienda una unica GPU con layer-split.
- Los parametros de muestreo recomendados no son los de Gemma por defecto; usar otros valores puede degradar notablemente la calidad segun el autor.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la comunidad.
- Los resultados de busqueda web asociados a esta consulta no contienen informacion tecnica relevante sobre el modelo (devuelven contenido no relacionado), por lo que no ha sido posible contrastar los datos de la model card con fuentes externas.
- El fichero MTP procede del release de Gemma 4 de Unsloth, no del autor del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/npario/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Discord del autor (HauhauCS): https://discord.gg/SZ5vacTXYf
- Paper, blog o repositorio adicionales: no disponible en la informacion proporcionada.
