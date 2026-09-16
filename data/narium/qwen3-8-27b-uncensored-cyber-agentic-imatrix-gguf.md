# Narium/Qwen3.8-27B-Uncensored-Cyber-agentic-imatrix-GGUF

## Resumen

Este repositorio publica cuantizaciones GGUF del modelo philbert440/Qwen3.8-27B-Uncensored-Cyber, un modelo multimodal de tipo imagen-texto a texto, con la torre de visión y la cabeza de decodificación especulativa MTP preservadas, y con el comportamiento de rechazo eliminado ("abliterated") y especializado en el dominio de ciberseguridad y seguridad ofensiva. El trabajo aquí publicado corresponde únicamente a la cuantización y a la metodología de calibración: los pesos y el comportamiento proceden del modelo base, sin fine-tuning, merging ni modificación conductual alguna. El autor del repositorio es Narium y la licencia declarada es Apache 2.0.

La aportación técnica diferencial es una matriz de importancia (imatrix) generada a partir de tráfico real de agentes de programación en lugar de prosa genérica en inglés. El corpus de calibración se extrajo de 42 sesiones reales de un CLI de agente que conducía tareas de código contra este mismo modelo, con 648 turnos de diálogo y 528 llamadas reales a herramientas, incluyendo plantillas de chat y JSON de tool calling. La motivación es un fallo concreto y documentado: los canales que gobiernan la reproducción literal de rutas, nombres de paquete y hashes se degradan primero bajo cuantización cuando la imatrix se deriva de prosa, provocando que el agente escriba rutas corruptas y luego concluya que su propio contexto es inconsistente.

El repositorio ofrece dos artefactos IQ4_XS de aproximadamente 15 GB: uno con los pesos de texto sin injerto y otro con los tensores MTP añadidos para su uso en el runtime FastLLM. La relevancia actual es doble: por un lado, demuestra una metodología de calibración específica para cargas agénticas; por otro, advierte explícitamente de que se trata de un modelo sin rechazos orientado a seguridad ofensiva, lo que condiciona por completo su uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto a texto) con torre de visión y cabeza de decodificación especulativa MTP, según el modelo base; no se detalla la configuración interna de capas |
| Parametros totales | No disponible de forma fiable. Los metadatos de safetensors declaran 3.391.984 parametros, cifra incoherente con el nombre del modelo (27B) y con el tamano del repositorio (32,6 GB); el nombre sugiere aproximadamente 27 000 millones |
| Parametros activos | No aplica (no se describe una arquitectura MoE en la informacion disponible) |
| Longitud de contexto | 262 000 tokens (262 K) como contexto de servicio, citado en la model card del autor; no se confirma el valor de entrenamiento |
| Tipos de cuantizacion | IQ4_XS con imatrix (dos artefactos publicados); Q5_K_M comparado localmente y no publicado; el modelo de partida es Q8_0, con tipo de tensor de salida y de embedding de tokens en q8_0 |
| Idiomas soportados | No disponible en los metadatos; el corpus de calibración documenta mezcla de chino e ingles (prosa en chino, rutas y codigo en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), calculados sobre una release Q8_0 previa |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo philbert440/Qwen3.8-27B-Uncensored-Cyber, descrito como multimodal (pipeline image-text-to-text) y con una cabeza de decodificación especulativa MTP integrada. Esta ficha no puede detallar la configuración de capas, dimensiones ocultas, número de cabezas ni estrategia de atención, porque esa información no está incluida en los datos disponibles. Lo que sí se documenta es que la torre de visión y la cabeza MTP se preservan desde el modelo base, y que esa preservación es la condición necesaria para que la ruta multimodal y el injerto MTP funcionen.

En cuanto al entrenamiento, este repositorio no entrena nada: no hay fine-tuning, no hay merging y no hay cambio de comportamiento. El único proceso aplicado es cuantización con imatrix. La ingrediente novedosa es la matriz de importancia, generada con `llama-imatrix` sobre la release Q8_0 y un corpus de 1 MB procedente de tráfico real de agente: 42 sesiones, 648 turnos, 528 llamadas a herramientas con argumentos y rutas reales, 1191 apariciones de `<|im_start|>` y 547 de `<tool_call>`, procesado en 584 fragmentos con contexto de 512 tokens. Se usó `--parse-special` de forma deliberada: sin ese flag, los marcadores de plantilla de chat se tokenizan como texto literal y nunca entran en las estadísticas; el efecto medido en la misma familia de corpus fue pasar de 0.342 a 0.299 tokens por byte, una reducción del 12,7 %. El contexto se mantuvo en 512 en lugar de igualar los 262 K del servicio, porque para un presupuesto de tokens fijo un contexto pequeño produce más muestras y más diversas, y mejor condicionadas. La cuantización se ejecutó con `--allow-requantize --imatrix imatrix-agentic-v2.gguf --output-tensor-type q8_0 --token-embedding-type q8_0`, decisión que cuesta aproximadamente 1,5 GB y que se justifica porque el error en la capa de salida se traduce directamente en seleccionar el token equivocado, que es exactamente el fallo de copia literal descrito.

## Capacidades

- Generación de texto conversacional multi-turno, con contexto declarado de hasta 262 K tokens.
- Capacidades multimodales de entrada: el pipeline es image-text-to-text y la torre de visión se conserva desde el modelo base.
- Tool calling / function calling, con soporte explícito en la plantilla de chat (`<tool_call>`) y presencia significativa de llamadas a herramientas en el corpus de calibración.
- Flujos agénticos multi-paso: el corpus de calibración procede de un CLI de agente que ejecuta tareas de programación encadenadas.
- Generación de código y manipulación de shell, orientada a rutas de repositorio, nombres de paquete, hashes de commit y UUIDs de dispositivo reproducidos literalmente.
- Decodificación especulativa mediante la cabeza MTP injertada (solo en el artefacto `plus-mtp` y con un runtime compatible).
- Comportamiento sin rechazos ("abliterated" / de-refusal), especializado en dominio de ciberseguridad y seguridad ofensiva.
- Capacidad multilingüe no declarada formalmente; el corpus de calibración evidencia uso combinado de chino e inglés.
- Razonamiento y matemáticas: no se documentan capacidades específicas ni evaluaciones en la información disponible.

## Casos de uso

- Agentes de programación autónomos en terminal: el modelo está calibrado específicamente para preservar la fidelidad de tool calls y de literales largos (rutas, hashes, nombres de paquete), que es justo lo que se degrada primero con una imatrix genérica. Encaja en pipelines donde el agente lee la salida de sus propias herramientas y necesita que coincida con el contexto.
- Automatización de tareas de seguridad ofensiva en laboratorio controlado: al ser un modelo sin rechazos y ajustado al dominio cyber, se emplearía en entornos de pentest autorizados y CTFs, generando comandos y analizando resultados. Requiere aislamiento estricto por las razones indicadas en limitaciones.
- Auditoría de código asistida: análisis de repositorios con reproducción literal de rutas y referencias, aprovechando la calibración sobre tráfico real de repositorios y la ventana de 262 K tokens para procesar múltiples ficheros en una sola pasada.
- Integración en CI/CD para generación y revisión de parches: el soporte de tool calling permite invocar linters, ejecutar tests y aplicar cambios desde un agente, con el artefacto IQ4_XS ejecutable en una GPU de 24 GB o en una V100 de 32 GB.
- Análisis de interfaces y capturas mediante la torre de visión: al conservarse el encoder visual, se puede alimentar el modelo con capturas de pantalla de aplicaciones o paneles para extraer elementos, generar pasos de automatización o documentar flujos.
- Aceleración de inferencia en producción con MTP: usando el artefacto `plus-mtp` en un runtime que reconozca el injerto (FastLLM, según la model card), se habilita decodificación especulativa para reducir la latencia por token en despliegues interactivos.
- Asistente de operaciones y triaje de logs: con 262 K tokens de contexto puede ingerir volcados extensos de sesión y mantener coherencia entre eventos distantes, aunque no se publican métricas de calidad para esta tarea.
- Reproducción de la metodología de cuantización: el repositorio publica `imatrix-agentic-v2.gguf` (13,01 MiB) con su SHA-256, de modo que un equipo puede reconstruir el proceso con su propio corpus de tráfico agéntico y validar el efecto sobre sus canales críticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card menciona una comparación local frente a Q5_K_M medida sobre un corpus agéntico reservado, pero el texto disponible se interrumpe antes de mostrar las cifras, por lo que no se reproducen.

Los únicos datos numéricos verificables en la información disponible son de proceso y tokenización, no de calidad de tarea:

| Metrica | Valor | Contexto |
|---|---|---|
| Tokens por byte (sin `--parse-special`) | 0.342 | Misma familia de corpus de calibracion |
| Tokens por byte (con `--parse-special`) | 0.299 | Reduccion del 12,7 %; los marcadores colapsan en tokens unicos |
| Tamano del corpus de calibracion | 1,00 MB | 42 sesiones, 648 turnos, 528 llamadas a herramientas |
| Fragmentos procesados | 584 | Contexto de 512 tokens |
| Tamano de `imatrix-agentic-v2.gguf` | 13,01 MiB | SHA-256 `a219ff5f...0e59af69` |
| Tamano de IQ4_XS sin MTP | 14,96 GiB | SHA-256 `d11d28b9...ec2560b7` |
| Tamano de IQ4_XS plus-mtp | 15,38 GiB | SHA-256 `da6a418f...00d7a1ba` |

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 15 GiB en IQ4_XS (14,96 GiB sin MTP; 15,38 GiB con MTP), mas la cache KV correspondiente al contexto configurado.
- Cache KV: no se publican cifras. Con 262 K tokens de contexto la cache crece de forma muy significativa; para uso en GPU de 24 GB conviene reducir el contexto o aplicar cuantizacion de cache.
- GPU recomendadas segun la informacion disponible: la etiqueta del repositorio menciona explicitamente la V100 (32 GB). Por tamano de pesos, una RTX 4090 o similar de 24 GB es viable en IQ4_XS con contexto moderado; A100 y H100 son holgadas.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB como la RTX 4090, siempre que se limite la longitud de contexto. En GPUs de 12-16 GB requeriria descarga parcial a CPU o cuantizaciones mas agresivas, no publicadas en este repositorio.
- Opciones de despliegue: llama.cpp para el artefacto sin MTP; FastLLM para el artefacto `plus-mtp`, que es el artefacto de produccion declarado por el autor. No se documentan integraciones con vLLM, TGI, Ollama ni otros servidores.
- Latencia y throughput: no disponibles. La presencia de la cabeza MTP implica soporte de decodificacion especulativa y, por tanto, potencial de reduccion de latencia, pero no se publican mediciones.
- Advertencia de compatibilidad: no cargar el archivo `plus-mtp` en un runtime que no reconozca el injerto MTP; para cargadores GGUF convencionales debe usarse el archivo sin MTP.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de especificaciones completas de alternativas, por lo que la comparacion con modelos de la misma categoria no puede establecerse con cifras. La unica comparacion documentada es con el propio modelo de origen:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Narium/Qwen3.8-27B-Uncensored-Cyber-agentic-imatrix-GGUF | No disponible (nombre sugiere ~27B) | 262 K declarados en servicio | GGUF IQ4_XS (con y sin MTP) | Apache 2.0 | Publicado en este repositorio; 0 descargas y 0 likes en el momento de la consulta |
| philbert440/Qwen3.8-27B-Uncensored-Cyber | No disponible | No disponible en la informacion proporcionada | Pesos originales (Q8_0 usado como entrada) | Apache 2.0 | Repositorio base; documenta la receta y la evaluacion |
| Otras alternativas abliterated/uncensored de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible: no se han encontrado enlaces ni datos relevantes en la busqueda web |

## Limitaciones y advertencias

- Modelo sin rechazos ("abliterated") especializado en seguridad ofensiva: la propia model card advierte de que el comportamiento de de-refusal es intencional. El uso en producción exige controles de acceso, aislamiento y revisión humana.
- Sesgos conocidos: no documentados en la información disponible. El corpus de calibración tiene mezcla de chino e inglés y tráfico real de un único entorno de agente, lo que puede introducir sesgo hacia ese estilo de conversación y de tool calling.
- Riesgo de alucinación: no se publican evaluaciones de fidelidad ni de tasas de alucinación. El caso de fallo que motiva la imatrix (corrupción de literales durante la copia) es un riesgo intrínseco de la cuantización en 4 bits.
- Doble cuantización: los pesos se cuantizaron desde la release Q8_0 y no desde BF16, usando `--allow-requantize`. El autor lo señala como un compromiso: Q8_0 es casi sin pérdida y el error dominante es el paso a Q5/IQ4, pero sigue siendo una segunda cuantización.
- Contexto: el valor de 262 K se declara como contexto de servicio, no como contexto de entrenamiento verificado. No se confirma que el modelo mantenga calidad en todo ese rango.
- Idiomas: no hay lista oficial de idiomas soportados; no debe asumirse cobertura multilingüe amplia.
- Licencia Apache 2.0, que en principio permite uso comercial, pero el uso comercial de un modelo sin rechazos orientado a seguridad ofensiva conlleva riesgos legales y de cumplimiento que la licencia no cubre. Revisar la model card del modelo base antes de cualquier despliegue.
- El corpus de calibración no se publica (contiene rutas de repositorio, comandos de shell y conversaciones reales). Solo se publica la imatrix resultante, de modo que la reproducibilidad es metodológica, no de extremo a extremo.
- Repositorio con 0 descargas y 0 likes y creado el 15 de septiembre de 2026: sin validación comunitaria ni adopción documentada.
- Incoherencia en los metadatos: el recuento de parámetros declarado en safetensors (3.391.984) no es compatible con el tamaño del repositorio (32,6 GB) ni con el nombre del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Narium/Qwen3.8-27B-Uncensored-Cyber-agentic-imatrix-GGUF
- Modelo base: https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Cyber
- No se han encontrado enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada para este modelo.
