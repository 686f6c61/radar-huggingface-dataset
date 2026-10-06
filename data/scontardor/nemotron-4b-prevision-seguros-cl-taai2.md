# scontardor/nemotron-4b-prevision-seguros-cl-taai2

## Resumen

`scontardor/nemotron-4b-prevision-seguros-cl-taai2` es un adaptador LoRA publicado en HuggingFace por el usuario scontardor, construido sobre el modelo base `nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1`. El adaptador especializa un modelo denso de 4.000 millones de parametros en el dominio de la prevision y los seguros de personas en Chile, y se distribuye exclusivamente como pesos de adaptador en formato PEFT (`library_name: peft`), con un tamano de repositorio de 0,1 GB.

El modelo nace como entregable del curso Topicos Avanzados en IA 2 (TAAI2) del Magister en IA de la Universidad Adolfo Ibanez (UAI, 2026) y su proposito declarado es estrictamente educativo. No es asesoria previsional, financiera ni de seguros, y la propia model card prohibe su uso con usuarios reales. Se trata, por tanto, de un artefacto de investigacion y docencia, no de un modelo listo para produccion.

Su relevancia actual es metodologica: documenta un pipeline autonomo de 8 rondas de curriculo adaptativo con modelos profesor y juez basados en LLM, 1.598 ejemplos sinteticos y un coste total de API de 7,39 USD sobre una unica GPU L4. El adaptador entrena 30,4 millones de parametros (el 0,67% del modelo base) con rango r=16 y alpha=32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1); el artefacto publicado es un adaptador LoRA |
| Parametros totales | 4.000 millones en el modelo base; adaptador LoRA con 30,4 millones de parametros entrenables (0,67% del total) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base de la familia Llama 3.1) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene el adaptador; las cuantizaciones dependerian de una fusion previa con el modelo base) |
| Idiomas soportados | Espanol (etiqueta `es` en la model card); dominio linguistico orientado a Chile |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA, `library_name: peft`) |
| Rango y alpha de LoRA | r=16, alpha=32 |
| Tamano del repositorio | 0,1 GB |
| Modelo base | nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango (r=16, alpha=32) que se aplica sobre `nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1`, un transformer decoder-only denso de 4.000 millones de parametros perteneciente a la familia Llama 3.1 de Meta, adaptado por NVIDIA. El adaptador congela los pesos del modelo base e introduce matrices de bajo rango en las capas de atencion y proyeccion, entrenando unicamente 30,4 millones de parametros, lo que representa el 0,67% del total. No hay informacion disponible sobre cuantizacion, destilacion o tecnicas de atencion alternativa mas alla de lo heredado del modelo base.

El entrenamiento siguio un pipeline autonomo de 8 rondas con curriculo adaptativo. En cada ronda intervenian tres roles desempenados por LLM: un modelo profesor (`gpt-6-sol`) que generaba ejemplos, un componente de curriculo (`gpt-6-luna`) que ajustaba la dificultad y un juez (`gpt-6-sol`) que evaluaba las respuestas. Se generaron 1.598 ejemplos sinteticos y se realizaron 2 epocas de entrenamiento por ronda sobre una GPU L4. El coste total de las llamadas a API fue de 7,39 USD. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales.

## Capacidades

- Generacion de texto en espanol orientada al dominio previsional y de seguros de personas en Chile (pensiones, rentas vitalicias, SCOMP, reembolsos de salud).
- Respuesta a preguntas conceptuales y explicativas del dominio, con calidad limitada segun la evaluacion del propio autor.
- Razonamiento basico y calculo aritmetico relacionado con el dominio, con errores reconocidos por el autor.
- Capacidad multilingue limitada: la model card declara unicamente espanol (`es`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- No se documenta soporte de vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidad de adaptacion mediante PEFT, lo que permite cargarlo y descargarlo sobre el modelo base sin duplicar los 4.000 millones de parametros.

## Casos de uso

- Prototipado academico de asistentes de orientacion previsional en Chile: el adaptador permite experimentar con respuestas sobre AFP, rentas vitalicias y SCOMP en un entorno docente, sin exponer usuarios reales y con un coste de inferencia bajo gracias a los 4.000 millones de parametros del base.
- Generacion de material didactico: producir borradores de explicaciones y preguntas de repaso sobre el sistema de pensiones chileno para cursos o talleres internos, siempre con revision humana posterior dado el 70% de respuestas por debajo del umbral de aprobacion.
- Investigacion sobre pipelines SLM autonomos: replicar o auditar el esquema de curriculo adaptativo con profesor, juez y entrenamiento LoRA descrito en la model card, usando este adaptador como linea base reproducible.
- Estudio de robustez de LoRA en dominios regulados: analizar como un adaptador del 0,67% de los parametros se comporta en un nicho normativo cambiante y que tipo de errores conceptuales emergen.
- Punto de partida para fine-tuning adicional: al ser un adaptador PEFT, puede recombinarse con datos reales anotados por expertos para intentar superar el techo de nota 5,65 sobre 10 documentado.
- Evaluacion comparativa de jueces LLM: el examen fijo de 40 preguntas y las notas por ronda permiten estudiar la correlacion entre la evaluacion automatica y la calidad percibida.
- Formacion interna de agentes de seguros (entorno controlado): apoyar simulaciones de conversacion con polizas y glosarios sinteticos, dejando claro que no sustituye a un asesor previsional ni a la CMF.

## Benchmarks y rendimiento

El autor publica una evaluacion propia sobre un conjunto fijo de 40 preguntas nunca vistas en entrenamiento, calificadas por un juez LLM de 0 a 10, con umbral de aprobacion en nota mayor o igual a 7. No se trata de benchmarks estandar como MMLU, HumanEval o GSM8K, y no hay resultados de ese tipo en la informacion disponible.

| Ronda | Nota media | Tasa de aprobacion |
|---|---|---|
| 0 (base) | 1,60 | 0% |
| 2 | 3,62 | 2% |
| 4 | 4,50 | 5% |
| 6 | 5,17 | 20% |
| 8 (adaptador final) | 5,65 | 30% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base de 4.000 millones de parametros: aproximadamente 8 GB en FP16, en torno a 5 GB en cuantizacion de 8 bits y alrededor de 2,5-3 GB en cuantizacion de 4 bits. El adaptador anade unicamente unas decenas de megabytes.
- GPU utilizada en el entrenamiento: NVIDIA L4 (segun la model card).
- GPU recomendadas: L4 o T4 para experimentacion; RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4090 o A100 para mayor throughput. Cualquier GPU con 8 GB o mas puede ejecutar el modelo base en FP16 y con 4 GB o mas en cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, incluidas RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4090, tanto en FP16 como en cuantizacion.
- Opciones de despliegue: PEFT junto con Transformers para cargar el adaptador; vLLM con soporte de adaptadores LoRA; TGI; llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nemotron-4b-prevision-seguros-cl-taai2 (este adaptador) | 4.000 M (base) + 30,4 M (LoRA) | no disponible | Nota media 5,65/10 en examen propio de 40 preguntas | no disponible | HuggingFace, 0 descargas, 0 likes |
| nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1 (modelo base) | 4.000 M | no disponible | linea base del examen: 1,60/10 | no disponible | HuggingFace (NVIDIA) |
| Otros adaptadores LoRA de dominio financiero en espanol | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables sobre alternativas comparables de la misma categoria (adaptadores LoRA en espanol para prevision y seguros en Chile), por lo que la comparativa se limita al modelo base y a la ausencia de informacion sobre terceros.

## Limitaciones y advertencias

- El propio autor indica que el 70% de las respuestas no alcanza el umbral de aprobacion, con errores de calculo y confusiones conceptuales en rentas vitalicias, SCOMP y reembolsos de seguros de salud.
- Uso previsto exclusivamente educativo. La model card prohibe explicitamente su uso con usuarios reales y recuerda que no constituye asesoria previsional, financiera ni de seguros.
- Evaluacion debil: un unico juez LLM, sin revision humana y con un examen de solo 40 preguntas.
- Entrenamiento sobre datos sinteticos generados por un modelo profesor, por lo que puede heredar y amplificar sus errores.
- La normativa chilena cambia con el tiempo, de modo que la informacion puede quedar desactualizada.
- No se declara licencia, lo que deja el uso comercial en una situacion juridica indeterminada y, en la practica, impediria su explotacion en produccion.
- Riesgo de alucinacion elevado en cifras, tasas y procedimientos administrativos concretos.
- Soporte multilingue limitado al espanol y sin datos sobre calidad en otras variantes del idioma.
- Sesgos conocidos: no disponibles de forma explicita en la informacion proporcionada, aunque al derivar de datos sinteticos y de un modelo base entrenado mayoritariamente en ingles se pueden esperar sesgos de dominio y de representacion del sistema previsional chileno.
- Repositorio sin descargas ni likes, sin pipeline declarado y con licencia sin especificar: no hay senales de uso o validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/scontardor/nemotron-4b-prevision-seguros-cl-taai2
- Modelo base: https://huggingface.co/nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1
- La busqueda web no devolvio enlaces relevantes al modelo (los resultados obtenidos correspondian a restaurantes y no guardaban relacion con el artefacto).
