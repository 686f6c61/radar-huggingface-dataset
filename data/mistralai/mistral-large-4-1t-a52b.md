# mistralai/Mistral-Large-4-1T-A52B

## Resumen

Mistral Large 4 (nombre interno "Le Chonk") es el modelo mas grande publicado hasta la fecha por Mistral AI, una empresa francesa fundada en abril de 2023. Se trata de un modelo nativamente multimodal de tipo Mixture-of-Experts con aproximadamente 1 billon de parametros totales y unos 52.000 millones de parametros activos por token (49.000 millones en las capas del transformer, mas embeddings y capa de salida). Acepta entrada de texto e imagen y genera texto, y esta entrenado desde cero en 3.800 GPU NVIDIA Grace Blackwell en los propios centros de datos de Mistral en Europa.

El modelo unifica en un unico conjunto de pesos el seguimiento de instrucciones, el razonamiento, la generacion de codigo y los flujos agenticos, con una ventana de contexto de 1 millon de tokens. Incorpora un modo de razonamiento configurable por peticion con tres niveles de esfuerzo (`low`, `medium`, `high`) y un cabezal de decodificacion especulativa DSpark embebido en el checkpoint. Destaca especialmente en ciberseguridad, finanzas, derecho y en visual grounding, donde segun el autor supera a modelos cerrados de frontera.

Su relevancia actual reside en que es el primer modelo abierto de escala billonaria publicado por un laboratorio europeo, con licencia permisiva para uso comercial (salvo el negocio de Model-as-a-Service), soporte nativo en multiples frameworks de inferencia (vLLM, SGLang, transformers, llama.cpp) y una variante cuantizada NVFP4 para GPU Blackwell. El checkpoint completo ocupa 1.060,6 GB en el repositorio de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts multimodal (texto e imagen), con encoder de vision estilo Pixtral y cabezal de decodificacion especulativa DSpark |
| Parametros totales | ~1 billon (1T) |
| Parametros activos | ~52.000 millones por token (49.000 millones en capas del transformer, 52.000 millones incluyendo embeddings y capa de salida) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | NVFP4 (checkpoint oficial adicional); otros formatos no disponibles en la informacion proporcionada |
| Idiomas soportados | 160+ idiomas, incluidos todos los oficiales de la Union Europea; la model card lista 39 codigos ISO (en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn, bg, hr, cs, da, nl, et, fi, el, hu, ga, lv, lt, mt, sk, sl) |
| Licencia | Mistral Ecosystem Open-Weight License (version modificada de MIT; uso comercial y no comercial permitido, pero operar un negocio Model-as-a-Service requiere licencia comercial separada con Mistral) |
| Formato de pesos | safetensors (transformers); checkpoint NVFP4 adicional; soporte declarado en vLLM, SGLang y llama.cpp |

## Arquitectura y entrenamiento

Mistral Large 4 es un transformer de tipo Mixture-of-Experts con enrutamiento granular: 128 expertos enrutados con 4 activos por token y 1 experto compartido. Esta eleccion mantiene el coste computacional por token en el orden de decenas de miles de millones de parametros activos pese al billon de parametros totales, lo que hace viable el despliegue en clústeres multi-GPU. La multimodalidad es nativa: incorpora un encoder de vision estilo Pixtral entrenado para manejar tamanos y relaciones de aspecto de imagen variables, y produce exclusivamente salida de texto.

El entrenamiento se realizo desde cero sobre 3.800 GPU NVIDIA Grace Blackwell en centros de datos de Mistral en Europa; no se han publicado en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion detallada del dataset, ni si se aplicaron fases de RLHF o DPO. Entre las innovaciones tecnicas destacables figuran el modo de razonamiento con esfuerzo configurable por peticion, la adherencia fuerte a system prompts, la aplicacion estricta de JSON schema y un cabezal de decodificacion especulativa DSpark embebido en el propio checkpoint, que acelera la generacion sin necesidad de un modelo borrador externo. Existe ademas un checkpoint NVFP4 orientado a GPU Blackwell con menor huella de memoria y misma calidad declarada.

## Capacidades

- Generacion de texto, razonamiento de multiples pasos, codigo y matematicas en un unico conjunto de pesos.
- Modo de razonamiento configurable con tres niveles de esfuerzo (`low`, `medium`, `high`, por defecto `high`), lo que permite ajustar latencia y coste por peticion.
- Vision nativa: analisis de imagenes, graficos, dibujos tecnicos y documentos, con visual grounding de referencia entre modelos de pesos abiertos.
- Function calling nativo, salida JSON y cumplimiento estricto de JSON schema.
- Capacidades agenticas: razonamiento multi-paso y uso de herramientas en flujos automatizados.
- Multilingue nativo en mas de 160 idiomas, con cobertura de todas las lenguas oficiales de la Union Europea.
- Adherencia fuerte a system prompts.
- Rendimiento destacado en dominios de ciberseguridad, finanzas y derecho, con rechazo de peticiones maliciosas.
- Decodificacion especulativa integrada (DSpark) para acelerar la inferencia.

## Casos de uso

- Agentes de codigo en produccion: el modelo puede operar pipelines de CI/CD y tareas de refactorizacion multi-archivo; en el Artificial Analysis Coding Agent Index obtiene un 48% usando un 47% menos de tokens por tarea que el lider abierto, lo que reduce el coste por tarea en ejecuciones a escala.
- Analisis de documentos legales y contractuales: con 1M de tokens de contexto puede ingerir expedientes completos, contratos y jurisprudencia en una sola peticion, y su rendimiento declarado en derecho lo hace adecuado para revision asistida y extraccion estructurada con JSON schema.
- Ciberseguridad defensiva: triaje de alertas, analisis de trazas y generacion de informes de incidentes, aprovechando su rendimiento declarado como estado del arte entre modelos abiertos en seguridad y su rechazo de peticiones maliciosas.
- Atencion al cliente multilingue: conversaciones multi-turno con contexto largo y cobertura de 160+ idiomas, incluidos todos los oficiales de la UE, lo que permite atender usuarios en su lengua sin modelos auxiliares.
- Analisis de documentos tecnicos con vision: interpretacion de planos, diagramas y graficos junto a texto, con grounding visual para localizar elementos concretos en la imagen (por ejemplo, componentes en un esquema o celdas en una tabla escaneada).
- Automatizacion financiera: extraccion de datos de estados financieros e informes, conciliacion y generacion de resumenes con salida JSON validada contra esquema, integrable en herramientas internas mediante function calling.
- Asistentes agenticos con herramientas: orquestacion de APIs y sistemas internos con esfuerzo de razonamiento `high` para tareas complejas y `low` para respuestas rapidas de chat, ajustando coste y latencia por peticion.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| Artificial Analysis Coding Agent Index | 48% | Practicamente empatado con GLM-5.3 (lider abierto) usando un 47% menos de tokens por tarea de media |
| Artificial Analysis Intelligence Index v5 | 26 | El mas alto entre modelos abiertos occidentales; los lideres abiertos chinos puntuan mas alto en este indice agregado |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks detallados; el autor remite al blog y al informe tecnico para mas datos, especialmente en ciberseguridad, finanzas y derecho.

## Requisitos de hardware

- El checkpoint completo en safetensors ocupa 1.060,6 GB en el repositorio, por lo que la inferencia en precision completa requiere un clúster multi-GPU; no cabe en una sola GPU convencional.
- El checkpoint NVFP4 oficial reduce la huella de memoria y esta orientado a GPU NVIDIA Blackwell, con soporte en vLLM y SGLang; no se especifica en la informacion disponible el tamano exacto del checkpoint cuantizado.
- GPU recomendadas: NVIDIA Grace Blackwell (entrenamiento y despliegue de referencia), H100 y A100 para despliegues multi-GPU en precision completa; el NVFP4 apunta a Blackwell.
- No cabe en GPU de consumo (RTX 4090 y similares) en ninguna configuracion documentada; el soporte en llama.cpp esta declarado pero no se detallan requisitos minimos.
- Opciones de despliegue: vLLM, SGLang, transformers y llama.cpp; tambien disponible como `mistral-large-4` en la API de Mistral.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; el uso de decodificacion especulativa DSpark y del checkpoint NVFP4 esta orientado a mejorar ambos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral Large 4 | ~1T totales / ~52B activos | 1M tokens | Coding Agent Index 48%; Intelligence Index v5 26 | Mistral Ecosystem Open-Weight License (comercial con restriccion MaaS) | Pesos en Hugging Face, API Mistral, vLLM, SGLang, llama.cpp |
| GLM-5.3 | no disponible | no disponible | Coding Agent Index practicamente empatado con Mistral Large 4, con mas tokens por tarea | no disponible | no disponible |
| Modelos abiertos chinos lideres en Intelligence Index v5 | no disponible | no disponible | Puntuacion superior a 26 en el indice agregado | no disponible | no disponible |

Los datos de comparacion disponibles se limitan a los indices de Artificial Analysis citados por el autor; no se dispone de especificaciones detalladas de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado tasas de error especificas en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada; la cobertura de 160+ idiomas no garantiza calidad homogenea en todos ellos.
- La licencia, aunque permisiva para uso comercial, prohibe operar un negocio Model-as-a-Service sin licencia comercial separada con Mistral; conviene revisar los terminos antes de ofrecer el modelo como servicio.
- El despliegue en precision completa exige infraestructura multi-GPU de gama alta; el coste operativo es elevado y el checkpoint NVFP4 solo esta optimizado para Blackwell.
- El modo de razonamiento por defecto es `high`, lo que incrementa latencia y consumo de tokens si no se ajusta por peticion.
- El soporte en llama.cpp esta declarado, pero no se detallan en la informacion disponible los requisitos minimos ni el rendimiento en ese backend.
- No se han publicado detalles sobre composicion del dataset de entrenamiento ni sobre fases de alineacion (RLHF/DPO), lo que limita la evaluacion independiente de sesgos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B)
- [Checkpoint NVFP4](https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B-NVFP4)
- [Blog de Mistral Large 4](https://mistral.ai/news/mistral-large-4-oss/)
- [Informe tecnico (PDF)](https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/assets/technical_report.pdf)
- [Documentacion de la API de Mistral (`mistral-large-4`)](https://docs.mistral.ai/models/mistral-large-4-0)
- [Licencia Mistral Ecosystem Open-Weight License](https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B/blob/main/LICENSE)
- [Galeria de demos Le Chonk](https://mistralai-ml4-le-chonk-gallery.hf.space/)
- [Mistral Vibe (agente de codigo)](https://github.com/mistralai/mistral-vibe)
- [Sitio web de Mistral AI](https://mistral.ai/)
- [Mistral AI en Wikipedia](https://fr.wikipedia.org/wiki/Mistral_AI)
