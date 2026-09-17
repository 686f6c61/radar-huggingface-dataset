# d4rkninja/tanpo-hiring

## Resumen

tanpo-hiring es un ajuste fino (fine-tune) especializado en reclutamiento y selección de personal, publicado por el usuario d4rkninja bajo la marca DarkLab de DarkNinja Solutions. Se construye sobre unsloth/LFM2.5-1.2B-Instruct, un modelo de la familia LFM2 de Liquid AI con 1.170.340.608 parámetros (aproximadamente 1,17 mil millones), y se distribuye como pesos fusionados en formato Transformers, además de un adaptador LoRA y una versión GGUF en repositorios separados.

El problema que aborda es acotado pero real: los asistentes generalistas rinden de forma irregular en tareas de recruiting estructurado (descripciones de puesto, rúbricas de evaluación, guiones de cribado, diseño de bucles de entrevistas, calibración de debriefs, encuadre de ofertas y gestión de rechazos). El autor reporta una mejora de 9,2 puntos porcentuales sobre el modelo base en una rúbrica propia de 20 tareas (de 83,8 % a 92,9 %) y una mejora en calidad heurística de 6,40 a 7,18 sobre 10.

Su relevancia es la de los modelos pequeños y especializados: al ser un modelo de 1,2B, puede ejecutarse en hardware de consumo, en CPU o en una GPU modesta, lo que permite desplegar un asistente de recruiting interno sin depender de APIs externas. La contrapartida es que se trata de un artefacto muy reciente, con cero descargas y cero valoraciones en el momento de redactar esta ficha, y con una evaluación basada únicamente en la rúbrica del propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia LFM2 (etiqueta `lfm2`); sin detalles adicionales en la informacion disponible |
| Parametros totales | 1.170.340.608 (aproximadamente 1,17 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos originales en safetensors; version GGUF publicada aparte, con Q4_K_M recomendado por el autor para uso diario; adaptador LoRA en PEFT |
| Idiomas soportados | No disponible |
| Licencia | `other` (no se detalla el texto de la licencia en la informacion disponible) |
| Formato de pesos | safetensors (Transformers), GGUF (llama.cpp / LM Studio), adaptador LoRA (PEFT) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo instructivo unsloth/LFM2.5-1.2B-Instruct, de la familia LFM2. El repositorio principal contiene los pesos fusionados (merged) listos para cargar con `transformers` o con Unsloth, y el autor publica por separado el adaptador LoRA y una conversion GGUF. La model card no especifica la composicion del dataset de ajuste, el numero de tokens de entrenamiento, ni si se emplearon tecnicas de alineacion como RLHF o DPO; tampoco detalla innovaciones de inferencia (decodificacion especulativa, atencion lineal u otras). Toda esa informacion debe considerarse no disponible.

Lo unico documentado sobre el proceso es la evaluacion comparativa: el ajuste y el modelo base se evaluaron con la misma rubrica de 20 tareas y la misma configuracion de decodificacion, y el autor reporta una ganancia de 9,2 puntos porcentuales. La model card advierte explicitamente que los resultados de rubrica automatizada son direccionales y no sustituyen el juicio humano en seleccion.

## Capacidades

- Generacion de texto conversacional orientada a tareas de recruiting, con plantilla de chat (`apply_chat_template`) y soporte de mensaje de sistema.
- Redaccion de descripciones de puesto para rol, nivel, region y equipo concretos.
- Elaboracion de rubricas (scorecards) de evaluacion con criterios basados en evidencia.
- Redaccion de secuencias de contacto para reclutamiento outbound y outreach multicanal.
- Generacion de guiones de cribado y de entrevistas estructuradas con bancos de preguntas.
- Diseno de bucles de entrevistas, asignacion de entrevistadores y kits estructurados.
- Apoyo a la calibracion de debriefs y a la higiene en la toma de decisiones.
- Encuadre de ofertas, planes de cierre y gestion de expectativas.
- Operativa de pipeline de rechazo y cuidado de la experiencia del candidato.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, uso agentico, vision, audio ni modo de razonamiento explicito. Tampoco se documentan capacidades multilingues.

## Casos de uso

- Redaccion de ofertas de empleo a escala: el modelo puede generar descripciones de puesto parametrizadas por nivel, region y equipo, lo que encaja en equipos de recruiting que publican decenas de vacantes al mes y necesitan un primer borrador consistente.
- Diseno de procesos de seleccion estructurados: permite construir bucles de entrevista completos, con asignacion de entrevistadores y kits de preguntas, util para startups que estandarizan su proceso por primera vez.
- Cribado telefonico asistido: genera guiones de cribado con preguntas de evidencia, adecuado para reclutadores junior que necesitan un marco repetible.
- Calibracion de debriefs: sirve como material de apoyo para preparar sesiones de decision post-entrevista y reducir sesgos de juicio, siempre con supervision humana.
- Reclutamiento outbound: redacta secuencias de contacto multicanal para candidatos pasivos, un caso tipico en busquedas tecnologicas dificiles.
- Gestion de rechazos y experiencia de candidato: ayuda a redactar comunicaciones de rechazo y a ordenar el pipeline de descartes manteniendo una experiencia cuidada.
- Despliegue local o on-premise: al ser un modelo de 1,2B en formato GGUF, puede ejecutarse en un portatil para prototipar herramientas internas de recruiting sin enviar datos de candidatos a terceros, algo relevante por motivos de privacidad y RGPD.
- Encuadre y cierre de ofertas: apoyo a la redaccion de propuestas y planes de cierre con expectativas explicitas, util en equipos de talent acquisition con alta presion de tiempo.

## Benchmarks y rendimiento

Los unicos datos disponibles son los de la rubrica propia del autor (20 tareas de recruiting, misma configuracion de decodificacion para base y ajuste). No son benchmarks estandar ni han sido verificados de forma independiente.

| Modelo | Rubrica global | Calidad heuristica (0-10) | Delta vs base |
|---|---:|---:|---:|
| Base LFM2.5 | 83,8 % | 6,40 | — |
| tanpo-hiring (fine-tune) | 92,9 % | 7,18 | +9,2 pts |

Desglose por tematica de recruiting del fine-tune:

| Tematica | Rubrica |
|---|---:|
| Debrief calibration | 87,5 % |
| Hiring scorecards | 100,0 % |
| Interview loop design | 100,0 % |
| Job descriptions | 100,0 % |
| Offer framing | 87,5 % |
| Outbound recruiting | 100,0 % |
| Rejection pipeline operations | 87,5 % |
| Screening scripts | 100,0 % |
| Structured interview kits | 77,8 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: en torno a 2,4-3 GB de pesos mas overhead de activaciones y cache KV; en la practica, entre 3 y 4 GB.
- VRAM estimada en cuantizacion Q4_K_M: aproximadamente 1 GB de pesos, manejable en GPUs de 4 GB o incluso en CPU con RAM suficiente.
- El repositorio ocupa 2,3 GB, coherente con pesos de precision completa para 1,17B parametros.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 y similares, e incluso en GPUs de gama baja con cuantizacion. Tambien es viable en CPU y en Mac con Apple Silicon via llama.cpp.
- Opciones de despliegue: `transformers`, Unsloth, llama.cpp y LM Studio mediante el GGUF publicado, y potencialmente vLLM o TGI con la variante de pesos Transformers. No hay confirmacion explicita del autor sobre vLLM o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de contexto, licencia ni benchmarks de los modelos alternativos dentro de la informacion proporcionada, por lo que la comparacion se limita a lo documentado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---:|---|---|---|
| tanpo-hiring | 1,17 B | No disponible | `other` (sin detalle) | HuggingFace: safetensors, GGUF y LoRA |
| unsloth/LFM2.5-1.2B-Instruct (base) | No disponible | No disponible | No disponible | HuggingFace |
| Modelos instructivos generalistas del rango 1-2B (por ejemplo familias Qwen o Gemma) | No disponible | No disponible | No disponible | No disponible |

La unica comparacion cuantitativa publicada es contra el modelo base: 92,9 % frente a 83,8 % de rubrica global y 7,18 frente a 6,40 en calidad heuristica.

## Limitaciones y advertencias

- Ambito deliberadamente restringido: el autor indica que para consultas legales, medicas, financieras o no relacionadas hay que usar un especialista apropiado.
- Riesgo de alucinacion: es un modelo de 1,2B afinado para generar contenido plausible; puede inventar criterios, marcos legales laborales o practicas de seleccion no verificadas. Toda decision de contratacion debe validarse con profesionales cualificados.
- Sesgos: no se documenta ninguna evaluacion de sesgo ni de equidad. En un dominio como el reclutamiento, esto es un riesgo relevante, ya que el modelo puede reproducir sesgos de genero, edad, origen o titulacion presentes en los datos de ajuste.
- Evaluacion no independiente: la rubrica de 20 tareas la define el propio autor y la model card reconoce que los resultados automatizados son direccionales. No hay validacion por terceros ni benchmarks estandar.
- Idiomas: no se declaran idiomas soportados. La model card esta en ingles y los ejemplos son en ingles; no hay evidencia de buen rendimiento en castellano.
- Licencia: marcada como `other`, sin texto de licencia detallado en la informacion disponible. Antes de un uso comercial es imprescindible revisar la licencia del repositorio y la del modelo base LFM2.5 de Liquid AI.
- Madurez: el repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, y fue creado y actualizado con pocos minutos de diferencia, lo que sugiere un artefacto sin rodaje ni comunidad.
- Sin soporte documentado de tool calling ni de uso agentico, por lo que no conviene integrarlo en flujos automaticos que dependan de llamadas a funciones.
- Cumplimiento normativo: en la UE, cualquier uso en seleccion de personal entra en el ambito de sistemas de alto riesgo segun el Reglamento de IA; se requiere supervision humana y evaluacion de impacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d4rkninja/tanpo-hiring
- Version GGUF: https://huggingface.co/d4rkninja/tanpo-hiring-GGUF
- Adaptador LoRA: https://huggingface.co/d4rkninja/tanpo-hiring-LoRA
- Modelo base: https://huggingface.co/unsloth/LFM2.5-1.2B-Instruct

La busqueda web realizada no devolvio ningun resultado relacionado con este modelo: los enlaces obtenidos correspondian a un parque de atracciones en Raleigh, Carolina del Norte, y no guardan relacion con el contenido de esta ficha, por lo que se han descartado.
