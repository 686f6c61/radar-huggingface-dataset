# IloveAi333/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED-GGUF

## Resumen

Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED-GGUF es una distribucion en formato GGUF del modelo DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED, un fine-tune orientado a escritura creativa y roleplaying sobre una base Qwen 3.5 de aproximadamente 9.000 millones de parametros. El autor del repositorio es IloveAi333, mientras que las cuantizaciones han sido generadas por mradermacher a partir del modelo original de DavidAU. El modelo se presenta como "heretic" y "abliterated", terminos que en la comunidad open source designan intervenciones para reducir los rechazos del modelo ante contenido sensible.

El modelo resuelve la necesidad de un asistente de generacion de ficcion con estilos de prosa vividos, capaz de mantener tramas y sub-tramas en generaciones largas y de operar sin las restricciones de alineacion habituales de los modelos instruct estandar. Su tamano de 8.953.803.264 parametros lo situa en la franja de 9B, lo que permite ejecucion en GPU de consumo con cuantizaciones de 4 a 6 bits, y su empaquetado GGUF facilita el despliegue con llama.cpp, Ollama y motores compatibles.

La relevancia actual del repositorio radica en su doble naturaleza: por un lado es una cuantizacion estatica de un fine-tune especializado en escritura creativa, y por otro incluye el tag "endpoints_compatible" y una licencia Apache 2.0 que simplifican su integracion en pipelines. No obstante, la model card disponible es la generada por el cuantizador y no incluye detalles de entrenamiento, datos ni evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen 3.5, sin detalle en la informacion proporcionada) |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-f16 y mmproj-Q8_0 (suplemento multimodal) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en transformers con bfloat16 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El modelo deriva de la familia Qwen 3.5, de la que hereda presumiblemente un transformer decoder-only, pero no se especifican capas, dimensiones ocultas, mecanismos de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa. El repositorio incluye un suplemento multimodal (mmproj) en las cuantizaciones, lo que sugiere que el modelo base podria aceptar entradas de imagen, aunque no se confirma en la informacion disponible.

En cuanto al entrenamiento, la model card solo indica que se trata de un fine-tune del modelo DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED, con tags que apuntan a escritura creativa, generacion de tramas, continuacion de escenas y roleplaying. No se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o abliteration. El tag "heretic" y "uncensored" sugiere una intervencion deliberada para eliminar comportamientos de rechazo, pero no se documenta el metodo.

## Capacidades

- Generacion de texto creativo en ingles y chino, con enfasis en prosa vivida y estilos literarios variados.
- Escritura de ficcion: generacion de tramas, sub-tramas, escenas, continuaciones y dialogos.
- Roleplaying conversacional y mantenimiento de personajes en interacciones multi-turno.
- Cobertura de generos: ciencia ficcion, romance y, segun los tags, "all genres".
- Modo instructivo para tareas generales, segun el tag "all use cases".
- Comportamiento "uncensored" o "abliterated": menor tendencia a rechazar peticiones sensibles.
- Posible soporte multimodal (entrada de imagen) por la presencia de ficheros mmproj en las cuantizaciones, aunque no confirmado en la documentacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades matematicas o de codigo: no documentadas en la informacion proporcionada.

## Casos de uso

- Escritura de ficcion por capitulos: el modelo puede generar escenas y continuaciones coherentes con un estilo vivido, adecuado para autores que necesitan borradores rapidos o superar bloqueos creativos.
- Roleplaying narrativo: su orientacion a personajes y dialogos multi-turno lo hace util en aplicaciones de entretenimiento conversacional, siempre que se gestionen los riesgos de contenido.
- Generacion de tramas y sub-tramas: util en herramientas de planificacion narrativa que necesitan proponer arcos argumentales alternativos a partir de una premisa.
- Asistencia a guionistas y novelistas: integrable en editores de texto o entornos de escritura para sugerir continuaciones de escena con un tono consistente.
- Prototipado de videojuegos narrativos: puede alimentar dialogos dinamicos de NPC en motores de juego que consuman una API local compatible con GGUF.
- Despliegue local en estaciones de trabajo: al caber en cuantizaciones de 4 a 6 bits en GPU de consumo, permite iterar sobre textos sin depender de servicios en la nube y sin coste por token.
- Experimentacion con modelos "abliterated": util para investigadores que estudian el efecto de las intervenciones de alineacion en la calidad y el estilo de la generacion, comparando este fine-tune con su base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K ~3,7 GB; Q3_K_S ~4,4 GB; Q4_K_S ~5,4 GB; Q4_K_M ~5,7 GB; Q5_K_M ~6,6 GB; Q6_K ~7,5 GB; Q8_0 ~9,6 GB; f16 ~18 GB. Los ficheros mmproj anaden entre 0,7 y 1,0 GB si se usa el modo multimodal.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 y H100 para las cuantizaciones altas o f16.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6 GB o mas usando Q4_K_M o inferiores; con Q8_0 se recomienda 12 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base puede cargarse con transformers en bfloat16.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| IloveAi333/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED-GGUF | ~8,95B | no disponible | Apache 2.0 | GGUF | Cuantizacion estatica de un fine-tune creativo "uncensored" |
| DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED | ~8,95B | no disponible | Apache 2.0 | safetensors/bfloat16 | Modelo base del que deriva esta cuantizacion |
| mradermacher/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED-i1-GGUF | ~8,95B | no disponible | Apache 2.0 | GGUF (imatrix) | Cuantizaciones ponderadas con imatrix, alternativa de mayor calidad |
| Qwen 3.5 base (familia) | ~9B | no disponible | no disponible | varios | Modelo original sobre el que se construye el fine-tune; sin datos de rendimiento en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan comparar el rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- La model card no documenta el proceso de entrenamiento, los datos utilizados ni las evaluaciones, por lo que la calidad real del fine-tune no esta verificada de forma independiente.
- El caracter "uncensored" y "abliterated" implica que el modelo puede generar contenido sensible, ofensivo o inapropiado; no es adecuado para aplicaciones de cara al publico sin filtros externos.
- Riesgo de alucinacion inherente a los modelos de ~9B, especialmente en tareas factuales; su orientacion es creativa, no de precision.
- Idiomas soportados limitados a ingles y chino; el rendimiento en castellano no esta documentado y probablemente sea inferior.
- Longitud de contexto no disponible, lo que impide garantizar el manejo de documentos largos o conversaciones extensas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de fine-tune podrian tener restricciones adicionales no reflejadas en esta ficha.
- El repositorio tiene muy pocas descargas (458) y cero likes en el momento de la consulta, lo que reduce la evidencia de uso en produccion.
- El tag "endpoints_compatible" sugiere compatibilidad con endpoints, pero no se detalla que API o proveedor.
- La fecha de creacion indicada (2026-10-31) es posterior a la fecha habitual de publicacion de modelos Qwen 3.5; conviene verificar la autenticidad y procedencia del repositorio antes de usarlo en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IloveAi333/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT-HERETIC-UNCENSORED-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
