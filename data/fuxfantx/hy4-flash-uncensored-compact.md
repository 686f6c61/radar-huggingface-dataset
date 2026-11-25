# Fuxfantx/Hy4-flash-Uncensored-Compact

## Resumen

Hy4-flash-Uncensored-Compact es una distribucion cuantizada en formato GGUF del modelo Hy4-flash, un transformer multimodal de tipo sparse MoE desarrollado originalmente por Tencent. Esta version concreta la publica el usuario Fuxfantx como derivado de `alesha-pro/Hy4-flash-Uncensored-GGUF`, que a su vez parte del modelo base `tencent/Hy4-flash`. Se trata, por tanto, de una cadena de derivaciones (base, fine-tune sin censura y cuantizacion) y no de un modelo entrenado desde cero.

El modelo conserva la arquitectura del original: 42 capas de lenguaje (1 densa y 41 MoE), 512 expertos enrutados por capa con Top-16, atencion MLA con combinacion de atencion dispersa y ventana deslizante, y un mecanismo adicional de embeddings N-gram ("Engram") de aproximadamente 63.400 millones de parametros. El total ronda los 220.000 millones de parametros, con unos 12.000 millones activados por token, lo que lo situa en la categoria de MoE de gran escala pero con coste de inferencia contenido.

La relevancia de esta ficha es doble: por un lado documenta un modelo multimodal con capacidades de texto e imagen y una ventana de contexto amplia (no confirmada en la informacion disponible); por otro, advierte de que el checkpoint emplea tipos de tensor GGUF personalizados y un diseno de Engram modificado que no cargan en `llama.cpp` estandar. Es, en palabras del autor, una "release de formato", no un paquete de inferencia listo para usar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sparse MoE multimodal con atencion MLA (hibrida dispersa/ventana deslizante), 42 capas (1 densa + 41 MoE), Engram N-gram embeddings, cabecera MTP/nextn |
| Parametros totales | ~220.000 millones (incluyendo Engram); 466.628.208 en el fichero safetensors reportado por Hugging Face |
| Parametros activos | ~12.000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | CSQ8, CSQ4, VQ4_128, VQ4_64 (backbone); ENGRAM_Q2B12, ENGRAM_Q4B12, ENGRAM_Q6B12, FP8 E4M3 (Engram); BF16/F32 (proyector de vision) |
| Idiomas soportados | en, zh |
| Licencia | Tencent Hy License, Version 1.0 (etiquetada como `other` / `tencent-hy-license`) |
| Formato de pesos | GGUF (dos ficheros de backbone/Engram + proyector de vision en GGUF) |

## Arquitectura y entrenamiento

La arquitectura del modelo base, segun la model card del upstream, es un MoE multimodal disperso. El backbone de lenguaje tiene 42 capas: una capa FFN densa y 41 capas MoE. Cada capa MoE contiene 512 expertos enrutados con enrutamiento Top-16 mas un experto compartido. Emplea LatentMoE con dimension latente de 1.536 y tamano intermedio de experto de 1.536, hidden size de 3.072 y vocabulario de 120.832 tokens. La atencion es MLA (Multi-head Latent Attention) con una combinacion hibrida de atencion dispersa y atencion de ventana deslizante, e incorpora "identity Hyper-Connections" (iHC) con cuatro flujos residuales.

El componente Engram anade embeddings N-gram en las capas 1, 11, 21 y 31 del backbone: 8 cabeceras hash por orden bigrama/trigrama, 96 dimensiones por cabecera, lo que suma aproximadamente 63.400 millones de parametros. La tabla Engram original es de forma (96, 660.006.416) en FP8 E4M3. El codificador de vision tiene 27 capas, hidden 1.152, intermedio 4.304, 16 cabeceras, parche de 16 y rejilla posicional de 128x128 con fusion de caracteristicas 2x2. El release upstream incluye ademas una cabecera MTP/nextn y un drafter DFly2 de unos 0,85B parametros.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La model card de esta distribucion se centra en el proceso de cuantizacion: el backbone se rota con una transformada de Walsh-Hadamard normalizada de 512 pesos con signos explicitos antes de la cuantizacion por bloques, y los expertos se agrupan por capa en tres grupos (Hot, Warm, Cold) con distintos tipos de cuantizacion. El Engram se divide en cuatro niveles de precision (Low-Cold, High-Cold, Hot, Warm) con un indice por fila que codifica el nivel en los 2 bits altos y el indice local en los 30 bits bajos.

## Capacidades

- Generacion de texto en ingles y chino.
- Razonamiento y comprension de lenguaje natural a gran escala gracias a los ~12B parametros activos por token.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`) mediante el codificador de vision de 27 capas.
- Generacion de codigo y matematicas: capacidad esperable en un modelo de esta familia, aunque no verificada con benchmarks en la informacion disponible.
- Decodificacion especulativa mediante la cabecera MTP/nextn presente en los tensores del release; el drafter DFly2 no ha sido validado de forma independiente segun el autor.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Modo "sin censura": el fine-tune upstream elimina filtros de seguridad, lo que amplia el rango de respuestas pero incrementa el riesgo de contenido inseguro o ilegal.
- Capacidades multilingues limitadas a ingles y chino segun los metadatos.

## Casos de uso

- Investigacion sobre cuantizacion extrema: el checkpoint sirve como banco de pruebas para evaluar tipos de tensor personalizados (CSQ8, CSQ4, VQ4_128, VQ4_64) y esquemas de indice por fila en tablas de embeddings masivas, comparando la perdida de calidad frente al modelo en FP8.
- Estudio de arquitecturas MoE con embeddings N-gram: permite analizar como el componente Engram (63.400 millones de parametros) contribuye a la calidad del modelo y como se comporta al estratificar sus filas por "calor" de uso.
- Desarrollo de runtimes compatibles: dado que `llama.cpp` estandar no carga estos tensores, el modelo es util para equipos que construyan o adapten motores de inferencia capaces de interpretar el layout modificado de Engram y los tipos CSQ/VQ.
- Evaluacion de modelos multimodales sin censura en entornos controlados: util para estudiar el comportamiento del modelo ante prompts sensibles y disenar capas de salvaguarda posteriores, siempre con revision humana y cumplimiento normativo.
- Procesamiento de documentos con imagen y texto en ingles o chino: el codificador de vision y el backbone de lenguaje permiten tareas de descripcion de imagenes o extraccion de informacion, aunque la falta de validacion del proyector en este release exige pruebas previas.
- Experimentacion con decodificacion especulativa: los tensores MTP/nextn permiten probar tecnicas de aceleracion de inferencia en un modelo de gran escala con activacion dispersa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una seccion de "Quality Metrics" centrada en la reconstruccion de pesos tras la cuantizacion, pero el contenido proporcionado se interrumpe y no incluye cifras de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos totales suman aproximadamente 61,7 GiB (34,374 GiB de backbone + 26,355 GiB de tabla Engram + 0,973 GiB de proyector de vision). El fichero Engram esta disenado para ser transmitido en streaming o cacheado parcialmente, por lo que la decodificacion solo de texto no requiere tenerlo residente por completo.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el volumen de pesos, un despliegue completo en memoria requeriria GPUs de 80 GB (A100, H100) o configuraciones multi-GPU; el streaming del Engram podria reducir el requisito, pero no se documentan cifras concretas.
- Compatibilidad con GPU de consumo: no confirmada. El backbone de 34,374 GiB excede la VRAM de cualquier GPU de consumo actual en un solo dispositivo; un despliegue parcial o con offloading no esta documentado.
- Opciones de despliegue: el autor advierte explicitamente de que `llama.cpp` estandar y la build publica de Project Maya no cargan el checkpoint tal cual. Se requiere un runtime compatible con los tipos de tensor personalizados y el layout de Engram modificado. El repositorio incluye herramientas de inspeccion GGUF y utilidades de build en C#.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Hy4-flash-Uncensored-Compact (esta ficha) | ~220B (incl. Engram) | ~12B | no disponible | Tencent Hy License 1.0 | GGUF personalizado |
| tencent/Hy4-flash (upstream) | ~220B (incl. Engram) | ~12B | no disponible | Tencent Hy License 1.0 | safetensors / GGUF upstream |
| alesha-pro/Hy4-flash-Uncensored-GGUF (base directo) | ~220B (incl. Engram) | ~12B | no disponible | Tencent Hy License 1.0 | GGUF |

Las tres entradas pertenecen a la misma cadena de derivacion, por lo que la comparativa con alternativas de otros desarrolladores no esta disponible en la informacion proporcionada. No se dispone de datos de rendimiento que permitan contrastar con otros MoE de tamano similar.

## Limitaciones y advertencias

- El checkpoint no es un paquete de inferencia listo para usar: requiere un runtime compatible con tipos GGUF personalizados y un layout de Engram modificado. `llama.cpp` estandar y la build publica de Project Maya no lo cargan tal cual.
- El modelo es un derivado sin censura: puede generar contenido inseguro o ilegal en determinados contextos. El despliegue exige anadir salvaguardas y asumir la responsabilidad de cumplimiento normativo.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni metricas de calidad en la informacion disponible.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- La seleccion de filas Hot/Warm del Engram se hizo a partir de una distribucion de "calor" N-gram inferida, no de trazas reales de trafico, por lo que el autor espera reajustarla tras observar uso real.
- El drafter DFly2 no ha sido validado de forma independiente en este release.
- La licencia Tencent Hy License 1.0 impone condiciones especificas para uso comercial; es necesario revisar el texto completo antes de cualquier despliegue productivo.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.
- La model card esta incompleta en la seccion de metricas de calidad, por lo que no se puede confirmar la perdida de precision introducida por la cuantizacion.

## Enlaces

- Hugging Face (esta distribucion): https://huggingface.co/Fuxfantx/Hy4-flash-Uncensored-Compact
- Modelo base directo: https://huggingface.co/alesha-pro/Hy4-flash-Uncensored-GGUF
- Modelo upstream original: https://huggingface.co/tencent/Hy4-flash
- Licencia Tencent Hy 1.0: https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE
