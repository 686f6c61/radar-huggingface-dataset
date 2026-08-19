# bartowski/badtheorylabs_BTL-4-GGUF

## Resumen

BTL-4 es un modelo de lenguaje multimodal de 35 000 millones de parámetros desarrollado por badtheorylabs, distribuido en esta página como cuantizaciones GGUF preparadas por bartowski mediante llama.cpp con matriz de importancia (imatrix). El modelo acepta entradas de texto e imagen (pipeline image-text-to-text) y está orientado a tareas de agente, uso de herramientas, generación de código y razonamiento, según los metadatos publicados. Su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

La relevancia de esta publicación radica en que ofrece un amplio abanico de cuantizaciones (desde bf16 hasta IQ3_XXS) que permiten ejecutar un modelo de 35B en hardware diverso, desde estaciones con GPU de 24 GB hasta servidores con 80 GB de VRAM. El formato de prompt incluye un marcador `thinking` tras el rol de asistente, lo que sugiere un modo de razonamiento explícito antes de la respuesta final, similar al de otros modelos recientes con capacidad de reflexión.

No se dispone de información pública sobre la arquitectura interna del modelo base, los datos de entrenamiento ni la longitud de contexto, por lo que esta ficha se basa únicamente en los datos proporcionados por el cuantizador y los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer multimodal de 35B, sin detalles publicos) |
| Parametros totales | 34.660.610.688 (35B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_1, Q4_K_L, Q4_K_M, Q4_K_S, Q4_0, IQ4_NL, IQ4_XS, Q3_K_XL, IQ3_M, Q3_K_L, Q3_K_M, IQ3_XS, Q3_K_S, IQ3_XXS |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones), safetensors (modelo original) |

## Arquitectura y entrenamiento

No se han publicado detalles sobre la arquitectura interna del modelo base BTL-4. Los metadatos indican que es un modelo de 35 000 millones de parámetros con pipeline image-text-to-text, lo que implica un codificador visual adicional al transformer de lenguaje, pero se desconoce si emplea atención estándar, MoE, SSM o alguna variante híbrida. Tampoco hay información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

El cuantizador bartowski utilizó llama.cpp en su versión b10262 para generar las cuantizaciones GGUF con imatrix, una técnica que mejora la calidad de los pesos cuantizados al calibrar la matriz de importancia sobre datos representativos. El modelo no soporta MTP (multi-token prediction). El formato de prompt es ChatML con un marcador `thinking` tras el rol de asistente, lo que sugiere que el modelo fue entrenado para generar un bloque de razonamiento interno antes de emitir la respuesta final.

## Capacidades

- Generacion de texto y razonamiento: el formato de prompt con `thinking` indica capacidad de razonamiento explicito antes de responder.
- Comprension de imagenes: al ser multimodal (image-text-to-text), puede procesar entradas visuales junto con texto, aunque no se especifican los tipos de imagen soportados.
- Uso de herramientas (tool calling): el tag `tool-use` indica soporte para invocar funciones externas durante la generacion.
- Capacidades de agente: el tag `agentic` sugiere que puede encadenar multiples pasos de razonamiento y acciones.
- Generacion de codigo: el tag `code` indica entrenamiento o fine-tuning especifico para tareas de programacion.
- Formato de conversacion ChatML: compatible con el estandar de OpenAI para sistemas de chat y agentes.

## Casos de uso

- Desarrollo de software asistido: el modelo puede generar, revisar y explicar codigo en multiples lenguajes. Su modo de razonamiento permite depurar errores complejos mostrando el proceso de analisis antes de proponer una solucion.
- Agentes autonomos con acceso a herramientas: al soportar tool calling, puede integrarse en pipelines que consultan APIs, bases de datos o ejecutan comandos, por ejemplo en sistemas de automatizacion de operaciones de TI.
- Analisis de documentacion tecnica con figuras: al aceptar imagenes, puede procesar diagramas de arquitectura, capturas de pantalla de errores o graficos de rendimiento para generar explicaciones o recomendaciones.
- Atencion al cliente con soporte visual: puede gestionar conversaciones donde el usuario adjunta capturas de pantalla o fotos de productos, combinando comprension visual y textual para resolver incidencias.
- Generacion de informes tecnicos: combina razonamiento estructurado y comprension de datos para redactar informes de incidentes, resumenes de codigo o documentacion de proyectos.
- Automatizacion de pruebas de software: puede generar casos de prueba a partir de especificaciones y codigo fuente, y razonar sobre posibles fallos en escenarios complejos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo en la documentacion proporcionada.

## Requisitos de hardware

- Cuantizacion Q4_K_M (21.39 GB): requiere aproximadamente 24 GB de VRAM. Cabe en GPU como RTX 4090, RTX 3090 o A6000. Es la opcion recomendada para la mayoria de casos.
- Cuantizacion Q5_K_M (25.02 GB): requiere aproximadamente 28 GB de VRAM. Necesita GPU de 32 GB o mas, como A6000 o A100.
- Cuantizacion Q8_0 (36.91 GB): requiere aproximadamente 40 GB de VRAM. Solo en GPU profesionales como A100 40 GB o H100.
- Cuantizacion bf16 (69.38 GB): requiere aproximadamente 80 GB de VRAM. Exclusivo para A100 80 GB, H100 o similares.
- En CPU: las cuantizaciones Q3 y Q4 pueden ejecutarse con llama.cpp en sistemas con 32-64 GB de RAM, con latencia significativamente mayor que en GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para el modelo original en safetensors se puede usar vLLM o TGI.
- Latencia y throughput: no disponibles. Dependen del hardware, la cuantizacion y la longitud de la ventana de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Tool calling |
|---|---|---|---|---|---|
| BTL-4 (este) | 35B | no disponible | Apache 2.0 | Si | Si |
| Qwen2.5-32B-Instruct | 32B | 128K | Apache 2.0 | No | Si |
| Yi-1.5-34B-Chat | 34B | 4K (ampliable) | Apache 2.0 | No | No |
| Gemma-2-27B | 27B | 8K | Gemma license | No | No |

No se dispone de resultados de benchmarks que permitan comparar el rendimiento real de BTL-4 frente a estas alternativas. La comparativa se limita a caracteristicas generales. Qwen2.5-32B es el competidor mas directo por tamano y licencia, aunque no es multimodal. Yi-1.5-34B es similar en parametros pero con contexto mas corto y sin soporte de herramientas.

## Limitaciones y advertencias

- No se ha publicado la longitud de contexto, lo que impide conocer los limites de ventana para conversaciones largas o documentos extensos.
- No hay informacion sobre los idiomas soportados; es posible que el rendimiento fuera del ingles sea limitado.
- Riesgo de alucinacion en tareas de razonamiento complejo o cuando se le piden datos factuales precisos, como en cualquier modelo de esta escala.
- Sesgos no documentados: al no publicarse detalles del dataset de entrenamiento, no se pueden evaluar sesgos de genero, raza o cultura.
- Las cuantizaciones de baja precision (Q3, IQ3) pueden degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento y codigo.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantias de soporte ni mantenimiento por parte del desarrollador.
- El modelo es reciente y no cuenta con un ecosistema de herramientas o evaluaciones externas consolidadas.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/bartowski/badtheorylabs_BTL-4-GGUF
- Modelo base original: https://huggingface.co/badtheorylabs/BTL-4
